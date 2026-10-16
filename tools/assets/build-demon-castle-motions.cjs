'use strict';
// Rectangle extraction and whole-pose registration only; preserve native RGBA.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),sharp=require('sharp'),{PNG}=require('pngjs');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('demon-castle-motions/v2'),size=512;
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function reviewFingerprint(frames,clip){return hash(Buffer.from(JSON.stringify({version:2,frames:frames.map(f=>({sha256:f.sha256,durationMs:f.durationMs,phase:f.phase})),events:clip.events||[],loop:!!clip.loop,terminal:!!clip.terminal})));}
function metrics(buffer){const im=PNG.sync.read(buffer);let edge=0,clear=0;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){const a=im.data[(y*im.width+x)*4+3];if(!a)clear++;if(a>32&&(x===0||y===0||x===im.width-1||y===im.height-1))edge++;}return{width:im.width,height:im.height,edgeOpaquePixels:edge,transparentFraction:clear/(im.width*im.height)};}
async function main(){const selection=read('selection.json'),notes=fs.existsSync(path.join(root,'review-notes.json'))?read('review-notes.json'):{},catalog=[],qa=[];
 if(process.argv.includes('--review-only')){
  const report=read('qa.json'),index=read('review-index.json'),sourceHashes=new Map();
  for(const item of report.clips){const entry=index.find(c=>c.id===item.id),file=path.join(root,entry.manifest),m=JSON.parse(fs.readFileSync(file,'utf8')),clip=selection.clips[item.id];assert.equal(m.frames.length,clip.frames.length);
   for(const [i,f]of m.frames.entries()){const selected=clip.frames[i],source=path.resolve(root,selected.source);assert.equal(path.resolve(path.dirname(file),f.source),source);if(!sourceHashes.has(source))sourceHashes.set(source,hash(fs.readFileSync(source)));assert.equal(f.sourceSha256,sourceHashes.get(source),'Changed source '+item.id);assert.equal(f.sha256,hash(fs.readFileSync(path.join(path.dirname(file),f.file))),'Changed output '+item.id);assert.equal(f.durationMs,selected.durationMs);assert.deepEqual(f.sourceAnchor,selected.anchor);assert.deepEqual(f.pivot,selected.target);assert.equal(f.scale,selected.scale);if(selected.rect)assert.deepEqual(f.sourceRect,selected.rect);}
   assert.equal(reviewFingerprint(m.frames,clip),item.fingerprint,'Build required before review update '+item.id);
   const n=notes[item.id],checked=n?.fingerprint===item.fingerprint;item.framesChecked=checked&&n.framesChecked===true;item.playbackChecked=checked&&n.playbackChecked===true;item.accepted=checked&&n.accepted===true;item.review=checked?n:null;m.acceptedForIntegration=item.accepted;writeAssetJson(file,m);
  }
  const expected=read('plan.json').expectedClipIds||[];report.complete=expected.length>0&&expected.every(id=>report.clips.some(c=>c.id===id))&&report.clips.every(c=>c.accepted);report.expectedClipIds=expected;
  writeAssetJson(path.join(root,'qa.json'),report);console.log(JSON.stringify({reviewOnly:true,clips:report.clips.length,frames:report.clips.reduce((s,c)=>s+c.frames,0),accepted:report.clips.filter(c=>c.accepted).length,complete:report.complete}));return;
 }
 for(const [id,clip]of Object.entries(selection.clips)){
  const dir=path.join(root,'review',id);makeAssetDirectory(dir);const inputs=[],frames=[];
  for(const [i,f]of clip.frames.entries()){
   const source=path.join(root,f.source),buffer=fs.readFileSync(source),meta=await sharp(buffer).metadata(),rect=f.rect||{left:0,top:0,width:meta.width,height:meta.height};
   assert.equal(metrics(buffer).edgeOpaquePixels,0,'Clipped original '+f.source);
   const w=Math.round(rect.width*f.scale),h=Math.round(rect.height*f.scale),left=Math.round(f.target[0]-f.anchor[0]*f.scale),top=Math.round(f.target[1]-f.anchor[1]*f.scale);
   assert.ok(left>=0&&top>=0&&left+w<=size&&top+h<=size,'Export would clip '+id+'/'+i);
   const pose=await sharp(buffer).extract(rect).resize(w,h,{kernel:'nearest'}).png().toBuffer();
   const out=await sharp({create:{width:size,height:size,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:pose,left,top}]).png().toBuffer();
   const file='frame-'+(i+1)+'.png';fs.writeFileSync(path.join(dir,file),out);inputs.push(out);
   const stats=metrics(out);assert.equal(stats.edgeOpaquePixels,0,'Export edge '+id+'/'+i);
   frames.push({file,durationMs:f.durationMs,phase:f.phase,source:path.relative(dir,source).replaceAll('\\','/'),sourceSha256:hash(buffer),sourceRect:rect,sourceAnchor:f.anchor,scale:f.scale,pivot:f.target,sha256:hash(out),...stats});
  }
  const fingerprint=reviewFingerprint(frames,clip),review=notes[id]?.fingerprint===fingerprint?notes[id]:null;
  const manifest={id,label:clip.label,enemy:clip.enemy||null,motion:clip.motion,kind:clip.kind||null,origin:clip.origin||'revision',inheritedIssues:clip.inheritedIssues||[],frameWidth:size,frameHeight:size,loop:!!clip.loop,terminal:!!clip.terminal,previewOnly:true,runtimeRegistered:false,acceptedForIntegration:review?.accepted===true,reference:clip.reference?path.relative(dir,path.resolve(root,clip.reference)).replaceAll('\\','/'):null,frames,fingerprint,events:clip.events||[],effects:clip.effects||[]};
  writeAssetJson(path.join(dir,'manifest.json'),manifest);
  const raw=Buffer.concat(await Promise.all(inputs.map(p=>sharp(p).ensureAlpha().raw().toBuffer())));
  await sharp(raw,{raw:{width:size,height:size*frames.length,channels:4,pageHeight:size}}).gif({delay:frames.map(f=>f.durationMs),loop:0,dither:0}).toFile(path.join(dir,'preview.gif'));
  await sharp({create:{width:size*frames.length,height:size,channels:4,background:'#c0ccd6'}}).composite(inputs.map((input,i)=>({input,left:i*size,top:0}))).png().toFile(path.join(dir,'contact.png'));
  catalog.push({id,label:clip.label,enemy:clip.enemy,motion:clip.motion,manifest:'review/'+id+'/manifest.json',contact:'review/'+id+'/contact.png',gif:'review/'+id+'/preview.gif'});
  qa.push({id,fingerprint,frameHashes:frames.map(f=>f.sha256),frames:frames.length,framesChecked:review?.framesChecked===true,playbackChecked:review?.playbackChecked===true,accepted:review?.accepted===true,review});
 }
 const expected=read('plan.json').expectedClipIds||[],complete=expected.length>0&&expected.every(id=>qa.some(c=>c.id===id))&&qa.every(c=>c.accepted);
 writeAssetJson(path.join(root,'review-index.json'),catalog);writeAssetJson(path.join(root,'qa.json'),{date:'2026-10-15 JST',runtimeRegistered:false,clips:qa,expectedClipIds:expected,complete});
 console.log(JSON.stringify({clips:qa.length,frames:qa.reduce((s,c)=>s+c.frames,0),accepted:qa.filter(c=>c.accepted).length}));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={reviewFingerprint};
