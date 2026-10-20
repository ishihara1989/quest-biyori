'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),sharp=require('sharp');
const {developmentAsset,writeAssetJson,makeAssetDirectory}=require('../lib/project-paths.cjs');
const base=developmentAsset('reincarnation-goddess/arsenal-v1'),size=512;
const read=n=>JSON.parse(fs.readFileSync(path.join(base,n),'utf8').replace(/^\uFEFF/,''));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function measure(input){
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}); let b=[info.width,info.height,-1,-1],edge=0,clear=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=data[(y*info.width+x)*4+3];if(!a)clear++;if(a>32){b=[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x),Math.max(b[3],y)];if(x<2||x>=info.width-2||y<2||y>=info.height-2)edge++;}}
 return {bounds:b,edgePixels:edge,transparentFraction:clear/(info.width*info.height)};
}
async function main(){
 const jobs=read('jobs.json').jobs,layout=read('layout.json'),generation=read('generation.json'),index=[],registration=[],all=[];
 for(const record of generation){assert.equal(hash(path.join(base,record.file)),record.sha256,record.id+' original hash');for(const ref of record.references)assert.equal(hash(path.join(base,ref.file)),ref.sha256,record.id+' reference hash');}
 for(const job of jobs){
  const reg=layout.clips[job.id],source='source/'+job.id+'.png',input=path.join(base,source),m=await sharp(input).metadata();
  assert(m.hasAlpha,job.id+' no alpha');assert.equal(m.width,2172);assert.equal(m.height,724);
  const cuts=reg.cuts||[0,724,1448,2172],dir=path.join(base,'clips',job.id);makeAssetDirectory(dir);const buffers=[],frames=[];
  for(let i=0;i<3;i++){
   const rect={left:cuts[i],top:0,width:cuts[i+1]-cuts[i],height:724},raw=await sharp(input).extract(rect).png().toBuffer(),observed=await measure(raw);
   assert.equal(observed.edgePixels,0,job.id+' source cell boundary '+i);assert(observed.bounds[2]>=observed.bounds[0],job.id+' empty source');
   const anchor=reg.centerBounds?[(observed.bounds[0]+observed.bounds[2])/2,(observed.bounds[1]+observed.bounds[3])/2]:[reg.anchors[i][0]-rect.left,reg.anchors[i][1]];
   const left=Math.round(reg.pivot[0]-anchor[0]*reg.scale),top=Math.round(reg.pivot[1]-anchor[1]*reg.scale);
   const resized=await sharp(raw).resize(Math.round(rect.width*reg.scale),Math.round(rect.height*reg.scale),{kernel:'nearest'}).png().toBuffer();
   const work=await sharp({create:{width:1536,height:1536,channels:4,background:'#00000000'}}).composite([{input:resized,left:left+512,top:top+512}]).png().toBuffer();
   const packed=await sharp(work).extract({left:512,top:512,width:size,height:size}).png().toBuffer();
   const stats=await measure(packed);assert.equal(stats.edgePixels,0,job.id+' output clipping '+i);assert(stats.bounds[0]>=12&&stats.bounds[1]>=12&&stats.bounds[2]<500&&stats.bounds[3]<500,job.id+' safety margin '+i);assert(stats.transparentFraction>.35&&stats.transparentFraction<.999,job.id+' background/empty');
   const file='frame-'+(i+1)+'.png';fs.writeFileSync(path.join(dir,file),packed);buffers.push(packed);
   frames.push({index:i,file,durationMs:job.durations[i],width:size,height:size});
   registration.push({id:job.id,frame:i+1,source,sourceRect:rect,sourceBounds:observed.bounds,sourceBoundaryPixels:observed.edgePixels,observedAnchor:[anchor[0]+rect.left,anchor[1]],anchorMethod:reg.centerBounds?'observed effect bounds center':'manual anatomical/core landmark estimate',scale:reg.scale,translation:[left,top],...stats});
  }
  const manifest={schemaVersion:1,previewOnly:true,id:job.id,label:job.label,kind:job.kind,cell:{width:size,height:size},pivot:{x:reg.pivot[0],y:reg.pivot[1]},sheet:'sheet.png',frameCount:3,durationMs:job.durations.reduce((a,b)=>a+b,0),loop:job.loop,frames};
  writeAssetJson(path.join(dir,'manifest.json'),manifest);
  await sharp({create:{width:1536,height:512,channels:4,background:'#00000000'}}).composite(buffers.map((input,i)=>({input,left:i*512,top:0}))).png().toFile(path.join(dir,'sheet.png'));
  const raws=await Promise.all(buffers.map(b=>sharp(b).ensureAlpha().raw().toBuffer()));
  const gifFile=path.join(base,'review',job.id+'.gif');await sharp(Buffer.concat(raws),{raw:{width:size,height:size*3,channels:4,pageHeight:size}}).gif({delay:job.durations,loop:job.loop?0:1,dither:0,keepDuplicateFrames:true,interFrameMaxError:0}).toFile(gifFile);
  const gm=await sharp(gifFile,{animated:true}).metadata();assert.equal(gm.pages,3);assert.deepEqual(gm.delay,job.durations);
  const thumbs=await Promise.all(buffers.map(b=>sharp(b).resize(256,256,{kernel:'nearest'}).png().toBuffer()));
  await sharp({create:{width:768,height:256,channels:4,background:'#25283e'}}).composite(thumbs.map((input,i)=>({input,left:i*256,top:0}))).png().toFile(path.join(base,'review',job.id+'-contact.png'));
  all.push(...thumbs);index.push({id:job.id,label:job.label,kind:job.kind,manifest:job.id+'/manifest.json'});
 }
 writeAssetJson(path.join(base,'clips/index.json'),index);writeAssetJson(path.join(base,'registration.json'),registration);
 await sharp({create:{width:1536,height:2560,channels:4,background:'#25283e'}}).composite(all.map((input,i)=>({input,left:(i%6)*256,top:Math.floor(i/6)*256}))).png().toFile(path.join(base,'review/all-frames.png'));
 const qa={date:'2026-10-20',clips:index.length,frames:registration.length,sourceHashesVerified:true,referenceHashesVerified:true,sourceBoundaryPixels:registration.reduce((n,f)=>n+f.sourceBoundaryPixels,0),outputBoundaryPixels:registration.reduce((n,f)=>n+f.edgePixels,0),gifFrameCountsAndTimingsVerified:true,minimumMargin:Math.min(...registration.flatMap(f=>[f.bounds[0],f.bounds[1],511-f.bounds[2],511-f.bounds[3]])),visualReview:'See REVIEW.md',runtimeRegistered:false};
 writeAssetJson(path.join(base,'review/qa.json'),qa);
 fs.writeFileSync(path.join(base,'PROMPTS.md'),'# 全文プロンプト\n\n内蔵 image_gen。目標座標と実測は別記録。破棄原画は generation.json に保持。\n\n'+generation.filter(j=>j.prompt).map(j=>'## '+j.id+'\n\n'+(j.selected?'選択候補':'不採用')+'\n\n~~~text\n'+j.prompt+'\n~~~\n').join('\n'));
 console.log(JSON.stringify(qa));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
