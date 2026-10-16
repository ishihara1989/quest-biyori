'use strict';
// Run against the local server in isolated browser contexts; never uses the player's browser save.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js');
const root = path.join(__dirname, '../..'), output = path.join(root, 'output');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const errors = [];
async function pageFor(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.clock.install();
  return page;
}
async function ready(page) {
  await page.goto(url);
  await page.locator('#start-button:not([disabled])').waitFor();
}
async function fixture(page, victory = true) {
  const seed = D.freshSave(); seed.cleared = [1,2,3,4,5,6,7,8,9]; seed.selectedStage = 10; seed.autoMode = victory ? 'same' : 'off';
  await page.addInitScript(({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)), { key: D.SAVE_KEY, seed });
  await page.route('**/js/forest-simulation.js', async route => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body + `\n(() => {
      const original = ForestSimulation.update;
      ForestSimulation.update = (run, dt) => {
        if (run.status !== 'running') return original(run, dt);
        run.random = () => 0; run.status = '${victory ? 'victory' : 'defeat'}'; run.gold = 138; run.kills = 3; run.elapsed = 12500;
        return ['slime', 'boss-slime', 'treant'].map(enemy => ({ type:'loot', enemy,
          gold:ForestData.ENEMIES[enemy].gold, x:600, y:400, timeMs:0 })).concat({ type:'finished', victory:${victory} });
      };
    })();` });
  });
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const executablePath = process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const natural = await pageFor(browser);
    await natural.addInitScript(() => {
      let data; Object.defineProperty(window, 'ForestData', { configurable: true, get: () => data, set(value) {
        data=value; const roll=value.rollMaterials; value.rollMaterials=enemy=>roll(enemy,()=>0);
      }});
    });
    await ready(natural);
    await natural.locator('#repeat-button').click(); await natural.locator('[data-auto-mode=off]').click(); await natural.locator('#close-menu').click();
    assert.equal(await natural.locator('#recent-loot').count(), 0);
    await natural.locator('#start-button').click();
    await natural.clock.runFor(45000);
    await natural.locator('#result-overlay.loot-complete').waitFor();
    assert.equal(await natural.locator('[data-loot-id=jelly] b').innerText(), '×12');
    assert.equal(await natural.locator('[data-loot-id=potion] b').innerText(), '×1');
    assert.equal(await natural.locator('#result-gold').innerText(), '+56');
    assert.equal(await natural.locator('#repeat-countdown').innerText(), '');
    const saved = await natural.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
    assert.equal(saved.inventory.jelly, 12); assert.equal(saved.inventory.potion, 4); assert.equal(saved.gold, 56);
    await natural.screenshot({ path: path.join(output, 'loot-result-natural.png') });
    await natural.close();
    console.log('PASS real stage clear: total loot, gold, first-clear reward and persistence');

    const page = await pageFor(browser); await fixture(page); await ready(page);
    await page.locator('#start-button').click(); await page.clock.runFor(750);
    await page.locator('#recruit-continue').click();
    assert.equal(await page.locator('#result-chest').getAttribute('data-frame'), '0');
    assert.equal(await page.locator('.loot-result-item:visible').count(), 0);
    await page.clock.runFor(400); assert.equal(await page.locator('#result-chest').getAttribute('data-frame'), '1');
    await page.clock.runFor(320); assert.equal(await page.locator('#result-chest').getAttribute('data-frame'), '2');
    await page.clock.runFor(350); assert.equal(await page.locator('#result-chest').getAttribute('data-frame'), '3');
    assert.equal(await page.locator('.loot-result-item:visible').count(), 0);
    await page.clock.runFor(650);
    assert.equal(await page.locator('[data-loot-group=common]').isVisible(), true);
    assert.equal(await page.locator('[data-loot-group=unique]').isVisible(), false);
    assert.equal(await page.locator('.game-shell').evaluate(node => node.inert), true);
    assert.equal(await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('#result-overlay') !== null), true);
    await page.locator('[data-loot-id=jelly]').click();
    const frameBeforeMenu = await page.locator('#result-chest').getAttribute('data-frame');
    await page.clock.runFor(9000);
    assert.equal(await page.locator('#result-chest').getAttribute('data-frame'), frameBeforeMenu);
    assert.equal(await page.locator('[data-loot-group=unique]').isVisible(), false);
    await page.locator('#close-menu').click();
    await page.clock.runFor(4500);
    await page.locator('#result-overlay.loot-complete').waitFor();
    assert.deepEqual(await page.locator('.loot-rarity-group:visible').evaluateAll(nodes => nodes.map(n => n.dataset.rarity)), ['common', 'uncommon', 'rare', 'unique']);
    assert.equal(await page.locator('#result-gold').innerText(), '+338');
    await page.locator('#result-auto').click(); await page.locator('[data-auto-mode=off]').click(); await page.locator('#close-menu').click();
    const savedBefore = await page.evaluate(key => localStorage.getItem(key), D.SAVE_KEY);
    await page.clock.runFor(1000);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), D.SAVE_KEY), savedBefore);
    await page.screenshot({ path: path.join(output, 'loot-result-desktop.png') });
    await page.locator('[data-loot-id=twinflare]').click();
    assert.equal(await page.locator('#menu-dialog').isVisible(), true);
    assert.match(await page.locator('#inventory-selection').innerText(), /双極のジェム/);
    await page.locator('#close-menu').click();
    await page.locator('#result-auto').click(); await page.locator('[data-auto-mode=same]').click(); await page.locator('#close-menu').click(); await page.clock.runFor(5100);
    assert.equal(await page.locator('#result-overlay').isHidden(), true);
    assert.equal(await page.locator('.game-shell').evaluate(node => node.inert), false);
    await page.clock.runFor(1700); // second run's result reaches the chest, without replaying first-clear reward
    assert.equal(await page.locator('[data-loot-id=potion]').count(), 0);
    await page.close();
    console.log('PASS four chest frames, ordered rarity reveal, loot detail, no duplicate grant and AUTO restart');

    const mobile = await pageFor(browser, { viewport: { width: 390, height: 844 } });
    await fixture(mobile); await ready(mobile); await mobile.locator('#start-button').click(); await mobile.clock.runFor(900);
    await mobile.locator('#recruit-continue').click();
    await mobile.locator('#result-skip').click(); await mobile.locator('#result-auto').click(); await mobile.locator('[data-auto-mode=off]').click(); await mobile.locator('#close-menu').click();
    await mobile.clock.runFor(1800);
    await mobile.screenshot({ path: path.join(output, 'loot-result-mobile.png'), fullPage: true });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await mobile.locator('#retry-button').click();
    assert.equal(await mobile.locator('#result-overlay').isHidden(), true);
    await mobile.close();
    console.log('PASS mobile layout, skip and retry');

    const quiet = await pageFor(browser, { reducedMotion: 'reduce' });
    await fixture(quiet, false); await ready(quiet); await quiet.locator('#start-button').click(); await quiet.clock.runFor(900);
    assert.equal(await quiet.locator('#result-overlay.loot-complete').isVisible(), true);
    assert.equal(await quiet.locator('#result-chest').getAttribute('data-frame'), '3');
    assert.equal(await quiet.locator('#result-skip').isHidden(), true);
    assert.equal(await quiet.locator('[data-loot-id=wood]').isVisible(), true);
    assert.equal(await quiet.locator('#next-button').isHidden(), true);
    assert.equal(await quiet.locator('#result-gold').innerText(), '+138');
    await quiet.clock.runFor(10000); assert.equal(await quiet.locator('#result-overlay').isVisible(), true);
    await quiet.close();
    console.log('PASS defeat retains earned loot, reduced motion and OFF stops automatic loops');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
