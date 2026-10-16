'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const output = path.resolve(__dirname, '../../output/run-flow'), url = 'http://127.0.0.1:4191/';
const fullMotion = process.argv.includes('--full-motion');
function fixture() {
  const s = D.freshSave(); s.cleared = D.ALL_STAGES.map(s => s.id); s.selectedStage = 1; s.autoMode = 'off'; s.gold = 1e6;
  for (const item of D.ITEMS.filter(i => i.type !== 'gem')) s.inventory[item.id] = 10000;
  for (const c of Object.values(s.progression.characters)) c.xp = P.experience(50);
  for (const [family, level] of [['physical', 1], ['vitality', 1], ['magic', 1], ['physical', 5], ['recovery', 10]])
    P.addGem(s, P.Gem.generate({ family, rarity: 'rare', level, size: .5, random: () => .5 }));
  assert.ok(P.equipGem(s, 'warrior', 'armor', 2)); assert.ok(P.equipGem(s, 'mage', 'weapon', 3));
  return s;
}
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: fullMotion ? 'no-preference' : 'reduce' });
  const page = await context.newPage(), errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.stack));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.route(url + '**', route => {
    const root = path.resolve(__dirname, '../../public'), pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/game.html' : pathname)), relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: 'Missing file' });
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif' };
    return route.fulfill({ contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  await page.addInitScript(({ seed, key }) => {
    const nextSeed = sessionStorage.getItem('run-flow-seed');
    if (nextSeed) { localStorage.setItem(key, nextSeed); sessionStorage.removeItem('run-flow-seed'); }
    else if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
    window.testRuns = 0; window.testStatsCalls = 0; window.testMode = 'hold';
    let progression, sim, lootUI;
    Object.defineProperty(window, 'ForestLootUI', { configurable: true, get: () => lootUI, set(value) {
      lootUI = value; const create = value.create; value.create = (...args) => window.testLoot = create(...args);
    } });
    Object.defineProperty(window, 'ForestProgression', { configurable: true, get: () => progression, set(value) {
      progression = value; const stats = value.stats; value.stats = (...args) => { testStatsCalls++; return stats(...args); };
    } });
    Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => sim, set(value) {
      sim = value; const create = value.createRun, update = value.update;
      value.createRun = (...args) => { testRuns++; return window.testRun = create(...args); };
      value.update = (run, dt) => {
        for (const e of run.enemies) if (!e.testPrepared) { e.hp = e.maxHp = 1e14; e.testPrepared = true; }
        if (testMode === 'win') {
          run.hero.normalRank = 10;
          for (const e of run.enemies) if (e.hp > 0) { e.hp = 1; e.x = run.hero.x + 25; e.y = run.hero.y; }
        }
        if (testMode === 'lose') for (const a of [run.hero, ...run.allies]) a.hp = 0;
        return update(run, dt);
      };
    } });
  }, { seed: fixture(), key: D.SAVE_KEY });
  const read = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY);
  const close = () => page.locator('#close-menu').click();
  const open = kind => page.locator('[data-open=' + kind + ']').first().click();
  const fastClear = async () => {
    await page.evaluate(() => { testMode = 'win'; });
    for (let i = 0; i < 24 && await page.evaluate(() => testRun.status === 'running'); i++) await page.clock.runFor(500);
    assert.equal(await page.evaluate(() => testRun.status), 'victory');
    await page.evaluate(() => { testMode = 'hold'; });
  };
  const shot = name => page.screenshot({ path: path.join(output, (fullMotion ? 'full-' : '') + name + '.png') });
  try {
    await page.clock.install(); await page.goto(url); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    if (process.argv.includes('--layout-only')) {
      await page.locator('#start-button').click(); await open('gems');
      for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 900 }]]) {
        await page.setViewportSize(viewport);
        await page.locator('#menu-dialog').evaluate(e => { e.scrollTop = 240; }); await page.clock.runFor(50);
        const bounds = await page.locator('#close-menu').boundingBox();
        assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= viewport.height);
        assert.ok(await page.locator('#menu-content').evaluate(e => e.scrollWidth <= e.clientWidth + 2));
        await shot('gems-sticky-' + name);
      }
      assert.deepEqual(errors, []); console.log('PASS sticky menu header and gem layout at desktop/mobile widths'); return;
    }
    const pixelCheck = await page.evaluate(() => {
      const source = new OffscreenCanvas(64, 64), paint = source.getContext('2d');
      paint.fillStyle = '#f98b32'; paint.fillRect(8, 8, 42, 40); paint.clearRect(18, 15, 12, 12);
      paint.fillStyle = '#428aff88'; paint.fillRect(4, 32, 56, 24);
      const frame = { x: 0, y: 0, width: 64, height: 64 }, asset = { image: source };
      const shadow = { blur: 5, color: '#a392ff', x: 0, y: 0 }, filter = 'saturate(.45) hue-rotate(225deg)';
      let max = 0, total = 0, count = 0;
      for (const alpha of [.65, .9]) for (const flip of [false, true]) {
        const a = new OffscreenCanvas(128, 128), b = new OffscreenCanvas(128, 128), ca = a.getContext('2d'), cb = b.getContext('2d');
        for (const ctx of [ca, cb]) { ctx.fillStyle = '#304537'; ctx.fillRect(0, 0, 128, 128); ctx.translate(flip ? 96 : 32, 32); if (flip) ctx.scale(-1, 1); }
        ca.globalAlpha = alpha; ca.filter = filter; ca.shadowBlur = shadow.blur; ca.shadowColor = shadow.color; ca.drawImage(source, 0, 0);
        const cached = NinjaSkillRenderer.cachedFrame(asset, frame, filter, shadow, alpha);
        cb.drawImage(cached.image, -cached.padding, -cached.padding);
        const aa = ca.getImageData(0, 0, 128, 128).data, bb = cb.getImageData(0, 0, 128, 128).data;
        for (let i = 0; i < aa.length; i++) { const delta = Math.abs(aa[i] - bb[i]); max = Math.max(max, delta); total += delta; count++; }
      }
      return { max, mean: total / count, cache: NinjaSkillRenderer.cacheStats() };
    });
    assert.ok(pixelCheck.max <= 3 && pixelCheck.mean < .2, JSON.stringify(pixelCheck));
    assert.ok(pixelCheck.cache.bytes <= pixelCheck.cache.budget);
    checks.push('clone color/glow cache matches uncached rendering for both opacities and facing directions');
    await page.locator('#start-button').click(); await page.clock.runFor(50);
    const before = await read(), initialDamage = await page.evaluate(() => testRun.hero.damage);
    await page.evaluate(() => { const e = testRun.enemies[0]; e.hp = 1; e.x = testRun.hero.x + 15; e.y = testRun.hero.y; });
    const statsBeforeLoot = await page.evaluate(() => testStatsCalls);
    await page.clock.runFor(1500);
    assert.ok(await page.evaluate(() => testRun.kills > 0 && testRun.status === 'running'));
    assert.equal((await read()).gold, before.gold); assert.deepEqual((await read()).inventory, before.inventory);
    assert.equal(await page.evaluate(() => testStatsCalls), statsBeforeLoot);
    checks.push('partial kills grant nothing and do not rebuild stats');
    await open('stages'); await page.locator('[data-enter="1"]').click(); await page.clock.runFor(50);
    assert.equal(await page.evaluate(() => testRun.kills), 0);
    assert.equal((await read()).gold, before.gold); assert.deepEqual((await read()).inventory, before.inventory);
    checks.push('changing stages discards the interrupted run rewards');

    await open('forge'); const time = await page.evaluate(() => testRun.time); await page.clock.runFor(600);
    assert.ok(await page.evaluate(time => testRun.time > time, time));
    await page.locator('[data-forge-region="1"]').click();
    await page.locator('[data-growth-node="main-1"]').evaluate(e => e.click());
    await page.locator('[data-buy-node="main-1"]').click();
    assert.ok((await read()).progression.characters.warrior.weapon.includes('main-1'));
    assert.equal(await page.evaluate(() => testRun.hero.damage), initialDamage);
    assert.equal(await page.locator('.quick-stats b').first().innerText(), String(initialDamage));
    assert.ok(P.stats(await read(), 'warrior').damage > initialDamage);
    await page.locator('[data-growth-tab="skills"]').click();
    await page.locator('[data-growth-node="moon"]').evaluate(e => e.click());
    await page.locator('[data-buy-node="moon"]').click();
    assert.equal(await page.evaluate(() => testRun.hero.warriorSkills.some(s => s.id === 'moon')), false);
    assert.ok(await page.locator('.next-run-hint').isVisible());
    await shot('growth-desktop'); await close();
    await open('gems');
    assert.equal(await page.locator('[data-equipped-gems] [data-gem-instance]').count(), 0);
    assert.equal(await page.locator('[data-gem-bag] [data-gem-instance]').count(), 3);
    await page.locator('[data-gem-instance="1"]').click(); await page.locator('[data-toggle-inventory-gem="1"]').click();
    assert.equal(await page.locator('[data-equipped-gems] [data-gem-instance="1"]').count(), 1);
    assert.equal(await page.locator('[data-gem-bag] [data-gem-instance="1"]').count(), 0);
    assert.equal(await page.evaluate(() => testRun.hero.damage), initialDamage);
    await page.locator('[data-inventory-slot="armor"]').click();
    assert.equal(await page.locator('[data-equipped-gems] [data-gem-instance="2"]').count(), 1);
    await page.locator('[data-inventory-character="mage"]').click(); await page.locator('[data-inventory-slot="weapon"]').click();
    assert.equal(await page.locator('[data-equipped-gems] [data-gem-instance="3"]').count(), 1);
    await page.locator('[data-inventory-character="warrior"]').click();
    await page.locator('[data-gem-view="effect"]').selectOption('physical');
    assert.equal(await page.locator('[data-gem-bag] [data-gem-instance]').count(), 1);
    await page.locator('[data-gem-view="sort"]').selectOption('effect'); await page.locator('[data-gem-sort-direction]').click();
    await page.locator('[data-gem-view="effect"]').selectOption('all');
    await page.locator('[data-gem-view="search"]').fill('MP自然回復'); await page.clock.runFor(150);
    assert.equal(await page.locator('[data-gem-bag] [data-gem-instance="5"]').count(), 1);
    await page.locator('[data-gem-view="search"]').fill(''); await page.clock.runFor(150);
    await page.locator('[data-gem-instance="5"]').click(); await page.locator('[data-gem-lock="5"]').click();
    await page.locator('[data-gem-view="protectedOnly"]').check();
    assert.equal(await page.locator('[data-gem-bag] [data-gem-instance]').count(), 1);
    await page.locator('[data-reset-gem-filters]').click();
    assert.equal(await page.locator('[data-gem-bag] [data-gem-instance]').count(), 2);
    await shot('gems-desktop');
    await page.setViewportSize({ width: 390, height: 900 }); await shot('gems-mobile');
    assert.ok(await page.locator('#menu-content').evaluate(e => e.scrollWidth <= e.clientWidth + 2));
    assert.equal(await page.locator('[data-gem-view="search"]').getAttribute('value'), '');
    await page.setViewportSize({ width: 1440, height: 1000 }); await close();
    checks.push('equipment, skills and gems apply only to the next run; scoped inventory and filters work at both widths');

    await page.locator('#pause-button').click(); const paused = await page.evaluate(() => testRun.time);
    await open('forge'); await page.clock.runFor(600); assert.equal(await page.evaluate(() => testRun.time), paused);
    await close(); await page.locator('#pause-button').click();
    const priorClear = await read(); await open('forge'); await fastClear();
    const downTime = await page.evaluate(() => testRun.enemies.at(-1).time);
    await page.clock.runFor(100);
    assert.ok(await page.evaluate(time => testRun.enemies.at(-1).time > time, downTime));
    assert.ok(await page.locator('#menu-dialog').evaluate(e => e.open));
    assert.ok((await read()).gold > priorClear.gold);
    assert.ok(await page.locator('#result-overlay').isHidden());
    await close(); await page.clock.runFor(800); assert.ok(await page.locator('#result-overlay').isVisible());
    const claimed = await read(); await page.clock.runFor(800); assert.deepEqual(await read(), claimed);
    await page.locator('#result-stages').click(); assert.ok(await page.locator('#menu-dialog').evaluate(e => e.open));
    await page.clock.runFor(6000); assert.equal(await page.evaluate(() => testRun.status), 'victory');
    await shot('result-stage-select-desktop'); await page.setViewportSize({ width: 390, height: 900 }); await shot('result-stage-select-mobile');
    assert.ok(await page.locator('#menu-content').evaluate(e => e.scrollWidth <= e.clientWidth + 2));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-enter="1"]').click();
    assert.equal(await page.evaluate(() => testRun.hero.damage), P.stats(await read(), 'warrior').damage);
    assert.equal(await page.evaluate(() => testRun.hero.warriorSkills.some(s => s.id === 'moon')), true);
    checks.push('manual pause respected, clear rewards paid once, result-to-stage navigation and next-run snapshot work');

    await open('options'); await page.locator('[data-auto-mode="same"]').click(); await close();
    await open('forge'); const runs = await page.evaluate(() => testRuns); await fastClear();
    await page.clock.runFor(await page.evaluate(() => testLoot.plan.repeatAt + 800));
    assert.ok(await page.evaluate(runs => testRuns > runs, runs));
    assert.ok(await page.locator('#menu-dialog').evaluate(e => e.open));
    assert.ok(await page.locator('.forge-viewport').isVisible());
    assert.equal(await page.evaluate(() => testRun.status), 'running');
    await close();
    checks.push('automatic repeats preserve the open growth menu');

    await open('options'); await page.locator('[data-auto-mode="off"]').click(); await close();
    const lossBefore = await read(); await open('gems');
    await page.locator('[data-gem-view="search"]').fill('物理');
    await page.evaluate(() => { testMode = 'lose'; }); await page.clock.runFor(100);
    assert.equal(await page.locator('[data-gem-view="search"]').inputValue(), '物理');
    await close(); await page.clock.runFor(800);
    assert.equal(await page.evaluate(() => testRun.status), 'defeat');
    const lossAfter = await read(); assert.equal(lossAfter.gold, lossBefore.gold); assert.deepEqual(lossAfter.inventory, lossBefore.inventory);
    assert.equal(await page.locator('#result-gold').innerText(), '+0');
    await page.locator('#result-stages').click(); await page.locator('[data-enter="1"]').click();
    await page.evaluate(() => { testMode = 'hold'; }); await page.reload(); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    const restored = await read(); assert.ok(restored.progression.characters.warrior.weapon.includes('main-1'));
    assert.ok(restored.progression.characters.warrior.gems.weapon.includes(1));
    assert.ok(P.rank(restored, 'warrior', 'moon') > 0);
    checks.push('defeat pays nothing; purchased gear, skills and equipped gems survive reload');

    const early = D.freshSave(); early.cleared = [1,2,3]; early.selectedStage = 4; early.autoMode = 'off';
    early.progression.characters.warrior.xp = P.experience(4);
    await page.evaluate(seed => sessionStorage.setItem('run-flow-seed', JSON.stringify(seed)), early);
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
    assert.equal(await page.locator('.party-status-card').count(), 1);
    await page.locator('#start-button').click(); await open('forge'); await fastClear();
    assert.ok(await page.locator('#menu-dialog').evaluate(e => e.open));
    assert.equal(await page.evaluate(() => testRun.allies.length), 0);
    assert.ok(P.unlocked(await read(), 'mage'));
    await close(); await page.clock.runFor(fullMotion ? 12000 : 6500);
    await page.locator('#result-stages').click(); await page.locator('[data-enter="4"]').click();
    assert.equal(await page.evaluate(() => testRun.allies.some(a => a.type === 'mage')), true);
    assert.equal(await page.locator('.party-status-card').count(), 2);
    checks.push('early-game first clear recruits the mage and adds the ally only on the next run');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, (fullMotion ? 'full-' : '') + 'result.json'), JSON.stringify({ status: 'pass', fullMotion, checks, errors }, null, 2));
    console.log('PASS run flow: ' + checks.join('; '));
  } finally { await browser.close(); }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { fixture, main };
