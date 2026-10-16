'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const D = require('../public/js/data/forest-data.js');
const S = require('../public/js/combat/forest-simulation.js');
const seeded = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
const finish = run => { for (let i = 0; i < 1800 && run.status === 'running'; i++) S.update(run, 100); return run; };
const lastWave = id => {
  const run = S.createRun(id, { random: () => 0.5 });
  run.wave = 1; run.enemies.forEach(enemy => { enemy.hp = 0; }); S.update(run, 1700);
  return run;
};

test('the ten stage lineups match the requested families and exclusions', () => {
  const expected = [
    ['slime'], ['slime', 'boss-slime'], ['boar', 'boss-boar'], ['alraune-minion', 'alraune'],
    ['slime', 'boar', 'alraune-minion'], ['slime', 'boss-slime', 'boar', 'boss-boar'],
    ['slime', 'boss-slime', 'alraune-minion', 'alraune'], ['boar', 'boss-boar', 'alraune-minion', 'alraune'],
    ['slime', 'boss-slime', 'boar', 'boss-boar', 'alraune-minion', 'alraune'],
    Object.keys(D.ENEMIES).filter(id => !D.ENEMIES[id].region || D.ENEMIES[id].region === 1),
  ];
  const forest = D.STAGES.filter(s => s.region === 1);
  assert.equal(forest.length, 10);
  forest.forEach((stage, i) => {
    assert.deepEqual([...stage.enemies].sort(), expected[i].sort());
    assert.equal(stage.waves.length, 3);
  });
  assert.ok(D.STAGES[4].total >= 30);
  assert.ok(D.STAGES[9].waves.at(-1).includes('treant'));
});

test('initial equipment clears the first stage across 100 random layouts without potions', () => {
  for (let seed = 0; seed < 100; seed++) {
    const run = finish(S.createRun(1, { random: seeded(seed) }));
    assert.equal(run.status, 'victory', 'seed ' + seed);
    assert.equal(run.kills, D.STAGES[0].total);
    assert.ok(run.hero.hp > 0);
    assert.ok(run.elapsed < 40000);
  }
});

test('fixed-step updates give identical results for different rendering frame intervals', () => {
  const a = S.createRun(1, { random: seeded(52) }), b = S.createRun(1, { random: seeded(52) });
  S.update(a, 9000);
  for (let i = 0; i < 360; i++) S.update(b, 25);
  assert.deepEqual(a.hero, b.hero);
  assert.deepEqual(a.enemies, b.enemies);
  assert.equal(a.kills, b.kills);
});

test('victory fires once and stops further damage, kills and gold awards', () => {
  const run = S.createRun(1, { random: seeded(5) }), events = [];
  for (let i = 0; i < 1200; i++) events.push(...S.update(run, 100));
  assert.equal(events.filter(e => e.type === 'finished').length, 1);
  const before = [run.hero.hp, run.kills, run.gold, run.elapsed];
  assert.deepEqual(S.update(run, 10000), []);
  assert.deepEqual([run.hero.hp, run.kills, run.gold, run.elapsed], before);
});

test('boss slime splits once per completed split and the summoned enemy must also be defeated', () => {
  const run = lastWave(2), boss = run.enemies.find(e => e.type === 'boss-slime');
  boss.state = 'splitting'; boss.motion = 'split'; boss.time = 0; boss.hp = 5000;
  const before = run.enemies.length;
  assert.equal(S.update(run, 3780).filter(e => e.type === 'summon').length, 0);
  const events = S.update(run, 50);
  assert.equal(events.filter(e => e.type === 'summon').length, 1);
  assert.equal(run.enemies.length, before + 1);
  assert.ok(boss.special > 7900 && boss.special <= 8000);
  const summoned = run.enemies.at(-1);
  run.enemies.forEach(enemy => { if (enemy !== summoned) enemy.hp = 0; });
  summoned.hp = 5000;
  S.update(run, S.STEP);
  assert.equal(run.status, 'running');
});

