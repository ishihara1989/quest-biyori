'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), C = require('../public/js/core/forest-conversion.js');
const ready = () => { const save = D.freshSave(); save.cleared = D.STAGES.map(stage => stage.id); return save; };
const recipes = (region, category) => C.RECIPES.filter(row => row.region === region && row.category === category);
const funded = () => {
  const save = ready(); save.gold = 100000;
  save.inventory = Object.fromEntries(D.ITEMS.filter(item => item.type !== 'gem').map(item => [item.id, 20]));
  return save;
};

test('all ten regions provide conversion and common purchases at increasing prices up to 500G', () => {
  assert.equal(C.REGIONS.length, 10);
  assert.equal(C.CATEGORIES.length, 6);
  assert.equal(C.RECIPES.length, 120);
  assert.equal(new Set(C.RECIPES.map(row => row.id)).size, 120);
  for (const region of C.REGIONS) {
    assert.equal(region.common.length, 3);
    assert.ok(region.rare);
    assert.deepEqual(C.CATEGORIES.map(category => recipes(region.id, category.id).length), [3, 1, 3, 1, 1, 3]);
    assert.equal(region.commonPrice, region.id * 50);
    for (const purchase of recipes(region.id, 'gold-common')) {
      assert.deepEqual(purchase.inputs, {});
      assert.equal(purchase.gold, region.commonPrice);
      assert.equal(purchase.amount, 1);
      assert.equal(D.ITEMS.find(item => item.id === purchase.output).rarity, 'common');
    }
    assert.equal(region.unlockStage, region.id * 10);
    for (const recipe of C.RECIPES.filter(row => row.region === region.id)) assert.deepEqual(recipe.stages, [region.id * 10]);
  }
});

for (const region of C.REGIONS) {
  test(region.name + ': every recipe consumes exactly the requested items and produces only its chosen output', () => {
    for (const recipe of C.RECIPES.filter(row => row.region === region.id)) {
      const save = funded(recipe), before = structuredClone(save);
      assert.equal(C.convert(save, recipe.id), true);
      for (const [id, amount] of Object.entries(before.inventory)) {
        assert.equal(save.inventory[id], amount - (recipe.inputs[id] || 0) + (recipe.output === id ? recipe.amount : 0), recipe.id + ': ' + id);
      }
      assert.equal(save.gold, before.gold - recipe.gold);
      assert.deepEqual(save.cleared, before.cleared);
      assert.deepEqual(save.progression, before.progression);
      assert.deepEqual(save.gems, before.gems);
    }
    const common = recipes(region.id, 'common-crystal')[0];
    assert.deepEqual(common.inputs, Object.fromEntries(region.common.map(id => [id, 2])));
    assert.equal(common.output, region.crystal); assert.equal(common.amount, 1);
    for (const recipe of recipes(region.id, 'crystal-common')) { assert.deepEqual(recipe.inputs, { [region.crystal]: 1 }); assert.equal(recipe.amount, 3); }
    const rare = recipes(region.id, 'crystal-rare')[0];
    assert.deepEqual(rare.inputs, { [region.crystal]: 5 }); assert.equal(rare.output, region.rare); assert.equal(rare.amount, 1);
    const crystal = recipes(region.id, 'rare-crystal')[0];
    assert.deepEqual(crystal.inputs, { [region.rare]: 1 }); assert.equal(crystal.output, region.crystal); assert.equal(crystal.amount, 3);
    for (const recipe of recipes(region.id, 'rare-common')) { assert.deepEqual(recipe.inputs, { [region.rare]: 1 }); assert.equal(recipe.amount, 9); }
  });
}

