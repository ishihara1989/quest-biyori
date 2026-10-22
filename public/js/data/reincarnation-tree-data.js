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
  // Runtime prices adopted from the reviewed tree. Only trial-open is currently implemented.
  const nodes = [];
  function node(id, name, family, cost, x, y, requires, effects, extra = {}) {
    nodes.push({ id, name, family, cost, x, y, requires, effects, ...extra });
  }
  const effect = (label, value, key, amount, operation = 'add') => ({ label, value, key, amount, operation });
  node('origin', '転生の起点', 'journey', 0, 610, 48, [], [], { root: true });
  node('drop2', '豊穣の芽', 'harvest', 60, 150, 180, ['origin'], [effect('ドロップ数', '×2', 'drop', 2, 'max')], { initial: true, note: '素材・ジェムの抽選後個数。確率は変更しない。' });
  node('gold2', '黄金の記憶', 'harvest', 20, 380, 180, ['origin'], [effect('ゴールド', '×2', 'gold', 2, 'max')], { initial: true });
  node('xp3', '成長の記憶', 'growth', 20, 610, 180, ['origin'], [effect('経験値', '×3', 'xp', 1, 'max')], { initial: true, note: '経験値指数＋1。Lv.100以降は効果なし。' });
  node('sub20', '工匠の心得', 'journey', 20, 840, 180, ['origin'], [effect('通常サブ素材費', '−20%', 'sub', 20)], { initial: true, note: '端数切り上げ。通常10地域・全職・武器／防具。' });
  node('unique20', '秘匠の心得', 'journey', 40, 1070, 180, ['origin'], [effect('通常ユニーク素材費', '−20%', 'unique', 20)], { initial: true, note: '端数切り上げ。通常10地域・全職・武器／防具。' });
  node('drop3', '豊穣の枝', 'harvest', 80, 150, 310, ['drop2'], [effect('ドロップ数', '×3', 'drop', 3, 'max')], { initial: true });
  node('gold-cost', '旅支度の節約', 'journey', 50, 380, 310, ['gold2'], [effect('装備ゴールド費', '−20%', 'gearGold', 20)]);
  node('sub40', '工匠の叡智', 'journey', 140, 1070, 310, ['sub20'], [effect('通常サブ素材費', '−20pt', 'sub', 20)]);
  node('main-free', 'メイン材料無償化', 'journey', 200, 725, 363, ['xp3', 'sub20', 'unique20'], [effect('通常メイン素材費', '0', 'mainFree', 1)], { initial: true, milestone: true, note: '通常10地域・全職・武器／防具のメイン。ゴールドは必要。サブ・ユニーク・女神ツリー・ジェム制作は対象外。前提・今周の到達条件は維持。' });
  node('drop4', '豊穣の実', 'harvest', 120, 150, 440, ['drop3'], [effect('ドロップ数', '×4', 'drop', 4, 'max')], { initial: true });
  node('drop-rate', '幸運の星', 'harvest', 90, 380, 440, ['gold2'], [effect('ドロップ率', '＋100%', 'rate', 100)], { note: 'パーティー共通で1回加算。ジェム制限中も有効。ドロップ数倍率とは別枠。' });
  node('unique40', '秘匠の叡智', 'journey', 180, 1070, 440, ['unique20'], [effect('通常ユニーク素材費', '−20pt', 'unique', 20)]);
  const branches = [];
  function chain(family, x, entries, parents, note = '', heading = families[family].name) {
    const ids = entries.map(entry => entry[0]);
    branches.push({ family, x, heading, ids });
    entries.forEach(([id, name, cost, effects, extra = {}], index) => {
      const { parents: additional = [], row = index, ...metadata } = extra;
      node(id, name, family, cost, x, 610 + row * 112,
        [...(index ? [ids[index - 1]] : parents), ...additional], effects, { note, ...metadata });
    });
  }
  const dropSteps = [
    [5, 400], [6, 800], [7, 1400], [8, 2400], [9, 3800], [10, 6000],
    [12, 10000], [14, 16000], [16, 25000], [18, 40000], [20, 60000], [25, 90000],
    [30, 140000], [40, 220000], [50, 340000], [60, 500000], [75, 720000], [100, 1000000],
  ];
  chain('harvest', 80, dropSteps.map(([amount, cost]) => {
    const id = amount === 20 ? 'drop-final' : 'drop' + amount;
    return [id, amount === 100 ? '無尽の実り' : '豊穣 ' + amount, cost,
      [effect('ドロップ数', '×' + amount, 'drop', amount, 'max')], { milestone: [20, 100].includes(amount) }];
  }), ['drop4', 'main-free'], '素材・ジェムの抽選後個数。確率は変更しない。', '収穫 / 個数');
  const experienceMultipliers = [1, 3, 9, 27, 81, 243, 729, 2187, 6561];
  chain('growth', 240, [600, 1200, 2400, 5000, 12000, 30000, 80000].map((cost, index) => {
    const exponent = index + 2, multiplier = experienceMultipliers[exponent];
    return ['xp' + multiplier, '成長の記憶 ' + exponent, cost,
      [effect('経験値', '×' + multiplier.toLocaleString('ja-JP'), 'xp', exponent, 'max')]];
  }), ['xp3', 'main-free'], '経験値指数を1段階ずつ強化。Lv.100以降は効果なし。');
  chain('journey', 400, [
    ['skip2', '星渡り', 220, [effect('挑戦先の最大進行幅', '＋2', 'skip', 2, 'max')]],
    ['skip3', '星間の近道', 4500, [effect('挑戦先の最大進行幅', '＋3', 'skip', 3, 'max')]],
    ['skip4', '星渡りの極み', 80000, [effect('挑戦先の最大進行幅', '＋4', 'skip', 4, 'max')]],
  ], ['main-free'], '大ボス・必須特殊ボスを越えない。通過区間の経験値・素材・ゴールドなし。通過の確定は挑戦先の勝利時。');
  // Node IDs remain stable so existing purchases gain the revised effects on load.
  const combatTargets = [2, 3, 4, 5, 7.5, 10, 15, 20, 30, 40, 60, 80, 100, 150, 200, 300, 400, 500];
  const combatPrices = [50, 100, 350, 600, 1200, 2200, 4000, 8000, 14000, 24000, 40000, 65000, 100000, 160000, 250000, 400000, 650000, 1000000];
  for (const [family, key, x, label, title, secondary, secondaryLabel, special] of [
    ['power', 'damage', 560, '与ダメージ', '闘志', 'boss', '対ボス与ダメージ', 'boss50'],
    ['guard', 'hp', 720, '最大HP', '生命', 'recovery', '回復量', 'recovery'],
  ]) {
    chain(family, x, combatTargets.map((target, index) => {
      const prefix = key === 'damage' ? 'damage' : 'hp';
      const id = index === 0 ? prefix + '25' : index === 4 ? prefix + '2' : index === 7 ? special : index === 12 ? prefix + '3' : index === 17 ? prefix + '10' : prefix + '-step-' + (index + 1);
      const effects = [effect(label, '×' + target, key, Math.round(target * 100), 'max')];
      if ([5, 7, 9, 11, 13].includes(index)) effects.push(effect(secondaryLabel, '＋10%', secondary, 10));
      return [id, index === 17 ? '神域の' + title : title + ' ' + (index + 1), combatPrices[index], effects, { milestone: [4, 12, 17].includes(index) }];
    }), []);
  }
  chain('skill', 880, [
    ['sp20', '技の記憶 I', 140, [effect('レベル由来SP', '＋50%', 'sp', 50)]],
    ['sp25', '技の記憶 II', 250, [effect('レベル由来SP', '＋25%', 'sp', 25)]],
    ['sp30', '技の記憶 III', 450, [effect('レベル由来SP', '＋25%', 'sp', 25)]],
    ['sp-ten', '研鑽の環 I', 1000, [effect('10Lvごとの追加SP', '＋1', 'spTen', 1)]],
    ['mp5', '魔力の循環 I', 2200, [effect('MP消費', '−5%', 'mp', 5)]],
    ['skill10', '技能の芽', 4500, [effect('技能威力', '＋10%', 'skill', 10)]],
    ['sp40', '技の記憶 IV', 8000, [effect('レベル由来SP', '＋50%', 'sp', 50)]],
    ['mp10', '魔力の循環 II', 14000, [effect('MP消費', '−5%', 'mp', 5)]],
    ['skill20', '技能の枝', 24000, [effect('技能威力', '＋10%', 'skill', 10)]],
    ['sp-ten2', '研鑽の環 II', 40000, [effect('10Lvごとの追加SP', '＋1', 'spTen', 1)]],
    ['sp50', '技の記憶 V', 65000, [effect('レベル由来SP', '＋50%', 'sp', 50)]],
    ['mp15', '魔力の循環 III', 100000, [effect('MP消費', '−5%', 'mp', 5)]],
    ['skill35', '技能の花', 160000, [effect('技能威力', '＋15%', 'skill', 15)]],
    ['mp20', '魔力の循環 IV', 250000, [effect('MP消費', '−5%', 'mp', 5)]],
    ['skill50', '技能の極星', 500000, [effect('技能威力', '＋15%', 'skill', 15)]],
    ['skill75', '神域の技能', 1000000, [effect('技能威力', '＋25%', 'skill', 25)], { milestone: true }],
  ], []);
  const capacitySteps = [
    ['common', 25, 70], ['common', 50, 140], ['direction', 25, 250], ['common', 75, 450],
    ['direction', 50, 800], ['common', 100, 1400], ['direction', 75, 2400], ['common', 125, 4000],
    ['direction', 100, 6500], ['common', 150, 10000], ['common', 200, 16000], ['common', 250, 25000],
    ['direction', 150, 40000], ['common', 350, 80000], ['direction', 200, 160000], ['common', 500, 400000], ['common', 750, 1000000],
  ];
  const previousCapacity = { common: 0, direction: 0 };
  chain('gem', 1040, capacitySteps.map(([kind, baseAmount, cost]) => {
    const amount = baseAmount * 4;
    const delta = amount - previousCapacity[kind]; previousCapacity[kind] = amount;
    return [kind + baseAmount, (kind === 'common' ? '星の器 ' : '三彩の器 ') + amount, cost,
      kind === 'common' ? [effect('共通容量', '＋' + delta, 'common', delta)] :
        [['攻撃容量', 'attackCap'], ['防御容量', 'guardCap'], ['補助容量', 'utilityCap']].map(([label, key]) => effect(label, '＋' + delta, key, delta)),
      { milestone: baseAmount === 750 }];
  }), [], '方向容量・共通容量は別枠。職専用容量は対象外。');
  chain('trial', 1200, [
    ['trial-open', '試練の扉', 260, [effect('試練', '解放', 'trial', 1)], { milestone: true }],
    ['trial-seals', '封印の試練', 1500, [effect('宝石封印・技能制限', '解放', 'seals', 1)]],
    ['trial-slots', '重なる試練', 10000, [effect('試練同時選択枠', '2', 'slots', 2, 'max')]],
    ['trial-intrusion', '異変の兆し', 100000, [effect('追加敵の試練', '解放', 'intrusion', 1)], { parents: ['damage2', 'hp2'], row: 5 }],
    ['trial-solo', '孤星の旅路', 1000000, [effect('少人数の上位試練', '解放', 'solo', 1)], { parents: ['common200', 'skill50'], row: 16, milestone: true }],
  ], ['main-free', 'drop4'], '試練の扉で強靭・猛攻・頑強・女神の本気を解放。精算PTは今周の転生の女神撃破時の最高値。');
  const rateSteps = [
    [150, 300], [200, 500], [250, 800], [350, 1800], [500, 4000], [750, 6500],
    [1000, 10000], [1500, 18000], [2000, 30000], [3000, 50000], [5000, 80000],
    [10000, 200000], [20000, 500000], [30000, 1000000],
  ];
  let previousRate = 100;
  chain('harvest', 1360, rateSteps.map(([amount, cost]) => {
    const delta = amount - previousRate; previousRate = amount;
    return ['rate' + amount, amount === 30000 ? '星海の幸運' : '幸運 ' + amount.toLocaleString('ja-JP'), cost,
      [effect('ドロップ率', '＋' + delta.toLocaleString('ja-JP') + '%', 'rate', delta)], { milestone: amount === 30000 }];
  }), ['drop-rate'], 'パーティー共通で1回加算。ジェム制限中も有効。ドロップ数倍率とは別枠。', '収穫 / ドロップ率');
  const bossSteps = [
    ['gem-boss25', '素材の節約 I', 400], ['gem-boss50', '素材の節約 II', 4000],
    ['gem-boss75', '素材の節約 III', 40000], ['gem-boss-free', '欠片の創造', 400000],
  ];
  chain('gem', 1520, bossSteps.map(([id, name, cost], index) => [id, name, cost,
    [effect('制作の大ボス素材費', index === 3 ? '0' : (75 - index * 25) + '%', 'gemBossDiscount', 25)], { milestone: index === 3 }]),
    ['main-free'], 'ジェム制作の大ボス素材（星界の残滓を含む）。必要量75%→50%→25%→0、端数切り上げ。最終段階は欠片のみで制作。欠片の必要数は維持。地域Lv強化の結晶は対象外。', '制作 / 大ボス素材');
  // Match the drop-count progression; keep old IDs so existing purchases survive.
  const goldSteps = [[3, 100], [4, 120], ...dropSteps];
  chain('harvest', 1680, goldSteps.map(([amount, cost], index) => [
    index === 7 ? 'gold4' : amount === 100 ? 'gold100' : 'gold-step-' + (index + 1),
    amount === 100 ? '黄金の極星' : '黄金の記憶 ' + (index + 2), cost,
    [effect('ゴールド', '×' + amount, 'gold', amount, 'max')], { milestone: [20, 100].includes(amount) },
  ]), ['gold2'], 'ドロップ数倍率とは別枠。', '収穫 / ゴールド');
  const mapSize = { width: 1760, height: Math.ceil((Math.max(...nodes.map(n => n.y)) + 70) / 10) * 10 };
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const spent = state => [...state.owned].reduce((sum, id) => sum + (byId[id]?.cost || 0), 0);
  const points = state => state.total - spent(state);
  function status(state, id) {
    const n = byId[id]; if (!n) return 'unknown';
    if (state.owned.has(id)) return 'owned';
    if (!n.requires.every(p => state.owned.has(p))) return 'locked';
    return points(state) >= n.cost ? 'available' : 'unaffordable';
  }
  function totals(state) {
    const result = { drop: 1, gold: 1, xp: 0, skip: 1, damage: 100, hp: 100 };
    for (const id of state.owned) for (const e of byId[id]?.effects || []) {
      if (byId[id].family === 'trial') continue;
      if (e.operation === 'max') result[e.key] = Math.max(result[e.key] || 0, e.amount);
      else result[e.key] = (result[e.key] || 0) + e.amount;
    }
    return result;
  }
  const api = { families, nodes, byId, branches, experienceMultipliers, mapSize, spent, points, status, totals };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReincarnationTree = api;
})(globalThis);
