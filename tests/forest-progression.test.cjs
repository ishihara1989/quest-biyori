'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const P = require('../public/js/core/forest-progression.js'), D = require('../public/js/data/forest-data.js'), S = require('../public/js/combat/forest-simulation.js');
function richSave() {
  const save = D.freshSave(); save.cleared = Array.from({ length: 10 }, (_, i) => i + 1); save.gold = 1000000;
  for (const item of D.ITEMS.filter(i => i.type !== 'gem')) save.inventory[item.id] = 10000;
  for (const c of Object.values(save.progression.characters)) c.xp = P.experience(16);
  return save;
}
const builds = save => Object.fromEntries(Object.keys(P.CHARACTERS).filter(id => P.unlocked(save, id)).map(id => [id, P.stats(save, id)]));
function plantDuel(type, warriorBuild) {
  const run = S.createRun(4, { random: () => .5, builds: warriorBuild ? { warrior: warriorBuild } : {} });
  run.hero.mp = 0; run.hero.mpRegen = 0; run.hero.skill = 0; run.hero.cooldown = 0;
  run.enemies = [{ ...run.enemies[0], ...D.ENEMIES[type], type, hp: 100000, maxHp: 100000, damage: 0, cooldown: 100000 }];
  return run;
}
test('warrior normal attacks reach both plant enemies from the expanded range without MP', () => {
  for (const build of [undefined, P.stats(D.freshSave(), 'warrior')]) for (const type of ['alraune-minion', 'alraune']) {
    const run = plantDuel(type, build), enemy = run.enemies[0];
    enemy.x = run.hero.x + 170; enemy.y = run.hero.y;
    assert.equal(run.hero.range, 180);
    const hits = S.update(run, 400).filter(e => e.type === 'damage' && e.source === 'hero');
    assert.equal(hits.length, 1, type); assert.equal(hits[0].skill, false); assert.equal(hits[0].target, enemy.id);
  }
});
test('warrior starts normal attacks at fractional range boundaries and continues attacking stationary plants', () => {
  for (const type of ['alraune-minion', 'alraune']) {
    const run = plantDuel(type, P.stats(D.freshSave(), 'warrior')), enemy = run.enemies[0];
    enemy.x = run.hero.x + run.hero.range + 1e-10; enemy.y = run.hero.y;
    S.update(run, S.STEP); assert.equal(run.hero.state, 'attacking', type);
    const hits = S.update(run, 3500).filter(e => e.type === 'damage' && e.source === 'hero' && !e.skill);
    assert.ok(hits.length >= 3, type + ' keeps attacking');
  }
});
test('warrior closes diagonal gaps to stationary plants and still rejects targets outside the hit range', () => {
  for (const type of ['alraune-minion', 'alraune']) {
    const run = plantDuel(type, P.stats(D.freshSave(), 'warrior')), enemy = run.enemies[0];
    enemy.x = 700; enemy.y = 410;
    assert.ok(S.update(run, 7000).some(e => e.type === 'damage' && e.source === 'hero' && !e.skill), type);
    run.hero.state = 'attacking'; run.hero.hit = false; run.hero.time = 0;
    enemy.x = run.hero.x + run.hero.range + 25; enemy.y = run.hero.y;
    assert.equal(S.update(run, 400).some(e => e.type === 'damage' && e.source === 'hero'), false);
  }
});
test('mage joins only on forest 4 and persists through old-save migration', () => {
  const save = D.freshSave();
  for (const id of [1, 2, 3]) D.award(save, id);
  assert.equal(P.unlocked(save, 'mage'), false);
  assert.equal(P.purchase(save, 'mage', 'skills', 'arcane'), false);
  assert.equal(D.award(save, 4).recruited, 'mage');
  assert.deepEqual(save.progression.characters.mage.xp, P.experience(4));
  assert.equal(P.points(save, 'mage'), 4);
  assert.equal(P.points(D.readSave(JSON.stringify(save)), 'mage'), 4);
  assert.equal(P.unlocked(save, 'mage'), true); assert.equal(save.inventory.staff, undefined); assert.equal(save.inventory.robe, undefined);
  assert.equal(D.award(save, 4).recruited, null);
  const old = { ...save }; delete old.progression; delete old.inventory.staff; delete old.inventory.robe;
  const migrated = D.readSave(JSON.stringify(old));
  assert.equal(migrated.gold, old.gold); assert.deepEqual(migrated.cleared, old.cleared);
  assert.equal(migrated.inventory.staff, undefined); assert.equal(migrated.inventory.robe, undefined);
  assert.equal(P.unlocked(migrated, 'mage'), true);
  assert.deepEqual(migrated.progression.characters.mage.xp, P.experience(4));
  assert.equal(P.points(migrated, 'mage'), 4);
});

