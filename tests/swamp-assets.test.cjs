'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const modules=[__dirname,path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')];
const {PNG}=require(require.resolve('pngjs',{paths:modules})),sharp=require(require.resolve('sharp',{paths:modules}));
const S=require('../tools/assets/swamp-specs.cjs'),C=require('../public/js/combat/swamp-combat.js'),P=require('../public/js/core/motion-playback.js');
const root=path.resolve(__dirname,'../public/assets'),read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
test('all seven swamp enemies expose common and requested special motions with complete sources',async()=>{
  const catalog=read(path.join(root,'enemies/index.json'));let poses=0,motions=0;
  for(const enemy of S.enemies){
    const entry=catalog.find(e=>e.id===enemy.id);assert.ok(entry,enemy.id);assert.equal(entry.region,'poison-swamp');
    const dir=path.join(root,'enemies',enemy.id,'motions'),index=read(path.join(dir,'index.json'));
    assert.deepEqual(index.map(m=>m.id),['idle','move','hit','down',...Object.keys(enemy.actions)]);
    const idle=read(path.join(dir,'idle/manifest.json'));
    for(const motion of index){const base=path.join(dir,motion.id),m=read(path.join(base,'manifest.json'));motions++;poses+=m.frameCount;
      assert.equal(m.enemy,enemy.id);assert.equal(m.facing,'left');assert.deepEqual(m.pivot,idle.pivot);
      assert.equal(m.frameCount,enemy.id==='skeleton'&&motion.id==='move'?6:4);
      assert.equal(m.durationMs,m.frames.reduce((n,f)=>n+f.durationMs,0));
      for(const source of [m.source,m.originalSource,m.prompt])assert.ok(fs.existsSync(path.resolve(base,source)),source);
      if(enemy.id==='hydra'&&['idle','move','hit'].includes(motion.id)){assert.ok(m.anatomyRevision);assert.ok(fs.existsSync(path.resolve(base,m.anatomyRevision.prompt)));assert.ok(fs.existsSync(path.resolve(base,m.anatomyRevision.previousSource)));assert.match(m.originalSource,/generated-v[23]\.png$/);}
      const sheet=PNG.sync.read(fs.readFileSync(path.join(base,m.sheet)));assert.equal(sheet.width,m.width);assert.equal(sheet.height,m.height);
      const visiblePixels=[];
      for(const frame of m.frames){const image=PNG.sync.read(fs.readFileSync(path.join(base,frame.file)));let occupied=0;for(let a=3;a<image.data.length;a+=4)if(image.data[a]>=192)occupied++;visiblePixels.push(occupied);
        assert.equal(image.width,m.frameWidth);assert.equal(image.height,m.frameHeight);
        assert.ok(frame.bounds.left>0&&frame.bounds.top>0&&frame.bounds.right<image.width-1&&frame.bounds.bottom<image.height-1,enemy.id+'/'+motion.id+'/'+frame.index);
        for(let y=0;y<image.height;y++){assert.equal(image.data[y*image.width*4+3],0);assert.equal(image.data[(y*image.width+image.width-1)*4+3],0);
          assert.deepEqual(image.data.subarray(y*image.width*4,(y+1)*image.width*4),sheet.data.subarray((y*sheet.width+frame.x)*4,(y*sheet.width+frame.x+image.width)*4));}
        for(let x=0;x<image.width;x++){assert.equal(image.data[x*4+3],0);assert.equal(image.data[((image.height-1)*image.width+x)*4+3],0);}
      }
      if(enemy.id==='hydra'&&['idle','move','hit'].includes(motion.id)){assert.ok(Math.min(...visiblePixels)>Math.max(...visiblePixels)*.6,'Hydra poses must contain one consistently sized body: '+motion.id);for(const f of m.frames)assert.ok(f.bounds.bottom-f.bounds.top>250,'Hydra full body is missing: '+motion.id+'/'+f.index);}
      const gif=await sharp(path.join(base,m.preview),{animated:true}).metadata();assert.equal(gif.pages,m.frameCount);assert.equal(gif.pageHeight,m.frameHeight*2);assert.deepEqual(gif.delay,m.frames.map(f=>f.durationMs));assert.equal(gif.loop,m.loop?0:1);
      if(motion.id==='down'){assert.equal(m.terminal,true);assert.equal(P.sample(m,idle,100000).motion,'down');assert.equal(P.sample(m,idle,100000).frame,3);}
      else if(!m.loop){assert.equal(P.sample(m,idle,m.durationMs).motion,'idle');assert.deepEqual(PNG.sync.read(fs.readFileSync(path.join(base,m.frames.at(-1).file))).data,PNG.sync.read(fs.readFileSync(path.join(dir,'idle',idle.frames[0].file))).data);}
      if(m.effectPreview)for(const effect of m.effectPreview.assets)assert.ok(fs.existsSync(path.resolve(base,effect.manifest)));
    }
  }
  assert.equal(motions,43);assert.equal(poses,174);
});
test('skeleton gait records both three-frame halves and frog hops have airborne frames',()=>{
  const gait=read(path.join(root,'enemies/skeleton/motions/move/manifest.json'));assert.equal(gait.frameCount,6);assert.equal(gait.walkCycle.nearLeg,'left');assert.equal(gait.walkCycle.farLeg,'right');
  assert.deepEqual(gait.walkCycle.phases,['left-contact','right-passing','right-approach','right-contact','left-passing','left-approach']);
  for(const source of gait.walkCycle.parts)assert.ok(fs.existsSync(path.resolve(root,'enemies/skeleton/motions/move',source)));
  for(const source of gait.walkCycle.singlePoseSources)assert.ok(fs.existsSync(path.resolve(root,'enemies/skeleton/motions/move',source)));
  for(const enemy of ['giga-toad','king-toad']){const m=read(path.join(root,'enemies',enemy,'motions/move/manifest.json'));assert.equal(m.loop,true);assert.equal(m.frames[0].bounds.bottom,m.pivot.y);assert.equal(m.frames[2].bounds.bottom,m.pivot.y-42);assert.equal(m.frames[3].bounds.bottom,m.pivot.y);}
});
test('nine transparent animated effects are catalogued, downloadable and use complete source provenance',async()=>{
  const catalog=read(path.join(root,'effects/index.json'));for(const effect of S.effects){
    assert.ok(catalog.some(f=>f.id===effect.id));const base=path.join(root,'effects',effect.id),m=read(path.join(base,'manifest.json'));
    assert.equal(m.frameCount,4);assert.equal(m.facing,'left');for(const source of [m.source,m.prompt])assert.ok(fs.existsSync(path.resolve(base,source)));
    for(const f of m.frames){const p=PNG.sync.read(fs.readFileSync(path.join(base,f.file)));assert.ok(f.bounds.left>0&&f.bounds.top>0&&f.bounds.right<p.width-1&&f.bounds.bottom<p.height-1);assert.equal(p.data[3],0);}
    const gif=await sharp(path.join(base,m.preview),{animated:true}).metadata();assert.equal(gif.pages,4);assert.deepEqual(gif.delay,m.frames.map(f=>f.durationMs));
  }
});
test('battle release times agree with actual sprite frame boundaries',()=>{
  for(const enemy of S.enemies)for(const count of [1,2])for(const part of C.sequence(enemy.id,count)){
    const m=read(path.join(root,'enemies',enemy.id,'motions',part.motion,'manifest.json'));
    assert.equal(part.duration%m.durationMs,0,enemy.id+'/'+part.motion);
    for(const event of part.events)assert.ok(m.events.some(e=>e.timeMs===event.at%m.durationMs),enemy.id+'/'+part.motion+'/'+event.at);
  }
});
