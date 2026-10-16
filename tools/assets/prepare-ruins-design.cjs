'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const { PNG } = require('pngjs');
const root = path.resolve(__dirname, '../../public/assets/ruins-design/v1');
const spec = JSON.parse(fs.readFileSync(path.join(root, 'generation.json'), 'utf8'));
const output = [];
for (const asset of spec.assets) {
  for (const source of asset.sources) {
    const dest = path.resolve(root, source.file);
    if (!dest.startsWith(root + path.sep)) throw new Error('Source destination outside asset folder');
    makeAssetDirectory(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.copyFileSync(source.generatedPath, dest);
  }
  fs.copyFileSync(path.join(root, asset.selected), path.join(root, asset.file));
  const png = PNG.sync.read(fs.readFileSync(path.join(root, asset.file)));
  let transparent = 0, partial = 0, edge = 0, redOpaque = 0, topBandVisible = 0;
  const bounds = { left: png.width, top: png.height, right: -1, bottom: -1 };
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const i = (y * png.width + x) * 4;
    const a = png.data[i + 3];
    if (a === 0) transparent++;
    else if (a < 255) partial++;
    if (a >= 128) {
      bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
      bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y);
      if (x === 0 || y === 0 || x === png.width - 1 || y === png.height - 1) edge++;
      if (png.data[i] > 200 && png.data[i + 1] < 90 && png.data[i + 2] < 90) redOpaque++;
      if (y < png.height * .45) topBandVisible++;
    }
  }
  const row = { id: asset.id, label: asset.label, file: asset.file, width: png.width, height: png.height,
    transparentRatio: Number((transparent / (png.width * png.height)).toFixed(4)), partialAlphaPixels: partial,
    opaqueBounds: bounds, edgeOpaquePixels: edge, redOpaquePixels: redOpaque, topBandVisible,
    hasTransparency: transparent > 0, noClipping: asset.kind === 'background' || edge === 0 };
  output.push(row);
}
writeAssetJson(path.join(root, 'qa.json'), { status: 'design-review', assets: output });
console.log(JSON.stringify(output, null, 2));
