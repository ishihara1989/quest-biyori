'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const specs=require('../assets/swamp-specs.cjs'),root=path.resolve(__dirname,'../..'),out=path.join(root,'output/swamp');
const url=process.env.SWAMP_TEST_URL||'http://127.0.0.1:4191/';fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.SWAMP_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.clock.install();const shot=async name=>{const selector=page.url().includes('enemies.html')?'#stage':page.url().includes('stages.html')?'#forest-canvas':'.arena-panel';if(await page.locator(selector).count())await page.locator(selector).scrollIntoViewIfNeeded();return page.screenshot({path:path.join(out,name+'.png'),fullPage:false});};
  try{
    await page.goto(url+'enemies.html#giga-toad');await page.locator('#load-status[hidden]').waitFor({state:'attached'});
    assert.equal(await page.locator('[data-select-character]').count(),28);
    for(const enemy of specs.enemies){
      await page.locator('.character-tab[data-select-character="'+enemy.id+'"]').click();await page.locator('#load-status[hidden]').waitFor({state:'attached'});
      assert.equal(await page.locator('#motion-tabs button').count(),4+Object.keys(enemy.actions).length);
      for(const motion of ['idle','move','hit','down',...Object.keys(enemy.actions)]){
        await page.locator('#motion-tabs [data-motion="'+motion+'"]').click();await page.locator('#load-status[hidden]').waitFor({state:'attached'});
        const frames=enemy.id==='skeleton'&&motion==='move'?6:4;assert.equal(await page.locator('#filmstrip button').count(),frames);
        await page.locator('button[data-frame="2"]').click();assert.equal(await page.locator('#sprite').getAttribute('data-motion'),motion);assert.equal(await page.locator('#sprite').getAttribute('data-frame'),'2');
        if(enemy.id==='mud-hand'&&motion==='grab'){assert.equal(await page.locator('#sprite').getAttribute('data-rooted'),'true');await shot('mud-bind-preview');await page.locator('button[data-frame="0"]').click();assert.equal(await page.locator('#sprite').getAttribute('data-rooted'),'false');}
        if(['tongue','slam','dark-cast','breath'].includes(motion))await shot(enemy.id+'-'+motion);
        await page.locator('[data-direction="right"]').click();await page.locator('[data-direction="left"]').click();
      }
    }
    await page.goto(url+'effects.html');await page.locator('#status[hidden]').waitFor({state:'attached'});assert.equal(await page.locator('.effect-card').count(),JSON.parse(fs.readFileSync(path.join(root,'public/assets/effects/index.json'),'utf8')).length);
    await page.goto(url+'stages.html?stage=poison-swamp');await page.locator('#stage-select:not([disabled])').waitFor();await page.clock.runFor(100);
    assert.equal(await page.locator('#forest-canvas').getAttribute('data-stage'),'poison-swamp');assert.equal(await page.locator('.forest-asset').count(),2);
    assert.equal(await page.locator('#forest-y').getAttribute('min'),'323');assert.equal(await page.locator('#forest-y').getAttribute('max'),'512');await page.locator('#forest-grid').check();
    for(const y of [323,512]){await page.locator('#forest-y').evaluate((input,value)=>{input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));},y);await page.clock.runFor(100);assert.equal(await page.locator('#forest-y-value').textContent(),String(y));await shot('swamp-stage-y'+y);}
    await page.locator('#forest-camera').evaluate(input=>{input.value='1023';input.dispatchEvent(new Event('input',{bubbles:true}));});await page.clock.runFor(100);await shot('swamp-stage-mirror-join');
    await page.locator('#stage-select').selectOption('starting-forest');await page.locator('#forest-canvas[data-stage="starting-forest"]').waitFor();assert.match(await page.locator('#stage-manifest').getAttribute('href'),/starting-forest/);
    await page.locator('#stage-select').selectOption('poison-swamp');await page.locator('#forest-canvas[data-stage="poison-swamp"]').waitFor();assert.match(await page.locator('#stage-prompt').getAttribute('href'),/poison-swamp/);
    await page.goto(url+'swamp.html#mud-hand');await page.locator('#play:not([disabled])').waitFor();await page.locator('#load-status[hidden]').waitFor({state:'attached'});
    assert.equal(await page.locator('#battle').getAttribute('data-stage'),'poison-swamp');assert.equal(await page.locator('#battle').getAttribute('height'),'576');
    assert.equal(await page.locator('#enemy-tabs button').count(),7);await page.locator('#repeat').uncheck();
    await page.locator('#attack-special').click();await page.clock.runFor(450);assert.equal(await page.locator('#battle').getAttribute('data-rooted'),'true');
    const position=await page.locator('#battle').getAttribute('data-hero-x');await page.locator('#battle').press('ArrowRight');await page.clock.runFor(1000);assert.equal(await page.locator('#battle').getAttribute('data-hero-x'),position);await shot('mud-bind-battle');
    await page.clock.runFor(1400);assert.equal(await page.locator('#battle').getAttribute('data-rooted'),'false');assert.notEqual(await page.locator('#battle').getAttribute('data-hero-x'),position);
    for(const [id,windup,next,ms] of [['mud-giant','windup','slam',1700],['lich','chant','dark-cast',2050],['hydra','charge','breath',2220]]){
      await page.locator('[data-enemy="'+id+'"]').click();await page.locator('#battle[data-enemy="'+id+'"]').waitFor();
      await page.locator('#attack-special').click();await page.clock.runFor(200);assert.equal(await page.locator('#battle').getAttribute('data-motion'),windup);await shot(id+'-windup');
      await page.clock.runFor(ms-200);assert.equal(await page.locator('#battle').getAttribute('data-motion'),next);await shot(id+'-battle');
    }
    await page.locator('#down').click();await page.clock.runFor(1400);assert.equal(await page.locator('#battle').getAttribute('data-motion'),'down');await shot('hydra-down');
    await page.locator('#reset').click();await page.locator('#battle[data-status="running"]').waitFor();
    await page.setViewportSize({width:390,height:844});await shot('mobile');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('#play').click();const motion=await page.locator('#battle').getAttribute('data-motion');await page.clock.runFor(1000);assert.equal(await page.locator('#battle').getAttribute('data-motion'),motion);
    assert.deepEqual(errors,[]);console.log(JSON.stringify({enemies:7,motions:43,effects:9,backgroundLayers:2,checks:'all motions, stepping, flip, effect previews, root/release, windups, terminal defeat, pause, mobile, forest/swamp switch and contact lane extremes',screenshots:out}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
