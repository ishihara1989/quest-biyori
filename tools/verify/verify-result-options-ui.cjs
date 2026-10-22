'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { ROOT, PUBLIC, inside } = require('../lib/project-paths.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
async function main() {
  const output = path.join(ROOT, 'output/result-options'); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  async function setup(seed, width = 1440, reducedMotion = 'no-preference') {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion }), page = await context.newPage();
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
      if (!sessionStorage.getItem('result-options-seeded')) { localStorage.setItem(key, JSON.stringify(seed)); sessionStorage.setItem('result-options-seeded', '1'); }
      window.testRuns = []; window.testMode = 'hold'; let data, simulation, lootUI;
      Object.defineProperty(window, 'ForestLootUI', { configurable: true, get: () => lootUI, set(value) { lootUI = value; const create = value.create; value.create = (...args) => window.testLoot = create(...args); } });
      Object.defineProperty(window, 'ForestData', { configurable: true, get: () => data, set(value) {
        data = value; const destination = value.autoDestination;
        value.autoDestination = (save, ...args) => { window.testSave = save; return destination(save, ...args); };
      } });
      Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => simulation, set(value) {
        simulation = value; const create = value.createRun;
        value.createRun = (...args) => { testRuns.push(Date.now()); return window.testRun = create(...args); };
        value.update = run => { if (run.status !== 'running' || testMode === 'hold') return []; const victory = testMode === 'win'; testMode = 'hold'; run.status = victory ? 'victory' : 'defeat'; run.elapsed = 12500; window.testFinishedAt = Date.now(); return [{ type: 'loot', enemy: 'boss-slime', gold: 4, goldRemainder: 0 }, { type: 'finished', victory }]; };
      } });
    }, { key: D.SAVE_KEY, seed });
    await page.goto('http://127.0.0.1:4197/');
    await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    return { context, page };
  }
  const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
  const open = page => page.locator('[data-open=options]').first().click();
  function seed() {
    const s = D.freshSave(); s.cleared = [1,2,3]; s.selectedStage = 4; s.autoMode = 'same';
    Object.assign(s.reincarnation, { discovered: true, unlocked: true, cycle: 1, total: 100 }); return s;
  }
  async function setDelay(page, delay) {
    await page.locator('[data-result-option=delay]').fill(String(delay));
    assert.equal(await page.locator('#result-delay-value').innerText(), delay.toFixed(1) + '秒');
    assert.equal((await saved(page)).reincarnation.resultOptions.delay, delay);
  }
  async function finish(page, victory = true) {
    await page.evaluate(victory => { testMode = victory ? 'win' : 'lose'; }, victory);
    await page.locator('#start-button').click(); await page.clock.runFor(100);
  }
  try {
    for (const unlocked of [false, true]) {
      const s = D.freshSave(); Object.assign(s.reincarnation, { discovered: unlocked, unlocked });
      s.reincarnation.resultOptions = { skip: true, delay: .5 };
      const {page,context} = await setup(s); await open(page);
      assert.equal(await page.locator('[data-result-option]').count(), 0); await context.close();
    }
    for (const [width, motion] of [[1440,'no-preference'], [390,'no-preference'], [390,'reduce']]) {
      const {page,context} = await setup(seed(), width, motion); await open(page);
      assert.equal(await page.locator('[data-result-option=skip]').isChecked(), false);
      assert.equal(await page.locator('[data-result-option=delay]').getAttribute('min'), '0.5');
      assert.equal(await page.locator('[data-result-option=delay]').getAttribute('max'), '5');
      assert.equal(await page.locator('[data-result-option=delay]').getAttribute('step'), '0.5');
      for (let delay = .5; delay <= 5; delay += .5) await setDelay(page, delay);
      await setDelay(page, .5); await page.locator('[data-result-option=skip]').check();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({path:path.join(output,'options-'+width+'-'+motion+'.png'),animations:'disabled'});
      await page.reload(); await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
      await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100)); await open(page);
      assert.equal(await page.locator('[data-result-option=skip]').isChecked(), true);
      assert.equal(await page.locator('[data-result-option=delay]').inputValue(), '0.5');
      await page.locator('#close-menu').click(); await finish(page);
      assert.equal(await page.locator('#result-overlay').isVisible(), true);
      assert.equal(await page.locator('#recruit-intro').isVisible(), false);
      assert.equal(await page.locator('#unlock-intro').isVisible(), false);
      assert.equal(await page.locator('.result-panel').isVisible(), true);
      assert.equal(await page.locator('#loot-status').innerText(), '獲得完了');
      assert.equal(await page.locator('#result-chest').getAttribute('data-frame'), '3');
      assert.equal(await page.locator('#result-skip').isVisible(), false);
      assert.ok(await page.locator('.loot-result-item').count() > 0);
      assert.equal(await page.locator('.loot-result-item[hidden],.loot-rarity-group[hidden]').count(), 0);
      assert.equal(await page.locator('.loot-result-item').first().evaluate(e => getComputedStyle(e).animationName), 'none');
      assert.equal(await page.evaluate(() => testLoot.plan.completeAt), 0);
      assert.equal(await page.evaluate(() => testLoot.plan.repeatAt), 500);
      const firstSave = await saved(page); assert.equal(P.unlocked(firstSave,'mage'), true);
      assert.ok(firstSave.inventory.jelly > 0); assert.ok(firstSave.gold > 0);
      assert.equal(await page.locator('#result-recruit').isVisible(), true);
      await page.screenshot({path:path.join(output,'instant-'+width+'-'+motion+'.png'),animations:'disabled'});
      await page.clock.runFor(350); assert.equal(await page.evaluate(() => testRun.status), 'victory');
      await page.clock.runFor(100); assert.equal(await page.evaluate(() => testRun.status), 'running');
      const elapsed = await page.evaluate(() => testRuns.at(-1) - testFinishedAt);
      assert.ok(elapsed >= 480 && elapsed <= 530, String(elapsed));
      assert.deepEqual((await saved(page)).inventory, firstSave.inventory, 'no duplicate settlement');
      await context.close();
    }
    for (const [skip, delay, mode, victory] of [[true,5,'advance',true],[true,1.5,'same',false],[true,.5,'off',true],[false,.5,'same',true]]) {
      const s=seed(); s.autoMode=mode; s.reincarnation.resultOptions={skip,delay};
      const {page,context}=await setup(s); await finish(page,victory);
      if (skip) {
        assert.equal(await page.evaluate(() => testLoot.plan.completeAt),0);
        assert.equal(await page.locator('#loot-status').innerText(),'獲得完了');
      } else {
        assert.equal(await page.locator('#result-overlay').isVisible(),false);
        await page.clock.runFor(700); assert.equal(await page.locator('#recruit-intro').isVisible(),true);
        assert.ok(await page.evaluate(() => testLoot.plan.completeAt > 0));
        await page.locator('#recruit-continue').click();
        if(await page.locator('#unlock-intro').isVisible()) await page.locator('#unlock-continue').click();
        await page.locator('#result-skip').click();
        assert.equal(await page.locator('#loot-status').innerText(),'獲得完了');
      }
      if(mode==='off') {
        await page.clock.runFor(6000); assert.equal(await page.evaluate(() => testRun.status),'victory');
        await page.locator('#retry-button').click(); assert.equal(await page.evaluate(() => testRun.status),'running');
      } else {
        await page.clock.runFor(delay*1000-200); assert.equal(await page.evaluate(() => testRun.status),victory?'victory':'defeat');
        await page.clock.runFor(250); assert.equal(await page.evaluate(() => testRun.status),'running');
        assert.equal(await page.evaluate(() => testRun.stage.id),victory?(mode==='advance'?5:4):3);
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log('Result options UI passed: first-rebirth gate, ten slider values, save/reload, immediate complete drops/recruit/unlock, ~500ms repeat, 5s/1.5s timers, advance/defeat/OFF/manual retry, animated/manual skip, 1440px/390px and reduced motion; no runtime/resource errors.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