test('restoring a recruited mage guarantees the starting level SP and preserves spent points', () => {
  const save = D.freshSave();
  D.award(save, 4);
  save.progression.characters.mage.xp = P.experience(1);
  const restored = D.readSave(JSON.stringify(save));
  assert.deepEqual(restored.progression.characters.mage.xp, P.experience(4));
  assert.equal(P.points(restored, 'mage'), 4);
  for (let i = 0; i < 4; i++) assert.equal(P.purchase(restored, 'mage', 'skills', 'bolt'), true);
  assert.equal(P.points(restored, 'mage'), 0);
  const reloaded = D.readSave(JSON.stringify(restored));
  assert.equal(P.rank(reloaded, 'mage', 'bolt'), 4);
  assert.equal(P.points(reloaded, 'mage'), 0);
  assert.equal(D.award(reloaded, 4).recruited, null);
  assert.equal(P.points(reloaded, 'mage'), 0);
  P.gainXp(reloaded, 5);
  assert.equal(P.level(reloaded.progression.characters.mage.xp), 5);
  assert.equal(P.points(reloaded, 'mage'), 1);
});
test('each character has independent weapon and armor trees with ten stage gates and nonexclusive branches', () => {
  const save = richSave();
  for (const id of ['warrior', 'mage']) for (const slot of ['weapon', 'armor']) {
    const nodes = P.gearTree(id, slot); assert.equal(nodes.length, 100);
    assert.deepEqual(nodes.filter(n => n.main).map(n => n.stage), save.cleared);
    assert.equal(P.purchase(save, id, slot, 'main-10'), false);
    for (const n of nodes) assert.equal(P.purchase(save, id, slot, n.id), true, id + '/' + slot + '/' + n.id);
    assert.equal(save.progression.characters[id][slot].length, 100);
    assert.equal(P.capacity(save, id, slot).common, 100);
  }
  assert.ok(P.stats(save, 'warrior').damage > P.CHARACTERS.warrior.base.damage);
});
test('purchases are atomic, reject duplicates, and require clear, prerequisites and exact costs', () => {
  const save = D.freshSave(), before = JSON.stringify(save);
  assert.equal(P.purchase(save, 'warrior', 'weapon', 'main-1'), false); assert.equal(JSON.stringify(save), before);
  D.award(save, 1); save.gold = 9; save.inventory.jelly = 0;
  const short = JSON.stringify(save); assert.equal(P.purchase(save, 'warrior', 'weapon', 'main-1'), false); assert.equal(JSON.stringify(save), short);
  save.gold = 10; const gold = save.gold;
  assert.equal(P.purchase(save, 'warrior', 'weapon', 'main-1'), true); assert.equal(save.gold, gold - 10); assert.equal(save.inventory.jelly, 0);
  const purchased = JSON.stringify(save); assert.equal(P.purchase(save, 'warrior', 'weapon', 'main-1'), false); assert.equal(JSON.stringify(save), purchased);
  assert.deepEqual(save.progression.characters.warrior.armor, []);
});

