'use strict';
// Composition only: crop generated art, uniformly resize the separately generated cell,
// and add transparent padding. No pose is redrawn, duplicated, morphed or interpolated.
const fs=require('node:fs'),path=require('node:path');
const dep=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[dep]}));
(async()=>{
const directory=__dirname,full=path.join(directory,'miko-forward-generated-v3-attempt-02.png');
const splits=[[0,423,825,1240,1627],[0,420,827,1238,1627]];
const waist=[216,199,210,null,217,207,211,206],bottom=[442,445,450,null,414,416,420,414];
const composite=[];
for(let i=0;i<8;i++){
 const row=Math.floor(i/4),col=i%4;
 let input,anchorX,anchorY;
 if(i===3){
  const ratio=399/1179;
  input=await sharp(path.join(directory,'miko-forward-v3-cell-04-generated.png'))
   .resize(Math.round(1121*ratio),Math.round(1403*ratio),{kernel:'nearest'}).png().toBuffer();
  anchorX=Math.round(575*ratio);anchorY=Math.round(1244*ratio);
 }else{
  input=await sharp(full).extract({left:splits[row][col],top:row*484,width:splits[row][col+1]-splits[row][col],height:row?483:484}).png().toBuffer();
  anchorX=waist[i];anchorY=bottom[i];
 }
 const left=256-anchorX,top=470-anchorY;
 const cell=await sharp({create:{width:512,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
  .composite([{input,left,top}]).png().toBuffer();
 composite.push({input:cell,left:col*512,top:row*512});
}
await sharp({create:{width:2048,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
 .composite(composite).png().toFile(path.join(directory,'miko-forward-generated-v3.png'));
})();
