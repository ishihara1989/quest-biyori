'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const output = path.resolve(__dirname, '../../output/balance'); fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const seed = D.freshSave(); seed.cleared = Array.from({ length: 10 }, (_, i) => i + 1); seed.selectedStage = 2; seed.autoMode = 'advance'; seed.gold = 100000;
  for (const item of D.ITEMS.filter(i => i.type !== 'gem')) seed.inventory[item.id] = 1000;
  for (const c of Object.values(seed.progression.characters)) c.xp = P.experience(10, .25);
  for (const type of ['ruby', 'ruby', 'sapphire', 'twinflare', 'ruby']) P.addGem(seed, type);
  const save = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
  const shot = name => page.screenshot({ path: path.join(output, name + '.png') });
  const open = menu => page.locator('[data-open=' + menu + ']').first().click();
  const close = () => page.locator('#close-menu').click();
  const gem = id => page.locator('[data-gem-instance="' + id + '"]');
  async function forceWin() {
    for (let wave = 0; wave < 3; wave++) {
      await page.evaluate(() => window.testRun.enemies.forEach(e => { e.hp = 0; }));
      await page.clock.runFor(1800);
    }
    assert.equal(await page.evaluate(() => window.testRun.status), 'victory');
  }
  async function nextLoop() {
    await page.clock.runFor(1000); if (await page.locator('#result-skip').isVisible()) await page.locator('#result-skip').click();
    await page.clock.runFor(5200);
  }
  try {
    await page.clock.install();
    await page.addInitScript(({ key, seed }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
      localStorage.setItem('unrelated-storage', 'keep');
      // Observe the actual simulation instance while keeping game logic intact.
      let simulation;
      Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => simulation, set(value) {
        simulation = value; const create = value.createRun;
        value.createRun = (...args) => { window.testRun = create(...args); return window.testRun; };
      } });
    }, { key: D.SAVE_KEY, seed });
    await page.goto(url + 'game.html'); await page.locator('#start-button:not([disabled])').waitFor();
    assert.match(await page.locator('.sidebar-xp b').textContent(), /^25\.00%$/);
    await open('options'); assert.equal(await page.locator('[data-auto-mode=advance]').getAttribute('aria-pressed'), 'true'); await shot('options'); await close();

    await open('inventory'); assert.equal(await page.locator('[data-item=ruby]').count(), 0);
    await close(); await open('gems'); assert.equal(await page.locator('[data-gem-instance]').count(), 5);
    assert.equal(await gem(1).locator('b').count(), 0);
    await gem(2).click({ button: 'right' }); assert.deepEqual(P.gemOwner(await save(), 2), { character: 'warrior', slot: 'weapon' });
    assert.equal(await page.locator('[data-gem-instance]').first().getAttribute('data-gem-instance'), '2');
    await gem(1).click({ button: 'right' });
    const before = JSON.stringify(await save()); await gem(5).click({ button: 'right' }); assert.equal(JSON.stringify(await save()), before);
    await page.locator('[data-inventory-slot=armor]').click(); await gem(3).click({ button: 'right' });
    assert.deepEqual(P.gemOwner(await save(), 3), { character: 'warrior', slot: 'armor' });
    await page.locator('[data-inventory-character=mage]').click(); await page.locator('[data-inventory-slot=weapon]').click(); await gem(4).click({ button: 'right' });
    assert.deepEqual(P.gemOwner(await save(), 4), { character: 'mage', slot: 'weapon' });
    assert.equal(await gem(4).locator('.gem-owner-badge img').getAttribute('alt'), '魔法使い');
    await gem(2).click({ button: 'right' }); assert.equal(P.gemOwner(await save(), 2), null); assert.ok(P.gemOwner(await save(), 1));
    await page.clock.runFor(3000); await shot('gems'); await close();
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor();
    assert.deepEqual(P.gemOwner(await save(), 4), { character: 'mage', slot: 'weapon' });
    assert.equal((await save()).inventory.ruby, undefined);

    await open('forge'); assert.equal(await page.locator('.forge-tree [data-growth-node]').count(), 100);
    assert.equal(await page.locator('.forge-milestones>span').count(), 10);
    await page.locator('[data-buy-node=main-1]').click(); assert.equal((await save()).progression.characters.mage.weapon.length, 1);
    await shot('forge-main');
    await page.locator('.forge-viewport').evaluate(e => { e.scrollLeft = 1600; e.scrollTop = 150; }); await shot('forge-end'); await close();

    for (const [width, height] of [[820, 900], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      for (const menu of ['options', 'inventory', 'forge']) {
        await open(menu); if (menu === 'inventory') { await close(); await open('gems'); }
        await page.clock.runFor(100); await shot(menu + '-' + width);
        const bounds = await page.locator('#menu-dialog').boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y + bounds.height <= height, menu + ' fits ' + width);
        await close();
      }
    }
    await page.setViewportSize({ width: 1440, height: 1050 });

    await page.locator('#start-button').click(); await forceWin(); await nextLoop();
    assert.equal(await page.evaluate(() => window.testRun.stage.id), 3, 'advances after victory');
    await page.evaluate(() => { for (const actor of [window.testRun.hero, ...window.testRun.allies]) { actor.hp = 0; actor.state = 'down'; } });
    await page.clock.runFor(1000); assert.equal(await page.evaluate(() => window.testRun.status), 'defeat');
    assert.equal((await save()).autoMode, 'same'); await shot('defeat-retreat'); await nextLoop();
    assert.equal(await page.evaluate(() => window.testRun.stage.id), 2, 'retreats one stage');
    await forceWin(); await nextLoop(); assert.equal(await page.evaluate(() => window.testRun.stage.id), 2, 'farms the previous stage after a win');
    await page.locator('#repeat-button').click(); await page.locator('[data-auto-mode=off]').click(); await close();
    await forceWin(); await nextLoop(); assert.equal(await page.evaluate(() => window.testRun.status), 'victory', 'OFF stops');
    assert.ok((await page.locator('#result-run-stats').textContent()).includes('%'));

    await page.locator('#result-auto').click(); const priorReset = JSON.stringify(await save());
    await page.locator('[data-reset-save]').click(); assert.equal(await page.locator('#reset-dialog').isVisible(), true); await shot('reset-confirm');
    await page.locator('#reset-cancel').click(); assert.equal(JSON.stringify(await save()), priorReset);
    await page.locator('[data-reset-save]').click();
    await Promise.all([page.waitForEvent('load'), page.locator('#reset-confirm').click()]);
    await page.locator('#start-button:not([disabled])').waitFor();
    assert.deepEqual(await save(), D.freshSave());
    assert.equal(await page.evaluate(() => localStorage.getItem('unrelated-storage')), 'keep');
    assert.equal(await page.locator('#start-overlay').isVisible(), true); await shot('reset-fresh');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks: 'percent XP, options, individual gem copies, right-click, capacity rejection, owner badges, equipped sorting, reload, 100-node forge, three widths, auto advance, defeat retreat and farming, OFF, reset cancel/confirm', screenshots: output }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
