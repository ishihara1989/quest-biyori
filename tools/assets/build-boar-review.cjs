'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boar');
const read = id => JSON.parse(fs.readFileSync(path.join(root, 'motions', id, 'manifest.json'), 'utf8'));

async function main() {
  const width = 1920, rowHeight = 264, height = rowHeight * 5;
  const layers = [], labels = [], ids = ['idle', 'move', 'attack', 'hit', 'down'];
  for (const [row, id] of ids.entries()) {
    const model = read(id), top = row * rowHeight + 32;
    labels.push(`<text x="18" y="${row * rowHeight + 23}" fill="#cdd6dc" font-family="Segoe UI" font-size="16">${id === 'attack' ? 'CHARGE' : id.toUpperCase()} / ${model.frameCount} FRAMES</text>`);
    for (const frame of model.frames) {
      const left = frame.index * model.frameWidth;
      layers.push({ input: path.join(root, 'motions', id, frame.file), left, top });
      labels.push(`<text x="${left + 12}" y="${top + 18}" fill="#8d9da8" font-family="Segoe UI" font-size="14">${frame.index + 1} / ${frame.durationMs} ms</text>`);
      labels.push(`<path d="M${left + 28} ${top + 208}h264" stroke="#43535e" stroke-dasharray="3 6"/>`);
    }
  }
  const caption = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${labels.join('')}</svg>`);
  await sharp({ create: { width, height, channels: 4, background: '#20272d' } })
    .composite([{ input: caption, left: 0, top: 0 }, ...layers]).png().toFile(path.join(root, 'boar-all-motions-qa.png'));
  const legs = [], walk = read('move'), cellWidth = 430, cellHeight = 180;
  for (const frame of walk.frames) {
    const pixels = await sharp(path.join(root, 'motions/move', frame.file)).extract({ left: 55, top: 135, width: 215, height: 82 })
      .resize(430, 164, { kernel: 'nearest' }).png().toBuffer();
    legs.push({ input: pixels, left: (frame.index % 3) * cellWidth, top: Math.floor(frame.index / 3) * cellHeight + 16 });
  }
  await sharp({ create: { width: cellWidth * 3, height: cellHeight * 2, channels: 4, background: '#20272d' } })
    .composite(legs).png().toFile(path.join(root, 'boar-move-legs-qa.png'));
  const sequences = [read('idle'), walk, walk, read('idle')];
  const frames = sequences.flatMap(model => model.frames.map(frame => ({ model, frame })));
  const gifWidth = 640, gifHeight = 448, raw = Buffer.alloc(gifWidth * gifHeight * frames.length * 4);
  for (const [index, { model, frame }] of frames.entries()) {
    const image = PNG.sync.read(fs.readFileSync(path.join(root, 'motions', model.motion, frame.file)));
    for (let y = 0; y < gifHeight; y++) for (let x = 0; x < gifWidth; x++) {
      const from = (Math.floor(y / 2) * image.width + Math.floor(x / 2)) * 4;
      raw.set(image.data.subarray(from, from + 4), ((index * gifHeight + y) * gifWidth + x) * 4);
    }
  }
  await sharp(raw, { raw: { width: gifWidth, height: gifHeight * frames.length, channels: 4, pageHeight: gifHeight } })
    .gif({ loop: 0, delay: frames.map(({ frame }) => frame.durationMs), colours: 256, dither: 0,
      keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(path.join(root, 'boar-idle-move-preview.gif'));
  const palette = [];
  for (const id of ids) for (const frame of read(id).frames) {
    const image = PNG.sync.read(fs.readFileSync(path.join(root, 'motions', id, frame.file)));
    const luminance = []; let count = 0, red = 0, green = 0, blue = 0;
    for (let pos = 0; pos < image.data.length; pos += 4) {
      const [r, g, b, a] = image.data.subarray(pos, pos + 4);
      if (a < 240 || r < g * 1.2 || g < b * 1.25 || g < 36) continue;
      count++; red += r; green += g; blue += b;
      luminance.push(.2126 * r + .7152 * g + .0722 * b);
    }
    luminance.sort((a, b) => a - b);
    palette.push({ motion: id, frame: frame.index, furMeanRGB: [red / count, green / count, blue / count].map(Math.round),
      furMedianLuminance: Math.round(luminance[Math.floor(luminance.length / 2)]) });
  }
  writeAssetJson(path.join(root, 'palette-review.json'), palette);
  console.log(JSON.stringify(palette));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
