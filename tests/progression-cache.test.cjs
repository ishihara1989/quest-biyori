'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
test('cached effects match public definitions across all regions, jobs and slots without retaining save ownership', () => {
  const s = D.freshSave(), empty = D.freshSave();
  for (const job of Object.keys(P.CHARACTERS)) for (const slot of ['weapon', 'armor']) {
    const state = s.progression.characters[job];
    for (const region of [1,2,3,4,5,6,7,8,9,10,'goddess']) {
      const tree = P.gearTree(job, slot, region);
      state[slot].push(...tree.filter(n => n.main || region === 'goddess').map(n => n.id));
      const expected = {};
      for (const r of [1,2,3,4,5,6,7,8,9,10,'goddess']) {
        const acquired = P.gearTree(job, slot, r).filter(n => state[slot].includes(n.id));
        for (const effect of [...acquired.map(n => n.effect), ...(r === 'goddess' ? [] : P.gearBonuses(job, slot).filter(b => b.count <= acquired.length).map(b => b.effect))])
          for (const [key, value] of Object.entries(effect)) expected[key] = (expected[key] || 0) + value;
      }
      assert.deepEqual(P.effects(s, job, slot), expected, job + '/' + slot + '/' + region);
      assert.deepEqual(P.effects(empty, job, slot), {});
    }
    state[slot] = []; assert.deepEqual(P.effects(s, job, slot), {});
  }
});
test('path definition cache preserves current ownership, resources, stage locks and isolated result objects', () => {
  const s = D.freshSave(); s.cleared = [1,2]; s.gold = 1e6; s.inventory = { jelly: 1000 };
  const a = P.gearPurchasePlan(s, 'warrior', 'weapon', 'main-2'), cost = a.cost.gold;
  a.nodes[0].cost.gold = 9999999; a.nodes[0].effect.damage = 9999999;
  assert.equal(P.gearPurchasePlan(s, 'warrior', 'weapon', 'main-2').cost.gold, cost);
  const empty = D.freshSave(); assert.equal(P.gearPurchasePlan(empty, 'warrior', 'weapon', 'main-2').status, 'locked');
  assert.ok(P.purchaseGearPath(s, 'warrior', 'weapon', 'main-2'));
  assert.equal(P.gearPurchasePlan(s, 'warrior', 'weapon', 'main-2').status, 'owned');
  s.progression.characters.warrior.weapon = []; s.gold = 0;
  assert.equal(P.gearPurchasePlan(s, 'warrior', 'weapon', 'main-2').status, 'cost');
  assert.equal(P.gearPurchasePlan(s, 'warrior', 'weapon', 'main-3').status, 'locked');
});
