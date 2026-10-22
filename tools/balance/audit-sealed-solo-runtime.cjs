'use strict';
// Production formation, rewards, AI and support; no combat adapters or monkey patches.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const Model=require('./measure-solo-progression.cjs'),P=require('../../public/js/core/forest-progression.js'),T=require('../../public/js/core/trials.js'),S=require('../../public/js/combat/forest-simulation.js'),D=require('../../public/js/data/forest-data.js'),B=require('./audit-chaos-gate.cjs'),{writeAssetJson}=require('../lib/project-paths.cjs');
const jobs=Object.keys(P.CHARACTERS),root=path.resolve(__dirname,'../../output/sealed-solo-runtime');
const sourceHash=()=>{const h=crypto.createHash('sha256');for(const f of [__filename,...Object.keys(require.cache).filter(f=>f.includes(path.join('public','js')))].sort())h.update(fs.readFileSync(f));return h.digest('hex');};
function fixture(tier,stage,prior=[],extra=[]){
 const reference=Model.reference({tier,stage,extra}),save=structuredClone(reference.save);
 const rewards=['seal-gems','seal-skills',...prior];save.reincarnation.trialCompleted.push(...rewards);save.reincarnation.appliedTrials.push(...rewards);
 // Native rewards must preserve the measured primary stats at the reference build.
 for(const job of jobs.filter(job=>!prior.includes(`solo-${job}-3`))){const actual=P.stats(save,job),expected=reference.builds[job];for(const key of ['damage','maxHp','defense','maxMp','mpRegen','skillRange'])assert.ok(Math.abs(actual[key]-expected[key])<1e-8*Math.max(1,expected[key]),`${job} ${key}: ${actual[key]} / ${expected[key]}`);}
 return save;
}
function battle(save,job,tier,stage,seed){
 const trial=`solo-${job}-${tier}`;Object.assign(save.reincarnation,{trials:[trial],trialRun:true});assert.ok(T.validPlan(save,[trial]));
 const id=stage==='final'?(tier===3?'extradimensional-goddess':'reincarnation-goddess'):stage,build=P.stats(save,job);
 const run=S.createRun(id,{builds:{[job]:build},trials:T.capture(save,id),random:B.seeded(seed)});assert.equal(run.hero.type,job);assert.equal(run.allies.length,0);
 let peak=0,minHp=1,supportDamage=0;const casts={};
 while(run.status==='running'&&run.time<(run.stage.timeLimit?184000:600000)){
  const events=S.update(run,S.STEP);peak=Math.max(peak,run.enemies.filter(e=>e.hp>0&&!e.bodyPart&&!e.dimensionalGate).length);minHp=Math.min(minHp,run.hero.hp/run.hero.maxHp);
  for(const e of events){if(e.type==='damage'&&e.kind?.startsWith('solo-support'))supportDamage+=e.amount;if(e.type.endsWith('-cast'))casts[e.skillId||'normal']=(casts[e.skillId||'normal']||0)+1;}
 }
 return {seed,status:run.status,seconds:Number((run.time/1000).toFixed(2)),kills:run.kills,peak,minHp,supportDamage,supportCalls:run.soloSupport?.calls||{},casts};
}
function main(count=30){
 const runtime=sourceHash(),rows=[];
 for(const tier of [1,2,3]){
  const prior=tier>1?jobs.flatMap(job=>Array.from({length:tier-1},(_,i)=>`solo-${job}-${i+1}`)):[];
  for(const job of jobs){
   for(const stage of ['chaos-gate','final']){
    const save=fixture(tier,stage,prior),key=crypto.createHash('sha256').update(JSON.stringify({runtime,tier,job,stage,save})).digest('hex'),file=path.join(root,`${job}-${tier}-${stage}.json`);
    const old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null,runs=old?.key===key?old.runs.slice(0,count):[],reused=runs.length;
    for(let seed=runs.length+1;seed<=count;seed++)runs.push(battle(save,job,tier,stage,seed));
    const sorted=runs.map(r=>r.seconds).sort((a,b)=>a-b),row={key,job,tier,stage,count,reused,wins:runs.filter(r=>r.status==='victory').length,median:sorted[Math.floor(count/2)],max:Math.max(...sorted),peak:Math.max(...runs.map(r=>r.peak)),multiplier:T.summarize([`solo-${job}-${tier}`]).reward,runs};
    writeAssetJson(file,row);rows.push(row);console.log(JSON.stringify({job,tier,stage,count,reused,wins:row.wins,median:row.median,max:row.max,peak:row.peak}));
    assert.equal(row.wins,count,`${job} ${tier} ${stage}`);assert.ok(runs.every(r=>r.kills===(stage==='chaos-gate'?128:tier===3?2:1)),'every scheduled enemy defeated');
   }
   prior.push(`solo-${job}-${tier}`);
  }
 }
 const report={runtime,count,total:rows.reduce((n,r)=>n+r.count,0),condition:'all nodes priced <=8000 PT; legal per-stage gear, half-capacity gems; previous class clears only; production AI/support/seal rewards',rows};writeAssetJson(path.join(root,'summary.json'),report);return report;
}
if(require.main===module)main(process.argv.includes('--full')?30:3);module.exports={fixture,battle,main};
