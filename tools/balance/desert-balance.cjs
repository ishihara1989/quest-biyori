'use strict';
const A=require('./audit-balance.cjs'),D=require('../../public/js/data/forest-data.js'),S=require('../../public/js/combat/forest-simulation.js'),cache=new Map();
const median=a=>{a=[...a].sort((a,b)=>a-b);return a.length?a[Math.floor(a.length/2)]:null;};
function evaluate(stage,lag=1,seeds=[0,1,2],profile=null){const old=D.STAGES[stage-1];if(profile)D.STAGES[stage-1]=D.tuneStage(old,profile);
  try{const key=stage+':'+lag;if(!cache.has(key))cache.set(key,A.referenceBuild(stage,stage-lag).builds);const runs=seeds.map(seed=>{let n=seed;const run=S.createRun(stage,{builds:structuredClone(cache.get(key)),random:()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;}});let peak=0,healing=0,barrier=0;
    for(let t=0;t<600000&&run.status==='running';t+=100)for(const e of S.update(run,100)){if(e.type==='heal'&&e.source==='miko')healing+=e.amount;if(e.type==='miko-block')barrier+=e.amount;if(e.type==='damage'){const a=[run.hero,...run.allies].find(a=>a.id===e.target);if(a)peak=Math.max(peak,e.amount/a.maxHp);}}
    const party=[run.hero,...run.allies];return{seed,status:run.status==='running'?'timeout':run.status,seconds:run.time/1000,survivors:party.filter(a=>a.hp>0).length,frontHp:Math.min(...party.filter(a=>['warrior','paladin'].includes(a.type)).map(a=>a.hp/a.maxHp)),peak,healing,barrier};});const wins=runs.filter(r=>r.status==='victory');return{wins:wins.length,defeats:runs.filter(r=>r.status==='defeat').length,timeouts:runs.filter(r=>r.status==='timeout').length,intact:wins.filter(r=>r.survivors===6).length,seeds:seeds.length,seconds:median(wins.map(r=>r.seconds)),frontHp:median(wins.map(r=>r.frontHp)),peak:Math.max(...runs.map(r=>r.peak)),runs};
  }finally{D.STAGES[stage-1]=old;}
}
module.exports={evaluate};
