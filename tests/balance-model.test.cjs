'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const B = require('../tools/balance/balance-model.cjs'), A = require('../tools/balance/audit-balance.cjs');
const P = require('../public/js/core/forest-progression.js');
const close = (a, b) => assert.ok(Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test('reference wins a long fight, initial clear is possible, ten missing mains lose at 201 checkpoints', () => {
  const report = A.formulaAudit(B.config());
  assert.equal(report.count, 201);
  assert.deepEqual(report.failures, []);
  assert.equal(report.cases[0].reference.clearSeconds, 60);
  close(report.cases[0].reference.remainingHp, 25 / 85);
  assert.ok(report.cases[0].firstClear.remainingHp > 0);
  const stale = report.cases.find(row => row.stage === 40).stale;
  assert.ok(stale.offenseRatio < .2 && stale.survivalSeconds < 20);
});
test('all old nodes plus even the infinite-region optional bound cannot skip twenty stages', () => {
  const cap = B.optionalCeiling();
  assert.ok(cap < 4);
  for (const s of [1, 10, 20, 40, 200, 100000]) {
    const old = B.encounter(s + 20, { gearStage: s, fullExtrasThrough: s, gemCeiling: true });
    const worst = B.encounter(s + 20, { gearStage: s, offenseMultiplier: cap, toughnessMultiplier: cap });
    assert.ok(!old.victory && !worst.victory);
    assert.ok(old.offenseRatio <= worst.offenseRatio);
  }
});
test('audit detects parameter changes that destroy the optional-growth restriction', () => {
  assert.ok(A.formulaAudit(B.config({ gemAxisCap: 100 })).failures.some(n => n.criterion === 'infiniteOptional20'));
  assert.ok(A.formulaAudit(B.config({ survivalSeconds: 75 })).failures.some(n => n.criterion === 'firstClear'));
});
test('node strength is 1–3% at its next frontier and decays as additive old gear', () => {
  for (const epsilon of [.01, .015, .02, .03]) {
    close(B.nodeRatio(9, 10, epsilon), epsilon);
    close(B.nodeRatio(9, 20, epsilon) / B.nodeRatio(19, 20, epsilon), B.gearRatio(10, 20));
  }
  close(Math.exp(B.logMainGain(40) - B.logMainGain(10)), B.gearGrowth(B.DEFAULTS) ** 30);
  // Verify the closed-form optional bound against an explicit tree inventory.
  for (const s of [1, 9, 10, 11, 40]) {
    let sum = 0;
    for (let n = 1; n <= s; n++) {
      for (const rate of B.DEFAULTS.sideRates) sum += 2 * B.nodeRatio(n, s, rate);
      if (n % 10 === 0) {
        sum += B.nodeRatio(n, s, B.DEFAULTS.crownRootRate);
        for (const rate of B.DEFAULTS.crownRates) sum += 3 * B.nodeRatio(n, s, rate);
      }
    }
    close(B.fullExtrasRatio(s, s), sum);
  }
});
test('huge-stage comparisons do not construct overflowing absolute power values', () => {
  close(B.gearRatio(99990, 100000), B.gearRatio(30, 40));
  assert.ok(Number.isFinite(B.logPower(100000)));
  assert.ok(Number.isFinite(B.fullExtrasRatio(100000, 100000)));
  close(B.gearRatio(0, 100000), 0);
});
test('damage preserves mitigation across enormous ranges without a fixed defense scale', () => {
  close(B.damage(100, 100), 50);
  close(B.damage(100, 0, 2), 200);
  for (const scale of [1e-100, 1, 1e100, 1e300]) {
    close(B.damageMultiplier(100 * scale, 80 * scale), 100 / 180);
    close(B.damage(100 * scale, 80 * scale) / scale, 10000 / 180);
  }
  assert.ok(Number.isFinite(B.damage(1e308, 1e308)));
  assert.ok(B.damage(100, 80, 2) > B.damage(100, 80, 1));
  assert.ok(B.damage(100, 100) < B.damage(100, 80));
});
test('safe range, area, penetration and control each reduce the offensive budget', () => {
  const base = { unlockLevel: 20, cooldownSeconds: 10 };
  const melee = B.skillPower(base);
  for (const tag of ['ranged', 'area', 'piercing', 'control']) assert.ok(B.skillPower({ ...base, [tag]: true }) < melee);
  assert.ok(B.skillPower({ ...base, expectedTargets: 3 }) < melee);
  assert.ok(B.skillPower({ ...base, unlockLevel: 25 }) / 10 > melee / 10);
  // The net contribution after lost normal attacks equals the intended budget.
  const power = B.skillPower({ ...base, hits: 2, normalDps: 1, actionSeconds: 1.5 });
  close((power * 2 - 1.5) / 10, B.skillBudget(20));
});
test('gems have diminishing returns on the combined final axis, regardless of capacity', () => {
  assert.equal(B.gemMultiplier(0), 1);
  assert.ok(B.gemMultiplier(1000) < 1.5);
  assert.ok(B.gemMultiplier(2) - B.gemMultiplier(1) < B.gemMultiplier(1) - B.gemMultiplier(0));
});
test('reference builds respect before-clear recruits and identical skills when only gear lags', () => {
  assert.deepEqual(Object.keys(A.referenceBuild(4).builds), ['warrior']);
  assert.deepEqual(Object.keys(A.referenceBuild(5).builds), ['warrior', 'mage']);
  assert.deepEqual(Object.keys(A.referenceBuild(10).builds), ['warrior', 'mage']);
  assert.deepEqual(Object.keys(A.referenceBuild(11).builds), ['warrior', 'mage', 'paladin']);
  const fresh = A.referenceBuild(30), stale = A.referenceBuild(30, 20);
  assert.deepEqual(fresh.ranks, stale.ranks);
  for (const id of Object.keys(fresh.builds)) {
    const c=fresh.save.progression.characters[id];
    assert.equal(P.level(c.xp), 30);
    assert.equal(c.weapon.length, 30); assert.equal(c.armor.length, 30);
    assert.equal(stale.save.progression.characters[id].weapon.length, 20);
    assert.ok(Object.keys(c.skillRanks).every(nodeId => P.SKILLS[id].find(n => n.id === nodeId).kind === 'active'));
    assert.ok(Object.values(c.skillRanks).every(rank=>rank===5));
    assert.equal(c.gems.weapon.length, 0);
  }
});
test('chain skill diagnostics count one hit per unique target rather than four hits to one', () => {
  const row = A.skillAudit().find(n => n.character === 'mage' && n.id === 'chain' && n.rank === 1);
  close(row.singleDamage, 3.4);
});
test('invalid model inputs fail before producing a plausible report', () => {
  assert.throws(() => B.config({ stageGrowth: 1.01 }), RangeError);
  assert.throws(() => B.config({ survivalSeconds: 59 }), RangeError);
  assert.throws(() => B.config({ sideRates: [.01, .015, .02, .04] }), RangeError);
  assert.throws(() => B.encounter(30, { gearStage: 10, fullExtrasThrough: 11 }), RangeError);
  assert.throws(() => B.damage(100, -1), RangeError);
  assert.throws(() => B.gemMultiplier(-1), RangeError);
  assert.throws(() => B.skillPower({ unlockLevel: 5, cooldownSeconds: 2, actionSeconds: 3 }), RangeError);
});
