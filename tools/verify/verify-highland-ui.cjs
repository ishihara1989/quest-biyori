'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),{chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),A=require('../balance/audit-balance.cjs'),C=require('../../public/js/combat/highland-combat.js');
const output=path.resolve(__dirname,'../../output/highland-implementation'),url=process.env.FOREST_TEST_URL||'http://127.0.0.1:4191/';fs.mkdirSync(output,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[],seed=A.referenceBuild(70,69).save;seed.selectedStage=70;seed.autoMode='off';seed.speed=1;
 async function pageFor(viewport={width:1440,height:1050}){const context=await browser.newContext({viewport}),page=await context.newPage();await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});await page.clock.install();await page.addInitScript(({key,seed})=>{localStorage.setItem(key,JSON.stringify(seed));let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.createRun;v.createRun=(...args)=>window.testRun=create(...args);}});},{key:D.SAVE_KEY,seed});return{context,page};}
 try{const live=await pageFor(),page=live.page;await page.goto(url);await page.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.equal(await page.locator('body').getAttribute('data-region'),'7');assert.equal(await page.locator('[data-party-character]').count(),6);await page.screenshot({path:path.join(output,'highland-ready.png')});
  await page.locator('[data-open=stages]').first().click();assert.equal(await page.locator('[data-stage-region]').count(),7);assert.ok(await page.locator('.stage-map').evaluate(e=>getComputedStyle(e).backgroundImage.includes('highland')));await page.screenshot({path:path.join(output,'highland-map.png')});await page.locator('#close-menu').click();
  await page.locator('[data-party-character=warrior]').click();await page.locator('[data-open=character]').first().click();await page.locator('[data-growth-tab=forge]').click();await page.locator('[data-forge-region="7"]').click();assert.equal(await page.locator('.growth-node[data-kind=weapon]').count(),100);await page.screenshot({path:path.join(output,'highland-forge.png')});await page.locator('#close-menu').click();
  await page.locator('#start-button').click();await page.clock.runFor(12000);assert.equal(await page.evaluate(()=>testRun.allies.length),5);await page.screenshot({path:path.join(output,'highland-combat.png')});
  let actions=0;
  for(const[type,rows]of Object.entries(C.ACTIONS))for(let index=0;index<rows.length;index++){
   const timing=await page.evaluate(({type,index})=>{const run=testRun;run.status='running';run.phase='combat';run.wave=run.stage.waves.length-1;run.projectiles=[];run.paladinFields=[];MikoCombat.clear(run);ShamanCombat.clear(run);NinjaCombat.clear(run,null,[]);HighlandCombat.clear(run);
    const e={...run.enemies[0],...ForestData.ENEMIES[type],id:'enemy-highland-preview',type,hp:1e9,maxHp:1e9,x:700,y:420,damage:1000,cooldown:1e9,attacks:index,stagger:0,controlKind:null,controlUntil:0,control:null,modifiers:[],highlandPlan:null,highlandRetreated:true,state:'idle',motion:'idle',time:0,flash:0};run.enemies=[e];
    [run.hero,...run.allies].forEach((a,i)=>Object.assign(a,{manualOnly:true,hp:1e9,maxHp:1e9,mp:1e9,maxMp:1e9,damage:0,baseDamage:0,x:420-i%2*90,y:385+Math.floor(i/2)*40,speed:0,cooldown:1e9,skill:1e9,warriorSkills:[],mageSkills:[],paladinSkills:[],warriorCast:null,mageCast:null,paladinCast:null,ninjaCast:null,shamanCast:null,mikoCast:null,state:'idle',motion:'idle',flash:0,poison:null,bleed:null,rootAnchor:null,hidden:false,invulnerable:false}));
    const api={state:(a,s,m=s)=>{a.state=s;a.motion=m;a.time=0;a.actionId='preview';},control:EnemyControl,attackPower:(_r,a)=>a.damage};HighlandCombat.start(run,e,run.hero,api,[]);e.cooldown=1e9;return{warn:e.highlandPlan.warn,duration:e.highlandPlan.duration};},{type,index});
   await page.clock.runFor(Math.max(100,timing.warn-150));if(['charge','venom','gust','pounce','ring'].includes(rows[index].motion))await page.screenshot({path:path.join(output,type+'-'+rows[index].motion+'-forecast.png')});await page.clock.runFor(450);if(['charge','venom','gust','pounce','ring'].includes(rows[index].motion))await page.screenshot({path:path.join(output,type+'-'+rows[index].motion+'-impact.png')});await page.clock.runFor(timing.duration+2000);assert.equal(await page.evaluate(()=>testRun.enemies[0].highlandPlan),null,type+'/'+rows[index].motion);actions++;
  }
  await page.locator('#pause-button').click();
  await page.evaluate(()=>{window.trotDraws=[];const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){const src=a[0]?.src;if(src?.includes('/assets/enemies/'))trotDraws.push({src,x:a[1],facing:Math.sign(this.getTransform().a)});return original.apply(this,a);};});
  let trotPoses=0;
  for(const type of ['horn-jackal','rock-horn-goat','storm-jackal','iron-horn','manticore']){
   const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../public/assets/enemies',type,'motions/move/manifest.json'),'utf8'));
   for(const facing of [-1,1])for(const time of [1,121,241,361,481,601,721,841]){
    await page.evaluate(({type,facing,time})=>{const e=testRun.enemies[0];Object.assign(e,ForestData.ENEMIES[type],{type,x:700,y:420,hp:1e9,maxHp:1e9,facing,time,state:'moving',motion:'move',highlandPlan:null,hurtUntil:0,z:0,flash:0});trotDraws.length=0;},{type,facing,time});
    await page.clock.runFor(20);const draw=await page.evaluate(type=>trotDraws.find(d=>d.src.endsWith(type+'-move.png')),type);
    assert.ok(draw,type+' move rendered');assert.equal(draw.x,manifest.frames[Math.floor(time/120)%6].x);assert.equal(draw.facing,-facing);trotPoses++;
    if(time===1)await page.screenshot({path:path.join(output,type+'-trot-'+(facing<0?'left':'right')+'.png')});
   }
   for(const motion of ['idle','hit',C.ACTIONS[type][0].motion]){
    await page.evaluate(motion=>{Object.assign(testRun.enemies[0],{state:motion,motion,time:0});trotDraws.length=0;},motion);await page.clock.runFor(20);
    assert.ok(await page.evaluate(({type,motion})=>trotDraws.some(d=>d.src.includes('/'+type+'/motions/'+motion+'/')),{type,motion}),type+' transition '+motion);
   }
  }
  assert.equal(await page.locator('img').evaluateAll(v=>v.filter(i=>i.complete&&!i.naturalWidth).length),0);await live.context.close();
  const mobile=await pageFor({width:390,height:844});await mobile.page.goto(url);await mobile.page.locator('#start-button:not([disabled])').waitFor({timeout:90000});assert.ok(await mobile.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.page.screenshot({path:path.join(output,'mobile.png')});await mobile.context.close();
  assert.deepEqual(errors,[]);const report={regionTabs:7,party:6,gearNodes:100,actions,trotPoses,trotDirections:2,trotLoop:'6 to 1 checked for each quadruped',trotTransitions:'idle, hit, attack',mobileWidth:390,errors,status:'passed'};writeAssetJson(path.join(output,'browser-qa.json'), report);console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
