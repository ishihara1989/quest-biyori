'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js');
const R = require('../public/js/core/reincarnation.js'), Gear = require('../public/js/core/forest-auto-gear.js');
const Tree = require('../public/js/data/reincarnation-tree-data.js'), Unlocks = require('../public/js/ui/forest-unlocks.js');
function own(s,id) {
  for (const p of Tree.byId[id].requires) if (p !== 'origin' && !s.reincarnation.owned.includes(p)) own(s,p);
  if (!s.reincarnation.owned.includes(id)) s.reincarnation.owned.push(id);
}
function seed(last = 100) {
  const s = D.freshSave();
  Object.assign(s.reincarnation,{discovered:true,unlocked:true,cycle:1000,total:100000});
  s.cleared = D.STAGES.filter(s=>s.id<=last).map(s=>s.id).concat('dimensional-gate',...(last===100?['chaos-gate']:[])); s.autoMode = 'advance'; return s;
}
function fill(s, regions, unique = true, jobs = Object.keys(P.CHARACTERS)) {
  for (const job of jobs) for (const slot of ['weapon','armor']) s.progression.characters[job][slot] =
    P.allGearTrees(job,slot).filter(n=>regions.includes(Math.ceil(n.stage/10)) && (unique || !n.unique)).map(n=>n.id);
}
test('each gate waits for its own regional upgrades, then advances; sub excludes unique and goddess trees',()=>{
  for (const [gate,regions,next] of [['dimensional-gate',[1,2,3,4,5],'chaos-gate'],['chaos-gate',[6,7,8,9,10],'extradimensional-goddess']]) {
    const s=seed(); s.reincarnation.automation.gates[gate]='all';
    assert.equal(D.autoDestination(s,gate,true).stage,gate);
    fill(s,regions,false); assert.equal(Gear.gateComplete(s,regions,'sub'),true);
    assert.equal(D.autoDestination(s,gate,true).stage,gate);
    s.reincarnation.automation.gates[gate]='sub'; assert.equal(D.autoDestination(s,gate,true).stage,next);
    s.reincarnation.automation.gates[gate]='all'; fill(s,regions);
    assert.equal(D.autoDestination(s,gate,true).stage,next);
    s.progression.characters.miko.armor.pop(); assert.equal(D.autoDestination(s,gate,true).stage,gate);
    s.autoGear.excludedCharacters=['miko']; assert.equal(D.autoDestination(s,gate,true).stage,gate);
    s.reincarnation.automation.gates[gate]='off'; assert.equal(D.autoDestination(s,gate,true).stage,next);
    s.reincarnation.automation.gates[gate]='all';s.reincarnation.cycle=0;
    assert.equal(D.autoDestination(s,gate,true).stage,next,'locked until first rebirth');
  }
});
test('gate waits respect OFF, repeat, defeat, ordinary stages and only participating solo characters',()=>{
  const s=seed();s.reincarnation.automation.gates['dimensional-gate']='all';
  s.autoMode='off';assert.equal(D.autoDestination(s,'dimensional-gate',true),null);
  s.autoMode='same';assert.deepEqual(D.autoDestination(s,'dimensional-gate',true),{stage:'dimensional-gate',mode:'same'});
  s.autoMode='advance';assert.deepEqual(D.autoDestination(s,'dimensional-gate',false),{stage:50,mode:'same'});
  assert.equal(D.autoDestination(s,51,true).stage,52);
  own(s,'trial-seals');Object.assign(s.reincarnation,{trialRun:true,trials:['solo-warrior-1']});
  fill(s,[1,2,3,4,5],true,['warrior']);assert.equal(D.autoDestination(s,'dimensional-gate',true).stage,'chaos-gate');
});
test('main-only trial ignores both gate farming requirements; main-gear waiting remains effective',()=>{
  const s=seed();own(s,'trial-seals');Object.assign(s.reincarnation,{trialRun:true,trials:['seal-gear']});
  for(const [gate,next] of [['dimensional-gate','chaos-gate'],['chaos-gate','extradimensional-goddess']]) {
    s.reincarnation.automation.gates[gate]='all';assert.equal(D.autoDestination(s,gate,true).stage,next);
  }
  s.reincarnation.automation.waitForMainGear=true;
  assert.equal(D.autoDestination(s,'dimensional-gate',true).stage,'dimensional-gate');
});
test('new settings restore safely, preserve existing settings and survive another rebirth',()=>{
  const s=seed();own(s,'trial-open');s.reincarnation.automation.rebirth=true;
  s.reincarnation.automation.gates={'dimensional-gate':'sub','chaos-gate':'all'};
  let loaded=D.readSave(JSON.stringify(s));assert.deepEqual(loaded.reincarnation.automation,s.reincarnation.automation);
  loaded.reincarnation.defeatedCycle=loaded.reincarnation.cycle;
  const next=R.prepare(loaded,D.freshSave,{automatic:true});
  assert.deepEqual(next.reincarnation.automation,s.reincarnation.automation);
  assert.equal(D.readSave(JSON.stringify(next)).reincarnation.resumeAfterRebirth,true);
  delete s.reincarnation.automation.gates;delete s.reincarnation.automation.rebirth;
  loaded=D.readSave(JSON.stringify(s));assert.equal(loaded.reincarnation.automation.rebirth,false);
  assert.deepEqual(loaded.reincarnation.automation.gates,{'dimensional-gate':'off','chaos-gate':'off'});
  s.reincarnation.automation.gates={'dimensional-gate':true,'chaos-gate':'invalid'};
  assert.deepEqual(R.restore(s.reincarnation).automation.gates,loaded.reincarnation.automation.gates);
});
test('automatic rebirth needs the trial door and current eligibility; it pays once and retains the active trials',()=>{
  const s=seed();s.reincarnation.automation.rebirth=true;s.reincarnation.defeatedCycle=s.reincarnation.cycle;
  assert.equal(R.autoRebirth(s),false);own(s,'trial-open');assert.equal(R.autoRebirth(s),true);
  Object.assign(s.reincarnation,{trialRun:true,trials:['strength-2','onslaught'],defeatedCycle:null});
  assert.equal(R.autoRebirth(s),false);D.award(s,'reincarnation-goddess',0,R.capture(s));
  assert.equal(R.autoRebirth(s),true);const payout=R.payout(s),next=R.prepare(s,D.freshSave,{automatic:true});
  assert.equal(next.reincarnation.total,s.reincarnation.total+payout);assert.equal(next.reincarnation.cycle,s.reincarnation.cycle+1);
  assert.deepEqual(next.reincarnation.trials,s.reincarnation.trials);assert.equal(next.reincarnation.trialRun,true);
  assert.equal(next.selectedStage,1);assert.equal(next.autoMode,'advance');assert.equal(R.autoRebirth(next),false);
  assert.equal(R.prepare(next,D.freshSave,{automatic:true}),null);
  Object.assign(s.reincarnation,{trials:['goddess-serious'],trialCompleted:['onslaught','unyielding'],duoDefeatedJourney:null});
  assert.equal(R.autoRebirth(s),false);
  s.reincarnation.duoDefeatedJourney=s.reincarnation.journey;assert.equal(R.autoRebirth(s),true);
});
test('first rebirth queues new option ceremonies, door purchase reveals auto rebirth, old saves stay quiet',()=>{
  const s=D.freshSave();Object.assign(s.reincarnation,{discovered:true,unlocked:true,defeatedCycle:0});
  assert.deepEqual(R.optionUnlocks(s),[]);
  const next=R.prepare(s,D.freshSave);assert.deepEqual(next.reincarnation.pendingOptions,['gate-farming','result-options']);
  assert.deepEqual(D.readSave(JSON.stringify(next)).reincarnation.pendingOptions,next.reincarnation.pendingOptions);
  next.reincarnation.pendingOptions=[];next.reincarnation.defeatedCycle=1;
  assert.deepEqual(R.prepare(next,D.freshSave).reincarnation.pendingOptions,[]);
  const old=seed();assert.deepEqual(D.readSave(JSON.stringify(old)).reincarnation.pendingOptions,[]);
  own(old,'main-free');const before=R.optionUnlocks(old).map(o=>o.id);
  assert.equal(R.purchase(old,'trial-open'),true);
  assert.deepEqual(R.optionUnlocks(old).filter(o=>!before.includes(o.id)).map(o=>o.id),['auto-rebirth']);
});
test('auto dismantle receives a first availability announcement; existing reincarnation reveal remains',()=>{
  const s=D.freshSave();s.cleared=Array.from({length:49},(_,i)=>i+1);
  assert.equal(Unlocks.collect(s,50).filter(o=>o.id==='auto-dismantle').length,1);
  s.reincarnation.lifetimeStages=[50];assert.ok(!Unlocks.collect(s,50).some(o=>o.id==='auto-dismantle'));
  s.reincarnation.discovered=true;
  assert.ok(D.award(s,'reincarnation-goddess',0,R.capture(s)).reincarnationUnlocks.some(o=>o.rebirth));
  assert.ok(!D.award(s,'reincarnation-goddess',0,R.capture(s)).reincarnationUnlocks.some(o=>o.rebirth));
});
