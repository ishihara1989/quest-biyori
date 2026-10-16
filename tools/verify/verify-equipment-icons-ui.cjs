'use strict';
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, assert = require('node:assert/strict');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js'), V = require('../../public/js/ui/equipment-visuals.js');
const { createServer } = require('../../server.cjs');
const output = path.resolve(__dirname, '../../output/equipment-icons'); fs.mkdirSync(output, { recursive: true });
const prefixes = ['', 'swamp-', 'cave-', 'coast-', 'ruins-', 'desert-', 'highland-', 'glacier-', 'volcano-', 'castle-'];
function seed() {
  const save = D.freshSave(); save.cleared = D.ALL_STAGES.map(s => s.id); save.gold = 1e9;
  for (const item of D.ITEMS) save.inventory[item.id] = 100000;
  for (const character of Object.values(save.progression.characters)) character.xp = P.experience(100);
  return save;
}
(async () => {
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } }), page = await context.newPage(), errors = [];
  // Fulfill static resources locally so the verifier also works when the
  // browser sandbox disallows loopback network requests.
  await page.route(url + '**', async route => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    const file = path.resolve(__dirname, '../..', pathname === '/equipment-lab.html'
      ? 'development/labs/equipment-lab.html' : (pathname.startsWith('/development/') ? '.' : 'public') + pathname);
    const base = path.resolve(__dirname, '../..'), relative = path.relative(base, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: 'Missing resource' });
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif' };
    await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  async function loadedImages() {
    await page.locator('#menu-content img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    assert.equal(await page.locator('#menu-content img').evaluateAll(images => images.every(img => img.naturalWidth > 0)), true);
  }
  async function checkSlot(character, slot, region) {
    assert.equal(await page.locator('[data-forge-slot="' + slot + '"] img').getAttribute('src'), V.image(character, slot, region));
  }
  try {
    await page.addInitScript(({ key, initial }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(initial)); }, { key: D.SAVE_KEY, initial: seed() });
    await page.goto(url + 'equipment-lab.html');
    await page.locator('.row img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    await page.screenshot({ path: path.join(output, 'gallery.png'), fullPage: true });
    await page.goto(url + 'game.html'); await page.locator('#start-button:not([disabled])').waitFor();
    await page.locator('[data-open=forge]').first().click();
    for (const character of Object.keys(P.CHARACTERS)) {
      await page.locator('[data-character="' + character + '"]').click();
      for (const slot of ['weapon', 'armor']) {
        await page.locator('[data-forge-slot="' + slot + '"]').click();
        await checkSlot(character, slot, 1);
        for (let region = 2; region <= 10; region++) {
          await page.locator('[data-forge-region="' + region + '"]').click();
          await checkSlot(character, slot, region - 1);
          const target = prefixes[region - 1] + 'main-1';
          const node = page.locator('.forge-tree [data-growth-node="' + target + '"]');
          assert.equal(await node.locator('img').getAttribute('src'), V.image(character, slot, region));
          await node.click(); await page.locator('[data-buy-gear-path="' + target + '"]').click();
          await checkSlot(character, slot, region);
          await loadedImages();
        }
        await page.locator('[data-forge-region="goddess"]').click();
        await checkSlot(character, slot, 10);
        const root = page.locator('[data-growth-node="goddess-root"]');
        assert.ok(await root.evaluate(e => e.classList.contains('main-node') && !e.classList.contains('unique')));
        assert.equal(await root.locator('img').getAttribute('src'), V.image(character, slot, 'goddess'));
        await root.click();
        assert.equal(await page.locator('.node-detail-text>small').textContent(), 'MAIN PATH');
        assert.ok(!(await page.locator('#menu-content').innerText()).match(/undefined|NaN/));
        await page.locator('[data-buy-node="goddess-root"]').click();
        await checkSlot(character, slot, 'goddess'); await loadedImages();
      }
      await page.locator('[data-forge-region="1"]').click();
      // Browsing an earlier region keeps the latest equipped illustrations.
      await checkSlot(character, 'weapon', 'goddess'); await checkSlot(character, 'armor', 'goddess');
      await page.locator('[data-growth-tab=character]').click();
      for (const slot of ['weapon', 'armor']) {
        const card = page.locator('[data-gear-open="' + slot + '"]');
        assert.equal(await card.locator('img').getAttribute('src'), V.image(character, slot, 'goddess'));
        assert.ok((await card.locator('strong').textContent()).startsWith('星界の'));
      }
      await page.locator('[data-growth-tab=forge]').click();
      console.log('Verified ' + character + ': both slots, 10 regions and goddess.');
    }
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor(); await page.locator('[data-open=forge]').first().click();
    await checkSlot('miko', 'weapon', 'goddess'); await checkSlot('miko', 'armor', 'goddess');
    for (const [character, slot, region, node] of [
      ['warrior', 'weapon', 2, 'swamp-branch-3-up-4'], ['mage', 'armor', 3, 'cave-crown-3-3'],
      ['ninja', 'weapon', 4, 'coast-crown-3-3'], ['shaman', 'weapon', 5, 'ruins-crown-3-3'],
    ]) {
      await page.locator('[data-character="' + character + '"]').click(); await page.locator('[data-forge-slot="' + slot + '"]').click();
      await page.locator('[data-forge-region="' + region + '"]').click();
      await page.locator('.forge-tree [data-growth-node="' + node + '"]').click(); await loadedImages();
      await page.screenshot({ path: path.join(output, character + '-forge.png') });
    }
    for (const [width, height] of [[1440, 740], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.locator('[data-forge-region="5"]').click();
      await page.locator('.forge-tree [data-growth-node="ruins-main-1"]').click(); await loadedImages();
      await page.screenshot({ path: path.join(output, 'forge-' + width + '.png') });
      const detail = await page.locator('.node-detail').boundingBox();
      assert.ok(detail.x >= 0 && detail.x + detail.width <= width + 1);
      for (const region of [6, 7, 8, 9, 10, 'goddess']) {
        await page.locator('[data-forge-region="' + region + '"]').click();
        await page.locator('[data-growth-node="' + (region === 'goddess' ? 'goddess-root' : prefixes[region - 1] + 'main-1') + '"]').click();
        await loadedImages();
        assert.ok(!(await page.locator('#menu-content').innerText()).match(/undefined|NaN/));
        assert.ok(await page.locator('#menu-content').evaluate(e => e.scrollWidth <= e.clientWidth + 2));
        await page.screenshot({ path: path.join(output, 'forge-' + region + '-' + width + '.png') });
      }
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'ui.json'), JSON.stringify({ status: 'pass', classes: Object.keys(P.CHARACTERS), regions: [...V.REGIONS, 'goddess'], viewports: [1440, 390], errors }, null, 2) + '\n');
    console.log('Verified 6 classes, independent weapon/armor evolution through 10 regions and goddess, main classification, previews, reload and responsive layouts.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
