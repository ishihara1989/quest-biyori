'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {writeAssetJson}=require('../lib/project-paths.cjs'),B=require('./audit-chaos-gate.cjs'),D=require('../../public/js/data/goddess-data.js'),P=require('../../public/js/core/forest-progression.js'),S=require('../../public/js/combat/forest-simulation.js');
function reference(gems=false){const save=B.fullBuild(10);save.cleared.push('chaos-gate');save.selectedStage=D.ID;
  if(gems){for(const id of Object.keys(P.CHARACTERS)){for(let i=0;i<2;i++){
    // Legal, reproducible Lv.10 unique attack/haste rolls. No perfect legendary rolls.
    const raw=P.Gem.generate({rarity:'unique',level:10,family:'attack',random:()=>.01});raw.options[1].key='haste';raw.quality=1;
    assert.ok(P.Gem.validate(raw));const gem=P.addGem(save,raw);assert.ok(P.equipGem(save,id,'weapon',gem.id));
  }}}return save;
}
function battle(save,seed,{unlimited=false}={}){const run=S.createRun(D.ID,{builds:B.builds(save),random:B.seeded(seed)});if(unlimited)run.stage={...run.stage,timeLimit:240000};let maxHit=0,phase1=0,phase2=0,transitions=0;const counts={};
  for(let t=0;t<240000&&run.status==='running';t+=100){const e=run.enemies[0],phase=e.goddessPhase;for(const event of S.update(run,100)){counts[event.type]=(counts[event.type]||0)+1;if(event.type==='damage'&&event.source===e.id){const a=[run.hero,...run.allies].find(a=>a.id===event.target);maxHit=Math.max(maxHit,event.amount/a.maxHp);if(phase===1)phase1+=event.amount;else phase2+=event.amount;}if(event.type==='goddess-effect'&&event.kind==='awaken')transitions++;}}
  return{seed,status:run.status,reason:run.failureReason,seconds:Number((run.elapsed/1000).toFixed(3)),remainingHp:run.enemies[0].hp/run.enemies[0].maxHp,survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length,maxHit,phase1Damage:phase1,phase2Damage:phase2,transitions,counts};
}
function audit(count=30){const rows=[false,true].map(gems=>{const save=reference(gems),runs=Array.from({length:count},(_,i)=>battle(save,i+1));const row={gems,wins:runs.filter(r=>r.status==='victory').length,runs};console.log(JSON.stringify({gems,wins:row.wins,count,seconds:runs.map(r=>r.seconds),remaining:runs.map(r=>Number(r.remainingHp.toFixed(3))),survivors:runs.map(r=>r.survivors),maxHit:Math.max(...runs.map(r=>r.maxHit))}));return row;});
  writeAssetJson(path.resolve(__dirname,'../../output/goddess/balance'+(count===30?'':'-quick')+'.json'),{level:100,gear:'all 1000 nodes per slot',limit:180,gemReference:'2 unique attack + haste Lv.10 quality 1 per weapon; 12 gems total, no armor gems',rows});
  assert.equal(rows[0].wins,0);assert.ok(rows[0].runs.every(r=>r.reason==='timeout'&&r.remainingHp>0&&r.remainingHp<.16),'no-gem: survive, narrowly miss the timer');assert.equal(rows[1].wins,count);assert.ok(rows.every(row=>row.runs.every(r=>r.maxHit<=.51&&r.transitions===1)),'damage ceiling and both phases');return rows;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30);module.exports={reference,battle,audit};
