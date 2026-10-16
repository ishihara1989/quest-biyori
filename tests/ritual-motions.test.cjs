'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const R = require('../development/labs/js/ritual-motions.js'), Playback = require('../public/js/core/motion-playback.js');
const base = path.resolve(__dirname, '../public/assets');
function models(character) {
  const c = R.CHARACTERS[character];
  return Object.fromEntries(['idle', c.attack, c.loop, c.release].filter(Boolean).map(motion => [motion,
    JSON.parse(fs.readFileSync(path.join(base, character, motion === 'idle' ? '' : 'motions/' + motion, 'manifest.json')))]));
}
test('the maiden prays twice, turns once in forward frame order, then returns to idle', () => {
  const m = models('miko'), releaseAt = R.LEAD + m.prayer.durationMs * 2;
  assert.equal(R.sample('miko', 'ritual', releaseAt - 1, m).motion, 'prayer');
  const frames = [];
  for (let t = releaseAt; t < releaseAt + m['prayer-release'].durationMs; t++) {
    const pose = R.sample('miko', 'ritual', t, m), frame = Playback.frameAt(m[pose.motion], pose.time);
    assert.equal(pose.motion, 'prayer-release');
    if (frames.at(-1) !== frame) frames.push(frame);
  }
  assert.deepEqual(frames, [0, 1, 2, 3, 4, 5]);
  assert.equal(R.sample('miko', 'ritual', releaseAt + m['prayer-release'].durationMs, m).motion, 'idle');
});
test('shaman chanting joins the released staff pose with no second chant during recovery', () => {
  const m = models('shaman'), start = R.LEAD + m.chant.durationMs * 2;
  assert.equal(R.sample('shaman', 'ritual', start, m).motion, 'cast-forward');
  assert.equal(R.sample('shaman', 'ritual', start + m['cast-forward'].durationMs, m).motion, 'idle');
  const dir = path.join(base, 'shaman/motions');
  assert.deepEqual(fs.readFileSync(path.join(dir, 'chant/chant-01.png')), fs.readFileSync(path.join(dir, 'cast-forward/cast-forward-01.png')));
});
test('the shuriken flight starts after the star leaves the sprite and continues during recovery', () => {
  const m = models('ninja');
  const before = R.LEAD + R.SHURIKEN_FLIGHT - 1, start = before + 1;
  assert.equal(R.projectile(before), null);
  assert.equal(R.projectile(start).progress, 0);
  const pose = R.sample('ninja', 'attack', start, m);
  assert.equal(Playback.frameAt(m[pose.motion], pose.time), 2);
  assert.ok(R.projectile(R.LEAD + m['attack-shuriken'].durationMs));
  assert.equal(R.projectile(start + 420), null);
});
test('standalone seals, chants and prayers loop without advancing to a finishing motion', () => {
  for (const [id, c] of Object.entries(R.CHARACTERS)) {
    const m = models(id), d = m[c.loop].durationMs;
    for (const t of [0, d - 1, d, d * 10 + 137]) {
      const pose = R.sample(id, 'loop', t, m);
      assert.equal(pose.motion, c.loop); assert.equal(pose.time, t % d);
    }
  }
});
