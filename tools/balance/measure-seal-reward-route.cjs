'use strict';
// Hypothetical first-clear rewards for design measurements, never runtime content.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {writeAssetJson}=require('../lib/project-paths.cjs');
const A=require('./audit-trial-progression.cjs'),B=require('./audit-chaos-gate.cjs'),D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),T=require('../../public/js/data/reincarnation-tree-data.js');
function own(save,id){for(const parent of T.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(save,parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);}
function skills(save){for(const job of Object.keys(P.CHARACTERS)){P.respec(save,job);for(const kind of ['active','enhancement','passive'])for(const n of P.SKILLS[job].filter(n=>n.kind===kind))while(P.purchase(save,job,'skills',n.id)){};}}
function halfFill(save){
 const random=B.seeded(4281),rows=[];
 for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
  const c=save.progression.characters[job];c.gems[slot]=[];
  const cap=P.capacity(save,job,slot),total=cap.attack+cap.defense+cap.utility+cap.common;
  const families=slot==='weapon'?['attack','recovery','haste','siphon','range']:['vitality','recovery','defense','aegis','resistance'];
  for(let i=0;i<30;i++)for(const rarity of ['legendary','unique','rare']){
   const family=families[i%families.length];if((P.Gem.OPTIONS[family].min||0)>P.Gem.TIERS[rarity].rank)continue;
   const gem=P.Gem.generate({rarity,family,level:10,random});gem.quality=1;
   const used=P.gemUsage(save,job,slot).used,current=used.attack+used.defense+used.utility;
   if(current+P.gemCost(save,job,slot,gem)>total*.5)continue;
   const added=P.addGem(save,gem);if(!P.equipGem(save,job,slot,added.id))save.gems=save.gems.filter(g=>g.id!==added.id);
  }
  const used=P.gemUsage(save,job,slot).used;assert.ok(P.gemUsage(save,job,slot).fits);
  rows.push({job,slot,capacity:total,used:used.attack+used.defense+used.utility,fill:(used.attack+used.defense+used.utility)/total,gems:c.gems[slot].map(id=>P.gemInstance(save,id))});
 }
 return rows;
}
function legendaryReward(job){
 const result={};
 for(const [key,option]of Object.entries(P.Gem.OPTIONS))if((option.min||0)<=2&&option.jobs.includes(job)){
  const gem=P.Gem.generate({rarity:'legendary',family:key,level:10,random:B.seeded(100+key.length)});gem.quality=1;
  const value=P.Gem.describe(gem).effect[option.key];assert.ok(Number.isFinite(value));
  result[option.key]=(result[option.key]||0)+value*(['damage','maxHp','defense'].includes(option.key)?3:1);
 }
 return result;
}
function rewardBuilds(save,{gems=true,sp=true}={}){
 const result={},details={},before=JSON.stringify(save),original=P.Gem.describe;
 for(const job of Object.keys(P.CHARACTERS)){
  // A transient effect source lets the existing stat/spec pipeline add the
  // hypothetical flat reward before passives. It is never saved or equipped.
  const copy=structuredClone(save),effect=gems?legendaryReward(job):{},proxy={id:999999999,hypotheticalReward:true};
  copy.gems.push(proxy);copy.progression.characters[job].gems.weapon.push(proxy.id);
  let stats;try{P.Gem.describe=gem=>gem===proxy?{effect}:original(gem);stats=P.stats(copy,job);}finally{P.Gem.describe=original;}
  const ordinary=slot=>{const c=P.capacity(save,job,slot);return c.attack+c.defense+c.utility+c.common;};
  const totalSp=P.totalPoints(save,job),spMultiplier=sp?1+Math.max(0,totalSp-100)/100:1;
  const damageMultiplier=(gems?1+ordinary('weapon')/10000:1)*spMultiplier,hpMultiplier=(gems?1+ordinary('armor')/10000:1)*spMultiplier;
  for(const key of ['baseDamage','weaponDamage','magicDamage','damage','skillDamage'])stats[key]*=damageMultiplier;
  stats.maxHp*=hpMultiplier;
  result[job]=stats;details[job]={flat:effect,totalSp,spMultiplier,damageMultiplier,hpMultiplier,damage:stats.damage,hp:stats.maxHp,defense:stats.defense,mpRegen:stats.mpRegen};
 }
 assert.equal(P.Gem.describe,original);assert.equal(JSON.stringify(save),before,'measurement must not mutate the playable save');
 return {builds:result,details};
}
function fixture(step=8,{spNodes=false,mainOnly=true,rewards=true,allCheap=false}={}){
 const {save}=A.reference(step,mainOnly?'main-only':'none');
 if(allCheap){
  save.reincarnation.total=1000000;
  for(const node of T.nodes.filter(n=>!n.root&&n.cost<=8000))own(save,node.id);
 }
 if(mainOnly)for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor'])save.progression.characters[job][slot]=P.allGearTrees(job,slot,true).filter(n=>n.main).map(n=>n.id);
 if(spNodes)own(save,'sp30');skills(save);const gems=halfFill(save);
 const restored=D.readSave(JSON.stringify(save));for(const job of Object.keys(P.CHARACTERS)){assert.deepEqual(P.stats(save,job),P.stats(restored,job));assert.ok(P.points(save,job)>=0);}
 const reward=rewardBuilds(save,{gems:rewards,sp:rewards});
 return {save,gems,...reward};
}
function measure({step=8,spNodes=false,serious=false,strength=0,count=3,mainOnly=true,rewards=true,allCheap=false}={}){
 const config={step,spNodes,serious,strength,mainOnly,rewards,allCheap},ids=[...(serious?['goddess-serious']:[]),...(strength?['strength-'+strength]:[]),'onslaught','unyielding','gate-release'];
 const data=fixture(step,{spNodes,mainOnly,rewards,allCheap}),file=path.resolve(__dirname,'../../output/trial-progression/rewards-'+(mainOnly?'main':'full')+'-'+step+'-'+(allCheap?'all8000':spNodes?'sp200':'sp100')+'-'+(serious?'serious':'single')+'-str'+strength+'-'+(rewards?'yes':'no')+'.json');
 const key=JSON.stringify({config,ids,builds:data.builds,gems:data.gems}),old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 const unchanged=old&&Object.keys(require.cache).filter(source=>source!==__filename&&(source.includes(path.join('public','js'))||source.endsWith('audit-trial-progression.cjs'))).every(source=>fs.statSync(source).mtimeMs<=fs.statSync(file).mtimeMs);
 const runs=unchanged&&old.key===key?old.runs.slice(0,count):[],reused=runs.length;
 for(let seed=runs.length+1;seed<=count;seed++){runs.push(A.battle(data.builds,ids,seed));if(seed%10===0)console.log(JSON.stringify({config,completed:seed,count,reused}));}
 const times=runs.map(r=>r.seconds).sort((a,b)=>a-b),row={key,status:'hypothetical rewards, design measurement only',config,ids,count,reused,wins:runs.filter(r=>r.status==='victory').length,median:times[Math.floor(count/2)],max:Math.max(...times),owned:data.save.reincarnation.owned,spent:T.spent({owned:new Set(data.save.reincarnation.owned)}),permanent:P.permanent(data.save),details:data.details,gems:data.gems,skills:Object.fromEntries(Object.keys(P.CHARACTERS).map(job=>[job,saveRanks(data.save,job)])),runs};
 writeAssetJson(file,row);console.log(JSON.stringify({config,count,reused,wins:row.wins,median:row.median,max:row.max,remainingHp:runs.map(r=>r.remainingHp),survivors:runs.map(r=>r.survivors)}));return row;
}
const saveRanks=(save,job)=>({total:P.totalPoints(save,job),ranks:save.progression.characters[job].skillRanks});
if(require.main===module)measure({step:Number(process.argv.find(a=>a.startsWith('--step='))?.slice(7)||8),spNodes:process.argv.includes('--sp'),serious:process.argv.includes('--serious'),strength:Number(process.argv.find(a=>a.startsWith('--strength='))?.slice(11)||0),count:process.argv.includes('--full')?30:3,mainOnly:!process.argv.includes('--full-gear'),rewards:!process.argv.includes('--no-rewards'),allCheap:process.argv.includes('--all-8000')});
module.exports={legendaryReward,rewardBuilds,fixture,measure,halfFill};
