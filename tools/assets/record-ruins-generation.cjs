'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const root=path.resolve(__dirname,'../..'),file=path.join(__dirname,'../../development/records/ruins-generation.json');
const [id,source]=process.argv.slice(2),lock=file+'.lock';
let acquired=false;for(let attempt=0;attempt<500;attempt++){try{makeAssetDirectory(lock);acquired=true;break;}catch(error){if(error.code!=='EEXIST')throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}}
if(!acquired)throw Error('Generation record is locked');
try {
const jobs=JSON.parse(fs.readFileSync(file)),job=jobs.find(j=>j.id===id);
if(!job)throw Error('Unknown generation job '+id);
const target=path.join(root,job.source);makeAssetDirectory(path.dirname(target),{recursive:true});
if(fs.existsSync(target))throw Error('Use a versioned filename before replacing an existing generation');
fs.copyFileSync(source,target);job.status='generated';job.generatedPath=source;job.generatedAt=new Date().toISOString();job.generator='built-in image_gen';
writeAssetJson(file, jobs);fs.writeFileSync(target.replace('.png','-prompt.txt'),job.prompt+'\n');
console.log(JSON.stringify({id,status:job.status,pending:jobs.filter(j=>j.status==='pending').length}));
} finally {fs.rmdirSync(lock);}
