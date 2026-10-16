'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const N=require('../public/js/skills/ninja-skills.js'),K=require('../public/js/combat/ninja-combat.js'),C=require('../public/js/combat/enemy-control.js'),D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),S=require('../public/js/combat/forest-simulation.js');
function encounter({count=1,boss=false,flying=false,speed=1,left=false}={}){
 const run=S.createRun(21,{random:()=>.5,builds:{ninja:{...P.CHARACTERS.ninja.base,maxHp:1e6,maxMp:140,mpRegen:0,damage:100,crit:0,attackSpeed:speed,interval:800/speed,speed:0,manualOnly:true}}});
 Object.assign(run.hero,{hp:1e6,maxHp:1e6,damage:0,speed:0,cooldown:1e9,skill:1e9,x:90,y:334});
 const actor=run.allies[0];Object.assign(actor,{x:left?780:240,y:438,cooldown:1e9});
 const prototype=run.enemies[0];run.enemies=Array.from({length:count},(_,i)=>({...prototype,id:'target-'+i,type:'cave-worm',hp:1e6,maxHp:1e6,damage:0,speed:0,boss,majorBoss:false,flying,collisionRadius:30,x:actor.x+(left?-1:1)*(230+i*20),y:438,cooldown:1e9,expansionPlan:null}));
 return {run,actor,target:run.enemies[0]};
}
function cast(f,id,rank=1,speed=1){const spec=N.spec(id,rank,0,{attackSpeed:speed}),events=[];assert.equal(S.startNinjaSkill(f.run,f.actor,spec,f.target,events,true),true,id);return {spec,events};}
const hits=events=>events.filter(e=>e.type==='damage'&&e.source==='ninja');
test('swamp10 recruits only after reward, with Lv20/0%, 20SP and 20 mains per slot; migration preserves trained ninja',()=>{
 const save=D.freshSave();D.award(save,19);assert.equal(P.unlocked(save,'ninja'),false);assert.equal(S.createRun(20).allies.some(a=>a.type==='ninja'),false);
 assert.equal(D.award(save,20).recruited,'ninja');P.gainXp(save,20);const c=save.progression.characters.ninja;assert.deepEqual(c.xp,P.experience(20));assert.equal(P.points(save,'ninja'),20);
 for(const slot of ['weapon','armor'])assert.deepEqual(c[slot],P.allGearTrees('ninja',slot).filter(n=>n.main&&n.stage<=20).map(n=>n.id));
 assert.equal(P.stats(save,'ninja').maxMp,140);assert.equal(P.stats(save,'ninja').mpRegen,4);
 for(const s of N.ACTIVE.slice(1,5))for(let i=0;i<5;i++)assert.equal(P.purchase(save,'ninja','skills',s.id),true);assert.equal(P.points(save,'ninja'),0);
 c.xp={level:31,progress:.25};const trained=structuredClone(c);D.award(save,20);assert.deepEqual(c,trained);assert.deepEqual(D.readSave(JSON.stringify(save)).progression.characters.ninja,trained);
 const old=structuredClone(save);delete old.progression.characters.ninja;const migrated=D.readSave(JSON.stringify(old));assert.deepEqual(migrated.progression.characters.ninja.xp,P.experience(20));assert.equal(migrated.progression.characters.ninja.weapon.length,20);
 P.respec(save,'ninja');assert.equal(P.points(save,'ninja'),31);assert.deepEqual(c.xp,trained.xp);assert.deepEqual(c.weapon,trained.weapon);
});
test('20 independent actives interpolate counts, distribute budgets and keep world clocks independent of attack speed',()=>{
 assert.equal(N.ACTIVE.length,21);assert.deepEqual(N.ACTIVE.slice(1).map(s=>s.unlockLevel),Array.from({length:20},(_,i)=>(i+1)*5));
 for(const row of N.ACTIVE){assert.deepEqual(row.requires,[]);for(let r=1;r<=5;r++){const s=N.spec(row.id,r),fast=N.spec(row.id,r,0,{attackSpeed:100});assert.ok(fast.duration>=180-1e-7);assert.equal(fast.cooldown,s.cooldown);assert.equal(fast.lifetime,s.lifetime);assert.ok(s.events.every((t,i)=>t<=s.duration&&(i===0||t>s.events[i-1])));assert.ok(Math.abs(s.power-row.budget*(1+.18*(s.rank-1)))<1e-8);assert.ok(!/比較|適用|説明/.test(N.parameters(s)));}}
 assert.deepEqual([1,2,3,4,5].map(r=>N.spec('star-burst',r).count),[3,3,4,4,5]);assert.equal(N.spec('shadow-clone',5).clonePower,.4);assert.equal(N.spec('shadow-echo',5).echoPower,.35);
});
test('all skills and all ranks hit through the actual fixed-step simulation in both facings and at high speed',()=>{
 for(const speed of [1,10])for(const left of [false,true])for(const row of N.ACTIVE)for(let rank=1;rank<=row.maxRank;rank++){
  const f=encounter({speed,left}),{spec}=cast(f,row.id,rank,speed),events=S.update(f.run,Math.max(spec.duration+1700,spec.release+spec.lifetime+50));
  if(spec.power||spec.clonePower)assert.ok(hits(events).length>0,[row.id,rank,speed,left].join('/'));
  else assert.equal(hits(events).length,0,row.id);assert.equal(f.actor.mp,140-spec.mp);assert.equal(f.actor.ninjaCast,null);
  if(['burst','needles','cross','volley'].includes(spec.pattern))assert.equal(hits(events).length,spec.count,row.id);
  if(spec.pattern==='return')assert.equal(hits(events).length,2);
  if(['caltrop','thread','orbit','prison'].includes(spec.pattern))assert.equal(hits(events).length,spec.pulses,row.id);
  if(spec.pattern==='ultimate'){assert.equal(hits(events).length,spec.count+6);assert.equal(f.run.ninjaClones.length,0);}
  if(spec.pattern==='fan')assert.ok(hits(events).length<=2);
 }
});
test('normal flight sweeps nearest contact, survives dead aim, and returning/field attacks deduplicate owner parts',()=>{
 const f=encounter({count:2});f.target.x=510;f.run.enemies[1].x=420;cast(f,'shuriken');S.update(f.run,184);f.target.hp=0;const out=S.update(f.run,500);assert.deepEqual(hits(out).map(e=>e.target),['target-1']);
 const p=encounter();p.target.x=540;p.run.enemies.push({...p.target,id:'part',bodyPart:'worm-tail',ownerId:p.target.id,x:440,boss:false});const a=cast(p,'fuma-return');const out2=S.update(p.run,2000);assert.equal(hits(out2).length,2);assert.ok(Math.abs(hits(out2).reduce((v,e)=>v+e.amount,0)-100*a.spec.power)<=2);
 const q=encounter();q.run.enemies.push({...q.target,id:'part',bodyPart:'worm-tail',ownerId:q.target.id,x:q.target.x+5});const b=cast(q,'caltrop-field');assert.equal(hits(S.update(q.run,6000)).length,b.spec.pulses);
 const fly=encounter({flying:true});cast(fly,'caltrop-field');assert.equal(hits(S.update(fly.run,6000)).length,0);assert.ok(!fly.target.ninjaSlowUntil);
});
test('echo copies one action once, preserves critical snapshots, has its own fan cap, and cannot recurse or copy control',()=>{
 const f=encounter();f.actor.ninjaEcho={remaining:4,power:.35,until:7000};f.actor.crit=1;cast(f,'star-burst');const out=hits(S.update(f.run,1800));assert.equal(out.length,6);assert.equal(f.actor.ninjaEcho.remaining,3);assert.ok(out.every(e=>e.critical));assert.equal(out.filter(e=>e.amount<100).length,3);
 const pin=encounter();pin.actor.ninjaEcho={remaining:4,power:.35,until:7000};cast(pin,'shadow-pin');S.update(pin.run,300);const controlUntil=pin.target.controlUntil;assert.ok(controlUntil>300);S.update(pin.run,400);assert.equal(pin.target.controlUntil,controlUntil);assert.equal(pin.actor.ninjaEcho.remaining,3);
 const fan=encounter();fan.target.collisionRadius=120;fan.actor.ninjaEcho={remaining:4,power:.35,until:7000};cast(fan,'air-fan');assert.equal(hits(S.update(fan.run,2000)).length,4);assert.equal(fan.actor.ninjaEcho.remaining,3);
});
test('clones cap at six, share an eight-second wait after expiry, keep world lifetime, and substitute only direct hits',()=>{
 const f=encounter(),{spec}=cast(f,'eight-way-clones',5);S.update(f.run,spec.release+150);assert.equal(f.run.ninjaClones.length,6);const n=f.run.ninjaClones[0],until=n.until;f.actor.bubbleUntil=f.run.time+2000;S.update(f.run,2100);assert.equal(n.until,until);S.update(f.run,9000);assert.equal(f.run.ninjaClones.length,0);assert.ok(f.actor.cloneReadyAt>=until+8000-20);
 const g=encounter();cast(g,'shadow-double');S.update(g.run,800);const hp=g.actor.hp,enemy=g.target;enemy.actionBlindable=true;S.hit(g.run,enemy,g.actor,100,[],false,null,{direct:false,miss:false});assert.ok(g.actor.hp<hp);const after=g.actor.hp;S.hit(g.run,enemy,g.actor,100,[],false,null,{direct:true,miss:false});assert.equal(g.actor.hp,after);S.hit(g.run,enemy,g.actor,100,[],false,null,{direct:true,miss:false});assert.ok(g.actor.hp<after);
 K.clear(g.run,g.actor);assert.equal(g.run.ninjaClones.length,0);assert.equal(g.run.ninjaFields.length,0);assert.equal(g.run.ninjaProjectiles.length,0);
});
test('strong restrictions share a two-second cap and immunity across classes; root attacks, seal forbids specials, stop pauses clocks',()=>{
 const f=encounter(),e=f.target;assert.equal(C.apply(f.run,e,'root',1400),true);assert.equal(C.movement(e,0),0);f.run.time=1000;assert.equal(C.apply(f.run,e,'seal',2000),true);assert.equal(e.controlUntil,2000);assert.equal(C.apply(f.run,e,'root',2000),false);assert.equal(C.apply(f.run,e,'seal',2000),false);f.run.time=1900;assert.equal(C.apply(f.run,e,'stop',900),true);assert.equal(e.controlUntil,2000);f.run.time=2000;C.update(e,2000);assert.equal(C.apply(f.run,e,'stop',900),false);f.run.time=4500;assert.equal(C.apply(f.run,e,'stop',600),true);
 for(const boss of [true,false]){const g=encounter({boss});assert.equal(C.apply(g.run,g.target,'stop',600),!boss);C.blind(g.run,g.target,4000);assert.equal(g.target.ninjaBlindChance,boss?.15:.5);assert.equal(g.target.ninjaBlindUntil,boss?2000:4000);}
 const g=encounter();C.apply(g.run,g.target,'seal',2000);const parts=C.plan(g.run,g.target,[{motion:'slam',events:[{kind:'slam'}]}],[{motion:'bite',events:[{kind:'bite'}]}]);assert.equal(parts[0].motion,'bite');C.roll(g.run,g.target,parts);g.run.random=()=>.1;C.blind(g.run,g.target,4000);assert.equal(C.miss(g.run,g.target),true);g.run.random=()=>.9;assert.equal(C.miss(g.run,g.target),true);
 const paused=encounter();S.startExpansionAttack(paused.run,paused.target,paused.actor,[]);const before=paused.target.expansionPlan.time,cooldown=paused.target.cooldown;C.apply(paused.run,paused.target,'stop',600);S.update(paused.run,400);assert.equal(paused.target.expansionPlan.time,before);assert.ok(paused.target.cooldown<cooldown-350);S.update(paused.run,400);assert.ok(paused.target.expansionPlan.time>before);
});
test('MP shortage, root, source death, interruption and wave cleanup do not leave extra emissions',()=>{
 const f=encounter();f.actor.mp=0;assert.equal(S.startNinjaSkill(f.run,f.actor,N.spec('star-burst'),f.target,[],true),false);assert.equal(S.startNinjaSkill(f.run,f.actor,N.spec('shuriken'),f.target,[],true),true);
 const rooted=encounter();rooted.actor.rootAnchor={x:240,y:438};assert.equal(S.startNinjaSkill(rooted.run,rooted.actor,N.spec('shadow-cross'),rooted.target,[],true),false);assert.equal(S.startNinjaSkill(rooted.run,rooted.actor,N.spec('shuriken'),rooted.target,[],true),true);
 const g=encounter();cast(g,'star-burst',5);S.update(g.run,190);assert.ok(g.run.ninjaProjectiles.length);g.actor.bubbleUntil=g.run.time+2000;const out=S.update(g.run,1500);assert.equal(hits(out).length,1);assert.equal(g.actor.ninjaCast,null);
 const h=encounter();cast(h,'shadow-clone',5);S.update(h.run,900);C.blind(h.run,h.target,4000,h.actor.id);C.apply(h.run,h.target,'stop',600);S.hit(h.run,h.target,h.actor,1e9,[],false,null,{miss:false,direct:false});assert.equal(h.run.ninjaClones.length,0);assert.equal(h.run.ninjaProjectiles.length,0);assert.equal(h.target.ninjaBlindUntil,0);assert.equal(h.target.controlKind,'stop');
 const wave=encounter();cast(wave,'shadow-clone');S.update(wave.run,900);wave.target.hp=0;S.update(wave.run,20);assert.equal(wave.run.ninjaClones.length,0);assert.equal(wave.run.ninjaEchoQueue.length,0);
});
test('generated six motions, eighteen effects and twenty-one icons are local, transparent and reproducible',()=>{
 const {PNG}=require('pngjs'),base=path.resolve(__dirname,'../public/assets');let frames=0;
 for(const id of ['throw-combo','throw-tool','cast-release','air-throw','lay-trap','low-dash']){const dir=path.join(base,'ninja/motions',id),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));frames+=m.frameCount;assert.deepEqual(m.pivot,{x:160,y:239});assert.ok(fs.existsSync(path.join(dir,m.source)));for(const f of m.frames){const png=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));assert.equal(png.width,320);assert.equal(png.height,256);assert.ok(png.data.some((v,i)=>i%4===3&&v===0));}}
 assert.equal(frames,24);const records=JSON.parse(fs.readFileSync(path.join(__dirname,'../development/records/ninja-effect-generation.json')));assert.equal(records.length,12);for(const r of records){const dir=path.join(base,'skills/ninja/effects',r.id),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),im=PNG.sync.read(fs.readFileSync(path.join(dir,m.sheet)));assert.equal(im.width,m.frameCount*128);assert.ok(im.data.some((v,i)=>i%4===3&&v===0));}
 for(const n of N.ACTIVE)assert.ok(fs.statSync(path.resolve(__dirname,'../public',n.icon)).size>0);
 const extra=JSON.parse(fs.readFileSync(path.join(__dirname,'../development/records/ninja-fx-upgrade-generation.json')));assert.equal(extra.length,6);
 for(const r of extra){const dir=path.join(base,'skills/ninja/effects',r.id),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),im=PNG.sync.read(fs.readFileSync(path.join(dir,m.sheet)));assert.ok(fs.existsSync(path.resolve(__dirname,'..',r.source)));assert.equal(m.frameCount,4);assert.equal(im.width,m.frameCount*r.size);assert.equal(im.height,r.size);assert.equal(m.pivot.x,r.size/2);assert.equal(m.pivot.y,r.anchor==='bottom'?r.size-8:r.size/2);
   const hashes=new Set();for(const f of m.frames){const p=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));hashes.add(require('node:crypto').createHash('sha256').update(p.data).digest('hex'));assert.ok(p.data.some((v,i)=>i%4===3&&v===0));assert.ok(p.data.some((v,i)=>i%4===3&&v>0));for(let n=0;n<p.width;n++)for(const [x,y] of [[n,0],[n,p.height-1],[0,n],[p.width-1,n]])assert.equal(p.data[(y*p.width+x)*4+3],0,r.id+' clips cell edge');}assert.equal(hashes.size,4,r.id+' duplicate animation frames');}
});
