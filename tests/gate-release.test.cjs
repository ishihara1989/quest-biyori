'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),R=require('../public/js/core/reincarnation.js'),T=require('../public/js/core/trials.js'),Tree=require('../public/js/data/reincarnation-tree-data.js'),S=require('../public/js/combat/forest-simulation.js'),Special=require('../public/js/data/special-stages.js'),Rewards=require('../tools/balance/audit-rift-rewards.cjs');
function own(s,id){for(const p of Tree.byId[id].requires)if(p!=='origin'&&!s.reincarnation.owned.includes(p))own(s,p);if(id!=='origin'&&!s.reincarnation.owned.includes(id))s.reincarnation.owned.push(id);}
function ready(){const s=D.freshSave();Object.assign(s.reincarnation,{discovered:true,unlocked:true,cycle:20,total:2000});own(s,'trial-open');return s;}
test('gate release requires both first clears, multiplies PT and roundtrips first clear and next-journey reward',()=>{
 assert.equal(T.summarize(['onslaught','unyielding','gate-release']).reward,2.7);
 const s=ready();assert.equal(T.available(s,'gate-release'),false);s.reincarnation.trialCompleted=['onslaught'];assert.equal(T.available(s,'gate-release'),false);s.reincarnation.trialCompleted=['unyielding'];assert.equal(T.available(s,'gate-release'),false);
 assert.equal(R.prepare(s,D.freshSave,{restart:true,trials:['gate-release']}),null);
 s.reincarnation.trialCompleted=['onslaught','unyielding'];assert.ok(T.available(s,'gate-release'));
 const run=R.prepare(s,D.freshSave,{restart:true,trials:['gate-release']});assert.equal(T.capture(run).reward,1.2);assert.equal(T.capture(run).gateRelease,true);assert.equal(T.bonuses(run).materialReduction,0);
 const proof=R.capture(run,'reincarnation-goddess');R.victory(run,'reincarnation-goddess',proof);R.victory(run,'reincarnation-goddess',proof);assert.equal(R.payout(run),120);assert.equal(T.completed(run).filter(id=>id==='gate-release').length,1);assert.equal(T.bonuses(run).materialReduction,0);
 const restored=D.readSave(JSON.stringify(run));assert.equal(R.payout(restored),120);assert.ok(restored.reincarnation.trials.includes('gate-release'));
 const next=R.prepare(restored,D.freshSave,{restart:true,trials:[]});assert.equal(next.reincarnation.total,2120);assert.equal(T.bonuses(next).materialReduction,10);assert.equal(T.capture(next).gateRelease,false);assert.equal(T.bonuses(D.readSave(JSON.stringify(next))).materialReduction,10);
 const abandoned=R.prepare(s,D.freshSave,{restart:true,trials:['gate-release']});const stale=R.capture(abandoned);T.abandon(abandoned);R.victory(abandoned,'reincarnation-goddess',stale);assert.equal(T.capture(abandoned).gateRelease,false);assert.equal(T.completed(abandoned).includes('gate-release'),false);
});
test('legacy 40500 PT and the expanded trial ceiling survive save restoration',()=>{
 const s=ready(),all=['strength-10','onslaught','unyielding','goddess-serious','gate-release'];s.reincarnation.trialCompleted=T.definitions.map(d=>d.id);
 const run=R.prepare(s,D.freshSave,{restart:true,trials:all});assert.equal(T.capture(run).reward,270);R.victory(run,'extradimensional-goddess',R.capture(run,'extradimensional-goddess'));assert.equal(R.payout(run),40500);
 const loaded=D.readSave(JSON.stringify(run));assert.equal(R.payout(loaded),40500);assert.deepEqual(loaded.reincarnation.trials,all);
 const next=R.prepare(loaded,D.freshSave,{restart:true,trials:[]});next.reincarnation.cycle=1;next.reincarnation.total=40500;assert.equal(D.readSave(JSON.stringify(next)).reincarnation.total,40500);
 assert.equal(R.restore({...next.reincarnation,total:1518751}).total,100);
});
test('material reward adds ten percentage points to normal sub and unique fees for every region, job and slot',()=>{
 const s=ready();s.reincarnation.trialCompleted=['gate-release'];s.reincarnation.appliedTrials=['gate-release'];assert.equal(P.permanent(s).sub,30);assert.equal(P.permanent(s).unique,30);own(s,'sub40');own(s,'unique40');
 assert.equal(P.permanent(s).sub,50);assert.equal(P.permanent(s).unique,50);
 for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor'])for(let region=1;region<=10;region++)for(const n of P.gearTree(job,slot,region)){
  const cost=P.gearCost(s,n);
  for(const [key,amount]of Object.entries(n.cost))assert.equal(cost[key],n.main?0:key==='gold'?amount:Math.ceil(amount*.5),job+'/'+slot+'/'+n.id+'/'+key);
 }
 const goddess=P.gearTree('warrior','weapon','goddess')[0];assert.deepEqual(P.gearCost(s,goddess),goddess.cost);
 const ordinary=D.freshSave();ordinary.reincarnation.appliedTrials=['gate-release'];assert.deepEqual(P.gearCost(ordinary,{stage:1,cost:{gold:3,jelly:11}}),{gold:3,jelly:10});
 assert.equal(P.gearCost(ordinary,{stage:1,main:true,cost:{jelly:11}}).jelly,11);
 const proof=R.capture(s);s.reincarnation.appliedTrials=[];assert.equal(P.permanent(s).sub,40);assert.equal(proof.bonuses.sub,50);
});
function sweep(stage,ids){
 const run=S.createRun(stage,{random:()=>.5,trials:T.summarize(ids,stage)}),events=[];
 Object.assign(run.hero,{invulnerable:true,hp:1e15,maxHp:1e15,manualOnly:true,damage:0});
 for(let t=0;t<90000&&run.status==='running';t+=100){
  for(const e of run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart))S.hit(run,run.hero,e,1e15,events,false,null,{critical:false,skipHitRoll:true});
  events.push(...S.update(run,100));
 }
 return {run,events};
}
for(const id of [Special.ID,Special.CHAOS.ID])test(id+' releases 105/15 enemies together, keeps final wave and preserves kills, gold and drops',()=>{
 const definition=Special.definition(id),before=JSON.stringify(definition.BATCHES),run=S.createRun(id,{random:()=>.5,trials:T.summarize(['gate-release','strength-2','onslaught','unyielding'],id)}),events=[];
 Object.assign(run.hero,{invulnerable:true,maxHp:1e15,hp:1e15,manualOnly:true});
 events.push(...S.update(run,1000));const mobs=run.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart);
 assert.equal(mobs.length,105);assert.deepEqual(mobs.map(e=>e.type),definition.BATCHES[0].flat());assert.equal(new Set(mobs.map(e=>e.riftBornAt)).size,1);assert.equal(new Set(mobs.map(e=>e.x+','+e.y)).size,105);
 for(const e of mobs){const profile=Special.profile(e.type,D.ALL_ENEMIES,id);assert.equal(e.damage,Math.round(profile.damage*1.9*run.stage.enemyDamage)*2);assert.equal(e.trialInterference,3);}
 assert.ok(events.filter(e=>e.type==='rift-effect'&&e.kind==='emerge').every(e=>e.x>=550&&e.x<=854&&e.y>=356&&e.y<=482));
 events.push(...S.update(run,20000));assert.equal(run.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart).length,105);assert.equal(run.enemies[0].gateBatch,1);assert.equal(run.enemies[0].gatePhase,'waiting');
 const normal=sweep(id,[]),released=sweep(id,['gate-release']);assert.equal(released.run.status,'victory');assert.equal(released.run.kills,128);assert.equal(released.run.extraEnemies,0);assert.equal(released.run.gold,Rewards.expectedRewards(id).killGold);assert.equal(released.events.filter(e=>e.type==='loot').length,125);
 assert.deepEqual(released.events.filter(e=>e.type==='loot').map(e=>e.enemy).sort(),normal.events.filter(e=>e.type==='loot').map(e=>e.enemy).sort());
 for(const [tier,count]of [[0,105],[1,15],[2,5]]){
  const emerged=released.events.filter(e=>e.type==='rift-effect'&&e.kind==='emerge'&&e.tier===tier);assert.equal(emerged.length,count);assert.equal(new Set(emerged.map(e=>e.x+','+e.y)).size,count);
  if(tier<2)assert.equal(new Set(emerged.map(e=>e.timeMs)).size,1);
  assert.equal(released.events.filter(e=>e.type==='rift-effect'&&e.kind==='open'&&e.tier===tier).length,1);
 }
 assert.equal(normal.events.filter(e=>e.type==='rift-effect'&&e.kind==='open').length,7);assert.equal(released.events.filter(e=>e.type==='rift-effect'&&e.kind==='open').length,3);assert.ok(released.run.time<normal.run.time);
 assert.equal(released.events.filter(e=>e.type==='finished').length,1);assert.deepEqual(S.update(released.run,10000),[]);assert.equal(JSON.stringify(definition.BATCHES),before);
});
test('gate release leaves regular stages and goddess wave definitions intact',()=>{
 for(const stage of D.ALL_STAGES.filter(s=>![Special.ID,Special.CHAOS.ID].includes(s.id))){const a=S.createRun(stage.id,{random:()=>.5}),b=S.createRun(stage.id,{random:()=>.5,trials:T.summarize(['gate-release'],stage.id)});assert.equal(b.stage,a.stage);assert.deepEqual(b.enemies,a.enemies);}
});