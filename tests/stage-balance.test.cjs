'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js');
const T = require('../tools/balance/tune-stage-balance.cjs');
const S = require('../public/js/combat/forest-simulation.js');
const A = require('../tools/balance/audit-balance.cjs');
const before = require('./fixtures/stage-encounters-before-tuning.json');
const beforeExpansion = require('./fixtures/encounters-before-wave-expansion.json');
const counts = waves => waves.flat().reduce((result, id) => { result[id] = (result[id] || 0) + 1; return result; }, {});

test('region 1/5 encounters retain HP, damage and clear rewards', () => {
  assert.equal(before.protected.length, 8);
  for (const original of before.protected) {
    const stage = D.STAGES[original.id - 1];
    assert.equal(D.STAGE_TUNING[stage.id], undefined);
    for (const key of ['enemyHp', 'enemyDamage', 'reward']) assert.deepEqual(stage[key], original[key], `${stage.id}: ${key}`);
  }
});

test('encounter changes preserve species totals and reward budgets except the early forest 3 relief', () => {
  assert.deepEqual(counts(D.STAGES[2].waves), { boar: 8, 'boss-boar': 1 });
  assert.equal(before.encounters.length, 31);
  for (const original of before.encounters) {
    const stage = D.STAGES[original.id - 1];
    assert.deepEqual(counts(stage.waves), original.counts, `stage ${stage.id}: material/gold budget`);
    assert.equal(stage.reward, original.reward);
    assert.equal(stage.waves.at(-1).length, 1, `stage ${stage.id}: isolated final boss`);
    assert.ok(D.ENEMIES[stage.waves.at(-1)[0]].boss);
  }
});

test('all regions have valid waves within their regional limit and consistent selection metadata', () => {
  assert.equal(Object.keys(D.STAGE_TUNING).filter(id=>Number(id)<=40).length, 32);
  for (const stage of D.STAGES) {
    if (stage.region <= 4) assert.equal(!!D.STAGE_TUNING[stage.id], ![1, 5].includes(stage.number));
    const limit = stage.region <= 2 ? 3 : stage.region >= 5 ? 5 : 4;
    assert.ok(stage.waves.length >= 3 && stage.waves.length <= limit, `stage ${stage.id}: regional wave limit`);
    if (D.STAGE_TUNING[stage.id]?.waveCount) assert.equal(stage.waves.length, D.STAGE_TUNING[stage.id].waveCount);
    assert.ok(stage.waves.every(wave => wave.length > 0 && wave.length <= 24));
    assert.ok(stage.waves.flat().every(id => D.ENEMIES[id]));
    assert.equal(stage.total, stage.waves.flat().length);
    assert.deepEqual(stage.enemies, [...new Set(stage.waves.flat())]);
  }
});

test('historical wave expansion preserves unaffected routes and easy-route stats', () => {
  for (const original of beforeExpansion) {
    const stage = D.STAGES[original.id - 1];
    const easy = [1, 5].includes(stage.number);
    if (stage.id <= 20 || easy) {
      for (const key of ['enemyHp', 'enemyDamage', 'reward', ...(!easy ? ['waves'] : [])]) assert.deepEqual(stage[key], original[key], `${stage.id}: ${key}`);
    }
    if (!easy) assert.deepEqual(counts(stage.waves), counts(original.waves), `stage ${stage.id}: species budget`);
    assert.equal(stage.reward, original.reward);
  }
});

test('four/five-wave finales spawn their configured stats and award victory only once after the final wave', () => {
  for (const stageId of [30, 40, 50]) {
    const run = S.createRun(stageId, { builds: A.referenceBuild(stageId).builds, random: () => .5 });
    for (const actor of [run.hero, ...run.allies]) Object.assign(actor, { manualOnly: true, maxHp: 1e12, hp: 1e12, crit: 0 });
    const events = [];
    for (let wave = 0; wave < run.stage.waves.length; wave++) {
      assert.equal(run.wave, wave);
      assert.equal(run.status, 'running');
      for (const enemy of run.enemies) {
        const base = D.ENEMIES[enemy.type], factor = 1 + (run.stage.number - 1) * .1;
        assert.equal(enemy.maxHp, Math.round(base.hp * factor * run.stage.enemyHp * (base.majorBoss ? run.stage.majorBossHp ?? 1 : 1)));
        assert.equal(enemy.damage, Math.round(base.damage * factor * run.stage.enemyDamage * (base.majorBoss ? run.stage.majorBossDamage ?? 1 : 1)));
        if (base.majorBoss && run.stage.majorBossDefense !== undefined) assert.equal(enemy.defense, run.stage.majorBossDefense);
        S.hit(run, run.hero, enemy, 1e12, events);
      }
      events.push(...S.update(run, 1700));
    }
    assert.equal(run.status, 'victory');
    assert.equal(run.kills, run.stage.total);
    assert.equal(events.filter(e => e.type === 'finished').length, 1);
    assert.deepEqual(events.filter(e => e.type === 'wave').map(e => e.wave), Array.from({ length: run.stage.waves.length - 1 }, (_, i) => i + 2));
    assert.deepEqual(S.update(run, 10000), []);
  }
});

const verification = [];
const profiles=Object.fromEntries(Object.entries(D.STAGE_TUNING).filter(([id])=>!([1,5].includes(D.STAGES[Number(id)-1].number))));
test.after(() => {
  // Reuse these actual battles for the report instead of simulating them twice.
  if (verification.length === Object.keys(profiles).length) T.writeVerification(verification, 30);
});
for (const [id, profile] of Object.entries(profiles)) {
  test(`stage ${id}: 30 layouts check reference, first clear, stale gear and major-boss difficulty`, () => {
    const row = T.assess(Number(id), profile, Array.from({ length: 30 }, (_, i) => i));
    row.failures = T.failuresFor(row, 30);
    verification.push(row);
    assert.deepEqual(row.failures, [], JSON.stringify({ stage: id, reference: row.reference.wins,
      first: row.first.wins, stale: row.stale?.wins, seconds: row.reference.seconds,
      allAlive: row.reference.intact, peakHit: row.reference.peakHit, underFive: row.underFive?.wins }));
  });
}
