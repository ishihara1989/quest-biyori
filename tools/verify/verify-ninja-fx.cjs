'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const output=path.resolve(__dirname,'../../output/ninja-fx'),url=process.env.FOREST_TEST_URL||'http://127.0.0.1:4191/';fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1050}});await page.clock.install();await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.addInitScript(()=>{globalThis.fxDraws=[];const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im?.src?.includes('/skills/ninja/effects/'))globalThis.fxDraws.push(im.src);return original.call(this,im,...args);};});
    await page.goto(url+'ninja-skill-lab.html?skill=thousand-shadow');await page.locator('#play:not([disabled])').waitFor();await page.locator('#rank').selectOption('5');
    const seek=async ms=>{await page.locator('#timeline').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},ms);await page.clock.runFor(20);};
    for(const [id,at,asset] of [['shadow-cross',680,'shadow-slash'],['paralysis-needles',470,'thunder-bloom'],['fuma-orbit',1100,'blade-vortex'],['shadow-prison',910,'shadow-eruption'],['eight-way-clones',920,'clone-sigil'],['thousand-shadow',3220,'thousand-bloom']]){
      await page.locator('[data-skill="'+id+'"]').click();await page.evaluate(()=>{globalThis.fxDraws=[];});await seek(at);
      assert.ok(await page.evaluate(id=>globalThis.fxDraws.some(src=>src.includes('/'+id+'/')),asset),id+' new VFX is not rendered');
      await page.screenshot({path:path.join(output,id+'.png')});await page.locator('#preview').screenshot({path:path.join(output,id+'-canvas.png')});
    }
    await page.locator('#flip').click();await page.locator('[data-skill=thousand-shadow]').click();await seek(3220);await page.locator('#preview').screenshot({path:path.join(output,'ultimate-left.png')});
    await page.locator('#restart').click();await page.locator('#speed').selectOption('.25');await page.locator('#play').click();await page.clock.runFor(16000);await page.locator('#play').click();assert.ok(Number(await page.locator('#preview').getAttribute('data-hits'))>=54);
    const damage=await page.locator('#preview').getAttribute('data-damage');await page.locator('#effects').uncheck();assert.equal(await page.locator('#preview').getAttribute('data-damage'),damage);await page.locator('#effects').check();
    await page.locator('#attack-speed').selectOption('10');await page.locator('[data-skill=thousand-shadow]').click();await seek(540);assert.ok(Number(await page.locator('#preview').getAttribute('data-hits'))>=54);await page.locator('#preview').screenshot({path:path.join(output,'ultimate-speed10.png')});
    await seek(2500);await page.locator('#preview').screenshot({path:path.join(output,'ultimate-cleared.png')});assert.equal(await page.locator('#preview').getAttribute('data-clones'),'0');
    // Main renderer's reduced-motion path also must load every generated sheet.
    await page.evaluate(async()=>{const fx=await NinjaSkillRenderer.load(),ctx=document.createElement('canvas').getContext('2d');ctx.canvas.width=1024;ctx.canvas.height=576;
      const events=['final-ring','prison','blade-vortex','lightning','smoke-in','shadow-dash'].map(kind=>({type:'ninja-effect',kind,skillId:kind==='smoke-in'?'eight-way-clones':'thousand-shadow',timeMs:0,x:520,y:420,radius:300,from:{x:240,y:438},phase:'pulse'}));NinjaSkillRenderer.backdrops(ctx,events,180,fx,true);NinjaSkillRenderer.impacts(ctx,events,180,fx,true);});
    assert.deepEqual(errors,[]);console.log(JSON.stringify({effects:6,frames:24,checks:'new sheets rendered; late skill playback; both facings; speed10; FX toggle; cleanup; reduced motion',screenshots:output}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
