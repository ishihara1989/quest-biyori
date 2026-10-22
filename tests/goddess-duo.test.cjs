'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),S=require('../public/js/combat/forest-simulation.js'),R=require('../public/js/core/reincarnation.js'),T=require('../public/js/core/trials.js'),Tree=require('../public/js/data/reincarnation-tree-data.js'),Unlocks=require('../public/js/ui/forest-unlocks.js');
function ready(){const s=D.freshSave();Object.assign(s.reincarnation,{unlocked:true,discovered:true,cycle:20,total:2000,journey:1,trialRun:true,trials:['goddess-serious'],trialCompleted:['onslaught','unyielding']});const own=id=>{for(const p of Tree.byId[id].requires)if(p!=='origin'&&!s.reincarnation.owned.includes(p))own(p);if(id!=='origin')s.reincarnation.owned.push(id);};own('trial-open');return s;}
const duo=()=>S.createRun('extradimensional-goddess',{random:()=>.5,trials:{ids:['goddess-serious']}});
const kill=(r,e)=>S.hit(r,r.hero,e,1e30,[],false,null,{critical:false});
test('chaos gate unlocks a combined stage only during goddess-serious, including auto advance and unlock notification',()=>{
 const s=ready();assert.equal(D.isUnlocked(s,'extradimensional-goddess'),false);const unlock=Unlocks.collect(s,'chaos-gate');assert.equal(unlock.length,1);assert.equal(unlock[0].detail,'異次元の女神＋転生の女神');s.cleared.push('chaos-gate');assert.ok(D.isUnlocked(s,'extradimensional-goddess'));const stage=D.stageFor(s,'extradimensional-goddess');assert.ok(stage.goddessDuo);assert.equal(D.nextStage('chaos-gate',s),stage);s.autoMode='advance';assert.equal(D.autoDestination(s,'chaos-gate',true).stage,stage.id);
 s.cleared.push('extradimensional-goddess');assert.equal(D.isUnlocked(s,'reincarnation-goddess'),false);assert.equal(D.stageVisible(s,D.ALL_STAGES.at(-1)),false);assert.equal(D.stageCleared(s,stage),false);assert.ok(!D.specialStages(s).some(s=>s.id==='reincarnation-goddess'));
 T.abandon(s);assert.equal(D.stageFor(s,stage.id).goddessDuo,undefined);assert.ok(D.isUnlocked(s,'reincarnation-goddess'));assert.equal(D.nextStage('chaos-gate').name,'異次元の女神');
});
test('both goddess bodies spawn together at 3x and the extradimensional goddess starts immediately in phase 2',()=>{
 const r=duo();assert.equal(r.enemies.length,2);assert.deepEqual(r.stage.waves,[['extradimensional-goddess','reincarnation-goddess']]);const [a,b]=r.enemies;assert.equal(a.goddessPhase,2);assert.equal(a.phaseChangeAt,undefined);assert.equal(a.hp,6e10);assert.equal(a.maxHp,b.maxHp);assert.equal(b.hp,6e10);assert.equal(a.damage,b.damage);assert.equal(a.defense,b.defense);assert.notEqual(a.x,b.x);assert.notEqual(a.y,b.y);
 const normal=S.createRun('extradimensional-goddess');assert.equal(normal.enemies.length,1);assert.equal(normal.enemies[0].goddessPhase,1);assert.equal(normal.enemies[0].maxHp,2.5e9);
 r.hero.hp=r.hero.maxHp=1e12;S.update(r,1000);assert.ok(a.goddessPlan);assert.equal(a.goddessPhase,2);assert.equal(a.phaseChangePending,undefined);
});
test('defeating reincarnation goddess first does not waive defeat or timeout while the other goddess lives',()=>{
 for(const reason of ['party','timeout']){const r=duo();kill(r,r.enemies[1]);assert.equal(r.deliveryVictoryAt,undefined);if(reason==='party')r.hero.hp=0;else{r.hero.hp=r.hero.maxHp=1e12;r.elapsed=180000;}S.update(r,20);assert.equal(r.status,'defeat',reason);assert.equal(r.enemies[0].hp>0,true);}
});
test('either kill order requires both goddesses and waits for both departures; no dead goddess starts a new action',()=>{
 for(const order of [[0,1],[1,0]]){const r=duo();r.hero.hp=r.hero.maxHp=1e12;r.hero.damage=0;kill(r,r.enemies[order[0]]);S.update(r,500);assert.equal(r.status,'running');assert.equal((r.enemies[order[0]].goddessPlan||r.enemies[order[0]].deliveryPlan)??null,null);kill(r,r.enemies[order[1]]);assert.ok(r.deliveryVictoryAt!=null);S.update(r,1000);assert.equal(r.status,'running');S.update(r,1500);assert.equal(r.status,'victory');}
});
test('single goddess victory cannot grant first clear, PT or rebirth during serious trial; combined clear can',()=>{
 const s=ready(),proof=R.capture(s,'reincarnation-goddess');R.victory(s,'reincarnation-goddess',proof);assert.equal(R.eligible(s),false);assert.equal(R.payout(s),0);assert.ok(!T.completed(s).includes('goddess-serious'));assert.equal(R.prepare(s,D.freshSave),null);
 const r=duo();r.hero.hp=r.hero.maxHp=1e12;kill(r,r.enemies[0]);S.update(r,100);assert.equal(r.status,'running');assert.equal(R.eligible(s),false);kill(r,r.enemies[1]);S.update(r,2500);assert.equal(r.status,'victory');D.award(s,r.stage.id,0,R.capture(s,r.stage.id));assert.ok(R.eligible(s));assert.equal(s.reincarnation.duoDefeatedJourney,1);assert.equal(R.payout(s),1000);assert.ok(T.completed(s).includes('goddess-serious'));assert.ok(D.stageCleared(s,D.stageFor(s,r.stage.id)));
 const restored=D.readSave(JSON.stringify(s));assert.ok(R.eligible(restored));const next=R.prepare(restored,D.freshSave);assert.equal(next.reincarnation.total,3000);assert.equal(R.eligible(next),false);assert.equal(next.reincarnation.duoDefeatedJourney,null);
});
test('legacy serious save with a solo win loses unearned qualification while normal saved qualification survives',()=>{
 const s=ready();Object.assign(s.reincarnation,{defeatedCycle:20,pendingPoints:1000});s.cleared=['chaos-gate','extradimensional-goddess'];s.selectedStage='reincarnation-goddess';const restored=D.readSave(JSON.stringify(s));assert.equal(restored.selectedStage,'extradimensional-goddess');assert.equal(R.eligible(restored),false);assert.equal(R.payout(restored),0);
 s.reincarnation.trials=[];s.reincarnation.trialRun=false;assert.ok(R.eligible(D.readSave(JSON.stringify(s))));
});
