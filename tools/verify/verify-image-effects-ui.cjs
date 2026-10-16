'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),G=require('../../public/js/data/goddess-data.js'),A=require('../balance/audit-goddess.cjs');
const {writeAssetJson}=require('../lib/project-paths.cjs'),out=path.resolve(__dirname,'../../output/image-effects');
async function main(){
 fs.mkdirSync(out,{recursive:true});const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[],report={},remaining=process.argv.includes('--remaining'),labsOnly=process.argv.includes('--labs-only'),gatesOnly=process.argv.includes('--gates-only');
 const listen=async page=>{page.on('pageerror',e=>{errors.push(e.stack);console.error(e.stack);});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  // Serve the repository's exact static bytes through Playwright routing; this
  // also works on hosts that restrict browser requests to loopback servers.
  await page.route('**/*',route=>{const name=decodeURIComponent(new URL(route.request().url()).pathname);if(name==='/favicon.ico')return route.fulfill({status:204});const root=path.resolve(__dirname,name.startsWith('/development/')?'../..':'../../public'),file=path.resolve(root,'.'+(name==='/'?'/game.html':name)),relative=path.relative(root,file);if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif'};return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});});
 };
 try{
  if(!remaining&&!labsOnly&&!gatesOnly){
  const gallery=await browser.newPage({viewport:{width:1440,height:1800}});await listen(gallery);await gallery.clock.install();await gallery.goto(url+'/development/labs/common-effects.html');await gallery.locator('#play:not([disabled])').waitFor();
  for(const speed of ['1','0.25']){await gallery.evaluate(()=>Object.values(effectReview.seen).forEach(s=>s.clear()));await gallery.locator('#speed').selectOption(speed);await gallery.clock.runFor(speed==='1'?1500:5000);const seen=await gallery.evaluate(()=>Object.fromEntries(Object.entries(effectReview.seen).map(([id,s])=>[id,[...s]])));for(const [id,frames]of Object.entries(seen))assert.equal(frames.length,4,id+' playback '+speed);report['playback-'+speed]=seen;}
  await gallery.locator('#play').click();
  for(const back of ['dark','light']){await gallery.locator('#background').selectOption(back);for(let i=0;i<4;i++){await gallery.evaluate(t=>effectReview.seek(t),i*140);await gallery.screenshot({path:path.join(out,'frames-'+back+'-'+i+'.png'),fullPage:true});}}
  // A recolored texture must retain its generated silhouette and partial alpha.
  report.alpha=await gallery.evaluate(()=>{const c=new OffscreenCanvas(256,256),ctx=c.getContext('2d');ImageEffects.sprite(ctx,'ring',0,128,128,240,240,'#ff8855',.5);const p=ctx.getImageData(0,0,256,256).data;let visible=0,partial=0;for(let i=3;i<p.length;i+=4){if(p[i])visible++;if(p[i]>0&&p[i]<128)partial++;}return{visible,partial,corner:p[3],center:p[(128*256+128)*4+3],cache:ImageEffects.cacheStats()};});assert.equal(report.alpha.corner,0);assert.equal(report.alpha.center,0);assert.ok(report.alpha.visible>500&&report.alpha.partial>500);await gallery.close();console.log('24 frames: static dark/light and continuous 1x/0.25x passed');
  writeAssetJson(path.join(out,'gallery.json'),{status:'pass',...report});
  }
  if(!labsOnly){
  const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();await listen(page);await page.clock.install();
  const seed=A.reference();seed.autoMode='off';
  await page.addInitScript(({key,seed})=>{const stage=sessionStorage.getItem('effect-review-stage');if(stage)seed.selectedStage=/^\d+$/.test(stage)?Number(stage):stage;localStorage.setItem(key,JSON.stringify(seed));let sim;window.fxQueue=[];Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(value){sim=value;const create=value.createRun,update=value.update;value.createRun=(...args)=>window.testRun=create(...args);value.update=(run,dt)=>{if(window.freezeSimulation){run.time+=dt;return window.fxQueue.splice(0).map(e=>({...e,timeMs:run.time}));}return update(run,dt);};}});},{key:D.SAVE_KEY,seed});
  await page.goto(url+'/game.html');await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});
  if(!remaining){
   await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.id='gate-review';canvas.width=1024;canvas.height=576;document.body.append(canvas);const ctx=canvas.getContext('2d');for(const method of ['stroke','fillRect','createRadialGradient','quadraticCurveTo'])ctx[method]=()=>{throw Error('Procedural gate effect: '+method);};});
   report.gates=[];
   for(const specialId of ['dimensional-gate','chaos-gate'])for(const reduced of [false,true])for(const [phase,clock]of [['idle',0],['opening',450],['summoning',0],['closing',325],['shattering',150],['shattering',850],['emerge',260],['shatter',450]]){
    await page.evaluate(({specialId,reduced,phase,clock})=>{const ctx=document.querySelector('#gate-review').getContext('2d');ctx.clearRect(0,0,1024,576);for(let tier=0;tier<3;tier++){const x=180+tier*330,y=490;if(phase==='emerge'||phase==='shatter'){RiftRenderer.effect(ctx,{kind:phase,tier,specialId,x,y,from:{x,y:190}},clock,reduced);if(phase==='emerge')RiftRenderer.emergence(ctx,{time:clock,wave:tier,stage:{id:specialId},enemies:[{x,y,hp:1,riftBornAt:0}]},reduced);}else RiftRenderer.gate(ctx,{x,y,height:260,gateTier:tier,gatePhase:phase,gateClock:clock,specialId},680,reduced);}}, {specialId,reduced,phase,clock});
    const name='gates-'+specialId+'-'+phase+'-'+clock+(reduced?'-reduced':'');await page.locator('#gate-review').screenshot({path:path.join(out,name+'.png')});report.gates.push(name);
   }
   await page.evaluate(()=>document.querySelector('#gate-review').remove());assert.deepEqual(errors,[]);writeAssetJson(path.join(out,'gates.json'),{status:'pass',scenes:report.gates});console.log('Both gates: all 3 tiers, opening/closing/cracks/fragments/emergence/shatter, normal/reduced, no primitive effects');
   if(gatesOnly){await context.close();return;}
  }
  await page.evaluate(()=>window.freezeSimulation=true);await page.locator('#start-button').click();await page.clock.runFor(350);
  await page.evaluate(()=>{window.freezeSimulation=true;const r=testRun;for(const a of[r.hero,...r.allies]){a.hp=a.maxHp;a.warriorCast=a.mageCast=a.paladinCast=a.ninjaCast=a.shamanCast=a.mikoCast=null;}r.hero.bleed={};r.hero.poison={};r.hero.sandSlowUntil=r.time+5000;window.fxQueue.push({type:'slash',x:390,y:360,facing:1,skill:true},{type:'summon',kind:'skeleton',x:680,y:440},...['resistance','siphon','echo','execution','aegis','reprisal','timeshift'].map((kind,i)=>({type:'gem-effect',kind,x:140+i*110,y:420,from:{x:140,y:350}})),{type:'damage',target:r.hero.id,source:'enemy',amount:1,x:r.hero.x,y:r.hero.y-60});});
  await page.clock.runFor(150);await page.locator('#game-canvas').screenshot({path:path.join(out,'common-status-gems.png')});
  report.regions=[];
  // Start real battles across all normal regions to exercise their integration.
  if(!remaining)for(const stage of [10,20,30,40,50,60,70,80,90,100,'dimensional-gate','chaos-gate',G.ID]){
   await page.evaluate(stage=>sessionStorage.setItem('effect-review-stage',String(stage)),stage);
   await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.locator('#start-button').click();
   assert.equal(await page.evaluate(()=>testRun.stage.id),stage);await page.evaluate(()=>{for(const a of[testRun.hero,...testRun.allies]){a.invulnerable=true;a.damage=0;a.baseDamage=0;}});await page.clock.runFor(2400);await page.locator('#game-canvas').screenshot({path:path.join(out,'battle-'+stage+'.png')});report.regions.push(stage);
  }
  // Every historical boss is composited through the generated mirror aperture.
  await page.evaluate(()=>{window.freezeSimulation=true;const r=testRun;r.goddess.projectiles=[];r.goddess.phantom=null;r.enemies[0].goddessPlan=null;r.enemies[0].phaseChangeAt=null;r.enemies[0].goddessPhase=2;});
  report.phantoms=[];
  for(const row of G.PHANTOMS){await page.evaluate(row=>{const r=testRun,p={kind:'phantom',row,times:[1200],elapsed:950,origin:{x:630,y:465}};p.shapes=GoddessCombat.shapes(r,row.kind,p.origin,r.hero);r.goddess.phantom=p;r.enemies[0].goddessPlan=p;},row);await page.clock.runFor(20);await page.locator('#game-canvas').screenshot({path:path.join(out,'mirror-'+row.id+'.png')});report.phantoms.push(row.id);}
  await page.evaluate(()=>{const r=testRun,e=r.enemies[0];r.goddess.phantom=null;e.goddessPlan={kind:'zero',elapsed:600,warn:1000};window.fxQueue.push({type:'goddess-effect',kind:'awaken',x:e.x,y:e.y},{type:'goddess-effect',kind:'zero',x:440,y:430,shapes:[{kind:'circle',center:{x:440,y:430},radius:100}]},{type:'goddess-effect',kind:'phantom-hit',x:450,y:440,shapes:[{kind:'lane',from:{x:120,y:400},to:{x:860,y:400},width:20},{kind:'sector',center:{x:550,y:430},radius:100,angle:1.3,direction:Math.PI},{kind:'annulus',center:{x:750,y:420},radius:80,innerRadius:40}]});r.goddess.projectiles=[{kind:'star',x:450,y:220,targetId:r.hero.id,age:220},{kind:'meteor',x:600,y:240,targetId:r.hero.id,age:220}];});await page.clock.runFor(60);await page.locator('#game-canvas').screenshot({path:path.join(out,'goddess-generated-effects.png')});
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.locator('#start-button').click();await page.clock.runFor(1000);await page.screenshot({path:path.join(out,'mobile-reduced.png')});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);await context.close();writeAssetJson(path.join(out,'battle.json'),{status:'pass',...report});console.log((remaining?'':'10 regions and both gates; ')+'goddess, 20 reflections and mobile/reduced motion passed');
  }
  // All skill labs consume the same renderer code and must load the new helper.
  report.labs={};
  for(const [file,global]of [['skill-lab','WarriorSkills'],['mage-skill-lab','MageSkills'],['paladin-skill-lab','PaladinSkills'],['ninja-skill-lab','NinjaSkills'],['shaman-skill-lab','ShamanSkills']]){
   const p=await browser.newPage({viewport:{width:1440,height:1050}});await listen(p);await p.clock.install();await p.goto(url+'/development/labs/'+file+'.html');assert.deepEqual(errors,[]);await p.locator('[data-skill]').first().waitFor();await p.locator('#play:not([disabled])').waitFor({timeout:90000});
   const ids=await p.evaluate(name=>window[name].ACTIVE.map(s=>s.id),global);let count=0;
   for(const id of ids){const button=p.locator('[data-skill="'+id+'"]');if(!await button.count())continue;await button.click();const max=Number(await p.locator('#timeline').getAttribute('max'));for(const q of [.18,.55,.86]){await p.locator('#timeline').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('input',{bubbles:true}));},Math.round(max*q));await p.clock.runFor(20);}count++;}
   await p.screenshot({path:path.join(out,file+'.png')});report.labs[file]=count;assert.ok(count>=20,file);await p.close();console.log(file+': '+count+' skills rendered');
  }
  assert.deepEqual(errors,[]);writeAssetJson(path.join(out,'ui.json'),{status:'pass',...report,errors});console.log('Image effect UI checks passed');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
