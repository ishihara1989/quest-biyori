'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, sharp = require('sharp');
const root = path.join(__dirname, '../../public/assets/ui/loot');
const names = ['edgegem', 'arcanegem', 'quickgem', 'heartgem', 'clockgem', 'twinflare', 'wardleaf', 'prism', 'bosscrystal'];
async function cells(source, cols, rows, size) {
  const meta = await sharp(source).metadata(), output = [];
  if (!meta.hasAlpha) throw new Error('Generated asset must preserve transparency');
  for (let i = 0; i < cols * rows; i++) {
    const left = Math.round(i % cols * meta.width / cols), top = Math.round(Math.floor(i / cols) * meta.height / rows);
    const width = Math.round((i % cols + 1) * meta.width / cols) - left;
    const height = Math.round((Math.floor(i / cols) + 1) * meta.height / rows) - top;
    output.push(await sharp(source).extract({ left, top, width, height }).resize(size, size).png().toBuffer());
  }
  return output;
}
(async () => {
  const frames = await cells(path.join(root, 'source/chest-opening-v1.png'), 2, 2, 512);
  for (let i = 0; i < frames.length; i++) await sharp(frames[i]).png().toFile(path.join(root, 'chest-' + (i + 1) + '.png'));
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#00000000' } })
    .composite(frames.map((input, i) => ({ input, left: i % 2 * 512, top: Math.floor(i / 2) * 512 })))
    .png().toFile(path.join(root, 'chest-opening.png'));
  const gems = await cells(path.join(root, 'source/gem-atlas-v1.png'), 3, 3, 224);
  for (let i = 0; i < names.length; i++) {
    const file = path.join(root, '../items', names[i] + '.png');
    await sharp(gems[i]).extend({ top: 16, bottom: 16, left: 16, right: 16, background: '#00000000' }).png().toFile(file);
    if (i < 8) fs.copyFileSync(file, path.join(root, '../progression', names[i] + '.png'));
  }
  writeAssetJson(path.join(root, 'manifest.json'), { source: 'source/chest-opening-v1.png', sheet: 'chest-opening.png', columns: 2, rows: 2,
    frameWidth: 512, frameHeight: 512, frameStartsMs: [0, 350, 650, 1000], revealStartsMs: 1500, loop: false,
    gemSource: 'source/gem-atlas-v1.png', gemGrid: [3, 3], icons: names });
  console.log('Built four chest frames, nine inventory icons and eight gem socket icons.');
})().catch(e => { console.error(e); process.exitCode = 1; });
