'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths, crypto = require('node:crypto');
const { sample } = require('../public/js/core/motion-playback.js');
const { bounds } = require('../tools/assets/build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../public/assets');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const treant = root + '/enemies/treant/motions';
const motion = id => json(`${treant}/${id}/manifest.json`);
test('37 treant/projectile/effect frames are present, unclipped, distinct, transparent, and agree with sheets and GIF timing', async () => {
  const enemy = json(root + '/enemies/index.json').find(item => item.id === 'treant');
  assert.ok(enemy); const idle = motion('idle');
  const entries = [
    ...json(treant + '/index.json').map(def => `${treant}/${def.id}`),
    ...json(root + '/effects/index.json').filter(def => ['fruit-bomb', 'explosion', 'root-eruption'].includes(def.id)).map(def => `${root}/effects/${def.id}`),
  ];
  assert.equal(entries.length, 10); let total = 0;
  for (const dir of entries) {
    const model = json(dir + '/manifest.json'), sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
    assert.ok(fs.existsSync(path.resolve(dir, model.source))); assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    assert.equal(sheet.width, model.width); assert.equal(sheet.height, model.height);
    assert.equal(model.frameCount, model.frames.length); assert.equal(model.frameCount, model.effect === 'fruit-bomb' ? 1 : 4);
    if (model.enemy) { assert.equal(model.facing, 'left'); assert.deepEqual(model.pivot, idle.pivot); assert.equal(model.frameWidth, enemy.viewport.width); }
    const hashes = new Set();
    for (const frame of model.frames) {
      const img = PNG.sync.read(fs.readFileSync(path.join(dir, frame.file))); total++;
      assert.equal(img.width, model.frameWidth); assert.equal(img.height, model.frameHeight);
      hashes.add(crypto.createHash('sha256').update(img.data).digest('hex'));
      assert.deepEqual(bounds(img, 32), frame.bounds);
      for (let y = 0; y < img.height; y++) {
        assert.deepEqual(img.data.subarray(y * img.width * 4, (y + 1) * img.width * 4),
          sheet.data.subarray((y * sheet.width + frame.x) * 4, (y * sheet.width + frame.x + img.width) * 4));
        assert.equal(img.data[y * img.width * 4 + 3], 0); assert.equal(img.data[(y * img.width + img.width - 1) * 4 + 3], 0);
      }
      for (let x = 0; x < img.width; x++) { assert.equal(img.data[x * 4 + 3], 0); assert.equal(img.data[((img.height - 1) * img.width + x) * 4 + 3], 0); }
      for (let i = 3; i < img.data.length; i += 4) assert.ok(img.data[i] === 0 || img.data[i] >= model.alphaCutoff, 'No diffuse alpha matte');
    }
    assert.equal(hashes.size, model.frameCount, 'All animation frames are distinct');
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages, model.frameCount); assert.equal(gif.pageHeight || gif.height, model.frameHeight * 2);
    assert.deepEqual(gif.delay, model.frames.map(f => f.durationMs)); assert.equal(gif.loop, model.loop ? 0 : 1);
  }
  assert.equal(total, 37);
});
test('idle loops, five actions recover or hold their corpse, and combat events match frame beginnings', () => {
  const idle = motion('idle');
  for (const id of ['idle', 'move']) {
    const loop = motion(id);
    assert.equal(loop.loop, true);
    assert.equal(sample(loop, idle, loop.durationMs - 1).frame, 3);
    assert.equal(sample(loop, idle, loop.durationMs).frame, 0);
    assert.equal(sample(loop, idle, loop.durationMs * 8 + 10).motion, id);
    for (const frame of loop.frames) assert.equal(frame.bounds.bottom, loop.pivot.y);
  }
  // Root deformation must not move the upper trunk from side to side.
  const upperCenters = motion('move').frames.map(frame => {
    const image = PNG.sync.read(fs.readFileSync(`${treant}/move/${frame.file}`));
    let sum = 0, count = 0;
    for (let y = 0; y < 243; y++) for (let x = 0; x < image.width; x++) {
      if (image.data[(y * image.width + x) * 4 + 3]) { sum += x; count++; }
    }
    return sum / count;
  });
  assert.ok(Math.max(...upperCenters) - Math.min(...upperCenters) < 4, 'Upper trunk stays registered while roots wriggle');
  for (const id of ['attack', 'hit', 'throw-fruit', 'root-bury']) {
    const model = motion(id); assert.equal(sample(model, idle, model.durationMs).motion, 'idle');
    for (const event of model.events || []) assert.equal(event.timeMs, model.frames.slice(0, event.frame).reduce((sum, f) => sum + f.durationMs, 0));
  }
  const down = motion('down');
  assert.equal(sample(down, idle, 1000000).frame, 3); assert.equal(sample(down, idle, 1000000).motion, 'down');
  assert.ok(down.frames[3].bounds.bottom - down.frames[3].bounds.top < (idle.frames[0].bounds.bottom - idle.frames[0].bounds.top) / 2);
  assert.ok(motion('attack').frames[2].bounds.left < idle.frames[0].bounds.left - 35);
});
test('root eruption grows from below without changing scale, and reusable effects disappear after one playback', () => {
  const roots = json(root + '/effects/root-eruption/manifest.json'), explosion = json(root + '/effects/explosion/manifest.json');
  const heights = roots.frames.map(f => f.bounds.bottom - f.bounds.top);
  assert.ok(heights[0] < heights[1] && heights[1] < heights[2] && heights[3] < heights[2]);
  for (const frame of roots.frames) assert.equal(frame.bounds.bottom, roots.pivot.y);
  for (const model of [roots, explosion]) { assert.equal(model.loop, false); assert.equal(model.endBehavior, 'hide'); }
});