test('bulk gear acquisition spends exact totals and matches individual purchases for every character and slot', () => {
  for (const id of Object.keys(P.CHARACTERS)) for (const slot of ['weapon', 'armor']) {
    const save = richSave(), individual = richSave();
    if(P.CHARACTERS[id].unlock>10){save.cleared.push(P.CHARACTERS[id].unlock);individual.cleared.push(P.CHARACTERS[id].unlock);}
    const path = ['main-1', 'main-2', 'main-3', 'branch-3-up-1', 'branch-3-up-2', 'branch-3-up-3', 'branch-3-up-4'];
    const before = JSON.stringify(save), plan = P.gearPurchasePlan(save, id, slot, path.at(-1));
    assert.equal(plan.status, 'available'); assert.deepEqual(plan.nodes.map(n => n.id), path);
    assert.equal(JSON.stringify(save), before, 'preview is read-only');
    save.gold = plan.cost.gold; save.inventory = { potion: 3, ...plan.cost }; delete save.inventory.gold;
    individual.gold = save.gold; individual.inventory = { ...save.inventory };
    for (const nodeId of path) assert.equal(P.purchase(individual, id, slot, nodeId), true);
    assert.equal(P.purchaseGearPath(save, id, slot, path.at(-1)), true);
    assert.deepEqual(save, individual); assert.equal(save.gold, 0);
    assert.ok(Object.keys(plan.cost).filter(key => key !== 'gold').every(key => save.inventory[key] === 0));
    assert.deepEqual(P.stats(save, id), P.stats(individual, id));
    assert.deepEqual(D.readSave(JSON.stringify(save)), save);
    const owned = JSON.stringify(save);
    assert.equal(P.gearPurchasePlan(save, id, slot, path.at(-1)).status, 'owned');
    assert.equal(P.purchaseGearPath(save, id, slot, path.at(-1)), false);
    assert.equal(JSON.stringify(save), owned);
  }
});

test('bulk gear acquisition skips owned nodes and unrelated branches, including paths across regions', () => {
  const save = richSave(); save.cleared = Array.from({ length: 20 }, (_, i) => i + 1);
  assert.equal(P.purchaseGearPath(save, 'mage', 'armor', 'branch-2-down-2'), true);
  const acquired = [...save.progression.characters.mage.armor];
  const plan = P.gearPurchasePlan(save, 'mage', 'armor', 'swamp-crown-2-3');
  const path = [...Array.from({ length: 8 }, (_, i) => 'main-' + (i + 3)), ...Array.from({ length: 10 }, (_, i) => 'swamp-main-' + (i + 1)), 'swamp-crown', 'swamp-crown-2-1', 'swamp-crown-2-2', 'swamp-crown-2-3'];
  assert.deepEqual(plan.nodes.map(n => n.id), path);
  const expected = structuredClone(save);
  for (const nodeId of path) assert.equal(P.purchase(expected, 'mage', 'armor', nodeId), true);
  assert.equal(P.purchaseGearPath(save, 'mage', 'armor', path.at(-1)), true);
  assert.deepEqual(save, expected); assert.deepEqual(save.progression.characters.mage.armor, [...acquired, ...path]);
  assert.deepEqual(save.progression.characters.mage.weapon, []);
  assert.deepEqual(save.progression.characters.warrior.armor, []);
  assert.deepEqual(D.readSave(JSON.stringify(save)), save);
});

