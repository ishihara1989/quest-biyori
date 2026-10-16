'use strict';
const fs = require('node:fs'), path = require('node:path'), sharp = require('sharp');
const { runtimeAsset, developmentAsset, makeAssetDirectory, writeAssetJson } = require('../lib/project-paths.cjs');
const source = developmentAsset('ui/gems/source/status-resistance-v1.png');
const target = runtimeAsset('ui/gems/status-resistance.png');
async function build() {
  makeAssetDirectory(path.dirname(source));
  makeAssetDirectory(path.dirname(target));
  if (process.argv[2]) fs.copyFileSync(path.resolve(process.argv[2]), source);
  if (!(await sharp(source).metadata()).hasAlpha) throw Error('Transparent source required');
  const icon = await sharp(source).trim({ threshold: 5 }).resize(112, 112, { fit: 'inside', kernel: 'nearest' }).png().toBuffer();
  await sharp({ create: { width: 128, height: 128, channels: 4, background: '#00000000' } })
    .composite([{ input: icon, gravity: 'centre' }]).png().toFile(target);
  const { data } = await sharp(target).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let pixels = 0;
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const alpha = data[(y * 128 + x) * 4 + 3];
    if ((x < 8 || x >= 120 || y < 8 || y >= 120) && alpha) throw Error('Clipped icon');
    if (alpha > 32) pixels++;
  }
  if (pixels < 1000) throw Error('Empty icon');
  writeAssetJson(developmentAsset('ui/gems/status-resistance-generation.json'), {
    date: '2026-10-16', generator: 'built-in image_gen', transparentBackground: true,
    source: 'source/status-resistance-v1.png', runtime: '../../../../public/assets/ui/gems/status-resistance.png',
    prompt: 'Create one premium fantasy idle RPG item icon, single centered status ailment resistance gemstone. Crisp hand-placed pixel art aesthetic, a luminous jade-green faceted crystal enclosed in a substantial ornate gold shield-shaped setting, small violet poison sparks and icy blue shards repelled outward from a clear protective emerald halo. Readable large crystal and shield silhouette at 48 pixels, restrained tiny details, dark green facet shadows, vivid mint highlights, gold glints. Front view, entire icon within central 75% of square, ample empty transparent padding. Actual transparent background, no floor, no text, no letters, no numbers, no border frame, no UI. One icon only. Match detailed colorful pixel-art fantasy gem inventory icons.',
    review: { staticIcon: true, size: [128, 128], transparentMargin: 8, occupiedPixels: pixels }
  });
  console.log('Registered status resistance gem: transparent 128px icon with 8px margins');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
