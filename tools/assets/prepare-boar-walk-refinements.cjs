'use strict';
// Mechanical registration of generated poses. Never paint, interpolate, or mirror limbs.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { bounds } = require('./build-treant.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, bundled] }));
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boar/source');
const poses = [
  { file: 'boar-move-01-03-generated-v3.png', cell: 0 },
  { file: 'boar-move-frame2-generated-v1.png' },
  { file: 'boar-move-frame3-generated-v1.png', lift: 8 },
  { file: 'boar-move-frame4-generated-v1.png' },
  { file: 'boar-move-frame5-generated-v1.png' },
  { file: 'boar-move-04-06-generated-v4.png', cell: 2 }
];
async function main() {
  const registered = [];
  for (const pose of poses) {
    const source = PNG.sync.read(fs.readFileSync(path.join(root, pose.file)));
    const crop = pose.cell === undefined ? source : new PNG({ width: 512, height: 1024 });
    if (pose.cell !== undefined) for (let y = 0; y < 1024; y++) {
      crop.data.set(source.data.subarray((y * source.width + pose.cell * 512) * 4,
        (y * source.width + (pose.cell + 1) * 512) * 4), y * 512 * 4);
    }
    // Remove only the low-alpha matte already rejected by the sprite packer.
    for (let i = 3; i < crop.data.length; i += 4) if (crop.data[i] < 192) crop.data.fill(0, i - 3, i + 1);
    const b = bounds(crop), width = b.right - b.left + 1, height = b.bottom - b.top + 1;
    const resizedHeight = Math.round(height * 484 / width);
    const pixels = await sharp(PNG.sync.write(crop)).extract({ left: b.left, top: b.top, width, height })
      .resize(484, resizedHeight, { kernel: 'nearest' }).png().toBuffer();
    const top = 700 - (pose.lift || 0) - resizedHeight + 1;
    registered.push({ input: pixels, left: 14, top });
    console.log(JSON.stringify({ file: pose.file, bounds: b, resize: [484, resizedHeight], top }));
  }
  for (const [group, name] of ['boar-move-01-03-refined-v1.png', 'boar-move-04-06-refined-v1.png'].entries()) {
    await sharp({ create: { width: 1536, height: 1024, channels: 4, background: '#00000000' } })
      .composite(registered.slice(group * 3, group * 3 + 3).map((pose, cell) => ({ ...pose, left: pose.left + cell * 512 })))
      .png().toFile(path.join(root, name));
  }
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { prepareWalkRefinements: main };
