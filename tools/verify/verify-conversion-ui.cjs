'use strict';
// Isolated browser saves keep the player's inventory and progress untouched.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), C = require('../../public/js/core/forest-conversion.js');
const output = path.join(__dirname, '../../output/conversion');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const errors = [];
function fixture(cleared = D.STAGES.map(stage => stage.id)) {
  const save = D.freshSave(); save.cleared = cleared; save.gold = 1000; save.autoMode = 'off';
  for (const item of D.ITEMS.filter(item => item.type === 'material')) save.inventory[item.id] = 100;
  return D.readSave(JSON.stringify(save));
}
async function pageFor(browser, seed, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  await page.route(url + '**', route => {
    const nativePath = require('node:path'), base = nativePath.resolve(__dirname, '../../public');
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    if (pathname === '/favicon.ico') return route.fulfill({status:204});
    const file = nativePath.resolve(base, '.' + (pathname === '/' ? '/game.html' : pathname)), relative = nativePath.relative(base, file);
    if(relative.startsWith('..') || nativePath.isAbsolute(relative) || !fs.existsSync(file)) return route.fulfill({status:404,body:'Missing'});
    const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif'};
    return route.fulfill({status:200,contentType:types[nativePath.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  await page.clock.install();
  await page.addInitScript(({ key, seed }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(seed));
  }, { key: D.SAVE_KEY, seed });
  return page;
}
async function ready(page) {
  await page.goto(url); await page.locator('#start-button:not([disabled])').waitFor();
  // The existing battle controls have a minimum width on very small screens.
  // Check the conversion dialog itself and ensure it does not widen the page.
  page.baselineScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
}
async function open(page) {
  await page.locator('[data-open=inventory]').click();
  await page.locator('[data-filter=conversion]').click();
}
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
const convertButton = (page, id, times = 1) => page.locator('[data-convert="' + id + '"][data-convert-times="' + (times === true ? 'max' : times) + '"]');
async function selectRecipe(page, recipe) {
  if (!await page.locator('[data-recipe="' + recipe.id + '"]').count()) await page.locator('[data-conversion-choice="' + recipe.id + '"]').click();
}
async function assertNoOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= Math.max(page.baselineScrollWidth, page.viewportSize().width));
  const dialog = await page.locator('#menu-dialog').evaluate(node => ({ width: node.clientWidth, scroll: node.scrollWidth,
    children: [...node.querySelectorAll('*')].filter(child => child.scrollWidth > child.clientWidth + 1 && !child.closest('.conversion-tabs')).map(child => ({ tag: child.tagName, class: child.className, width: child.clientWidth, scroll: child.scrollWidth })) }));
  if (dialog.scroll > dialog.width + 1) await page.screenshot({ path: path.join(output, 'conversion-overflow.png'), fullPage: true });
  assert.ok(dialog.scroll <= dialog.width + 1, JSON.stringify(dialog));
  assert.equal(await page.locator('.conversion-card').evaluateAll(nodes => nodes.some(node => node.scrollWidth > node.clientWidth + 1)), false);
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const P = require('../../public/js/core/forest-progression.js'), G = P.Gem;
    const seedBulk = fixture();
    for (const id of Object.keys(seedBulk.inventory)) seedBulk.inventory[id] = 2000;
    for (const rarity of ['rare', 'unique']) P.addGem(seedBulk, G.generate({ rarity, family: 'attack', level: 1, size: 1, random: () => .5 }));
    seedBulk.inventory[G.shardKey('rare')] = 1125;
    for (const width of [1440, 390, 320]) {
      const batch = await pageFor(browser, seedBulk, { viewport: { width, height: 1000 } });
      await ready(batch); await open(batch);
      const recipe = C.RECIPES.find(row => row.region === 1 && row.category === 'common-crystal');
      for (const times of [10, 100]) {
        const expected = structuredClone(await saved(batch));
        assert.equal(C.convert(expected, recipe.id, times), true);
        await convertButton(batch, recipe.id, times).click();
        assert.deepEqual((await saved(batch)).inventory, expected.inventory);
      }
      await assertNoOverflow(batch);
      await batch.screenshot({ path: path.join(output, 'conversion-batch-' + width + '.png'), fullPage: true });
      await batch.locator('#close-menu').click();
      await batch.locator('[data-open=gems]').first().click();
      await batch.locator('[data-filter=gem-workshop]').click();
      const shardButton = times => batch.locator('[data-gem-convert=rare][data-gem-convert-times="' + times + '"]');
      for (const times of [1, 10, 100, 'max']) {
        const expected = structuredClone(await saved(batch));
        const amount = times === 'max' ? Math.floor(expected.inventory[G.shardKey('rare')] / 10) : times;
        assert.equal(G.convert(expected, 'rare', amount), true);
        await shardButton(times).click();
        assert.deepEqual((await saved(batch)).inventory, expected.inventory);
        if (times === 10) assert.equal(await shardButton(100).isEnabled(), true);
        if (times === 100) {
          assert.equal(await shardButton(10).isDisabled(), true);
          assert.equal(await shardButton(100).isDisabled(), true);
        }
      }
      assert.equal(await shardButton(1).isDisabled(), true);
      assert.equal(await shardButton('max').isDisabled(), true);
      assert.ok(await batch.locator('#menu-content').evaluate(el => el.scrollWidth <= el.clientWidth + 2));
      await batch.screenshot({ path: path.join(output, 'shard-batch-' + width + '.png'), fullPage: true });
      const snapshot = (await saved(batch)).inventory;
      await batch.reload(); await batch.locator('#start-button:not([disabled])').waitFor();
      assert.deepEqual((await saved(batch)).inventory, snapshot);
      await batch.context().close();
    }
    console.log('PASS material 10/100 and shard 1/10/100/MAX exact amounts, insufficient buttons, persistence and 1440/390/320px layouts');
    const page = await pageFor(browser, fixture()); await ready(page); await open(page);
    assert.deepEqual(await page.locator('.conversion-tabs [role=tab]').allTextContents(), D.REGIONS.map(region => region.name));
    assert.equal(await page.locator('.conversion-group').count(), 5);
    assert.equal(await page.locator('.conversion-card').count(), 5);
    assert.equal(await page.locator('[data-conversion-choice]').count(), 6);
    for (const region of C.REGIONS) {
      await page.locator('[data-conversion-region="' + region.id + '"]').click();
      for (const recipe of C.RECIPES.filter(row => row.region === region.id)) {
        await selectRecipe(page, recipe);
        const before = await saved(page), expected = structuredClone(before);
        assert.equal(C.convert(expected, recipe.id), true);
        await convertButton(page, recipe.id).click();
        const after = await saved(page);
        assert.deepEqual(after.inventory, expected.inventory, recipe.id);
        assert.equal(after.gold, before.gold); assert.deepEqual(after.cleared, before.cleared);
        assert.match(await page.locator('.conversion-feedback').innerText(), new RegExp('＋' + recipe.amount));
      }
    }
    console.log('PASS all '+C.RECIPES.length+' recipes and '+C.REGIONS.length+' region tabs, output choices, exact debit/credit and immediate persistence');
    const bulk = C.RECIPES.find(row => row.region === 4 && row.category === 'common-crystal');
    await page.locator('[data-conversion-region="4"]').click();
    const beforeBulk = await saved(page), expectedBulk = structuredClone(beforeBulk), maximum = C.plan(beforeBulk, bulk.id).max;
    assert.ok(maximum > 1); assert.equal(C.convert(expectedBulk, bulk.id, maximum), true);
    await convertButton(page, bulk.id, true).click();
    assert.deepEqual((await saved(page)).inventory, expectedBulk.inventory);
    assert.equal(await convertButton(page, bulk.id).isDisabled(), true);
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor(); await open(page);
    assert.deepEqual((await saved(page)).inventory, expectedBulk.inventory);
    await page.locator('[data-conversion-region="1"]').click();
    await page.locator('#menu-dialog').evaluate(node => { node.scrollTop = 0; });
    await page.mouse.move(0, 0);
    await page.screenshot({ path: path.join(output, 'conversion-desktop.png') });
    await assertNoOverflow(page);
    await page.locator('[data-conversion-region="1"]').focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-conversion-region="2"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('[data-conversion-region="2"]').evaluate(node => node === document.activeElement), true);
    await page.keyboard.press('End'); assert.equal(await page.locator('[data-conversion-region="' + C.REGIONS.at(-1).id + '"]').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Home'); assert.equal(await page.locator('[data-conversion-region="1"]').getAttribute('aria-selected'), 'true');
    await page.context().close();
    console.log('PASS MAX respects the limiting input, exhausted recipes disable, reload retains inventory and keyboard tabs work');

    const locked = await pageFor(browser, fixture([])); await ready(locked); await open(locked);
    const lockedBefore = await saved(locked);
    assert.equal(await locked.locator('.conversion-card').count(), 0);
    assert.equal(await locked.locator('[data-conversion-region]').count(), 0);
    assert.equal(await locked.locator('[data-convert]').count(), 0);
    assert.deepEqual(await saved(locked), lockedBefore);
    await locked.locator('#menu-dialog').evaluate(node => { node.scrollTop = 0; });
    await locked.mouse.move(0, 0);
    await locked.screenshot({ path: path.join(output, 'conversion-locked.png') });
    await locked.context().close();
    console.log('PASS owning materials does not bypass final-stage clear requirements');

    const seed = fixture(Array.from({ length: 89 }, (_, i) => i + 1)); seed.selectedStage = 90;
    const unlock = await pageFor(browser, seed);
    await unlock.route('**/js/combat/forest-simulation.js', async route => {
      const body = fs.readFileSync(require('node:path').resolve(__dirname, '../../public/js/combat/forest-simulation.js'), 'utf8');
      await route.fulfill({ contentType: 'application/javascript', body: body + `\n(() => {
        const original = ForestSimulation.update;
        ForestSimulation.update = (run, dt) => {
          if (run.status !== 'running') return original(run, dt);
          run.status = 'victory'; run.random = () => 0; run.elapsed = 1000;
          return [{ type:'loot', enemy:'boss-slime', gold:0, x:600, y:400, timeMs:0 }, { type:'finished', victory:true }];
        };
      })();` });
    });
    await ready(unlock); await open(unlock);
    assert.equal(await unlock.locator('[data-conversion-region="9"]').count(), 0);
    const crystalCommon = C.RECIPES.find(row => row.region === 9 && row.category === 'crystal-common');
    assert.equal(await convertButton(unlock, crystalCommon.id).count(), 0);
    await unlock.locator('#close-menu').click(); await unlock.locator('#start-button').click();
    await unlock.clock.runFor(1000); await unlock.locator('#result-skip').click();
    await unlock.clock.runFor(100); await unlock.locator('[data-loot-id=crystal]').click();
    await unlock.locator('[data-filter=conversion]').click();
    await unlock.locator('[data-conversion-region="9"]').click();
    assert.equal(await convertButton(unlock, crystalCommon.id).isEnabled(), true);
    assert.equal(await unlock.locator('.conversion-card.locked').count(), 0);
    await convertButton(unlock, crystalCommon.id).click();
    assert.ok((await saved(unlock)).cleared.includes(90));
    await unlock.reload(); await unlock.locator('#start-button:not([disabled])').waitFor(); await open(unlock);
    await unlock.locator('[data-conversion-region="9"]').click();
    assert.equal(await unlock.locator('.conversion-card.locked').count(), 0);
    await unlock.context().close();
    console.log('PASS 9-10 victory unlocks all regional recipes immediately and after reload');

    for (const width of [390, 320]) {
      const mobile = await pageFor(browser, fixture(), { viewport: { width, height: 844 } });
      await ready(mobile); await open(mobile); await assertNoOverflow(mobile);
      const commonRecipe = C.RECIPES.find(row => row.region === 1 && row.category === 'crystal-common' && row.output === 'flower');
      await selectRecipe(mobile, commonRecipe); await convertButton(mobile, commonRecipe.id).click();
      await assertNoOverflow(mobile);
      await mobile.locator('#menu-dialog').evaluate(node => { node.scrollTop = 0; });
      await mobile.mouse.move(0, 0);
      await mobile.screenshot({ path: path.join(output, 'conversion-mobile-' + width + '.png'), fullPage: true });
      await mobile.context().close();
    }
    const quiet = await pageFor(browser, fixture(), { reducedMotion: 'reduce' });
    await ready(quiet); await open(quiet);
    const commonRecipe = C.RECIPES.find(row => row.region === 1 && row.category === 'common-crystal');
    await convertButton(quiet, commonRecipe.id).click();
    assert.equal(await quiet.locator('.converted .conversion-art').last().evaluate(node => getComputedStyle(node).animationName), 'none');
    await quiet.context().close();
    console.log('PASS 390px/320px layouts, touch-sized output choices, mobile conversion and reduced motion');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
