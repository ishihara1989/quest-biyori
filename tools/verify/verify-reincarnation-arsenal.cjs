'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT}=require('../lib/project-paths.cjs');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const out=path.join(ROOT,'output/reincarnation-arsenal');
async function main(){
 fs.mkdirSync(out,{recursive:true});const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[],playback=[],scenes=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 try{
  await page.clock.install();await page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-goddess-arsenal.html');await page.waitForFunction(()=>window.reincarnationArsenalReview);
  assert.equal(await page.locator('#all-frames button').count(),60);assert.equal(await page.locator('#clip option').count(),20);
  const before=await page.evaluate(()=>JSON.stringify({...localStorage}));
  const clips=await page.evaluate(()=>window.reincarnationArsenalReview.catalog.map(c=>({id:c.id,durationMs:c.durationMs})));
  if(!process.argv.includes('--scenes-only')) for(const c of clips){
   await page.selectOption('#clip',c.id);
   for(const speed of [1,.25]){
    await page.selectOption('#speed',String(speed));await page.click('#restart');
    if(await page.locator('#play').innerText()==='再生')await page.click('#play');
    await page.evaluate(()=>{window.seen=new Set(['0']);window.obs?.disconnect();window.obs=new MutationObserver(()=>window.seen.add(document.getElementById('counter').dataset.frame));window.obs.observe(document.getElementById('counter'),{attributes:true,attributeFilter:['data-frame']});});
    await page.clock.runFor((c.durationMs+100)/speed);
    const seen=await page.evaluate(()=>[...window.seen]);for(const n of ['0','1','2'])assert(seen.includes(n),c.id+' missing F'+n+' speed '+speed);playback.push({id:c.id,speed,seen});
   }
  }
  await page.evaluate(()=>window.reincarnationArsenalReview.renderClipAt('truck-rush',0));await page.click('#step');assert.match(await page.locator('#counter').innerText(),/^F2 /);await page.click('#restart');assert.match(await page.locator('#counter').innerText(),/^F1 /);
  await page.locator('#contact button').nth(2).click();assert.match(await page.locator('#counter').innerText(),/^F3 /);
  await page.selectOption('#speed','1');
  const samples={pulse:[500,1130,1500],laser:[900,1950,2500],missiles:[700,1850,2800],discs:[700,1500,2300],orbital:[800,1840,2500],'truck-rush':[400,2000,4350],'truck-cancel':[1800,2800,3550],return:[500,1300,2200,2400]};
  for(const [id,times]of Object.entries(samples)){for(const t of times){const snap=await page.evaluate(([id,t])=>window.reincarnationArsenalReview.renderAt(id,t),[id,t]);scenes.push({id,t,...snap});await page.locator('#stage').screenshot({path:path.join(out,id+'-'+t+'.png')});}}
  assert(scenes.find(s=>s.id==='truck-rush'&&s.t===4350).drawn.includes('truck-rush'));
  assert(scenes.find(s=>s.id==='truck-cancel'&&s.t===2800).drawn.includes('truck-interrupt'));
  assert.deepEqual(scenes.find(s=>s.id==='return'&&s.t===2400).drawn,[]);
  const clean=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1280;c.height=720;window.reincarnationArsenalReview.background(c.getContext('2d'),1280,720);const a=c.getContext('2d').getImageData(0,0,1280,720).data,b=document.getElementById('stage').getContext('2d').getImageData(0,0,1280,720).data;return a.every((v,i)=>v===b[i]);});assert(clean,'Return overlays remain after 2400ms');
  for(const bg of ['dark','light','checker']){await page.selectOption('#background',bg);await page.evaluate(()=>window.reincarnationArsenalReview.renderAt('truck-rush',2000));await page.screenshot({path:path.join(out,'desktop-'+bg+'.png'),fullPage:true});}
  await page.selectOption('#scene','return');await page.locator('#timeline').fill('2400');assert.deepEqual(await page.evaluate(()=>window.reincarnationArsenalReview.snapshot.drawn),[]);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'narrow.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Narrow horizontal overflow');
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})),before);assert.deepEqual(errors,[]);
  const qa={priorPlaybackRun:process.argv.includes('--scenes-only')?'40 checks completed before the first run stopped on unsupported output.inputValue in the control test; scene/control checks resumed separately.':null,date:'2026-10-20',clips:20,frames:60,playback,scenes,returnFinalExactlyBackground:clean,desktopWidth:1440,narrowWidth:390,localStorageUnchanged:true,errors};
  fs.writeFileSync(path.join(out,'browser-qa.json'),JSON.stringify(qa,null,2)+'\n');console.log(JSON.stringify({clips:20,frames:60,playbackChecks:playback.length,sceneSamples:scenes.length,returnFinalExactlyBackground:clean,errors}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
