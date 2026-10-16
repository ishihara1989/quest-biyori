'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
// Review composites preserve the installed PNG poses; they do not create art.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { characters } = require('./motion-specs.cjs');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const search = [__dirname, process.env.NODE_PATH, bundled].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: search }));
const sharp = require(require.resolve('sharp', { paths: search }));
const directory = path.join(__dirname, '../../output/walk-review');
makeAssetDirectory(directory, { recursive: true });
(async () => {
  const width = 768, pageHeight = 496, labels = await sharp(Buffer.from(
    '<svg width="768" height="496" xmlns="http://www.w3.org/2000/svg">' +
    characters.map((character, index) => `<text x="${index % 3 * 256 + 16}" y="${Math.floor(index / 3) * 248 + 20}" font-family="sans-serif" font-size="13" fill="#d6b786">${character.toUpperCase()}</text>`).join('') + '</svg>')).raw().ensureAlpha().toBuffer();
  for (const motion of ['forward', 'backward']) {
    const manifests = characters.map(character => JSON.parse(fs.readFileSync(
      path.join(__dirname, '../../public/assets', character, 'motions', motion, 'manifest.json'), 'utf8')));
    if (!manifests.every(manifest => manifest.frameCount === 8)) throw new Error('All characters need eight installed poses');
    const data = Buffer.alloc(width * pageHeight * 8 * 4);
    for (let frame = 0; frame < 8; frame++) {
      const canvas = Buffer.alloc(width * pageHeight * 4);
      for (let pixel = 0; pixel < canvas.length; pixel += 4) canvas.set([21, 23, 28, 255], pixel);
      for (let character = 0; character < characters.length; character++) {
        const image = PNG.sync.read(fs.readFileSync(path.join(__dirname, '../../public/assets',
          characters[character], 'motions', motion, manifests[character].frames[frame].file)));
        const left = character % 3 * 256, top = Math.floor(character / 3) * 248 + 24;
        for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
          const src = (y * image.width + x) * 4, dest = ((top + y) * width + left + x) * 4;
          const alpha = image.data[src + 3] / 255;
          for (let channel = 0; channel < 3; channel++) canvas[dest + channel] = Math.round(
            image.data[src + channel] * alpha + canvas[dest + channel] * (1 - alpha));
        }
      }
      for (let pixel = 0; pixel < canvas.length; pixel += 4) {
        const alpha = labels[pixel + 3] / 255;
        for (let channel = 0; channel < 3; channel++) canvas[pixel + channel] = Math.round(
          labels[pixel + channel] * alpha + canvas[pixel + channel] * (1 - alpha));
      }
      data.set(canvas, frame * width * pageHeight * 4);
      if (frame === 0) await sharp(canvas, { raw: { width, height: pageHeight, channels: 4 } })
        .png().toFile(path.join(directory, `${motion}-first.png`));
    }
    await sharp(data, { raw: { width, height: pageHeight * 8, channels: 4, pageHeight } })
      .gif({ loop: 0, delay: manifests[0].frames.map(frame => frame.durationMs), colours: 256,
        dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 })
      .toFile(path.join(directory, `${motion}-all.gif`));
    console.log(JSON.stringify({ motion, characters: 6, frames: 8, directory }));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
