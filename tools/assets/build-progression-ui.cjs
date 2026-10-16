'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, sharp = require('sharp');
const root = path.join(__dirname, '../../public/assets/ui/progression');
const icons = ['staff', 'robe', 'greatsword', 'leather', 'whirlwind', 'evade', 'counter', 'battle-aura',
  'wind-blade', 'vortex', 'wind-burst', 'ward', 'attack-gem', 'defense-gem', 'utility-gem', 'universal-gem'];
(async () => {
  const source = path.join(root, 'source/progression-atlas-v1.png'), meta = await sharp(source).metadata();
  for (let i = 0; i < icons.length; i++) {
    const left = Math.round(i % 4 * meta.width / 4), top = Math.round(Math.floor(i / 4) * meta.height / 4);
    await sharp(source).extract({ left, top, width: Math.round((i % 4 + 1) * meta.width / 4) - left,
      height: Math.round((Math.floor(i / 4) + 1) * meta.height / 4) - top }).resize(256, 256).png().toFile(path.join(root, icons[i] + '.png'));
  }
  for (const [item, icon] of [['staff', 'staff'], ['robe', 'robe'], ['ruby', 'attack-gem'], ['sapphire', 'defense-gem'], ['emerald', 'utility-gem']]) {
    fs.copyFileSync(path.join(root, icon + '.png'), path.join(root, '../items', item + '.png'));
  }
  console.log('Built 16 progression icons and 5 inventory icons.');
})().catch(e => { console.error(e); process.exitCode = 1; });
