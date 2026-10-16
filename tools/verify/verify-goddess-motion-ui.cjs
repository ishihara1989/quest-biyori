'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const {ROOT,writeAssetJson}=require('../lib/project-paths.cjs');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const A=require('../balance/audit-goddess.cjs'),D=require('../../public/js/data/forest-data.js');
async function main(){
  const out=path.join(ROOT,'output/goddess-motion');fs.mkdirSync(out,{recursive:true});
  const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const errors=[],playbacks=[],captures=[];
  async function open(viewport,reducedMotion='no-preference',seed=A.reference()){
    seed.autoMode='off';const context=await browser.newContext({viewport,reducedMotion}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
    await page.clock.install();await page.addInitScript(({key,seed})=>{localStorage.setItem(key,JSON.stringify(seed));let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});},{key:D.SAVE_KEY,seed});
    await page.goto(url);await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));
    assert.equal(await page.title(),'クエストびより');assert.match(await page.locator('.brand').innerText(),/クエストびより/);assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'),'クエストびより');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    return{context,page};
  }
  async function passive(page){await page.evaluate(()=>{for(const a of[testRun.hero,...testRun.allies])Object.assign(a,{manualOnly:true,damage:0,baseDamage:0,cooldown:1e9,skill:1e9,invulnerable:true,warriorSkills:[],mageSkills:[],paladinSkills:[],ninjaSkills:[],shamanSkills:[],mikoSkills:[],warriorCast:null,mageCast:null,paladinCast:null,ninjaCast:null,shamanCast:null,mikoCast:null});});}
  try{
    const live=await open({width:1440,height:1050}),p=live.page;
    await p.screenshot({path:path.join(out,'top-desktop.png')});
    await p.locator('#start-button').click();await passive(p);
    await p.evaluate(()=>{const e=testRun.enemies[0];e.hp=e.maxHp*.49;e.goddessPlan=null;testRun.goddess.phantom=null;testRun.goddess.projectiles=[];});
    await p.clock.runFor(1200);await p.locator('#game-canvas').screenshot({path:path.join(out,'phase-change.png')});await p.clock.runFor(1500);assert.equal(await p.evaluate(()=>testRun.enemies[0].goddessPhase),2);
    await p.evaluate(()=>{testRun.enemies[0].goddessPlan=null;testRun.enemies[0].cooldown=10000;});
    for(let i=0;i<4;i++){await p.clock.runFor(300);await p.locator('#game-canvas').screenshot({path:path.join(out,'floating-game-'+i+'.png')});}
    // Check the new idle's connection from an existing spell release.
    await p.evaluate(()=>{const e=testRun.enemies[0];e.cooldown=0;testRun.goddess.cycle=0;});await p.clock.runFor(1100);await p.locator('#game-canvas').screenshot({path:path.join(out,'cast.png')});await p.clock.runFor(1200);await p.locator('#game-canvas').screenshot({path:path.join(out,'cast-to-idle.png')});
    for(const phase of[1,2]){
      if(phase===2){await p.locator('#retry-button').click();await passive(p);}
      await p.evaluate(phase=>{const e=testRun.enemies[0];e.goddessPhase=phase;ForestSimulation.hit(testRun,testRun.hero,e,1e12,[],true,null,{critical:false,preMitigated:true,skipHitRoll:true});},phase);
      let previous=0;const times=[20,180,360,660,840,1020,1200,1350,1500,1700,1850,2000,2100],files=[];
      for(const time of times){await p.clock.runFor(time-previous);previous=time;const file=path.join(out,'return-p'+phase+'-'+time+'.png');await p.locator('#game-canvas').screenshot({path:file});files.push(file);}
      const pages=await Promise.all(files.map(f=>sharp(f).resize(768,432,{kernel:'nearest'}).ensureAlpha().raw().toBuffer()));
      const delays=times.map((t,i)=>i<times.length-1?times[i+1]-t:400);
      await sharp(Buffer.concat(pages),{raw:{width:768,height:432*pages.length,channels:4,pageHeight:432}}).gif({delay:delays,loop:0,dither:0,keepDuplicateFrames:true}).toFile(path.join(out,'return-p'+phase+'.gif'));
      captures.push({phase,times});await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>testRun.status),'victory');assert.equal(await p.locator('#result-title').innerText(),'勝利');
    }
    // Real continuous RAF playback at both speeds; save EVERY changed frame on light and dark backgrounds.
    await p.evaluate(async()=>{window.motionReview=[];for(const id of['floating','down','return']){const base='/assets/enemies/extradimensional-goddess/motions/'+id+'/',data=await(await fetch(base+'manifest.json')).json(),image=new Image();image.src=base+data.sheet;await image.decode();motionReview.push({id,data,image});}const c=document.createElement('canvas');c.id='motion-review';c.width=512;c.height=512;c.style='position:fixed;inset:0;z-index:99999;width:512px;height:512px';document.body.append(c);});
    for(const id of['floating','down','return'])for(const background of['#25283e','#eee7d8']){
      const count=await p.evaluate(id=>motionReview.find(c=>c.id===id).data.frames.length,id);
      for(let i=0;i<count;i++){await p.evaluate(({id,i,background})=>{const a=motionReview.find(c=>c.id===id),f=a.data.frames[i],ctx=document.getElementById('motion-review').getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,512);ctx.drawImage(a.image,f.x,f.y,f.width,f.height,0,0,512,512);},{id,i,background});await p.locator('#motion-review').screenshot({path:path.join(out,id+'-'+(background==='#25283e'?'dark':'light')+'-'+i+'.png')});}
    }
    await p.clock.resume();
    for(const id of['floating','down','return'])for(const speed of[1,.25]){
      const result=await p.evaluate(async({id,speed})=>{const a=motionReview.find(c=>c.id===id),ctx=document.getElementById('motion-review').getContext('2d'),seen=new Set();return new Promise(resolve=>{let start;function draw(now){start??=now;const age=(now-start)*speed,clock=age%a.data.durationMs,index=MotionPlayback.frameAt(a.data,clock),f=a.data.frames[index];seen.add(index);ctx.fillStyle='#25283e';ctx.fillRect(0,0,512,512);ctx.imageSmoothingEnabled=false;ctx.drawImage(a.image,f.x,f.y,f.width,f.height,0,0,512,512);if(age>=a.data.durationMs*(a.data.loop?2:1))resolve({seen:[...seen],count:a.data.frames.length});else requestAnimationFrame(draw);}requestAnimationFrame(draw);});},{id,speed});
      assert.equal(result.seen.length,result.count,id+' @ '+speed);playbacks.push({id,speed,...result});
    }
    await live.context.close();
    const mobile=await open({width:390,height:844},'reduce',D.freshSave());await mobile.page.screenshot({path:path.join(out,'top-mobile.png')});await mobile.context.close();
    const reduced=await open({width:390,height:844},'reduce');await reduced.page.locator('#start-button').click();await passive(reduced.page);await reduced.page.evaluate(()=>{const e=testRun.enemies[0];e.goddessPhase=2;ForestSimulation.hit(testRun,testRun.hero,e,1e12,[],true,null,{critical:false,preMitigated:true,skipHitRoll:true});});await reduced.page.clock.runFor(1350);await reduced.page.screenshot({path:path.join(out,'return-mobile-reduced.png')});await reduced.page.clock.runFor(1000);assert.equal(await reduced.page.evaluate(()=>testRun.status),'victory');await reduced.context.close();
    assert.deepEqual(errors,[]);writeAssetJson(path.join(out,'ui.json'),{status:'pass',playbacks,captures,errors});console.log('Goddess motion UI passed: 16 affected frames, all-frame light/dark captures, 1x/0.25x playback, both departures, cast/idle connection, desktop/mobile metadata and reduced motion.');
  }finally{await browser.close();await new Promise(r=>server.close(r));}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
