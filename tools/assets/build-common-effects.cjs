'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp'),assert=require('node:assert/strict');
const {runtimeAsset,developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const specs=[['aura',256,256],['ring',256,256],['mote',64,64],['streak',256,64],['lightning',256,128],['portal',256,256]];
async function build(){
 const runtime=runtimeAsset('effects/common'),dev=developmentAsset('effects/common');makeAssetDirectory(runtime);
 const assets=[],qa=[];
 for(const [id,w,h] of specs){
  const source=path.join(dev,'source',id+'.png'),{data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const cw=Math.floor(info.width/2),ch=Math.floor(info.height/2);
  const cells=[];
  for(let i=0;i<4;i++){
   const ox=i%2*cw,oy=Math.floor(i/2)*ch;let left=cw,top=ch,right=0,bottom=0,edgeAlpha=0;
   for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
    const a=data[((oy+y)*info.width+ox+x)*4+3];
    if(a>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    if(x===0||y===0||x===cw-1||y===ch-1)edgeAlpha=Math.max(edgeAlpha,a);
   }
   assert.ok(right>left&&bottom>top,id+' visible frame '+i);assert.ok(edgeAlpha<=4,id+' clipped source '+i);
   // Ignore near-invisible alpha noise when locating the artwork, then retain
   // eight source pixels of padding. Retained pixels keep the original alpha.
   cells.push({ox,oy,left:Math.max(0,left-8),top:Math.max(0,top-8),right:Math.min(cw-1,right+8),bottom:Math.min(ch-1,bottom+8),edgeAlpha});
  }
  // A single scale for all four frames preserves their relative growth. Only
  // extraction, nearest-neighbor sizing and registration are performed here.
  const fit=Math.min((w-8)/Math.max(...cells.map(c=>c.right-c.left+1)),(h-8)/Math.max(...cells.map(c=>c.bottom-c.top+1)));
  const frames=[],composite=[];
  for(let i=0;i<4;i++){
   const c=cells[i],width=Math.max(1,Math.round((c.right-c.left+1)*fit)),height=Math.max(1,Math.round((c.bottom-c.top+1)*fit));
   const input=await sharp(source).extract({left:c.ox+c.left,top:c.oy+c.top,width:c.right-c.left+1,height:c.bottom-c.top+1}).resize(width,height,{kernel:'nearest'}).toBuffer();
   composite.push({input,left:i*w+Math.floor((w-width)/2),top:Math.floor((h-height)/2)});
   frames.push({x:i*w,y:0,width:w,height:h,durationMs:140});
  }
  await sharp({create:{width:w*4,height:h,channels:4,background:'#00000000'}}).composite(composite).png().toFile(path.join(runtime,id+'.png'));
  const pages=await Promise.all(frames.map(f=>sharp(path.join(runtime,id+'.png')).extract({left:f.x,top:f.y,width:w,height:h}).raw().toBuffer()));
  await sharp(Buffer.concat(pages),{raw:{width:w,height:h*4,channels:4,pageHeight:h}}).gif({loop:0,delay:140,dither:0,colours:256,keepDuplicateFrames:true}).toFile(path.join(dev,id+'-preview.gif'));
  const manifest={id:'common-'+id,sheet:id+'.png',frameWidth:w,frameHeight:h,frameCount:4,pivot:{x:w/2,y:h/2},durationMs:560,loop:true,frames};
  writeAssetJson(path.join(runtime,id+'.json'),manifest);assets.push({id,manifest:id+'.json'});
  qa.push({id,frames:4,sourceSize:[info.width,info.height],sourceEdgeAlpha:cells.map(c=>c.edgeAlpha),size:[w,h]});
 }
 writeAssetJson(path.join(runtime,'index.json'),{assets});writeAssetJson(path.join(dev,'qa.json'),{date:'2026-10-16',source:'generation.json',checks:qa});
 console.log('Registered '+assets.length+' generated effects, 24 frames');
}
if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={build,specs};
