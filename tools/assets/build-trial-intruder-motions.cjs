'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),sharp=require('sharp');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const base=developmentAsset('trial-intruders/motions-v1');
const read=f=>JSON.parse(fs.readFileSync(path.join(base,f),'utf8').replace(/^\uFEFF/,''));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function measure(data,w,h,rect={left:0,top:0,width:w,height:h}) {
 const b=[w,h,-1,-1];let edge=0,visible=0,clear=0;
 for(let y=rect.top;y<rect.top+rect.height;y++)for(let x=rect.left;x<rect.left+rect.width;x++){
  const a=data[(y*w+x)*4+3];if(a===0)clear++;
  if(a>32){visible++;b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);if(x===rect.left||x===rect.left+rect.width-1||y===rect.top||y===rect.top+rect.height-1)edge++;}
 }return {bounds:b,visiblePixels:visible,solidBorderPixels:edge,transparentFraction:clear/(rect.width*rect.height)};
}
function cuts(data,w,h,axis,count,rect={left:0,top:0,width:w,height:h}){
 const n=axis==='x'?w:h,counts=Array(n).fill(0);
 for(let y=rect.top;y<rect.top+rect.height;y++)for(let x=rect.left;x<rect.left+rect.width;x++)if(data[(y*w+x)*4+3]>32)counts[axis==='x'?x:y]++;
 const out=[0];
 for(let k=1;k<count;k++){
  const ideal=n*k/count,radius=n/count*.25;let best=-1,dist=Infinity;
  for(let i=Math.max(2,Math.floor(ideal-radius));i<Math.min(n-2,ideal+radius);i++)if(counts[i]===0&&counts[i-1]===0&&counts[i+1]===0&&Math.abs(i-ideal)<dist){best=i;dist=Math.abs(i-ideal);}
  assert.ok(best>out.at(-1),'No transparent gutter: '+axis+' '+k);out.push(best);
 }return [...out,n];
}
function frameOrder(c){const seq=c.frameSequence||c.frames.map((_,i)=>i);assert.ok(seq.length,'Empty playback sequence');for(const i of seq)assert.ok(Number.isInteger(i)&&i>=0&&i<c.frames.length,'Invalid playback index');return seq;}
function sourceRectangles(j,data,w,h){
 let cells=j.sourceRects;
 if(!cells){const yc=cuts(data,w,h,'y',j.grid[1]);cells=yc.slice(0,-1).flatMap((top,row)=>{const height=yc[row+1]-top,xc=cuts(data,w,h,'x',j.grid[0],{left:0,top,width:w,height});return xc.slice(0,-1).map((left,col)=>({left,top,width:xc[col+1]-left,height}));});}
 for(const r of cells)assert.ok([r.left,r.top,r.width,r.height].every(Number.isInteger)&&r.left>=0&&r.top>=0&&r.width>0&&r.height>0&&r.left+r.width<=w&&r.top+r.height<=h,'Invalid source rectangle');
 return j.sourceCells?j.sourceCells.map(i=>{assert.ok(Number.isInteger(i)&&i>=0&&i<cells.length,'Invalid source cell');return cells[i];}):cells;
}
function mergeSourceHashes(current,measured){const byId=new Map(measured.jobs.map(j=>[j.id,j]));return {...current,jobs:current.jobs.map(j=>{const m=byId.get(j.id);return m?.sha256&&m.source===j.source&&m.prompt===j.prompt&&m.status===j.status?{...j,sha256:m.sha256}:j;})};}
async function build(){
 const plan=read('plan.json'),generation=read('generation.json');
 const selection=process.argv.find(a=>a.startsWith('--only='))?.slice(7)?.split(',');
 const prior=(name,fallback)=>fs.existsSync(path.join(base,name))?read(name):fallback;
 const keep=x=>!selection.includes(x.id);
 const registrations=selection?prior('registration.json',{clips:[]}).clips.filter(keep):[];
 const index=selection?prior('index.json',[]).filter(keep):[];
 const problems=selection?prior('review/automatic.json',{problems:[]}).problems.filter(keep):[];
 for(const c of plan.clips){
  if(selection&&!selection.includes(c.id))continue;
  if(c.kind==='reuse'){writeAssetJson(path.join(base,'effects',c.enemy,c.id,'manifest.json'),{id:c.id,label:c.label,previewOnly:true,runtimeRegistered:false,kind:'image-reuse',...c.reuse});continue;}
  const jobs=generation.jobs.filter(j=>j.clip===c.id);
  if(!jobs.length||jobs.some(j=>!fs.existsSync(path.join(base,j.source)))){problems.push({id:c.id,status:'awaiting-source'});continue;}
  const sources=[];
  try {
   for(const j of jobs){
    const file=path.join(base,j.source),m=await sharp(file).metadata();assert.ok(m.hasAlpha,j.id+' missing alpha');
    const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const stats=measure(data,info.width,info.height);if(!j.sourceCells&&!j.sourceRects)assert.equal(stats.solidBorderPixels,0,j.id+' clipped original');assert.ok(stats.transparentFraction>.05,j.id+' opaque backdrop');
    const selectedCells=sourceRectangles(j,data,info.width,info.height);
    assert.equal(selectedCells.length,j.indices.length,j.id+' frame count');
    for(const [n,rect]of selectedCells.entries()){
     const stats=measure(data,info.width,info.height,rect);assert.equal(stats.solidBorderPixels,0,j.id+' clipped crop');assert.ok(stats.visiblePixels>50,j.id+' empty frame');
     sources.push({job:j,index:j.indices[n],file,rect,stats,sourceSize:[info.width,info.height],sourceUnitScale:512/(info.height/j.grid[1]),fixedOutputHeightPx:j.fixedOutputHeightPx});
    }
    j.sha256=hash(fs.readFileSync(file));
   }
   sources.sort((a,b)=>a.index-b.index);assert.deepEqual(sources.map(s=>s.index),Array.from({length:c.frameCount},(_,i)=>i),c.id+' missing or repeated target frame index');
   const normalSources=sources.filter(s=>!s.fixedOutputHeightPx),fitting=normalSources.length?normalSources:sources;
   const maxW=Math.max(...fitting.map(s=>(s.stats.bounds[2]-s.stats.bounds[0]+1)*s.sourceUnitScale)),maxH=Math.max(...fitting.map(s=>(s.stats.bounds[3]-s.stats.bounds[1]+1)*s.sourceUnitScale));
   const anchored=c.kind==='effect'&&c.anchorMode&&c.anchorMode!=='center';
   const clipFit=Math.min((c.kind==='effect'&&!anchored?448:400)/maxW,(c.kind==='effect'&&!anchored?448:400)/maxH)*(c.scaleAdjustment||1);
   const buffers=[],records=[],frames=[],dir=path.join(base,c.kind==='effect'?'effects':'motions',c.enemy||'common',c.id);makeAssetDirectory(dir);
   for(const [n,s]of sources.entries()){
    const b=s.stats.bounds,fit=s.fixedOutputHeightPx?s.fixedOutputHeightPx/(b[3]-b[1]+1):clipFit*s.sourceUnitScale,crop={left:Math.max(s.rect.left,b[0]-4),top:Math.max(s.rect.top,b[1]-4)};
    crop.width=Math.min(s.rect.left+s.rect.width,b[2]+5)-crop.left;crop.height=Math.min(s.rect.top+s.rect.height,b[3]+5)-crop.top;
    const measuredAnchorProxy=[c.anchorMode==='right'?b[2]:c.anchorMode==='left'?b[0]:(b[0]+b[2])/2,c.kind==='effect'&&c.anchorMode!=='bottom'?(b[1]+b[3])/2:b[3]];
    const target=c.kind==='effect'?(c.anchorMode==='right'?[448,256]:c.anchorMode==='left'?[64,256]:c.anchorMode==='bottom'?[256,448]:[256,256]):[256,448];
    const translation=[Math.round(target[0]-(measuredAnchorProxy[0]-crop.left)*fit),Math.round(target[1]-(measuredAnchorProxy[1]-crop.top)*fit)];
    const input=await sharp(s.file).extract(crop).resize(Math.max(1,Math.round(crop.width*fit)),Math.max(1,Math.round(crop.height*fit)),{kernel:'nearest'}).png().toBuffer();
    const buffer=await sharp({create:{width:512,height:512,channels:4,background:'#00000000'}}).composite([{input,left:translation[0],top:translation[1]}]).png().toBuffer();
    const {data}=await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true}),stats=measure(data,512,512);
    assert.equal(stats.solidBorderPixels,0,c.id+' destination clipping');assert.ok(stats.bounds[0]>=12&&stats.bounds[1]>=12&&stats.bounds[2]<500&&stats.bounds[3]<500,c.id+' margin');
    const file='frame-'+String(n+1).padStart(2,'0')+'.png';fs.writeFileSync(path.join(dir,file),buffer);buffers.push(buffer);
    frames.push({index:n,file,x:n*512,y:0,width:512,height:512,durationMs:c.frames[n].durationMs,plannedAnchors:c.frames[n].planned,measuredAnchors:c.frames[n].measured||null,anchorMeasurement:c.frames[n].measurement||null});
    records.push({index:n,source:s.job.source,sourceSize:s.sourceSize,sourceFrame:s.index,measuredCell:s.rect,sourceBounds:b,crop,measuredAnchorProxy,anchorProxyMeaning:c.kind==='effect'?'Visible alpha bounds: '+(c.anchorMode||'center')+' registration proxy; NOT a measured hardware port':'Visible alpha bounding box center X and lowest Y; NOT an anatomical joint or muzzle',scale:fit,translation,sha256:hash(buffer),...stats});
   }
   assert.equal(new Set(records.map(r=>r.sha256)).size,records.length,c.id+' duplicate frames');
   const sheet=await sharp({create:{width:512*buffers.length,height:512,channels:4,background:'#00000000'}}).composite(buffers.map((input,i)=>({input,left:i*512,top:0}))).png().toBuffer();fs.writeFileSync(path.join(dir,'sheet.png'),sheet);
   const sequence=frameOrder(c),origin=c.kind==='effect'?(c.anchorMode==='right'?[448,256]:c.anchorMode==='left'?[64,256]:c.anchorMode==='bottom'?[256,448]:[256,256]):[256,448];
   const manifest={schemaVersion:1,id:c.id,label:c.label,enemy:c.enemy,kind:c.kind,previewOnly:true,runtimeRegistered:false,cell:{width:512,height:512},facing:c.facing||'left',loop:c.loop||false,endBehavior:c.endBehavior||(c.loop?'loop':c.kind==='effect'?'remove':/M05$/.test(c.id)?'hold-last-frame':c.id==='G14'?'leave-scene':'return-idle'),terminal:/M05$/.test(c.id)||c.id==='G14',frameCount:frames.length,frameSequence:sequence,durationMs:sequence.reduce((n,i)=>n+frames[i].durationMs,0),origin,originMethod:c.kind==='effect'?'Measured alpha-boundary proxy; inspect attachment in composited preview':'Ground/registration pivot, not a muzzle',emissionVector:c.emissionVector||null,mountRotationRadians:c.mountRotationRadians||0,sheet:'sheet.png',frames,source:jobs.map(j=>path.relative(dir,path.join(base,j.source)).replaceAll('\\','/'))};
   writeAssetJson(path.join(dir,'manifest.json'),manifest);
   const delay=sequence.map(i=>Math.round(frames[i].durationMs/10)*10),raw=await Promise.all(sequence.map(i=>sharp(buffers[i]).raw().toBuffer()));
   await sharp(Buffer.concat(raw),{raw:{width:512,height:512*raw.length,channels:4,pageHeight:512}}).gif({delay,loop:0,colours:256,dither:0,keepDuplicateFrames:true}).toFile(path.join(base,'review',c.id+'.gif'));
   const gm=await sharp(path.join(base,'review',c.id+'.gif'),{animated:true}).metadata();assert.equal(gm.pages,sequence.length,c.id+' GIF frame loss');assert.deepEqual(gm.delay,delay,c.id+' GIF timing');
   const thumbs=await Promise.all(buffers.map(b=>sharp(b).resize(256,256,{kernel:'nearest'}).png().toBuffer()));
   for(const[suffix,color]of[['dark','#172236'],['light','#dedbcf']])await sharp({create:{width:256*frames.length,height:256,channels:4,background:color}}).composite(thumbs.map((input,i)=>({input,left:i*256,top:0}))).png().toFile(path.join(base,'review',c.id+'-'+suffix+'.png'));
   registrations.push({id:c.id,frames:records});index.push({id:c.id,label:c.label,enemy:c.enemy,kind:c.kind,manifest:path.relative(base,path.join(dir,'manifest.json')).replaceAll('\\','/')});
  }catch(e){problems.push({id:c.id,status:'automatic-check-failed',message:e.message});}
 }
 const order=new Map(plan.clips.map((c,i)=>[c.id,i]));index.sort((a,b)=>order.get(a.id)-order.get(b.id));registrations.sort((a,b)=>order.get(a.id)-order.get(b.id));
 writeAssetJson(path.join(base,'registration.json'),{threshold:32,alphaPolicy:'Threshold for bounds measurements only; generated RGBA retained.',clips:registrations});
 writeAssetJson(path.join(base,'index.json'),index);writeAssetJson(path.join(base,'generation.json'),mergeSourceHashes(read('generation.json'),generation));
 writeAssetJson(path.join(base,'review/automatic.json'),{runtimeRegistered:false,passingClips:index.length,frames:registrations.reduce((n,r)=>n+r.frames.length,0),problems});console.log(JSON.stringify({passingClips:index.length,frames:registrations.reduce((n,r)=>n+r.frames.length,0),awaitingSource:problems.filter(p=>p.status==='awaiting-source').length,failures:problems.filter(p=>p.status!=='awaiting-source')}));
 if(problems.some(p=>p.status==='automatic-check-failed'))process.exitCode=1;
}
if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={measure,cuts,frameOrder,sourceRectangles,mergeSourceHashes,build};
