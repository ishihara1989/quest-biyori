'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths, crypto = require('node:crypto');
const { sample } = require('../public/js/core/motion-playback.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../public/assets/enemies/boss-boar');
const counts = { idle: 4, move: 6, 'charge-windup': 4, attack: 4, hit: 4, down: 4 };
const read = id => JSON.parse(fs.readFileSync(path.join(root, 'motions', id, 'manifest.json'), 'utf8'));
const pose = (id, index) => PNG.sync.read(fs.readFileSync(path.join(root, 'motions', id, read(id).frames[index].file)));
const idle = read('idle');

test('boss boar is registered with 26 transparent distinct frames, matching PNG sheets, GIF timings and sources', async () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, '../index.json'), 'utf8'));
  const entry = catalog.find(item => item.id === 'boss-boar');
  assert.ok(entry); assert.deepEqual(entry.viewport, { width: 480, height: 320, pivot: { x: 240, y: 303 } });
  assert.ok(fs.existsSync(path.join(root, entry.thumbnail)));
  const definitions = JSON.parse(fs.readFileSync(path.join(root, 'motions/index.json'), 'utf8'));
  assert.deepEqual(definitions.map(def => def.id), Object.keys(counts));
  let total = 0;
  for (const [id, count] of Object.entries(counts)) {
    const model = read(id), dir = path.join(root, 'motions', id), hashes = new Set();
    assert.equal(model.enemy, 'boss-boar'); assert.equal(model.facing, 'left');
    assert.equal(model.frameCount, count); assert.equal(model.frames.length, count);
    assert.deepEqual(model.pivot, idle.pivot);
    assert.equal(model.durationMs, model.frames.reduce((sum, frame) => sum + frame.durationMs, 0));
    assert.ok(fs.existsSync(path.resolve(dir, model.source)));
    assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    const sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
    assert.equal(sheet.width, 480 * count); assert.equal(sheet.height, 320);
    for (const frame of model.frames) {
      const image = pose(id, frame.index); total++;
      assert.equal(image.width, 480); assert.equal(image.height, 320);
      assert.ok(frame.bounds.left > 1 && frame.bounds.top > 1 && frame.bounds.right < 478 && frame.bounds.bottom < 318);
      const hash = crypto.createHash('sha256').update(image.data).digest('hex');
      assert.ok(!hashes.has(hash), `${id} repeats a pose`); hashes.add(hash);
      for (let y = 0; y < 320; y++) {
        assert.deepEqual(image.data.subarray(y * 480 * 4, (y + 1) * 480 * 4),
          sheet.data.subarray((y * sheet.width + frame.x) * 4, (y * sheet.width + frame.x + 480) * 4));
        assert.equal(image.data[y * 480 * 4 + 3], 0);
        assert.equal(image.data[(y * 480 + 479) * 4 + 3], 0);
      }
      for (let x = 0; x < 480; x++) {
        assert.equal(image.data[x * 4 + 3], 0);
        assert.equal(image.data[(319 * 480 + x) * 4 + 3], 0);
      }
      for (let p = 3; p < image.data.length; p += 4) assert.ok(image.data[p] === 0 || image.data[p] >= 192);
    }
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages, count); assert.equal(gif.pageHeight, 640);
    assert.deepEqual(gif.delay, model.frames.map(frame => frame.durationMs));
    assert.equal(gif.loop, model.loop ? 0 : 1);
  }
  assert.equal(total, 26);
});

