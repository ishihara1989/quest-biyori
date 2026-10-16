'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const G = require('../public/js/core/gem-system.js'), P = require('../public/js/core/forest-progression.js'), D = require('../public/js/data/forest-data.js');
const S = require('../public/js/combat/forest-simulation.js'), I = require('../public/js/combat/action-interference.js'), L = require('../public/js/core/forest-loot.js');
const rng = seed => () => {seed=(1664525*seed+1013904223)>>>0;return seed/2**32;};
const fixture = () => {const save=D.freshSave();save.cleared=D.STAGES.map(s=>s.id);return save;};
const add = (save,rarity='rare',family='physical',level=1) => P.addGem(save,G.generate({rarity,family,level,size:1,random:()=>.5}));

test('random gems always have a usable build, valid budget, correct tier and exact capacity',()=>{
  for(const [rarity,tier] of Object.entries(G.TIERS).filter(([,tier])=>!tier.fixed))for(const family of Object.keys(G.OPTIONS).filter(key=>G.TYPES[rarity+'-'+key]))for(let seed=1;seed<=100;seed++){
    const gem=G.generate({rarity,family,level:rarity==='legendary'?6:1,random:rng(seed)}),g=G.describe(gem);
    assert.ok(G.validate(gem));assert.ok(g.jobs.length);assert.equal(gem.options[0].key,family);
    assert.ok(gem.quality>=.95&&gem.quality<=1.05);assert.equal(gem.options.length,tier.count);
    assert.ok(!gem.options.some(o=>o.key==='physical')||!gem.options.some(o=>o.key==='magic'));
    assert.ok(Object.keys(g.costs).every(d=>G.DIRECTIONS.includes(d)));
    assert.ok(!(g.costs.attack && g.costs.defense),rarity+'/'+family+'/'+seed);
    assert.equal(Object.values(g.costs).reduce((a,b)=>a+b,0),tier.capacity*gem.size);
    if(rarity==='rare')assert.ok(gem.options.every(o=>!G.OPTIONS[o.key].min));
    if(rarity==='legendary')assert.equal(gem.options.filter(o=>G.OPTIONS[o.key].min===2).length,1);
    if(gem.options.some(o=>o.key==='fortune')){const weight=gem.options.find(o=>o.key==='fortune').weight;assert.equal(g.effect.treasureHunt,Number(((.1+.02*gem.level)*weight/1.15).toFixed(5)));}
  }
});

test('attack and defense remain exclusive for every primary family and boundary roll without excluding utility mixes',()=>{
  const combinations=new Set();
  for(const rarity of Object.keys(G.TIERS))for(const family of Object.keys(G.OPTIONS).filter(key=>G.TYPES[rarity+'-'+key]))for(const value of [0,.5,1-Number.EPSILON]){
    const gem=G.generate({rarity,family,level:rarity==='legendary'?6:1,random:()=>value});
    assert.ok(gem);assert.ok(G.validate(gem));assert.equal(gem.family,family);
    const costs=G.describe(gem).costs;assert.ok(!(costs.attack&&costs.defense));
    combinations.add(Object.keys(costs).sort().join(','));
  }
  assert.ok(combinations.has('attack,utility'));assert.ok(combinations.has('defense,utility'));
});

test('regional values and fixed unique effects grow while rolls remain preserved',()=>{
  const a=G.generate({rarity:'unique',family:'interference',level:5,random:()=>.5});
  const b={...a,level:10};assert.ok(Math.abs(G.describe(a).effect.interferencePower*1.5-G.describe(b).effect.interferencePower)<1e-8);
  const physical=G.generate({rarity:'rare',family:'physical',level:1,size:1,random:()=>.5});
  assert.ok(G.describe({...physical,level:6}).effect.weaponFlat>G.describe(physical).effect.weaponFlat*5);
  const fortune=G.generate({rarity:'unique',family:'fortune',level:1,random:()=>.5});assert.equal(G.describe(fortune).effect.treasureHunt,.12);
  assert.equal(G.generate({rarity:'rare',family:'interference'}),null);
  assert.equal(G.generate({rarity:'legendary',level:5}),null);
});

