'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const D = require('../public/js/data/forest-data.js');
const S = require('../public/js/combat/forest-simulation.js');
const T = require('../tools/balance/tune-stage-balance.cjs');
const A = require('../tools/balance/audit-balance.cjs');
const families = [
  ['slime', 'boar', 'alraune-minion'],
  ['giga-toad', 'mud-hand', 'skeleton'],
  ['cave-bat', 'cave-worm', 'cave-spider'],
  ['hermit-crab', 'lizardman', 'octopus'],
  ['stone-guard', 'ancient-crossbowman', 'floating-magic-core'],
  ['sand-scorpion', 'bandage-soldier', 'sand-snake'],
  ['horn-jackal', 'rock-horn-goat', 'wind-sprite'],
  ['frost-wolf', 'ice-shell-golem', 'snow-spirit'],
  ['lava-salamander', 'obsidian-soldier', 'young-fire-dragon'],
  ['demon-armored-soldier', 'imp', 'dream-demon'],
];
const routes = D.STAGES.filter(s => [1, 5].includes(s.number));
const counts = ids => ids.reduce((out, id) => { out[id] = (out[id] || 0) + 1; return out; }, {});

test('all ten regions have small ABC entrances and large, equally split ABC farming routes', () => {
  assert.equal(routes.length, 20);
  for (const stage of routes) {
    const species = families[stage.region - 1];
    const perWave = stage.number === 1 ? 1 : stage.region <= 4 ? 4 : 5;
    assert.equal(stage.waves.length, 3);
    for (const wave of stage.waves) {
      assert.deepEqual(counts(wave), Object.fromEntries(species.map(id => [id, perWave])), D.stageLabel(stage.id));
    }
    assert.deepEqual(stage.enemies, species);
    assert.equal(stage.total, perWave * 9);
    const drops = stage.waves.flat().flatMap(id => {
      assert.ok(!D.ENEMIES[id].boss);
      assert.equal(D.ENEMIES[id].region ?? 1, stage.region);
      return D.rollMaterials(id, () => .2999);
    });
    assert.equal(Object.keys(counts(drops)).length, 3);
    assert.deepEqual(Object.values(counts(drops)), [perWave * 3, perWave * 3, perWave * 3]);
  }
});

test('mixed routes spawn every configured wave and grant victory only after all enemies die', () => {
  for (const stage of routes) {
    const run = S.createRun(stage.id, { random: () => .5 });
    for (const actor of [run.hero, ...run.allies]) Object.assign(actor, { manualOnly: true, maxHp: 1e12, hp: 1e12 });
    const events = [];
    for (const [wave, species] of stage.waves.entries()) {
      assert.equal(run.wave, wave);
      assert.equal(run.status, 'running');
      assert.deepEqual(counts(run.enemies.map(e => e.type)), counts(species));
      for (const enemy of run.enemies) S.hit(run, run.hero, enemy, 1e12, events);
      events.push(...S.update(run, 1700));
    }
    assert.equal(run.status, 'victory');
    assert.equal(run.kills, stage.total);
    assert.equal(events.filter(e => e.type === 'finished').length, 1);
    assert.deepEqual(events.filter(e => e.type === 'wave').map(e => e.wave), [2, 3]);
  }
});

const verification = [];
for (const stage of routes) {
  const count = stage.region === 1 ? 30 : 3;
  test('easy route ' + D.stageLabel(stage.id) + ': reference and prior-main builds win ' + count + ' layouts', () => {
    const seeds = Array.from({ length: count }, (_, i) => i);
    const profile = D.STAGE_TUNING[stage.id] ?? {};
    const reference = T.evaluate(stage.id, profile, 0, seeds);
    const first = T.evaluate(stage.id, profile, 1, seeds);
    verification.push({ stage: stage.id, count, reference, first });
    for (const [name, result] of Object.entries({ reference, first })) {
      const context = JSON.stringify({ stage: stage.id, name, result });
      assert.equal(result.wins, count, context);
      assert.ok(result.seconds <= 90, context);
      assert.ok(result.peakHit <= .51, context);
    }
    if (stage.id === 1) {
      const fresh = D.freshSave();
      const P = require('../public/js/core/forest-progression.js');
      assert.deepEqual(A.referenceBuild(1, 0).builds.warrior, P.stats(fresh, 'warrior'));
    }
  });
}

test.after(() => {
  if (verification.length !== routes.length) return;
  const directory = path.resolve(__dirname, '../output/balance');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'easy-stage-routes.json'), JSON.stringify(verification, null, 2) + '\n');
});
