'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),L=require('../public/js/core/museum-library.js');
const {build}=require('../tools/assets/build-museum.cjs'),catalog=require('../public/assets/museum/index.json');
const root=path.resolve(__dirname,'../public');
test('all adopted allies, skills and enemies have current museum entries and valid runtime assets',()=>{
  assert.deepEqual(catalog,build());
  assert.equal(catalog.owners.length,Object.keys(P.CHARACTERS).length+Object.keys(D.ALL_ENEMIES).length);
  for(const owner of catalog.owners) {
    assert.ok(fs.existsSync(path.join(root,owner.image)));
    assert.equal(new Set(owner.clips.map(c=>c.id)).size,owner.clips.length);
    if(owner.side==='ally')assert.deepEqual(owner.clips.filter(c=>c.kind==='skill').map(c=>c.skillId),P.SKILLS[owner.id].filter(n=>['normal','active'].includes(n.kind)).map(n=>n.id));
    else assert.equal(owner.firstStage,D.ALL_STAGES.find(s=>s.waves.flat().includes(owner.id)).id);
    for(const clip of owner.clips) {
      assert.ok(clip.assets.length,owner.id+' '+clip.id);
      for(const a of clip.assets) {
        if(a.procedural){assert.ok(['gate','rift'].includes(a.procedural));continue;}
        if(a.image){assert.ok(fs.existsSync(path.join(root,a.image)));continue;}
        assert.ok(a.manifest.startsWith('/assets/'));
        const file=path.join(root,a.manifest),m=JSON.parse(fs.readFileSync(file,'utf8'));
        assert.ok(fs.existsSync(path.resolve(path.dirname(file),m.sheet)),a.manifest);
        assert.ok(m.frames.length>0&&m.durationMs>0);
        for(const i of L.sequence(m))assert.ok(m.frames[i]);
      }
    }
  }
});
test('enemy body motions and separately registered effect images are classified by their contents',()=>{
  const goddess=catalog.owners.find(o=>o.id==='extradimensional-goddess');
  assert.deepEqual(goddess.clips.filter(c=>c.kind==='motion').map(c=>c.id),['idle','shot','snap','floating','cast','ultimate','down']);
  assert.deepEqual(goddess.clips.filter(c=>c.kind==='effect').map(c=>c.id),['return','throne','halo','star-impact','snap-glint','homing-meteor','meteor-impact','rift-cut','celestial-wave']);
  for(const owner of catalog.owners.filter(o=>o.side==='enemy'&&!D.ALL_ENEMIES[o.id].dimensionalGate)) {
    const index=JSON.parse(fs.readFileSync(path.join(root,'assets/enemies',owner.id,'motions/index.json'),'utf8'));
    for(const entry of index)assert.equal(owner.clips.find(c=>c.id===entry.id).kind,entry.kind||'motion',owner.id+' '+entry.id);
  }
});
test('ally motions need recruitment; skill effects unlock at level without spending skill points',()=>{
  const save=D.freshSave();
  for(const owner of catalog.owners.filter(o=>o.side==='ally')) {
    const state=save.progression.characters[owner.id];state.xp=P.experience(100,0);
    assert.equal(L.unlocked(save,owner,owner.clips[0]),owner.id==='warrior');
    if(owner.id!=='warrior')save.cleared.push(P.CHARACTERS[owner.id].unlock);
    assert.equal(L.unlocked(save,owner,owner.clips[0]),true);
    for(const c of owner.clips.filter(c=>c.kind==='skill')) {
      const rank=P.rank(save,owner.id,c.skillId);
      if(c.unlockLevel>1){state.xp=P.experience(c.unlockLevel-1,.999);assert.equal(L.unlocked(save,owner,c),false);}
      state.xp=P.experience(c.unlockLevel,0);assert.equal(L.unlocked(save,owner,c),true);
      assert.equal(P.rank(save,owner.id,c.skillId),rank);
    }
  }
});
test('enemy effects and motions require an encounter, with stage-clear fallback for older saves',()=>{
  for(const owner of catalog.owners.filter(o=>o.side==='enemy')) {
    const save=D.freshSave();
    for(const c of owner.clips)assert.equal(L.unlocked(save,owner,c),false,owner.id);
    D.recordEncounters(save,[owner.id]);
    for(const c of owner.clips)assert.equal(L.unlocked(save,owner,c),true,owner.id);
    save.encounteredEnemies=[];
    save.cleared.push(owner.firstStage);
    for(const c of owner.clips)assert.equal(L.unlocked(save,owner,c),true,owner.id);
  }
});
test('restored saves retain unlocks and browsing never changes progression or inventory',()=>{
  const seed=D.freshSave();seed.cleared=[1,2,4,10,20,30,40,71,72,'dimensional-gate'];seed.progression.characters.mage.xp=P.experience(25,0);
  const save=D.readSave(JSON.stringify(seed)),before=JSON.stringify(save);
  const statuses=catalog.owners.flatMap(o=>o.clips.map(c=>L.unlocked(save,o,c)));
  assert.ok(statuses.some(Boolean)&&statuses.some(x=>!x));
  assert.equal(JSON.stringify(save),before);
  const restored=D.readSave(JSON.stringify(save));
  assert.deepEqual(catalog.owners.flatMap(o=>o.clips.map(c=>L.unlocked(restored,o,c))),statuses);
});
test('frame stepping respects variable durations, sequence order, reverse and loop boundaries',()=>{
  const model={frameSequence:[0,2,1,2],frames:[{durationMs:100},{durationMs:200},{durationMs:50}],durationMs:400};
  assert.deepEqual([0,99,100,149,150,349,350,399,400].map(t=>L.positionAt(model,t)),[0,0,1,1,2,2,3,3,3]);
  assert.equal(L.step(model,0,-1),350);assert.equal(L.step(model,350,1),0);
  assert.equal(L.step(model,170,1),350);assert.equal(L.step(model,110,-1),0);
  assert.deepEqual([0,1,2,3].map(p=>L.timeAt(model,p)),[0,100,150,350]);
});
