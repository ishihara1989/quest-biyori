'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../public/js/combat/swamp-combat.js'),E=require('../development/labs/js/enemy-effects.js');
function near(type){const battle=S.create(type,{autoHero:false});battle.enemy.x=battle.hero.x+battle.enemy.range-10;battle.enemy.cooldown=100000;return battle;}
test('mud grab stops movement at impact and releases at expiry; misses do not root',()=>{
  const b=near('mud-hand');b.enemy.attacks=1;S.startAttack(b);
  S.update(b,320);assert.equal(b.hero.rootUntil,0);
  S.update(b,40);assert.ok(b.hero.rootUntil>b.time);
  const position={x:b.hero.x,y:b.hero.y};b.heroTarget={x:700,y:500};S.update(b,1500);
  assert.deepEqual({x:b.hero.x,y:b.hero.y},position);
  b.enemy.cooldown=100000;S.update(b,1000);assert.ok(b.hero.x>position.x);assert.equal(b.hero.rootAnchor,null);
  const miss=near('mud-hand');miss.enemy.attacks=1;S.startAttack(miss);miss.hero.x=90;S.update(miss,400);assert.equal(miss.hero.rootUntil,0);
});
test('root refresh never changes the anchor and dead targets discard restraint',()=>{
  const b=near('mud-hand');S.applyStatus(b,b.hero,'root');const p={...b.hero.rootAnchor};S.update(b,500);S.applyStatus(b,b.hero,'root');
  assert.deepEqual(b.hero.rootAnchor,p);assert.ok(b.hero.rootUntil>2600);
  S.hurt(b,b.enemy,b.hero,b.hero.hp);assert.equal(b.hero.rootUntil,0);assert.equal(b.hero.rootAnchor,null);assert.equal(S.applyStatus(b,b.hero,'root'),false);
});
test('giant heavy slam holds raised fists and delivers exactly triple damage at the release frame',()=>{
  const b=near('mud-giant');b.enemy.attacks=1;S.startAttack(b);const hp=b.hero.hp;
  S.update(b,1400);assert.equal(b.enemy.motion,'windup');assert.equal(b.hero.hp,hp);
  S.update(b,200);assert.equal(b.enemy.motion,'slam');assert.equal(b.hero.hp,hp);
  S.update(b,200);assert.equal(b.hero.hp,hp-b.enemy.damage*3);
});
test('lich chants before dark magic; the release uses the original area and can miss',()=>{
  const b=near('lich');b.enemy.attacks=1;S.startAttack(b);S.update(b,1400);assert.equal(b.enemy.motion,'chant');
  const hp=b.hero.hp;b.hero.x=90;S.update(b,800);assert.equal(b.hero.hp,hp);
  const hit=near('lich');hit.enemy.attacks=1;S.startAttack(hit);S.update(hit,2100);assert.equal(hit.hero.hp,hit.hero.maxHp-hit.enemy.damage*3);
});
test('hydra continuous attacks hit eight times in two loops and breath follows charging',()=>{
  const b=near('hydra');S.startAttack(b);const events=S.update(b,1500);
  assert.equal(events.filter(e=>e.type==='damage'&&e.kind==='bite').length,8);
  const breath=near('hydra');breath.enemy.attacks=1;S.startAttack(breath);S.update(breath,1800);assert.equal(breath.enemy.motion,'charge');
  const effects=S.update(breath,400);assert.equal(breath.enemy.motion,'breath');assert.ok(breath.hero.poison);assert.equal(breath.hero.poison.damage,6);
  const gas=effects.find(e=>e.type==='effect'&&e.effect==='hydra-poison-breath');assert.ok(gas);assert.equal(gas.y,breath.enemy.y-breath.enemy.height*.52);assert.equal(gas.x,breath.enemy.x-breath.enemy.height*.55);
});
test('poison projectiles launch once, hit after flight and apply damage over time',()=>{
  const b=near('giga-toad');S.startAttack(b);const first=S.update(b,400);assert.equal(first.filter(e=>e.type==='projectile').length,1);assert.equal(b.hero.hp,b.hero.maxHp);
  const later=S.update(b,500);assert.equal(later.filter(e=>e.type==='projectile').length,0);assert.ok(b.hero.poison);
  const hp=b.hero.hp;S.update(b,1000);assert.equal(b.hero.hp,hp-3);
});
test('fixed-step updates are deterministic across browser frame sizes',()=>{
  const a=near('hydra'),b=near('hydra');S.startAttack(a);S.startAttack(b);S.update(a,4000);for(let i=0;i<240;i++)S.update(b,S.STEP);
  for(const actor of ['enemy','hero'])for(const key of ['hp','x','y','motion','motionTime'])assert.equal(a[actor][key],b[actor][key],actor+'/'+key);
});
test('down animation remains terminal and dead enemies never attack again',()=>{
  const b=near('skeleton');S.hurt(b,b.hero,b.enemy,1);S.update(b,440);assert.equal(S.pose(b,b.enemy).motion,'hit');S.update(b,40);assert.equal(S.pose(b,b.enemy).motion,'idle');
  S.hurt(b,b.hero,b.enemy,b.enemy.hp);S.update(b,1500);assert.equal(b.status,'victory');assert.equal(S.pose(b,b.enemy).motion,'down');
  const hp=b.hero.hp;S.update(b,10000);assert.equal(b.hero.hp,hp);assert.equal(b.enemy.plan,null);
});
test('time-based restraint preview holds its target during pause/seek and releases after 2200ms',()=>{
  const m={loop:false,durationMs:780,effectPreview:{target:{x:80,y:240},assets:[{id:'mud-bind'}]},events:[{effect:'mud-bind',timeMs:340,durationMs:2200}],transitions:{idleLeadInMs:1600,idleLeadOutMs:1600}};
  assert.equal(E.targetAt(m,339).rooted,false);const p=E.targetAt(m,340);assert.equal(p.rooted,true);
  for(const t of [500,1000,2000,2539])assert.deepEqual(E.targetAt(m,t),p);
  assert.equal(E.targetAt(m,2540).rooted,false);assert.deepEqual(E.activeAt(m,2000),E.activeAt(m,2000));
});
test('invalid enemies, elapsed time and status ids are rejected',()=>{
  assert.throws(()=>S.create('missing'),RangeError);assert.throws(()=>S.sequence('missing'),RangeError);
  const b=S.create();assert.throws(()=>S.update(b,NaN),RangeError);assert.throws(()=>S.update(b,-1),RangeError);assert.throws(()=>S.applyStatus(b,b.hero,'missing'),RangeError);
});
