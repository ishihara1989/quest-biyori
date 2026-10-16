'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Package generated RGBA only; retain the source, register feet and sample nearest pixels.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { PNG } = require('pngjs'), sharp = require('sharp');
const { buildMotion } = require('./build-motion.cjs');
const { buildPreview } = require('./build-motion-preview.cjs');
const root = path.resolve(__dirname, '../..'), base = path.join(root, 'public/assets');
const writeJSON = (file, data) => writeAssetJson(file, data);
function rects(image, rec) {
  if (rec.rects) return rec.rects;
  const cols = rec.columns || 3, rows = rec.rows || 1;
  const cuts = rec.xCuts || Array.from({ length: cols + 1 }, (_, i) => Math.round(i * image.width / cols));
  return Array.from({ length: rec.count || cols * rows }, (_, i) => {
    const y = Math.round(Math.floor(i / cols) * image.height / rows);
    return { x: cuts[i % cols], y, width: cuts[i % cols + 1] - cuts[i % cols],
      height: Math.round((Math.floor(i / cols) + 1) * image.height / rows) - y };
  });
}
function extract(image, r) {
  const out = new PNG({ width: r.width, height: r.height });
  for (let y = 0; y < r.height; y++) out.data.set(image.data.subarray(((r.y + y) * image.width + r.x) * 4,
    ((r.y + y) * image.width + r.x + r.width) * 4), y * r.width * 4);
  return out;
}
async function build(records, target) {
  for (const rec of records) {
    if (rec.id.endsWith('-a') || rec.id.endsWith('-b') || (target && rec.id !== target && rec.character !== target)) continue;
    const dir = path.join(base, rec.character, 'motions', rec.id), sourceDir = path.join(dir, 'source');
    makeAssetDirectory(sourceDir, { recursive: true });
    const file = `${rec.character}-${rec.id}-generated-v${rec.version || 1}.png`;
    let image, cells;
    if (rec.parts) {
      const poses = [];
      for (const [n, partId] of rec.parts.entries()) {
        const part = records.find(r => r.id === partId && r.character === rec.character);
        assert.ok(part, 'Missing split generation: ' + partId);
        const partFile = path.join(sourceDir, `${rec.id}-part-${n + 1}.png`);
        const origin = path.resolve(root, part.source);
        if (origin !== partFile) fs.copyFileSync(origin, partFile);
        const im = PNG.sync.read(fs.readFileSync(partFile));
        for (const r of rects(im, part)) {
          let pose = extract(im, r);
          if (part.registrationScale) pose = PNG.sync.read(await sharp(PNG.sync.write(pose)).resize({ width: Math.round(pose.width * part.registrationScale), kernel: 'nearest' }).png().toBuffer());
          poses.push(pose);
        }
      }
      const w = Math.max(...poses.map(p => p.width)), h = Math.max(...poses.map(p => p.height));
      image = new PNG({ width: w * 3, height: h * 2 });
      cells = poses.map((p, n) => {
        const x = n % 3 * w, y = Math.floor(n / 3) * h;
        for (let iy = 0; iy < p.height; iy++) image.data.set(p.data.subarray(iy * p.width * 4, (iy + 1) * p.width * 4), ((y + iy) * image.width + x) * 4);
        return { x, y, width: w, height: h };
      });
      fs.writeFileSync(path.join(sourceDir, file), PNG.sync.write(image));
    } else {
      const source = path.resolve(root, rec.source), destination = path.join(sourceDir, file);
      if (source !== destination) fs.copyFileSync(source, destination);
      image = PNG.sync.read(fs.readFileSync(destination)); cells = rects(image, rec);
    }
    assert.ok(image.data.some((value, i) => i % 4 === 3 && value === 0), 'Generated transparent alpha required');
    for (const edit of rec.frameEdits || []) {
      const rect = cells[edit.frame], correction = PNG.sync.read(fs.readFileSync(path.resolve(root, edit.source)));
      assert.ok(rect && edit.scale > 0, 'Correction must identify an existing cell and positive registration scale');
      // Register a generated replacement, retaining every pixel of the other cells.
      // The original source remains intact; the versioned atlas is rebuilt from it.
      for (let y = 0; y < correction.height; y++) for (let x = 0; x < correction.width; x++) {
        if (correction.data[(y * correction.width + x) * 4 + 3] < 32) continue;
        const dx = edit.targetAnchor.x + (x - edit.anchor.x) * edit.scale;
        const dy = edit.targetAnchor.y + (y - edit.anchor.y) * edit.scale;
        assert.ok(dx > 2 && dx < rect.width - 3 && dy > 2 && dy < rect.height - 3, 'Complete corrected silhouette fits inside its original cell');
      }
      for (let y = 0; y < rect.height; y++) for (let x = 0; x < rect.width; x++) {
        const sx = Math.round(edit.anchor.x + (x - edit.targetAnchor.x) / edit.scale);
        const sy = Math.round(edit.anchor.y + (y - edit.targetAnchor.y) / edit.scale);
        const offset = ((rect.y + y) * image.width + rect.x + x) * 4;
        image.data.fill(0, offset, offset + 4);
        if (sx >= 0 && sy >= 0 && sx < correction.width && sy < correction.height) {
          const from = (sy * correction.width + sx) * 4;
          image.data.set(correction.data.subarray(from, from + 4), offset);
        }
      }
    }
    if (rec.frameEdits?.length) fs.writeFileSync(path.join(sourceDir, file), PNG.sync.write(image));
    const prompts = rec.parts ? rec.parts.map(id => records.find(r => r.id === id).prompt).join('\n\n## 後半\n\n') : rec.prompt;
    const corrections = (rec.frameEdits || []).map(edit => '\n\n## Frame ' + (edit.frame + 1) + ' correction\n\n' + edit.prompt).join('');
    fs.writeFileSync(path.join(dir, 'PROMPT.md'), '# ' + rec.character + ' / ' + rec.id + '\n\nBuilt-in image_gen. Locked reference: idle-01.png and original character design. Generated RGBA preserved.\n\n' + prompts + corrections + '\n');
    const layout = { source: 'source/' + file, columns: rec.parts ? 3 : rec.columns || 3,
      rows: rec.parts ? 2 : rec.rows || 1, scale: rec.scale, anchorBasis: rec.anchorBasis,
      frames: cells.map((rect, n) => ({ rect, ...(rec.anchors?.[n] ? { anchor: rec.anchors[n] } : {}) })) };
    if (rec.connection) layout.frames[0].connectionSource = rec.connection;
    writeJSON(path.join(dir, 'layout.json'), layout);
    buildMotion(rec.character, rec.id); await buildPreview(rec.character, rec.id);
    const data = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
    data.previewNotes = 'Ground pivot shared with idle; full casting sequences in ritual-lab.html. Spin plays once without canvas rotation.';
    writeJSON(path.join(dir, 'manifest.json'), data);
    await sharp(path.join(dir, data.sheet)).flatten({ background: '#26323a' }).png().toFile(path.join(dir, 'review.png'));
    if (rec.projectile) {
      const pose = extract(image, cells[rec.projectile.frame]);
      const crop = extract(pose, rec.projectile.rect);
      await sharp(PNG.sync.write(crop)).resize({ width: rec.projectile.width, kernel: 'nearest' }).png().toFile(path.join(dir, 'shuriken-projectile.png'));
      data.projectile = { file: 'shuriken-projectile.png', emission: rec.projectile.emission };
      writeJSON(path.join(dir, 'manifest.json'), data);
    }
  }
}
if (require.main === module) build(JSON.parse(fs.readFileSync(path.join(__dirname, '../../development/records/ritual-generation.json'))), process.argv[2])
  .catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { build };
