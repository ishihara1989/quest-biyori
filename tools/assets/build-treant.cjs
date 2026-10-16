'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Pack generated artwork; retain RGB samples and reject diffuse alpha noise.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const search = [__dirname, process.env.NODE_PATH, bundled].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: search }));
const sharp = require(require.resolve('sharp', { paths: search }));
const publicRoot = path.join(__dirname, '../../public');
function bounds(image, threshold = 192) {
  const b = { left: image.width, top: image.height, right: -1, bottom: -1 };
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    if (image.data[(y * image.width + x) * 4 + 3] < threshold) continue;
    b.left = Math.min(b.left, x); b.right = Math.max(b.right, x);
    b.top = Math.min(b.top, y); b.bottom = Math.max(b.bottom, y);
  }
  assert.ok(b.right >= b.left, 'Empty sprite'); return b;
}
function crop(image, rect) {
  const out = new PNG({ width: rect.width, height: rect.height });
  for (let y = 0; y < out.height; y++) out.data.set(image.data.subarray(
    ((rect.y + y) * image.width + rect.x) * 4,
    ((rect.y + y) * image.width + rect.x + rect.width) * 4), y * out.width * 4);
  return out;
}
function splitRows(source, left = 0, right = source.width) {
  const gaps = []; let start = null;
  for (let y = Math.floor(source.height * .36); y < Math.ceil(source.height * .64); y++) {
    let count = 0;
    for (let x = left; x < right; x++) if (source.data[(y * source.width + x) * 4 + 3] >= 192) count++;
    if (count === 0 && start === null) start = y;
    if (count > 0 && start !== null) { gaps.push({ start, end: y }); start = null; }
  }
  if (start !== null) gaps.push({ start, end: Math.ceil(source.height * .64) });
  assert.ok(gaps.length, 'No transparent separator between generated rows; inspect source');
  gaps.sort((a, b) => Math.abs((a.start + a.end) / 2 - source.height / 2) - Math.abs((b.start + b.end) / 2 - source.height / 2));
  return [0, Math.round((gaps[0].start + gaps[0].end) / 2), source.height];
}
async function pack(spec) {
  // Whip afterimages carry intentional translucent alpha; keep their export
  // cutoff configurable while retaining the existing default for other assets.
  const alphaCutoff = spec.alphaCutoff ?? 192;
  const dir = path.join(publicRoot, spec.directory); makeAssetDirectory(dir, { recursive: true });
  const source = PNG.sync.read(fs.readFileSync(path.resolve(dir, spec.source)));
  const count = spec.frames.length, width = spec.frameWidth, height = spec.frameHeight;
  const sheet = new PNG({ width: width * count, height });
  const gifWidth = width * 2, gifHeight = height * 2;
  const raw = Buffer.alloc(gifWidth * gifHeight * count * 4), frames = [];
  for (const [index, def] of spec.frames.entries()) {
    const col = def.cell % (spec.columns || 2), row = Math.floor(def.cell / (spec.columns || 2));
    const columnEdges = spec.columnEdgesByRow?.[row] || spec.columnEdges || [0, source.width / 2, source.width];
    const rowEdges = spec.rowEdges || (spec.splitRowsByColumn
      ? splitRows(source, columnEdges[col], columnEdges[col + 1]) : splitRows(source));
    const rect = { x: columnEdges[col], y: rowEdges[row], width: columnEdges[col + 1] - columnEdges[col], height: rowEdges[row + 1] - rowEdges[row] };
    const cell = crop(source, rect), b = bounds(cell, alphaCutoff);
    assert.ok(b.left > 1 && b.top > 1 && b.right < cell.width - 2 && b.bottom < cell.height - 2, `${spec.id}/${index}: clipped source ${JSON.stringify({ b, rect })}`);
    let anchor = def.anchor;
    if (!anchor && spec.anchorMode === 'root') {
      // Register the root feet rather than the swinging arms or crown.
      let left = cell.width, right = -1;
      for (let y = Math.max(b.top, b.bottom - 14); y <= b.bottom; y++) for (let x = b.left; x <= b.right; x++) {
        if (cell.data[(y * cell.width + x) * 4 + 3] >= alphaCutoff) { left = Math.min(left, x); right = Math.max(right, x); }
      }
      anchor = { x: Math.round((left + right) / 2), y: b.bottom };
    }
    if (!anchor) anchor = spec.anchorMode === 'ground'
      ? { x: Math.round((b.left + b.right) / 2), y: b.bottom }
      : spec.anchorMode === 'bounds-center'
        ? { x: Math.round((b.left + b.right) / 2), y: Math.round((b.top + b.bottom) / 2) }
        : { x: Math.round(cell.width / 2), y: Math.round(cell.height / 2) };
    const output = new PNG({ width, height }), offset = def.offset || { x: 0, y: 0 };
    const scale = def.scale ?? spec.scale;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (spec.clipBelowGround && y > spec.pivot.y) continue;
      const sx = Math.round(anchor.x + (x - spec.pivot.x - offset.x) / scale);
      const sy = Math.round(anchor.y + (y - spec.pivot.y - offset.y) / scale);
      if (sx < Math.max(0, b.left - 2) || sy < Math.max(0, b.top - 2) || sx > Math.min(cell.width - 1, b.right + 2) || sy > Math.min(cell.height - 1, b.bottom + 2)) continue;
      const pos = (sy * cell.width + sx) * 4;
      // A pixel-art export has no background haze. The generator's low-alpha
      // matte is excluded; all retained RGB and alpha values stay unchanged.
      if (cell.data[pos + 3] < alphaCutoff) continue;
      output.data.set(cell.data.subarray(pos, pos + 4), (y * width + x) * 4);
    }
    const ob = bounds(output, 32);
    assert.ok(ob.left > 0 && ob.top > 0 && ob.right < width - 1 && ob.bottom < height - 1, `${spec.id}/${index}: clipped output ${JSON.stringify({ ob, anchor, b, rect })}`);
    const file = `${spec.id}-${String(index + 1).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(dir, file), PNG.sync.write(output));
    for (let y = 0; y < gifHeight; y++) for (let x = 0; x < gifWidth; x++) {
      const pos = (Math.floor(y / 2) * width + Math.floor(x / 2)) * 4;
      raw.set(output.data.subarray(pos, pos + 4), ((index * gifHeight + y) * gifWidth + x) * 4);
    }
    for (let y = 0; y < height; y++) sheet.data.set(output.data.subarray(y * width * 4, (y + 1) * width * 4), (y * sheet.width + index * width) * 4);
    frames.push({ index, file, x: index * width, y: 0, width, height, durationMs: def.durationMs, phase: def.phase,
      bounds: ob, sourceCell: rect, sourceAnchor: anchor, bakedOffset: offset,
      ...(def.scale !== undefined ? { sourceScale: scale } : {}) });
  }
  const name = spec.enemy ? `${spec.enemy}-${spec.id}` : spec.id;
  const manifest = { schemaVersion: 1, ...(spec.enemy ? { enemy: spec.enemy, motion: spec.id, facing: 'left' } : { effect: spec.id }),
    label: spec.label, sheet: `${name}.png`, preview: `${name}-preview.gif`, prompt: spec.prompt,
    width: sheet.width, height, columns: count, rows: 1, frameWidth: width, frameHeight: height, frameCount: count,
    pivot: spec.pivot, frameSequence: frames.map(f => f.index), durationMs: frames.reduce((sum, f) => sum + f.durationMs, 0),
    loop: !!spec.loop, terminal: !!spec.terminal,
    transitions: spec.enemy ? { from: 'idle', to: spec.terminal ? null : 'idle', idleLeadInMs: 1600, idleLeadOutMs: 1600 } : { from: null, to: null },
    endBehavior: spec.enemy ? (spec.terminal ? 'hold' : spec.loop ? 'loop' : 'idle') : (spec.loop ? 'loop' : 'hide'),
    source: spec.source, sourceScale: spec.scale, sampling: 'nearest-neighbor', alphaCutoff,
    generation: 'built-in image_gen; full prompts in PROMPT.md',
    ...(spec.events ? { events: spec.events } : {}), frames };
  fs.writeFileSync(path.join(dir, manifest.sheet), PNG.sync.write(sheet));
  writeAssetJson(path.join(dir, 'manifest.json'), manifest);
  await sharp(raw, { raw: { width: gifWidth, height: gifHeight * count, channels: 4, pageHeight: gifHeight } })
    .gif({ loop: spec.loop ? 0 : 1, delay: frames.map(f => f.durationMs), colours: 256, dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 })
    .toFile(path.join(dir, manifest.preview));
  const gif = await sharp(path.join(dir, manifest.preview), { animated: true }).metadata();
  assert.equal(gif.pages, count); assert.deepEqual(gif.delay, frames.map(f => f.durationMs));
  console.log(JSON.stringify({ asset: name, frames: count, size: `${width}x${height}`, bounds: frames.map(f => f.bounds) }));
  return manifest;
}
async function main() {
  const recipe = JSON.parse(fs.readFileSync(path.join(publicRoot, 'assets/enemies/treant/layout.json'), 'utf8'));
  const motionIndex = [], effects = [];
  for (const spec of recipe.assets) {
    await pack(spec);
    if (spec.enemy) motionIndex.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
    else effects.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
  }
  writeAssetJson(path.join(publicRoot, 'assets/enemies/treant/motions/index.json'), motionIndex);
  const effectsPath = path.join(publicRoot, 'assets/effects/index.json');
  const existing = fs.existsSync(effectsPath) ? JSON.parse(fs.readFileSync(effectsPath, 'utf8')) : [];
  const retained = existing.filter(entry => !effects.some(effect => effect.id === entry.id));
  writeAssetJson(effectsPath, [...effects, ...retained]);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { bounds, pack, buildTreant: main };
