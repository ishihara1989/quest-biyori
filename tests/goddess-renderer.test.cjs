'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const playback=require('../public/js/core/motion-playback.js');
const base=path.join(__dirname,'../public/assets/enemies/extradimensional-goddess/motions');
const assets=Object.fromEntries(['idle','floating','down','throne','halo','return'].map(id=>[id,{id,data:JSON.parse(fs.readFileSync(path.join(base,id,'manifest.json')))}]));
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/js/render/goddess-renderer.js'),'utf8'),scope);
const ctx={save(){},restore(){},beginPath(){},ellipse(){},fill(){},translate(){},rotate(){}};
function draw(phase,age,hp=0) { const calls=[],e={type:'goddess',x:700,y:460,hp,departurePhase:phase,goddessPhase:phase,departedAt:0};scope.window.GoddessRenderer.draw(ctx,e,{time:age},{goddess:assets},(asset,clock,x,y,scale,flip,alpha)=>calls.push({id:asset.id,frame:playback.frameAt(asset.data,asset.data.loop?clock%asset.data.durationMs:clock),scale,alpha}),false);return calls; }
test('floating idle cycles through four distinct sprites and wraps',()=>{assert.equal(assets.floating.data.frames.length,4);assert.deepEqual([0,300,600,900,1200].map(t=>draw(2,t,100).find(c=>c.id==='floating').frame),[0,1,2,3,0]);const pngs=assets.floating.data.frames.map(f=>fs.readFileSync(path.join(base,'floating',f.file)).toString('base64'));assert.equal(new Set(pngs).size,4);});
test('both phases complete the turn before fading; doorway closes after the body',()=>{assert.equal(assets.down.data.frames.length,6);for(const phase of[1,2]){const age=phase===1?1440:1140,body=draw(phase,age).find(c=>c.id==='down');assert.equal(body.frame,5);assert.equal(body.alpha,1);assert.ok(body.scale<1);assert.equal(draw(phase,1850).some(c=>c.id==='down'),false);assert.ok(draw(phase,1850).some(c=>c.id==='return'));assert.deepEqual(draw(phase,2100),[]);}});
