'use strict';
// Crop and nearest-neighbor package original generated artwork. No pose is redrawn.
const fs=require('node:fs'),path=require('node:path');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[bundled]}));
const {PNG}=require(require.resolve('pngjs',{paths:[bundled]}));
const bounds=i=>{let l=i.width,t=i.height,r=-1,b=-1;for(let y=0;y<i.height;y++)for(let x=0;x<i.width;x++)if(i.data[(y*i.width+x)*4+3]>=128){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y)}return {left:l,top:t,width:r-l+1,height:b-t+1}};
(async()=>{
 const source=path.join(__dirname,'source');
 const cuts=[0,466,906,1335,1774];
 const inputs=Array.from({length:8},(_,n)=>({file:'warrior-forward-generated-v5.png',rect:{left:cuts[n%4],top:n<4?0:443,width:cuts[n%4+1]-cuts[n%4],height:n<4?443:444},anchor:[221,656,1082,1515,219,660,1092,1526][n]-cuts[n%4]}));
 inputs[0]={file:'warrior-forward-frame1-generated-v2.png',rect:{left:0,top:0,width:1286,height:1223},anchor:615};
 inputs[1]={file:'warrior-forward-frames2-8-generated-v1.png',rect:{left:0,top:0,width:909,height:865},anchor:456};
 inputs[6]={file:'warrior-forward-frame7-generated-v1.png',rect:{left:0,top:0,width:1233,height:1276},anchor:570};
 inputs[7]={file:'warrior-forward-frames2-8-generated-v1.png',rect:{left:909,top:0,width:909,height:865},anchor:460};
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
 await sharp({create:{width:2000,height:1000,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composite).png().toFile(path.join(source,'warrior-forward-generated-v7.png'));
 fs.writeFileSync(path.join(source,'warrior-forward-generated-v7-composition.json'),JSON.stringify({operation:'crop/nearest resize/compose only, generated pose pixels unchanged',cells:inputs},null,2)+'\n');
 fs.writeFileSync(path.join(__dirname,'layout.json'),JSON.stringify({source:'source/warrior-forward-generated-v7.png',columns:4,rows:2,rowSplit:500,frames:Array.from({length:8},()=>({anchor:{x:250}}))},null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});

