'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../public/js/data/forest-data.js'), P = require('../public/js/core/forest-progression.js'), G = P.Gem;
const Sim = require('../public/js/combat/forest-simulation.js'), R = require('../public/js/combat/status-resistance.js');
const X = require('../public/js/combat/expansion-combat.js'), V = require('../public/js/combat/volcano-combat.js');
const Castle = require('../public/js/combat/demon-castle-combat.js'), Goddess = require('../public/js/combat/goddess-combat.js');
const Swamp = require('../public/js/combat/swamp-combat.js');
const gem = (rarity, level, roll = .5) => G.generate({ rarity, family: 'resistance', level, random: () => roll });
function fixture() {
  const s = D.freshSave(); s.cleared = D.STAGES.map(s => s.id); s.gold = 1e9;
  for (const slot of ['weapon', 'armor']) s.progression.characters.warrior[slot] = P.allGearTrees('warrior', slot).map(n => n.id);
  return s;
}
test('resistance is unique+ defense capacity, fixed 12 through 30 percent with 2 points per level', () => {
  assert.equal(gem('rare', 1), null);
  for (const rarity of ['unique', 'legendary']) for (let level = rarity === 'legendary' ? 6 : 1; level <= 10; level++) {
    for (const roll of [0, .5, .999]) {
      const raw = gem(rarity, level, roll), shown = G.describe(raw);
      assert.ok(G.validate(raw)); assert.equal(shown.effect.statusResistance, Number((.10 + .02 * level).toFixed(2)));
      assert.ok(shown.costs.defense > 0); assert.equal(shown.costs.attack, undefined);
      assert.deepEqual(shown.jobs, Object.keys(P.CHARACTERS)); assert.match(shown.note, /状態異常抵抗 \+\d+%/);
    }
  }
  // The option also participates in secondary rolls, never in rare rolls.
  assert.equal(G.generate({rarity:'unique',family:'defense',random:()=>.999}).options[1].key, 'resistance');
});
test('craft, upgrade and reload preserve resistance; both slots multiply and removal recomputes', () => {
  const s = fixture(), cost = G.craftRecipe('unique', 1, 'resistance'); Object.assign(s.inventory, cost);
  const a = G.craft(s, 'unique', 1, 'resistance', () => .5); assert.ok(a);
  const roll = structuredClone(a.options), upgrade = G.upgradeRecipe(a, 10); Object.assign(s.inventory, upgrade);
  assert.ok(G.upgrade(s, a.id, 10)); assert.deepEqual(a.options, roll); assert.equal(G.describe(a).effect.statusResistance, .3);
  const b = P.addGem(s, gem('unique', 10));
  assert.ok(P.equipGem(s, 'warrior', 'armor', a.id)); assert.ok(P.equipGem(s, 'warrior', 'weapon', b.id));
  assert.ok(Math.abs(P.stats(s, 'warrior').statusResistance - .51) < 1e-12);
  const loaded = D.readSave(JSON.stringify(s)); assert.deepEqual(loaded.gems, s.gems);
  assert.ok(Math.abs(P.stats(loaded, 'warrior').statusResistance - .51) < 1e-12);
  const run = Sim.createRun(1, {builds:{warrior:P.stats(loaded,'warrior')}});
  P.unequipGem(loaded, 'warrior', 'weapon', b.id);
  assert.ok(Math.abs(P.stats(loaded, 'warrior').statusResistance - .3) < 1e-12);
  assert.ok(Math.abs(run.hero.statusResistance - .51) < 1e-12);
  P.unequipGem(loaded, 'warrior', 'armor', a.id); assert.equal(P.stats(loaded, 'warrior').statusResistance, 0);
  assert.equal(G.matchesDismantleFilter(a,{maxRarity:'unique',excludedEffects:['resistance']}),false);
});
test('resistance uses one probability boundary and no RNG without resistance', () => {
  let calls = 0; const run = {time:100,random:()=>{calls++;return .509999;}}, actor = {id:'hero',statusResistance:.51}, events=[];
  assert.ok(R.resists(run,actor,events)); assert.equal(calls,1); assert.equal(events[0].kind,'resistance');
  run.random=()=>.51; assert.equal(R.resists(run,actor,[]),false);
  run.random=()=>{throw Error('Unnecessary RNG');}; actor.statusResistance=0; assert.equal(R.resists(run,actor,[]),false);
  actor.statusResistance=1; assert.ok(R.resists(run,actor,[]));
  actor.statusResistance=.51; let blocked=0; for(let i=0;i<10000;i++){run.random=()=>i/10000;if(R.resists(run,actor,[]))blocked++;}
  assert.equal(blocked,5100);
});
function arena(roll) {
  const run = Sim.createRun(1,{random:()=>roll}); run.time=100;
  const a = run.hero; Object.assign(a,{hp:10000,maxHp:10000,statusResistance:.3});
  run.allies=[{id:'ally',hp:10000,type:'mage'},{id:'ally2',hp:10000,type:'ninja'}];
  return {run,a,e:run.enemies[0],events:[]};
}
const api={immune:()=>false, hit:(_r,_e,a)=>{a.hp--;return true;},STEP:1,state:(e,s)=>{e.state=s;},control:require('../public/js/combat/enemy-control.js'),attackPower:(_r,e)=>e.damage};
test('swamp and cave/coast resist new applications and refreshes while successful statuses retain full duration', () => {
  for(const roll of [0,.999]) for(const kind of ['root','poison','web','blind','bubble']) {
    const {run,a,e,events}=arena(roll);
    if(['root','poison'].includes(kind))Sim.applyStatus(run,a,kind,e,events); else X.status(run,a,kind,events);
    const key={root:'rootUntil',poison:'poison',web:'webUntil',blind:'blindUntil',bubble:'bubbleUntil'}[kind];
    assert.equal(!!a[key],roll>0,kind);
    if(roll>0){const before=structuredClone(a[key]);run.time+=100;run.random=()=>0;
      if(['root','poison'].includes(kind))Sim.applyStatus(run,a,kind,e,events);else X.status(run,a,kind,events);
      assert.deepEqual(a[key],before,kind+' resisted refresh');
    }
  }
  const b=Swamp.create();b.hero.statusResistance=1;assert.equal(Swamp.applyStatus(b,b.hero,'poison',{damage:10}),false);assert.equal(b.hero.poison,null);
});
test('desert, highland and glacier route their actual impacts through resistance', () => {
  for(const [moduleName,type,status,key] of [
    ['desert','sand-scorpion','poison','poison'],['desert','sand-scorpion','sand','sandSlowUntil'],
    ['highland','horn-jackal','bleed','bleed'],['highland','horn-jackal','poison','poison'],
    ['glacier','frost-wolf','chill','chillUntil'],['glacier','frost-wolf','freeze','freezeUntil']
  ])for(const roll of [0,.999]){
    const C=require('../public/js/combat/'+moduleName+'-combat.js'),{run,a,e,events}=arena(roll);
    Object.assign(e,D.ENEMIES[type],{type,hp:100000,maxHp:100000,attacks:0});
    C.init(run); assert.ok(C.start(run,e,a,api,events),moduleName+'/'+type); const p=e[moduleName+'Plan'];
    Object.assign(p,{kind:'melee',status,damage:10,power:1,times:[0],next:0,elapsed:0,duration:1000,
      radius:9999,aim:{x:a.x,y:a.y},origin:{x:e.x,y:e.y},shapes:[{kind:'circle',center:{x:a.x,y:a.y},radius:9999}],
      hitMembers:new Set(),frozen:0,freezeMs:1500}); e.targetId=a.id;
    C.advance(run,e,api,events); assert.equal(!!a[key],roll>0,moduleName+'/'+status);
  }
});
test('volcano, castle and goddess resist each ailment without removing direct damage or shortening duration', () => {
  for(const status of ['burn','armor-break','curse','sleep','silence','root','freeze','sand','poison'])for(const roll of [0,.999]){
    const {run,a,e,events}=arena(roll); const hp=a.hp;
    if(['burn','armor-break'].includes(status))V.damage(run,e,a,{status,damage:10,power:1,hitCounts:new Map(),times:[0]},api,events);
    else if(['curse','sleep','silence'].includes(status))Castle.status(run,a,{status},api,events);
    else Goddess.status(run,e,a,status,api,events);
    const key={burn:'burn','armor-break':'armorBreakUntil',curse:'enemyCurseUntil',sleep:'sleepUntil',silence:'silenceUntil',root:'rootUntil',freeze:'freezeUntil',sand:'sandSlowUntil',poison:'goddessDot'}[status];
    assert.equal(!!a[key],roll>0,status);
    if(['burn','armor-break'].includes(status))assert.equal(a.hp,hp-1);
    if(roll>0&&status==='silence')assert.equal(a.silenceUntil,run.time+1500);
    if(roll===0)assert.ok(events.some(e=>e.kind==='resistance'),status);
  }
});
test('resistance art has real alpha, visible pixels and no clipping',()=>{
  const {PNG}=require('pngjs'),fs=require('node:fs'),path=require('node:path');
  const png=PNG.sync.read(fs.readFileSync(path.join(__dirname,'../public',G.describe(gem('unique',1)).image)));
  assert.equal(png.width,128);assert.equal(png.height,128);let occupied=0;
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const a=png.data[(y*128+x)*4+3];if(x<8||x>=120||y<8||y>=120)assert.equal(a,0);if(a>32)occupied++;}
  assert.ok(occupied>1000);
});