test('each equipment starts at 500 and a complete regional tree adds 200 directional plus 50 common',()=>{
  const save=fixture();for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
    const cap=P.capacity(save,job,slot);assert.equal([...G.DIRECTIONS,'common'].reduce((n,d)=>n+cap[d],0),500);
    assert.equal(cap.attack,slot==='weapon'?350:0);assert.equal(cap.defense,slot==='armor'?300:0);
    assert.ok(!Object.hasOwn(cap,'weapon')&&!Object.hasOwn(cap,'magic'));
    save.progression.characters[job][slot]=P.gearTree(job,slot,1).map(n=>n.id);
    const next=P.capacity(save,job,slot);assert.equal(G.DIRECTIONS.reduce((n,d)=>n+next[d]-cap[d],0),200);assert.equal(next.common-cap.common,50);
    assert.equal(next[slot==='weapon'?'attack':'defense']-cap[slot==='weapon'?'attack':'defense'],150);
    assert.ok(Math.abs(next.discount-.1)<1e-8);
    save.progression.characters[job][slot]=P.allGearTrees(job,slot).map(n=>n.id);assert.ok(P.capacity(save,job,slot).discount<=.4+1e-8);
  }
});

test('equipped instance effects and shared capacity are applied and removed without lingering combat buffs',()=>{
  const save=fixture();const gem=add(save);assert.equal(P.equipGem(save,'warrior','weapon',gem.id),true);
  assert.equal(P.gemCosts(save,'warrior','weapon',gem.id).attack,100);assert.equal(P.gemUsage(save,'warrior','weapon').used.attack,100);
  assert.ok(P.stats(save,'warrior').weaponDamage>P.stats(save,'warrior').baseDamage);
  assert.equal(P.equipGem(save,'mage','weapon',gem.id),false);
  const run=S.createRun(1,{builds:{warrior:P.stats(save,'warrior')}});assert.ok(run.hero.weaponFlat>0);
  P.unequipGem(save,'warrior','weapon',gem.id);S.applyBuilds(run,{warrior:P.stats(save,'warrior')});assert.equal(run.hero.weaponFlat,0);
  save.progression.characters.warrior.armor=P.allGearTrees('warrior','armor').map(n=>n.id);
  const hunt=add(save,'unique','fortune');assert.equal(P.equipGem(save,'warrior','armor',hunt.id),true);
  assert.equal(P.stats(save,'warrior').treasureHunt,.12);P.unequipGem(save,'warrior','armor',hunt.id);assert.equal(P.stats(save,'warrior').treasureHunt,0);
});

test('general and specialized attacks share the full weapon capacity and discount for every job',()=>{
  for(const job of Object.keys(P.CHARACTERS)){
    const save=fixture(),family=['mage','shaman','miko'].includes(job)?'magic':'physical';
    const general=add(save,'rare','attack'),specialized=add(save,'rare',family),extra=add(save,'rare','attack'),fourth=add(save,'rare','attack'),overflow=add(save,'rare','attack');
    assert.deepEqual(G.describe(specialized).costs,{attack:100});
    assert.ok(P.equipGem(save,job,'weapon',general.id));assert.ok(P.equipGem(save,job,'weapon',specialized.id));
    assert.ok(P.equipGem(save,job,'weapon',extra.id));assert.ok(P.equipGem(save,job,'weapon',fourth.id));
    const usage=P.gemUsage(save,job,'weapon');assert.equal(usage.used.attack,400);assert.equal(usage.used.common,50);
    assert.equal(P.equipGem(save,job,'weapon',overflow.id),false);
    save.progression.characters[job].weapon=P.gearTree(job,'weapon',1).map(n=>n.id);
    assert.equal(P.gemCosts(save,job,'weapon',general.id).attack,90);
    assert.equal(P.gemCosts(save,job,'weapon',specialized.id).attack,90);
    assert.equal(P.gemUsage(save,job,'weapon').used.common,0);assert.ok(P.equipGem(save,job,'weapon',overflow.id));
  }
});

test('craft guarantees only the selected primary family and spends the visible recipe atomically',()=>{
  const save=fixture(),recipe=G.craftRecipe('unique',6,'physical');Object.assign(save.inventory,recipe);
  save.inventory[G.shardKey('unique')]--;const before=JSON.stringify(save);assert.equal(G.craft(save,'unique',6,'physical',()=>.5),null);assert.equal(JSON.stringify(save),before);
  save.inventory[G.shardKey('unique')]++;
  const gem=G.craft(save,'unique',6,'physical',rng(12));assert.equal(gem.family,'physical');assert.equal(gem.level,6);
  assert.ok(gem.options.length>1);for(const key of Object.keys(recipe))assert.equal(save.inventory[key],0);
  assert.equal(G.craft(save,'unique',6,'physical'),null);assert.equal(save.gems.length,1);
  const locked=D.freshSave();Object.assign(locked.inventory,recipe);assert.equal(G.craft(locked,'unique',6,'physical'),null);assert.deepEqual(locked.inventory,{potion:3,...recipe});
});

