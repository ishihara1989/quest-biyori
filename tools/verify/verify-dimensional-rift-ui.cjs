'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PUBLIC,inside}=require('../lib/project-paths.cjs');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),A=require('../balance/audit-balance.cjs'),Rift=require('../../public/js/data/special-stages.js');
const output=path.resolve(__dirname,'../../output/dimensional-rift');fs.mkdirSync(output,{recursive:true});
async function main(){
  const server=process.env.FOREST_TEST_URL?null:require('../../server.cjs').createServer();
  if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=process.env.FOREST_TEST_URL||'http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
  async function pageFor(seed,viewport={width:1440,height:1050},reducedMotion='no-preference'){
    const context=await browser.newContext({viewport,reducedMotion}),page=await context.newPage();
    if(process.argv.includes('--offline-browser'))await page.route('**/*',route=>{const pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname==='/favicon.ico')return route.fulfill({status:204,body:''});const file=path.resolve(PUBLIC,pathname==='/'?'game.html':'.'+pathname);if(!inside(PUBLIC,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml'};return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
    else await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.clock.install();await page.addInitScript(({key,seed})=>{localStorage.setItem(key,JSON.stringify(seed));let s;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>s,set(v){s=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});},{key:D.SAVE_KEY,seed});
    await page.goto(url);await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));assert.equal(await page.locator('#start-button').innerText(),'開始');return {context,page};
  }
  async function waitForBatch(page,tier,batch) {
    for(let elapsed=0;elapsed<15000;elapsed+=500){
      const ready=await page.evaluate(({tier,batch})=>{const gate=testRun.enemies.find(e=>e.dimensionalGate&&e.hp>0);return gate?.gateTier===tier&&gate.gateBatch===batch&&gate.gatePhase==='waiting';},{tier,batch});
      if(ready){assert.equal(await page.evaluate(()=>testRun.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart).length),tier===0?35:5);return;}
      await page.clock.runFor(500);
    }
    assert.fail('gate tier '+tier+' batch '+batch+' did not finish summoning: '+JSON.stringify(await page.evaluate(()=>({wave:testRun.wave,status:testRun.status,gate:testRun.enemies.find(e=>e.dimensionalGate)}))));
  }
  const clearBatch=page=>page.evaluate(()=>{for(const e of testRun.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart))ForestSimulation.hit(testRun,testRun.hero,e,1e12,[],false,null,{critical:false,skipHitRoll:true});});
  async function image(page,file){await page.screenshot({path:path.join(output,file+'.png'),animations:'disabled'});}
  try {
    const locked=A.referenceBuild(49,49).save;locked.selectedStage=49;locked.autoMode='off';
    const lock=await pageFor(locked);await lock.page.locator('[data-open=stages]').first().click();assert.equal(await lock.page.locator('[data-special-stages]').count(),0);assert.equal(await lock.page.locator('[data-stage="dimensional-gate"], [data-enter="dimensional-gate"]').count(),0);await image(lock.page,'locked');await lock.context.close();
    const seed=A.referenceBuild(50,50).save;seed.selectedStage=Rift.ID;seed.autoMode='off';seed.speed=1;seed.encounteredEnemies=[...Rift.GATES];
    const live=await pageFor(seed),page=live.page;
    assert.equal(await page.locator('#stage-number').innerText(),'SPECIAL');assert.ok((await page.locator('h1').innerText()).includes('次元の裂け目'));assert.deepEqual(await page.locator('#route-nodes .route-node').evaluateAll(nodes=>nodes.map(n=>n.dataset.stage)),[Rift.ID]);
    await page.locator('[data-open=stages]').first().click();assert.equal(await page.locator('[data-stage-region]').count(),6);assert.equal(await page.locator('.region-tabs button').last().innerText(),'特殊');assert.equal(await page.locator('.special-wave-preview strong').allTextContents().then(a=>a.join('/')),Rift.NAMES.join('/'));assert.deepEqual(await page.locator('.special-wave-preview small').allTextContents(),['35 × 3','5 × 3','5 × 1']);assert.ok((await page.locator('.special-wave-preview > div').first().getAttribute('data-tip')).includes('雑魚35体 × 3回'));assert.equal(await page.locator('[data-enter="dimensional-gate"]').isEnabled(),true);await image(page,'stage-select');
    await page.locator('[data-stage-region="6"]').click();assert.equal(await page.locator('.stage-map .route-node').count(),1);await page.locator('[data-special-stages]').click();await page.locator('[data-enter="dimensional-gate"]').click();
    await page.evaluate(()=>{for(const a of [testRun.hero,...testRun.allies])Object.assign(a,{manualOnly:true,hp:1e12,maxHp:1e12,invulnerable:true,damage:0,cooldown:1e9,skill:1e9,warriorSkills:[],mageSkills:[],paladinSkills:[],warriorCast:null,mageCast:null,paladinCast:null});});
    await page.clock.runFor(700);await image(page,'gate-opening');
    for(let tier=0;tier<3;tier++){
      for(let batch=1;batch<=(tier===2?1:3);batch++){
        await waitForBatch(page,tier,batch);
        if(batch===1){
          await image(page,['summon-mobs','summon-bosses','summon-major-bosses'][tier]);
          if(tier===0){await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>testRun.enemies[0].gateBatch),1);await image(page,'gate-closed');}
        }
        await clearBatch(page);
      }
      if(tier===0){await page.clock.runFor(200);assert.equal(await page.evaluate(()=>testRun.enemies[0].gatePhase),'shattering');await image(page,'gate-cracks');await page.clock.runFor(450);await image(page,'gate-shattering');}
    }
    await page.clock.runFor(9000);assert.equal(await page.evaluate(()=>testRun.status),'victory');assert.equal(await page.evaluate(()=>testRun.kills),128);assert.equal(await page.locator('#next-button').isHidden(),true);assert.equal(await page.locator('#result-title').innerText(),'勝利');assert.ok(!(await page.locator('#result-stage').innerText()).includes('5 — 10'));await image(page,'special-clear');
    const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);assert.equal(saved.selectedStage,Rift.ID);assert.ok(saved.cleared.includes(Rift.ID));assert.equal(saved.inventory.potion,seed.inventory.potion);
    await page.locator('#retry-button').click();await page.locator('[data-open=character]').first().click();assert.ok(!(await page.locator('.growth-profile').innerText()).includes('NaN'));await page.locator('[data-growth-tab=forge]').click();assert.equal(await page.locator('.growth-node[data-kind=weapon]').count(),100);await image(page,'special-forge');await page.locator('#close-menu').click();
    assert.equal(await page.locator('img').evaluateAll(v=>v.filter(i=>i.complete&&!i.naturalWidth).length),0);await live.context.close();
    const unlockSeed=A.referenceBuild(50,50).save;unlockSeed.cleared=unlockSeed.cleared.filter(id=>id!==50);unlockSeed.selectedStage=50;unlockSeed.autoMode='off';
    const unlock=await pageFor(unlockSeed);await unlock.page.locator('#start-button').click();await unlock.page.evaluate(()=>{testRun.wave=testRun.stage.waves.length-1;testRun.enemies.forEach(e=>e.hp=0);});await unlock.page.clock.runFor(1200);assert.equal(await unlock.page.locator('#unlock-intro.rift-unlocked').isVisible(),true);assert.equal(await unlock.page.locator('#unlock-title').innerText(),'次元の裂け目');assert.equal(await unlock.page.locator('[data-unlock-id="dimensional-gate"]').count(),1);await image(unlock.page,'rift-unlocked');await unlock.context.close();
    const mobile=await pageFor(seed,{width:390,height:844},'reduce');await mobile.page.locator('[data-open=stages]').first().click();await image(mobile.page,'mobile-stage-select');assert.ok(await mobile.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await mobile.page.locator('#menu-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await mobile.page.locator('[data-enter="dimensional-gate"]').click();await mobile.page.clock.runFor(3000);await image(mobile.page,'mobile-reduced-motion');await mobile.context.close();
    assert.deepEqual(errors,[]);console.log('Dimensional rift UI verified: lock/unlock, named special selection, all summon tiers, gate opening/closing/cracking/shattering, clear/retry, save, forge, mobile and reduced motion.');
  } finally { await browser.close(); if(server)await new Promise(r=>server.close(r)); }
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={main};
