'use strict';
// Slice observed transparent gutters; never cut a sprite at an assumed equal-cell line.
// Only crop, uniform nearest-neighbor scale, translation and packing are performed.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), sharp = require('sharp');
const { developmentAsset, makeAssetDirectory, writeAssetJson } = require('../lib/project-paths.cjs');
const base = developmentAsset('reincarnation-goddess/basic-v1');
const read = name => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8').replace(/^\uFEFF/, ''));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function measure(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bounds = [info.width, info.height, -1, -1]; let edge = 0, clear = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const a = data[(y * info.width + x) * 4 + 3]; if (!a) clear++;
    if (a > 32) {
      bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
      if (x < 2 || y < 2 || x >= info.width - 2 || y >= info.height - 2) edge++;
    }
  }
  return { bounds, edgePixels: edge, transparentFraction: clear / (info.width * info.height) };
}
async function gif(buffers, delays, file, loop = 0) {
  const width = 512, pageHeight = 512;
  const raw = await Promise.all(buffers.map(b => sharp(b).ensureAlpha().raw().toBuffer()));
  await sharp(Buffer.concat(raw), { raw: { width, height: pageHeight * raw.length, channels: 4, pageHeight } })
    .gif({ delay: delays, loop, dither: 0, colours: 256, keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(file);
  const m = await sharp(file, { animated: true }).metadata();
  assert.equal(m.pages, buffers.length, 'GIF frame count');
  assert.deepEqual(m.delay, delays, 'GIF timing');
}
async function build() {
  const layout = read('layout.json'), generation = read('generation.json');
  const assembled = {}, scales = {}, registration = [];
  for (const job of layout.frames) {
    const input = path.join(base, job.source), m = await sharp(input).metadata();
    assert.ok(m.hasAlpha, job.id + ' missing alpha');
    const cells = job.rows.flatMap(row => row.cuts.slice(0, -1).map((left, i) => ({ left, top: row.top, width: row.cuts[i + 1] - left, height: row.height })));
    const first = await sharp(input).extract(cells[0]).png().toBuffer(), firstStats = await measure(first);
    const scale = job.scaleFrom ? scales[job.scaleFrom] : layout.targetHeight / (firstStats.bounds[3] - firstStats.bounds[1] + 1);
    scales[job.id] = scale; assembled[job.id] = [];
    for (const [i, rect] of cells.entries()) {
      const cell = await sharp(input).extract(rect).png().toBuffer(), sourceStats = await measure(cell);
      assert.equal(sourceStats.edgePixels, 0, job.id + ':' + i + ' cut touches solid sprite');
      const anchor = [job.anchors[i][0] - rect.left, job.anchors[i][1] - rect.top];
      const left = Math.round(layout.targetWaist[0] + job.offsets[i][0] - anchor[0] * scale);
      const top = Math.round(layout.targetWaist[1] + job.offsets[i][1] - anchor[1] * scale);
      const resized = await sharp(cell).resize(Math.round(rect.width * scale), Math.round(rect.height * scale), { kernel: 'nearest' }).png().toBuffer();
      // Transparent cell edges can exceed the destination while the sprite stays safe.
      // Composite onto a larger work canvas, then crop the requested fixed cell.
      const pad = 512;
      const workCanvas = await sharp({ create: { width: 1536, height: 1536, channels: 4, background: '#00000000' } })
        .composite([{ input: resized, left: left + pad, top: top + pad }]).png().toBuffer();
      const packed = await sharp(workCanvas).extract({ left: pad, top: pad, width: 512, height: 512 }).png().toBuffer();
      const stats = await measure(packed);
      assert.ok(stats.bounds[2] >= stats.bounds[0] && stats.bounds[3] >= stats.bounds[1], job.id + ':' + i + ' empty sprite');
      assert.ok(stats.transparentFraction < 0.95, job.id + ':' + i + ' missing character');
      assert.equal(stats.edgePixels, 0, job.id + ':' + i + ' destination clipping');
      assert.ok(stats.transparentFraction > 0.45, job.id + ':' + i + ' opaque backdrop');
      assert.ok(stats.bounds[0] >= 12 && stats.bounds[1] >= 12 && stats.bounds[2] < 500 && stats.bounds[3] < 500, job.id + ':' + i + ' safety margin');
      assembled[job.id].push(packed);
      registration.push({ clip: job.id, frame: i + 1, source: job.source, sourceRect: rect, observedWaist: job.anchors[i], sourceBounds: sourceStats.bounds, scale, translation: [left, top], ...stats });
    }
  }
  const clips = [
    { id: 'idle', label: '待機', loop: true, durations: [280, 280, 280, 280], buffers: assembled.idle, facing: 'left' },
    { id: 'move', label: '浮遊移動', loop: true, durations: [180, 180, 180, 180], buffers: assembled.move, facing: 'left' },
    { id: 'hit', label: '涙目の被弾', loop: false, durations: [100, 160, 220], buffers: assembled.hit, facing: 'left' },
    { id: 'return', label: '涙目で怒って帰還', loop: false, durations: [200, 180, 200, 180, 220, 340], buffers: [...assembled['return-a'], ...assembled['return-b']], facing: 'left-to-back' },
  ];
  makeAssetDirectory(path.join(base, 'review'));
  for (const clip of clips) {
    const dir = path.join(base, 'motions', clip.id); makeAssetDirectory(dir);
    const frames = clip.buffers.map((buffer, i) => {
      const file = 'frame-' + String(i + 1).padStart(2, '0') + '.png'; fs.writeFileSync(path.join(dir, file), buffer);
      return { index: i, file, x: i * 512, y: 0, width: 512, height: 512, durationMs: clip.durations[i] };
    });
    await sharp({ create: { width: 512 * frames.length, height: 512, channels: 4, background: '#00000000' } })
      .composite(clip.buffers.map((input, i) => ({ input, left: i * 512, top: 0 }))).png().toFile(path.join(dir, 'sheet.png'));
    writeAssetJson(path.join(dir, 'manifest.json'), { schemaVersion: 1, enemy: 'reincarnation-goddess', motion: clip.id, label: clip.label, facing: clip.facing,
      previewOnly: true, cell: { width: 512, height: 512 }, pivot: { x: 256, y: 448 }, sheet: 'sheet.png', frameCount: frames.length,
      frameSequence: frames.map(f => f.index), durationMs: clip.durations.reduce((a, b) => a + b, 0), loop: clip.loop, terminal: clip.id === 'return',
      endBehavior: clip.loop ? 'loop' : clip.id === 'return' ? 'depart' : 'recover', frames });
    await gif(clip.buffers, clip.durations, path.join(base, 'review', clip.id + '.gif'), clip.loop ? 0 : 1);
    const thumbnails = await Promise.all(clip.buffers.map(b => sharp(b).resize(256, 256, { kernel: 'nearest' }).png().toBuffer()));
    await sharp({ create: { width: thumbnails.length * 256, height: 256, channels: 4, background: '#25283e' } })
      .composite(thumbnails.map((input, i) => ({ input, left: i * 256, top: 0 }))).png().toFile(path.join(base, 'review', clip.id + '-contact.png'));
  }
  writeAssetJson(path.join(base, 'motions/index.json'), clips.map(c => ({ id: c.id, label: c.label, manifest: c.id + '/manifest.json' })));
  const all = clips.flatMap(c => c.buffers), sheet = await Promise.all(all.map(b => sharp(b).resize(256, 256, { kernel: 'nearest' }).png().toBuffer()));
  await sharp({ create: { width: 1536, height: 1024, channels: 4, background: '#25283e' } })
    .composite(sheet.map((input, i) => ({ input, left: (i % 6) * 256, top: Math.floor(i / 6) * 256 })))
    .png().toFile(path.join(base, 'review/all-frames.png'));
  for (const job of generation.jobs) job.sha256 = hash(path.join(base, job.source));
  generation.references = ['references/approved-concept.png', 'references/left-base.png', 'references/identity-head.png', 'references/costume-lower.png', 'references/existing-pixel-style.png']
    .map(file => ({ file, sha256: hash(path.join(base, file)) }));
  writeAssetJson(path.join(base, 'generation.json'), generation);
  writeAssetJson(path.join(base, 'registration.json'), { date: '2026-10-20', processing: 'Measured empty gutters; per-segment uniform nearest-neighbor scale; observed waist registration; original RGBA preserved without recolor, alpha thresholding, repaint or mirroring.', frames: registration });
  await require('./build-reincarnation-goddess-preview.cjs').buildPreview();
  const report = { date: '2026-10-20', status: 'automatic-checks-passed-awaiting-visual-review', clips: clips.length, frames: all.length,
    transparent: true, sourceBorderPixels: 0, outputBorderPixels: registration.reduce((n, f) => n + f.edgePixels, 0),
    gifTimingVerified: true, runtimeRegistered: false, scales };
  writeAssetJson(path.join(base, 'review/qa.json'), report); console.log(JSON.stringify(report));
}
if (require.main === module) build().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { build };
