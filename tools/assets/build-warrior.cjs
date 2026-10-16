'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Packaging only: register each generated frame by its soles, then sample with
// nearest neighbor. No redraw, recoloring, interpolation, or alpha replacement.
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const assert = require('node:assert/strict');
const runtimeModules = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', {
  paths: [__dirname, process.env.NODE_PATH, runtimeModules].filter(Boolean),
}));
const directory = path.join(__dirname, '../../public/assets/warrior');
const sourceName = 'source/warrior-idle-generated-v1.png';
const source = PNG.sync.read(fs.readFileSync(path.join(directory, sourceName)));
assert.equal(source.width % 2, 0);
assert.equal(source.height % 2, 0);
const sourceWidth = source.width / 2, sourceHeight = source.height / 2;
const cell = 160, samplingStep = 4;
const pivot = { x: 76, y: 151 };
const sheet = new PNG({ width: cell * 4, height: cell });
const frames = [];
for (let frame = 0; frame < 4; frame++) {
  const originX = frame % 2 * sourceWidth, originY = Math.floor(frame / 2) * sourceHeight;
  const alphaAt = (x, y) => source.data[((originY + y) * source.width + originX + x) * 4 + 3];
  const bounds = { left: sourceWidth, top: sourceHeight, right: -1, bottom: -1 };
  for (let y = 0; y < sourceHeight; y++) for (let x = 0; x < sourceWidth; x++) {
    if (alphaAt(x, y) < 128) continue;
    bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
    bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y);
  }
  assert.ok(bounds.right > bounds.left, 'Every frame has a character');
  let footLeft = sourceWidth, footRight = -1;
  for (let y = bounds.bottom - 35; y <= bounds.bottom; y++) for (let x = 0; x < sourceWidth; x++) {
    if (alphaAt(x, y) < 128) continue;
    footLeft = Math.min(footLeft, x); footRight = Math.max(footRight, x);
  }
  const anchor = { x: Math.round((footLeft + footRight) / 2), y: bounds.bottom };
  const sprite = new PNG({ width: cell, height: cell });
  for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
    const sx = anchor.x + (x - pivot.x) * samplingStep;
    const sy = anchor.y + (y - pivot.y) * samplingStep;
    if (sx < 0 || sy < 0 || sx >= sourceWidth || sy >= sourceHeight) continue;
    const offset = ((originY + sy) * source.width + originX + sx) * 4;
    const pixel = source.data.subarray(offset, offset + 4);
    sprite.data.set(pixel, (y * cell + x) * 4);
    sheet.data.set(pixel, (y * sheet.width + frame * cell + x) * 4);
  }
  let transparent = 0, visible = 0, ground = -1;
  for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
    const alpha = sprite.data[(y * cell + x) * 4 + 3];
    if (alpha === 0) transparent++;
    if (alpha >= 128) { visible++; ground = Math.max(ground, y); }
    if (x === 0 || x === cell - 1 || y === 0 || y === cell - 1) {
      assert.ok(alpha < 128, `Frame ${frame + 1} has room around the silhouette`);
    }
  }
  assert.ok(transparent > cell * cell * .4, 'Real transparent background');
  assert.ok(visible > 5000, 'Character survives downsampling');
  assert.equal(ground, pivot.y, 'All frames share the same ground pixel');
  const name = `idle-${String(frame + 1).padStart(2, '0')}.png`;
  fs.writeFileSync(path.join(directory, name), PNG.sync.write(sprite));
  frames.push({ index: frame, file: name, x: frame * cell, y: 0,
    width: cell, height: cell, durationMs: 400, sourceAnchor: anchor,
    sourceBounds: bounds, visiblePixels: visible, transparentPixels: transparent });
}
for (let frame = 1; frame < 4; frame++) {
  assert.notDeepEqual(PNG.sync.read(fs.readFileSync(path.join(directory, frames[0].file))).data,
    PNG.sync.read(fs.readFileSync(path.join(directory, frames[frame].file))).data,
    'Four distinct frames, not one image moved by CSS');
}
fs.writeFileSync(path.join(directory, 'warrior-idle.png'), PNG.sync.write(sheet));
const manifest = {
  version: 1, character: 'warrior', label: '戦士', motion: 'idle', facing: 'right',
  sheet: 'warrior-idle.png', width: 640, height: 160, columns: 4, rows: 1,
  frameWidth: cell, frameHeight: cell, frameCount: 4, frameSequence: [0, 1, 2, 3],
  durationMs: 1600, pivot, sampling: 'nearest-neighbor', source: sourceName,
  sourceWidth: source.width, sourceHeight: source.height, sourceGrid: [2, 2],
  generation: 'built-in image_gen; prompt in PROMPT.md',
  notes: 'Generated pixels and alpha preserved. Integer translation aligns feet; one shared 1/4 scale. Minor generated contour variation remains.',
  frames,
};
writeAssetJson(path.join(directory, 'manifest.json'), manifest);
console.log(JSON.stringify({ sheet: '640 × 160 RGBA', frames: '4 × 160 × 160',
  cycleMs: manifest.durationMs, groundY: pivot.y, checks: 'alpha, margins, distinct frames, shared ground: passed' }, null, 2));
