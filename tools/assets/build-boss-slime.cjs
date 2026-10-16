'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { pack } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boss-slime');

async function main() {
  const recipe = JSON.parse(fs.readFileSync(path.join(root, 'layout.json'), 'utf8'));
  const entries = [];
  for (const spec of recipe.assets) {
    const model = await pack(spec);
    model.transitions.idleLeadInMs = 1280;
    model.transitions.idleLeadOutMs = 1280;
    const dir = path.join(root, 'motions', spec.id);
    // Reuse the approved idle pose only at explicitly neutral transition frames.
    for (const index of spec.reuseIdle || []) {
      const idle = JSON.parse(fs.readFileSync(path.join(root, 'motions/idle/manifest.json'), 'utf8'));
      fs.copyFileSync(path.join(root, 'motions/idle', idle.frames[0].file), path.join(dir, model.frames[index].file));
      model.frames[index] = { ...model.frames[index], bounds: idle.frames[0].bounds,
        sourceCell: idle.frames[0].sourceCell, sourceAnchor: idle.frames[0].sourceAnchor,
        source: idle.source, sourceScale: idle.sourceScale, bakedOffset: { x: 0, y: 0 }, reusedPose: 'idle/0' };
    }
    if (spec.reuseIdle?.length) {
      const width = model.frameWidth, height = model.frameHeight;
      const sheet = new PNG({ width: model.width, height });
      const gifWidth = width * 2, gifHeight = height * 2;
      const raw = Buffer.alloc(gifWidth * gifHeight * model.frameCount * 4);
      for (const frame of model.frames) {
        const image = PNG.sync.read(fs.readFileSync(path.join(dir, frame.file)));
        for (let y = 0; y < gifHeight; y++) for (let x = 0; x < gifWidth; x++) {
          const pixel = (Math.floor(y / 2) * width + Math.floor(x / 2)) * 4;
          raw.set(image.data.subarray(pixel, pixel + 4), ((frame.index * gifHeight + y) * gifWidth + x) * 4);
        }
        for (let y = 0; y < height; y++) sheet.data.set(image.data.subarray(y * width * 4, (y + 1) * width * 4), (y * sheet.width + frame.x) * 4);
      }
      fs.writeFileSync(path.join(dir, model.sheet), PNG.sync.write(sheet));
      await sharp(raw, { raw: { width: gifWidth, height: gifHeight * model.frameCount, channels: 4, pageHeight: gifHeight } })
        .gif({ loop: model.loop ? 0 : 1, delay: model.frames.map(f => f.durationMs), colours: 256,
          dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(path.join(dir, model.preview));
    }
    if (spec.summonPreview) model.summonPreview = spec.summonPreview;
    writeAssetJson(path.join(dir, 'manifest.json'), model);
    entries.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
  }
  writeAssetJson(path.join(root, 'motions/index.json'), entries);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildBossSlime: main };
