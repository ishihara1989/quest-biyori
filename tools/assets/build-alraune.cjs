'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Crop/register generated poses and retain the whip's translucent afterimages.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { pack } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const publicRoot = path.join(__dirname, '../../public');
const root = path.join(publicRoot, 'assets/enemies/alraune');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, data) => writeAssetJson(file, data);

async function refreshExports(dir, model) {
  const width = model.frameWidth, height = model.frameHeight;
  const sheet = new PNG({ width: model.width, height });
  const gw = width * 2, gh = height * 2, raw = Buffer.alloc(gw * gh * model.frameCount * 4);
  for (const frame of model.frames) {
    const image = PNG.sync.read(fs.readFileSync(path.join(dir, frame.file)));
    for (let y = 0; y < height; y++) sheet.data.set(image.data.subarray(y * width * 4, (y + 1) * width * 4), (y * sheet.width + frame.x) * 4);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const p = (Math.floor(y / 2) * width + Math.floor(x / 2)) * 4;
      raw.set(image.data.subarray(p, p + 4), ((frame.index * gh + y) * gw + x) * 4);
    }
  }
  fs.writeFileSync(path.join(dir, model.sheet), PNG.sync.write(sheet));
  await sharp(raw, { raw: { width: gw, height: gh * model.frameCount, channels: 4, pageHeight: gh } })
    .gif({ loop: model.loop ? 0 : 1, delay: model.frames.map(f => f.durationMs), colours: 256, dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 })
    .toFile(path.join(dir, model.preview));
}
async function main() {
  const recipe = json(path.join(root, 'layout.json')), motions = [], effects = [];
  for (const spec of recipe.assets) {
    const model = await pack(spec), dir = path.join(publicRoot, spec.directory);
    if (spec.projectilePreview) model.projectilePreview = spec.projectilePreview;
    for (const index of spec.reuseIdle || []) {
      const idleDir = path.join(root, 'motions/idle'), idle = json(path.join(idleDir, 'manifest.json'));
      fs.copyFileSync(path.join(idleDir, idle.frames[0].file), path.join(dir, model.frames[index].file));
      model.frames[index] = { ...model.frames[index], bounds: idle.frames[0].bounds,
        source: idle.source, sourceCell: idle.frames[0].sourceCell, sourceAnchor: idle.frames[0].sourceAnchor,
        sourceScale: idle.sourceScale, bakedOffset: { x: 0, y: 0 }, reusedPose: 'idle/0' };
    }
    if (spec.reuseIdle?.length) await refreshExports(dir, model);
    if (spec.enemy) motions.push({ id: spec.id, label: spec.label, manifest: spec.id + '/manifest.json' });
    else {
      model.facing = 'left';
      model.projectileGroup = { seedCount: 25, streams: 3, seedsPerStream: [8, 9, 8], independentAsset: true,
        direction: { x: -1, y: 0 }, movement: 'Translate the entire PNG in world coordinates; no per-seed sprites required.' };
      effects.push({ id: spec.id, label: spec.label, manifest: spec.id + '/manifest.json' });
    }
    save(path.join(dir, 'manifest.json'), model);
    const gif = await sharp(path.join(dir, model.preview), { animated: true }).metadata();
    assert.equal(gif.pages || 1, model.frameCount);
  }
  save(path.join(root, 'motions/index.json'), motions);
  const effectIndex = path.join(publicRoot, 'assets/effects/index.json');
  const retained = json(effectIndex).filter(entry => !effects.some(effect => effect.id === entry.id));
  save(effectIndex, [...retained, ...effects]);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildAlraune: main };
