'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, sharp = require('sharp');
const root = path.join(__dirname, '../../public/assets'), source = path.join(root, 'ui/source/swamp-loot');
const items = ['venom-sac', 'living-mud', 'cursed-bone', 'swamp-crystal', 'hydra-scale'];
(async () => {
  for (const id of items) {
    await sharp(path.join(source, id + '-generated-v1.png')).trim({ threshold: 8 })
      .resize(116, 116, { fit: 'contain', kernel: 'nearest', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toFile(path.join(root, 'ui/items', id + '.png'));
  }
  for (const id of ['giga-toad', 'king-toad', 'mud-hand', 'mud-giant', 'skeleton', 'lich', 'hydra']) {
    await sharp(path.join(root, 'enemies', id, 'motions/idle/idle-01.png')).trim({ threshold: 8 })
      .resize(128, 128, { fit: 'contain', kernel: 'nearest', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toFile(path.join(root, 'ui/enemies', id + '.png'));
  }
  console.log('Built 5 swamp loot icons and 7 enemy thumbnails.');
})().catch(e => { console.error(e); process.exitCode = 1; });