test('bulk gear acquisition rejects any shortage, uncleared prerequisite stage and invalid targets without partial spending', () => {
  const target = 'crown-1-3', plan = P.gearPurchasePlan(richSave(), 'warrior', 'weapon', target);
  for (const [key, amount] of Object.entries(plan.cost)) {
    const save = richSave();
    if (key === 'gold') save.gold = amount - 1; else save.inventory[key] = amount - 1;
    const before = JSON.stringify(save);
    assert.equal(P.gearPurchasePlan(save, 'warrior', 'weapon', target).status, 'cost');
    assert.equal(P.purchaseGearPath(save, 'warrior', 'weapon', target), false);
    assert.equal(JSON.stringify(save), before, key);
  }
  const gated = richSave(); gated.cleared = gated.cleared.filter(stage => stage !== 2);
  assert.equal(P.gearPurchasePlan(gated, 'warrior', 'weapon', target).blockedStage, 2);
  const fresh = D.freshSave(); fresh.gold = 100000; fresh.inventory.jelly = 100;
  for (const [save, id, slot, node] of [[gated, 'warrior', 'weapon', target], [fresh, 'mage', 'weapon', 'main-1'], [fresh, 'warrior', 'weapon', 'main-1'], [gated, 'warrior', 'weapon', 'swamp-main-1'], [gated, 'constructor', 'weapon', target], [gated, 'warrior', 'skills', 'renjin'], [gated, 'warrior', 'weapon', 'unknown']]) {
    const before = JSON.stringify(save);
    assert.equal(P.purchaseGearPath(save, id, slot, node), false);
    assert.equal(JSON.stringify(save), before);
  }
});
test('XP and skill points grow only for recruited characters; point budgets and dependencies hold', () => {
  const save = D.freshSave(); assert.equal(P.points(save, 'warrior'), 1);
  assert.equal(P.purchase(save, 'warrior', 'skills', 'fury'), false);
  assert.equal(P.purchase(save, 'warrior', 'skills', 'edge'), true);
  assert.equal(P.purchase(save, 'warrior', 'skills', 'renjin'), false); assert.equal(P.points(save, 'warrior'), 0);
  assert.equal(P.purchase(save, 'warrior', 'skills', 'flow'), false);
  assert.deepEqual(P.gainXp(save, 2), ['warrior']); assert.equal(P.stats(save, 'warrior').level, 2); assert.equal(P.points(save, 'warrior'), 1);
  assert.deepEqual(save.progression.characters.mage.xp, P.experience());
  D.award(save, 4); P.gainXp(save, 5); assert.equal(P.stats(save, 'mage').level, 5);
});
test('decreasing a skill refunds one rank, then all orphaned enhancement ranks for either character', () => {
  for (const [id, active, passive] of [['warrior', 'moon', 'edge'], ['mage', 'wind', 'arcane']]) {
    const save = richSave(), c = save.progression.characters[id], other = id === 'warrior' ? 'mage' : 'warrior';
    const untouched = JSON.stringify({ character: save.progression.characters[other], gold: save.gold, inventory: save.inventory, xp: c.xp, weapon: c.weapon, armor: c.armor, gems: c.gems });
    for (const [node, ranks] of [[active, 2], [active + '-enhance', 3], [passive, 2]]) {
      for (let i = 0; i < ranks; i++) assert.equal(P.purchase(save, id, 'skills', node), true);
    }
    const points = P.points(save, id);
    assert.equal(P.decreaseSkill(save, id, active), 1);
    assert.equal(P.rank(save, id, active), 1);
    assert.equal(P.rank(save, id, active + '-enhance'), 3);
    assert.equal(P.points(save, id), points + 1);
    assert.equal(P.decreaseSkill(save, id, active), 4);
    assert.equal(P.rank(save, id, active), 0);
    assert.equal(P.rank(save, id, active + '-enhance'), 0);
    assert.equal(P.rank(save, id, passive), 2);
    assert.equal(P.points(save, id), points + 5);
    assert.deepEqual(c.skills, [passive]);
    assert.deepEqual(c.skillRanks, { [passive]: 2 });
    assert.deepEqual(D.readSave(JSON.stringify(save)), save);
    assert.equal(JSON.stringify({ character: save.progression.characters[other], gold: save.gold, inventory: save.inventory, xp: c.xp, weapon: c.weapon, armor: c.armor, gems: c.gems }), untouched);
  }
});

test('decreasing max-rank enhancements and passives preserves parents and updates live builds', () => {
  const save = richSave();
  for (const [node, ranks] of [['moon', 1], ['moon-enhance', 5], ['edge', 2]]) {
    for (let i = 0; i < ranks; i++) assert.equal(P.purchase(save, 'warrior', 'skills', node), true);
  }
  const before = P.stats(save, 'warrior'), run = S.createRun(1, { builds: builds(save) });
  run.hero.hp /= 2; run.hero.mp /= 2;
  assert.equal(P.decreaseSkill(save, 'warrior', 'moon-enhance'), 1);
  assert.equal(P.rank(save, 'warrior', 'moon-enhance'), 4);
  assert.equal(P.rank(save, 'warrior', 'moon'), 1);
  assert.ok(P.stats(save, 'warrior').warriorSkills[0].power < before.warriorSkills[0].power);
  assert.equal(P.decreaseSkill(save, 'warrior', 'edge'), 1);
  assert.equal(P.stats(save, 'warrior').baseDamage, before.baseDamage / 1.1 * 1.05);
  assert.equal(P.decreaseSkill(save, 'warrior', 'moon'), 5);
  S.applyBuilds(run, builds(save));
  assert.deepEqual(run.hero.warriorSkills, []);
  assert.equal(run.hero.hp / run.hero.maxHp, .5);
  assert.equal(run.hero.mp / run.hero.maxMp, .5);
});

