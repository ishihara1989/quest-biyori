'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2');
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'plan.json'),'utf8'));
const job=plan.jobs.find(j=>j.id===input.id);if(!job)throw Error('Unknown job '+input.id);
const actualInputImages=(input.actualInputImages||[job.reference,job.guide].filter(Boolean)).map(item=>{
 const file=typeof item==='string'?item:item.file;
 return{file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root,file))).digest('hex')};
});
const file=path.join(root,input.source||job.source);makeAssetDirectory(path.dirname(file));
if(fs.existsSync(file))throw Error('Refuse to overwrite existing source '+file);
fs.copyFileSync(input.generatedPath,file);
writeAssetJson(file.replace(/\.png$/,'.generation.json'),{...input,generatedPath:undefined,tool:'built-in image_gen',source:path.relative(root,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),reference:job.reference||null,guide:actualInputImages.some(i=>i.file===job.guide)?job.guide:null,actualInputImages,pathsRelativeTo:'volcano-motions/v2',firstPass:job.firstPass,issues:job.issues,prompt:input.prompt||job.prompt,accepted:false});
if(input.selected&&input.source&&input.source!==job.source){const selectionFile=path.join(root,'selection.json'),selection=fs.existsSync(selectionFile)?JSON.parse(fs.readFileSync(selectionFile,'utf8')):{overrides:{}};selection.overrides[input.id]=input.source;writeAssetJson(selectionFile,selection);}
console.log(JSON.stringify({id:input.id,file}));
