'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {PNG}=require(require.resolve('pngjs',{paths:[__dirname,bundled]})),sharp=require(require.resolve('sharp',{paths:[__dirname,bundled]}));
const {enemies,effects,materials,timing}=require('../tools/assets/expansion-specs.cjs'),X=require('../public/js/combat/expansion-combat.js'),root=path.resolve(__dirname,'../public');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
test('troll excavation registers feet rather than grit and keeps its body at idle size',()=>{
  const base=path.join(root,'assets/enemies/cave-troll/motions');
  const m=read(path.join(base,'excavate/manifest.json')),idle=read(path.join(base,'idle/manifest.json'));
  const source=PNG.sync.read(fs.readFileSync(path.resolve(base,'excavate',m.source)));
  const f=m.frames[0],cell=f.sourceCell;
  let top=cell.height;
  for(let y=0;y<cell.height;y++)for(let x=cell.width*.4|0;x<cell.width;x++)if(source.data[((cell.y+y)*source.width+cell.x+x)*4+3]>=192)top=Math.min(top,y);
  const bodyHeight=(f.sourceAnchor.y-top+1)*m.sourceScale;
  const idleHeight=idle.frames[0].bounds.bottom-idle.frames[0].bounds.top+1;
  assert.ok(Math.abs(bodyHeight-idleHeight)<=3,JSON.stringify({bodyHeight,idleHeight}));
  assert.deepEqual(m.frames.map(f=>f.sourceAnchor),[{x:645,y:407},{x:611,y:422},{x:645,y:486},{x:526,y:456}]);
  assert.ok(f.bounds.bottom>m.pivot.y,'Grit below the feet stays visible without changing the ground anchor');
});
async function inspect(dir){const m=read(path.join(dir,'manifest.json')),sheet=PNG.sync.read(fs.readFileSync(path.join(dir,m.sheet)));assert.equal(sheet.width,m.frameWidth*m.frameCount);assert.equal(sheet.height,m.frameHeight);assert.equal(m.durationMs,m.frames.reduce((n,f)=>n+f.durationMs,0));assert.ok(fs.existsSync(path.resolve(dir,m.prompt)));assert.ok(fs.existsSync(path.resolve(dir,m.source)));
  for(const f of m.frames){const img=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));assert.equal(img.width,m.frameWidth);assert.equal(img.height,m.frameHeight);assert.ok(f.bounds.left>0&&f.bounds.top>0&&f.bounds.right<img.width-1&&f.bounds.bottom<img.height-1);assert.equal(img.data[3],0);assert.ok(img.data.some((v,i)=>i%4===3&&v>192));for(let y=0;y<img.height;y++)assert.deepEqual(img.data.subarray(y*img.width*4,(y+1)*img.width*4),sheet.data.subarray((y*sheet.width+f.x)*4,(y*sheet.width+f.x+img.width)*4));}
  const gif=await sharp(path.join(dir,m.preview),{animated:true}).metadata();assert.equal(gif.pages,m.frameCount);assert.deepEqual(gif.delay,m.frames.map(f=>f.durationMs));return m;
}
test('14 enemies have all common and requested action motions, genuine alpha, packed sheets and GIF timing',async()=>{
  const catalog=read(path.join(root,'assets/enemies/index.json'));for(const e of enemies){const base=path.join(root,'assets/enemies',e.id),defs=read(path.join(base,'motions/index.json'));assert.ok(catalog.some(c=>c.id===e.id));assert.deepEqual(defs.map(m=>m.id),['idle','move','hit','down',...Object.keys(e.actions)]);assert.ok(fs.existsSync(path.join(base,'source/idle-generated.png')));assert.ok(fs.existsSync(path.join(root,'assets/ui/enemies',e.id+'.png')));
    for(const d of defs){const m=await inspect(path.join(base,'motions',d.id));assert.equal(m.enemy,e.id);assert.equal(m.motion,d.id);assert.equal(m.artworkReuse,undefined);if(d.id==='move')assert.equal(m.frameCount,e.locomotion==='walk'?6:4);if(d.id==='down'){assert.equal(m.endBehavior,'hold');assert.equal(m.transitions.to,null);}if(!['idle','move','hit','down'].includes(d.id)){assert.equal(m.durationMs,X.DURATIONS[d.id],e.id+'/'+d.id);assert.deepEqual(m.originalSources.map(p=>path.resolve(path.join(base,'motions',d.id),p)),[path.join(base,'source',d.id+'-generated.png')]);}}
  }
});
test('16 separate generated effects include the attackable tail/tentacle and status overlays',async()=>{const catalog=read(path.join(root,'assets/effects/index.json'));for(const e of effects){assert.ok(catalog.some(c=>c.id===e.id));const m=await inspect(path.join(root,'assets/effects',e.id));assert.equal(m.effect,e.id);assert.equal(m.loop,!!e.loop);assert.equal(m.frameCount,4);}});
test('cave has one enclosed layer; coast has distant ocean plus transparent ground, with unchanged battle lane',()=>{
  for(const id of ['echo-cave','sunlit-coast']){const dir=path.join(root,'assets/stages',id),m=read(path.join(dir,'manifest.json'));assert.equal(m.layers.length,id==='echo-cave'?1:2);assert.deepEqual(m.coordinateSystem.groundY,{min:323,max:512});for(const l of m.layers){const image=PNG.sync.read(fs.readFileSync(path.join(dir,l.file)));assert.equal(image.width,l.width);assert.equal(image.height,l.height);assert.ok(image.width/image.height>1.7&&image.width/image.height<1.85);if(l.alpha)assert.ok(image.data.subarray(0,image.width*80*4).every((v,i)=>i%4!==3||v===0));else assert.ok(image.data.every((v,i)=>i%4!==3||v===255));}}
});
test('ten region loot icons are transparent 128px images with their own generated sources',()=>{const provenance=read(path.join(root,'assets/ui/expansion/provenance.json'));for(const [id]of materials){const file=path.join(root,'assets/ui/items',id+'.png'),image=PNG.sync.read(fs.readFileSync(file));assert.equal(image.width,128);assert.equal(image.height,128);assert.equal(image.data[3],0);assert.equal(provenance[id].dedicatedGenerationPending,false);assert.equal(path.join(root,provenance[id].source),path.join(root,'assets/ui/expansion/source',id+'-generated.png'));assert.ok(fs.existsSync(path.join(root,provenance[id].source)));}});
