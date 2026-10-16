'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const { createServer } = require('../../server.cjs');
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const catalog = require('../../public/assets/museum/index.json');
const output = path.resolve(__dirname, '../../output/content-discovery-ui');

async function main() {
  const server = createServer({ development: false }); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = []; fs.mkdirSync(output, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
  const url = 'http://127.0.0.1:' + server.address().port + '/', publicRoot = path.resolve(__dirname, '../../public');
  // Serve the real public files through Playwright routing in restricted runtimes.
  await page.route(url + '**', route => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    if (pathname === '/favicon.ico') return route.fulfill({ status: 204 });
    const file = path.resolve(publicRoot, '.' + (pathname === '/' ? '/game.html' : pathname)), relative = path.relative(publicRoot, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: 'Missing file' });
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif' };
    return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  page.setDefaultTimeout(15000);
  page.on('pageerror', e => errors.push(e.stack));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(({ key, seed }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
    let data, sim;
    Object.defineProperty(window, 'ForestData', { configurable: true, get: () => data, set(value) {
      data = value; const read = value.readSave; value.readSave = (...args) => window.testSave = read(...args);
    } });
    Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => sim, set(value) {
      sim = value; const create = value.createRun; value.createRun = (...args) => window.testRun = create(...args);
    } });
  }, { key: D.SAVE_KEY, seed: D.freshSave() });
  const open = async name => {
    await page.locator('.main-nav [data-open=' + name + ']').click();
    if (name === 'museum') await page.locator('.museum').waitFor();
  };
  const close = () => page.locator('#close-menu').click();
  const markup = () => page.locator('#menu-content').innerHTML();
  const readyMuseum = () => page.locator('.museum-message').waitFor({ state: 'hidden' });
  const itemIds = () => page.locator('.inventory-grid [data-item]').evaluateAll(nodes => nodes.map(n => n.dataset.item));
  const shot = name => page.screenshot({ path: path.join(output, name + '.png'), animations: 'disabled' });
  try {
    await page.clock.install(); await page.goto(url);
    await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await open('stages');
      assert.equal(await page.locator('[data-stage-region]').count(), 1);
      assert.equal(await page.locator('.stage-map [data-stage]').count(), 1);
      assert.equal(await page.locator('[data-special-stages]').count(), 0);
      assert.equal(await page.locator('.encounter-list .enemy-chip').count(), 0); await close();
      await open('inventory'); await page.locator('[data-filter=material]').click(); assert.deepEqual(await itemIds(), ['potion']);
      assert.doesNotMatch(await markup(), /ヒュドラ|スライムの雫|エピック|沼地/);
      await page.locator('[data-filter=conversion]').click();
      assert.equal(await page.locator('[data-conversion-region], [data-recipe]').count(), 0); await close();
      await open('skills');
      assert.equal(await page.locator('[data-growth-node=moon]').count(), 0);
      assert.equal(await page.locator('.level-column').count(), 1);
      assert.doesNotMatch(await markup(), /月輪薙ぎ|魔法使い|パラディン|忍者|呪術師|巫女/);
      await shot('initial-skills-' + width); await close();
      await open('museum'); await page.locator('[data-museum-side=ally]').click(); await readyMuseum();
      assert.equal(await page.locator('[data-museum-owner]').count(), 1);
      await page.locator('[data-museum-kind=skill]').click(); await readyMuseum();
      assert.equal(await page.locator('[data-museum-clip]').count(), 1);
      await page.locator('[data-museum-side=enemy]').click();
      assert.equal(await page.locator('[data-museum-owner]').count(), 0);
      assert.equal(await page.locator('[data-museum-control=region] option').count(), 1);
      assert.equal(await page.locator('[data-museum-action=play]').isDisabled(), true);
      await shot('empty-museum-' + width);
      assert.equal(await page.locator('#menu-content').evaluate(el => el.scrollWidth <= el.clientWidth + 2), true); await close();
      await open('gems'); assert.equal(await page.locator('.gem-wallet > div').count(), 0);
      assert.equal(await page.locator('[data-filter=gem-workshop]').count(), 0);
      assert.doesNotMatch(await markup(), /レジェンダリー|エピック|ユニーク/); await close();
      await open('options'); assert.doesNotMatch(await markup(), /パラディン|忍者|呪術師|巫女|沼地|遺跡/); await close();
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    // The first encounter is recorded at battle start, without requiring a clear.
    await page.locator('#start-button').click();
    assert.deepEqual(await page.evaluate(() => testSave.encounteredEnemies), ['slime']);
    await open('museum'); await page.locator('[data-museum-side=enemy]').click(); await readyMuseum();
    assert.deepEqual(await page.locator('[data-museum-owner]').evaluateAll(ns => ns.map(n => n.dataset.museumOwner)), ['slime']); await close();
    // A later wave records its boss when it spawns, before any stage clear.
    await page.evaluate(() => { testSave.cleared = [1]; });
    await open('stages'); await page.locator('.stage-map [data-stage="2"]').click();
    await page.locator('[data-enter="2"]').click();
    for (let wave = 0; wave < 2; wave++) {
      await page.evaluate(() => testRun.enemies.forEach(e => { e.hp = 0; }));
      await page.clock.runFor(2000);
    }
    assert.ok(await page.evaluate(() => testSave.encounteredEnemies.includes('boss-slime')));
    await open('museum'); await page.locator('[data-museum-side=enemy]').click();
    assert.equal(await page.locator('[data-museum-owner=boss-slime]').count(), 1); await close();

    await page.evaluate(() => {
      testSave.cleared = Array.from({ length: 10 }, (_, i) => i + 1);
      testSave.autoGear.characters = ['miko', 'warrior', 'ninja', 'mage', 'shaman', 'paladin'];
    });
    await open('options');
    assert.deepEqual(await page.locator('[data-gear-group=characters][data-gear-target]').evaluateAll(ns => ns.map(n => n.dataset.gearTarget)), ['warrior', 'mage', 'paladin']);
    assert.doesNotMatch(await markup(), /忍者|呪術師|巫女/);
    await page.locator('[data-gear-group=characters][data-gear-move=mage][data-direction="-1"]').click();
    assert.deepEqual(await page.evaluate(() => testSave.autoGear.characters), ['miko', 'mage', 'ninja', 'warrior', 'shaman', 'paladin']); await close();
    await page.evaluate(() => { testSave.cleared = [1]; });
    await open('forge');
    const visibleForge = await page.locator('[data-growth-node]').evaluateAll(ns => ns.map(n => n.dataset.growthNode));
    assert.deepEqual(visibleForge, P.gearTree('warrior', 'weapon', 1).filter(n => n.stage === 1).map(n => n.id));
    assert.equal(await page.locator('[data-forge-region]').count(), 1); await close();

    // Every class is checked below and exactly at its skill unlock boundaries.
    await page.evaluate(() => { testSave.cleared = Array.from({ length: 40 }, (_, i) => i + 1); });
    for (const job of Object.keys(P.CHARACTERS)) {
      const levels = [1, 4, 5, 99, 100];
      for (const level of levels) {
        await page.evaluate(({ job, level }) => {
          testSave.progression.selected = job; testSave.progression.characters[job].xp = ForestProgression.experience(level);
        }, { job, level });
        await open('skills');
        assert.deepEqual(await page.locator('[data-growth-node]').evaluateAll(ns => ns.map(n => n.dataset.growthNode)),
          P.SKILLS[job].filter(n => (n.unlockLevel || 1) <= level).map(n => n.id), job + ' Lv.' + level);
        const selected = await page.locator('.node-detail strong').innerText();
        assert.ok(P.SKILLS[job].some(n => n.name === selected && (n.unlockLevel || 1) <= level));
        await close();
        await open('museum'); await page.locator('[data-museum-side=ally]').click();
        await page.locator('[data-museum-owner=' + job + ']').click();
        await page.locator('[data-museum-kind=skill]').click(); await readyMuseum();
        const expected = catalog.owners.find(o => o.id === job).clips.filter(c => c.kind === 'skill' && (c.unlockLevel || 1) <= level).map(c => c.id);
        assert.deepEqual(await page.locator('[data-museum-clip]').evaluateAll(ns => ns.map(n => n.dataset.museumClip)), expected);
        await close();
      }
    }
    await page.evaluate(() => {
      testSave.inventory.jelly = 0; testSave.inventory.tusk = 100;
      testSave.progression.selected = 'warrior';
      testSave.cleared = Array.from({ length: 50 }, (_, i) => i + 1);
      ForestProgression.addGem(testSave, GemSystem.generate({ rarity: 'rare', family: 'attack', random: () => .5 }));
    });
    await open('inventory'); await page.locator('[data-filter=material]').click();
    assert.deepEqual(await itemIds(), ['jelly', 'tusk', 'potion', 'gem-shard-rare']);
    await page.locator('[data-filter=conversion]').click();
    assert.equal(await page.locator('[data-recipe]').count(), 0); await close();
    await open('gems'); await page.locator('[data-filter=gem]').click();
    assert.equal(await page.locator('.gem-wallet > div').count(), 1);
    assert.equal(await page.locator('[data-gem-convert]').count(), 0);
    await page.locator('[data-filter=gem-workshop]').click();
    assert.deepEqual(await page.locator('[data-gem-craft-field=rarity] option').evaluateAll(ns => ns.map(n => n.value)), ['rare']);
    await page.locator('[data-filter=gem-dismantle]').click();
    assert.doesNotMatch(await markup(), /レジェンダリー|エピック|ユニーク|砂漠|高原|氷河|火山|魔城/); await close();
    // Sparse known rarities must never convert across an undiscovered middle tier.
    await page.evaluate(() => ForestProgression.addGem(testSave, GemSystem.generate({ rarity: 'legendary', level: 6, random: () => .5 })));
    await open('gems'); await page.locator('[data-filter=gem]').click();
    assert.equal(await page.locator('[data-gem-convert=rare]').count(), 0); await close();
    await page.evaluate(() => {
      ForestProgression.addGem(testSave, GemSystem.generate({ rarity: 'unique', random: () => .5 }));
      testSave.inventory['gem-shard-rare'] = 20;
      for (const id of ['flower', 'wood', 'crystal']) testSave.inventory[id] = 100;
    });
    await open('inventory'); await page.locator('[data-filter=conversion]').click();
    assert.equal(await page.locator('[data-conversion-region]').count(), 1);
    assert.equal(await page.locator('[data-recipe]').count(), 5);
    await page.locator('[data-conversion-region="1"]').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-conversion-region="1"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('[data-convert="1-common-crystal-crystal"]:not([data-convert-max])').isDisabled(), true);
    const before = await page.evaluate(() => testSave.inventory.crystal);
    await page.locator('[data-convert="1-crystal-common-jelly"]:not([data-convert-max])').click();
    assert.equal(await page.evaluate(() => testSave.inventory.crystal), before - 1);
    assert.equal(await page.evaluate(() => testSave.inventory.jelly), 3);
    await close();
    await open('gems'); await page.locator('[data-filter=gem]').click();
    assert.equal(await page.locator('[data-gem-convert=rare]').count(), 4);
    await page.locator('[data-gem-convert=rare][data-gem-convert-times="1"]').click();
    assert.equal(await page.evaluate(() => testSave.inventory['gem-shard-rare']), 10); await close();
    // Acquired and spent rarity history and encounters survive a reload.
    await page.evaluate(key => {
      for (const g of [...testSave.gems]) GemSystem.dismantle(testSave, g.id);
      for (const r of testSave.discoveredGemRarities) testSave.inventory[GemSystem.shardKey(r)] = 0;
      localStorage.setItem(key, JSON.stringify(testSave));
    }, D.SAVE_KEY);
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await open('gems');
    assert.equal(await page.locator('.gem-wallet > div').count(), 3); await close();
    await page.evaluate(() => {
      testSave.cleared = ForestData.ALL_STAGES.map(s => s.id);
      testSave.inventory[GemSystem.Epic.MATERIAL] = 100;
      ForestProgression.addGem(testSave, GemSystem.generate({ rarity: 'epic', random: () => .5 }));
    });
    await open('gems'); await page.locator('[data-filter=gem-workshop]').click();
    await page.locator('[data-gem-craft-field=rarity]').selectOption('epic');
    assert.equal(await page.locator('[data-gem-convert=legendary]').count(), 4); await close();
    await open('museum'); await page.locator('[data-museum-side=enemy]').click();
    assert.equal(await page.locator('[data-museum-owner]').count(), catalog.owners.filter(o => o.side === 'enemy').length);
    await page.locator('[data-museum-owner=' + D.SPECIAL_STAGES.at(-1).id + ']').click(); await readyMuseum();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.locator('#menu-content').evaluate(el => el.scrollWidth <= el.clientWidth + 2), true);
      await shot('discovered-museum-' + width);
    }
    assert.deepEqual(errors, []);
    console.log('PASS discovery UI: fresh and existing saves; encounters, all classes at Lv.1/4/5/99/100; acquired/spent items and rarities; material and shard conversions; museum empty/full states; 1440px/390px.');
  } finally { await context.close(); await browser.close(); await new Promise(r => server.close(r)); }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { main };
