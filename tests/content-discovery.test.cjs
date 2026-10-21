'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), G = require('../public/js/core/gem-system.js');
const P = require('../public/js/core/forest-progression.js'), L = require('../public/js/core/museum-library.js');
const catalog = require('../public/assets/museum/index.json');
const goddess = D.ALL_STAGES.find(s => s.id === G.Epic.GODDESS);
const secret = [goddess, D.RARITIES.epic, ...D.ITEMS.filter(i => [G.Epic.MATERIAL, G.shardKey('epic')].includes(i.id)), ...Object.values(G.OPTIONS).filter(o => o.min === 3)];

test('goddess stage, residue, epic shards, rarity and effects stay hidden until the chaos gate clear', () => {
  assert.equal(secret.length, 16);
  const save = D.freshSave();
  for (const cleared of [[], D.STAGES.map(s => s.id), [...D.STAGES.map(s => s.id), 'dimensional-gate']]) {
    save.cleared = cleared;
    for (const entry of secret) assert.equal(D.isRevealed(save, entry), false, entry.name);
    assert.equal(D.isRevealed(save, D.SPECIAL_STAGES[0]), true);
    assert.equal(D.isRevealed(save, D.RARITIES.legendary), true);
    assert.equal(D.isRevealed(save, D.ITEMS.find(i => i.id === 'jelly')), true);
  }
  save.cleared.push('chaos-gate');
  for (const entry of secret) assert.equal(D.isRevealed(save, entry), true, entry.name);
  assert.equal(save.cleared.includes(goddess.id), false);
});

test('discovery follows current progress and survives save restoration without changing player data', () => {
  for (const cleared of [[50, 'dimensional-gate'], [100, 'chaos-gate'], [G.Epic.GODDESS]]) {
    const seed = D.freshSave(); seed.cleared = cleared;
    const save = D.readSave(JSON.stringify(seed)), before = JSON.stringify(save);
    for (const entry of secret) assert.equal(D.isRevealed(save, entry), cleared.includes('chaos-gate') || cleared.includes(G.Epic.GODDESS));
    assert.equal(JSON.stringify(save), before);
  }
});

test('enemy discovery records only actual encounters and survives defeat and reload', () => {
  const save = D.freshSave();
  for (const owner of catalog.owners.filter(o => o.side === 'enemy')) {
    assert.equal(D.enemyDiscovered(save, owner.id), false);
    assert.equal(!!L.unlocked(save, owner), false);
    D.recordEncounters(save, [owner.id, owner.id, 'invalid']);
    assert.equal(save.encounteredEnemies.filter(id => id === owner.id).length, 1);
    assert.equal(D.enemyDiscovered(save, owner.id), true);
    for (const clip of owner.clips) assert.equal(L.unlocked(save, owner, clip), true);
  }
  assert.deepEqual(save.cleared, []);
  assert.deepEqual(D.readSave(JSON.stringify(save)).encounteredEnemies, save.encounteredEnemies);
  assert.equal(D.recordEncounters(save, save.encounteredEnemies), false);
});

test('old saves recover cleared encounters without exposing the next stage', () => {
  const seed = D.freshSave(); delete seed.encounteredEnemies; seed.cleared = [1, 2];
  const restored = D.readSave(JSON.stringify(seed));
  assert.equal(D.enemyDiscovered(restored, 'boss-slime'), true);
  // Forest 1 now contains all three common families; the next boss is unseen.
  assert.equal(D.enemyDiscovered(restored, 'boss-boar'), false);
  assert.equal(D.stageVisible(restored, D.STAGES[2]), true);
  assert.equal(D.stageVisible(restored, D.STAGES[3]), false);
  assert.equal(D.regionVisible(restored, 2), false);
  assert.deepEqual(D.readSave(JSON.stringify(restored)), restored);
});

test('materials appear only after acquisition and remain known at zero; shards require their gem rarity', () => {
  const save = D.freshSave(), item = id => D.ITEMS.find(i => i.id === id);
  assert.deepEqual(D.ITEMS.filter(i => D.itemDiscovered(save, i)).map(i => i.id), ['potion']);
  save.inventory.jelly = 1; save.inventory.jelly--;
  assert.equal(D.itemDiscovered(save, item('jelly')), true);
  save.inventory[G.shardKey('unique')] = 10;
  assert.equal(D.itemDiscovered(save, item(G.shardKey('unique'))), false);
  P.addGem(save, G.generate({ rarity: 'unique', family: 'attack', random: () => .5 }));
  assert.equal(D.itemDiscovered(save, item(G.shardKey('unique'))), true);
  assert.equal(D.itemDiscovered(save, item(G.shardKey('rare'))), false);
});

test('gem rarity history survives automatic dismantling, spent shards and reload, including legacy migration', () => {
  for (const rarity of Object.keys(G.TIERS)) {
    const save = D.freshSave(); save.cleared = [50, G.Epic.GODDESS];
    const gem = P.addGem(save, G.generate({ rarity, level: rarity === 'legendary' ? 6 : 1, random: () => .5 }));
    assert.ok(gem);
    const legacy = structuredClone(save); delete legacy.discoveredGemRarities;
    assert.equal(G.rarityDiscovered(D.readSave(JSON.stringify(legacy)), rarity), true);
    save.autoGemDismantle = { ...G.freshAutoDismantle(), enabled: true, maxRarity: rarity };
    assert.ok(G.autoDismantle(save, gem.id));
    save.inventory[G.shardKey(rarity)] = 0;
    assert.equal(G.rarityDiscovered(save, rarity), true);
    const restored = D.readSave(JSON.stringify(save));
    assert.equal(G.rarityDiscovered(restored, rarity), true);
    assert.deepEqual(restored.discoveredGemRarities, [rarity]);
    delete save.discoveredGemRarities;
    // Old shard conversions cannot prove that a gem of that rarity was obtained.
    assert.equal(!!G.rarityDiscovered(D.readSave(JSON.stringify(save)), rarity), false);
  }
});

test('invalid discovery data is sanitized without resetting inventory or progress', () => {
  const save = D.freshSave(); save.gold = 123; save.inventory.tusk = 7; save.cleared = [1];
  save.encounteredEnemies = ['slime', 'slime', 'missing'];
  save.discoveredGemRarities = ['rare', 'rare', 'missing'];
  const clean = D.readSave(JSON.stringify(save));
  assert.deepEqual(clean.encounteredEnemies, ['slime']);
  assert.deepEqual(clean.discoveredGemRarities, ['rare']);
  assert.equal(clean.gold, 123); assert.equal(clean.inventory.tusk, 7); assert.deepEqual(clean.cleared, [1]);
});
