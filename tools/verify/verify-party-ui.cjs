'use strict';
// Browser contexts use isolated saves and never touch the player's saved game.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const output = path.resolve(__dirname, '../../output/party-ui'), url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
function fixture() {
  const seed = D.freshSave(); seed.cleared = D.STAGES.map(s => s.id); seed.selectedStage = 41; seed.autoMode = 'off';
  for (const [index, job] of Object.keys(P.CHARACTERS).entries()) {
    const c = seed.progression.characters[job]; c.xp = P.experience(50 + index, index / 10);
    for (const slot of ['weapon', 'armor']) c[slot] = P.allGearTrees(job, slot).filter(n => n.main).map(n => n.id);
  }
  for (const family of ['physical', 'magic']) P.addGem(seed, P.Gem.generate({ rarity: 'rare', family, level: 1, size: .25, random: () => .5 }));
  return seed;
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  async function setup(seed) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    await page.addInitScript(({ key, seed }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
      let simulation;
      Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => simulation, set(value) {
        simulation = value; const create = value.createRun;
        value.createRun = (...args) => { window.testRun = create(...args); return window.testRun; };
      } });
    }, { key: D.SAVE_KEY, seed });
    await page.clock.install(); await page.goto(url); await page.locator('#start-button:not([disabled])').waitFor();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    return { context, page };
  }
  try {
    const seed = fixture(), { context, page } = await setup(seed);
    const read = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
    const card = job => page.locator('[data-party-character=' + job + ']');
    const open = menu => page.locator('.hero-card [data-open=' + menu + ']').click();
    const close = () => page.locator('#close-menu').click();
    assert.equal(await page.locator('.party-status-card').count(), 6);
    const boxes = await page.locator('.party-status-card').evaluateAll(list => list.map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y }; }));
    assert.equal(boxes[0].y, boxes[1].y); assert.ok(boxes[0].x < boxes[1].x); assert.equal(boxes[0].x, boxes[2].x); assert.ok(boxes[2].y > boxes[0].y);
    for (const job of Object.keys(P.CHARACTERS)) {
      await card(job).click();
      assert.equal(await page.locator('#menu-dialog').evaluate(el => el.open), false);
      assert.equal((await read()).progression.selected, job);
      assert.equal(await card(job).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.party-status-card[aria-pressed=true]').count(), 1);
      assert.equal(await page.locator('.hero-summary strong').innerText(), P.CHARACTERS[job].name);
      const stats = P.stats(await read(), job);
      assert.equal(await page.locator('.quick-stats b').first().innerText(), String(Number(stats.damage.toFixed(1))));
    }
    await card('mage').focus(); await page.keyboard.press('Enter');
    assert.equal(await card('mage').evaluate(el => el === document.activeElement), true);
    await open('character'); assert.equal(await page.locator('#menu-title').innerText(), '能力');
    assert.equal(await page.locator('.profile-name h3').innerText(), '魔法使い'); assert.equal(await page.locator('[data-gem],[data-gem-instance]').count(), 0);
    await page.locator('[data-character=paladin]').click(); await close();
    assert.equal(await page.locator('.hero-summary strong').innerText(), 'パラディン');
    await open('skills'); assert.equal(await page.locator('[data-character=paladin]').getAttribute('aria-pressed'), 'true'); await close();
    await open('forge'); assert.equal(await page.locator('[data-character=paladin]').getAttribute('aria-pressed'), 'true'); await close();
    await open('gems'); assert.equal(await page.locator('#menu-title').innerText(), 'ジェム');
    assert.equal(await page.locator('[data-inventory-character=paladin]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-inventory-character=warrior]').click();
    await page.locator('[data-gem-instance="1"]').click(); await page.locator('[data-toggle-inventory-gem="1"]').click();
    assert.deepEqual(P.gemOwner(await read(), 1), { character: 'warrior', slot: 'weapon' });
    await page.locator('[data-gem-instance="1"]').click({ button: 'right' }); assert.equal(P.gemOwner(await read(), 1), null);
    await page.locator('[data-inventory-slot=armor]').click(); await page.locator('[data-toggle-inventory-gem="1"]').click();
    assert.deepEqual(P.gemOwner(await read(), 1), { character: 'warrior', slot: 'armor' });
    await page.locator('[data-inventory-character=mage]').click(); await page.locator('[data-inventory-slot=weapon]').click();
    await page.locator('[data-gem-instance="2"]').click(); await page.locator('[data-toggle-inventory-gem="2"]').click();
    assert.deepEqual(P.gemOwner(await read(), 2), { character: 'mage', slot: 'weapon' });
    await page.screenshot({ path: path.join(output, 'gems-desktop.png') }); await close();
    await page.locator('[data-open=inventory]').first().click(); assert.equal(await page.locator('[data-filter=gem],[data-filter=gem-workshop]').count(), 0); await close();
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor();
    assert.equal(await card('mage').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(P.gemOwner(await read(), 2), { character: 'mage', slot: 'weapon' });
    await page.locator('#start-button').click(); await page.clock.runFor(1200); await page.locator('#pause-button').click();
    await page.evaluate(() => {
      [testRun.hero, ...testRun.allies].forEach((a, i) => { a.hp = i === 2 ? 0 : a.maxHp * (i === 1 ? .2 : .65); a.mp = a.maxMp * (.1 + i * .1); });
    });
    await page.clock.runFor(50);
    for (const [index, job] of Object.keys(P.CHARACTERS).entries()) {
      const values = await page.evaluate(job => { const a = job === 'warrior' ? testRun.hero : testRun.allies.find(a => a.type === job); return { hp: Math.ceil(a.hp), maxHp: Number(a.maxHp.toFixed(1)), mp: Math.floor(a.mp), maxMp: Number(a.maxMp.toFixed(1)) }; }, job);
      assert.equal(await card(job).locator('.hp b').innerText(), values.hp + ' / ' + values.maxHp);
      assert.equal(await card(job).locator('.mp b').innerText(), values.mp + ' / ' + values.maxMp);
      if (index === 2) { assert.match(await card(job).getAttribute('class'), /down/); assert.match(await card(job).getAttribute('aria-label'), /戦闘不能/); }
    }
    assert.match(await card('mage').getAttribute('class'), /wounded/);
    await page.screenshot({ path: path.join(output, 'party-desktop.png') });
    for (const width of [1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      const columns = await page.locator('.party-status-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length); assert.equal(columns, 2);
      await open('gems'); assert.ok(await page.locator('#menu-content').evaluate(el => el.scrollWidth <= el.clientWidth + 2));
      if (width === 390) await page.screenshot({ path: path.join(output, 'gems-mobile.png') });
      await close(); if (width === 390) await page.screenshot({ path: path.join(output, 'party-mobile.png'), fullPage: true });
    }
    await context.close();
    const fresh = await setup(D.freshSave()); assert.equal(await fresh.page.locator('.party-status-card').count(), 1);
    await fresh.page.locator('.hero-card [data-open=gems]').click();
    assert.equal(await fresh.page.locator('[data-equipped-gems] .gem-empty').innerText(), '未装着');
    assert.equal(await fresh.page.locator('[data-gem-bag] .gem-empty').innerText(), '該当なし');
    await fresh.context.close();
    assert.deepEqual(errors, []);
    console.log('PASS: two-column party HP/MP, live updates, wounded/down states, focus and keyboard selection, shared menu selection, independent gems, equip/unequip/reload, fresh save and responsive layouts');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
