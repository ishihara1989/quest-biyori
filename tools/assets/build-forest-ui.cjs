'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const sharp = require('sharp');
const root = path.join(__dirname, '../..', 'public', 'assets');
const out = path.join(root, 'ui');
async function build() {
  makeAssetDirectory(path.join(out, 'items'), { recursive: true });
  makeAssetDirectory(path.join(out, 'enemies'), { recursive: true });
  const atlas = path.join(out, 'source', 'inventory-atlas-v1.png');
  const meta = await sharp(atlas).metadata();
  const items = ['sword', 'armor', 'boots', 'pendant', 'gold', 'jelly', 'tusk', 'flower', 'wood', 'potion', 'crystal', 'chest'];
  // The generated atlas has generous top padding and three unequal row gutters.
  const rows = [[0, 500], [500, 350], [850, 430]];
  for (let i = 0; i < items.length; i++) {
    const x = Math.round(i % 4 * meta.width / 4), right = Math.round((i % 4 + 1) * meta.width / 4);
    const [top, height] = rows[Math.floor(i / 4)].map(n => Math.round(n * meta.height / 1280));
    const cell = await sharp(atlas).extract({ left: x, top, width: right - x, height }).png().toBuffer();
    await sharp(cell).trim({ threshold: 8 }).resize(128, 128, { fit: 'contain', kernel: 'nearest', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'items', items[i] + '.png'));
  }
  for (const enemy of JSON.parse(fs.readFileSync(path.join(root, 'enemies', 'index.json'), 'utf8'))) {
    await sharp(path.join(root, 'enemies', enemy.id, enemy.thumbnail)).trim({ threshold: 8 })
      .resize(128, 128, { fit: 'contain', kernel: 'nearest', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'enemies', enemy.id + '.png'));
  }
  console.log('Built 12 item icons and 7 enemy thumbnails.');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
