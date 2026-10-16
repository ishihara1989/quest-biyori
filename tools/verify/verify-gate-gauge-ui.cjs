'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { ROOT, PUBLIC, inside } = require('../lib/project-paths.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), Special = require('../../public/js/data/special-stages.js');

async function main() {
  const output = path.join(ROOT, 'output/gate-gauge');
  fs.mkdirSync(output, { recursive: true });
  const server = require('../../server.cjs').createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], samples = [];
  try {
    for (const mobile of [false, true]) {
      const seed = D.freshSave();
      seed.cleared = [...D.STAGES.map(s => s.id), Special.ID, Special.CHAOS.ID];
      seed.selectedStage = Special.CHAOS.ID; seed.autoMode = 'off'; seed.speed = 1;
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1050 } });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.stack));
      page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.route('**/*', route => {
        const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
        if (pathname === '/favicon.ico') return route.fulfill({ status: 204 });
        const file = path.resolve(PUBLIC, pathname === '/' ? 'game.html' : '.' + pathname);
        if (!inside(PUBLIC, file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404 });
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif' };
        return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
      });
      await page.clock.install();
      await page.addInitScript(({ key, seed }) => {
        localStorage.setItem(key, JSON.stringify(seed));
        let sim;
        Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => sim, set(v) {
          sim = v; const create = v.createRun, update = v.update;
          window.gaugeCreate = stage => {
            const run = create(stage, { random: () => .5 });
            for (const actor of [run.hero, ...run.allies]) Object.assign(actor, {
              hp: 1e12, maxHp: 1e12, invulnerable: true, manualOnly: true, damage: 0, baseDamage: 0,
              cooldown: 1e9, skill: 1e9, warriorSkills: [], mageSkills: [], paladinSkills: [], ninjaSkills: [], shamanSkills: [], mikoSkills: []
            });
            return run;
          };
          v.createRun = stage => window.testRun = gaugeCreate(stage);
          // Advance real combat explicitly; render frames only refresh the HUD.
          window.gaugeAdvance = ms => { for (let t = 0; t < ms; t += 20) update(testRun, Math.min(20, ms - t)); };
          v.update = () => [];
        } });
      }, { key: D.SAVE_KEY, seed });
      await page.goto('http://127.0.0.1:' + server.address().port);
      await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
      await page.locator('#start-button').click();
      await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
      async function gauge(expected, label, visible = true) {
        await page.clock.runFor(40);
        assert.equal(await page.locator('#boss-hud').isVisible(), visible, label + ': visibility');
        if (!visible) return;
        const actual = await page.locator('#boss-hp-fill').evaluate(e => parseFloat(e.style.width));
        assert.ok(Math.abs(actual - expected) < .001, label + ': expected ' + expected + '%, got ' + actual + '%');
        samples.push({ mobile, label, expected, actual });
      }
      for (const id of [Special.ID, Special.CHAOS.ID]) {
        await page.locator('[data-open=stages]').first().click();
        await page.locator('[data-special-stages]').click();
        await page.locator('.stage-map [data-stage="' + id + '"]').click();
        await page.locator('[data-enter="' + id + '"]').click();
        let kills = 0;
        for (let tier = 0; tier < 3; tier++) {
          const batches = Special.definition(id).BATCHES[tier], budget = batches.flat().length;
          let defeated = 0;
          assert.deepEqual(await page.evaluate(() => [testRun.wave, testRun.kills]), [tier, kills]);
          await gauge(100, id + '/' + tier + '/start');
          for (let batch = 0; batch < batches.length; batch++) {
            await page.evaluate(() => gaugeAdvance(8000));
            assert.equal(await page.evaluate(() => testRun.enemies.filter(e => e.hp > 0 && !e.dimensionalGate && !e.bodyPart).length), batches[batch].length);
            await gauge(100 * (1 - defeated / budget), id + '/' + tier + '/' + batch + '/summoned');
            await page.evaluate(() => {
              const enemy = testRun.enemies.find(e => e.hp > 0 && !e.dimensionalGate && !e.bodyPart);
              ForestSimulation.hit(testRun, testRun.hero, enemy, 1e12, [], false, null, { critical: false, skipHitRoll: true });
            });
            defeated++;
            await gauge(100 * (1 - defeated / budget), id + '/' + tier + '/' + batch + '/one-kill');
            if (batch === 0) await page.screenshot({ path: path.join(output, id + '-' + tier + (mobile ? '-mobile' : '') + '.png') });
            await page.evaluate(() => {
              for (const enemy of testRun.enemies.filter(e => e.hp > 0 && !e.dimensionalGate && !e.bodyPart)) {
                ForestSimulation.hit(testRun, testRun.hero, enemy, 1e12, [], false, null, { critical: false, skipHitRoll: true });
              }
              gaugeAdvance(20);
            });
            defeated += batches[batch].length - 1;
            await gauge(100 * (1 - defeated / budget), id + '/' + tier + '/' + batch + '/cleared');
          }
          assert.equal(await page.evaluate(() => testRun.enemies.find(e => e.dimensionalGate).gatePhase), 'shattering');
          await page.evaluate(() => gaugeAdvance(1400));
          await gauge(0, id + '/' + tier + '/broken', false);
          kills += budget + 1;
          await page.evaluate(() => gaugeAdvance(1800));
        }
        assert.deepEqual(await page.evaluate(() => [testRun.status, testRun.kills]), ['victory', 128]);
      }
      // The shared HUD must still show ordinary boss HP and the final boss percentage.
      for (const stage of [10, 'extradimensional-goddess']) {
        await page.evaluate(stage => {
          Object.assign(testRun, gaugeCreate(stage));
          const type = stage === 10 ? 'treant' : 'extradimensional-goddess';
          testRun.enemies = [{ ...testRun.enemies[0], ...ForestData.ALL_ENEMIES[type], type, hp: 25, maxHp: 100 }];
        }, stage);
        await gauge(25, stage + '/hp');
        if (stage === 'extradimensional-goddess') assert.ok((await page.locator('#boss-name').innerText()).includes('25.0%'));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ status: 'pass', samples, errors }, null, 2));
    console.log('Gate gauge passed: both gates, all tiers/batches, partial kills, shattering, wave reset and victory; ordinary/final boss HP; desktop/mobile.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { main };
