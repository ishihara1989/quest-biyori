'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs'),bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),R=require('../../public/js/core/reincarnation.js'),T=require('../../public/js/data/reincarnation-tree-data.js'),A=require('../../public/js/core/achievements.js'),B=require('../balance/audit-reincarnation.cjs');
async function main(){
 const output=path.join(ROOT,'output/reincarnation/ui');fs.mkdirSync(output,{recursive:true});
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
 async function pageFor(seed,viewport={width:1440,height:1050},reducedMotion='no-preference'){
  const context=await browser.newContext({viewport,reducedMotion}),page=await context.newPage();
  await page.route('**/*',route=>{
   const pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname==='/favicon.ico')return route.fulfill({status:204,body:''});
   const file=path.resolve(PUBLIC,pathname==='/'?'game.html':'.'+pathname);
   if(!inside(PUBLIC,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});
   const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml'};
   return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.clock.install();await page.addInitScript(({key,seed})=>{
   if(!sessionStorage.getItem('reincarnation-test-seeded')){localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem('reincarnation-test-seeded','1');}
   let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});
  },{key:D.SAVE_KEY,seed});
  await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
  await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));return {page,context};
 }
 const saveOf=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
 const shot=(page,name)=>page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});
 async function fastWin(page){await page.locator('#start-button').click();await page.evaluate(()=>{testRun.enemies[0].hp=1;});await page.clock.runFor(6000);}
 async function menu(page,name){const dialog=page.locator('#menu-dialog');if(await dialog.isVisible())await page.locator('#close-menu').click();await page.locator('[data-open="'+name+'"]').first().click();}
 const labOnly=process.argv.includes('--lab-only'),scenesOnly=process.argv.includes('--scenes-only'),boss=B.reference();boss.autoMode='off';
 try{
  if(process.argv.includes('--seals-only')){
   const own=(seed,id)=>{for(const p of T.byId[id].requires)if(p!=='origin'&&!seed.reincarnation.owned.includes(p))own(seed,p);if(id!=='origin'&&!seed.reincarnation.owned.includes(id))seed.reincarnation.owned.push(id);};
   for(const viewport of [{width:1440,height:1050},{width:390,height:844}]){
    const seed=D.freshSave();Object.assign(seed.reincarnation,{discovered:true,unlocked:true,cycle:100,total:20000});for(const id of ['trial-open','damage2','hp2'])own(seed,id);
    const {page,context}=await pageFor(seed,viewport);await menu(page,'reincarnation');
    await page.locator('[data-reinc-node="trial-seals"]').click();assert.ok(await page.locator('[data-reinc-confirm]').isDisabled());
    assert.deepEqual(await page.locator('.reinc-prerequisites [data-reinc-jump]').evaluateAll(nodes=>nodes.map(n=>n.dataset.reincJump)),['trial-open','damage2','hp2','cycle-bond']);
    await page.locator('[data-reinc-jump="cycle-bond"]').click();assert.equal(await page.locator('.reincarnation-detail h3').innerText(),'輪廻の絆');
    assert.equal(await page.locator('[data-reinc-confirm]').innerText(),'4,000 PT · 取得');
    await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-cancel]').click();assert.ok(!(await saveOf(page)).reincarnation.owned.includes('cycle-bond'));
    await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="cycle-bond"]').click();
    await page.locator('[data-reinc-node="trial-seals"]').click();assert.equal(await page.locator('[data-reinc-confirm]').innerText(),'4,000 PT · 取得');
    assert.ok((await page.locator('.reinc-note').innerText()).includes('封印3種'));assert.ok(await page.locator('[data-reinc-confirm]').isEnabled());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.mouse.move(2,2);await shot(page,'seals-prerequisites-'+viewport.width);
    await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="trial-seals"]').click();
    const purchased=await saveOf(page);assert.equal(R.points(purchased),R.points(seed)-8000);
    await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
    const restored=await saveOf(page);assert.deepEqual(new Set(restored.reincarnation.owned),new Set(purchased.reincarnation.owned));
    await menu(page,'skills');assert.equal(await page.locator('[data-character]').count(),6);await shot(page,'bond-party-'+viewport.width);
    await menu(page,'reincarnation');await page.locator('[data-reinc-tab="trials"]').click();await page.locator('[data-trial-start]').click();
    assert.ok((await page.locator('.trial-review').innerText()).includes('仲間は最初から全員同行'));await page.locator('[data-trial-confirm="start"]').click();
    await page.waitForLoadState('load');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
    const next=await saveOf(page);assert.ok(Object.keys(P.CHARACTERS).every(job=>P.unlocked(next,job)&&next.progression.characters[job].xp.level===1));
    await page.locator('#start-button').click();assert.equal(await page.evaluate(()=>testRun.allies.length),5);await page.clock.runFor(250);await shot(page,'bond-first-battle-'+viewport.width);
    await context.close();
   }
   assert.deepEqual(errors,[]);console.log('Bond/seals UI passed at 1440px/390px: prerequisites, prices, cancel, purchase, reload, six Lv1 characters and first battle; no resource/runtime errors.');return;
  }
  if(process.argv.includes('--luck-only')){
   const ids=['gold2','drop-rate',...T.branches.find(b=>b.heading==='収穫 / ドロップ率').ids];
   for(const viewport of [{width:1440,height:1050},{width:390,height:844}])for(const final of [false,true]){
    const owned=final?ids.slice(0,-1):ids.slice(0,2),id=final?'rate30000':'rate150';
    const seed=D.freshSave();Object.assign(seed.reincarnation,{discovered:true,unlocked:true,cycle:100000,total:10000000,owned});
    const {page,context}=await pageFor(seed,viewport);await menu(page,'reincarnation');
    const loaded=await saveOf(page);assert.deepEqual(loaded.reincarnation.owned,owned);
    assert.equal(R.points(loaded),10000000-owned.reduce((sum,id)=>sum+T.byId[id].cost,0));
    if(!final){await page.locator('[data-reinc-node="rate200"]').click();assert.equal(await page.locator('[data-reinc-confirm]').isDisabled(),true);}
    await page.locator('[data-reinc-node="'+id+'"]').click();
    assert.equal(await page.locator('.reinc-effect b').innerText(),final?'＋20,000%':'＋200%');
    assert.equal(await page.locator('.reincarnation-detail h3').innerText(),final?'星海の幸運':'幸運 300');
    assert.equal(await page.locator('.reinc-prerequisites button').innerText(),final?'✓ 幸運 40,000':'✓ 幸運の星');
    assert.equal(await page.locator('[data-reinc-confirm]').innerText(),final?'500,000 PT · 取得':'150 PT · 取得');
    await page.locator('.reincarnation-page img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await shot(page,'luck-'+(final?'final':'entry')+'-'+viewport.width);
    await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="'+id+'"]').click();
    await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
    const restored=await saveOf(page);assert.deepEqual(restored.reincarnation.owned,[...owned,id]);
    assert.equal(R.bonuses(restored).rate,final?60000:300);
    assert.equal(R.points(restored),R.points(loaded)-T.byId[id].cost);
    await menu(page,'reincarnation');await page.locator('[data-reinc-node="'+id+'"]').click();assert.equal(await page.locator('.node-state').innerText(),'取得済み');
    await context.close();
   }
   assert.deepEqual(errors,[]);console.log('Luck tree UI passed: halved prices, stronger effects, prerequisites, legacy purchases, purchase and reload at 1440px/390px; no resource or runtime errors.');return;
  }
  if(!labOnly&&!scenesOnly&&!process.argv.includes('--stats-only')){
   const branch=T.branches.find(b=>b.heading==='収穫 / ゴールド'),ids=['gold2',...branch.ids];
   for(const viewport of [{width:1440,height:1050},{width:390,height:844}]){
    const seed=D.freshSave();Object.assign(seed.reincarnation,{discovered:true,unlocked:true,cycle:100000,total:10000000,owned:ids.slice(0,-1)});
    const {page,context}=await pageFor(seed,viewport);await menu(page,'reincarnation');
    await page.locator('[data-reinc-node="gold-step-1"]').click();assert.equal(await page.locator('.reinc-effect b').innerText(),'×3');
    assert.ok((await page.locator('[data-reinc-node="gold-step-1"] small').innerText()).includes('100 PT'));
    await page.locator('[data-reinc-node="gold4"]').click();assert.equal(await page.locator('.reinc-effect b').innerText(),'×10');
    await page.locator('[data-reinc-node="gold100"]').click();assert.equal(await page.locator('.reinc-effect b').innerText(),'×100');
    assert.equal(await page.locator('.reinc-prerequisites button').innerText(),'✓ 黄金の記憶 20');
    assert.equal(await page.locator('[data-reinc-confirm]').isEnabled(),true);
    await page.locator('.reincarnation-page img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'gold-final-'+viewport.width);
    await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="gold100"]').click();
    assert.ok((await page.locator('.rebirth-summary').innerText()).includes('ゴールド ×100'));
    await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
    const restored=await saveOf(page);assert.deepEqual(restored.reincarnation.owned,ids);assert.equal(R.bonuses(restored).gold,100);
    assert.equal(R.points(restored),10000000-ids.reduce((sum,id)=>sum+T.byId[id].cost,0));
    await menu(page,'reincarnation');await page.locator('[data-reinc-node="gold100"]').click();assert.equal(await page.locator('.node-state').innerText(),'取得済み');
    await context.close();
   }
   if(process.argv.includes('--gold-only')){assert.deepEqual(errors,[]);console.log('Gold tree UI passed: 3x/10x/100x effects, price, extended map, final prerequisite, purchase and reload at 1440px/390px; no resource or runtime errors.');return;}
  }
  if(!labOnly&&!scenesOnly){
   for(const viewport of [{width:1440,height:1050},{width:390,height:844}]){
    const seed=R.prepare(Object.assign(B.reference(),{reincarnation:{...R.fresh(),discovered:true,unlocked:true,defeatedCycle:0}}),D.freshSave);
    seed.reincarnation.cycle=20;seed.reincarnation.total=2000;
    const {page,context}=await pageFor(seed,viewport);await menu(page,'reincarnation');
    for(const [id,nextId,value] of [['damage25','damage-step-2','×2'],['hp25','hp-step-2','×2'],['sp20','sp25','＋50%'],['common25','common50','＋100']]){
     await page.locator('[data-reinc-node="'+nextId+'"]').click();assert.equal(await page.locator('[data-reinc-confirm]').isDisabled(),true);
     await page.locator('[data-reinc-node="'+id+'"]').click();
     assert.equal(await page.locator('.reinc-prerequisites button').count(),0);assert.equal(await page.locator('.reinc-effect b').first().innerText(),value);
     assert.equal(await page.locator('[data-reinc-confirm]').isEnabled(),true);await page.locator('.reincarnation-page img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));await shot(page,'stat-entry-'+id+'-'+viewport.width);
     await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="'+id+'"]').click();
     await page.locator('[data-reinc-node="'+nextId+'"]').click();assert.equal(await page.locator('[data-reinc-confirm]').isEnabled(),true);
     await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="'+nextId+'"]').click();
    }
    await page.locator('[data-reinc-node="direction25"]').click();assert.deepEqual(await page.locator('.reinc-effect b').allTextContents(),['＋100','＋100','＋100']);
    await page.locator('[data-reinc-confirm]').click();await page.locator('[data-reinc-buy="direction25"]').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'stat-purchases-'+viewport.width);
    await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
    const restored=await saveOf(page),b=R.bonuses(restored);assert.equal(restored.reincarnation.owned.length,9);assert.equal(b.mainFree,undefined);
    assert.deepEqual([b.damage,b.hp,b.sp,b.common,b.attackCap,b.guardCap,b.utilityCap],[300,300,75,200,100,100,100]);assert.equal(R.points(restored),850);
    await context.close();
   }
   if(process.argv.includes('--stats-only')){assert.deepEqual(errors,[]);console.log('Stat/capacity tree UI passed: prerequisites, effects, purchases and reload at 1440px/390px; no resource or runtime errors.');return;}
  }
  if(!labOnly&&!scenesOnly){
  const fresh=await pageFor(D.freshSave());assert.equal(await fresh.page.locator('#reincarnation-nav').isVisible(),false);await menu(fresh.page,'achievements');
  assert.ok(!(await fresh.page.locator('#menu-content').innerText()).match(/転生|エピック|十二の星|女神/));await shot(fresh.page,'fresh-achievements');await fresh.context.close();
  const epic=B.reference();epic.selectedStage='extradimensional-goddess';epic.reincarnation.discovered=false;epic.autoMode='off';
  const discover=await pageFor(epic);await fastWin(discover.page);assert.equal((await saveOf(discover.page)).reincarnation.discovered,true);assert.equal((await saveOf(discover.page)).reincarnation.unlocked,false);
  assert.ok(await discover.page.locator('#unlock-intro.reincarnation-unlocked').isVisible());await shot(discover.page,'goddess-discovery');await discover.context.close();
  const unlock=await pageFor(boss);await fastWin(unlock.page);assert.ok(await unlock.page.locator('#unlock-intro.rebirth-unlocked').isVisible());
  assert.equal((await saveOf(unlock.page)).reincarnation.unlocked,true);assert.equal((await saveOf(unlock.page)).reincarnation.total,0);await shot(unlock.page,'reincarnation-unlock');
  await unlock.page.locator('#unlock-continue').click();await unlock.page.locator('#result-skip').click();await unlock.page.locator('#retry-button').click();await unlock.page.locator('#pause-button').click();
  await menu(unlock.page,'reincarnation');assert.ok(await unlock.page.locator('[data-rebirth-review]').isEnabled());await unlock.page.locator('[data-rebirth-review]').click();await shot(unlock.page,'rebirth-confirmation');
  const before=await saveOf(unlock.page);await unlock.page.locator('[data-reinc-back]').click();assert.equal((await saveOf(unlock.page)).reincarnation.cycle,before.reincarnation.cycle);
  await unlock.page.locator('[data-rebirth-review]').click();await unlock.page.locator('[data-rebirth-confirm]').click();await unlock.page.waitForLoadState('load');await unlock.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
  let next=await saveOf(unlock.page);assert.equal(next.reincarnation.cycle,1);assert.equal(next.reincarnation.total,100);assert.equal(next.gems.length,0);assert.equal(next.gold,0);assert.equal(next.inventory.potion,0);assert.equal(next.cleared.length,0);assert.equal(next.progression.characters.warrior.xp.level,1);assert.ok(next.achievements.earned['rebirth-1']);
  await menu(unlock.page,'reincarnation');await shot(unlock.page,'tree-first-rebirth');
  for(const id of ['drop2','xp3','gold2']){
   await unlock.page.locator('[data-reinc-node="'+id+'"]').click();await unlock.page.locator('[data-reinc-confirm]').click();await unlock.page.locator('[data-reinc-buy="'+id+'"]').click();
  }
  next=await saveOf(unlock.page);assert.equal(R.points(next),0);assert.deepEqual(new Set(next.reincarnation.owned),new Set(['drop2','xp3','gold2']));
  await unlock.page.locator('[data-reinc-node="trial-intrusion"]').click();assert.ok(await unlock.page.locator('.reincarnation-detail .coming-soon').isVisible());assert.equal(await unlock.page.locator('[data-reinc-confirm]').count(),0);await shot(unlock.page,'tree-coming-soon');
  const view=unlock.page.locator('.reincarnation-viewport'),box=await view.boundingBox();await view.evaluate(e=>{e.scrollLeft=450;e.scrollTop=400;});const scroll=await view.evaluate(e=>[e.scrollLeft,e.scrollTop]);await unlock.page.mouse.move(box.x+25,box.y+25);await unlock.page.mouse.down();await unlock.page.mouse.move(box.x+110,box.y+90);await unlock.page.mouse.up();const after=await view.evaluate(e=>[e.scrollLeft,e.scrollTop]);assert.ok(after[0]<scroll[0]&&after[1]<scroll[1]);
  await menu(unlock.page,'options');await unlock.page.locator('[data-reinc-auto="skills"]').check();assert.equal((await saveOf(unlock.page)).reincarnation.automation.skills,true);await shot(unlock.page,'automation-options');
  await unlock.page.reload();await unlock.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});next=await saveOf(unlock.page);assert.equal(next.reincarnation.cycle,1);assert.equal(R.points(next),0);assert.equal(next.reincarnation.owned.length,3);await unlock.context.close();
  }
  if(!labOnly){
  const battle=await pageFor(boss);await battle.page.locator('#start-button').click();
  await battle.page.evaluate(()=>{for(const a of [testRun.hero,...testRun.allies])Object.assign(a,{manualOnly:true,invulnerable:true,damage:0,baseDamage:0,mp:0,maxMp:1,mpRegen:0,warriorSkills:[],mageSkills:[],paladinSkills:[],ninjaSkills:[],shamanSkills:[],mikoSkills:[]});});
  async function attack(index){await battle.page.evaluate(index=>{const e=testRun.enemies[0];ReincarnationCombat.clear(testRun);e.deliveryCycle=index;e.cooldown=0;e.stagger=0;},index);}
  for(let i=0;i<5;i++){await attack(i);const warn=[700,1500,1000,900,1400][i];await battle.page.clock.runFor(warn+250);await shot(battle.page,'weapon-'+['pulse','laser','missiles','discs','orbital'][i]);}
  await attack(5);await battle.page.clock.runFor(500);await shot(battle.page,'truck-mount');await battle.page.clock.runFor(1800);await shot(battle.page,'truck-wait');await battle.page.clock.runFor(1900);await shot(battle.page,'truck-rush');
  await attack(5);await battle.page.clock.runFor(1800);await battle.page.evaluate(()=>ActionInterference.impact(testRun,testRun.hero,testRun.enemies[0],1e9,[]));await battle.page.clock.runFor(400);assert.ok(await battle.page.evaluate(()=>testRun.enemies[0].deliveryPlan.cancelAt!=null));await shot(battle.page,'truck-cancel');await battle.context.close();
  }
  if(!labOnly&&!scenesOnly){
  const mobileSave=R.prepare(Object.assign(B.reference(),{reincarnation:{...R.fresh(),discovered:true,unlocked:true,defeatedCycle:0}}),D.freshSave);A.sync(mobileSave);
  const mobile=await pageFor(mobileSave,{width:390,height:844},'reduce');await menu(mobile.page,'reincarnation');assert.ok(await mobile.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(mobile.page,'mobile-tree');await menu(mobile.page,'achievements');assert.ok(await mobile.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(mobile.page,'mobile-achievements');await mobile.context.close();
  }
  const lab=await pageFor(D.freshSave());await lab.page.unroute('**/*');await lab.page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-system.html');await lab.page.locator('[data-preset="tree"]:not([disabled])').waitFor();await lab.page.locator('[data-preset="tree"]').click();await lab.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.equal((await saveOf(lab.page)).reincarnation.total,100);await lab.context.close();
  assert.deepEqual(errors,[]);console.log(labOnly?'Runtime review presets passed.':scenesOnly?'All weapon/truck scenes and runtime review presets passed.':'Reincarnation UI passed: secrecy, both unlock intros, confirmation/cancel, rebirth/save/reload, purchases, Coming soon, tree drag, automation, all five weapons, truck mount/wait/rush/cancel, runtime review presets, 1440px/390px, reduced motion and resource errors.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main};
