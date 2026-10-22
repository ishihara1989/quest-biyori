'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Trials = api;
})(globalThis, () => {
  const definitions = [
    ...Array.from({ length: 9 }, (_, i) => ({ id: 'strength-' + (i + 2), family: 'strength', name: '強靭 ' + (i + 2), reward: i + 2, stats: i + 2, image: 'items/armor.png', effect: 'HP・攻撃力・防御力 ×' + (i + 2) })),
    { id: 'onslaught', family: 'onslaught', name: '猛攻', reward: 1.5, cooldown: .5, image: 'items/sword.png', effect: '敵の行動クール ×0.5' },
    { id: 'unyielding', family: 'unyielding', name: '頑強', reward: 1.5, interference: 3, image: 'progression/heartgem.png', effect: '妨害耐性・妨害抵抗力 ×3' },
    { id: 'goddess-serious', family: 'goddess', name: '女神の本気', reward: 10, stats: 3, goddess: true, image: 'gems/goddess-page.png', effect: '異次元・転生の女神 HP・攻撃力・防御力 ×3' },
  ];
  const byId = Object.fromEntries(definitions.map(d => [d.id, d]));
  const gods = ['extradimensional-goddess', 'reincarnation-goddess'];
  const availableNode = id => id === 'trial-open';
  const unlocked = save => !!save.reincarnation?.unlocked && save.reincarnation.owned.includes('trial-open');
  const clean = ids => [...new Set((Array.isArray(ids) ? ids : []).filter(id => Object.hasOwn(byId, id)))];
  // Collapse each family before multiplying independent trials.
  function summarize(ids, stage) {
    const families = new Map();
    for (const id of clean(ids)) {
      const d = byId[id];
      if (d.goddess && !gods.includes(stage)) continue;
      if (!families.has(d.family) || families.get(d.family).reward < d.reward) families.set(d.family, d);
    }
    const result = { ids: [...families.values()].map(d => d.id), reward: 1, stats: 1, cooldown: 1, interference: 1 };
    for (const d of families.values()) {
      result.reward *= d.reward; result.stats *= d.stats || 1;
      result.cooldown *= d.cooldown || 1; result.interference *= d.interference || 1;
    }
    return result;
  }
  const capture = (save, stage = save.selectedStage) => summarize(unlocked(save) ? save.reincarnation.trials : [], stage);
  function select(save, id, enabled) {
    if (!unlocked(save) || !byId[id]) return false;
    const ids = clean(save.reincarnation.trials).filter(other => other !== id && (!enabled || byId[other].family !== byId[id].family));
    if (enabled) ids.push(id);
    save.reincarnation.trials = ids; return true;
  }
  const count = (base, multiplier, random) => { const value = base * multiplier, whole = Math.floor(value); return whole + (value > whole && random() < value - whole ? 1 : 0); };
  return { definitions, byId, gods, availableNode, unlocked, clean, summarize, capture, select, count };
});
