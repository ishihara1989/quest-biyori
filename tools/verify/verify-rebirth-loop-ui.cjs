'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),R=require('../../public/js/core/reincarnation.js'),P=require('../../public/js/core/forest-progression.js');
const Tree=require('../../public/js/data/reincarnation-tree-data.js');
function own(s,id){for(const p of Tree.byId[id].requires)if(p!=='origin'&&!s.reincarnation.owned.includes(p))own(s,p);if(!s.reincarnation.owned.includes(id))s.reincarnation.owned.push(id);}
function seed(){const s=D.freshSave();Object.assign(s.reincarnation,{discovered:true,unlocked:true,cycle:1000,total:100000});s.autoMode='off';return s;}
async function main(){
  const output=path.join(ROOT,'output/rebirth-loop/ui');fs.mkdirSync(output,{recursive:true});
  const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
  async function pageFor(seed,viewport={width:1440,height:1050},reducedMotion='no-preference'){
    const context=await browser.newContext({viewport,reducedMotion}),page=await context.newPage();
    await page.route('**/*',route=>{const pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname==='/favicon.ico')return route.fulfill({status:204,body:''});const file=path.resolve(PUBLIC,pathname==='/'?'game.html':'.'+pathname);if(!inside(PUBLIC,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml'};return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
    page.on('pageerror',e=>{errors.push(e.stack);console.error(e.stack);});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.clock.install();await page.addInitScript(({key,seed})=>{if(!sessionStorage.getItem('loop-seeded')){localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem('loop-seeded','1');}let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});},{key:D.SAVE_KEY,seed});
    await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.equal(await page.locator('#start-button span').innerText(),'開始','runtime assets must load');await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));return {page,context};
  }
  const saveOf=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
  async function menu(page,name){if(await page.locator('#menu-dialog').isVisible())await page.locator('#close-menu').click();await page.locator('[data-open="'+name+'"]').first().click();}
  async function win(page){await page.locator('#start-button').click();await page.evaluate(()=>{testRun.hero.hp=testRun.hero.maxHp=1e12;for(const e of testRun.enemies)ForestSimulation.hit(testRun,testRun.hero,e,1e30,[],false,null,{critical:false});});await page.clock.runFor(4000);}
  try{
    if(!process.argv.includes('--auto-only')){
    const fresh=await pageFor(D.freshSave());await menu(fresh.page,'options');assert.equal(await fresh.page.locator('[data-gate-target]').count(),0);assert.equal(await fresh.page.locator('[data-reinc-auto="rebirth"]').count(),0);await fresh.context.close();
    for(const width of [1440,390]){
      const s=seed(),{page,context}=await pageFor(s,{width,height:width===390?844:1050});await menu(page,'options');
      assert.equal(await page.locator('[data-gate-target]').count(),2);assert.equal(await page.locator('[data-reinc-auto="rebirth"]').count(),0);
      await page.locator('[data-gate-target="dimensional-gate"]').selectOption('sub');await page.locator('[data-gate-target="chaos-gate"]').selectOption('all');
      assert.deepEqual((await saveOf(page)).reincarnation.automation.gates,{'dimensional-gate':'sub','chaos-gate':'all'});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(output,'settings-'+width+'.png'),animations:'disabled'});
      await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await menu(page,'options');assert.equal(await page.locator('[data-gate-target="chaos-gate"]').inputValue(),'all');
      await context.close();
    }
    const door=seed();own(door,'main-free');const purchase=await pageFor(door);await menu(purchase.page,'reincarnation');
    await purchase.page.locator('[data-reinc-node="trial-open"]').click();await purchase.page.locator('[data-reinc-confirm]').click();await purchase.page.locator('[data-reinc-buy="trial-open"]').click();
    assert.ok(await purchase.page.locator('.option-unlock-dialog[open]').isVisible());assert.equal(await purchase.page.locator('[data-unlock-id="auto-rebirth"]').count(),1);await purchase.page.screenshot({path:path.join(output,'door-unlock.png'),animations:'disabled'});
    await purchase.page.locator('.option-unlock-dialog button').click();await menu(purchase.page,'options');await purchase.page.locator('[data-reinc-auto="rebirth"]').check();assert.equal((await saveOf(purchase.page)).reincarnation.automation.rebirth,true);await purchase.context.close();
    for(const reduced of ['no-preference','reduce']){
      const s=D.freshSave();Object.assign(s.reincarnation,{discovered:true,unlocked:true,defeatedCycle:0});s.autoMode='off';
      const first=await pageFor(s,{width:390,height:844},reduced);await menu(first.page,'reincarnation');await first.page.locator('[data-rebirth-review]').click();await first.page.locator('[data-rebirth-confirm]').click();
      await first.page.waitForLoadState('load');await first.page.locator('.option-unlock-dialog[open]').waitFor({timeout:90000});
      assert.equal((await saveOf(first.page)).reincarnation.cycle,1);assert.equal(await first.page.locator('.option-unlock-dialog .unlock-card').count(),2);await first.page.screenshot({path:path.join(output,'first-rebirth-'+reduced+'.png'),animations:'disabled'});
      await first.page.locator('.option-unlock-dialog button').click();await first.page.reload();await first.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.equal(await first.page.locator('.option-unlock-dialog[open]').count(),0);await first.context.close();
    }
    }
    for(const serious of [false,true]){
      const s=seed();own(s,'trial-open');s.cleared=D.STAGES.map(s=>s.id).concat('dimensional-gate','chaos-gate','extradimensional-goddess');
      Object.assign(s.reincarnation,{trialRun:true,trials:serious?['goddess-serious']:['onslaught'],trialCompleted:serious?['onslaught','unyielding']:[]});
      s.selectedStage=serious?'extradimensional-goddess':'reincarnation-goddess';s.autoMode='advance';s.reincarnation.automation.rebirth=true;s.reincarnation.resultOptions={skip:true,delay:5};
      const {page,context}=await pageFor(s);await win(page);assert.equal((await saveOf(page)).reincarnation.cycle,1000);
      await page.clock.runFor(12000);await page.waitForFunction(({key})=>JSON.parse(localStorage.getItem(key)).reincarnation.cycle===1001,{key:D.SAVE_KEY},{timeout:90000});
      await page.locator('#start-button:not([disabled])').waitFor({state:'attached',timeout:90000});const next=await saveOf(page);
      assert.deepEqual(next.reincarnation.trials,s.reincarnation.trials);assert.equal(next.selectedStage,1);assert.ok(next.reincarnation.total>s.reincarnation.total);assert.equal(next.reincarnation.resumeAfterRebirth,false);
      assert.equal(await page.locator('#start-overlay').isHidden(),true);assert.equal(await page.evaluate(()=>testRun.stage.id),1);await context.close();
    }
    assert.deepEqual(errors,[]);console.log('Rebirth loop UI passed: 1440/390px, locked/unlocked controls, save/reload, door and first-rebirth notices, reduced motion, normal/duo auto rebirth, PT and trial retention, forest battle resume; no runtime/resource errors.');
  }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
