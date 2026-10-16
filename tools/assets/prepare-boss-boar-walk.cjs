'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Crop and register generated poses. Never synthesize, mirror or redraw legs.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { bounds } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boss-boar');

function prepareWalk(recipe) {
  const spec = recipe.walkRegistration;
  const frames = [], records = [];
  for (const def of spec.frames) {
    const original = PNG.sync.read(fs.readFileSync(path.join(root, def.source)));
    const rect = def.cell || { x: 0, y: 0, width: original.width, height: original.height };
    const cell = new PNG({ width: rect.width, height: rect.height });
    for (let y = 0; y < cell.height; y++) cell.data.set(original.data.subarray(
      ((y + rect.y) * original.width + rect.x) * 4,
      ((y + rect.y) * original.width + rect.x + rect.width) * 4), y * cell.width * 4);
    const b = bounds(cell), sourceAnchor = { x: Math.round((b.left + b.right) / 2), y: b.bottom };
    assert.ok(b.left > 1 && b.top > 1 && b.right < cell.width - 2 && b.bottom < cell.height - 2, 'Clipped generated walk pose');
    const scale = spec.spriteWidth / (b.right - b.left + 1);
    const output = new PNG({ width: spec.cellWidth, height: spec.cellHeight });
    for (let y = 0; y < output.height; y++) for (let x = 0; x < output.width; x++) {
      const sx = Math.round(sourceAnchor.x + (x - spec.pivot.x) / scale);
      const sy = Math.round(sourceAnchor.y + (y - spec.pivot.y) / scale);
      if (sx < b.left - 2 || sx > b.right + 2 || sy < b.top - 2 || sy > b.bottom + 2 ||
          sx < 0 || sy < 0 || sx >= cell.width || sy >= cell.height) continue;
      const p = (sy * cell.width + sx) * 4;
      output.data.set(cell.data.subarray(p, p + 4), (y * output.width + x) * 4);
    }
    const ob = bounds(output);
    assert.ok(ob.left > 1 && ob.top > 1 && ob.right < output.width - 2 && ob.bottom < output.height - 2, 'Clipped registered pose');
    frames.push(output);
    records.push({ source: def.source, sourceCell: rect, sourceAnchor, scale, targetAnchor: spec.pivot });
  }
  const combined = new PNG({ width: spec.cellWidth * 3, height: spec.cellHeight * 2 });
  for (const start of [0, 3]) {
    const half = new PNG({ width: spec.cellWidth * 3, height: spec.cellHeight });
    for (let i = 0; i < 3; i++) for (let y = 0; y < spec.cellHeight; y++) {
      half.data.set(frames[start + i].data.subarray(y * spec.cellWidth * 4, (y + 1) * spec.cellWidth * 4),
        (y * half.width + i * spec.cellWidth) * 4);
    }
    fs.writeFileSync(path.join(root, spec.halves[start / 3]), PNG.sync.write(half));
    combined.data.set(half.data, (start / 3) * half.data.length);
  }
  fs.writeFileSync(path.join(root, spec.combined), PNG.sync.write(combined));
  writeAssetJson(path.join(root, 'source/boss-boar-move-registration-v1.json'), records);
  return records;
}
module.exports = { prepareWalk };
