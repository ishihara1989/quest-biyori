'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),R=require('../public/js/core/reincarnation.js'),T=require('../public/js/data/reincarnation-tree-data.js'),Trials=require('../public/js/core/trials.js'),S=require('../public/js/combat/forest-simulation.js'),I=require('../public/js/combat/action-interference.js'),Rewards=require('../public/js/core/forest-run-rewards.js'),G=require('../public/js/combat/goddess-combat.js'),C=require('../public/js/combat/reincarnation-combat.js');
function own(s,id){for(const p of T.byId[id].requires)if(p!=='origin'&&!s.reincarnation.owned.includes(p))own(s,p);if(id!=='origin')s.reincarnation.owned.push(id);}
function ready(){const s=D.freshSave();Object.assign(s.reincarnation,{discovered:true,unlocked:true,cycle:10,total:1000});own(s,'trial-open');return s;}
const all=['strength-10','onslaught','unyielding','goddess-serious'];
const run=(stage,ids=[])=>S.createRun(stage,{random:fixedRandom,trials:{ids}});
const fixedRandom=()=>.5;
function final(r){r.hero.hp=r.hero.maxHp=1e30;for(let attempt=0;attempt<10&&r.wave<r.stage.waves.length-1;attempt++){for(const e of r.enemies)e.hp=0;S.update(r,1500);}assert.equal(r.wave,r.stage.waves.length-1,'final wave '+r.stage.id);return r;}

