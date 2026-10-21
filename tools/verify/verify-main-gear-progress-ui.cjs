'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { ROOT, PUBLIC, inside } = require('../lib/project-paths.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
async function main() {
  const output = path.join(ROOT, 'output/main-gear-progress'); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  async function setup(seed, width = 1440) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } }), page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    await page.route('**/*', route => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      if (pathname === '/favicon.ico') return route.fulfill({ status: 204, body: '' });
      const file = path.resolve(PUBLIC, pathname === '/' ? 'game.html' : '.' + pathname);
      if (!inside(PUBLIC, file) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: 'Missing file' });
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
      return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
    });
    await page.clock.install();
    await page.addInitScript(({ key, seed }) => {
      if (!sessionStorage.getItem('main-gear-seeded')) { localStorage.setItem(key, JSON.stringify(seed)); sessionStorage.setItem('main-gear-seeded', '1'); }
      let data, simulation;
      Object.defineProperty(window, 'ForestData', { configurable: true, get: () => data, set(value) {
        data = value; const destination = value.autoDestination;
        value.autoDestination = (save, ...args) => { window.testSave = save; return destination(save, ...args); };
      } });
      Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => simulation, set(value) {
        simulation = value; const create = value.createRun;
        value.createRun = (...args) => window.testRun = create(...args);
        value.update = run => { if (run.status !== 'running') return []; run.status = 'victory'; run.elapsed = 12500; return [{ type: 'finished', victory: true }]; };
      } });
    }, { key: D.SAVE_KEY, seed });
    await page.goto('http://127.0.0.1:4197/');
    await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    return { context, page };
  }
  const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
  try {
    const fresh = await setup(D.freshSave()); await fresh.page.locator('[data-open=options]').first().click();
    assert.equal(await fresh.page.locator('[data-reinc-auto=waitForMainGear]').count(), 0); await fresh.context.close();
    for (const width of [1440, 390]) {
      const seed = D.freshSave(); seed.autoMode = 'advance'; seed.selectedStage = 10;
      seed.cleared = Array.from({ length: 10 }, (_, i) => i + 1);
      Object.assign(seed.reincarnation, { discovered: true, unlocked: true, cycle: 1, total: 100 });
      for (const job of ['warrior', 'mage', 'paladin']) for (const slot of ['weapon', 'armor'])
        seed.progression.characters[job][slot] = P.gearTree(job, slot).filter(n => n.main).map(n => n.id);
      seed.progression.characters.paladin.armor.pop();
      seed.gold = 1000; for (const item of D.ITEMS.filter(i => i.type === 'material')) seed.inventory[item.id] = 100;
      const { context, page } = await setup(seed, width);
      await page.locator('[data-open=options]').first().click();
      const option = page.locator('[data-reinc-auto=waitForMainGear]'); assert.equal(await option.isChecked(), false);
      await option.check(); assert.equal((await saved(page)).reincarnation.automation.waitForMainGear, true);
      assert.match(await option.locator('..').getAttribute('data-tip'), /加入済み.*サブ・固有/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.join(output, 'options-' + width + '.png'), animations: 'disabled' });
      await page.reload(); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
      await page.locator('[data-open=options]').first().click(); assert.equal(await option.isChecked(), true);
      await option.uncheck(); assert.equal((await saved(page)).reincarnation.automation.waitForMainGear, false);
      await option.check(); await page.locator('#close-menu').click(); await page.locator('#start-button').click();
      await page.clock.runFor(30000);
      assert.equal(await page.evaluate(() => testRun.stage.id), 10);
      assert.equal(await page.evaluate(() => testSave.autoMode), 'advance');
      assert.equal(await page.evaluate(() => ForestProgression.purchase(testSave, 'paladin', 'armor', 'main-10')), true);
      await page.clock.runFor(30000);
      assert.equal(await page.evaluate(() => testRun.stage.id), 11);
      assert.equal((await saved(page)).selectedStage, 11);
      await page.screenshot({ path: path.join(output, 'advanced-' + width + '.png'), animations: 'disabled' });
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log('Main gear progress UI passed: locked visibility, toggle, save/reload, forest10 repeat until final armor purchase, advance to swamp1, 1440px/390px; no resource/runtime errors.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