test('upgrade retains ID, affixes, quality, lock and capacity; dismantling and conversions cannot duplicate gems',()=>{
  const save=fixture(),gem=add(save,'rare','physical');gem.locked=true;
  const original=structuredClone(gem),cap=G.describe(gem).costs,cost=G.upgradeRecipe(gem,6);Object.assign(save.inventory,cost);
  assert.equal(G.upgrade(save,gem.id,6),true);assert.deepEqual({...gem,level:1},original);assert.deepEqual(G.describe(gem).costs,cap);
  assert.equal(G.dismantle(save,gem.id),false);gem.locked=false;assert.equal(P.equipGem(save,'warrior','weapon',gem.id),true);
  assert.equal(G.dismantle(save,gem.id),false);P.unequipGem(save,'warrior','weapon',gem.id);
  assert.equal(G.dismantle(save,gem.id),true);assert.equal(G.dismantle(save,gem.id),false);assert.equal(save.inventory[G.shardKey('rare')],60);
  assert.equal(G.convert(save,'rare',6),true);assert.equal(save.inventory[G.shardKey('rare')],0);assert.equal(save.inventory[G.shardKey('unique')],6);
  assert.equal(G.convert(save,'rare',1),false);assert.equal(G.convert(save,'rare',-1),false);
  const again=G.generate({rarity:'rare',family:'physical',level:1,random:()=>.5});assert.ok(G.upgradeRecipe(again,6)[G.shardKey('rare')]>G.salvage({...again,level:6})-G.salvage(again));
});

test('legacy reset clears only gem state and new save restores validated individual rolls and equipment',()=>{
  const save=fixture();save.gold=123;save.inventory.wood=42;const c=save.progression.characters.warrior;c.xp=P.experience(30);
  c.weapon=P.allGearTrees('warrior','weapon').filter(n=>n.main&&n.stage<=30).map(n=>n.id);
  const gem=add(save);P.equipGem(save,'warrior','weapon',gem.id);
  const clean=D.readSave(JSON.stringify(save));assert.deepEqual(clean.gems,save.gems);assert.deepEqual(clean.progression.characters.warrior.gems,c.gems);
  const old=structuredClone(save);delete old.gemVersion;old.gems=[{id:1,type:'ruby'}];const migrated=D.readSave(JSON.stringify(old));
  assert.deepEqual(migrated.gems,[]);assert.deepEqual(migrated.progression.characters.warrior.gems,{weapon:[],armor:[]});
  assert.equal(migrated.gold,123);assert.equal(migrated.inventory.wood,42);assert.deepEqual(migrated.cleared,save.cleared);assert.deepEqual(migrated.progression.characters.warrior.weapon,c.weapon);assert.deepEqual(migrated.progression.characters.warrior.xp,c.xp);
  const broken=structuredClone(save);broken.gems[0].options[0].weight=999;assert.deepEqual(D.readSave(JSON.stringify(broken)).gems,[]);
});

test('treasure hunt is additive over items and multiplies the original exclusive rarity chances',()=>{
  const one=D.gemDropRates(6,.2),two=D.gemDropRates(6,.4);assert.ok(Math.abs(one.rare-.06)<1e-10);assert.ok(Math.abs(two.rare-.07)<1e-10);
  assert.ok(Math.abs(one.unique-.006)<1e-10);assert.ok(Math.abs(one.legendary-.0006)<1e-10);
  assert.equal(D.gemDropRates(5,.2).legendary,0);assert.ok(Math.abs(D.gemDropRates(6,100).rare-5.05)<1e-10);
  assert.equal((D.rollGems('slime',()=>0,.2)[0] ?? null),null);assert.equal((D.rollGems('sand-behemoth',()=>0)[0] ?? null).rarity,'legendary');
  let calls=0;const random=()=>calls++===0?.059:.5;assert.equal((D.rollGems('treant',random,.2)[0] ?? null).rarity,'rare');
  assert.ok(D.rollMaterials('treant',()=>.35,.2).includes('wood'));assert.ok(!D.rollMaterials('treant',()=>.35).includes('wood'));
});

