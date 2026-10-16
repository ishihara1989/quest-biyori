'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const model=require('../development/labs/js/manticore-trot-model.js');
const close=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('six samples alternate the specified diagonal support pairs',()=>{
  const supports=model.frames().map(f=>Object.keys(f.legs).filter(id=>f.legs[id].grounded).sort());
  assert.deepEqual(supports,[['LF','RH'],['LF','RH'],['LH','RF'],['LH','RF'],['LH','RF'],['LF','RH']]);
});
test('periodic projection closes the loop and all inverse-kinematic bones retain length',()=>{
  for(const id of Object.keys(model.config.legs)){
    const start=model.sample(0).legs[id],end=model.sample(1).legs[id];
    close(start.screen.paw.x,end.screen.paw.x);close(start.screen.paw.y,end.screen.paw.y);
  }
  for(let i=0;i<240;i++)for(const [id,l]of Object.entries(model.sample(i/240).legs)){
    const {root,joint,ankle}=l.world,def=model.config.legs[id];
    close(Math.hypot(root.u-joint.u,root.z-joint.z),def.upper);
    close(Math.hypot(ankle.u-joint.u,ankle.z-joint.z),def.lower);
    if(l.grounded)close(l.height,0);else assert.ok(l.height>=0);
    assert.ok(l.screen.paw.x>0&&l.screen.paw.x<model.config.width&&l.screen.paw.y<model.config.height);
  }
});
test('right hind stays close behind left hind and left front advances evenly through 3 4 5',()=>{
  const f=model.frames();assert.ok(Math.abs(f[1].legs.RH.screen.paw.x-f[0].legs.RH.screen.paw.x)<40);
  assert.ok(Math.abs(f[1].legs.RH.screen.paw.x-f[1].legs.LH.screen.paw.x)<25);
  const x=[f[2],f[3],f[4]].map(f=>f.legs.LF.screen.paw.x);
  assert.ok(x[0]>x[1]&&x[1]>x[2]);close(x[0]-x[1],x[1]-x[2]);
});
test('a per-leg amplitude edit changes only that limb, including zero-amplitude operation',()=>{
  const c=structuredClone(model.config);c.legs.RH.amplitude=0;
  const baseline=model.frames(),changed=model.frames(c);
  for(let i=0;i<6;i++){
    for(const id of ['LF','RF','LH'])assert.deepEqual(baseline[i].legs[id],changed[i].legs[id]);
    close(changed[i].legs.RH.screen.paw.x,changed[0].legs.RH.screen.paw.x);
  }
});
