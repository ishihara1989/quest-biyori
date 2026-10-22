'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),R=require('../public/js/core/reincarnation.js'),T=require('../public/js/data/reincarnation-tree-data.js'),Trials=require('../public/js/core/trials.js'),S=require('../public/js/combat/forest-simulation.js');
function own(save,id){for(const parent of T.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(save,parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);}
function ready(){const save=D.freshSave();Object.assign(save.reincarnation,{discovered:true,unlocked:true,cycle:100,total:20000});return save;}
function bonded(){const save=ready();own(save,'cycle-bond');return R.prepare(save,D.freshSave,{restart:true,trials:[]});}

test('bond costs 4000 PT, requires main waiver, rejects short funds and duplicate purchase',()=>{
 const save=ready();assert.equal(T.byId['cycle-bond'].cost,4000);assert.equal(R.status(save,'cycle-bond'),'locked');assert.equal(R.purchase(save,'cycle-bond'),false);
 own(save,'main-free');save.reincarnation.total=T.spent(R.state(save))+3999;assert.equal(R.purchase(save,'cycle-bond'),false);save.reincarnation.total++;
 assert.ok(R.purchase(save,'cycle-bond'));assert.equal(R.points(save),0);assert.equal(R.purchase(save,'cycle-bond'),false);assert.ok(Object.keys(P.CHARACTERS).every(job=>P.unlocked(save,job)));assert.equal(P.unlocked(save,'unknown'),false);
});

test('all six start at Lv1 without recruitment grants, fight together and survive reload and another restart',()=>{
 const save=bonded();assert.deepEqual(save.cleared,[]);const restored=D.readSave(JSON.stringify(save));
 for(const s of [save,restored,R.prepare(restored,D.freshSave,{restart:true,trials:[]})]){
  assert.ok(s.reincarnation.owned.includes('cycle-bond'));
  for(const job of Object.keys(P.CHARACTERS)){const c=s.progression.characters[job];assert.ok(P.unlocked(s,job));assert.deepEqual(c.xp,{level:1,progress:0});assert.deepEqual(c.weapon,[]);assert.deepEqual(c.armor,[]);assert.deepEqual(c.skills,[]);assert.deepEqual(c.skillRanks,{});assert.equal(P.totalPoints(s,job),1);}
  const run=S.createRun(1,{builds:Object.fromEntries(Object.keys(P.CHARACTERS).map(job=>[job,P.stats(s,job)]))});assert.equal(run.allies.length,5);
 }
 P.gainXp(restored,1,0);assert.ok(Object.values(restored.progression.characters).every(c=>c.xp.progress===1/3));
});

test('old join stages do not lower early allies, grant future equipment or play recruitment again',()=>{
 const save=bonded();for(const c of Object.values(save.progression.characters))c.xp=P.experience(55,.2);
 for(const stage of [4,10,20,30,40]){const reward=D.award(save,stage);assert.equal(reward.recruited,null);}
 for(const c of Object.values(save.progression.characters)){assert.deepEqual(c.xp,{level:55,progress:.2});assert.deepEqual(c.weapon,[]);assert.deepEqual(c.armor,[]);assert.deepEqual(c.skillRanks,{});assert.equal(c.skipRecruitReward,undefined);}
 const initial=bonded();initial.cleared=[1,2,3];own(initial,'skip2');R.pass(initial,5);assert.ok(initial.reincarnation.passed.includes(4));assert.equal(initial.progression.characters.mage.xp.level,1);
 initial.cleared=[1];initial.progression.characters.miko.weapon=P.allGearTrees('miko','weapon').filter(n=>n.main&&n.stage<=40).map(n=>n.id);
 const clean=D.readSave(JSON.stringify(initial));assert.equal(clean.progression.characters.miko.weapon.length,1,'early recruitment must not bypass equipment stage gates on restore');
});

test('without bond ordinary recruitment and minimum mage level remain intact',()=>{
 const save=D.freshSave();assert.equal(P.unlocked(save,'miko'),false);assert.equal(D.award(save,4).recruited,'mage');assert.equal(save.progression.characters.mage.xp.level,4);
 assert.equal(D.award(save,40).recruited,'miko');assert.equal(save.progression.characters.miko.xp.level,40);assert.ok(save.progression.characters.miko.weapon.length>0);
 assert.equal(D.readSave(JSON.stringify(save)).progression.characters.miko.xp.level,40);
});

test('seal node requires door, both fifth combat nodes and bond, charges 4000 PT and roundtrips',()=>{
 const required=['trial-open','damage2','hp2','cycle-bond'];assert.equal(T.byId['trial-seals'].cost,4000);assert.deepEqual(T.byId['trial-seals'].requires,required);
 for(const absent of required){const save=ready();for(const id of required.filter(id=>id!==absent))own(save,id);assert.equal(R.status(save,'trial-seals'),'locked');assert.equal(R.purchase(save,'trial-seals'),false);}
 const save=ready();for(const id of required)own(save,id);const before=R.points(save);assert.ok(R.purchase(save,'trial-seals'));assert.equal(R.points(save),before-4000);assert.equal(R.purchase(save,'trial-seals'),false);
 const restored=D.readSave(JSON.stringify(save));assert.deepEqual(new Set(restored.reincarnation.owned),new Set(save.reincarnation.owned));assert.equal(R.points(restored),before-4000);assert.equal(R.status(restored,'trial-seals'),'owned');assert.equal(Trials.definitions.length,13,'individual sealed trials remain design proposals');
});
