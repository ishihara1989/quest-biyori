'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths, { PNG } = require('pngjs');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js'), S = require('../public/js/combat/forest-simulation.js');
const stages = D.STAGES.filter(s => s.region === 2);
const seeded = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
function drops(stage) {
  const counts = { gold: stage.reward };
  for (const type of stage.waves.flat()) {
    const e = D.ENEMIES[type]; counts[e.common] = (counts[e.common] || 0) + (e.boss ? 1 : .3); counts.gold += e.gold;
    if (e.boss) counts['swamp-crystal'] = (counts['swamp-crystal'] || 0) + (e.majorBoss ? 1 : .3);
    if (e.majorBoss) counts['hydra-scale'] = .3;
  }
  return counts;
}
function baseline(stage) {
  return require('../tools/balance/audit-balance.cjs').referenceBuild(stage, stage - 1).builds;
}
function encounter(type, stage = 14) {
  const run = S.createRun(stage, { random: () => .5 });
  run.wave = 2; run.enemies.forEach(e => { e.hp = 0; }); run.wave = 1; S.update(run, 1700);
  run.enemies = run.enemies.filter(e => e.type === type);
  const enemy = run.enemies[0]; assert.ok(enemy);
  run.hero.hp = run.hero.maxHp = 1e5; run.hero.damage = 0; run.hero.cooldown = 1e6; run.hero.skill = 1e6; run.hero.speed = 0;
  enemy.hp = enemy.maxHp = 1e5; enemy.x = run.hero.x + 100; enemy.y = run.hero.y; enemy.cooldown = 1e6;
  return { run, enemy };
}
test('swamp has ten three-wave stages with requested families, Lv.11–20 and the hydra finale', () => {
  const expected = [['giga-toad','mud-hand','skeleton'], ['giga-toad','king-toad'], ['mud-hand','mud-giant'], ['skeleton','lich'], ['giga-toad','mud-hand','skeleton'],
    ['giga-toad','king-toad','mud-hand','mud-giant'], ['giga-toad','king-toad','skeleton','lich'], ['mud-hand','mud-giant','skeleton','lich'],
    ['giga-toad','king-toad','mud-hand','mud-giant','skeleton','lich'], ['giga-toad','king-toad','mud-hand','mud-giant','skeleton','lich','hydra']];
  assert.equal(stages.length, 10);
  stages.forEach((s, i) => { assert.equal(s.number, i + 1); assert.equal(s.level, i + 11); assert.equal(s.waves.length, 3); assert.deepEqual([...s.enemies].sort(), expected[i].sort()); assert.equal(D.stageLabel(s.id), '2-' + (i + 1)); });
  assert.equal(stages[4].total, 36); assert.ok(stages[9].waves[2].includes('hydra'));
});
test('forest-to-swamp unlock, final farming and defeat fallback survive save roundtrips', () => {
  const save = D.freshSave(); assert.equal(D.isUnlocked(save, 11), false); D.award(save, 10); assert.equal(D.isUnlocked(save, 11), true);
  save.autoMode = 'advance'; assert.deepEqual(D.autoDestination(save, 10, true), { stage: 11, mode: 'advance' });
  save.cleared = D.STAGES.map(s => s.id); save.selectedStage = 20; save.inventory['hydra-scale'] = 9; save.inventory['swamp-crystal'] = 17;
  save.progression.characters.mage.xp = P.experience(4); P.recruitNinja(save); P.recruitShaman(save); P.recruitMiko(save);
  assert.deepEqual(D.readSave(JSON.stringify(save)), save); assert.deepEqual(D.autoDestination(save, 20, true), { stage: 21, mode: 'advance' });
  assert.deepEqual(D.autoDestination(save, 11, false), { stage: 10, mode: 'same' }); assert.equal(D.isUnlocked(save, 21), true);
});
test('swamp common, regional crystal, rare boss material and gems follow policy boundaries', () => {
  for (const id of ['giga-toad','mud-hand','skeleton']) { assert.deepEqual(D.rollMaterials(id, () => .2999), [D.ENEMIES[id].common]); assert.deepEqual(D.rollMaterials(id, () => .3), []); assert.equal((D.rollGems(id, () => 0)[0] ?? null), null); }
  for (const id of ['king-toad','mud-giant','lich']) { assert.deepEqual(D.rollMaterials(id, () => .3), [D.ENEMIES[id].common]); assert.deepEqual(D.rollMaterials(id, () => .2999), [D.ENEMIES[id].common,'swamp-crystal']); }
  assert.deepEqual(D.rollMaterials('hydra', () => .3), ['venom-sac','swamp-crystal']); assert.deepEqual(D.rollMaterials('hydra', () => .2999), ['venom-sac','swamp-crystal','hydra-scale']);
  for (const id of ['king-toad','mud-giant','lich','hydra']) for (const [chance, rarity] of [[.004999,'unique'],[.005,'rare'],[.054999,'rare'],[.055,null]]) {
    const values = [chance,0], gem = (D.rollGems(id, () => values.shift() ?? .5)[0] ?? null); assert.equal(gem ? gem.rarity : null, rarity);
  }
});
test('swamp 10 normalized XP needs 1, 3, 9, 27, 81, 243 clears and displays only progress', () => {
  const save = D.freshSave(), c = save.progression.characters.warrior;
  for (let lv = 19; lv <= 24; lv++) { c.xp = P.experience(lv); const count = 3 ** (lv - 19); for (let i = 0; i < count - 1; i++) P.gainXp(save, 20); assert.equal(c.xp.level, lv); P.gainXp(save, 20); assert.deepEqual(c.xp, P.experience(lv + 1)); }
  c.xp = P.experience(39); P.gainXp(save, 20); assert.deepEqual(c.xp, P.experience(39));
});
test('regional gear trees keep independent milestones, 300-clear budgets and affordable mains', () => {
  for (const id of Object.keys(P.CHARACTERS)) for (const slot of ['weapon','armor']) {
    const nodes = P.gearTree(id, slot, 2), costs = {};
    assert.equal(nodes.length, 100); assert.equal(nodes.filter(n => n.main).length, 10); assert.equal(nodes.filter(n => n.depth && !n.unique).length, 80);
    for (const n of nodes) { assert.ok(n.requires.every(req => P.allGearTrees(id, slot).some(p => p.id === req))); for (const [k,v] of Object.entries(n.cost)) costs[k] = (costs[k] || 0) + v; }
    assert.equal(costs['hydra-scale'], 90);
    const income = drops(stages[9]), clears = Math.max(...Object.entries(costs).map(([k,v]) => v / income[k])); assert.ok(clears >= 290 && clears <= 310, JSON.stringify({costs,income,clears}));
    for (const n of nodes.filter(n => n.main)) { const income = drops(D.STAGES[n.stage - 1]); assert.ok(Object.entries(n.cost).every(([k,v]) => 2*v / income[k] <= 3)); assert.equal(n.cost['hydra-scale'], undefined); }
  }
  const save = D.freshSave(); save.cleared = D.STAGES.map(s => s.id); const c = save.progression.characters.warrior;
  c.weapon = P.allGearTrees('warrior','weapon').map(n => n.id); assert.equal(P.capacity(save,'warrior','weapon').common, 50+50*D.REGIONS.length);
  assert.deepEqual(D.readSave(JSON.stringify(save)).progression.characters.warrior.weapon, c.weapon);
});
test('lich chants twice then summons exactly four skeletons once, which block wave completion', () => {
  const {run,enemy} = encounter('lich'); enemy.attacks = 2; S.startSwampAttack(run,enemy,run.hero,[]);
  assert.equal(enemy.motion,'chant'); assert.equal(S.update(run,enemy.swampPlan.parts[0].duration-S.STEP).filter(e => e.type === 'summon').length,0);
  const events = S.update(run,470); assert.equal(events.filter(e => e.type === 'summon').length,4);
  assert.equal(run.enemies.filter(e => e.type === 'skeleton').length,4); assert.equal(S.update(run,900).filter(e => e.type === 'summon').length,0);
  assert.equal(run.extraEnemies,4);
  enemy.hp = 0; S.update(run,100); assert.equal(run.status,'running'); assert.equal(run.phase,'combat');
  run.enemies.forEach(e => { e.hp = 0; }); S.update(run,100); assert.equal(run.status,'victory');
});
test('dead and interrupted lich casts do not release skeletons; the cap never produces a partial summon', () => {
  for (const mode of ['dead','stagger','cap']) {
    const {run,enemy} = encounter('lich'); enemy.attacks = 2; S.startSwampAttack(run,enemy,run.hero,[]); S.update(run,900);
    if (mode === 'dead') enemy.hp = 0;
    if (mode === 'stagger') enemy.stagger = 3000;
    if (mode === 'cap') for (let i = 0; i < 20; i++) run.enemies.push({...enemy,id:'filler-'+i,type:'skeleton',swampPlan:null,cooldown:1e6});
    assert.equal(S.update(run,2900).filter(e => e.type === 'summon').length,0,mode);
  }
});
test('poison ticks four times and roots hold the hit coordinate, then clear at death or battle end', () => {
  const {run,enemy} = encounter('lich'); const events=[]; S.applyStatus(run,run.hero,'poison',enemy,events);
  const hp=run.hero.hp; const ticks=S.update(run,4000).filter(e=>e.type==='damage'&&e.source===enemy.id); assert.equal(ticks.length,4); assert.ok(run.hero.hp<hp);
  S.applyStatus(run,run.hero,'root',enemy,events); const anchor={x:run.hero.x,y:run.hero.y}; run.hero.speed=150;
  run.hero.x+=80; S.update(run,1000); assert.equal(run.hero.x,anchor.x); assert.equal(run.hero.y,anchor.y);
  S.update(run,1300); assert.equal(run.hero.rootAnchor,null);
  S.applyStatus(run,run.hero,'poison',enemy,events); S.applyStatus(run,run.hero,'root',enemy,events); enemy.hp=0; S.update(run,100); assert.equal(run.hero.poison,null); assert.equal(run.hero.rootAnchor,null);
});
test('hydra performs eight timed bites and the full charge-to-breath sequence', () => {
  const {run,enemy}=encounter('hydra',20); S.startSwampAttack(run,enemy,run.hero,[]);
  assert.equal(S.update(run,1550).filter(e=>e.type==='damage'&&e.source===enemy.id).length,8);
  S.startSwampAttack(run,enemy,run.hero,[]); assert.equal(enemy.motion,'charge'); assert.equal(S.update(run,enemy.swampPlan.parts[0].duration-S.STEP).filter(e=>e.type==='swamp-effect').length,0);
  const events=S.update(run,300); assert.ok(events.some(e=>e.effect==='hydra-poison-breath')); assert.ok(run.hero.poison);
});
test('swamp simulation is deterministic across frame rates, including delayed attacks and summons', () => {
  const a=S.createRun(14,{builds:baseline(14),random:seeded(22)}), b=S.createRun(14,{builds:baseline(14),random:seeded(22)});
  S.update(a,12000); for(let i=0;i<480;i++)S.update(b,25); assert.deepEqual(a.enemies,b.enemies); assert.deepEqual(a.hero,b.hero); assert.deepEqual(a.allies,b.allies);
});
test('every swamp stage clears at the intended level with prior mains and top-first actives, without branches or gems', () => {
  for (let stage=11;stage<=20;stage++) for(let seed=0;seed<30;seed++) {
    const run=S.createRun(stage,{builds:baseline(stage),random:seeded(seed)});
    for(let time=0;time<180000&&run.status==='running';time+=100)S.update(run,100);
    assert.equal(run.status,'victory','stage '+stage+' seed '+seed+' kills '+run.kills+' hp '+run.hero.hp); assert.ok(run.hero.hp>0||run.allies.some(a=>a.hp>0));
  }
});
test('all swamp loot and enemy icons exist as readable transparent PNGs', () => {
  for (const [folder,ids] of [['items',['venom-sac','living-mud','cursed-bone','swamp-crystal','hydra-scale']],['enemies',Object.keys(D.ENEMIES).filter(id=>D.ENEMIES[id].region===2)]]) for (const id of ids) {
    const png=PNG.sync.read(fs.readFileSync(path.join(__dirname,'../public/assets/ui',folder,id+'.png'))); assert.equal(png.width,128);assert.equal(png.height,128);
    let clear=0,solid=0;for(let i=3;i<png.data.length;i+=4){if(png.data[i]===0)clear++;if(png.data[i]>200)solid++;}assert.ok(clear>500);assert.ok(solid>1000);
  }
});
