'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {writeAssetJson}=require('../lib/project-paths.cjs');
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),S=require('../../public/js/combat/forest-simulation.js'),A=require('./audit-balance.cjs');
const ID='chaos-gate';
function fullBuild(region){
  const {save}=A.referenceBuild(100,0);
  for(const id of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
    // After-acquisition snapshot; reward/purchase affordability is checked separately.
    save.progression.characters[id][slot]=P.allGearTrees(id,slot).filter(n=>n.stage<=region*10).map(n=>n.id);
    assert.equal(save.progression.characters[id][slot].length,region*100);
  }
  return save;
}
const builds=save=>Object.fromEntries(Object.keys(P.CHARACTERS).map(id=>[id,P.stats(save,id)]));
const seeded=seed=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
function battle(stats,seed){
  const run=S.createRun(ID,{builds:stats,random:seeded(seed)});
  for(let t=0;t<300000&&run.status==='running';t+=100)S.update(run,100);
  const party=[run.hero,...run.allies];
  return {seed,status:run.status==='running'?'timeout':run.status,seconds:run.time/1000,kills:run.kills,survivors:party.filter(a=>a.hp>0).length};
}
function audit(count=30){
  const rows=[5,8].map(region=>{const stats=builds(fullBuild(region)),runs=Array.from({length:count},(_,i)=>battle(stats,i+1)),wins=runs.filter(r=>r.status==='victory').length;console.log(JSON.stringify({region,wins,count,seconds:runs.map(r=>Math.round(r.seconds)),kills:runs.map(r=>r.kills)}));return {region,wins,runs};});
  writeAssetJson(path.resolve(__dirname,'../../output/chaos-gate/balance'+(count===30?'':'-quick')+'.json'),{stage:D.SPECIAL_STAGES.find(s=>s.id===ID),level:100,gems:false,potions:false,rows});
  assert.ok(rows[0].wins<=Math.floor(count*.1),'region 5 should lose or rarely win');
  assert.ok(rows[1].wins>=Math.ceil(count*.8),'region 8 should usually clear');
  assert.ok(rows.every(r=>r.runs.every(v=>v.status!=='timeout')),'no timeouts');
  return rows;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30);
module.exports={fullBuild,builds,seeded,battle,audit};
