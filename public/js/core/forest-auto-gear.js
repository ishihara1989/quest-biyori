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
  function gateComplete(save, regions, target) {
    return CHARACTERS.filter(character => P.unlocked(save, character)).every(character =>
      ['weapon', 'armor'].every(slot => {
        const owned = new Set(save.progression.characters[character][slot]);
        return nodes(character, slot).every(node => !Number.isInteger(node.stage) ||
          !regions.includes(Math.ceil(node.stage / 10)) || target === 'sub' && node.unique || owned.has(node.id));
      }));
  }
  function acquire(save, limit = Number.MAX_SAFE_INTEGER) {
    if (!Number.isSafeInteger(limit) || limit <= 0) return [];
    const bought = [];
    for (const row of acquireSteps(save)) if (row) {
      bought.push(row);
      if (bought.length === limit) break;
    }
    return bought;
  }
  // Yield preparation as well as purchases so the UI can resume the same search
  // on the next frame instead of paying for all candidates on every slice.
  function* acquireSteps(save) {
    const settings = restore(save.autoGear);
    if (!unlocked(save) || !settings.enabled) return;
    const cleared = new Set([...save.cleared,...(save.reincarnation?.passed||[])]);
    const candidates = [];
    for (const character of settings.characters.filter(id => P.unlocked(save, id) && !settings.excludedCharacters.includes(id)))
      for (const slot of ['weapon', 'armor']) {
        yield null;
        const owned = new Set(save.progression.characters[character][slot]);
        for (const node of nodes(character, slot))
          if (cleared.has(node.stage) && !settings.excludedKinds.includes(kind(node)) && !owned.has(node.id)) candidates.push({ character, slot, node });
      }
    yield null;
    candidates.sort((a, b) => {
      const kindOrder = settings.kinds.indexOf(kind(a.node)) - settings.kinds.indexOf(kind(b.node));
      const characterOrder = settings.characters.indexOf(a.character) - settings.characters.indexOf(b.character);
      return (settings.priorityBy === 'characters' ? characterOrder || kindOrder : kindOrder || characterOrder)
        || (typeof a.node.stage==='number'?a.node.stage:101) - (typeof b.node.stage==='number'?b.node.stage:101) || (a.node.depth || 0) - (b.node.depth || 0)
        || a.node.y - b.node.y || ['weapon', 'armor'].indexOf(a.slot) - ['weapon', 'armor'].indexOf(b.slot);
    });
    yield null;
    const kinds = new Map(candidates.map(row => [row.node.id, kind(row.node)]));
    for (const row of P.purchaseGearSteps(save, candidates.map(row => ({ character: row.character, slot: row.slot, node: row.node.id }))))
      yield row ? { ...row, kind: kinds.get(row.node) } : null;
  }
  return { KINDS, CHARACTERS, fresh, restore, unlocked, mainComplete, gateComplete, acquire, acquireSteps };
});