test('boss boar finishes its windup and charge instead of resetting the attack clock', () => {
  const run = lastWave(3), boss = run.enemies.find(e => e.type === 'boss-boar');
  run.hero.x = 250; run.hero.hp = 10000; run.hero.maxHp = 10000;
  boss.x = 480; boss.hp = 10000; boss.state = 'windup'; boss.motion = 'charge-windup'; boss.time = 0;
  S.update(run, 700); assert.equal(boss.state, 'windup');
  const events = S.update(run, 4800);
  assert.ok(events.some(e => e.type === 'damage' && e.source === boss.id));
  assert.notEqual(boss.state, 'attacking');
});

test('plant and treant attacks launch delayed projectiles and ground impacts', () => {
  for (const [id, type, motion, kind] of [[4, 'alraune', 'seed-burst', 'seed'], [10, 'treant', 'root-bury', 'root']]) {
    const run = lastWave(id), boss = run.enemies.find(e => e.type === type);
    run.hero.hp = 10000; run.hero.maxHp = 10000;
    boss.hp = 10000; boss.state = 'attacking'; boss.motion = motion; boss.time = 0; boss.hit = false;
    boss.attackImpact = motion === 'seed-burst' ? 0 : 340; boss.attackDuration = 900;
    const events = S.update(run, 1200);
    assert.ok(events.some(e => e.type === 'cast' && e.kind === kind));
    assert.ok(events.some(e => e.type === 'impact' && e.kind === kind));
  }
});

test('potions heal only living, injured players in an active battle', () => {
  const run = S.createRun();
  assert.equal(S.heal(run), 0);
  run.hero.hp = 200; assert.equal(S.heal(run), 126); assert.equal(run.hero.hp, 326);
  assert.equal(S.heal(run), 94); assert.equal(run.hero.hp, 420);
  run.status = 'defeat'; run.hero.hp = 0; assert.equal(S.heal(run), 0);
});

test('rewards unlock the next stage and first-clear items are awarded only once', () => {
  const save = D.freshSave();
  assert.equal(D.isUnlocked(save, 2), false);
  const first = D.award(save, 1);
  assert.equal(first.first, true); assert.equal(save.inventory.potion, 4);
  assert.equal(D.isUnlocked(save, 2), true); assert.equal(D.isUnlocked(save, 3), false);
  const second = D.award(save, 1);
  assert.equal(second.first, false); assert.equal(save.inventory.potion, 4); assert.deepEqual(save.cleared, [1]);
  assert.equal(save.gold, 40);
  D.award(save, 10); D.award(save, 10); assert.equal(save.inventory.pendant, undefined);
  assert.equal(D.ITEMS.some(item => item.type === 'equipment'), false);
});

test('save roundtrips retain progression, inventory and settings; corrupted saves recover', () => {
  const save = D.freshSave(); D.award(save, 1);
  save.inventory.jelly = 12; save.selectedStage = 2; save.speed = 2; save.autoMode = 'off';
  assert.deepEqual(D.readSave(JSON.stringify(save)), save);
  assert.deepEqual(D.readSave('{bad json'), D.freshSave());
  assert.deepEqual(D.readSave('null'), D.freshSave());
  const dirty = D.readSave(JSON.stringify({ version: D.SAVE_VERSION, gold: -42, cleared: [1, 1, 101, '3'], selectedStage: 10, inventory: { potion: -1, jelly: 3 } }));
  assert.deepEqual(dirty.cleared, [1]); assert.equal(dirty.gold, 0); assert.equal(dirty.selectedStage, 1);
  assert.equal(dirty.inventory.potion, 3); assert.equal(dirty.inventory.jelly, 3);
});

test('every combat motion and generated icon consumed by the game exists', () => {
  const asset = (...parts) => path.join(__dirname, '../public/assets', ...parts);
  for (const id of Object.keys(D.ENEMIES)) {
    const base = asset('enemies', id, 'motions');
    const list = JSON.parse(fs.readFileSync(path.join(base, 'index.json'), 'utf8'));
    for (const entry of list) {
      const filename = path.join(base, entry.manifest), manifest = JSON.parse(fs.readFileSync(filename, 'utf8'));
      assert.ok(fs.existsSync(path.join(path.dirname(filename), manifest.sheet)));
    }
    assert.ok(fs.existsSync(asset('ui', 'enemies', id + '.png')));
  }
  for (const item of D.ITEMS) assert.ok(fs.existsSync(item.image?path.resolve(__dirname,'../public',item.image):asset('ui', 'items', item.id + '.png')));
});
