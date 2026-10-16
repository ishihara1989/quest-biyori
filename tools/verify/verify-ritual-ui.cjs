'use strict';
// Fresh browser context; the player's saved progress is never read or changed.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const R = require('../../development/labs/js/ritual-motions.js');
const root = path.resolve(__dirname, '../..'), output = path.join(root, 'output/ritual');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1380, height: 1100 } }), page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  await page.clock.install();
  const stage = page.locator('#ritual-stage');
  async function scrub(ms) { await page.locator('#scrub').evaluate((el, time) => { el.value = time; el.dispatchEvent(new Event('input', { bubbles: true })); }, ms); }
  async function shot(name) { await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true }); }
  try {
    await page.goto(url + 'ritual-lab.html'); await page.locator('#play:not([disabled])').waitFor();
    assert.equal(await page.locator('#characters button').count(), 3);
    await scrub(760); assert.equal(await stage.getAttribute('data-motion'), 'attack-shuriken');
    assert.equal(await stage.getAttribute('data-projectile'), 'true'); await shot('ninja-throw');
    await page.locator('#flip').check(); await shot('ninja-throw-left'); await page.locator('#flip').uncheck();
    await page.locator('[data-action=loop]').click(); await page.locator('#play').click(); await page.clock.runFor(2400);
    assert.equal(await stage.getAttribute('data-motion'), 'seal'); await shot('ninja-seal');
    await page.locator('#characters [data-character=shaman]').click(); await page.locator('[data-action=ritual]').click();
    for (const [time, motion, frame] of [[1000, 'chant', '2'], [1840, 'cast-forward', '0'], [2000, 'cast-forward', '1'], [2200, 'cast-forward', '2'], [2500, 'idle', '0']]) {
      await scrub(time); assert.equal(await stage.getAttribute('data-motion'), motion); assert.equal(await stage.getAttribute('data-frame'), frame);
      if (time === 1000) await shot('shaman-chant'); if (time === 2200) await shot('shaman-release');
    }
    await page.locator('#characters [data-character=miko]').click();
    for (const [time, frame] of [[1870, '0'], [2010, '1'], [2110, '2'], [2210, '3'], [2310, '4'], [2450, '5']]) {
      await scrub(time); assert.equal(await stage.getAttribute('data-motion'), 'prayer-release'); assert.equal(await stage.getAttribute('data-frame'), frame);
      await shot('miko-turn-' + frame);
    }
    await page.locator('#flip').check(); await shot('miko-release-left'); await page.locator('#flip').uncheck();
    await scrub(2660); assert.equal(await stage.getAttribute('data-motion'), 'idle');
    await scrub(1840); await page.locator('#next').click(); assert.equal(await stage.getAttribute('data-frame'), '1');
    await page.locator('#previous').click(); assert.equal(await stage.getAttribute('data-frame'), '0');
    await page.locator('[data-action=loop]').click();
    for (const [time, frame] of [[0, '0'], [180, '1'], [360, '2'], [540, '3'], [719, '3']]) {
      await scrub(time); assert.equal(await stage.getAttribute('data-frame'), frame);
      if (time === 360) await shot('miko-prayer');
    }
    await page.locator('#play').click(); await page.clock.runFor(2000); assert.equal(await stage.getAttribute('data-motion'), 'prayer');
    await page.setViewportSize({ width: 390, height: 844 }); await shot('mobile');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.setViewportSize({ width: 1380, height: 1100 });
    for (const [id, c] of Object.entries(R.CHARACTERS)) for (const motion of [c.attack, c.loop, c.release].filter(Boolean)) {
      await page.goto(url + 'index.html#' + id + '/' + motion);
      await page.locator('#load-status[hidden]').waitFor({ state: 'attached' });
      const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/assets', id, 'motions', motion, 'manifest.json')));
      assert.equal(await page.locator('#spec-frames').textContent(), manifest.frameCount + ' コマ');
      const button = page.locator('button[data-motion="' + motion + '"]');
      assert.ok((await button.textContent()).includes(manifest.frameCount + ' FRAMES'));
      await page.locator('button[data-frame="' + (manifest.frameCount - 1) + '"]').click();
      assert.equal(await page.locator('#sprite').getAttribute('data-frame'), String(manifest.frameCount - 1));
      assert.equal(await page.locator('#sprite').getAttribute('width'), String(manifest.frameWidth));
      assert.equal(await page.locator('#sprite').getAttribute('height'), String(manifest.frameHeight));
      if (motion === 'prayer-release') await shot('sprite-viewer');
    }
    for (const [id, motion] of [['warrior', 'attack-overhead'], ['mage', 'cast-forward'], ['paladin', 'mace-raise']]) {
      await page.goto(url + 'index.html#' + id + '/' + motion); await page.locator('#load-status[hidden]').waitFor({ state: 'attached' });
      await page.locator('button[data-frame="0"]').click(); assert.equal(await page.locator('#sprite').getAttribute('data-motion'), motion);
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ motions: 8, characters: 3, screenshots: output, checks: 'flight, loop, cast boundaries, six-frame turn, stepping, flip, mobile, downloads/viewer and existing characters: passed' }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
