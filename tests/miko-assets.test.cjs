'use strict';
const fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict'),test=require('node:test'),{PNG}=require('pngjs');
const root=path.resolve(__dirname,'..'),publicRoot=path.join(root,'public'),base=path.join(publicRoot,'assets/skills/miko'),plan=require('../tools/assets/miko-assets-plan.cjs');
const catalog=JSON.parse(fs.readFileSync(require('../tools/lib/project-paths.cjs').developmentAsset('skills/miko/catalog.json'),'utf8'));
test('complete independent and possession asset set, with only 3–4 poses per generation',()=>{
 assert.equal(catalog.generatedJobs,plan.jobs.length);assert.deepEqual(catalog.missingJobs,[]);
 assert.equal(catalog.species.length,15);assert.equal(catalog.species.filter(s=>s.kind==='spirit').length,4);
 assert.equal(new Set(catalog.assets.map(a=>a.id)).size,catalog.assets.length);
 for(const job of plan.jobs){assert.ok([3,4].includes(job.count));assert.ok(catalog.assets.some(a=>a.id===job.id),job.id);}
 for(const s of catalog.species){const assets=catalog.assets.filter(a=>a.subject===s.id);assert.ok(assets.some(a=>a.motion==='idle'));assert.ok(assets.some(a=>a.motion==='action'));if(s.kind==='ground'&&s.id!=='flame-wheel')assert.equal(assets.find(a=>a.motion==='walk').frameCount,6);if(s.id==='flame-wheel')assert.equal(assets.find(a=>a.motion==='roll').frameCount,4);}
});
test('every transparent PNG frame matches its sheet, fits its bounds, and has a valid clock',()=>{
 for(const a of catalog.assets){const dir=path.dirname(path.join(publicRoot,a.path)),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')),sheet=PNG.sync.read(fs.readFileSync(path.join(dir,m.sheet)));
  assert.equal(sheet.width,m.frameWidth*m.frameCount,a.id);assert.equal(sheet.height,m.frameHeight,a.id);assert.equal(m.durationMs,m.frames.reduce((n,f)=>n+f.durationMs,0),a.id);assert.ok(Number.isFinite(m.scale)&&m.scale>0,a.id);assert.equal(m.sampling,'nearest-neighbor');
  for(const f of m.frames){const im=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));assert.equal(im.width,m.frameWidth);assert.equal(im.height,m.frameHeight);assert.ok(im.data.some((v,i)=>i%4===3&&v===0),a.id+' alpha');assert.ok(f.bounds.l>=4&&f.bounds.t>=4&&f.bounds.r<=im.width-5&&f.bounds.b<=im.height-5,a.id+' margins');assert.ok(f.durationMs>=60);
   for(let y=0;y<im.height;y++)assert.deepEqual(sheet.data.subarray((y*sheet.width+f.x)*4,(y*sheet.width+f.x+im.width)*4),im.data.subarray(y*im.width*4,(y+1)*im.width*4),a.id+' sheet/frame');
  }
  assert.ok(fs.statSync(path.join(dir,'preview.gif')).size>100,a.id+' GIF');assert.ok(fs.statSync(path.join(dir,'review.png')).size>100,a.id+' review');
  if(m.motion!=='walk'){assert.ok(fs.existsSync(path.resolve(dir,m.source)),a.id+' original');assert.ok(fs.readFileSync(path.join(dir,'PROMPT.md'),'utf8').includes('Built-in image_gen'),a.id+' prompt');}
 }
});
test('all motions of one creature use a common scale and the walk preserves both halves',()=>{
 const groups=new Map();for(const a of catalog.assets){const key=a.group+'/'+a.subject;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(a);}
 for(const assets of groups.values()){if(assets[0].group==='miko')continue;assert.equal(new Set(assets.map(a=>a.scale)).size,1,assets[0].subject);}
 for(const s of catalog.species){const walk=catalog.assets.find(a=>a.id===s.id+'-walk');if(!walk)continue;for(const [part,offset] of [['walk-a',0],['walk-b',3]]){const half=catalog.assets.find(a=>a.id===s.id+'-'+part);for(let i=0;i<3;i++)assert.deepEqual(fs.readFileSync(path.join(publicRoot,path.dirname(walk.path),walk.frames[offset+i].file)),fs.readFileSync(path.join(publicRoot,path.dirname(half.path),half.frames[i].file)),s.id+' walk halves');}}
});
test('twenty skill handoffs resolve every asset and retain the planned release times',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(base,'skill-assets.json'),'utf8'));assert.equal(data.skills.length,20);
 for(const skill of data.skills){for(const p of [skill.icon,skill.motion.prayer,skill.motion.rotation,skill.motion.finisher,...skill.effects,skill.onHit,...Object.values(skill.summon||{}).filter(p=>typeof p==='string'&&p.endsWith('.json'))].filter(Boolean))assert.ok(fs.existsSync(path.join(publicRoot,p)),skill.id+' '+p);for(const id of skill.castLayers)assert.ok(catalog.assets.some(a=>a.id===id),id);assert.equal(skill.level%5,0);}
 assert.equal(data.skills.find(s=>s.level===5).motion.releaseMs,820);assert.equal(data.skills.find(s=>s.level===25).motion.releaseMs,830);assert.equal(data.skills.find(s=>s.level===50).motion.releaseMs,1260);assert.equal(data.skills.find(s=>s.level===100).motion.releaseMs,1980);
});
