'use strict';
// Rebuild only the two changed body clips; keep the accepted v3 assets intact.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), sharp = require('sharp');
const { developmentAsset, runtimeAsset, makeAssetDirectory, writeAssetJson } = require('../lib/project-paths.cjs');
const dev = developmentAsset('extradimensional-goddess/motion-v4');
const base = runtimeAsset('enemies/extradimensional-goddess/motions');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function measure(buffer) {
  const {data, info} = await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const bounds = [info.width,info.height,-1,-1]; let edgePixels=0, clear=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    const alpha=data[(y*info.width+x)*4+3]; if(!alpha) clear++;
    if(alpha>32) { bounds[0]=Math.min(bounds[0],x); bounds[1]=Math.min(bounds[1],y); bounds[2]=Math.max(bounds[2],x); bounds[3]=Math.max(bounds[3],y); if(x<2||y<2||x>=info.width-2||y>=info.height-2) edgePixels++; }
  }
  return {bounds, edgePixels, transparentFraction:clear/(info.width*info.height)};
}
async function build() {
  const generation=JSON.parse(fs.readFileSync(path.join(dev,'generation.json'),'utf8').replace(/^\uFEFF/,''));
  const record=[];
  const reference=await measure(path.join(dev,'references/floating-original.png'));
  const targetHeight=reference.bounds[3]-reference.bounds[1]+1;
  async function extract(job) {
    const source=path.join(dev,job.source), meta=await sharp(source).metadata(), frames=[];
    if(meta.width%job.cols||meta.height%job.rows) throw Error('Non-square grid '+job.id);
    const width=meta.width/job.cols,height=meta.height/job.rows;
    if(width!==height) throw Error('Cells must be square '+job.id);
    const dir=path.join(dev,'review',job.id); makeAssetDirectory(dir);
    for(let i=0;i<job.cols*job.rows;i++) {
      const rect={left:i%job.cols*width,top:Math.floor(i/job.cols)*height,width,height};
      const buffer=await sharp(source).extract(rect).png().toBuffer(), stats=await measure(buffer);
      if(stats.edgePixels||stats.transparentFraction<.2) throw Error('Clipped or opaque source '+job.id+':'+(i+1));
      const file=path.join(dir,'source-'+(i+1)+'.png'); fs.writeFileSync(file,buffer);
      frames.push({file,rect,...stats});
    }
    const scale=targetHeight/(frames[0].bounds[3]-frames[0].bounds[1]+1);
    // Foot-axis observations from the original turn sheet (not alpha/hair centers).
    // One fixed nearest-neighbor scale for the whole segment; translations only.
    const footX=job.id==='turn'?[362,374,410]:frames.map(f=>(f.bounds[0]+f.bounds[2])/2);
    for(const [i,f] of frames.entries()) {
      const meta=await sharp(f.file).metadata(), left=Math.round(256-footX[i]*scale), top=Math.round(440-f.bounds[3]*scale);
      const png=await sharp(f.file).resize(Math.round(meta.width*scale),Math.round(meta.height*scale),{kernel:'nearest'}).png().toBuffer();
      f.buffer=await sharp({create:{width:512,height:512,channels:4,background:'#00000000'}}).composite([{input:png,left,top}]).png().toBuffer();
      record.push({clip:job.id,frame:i+1,source:job.source,sourceRect:f.rect,...await measure(f.buffer),sourceBounds:f.bounds,footAxisX:footX[i],scale,translation:[left,top]});
    }
    job.sha256=hash(source);job.references=job.references.map(ref=>{const file=typeof ref==='string'?ref:ref.file; return {file,sha256:hash(path.join(dev,file))};});
    return frames.map(f=>f.buffer);
  }
  async function pack(id,label,buffers,durations,loop) {
    const dir=path.join(base,id);makeAssetDirectory(dir);
    const frames=[];
    for(const [i,buffer]of buffers.entries()) {
      const stats=await measure(buffer);if(stats.edgePixels)throw Error('Runtime border '+id+':'+i);
      fs.writeFileSync(path.join(dir,'frame-'+(i+1)+'.png'),buffer);
      frames.push({x:i*512,y:0,width:512,height:512,durationMs:durations[i],file:'frame-'+(i+1)+'.png'});
    }
    await sharp({create:{width:buffers.length*512,height:512,channels:4,background:'#00000000'}}).composite(buffers.map((input,i)=>({input,left:i*512,top:0}))).png().toFile(path.join(dir,'sheet.png'));
    writeAssetJson(path.join(dir,'manifest.json'),{id,motion:id,label,loop,cell:{width:512,height:512},pivot:{x:256,y:440},durationMs:durations.reduce((a,b)=>a+b,0),frameSequence:buffers.map((_,i)=>i),sheet:'sheet.png',frames});
    const pages=await Promise.all(buffers.map(b=>sharp(b).extract({left:88,top:152,width:336,height:320}).ensureAlpha().raw().toBuffer()));
    const review=path.join(dev,'review');makeAssetDirectory(review);
    await sharp(Buffer.concat(pages),{raw:{width:336,height:320*pages.length,channels:4,pageHeight:320}}).gif({delay:durations,loop:0,dither:0,keepDuplicateFrames:true}).toFile(path.join(review,id+'.gif'));
    await sharp({create:{width:336*pages.length,height:320,channels:4,background:'#25283e'}}).composite(await Promise.all(pages.map(async(p,i)=>({input:await sharp(p,{raw:{width:336,height:320,channels:4}}).png().toBuffer(),left:i*336,top:0})))).png().toFile(path.join(review,id+'.png'));
  }
  const floating=await extract(generation.jobs.find(j=>j.id==='floating'));
  const turn=await extract(generation.jobs.find(j=>j.id==='turn'));
  const farewell=await Promise.all([0,1,2].map(i=>sharp(path.join(dev,'references/down-original.png')).extract({left:i*512,top:0,width:512,height:512}).png().toBuffer()));
  await pack('floating','浮遊・待機',floating,[300,300,300,300],true);
  await pack('down','満足・会釈・手振り・半回転・帰還',[...farewell,...turn],[180,180,300,180,180,480],false);
  const portalFile=path.join(base,'return/manifest.json'),portal=JSON.parse(fs.readFileSync(portalFile));
  [150,250,400,1050,150,100].forEach((ms,i)=>portal.frames[i].durationMs=ms);portal.durationMs=2100;writeAssetJson(portalFile,portal);
  const indexFile=path.join(base,'index.json'),index=JSON.parse(fs.readFileSync(indexFile)); index.find(c=>c.id==='down').label='満足・会釈・手振り・半回転・帰還';writeAssetJson(indexFile,index);
  generation.rejected?.forEach(j=>j.sha256=hash(path.join(dev,j.source)));
  writeAssetJson(path.join(dev,'generation.json'),generation);
  fs.writeFileSync(path.join(dev,'PROMPTS.md'),'# 女神モーション v4 全文プロンプト\n\n内蔵 image_gen、透過PNG。\n\n'+[...generation.jobs,...(generation.rejected||[])].map(j=>'## '+j.id+' / '+j.source+'\n\n```text\n'+j.prompt+'\n```\n').join('\n'));
  writeAssetJson(path.join(dev,'registration.json'),{date:'2026-10-16',processing:'Uniform nearest-neighbor scale per segment; measured alpha bounds and observed turn foot axes; translations only. First three farewell frames are unchanged v3 pixels. No repainting or alpha removal.',targetHeight,frames:record});
  console.log(JSON.stringify({floating:4,down:6,totalRuntimeFrames:59,borderPixels:record.reduce((n,r)=>n+r.edgePixels,0)}));
}
if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});module.exports={build};
