'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs'),bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),R=require('../../public/js/core/reincarnation.js'),T=require('../../public/js/data/reincarnation-tree-data.js'),B=require('../balance/audit-reincarnation.cjs');
async function main(){
 const output=path.join(ROOT,'output/trials/duo-ui');fs.mkdirSync(output,{recursive:true});
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
 async function pageFor(seed,width){
  const context=await browser.newContext({viewport:{width,height:width<700?844:1050}}),page=await context.newPage();
  await page.route('**/*',route=>{
   const pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname==='/favicon.ico')return route.fulfill({status:204,body:''});
   const file=path.resolve(PUBLIC,pathname==='/'?'game.html':'.'+pathname);
   if(!inside(PUBLIC,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});
   const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml'};
   return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.clock.install();await page.addInitScript(({key,seed})=>{
   if(!sessionStorage.getItem('trials-seeded')){localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem('trials-seeded','1');}
   let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});
  },{key:D.SAVE_KEY,seed});
  await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
  await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));return {page,context};
 }
 async function menu(page,name){if(await page.locator('#menu-dialog').isVisible())await page.locator('#close-menu').click();await page.locator('[data-open="'+name+'"]').first().click();}
 const saveOf=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
 try{
  for(const width of [1440,390]){
   const seed=B.reference();seed.autoMode='off';seed.selectedStage='extradimensional-goddess';Object.assign(seed.reincarnation,{unlocked:true,cycle:20,total:2000,journey:1,trialRun:true,trials:['goddess-serious'],trialCompleted:['onslaught','unyielding']});
   const own=id=>{for(const p of T.byId[id].requires)if(p!=='origin'&&!seed.reincarnation.owned.includes(p))own(p);if(id!=='origin')seed.reincarnation.owned.push(id);};own('trial-open');
   const {page,context}=await pageFor(seed,width);await menu(page,'stages');
   assert.ok((await page.locator('.stage-detail h3').innerText()).includes('異次元の女神＋転生の女神'));assert.equal(await page.locator('.goddess-duo-art img').count(),2);assert.equal(await page.locator('.stage-map [data-stage="reincarnation-goddess"]').count(),0);await page.mouse.move(2,2);await page.screenshot({path:path.join(output,'selection-'+width+'.png'),animations:'disabled'});
   await page.locator('[data-enter="extradimensional-goddess"]').click();await page.clock.runFor(100);assert.equal(await page.evaluate(()=>testRun.enemies.length),2);assert.equal(await page.evaluate(()=>testRun.enemies[0].goddessPhase),2);assert.ok((await page.locator('#boss-name').innerText()).includes('転生の女神'));assert.ok((await page.locator('#boss-name').innerText()).includes('異次元の女神 II'));await page.screenshot({path:path.join(output,'battle-'+width+'.png'),animations:'disabled'});
   await page.evaluate(()=>ForestSimulation.hit(testRun,testRun.hero,testRun.enemies[1],1e30,[],false,null,{critical:false}));await page.clock.runFor(2800);assert.equal(await page.evaluate(()=>testRun.status),'running');assert.equal((await saveOf(page)).reincarnation.pendingPoints,0);await menu(page,'reincarnation');assert.ok(await page.locator('[data-rebirth-review]').isDisabled());await page.locator('#close-menu').click();
   await page.evaluate(()=>ForestSimulation.hit(testRun,testRun.hero,testRun.enemies[0],1e30,[],false,null,{critical:false}));await page.clock.runFor(4000);if(await page.locator('#unlock-intro').isVisible())await page.locator('#unlock-continue').click();assert.equal((await saveOf(page)).reincarnation.pendingPoints,1000);assert.equal((await saveOf(page)).reincarnation.duoDefeatedJourney,1);await page.locator('#result-skip').click();await page.locator('#retry-button').click();await page.locator('#pause-button').click();
   await menu(page,'reincarnation');assert.ok(await page.locator('[data-rebirth-review]').isEnabled());await page.locator('[data-rebirth-review]').click();assert.ok((await page.locator('.rebirth-points').innerText()).includes('1,000'));await page.screenshot({path:path.join(output,'rebirth-'+width+'.png'),animations:'disabled'});await page.locator('[data-rebirth-confirm]').click();await page.waitForLoadState('load');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});const next=await saveOf(page);assert.equal(next.reincarnation.total,3000);assert.equal(next.reincarnation.cycle,21);assert.equal(next.reincarnation.duoDefeatedJourney,null);assert.ok(next.reincarnation.appliedTrials.includes('goddess-serious'));await context.close();
  }
  assert.deepEqual(errors,[]);console.log('Goddess duo UI passed at 1440px/390px: replacement stage, two portraits/bodies, phase-II HUD, no rebirth after one kill, combined clear, first reward, save and rebirth.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main};
