'use strict';
const path = require('../lib/project-paths.cjs').assetPaths, fs = require('node:fs'), assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const output = path.resolve(__dirname, '../../output/gear-bulk'); fs.mkdirSync(output, { recursive: true });
function richSave() {
  const save = D.freshSave(); save.cleared = Array.from({ length: 20 }, (_, i) => i + 1); save.gold = 100000;
  for (const item of D.ITEMS.filter(i => i.type !== 'gem')) save.inventory[item.id] = 10000;
  for (const c of Object.values(save.progression.characters)) c.xp = P.experience(20);
  return save;
}
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
  const select = node => page.locator('.forge-tree [data-growth-node="' + node + '"]').click();
  const bulk = node => page.locator('[data-buy-gear-path="' + node + '"]');
  async function load(seed) {
    await page.evaluate(seed => sessionStorage.setItem('gear-bulk-test-seed', JSON.stringify(seed)), seed);
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor();
    await page.locator('[data-open=forge]').first().click();
  }
  try {
    await page.clock.install();
    await page.addInitScript(key => {
      const seed = sessionStorage.getItem('gear-bulk-test-seed');
      if (seed) { localStorage.setItem(key, seed); sessionStorage.removeItem('gear-bulk-test-seed'); }
    }, D.SAVE_KEY);
    await page.goto(url + 'game.html');
    await page.locator('#start-button:not([disabled])').waitFor();
    if (process.argv.includes('--main-free-only')) {
      const T = require('../../public/js/data/reincarnation-tree-data.js');
      function own(save, id) {
        for (const parent of T.byId[id].requires) if (parent !== 'origin' && !save.reincarnation.owned.includes(parent)) own(save, parent);
        if (!save.reincarnation.owned.includes(id)) save.reincarnation.owned.push(id);
      }
      function freeSave() {
        const save = richSave(); save.gold = 0; save.inventory = { potion: 3 }; save.autoGear.enabled = false;
        Object.assign(save.reincarnation, { discovered: true, unlocked: true, cycle: 20, total: 2000 }); own(save, 'main-free');
        return save;
      }
      const detailCosts = page.locator('.forge-purchase-side > .node-costs');
      for (const [width, height] of [[1440, 1050], [390, 844]]) {
        await page.setViewportSize({ width, height }); await load(freeSave()); await select('main-3');
        assert.equal(await detailCosts.innerText(), '無料');
        assert.equal(await page.locator('.forge-bulk-purchase .node-costs').innerText(), '無料');
        assert.equal(await bulk('main-3').isEnabled(), true);
        await page.locator('[data-growth-node="main-3"]').hover();
        assert.ok((await page.locator('#tooltip').innerText()).includes('無料'));
        assert.equal(await detailCosts.locator('.insufficient, .node-cost').count(), 0);
        await page.screenshot({ path: path.join(output, 'main-free-' + width + '.png') });
        await select('main-1'); await page.locator('[data-buy-node="main-1"]').click();
        assert.equal((await saved()).gold, 0);
        await select('main-3'); await bulk('main-3').click();
        const bought = await saved();
        assert.equal(bought.gold, 0); assert.deepEqual(bought.inventory, { potion: 3 });
        assert.ok(['main-1', 'main-2', 'main-3'].every(id => bought.progression.characters.warrior.weapon.includes(id)));
        await page.reload(); await page.locator('#start-button:not([disabled])').waitFor();
        await page.locator('[data-open=forge]').first().click(); await select('main-3');
        assert.equal(await detailCosts.innerText(), '無料');
        assert.equal(await page.locator('[data-buy-node="main-3"]').innerText(), '取得済み');
        const box = await detailCosts.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= width);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const gated = freeSave(); gated.cleared = [1, 3]; await load(gated); await select('main-3');
        assert.equal(await detailCosts.innerText(), '無料'); assert.equal(await bulk('main-3').isEnabled(), false);
      }
      await page.setViewportSize({ width: 1440, height: 1050 });
      const discounted = richSave();
      Object.assign(discounted.reincarnation, { discovered: true, unlocked: true, cycle: 20, total: 2000 });
      own(discounted, 'gold-cost'); own(discounted, 'sub20'); await load(discounted); await select('branch-2-up-4');
      const node = P.gearTree('warrior', 'weapon').find(n => n.id === 'branch-2-up-4'), cost = P.gearCost(discounted, node);
      for (const [key, amount] of Object.entries(cost)) {
        assert.equal(await detailCosts.locator('.node-cost').filter({ has: page.locator('img[src$="/' + key + '.png"]') }).locator('b').textContent(), String(amount));
      }
      assert.deepEqual(errors, []);
      console.log('Main-free UI passed: actual discounted costs, free detail/tooltip/path totals, zero-wallet single/path purchases, reload, stage gates and layout at 1440px/390px; no resource/runtime errors. Screenshots: ' + output);
      return;
    }

    const focusedNode = () => page.locator('.forge-tree .selected').getAttribute('data-growth-node');
    async function checkInitialFocus(seed, expected) {
      await load(seed); await page.clock.runFor(100);
      assert.equal(await focusedNode(), expected);
      const view = await page.locator('.forge-viewport').boundingBox();
      const node = await page.locator('.forge-tree .selected').boundingBox();
      assert.ok(node.x >= view.x && node.x + node.width <= view.x + view.width, 'focused node is visible horizontally');
      assert.ok(node.y >= view.y && node.y + node.height <= view.y + view.height, 'focused node is visible vertically');
    }
    await checkInitialFocus(richSave(), 'main-10');
    assert.equal(await page.locator('.forge-tree .selected.bulk-ready .forge-bulk-ready').textContent(), '+10');
    const mainOwned = richSave();
    mainOwned.progression.characters.warrior.weapon = P.gearTree('warrior', 'weapon').filter(n => n.main).map(n => n.id);
    await checkInitialFocus(mainOwned, 'crown-1-3');
    const uniqueOwned = richSave();
    uniqueOwned.progression.characters.warrior.weapon = P.gearTree('warrior', 'weapon').filter(n => n.main || n.unique).map(n => n.id);
    await checkInitialFocus(uniqueOwned, 'branch-10-up-4');
    const early = richSave(); early.cleared = [1];
    await checkInitialFocus(early, 'main-1');
    assert.equal(await page.locator('.forge-tree .main-node.bulk-ready').count(), 0);
    const empty = richSave(); empty.gold = 0; empty.inventory = {};
    await checkInitialFocus(empty, 'main-1');
    assert.equal(await page.locator('.forge-tree .bulk-ready').count(), 0);
    for (const [width, height] of [[1440, 740], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await checkInitialFocus(richSave(), 'main-10');
    }
    await page.setViewportSize({ width: 1440, height: 1050 });
    const seed = richSave(), target = 'branch-3-up-4', plan = P.gearPurchasePlan(seed, 'warrior', 'weapon', target);
    await load(seed); await select(target);
    assert.equal(await bulk(target).isEnabled(), true);
    assert.equal(await page.locator('[data-buy-node="' + target + '"]').isEnabled(), false);
    assert.equal(await page.locator('.bulk-cost-heading b').textContent(), '7 ノード');
    for (const [key, amount] of Object.entries(plan.cost)) {
      assert.equal(await page.locator('.forge-bulk-purchase .node-cost').filter({ has: page.locator('img[src$="/' + key + '.png"]') }).locator('b').textContent(), String(amount));
    }
    await page.screenshot({ path: path.join(output, 'forest-path.png') });
    await bulk(target).click();
    const expected = structuredClone(seed); assert.equal(P.purchaseGearPath(expected, 'warrior', 'weapon', target), true);
    assert.deepEqual(await saved(), expected);
    assert.equal(await page.locator('.forge-bulk-purchase').count(), 0);
    assert.equal(await page.locator('.forge-tree .owned').count(), 7);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.growthNode), target);
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor(); assert.deepEqual(await saved(), expected);

    for (const key of Object.keys(plan.cost)) {
      const short = richSave(); if (key === 'gold') short.gold = plan.cost[key] - 1; else short.inventory[key] = plan.cost[key] - 1;
      await load(short); await select(target); assert.equal(await bulk(target).isEnabled(), false, key);
      assert.equal(await page.locator('.forge-bulk-purchase .insufficient').count(), 1);
      await page.locator('.bulk-action-tip').hover();
      assert.ok((await page.locator('#tooltip').textContent()).includes('合計素材・ゴールドが不足'));
      assert.deepEqual(await saved(), short);
    }
    const gated = richSave(); gated.cleared = gated.cleared.filter(stage => stage !== 2);
    await load(gated); await select(target); assert.equal(await bulk(target).isEnabled(), false);
    assert.ok((await page.locator('.bulk-blocked').textContent()).includes('2'));

    await load(richSave()); await page.locator('[data-character=mage]').click();
    await page.locator('[data-forge-slot=armor]').click(); await page.locator('[data-forge-region="2"]').click();
    const end = 'swamp-crown-2-3'; await select(end);
    assert.equal(await bulk(end).isEnabled(), true); assert.equal(await page.locator('.bulk-cost-heading b').textContent(), '24 ノード');
    for (const [width, height] of [[1440, 1050], [820, 900], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height }); await page.clock.runFor(100);
      await bulk(end).scrollIntoViewIfNeeded();
      const button = await bulk(end).boundingBox(), detail = await page.locator('.node-detail').boundingBox();
      assert.ok(button.x >= 0 && button.x + button.width <= width && button.y >= 0 && button.y + button.height <= height, 'bulk button fits ' + width);
      assert.ok(detail.x >= 0 && detail.x + detail.width <= width, 'detail fits ' + width);
      assert.ok((await page.locator('.forge-viewport').boundingBox()).height >= 150, 'tree retains room ' + width);
      await page.screenshot({ path: path.join(output, 'swamp-path-' + width + '.png') });
      if (width <= 580) {
        await page.locator('.forge-viewport').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, 'swamp-tree-' + width + '.png') });
      }
    }
    const beforeSwamp = await saved(), swampExpected = structuredClone(beforeSwamp);
    assert.equal(P.purchaseGearPath(swampExpected, 'mage', 'armor', end), true);
    await bulk(end).click(); assert.deepEqual(await saved(), swampExpected);
    assert.equal(await page.locator('.forge-milestones .achieved').count(), 1);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ checks: 'path totals, atomic purchase, reload, every resource shortage, stage gates, character/slot isolation, cross-region prerequisites, milestones, four viewport widths', screenshots: output }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
