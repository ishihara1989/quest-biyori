'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Preserve independent ImageGen poses when an atlas has overlapping silhouettes.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict'),{PNG}=require('pngjs'),plan=require('./miko-assets-plan.cjs');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'public/assets/skills/miko'),[id,inputs,metadata]=process.argv.slice(2),job=plan.jobs.find(j=>j.id===id);
assert.ok(job,'Known job');const originals=JSON.parse(inputs),run=JSON.parse(metadata);assert.equal(originals.length,job.count);
const journal=path.join(base,'generation',id+'.json'),prior=JSON.parse(fs.readFileSync(journal,'utf8'));makeAssetDirectory(path.join(base,'generation/history'),{recursive:true});writeAssetJson(path.join(base,'generation/history',id+'-before-single-frames.json'), prior);
const frameSources=originals.map((p,i)=>{assert.ok(fs.existsSync(p));const im=PNG.sync.read(fs.readFileSync(p));assert.ok(im.data.some((v,n)=>n%4===3&&v===0));const dest=path.join(base,'source',id+'-single-'+String(i+1).padStart(2,'0')+'.png');fs.copyFileSync(p,dest);return path.relative(root,dest).replaceAll('\\','/');});
writeAssetJson(journal, {...prior,source:frameSources[0],frameSources,originals,prompt:run.prompt,refs:run.refs,receivedAt:new Date().toISOString(),status:'generated'});console.log(JSON.stringify({id,frameSources}));
