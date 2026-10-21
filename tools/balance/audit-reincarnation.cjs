'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {writeAssetJson}=require('../lib/project-paths.cjs'),B=require('./audit-chaos-gate.cjs'),D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),R=require('../../public/js/core/reincarnation.js'),S=require('../../public/js/combat/forest-simulation.js');
function reference(){
  const save=B.fullBuild(10);save.cleared.push('dimensional-gate','chaos-gate','extradimensional-goddess');
  save.reincarnation.discovered=true;save.selectedStage='reincarnation-goddess';
  for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
    save.progression.characters[job][slot].push(...P.gearTree(job,slot,'goddess').map(n=>n.id));
    const gem=P.addGem(save,P.Gem.generate({rarity:'epic',family:job+'-'+slot}));assert.ok(P.equipGem(save,job,slot,gem.id));
  }
  // The existing all-active reference is fixed; unused equipment SP is not spent.
  return save;
}
function battle(save,seed){
  const run=S.createRun('reincarnation-goddess',{builds:B.builds(save),random:B.seeded(seed)}),damage=new Map(),attacks=new Set();let maxHit=0;
  run.reincarnationEvidence=R.capture(save);
  for(let t=0;t<184000&&run.status==='running';t+=100){
    const p=run.enemies[0].deliveryPlan;if(p)attacks.add(p.kind);
    for(const event of S.update(run,100))if(event.type==='damage'&&event.source===run.enemies[0].id){
      const a=[run.hero,...run.allies].find(a=>a.id===event.target);if(!a)continue;
      maxHit=Math.max(maxHit,event.amount/a.maxHp);
      const key=(run.enemies[0].deliveryPlan?.actionId||'none')+':'+a.id;damage.set(key,(damage.get(key)||0)+event.amount/a.maxHp);
    }
  }
  return {seed,status:run.status,reason:run.failureReason,seconds:Number(((run.enemies[0].departedAt??run.elapsed)/1000).toFixed(3)),remainingHp:run.enemies[0].hp/run.enemies[0].maxHp,survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length,maxHit,maxAction:Math.max(0,...damage.values()),attacks:[...attacks]};
}
function audit(count=30,measure=false){const save=reference(),runs=Array.from({length:count},(_,i)=>battle(save,i+1)),times=runs.map(r=>r.seconds).sort((a,b)=>a-b),report={reference:'Lv.100, normal + goddess equipment complete, 12 matching epics, existing all-active ranks, no normal gems or potions, no reincarnation bonuses',hp:D.ALL_ENEMIES['reincarnation-goddess'].hp,count,wins:runs.filter(r=>r.status==='victory').length,median:times[Math.floor(times.length/2)],maxHit:Math.max(...runs.map(r=>r.maxHit)),maxAction:Math.max(...runs.map(r=>r.maxAction)),runs};
  writeAssetJson(path.resolve(__dirname,'../../output/reincarnation/balance'+(count===30?'':'-quick')+'.json'),report);console.log(JSON.stringify(report));
  if(!measure){assert.equal(report.wins,count);assert.ok(runs.every(r=>r.seconds<=180&&r.maxHit<=.51&&r.maxAction<=.51));assert.ok(report.median>=165&&report.median<=175,'median target 165–175s; longest clear before 180s has priority');assert.ok(runs.every(r=>r.attacks.length===6),'all six weapons participate');}
  return report;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30,process.argv.includes('--measure'));module.exports={reference,battle,audit};
