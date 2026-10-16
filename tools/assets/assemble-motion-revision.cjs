'use strict';
// Repack selected generated poses. Unchanged cells retain their exact pixels.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, process.env.NODE_PATH, bundled].filter(Boolean) }));
const planPath = path.resolve(process.argv[2]);
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const base = path.dirname(planPath), cellWidth = plan.cellWidth, cellHeight = plan.cellHeight;
assert.equal(plan.frames.length, 4);
const output = new PNG({ width: cellWidth * 2, height: cellHeight * 2 });
for (let index = 0; index < plan.frames.length; index++) {
  const frame = plan.frames[index], source = PNG.sync.read(fs.readFileSync(path.resolve(base, frame.source)));
  const rect = frame.rect, anchor = frame.sourceAnchor, destination = frame.destinationAnchor;
  const ratio = frame.scale ?? 1;
  assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= source.width && rect.y + rect.height <= source.height);
  const left = index % 2 * cellWidth, top = Math.floor(index / 2) * cellHeight;
  let visible = 0;
  for (let y = 0; y < cellHeight; y++) for (let x = 0; x < cellWidth; x++) {
    const sx = Math.round(anchor.x + (x - destination.x) / ratio);
    const sy = Math.round(anchor.y + (y - destination.y) / ratio);
    if (sx < 0 || sy < 0 || sx >= rect.width || sy >= rect.height) continue;
    const src = ((rect.y + sy) * source.width + rect.x + sx) * 4;
    if (source.data[src + 3] >= 32) {
      assert.ok(x > 1 && x < cellWidth - 2 && y > 1 && y < cellHeight - 2, 'Selected pose fits completely inside its cell');
      visible++;
    }
    output.data.set(source.data.subarray(src, src + 4), ((top + y) * output.width + left + x) * 4);
  }
  assert.ok(visible > 1000, 'Every cell contains a complete generated pose');
}
fs.writeFileSync(path.resolve(base, plan.output), PNG.sync.write(output));
console.log(JSON.stringify({ output: path.resolve(base, plan.output), size: [output.width, output.height], frames: 4 }));
