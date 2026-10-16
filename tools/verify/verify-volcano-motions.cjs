'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const {createServer}=require('../../server.cjs');
const {developmentAsset,ROOT,PUBLIC,inside}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2'),out=path.join(ROOT,'output/volcano-motions/browser');
async function montage(file,inputs,columns=3){const resized=await Promise.all(inputs.map(p=>sharp(p).resize(384,216,{kernel:'nearest'}).png().toBuffer()));await sharp({create:{width:384*columns,height:216*Math.ceil(inputs.length/columns),channels:4,background:'#201713'}}).composite(resized.map((input,i)=>({input,left:(i%columns)*384,top:Math.floor(i/columns)*216}))).png().toFile(file);}
async function main(){
 fs.mkdirSync(out,{recursive:true});const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const status=()=>page.evaluate(()=>window.volcanoReview.status());
 try{
  // Static review can run in hosts that deny even loopback HTTP to Chrome.
  // The real files are fulfilled unchanged at the same virtual HTTP origin.
  if(process.argv.includes('--offline-browser'))await page.route('**/*',async route=>{
   const url=new URL(route.request().url()),pathname=decodeURIComponent(url.pathname),base=pathname.startsWith('/development/')?ROOT:PUBLIC,file=path.resolve(base,'.'+pathname);
   if(!inside(base,file)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Missing static file'});
   const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.md':'text/plain'};
   await route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  await page.clock.install();await page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/volcano-motions.html');await page.waitForFunction(()=>window.volcanoReview);await page.clock.pauseAt(await page.evaluate(()=>Date.now()+10));
  const allIds=await page.evaluate(()=>window.volcanoReview.ids()),qa=JSON.parse(fs.readFileSync(path.join(root,'qa.json'),'utf8'));assert.equal(allIds.length,qa.clips.length);
  if(process.argv.includes('--complete')){assert.equal(qa.complete,true);assert.equal(allIds.length,62);}
  const requested=(process.argv.find(a=>a.startsWith('--ids='))||'').slice(6).split(',').filter(Boolean),ids=requested.length?allIds.filter(id=>requested.includes(id)):allIds;
  assert.ok(ids.length,'No requested clips');
  for(const id of ids){
   await page.evaluate(id=>window.volcanoReview.select(id),id);const count=(await status()).frames,frames=[],filename=id.replaceAll('/','-');
   for(let i=0;i<count;i++){await page.locator('[data-frame="'+i+'"]').click();assert.equal((await status()).frame,i);frames.push(await page.locator('#canvas').screenshot());}
   await montage(path.join(out,filename+'-frames.png'),frames);
   const playback={};
   for(const speed of ['1','0.25']){
    await page.locator('#speed').selectOption(speed);await page.locator('#replay').click();const duration=(await status()).duration,samples=[await status()],images=[await page.locator('#canvas').screenshot()];
    for(let n=0;n<8;n++){await page.clock.runFor(Math.ceil(duration/(8*Number(speed))));samples.push(await status());images.push(await page.locator('#canvas').screenshot());}
    assert.ok(samples.some(s=>s.frame>0),'Playback not advancing '+id+' '+speed);playback[speed]=samples;await montage(path.join(out,filename+'-'+speed+'-playback.png'),images);
   }
   if(id.endsWith('/move'))for(const [speed,samples]of Object.entries(playback))assert.equal(new Set(samples.map(s=>s.frame)).size,6,'Missing walk frame '+id+' '+speed);
   await page.locator('#speed').selectOption('1');await page.locator('#replay').click();await page.clock.runFor((await status()).duration+100);const after=await status();
   if(after.loop)assert.equal(after.playing,true);else{assert.equal(after.playing,false);assert.equal(after.frame,count-1);}
   if(after.terminal){assert.equal(await page.locator('#loop').isDisabled(),true);await page.clock.runFor(1500);assert.equal((await status()).frame,count-1);}
   await page.locator('#flip').check();await page.locator('#zoom').selectOption('0.55');await page.locator('[data-frame="0"]').click();await page.locator('#canvas').screenshot({path:path.join(out,filename+'-combat-flipped.png')});await page.locator('#flip').uncheck();await page.locator('#zoom').selectOption('1');
   results.push({id,count,playback,after,fingerprint:qa.clips.find(c=>c.id===id).fingerprint});
   console.log('Verified '+id+' ('+count+' frames)');
  }
  const transitions=[],releases=[],interruptions=[];
  for(const id of ids.filter(id=>!id.startsWith('effects/')&&!id.endsWith('/idle')&&!id.endsWith('/down'))){
   await page.evaluate(id=>window.volcanoReview.select(id),id);await page.locator('#bridge').check();
   await page.evaluate(()=>window.volcanoReview.seek(100));assert.equal((await status()).drawn.motion,'idle');
   await page.evaluate(()=>window.volcanoReview.seek(600));assert.equal((await status()).drawn.id,id);
   const s=await status();await page.evaluate(t=>window.volcanoReview.seek(t),600+s.motionDuration*(s.loop?2:1)+1);assert.equal((await status()).drawn.motion,'idle');
   transitions.push({id,before:true,after:true});
  }
  for(const id of ids.filter(id=>id.includes('/danger-'))){
   await page.evaluate(id=>window.volcanoReview.select(id),id);const events=(await status()).events||[];
   const captures=[];
   for(const e of events){
    await page.evaluate(t=>window.volcanoReview.seek(t),e.timeMs-100);captures.push(await page.locator('#canvas').screenshot());
    if(events.length>1)assert.equal((await status()).drawn.frame,1,'Missing recharge '+id);
    await page.evaluate(t=>window.volcanoReview.seek(t),e.timeMs+50);captures.push(await page.locator('#canvas').screenshot());assert.ok((await status()).active.some(f=>f.id===e.id),'Missing release FX '+id);
    if(e.placement==='projectile'){await page.evaluate(t=>window.volcanoReview.seek(t),e.timeMs+600);assert.ok((await status()).active.some(f=>f.id===e.impact),'Missing impact '+id);captures.push(await page.locator('#canvas').screenshot());
     if(e.residue){await page.evaluate(t=>window.volcanoReview.seek(t),e.timeMs+1200);assert.ok((await status()).active.some(f=>f.id===e.residue),'Missing residue '+id);captures.push(await page.locator('#canvas').screenshot());}}
   }
   await montage(path.join(out,id.replaceAll('/','-')+'-releases.png'),captures);releases.push({id,events});
   if(events.length)for(const time of [Math.round(events[0].timeMs/2),events[0].timeMs-1]){
    await page.evaluate(id=>window.volcanoReview.select(id),id);await page.evaluate(t=>{window.volcanoReview.seek(t);window.volcanoReview.interrupt('hit');},time);
    await page.evaluate(t=>window.volcanoReview.seek(t),time+800);assert.deepEqual((await status()).active,[],'Uncommitted FX survived '+id);assert.equal((await status()).drawn.motion,'idle');
    interruptions.push({id,time,reservedEffectsCleared:true,returned:true});
   }
   if(events.length){await page.evaluate(id=>window.volcanoReview.select(id),id);await page.evaluate(t=>{window.volcanoReview.seek(t);window.volcanoReview.interrupt('hit');},events[0].timeMs+50);assert.ok((await status()).active.some(f=>f.id===events[0].id),'Committed FX removed '+id);}
  }
  for(const enemy of ['lava-salamander','obsidian-soldier','young-fire-dragon','magma-salamander','obsidian-executioner','dragon-girl','dragon']){
   await page.evaluate(id=>window.volcanoReview.select(id),enemy+'/attack');await page.evaluate(()=>{window.volcanoReview.seek(50);window.volcanoReview.interrupt('down');window.volcanoReview.seek(10000);});
   assert.equal((await status()).drawn.motion,'down');assert.equal((await status()).drawn.frame,1);assert.deepEqual((await status()).active,[]);
   await page.locator('#canvas').screenshot({path:path.join(out,enemy+'-defeat-transition.png')});
  }
  await page.evaluate(()=>window.volcanoReview.select('lava-salamander/idle'));await page.locator('#play').click();await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  await page.locator('#background').uncheck();await page.locator('#next').click();assert.deepEqual(errors,[]);
  const report={passed:true,staticFilesFulfilled:process.argv.includes('--offline-browser'),scope:requested.length?'selected clips':qa.complete?'complete library':'available revised body motions only; remaining art and effect synchronization pending',clips:results,transitions,releases,interruptions,normalAndSlow:true,terminalHold:true,combatSizeAndFlip:true,desktopAndMobile:true,errors,missing:qa.missing};
  fs.writeFileSync(path.join(out,requested.length?'playback-selected.json':'playback.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,clips:results.length,frames:results.reduce((n,r)=>n+r.count,0),errors,remaining:qa.missing.length,out}));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