test('walk exports two three-frame halves with matching pixels and separate generated sources', () => {
  const model = read('move'), dir = path.join(root, 'motions/move');
  assert.equal(model.generationSources.length, 2);
  assert.equal(model.poseRefinementSources.length, 3);
  for (const source of [...model.generationSources, ...model.poseRefinementSources, model.registration]) {
    assert.ok(fs.existsSync(path.resolve(dir, source)));
  }
  assert.deepEqual(model.halves.map(half => half.firstFrame), [0, 3]);
  const sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
  for (const half of model.halves) {
    const image = PNG.sync.read(fs.readFileSync(path.join(dir, half.file)));
    assert.equal(half.frameCount, 3); assert.equal(image.width, 1440); assert.equal(image.height, 320);
    for (let y = 0; y < 320; y++) assert.deepEqual(image.data.subarray(y * 1440 * 4, (y + 1) * 1440 * 4),
      sheet.data.subarray((y * sheet.width + half.firstFrame * 480) * 4,
        (y * sheet.width + half.firstFrame * 480 + 1440) * 4));
  }
  const recipes = JSON.parse(fs.readFileSync(path.join(root, 'source/boss-boar-move-registration-v1.json'), 'utf8'));
  assert.equal(recipes.length, 6);
  assert.ok(recipes[1].source.includes('frame2-generated'));
  assert.equal(recipes[2].source, 'source/boss-boar-move-frame3-generated-v2.png');
  assert.equal(recipes[3].source, 'source/boss-boar-move-frame4-generated-v2.png');
  assert.ok(recipes.slice(4).every(record => record.source.includes('04-06-generated')));
  assert.equal(model.durationMs, 720);
  assert.equal(sample(model, idle, 719).frame, 5);
  assert.equal(sample(model, idle, 720).frame, 0);
});

test('four-frame windup crouches and loops on the spot independently of the charge release', () => {
  const model = read('charge-windup');
  assert.equal(model.durationMs, 800); assert.equal(model.loop, true); assert.equal(model.terminal, false);
  assert.equal(model.chargeTelegraph.nextMotion, 'attack');
  assert.equal(model.chargeTelegraph.rangeOverlay, 'external-ground-layer');
  assert.equal(model.chargeTelegraph.pawingFoot, 'left-hind');
  assert.deepEqual(model.chargeTelegraph.supportFeet, ['left-front', 'right-front', 'right-hind']);
  assert.equal(sample(model, idle, 799).frame, 3);
  assert.equal(sample(model, idle, 800).frame, 0);
  assert.equal(sample(model, idle, 80000).motion, 'charge-windup');
  // The head stays down and the silhouette never translates forward during warning.
  for (const frame of model.frames) {
    assert.ok(frame.bounds.top > idle.frames[0].bounds.top + 30, 'visible crouch');
    assert.ok(Math.abs(frame.bounds.left - idle.frames[0].bounds.left) <= 4, 'head stays in place');
    assert.equal(frame.bounds.bottom, model.pivot.y);
  }
  const footRegion = index => {
    const image = pose('charge-windup', index), pixels = [];
    for (let y = 257; y <= 303; y++) for (let x = 360; x < 465; x++) {
      const p = (y * 480 + x) * 4; pixels.push(...image.data.subarray(p, p + 4));
    }
    return crypto.createHash('sha256').update(Buffer.from(pixels)).digest('hex');
  };
  assert.equal(new Set([0, 1, 2, 3].map(footRegion)).size, 4, 'four different hind-foot positions');
});

test('move and hit join the identical idle pose; charge bounds repeat and defeat holds the last pose', () => {
  assert.deepEqual(pose('move', 0).data, pose('idle', 0).data);
  assert.deepEqual(pose('hit', 3).data, pose('idle', 0).data);
  for (const id of ['move', 'attack']) {
    const model = read(id);
    assert.equal(sample(model, idle, model.durationMs).frame, 0);
    assert.equal(sample(model, idle, model.durationMs * 100).motion, id);
  }
  assert.equal(sample(read('hit'), idle, read('hit').durationMs).motion, 'idle');
  const attack = read('attack');
  assert.ok(attack.frames[1].bounds.bottom <= idle.pivot.y - 30, 'all feet airborne');
  assert.equal(attack.frames[2].bounds.bottom, idle.pivot.y);
  assert.equal(attack.frames[3].bounds.bottom, idle.pivot.y);
  const down = read('down');
  assert.ok(down.frames[3].bounds.top > down.frames[0].bounds.top + 75, 'body collapses sideways');
  for (const bridge of [false, true]) {
    const result = sample(down, idle, 1000000, bridge);
    assert.equal(result.frame, 3); assert.equal(result.motion, 'down'); assert.equal(result.finished, true);
  }
  const normal = JSON.parse(fs.readFileSync(path.join(root, '../boar/motions/idle/manifest.json'), 'utf8'));
  const width = frame => frame.bounds.right - frame.bounds.left + 1;
  assert.ok(width(idle.frames[0]) > width(normal.frames[0]) * 1.5, 'clearly larger than normal boar');
});