test('normal and special-stage gem boosts grant whole drops plus fractions for every rarity',()=>{
  const count=(enemy,hunt,roll,options={})=>{
    let first=true;
    const gems=D.rollGems(enemy,()=>{if(first){first=false;return roll;}return .5;},hunt,options);
    return Object.fromEntries(['rare','unique','legendary'].map(r=>[r,gems.filter(g=>g.rarity===r).length]));
  };
  // 30x gives rare 150%, unique 15%, legendary 1.5%.
  assert.deepEqual(count('sand-behemoth',29,.999),{rare:1,unique:0,legendary:0});
  assert.deepEqual(count('sand-behemoth',29,.2),{rare:2,unique:0,legendary:0});
  assert.deepEqual(count('sand-behemoth',29,.01),{rare:1,unique:0,legendary:1});
  // A special-stage multiplier is applied once, in addition to treasure hunt.
  assert.deepEqual(count('treant',14,.2,{level:5,multiplier:2}),{rare:2,unique:0,legendary:0});
  assert.deepEqual(count('treant',49,.999),{rare:2,unique:0,legendary:0});
  assert.deepEqual(count('treant',49,.749999),{rare:3,unique:0,legendary:0});
  assert.deepEqual(count('treant',49,.75),{rare:2,unique:0,legendary:0});
  assert.deepEqual(count('sand-behemoth',199,.999),{rare:10,unique:1,legendary:0});
  // At 39x the fractional intervals exceed 100%; both ends of the wrapped interval must work.
  assert.deepEqual(count('sand-behemoth',38,.01),{rare:2,unique:0,legendary:1});
  assert.deepEqual(count('sand-behemoth',38,.999),{rare:2,unique:0,legendary:0});
  for(const [hunt,expected]of [[100,{rare:10100,unique:1010,legendary:101}],[38,{rare:3900,unique:390,legendary:39}]]){
    const total={rare:0,unique:0,legendary:0};
    for(let i=0;i<2000;i++){
      const counts=count('sand-behemoth',hunt,(i+.5)/2000);
      for(const r of Object.keys(total))total[r]+=counts[r];
    }
    assert.deepEqual(total,expected);
  }
  for(const id of ['slime','chaos-gate-1','missing-enemy'])assert.deepEqual(D.rollGems(id,()=>0,100),[]);
});

test('treasure hunt boosts common materials and crystals as well as regional rare materials',()=>{
  assert.deepEqual(D.rollMaterials('slime',()=>.35,.2),['jelly']);
  assert.deepEqual(D.rollMaterials('boss-slime',()=>.35,.2),['jelly','crystal']);
  for(const id of ['treant','hydra','ancient-titan','sand-behemoth']){
    const base=D.rollMaterials(id,()=>.35),boosted=D.rollMaterials(id,()=>.35,.2);
    assert.equal(base.length,2,id);assert.equal(boosted.length,3,id);
  }
  const rolls=[.19,.21,.35];
  assert.deepEqual(D.rollMaterials('treant',()=>rolls.shift(),.2),['flower','flower','crystal','wood']);
  assert.equal(rolls.length,0);
});

test('material rates guarantee one item per 100 percent and roll only the remainder',()=>{
  const count=(enemy,item,hunt,roll)=>D.rollMaterials(enemy,()=>roll,hunt).filter(id=>id===item).length;
  for(const [hunt,guaranteed] of [[0,1],[1,2],[2,3]]){
    assert.equal(count('boss-slime','jelly',hunt,.9999),guaranteed);
  }
  for(const [hunt,guaranteed] of [[.5,1],[1.5,2],[2.5,3]]){
    assert.equal(count('boss-slime','jelly',hunt,.4999),guaranteed+1);
    assert.equal(count('boss-slime','jelly',hunt,.5),guaranteed);
  }
  for(const [enemy,item] of [['slime','jelly'],['boss-slime','crystal'],['treant','wood'],['hydra','hydra-scale'],['ancient-titan','ancient-core'],['sand-behemoth','behemoth-horn']]){
    assert.equal(count(enemy,item,3,.1999),2,enemy+' at 120%');
    assert.equal(count(enemy,item,3,.2001),1,enemy+' at 120%');
    assert.equal(count(enemy,item,6,.0999),3,enemy+' at 210%');
    assert.equal(count(enemy,item,6,.1001),2,enemy+' at 210%');
  }
  const noRoll=()=>{throw new Error('an integer drop rate must not draw randomness');};
  assert.deepEqual(D.rollMaterials('slime',noRoll,9),['jelly','jelly','jelly']);
  assert.deepEqual(D.rollMaterials('treant',noRoll,9),[...Array(10).fill('flower'),...Array(10).fill('crystal'),...Array(3).fill('wood')]);
  const stackedHunt=Array(20).fill(.2).reduce((total,bonus)=>total+bonus,0);
  assert.equal(count('boss-slime','jelly',stackedHunt,0),5);
  assert.equal(count('boss-slime','jelly',stackedHunt,.9999),5);
});

