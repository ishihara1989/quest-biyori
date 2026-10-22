'use strict';
// Solo formation/support adapters are measurement-only until trial design is approved.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {writeAssetJson}=require('../lib/project-paths.cjs'),Seal=require('./measure-seal-reward-route.cjs'),B=require('./audit-chaos-gate.cjs');
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),T=require('../../public/js/data/reincarnation-tree-data.js'),S=require('../../public/js/combat/forest-simulation.js'),Shaman=require('../../public/js/combat/shaman-combat.js'),Miko=require('../../public/js/combat/miko-combat.js'),Castle=require('../../public/js/combat/demon-castle-combat.js');
const JOBS=Object.keys(P.CHARACTERS),cache=new Map();
// Total PT multipliers include the mandatory strength2 / goddess-serious factor.
// The lower common cap deliberately preserves the goddess as the repeat farm.
const suggestedMultipliers={warrior:[6,8,20],mage:[10,18,40],paladin:[20,40,80],ninja:[10,20,80],shaman:[36,70,80],miko:[48,70,80]};
function proposedPointMultiplier(job,tier,regularMultiplier=[1,2,10][tier-1]){
 assert.ok(suggestedMultipliers[job]&&Number.isInteger(tier)&&tier>=1&&tier<=3);assert.ok(Number.isFinite(regularMultiplier)&&regularMultiplier>=1);
 return Math.max(suggestedMultipliers[job][tier-1],Number((regularMultiplier*.8).toFixed(12)));
}
function own(save,id){for(const parent of T.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(save,parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);}
function reference({tier=1,stage='final',ceiling=8000,epic=false,extra=[]}={}){
 assert.ok([1,2,3].includes(tier));assert.ok(['final','chaos-gate'].includes(stage));assert.ok(Number.isFinite(ceiling)&&ceiling>=8000,'this model starts after all nodes priced <=8000 PT');
 const key=JSON.stringify({tier,stage,ceiling,epic,extra});if(cache.has(key))return cache.get(key);
 const save=structuredClone(Seal.fixture(8,{mainOnly:false,allCheap:true}).save);
 for(const n of T.nodes.filter(n=>!n.root&&n.cost<=ceiling))own(save,n.id);
 for(const id of extra)own(save,id);
 const goddessGear=stage==='final'&&tier<3;
 save.cleared=Array.from({length:100},(_,i)=>i+1).concat('dimensional-gate','chaos-gate',...(goddessGear?['extradimensional-goddess']:[]));
 for(const job of JOBS){const c=save.progression.characters[job];c.xp=P.experience(100);
  for(const slot of ['weapon','armor'])c[slot]=P.allGearTrees(job,slot,goddessGear).map(n=>n.id);
  P.respec(save,job);for(const kind of ['active','enhancement','passive'])for(const n of P.SKILLS[job].filter(n=>n.kind===kind))while(P.purchase(save,job,'skills',n.id)){}
 }
 const gems=Seal.halfFill(save);
 if(epic)for(const job of JOBS)for(const slot of ['weapon','armor']){
  const gem=P.addGem(save,P.Gem.generate({rarity:'epic',family:job+'-'+slot}));
  while(!P.equipGem(save,job,slot,gem.id)&&save.progression.characters[job].gems[slot].length)save.progression.characters[job].gems[slot].pop();
  assert.ok(save.progression.characters[job].gems[slot].includes(gem.id),'matching epics require available dedicated capacity');
 }
 save.reincarnation.total=Math.max(1000000,T.spent({owned:new Set(save.reincarnation.owned)}));
 const restored=D.readSave(JSON.stringify(save));for(const job of JOBS)assert.deepEqual(P.stats(save,job),P.stats(restored,job));
 const result={save,gems,goddessGear,...Seal.rewardBuilds(save)};cache.set(key,result);return result;
}
function soloRun(stage,job,build,{tier=1,released=false,random=B.seeded(1)}={}){
 const ids=[...(tier===2?['strength-2']:tier===3?['goddess-serious']:[]),...(released?['gate-release']:[])];
 const run=S.createRun(stage,{builds:{[job]:structuredClone(build)},random,trials:{ids}});
 if(job!=='warrior')run.hero=run.allies.find(a=>a.type===job);
 assert.equal(run.hero.type,job);run.allies=[];run.hero.x=260;run.hero.y=438;run.reincarnationBonuses=build.reincarnationBonuses;
 assert.equal([run.hero,...run.allies].length,1);return run;
}
function supportStep(run,support,state,events=[]){
 if(run.status!=='running'||run.phase!=='combat'||run.hero.hp<=0)return;
 if(state.wave!==run.wave){state.wave=run.wave;state.next=run.time;state.start=run.time;}
 if(run.time+1e-6<state.next)return;state.next+=10000;
 const a=run.hero,live=()=>run.enemies.filter(e=>e.hp>0&&!e.invulnerable&&!e.bodyPart).sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y));
 for(const [job,tier]of Object.entries(support)){
  if(job===a.type||tier<1)continue;const strong=tier>=2,targets=live();state.calls[job]=(state.calls[job]||0)+1;
  const packet=(e,multiplier)=>S.hit(run,a,e,a.damage*multiplier,events,true,job==='mage'?'魔法':null,{secondary:true,critical:false,skipHitRoll:true,curseKind:'solo-support-'+job,actionId:'solo-support-'+job+'-'+run.time});
  if(job==='warrior')for(const e of targets.slice(0,strong?8:4))packet(e,strong?4.5:1);
  if(job==='mage')for(const e of targets.slice(0,strong?8:3)){packet(e,strong?2.5:1.2);if(strong&&e.hp>0)e.freezeUntil=Math.max(e.freezeUntil||0,run.time+1500);}
  if(job==='ninja')for(const e of targets.slice(0,strong?6:3))packet(e,strong?2.4:.7);
  if(job==='shaman')for(const e of targets.slice(0,strong?8:1)){Shaman.debuff(run,e,'attack',strong?.2:.1,strong?5000:3000,a,'solo-support');if(strong){Shaman.debuff(run,e,'defense',.2,5000,a,'solo-support');packet(e,2);}}
  if(job==='paladin'){const old=a.gemBarrier,amount=a.maxHp*(strong?.15:.05);a.gemBarrier={amount:Math.max(old?.until>run.time?old.amount:0,amount),until:run.time+(strong?5000:3000)};}
  if(job==='miko'){
   const heal=Math.min(a.maxHp-a.hp,a.maxHp*(strong?.15:.05)*Castle.healingFactor(a,run.time));a.hp+=heal;state.healing+=heal;
   if(strong){a.mp=Math.min(a.maxMp,a.mp+a.maxMp*.05);if(!run.mikoFestival||run.mikoFestival.until<=run.time)run.mikoFestival={source:a,spec:{id:'solo-kagura',spirit:.2},start:run.time,until:run.time+5000,nextCoop:Infinity};}
  }
 }
}
function battle(job,build,stage,{tier=1,support={},released=false,seed=1}={}){
 const run=soloRun(stage,job,build,{tier,released,random:B.seeded(seed)}),state={wave:-1,next:0,start:0,calls:{},healing:0};
 let peak=0,minHp=1,maxHit=0,incoming=0,outgoing=0,supportDamage=0;const casts={},waveTimes=[];
 const limit=run.stage.timeLimit?184000:600000;
 while(run.time<limit&&run.status==='running'){
  const events=[];supportStep(run,support,state,events);events.push(...S.update(run,S.STEP));
  peak=Math.max(peak,run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart).length);minHp=Math.min(minHp,run.hero.hp/run.hero.maxHp);
  for(const e of events){if(e.type==='damage'){if(e.target===run.hero.id){incoming+=e.amount;maxHit=Math.max(maxHit,e.amount/run.hero.maxHp);}else if(e.target.startsWith('enemy-')){outgoing+=e.amount;if(e.kind?.startsWith('solo-support'))supportDamage+=e.amount;}}
   if(e.type.endsWith('-cast'))casts[e.skillId||'normal']=(casts[e.skillId||'normal']||0)+1;if(e.type==='wave-clear')waveTimes.push(run.time/1000);
  }
 }
 return {seed,status:run.status==='running'?'measurement-limit':run.status,reason:run.failureReason||null,seconds:Number((run.time/1000).toFixed(2)),wave:run.wave+1,kills:run.kills,peak,minHp,maxHit,incoming,outgoing,supportDamage,supportCalls:state.calls,supportHealing:state.healing,remainingHp:run.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart).reduce((n,e)=>n+Math.max(0,e.hp)/e.maxHp,0),casts,waveTimes};
}
function fingerprint(){const hash=crypto.createHash('sha256');for(const file of Object.keys(require.cache).filter(f=>f.includes(path.join('public','js'))).sort())hash.update(fs.readFileSync(file));return hash.digest('hex');}
function soloMikoChoice(run,actor,original){
 const choice=original(run,actor),friends=Miko.party(run),live=Miko.bodies(run);if(friends.length!==1)return choice;
 let best=choice;
 for(const s of actor.mikoSkills||[])if(s.role==='festival'&&actor.mp>=s.mp&&!(actor.mikoCooldowns[s.id]>0)){
  if(run.mikoFestival?.until>run.time+(actor.epicMikoWeapon?3000:0)||!live.length||live.reduce((n,e)=>n+e.hp,0)<actor.damage*3)continue;
  if(!run.mikoContracts.some(c=>c.spec.role==='attack')&&run.time<2000)continue;
  const score=28+s.spirit;if(!best||score>best.score)best={spec:s,target:actor,score};
 }
 return best;
}
function measure({job='warrior',tier=1,stage='final',ceiling=8000,support={},released=false,count=3,epic=false,extra=[],soloAi=false}={}){
 assert.ok(JOBS.includes(job));assert.ok(Number.isInteger(count)&&count>0);
 const data=reference({tier,stage,ceiling,epic,extra}),id=stage==='final'?(tier===3?'extradimensional-goddess':'reincarnation-goddess'):stage;
 const config={job,tier,stage,ceiling,support,released,epic,...(extra.length?{extra}:{}),...(soloAi?{soloAi}: {})},build=data.builds[job];
 const key=crypto.createHash('sha256').update(JSON.stringify({config,build,runtime:fingerprint(),adapter:soloRun.toString(),battle:battle.toString(),support:Object.keys(support).length?supportStep.toString():'',...(soloAi?{ai:soloMikoChoice.toString()}: {})})).digest('hex');
 const file=path.resolve(__dirname,'../../output/solo-progression/cases/'+job+'-t'+tier+'-'+stage+'-'+ceiling+'-'+key.slice(0,10)+'.json');
 const old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null,runs=old?.key===key?old.runs.slice(0,count):[],reused=runs.length;
 const original=Miko.choose;
 try{if(soloAi)Miko.choose=(run,a)=>soloMikoChoice(run,a,original);for(let seed=runs.length+1;seed<=count;seed++){runs.push(battle(job,build,id,{tier,support,released,seed}));if(seed%10===0)console.log(JSON.stringify({job,tier,stage,completed:seed,count,reused}));}}finally{Miko.choose=original;}
 const times=runs.map(r=>r.seconds).sort((a,b)=>a-b),report={key,file,status:'design measurements; solo/support adapters are not runtime trial implementation',config,goddessGear:data.goddessGear,build,owned:data.save.reincarnation.owned,details:data.details[job],gems:data.gems.filter(g=>g.job===job),count,reused,wins:runs.filter(r=>r.status==='victory').length,median:times[Math.floor(count/2)],max:Math.max(...times),runs};
 writeAssetJson(file,report);console.log(JSON.stringify({config,count,reused,wins:report.wins,median:report.median,max:report.max,peak:Math.max(...runs.map(r=>r.peak)),minHp:Math.min(...runs.map(r=>r.minHp)),remaining:runs.map(r=>r.remainingHp)}));return report;
}
if(require.main===module){
 const value=(name,fallback)=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3)||fallback;
 const jobs=value('job','all')==='all'?JOBS:[value('job')],tiers=value('tier','1').split(',').map(Number),stages=value('stage','both')==='both'?['chaos-gate','final']:[value('stage')];
 const support=Object.fromEntries(value('support','').split(',').filter(Boolean).map(x=>{const[job,tier]=x.split(':');return[job,Number(tier)||1];}));
 for(const tier of tiers)for(const job of jobs)for(const stage of stages)measure({job,tier,stage,ceiling:Number(value('ceiling','8000')),support,released:process.argv.includes('--released'),count:process.argv.includes('--full')?30:3,epic:process.argv.includes('--epic'),extra:value('extra','').split(',').filter(Boolean),soloAi:process.argv.includes('--solo-ai')});
}
function route(tier,count=30){
 const completed=Object.fromEntries(tier>1?JOBS.map(job=>[job,tier===2?1:2]):[]),rows=[];
 for(const job of JOBS){const support=Object.fromEntries(Object.entries(completed).filter(([id])=>id!==job));
  for(const stage of ['chaos-gate','final']){
   const r=measure({job,tier,stage,support,count,soloAi:job==='miko'});
   assert.equal(r.wins,count,job+' tier '+tier+' '+stage+' must pass before its reward is used');
   rows.push({job,tier,stage,support,median:r.median,max:r.max,count:r.count,wins:r.wins,peak:Math.max(...r.runs.map(v=>v.peak)),minHp:Math.min(...r.runs.map(v=>v.minHp)),file:r.file});
  }
  completed[job]=Math.min(2,tier);
 }
 const report={status:'design route verified at mixed half-capacity gems, no epics; miko uses the proposed solo AI',tier,order:JOBS,count,rows};
 writeAssetJson(path.resolve(__dirname,'../../output/solo-progression/route-tier-'+tier+'.json'),report);return report;
}
function benchmarkKey(){return crypto.createHash('sha256').update(JSON.stringify({builds:reference({tier:3,stage:'final'}).builds,runtime:fingerprint()})).digest('hex');}
function benchmark(){
 const file=path.resolve(__dirname,'../../output/solo-progression/goddess-benchmark.json'),key=benchmarkKey(),old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 if(old?.key===key)return old;
 const A=require('./audit-trial-progression.cjs'),data=reference({tier:3,stage:'final'}),rows=[];
 for(const n of [1,2,3,4,6,8,10]){const ids=['goddess-serious',...(n>1?['strength-'+n]:[])],runs=[1,2,3].map(seed=>A.battle(data.builds,ids,seed));rows.push({strength:n,multiplier:10*n,runs,median:runs.map(r=>r.seconds).sort((a,b)=>a-b)[1]});}
 const report={key,condition:'all nodes <=8000; all normal gear; no goddess gear/epics; two seal rewards; no solo support',rows};writeAssetJson(file,report);return report;
}
function summarize(){
 const routes=[1,2,3].map(t=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../output/solo-progression/route-tier-'+t+'.json'))));
 const benchmark=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../output/solo-progression/goddess-benchmark.json')));
 const equivalent=seconds=>{const rows=benchmark.rows;for(let i=1;i<rows.length;i++)if(seconds<=rows[i].median){const a=rows[i-1],b=rows[i];return Math.max(10,a.multiplier+(b.multiplier-a.multiplier)*(seconds-a.median)/(b.median-a.median));}return rows.at(-1).multiplier;};
 const rows=JOBS.map(job=>({job,tiers:routes.map((route,i)=>{
  const gate=route.rows.find(r=>r.job===job&&r.stage==='chaos-gate'),final=route.rows.find(r=>r.job===job&&r.stage==='final');assert.equal(gate.wins,30);assert.equal(final.wins,30);
  for(const row of [gate,final]){const evidence=JSON.parse(fs.readFileSync(row.file));assert.ok(evidence.runs.every(r=>r.status==='victory'&&r.kills===(row.stage==='chaos-gate'?128:i===2?2:1)),'all scheduled enemies must be defeated');}
  const total=suggestedMultipliers[job][i],referenceMultiplier=equivalent(final.median);assert.ok(total<referenceMultiplier,'solo PT remains below the matching goddess benchmark / cap');
  return {tier:i+1,totalMultiplier:total,mandatoryMultiplier:[1,2,10][i],ptWithPermanentBonus:total*150,referenceMultiplier,gate,final};
 })}));
 const report={status:'proposal; PT multipliers do not modify runtime trials',condition:'all nodes <=8000; two seal rewards; legal per-journey equipment; miko solo kagura AI; previous class rewards only',ptFormula:'max(soloBase, regularTrials * 0.8); includes mandatory strength2 / goddess-serious',count:1080,rows,benchmark};
 writeAssetJson(path.resolve(__dirname,'../../output/solo-progression/summary.json'),report);console.log(JSON.stringify(rows.map(r=>({job:r.job,tiers:r.tiers.map(t=>({tier:t.tier,multiplier:t.totalMultiplier,pt:t.ptWithPermanentBonus,gate:t.gate.median,final:t.final.median,max:t.final.max,goddessEquivalent:t.referenceMultiplier}))}))));return report;
}
module.exports={JOBS,reference,soloRun,supportStep,battle,measure,soloMikoChoice,route,suggestedMultipliers,proposedPointMultiplier,summarize,benchmark,benchmarkKey};
