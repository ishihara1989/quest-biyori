'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Register and package generated RGBA pixels. No redraw or recoloring.
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const assert = require('node:assert/strict');
const runtimeModules = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', {
  paths: [__dirname, process.env.NODE_PATH, runtimeModules].filter(Boolean),
}));
const labels = { mage: '魔法使い', paladin: 'パラディン', ninja: '忍者', shaman: '呪術師', miko: '巫女' };

function buildCharacter(character) {
  assert.ok(labels[character], 'Choose mage, paladin, ninja, shaman, or miko');
  const directory = path.join(__dirname, '../../public/assets', character);
  const sourceName = `source/${character}-idle-generated-v1.png`;
  const source = PNG.sync.read(fs.readFileSync(path.join(directory, sourceName)));
  const cell = 160, pivot = { x: 76, y: 151 };
  // Generated grids can place the horizontal gutter a few pixels away from
  // exactly half height. Use the center of the widest transparent band near
  // the midpoint, so upper soles cannot leak into the lower frames.
  let longestGap = null, gapStart = null;
  const scanStart = Math.floor(source.height * .45), scanEnd = Math.ceil(source.height * .55);
  for (let y = scanStart; y <= scanEnd + 1; y++) {
    let occupied = y > scanEnd;
    if (!occupied) for (let x = 0; x < source.width; x++) {
      if (source.data[(y * source.width + x) * 4 + 3] >= 32) { occupied = true; break; }
    }
    if (!occupied && gapStart === null) gapStart = y;
    if (occupied && gapStart !== null) {
      if (!longestGap || y - gapStart > longestGap.end - longestGap.start) longestGap = { start: gapStart, end: y };
      gapStart = null;
    }
  }
  const rowSplit = longestGap ? Math.floor((longestGap.start + longestGap.end) / 2) : Math.round(source.height / 2);
  const rowStops = [0, rowSplit, source.height];
  const poses = Array.from({ length: 4 }, (_, index) => {
    const column = index % 2, row = Math.floor(index / 2);
    const x = Math.round(column * source.width / 2), y = rowStops[row];
    const width = Math.round((column + 1) * source.width / 2) - x;
    const height = rowStops[row + 1] - y;
    const alphaAt = (sx, sy) => source.data[((y + sy) * source.width + x + sx) * 4 + 3];
    const bounds = { left: width, top: height, right: -1, bottom: -1 };
    for (let sy = 0; sy < height; sy++) for (let sx = 0; sx < width; sx++) {
      if (alphaAt(sx, sy) < 128) continue;
      bounds.left = Math.min(bounds.left, sx); bounds.right = Math.max(bounds.right, sx);
      bounds.top = Math.min(bounds.top, sy); bounds.bottom = Math.max(bounds.bottom, sy);
    }
    assert.ok(bounds.right > bounds.left && bounds.bottom > bounds.top, `Frame ${index + 1} contains a character`);
    assert.ok(bounds.left > 0 && bounds.top > 0 && bounds.right < width - 1 && bounds.bottom < height - 1,
      `Source frame ${index + 1} must contain the entire silhouette; regenerate clipped art`);
    let footLeft = width, footRight = -1;
    for (let sy = Math.max(0, bounds.bottom - 35); sy <= bounds.bottom; sy++) for (let sx = 0; sx < width; sx++) {
      if (alphaAt(sx, sy) < 128) continue;
      footLeft = Math.min(footLeft, sx); footRight = Math.max(footRight, sx);
    }
    return { index, x, y, width, height, bounds, anchor: {
      x: Math.round((footLeft + footRight) / 2), y: bounds.bottom,
    } };
  });
  // Use one common scale for all four poses. Tall hats, wide sleeves, and staff
  // tops must fit without independently changing each pose's proportions.
  const scale = Math.min(...poses.flatMap(pose => [
    140 / (pose.bounds.bottom - pose.bounds.top),
    68 / Math.max(1, pose.anchor.x - pose.bounds.left),
    75 / Math.max(1, pose.bounds.right - pose.anchor.x),
  ]));
  const sheet = new PNG({ width: cell * 4, height: cell });
  const frames = [];
  function sample(pose, anchorY) {
    const sprite = new PNG({ width: cell, height: cell });
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
      const sx = Math.round(pose.anchor.x + (x - pivot.x) / scale);
      const sy = Math.round(anchorY + (y - pivot.y) / scale);
      if (sx < 0 || sy < 0 || sx >= pose.width || sy >= pose.height) continue;
      const offset = ((pose.y + sy) * source.width + pose.x + sx) * 4;
      sprite.data.set(source.data.subarray(offset, offset + 4), (y * cell + x) * 4);
    }
    return sprite;
  }
  for (const pose of poses) {
    let sprite, anchorY, ground = -1;
    for (let offset = 0; offset < Math.ceil(1 / scale); offset++) {
      anchorY = pose.anchor.y - offset;
      sprite = sample(pose, anchorY); ground = -1;
      for (let i = 0; i < cell * cell; i++) if (sprite.data[i * 4 + 3] >= 128) {
        ground = Math.max(ground, Math.floor(i / cell));
      }
      if (ground === pivot.y) break;
    }
    assert.equal(ground, pivot.y, `Frame ${pose.index + 1} shares the same ground pixel`);
    let transparent = 0, visible = 0;
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
      const offset = (y * cell + x) * 4, alpha = sprite.data[offset + 3];
      if (alpha === 0) transparent++;
      if (alpha >= 128) visible++;
      if (x === 0 || x === cell - 1 || y === 0 || y === cell - 1) {
        assert.ok(alpha < 128, `Frame ${pose.index + 1} has a transparent silhouette margin`);
      }
      sheet.data.set(sprite.data.subarray(offset, offset + 4), (y * sheet.width + pose.index * cell + x) * 4);
    }
    assert.ok(transparent > cell * cell * .4, 'Real transparent background');
    assert.ok(visible > 2000, 'Character remains readable after downsampling');
    const file = `idle-${String(pose.index + 1).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(directory, file), PNG.sync.write(sprite));
    frames.push({ index: pose.index, file, x: pose.index * cell, y: 0, width: cell, height: cell,
      durationMs: 400, sourceCell: { x: pose.x, y: pose.y, width: pose.width, height: pose.height },
      sourceAnchor: { x: pose.anchor.x, y: anchorY }, sourceBounds: pose.bounds,
      visiblePixels: visible, transparentPixels: transparent });
  }
  const data = frames.map(frame => PNG.sync.read(fs.readFileSync(path.join(directory, frame.file))).data);
  for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
    assert.notDeepEqual(data[i], data[j], 'Each of the four frames has distinct generated pixels');
  }
  const file = `${character}-idle.png`;
  fs.writeFileSync(path.join(directory, file), PNG.sync.write(sheet));
  const manifest = { version: 1, character, label: labels[character], motion: 'idle', facing: 'right',
    sheet: file, width: cell * 4, height: cell, columns: 4, rows: 1, frameWidth: cell, frameHeight: cell,
    frameCount: 4, frameSequence: [0, 1, 2, 3], durationMs: 1600, pivot,
    sampling: 'nearest-neighbor', source: sourceName, sourceWidth: source.width,
    sourceHeight: source.height, sourceGrid: [2, 2], rowSplit, scale,
    generation: 'built-in image_gen; character design and approved warrior style references; prompt in PROMPT.md',
    notes: 'Generated RGBA samples preserved. Feet registered at a shared pivot; one common scale per animation. Minor generated contour variation remains.', frames };
  writeAssetJson(path.join(directory, 'manifest.json'), manifest);
  console.log(JSON.stringify({ character, sheet: '640 × 160 RGBA', frameCount: 4,
    scale, groundY: pivot.y, checks: 'alpha, margins, distinct frames, shared ground: passed' }));
  return manifest;
}
if (require.main === module) buildCharacter(process.argv[2]);
module.exports = { buildCharacter };
