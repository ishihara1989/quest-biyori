'use strict';
// Review exported artwork and composite the same deterministic projectile preview.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { sample } = require('../../public/js/core/motion-playback.js');
const { visibleAt, viewport, stripsAt } = require('../../development/labs/js/enemy-projectiles.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const assets = path.join(__dirname, '../../public/assets'), root = path.join(assets, 'enemies/alraune-minion');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const png = file => PNG.sync.read(fs.readFileSync(file));
async function main() {
  const ids = ['idle', 'move', 'hit', 'down', 'attack'];
  const layers = ids.map((id, i) => ({ input: path.join(root, 'motions', id, `alraune-minion-${id}.png`), top: i * 224, left: 0 }));
  await sharp({ create: { width: 1280, height: 1120, channels: 4, background: '#18251f' } }).composite(layers).png().toFile(path.join(root, 'alraune-minion-all-motions-qa.png'));
  const load = id => { const dir = path.join(root, 'motions', id), model = json(path.join(dir, 'manifest.json')); return { model, sheet: png(path.join(dir, model.sheet)) }; };
  const idle = load('idle'), attack = load('attack');
  const effectDir = path.join(assets, 'effects/alraune-seed-stream'), effect = json(path.join(effectDir, 'manifest.json'));
  const seeds = png(path.join(effectDir, effect.sheet));
  const view = viewport({ width: 320, height: 224, pivot: attack.model.pivot }, attack.model.projectilePreview);
  const count = 40, delay = 50, raw = Buffer.alloc(view.width * view.height * count * 4);
  for (let i = 0; i < count; i++) {
    const elapsed = i * delay, result = sample(attack.model, idle.model, elapsed);
    const active = result.motion === 'idle' ? idle : attack, f = active.model.frames[result.frame];
    const frame = new PNG({ width: view.width, height: view.height });
    for (let y = 0; y < f.height; y++) frame.data.set(active.sheet.data.subarray((y * active.sheet.width + f.x) * 4, (y * active.sheet.width + f.x + f.width) * 4), (y * view.width + 240) * 4);
    for (const entity of visibleAt(attack.model, elapsed)) for (const strip of stripsAt(entity, attack.model, effect, view)) {
      const s = strip.source, d = strip.destination;
      for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) {
        const dx = d.x + x, dy = d.y + y;
        if (dx < 0 || dx >= strip.clip.width || dx >= view.width || dy < 0 || dy >= view.height) continue;
        const p = ((s.y + y) * seeds.width + s.x + x) * 4;
        if (seeds.data[p + 3]) frame.data.set(seeds.data.subarray(p, p + 4), (dy * view.width + dx) * 4);
      }
    }
    raw.set(frame.data, i * view.width * view.height * 4);
    if (i === 8) fs.writeFileSync(path.join(root, 'alraune-minion-attack-with-seeds-qa.png'), PNG.sync.write(frame));
  }
  await sharp(raw, { raw: { width: view.width, height: view.height * count, channels: 4, pageHeight: view.height } })
    .gif({ loop: 0, delay: Array(count).fill(delay), colours: 256, dither: 0, keepDuplicateFrames: true, interFrameMaxError: 0 })
    .toFile(path.join(root, 'alraune-minion-attack-with-seeds-preview.gif'));
  console.log('Review sheet and 40-frame attack/projectile GIF saved.');
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildAlrauneMinionReview: main };
