'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,D=require('../../public/js/data/forest-data.js'),Sim=require('../../public/js/combat/forest-simulation.js'),A=require('./audit-balance.cjs');
const cache=new Map(),seeded=seed=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const median=a=>{a=[...a].sort((a,b)=>a-b);return a.length?a[Math.floor(a.length/2)]:null;};
function sample(stage,lag=1,seed=0,disabled=false,profile=null){const old=D.STAGES[stage-1];if(profile)D.STAGES[stage-1]=D.tuneStage(old,profile);
  try{const key=stage+':'+lag;if(!cache.has(key))cache.set(key,A.referenceBuild(stage,stage-lag).builds);const run=Sim.createRun(stage,{builds:structuredClone(cache.get(key)),random:seeded(seed),disableMikoSupport:disabled});let healing=0,barrier=0,peak=0;
    for(let t=0;t<180000&&run.status==='running';t+=100)for(const e of Sim.update(run,100)){if(e.type==='heal'&&e.source==='miko')healing+=e.amount;if(e.type==='miko-block')barrier+=e.amount;if(e.type==='damage'){const actor=[run.hero,...run.allies].find(a=>a.id===e.target);if(actor)peak=Math.max(peak,e.amount/actor.maxHp);}}
    const party=[run.hero,...run.allies];return {seed,status:run.status==='running'?'timeout':run.status,seconds:run.time/1000,survivors:party.filter(a=>a.hp>0).length,frontHp:Math.min(...party.filter(a=>['warrior','paladin'].includes(a.type)).map(a=>a.hp/a.maxHp)),healing,barrier,peak};
  }finally{D.STAGES[stage-1]=old;}
}
function evaluate(stage,lag=1,seeds=[0,1,2],disabled=false,profile=null){const runs=seeds.map(seed=>sample(stage,lag,seed,disabled,profile)),wins=runs.filter(r=>r.status==='victory');return {wins:wins.length,intact:wins.filter(r=>r.survivors===6).length,seeds:seeds.length,seconds:median(wins.map(r=>r.seconds)),frontHp:median(wins.map(r=>r.frontHp)),healing:median(runs.map(r=>r.healing)),barrier:median(runs.map(r=>r.barrier)),peak:Math.max(...runs.map(r=>r.peak)),runs};}
function audit(count=30){const seeds=Array.from({length:count},(_,i)=>i),rows=[];for(let stage=41;stage<=50;stage++){const row={stage,profile:D.STAGE_TUNING[stage],reference:evaluate(stage,0,seeds),first:evaluate(stage,1,seeds),unsupported:evaluate(stage,0,seeds,true),stale:evaluate(stage,10,seeds)};rows.push(row);console.log(JSON.stringify({stage,reference:[row.reference.wins,row.reference.intact,row.reference.seconds?.toFixed(1)],first:row.first.wins,unsupported:[row.unsupported.wins,row.unsupported.intact],stale:row.stale.wins,peak:row.first.peak.toFixed(3)}));}
  const dir=path.resolve(__dirname,'../../output/ruins-implementation');fs.mkdirSync(dir,{recursive:true});writeAssetJson(path.join(dir,'balance.json'), rows);
  const table=['# 遺跡の実戦検証','',count+'配置。想定レベル、加入済み6人、解放順の最大ランクアクティブ、主道のみ。枝・ジェム・薬なし。支援OFFは巫女を残し、回復とバリアのみ停止。','', '| ステージ | 適正 勝利/全員生存 | 秒（中央値） | 初回 勝利/全員生存 | 支援OFF 勝利/全員生存 | 装備10段階遅れ 勝利 | 最大単発HP比（初回） | 巫女回復 / バリア（初回中央値） |','| --- | --- | ---: | --- | --- | --- | ---: | ---: |',...rows.map(r=>'| '+[D.stageLabel(r.stage),r.reference.wins+'/'+r.reference.intact,r.reference.seconds?.toFixed(1)||'—',r.first.wins+'/'+r.first.intact,r.unsupported.wins+'/'+r.unsupported.intact,r.stale.wins,(r.first.peak*100).toFixed(1)+'%',r.first.healing+' / '+r.first.barrier].join(' | ')+' |')];fs.writeFileSync(path.join(dir,'balance.md'),table.join('\n')+'\n');return rows;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30);
module.exports={sample,evaluate,audit};
