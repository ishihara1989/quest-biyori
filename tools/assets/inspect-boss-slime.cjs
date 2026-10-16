'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { bounds } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boss-slime/source');
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.png'))) {
  const image = PNG.sync.read(fs.readFileSync(path.join(root, file)));
  const poses = [];
  for (let cell = 0; cell < 4; cell++) {
    const x0 = Math.round((cell % 2) * image.width / 2), x1 = Math.round((cell % 2 + 1) * image.width / 2);
    const y0 = Math.round(Math.floor(cell / 2) * image.height / 2), y1 = Math.round((Math.floor(cell / 2) + 1) * image.height / 2);
    const crop = new PNG({ width: x1 - x0, height: y1 - y0 });
    for (let y = 0; y < crop.height; y++) crop.data.set(image.data.subarray(((y + y0) * image.width + x0) * 4, ((y + y0) * image.width + x1) * 4), y * crop.width * 4);
    const b = bounds(crop);
    poses.push({ cell, rect: [x0, y0, crop.width, crop.height], bounds: b, width: b.right - b.left + 1, height: b.bottom - b.top + 1 });
  }
  console.log(JSON.stringify({ file, size: [image.width, image.height], poses }));
}
