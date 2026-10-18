(function (root) {
  'use strict';
  const families = {
    harvest: { name: '収穫', color: '#dab974', icon: 'items/chest.png' },
    growth: { name: '成長', color: '#9cd387', icon: 'progression/heartgem.png' },
    journey: { name: '再走', color: '#77d9c4', icon: 'progression/clockgem.png' },
    power: { name: '火力', color: '#ed9a7c', icon: 'items/sword.png' },
    guard: { name: '耐久', color: '#8dbbdf', icon: 'items/armor.png' },
    skill: { name: '技能', color: '#b6a0e4', icon: 'progression/arcanegem.png' },
    gem: { name: '宝石・容量', color: '#e1a2c7', icon: 'progression/universal-gem.png' },
    trial: { name: '試練・異変', color: '#d88e98', icon: 'gems/goddess-page.png' },
  };
  // Prices in the initial group follow design section 6; the other values are review proposals.
  const nodes = [];
  function node(id, name, family, cost, x, y, requires, effects, extra = {}) {
    nodes.push({ id, name, family, cost, x, y, requires, effects, ...extra });
  }
  const effect = (label, value, key, amount, operation = 'add') => ({ label, value, key, amount, operation });
  node('origin', '転生の起点', 'journey', 0, 610, 48, [], [], { root: true });
  node('drop2', '豊穣の芽', 'harvest', 60, 150, 180, ['origin'], [effect('ドロップ数', '×2', 'drop', 1)], { initial: true, note: '素材・ジェムの抽選後個数。確率は変更しない。' });
  node('gold2', '黄金の記憶', 'harvest', 20, 380, 180, ['origin'], [effect('ゴールド', '×2', 'gold', 2, 'multiply')], { initial: true });
  node('xp3', '成長の記憶', 'growth', 20, 610, 180, ['origin'], [effect('経験値', '×3', 'xp', 1)], { initial: true, note: '経験値指数＋1。Lv.100以降は効果なし。' });
  node('sub20', '工匠の心得', 'journey', 20, 840, 180, ['origin'], [effect('通常サブ素材費', '−20%', 'sub', 20)], { initial: true, note: '端数切り上げ。通常10地域・全職・武器／防具。' });
  node('unique20', '秘匠の心得', 'journey', 40, 1070, 180, ['origin'], [effect('通常ユニーク素材費', '−20%', 'unique', 20)], { initial: true, note: '端数切り上げ。通常10地域・全職・武器／防具。' });
  node('drop3', '豊穣の枝', 'harvest', 80, 150, 310, ['drop2'], [effect('ドロップ数', '＋1', 'drop', 1)], { initial: true });
  node('gold-cost', '旅支度の節約', 'journey', 100, 380, 310, ['gold2'], [effect('装備ゴールド費', '−20%', 'gearGold', 20)]);
  node('sub40', '工匠の叡智', 'journey', 140, 1070, 310, ['sub20'], [effect('通常サブ素材費', '−20pt', 'sub', 20)]);
  node('main-free', 'メイン材料無償化', 'journey', 400, 725, 363, ['xp3', 'sub20', 'unique20'], [effect('通常メイン素材費', '0', 'mainFree', 1)], { initial: true, milestone: true, note: '通常10地域・全職・武器／防具のメイン。ゴールドは必要。サブ・ユニーク・女神ツリー・ジェム制作は対象外。前提・今周の到達条件は維持。' });
  node('drop4', '豊穣の実', 'harvest', 120, 150, 440, ['drop3'], [effect('ドロップ数', '＋1', 'drop', 1)], { initial: true });
  node('drop-rate', '幸運の星', 'harvest', 180, 380, 440, ['gold2'], [effect('ドロップ率', '＋100%', 'rate', 100)], { note: 'パーティー共通で1回加算。ドロップ数倍率とは別枠。' });
  node('unique40', '秘匠の叡智', 'journey', 180, 1070, 440, ['unique20'], [effect('通常ユニーク素材費', '−20pt', 'unique', 20)]);
  const columns = [80, 240, 400, 560, 720, 880, 1040, 1200];
  const late = [
    ['harvest', [
      ['drop6', '溢れる収穫', 240, ['drop4', 'main-free'], [effect('ドロップ数', '＋2', 'drop', 2)]],
      ['drop10', '尽きない収穫', 420, ['drop6'], [effect('ドロップ数', '＋4', 'drop', 4)]],
      ['drop-final', '豊穣の極星', 800, ['drop10'], [effect('最終ドロップ数', '×2', 'dropFinal', 2, 'multiply')]],
      ['gold4', '黄金の極星', 600, ['drop-final', 'gold2'], [effect('ゴールド', '×2', 'gold', 2, 'multiply')]],
    ]],
    ['growth', [
      ['xp9', '成長の環', 180, ['xp3', 'main-free'], [effect('経験値', '×3', 'xp', 1)]],
      ['xp27', '成長の極星', 420, ['xp9'], [effect('経験値', '×3', 'xp', 1)]],
    ]],
    ['journey', [
      ['skip2', '星渡り', 220, ['main-free'], [effect('挑戦先の最大進行幅', '＋2', 'skip', 2, 'max')]],
      ['skip3', '星間の近道', 450, ['skip2'], [effect('挑戦先の最大進行幅', '＋3', 'skip', 3, 'max')]],
      ['skip4', '星渡りの極み', 800, ['skip3'], [effect('挑戦先の最大進行幅', '＋4', 'skip', 4, 'max')]],
    ]],
    ['power', [
      ['damage25', '闘志の火', 100, ['main-free'], [effect('与ダメージ', '＋25%', 'damage', 25)]],
      ['damage2', '闘志の焔', 280, ['damage25'], [effect('与ダメージ', '×2', 'damageFinal', 2, 'multiply')]],
      ['boss50', '神狩り', 420, ['damage2'], [effect('対ボス与ダメージ', '＋50%', 'boss', 50)]],
      ['damage3', '闘志の極星', 900, ['boss50'], [effect('与ダメージ', '×3', 'damageFinal', 3, 'multiply')]],
    ]],
    ['guard', [
      ['hp25', '命の雫', 100, ['main-free'], [effect('最大HP', '＋25%', 'hp', 25)]],
      ['hp2', '命の泉', 280, ['hp25'], [effect('最大HP', '×2', 'hpFinal', 2, 'multiply')]],
      ['recovery', '再生の泉', 360, ['hp2'], [effect('回復量', '＋50%', 'recovery', 50)]],
      ['hp3', '生命の極星', 900, ['recovery'], [effect('最大HP', '×3', 'hpFinal', 3, 'multiply')]],
    ]],
    ['skill', [
      ['sp20', '技の記憶', 140, ['main-free'], [effect('レベル由来SP', '＋20%', 'sp', 20)]],
      ['sp-ten', '研鑽の環', 240, ['sp20'], [effect('10Lvごとの追加SP', '＋1', 'spTen', 1)]],
      ['mp20', '魔力の循環', 360, ['sp-ten'], [effect('MP消費', '−20%', 'mp', 20)]],
      ['skill50', '技能の極星', 600, ['mp20'], [effect('技能威力', '＋50%', 'skill', 50)]],
    ]],
    ['gem', [
      ['common50', '器の拡張', 140, ['main-free'], [effect('共通容量', '＋50', 'common', 50)]],
      ['direction100', '三彩の器', 280, ['common50'], [effect('攻撃容量', '＋100', 'attackCap', 100), effect('防御容量', '＋100', 'guardCap', 100), effect('補助容量', '＋100', 'utilityCap', 100)]],
      ['forge20', '宝石の精錬', 400, ['direction100'], [effect('ジェム制作費', '−20%', 'forge', 20), effect('地域Lv強化費', '−20%', 'gemLevel', 20)]],
      ['common200', '星を宿す器', 700, ['forge20'], [effect('共通容量', '＋200', 'common', 200)]],
    ]],
    ['trial', [
      ['trial-open', '試練の扉', 260, ['main-free', 'drop4'], [effect('試練', '解放', 'trial', 1)]],
      ['trial-seals', '封印の試練', 300, ['trial-open'], [effect('宝石封印・技能制限', '解放', 'seals', 1)]],
      ['trial-slots', '重なる試練', 500, ['trial-seals'], [effect('試練同時選択枠', '2', 'slots', 2, 'max')]],
      ['trial-intrusion', '異変の兆し', 700, ['trial-slots', 'damage2', 'hp2'], [effect('追加敵の試練', '解放', 'intrusion', 1)]],
      ['trial-solo', '孤星の旅路', 1000, ['trial-intrusion', 'common200', 'skill50'], [effect('少人数の上位試練', '解放', 'solo', 1)]],
    ]],
  ];
  late.forEach(([family, rows], column) => rows.forEach(([id, name, cost, requires, effects], row) => {
    const extra = { milestone: ['drop-final', 'damage3', 'hp3', 'trial-open', 'trial-solo'].includes(id) };
    if (family === 'growth') extra.note = '経験値指数＋1。Lv.100以降は効果なし。';
    if (id.startsWith('skip')) extra.note = '大ボス・必須特殊ボスを越えない。通過区間の経験値・素材・ゴールドなし。通過の確定は挑戦先の勝利時。';
    if (id === 'trial-open') extra.note = '試練の初期系統：敵側強化。精算には今周の転生の女神撃破が必要。回数だけでは解放しない。';
    if (family === 'gem') extra.note = '方向容量・共通容量は別枠。職専用容量は対象外。制作費軽減の採用には資源循環の検証が必要。';
    node(id, name, family, cost, columns[column], 610 + row * 130, requires, effects, extra);
  }));
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const early = ['drop2', 'gold2', 'xp3', 'sub20', 'unique20'];
  const speed = [...early, 'main-free', 'drop3', 'drop4', 'skip2', 'trial-open'];
  const presets = {
    first: { total: 100, owned: [], selected: 'drop2' },
    goal: { total: 600, owned: early, selected: 'main-free' },
    speed: { total: 1500, owned: speed, selected: 'trial-open' },
    trial: { total: 4000, owned: [...speed, 'damage25', 'damage2', 'hp25', 'hp2', 'sp20', 'sp-ten', 'common50', 'direction100', 'trial-seals', 'xp9', 'drop6'], selected: 'trial-slots' },
    complete: { total: nodes.reduce((sum, n) => sum + n.cost, 0), owned: nodes.filter(n => !n.root).map(n => n.id), selected: 'trial-solo' },
  };
  function createState(preset = 'first') {
    const p = presets[preset] || presets.first;
    return { total: p.total, owned: new Set(['origin', ...p.owned]), selected: p.selected };
  }
  const spent = state => [...state.owned].reduce((sum, id) => sum + (byId[id]?.cost || 0), 0);
  const points = state => state.total - spent(state);
  function status(state, id) {
    const n = byId[id];
    if (!n) return 'unknown';
    if (state.owned.has(id)) return 'owned';
    if (!n.requires.every(p => state.owned.has(p))) return 'locked';
    return points(state) >= n.cost ? 'available' : 'unaffordable';
  }
  function purchase(state, id) {
    if (status(state, id) !== 'available') return false;
    state.owned.add(id);
    return true;
  }
  function totals(state, additionalId) {
    const result = { drop: 1, dropFinal: 1, gold: 1, xp: 0, skip: 1, damage: 0, damageFinal: 1, hp: 0, hpFinal: 1, slots: 1 };
    const owned = new Set(state.owned);
    if (additionalId) owned.add(additionalId);
    for (const id of owned) for (const e of byId[id].effects) {
      if (e.operation === 'multiply') result[e.key] = (result[e.key] ?? 1) * e.amount;
      else if (e.operation === 'max') result[e.key] = Math.max(result[e.key] ?? 0, e.amount);
      else result[e.key] = (result[e.key] ?? 0) + e.amount;
    }
    return result;
  }
  const api = { families, nodes, byId, presets, createState, spent, points, status, purchase, totals };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReincarnationMock = api;
})(typeof globalThis === 'object' ? globalThis : this);
