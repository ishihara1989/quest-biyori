'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { ROOT, PUBLIC, inside, writeAssetJson } = require('../lib/project-paths.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), A = require('../balance/audit-goddess.cjs');
const output = path.join(ROOT, 'output/boss-visibility');

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const server = require('../../server.cjs').createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [], scenes = [], seed = A.reference(); seed.autoMode = 'off'; seed.speed = 1;
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1050 }, reducedMotion: mobile ? 'reduce' : 'no-preference' });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.stack));
      page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.route('**/*', route => {
        const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
        if (pathname === '/favicon.ico') return route.fulfill({ status: 204 });
        const file = path.resolve(PUBLIC, pathname === '/' ? 'game.html' : '.' + pathname);
        if (!inside(PUBLIC, file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: 'Missing static file' });
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif' };
        return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
      });
      await page.clock.install();
      await page.addInitScript(({ key, seed }) => {
        localStorage.setItem(key, JSON.stringify(seed));
        let sim;
        Object.defineProperty(window, 'ForestSimulation', { configurable: true, get: () => sim, set(v) {
          sim = v; const create = v.createRun; window.visibilityCreateRun = create;
          v.createRun = (...args) => window.testRun = create(...args);
          // Freeze actors while supplying real, overlapping party attack events.
          v.update = (run, dt) => { run.time += dt; return (window.fxQueue || []).splice(0).map(e => ({ ...e, timeMs: run.time })); };
        } });
        window.frameDraws = [];
        const clear = CanvasRenderingContext2D.prototype.clearRect, draw = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.clearRect = function(...args) { if (this.canvas.id === 'game-canvas') frameDraws = []; return clear.apply(this, args); };
        CanvasRenderingContext2D.prototype.drawImage = function(...args) {
          if (this.canvas.id === 'game-canvas') frameDraws.push({ src: args[0]?.src || '', alpha: this.globalAlpha });
          return draw.apply(this, args);
        };
      }, { key: D.SAVE_KEY, seed });
      await page.goto('http://127.0.0.1:' + server.address().port);
      await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
      await page.locator('#start-button').click();
      await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
      for (const stage of [...Array.from({ length: 10 }, (_, i) => (i + 1) * 10), 'dimensional-gate', 'chaos-gate', 'extradimensional-goddess']) {
        const expected = await page.evaluate(({ stage, seed }) => {
          const builds = Object.fromEntries(Object.keys(ForestProgression.CHARACTERS).map(id => [id, ForestProgression.stats(seed, id)]));
          const next = visibilityCreateRun(stage, { builds, random: () => .5 });
          Object.assign(testRun, next);
          const r = testRun, region = r.stage.region;
          let types = r.stage.final ? ['extradimensional-goddess'] : [...new Set(r.stage.enemies)];
          if (r.stage.special && !r.stage.final) types = SpecialStages.definition(stage).BATCHES.flat(2);
          types = [...new Set(types)].filter(type => !ForestData.ALL_ENEMIES[type].dimensionalGate);
          r.enemies = types.map((type, i) => {
            const base = r.stage.special ? SpecialStages.profile(type, ForestData.ALL_ENEMIES, stage) : ForestData.ALL_ENEMIES[type];
            return { ...base, type, id: 'visibility-' + i, x: 350 + i % 7 * 80, y: [480, 390, 455, 420][i % 4], maxHp: base.hp, hp: base.hp,
              time: 0, motion: 'idle', state: 'idle', attackSpeed: 1, facing: -1, flash: 0, goddessPhase: 1 };
          });
          // Keep background gates in the scene as well as their summoned bosses.
          if (r.stage.special && !r.stage.final) r.enemies.push(next.enemies[0]);
          window.fxQueue = r.enemies.filter(e => !e.dimensionalGate).flatMap(e => [
            { type: 'wind', x: e.x, y: e.y - 70, skill: true },
            { type: 'warrior-impact', kind: 'slash', pattern: 'ultimate', index: 0, radius: 550, x: e.x, y: e.y, facing: 1 },
            { type: 'mage-impact', kind: 'arcane', element: 'arcane', pattern: 'cosmos', radius: 520, x: e.x, y: e.y }
          ]);
          return {
            bosses: r.enemies.filter(e => (e.boss || e.majorBoss) && !e.dimensionalGate).sort((a, b) => a.y - b.y).map(e => e.type),
            mobs: r.enemies.filter(e => !e.boss && !e.majorBoss).map(e => e.type), region
          };
        }, { stage, seed });
        await page.clock.runFor(120);
        const draws = await page.evaluate(() => frameDraws);
        const lastAttack = draws.findLastIndex(d => /\/assets\/(?:skills\/|effects\/mage-wind-impact\/)/.test(d.src));
        assert.ok(lastAttack >= 0, stage + ': overlapping party attacks rendered');
        const bodyDraws = draws.map((d, index) => ({ ...d, index, type: d.src.match(/\/assets\/enemies\/([^/]+)\//)?.[1] })).filter(d => d.type);
        for (const type of expected.bosses) {
          const body = bodyDraws.filter(d => d.type === type && !/\/(?:halo|throne|return)\//.test(d.src));
          assert.equal(body.length, 1, stage + ': ' + type + ' body drawn exactly once');
          assert.ok(body[0].index > lastAttack, stage + ': ' + type + ' stays above party attacks');
        }
        for (const type of expected.mobs) assert.ok(bodyDraws.find(d => d.type === type)?.index < lastAttack, stage + ': mob keeps its world layer');
        assert.deepEqual(bodyDraws.filter(d => expected.bosses.includes(d.type) && !/\/(?:halo|throne|return)\//.test(d.src)).map(d => d.type), expected.bosses, stage + ': overlapping bosses retain depth order');
        if ([80, 90, 100, 'chaos-gate', 'extradimensional-goddess'].includes(stage)) await page.locator('#game-canvas').screenshot({ path: path.join(output, 'battle-' + stage + (mobile ? '-mobile-reduced' : '') + '.png') });
        scenes.push({ stage, mobile, bosses: expected.bosses, mobs: expected.mobs });
      }
      // A hit flash and a fading corpse must not be darkened by a duplicate body pass.
      for (const [state, hp, time, hidden] of [['flash', 100, 0, false], ['down', 0, 1300, false], ['hidden', 100, 0, true], ['gone', 0, 2000, false]]) {
        await page.evaluate(({ state, hp, time, hidden }) => {
          const e = { ...ForestData.ALL_ENEMIES['boss-boar'], type: 'boss-boar', id: 'visibility-state', x: 720, y: 460, hp, maxHp: 100, time,
            motion: hp ? 'idle' : 'down', state: hp ? 'idle' : 'down', attackSpeed: 1, facing: -1, flash: state === 'flash' ? 60 : 0, hidden };
          testRun.enemies = [e];
        }, { state, hp, time, hidden });
        await page.clock.runFor(20);
        const bodies = await page.evaluate(() => frameDraws.filter(d => d.src.includes('/assets/enemies/boss-boar/')));
        assert.equal(bodies.length, hidden || state === 'gone' ? 0 : 1, state + ': correct body count');
        if (state === 'flash') assert.equal(bodies[0].alpha, .55);
        if (state === 'down') assert.ok(Math.abs(bodies[0].alpha - 2 / 3) < .001);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    assert.deepEqual(errors, []);
    writeAssetJson(path.join(output, 'ui.json'), { status: 'pass', scenes, states: ['flash', 'down', 'hidden', 'gone'], errors });
    console.log('Boss visibility passed: all 10 regions, both gates and goddess; overlapping attacks/bosses, hit/fade/hidden states, desktop and mobile/reduced motion.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