test('material boosts preserve no-drop enemies and ignore invalid or negative bonuses',()=>{
  for(const hunt of [-1,NaN,Infinity,-Infinity]){
    assert.deepEqual(D.rollMaterials('treant',()=>.35,hunt),D.rollMaterials('treant',()=>.35));
  }
  assert.deepEqual(D.rollMaterials('unknown',()=>0,9),[]);
  for(const [id,enemy] of Object.entries(D.ENEMIES).filter(([,enemy])=>enemy.noDrop)){
    assert.deepEqual(D.rollMaterials(id,()=>0,9),[],id);
  }
});

test('treasure hunt increases kill gold once using the entire party and preserves fractional gains',()=>{
  const run=S.createRun(1,{random:()=>.99,builds:{warrior:{treasureHunt:.2}}});
  run.allies.push({id:'test-ally',treasureHunt:.2,hp:0});
  const events=[],base=run.enemies[0];
  for(let i=0;i<5;i++){
    const enemy={...base,id:'gold-test-'+i,hp:1,maxHp:1,gold:3,defense:0};
    S.hit(run,run.hero,enemy,100,events);
    S.hit(run,run.hero,enemy,100,events);
  }
  const loot=events.filter(e=>e.type==='loot');
  assert.equal(loot.length,5);assert.equal(run.gold,21);
  assert.equal(loot.reduce((total,e)=>total+e.gold,0),run.gold);
  assert.equal(run.goldRemainder,0);assert.equal(loot.at(-1).goldRemainder,0);
});

test('treasure hunt increases clear gold in every region and special stage without boosting first-clear items',()=>{
  for(const stage of D.ALL_STAGES){
    const save=D.freshSave(),first=D.award(save,stage.id,.4);
    assert.equal(first.gold,Math.floor(stage.reward*1.4+1e-8),String(stage.id));
    assert.equal(save.gold,first.gold);assert.equal(first.potion,stage.special?0:1);
    const second=D.award(save,stage.id,.4);
    assert.equal(save.gold,first.gold+second.gold);assert.equal(second.potion,0);
    assert.ok(Number.isSafeInteger(save.gold));
  }
  for(const hunt of [0,-1,NaN,Infinity]){
    const save=D.freshSave();assert.equal(D.award(save,1,hunt).gold,D.STAGES[0].reward);
  }
});

test('fractional treasure-hunt gold survives reloads and carries between kills and clear rewards',()=>{
  let save=D.freshSave();
  assert.equal(D.addGold(save,3,.2),3);
  assert.ok(Math.abs(save.goldRemainder-.6)<1e-12);
  save=D.readSave(JSON.stringify(save));
  const run=S.createRun(1,{random:()=>.99,builds:{warrior:{treasureHunt:.2}},goldRemainder:save.goldRemainder});
  const enemy=run.enemies[0];enemy.hp=1;enemy.defense=0;
  const events=[];S.hit(run,run.hero,enemy,100,events);
  const loot=events.find(e=>e.type==='loot');assert.equal(loot.gold,4);
  save.gold+=loot.gold;save.goldRemainder=loot.goldRemainder;
  assert.equal(D.award(save,1,.2).gold,24);
  for(let i=0;i<3;i++)D.addGold(save,3,.2);
  assert.equal(save.gold,42);assert.equal(save.goldRemainder,0);
  assert.deepEqual(D.readSave(JSON.stringify(save)),save);
  for(const invalid of [-1,1,NaN,Infinity]){
    const broken={...save,goldRemainder:invalid};assert.equal(D.readSave(JSON.stringify(broken)).goldRemainder,0);
  }
  const legacy={...save};delete legacy.goldRemainder;
  assert.equal(D.readSave(JSON.stringify(legacy)).goldRemainder,0);
});

