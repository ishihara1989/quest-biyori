'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../public/js/core/gem-system.js'),P=require('../public/js/core/forest-progression.js'),D=require('../public/js/data/forest-data.js');
const families=Object.keys(G.OPTIONS).filter(key=>G.TYPES['rare-'+key]);
const roll=(rarity,family,level,quality=1)=>({...G.generate({rarity,family,level,random:()=>0}),quality});

test('all rare drops and crafts have capacity 100, including former size requests and quality boundaries',()=>{
  const save=D.freshSave();save.cleared=D.STAGES.map(s=>s.id);
  for(let level=1;level<=10;level++)for(const family of families){
    for(const size of [.25,.5,1])for(const random of [()=>0,()=>.5,()=>1-Number.EPSILON]){
      const gem=G.generate({rarity:'rare',family,level,size,random});
      assert.equal(gem.size,1);assert.deepEqual(gem.options,[{key:family,weight:.5}]);
      assert.deepEqual(G.validate(gem),gem);assert.deepEqual(G.describe(gem).costs,{[G.OPTIONS[family].direction]:100});
    }
    Object.assign(save.inventory,G.craftRecipe('rare',level,family));
    const gem=G.craft(save,'rare',level,family,()=>0);
    assert.equal(Object.values(G.describe(gem).costs).reduce((a,b)=>a+b,0),100);
    assert.equal(G.salvage(gem),10*level);
    if(level<10){const target=level+1;assert.ok(G.upgradeRecipe(gem,target)[G.shardKey('rare')]>G.salvage({...gem,level:target})-G.salvage(gem));}
  }
});

test('every shared base effect improves in capacity efficiency at higher rarity even across quality extremes and rounding',()=>{
  for(let level=1;level<=10;level++)for(const family of families){
    const tiers=['rare','unique',...(level>=6?['legendary']:[])];
    for(let i=1;i<tiers.length;i++){
      const low=roll(tiers[i-1],family,level,1.05),high=roll(tiers[i],family,level,.95),key=G.OPTIONS[family].key;
      // Charge the effect its allocated capacity; round against the higher tier.
      const share=gem=>G.TIERS[gem.rarity].capacity*gem.options[0].weight/G.TIERS[gem.rarity].units;
      const lowEfficiency=G.describe(low).effect[key]/Math.floor(share(low));
      const highEfficiency=G.describe(high).effect[key]/Math.ceil(share(high));
      assert.ok(highEfficiency>lowEfficiency,JSON.stringify({level,family,tiers:[tiers[i-1],tiers[i]],lowEfficiency,highEfficiency}));
    }
    const general=G.describe(roll('rare','attack',level));
    if(['physical','magic'].includes(family))assert.ok(G.describe(roll('rare',family,level)).effect[G.OPTIONS[family].key]>general.effect.damage);
  }
});

test('specialized attack bonuses receive equipment and passive power multipliers for all jobs',()=>{
  for(const job of Object.keys(P.CHARACTERS))for(const fullGear of [false,true]){
    const save=D.freshSave();save.cleared=D.STAGES.map(s=>s.id);
    const state=save.progression.characters[job];state.xp=P.experience(100);
    if(fullGear){for(const slot of ['weapon','armor'])state[slot]=P.allGearTrees(job,slot).map(n=>n.id);
      for(const skill of P.SKILLS[job].filter(n=>n.kind==='passive')){state.skills.push(skill.id);state.skillRanks[skill.id]=skill.maxRank||1;}}
    const before=P.stats(save,job),family=['mage','shaman','miko'].includes(job)?'magic':'physical';
    const general=P.addGem(save,roll('rare','attack',10)),special=P.addGem(save,roll('rare',family,10));
    assert.ok(P.equipGem(save,job,'weapon',general.id));const all=P.stats(save,job);P.unequipGem(save,job,'weapon',general.id);
    assert.ok(P.equipGem(save,job,'weapon',special.id));const limited=P.stats(save,job);
    assert.ok(limited.damage-before.damage>all.damage-before.damage,job+'/'+fullGear);
    assert.equal(limited.baseDamage,before.baseDamage);
    const power=family==='magic'?limited.magicPower:limited.weaponPower;
    const expected=G.describe(special).effect[G.OPTIONS[family].key]*(1+(power||0));
    assert.ok(Math.abs(limited.damage-before.damage-expected)<1e-8);
  }
});

