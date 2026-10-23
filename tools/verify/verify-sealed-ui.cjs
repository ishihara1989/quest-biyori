'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs'),bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),{chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),Runtime=require('../balance/audit-sealed-runtime.cjs');
async function main(){
 const output=path.join(ROOT,'output/sealed-runtime/ui');fs.mkdirSync(output,{recursive:true});const errors=[];
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{for(const width of [1440,390])for(const seal of ['seal-gems','seal-skills','seal-gear']){
  const seed=Runtime.fixture(seal,'final',seal==='seal-gems'?[]:seal==='seal-skills'?['seal-gems']:['seal-gems','seal-skills']);seed.selectedStage=1;seed.speed=1;seed.autoMode='off';if(seal==='seal-gems')P.addGem(seed,P.Gem.generate({rarity:'rare',family:'attack',level:10,random:()=>.5}));
  if(seal!=='seal-skills'){seed.reincarnation.trialCompleted.push(seal);seed.reincarnation.appliedTrials.push(seal);}if(seal==='seal-gear')seed.gold=1e6;
  const context=await browser.newContext({viewport:{width,height:width<700?844:1050}}),page=await context.newPage();
  await page.route('**/*',route=>{const pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname==='/favicon.ico')return route.fulfill({status:204,body:''});const file=path.resolve(PUBLIC,pathname==='/'?'game.html':'.'+pathname);if(!inside(PUBLIC,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml'};return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
  page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});await page.clock.install();await page.addInitScript(({key,seed})=>{if(!sessionStorage.getItem('sealed-seeded')){localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem('sealed-seeded','1');}let simulation;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>simulation,set(v){simulation=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});},{key:D.SAVE_KEY,seed});
  const loaded=async()=>{await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));};await page.goto('http://127.0.0.1:'+server.address().port+'/');await loaded();
  if(seal==='seal-gems')assert.ok(await page.evaluate(()=>testRun.hero.gemEcho>0&&testRun.hero.gemSiphon>0),'intrinsic gem abilities apply despite the seal and empty sockets');
  if(seal==='seal-gear')assert.ok(await page.evaluate(()=>{const s=ForestData.readSave(localStorage.getItem(ForestData.SAVE_KEY));s.reincarnation.appliedTrials=s.reincarnation.appliedTrials.filter(id=>id!=='seal-gear');const base=ForestProgression.stats(s,'warrior');return Math.abs(testRun.hero.maxHp/base.maxHp-2)<1e-8&&Math.abs(testRun.hero.damage/base.damage-2)<1e-8;}),'1M wallet doubles battle HP and damage');
  await page.locator('[data-open="reincarnation"]').first().click();await page.locator('[data-reinc-tab="trials"]').click();await page.locator(`[data-trial-node="${seal}"]`).first().click();assert.ok(await page.locator(`[data-trial-toggle="${seal}"]`).isEnabled());const detail=await page.locator('.trial-detail').innerText();assert.ok(detail.includes(seal==='seal-gems'?'無彩':seal==='seal-skills'?'半知':'幹道'));if(seal==='seal-gems')assert.ok(detail.includes('ジェム未装着でも')&&detail.includes('初期所持'));if(seal==='seal-gear')assert.ok(detail.includes('1M ×2')&&detail.includes('1G ×3'));await page.locator('.trial-detail').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,seal+'-'+width+'.png')});await page.locator('#close-menu').click();
  if(seal==='seal-gems')assert.ok(detail.includes('ジェムドロップなし'));
  if(seal==='seal-gear')assert.ok(detail.includes('素材ドロップなし（星界の残滓を除く）'));
  if(seal==='seal-gems'){
   await page.locator('[data-open="gems"]').first().click();await page.locator('[data-gem-instance]').first().click();assert.ok(await page.locator('[data-toggle-inventory-gem]').isDisabled());assert.ok((await page.locator('[data-toggle-inventory-gem]').innerText()).includes('封印中'));
  }else{
   await page.locator(`[data-open="${seal==='seal-skills'?'skills':'forge'}"]`).first().click();const target=seal==='seal-skills'?P.SKILLS.warrior.find(n=>n.kind==='active'&&n.unlockLevel>50).id:await page.locator('[data-growth-node*="branch"]').first().getAttribute('data-growth-node');await page.locator(`[data-growth-node="${target}"]`).first().click();assert.ok(await page.locator('.node-buy[data-buy-node]').isDisabled());assert.ok((await page.locator('.node-buy[data-buy-node]').innerText()).includes('封印中'));
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(output,seal+'-locked-'+width+'.png')});
  if(seal==='seal-gear'){
   await page.locator('#close-menu').click();await page.locator('#start-button').click();await page.locator('#pause-button').click();const startingHp=await page.evaluate(()=>testRun.hero.maxHp);
   await page.locator('[data-open="inventory"]').first().click();await page.locator('[data-filter="conversion"]').click();await page.locator('[data-conversion-region="1"]').click();await page.locator('[data-convert="1-gold-common-jelly"][data-convert-times="max"]').click();
   assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).gold,D.SAVE_KEY),0);assert.equal(await page.evaluate(()=>testRun.hero.maxHp),startingHp,'spending keeps the running battle fixed');
   await page.locator('#close-menu').click();await page.locator('[data-open="stages"]').first().click();await page.locator('[data-enter="1"]').click();assert.ok(Math.abs(await page.evaluate(()=>testRun.hero.maxHp)/startingHp-.5)<1e-8,'next battle drops to 1x after spending all gold');await page.locator('#pause-button').click();
  }
  if(width===1440&&seal==='seal-gear'){
   await page.unroute('**/*');await page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-system.html');await page.locator('[data-preset="solo"]:not([disabled])').waitFor();await page.locator('[data-preset="solo"]').click();await loaded();assert.deepEqual(await page.evaluate(()=>[testRun.hero.type,testRun.allies.length,testRun.stage.goddessDuo,testRun.hero.epicMikoArmor]),['miko',0,true,0]);assert.equal(await page.evaluate(()=>ForestProgression.totalPoints(JSON.parse(localStorage.getItem(ForestData.SAVE_KEY)),'miko')),260);
  }await context.close();
 }
 assert.deepEqual(errors,[]);console.log('Three seal restrictions and detail UI passed at 1440px / 390px; solo III review preset opens a genuine one-miko duo battle without future equipment or epics.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main};
