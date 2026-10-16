'use strict';
((root, factory) => {
  const api = factory(typeof module === 'object' && module.exports ? require('./forest-progression.js') : root.ForestProgression);
  if (typeof module === 'object' && module.exports) module.exports = api; else root.ForestGemInventory = api;
})(globalThis, P => {
  const defaults = () => ({ search: '', rarity: 'all', level: 'all', effect: 'all', sort: 'rarity', descending: true, compatible: false, protectedOnly: false });
  function query(save, character, slot, settings = defaults()) {
    settings = { ...defaults(), ...settings };
    const owners = new Map();
    for (const [id, state] of Object.entries(save.progression.characters)) for (const part of ['weapon', 'armor'])
      for (const uid of state.gems[part]) owners.set(uid, { character: id, slot: part });
    const rows = save.gems.map(gem => ({ gem, info: P.Gem.describe(gem), owner: owners.get(gem.id) || null }));
    const direction = settings.descending ? -1 : 1;
    const value = row => settings.sort === 'level' ? row.gem.level || 0
      : settings.sort === 'newest' ? row.gem.id
      : settings.sort === 'capacity' ? Object.values(row.info.costs).reduce((a, b) => a + b, 0)
      : settings.sort === 'effect' ? row.info.effect[P.Gem.OPTIONS[settings.effect]?.key || settings.effect] || 0
      : P.Gem.TIERS[row.gem.rarity].rank;
    const compare = (a, b) => direction * (value(a) - value(b)) || b.gem.id - a.gem.id;
    const equipped = rows.filter(row => row.owner?.character === character && row.owner.slot === slot).sort(compare);
    const otherGroups = [];
    for (const id of Object.keys(P.CHARACTERS)) for (const part of ['weapon', 'armor']) {
      if (id === character && part === slot) continue;
      const gems = rows.filter(row => row.owner?.character === id && row.owner.slot === part).sort(compare);
      if (gems.length) otherGroups.push({ character: id, slot: part, gems });
    }
    const usage = settings.compatible ? P.gemUsage(save, character, slot) : null;
    const fits = row => {
      if (!row.info.jobs.includes(character) || row.info.slot && row.info.slot !== slot) return false;
      const cost = P.gemCosts(save, character, slot, row.gem.id, usage.cap);
      const common = P.GEM_DIRECTIONS.reduce((sum, dir) => sum + Math.max(0, usage.used[dir] + (cost[dir] || 0) - usage.cap[dir]), 0);
      return common <= usage.cap.common && usage.used.dedicated + (cost.dedicated || 0) <= usage.cap.dedicated;
    };
    const search = (settings.search || '').trim().toLocaleLowerCase('ja-JP');
    const bag = rows.filter(row => !row.owner
      && (!search || (row.info.name + ' ' + row.info.note).toLocaleLowerCase('ja-JP').includes(search))
      && (settings.rarity === 'all' || row.gem.rarity === settings.rarity)
      && (settings.level === 'all' || String(row.gem.level) === settings.level)
      && (settings.effect === 'all' || row.gem.options.some(o => o.key === settings.effect))
      && (!usage || fits(row)) && (!settings.protectedOnly || row.gem.locked)).sort(compare);
    return { equipped, otherGroups, bag, owners, totalBag: rows.filter(row => !row.owner).length };
  }
  return { defaults, query };
});
