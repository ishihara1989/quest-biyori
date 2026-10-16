'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths, crypto = require('node:crypto');
const { sample } = require('../public/js/core/motion-playback.js');
const { bounds } = require('../tools/assets/build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../public/assets'), enemyRoot = path.join(root, 'enemies/alraune');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const png = file => PNG.sync.read(fs.readFileSync(file));
const motion = id => json(path.join(enemyRoot, 'motions', id, 'manifest.json'));
const pose = (id, index) => png(path.join(enemyRoot, 'motions', id, motion(id).frames[index].file));

test('all 24 boss frames and one volley preserve source RGBA, transparent margins, sheet packing and GIF timing', async () => {
  const enemy = json(path.join(root, 'enemies/index.json')).find(item => item.id === 'alraune');
  assert.ok(enemy);
  const entries = json(path.join(enemyRoot, 'motions/index.json'));
  assert.deepEqual(entries.map(e => e.id), ['idle', 'move', 'hit', 'down', 'vine-slam', 'seed-burst']);
  const dirs = entries.map(e => path.join(enemyRoot, 'motions', e.id));
  dirs.push(path.join(root, 'effects/alraune-seed-volley'));
  let count = 0;
  for (const dir of dirs) {
    const model = json(path.join(dir, 'manifest.json')), sheet = png(path.join(dir, model.sheet));
    assert.equal(sheet.width, model.width); assert.equal(sheet.height, model.height);
    assert.equal(model.frameCount, model.enemy ? 4 : 1);
    assert.equal(model.facing, 'left');
    assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    if (model.enemy) assert.deepEqual(model.pivot, enemy.viewport.pivot);
    const hashes = new Set(), sources = new Map();
    for (const f of model.frames) {
      const image = png(path.join(dir, f.file)); count++;
      assert.equal(image.width, model.frameWidth); assert.equal(image.height, model.frameHeight);
      assert.deepEqual(bounds(image, 32), f.bounds);
      hashes.add(crypto.createHash('sha256').update(image.data).digest('hex'));
      const sourcePath = path.resolve(dir, f.source || model.source);
      if (!sources.has(sourcePath)) sources.set(sourcePath, png(sourcePath));
      const source = sources.get(sourcePath), scale = f.sourceScale ?? model.sourceScale;
      for (let y = 0; y < image.height; y++) {
        assert.deepEqual(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4),
          sheet.data.subarray((y * sheet.width + f.x) * 4, (y * sheet.width + f.x + image.width) * 4));
        for (let x = 0; x < image.width; x++) {
          const p = (y * image.width + x) * 4, alpha = image.data[p + 3];
          if (x === 0 || y === 0 || x === image.width - 1 || y === image.height - 1) assert.equal(alpha, 0);
          if (!alpha) continue;
          assert.ok(alpha >= model.alphaCutoff);
          const sx = f.sourceCell.x + Math.round(f.sourceAnchor.x + (x - model.pivot.x - f.bakedOffset.x) / scale);
          const sy = f.sourceCell.y + Math.round(f.sourceAnchor.y + (y - model.pivot.y - f.bakedOffset.y) / scale);
          const sp = (sy * source.width + sx) * 4;
          assert.ok(image.data.subarray(p, p + 4).equals(source.data.subarray(sp, sp + 4)), 'Export retains original RGBA');
        }
      }
    }
    assert.equal(hashes.size, model.frameCount, 'Distinct animation poses');
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages || 1, model.frameCount);
    assert.equal(gif.pageHeight || gif.height, model.frameHeight * 2);
    assert.deepEqual(gif.delay, model.frames.map(f => f.durationMs));
    assert.equal(gif.loop, model.loop ? 0 : 1);
  }
  assert.equal(count, 25);
});

test('looping fire repeats events, recoveries share idle, death holds, and the whip keeps translucent trails', () => {
  const idle = motion('idle');
  for (const id of ['idle', 'move', 'seed-burst']) {
    const model = motion(id);
    assert.equal(model.loop, true);
    assert.equal(sample(model, idle, model.durationMs - 1).frame, 3);
    assert.equal(sample(model, idle, model.durationMs).frame, 0);
    for (const f of model.frames) assert.ok(Math.abs(f.bounds.bottom - model.pivot.y) <= 1);
  }
  for (const id of ['hit', 'vine-slam']) {
    assert.equal(sample(motion(id), idle, motion(id).durationMs).motion, 'idle');
    assert.deepEqual(pose(id, 3).data, pose('idle', 0).data);
  }
  const down = motion('down'), result = sample(down, idle, 1000000);
  assert.equal(result.motion, 'down'); assert.equal(result.frame, 3); assert.equal(result.finished, true);
  assert.ok(down.frames[3].bounds.bottom - down.frames[3].bounds.top < (idle.frames[0].bounds.bottom - idle.frames[0].bounds.top) / 2);
  const slam = motion('vine-slam');
  assert.ok(slam.frames[2].bounds.left < idle.frames[0].bounds.left - 100);
  for (const index of [1, 2]) {
    const image = pose('vine-slam', index); let translucent = 0;
    for (let p = 3; p < image.data.length; p += 4) if (image.data[p] >= 64 && image.data[p] < 128) translucent++;
    assert.ok(translucent > 1000, 'The two translucent whip arcs survive PNG export');
  }
  const fire = motion('seed-burst');
  assert.equal(fire.durationMs, 400);
  assert.deepEqual(fire.events.map(e => e.timeMs), [0, 200]);
  for (const model of [fire, slam]) for (const e of model.events) {
    assert.equal(e.timeMs, model.frames.slice(0, e.frame).reduce((sum, f) => sum + f.durationMs, 0));
  }
});

test('the separate volley really contains 25 disconnected seeds and remains registered in the effect catalog', () => {
  const dir = path.join(root, 'effects/alraune-seed-volley'), model = json(path.join(dir, 'manifest.json'));
  assert.deepEqual(model.projectileGroup.seedsPerStream, [8, 9, 8]);
  assert.equal(model.projectileGroup.seedCount, 25);
  assert.deepEqual(model.projectileGroup.direction, { x: -1, y: 0 });
  const image = png(path.join(dir, model.sheet)), seen = new Uint8Array(image.width * image.height);
  let seeds = 0;
  for (let p = 0; p < seen.length; p++) {
    if (seen[p] || image.data[p * 4 + 3] < 192) continue;
    const queue = [p]; seen[p] = 1; let area = 0;
    while (queue.length) {
      const k = queue.pop(), x = k % image.width, y = Math.floor(k / image.width); area++;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= image.width || ny >= image.height) continue;
        const n = ny * image.width + nx;
        if (!seen[n] && image.data[n * 4 + 3] >= 192) { seen[n] = 1; queue.push(n); }
      }
    }
    if (area > 30) seeds++;
  }
  assert.equal(seeds, 25);
  const ids = json(path.join(root, 'effects/index.json')).map(e => e.id);
  assert.equal(ids.filter(id => id === 'alraune-seed-volley').length, 1);
  for (const id of ['fruit-bomb', 'explosion', 'root-eruption']) assert.ok(ids.includes(id));
});
