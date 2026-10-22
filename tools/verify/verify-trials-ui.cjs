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
  const own=(seed,id)=>{for(const p of T.byId[id].requires)if(p!=='origin'&&!seed.reincarnation.owned.includes(p))own(seed,p);if(id!=='origin')seed.reincarnation.owned.push(id);};
  async function trials(page){await menu(page,'reincarnation');await page.locator('[data-reinc-tab="trials"]').click();}
  async function win(page){await page.locator('#start-button').click();await page.evaluate(()=>ForestSimulation.hit(testRun,testRun.hero,testRun.enemies[0],1e30,[],false,null,{critical:false}));await page.clock.runFor(4000);if(await page.locator('#unlock-intro').isVisible())await page.locator('#unlock-continue').click();await page.locator('#result-skip').click();await page.locator('#retry-button').click();await page.locator('#pause-button').click();}
  for(const width of (process.argv.includes('--effects-only')||process.argv.includes('--gate-only')?[]:process.argv.includes('--mobile-only')?[390]:[1440,390])){
   const seed=B.reference();seed.autoMode='off';Object.assign(seed.reincarnation,{unlocked:true,cycle:20,total:2000});for(const id of T.byId['trial-open'].requires)own(seed,id);
   assert.equal(seed.reincarnation.owned.includes('drop4'),false);
   const {page,context}=await pageFor(seed,width);await trials(page);assert.equal(await page.locator('.trial-locked').count(),1);
   await page.locator('[data-reinc-tab="tree"]').click();await page.locator('[data-reinc-node="main-free"]').click();assert.ok((await page.locator('.reincarnation-detail').innerText()).includes('取得済み'));
   await page.locator('[data-reinc-node="trial-open"]').click();assert.equal(await page.locator('.reincarnation-detail [data-reinc-jump]').count(),1);assert.equal(await page.locator('.reincarnation-detail [data-reinc-jump]').getAttribute('data-reinc-jump'),'main-free');assert.ok((await page.locator('[data-reinc-confirm]').innerText()).includes('100 PT'));await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="trial-open"]').click();await page.locator('[data-reinc-tab="trials"]').click();
   for(const id of ['strength-2','onslaught','unyielding']){await page.locator('[data-trial-node="'+id+'"]').first().click();await page.locator('[data-trial-toggle="'+id+'"]').click();}
   await page.locator('[data-trial-node="goddess-serious"]').first().click();assert.ok(await page.locator('[data-trial-toggle="goddess-serious"]').isDisabled());assert.equal(await page.locator('.trial-detail .reinc-prerequisites button').count(),2);
   const view=page.locator('.trial-tree-viewport');await view.scrollIntoViewIfNeeded();await view.evaluate(e=>{e.scrollTop=200;e.scrollLeft=100;});const box=await view.boundingBox(),before=await view.evaluate(e=>[e.scrollLeft,e.scrollTop]);const hit=await page.evaluate(({x,y})=>document.elementFromPoint(x+20,y+160)?.outerHTML.slice(0,200),box);await page.screenshot({path:path.join(output,'drag-'+width+'.png')});await page.mouse.move(box.x+20,box.y+160);await page.mouse.down();await page.mouse.move(box.x+60,box.y+210);await page.mouse.up();const after=await view.evaluate(e=>[e.scrollLeft,e.scrollTop]);assert.ok(after[1]<before[1],JSON.stringify({box,before,after,hit}));
   await page.locator('#menu-dialog').evaluate(e=>e.scrollTop=0);await view.evaluate(e=>{e.scrollTop=0;e.scrollLeft=0;});assert.equal((await view.locator('svg').boundingBox()).width,800);await page.mouse.move(3,3);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(output,'tree-'+width+'.png'),animations:'disabled'});
   if(process.argv.includes('--layout-only')){await context.close();continue;}
   const beforeSave=await saveOf(page);await page.locator('[data-trial-start]').click();assert.ok((await page.locator('.trial-review').innerText()).includes('PTなしでリセット'));await page.locator('[data-trial-cancel]').click();assert.equal((await saveOf(page)).gold,beforeSave.gold);
   await page.locator('[data-trial-start]').click();await page.locator('[data-trial-confirm="start"]').click();await page.waitForLoadState('load');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});let current=await saveOf(page);assert.equal(current.reincarnation.journey,1);assert.equal(current.reincarnation.total,2000);assert.equal(current.gold,0);assert.equal(current.progression.characters.warrior.xp.level,1);assert.equal(current.reincarnation.trials.length,3);
   await trials(page);await page.locator('[data-trial-abandon]').click();await page.locator('[data-trial-cancel]').click();assert.equal((await saveOf(page)).reincarnation.trialRun,true);await page.locator('[data-trial-abandon]').click();await page.locator('[data-trial-confirm="abandon"]').click();current=await saveOf(page);assert.equal(current.reincarnation.trialRun,false);assert.equal(current.reincarnation.total,2000);await context.close();
   const active=B.reference();active.autoMode='off';Object.assign(active.reincarnation,{unlocked:true,cycle:20,total:2000,journey:1,trialRun:true,trials:['strength-2','onslaught','unyielding']});own(active,'trial-open');
   const paid=await pageFor(active,width);await win(paid.page);current=await saveOf(paid.page);assert.equal(current.reincarnation.pendingPoints,450);assert.equal(current.reincarnation.trialCompleted.length,3);assert.deepEqual(current.reincarnation.appliedTrials,[]);
   await trials(paid.page);await paid.page.locator('[data-trial-node="goddess-serious"]').first().click();assert.equal(await paid.page.locator('[data-trial-toggle="goddess-serious"]').isEnabled(),true);assert.ok((await paid.page.locator('.trial-permanent').innerText()).includes('次の周から'));
   await paid.page.locator('[data-trial-toggle="goddess-serious"]').click();await paid.page.locator('[data-trial-start]').click();assert.ok((await paid.page.locator('.rebirth-points').innerText()).includes('450'));await paid.page.screenshot({path:path.join(output,'restart-'+width+'.png'),animations:'disabled'});await paid.page.locator('[data-trial-confirm="start"]').click();await paid.page.waitForLoadState('load');await paid.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});current=await saveOf(paid.page);assert.equal(current.reincarnation.total,2450);assert.equal(current.reincarnation.appliedTrials.length,3);assert.equal(current.reincarnation.cycle,21);assert.ok(current.reincarnation.trials.includes('goddess-serious'));await paid.context.close();
  }
  if(process.argv.includes('--effects-only')){
   const seed=B.reference();seed.autoMode='off';Object.assign(seed.reincarnation,{unlocked:true,cycle:20,total:2000,journey:1,trialRun:true,trials:['goddess-serious'],trialCompleted:['onslaught','unyielding']});own(seed,'trial-open');seed.selectedStage=1;
   const fx=await pageFor(seed,1440);await fx.page.locator('#start-button').click();await fx.page.locator('#pause-button').click();await fx.page.evaluate(()=>{for(const e of testRun.enemies){e.hp=e.maxHp=1e30;e.cooldown=1e9;}for(const a of [testRun.hero,...testRun.allies]){a.hp=a.maxHp=1e9;}});
   for(let region=1;region<=10;region++)for(const major of [false,true]){
    await fx.page.evaluate(({region,major})=>{testRun.stage={...ForestData.STAGES.find(s=>s.region===region)};testRun.random=()=>major?.9:.1;const p=TrialCombat.begin(testRun,'phantom');p.elapsed=1400;},{region,major});await fx.page.clock.runFor(40);await fx.page.locator('#game-canvas').screenshot({path:path.join(output,'phantom-'+region+'-'+Number(major)+'.png')});
   }
   for(const [i,name] of ['cross','rings','zero'].entries()){
    await fx.page.evaluate(i=>{testRun.random=()=>[.1,.5,.9][i];const p=TrialCombat.begin(testRun,'divine');p.elapsed=1800;},i);await fx.page.clock.runFor(40);await fx.page.locator('#game-canvas').screenshot({path:path.join(output,'aid-'+name+'.png')});
    await fx.page.evaluate(()=>{document.querySelector('#pause-button').click();});await fx.page.clock.runFor(800);await fx.page.locator('#pause-button').click();assert.equal(await fx.page.evaluate(()=>testRun.trialIntervention.plan?.next),1);await fx.page.locator('#game-canvas').screenshot({path:path.join(output,'aid-'+name+'-impact.png')});
   }
   await fx.context.close();
  }
  if(process.argv.includes('--gate-only'))for(const width of [1440,390]){
   const seed=B.reference();seed.autoMode='off';seed.selectedStage='dimensional-gate';
   Object.assign(seed.reincarnation,{unlocked:true,cycle:20,total:2000,journey:1,trialRun:true,trials:['gate-release'],trialCompleted:['onslaught','unyielding','gate-release'],appliedTrials:['gate-release']});own(seed,'trial-open');
   const {page,context}=await pageFor(seed,width);await trials(page);
   await page.locator('[data-trial-node="gate-release"]').first().click();
   assert.equal(await page.locator('[data-trial-toggle="gate-release"]').isEnabled(),true);
   assert.equal(await page.locator('.trial-detail .reinc-prerequisites button').count(),2);
   assert.ok((await page.locator('.trial-detail').innerText()).includes('他の素材費軽減と加算'));
   assert.ok((await page.locator('.trial-permanent').innerText()).includes('素材費 −10%'));
   if(width<700)await page.locator('.trial-detail').scrollIntoViewIfNeeded();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.mouse.move(3,3);await page.screenshot({path:path.join(output,'gate-detail-'+width+'.png'),animations:'disabled'});
   await page.locator('#close-menu').click();await page.locator('#start-button').click();await page.locator('#pause-button').click();
   await page.evaluate(()=>{for(const a of [testRun.hero,...testRun.allies])Object.assign(a,{manualOnly:true,invulnerable:true,cooldown:1e9,skill:1e9,warriorSkills:[],mageSkills:[],paladinSkills:[]});});
   await page.locator('#pause-button').click();await page.clock.runFor(1200);await page.locator('#pause-button').click();
   assert.equal(await page.evaluate(()=>testRun.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart).length),105);
   assert.ok((await page.locator('#boss-name').innerText()).includes('1 / 1'));
   await page.locator('#pause-button').click();await page.clock.runFor(900);await page.locator('#pause-button').click();
   await page.locator('#game-canvas').screenshot({path:path.join(output,'gate-mobs-'+width+'.png')});
   await page.evaluate(()=>{for(const e of testRun.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart))ForestSimulation.hit(testRun,testRun.hero,e,1e30,[],false,null,{critical:false,skipHitRoll:true});});
   await page.locator('#pause-button').click();await page.clock.runFor(6000);await page.locator('#pause-button').click();
   assert.equal(await page.evaluate(()=>testRun.wave),1);
   assert.equal(await page.evaluate(()=>testRun.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart).length),15);
   assert.ok((await page.locator('#boss-name').innerText()).includes('1 / 1'));
   await page.locator('#game-canvas').screenshot({path:path.join(output,'gate-bosses-'+width+'.png')});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await context.close();
  }
  const lab=await pageFor(D.freshSave(),1440);await lab.page.unroute('**/*');await lab.page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-system.html');const preset=process.argv.includes('--gate-only')?'gate-release':'trials';await lab.page.locator('[data-preset="'+preset+'"]:not([disabled])').waitFor();await lab.page.locator('[data-preset="'+preset+'"]').click();await lab.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});const labSave=await saveOf(lab.page);assert.equal(labSave.reincarnation.trials[0],preset==='trials'?'goddess-serious':'gate-release');if(preset==='gate-release'){
   assert.equal(labSave.selectedStage,'dimensional-gate');await lab.page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-system.html');await lab.page.locator('[data-preset="chaos-gate-release"]:not([disabled])').waitFor();await lab.page.locator('[data-preset="chaos-gate-release"]').click();await lab.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});const chaosSave=await saveOf(lab.page);assert.equal(chaosSave.selectedStage,'chaos-gate');assert.deepEqual(chaosSave.reincarnation.trials,['gate-release']);
  }await lab.context.close();
  assert.deepEqual(errors,[]);console.log(process.argv.includes('--gate-only')?'Gate release UI passed at 1440px/390px: prerequisites, additive reward, 105/15 summons and 1/1 HUD.':process.argv.includes('--effects-only')?'Trial intervention UI passed: 20 regional phantoms, three divine warnings/impacts and no rendering/resource errors.':process.argv.includes('--layout-only')?'Trial tree layout passed at 1440px/390px: tabs, links, prerequisites and drag.':'Trial tree UI passed: tabs, prices, prerequisites, drag, unpaid/paid restart, cancel, abandon, first clear, next-journey rewards, save and review preset.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main};
