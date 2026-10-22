'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const Model=require('./measure-solo-progression.cjs'),Seal=require('./measure-seal-reward-route.cjs'),B=require('./audit-chaos-gate.cjs'),P=require('../../public/js/core/forest-progression.js'),T=require('../../public/js/core/trials.js'),D=require('../../public/js/data/forest-data.js'),S=require('../../public/js/combat/forest-simulation.js'),{writeAssetJson}=require('../lib/project-paths.cjs');
const jobs=Object.keys(P.CHARACTERS),root=path.resolve(__dirname,'../../output/sealed-runtime');
function fixture(seal,stage,prior=[]){
 const save=structuredClone(Model.reference({tier:1,stage}).save);save.gems=[];save.nextGemId=1;for(const c of Object.values(save.progression.characters))c.gems={weapon:[],armor:[]};save.reincarnation.trialCompleted.push(...prior);save.reincarnation.appliedTrials.push(...prior);Object.assign(save.reincarnation,{trials:[seal],trialRun:true});
 for(const job of jobs){const c=save.progression.characters[job];if(seal==='seal-gear')for(const slot of ['weapon','armor'])c[slot]=P.allGearTrees(job,slot,stage==='final').filter(n=>n.main).map(n=>n.id);P.respec(save,job);for(const kind of ['active','enhancement','passive'])for(const n of P.SKILLS[job].filter(n=>n.kind===kind))while(P.purchase(save,job,'skills',n.id)){};}
 Seal.halfFill(save);const restored=D.readSave(JSON.stringify(save));for(const job of jobs){assert.deepEqual(P.stats(save,job),P.stats(restored,job));assert.ok(P.points(save,job)>=0);}return save;
}
function main(count=30){
 const hash=crypto.createHash('sha256');for(const f of [__filename,...Object.keys(require.cache).filter(f=>f.includes(path.join('public','js')))].sort())hash.update(fs.readFileSync(f));const runtime=hash.digest('hex'),prior=[],rows=[];
 for(const seal of ['seal-gems','seal-skills','seal-gear']){
  for(const stage of ['chaos-gate','final']){
   const save=fixture(seal,stage,prior),id=stage==='final'?'reincarnation-goddess':stage,builds=Object.fromEntries(jobs.map(job=>[job,P.stats(save,job)])),key=JSON.stringify({runtime,seal,stage,save}),file=path.join(root,seal+'-'+stage+'.json');const old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null,runs=old?.key===key?old.runs.slice(0,count):[],reused=runs.length;
   for(let seed=runs.length+1;seed<=count;seed++){
    const run=S.createRun(id,{builds,trials:T.capture(save,id),random:B.seeded(seed)});let peak=0;while(run.status==='running'&&run.time<600000){S.update(run,S.STEP);peak=Math.max(peak,run.enemies.filter(e=>e.hp>0&&!e.bodyPart&&!e.dimensionalGate).length);}runs.push({seed,status:run.status,seconds:Number((run.time/1000).toFixed(2)),kills:run.kills,peak,survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length});
   }
   const times=runs.map(r=>r.seconds).sort((a,b)=>a-b),row={key,seal,stage,count,reused,wins:runs.filter(r=>r.status==='victory').length,median:times[Math.floor(count/2)],max:Math.max(...times),runs};writeAssetJson(file,row);rows.push(row);console.log(JSON.stringify({seal,stage,count,reused,wins:row.wins,median:row.median,max:row.max}));assert.equal(row.wins,count);assert.ok(runs.every(r=>r.kills===(stage==='final'?1:128)));
  }prior.push(seal);
 }
 const report={runtime,count,total:rows.reduce((n,r)=>n+r.count,0),condition:'all nodes priced <=8000 PT; no epics; legal per-stage gear; half-capacity gems except gem seal; previous seal rewards only',rows};writeAssetJson(path.join(root,'summary.json'),report);return report;
}
if(require.main===module)main(process.argv.includes('--full')?30:3);module.exports={fixture,main};
