'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { characters, getMotionSpecs } = require('./motion-specs.cjs');
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const search = [__dirname, process.env.NODE_PATH, bundled].filter(Boolean);
const { PNG } = require(require.resolve('pngjs', { paths: search }));
const sharp = require(require.resolve('sharp', { paths: search }));
const root = path.join(__dirname, '../../public/assets');
const targets = process.argv.length > 2 ? process.argv.slice(2) : characters;
targets.forEach(character => assert.ok(characters.includes(character), `Unknown character: ${character}`));
(async () => {
  let totalFrames = 0, totalMotions = 0;
  for (const character of targets) {
    const specs = getMotionSpecs(character);
    const index = JSON.parse(fs.readFileSync(path.join(root, character, 'motions/index.json'), 'utf8'));
    // These existing Miko skill motions use the skill-asset manifest schema.
    // Their sources, alpha, frames and registration are checked by miko-assets.test.cjs.
    const skillMotions=character==='miko'?['summon-forward','spirit-send','blessing-up','kagura-finish']:[];
    assert.deepEqual(Object.keys(index.motions), [...Object.keys(specs),...skillMotions]);
    for(const motion of skillMotions){const manifest=JSON.parse(fs.readFileSync(path.join(root,character,'motions',index.motions[motion]),'utf8'));assert.equal(manifest.character,character);assert.equal(manifest.subject,motion);assert.equal(manifest.group,'miko');}
    for (const [motion, spec] of Object.entries(specs)) {
      const directory = path.join(root, character, 'motions', motion);
      const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
      const sheet = PNG.sync.read(fs.readFileSync(path.join(directory, manifest.sheet)));
      assert.equal(manifest.character, character); assert.equal(manifest.motion, motion);
      assert.equal(manifest.frameCount, spec.frameCount);
      assert.equal(manifest.frames.length, spec.frameCount);
      assert.deepEqual(manifest.frameSequence, Array.from({ length: spec.frameCount }, (_, index) => index));
      assert.equal(manifest.durationMs, spec.durations.reduce((sum, value) => sum + value, 0));
      const width=spec.frameWidth||256,height=spec.frameHeight||224,pivot=spec.pivot||{x:128,y:207};
      assert.equal(sheet.width, width * spec.frameCount); assert.equal(sheet.height, height);
      assert.deepEqual(manifest.pivot, pivot);
      assert.equal(manifest.loop, spec.loop); assert.equal(manifest.terminal, Boolean(spec.terminal));
      assert.equal(manifest.transitions.to, spec.transitions?.to ?? (spec.terminal ? null : 'idle'));
      assert.equal(manifest.movementDirection, spec.movementDirection || 0);
      assert.ok(fs.statSync(path.join(directory, manifest.source)).size > 0);
      assert.ok(fs.readFileSync(path.join(directory, 'PROMPT.md'), 'utf8').length > 500);
      const poseHashes = new Set();
      for (const frame of manifest.frames) {
        const image = PNG.sync.read(fs.readFileSync(path.join(directory, frame.file)));
        const poseHash = createHash('sha256').update(image.data).digest('hex');
        assert.ok(!poseHashes.has(poseHash), `${character}/${motion} contains a repeated pose`);
        poseHashes.add(poseHash);
        assert.equal(image.width, width); assert.equal(image.height, height);
        let bottom = -1, transparent = 0, solid = 0;
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          const local = (y * width + x) * 4, packed = (y * sheet.width + frame.x + x) * 4;
          for (let channel = 0; channel < 4; channel++) assert.equal(image.data[local + channel], sheet.data[packed + channel]);
          const alpha = image.data[local + 3]; if (alpha === 0) transparent++;
          if (motion.startsWith('attack-') && (x === 0 || x === width-1 || y === 0 || y === height-1)) {
            assert.equal(alpha, 0, 'Attack outlines and translucent trails have a transparent border');
          }
          if (alpha >= 128) {
            bottom = Math.max(bottom, y); solid++;
            assert.ok(x >= 3 && x <= width-4 && y >= 3 && y <= (manifest.anchorBasis === 'feet' || spec.frameHeight ? height-4 : pivot.y));
            assert.ok(y + frame.previewOffset.y >= 0, 'Airborne review never clips the sprite');
          }
        }
        if (manifest.anchorBasis === 'feet') {
          assert.ok(Array.from({ length: width }, (_, x) => image.data[(pivot.y * width + x) * 4 + 3]).some(alpha => alpha >= 128));
        } else if(spec.frameHeight)assert.ok(bottom>=pivot.y-1&&bottom<=pivot.y+8);
        else assert.equal(bottom, pivot.y);
        assert.ok(solid > 800 && transparent > 256 * 224 * .45);
        assert.equal(frame.durationMs, spec.durations[frame.index]);
        assert.equal(frame.phase, spec.phases[frame.index]);
        assert.equal(frame.airborne, motion === 'jump' && frame.index === 1);
      }
      const gif = await sharp(path.join(directory, `${character}-${motion}-preview.gif`), { animated: true }).metadata();
      assert.equal(gif.pages, spec.frameCount); assert.equal(gif.width, width*2); assert.equal(gif.pageHeight, height*2);
      assert.equal(gif.loop, spec.loop ? 0 : 1); assert.deepEqual(gif.delay, spec.durations);
      totalFrames += spec.frameCount; totalMotions++;
    }
  }
  assert.equal(totalFrames, targets.reduce((sum, character) => sum + Object.values(getMotionSpecs(character)).reduce((count, spec) => count + spec.frameCount, 0), 0));
  assert.equal(totalMotions, targets.reduce((sum, character) => sum + Object.keys(getMotionSpecs(character)).length, 0));
  console.log(JSON.stringify({ characters: targets.length, motions: totalMotions, frames: totalFrames,
    checks: 'PNG packing/alpha/margins/pivots, jump lift, transitions, source/prompt, GIF count/timing/loop: passed' }));
})().catch(error => { console.error(error); process.exitCode = 1; });