test('refunds cascade through multiple prerequisites in any node order and respect individual point costs', () => {
  const original = P.SKILLS.warrior;
  P.SKILLS.warrior = [
    { id: 'leaf', cost: 4, requires: ['branch', 'other'] },
    { id: 'branch', cost: 3, requires: ['root'] },
    { id: 'sibling', cost: 2, requires: ['root'] },
    { id: 'root', cost: 2, requires: [] },
    { id: 'other', cost: 1, requires: [] },
    { id: 'free-child', cost: 1, requires: ['free'] },
    { id: 'free', cost: 0, requires: [] },
  ].map(n => ({ ...n, maxRank: 5, unlockLevel: 1, effect: {} }));
  try {
    const save = richSave(); save.progression.characters.warrior.xp = P.experience(100);
    for (const [node, ranks] of [['root', 1], ['other', 1], ['branch', 2], ['leaf', 3], ['sibling', 2], ['free-child', 1]]) {
      for (let i = 0; i < ranks; i++) assert.equal(P.purchase(save, 'warrior', 'skills', node), true);
    }
    const before = P.points(save, 'warrior');
    assert.equal(P.decreaseSkill(save, 'warrior', 'root'), 24);
    assert.equal(P.points(save, 'warrior'), before + 24);
    for (const node of ['root', 'branch', 'leaf', 'sibling']) assert.equal(P.rank(save, 'warrior', node), 0);
    for (const node of ['other', 'free-child', 'free']) assert.equal(P.rank(save, 'warrior', node), 1);
    const unchanged = JSON.stringify(save);
    assert.equal(P.decreaseSkill(save, 'warrior', 'free'), 0);
    assert.equal(JSON.stringify(save), unchanged);
  } finally { P.SKILLS.warrior = original; }
});

test('unlearned, unknown and locked skill refunds cannot change saves or create points', () => {
  const save = D.freshSave();
  const before = JSON.stringify(save);
  for (const [id, node] of [['warrior', 'moon'], ['warrior', 'unknown'], ['mage', 'wind'], ['unknown', 'edge'], ['constructor', 'edge']]) {
    assert.equal(P.decreaseSkill(save, id, node), 0);
    assert.equal(JSON.stringify(save), before);
  }
  assert.equal(P.purchase(save, 'warrior', 'skills', 'renjin'), true);
  assert.equal(P.decreaseSkill(save, 'warrior', 'renjin'), 1);
  assert.equal(P.rank(save, 'warrior', 'renjin'), 0);
  assert.equal(P.rank(save, 'warrior', 'renjin-enhance'), 0);
  assert.equal(P.points(save, 'warrior'), 1);
  const refunded = JSON.stringify(save);
  assert.equal(P.decreaseSkill(save, 'warrior', 'renjin'), 0);
  assert.equal(JSON.stringify(save), refunded);
  assert.equal(P.purchase(save, 'warrior', 'skills', 'renjin'), true);
  assert.equal(P.points(save, 'warrior'), 0);
});

test('refunds remove legacy skill-list entries so fallback ranks cannot revive reset skills', () => {
  const save = richSave(), c = save.progression.characters.warrior;
  c.skills = ['moon', 'moon-enhance']; delete c.skillRanks;
  const before = P.points(save, 'warrior');
  assert.equal(P.decreaseSkill(save, 'warrior', 'moon'), 2);
  assert.equal(P.points(save, 'warrior'), before + 2);
  assert.deepEqual(c.skills, []); assert.deepEqual(c.skillRanks, {});
});

test('individual gems consume directional capacity and cannot be equipped twice across characters',()=>{
  const save=richSave(),a=P.addGem(save,P.Gem.generate({family:'attack',random:()=>.5})),d=P.addGem(save,P.Gem.generate({family:'defense',size:1,random:()=>.5}));
  assert.equal(P.equipGem(save,'warrior','weapon',d.id),false);assert.equal(P.equipGem(save,'warrior','armor',d.id),true);
  assert.equal(P.equipGem(save,'warrior','weapon',a.id),true);assert.equal(P.equipGem(save,'mage','weapon',a.id),false);
  assert.deepEqual(P.gemOwner(save,a.id),{character:'warrior',slot:'weapon'});assert.equal(P.toggleGem(save,'mage','weapon',a.id),true);
  assert.equal(P.toggleGem(save,'mage','weapon',a.id),true);assert.deepEqual(P.gemOwner(save,a.id),{character:'mage',slot:'weapon'});
  assert.deepEqual(D.readSave(JSON.stringify(save)),save);
});

