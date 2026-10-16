'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, crypto = require('node:crypto'), sharp = require('sharp');
const { PNG } = require('pngjs');
const root = path.resolve(__dirname, '../../public/assets/ui/equipment');
const V = require('../../public/js/ui/equipment-visuals.js');
const cells = ['weapon-forest', 'weapon-swamp', 'weapon-cave', 'weapon-coast',
  'armor-forest', 'armor-swamp', 'armor-cave', 'armor-coast',
  'weapon-ruins', 'armor-ruins', 'power', 'tempo', 'vitality', 'guard', 'skill', 'recovery'];
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
function findCrops(file) {
  // The generated silhouettes sometimes cross an equal-cell boundary. Locate
  // connected artwork before cropping, so paper tips and crest loops stay whole
  // and fragments from the next row never enter another icon.
  const png = PNG.sync.read(fs.readFileSync(file)), { width, height, data } = png;
  const seen = new Uint8Array(width * height), queue = new Int32Array(width * height);
  const boxes = Array.from({ length: 16 }, () => ({ left: width, top: height, right: 0, bottom: 0 }));
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || data[start * 4 + 3] < 16) continue;
    let count = 1, head = 0, left = width, top = height, right = 0, bottom = 0;
    queue[0] = start; seen[start] = 1;
    while (head < count) {
      const at = queue[head++], x = at % width, y = Math.floor(at / width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!seen[next] && data[next * 4 + 3] >= 16) { seen[next] = 1; queue[count++] = next; }
      }
    }
    if (count < 600) continue;
    const cell = Math.floor((top + bottom) / 2 / height * 4) * 4 + Math.floor((left + right) / 2 / width * 4);
    const box = boxes[cell];
    box.left = Math.min(box.left, left); box.right = Math.max(box.right, right);
    box.top = Math.min(box.top, top); box.bottom = Math.max(box.bottom, bottom);
  }
  return boxes.map(box => {
    if (box.right <= box.left || box.bottom <= box.top) throw Error('Missing atlas subject');
    const left = Math.max(0, box.left - 4), top = Math.max(0, box.top - 4);
    return { left, top, width: Math.min(width - 1, box.right + 4) - left + 1, height: Math.min(height - 1, box.bottom + 4) - top + 1 };
  });
}
(async () => {
  const sheets = [], review = [];
  for (const [row, character] of Object.keys(V.CLASSES).entries()) {
    const source = 'source/' + character + '-atlas-v1.png', file = path.join(root, source);
    const meta = await sharp(file).metadata();
    if (!meta.hasAlpha) throw Error(character + ': generated source must have native alpha');
    const crops = findCrops(file);
    makeAssetDirectory(path.join(root, character), { recursive: true });
    const icons = [];
    for (const [index, id] of cells.entries()) {
      const crop = crops[index];
      const tile = await sharp(file).extract(crop).png().toBuffer();
      const target = character + '/' + id + '.png';
      await sharp(tile).trim({ threshold: 8 }).resize(116, 116, { fit: 'contain', kernel: 'nearest', background: transparent })
        .extend({ top: 6, bottom: 6, left: 6, right: 6, background: transparent }).png().toFile(path.join(root, target));
      icons.push({ id, file: target, crop });
      review.push({ input: path.join(root, target), left: index * 128, top: row * 128 });
    }
    sheets.push({ character, source, width: meta.width, height: meta.height, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), icons });
  }
  writeAssetJson(path.join(root, 'manifest.json'), { generator: 'built-in image_gen', sampling: 'nearest-neighbor', size: 128, padding: 6, sheets });
  await sharp({ create: { width: cells.length * 128, height: sheets.length * 128, channels: 4, background: transparent } }).composite(review).png().toFile(path.join(root, 'review.png'));
  console.log('Built ' + sheets.length * cells.length + ' transparent class equipment icons.');
})().catch(error => { console.error(error); process.exitCode = 1; });
