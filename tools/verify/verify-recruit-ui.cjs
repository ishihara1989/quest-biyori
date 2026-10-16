'use strict';
// Isolated saves and a controlled battle finish exercise the real result flow.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js');
const output = path.resolve(__dirname, '../../output/recruit');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const errors = [];
async function setup(browser, stage, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const seed = D.freshSave();
  seed.cleared = Array.from({ length: stage - 1 }, (_, i) => i + 1);
  seed.selectedStage = stage; seed.autoMode = 'same';
  await page.addInitScript(({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)), { key: D.SAVE_KEY, seed });
  await page.route('**/js/forest-simulation.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + `\n(() => {
      const original = ForestSimulation.update;
      ForestSimulation.update = (run, dt) => {
        if (run.status !== 'running') return original(run, dt);
        run.status = 'victory'; run.elapsed = 12500;
        return [{ type: 'finished', victory: true }];
      };
    })();` });
  });
  await page.clock.install();
  await page.goto(url);
  await page.locator('#start-button:not([disabled])').waitFor();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  await page.locator('#start-button').click();
  await page.clock.runFor(900);
  return { page, context };
}
async function expectIntro(page, name, character) {
  assert.equal(await page.locator('#recruit-intro').isVisible(), true);
  assert.equal(await page.locator('.result-panel').isHidden(), true);
  assert.equal(await page.locator('#recruit-title').innerText(), name);
  assert.match(await page.locator('#recruit-portrait').getAttribute('src'), new RegExp('assets/' + character + '/idle-0[1-4]\\.png'));
  assert.equal(await page.locator('#result-overlay').getAttribute('aria-labelledby'), 'recruit-title');
  assert.equal(await page.locator('#recruit-continue').evaluate(n => n === document.activeElement), true);
  assert.equal(await page.locator('.game-shell').evaluate(n => n.inert), true);
  assert.equal(await page.locator('.loot-result-item:visible').count(), 0);
  assert.equal(await page.locator('#repeat-countdown').innerText(), '');
}
async function expectResult(page) {
  assert.equal(await page.locator('#recruit-intro').isHidden(), true);
  assert.equal(await page.locator('.result-panel').isVisible(), true);
  assert.equal(await page.locator('#result-overlay').getAttribute('aria-labelledby'), 'result-title');
  assert.equal(await page.locator('#result-recruit').isVisible(), true);
  assert.equal(await page.locator('#recruit-continue').evaluate(n => n === document.activeElement), false);
}
async function expectUnlock(page) {
  assert.equal(await page.locator('#recruit-intro').isHidden(), true);
  assert.equal(await page.locator('#unlock-intro').isVisible(), true);
  assert.equal(await page.locator('.result-panel').isHidden(), true);
  assert.equal(await page.locator('#result-overlay').getAttribute('aria-labelledby'), 'unlock-title');
  assert.equal(await page.locator('#unlock-continue').evaluate(n => n === document.activeElement), true);
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const mage = await setup(browser, 4);
    await expectIntro(mage.page, '魔法使い', 'mage');
    await mage.page.clock.runFor(1500);
    await mage.page.screenshot({ path: path.join(output, 'mage-desktop.png') });
    await mage.page.clock.runFor(2500);
    assert.equal(await mage.page.locator('#recruit-intro').isVisible(), true);
    await mage.page.clock.runFor(500);
    await expectUnlock(mage.page);
    await mage.page.clock.runFor(3200);
    await expectResult(mage.page);
    assert.equal(await mage.page.locator('#result-chest').getAttribute('data-frame'), '0');
    assert.equal(await mage.page.locator('.loot-result-item:visible').count(), 0);
    await mage.page.clock.runFor(2800);
    assert.equal(await mage.page.locator('#result-overlay.loot-complete').isVisible(), true);
    assert.equal(await mage.page.locator('[data-loot-id=potion]').isVisible(), true);
    const saved = await mage.page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
    assert.equal(saved.cleared.filter(id => id === 4).length, 1);
    assert.equal(saved.inventory.potion, 4);
    await mage.page.screenshot({ path: path.join(output, 'mage-result.png') });
    await mage.page.clock.runFor(7500);
    assert.equal(await mage.page.locator('#result-overlay').isVisible(), true);
    assert.equal(await mage.page.locator('#recruit-intro').isHidden(), true);
    assert.equal(await mage.page.locator('[data-loot-id=potion]').count(), 0);
    const repeated = await mage.page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
    assert.equal(repeated.inventory.potion, saved.inventory.potion);
    await mage.context.close();
    console.log('PASS mage automatic reveal, fresh chest timeline, AUTO repeat and no repeated recruitment/reward');

    const paladin = await setup(browser, 10, { viewport: { width: 390, height: 844 } });
    await expectIntro(paladin.page, 'パラディン', 'paladin');
    await paladin.page.clock.runFor(1500);
    await paladin.page.screenshot({ path: path.join(output, 'paladin-mobile.png') });
    assert.equal(await paladin.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const bounds = await paladin.page.locator('#recruit-continue').boundingBox();
    assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 844);
    await paladin.page.locator('#recruit-continue').press('Enter');
    await expectUnlock(paladin.page);
    await paladin.page.locator('#unlock-continue').press('Enter');
    await expectResult(paladin.page);
    assert.equal(await paladin.page.locator('#result-chest').getAttribute('data-frame'), '0');
    assert.equal(await paladin.page.locator('#result-skip').evaluate(n => n === document.activeElement), true);
    await paladin.page.locator('#result-skip').click();
    assert.equal(await paladin.page.locator('#result-overlay.loot-complete').isVisible(), true);
    await paladin.page.locator('#retry-button').click();
    assert.equal(await paladin.page.locator('#result-overlay').isHidden(), true);
    await paladin.page.clock.runFor(900);
    assert.equal(await paladin.page.locator('#recruit-intro').isHidden(), true);
    await paladin.context.close();
    console.log('PASS paladin mobile layout, keyboard skip, focus handoff and manual retry');

    const quiet = await setup(browser, 4, { reducedMotion: 'reduce' });
    await expectIntro(quiet.page, '魔法使い', 'mage');
    assert.equal(await quiet.page.locator('#recruit-portrait').evaluate(n => getComputedStyle(n).animationName), 'none');
    await quiet.page.screenshot({ path: path.join(output, 'mage-reduced-motion.png') });
    await quiet.page.clock.runFor(2400);
    await expectUnlock(quiet.page);
    await quiet.page.clock.runFor(2000);
    await expectResult(quiet.page);
    assert.equal(await quiet.page.locator('#result-overlay.loot-complete').isVisible(), true);
    assert.equal(await quiet.page.locator('#result-chest').getAttribute('data-frame'), '3');
    await quiet.context.close();
    console.log('PASS reduced motion keeps recruitment visible before normal result');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
