'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const out=path.resolve(__dirname,'../../output/highland-motions/trot-v2');
async function main(){
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1536,height:1050}});page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
    await page.goto('http://127.0.0.1:4191/manticore-trot-guide.html');await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
    assert.equal(await page.locator('.comparison canvas').count(),3);assert.equal(await page.locator('#legs input').count(),8);
    for(let i=0;i<6;i++){await page.locator('#frames button').nth(i).click();assert.ok((await page.locator('#phase').innerText()).startsWith((i+1)+'/6'));await page.locator('.comparison').screenshot({path:path.join(out,'frame-'+(i+1)+'.png')});}
    const before=await page.evaluate(()=>manticoreTrotGuide.model.frames(manticoreTrotGuide.config));
    await page.locator('input[data-leg=RH][data-param=amplitude]').fill('0');
    const after=await page.evaluate(()=>manticoreTrotGuide.model.frames(manticoreTrotGuide.config));
    for(let i=0;i<6;i++){for(const id of ['LF','RF','LH'])assert.deepEqual(before[i].legs[id],after[i].legs[id]);assert.ok(Math.abs(after[i].legs.RH.screen.paw.x-after[0].legs.RH.screen.paw.x)<1e-8);}
    await page.locator('#reset').click();assert.equal(await page.locator('input[data-leg=RH][data-param=amplitude]').inputValue(),'44');
    await page.locator('summary').click();await page.locator('#measure').check();await page.locator('#measure-leg').selectOption('RH');
    await page.locator('#new').click({position:{x:250,y:300}});
    const measured=await page.evaluate(()=>manticoreTrotGuide.measurements[6]?.RH);assert.ok(Number.isFinite(measured.x)&&Number.isFinite(measured.y));
    assert.match(await page.locator('#coordinates').innerText(),/実測/);
    await page.locator('#overlay').click();assert.equal(await page.locator('#overlay').getAttribute('aria-pressed'),'false');await page.locator('#overlay').click();
    await page.locator('#play').click();await page.clock.runFor(820);assert.equal(await page.locator('#play').innerText(),'⏸');
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);await download.saveAs(path.join(out,'exported-guide.json'));
    const exported=JSON.parse(fs.readFileSync(path.join(out,'exported-guide.json')));assert.equal(exported.frames.length,6);assert.equal(exported.config.legs.RH.amplitude,44);assert.deepEqual(exported.measurements[6].RH,measured);
    await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
    assert.deepEqual(errors,[]);writeAssetJson(path.join(out,'browser-qa.json'), {status:'passed',checks:['V1 V2 guide displayed','six frame stepping','per-leg independent amplitude editing','reset','target overlay','manual source-pixel measurement','replay','six-frame JSON export with measurements','390px layout','no page errors'],errors});
    console.log(JSON.stringify({status:'passed',checks:10,output:out}));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
