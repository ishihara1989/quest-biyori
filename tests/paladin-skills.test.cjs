'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths,{PNG}=require('pngjs');
const P=require('../public/js/skills/paladin-skills.js'),G=require('../public/js/core/forest-progression.js'),D=require('../public/js/data/forest-data.js'),S=require('../public/js/combat/forest-simulation.js');
function saveAt(level=100){const save=D.freshSave();D.award(save,10);save.progression.characters.paladin.xp=G.experience(level);return save;}
function duel(id,options={}){
 const s=P.spec(id,options.rank||1,options.enhance||0),run=S.createRun(1,{random:()=>.9,builds:{paladin:{...G.stats(saveAt(),'paladin'),damage:100,weaponDamage:100,magicDamage:100,crit:0,interval:1e9,mpRegen:0,speed:0,paladinSkills:[]}}});run.hero.hp=0;
 const actor=run.allies[0];Object.assign(actor,{x:options.left?750:250,y:425,hp:10000,maxHp:10000,mp:1000,maxMp:1000,cooldown:1e9});
 run.enemies=[{...run.enemies[0],id:'target',x:options.left?610:390,y:425,boss:!!options.boss,hp:1e8,maxHp:1e8,damage:100,speed:0,cooldown:1e9,special:1e9}];
 const events=[];S.startPaladinSkill(run,actor,s,run.enemies[0],events);return {run,actor,s,events};
}
function strike(run,target,amount){const source=run.enemies[0];run.projectiles.push({kind:'energy-bolt',source,damage:amount,targetId:target.id,x:source.x,y:source.y,tx:target.x,ty:target.y,tracking:true,time:0,duration:1});return S.update(run,S.STEP);}
test('paladin recruitment and old-save migration preserve normalized XP and existing characters',()=>{
 const save=D.freshSave();assert.equal(G.unlocked(save,'paladin'),false);const reward=D.award(save,10);assert.equal(reward.recruited,'paladin');assert.equal(G.level(save.progression.characters.paladin.xp),10);
 save.progression.characters.warrior.xp=G.experience(77,.25);delete save.progression.characters.paladin;
 const restored=D.readSave(JSON.stringify(save));assert.deepEqual(restored.progression.characters.warrior.xp,save.progression.characters.warrior.xp);assert.equal(G.level(restored.progression.characters.paladin.xp),10);
});
test('21 skills and 53 nodes obey level, dependency, rank, refund and independent point budgets',()=>{
 assert.deepEqual(P.ACTIVE.map(s=>s.unlockLevel),[1,...Array.from({length:20},(_,i)=>(i+1)*5)]);assert.equal(P.NODES.length,53);
 const save=saveAt();assert.equal(G.purchase(save,'paladin','skills','ultimate-enhance'),false);assert.equal(G.purchase(save,'paladin','skills','ultimate'),true);assert.equal(G.purchase(save,'paladin','skills','ultimate-enhance'),true);
 for(let i=0;i<5;i++)assert.equal(G.purchase(save,'paladin','skills','aegis'),true);assert.equal(G.purchase(save,'paladin','skills','aegis'),false);assert.equal(G.purchase(saveAt(24),'paladin','skills','charge'),false);
 const roundtrip=D.readSave(JSON.stringify(save));assert.equal(G.rank(roundtrip,'paladin','aegis'),5);const w=G.points(save,'warrior');G.decreaseSkill(save,'paladin','ultimate');assert.equal(G.rank(save,'paladin','ultimate-enhance'),0);G.respec(save,'paladin');assert.equal(G.points(save,'paladin'),100);assert.equal(G.points(save,'warrior'),w);
});
test('normal mace contact and raised-to-slam timing produce one hit and charge travels only during its six-frame advance',()=>{
 for(const id of ['mace','hammer','judgment','ultimate']){const {run,actor,s}=duel(id);const c=actor.paladinCast;assert.equal(S.update(run,s.release-1).filter(e=>e.type==='damage').length,0,id);const damage=S.update(run,s.duration).filter(e=>e.type==='damage'&&e.source==='paladin');assert.equal(damage.length,1,id);assert.ok(damage[0].timeMs>=s.release);assert.equal(actor.paladinCast,null);if(id==='hammer'){assert.equal(P.sample(c,s.windup-.01).motion,'mace-raise');assert.equal(P.sample(c,s.windup).motion,'mace-slam');}}
 const {run,actor,s}=duel('charge');S.update(run,s.windup-1);assert.equal(actor.x,250);S.update(run,s.duration);assert.equal(actor.x,250+s.travel);
});
test('charge hits only when its shield reaches the enemy and knockback follows facing exactly once',()=>{
 const q=duel('charge');q.run.enemies[0].x=540;assert.equal(S.update(q.run,q.s.release+S.STEP).filter(e=>e.type==='damage').length,0);assert.equal(S.update(q.run,q.s.duration).filter(e=>e.type==='damage').length,1);
 for(const left of [false,true]){const {run,s}=duel('wave',{left});const x=run.enemies[0].x;S.update(run,s.duration);assert.equal(run.enemies[0].x,x+(left?-s.push:s.push));}
});
test('cleanse is conditional, clears both statuses and prevents subsequent poison ticks',()=>{
 const q=duel('purify');q.actor.paladinCast=null;q.actor.mp=100;q.actor.paladinCooldowns={};q.actor.paladinSkills=[q.s];assert.equal(P.choose(q.actor,q.run.enemies,[q.actor],q.run),null);
 S.applyStatus(q.run,q.actor,'poison',q.run.enemies[0],[]);S.applyStatus(q.run,q.actor,'root',q.run.enemies[0],[]);assert.equal(P.choose(q.actor,q.run.enemies,[q.actor],q.run).spec.id,'purify');S.startPaladinSkill(q.run,q.actor,q.s,q.run.enemies[0],[]);const hp=q.actor.hp;S.update(q.run,q.s.duration+2000);assert.equal(q.actor.poison,null);assert.equal(q.actor.rootAnchor,null);assert.equal(q.actor.hp,hp);
});
test('aegis guards the entire party only during the active field and strongest reductions do not multiply',()=>{
 const q=duel('aegis');S.update(q.run,350);q.actor.defense=0;const ev=strike(q.run,q.actor,100);assert.equal(ev.find(e=>e.type==='damage').amount,35);assert.equal(ev.find(e=>e.type==='paladin-block').amount,65);
 q.run.paladinFields.push({...q.run.paladinFields[0],id:'fortress',spec:{...q.s,reduction:.3}});assert.equal(strike(q.run,q.actor,100).find(e=>e.type==='damage').amount,35);
 S.update(q.run,2500);assert.equal(strike(q.run,q.actor,100).find(e=>e.type==='damage').amount,100);
 const danger=duel('aegis');danger.actor.paladinCast=null;danger.actor.paladinCooldowns={};danger.actor.paladinSkills=[danger.s];assert.equal(P.choose(danger.actor,danger.run.enemies,[danger.actor],danger.run),null);danger.run.enemies[0].state='windup';assert.equal(P.choose(danger.actor,danger.run.enemies,[danger.actor],danger.run).spec.id,'aegis');
});
test('automatic aegis recognizes hydra charge and remains active through its breath release',()=>{
 const q=duel('aegis'),e=q.run.enemies[0];q.actor.paladinCast=null;q.actor.paladinCooldowns={};
 q.actor.paladinSkills=[q.s];q.actor.defense=0;Object.assign(e,D.ENEMIES.hydra,{type:'hydra',hp:1e8,maxHp:1e8,x:390,y:425,speed:0,cooldown:1e9,damage:100});e.attacks=1;S.startSwampAttack(q.run,e,q.actor,[]);const events=S.update(q.run,e.swampPlan.parts[0].duration+200);assert.ok(events.some(e=>e.type==='paladin-cast'&&e.skillId==='aegis'));const hit=events.find(e=>e.type==='damage'&&e.source==='target'),block=events.find(e=>e.type==='paladin-block');assert.ok(hit&&block);assert.ok(Math.abs(hit.amount/(hit.amount+block.amount)-.35)<.02);
});
test('sanctuary heals only living allies in its area and blocks new status effects',()=>{
 const q=duel('sanctuary');q.actor.hp=5000;q.run.hero.hp=100;q.run.hero.x=930;q.run.hero.speed=0;q.run.hero.cooldown=1e9;q.run.hero.skill=1e9;S.update(q.run,1400);assert.equal(q.actor.hp,5300);assert.equal(q.run.hero.hp,100);S.applyStatus(q.run,q.actor,'poison',q.run.enemies[0],[]);assert.equal(q.actor.poison,undefined);S.applyStatus(q.run,q.run.hero,'poison',q.run.enemies[0],[]);assert.ok(q.run.hero.poison);
});
test('hammer uses resistance/capacity to interrupt lich and mud giant but needs help against hydra; displacement and launch never move bosses',()=>{
 for(const type of ['lich','hydra','mud-giant']){const q=duel('hammer');const e=q.run.enemies[0];Object.assign(e,D.ENEMIES[type],{type,hp:1e8,maxHp:1e8,x:390,y:425,speed:0,cooldown:1e9,damage:0});e.attacks=type==='lich'?2:1;S.startSwampAttack(q.run,e,q.actor,[]);e.swampPlan.parts[0].duration=5000;const plan=e.swampPlan;const ev=S.update(q.run,800);if(type!=='hydra'){assert.equal(e.swampPlan,null);assert.ok(ev.some(e=>e.type==='action-interrupt'));assert.equal(q.run.enemies.length,1);}else assert.equal(e.swampPlan,plan);}
 for(const id of ['wave','charge','bash','pillar','wall','heavens']){const q=duel(id,{boss:true}),e=q.run.enemies[0];S.update(q.run,q.s.duration);assert.equal(e.x,390,id);assert.equal(e.y,425,id);assert.equal(e.airUntil,undefined,id);assert.ok(!(e.stagger>0),id);}
});
test('bash and pillars launch or bind mobs, and taunt redirects the next committed attack then expires',()=>{
 for(const id of ['bash','pillar']){const q=duel(id);S.update(q.run,q.s.release+S.STEP);assert.equal(q.run.enemies[0].controlKind,'stop',id);assert.ok(q.run.enemies[0].controlUntil>q.run.time,id);if(id==='bash')assert.ok(q.run.enemies[0].airUntil>q.run.time);}
 const q=duel('provoke');const h=q.run.hero,e=q.run.enemies[0];Object.assign(h,{hp:1000,x:380,y:425,speed:0,cooldown:1e9,skill:1e9});e.range=200;S.update(q.run,q.s.release+S.STEP);e.cooldown=0;S.update(q.run,S.STEP);assert.equal(e.targetId,'paladin');e.cooldown=1e9;S.update(q.run,5000);e.cooldown=0;S.update(q.run,S.STEP);assert.equal(e.targetId,'hero');
});
test('bastion saves each ally once, reflection cannot recurse, and revenge uses only guarded damage within its cap',()=>{
 const b=duel('bastion');S.update(b.run,350);b.actor.defense=0;b.actor.hp=10;strike(b.run,b.actor,100);assert.equal(b.actor.hp,1);strike(b.run,b.actor,100);assert.equal(b.actor.hp,0);assert.equal(b.run.paladinFields.length,0);
 const r=duel('reflect');S.update(r.run,350);r.actor.defense=0;const ev=strike(r.run,r.actor,100);assert.equal(ev.filter(e=>e.type==='damage').length,2);assert.equal(ev.find(e=>e.source==='paladin').amount,20);
 const q=duel('revenge');S.update(q.run,350);q.actor.defense=0;strike(q.run,q.actor,100);const damage=S.update(q.run,q.s.duration).find(e=>e.type==='damage'&&e.source==='paladin');assert.equal(damage.amount,739);
});
test('all skills are deterministic across frame intervals, protect during ultimate windup, and clear transient fields between waves',()=>{
 for(const skill of P.ACTIVE){const a=duel(skill.id),b=duel(skill.id);const total=Math.ceil((a.s.duration+50)/S.STEP)*S.STEP;const ea=S.update(a.run,total),eb=[];for(let i=0;i<Math.round(total/S.STEP);i++)eb.push(...S.update(b.run,S.STEP));assert.deepEqual(ea,eb,skill.id);assert.equal(a.actor.hp,b.actor.hp);assert.equal(a.actor.x,b.actor.x);assert.equal(a.actor.mp,1000-a.s.mp);}
 const u=duel('ultimate');S.update(u.run,350);assert.ok(S.fieldsFor(u.run,u.actor).some(f=>f.id==='ultimate'));assert.equal(u.actor.paladinCast.spec.id,'ultimate');u.run.enemies.forEach(e=>e.hp=0);S.update(u.run,S.STEP);assert.equal(u.run.paladinFields.length,0);assert.equal(u.actor.paladinCast,null);
});
test('21 generated icons and nine four-frame effects have real transparency and distinct animation frames',()=>{
 const base=path.resolve(__dirname,'../public/assets/skills/paladin');for(const s of P.ACTIVE){const p=PNG.sync.read(fs.readFileSync(path.join(base,'icons',s.id+'.png')));assert.equal(p.width,96);assert.ok(p.data.some((v,i)=>i%4===3&&v===0));assert.ok(p.data.some((v,i)=>i%4===3&&v>0));}
 for(const id of ['impact','wave','shield','circle','hammer','pillar','sword','knight','rampart']){const d=JSON.parse(fs.readFileSync(path.join(base,'effects',id,'manifest.json')));assert.equal(d.frameCount,4);const images=d.frames.map(f=>PNG.sync.read(fs.readFileSync(path.join(base,'effects',id,f.file))));assert.equal(new Set(images.map(p=>p.data.toString('base64'))).size,4,id);for(const p of images){assert.equal(p.width,256);for(let x=0;x<256;x++){assert.equal(p.data[x*4+3],0);assert.equal(p.data[((255*256)+x)*4+3],0);}}}
});
