'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,{PNG}=require('pngjs');
const {bounds}=require('./build-treant.cjs'),{buildManticoreTrot}=require('./build-manticore-trot.cjs'),{enemies}=require('./highland-motion-specs.cjs');
const root=path.resolve(__dirname,'../../public/assets/highland-motions');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
async function build(id){const e=enemies.find(e=>e.id===id),dir='trot/'+id,recipe=read(dir+'/recipe.json');
 return buildManticoreTrot({recipe:dir+'/recipe.json',directory:'enemies/'+id+'/motions/move',registered:'enemies/'+id+'/registered/move.png',prompt:dir+'/PROMPTS.md'});
}
async function prepare(id){const e=enemies.find(e=>e.id===id),dir='trot/'+id,selection=fs.existsSync(path.join(root,dir,'selection.json'))?read(dir+'/selection.json'):{};
 const sourceFiles=Array.from({length:6},(_,i)=>selection[i+1]||dir+'/sources/frame-'+(i+1)+'-single.png');if(!sourceFiles.every(f=>fs.existsSync(path.join(root,f))))return;
 if(fs.existsSync(path.join(root,dir,'recipe.json')))return build(id);
 const originals=sourceFiles.map(f=>PNG.sync.read(fs.readFileSync(path.join(root,f)))),bs=originals.map(p=>bounds(p,192)),idle=read('enemies/'+id+'/motions/idle/manifest.json'),oldEye={
 'horn-jackal':{x:206,y:165},'rock-horn-goat':{x:209,y:176},'storm-jackal':{x:235,y:238},'iron-horn':{x:259,y:232}
 }[id];
 // The generated body stays fixed. One common scale and explicit eye landmarks avoid paw-driven bouncing.
 const ref=originals[0],height=bs[0].bottom-bs[0].top+1,eye={
 'horn-jackal':{x:285,y:348},'rock-horn-goat':{x:326,y:356},'storm-jackal':{x:165,y:486},'iron-horn':{x:263,y:414}
 }[id];
 const scale=(idle.pivot.y-oldEye.y)/(bs[0].bottom-eye.y);
 const template=read('manticore-trot.json'),recipe={schemaVersion:1,enemy:id,date:'2026-10-13 JST',gait:'trot',status:'adopted-coordinate-guided',standardAdopted:true,reference:'references/'+id+'.png',frameWidth:e.width,frameHeight:e.height,pivot:idle.pivot,outputEye:oldEye,coordinateGuide:dir+'/guide.json',generationParts:6,framesPerPart:1,registration:'Fixed eye/body landmark; source pixels preserved',frames:template.frames.map((f,i)=>({...f,source:sourceFiles[i],eye,scale}))};
 writeAssetJson(path.join(root,dir,'recipe.json'), recipe);await build(id);
 console.log(JSON.stringify({id,dimensions:originals.map(p=>[p.width,p.height]),scale,eye,outputEye:oldEye}));
}
async function main(){for(const e of enemies.filter(e=>e.locomotion==='walk'&&e.id!=='manticore'))await prepare(e.id);}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={build,main};
