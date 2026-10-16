'use strict';
((root, factory) => {
  const api = factory(typeof module === 'object' && module.exports ? require('../core/forest-progression.js') : root.ForestProgression, typeof module === 'object' && module.exports ? require('./expansion-data.js') : root.ExpansionData,typeof module==='object'&&module.exports?require('./ruins-data.js'):root.RuinsData,typeof module==='object'&&module.exports?require('./desert-data.js'):root.DesertData,typeof module==='object'&&module.exports?require('./highland-data.js'):root.HighlandData,typeof module==='object'&&module.exports?require('./glacier-data.js'):root.GlacierData,typeof module==='object'&&module.exports?require('./volcano-data.js'):root.VolcanoData,typeof module==='object'&&module.exports?require('./demon-castle-data.js'):root.DemonCastleData);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ForestData = api;
})(typeof globalThis === 'object' ? globalThis : this, (P, X, R, Desert, Highland, Glacier, Volcano, Castle) => {
  const HERO = Object.freeze({ name: '戦士', maxHp: 420, damage: 34, defense: 4, crit: 0.18,
    range: P.CHARACTERS.warrior.base.range, speed: 150, interval: 1080, skillDamage: 90, skillInterval: 6500 });
  const Special = typeof module === 'object' && module.exports ? require('./special-stages.js') : globalThis.SpecialStages;
  const Goddess = typeof module === 'object' && module.exports ? require('./goddess-data.js') : globalThis.GoddessData;
  const ENEMIES = {
    slime: { name: 'スライム', hp: 48, damage: 9, range: 68, speed: 70, interval: 1800, duration: 620, impact: 160, drop: 'jelly', gold: 3, scale: 1.2, height: 70 },
    'boss-slime': { name: 'ボススライム', hp: 440, damage: 24, range: 128, speed: 46, interval: 1900, duration: 640, impact: 180, drop: 'crystal', gold: 35, scale: 0.85, height: 140, boss: true },
    boar: { name: 'イノシシ', hp: 95, damage: 16, range: 100, speed: 115, interval: 1700, duration: 400, impact: 100, drop: 'tusk', gold: 6, scale: 0.85, height: 104 },
    'boss-boar': { name: 'ボスイノシシ', hp: 620, damage: 38, range: 135, speed: 85, interval: 2200, duration: 400, impact: 100, drop: 'crystal', gold: 45, scale: 0.8, height: 173, boss: true },
    'alraune-minion': { name: '植物クリーチャー', hp: 84, damage: 14, range: 310, speed: 52, interval: 2200, duration: 640, impact: 200, drop: 'flower', gold: 7, scale: 0.95, height: 132 },
    alraune: { name: 'アルラウネ', hp: 740, damage: 29, range: 330, speed: 30, interval: 2000, duration: 800, impact: 370, drop: 'crystal', gold: 55, scale: 0.884, height: 274.3, boss: true },
    treant: { name: 'トレント', hp: 1400, damage: 46, range: 350, speed: 24, interval: 2300, duration: 900, impact: 340, drop: 'wood', gold: 100, scale: 0.85, height: 224, boss: true },
    'giga-toad': { name: 'ギガトード', hp: 230, damage: 18, range: 260, speed: 68, interval: 1700, gold: 12, scale: .62, height: 103, region: 2, common: 'venom-sac' },
    'king-toad': { name: 'キングトード', hp: 1100, damage: 30, range: 220, speed: 52, interval: 1900, gold: 65, scale: .7, height: 172, region: 2, common: 'venom-sac', boss: true },
    'mud-hand': { name: '泥の手', hp: 270, damage: 20, range: 125, speed: 46, interval: 1500, gold: 14, scale: .64, height: 118, region: 2, common: 'living-mud' },
    'mud-giant': { name: '泥巨人', hp: 1400, damage: 34, range: 190, speed: 32, interval: 2100, gold: 75, scale: .72, height: 216, region: 2, common: 'living-mud', boss: true },
    skeleton: { name: 'スケルトン', hp: 240, damage: 20, range: 115, speed: 92, interval: 1500, gold: 14, scale: .65, height: 138, region: 2, common: 'cursed-bone' },
    lich: { name: 'リッチ', hp: 1200, damage: 30, range: 310, speed: 48, interval: 2000, gold: 85, scale: .7, height: 189, region: 2, common: 'cursed-bone', boss: true },
    hydra: { name: 'ヒュドラ', hp: 2600, damage: 38, range: 265, speed: 28, interval: 1900, gold: 160, scale: .82, height: 267, region: 2, common: 'venom-sac', boss: true, majorBoss: true },
  };
  for (const [id, enemy] of Object.entries(ENEMIES)) if (enemy.region === 2) enemy.drop = id === 'hydra' ? 'hydra-scale' : enemy.boss ? 'swamp-crystal' : enemy.common;
  Object.assign(ENEMIES, X.ENEMIES);
  Object.assign(ENEMIES,R.ENEMIES,Desert.ENEMIES,Highland.ENEMIES,Glacier.ENEMIES,Volcano.ENEMIES,Castle.ENEMIES);
  const ALL_ENEMIES = { ...ENEMIES, ...Special.ENEMIES, ...Goddess.ENEMIES };
  ENEMIES['cave-bat'].flying=true;ENEMIES['great-bat'].flying=true;
  const pack = (id, count) => Array(count).fill(id);
  // Stage-local profiles keep the easy 1/5 routes and other regions independent.
  // hp/damage are absolute stage multipliers, including newly summoned enemies.
  const STAGE_TUNING = {
    2: { hp: 1.44, damage: .595, formation: 'separate-bosses' },
    3: { hp: 1.44, damage: .44, formation: 'forest-boars' },
    4: { hp: 1.44, damage: .4, formation: 'separate-bosses' },
    6: { hp: 5.76, damage: .525, formation: 'separate-bosses' },
    7: { hp: 4.8, damage: .525, formation: 'separate-bosses' },
    8: { hp: 4.5, damage: .5, formation: 'separate-bosses' },
    9: { hp: 4.8, damage: .42, formation: 'separate-bosses' },
    10: { hp: 6, damage: .375, formation: 'separate-bosses' },
    12: { hp: 19.2, damage: .63, formation: 'separate-bosses' },
    13: { hp: 14.4, damage: .75, formation: 'separate-bosses' },
    14: { hp: 14.4, damage: .4, formation: 'separate-bosses' },
    16: { hp: 14.4, damage: .75, formation: 'separate-bosses' },
    17: { hp: 14.4, damage: .7, formation: 'separate-bosses' },
    18: { hp: 12.8, damage: .8, formation: 'separate-bosses' },
    19: { hp: 14.4, damage: .45, formation: 'separate-bosses' },
    20: { hp: 9.6, damage: .6, formation: 'separate-bosses' },
    22: { hp: 32, damage: 1.68, formation: 'separate-bosses', waveCount: 4 },
    23: { hp: 18.72, damage: 2.6, formation: 'separate-bosses', waveCount: 4 },
    24: { hp: 23.04, damage: 4.8, formation: 'separate-bosses', waveCount: 4 },
    26: { hp: 15.36, damage: 3.1, formation: 'separate-bosses', waveCount: 4 },
    27: { hp: 23.04, damage: 2.24, formation: 'separate-bosses', waveCount: 4 },
    28: { hp: 16, damage: 3.2, formation: 'separate-bosses', waveCount: 4 },
    29: { hp: 19.2, damage: 2.352, formation: 'separate-bosses', waveCount: 4 },
    30: { hp: 7.8, damage: 2.1, formation: 'separate-bosses', waveCount: 4, majorBossHp: .35, majorBossDamage: 2.5, majorBossDefense: 2000 },
    32: { hp: 28.8, damage: 4, formation: 'separate-bosses', waveCount: 4 },
    33: { hp: 38.4, damage: 2, formation: 'separate-bosses', waveCount: 4 },
    34: { hp: 30, damage: 3.36, formation: 'separate-bosses', waveCount: 4 },
    36: { hp: 19.2, damage: 2.4, formation: 'separate-bosses', waveCount: 4 },
    37: { hp: 22.5, damage: 3.5, formation: 'separate-bosses', waveCount: 4 },
    38: { hp: 19.2, damage: 4.8, formation: 'separate-bosses', waveCount: 4 },
    39: { hp: 16, damage: 2.8, formation: 'separate-bosses', waveCount: 4 },
    40: { hp: 8, damage: 7, formation: 'separate-bosses', waveCount: 4, majorBossHp: .75, majorBossDefense: 3000 },
    ...R.TUNING,
    ...Desert.TUNING,
    ...Highland.TUNING,
    ...Glacier.TUNING,
    ...Volcano.TUNING,
    ...Castle.TUNING,
  };
  function tuneStage(stage, profile = STAGE_TUNING[stage.id]) {
    if (!profile) return stage;
    let waves = stage.waves;
    if (profile.formation === 'forest-boars') waves = [pack('boar', 3), pack('boar', 3), ['boss-boar', ...pack('boar', 2)]];
    if (profile.formation === 'separate-bosses') {
      const bosses = waves.flat().filter(id => ENEMIES[id].boss), mobs = waves.flat().filter(id => !ENEMIES[id].boss);
      if (profile.waveCount) {
        // Keep species/reward totals. The last boss always has its own wave.
        const split = (ids, count) => Array.from({ length: count }, (_, i) =>
          ids.slice(Math.ceil(i * ids.length / count), Math.ceil((i + 1) * ids.length / count)));
        const bossWaves = Math.min(bosses.length, profile.waveCount - 1);
        waves = [...split(mobs, Math.min(mobs.length, profile.waveCount - bossWaves)),
          ...split(bosses, bossWaves)];
      } else if (bosses.length === 1) {
        const middle = Math.ceil(mobs.length / 2);
        waves = [mobs.slice(0, middle), mobs.slice(middle), bosses];
      } else if (bosses.length > 1) waves = [mobs, bosses.slice(0, -1), bosses.slice(-1)];
    }
    return { ...stage, waves, enemyHp: profile.hp ?? stage.enemyHp, enemyDamage: profile.damage ?? stage.enemyDamage,
      ...(profile.majorBossHp !== undefined ? { majorBossHp: profile.majorBossHp } : {}),
      ...(profile.majorBossDamage !== undefined ? { majorBossDamage: profile.majorBossDamage } : {}),
      ...(profile.majorBossDefense !== undefined ? { majorBossDefense: profile.majorBossDefense } : {}),
      enemies: [...new Set(waves.flat())], total: waves.flat().length };
  }
  const STAGES = [
    { id: 1, name: '木漏れ日の小道', waves: Array.from({ length: 3 }, () => ['slime', 'boar', 'alraune-minion']) },
    { id: 2, name: '蒼い水辺', waves: [pack('slime', 5), pack('slime', 6), ['boss-slime', ...pack('slime', 3)]] },
    { id: 3, name: '獣の通り道', waves: [pack('boar', 4), pack('boar', 5), ['boss-boar', ...pack('boar', 3)]] },
    { id: 4, name: '妖花の庭', waves: [pack('alraune-minion', 4), pack('alraune-minion', 5), ['alraune', ...pack('alraune-minion', 3)]] },
    { id: 5, name: '群れる森', waves: Array.from({ length: 3 }, () => [...pack('slime', 4), ...pack('boar', 4), ...pack('alraune-minion', 4)]) },
    { id: 6, name: '獣と雫', waves: [[...pack('slime', 4), ...pack('boar', 3)], ['boss-slime', ...pack('boar', 4)], ['boss-boar', ...pack('slime', 5)]] },
    { id: 7, name: '花咲く水辺', waves: [[...pack('slime', 4), ...pack('alraune-minion', 3)], ['boss-slime', ...pack('alraune-minion', 4)], ['alraune', ...pack('slime', 5)]] },
    { id: 8, name: '茨の獣道', waves: [[...pack('boar', 4), ...pack('alraune-minion', 3)], ['boss-boar', ...pack('alraune-minion', 4)], ['alraune', ...pack('boar', 4)]] },
    { id: 9, name: '深緑の守り手', waves: [['slime', 'boar', 'alraune-minion', ...pack('slime', 3)], ['boss-slime', 'boss-boar', ...pack('alraune-minion', 3)], ['alraune', 'slime', 'boar', 'alraune-minion']] },
    { id: 10, name: '古樹の心臓', waves: [['slime', 'boar', 'alraune-minion', ...pack('boar', 3)], ['boss-slime', 'boss-boar', 'alraune', 'alraune-minion'], ['treant', 'slime', 'boar', 'alraune-minion']] },
    { id: 11, name: '毒蛙の水辺', waves: Array.from({ length: 3 }, () => ['giga-toad', 'mud-hand', 'skeleton']) },
    { id: 12, name: '毒蛙の王座', waves: [pack('giga-toad', 5), pack('giga-toad', 6), ['king-toad', ...pack('giga-toad', 3)]] },
    { id: 13, name: '蠢く泥地', waves: [pack('mud-hand', 4), pack('mud-hand', 5), ['mud-giant', ...pack('mud-hand', 3)]] },
    { id: 14, name: '亡者の祭壇', waves: [pack('skeleton', 4), pack('skeleton', 5), ['lich', ...pack('skeleton', 3)]] },
    { id: 15, name: '沼地の大群', waves: Array.from({ length: 3 }, () => [...pack('giga-toad', 4), ...pack('mud-hand', 4), ...pack('skeleton', 4)]) },
    { id: 16, name: '毒と泥の淵', waves: [[...pack('giga-toad', 4), ...pack('mud-hand', 3)], ['king-toad', ...pack('mud-hand', 4)], ['mud-giant', ...pack('giga-toad', 5)]] },
    { id: 17, name: '毒蛙と亡者', waves: [[...pack('giga-toad', 4), ...pack('skeleton', 3)], ['king-toad', ...pack('skeleton', 4)], ['lich', ...pack('giga-toad', 5)]] },
    { id: 18, name: '泥に沈む墓所', waves: [[...pack('mud-hand', 4), ...pack('skeleton', 3)], ['mud-giant', ...pack('skeleton', 4)], ['lich', ...pack('mud-hand', 4)]] },
    { id: 19, name: '瘴気の守り手', waves: [['giga-toad', 'mud-hand', 'skeleton', ...pack('giga-toad', 3)], ['king-toad', 'mud-giant', ...pack('skeleton', 3)], ['lich', 'giga-toad', 'mud-hand', 'skeleton']] },
    { id: 20, name: '五首の毒竜', waves: [['giga-toad', 'mud-hand', 'skeleton', ...pack('mud-hand', 3)], ['king-toad', 'mud-giant', 'lich', 'skeleton'], ['hydra', 'giga-toad', 'mud-hand', 'skeleton']] },
    ...X.STAGES,
    ...R.STAGES,
    ...Desert.STAGES,
    ...Highland.STAGES,
    ...Glacier.STAGES,
    ...Volcano.STAGES,
    ...Castle.STAGES,
  ].map(stage => Object.freeze(tuneStage({ ...stage, region: Math.ceil(stage.id / 10), number: (stage.id - 1) % 10 + 1, level: stage.id,
    enemyHp: stage.id > 10 ? 1 : stage.id >= 5 ? 1.15 : 1, enemyDamage: stage.id > 10 ? 1 : stage.id === 4 ? .55 : stage.id >= 5 ? 2 : 1,
    enemies: [...new Set(stage.waves.flat())], total: stage.waves.flat().length, reward: stage.id * 20 })));
  const REGIONS = [
    { id: 1, name: '始まりの森', english: 'THE FIRST WOODLAND', path: 'FOREST PATH', asset: 'starting-forest', crystal: 'crystal' },
    { id: 2, name: '毒の沼地', english: 'THE POISON SWAMP', path: 'SWAMP PATH', asset: 'poison-swamp', crystal: 'swamp-crystal' },
    ...X.REGIONS,
    ...R.REGIONS,
    ...Desert.REGIONS,
    ...Highland.REGIONS,
    ...Glacier.REGIONS,
    ...Volcano.REGIONS,
    ...Castle.REGIONS,
  ];
  const SPECIAL_STAGES = [...Special.stages(STAGES.find(s => s.id === 50), STAGES.find(s => s.id === 100)),Goddess.STAGE];
  const ALL_STAGES = [...STAGES, ...SPECIAL_STAGES];
  const stageLabel = id => { const stage = ALL_STAGES.find(s => s.id === id); return stage ? stage.special ? stage.name : stage.region + '-' + stage.number : ''; };
  const stageId = value => ALL_STAGES.find(s => String(s.id) === String(value))?.id;
  const nextStage = id => { const stage = ALL_STAGES.find(s => s.id === id); return id==='chaos-gate'?Goddess.STAGE:stage && !stage.special ? STAGES.find(s => s.id === id + 1) : undefined; };
  const RARITIES = {
    common: { name: 'コモン', english: 'COMMON', color: '#ffffff', rank: 0 },
    uncommon: { name: 'アンコモン', english: 'UNCOMMON', color: '#7ddcff', rank: 1 },
    rare: { name: 'レア', english: 'RARE', color: '#b78aff', rank: 2 },
    unique: { name: 'ユニーク', english: 'UNIQUE', color: '#ff4fd8', rank: 3 },
    legendary: { name: 'レジェンダリー', english: 'LEGENDARY', color: '#ffc655', rank: 4 },
    epic: { name: 'エピック', english: 'EPIC', color: '#c6eeff', rank: 5, revealStage: Goddess.ID },
  };
  const EQUIPMENT = [
    { id: 'sword', name: '旅立ちの大剣', type: 'equipment', icon: 0, rarity: 'common', note: '初期装備 · 攻撃力 34', slot: 'weapon' },
    { id: 'armor', name: '革の鎧', type: 'equipment', icon: 1, rarity: 'common', note: '初期装備 · 防御力 4', slot: 'armor' },
    { id: 'staff', name: '風詠みの杖', note: '魔法使いの武器 · 始まりの森 1-4で加入' },
    { id: 'robe', name: '風織りのローブ', note: '魔法使いの防具 · 始まりの森 1-4で加入' },
    { id:'mace',name:'聖騎士のメイス',note:'パラディンの武器' },
    { id:'plate',name:'聖騎士の重装',note:'パラディンの防具' },
    { id:'shuriken',name:'影鋼の手裏剣',note:'忍者の武器' },
    { id:'ninja-garb',name:'影織りの忍装',note:'忍者の防具' },
    { id:'gohei',name:'招霊の御幣',note:'巫女の武器' },
    { id:'miko-robes',name:'紅白の神楽装束',note:'巫女の防具' },
  ];
  const ITEMS = [
    { id: 'jelly', name: 'スライムの雫', type: 'material', icon: 5, rarity: 'common', note: 'スライムから手に入る素材' },
    { id: 'tusk', name: '獣の牙', type: 'material', icon: 6, rarity: 'common', note: 'イノシシから手に入る素材' },
    { id: 'flower', name: '妖花の花びら', type: 'material', icon: 7, rarity: 'common', note: '植物クリーチャーから手に入る素材' },
    { id: 'wood', name: '古樹の欠片', type: 'material', icon: 8, rarity: 'rare', note: 'トレントから手に入る素材' },
    { id: 'potion', name: '回復薬', type: 'consumable', icon: 9, rarity: 'common', note: 'HP回復 126 · 戦闘中 · 初回報酬' },
    { id: 'crystal', name: '森の結晶', type: 'material', art: 'bosscrystal', rarity: 'uncommon', note: '地域ボス / 大ボスの素材' },
    { id: 'venom-sac', name: '毒蛙の毒袋', type: 'material', rarity: 'common', note: 'カエル系 / ヒュドラの素材' },
    { id: 'living-mud', name: '蠢く泥', type: 'material', rarity: 'common', note: '泥系の素材' },
    { id: 'cursed-bone', name: '呪われた骨', type: 'material', rarity: 'common', note: 'アンデッド系の素材' },
    { id: 'swamp-crystal', name: '沼地の結晶', type: 'material', rarity: 'uncommon', note: '毒の沼地のボス / 大ボスの素材' },
    { id: 'hydra-scale', name: 'ヒュドラの鱗', type: 'material', rarity: 'rare', note: 'ヒュドラの素材' },
    ...X.ITEMS,
    ...R.ITEMS,
    ...Desert.ITEMS,
    ...Highland.ITEMS,
    ...Glacier.ITEMS,
    ...Volcano.ITEMS,
    ...Castle.ITEMS,
    ...P.Gem.shardItems,
    P.Gem.Epic.material,
    ...Object.entries(P.GEMS).map(([id, gem]) => ({ id, name: gem.name, type: 'gem', ...(gem.image?{image:gem.image}:{}), rarity: gem.rarity, note: gem.note })),
  ];
  const SAVE_KEY = 'forest-idle-save-v1';
  const SAVE_VERSION = 2;
  const AutoGear = typeof module === 'object' && module.exports ? require('../core/forest-auto-gear.js') : globalThis.ForestAutoGear;
  const freshSave = () => ({ version: SAVE_VERSION, gemVersion: P.Gem.VERSION, gold: 0, goldRemainder: 0, cleared: [], encounteredEnemies: [], discoveredGemRarities: [], inventory: { potion: 3 }, gems: [], nextGemId: 1, selectedStage: 1, autoMode: 'same', autoGear: AutoGear.fresh(), autoGemDismantle: P.Gem.freshAutoDismantle(), speed: 1, progression: P.fresh() });
  function readSave(raw) {
    try {
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== SAVE_VERSION) return freshSave();
      const clean = freshSave();
      const integer = n => Number.isSafeInteger(n) && n >= 0;
      if (integer(saved.gold)) clean.gold = saved.gold;
      if (Number.isFinite(saved.goldRemainder) && saved.goldRemainder >= 0 && saved.goldRemainder < 1) clean.goldRemainder = saved.goldRemainder;
      if (Array.isArray(saved.cleared)) clean.cleared = [...new Set(saved.cleared.filter(n => ALL_STAGES.some(s => s.id === n)))];
      for (const item of ITEMS.filter(i => i.type !== 'gem')) if (integer(saved.inventory?.[item.id])) clean.inventory[item.id] = saved.inventory[item.id];
      const ids = new Set();
      const currentGems = saved.gemVersion === P.Gem.VERSION;
      if (currentGems && Array.isArray(saved.gems)) for (const rawGem of saved.gems) {
        const gem = P.Gem.validate(rawGem);
        if (gem && integer(gem.id) && gem.id > 0 && !ids.has(gem.id)) { clean.gems.push(gem); ids.add(gem.id); }
      }
      if (!currentGems) for (const item of P.Gem.shardItems) delete clean.inventory[item.id];
      clean.encounteredEnemies = [...new Set(Array.isArray(saved.encounteredEnemies)
        ? saved.encounteredEnemies.filter(id => Object.hasOwn(ALL_ENEMIES, id))
        : ALL_STAGES.filter(s => clean.cleared.includes(s.id)).flatMap(s => s.waves.flat()))];
      if (currentGems) {
        clean.discoveredGemRarities = [...new Set((Array.isArray(saved.discoveredGemRarities) ? saved.discoveredGemRarities : []).filter(r => Object.hasOwn(P.Gem.TIERS,r)))];
        for (const r of Object.keys(P.Gem.TIERS)) if (P.Gem.rarityDiscovered(clean,r)) P.Gem.rememberRarity(clean,r);
      }
      clean.nextGemId = Math.max(1, ...clean.gems.map(g => g.id + 1), currentGems && integer(saved.nextGemId) ? saved.nextGemId : 1);
      clean.autoMode = ['off', 'same', 'advance'].includes(saved.autoMode) ? saved.autoMode : 'same';
      clean.autoGear = AutoGear.restore(saved.autoGear);
      clean.autoGemDismantle = P.Gem.restoreAutoDismantle(saved.autoGemDismantle);
      clean.speed = [1, 2].includes(saved.speed) ? saved.speed : 1;
      if (ALL_STAGES.some(s => s.id === saved.selectedStage) && isUnlocked(clean, saved.selectedStage)) clean.selectedStage = saved.selectedStage;
      clean.progression = P.restore(saved.progression, clean.cleared, clean.gems);
      return clean;
    } catch { return freshSave(); }
  }
  function isUnlocked(save, id) { const stage = ALL_STAGES.find(s => s.id === id); return !!stage && (id === 1 || save.cleared.includes(stage.unlockStage ?? id - 1)); }
  function isRevealed(save, content) { return !content?.revealStage || isUnlocked(save, content.revealStage) || save.cleared.includes(content.revealStage); }
  const stageVisible = (save, stage) => !!stage && isRevealed(save, stage) && (isUnlocked(save, stage.id) || save.cleared.includes(stage.id));
  const regionVisible = (save, region) => STAGES.some(s => s.region === region && stageVisible(save, s));
  const enemyDiscovered = (save, id) => !!ALL_ENEMIES[id] && (save.encounteredEnemies?.includes(id) || ALL_STAGES.some(s => save.cleared.includes(s.id) && s.waves.some(w => w.includes(id))));
  const itemDiscovered = (save, item) => !!item && (item.id.startsWith('gem-shard-')
    ? P.Gem.rarityDiscovered(save, item.rarity) : isRevealed(save, item) && Object.hasOwn(save.inventory, item.id));
  function recordEncounters(save, enemies) {
    let changed = false;
    save.encounteredEnemies ||= [];
    for (const id of enemies) if (Object.hasOwn(ALL_ENEMIES, id) && !save.encounteredEnemies.includes(id)) { save.encounteredEnemies.push(id); changed = true; }
    return changed;
  }
  function addGold(wallet, baseGold, treasureHunt = 0) {
    const bonus = Math.max(0, Number.isFinite(treasureHunt) ? treasureHunt : 0);
    const remainder = Number.isFinite(wallet.goldRemainder) && wallet.goldRemainder >= 0 && wallet.goldRemainder < 1 ? wallet.goldRemainder : 0;
    const raw = baseGold * (1 + bonus) + remainder, nearest = Math.round(raw);
    // Preserve fractions while correcting floating-point errors at whole-gold boundaries.
    const total = Math.abs(raw - nearest) <= Number.EPSILON * 8 * Math.max(1, raw) ? nearest : raw;
    const gold = Math.floor(total);
    wallet.gold += gold; wallet.goldRemainder = total - gold;
    return gold;
  }
  function award(save, stageId, treasureHunt = 0) {
    const stage = ALL_STAGES.find(s => s.id === stageId);
    if (!stage) throw new RangeError('Unknown stage');
    const first = !save.cleared.includes(stageId);
    const gold = addGold(save, stage.reward, treasureHunt);
    if (first) {
      save.cleared.push(stageId);
      if (!stage.special) save.inventory.potion = (save.inventory.potion || 0) + 1;
      if (stageId === CHAR_MAGE_STAGE) save.progression.characters.mage.xp = P.experience(CHAR_MAGE_STAGE);
      if (stageId === 10) save.progression.characters.paladin.xp=P.experience(10);
      if (stageId === 20&&P.recruitNinja(save)) save.progression.characters.ninja.skipRecruitReward=20;
        if (stageId === 30&&P.recruitShaman(save)) save.progression.characters.shaman.skipRecruitReward=30;
      if(stageId===40&&P.recruitMiko(save))save.progression.characters.miko.skipRecruitReward=40;
    }
    return { gold, first, potion: first && !stage.special ? 1 : 0, recruited: first && stageId === 4 ? 'mage' : first&&stageId===10?'paladin':first&&stageId===20?'ninja':first&&stageId===30?'shaman':first&&stageId===40?'miko':null };
  }
  const CHAR_MAGE_STAGE = P.CHARACTERS.mage.unlock;
  function autoDestination(save, stageId, victory) {
    if (save.autoMode === 'off') return null;
    const stage = ALL_STAGES.find(s => s.id === stageId);
    if (!victory) return { stage: stage?.special ? stage.unlockStage : Math.max(1, stageId - 1), mode: 'same' };
    const next = nextStage(stageId);
    return { stage: save.autoMode === 'advance' && next && isUnlocked(save, next.id) ? next.id : stageId, mode: save.autoMode };
  }
  function rollMaterials(enemyId, random = Math.random, treasureHunt = 0) {
    const enemy = ALL_ENEMIES[enemyId];
    if(enemy?.goddess){const chance=.3*(1+Math.max(0,Number.isFinite(treasureHunt)?treasureHunt:0)),n=Math.floor(chance),tail=chance-n;return Array(n+(tail>0&&random()<tail?1:0)).fill(P.Gem.Epic.MATERIAL);}
    if (!enemy || enemy.noDrop || enemy.noMaterials) return [];
    const common = enemy.common || { slime: 'jelly', 'boss-slime': 'jelly', boar: 'tusk', 'boss-boar': 'tusk', 'alraune-minion': 'flower', alraune: 'flower', treant: 'flower' }[enemyId];
    const drops = [];
    const multiplier = 1 + Math.max(0, Number.isFinite(treasureHunt) ? treasureHunt : 0);
    const add = (item, baseChance) => {
      const rawChance = baseChance * multiplier, nearest = Math.round(rawChance);
      // Adding multiple +20% gems can leave a tiny error at an exact 100% boundary.
      const chance = Math.abs(rawChance - nearest) <= Number.EPSILON * 8 * Math.max(1, rawChance) ? nearest : rawChance;
      const guaranteed = Math.floor(chance), remainder = chance - guaranteed;
      const count = guaranteed + (remainder > 0 && random() < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) drops.push(item);
    };
    add(common, enemy.boss ? 1 : .3);
    if (enemy.boss) add(REGIONS[(enemy.region || 1) - 1].crystal, enemyId === 'treant' || enemy.majorBoss ? 1 : .3);
    if (enemyId === 'treant') add('wood', .3);
    if (enemyId === 'hydra') add('hydra-scale', .3);
    if (enemy.majorBoss && enemy.region >= 3) add(REGIONS[enemy.region - 1].rare, .3);
    return drops;
  }
  function gemDropRates(region = 1, treasureHunt = 0, dropMultiplier = 1) {
    const bonus = Math.max(0, Number.isFinite(treasureHunt) ? treasureHunt : 0);
    const base = { rare: .05, unique: .005, legendary: region >= 6 ? .0005 : 0 };
    const multiplier = (1 + bonus) * Math.max(0, Number.isFinite(dropMultiplier) ? dropMultiplier : 1);
    return Object.fromEntries(Object.entries(base).map(([key,value])=>[key,value*multiplier]));
  }
  function rollGems(enemyId, random = Math.random, treasureHunt = 0, options = {}) {
    const enemy = ALL_ENEMIES[enemyId];
    if (!enemy?.boss || enemy.noDrop) return [];
    const region = enemy.goddess ? 10 : options.level ?? enemy.region ?? 1;
    const hunt = 1 + Math.max(0, Number.isFinite(treasureHunt) ? treasureHunt : 0);
    const rates = enemy.goddess ? { epic: .01 * hunt, legendary: .1 * hunt }
      : gemDropRates(region, treasureHunt, options.multiplier);
    const rarities = enemy.goddess ? ['epic', 'legendary'] : ['legendary', 'unique', 'rare'];
    const roll = random(), counts = [];
    let offset = 0;
    for (const rarity of rarities) {
      const raw = rates[rarity], nearest = Math.round(raw);
      const chance = Math.abs(raw - nearest) <= Number.EPSILON * 8 * Math.max(1, raw) ? nearest : raw;
      const guaranteed = Math.floor(chance), remainder = chance - guaranteed;
      // Fractional intervals wrap around a unit circle. Below 100% total this
      // preserves the original exclusive roll; overflow never caps any rarity.
      const end = offset + remainder;
      const extra = remainder > 0 && ((roll >= offset && roll < end) || (end > 1 && roll < end - 1));
      counts.push([rarity, guaranteed + (extra ? 1 : 0)]);
      offset = end >= 1 ? end - 1 : end;
    }
    return counts.flatMap(([rarity, count]) => Array.from({ length: count }, () => P.Gem.generate({ rarity, level: region, random })));
  }
  return { HERO, ENEMIES, ALL_ENEMIES, STAGES, SPECIAL_STAGES, ALL_STAGES, STAGE_TUNING, tuneStage, REGIONS, stageLabel, stageId, nextStage, ITEMS, EQUIPMENT, RARITIES, SAVE_KEY, SAVE_VERSION, freshSave, readSave, isUnlocked, isRevealed, stageVisible, regionVisible, enemyDiscovered, itemDiscovered, recordEncounters, award, addGold, autoDestination, rollMaterials, rollGems, gemDropRates };
});