test('copies of a gem have distinct identities, independent equipment and additive effects',()=>{
  const save=D.freshSave(),gems=Array.from({length:5},()=>P.addGem(save,P.Gem.generate({family:'physical',random:()=>.5})));
  assert.deepEqual(gems.map(g=>g.id),[1,2,3,4,5]);for(const gem of gems.slice(0,4))assert.equal(P.equipGem(save,'warrior','weapon',gem.id),true);
  assert.equal(P.availableGems(save,'rare-physical'),1);assert.equal(P.stats(save,'warrior').weaponFlat,4*P.Gem.describe(gems[0]).effect.weaponFlat);
  assert.equal(P.equipGem(save,'warrior','weapon',gems[4].id),false);assert.equal(P.unequipGem(save,'warrior','weapon',gems[0].id),true);
  assert.equal(P.stats(save,'warrior').weaponFlat,3*P.Gem.describe(gems[1]).effect.weaponFlat);assert.deepEqual(D.readSave(JSON.stringify(save)),save);
});

test('save validation rejects duplicate instance IDs and duplicate equipment, and discounts apply per copy',()=>{
  const save=richSave(),gem=P.addGem(save,'rare-physical',1,()=>.5);P.equipGem(save,'warrior','weapon',gem.id);
  const dirty=structuredClone(save);dirty.gems.push({...gem},{id:90,type:'unknown'});dirty.progression.characters.mage.gems.weapon.push(gem.id,90);
  const clean=D.readSave(JSON.stringify(dirty));assert.deepEqual(clean.gems,[gem]);assert.deepEqual(clean.progression.characters.mage.gems.weapon,[]);
  assert.ok(P.addGem(clean,'rare-physical',1,()=>.5).id>gem.id);const discounted=richSave();for(const n of P.gearTree('warrior','weapon'))assert.equal(P.purchase(discounted,'warrior','weapon',n.id),true);
  const a=P.addGem(discounted,'rare-physical',1,()=>.5);assert.equal(P.gemCost(discounted,'warrior','weapon',a.id),90);
  assert.equal(P.equipGem(discounted,'warrior','weapon',a.id),true);assert.deepEqual(D.readSave(JSON.stringify(discounted)),discounted);
});

