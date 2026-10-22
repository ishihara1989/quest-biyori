'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../tools/balance/measure-solo-progression.cjs'),S=require('../public/js/combat/forest-simulation.js'),Miko=require('../public/js/combat/miko-combat.js');
test('every class is the only living party actor, including the primary hero slot',()=>{
 const data=M.reference({tier:1,stage:'chaos-gate'});
 for(const job of M.JOBS){const r=M.soloRun(1,job,data.builds[job]);assert.equal(r.hero.type,job);assert.equal(r.allies.length,0);assert.equal([r.hero,...r.allies].filter(a=>a.hp>0).length,1);
  const id=r.hero.id;for(let t=0;t<5000&&r.kills===0;t+=100)S.update(r,100);assert.equal(r.hero.id,id);assert.ok(r.kills>0,job+' must execute its own AI');if(job!=='warrior')assert.notEqual(r.hero.id,'hero');
 }
});
test('tier II forces strength2; tier III forces the simultaneous serious fight and cannot borrow future goddess gear',()=>{
 const two=M.reference({tier:2,stage:'final'}),three=M.reference({tier:3,stage:'final'});
 const a=M.soloRun('reincarnation-goddess','warrior',two.builds.warrior,{tier:2}),b=M.soloRun('extradimensional-goddess','warrior',three.builds.warrior,{tier:3});
 assert.equal(a.trials.stats,2);assert.deepEqual(a.trials.ids,['strength-2']);assert.equal(b.enemies.length,2);assert.equal(b.enemies[0].goddessPhase,2);assert.equal(b.enemies[0].maxHp,6e10);
 assert.equal(two.goddessGear,true);assert.equal(three.goddessGear,false);assert.equal(two.details.warrior.totalSp,320);assert.equal(three.details.warrior.totalSp,260);
 for(const job of M.JOBS)assert.ok(Object.entries(three.builds[job]).filter(([key])=>key.startsWith('epic')).every(([,value])=>!value));
});
test('support fires once at wave start and every ten seconds, excludes itself and stops outside combat',()=>{
 const data=M.reference({tier:1,stage:'chaos-gate'}),r=M.soloRun('chaos-gate','warrior',data.builds.warrior),state={wave:-1,calls:{},healing:0};
 r.hero.hp=r.hero.maxHp*.5;M.supportStep(r,{warrior:2,miko:1},state);assert.equal(state.calls.warrior,undefined);assert.equal(state.calls.miko,1);
 assert.ok(Math.abs(r.hero.hp/r.hero.maxHp-.55)<1e-10);r.time=9999;M.supportStep(r,{miko:1},state);assert.equal(state.calls.miko,1);
 r.time=10000;M.supportStep(r,{miko:1},state);assert.equal(state.calls.miko,2);r.phase='between';r.time=20000;M.supportStep(r,{miko:1},state);assert.equal(state.calls.miko,2);
 r.phase='combat';r.wave++;M.supportStep(r,{miko:1},state);assert.equal(state.calls.miko,3);r.status='victory';r.time=30000;M.supportStep(r,{miko:1},state);assert.equal(state.calls.miko,3);assert.equal(r.allies.length,0);
});
test('proposed solo miko AI permits kagura for one actor and preserves multi-character choices',()=>{
 const data=M.reference({tier:3,stage:'final'}),r=M.soloRun('extradimensional-goddess','miko',data.builds.miko,{tier:3});r.time=2500;
 const chosen=M.soloMikoChoice(r,r.hero,()=>null);assert.equal(chosen.spec.role,'festival');
 const original={spec:{id:'sentinel'},score:999};r.allies=[{...r.hero,id:'a'},{...r.hero,id:'b'}];assert.equal(M.soloMikoChoice(r,r.hero,()=>original),original);
 assert.equal(typeof Miko.choose,'function');
});
test('proposed solo PT totals include mandatory trials and preserve the ordinary goddess farm',()=>{
 assert.equal(M.proposedPointMultiplier('warrior',2,2),8);assert.equal(M.proposedPointMultiplier('miko',3,10),80);
 for(const job of M.JOBS)for(const tier of [1,2,3])assert.equal(M.proposedPointMultiplier(job,tier,100),80);
 assert.equal(M.proposedPointMultiplier('miko',3,270),216);assert.equal(M.proposedPointMultiplier('miko',3,10125),8100);
 for(const values of Object.values(M.suggestedMultipliers))assert.ok(values[0]<values[1]&&values[1]<values[2]);
});
