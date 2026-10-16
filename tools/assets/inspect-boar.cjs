'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { bounds } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boar/source');
for (const file of fs.readdirSync(root).filter(file => /generated-v\d+\.png$/.test(file))) {
  const image = PNG.sync.read(fs.readFileSync(path.join(root, file)));
  const seen = new Uint8Array(image.width * image.height), queue = new Int32Array(seen.length), components = [];
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || image.data[start * 4 + 3] < 192) continue;
    let read = 0, write = 1;
    queue[0] = start; seen[start] = 1;
    const box = { left: image.width, top: image.height, right: -1, bottom: -1 };
    while (read < write) {
      const pos = queue[read++], x = pos % image.width, y = Math.floor(pos / image.width);
      box.left = Math.min(box.left, x); box.right = Math.max(box.right, x);
      box.top = Math.min(box.top, y); box.bottom = Math.max(box.bottom, y);
      for (const next of [x > 0 ? pos - 1 : -1, x < image.width - 1 ? pos + 1 : -1,
        y > 0 ? pos - image.width : -1, y < image.height - 1 ? pos + image.width : -1]) {
        if (next < 0 || seen[next] || image.data[next * 4 + 3] < 192) continue;
        seen[next] = 1; queue[write++] = next;
      }
    }
    if (write > 4000) components.push({ pixels: write, ...box });
  }
  const columns = file.includes('move-') ? 3 : 2, rows = file.includes('move-') ? 1 : 2;
  const cells = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const x = Math.round(col * image.width / columns), y = Math.round(row * image.height / rows);
    const width = Math.round((col + 1) * image.width / columns) - x;
    const height = Math.round((row + 1) * image.height / rows) - y;
    const cell = new PNG({ width, height });
    for (let py = 0; py < height; py++) cell.data.set(image.data.subarray(((y + py) * image.width + x) * 4,
      ((y + py) * image.width + x + width) * 4), py * width * 4);
    const b = bounds(cell);
    cells.push({ row, col, bounds: b, visibleSize: [b.right - b.left + 1, b.bottom - b.top + 1],
      margins: [b.left, b.top, width - 1 - b.right, height - 1 - b.bottom] });
  }
  console.log(JSON.stringify({ file, size: [image.width, image.height], components, cells }));
}
