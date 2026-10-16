'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('glacier-motions'),[id,file]=process.argv.slice(2),job=JSON.parse(fs.readFileSync(path.join(root,'jobs.json'),'utf8')).find(j=>j.id===id);
if(!job||!file)throw Error('Expected job id and generated PNG path');
const target=path.join(root,job.source);makeAssetDirectory(path.dirname(target));if(fs.existsSync(target))throw Error('Existing original; record revisions separately');fs.copyFileSync(file,target);
const recordsFile=path.join(root,'generation.json'),data=fs.existsSync(recordsFile)?JSON.parse(fs.readFileSync(recordsFile,'utf8')):{tool:'built-in image_gen',date:'2026-10-13 JST',records:[]};
data.records.push({...job,generatedPath:file,sha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')});writeAssetJson(recordsFile,data);console.log(JSON.stringify({id,source:job.source}));
