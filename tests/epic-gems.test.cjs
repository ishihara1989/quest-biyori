'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),G=P.Gem,E=G.Epic;
const Sim=require('../public/js/combat/forest-simulation.js'),EC=require('../public/js/combat/epic-gem-combat.js');
const K=require('../public/js/skills/miko-skills.js'),N=require('../public/js/skills/ninja-skills.js'),C=require('../public/js/combat/shaman-combat.js'),SC=require('../public/js/skills/shaman-skills.js');
function fixture(){const s=D.freshSave();s.cleared=D.ALL_STAGES.map(s=>s.id);s.gold=1e9;for(const item of D.ITEMS.filter(i=>i.type!=='gem'))s.inventory[item.id]=100000;for(const id of Object.keys(P.CHARACTERS)){const c=s.progression.characters[id];c.xp=P.experience(100);for(const slot of ['weapon','armor'])c[slot]=P.allGearTrees(id,slot).map(n=>n.id);for(const n of P.SKILLS[id].filter(n=>n.kind==='active')){c.skillRanks[n.id]=5;c.skills.push(n.id);}}return s;}
function equip(s,job,slot){const g=P.addGem(s,G.generate({rarity:'epic',family:job+'-'+slot}));assert.ok(P.equipGem(s,job,slot,g.id));return g;}
function tree(s,job,slot){for(const n of P.gearTree(job,slot,'goddess'))assert.ok(P.purchase(s,job,slot,n.id));}
function run(builds){const r=Sim.createRun(100,{builds,random:()=>.99});for(const e of r.enemies){e.hp=e.maxHp=1e14;e.damage=0;e.cooldown=1e9;}for(const a of [r.hero,...r.allies]){a.cooldown=1e9;a.mp=a.maxMp=1e6;}return r;}

