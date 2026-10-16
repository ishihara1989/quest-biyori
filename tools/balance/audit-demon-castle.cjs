'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{writeAssetJson}=require('../lib/project-paths.cjs'),A=require('./desert-balance.cjs'),D=require('../../public/js/data/forest-data.js');
function validate(row,count){assert.deepEqual(row.profile,D.STAGE_TUNING[row.stage],'stale profile '+row.stage);assert.equal(row.reference.wins,count,'reference '+row.stage);assert.equal(row.first.wins,count,'first '+row.stage);assert.ok(Math.max(row.reference.peak,row.first.peak)<=.51,'damage '+row.stage);if(row.lag5)assert.ok(row.lag5.wins<=Math.floor(count*.1),'lag5 major');}
function audit(count=30,stages=Array.from({length:10},(_,i)=>91+i)){
 const file=path.resolve(__dirname,'../../output/demon-castle-implementation/balance'+(count===30?'':'-quick')+'.json'),seeds=Array.from({length:count},(_,i)=>i);
 const rows=stages.length===10||!fs.existsSync(file)?[]:JSON.parse(fs.readFileSync(file,'utf8')).filter(r=>!stages.includes(r.stage)),checked=[];
 for(const stage of stages){assert.ok(stage>=91&&stage<=100,'castle stage');const row={stage,profile:D.STAGE_TUNING[stage],reference:A.evaluate(stage,0,seeds),first:A.evaluate(stage,1,seeds),...(stage===100?{lag5:A.evaluate(stage,5,seeds)}:{})};rows.push(row);checked.push(row);console.log(JSON.stringify({stage,reference:[row.reference.wins,row.reference.seconds],first:[row.first.wins,row.first.seconds],peak:Math.max(row.reference.peak,row.first.peak),lag5:row.lag5?.wins}));}
 rows.sort((a,b)=>a.stage-b.stage);writeAssetJson(file,rows);
 // Quick runs have pass/fail checks. Reporting reuses the same measurements.
 for(const row of count===30?rows:checked)validate(row,count);return rows;
}
if(require.main===module){const selected=process.argv.find(a=>a.startsWith('--stages='));audit(process.argv.includes('--quick')?3:30,selected?selected.slice(9).split(',').map(Number):undefined);}module.exports={audit,validate};
