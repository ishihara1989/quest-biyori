'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const { PNG } = require('pngjs');
const M = require('../public/js/skills/mage-motions.js'), S = require('../public/js/combat/forest-simulation.js'), D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const assets = path.resolve(__dirname, '../public/assets');
function manifest(motion) { return JSON.parse(fs.readFileSync(path.join(assets, 'mage/motions', motion, 'manifest.json'))); }
function pixels(motion, frame) { const m = manifest(motion); return PNG.sync.read(fs.readFileSync(path.join(assets, 'mage/motions', motion, m.frames[frame].file))).data; }
test('casting transitions use identical pixels at chant and hold boundaries', () => {
  for (const [move, hold] of [['cast-forward', 'cast-forward-hold'], ['cast-up', 'cast-up-hold']]) {
    assert.deepEqual(pixels(move, 0), pixels('chant', 0));
    assert.deepEqual(pixels(move, 3), pixels(hold, 0));
    assert.equal(manifest(move).transitions.to, hold);
    assert.equal(manifest(hold).loop, true);
  }
});
test('full casting sequences include chant, extension, hold and recovery, then idle', () => {
  for (const kind of ['forward', 'up']) {
    const motion = kind === 'up' ? 'cast-up' : 'cast-forward';
    assert.equal(M.sample(kind, 0).motion, 'chant');
    assert.equal(M.sample(kind, 640).motion, motion);
    assert.equal(M.sample(kind, M.SKILL_IMPACT).motion, motion + '-hold');
    assert.equal(M.sample(kind, M.SKILL_IMPACT + 640).phase, 'recover');
    assert.equal(M.sample(kind, M.SKILL_DURATION - 1).phase, 'settle');
    assert.equal(M.sample(kind, M.SKILL_DURATION).motion, 'idle');
  }
  assert.equal(M.sample('normal', M.NORMAL_IMPACT).time, 340);
  assert.equal(M.sample('normal', 680).phase, 'recover');
  assert.equal(M.sample('normal', M.NORMAL_DURATION).motion, 'idle');
});
test('live casts use the existing reviewed transition and maintain loop at release for either facing', () => {
  const Skills=require('../public/js/skills/mage-skills.js');
  for (const speed of [1,1.5,2]) for (const kind of ['bolt','wind','thunder']) for (const facing of [1,-1]) {
    const save=D.freshSave();D.award(save,4);
    const run=S.createRun(4,{random:()=>.9,builds:{mage:P.stats(save,'mage')}});run.hero.hp=0;
    const mage=run.allies[0];Object.assign(mage,{x:facing>0?200:800,y:400,cooldown:1e9,mp:100,mpRegen:0,attackSpeed:speed});
    run.enemies=[{...run.enemies[0],id:'target',x:500,y:400,hp:1e6,damage:0,speed:0,cooldown:1e6}];
    const spec=Skills.spec(kind,1,0,{attackSpeed:speed});S.startMageSkill(run,mage,spec,run.enemies[0],[]);
    S.update(run,spec.release+S.STEP);const pose=M.actorPose(mage);
    assert.equal(mage.mageCast.released,true);assert.equal(pose.motion,'cast-'+spec.cast+'-hold');assert.equal(mage.facing,facing);
    assert.equal(require('../public/js/core/motion-playback.js').frameAt(manifest(pose.motion),pose.time),0);
  }
});
test('generated wind effects contain four distinct RGBA frames and real empty margins', () => {
  for (const id of M.EFFECTS) {
    const dir = path.join(assets, 'effects', id), m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'))), sheet = PNG.sync.read(fs.readFileSync(path.join(dir, m.sheet)));
    assert.equal(m.frameCount, 4); assert.equal(m.frames.reduce((sum, f) => sum + f.durationMs, 0), m.durationMs);
    assert.equal(m.loop, id !== 'mage-wind-impact');
    const hashes = new Set();
    for (const f of m.frames) {
      const p = PNG.sync.read(fs.readFileSync(path.join(dir, f.file))); let empty = 0, solid = 0;
      hashes.add(require('node:crypto').createHash('sha256').update(p.data).digest('hex'));
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4, out = (y * sheet.width + f.x + x) * 4;
        assert.equal(p.data[i + 3], sheet.data[out + 3]);
        if (p.data[i + 3] === 0) empty++;
        if (p.data[i + 3] >= 128) solid++;
        if (x < 7 || x > 248 || y < 7 || y > 248) assert.equal(p.data[i + 3], 0);
      }
      assert.ok(empty > 5000 && solid > 100);
    }
    assert.equal(hashes.size, 4);
  }
});
