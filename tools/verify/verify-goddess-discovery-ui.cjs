'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { createServer } = require('../../server.cjs'), D = require('../../public/js/data/forest-data.js'), G = require('../../public/js/core/gem-system.js');
const catalog = require('../../public/assets/museum/index.json'), P = require('../../public/js/core/forest-progression.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const publicRoot = path.resolve(__dirname, '../../public'), output = path.resolve(__dirname, '../../output/goddess-discovery');
const secret = /女神|星界の残滓|エピック|EPIC|goddess/i;

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], shots = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
    page.on('pageerror', e => errors.push(e.stack));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    await page.route(url + '**', route => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      if (pathname === '/favicon.ico') return route.fulfill({ status: 204 });
      const file = path.resolve(publicRoot, '.' + (pathname === '/' ? '/game.html' : pathname)), relative = path.relative(publicRoot, file);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: 'Missing static file' });
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
      return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
    });
    const seed = D.freshSave(); seed.cleared = [...D.STAGES.map(s => s.id), 'dimensional-gate']; seed.selectedStage = 'dimensional-gate'; seed.autoMode = 'off';
    for(const item of D.ITEMS.filter(i=>i.type==='material'&&!i.id.startsWith('gem-shard-')&&i.id!==G.Epic.MATERIAL))seed.inventory[item.id]=100;
    for(const rarity of ['rare','unique','legendary'])P.addGem(seed,G.generate({rarity,level:rarity==='legendary'?6:1,random:()=>.5}));
    await page.addInitScript(({ key, seed }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
      let data;
      Object.defineProperty(window, 'ForestData', { configurable: true, get: () => data, set(value) {
        data = value; const read = value.readSave;
        value.readSave = (...args) => window.testSave = read(...args);
      } });
    }, { key: D.SAVE_KEY, seed });
    await page.clock.install(); await page.goto(url);
    await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
    const open = async name => { await page.locator('[data-open=' + name + ']').first().click(); };
    const close = () => page.locator('#close-menu').click();
    const noSecrets = async () => assert.doesNotMatch(await page.locator('#menu-dialog').innerHTML(), secret);
    const shot = async name => { await page.screenshot({ path: path.join(output, name + '.png'), animations: 'disabled' }); shots.push(name); };
    const enemyCount = catalog.owners.filter(o => o.side === 'enemy'&&D.enemyDiscovered(seed,o.id)).length;

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 900 : 1000 });
      assert.equal(await page.locator('#route-nodes [data-stage]').count(), 2);
      assert.doesNotMatch(await page.locator('#route-nodes').innerHTML(), secret);
      await open('stages'); await page.locator('[data-special-stages]').click(); await noSecrets();
      assert.equal(await page.locator('[data-stage="' + G.Epic.GODDESS + '"]').count(), 0);
      await shot('stages-hidden-' + width); await close();
      await open('inventory'); await page.locator('[data-filter=material]').click(); await noSecrets();
      assert.equal(await page.locator('[data-item="' + G.Epic.MATERIAL + '"]').count(), 0);
      assert.equal(await page.locator('[data-item=gem-shard-epic]').count(), 0);
      assert.equal(await page.locator('.inventory-grid [data-item]').count(), D.ITEMS.filter(i => i.type !== 'gem'&&D.itemDiscovered(seed,i)).length);
      await shot('items-hidden-' + width);
      await page.locator('[data-filter=conversion]').click(); await noSecrets(); await close();
      await open('forge'); await noSecrets(); assert.equal(await page.locator('[data-forge-region=goddess]').count(), 0); await close();
      await open('gems'); await noSecrets();
      assert.equal(await page.locator('.gem-wallet > div').count(), 3);
      assert.equal(await page.locator('[data-gem-convert=legendary]').count(), 0);
      await page.locator('[data-filter=gem-workshop]').click(); await noSecrets();
      assert.equal(await page.locator('[data-gem-craft-field=rarity] option').count(), 3);
      await page.locator('[data-filter=gem-dismantle]').click(); await noSecrets(); await close();
      await open('options'); await noSecrets(); await close();
      await open('museum'); await page.locator('[data-museum-side=enemy]').waitFor();
      await page.locator('[data-museum-side=enemy]').click(); await noSecrets();
      assert.equal(await page.locator('[data-museum-owner]').count(), enemyCount);
      assert.equal(await page.locator('.museum-count').innerText(), String(enemyCount));
      await page.locator('[data-museum-control=region]').selectOption('special'); await noSecrets();
      await shot('museum-hidden-' + width); await close();
    }
    // A cached museum catalog must reveal the new encounter when progress changes.
    await page.evaluate(() => testSave.cleared.push('chaos-gate'));
    await open('stages'); await page.locator('[data-special-stages]').click();
    await page.locator('[data-stage="' + G.Epic.GODDESS + '"]').click();
    assert.equal(await page.locator('[data-enter="' + G.Epic.GODDESS + '"]').isEnabled(), true);
    await shot('stages-revealed'); await close();
    await open('inventory'); await page.locator('[data-filter=material]').click();
    assert.equal(await page.locator('[data-item="' + G.Epic.MATERIAL + '"]').count(), 0); await close();
    await open('museum'); await page.locator('[data-museum-side=enemy]').click();
    assert.equal(await page.locator('[data-museum-owner="' + G.Epic.GODDESS + '"]').count(), 0); await close();
    await open('forge'); assert.equal(await page.locator('[data-forge-region=goddess]').count(), 0); await close();
    await open('gems'); await page.locator('[data-filter=gem-workshop]').click();
    assert.equal(await page.locator('[data-gem-craft-field=rarity] option[value=epic]').count(), 0); await close();
    // Encounter and acquisition reveal independently of the clear.
    await page.evaluate(() => {
      ForestData.recordEncounters(testSave, [GemSystem.Epic.GODDESS]);
      testSave.inventory[GemSystem.Epic.MATERIAL]=1;
      ForestProgression.addGem(testSave, GemSystem.generate({rarity:'epic',random:()=>.5}));
    });
    await open('museum'); await page.locator('[data-museum-side=enemy]').click();
    await page.locator('[data-museum-owner="' + G.Epic.GODDESS + '"]').click();
    await page.locator('.museum-message').waitFor({state:'hidden'}); await close();
    await open('gems'); await page.locator('[data-filter=gem-workshop]').click();
    await page.locator('[data-gem-craft-field=rarity]').selectOption('epic');
    assert.equal(await page.locator('[data-gem-craft]').isDisabled(), true); await close();

    // Rewards remain usable after the clear and after restoring the same save.
    await page.evaluate(({ goddess, material, key }) => {
      testSave.cleared.push(goddess); testSave.inventory[material] = 100; testSave.inventory['gem-shard-epic'] = 1000;
      localStorage.setItem(key, JSON.stringify(testSave));
    }, { goddess: G.Epic.GODDESS, material: G.Epic.MATERIAL, key: D.SAVE_KEY });
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await open('forge'); await page.locator('[data-forge-region=goddess]').click();
    assert.equal(await page.locator('[data-growth-node]').count(), 41); await close();
    await open('gems'); await page.locator('[data-filter=gem-workshop]').click();
    await page.locator('[data-gem-craft-field=rarity]').selectOption('epic');
    assert.equal(await page.locator('[data-gem-craft]').isEnabled(), true);
    await page.locator('[data-gem-craft]').click();
    assert.equal(await page.evaluate(() => testSave.gems.at(-1).rarity), 'epic'); await close();
    await open('museum'); await page.locator('[data-museum-side=enemy]').click();
    await page.locator('[data-museum-owner="' + G.Epic.GODDESS + '"]').click();
    await page.locator('.museum-message').waitFor({ state: 'hidden' });
    assert.ok(await page.locator('.museum-filmstrip button').count() > 0);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'ui.json'), JSON.stringify({ status: 'pass', widths: [1440, 390], states: ['hidden', 'unlocked', 'cleared-and-restored'], shots, errors }, null, 2) + '\n');
    console.log('Goddess discovery UI passed: stage and route, items and totals, museum and totals, forge, gems, crafting and dismantle settings; unlock, clear and reload at desktop/mobile widths.');
    await context.close();
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { main };
