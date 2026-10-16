'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const R = require('../public/js/core/forest-run-rewards.js');
const pending = (hunt = 0, options = {}) => R.create({ hero: { treasureHunt: hunt }, allies: [], goldRemainder: .25, stage: options });
const kill = (enemy, gold = 3, goldRemainder = .75) => ({ type: 'loot', enemy, gold, goldRemainder });

test('kills stay pending, then a clear grants the collected gold and materials exactly once', () => {
  const save = D.freshSave(), before = structuredClone(save), p = pending();
  R.record(p, kill('slime')); R.record(p, kill('slime')); R.record(p, kill('treant', 100));
  assert.deepEqual(save, before);
  assert.deepEqual(D.readSave(JSON.stringify(save)), D.readSave(JSON.stringify(before)));
  const result = R.settle(save, p, true, () => .999);
  assert.equal(result.gold, 106); assert.equal(save.gold, 106); assert.equal(save.goldRemainder, .75);
  assert.deepEqual(result.loot, { flower: 1, crystal: 1 });
  assert.equal(save.inventory.flower, 1); assert.equal(save.inventory.crystal, 1);
  const settled = structuredClone(save);
  assert.equal(R.settle(save, p, true, () => 0), null);
  R.record(p, kill('treant')); assert.equal(p.enemies.size, 0);
  assert.deepEqual(save, settled);
});

test('defeat and abandoning a run preserve none of its rewards or fractional gold', () => {
  const save = D.freshSave(); save.goldRemainder = .25;
  const before = structuredClone(save), p = pending(); R.record(p, kill('treant', 100));
  assert.deepEqual(R.settle(save, p, false, () => { throw Error('No drop rolls on defeat'); }), { loot: {}, gems: [], gold: 0, dismantled: 0 });
  assert.deepEqual(save, before);
  const abandoned = pending(); R.record(abandoned, kill('treant', 100));
  const next = pending(); assert.equal(R.settle(save, next, true, () => .999).gold, 0);
  assert.equal(save.inventory.wood, undefined);
});

test('settlement keeps treasure-hunt guaranteed drops, per-enemy rolls and stage gem overrides', () => {
  const save = D.freshSave(), p = pending(2.5);
  R.record(p, kill('treant', 350));
  assert.deepEqual(R.settle(save, p, true, () => .999).loot, { flower: 3, crystal: 3, wood: 1 });
  const rift = pending(0, { dropLevel: 5, gemMultiplier: 2 }); R.record(rift, kill('treant'));
  const result = R.settle(save, rift, true, () => .08);
  assert.equal(result.gems.length, 1); assert.equal(result.gems[0].rarity, 'rare'); assert.equal(result.gems[0].level, 5);
  assert.equal(result.loot['gem-instance-' + result.gems[0].id], 1);
});

test('auto dismantling runs at settlement and returns shards instead of an unusable gem entry', () => {
  const save = D.freshSave(); save.cleared = Array.from({ length: 50 }, (_, i) => i + 1);
  save.autoGemDismantle.enabled = true; save.autoGemDismantle.maxRarity = 'unique';
  const p = pending(); R.record(p, kill('treant'));
  assert.equal(save.gems.length, 0);
  const result = R.settle(save, p, true, () => 0);
  assert.equal(result.dismantled, 1); assert.deepEqual(result.gems, []); assert.deepEqual(save.gems, []);
  assert.ok(result.loot['gem-shard-unique'] > 0);
  assert.equal(save.inventory['gem-shard-unique'], result.loot['gem-shard-unique']);
  assert.equal(Object.keys(result.loot).some(id => id.startsWith('gem-instance-')), false);
});

test('a goddess clear receives every boosted gem with unique IDs, saves them and settles only once', () => {
  const save = D.freshSave(), p = pending(10);
  R.record(p, kill('extradimensional-goddess'));
  const result = R.settle(save, p, true, () => 0);
  assert.deepEqual(result.gems.map(g => g.rarity), ['epic', 'legendary']);
  assert.equal(new Set(result.gems.map(g => g.id)).size, 2);
  assert.equal(save.gems.length, 2);
  for (const gem of result.gems) assert.equal(result.loot['gem-instance-' + gem.id], 1);
  assert.deepEqual(D.readSave(JSON.stringify(save)).gems, save.gems);
  assert.equal(R.settle(save, p, true, () => 0), null);
  assert.equal(save.gems.length, 2);
});

test('boosted multi-gem rewards dismantle each eligible gem while retaining epic gems', () => {
  const save = D.freshSave(); save.cleared = D.ALL_STAGES.map(s => s.id);
  save.autoGemDismantle.enabled = true; save.autoGemDismantle.maxRarity = 'legendary';
  const p = pending(199); R.record(p, kill('extradimensional-goddess'));
  const result = R.settle(save, p, true, () => .999);
  assert.equal(result.dismantled, 20);
  assert.equal(result.gems.length, 2);
  assert.ok(result.gems.every(g => g.rarity === 'epic'));
  assert.equal(save.gems.length, 2);
  assert.equal(result.loot['gem-shard-legendary'], save.inventory['gem-shard-legendary']);
  assert.ok(result.loot['gem-shard-legendary'] > 0);
});
