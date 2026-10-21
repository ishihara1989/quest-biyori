'use strict';
((root, factory) => {
  const api = factory(typeof module === 'object' && module.exports ? require('./forest-progression.js') : root.ForestProgression);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ForestAutoGear = api;
})(globalThis, P => {
  const KINDS = ['main', 'sub', 'unique'], CHARACTERS = Object.keys(P.CHARACTERS);
  const fresh = () => ({ enabled: false, priorityBy: 'kinds', kinds: [...KINDS], characters: [...CHARACTERS], excludedKinds: [], excludedCharacters: [] });
  const order = (input, keys) => [...new Set([...(Array.isArray(input) ? input.filter(id => keys.includes(id)) : []), ...keys])];
  function restore(raw) {
    const settings = fresh();
    settings.enabled = raw?.enabled === true;
    settings.priorityBy = raw?.priorityBy === 'characters' ? 'characters' : 'kinds';
    settings.kinds = order(raw?.kinds, KINDS);
    settings.characters = order(raw?.characters, CHARACTERS);
    settings.excludedKinds = Array.isArray(raw?.excludedKinds) ? [...new Set(raw.excludedKinds.filter(id => KINDS.includes(id)))] : [];
    settings.excludedCharacters = Array.isArray(raw?.excludedCharacters) ? [...new Set(raw.excludedCharacters.filter(id => CHARACTERS.includes(id)))] : [];
    return settings;
  }
  const unlocked = save => P.known(save,10);
  const kind = node => node.main ? 'main' : node.unique ? 'unique' : 'sub';
  const trees = new Map();
  function nodes(character, slot) {
    const key = character + ':' + slot;
    if (!trees.has(key)) trees.set(key, P.allGearTrees(character, slot, true));
    return trees.get(key);
  }
  function mainComplete(save, stage) {
    return CHARACTERS.filter(character => P.unlocked(save, character)).every(character =>
      ['weapon', 'armor'].every(slot => {
        const owned = new Set(save.progression.characters[character][slot]);
        return nodes(character, slot).every(node => !node.main || !Number.isInteger(node.stage) || node.stage > stage || owned.has(node.id));
      }));
  }
  // Bound each batch so a rich save does not stall the battle or options UI.
  function acquire(save, limit = 24) {
    const settings = restore(save.autoGear);
    if (!unlocked(save) || !settings.enabled) return [];
    const cleared = new Set([...save.cleared,...(save.reincarnation?.passed||[])]);
    const candidates = settings.characters.filter(id => P.unlocked(save, id) && !settings.excludedCharacters.includes(id))
      .flatMap(character => ['weapon', 'armor'].flatMap(slot => {
        const owned = new Set(save.progression.characters[character][slot]);
        return nodes(character, slot)
          .filter(node => cleared.has(node.stage) && !settings.excludedKinds.includes(kind(node)) && !owned.has(node.id))
          .map(node => ({ character, slot, node }));
      }));
    candidates.sort((a, b) => {
      const kindOrder = settings.kinds.indexOf(kind(a.node)) - settings.kinds.indexOf(kind(b.node));
      const characterOrder = settings.characters.indexOf(a.character) - settings.characters.indexOf(b.character);
      return (settings.priorityBy === 'characters' ? characterOrder || kindOrder : kindOrder || characterOrder)
        || (typeof a.node.stage==='number'?a.node.stage:101) - (typeof b.node.stage==='number'?b.node.stage:101) || (a.node.depth || 0) - (b.node.depth || 0)
        || a.node.y - b.node.y || ['weapon', 'armor'].indexOf(a.slot) - ['weapon', 'armor'].indexOf(b.slot);
    });
    const kinds = new Map(candidates.map(row => [row.node.id, kind(row.node)]));
    return P.purchaseGearBatch(save, candidates.map(row => ({ character: row.character, slot: row.slot, node: row.node.id })), limit)
      .map(row => ({ ...row, kind: kinds.get(row.node) }));
  }
  return { KINDS, CHARACTERS, fresh, restore, unlocked, mainComplete, acquire };
});
