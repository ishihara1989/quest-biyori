'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths,crypto=require('node:crypto');
const {PNG}=require('pngjs'),Playback=require('../public/js/core/motion-playback.js'),M=require('../public/js/skills/paladin-motions.js');
const dir=path.resolve(__dirname,'../public/assets/paladin/motions'),manifest=id=>JSON.parse(fs.readFileSync(path.join(dir,id,'manifest.json')));
test('seven requested motions contain real RGBA frames, safe margins and matching clocks',()=>{
 for(const id of M.MOTIONS){const m=manifest(id),hashes=new Set();assert.equal(m.frameCount,id==='shield-advance'?6:id==='break-strike'?4:3);assert.equal(m.durationMs,M.CLOCKS[id]);assert.equal(m.loop,id==='shield-advance');
  const sheet=PNG.sync.read(fs.readFileSync(path.join(dir,id,m.sheet)));assert.equal(sheet.width,m.frameCount*256);assert.equal(sheet.height,256);
  for(const f of m.frames){const im=PNG.sync.read(fs.readFileSync(path.join(dir,id,f.file)));hashes.add(crypto.createHash('sha256').update(im.data).digest('hex'));let empty=0,solid=0;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++){const a=im.data[(y*256+x)*4+3];if(!a)empty++;if(a>=128)solid++;if(x===0||x===255||y===0||y===255)assert.ok(a<8,id+' transparent margin');assert.equal(a,sheet.data[(y*sheet.width+f.x+x)*4+3]);}
   assert.ok(empty>256*256*.5);assert.ok(solid>2000);
  }assert.equal(hashes.size,m.frameCount,id+' unique poses');
 }
});
test('raised mace joins the slam with identical position, palette and pixels',()=>{
 const a=manifest('mace-raise'),b=manifest('mace-slam');assert.equal(a.transitions.to,'mace-slam');assert.equal(b.transitions.from,'mace-raise');
 assert.deepEqual(PNG.sync.read(fs.readFileSync(path.join(dir,'mace-raise',a.frames[2].file))).data,PNG.sync.read(fs.readFileSync(path.join(dir,'mace-slam',b.frames[0].file))).data);
});
test('shield advance plays both three-frame halves and loops from frame six to one',()=>{
 const m=manifest('shield-advance');assert.deepEqual(m.frameSequence,[0,1,2,3,4,5]);for(let i=0;i<6;i++)assert.equal(Playback.sample(m,m,i*110+1).frame,i);
 assert.equal(Playback.sample(m,m,659).frame,5);assert.equal(Playback.sample(m,m,660).frame,0);
 assert.ok(m.frames[0].phase.includes('手前'));assert.ok(m.frames[3].phase.includes('奥'));
});
