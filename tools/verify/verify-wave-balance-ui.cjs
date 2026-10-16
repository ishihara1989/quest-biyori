'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), A = require('../balance/audit-balance.cjs');
const output = path.resolve(__dirname, '../../output/balance/wave-ui');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4197/';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const server = process.env.FOREST_TEST_URL ? null : spawn(process.execPath, [path.resolve(__dirname, '../../server.cjs')], {
    env: { ...process.env, PORT: '4197' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  if (server) await new Promise((resolve, reject) => {
    server.once('error', reject); server.once('exit', code => reject(new Error('Test server exited: ' + code)));
    server.stdout.once('data', resolve);
  });
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  try {
    for (const stage of [30, 40, 50]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
      const page = await context.newPage(), seed = A.referenceBuild(stage, stage - 1).save;
      seed.selectedStage = stage; seed.autoMode = 'off';
      await page.route('**/favicon.ico', r => r.fulfill({ status: 204, body: '' }));
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.clock.install();
      await page.addInitScript(({ key, seed }) => {
        localStorage.setItem(key, JSON.stringify(seed));
        let simulation;
        Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => simulation, set(value) {
          simulation = value; const create = value.createRun;
          value.createRun = (...args) => window.testRun = create(...args);
        } });
      }, { key: D.SAVE_KEY, seed });
      await page.goto(url);
      await page.locator('#start-button:not([disabled])').waitFor({ timeout: 60000 });
      const count = D.STAGES[stage - 1].waves.length;
      assert.equal(await page.locator('.wave-hud i').innerText(), '/ ' + String(count).padStart(2, '0'));
      assert.equal(await page.locator('#wave-dots span').count(), count);
      await page.locator('[data-open=stages]').first().click();
      assert.match(await page.locator('.stage-detail').innerText(), new RegExp(count + ' WAVE'));
      await page.locator('#close-menu').click();
      await page.locator('#start-button').click();
      await page.evaluate(() => { for (const actor of [testRun.hero, ...testRun.allies]) Object.assign(actor, { manualOnly: true, invulnerable: true }); });
      for (let wave = 0; wave < count; wave++) {
        assert.equal(await page.evaluate(() => testRun.wave), wave);
        assert.equal(await page.locator('#wave-number').innerText(), String(wave + 1).padStart(2, '0'));
        assert.equal(await page.locator('#wave-dots .active').count(), 1);
        if (wave === count - 1) await page.screenshot({ path: path.join(output, 'stage-' + stage + '-final.png') });
        await page.evaluate(() => { for (const enemy of testRun.enemies) ForestSimulation.hit(testRun, testRun.hero, enemy, 1e12, [], false, null, { critical: false }); });
        await page.clock.runFor(1800);
      }
      assert.equal(await page.evaluate(() => testRun.status), 'victory');
      assert.equal(await page.locator('#result-overlay').isVisible(), true);
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage(), seed = A.referenceBuild(50).save;
    seed.selectedStage = 50;
    await page.addInitScript(({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)), { key: D.SAVE_KEY, seed });
    await page.goto(url); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 60000 });
    assert.equal(await page.locator('#wave-dots span').count(), 5);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(output, 'ruins-mobile.png') });
    await context.close();
    assert.deepEqual(errors, []);
    console.log('Verified 4/4/5 wave totals, stage details, progress dots, final-wave victory, desktop/mobile and no page/image errors.');
  } finally { await browser.close(); if (server) server.kill(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
