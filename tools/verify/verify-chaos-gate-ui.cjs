'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const {ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs'),bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),Special=require('../../public/js/data/special-stages.js'),A=require('../balance/audit-balance.cjs'),B=require('../balance/audit-chaos-gate.cjs');
const C=Special.CHAOS,output=path.join(ROOT,'output/chaos-gate');fs.mkdirSync(output,{recursive:true});
async function main(){
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port+'/',browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
 async function pageFor(seed,viewport={width:1440,height:1050},reducedMotion='no-preference'){
  const context=await browser.newContext({viewport,reducedMotion}),page=await context.newPage();
  if(process.argv.includes('--offline-browser'))await page.route('**/*',route=>{const pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname==='/favicon.ico')return route.fulfill({status:204,body:''});const file=path.resolve(PUBLIC,pathname==='/'?'game.html':'.'+pathname);if(!inside(PUBLIC,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml'};return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
  else await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.clock.install();await page.addInitScript(({key,seed})=>{localStorage.setItem(key,JSON.stringify(seed));let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});},{key:D.SAVE_KEY,seed});
  await page.goto(url);await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));assert.equal(await page.locator('#start-button').innerText(),'開始');return {context,page};
 }
 const screenshot=(page,file)=>page.screenshot({path:path.join(output,file+'.png'),animations:'disabled'});
 async function unlockScene(){
  const seed=A.referenceBuild(100,99).save;seed.cleared=seed.cleared.filter(id=>id!==100);seed.selectedStage=100;seed.autoMode='off';
  const live=await pageFor(seed),page=live.page;
  try{await page.locator('#start-button').click();await page.evaluate(()=>{testRun.wave=testRun.stage.waves.length-1;testRun.enemies.forEach(e=>e.hp=0);});await page.clock.runFor(1200);assert.equal(await page.locator('#unlock-intro.chaos-unlocked').isVisible(),true);assert.equal(await page.locator('#unlock-title').innerText(),'混沌の門');assert.equal(await page.locator('[data-unlock-id="chaos-gate"]').count(),1);assert.ok(await page.locator('.unlock-emblem').evaluate(e=>getComputedStyle(e).backgroundImage.includes('chaos-gate')));assert.ok(await page.locator('#result-overlay').evaluate(e=>!getComputedStyle(e,'::before').backgroundImage.includes('starting-forest')));await screenshot(page,'unlocked');}finally{await live.context.close();}
 }
 async function connections(){
  const seed=B.fullBuild(8);seed.selectedStage=C.ID;seed.cleared.push(C.ID);seed.autoMode='same';seed.speed=1;
  const live=await pageFor(seed),page=live.page;
  try{
   await page.locator('#start-button').click();
   await page.evaluate(()=>{window.previousRun=testRun;testRun.wave=2;testRun.kills=testRun.stage.total;testRun.enemies.forEach(e=>e.hp=0);});
   await page.clock.runFor(1500);assert.equal(await page.evaluate(()=>testRun.status),'victory');await page.locator('#result-skip').click();await page.clock.runFor(5500);
   assert.equal(await page.evaluate(()=>testRun.stage.id),C.ID);assert.equal(await page.evaluate(()=>testRun!==previousRun),true);assert.equal(await page.evaluate(()=>testRun.status),'running');
   await page.evaluate(()=>{for(const a of [testRun.hero,...testRun.allies])a.hp=0;});await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>testRun.status),'defeat');await page.locator('#result-skip').click();await page.clock.runFor(5500);
   assert.equal(await page.evaluate(()=>testRun.stage.id),100);const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);assert.equal(saved.autoMode,'same');assert.equal(saved.selectedStage,100);
   // The original gate still loads its own art and unlocks with its original title.
   await select(page,Special.ID);await page.locator('[data-enter="dimensional-gate"]').click();assert.equal(await page.locator('body').getAttribute('data-special'),Special.ID);await page.clock.runFor(700);await screenshot(page,'rift-regression-opening');
   console.log('Connections passed: same mode repeats Chaos Gate, defeat returns to castle100/same, original gate loads.');
  }finally{await live.context.close();}
 }
 async function select(page,id){await page.locator('[data-open=stages]').first().click();await page.locator('[data-special-stages]').click();await page.locator('.stage-map [data-stage="'+id+'"]').click();}
 async function gallery(page,specialId){
  const frames=await page.evaluate(id=>{
   const frames=[],phases=[['waiting',0],['opening',0],['opening',300],['opening',600],['opening',900],['summoning',1000],['closing',0],['closing',325],['closing',650],['shattering',0],['shattering',300],['shattering',650],['shattering',1000],['shattering',1399]];
   for(let tier=0;tier<3;tier++)for(const [phase,clock]of phases){const canvas=document.createElement('canvas');canvas.width=220;canvas.height=260;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#15101c';ctx.fillRect(0,0,220,260);ctx.save();ctx.translate(110,220);ctx.scale(.55,.55);RiftRenderer.gate(ctx,{specialId:id,x:0,y:0,height:210+tier*32,gateTier:tier,gatePhase:phase,gateClock:clock},clock,false);ctx.restore();ctx.fillStyle='#fff';ctx.font='11px sans-serif';ctx.fillText(tier+' '+phase+' '+clock,6,248);frames.push(canvas.toDataURL());}return frames;
  },specialId);
  const inputs=frames.map((data,i)=>({input:Buffer.from(data.split(',')[1],'base64'),left:i%14*220,top:Math.floor(i/14)*260}));
  await sharp({create:{width:14*220,height:3*260,channels:4,background:'#15101c'}}).composite(inputs).png().toFile(path.join(output,specialId+'-all-phases.png'));
  // Preserve every 100ms sample of each new procedural clip for frame-step and playback review.
  if(specialId===C.ID){const all=await page.evaluate(id=>{const out=[];for(let tier=0;tier<3;tier++)for(const [phase,duration]of [['waiting',500],['opening',900],['summoning',1250],['closing',650],['shattering',1400]])for(let t=0;t<=duration;t+=100){const c=document.createElement('canvas');c.width=320;c.height=360;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#15101c';ctx.fillRect(0,0,320,360);RiftRenderer.gate(ctx,{specialId:id,x:160,y:315,height:210+tier*32,gateTier:tier,gatePhase:phase,gateClock:t},t,false);out.push({tier,phase,t,data:c.toDataURL()});}return out;},specialId);const dir=path.join(output,'frames');fs.mkdirSync(dir,{recursive:true});for(const f of all)fs.writeFileSync(path.join(dir,f.tier+'-'+f.phase+'-'+String(f.t).padStart(4,'0')+'.png'),Buffer.from(f.data.split(',')[1],'base64'));}
  if(specialId===C.ID){const dir=path.join(output,'frames'),names=fs.readdirSync(dir);for(let tier=0;tier<3;tier++){const files=['waiting','opening','summoning','closing','shattering'].flatMap(phase=>names.filter(n=>n.startsWith(tier+'-'+phase+'-')).sort());const raw=await Promise.all(files.map(n=>sharp(path.join(dir,n)).ensureAlpha().raw().toBuffer()));await sharp(Buffer.concat(raw),{raw:{width:320,height:360*raw.length,channels:4,pageHeight:360}}).gif({delay:100,loop:0}).toFile(path.join(output,'gate-tier-'+tier+'-preview.gif'));}}
 }
 try{
  if(process.argv.includes('--unlock-only')){await unlockScene();assert.deepEqual(errors,[]);console.log('Chaos unlock scene passed.');return;}
  if(process.argv.includes('--connections-only')){await connections();await unlockScene();assert.deepEqual(errors,[]);return;}
  const locked=A.referenceBuild(100,0).save;locked.cleared=locked.cleared.filter(id=>id!==100);locked.selectedStage=99;locked.autoMode='off';
  const lock=await pageFor(locked);await select(lock.page,C.ID);assert.equal(await lock.page.locator('[data-enter="chaos-gate"]').isDisabled(),true);assert.equal(await lock.page.locator('.locked-message').innerText(),'魔王城10 クリアで解放');await screenshot(lock.page,'locked');await lock.context.close();
  const seed=B.fullBuild(8);seed.selectedStage=C.ID;seed.autoMode='off';seed.speed=1;
  const live=await pageFor(seed),page=live.page;assert.equal(await page.locator('body').getAttribute('data-special'),C.ID);assert.equal(await page.locator('#stage-number').innerText(),'SPECIAL');assert.equal(await page.locator('#route-nodes .route-node').count(),D.SPECIAL_STAGES.length);await screenshot(page,'ready');
  await select(page,C.ID);assert.equal(await page.locator('[data-stage-region]').count(),10);assert.equal(await page.locator('.stage-map .route-node').count(),D.SPECIAL_STAGES.length);assert.equal(await page.locator('.special-wave-preview strong').allTextContents().then(a=>a.join('/')),C.NAMES.join('/'));assert.ok((await page.locator('.special-drop-preview').innerText()).includes('Lv.10'));assert.ok(await page.locator('.stage-map').evaluate(e=>getComputedStyle(e).backgroundImage.includes('chaos-gate')));await screenshot(page,'stage-select');
  await page.locator('.stage-map [data-stage="dimensional-gate"]').click();assert.ok((await page.locator('.special-drop-preview').innerText()).includes('Lv.5'));assert.ok((await page.locator('.special-wave-preview img').first().getAttribute('src')).includes('dimensional-rift'));await page.locator('.stage-map [data-stage="chaos-gate"]').click();await page.locator('[data-enter="chaos-gate"]').click();
  await page.evaluate(()=>{for(const a of [testRun.hero,...testRun.allies])Object.assign(a,{manualOnly:true,hp:1e12,maxHp:1e12,invulnerable:true,damage:0,cooldown:1e9,skill:1e9,warriorSkills:[],mageSkills:[],paladinSkills:[],warriorCast:null,mageCast:null,paladinCast:null});});
  await page.clock.runFor(700);await screenshot(page,'opening');await page.clock.runFor(7300);assert.equal(await page.evaluate(()=>testRun.enemies.filter(e=>!e.dimensionalGate&&!e.bodyPart).length),35);await screenshot(page,'summon-mobs');
  await gallery(page,C.ID);await gallery(page,Special.ID);
  for(let wave=0;wave<3;wave++){
   for(let batch=0;batch<(wave===2?1:3);batch++){
    await page.evaluate(()=>{for(const e of testRun.enemies.filter(e=>e.hp>0&&!e.dimensionalGate&&!e.bodyPart))ForestSimulation.hit(testRun,testRun.hero,e,1e12,[],false,null,{critical:false,skipHitRoll:true});});
    await page.clock.runFor(batch===(wave===2?0:2)?3400:wave===0?8000:5000);
    if(batch===(wave===2?0:2)&&wave<2){await page.clock.runFor(3000);assert.equal(await page.evaluate(()=>testRun.wave),wave+1);await screenshot(page,'summon-tier-'+(wave+1));}
   }
  }
  await page.clock.runFor(12000);assert.equal(await page.evaluate(()=>testRun.status),'victory');assert.equal(await page.evaluate(()=>testRun.kills),128);assert.equal(await page.locator('#result-title').innerText(),'混沌の門を打ち破った');assert.equal(await page.locator('#next-button').isHidden(),false);await screenshot(page,'clear');
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);assert.equal(saved.selectedStage,C.ID);assert.ok(saved.cleared.includes(C.ID));assert.equal(saved.inventory.potion,seed.inventory.potion);
  await page.reload();await page.locator('#start-button:not([disabled])').waitFor();assert.equal(await page.locator('body').getAttribute('data-special'),C.ID);await live.context.close();
  await unlockScene();
  const mobile=await pageFor(seed,{width:390,height:844},'reduce');await select(mobile.page,C.ID);assert.ok(await mobile.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await mobile.page.locator('#menu-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await screenshot(mobile.page,'mobile-stage-select');await mobile.page.locator('[data-enter="chaos-gate"]').click();await mobile.page.clock.runFor(3000);await screenshot(mobile.page,'mobile-reduced-motion');assert.equal(await mobile.page.locator('img').evaluateAll(v=>v.filter(i=>i.complete&&!i.naturalWidth).length),0);await mobile.context.close();
  await connections();assert.deepEqual(errors,[]);console.log('Chaos Gate UI passed: lock/unlock effect, both stage selections, all summon waves, gate clips, clear/save/reload, mobile and reduced motion.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