test('capacity consolidation preserves existing rolls and equipment and migrates old dismantling exclusions',()=>{
  const save=fixture();
  for(const [job,family] of [['warrior','physical'],['mage','magic']]){
    save.progression.characters[job].weapon=P.allGearTrees(job,'weapon').map(n=>n.id);
    const raw=G.generate({rarity:'unique',family,level:3,random:()=>.5});
    raw.options[1].key='vitality'; // A valid pre-change roll, retained without rerolling or deleting it.
    const gem=P.addGem(save,raw);gem.locked=true;assert.ok(P.equipGem(save,job,'weapon',gem.id));
    assert.deepEqual(G.describe(gem).costs,{attack:170,defense:170});
  }
  save.autoGemDismantle={...G.freshAutoDismantle(),enabled:true,excludedDirections:['weapon','magic','attack','utility']};
  const restored=D.readSave(JSON.stringify(save));
  assert.deepEqual(restored.gems,save.gems);
  assert.deepEqual(restored.progression.characters.warrior.gems,save.progression.characters.warrior.gems);
  assert.deepEqual(restored.progression.characters.mage.gems,save.progression.characters.mage.gems);
  assert.equal(restored.autoGemDismantle.enabled,true);assert.deepEqual(restored.autoGemDismantle.excludedDirections,['attack','utility']);
  for(const family of ['physical','magic','attack']){
    const gem=add(restored,'rare',family);assert.equal(G.autoDismantle(restored,gem.id),false);
  }
});

test('interference penetration affects real cancellation and the AI score without reducing permanent resistance',()=>{
  const run=S.createRun(2,{random:()=>.5}),e=run.enemies.find(e=>e.boss)||S.createRun(10,{random:()=>.5}).enemies[0];
  e.hp=10000;e.invulnerable=false;e.actionInterference={endsAt:5000,resistance:100,remaining:20,capacity:20,processed:new Set()};
  assert.equal(I.impact(run,{id:'hero'},e,90,[]),false);assert.equal(e.actionInterference.remaining,20);
  assert.equal(I.impact(run,{id:'hero',interferencePenetration:.4},e,90,[]),true);assert.equal(e.actionInterference.resistance,100);
});

test('legendary procs have cooldowns, cannot recursively trigger, and a proc kill awards exactly one drop',()=>{
  const run=S.createRun(1,{random:()=>.99}),a=run.hero,e=run.enemies[0];Object.assign(a,{gemEcho:1,gemSiphon:.05,maxMp:100,mp:0});
  e.hp=150;e.maxHp=150;e.defense=0;const events=[];S.hit(run,a,e,100,events,true,null,{actionId:'first'});
  assert.equal(events.filter(e=>e.type==='loot').length,1);assert.equal(run.kills,1);assert.equal(a.mp,5);
  const e2=run.enemies[1];e2.hp=10000;e2.maxHp=10000;S.hit(run,a,e2,100,events,true,null,{actionId:'second'});
  assert.equal(a.mp,5);assert.equal(events.filter(e=>e.type==='gem-effect'&&e.kind==='echo').length,1);
  run.time=1100;S.hit(run,a,e2,100,events,true,null,{secondary:true});assert.equal(a.mp,5);
  S.hit(run,a,e2,100,events,true,null,{actionId:'third'});assert.equal(a.mp,10);
  a.hp=a.maxHp;Object.assign(a,{gemAegis:.1});S.hit(run,e2,a,10,events,false);assert.ok(a.gemBarrier.amount>0);const barrier=a.gemBarrier.amount;
  S.hit(run,e2,a,10,events,false);assert.ok(a.gemBarrier.amount<barrier);
});

test('loot presentation keeps different random gem instances separate',()=>{
  const save=fixture(),a=add(save),b=add(save);const items=save.gems.map(g=>({...G.describe(g),id:'gem-instance-'+g.id,type:'gem'}));
  const p=L.presentation({['gem-instance-'+a.id]:1,['gem-instance-'+b.id]:1},0,{gemItems:items});assert.equal(p.entries.length,2);assert.ok(p.entries.every(e=>e.count===1));
});

