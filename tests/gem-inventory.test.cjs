'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const I = require('../public/js/core/forest-gem-inventory.js');
function fixture() {
  const s = D.freshSave(); s.cleared = Array.from({ length: 50 }, (_, i) => i + 1);
  const add = (family, rarity = 'rare', level = 1) => P.addGem(s, P.Gem.generate({ family, rarity, level, size: .5, random: () => .5 }));
  const a = add('physical'), b = add('vitality'), c = add('magic'), d = add('physical', 'rare', 5), e = add('haste', 'unique', 5), f = add('physical', 'rare', 10);
  assert.ok(P.equipGem(s, 'warrior', 'weapon', a.id)); assert.ok(P.equipGem(s, 'warrior', 'armor', b.id)); assert.ok(P.equipGem(s, 'mage', 'weapon', c.id));
  return { s, a, b, c, d, e, f };
}
const ids = rows => rows.map(row => row.gem.id);
test('equipped gems are partitioned by character and slot, never mixed into the bag', () => {
  const { s, a, b, c, d, e, f } = fixture(), before = structuredClone(s);
  const q = I.query(s, 'warrior', 'weapon');
  assert.deepEqual(ids(q.equipped), [a.id]); assert.deepEqual(new Set(ids(q.bag)), new Set([d.id, e.id, f.id]));
  assert.deepEqual(q.otherGroups.map(g => [g.character, g.slot, ids(g.gems)]), [['warrior', 'armor', [b.id]], ['mage', 'weapon', [c.id]]]);
  assert.deepEqual(ids(I.query(s, 'warrior', 'armor').equipped), [b.id]); assert.deepEqual(s, before);
});
test('bag filters compose without hiding equipped items, and clear correctly', () => {
  const { s, a, d, e, f } = fixture();
  const q = I.query(s, 'warrior', 'weapon', { search: '物理攻撃力', rarity: 'rare', level: '5', effect: 'physical' });
  assert.deepEqual(ids(q.bag), [d.id]); assert.deepEqual(ids(q.equipped), [a.id]);
  assert.deepEqual(ids(I.query(s, 'warrior', 'weapon', { search: '該当なし' }).bag), []);
  assert.deepEqual(ids(I.query(s, 'warrior', 'weapon', { sort: 'level', descending: false }).bag), [d.id, e.id, f.id].sort((x,y) => (s.gems.find(g=>g.id===x).level-s.gems.find(g=>g.id===y).level)||y-x));
  assert.equal(I.query(s, 'warrior', 'weapon').bag.length, 3);
  s.gems.find(g => g.id === e.id).locked = true;
  assert.deepEqual(ids(I.query(s, 'warrior', 'weapon', { protectedOnly: true }).bag), [e.id]);
});
test('effect values, capacity, rarity and acquisition order sort deterministically both ways', () => {
  const { s, d, e, f } = fixture();
  assert.deepEqual(ids(I.query(s, 'warrior', 'weapon', { effect: 'physical', sort: 'effect' }).bag), [f.id, d.id]);
  assert.deepEqual(ids(I.query(s, 'warrior', 'weapon', { sort: 'newest' }).bag), [f.id, e.id, d.id]);
  assert.deepEqual(ids(I.query(s, 'warrior', 'weapon', { sort: 'newest', descending: false }).bag), [d.id, e.id, f.id]);
  const costs = I.query(s, 'warrior', 'weapon', { sort: 'capacity', descending: false }).bag.map(r => Object.values(r.info.costs).reduce((a,b)=>a+b,0));
  assert.deepEqual(costs, costs.slice().sort((a,b)=>a-b));
});
test('equipable filter checks job, dedicated slot and the actual remaining directional capacity', () => {
  const { s } = fixture();
  P.addGem(s, P.Gem.generate({ rarity: 'epic', family: 'mage-weapon' }));
  for (const character of ['warrior', 'mage']) for (const slot of ['weapon', 'armor']) {
    const q = I.query(s, character, slot, { compatible: true });
    const expected = s.gems.filter(g => !P.gemOwner(s, g.id) && P.gemUsage(s, character, slot, [...s.progression.characters[character].gems[slot], g.id]).fits);
    assert.deepEqual(new Set(ids(q.bag)), new Set(expected.map(g=>g.id)));
  }
});
