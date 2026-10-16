'use strict';
const D = require('../../public/js/data/forest-data.js');
const P = require('../../public/js/core/forest-progression.js');
const Rift = require('../../public/js/data/special-stages.js');
const C = require('../../public/js/core/forest-conversion.js');

function expectedRewards(specialId = Rift.ID) {
  const stage = D.SPECIAL_STAGES.find(s => s.id === specialId);
  const materials = {};
  let killGold = 0;
  for (const id of Rift.definition(specialId).BATCHES.flat(2)) {
    killGold += D.ENEMIES[id].gold;
    // Integrate the existing 30% / 100% material rolls without sampling noise.
    for (const [roll, weight] of [[.15, .3], [.65, .7]]) {
      for (const item of D.rollMaterials(id, () => roll)) {
        materials[item] = (materials[item] || 0) + weight;
      }
    }
  }
  return { materials, killGold, clearGold: stage.reward, gold: killGold + stage.reward };
}

function gearBudget(character = 'warrior', slot = 'weapon', specialId = Rift.ID) {
  const stage = D.SPECIAL_STAGES.find(s => s.id === specialId);
  const nodes = P.allGearTrees(character, slot).filter(n => stage.materialRegions.includes(Math.ceil(n.stage/10)));
  const costs = {};
  for (const node of nodes) for (const [item, amount] of Object.entries(node.cost)) {
    costs[item] = (costs[item] || 0) + amount;
  }
  return { nodes, costs };
}

function convertedBudget(clears, goldPerClear, specialId = Rift.ID) {
  const stage = D.SPECIAL_STAGES.find(s => s.id === specialId);
  const { materials } = expectedRewards(specialId), { costs } = gearBudget('warrior','weapon',specialId);
  const save = D.freshSave();
  save.cleared = Array.from({ length: stage.unlockStage }, (_, i) => i + 1);
  save.gold = clears * goldPerClear;
  save.inventory = Object.fromEntries(Object.entries(materials).map(([item, amount]) =>
    [item, Math.floor(clears * amount + 1e-9)]));
  const conversions = [];
  // Reserve the tree's crystal cost, then spend only the surplus on deficits.
  for (const region of C.REGIONS.filter(r => stage.materialRegions.includes(r.id))) {
    for (const recipe of C.RECIPES.filter(r => r.region === region.id &&
      ['crystal-common', 'crystal-rare'].includes(r.category))) {
      const deficit = (costs[recipe.output] || 0) - (save.inventory[recipe.output] || 0);
      const times = Math.max(0, Math.ceil(deficit / recipe.amount));
      if (!times) continue;
      const crystals = times * recipe.inputs[region.crystal];
      if (save.inventory[region.crystal] - crystals < costs[region.crystal] ||
        !C.convert(save, recipe.id, times)) return { save, conversions, enoughMaterials: false };
      conversions.push({ recipe: recipe.id, times });
    }
  }
  const enoughMaterials = Object.entries(costs).filter(([item]) => item !== 'gold')
    .every(([item, amount]) => save.inventory[item] >= amount);
  return { save, conversions, enoughMaterials };
}

function report(specialId = Rift.ID) {
  const stage = D.SPECIAL_STAGES.find(s => s.id === specialId);
  const rewards = expectedRewards(specialId), { costs } = gearBudget('warrior','weapon',specialId);
  const oldGold = rewards.killGold + D.STAGES.find(s => s.id === stage.unlockStage).reward;
  const rawMaterialClears = Math.max(...Object.entries(costs).filter(([item]) => item !== 'gold')
    .map(([item, amount]) => amount / rewards.materials[item]));
  let convertedMaterialClears = 1;
  while (!convertedBudget(convertedMaterialClears, rewards.gold, specialId).enoughMaterials) convertedMaterialClears++;
  return { rewards, costs, rawMaterialClears, convertedMaterialClears,
    oldGold, oldGoldClears: costs.gold / oldGold, goldClears: costs.gold / rewards.gold,
    oldGoldShortfall: costs.gold - convertedMaterialClears * oldGold,
    newGoldSurplus: convertedMaterialClears * rewards.gold - costs.gold };
}

if (require.main === module) console.log(JSON.stringify(report(process.argv.includes('--chaos') ? Rift.CHAOS.ID : Rift.ID), null, 2));
module.exports = { expectedRewards, gearBudget, convertedBudget, report };
