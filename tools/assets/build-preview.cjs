'use strict';
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const assert = require('node:assert/strict');
const runtimeModules = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const searchPaths = [__dirname, process.env.NODE_PATH, runtimeModules].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: searchPaths }));
const sharp = require(require.resolve('sharp', { paths: searchPaths }));
const character = process.argv[2] || 'warrior';
assert.ok(['warrior', 'mage', 'paladin', 'ninja', 'shaman', 'miko'].includes(character));
const directory = path.join(__dirname, '../../public/assets', character);
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const scale = 2, width = manifest.frameWidth * scale, pageHeight = manifest.frameHeight * scale;
const pixels = Buffer.alloc(width * pageHeight * manifest.frameCount * 4);
for (let index = 0; index < manifest.frameSequence.length; index++) {
  const frame = manifest.frames[manifest.frameSequence[index]];
  const source = PNG.sync.read(fs.readFileSync(path.join(directory, frame.file)));
  for (let y = 0; y < pageHeight; y++) for (let x = 0; x < width; x++) {
    const offset = (Math.floor(y / scale) * source.width + Math.floor(x / scale)) * 4;
    pixels.set(source.data.subarray(offset, offset + 4), ((index * pageHeight + y) * width + x) * 4);
  }
}
(async () => {
  const file = path.join(directory, `${character}-idle-preview.gif`);
  await sharp(pixels, { raw: { width, height: pageHeight * manifest.frameCount, channels: 4, pageHeight } })
    .gif({ loop: 0, delay: manifest.frames.map(frame => frame.durationMs), colours: 256,
      dither: 0, effort: 7, keepDuplicateFrames: true, interFrameMaxError: 0 })
    .toFile(file);
  const metadata = await sharp(file, { animated: true }).metadata();
  assert.equal(metadata.pages, 4); assert.equal(metadata.pageHeight, 320);
  assert.equal(metadata.loop, 0); assert.deepEqual(metadata.delay, [400, 400, 400, 400]);
  require('../lib/register-ui-art.cjs').publishCharacterPortrait(character);
  console.log(JSON.stringify({ gif: file, frames: metadata.pages, size: '320 × 320',
    delay: metadata.delay, loop: 'infinite', transparent: metadata.hasAlpha }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
