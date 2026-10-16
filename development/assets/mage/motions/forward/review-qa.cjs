'use strict';
// Only crops/composites installed pixels for visual QA; does not redraw a pose.
const fs = require('node:fs'), path = require('node:path');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', {paths: [__dirname, bundled]}));
async function run() {
  for (const motion of ['forward', 'backward']) {
    const dir = path.resolve(__dirname, '../', motion);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    const full = [], legs = [], ids = [0, 2, 4, 6, 7];
    for (const f of manifest.frames) {
      const input = await sharp(path.join(dir, f.file)).resize(512, 448, {kernel: 'nearest'}).png().toBuffer();
      full.push({input, left: f.index % 4 * 512, top: Math.floor(f.index / 4) * 472 + 24});
    }
    const labels = Buffer.from('<svg width="2048" height="944" xmlns="http://www.w3.org/2000/svg">' + manifest.frames.map(f => `<text x="${f.index % 4 * 512 + 12}" y="${Math.floor(f.index / 4) * 472 + 19}" font-family="sans-serif" font-size="17" fill="#e5c899">${f.index + 1} ${f.phase}</text>`).join('') + '</svg>');
    full.push({input: labels, top: 0, left: 0});
    await sharp({create: {width: 2048, height: 944, channels: 4, background: '#15171c'}}).composite(full).png().toFile(path.join(dir, `mage-${motion}-qa.png`));
    for (let n = 0; n < ids.length; n++) {
      const input = await sharp(path.join(dir, manifest.frames[ids[n]].file)).extract({left: 65, top: 143, width: 140, height: 68}).resize(560, 272, {kernel: 'nearest'}).png().toBuffer();
      legs.push({input, top: 24, left: n * 560});
    }
    legs.push({input: Buffer.from('<svg width="2800" height="296" xmlns="http://www.w3.org/2000/svg">' + ids.map((id, n) => `<text x="${n * 560 + 12}" y="18" font-family="sans-serif" font-size="17" fill="#e5c899">Frame ${id + 1}: L near / R far</text>`).join('') + '</svg>'), top: 0, left: 0});
    await sharp({create: {width: 2800, height: 296, channels: 4, background: '#15171c'}}).composite(legs).png().toFile(path.join(dir, `mage-${motion}-leg-qa.png`));
  }
}
run().catch(e => {console.error(e); process.exitCode = 1;});
