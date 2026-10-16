'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths, crypto = require('node:crypto');
const { sample } = require('../public/js/core/motion-playback.js');
const { visibleAt } = require('../development/labs/js/enemy-summons.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../public/assets/enemies/boss-slime');
const read = id => JSON.parse(fs.readFileSync(path.join(root, 'motions', id, 'manifest.json'), 'utf8'));
const pose = (id, i) => PNG.sync.read(fs.readFileSync(path.join(root, 'motions', id, read(id).frames[i].file)));
function components(image) {
  const visited = new Uint8Array(image.width * image.height), result = [];
  for (let p = 0; p < visited.length; p++) {
    if (visited[p] || image.data[p * 4 + 3] < 192) continue;
    const queue = [p]; visited[p] = 1;
    let left = image.width, right = -1, top = image.height, bottom = -1;
    for (let i = 0; i < queue.length; i++) {
      const x = queue[i] % image.width, y = Math.floor(queue[i] / image.width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= image.width || ny < 0 || ny >= image.height) continue;
        const next = ny * image.width + nx;
        if (!visited[next] && image.data[next * 4 + 3] >= 192) { visited[next] = 1; queue.push(next); }
      }
    }
    if (queue.length > 32) result.push({ area: queue.length, left, right, top, bottom });
  }
  return result.sort((a, b) => b.area - a.area);
}
test('all six motions contain four distinct unclipped RGBA poses, matching sheets, GIFs and provenance', async () => {
  const definitions = JSON.parse(fs.readFileSync(path.join(root, 'motions/index.json'), 'utf8'));
  assert.deepEqual(definitions.map(def => def.id), ['idle', 'move', 'hit', 'attack', 'down', 'split']);
  for (const { id } of definitions) {
    const model = read(id), dir = path.join(root, 'motions', id);
    const sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
    assert.equal(model.frameCount, 4); assert.equal(model.frames.length, 4);
    assert.equal(sheet.width, model.frameWidth * 4); assert.equal(sheet.height, model.frameHeight);
    assert.deepEqual(model.pivot, read('idle').pivot); assert.equal(model.facing, 'left');
    assert.ok(fs.existsSync(path.resolve(dir, model.source))); assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    const hashes = new Set();
    for (const frame of model.frames) {
      const image = pose(id, frame.index);
      assert.equal(image.width, model.frameWidth); assert.equal(image.height, model.frameHeight);
      hashes.add(crypto.createHash('sha256').update(image.data).digest('hex'));
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
      for (let i = 3; i < image.data.length; i += 4) assert.ok(image.data[i] === 0 || image.data[i] >= 192);
    }
    assert.equal(hashes.size, 4);
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages, 4); assert.equal(gif.pageHeight, model.frameHeight * 2);
    assert.deepEqual(gif.delay, model.frames.map(frame => frame.durationMs)); assert.equal(gif.loop, model.loop ? 0 : 1);
  }
});
test('idle, movement and splitting loop; hit and attack recover; defeat holds a low puddle', () => {
  const idle = read('idle');
  for (const id of ['idle', 'move', 'split']) {
    const model = read(id);
    assert.equal(sample(model, idle, model.durationMs - 1).frame, 3);
    assert.equal(sample(model, idle, model.durationMs).frame, 0);
  }
  for (const id of ['hit', 'attack']) {
    assert.equal(sample(read(id), idle, read(id).durationMs).motion, 'idle');
    assert.deepEqual(pose(id, 3).data, pose('idle', 0).data);
  }
  assert.deepEqual(pose('move', 0).data, pose('idle', 0).data);
  assert.ok(read('move').frames[2].bounds.bottom < idle.pivot.y);
  assert.equal(sample(read('down'), idle, 1000000).motion, 'down');
  assert.equal(sample(read('down'), idle, 1000000).frame, 3);
  assert.ok(read('down').frames[3].bounds.bottom - read('down').frames[3].bounds.top < (idle.frames[0].bounds.bottom - idle.frames[0].bounds.top) * .4);
});
test('bud stays attached in frames 1–3 and tears in frame 4 without halving the parent', () => {
  for (let i = 0; i < 3; i++) assert.equal(components(pose('split', i)).length, 1, `Frame ${i + 1} must remain attached`);
  const [parent, bud, ...other] = components(pose('split', 3));
  assert.ok(parent && bud); assert.equal(other.length, 0);
  assert.ok(bud.right < parent.left - 3, 'Visible transparent gap at tear');
  assert.ok(bud.right - bud.left < (parent.right - parent.left) * .5);
  const neutral = read('idle').frames[0].bounds;
  assert.ok(Math.abs((parent.right - parent.left) - (neutral.right - neutral.left)) < 25, 'Parent retains full boss size');
});
test('one normal slime appears after frame 4 each cycle; seeking and bridge playback preserve timing', () => {
  const model = read('split'), event = model.events.find(item => item.name === 'spawn-slime');
  assert.equal(event.timeMs, model.durationMs); assert.equal(event.boundary, 'end'); assert.equal(event.frame, 3);
  assert.equal(visibleAt(model, model.durationMs - 1).length, 0);
  assert.equal(visibleAt(model, model.durationMs)[0].ageMs, 0);
  const entities = visibleAt(model, model.durationMs * 2);
  assert.equal(entities.filter(entity => entity.ageMs === 0).length, 1);
  assert.equal(entities.at(-1).cycle, 1); assert.equal(entities.at(-1).enemy, 'slime');
  assert.deepEqual(visibleAt(model, model.durationMs * 2), entities, 'A paused frame cannot add entities');
  const lead = model.transitions.idleLeadInMs;
  assert.equal(visibleAt(model, lead + model.durationMs - 1, true).length, 0);
  assert.equal(visibleAt(model, lead + model.durationMs, true)[0].ageMs, 0);
  assert.equal(visibleAt(model, lead + model.durationMs * 2, true).at(-1).cycle, 1);
  assert.ok(visibleAt(model, 1000000).every(entity => entity.ageMs < model.summonPreview.lifetimeMs));
});
