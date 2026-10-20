'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const {ROOT,developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const base=developmentAsset('reincarnation-goddess/arsenal-v1'),scenes={pulse:3300,laser:3500,missiles:4200,discs:3900,orbital:3500,'truck-rush':6500,'truck-cancel':5700,return:3300};
async function main(){
 const server=require('../../server.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage(),errors=[],playback=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.clock.install();await page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/reincarnation-goddess-arsenal.html');await page.waitForFunction(()=>window.reincarnationArsenalReview);
 for(const [id,duration]of Object.entries(scenes)){
  for(const speed of [1,.25]){
   await page.selectOption('#scene',id);await page.selectOption('#speed',String(speed));await page.click('#restart');if(await page.locator('#play').innerText()==='再生')await page.click('#play');
   await page.evaluate(()=>{window.seenPhases=new Set([document.getElementById('phase').textContent]);window.phaseObserver?.disconnect();window.phaseObserver=new MutationObserver(()=>window.seenPhases.add(document.getElementById('phase').textContent));window.phaseObserver.observe(document.getElementById('phase'),{subtree:true,childList:true,characterData:true});});
   await page.clock.runFor((duration+50)/speed);const phases=await page.evaluate(()=>[...window.seenPhases]);assert(phases.length>=(id==='truck-cancel'?5:id.startsWith('truck')||id==='return'?4:3),id+' incomplete sequence '+speed);playback.push({id,speed,phases});
  }
  const frames=[];for(let t=0;t<duration;t+=100){const data=await page.evaluate(([id,t])=>{window.reincarnationArsenalReview.renderAt(id,t);return document.getElementById('stage').toDataURL('image/png').split(',')[1];},[id,t]);frames.push(await sharp(Buffer.from(data,'base64')).resize(640,360,{kernel:'nearest'}).ensureAlpha().raw().toBuffer());}
  const file=path.join(base,'review',id+'-sequence.gif');
  await sharp(Buffer.concat(frames),{raw:{width:640,height:360*frames.length,channels:4,pageHeight:360}}).gif({delay:100,loop:0,dither:0,keepDuplicateFrames:true}).toFile(file);
  const m=await sharp(file,{animated:true}).metadata();assert.equal(m.pages,frames.length);
 }
 const thumbs=[];for(const[id,t]of [['truck-rush',2000],['truck-rush',4140],['truck-cancel',3100],['return',1300]]){const data=await page.evaluate(([id,t])=>{window.reincarnationArsenalReview.renderAt(id,t);return document.getElementById('stage').toDataURL('image/png').split(',')[1];},[id,t]);thumbs.push(await sharp(Buffer.from(data,'base64')).resize(640,360,{kernel:'nearest'}).png().toBuffer());}
 await sharp({create:{width:1280,height:720,channels:4,background:'#25283e'}}).composite(thumbs.map((input,i)=>({input,left:(i%2)*640,top:Math.floor(i/2)*360}))).png().toFile(path.join(base,'review/comedy-overview.png'));
 assert.deepEqual(errors,[]);writeAssetJson(path.join(base,'review/sequence-playback.json'),{date:'2026-10-20',playbackChecks:playback.length,playback,previewGifs:8,previewSampleMs:100,errors});console.log(JSON.stringify({playbackChecks:playback.length,previewGifs:8,errors}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