test('trial door purchase unlocks all four simple families, reserved nodes stay unavailable, same family takes max',()=>{
 const s=ready();s.reincarnation.owned.pop();assert.equal(Trials.select(s,'onslaught',true),false);assert.equal(R.status(s,'trial-open'),'available');assert.ok(R.purchase(s,'trial-open'));assert.equal(R.purchase(s,'trial-seals'),false);
 for(const id of all)assert.ok(Trials.select(s,id,true));assert.equal(Trials.capture(s,1).reward,22.5);assert.equal(Trials.capture(s,'reincarnation-goddess').reward,225);
 assert.deepEqual(Trials.summarize(['strength-2','strength-3','strength-10','strength-10','bad'],1).ids,['strength-10']);
 Trials.select(s,'strength-2',true);assert.ok(!s.reincarnation.trials.includes('strength-10'));assert.equal(Trials.capture(s,1).stats,2);
});
test('every stage scales enemies, preserves gates and base definitions, goddess trial only applies to the two goddesses',()=>{
 const before=JSON.stringify(D.ALL_ENEMIES);
 for(const stage of D.ALL_STAGES){const base=run(stage.id),strong=run(stage.id,all),factor=Trials.gods.includes(stage.id)?30:10;
  for(let i=0;i<base.enemies.length;i++){const a=base.enemies[i],b=strong.enemies[i];if(a.dimensionalGate){assert.equal(b.hp,1);continue;}
   assert.equal(b.maxHp,a.maxHp*factor,stage.id+' HP');assert.equal(b.damage,a.damage*factor,stage.id+' damage');assert.equal(b.defense,a.defense*factor,stage.id+' defense');assert.equal(b.speed,a.speed);assert.equal(b.interval,a.interval);
  }
 }
 assert.equal(JSON.stringify(D.ALL_ENEMIES),before);
 assert.deepEqual(run(1,['goddess-serious']),run(1));
});
test('onslaught halves cooldown time without accelerating windups or party actions, including goddess private timers',()=>{
 const base=run(1),fast=run(1,['onslaught']);S.update(base,100);S.update(fast,100);
 assert.ok(Math.abs((950-base.enemies[0].cooldown)*2-(950-fast.enemies[0].cooldown))<1e-6);
 assert.equal(base.enemies[0].time,fast.enemies[0].time);assert.equal(base.hero.cooldown,fast.hero.cooldown);
 const normal=run('extradimensional-goddess'),quick=run('extradimensional-goddess',['onslaught']);assert.equal(quick.goddess.nextMirror,normal.goddess.nextMirror/2);assert.equal(quick.goddess.nextNormal,normal.goddess.nextNormal/2);
 const api={state:()=>{}};normal.time=quick.time=5000;G.begin(normal,normal.enemies[0],normal.hero,api,[]);G.begin(quick,quick.enemies[0],quick.hero,api,[]);assert.equal(quick.goddess.nextMirror-5000,(normal.goddess.nextMirror-5000)/2);
});
test('unyielding triples resistance and capacity for new actions and repeated interruption scaling',()=>{
 for(const stage of [10,20,30,40,50,60,70,80,90,100,...Trials.gods]){
  const a=final(run(stage)),b=final(run(stage,['unyielding'])),e=a.enemies.find(e=>e.majorBoss||e.type==='treant'),f=b.enemies.find(e=>e.majorBoss||e.type==='treant');const motion=Object.keys(I.ACTIONS[e.type])[0];
  e.interruptCount=f.interruptCount=2;const x=I.begin(a,e,motion,4000,a.hero),y=I.begin(b,f,motion,4000,b.hero);
  assert.equal(y.resistance,x.resistance*3);assert.equal(y.capacity,x.capacity*3);assert.equal(y.remaining,y.capacity);
 }
});
test('fixed-budget danger and both goddess attack paths scale actual outgoing damage',()=>{
 const a=final(run(10)),b=final(run(10,['strength-3'])),e=a.enemies.find(e=>e.majorBoss||e.type==='treant'),f=b.enemies.find(e=>e.majorBoss||e.type==='treant');
 I.begin(a,e,'root-bury',5000,a.hero);I.begin(b,f,'root-bury',5000,b.hero);assert.equal(I.dangerDamage(f.actionThreat,b.hero),I.dangerDamage(e.actionThreat,a.hero)*3);
 for(const [stage,module] of [['extradimensional-goddess',G],['reincarnation-goddess',C]]){
  const base=run(stage),strong=run(stage,['strength-10','goddess-serious']),amounts=[],api={attackPower:(r,e)=>e.damage,hit:(r,e,a,n)=>{amounts.push(n);return true;}};
  if(module===G){module.damage(base,base.enemies[0],base.hero,.1,api,[],'test');module.damage(strong,strong.enemies[0],strong.hero,.1,api,[],'test');}
  else {module.damage(base,base.enemies[0],base.hero,{actionId:'test'},.1,api,[]);module.damage(strong,strong.enemies[0],strong.hero,{actionId:'test'},.1,api,[]);}
  assert.ok(Math.abs(amounts[1]/amounts[0]-30)<1e-9);
 }
});
test('battle snapshots freeze trials for loot, gold, XP and PT; payout retains best win without farming',()=>{
 const s=ready();s.reincarnation.trials=all;s.selectedStage='reincarnation-goddess';const evidence=R.capture(s),r=S.createRun(s.selectedStage,{trials:evidence.trials,builds:{warrior:P.stats(s,'warrior')}});
 s.reincarnation.trials=[];assert.equal(r.trials.reward,225);D.award(s,s.selectedStage,0,evidence);assert.equal(R.payout(s),22500);assert.equal(s.gold,6750000);
 D.award(s,s.selectedStage,0,R.capture(s));assert.equal(R.payout(s),22500);
 const restored=D.readSave(JSON.stringify(s));assert.equal(R.payout(restored),22500);const next=R.prepare(restored,D.freshSave);assert.equal(next.reincarnation.total,23500);assert.equal(next.reincarnation.pendingPoints,0);assert.equal(R.prepare(next,D.freshSave),null);assert.equal(D.readSave(JSON.stringify(next)).reincarnation.total,23500);
 const old=R.restore({...s.reincarnation,version:1,total:999999999,pendingPoints:undefined});assert.equal(old.total,1000);assert.equal(old.pendingPoints,100);
 const stale=ready();R.victory(stale,'reincarnation-goddess',{...evidence,cycle:9});assert.equal(R.payout(stale),0);
});
test('fractional reward counts use guaranteed integers plus one extra roll, all gem copies are distinct',()=>{
 assert.equal(Trials.count(1,1.5,()=>.49),2);assert.equal(Trials.count(1,1.5,()=>.5),1);assert.equal(Trials.count(2,2.25,()=>.49),5);assert.equal(Trials.count(2,2.25,()=>.5),4);
 const s=ready();s.reincarnation.owned=['trial-open','drop2'];const r=S.createRun(1,{builds:{warrior:P.stats(s,'warrior')},trials:{ids:['onslaught']}}),p=Rewards.create(r);
 Rewards.record(p,{type:'loot',enemy:'boss-slime',gold:4,goldRemainder:.5});const loot=Rewards.settle(s,p,true,()=>0);assert.equal(loot.loot.jelly,3);assert.equal(loot.loot.crystal,3);assert.equal(loot.gems.length,3);assert.equal(new Set(loot.gems.map(g=>g.id)).size,3);
 const failed=Rewards.create(r);Rewards.record(failed,{type:'loot',enemy:'treant',gold:100,goldRemainder:.7});const before=JSON.stringify(s);Rewards.settle(s,failed,false);assert.equal(JSON.stringify(s),before);
 const wallet=run(1,['onslaught']);assert.equal(D.addGold(wallet,1),1);assert.equal(wallet.goldRemainder,.5);assert.equal(D.addGold(wallet,1),2);
});
test('XP applies fractional multipliers in normalized progress, including catch-up and zero cutoff',()=>{
 const s=D.freshSave();s.progression.characters.warrior.xp=P.experience(10);P.gainXp(s,10,0,1.5);assert.equal(s.progression.characters.warrior.xp.level,10);assert.ok(Math.abs(s.progression.characters.warrior.xp.progress-.5)<1e-10);
 s.progression.characters.warrior.xp=P.experience(1);P.gainXp(s,100,8,225);assert.equal(s.progression.characters.warrior.xp.level,100);assert.equal(s.progression.characters.warrior.xp.progress,0);
 s.progression.characters.warrior.xp=P.experience(50);P.gainXp(s,1,0,225);assert.deepEqual(s.progression.characters.warrior.xp,P.experience(50));
});
