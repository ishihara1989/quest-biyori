'use strict';

const { writeAssetJson } = require('../lib/project-paths.cjs');
// Offline arithmetic for docs/design/gem-system-design.md. Does not alter game data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const P = require('../../public/js/core/forest-progression.js');
const D = require('../../public/js/data/forest-data.js');

const unitGain = 0.08;
const quality = { min: 0.95, max: 1.05 };
const tiers = [
  { id: 'rare', units: 1, capacity: 200, probability: 0.05 },
  { id: 'unique', units: 2 * 1.15, capacity: 340, probability: 0.005 },
  { id: 'legendary', units: 2 * 2 * 1.15 * 1.12, capacity: 580, probability: 0.0005 },
];
const salvage = level => 10 * level;
const upgrade = (from, to, growthShare = 1, size = 1) => Math.ceil(
  3 * Array.from({ length: to - from }, (_, i) => salvage(from + i + 1)).reduce((a, b) => a + b, 0)
  * Math.max(0.35, growthShare) * size);
const cost = (base, discounts) => Math.ceil(base * Math.max(0.6, discounts.reduce((a, b) => a * (1 - b), 1)));
const recipe = (level, tier = 0, lowerShare = 0, size = 1) => {
  const budget = 10 * salvage(level) * size;
  const effectiveRate = tiers.slice(0, tier + 1).reduce((sum, lower, j) => sum + lower.probability / 10 ** (tier - j), 0);
  const flowRuns = budget / (salvage(level) * 4 * effectiveRate);
  const materialRuns = Math.min(100, flowRuns * 0.5);
  return { own: Math.ceil(budget * (1 - lowerShare)), lower: Math.ceil(budget * lowerShare * 10),
    regionalRare: Math.ceil(materialRuns * 0.3 / 5) * 5 };
};
const rng = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };

assert.equal(cost(200, [0.1]), 180);
assert.equal(cost(200, [0.1, 0.1]), 162);
assert.equal(cost(200, Array(100).fill(0.1)), 120);
for (let i = 1; i < tiers.length; i++) {
  assert.ok(tiers[i].units * quality.min > 2 * tiers[i - 1].units * quality.max);
  assert.ok(tiers[i].capacity < 2 * tiers[i - 1].capacity);
}

// Check full and small gems, multi-level upgrades, partial growth, and rounding.
let economyChecks = 0;
for (let from = 1; from <= 25; from++) for (let to = from + 1; to <= 30; to++) {
  for (const size of [0.25, 0.5, 1]) for (const growthShare of [0.01, 0.35, 0.6, 1]) {
    const gain = Math.floor(salvage(to) * size) - Math.floor(salvage(from) * size);
    assert.ok(upgrade(from, to, growthShare, size) > gain);
    economyChecks++;
  }
}
for (let level = 1; level <= 30; level++) for (const share of [0, 0.1, 0.2, 0.4])
  for (const size of [0.25, 0.5, 1]) {
    const r = recipe(level, 1, share, size);
    assert.ok(r.own + r.lower / 10 >= 10 * salvage(level) * size);
    assert.ok(r.own + r.lower / 10 > Math.floor(salvage(level) * size));
    economyChecks++;
  }

const regions = [];
for (let level = 1; level <= 6; level++) {
  const stage = D.STAGES.find(s => s.id === level * 10);
  const bossIds = stage.waves.flat().filter(id => D.ENEMIES[id].boss);
  const crystals = bossIds.reduce((sum, id) => sum + (id === 'treant' || D.ENEMIES[id].majorBoss ? 1 : 0.3), 0);
  const save = D.freshSave();
  save.cleared = Array.from({ length: stage.id }, (_, i) => i + 1);
  const c = save.progression.characters.warrior;
  c.xp = P.experience(stage.id);
  for (const slot of ['weapon', 'armor']) c[slot] = P.allGearTrees('warrior', slot).filter(n => n.main && n.stage <= stage.id).map(n => n.id);
  const reference = P.stats(save, 'warrior');
  const sample = {
    attack: Math.round(reference.baseDamage * unitGain),
    maxHp: Math.round(reference.maxHp * unitGain),
    defense: Number(((80 + reference.defense) * unitGain).toFixed(1)),
  };
  assert.equal(bossIds.length, 4);
  assert.ok(Math.abs(crystals - 1.9) < 1e-9);
  // The current K=80 defense formula yields the target EHP gain before rounding.
  const defenseDelta = (80 + reference.defense) * unitGain;
  assert.ok(Math.abs((80 + reference.defense + defenseDelta) / (80 + reference.defense) - 1.08) < 1e-10);
  regions.push({ gemLevel: level, stage: stage.id, bosses: bossIds.length, crystalsPerRun: Number(crystals.toFixed(2)),
    regionalRarePerRun: 0.3, reference: { attack: reference.baseDamage, maxHp: reference.maxHp, defense: reference.defense }, sample });
}

