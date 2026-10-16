'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const out=path.resolve(__dirname,'../../output/highland-motions/trot');
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install();
    await page.goto('http://127.0.0.1:4191/highland-motions.html?enemy=manticore&motion=move');
    await page.waitForFunction(()=>window.highlandReview?.entries.find(e=>e.enemy.id==='manticore')?.id==='move');
    const card=page.locator('[data-enemy=manticore]');
    assert.equal(await card.locator('select').inputValue(),'move');
    const m=await page.evaluate(()=>highlandReview.entries.find(e=>e.enemy.id==='manticore').asset.m);
    assert.equal(m.walkCycle.gait,'trot');assert.equal(m.walkCycle.status,'trial');
    assert.equal(m.frameCount,6);assert.equal(m.durationMs,720);
    for(let i=0;i<6;i++){
      await card.locator('.frames button').nth(i).click();
      assert.ok((await card.locator('.status').innerText()).startsWith((i+1)+'/6'));
      await card.screenshot({path:path.join(out,'frame-'+(i+1)+'.png')});
    }
    await card.locator('button[title="この動作を再生"]').click();
    const observed=[];
    // Sample the middle of each frame, away from requestAnimationFrame boundaries.
    await page.clock.runFor(60);
    for(let i=0;i<18;i++){
      observed.push((await card.locator('.status').innerText()).split(' · ')[0]);
      await page.clock.runFor(120);
    }
    assert.equal(new Set(observed).size,6);assert.deepEqual(observed.slice(0,6),observed.slice(6,12));
    assert.deepEqual(observed.slice(6,12),observed.slice(12,18));assert.deepEqual(errors,[]);
    writeAssetJson(path.join(out,'browser-qa.json'), {status:'passed',checks:['focused URL','six frame stepping','720ms cycle','three consecutive identical loop sequences','no page errors'],observed,errors});
    console.log(JSON.stringify({status:'passed',frames:6,loops:3,output:out}));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
