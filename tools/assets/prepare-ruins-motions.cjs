'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const {enemies,jobs}=require('./ruins-specs.cjs');
const root=path.resolve(__dirname,'../..'),file=path.join(__dirname,'../../development/records/ruins-generation.json');
const flying=process.argv[2];
for(const e of enemies){const target=path.join(root,'public/assets/enemies',e.id,'source');makeAssetDirectory(target,{recursive:true});const source=e.id==='rune-gargoyle'?flying:path.join(root,'public/assets/ruins-design/v1',e.id+'.png');if(!source||!fs.existsSync(source))throw Error('Missing design '+e.id);fs.copyFileSync(source,path.join(target,'design-reference.png'));}
if(!fs.existsSync(file))writeAssetJson(file, jobs());
console.log(JSON.stringify({jobs:JSON.parse(fs.readFileSync(file)).length}));
