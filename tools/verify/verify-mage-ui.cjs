'use strict';
// Isolated browser contexts keep the player's save untouched.
const path = require('../lib/project-paths.cjs').assetPaths, fs = require('node:fs'), assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const root = path.resolve(__dirname, '../..'), output = path.join(root, 'output/mage'), url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.clock.install();
  async function scrub(ms) { await page.locator('#scrub').evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, ms); }
  async function screenshot(name) { await page.screenshot({ path: path.join(output, name + '.png') }); }
  try {
    await page.goto(url + 'mage-lab.html'); await page.locator('#play:not([disabled])').waitFor();
    assert.equal(await page.locator('#motions button[data-motion]').count(), 6);
    await page.locator('button[data-motion=cast-forward]').click();
    for (const [ms, motion] of [[800, 'chant'], [1350, 'cast-forward'], [1800, 'cast-forward-hold'], [2400, 'cast-forward'], [3000, 'idle']]) {
      await scrub(ms); assert.equal(await page.locator('#mage-stage').getAttribute('data-motion'), motion);
      if (ms === 800) await screenshot('chant'); if (ms === 1800) await screenshot('forward-hold');
    }
    await page.locator('button[data-motion=cast-up]').click(); await scrub(1800); await screenshot('up-hold');
    await page.locator('#flip').check(); await screenshot('up-hold-left');
    assert.equal(await page.locator('#mage-stage').getAttribute('data-motion'), 'cast-up-hold');
    await page.locator('#effects').uncheck(); await screenshot('up-no-effects');
    await page.locator('#connected').uncheck(); await page.locator('button[data-motion=chant]').click();
    for (const [ms, frame] of [[0, '0'], [160, '1'], [320, '2'], [480, '3']]) { await scrub(ms); assert.equal(await page.locator('#mage-stage').getAttribute('data-frame'), frame); }
    await page.locator('#play').click(); await page.clock.runFor(800); assert.equal(await page.locator('#mage-stage').getAttribute('data-motion'), 'chant');
    await page.setViewportSize({ width: 390, height: 844 }); await screenshot('mobile');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url + 'index.html#mage/cast-forward'); await page.locator('#load-status[hidden]').waitFor({ state: 'attached' }); await page.clock.runFor(500);
    assert.equal(await page.locator('#sprite').getAttribute('data-motion'), 'cast-forward-hold');
    await page.locator('#next-frame').click(); assert.equal(await page.locator('#sprite').getAttribute('data-motion'), 'cast-forward');
    await page.goto(url + 'effects.html'); await page.locator('#status[hidden]').waitFor({ state: 'attached' });
    assert.equal(await page.locator('.effect-card').count(), JSON.parse(fs.readFileSync(path.join(root, 'public/assets/effects/index.json'), 'utf8')).length);
    const seed = D.freshSave(); D.award(seed, 4); seed.selectedStage = 4;
    await page.addInitScript(({ key, save }) => localStorage.setItem(key, JSON.stringify(save)), { key: D.SAVE_KEY, save: seed });
    // Record rendered assets during a real run, without replacing simulation behavior.
    await page.addInitScript(() => {
      globalThis.renderedMageAssets = [];
      const original = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (img, ...args) {
        if (img?.src && /mage|wind/.test(img.src)) globalThis.renderedMageAssets.push(img.src);
        return original.call(this, img, ...args);
      };
    });
    await page.goto(url + 'game.html'); await page.locator('#start-button:not([disabled])').waitFor(); await page.locator('#start-button').click();
    await page.clock.runFor(12000); await screenshot('battle');
    const rendered = await page.evaluate(() => [...new Set(globalThis.renderedMageAssets)]);
    for (const id of ['mage-chant.png', 'mage-cast-forward.png', 'mage-cast-forward-hold.png', 'arcane.png', 'arcane-impact.png']) assert.ok(rendered.some(src => src.endsWith(id)), 'Not rendered: ' + id);
    await page.goto(url + 'skill-lab.html'); await page.locator('#play:not([disabled])').waitFor();
    assert.deepEqual(errors, []); console.log(JSON.stringify({ motions: 6, effects: 3, screenshots: output, checks: 'connections, loops, stepping, flip, effects, mobile, sprite viewer, real battle and warrior viewer passed' }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
