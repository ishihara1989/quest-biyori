'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {writeAssetJson}=require('../lib/project-paths.cjs'),D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),S=require('../../public/js/combat/forest-simulation.js'),T=require('../../public/js/core/trials.js'),A=require('./audit-balance.cjs'),C=require('./audit-chaos-gate.cjs');
function reference(stage){
 const save=stage==='dimensional-gate'?A.referenceBuild(50,50).save:C.fullBuild(8);
 if(stage==='dimensional-gate')for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor'])save.progression.characters[job][slot]=P.allGearTrees(job,slot).filter(n=>n.stage<=50).map(n=>n.id);
 // Both prerequisite first-clear rewards are available before this trial.
 save.reincarnation.appliedTrials=['onslaught','unyielding'];
 return C.builds(save);
}
function battle(stage,builds,seed,released){
 const run=S.createRun(stage,{builds,random:C.seeded(seed),trials:T.summarize(released?['gate-release']:[],stage)});let maxHit=0;
 for(let t=0;t<300000&&run.status==='running';t+=100)for(const e of S.update(run,100))if(e.type==='damage'){
  const actor=[run.hero,...run.allies].find(a=>a.id===e.target);if(actor)maxHit=Math.max(maxHit,e.amount/actor.maxHp);
 }
 return {seed,status:run.status,seconds:Number((run.time/1000).toFixed(3)),kills:run.kills,survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length,maxHit};
}
function audit(count=30,measure=false){
 const report={reference:'No gems/potions; onslaught and unyielding permanent rewards; dimensional gate Lv50/full region1-5 gear, chaos gate Lv100/full region1-8 gear',count,stages:[]};
 for(const stage of ['dimensional-gate','chaos-gate']){
  const builds=reference(stage),row={stage,modes:[]};
  for(const released of [false,true]){
   const runs=Array.from({length:count},(_,i)=>battle(stage,builds,i+1,released)),times=runs.map(r=>r.seconds).sort((a,b)=>a-b);
   const result={released,wins:runs.filter(r=>r.status==='victory').length,median:times[Math.floor(times.length/2)],maxHit:Math.max(...runs.map(r=>r.maxHit)),runs};row.modes.push(result);
   console.log(JSON.stringify({stage,released,count,wins:result.wins,median:result.median,maxHit:result.maxHit}));
  }
  report.stages.push(row);
 }
 writeAssetJson(path.resolve(__dirname,'../../output/gate-release/balance'+(count===30?'':'-quick')+'.json'),report);
 if(!measure)for(const row of report.stages){assert.ok(row.modes.every(m=>m.wins===count),row.stage+' must remain clearable with prerequisite rewards');assert.ok(row.modes[1].median<row.modes[0].median,row.stage+' should clear faster');assert.ok(row.modes.every(m=>m.runs.every(r=>r.kills===128&&r.maxHit<=.51)),row.stage+' kill budget and hit limit');}
 return report;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30,process.argv.includes('--measure'));
module.exports={reference,battle,audit};