'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const output = path.resolve(__dirname, '../../output/auto-gear');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const errors = [];
let server;
function seed(last = 0) {
  const save = D.freshSave(); save.cleared = Array.from({ length: last }, (_, i) => i + 1); save.autoMode = 'off';
  for (const c of Object.values(save.progression.characters)) c.xp = P.experience(Math.max(1, last));
  return save;
}
async function setup(browser, save, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  await page.addInitScript(({ key, save }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(save)); }, { key: D.SAVE_KEY, save });
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
  await page.clock.install(); await page.goto(url);
  await page.locator('#start-button:not([disabled])').waitFor();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  return { context, page, saved: () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY) };
}
async function finish(page) { await page.locator('#start-button').click(); await page.clock.runFor(900); }
function focused(page, id) { return page.locator('#' + id).evaluate(node => node === document.activeElement); }
(async () => {
  fs.mkdirSync(output, { recursive: true });
  if (process.env.FOREST_TEST_START_SERVER) {
    server = require('node:child_process').spawn(process.execPath, [path.resolve(__dirname, '../../server.cjs')], { env: { ...process.env, PORT: new URL(url).port }, windowsHide: true, stdio: ['ignore', 'pipe', 'inherit'] });
    await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); server.once('exit', code => reject(new Error('Test server exited: ' + code))); });
  }
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const locked = await setup(browser, seed(9));
    await locked.page.locator('[data-open=options]').first().click();
    assert.equal(await locked.page.locator('[data-auto-gear-toggle]').isDisabled(), true);
    assert.equal(await locked.page.locator('[data-gear-target=main]').isDisabled(), true);
    await locked.page.screenshot({ path: path.join(output, 'options-locked.png') });
    await locked.context.close();

    const rich = seed(10); rich.gold = 20;
    for (const item of D.ITEMS.filter(i => i.type === 'material')) rich.inventory[item.id] = 100;
    const settings = await setup(browser, rich), page = settings.page;
    await page.locator('[data-open=options]').first().click();
    assert.equal(await page.locator('[data-auto-gear-toggle]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-gear-move=mage][data-direction="-1"]').click();
    for (const id of ['warrior', 'paladin', 'sub', 'unique']) await page.locator('[data-gear-target=' + id + ']').click();
    assert.equal(await page.locator('[data-gear-group=characters][data-gear-target]').first().getAttribute('data-gear-target'), 'mage');
    for (const [width, height] of [[1440, 1000], [390, 844], [360, 740]]) {
      await page.setViewportSize({ width, height }); await page.clock.runFor(100);
      await page.locator('[data-gear-target=miko]').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const bounds = await page.locator('[data-gear-target=miko]').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
      await page.screenshot({ path: path.join(output, 'options-' + width + '.png') });
    }
    await page.locator('[data-auto-gear-toggle]').click();
    let saved = await settings.saved();
    assert.equal(saved.gold, 0); assert.deepEqual(saved.progression.characters.mage.weapon, ['main-1']);
    assert.deepEqual(saved.progression.characters.mage.armor, ['main-1']); assert.deepEqual(saved.progression.characters.warrior.weapon, []);
    assert.equal(await focused(page, 'menu-title'), false);
    assert.equal(await page.locator('[data-auto-gear-toggle]').evaluate(node => node === document.activeElement), true);
    await page.locator('[data-auto-gear-toggle]').click(); assert.equal((await settings.saved()).autoGear.enabled, false);
    saved = await settings.saved(); await page.reload(); await page.locator('#start-button:not([disabled])').waitFor();
    assert.deepEqual((await settings.saved()).autoGear, saved.autoGear);
    await page.locator('[data-open=options]').first().click(); await page.locator('[data-reset-save]').click();
    await page.locator('#reset-cancel').click(); assert.deepEqual((await settings.saved()).autoGear, saved.autoGear);
    await page.locator('[data-reset-save]').click(); await page.locator('#reset-confirm').click();
    await page.locator('#start-button:not([disabled])').waitFor(); assert.deepEqual((await settings.saved()).autoGear, D.freshSave().autoGear);
    await settings.context.close();
    console.log('PASS locked options, priorities/exclusions, immediate purchase, OFF, save/reload/reset and three viewport widths');

    const first = await setup(browser, seed());
    await first.page.locator('[data-open=forge]').first().click(); assert.equal(await first.page.locator('.forge-page-locked').isVisible(), true);
    await first.page.locator('#close-menu').click(); await finish(first.page);
    assert.equal(await first.page.locator('#unlock-intro').isVisible(), true);
    assert.equal(await first.page.locator('[data-unlock-id=forge-1]').isVisible(), true);
    assert.equal(await first.page.locator('#recruit-intro').isHidden(), true);
    assert.equal(await focused(first.page, 'unlock-continue'), true);
    await first.page.clock.runFor(900); await first.page.screenshot({ path: path.join(output, 'forest-forge-unlock.png') });
    await first.page.locator('#unlock-continue').press('Enter');
    assert.equal(await first.page.locator('#result-chest').getAttribute('data-frame'), '0');
    assert.equal(await focused(first.page, 'result-skip'), true);
    await first.page.locator('#result-skip').click(); assert.equal(await first.page.locator('#result-unlocks').isVisible(), true);
    await first.page.locator('#retry-button').click(); await first.page.clock.runFor(900);
    assert.equal(await first.page.locator('#unlock-intro').isHidden(), true);
    await first.context.close();

    for (const stage of [10, 11, 20, 50]) {
      const save = seed(stage - 1); save.selectedStage = stage;
      const scenario = await setup(browser, save, stage === 10 ? { viewport: { width: 390, height: 844 } } : {});
      await finish(scenario.page);
      if ([10, 20].includes(stage)) {
        assert.equal(await scenario.page.locator('#recruit-intro').isVisible(), true);
        assert.equal(await scenario.page.locator('#unlock-intro').isHidden(), true);
        await scenario.page.clock.runFor(1200);
        if (stage === 10) await scenario.page.screenshot({ path: path.join(output, 'paladin-recruit.png') });
        await scenario.page.locator('#recruit-continue').press('Enter');
      }
      assert.equal(await scenario.page.locator('#unlock-intro').isVisible(), true);
      assert.equal(await scenario.page.locator('.result-panel').isHidden(), true);
      assert.equal(await focused(scenario.page, 'unlock-continue'), true);
      const card = stage === 11 ? 'forge-2' : stage === 50 ? 'gem-workshop' : stage === 10 ? 'auto-gear' : 'recipes-20';
      assert.equal(await scenario.page.locator('[data-unlock-id="' + card + '"]').isVisible(), true);
      if (stage % 10 === 0) assert.equal(await scenario.page.locator('[data-unlock-id=recipes-' + stage + ']').isVisible(), true);
      await scenario.page.clock.runFor(1000); await scenario.page.screenshot({ path: path.join(output, 'unlock-stage-' + stage + '.png') });
      assert.equal(await scenario.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const bounds = await scenario.page.locator('#unlock-continue').boundingBox(); assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= (stage === 10 ? 844 : 1000));
      await scenario.page.clock.runFor(2500); assert.equal(await scenario.page.locator('#unlock-intro').isHidden(), true);
      assert.equal(await scenario.page.locator('.result-panel').isVisible(), true);
      await scenario.context.close();
    }
    const reduced = seed(9); reduced.selectedStage = 10;
    const quiet = await setup(browser, reduced, { reducedMotion: 'reduce' }); await finish(quiet.page);
    await quiet.page.clock.runFor(2300); assert.equal(await quiet.page.locator('#unlock-intro').isVisible(), true);
    assert.equal(await quiet.page.locator('.unlock-ring').evaluate(node => getComputedStyle(node).display), 'none');
    await quiet.page.clock.runFor(2100); assert.equal(await quiet.page.locator('#result-overlay.loot-complete').isVisible(), true);
    await quiet.context.close();
    const repeatSeed = seed(9); repeatSeed.selectedStage = 10; repeatSeed.autoMode = 'same';
    const repeat = await setup(browser, repeatSeed); await finish(repeat.page);
    await repeat.page.clock.runFor(4700);
    assert.equal(await repeat.page.locator('#unlock-intro').isVisible(), true);
    assert.equal((await repeat.saved()).inventory.potion, 4);
    assert.equal(await repeat.page.locator('#repeat-countdown').innerText(), '');
    await repeat.page.clock.runFor(2500); assert.equal(await repeat.page.locator('#unlock-intro').isVisible(), true);
    await repeat.page.clock.runFor(9000);
    assert.equal(await repeat.page.locator('#unlock-intro').isHidden(), true);
    assert.equal((await repeat.saved()).inventory.potion, 4);
    await repeat.context.close();
    assert.deepEqual(errors, []);
    console.log('PASS first-clear forge/recipe/options/workshop unlocks, recruitment-first order, focus/skip, repeat suppression and reduced motion');
  } finally { await browser.close(); server?.kill(); }
})().catch(error => { server?.kill(); console.error(error); process.exitCode = 1; });
