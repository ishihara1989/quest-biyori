'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../development/labs/js/reincarnation-tree-data.js');

test('all nodes have unique IDs, valid prerequisites and an acyclic path to the origin', () => {
  assert.equal(new Set(M.nodes.map(n => n.id)).size, M.nodes.length);
  function visit(id, visiting = new Set()) {
    assert.ok(M.byId[id], id);
    assert.ok(!visiting.has(id), 'cycle at ' + id);
    const path = new Set([...visiting, id]);
    if (id !== 'origin') assert.ok(M.byId[id].requires.length > 0);
    M.byId[id].requires.forEach(parent => visit(parent, path));
  }
  for (const n of M.nodes) {
    assert.ok(Number.isInteger(n.cost) && n.cost >= 0);
    assert.ok(M.families[n.family]);
    visit(n.id);
  }
});

test('presets have a legal budget and contain every prerequisite of owned nodes', () => {
  for (const name of Object.keys(M.presets)) {
    const s = M.createState(name);
    assert.ok(M.points(s) >= 0, name);
    for (const id of s.owned) for (const parent of M.byId[id].requires) assert.ok(s.owned.has(parent), name + ': ' + parent);
  }
});

test('first 100 points buy drop2, xp3, gold2 with no remainder', () => {
  const s = M.createState();
  for (const id of ['drop2', 'xp3', 'gold2']) assert.equal(M.purchase(s, id), true);
  assert.equal(M.points(s), 0);
  const t = M.totals(s);
  assert.equal(t.drop, 2); assert.equal(t.xp, 1); assert.equal(t.gold, 2);
});

test('locked, unaffordable, repeated, and unknown purchases cannot alter the budget', () => {
  const s = M.createState();
  for (const id of ['main-free', 'unknown', 'origin']) assert.equal(M.purchase(s, id), false);
  assert.equal(M.spent(s), 0);
  assert.equal(M.purchase(s, 'drop2'), true);
  assert.equal(M.purchase(s, 'drop2'), false);
  assert.equal(M.status(s, 'drop3'), 'unaffordable');
  assert.equal(M.purchase(s, 'drop3'), false);
  assert.equal(M.points(s), 40);
  assert.equal(s.owned.size, 2);
});

test('main goal needs all three prerequisites and matches 560 / 760 point routes', () => {
  const s = M.createState('goal');
  assert.equal(M.points(s), 440);
  assert.equal(M.purchase(s, 'main-free'), true);
  assert.equal(M.spent(s), 560);
  assert.equal(M.points(s), 40);
  assert.equal(M.totals(s).mainFree, 1);
  s.total += 200;
  assert.equal(M.purchase(s, 'drop3'), true);
  assert.equal(M.purchase(s, 'drop4'), true);
  assert.equal(M.spent(s), 760);
  for (const missing of ['xp3', 'sub20', 'unique20']) {
    const trial = M.createState('goal'); trial.owned.delete(missing);
    assert.equal(M.status(trial, 'main-free'), 'locked');
  }
});

test('trial unlock uses milestone purchases rather than a reincarnation counter', () => {
  const s = M.createState('goal'); s.total = 5000;
  assert.equal(M.purchase(s, 'main-free'), true);
  assert.equal(M.purchase(s, 'trial-open'), false);
  M.purchase(s, 'drop3'); M.purchase(s, 'drop4');
  assert.equal(M.purchase(s, 'trial-open'), true);
});

test('full totals retain integer drop count and separate additive / multiplier / capacity effects', () => {
  const t = M.totals(M.createState('complete'));
  assert.equal(t.drop * t.dropFinal, 20);
  assert.equal((1 + t.damage / 100) * t.damageFinal, 7.5);
  assert.equal((1 + t.hp / 100) * t.hpFinal, 7.5);
  assert.equal(t.common, 250);
  assert.equal(t.attackCap, 100);
  assert.equal(t.skip, 4);
  assert.equal(t.xp, 3);
  assert.equal(t.sub, 40);
  assert.equal(t.gold, 4);
});

test('preview and preset reset do not mutate the active purchases or original presets', () => {
  const s = M.createState('goal');
  const preview = M.totals(s, 'main-free');
  assert.equal(preview.mainFree, 1);
  assert.equal(M.totals(s).mainFree, undefined);
  M.purchase(s, 'main-free');
  assert.equal(M.createState('goal').owned.has('main-free'), false);
});
