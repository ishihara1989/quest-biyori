'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Crop and register generated artwork; never synthesize or mirror gait poses.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { pack } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boar');

async function exportFrames(model, dir) {
  const sheet = new PNG({ width: model.width, height: model.height });
  const width = model.frameWidth * 2, height = model.frameHeight * 2;
  const raw = Buffer.alloc(width * height * model.frameCount * 4);
  for (const frame of model.frames) {
    const image = PNG.sync.read(fs.readFileSync(path.join(dir, frame.file)));
    for (let y = 0; y < image.height; y++) {
      sheet.data.set(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4), (y * sheet.width + frame.x) * 4);
    }
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const source = (Math.floor(y / 2) * image.width + Math.floor(x / 2)) * 4;
      raw.set(image.data.subarray(source, source + 4), ((frame.index * height + y) * width + x) * 4);
    }
  }
  fs.writeFileSync(path.join(dir, model.sheet), PNG.sync.write(sheet));
  await sharp(raw, { raw: { width, height: height * model.frameCount, channels: 4, pageHeight: height } })
    .gif({ loop: model.loop ? 0 : 1, delay: model.frames.map(frame => frame.durationMs), colours: 256,
      dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(path.join(dir, model.preview));
}

async function main() {
  const recipe = JSON.parse(fs.readFileSync(path.join(root, 'layout.json'), 'utf8'));
  if (recipe.chargeRefinement) {
    const def = recipe.chargeRefinement;
    const original = PNG.sync.read(fs.readFileSync(path.join(root, def.original)));
    const edited = PNG.sync.read(fs.readFileSync(path.join(root, def.edited)));
    assert.equal(edited.width, original.width, 'Charge edit canvas width must match');
    assert.equal(edited.height, original.height, 'Charge edit canvas height must match');
    const { x, y, width, height } = def.cell;
    // Replace only the requested generated cell; preserve the other three poses exactly.
    for (let row = y; row < y + height; row++) {
      const start = (row * original.width + x) * 4;
      original.data.set(edited.data.subarray(start, start + width * 4), start);
    }
    fs.writeFileSync(path.join(root, def.output), PNG.sync.write(original));
  }
  if (recipe.walkRefinementSources) await require('./prepare-boar-walk-refinements.cjs').prepareWalkRefinements();
  // Join independently generated three-frame halves without altering their pixels.
  const halves = recipe.walkSources.map(file => PNG.sync.read(fs.readFileSync(path.join(root, file))));
  assert.equal(halves[0].width, halves[1].width, 'Walk sources must have equal width');
  const combined = new PNG({ width: halves[0].width, height: halves.reduce((sum, image) => sum + image.height, 0) });
  let offset = 0;
  for (const image of halves) { combined.data.set(image.data, offset); offset += image.data.length; }
  fs.writeFileSync(path.join(root, recipe.walkCombined), PNG.sync.write(combined));
  const entries = [];
  for (const spec of recipe.assets) {
    const model = await pack(spec), dir = path.join(root, 'motions', spec.id);
    model.transitions.idleLeadInMs = 1280;
    model.transitions.idleLeadOutMs = 1280;
    for (const index of spec.reuseIdle || []) {
      const idleDir = path.join(root, 'motions/idle');
      const idle = JSON.parse(fs.readFileSync(path.join(idleDir, 'manifest.json'), 'utf8'));
      fs.copyFileSync(path.join(idleDir, idle.frames[0].file), path.join(dir, model.frames[index].file));
      model.frames[index] = { ...model.frames[index], bounds: idle.frames[0].bounds,
        sourceCell: idle.frames[0].sourceCell, sourceAnchor: idle.frames[0].sourceAnchor,
        source: idle.source, sourceScale: idle.sourceScale, bakedOffset: { x: 0, y: 0 }, reusedPose: 'idle/0' };
    }
    if (spec.gait) model.gait = spec.gait;
    if (spec.rootMotion) model.rootMotion = spec.rootMotion;
    if (spec.id === 'attack' && recipe.chargeRefinement) {
      model.poseRefinementSources = [recipe.chargeRefinement.original, recipe.chargeRefinement.edited].map(source => `../../${source}`);
    }
    await exportFrames(model, dir);
    if (spec.id === 'move') {
      model.generationSources = recipe.walkSources.map(source => `../../${source}`);
      if (recipe.walkRefinementSources) model.poseRefinementSources = recipe.walkRefinementSources.map(source => `../../${source}`);
      model.halves = [];
      const full = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
      for (const start of [0, 3]) {
        const half = new PNG({ width: model.frameWidth * 3, height: model.frameHeight });
        for (let y = 0; y < half.height; y++) half.data.set(full.data.subarray(
          (y * full.width + start * model.frameWidth) * 4,
          (y * full.width + (start + 3) * model.frameWidth) * 4), y * half.width * 4);
        const file = `boar-move-${String(start + 1).padStart(2, '0')}-${String(start + 3).padStart(2, '0')}.png`;
        fs.writeFileSync(path.join(dir, file), PNG.sync.write(half));
        model.halves.push({ file, firstFrame: start, frameCount: 3 });
      }
    }
    writeAssetJson(path.join(dir, 'manifest.json'), model);
    entries.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
  }
  writeAssetJson(path.join(root, 'motions/index.json'), entries);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildBoar: main };
