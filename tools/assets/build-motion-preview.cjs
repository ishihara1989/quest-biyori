'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { characters, getMotionSpecs } = require('./motion-specs.cjs');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const search = [__dirname, process.env.NODE_PATH, bundled].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: search }));
const sharp = require(require.resolve('sharp', { paths: search }));
async function buildPreview(character, motion) {
  const specs = getMotionSpecs(character);
  assert.ok(characters.includes(character) && specs[motion]);
  const directory = path.join(__dirname, '../../public/assets', character, 'motions', motion);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  const zoom = 2, width = manifest.frameWidth * zoom, pageHeight = manifest.frameHeight * zoom;
  const data = Buffer.alloc(width * pageHeight * manifest.frameCount * 4);
  for (const frame of manifest.frames) {
    const input = PNG.sync.read(fs.readFileSync(path.join(directory, frame.file)));
    for (let y = 0; y < pageHeight; y++) for (let x = 0; x < width; x++) {
      const sx = Math.floor(x / zoom) - frame.previewOffset.x;
      const sy = Math.floor(y / zoom) - frame.previewOffset.y;
      if (sx < 0 || sy < 0 || sx >= input.width || sy >= input.height) continue;
      const offset = (sy * input.width + sx) * 4;
      data.set(input.data.subarray(offset, offset + 4), ((frame.index * pageHeight + y) * width + x) * 4);
    }
  }
  const file = path.join(directory, `${character}-${motion}-preview.gif`);
  await sharp(data, { raw: { width, height: pageHeight * manifest.frameCount, channels: 4, pageHeight } })
    .gif({ loop: manifest.loop ? 0 : 1, delay: manifest.frames.map(frame => frame.durationMs), colours: 256,
      dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(file);
  const metadata = await sharp(file, { animated: true }).metadata();
  assert.equal(metadata.pages, manifest.frameCount); assert.equal(metadata.pageHeight, pageHeight);
  assert.deepEqual(metadata.delay, manifest.frames.map(frame => frame.durationMs));
  console.log(JSON.stringify({ character, motion, gif: path.basename(file), frameCount: metadata.pages,
    loop: manifest.loop ? 'infinite' : 'once', delay: metadata.delay }));
}
if (require.main === module) (async () => {
  const character = process.argv[2], motion = process.argv[3];
  if (motion) await buildPreview(character, motion);
  else for (const id of Object.keys(getMotionSpecs(character))) await buildPreview(character, id);
})().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildPreview };
