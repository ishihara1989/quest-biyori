'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {reviewFingerprint}=require('../tools/assets/build-demon-castle-motions.cjs');
const frames=[{sha256:'same-artwork',durationMs:180,phase:'windup'},{sha256:'same-release',durationMs:240,phase:'release'}];
test('unchanged artwork requires renewed playback review when frame timing changes',()=>{
 const original=reviewFingerprint(frames,{loop:false});
 assert.notEqual(reviewFingerprint([{...frames[0],durationMs:4600},frames[1]],{loop:false}),original);
 assert.equal(reviewFingerprint(structuredClone(frames),{loop:false}),original);
});
test('effect onset, loop and terminal hold are part of review identity',()=>{
 const clip={events:[{id:'pillar',timeMs:2800}],loop:false,terminal:false},original=reviewFingerprint(frames,clip);
 assert.notEqual(reviewFingerprint(frames,{...clip,events:[{id:'pillar',timeMs:1900}]}),original);
 assert.notEqual(reviewFingerprint(frames,{...clip,loop:true}),original);
 assert.notEqual(reviewFingerprint(frames,{...clip,terminal:true}),original);
});
