'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Package generated poses only. Register a fixed face landmark instead of moving feet.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const {PNG}=require('pngjs');
const {extract,join}=require('./build-ruins.cjs');
const {pack}=require('./build-treant.cjs');
const root=path.resolve(__dirname,'../../public/assets/highland-motions');
async function buildManticoreTrot(options={}){
  const recipeFile=options.recipe||'manticore-trot.json',directory=options.directory||'enemies/manticore/motions/move';
  const dir=path.join(root,directory),relative=f=>path.relative(dir,path.join(root,f)).replaceAll('\\','/');
  const recipe=JSON.parse(fs.readFileSync(path.join(root,recipeFile),'utf8'));
  const promptFile=options.prompt||(recipe.status==='adopted'?'trot-v2/PROMPTS.md':'MANTICORE-TROT-PROMPTS.md');
  const enemy=recipe.enemy||'manticore';
  const cache=new Map(),cells=[],extraction=[];
  for(const f of recipe.frames){
    if(!cache.has(f.source)){
      const file=path.join(root,f.source);
      const input=f.columns?extract(file,f.columns,1):{cells:[PNG.sync.read(fs.readFileSync(file))],method:'single-generated-pose'};
      cache.set(f.source,input);
    }
    const input=cache.get(f.source);cells.push(input.cells[f.cell||0]);
    extraction.push({source:f.source,method:input.method,cell:f.cell||0,rect:input.rects?.[f.cell||0]});
  }
  const image=join(cells,2),cw=image.width/2,ch=image.height/3;
  const registeredFile=options.registered||'enemies/manticore/registered/move.png';
  const registered=path.join(root,registeredFile);makeAssetDirectory(path.dirname(registered),{recursive:true});
  fs.writeFileSync(registered,PNG.sync.write(image));
  const frames=recipe.frames.map((f,i)=>({cell:i,durationMs:120,phase:f.phase,scale:f.scale,
    anchor:{x:16+f.eye.x+(recipe.pivot.x-recipe.outputEye.x)/f.scale,
      y:16+f.eye.y+(recipe.pivot.y-recipe.outputEye.y)/f.scale}}));
  const m=await pack({enemy,id:'move',label:'移動',
    directory:'assets/highland-motions/'+directory,source:relative(registeredFile),
    prompt:relative(promptFile),frameWidth:recipe.frameWidth||800,frameHeight:recipe.frameHeight||580,pivot:recipe.pivot,
    columns:2,columnEdges:[0,cw,cw*2],rowEdges:[0,ch,ch*2,ch*3],scale:frames[0].scale,
    alphaCutoff:192,loop:true,frames,events:[]});
  Object.assign(m,{region:'嵐渡りの高原',previewOnly:true,
    generation:'built-in image_gen; full prompts in '+promptFile,
    reference:relative('references/'+enemy+'.png'),
    originalSources:[...cache.keys()].map(relative),sourceExtraction:extraction,
    registration:{method:'fixed-eye-landmark',outputEye:recipe.outputEye,recipe:relative(recipeFile)},
    walkCycle:{gait:'trot',status:recipe.status||'trial',parts:recipe.generationParts||2,framesPerPart:recipe.framesPerPart||3,
      nearSide:'left',farSide:'right',diagonalPairs:{A:['left-hind','right-front'],B:['left-front','right-hind']},
      phases:recipe.frames.map(f=>f.phase),contacts:recipe.frames.map(f=>({grounded:f.grounded,lifted:f.lifted,near:f.near,far:f.far}))},effectAssets:[]});
  if(recipe.coordinateGuide)m.coordinateGuide={file:relative(recipe.coordinateGuide),targetsOnly:true};
  writeAssetJson(path.join(dir,'manifest.json'), m);
  return m;
}
if(require.main===module)buildManticoreTrot(process.argv.includes('--v2')?{recipe:'trot-v2/recipe.json',directory:'trot-v2/motions/move',registered:'trot-v2/registered/move.png',prompt:'trot-v2/PROMPTS.md'}:{}).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={buildManticoreTrot};
