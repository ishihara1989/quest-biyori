'use strict';
// Export generated poses without painting, alpha removal or per-pose scaling.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict'), sharp = require('sharp'), { PNG } = require('pngjs');
const { developmentAsset, makeAssetDirectory, writeAssetJson, ROOT } = require('../lib/project-paths.cjs');
const { extract } = require('./build-ruins.cjs'), { bounds } = require('./build-treant.cjs');
const root = developmentAsset('demon-god-redesign/v2');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const relative = (a,b) => path.relative(a,b).replaceAll('\\','/');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function stats(img) {
  let clear=0, edge=0;
  for(let y=0;y<img.height;y++) for(let x=0;x<img.width;x++) {
    const a=img.data[(y*img.width+x)*4+3];
    if(a===0)clear++;
    if(a>32&&(x===0||y===0||x===img.width-1||y===img.height-1))edge++;
  }
  return {transparentFraction:clear/(img.width*img.height),edgeOpaquePixels:edge,bounds:bounds(img,32)};
}
// Find the red chest core; record it separately from planned pelvis coordinates.
function core(img) {
  const b=bounds(img,32), h=b.bottom-b.top+1, w=b.right-b.left+1, candidates=[];
  for(let y=b.top+Math.floor(h*.2);y<b.top+h*.64;y++) for(let x=b.left+Math.floor(w*.18);x<b.left+w*.78;x++) {
    const i=(y*img.width+x)*4, [r,g,blue,a]=img.data.subarray(i,i+4);
    if(a>192&&r>225&&blue>65&&g<180&&r-g>60)candidates.push({x,y,weight:(r-g)*(blue+g)});
  }
  assert.ok(candidates.length,'Red chest core missing');
  let peak=null, best=-1;
  for(const p of candidates.filter((_,i)=>i%3===0)) {
    const score=candidates.reduce((sum,q)=>sum+(Math.abs(q.x-p.x)<14&&Math.abs(q.y-p.y)<14?q.weight:0),0);
    if(score>best){best=score;peak=p;}
  }
  const close=candidates.filter(p=>Math.abs(p.x-peak.x)<14&&Math.abs(p.y-peak.y)<14);
  const weight=close.reduce((s,p)=>s+p.weight,0);
  return {x:Math.round(close.reduce((s,p)=>s+p.x*p.weight,0)/weight),y:Math.round(close.reduce((s,p)=>s+p.y*p.weight,0)/weight)};
}
async function main() {
  const plan=read('plan.json'), layout=read('layout.json'), notes=fs.existsSync(path.join(root,'review-notes.json'))?read('review-notes.json'):{}, cache=new Map(), qa={date:'2026-10-14 JST',sources:[],motions:[],runtimeRegistered:false};
  function source(name) {
    if(cache.has(name))return cache.get(name);
    const file=path.join(root,'sources',name), full=PNG.sync.read(fs.readFileSync(file)), info=stats(full);
    assert.equal(info.edgeOpaquePixels,0,'Source clipped at outer edge: '+name);
    assert.ok(info.transparentFraction>.25,'Opaque backdrop: '+name);
    const e=extract(file,2,2);
    assert.notEqual(e.method,'connected-components','Do not mask generated pixels: '+name);
    const anchors=e.cells.map(core), b=stats(e.cells[0]).bounds;
    // One scale for the entire generated sheet, calibrated using its first pose.
    const scale=280/(b.bottom-b.top+1);
    const value={...e,name,anchors,scale};cache.set(name,value);
    qa.sources.push({file:relative(root,file),sha256:hash(file),width:full.width,height:full.height,...info,extraction:e.method,rects:e.rects,chestCoreMeasurements:anchors,scale});
    return value;
  }
  const clips=[];
  for(const motion of plan.motions) {
    const names=motion.id==='reaction'?['hit','down']:[motion.id];
    for(const id of names) {
      const start=id==='down'?2:0, count=['hit','down'].includes(id)?2:4;
      const refs=layout.frames[id]||Array.from({length:count},(_,i)=>({source:layout.sources[motion.id]||motion.id+'-generated.png',cell:start+i}));
      const dir=path.join(root,'review',id);makeAssetDirectory(dir);
      const frames=[], inputs=[];
      for(const [i,ref] of refs.entries()) {
        const s=source(ref.source),cell=s.cells[ref.cell],anchor=s.anchors[ref.cell],target=motion.rootTargets[start+i];
        const delta={x:(target[0]-550)*.39,y:(target[1]-555)*.39};
        const crop=stats(cell).bounds;
        const width=Math.round((crop.right-crop.left+1)*s.scale),height=Math.round((crop.bottom-crop.top+1)*s.scale);
        const left=Math.round(192+delta.x+(crop.left-anchor.x)*s.scale),top=Math.round(135+delta.y+(crop.top-anchor.y)*s.scale);
        assert.ok(left>=8&&top>=8&&left+width<=376&&top+height<=376,'Export clipping '+id+'/'+i+' '+JSON.stringify({left,top,width,height}));
        const pose=await sharp(PNG.sync.write(cell)).extract({left:crop.left,top:crop.top,width:crop.right-crop.left+1,height:crop.bottom-crop.top+1}).resize(width,height,{kernel:'nearest'}).png().toBuffer();
        const frame=await sharp({create:{width:384,height:384,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:pose,left,top}]).png().toBuffer();
        fs.writeFileSync(path.join(dir,'frame-'+(i+1)+'.png'),frame);inputs.push(frame);
        const metrics=stats(PNG.sync.read(frame));assert.equal(metrics.edgeOpaquePixels,0);
        frames.push({file:'frame-'+(i+1)+'.png',durationMs:motion.durations[start+i],phase:motion.phases[start+i],originalSource:relative(dir,path.join(root,'sources',ref.source)),sourceCell:ref.cell,sourceRect:s.rects[ref.cell],sourceChestCore:anchor,plannedRoot:target,exportChestCore:{x:192+delta.x,y:135+delta.y},sourceScale:s.scale,...metrics});
      }
      const raw=Buffer.concat(await Promise.all(inputs.map(p=>sharp(p).ensureAlpha().raw().toBuffer())));
      await sharp(raw,{raw:{width:384,height:384*count,channels:4,pageHeight:384}}).gif({delay:frames.map(f=>f.durationMs),loop:0,dither:0}).toFile(path.join(dir,'preview.gif'));
      const strips=inputs.map((input,i)=>({input,left:i*384,top:30}));
      for(const [i,f]of frames.entries())strips.push({input:await sharp(Buffer.from('<svg width="384" height="30"><text x="12" y="22" fill="#eee" font-size="17" font-family="sans-serif">'+(i+1)+' '+f.phase+'</text></svg>')).png().toBuffer(),left:i*384,top:0});
      await sharp({create:{width:384*count,height:414,channels:4,background:'#211c2d'}}).composite(strips).png().toFile(path.join(dir,'contact.png'));
      const manifest={id,label:id==='hit'?'被弾':id==='down'?'撃破':motion.label,enemy:'demon-god',frameWidth:384,frameHeight:384,reference:'../../references/demon-god.png',previewOnly:true,runtimeRegistered:false,loop:['idle','move'].includes(id),terminal:id==='down',frames,events:(motion.effects||[]).map(e=>({...e,timeMs:motion.durations.slice(0,e.frame).reduce((a,b)=>a+b,0)+(e.delayMs||0)})),effects:plan.effects,registration:'chest-core measured from source; planned pelvis deltas applied; one scale per source sheet; original alpha/RGB sampled intact'};
      writeAssetJson(path.join(dir,'manifest.json'),manifest);
      clips.push({id,label:manifest.label,manifest:relative(root,path.join(dir,'manifest.json')),gif:relative(root,path.join(dir,'preview.gif')),contact:relative(root,path.join(dir,'contact.png'))});
      const frameHashes=frames.map(f=>hash(path.join(dir,f.file))),fingerprint=crypto.createHash('sha256').update(frameHashes.join('')).digest('hex');
      const checked=notes[id]?.fingerprint===fingerprint;
      qa.motions.push({id,frames:frames.length,frameHashes,fingerprint,edgeOpaquePixels:0,playbackChecked:checked&&notes[id].playbackChecked===true,framesChecked:checked&&notes[id].framesChecked===true,review:checked?notes[id]:null});
    }
  }
  const ref=path.join(root,plan.reference);qa.reference={file:plan.reference,sha256:hash(ref),...stats(PNG.sync.read(fs.readFileSync(ref)))};
  writeAssetJson(path.join(root,'review-index.json'),clips);writeAssetJson(path.join(root,'qa.json'),qa);
  const records=fs.readdirSync(path.join(root,'sources')).filter(f=>f.endsWith('.generation.json')).map(f=>{const r=read('sources/'+f);return {...r,source:'sources/'+r.source,sha256:hash(path.join(root,'sources',r.source))};});
  writeAssetJson(path.join(root,'generation.json'),{tool:'built-in image_gen',date:plan.date,reference:qa.reference,records});
  console.log(JSON.stringify({clips:clips.length,frames:qa.motions.reduce((n,m)=>n+m.frames,0),sources:qa.sources.length,sourceEdges:qa.sources.map(x=>[x.file,x.edgeOpaquePixels]),output:relative(ROOT,root)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
