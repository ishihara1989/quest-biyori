'use strict';
// Record only generated originals; never replace a previous attempt.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {ROOT,developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('demon-castle-motions/v2');
const [id,file,generatedPath,...references]=process.argv.slice(2);
if(!id||!file||!generatedPath||!references.length)throw Error('Expected job-id, relative source, generated path, canonical reference paths');
const target=path.resolve(root,file);
if(!target.startsWith(root+path.sep)||!file.endsWith('.png'))throw Error('Source must be a PNG within the production directory');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const promptFile=target.replace(/\.png$/,'.prompt.txt');
if(!fs.existsSync(promptFile))throw Error('Save the exact prompt before recording');
makeAssetDirectory(path.dirname(target));
if(fs.existsSync(target)){if(hash(target)!==hash(generatedPath))throw Error('Never overwrite a generated original');}else fs.copyFileSync(generatedPath,target);
const recordFile=target.replace(/\.png$/,'.generation.json');
if(fs.existsSync(recordFile))throw Error('Already recorded');
const relative=f=>path.relative(root,path.resolve(f)).replaceAll('\\','/');
const entry={id,source:path.basename(target),promptFile:path.basename(promptFile),tool:'built-in image_gen',date:'2026-10-15 JST',transparentBackground:true,prompt:fs.readFileSync(promptFile,'utf8').trimEnd(),generatedPath,sha256:hash(target),references:references.map(f=>({file:path.relative(path.dirname(target),path.resolve(f)).replaceAll('\\','/'),sha256:hash(f)})),status:'generated-unaccepted'};
writeAssetJson(recordFile,entry);
const records=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,item.name);if(item.isDirectory())walk(f);else if(item.name.endsWith('.generation.json')){const r=JSON.parse(fs.readFileSync(f,'utf8')),base=path.dirname(f);records.push({...r,source:relative(path.resolve(base,r.source)),promptFile:relative(path.resolve(base,r.promptFile||r.source.replace(/\.png$/,'.prompt.txt'))),metadata:relative(f),references:r.references.map(ref=>({...ref,file:relative(path.resolve(base,ref.file))}))});}}}
walk(path.join(root,'sources'));
writeAssetJson(path.join(root,'generation.json'),{tool:'built-in image_gen',date:'2026-10-15 JST',runtimeRegistered:false,records});
console.log(JSON.stringify({id,source:path.relative(ROOT,target).replaceAll('\\','/'),sha256:entry.sha256,records:records.length}));