test('unlocking requires the regional final stage clear, regardless of inventory ownership or region access', () => {
  for (const recipe of C.RECIPES) {
    for (const missing of recipe.stages) {
      const save = funded(recipe); save.cleared = save.cleared.filter(id => id !== missing);
      const before = JSON.stringify(save), plan = C.plan(save, recipe.id);
      assert.equal(plan.status, 'locked'); assert.ok(plan.lockedStages.includes(missing)); assert.equal(plan.max, 0);
      assert.equal(C.convert(save, recipe.id), false); assert.equal(JSON.stringify(save), before);
    }
  }
  const save = ready(); save.inventory.crystal = 5; save.cleared = Array.from({ length: 9 }, (_, i) => i + 1);
  assert.equal(C.plan(save, recipes(1, 'crystal-rare')[0].id).status, 'locked');
  D.award(save, 10);
  assert.equal(C.convert(save, recipes(1, 'crystal-rare')[0].id), true);
  assert.equal(save.inventory.wood, 1);
});

test('every region keeps conversion and purchases locked through stage 9 and unlocks both at stage 10', () => {
  for (const region of C.REGIONS) {
    const save = funded(); save.cleared = [];
    const base = (region.id - 1) * 10;
    for (let number = 1; number <= 10; number++) {
      save.cleared.push(base + number);
      const available = C.RECIPES.filter(row => row.region === region.id && C.plan(save, row.id).status === 'available');
      assert.equal(available.length, number < 10 ? 0 : 12);
      const restored = D.readSave(JSON.stringify(save));
      assert.equal(C.RECIPES.filter(row => row.region === region.id && C.plan(restored, row.id).status === 'available').length, available.length);
    }
  }
});

test('batch maximum is limited by the scarcest ingredient and empty inventory supports output insertion', () => {
  const recipe = recipes(1, 'common-crystal')[0], save = ready();
  save.inventory = { jelly: 11, tusk: 8, flower: 7 };
  assert.equal(C.plan(save, recipe.id).max, 3);
  const before = JSON.stringify(save);
  assert.equal(C.convert(save, recipe.id, 4), false); assert.equal(JSON.stringify(save), before);
  assert.equal(C.convert(save, recipe.id, 3), true);
  assert.deepEqual(save.inventory, { jelly: 5, tusk: 2, flower: 1, crystal: 3 });
  const after = JSON.stringify(save);
  assert.equal(C.convert(save, recipe.id), false); assert.equal(JSON.stringify(save), after);
});

test('missing ingredients never partially debit and unrelated region materials cannot pay', () => {
  for (const recipe of C.RECIPES) for (const missing of Object.keys(recipe.inputs)) {
    const save = funded(recipe); delete save.inventory[missing]; const before = JSON.stringify(save);
    assert.equal(C.plan(save, recipe.id).status, 'cost');
    assert.equal(C.convert(save, recipe.id), false); assert.equal(JSON.stringify(save), before);
  }
  const save = funded(); save.inventory.crystal = 0;
  assert.equal(C.convert(save, recipes(1, 'crystal-common')[0].id), false);
  assert.equal(save.inventory['swamp-crystal'], 20);
});

