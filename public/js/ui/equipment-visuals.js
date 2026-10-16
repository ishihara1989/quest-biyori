'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EquipmentVisuals = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const REGIONS = ['forest', 'swamp', 'cave', 'coast', 'ruins', 'desert', 'highland', 'glacier', 'volcano', 'castle'];
  const THEMES = ['', '毒沼', '紫晶', '蒼潮', '古代', '金砂', '風雷', '蒼氷', '紅蓮', '宵闇'];
  const PREFIXES = ['', 'swamp-', 'cave-', 'coast-', 'ruins-', 'desert-', 'highland-', 'glacier-', 'volcano-', 'castle-'];
  const RANKS = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'];
  const CLASSES = {
    warrior: {
      equipment: ['旅立ちの大剣', '革の鎧'],
      evolved: ['大剣', '戦革鎧'],
      side: [['刃の焼入れ', '剛腕の律動'], ['獣革の裏打ち', '鉄腕の護り']],
      crown: ['覇者の大剣', '獅子の戦衣'],
      unique: [['砕牙の刃', '迅雷の拍', '獅子の覇気'], ['不屈の帯', '鋼鉄の籠手', '戦士の泉']],
    },
    mage: {
      equipment: ['風詠みの杖', '風織りのローブ'],
      evolved: ['魔晶杖', '魔織衣'],
      side: [['魔晶の研磨', '詠唱の拍'], ['魔糸の織り', '星紋の護符']],
      crown: ['星詠みの王杖', '星界の法衣'],
      unique: [['蒼晶の焦点', '風詠みの旋律', '星火の秘儀'], ['命紡ぎの帯', '星盾の腕輪', '魔力の雫']],
    },
    paladin: {
      equipment: ['聖騎士のメイス', '聖騎士の重装'],
      evolved: ['聖鎚', '聖騎士の重装'],
      side: [['聖鎚の鍛錬', '祈りの拍'], ['聖衣の裏打ち', '聖盾の補強']],
      crown: ['黎明の聖鎚', '不滅の聖盾'],
      unique: [['裁きの鎚頭', '暁鐘の響き', '太陽の聖印'], ['誓約の帯', '金剛の籠手', '祝福の聖杯']],
    },
    ninja: {
      equipment: ['影鋼の手裏剣', '影織りの忍装'],
      evolved: ['風魔手裏剣', '影装束'],
      side: [['忍鋼の刃先', '早業の結び'], ['忍布の重ね', '影守りの籠手']],
      crown: ['月影の風魔刃', '朧月の忍装'],
      unique: [['斬影の鋼刃', '瞬足の結印', '風魔の奥印'], ['影命の帯', '黒鉄の手甲', '月露の薬瓶']],
    },
    shaman: {
      equipment: ['呪骨の儀杖', '紫煙の祭衣'],
      evolved: ['呪骨杖', '呪祭衣'],
      side: [['呪骨の研磨', '呪鈴の拍'], ['霊布の継ぎ', '骨札の護り']],
      crown: ['冥王の儀杖', '冥界の祭衣'],
      unique: [['怨骨の牙', '冥鈴の残響', '髑髏の呪印'], ['魂縛りの帯', '骨環の結界', '霊魂の香炉']],
    },
    miko: {
      equipment: ['招霊の御幣', '紅白の神楽装束'],
      evolved: ['招霊幣', '神楽装束'],
      side: [['清めの紙垂', '神楽鈴の拍'], ['朱糸の織り', '守札の重ね']],
      crown: ['天照の御幣', '天衣の神楽装束'],
      unique: [['白祓いの紙垂', '神鈴の響き', '日輪の霊印'], ['生命の朱帯', '御守の結界', '清流の水鏡']],
    },
  };
  function image(character, role, region = 1) {
    // Keep the two established, readable base equipment illustrations.
    if (region === 1 && character === 'paladin' && ['weapon', 'armor'].includes(role))
      return 'assets/skills/paladin/icons/' + (role === 'weapon' ? 'mace' : 'aegis') + '.png';
    if (region === 1 && character === 'miko' && ['weapon', 'armor'].includes(role))
      return 'assets/ui/ruins/icons/miko-' + (role === 'weapon' ? 'gohei' : 'robe') + '.png';
    const artworkRegion = region === 'goddess' ? 'goddess' : REGIONS[region - 1];
    return 'assets/ui/equipment/' + character + '/' + role + (['weapon', 'armor'].includes(role) ? '-' + artworkRegion : '') + '.png';
  }
  function appearance(save, character, slot) {
    const owned = new Set(save.progression.characters[character][slot]);
    // Only an acquired main node changes equipment, independently for each slot.
    const region = owned.has('goddess-root') ? 'goddess' : REGIONS.reduce((current, _, i) => {
      const prefix = PREFIXES[i];
      return Array.from({ length: 10 }, (_, j) => prefix + 'main-' + (j + 1)).some(id => owned.has(id)) ? i + 1 : current;
    }, 1);
    const index = slot === 'weapon' ? 0 : 1, config = CLASSES[character];
    const name = region === 1 ? config.equipment[index] : (region === 'goddess' ? '星界' : THEMES[region - 1]) + 'の' + config.evolved[index];
    return { region, image: image(character, slot, region), name };
  }
  function node(character, slot, region, value) {
    const config = CLASSES[character], index = slot === 'weapon' ? 0 : 1;
    const localId = value.id.slice(PREFIXES[region - 1].length);
    if (value.main) return { ...value, icon: image(character, slot, region) };
    if (value.unique) {
      const lane = Number(localId.split('-')[1]);
      const roles = index === 0 ? ['power', 'tempo', 'skill'] : ['vitality', 'guard', 'recovery'];
      const name = (region > 1 ? THEMES[region - 1] + '・' : '') + (lane ? config.unique[index][lane - 1] + ' ' + RANKS[Number(localId.split('-')[2]) - 1] : config.crown[index]);
      return { ...value, name, icon: image(character, lane ? roles[lane - 1] : slot, region) };
    }
    const upper = localId.includes('-up-'), roles = index === 0 ? ['power', 'tempo'] : ['vitality', 'guard'];
    return { ...value, name: config.side[index][upper ? 0 : 1] + ' ' + RANKS[value.depth - 1], icon: image(character, roles[upper ? 0 : 1]) };
  }
  return { REGIONS, CLASSES, image, appearance, node };
});
