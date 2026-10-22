'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../tools/balance/measure-seal-reward-route.cjs'),P=require('../public/js/core/forest-progression.js'),T=require('../public/js/data/reincarnation-tree-data.js');
test('the 8000 PT phase owns every cheap node, keeps both first-clear bonuses and fits half-capacity gems',()=>{
 const {save,gems,details}=M.fixture(8,{allCheap:true});
 const cheap=T.nodes.filter(n=>!n.root&&n.cost<=8000).map(n=>n.id);assert.deepEqual(new Set(save.reincarnation.owned),new Set(cheap));
 assert.equal(P.permanent(save).damage,20*1.5*100);assert.equal(P.permanent(save).hp,20*1.5*100);
 for(const job of Object.keys(P.CHARACTERS)){assert.equal(details[job].totalSp,260);assert.equal(details[job].spMultiplier,2.6);assert.ok(P.gemUsage(save,job,'weapon').fits);assert.ok(P.gemUsage(save,job,'armor').fits);}
 assert.ok(gems.every(g=>g.capacity===2200&&g.fill>=.4&&g.fill<=.5));
});
test('hypothetical SP reward multiplies every damage channel and HP without mutating saves or the gem decoder',()=>{
 const {save}=M.fixture(8,{allCheap:true,rewards:false}),before=JSON.stringify(save),decoder=P.Gem.describe;
 const {builds}=M.rewardBuilds(save,{gems:false,sp:true});
 for(const job of Object.keys(P.CHARACTERS)){const base=P.stats(save,job);for(const key of ['baseDamage','damage','weaponDamage','magicDamage','skillDamage','maxHp'])assert.ok(Math.abs(builds[job][key]/base[key]-2.6)<1e-10);}
 assert.equal(P.Gem.describe,decoder);assert.equal(JSON.stringify(save),before);
});
test('legendary-equivalent reward contains no epic effects and respects class compatibility',()=>{
 const warrior=M.legendaryReward('warrior'),mage=M.legendaryReward('mage');
 assert.ok(warrior.weaponFlat>0);assert.equal(warrior.magicFlat,undefined);assert.ok(mage.magicFlat>0);assert.equal(mage.weaponFlat,undefined);
 for(const job of Object.keys(P.CHARACTERS)){const effect=M.legendaryReward(job);assert.ok(effect.maxHp>0&&effect.damage>0&&effect.defense>0&&effect.gemSiphon>0);assert.ok(!Object.keys(effect).some(key=>key.startsWith('epic')));}
});
