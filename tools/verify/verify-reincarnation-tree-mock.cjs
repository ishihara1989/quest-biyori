'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const output = path.resolve(__dirname, '../../output/reincarnation-tree-mock');
const base = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4192/';
const url = new URL('development/labs/reincarnation-tree.html', base).href;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  const points = () => page.locator('#points').innerText();
  async function screenshot(name) {
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    await page.waitForFunction(() => !document.getElementById('announcement').classList.contains('visible'));
    await page.screenshot({ path: path.join(output, name), fullPage: true });
  }
  async function select(id) {
    // A normal locator click scrolls nodes into view within the map.
    await page.locator(`[data-node="${id}"]`).click();
    assert.equal(await page.locator('#detail h2').innerText(), await page.locator(`[data-node="${id}"] .node-title`).innerText());
  }
  try {
    await page.goto(url);
    await page.locator('[data-node="drop2"]').waitFor();
    assert.equal(await points(), '100');
    assert.equal(await page.locator('.node').count(), 43);
    await screenshot('desktop-first.png');
    const originalStorage = await page.evaluate(() => { localStorage.setItem('mock-review-sentinel', 'preserved'); return { ...localStorage }; });

    await page.locator('#purchase').click();
    assert.equal(await page.locator('#purchase-dialog').evaluate(d => d.open), true);
    await page.locator('#purchase-dialog button[value="cancel"]').click();
    await page.waitForFunction(() => !document.getElementById('purchase-dialog').open);
    assert.equal(await points(), '100');
    await page.locator('#purchase').click();
    await page.locator('#confirm-purchase').click();
    await page.waitForFunction(() => document.getElementById('points').textContent === '40');
    assert.equal(await page.locator('#purchase').isDisabled(), true);
    await select('drop3');
    assert.equal(await page.locator('#purchase').innerText(), 'あと 40 PT');
    await select('main-free');
    assert.equal(await page.locator('#purchase').innerText(), '前提ノードが必要');
    await select('xp27');
    assert.match(await page.locator('#detail .preview-change').innerText(), /×1 → ×27/);
    assert.equal(await page.locator('#detail .preview-label').innerText(), '前提を含む取得後の合計');

    await page.locator('#scenario').selectOption('goal');
    assert.equal(await points(), '440');
    assert.equal(await page.locator('#detail h2').innerText(), 'メイン材料無償化');
    await screenshot('desktop-main-goal.png');
    await page.locator('#purchase').click(); await page.locator('#confirm-purchase').click();
    await page.waitForFunction(() => document.getElementById('points').textContent === '40');
    assert.match(await page.locator('#summary').innerText(), /通常メイン素材費\s*0/);
    await page.locator('#reset').click();
    assert.equal(await points(), '440');
    assert.equal(await page.locator('#purchase').isEnabled(), true);
    await page.locator('#add-points').click();
    assert.equal(await points(), '540');

    await page.locator('[data-family="trial"]').click();
    assert.ok(await page.locator('.node.dimmed').count() > 20);
    await page.locator('[data-view="list"]').click();
    assert.equal(await page.locator('#node-list tr').count(), 5);
    await page.locator('[data-family="all"]').click();
    await page.locator('#search').fill('メイン材料');
    assert.equal(await page.locator('#node-list tr').count(), 1);
    await page.locator('#search').fill('一致しない文字列');
    assert.equal(await page.locator('#empty-list').isVisible(), true);
    await page.locator('#search').fill('');
    assert.equal(await page.locator('#node-list tr').count(), 42);
    await screenshot('desktop-list.png');

    await page.locator('[data-view="tree"]').click();
    await page.locator('#scenario').selectOption('complete');
    assert.equal(await page.locator('.node.owned').count(), 43);
    assert.match(await page.locator('#summary').innerText(), /ドロップ数\s*×20/);
    assert.match(await page.locator('#summary').innerText(), /与ダメージ\s*×7\.5/);
    assert.equal(await points(), '0');
    await page.locator('#fit').click();
    assert.equal(await page.locator('#map-viewport').evaluate(e => e.scrollHeight <= e.clientHeight + 1 && e.scrollWidth <= e.clientWidth + 1), true);
    await screenshot('desktop-overview.png');
    await page.locator('#actual').click();
    assert.equal(await page.locator('#zoom-label').innerText(), '100%');
    await page.locator('#zoom-in').click();
    assert.equal(await page.locator('#zoom-label').innerText(), '110%');
    await page.locator('#zoom-out').click();
    assert.equal(await page.locator('#zoom-label').innerText(), '100%');

    for (const preset of ['speed', 'trial', 'first']) await page.locator('#scenario').selectOption(preset);
    await page.reload();
    assert.equal(await points(), '100');
    assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), originalStorage);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await select('drop2');
    await screenshot('mobile.png');
    await page.locator('#purchase').click();
    assert.equal(await page.locator('#purchase-dialog').isVisible(), true);
    await page.locator('#confirm-purchase').click();
    await page.waitForFunction(() => document.getElementById('points').textContent === '40');
    await page.locator('#fit').click();
    await page.locator('#scenario').selectOption('speed');
    await page.locator('[data-family="trial"]').click();
    await page.locator('[data-view="list"]').click();
    assert.equal(await page.locator('#node-list tr').count(), 5);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await screenshot('mobile-list.png');
    assert.deepEqual(errors, []);
    console.log('PASS: desktop/mobile rendering, purchase/cancel, prerequisites/budget, presets, search/list, totals, zoom, reload/save isolation.');
    console.log('Screenshots: ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
