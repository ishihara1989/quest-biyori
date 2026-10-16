'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), sharp = require('sharp');
const { runtimeAsset, developmentAsset, makeAssetDirectory, writeAssetJson } = require('../lib/project-paths.cjs');
const V = require('../../public/js/ui/equipment-visuals.js');
const { PNG } = require('pngjs');
const regions = [...V.REGIONS.slice(5), 'goddess'];
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

function findCrops(source) {
  // Find the complete subject before cropping: generated tips may extend past
  // their nominal cell, and equal-cell crops would introduce neighboring shards.
  const { width, height, data } = PNG.sync.read(fs.readFileSync(source));
  const seen = new Uint8Array(width * height), queue = new Int32Array(width * height);
  const owners = new Int8Array(width * height).fill(-1);
  const boxes = Array.from({ length: 12 }, () => ({ left: width, top: height, right: 0, bottom: 0 }));
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || data[start * 4 + 3] < 64) continue;
    let count = 1, head = 0, left = width, top = height, right = 0, bottom = 0;
    queue[0] = start; seen[start] = 1;
    while (head < count) {
      const at = queue[head++], x = at % width, y = Math.floor(at / width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!seen[next] && data[next * 4 + 3] >= 64) { seen[next] = 1; queue[count++] = next; }
      }
    }
    if (count < 600) continue;
    const cell = Math.floor((top + bottom) / 2 / height * 3) * 4 + Math.floor((left + right) / 2 / width * 4);
    for (let i = 0; i < count; i++) owners[queue[i]] = cell;
    const box = boxes[cell];
    box.left = Math.min(box.left, left); box.right = Math.max(box.right, right);
    box.top = Math.min(box.top, top); box.bottom = Math.max(box.bottom, bottom);
  }
  const crops = boxes.map(box => {
    if (box.right <= box.left || box.bottom <= box.top) throw Error('Missing atlas subject: ' + source);
    const left = Math.max(0, box.left - 4), top = Math.max(0, box.top - 4);
    return { left, top, width: Math.min(width - 1, box.right + 4) - left + 1, height: Math.min(height - 1, box.bottom + 4) - top + 1 };
  });
  return { crops, owners, width, height, data };
}

function isolate(atlas, cell) {
  const crop = atlas.crops[cell], tile = new PNG({ width: crop.width, height: crop.height });
  for (let y = 0; y < crop.height; y++) for (let x = 0; x < crop.width; x++) {
    const sx = x + crop.left, sy = y + crop.top, at = sy * atlas.width + sx;
    let keep = atlas.owners[at] === cell;
    // Preserve the source's antialiased alpha around this subject, excluding
    // detached specks and the faint bridges between neighboring silhouettes.
    if (!keep && atlas.data[at * 4 + 3] < 64) {
      for (let dy = -2; dy <= 2 && !keep; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = sx + dx, ny = sy + dy;
        if (nx >= 0 && nx < atlas.width && ny >= 0 && ny < atlas.height && atlas.owners[ny * atlas.width + nx] === cell) { keep = true; break; }
      }
    }
    if (keep) atlas.data.copy(tile.data, (y * crop.width + x) * 4, at * 4, at * 4 + 4);
  }
  return PNG.sync.write(tile);
}

async function main() {
  const sheets = [], review = [];
  for (const [row, character] of Object.keys(V.CLASSES).entries()) {
    const source = developmentAsset('ui/equipment/source/' + character + '-late-atlas-v1.png');
    const meta = await sharp(source).metadata();
    if (!meta.hasAlpha) throw Error(character + ': source needs native transparency');
    const atlas = findCrops(source);
    const icons = [];
    makeAssetDirectory(runtimeAsset('ui/equipment/' + character));
    for (const [index, region] of regions.entries()) for (const [slotIndex, slot] of ['weapon', 'armor'].entries()) {
      const cell = index * 2 + slotIndex, crop = atlas.crops[cell];
      const file = character + '/' + slot + '-' + region + '.png';
      const tile = isolate(atlas, cell);
      await sharp(tile).trim({ threshold: 8 }).resize(116, 116, { fit: 'contain', kernel: 'nearest', background: clear })
        .extend({ top: 6, bottom: 6, left: 6, right: 6, background: clear }).png().toFile(runtimeAsset('ui/equipment/' + file));
      icons.push({ region, slot, file, crop });
      review.push({ input: runtimeAsset('ui/equipment/' + file), left: cell * 128, top: row * 128 });
    }
    sheets.push({ character, source: path.relative(runtimeAsset('ui/equipment'), source).replaceAll('\\', '/'), width: meta.width, height: meta.height,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'), icons });
  }
  writeAssetJson(runtimeAsset('ui/equipment/late-manifest.json'), { generator: 'built-in image_gen', sampling: 'nearest-neighbor', size: 128, padding: 6, regions, sheets });
  await sharp({ create: { width: 12 * 128, height: sheets.length * 128, channels: 4, background: clear } }).composite(review).png()
    .toFile(developmentAsset('ui/equipment/late-review.png'));
  console.log('Built 72 dedicated equipment icons: six classes, two slots, desert through goddess.');
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { main };
