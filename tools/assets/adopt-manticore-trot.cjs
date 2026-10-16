'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,crypto=require('node:crypto');
const {buildManticoreTrot}=require('./build-manticore-trot.cjs');
const root=path.resolve(__dirname,'../../public/assets/highland-motions');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),save=(f,v)=>writeAssetJson(path.join(root,f), v);
async function main(){
 const record=read('trot-v2/connection-repair.json');
 for(const r of record.records){const file=path.join(root,r.source);if(!fs.existsSync(file))fs.copyFileSync(r.generatedPath,file);r.sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
 save('trot-v2/connection-repair.json',record);
 const recipe=read('trot-v2/recipe.json');recipe.frames[0].source='trot-v2/sources/frame-1-connected.png';recipe.status='adopted';recipe.standardAdopted=true;recipe.migrationDecision='User accepted V2 foot motion; frame1 far hind thigh connection repaired without changing gait';
 save('trot-v2/recipe.json',recipe);save('manticore-trot.json',recipe);
 const gen=read('trot-v2/generation.json');for(const r of gen.records)if(r.frame===1&&r.status==='selected')r.status='superseded-by-connection-repair';gen.records.push(...record.records);gen.status='adopted';save('trot-v2/generation.json',gen);
 fs.appendFileSync(path.join(root,'trot-v2/PROMPTS.md'),'\n\n# 2026-10-13 右後脚の接続のみ修正\n\n'+record.records.map(r=>'## '+r.status+'\n\n'+r.prompt+'\n\n原画: '+r.source).join('\n\n')+'\n');
 const review=read('trot-v2/review.json');Object.assign(review,{status:'adopted; foot motion accepted by user; anatomy connection repaired',activeVersion:'V2 with frame1 connection repair',standard:'../../../../docs/policies/quadruped-trot-production.md'});review.selectedFrames[0].pass='anatomical-connection-only-repair';review.visualReview.remaining=[];review.visualReview.userClarification='Frame1 far hind thigh is disconnected from paw; fore/aft motion is acceptable.';review.visualReview.connectionRepair='Selected four-leg revision; rejected first revision adding a fifth foot.';save('trot-v2/review.json',review);
 await buildManticoreTrot({recipe:'trot-v2/recipe.json',directory:'trot-v2/motions/move',registered:'trot-v2/registered/move.png',prompt:'trot-v2/PROMPTS.md'});
 await buildManticoreTrot({prompt:'trot-v2/PROMPTS.md'});
 console.log('Manticore V2 adopted; original V1 and pre-repair V2 source preserved.');
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
