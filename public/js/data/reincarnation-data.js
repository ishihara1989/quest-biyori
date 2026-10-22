'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReincarnationData = api;
})(globalThis, () => {
  const ID = 'reincarnation-goddess';
  const ENEMIES = { [ID]: { name: '転生の女神', reincarnationGoddess: true, region: 10, boss: true, majorBoss: true,
    hp: 2e10, damage: 850000, defense: 4900, speed: 0, range: 1100, interval: 3000,
    height: 240, scale: .8, gold: 18000, noMaterials: true, noDrop: true } };
  const STAGE = Object.freeze({ id: ID, revealStage: ID, name: '転生の女神', realmName: '女神の配送センター',
    english: 'DIVINE DELIVERY SERVICE', special: true, reincarnation: true, unlockStage: 'extradimensional-goddess',
    unlockLabel: '異次元の女神', region: 10, number: 1, level: 100, xpStage: 100, dropLevel: 10,
    gemMultiplier: 1, materialRegions: [], asset: 'assets/stages/extradimensional-goddess/', reward: 30000,
    enemyHp: 1, enemyDamage: 1, majorBossHp: 1, majorBossDamage: 1, majorBossDefense: 4900,
    timeLimit: 180000, waves: [[ID]], enemies: [ID], total: 1 });
  // Trial variant replaces the chaos-gate successor while retaining its stage ID.
  const DUO_STAGE = Object.freeze({ ...STAGE, id: 'extradimensional-goddess', revealStage: 'extradimensional-goddess',
    name: '異次元の女神＋転生の女神', realmName: '二柱の御座', english: 'TWO GODDESSES',
    final: true, goddessDuo: true, unlockStage: 'chaos-gate', unlockLabel: '混沌の門',
    waves: [['extradimensional-goddess', ID]], enemies: ['extradimensional-goddess', ID], total: 2 });
  const ATTACKS = [
    { id: 'pulse', name: 'パルス散弾機関砲', warn: 700, duration: 1800, hits: 6, budget: .20 },
    { id: 'laser', name: '陽電子レール砲', warn: 1500, duration: 2200, hits: 1, budget: .32 },
    { id: 'missiles', name: '追尾ミサイル配送', warn: 1000, duration: 2400, hits: 3, budget: .24 },
    { id: 'discs', name: '重力ブーメラン', warn: 900, duration: 2500, hits: 2, budget: .20 },
    { id: 'orbital', name: '衛星スタンプ砲', warn: 1400, duration: 2100, hits: 1, budget: .28 },
    { id: 'truck', name: '大型トラック', warn: 4060, duration: 5300, hits: 1, budget: .36 },
  ];
  return { ID, ENEMIES, STAGE, DUO_STAGE, ATTACKS, POINTS: 100 };
});