test('dismantling filters use inclusive bounds, selectable intersection/union and require a condition',()=>{
  const save=fixture(),low=add(save,'rare','physical',2),high=add(save,'rare','physical',3),unique=add(save,'unique','fortune',2),legendary=add(save,'legendary','echo',6);
  const ids=filter=>G.dismantlePlan(save,filter).ids;
  assert.deepEqual(ids({maxLevel:2,maxRarity:'rare',match:'all'}),[low.id]);
  assert.deepEqual(ids({maxLevel:2,maxRarity:'rare',match:'any'}),[low.id,high.id,unique.id]);
  assert.deepEqual(ids({maxLevel:null,maxRarity:'unique'}),[low.id,high.id,unique.id]);
  assert.deepEqual(ids({maxLevel:2,maxRarity:null}),[low.id,unique.id]);
  assert.deepEqual(ids({maxLevel:null,maxRarity:null,match:'any'}),[]);
  assert.deepEqual(ids({maxLevel:6,maxRarity:'legendary'}),[low.id,high.id,unique.id,legendary.id]);
});

test('bulk dismantling keeps any selected primary or secondary effect across AND/OR filters',()=>{
  const save=fixture(),primary=add(save,'rare','physical',2),other=add(save,'rare','magic',4);
  const secondary=P.addGem(save,G.generate({rarity:'unique',family:'fortune',level:3,random:()=>0}));
  assert.equal(secondary.options[1].key,'attack');
  const filter={...G.freshDismantleFilter(),maxLevel:3,maxRarity:'rare',excludedEffects:['physical','attack']};
  assert.deepEqual(G.dismantlePlan(save,filter).ids,[]);
  filter.match='any';
  assert.deepEqual(G.dismantlePlan(save,filter),{ids:[other.id],count:1,shards:{'gem-shard-rare':40}});
  const restored=G.restoreDismantleFilter({...filter,excludedEffects:['physical','attack','physical','unknown',null]});
  assert.deepEqual(restored.excludedEffects,['physical','attack']);
  assert.deepEqual(G.dismantlePlan(save,restored).ids,[other.id]);
  const automatic=structuredClone(save.autoGemDismantle);
  assert.deepEqual(G.bulkDismantle(save,restored).ids,[other.id]);
  assert.deepEqual(save.gems.map(g=>g.id),[primary.id,secondary.id]);
  assert.equal(save.inventory['gem-shard-rare'],40);assert.deepEqual(save.autoGemDismantle,automatic);
  restored.excludedEffects=[];assert.deepEqual(G.dismantlePlan(save,restored).ids,[primary.id,secondary.id]);
  restored.maxLevel=null;restored.maxRarity=null;assert.equal(G.dismantlePlan(save,restored).count,0);
});

test('bulk dismantling excludes protected/equipped gems, grants each rarity once and fails atomically on overflow',()=>{
  const save=fixture(),locked=add(save),equipped=add(save),armor=add(save,'rare','vitality'),a=add(save,'rare','physical',2),b=add(save,'unique','fortune',3);
  locked.locked=true;assert.ok(P.equipGem(save,'warrior','weapon',equipped.id));assert.ok(P.equipGem(save,'mage','armor',armor.id));
  const filter={maxLevel:6,maxRarity:'unique'},plan=G.dismantlePlan(save,filter);
  assert.deepEqual(plan,{ids:[a.id,b.id],count:2,shards:{'gem-shard-rare':20,'gem-shard-unique':30}});
  save.inventory['gem-shard-unique']=Number.MAX_SAFE_INTEGER;
  const before=structuredClone(save);assert.equal(G.bulkDismantle(save,filter),false);assert.deepEqual(save,before);
  save.inventory['gem-shard-unique']=5;
  assert.deepEqual(G.bulkDismantle(save,filter),plan);assert.deepEqual(save.gems.map(g=>g.id),[locked.id,equipped.id,armor.id]);
  assert.equal(save.inventory['gem-shard-rare'],20);assert.equal(save.inventory['gem-shard-unique'],35);assert.equal(G.bulkDismantle(save,filter),false);
  const early=D.freshSave();add(early);const untouched=structuredClone(early);assert.equal(G.bulkDismantle(early,filter),false);assert.deepEqual(early,untouched);
});

