'use strict';
// Production processing only: measured crop, uniform nearest-neighbor scale,
// translation, packing and GIF previews. Generated RGBA is never recolored.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict'), sharp = require('sharp');
const { developmentAsset, makeAssetDirectory, writeAssetJson } = require('../lib/project-paths.cjs');
const base = developmentAsset('trial-intruders/idle-v1');
const read = name => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
async function pixels(input) {
  return sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}
function measure(data, width, height, rect = { left: 0, top: 0, width, height }) {
  const bounds = [rect.left + rect.width, rect.top + rect.height, -1, -1];
  let edgePixels = 0, clear = 0, visible = 0;
  for (let y = rect.top; y < rect.top + rect.height; y++) for (let x = rect.left; x < rect.left + rect.width; x++) {
    const a = data[(y * width + x) * 4 + 3];
    if (a === 0) clear++;
    if (a > 32) {
      visible++; bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
      if (x === rect.left || y === rect.top || x === rect.left + rect.width - 1 || y === rect.top + rect.height - 1) edgePixels++;
    }
  }
  return { bounds, edgePixels, visiblePixels: visible, transparentFraction: clear / (rect.width * rect.height) };
}
function projection(data, width, height, axis) {
  const counts = Array(axis === 'x' ? width : height).fill(0);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++)
    if (data[(y * width + x) * 4 + 3] > 32) counts[axis === 'x' ? x : y]++;
  return counts;
}
function cuts(counts, number) {
  const zeros = [];
  for (let i = 0; i < counts.length;) {
    if (counts[i]) { i++; continue; }
    const start = i; while (i < counts.length && counts[i] === 0) i++;
    if (i - start >= 2) zeros.push({ start, end: i - 1, center: Math.floor((start + i - 1) / 2) });
  }
  const result = [0];
  for (let n = 1; n < number; n++) {
    const ideal = counts.length * n / number, radius = counts.length / number * .28;
    const candidates = zeros.filter(z => Math.abs(z.center - ideal) <= radius && z.start > 0 && z.end < counts.length - 1);
    assert.ok(candidates.length, 'No measured transparent gutter near ' + ideal);
    candidates.sort((a, b) => Math.abs(a.center - ideal) - Math.abs(b.center - ideal));
    result.push(candidates[0].center);
  }
  result.push(counts.length);
  assert.ok(result.every((v, i) => !i || v > result[i - 1]), 'Unordered source cuts');
  return result;
}
async function writeGif(buffers, durations, filename) {
  const raw = await Promise.all(buffers.map(b => sharp(b).ensureAlpha().raw().toBuffer()));
  await sharp(Buffer.concat(raw), { raw: { width: 512, height: 512 * raw.length, channels: 4, pageHeight: 512 } })
    .gif({ delay: durations, loop: 0, dither: 0, colours: 256, keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(filename);
  const m = await sharp(filename, { animated: true }).metadata();
  assert.equal(m.pages, buffers.length, 'GIF pages');
  assert.deepEqual(m.delay, durations, 'GIF delays');
}
async function build() {
  const generation = read('generation.json'), registration = [], clips = [];
  makeAssetDirectory(path.join(base, 'review'));
  for (const job of generation.jobs) {
    const filename = path.join(base, job.source), meta = await sharp(filename).metadata();
    assert.ok(meta.hasAlpha, job.id + ' missing alpha');
    const { data, info } = await pixels(filename), sourceStats = measure(data, info.width, info.height);
    assert.equal(sourceStats.edgePixels, 0, job.id + ' source touches border');
    const xCuts = cuts(projection(data, info.width, info.height, 'x'), job.grid[0]);
    const yCuts = cuts(projection(data, info.width, info.height, 'y'), job.grid[1]);
    const allCells = yCuts.slice(0, -1).flatMap((top, row) => xCuts.slice(0, -1).map((left, col) => ({
      left, top, width: xCuts[col + 1] - left, height: yCuts[row + 1] - top
    })));
    assert.equal(allCells.length, 4, job.id + ' source pose count');
    // The second jelly pose occludes one of the four crystal ribbons.
    // Keep three readable drawings and return through the middle pose.
    const keep = job.id === 'cryo-jellyfish' ? [0, 2, 3] : [0, 1, 2, 3];
    const frameSequence = job.id === 'cryo-jellyfish' ? [0, 1, 2, 1] : job.frameSequence;
    const durationMs = 1440, stepDuration = durationMs / frameSequence.length;
    const cells = keep.map(i => ({ sourceFrame: i, rect: allCells[i], stats: measure(data, info.width, info.height, allCells[i]) }));
    for (const c of cells) {
      assert.equal(c.stats.edgePixels, 0, job.id + ' cut crosses a visible pixel');
      assert.ok(c.stats.visiblePixels > 1000, job.id + ' empty source frame');
    }
    const maxWidth = Math.max(...cells.map(c => c.stats.bounds[2] - c.stats.bounds[0] + 1));
    const maxHeight = Math.max(...cells.map(c => c.stats.bounds[3] - c.stats.bounds[1] + 1));
    const scale = Math.min(400 / maxWidth, 400 / maxHeight);
    const dir = path.join(base, 'motions', job.id, 'idle'); makeAssetDirectory(dir);
    const buffers = [], records = [], frames = [];
    for (const [i, cell] of cells.entries()) {
      const b = cell.stats.bounds;
      const crop = { left: Math.max(cell.rect.left, b[0] - 4), top: Math.max(cell.rect.top, b[1] - 4) };
      crop.width = Math.min(cell.rect.left + cell.rect.width, b[2] + 5) - crop.left;
      crop.height = Math.min(cell.rect.top + cell.rect.height, b[3] + 5) - crop.top;
      // These are measured bounding-box proxies, not claimed anatomical joints.
      const observedAnchor = [(b[0] + b[2]) / 2, job.mode === 'ground' ? b[3] : (b[1] + b[3]) / 2];
      const offsetY = job.mode === 'ground' ? 0 : (job.id === 'cryo-jellyfish' ? [0, -3, 3][i] : [0, -3, 0, 3][i]);
      const target = job.mode === 'ground' ? [256, 448] : [256, 252 + offsetY];
      const left = Math.round(target[0] - (observedAnchor[0] - crop.left) * scale);
      const top = Math.round(target[1] - (observedAnchor[1] - crop.top) * scale);
      const resized = await sharp(filename).extract(crop).resize(Math.round(crop.width * scale), Math.round(crop.height * scale), { kernel: 'nearest' }).png().toBuffer();
      assert.ok(left >= 0 && top >= 0, job.id + ' negative placement');
      const buffer = await sharp({ create: { width: 512, height: 512, channels: 4, background: '#00000000' } })
        .composite([{ input: resized, left, top }]).png().toBuffer();
      const packed = await pixels(buffer), stats = measure(packed.data, 512, 512);
      assert.equal(stats.edgePixels, 0, job.id + ' destination border');
      assert.ok(stats.bounds[0] >= 12 && stats.bounds[1] >= 12 && stats.bounds[2] < 500 && stats.bounds[3] < 500, job.id + ' safety margin');
      assert.ok(stats.transparentFraction > .45, job.id + ' opaque backdrop');
      const file = 'frame-' + String(i + 1).padStart(2, '0') + '.png';
      fs.writeFileSync(path.join(dir, file), buffer); buffers.push(buffer);
      frames.push({ index: i, file, x: i * 512, y: 0, width: 512, height: 512, durationMs: stepDuration });
      records.push({ frame: i + 1, sourceFrame: cell.sourceFrame + 1, measuredCell: cell.rect, crop, sourceBounds: b,
        measuredAnchorProxy: observedAnchor, targetAnchor: target, scale, translation: [left, top], ...stats, sha256: hash(buffer) });
    }
    assert.equal(new Set(records.map(r => r.sha256)).size, buffers.length, job.id + ' duplicate drawings');
    await sharp({ create: { width: 512 * buffers.length, height: 512, channels: 4, background: '#00000000' } })
      .composite(buffers.map((input, i) => ({ input, left: i * 512, top: 0 }))).png().toFile(path.join(dir, 'sheet.png'));
    const manifest = { schemaVersion: 1, enemy: job.id, label: job.label, motion: 'idle', facing: 'left', previewOnly: true,
      cell: { width: 512, height: 512 }, pivot: { x: 256, y: 448 }, sheet: 'sheet.png', frameCount: frames.length,
      frameSequence, frameDurationMs: stepDuration, durationMs, loop: true, frames,
      source: path.relative(dir, filename).replaceAll('\\', '/') };
    writeAssetJson(path.join(dir, 'manifest.json'), manifest);
    await writeGif(frameSequence.map(n => buffers[n]), frameSequence.map(() => stepDuration), path.join(base, 'review', job.id + '-idle.gif'));
    const thumbnails = await Promise.all(buffers.map(b => sharp(b).resize(256, 256, { kernel: 'nearest' }).png().toBuffer()));
    for (const [suffix, color] of [['dark', '#172236'], ['light', '#dedbcf']]) {
      await sharp({ create: { width: 1024, height: 256, channels: 4, background: color } })
        .composite(thumbnails.map((input, i) => ({ input, left: i * 256, top: 0 }))).png().toFile(path.join(base, 'review', job.id + '-contact-' + suffix + '.png'));
    }
    const fileHash = hash(fs.readFileSync(filename));
    job.sha256 = fileHash; job.outputManifest = path.relative(base, path.join(dir, 'manifest.json')).replaceAll('\\', '/');
    job.sourceSize = [info.width, info.height]; job.actualFrameCount = frames.length; job.actualFrameSequence = frameSequence;
    registration.push({ id: job.id, xCuts, yCuts, source: job.source, sourceStats, frames: records });
    clips.push({ id: job.id, label: job.label, region: job.region, manifest: manifest, buffers });
    console.log(job.id + ': ' + frames.length + ' drawings, ' + frameSequence.length + ' steps, 1440 ms');
  }
  writeAssetJson(path.join(base, 'motions/index.json'), clips.map(c => ({ id: c.id, label: c.label, region: c.region,
    manifest: c.id + '/idle/manifest.json' })));
  writeAssetJson(path.join(base, 'registration.json'), { date: '2026-10-24', processing: generation.processingPolicy,
    alphaMeasurementThreshold: 32, note: 'Threshold used only for measurements; no alpha/color pixel editing. Bounding-box anchors are measured proxies, not anatomical waist coordinates.', clips: registration });
  writeAssetJson(path.join(base, 'generation.json'), generation);
  for (let start = 0; start < clips.length; start += 4) {
    const layers = [];
    for (const [row, c] of clips.slice(start, start + 4).entries()) {
      const input = await sharp(path.join(base, 'review', c.id + '-contact-dark.png')).png().toBuffer();
      layers.push({ input, left: 0, top: row * 280 + 24 });
      const title = Buffer.from('<svg width="1024" height="24"><text x="12" y="18" font-family="Arial" font-size="16" fill="#d5e5ff">' + c.id + ' / ' + c.buffers.length + ' drawings</text></svg>');
      layers.push({ input: await sharp(title).png().toBuffer(), left: 0, top: row * 280 });
    }
    await sharp({ create: { width: 1024, height: Math.min(4, clips.length - start) * 280, channels: 4, background: '#172236' } })
      .composite(layers).png().toFile(path.join(base, 'review', 'all-frames-' + (Math.floor(start / 4) + 1) + '.png'));
  }
  // All clips use one 1440-ms cycle, so the overview itself also loops cleanly.
  const pages = [];
  for (let t = 0; t < 1440; t += 120) {
    const layers = [];
    for (const [i, c] of clips.entries()) {
      const step = Math.floor(t / c.manifest.frameDurationMs), index = c.manifest.frameSequence[step];
      const input = await sharp(c.buffers[index]).resize(256, 256, { kernel: 'nearest' }).png().toBuffer();
      layers.push({ input, left: (i % 4) * 256, top: Math.floor(i / 4) * 256 });
    }
    pages.push(await sharp({ create: { width: 1024, height: 768, channels: 4, background: '#172236' } }).composite(layers).raw().toBuffer());
  }
  await sharp(Buffer.concat(pages), { raw: { width: 1024, height: 768 * pages.length, channels: 4, pageHeight: 768 } })
    .gif({ delay: 120, loop: 0, colours: 256, dither: 0, keepDuplicateFrames: true }).toFile(path.join(base, 'review/overview.gif'));
  const qa = { date: '2026-10-24', status: 'automatic-checks-passed-awaiting-visual-review', clips: clips.length,
    uniqueFrames: clips.reduce((n, c) => n + c.buffers.length, 0), cycleDurationMs: 1440, facing: 'left',
    alphaPreserved: true, sourceSolidBorderPixels: 0, destinationSolidBorderPixels: 0, minimumOutputMarginPx: 12,
    gifPagesAndTimingVerified: true, runtimeRegistered: false,
    playbackAdjustments: ['storm-raptor uses 1-2-3-4-3-2 to return through intermediate wing poses',
      'cryo-jellyfish excludes source pose 2 with an occluded crystal ribbon, uses source poses 1-3-4 in playback 1-2-3-2'] };
  writeAssetJson(path.join(base, 'review/qa.json'), qa); console.log(JSON.stringify(qa));
}
if (require.main === module) build().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { build };
