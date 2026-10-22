'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), R = require('../public/js/core/reincarnation.js'), L = require('../public/js/core/forest-loot.js');
const defaults = { skip: false, delay: 5 };
function seed() {
  const s = D.freshSave(); Object.assign(s.reincarnation, { discovered: true, unlocked: true, cycle: 1, total: 100 }); return s;
}
test('result options unlock only after executing the first rebirth, including existing post-rebirth saves', () => {
  const s = D.freshSave(); s.reincarnation.resultOptions = { skip: true, delay: .5 };
  assert.equal(R.resultOptionsUnlocked(s), false); assert.deepEqual(R.resultOptions(s), defaults);
  Object.assign(s.reincarnation, { discovered: true, unlocked: true, defeatedCycle: 0 });
  assert.equal(R.resultOptionsUnlocked(s), false); assert.deepEqual(R.resultOptions(s), defaults);
  const next = R.prepare(s, D.freshSave);
  assert.equal(next.reincarnation.cycle, 1); assert.equal(R.resultOptionsUnlocked(next), true);
  assert.deepEqual(R.resultOptions(next), { skip: true, delay: .5 });
  delete next.reincarnation.resultOptions;
  const restored = D.readSave(JSON.stringify(next));
  assert.equal(R.resultOptionsUnlocked(restored), true); assert.deepEqual(R.resultOptions(restored), defaults);
});
test('all ten half-second settings survive save/load and another rebirth; malformed values fall back to defaults', () => {
  for (let delay = .5; delay <= 5; delay += .5) {
    const s = seed(); s.reincarnation.resultOptions = { skip: true, delay };
    const restored = D.readSave(JSON.stringify(s));
    assert.deepEqual(R.resultOptions(restored), { skip: true, delay });
    restored.reincarnation.defeatedCycle = restored.reincarnation.cycle;
    assert.deepEqual(R.resultOptions(R.prepare(restored, D.freshSave)), { skip: true, delay });
  }
  for (const delay of [undefined, null, '0.5', 0, -.5, .75, 5.5, NaN, Infinity]) {
    const s = seed(); s.reincarnation.resultOptions = { skip: 'true', delay };
    assert.deepEqual(R.restore(s.reincarnation).resultOptions, defaults);
  }
});
test('custom repeat delays begin after all drops, and instant presentation preserves the entire reward list', () => {
  const loot = { jelly: 8, crystal: 2, 'unique-range': 1 }, animated = L.presentation(loot, 10);
  for (let delay = 500; delay <= 5000; delay += 500) {
    const full = L.presentation(loot, 10, { repeatDelay: delay });
    assert.equal(full.completeAt, animated.completeAt); assert.equal(full.repeatAt, full.completeAt + delay);
    const instant = L.presentation(loot, 10, { reduced: true, repeatDelay: delay });
    assert.equal(instant.completeAt, 0); assert.equal(instant.repeatAt, delay);
    assert.deepEqual(instant.entries.map(e => [e.id,e.count]), animated.entries.map(e => [e.id,e.count]));
    assert.ok(instant.entries.every(e => e.at === 0));
  }
});
