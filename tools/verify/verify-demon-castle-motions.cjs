'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const {ROOT,PUBLIC,inside,developmentAsset}=require('../lib/project-paths.cjs');
const root=developmentAsset('demon-castle-motions/v2'),out=path.join(ROOT,'output/demon-castle-motions/browser');
async function montage(file,inputs){const pics=await Promise.all(inputs.map(p=>sharp(p).resize(384,216,{kernel:'nearest'}).png().toBuffer()));await sharp({create:{width:1152,height:216*Math.ceil(pics.length/3),channels:4,background:'#1c1425'}}).composite(pics.map((input,i)=>({input,left:(i%3)*384,top:Math.floor(i/3)*216}))).png().toFile(file);}
async function main(){
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 try{
  // Serve unchanged local files at a virtual HTTP origin; Chrome hosts can block loopback.
  await page.route('**/*',async route=>{const u=new URL(route.request().url()),p=decodeURIComponent(u.pathname),base=p.startsWith('/development/')?ROOT:PUBLIC,f=path.resolve(base,'.'+p);if(!inside(base,f)||!fs.existsSync(f)||!fs.statSync(f).isFile())return route.fulfill({status:404,body:'Missing static file'});const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif'};await route.fulfill({status:200,contentType:types[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});});
  await page.clock.install();await page.goto('http://castle-review.local/development/labs/demon-castle-motions.html');await page.waitForFunction(()=>window.castleReview);await page.clock.pauseAt(await page.evaluate(()=>Date.now()+10));
  const qa=JSON.parse(fs.readFileSync(path.join(root,'qa.json'),'utf8')),requested=(process.argv.find(a=>a.startsWith('--ids='))||'').slice(6).split(',').filter(Boolean),clips=qa.clips.filter(c=>(!requested.length||requested.includes(c.id))&&(!process.argv.includes('--unreviewed')||!c.accepted));
  if(!clips.length){console.log(JSON.stringify({passed:true,clips:0,cached:qa.clips.length,reason:'No unreviewed clips'}));return;}const status=()=>page.evaluate(()=>window.castleReview.status());
  for(const clip of clips){
   await page.evaluate(id=>window.castleReview.select(id),clip.id);const name=clip.id.replaceAll('/','-'),frames=[];
   for(let i=0;i<clip.frames;i++){await page.locator('[data-frame="'+i+'"]').click();assert.equal((await status()).frame,i);frames.push(await page.locator('#canvas').screenshot());}await montage(path.join(out,name+'-frames.png'),frames);
   const playback={};for(const speed of ['1','0.25']){await page.locator('#speed').selectOption(speed);await page.locator('#replay').click();const duration=(await status()).duration,images=[await page.locator('#canvas').screenshot()],samples=[await status()];for(let n=0;n<8;n++){await page.clock.runFor(Math.ceil(duration/(8*Number(speed))));samples.push(await status());images.push(await page.locator('#canvas').screenshot());}assert.ok(samples.some(s=>s.frame>0));playback[speed]=samples;await montage(path.join(out,name+'-'+speed+'-playback.png'),images);}
   await page.locator('#speed').selectOption('1');await page.locator('#replay').click();await page.clock.runFor((await status()).duration+100);const after=await status();
   if(after.loop)assert.equal(after.playing,true);else{assert.equal(after.playing,false);assert.equal(after.frame,clip.frames-1);}
   if(after.terminal){assert.equal(await page.locator('#loop').isDisabled(),true);await page.clock.runFor(1500);assert.equal((await status()).frame,clip.frames-1);}
   await page.locator('#flip').check();await page.locator('#background').selectOption('light');await page.locator('[data-frame="0"]').click();await page.locator('#canvas').screenshot({path:path.join(out,name+'-light-flipped.png')});await page.locator('#flip').uncheck();await page.locator('#background').selectOption('castle');
   results.push({id:clip.id,fingerprint:clip.fingerprint,count:clip.frames,playback,after});
   console.log('Verified '+clip.id+' ('+clip.frames+' frames)');
  }
  for(const id of clips.map(c=>c.id).filter(id=>!id.startsWith('effects/'))){
   await page.evaluate(id=>window.castleReview.select(id),id);const manifest=JSON.parse(fs.readFileSync(path.join(root,'review',id,'manifest.json'),'utf8')),images=[];
   const times=[...new Set(manifest.events.flatMap(e=>[e.timeMs-1,e.timeMs,e.timeMs+Math.floor(e.durationMs/2),e.timeMs+e.durationMs]))].sort((a,b)=>a-b),capture=new Set(manifest.events.flatMap(e=>[e.timeMs,e.timeMs+Math.floor(e.durationMs/2)])),key=e=>[e.id,e.timeMs,e.slot??null].join(':');
   for(const time of times){await page.evaluate(t=>window.castleReview.seek(t),time);const expected=manifest.events.filter(e=>time>=e.timeMs&&time<e.timeMs+e.durationMs).map(key).sort();assert.deepEqual((await status()).active.map(key).sort(),expected,'Event boundary '+id+' '+time);if(capture.has(time))images.push(await page.locator('#canvas').screenshot());}
   if(images.length)await montage(path.join(out,id.replaceAll('/','-')+'-events.png'),images);
  }
  await page.locator('#filter').selectOption('effects');assert.equal(await page.locator('#clips button:visible').count(),qa.clips.filter(c=>c.id.startsWith('effects/')).length);await page.locator('#filter').selectOption('all');
  await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
  const signature=require('node:crypto').createHash('sha256').update(results.map(c=>c.fingerprint).join('')).digest('hex').slice(0,12),report='playback-'+signature+'.json';
  fs.writeFileSync(path.join(out,report),JSON.stringify({passed:true,scope:'selected library clips; runtime integration pending',clips:results,normalAndSlow:true,terminalHold:true,desktopAndMobile:true,errors},null,2)+'\n');console.log(JSON.stringify({passed:true,clips:results.length,frames:results.reduce((s,c)=>s+c.count,0),errors,out,report}));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
