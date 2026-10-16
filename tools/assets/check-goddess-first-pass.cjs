'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),sharp=require('sharp');
const {developmentAsset,inside}=require('../lib/project-paths.cjs');
const root=developmentAsset('extradimensional-goddess/first-pass-v1'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{
 const jobs=read('jobs.json'),records=read('generation.json').records,failures=read('generation-failures.json').failures,index=read('review-index.json'),notes=read('review-notes.json');
 assert.equal(jobs.length,43);assert.equal(jobs.reduce((n,j)=>n+j.count,0),117);assert.equal(new Set(jobs.map(j=>j.id)).size,jobs.length);
 const attempts=[...records,...failures];assert.equal(attempts.length,jobs.length,'Every job must have exactly one recorded attempt');assert.equal(new Set(attempts.map(j=>j.id)).size,jobs.length,'No retries or duplicate jobs');assert.equal(new Set(records.map(r=>r.sha256)).size,records.length,'Sources must be distinct original generations');
 for(const j of jobs){const attempt=attempts.find(r=>r.id===j.id);assert(attempt);assert.equal(attempt.attempt,1);}
 for(const r of records){const file=path.resolve(root,r.source),j=jobs.find(j=>j.id===r.id);assert(inside(root,file));assert.equal(hash(file),r.sha256,'Original source changed '+r.id);assert.equal(r.prompt,j.prompt);const side=JSON.parse(fs.readFileSync(file.replace(/\.png$/,'.generation.json'),'utf8'));assert.equal(side.sha256,r.sha256);for(const ref of r.references)assert.equal(hash(path.resolve(root,ref.file)),ref.sha256,'Reference changed '+ref.file);}
 let frames=0,animated=0;
 for(const clip of index){assert.equal(clip.previewOnly,true);assert.equal(clip.accepted,false);assert.equal(notes[clip.id].framesChecked,true);const missing=clip.expectedFrames-clip.frames.length;assert.equal(clip.missingFrames.length,missing);assert.equal(clip.complete,missing===0);
  if(clip.frames.length>1){animated++;assert.equal(notes[clip.id].playbackChecked,true,'Playback not reviewed '+clip.id);}
  const gif=await sharp(path.join(root,clip.gif),{animated:true}).metadata();assert.equal(gif.pages,clip.frames.length,'GIF missing frames '+clip.id);
  for(const f of clip.frames){const target=path.resolve(root,f.file);assert(inside(root,target));const original=await sharp(path.join(root,f.source)).extract(f.sourceRect).ensureAlpha().raw().toBuffer();const extracted=await sharp(target).ensureAlpha().raw().toBuffer();assert(original.equals(extracted),'RGB/alpha changed during extraction '+f.file);frames++;}
 }
 assert.equal(frames,records.reduce((n,r)=>n+jobs.find(j=>j.id===r.id).count,0));
 const reuse=read('phantom-reuse.json').catalog;assert.equal(reuse.length,20);for(const c of reuse){assert(c.source.exists&&c.source.filesPresent,c.id);assert(c.effects.every(e=>e.exists&&e.filesPresent),c.id);}
 console.log(JSON.stringify({plannedJobs:jobs.length,savedJobs:records.length,failedJobs:failures.length,generatedCells:frames,reviewGroups:index.length,playbackReviewed:26,animated,missingCells:117-frames,originalHashes:'pass',referenceHashes:'pass',losslessRectangularExtraction:'pass',phantomSources:20,artAcceptance:'not asserted; issues remain'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
