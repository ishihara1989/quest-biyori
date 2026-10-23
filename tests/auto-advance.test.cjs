'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../public/js/data/forest-data.js'),R=require('../public/js/core/reincarnation.js');
const route=[100,'dimensional-gate','chaos-gate','extradimensional-goddess','reincarnation-goddess'];
const ready=()=>{const s=D.freshSave();s.cleared=D.STAGES.map(stage=>stage.id);s.autoMode='advance';return s;};

test('advance follows throne 10 through both gates and both goddesses, including restored saves',()=>{
 let s=require('../tools/balance/audit-reincarnation.cjs').reference();
 s.reincarnation.discovered=false;s.autoMode='advance';
 for(let i=0;i<route.length;i++){
  const id=route[i];s.selectedStage=id;D.award(s,id,0,R.capture(s,id));
  s=D.readSave(JSON.stringify(s));
  assert.equal(D.isUnlocked(s,id),true);
  assert.equal(D.nextStage(id,s)?.id,route[i+1]);
  assert.deepEqual(D.autoDestination(s,id,true),{stage:route[i+1]??id,mode:'advance'});
 }
 assert.equal(s.reincarnation.discovered,true);
});

test('first clears advance from throne 10 to the extradimensional goddess',()=>{
 const s=ready();s.cleared=s.cleared.filter(id=>id<100);
 for(let i=0;i<3;i++){
  D.award(s,route[i]);
  assert.deepEqual(D.autoDestination(s,route[i],true),{stage:route[i+1],mode:'advance'});
 }
});

test('locked chaos and reincarnation encounters keep advance on the current stage',()=>{
 const s=D.freshSave();s.cleared=[50,'dimensional-gate'];s.autoMode='advance';
 assert.deepEqual(D.autoDestination(s,'dimensional-gate',true),{stage:'dimensional-gate',mode:'advance'});
 s.cleared.push(100,'chaos-gate');D.award(s,'extradimensional-goddess',0,R.capture(s,'extradimensional-goddess'));
 assert.equal(s.reincarnation.discovered,false);
 assert.deepEqual(D.autoDestination(s,'extradimensional-goddess',true),{stage:'extradimensional-goddess',mode:'advance'});
 s.reincarnation.discovered=true;
 assert.equal(D.autoDestination(s,'extradimensional-goddess',true).stage,'reincarnation-goddess');
});

test('same repeats, off stops, and defeat retains existing fallback destinations at every connection',()=>{
 const s=ready();s.cleared.push(...route.slice(1));s.reincarnation.discovered=true;
 const fallbacks=[99,50,100,'chaos-gate','extradimensional-goddess'];
 for(const [i,id]of route.entries()){
  s.autoMode='same';assert.deepEqual(D.autoDestination(s,id,true),{stage:id,mode:'same'});
  for(const mode of ['same','advance']){s.autoMode=mode;assert.deepEqual(D.autoDestination(s,id,false),{stage:fallbacks[i],mode:'same'});}
  s.autoMode='off';for(const victory of [true,false])assert.equal(D.autoDestination(s,id,victory),null);
 }
});

test('main gear wait still holds progression at throne 10 and the gates',()=>{
 const s=ready();s.reincarnation.unlocked=true;s.reincarnation.automation.waitForMainGear=true;
 for(const id of route.slice(0,3))assert.deepEqual(D.autoDestination(s,id,true),{stage:id,mode:'advance'});
 s.reincarnation.automation.waitForMainGear=false;
 assert.equal(D.autoDestination(s,100,true).stage,'dimensional-gate');
 assert.equal(D.autoDestination(s,'dimensional-gate',true).stage,'chaos-gate');
});

test('serious trial ends at the combined goddess encounter',()=>{
 const s=ready();Object.assign(s.reincarnation,{discovered:true,unlocked:true,trialRun:true,trials:['goddess-serious']});
 const tree=require('../public/js/data/reincarnation-tree-data.js');
 const own=id=>{for(const p of tree.byId[id].requires)if(p!=='origin'&&!s.reincarnation.owned.includes(p))own(p);if(id!=='origin')s.reincarnation.owned.push(id);};own('trial-open');
 s.cleared.push('chaos-gate','extradimensional-goddess');
 assert.equal(D.nextStage('chaos-gate',s).goddessDuo,true);
 assert.equal(D.nextStage('extradimensional-goddess',s),undefined);
 assert.deepEqual(D.autoDestination(s,'extradimensional-goddess',true),{stage:'extradimensional-goddess',mode:'advance'});
});
