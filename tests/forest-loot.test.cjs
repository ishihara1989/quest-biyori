'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const L = require('../public/js/core/forest-loot.js'), S = require('../public/js/combat/forest-simulation.js');
test('only drops and gems are collectible; boss material rarities follow their sources', () => {
  assert.ok(D.ITEMS.every(item => ['material', 'consumable', 'gem'].includes(item.type)));
  for (const [id, enemy] of Object.entries(D.ENEMIES)) {
    const item = D.ITEMS.find(item => item.id === enemy.drop);
    assert.equal(item.rarity, id === 'treant' || enemy.majorBoss ? 'rare' : enemy.boss ? 'uncommon' : 'common');
  }
  assert.deepEqual(Object.values(D.RARITIES).map(r => r.color), ['#ffffff', '#7ddcff', '#b78aff', '#ff4fd8', '#ffc655','#c6eeff']);
  const legacy = D.freshSave(); legacy.inventory = { sword: 1, armor: 1, boots: 1, pendant: 1, jelly: 27, ruby: 2 };
  const migrated = D.readSave(JSON.stringify(legacy));
  assert.equal(migrated.inventory.jelly, 27); assert.equal(migrated.inventory.ruby, undefined);
  for (const id of ['sword', 'armor', 'boots', 'pendant']) assert.equal(migrated.inventory[id], undefined);
});
test('gem rolls use absolute rare, unique and desert legendary chances on bosses only',()=>{
  assert.equal((D.rollGems('slime',()=>0)[0] ?? null),null);for(const [p,r] of [[0,'unique'],[.005,'rare'],[.05499,'rare'],[.055,null]])assert.equal((D.rollGems('treant',()=>p)[0] ?? null)?.rarity||null,r);
  for(const [p,r] of [[0,'legendary'],[.0005,'unique'],[.0055,'rare'],[.0555,null]])assert.equal((D.rollGems('sand-behemoth',()=>p)[0] ?? null)?.rarity||null,r);
});

test('directional and shared capacity is charged per random gem instance',()=>{
  const save=D.freshSave();save.cleared=[1,2,3,4];save.progression.characters.mage.xp=P.experience(4);
  const a=P.addGem(save,'rare-physical',1,()=>.5),b=P.addGem(save,'rare-magic',1,()=>.5);
  assert.deepEqual(P.gemCosts(save,'warrior','weapon',a.id),{attack:100});assert.equal(P.equipGem(save,'warrior','weapon',a.id),true);
  assert.equal(P.equipGem(save,'mage','weapon',a.id),false);assert.equal(P.equipGem(save,'mage','weapon',b.id),true);assert.deepEqual(D.readSave(JSON.stringify(save)),save);
});

test('numeric unique options have higher values and capacity efficiency than rare equivalents',()=>{
  const G=P.Gem,u=G.generate({rarity:'unique',family:'physical',level:1,random:()=>.25});
  for(const o of u.options){const r=G.generate({rarity:'rare',family:o.key,level:1,size:1,random:()=>.5});assert.ok(G.describe(u).effect[G.OPTIONS[o.key].key]>G.describe(r).effect[G.OPTIONS[o.key].key]);}
  assert.equal(Object.values(G.describe(u).costs).reduce((a,b)=>a+b,0),340);
  for(const [job,family] of [['warrior','physical'],['mage','magic']]){const save=D.freshSave();save.cleared=[1,2,3,4];const before=P.stats(save,job);const g=P.addGem(save,'rare-'+family,1,()=>.5);assert.equal(P.equipGem(save,job,'weapon',g.id),true);assert.ok(P.stats(save,job).damage>before.damage);assert.equal(P.stats(save,job).baseDamage,before.baseDamage);}
});

test('range gems extend actual skill parameters and scale gently with regional level',()=>{
  const G=P.Gem,g=G.generate({rarity:'unique',family:'range',level:1,random:()=>.5});const effect=G.describe(g).effect;
  assert.ok(G.describe({...g,level:6}).effect.skillRange>effect.skillRange);
  const M=require('../public/js/skills/mage-skills.js');assert.ok(M.spec('fireball',1,0,effect).radius>M.spec('fireball',1,0,{}).radius);
});

test('reward reveal is sorted, four chest frames precede items, and auto repeat waits for all loot', () => {
  const plan = L.presentation({ 'unique-range': 1, crystal: 2, jelly: 14, wood: 1, 'rare-physical': 3, potion: 1, pendant: 1 }, 350);
  assert.deepEqual(plan.entries.map(e => e.rarity), ['common', 'common', 'uncommon', 'rare', 'rare', 'unique']);
  assert.deepEqual([0, 350, 650, 1000, 1500].map(t => L.chestFrame(t)), [0, 1, 2, 3, 3]);
  assert.equal(plan.entries[0].at, L.CHEST_END);
  assert.ok(plan.entries.every((e, i) => !i || e.at > plan.entries[i - 1].at));
  assert.ok(plan.completeAt > plan.entries.at(-1).at);
  assert.equal(plan.repeatAt - plan.completeAt, 5000);
  assert.equal(plan.entries.find(e => e.id === 'rare-physical').count, 3);
  const quiet = L.presentation({ 'unique-range': 1, jelly: 4 }, 0, { reduced: true });
  assert.equal(quiet.completeAt, 0); assert.ok(quiet.entries.every(e => e.at === 0));
  assert.equal(L.chestFrame(0, true), 3);
  assert.equal(L.presentation({}, 0).repeatAt, L.CHEST_END + 5000 + 650);
});
test('generated chest and new gem images exist and retain real alpha', () => {
  const { PNG } = require('pngjs');
  const base = path.join(__dirname, '../public/assets/ui');
  const newGems = ['edgegem', 'arcanegem', 'quickgem', 'heartgem', 'clockgem', 'twinflare', 'wardleaf', 'prism', 'bosscrystal'];
  for (const file of ['loot/chest-opening.png', ...[1, 2, 3, 4].map(i => 'loot/chest-' + i + '.png'), ...newGems.map(id => 'items/' + id + '.png')]) {
    const image = PNG.sync.read(fs.readFileSync(path.join(base, file)));
    assert.ok(image.width > 0); assert.ok(image.data.some((value, i) => i % 4 === 3 && value === 0), file);
  }
});
