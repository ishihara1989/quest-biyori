'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths, crypto = require('node:crypto');
const { bounds } = require('../tools/assets/build-treant.cjs');
const { sample } = require('../public/js/core/motion-playback.js');
const { visibleAt, viewport, stripsAt } = require('../development/labs/js/enemy-projectiles.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const assets = path.join(__dirname, '../public/assets'), root = path.join(assets, 'enemies/alraune-minion');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const png = file => PNG.sync.read(fs.readFileSync(file));
const motion = id => json(path.join(root, 'motions', id, 'manifest.json'));

test('20 transparent minion poses retain source RGBA, agree with sheet exports and preserve GIF timing', async () => {
  const enemy = json(path.join(assets, 'enemies/index.json')).find(e => e.id === 'alraune-minion');
  const entries = json(path.join(root, 'motions/index.json'));
  assert.deepEqual(entries.map(e => e.id), ['idle', 'move', 'hit', 'down', 'attack']);
  const sources = new Map(); let count = 0;
  for (const entry of entries) {
    const dir = path.join(root, 'motions', entry.id), model = motion(entry.id), sheet = png(path.join(dir, model.sheet));
    assert.equal(model.frameCount, 4); assert.deepEqual(model.pivot, enemy.viewport.pivot);
    assert.equal(sheet.width, model.width); assert.equal(sheet.height, model.height);
    assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    const hashes = new Set();
    for (const f of model.frames) {
      count++; const pose = png(path.join(dir, f.file));
      hashes.add(crypto.createHash('sha256').update(pose.data).digest('hex'));
      assert.deepEqual(bounds(pose, 32), f.bounds);
      assert.equal(f.bounds.bottom, model.pivot.y);
      const sourcePath = path.resolve(dir, f.source || model.source);
      if (!sources.has(sourcePath)) sources.set(sourcePath, png(sourcePath));
      const source = sources.get(sourcePath), scale = f.sourceScale ?? model.sourceScale;
      for (let y = 0; y < pose.height; y++) {
        assert.deepEqual(pose.data.subarray(y * pose.width * 4, (y + 1) * pose.width * 4),
          sheet.data.subarray((y * sheet.width + f.x) * 4, (y * sheet.width + f.x + pose.width) * 4));
        for (let x = 0; x < pose.width; x++) {
          const p = (y * pose.width + x) * 4, alpha = pose.data[p + 3];
          if (x === 0 || y === 0 || x === pose.width - 1 || y === pose.height - 1) assert.equal(alpha, 0);
          if (!alpha) continue;
          const sx = f.sourceCell.x + Math.round(f.sourceAnchor.x + (x - model.pivot.x) / scale);
          const sy = f.sourceCell.y + Math.round(f.sourceAnchor.y + (y - model.pivot.y) / scale);
          assert.ok(alpha >= model.alphaCutoff);
          assert.ok(pose.data.subarray(p, p + 4).equals(source.data.subarray((sy * source.width + sx) * 4, (sy * source.width + sx) * 4 + 4)));
        }
      }
    }
    assert.equal(hashes.size, 4, 'Four distinct poses');
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages, 4); assert.deepEqual(gif.delay, model.frames.map(f => f.durationMs));
    assert.equal(gif.loop, model.loop ? 0 : 1);
  }
  assert.equal(count, 20);
});

test('idle and movement loop, recoil and attack recover, defeat stays collapsed and one stream fires from the head', () => {
  const idle = motion('idle'), down = motion('down'), attack = motion('attack');
  for (const id of ['idle', 'move']) assert.equal(sample(motion(id), idle, motion(id).durationMs).frame, 0);
  for (const id of ['hit', 'attack']) {
    assert.equal(sample(motion(id), idle, motion(id).durationMs).motion, 'idle');
    assert.deepEqual(png(path.join(root, 'motions', id, motion(id).frames[3].file)).data,
      png(path.join(root, 'motions/idle', idle.frames[0].file)).data);
  }
  assert.equal(sample(down, idle, 1000000).frame, 3);
  assert.equal(sample(down, idle, 1000000).finished, true);
  assert.ok(down.frames[3].bounds.bottom - down.frames[3].bounds.top < (idle.frames[0].bounds.bottom - idle.frames[0].bounds.top) / 2);
  assert.deepEqual(visibleAt(attack, 199), []);
  assert.equal(visibleAt(attack, 200).length, 1);
  assert.equal(visibleAt(attack, 300)[0].x, -48);
  assert.equal(visibleAt(attack, 1000000).length, 0);
  const effectDir = path.join(assets, 'effects/alraune-seed-stream'), effect = json(path.join(effectDir, 'manifest.json'));
  assert.deepEqual(effect.projectileGroup.seedsPerStream, [8]);
  assert.equal(effect.projectileGroup.streams, 1);
  const stream = png(path.join(effectDir, effect.sheet));
  const boss = png(path.join(assets, 'effects/alraune-seed-volley/alraune-seed-volley.png'));
  for (let y = 0; y < 50; y++) assert.deepEqual(stream.data.subarray((y + 7) * 320 * 4, (y + 8) * 320 * 4), boss.data.subarray(y * 320 * 4, (y + 1) * 320 * 4));
  const view = viewport({ width: 320, height: 224, pivot: idle.pivot }, attack.projectilePreview);
  const strips = stripsAt(visibleAt(attack, 200)[0], attack, effect, view);
  assert.equal(strips.length, 1);
  assert.equal(strips[0].destination.y + attack.projectilePreview.streams[0].sourceCenterY, attack.events[0].origin.y);
  assert.equal(strips[0].clip.width, 240 + attack.events[0].origin.x);
  assert.equal(png(path.join(effectDir, effect.singleSeed.file)).width, 32);
  assert.equal(json(path.join(assets, 'effects/index.json')).filter(e => e.id === effect.effect).length, 1);
});
