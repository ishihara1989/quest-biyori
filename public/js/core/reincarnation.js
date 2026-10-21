'use strict';
((root, factory) => {
  const common = typeof module === 'object' && module.exports;
  const api = factory(common ? require('./forest-progression.js') : root.ForestProgression,
    common ? require('../data/reincarnation-tree-data.js') : root.ReincarnationTree,
    common ? require('../data/reincarnation-data.js') : root.ReincarnationData);
  if (common) module.exports = api; else root.Reincarnation = api;
})(globalThis, (P, T, D) => {
  const fresh = () => ({ version: 1, discovered: false, unlocked: false, cycle: 0, defeatedCycle: null,
    total: 0, owned: [], lifetimeStages: [], lifetimePassed: [], passed: [], automation: { skills: false, gems: false, waitForMainGear: false,
      priorities: Object.fromEntries(Object.keys(P.CHARACTERS).map(job=>[job,{}])),
      slots: Object.fromEntries(Object.keys(P.CHARACTERS).flatMap(job=>['weapon','armor'].map(slot=>[job+':'+slot,{effects:['fortune',slot==='weapon'?'attack':'vitality','recovery'],locked:false,epic:true,rarity:'rare',efficiency:true}]))) } });
  const integer = n => Number.isSafeInteger(n) && n >= 0;
  function restore(raw) {
    const result = fresh();
    if (!raw || raw.version !== 1) return result;
    result.discovered = raw.discovered === true;
    result.unlocked = result.discovered && raw.unlocked === true;
    result.cycle = result.unlocked && integer(raw.cycle) ? Math.min(raw.cycle, 1000000000) : 0;
    result.total = result.cycle * D.POINTS;
    result.defeatedCycle = result.unlocked && raw.defeatedCycle === result.cycle ? result.cycle : null;
    result.lifetimeStages = [...new Set((Array.isArray(raw.lifetimeStages) ? raw.lifetimeStages : []).filter(id =>
      Number.isInteger(id) && id >= 1 && id <= 100 || ['dimensional-gate', 'chaos-gate', 'extradimensional-goddess', D.ID].includes(id)))];
    result.passed = [...new Set((Array.isArray(raw.passed) ? raw.passed : []).filter(id => Number.isInteger(id) && id >= 1 && id <= 100))];
    result.lifetimePassed = [...new Set((Array.isArray(raw.lifetimePassed) ? raw.lifetimePassed : []).filter(id => Number.isInteger(id) && id >= 1 && id <= 100))];
    const requested = new Set(Array.isArray(raw.owned) ? raw.owned : []), state = { total: result.total, owned: new Set(['origin']) };
    for (const n of T.nodes) if (!n.root && n.family !== 'trial' && requested.has(n.id) && T.status(state, n.id) === 'available') state.owned.add(n.id);
    result.owned = [...state.owned].filter(id => id !== 'origin');
    const a = raw.automation;
    result.automation.skills = a?.skills === true; result.automation.gems = a?.gems === true;
    result.automation.waitForMainGear = a?.waitForMainGear === true;
    for (const job of Object.keys(P.CHARACTERS)) {
      result.automation.priorities[job] = {};
      for (const n of P.SKILLS[job]) {
        const setting = a?.priorities?.[job]?.[n.id];
        if (setting && Number.isInteger(setting.priority) && setting.priority >= 1 && setting.priority <= 7)
          result.automation.priorities[job][n.id] = { priority: setting.priority, enabled: setting.enabled !== false };
      }
      for (const slot of ['weapon', 'armor']) {
        const setting = a?.slots?.[job + ':' + slot];
        result.automation.slots[job + ':' + slot] = { effects: Array.isArray(setting?.effects) ? setting.effects.map(k=>P.Gem.OPTIONS[k]?k:'').slice(0, 3) : ['fortune', slot === 'weapon' ? 'attack' : 'vitality','recovery'],
          locked: setting?.locked === true, epic: setting?.epic !== false,
          rarity: ['rare','unique','legendary','epic'].includes(setting?.rarity) ? setting.rarity : 'rare', efficiency: setting?.efficiency !== false };
      }
    }
    return result;
  }
  const state = save => ({ total: save.reincarnation?.total || 0, owned: new Set(['origin', ...(save.reincarnation?.owned || [])]) });
  const bonuses = save => T.totals(state(save));
  const points = save => T.points(state(save));
  function status(save, id) {
    if (!save.reincarnation?.unlocked) return 'locked';
    if (T.byId[id]?.family === 'trial') return 'soon';
    return T.status(state(save), id);
  }
  function purchase(save, id) {
    if (status(save, id) !== 'available') return false;
    save.reincarnation.owned.push(id); return true;
  }
  function capture(save) {
    const used = new Set();
    const fullEpics = Object.keys(P.CHARACTERS).every(job => P.unlocked(save, job) && ['weapon','armor'].every(slot => {
      const ids = save.progression.characters[job].gems[slot];
      if (!P.gemUsage(save, job, slot).fits) return false;
      return ids.some(uid => {
        const gem = P.gemInstance(save, uid);
        if (!gem || gem.rarity !== 'epic' || gem.family !== job + '-' + slot || used.has(uid)) return false;
        used.add(uid); return true;
      });
    }));
    return Object.freeze({ cycle: save.reincarnation?.cycle || 0, fullEpics, bonuses: { ...bonuses(save) } });
  }
  function victory(save, stage, evidence) {
    const r = save.reincarnation ||= fresh(), unlocks = [];
    if (evidence?.cycle !== r.cycle) return unlocks;
    if (stage === 'extradimensional-goddess' && evidence.fullEpics && !r.discovered) {
      r.discovered = true;
      unlocks.push({ id: D.ID, icon: 'spark', title: '女神の配送センター', detail: '転生の女神', target: 'stages', stage: D.ID, special: true, reincarnation: true });
    }
    if (stage === D.ID && r.discovered) {
      r.defeatedCycle = r.cycle;
      if (!r.unlocked) {
        r.unlocked = true;
        unlocks.push({ id: 'reincarnation', icon: 'repeat', title: '転生', detail: '新たな旅へ · 転生ツリー', target: 'reincarnation', rebirth: true },
          { id: 'auto-skills', icon: 'spark', title: 'スキル自動取得', detail: '設定 / 7段階の優先度', target: 'options' },
          { id: 'auto-gems', icon: 'gem', title: 'ジェム自動装備', detail: '設定 / 効果と容量を優先', target: 'options' },
          { id: 'wait-main-gear', icon: 'arrow', title: 'メイン強化後に進行', detail: '設定 / 全員の武器・防具', target: 'options' });
      }
    }
    return unlocks;
  }
  const eligible = save => !!save.reincarnation?.unlocked && save.reincarnation.defeatedCycle === save.reincarnation.cycle;
  function prepare(save, freshSave) {
    if (!eligible(save)) return null;
    const next = freshSave(), r = structuredClone(save.reincarnation);
    r.lifetimeStages = [...new Set([...r.lifetimeStages, ...save.cleared])];
    r.lifetimePassed = [...new Set([...r.lifetimePassed, ...r.passed])];
    r.cycle++; r.total += D.POINTS; r.defeatedCycle = null; r.passed = [];
    Object.assign(next, { reincarnation: r, achievements: structuredClone(save.achievements), inventory: {potion:0},
      encounteredEnemies: [...save.encounteredEnemies], discoveredGemRarities: [...save.discoveredGemRarities],
      autoGear: structuredClone(save.autoGear), autoGemDismantle: structuredClone(save.autoGemDismantle), autoMode: save.autoMode, speed: save.speed });
    return next;
  }
  function skipDestination(save, from) {
    if (!Number.isInteger(from)) return null;
    const width = bonuses(save).skip;
    if (width <= 1 || from >= 100) return null;
    return Math.min(from + width, Math.ceil((from + 1) / 10) * 10);
  }
  function pass(save, target) {
    // Only called after the landing stage is actually won. No skipped rewards.
    if (!Number.isInteger(target) || !save.reincarnation) return;
    const reached = [...save.cleared, ...save.reincarnation.passed].filter(Number.isInteger);
    const frontier = Math.max(0, ...reached);
    const destination = skipDestination(save,frontier);
    if (!destination || target > destination || target <= frontier) return;
    for (let id = frontier + 1; id < target; id++) if (!save.reincarnation.passed.includes(id)) save.reincarnation.passed.push(id);
    for (const [job, def] of Object.entries(P.CHARACTERS)) if (def.unlock > frontier && def.unlock < target) {
      const c = save.progression.characters[job];
      if (job === 'mage' || job === 'paladin') c.xp = P.experience(def.unlock);
      else P['recruit' + job[0].toUpperCase() + job.slice(1)](save);
    }
  }
  return { fresh, restore, state, bonuses, points, status, purchase, capture, victory, eligible, prepare, skipDestination, pass };
});
