'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths,{PNG}=require('pngjs');
const M=require('../public/js/skills/mage-skills.js'),P=require('../public/js/core/forest-progression.js'),D=require('../public/js/data/forest-data.js'),S=require('../public/js/combat/forest-simulation.js');
function saveAt(lv){const save=D.freshSave();D.award(save,4);save.progression.characters.mage.xp=P.experience(lv);return save;}
function duel(id,boss=false,rank=1,stats={}){
  const s=M.spec(id,rank,0,stats),run=S.createRun(4,{random:()=>.9,builds:{mage:{...P.stats(saveAt(100),'mage'),...stats,damage:100,crit:0,interval:1e9,mpRegen:0,mageSkills:[]}}});run.hero.hp=0;
  const mage=run.allies[0];Object.assign(mage,{x:250,y:425,hp:1e8,maxHp:1e8,mp:1000,maxMp:1000,cooldown:1e9});
  run.enemies=[{...run.enemies[0],id:'target',x:500,y:425,boss,hp:1e8,maxHp:1e8,damage:0,speed:0,cooldown:1e9,special:1e9}];
  const events=[];S.startMageSkill(run,mage,s,run.enemies[0],events);return {run,mage,s,events};
}
test('21 independent spells, dedicated upgrades and common passives share warrior level and point rules',()=>{
  assert.deepEqual(M.ACTIVE.map(s=>s.unlockLevel),[1,...Array.from({length:20},(_,i)=>(i+1)*5)]);assert.equal(M.NODES.length,53);
  const save=saveAt(100);assert.equal(P.points(save,'mage'),100);
  assert.equal(P.purchase(save,'mage','skills','cosmos-enhance'),false);assert.equal(P.purchase(save,'mage','skills','cosmos'),true);assert.equal(P.purchase(save,'mage','skills','cosmos-enhance'),true);
  for(let i=0;i<5;i++)assert.equal(P.purchase(save,'mage','skills','wind'),true);assert.equal(P.purchase(save,'mage','skills','wind'),false);
  assert.equal(P.rank(save,'mage','ice'),0);assert.equal(P.purchase(saveAt(14),'mage','skills','ice'),false);
  const restored=D.readSave(JSON.stringify(save));assert.equal(P.rank(restored,'mage','cosmos-enhance'),1);assert.equal(P.rank(restored,'mage','wind'),5);
  P.respec(save,'mage');assert.equal(P.points(save,'mage'),100);assert.equal(P.stats(save,'mage').mageSkills.length,0);assert.equal(P.stats(save,'mage').mageNormal.rank,1);
});
test('rank maps are authoritative and preserve XP, equipment and recruitment',()=>{
  const save=saveAt(70);delete save.progression.mageSkillVersion;save.progression.characters.mage.skills=['arcane','vortex','ward'];save.progression.characters.mage.skillRanks={vortex:3};
  const clean=D.readSave(JSON.stringify(save));assert.equal(P.level(clean.progression.characters.mage.xp),70);assert.equal(P.unlocked(clean,'mage'),true);assert.equal(P.points(clean,'mage'),67);assert.deepEqual(clean.progression.characters.mage.skills,['vortex']);
});
test('all spells remain stationary, chant before release, maintain the matching staff loop and hit exactly once per scheduled strike',()=>{
  for(const skill of M.ACTIVE){const {run,mage,s}=duel(skill.id,true);const c=mage.mageCast;
    assert.equal(M.sample(c,0).motion,'chant');assert.equal(M.sample(c,s.chant+.1).motion,'cast-'+s.cast);assert.equal(M.sample(c,s.release).motion,'cast-'+s.cast+'-hold');assert.equal(M.sample(c,s.release+s.hold+.1).phase,'復帰');
    assert.equal(S.update(run,s.release-1).some(e=>e.type==='damage'),false,skill.id);
    const events=S.update(run,s.duration+S.STEP),hits=events.filter(e=>e.type==='damage');
    assert.equal(hits.length,s.pattern==='chain'?1:s.hits,skill.id);assert.ok(hits.every(e=>e.timeMs>=s.release));
    assert.equal(mage.x,250);assert.equal(mage.y,425);assert.equal(mage.mp,1000-s.mp);assert.equal(mage.mageCast,null);assert.equal(mage.motion,'idle');
    assert.equal(S.update(run,500).some(e=>e.type==='damage'),false,skill.id);
  }
});
test('wind ranks expand angle and range while spear pierces only its actual strip',()=>{
  const o={x:200,y:400},t={id:'aim',x:500,y:400},actors=[{id:'front',x:500,y:400,hp:100},{id:'wide',x:520,y:580,hp:100},{id:'far',x:740,y:400,hp:100},{id:'behind',x:100,y:400,hp:100}];
  assert.deepEqual(M.targets(M.begin(M.spec('wind',1),o,t),actors).map(e=>e.id),['front']);
  assert.deepEqual(M.targets(M.begin(M.spec('wind',5),o,t),actors).map(e=>e.id),['front','wide','far']);
  assert.deepEqual(M.targets(M.begin(M.spec('ice'),o,t),actors).map(e=>e.id),['front','far']);
  const s=M.spec('wind',5);assert.match(M.parameters(s),/角度 95°/);assert.match(M.parameters(s),/射程 570/);
});
test('lightning chain traverses neighbors, respects distance and never repeats an enemy',()=>{
  const {run,mage,s}=duel('chain');const base=run.enemies[0];run.enemies.push(...[100,200,440].map((d,i)=>({...base,id:'next-'+i,x:base.x+d})));
  const events=S.update(run,s.duration+S.STEP),hits=events.filter(e=>e.type==='damage');assert.deepEqual(hits.map(e=>e.target),['target','next-0','next-1']);assert.equal(new Set(hits.map(e=>e.target)).size,hits.length);assert.equal(mage.mp,1000-s.mp);
  const chainEvents=events.filter(e=>e.type==='mage-impact');assert.equal(chainEvents[1].from.x,500);assert.equal(chainEvents[2].from.x,600);
});
test('fireball splashes at the tracked impact, frost and vortex control mobs while bosses remain fixed',()=>{
  const fire=duel('fireball');fire.run.enemies.push({...fire.run.enemies[0],id:'near',x:540},{...fire.run.enemies[0],id:'outside',x:800});
  assert.deepEqual(S.update(fire.run,fire.s.duration+S.STEP).filter(e=>e.type==='damage').map(e=>e.target),['target','near']);
  for(const boss of [false,true]){const {run,s}=duel('vortex',boss);run.enemies.push({...run.enemies[0],id:'other',x:640});S.update(run,s.duration+S.STEP);assert.equal(run.enemies[1].x<640,!boss);if(boss)assert.equal(run.enemies[1].airUntil,undefined);}
});
test('casting upgrades are isolated, speed and cooldown modifiers affect the intended parameters',()=>{
  const save=saveAt(100);P.purchase(save,'mage','skills','focus');P.purchase(save,'mage','skills','wind');P.purchase(save,'mage','skills','ice');P.purchase(save,'mage','skills','wind-enhance');
  const stats=P.stats(save,'mage');assert.ok(stats.mageSkills.find(s=>s.id==='wind').power>M.spec('wind').power);assert.equal(stats.mageSkills.find(s=>s.id==='ice').power,M.spec('ice').power);
  assert.ok(stats.mageSkills.every(s=>s.chant<M.spec(s.id).chant));assert.equal(M.spec('beam',1,0,{attackSpeed:2}).duration,M.spec('beam').duration/2);
  assert.equal(M.spec('beam',1,0,{haste:.25,cooldownPenalty:.1}).cooldown,19000*1.1/1.25);
});
test('MP and cooldowns gate actives independently; normal magic remains available without MP',()=>{
  const {run,mage}=duel('bolt');mage.mageCast=null;mage.state='idle';mage.cooldown=0;mage.mp=11;mage.mageSkills=[M.spec('wind')];
  let events=S.update(run,1000);assert.ok(events.some(e=>e.type==='mage-cast'&&e.skillId==='bolt'));assert.equal(events.some(e=>e.type==='mage-cast'&&e.skillId==='wind'),false);
  mage.mageCast=null;mage.state='idle';mage.mp=30;events=S.update(run,S.STEP);assert.equal(events[0].skillId,'wind');assert.equal(mage.mp,18);assert.ok(mage.mageCooldowns.wind>0);
  assert.equal(S.startMageSkill(run,mage,M.spec('wind'),run.enemies[0],[]),false);assert.equal(mage.mp,18);
});
test('auto casting values a short spear against one enemy and an ultimate against a crowded field',()=>{
  const mage={x:200,y:400,mp:1000,mageCooldowns:{},mageSkills:[M.spec('ice'),M.spec('cosmos')]};
  const enemies=[{id:'one',x:500,y:400,hp:100}];assert.equal(M.choose(mage,enemies).spec.id,'ice');
  for(let i=0;i<8;i++)enemies.push({id:'wide-'+i,x:500+i*35,y:400+(i%2?70:-70),hp:100});assert.equal(M.choose(mage,enemies).spec.id,'cosmos');
});
test('dead tracking target cancels impact, caster death clears the cast, and frame rates produce identical outcomes',()=>{
  const a=duel('meteor'),b=duel('meteor');S.update(a.run,5000);for(let i=0;i<200;i++)S.update(b.run,25);assert.deepEqual(a.run.allies,b.run.allies);assert.deepEqual(a.run.enemies,b.run.enemies);
  const {run,mage,s}=duel('bolt');S.update(run,s.release+S.STEP);run.enemies.push({...run.enemies[0],id:'other',x:600});run.enemies[0].hp=0;assert.equal(S.update(run,s.duration).some(e=>e.type==='damage'),false);assert.equal(run.enemies[1].hp,1e8);
  // A real enemy hit kills a chanting caster; pending magic must not remain active.
  const dead=duel('cosmos');dead.mage.hp=1;const enemy=dead.run.enemies[0];Object.assign(enemy,{type:'slime',x:dead.mage.x,damage:100,state:'attacking',attackImpact:0,attackDuration:100});S.update(dead.run,S.STEP);assert.equal(dead.mage.hp,0);assert.equal(dead.mage.mageCast,null);
});
test('21 generated icons and 15 four-frame effects retain transparency, margins and exact sheet packing',()=>{
  const base=path.resolve(__dirname,'../public/assets/skills/mage');for(const s of M.ACTIVE){const icon=PNG.sync.read(fs.readFileSync(path.join(base,'icons',s.id+'.png')));assert.equal(icon.width,96);assert.equal(icon.height,96);assert.ok(icon.data.some((v,i)=>i%4===3&&v===0));}
  for(const kind of ['arcane','arcane-impact','fire','fire-impact','ice','ice-impact','lightning','earth','meteor','cosmos','four','circle','cloud','wind','wind-impact']){
    const dir=path.join(base,'effects',kind),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),sheet=PNG.sync.read(fs.readFileSync(path.join(dir,m.sheet))),hashes=new Set();
    assert.equal(m.frames.length,4);assert.equal(m.durationMs,440);assert.deepEqual(m.frameSequence,[0,1,2,3]);
    for(const f of m.frames){const p=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));hashes.add(require('node:crypto').createHash('sha256').update(p.data).digest('hex'));let visible=0;
      for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,j=(y*sheet.width+x+f.x)*4;assert.equal(p.data[i+3],sheet.data[j+3]);if(p.data[i+3])visible++;if(x<16||x>=240||y<16||y>=240)assert.equal(p.data[i+3],0);}
      assert.ok(visible>100&&visible<50000);
    }assert.equal(hashes.size,4,kind);
  }
});
