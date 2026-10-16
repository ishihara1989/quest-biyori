'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
// Enlarge installed poses for visual review. No pose pixels are redrawn.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { characters } = require('./motion-specs.cjs');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [__dirname, process.env.NODE_PATH, bundled].filter(Boolean) }));
const directory = path.join(__dirname, '../../output/walk-review');
makeAssetDirectory(directory, { recursive: true });
(async () => {
  const selected = process.argv[2] ? [process.argv[2]] : characters;
  for (const character of selected) for (const motion of ['forward', 'backward']) {
    const asset = path.join(__dirname, '../../public/assets', character, 'motions', motion);
    const manifest = JSON.parse(fs.readFileSync(path.join(asset, 'manifest.json'), 'utf8'));
    const cellWidth = 512, cellHeight = 472;
    const composite = [];
    for (let index = 0; index < 8; index++) {
      const input = await sharp(path.join(asset, manifest.frames[index].file))
        .resize(512, 448, { kernel: 'nearest' }).png().toBuffer();
      composite.push({ input, left: index % 4 * cellWidth, top: Math.floor(index / 4) * cellHeight + 24 });
    }
    const labels = Buffer.from('<svg width="2048" height="944" xmlns="http://www.w3.org/2000/svg">' +
      manifest.frames.map((frame, index) => `<text x="${index % 4 * cellWidth + 16}" y="${Math.floor(index / 4) * cellHeight + 18}" font-family="sans-serif" font-size="16" fill="#e5c899">${index + 1} ${frame.phase}</text>`).join('') + '</svg>');
    composite.push({ input: labels, top: 0, left: 0 });
    await sharp({ create: { width: 2048, height: 944, channels: 4, background: '#15171c' } })
      .composite(composite).png().toFile(path.join(directory, `${character}-${motion}-frames.png`));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