test('automatic dismantling honors primary and secondary capacity/effect exclusions and safe fallback',()=>{
  const save=fixture();save.autoGemDismantle={...G.freshAutoDismantle(),enabled:true,maxRarity:'legendary',maxLevel:6};
  // The secondary attack option is the excluded effect/capacity, while fortune remains primary.
  const secondary=P.addGem(save,G.generate({rarity:'unique',family:'fortune',level:3,random:()=>0}));
  assert.equal(secondary.options[1].key,'attack');
  save.autoGemDismantle.excludedEffects=['attack'];assert.equal(G.autoDismantle(save,secondary.id),false);
  save.autoGemDismantle.excludedEffects=[];save.autoGemDismantle.excludedDirections=['attack'];assert.equal(G.autoDismantle(save,secondary.id),false);
  save.autoGemDismantle.excludedDirections=['utility'];assert.equal(G.autoDismantle(save,secondary.id),false);
  save.autoGemDismantle.excludedDirections=[];secondary.locked=true;assert.equal(G.autoDismantle(save,secondary.id),false);secondary.locked=false;
  save.progression.characters.warrior.weapon=P.allGearTrees('warrior','weapon').map(n=>n.id);
  assert.ok(P.equipGem(save,'warrior','weapon',secondary.id));assert.equal(G.autoDismantle(save,secondary.id),false);P.unequipGem(save,'warrior','weapon',secondary.id);
  save.inventory['gem-shard-unique']=Number.MAX_SAFE_INTEGER;assert.equal(G.autoDismantle(save,secondary.id),false);assert.ok(save.gems.includes(secondary));
  save.inventory['gem-shard-unique']=0;assert.equal(G.autoDismantle(save,secondary.id).count,1);assert.equal(save.inventory['gem-shard-unique'],30);assert.equal(G.autoDismantle(save,secondary.id),false);
  const rare=P.addGem(save,G.generate({rarity:'rare',family:'physical',level:2,random:()=>.5}));
  save.autoGemDismantle.maxLevel=1;save.autoGemDismantle.maxRarity=null;assert.equal(G.autoDismantle(save,rare.id),false);
  save.autoGemDismantle.maxLevel=2;assert.equal(G.autoDismantle(save,rare.id).shards['gem-shard-rare'],20);
});

test('automatic dismantling settings default OFF, restore without consuming existing gems and sanitize invalid data',()=>{
  const save=fixture(),gem=add(save);assert.deepEqual(save.autoGemDismantle,G.freshAutoDismantle());assert.equal(G.autoDismantle(save,gem.id),false);
  save.autoGemDismantle={enabled:true,maxLevel:4,maxRarity:'unique',match:'any',excludedDirections:['attack','utility'],excludedEffects:['fortune','echo']};
  const restored=D.readSave(JSON.stringify(save));assert.deepEqual(restored.autoGemDismantle,save.autoGemDismantle);assert.deepEqual(restored.gems,save.gems);
  delete save.autoGemDismantle;assert.deepEqual(D.readSave(JSON.stringify(save)).autoGemDismantle,G.freshAutoDismantle());
  const invalid=G.restoreAutoDismantle({enabled:true,maxLevel:999,maxRarity:'unknown',match:'xor',excludedDirections:['attack','attack','common'],excludedEffects:['fortune','fortune',null]});
  assert.equal(invalid.enabled,false);assert.deepEqual(invalid.excludedDirections,['attack']);assert.deepEqual(invalid.excludedEffects,['fortune']);
  const early=D.freshSave();early.autoGemDismantle.enabled=true;const locked=add(early);assert.equal(G.autoDismantle(early,locked.id),false);
  const crafting=fixture();crafting.autoGemDismantle.enabled=true;Object.assign(crafting.inventory,G.craftRecipe('rare',1,'physical'));
  assert.ok(G.craft(crafting,'rare',1,'physical'));assert.equal(crafting.gems.length,1);
});

test('generated gem assets have exact icon dimensions and real transparent margins',()=>{
  const fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths,{PNG}=require('pngjs');
  const root=path.resolve(__dirname,'../public/assets/ui/gems'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.ok(fs.existsSync(path.join(root,manifest.source)));assert.equal(manifest.icons.length,9);
  for(const name of manifest.icons){const png=PNG.sync.read(fs.readFileSync(path.join(root,name)));assert.equal(png.width,128);assert.equal(png.height,128);
    assert.equal(png.data[3],0);assert.ok(png.data.some((v,i)=>i%4===3&&v===255));}
});