test('invalid IDs, quantities and inventory counts leave the entire save unchanged', () => {
  const recipe = recipes(1, 'crystal-common')[0];
  for (const count of [0, -1, .5, '1', null, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const save = funded(), before = JSON.stringify(save);
    assert.equal(C.convert(save, recipe.id, count), false); assert.equal(JSON.stringify(save), before);
  }
  for (const id of ['', 'missing', recipe, { ...recipe, inputs: {} }]) {
    const save = funded(), before = JSON.stringify(save);
    assert.equal(C.convert(save, id), false); assert.equal(JSON.stringify(save), before);
  }
  for (const count of [-1, .5, NaN, Infinity, '20', Number.MAX_SAFE_INTEGER + 1]) {
    const save = funded(); save.inventory.crystal = count; const before = structuredClone(save);
    assert.equal(C.convert(save, recipe.id), false); assert.deepEqual(save, before);
  }
});

test('output capacity limits MAX and refuses unsafe integer overflow without consumption', () => {
  const recipe = recipes(1, 'crystal-common')[0], save = funded();
  save.inventory[recipe.output] = Number.MAX_SAFE_INTEGER - 7;
  assert.equal(C.plan(save, recipe.id).max, 2);
  const before = JSON.stringify(save);
  assert.equal(C.convert(save, recipe.id, 3), false); assert.equal(JSON.stringify(save), before);
  assert.equal(C.convert(save, recipe.id, 2), true);
  assert.equal(save.inventory[recipe.output], Number.MAX_SAFE_INTEGER - 1);
  assert.equal(C.plan(save, recipe.id).status, 'overflow');
  assert.equal(C.plan(save, recipe.id).max, 0);
});

test('conversion remains exact after saving and restoring; round trips cannot multiply crystals', () => {
  const save = ready(); save.inventory = { crystal: 10 };
  const toRare = recipes(1, 'crystal-rare')[0], toCrystal = recipes(1, 'rare-crystal')[0];
  assert.equal(C.convert(save, toRare.id, 2), true);
  const restored = D.readSave(JSON.stringify(save));
  assert.equal(restored.inventory.wood, 2); assert.equal(restored.inventory.crystal, 0);
  assert.equal(C.plan(restored, toCrystal.id).max, 2);
  assert.equal(C.convert(restored, toCrystal.id, 2), true);
  assert.equal(restored.inventory.crystal, 6); assert.equal(restored.inventory.wood, 0);
  assert.equal(C.convert(restored, toCrystal.id), false);
});

test('purchases debit gold exactly for 1/10/100/MAX, preserve other items and persist', () => {
  for (const recipe of C.RECIPES.filter(row => row.gold)) {
    for (const times of [1, 10, 100, 'max']) {
      const save = ready(); save.gold = recipe.gold * 123 + 17;
      save.inventory = { ...save.inventory, [recipe.output]: 7, [C.REGIONS.find(r => r.id === recipe.region).crystal]: 11 };
      const before = structuredClone(save), amount = times === 'max' ? C.plan(save, recipe.id).max : times;
      assert.equal(C.plan(save, recipe.id).max, 123);
      assert.equal(C.convert(save, recipe.id, amount), true);
      assert.equal(save.gold, before.gold - recipe.gold * amount);
      assert.deepEqual(save.inventory, { ...before.inventory, [recipe.output]: 7 + amount });
      const restored = D.readSave(JSON.stringify(save));
      assert.equal(restored.gold, save.gold);
      assert.deepEqual(restored.inventory, save.inventory);
    }
  }
});

test('purchase affordability, invalid gold and output capacity never partially debit', () => {
  const recipe = recipes(10, 'gold-common')[0];
  for (const gold of [0, 499, 500, 501, 999, 1000]) {
    const save = ready(); save.gold = gold;
    assert.equal(C.plan(save, recipe.id).max, Math.floor(gold / 500));
    const before = structuredClone(save);
    assert.equal(C.convert(save, recipe.id, Math.floor(gold / 500) + 1), false);
    assert.deepEqual(save, before);
    if (gold >= 500) {
      assert.equal(C.convert(save, recipe.id), true);
      assert.equal(save.gold, gold - 500);
      assert.equal(save.inventory[recipe.output], 1);
    }
  }
  for (const gold of [undefined, -1, .5, NaN, Infinity, '500', Number.MAX_SAFE_INTEGER + 1]) {
    const save = ready(); save.gold = gold; const before = structuredClone(save);
    assert.equal(C.plan(save, recipe.id).status, 'invalid');
    assert.equal(C.convert(save, recipe.id), false);
    assert.deepEqual(save, before);
  }
  const save = ready(); save.gold = 2000; save.inventory[recipe.output] = Number.MAX_SAFE_INTEGER - 1;
  assert.equal(C.plan(save, recipe.id).max, 1);
  const before = structuredClone(save);
  assert.equal(C.convert(save, recipe.id, 2), false);
  assert.deepEqual(save, before);
  assert.equal(C.convert(save, recipe.id), true);
  assert.equal(save.gold, 1500);
  assert.equal(save.inventory[recipe.output], Number.MAX_SAFE_INTEGER);
  assert.equal(C.plan(save, recipe.id).status, 'overflow');
  assert.equal(C.plan(save, recipe.id).max, 0);
});
