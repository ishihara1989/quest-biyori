'use strict';
// Read-only performance investigation. Source probes/ablations exist only in
// the isolated browser context; the shipped game and the user's save are untouched.
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('../../server.cjs');
const D = require('../../public/js/data/forest-data.js');
const { fixture } = require('./verify-epic-gems-ui.cjs');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const output = path.resolve(__dirname, '../../output/battle-profile');
const arg = name => process.argv.find(value => value.startsWith('--' + name + '='))?.split('=').slice(1).join('=');
const seconds = Number(arg('seconds') || 20);
const speed = Number(arg('speed') || 1);
const trace = process.argv.includes('--trace');
const runLabel = arg('label') || '';
const availableCases = ['epic', 'epic-no-hud', 'epic-no-blur', 'epic-no-filter', 'epic-no-auto', 'epic-no-text', 'farm', 'farm-no-growth'];
const selected = (arg('cases') || availableCases.join(',')).split(',');

function installProbe({ seed, key, mode }) {
  performance.setResourceTimingBufferSize(10000);
  localStorage.setItem(key, JSON.stringify(seed));
  const p = window.__battleProfile = { active: false, frames: [], calls: {}, frame: null, events: {}, longTasks: [], mode };
  p.wrap = (name, fn) => function (...args) {
    if (!p.active) return fn.apply(this, args);
    const start = performance.now();
    try { return fn.apply(this, args); }
    finally {
      const elapsed = performance.now() - start;
      const row = p.calls[name] ||= { count: 0, total: 0, max: 0 };
      row.count++; row.total += elapsed; row.max = Math.max(row.max, elapsed);
      if (p.frame) p.frame.work[name] = (p.frame.work[name] || 0) + elapsed;
    }
  };
  new PerformanceObserver(list => { if (p.active) p.longTasks.push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration }))); }).observe({ type: 'longtask', buffered: false });
  if (mode.includes('no-blur')) {
    const descriptor = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
    Object.defineProperty(CanvasRenderingContext2D.prototype, 'shadowBlur', { ...descriptor, set() { descriptor.set.call(this, 0); } });
  }
  if (mode.includes('no-filter')) {
    const descriptor = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'filter');
    Object.defineProperty(CanvasRenderingContext2D.prototype, 'filter', { ...descriptor, set() { descriptor.set.call(this, 'none'); } });
  }
}

function instrument(source, mode) {
  const prefix = `
  const bp=window.__battleProfile;
  for(const [name,obj] of Object.entries({simulation:ForestSimulation,warrior:WarriorSkillRenderer,mage:MageSkillRenderer,paladin:PaladinSkillRenderer,ninja:NinjaSkillRenderer,shaman:ShamanSkillRenderer,miko:MikoSkillRenderer,goddess:GoddessRenderer,autoGear:ForestAutoGear,progression:ForestProgression})) {
    for(const key of Object.keys(obj)) if(typeof obj[key]==='function'&&key!=='load'&&key!=='create') obj[key]=bp.wrap(name+'.'+key,obj[key]);
  }
  const create=ForestSimulation.createRun;
  ForestSimulation.createRun=(...args)=>{let n=19371;args[1]||={};args[1].random=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);return window.__profileRun=create(...args);};
  const update=ForestSimulation.update;
  ForestSimulation.update=(...args)=>{const events=update(...args);if(bp.active)for(const e of events)bp.events[e.type]=(bp.events[e.type]||0)+1;return events;};
  `;
  const hooks = `
  for(const name of ['hud','syncCurseFocus','refreshGrowth','refreshResources','persist','runAutomaticGear','handleEvents','drawEffects','refreshSkillCooldowns']) {
    // Function bindings remain lexical to the original game closure.
    eval(name+'=bp.wrap(name,'+name+')');
  }
  ${mode.includes('no-hud') ? 'hud=()=>{};syncCurseFocus=()=>{};' : ''}
  ${mode.includes('no-growth') ? 'const fullGrowth=refreshGrowth;refreshGrowth=(...args)=>bp.active?undefined:fullGrowth(...args);' : ''}
  ${mode.includes('no-auto') ? 'runAutomaticGear=()=>{};' : ''}
  const innerDraw=draw;
  draw=time=>{if(!bp.active)return innerDraw(time);const row={time,gap:bp.last==null?0:time-bp.last,work:{},enemies:run.enemies.filter(e=>e.hp>0).length,clones:run.ninjaClones.length,contracts:run.mikoContracts.length,effects:effects.length};bp.last=time;bp.frame=row;const start=performance.now();try{return innerDraw(time);}finally{row.duration=performance.now()-start;bp.frames.push(row);bp.frame=null;}};
  `;
  const marker = "  refreshAutoControls(); text('speed-button', save.speed + '×');";
  if (!source.includes(marker)) throw Error('Game probe anchor changed');
  if (mode.includes('no-text')) {
    const damage = "} else if (['damage', 'heal'].includes(e.type)) {";
    if (!source.includes(damage)) throw Error('Damage text probe anchor changed');
    source = source.replace(damage, damage + 'continue;');
  }
  return prefix + source.replace(marker, hooks + marker);
}

