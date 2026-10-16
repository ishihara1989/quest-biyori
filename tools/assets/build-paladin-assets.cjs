'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Packaging only: generated RGBA pixels, cell extraction, nearest sampling and registration.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const {PNG}=require('pngjs'),sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'public/assets');
const json=(file,data)=>writeAssetJson(file, data);
function bounds(im){let l=im.width,t=im.height,r=-1,b=-1;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(im.data[(y*im.width+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return {l,t,r,b};}
function cell(im,n,cols,rows=1,cuts,rect){const x=rect?.x??cuts?.[n%cols]??Math.round(n%cols*im.width/cols),y=rect?.y??Math.round(Math.floor(n/cols)*im.height/rows),w=rect?.width??(cuts?.[n%cols+1]??Math.round((n%cols+1)*im.width/cols))-x,h=rect?.height??Math.round((Math.floor(n/cols)+1)*im.height/rows)-y,o=new PNG({width:w,height:h});for(let iy=0;iy<h;iy++)o.data.set(im.data.subarray(((y+iy)*im.width+x)*4,((y+iy)*im.width+x+w)*4),iy*w*4);return o;}
async function build(records){
 const indexFile=path.join(base,'paladin/motions/index.json'),index=JSON.parse(fs.readFileSync(indexFile));
 for(const rec of records){
  const dir=path.join(base,rec.type==='motion'?'paladin/motions/'+rec.id:'skills/paladin');makeAssetDirectory(path.join(dir,'source'),{recursive:true});
  const sourceName=rec.id+'-generated-v'+(rec.version||1)+'.png',source=path.join(dir,'source',sourceName);if(path.resolve(root,rec.source)!==source)fs.copyFileSync(path.resolve(root,rec.source),source);
  fs.writeFileSync(path.join(dir,rec.type==='motion'?'PROMPT.md':'PROMPT-'+rec.id+'.md'),rec.prompt+'\n');
  const im=PNG.sync.read(fs.readFileSync(source));assert.ok(im.data.some((v,i)=>i%4===3&&v===0),'Generated alpha required: '+rec.id);
  if(rec.type==='icons'){
   makeAssetDirectory(path.join(dir,'icons'),{recursive:true});for(let n=0;n<rec.ids.length;n++)await sharp(PNG.sync.write(cell(im,n,rec.columns,rec.rows))).trim().resize(88,88,{fit:'contain',background:'#00000000',kernel:'nearest'}).extend({top:4,bottom:4,left:4,right:4,background:'#00000000'}).png().toFile(path.join(dir,'icons',rec.ids[n]+'.png'));continue;
  }
  const effect=rec.type==='effect',parts=rec.parts?rec.parts.map((p,i)=>{const local=path.join(dir,'source',rec.id+'-part-'+(i+1)+'.png');if(path.resolve(root,p.source)!==local)fs.copyFileSync(path.resolve(root,p.source),local);return {...p,source:local};}):[{source,columns:rec.columns||3,rows:rec.rows||1,count:rec.count||3}];
  const poses=parts.flatMap(p=>{const image=PNG.sync.read(fs.readFileSync(p.source||source));return Array.from({length:p.count},(_,n)=>cell(image,n,p.columns,p.rows||1,p.xCuts||rec.xCuts,p.rects?.[n]||rec.rects?.[n]));});
  // Blonde head top is the body-size reference, so a raised mace or shield cannot shrink her.
  const bodyHeight=pose=>{const b=bounds(pose);let top=b.b;for(let y=0;y<pose.height*.85;y++){let count=0;for(let x=0;x<pose.width*.72;x++){const i=(y*pose.width+x)*4,[r,g,bl,a]=pose.data.subarray(i,i+4);if(a>=128&&r>150&&g>100&&g<r*.95&&bl<g*.86)count++;}if(count>pose.width*.08){top=y;break;}}assert.ok(top<b.b,'Cannot locate blonde hair: '+rec.id);return b.b-top;};
  const scale=effect?1:rec.scale||130/Math.max(...poses.map(bodyHeight));
  const w=256,h=256,pivot=effect?{x:128,y:['pillar','rampart'].includes(rec.id)?224:128}:{x:128,y:239},frames=[],images=[];
  const outDir=effect?path.join(dir,'effects',rec.id):dir;makeAssetDirectory(outDir,{recursive:true});
  for(let n=0;n<poses.length;n++){
   const pose=poses[n],b=bounds(pose);assert.ok(b.r>b.l,'Empty cell '+rec.id+':'+n);if(!effect)assert.ok(b.l>0&&b.t>0&&b.r<pose.width-1&&b.b<pose.height-1,'Source cell clipped '+rec.id+':'+n);
   let output;if(effect)output=PNG.sync.read(await sharp(PNG.sync.write(pose)).resize(224,224,{fit:'contain',background:'#00000000',kernel:'nearest'}).extend({top:16,bottom:16,left:16,right:16,background:'#00000000'}).png().toBuffer());
   else{
    let l=pose.width,r=-1;for(let y=b.b-30;y<=b.b;y++)for(let x=0;x<pose.width;x++)if(pose.data[(y*pose.width+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);}
    const ax=rec.anchors?.[n]?.x??(l+r)/2,ay=rec.anchors?.[n]?.y??b.b;output=new PNG({width:w,height:h});
    // Crop the sprite bounding rectangle with 8 source pixels of feathering; retain empty destination margins.
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.round(ax+(x-pivot.x)/scale),sy=Math.round(ay+(y-pivot.y)/scale);if(sx>=Math.max(0,b.l-8)&&sy>=Math.max(0,b.t-8)&&sx<=Math.min(pose.width-1,b.r+8)&&sy<=Math.min(pose.height-1,b.b+8))output.data.set(pose.data.subarray((sy*pose.width+sx)*4,(sy*pose.width+sx)*4+4),(y*w+x)*4);}
   }
   if(n===0&&rec.connection){const previous=JSON.parse(fs.readFileSync(path.join(base,'paladin/motions',rec.connection.motion,'manifest.json')));output=PNG.sync.read(fs.readFileSync(path.join(base,'paladin/motions',rec.connection.motion,previous.frames[rec.connection.frame].file)));}
   const ob=bounds(output);assert.ok(ob.l>1&&ob.t>1&&ob.r<w-2&&ob.b<h-2,'Output clipped '+rec.id+':'+n);
   const file=rec.id+'-'+String(n+1).padStart(2,'0')+'.png';fs.writeFileSync(path.join(outDir,file),PNG.sync.write(output));images.push(output);
   frames.push({index:n,file,x:n*w,y:0,width:w,height:h,durationMs:rec.durations?.[n]||rec.frameMs||140,bounds:ob,phase:rec.phases?.[n]||String(n+1),previewOffset:{x:0,y:0},airborne:false});
  }
  const sheet=rec.id+'.png',joined=new PNG({width:w*frames.length,height:h});images.forEach((im,n)=>{for(let y=0;y<h;y++)joined.data.set(im.data.subarray(y*w*4,(y+1)*w*4),(y*joined.width+n*w)*4);});fs.writeFileSync(path.join(outDir,sheet),PNG.sync.write(joined));
  const durationMs=frames.reduce((sum,f)=>sum+f.durationMs,0),data={version:1,character:'paladin',label:rec.label||rec.id,motion:rec.id,sheet,width:joined.width,height:h,frameWidth:w,frameHeight:h,columns:frames.length,rows:1,frameCount:frames.length,frameSequence:frames.map(f=>f.index),durationMs,loop:!!rec.loop,terminal:false,movementDirection:0,pivot,frames,source:'source/'+sourceName,generation:'built-in image_gen; generated RGBA preserved',transitions:{from:rec.from||'idle',to:rec.to||'idle'}};
  if(effect)data.source='../../source/'+sourceName;
  json(path.join(outDir,'manifest.json'),data);
  const vertical=Buffer.concat(images.map(i=>i.data));await sharp(vertical,{raw:{width:w,height:h*frames.length,channels:4,pageHeight:h}}).gif({loop:rec.loop?0:1,delay:frames.map(f=>f.durationMs),dither:0,colours:256,keepDuplicateFrames:true}).toFile(path.join(outDir,'preview.gif'));
  if(!effect)await require('./build-motion-preview.cjs').buildPreview('paladin',rec.id);
  await sharp(PNG.sync.write(joined)).flatten({background:'#26323a'}).png().toFile(path.join(outDir,'review.png'));
  if(!effect)index.motions[rec.id]=rec.id+'/manifest.json';console.log(rec.id+': '+frames.length+' frames, '+durationMs+'ms');
 }
 index.motions=Object.fromEntries(Object.keys(require('./motion-specs.cjs').getMotionSpecs('paladin')).filter(id=>index.motions[id]).map(id=>[id,index.motions[id]]));json(indexFile,index);
}
if(require.main===module)build(JSON.parse(fs.readFileSync(path.join(__dirname,'../../development/records/paladin-generation.json')))).catch(e=>{console.error(e);process.exitCode=1;});module.exports=build;
