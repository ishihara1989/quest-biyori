'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const R = require('../public/js/core/reincarnation.js'), A = require('../public/js/core/forest-auto-gear.js');
function seed(stage = 10) {
  const s = D.freshSave();
  s.cleared = Array.from({ length: stage }, (_, i) => i + 1);
  Object.assign(s.reincarnation, { discovered: true, unlocked: true });
  s.reincarnation.automation.waitForMainGear = true; s.autoMode = 'advance';
  return s;
}
function complete(s, stage) {
  for (const job of Object.keys(P.CHARACTERS)) if (P.unlocked(s, job)) for (const slot of ['weapon', 'armor'])
    s.progression.characters[job][slot] = P.allGearTrees(job, slot).filter(n => n.main && n.stage <= stage).map(n => n.id);
}
test('forest 10 waits for every recruited ally and both main paths, then advances without side or unique nodes', () => {
  const s = seed(); complete(s, 10);
  assert.equal(A.mainComplete(s, 10), true);
  for (const job of ['warrior', 'mage', 'paladin']) for (const slot of ['weapon', 'armor']) {
    const id = s.progression.characters[job][slot].pop();
    assert.deepEqual(D.autoDestination(s, 10, true), { stage: 10, mode: 'advance' });
    s.progression.characters[job][slot].push(id);
  }
  assert.deepEqual(D.autoDestination(s, 10, true), { stage: 11, mode: 'advance' });
  assert.deepEqual(s.progression.characters.ninja.weapon, []);
  s.progression.characters.warrior.weapon.shift();
  assert.equal(D.autoDestination(s, 10, true).stage, 10, 'earlier missing main nodes also block');
});
test('option is inert before unlock, defaults OFF, and preserves normal repeat, OFF, defeat and manual unlocks', () => {
  assert.equal(D.freshSave().reincarnation.automation.waitForMainGear, false);
  const s = seed(); s.reincarnation.unlocked = false;
  assert.equal(D.autoDestination(s, 10, true).stage, 11);
  s.reincarnation.unlocked = true; s.reincarnation.automation.waitForMainGear = false;
  assert.equal(D.autoDestination(s, 10, true).stage, 11);
  s.reincarnation.automation.waitForMainGear = true;
  assert.equal(D.isUnlocked(s, 11), true);
  assert.deepEqual(D.autoDestination(s, 10, false), { stage: 9, mode: 'same' });
  s.autoMode = 'same'; complete(s, 10); assert.equal(D.autoDestination(s, 10, true).stage, 10);
  s.autoMode = 'off'; assert.equal(D.autoDestination(s, 10, true), null);
});
test('new recruits, regional transitions and skipped stages use current-stage main paths', () => {
  const s = seed(3); complete(s, 3); assert.equal(D.autoDestination(s, 3, true).stage, 4);
  D.award(s, 4); complete(s, 3);
  assert.equal(D.autoDestination(s, 4, true).stage, 4); complete(s, 4);
  assert.equal(D.autoDestination(s, 4, true).stage, 5);
  for (const stage of [11, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100]) {
    const regional = seed(stage); complete(regional, stage);
    assert.equal(D.autoDestination(regional, stage, true).stage, Math.min(100, stage + 1));
    regional.progression.characters.mage.armor.pop();
    assert.equal(D.autoDestination(regional, stage, true).stage, stage);
  }
  s.reincarnation.owned = ['skip2'];
  assert.equal(D.autoDestination(s, 4, true).stage, 6);
  s.reincarnation.passed = [5]; s.cleared.push(6); complete(s, 4);
  assert.equal(D.autoDestination(s, 6, true).stage, 6); complete(s, 6);
  assert.equal(D.autoDestination(s, 6, true).stage, 8);
});
test('automatic exclusions do not waive completion; purchases release the wait on the next decision', () => {
  const s = seed(); complete(s, 10); s.progression.characters.paladin.armor.pop();
  Object.assign(s.autoGear, { enabled: true, excludedCharacters: ['paladin'], excludedKinds: ['main'] });
  assert.equal(D.autoDestination(s, 10, true).stage, 10);
  s.autoGear.excludedCharacters = []; s.autoGear.excludedKinds = [];
  s.gold = 1e6; for (const item of D.ITEMS.filter(i => i.type === 'material')) s.inventory[item.id] = 10000;
  assert.ok(A.acquire(s).some(row => row.character === 'paladin' && row.slot === 'armor' && row.node === 'main-10'));
  assert.equal(D.autoDestination(s, 10, true).stage, 11);
});
test('legacy and malformed settings default OFF; enabled setting survives reload and rebirth', () => {
  const s = seed(); complete(s, 10);
  const loaded = D.readSave(JSON.stringify(s)); assert.equal(loaded.reincarnation.automation.waitForMainGear, true);
  assert.equal(D.autoDestination(loaded, 10, true).stage, 11);
  s.reincarnation.defeatedCycle = 0;
  const next = R.prepare(s, D.freshSave); assert.equal(next.reincarnation.automation.waitForMainGear, true);
  assert.equal(D.autoDestination(next, 1, true).stage, 1);
  delete s.reincarnation.automation.waitForMainGear;
  assert.equal(D.readSave(JSON.stringify(s)).reincarnation.automation.waitForMainGear, false);
  s.reincarnation.automation.waitForMainGear = 'true';
  assert.equal(D.readSave(JSON.stringify(s)).reincarnation.automation.waitForMainGear, false);
});
test('special encounters keep their own loop and retreat destinations', () => {
  const s = seed(100); s.cleared.push('chaos-gate');
  assert.equal(D.autoDestination(s, 'chaos-gate', true).stage, 'chaos-gate');
  complete(s, 100); assert.equal(D.autoDestination(s, 'chaos-gate', true).stage, 'extradimensional-goddess');
  assert.deepEqual(D.autoDestination(s, 'chaos-gate', false), { stage: 100, mode: 'same' });
  assert.equal(D.autoDestination(s, 'dimensional-gate', true).stage, 'dimensional-gate');
});
