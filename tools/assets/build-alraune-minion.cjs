'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Register generated plant poses and reuse the boss's original seed pixels.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { pack, bounds } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const publicRoot = path.join(__dirname, '../../public');
const root = path.join(publicRoot, 'assets/enemies/alraune-minion');
const effectRoot = path.join(publicRoot, 'assets/effects/alraune-seed-stream');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, data) => writeAssetJson(file, data);

async function reuseIdle(dir, model) {
  const idleDir = path.join(root, 'motions/idle'), idle = json(path.join(idleDir, 'manifest.json'));
  const index = 3, from = idle.frames[0], target = model.frames[index];
  fs.copyFileSync(path.join(idleDir, from.file), path.join(dir, target.file));
  model.frames[index] = { ...target, bounds: from.bounds, source: idle.source,
    sourceCell: from.sourceCell, sourceAnchor: from.sourceAnchor, sourceScale: idle.sourceScale,
    bakedOffset: { x: 0, y: 0 }, reusedPose: 'idle/0' };
  const width = model.frameWidth, height = model.frameHeight, sheet = new PNG({ width: model.width, height });
  const gw = width * 2, gh = height * 2, raw = Buffer.alloc(gw * gh * model.frameCount * 4);
  for (const frame of model.frames) {
    const pose = PNG.sync.read(fs.readFileSync(path.join(dir, frame.file)));
    for (let y = 0; y < height; y++) sheet.data.set(pose.data.subarray(y * width * 4, (y + 1) * width * 4), (y * sheet.width + frame.x) * 4);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const p = (Math.floor(y / 2) * width + Math.floor(x / 2)) * 4;
      raw.set(pose.data.subarray(p, p + 4), ((frame.index * gh + y) * gw + x) * 4);
    }
  }
  fs.writeFileSync(path.join(dir, model.sheet), PNG.sync.write(sheet));
  await sharp(raw, { raw: { width: gw, height: gh * model.frameCount, channels: 4, pageHeight: gh } })
    .gif({ loop: model.loop ? 0 : 1, delay: model.frames.map(f => f.durationMs), colours: 256, dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 })
    .toFile(path.join(dir, model.preview));
}

function extractSeedStream() {
  makeAssetDirectory(path.join(effectRoot, 'source'), { recursive: true });
  const boss = PNG.sync.read(fs.readFileSync(path.join(publicRoot, 'assets/effects/alraune-seed-volley/alraune-seed-volley.png')));
  const row = new PNG({ width: boss.width, height: 50 });
  row.data.set(boss.data.subarray(0, boss.width * 50 * 4));
  fs.writeFileSync(path.join(effectRoot, 'source/alraune-seed-volley-top-stream.png'), PNG.sync.write(row));
  // A single seed is also available for games with individually moving bullets.
  const seen = new Uint8Array(row.width * row.height), components = [];
  for (let p = 0; p < seen.length; p++) {
    if (seen[p] || row.data[p * 4 + 3] < 192) continue;
    const queue = [p], points = []; seen[p] = 1;
    while (queue.length) {
      const k = queue.pop(), x = k % row.width, y = Math.floor(k / row.width); points.push(k);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, n = ny * row.width + nx;
        if (nx < 0 || nx >= row.width || ny < 0 || ny >= row.height || seen[n] || row.data[n * 4 + 3] < 192) continue;
        seen[n] = 1; queue.push(n);
      }
    }
    if (points.length > 30) components.push(points);
  }
  const points = components.sort((a, b) => Math.min(...a.map(p => p % row.width)) - Math.min(...b.map(p => p % row.width)))[0];
  const left = Math.min(...points.map(p => p % row.width)), top = Math.min(...points.map(p => Math.floor(p / row.width)));
  const single = new PNG({ width: 32, height: 24 });
  for (const p of points) {
    const x = p % row.width - left + 4, y = Math.floor(p / row.width) - top + 4;
    single.data.set(row.data.subarray(p * 4, p * 4 + 4), (y * single.width + x) * 4);
  }
  fs.writeFileSync(path.join(effectRoot, 'seed-single.png'), PNG.sync.write(single));
  return components.length;
}

async function main() {
  const seedCount = extractSeedStream(), recipe = json(path.join(root, 'layout.json')), entries = [];
  for (const spec of recipe.assets) {
    const model = await pack(spec), dir = path.join(publicRoot, spec.directory);
    if (spec.reuseIdle) await reuseIdle(dir, model);
    if (spec.projectilePreview) model.projectilePreview = spec.projectilePreview;
    if (spec.enemy) entries.push({ id: spec.id, label: spec.label, manifest: `${spec.id}/manifest.json` });
    else {
      model.facing = 'left'; model.generation = 'Exact RGBA extraction from the built-in image_gen Alraune seed volley; no repainting';
      model.projectileGroup = { seedCount, streams: 1, seedsPerStream: [seedCount], independentAsset: true,
        direction: { x: -1, y: 0 }, movement: 'Translate this single row of seeds horizontally left as one image.' };
      model.derivedFrom = { source: '../alraune-seed-volley/alraune-seed-volley.png', rectangle: { x: 0, y: 0, width: 320, height: 50 } };
      model.singleSeed = { file: 'seed-single.png', width: 32, height: 24, bounds: bounds(PNG.sync.read(fs.readFileSync(path.join(effectRoot, 'seed-single.png'))), 32) };
    }
    save(path.join(dir, 'manifest.json'), model);
  }
  save(path.join(root, 'motions/index.json'), entries);
  const effectsFile = path.join(publicRoot, 'assets/effects/index.json'), effects = json(effectsFile);
  const effect = recipe.assets.find(spec => !spec.enemy);
  save(effectsFile, [...effects.filter(item => item.id !== effect.id), { id: effect.id, label: effect.label, manifest: `${effect.id}/manifest.json` }]);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildAlrauneMinion: main };
