'use strict';
((root, factory) => {
  const common = typeof module === 'object' && module.exports;
  const api = factory(common ? require('../data/forest-data.js') : root.ForestData,
    common ? require('./forest-progression.js') : root.ForestProgression);
  if (common) module.exports = api; else root.ForestRunRewards = api;
})(globalThis, (D, P) => {
  const Trials = typeof module === 'object' && module.exports ? require('./trials.js') : globalThis.Trials;
  function create(run) {
    return { enemies: new Map(), gold: 0, goldRemainder: run.goldRemainder, settled: false,
      hunt: [run.hero, ...run.allies].reduce((sum, actor) => sum + (actor.treasureHunt || 0), 0)+(run.reincarnationBonuses?.rate||0)/100,
      countMultiplier: run.reincarnationBonuses?.drop || 1, trialMultiplier: run.trials?.reward || 1,
      dropLevel: run.stage.dropLevel, multiplier: run.stage.gemMultiplier };
  }
  function record(pending, event) {
    if (pending.settled || event.type !== 'loot') return;
    pending.enemies.set(event.enemy, (pending.enemies.get(event.enemy) || 0) + 1);
    pending.gold += event.gold;
    pending.goldRemainder = event.goldRemainder;
  }
  function settle(save, pending, victory, random = Math.random) {
    if (pending.settled) return null;
    pending.settled = true;
    const result = { loot: {}, gems: [], gold: 0, dismantled: 0 };
    if (!victory) { pending.enemies.clear(); return result; }
    const add = (id, count = 1) => { result.loot[id] = (result.loot[id] || 0) + count; };
    // The original per-enemy odds are evaluated only after a clear. Pending
    // rewards are never added to the player's persistent save during combat.
    for (const [enemy, count] of pending.enemies) for (let i = 0; i < count; i++) {
      for (const id of D.rollMaterials(enemy, random, pending.hunt)) {
        const count = Trials.count(pending.countMultiplier, pending.trialMultiplier || 1, random);
        if (count) { save.inventory[id] = (save.inventory[id] || 0) + count; add(id,count); }
      }
      for (const rolled of D.rollGems(enemy, random, pending.hunt, { level: pending.dropLevel, multiplier: pending.multiplier })) {
       const copies = Trials.count(pending.countMultiplier, pending.trialMultiplier || 1, random);
       for(let copy=0;copy<copies;copy++){
        const gem = P.addGem(save, copy===0?rolled:P.Gem.generate({rarity:rolled.rarity,level:rolled.level,random}));
        if (!gem) continue;
        const deferred=save.reincarnation?.unlocked&&save.reincarnation.automation.gems;
        if(deferred)(result.deferred ||= []).push(gem.id);
        const dismantled = deferred?false:P.Gem.autoDismantle(save, gem.id);
        if (dismantled) {
          result.dismantled++;
          for (const [id, amount] of Object.entries(dismantled.shards)) add(id, amount);
        } else { result.gems.push(gem); add('gem-instance-' + gem.id); }
       }
      }
    }
    save.gold += pending.gold; save.goldRemainder = pending.goldRemainder;
    result.gold = pending.gold; pending.enemies.clear();
    return result;
  }
  function finishDismantle(save,result){
    for(const id of result.deferred||[]){const dismantled=P.Gem.autoDismantle(save,id);if(!dismantled)continue;result.dismantled++;delete result.loot['gem-instance-'+id];result.gems=result.gems.filter(g=>g.id!==id);for(const [key,n] of Object.entries(dismantled.shards))result.loot[key]=(result.loot[key]||0)+n;}
    delete result.deferred;return result;
  }
  return { create, record, settle, finishDismantle };
});
