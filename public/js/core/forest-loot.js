'use strict';
((root, factory) => {
  const api = factory(typeof module === 'object' && module.exports ? require('../data/forest-data.js') : root.ForestData);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ForestLoot = api;
})(typeof globalThis === 'object' ? globalThis : this, ({ ITEMS, RARITIES }) => {
  const CHEST_END = 1500, REPEAT_DELAY = 5000;
  function presentation(loot, gold, { reduced = false, gemItems = [] } = {}) {
    const entries = [...ITEMS, ...gemItems].filter(item => (loot[item.id] || 0) > 0)
      .sort((a, b) => RARITIES[a.rarity].rank - RARITIES[b.rarity].rank)
      .map(item => ({ ...item, count: loot[item.id] }));
    const groups = [];
    let at = reduced ? 0 : CHEST_END;
    for (const [rarity, info] of Object.entries(RARITIES)) {
      const rows = entries.filter(item => item.rarity === rarity);
      if (!rows.length) continue;
      groups.push({ rarity, at, count: rows.length });
      for (const row of rows) { row.at = at; at += reduced ? 0 : 250 + info.rank * 110; }
      at += reduced ? 0 : 300;
    }
    const completeAt = reduced ? 0 : Math.max(CHEST_END, at + 650);
    return { entries, groups, gold, completeAt, repeatAt: completeAt + REPEAT_DELAY };
  }
  function chestFrame(age, reduced = false) {
    if (reduced) return 3;
    return age < 350 ? 0 : age < 650 ? 1 : age < 1000 ? 2 : 3;
  }
  return { CHEST_END, REPEAT_DELAY, presentation, chestFrame };
});
