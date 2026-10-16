'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const W=require('../public/js/skills/warrior-skills.js'),P=require('../public/js/core/forest-progression.js'),D=require('../public/js/data/forest-data.js'),S=require('../public/js/combat/forest-simulation.js'),M=require('../public/js/core/motion-playback.js');
function saveAt(lv){const save=D.freshSave();save.progression.characters.warrior.xp=P.experience(lv);return save;}
function duel(id,boss=false,rank=1){
  const run=S.createRun(1,{random:()=>.9});Object.assign(run.hero,{x:400,y:425,damage:100,crit:0,hp:1e8,maxHp:1e8,mp:100,mpRegen:0,interval:1e9,cooldown:1e9});
  run.enemies=[{...run.enemies[0],id:'target',x:520,y:425,boss,hp:1e8,maxHp:1e8,damage:0,speed:0,cooldown:1e9,special:1e9}];
  const events=[],s=W.spec(id,rank);S.startWarriorSkill(run,run.hero,s,run.enemies[0],events);return {run,s,events};
}
test('warrior learns independent actives every five levels and only dedicated upgrades need prerequisites',()=>{
  assert.deepEqual(W.ACTIVE.map(s=>s.unlockLevel),[1,...Array.from({length:20},(_,i)=>(i+1)*5)]);
  assert.equal(W.NODES.length,53);
  for(const n of W.NODES){assert.equal(n.maxRank,5);assert.equal(n.cost,1);assert.equal(n.x,100+(n.unlockLevel-1)/5*180);assert.equal(n.requires.length,n.kind==='enhancement'?1:0);}
  const save=saveAt(100);assert.equal(P.purchase(save,'warrior','skills','ultimate-enhance'),false);
  assert.equal(P.purchase(save,'warrior','skills','ultimate'),true);assert.equal(P.purchase(save,'warrior','skills','ultimate-enhance'),true);
  assert.equal(P.rank(save,'warrior','moon'),0);assert.equal(P.purchase(save,'warrior','skills','fury'),true);
});
test('each rank costs one point, caps at five, and level gates still apply with spare SP',()=>{
  const save=saveAt(10);assert.equal(P.purchase(save,'warrior','skills','return'),false);
  for(let i=1;i<=5;i++){assert.equal(P.purchase(save,'warrior','skills','moon'),true);assert.equal(P.rank(save,'warrior','moon'),i);assert.equal(P.points(save,'warrior'),10-i);}
  const before=JSON.stringify(save);assert.equal(P.purchase(save,'warrior','skills','moon'),false);assert.equal(JSON.stringify(save),before);
  P.respec(save,'warrior');assert.equal(P.points(save,'warrior'),10);assert.equal(P.stats(save,'warrior').warriorSkills.length,0);
  assert.equal(P.level(P.experience(100)),100);
});
test('ranks roundtrip; legacy builds refund; malformed ranks, orphan upgrades and overspending are rejected',()=>{
  const save=saveAt(20);for(let i=0;i<5;i++)P.purchase(save,'warrior','skills','moon');P.purchase(save,'warrior','skills','moon-enhance');P.purchase(save,'warrior','skills','flow');
  assert.deepEqual(D.readSave(JSON.stringify(save)),save);
  const old=saveAt(20);delete old.progression.characters.warrior.skillRanks;old.progression.characters.warrior.skills=['edge','evade','wide','fury'];
  const clean=D.readSave(JSON.stringify(old));assert.equal(P.points(clean,'warrior'),20);assert.deepEqual(clean.progression.characters.warrior.skills,[]);assert.deepEqual(clean.progression.characters.warrior.xp,old.progression.characters.warrior.xp);
  const dirty=saveAt(5);dirty.progression.characters.warrior.skillRanks={renjin:100,edge:100,'moon-enhance':3,ultimate:1,flow:NaN,resolve:-2};
  const valid=D.readSave(JSON.stringify(dirty));assert.equal(P.rank(valid,'warrior','renjin'),5);assert.equal(P.points(valid,'warrior'),0);assert.equal(P.rank(valid,'warrior','moon-enhance'),0);assert.equal(P.rank(valid,'warrior','ultimate'),0);
});
test('general passives scale with rank; dedicated enhancement affects only its own skill',()=>{
  const save=saveAt(100);P.purchase(save,'warrior','skills','moon');P.purchase(save,'warrior','skills','fang');const before=P.stats(save,'warrior');
  P.purchase(save,'warrior','skills','moon-enhance');const after=P.stats(save,'warrior');
  assert.ok(after.warriorSkills[0].power>before.warriorSkills[0].power);assert.ok(after.warriorSkills[0].cooldown<before.warriorSkills[0].cooldown);assert.deepEqual(after.warriorSkills[1],before.warriorSkills[1]);
  for(let i=0;i<3;i++)P.purchase(save,'warrior','skills','edge');assert.equal(P.stats(save,'warrior').baseDamage, before.baseDamage+15);
});
test('all 21 motions produce exactly their designed impact count and damage stationary bosses',()=>{
  for(const a of W.ACTIVE){const {run,s}=duel(a.id,true),events=S.update(run,s.duration+100);
    assert.equal(events.filter(e=>e.type==='warrior-impact').length,s.hits,a.id);
    assert.equal(events.filter(e=>e.type==='damage'&&e.source==='hero').length,s.hits,a.id);
    assert.equal(run.enemies[0].x,520,a.id+' boss x');assert.equal(run.enemies[0].y,425,a.id+' boss y');assert.equal(run.enemies[0].airUntil,undefined,a.id+' boss lift');
    assert.equal(run.hero.warriorCast,null,a.id);assert.equal(run.hero.invulnerable,false,a.id);
  }
});
test('launch, gathering and knockback move mobs; return attacks finish at their original feet position',()=>{
  const rise=duel('rise');S.update(rise.run,350);assert.ok(rise.run.enemies[0].airHeight>0);
  const gather=duel('sphere');gather.run.enemies.push({...gather.run.enemies[0],id:'nearby',x:630});S.update(gather.run,800);assert.ok(gather.run.enemies[1].x<630);
  const impact=duel('crater');S.update(impact.run,impact.s.duration);assert.notEqual(impact.run.enemies[0].x,520);
  for(const id of ['return','eight']){const {run,s}=duel(id);S.update(run,s.duration+20);assert.equal(run.hero.x,400);assert.equal(run.hero.y,425);}
});
test('world cross final impact is restricted to the intersection',()=>{
  const {run,s}=duel('worldcross',true);run.enemies.push({...run.enemies[0],id:'far',x:880});
  const events=S.update(run,s.duration);assert.equal(events.filter(e=>e.type==='damage'&&e.target==='target').length,3);assert.equal(events.filter(e=>e.type==='damage'&&e.target==='far').length,2);
});
test('ultimate pauses in the air for 0.3 seconds before its heavy hit and delayed rupture',()=>{
  const {run,s}=duel('ultimate');S.update(run,2100);assert.equal(run.hero.z,200);const x=run.hero.x;
  S.update(run,200);assert.equal(run.hero.z,200);assert.equal(run.hero.x,x);
  const e=S.update(run,900).filter(e=>e.type==='warrior-impact');assert.deepEqual(e.map(e=>e.kind),['impact','rupture']);
});
test('skill cooldowns are independent; casts spend MP once and unlearned skills never fire',()=>{
  const save=saveAt(10);P.purchase(save,'warrior','skills','moon');P.purchase(save,'warrior','skills','fang');
  const run=S.createRun(1,{random:()=>.9,builds:{warrior:P.stats(save,'warrior')}});Object.assign(run.hero,{x:450,y:425,mpRegen:0});
  run.enemies.forEach(e=>Object.assign(e,{x:520,y:425,hp:1e8,maxHp:1e8,damage:0,cooldown:1e9,speed:0}));
  const events=S.update(run,2200),casts=events.filter(e=>e.type==='warrior-cast');assert.deepEqual(casts.map(e=>e.skillId),['fang','moon']);assert.equal(run.hero.mp,run.hero.maxMp-25);assert.ok(run.hero.warriorCooldowns.fang>0);assert.ok(run.hero.warriorCooldowns.moon>0);
  const solo=S.createRun(1,{random:()=>.9,builds:{warrior:P.stats(D.freshSave(),'warrior')}});assert.equal(S.update(solo,3000).some(e=>e.type==='warrior-cast'),false);
});
function autoDuel(id,position,rank=1,enhance=0){
  const s=W.spec(id,rank,enhance),run=S.createRun(1,{random:()=>.9,builds:{warrior:{warriorSkills:[s]}}});
  Object.assign(run.hero,{x:400,y:425,mpRegen:0,crit:0,cooldown:1e9,interval:1e9});
  run.enemies=[{...run.enemies[0],id:'target',x:520,y:425,...position,hp:1e8,maxHp:1e8,boss:true,damage:0,speed:0,cooldown:1e9,special:1e9}];
  return {run,s};
}
test('opening melee skills approach before casting and preserve MP and cooldown while out of reach',()=>{
  for(const [id,rank,enhance] of [['moon',1,0],['moon',5,5],['cross',1,0]]){
    const s=W.spec(id,rank,enhance),{run}=autoDuel(id,{x:400+s.radius+80},rank,enhance),mp=run.hero.mp;
    assert.equal(S.update(run,100).some(e=>e.type==='warrior-cast'),false,id);
    assert.equal(run.hero.mp,mp,id);assert.equal(run.hero.warriorCooldowns[id],undefined,id);
    assert.equal(run.hero.state,'moving',id);assert.ok(run.hero.x>400,id);
    const events=S.update(run,3000),cast=events.find(e=>e.type==='warrior-cast');
    assert.ok(cast,id);assert.ok(S.distance(cast,run.enemies[0])<=s.radius,id);
    assert.ok(events.some(e=>e.type==='damage'&&e.source==='hero'&&e.skill),id);
  }
});
test('straight skills reject enemies outside their lane or beyond their actual length',()=>{
  for(const [id,position] of [['pierce',{x:580,y:500}],['earth',{x:820,y:500}],['divide',{x:520,y:334}],['pierce',{x:930,y:425}]]){
    const {run,s}=autoDuel(id,position);
    // Divide has a wider lane; put the hero at the opposite arena edge.
    if(id==='divide')run.hero.y=501;
    if(position.x===930)run.hero.x=300;
    assert.equal(W.choose(run.hero,run.enemies),null,id);
    const mp=run.hero.mp;assert.equal(S.update(run,100).some(e=>e.type==='warrior-cast'),false,id);
    assert.equal(run.hero.mp,mp,id);assert.equal(run.hero.warriorCooldowns[s.id],undefined,id);
  }
});
test('skill selection checks arc angles and can aim past an unreachable nearest enemy',()=>{
  const arc=autoDuel('moon',{x:420,y:500});assert.equal(W.choose(arc.run.hero,arc.run.enemies),null);
  const {run}=autoDuel('pierce',{x:480,y:500});
  run.enemies.push({...run.enemies[0],id:'aligned',x:600,y:425});
  const events=S.update(run,500);assert.ok(events.some(e=>e.type==='warrior-cast'&&e.skillId==='pierce'));
  assert.ok(events.some(e=>e.type==='damage'&&e.target==='aligned'&&e.source==='hero'));
  assert.equal(events.some(e=>e.type==='damage'&&e.target==='target'&&e.source==='hero'),false);
});
test('moving skills can cast beyond their stationary radius when their first strike reaches the enemy',()=>{
  for(const id of ['fang','rings','running']){
    const {run,s}=autoDuel(id,{x:400+W.spec(id).radius+50});
    const opening=S.update(run,20);assert.ok(opening.some(e=>e.type==='warrior-cast'),id);
    assert.ok(S.update(run,s.duration).some(e=>e.type==='damage'&&e.source==='hero'&&e.skill),id);
  }
});
test('renjin ranks control one through five simultaneous normal targets',()=>{
  for(let rank=1;rank<=5;rank++){const run=S.createRun(1,{random:()=>.9});Object.assign(run.hero,{x:400,y:425,normalRank:rank,cooldown:0});
    const e=run.enemies[0];run.enemies=Array.from({length:5},(_,i)=>({...e,id:'n'+i,x:510+i*10,y:425,hp:10000,damage:0,speed:0,cooldown:1e9}));
    assert.equal(S.update(run,200).filter(e=>e.type==='damage'&&e.source==='hero').length,rank);
  }
});

