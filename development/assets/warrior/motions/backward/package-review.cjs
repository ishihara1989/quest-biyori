'use strict';
// Crop and nearest-neighbor package generated artwork. No pose is redrawn.
const fs=require('node:fs'),path=require('node:path');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[bundled]}));
const {PNG}=require(require.resolve('pngjs',{paths:[bundled]}));
const bounds=i=>{let l=i.width,t=i.height,r=-1,b=-1;for(let y=0;y<i.height;y++)for(let x=0;x<i.width;x++)if(i.data[(y*i.width+x)*4+3]>=128){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y)}return {left:l,top:t,width:r-l+1,height:b-t+1}};
(async()=>{
 const source=path.join(__dirname,'source');
 const old=PNG.sync.read(fs.readFileSync(path.join(source,'warrior-backward-generated-v3.png')));
 const cuts=[0,443,887,1330,old.width],split=443;
 const inputs=Array.from({length:8},(_,n)=>({file:'warrior-backward-generated-v3.png',rect:{left:cuts[n%4],top:n<4?0:split,width:cuts[n%4+1]-cuts[n%4],height:n<4?split:old.height-split},anchor:[226,670,1110,1550,233,671,1114,1564][n]-cuts[n%4]}));
 const name='warrior-backward-frames1-2-7-8-generated-v2.png',s=PNG.sync.read(fs.readFileSync(path.join(source,name)));
 const sx=Math.round(s.width/2),sy=Math.round(s.height/2);
 for(const [n,j,ratio] of [[0,0,375/656],[1,1,310/656],[6,2,397/656],[7,3,338/656]]){
  const col=j%2,row=Math.floor(j/2),width=col?s.width-sx:sx;
  inputs[n]={file:name,rect:{left:col*sx,top:row*sy,width,height:row?s.height-sy:sy},anchor:width*ratio};
 }
 const revised='warrior-backward-frames3-6-generated-v1.png',r=PNG.sync.read(fs.readFileSync(path.join(source,revised))),rx=Math.round(r.width/2);
 for(const [n,col,ratio] of [[2,0,439/879],[5,1,455/879]]){
  const width=col?r.width-rx:rx;
  inputs[n]={file:revised,rect:{left:col*rx,top:0,width,height:r.height},anchor:width*ratio};
 }
 const composite=[];
 for(let n=0;n<8;n++){
  const item=inputs[n],buf=await sharp(path.join(source,item.file)).extract(item.rect).png().toBuffer(),b=bounds(PNG.sync.read(buf));
  const scale=400/b.height,w=Math.round(b.width*scale);
  const art=await sharp(buf).extract(b).resize(w,400,{kernel:'nearest'}).png().toBuffer();
  const left=Math.round(250-(item.anchor-b.left)*scale),top=460-400;
  if(left<3||left+w>497)throw new Error('Cell artwork margin');
  composite.push({input:art,left:n%4*500+left,top:Math.floor(n/4)*500+top});
  item.packaging={alphaBounds:b,scale,placed:{left,top,width:w,height:400}};
 }
 await sharp({create:{width:2000,height:1000,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composite).png().toFile(path.join(source,'warrior-backward-generated-v6.png'));
 fs.writeFileSync(path.join(source,'warrior-backward-generated-v6-composition.json'),JSON.stringify({operation:'crop/nearest resize/compose only, generated pose pixels unchanged',cells:inputs},null,2)+'\n');
 fs.writeFileSync(path.join(__dirname,'layout.json'),JSON.stringify({source:'source/warrior-backward-generated-v6.png',columns:4,rows:2,rowSplit:500,frames:Array.from({length:8},()=>({anchor:{x:250}}))},null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});
