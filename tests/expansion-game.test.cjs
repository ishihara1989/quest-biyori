'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),S=require('../public/js/combat/forest-simulation.js'),X=require('../public/js/combat/expansion-combat.js');
const seeded=seed=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
function baseline(stage){return require('../tools/balance/audit-balance.cjs').referenceBuild(stage,stage-1).builds;}
function encounter(type){const run=S.createRun(D.ENEMIES[type].region===3?30:40,{random:()=>.5}),enemy={...run.enemies[0],...D.ENEMIES[type],id:'test-enemy',type,hp:1e5,maxHp:1e5,defense:0,x:360,y:438,cooldown:1e6,attacks:0};run.enemies=[enemy];run.wave=run.stage.waves.length-1;Object.assign(run.hero,{hp:1e5,maxHp:1e5,speed:0,damage:0,cooldown:1e6,skill:1e6,crit:0});return {run,enemy};}
function income(stage){const out={gold:stage.reward},region=D.REGIONS[stage.region-1];for(const type of stage.waves.flat()){const e=D.ENEMIES[type];out.gold+=e.gold;out[e.common]=(out[e.common]||0)+(e.boss?1:.3);if(e.boss)out[region.crystal]=(out[region.crystal]||0)+(e.majorBoss?1:.3);if(e.majorBoss)out[region.rare]=(out[region.rare]||0)+.3;}return out;}
test('two new ten-stage regions follow the existing three-family wave topology',()=>{
  assert.ok(D.STAGES.length>=40);assert.ok(D.REGIONS.length>=4);
  for(const region of [3,4]){const stages=D.STAGES.filter(s=>s.region===region);assert.equal(stages.length,10);stages.forEach((s,i)=>{assert.equal(s.level,(region-1)*10+i+1);assert.ok(s.waves.length>=3&&s.waves.length<=4);assert.equal(D.stageLabel(s.id),region+'-'+(i+1));});assert.equal(stages[4].total,36);assert.equal(stages[9].waves.at(-1).filter(id=>D.ENEMIES[id].majorBoss).length,1);assert.ok(stages.slice(0,9).every(s=>s.enemies.every(id=>!D.ENEMIES[id].majorBoss)));}
});
test('unlock, auto advance, defeat fallback and final farming extend through stage40',()=>{
  const save=D.freshSave();for(const id of [21,31]){assert.equal(D.isUnlocked(save,id),false);D.award(save,id-1);assert.equal(D.isUnlocked(save,id),true);save.autoMode='advance';assert.deepEqual(D.autoDestination(save,id-1,true),{stage:id,mode:'advance'});assert.deepEqual(D.autoDestination(save,id,false),{stage:id-1,mode:'same'});}
  save.cleared=D.STAGES.map(s=>s.id);save.selectedStage=40;P.recruitMiko(save);save.progression.characters.mage.xp=P.experience(4);assert.deepEqual(D.autoDestination(save,40,true),{stage:41,mode:'advance'});assert.deepEqual(D.readSave(JSON.stringify(save)),save);
});
test('new material and gem drops preserve all policy boundaries',()=>{
  for(const [id,e]of Object.entries(D.ENEMIES).filter(([,e])=>e.region>=3)){const r=D.REGIONS[e.region-1];assert.deepEqual(D.rollMaterials(id,()=>.3),e.majorBoss?[e.common,r.crystal]:e.boss?[e.common]:[]);assert.deepEqual(D.rollMaterials(id,()=>.2999),[e.common,...e.boss?[r.crystal]:[],...e.majorBoss?[r.rare]:[]]);
    if(!e.boss){assert.equal((D.rollGems(id,()=>0)[0] ?? null),null);continue;}for(const [chance,rarity]of (e.region>=6?[[0,'legendary'],[.0005,'unique'],[.0055,'rare'],[.0555,null]]:[[.00499,'unique'],[.005,'rare'],[.05499,'rare'],[.055,null]])){const values=[chance,0],g=(D.rollGems(id,()=>values.shift() ?? .5)[0] ?? null);assert.equal(g?g.rarity:null,rarity);}}
});
test('region finales retain normalized exponential experience without cumulative XP',()=>{
  const save=D.freshSave(),c=save.progression.characters.warrior;for(const stage of [30,40])for(let delta=0;delta<=5;delta++){c.xp=P.experience(stage-1+delta);for(let i=0;i<3**delta;i++)P.gainXp(save,stage);assert.deepEqual(c.xp,P.experience(stage+delta));}c.xp=P.experience(59);P.gainXp(save,40);assert.deepEqual(c.xp,P.experience(59));
});
test('regional trees preserve 100 nodes, dependency chain, 300-clear budgets and three-clear mains',()=>{
  for(const region of [3,4])for(const id of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){const nodes=P.gearTree(id,slot,region),costs={},r=D.REGIONS[region-1];assert.equal(nodes.length,100);assert.equal(nodes.filter(n=>n.main).length,10);assert.ok(nodes.every(n=>n.requires.every(req=>P.allGearTrees(id,slot).some(p=>p.id===req))));for(const n of nodes)for(const [k,v]of Object.entries(n.cost))costs[k]=(costs[k]||0)+v;assert.equal(costs[r.rare],90);const drops=income(D.STAGES[region*10-1]),runs=Math.max(...Object.entries(costs).map(([k,v])=>v/drops[k]));assert.ok(runs>=290&&runs<=310,JSON.stringify({region,costs,drops,runs}));
    for(const n of nodes.filter(n=>n.main)){const drops=income(D.STAGES[n.stage-1]);assert.ok(Object.entries(n.cost).every(([k,v])=>2*v/drops[k]<=3),JSON.stringify({region,n:n.id,cost:n.cost,drops}));assert.equal(n.cost[r.rare],undefined);}}
  const save=D.freshSave();save.cleared=D.STAGES.map(s=>s.id);P.recruitNinja(save);P.recruitShaman(save);P.recruitMiko(save);save.progression.characters.mage.xp=P.experience(4);save.progression.characters.warrior.weapon=P.allGearTrees('warrior','weapon').map(n=>n.id);assert.equal(P.capacity(save,'warrior','weapon').common,50+50*D.REGIONS.length);assert.deepEqual(D.readSave(JSON.stringify(save)),save);
});
test('emerging parts transfer damage once to owner, expire and never yield extra loot',()=>{
  for(const [type,kind]of [['large-worm','worm-tail'],['kraken','kraken-tentacle']]){const {run,enemy}=encounter(type);X.spawnPart(run,enemy,kind,run.hero,[]);const p=run.enemies.find(e=>e.bodyPart);assert.ok(p);const before=enemy.hp,events=[];S.hit(run,run.hero,p,100,events);assert.equal(enemy.hp,before-100);assert.equal(run.kills,0);assert.equal(events.filter(e=>e.type==='damage').length,1);S.hit(run,run.hero,p,1e9,events);assert.equal(run.kills,1);assert.equal(events.filter(e=>e.type==='loot').length,1);S.update(run,20);assert.equal(run.status,'victory');assert.equal(p.hp,0);}
  const {run,enemy}=encounter('large-worm');X.spawnPart(run,enemy,'worm-tail',run.hero,[]);S.update(run,7010);assert.equal(run.enemies.find(e=>e.bodyPart).hp,0);assert.equal(run.kills,0);
});
test('troll combo has three timed strikes then a genuine three-second rest',()=>{
  const {run,enemy}=encounter('cave-troll');enemy.attacks=4;S.startExpansionAttack(run,enemy,run.hero,[]);enemy.cooldown=1e6;const attackTime=enemy.expansionPlan.parts.slice(0,3).reduce((n,p)=>n+p.duration,0);const events=S.update(run,Math.ceil(attackTime/S.STEP)*S.STEP+S.STEP*3);assert.equal(events.filter(e=>e.type==='damage').length,3);assert.equal(enemy.motion,'rest');assert.ok(enemy.expansionPlan);S.update(run,2900);assert.equal(enemy.motion,'rest');S.update(run,120);assert.equal(enemy.expansionPlan,null);
});
test('drain heals only actual damage and shell defense reduces incoming damage',()=>{
  const {run,enemy}=encounter('great-bat');enemy.hp=500;enemy.attacks=1;S.startExpansionAttack(run,enemy,run.hero,[]);S.update(run,enemy.expansionPlan.parts[0].events[0].at+S.STEP);assert.ok(enemy.hp>500);
  const c=encounter('great-hermit');c.enemy.motion='shell';const before=c.enemy.hp;S.hit(c.run,c.run.hero,c.enemy,100,[]);assert.equal(before-c.enemy.hp,30);
});
test('web slows motion and attack clocks; bubble prevents actions and blind can miss',()=>{
  const a=encounter('cave-bat'),b=encounter('cave-bat');X.status(a.run,a.run.hero,'web',[]);S.update(a.run,100);S.update(b.run,100);assert.ok(Math.abs(a.run.hero.time/b.run.hero.time-.55)<1e-9);assert.equal(a.run.hero.webUntil,3500);
  X.status(a.run,a.run.hero,'bubble',[]);const position={x:a.run.hero.x,y:a.run.hero.y},hp=a.enemy.hp;S.update(a.run,2000);assert.deepEqual({x:a.run.hero.x,y:a.run.hero.y},position);assert.equal(a.enemy.hp,hp);S.update(a.run,250);assert.ok(a.run.time>a.run.hero.bubbleUntil);
  X.status(b.run,b.run.hero,'blind',[]);b.run.random=()=>.1;const events=[];assert.equal(S.hit(b.run,b.run.hero,b.enemy,100,events),false);assert.equal(events[0].type,'miss');
});
test('all requested special attacks are reachable and fixed-step combat is deterministic',()=>{
  for(const id of Object.keys(D.ENEMIES).filter(id=>[3,4].includes(D.ENEMIES[id].region))){const {run,enemy}=encounter(id);for(let i=0;i<5;i++){S.startExpansionAttack(run,enemy,run.hero,[]);enemy.cooldown=1e6;S.update(run,enemy.expansionPlan.parts.reduce((n,p)=>n+p.duration,0)+100);assert.equal(enemy.expansionPlan,null,id);}}
  const a=S.createRun(30,{builds:baseline(30),random:seeded(3)}),b=S.createRun(30,{builds:baseline(30),random:seeded(3)});S.update(a,10000);for(let i=0;i<400;i++)S.update(b,25);assert.deepEqual(a.enemies,b.enemies);assert.deepEqual(a.hero,b.hero);
});
test('all twenty stages clear at intended level with prior mains and top-first actives, without branches or gems',()=>{
  for(let stage=21;stage<=40;stage++)for(let seed=0;seed<10;seed++){const run=S.createRun(stage,{builds:baseline(stage),random:seeded(seed)});for(let t=0;t<180000&&run.status==='running';t+=100)S.update(run,100);assert.equal(run.status,'victory','stage '+stage+' seed '+seed+' kills '+run.kills);}
});
module.exports={baseline};
