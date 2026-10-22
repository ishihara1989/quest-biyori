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
  await page.route('**/js/combat/forest-simulation.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + `\n(() => {
      const original = ForestSimulation.update;
      ForestSimulation.update = (run, dt) => {
        if (run.status !== 'running') return original(run, dt);
        run.status = 'victory'; run.elapsed = 12500;
        const loot = window.testGateWindfall ? [{ type: 'loot', enemy: 'boss-slime', gold: 1e9, goldRemainder: 0 }] : [];
        if (window.testGateWindfall) run.random = () => 0;
        return [...loot, { type: 'finished', victory: true }];
      };
    })();` });
  });
  await page.clock.install(); await page.goto(url);
  await page.locator('#start-button:not([disabled])').waitFor();
  assert.equal(await page.locator('#start-button span').innerText(), '開始', 'runtime images must load successfully');
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  await page.evaluate(() => {
    // The mocked clock stands still inside a task. Advance its CPU budget at
    // deterministic checkpoints to exercise suspension and cancellation too.
    const now = performance.now.bind(performance), acquire = ForestAutoGear.acquireSteps;
    let cpuTime = 0, steps = 0;
    performance.now = () => now() + cpuTime;
    ForestAutoGear.acquireSteps = function* (...args) {
      for (const row of acquire(...args)) {
        if (++steps % 800 === 0) cpuTime += 5;
        yield row;
      }
    };
  });
  return { context, page, saved: () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY) };
}
async function finish(page) { await page.locator('#start-button').click(); await page.clock.runFor(900); }
async function flushGear(page) { await page.clock.runFor(500); }
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
    assert.equal(await locked.page.locator('.auto-gear-options').count(), 0);
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
    const priorities = (await settings.saved()).autoGear;
    await page.locator('[data-gear-priority=characters]').click();
    assert.equal((await settings.saved()).autoGear.priorityBy, 'characters');
    assert.equal(await page.locator('[data-gear-priority=characters]').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(await page.locator('.auto-gear-priority h4').allTextContents(), ['① キャラ', '② 種別']);
    assert.match(await page.locator('.auto-gear-hint').getAttribute('data-tip'), /キャラ → ノード種別/);
    assert.equal(await page.locator('[data-gear-priority=characters]').evaluate(node => node === document.activeElement), true);
    assert.deepEqual((await settings.saved()).autoGear, { ...priorities, priorityBy: 'characters' });
    await page.locator('[data-gear-priority=kinds]').press('Enter');
    assert.deepEqual(await page.locator('.auto-gear-priority h4').allTextContents(), ['① 種別', '② キャラ']);
    assert.match(await page.locator('.auto-gear-hint').getAttribute('data-tip'), /ノード種別 → キャラ/);
    await page.locator('[data-gear-priority=characters]').click();
    for (const [width, height] of [[1440, 1000], [390, 844], [360, 740]]) {
      await page.setViewportSize({ width, height }); await page.clock.runFor(100);
      await page.locator('[data-gear-priority=characters]').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const bounds = await page.locator('[data-gear-priority=characters]').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
      await page.locator('.auto-gear-options').screenshot({ path: path.join(output, 'options-' + width + '.png') });
    }
    await page.locator('[data-auto-gear-toggle]').click();
    await flushGear(page);
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
    console.log('PASS locked options, priority basis/order/exclusions, immediate purchase, OFF, save/reload/reset and three viewport widths');

    for (const priorityBy of ['kinds', 'characters']) {
      const save = seed(10); save.gold = 1000000;
      for (const item of D.ITEMS.filter(i => i.type === 'material')) save.inventory[item.id] = 10000;
      for (const slot of ['weapon', 'armor']) for (let i = 1; i <= 10; i++) assert.equal(P.purchase(save, 'mage', slot, 'main-' + i), true);
      save.gold = 20; save.inventory = { crystal: 1 };
      save.autoGear.characters = ['mage', ...save.autoGear.characters.filter(id => id !== 'mage')];
      const scenario = await setup(browser, save);
      await scenario.page.locator('[data-open=options]').first().click();
      if (priorityBy === 'characters') await scenario.page.locator('[data-gear-priority=characters]').click();
      await scenario.page.locator('[data-auto-gear-toggle]').click();
      await flushGear(scenario.page);
      const acquired = await scenario.saved();
      assert.equal(acquired.gold, 0);
      assert.equal(acquired.progression.characters.mage.weapon.includes('branch-1-up-1'), priorityBy === 'characters');
      assert.deepEqual(acquired.progression.characters.warrior.weapon, priorityBy === 'kinds' ? ['main-1'] : []);
      assert.deepEqual(acquired.progression.characters.warrior.armor, priorityBy === 'kinds' ? ['main-1'] : []);
      await scenario.context.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS conflicting character/kind rankings spend the same limited budget according to the selected basis');

    // A gate-sized windfall must keep making progress while the options/result
    // screen is open, with no extra one-second wait between batches.
    const windfall = seed(100); windfall.cleared.push('chaos-gate', 'extradimensional-goddess');
    windfall.selectedStage = 'chaos-gate'; windfall.gold = 1e12;
    for (const item of D.ITEMS.filter(i => i.type === 'material')) windfall.inventory[item.id] = 1e9;
    const Auto = require('../../public/js/core/forest-auto-gear.js');
    const expected = structuredClone(windfall); expected.autoGear.enabled = true;
    const expectedCount = Auto.acquire(expected).length;
    const catchup = await setup(browser, windfall);
    await catchup.page.locator('[data-open=options]').first().click();
    await catchup.page.locator('[data-auto-gear-toggle]').click();
    // Cancel a suspended search; its queued purchases must not leak after OFF.
    await catchup.page.locator('[data-auto-gear-toggle]').click();
    const stopped = await catchup.saved(); await catchup.page.clock.runFor(300);
    assert.deepEqual((await catchup.saved()).progression, stopped.progression);
    await catchup.page.locator('[data-auto-gear-toggle]').click();
    const count = s => Object.values(s.progression.characters).reduce((n, c) => n + c.weapon.length + c.armor.length, 0);
    let elapsed = 0;
    for (; elapsed < 3000 && count(await catchup.saved()) < expectedCount; elapsed += 100) await catchup.page.clock.runFor(100);
    const completed = await catchup.saved();
    assert.equal(count(completed), expectedCount); assert.ok(elapsed < 3000);
    assert.deepEqual(completed.progression, expected.progression);
    assert.equal(completed.gold, expected.gold); assert.deepEqual(completed.inventory, expected.inventory);
    assert.equal(await catchup.page.locator('#menu-dialog').evaluate(node => node.open), true);
    await catchup.page.clock.runFor(100);
    assert.match(await catchup.page.locator('#notification').innerText(), /AUTO · 装備 \d{3,}/);
    await catchup.page.screenshot({ path: path.join(output, 'windfall-complete.png') });
    await catchup.page.reload(); await catchup.page.locator('#start-button:not([disabled])').waitFor();
    assert.equal(count(await catchup.saved()), expectedCount);
    await catchup.context.close();
    console.log('PASS ' + expectedCount + ' nodes catch up within ' + elapsed + 'ms simulated time, OFF cancels queued purchases, reload retains all acquisitions');

    // Exercise the actual victory connection with one clear and no next battle.
    const clearSave = seed(50); clearSave.selectedStage = 'dimensional-gate'; clearSave.autoGear.enabled = true;
    Object.assign(clearSave.reincarnation, { discovered: true, unlocked: true, cycle: 1, total: 100 });
    clearSave.reincarnation.automation.gems = true;
    Object.assign(clearSave.autoGemDismantle, { enabled: true, maxRarity: 'legendary' });
    clearSave.gold = 0;
    for (const item of D.ITEMS.filter(i => i.type === 'material')) clearSave.inventory[item.id] = 10000;
    const victory = await setup(browser, clearSave);
    assert.equal(count(await victory.saved()), 0, 'no upgrades are affordable before the reward');
    await victory.page.evaluate(() => { window.testGateWindfall = true; });
    await finish(victory.page); await victory.page.clock.runFor(1500);
    const afterClear = await victory.saved();
    assert.ok(afterClear.cleared.includes('dimensional-gate'), JSON.stringify({ stage: afterClear.selectedStage, state: await victory.page.locator('#battle-state').innerText(), errors })); assert.ok(count(afterClear) > 24);
    assert.deepEqual(Auto.acquire(structuredClone(afterClear)), []);
    assert.ok(afterClear.gems.some(gem => P.gemOwner(afterClear, gem.id)), 'reward gems equip before automatic dismantling during catchup');
    await victory.context.close();
    assert.deepEqual(errors, []);
    console.log('PASS a gate victory completes available equipment while stopped at its result');
    if (process.argv.includes('--options-only')) return;

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
