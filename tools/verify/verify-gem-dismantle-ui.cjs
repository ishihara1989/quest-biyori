'use strict';
// Isolated browser contexts with fixture saves; never changes the player's game.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const { chromium } = require(require.resolve('playwright', { paths: [__dirname, bundled] }));
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js'), G = P.Gem;
const output = path.resolve(__dirname, '../../output/gem-dismantle'), url = process.env.FOREST_TEST_URL || 'http://127.0.0.1:4191/';
const errors = [];
function fixture(last = 60) {
  const save = D.freshSave(); save.cleared = D.STAGES.filter(s => s.id <= last).map(s => s.id); save.selectedStage = last; save.autoMode = 'off';
  for (const [job, c] of Object.entries(save.progression.characters)) {
    c.xp = P.experience(last);
    for (const slot of ['weapon', 'armor']) c[slot] = P.allGearTrees(job, slot).filter(n => n.stage <= last).map(n => n.id);
  }
  for (const [rarity, family, level] of [['rare','physical',1],['rare','physical',1],['rare','physical',2],['rare','physical',4],['unique','fortune',2],['legendary','echo',6]]) {
    P.addGem(save, G.generate({ rarity, family, level, size: 1, random: () => .5 }));
  }
  save.gems[0].locked = true; assert.ok(P.equipGem(save, 'warrior', 'weapon', 2)); return save;
}
async function setup(browser, seed, dropRolls) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key: D.SAVE_KEY, seed });
  if (dropRolls) await page.route('**/js/forest-simulation.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + `\nForestSimulation.update=run=>{if(run.status!=='running')return [];let rolls=${JSON.stringify(dropRolls)};run.random=()=>rolls.length?rolls.shift():.5;run.status='victory';run.gold=480;run.kills=1;run.elapsed=1000;return [{type:'loot',enemy:'sand-behemoth',gold:480,x:600,y:400,timeMs:0},{type:'finished',victory:true}];};` });
  });
  await page.goto(url); await page.locator('#start-button:not([disabled])').waitFor();
  return { context, page, read: () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), D.SAVE_KEY) };
}
const field = (page, scope, name) => page.locator('[data-gem-dismantle-scope="' + scope + '"][data-gem-dismantle-field="' + name + '"]');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.FOREST_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const { context, page, read } = await setup(browser, fixture());
    await page.locator('[data-open=gems]').first().click(); await page.locator('[data-filter=gem-dismantle]').click();
    const count = async n => assert.equal(await page.locator('[data-gem-dismantle-count]').innerText(), String(n));
    await count(2); await field(page, 'bulk', 'maxLevel').selectOption('2'); await count(1);
    assert.deepEqual(await page.locator('[data-gem-bulk-inspect]').evaluateAll(nodes => nodes.map(n => Number(n.dataset.gemBulkInspect))), [3]);
    await field(page, 'bulk', 'match').selectOption('any'); await count(3);
    await field(page, 'bulk', 'match').selectOption('all'); await field(page, 'bulk', 'maxRarity').selectOption('unique'); await count(2);
    const keep = key => page.locator('[data-gem-bulk-group=excludedEffects][data-gem-bulk-exclude="' + key + '"]');
    assert.equal(await page.locator('[data-gem-bulk-group=excludedEffects]').count(),Object.keys(G.OPTIONS).length);
    const unmodified=await read();
    await keep('physical').click(); await count(1); assert.equal(await keep('physical').getAttribute('aria-pressed'),'true');
    await keep('recovery').click(); await count(0); assert.equal(await page.locator('[data-gem-bulk-dismantle]').isDisabled(),true);
    await field(page,'bulk','match').selectOption('any'); await count(0);
    await field(page,'bulk','maxLevel').selectOption('3'); await count(0);
    assert.equal(await keep('recovery').getAttribute('aria-pressed'),'true');
    assert.deepEqual(await read(),unmodified);
    await keep('physical').click(); await count(2); await keep('recovery').click(); await count(3);
    await field(page,'bulk','maxLevel').selectOption('2'); await field(page,'bulk','match').selectOption('all'); await count(2);
    await page.screenshot({ path: path.join(output, 'bulk-desktop.png') });
    const before = await read(); page.once('dialog', d => d.dismiss()); await page.locator('[data-gem-bulk-dismantle]').click(); assert.deepEqual(await read(), before);
    page.once('dialog', d => { assert.ok(d.message().includes('2 個')); d.accept(); }); await page.locator('[data-gem-bulk-dismantle]').click();
    const after = await read(); assert.deepEqual(after.gems.map(g => g.id), [1,2,4,6]); assert.equal(after.inventory['gem-shard-rare'],20); assert.equal(after.inventory['gem-shard-unique'],20);
    assert.equal(after.gems[0].locked,true); assert.deepEqual(after.progression.characters.warrior.gems.weapon,[2]); await count(0);
    await field(page,'bulk','maxLevel').selectOption(''); await count(1);
    await page.locator('[data-gem-bulk-inspect="4"]').click(); assert.ok((await page.locator('#inventory-selection').innerText()).includes('Lv.4'));
    await page.locator('[data-filter=gem-dismantle]').click(); await field(page,'bulk','maxRarity').selectOption(''); await count(0); assert.equal(await page.locator('[data-gem-bulk-dismantle]').isDisabled(),true);
    await page.locator('#close-menu').click(); await page.locator('[data-open=options]').first().click();
    assert.equal(await page.locator('[data-gem-auto-group=excludedDirections]').count(),3);
    assert.equal(await page.locator('[data-gem-auto-group=excludedDirections][data-gem-auto-exclude=weapon],[data-gem-auto-group=excludedDirections][data-gem-auto-exclude=magic]').count(),0);
    assert.equal(await page.locator('[data-gem-auto-toggle]').getAttribute('aria-pressed'),'false');
    await field(page,'auto','maxLevel').selectOption('3'); await field(page,'auto','maxRarity').selectOption('unique'); await field(page,'auto','match').selectOption('any');
    await page.locator('[data-gem-auto-group=excludedDirections][data-gem-auto-exclude=attack]').click();
    await page.locator('[data-gem-auto-group=excludedEffects][data-gem-auto-exclude=fortune]').click();
    await page.locator('[data-gem-auto-toggle]').click();
    const configured=await read(); assert.deepEqual(configured.gems,after.gems);
    assert.deepEqual(configured.autoGemDismantle,{enabled:true,maxLevel:3,maxRarity:'unique',match:'any',excludedDirections:['attack'],excludedEffects:['fortune']});
    await page.screenshot({path:path.join(output,'options-desktop.png')});
    await page.reload(); await page.locator('#start-button:not([disabled])').waitFor(); await page.locator('[data-open=options]').first().click();
    assert.equal(await field(page,'auto','maxLevel').inputValue(),'3'); assert.equal(await page.locator('[data-gem-auto-toggle]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-gem-auto-group=excludedEffects][data-gem-auto-exclude=fortune]').getAttribute('aria-pressed'),'true');
    await page.setViewportSize({width:390,height:900}); assert.ok(await page.locator('#menu-content').evaluate(el=>el.scrollWidth<=el.clientWidth+2));
    await page.screenshot({path:path.join(output,'options-mobile.png')}); await page.locator('#close-menu').click();
    await page.locator('[data-open=gems]').first().click(); await page.locator('[data-filter=gem-dismantle]').click(); await field(page,'bulk','maxRarity').selectOption('legendary');
    assert.ok(await page.locator('#menu-content').evaluate(el=>el.scrollWidth<=el.clientWidth+2)); await page.screenshot({path:path.join(output,'bulk-mobile.png')}); await context.close();
    const retained=await setup(browser,fixture());
    await retained.page.locator('[data-open=gems]').first().click(); await retained.page.locator('[data-filter=gem-dismantle]').click();
    await field(retained.page,'bulk','maxRarity').selectOption('unique');
    await retained.page.locator('[data-gem-bulk-exclude=recovery]').click();
    assert.equal(await retained.page.locator('[data-gem-dismantle-count]').innerText(),'2');
    retained.page.once('dialog',d=>d.accept()); await retained.page.locator('[data-gem-bulk-dismantle]').click();
    const retainedSave=await retained.read(); assert.deepEqual(retainedSave.gems.map(g=>g.id),[1,2,5,6]);
    assert.equal(retainedSave.inventory['gem-shard-rare'],60); assert.ok(!retainedSave.inventory['gem-shard-unique']);
    assert.deepEqual(retainedSave.autoGemDismantle,G.freshAutoDismantle()); await retained.context.close();
    const early=await setup(browser,fixture(49)); await early.page.locator('[data-open=options]').first().click(); assert.equal(await early.page.locator('[data-gem-auto-toggle]').isDisabled(),true);
    await early.page.locator('#close-menu').click(); await early.page.locator('[data-open=gems]').first().click(); await early.page.locator('[data-filter=gem-dismantle]').click();
    assert.equal(await early.page.locator('[data-gem-bulk-dismantle]').isDisabled(),true);
    assert.equal(await early.page.locator('[data-gem-bulk-exclude=physical]').isDisabled(),true); await early.context.close();
    for (const [name, rolls, excludedDirections, excludedEffects, dismantled] of [
      // Only the rare material roll precedes gem rolls: boss common/crystal drops are guaranteed.
      ['physical-auto',[.5,.01,.2,.5,.5,.5],[],[],true],
      ['physical-excluded',[.5,.01,.2,.5,.5,.5],['attack'],[],false],
      ['magic-excluded',[.5,.01,.4,.5,.5,.5],['attack'],[],false],
      ['attack-excluded',[.5,.01,0,.5,.5,.5],['attack'],[],false],
      ['secondary-excluded',[.5,.001,.99,0,.5,.5],[],['attack'],false],
    ]) {
      const seed=fixture(); seed.autoGemDismantle={...G.freshAutoDismantle(),enabled:true,maxRarity:'unique',excludedDirections,excludedEffects};
      const drop=await setup(browser,seed,rolls); await drop.page.locator('#start-button').click(); await drop.page.locator('#result-overlay:not([hidden])').waitFor(); await drop.page.locator('#result-skip').click();
      await drop.page.locator('#result-overlay.loot-complete').waitFor(); const saved=await drop.read();
      assert.equal(saved.gems.length,seed.gems.length+(dismantled?0:1),name);
      if (dismantled) { assert.equal(saved.inventory['gem-shard-rare'],60); assert.equal(await drop.page.locator('[data-loot-id=gem-shard-rare]').count(),1); assert.equal(await drop.page.locator('[data-loot-id="gem-instance-7"]').count(),0); }
      else { assert.equal(await drop.page.locator('[data-loot-id="gem-instance-7"]').count(),1); assert.ok(!saved.inventory['gem-shard-rare']); }
      await drop.page.screenshot({path:path.join(output,name+'.png')}); await drop.context.close();
    }
    assert.deepEqual(errors,[]); console.log('PASS: bulk thresholds, AND/OR, protection/equipment, cancel, exact shards, inspection, auto options/reload, unlock gate, secondary exclusions, actual auto-drop rewards and desktop/mobile layout');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
