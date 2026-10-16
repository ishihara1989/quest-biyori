'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const { createBattle, updateBattle, distance, DEFAULT_STATS, STEP_MS } = require('../development/labs/js/battle-simulation.js');
const { sample } = require('../public/js/core/motion-playback.js');

function seeded(seed) {
  return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
}
function melee(stats = {}) {
  const battle = createBattle({ random: () => 0.5, stats });
  battle.warmupMs = 0;
  battle.actors[0].x = 450; battle.actors[1].x = 558;
  return battle;
}
const asset = relative => JSON.parse(fs.readFileSync(path.join(__dirname, '../public/assets', relative), 'utf8'));

test('random spawns stay on the assigned half of the forest with independent ground positions', () => {
  const points = new Set();
  for (let seed = 0; seed < 200; seed++) {
    const battle = createBattle({ random: seeded(seed) });
    const [warrior, slime] = battle.actors, { bounds } = battle;
    assert.ok(warrior.x >= bounds.margin && warrior.x < bounds.width / 2);
    assert.ok(slime.x > bounds.width / 2 && slime.x <= bounds.width - bounds.margin);
    for (const actor of battle.actors) {
      assert.ok(actor.y >= bounds.minY && actor.y <= bounds.maxY);
      assert.equal(actor.hp, actor.spec.maxHp);
    }
    points.add(`${warrior.x},${warrior.y},${slime.x},${slime.y}`);
    assert.notEqual(warrior.y, slime.y);
  }
  assert.equal(points.size, 200);
});

test('both fighters approach in two dimensions, stay in the lane and retain left/right order', () => {
  const battle = createBattle({ random: seeded(42) });
  battle.warmupMs = 0;
  const [warrior, slime] = battle.actors, origins = battle.actors.map(actor => ({ ...actor }));
  const gap = distance(warrior, slime);
  updateBattle(battle, 500);
  assert.ok(warrior.x > origins[0].x && slime.x < origins[1].x);
  assert.ok(distance(warrior, slime) < gap);
  assert.ok(Math.abs(warrior.y - slime.y) < Math.abs(origins[0].y - origins[1].y));
  assert.equal(warrior.state, 'moving'); assert.equal(slime.state, 'moving');
  for (let step = 0; step < 1000; step++) {
    updateBattle(battle, STEP_MS);
    assert.ok(warrior.x < slime.x);
    for (const actor of battle.actors) {
      assert.ok(actor.x >= battle.bounds.margin && actor.x <= battle.bounds.width - battle.bounds.margin);
      assert.ok(actor.y >= battle.bounds.minY && actor.y <= battle.bounds.maxY);
    }
  }
});

test('damage lands once on the downswing/lunge frame and a committed swing survives a hit', () => {
  const overhead = asset('warrior/motions/attack-overhead/manifest.json');
  const lunge = asset('enemies/slime/motions/attack/manifest.json');
  assert.equal(DEFAULT_STATS.warrior.attackMotion, overhead.motion);
  assert.equal(DEFAULT_STATS.warrior.impactMs, overhead.frames[0].durationMs + overhead.frames[1].durationMs);
  assert.equal(DEFAULT_STATS.slime.impactMs, lunge.frames[0].durationMs);
  assert.equal(DEFAULT_STATS.warrior.attackDurationMs, overhead.durationMs);
  assert.equal(DEFAULT_STATS.slime.attackDurationMs, lunge.durationMs);
  const battle = melee(), [warrior, slime] = battle.actors;
  assert.deepEqual(updateBattle(battle, STEP_MS), []);
  assert.ok(battle.actors.every(actor => actor.state === 'attacking'));
  assert.deepEqual(updateBattle(battle, STEP_MS * 9), []); // 150ms of windup.
  const first = updateBattle(battle, STEP_MS);
  assert.equal(first.length, 1); assert.equal(first[0].source, 'slime');
  assert.equal(warrior.hp, 108); assert.equal(warrior.state, 'attacking');
  assert.deepEqual(updateBattle(battle, STEP_MS * 10), []); // 333ms: still winding up.
  const second = updateBattle(battle, STEP_MS);
  assert.equal(second.length, 1); assert.equal(second[0].source, 'warrior');
  assert.equal(slime.hp, 78);
  assert.deepEqual(updateBattle(battle, 500), []); // No repeated damage during recovery.
});

