'use strict';
// Rectangular extraction only. Source RGB/alpha and cell coordinates are never repaired.
const fs=require('node:fs'), path=require('node:path'), sharp=require('sharp'), crypto=require('node:crypto');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('extradimensional-goddess/first-pass-v1');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const rel=f=>path.relative(root,f).replaceAll('\\','/');
async function stats(input) {
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let clear=0,edge=0,lowAlpha=0,x0=info.width,y0=info.height,x1=-1,y1=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const a=data[(y*info.width+x)*4+3];if(a===0)clear++;else if(a<32)lowAlpha++;
  if(a>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);if(x===0||y===0||x===info.width-1||y===info.height-1)edge++;}
 }
 return {width:info.width,height:info.height,transparentFraction:clear/(info.width*info.height),lowAlphaPixels:lowAlpha,edgePixels:edge,bounds:x1<0?null:[x0,y0,x1,y1],marginFraction:x1<0?null:Math.min(x0/info.width,y0/info.height,(info.width-1-x1)/info.width,(info.height-1-y1)/info.height)};
}
async function main(){
 const jobs=read('jobs.json'),records=read('generation.json').records,groups=new Map(),sources=[];
 for(const job of jobs){const r=records.find(r=>r.id===job.id);if(!r)continue;
  const source=path.join(root,job.source),meta=await sharp(source).metadata();
  const sourceStats=await stats(source),clip=job.clip||job.id;
  if(!groups.has(clip))groups.set(clip,{id:clip,kind:job.kind,loop:job.loop,cell:job.cell,anchor:job.anchor,frames:[],sources:[]});
  const group=groups.get(clip);group.sources.push(job.source);
  const info={id:job.id,source:job.source,sha256:r.sha256,...sourceStats,cells:[]};
  for(let i=0;i<job.count;i++){
   const col=i%job.cols,row=Math.floor(i/job.cols),left=Math.floor(col*meta.width/job.cols),top=Math.floor(row*meta.height/job.rows);
   const rect={left,top,width:Math.floor((col+1)*meta.width/job.cols)-left,height:Math.floor((row+1)*meta.height/job.rows)-top};
   const index=(job.frameStart||1)+i,dir=path.join(root,'review',clip);makeAssetDirectory(dir);
   const frame=path.join(dir,`frame-${String(index).padStart(2,'0')}.png`);
   await sharp(source).extract(rect).png().toFile(frame);
   const s=await stats(frame);info.cells.push({frame:index,rect,...s});
   group.frames.push({file:rel(frame),index,durationMs:job.durationMs[i],source:job.source,sourceRect:rect,description:job.frames[i],...s});
  }
  sources.push(info);
 }
 const catalog=[];
 for(const group of groups.values()){
  group.frames.sort((a,b)=>a.index-b.index);const dir=path.join(root,'review',group.id),size=320,pages=[],composites=[];
  const cols=Math.min(4,group.frames.length),rows=Math.ceil(group.frames.length/cols),rowH=size+28;
  for(const [i,f]of group.frames.entries()){
   // One common cell aspect ratio and no per-pose bounding-box normalization.
   const data=await sharp(path.join(root,f.file)).resize(size,size,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer();pages.push(data);
   const img=await sharp(data,{raw:{width:size,height:size,channels:4}}).png().toBuffer();
   composites.push({input:img,left:(i%cols)*size,top:Math.floor(i/cols)*rowH+28});
   const label=await sharp(Buffer.from(`<svg width="320" height="28"><text x="12" y="21" fill="#e6ecff" font-family="sans-serif" font-size="16">F${f.index} / ${f.durationMs}ms</text></svg>`)).png().toBuffer();
   composites.push({input:label,left:(i%cols)*size,top:Math.floor(i/cols)*rowH});
  }
  const contact=path.join(dir,'contact.png');await sharp({create:{width:cols*size,height:rows*rowH,channels:4,background:'#25283e'}}).composite(composites).png().toFile(contact);
  const gif=path.join(dir,'preview.gif');await sharp(Buffer.concat(pages),{raw:{width:size,height:size*pages.length,channels:4,pageHeight:size}}).gif({delay:group.frames.map(f=>f.durationMs),loop:0,dither:0,keepDuplicateFrames:true}).toFile(gif);
  const expected=jobs.filter(j=>(j.clip||j.id)===group.id).reduce((n,j)=>n+j.count,0),present=new Set(group.frames.map(f=>f.index));
  const missingFrames=Array.from({length:expected},(_,i)=>i+1).filter(i=>!present.has(i));
  const manifest={...group,expectedFrames:expected,complete:missingFrames.length===0,missingFrames,accepted:false,previewOnly:true,extraction:'fixed proportional rectangular cells; original alpha/RGB retained; no masks, retouching, re-centering, or per-pose scaling',contact:rel(contact),gif:rel(gif),gifLoop:'review repeats; nonloop motions are one-shot in intended use; missing frames are NOT synthesized'};
  writeAssetJson(path.join(dir,'manifest.json'),manifest);catalog.push(manifest);
 }
 writeAssetJson(path.join(root,'qa-mechanical.json'),{status:'mechanical-only-not-art-acceptance',date:'2026-10-15',sources});
 writeAssetJson(path.join(root,'review-index.json'),catalog);
 console.log(JSON.stringify({generated:records.length,planned:jobs.length,clips:catalog.length,extractedFrames:catalog.reduce((n,c)=>n+c.frames.length,0),sourceEdgeFailures:sources.filter(s=>s.edgePixels).map(s=>s.id),cellEdgeFailures:sources.filter(s=>s.cells.some(c=>c.edgePixels)).map(s=>s.id)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
