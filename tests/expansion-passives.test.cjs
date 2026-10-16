'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),Sim=require('../public/js/combat/forest-simulation.js');
const classes={ninja:require('../public/js/skills/ninja-skills.js'),shaman:require('../public/js/skills/shaman-skills.js'),miko:require('../public/js/skills/miko-skills.js')};
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} / ${b}`);
function saveAt(level=100){const save=D.freshSave();save.cleared=Array.from({length:50},(_,i)=>i+1);for(const c of Object.values(save.progression.characters))c.xp=P.experience(level);return save;}
function buy(save,id,node,count=1){for(let i=0;i<count;i++)assert.equal(P.purchase(save,id,'skills',node),true,`${id}/${node}`);}
function arena(id){const stats=P.stats(saveAt(),id),run=Sim.createRun(41,{random:()=>.9,builds:{[id]:{...stats,manualOnly:true,damage:100,baseDamage:100,weaponDamage:100,magicDamage:100,crit:0,speed:0,maxHp:1e6,maxMp:1e6,mpRegen:0,interval:1e9,[id+'Skills']:[]}}});
  Object.assign(run.hero,{manualOnly:true,hp:1e6,maxHp:1e6,damage:0,speed:0,cooldown:1e9,skill:1e9,x:180,y:438});
  const actor=run.allies.find(a=>a.type===id);Object.assign(actor,{x:240,y:438,cooldown:1e9});
  run.enemies=[{...run.enemies[0],id:'target',type:'cave-worm',x:460,y:438,hp:1e8,maxHp:1e8,damage:0,defense:0,speed:0,cooldown:1e9,expansionPlan:null}];
  return {run,actor,target:run.enemies[0]};
}
function cast(f,id,skill,enhance=0,stats={}){const spec=classes[id].spec(skill,1,enhance,stats),events=[];
  const start={ninja:Sim.startNinjaSkill,shaman:Sim.startShamanSkill,miko:Sim.startMikoSkill}[id];
  assert.equal(start(f.run,f.actor,spec,f.target,events,true),true);events.push(...Sim.update(f.run,spec.duration+1800));return {spec,events};
}

test('later characters have 21 dedicated upgrades and 11 common passives with working icons and level gates',()=>{
  for(const [id,skills] of Object.entries(classes)){
    assert.equal(skills.NODES.length,53);assert.equal(new Set(skills.NODES.map(n=>n.id)).size,53);
    const common=skills.NODES.filter(n=>n.kind==='passive'),upgrades=skills.NODES.filter(n=>n.kind==='enhancement');
    assert.equal(common.length,11);assert.equal(upgrades.length,21);assert.deepEqual(common.map(n=>n.unlockLevel),[1,7,12,22,32,42,52,62,72,82,92]);
    for(const n of [...common,...upgrades]){assert.equal(n.cost,1);assert.equal(n.maxRank,5);assert.ok(fs.existsSync(path.resolve(__dirname,'../public',n.icon)),n.icon);assert.ok(!/比較|説明|適用/.test(n.note));assert.equal(n.y,n.kind==='passive'?430:285);}
    const save=saveAt(30),parent=skills.ACTIVE.find(n=>n.unlockLevel===30),upgrade=parent.id+'-enhance';
    assert.equal(P.purchase(save,id,'skills',upgrade),false);buy(save,id,parent.id);assert.equal(P.purchase(save,id,'skills',upgrade),false);
    save.progression.characters[id].xp=P.experience(32);buy(save,id,upgrade,5);assert.equal(P.purchase(save,id,'skills',upgrade),false);
  }
});

test('passive ranks change real stats, save independently, and refund with dependent upgrades',()=>{
  for(const [id,skills] of Object.entries(classes)){
    for(const passive of skills.NODES.filter(n=>n.kind==='passive')){
      const save=saveAt(),before=P.stats(save,id);buy(save,id,passive.id,2);const after=P.stats(save,id);
      for(const [key,value] of Object.entries(passive.effect)){
        const percent=key.endsWith('Percent'),stat=key==='damagePercent'||key==='damage'?'baseDamage':percent?key.slice(0,-7):key;
        near(after[stat]-(before[stat]||0),2*value*(percent?before[stat]:1),id+'/'+key);
      }
    }
    const save=saveAt(),active=skills.ACTIVE[1].id,passive=skills.NODES.find(n=>n.kind==='passive').id,other=P.points(save,'warrior');
    buy(save,id,active,2);buy(save,id,active+'-enhance',3);buy(save,id,passive,2);buy(save,id,skills.ACTIVE[0].id+'-enhance',2);
    const restored=D.readSave(JSON.stringify(save));assert.deepEqual({...restored.progression.characters[id],skills:[...restored.progression.characters[id].skills].sort()},{...save.progression.characters[id],skills:[...save.progression.characters[id].skills].sort()});
    assert.equal(P.decreaseSkill(restored,id,active),1);assert.equal(P.rank(restored,id,active+'-enhance'),3);
    assert.equal(P.decreaseSkill(restored,id,active),4);assert.equal(P.rank(restored,id,active+'-enhance'),0);assert.equal(P.rank(restored,id,passive),2);
    P.respec(restored,id);assert.equal(P.points(restored,id),100);assert.equal(P.points(restored,'warrior'),other);assert.equal(P.rank(restored,id,skills.ACTIVE[0].id),1);
  }
});

test('dedicated upgrades reach equipped builds, affect only their own skill and keep world limits',()=>{
  for(const [id,skills] of Object.entries(classes)){
    const save=saveAt(),active=skills.ACTIVE[1].id,second=skills.ACTIVE[2].id;buy(save,id,active);buy(save,id,second);
    const before=P.stats(save,id);buy(save,id,active+'-enhance',5);const after=P.stats(save,id);
    assert.equal(after[id+'Skills'].find(s=>s.id===active).enhance,5);assert.deepEqual(after[id+'Skills'].find(s=>s.id===second),before[id+'Skills'].find(s=>s.id===second));
    assert.deepEqual(after[id+'Normal'],before[id+'Normal']);buy(save,id,skills.ACTIVE[0].id+'-enhance',5);assert.equal(P.stats(save,id)[id+'Normal'].enhance,5);
    for(const row of skills.ACTIVE)for(const rank of [1,5]){
      const a=skills.spec(row.id,rank),b=skills.spec(row.id,rank,5),fast=skills.spec(row.id,rank,5,{attackSpeed:100});
      assert.ok(b.duration<a.duration);assert.ok(fast.duration>=180-1e-8);assert.equal(b.cooldown,a.cooldown);assert.equal(b.mp,a.mp);
      for(const key of ['count','targetCount','cloneCount','echoCount','marks','consume','targets','bolts','period','sharedWait','controlDuration'])assert.equal(b[key],a[key],id+'/'+row.id+'/'+key);
      if(a.power)near(b.power/a.power,1.5,row.id);if(a.clonePower)near(b.clonePower/a.clonePower,1.5,row.id);if(a.echoPower)near(b.echoPower/a.echoPower,1.5,row.id);
      assert.ok(b.events.every((at,i)=>at<=b.duration&&(i===0||at>b.events[i-1])),row.id);
      assert.ok(!/NaN|Infinity|説明|比較|適用/.test(skills.parameters(b)),row.id);
    }
  }
});

test('normal upgrades increase actual projectile damage for all three characters',()=>{
  for(const [id,skills] of Object.entries(classes)){
    const a=cast(arena(id),id,skills.ACTIVE[0].id),b=cast(arena(id),id,skills.ACTIVE[0].id,5);
    const total=out=>out.events.filter(e=>e.type==='damage'&&e.source===id).reduce((sum,e)=>sum+e.amount,0);
    assert.ok(total(a)>0);assert.equal(total(a),Math.round(100*a.spec.power));assert.equal(total(b),Math.round(100*b.spec.power));assert.ok(total(b)>total(a));
  }
});

test('ninja clone and echo upgrades use their enhanced snapshots without increasing clone limits',()=>{
  const f=arena('ninja');cast(f,'ninja','shadow-clone',5);assert.equal(f.run.ninjaClones.length,1);near(f.run.ninjaClones[0].damage,60,'clone');
  const echo=arena('ninja');cast(echo,'ninja','shadow-echo',5);near(echo.actor.ninjaEcho.power,.525,'echo');assert.equal(echo.actor.ninjaEcho.remaining,4);
});

test('shaman upgrades strengthen mark, deep and field damage while preserving curse caps and lifetimes',()=>{
  const C=require('../public/js/combat/shaman-combat.js'),skills=classes.shaman;
  const f=arena('shaman');cast(f,'shaman','curse-mark',5);near(C.marks(f.target,f.run.time)[0].damage,30,'mark damage');
  for(const skill of ['grudge-flame','erosion-field','pain-hex','curse-burst','hundred-hex']){
    const a=skills.spec(skill),b=skills.spec(skill,1,5);assert.equal(b.lifetime,a.lifetime);assert.equal(b.pulses,a.pulses);
    for(const key of ['markPower','deepPower','pulsePower','extra','perMark','finalPower'])if(a[key])near(b[key]/a[key],1.5,skill+'/'+key);
  }
});

test('miko recovery and barrier passives affect live support while HP caps, contracts and periods hold',()=>{
  const skills=classes.miko,C=require('../public/js/combat/miko-combat.js');
  const save=saveAt();buy(save,'miko','white-deer');buy(save,'miko','guardian-bear');
  const before=P.stats(save,'miko');buy(save,'miko','grace',5);buy(save,'miko','protection',5);buy(save,'miko','white-deer-enhance',5);buy(save,'miko','guardian-bear-enhance',5);
  const after=P.stats(save,'miko'),deer=after.mikoSkills.find(s=>s.id==='white-deer'),bear=after.mikoSkills.find(s=>s.id==='guardian-bear');
  buy(save,'miko','reach',2);near(P.stats(save,'miko').mikoSkills.find(s=>s.id==='white-deer').reach-deer.reach,24,'healing reach');
  near(deer.heal/before.mikoSkills.find(s=>s.id==='white-deer').heal,1.8,'heal');near(bear.barrier/before.mikoSkills.find(s=>s.id==='guardian-bear').barrier,1.8,'barrier');
  const f=arena('miko');f.run.hero.hp=500000;const events=[];C.summon(f.run,f.actor,deer,events);assert.equal(f.run.mikoContracts[0].units.length,1);
  near(f.run.hero.hp-500000,f.actor.damage*deer.openingHeal,'opening heal');C.possess(f.run,f.actor,bear,f.run.hero,events);near(f.run.hero.mikoBarrier.amount,f.actor.damage*bear.barrier,'live barrier');
  assert.equal(deer.cap,skills.spec('white-deer').cap);assert.equal(bear.cap,skills.spec('guardian-bear').cap);assert.equal(deer.period,3000);assert.equal(bear.period,3000);
});
