'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs'),bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),R=require('../../public/js/core/reincarnation.js'),T=require('../../public/js/data/reincarnation-tree-data.js'),B=require('../balance/audit-reincarnation.cjs');
async function main(){
 const output=path.join(ROOT,'output/trials/ui');fs.mkdirSync(output,{recursive:true});
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
  const fresh=await pageFor(D.freshSave(),1440);await menu(fresh.page,'stages');assert.equal(await fresh.page.locator('.trials-panel').count(),0);await fresh.context.close();
  for(const width of (process.argv.includes('--mobile-only')?[390]:[1440,390])){
   const seed=B.reference();seed.autoMode='off';Object.assign(seed.reincarnation,{unlocked:true,cycle:20,total:2000});
   const own=id=>{for(const p of T.byId[id].requires)if(p!=='origin'&&!seed.reincarnation.owned.includes(p))own(p);if(id!=='origin')seed.reincarnation.owned.push(id);};
   for(const id of T.byId['trial-open'].requires)own(id);
   const {page,context}=await pageFor(seed,width);await menu(page,'reincarnation');
   await page.locator('[data-reinc-node="trial-open"]').click();assert.equal(await page.locator('.coming-soon').count(),0);
   await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="trial-open"]').click();assert.equal(await page.locator('.trials-panel').count(),1);
   await page.locator('[data-trial="strength"]').selectOption('strength-10');for(const id of ['onslaught','unyielding','goddess-serious'])await page.locator('[data-trial="'+id+'"]').check();
   assert.equal(await page.locator('.trials-heading strong').innerText(),'報酬 ×225');
   await page.locator('.trials-panel img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
   await page.screenshot({path:path.join(output,'layout-'+width+'.png'),animations:'disabled'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,wide:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.reincarnation-map')).map(e=>[e.tagName,e.id,e.className,e.getBoundingClientRect().left,e.getBoundingClientRect().right,getComputedStyle(e).position]).slice(0,20)}))));
   await page.locator('#menu-content').evaluate(e=>e.scrollTop=0);await page.mouse.move(5,5);await page.screenshot({path:path.join(output,'selection-'+width+'.png'),animations:'disabled'});
   await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.equal((await saveOf(page)).reincarnation.trials.length,4);
   await menu(page,'stages');assert.equal(await page.locator('.trials-heading strong').innerText(),'報酬 ×225');
   await page.locator('[data-stage-region="1"]').click();assert.equal(await page.locator('.trials-heading strong').innerText(),'報酬 ×22.5');
   await page.locator('[data-special-stages]').click();await page.locator('.stage-map [data-stage="reincarnation-goddess"]').click();
   await page.locator('[data-enter="reincarnation-goddess"]').click();
   assert.equal(await page.evaluate(()=>testRun.trials.reward),225);
   assert.equal(await page.evaluate(()=>testRun.enemies[0].maxHp),6e11);
   await menu(page,'stages');await page.locator('[data-trial="strength"]').selectOption('');for(const id of ['onslaught','unyielding','goddess-serious'])await page.locator('[data-trial="'+id+'"]').uncheck();
   assert.equal(await page.evaluate(()=>testRun.trials.reward),225,'active battle keeps original trials');
   await page.locator('#close-menu').click();await page.evaluate(()=>{ForestSimulation.hit(testRun,testRun.hero,testRun.enemies[0],1e30,[],false,null,{critical:false});});await page.clock.runFor(4000);
   assert.equal((await saveOf(page)).reincarnation.pendingPoints,22500);
   await page.locator('#result-skip').click();await page.locator('#retry-button').click();await page.locator('#pause-button').click();
   await menu(page,'reincarnation');await page.locator('[data-rebirth-review]').click();assert.ok((await page.locator('.rebirth-points').innerText()).includes('22,500'));
   await page.screenshot({path:path.join(output,'payout-'+width+'.png'),animations:'disabled'});
   await page.locator('[data-rebirth-confirm]').click();await page.waitForLoadState('load');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
   const next=await saveOf(page);assert.equal(next.reincarnation.total,24500);assert.equal(next.reincarnation.pendingPoints,0);assert.equal(next.reincarnation.cycle,21);
   await context.close();
  }
  const lab=await pageFor(D.freshSave(),1440);await lab.page.unroute('**/*');await lab.page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-system.html');await lab.page.locator('[data-preset="trials"]:not([disabled])').waitFor();await lab.page.locator('[data-preset="trials"]').click();await lab.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await menu(lab.page,'stages');assert.equal(await lab.page.locator('.trials-panel').count(),1);await lab.context.close();
  assert.deepEqual(errors,[]);console.log('Trials UI passed: secrecy, door purchase, four families, stage-specific rewards, save/reload, frozen battle settings, 22,500 PT settlement/rebirth, review preset, 1440px/390px and no resource/runtime errors.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main};
