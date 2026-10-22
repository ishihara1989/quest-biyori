'use strict';
// Design measurements only: never enables an unimplemented trial in the game.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {writeAssetJson}=require('../lib/project-paths.cjs');
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),T=require('../../public/js/data/reincarnation-tree-data.js'),Trials=require('../../public/js/core/trials.js'),S=require('../../public/js/combat/forest-simulation.js'),B=require('./audit-chaos-gate.cjs');
function own(save,id){for(const parent of T.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(save,parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);}
function fillGems(save){
 const random=B.seeded(4281),rows=[];
 for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
  const cap=P.capacity(save,job,slot),budget=(cap.attack+cap.defense+cap.utility+cap.common)*.5;
  const families=slot==='weapon'?['attack','siphon','range','recovery','interference','haste']:['vitality','defense','aegis','recovery','reprisal','resistance'];
  for(let i=0;i<120;i++){
   const family=families[i%families.length];if(!P.Gem.OPTIONS[family].jobs.includes(job))continue;
   const gem=P.Gem.generate({rarity:'legendary',family,level:10,random});gem.quality=1;
   const used=P.gemUsage(save,job,slot).used,total=used.attack+used.defense+used.utility;
   const cost=P.gemCost(save,job,slot,gem);
   if(total+cost>budget)continue;
   const added=P.addGem(save,gem);if(!P.equipGem(save,job,slot,added.id)){save.gems=save.gems.filter(g=>g.id!==added.id);}
  }
  const usage=P.gemUsage(save,job,slot),used=usage.used.attack+usage.used.defense+usage.used.utility;
  assert.ok(usage.fits&&used/budget>=.8&&used<=budget);
  rows.push({job,slot,ordinaryCapacity:budget*2,used,fill:used/(budget*2),gems:save.progression.characters[job].gems[slot].map(id=>P.gemInstance(save,id))});
 }
 return rows;
}
function reference(step=5,restriction='none'){
 const save=B.fullBuild(10);save.cleared.push('dimensional-gate','chaos-gate','extradimensional-goddess');
 const completed=['strength-2','onslaught','unyielding','goddess-serious','gate-release'];
 Object.assign(save.reincarnation,{discovered:true,unlocked:true,cycle:1000,total:100000,trialCompleted:[...completed],appliedTrials:[...completed]});
 own(save,'trial-open');own(save,'cycle-bond');
 for(const family of ['power','guard'])own(save,T.branches.find(b=>b.family===family).ids[step-1]);
 for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor'])save.progression.characters[job][slot].push(...P.gearTree(job,slot,'goddess').map(n=>n.id));
 const gems=fillGems(save);
 // Freeze a simple legal skill policy, including spare SP: actives, then
 // enhancements in tree order, then passives; no per-encounter optimization.
 for(const job of Object.keys(P.CHARACTERS)){
  P.respec(save,job);
  const cap=restriction==='skills50'?50:100,nodes=P.SKILLS[job].filter(n=>(n.unlockLevel||1)<=cap);
  for(const kind of ['active','enhancement','passive'])for(const n of nodes.filter(n=>n.kind===kind))while(P.purchase(save,job,'skills',n.id)){}
 }
 if(restriction==='no-gems')for(const c of Object.values(save.progression.characters))c.gems={weapon:[],armor:[]};
 if(restriction==='main-only')for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor'])save.progression.characters[job][slot]=P.allGearTrees(job,slot).filter(n=>n.main).map(n=>n.id);
 // Main-only also loses branch capacity: remove illegal gems and respec to the
 // reduced SP budget, while preserving the same preference order.
 if(restriction==='main-only')for(const job of Object.keys(P.CHARACTERS)){
  const c=save.progression.characters[job];for(const slot of ['weapon','armor'])while(!P.gemUsage(save,job,slot).fits)c.gems[slot].pop();
  P.respec(save,job);for(const kind of ['active','enhancement','passive'])for(const n of P.SKILLS[job].filter(n=>n.kind===kind))while(P.purchase(save,job,'skills',n.id)){}
 }
 const restored=D.readSave(JSON.stringify(save));
 for(const job of Object.keys(P.CHARACTERS)){
  assert.ok(P.points(save,job)>=0);assert.deepEqual(P.stats(restored,job),P.stats(save,job),'reference stats must survive save validation: '+restriction+' '+job);
  for(const slot of ['weapon','armor'])assert.ok(P.gemUsage(save,job,slot).fits);
 }
 return {save,gems,skills:Object.fromEntries(Object.keys(P.CHARACTERS).map(job=>[job,{ranks:save.progression.characters[job].skillRanks,total:P.totalPoints(save,job),remaining:P.points(save,job)}]))};
}
function battle(builds,ids,seed){
 const stage=ids.includes('goddess-serious')?'extradimensional-goddess':'reincarnation-goddess';
 const run=S.createRun(stage,{builds,random:B.seeded(seed),trials:Trials.summarize(ids,stage)});let maxHit=0;
 for(let time=0;time<184000&&run.status==='running';time+=100)for(const event of S.update(run,100))if(event.type==='damage'){
  const actor=[run.hero,...run.allies].find(a=>a.id===event.target);if(actor)maxHit=Math.max(maxHit,event.amount/actor.maxHp);
 }
 return {seed,status:run.status,reason:run.failureReason,seconds:Number((run.time/1000).toFixed(2)),remainingHp:run.enemies.filter(e=>e.hp>0).reduce((s,e)=>s+e.hp/e.maxHp,0),survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length,maxHit};
}
function audit({count=3,scenario='baseline',caseName=''}={}){
 const cases=scenario==='baseline'?[3,4,5].map(step=>
  ({name:'serious-'+step,step,restriction:'none',ids:['goddess-serious','onslaught','unyielding','gate-release']})):
  ['no-gems','skills50','main-only'].flatMap(restriction=>[false,true].map(serious=>({name:restriction+(serious?'-serious':'-single'),step:5,restriction,ids:[...(serious?['goddess-serious']:[]),'onslaught','unyielding','gate-release']})));
 const rows=[];
 const previousFile=path.resolve(__dirname,'../../output/trial-progression/'+scenario+'-3.json');
 const previous=fs.existsSync(previousFile)?JSON.parse(fs.readFileSync(previousFile,'utf8')):null;
 const unchanged=previous&&Object.keys(require.cache).filter(file=>file.includes(path.join('public','js'))).every(file=>fs.statSync(file).mtimeMs<=fs.statSync(previousFile).mtimeMs);
 for(const c of cases.filter(c=>!caseName||c.name===caseName)){
  const {save,gems,skills}=reference(c.step,c.restriction),builds=B.builds(save),prior=unchanged&&previous.rows.find(row=>row.name===c.name&&row.step===c.step&&JSON.stringify(row.ids)===JSON.stringify(c.ids)&&JSON.stringify(row.gems)===JSON.stringify(gems)&&JSON.stringify(row.skills)===JSON.stringify(skills));
  const runs=prior?prior.runs.slice(0,count):[];const reused=runs.length;
  for(let seed=runs.length+1;seed<=count;seed++){runs.push(battle(builds,c.ids,seed));if(seed%10===0)console.log(JSON.stringify({name:c.name,completed:seed,count,reused}));}
  const times=runs.map(r=>r.seconds).sort((a,b)=>a-b);
  const row={...c,count,reused,wins:runs.filter(r=>r.status==='victory').length,median:times[Math.floor(times.length/2)],pt:Math.round(100*Trials.summarize(c.ids).reward*Trials.bonuses(save).pt),spent:T.spent({owned:new Set(save.reincarnation.owned)}),gems,skills,runs};
  rows.push(row);console.log(JSON.stringify({name:c.name,count,wins:row.wins,median:row.median,pt:row.pt,survivors:runs.map(r=>r.survivors),remainingHp:runs.map(r=>r.remainingHp)}));
 }
 const report={status:'measurement, not an acceptance check',reference:'Lv100; all normal and goddess gear; ordinary Lv10 legendary gems at 40–50% of non-dedicated capacity; no epics or potions; fixed legal skill priority; only listed reincarnation nodes and applied first-clear rewards',count,rows};
 assert.ok(rows.length,'unknown measurement case');writeAssetJson(path.resolve(__dirname,'../../output/trial-progression/'+scenario+(caseName?'-'+caseName:'')+'-'+count+'.json'),report);return report;
}
if(require.main===module)audit({count:process.argv.includes('--full')?30:3,scenario:process.argv.includes('--restrictions')?'restrictions':'baseline',caseName:process.argv.find(a=>a.startsWith('--case='))?.slice(7)||''});
module.exports={reference,battle,audit,fillGems};
