'use strict';
// Compare actual output artwork. Resize/crop only; never draw sprite anatomy.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { bounds } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boss-boar');

async function reviewWalk() {
  const width = 1800, height = 900, cellWidth = 600, rowHeight = 450;
  const layers = [], labels = [];
  const columns = ['通常イノシシ', 'ボス・修正前', 'ボス・修正後'];
  for (const [row, frame] of [3, 4].entries()) {
    const file = `move-0${frame}.png`;
    const sources = [path.join(root, '../boar/motions/move', file),
      path.join(root, 'source/walk-before-root-fix', file), path.join(root, 'motions/move', file)];
    for (const [column, source] of sources.entries()) {
      const png = PNG.sync.read(fs.readFileSync(source)), b = bounds(png);
      const sprite = await sharp(source).extract({ left: b.left, top: b.top,
        width: b.right - b.left + 1, height: b.bottom - b.top + 1 })
        .resize({ width: 530, height: 365, fit: 'inside', kernel: 'nearest' }).png().toBuffer();
      const size = await sharp(sprite).metadata();
      const left = column * cellWidth + Math.floor((cellWidth - size.width) / 2);
      const bottom = row * rowHeight + 420;
      layers.push({ input: sprite, left, top: bottom - size.height });
      labels.push(`<text x="${column * cellWidth + 30}" y="${row * rowHeight + 32}" fill="#e5edf4" font-family="Meiryo, sans-serif" font-size="23">${frame}コマ目 — ${columns[column]}</text>`);
      labels.push(`<path d="M${column * cellWidth + 24} ${bottom + 8}h552" stroke="#526271" stroke-dasharray="4 8"/>`);
    }
  }
  const captions = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${labels.join('')}</svg>`);
  const output = path.join(root, 'boss-boar-move-root-comparison.png');
  await sharp({ create: { width, height, channels: 4, background: '#25313c' } })
    .composite([{ input: captions, left: 0, top: 0 }, ...layers]).png().toFile(output);
  return output;
}
if (require.main === module) reviewWalk().then(file => console.log(file)).catch(error => {
  console.error(error); process.exitCode = 1;
});
module.exports = { reviewWalk };
