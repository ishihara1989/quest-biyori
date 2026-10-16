'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const root=path.resolve(__dirname,'../..'),file=path.join(__dirname,'../../development/records/ruins-generation.json'),lock=file+'.lock';
const [id,source,promptFile]=process.argv.slice(2);let acquired=false;
for(let attempt=0;attempt<500;attempt++){try{makeAssetDirectory(lock);acquired=true;break;}catch(e){if(e.code!=='EEXIST')throw e;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}}
if(!acquired)throw Error('Generation records are locked');
try{const jobs=JSON.parse(fs.readFileSync(file)),job=jobs.find(j=>j.id===id);if(!job)throw Error('Unknown job '+id);const version=2+(job.revisions||[]).length,relative=job.source.replace('-generated.png','-generated-v'+version+'.png'),target=path.join(root,relative);if(fs.existsSync(target))throw Error('Revision exists '+target);makeAssetDirectory(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);const prompt=fs.readFileSync(promptFile,'utf8');fs.writeFileSync(target.replace('.png','-prompt.txt'),prompt);job.revisions=[...(job.revisions||[]),{source:relative,generatedPath:source,prompt,generator:'built-in image_gen',generatedAt:new Date().toISOString()}];job.selectedSource=relative;writeAssetJson(file, jobs);console.log(JSON.stringify({id,selectedSource:relative}));}finally{fs.rmdirSync(lock);}
