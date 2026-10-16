'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Register generated poses; never draw, mirror or interpolate their anatomy.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { pack } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boss-boar');

async function exportFrames(model, dir) {
  const sheet = new PNG({ width: model.width, height: model.height });
  const width = model.frameWidth * 2, height = model.frameHeight * 2;
  const raw = Buffer.alloc(width * height * model.frameCount * 4);
  for (const frame of model.frames) {
    const image = PNG.sync.read(fs.readFileSync(path.join(dir, frame.file)));
    for (let y = 0; y < image.height; y++) sheet.data.set(image.data.subarray(y * image.width * 4,
      (y + 1) * image.width * 4), (y * sheet.width + frame.x) * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const p = (Math.floor(y / 2) * image.width + Math.floor(x / 2)) * 4;
      raw.set(image.data.subarray(p, p + 4), ((frame.index * height + y) * width + x) * 4);
    }
  }
  fs.writeFileSync(path.join(dir, model.sheet), PNG.sync.write(sheet));
  await sharp(raw, { raw: { width, height: height * model.frameCount, channels: 4, pageHeight: height } })
    .gif({ loop: model.loop ? 0 : 1, delay: model.frames.map(frame => frame.durationMs), colours: 256,
      dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(path.join(dir, model.preview));
}

async function main() {
  const recipe = JSON.parse(fs.readFileSync(path.join(root, 'layout.json'), 'utf8'));
  const walkRecords = recipe.walkRegistration ? require('./prepare-boss-boar-walk.cjs').prepareWalk(recipe) : null;
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
    if (spec.chargeTelegraph) model.chargeTelegraph = spec.chargeTelegraph;
    if (spec.rootMotion) model.rootMotion = spec.rootMotion;
    if (spec.reuseIdle?.length) await exportFrames(model, dir);
    if (spec.id === 'move' && walkRecords) {
      model.generationSources = recipe.walkSources.map(source => `../../${source}`);
      model.poseRefinementSources = recipe.walkRefinementSources.map(source => `../../${source}`);
      model.registration = '../../source/boss-boar-move-registration-v1.json';
      model.halves = [];
      const sheet = PNG.sync.read(fs.readFileSync(path.join(dir, model.sheet)));
      for (const start of [0, 3]) {
        const half = new PNG({ width: model.frameWidth * 3, height: model.frameHeight });
        for (let y = 0; y < half.height; y++) half.data.set(sheet.data.subarray(
          (y * sheet.width + start * model.frameWidth) * 4,
          (y * sheet.width + (start + 3) * model.frameWidth) * 4), y * half.width * 4);
        const file = `boss-boar-move-${String(start + 1).padStart(2, '0')}-${String(start + 3).padStart(2, '0')}.png`;
        fs.writeFileSync(path.join(dir, file), PNG.sync.write(half));
        model.halves.push({ file, firstFrame: start, frameCount: 3 });
      }
    }
    writeAssetJson(path.join(dir, 'manifest.json'), model);
    entries.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
  }
  writeAssetJson(path.join(root, 'motions/index.json'), entries);
  await buildReviews();
}

async function buildReviews() {
  const read = id => JSON.parse(fs.readFileSync(path.join(root, 'motions', id, 'manifest.json'), 'utf8'));
  const ids = ['idle', 'move', 'charge-windup', 'attack', 'hit', 'down'];
  const width = 2880, rowHeight = 352, layers = [], labels = [];
  for (const [row, id] of ids.entries()) {
    const model = read(id), top = row * rowHeight + 32;
    labels.push(`<text x="18" y="${row * rowHeight + 22}" fill="#cad3db" font-family="Segoe UI" font-size="16">${id.toUpperCase()} / ${model.frameCount} FRAMES / ${model.durationMs} ms</text>`);
    for (const frame of model.frames) layers.push({ input: path.join(root, 'motions', id, frame.file), left: frame.x, top });
  }
  const caption = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${rowHeight * ids.length}">${labels.join('')}</svg>`);
  await sharp({ create: { width, height: rowHeight * ids.length, channels: 4, background: '#20272d' } })
    .composite([{ input: caption, left: 0, top: 0 }, ...layers]).png().toFile(path.join(root, 'boss-boar-all-motions-qa.png'));
  const walk = read('move'), walkLayers = [], walkLabels = [];
  for (const frame of walk.frames) {
    const left = (frame.index % 3) * 480, top = Math.floor(frame.index / 3) * 352;
    walkLabels.push(`<text x="${left + 18}" y="${top + 22}" fill="#cad3db" font-family="Segoe UI" font-size="16">FRAME ${frame.index + 1} / ${frame.durationMs} ms</text>`);
    walkLabels.push(`<path d="M${left + 28} ${top + 335}h424" stroke="#43535e" stroke-dasharray="3 6"/>`);
    walkLayers.push({ input: path.join(root, 'motions/move', frame.file), left, top: top + 32 });
  }
  const walkCaption = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="704">${walkLabels.join('')}</svg>`);
  await sharp({ create: { width: 1440, height: 704, channels: 4, background: '#20272d' } })
    .composite([{ input: walkCaption, left: 0, top: 0 }, ...walkLayers]).png().toFile(path.join(root, 'boss-boar-move-halves-qa.png'));
  const windup = read('charge-windup'), windupLayers = [], windupLabels = [];
  for (const frame of windup.frames) {
    const left = (frame.index % 2) * 480, top = Math.floor(frame.index / 2) * 352;
    windupLabels.push(`<text x="${left + 18}" y="${top + 22}" fill="#cad3db" font-family="Segoe UI" font-size="16">${frame.index + 1} / ${frame.durationMs} ms</text>`);
    windupLabels.push(`<path d="M${left + 28} ${top + 335}h424" stroke="#43535e" stroke-dasharray="3 6"/>`);
    windupLayers.push({ input: path.join(root, 'motions/charge-windup', frame.file), left, top: top + 32 });
  }
  const windupCaption = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="704">${windupLabels.join('')}</svg>`);
  await sharp({ create: { width: 960, height: 704, channels: 4, background: '#20272d' } })
    .composite([{ input: windupCaption, left: 0, top: 0 }, ...windupLayers]).png().toFile(path.join(root, 'boss-boar-charge-windup-qa.png'));
  const sequence = [read('idle'), windup, windup, read('attack'), read('attack'), read('attack'), read('idle')];
  const frames = sequence.flatMap(model => model.frames.map(frame => ({ model, frame })));
  const raw = Buffer.alloc(960 * 640 * frames.length * 4);
  for (const [index, { model, frame }] of frames.entries()) {
    const pixels = await sharp(path.join(root, 'motions', model.motion, frame.file)).resize(960, 640, { kernel: 'nearest' }).raw().toBuffer();
    raw.set(pixels, index * 960 * 640 * 4);
  }
  await sharp(raw, { raw: { width: 960, height: 640 * frames.length, channels: 4, pageHeight: 640 } })
    .gif({ loop: 0, delay: frames.map(({ frame }) => frame.durationMs), colours: 256, dither: 0,
      keepDuplicateFrames: true, interFrameMaxError: 0 }).toFile(path.join(root, 'boss-boar-windup-attack-preview.gif'));
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildBossBoar: main };
