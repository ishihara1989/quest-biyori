'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT}=require('../lib/project-paths.cjs');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const out=path.join(ROOT,'output/goddess-repair');fs.mkdirSync(out,{recursive:true});
async function main(){
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[],playback=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 try{
  await page.clock.install();await page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/extradimensional-goddess-repair.html');await page.waitForFunction(()=>window.goddessRepairReview);
  assert.match(await page.locator('#status').innerText(),/7素材 \/ 31コマ/);
  if(process.argv.includes('--controls-only')){
   await page.click('#play');await page.selectOption('#clip','motions/down');await page.click('#restart');await page.click('#step');assert.match(await page.locator('#after-counter').innerText(),/^F2 /);
   await page.click('#restart');assert.match(await page.locator('#after-counter').innerText(),/^F1 /);await page.click('#play');await page.clock.runFor(400);assert.match(await page.locator('#after-counter').innerText(),/^F2 /);
   await page.evaluate(()=>window.goddessRepairReview.renderAt(850));assert.equal(await page.locator('#play').innerText(),'再生');assert.deepEqual(errors,[]);console.log('Controls passed: step, restart, pause/resume, QA pause label.');return;
  }
  const clips=await page.evaluate(()=>window.goddessRepairReview.catalog.map(c=>({id:c.id,kind:c.kind,frames:c.frames.map(f=>({index:f.index,ms:f.durationMs}))})));
  for(const clip of clips){
   await page.selectOption('#clip',clip.id);
   // Observe the live counter while the actual requestAnimationFrame playback runs.
   for(const speed of clip.kind==='component'?[1]:[1,.25]){
    await page.selectOption('#speed',String(speed));await page.click('#restart');
    await page.evaluate(()=>{window.seenRepairFrames=new Set();window.repairObserver?.disconnect();window.repairObserver=new MutationObserver(()=>window.seenRepairFrames.add(document.getElementById('after-counter').textContent.split(' / ')[0]));window.repairObserver.observe(document.getElementById('after-counter'),{childList:true,subtree:true,characterData:true});});
    await page.clock.runFor((clip.frames.reduce((s,f)=>s+f.ms,0)+100)/speed);
    const seen=await page.evaluate(()=>[...window.seenRepairFrames]);
    for(const f of clip.frames)assert(seen.includes('F'+f.index),clip.id+' F'+f.index+' at '+speed);
    playback.push({id:clip.id,speed,seen});
   }
   await page.evaluate(()=>window.goddessRepairReview.renderAt(0));await page.locator('.pair').screenshot({path:path.join(out,clip.id.replaceAll('/','-')+'.png')});
   // Resume live playback after deterministic screenshots.
   await page.click('#play');
  }
  await page.selectOption('#clip','motions/down');
  const states=[];
  for(const ms of [0,450,850,1200,1450,1650,1800,2000,2300]){
   const state=await page.evaluate(ms=>window.goddessRepairReview.renderAt(ms),ms);states.push({ms,...state});await page.locator('#stage').screenshot({path:path.join(out,'return-'+ms+'.png')});
  }
  assert.equal(states.find(s=>s.ms===1450).bodyAlpha,0);assert.equal(states.find(s=>s.ms===1800).portalVisible,false);assert.equal(states.find(s=>s.ms===2300).rewardVisible,false);
  // Confirm actual canvas pixels are exactly the unchanged background at the final state.
  const clean=await page.evaluate(async()=>{const im=new Image();im.src='/development/assets/extradimensional-goddess/v1/references/stage-throne-beyond-dimensions.png';await im.decode();const c=document.createElement('canvas');c.width=1024;c.height=576;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0,1024,576);const a=x.getImageData(0,0,1024,576).data,b=document.getElementById('stage').getContext('2d').getImageData(0,0,1024,576).data;return a.every((v,i)=>v===b[i]);});assert(clean,'Return overlays remain after end');
  for(const bg of ['check','light','dark']){await page.selectOption('#background',bg);await page.evaluate(()=>window.goddessRepairReview.renderAt(850));await page.screenshot({path:path.join(out,'review-'+bg+'.png'),fullPage:true});}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'review-narrow.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Narrow horizontal overflow');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'browser-qa.json'),JSON.stringify({date:'2026-10-15',clips:7,frames:31,playback,states,finalCanvasExactlyBackground:clean,errors},null,2)+'\n');
  console.log(JSON.stringify({clips:7,frames:31,playbackChecks:playback.length,finalCanvasExactlyBackground:clean,errors,output:'output/goddess-repair/'}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