test('twelve fixed epic gems have unique art, no level or quality, and survive serialization',()=>{
  assert.equal(Object.keys(E.DEFINITIONS).length,12);
  const images=new Set();for(const d of Object.values(E.DEFINITIONS)){const a=G.generate({rarity:'epic',family:d.family,level:1,random:()=>0}),b=G.generate({rarity:'epic',family:d.family,level:10,random:()=>.99});assert.deepEqual(a,b);assert.ok(!Object.hasOwn(a,'level'));assert.ok(!Object.hasOwn(a,'quality'));assert.deepEqual(G.validate(JSON.parse(JSON.stringify(a))),a);const shown=G.describe(a);assert.ok(!shown.name.includes('Lv.'));assert.equal(shown.costs.dedicated,2000);assert.equal(shown.costs[d.slot==='weapon'?'attack':'defense'],1500);assert.deepEqual(shown.jobs,[d.job]);assert.equal(shown.slot,d.slot);assert.equal(G.upgradeRecipe(a,10),null);images.add(shown.image);assert.ok(fs.existsSync(path.join(__dirname,'../public',shown.image)));}assert.equal(images.size,12);
});
test('dedicated capacity never uses common capacity, slots and jobs are enforced, one epic per slot',()=>{
  const s=fixture(),g=P.addGem(s,G.generate({rarity:'epic',family:'miko-armor'}));
  assert.equal(P.equipGem(s,'miko','armor',g.id),false);tree(s,'miko','weapon');tree(s,'miko','armor');assert.equal(P.capacity(s,'miko','armor').common,1050);
  assert.equal(P.equipGem(s,'miko','weapon',g.id),false);assert.equal(P.equipGem(s,'mage','armor',g.id),false);assert.ok(P.equipGem(s,'miko','armor',g.id));
  const duplicate=P.addGem(s,G.generate({rarity:'epic',family:'miko-armor'}));assert.equal(P.equipGem(s,'miko','armor',duplicate.id),false);assert.equal(P.gemCosts(s,'miko','armor',g.id).dedicated,2000);assert.equal(P.gemCosts(s,'miko','armor',g.id).defense,900);
});
test('goddess tree has exact bonuses, each slot gives 30 SP, restoration includes the extra skill budget',()=>{
  const s=fixture();for(const slot of ['weapon','armor']){const nodes=P.gearTree('warrior',slot,'goddess');assert.equal(nodes.length,41);assert.equal(nodes.filter(n=>n.effect.skillPoints).length,10);tree(s,'warrior',slot);assert.equal(P.effects(s,'warrior',slot).skillPoints,30);assert.equal(P.capacity(s,'warrior',slot).dedicated,2000);}
  const c=s.progression.characters.warrior;assert.equal(P.totalPoints(s,'warrior'),160);assert.equal(P.capacity(s,'warrior','weapon').attack,2850);assert.equal(P.capacity(s,'warrior','armor').defense,2800);
  for(const n of P.SKILLS.warrior.filter(n=>n.kind==='passive'))for(let i=0;i<5;i++)P.purchase(s,'warrior','skills',n.id);
  const before=P.points(s,'warrior'),restored=D.readSave(JSON.stringify(s));assert.equal(P.points(restored,'warrior'),before);assert.deepEqual(restored.progression.characters.warrior.skillRanks,c.skillRanks);P.respec(restored,'warrior');assert.equal(P.points(restored,'warrior'),160);
});
test('goddess unlock, fixed crafting, protected salvage and legendary shard conversion',()=>{
  const s=fixture();s.cleared=s.cleared.filter(id=>id!==E.GODDESS);assert.equal(G.craft(s,'epic',null,'miko-armor'),null);assert.equal(G.convert(s,'legendary'),false);assert.equal(P.purchase(s,'miko','armor','goddess-root'),false);s.cleared.push(E.GODDESS);
  const old=s.inventory['gem-shard-epic'],material=s.inventory[E.MATERIAL],g=G.craft(s,'epic',null,'miko-armor');assert.ok(g);assert.equal(s.inventory['gem-shard-epic'],old-200);assert.equal(s.inventory[E.MATERIAL],material-30);g.locked=true;assert.equal(G.dismantle(s,g.id),false);g.locked=false;assert.ok(G.dismantle(s,g.id));assert.equal(s.inventory['gem-shard-epic'],old-100);assert.ok(G.convert(s,'legendary'));assert.equal(s.inventory['gem-shard-epic'],old-99);
});
test('regional fixed effects grow linearly and treasure hunt is 12, 20, 30 percent',()=>{
  for(const [level,rate]of [[1,.12],[5,.2],[10,.3]])assert.equal(G.describe(G.generate({rarity:'unique',family:'fortune',level,random:()=>.5})).effect.treasureHunt,rate);
  const g=G.generate({rarity:'unique',family:'haste',level:5,random:()=>.01});assert.ok(Math.abs(G.describe({...g,level:10}).effect.haste-G.describe(g).effect.haste*1.5)<1e-8);assert.ok(G.upgradeRecipe(g,10));
});
test('unboosted goddess drops only epic 1 percent or legendary 10 percent, residue independently at 30 percent',()=>{
  const roll=value=>(D.rollGems(E.GODDESS,()=>value,0,{multiplier:10})[0] ?? null);assert.equal(roll(0).rarity,'epic');assert.equal(roll(.00999).rarity,'epic');assert.equal(roll(.01).rarity,'legendary');assert.equal(roll(.10999).rarity,'legendary');assert.equal(roll(.11),null);assert.equal(roll(.8),null);assert.deepEqual(D.rollMaterials(E.GODDESS,()=>.299),[E.MATERIAL]);assert.deepEqual(D.rollMaterials(E.GODDESS,()=>.3),[]);assert.equal(D.rollMaterials(E.GODDESS,()=>.99,9).length,3);
});
test('goddess treasure hunt grants whole gems per rarity and rolls the remaining fraction without a cap',()=>{
  const counts=(hunt,roll)=>{
    let first=true;
    const gems=D.rollGems(E.GODDESS,()=>{if(first){first=false;return roll;}return .5;},hunt,{multiplier:10,level:1});
    assert.ok(gems.every(g=>g.rarity==='epic'?!Object.hasOwn(g,'level'):g.level===10));
    return {epic:gems.filter(g=>g.rarity==='epic').length,legendary:gems.filter(g=>g.rarity==='legendary').length};
  };
  assert.deepEqual(counts(10,.109999),{epic:1,legendary:1});
  assert.deepEqual(counts(10,.11),{epic:0,legendary:2});
  assert.deepEqual(counts(10,.210001),{epic:0,legendary:1});
  for(const [hunt,epic,legendary]of [[9,0,1],[19,0,2],[99,1,10],[199,2,20]]){
    assert.deepEqual(counts(hunt,.999999),{epic,legendary});
  }
  assert.deepEqual(counts(249,.999999),{epic:2,legendary:25});
  assert.deepEqual(counts(249,.499999),{epic:3,legendary:25});
  assert.deepEqual(counts(249,.5),{epic:2,legendary:25});
});
test('stratified goddess rolls retain 11 percent epic and 110 percent legendary at treasure hunt +1000 percent',()=>{
  const total={epic:0,legendary:0};
  for(let i=0;i<1000;i++){
    let first=true;
    for(const g of D.rollGems(E.GODDESS,()=>{if(first){first=false;return (i+.5)/1000;}return .5;},10))total[g.rarity]++;
  }
  assert.deepEqual(total,{epic:110,legendary:1100});
});
test('defensive legendary triggers on barrier hits, ignores DoT, and shares one timer across all cooldown maps',()=>{
  const r=run({}),a=r.hero,e=r.enemies[0];a.gemMpOnHurt=.06;a.gemCooldownOnHurt=1.5;a.maxMp=100;a.mp=0;a.gemBarrier={amount:1e6,until:1e6};a.warriorCooldowns={a:10000};a.mikoCooldowns={'spirit-kagura':10000,'myriad-spirit-festival':10000};e.actionId='hit-1';
  Sim.hit(r,e,a,10,[],false,null,{direct:false});assert.equal(a.mp,0);Sim.hit(r,e,a,10,[],false,null,{direct:true});assert.equal(a.mp,6);assert.equal(a.warriorCooldowns.a,8500);assert.equal(a.mikoCooldowns['spirit-kagura'],8500);Sim.hit(r,e,a,10,[],false,null,{direct:true});assert.equal(a.mp,6);r.time=2000;Sim.hit(r,e,a,10,[],false,null,{direct:true});assert.equal(a.mp,6);e.actionId='hit-2';Sim.hit(r,e,a,10,[],false,null,{direct:true});assert.equal(a.mp,12);
});
test('warrior triple hits deal triple damage once and rage expires',()=>{
  for(const type of ['warrior']){const r=run({}),a=r.hero,e=r.enemies[0];a.type=type;a.crit=0;a.epicWarriorWeapon=type==='warrior';a.epicMageWeapon=type==='mage';e.defense=0;const hp=e.hp;Sim.hit(r,a,e,100,[],true);assert.equal(hp-e.hp,300);}
  const a={epicWarriorArmor:1,epicRage:10,epicRageUntil:1000};assert.equal(EC.rage(a,0),10);assert.equal(EC.rage(a,1000),0);
});
test('mage weapon creates two real spell copies with one MP payment and one armor proc',()=>{
  const M=require('../public/js/skills/mage-skills.js'),stats={epicMageWeapon:1,epicMageArmor:1,attackSpeed:1,maxHp:10000,maxMp:1000,damage:100,baseDamage:100,defense:100,crit:0,mpRegen:0,interval:1000,mageSkills:[]},r=run({mage:{...stats,speed:0,mageNormal:{...M.spec('bolt'),mp:1e9}}}),a=r.allies[0],e=r.enemies[0],spec=M.spec('thunder',1,0,stats);e.x=600;e.y=400;e.defense=0;a.mp=1000;a.maxMp=1000;const before=e.hp;a.manualOnly=true;assert.ok(Sim.startMageSkill(r,a,spec,e,[]));const events=Sim.update(r,5000);const hits=events.filter(e=>e.type==='mage-impact'&&e.skillId==='thunder');assert.equal(hits.length,3);assert.equal(a.mp,1000-spec.mp);assert.equal(a.epicMageBarrier,stats.maxHp*.2);assert.equal(r.epicMageCasts.length,0);assert.ok(e.hp<before);
});
test('mage armor multiplies MP and caps personal barriers; paladin support and duration are enhanced',()=>{
  const s=fixture();tree(s,'mage','armor');const before=P.stats(s,'mage');equip(s,'mage','armor');const a=P.stats(s,'mage');assert.equal(a.maxMp,before.maxMp*3);assert.equal(a.mpRegen,before.mpRegen+a.maxMp*.05);const actor={...a,hp:a.maxHp},r={time:0};for(let i=0;i<20;i++)EC.spell(r,actor,[]);assert.equal(actor.epicMageBarrier,actor.maxHp);
  const PS=require('../public/js/skills/paladin-skills.js'),normal=PS.spec('fortress',5),epic=PS.spec('fortress',5,0,{epicPaladinArmor:1});assert.equal(epic.effectDuration,normal.effectDuration*3);assert.equal(epic.radius,2000);assert.equal(PS.spec('reflect',5,0,{epicPaladinWeapon:1}).reflection,PS.spec('reflect',5).reflection*4);
});
test('miko epic armor opens all eleven contracts and four possessions for free and reconciles on removal',()=>{
  const s=fixture();tree(s,'miko','armor');const g=equip(s,'miko','armor'),r=run({miko:P.stats(s,'miko')}),a=r.allies.find(a=>a.type==='miko'),mp=a.mp;for(const sk of a.mikoSkills)a.mikoCooldowns[sk.id]=1e9;Sim.update(r,Sim.STEP);assert.equal(r.mikoContracts.length,11);assert.equal(r.mikoPossessions.length,4);assert.equal(r.mikoContracts.reduce((sum,c)=>sum+c.units.length,0),17);assert.equal(a.mp,mp);const count=r.mikoSerial;Sim.update(r,Sim.STEP);assert.equal(r.mikoSerial,count);
  P.unequipGem(s,'miko','armor',g.id);Sim.applyBuilds(r,{warrior:P.stats(s,'warrior'),miko:P.stats(s,'miko')});assert.equal(r.mikoContracts.length,4);for(const host of [r.hero,...r.allies])assert.ok(r.mikoPossessions.filter(p=>p.host===host).length<=1);
});
test('kagura duration, cooldown, recurring cooperation and party mana recovery work together',()=>{
  const stats={epicMikoWeapon:1,attackSpeed:1,maxHp:1e6,maxMp:100,damage:100,defense:100,mpRegen:0,crit:0,interval:1000};const spec=K.spec('myriad-spirit-festival',5,0,stats);assert.equal(spec.lifetime,30000);assert.equal(spec.cooldown,25000);assert.equal(spec.spirit,1.1);
  const r=run({miko:{...stats,mikoSkills:[]}}),a=r.allies.find(a=>a.type==='miko');a.mp=100;a.maxMp=100;assert.ok(Sim.startMikoSkill(r,a,spec,a));Sim.update(r,2800);assert.ok(r.mikoFestival);a.mp=0;const events=Sim.update(r,6000);assert.ok(a.mp>15);assert.ok(events.some(e=>e.kind==='cooperative-strike'));assert.ok(r.mikoFestival.until>r.time);
});
test('ninja armor increases every clone group and different groups coexist',()=>{
  const stats={epicNinjaArmor:1,epicNinjaWeapon:1,attackSpeed:1,maxHp:1e6,maxMp:1000,damage:10,defense:100,crit:0,interval:800,ninjaSkills:[]},r=run({ninja:stats}),a=r.allies.find(a=>a.type==='ninja'),e=r.enemies[0];
  for(const id of ['shadow-clone','mist-clones']){a.ninjaCast=null;const spec=N.spec(id,5,0,stats);assert.equal(spec.clonePower,1);assert.ok(Sim.startNinjaSkill(r,a,spec,e,[],true));Sim.update(r,1000);}
  assert.equal(r.ninjaClones.filter(c=>c.skillId==='shadow-clone').length,6);assert.equal(r.ninjaClones.filter(c=>c.skillId==='mist-clones').length,7);a.epicNinjaArmor=0;a.ninjaSkills=['shadow-clone','mist-clones'].map(id=>N.spec(id,5));require('../public/js/combat/ninja-combat.js').reconcile(r,a);assert.equal(r.ninjaClones.length,2);assert.ok(r.ninjaClones.every(c=>c.skillId==='shadow-clone'));
});
test('shaman has 25 marks, three deep curses, no mark consumption and half-second pulses',()=>{
  const r=run({}),a={id:'shaman',type:'shaman',hp:1000,maxHp:1000,mp:0,maxMp:100,damage:10,baseDamage:10,epicShamanWeapon:1,epicShamanArmor:1},e=r.enemies[0];
  const mark=SC.spec('curse-mark',5,0,a);for(let i=0;i<30;i++)C.addMark(r,e,a,mark);assert.equal(e.curse.marks.length,25);assert.equal(e.curse.markPeriod,500);assert.equal(e.curse.marks[0].until,30000);
  for(const id of ['grudge-flame','grudge-ramp','life-erosion'])C.deep(r,e,a,SC.spec(id,5,0,a));assert.equal([e.curse.deep,...e.curse.deepOthers].length,3);assert.equal(e.curse.deep.next,500);
  const api={hit:()=>true};C.apply(r,e,a,SC.spec('curse-burst',5,0,a),api,[],'burst');assert.equal(e.curse.marks.length,25);a.hp=100;EC.dealt(r,a,100,[],{curseKind:'curse-dot'});assert.equal(a.hp,110);assert.equal(a.mp,2);assert.equal(EC.reduction(r,a),.5);
});
test('paladin support activation performs a single global judgment and hurt cooldown never goes negative',()=>{
  const PS=require('../public/js/skills/paladin-skills.js'),stats={epicPaladinWeapon:1,epicPaladinArmor:1,damage:100,magicDamage:100,attackSpeed:1,maxHp:1e6,maxMp:1000,mpRegen:0,crit:0,speed:0,defense:100,interval:1000,paladinSkills:[]},r=run({paladin:stats}),a=r.allies[0];for(const e of r.enemies)e.defense=0;
  const e=r.enemies[0],before=e.hp;Sim.startPaladinSkill(r,a,PS.spec('aegis',5,0,stats),e,[]);const events=Sim.update(r,1500);assert.equal(before-e.hp,2000);assert.equal(events.filter(v=>v.type==='paladin-impact'&&v.skillId==='ultimate').length,1);
  a.paladinCooldowns={a:1000,b:2500};r.time=2000;EC.hurt(r,e,a,[],{},100);assert.deepEqual(a.paladinCooldowns,{a:0,b:500});
});
test('ninja epic throws three physical projectiles without recursively copying shadows',()=>{
  const NC=require('../public/js/combat/ninja-combat.js'),stats={epicNinjaWeapon:1,maxHp:1000,maxMp:1000,damage:100,crit:0,attackSpeed:1,interval:800,ninjaSkills:[]},r=run({ninja:stats}),a=r.allies[0],e=r.enemies[0];e.x=400;e.y=a.y;
  const spec=N.spec('shuriken',1,0,stats),cast=N.begin(spec,a,e);cast.actionId='epic-throw';NC.fire(r,a,cast,a,e,spec.power);assert.equal(r.ninjaProjectiles.length,3);assert.equal(r.ninjaProjectiles.filter(p=>p.secondary).length,2);assert.equal(new Set(r.ninjaProjectiles.map(p=>p.damage)).size,1);assert.equal(r.ninjaEchoQueue.length,0);
});
