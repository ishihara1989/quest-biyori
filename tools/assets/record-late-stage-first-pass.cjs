'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('late-stage-first-pass/v1'),[id,file]=process.argv.slice(2);
const job=JSON.parse(fs.readFileSync(path.join(root,'jobs.json'),'utf8')).find(j=>j.id===id);
if(!job||!file)throw Error('Expected job id and generated PNG path');
const target=path.join(root,job.source);makeAssetDirectory(path.dirname(target));
if(fs.existsSync(target))throw Error('First pass already exists; do not regenerate or replace');
fs.copyFileSync(file,target);
const entry={...job,generatedPath:file,sha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),status:'generated-unaccepted',issues:[],reviewStatus:'pending full-frame and playback review'};
writeAssetJson(target.replace(/\.png$/,'.generation.json'),entry);
async function record(){const recordsFile=path.join(root,'generation.json'),lock=path.join(root,'.generation.lock');let fd;
 for(let attempt=0;attempt<200;attempt++){try{fd=fs.openSync(lock,'wx');break;}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(resolve=>setTimeout(resolve,25));}}
 if(fd===undefined)throw Error('Generation record is locked');
 try{const data=fs.existsSync(recordsFile)?JSON.parse(fs.readFileSync(recordsFile,'utf8')):{tool:'built-in image_gen',date:'2026-10-13 JST',policy:'one generation per job; no revisions; no runtime registration',records:[]};
 if(!data.records.some(r=>r.id===id))data.records.push(entry);
 const next=path.join(root,'generation-next.json');writeAssetJson(next,data);fs.renameSync(next,recordsFile);console.log(JSON.stringify({id,source:job.source}));
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}}
record().catch(e=>{console.error(e);process.exitCode=1;});
