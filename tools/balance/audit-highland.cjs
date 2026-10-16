'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict'),A=require('./desert-balance.cjs'),D=require('../../public/js/data/forest-data.js');
function audit(count=30){const seeds=Array.from({length:count},(_,i)=>i),rows=[];for(let stage=61;stage<=70;stage++){const row={stage,profile:D.STAGE_TUNING[stage],reference:A.evaluate(stage,0,seeds),first:A.evaluate(stage,1,seeds),...(stage===70?{lag5:A.evaluate(stage,5,seeds)}:{})};rows.push(row);console.log(JSON.stringify({stage,reference:[row.reference.wins,row.reference.seconds],first:[row.first.wins,row.first.seconds],peak:row.first.peak,lag5:row.lag5?.wins}));}
 const dir=path.resolve(__dirname,'../../output/highland-implementation');fs.mkdirSync(dir,{recursive:true});writeAssetJson(path.join(dir,'balance.json'), rows);
 if(count===30)for(const r of rows){assert.equal(r.reference.wins,count,'reference '+r.stage);assert.equal(r.first.wins,count,'first '+r.stage);assert.ok(r.first.peak<=.51,'damage '+r.stage);if(r.lag5)assert.ok(r.lag5.wins<=3,'lag5 major');}return rows;
}
if(require.main===module)audit(process.argv.includes('--quick')?3:30);module.exports={audit};
