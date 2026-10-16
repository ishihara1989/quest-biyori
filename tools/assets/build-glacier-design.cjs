'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Pack generated static references; no artwork is painted or retouched here.
const fs=require('node:fs');
const path=require('../lib/project-paths.cjs').assetPaths;
const sharp=require('sharp');
const {PNG}=require('pngjs');
const root=path.resolve(__dirname,'../../public/assets/mid-late-design/v1');
const dir=path.join(root,'glacier');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const save=(file,data)=>writeAssetJson(file, data);
function bounds(p){
  let l=p.width,t=p.height,r=-1,b=-1,clear=0;
  for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
    const a=p.data[(y*p.width+x)*4+3];if(a===0)clear++;
    if(a>12){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}
  }
  if(!clear||r<l||l===0||t===0||r===p.width-1||b===p.height-1)throw new Error('Missing alpha, empty or clipped reference');
  return {left:l,top:t,width:r-l+1,height:b-t+1};
}
function cuts(p,cols,rows){
  function find(axis,expected,start,end){
    const limit=axis==='x'?p.width:p.height,radius=Math.round(limit/(axis==='x'?cols:rows)*.2);
    const clear=n=>{for(let t=start;t<end;t++){const x=axis==='x'?n:t,y=axis==='y'?n:t;if(p.data[(y*p.width+x)*4+3]>12)return false;}return true;};
    for(let d=0;d<=radius;d++)for(const n of d?[expected-d,expected+d]:[expected])if(n>0&&n<limit&&clear(n)&&clear(n-1))return n;
    throw new Error('No transparent gutter');
  }
  const ys=[0];for(let i=1;i<rows;i++)ys.push(find('y',Math.round(p.height*i/rows),0,p.width));ys.push(p.height);
  const xs=[];for(let r=0;r<rows;r++){const row=[0];for(let i=1;i<cols;i++)row.push(find('x',Math.round(p.width*i/cols),ys[r],ys[r+1]));row.push(p.width);xs.push(row);}
  return {xs,ys};
}
async function packReference(input,width,height){
  // Keep the generated alpha and use nearest-neighbor only for atlas packing.
  const p=PNG.sync.read(fs.readFileSync(input)),b=bounds(p);
  return sharp(input).extract(b).resize({width,height,fit:'inside',kernel:'nearest',withoutEnlargement:true}).png().toBuffer({resolveWithObject:true});
}
async function main(){
  const input=read(path.join(dir,'source/generation-input-v3.json'));
  const generation=read(path.join(root,'generation.json'));
  const records=[];
  for(const a of input.assets){
    if(!fs.existsSync(a.generatedPath))throw new Error('Missing '+a.id);
    const source=path.join(root,a.source),file=path.join(root,a.file);
    fs.copyFileSync(a.generatedPath,source);fs.copyFileSync(source,file);
    bounds(PNG.sync.read(fs.readFileSync(file)));
    records.push({...a,generation:'built-in image_gen',transparentBackground:true,version:1});
  }
  const original=path.join(dir,'monsters-v2.png'),p=PNG.sync.read(fs.readFileSync(original)),top=Math.round(p.height*2/3);
  const mammoth=await packReference(path.join(dir,'ice-tusk-mammoth.png'),Math.round(p.width/3*.83),Math.round(p.height/3*.78));
  const cell=Math.round(p.width/3),left=Math.round((p.width-mammoth.info.width)/2),y=top+Math.round((p.height-top-mammoth.info.height)/2);
  const packedPixels=PNG.sync.read(PNG.sync.write(p)),bossPixels=PNG.sync.read(mammoth.data);
  packedPixels.data.fill(0,top*p.width*4);
  for(let row=0;row<bossPixels.height;row++)bossPixels.data.copy(packedPixels.data,((y+row)*p.width+left)*4,row*bossPixels.width*4,(row+1)*bossPixels.width*4);
  fs.writeFileSync(path.join(dir,'monsters-v3.png'),PNG.sync.write(packedPixels));
  const packed=PNG.sync.read(fs.readFileSync(path.join(dir,'monsters-v3.png')));
  if(!p.data.subarray(0,top*p.width*4).equals(packed.data.subarray(0,top*p.width*4)))throw new Error('Existing six enemies changed');
  if(left<=cell||left+mammoth.info.width>=cell*2)throw new Error('Mammoth leaves bottom-center cell');
  const drops=PNG.sync.read(fs.readFileSync(path.join(dir,'drops.png'))),{xs,ys}=cuts(drops,3,2);
  const replaced={left:xs[1][1],top:ys[1],width:xs[1][2]-xs[1][1],height:ys[2]-ys[1]};
  const tusk=await packReference(path.join(dir,'mammoth-ice-tusk.png'),Math.round(replaced.width*.78),Math.round(replaced.height*.78));
  const revised=PNG.sync.read(PNG.sync.write(drops));
  for(let y=replaced.top;y<replaced.top+replaced.height;y++)for(let x=replaced.left;x<replaced.left+replaced.width;x++)revised.data.fill(0,(y*drops.width+x)*4,(y*drops.width+x)*4+4);
  const tuskPixels=PNG.sync.read(tusk.data),tx=replaced.left+Math.round((replaced.width-tusk.info.width)/2),ty=replaced.top+Math.round((replaced.height-tusk.info.height)/2);
  for(let row=0;row<tuskPixels.height;row++)tuskPixels.data.copy(revised.data,((ty+row)*drops.width+tx)*4,row*tuskPixels.width*4,(row+1)*tuskPixels.width*4);
  fs.writeFileSync(path.join(dir,'drops-v2.png'),PNG.sync.write(revised));
  const revisedDrops=PNG.sync.read(fs.readFileSync(path.join(dir,'drops-v2.png')));
  for(let y=0;y<drops.height;y++)for(let x=0;x<drops.width;x++){
    if(x>=replaced.left&&x<replaced.left+replaced.width&&y>=replaced.top&&y<replaced.top+replaced.height)continue;
    const i=(y*drops.width+x)*4;if(!drops.data.subarray(i,i+4).equals(revisedDrops.data.subarray(i,i+4)))throw new Error('Existing four materials changed');
  }
  const effects=PNG.sync.read(fs.readFileSync(path.join(dir,'effects.png'))),fxCuts=cuts(effects,2,2),fx=[];
  makeAssetDirectory(path.join(dir,'effects'),{recursive:true});
  for(const [i,id,name] of [[0,'tusk-sweep','氷牙大薙ぎ'],[1,'ice-quake','氷震踏砕'],[2,'glacial-boulder','氷塊天落'],[3,'aurora-crown','白夜の氷冠']]){
    const row=Math.floor(i/2),col=i%2,box={left:fxCuts.xs[row][col],top:fxCuts.ys[row],width:fxCuts.xs[row][col+1]-fxCuts.xs[row][col],height:fxCuts.ys[row+1]-fxCuts.ys[row]};
    const file='glacier/effects/'+id+'.png';await sharp(path.join(dir,'effects.png')).extract(box).png().toFile(path.join(root,file));
    const b=bounds(PNG.sync.read(fs.readFileSync(path.join(root,file))));fx.push({id,name,file,source:'glacier/effects.png',crop:box,bounds:b,status:'static-design-reference'});
  }
  for(const [id,file,source,from] of [['glacier-monsters-v3','glacier/monsters-v3.png','glacier/source/monsters-packed-v3.png','glacier/monsters-v2.png'],['glacier-drops-v2','glacier/drops-v2.png','glacier/source/drops-packed-v2.png','glacier/drops.png']]){
    fs.copyFileSync(path.join(root,file),path.join(root,source));
    records.push({id,assetId:id.startsWith('glacier-monsters')?'glacier-monsters':'glacier-drops',kind:id.startsWith('glacier-monsters')?'monsters':'drops',file,source,version:id.endsWith('v3')?3:2,reference:from,generation:'packing of built-in image_gen references',transparentBackground:true,prompt:'Replace only the boss / rare cell using generated references; retain all other original RGBA pixels. Nearest-neighbor fitting, no painting.',generatedPath:null});
  }
  generation.date='2026-10-12 JST';generation.assets=[...generation.assets.filter(a=>!records.some(r=>r.id===a.id)),...records];save(path.join(root,'generation.json'),generation);
  save(path.join(dir,'effects/manifest.json'),{region:'glacier',generation:'built-in image_gen',motionProduction:'not-started',effects:fx});
  save(path.join(dir,'replacement-qa.json'),{date:'2026-10-12 JST',sixExistingEnemyPixelsUnchanged:true,fourExistingMaterialPixelsUnchanged:true,rareCell:replaced,mammothCell:{left,top:y,width:mammoth.info.width,height:mammoth.info.height},references:input.assets.map(a=>({id:a.id,bounds:bounds(PNG.sync.read(fs.readFileSync(path.join(root,a.file))))})),effects:fx});
  console.log(JSON.stringify({sixExistingEnemyPixelsUnchanged:true,fourExistingMaterialPixelsUnchanged:true,effects:fx.length,monsterSheet:'glacier/monsters-v3.png',dropSheet:'glacier/drops-v2.png'}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