test('save restoration retains valid builds and rejects invalid nodes, budgets, gem ownership and locked mage', () => {
  const save = richSave();
  P.purchase(save, 'warrior', 'skills', 'renjin'); P.purchase(save, 'warrior', 'skills', 'renjin-enhance');
  P.purchase(save, 'warrior', 'weapon', 'main-1'); P.purchase(save, 'warrior', 'weapon', 'branch-1-up-1');
  P.equipGem(save, 'warrior', 'armor', P.addGem(save, 'rare-defense',1,()=>.5).id);
  assert.deepEqual(D.readSave(JSON.stringify(save)), save);
  const dirty = D.freshSave(); dirty.progression.selected = 'mage';
  dirty.progression.characters.warrior.skills = ['fury', 'edge', 'edge', 'evade', 'flow'];
  dirty.progression.characters.warrior.weapon = ['main-10', 'branch-1-up-1'];
  dirty.progression.characters.warrior.gems.armor = ['sapphire']; dirty.progression.characters.mage.skills = ['arcane'];
  const clean = D.readSave(JSON.stringify(dirty));
  assert.equal(clean.progression.selected, 'warrior'); assert.deepEqual(clean.progression.characters.warrior.skills, []);
  assert.deepEqual(clean.progression.characters.warrior.weapon, []); assert.deepEqual(clean.progression.characters.warrior.gems.armor, []);
  assert.deepEqual(clean.progression.characters.mage.skills, []);
  dirty.progression.selected = 'toString'; dirty.progression.characters.warrior.gems.armor = ['constructor', '__proto__'];
  assert.equal(D.readSave(JSON.stringify(dirty)).progression.selected, 'warrior');
  assert.equal(P.purchase(save, 'constructor', 'skills', 'edge'), false);
});
test('MP gates skills and regenerates; speed changes attack timing independently of cooldown', () => {
  const save = D.freshSave(); save.progression.characters.warrior.xp=P.experience(5);P.purchase(save,'warrior','skills','moon');
  const build = builds(save), run = S.createRun(1, { random: () => .5, builds: build });
  run.enemies.forEach(e => { e.hp = 100000; e.damage = 0; });
  run.hero.mp = 0; run.hero.mpRegen = 0; run.hero.skill = 0; run.hero.x = run.enemies[0].x - 90;
  let events = S.update(run, 1500); assert.equal(events.some(e => e.type === 'damage' && e.skill), false); assert.ok(events.some(e => e.type === 'damage' && e.source === 'hero'));
  run.hero.mpRegen = 5; S.update(run, 1000); assert.ok(run.hero.mp > 4.9 && run.hero.mp < 5.1);
  run.hero.mp = 80; events = S.update(run, 1600); assert.ok(events.some(e => e.type === 'damage' && e.skill));
  const slow = S.createRun(1, { random: () => .5, builds: build }), fast = S.createRun(1, { random: () => .5, builds: { warrior: { ...build.warrior, attackSpeed: 2 } } });
  for (const r of [slow, fast]) { r.hero.x = r.enemies[0].x - 80; r.hero.state = 'attacking'; r.hero.time = 0; r.hero.cooldown = 2000; }
  assert.equal(S.update(slow, 100).some(e => e.type === 'damage' && e.source === 'hero'), false);
  assert.equal(S.update(fast, 100).some(e => e.type === 'damage' && e.source === 'hero'), true);
  assert.equal(fast.hero.skillInterval, slow.hero.skillInterval);
});
test('live build changes preserve HP/MP ratios so toggles cannot heal', () => {
  const save = richSave(), run = S.createRun(3, { builds: builds(save) }); run.hero.hp /= 2; run.hero.mp /= 2;
  P.purchase(save, 'warrior', 'armor', 'main-1'); S.applyBuilds(run, builds(save));
  assert.equal(run.hero.hp / run.hero.maxHp, .5); assert.equal(run.hero.mp / run.hero.maxMp, .5);
});
test('mage attacks alongside warrior and party survives when one member falls', () => {
  const save = richSave(), run = S.createRun(1, { random: () => .5, builds: builds(save) });
  assert.deepEqual(run.allies.map(a=>a.type), ['mage','paladin']);
  assert.ok(S.update(run, 7000).some(e => e.type === 'damage' && e.source === 'mage'));
  const solo = S.createRun(1, { random: () => .5, builds: builds(save) }); solo.hero.hp = 0; solo.hero.state = 'down'; solo.allies.find(a=>a.type==='paladin').hp=0;
  const events = S.update(solo, 3000); assert.notEqual(solo.status, 'defeat'); assert.ok(events.some(e => e.type === 'damage' && e.source === 'mage'));
  assert.equal(S.heal(solo), 0);
});
function mageDuel({ mp = 0, attackSpeed = 1, chain = false } = {}) {
  const save = D.freshSave(); D.award(save, 4);
  const run = S.createRun(4, { random: () => .5, builds: builds(save) });
  run.hero.hp = 0; run.hero.state = 'down';
  const mage = run.allies[0];
  Object.assign(mage, { x: 250, y: 400, mp, mpRegen: 0, cooldown: 0, skill: 0, attackSpeed, interval: 1250 / attackSpeed, chain });
  run.enemies = [{ ...run.enemies[0], x: 550, y: 400, hp: 10000, maxHp: 10000, speed: 0, damage: 0, cooldown: 100000 }];
  return run;
}

test('mage projectiles produce the same battle results across rendering frame intervals', () => {
  const a = mageDuel({ mp: 130 }), b = mageDuel({ mp: 130 });
  S.update(a, 4200);
  for (let i = 0; i < 168; i++) S.update(b, 25);
  assert.deepEqual(a.allies, b.allies); assert.deepEqual(a.enemies, b.enemies);
  assert.deepEqual(a.projectiles, b.projectiles); assert.equal(a.kills, b.kills);
});

// Spell geometry, casting, chain and crowd-control coverage lives in mage-skills.test.cjs.
