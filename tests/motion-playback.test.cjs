'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { sample, elapsedForFrame } = require('../public/js/core/motion-playback.js');
const { specs, characterSpecs } = require('../tools/assets/motion-specs.cjs');
const { frameAt } = require('../public/js/core/motion-playback.js');
const create = (motion, durations, extra = {}) => ({ motion, frameSequence: durations.map((_, i) => i),
  frames: durations.map(durationMs => ({ durationMs })), durationMs: durations.reduce((sum, n) => sum + n, 0), ...extra });
const idle = create('idle', [400, 400, 400, 400], { loop: true });
const model = motion => create(motion, specs[motion].durations, specs[motion]);
test('a repeated release visibly recharges before its second event and returns to idle',()=>{
 const action=create('danger-1',[180,4220,1400,300],{repeatRelease:true,events:[{timeMs:4400},{timeMs:5200}]});
 assert.equal(frameAt(action,4500),2);
 assert.equal(frameAt(action,5100),1);
 assert.equal(frameAt(action,5200),2);
 assert.equal(sample(action,idle,action.durationMs).motion,'idle');
 const ordinary={...action,repeatRelease:false};
 assert.equal(frameAt(ordinary,5100),2,'Existing four-pose assets keep their release pose');
});
test('forward and backward keep looping at duration boundaries', () => {
  for (const motion of ['forward', 'backward']) {
    const walk = model(motion);
    for (let frame = 0; frame < walk.frameCount; frame++) {
      const start = elapsedForFrame(walk, frame), duration = walk.frames[frame].durationMs;
      assert.equal(sample(walk, idle, start).frame, frame);
      assert.equal(sample(walk, idle, start + duration - 1).frame, frame);
    }
    assert.equal(sample(walk, idle, walk.durationMs - 1).frame, walk.frameCount - 1);
    assert.equal(sample(walk, idle, walk.durationMs).frame, 0);
    assert.equal(sample(walk, idle, walk.durationMs * 100).motion, motion);
  }
});
test('jump and hit finish their final frame before returning to idle', () => {
  for (const motion of ['jump', 'hit']) {
    const action = model(motion);
    assert.equal(sample(action, idle, action.durationMs - 1).frame, action.frameCount - 1);
    assert.deepEqual(sample(action, idle, action.durationMs), { motion: 'idle', frame: 0, phase: 'returned', finished: false });
    assert.equal(sample(action, idle, action.durationMs + 400).frame, 1);
  }
});
test('down remains prone indefinitely, both with and without an idle lead-in', () => {
  const down = model('down');
  for (const bridge of [false, true]) {
    const end = down.durationMs + (bridge ? 600 : 0);
    assert.equal(sample(down, idle, end - 1, bridge).frame, 3);
    for (const elapsed of [end, end + 1, end + 10000000]) {
      assert.deepEqual(sample(down, idle, elapsed, bridge), { motion: 'down', frame: 3, phase: 'hold', finished: true });
    }
  }
});
test('connection review plays idle → two walking cycles → idle without skipping the end', () => {
  const walk = model('forward'), end = 600 + walk.durationMs * 2;
  assert.equal(sample(walk, idle, 599, true).motion, 'idle');
  assert.equal(sample(walk, idle, 600, true).frame, 0);
  assert.equal(sample(walk, idle, end - 1, true).frame, walk.frameCount - 1);
  assert.equal(sample(walk, idle, end, true).phase, 'after');
  assert.equal(sample(walk, idle, end + 800, true).phase, 'before');
});
test('frame stepping resumes at the selected pose with the idle lead-in accounted for', () => {
  const jump = model('jump');
  assert.equal(elapsedForFrame(jump, 1), 160);
  assert.equal(elapsedForFrame(jump, 1, true), 760);
  assert.equal(sample(jump, idle, elapsedForFrame(jump, 2, true), true).frame, 2);
});

test('each warrior attack plays all four poses once and returns to idle, including connection review', () => {
  for (const [motion, spec] of Object.entries(characterSpecs.warrior)) {
    const attack = create(motion, spec.durations, spec);
    for (const bridge of [false, true]) {
      for (let frame = 0; frame < 4; frame++) {
        const start = elapsedForFrame(attack, frame, bridge);
        assert.equal(sample(attack, idle, start, bridge).motion, motion);
        assert.equal(sample(attack, idle, start, bridge).frame, frame);
        assert.equal(sample(attack, idle, start + spec.durations[frame] - 1, bridge).frame, frame);
      }
      const end = attack.durationMs + (bridge ? 600 : 0);
      assert.equal(sample(attack, idle, end, bridge).motion, 'idle');
      assert.equal(sample(attack, idle, end, bridge).phase, bridge ? 'after' : 'returned');
    }
  }
});
