'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const { sample } = require('../public/js/core/motion-playback.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../public/assets/enemies/boar/motions');
const read = id => JSON.parse(fs.readFileSync(path.join(root, id, 'manifest.json'), 'utf8'));
const pose = (id, index) => PNG.sync.read(fs.readFileSync(path.join(root, id, read(id).frames[index].file)));
const idle = read('idle'), counts = { idle: 4, move: 6, attack: 4, hit: 4, down: 4 };

test('22 boar frames export complete transparent PNGs, matching sheets, GIF timings and source records', async () => {
  let total = 0;
  const entries = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
  assert.deepEqual(entries.map(entry => entry.id).sort(), Object.keys(counts).sort());
  for (const [id, count] of Object.entries(counts)) {
    const model = read(id), dir = path.join(root, id);
    assert.equal(model.frameCount, count); assert.equal(model.frames.length, count);
    assert.equal(model.facing, 'left'); assert.deepEqual(model.pivot, { x: 160, y: 207 });
    assert.deepEqual(model.frameSequence, Array.from({ length: count }, (_, index) => index));
    assert.equal(model.frameWidth, 320); assert.equal(model.frameHeight, 224);
    assert.equal(model.durationMs, model.frames.reduce((sum, frame) => sum + frame.durationMs, 0));
    assert.ok(fs.existsSync(path.resolve(dir, model.source)));
    assert.ok(fs.existsSync(path.resolve(dir, model.prompt)));
    const sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
    assert.equal(sheet.width, 320 * count); assert.equal(sheet.height, 224);
    for (const frame of model.frames) {
      const image = pose(id, frame.index); total++;
      assert.equal(image.width, 320); assert.equal(image.height, 224);
      assert.ok(frame.bounds.left > 0 && frame.bounds.top > 0 && frame.bounds.right < 319 && frame.bounds.bottom < 223);
      for (let y = 0; y < 224; y++) {
        assert.equal(image.data[y * 320 * 4 + 3], 0);
        assert.equal(image.data[(y * 320 + 319) * 4 + 3], 0);
        assert.deepEqual(image.data.subarray(y * 320 * 4, (y + 1) * 320 * 4),
          sheet.data.subarray((y * sheet.width + frame.x) * 4, (y * sheet.width + frame.x + 320) * 4));
      }
      for (let x = 0; x < 320; x++) {
        assert.equal(image.data[x * 4 + 3], 0); assert.equal(image.data[(223 * 320 + x) * 4 + 3], 0);
      }
      for (let pos = 3; pos < image.data.length; pos += 4) assert.ok(image.data[pos] === 0 || image.data[pos] >= 192);
    }
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages, count); assert.equal(gif.pageHeight, 448);
    assert.deepEqual(gif.delay, model.frames.map(frame => frame.durationMs));
    assert.equal(gif.loop, model.loop ? 0 : 1);
  }
  assert.equal(total, 22);
});

test('idle continuity is exact, move and charge repeat, hit recovers, and defeat holds frame four', () => {
  assert.deepEqual(pose('move', 0).data, pose('idle', 0).data);
  assert.deepEqual(pose('hit', 3).data, pose('idle', 0).data);
  for (const id of ['move', 'attack']) {
    const model = read(id);
    assert.equal(model.loop, true);
    assert.equal(sample(model, idle, model.durationMs - 1).frame, counts[id] - 1);
    assert.equal(sample(model, idle, model.durationMs).frame, 0);
    assert.equal(sample(model, idle, model.durationMs * 100 + 1).motion, id);
  }
  assert.equal(read('hit').loop, false);
  assert.equal(sample(read('hit'), idle, read('hit').durationMs).motion, 'idle');
  const down = read('down');
  for (const bridge of [false, true]) {
    const end = sample(down, idle, 1000000, bridge);
    assert.equal(end.motion, 'down'); assert.equal(end.frame, 3); assert.equal(end.finished, true);
  }
  assert.ok(down.frames[3].bounds.top - down.frames[0].bounds.top > 40, 'visible downward collapse');
  const attack = read('attack');
  assert.ok(attack.frames[1].bounds.bottom <= idle.pivot.y - 20, 'extended legs remain clearly airborne in charge frame two');
  assert.ok(attack.frames[1].bounds.top < attack.frames[0].bounds.top, 'upper body rises during the jump');
  assert.equal(attack.frames[2].bounds.bottom, idle.pivot.y, 'front feet land in charge frame three');
  assert.equal(attack.frames[3].bounds.bottom, idle.pivot.y, 'all feet land in charge frame four');
  assert.ok(attack.frames[3].bounds.top > attack.frames[2].bounds.top + 10, 'charge ends in a visible crouch');
});

function furTone(image) {
  const values = [];
  for (let pos = 0; pos < image.data.length; pos += 4) {
    const [r, g, b, a] = image.data.subarray(pos, pos + 4);
    if (a >= 240 && r >= g * 1.2 && g >= b * 1.25 && g >= 36) values.push(.2126 * r + .7152 * g + .0722 * b);
  }
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}
test('the six walk frames do not brighten away from the idle fur tone', () => {
  const reference = furTone(pose('idle', 0));
  // Median depends on how much shaded thigh/belly is exposed in each pose.
  // Allow 5/255 luminance variation; the earlier uncorrected walk drifted 10–15.
  const tolerance = 5;
  for (let index = 0; index < 6; index++) {
    assert.ok(Math.abs(furTone(pose('move', index)) - reference) <= tolerance, `walk frame ${index + 1} fur brightness drift`);
  }
  for (const id of ['attack', 'down']) for (let index = 0; index < 4; index++) {
    assert.ok(Math.abs(furTone(pose(id, index)) - reference) <= tolerance, `${id} frame ${index + 1} palette drift`);
  }
});
