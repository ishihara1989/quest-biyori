'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
// Contact sheets composite installed sprites without changing the game assets.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { characterSpecs } = require('./motion-specs.cjs');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [__dirname, process.env.NODE_PATH, bundled].filter(Boolean) }));
const directory = path.join(__dirname, '../../output/warrior-attacks');
const assets = path.join(__dirname, '../../public/assets/warrior/motions');
const entries = Object.entries(characterSpecs.warrior);
(async () => {
  makeAssetDirectory(directory, { recursive: true });
  const width = 1024, rowHeight = 260, height = rowHeight * entries.length;
  const layers = [];
  for (let row = 0; row < entries.length; row++) {
    const [motion] = entries[row];
    layers.push({ input: path.join(assets, motion, `warrior-${motion}.png`), left: 0, top: row * rowHeight + 28 });
  }
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` + entries.map(([motion], row) =>
    `<text x="16" y="${row * rowHeight + 20}" font-family="sans-serif" font-size="13" fill="#d6b786">${motion.toUpperCase()}</text>` +
    Array.from({ length: 4 }, (_, frame) => `<text x="${frame * 256 + 232}" y="${row * rowHeight + 20}" font-family="sans-serif" font-size="12" fill="#8d93a0">${frame + 1}</text>`).join('') +
    `<path d="M 8 ${row * rowHeight + 235} H 1016" stroke="#48515d" stroke-width="1"/>`).join('') + '</svg>';
  layers.push({ input: Buffer.from(svg), left: 0, top: 0 });
  const file = path.join(directory, 'warrior-attacks-review.png');
  await sharp({ create: { width, height, channels: 4, background: '#191c23' } })
    .composite(layers).png().toFile(file);
  console.log(file);
})().catch(error => { console.error(error); process.exitCode = 1; });
