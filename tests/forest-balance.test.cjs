'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js'), S = require('../public/js/combat/forest-simulation.js');
const seeded = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
function expectedDrops(stage) {
  const counts = { jelly: 0, tusk: 0, flower: 0, crystal: 0, wood: 0, gold: stage.reward };
  const common = { slime: 'jelly', 'boss-slime': 'jelly', boar: 'tusk', 'boss-boar': 'tusk', 'alraune-minion': 'flower', alraune: 'flower', treant: 'flower' };
  for (const type of stage.waves.flat()) {
    const enemy = D.ENEMIES[type]; counts[common[type]] += enemy.boss ? 1 : .3; counts.gold += enemy.gold;
    if (enemy.boss) counts.crystal += type === 'treant' ? 1 : .3;
    if (type === 'treant') counts.wood += .3;
  }
  return counts;
}
function baseline(stage) {
  return require('../tools/balance/audit-balance.cjs').referenceBuild(stage, stage - 1).builds;
}

test('forest 10 needs 1, 3, 9, 27, 81 and 243 clears for successive levels, with exact carry', () => {
  const save = D.freshSave(), c = save.progression.characters.warrior;
  for (let target = 10; target <= 15; target++) {
    c.xp = P.experience(target - 1); const runs = 3 ** (target - 10);
    for (let i = 1; i < runs; i++) { P.gainXp(save, 10); assert.equal(P.level(c.xp), target - 1); }
    P.gainXp(save, 10); assert.deepEqual(c.xp, P.experience(target));
  }
  c.xp = P.experience(9, .6); P.gainXp(save, 10);
  assert.equal(c.xp.level, 10); assert.ok(Math.abs(c.xp.progress - .2) < 1e-12);
});

test('normalized XP stops at level100 without large powers and discards gains at 3^-20', () => {
  const save = D.freshSave(), c = save.progression.characters.warrior;
  c.xp = P.experience(100); for (let i = 0; i < 3; i++) P.gainXp(save, 1000);
  assert.deepEqual(c.xp, P.experience(100));
  c.xp = P.experience(); P.gainXp(save, 1000);
  assert.equal(c.xp.level, 100);assert.equal(c.xp.progress, 0); assert.ok(Number.isFinite(c.xp.progress) && c.xp.progress >= 0 && c.xp.progress < 1);
  c.xp = P.experience(29); const before = structuredClone(c.xp); P.gainXp(save, 10);
  assert.deepEqual(c.xp, before);
  c.xp = P.experience(28); P.gainXp(save, 10); assert.ok(c.xp.progress > 0);
  assert.match(P.xpPercent(c.xp), /^\d+\.\d{2}%$/);
});

test('material and gem drop boundaries enforce the requested absolute probabilities', () => {
  assert.deepEqual(D.rollMaterials('slime', () => .2999), ['jelly']);
  assert.deepEqual(D.rollMaterials('slime', () => .3), []);
  assert.deepEqual(D.rollMaterials('boss-slime', () => .3), ['jelly']);
  assert.deepEqual(D.rollMaterials('boss-boar', () => .2999), ['tusk', 'crystal']);
  assert.deepEqual(D.rollMaterials('treant', () => .3), ['flower', 'crystal']);
  assert.deepEqual(D.rollMaterials('treant', () => .2999), ['flower', 'crystal', 'wood']);
  assert.equal((D.rollGems('slime', () => 0)[0] ?? null), null);
  for (const boss of ['boss-slime', 'boss-boar', 'alraune', 'treant']) {
    const roll = chance => { const values = [chance, 0]; return (D.rollGems(boss, () => values.shift() ?? .5)[0] ?? null); };
    assert.equal(roll(.004999).rarity, 'unique');
    assert.equal(roll(.005).rarity, 'rare');
    assert.equal(roll(.054999).rarity, 'rare');
    assert.equal(roll(.055), null);
  }
});

test('each gear tree has 10 main, 80 side, 10 end nodes, ten milestones and a 300-clear completion budget', () => {
  for (const id of Object.keys(P.CHARACTERS)) for (const slot of ['weapon', 'armor']) {
    const nodes = P.gearTree(id, slot), costs = {};
    assert.equal(nodes.length, 100); assert.equal(new Set(nodes.map(n => n.id)).size, 100);
    assert.equal(nodes.filter(n => n.main).length, 10); assert.equal(nodes.filter(n => n.id.startsWith('branch-')).length, 80);
    assert.equal(nodes.filter(n => n.id.startsWith('crown')).length, 10);
    for (const n of nodes) { assert.ok(n.requires.every(req => nodes.some(p => p.id === req))); for (const [item, count] of Object.entries(n.cost)) costs[item] = (costs[item] || 0) + count; }
    const drops = expectedDrops(D.STAGES[9]);
    const clears = Math.max(...Object.entries(costs).map(([item, count]) => count / drops[item]));
    assert.ok(clears >= 290 && clears <= 310, JSON.stringify({ costs, clears }));
    for (const n of nodes.filter(n => n.main)) {
      const stageDrops = expectedDrops(D.STAGES[n.stage - 1]);
      assert.ok(Object.entries(n.cost).every(([item, cost]) => 2 * cost / stageDrops[item] <= 3), 'weapon and armor main nodes within three average clears');
    }
    const bonuses = P.gearBonuses(id, slot); assert.deepEqual(bonuses.map(b => b.count), [10,20,30,40,50,60,70,80,90,100]);
    assert.deepEqual(bonuses.at(-1).effect, { commonCapacity: 50 });
  }
});

