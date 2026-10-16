'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const A = require('../public/js/core/forest-auto-gear.js'), U = require('../public/js/ui/forest-unlocks.js'), C = require('../public/js/core/forest-conversion.js');
function seed(last = 10) {
  const save = D.freshSave(); save.cleared = Array.from({ length: last }, (_, i) => i + 1);
  save.gold = 1000000; for (const item of D.ITEMS.filter(i => i.type === 'material')) save.inventory[item.id] = 10000;
  save.autoGear.enabled = true; return save;
}
test('automatic acquisition is OFF initially and cannot spend before forest 10', () => {
  assert.equal(D.freshSave().autoGear.enabled, false);
  for (const save of [seed(9), { ...seed(), autoGear: A.fresh() }]) {
    const before = structuredClone(save); assert.deepEqual(A.acquire(save), []); assert.deepEqual(save, before);
  }
});
test('node priority leads character priority; order can favor a different character', () => {
  const save = seed(); save.autoGear.characters = ['mage', 'warrior', 'paladin', 'ninja', 'shaman', 'miko'];
  const first = A.acquire(save, 21);
  assert.ok(first.slice(0, 20).every(n => n.character === 'mage' && n.kind === 'main'));
  assert.equal(first[20].character, 'warrior'); assert.equal(first[20].kind, 'main');
  save.autoGear.kinds = ['sub', 'unique', 'main'];
  assert.equal(A.acquire(save, 1)[0].kind, 'sub');
});
test('automatic spending matches manual purchases exactly and never repurchases nodes', () => {
  const save = seed(), manual = structuredClone(save), bought = A.acquire(save);
  assert.equal(bought.length, 24);
  for (const row of bought) assert.equal(P.purchase(manual, row.character, row.slot, row.node), true);
  assert.deepEqual(save, manual);
  for (const row of A.acquire(save)) assert.ok(!bought.some(old => old.character === row.character && old.slot === row.slot && old.node === row.node));
  for (const c of Object.values(save.progression.characters)) for (const slot of ['weapon', 'armor']) assert.equal(new Set(c[slot]).size, c[slot].length);
});
test('exclusions, stage gates, dependencies and locked characters remain effective', () => {
  const save = seed(12); save.autoGear.excludedCharacters = ['warrior', 'paladin']; save.autoGear.excludedKinds = ['sub', 'unique'];
  const bought = A.acquire(save, 100);
  assert.equal(bought.length, 24); assert.ok(bought.every(row => row.character === 'mage' && row.kind === 'main'));
  assert.ok(save.progression.characters.mage.weapon.includes('swamp-main-2'));
  assert.ok(!save.progression.characters.mage.weapon.includes('swamp-main-3'));
  assert.deepEqual(save.progression.characters.ninja.weapon, []);
  assert.deepEqual(A.acquire(save), []);
  const noPrereq = seed(); noPrereq.autoGear.excludedKinds = ['main', 'sub'];
  assert.deepEqual(A.acquire(noPrereq), []);
});
test('unaffordable high priority nodes skip to an affordable candidate without going negative', () => {
  const save = seed(); save.gold = 10; save.inventory = {};
  assert.deepEqual(A.acquire(save), [{ character: 'warrior', slot: 'weapon', node: 'main-1', kind: 'main' }]);
  assert.equal(save.gold, 0); assert.deepEqual(save.inventory, {});
  const before = structuredClone(save); assert.deepEqual(A.acquire(save), []); assert.deepEqual(save, before);
});
test('settings survive restoration; old and invalid settings receive safe defaults', () => {
  const save = seed(); save.autoGear.kinds.reverse(); save.autoGear.characters.reverse();
  save.autoGear.excludedKinds = ['sub']; save.autoGear.excludedCharacters = ['mage'];
  assert.deepEqual(D.readSave(JSON.stringify(save)).autoGear, save.autoGear);
  delete save.autoGear; assert.deepEqual(D.readSave(JSON.stringify(save)).autoGear, A.fresh());
  const clean = A.restore({ enabled: 'true', kinds: ['unique', 'unique', 'skills'], characters: [null, 'mage'], excludedKinds: ['sub', 'sub', 'skills'], excludedCharacters: ['unknown'] });
  assert.equal(clean.enabled, false); assert.deepEqual(clean.kinds, ['unique', 'main', 'sub']);
  assert.equal(clean.characters[0], 'mage'); assert.deepEqual(clean.excludedKinds, ['sub']); assert.deepEqual(clean.excludedCharacters, []);
});
test('regional first clears unlock forge pages; every region 10 reports actual new recipes', () => {
  for (const region of D.REGIONS) {
    const stage = (region.id - 1) * 10 + 1, save = seed(stage - 1);
    assert.ok(U.collect(save, stage).some(row => row.id === 'forge-' + region.id));
    save.cleared.push(stage); assert.deepEqual(U.collect(save, stage), []);
    const end = region.id * 10, before = seed(end - 1), unlock = U.collect(before, end).find(row => row.recipes);
    const expected = C.RECIPES.filter(row => row.stages.every(id => id <= end) && row.stages.includes(end)).map(row => row.id);
    assert.deepEqual(unlock.recipes, expected); assert.equal(expected.length, 9);
    for (let number = 1; number < 10; number++) {
      const id = (region.id - 1) * 10 + number;
      assert.equal(U.collect(seed(id - 1), id).some(row => row.recipes), false);
    }
  }
});
test('option unlocks, final-stage recipes and repeat suppression follow availability rather than inventory', () => {
  assert.ok(U.collect(seed(9), 10).some(row => row.id === 'auto-gear'));
  assert.ok(U.collect(seed(49), 50).some(row => row.id === 'gem-workshop'));
  const empty = seed(9); empty.inventory = {}; assert.ok(U.collect(empty, 10).some(row => row.recipes));
  assert.deepEqual(U.collect(seed(10), 10), []); assert.deepEqual(U.collect(seed(10), 999), []);
});
