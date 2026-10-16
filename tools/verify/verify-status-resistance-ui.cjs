'use strict';
// Isolated save and ephemeral server; never changes the player's browser data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js'),G=P.Gem;
const output=path.resolve(__dirname,'../../output/status-resistance');
async function main(){
  fs.mkdirSync(output,{recursive:true});const server=require('../../server.cjs').createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    const seed=D.freshSave();seed.cleared=D.STAGES.map(s=>s.id);seed.gold=1e9;seed.autoMode='off';
    for(const c of Object.values(seed.progression.characters))c.xp=P.experience(100);
    for(const slot of ['weapon','armor'])seed.progression.characters.warrior[slot]=P.allGearTrees('warrior',slot).map(n=>n.id);
    for(const item of D.ITEMS.filter(i=>i.type!=='gem'))seed.inventory[item.id]=100000;
    for(let i=0;i<2;i++)P.addGem(seed,G.generate({rarity:'unique',family:'resistance',level:10,random:()=>.5}));
    P.addGem(seed,G.generate({rarity:'rare',family:'physical',level:1,random:()=>.5}));
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.addInitScript(({key,seed})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));},{key:D.SAVE_KEY,seed});
    await page.goto('http://127.0.0.1:'+server.address().port+'/');
    await page.locator('#start-button:not([disabled])').waitFor();
    const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
    await page.locator('[data-open=gems]').first().click();
    assert.match(await page.locator('[data-gem-instance="1"]').getAttribute('data-tip'),/状態異常抵抗 \+30%/);
    assert.ok(await page.locator('[data-gem-instance="1"] img').evaluate(el=>el.complete&&el.naturalWidth===128));
    for(const [id,slot]of [[1,'armor'],[2,'weapon']]){
      await page.locator('[data-gem-instance="'+id+'"]').click();await page.locator('[data-inventory-slot='+slot+']').click();
      await page.locator('[data-toggle-inventory-gem="'+id+'"]').click();
    }
    assert.ok(Math.abs(P.stats(await read(),'warrior').statusResistance-.51)<1e-12);
    await page.screenshot({path:path.join(output,'inventory-desktop.png')});
    await page.locator('[data-filter=gem-workshop]').click();
    await page.locator('[data-gem-craft-field=family]').selectOption('resistance');
    await page.locator('[data-gem-craft-field=level]').selectOption('10');
    await page.locator('[data-gem-craft]').click();assert.equal((await read()).gems.at(-1).family,'resistance');
    assert.match(await page.locator('.gem-craft-result').innerText(),/状態異常抵抗 \+30%/);
    await page.locator('[data-gem-craft-field=rarity]').selectOption('rare');
    assert.equal(await page.locator('[data-gem-craft-field=family] option[value=resistance]').count(),0);
    await page.locator('[data-gem-craft-field=rarity]').selectOption('unique');
    await page.locator('[data-gem-craft-field=family]').selectOption('resistance');
    await page.screenshot({path:path.join(output,'workshop-desktop.png')});
    await page.locator('#close-menu').click();await page.locator('[data-open=character]').first().click();
    const attr=page.locator('.attribute-grid>div').filter({hasText:'状態異常抵抗'});assert.match(await attr.innerText(),/51%/);
    await page.screenshot({path:path.join(output,'attributes-desktop.png')});
    await page.setViewportSize({width:390,height:900});
    assert.ok(await page.locator('#menu-content').evaluate(el=>el.scrollWidth<=el.clientWidth+2));
    await page.screenshot({path:path.join(output,'attributes-mobile.png')});
    await page.locator('#close-menu').click();await page.locator('[data-open=gems]').first().click();
    await page.locator('[data-filter=gem-workshop]').click();
    assert.ok(await page.locator('#menu-content').evaluate(el=>el.scrollWidth<=el.clientWidth+2));
    await page.screenshot({path:path.join(output,'workshop-mobile.png')});
    const snapshot=await read();await page.reload();await page.locator('#start-button:not([disabled])').waitFor();
    const restored=await read();
    assert.deepEqual(restored.gems,snapshot.gems);assert.ok(Math.abs(P.stats(restored,'warrior').statusResistance-.51)<1e-12);
    assert.deepEqual(errors,[]);console.log('PASS: unique craft/rare exclusion, icon, two-slot 51% resistance, save restoration and 1440/390px layout');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
