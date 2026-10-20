'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpecialStages = api;
})(globalThis, () => {
  const ID = 'dimensional-gate';
  const ASSET = 'assets/stages/dimensional-rift/';
  // Seven summons per regional family; alternate the two ruins stone variants.
  const mobBatch = (...families) => families.flatMap(family =>
    Array.from({ length: 7 }, (_, index) => Array.isArray(family) ? family[index % family.length] : family));
  const MOB_BATCHES = [
    mobBatch('slime','giga-toad','cave-bat','hermit-crab',['stone-guard','rune-gargoyle']),
    mobBatch('boar','mud-hand','cave-worm','lizardman','ancient-crossbowman'),
    mobBatch('alraune-minion','skeleton','cave-spider','octopus','floating-magic-core'),
  ];
  const BOSS_BATCHES = [
    ['boss-slime','king-toad','great-bat','great-hermit','armored-golem'],
    ['boss-boar','mud-giant','large-worm','lizard-chief','ancient-ballista'],
    ['alraune','lich','arachne','scylla','seraphina'],
  ];
  const MAJOR_BATCHES = [['treant','hydra','cave-troll','kraken','ancient-titan']];
  const GATES = ['dimensional-gate-small','dimensional-gate-large','dimensional-gate-giant'];
  const NAMES = ['次元の門','大きな次元の門','巨大な次元の門'];
  const BATCHES = [MOB_BATCHES, BOSS_BATCHES, MAJOR_BATCHES];
  const COLORS = ['#7af6ef','#dd85ff','#ffc66f'];
  const CHAOS = {
    ID: 'chaos-gate', ASSET: 'assets/stages/chaos-gate/',
    GATES: ['chaos-gate-small','chaos-gate-large','chaos-gate-giant'],
    NAMES: ['混沌の門','大きな混沌の門','巨大な混沌の門'],
    COLORS: ['#ff665e','#ffae52','#ff5eaf'],
    BATCHES: [
      [
        mobBatch('sand-scorpion','horn-jackal','frost-wolf','lava-salamander','demon-armored-soldier'),
        mobBatch('bandage-soldier','rock-horn-goat','ice-shell-golem','obsidian-soldier','imp'),
        mobBatch('sand-snake','wind-sprite','snow-spirit','young-fire-dragon','dream-demon'),
      ],
      [
        ['obsidian-scorpion','storm-jackal','fenrir','magma-salamander','black-knight'],
        ['golden-pharaoh','iron-horn','crystal-golem','obsidian-executioner','arch-demon'],
        ['lamia','harpy-queen','yuki-onna','dragon-girl','lilith'],
      ],
      [['sand-behemoth','manticore','ice-tusk-mammoth','dragon','demon-god']],
    ],
  };
  const RIFT = { ID, ASSET, GATES, NAMES, BATCHES, COLORS };
  const definition = id => id === CHAOS.ID ? CHAOS : RIFT;
  const ENEMIES = Object.fromEntries([RIFT, CHAOS].flatMap(config => config.GATES.map((id, tier) => [id, {
    name: config.NAMES[tier], specialId: config.ID, dimensionalGate: true, gateTier: tier, noDrop: true,
    hp: 1, damage: 0, defense: 0, range: 0, speed: 0, interval: 1e9,
    height: 210 + tier * 32, scale: 1, gold: 0, boss: true,
  }])));
  function stages(reference, chaosReference) {
    return [Object.freeze({
      id: ID, name: '次元の門', realmName: '次元の裂け目', english: 'DIMENSIONAL RIFT', materialRegions: [1,2,3,4,5], unlockLabel: '遺跡10', special: true,
      unlockStage: 50, region: 5, number: 10, level: 50, xpStage: 50,
      // Cover equipment gold costs when surplus crystals are converted to materials.
      dropLevel: 5, gemMultiplier: 2, asset: ASSET, reward: reference.reward * 3,
      enemyHp: reference.enemyHp, enemyDamage: reference.enemyDamage,
      majorBossHp: reference.majorBossHp, majorBossDefense: reference.majorBossDefense,
      majorBossDamage: reference.majorBossDamage,
      waves: GATES.map(id => [id]),
      enemies: [...GATES, ...new Set(BATCHES.flat(2))], total: 128,
    }), ...(chaosReference ? [Object.freeze({
      id: CHAOS.ID, name: '混沌の門', realmName: '混沌の門', english: 'CHAOS GATE', special: true,
      materialRegions: [6,7,8,9,10], unlockLabel: '魔王城10',
      unlockStage: 100, region: 10, number: 10, level: 100, xpStage: 100,
      dropLevel: 10, gemMultiplier: 2, asset: CHAOS.ASSET, reward: 12000,
      enemyHp: 1500, enemyDamage: 2000,
      majorBossHp: 1, majorBossDamage: 1, majorBossDefense: 4900,
      waves: CHAOS.GATES.map(id => [id]),
      enemies: [...CHAOS.GATES, ...new Set(CHAOS.BATCHES.flat(2))], total: 128,
    })] : [])];
  }
  // Normalize every region to its gate's class budget, retaining its
  // original behavior, ranges, speed and drops. Early enemies stay relevant.
  function profile(type, enemies, specialId = ID) {
    if(enemies[type].goddess || enemies[type].reincarnationGoddess)return enemies[type];
    const config = definition(specialId), base = enemies[type], major = config.BATCHES[2][0].includes(type);
    const reference = enemies[specialId === CHAOS.ID
      ? major ? 'demon-god' : base.boss ? 'black-knight' : 'demon-armored-soldier'
      : major ? 'ancient-titan' : base.boss ? 'armored-golem' : 'stone-guard'];
    return { ...base, hp: reference.hp, damage: reference.damage,
      defense: reference.defense, majorBoss: major };
  }
  return { ID, ASSET, GATES, NAMES, BATCHES, COLORS, CHAOS, definition, ENEMIES, stages, profile };
});
