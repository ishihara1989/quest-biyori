'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const {createServer}=require('../../server.cjs'),D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js');
const output=path.resolve(__dirname,'../../output/museum-ui');
const browsingOnly=process.argv.includes('--browsing-only');
(async()=>{
  const server=createServer({development:false});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const errors=[];fs.mkdirSync(output,{recursive:true});
  async function setup(seed,reducedMotion='no-preference') {
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.addInitScript(({key,seed})=>{
      localStorage.setItem(key,JSON.stringify(seed));
      let sim;Object.defineProperty(window,'ForestSimulation',{configurable:true,get:()=>sim,set(value){sim=value;const create=value.createRun;value.createRun=(...args)=>{window.testRun=create(...args);return window.testRun;};}});
    },{key:D.SAVE_KEY,seed});
    await page.route(url+'/**', route=>{
      const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
      if(pathname==='/favicon.ico')return route.fulfill({status:204});
      const base=path.resolve(__dirname,'../../public'),file=path.resolve(base,'.'+(pathname==='/'?'/game.html':pathname)),relative=path.relative(base,file);
      if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file))return route.fulfill({status:404,body:'Missing'});
      const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif'};
      return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
    });
    await page.clock.install();await page.goto(url);await page.locator('#start-button:not([disabled])').waitFor();
    await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
    return {context,page};
  }
  const open=async page=>{await page.locator('.main-nav [data-open=museum]').click();await page.locator('.museum-filmstrip button').first().waitFor();};
  const ready=async page=>{await page.locator('.museum-message').waitFor({state:'hidden'});};
  const counter=page=>page.locator('.museum-counter').innerText();
  const button=(page,action)=>page.locator('[data-museum-action='+action+']');
  const read=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
  try {
    const {context,page}=await setup(D.freshSave());
    await page.locator('.main-nav [data-open=museum]').hover();assert.equal(await page.locator('#tooltip').innerText(),'資料館');
    await open(page);
    assert.equal(await page.locator('.museum-owners button:not(.locked)').count(),1);
    assert.equal(await page.locator('[data-museum-owner=mage]').count(),0);
    const before=await read(page);
    await button(page,'next').click();assert.equal(await counter(page),'2 / 4');
    await page.clock.runFor(1200);assert.equal(await counter(page),'2 / 4');
    await button(page,'previous').click();assert.equal(await counter(page),'1 / 4');
    await button(page,'previous').click();assert.equal(await counter(page),'4 / 4');
    await button(page,'next').click();assert.equal(await counter(page),'1 / 4');
    await page.locator('[data-museum-frame="2"]').click();assert.equal(await counter(page),'3 / 4');
    await page.locator('[data-museum-control=speed]').selectOption('2');await button(page,'replay').click();await page.clock.runFor(250);assert.equal(await counter(page),'2 / 4');
    await button(page,'loop').click();await page.clock.runFor(2000);assert.equal(await counter(page),'4 / 4');assert.equal(await button(page,'play').getAttribute('aria-label'),'再生');
    await page.locator('[data-museum-control=zoom]').selectOption('1.5');await button(page,'background').click();assert.equal(await page.locator('.museum-stage').getAttribute('data-background'),'light');
    await button(page,'background').click();assert.equal(await page.locator('.museum-stage').getAttribute('data-background'),'grid');
    await page.locator('[data-museum-kind=skill]').click();await ready(page);
    assert.equal(await page.locator('[data-museum-clip=skill-moon]').count(),0);
    await page.locator('[data-museum-side=enemy]').click();
    assert.equal(await page.locator('[data-museum-owner]').count(),0);
    assert.equal(await button(page,'play').isDisabled(),true);
    await page.screenshot({path:path.join(output,'locked-desktop.png')});
    assert.deepEqual(await read(page),before);
    await page.locator('#close-menu').click();
    await page.locator('.main-nav [data-open=skills]').click();await page.locator('[data-growth-node=renjin]').click();
    await page.locator('[data-museum-show=warrior][data-museum-skill=renjin]').click();assert.equal(await page.locator('#menu-title').innerText(),'資料館');
    await ready(page);
    await page.locator('#close-menu').click();await context.close();

    const seed=D.freshSave();seed.cleared=D.ALL_STAGES.map(s=>s.id);seed.autoMode='off';
    for(const c of Object.values(seed.progression.characters))c.xp=P.experience(100,0);
    const full=await setup(seed);const p=full.page;await open(p);
    assert.equal(await p.locator('.museum-owners button:not(.locked)').count(),6);
    const saved=await read(p);
    for(const job of Object.keys(P.CHARACTERS)) {
      await p.locator('[data-museum-owner='+job+']').click();await ready(p);
      await p.locator('[data-museum-kind=skill]').click();await ready(p);
      assert.equal(await p.locator('.museum-clips button:not(.locked)').count(),21);
      const lastSkill=P.SKILLS[job].filter(n=>n.kind==='active').at(-1);
      await p.locator('[data-museum-clip=skill-'+lastSkill.id+']').click();await ready(p);
      await button(p,'next').click();assert.match(await counter(p),/^2 \/ /);
      await p.locator('[data-museum-control=asset]').selectOption({index:(await p.locator('[data-museum-control=asset] option').count())-1});await ready(p);
    }
    await p.locator('[data-museum-owner=miko]').click();await ready(p);await p.locator('[data-museum-clip=skill-ember-fox]').click();await ready(p);
    assert.ok(await p.locator('[data-museum-control=asset] option').count()>=9);
    assert.ok((await p.locator('[data-museum-control=asset]').innerText()).includes('歩行'));
    await p.screenshot({path:path.join(output,'ally-desktop.png')});
    await p.locator('[data-museum-side=enemy]').click();await ready(p);
    assert.equal(await p.locator('.museum-owners button:not(.locked)').count(),require('../../public/assets/museum/index.json').owners.filter(o=>o.side==='enemy').length);
    for(const [region,enemy]of [[1,'treant'],[2,'hydra'],[3,'large-worm'],[4,'kraken'],[5,'ancient-titan'],[6,'sand-behemoth'],[7,'manticore'],[8,'ice-tusk-mammoth'],['special','dimensional-gate-giant']]) {
      await p.locator('[data-museum-control=region]').selectOption(String(region));await ready(p);
      await p.locator('[data-museum-owner='+enemy+']').click();await ready(p);
      await p.locator('[data-museum-kind=effect]').click();await ready(p);
      assert.ok(await p.locator('.museum-filmstrip button').count()>0);
      const frames=await p.locator('.museum-filmstrip button').count();
      await button(p,'next').click();assert.equal(await counter(p),Math.min(2,frames)+' / '+frames);
      await p.locator('[data-museum-kind=motion]').click();await ready(p);
    }
    await p.locator('[data-museum-control=region]').selectOption('special');await ready(p);
    await p.locator('[data-museum-owner=extradimensional-goddess]').click();await ready(p);
    assert.equal(await p.locator('[data-museum-clip=star-impact]').count(),0);
    assert.equal(await p.locator('.museum-clips button').count(),7);
    await p.locator('[data-museum-kind=effect]').click();await ready(p);
    for(const id of ['return','throne','halo','star-impact','snap-glint','homing-meteor','meteor-impact','rift-cut','celestial-wave']) {
      await p.locator('[data-museum-clip='+id+']').click();await ready(p);
      assert.ok(await p.locator('.museum-filmstrip button').count()>0);
      await button(p,'next').click();
    }
    assert.equal(await p.locator('[data-museum-clip=shot]').count(),0);
    await p.screenshot({path:path.join(output,'goddess-effects-desktop.png')});
    await p.locator('[data-museum-kind=motion]').click();await ready(p);
    await p.locator('[data-museum-control=region]').selectOption('8');await ready(p);await p.locator('[data-museum-owner=fenrir]').click();await ready(p);
    await p.locator('[data-museum-clip=howl]').click();await ready(p);await button(p,'replay').click();await p.clock.runFor(400);
    await p.screenshot({path:path.join(output,'enemy-desktop.png')});
    for(const width of [1024,768,390]) {
      await p.setViewportSize({width,height:900});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'page width '+width);
      assert.equal(await p.locator('#menu-content').evaluate(el=>el.scrollWidth<=el.clientWidth+2),true,'museum width '+width);
      await button(p,'next').click();assert.ok(await button(p,'play').isVisible());
      if(width===390)await p.screenshot({path:path.join(output,'museum-mobile.png')});
    }
    assert.deepEqual(await read(p),saved);
    // Closing the gallery stops its detached canvas, while battle time resumes.
    await p.evaluate(()=>window.museumCanvas=document.querySelector('.museum-canvas'));
    await p.locator('#close-menu').click();const closed=await p.evaluate(()=>museumCanvas.toDataURL());await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>museumCanvas.toDataURL()),closed);
    if(!browsingOnly) {
      await p.locator('#start-button').click();await p.clock.runFor(500);const elapsed=await p.evaluate(()=>testRun.elapsed);
      await open(p);await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>testRun.elapsed),elapsed);
      await p.locator('#close-menu').click();await p.clock.runFor(500);assert.ok(await p.evaluate(()=>testRun.elapsed)>elapsed);
    }
    await p.locator('.main-nav [data-open=museum]').click();await p.locator('#close-menu').click();await p.locator('.main-nav [data-open=inventory]').click();await p.clock.runFor(200);assert.equal(await p.locator('.museum').count(),0);
    await full.context.close();
    const reduce=await setup(D.freshSave(),'reduce');await open(reduce.page);assert.equal(await button(reduce.page,'play').getAttribute('aria-label'),'再生');await button(reduce.page,'next').click();assert.equal(await counter(reduce.page),'2 / 4');await reduce.context.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: recruitment and level visibility, encounter-based enemy visibility, all allies and regions, goddess effect classification, summon variants, playback/step/speed/loop/background, saved data, modal lifecycle, '+(browsingOnly?'':'battle pause/resume, ')+'desktop/mobile');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