test('old rare sizes normalize once, retain identities, locks and quality, and preserve higher tiers',()=>{
  const save=D.freshSave();save.cleared=D.STAGES.map(s=>s.id);save.gold=123;save.inventory.wood=42;
  for(const size of [.25,.5,1])for(const family of families){
    const old=roll('rare',family,4,1.037);Object.assign(old,{id:save.nextGemId++,size,locked:true,options:[{key:family,weight:size}]});save.gems.push(old);
  }
  const unique=P.addGem(save,roll('unique','physical',4));
  const legacy=save.gems.find(g=>g.family==='physical');save.progression.characters.warrior.gems.weapon=[legacy.id];
  const original=structuredClone(save),restored=D.readSave(JSON.stringify(save));
  assert.deepEqual(save,original);assert.equal(restored.gems.length,save.gems.length);
  for(const gem of restored.gems.filter(g=>g.rarity==='rare')){
    const old=save.gems.find(g=>g.id===gem.id);
    assert.deepEqual(gem,{...old,size:1,options:[{key:old.family,weight:.5}]});assert.equal(Object.values(G.describe(gem).costs)[0],100);
  }
  assert.deepEqual(restored.gems.find(g=>g.id===unique.id),unique);
  assert.deepEqual(restored.progression.characters.warrior.gems.weapon,[legacy.id]);
  assert.equal(restored.gold,123);assert.equal(restored.inventory.wood,42);
  assert.deepEqual(D.readSave(JSON.stringify(restored)),restored);
  for(const weight of [0,-1,.3,999])assert.equal(G.validate({...legacy,options:[{key:legacy.family,weight}]}),null);
});

test('normalization keeps every former small gem in inventory and unequips only capacity overflow',()=>{
  const save=D.freshSave();
  for(let id=1;id<=8;id++){const raw={...roll('rare','physical',1),id,size:.25,options:[{key:'physical',weight:.25}]};save.gems.push(raw);save.progression.characters.warrior.gems.weapon.push(id);}
  save.nextGemId=9;const restored=D.readSave(JSON.stringify(save));
  assert.equal(restored.gems.length,8);assert.deepEqual(restored.progression.characters.warrior.gems.weapon,[1,2,3,4]);
  assert.ok(P.gemUsage(restored,'warrior','weapon').fits);assert.deepEqual(D.readSave(JSON.stringify(restored)),restored);
});

test('legendary treasure hunt follows ordinary affix growth for primary and secondary rolls without quality variance',()=>{
  for(let level=6;level<=10;level++)for(const quality of [.95,1,1.05]){
    const unique=roll('unique','fortune',level,quality),primary=roll('legendary','fortune',level,quality);
    const secondary=roll('legendary','physical',level,quality);secondary.options.at(-1).key='fortune';
    const base=Number((.1+.02*level).toFixed(5)),expected=Number((base*1.184/1.15).toFixed(5));
    assert.equal(G.describe(unique).effect.treasureHunt,base);
    for(const gem of [primary,secondary]){
      assert.ok(G.validate(gem));assert.equal(G.describe(gem).effect.treasureHunt,expected);assert.ok(expected>base);
      assert.equal(Object.values(G.describe(gem).costs).reduce((a,b)=>a+b,0),580);
      const raw=G.describe(gem).effect.treasureHunt/(580*1.184/5.152),previous=base/170;
      const ordinaryGrowth=(1.184/(580*1.184/5.152))/(1.15/170);
      assert.ok(Math.abs(raw/previous-ordinaryGrowth)<.00005);
    }
  }
  const save=D.freshSave();save.cleared=D.STAGES.map(s=>s.id);
  save.progression.characters.warrior.weapon=P.allGearTrees('warrior','weapon').map(n=>n.id);
  const gem=P.addGem(save,roll('legendary','fortune',10));assert.ok(P.equipGem(save,'warrior','weapon',gem.id));
  const restored=D.readSave(JSON.stringify(save));assert.deepEqual(restored.gems,save.gems);assert.deepEqual(restored.progression.characters.warrior.gems,save.progression.characters.warrior.gems);assert.deepEqual(D.readSave(JSON.stringify(restored)),restored);
  const hunt=P.stats(restored,'warrior').treasureHunt;assert.equal(hunt,.30887);
  assert.ok(Math.abs(D.gemDropRates(6,hunt).rare-.05*(1+hunt))<1e-12);
});
