'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {ROOT}=require('../lib/project-paths.cjs');
const production=path.join(ROOT,'development/assets/ui/epic-gems');
async function build(){
  const record=JSON.parse(fs.readFileSync(path.join(production,'generation.json'),'utf8')),review=[];
  for(const asset of record.assets){
    const original=path.join(ROOT,asset.original),target=path.join(ROOT,asset.runtime);fs.mkdirSync(path.dirname(target),{recursive:true});
    const icon=await sharp(original).trim({threshold:5}).resize(112,112,{fit:'inside',kernel:'nearest'}).png().toBuffer();
    await sharp({create:{width:128,height:128,channels:4,background:'#00000000'}}).composite([{input:icon,gravity:'centre'}]).png().toFile(target);
    const {data,info}=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let pixels=0,minX=128,minY=128,maxX=0,maxY=0;for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(data[(y*128+x)*4+3]>0){pixels++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    if(info.channels!==4||!pixels||minX<5||minY<5||maxX>122||maxY>122)throw Error('Invalid alpha / bounds: '+asset.id);
    review.push({id:asset.id,runtime:asset.runtime,pixels,bounds:[minX,minY,maxX,maxY]});
  }
  const tiles=await Promise.all(record.assets.map(async(a,i)=>({input:await sharp(path.join(ROOT,a.runtime)).resize(160,160,{kernel:'nearest'}).png().toBuffer(),left:(i%6)*184+12,top:Math.floor(i/6)*184+12})));
  await sharp({create:{width:1104,height:552,channels:4,background:'#14222cff'}}).composite(tiles).png().toFile(path.join(production,'review.png'));
  fs.writeFileSync(path.join(production,'review.json'),JSON.stringify({date:record.date,staticIcons:true,assets:review},null,2)+'\n');
  console.log('Registered '+review.length+' transparent icons; alpha and margins verified.');
}
if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={build};
