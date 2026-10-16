'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict'),crypto=require('node:crypto'),sharp=require('sharp'),{PNG}=require('pngjs');
const root=path.resolve(__dirname,'../../public/assets/highland-motions'),dir=path.join(root,'trot-v2/motions/move'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function main(){
  const backup=path.join(root,'backups/manticore-trot-v1-20261013'),info=JSON.parse(fs.readFileSync(path.join(backup,'backup-info.json')));
  for(const f of info.files)assert.equal(hash(path.join(backup,f.path)),f.sha256,'Backup modified: '+f.path);
  const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));assert.equal(m.frameCount,6);assert.equal(m.durationMs,720);assert.equal(m.loop,true);assert.equal(m.coordinateGuide.targetsOnly,true);
  for(const f of [m.source,m.prompt,m.reference,...m.originalSources,m.coordinateGuide.file])assert.ok(fs.existsSync(path.resolve(dir,f)),f);
  const hashes=new Set();for(const f of m.frames){const p=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));assert.equal(p.width,800);assert.equal(p.height,580);hashes.add(hash(path.join(dir,f.file)));assert.ok(f.bounds.left>0&&f.bounds.top>0&&f.bounds.right<799&&f.bounds.bottom<579);for(let x=0;x<p.width;x++){assert.equal(p.data[x*4+3],0);assert.equal(p.data[((p.height-1)*p.width+x)*4+3],0);}for(let y=0;y<p.height;y++){assert.equal(p.data[y*p.width*4+3],0);assert.equal(p.data[(y*p.width+p.width-1)*4+3],0);}}
  assert.equal(hashes.size,6);const gif=await sharp(path.join(dir,m.preview),{animated:true}).metadata();assert.equal(gif.pages,6);assert.deepEqual(gif.delay,Array(6).fill(120));
  const report={date:'2026-10-13 JST',status:'passed',scope:'technical asset integrity; no claim of exact generated paw position',backupFiles:info.files.length,frames:6,distinctFrames:6,checks:['backup SHA256','resource paths','800x580 cells','six distinct PNGs','transparent edges','unclipped output','720ms looping GIF']};
  writeAssetJson(path.join(root,'trot-v2/asset-qa.json'), report);console.log(JSON.stringify(report));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
