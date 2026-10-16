'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths,{PNG}=require('pngjs');
const {enemies,effects}=require('../tools/assets/highland-motion-specs.cjs'),Combat=require('../public/js/combat/highland-combat.js');
const pub=path.resolve(__dirname,'../public'),read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
test('all seven game enemies have their common states and every AI action, with intact source links',()=>{let frames=0;const catalog=read(path.join(pub,'assets/enemies/index.json'));for(const e of enemies){assert.ok(catalog.some(x=>x.id===e.id));const base=path.join(pub,'assets/enemies',e.id,'motions'),defs=read(path.join(base,'index.json'));assert.deepEqual(defs.map(x=>x.id).sort(),['idle','move','hit','down',...Object.keys(e.actions)].sort());for(const d of defs){const dir=path.dirname(path.join(base,d.manifest)),m=read(path.join(base,d.manifest));assert.equal(m.previewOnly,false);assert.equal(m.frameCount,m.frames.length);assert.equal(m.durationMs,m.frames.reduce((n,f)=>n+f.durationMs,0));for(const p of [m.sheet,m.preview,m.source,m.reference,m.prompt,...m.originalSources])assert.ok(fs.existsSync(path.resolve(dir,p)),e.id+'/'+d.id+': '+p);for(const f of m.frames){const png=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));assert.equal(png.width,e.width);assert.equal(png.height,e.height);assert.ok(png.data.some((v,i)=>i%4===3&&v===0));frames++;}if(d.id==='down'){assert.ok(m.terminal&&!m.loop);assert.equal(m.endBehavior,'hold');}if(d.id==='move'&&e.locomotion==='walk'){assert.equal(m.frameCount,6);assert.equal(m.walkCycle.gait,'trot');assert.equal(m.durationMs,720);}const row=Combat.ACTIONS[e.id].find(a=>a.motion===d.id);if(row)assert.equal(m.action.motion,row.motion);}}assert.equal(frames,174);});
test('all ten named combat effects and the highland background are registered',()=>{for(const e of effects){const dir=path.join(pub,'assets/effects/highland-'+e.id),m=read(path.join(dir,'manifest.json'));assert.equal(m.previewOnly,false);assert.equal(m.frameCount,4);assert.ok(fs.existsSync(path.join(dir,m.sheet)));}const stage=read(path.join(pub,'assets/stages/storm-highland/manifest.json'));assert.equal(stage.logicalWidth,1024);assert.equal(stage.logicalHeight,576);for(const l of stage.layers)assert.ok(fs.existsSync(path.join(pub,'assets/stages/storm-highland',l.file)));});
test('selected trot originals have complete transparent margins before packing',()=>{
 const root=path.join(pub,'assets/highland-motions');
 for(const e of enemies.filter(e=>e.locomotion==='walk')){
  const recipe=read(path.join(root,e.id==='manticore'?'manticore-trot.json':'trot/'+e.id+'/recipe.json'));
  for(const [index,frame] of recipe.frames.entries()){
   const png=PNG.sync.read(fs.readFileSync(path.join(root,frame.source))),alpha=(x,y)=>png.data[(y*png.width+x)*4+3];
   let clipped=0;
   for(let x=0;x<png.width;x++)clipped+=Number(alpha(x,0)>=192)+Number(alpha(x,png.height-1)>=192);
   for(let y=1;y<png.height-1;y++)clipped+=Number(alpha(0,y)>=192)+Number(alpha(png.width-1,y)>=192);
   assert.equal(clipped,0,e.id+' frame '+(index+1)+': original touches canvas edge');
  }
 }
});
