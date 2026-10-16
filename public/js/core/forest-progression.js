'use strict';
((root, factory) => {
  const api = factory(typeof module === 'object' && module.exports ? require('../skills/warrior-skills.js') : root.WarriorSkills, typeof module === 'object' && module.exports ? require('../skills/mage-skills.js') : root.MageSkills, typeof module === 'object' && module.exports ? require('../skills/paladin-skills.js') : root.PaladinSkills, typeof module === 'object' && module.exports ? require('../skills/ninja-skills.js') : root.NinjaSkills, typeof module === 'object' && module.exports ? require('../skills/shaman-skills.js') : root.ShamanSkills,typeof module==='object'&&module.exports?require('../skills/miko-skills.js'):root.MikoSkills);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ForestProgression = api;
})(typeof globalThis === 'object' ? globalThis : this, (W, M, P, N, S, K) => {
  // Prototype values live here; the agreed structure is recorded separately in docs.
  const CHARACTERS = {
    warrior: { name: '戦士', english: 'WARRIOR', title: '森の先駆者', weapon: 'sword', armor: 'armor', color: '#d8b776', unlock: 0,
      base: { maxHp: 420, maxMp: 80, mpRegen: 3, damage: 34, defense: 4, speed: 150, range: 180, attackSpeed: 1, haste: 0, crit: .18, critMultiplier: 1.7 } },
    mage: { name: '魔法使い', english: 'MAGE', title: '元素術師', weapon: 'staff', armor: 'robe', color: '#82cbd3', unlock: 4,
      base: { maxHp: 300, maxMp: 130, mpRegen: 4, damage: 30, defense: 3, speed: 138, range: 340, attackSpeed: 1, haste: 0, crit: .12, critMultiplier: 1.7 } },
    paladin: { name:'パラディン',english:'PALADIN',title:'聖光の守護者',weapon:'mace',armor:'plate',color:'#ffe0a0',unlock:10,
      base:{maxHp:520,maxMp:110,mpRegen:3.6,damage:29,defense:8,speed:125,range:180,attackSpeed:1,haste:0,crit:.12,critMultiplier:1.7} },
  };
  CHARACTERS.ninja = {name:'忍者',english:'NINJA',title:'影の達人',weapon:'shuriken',armor:'ninja-garb',color:'#cb87ee',unlock:20,
    base:{maxHp:330,maxMp:64,mpRegen:4,damage:28,defense:4,speed:170,range:360,attackSpeed:1,haste:0,crit:.18,critMultiplier:1.7}};
  CHARACTERS.shaman={name:'呪術師',english:'SHAMAN',title:'呪印の導師',weapon:'staff',armor:'robe',color:'#b58be8',unlock:30,
    base:{maxHp:290,maxMp:150,mpRegen:4.5,damage:24,defense:3,speed:130,range:360,attackSpeed:1,haste:0,crit:.1,critMultiplier:1.7}};
  CHARACTERS.miko={name:'巫女',english:'MIKO',title:'神楽の巫女',weapon:'gohei',armor:'miko-robes',color:'#ffe8b0',unlock:40,
    base:{maxHp:310,maxMp:160,mpRegen:5,damage:26,defense:4,speed:130,range:400,attackSpeed:1,haste:0,crit:.1,critMultiplier:1.7}};
  const SKILLS = {
    warrior: W.NODES,
    mage: M.NODES,
    paladin: P.NODES,
    ninja: N.NODES,
    shaman: S.NODES,
    miko: K.NODES,
  };
  const COMMON_MATERIALS = ['jelly', 'tusk', 'flower'];
  // Shared by every regional tree; regional remapping below preserves this order.
  const MAIN_MATERIALS = [[], ['jelly'], ['tusk'], ['flower'], ['jelly','tusk','flower'], ['jelly','tusk'], ['jelly','flower'], ['tusk','flower'], ['jelly','tusk','flower'], ['crystal']];
  const MAIN_NAMES = ['旅立ちの刻印', '雫の研磨', '獣牙の鍛造', '妖花の祝印', '群森の錬成', '獣雫の調和', '花雫の結晶', '茨の焼入れ', '深緑の真髄', '古樹の継承'];
  const MAGE_MAIN_NAMES = {
    1: ['旅立ちの魔紋', '雫の魔紋', '獣牙の触媒', '妖花の祝印', '群森の錬成', '獣雫の共鳴', '花雫の魔晶', '茨の呪印', '深緑の秘儀', '古樹の継承'],
    2: ['毒沼の魔紋', '毒袋の魔紋', '泥の触媒', '亡者の祝印', '群沼の錬成', '毒泥の共鳴', '呪骨の魔晶', '泥骨の呪印', '瘴気の秘儀', '毒竜の継承'],
  };
  const Equipment = typeof module === 'object' && module.exports ? require('../ui/equipment-visuals.js') : globalThis.EquipmentVisuals;
  function buildGearTree(character, slot, region = 1) {
    if(region===10){const materials={'venom-sac':'demon-armor-fragment','living-mud':'demon-horn','cursed-bone':'dream-demon-feather','swamp-crystal':'castle-crystal','hydra-scale':'demon-god-heart'};
      const names=['魔城の刻印','魔鎧の研磨','悪魔の鍛造','夢翼の祝印','玉座の錬成','鎧角の調和','鎧羽の共鳴','角羽の焼入れ','宵闇の真髄','魔神の継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:'castle-'+n.id.slice(6),region:10,stage:n.stage+80,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜','魔神'),requires:n.requires.map(req=>req==='main-10'?'volcano-main-10':'castle-'+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*4.2*(n.main?1+.2*(n.stage-11):1):v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*9:v]))}));}
    if(region===9){const materials={'venom-sac':'fire-lizard-hide','living-mud':'obsidian-blade-shard','cursed-bone':'fire-dragon-scale','swamp-crystal':'volcano-crystal','hydra-scale':'dragon-furnace-heart'};
      const names=['紅蓮の刻印','火皮の研磨','黒曜の鍛造','竜鱗の祝印','竜脈の錬成','皮刃の調和','皮鱗の共鳴','刃鱗の焼入れ','火口の真髄','竜炉の継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:'volcano-'+n.id.slice(6),region:9,stage:n.stage+70,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜','竜炉'),requires:n.requires.map(req=>req==='main-10'?'glacier-main-10':'volcano-'+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*3.8*(n.main?1+.2*(n.stage-11):1):v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*8:v]))}));}
    if(region===8){const materials={'venom-sac':'ice-wolf-fang','living-mud':'ice-shell-fragment','cursed-bone':'snow-spirit-flower','swamp-crystal':'glacier-crystal','hydra-scale':'mammoth-ice-tusk'};
      const names=['蒼氷の刻印','氷牙の研磨','氷殻の鍛造','雪精の祝印','氷河の錬成','牙殻の調和','牙花の共鳴','殻花の焼入れ','白夜の真髄','氷牙の継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:'glacier-'+n.id.slice(6),region:8,stage:n.stage+60,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜','氷牙'),requires:n.requires.map(req=>req==='main-10'?'highland-main-10':'glacier-'+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*3.4*(n.main?1+.2*(n.stage-11):1):v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*7:v]))}));}
    if(region===7){const materials={'venom-sac':'horn-beast-fang','living-mud':'rock-horn-fragment','cursed-bone':'wind-spirit-feather','swamp-crystal':'highland-crystal','hydra-scale':'manticore-tail'};
      const names=['高原の刻印','角牙の研磨','岩角の鍛造','風精の祝印','嵐渡りの錬成','牙角の調和','牙羽の共鳴','角羽の焼入れ','風雷の真髄','毒尾の継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:'highland-'+n.id.slice(6),region:7,stage:n.stage+50,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜','毒尾'),requires:n.requires.map(req=>req==='main-10'?'desert-main-10':'highland-'+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*3*(n.main?1+.2*(n.stage-11):1):v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*6:v]))}));}
    if(region===6){const materials={'venom-sac':'scorpion-pincer','living-mud':'ancient-bandage','cursed-bone':'sand-snake-scale','swamp-crystal':'desert-crystal','hydra-scale':'behemoth-horn'};
      const names=['金砂の刻印','砂鋏の研磨','包帯の鍛造','蛇鱗の祝印','墓域の錬成','鋏布の調和','鋏鱗の共鳴','布鱗の焼入れ','黄金の真髄','砂喰いの継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:'desert-'+n.id.slice(6),region:6,stage:n.stage+40,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜','砂喰い'),requires:n.requires.map(req=>req==='main-10'?'ruins-main-10':'desert-'+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*2.6*(n.main?1+.2*(n.stage-11):1):v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*5:v]))}));}
    if(region===5){const materials={'venom-sac':'ancient-stone','living-mud':'bronze-gear','cursed-bone':'magic-shard','swamp-crystal':'ruins-crystal','hydra-scale':'ancient-core'};
      const names=['遺跡の刻印','石片の研磨','青銅の鍛造','魔導の祝印','群像の錬成','石銅の調和','石晶の共鳴','銅晶の焼入れ','神殿の真髄','古代炉心の継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:'ruins-'+n.id.slice(6),region:5,stage:n.stage+30,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜','古代炉心'),requires:n.requires.map(req=>req==='main-10'?'coast-main-10':'ruins-'+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*2.2:v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*4:v]))}));}
    if (region === 3 || region === 4) {
      const cave = region === 3, prefix = cave ? 'cave-' : 'coast-', previous = cave ? 'swamp-' : 'cave-';
      const materials = cave ? { 'venom-sac':'bat-fang','living-mud':'worm-shell','cursed-bone':'spider-silk','swamp-crystal':'cave-crystal','hydra-scale':'troll-stone' }
        : { 'venom-sac':'crab-shell','living-mud':'lizard-scale','cursed-bone':'octopus-ink','swamp-crystal':'coast-crystal','hydra-scale':'kraken-pearl' };
      const names = cave ? ['洞窟の刻印','吸血牙の研磨','外殻の鍛造','蜘蛛糸の織り','地底の錬成','牙殻の調和','紫晶の祝印','糸殻の焼入れ','暗闇の真髄','巨棍の継承']
        : ['潮騒の刻印','大殻の研磨','鱗の鍛造','海魔の織り','群潮の錬成','甲鱗の調和','泡晶の祝印','鱗墨の焼入れ','海岸の真髄','深海の継承'];
      return buildGearTree(character,slot,2).map(n=>({...n,id:prefix+n.id.slice(6),region,stage:n.stage+(region-2)*10,
        name:n.main?names[(n.stage-1)%10]:n.name.replaceAll('毒竜',cave?'巨棍':'深海'),
        requires:n.requires.map(req=>req==='main-10'?previous+'main-10':prefix+req.slice(6)),
        effect:{...Object.fromEntries(Object.entries(n.effect).map(([k,v])=>[k,['damage','maxHp','defense'].includes(k)?v*(cave?1.4:1.8):v])),...(slot==='weapon'&&['paladin','warrior','ninja'].includes(character)&&n.main&&[8,9].includes(n.stage%10)?{interferencePower:.12}:{})},
        cost:Object.fromEntries(Object.entries(n.cost).map(([k,v])=>[materials[k]||k,k==='gold'?v*(region-1):v]))}));
    }
    if (region === 2) {
      const materials = { jelly: 'venom-sac', tusk: 'living-mud', flower: 'cursed-bone', crystal: 'swamp-crystal', wood: 'hydra-scale' };
      const names = ['mage','shaman','miko'].includes(character) ? MAGE_MAIN_NAMES[2] : ['毒沼の刻印', '毒袋の研磨', '泥の鍛造', '亡者の祝印', '群沼の錬成', '毒泥の調和', '呪骨の結晶', '泥骨の焼入れ', '瘴気の真髄', '毒竜の継承'];
      return buildGearTree(character, slot).map(n => ({ ...n, id: 'swamp-' + n.id, stage: n.stage + 10, region: 2,
        name: n.main ? names[n.stage - 1] : n.name.replaceAll('古樹', '毒竜'),
        requires: n.requires.length ? n.requires.map(req => 'swamp-' + req) : ['main-10'],
        effect: Object.fromEntries(Object.entries(n.effect).map(([key, value]) => [key, ['damage', 'maxHp', 'defense'].includes(key) ? value * 1.5 : value])),
        cost: Object.fromEntries(Object.entries(n.cost).map(([key, value]) => [materials[key] || key, key === 'gold' ? value * 2 : value])),
      }));
    }
    const weapon = slot === 'weapon', mage = ['mage','shaman','miko'].includes(character);
    const mainNames = mage ? MAGE_MAIN_NAMES[1] : MAIN_NAMES;
    const branchNames = weapon ? mage ? ['魔力の凝縮', '魔導の律動'] : ['刃の研磨', '剣の律動']
      : mage ? ['生命の魔織', '守護の結界'] : ['生命の織り', '守りの刻印'];
    const art = character==='miko'?(weapon?'miko-gohei':'miko-robe'):weapon ? mage ? 'staff' : character==='paladin'?'paladin-mace':character==='ninja'?'ninja-shuriken':'greatsword' : mage ? 'robe' : character==='paladin'?'paladin-shield':character==='ninja'?'ninja-garb':'leather';
    const nodes = [];
    for (let i = 1; i <= 10; i++) {
      const materials = MAIN_MATERIALS[i - 1], branchMaterials = i === 1 ? ['crystal'] : materials, x = 100 + (i - 1) * 150;
      const mainAmount = i === 5 ? 1 : 2;
      const branchAmounts = i === 1 || i === 5 ? [1, 2, 4, 8] : [1, 3, 8, 24];
      const effect = weapon ? { damage: 3 + Math.floor(i / 3) } : { maxHp: 20 + i * 2, defense: .5 + Math.floor(i / 4) };
      nodes.push({ id: 'main-' + i, name: mainNames[i - 1], art, x, y: 370, main: true, stage: i,
        requires: i === 1 ? [] : ['main-' + (i - 1)], effect, cost: { gold: i * 10, ...Object.fromEntries(materials.map(item => [item, mainAmount])) }, note: '' });
      for (const direction of ['up', 'down']) for (let depth = 1; depth <= 4; depth++) {
        const upper = direction === 'up', index = depth - 1;
        const effect = weapon ? upper ? { damage: [1, 3, 7, 15][index] } : { attackSpeed: [.003, .009, .02, .045][index] }
          : upper ? { maxHp: [5, 15, 40, 90][index] } : { defense: [.2, .6, 1.5, 4][index] };
        nodes.push({ id: 'branch-' + i + '-' + direction + '-' + depth, name: branchNames[upper ? 0 : 1] + ' ' + depth,
          art: weapon ? upper ? 'greatsword' : 'counter' : upper ? 'leather' : 'ward', x, y: 370 + (upper ? -1 : 1) * depth * 75,
          stage: i, depth, requires: [depth === 1 ? 'main-' + i : 'branch-' + i + '-' + direction + '-' + (depth - 1)], effect,
          cost: { gold: [20, 80, 220, 700][index], ...Object.fromEntries(branchMaterials.map(item => [item, branchAmounts[index]])) }, note: '' });
      }
    }
    nodes.push({ id: 'crown', name: weapon ? mage ? '古樹の魔導' : '古樹の武威' : '古樹の加護', art: weapon ? 'battle-aura' : 'ward', x: 1620, y: 370, unique: true, stage: 10,
      requires: ['main-10'], effect: weapon ? { skillPower: .08, weaponPower: .08 } : { maxHp: 150, defense: 6 }, cost: { gold: 1200, ...Object.fromEntries(COMMON_MATERIALS.map(item => [item, 15])), crystal: 5, wood: 3 }, note: '' });
    for (let lane = 1; lane <= 3; lane++) for (let depth = 1; depth <= 3; depth++) {
      const index = depth - 1, material = COMMON_MATERIALS[lane - 1];
      const effect = weapon ? lane === 1 ? { damage: [10, 25, 60][index] } : lane === 2 ? { attackSpeed: [.03, .07, .15][index] } : { skillPower: [.05, .12, .25][index], ...(['paladin','warrior','ninja'].includes(character)?{interferencePower:[.04,.06,.1][index]}:{}) }
        : lane === 1 ? { maxHp: [80, 180, 400][index] } : lane === 2 ? { defense: [3, 7, 15][index] } : { mpRegen: [.5, 1.2, 2.5][index] };
      nodes.push({ id: 'crown-' + lane + '-' + depth, name: (mage ? weapon ? ['古樹の魔力', '古樹の共鳴', '古樹の秘術'] : ['古樹の生命', '古樹の結界', '古樹の霊泉'] : ['古樹の力', '古樹の律動', '古樹の息吹'])[lane - 1] + ' ' + depth, art: weapon ? 'battle-aura' : 'ward',
        x: 1620 + depth * 160, y: 370 + (lane - 2) * 170, unique: true, stage: 10, requires: [depth === 1 ? 'crown' : 'crown-' + lane + '-' + (depth - 1)], effect,
        cost: { gold: [1500, 3500, 7500][index], ...Object.fromEntries(COMMON_MATERIALS.map(item => [item, item === material ? [10, 20, 35][index] : [2, 4, 7][index]])), crystal: [4, 8, 16][index], wood: [4, 9, 16][index] }, note: '' });
    }
    return nodes;
  }
  function gearTree(character, slot, region = 1) {
    if(region==='goddess')return Gem.Epic.tree(character,slot);
    return buildGearTree(character, slot, region).map(node => Equipment.node(character, slot, region, node));
  }
  const equipmentAppearance = (save, character, slot) => Equipment.appearance(save, character, slot);
  const allGearTrees = (character, slot, includeGoddess = false) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,...(includeGoddess?['goddess']:[])].flatMap(region => gearTree(character, slot, region));
  function gearBonuses(id, slot) {
    const weapon = slot === 'weapon';
    const effects = weapon ? [{ damage: 2 }, { attackSpeed: .01 }, { attackCapacity: 100 }, { utilityCapacity: 50 }, { skillPower: .03 }, { damage: 4 }, { discount: .1 }, { attackCapacity: 50 }, { skillPower: .05 }, { commonCapacity: 50 }]
      : [{ maxHp: 20 }, { defense: 1 }, { defenseCapacity: 100 }, { utilityCapacity: 50 }, { mpRegen: .2 }, { maxHp: 40 }, { discount: .1 }, { defenseCapacity: 50 }, { mpRegen: .4 }, { commonCapacity: 50 }];
    return effects.map((effect, i) => ({ count: (i + 1) * 10, effect }));
  }
  const Gem = typeof module === 'object' && module.exports ? require('./gem-system.js') : globalThis.GemSystem;
  const GEMS = Gem.TYPES, GEM_DIRECTIONS = Gem.DIRECTIONS;
  const GODDESS_SP = new Map(Gem.Epic.tree('warrior','weapon').filter(n=>n.effect.skillPoints).map(n=>[n.id,n.effect.skillPoints]));
  Gem.configureReferences([1,2,3,4,5,6,7,8,9,10].map(region => {
    const gear = ['weapon','armor'].flatMap(slot => [1,2,3,4,5,6,7,8,9,10].filter(r => r <= region).flatMap(r =>
      [...gearTree('warrior',slot,r).filter(n => n.main).map(n => n.effect), gearBonuses('warrior',slot)[0].effect]));
    const e = sumEffects(gear), lv = region * 10;
    return { attack: 34+(lv-1)*3+e.damage, hp:420+(lv-1)*26+e.maxHp,
      defense:4+Math.floor((lv-1)/2)+e.defense, mp:80+(lv-1)*4 };
  }));
  const MAX_LEVEL = 100;
  const experience = (level = 1, progress = 0) => ({ level: Math.min(MAX_LEVEL, level), progress: level >= MAX_LEVEL ? 0 : progress });
  const freshCharacter = () => ({ xp: experience(), skills: [], skillRanks: {}, weapon: [], armor: [], gems: { weapon: [], armor: [] } });
  const fresh = () => ({ selected: 'warrior', characters: Object.fromEntries(Object.keys(CHARACTERS).map(id=>[id,freshCharacter()])) });
  function recruitNinja(save) {
    const c=save.progression.characters.ninja;
    if(c.xp.level>1||c.weapon.length||c.armor.length||Object.keys(c.skillRanks||{}).length)return false;
    c.xp=experience(20);
    for(const slot of ['weapon','armor'])c[slot]=allGearTrees('ninja',slot).filter(n=>n.main&&n.stage<=20).map(n=>n.id);
    return true;
  }
  function recruitShaman(save) {
    const c=save.progression.characters.shaman;
    if(c.xp.level>1||c.weapon.length||c.armor.length||Object.keys(c.skillRanks||{}).length)return false;
    c.xp=experience(30);
    for(const slot of ['weapon','armor'])c[slot]=allGearTrees('shaman',slot).filter(n=>n.main&&n.stage<=30).map(n=>n.id);
    for(const n of S.ACTIVE.filter(n=>n.kind==='active'&&n.unlockLevel<=30)){c.skillRanks[n.id]=5;c.skills.push(n.id);}
    return true;
  }
  function recruitMiko(save){const c=save.progression.characters.miko;
    if(c.xp.level>1||c.weapon.length||c.armor.length||Object.keys(c.skillRanks||{}).length)return false;
    c.xp=experience(40);for(const slot of ['weapon','armor'])c[slot]=allGearTrees('miko',slot).filter(n=>n.main&&n.stage<=40).map(n=>n.id);
    for(const n of K.ACTIVE.filter(n=>n.kind==='active'&&n.unlockLevel<=40)){c.skillRanks[n.id]=5;c.skills.push(n.id);}return true;
  }
  const unlocked = (save, id) => Object.hasOwn(CHARACTERS, id) && (!CHARACTERS[id].unlock || save.cleared.includes(CHARACTERS[id].unlock));
  const level = xp => xp.level;
  const xpPercent = xp => xp.level >= MAX_LEVEL ? 'MAX' : (xp.progress * 100).toFixed(2) + '%';
  function totalPoints(save, id) { const c=save.progression.characters[id];return level(c.xp)+['weapon','armor'].reduce((sum,slot)=>sum+c[slot].reduce((points,uid)=>points+(GODDESS_SP.get(uid)||0),0),0); }
  function rank(save, id, nodeId) {
    const n = SKILLS[id]?.find(n => n.id === nodeId); if (!n) return 0;
    if (n.cost === 0) return 1;
    const c = save.progression.characters[id];
    return Math.max(0, Math.min(n.maxRank || 1, c.skillRanks?.[nodeId] || (c.skills.includes(nodeId) ? 1 : 0)));
  }
  function points(save, id) { return totalPoints(save, id) - SKILLS[id].reduce((sum, n) => sum + rank(save, id, n.id) * n.cost, 0); }
  function sumEffects(effects) { const result = {}; for (const effect of effects) for (const [key, value] of Object.entries(effect)) result[key] = key === 'statusResistance' ? 1 - (1 - (result[key] || 0)) * (1 - value) : (result[key] || 0) + value; return result; }
  const effectTrees = new Map();
  function effects(save, id, slot) {
    const state = save.progression.characters[id];
    const ownedIds = new Set(state[slot]);
    return sumEffects([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'goddess'].flatMap(region => {
      const key = id + ':' + slot + ':' + region;
      // Cache definitions, never a save's acquired effects. Each call still
      // reads current ownership, so purchases, resets and other saves are safe.
      if (!effectTrees.has(key)) effectTrees.set(key, gearTree(id, slot, region).map(n => ({ id: n.id, effect: n.effect })));
      const owned = effectTrees.get(key).filter(n => ownedIds.has(n.id));
      return [...owned.map(n => n.effect), ...(region==='goddess'?[]:gearBonuses(id, slot).filter(b => owned.length >= b.count).map(b => b.effect))];
    }));
  }
  function capacity(save, id, slot) {
    const e = effects(save, id, slot);
    return { attack:(slot==='weapon'?350:0)+(e.attackCapacity||0), defense:(slot==='armor'?300:0)+(e.defenseCapacity||0),
      utility:(slot==='weapon'?100:150)+(e.utilityCapacity||0), common:50+(e.commonCapacity||0),dedicated:e.dedicatedCapacity||0,
      discount:1-Math.max(.6,.9**Math.round((e.discount||0)/.1)) };
  }
  function gemCost(save, id, slot, gemId, cap = capacity(save, id, slot)) {
    return Object.values(gemCosts(save, id, slot, gemId, cap)).reduce((sum, n) => sum + n, 0);
  }
  function gemCosts(save, id, slot, gemId, cap = capacity(save, id, slot)) {
    const instance = typeof gemId==='object'?gemId:gemInstance(save,gemId);
    if(!instance)return {};
    const g=Gem.describe(instance);
    const favored = slot === 'weapon' ? ['attack'] : ['defense'];
    return Object.fromEntries(Object.entries(g.costs).map(([d,n])=>[d,Math.ceil(n*(favored.includes(d)?1-cap.discount:1))]));
  }
  function gemUsage(save, id, slot, gems = save.progression.characters[id].gems[slot]) {
    const cap = capacity(save, id, slot), used = { ...Object.fromEntries(GEM_DIRECTIONS.map(d => [d, 0])), dedicated:0 };
    for (const uid of gems) for (const [d, n] of Object.entries(gemCosts(save, id, slot, uid, cap))) used[d] += n;
    used.common = GEM_DIRECTIONS.reduce((s, d) => s + Math.max(0, used[d] - cap[d]), 0);
    const valid=gems.every(uid=>{const g=gemInstance(save,uid);return !!g&&Gem.describe(g).jobs.includes(id)&&(!Gem.describe(g).slot||Gem.describe(g).slot===slot);});
    return { used, cap, fits: valid&&used.common <= cap.common&&used.dedicated<=cap.dedicated };
  }
  function stats(save, id) {
    const c = CHARACTERS[id], state = save.progression.characters[id], lv = level(state.xp);
    const all = sumEffects([effects(save, id, 'weapon'), effects(save, id, 'armor'),
      ...SKILLS[id].map(n => Object.fromEntries(Object.entries(n.effect).map(([k,v]) => [k,v * rank(save,id,n.id)]))), ...['weapon', 'armor'].flatMap(slot => state.gems[slot].map(uid => Gem.describe(gemInstance(save, uid)).effect))]);
    const result = { ...c.base, level: lv, skillPower: 0, cooldownPenalty: 0, skillRange: 0, ...Object.fromEntries(Object.values(Gem.OPTIONS).filter(o=>!Object.hasOwn(c.base,o.key)).map(o=>[o.key,0])), ...Object.fromEntries(Object.entries(all).map(([k, v]) => [k, (c.base[k] || 0) + v])) };
    result.maxHp += (lv - 1) * (id === 'paladin'?30:id === 'warrior' ? 26 : 20); result.maxMp += (lv - 1) * 4;
    result.damage += (lv - 1) * 3; result.defense += Math.floor((lv - 1) / 2);
    // Scale level growth, equipment and gems together. Same-stat passives add.
    for (const key of ['maxHp', 'maxMp', 'defense']) result[key] *= 1 + (all[key + 'Percent'] || 0);
    if(result.epicMageArmor){result.maxMp*=3;result.mpRegen+=result.maxMp*.05;}
    result.mpRegen *= 1 + (all.mpRegenPercent || 0);
    const damageScale = 1 + (all.damagePercent || 0);
    result.baseDamage = result.damage * damageScale;
    result.weaponDamage = (result.damage + (result.weaponFlat || 0)) * damageScale * (1 + (result.weaponPower || 0));
    result.magicDamage = (result.damage + (result.magicFlat || 0)) * damageScale * (1 + (result.magicPower || 0));
    result.haste=Math.min(2,result.haste||0);result.interferencePenetration=Math.min(.4,result.interferencePenetration||0);
    result.damage = ['mage','shaman','miko'].includes(id) ? result.magicDamage : result.weaponDamage;
    result.interval = (id==='miko'?1000:id === 'shaman' ? 1100 : id === 'ninja' ? 800 : id === 'warrior' ? 1080 : 1250) / result.attackSpeed;
    result.skillDamage = result.damage * (id === 'warrior' ? 2.65 : 2.4) * (1 + result.skillPower);
    result.skillInterval = (id === 'warrior' ? 6500 : 5000) * (1 + result.cooldownPenalty) / (1 + result.haste);
    if (id === 'warrior') {
      result.normalRank = Math.max(1, rank(save, id, 'renjin'));
      result.normalEnhance = rank(save, id, 'renjin-enhance');
      result.warriorSkills = W.ACTIVE.filter(n => n.kind === 'active' && rank(save,id,n.id)).map(n => W.spec(n.id,rank(save,id,n.id),rank(save,id,n.id+'-enhance'),result));
    } else if(id==='mage') {
      result.mageNormal = M.spec('bolt',Math.max(1,rank(save,id,'bolt')),rank(save,id,'bolt-enhance'),result);
      result.mageSkills = M.ACTIVE.filter(n => n.kind === 'active' && rank(save,id,n.id)).map(n => M.spec(n.id,rank(save,id,n.id),rank(save,id,n.id+'-enhance'),result));
    } else if(id==='ninja') {
      result.ninjaNormal=N.spec('shuriken',1,rank(save,id,'shuriken-enhance'),result);
      result.ninjaSkills=N.ACTIVE.filter(n=>n.kind==='active'&&rank(save,id,n.id)).map(n=>N.spec(n.id,rank(save,id,n.id),rank(save,id,n.id+'-enhance'),result));
    } else if(id==='shaman') {
      result.shamanNormal=S.spec('curse-bolt',1,rank(save,id,'curse-bolt-enhance'),result);
      result.shamanSkills=S.ACTIVE.filter(n=>n.kind==='active'&&rank(save,id,n.id)).map(n=>S.spec(n.id,rank(save,id,n.id),rank(save,id,n.id+'-enhance'),result));
    } else if(id==='miko') {
      result.mikoNormal=K.spec('purifying-bolt',1,rank(save,id,'purifying-bolt-enhance'),result);
      result.mikoSkills=K.ACTIVE.filter(n=>n.kind==='active'&&rank(save,id,n.id)).map(n=>K.spec(n.id,rank(save,id,n.id),rank(save,id,n.id+'-enhance'),result));
    } else {
      result.paladinNormal=P.spec('mace',Math.max(1,rank(save,id,'mace')),rank(save,id,'mace-enhance'),result);
      result.paladinSkills=P.ACTIVE.filter(n=>n.kind==='active'&&rank(save,id,n.id)).map(n=>P.spec(n.id,rank(save,id,n.id),rank(save,id,n.id+'-enhance'),result));
    }
    return result;
  }
  function status(save, id, kind, n) {
    const state = save.progression.characters[id], skill = kind === 'skills';
    if (skill ? rank(save,id,n.id) >= (n.maxRank || 1) : state[kind].includes(n.id)) return 'owned';
    if (!unlocked(save, id)) return 'locked';
    if (skill && level(state.xp) < (n.unlockLevel || 1)) return 'locked';
    if (n.requires.some(req => skill ? !rank(save,id,req) : !state[kind].includes(req))) return 'locked';
    if (!skill && !save.cleared.includes(n.stage)) return 'locked';
    return skill ? points(save, id) >= n.cost ? 'available' : 'cost' : Object.entries(n.cost).every(([key, amount]) => (key === 'gold' ? save.gold : save.inventory[key] || 0) >= amount) ? 'available' : 'cost';
  }
  const purchaseTrees = new Map();
  function purchase(save, id, kind, nodeId) {
    if (!Object.hasOwn(CHARACTERS, id) || !['skills', 'weapon', 'armor'].includes(kind)) return false;
    const key=id+':'+kind;
    if(kind!=='skills'&&!purchaseTrees.has(key))purchaseTrees.set(key,new Map(allGearTrees(id,kind,true).map(n=>[n.id,n])));
    const n = kind==='skills'?SKILLS[id].find(n=>n.id===nodeId):purchaseTrees.get(key).get(nodeId);
    return purchaseNode(save, id, kind, n);
  }
  function purchaseNode(save, id, kind, n) {
    if (!n || status(save, id, kind, n) !== 'available') return false;
    if (kind !== 'skills') for (const [key, amount] of Object.entries(n.cost)) { if (key === 'gold') save.gold -= amount; else save.inventory[key] -= amount; }
    const c = save.progression.characters[id];
    if (kind === 'skills') { c.skillRanks ||= {}; c.skillRanks[n.id] = rank(save,id,n.id) + 1; }
    if (!c[kind].includes(n.id)) c[kind].push(n.id); return true;
  }
  function purchaseGearBatch(save, candidates, limit = 24) {
    if (!Array.isArray(candidates) || !Number.isSafeInteger(limit) || limit <= 0) return [];
    const trees = new Map(), rows = [];
    for (const row of candidates) {
      if (!Object.hasOwn(CHARACTERS, row?.character) || !['weapon', 'armor'].includes(row.slot)) continue;
      const key = row.character + ':' + row.slot;
      if (!trees.has(key)) trees.set(key, new Map(allGearTrees(row.character, row.slot, true).map(node => [node.id, node])));
      const node = trees.get(key).get(row.node);
      if (node) rows.push({ character: row.character, slot: row.slot, node });
    }
    const bought = [];
    // Re-evaluate prerequisites after each purchase, using authoritative trees
    // built once per slot rather than rebuilding all 600 nodes per acquisition.
    while (bought.length < limit) {
      const next = rows.find(row => status(save, row.character, row.slot, row.node) === 'available');
      if (!next || !purchaseNode(save, next.character, next.slot, next.node)) break;
      bought.push({ character: next.character, slot: next.slot, node: next.node.id });
    }
    return bought;
  }
  function gearPurchasePlan(save, id, slot, nodeId) {
    const plan = { nodes: [], cost: {}, status: 'invalid', blockedStage: null };
    if (!Object.hasOwn(CHARACTERS, id) || !['weapon', 'armor'].includes(slot)) return plan;
    const treeKey = id + ':' + slot;
    if (!purchaseTrees.has(treeKey)) purchaseTrees.set(treeKey, new Map(allGearTrees(id, slot, true).map(n => [n.id, n])));
    const nodes = purchaseTrees.get(treeKey), target = nodes.get(nodeId);
    if (!target) return plan;
    const owned = new Set(save.progression.characters[id][slot]), visited = new Set(), visiting = new Set();
    function visit(uid) {
      if (owned.has(uid) || visited.has(uid)) return true;
      const n = nodes.get(uid);
      if (!n || visiting.has(uid)) return false;
      visiting.add(uid);
      for (const req of n.requires) if (!visit(req)) return false;
      visiting.delete(uid); visited.add(uid); plan.nodes.push(structuredClone(n));
      for (const [key, amount] of Object.entries(n.cost)) plan.cost[key] = (plan.cost[key] || 0) + amount;
      return true;
    }
    if (!visit(nodeId)) return { ...plan, nodes: [], cost: {} };
    plan.blockedStage = plan.nodes.find(n => !save.cleared.includes(n.stage))?.stage ?? null;
    plan.status = owned.has(nodeId) ? 'owned' : !unlocked(save, id) || plan.blockedStage !== null ? 'locked'
      : Object.entries(plan.cost).every(([key, amount]) => (key === 'gold' ? save.gold : save.inventory[key] || 0) >= amount) ? 'available' : 'cost';
    return plan;
  }
  function purchaseGearPath(save, id, slot, nodeId) {
    const plan = gearPurchasePlan(save, id, slot, nodeId);
    if (plan.status !== 'available') return false;
    // Validate the entire path before spending anything or acquiring any nodes.
    for (const [key, amount] of Object.entries(plan.cost)) {
      if (key === 'gold') save.gold -= amount;
      else save.inventory[key] -= amount;
    }
    save.progression.characters[id][slot].push(...plan.nodes.map(n => n.id));
    return true;
  }
  function decreaseSkill(save, id, nodeId) {
    if (!Object.hasOwn(CHARACTERS, id) || !unlocked(save, id)) return 0;
    const nodes = SKILLS[id], n = nodes.find(n => n.id === nodeId);
    if (!n || n.cost === 0 || !rank(save, id, nodeId)) return 0;
    const before = points(save, id), c = save.progression.characters[id];
    function setRank(node, value) {
      c.skillRanks ||= {};
      if (value) c.skillRanks[node.id] = value;
      else {
        delete c.skillRanks[node.id];
        c.skills = c.skills.filter(id => id !== node.id);
      }
    }
    setRank(n, rank(save, id, nodeId) - 1);
    // Repeat until stable so dependent skills reset regardless of tree order.
    let changed;
    do {
      changed = false;
      for (const node of nodes) if (node.cost !== 0 && rank(save, id, node.id) && node.requires.some(req => !rank(save, id, req))) {
        setRank(node, 0); changed = true;
      }
    } while (changed);
    return points(save, id) - before;
  }
  const gemInstance = (save, uid) => save.gems.find(g => g.id === Number(uid));
  function gemOwner(save, uid) {
    for (const [character, c] of Object.entries(save.progression.characters)) for (const slot of ['weapon', 'armor']) if (c.gems[slot].includes(Number(uid))) return { character, slot };
    return null;
  }
  function availableGems(save, gemId) { return save.gems.filter(g => g.type === gemId && !gemOwner(save, g.id)).length; }
  function addGem(save,input,level=1,random=Math.random) {
    if(!Number.isSafeInteger(save.nextGemId)||save.nextGemId<1||save.nextGemId>=Number.MAX_SAFE_INTEGER)return null;
    const type=GEMS[input],value=Gem.validate(type?Gem.generate({rarity:type.rarity,family:type.family,level,random}):input);
    if(!value)return null;const gem={...value,id:save.nextGemId++};save.gems.push(gem);Gem.rememberRarity(save,gem.rarity);return gem;
  }
  function equipGem(save, id, slot, uid) {
    const gem = gemInstance(save, uid);
    if (!unlocked(save, id) || !gem || !['weapon', 'armor'].includes(slot) || gemOwner(save, uid) || !Gem.describe(gem).jobs.includes(id)) return false;
    const gems = save.progression.characters[id].gems[slot];
    if (!gemUsage(save, id, slot, [...gems, gem.id]).fits) return false;
    gems.push(gem.id); return true;
  }
  function unequipGem(save, id, slot, uid) {
    if (!unlocked(save, id) || !['weapon', 'armor'].includes(slot)) return false;
    const gems = save.progression.characters[id].gems[slot], index = gems.indexOf(Number(uid));
    if (index < 0) return false;
    gems.splice(index, 1); return true;
  }
  function toggleGem(save, id, slot, uid) {
    const owner = gemOwner(save, uid);
    return owner ? unequipGem(save, owner.character, owner.slot, uid) : equipGem(save, id, slot, uid);
  }
  function gainXp(save, stage) {
    const leveled = [];
    if (!Number.isSafeInteger(stage) || stage < 1) return leveled;
    for (const id of Object.keys(CHARACTERS)) if (unlocked(save, id)) {
      const c = save.progression.characters[id], before = level(c.xp);
      if(c.skipRecruitReward){const skip=c.skipRecruitReward;delete c.skipRecruitReward;if(stage===skip)continue;}
      if (c.xp.level >= MAX_LEVEL) { c.xp = experience(MAX_LEVEL); continue; }
      let exponent = stage - c.xp.level - 1;
      if (exponent <= -20) continue;
      // Carry in units of the current level. Never compute a positive power of 3.
      while (exponent > 0 && c.xp.level < MAX_LEVEL) { c.xp.progress = (c.xp.progress - 1) / 3; c.xp.level++; exponent--; }
      if (c.xp.level < MAX_LEVEL) c.xp.progress += 3 ** exponent;
      while (c.xp.level < MAX_LEVEL && c.xp.progress >= 1 - 1e-12) { c.xp.progress = Math.max(0, (c.xp.progress - 1) / 3); c.xp.level++; }
      if (c.xp.level >= MAX_LEVEL) c.xp = experience(MAX_LEVEL);
      if (c.xp.progress <= 3 ** -20) c.xp.progress = 0;
      if (level(c.xp) > before) leveled.push(id);
    }
    return leveled;
  }
  function restore(raw, cleared, instances = []) {
    const clean = fresh(), save = { progression: clean, cleared, gems: instances, gold: 0 };
    const equipped = new Set();
    for (const id of Object.keys(CHARACTERS)) {
      const input = raw?.characters?.[id], c = clean.characters[id];
      if(!input&&id==='paladin'&&cleared.includes(10))c.xp=experience(10);
      if (Number.isSafeInteger(input?.xp?.level) && input.xp.level >= 1 && Number.isFinite(input.xp.progress) && input.xp.progress >= 0 && input.xp.progress < 1) c.xp = experience(input.xp.level, input.xp.progress);
      if (!unlocked(save, id)) continue;
      if(id==='ninja'&&(!input||((!input.xp||input.xp.level<=1)&&!input.weapon?.length&&!input.armor?.length&&!Object.keys(input.skillRanks||{}).length))) {recruitNinja(save);continue;}
      if(id==='shaman'&&(!input||((!input.xp||input.xp.level<=1)&&!input.weapon?.length&&!input.armor?.length&&!Object.keys(input.skillRanks||{}).length))) {recruitShaman(save);continue;}
      if(id==='miko'&&(!input||((!input.xp||input.xp.level<=1)&&!input.weapon?.length&&!input.armor?.length&&!Object.keys(input.skillRanks||{}).length))) {recruitMiko(save);continue;}
      if(id==='miko'&&input.skipRecruitReward===40)c.skipRecruitReward=40;
      if(id==='shaman'&&input.skipRecruitReward===30)c.skipRecruitReward=30;
      if(id==='ninja'&&input.skipRecruitReward===20)c.skipRecruitReward=20;
      // Recruitment grants the starting level's SP, including when restoring a save.
      if (id === 'mage' && c.xp.level < CHARACTERS.mage.unlock) c.xp = experience(CHARACTERS.mage.unlock);
      for (const kind of ['weapon', 'armor', 'skills']) {
        const nodes = kind === 'skills' ? SKILLS[id] : allGearTrees(id, kind, true), requested = Array.isArray(input?.[kind]) ? input[kind] : [];
        if (kind === 'skills') {
          for (const n of nodes) {
            const value = input?.skillRanks?.[n.id] ?? 0;
            if (!Number.isSafeInteger(value) || value < 0) continue;
            for (let i=0; i<Math.min(n.maxRank || 1,value); i++) if (!purchase(save,id,kind,n.id)) break;
          }
          continue;
        }
        // Restore in dependency order and reject orphaned purchases / overspent points.
        for (const n of nodes) if (n.cost !== 0 && requested.includes(n.id) && n.requires.every(req => c[kind].includes(req) || (kind === 'skills' && nodes.find(s => s.id === req)?.cost === 0)) &&
          (kind === 'skills' ? points(save, id) >= n.cost : cleared.includes(n.stage)||(['ninja','shaman','miko'].includes(id)&&n.main&&n.stage<=CHARACTERS[id].unlock))) c[kind].push(n.id);
        if (Array.isArray(input?.gems?.[kind])) for (const uid of input.gems[kind]) if (Number.isSafeInteger(uid) && gemInstance(save, uid) && Gem.describe(gemInstance(save,uid)).jobs.includes(id) && !equipped.has(uid) && gemUsage(save, id, kind, [...c.gems[kind], uid]).fits) { c.gems[kind].push(uid); equipped.add(uid); }
      }
    }
    if (unlocked(save, raw?.selected)) clean.selected = raw.selected;
    return clean;
  }
  function respec(save,id) { const c=save.progression.characters[id]; c.skills=[]; c.skillRanks={}; }
  return { MAX_LEVEL, CHARACTERS, SKILLS, GEMS, Gem, GEM_DIRECTIONS, fresh, restore, unlocked, level, experience, xpPercent, totalPoints, points, rank, respec, decreaseSkill, gearTree, allGearTrees, equipmentAppearance, gearBonuses, effects, capacity, gemCost, gemCosts, gemUsage, gemInstance, gemOwner, addGem, availableGems, stats, status, purchase, purchaseGearBatch, gearPurchasePlan, purchaseGearPath, equipGem, unequipGem, toggleGem, gainXp, recruitNinja, recruitShaman, recruitMiko };
});
