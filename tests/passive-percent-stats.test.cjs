'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),P=require('../public/js/core/forest-progression.js'),Sim=require('../public/js/combat/forest-simulation.js');
const jobs=Object.keys(P.CHARACTERS),keys=['damage','maxHp','defense','maxMp','mpRegen'];
const statKey=k=>k==='damage'?'baseDamage':k;
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${label}: ${a} / ${b}`);
function fixture(level=100,gear=false){const save=D.freshSave();save.cleared=D.ALL_STAGES.map(s=>s.id);for(const id of jobs){const c=save.progression.characters[id];c.xp=P.experience(level);if(gear)for(const slot of ['weapon','armor'])c[slot]=P.allGearTrees(id,slot).map(n=>n.id);}return save;}
function buy(save,id,node,count=1){for(let i=0;i<count;i++)assert.ok(P.purchase(save,id,'skills',node),id+'/'+node);}

test('all six jobs scale growing stats at unlock level and with late equipment for ranks 1 through 5',()=>{
  for(const id of jobs)for(const node of P.SKILLS[id].filter(n=>n.kind==='passive'&&keys.some(k=>n.effect[k+'Percent']))){
    for(const gear of [false,true]){
      const save=fixture(gear?100:Math.max(5,node.unlockLevel,P.CHARACTERS[id].unlock),gear),before=P.stats(save,id);
      assert.ok(keys.every(k=>!Object.hasOwn(node.effect,k)),'no flat growth stats');
      for(let rank=1;rank<=5;rank++){
        buy(save,id,node.id);const after=P.stats(save,id);
        for(const key of keys){const target=statKey(key);near(after[target],before[target]*(1+(node.effect[key+'Percent']||0)*rank),id+'/'+node.id+'/'+key+'/'+rank);}
        assert.ok(node.note.includes('% / Lv'));assert.ok(!/説明|比較|適用/.test(node.note));
      }
      assert.equal(P.purchase(save,id,'skills',node.id),false);
    }
  }
});

test('attack passives scale general and typed gem additions once, before weapon and magic power',()=>{
  for(const id of jobs){
    const save=fixture(100,true),family=['mage','shaman','miko'].includes(id)?'magic':'physical';
    for(const f of ['attack',family]){const gem=P.addGem(save,P.Gem.generate({rarity:'rare',family:f,level:10,random:()=>.5}));assert.ok(P.equipGem(save,id,'weapon',gem.id));}
    const before=P.stats(save,id),node=P.SKILLS[id].find(n=>n.effect.damagePercent);
    assert.ok(before.weaponFlat>0||before.magicFlat>0);buy(save,id,node.id,5);const after=P.stats(save,id);
    for(const key of ['baseDamage','weaponDamage','magicDamage','damage','skillDamage'])near(after[key],before[key]*1.25,id+'/'+key);
    near(after.weaponFlat,before.weaponFlat,id+'/flat unchanged');
  }
});

test('same-stat passives add, survive saves and refunds, and reach new battles',()=>{
  for(const id of jobs){
    const save=fixture(100,true),before=P.stats(save,id),total={};
    for(const node of P.SKILLS[id].filter(n=>n.kind==='passive')){
      buy(save,id,node.id,5);for(const key of keys)total[key]=(total[key]||0)+(node.effect[key+'Percent']||0)*5;
    }
    const after=P.stats(save,id),restored=D.readSave(JSON.stringify(save));assert.deepEqual(P.stats(restored,id),after);
    for(const key of keys)near(after[statKey(key)],before[statKey(key)]*(1+total[key]),id+'/'+key);
    const run=Sim.createRun(100,{builds:Object.fromEntries(jobs.map(job=>[job,P.stats(restored,job)])),random:()=>.9});
    const actor=[run.hero,...run.allies].find(a=>a.type===id);for(const key of ['maxHp','maxMp','mpRegen','defense','damage'])near(actor[key],after[key],id+'/battle/'+key);
    const attack=P.SKILLS[id].find(n=>n.effect.damagePercent);assert.equal(P.decreaseSkill(restored,id,attack.id),1);
    near(P.stats(restored,id).baseDamage,before.baseDamage*1.2,id+'/refund');
    P.respec(restored,id);assert.deepEqual(P.stats(restored,id),before);assert.equal(P.points(restored,id),100);
  }
});

test('mage epic MP and MP-derived recovery combine with passive percentages in order',()=>{
  const save=fixture(100,true),id='mage',state=save.progression.characters[id];
  for(const slot of ['weapon','armor'])state[slot].push(...P.gearTree(id,slot,'goddess').map(n=>n.id));
  const gem=P.addGem(save,P.Gem.generate({rarity:'epic',family:'mage-armor'}));assert.ok(P.equipGem(save,id,'armor',gem.id));
  const before=P.stats(save,id);buy(save,id,'reserve',5);buy(save,id,'meditate',5);const after=P.stats(save,id);
  near(after.maxMp,before.maxMp*1.25,'epic MP');
  near(after.mpRegen,(before.mpRegen-before.maxMp*.05+after.maxMp*.05)*1.75,'epic recovery');
  assert.deepEqual(P.stats(D.readSave(JSON.stringify(save)),id),after);
});
