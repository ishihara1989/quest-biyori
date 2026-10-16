'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const {createServer}=require('../../server.cjs');
const output=path.resolve(__dirname,'../../output/demon-god-redesign');
async function main(){
  fs.mkdirSync(output,{recursive:true});
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
  async function timeline(name,inputs) {
    const sampled=await Promise.all(inputs.map(input=>sharp(input).resize(320,167,{kernel:'nearest'}).png().toBuffer()));
    await sharp({create:{width:960,height:501,channels:4,background:'#16101e'}}).composite(sampled.map((input,i)=>({input,left:(i%3)*320,top:Math.floor(i/3)*167}))).png().toFile(path.join(output,name+'.png'));
  }
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  try {
    await page.clock.install();await page.goto('http://127.0.0.1:'+server.address().port+'/development/labs/demon-god-redesign.html');
    await page.waitForFunction(()=>window.demonReview);
    await page.clock.pauseAt(await page.evaluate(()=>Date.now()+10));
    assert.equal(await page.locator('#motions button').count(),9);
    const ids=await page.locator('#motions button').evaluateAll(bs=>bs.map(b=>b.dataset.motion));
    const status=()=>page.evaluate(()=>window.demonReview.status());
    for(const id of ids){
      await page.locator('[data-motion="'+id+'"]').click();
      const count=await page.locator('#frames button').count(),frames=[];
      assert.equal(count,['hit','down'].includes(id)?2:4);
      for(let i=0;i<count;i++){
        await page.locator('[data-frame="'+i+'"]').click();assert.equal((await status()).frame,i);
        frames.push(await page.locator('#canvas').screenshot());
      }
      const dimensions=await sharp(frames[0]).metadata();
      await sharp({create:{width:dimensions.width*count,height:dimensions.height,channels:4,background:'#16101e'}}).composite(frames.map((input,i)=>({input,left:i*dimensions.width,top:0}))).png().toFile(path.join(output,id+'-frames.png'));
      await page.locator('#speed').selectOption('1');await page.locator('#replay').click();
      const cycle=(await status()).duration,normal=[await status()],normalImages=[await page.locator('#canvas').screenshot()];
      for(let n=0;n<8;n++){await page.clock.runFor(Math.ceil(cycle/8));normal.push(await status());normalImages.push(await page.locator('#canvas').screenshot());}
      await timeline(id+'-normal-playback',normalImages);
      await page.locator('#speed').selectOption('0.25');await page.locator('#replay').click();
      const slow=[await status()],slowImages=[await page.locator('#canvas').screenshot()];
      for(let n=0;n<8;n++){await page.clock.runFor(Math.ceil(cycle/2));slow.push(await status());slowImages.push(await page.locator('#canvas').screenshot());}
      await timeline(id+'-slow-playback',slowImages);
      assert.ok(normal.some(s=>s.frame>0),'Normal playback did not advance '+id);
      assert.ok(slow.some(s=>s.frame>0),'Slow playback did not advance '+id);
      const end=(await status()).duration;
      await page.locator('#speed').selectOption('1');await page.locator('#replay').click();await page.clock.runFor(end+200);
      const after=await status();
      if(['idle','move'].includes(id))assert.equal(after.playing,true);
      else{assert.equal(after.playing,false);assert.equal(after.frame,count-1);}
      if(id==='down'){assert.equal(await page.locator('#loop').isDisabled(),true);await page.clock.runFor(2000);assert.equal((await status()).frame,1);}
      results.push({id,count,normal,slow,after});
    }
    // Event boundaries: the second punch/pillar/band must not appear early.
    await page.evaluate(()=>window.demonReview.select('danger-1'));
    await page.evaluate(()=>window.demonReview.seek(599));assert.equal((await status()).active.length,0);
    await page.evaluate(()=>window.demonReview.seek(600));assert.equal((await status()).active.length,1);
    await page.evaluate(()=>window.demonReview.seek(1500));assert.equal((await status()).active.length,1);
    await page.evaluate(()=>window.demonReview.select('danger-2'));
    const pillars=[];for(const t of [840,1740,2640]){await page.evaluate(t=>window.demonReview.seek(t),t);pillars.push((await status()).active.filter(x=>x.id==='demon-pillar'));}
    assert.deepEqual(pillars.map(p=>p.map(x=>x.slot)),[[-1],[0],[1]]);
    await page.evaluate(()=>window.demonReview.select('danger-4'));
    const bands=[];for(const t of [1100,2100]){await page.evaluate(t=>window.demonReview.seek(t),t);bands.push((await status()).active.filter(x=>x.id==='end-cross'));await page.locator('#canvas').screenshot({path:path.join(output,'cross-'+t+'.png')});}
    assert.equal(bands[0].length,1);assert.equal(bands[1].length,1);assert.equal(bands[1][0].timeMs-bands[0][0].timeMs,1000);
    await page.evaluate(()=>window.demonReview.select('idle'));await page.locator('#play').click();
    await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
    await page.locator('#effects').uncheck();await page.locator('#background').uncheck();await page.locator('#next').click();
    assert.equal((await status()).active.length,0);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'playback.json'),JSON.stringify({passed:true,motions:results,eventBoundaries:{pillars,bands},errors},null,2)+'\n');
    console.log(JSON.stringify({passed:true,motions:results.length,frames:results.reduce((n,r)=>n+r.count,0),normalAndSlow:true,terminalHold:true,eventBoundaries:true,desktopAndMobile:true,errors,output}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
