'use strict';
((root, factory) => {
  const api = factory(typeof module === 'object' && module.exports ? require('../data/forest-data.js') : root.ForestData);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ForestConversion = api;
})(globalThis, D => {
  const CATEGORIES = Object.freeze([
    { id: 'common-crystal', from: 'コモン', to: '結晶' },
    { id: 'crystal-common', from: '結晶', to: 'コモン' },
    { id: 'crystal-rare', from: '結晶', to: '大ボス' },
    { id: 'rare-crystal', from: '大ボス', to: '結晶' },
    { id: 'rare-common', from: '大ボス', to: 'コモン' },
  ].map(Object.freeze));
  // Use every possible material drop, independently of the player's drop luck.
  const stageMaterials = new Map(D.STAGES.map(stage => [stage.id,
    new Set(stage.enemies.flatMap(enemy => D.rollMaterials(enemy, () => 0)))]));
  const REGIONS = Object.freeze(D.REGIONS.map(region => {
    const stages = D.STAGES.filter(stage => stage.region === region.id);
    const items = D.ITEMS.filter(item => item.type === 'material' && stages.some(stage => stageMaterials.get(stage.id).has(item.id)));
    return Object.freeze({ id: region.id, name: region.name, crystal: region.crystal,
      common: Object.freeze(items.filter(item => item.rarity === 'common').map(item => item.id)),
      rare: items.find(item => item.rarity === 'rare')?.id,
      unlockStage: stages.find(stage => stage.number === 10).id,
    });
  }));
  function recipe(region, category, inputs, output, amount) {
    const stages = [region.unlockStage];
    return Object.freeze({ id: region.id + '-' + category + '-' + output, region: region.id, category,
      inputs: Object.freeze(inputs), output, amount, stages: Object.freeze(stages) });
  }
  const RECIPES = Object.freeze(REGIONS.flatMap(region => [
    recipe(region, 'common-crystal', Object.fromEntries(region.common.map(id => [id, 2])), region.crystal, 1),
    ...region.common.map(id => recipe(region, 'crystal-common', { [region.crystal]: 1 }, id, 3)),
    ...(region.rare ? [
      recipe(region, 'crystal-rare', { [region.crystal]: 5 }, region.rare, 1),
      recipe(region, 'rare-crystal', { [region.rare]: 1 }, region.crystal, 3),
      ...region.common.map(id => recipe(region, 'rare-common', { [region.rare]: 1 }, id, 9)),
    ] : []),
  ]));
  const integer = n => Number.isSafeInteger(n) && n >= 0;
  function plan(save, recipeId, times = 1) {
    const recipe = RECIPES.find(row => row.id === recipeId);
    const result = { recipe, times, status: 'unknown', max: 0, lockedStages: [] };
    if (!recipe) return result;
    result.lockedStages = recipe.stages.filter(id => !save.cleared.includes(id));
    if (result.lockedStages.length) return { ...result, status: 'locked' };
    if (!integer(times) || !times || !save.inventory) return { ...result, status: 'invalid' };
    const counts = [...Object.keys(recipe.inputs), recipe.output].map(id => save.inventory[id] ?? 0);
    if (!counts.every(integer)) return { ...result, status: 'invalid' };
    const resources = Math.min(...Object.entries(recipe.inputs).map(([id, amount]) => Math.floor((save.inventory[id] ?? 0) / amount)));
    const room = Math.floor((Number.MAX_SAFE_INTEGER - (save.inventory[recipe.output] ?? 0)) / recipe.amount);
    result.max = Math.min(resources, room);
    result.status = times > resources ? 'cost' : times > room ? 'overflow' : 'available';
    return result;
  }
  function convert(save, recipeId, times = 1) {
    const transaction = plan(save, recipeId, times);
    if (transaction.status !== 'available') return false;
    const { recipe } = transaction;
    for (const [id, amount] of Object.entries(recipe.inputs)) save.inventory[id] = (save.inventory[id] ?? 0) - amount * times;
    save.inventory[recipe.output] = (save.inventory[recipe.output] ?? 0) + recipe.amount * times;
    return true;
  }
  return { CATEGORIES, REGIONS, RECIPES, plan, convert };
});
