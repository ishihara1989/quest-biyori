'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{PNG}=require('pngjs');
const {developmentAsset}=require('../tools/lib/project-paths.cjs'),Motion=require('../public/js/core/motion-playback.js');
const root=developmentAsset('volcano-motions/v2'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
test('exported candidates preserve complete frame sets, source links, alpha and source hashes',()=>{
 const index=read('review-index.json'),qa=read('qa.json'),generation=read('generation.json');assert.ok(index.length>0);
 for(const s of qa.sources){assert.equal(hash(path.join(root,s.file)),s.sha256);assert.notEqual(s.extraction,'connected-components');assert.equal(s.edgeOpaquePixels,0);assert.ok(generation.records.some(r=>r.source===s.file&&r.sha256===s.sha256));}
 for(const c of index){const file=path.join(root,c.manifest),dir=path.dirname(file),m=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(m.frameCount,m.frames.length);assert.equal(m.frames.length,m.motion==='move'?6:['hit','down'].includes(m.motion)?2:4);assert.equal(m.durationMs,m.frames.reduce((n,f)=>n+f.durationMs,0));
  for(const p of [m.sheet,m.preview,m.reference,...m.originalSources].filter(Boolean))assert.ok(fs.existsSync(path.resolve(dir,p)),c.id+' missing '+p);
  const frameHashes=[];for(const f of m.frames){const image=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));assert.equal(image.width,m.frameWidth);assert.equal(image.height,m.frameHeight);assert.ok(f.visibleBounds.left>0&&f.visibleBounds.top>0&&f.visibleBounds.right<image.width-1&&f.visibleBounds.bottom<image.height-1);assert.ok(image.data.some((v,i)=>i%4===3&&v===0));frameHashes.push(hash(path.join(dir,f.file)));}
  const fingerprint=crypto.createHash('sha256').update(frameHashes.join('')).digest('hex');assert.equal(fingerprint,qa.clips.find(q=>q.id===c.id).fingerprint);
 }
});
test('reaction exports share one scale between hit, recovery, collapse and terminal pose',()=>{
 const index=read('review-index.json');for(const hit of index.filter(c=>c.motion==='hit')){const down=index.find(c=>c.id===hit.enemy+'/down'),a=read(hit.manifest),b=read(down.manifest);assert.ok(b.terminal&&!b.loop);assert.equal(b.endBehavior,'hold');assert.equal(new Set([...a.frames,...b.frames].map(f=>f.sourceScale)).size,1,hit.enemy+' changes size at defeat');}
});
test('each available clip is compatible with shared timing and terminal playback',()=>{
 for(const c of read('review-index.json')){const m=read(c.manifest);assert.deepEqual(m.frameSequence,m.frames.map((_,i)=>i));let time=0;for(const [i,f]of m.frames.entries()){assert.equal(Motion.frameAt(m,time),i);time+=f.durationMs;}
  if(m.terminal)assert.equal(Motion.sample(m,m,m.durationMs+200).phase,'hold');if(m.motion==='move'){assert.equal(m.durationMs,720);assert.equal(m.frameCount,6);}
 }
});
test('thin low-alpha margins cannot silently shrink individual quadruped walking poses',()=>{
 for(const enemy of ['lava-salamander','young-fire-dragon','magma-salamander']){const m=read('ready/'+enemy+'/move/manifest.json'),widths=m.frames.map(f=>f.visibleBounds.right-f.visibleBounds.left+1);assert.ok(Math.max(...widths)/Math.min(...widths)<1.12,enemy+' visible body scale drifts across frames');}
});
test('double lava release has its specified delay and incomplete art is not adopted',()=>{
 const m=read('ready/magma-salamander/danger-1/manifest.json');assert.equal(m.events.length,2);assert.equal(m.events[1].timeMs-m.events[0].timeMs,800);assert.ok(m.events.every(e=>e.id==='lava-bomb'&&e.impact==='lava-impact'&&e.residue==='lava-pool'));
 const qa=read('qa.json');if(qa.missing.length){assert.equal(qa.complete,false);for(const c of read('review-index.json'))assert.equal(read(c.manifest).runtimeRegistered,false);}
});
test('dragon breaths retain distinct 0.9 and 1 second release intervals',()=>{
 for(const [id,gap]of [['dragon-girl/danger-2',900],['dragon/danger-2',1000]]){
  const m=read('ready/'+id+'/manifest.json');assert.equal(m.events[1].timeMs-m.events[0].timeMs,gap);
 }
});
