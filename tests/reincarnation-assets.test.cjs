'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{PNG}=require('pngjs');
const root=path.resolve(__dirname,'../public/assets/enemies/reincarnation-goddess/motions');
test('all 24 adopted goddess/weapon/effect clips have complete playback sequences, sheets, alpha and clear frame borders',()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(root,'index.json'),'utf8'));assert.equal(rows.length,24);let count=0;
 for(const row of rows){
  const dir=path.join(root,row.id),m=JSON.parse(fs.readFileSync(path.join(root,row.manifest),'utf8'));assert.equal(m.previewOnly,false);assert.equal(m.frames.length,m.frameCount);assert.ok(m.frameSequence.length>=m.frameCount);assert.equal(m.frames.reduce((n,f)=>n+f.durationMs,0),m.durationMs);
  const sheet=PNG.sync.read(fs.readFileSync(path.join(dir,m.sheet)));assert.equal(sheet.width,m.frameWidth*m.frameCount);assert.equal(sheet.height,m.frameHeight);
  for(const frame of m.frames){const png=PNG.sync.read(fs.readFileSync(path.join(dir,frame.file)));assert.equal(png.width,m.frameWidth);assert.equal(png.height,m.frameHeight);assert.equal(png.data[3],0);let solid=0,edge=0;
   for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){const alpha=png.data[(y*png.width+x)*4+3];if(alpha>32){solid++;if(x===0||y===0||x===png.width-1||y===png.height-1)edge++;}}
   assert.ok(solid>100,row.id+' empty frame');assert.equal(edge,0,row.id+' clipped border');count++;
  }
 }
 assert.equal(count,77);
});
