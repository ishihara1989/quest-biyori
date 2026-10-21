'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),R=require('../public/js/core/reincarnation.js'),T=require('../public/js/data/reincarnation-tree-data.js'),A=require('../public/js/core/achievements.js'),Auto=require('../public/js/core/reincarnation-automation.js'),Rewards=require('../public/js/core/forest-run-rewards.js'),S=require('../public/js/combat/forest-simulation.js'),C=require('../public/js/combat/reincarnation-combat.js'),I=require('../public/js/combat/action-interference.js');
const B=require('../tools/balance/audit-reincarnation.cjs');
const ready=()=>{const s=B.reference();s.reincarnation.unlocked=true;s.reincarnation.defeatedCycle=0;A.sync(s,'2026-10-20T00:00:00.000Z');return s;};
function own(save,id){for(const parent of T.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(save,parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);}
test('hidden content does not enter achievements, stage lists or discovery without the battle evidence',()=>{
 const s=D.freshSave();assert.equal(D.stageVisible(s,D.ALL_STAGES.at(-1)),false);assert.ok(!A.catalog(s).some(d=>/転生|十二|女神|エピック|試練/.test(d.name+d.hint)));
 s.cleared=D.STAGES.map(s=>s.id).concat('chaos-gate','extradimensional-goddess');D.award(s,'extradimensional-goddess');assert.equal(s.reincarnation.discovered,false);
 const proof=R.capture(s);assert.equal(proof.fullEpics,false);D.award(s,'extradimensional-goddess',0,proof);assert.equal(s.reincarnation.discovered,false);
});
test('twelve legal, distinct epic slots at battle start unlock discovery; midbattle equipment cannot forge evidence',()=>{
 const s=B.reference(),proof=R.capture(s);assert.equal(proof.fullEpics,true);
 s.progression.characters.miko.gems.armor=[];D.award(s,'extradimensional-goddess',0,proof);assert.equal(s.reincarnation.discovered,true);assert.equal(s.reincarnation.unlocked,false);assert.equal(D.isUnlocked(s,'reincarnation-goddess'),true);
 const t=B.reference();t.reincarnation.discovered=false;const missing=t.progression.characters.miko.gems.armor.pop(),before=R.capture(t);t.progression.characters.miko.gems.armor.push(missing);D.award(t,'extradimensional-goddess',0,before);assert.equal(t.reincarnation.discovered,false);
 t.progression.characters.miko.gems.armor=[t.progression.characters.mage.gems.armor[0]];assert.equal(R.capture(t).fullEpics,false);
});
test('discovery is permanent; each new cycle still needs its own goddess victory and only pays once',()=>{
 const s=B.reference();assert.equal(R.eligible(s),false);
 D.award(s,'reincarnation-goddess',0,R.capture(s));assert.equal(R.eligible(s),true);assert.equal(s.reincarnation.total,0);
 D.award(s,'reincarnation-goddess',0,R.capture(s));assert.equal(s.reincarnation.total,0);
 A.sync(s);const next=R.prepare(s,D.freshSave);assert.equal(next.reincarnation.total,100);assert.equal(next.reincarnation.cycle,1);assert.equal(R.eligible(next),false);assert.equal(R.prepare(next,D.freshSave),null);
 assert.equal(D.isUnlocked(next,'reincarnation-goddess'),false);next.cleared.push('extradimensional-goddess');assert.equal(D.isUnlocked(next,'reincarnation-goddess'),true);
 R.victory(next,'reincarnation-goddess',{cycle:0});assert.equal(R.eligible(next),false);
 R.victory(next,'reincarnation-goddess',{cycle:1});const third=R.prepare(next,D.freshSave);assert.equal(third.reincarnation.total,200);
});
test('rebirth clears possessions, equipped/protected gems, growth, recruits and current progress; retains memories and settings',()=>{
 const s=ready();s.gold=123;s.inventory.potion=44;s.autoGear.enabled=true;s.autoMode='advance';s.speed=2;s.reincarnation.automation.skills=true;s.gems[0].locked=true;A.usage(s,'convert');A.sync(s);const original=JSON.stringify(s),next=R.prepare(s,D.freshSave);
 assert.equal(JSON.stringify(s),original,'preparation does not mutate live save before storage succeeds');assert.equal(next.gold,0);assert.equal(next.goldRemainder,0);assert.deepEqual(next.inventory,{potion:0});assert.deepEqual(next.gems,[]);assert.deepEqual(next.cleared,[]);assert.equal(next.selectedStage,1);
 for(const [job,c]of Object.entries(next.progression.characters)){assert.deepEqual(c.xp,{level:1,progress:0});assert.deepEqual(c.weapon,[]);assert.deepEqual(c.armor,[]);assert.deepEqual(c.gems,{weapon:[],armor:[]});assert.equal(P.unlocked(next,job),job==='warrior');}
 assert.deepEqual(next.achievements,s.achievements);assert.deepEqual(next.autoGear,s.autoGear);assert.equal(next.autoMode,'advance');assert.equal(next.speed,2);assert.deepEqual(next.discoveredGemRarities,s.discoveredGemRarities);
 const restored=D.readSave(JSON.stringify(next));assert.equal(restored.inventory.potion,0);assert.equal(restored.reincarnation.total,100);assert.equal(P.Gem.unlocked(restored),true);assert.equal(require('../public/js/core/forest-auto-gear.js').unlocked(restored),true);assert.ok(D.enemyDiscovered(restored,'slime'));
});
test('tree purchases enforce prerequisites, available currency, no double purchase, no trial spending and roundtrip totals',()=>{
 const s=R.prepare(ready(),D.freshSave);assert.equal(R.purchase(s,'drop3'),false);assert.ok(R.purchase(s,'drop2'));assert.ok(R.purchase(s,'xp3'));assert.ok(R.purchase(s,'gold2'));assert.equal(R.points(s),0);assert.equal(R.purchase(s,'drop2'),false);assert.equal(R.purchase(s,'sub20'),false);
 assert.deepEqual([R.bonuses(s).drop,R.bonuses(s).xp,R.bonuses(s).gold],[2,1,2]);
 const restored=D.readSave(JSON.stringify(s));assert.deepEqual(new Set(restored.reincarnation.owned),new Set(s.reincarnation.owned));assert.equal(R.points(restored),0);
 for(const n of T.nodes.filter(n=>n.family==='trial')){assert.equal(R.status(s,n.id),'soon');assert.equal(R.purchase(s,n.id),false);}
 const corrupt=R.restore({...s.reincarnation,owned:['drop100','trial-open','xp3'],total:1e12});assert.deepEqual(corrupt.owned,['xp3']);assert.equal(corrupt.total,100);
});
test('equipment cost reductions apply equally to status, manual, batch and path buying; no goddess material waiver',()=>{
 const s=D.freshSave();s.cleared=[1,2,3,4,5,6,7,8,9,10];s.gold=1e9;own(s,'main-free');
 const node=P.gearTree('warrior','weapon',1).find(n=>n.id==='main-2');assert.equal(P.gearCost(s,node).jelly,0);assert.ok(P.purchase(s,'warrior','weapon','main-1'));assert.ok(P.purchase(s,'warrior','weapon','main-2'));assert.ok(!Number.isNaN(s.inventory.jelly));assert.equal(P.gearPurchasePlan(s,'warrior','armor','main-10').status,'available');assert.ok(P.purchaseGearPath(s,'warrior','armor','main-10'));
 const goddess=P.gearTree('warrior','weapon','goddess')[0];assert.deepEqual(P.gearCost(s,goddess),goddess.cost);
 const unique=P.gearTree('warrior','weapon',1).find(n=>n.unique);assert.equal(P.gearCost(s,unique).jelly,Math.ceil(unique.cost.jelly*.8));
});
test('experience stays normalized; SP uses integer arithmetic and retains extra ranks through save restoration',()=>{
 const s=ready();own(s,'sp50');own(s,'sp-ten2');own(s,'xp6561');
 for(let lv=1;lv<=100;lv++){s.progression.characters.warrior.xp=P.experience(lv);assert.equal(P.totalPoints(s,'warrior'),Math.floor(lv*300/100)+2*Math.floor(lv/10)+60);}
 s.progression.characters.warrior.xp=P.experience(1);P.gainXp(s,1);assert.equal(s.progression.characters.warrior.xp.level,8);assert.ok(s.progression.characters.warrior.xp.progress>=0&&s.progression.characters.warrior.xp.progress<1);
 s.progression.characters.warrior.xp=P.experience(100);P.respec(s,'warrior');s.reincarnation.automation.skills=true;Auto.skills(s);const ranks=structuredClone(s.progression.characters.warrior.skillRanks),points=P.points(s,'warrior');s.reincarnation.cycle=10000;s.reincarnation.total=1000000;const restored=D.readSave(JSON.stringify(s));assert.deepEqual(restored.progression.characters.warrior.skillRanks,ranks);assert.equal(P.points(restored,'warrior'),points);
});
test('skipping commits passage only on a win, recruits allies, grants no skipped rewards or stage achievements, stops at bosses',()=>{
 const s=D.freshSave();own(s,'skip2');s.cleared=[1,2,3];assert.equal(D.isUnlocked(s,5),true);assert.equal(D.isUnlocked(s,6),false);assert.deepEqual(s.reincarnation.passed,[]);
 const gold=s.gold;D.award(s,5,0,R.capture(s));assert.deepEqual(s.reincarnation.passed,[4]);assert.ok(P.unlocked(s,'mage'));assert.equal(s.progression.characters.mage.xp.level,4);assert.equal(s.cleared.includes(4),false);assert.equal(s.gold-gold,D.STAGES[4].reward);assert.equal(R.skipDestination(s,9),10);assert.equal(R.skipDestination(s,100),null);assert.equal(R.skipDestination(s,'extradimensional-goddess'),null);
 A.sync(s);assert.equal(s.achievements.earned['stage-4'],undefined);assert.ok(!s.reincarnation.passed.includes(6));
});
test('post-roll drop count multiplies actual materials and separately generated gem individuals; gold and first rewards stay separate',()=>{
 const s=D.freshSave();own(s,'drop2');own(s,'gold2');const run=S.createRun(1,{builds:{warrior:P.stats(s,'warrior')}}),pending=Rewards.create(run);Rewards.record(pending,{type:'loot',enemy:'boss-slime',gold:4,goldRemainder:0});const result=Rewards.settle(s,pending,true,()=>0);
 assert.equal(result.loot.jelly,2);assert.equal(result.loot.crystal,2);assert.equal(result.gems.length,2);assert.equal(new Set(result.gems.map(g=>g.id)).size,2);assert.equal(result.gold,4);assert.equal(Rewards.settle(s,pending,true),null);
 const wallet=D.freshSave();own(wallet,'drop4');assert.equal(D.addGold(wallet,10),10);own(wallet,'gold2');assert.equal(D.addGold(wallet,10),20);
});
test('crafting discount only affects boss ingredients; crafting and salvaging cannot generate free shards',()=>{
 const s=ready();own(s,'gem-boss-free');const cost=P.Gem.craftRecipe('epic',null,'warrior-weapon',s);assert.deepEqual(cost,{'gem-shard-epic':200});s.inventory['gem-shard-epic']=200;const g=P.Gem.craft(s,'epic',null,'warrior-weapon');assert.ok(g);assert.ok(P.Gem.dismantle(s,g.id));assert.ok(s.inventory['gem-shard-epic']<200);assert.ok(s.achievements.usage.includes('craft'));assert.ok(s.achievements.usage.includes('dismantle'));
});
test('reward automation equips before dismantling and settles the remaining new gems once',()=>{
 const s=ready();s.reincarnation.automation.gems=true;s.autoGemDismantle.enabled=true;s.autoGemDismantle.maxRarity='legendary';
 const pending=()=>{const p=Rewards.create(S.createRun(1,{builds:{warrior:P.stats(s,'warrior')}}));Rewards.record(p,{type:'loot',enemy:'boss-slime',gold:0,goldRemainder:0});return p;};
 const result=Rewards.settle(s,pending(),true,()=>0),id=result.gems[0].id;assert.ok(result.deferred.includes(id));Auto.gems(s);assert.ok(P.gemOwner(s,id));Rewards.finishDismantle(s,result);assert.ok(P.gemInstance(s,id));assert.ok(result.loot['gem-instance-'+id]);
 for(const setting of Object.values(s.reincarnation.automation.slots))setting.locked=true;
 const other=Rewards.settle(s,pending(),true,()=>0),unused=other.gems[0].id;Auto.gems(s);Rewards.finishDismantle(s,other);assert.equal(P.gemInstance(s,unused),undefined);assert.equal(other.dismantled,1);assert.equal(other.loot['gem-instance-'+unused],undefined);const shards=s.inventory['gem-shard-rare'];Rewards.finishDismantle(s,other);assert.equal(s.inventory['gem-shard-rare'],shards);
});
test('skill automation respects OFF, seven priorities, highest unlock level ties and manual edit pause',()=>{
 const s=D.freshSave();s.cleared=[4,10];s.reincarnation.unlocked=true;s.reincarnation.automation.skills=true;const c=s.progression.characters.warrior;c.xp=P.experience(100);const job=s.reincarnation.automation.priorities.warrior;
 for(const n of P.SKILLS.warrior)job[n.id]={priority:7,enabled:false};for(const id of ['moon','ultimate'])job[id]={priority:1,enabled:true};Auto.skills(s,'warrior');assert.deepEqual(c.skillRanks,{});Auto.skills(s);assert.equal(P.rank(s,'warrior','ultimate'),5);assert.equal(P.rank(s,'warrior','moon'),5);assert.equal(P.rank(s,'warrior','fang'),0);assert.equal(Auto.skills(s),0);
});
test('gem automation picks a combination with more treasure hunt, keeps fixed slots and never steals another character',()=>{
 const s=D.freshSave();s.reincarnation.unlocked=true;s.reincarnation.automation.gems=true;
 s.gems=[{id:1,rarity:'rare'},{id:2,rarity:'rare'},{id:3,rarity:'rare'}];s.reincarnation.automation.slots['warrior:armor'].locked=true;
 const old={describe:P.Gem.describe,capacity:P.capacity,gemCosts:P.gemCosts,gemUsage:P.gemUsage};
 try{P.Gem.describe=g=>({jobs:['warrior'],effect:{treasureHunt:g.id===1?30:20}});P.capacity=()=>({attack:0,defense:0,utility:100,common:0,dedicated:0});P.gemCosts=(s,j,slot,g)=>({utility:(typeof g==='object'?g.id:g)===1?100:50});P.gemUsage=(s,j,slot,ids=s.progression.characters[j].gems[slot])=>({fits:ids.reduce((n,id)=>n+(id===1?100:50),0)<=100});
 assert.equal(Auto.gems(s),1);assert.deepEqual(new Set(s.progression.characters.warrior.gems.weapon),new Set([2,3]));assert.deepEqual(s.progression.characters.warrior.gems.armor,[]);assert.equal(Auto.gems(s),0);
 }finally{P.Gem.describe=old.describe;P.capacity=old.capacity;P.gemCosts=old.gemCosts;P.gemUsage=old.gemUsage;}
});
test('legacy achievement migration restores only provable history, is quiet on subsequent loads and does not infer a twelve-epic victory',()=>{
 const s=ready();delete s.achievements;delete s.reincarnation;const restored=D.readSave(JSON.stringify(s));assert.ok(restored.achievements.earned['stage-100']);assert.equal(restored.achievements.epics.length,12);assert.equal(restored.achievements.earned['twelve-stars'],undefined);assert.equal(restored.reincarnation.discovered,false);const second=D.readSave(JSON.stringify(restored));assert.deepEqual(second.achievements,restored.achievements);
});
test('laser/truck interruption cancels all scheduled damage; death cleans plans and victory survives its return animation',()=>{
 const s=B.reference(),builds=Object.fromEntries(Object.keys(P.CHARACTERS).map(id=>[id,P.stats(s,id)])),run=S.createRun('reincarnation-goddess',{builds,random:()=>0}),e=run.enemies[0],events=[];
 const api={STEP:100,state:(e,state,motion)=>Object.assign(e,{state,motion}),attackPower:()=>e.damage,hit:()=>{throw Error('cancelled attack damaged');}};
 e.deliveryCycle=5;C.begin(run,e,run.hero,api,events);assert.equal(e.deliveryPlan.kind,'truck');I.impact(run,{id:'test',interferencePenetration:0},e,1e9,events);assert.equal(e.actionInterference.interrupted,true);C.act(run,e,run.hero,api,events);assert.ok(e.deliveryPlan.cancelAt!=null);assert.deepEqual(e.deliveryPlan.shapes,[]);run.time+=2400;C.act(run,e,run.hero,api,events);assert.equal(e.deliveryPlan,null);
 run.elapsed=179999;S.hit(run,run.hero,e,1e15,[],false,null,{critical:false});assert.equal(e.hp,0);assert.equal(e.deliveryPlan,null);S.update(run,2500);assert.equal(run.status,'victory');assert.equal(run.failureReason,undefined);
});

test('stat and capacity entry nodes need only currency, retain their next prerequisites and survive reload',()=>{
 for(const [id,nextId] of [['damage25','damage-step-2'],['hp25','hp-step-2'],['sp20','sp25'],['common25','common50']]){
  const s=R.prepare(ready(),D.freshSave);s.reincarnation.cycle=2;s.reincarnation.total=200;
  assert.deepEqual(T.byId[id].requires,[]);assert.equal(R.status(s,nextId),'locked');
  s.reincarnation.total=T.byId[id].cost-1;assert.equal(R.purchase(s,id),false);
  s.reincarnation.total=T.byId[id].cost;assert.ok(R.purchase(s,id));assert.equal(R.points(s),0);assert.equal(R.purchase(s,id),false);
  s.reincarnation.total=200;const restored=D.readSave(JSON.stringify(s));
  assert.deepEqual(restored.reincarnation.owned,[id]);assert.equal(R.points(restored),200-T.byId[id].cost);assert.equal(R.bonuses(restored).mainFree,undefined);
  assert.equal(R.status(restored,nextId),['damage25','hp25'].includes(id)?'available':'unaffordable');
 }
});

test('combat branches use stronger absolute multipliers for every job and keep battle snapshots fixed',()=>{
 const expected=[2,3,4,5,7.5,10,15,20,30,40,60,80,100,150,200,300,400,500],s=ready();
 const before=Object.fromEntries(Object.keys(P.CHARACTERS).map(job=>[job,P.stats(s,job)]));
 for(const [family,key] of [['power','damage'],['guard','hp']]){
  const branch=T.branches.find(b=>b.family===family);assert.equal(branch.ids.length,expected.length);
  s.reincarnation.total=1e8;assert.equal(R.purchase(s,branch.ids.at(-1)),false);
  for(const [i,id] of branch.ids.entries()){assert.ok(R.purchase(s,id));assert.equal(R.bonuses(s)[key]/100,expected[i]);}
 }
 for(const job of Object.keys(P.CHARACTERS)){
  const after=P.stats(s,job);assert.equal(after.maxHp,before[job].maxHp*500);
  for(const key of ['baseDamage','weaponDamage','magicDamage'])assert.equal(after[key],before[job][key]*500);
 }
 const old={...s.reincarnation,cycle:1000000,total:1e8};const restored=R.restore(old);
 assert.deepEqual(restored.owned,s.reincarnation.owned);assert.equal(T.totals({owned:new Set(restored.owned)}).damage,50000);
 const fresh=R.prepare(ready(),D.freshSave);fresh.reincarnation.total=500;
 const run=S.createRun(1,{builds:{warrior:P.stats(fresh,'warrior')}}),initialHp=run.hero.maxHp,initialDamage=run.hero.damage;
 assert.ok(R.purchase(fresh,'damage25'));assert.ok(R.purchase(fresh,'hp25'));
 assert.equal(run.hero.maxHp,initialHp);assert.equal(run.hero.damage,initialDamage);
 const next=S.createRun(1,{builds:{warrior:P.stats(fresh,'warrior')}});assert.equal(next.hero.maxHp,initialHp*2);assert.equal(next.hero.damage,initialDamage*2);
});

test('SP milestones and quadrupled capacities reach the new totals without changing dedicated capacity',()=>{
 const s=ready();s.reincarnation.total=1e8;
 const before=Object.fromEntries(Object.keys(P.CHARACTERS).flatMap(job=>['weapon','armor'].map(slot=>[job+':'+slot,P.capacity(s,job,slot)])));
 for(const [id,expected]of [['sp20',50],['sp25',75],['sp30',100],['sp40',150],['sp50',200]]){own(s,id);assert.equal(R.bonuses(s).sp,expected);}
 const branch=T.branches.find(b=>b.family==='gem'&&b.x===1040);
 for(const id of branch.ids)assert.ok(R.purchase(s,id));
 const b=R.bonuses(s);assert.equal(b.common,3000);for(const key of ['attackCap','guardCap','utilityCap'])assert.equal(b[key],800);
 for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor']){
  const cap=P.capacity(s,job,slot),base=before[job+':'+slot];assert.equal(cap.common,base.common+3000);
  for(const key of ['attack','defense','utility'])assert.equal(cap[key],base[key]+800);assert.equal(cap.dedicated,base.dedicated);
 }
 s.reincarnation.cycle=1000000;const restored=D.readSave(JSON.stringify(s));assert.deepEqual(restored.reincarnation.owned,s.reincarnation.owned);assert.deepEqual(R.bonuses(restored),b);
 const reversed={owned:new Set([...s.reincarnation.owned].reverse())};assert.deepEqual(T.totals(reversed),b);
});
