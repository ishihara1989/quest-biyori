'use strict';
// Every context uses its own save; the player's browser profile is never opened.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),B=require('../balance/audit-reincarnation.cjs');
async function main(){
 const output=path.resolve(__dirname,'../../output/status-indicators-ui');fs.mkdirSync(output,{recursive:true});
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
 async function setup(seed){
  const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.addInitScript(({seed,key})=>{
   if(!sessionStorage.getItem('indicators-seeded')){localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem('indicators-seeded','1');}
   let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});
  },{seed,key:D.SAVE_KEY});
  await page.clock.install();await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
  return {page,context};
 }
 const card=(page,job)=>page.locator('[data-party-character='+job+']');
 const mark=page=>page.locator('.rebirth-ready-mark');
 async function shot(page,name){await page.screenshot({path:path.join(output,name+'.png'),fullPage:true,animations:'disabled'});}
 try{
  const fresh=await setup(D.freshSave());assert.equal(await fresh.page.locator('#reincarnation-nav').isVisible(),false);assert.equal(await mark(fresh.page).isVisible(),false);assert.equal(await fresh.page.locator('[data-epic-slot]').count(),0);await fresh.context.close();
  const seed=B.reference();seed.selectedStage=1;seed.autoMode='off';seed.reincarnation.unlocked=true;
  const slots={warrior:['weapon'],mage:['armor'],paladin:['weapon','armor'],ninja:[],shaman:['weapon'],miko:['armor']};
  for(const [job,keep] of Object.entries(slots))for(const slot of ['weapon','armor'])if(!keep.includes(slot))seed.progression.characters[job].gems[slot]=[];
  const mixed=await setup(seed),page=mixed.page;
  assert.equal(await page.locator('#reincarnation-nav').isVisible(),true);assert.equal(await mark(page).isVisible(),false);
  for(const [job,expected] of Object.entries(slots)){
   assert.deepEqual(await card(page,job).locator('[data-epic-slot]').evaluateAll(es=>es.map(e=>e.dataset.epicSlot)),expected);
   if(expected.length)assert.match(await card(page,job).getAttribute('aria-label'),/エピック装備/);
  }
  await card(page,'warrior').locator('[data-epic-slot=weapon]').hover();assert.match(await page.locator('#tooltip').innerText(),/エピック · 武器 · 天壊万刃/);await shot(page,'mixed-desktop');
  // Changing saved equipment during a paused battle must update the roster too.
  await page.locator('#start-button').click();await page.clock.runFor(100);await page.locator('#pause-button').click();await card(page,'warrior').click();
  await page.locator('.hero-card [data-open=gems]').click();
  const uid=seed.progression.characters.warrior.gems.weapon[0];
  await page.locator('[data-gem-instance="'+uid+'"]').click({button:'right'});await page.locator('#close-menu').click();
  assert.equal(await card(page,'warrior').locator('[data-epic-slot]').count(),0);
  await page.locator('.hero-card [data-open=gems]').click();await page.locator('[data-gem-instance="'+uid+'"]').click({button:'right'});await page.locator('#close-menu').click();
  assert.equal(await card(page,'warrior').locator('[data-epic-slot=weapon]').isVisible(),true);
  await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
  assert.equal(await card(page,'warrior').locator('[data-epic-slot=weapon]').isVisible(),true);
  for(const width of [1024,390]){
   await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.ok(await page.locator('.party-status-card').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)));
   await shot(page,'mixed-'+width);
  }
  await mixed.context.close();
  const boss=B.reference();boss.autoMode='off';boss.reincarnation.unlocked=true;
  const win=await setup(boss),p=win.page;assert.equal(await mark(p).isVisible(),false);
  await p.locator('#start-button').click();await p.evaluate(()=>{testRun.enemies[0].hp=1;});await p.clock.runFor(6000);
  assert.equal(await mark(p).isVisible(),true);assert.match(await p.locator('#reincarnation-nav').getAttribute('aria-label'),/転生可能/);
  if(await p.locator('#unlock-intro').isVisible())await p.clock.runFor(15000);
  await p.reload();await p.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.equal(await mark(p).isVisible(),true);
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:1050});assert.equal(await mark(p).isVisible(),true);
   const bounds=await mark(p).boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width);
   await shot(p,'ready-'+width);
  }
  await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await mark(p).evaluate(e=>getComputedStyle(e).animationName),'none');
  await p.locator('#reincarnation-nav').click();await p.locator('[data-rebirth-review]').click();await p.locator('[data-rebirth-confirm]').click();
  await p.waitForLoadState('load');await p.locator('#start-button:not([disabled])').waitFor({timeout:90000});
  assert.equal(await p.locator('#reincarnation-nav').isVisible(),true);assert.equal(await mark(p).isVisible(),false);assert.equal(await p.locator('[data-epic-slot]').count(),0);
  await win.context.close();assert.deepEqual(errors,[]);
  console.log('PASS: fresh/locked, unlocked/unready, victory/readiness/reload/rebirth reset, weapon/armor/both/none across six characters, equip/unequip during battle, tooltip, 1440/1024/390px, reduced motion, no runtime/resource errors');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