test('normal attack preview matches live damage and timing after speed and enhancement changes',()=>{
  for(const [attackSpeed,enhance] of [[1,0],[1.5,5]]){
    const make=()=>{const run=S.createRun(1,{random:()=>.9});Object.assign(run.hero,{x:400,y:425,damage:100,crit:0,attackSpeed,normalRank:3,normalEnhance:enhance,cooldown:1e9,interval:1e9});const e=run.enemies[0];run.enemies=Array.from({length:3},(_,i)=>({...e,id:'n'+i,x:510+i*10,y:425,hp:1e8,maxHp:1e8,damage:0,speed:0,cooldown:1e9}));return run;};
    const live=make(),review=make(),s=W.spec('renjin',3,enhance,{attackSpeed});
    Object.assign(live.hero,{state:'attacking',motion:'attack-overhead',time:0,hit:false});
    S.startWarriorSkill(review,review.hero,s,review.enemies[0],[]);
    const damage=run=>S.update(run,s.duration+100).filter(e=>e.type==='damage'&&e.source==='hero').map(e=>({target:e.target,amount:e.amount,timeMs:e.timeMs}));
    assert.deepEqual(damage(review),damage(live));
  }
});
test('movement and multi-hit combat remain deterministic across render frame durations',()=>{
  for(const id of ['rise','six','ultimate']){const a=duel(id),b=duel(id);const total=Math.ceil(a.s.duration/25)*25;
    const ea=S.update(a.run,total);let eb=[];for(let t=0;t<total;t+=25)eb.push(...S.update(b.run,25));assert.deepEqual(ea,eb,id);assert.deepEqual(a.run.hero,b.run.hero,id);assert.deepEqual(a.run.enemies,b.run.enemies,id);
  }
});
test('packaged icons, effect frames and reused warrior sprites exist and support frame stepping',()=>{
  for(const a of W.ACTIVE)assert.ok(fs.existsSync(path.join(__dirname,'../public',a.icon)),a.id);
  for(const kind of ['slash','ring','impact','fissure','cross','rupture']){const directory=path.join(__dirname,'../public/assets/skills/warrior/effects',kind),m=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json')));assert.deepEqual([0,100,200,300].map(t=>M.frameAt(m,t)),[0,1,2,3]);assert.ok(fs.existsSync(path.join(directory,m.sheet)));}
});
test('generated PNGs retain real transparency, clear margins and exact effect sheet packing',()=>{
  const {PNG}=require('pngjs'),read=f=>PNG.sync.read(fs.readFileSync(f));
  const margin=(png,label)=>{let visible=0;for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){const a=png.data[(y*png.width+x)*4+3];if(a)visible++;if(x<5||y<5||x>=png.width-5||y>=png.height-5)assert.equal(a,0,label+' clear margin');}assert.ok(visible>100,label);};
  for(const s of W.ACTIVE)margin(read(path.join(__dirname,'../public',s.icon)),s.id);
  for(const id of ['slash','ring','impact','fissure','cross','rupture']){const base=path.join(__dirname,'../public/assets/skills/warrior/effects',id),sheet=read(path.join(base,id+'.png'));
    for(let i=0;i<4;i++){const frame=read(path.join(base,'frame-'+(i+1)+'.png'));margin(frame,id+'/'+i);for(let y=0;y<256;y++)assert.deepEqual(frame.data.subarray(y*256*4,(y+1)*256*4),sheet.data.subarray((y*1024+i*256)*4,(y*1024+(i+1)*256)*4));}
  }
});
