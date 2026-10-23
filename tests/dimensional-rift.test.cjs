'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),S=require('../public/js/combat/forest-simulation.js');
const Rift=require('../public/js/data/special-stages.js'),U=require('../public/js/ui/forest-unlocks.js'),A=require('../tools/balance/audit-balance.cjs');
const seeded=seed=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const stage=D.SPECIAL_STAGES[0];
function fullBuild(){const {save}=A.referenceBuild(50,50);for(const id of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
  for(const n of P.allGearTrees(id,slot).filter(n=>n.stage<=50))if(!save.progression.characters[id][slot].includes(n.id))assert.ok(P.purchase(save,id,slot,n.id),id+'/'+n.id);
  assert.equal(save.progression.characters[id][slot].length,500);
}return save;}
const builds=save=>Object.fromEntries(Object.keys(P.CHARACTERS).map(id=>[id,P.stats(save,id)]));
test('named special stages unlock on ruins 10 and connect after the numbered route',()=>{
  const save=D.freshSave();save.cleared=[49];assert.equal(D.isUnlocked(save,Rift.ID),false);
  const unlocks=U.collect(save,50);assert.ok(unlocks.some(e=>e.id===Rift.ID&&e.special));
  D.award(save,50);assert.equal(D.isUnlocked(save,Rift.ID),true);assert.deepEqual(U.collect(save,50),[]);
  assert.equal(D.stageLabel(Rift.ID),'次元の門');assert.equal(D.stageId(Rift.ID),Rift.ID);assert.equal(D.STAGES.length,100);
  assert.equal(D.nextStage(50).id,51);assert.equal(D.nextStage(60).id,61);assert.equal(D.nextStage(70).id,71);assert.equal(D.nextStage(80).id,81);assert.equal(D.nextStage(90).id,91);assert.equal(D.nextStage(100).id,Rift.ID);assert.equal(D.nextStage(Rift.ID).id,Rift.CHAOS.ID);
  save.autoMode='advance';assert.deepEqual(D.autoDestination(save,Rift.ID,true),{stage:Rift.ID,mode:'advance'});
  assert.deepEqual(D.autoDestination(save,Rift.ID,false),{stage:50,mode:'same'});
  save.autoMode='off';assert.equal(D.autoDestination(save,Rift.ID,false),null);
});
test('all families and five regions appear in exact 105/15/5 summon budgets',()=>{
  assert.deepEqual(Rift.BATCHES.map(b=>b.map(a=>a.length)),[[35,35,35],[5,5,5],[5]]);
  assert.equal(new Set(Rift.BATCHES[0].flat()).size,16);assert.equal(new Set(Rift.BATCHES[1].flat()).size,15);
  for(const batches of Rift.BATCHES)for(const batch of batches)for(let region=1;region<=5;region++)assert.equal(batch.filter(id=>(D.ENEMIES[id].region||1)===region).length,batch.length/5);
  assert.equal(Rift.BATCHES[0][0].filter(id=>id==='stone-guard').length,4);
  assert.equal(Rift.BATCHES[0][0].filter(id=>id==='rune-gargoyle').length,3);
  assert.equal(stage.total,128);assert.deepEqual(stage.waves.flat(),Rift.GATES);
});
test('gates resist attacks, wait for every summon, reopen and shatter once per wave',()=>{
  const run=S.createRun(Rift.ID,{random:seeded(9)}),events=[];
  Object.assign(run.hero,{maxHp:1e12,hp:1e12,cooldown:1e9,skill:1e9,damage:0,speed:0,warriorSkills:[]});
  const gate=run.enemies[0];S.hit(run,run.hero,gate,1e12,events);assert.equal(gate.hp,1);assert.equal(run.kills,0);
  events.push(...S.update(run,8000));assert.equal(gate.gateBatch,1);assert.equal(run.enemies.filter(e=>!e.dimensionalGate).length,35);
  events.push(...S.update(run,4000));assert.equal(gate.gateBatch,1,'living summons prevent reopening');
  for(let t=0;t<60000&&run.status==='running';t+=100){for(const e of run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart))S.hit(run,run.hero,e,1e12,events,false,null,{critical:false,skipHitRoll:true});events.push(...S.update(run,100));}
  assert.equal(run.status,'victory');assert.equal(run.kills,128);assert.equal(run.extraEnemies,0);
  assert.equal(events.filter(e=>e.type==='loot').length,125);assert.ok(events.filter(e=>e.type==='loot').every(e=>!Rift.GATES.includes(e.enemy)));
  assert.equal(run.gold,require('../tools/balance/audit-rift-rewards.cjs').expectedRewards().killGold);
  assert.deepEqual([0,1,2].map(tier=>events.filter(e=>e.type==='rift-effect'&&e.kind==='emerge'&&e.tier===tier).length),[105,15,5]);
  for(const tier of [0,1,2]){
    const summons=events.filter(e=>e.type==='rift-effect'&&e.kind==='emerge'&&e.tier===tier),size=tier===0?35:5;
    for(let offset=0;offset<summons.length;offset+=size){
      const batch=summons.slice(offset,offset+size),label='tier '+tier+' batch '+offset/size;
      assert.ok(batch.some(e=>e.y<419)&&batch.some(e=>e.y>419),label+' spans both rows');
      assert.equal(batch.reduce((sum,e)=>sum+e.y,0)/size,419,label+' centered vertically');
      assert.equal(new Set(batch.map(e=>e.x+','+e.y)).size,size,label+' distinct spawn positions');
      assert.ok(batch.every(e=>e.y>=356&&e.y<=482),label+' stays inside the spawn area');
    }
  }
  assert.equal(events.filter(e=>e.type==='rift-effect'&&e.kind==='shatter').length,3);
  assert.equal(events.filter(e=>e.type==='finished').length,1);assert.deepEqual(S.update(run,10000),[]);
});
test('early monsters use ruins-10 class stats while retaining their regional behavior',()=>{
  const run=S.createRun(Rift.ID);Object.assign(run.hero,{hp:1e12,maxHp:1e12,damage:0,cooldown:1e9,skill:1e9});S.update(run,1100);
  const slime=run.enemies.find(e=>e.type==='slime'),reference=D.STAGES.find(s=>s.id===50),base=D.ENEMIES['stone-guard'];
  assert.equal(slime.maxHp,Math.round(base.hp*1.9*reference.enemyHp));assert.equal(slime.damage,Math.round(base.damage*1.9*reference.enemyDamage));
  assert.equal(slime.speed,D.ENEMIES.slime.speed);assert.equal(slime.range,D.ENEMIES.slime.range);
  assert.equal(Rift.profile('treant',D.ENEMIES).majorBoss,true);
});
test('normal balance tools can replace a stage profile without changing the special registry',()=>{
  const original=D.STAGES[0];
  try {D.STAGES[0]={...original,enemyHp:2};const run=S.createRun(1);assert.equal(run.enemies[0].maxHp,D.ENEMIES.slime.hp*2);assert.equal(S.createRun(Rift.ID).stage,stage);}
  finally {D.STAGES[0]=original;}
});
test('gems have twice the exclusive drop chance, combine treasure hunt and always drop at Lv.5',()=>{
  assert.deepEqual(D.gemDropRates(5,0,2),{rare:.1,unique:.01,legendary:0});
  const boosted=D.gemDropRates(5,.4,2);assert.ok(Math.abs(boosted.rare-.14)<1e-12);assert.ok(Math.abs(boosted.unique-.014)<1e-12);
  for(const id of [...Rift.BATCHES[1].flat(),...Rift.BATCHES[2].flat()]){
    assert.equal((D.rollGems(id,()=>.009,0,{level:5,multiplier:2})[0] ?? null).rarity,'unique');
    const gem=(D.rollGems(id,()=>.1,0,{level:5,multiplier:2})[0] ?? null);assert.equal(gem.rarity,'rare');assert.equal(gem.level,5);
    assert.equal((D.rollGems(id,()=>.11001,0,{level:5,multiplier:2})[0] ?? null),null);
  }
  for(const gate of Rift.GATES){assert.deepEqual(D.rollMaterials(gate,()=>0),[]);assert.equal((D.rollGems(gate,()=>0)[0] ?? null),null);}
  assert.deepEqual(D.rollMaterials('treant',()=>0),['flower','crystal','wood']);
  assert.deepEqual(D.rollMaterials('ancient-titan',()=>0),['bronze-gear','ruins-crystal','ancient-core']);
});
test('special completion gives no first-clear bonus and survives save restoration',()=>{
  const save=A.referenceBuild(50,50).save;save.selectedStage=Rift.ID;const potions=save.inventory.potion,gold=save.gold;
  const reward=D.award(save,Rift.ID);assert.equal(reward.potion,0);assert.equal(reward.recruited,null);assert.equal(save.inventory.potion,potions);assert.equal(save.gold-gold,stage.reward);
  assert.deepEqual(U.collect(save,Rift.ID),[]);const clean=D.readSave(JSON.stringify(save));assert.equal(clean.selectedStage,Rift.ID);assert.ok(clean.cleared.includes(Rift.ID));assert.equal(P.Gem.maxLevel(clean),6);
  P.gainXp(clean,stage.xpStage);assert.ok(Number.isFinite(clean.progression.characters.warrior.xp.progress));
});
test('rift gold covers five-region gear when surplus crystals are converted into deficits',()=>{
  const audit=require('../tools/balance/audit-rift-rewards.cjs'),{nodes,costs}=audit.gearBudget();
  const rewards=audit.expectedRewards(),normal=D.STAGES.find(s=>s.id===50);
  assert.equal(normal.reward,1000);assert.equal(stage.reward,3000);
  assert.equal(rewards.gold,7520);
  for(const id of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
    assert.deepEqual(audit.gearBudget(id,slot).costs,costs);
  }
  const candidates=nodes.map(n=>({character:'warrior',slot:'weapon',node:n.id}));
  const old=audit.convertedBudget(190,rewards.killGold+normal.reward);
  assert.equal(old.enoughMaterials,true);assert.ok(old.save.gold<costs.gold);
  assert.ok(P.purchaseGearBatch(old.save,candidates,500).length<500);
  const updated=audit.convertedBudget(190,rewards.gold);
  assert.equal(updated.enoughMaterials,true);
  assert.equal(P.purchaseGearBatch(updated.save,candidates,500).length,500);
  assert.ok(updated.save.gold>=0);assert.ok(Object.values(updated.save.inventory).every(n=>n>=0));
  const boosted=D.freshSave();const reward=D.award(boosted,Rift.ID,.4);
  assert.equal(reward.gold,4200);assert.equal(boosted.gold,4200);
});
test('main-only ruins completion loses, complete gear through every unique wins without gems or potions',()=>{
  const main=A.referenceBuild(50,50).save,full=fullBuild();
  for(const [save,expected]of [[main,'defeat'],[full,'victory']])for(const seed of [1,2,3]){
    const run=S.createRun(Rift.ID,{builds:builds(save),random:seeded(seed)});
    for(let t=0;t<240000&&run.status==='running';t+=100)S.update(run,100);
    assert.equal(run.status,expected,expected+' seed '+seed);
    if(expected==='victory'){assert.equal(run.kills,128);assert.ok([run.hero,...run.allies].every(a=>a.hp>0));}
  }
});
test('gate PNG preserves transparent margins and the background is a usable wide image',async()=>{
  const sharp=require('sharp'),directory=path.resolve(__dirname,'../public',Rift.ASSET);
  for(const file of ['gate.png','background.png'])assert.ok(fs.existsSync(path.join(directory,file)));
  const gate=sharp(path.join(directory,'gate.png')),meta=await gate.metadata(),stats=await gate.stats();assert.ok(meta.hasAlpha);assert.equal(stats.channels[3].min,0);assert.equal(stats.channels[3].max,255);
  const background=await sharp(path.join(directory,'background.png')).metadata();assert.ok(background.width/background.height>1.7);
});
