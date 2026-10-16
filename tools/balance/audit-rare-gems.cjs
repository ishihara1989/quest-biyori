'use strict';
const assert=require('node:assert/strict');
const {writeAssetJson,assetPaths:path}=require('../lib/project-paths.cjs');
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),S=require('../../public/js/combat/forest-simulation.js');
const {referenceBuild}=require('./audit-balance.cjs');
const seeded=seed=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**32;};
const median=values=>{const a=[...values].sort((x,y)=>x-y);return(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2;};
function audit(count=30){
  assert.ok(Number.isInteger(count)&&count>0);
  const rows=[];
  for(const stage of [10,60,100])for(const rarity of ['rare','unique',...(stage>=60?['legendary']:[])])for(const specialized of rarity==='rare'?[false,true]:[true]){
    const {save,builds}=referenceBuild(stage),level=stage/10;
    for(const job of Object.keys(builds)){
      // A standard legendary needs more than the initial 500 total capacity.
      if(rarity==='legendary')save.progression.characters[job].weapon=[...new Set([...save.progression.characters[job].weapon,...P.gearTree(job,'weapon',1).map(n=>n.id)])];
      const family=specialized?(['mage','shaman','miko'].includes(job)?'magic':'physical'):'attack';
      const raw=P.Gem.generate({rarity,family,level,random:()=>0});raw.quality=1;
      const gem=P.addGem(save,raw);assert.ok(P.equipGem(save,job,'weapon',gem.id));builds[job]=P.stats(save,job);
    }
    const runs=[];
    for(let seed=1;seed<=count;seed++){
      const run=S.createRun(stage,{builds,random:seeded(seed)});let maxHit=0;
      while(run.status==='running'&&run.elapsed<180000){
        for(const event of S.update(run,100))if(event.type==='damage'){
          const actor=[run.hero,...run.allies].find(a=>a.id===event.target);
          if(actor)maxHit=Math.max(maxHit,event.amount/actor.maxHp);
        }
      }
      runs.push({seed,status:run.status,seconds:run.elapsed/1000,survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length,maxHit});
    }
    const row={stage,rarity,specialized,wins:runs.filter(r=>r.status==='victory').length,medianSeconds:median(runs.map(r=>r.seconds)),maxHit:Math.max(...runs.map(r=>r.maxHit)),runs};
    rows.push(row);console.log(JSON.stringify({...row,runs:undefined}));
  }
  const output=path.resolve(__dirname,'../../output/balance/rare-gem-balance'+(count===30?'':'-quick')+'.json');
  writeAssetJson(output,{count,scope:'Main equipment, actives, one gem per weapon; legendary cases also complete the first regional weapon tree for capacity; forest, desert and castle endpoints. Gemless formulas are unchanged. Efficiency is checked separately for all basic effects, levels, quality extremes and capacity rounding.',rows});
  assert.ok(rows.every(row=>row.wins===count),'every gem build must clear every placement');
  assert.ok(rows.every(row=>row.maxHit<=.51),'maximum single hit must remain within policy');
  return rows;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30);
module.exports={audit};
