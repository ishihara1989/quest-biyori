'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// A small diagnostic sample while characters and stages are being added.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),S=require('../../public/js/combat/forest-simulation.js');
const {referenceBuild}=require('./audit-balance.cjs');
const seeded=n=>()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};
function battle(stage,gearStage,seed,join=false){const {builds}=referenceBuild(stage,gearStage);if(join){const save=D.freshSave();save.cleared=Array.from({length:20},(_,i)=>i+1);P.recruitNinja(save);for(const row of P.SKILLS.ninja.filter(n=>n.kind==='active'&&n.unlockLevel<=20))for(let i=0;i<5;i++)P.purchase(save,'ninja','skills',row.id);builds.ninja=P.stats(save,'ninja');}
 const run=S.createRun(stage,{builds,random:seeded(seed)}),ninja=run.allies.find(a=>a.type==='ninja');let damage=0,lowMp=ninja.mp;const casts={};
 for(let t=0;t<180000&&run.status==='running';t+=100){for(const e of S.update(run,100)){if(e.type==='damage'&&e.source==='ninja')damage+=e.amount;if(e.type==='ninja-cast')casts[e.skillId]=(casts[e.skillId]||0)+1;}lowMp=Math.min(lowMp,ninja.mp);}
 return {stage,gearStage,ninjaLevel:ninja.level,seed,status:run.status,seconds:Number((run.time/1000).toFixed(2)),survivors:[run.hero,...run.allies].filter(a=>a.hp>0).length,ninjaDamage:damage,ninjaMp:Number(ninja.mp.toFixed(1)),lowMp:Number(lowMp.toFixed(1)),casts};
}
function audit(){const rows=[];for(const stage of [21,25,30])for(const gearStage of [stage-1,stage])for(const seed of [1,2,3])rows.push(battle(stage,gearStage,seed,stage===21&&gearStage===20));for(const seed of [1,2,3])rows.push(battle(30,20,seed));
 const report={scope:'21 runs, provisional; no enemy tuning, branches, passives, dedicated upgrades, gems or potions',rows};const dir=path.resolve(__dirname,'../../output/ninja-skills');fs.mkdirSync(dir,{recursive:true});writeAssetJson(path.join(dir,'rough-balance.json'), report);
 for(const stage of [21,25,30])for(const gear of [stage-1,stage]){const sample=rows.filter(r=>r.stage===stage&&r.gearStage===gear);console.log(JSON.stringify({stage,gear,wins:sample.filter(r=>r.status==='victory').length,runs:sample.length,seconds:sample.map(r=>r.seconds),ninjaLowMp:sample.map(r=>r.lowMp)}));}
 console.log(JSON.stringify({staleStage30:rows.filter(r=>r.stage===30&&r.gearStage===20).map(r=>r.status),report:path.join(dir,'rough-balance.json')}));return report;
}
if(require.main===module)audit();module.exports={audit,battle};
