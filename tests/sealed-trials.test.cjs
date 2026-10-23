'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),R=require('../public/js/core/reincarnation.js'),T=require('../public/js/core/trials.js'),Tree=require('../public/js/data/reincarnation-tree-data.js'),S=require('../public/js/combat/forest-simulation.js'),Support=require('../public/js/combat/solo-support.js'),Auto=require('../public/js/core/reincarnation-automation.js'),Miko=require('../public/js/combat/miko-combat.js'),Rewards=require('../public/js/core/forest-run-rewards.js');
const jobs=Object.keys(P.CHARACTERS),base=['strength-2','onslaught','unyielding','goddess-serious'];
function own(s,id){for(const p of Tree.byId[id].requires)if(p!=='origin'&&!s.reincarnation.owned.includes(p))own(s,p);if(id!=='origin'&&!s.reincarnation.owned.includes(id))s.reincarnation.owned.push(id);}
function ready(ids=[]){const s=D.freshSave();Object.assign(s.reincarnation,{discovered:true,unlocked:true,cycle:10000,total:1000000,trialCompleted:[...base],appliedTrials:[...base],trials:ids,trialRun:ids.length>0});own(s,'trial-seals');s.cleared=Array.from({length:100},(_,i)=>i+1);s.gold=1e9;for(const item of D.ITEMS.filter(i=>i.type==='material'))s.inventory[item.id]=1e6;for(const job of jobs)s.progression.characters[job].xp=P.experience(100);return s;}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} vs ${b}`);
test('seals require their node, solo tiers require previous clear and enforce mandatory conditions once',()=>{
 const s=ready();assert.equal(T.definitions.length,34);assert.ok(T.available(s,'seal-gems'));s.reincarnation.owned=s.reincarnation.owned.filter(id=>id!=='trial-seals');assert.equal(T.available(s,'seal-gems'),false);own(s,'trial-seals');
 assert.equal(T.available(s,'solo-mage-2'),false);s.reincarnation.trialCompleted.push('solo-mage-1','solo-mage-2');assert.ok(T.available(s,'solo-mage-3'));
 assert.equal(T.validPlan(s,['solo-mage-1','solo-warrior-1']),false);
 assert.equal(T.summarize(['solo-mage-2']).stats,2);assert.equal(T.summarize(['solo-mage-2','strength-3']).stats,3);assert.equal(T.summarize(['solo-mage-2','strength-3']).ids.filter(id=>id.startsWith('strength-')).length,1);
 assert.equal(T.summarize(['solo-mage-3'],'extradimensional-goddess').stats,3);assert.ok(T.summarize(['solo-mage-3'],1).intervention);assert.equal(T.summarize(['solo-mage-3'],1).stats,1);
 for(const job of jobs)for(const tier of [1,2,3])assert.equal(T.summarize([`solo-${job}-${tier}`]).reward,T.soloMultipliers[job][tier-1]);
 const regular=['strength-10','onslaught','unyielding','goddess-serious','gate-release','seal-gems','seal-skills','seal-gear'];assert.equal(T.summarize(regular).reward,10125);assert.equal(T.summarize([...regular,'solo-miko-3']).reward,8100);
 const max=ready(regular);max.reincarnation.trialCompleted=T.definitions.map(d=>d.id);R.victory(max,'extradimensional-goddess',R.capture(max,'extradimensional-goddess'));assert.equal(R.payout(max),1518750);assert.equal(R.payout(D.readSave(JSON.stringify(max))),1518750);const next=R.prepare(max,D.freshSave,{trials:[]});assert.equal(D.readSave(JSON.stringify(next)).reincarnation.total,next.reincarnation.total);
});
test('solo selection shows mandatory trials, keeps stronger strength and removes dependent solos',()=>{
 const s=ready();s.reincarnation.trialCompleted=T.definitions.map(d=>d.id);
 for(const job of jobs){
  const solo=`solo-${job}-2`,third=`solo-${job}-3`;
  assert.deepEqual(new Set(T.toggle(s,[],solo)),new Set([solo,'strength-2']));
  const higher=T.toggle(s,['strength-5','seal-gems'],solo);assert.deepEqual(new Set(higher),new Set(['strength-5','seal-gems',solo]));
  assert.deepEqual(new Set(T.toggle(s,higher,'strength-5')),new Set(['seal-gems']));
  const lower=T.toggle(s,higher,'strength-2');assert.ok(lower.includes(solo));assert.ok(!lower.includes('strength-5'));
  const goddess=T.toggle(s,[],third);assert.deepEqual(new Set(goddess),new Set([third,'goddess-serious','onslaught','unyielding']));assert.ok(T.validPlan(s,goddess));
  for(const prerequisite of ['onslaught','unyielding','goddess-serious'])assert.ok(!T.toggle(s,goddess,prerequisite).includes(third));
  assert.deepEqual(new Set(T.toggle(s,goddess,third)),new Set(['goddess-serious','onslaught','unyielding']));
  const switched=T.toggle(s,goddess,solo);assert.ok(!switched.includes(third));assert.ok(switched.includes(solo));assert.ok(switched.includes('strength-2'));assert.equal(switched.filter(id=>T.byId[id].solo).length,1);
  const next=R.prepare(s,D.freshSave,{restart:true,trials:goddess});assert.deepEqual(new Set(D.readSave(JSON.stringify(next)).reincarnation.trials),new Set(goddess));
 }
 const original=['solo-miko-3'];assert.deepEqual(new Set(T.selection(original)),new Set(['solo-miko-3','goddess-serious','onslaught','unyielding']));assert.deepEqual(original,['solo-miko-3']);
 assert.deepEqual(T.selection([]),[]);assert.deepEqual(T.selection(T.selection(original)),T.selection(original));
});

test('gem seal blocks manual and automated equip, masks equipped effects and survives reload; abandon restores effects',()=>{
 const s=ready(),gem=P.addGem(s,P.Gem.generate({rarity:'rare',level:10,family:'attack',random:()=>.5}));assert.ok(P.equipGem(s,'warrior','weapon',gem.id));const buffed=P.stats(s,'warrior').damage;
 Object.assign(s.reincarnation,{trials:['seal-gems'],trialRun:true});const masked=P.stats(s,'warrior').damage;assert.ok(masked<buffed);assert.equal(P.equipGem(s,'mage','weapon',gem.id),false);s.reincarnation.automation.gems=true;assert.equal(Auto.gems(s),0);
 const restored=D.readSave(JSON.stringify(s));near(P.stats(restored,'warrior').damage,masked);assert.deepEqual(restored.progression.characters.warrior.gems.weapon,[]);assert.ok(T.abandon(s));near(P.stats(s,'warrior').damage,buffed);
});
test('active seals suppress their drop category, including guaranteed copies and automatic dismantling',()=>{
 for(const ids of [[],['seal-gems'],['seal-gear'],['seal-gems','seal-gear']]){
  const s=D.readSave(JSON.stringify(ready(ids)));own(s,'drop4');
  s.autoGemDismantle.enabled=true;s.autoGemDismantle.maxRarity='legendary';
  const existing=P.addGem(s,P.Gem.generate({rarity:'rare',level:10,family:'attack',random:()=>.5}));
  const inventory={...s.inventory},beforeGold=s.gold;
  const run=S.createRun('extradimensional-goddess',{builds:{warrior:{...P.stats(s,'warrior'),treasureHunt:199}},trials:T.capture(s,'extradimensional-goddess')});
  const pending=Rewards.create(run);assert.equal(pending.countMultiplier,4);
  for(const enemy of ['slime','treant','extradimensional-goddess'])Rewards.record(pending,{type:'loot',enemy,gold:12,goldRemainder:.75});
  const result=Rewards.settle(s,pending,true,()=>{assert.ok(ids.length<2,'both seals skip drop rolls');return 0;});
  assert.equal(result.gold,36);assert.equal(s.gold,beforeGold+36);assert.equal(s.goldRemainder,.75);
  assert.ok(result.loot[P.Gem.Epic.MATERIAL]>0,'goddess residue drops even with both seals');
  for(const material of ['jelly','flower','crystal','wood']){
   if(ids.includes('seal-gear')){assert.equal(s.inventory[material],inventory[material]);assert.equal(result.loot[material],undefined);}
   else assert.ok(result.loot[material]>0,material+' still drops');
  }
  assert.ok(s.gems.some(g=>g.id===existing.id));
  if(ids.includes('seal-gems')){
   assert.deepEqual(result.gems,[]);assert.equal(result.dismantled,0);assert.deepEqual(s.gems,[existing]);
   assert.ok(Object.keys(result.loot).every(id=>!id.startsWith('gem-')));
  }else{assert.ok(result.gems.some(g=>g.rarity==='epic'));assert.ok(result.dismantled>0);}
  assert.equal(Rewards.settle(s,pending,true),null);
 }
});

test('goddess residue keeps its fractional chance and count multiplier during both seals',()=>{
 for(const enemy of ['extradimensional-goddess','reincarnation-goddess'])for(const roll of [.299999,.3]){
  const s=ready(['seal-gear','seal-gems']);s.reincarnation.appliedTrials=[];own(s,'drop4');
  const p=Rewards.create(S.createRun(enemy,{builds:{warrior:P.stats(s,'warrior')},trials:T.capture(s,enemy)}));
  Rewards.record(p,{type:'loot',enemy,gold:0,goldRemainder:0});
  const result=Rewards.settle(s,p,true,()=>roll);
  assert.deepEqual(result.loot,enemy==='extradimensional-goddess'&&roll<.3?{[P.Gem.Epic.MATERIAL]:4}:{});assert.deepEqual(result.gems,[]);
 }
});

test('drop seals use the battle snapshot; abandoning restores drops in the next battle only',()=>{
 const s=ready(['seal-gems','seal-gear']);
 const pending=Rewards.create(S.createRun(10,{builds:{warrior:P.stats(s,'warrior')},trials:T.capture(s,10)}));
 Rewards.record(pending,{type:'loot',enemy:'treant',gold:10,goldRemainder:0});
 assert.ok(T.abandon(s));
 assert.deepEqual(Rewards.settle(s,pending,true,()=>{throw Error('sealed battle must not roll drops');}).loot,{});
 const restored=D.readSave(JSON.stringify(s));
 const next=Rewards.create(S.createRun(10,{builds:{warrior:P.stats(restored,'warrior')},trials:T.capture(restored,10)}));
 Rewards.record(next,{type:'loot',enemy:'treant',gold:10,goldRemainder:0});
 const result=Rewards.settle(restored,next,true,()=>0);
 assert.ok(result.loot.flower>0);assert.ok(result.gems.length>0);
 // Completion and permanent rewards alone do not suppress later ordinary runs.
 restored.reincarnation.trialCompleted.push('seal-gems','seal-gear');restored.reincarnation.appliedTrials.push('seal-gems','seal-gear');
 const ordinary=Rewards.create(S.createRun(10,{builds:{warrior:P.stats(restored,'warrior')},trials:T.capture(restored,10)}));
 assert.ok(ordinary.materialsEnabled);assert.ok(ordinary.gemsEnabled);
});

test('main-only trial upgrades stay free without materials, and clear rewards remain available',()=>{
 const s=R.prepare(ready(),D.freshSave,{restart:true,trials:['seal-gear','seal-gems']});
 assert.ok(s);assert.equal(P.permanent(s).mainFree,1);
 for(const job of jobs)for(const slot of ['weapon','armor'])for(const node of P.allGearTrees(job,slot).filter(n=>n.main)){
  assert.ok(Object.values(P.gearCost(s,node)).every(cost=>cost===0));
 }
 s.cleared.push('extradimensional-goddess');
 const root=P.gearTree('warrior','weapon','goddess').find(n=>n.main);
 assert.deepEqual(P.gearCost(s,root),{[P.Gem.Epic.MATERIAL]:1});
 assert.equal(P.purchase(s,'warrior','weapon',root.id),false);
 const goddess=Rewards.create(S.createRun('extradimensional-goddess',{builds:{warrior:P.stats(s,'warrior')},trials:T.capture(s,'extradimensional-goddess')}));
 Rewards.record(goddess,{type:'loot',enemy:'extradimensional-goddess',gold:0,goldRemainder:0});
 assert.deepEqual(Rewards.settle(s,goddess,true,()=>0).loot,{[P.Gem.Epic.MATERIAL]:1});
 assert.ok(P.purchase(s,'warrior','weapon',root.id));assert.equal(s.inventory[P.Gem.Epic.MATERIAL],0);
 const beforeGold=s.gold,beforePotion=s.inventory.potion;
 const reward=D.award(s,1,0,R.capture(s,1));
 assert.ok(reward.gold>0);assert.equal(s.gold,beforeGold+reward.gold);assert.equal(s.inventory.potion,beforePotion+1);
 assert.ok(P.purchase(s,'warrior','weapon','main-1'));assert.ok(P.purchase(s,'warrior','armor','main-1'));
 assert.equal(s.gold,beforeGold+reward.gold);
});

test('skill seal locks unlock levels above 50, including existing effects, automation and restoration',()=>{
 const s=ready(),high=P.SKILLS.warrior.find(n=>n.kind==='active'&&n.unlockLevel>50);assert.ok(P.purchase(s,'warrior','skills',high.id));Object.assign(s.reincarnation,{trials:['seal-skills'],trialRun:true});assert.equal(P.rank(s,'warrior',high.id),0);assert.equal(P.status(s,'warrior','skills',high),'locked');assert.equal(P.purchase(s,'warrior','skills',high.id),false);s.reincarnation.automation.skills=true;Auto.skills(s);assert.ok(P.SKILLS.warrior.filter(n=>P.rank(s,'warrior',n.id)).every(n=>(n.unlockLevel||1)<=50));assert.equal(P.rank(D.readSave(JSON.stringify(s)),'warrior',high.id),0);
});
test('gear seal covers effects, manual, batch and full-path purchases and save restore',()=>{
 const s=ready(),tree=P.gearTree('warrior','weapon'),main=tree.find(n=>n.id==='main-1'),branch=tree.find(n=>n.id==='branch-1-up-1');assert.ok(P.purchase(s,'warrior','weapon',main.id));assert.ok(P.purchase(s,'warrior','weapon',branch.id));const all=P.effects(s,'warrior','weapon').damage;
 Object.assign(s.reincarnation,{trials:['seal-gear'],trialRun:true});near(P.effects(s,'warrior','weapon').damage,all-branch.effect.damage);assert.equal(P.status(s,'warrior','weapon',branch),'locked');assert.equal(P.gearPurchasePlan(s,'warrior','weapon','branch-1-up-2').status,'locked');assert.equal(P.purchaseGearPath(s,'warrior','weapon','branch-1-up-2'),false);assert.deepEqual(P.purchaseGearBatch(s,[{character:'warrior',slot:'weapon',node:'branch-1-up-2'}]),[]);assert.ok(P.purchase(s,'warrior','weapon','main-2'));const restored=D.readSave(JSON.stringify(s));assert.equal(restored.progression.characters.warrior.weapon.includes(branch.id),false);assert.ok(restored.progression.characters.warrior.weapon.includes('main-2'));s.cleared.push('extradimensional-goddess');s.progression.characters.warrior.armor=P.gearTree('warrior','armor','goddess').map(n=>n.id);assert.equal(P.totalPoints(s,'warrior'),100,'sealed goddess SP branches contribute no points');
});
test('gear reward scales damage and HP continuously with the current wallet, without changing equipment effects',()=>{
 const s=ready();s.cleared.push('extradimensional-goddess');for(const slot of ['weapon','armor'])s.progression.characters.warrior[slot]=P.allGearTrees('warrior',slot,true).map(n=>n.id);
 const before=Object.fromEntries(['weapon','armor'].map(slot=>[slot,P.effects(s,'warrior',slot)])),caps=P.capacity(s,'warrior','weapon');s.reincarnation.trialCompleted.push('seal-gear');s.reincarnation.appliedTrials.push('seal-gear');
 for(const slot of ['weapon','armor'])assert.deepEqual(P.effects(s,'warrior',slot),before[slot]);assert.deepEqual(P.capacity(s,'warrior','weapon'),caps);
 for(const job of jobs){
  s.gold=0;const base=P.stats(s,job);
  for(const [gold,multiplier]of [[0,1],[999,1],[1000,1],[10000,4/3],[100000,5/3],[1e6,2],[1e9,3],[1e12,4],[1000,1]]){
   s.gold=gold;const actual=P.stats(s,job);
   for(const key of ['damage','maxHp','baseDamage','weaponDamage','magicDamage','skillDamage'])near(actual[key],base[key]*multiplier);
   for(const key of ['defense','maxMp','mpRegen','skillRange','haste'])near(actual[key],base[key]);
   assert.deepEqual(P.stats(D.readSave(JSON.stringify(s)),job),actual);
  }
 }
 s.gold=1e9;s.reincarnation.appliedTrials=s.reincarnation.appliedTrials.filter(id=>id!=='seal-gear');const noReward=P.stats(s,'warrior');s.reincarnation.trialCompleted.push('seal-gear');assert.deepEqual(P.stats(s,'warrior'),noReward,'recorded clear alone does not apply this journey');
 const next=R.prepare(s,D.freshSave,{restart:true,trials:[]});assert.equal(next.gold,0);assert.ok(T.rewards(next).gear);const initial=P.stats(next,'warrior');next.reincarnation.appliedTrials=next.reincarnation.appliedTrials.filter(id=>id!=='seal-gear');assert.deepEqual(P.stats(next,'warrior'),initial,'new journey starts at 1x with no gold');
 next.reincarnation.appliedTrials.push('seal-gear');next.gold=1e6;const run=S.createRun(1,{builds:{warrior:P.stats(next,'warrior')}});near(run.hero.maxHp,initial.maxHp*2);next.gold=1000;near(P.stats(next,'warrior').maxHp,initial.maxHp);near(run.hero.maxHp,initial.maxHp*2,'running battle retains its starting build');
});
test('gem reward grants compatible abilities from Lv1 without owning or equipping gems, even during the gem seal',()=>{
 const s=D.freshSave();s.reincarnation.trialCompleted=['seal-gems'];const before=P.stats(s,'warrior');assert.equal(before.gemEcho,0);assert.equal(s.gems.length,0);
 s.reincarnation.appliedTrials=['seal-gems'];
 for(const job of jobs){
  const actual=P.stats(s,job),flat=P.Gem.sealReward(job),base=P.CHARACTERS[job].base;
  for(const key of ['defense','maxMp','mpRegen','skillRange','gemEcho','gemSiphon','gemAegis'])near(actual[key],(base[key]||0)+(flat[key]||0));
  assert.ok(actual.damage>base.damage);assert.ok(actual.maxHp>base.maxHp);assert.ok(actual.gemEcho>0);assert.equal(actual[P.Gem.Epic.DEFINITIONS[job+'-weapon'].key],0);
  assert.deepEqual(s.progression.characters[job].gems,{weapon:[],armor:[]});
 }
 own(s,'trial-seals');Object.assign(s.reincarnation,{discovered:true,total:1000000,cycle:10000});const regular=Object.fromEntries(jobs.map(job=>[job,P.stats(s,job)]));Object.assign(s.reincarnation,{unlocked:true,trials:['seal-gems'],trialRun:true});assert.ok(T.rules(s).seals.gems);
 for(const job of jobs){assert.deepEqual(P.stats(s,job),regular[job]);assert.deepEqual(P.stats(D.readSave(JSON.stringify(s)),job),regular[job]);}assert.equal(s.gems.length,0);
});
test('real seal rewards match measured flat values and separate SP/capacity multipliers before skill specs',()=>{
 const Model=require('../tools/balance/measure-seal-reward-route.cjs'),s=ready();for(const id of ['sp30','common200'])own(s,id);const expected=Model.rewardBuilds(s).builds;s.reincarnation.trialCompleted.push('seal-gems','seal-skills');s.reincarnation.appliedTrials.push('seal-gems','seal-skills');
 for(const job of jobs){assert.deepEqual(P.Gem.sealReward(job),Model.legendaryReward(job));const actual=P.stats(s,job);for(const key of ['damage','maxHp','defense','maxMp','mpRegen','skillRange','gemEcho','gemSiphon','gemAegis','baseDamage','weaponDamage','magicDamage','skillDamage'])near(actual[key],expected[job][key]);assert.deepEqual(P.stats(D.readSave(JSON.stringify(s)),job),actual);}
});
test('all solo formations are truly one actor, level only that class and restore at Lv1 without recruitment gifts',()=>{
 for(const job of jobs){const s=ready(),next=R.prepare(s,D.freshSave,{restart:true,trials:[`solo-${job}-1`]});assert.ok(next);assert.equal(next.progression.selected,job);assert.deepEqual(jobs.filter(j=>P.unlocked(next,j)),[job]);const builds=Object.fromEntries(jobs.filter(j=>P.unlocked(next,j)).map(j=>[j,P.stats(next,j)])),run=S.createRun(1,{builds,trials:T.capture(next,1),random:()=>.5});assert.equal(run.hero.type,job);assert.equal(run.allies.length,0);assert.ok(S.update(run,1000));P.gainXp(next,10);assert.ok(next.progression.characters[job].xp.level>1);for(const other of jobs.filter(j=>j!==job))assert.equal(next.progression.characters[other].xp.level,1);const restored=D.readSave(JSON.stringify(next));assert.deepEqual(jobs.filter(j=>P.unlocked(restored,j)),[job]);assert.equal(restored.progression.selected,job);}
});
test('support eligibility, tier replacement, self exclusion and wave/timer boundaries use real runtime',()=>{
 const s=ready(['solo-warrior-1']);s.reincarnation.appliedTrials.push('solo-warrior-1','solo-mage-1','solo-mage-2','solo-paladin-1');let capture=T.capture(s,1);assert.deepEqual(capture.support,{mage:2,paladin:1});const run=S.createRun(1,{builds:{warrior:P.stats(s,'warrior')},trials:capture,random:()=>.5});run.hero.manualOnly=true;for(const e of run.enemies)e.hp=e.maxHp=1e20;
 const events=[];Support.tick(run,{hit:S.hit},events);assert.deepEqual(run.soloSupport.calls,{mage:1,paladin:1});assert.ok(events.some(e=>e.type==='solo-support'));assert.ok(!events.some(e=>e.type==='gem-effect'));Support.tick(run,{hit:S.hit},[]);assert.equal(run.soloSupport.calls.mage,1);run.time=10000;Support.tick(run,{hit:S.hit},[]);assert.equal(run.soloSupport.calls.mage,2);run.wave++;Support.tick(run,{hit:S.hit},[]);assert.equal(run.soloSupport.calls.mage,3);run.phase='between';run.time+=20000;Support.tick(run,{hit:S.hit},[]);assert.equal(run.soloSupport.calls.mage,3);run.phase='combat';run.status='victory';Support.tick(run,{hit:S.hit},[]);assert.equal(run.soloSupport.calls.mage,3);
 s.reincarnation.trials=['strength-2'];assert.deepEqual(T.capture(s,1).support,{mage:2});s.reincarnation.trials=[];s.reincarnation.trialRun=false;assert.deepEqual(T.capture(s,1).support,{});
});
test('miko solo support renders its spirit buff for every other class without a cast skill spec',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),K=require('../public/js/skills/miko-skills.js'),context={window:{},MikoSkills:K};
 vm.runInNewContext(fs.readFileSync(require.resolve('../public/js/render/miko-skill-renderer.js'),'utf8'),context);
 const renderer=context.window.MikoSkillRenderer,icons=[],icon={},ctx={save(){},restore(){},fillRect(){},drawImage(image){icons.push(image);}},assets={'icon-spirit-kagura':{image:icon}};
 for(const job of jobs.filter(j=>j!=='miko'))for(const tier of [1,2]){
  const s=ready([`solo-${job}-3`]);s.reincarnation.appliedTrials.push(`solo-miko-${tier}`);
  const run=S.createRun('dimensional-gate',{builds:{[job]:P.stats(s,job)},trials:T.capture(s,'dimensional-gate'),random:()=>.5});
  Support.tick(run,{hit:S.hit},[]);icons.length=0;
  const regions=renderer.statuses(ctx,run,assets);
  if(tier===1){assert.equal(run.mikoFestival,null);assert.equal(regions.length,0);continue;}
  assert.equal(run.mikoFestival.spec.id,'solo-kagura');assert.equal(run.mikoFestival.spec.mp,undefined);
  assert.equal(regions.length,1);assert.equal(regions[0].label,'巫女の援護 · 霊威 +20% · 残り 5.0秒');assert.deepEqual(icons,[icon]);
  assert.equal(Miko.spirit(run),.2);
  S.update(run,5000);assert.equal(run.mikoFestival,null);assert.equal(renderer.statuses(ctx,run,assets).length,0);
 }
 const s=ready(),run=S.createRun('dimensional-gate',{builds:{miko:P.stats(s,'miko')},random:()=>.5}),spec=K.spec('spirit-kagura');
 run.mikoFestival={source:run.hero,spec,start:0,until:spec.lifetime};
 assert.equal(renderer.statuses(ctx,run,assets)[0].label,spec.name+' · '+K.parameters(spec)+' · 残り 6.0秒');
});

test('solo miko can choose kagura with the existing MP, cooldown and target guards',()=>{
 const s=ready(['solo-miko-1']);for(const n of P.SKILLS.miko.filter(n=>n.kind==='active'))while(P.purchase(s,'miko','skills',n.id)){}const run=S.createRun(1,{builds:{miko:P.stats(s,'miko')},trials:T.capture(s,1)}),a=run.hero;const festival=a.mikoSkills.find(n=>n.id==='spirit-kagura');assert.ok(festival);a.mikoSkills=[festival];run.time=3000;run.enemies[0].hp=1e20;assert.equal(Miko.choose(run,a)?.spec.id,'spirit-kagura');a.mp=0;assert.equal(Miko.choose(run,a),null);a.mp=a.maxMp;a.mikoCooldowns[festival.id]=1;assert.equal(Miko.choose(run,a),null);
});
test('III intrinsic epics activate next journey, cannot stack or equip/craft again and leave all drop pools',()=>{
 const s=ready(['solo-mage-3']);s.reincarnation.trialCompleted.push('solo-mage-1','solo-mage-2');const before=P.stats(s,'mage'),proof=R.capture(s,'extradimensional-goddess');R.victory(s,'extradimensional-goddess',proof);assert.ok(T.completed(s).includes('solo-mage-3'));assert.equal(P.stats(s,'mage').epicMageArmor,0);assert.equal(R.payout(s),6000);const next=R.prepare(s,D.freshSave,{restart:true,trials:[]});assert.equal(P.stats(next,'mage').epicMageArmor,1);assert.equal(P.stats(next,'mage').maxMp,130*3);
 for(const job of jobs){next.reincarnation.trialCompleted.push(`solo-${job}-3`);next.reincarnation.appliedTrials.push(`solo-${job}-3`);for(const slot of ['weapon','armor']){assert.equal(P.stats(next,job)[P.Gem.Epic.DEFINITIONS[job+'-'+slot].key],1);const g=P.addGem(next,P.Gem.generate({rarity:'epic',family:job+'-'+slot}));assert.equal(P.equipGem(next,job,slot,g.id),false);assert.equal(P.Gem.craft(next,'epic',1,job+'-'+slot),null);}}
 assert.deepEqual(P.Gem.epicPool(next),[]);assert.ok(D.rollGems('extradimensional-goddess',()=>0,0,{epicFamilies:[]}).every(g=>g.rarity!=='epic'));Object.assign(next.reincarnation,{trialRun:true,trials:['seal-gems']});assert.equal(P.stats(next,'mage').epicMageArmor,1);const restored=D.readSave(JSON.stringify(next));assert.equal(P.stats(restored,'mage').epicMageArmor,1);
 const partial=ready();partial.reincarnation.appliedTrials.push('solo-mage-3');const pool=P.Gem.epicPool(partial);assert.equal(pool.length,10);assert.ok(pool.every(f=>!f.startsWith('mage-')));for(let i=0;i<20;i++)assert.ok(!P.Gem.generate({rarity:'epic',epicFamilies:pool,random:()=>i/20}).family.startsWith('mage-'));
 const pending=Rewards.create(S.createRun('extradimensional-goddess',{builds:{warrior:P.stats(next,'warrior')}}));Rewards.record(pending,{type:'loot',enemy:'extradimensional-goddess',gold:0,goldRemainder:0});assert.ok(Rewards.settle(next,pending,true,()=>0).gems.every(g=>g.rarity!=='epic'));assert.ok(before.maxMp>0);
});
