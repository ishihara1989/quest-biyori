'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../tools/lib/project-paths.cjs').assetPaths;
const P = require('../public/js/core/forest-progression.js'), D = require('../public/js/data/forest-data.js'), V = require('../public/js/ui/equipment-visuals.js');
const prefixes = ['', 'swamp-', 'cave-', 'coast-', 'ruins-', 'desert-', 'highland-', 'glacier-', 'volcano-', 'castle-'];
function richSave() {
  const save = D.freshSave(); save.cleared = D.ALL_STAGES.map(s => s.id); save.gold = 1e9;
  for (const item of D.ITEMS) save.inventory[item.id] = 100000;
  return save;
}
test('equipment evolves on main acquisition only, independently for every character and slot, through all ten regions', () => {
  for (const character of Object.keys(P.CHARACTERS)) for (const slot of ['weapon', 'armor']) {
    const save = richSave(), other = slot === 'weapon' ? 'armor' : 'weapon';
    const base = P.equipmentAppearance(save, character, slot);
    assert.equal(base.region, 1, 'clearing stages does not change equipment');
    for (let region = 2; region <= 10; region++) {
      const state = save.progression.characters[character], previous = P.equipmentAppearance(save, character, slot);
      // A stray side-node ID in a save must not imply a new main acquisition.
      state[slot].push(prefixes[region - 1] + 'branch-1-up-1');
      assert.deepEqual(P.equipmentAppearance(save, character, slot), previous);
      state[slot].pop();
      save.gold = 0;
      assert.equal(P.purchaseGearPath(save, character, slot, prefixes[region - 1] + 'main-1'), false);
      assert.deepEqual(P.equipmentAppearance(save, character, slot), previous);
      save.gold = 1e9;
      assert.equal(P.purchaseGearPath(save, character, slot, prefixes[region - 1] + 'main-1'), true);
      const current = P.equipmentAppearance(save, character, slot);
      assert.equal(current.region, region); assert.notEqual(current.image, previous.image); assert.notEqual(current.name, previous.name);
      assert.equal(P.equipmentAppearance(save, character, other).region, 1);
      const restored = D.readSave(JSON.stringify(save));
      assert.deepEqual(P.equipmentAppearance(restored, character, slot), current, 'appearance is derived after reload');
      assert.equal(P.purchase(save, character, slot, prefixes[region - 1] + 'main-2'), true);
      assert.deepEqual(P.equipmentAppearance(save, character, slot), current, 'later main nodes keep regional appearance');
    }
  }
});
test('all branches and uniques have class-specific names and effect-appropriate icons; main previews show their region', () => {
  for (const slot of ['weapon', 'armor']) {
    const names = new Set();
    for (const character of Object.keys(P.CHARACTERS)) {
      const nodes = P.gearTree(character, slot), branch = nodes.find(n => n.id === 'branch-1-up-1');
      assert.ok(!names.has(branch.name)); names.add(branch.name);
      assert.match(branch.icon, new RegExp('/' + character + '/'));
      for (let region = 1; region <= 10; region++) {
        const tree = P.gearTree(character, slot, region);
        assert.equal(tree.length, 100);
        for (const n of tree) {
          assert.ok(fs.existsSync(path.resolve(__dirname, '../public', n.icon)), n.icon);
          if (n.main) assert.equal(n.icon, V.image(character, slot, region));
          if (n.effect.attackSpeed) assert.ok(n.icon.endsWith('/tempo.png'));
          if (n.unique && n.id.includes('crown-3-')) assert.ok(n.icon.endsWith(slot === 'weapon' ? '/skill.png' : '/recovery.png'));
        }
      }
    }
  }
  assert.equal(V.image('miko', 'weapon'), 'assets/ui/ruins/icons/miko-gohei.png');
  assert.equal(V.image('paladin', 'armor'), 'assets/skills/paladin/icons/aegis.png');
});

test('goddess root is the sole main node, previews dedicated equipment and updates only its acquired slot', () => {
  const Auto = require('../public/js/core/forest-auto-gear.js');
  for (const character of Object.keys(P.CHARACTERS)) for (const slot of ['weapon', 'armor']) {
    const save = richSave(), tree = P.gearTree(character, slot, 'goddess'), root = tree[0];
    assert.equal(root.id, 'goddess-root'); assert.equal(root.main, true); assert.ok(!root.unique);
    assert.equal(tree.filter(n => n.main).length, 1); assert.equal(tree.filter(n => n.unique).length, 40);
    assert.equal(root.icon, V.image(character, slot, 'goddess'));
    const state = save.progression.characters[character];
    state[slot] = ['castle-main-1', 'goddess-sp-1'];
    assert.equal(P.equipmentAppearance(save, character, slot).region, 10, 'a branch cannot change appearance');
    assert.ok(P.purchase(save, character, slot, root.id));
    const current = P.equipmentAppearance(save, character, slot);
    assert.equal(current.region, 'goddess'); assert.equal(current.image, root.icon);
    assert.match(current.name, /^星界の/);
    assert.equal(P.equipmentAppearance(save, character, slot === 'weapon' ? 'armor' : 'weapon').region, 1);
    assert.deepEqual(P.equipmentAppearance(D.readSave(JSON.stringify(save)), character, slot), current);
  }
  const save = richSave();
  save.progression.characters.warrior.weapon = P.allGearTrees('warrior', 'weapon').map(n => n.id);
  save.progression.characters.warrior.armor = P.allGearTrees('warrior', 'armor').map(n => n.id);
  save.autoGear = { ...Auto.fresh(), enabled: true, excludedKinds: ['sub', 'unique'], excludedCharacters: Object.keys(P.CHARACTERS).filter(id => id !== 'warrior') };
  const bought = Auto.acquire(save);
  assert.equal(bought.length, 2); assert.ok(bought.every(row => row.node === 'goddess-root' && row.kind === 'main'));
});

test('late equipment artwork has unique pixels, native alpha, consistent size and clear outer padding', () => {
  const { PNG } = require('pngjs'), crypto = require('node:crypto'), hashes = new Set();
  for (const character of Object.keys(P.CHARACTERS)) for (const slot of ['weapon', 'armor']) {
    const previous = fs.readFileSync(path.resolve(__dirname, '../public', V.image(character, slot, 5)));
    hashes.add(crypto.createHash('sha256').update(previous).digest('hex'));
    for (const region of [6, 7, 8, 9, 10, 'goddess']) {
      const file = path.resolve(__dirname, '../public', V.image(character, slot, region)), bytes = fs.readFileSync(file);
      const hash = crypto.createHash('sha256').update(bytes).digest('hex');
      assert.ok(!hashes.has(hash), file + ': dedicated artwork'); hashes.add(hash);
      const { width, height, data } = PNG.sync.read(bytes);
      assert.equal(width, 128); assert.equal(height, 128);
      let visible = 0;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (x < 6 || y < 6 || x >= 122 || y >= 122) assert.equal(alpha, 0, file + ': transparent padding');
        if (alpha) visible++;
      }
      assert.ok(visible > 500 && visible < 12000, file + ': readable transparent silhouette');
    }
  }
});