test('all regional main paths require the same three-family combinations and finish with regional crystal', () => {
  const families = [
    ['jelly','tusk','flower','crystal'],
    ['venom-sac','living-mud','cursed-bone','swamp-crystal'],
    ['bat-fang','worm-shell','spider-silk','cave-crystal'],
    ['crab-shell','lizard-scale','octopus-ink','coast-crystal'],
  ];
  const pattern = [[],[0],[1],[2],[0,1,2],[0,1],[0,2],[1,2],[0,1,2],[3]];
  for (const [index, materials] of families.entries()) for (const id of Object.keys(P.CHARACTERS)) for (const slot of ['weapon','armor']) {
    const mains = P.gearTree(id, slot, index + 1).filter(n => n.main);
    mains.forEach((node, step) => {
      assert.deepEqual(Object.keys(node.cost).filter(k => k !== 'gold'), pattern[step].map(i => materials[i]));
      assert.ok(Object.values(node.cost).every(v => Number.isSafeInteger(v) && v > 0));
    });
    for (const material of materials.slice(0, 3)) assert.equal(mains[4].cost[material] * 2, mains[8].cost[material]);
    const tree = P.gearTree(id, slot, index + 1);
    for (const node of tree.filter(n => n.depth && !n.unique)) {
      const step = (node.stage - 1) % 10;
      assert.deepEqual(Object.keys(node.cost).filter(k => k !== 'gold'), (step === 0 ? [3] : pattern[step]).map(i => materials[i]));
      if (step === 0) assert.equal(node.cost[materials[3]], [1,2,4,8][node.depth - 1]);
      if (step === 4) {
        const later = tree.find(n => n.id.endsWith(node.id.replace(/^(?:swamp-|cave-|coast-)?branch-5-/, 'branch-9-')));
        for (const material of materials.slice(0, 3)) {
          assert.equal(node.cost[material], [1,2,4,8][node.depth - 1]);
          assert.ok(node.cost[material] <= later.cost[material]);
          if (node.depth > 1) assert.ok(node.cost[material] < later.cost[material]);
        }
      }
    }
    const unique = tree.filter(n => n.unique), root = unique.find(n => !n.depth);
    assert.deepEqual(materials.slice(0, 3).map(k => root.cost[k]), [15,15,15]);
    const totals = nodes => materials.slice(0, 3).map(k => nodes.reduce((sum, n) => sum + (n.cost[k] || 0), 0));
    for (const nodes of [unique, tree]) {
      const amounts = totals(nodes);
      assert.equal(new Set(amounts).size, 1, JSON.stringify({region:index+1, amounts}));
    }
    for (let lane = 1; lane <= 3; lane++) {
      const branch = unique.filter(n => new RegExp('(?:^|-)crown-' + lane + '-[1-3]$').test(n.id));
      assert.equal(branch.length, 3);
      for (const node of branch) {
        const heavy = node.cost[materials[lane - 1]];
        assert.ok(materials.slice(0, 3).every((k, i) => i === lane - 1 || node.cost[k] < heavy));
      }
    }
  }
});

test('auto modes advance after wins, stay at the final stage, and retreat then farm after defeats', () => {
  const save = D.freshSave(); D.award(save, 1);
  save.autoMode = 'same'; assert.deepEqual(D.autoDestination(save, 1, true), { stage: 1, mode: 'same' });
  save.autoMode = 'advance'; assert.deepEqual(D.autoDestination(save, 1, true), { stage: 2, mode: 'advance' });
  assert.deepEqual(D.autoDestination(save, 10, true), { stage: 10, mode: 'advance' });
  assert.deepEqual(D.autoDestination(save, 4, false), { stage: 3, mode: 'same' });
  assert.deepEqual(D.autoDestination(save, 1, false), { stage: 1, mode: 'same' });
  save.autoMode = 'off'; assert.equal(D.autoDestination(save, 4, false), null);
});

test('every forest stage clears at its intended level using top-first actives and prior main nodes, without branches or gems', () => {
  for (let stage = 1; stage <= 10; stage++) {
    const builds = baseline(stage);
    for (let seed = 0; seed < 30; seed++) {
      const run = S.createRun(stage, { builds, random: seeded(seed) });
      for (let time = 0; time < 180000 && run.status === 'running'; time += 100) S.update(run, 100);
      assert.equal(run.status, 'victory', 'stage ' + stage + ', seed ' + seed);
    }
  }
});

test('older save versions reset instead of migrating', () => {
  const old = D.freshSave(); old.version = 1; old.gold = 99999;
  assert.deepEqual(D.readSave(JSON.stringify(old)), D.freshSave());
});
