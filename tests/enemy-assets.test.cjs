'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const { sample, elapsedForFrame } = require('../public/js/core/motion-playback.js');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const search = [__dirname, process.env.NODE_PATH, bundled].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: search }));
const sharp = require(require.resolve('sharp', { paths: search }));
const root = path.join(__dirname, '../public/assets/enemies/slime/motions');
const read = motion => JSON.parse(fs.readFileSync(path.join(root, motion, 'manifest.json'), 'utf8'));
const pose = (motion, index) => PNG.sync.read(fs.readFileSync(path.join(root, motion, read(motion).frames[index].file)));
const idle = read('idle');
test('all 19 enemy poses have transparent margins, agree with their sheet and GIF, and retain source provenance', async () => {
  let total = 0;
  for (const def of JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'))) {
    const model = read(def.id), dir = path.join(root, def.id);
    const sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
    assert.equal(sheet.width, model.width); assert.equal(sheet.height, model.height);
    assert.equal(model.frameCount, model.frames.length);
    assert.ok(fs.existsSync(path.resolve(dir, model.source)));
    assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    assert.equal(model.facing, 'left');
    assert.deepEqual(model.pivot, idle.pivot);
    for (const frame of model.frames) {
      const image = pose(def.id, frame.index); total++;
      assert.equal(image.width, model.frameWidth); assert.equal(image.height, model.frameHeight);
      for (let y = 0; y < image.height; y++) {
        assert.deepEqual(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4),
          sheet.data.subarray((y * sheet.width + frame.x) * 4, (y * sheet.width + frame.x + image.width) * 4));
        assert.equal(image.data[y * image.width * 4 + 3], 0);
        assert.equal(image.data[(y * image.width + image.width - 1) * 4 + 3], 0);
      }
      for (let x = 0; x < image.width; x++) {
        assert.equal(image.data[x * 4 + 3], 0);
        assert.equal(image.data[((image.height - 1) * image.width + x) * 4 + 3], 0);
      }
      assert.equal(frame.bounds.bottom, model.pivot.y + frame.bakedOffset.y);
    }
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages, model.frameCount); assert.equal(gif.pageHeight, model.frameHeight * 2);
    assert.deepEqual(gif.delay, model.frames.map(frame => frame.durationMs));
    assert.equal(gif.loop, model.loop ? 0 : 1);
  }
  assert.equal(total, 19);
});
test('recoveries and neutral starts use the identical idle pose, with a leftward attack and airborne hop', () => {
  const neutral = pose('idle', 0).data;
  for (const [motion, index] of [['move', 0], ['down', 0], ['hit', 2], ['attack', 3]]) {
    assert.deepEqual(pose(motion, index).data, neutral, `${motion} neutral continuity`);
  }
  assert.ok(read('attack').frames[1].bounds.left < idle.frames[0].bounds.left - 20);
  assert.equal(read('move').frames[2].bounds.bottom, idle.pivot.y - 8);
  const puddle = read('down').frames[3].bounds;
  assert.ok(puddle.bottom - puddle.top < 35);
});
test('enemy motion timings loop, recover, and hold death with complete idle cycles between actions', () => {
  for (const motion of ['idle', 'move', 'hit', 'down', 'attack']) {
    const model = read(motion), lead = model.transitions.idleLeadInMs;
    const end = lead + model.durationMs * (model.loop ? 2 : 1);
    assert.equal(sample(model, idle, model.durationMs - 1).frame, model.frameCount - 1);
    if (model.loop) assert.equal(sample(model, idle, model.durationMs).frame, 0);
    else if (model.terminal) {
      for (const bridge of [false, true]) {
        const result = sample(model, idle, 1000000, bridge);
        assert.equal(result.motion, 'down'); assert.equal(result.frame, 3); assert.equal(result.finished, true);
      }
    } else assert.equal(sample(model, idle, model.durationMs).motion, 'idle');
    if (motion !== 'idle') {
      assert.equal(sample(model, idle, lead - 1, true).phase, 'before');
      assert.equal(sample(model, idle, lead, true).frame, 0);
      assert.equal(sample(model, idle, end, true).phase, model.terminal ? 'hold' : 'after');
      for (const frame of model.frames) assert.equal(sample(model, idle, elapsedForFrame(model, frame.index, true), true).frame, frame.index);
    }
  }
});
test('playback supports additional motion ids and variable frame counts without a code-side list', () => {
  const extra = { ...read('attack'), motion: 'cast', frameCount: 2, frameSequence: [0, 1],
    frames: [{ durationMs: 90 }, { durationMs: 110 }], durationMs: 200 };
  assert.equal(sample(extra, idle, 150).motion, 'cast');
  assert.equal(sample(extra, idle, 150).frame, 1);
  assert.equal(sample(extra, idle, 200).motion, 'idle');
});
