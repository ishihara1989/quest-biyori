'use strict';
const fs = require('node:fs'), path = require('node:path'), sharp = require('sharp'), assert = require('node:assert/strict');
const { developmentAsset } = require('../lib/project-paths.cjs');
async function buildPreview() {
  const base = developmentAsset('reincarnation-goddess/basic-v1');
  const clips = await Promise.all(['idle', 'move', 'hit', 'return'].map(async id => {
    const dir = path.join(base, 'motions', id), m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
    return { id, m, buffers: await Promise.all(m.frames.map(f => sharp(path.join(dir, f.file)).resize(384, 384, { kernel: 'nearest' }).png().toBuffer())) };
  }));
  const headings = await Promise.all(['IDLE / 4', 'FLOAT / 4', 'HIT / 3', 'RETURN / 6'].map(title => sharp(Buffer.from('<svg width="384" height="35"><text x="20" y="26" font-family="Arial" font-size="18" fill="#dec58c">' + title + '</text></svg>')).png().toBuffer()));
  const pages = [], delay = 80;
  for (let t = 0; t < 3360; t += delay) {
    const layers = [];
    for (const [i, clip] of clips.entries()) {
      const period = clip.m.loop ? clip.m.durationMs : clip.id === 'return' ? 3360 : 1120;
      const time = t % period; let remaining = Math.min(time, clip.m.durationMs - 1), frame = 0;
      while (frame < clip.m.frames.length - 1 && remaining >= clip.m.frames[frame].durationMs) { remaining -= clip.m.frames[frame].durationMs; frame++; }
      const x = (i % 2) * 384, y = Math.floor(i / 2) * 384;
      let input = clip.buffers[frame];
      if (clip.id === 'return' && time > clip.m.durationMs) {
        const p = Math.min(1, (time - clip.m.durationMs) / 650);
        const canvas = await sharp({ create: { width: 1152, height: 1152, channels: 4, background: '#00000000' } })
          .composite([{ input, left: 384 + Math.round(p * 500), top: 384 - Math.round(p * 180) }]).png().toBuffer();
        input = await sharp(canvas).extract({ left: 384, top: 384, width: 384, height: 384 }).png().toBuffer();
      }
      layers.push({ input, left: x, top: y }, { input: headings[i], left: x, top: y });
    }
    pages.push(await sharp({ create: { width: 768, height: 768, channels: 4, background: '#25283e' } }).composite(layers).raw().toBuffer());
  }
  const file = path.join(base, 'review/overview.gif');
  await sharp(Buffer.concat(pages), { raw: { width: 768, height: 768 * pages.length, channels: 4, pageHeight: 768 } })
    .gif({ delay, loop: 0, colours: 256, dither: 0, keepDuplicateFrames: true }).toFile(file);
  const m = await sharp(file, { animated: true }).metadata(); assert.equal(m.pages, pages.length); console.log(JSON.stringify({ overviewFrames: m.pages, width: m.width, pageHeight: m.pageHeight }));
}
if (require.main === module) buildPreview().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { buildPreview };
