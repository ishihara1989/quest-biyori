'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GemSystem = api;
})(globalThis, () => {
  const Epic = typeof module === 'object' && module.exports ? require('../data/epic-gems.js') : globalThis.EpicGems;
  const Tree = typeof module === 'object' && module.exports ? require('../data/reincarnation-tree-data.js') : globalThis.ReincarnationTree;
  const known = (save,id) => save.cleared.includes(id) || save.reincarnation?.passed?.includes(id) || save.reincarnation?.lifetimeStages?.includes(id) || save.reincarnation?.lifetimePassed?.includes(id);
  const history = save => save.achievements ||= {version:1,earned:{},epics:[],trees:[],usage:[]};
  function rememberEpic(save,gem){if(gem.rarity==='epic'&&!history(save).epics.includes(gem.family))history(save).epics.push(gem.family);}
  function markUsage(save,key){if(!history(save).usage.includes(key))history(save).usage.push(key);}
  function craftingCost(save,cost){if(!save||!cost)return cost;const b=Tree.totals({owned:new Set(save.reincarnation?.owned||[])});return Object.fromEntries(Object.entries(cost).map(([id,n])=>[id,id.startsWith('gem-shard-')?n:Math.ceil(n*(100-Math.min(100,b.gemBossDiscount||0))/100)]).filter(([,n])=>n>0));}
  const VERSION = 1, DIRECTIONS = ['attack', 'defense', 'utility'];
  const TIERS = { rare: { rank: 0, units: .5, capacity: 100, count: 1 }, unique: { rank: 1, units: 2.3, capacity: 340, count: 2 }, legendary: { rank: 2, units: 5.152, capacity: 580, count: 4 }, epic: { rank: 3, fixed: true, count: 1 } };
  const JOBS = ['warrior', 'mage', 'paladin', 'ninja', 'shaman', 'miko'];
  const PHYSICAL = ['warrior', 'paladin', 'ninja'], MAGIC = ['mage', 'shaman', 'miko'];
  const INTERRUPT = JOBS.filter(id => id !== 'miko');
  const REGIONS = [
    { crystal: 'crystal', rare: 'wood' }, { crystal: 'swamp-crystal', rare: 'hydra-scale' },
    { crystal: 'cave-crystal', rare: 'troll-stone' }, { crystal: 'coast-crystal', rare: 'kraken-pearl' },
    { crystal: 'ruins-crystal', rare: 'ancient-core' }, { crystal: 'desert-crystal', rare: 'behemoth-horn' },
    { crystal: 'highland-crystal', rare: 'manticore-tail' },
    { crystal: 'glacier-crystal', rare: 'mammoth-ice-tusk' },
    { crystal: 'volcano-crystal', rare: 'dragon-furnace-heart' },
    { crystal: 'castle-crystal', rare: 'demon-god-heart' },
  ];
  const OPTIONS = {
    attack: { name: '攻撃力', direction: 'attack', key: 'damage', scaled: true, jobs: JOBS, icon: 'attack-gem', value: r => r.attack * .08 },
    physical: { name: '物理攻撃力', direction: 'attack', key: 'weaponFlat', scaled: true, jobs: PHYSICAL, icon: 'edgegem', value: r => r.attack * .09 },
    magic: { name: '魔法攻撃力', direction: 'attack', key: 'magicFlat', scaled: true, jobs: MAGIC, icon: 'arcanegem', value: r => r.attack * .09 },
    vitality: { name: '最大HP', direction: 'defense', key: 'maxHp', scaled: true, jobs: JOBS, icon: 'heartgem', value: r => r.hp * .08 },
    defense: { name: '防御力', direction: 'defense', key: 'defense', scaled: true, jobs: JOBS, icon: 'defense-gem', value: r => (80 + r.defense) * .08 },
    recovery: { name: 'MP自然回復', direction: 'utility', key: 'mpRegen', scaled: true, jobs: JOBS, icon: 'utility-gem', value: r => r.mp * .007, suffix: ' / 秒' },
    haste: { name: '再使用回復速度', direction: 'utility', key: 'haste', min: 1, jobs: JOBS, icon: 'clockgem', value: () => .12, percent: true },
    range: { name: 'スキル範囲', direction: 'attack', key: 'skillRange', min: 1, jobs: JOBS, icon: 'prism', value: () => 24 },
    interference: { name: '行動妨害力', direction: 'attack', key: 'interferencePower', min: 1, jobs: INTERRUPT, icon: 'interference', value: () => .20, percent: true },
    penetration: { name: '妨害抵抗貫通', direction: 'attack', key: 'interferencePenetration', min: 1, jobs: INTERRUPT, icon: 'interference', value: () => .10, percent: true },
    fortune: { name: 'ドロップ率', direction: 'utility', key: 'treasureHunt', min: 1, jobs: JOBS, icon: 'treasure', value: () => .20, percent: true, fixed: true, rarityScaled: true },
    echo: { name: '残響追撃', direction: 'attack', key: 'gemEcho', min: 2, jobs: JOBS, icon: 'legendary', value: () => .20, percent: true, suffix: ' / 1秒' },
    siphon: { name: '命中MP回復', direction: 'attack', key: 'gemSiphon', min: 2, jobs: JOBS, icon: 'legendary', value: () => .015, percent: true, suffix: ' / 1秒' },
    aegis: { name: '被弾バリア', direction: 'defense', key: 'gemAegis', min: 2, jobs: JOBS, icon: 'legendary', value: () => .06, percent: true, suffix: ' / 5秒' },
    execution: { name: '瀕死追撃', direction: 'attack', key: 'gemExecution', min: 2, jobs: JOBS, icon: 'legendary', value: () => .30, percent: true, suffix: ' / HP30%以下 / 1秒' },
    reprisal: { name: '被弾MP回復', direction: 'defense', key: 'gemMpOnHurt', min: 2, jobs: JOBS, icon: 'legendary-reprisal', value: () => .025, percent: true, suffix: ' / 1秒' },
    timeshift: { name: '被弾クール回復', direction: 'defense', key: 'gemCooldownOnHurt', min: 2, jobs: JOBS, icon: 'legendary-timeshift', value: () => .625, decimal: true, suffix: '秒 / 1秒' },
    resistance: { name: '状態異常抵抗', direction: 'defense', key: 'statusResistance', min: 1, jobs: JOBS, icon: 'status-resistance', value: () => .20, percent: true, fixed: true },
  };
  const NAMES = { attack: '烈撃', physical: '剣撃', magic: '魔導', vitality: '生命', defense: '守護', recovery: '息吹', haste: '詠唱', range: '星界', interference: '破勢', penetration: '穿勢', fortune: '探宝', echo: '残響', siphon: '霊泉', aegis: '天盾', execution: '終焉', reprisal: '還魔', timeshift: '還刻', resistance: '浄護' };
  const TYPES = {};
  for (const [rarity, tier] of Object.entries(TIERS).filter(([,tier])=>!tier.fixed)) for (const [family, option] of Object.entries(OPTIONS)) if ((option.min || 0) <= tier.rank) {
    const type = rarity + '-' + family;
    TYPES[type] = { type, family, rarity, name: NAMES[family] + 'のジェム', image: icon(family, rarity) };
  }
  for(const d of Object.values(Epic.DEFINITIONS)){
    OPTIONS[d.family]={name:d.name,direction:d.slot==='weapon'?'attack':'defense',key:d.key,min:3,jobs:[d.job],fixed:true,value:()=>1,revealStage:Epic.GODDESS};
    TYPES['epic-'+d.family]={type:'epic-'+d.family,family:d.family,rarity:'epic',name:d.name,image:d.image};
  }
  let references = [{ attack: 108, hp: 984, defense: 23, mp: 116 }];
  function configureReferences(rows) { references = rows.map(row => ({ ...row })); }
  function icon(family, rarity) {
    if(rarity==='epic')return Epic.DEFINITIONS[family].image;
    if(family==='resistance')return 'assets/ui/gems/status-resistance.png';
    if(['reprisal','timeshift'].includes(family))return 'assets/ui/gems/legendary-'+family+'.png';
    const art = OPTIONS[family]?.icon || 'attack-gem';
    return ['interference', 'treasure', 'legendary'].includes(art) || rarity === 'legendary'
      ? 'assets/ui/gems/' + (rarity === 'legendary' ? 'legendary' : art) + '.png'
      : 'assets/ui/progression/' + art + '.png';
  }
  function compatible(keys) {
    return JOBS.filter(job => keys.every(key => OPTIONS[key]?.jobs?.includes(job)));
  }
  function canRollTogether(keys) {
    const directions = keys.map(key => OPTIONS[key]?.direction);
    return !(directions.includes('attack') && directions.includes('defense')) && compatible(keys).length > 0;
  }
  const choose = (list, random) => list[Math.min(list.length - 1, Math.max(0, Math.floor(random() * list.length)))];
  function generate({ rarity = 'rare', level = 1, family, random = Math.random } = {}) {
    if(rarity==='epic'){family ||= choose(Object.keys(Epic.DEFINITIONS),random);return Epic.DEFINITIONS[family]?{version:VERSION,type:'epic-'+family,rarity,family,locked:false,options:[{key:family,weight:1}]}:null;}
    const tier = TIERS[rarity];
    if (!tier || !Number.isInteger(level) || level < 1 || level > REGIONS.length || (rarity === 'legendary' && level < 6)) return null;
    family ||= choose(Object.keys(OPTIONS).filter(key => (OPTIONS[key].min || 0) <= tier.rank), random);
    if (!TYPES[rarity + '-' + family]) return null;
    const size = 1;
    const keys = [family];
    if (tier.rank === 2 && (OPTIONS[family].min || 0) < 2) {
      keys.push(choose(Object.keys(OPTIONS).filter(key => OPTIONS[key].min===2&&canRollTogether([...keys,key])), random));
    }
    while (keys.length < tier.count) {
      const pool = Object.keys(OPTIONS).filter(key => !keys.includes(key) && (OPTIONS[key].min || 0) <= Math.min(1, tier.rank)
        && canRollTogether([...keys, key]));
      if (!pool.length) return null;
      keys.push(choose(pool, random));
    }
    const signature = keys.find(key => OPTIONS[key].min === 2);
    const ordinaryWeight = signature ? (tier.units - 1.6) / (keys.length - 1) : tier.units / keys.length;
    return { version: VERSION, type: rarity + '-' + family, rarity, family, level, size,
      quality: Number((.95 + .05 * (random() + random())).toFixed(5)), locked: false,
      options: keys.map(key => ({ key, weight: Number(((key === signature ? 1.6 : ordinaryWeight) * size).toFixed(8)) })) };
  }
  function validate(gem) {
    if(gem?.rarity==='epic'){
      if(gem.version!==VERSION||!Epic.DEFINITIONS[gem.family]||gem.type!=='epic-'+gem.family)return null;
      return {...(Number.isSafeInteger(gem.id)&&gem.id>0?{id:gem.id}:{}),...generate({rarity:'epic',family:gem.family}),locked:gem.locked===true};
    }
    // Normalize former 50/100/200-capacity rare rolls without rerolling identity or quality.
    if (gem?.rarity === 'rare' && [.25, .5, 1].includes(gem.size)
      && Array.isArray(gem.options) && gem.options.length === 1 && gem.options[0]?.key === gem.family
      && Number.isFinite(gem.options[0].weight) && Math.abs(gem.options[0].weight - gem.size) <= 1e-6) {
      gem = { ...gem, size: 1, options: [{ key: gem.family, weight: TIERS.rare.units }] };
    }
    // Preserve existing upper-tier rolls; attack/defense exclusivity applies to new drops and crafts.
    const tier = TIERS[gem?.rarity];
    if (!tier || gem.version !== VERSION || gem.type !== gem.rarity + '-' + gem.family || !TYPES[gem.type]
      || !Number.isInteger(gem.level) || gem.level < 1 || gem.level > REGIONS.length || (gem.rarity === 'legendary' && gem.level < 6)
      || !Number.isFinite(gem.quality) || gem.quality < .95 || gem.quality > 1.05
      || gem.size !== 1
      || !Array.isArray(gem.options) || gem.options.length !== tier.count || gem.options.some(o=>!o||typeof o.key!=='string') || gem.options[0]?.key !== gem.family) return null;
    const keys = gem.options.map(o => o.key);
    if (new Set(keys).size !== keys.length || !compatible(keys).length
      || gem.options.some(o => !OPTIONS[o.key] || (OPTIONS[o.key].min || 0) > tier.rank || !Number.isFinite(o.weight) || o.weight <= 0)
      || Math.abs(gem.options.reduce((n, o) => n + o.weight, 0) - tier.units * gem.size) > 1e-6
      || (tier.rank === 2 && keys.filter(key => OPTIONS[key].min === 2).length !== 1)) return null;
    const signature = keys.find(key => OPTIONS[key].min === 2);
    const ordinaryWeight = signature ? (tier.units - 1.6) / (keys.length - 1) : tier.units / keys.length;
    if (gem.options.some(o => Math.abs(o.weight - (o.key === signature ? 1.6 : ordinaryWeight) * gem.size) > 1e-6)) return null;
    return { ...(Number.isSafeInteger(gem.id) && gem.id > 0 ? { id: gem.id } : {}), version: VERSION, type: gem.type,
      rarity: gem.rarity, family: gem.family, level: gem.level, size: gem.size, quality: gem.quality,
      locked: gem.locked === true, options: gem.options.map(o => ({ key: o.key, weight: o.weight })) };
  }
  function describe(gem) {
    if(gem.rarity==='epic'){const d=Epic.DEFINITIONS[gem.family];return {...gem,name:d.name,image:d.image,effect:{[d.key]:1},costs:{[d.slot==='weapon'?'attack':'defense']:1500,dedicated:2000},note:d.note,jobs:[d.job],slot:d.slot};}
    const ref = references[gem.level - 1] || references.at(-1), effect = {}, costs = {}, values = [];
    const tier = TIERS[gem.rarity], total = tier.units * gem.size;
    for (const { key, weight } of gem.options) {
      const option = OPTIONS[key];
      let value = option.fixed ? option.value(ref) : option.value(ref) * weight * gem.quality;
      if(option.rarityScaled)value*=weight/(TIERS.unique.units/TIERS.unique.count);
      if(!option.scaled&&(option.min||0)>=1)value*=.5+.1*gem.level;
      value = Number(value.toFixed(option.percent ? 5 : option.decimal||['defense', 'mpRegen'].includes(option.key) ? 2 : 0));
      effect[option.key] = (effect[option.key] || 0) + value;
      costs[option.direction] = (costs[option.direction] || 0) + tier.capacity * gem.size * weight / total;
      values.push(option.name + ' +' + (option.percent ? Number((value * 100).toFixed(1)) + '%' : value) + (option.suffix || ''));
    }
    // Largest remainder allocation keeps the exact advertised integer total.
    const target = tier.capacity * gem.size, entries = Object.entries(costs);
    const assigned = entries.map(([dir, value]) => [dir, Math.floor(value), value % 1]);
    let remaining = Math.round(target) - assigned.reduce((sum, e) => sum + e[1], 0);
    for (const e of [...assigned].sort((a, b) => b[2] - a[2])) if (remaining-- > 0) e[1]++;
    return { ...gem, name: TYPES[gem.type].name + ' Lv.' + gem.level, image: icon(gem.family, gem.rarity),
      effect, costs: Object.fromEntries(assigned.map(([dir, value]) => [dir, value])), note: values.join(' / '),
      jobs: compatible(gem.options.map(o => o.key)) };
  }
  const shardKey = rarity => 'gem-shard-' + rarity;
  const rarityDiscovered = (save, rarity) => Object.hasOwn(TIERS, rarity) &&
    (save.discoveredGemRarities?.includes(rarity) || save.gems.some(g => g.rarity === rarity));
  function rememberRarity(save, rarity) {
    if (!Object.hasOwn(TIERS, rarity)) return;
    save.discoveredGemRarities ||= [];
    if (!save.discoveredGemRarities.includes(rarity)) save.discoveredGemRarities.push(rarity);
  }
  const salvage = gem => gem.rarity==='epic'?100:Math.floor(10 * gem.level * gem.size);
  const unlocked = save => known(save,50);
  const maxLevel = save => Math.min(REGIONS.length, Math.floor(Math.max(0, ...[...save.cleared,...(save.reincarnation?.passed||[]),...(save.reincarnation?.lifetimeStages||[]),...(save.reincarnation?.lifetimePassed||[])].filter(Number.isSafeInteger)) / 10) + 1);
  function craftRecipe(rarity, level, family, save = null) {
    if(rarity==='epic')return Epic.DEFINITIONS[family]?craftingCost(save,{[shardKey('epic')]:200,[Epic.MATERIAL]:30}):null;
    const tier = TIERS[rarity], option = OPTIONS[family], region = REGIONS[level - 1];
    if (!tier || !region || !TYPES[rarity + '-' + family] || (rarity === 'legendary' && level < 6)) return null;
    const share = tier.rank === 0 ? 1 : (option.min || 0) >= 2 ? 1 : (option.min || 0) >= 1 || tier.rank === 2 ? .8 : .6;
    const cost = { [shardKey(rarity)]: Math.round(100 * level * share), [region.rare]: rarity === 'rare' ? 10 : 30 };
    if (share < 1) cost[shardKey(Object.keys(TIERS)[tier.rank - 1])] = Math.round(1000 * level * (1 - share));
    return craftingCost(save,cost);
  }
  function upgradeRecipe(gem, target) {
    if(gem.rarity==='epic')return null;
    if (!Number.isInteger(target) || target <= gem.level || target > REGIONS.length) return null;
    const growth = gem.options.filter(o => OPTIONS[o.key].scaled||(OPTIONS[o.key].min||0)>=1).reduce((sum, o) => sum + o.weight, 0) / (TIERS[gem.rarity].units * gem.size);
    if (!growth) return null;
    let shards = 0; for (let level = gem.level + 1; level <= target; level++) shards += 30 * level;
    return { [shardKey(gem.rarity)]: Math.max(Math.floor(10 * target * gem.size) - salvage(gem) + 1,
      Math.ceil(shards * gem.size * Math.max(.35, growth))), [REGIONS[target - 1].crystal]: 40 * (target - gem.level) };
  }
  function canPay(save, cost) { return !!cost && Object.entries(cost).every(([key, n]) => Number.isSafeInteger(n) && n > 0 && (save.inventory[key] || 0) >= n); }
  function pay(save, cost) { if (!canPay(save, cost)) return false; for (const [key, n] of Object.entries(cost)) save.inventory[key] -= n; return true; }
  function craft(save, rarity, level, family, random = Math.random) {
    if(rarity==='epic'&&!known(save,Epic.GODDESS))return null;
    if (!unlocked(save) || (rarity!=='epic'&&level > maxLevel(save)) || !Number.isSafeInteger(save.nextGemId) || save.nextGemId < 1 || save.nextGemId >= Number.MAX_SAFE_INTEGER) return null;
    const cost = craftRecipe(rarity, level, family, save);
    if (!canPay(save, cost)) return null;
    const gem = validate(generate({ rarity, level, family, size: 1, random }));
    if (!gem || !pay(save, cost)) return null;
    gem.id = save.nextGemId++; save.gems.push(gem); rememberRarity(save, gem.rarity); rememberEpic(save,gem); markUsage(save,'craft'); return gem;
  }
  const freshDismantleFilter = () => ({ maxLevel: null, maxRarity: 'rare', match: 'all', excludedDirections: [], excludedEffects: [] });
  function restoreDismantleFilter(raw) {
    const clean = freshDismantleFilter();
    const list = (values, allowed) => Array.isArray(values) ? [...new Set(values.filter(id => allowed.includes(id)))] : [];
    if (raw?.maxLevel === null || Number.isInteger(raw?.maxLevel) && raw.maxLevel >= 1 && raw.maxLevel <= REGIONS.length) clean.maxLevel = raw.maxLevel;
    if (raw?.maxRarity === null || Object.hasOwn(TIERS, raw?.maxRarity)) clean.maxRarity = raw.maxRarity;
    if (raw?.match === 'any') clean.match = 'any';
    clean.excludedDirections = list(Array.isArray(raw?.excludedDirections) ? raw.excludedDirections.map(id => ['weapon', 'magic'].includes(id) ? 'attack' : id) : [], DIRECTIONS);
    clean.excludedEffects = list(raw?.excludedEffects, Object.keys(OPTIONS));
    return clean;
  }
  const freshAutoDismantle = () => ({ enabled: false, ...freshDismantleFilter() });
  function restoreAutoDismantle(raw) {
    const valid = (raw?.maxLevel == null || Number.isInteger(raw.maxLevel) && raw.maxLevel >= 1 && raw.maxLevel <= REGIONS.length)
      && (raw?.maxRarity == null || Object.hasOwn(TIERS, raw.maxRarity)) && (raw?.match == null || ['all', 'any'].includes(raw.match));
    return { enabled: raw?.enabled === true && valid, ...restoreDismantleFilter(raw) };
  }
  function matchesDismantleFilter(gem, filter) {
    const conditions = [];
    if (filter?.maxLevel != null && Number.isInteger(filter.maxLevel) && filter.maxLevel >= 1 && filter.maxLevel <= REGIONS.length) conditions.push(gem.level <= filter.maxLevel);
    if (filter?.maxRarity != null && Object.hasOwn(TIERS, filter.maxRarity)) conditions.push(TIERS[gem.rarity].rank <= TIERS[filter.maxRarity].rank);
    return conditions.length > 0 && (filter.match === 'any' ? conditions.some(Boolean) : conditions.every(Boolean))
      && !gem.options.some(option => filter.excludedEffects?.includes(option.key) || filter.excludedDirections?.includes(OPTIONS[option.key].direction));
  }
  function canDismantle(save, gem) {
    return unlocked(save) && !!gem && !gem.locked && !Object.values(save.progression.characters)
      .some(c => ['weapon', 'armor'].some(slot => c.gems[slot].includes(gem.id)));
  }
  function dismantlePlan(save, filter) {
    const gems = save.gems.filter(gem => canDismantle(save, gem) && matchesDismantleFilter(gem, filter));
    const shards = {};
    for (const gem of gems) { const key = shardKey(gem.rarity); shards[key] = (shards[key] || 0) + salvage(gem); }
    return { ids: gems.map(gem => gem.id), count: gems.length, shards };
  }
  function dismantleIds(save, ids) {
    const selected = new Set(ids), gems = save.gems.filter(gem => selected.has(gem.id)), shards = {};
    if (!gems.length || gems.length !== selected.size || gems.some(gem => !canDismantle(save, gem))) return false;
    for (const gem of gems) { const key = shardKey(gem.rarity); shards[key] = (shards[key] || 0) + salvage(gem); }
    // Check every balance before removing any gem or granting any fragments.
    if (Object.entries(shards).some(([key, n]) => !Number.isSafeInteger((save.inventory[key] || 0) + n))) return false;
    for (const gem of gems) rememberRarity(save, gem.rarity);
    for (const [key, n] of Object.entries(shards)) save.inventory[key] = (save.inventory[key] || 0) + n;
    save.gems = save.gems.filter(gem => !selected.has(gem.id));
    markUsage(save,'dismantle');
    return { ids: gems.map(gem => gem.id), count: gems.length, shards };
  }
  function dismantle(save, id) { return !!dismantleIds(save, [Number(id)]); }
  function bulkDismantle(save, filter) { return dismantleIds(save, dismantlePlan(save, filter).ids); }
  function autoDismantle(save, id) {
    const settings = restoreAutoDismantle(save.autoGemDismantle), gem = save.gems.find(g => g.id === Number(id));
    if (!settings.enabled || !canDismantle(save, gem) || !matchesDismantleFilter(gem, settings)) return false;
    return dismantleIds(save, [gem.id]);
  }
  function upgrade(save, id, target) {
    const gem = save.gems.find(g => g.id === Number(id));
    if (!unlocked(save) || !gem || target > maxLevel(save) || !pay(save, upgradeRecipe(gem, target))) return false;
    gem.level = target; return true;
  }
  function convert(save, rarity, count = 1) {
    const rank = TIERS[rarity]?.rank;
    if (!unlocked(save) || ![0, 1, 2].includes(rank) || (rank===2&&!known(save,Epic.GODDESS)) || !Number.isSafeInteger(count) || count <= 0 || count > Number.MAX_SAFE_INTEGER / 10) return false;
    const next = Object.keys(TIERS)[rank + 1];
    if (next === 'legendary' && maxLevel(save) < 6) return false;
    const key = shardKey(next), amount = (save.inventory[key] || 0) + count;
    if (!Number.isSafeInteger(amount) || !pay(save, { [shardKey(rarity)]: count * 10 })) return false;
    save.inventory[key] = amount; return true;
  }
  const shardItems = Object.keys(TIERS).map(rarity => ({ id: shardKey(rarity), name: { rare: 'レア', unique: 'ユニーク', legendary: 'レジェンダリー',epic:'エピック' }[rarity] + 'ジェムの破片', rarity, type: 'material', ...(rarity==='epic'?{revealStage:Epic.GODDESS}:{}), image: 'assets/ui/gems/shard-' + rarity + '.png', note: 'ジェム合成・アップグレード' }));
  return { rememberEpic, markUsage, VERSION, TIERS, OPTIONS, TYPES, DIRECTIONS, REGIONS, Epic, configureReferences, generate, validate, describe, compatible,
    shardKey, shardItems, rarityDiscovered, rememberRarity, salvage, unlocked, maxLevel, craftRecipe, upgradeRecipe, canPay, craft, dismantle, upgrade, convert,
    freshDismantleFilter, restoreDismantleFilter, freshAutoDismantle, restoreAutoDismantle, matchesDismantleFilter, canDismantle, dismantlePlan, bulkDismantle, autoDismantle };
});
