'use strict';
((root, factory) => {
  const commonJS = typeof module === 'object' && module.exports;
  const api = factory(commonJS ? require('../data/forest-data.js') : root.ForestData, commonJS ? require('../core/forest-conversion.js') : root.ForestConversion);
  if (commonJS) module.exports = api;
  else root.ForestUnlocks = api;
})(globalThis, (D, C) => {
  // Compare availability before the award; owned resources never affect unlocks.
  function collect(save, stageId) {
    const stage = D.ALL_STAGES.find(row => row.id === stageId);
    if (!stage || save.cleared.includes(stageId)) return [];
    if(stage.special)return D.SPECIAL_STAGES.filter(s=>s.unlockStage===stageId).map(s=>({id:s.id,icon:'spark',title:s.realmName,detail:s.name,target:'stages',stage:s.id,special:true,final:!!s.final}));
    const after = new Set([...save.cleared, stageId]), entries = [], region = D.REGIONS[stage.region - 1];
    if (stage.number === 1) entries.push({ id: 'forge-' + region.id, icon: 'sword', title: region.name + ' / 鍛冶', detail: '武器・防具', target: 'forge', region: region.id });
    const recipes = C.RECIPES.filter(recipe => recipe.stages.every(id => after.has(id)) && !recipe.stages.every(id => save.cleared.includes(id)));
    if (recipes.length) entries.push({ id: 'recipes-' + stageId, icon: 'repeat', title: region.name + ' / 変換・購入', detail: '素材変換 +' + recipes.filter(row => !row.gold).length + ' / コモン購入 +' + recipes.filter(row => row.gold).length, target: 'inventory', region: region.id, recipes: recipes.map(row => row.id) });
    if (stageId === 10) entries.push({ id: 'auto-gear', icon: 'spark', title: '自動強化', detail: '設定 / 優先度', target: 'options' });
    if (stageId === 50) entries.push({ id: 'gem-workshop', icon: 'gem', title: '工房', detail: 'ジェム / 合成・解体・強化・変換', target: 'gems' });
    for (const special of D.SPECIAL_STAGES) if (special.unlockStage === stageId) entries.unshift({ id: special.id, icon: 'spark', title: special.realmName, detail: '特殊ステージ / ' + special.name, target: 'stages', stage: special.id, special: true });
    if (stage.number === 10 && D.REGIONS[stage.region]) entries.push({ id: 'region-' + (stage.region + 1), icon: 'map', title: D.REGIONS[stage.region].name, detail: '新地域', target: 'stages', region: stage.region + 1 });
    return entries;
  }
  return { collect };
});