test('an attack that loses range during its windup does not damage its target', () => {
  const battle = melee();
  updateBattle(battle, STEP_MS);
  battle.actors[1].x = 850;
  const events = updateBattle(battle, 400);
  assert.equal(events.length, 0);
  assert.equal(battle.actors[0].hp, 120); assert.equal(battle.actors[1].hp, 96);
});

test('lethal damage finishes the battle, clamps HP and leaves the defeated fighter down', () => {
  const battle = melee({ slime: { maxHp: 18 } });
  const events = updateBattle(battle, 1000);
  assert.equal(battle.status, 'finished'); assert.equal(battle.winner, 'warrior');
  assert.equal(events.filter(event => event.type === 'finished').length, 1);
  const dead = battle.actors[1], elapsed = battle.elapsedMs;
  assert.equal(dead.hp, 0); assert.equal(dead.state, 'down');
  const position = { x: dead.x, y: dead.y };
  assert.deepEqual(updateBattle(battle, 20000), []);
  assert.equal(battle.elapsedMs, elapsed); assert.deepEqual({ x: dead.x, y: dead.y }, position);
  assert.equal(dead.state, 'down');
  const down = asset('enemies/slime/motions/down/manifest.json'), idle = asset('enemies/slime/motions/idle/manifest.json');
  assert.equal(sample(down, idle, dead.stateTimeMs).phase, 'hold');
  assert.equal(sample(down, idle, dead.stateTimeMs).frame, down.frameSequence.at(-1));
});

test('same-tick lethal attacks trade fairly and produce a draw', () => {
  const common = { maxHp: 10, damage: 10, impactMs: 160 };
  const battle = melee({ warrior: common, slime: common });
  const events = updateBattle(battle, 300);
  assert.equal(events.filter(event => event.type === 'damage').length, 2);
  assert.equal(battle.status, 'finished'); assert.equal(battle.winner, 'draw');
  assert.ok(battle.actors.every(actor => actor.hp === 0 && actor.state === 'down'));
});

test('the slime can win and a dead fighter cannot finish a pending attack', () => {
  const battle = melee({ warrior: { maxHp: 12 } });
  const events = updateBattle(battle, 1000);
  assert.equal(battle.winner, 'slime'); assert.equal(battle.actors[0].state, 'down');
  assert.equal(battle.actors[1].hp, 96);
  assert.deepEqual(events.filter(event => event.type === 'damage').map(event => event.source), ['slime']);
  const down = asset('warrior/motions/down/manifest.json'), idle = asset('warrior/manifest.json');
  updateBattle(battle, 10000);
  assert.equal(sample(down, idle, battle.actors[0].stateTimeMs).phase, 'hold');
});

test('fixed steps give the same result with irregular render frames or one large update', () => {
  const once = createBattle({ random: seeded(17) }), frames = createBattle({ random: seeded(17) });
  const expected = updateBattle(once, 18000), actual = [];
  let remaining = 18000, index = 0;
  while (remaining > 0) {
    const dt = Math.min(remaining, [7, 16, 33, 91, 4][index++ % 5]);
    actual.push(...updateBattle(frames, dt)); remaining -= dt;
  }
  assert.deepEqual(actual, expected); assert.deepEqual(frames.actors, once.actors);
  assert.equal(frames.elapsedMs, once.elapsedMs);
});

test('200 different starting positions all produce mutual attacks and a completed battle', () => {
  for (let seed = 0; seed < 200; seed++) {
    const battle = createBattle({ random: seeded(seed) });
    const events = updateBattle(battle, 20000), sources = new Set(events.filter(event => event.type === 'damage').map(event => event.source));
    assert.equal(battle.status, 'finished', `Seed ${seed} must finish`);
    assert.deepEqual([...sources].sort(), ['slime', 'warrior']);
    assert.ok(battle.actors.every(actor => actor.hp >= 0));
  }
});

test('invalid elapsed time is rejected without modifying the battle', () => {
  const battle = melee();
  for (const dt of [-1, NaN, Infinity]) assert.throws(() => updateBattle(battle, dt), RangeError);
  assert.equal(battle.elapsedMs, 0); assert.deepEqual(updateBattle(battle, 0), []);
});
