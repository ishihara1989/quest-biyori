'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Extract generated artwork without repainting it. Layouts and motions are data.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const search = [__dirname, process.env.NODE_PATH, bundled].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: search }));
const sharp = require(require.resolve('sharp', { paths: search }));
const root = path.join(__dirname, '../../public/assets/enemies');
function bounds(image) {
  const b = { left: image.width, top: image.height, right: -1, bottom: -1 };
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    if (image.data[(y * image.width + x) * 4 + 3] < 32) continue;
    b.left = Math.min(b.left, x); b.right = Math.max(b.right, x);
    b.top = Math.min(b.top, y); b.bottom = Math.max(b.bottom, y);
  }
  return b;
}
async function buildEnemy(item) {
  const directory = path.join(root, item.id);
  const layout = JSON.parse(fs.readFileSync(path.join(directory, 'layout.json'), 'utf8'));
  const source = PNG.sync.read(fs.readFileSync(path.join(directory, layout.source)));
  assert.equal(layout.rowEdges.at(-1), source.height);
  const { frameWidth: width, frameHeight: height, pivot, scale } = layout;
  const cache = new Map();
  function cellAt(cell) {
    if (cache.has(cell)) return cache.get(cell);
    const column = cell % layout.columns, row = Math.floor(cell / layout.columns);
    const rect = { x: Math.round(column * source.width / layout.columns), y: layout.rowEdges[row],
      width: Math.round((column + 1) * source.width / layout.columns) - Math.round(column * source.width / layout.columns),
      height: layout.rowEdges[row + 1] - layout.rowEdges[row] };
    const image = new PNG({ width: rect.width, height: rect.height });
    for (let y = 0; y < rect.height; y++) image.data.set(source.data.subarray(
      ((rect.y + y) * source.width + rect.x) * 4,
      ((rect.y + y) * source.width + rect.x + rect.width) * 4), y * rect.width * 4);
    const b = bounds(image);
    assert.ok(b.right > b.left && b.bottom >= b.top, `Empty cell ${cell}`);
    assert.ok(b.left > 1 && b.top > 1 && b.right < rect.width - 2 && b.bottom < rect.height - 2, `Clipped cell ${cell}`);
    const pose = { image, rect, bounds: b, anchor: { x: Math.round((b.left + b.right) / 2), y: b.bottom } };
    cache.set(cell, pose); return pose;
  }
  const entries = [];
  for (const spec of layout.motions) {
    const dir = path.join(directory, 'motions', spec.id); makeAssetDirectory(dir, { recursive: true });
    const count = spec.frames.length, sheet = new PNG({ width: width * count, height });
    const gifWidth = width * 2, gifHeight = height * 2, gif = Buffer.alloc(gifWidth * gifHeight * count * 4);
    const frames = [];
    for (const [index, frame] of spec.frames.entries()) {
      const pose = cellAt(frame.cell), output = new PNG({ width, height });
      const offset = frame.offset || { x: 0, y: 0 };
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const sx = Math.round(pose.anchor.x + (x - pivot.x - offset.x) / scale);
        const sy = Math.round(pose.anchor.y + (y - pivot.y - offset.y) / scale);
        // Crop to the visible sprite plus a small alpha fringe; generated cells
        // can contain nearly invisible alpha noise far outside the artwork.
        if (sx < Math.max(0, pose.bounds.left - 4) || sy < Math.max(0, pose.bounds.top - 4) ||
            sx > Math.min(pose.image.width - 1, pose.bounds.right + 4) ||
            sy > Math.min(pose.image.height - 1, pose.bounds.bottom + 4)) continue;
        const pos = (sy * pose.image.width + sx) * 4;
        output.data.set(pose.image.data.subarray(pos, pos + 4), (y * width + x) * 4);
      }
      const b = bounds(output);
      assert.ok(b.left > 0 && b.top > 0 && b.right < width - 1 && b.bottom < height - 1, 'Output clipping');
      assert.equal(b.bottom, pivot.y + offset.y, 'Ground / airborne anchor');
      const file = `${spec.id}-${String(index + 1).padStart(2, '0')}.png`;
      fs.writeFileSync(path.join(dir, file), PNG.sync.write(output));
      for (let y = 0; y < height; y++) sheet.data.set(output.data.subarray(y * width * 4, (y + 1) * width * 4), (y * sheet.width + index * width) * 4);
      for (let y = 0; y < gifHeight; y++) for (let x = 0; x < gifWidth; x++) {
        const pos = (Math.floor(y / 2) * width + Math.floor(x / 2)) * 4;
        gif.set(output.data.subarray(pos, pos + 4), ((index * gifHeight + y) * gifWidth + x) * 4);
      }
      frames.push({ index, file, x: index * width, y: 0, width, height, durationMs: frame.durationMs,
        phase: frame.phase, sourceCellIndex: frame.cell, sourceCell: pose.rect, sourceAnchor: pose.anchor,
        bakedOffset: offset, bounds: b });
    }
    const name = `${item.id}-${spec.id}`, sheetName = `${name}.png`;
    fs.writeFileSync(path.join(dir, sheetName), PNG.sync.write(sheet));
    const manifest = { schemaVersion: 1, enemy: item.id, motion: spec.id, label: spec.label,
      facing: 'left', sheet: sheetName, preview: `${name}-preview.gif`, prompt: '../../PROMPT.md',
      width: sheet.width, height, frameWidth: width, frameHeight: height, frameCount: count, pivot,
      frameSequence: frames.map(f => f.index), durationMs: frames.reduce((sum, f) => sum + f.durationMs, 0),
      loop: !!spec.loop, terminal: !!spec.terminal,
      transitions: { from: 'idle', to: spec.terminal ? null : 'idle', idleLeadInMs: 1280, idleLeadOutMs: 1280 },
      source: `../../${layout.source}`, sourceScale: scale, frames };
    writeAssetJson(path.join(dir, 'manifest.json'), manifest);
    await sharp(gif, { raw: { width: gifWidth, height: gifHeight * count, channels: 4, pageHeight: gifHeight } })
      .gif({ loop: spec.loop ? 0 : 1, delay: frames.map(f => f.durationMs), colours: 256, dither: 0,
        keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(path.join(dir, manifest.preview));
    entries.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
    console.log(`${item.id}/${spec.id}: ${count} frames, ${manifest.durationMs}ms`);
  }
  writeAssetJson(path.join(directory, item.motionIndex), entries);
}
(async () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
  const id = process.argv[2];
  assert.ok(!id || catalog.some(item => item.id === id), `Unknown enemy ${id}`);
  for (const item of catalog.filter(item => !id || item.id === id)) {
    if (item.id === 'treant') await require('./build-treant.cjs').buildTreant();
    else if (item.id === 'boss-slime') await require('./build-boss-slime.cjs').buildBossSlime();
    else if (item.id === 'boar') await require('./build-boar.cjs').buildBoar();
    else if (item.id === 'boss-boar') await require('./build-boss-boar.cjs').buildBossBoar();
    else if (item.id === 'alraune') await require('./build-alraune.cjs').buildAlraune();
    else if (item.id === 'alraune-minion') await require('./build-alraune-minion.cjs').buildAlrauneMinion();
    else await buildEnemy(item);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
