'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),S=require('../public/js/combat/forest-simulation.js');
const Special=require('../public/js/data/special-stages.js'),U=require('../public/js/ui/forest-unlocks.js'),R=require('../tools/balance/audit-rift-rewards.cjs');
const {CHAOS:C}=Special,stage=D.SPECIAL_STAGES.find(s=>s.id===C.ID);
test('chaos unlocks exactly once on castle 10 and has independent repeat/fallback destinations',()=>{
  const save=D.freshSave();save.cleared=D.STAGES.filter(s=>s.id<100).map(s=>s.id);
  assert.equal(D.isUnlocked(save,C.ID),false);assert.equal(D.isUnlocked(save,Special.ID),true);
  assert.equal(U.collect(save,99).some(e=>e.id===C.ID),false);
  assert.equal(U.collect(save,100).filter(e=>e.id===C.ID&&e.special).length,1);
  D.award(save,100);assert.equal(D.isUnlocked(save,C.ID),true);assert.deepEqual(U.collect(save,100),[]);
  assert.equal(D.stageLabel(C.ID),'混沌の門');assert.equal(D.stageId(C.ID),C.ID);
  assert.equal(D.STAGES.length,100);assert.equal(D.nextStage(100).id,Special.ID);assert.equal(D.nextStage(C.ID).id,'extradimensional-goddess');
  for(const mode of ['same','advance']){save.autoMode=mode;assert.deepEqual(D.autoDestination(save,C.ID,true),{stage:C.ID,mode});assert.deepEqual(D.autoDestination(save,C.ID,false),{stage:100,mode:'same'});assert.deepEqual(D.autoDestination(save,Special.ID,false),{stage:50,mode:'same'});}
  save.autoMode='off';assert.equal(D.autoDestination(save,C.ID,false),null);assert.equal(D.autoDestination(save,C.ID,true),null);
});
test('chaos contains all 35 enemies from regions 6–10 in 105/15/5 slots and three non-dropping gates',()=>{
  assert.deepEqual(C.BATCHES.map(b=>b.map(a=>a.length)),[[35,35,35],[5,5,5],[5]]);
  assert.deepEqual(new Set(C.BATCHES.flat(2)),new Set(Object.keys(D.ENEMIES).filter(id=>D.ENEMIES[id].region>=6)));
  for(const batches of C.BATCHES)for(const batch of batches)for(let region=6;region<=10;region++)assert.equal(batch.filter(id=>D.ENEMIES[id].region===region).length,batch.length/5);
  assert.equal(stage.total,128);assert.deepEqual(stage.waves.flat(),C.GATES);
  for(const id of C.GATES){assert.ok(D.ALL_ENEMIES[id].noDrop);assert.deepEqual(D.rollMaterials(id,()=>0),[]);assert.equal((D.rollGems(id,()=>0)[0] ?? null),null);}
});
test('chaos gates wait for whole batches, reject damage and award exactly 125 enemy drops',()=>{
  const run=S.createRun(C.ID,{random:()=>.5}),events=[],gate=run.enemies[0];
  Object.assign(run.hero,{hp:1e12,maxHp:1e12,manualOnly:true,damage:0,invulnerable:true});
  S.hit(run,run.hero,gate,1e12,events);assert.equal(gate.hp,1);assert.equal(run.kills,0);
  events.push(...S.update(run,8000));assert.equal(gate.gateBatch,1);assert.equal(run.enemies.length,36);
  events.push(...S.update(run,2000));assert.equal(gate.gateBatch,1);
  const mob=run.enemies.find(e=>!e.dimensionalGate),base=D.ENEMIES['demon-armored-soldier'];
  assert.equal(mob.maxHp,Math.round(base.hp*1.9*stage.enemyHp));assert.equal(mob.damage,Math.round(base.damage*1.9*stage.enemyDamage));assert.equal(mob.speed,D.ENEMIES[mob.type].speed);
  for(let t=0;t<60000&&run.status==='running';t+=100){for(const e of run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart))S.hit(run,run.hero,e,1e12,events,false,null,{critical:false,skipHitRoll:true});events.push(...S.update(run,100));}
  assert.equal(run.status,'victory');assert.equal(run.kills,128);assert.equal(events.filter(e=>e.type==='loot').length,125);
  assert.deepEqual([0,1,2].map(t=>events.filter(e=>e.type==='rift-effect'&&e.kind==='emerge'&&e.tier===t).length),[105,15,5]);
  assert.ok(events.filter(e=>e.type==='rift-effect').every(e=>e.specialId===C.ID));assert.equal(events.filter(e=>e.kind==='shatter').length,3);
  assert.equal(run.gold,R.expectedRewards(C.ID).killGold);assert.equal(events.filter(e=>e.type==='finished').length,1);assert.deepEqual(S.update(run,10000),[]);
  assert.equal(Special.profile('sand-behemoth',D.ENEMIES,C.ID).hp,D.ENEMIES['demon-god'].hp);
  assert.equal(Special.profile('lamia',D.ENEMIES,C.ID).hp,D.ENEMIES['black-knight'].hp);
});
test('pharaoh and arch demon cannot add extra enemies in the gate stage',()=>{
  const Control=require('../public/js/combat/enemy-control.js'),Desert=require('../public/js/combat/desert-combat.js'),Castle=require('../public/js/combat/demon-castle-combat.js');
  const run=S.createRun(C.ID),api={STEP:S.STEP,control:Control,state:(e,state,motion)=>Object.assign(e,{state,motion}),attackPower:(_r,e)=>e.damage,spawn:()=>assert.fail('unexpected extra summon')};
  for(const [type,combat]of [['golden-pharaoh',Desert],['arch-demon',Castle]]){
    const e={...D.ENEMIES[type],type,id:'summoner',hp:1e9,maxHp:1e9,x:600,y:438,attacks:2,castleCycle:5};run.enemies=[e];
    assert.equal(combat.start(run,e,run.hero,api,[]),true);assert.notEqual((e.desertPlan||e.castlePlan).kind,'summon');
  }
});
test('all regional materials stay regional; Lv10 rare/unique/legendary odds double with treasure hunt',()=>{
  assert.deepEqual(D.gemDropRates(10,0,2),{rare:.1,unique:.01,legendary:.001});
  const boosted=D.gemDropRates(10,.4,2);for(const[k,v]of Object.entries({rare:.14,unique:.014,legendary:.0014}))assert.ok(Math.abs(boosted[k]-v)<1e-12);
  for(const id of C.BATCHES.slice(1).flat(2)){
    for(const[roll,rarity]of [[.0009,'legendary'],[.0011,'unique'],[.0109,'unique'],[.0111,'rare'],[.1109,'rare']]){const gem=(D.rollGems(id,()=>roll,0,{level:stage.dropLevel,multiplier:stage.gemMultiplier})[0] ?? null);assert.equal(gem.rarity,rarity);assert.equal(gem.level,10);}
    assert.equal((D.rollGems(id,()=>.11101,0,{level:10,multiplier:2})[0] ?? null),null);
    const e=D.ENEMIES[id],region=D.REGIONS[e.region-1];assert.deepEqual(D.rollMaterials(id,()=>0),[e.common,region.crystal,...e.majorBoss?[region.rare]:[]]);
  }
  for(const id of C.BATCHES[0].flat())assert.equal((D.rollGems(id,()=>0,0,{level:10,multiplier:2})[0] ?? null),null);
});
test('gold covers conversion-funded later-region trees with the larger mob batches',()=>{
  const rewards=R.expectedRewards(C.ID),{costs,nodes}=R.gearBudget('warrior','weapon',C.ID);
  assert.equal(rewards.killGold,12275);assert.equal(rewards.gold,24275);assert.equal(nodes.length,500);
  const funded=R.convertedBudget(190,rewards.gold,C.ID);assert.ok(funded.enoughMaterials);
  assert.ok(funded.save.gold>=costs.gold);
  funded.save.progression.characters.warrior.weapon=P.allGearTrees('warrior','weapon').filter(n=>n.main&&n.stage<=50).map(n=>n.id);
  assert.equal(P.purchaseGearBatch(funded.save,nodes.map(n=>({character:'warrior',slot:'weapon',node:n.id})),500).length,500);
  assert.ok(funded.save.gold>=0);assert.ok(Object.values(funded.save.inventory).every(n=>n>=0));
  assert.ok(R.convertedBudget(190,rewards.killGold+2000,C.ID).save.gold<costs.gold);
});
test('chaos completion/save keeps max level, gear, inventory and both special progress entries',()=>{
  const {fullBuild}=require('../tools/balance/audit-chaos-gate.cjs'),save=fullBuild(8);save.selectedStage=C.ID;
  const potion=save.inventory.potion;save.cleared.push(Special.ID);const reward=D.award(save,C.ID,.4);
  assert.equal(reward.gold,16800);assert.equal(reward.potion,0);assert.equal(reward.recruited,null);assert.equal(save.inventory.potion,potion);assert.deepEqual(U.collect(save,C.ID),[]);
  P.gainXp(save,stage.xpStage);for(const c of Object.values(save.progression.characters))assert.deepEqual(c.xp,P.experience(100));
  const clean=D.readSave(JSON.stringify(save));assert.equal(clean.selectedStage,C.ID);assert.ok(clean.cleared.includes(Special.ID)&&clean.cleared.includes(C.ID));assert.deepEqual(clean.progression,save.progression);assert.deepEqual(clean.inventory,save.inventory);
  const locked=D.freshSave();locked.selectedStage=C.ID;assert.equal(D.readSave(JSON.stringify(locked)).selectedStage,1);
});
test('new background and padded gate are valid independent runtime images with real alpha',async()=>{
  const sharp=require('sharp'),dir=path.resolve(__dirname,'../public',C.ASSET);
  const gate=sharp(path.join(dir,'gate.png')),meta=await gate.metadata(),stats=await gate.stats();assert.equal(meta.width,512);assert.equal(meta.height,512);assert.ok(meta.hasAlpha);assert.equal(stats.channels[3].min,0);assert.equal(stats.channels[3].max,255);
  const {data,info}=await gate.raw().toBuffer({resolveWithObject:true});for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(x<24||y<24||x>=info.width-24||y>=info.height-24)assert.equal(data[(y*info.width+x)*4+3],0);
  const bg=await sharp(path.join(dir,'background.png')).metadata();assert.equal(bg.width,1024);assert.equal(bg.height,576);
  assert.notDeepEqual(fs.readFileSync(path.join(dir,'gate.png')),fs.readFileSync(path.resolve(__dirname,'../public',Special.ASSET,'gate.png')));
});
