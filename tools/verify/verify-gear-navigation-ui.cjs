'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4192/';
const output = path.resolve(__dirname, '../../output/gear-navigation'); fs.mkdirSync(output, { recursive: true });
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 2, message + ': ' + a + ' / ' + b);
const sameScale = (a, b, message) => assert.ok(Math.abs(a - b) < .00001, message + ': ' + a + ' / ' + b);
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } }), page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const seed = D.freshSave(); seed.cleared = D.ALL_STAGES.map(s => s.id); seed.autoMode = 'off'; seed.gold = 1e9;
  for (const item of D.ITEMS) seed.inventory[item.id] = 100000;
  for (const c of Object.values(seed.progression.characters)) c.xp = P.experience(100);
  const view = () => page.locator('.forge-viewport');
  const read = () => view().evaluate(v => ({ left: v.scrollLeft, top: v.scrollTop, scale: new DOMMatrix(getComputedStyle(v.querySelector('.forge-tree')).transform).a, width: v.clientWidth, height: v.clientHeight }));
  async function blankPoint() {
    return view().evaluate(v => {
      const r = v.getBoundingClientRect();
      for (let y = 35; y < v.clientHeight - 20; y += 30) for (let x = 35; x < v.clientWidth - 20; x += 30) {
        const target = document.elementFromPoint(r.left + x, r.top + y);
        if (target && v.contains(target) && !target.closest('button,a')) return { x: r.left + x, y: r.top + y };
      }
      throw new Error('No empty tree space');
    });
  }
  async function wheel(delta, point) {
    point ||= await blankPoint(); await page.mouse.move(point.x, point.y); await page.mouse.wheel(0, delta);
    await page.waitForTimeout(50);
  }
  async function gestures(label) {
    await view().scrollIntoViewIfNeeded();
    const start = await read(), point = await blankPoint();
    await page.mouse.move(point.x, point.y); await page.mouse.down();
    assert.equal(await view().evaluate(v => v.classList.contains('dragging')), true);
    await page.mouse.move(point.x + 30, point.y + 20, { steps: 3 }); await page.mouse.up();
    const panned = await read(); near(panned.left, Math.max(0, start.left - 30), label + ' horizontal drag'); near(panned.top, Math.max(0, start.top - 20), label + ' vertical drag');
    assert.equal(await view().evaluate(v => v.classList.contains('dragging')), false);
    const rect = await view().boundingBox(), anchor = { x: rect.x + panned.width / 2, y: rect.y + panned.height / 2 };
    await wheel(-150, anchor); const zoomed = await read(); assert.ok(zoomed.scale > panned.scale, label + ' zoom in');
    near((panned.left + panned.width / 2) / panned.scale, (zoomed.left + panned.width / 2) / zoomed.scale, label + ' horizontal cursor anchor');
    near((panned.top + panned.height / 2) / panned.scale, (zoomed.top + panned.height / 2) / zoomed.scale, label + ' vertical cursor anchor');
    await wheel(150, anchor); sameScale((await read()).scale, start.scale, label + ' zoom out');
    await wheel(-150, anchor);
    await page.screenshot({ path: path.join(output, label + '.png') });
  }
  try {
    await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key: D.SAVE_KEY, seed });
    await page.goto(url + 'game.html'); await page.locator('#start-button:not([disabled])').waitFor();
    await page.locator('[data-open=forge]').first().click();
    assert.equal(await page.locator('.forge-frame').evaluate(f => f.clientWidth), 2240, 'tree is sized before the dialog opens');
    const help = await blankPoint(); await page.mouse.move(help.x, help.y);
    assert.equal(await page.locator('#tooltip').isVisible(), true, 'empty-space hover explains navigation');
    assert.match(await page.locator('#tooltip').textContent(), /ドラッグ.*ホイール/);
    await gestures('forest-desktop');
    const scale = (await read()).scale;
    // Node clicks and purchases rerender the UI without resetting the camera.
    await page.locator('.forge-tree [data-growth-node=main-1]').click();
    const selected = await read(); sameScale(selected.scale, scale, 'selection retains scale');
    await page.locator('[data-buy-node=main-1]').click(); const purchased = await read();
    sameScale(purchased.scale, scale, 'purchase retains scale'); near(purchased.left, selected.left, 'purchase retains x'); near(purchased.top, selected.top, 'purchase retains y');
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
    assert.ok(saved.progression.characters.warrior.weapon.includes('main-1'));
    await view().scrollIntoViewIfNeeded();
    // A press on a node, including its image, must not start a pan.
    const node = page.locator('.forge-tree [data-growth-node=main-1] .node-art img'), bounds = await node.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2); await page.mouse.down();
    assert.equal(await view().evaluate(v => v.classList.contains('dragging')), false); await page.mouse.up();
    // Switching character, slot and region keeps their zoom levels independent.
    await page.locator('[data-forge-slot=armor]').click(); sameScale((await read()).scale, 1, 'armor initial zoom');
    await page.locator('[data-forge-slot=weapon]').click(); sameScale((await read()).scale, scale, 'weapon zoom retained');
    await page.locator('[data-character=mage]').click(); sameScale((await read()).scale, 1, 'mage initial zoom');
    await page.locator('[data-character=warrior]').click(); sameScale((await read()).scale, scale, 'warrior zoom retained');
    await page.locator('[data-forge-region="10"]').click(); await gestures('castle-desktop');
    await page.locator('[data-forge-region=goddess]').click(); await gestures('goddess-desktop');
    await wheel(-10000); assert.equal((await read()).scale, 1.8, 'upper zoom bound');
    await wheel(10000); assert.equal((await read()).scale, .2, 'lower zoom bound');
    await wheel(-10000); assert.equal((await read()).scale, 1.8, 'can zoom after reaching lower bound');
    // Pointer cancellation and capture loss must both release the grab cursor.
    for (const type of ['pointercancel', 'lostpointercapture']) {
      const point = await blankPoint(); await page.mouse.move(point.x, point.y); await page.mouse.down();
      await view().evaluate((v, type) => v.dispatchEvent(new PointerEvent(type, { pointerId: 1 })), type);
      assert.equal(await view().evaluate(v => v.classList.contains('dragging')), false); await page.mouse.up();
    }
    for (const [region, width, height] of [[2, 1440, 740], [3, 390, 844], [4, 320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.locator('[data-forge-region="' + region + '"]').click();
      // Use a fresh region so each layout starts at its normal zoom.
      await page.locator('[data-forge-slot=armor]').click(); await gestures('region-' + region + '-' + width);
      assert.ok(await page.locator('#menu-content').evaluate(v => v.scrollWidth <= v.clientWidth + 2), 'dialog fits ' + width);
      await page.locator('[data-forge-region=goddess]').click();
      await view().scrollIntoViewIfNeeded(); await wheel(300);
      await page.screenshot({ path: path.join(output, 'goddess-' + width + '.png') });
    }
    // The adjacent skill viewport retains its existing controls.
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.locator('[data-growth-tab=skills]').click();
    const skill = page.locator('.skill-tree'), before = await skill.getAttribute('style');
    await page.locator('[data-tree-zoom=in]').click(); assert.notEqual(await skill.getAttribute('style'), before);
    const skillView = await page.locator('.skill-viewport').boundingBox();
    await page.mouse.move(skillView.x + 20, skillView.y + 20); await page.mouse.wheel(0, 150); await page.waitForTimeout(50);
    const old = await skill.getAttribute('style'); await page.mouse.down(); await page.mouse.move(skillView.x + 50, skillView.y + 40); await page.mouse.up();
    assert.notEqual(await skill.getAttribute('style'), old);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks: 'drag both axes, pointer anchoring, zoom limits, node clicks, purchase and rerender, character/slot/region isolation, goddess and castle, pointer cleanup, four viewports, skill controls', screenshots: output }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
