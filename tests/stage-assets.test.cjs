'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const { visibleTiles } = require('../development/labs/js/stage-tiling.js');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, process.env.NODE_PATH, bundled].filter(Boolean) }));
const root = path.join(__dirname, '../public/assets/stages/starting-forest');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('mirror repetition covers positive and negative cameras without gaps', () => {
  for (const offset of [-4096, -1024.25, -1024, -0.25, 0, 0.25, 1023.75, 1024, 2048, 4096.25]) {
    const tiles = visibleTiles(offset, 1024, 1600);
    assert.ok(tiles[0].x <= 0 && tiles[0].x > -1024);
    assert.ok(tiles.at(-1).x < 1600 && tiles.at(-1).x + 1024 >= 1600);
    for (let i = 1; i < tiles.length; i++) {
      assert.equal(tiles[i - 1].x + 1024, tiles[i].x);
      assert.notEqual(tiles[i - 1].mirror, tiles[i].mirror);
    }
    const nextPeriod = visibleTiles(offset + 2048, 1024, 1600);
    assert.deepEqual(nextPeriod.map(({ x, mirror }) => ({ x, mirror })), tiles.map(({ x, mirror }) => ({ x, mirror })));
  }
  assert.ok(visibleTiles(500, 1024, 1600, false).every(tile => !tile.mirror));
  assert.throws(() => visibleTiles(Infinity, 1024, 1024), RangeError);
  assert.throws(() => visibleTiles(0, 0, 1024), RangeError);
});

test('saved layers preserve the generated PNGs and both mirrored joins match RGBA', () => {
  assert.equal(manifest.repeat.mode, 'alternate-mirror');
  assert.equal(manifest.repeat.tilesPerPeriod, 2);
  for (const layer of manifest.layers) {
    const data = fs.readFileSync(path.join(root, layer.file));
    assert.deepEqual(data, fs.readFileSync(path.join(root, layer.source)), 'Original pixels must remain unchanged');
    const png = PNG.sync.read(data);
    assert.equal(png.width, layer.width); assert.equal(png.height, layer.height);
    const pairs = visibleTiles(100, 1024, 3072);
    for (let i = 1; i < pairs.length; i++) {
      const leftColumn = pairs[i - 1].mirror ? 0 : png.width - 1;
      const rightColumn = pairs[i].mirror ? png.width - 1 : 0;
      for (let y = 0; y < png.height; y++) {
        const left = (y * png.width + leftColumn) * 4, right = (y * png.width + rightColumn) * 4;
        assert.deepEqual(png.data.subarray(left, left + 4), png.data.subarray(right, right + 4));
      }
    }
    if (!layer.alpha) {
      for (let i = 3; i < png.data.length; i += 4) assert.equal(png.data[i], 255);
    } else {
      assert.ok(png.data.some((value, index) => index % 4 === 3 && value === 0), 'Near trees need transparent gaps');
      const minY = Math.ceil(manifest.coordinateSystem.groundY.min * png.height / manifest.coordinateSystem.previewHeight);
      const maxY = Math.floor(manifest.coordinateSystem.groundY.max * png.height / manifest.coordinateSystem.previewHeight);
      for (let y = minY; y <= maxY; y++) for (let x = 0; x < png.width; x++) {
        assert.ok(png.data[(y * png.width + x) * 4 + 3] >= 245, 'Playable dirt must not have transparent holes');
      }
    }
  }
});