const percentile = (values, q) => {
  const rows = values.slice().sort((a, b) => a - b);
  return rows[Math.min(rows.length - 1, Math.floor(rows.length * q))] || 0;
};
function summary(raw) {
  const gaps = raw.frames.map(f => f.gap).filter(Boolean), durations = raw.frames.map(f => f.duration);
  return {
    frames: raw.frames.length, simulatedMs: raw.state.elapsed, status: raw.state.status,
    gapMs: { median: percentile(gaps, .5), p95: percentile(gaps, .95), p99: percentile(gaps, .99), max: Math.max(0, ...gaps), over34: gaps.filter(n => n > 34).length, over50: gaps.filter(n => n > 50).length },
    jsMs: { median: percentile(durations, .5), p95: percentile(durations, .95), p99: percentile(durations, .99), max: Math.max(0, ...durations) },
    calls: Object.fromEntries(Object.entries(raw.calls).sort((a, b) => b[1].total - a[1].total).map(([name, r]) => [name, { ...r, mean: r.total / r.count }])),
    longTasks: raw.longTasks, events: raw.events, assets: raw.assets, state: raw.state,
    worstFrames: raw.frames.slice().sort((a, b) => b.duration - a.duration).slice(0, 12),
    errors: raw.errors,
    conditions: raw.conditions,
  };
}

async function main() {
  if (!Number.isFinite(seconds) || seconds < 1 || ![1, 2].includes(speed)) throw Error('Invalid --seconds/--speed');
  if (runLabel && !/^[a-z0-9-]+$/.test(runLabel)) throw Error('Invalid --label');
  if (selected.some(name => !availableCases.includes(name))) throw Error('Unknown --cases; choose from ' + availableCases.join(','));
  fs.mkdirSync(output, { recursive: true });
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const summaryFile = path.join(output, 'summary.json');
  const results = fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile, 'utf8')) : {};
  try {
    for (const mode of selected) {
      const label = [runLabel, mode, speed === 2 ? '2x' : ''].filter(Boolean).join('-');
      const seed = fixture(true); seed.speed = speed; seed.autoMode = 'same';
      seed.autoGear.enabled = true;
      if (mode.startsWith('farm')) seed.selectedStage = 99;
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await context.addInitScript(installProbe, { seed, key: D.SAVE_KEY, mode });
      const page = await context.newPage(), errors = [], requestedImages = new Map();
      page.on('pageerror', e => errors.push(e.stack));
      page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      // Serve the actual static bytes through Playwright, since this sandbox
      // blocks browser localhost HTTP. Image decoding/rasterization and time
      // are real; transport/cache timings are outside this investigation.
      await page.route(url + '**', route => {
        const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
        const root = path.resolve(__dirname, '../../public');
        const file = path.resolve(root, '.' + (pathname === '/' ? '/game.html' : pathname));
        const relative = path.relative(root, file);
        if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: 'Missing static file' });
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif' };
        const body = pathname === '/js/ui/forest-game.js' ? instrument(fs.readFileSync(file, 'utf8'), mode) : fs.readFileSync(file);
        if (/\.png$/.test(file)) requestedImages.set(pathname, { path: pathname, width: body.readUInt32BE(16), height: body.readUInt32BE(20), bytes: body.length });
        return route.fulfill({ contentType: types[path.extname(file)] || 'application/octet-stream', body });
      });
      await page.goto(url);
      await page.locator('#start-button:not([disabled])').waitFor({ timeout: 90000 });
      await page.locator('#start-button').click();
      if (mode.startsWith('epic')) await page.evaluate(() => { for (const e of __profileRun.enemies) e.hp = e.maxHp = 1e14; });
      // Let summon/clone effects build up and exclude navigation/startup work.
      await page.waitForTimeout(7000);
      const cdp = await context.newCDPSession(page);
      const traceEvents = [];
      if (trace) {
        cdp.on('Tracing.dataCollected', e => traceEvents.push(...e.value));
        await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing', transferMode: 'ReportEvents' });
      }
      await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
      await page.evaluate(() => { __battleProfile.active = true; });
      await page.waitForTimeout(seconds * 1000);
      const raw = await page.evaluate(() => {
        const p = __battleProfile; p.active = false;
        const assets = performance.getEntriesByType('resource').filter(e => /\.(png|gif)$/.test(new URL(e.name).pathname));
        const r = __profileRun;
        return { frames: p.frames, calls: p.calls, events: p.events, longTasks: p.longTasks,
          state: { elapsed: r.elapsed, status: r.status, kills: r.kills, clones: r.ninjaClones.length, contracts: r.mikoContracts.length },
          assets: { requests: assets.length, transferBytes: assets.reduce((n, e) => n + e.transferSize, 0), decodedPixels: [...document.images].reduce((n, e) => n + e.naturalWidth * e.naturalHeight, 0) } };
      });
      const { profile } = await cdp.send('Profiler.stop');
      if (trace) {
        const done = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
        await cdp.send('Tracing.end'); await done;
        fs.writeFileSync(path.join(output, label + '.trace.json'), JSON.stringify({ traceEvents }));
      }
      raw.errors = errors;
      raw.conditions = { seconds, speed, viewport: { width: 1440, height: 1000 }, browser: browser.version(), trace };
      raw.assets = { pngRequests: requestedImages.size, compressedBytes: [...requestedImages.values()].reduce((n, e) => n + e.bytes, 0), rgbaBytesEstimate: [...requestedImages.values()].reduce((n, e) => n + e.width * e.height * 4, 0) };
      fs.writeFileSync(path.join(output, label + '.images.json'), JSON.stringify([...requestedImages.values()], null, 2));
      results[label] = summary(raw);
      fs.writeFileSync(path.join(output, label + '.json'), JSON.stringify(raw));
      fs.writeFileSync(path.join(output, label + '.cpuprofile'), JSON.stringify(profile));
      await page.screenshot({ path: path.join(output, label + '.png') });
      fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2) + '\n');
      console.log(JSON.stringify({ mode: label, frames: raw.frames.length, gapMs: results[label].gapMs, jsMs: results[label].jsMs, topCalls: Object.entries(results[label].calls).slice(0, 5), errors }));
      await context.close();
      if (errors.length) throw Error(mode + ': ' + errors.join('\n'));
      if (!raw.frames.length || !raw.events.damage) throw Error(mode + ': no active battle samples');
    }
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { summary, instrument };
