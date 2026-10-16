'use strict';
const path = require('../lib/project-paths.cjs').assetPaths, fs = require('node:fs'), assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const output = path.resolve(__dirname, '../../output/skill-refund');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const seed = D.freshSave(); D.award(seed, 4); seed.autoMode = 'off';
  for (const [id, active, normal, passive] of [['warrior', 'moon', 'renjin', 'edge'], ['mage', 'wind', 'bolt', 'arcane']]) {
    seed.progression.characters[id].xp = P.experience(20);
    for (const [node, ranks] of [[active, 5], [active + '-enhance', 3], [normal, 2], [normal + '-enhance', 2], [passive, 2]]) {
      for (let i = 0; i < ranks; i++) assert.equal(P.purchase(seed, id, 'skills', node), true);
    }
  }
  const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
  const select = node => page.locator('[data-growth-node="' + node + '"][data-kind=skills]').click();
  const decrease = node => page.locator('[data-decrease-skill="' + node + '"]');
  async function checkRank(id, node, expected) {
    assert.equal(P.rank(await saved(), id, node), expected, id + '/' + node);
  }
  async function checkPoints(id, expected) {
    assert.equal(P.points(await saved(), id), expected);
    assert.equal(await page.locator('.tree-point>b').textContent(), String(expected));
  }
  try {
    await page.clock.install();
    await page.addInitScript(({ key, save }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(save));
    }, { key: D.SAVE_KEY, save: seed });
    await page.goto(url + 'game.html');
    await page.locator('#start-button:not([disabled])').waitFor();
    await page.locator('[data-open=skills]').first().click();
    for (const [id, active, normal, passive] of [['warrior', 'moon', 'renjin', 'edge'], ['mage', 'wind', 'bolt', 'arcane']]) {
      await page.locator('[data-character=' + id + ']').click();
      await select(active);
      const before = P.points(await saved(), id);
      assert.equal(await page.locator('[data-buy-node=' + active + ']').isDisabled(), true);
      assert.equal(await decrease(active).isEnabled(), true);
      await decrease(active).hover();
      assert.ok((await page.locator('#tooltip').textContent()).includes('前提を満たさなくなるスキルもLv.0'));
      await page.screenshot({ path: path.join(output, id + '-desktop.png') });
      for (let i = 4; i >= 1; i--) {
        await decrease(active).click();
        await checkRank(id, active, i); await checkRank(id, active + '-enhance', 3);
        assert.equal(await decrease(active).evaluate(e => e === document.activeElement), true);
      }
      await decrease(active).click();
      await checkRank(id, active, 0); await checkRank(id, active + '-enhance', 0);
      await checkPoints(id, before + 8);
      assert.equal(await page.locator('#notification').textContent(), 'SP +4');
      assert.equal(await decrease(active).isDisabled(), true);
      assert.equal(await page.locator('[data-buy-node=' + active + ']').isEnabled(), true);
      assert.equal(await page.locator('[data-growth-node=' + active + ']').evaluate(e => e === document.activeElement), true);
      const c = (await saved()).progression.characters[id];
      assert.equal(c.skills.includes(active), false); assert.equal(c.skills.includes(active + '-enhance'), false);
      assert.equal(await page.locator('[data-growth-node="' + active + '-enhance"] .rank-pips .on').count(), 0);
      await select(active + '-enhance');
      assert.equal(await decrease(active + '-enhance').isDisabled(), true);
      assert.equal(await page.locator('[data-buy-node="' + active + '-enhance"]').isDisabled(), true);

      await select(normal + '-enhance'); await decrease(normal + '-enhance').click();
      await checkRank(id, normal + '-enhance', 1); await checkRank(id, normal, 2);
      await select(normal); await decrease(normal).click();
      await checkRank(id, normal, 1); await checkRank(id, normal + '-enhance', 1);
      await decrease(normal).click();
      await checkRank(id, normal, 0); await checkRank(id, normal + '-enhance', 0);

      await select(passive); await decrease(passive).click();
      await checkRank(id, passive, 1); await checkPoints(id, 19);
      await page.screenshot({ path: path.join(output, id + '-refunded.png') });
    }

    // Reload must retain refunds, and the returned points must be spendable again.
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor();
    await page.locator('[data-open=skills]').first().click();
    await select('wind'); await checkRank('mage', 'wind', 0); await checkPoints('mage', 19);
    await page.locator('[data-buy-node=wind]').click();
    await checkRank('mage', 'wind', 1); await checkPoints('mage', 18);
    await select('wind-enhance'); await page.locator('[data-buy-node=wind-enhance]').click();
    await checkRank('mage', 'wind-enhance', 1); await checkPoints('mage', 17);
    await select('wind');

    for (const [width, height] of [[820, 900], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height }); await page.clock.runFor(3000);
      await page.screenshot({ path: path.join(output, 'mobile-' + width + '.png') });
      const bounds = await page.locator('.skill-level-actions').boundingBox();
      const minus = await decrease('wind').boundingBox();
      const plus = await page.locator('[data-buy-node=wind]').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'actions fit width ' + width);
      assert.ok(minus.x + minus.width <= plus.x, 'buttons do not overlap at ' + width);
      assert.ok(minus.height >= 37 && minus.y + minus.height <= height, 'minus is usable at ' + width + ': ' + JSON.stringify(minus));
      const layout = await page.locator('#menu-dialog').evaluate(e => ({ width: e.clientWidth, content: e.scrollWidth, bottom: e.getBoundingClientRect().bottom }));
      assert.ok(layout.content <= layout.width && layout.bottom <= height, 'skill dialog fits at ' + width + ': ' + JSON.stringify(layout));
    }
    await decrease('wind').click(); await checkRank('mage', 'wind-enhance', 0); await checkPoints('mage', 19);
    await page.locator('[data-growth-tab=forge]').click();
    assert.equal(await page.locator('[data-decrease-skill]').count(), 0);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks: 'both characters, max rank, tooltips, repeat focus, dependent reset, normal/enhancement/passive refunds, save/reload, reinvestment, three responsive widths', screenshots: output }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
