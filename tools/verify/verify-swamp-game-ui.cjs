'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js');
const output=path.resolve(__dirname,'../../output/swamp-game');fs.mkdirSync(output,{recursive:true});
const url=process.env.FOREST_TEST_URL||'http://127.0.0.1:4191/';
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  const seed=D.freshSave();seed.cleared=D.STAGES.filter(s=>s.id<20).map(s=>s.id);seed.selectedStage=20;seed.gold=100000;seed.autoMode='off';
  D.ITEMS.filter(i=>i.type!=='gem').forEach(i=>{seed.inventory[i.id]=1000;});
  for(const id of Object.keys(P.CHARACTERS)){
    seed.progression.characters[id].xp=P.experience(20,.25);
    for(const slot of ['weapon','armor'])for(const n of P.allGearTrees(id,slot).filter(n=>n.main))P.purchase(seed,id,slot,n.id);
    for(const n of P.SKILLS[id].filter(n=>['active','normal'].includes(n.kind)).sort((a,b)=>b.unlockLevel-a.unlockLevel))while(P.purchase(seed,id,'skills',n.id)){}
  }
  const open=menu=>page.locator('[data-open='+menu+']').first().click(),close=()=>page.locator('#close-menu').click();
  const shot=name=>page.screenshot({path:path.join(output,name+'.png')});
  const save=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
  async function forceWin(){for(let i=0;i<3;i++){await page.evaluate(()=>window.testRun.enemies.forEach(e=>{e.hp=0;}));await page.clock.runFor(1800);}assert.equal(await page.evaluate(()=>testRun.status),'victory');}
  try{
    await page.clock.install();
    await page.addInitScript(({key,seed})=>{
      if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));
      let simulation;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>simulation,set(value){simulation=value;const create=value.createRun;value.createRun=(...args)=>{window.testRun=create(...args);return window.testRun;};}});
    },{key:D.SAVE_KEY,seed});
    await page.goto(url+'game.html');await page.locator('#start-button:not([disabled])').waitFor();await page.clock.runFor(100);
    assert.equal(await page.locator('body').getAttribute('data-region'),'2');assert.match(await page.locator('.adventure-heading h1').textContent(),/毒の沼地/);
    assert.equal(await page.locator('#route-nodes [data-stage]').count(),10);assert.equal(await page.locator('#stage-number').textContent(),'2 — 10');
    assert.equal(await page.locator('.resources>span').count(),1);assert.equal(await page.locator('.resources img').getAttribute('alt'),'ゴールド');await shot('swamp-ready');
    await open('stages');assert.equal(await page.locator('.stage-map [data-stage]').count(),10);assert.match(await page.locator('.stage-detail').textContent(),/Lv.20/);await shot('swamp-stage-map');
    await page.locator('[data-stage-region="1"]').click();assert.equal(await page.locator('.stage-map [data-stage="10"]').count(),1);
    await page.locator('[data-stage-region="2"]').click();await close();
    await open('forge');assert.equal(await page.locator('[data-growth-node^="swamp-"]').count(),100);await shot('swamp-forge');
    await page.locator('[data-forge-region="1"]').click();assert.equal(await page.locator('[data-growth-node^="main-"]').count(),10);
    await page.locator('[data-forge-region="2"]').click();await close();
    await open('inventory');for(const id of ['venom-sac','living-mud','cursed-bone','swamp-crystal','hydra-scale'])assert.equal(await page.locator('[data-item="'+id+'"] img').evaluate(img=>img.complete&&img.naturalWidth===128),true);await shot('swamp-inventory');await close();
    await page.locator('#start-button').click();await page.clock.runFor(7500);await shot('swamp-battle');
    // Exercise the actual lich cast and renderer together in the final wave.
    await page.evaluate(()=>{testRun.enemies.forEach(e=>{e.hp=0;});testRun.wave=0;});await page.clock.runFor(1800);
    await page.evaluate(()=>{const lich=testRun.enemies.find(e=>e.type==='lich');testRun.enemies=testRun.enemies.filter(e=>e===lich);lich.hp=lich.maxHp=100000;lich.attacks=2;lich.x=700;lich.y=410;testRun.hero.hp=testRun.hero.maxHp=100000;testRun.hero.damage=0;testRun.hero.warriorSkills=[];testRun.hero.cooldown=100000;testRun.allies.forEach(a=>{a.hp=0;});ForestSimulation.startSwampAttack(testRun,lich,testRun.hero,[]);});
    await page.clock.runFor(1500);await shot('lich-chant');await page.clock.runFor(650);
    assert.equal(await page.evaluate(()=>testRun.enemies.filter(e=>e.type==='skeleton').length),4);await shot('lich-summon');
    await page.evaluate(()=>{testRun.wave=2;testRun.enemies.forEach(e=>{e.hp=0;});});await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>testRun.status),'victory');
    assert.equal(await page.locator('#next-button').isVisible(),true);assert.match(await page.locator('#result-title').textContent(),/毒沼/);await page.locator('#result-skip').click();await shot('swamp-clear');
    await page.locator('#retry-button').click();await page.clock.runFor(100);await open('forge');await page.locator('[data-growth-node="swamp-main-10"]').click();await page.locator('[data-buy-node="swamp-main-10"]').click();await close();
    const purchased=await save();assert.ok(purchased.progression.characters.warrior.weapon.includes('swamp-main-10'));
    await page.reload();await page.locator('#start-button:not([disabled])').waitFor();assert.ok((await save()).progression.characters.warrior.weapon.includes('swamp-main-10'));
    // Forest 10 now exposes next and advances across the region boundary.
    await open('options');await page.locator('[data-auto-mode="advance"]').click();await close();await open('stages');await page.locator('[data-stage-region="1"]').click();await page.locator('[data-stage="10"]').click();await page.locator('[data-enter="10"]').click();
    await forceWin();assert.equal(await page.locator('#next-button').isVisible(),true);await page.locator('#result-skip').click();await page.clock.runFor(5200);
    assert.equal(await page.locator('#stage-number').textContent(),'2 — 1');assert.equal(await page.locator('body').getAttribute('data-region'),'2');await shot('forest-to-swamp');
    await context.newPage().then(async mobile=>{await mobile.setViewportSize({width:390,height:844});await mobile.goto(url+'game.html');await mobile.locator('#start-button:not([disabled])').waitFor();assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.screenshot({path:path.join(output,'swamp-mobile.png')});await mobile.close();});
    assert.deepEqual(errors,[]);console.log('Swamp UI verified: region switching, 100-node forge, generated loot, combat, lich summon, save, finale and forest-to-swamp auto advance.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
