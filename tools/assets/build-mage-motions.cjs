'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Package generated art only: crop, register feet, nearest-neighbor sampling.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { PNG } = require('pngjs'), sharp = require('sharp');
const { buildMotion } = require('./build-motion.cjs');
const { buildPreview } = require('./build-motion-preview.cjs');
const { MOTIONS } = require('../../public/js/skills/mage-motions.js');
const root = path.resolve(__dirname, '../..'), assets = path.join(root, 'public/assets');
const records = JSON.parse(fs.readFileSync(path.join(__dirname, '../../development/records/mage-generation.json'), 'utf8'));
const motionKeys = { 'attack-staff': 'attack', chant: 'chant', 'cast-forward': 'forward', 'cast-forward-hold': 'forwardHold', 'cast-up': 'up', 'cast-up-hold': 'upHold' };
function writeJSON(file, data) { writeAssetJson(file, data); }
function sourceFor(directory, id, record) {
  makeAssetDirectory(path.join(directory, 'source'), { recursive: true });
  const file = 'source/' + id + '-generated-v' + (record.version || 1) + '.png';
  const target = path.join(directory, file);
  if (fs.existsSync(record.source) && path.resolve(record.source) !== target) fs.copyFileSync(record.source, target);
  assert.ok(fs.existsSync(target), 'Missing generated source for ' + id);
  const image = PNG.sync.read(fs.readFileSync(target));
  for (const edit of record.frameEdits || []) {
    const rect = record.rects[edit.frame], replacement = PNG.sync.read(fs.readFileSync(path.resolve(root, edit.source)));
    assert.ok(rect && edit.scale > 0 && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= image.width && rect.y + rect.height <= image.height);
    // Register a separately generated correction in its original atlas cell.
    // Replace the entire cell, including empty pixels; never redraw the pose.
    for (let y = 0; y < rect.height; y++) for (let x = 0; x < rect.width; x++) {
      const sx = Math.round(edit.anchor.x + (x - edit.targetAnchor.x) / edit.scale);
      const sy = Math.round(edit.anchor.y + (y - edit.targetAnchor.y) / edit.scale);
      const offset = ((rect.y + y) * image.width + rect.x + x) * 4;
      image.data.fill(0, offset, offset + 4);
      if (sx >= 0 && sy >= 0 && sx < replacement.width && sy < replacement.height) {
        const sourceOffset = (sy * replacement.width + sx) * 4;
        image.data.set(replacement.data.subarray(sourceOffset, sourceOffset + 4), offset);
      }
    }
  }
  if (record.frameEdits?.length) fs.writeFileSync(target, PNG.sync.write(image));
  const corrections = (record.frameEdits || []).map(edit => '\n\n## Frame ' + (edit.frame + 1) + ' correction\n\n' + edit.prompt + (edit.cleanupPrompt ? '\n\n### Staff proportions\n\n' + edit.cleanupPrompt : '')).join('');
  fs.writeFileSync(path.join(directory, 'PROMPT.md'), '# ' + id + '\n\nBuilt-in image_gen. Reference: mage idle and original design. RGBA preserved.\n\n' + record.prompt + (record.cleanupPrompt ? '\n\n## Transparency correction\n\n' + record.cleanupPrompt : '') + corrections + '\n');
  return { file, image };
}
function rectsFor(image, record) {
  const columns = record.columns || 2, rows = record.rows || 2;
  return record.rects || Array.from({ length: 4 }, (_, i) => {
    const x = Math.round(i % columns * image.width / columns), y = Math.round(Math.floor(i / columns) * image.height / rows);
    return { x, y, width: Math.round((i % columns + 1) * image.width / columns) - x, height: Math.round((Math.floor(i / columns) + 1) * image.height / rows) - y };
  });
}
function bodyScale(image, rects) {
  // Indigo hat is the body sizing reference; raised staff tips never shrink her.
  const heights = rects.map(rect => {
    let top = rect.height, bottom = -1;
    for (let y = 0; y < rect.height; y++) for (let x = 0; x < rect.width; x++) {
      const i = ((rect.y + y) * image.width + rect.x + x) * 4, [r, g, b, a] = image.data.subarray(i, i + 4);
      if (a < 128) continue;
      bottom = Math.max(bottom, y);
      if (r > 18 && r < 90 && g < 85 && b > r * 1.3 && b > g * 1.35 && b < 175) top = Math.min(top, y);
    }
    assert.ok(bottom > top);
    return bottom - top;
  });
  return 139 / (heights.reduce((a, b) => a + b, 0) / heights.length);
}
function repack(motion) {
  const directory = path.join(assets, 'mage/motions', motion), data = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json')));
  const sheet = new PNG({ width: data.width, height: data.height });
  const review = new PNG({ width: data.width, height: data.height });
  for (let y = 0; y < review.height; y++) for (let x = 0; x < review.width; x++) {
    const v = (Math.floor(x / 12) + Math.floor(y / 12)) % 2 ? 46 : 31;
    review.data.set([v, v + 5, v + 9, 255], (y * review.width + x) * 4);
  }
  for (const frame of data.frames) {
    const image = PNG.sync.read(fs.readFileSync(path.join(directory, frame.file)));
    let visible = 0, transparent = 0;
    const bounds = { left: 256, top: 224, right: -1, bottom: -1 };
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4, out = (y * sheet.width + frame.x + x) * 4, a = image.data[i + 3];
      sheet.data.set(image.data.subarray(i, i + 4), out);
      if (!a) transparent++;
      if (a >= 128) { visible++; bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x); bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y); }
      for (let c = 0; c < 3; c++) review.data[out + c] = Math.round(image.data[i + c] * a / 255 + review.data[out + c] * (1 - a / 255));
    }
    Object.assign(frame, { visiblePixels: visible, transparentPixels: transparent, bounds });
  }
  fs.writeFileSync(path.join(directory, data.sheet), PNG.sync.write(sheet));
  fs.writeFileSync(path.join(directory, 'review.png'), PNG.sync.write(review));
  writeJSON(path.join(directory, 'manifest.json'), data);
}
async function effects() {
  const catalogPath = path.join(assets, 'effects/index.json'), catalog = JSON.parse(fs.readFileSync(catalogPath));
  const specs = { bolt: { id: 'mage-wind-bolt', label: '魔法使い・風の弾', loop: true, size: 256, duration: 320, pivot: { x: 190, y: 128 } }, aura: { id: 'mage-chant-aura', label: '魔法使い・詠唱', loop: true, size: 256, duration: 640, pivot: { x: 128, y: 168 } }, impact: { id: 'mage-wind-impact', label: '魔法使い・風の衝撃', loop: false, size: 256, duration: 440, pivot: { x: 128, y: 128 } } };
  for (const [key, spec] of Object.entries(specs)) {
    if (!records[key]) continue;
    const directory = path.join(assets, 'effects', spec.id), { file, image } = sourceFor(directory, spec.id, records[key]);
    const rects = rectsFor(image, records[key]), frames = [];
    const scale = Math.min(...rects.map(r => (spec.size - 16) / Math.max(r.width, r.height)));
    const sheet = new PNG({ width: spec.size * 4, height: spec.size });
    for (let n = 0; n < 4; n++) {
      const rect = rects[n], output = new PNG({ width: spec.size, height: spec.size });
      for (let y = 0; y < spec.size; y++) for (let x = 0; x < spec.size; x++) {
        const sx = Math.round((x - 128) / scale + rect.width / 2), sy = Math.round((y - 128) / scale + rect.height / 2);
        if (sx < 0 || sy < 0 || sx >= rect.width || sy >= rect.height) continue;
        const i = ((rect.y + sy) * image.width + rect.x + sx) * 4;
        output.data.set(image.data.subarray(i, i + 4), (y * spec.size + x) * 4);
      }
      const frameFile = 'frame-' + (n + 1) + '.png';
      fs.writeFileSync(path.join(directory, frameFile), PNG.sync.write(output));
      for (let y = 0; y < spec.size; y++) sheet.data.set(output.data.subarray(y * spec.size * 4, (y + 1) * spec.size * 4), (y * sheet.width + n * spec.size) * 4);
      frames.push({ index: n, file: frameFile, x: n * spec.size, y: 0, width: spec.size, height: spec.size, durationMs: spec.duration / 4, phase: (records[key].phases || ['始まり', '拡張', '変化', '戻る'])[n] });
    }
    const sheetName = spec.id + '.png'; fs.writeFileSync(path.join(directory, sheetName), PNG.sync.write(sheet));
    const data = { version: 1, id: spec.id, label: spec.label, sheet: sheetName, preview: 'preview.gif', width: 1024, height: 256, frameWidth: 256, frameHeight: 256, frameCount: 4, columns: 4, rows: 1, frameSequence: [0, 1, 2, 3], durationMs: spec.duration, loop: spec.loop, pivot: spec.pivot, sampling: 'nearest-neighbor', source: file, generation: 'built-in image_gen; generated alpha preserved', frames };
    writeJSON(path.join(directory, 'manifest.json'), data);
    const vertical = Buffer.alloc(256 * 256 * 4 * 4);
    frames.forEach((f, i) => PNG.sync.read(fs.readFileSync(path.join(directory, f.file))).data.copy(vertical, i * 256 * 256 * 4));
    await sharp(vertical, { raw: { width: 256, height: 1024, channels: 4, pageHeight: 256 } }).gif({ loop: spec.loop ? 0 : 1, delay: frames.map(f => f.durationMs), colours: 256, dither: 0, keepDuplicateFrames: true }).toFile(path.join(directory, 'preview.gif'));
    if (!catalog.some(item => item.id === spec.id)) catalog.push({ id: spec.id, label: spec.label, manifest: spec.id + '/manifest.json' });
  }
  writeJSON(catalogPath, catalog);
}
(async () => {
  const requested = process.argv[2];
  if (requested) assert.ok(MOTIONS.includes(requested), 'Unknown mage motion: ' + requested);
  const motions = requested ? [requested] : MOTIONS;
  for (const motion of motions) {
    const record = records[motionKeys[motion]]; if (!record) continue;
    const directory = path.join(assets, 'mage/motions', motion), { file, image } = sourceFor(directory, 'mage-' + motion, record);
    const rects = rectsFor(image, record);
    const layout = { source: file, columns: record.columns || 2, rows: record.rows || 2, scale: record.scale || bodyScale(image, rects), frames: rects.map(rect => ({ rect })) };
    if (motion === 'cast-forward' || motion === 'cast-up') layout.frames[0].connectionSource = { motion: 'chant', frame: 0 };
    if (motion.endsWith('-hold')) layout.frames[0].connectionSource = { motion: motion.slice(0, -5), frame: 3 };
    writeJSON(path.join(directory, 'layout.json'), layout); buildMotion('mage', motion);
  }
  for (const motion of motions) if (records[motionKeys[motion]]) { repack(motion); await buildPreview('mage', motion); }
  if (!requested) await effects();
  console.log('Packaged mage motion/effect sources, PNGs, manifests and GIFs.');
})().catch(error => { console.error(error); process.exitCode = 1; });
