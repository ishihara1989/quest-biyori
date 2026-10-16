'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { characters, getMotionSpecs } = require('./motion-specs.cjs');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, process.env.NODE_PATH, bundled].filter(Boolean) }));

function boundsOf(image) {
  const bounds = { left: image.width, top: image.height, right: -1, bottom: -1 };
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    if (image.data[(y * image.width + x) * 4 + 3] < 128) continue;
    bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
    bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y);
  }
  return bounds;
}
function transparentSplit(image, axis) {
  const length = axis === 'x' ? image.width : image.height;
  const cross = axis === 'x' ? image.height : image.width;
  let start = null, best = null;
  const low = Math.floor(length * .43), high = Math.ceil(length * .57);
  for (let position = low; position <= high + 1; position++) {
    let occupied = position > high;
    if (!occupied) for (let other = 0; other < cross; other++) {
      const x = axis === 'x' ? position : other, y = axis === 'x' ? other : position;
      if (image.data[(y * image.width + x) * 4 + 3] >= 32) { occupied = true; break; }
    }
    if (!occupied && start === null) start = position;
    if (occupied && start !== null) {
      if (!best || position - start > best.end - best.start) best = { start, end: position };
      start = null;
    }
  }
  return best ? Math.floor((best.start + best.end) / 2) : Math.round(length / 2);
}
function buildMotion(character, motion) {
  const specs = getMotionSpecs(character);
  assert.ok(characters.includes(character)); assert.ok(specs[motion]);
  const spec = specs[motion];
  const characterDirectory = path.join(__dirname, '../../public/assets', character);
  const directory = path.join(characterDirectory, 'motions', motion);
  const configPath = path.join(directory, 'layout.json');
  const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
  const sourceName = config.source || `source/${character}-${motion}-generated-v1.png`;
  const sourcePath = path.resolve(directory, sourceName);
  assert.ok(require('../lib/project-paths.cjs').inside(require('../lib/project-paths.cjs').DEVELOPMENT, sourcePath), 'Source must stay inside development/assets');
  const source = PNG.sync.read(fs.readFileSync(sourcePath));
  const columns = config.columns || spec.columns, rows = config.rows || spec.rows;
  assert.ok(Number.isInteger(columns) && columns > 0 && Number.isInteger(rows) && rows > 0);
  assert.ok(columns * rows >= spec.frameCount, 'Source grid must contain every pose');
  const xSplit = config.columnSplit ?? transparentSplit(source, 'x');
  const ySplit = config.rowSplit ?? transparentSplit(source, 'y');
  const xs = columns === 2 ? [0, xSplit, source.width] : Array.from({length: columns + 1}, (_, i) => Math.round(i * source.width / columns));
  const ys = rows === 2 ? [0, ySplit, source.height] : Array.from({length: rows + 1}, (_, i) => Math.round(i * source.height / rows));
  const poses = Array.from({ length: spec.frameCount }, (_, index) => {
    const column = index % columns, row = Math.floor(index / columns);
    const rect = config.frames?.[index]?.rect || { x: xs[column], y: ys[row], width: xs[column + 1] - xs[column], height: ys[row + 1] - ys[row] };
    assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= source.width && rect.y + rect.height <= source.height);
    const image = new PNG({ width: rect.width, height: rect.height });
    for (let y = 0; y < image.height; y++) image.data.set(source.data.subarray(
      ((rect.y + y) * source.width + rect.x) * 4, ((rect.y + y) * source.width + rect.x + rect.width) * 4), y * image.width * 4);
    const bounds = boundsOf(image);
    assert.ok(bounds.right > bounds.left && bounds.bottom > bounds.top, `Missing ${motion} pose ${index + 1}`);
    assert.ok(bounds.left > 0 && bounds.top > 0 && bounds.right < image.width - 1 && bounds.bottom < image.height - 1,
      `Source ${motion} pose ${index + 1} touches a cell edge; inspect/regenerate clipped art`);
    let left = image.width, right = -1;
    for (let y = Math.max(0, bounds.bottom - 35); y <= bounds.bottom; y++) for (let x = 0; x < image.width; x++) {
      if (image.data[(y * image.width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x); right = Math.max(right, x);
    }
    return { index, image, rect, bounds, anchor: { x: Math.round((left + right) / 2), y: bounds.bottom } };
  });
  if (motion === 'down') poses.forEach(pose => { pose.anchor.x = poses[0].anchor.x; });
  poses.forEach(pose => Object.assign(pose.anchor, config.frames?.[pose.index]?.anchor || {}));
  const idle = PNG.sync.read(fs.readFileSync(path.join(characterDirectory, 'idle-01.png')));
  const idleBounds = boundsOf(idle);
  const sizingIndex = config.sizingFrame ?? (motion === 'jump' ? 1 : motion === 'down' ? 0 : null);
  const referenceHeight = sizingIndex === null ? Math.max(...poses.map(pose => pose.bounds.bottom - pose.bounds.top))
    : poses[sizingIndex].bounds.bottom - poses[sizingIndex].bounds.top;
  const scale = config.scale ?? ((idleBounds.bottom - idleBounds.top) * spec.sizingFactor / referenceHeight);
  assert.ok(Number.isFinite(scale) && scale > 0 && scale < 4);
  const width = spec.frameWidth || 256, height = spec.frameHeight || 224, pivot = spec.pivot || { x: 128, y: 207 };
  // One common scale per motion preserves anatomy across all poses. The wider
  // canvas accommodates prone bodies without shrinking individual frames.
  const sheet = new PNG({ width: width * spec.frameCount, height });
  const outputFrames = [];
  function sample(pose, anchorY) {
    const output = new PNG({ width, height });
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const sx = Math.round(pose.anchor.x + (x - pivot.x) / scale);
      const sy = Math.round(anchorY + (y - pivot.y) / scale);
      if (sx < 0 || sy < 0 || sx >= pose.image.width || sy >= pose.image.height) continue;
      const offset = (sy * pose.image.width + sx) * 4;
      output.data.set(pose.image.data.subarray(offset, offset + 4), (y * width + x) * 4);
    }
    return output;
  }
  for (const pose of poses) {
    let output, anchorY, bounds;
    if (config.anchorBasis === 'feet') {
      // An attack's sword or trail may extend below the soles. Keep the
      // reviewed foot anchor rather than aligning the lowest weapon pixel.
      anchorY = pose.anchor.y; output = sample(pose, anchorY); bounds = boundsOf(output);
      assert.ok(Array.from({ length: width }, (_, x) => output.data[(pivot.y * width + x) * 4 + 3]).some(alpha => alpha >= 128),
        'Reviewed feet remain visible on the common baseline');
    } else {
      for (let offset = 0; offset < Math.ceil(1 / scale); offset++) {
        anchorY = pose.anchor.y - offset; output = sample(pose, anchorY); bounds = boundsOf(output);
        if (bounds.bottom === pivot.y) break;
      }
      assert.equal(bounds.bottom, pivot.y, 'Pose local anchor lies on the common baseline');
    }
    assert.ok(bounds.left >= 3 && bounds.top >= 3 && bounds.right <= width - 4 && bounds.bottom <= height - 4, 'Complete output silhouette has margin');
    // Check transformed source bounds as well: a cropped output can otherwise
    // appear to pass when a long weapon has already gone outside the canvas.
    assert.ok(pivot.x + (pose.bounds.left - pose.anchor.x) * scale > 1 &&
      pivot.x + (pose.bounds.right - pose.anchor.x) * scale < width - 2 &&
      pivot.y + (pose.bounds.top - anchorY) * scale > 1 &&
      pivot.y + (pose.bounds.bottom - anchorY) * scale < height - 2, 'Output cannot clip source anatomy or equipment');
    const connection = config.frames?.[pose.index]?.connectionSource;
    if (connection) {
      assert.ok(specs[connection.motion], 'Connection must use another character motion');
      const connectionDirectory = path.join(characterDirectory, 'motions', connection.motion);
      const connectedManifest = JSON.parse(fs.readFileSync(path.join(connectionDirectory, 'manifest.json'), 'utf8'));
      assert.ok(connectedManifest.frames[connection.frame]);
      output = PNG.sync.read(fs.readFileSync(path.join(connectionDirectory, connectedManifest.frames[connection.frame].file)));
      assert.equal(output.width, width); assert.equal(output.height, height);
      bounds = boundsOf(output);
    }
    let transparent = 0, visible = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      if (output.data[offset + 3] === 0) transparent++;
      if (output.data[offset + 3] >= 128) visible++;
      sheet.data.set(output.data.subarray(offset, offset + 4), (y * sheet.width + pose.index * width + x) * 4);
    }
    assert.ok(visible > 800 && transparent > width * height * .45);
    const file = `${motion}-${String(pose.index + 1).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(directory, file), PNG.sync.write(output));
    outputFrames.push({ index: pose.index, file, x: pose.index * width, y: 0, width, height,
      durationMs: spec.durations[pose.index], phase: spec.phases[pose.index],
      airborne: spec.airborneFrames?.includes(pose.index) || false,
      previewOffset: { x: 0, y: -(spec.previewLift?.[pose.index] || 0) },
      sourceCell: pose.rect, sourceAnchor: { x: pose.anchor.x, y: anchorY },
      sourceBounds: pose.bounds, bounds, visiblePixels: visible, transparentPixels: transparent });
    if (connection) outputFrames[outputFrames.length - 1].connectionSource = connection;
  }
  for (let i = 0; i < outputFrames.length; i++) for (let j = i + 1; j < outputFrames.length; j++) {
    assert.notDeepEqual(PNG.sync.read(fs.readFileSync(path.join(directory, outputFrames[i].file))).data,
      PNG.sync.read(fs.readFileSync(path.join(directory, outputFrames[j].file))).data, 'Distinct generated poses');
  }
  const sheetName = `${character}-${motion}.png`;
  fs.writeFileSync(path.join(directory, sheetName), PNG.sync.write(sheet));
  const manifest = { version: 1, character, motion, label: spec.label, facing: 'right', sheet: sheetName,
    width: sheet.width, height, columns: spec.frameCount, rows: 1, frameWidth: width, frameHeight: height,
    frameCount: spec.frameCount, frameSequence: outputFrames.map(frame => frame.index),
    durationMs: spec.durations.reduce((sum, value) => sum + value, 0), loop: spec.loop,
    terminal: Boolean(spec.terminal), transitions: spec.transitions || { from: 'idle', to: spec.terminal ? null : 'idle' },
    movementDirection: spec.movementDirection || 0, pivot, scale, sampling: 'nearest-neighbor',
    anchorBasis: config.anchorBasis || 'silhouette',
    source: sourceName, sourceWidth: source.width, sourceHeight: source.height,
    sourceGrid: [columns, rows], columnSplit: xSplit, rowSplit: rows === 2 ? ySplit : null,
    generation: 'built-in image_gen; approved idle design/style references; full prompts in PROMPT.md',
    previewNotes: character === 'mage' && ['attack-staff', 'chant', 'cast-forward', 'cast-forward-hold', 'cast-up', 'cast-up-hold'].includes(motion)
      ? 'Draw at the shared ground pivot. Independent wind PNG effects live under assets/effects; connectionSource marks identical boundary poses.'
      : motion.startsWith('attack-')
      ? 'Sword afterimages and depth turns are included in PNG frames. Draw at the common ground pivot without additional rotation or effects.'
      : 'Jump previewOffset is for the review viewer only. Use world jump physics and the common pivot when integrating into a game.',
    frames: outputFrames };
  writeAssetJson(path.join(directory, 'manifest.json'), manifest);
  const motionIndex = { character, idle: '../manifest.json', motions: {} };
  for (const id of Object.keys(specs)) if (fs.existsSync(path.join(characterDirectory, 'motions', id, 'manifest.json'))) {
    motionIndex.motions[id] = `${id}/manifest.json`;
  }
  writeAssetJson(path.join(characterDirectory, 'motions/index.json'), motionIndex);
  console.log(JSON.stringify({ character, motion, frames: spec.frameCount, scale,
    output: `${sheet.width} × ${height}`, checks: 'alpha, source/output margins, distinct poses, baseline: passed' }));
  return manifest;
}
if (require.main === module) {
  const character = process.argv[2], motion = process.argv[3];
  if (motion) buildMotion(character, motion);
  else for (const id of Object.keys(getMotionSpecs(character))) buildMotion(character, id);
}
module.exports = { buildMotion };