const dropWaits = tiers.map((tier, i) => {
  const p = tier.probability;
  const effectiveRate = tiers.slice(0, i + 1).reduce((sum, lower, j) => sum + lower.probability / 10 ** (i - j), 0);
  return { rarity: tier.id, probabilityPerBoss: p, bossEquivalentMeanRuns: 1 / (4 * p),
    exactFirstDropMeanRuns: 1 / (1 - (1 - p) ** 4),
    atLeastOne95PercentRuns: Math.ceil(Math.log(0.05) / (4 * Math.log(1 - p))),
    tenOwnDropsMeanRuns: 10 / (4 * p),
    allLowerConvertedFlowRuns: 10 / (4 * effectiveRate) };
});

// Complete-run Monte Carlo includes discrete currencies and regional rare materials.
// All drops are dismantled, none equipped. This is a material economy scenario,
// not a battle simulation or a guarantee of in-game acquisition time.
const trials = 2000;
function craftTrials(target, lowerShare, convert, seedOffset) {
  const r = recipe(6, target, lowerShare);
  const samples = [];
  for (let seed = 1; seed <= trials; seed++) {
    const random = rng(seed + seedOffset);
    const bank = [0, 0, 0];
    let materials = 0, runs = 0;
    const ready = () => {
      if (materials < r.regionalRare) return false;
      if (!target) return bank[0] >= r.own;
      let lower = bank[target - 1];
      if (convert && target === 2) lower += Math.floor(bank[0] / 10);
      if (lower < r.lower) return false;
      const own = bank[target] + (convert ? Math.floor((lower - r.lower) / 10) : 0);
      return own >= r.own;
    };
    while (!ready()) {
      if (++runs > 100000) throw new Error('Trial limit exceeded');
      for (let boss = 0; boss < 4; boss++) {
        const roll = random();
        if (roll < 0.0005) bank[2] += salvage(6);
        else if (roll < 0.0055) bank[1] += salvage(6);
        else if (roll < 0.0555) bank[0] += salvage(6);
      }
      if (random() < 0.3) materials++;
    }
    samples.push(runs);
  }
  samples.sort((a, b) => a - b);
  return { rarity: tiers[target].id, recipe: r, lowerConversion: convert, trials,
    meanRuns: Number((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1)),
    medianRuns: samples[Math.floor(samples.length / 2)], p95Runs: samples[Math.ceil(samples.length * 0.95) - 1] };
}
const crafting = [
  craftTrials(0, 0, false, 10),
  craftTrials(1, 0.4, false, 10000),
  craftTrials(1, 0.4, true, 20000),
  craftTrials(2, 0.4, false, 30000),
  craftTrials(2, 0.4, true, 40000),
  // Example: legendary signature spends 2 of 5.152 units, other units grow by level.
  craftTrials(2, 0.4 * (1 - 2 / tiers[2].units), true, 50000),
];
const report = { proposalOnly: true, generatedFrom: 'current working tree', unitGain, quality, tiers,
  regions, dropWaits, recipesAtLevel6: tiers.map((tier, i) => ({ rarity: tier.id, ...recipe(6, i, i ? 0.4 : 0) })),
  upgrades: { rare1to2: { shards: upgrade(1, 2), crystal: 40 }, standard5to6: { shards: upgrade(5, 6), crystal: 40 } },
  crafting, economyChecks,
  limitations: [
    'No generated affix catalog or battle balance is validated by this audit.',
    'Salvage uses initial 10L values; farming-time correction is not measured.',
    'Four bosses per run and one regional rare roll at 30%; no summoned bosses.',
    'All gem drops dismantled, no initial currency, no treasure-hunt bonus.',
    'Epic probability and signature powers remain unspecified.',
  ] };
const output = path.resolve(__dirname, '../../output/balance/gem-design-audit.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
writeAssetJson(output, report);
console.log(JSON.stringify({ output, economyChecks, regions: regions.length, dropWaits, crafting }, null, 2));
