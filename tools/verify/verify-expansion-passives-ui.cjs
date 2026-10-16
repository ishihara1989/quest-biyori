'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js');
const output=path.resolve(__dirname,'../../output/expansion-passives');fs.mkdirSync(output,{recursive:true});
const seed=D.freshSave();seed.cleared=Array.from({length:50},(_,i)=>i+1);seed.autoMode='off';seed.progression.selected='ninja';
for(const c of Object.values(seed.progression.characters))c.xp=P.experience(100);
const url=process.env.FOREST_TEST_URL||'http://127.0.0.1:4191/';
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  const saved=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),D.SAVE_KEY);
  const select=node=>page.locator('[data-growth-node="'+node+'"][data-kind=skills]').click();
  try{
    await page.clock.install();await page.addInitScript(({key,seed})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));},{key:D.SAVE_KEY,seed});
    await page.goto(url+'game.html');await page.locator('#start-button:not([disabled])').waitFor();await page.locator('[data-open=skills]').first().click();
    for(const id of ['warrior','mage','paladin','ninja','shaman','miko']){
      await page.locator('[data-character='+id+']').click();await page.locator('[data-tree-reset]').click();
      assert.equal(await page.locator('.skill-tree .growth-node.passive').count(),11);assert.equal(await page.locator('.skill-tree .growth-node.enhancement').count(),21);
      assert.equal(await page.locator('.skill-tree img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)),true);
      const nodes=P.SKILLS[id],passive=nodes.find(n=>n.kind==='passive').id,active=nodes.find(n=>n.kind==='active').id,upgrade=active+'-enhance';
      await select(passive);assert.equal(await page.locator('.motion-link').count(),0);await page.locator('[data-buy-node="'+passive+'"]').click();
      assert.equal(P.rank(await saved(),id,passive),1);assert.equal(await page.locator('.tree-point>b').textContent(),'99');
      await page.locator('.node-detail-text').hover();assert.ok((await page.locator('#tooltip').textContent()).includes('攻撃力 +5% / Lv'));
      for(const node of nodes.filter(n=>Object.keys(n.effect).some(k=>k.endsWith('Percent')))){
        await select(node.id);await page.locator('.node-detail-text').hover();
        assert.ok((await page.locator('#tooltip').textContent()).includes(node.note));
      }
      await select(upgrade);assert.equal(await page.locator('[data-buy-node="'+upgrade+'"]').isDisabled(),true);
      await select(active);await page.locator('[data-buy-node="'+active+'"]').click();await select(upgrade);
      for(let i=0;i<3;i++)await page.locator('[data-buy-node="'+upgrade+'"]').click();
      assert.equal(P.rank(await saved(),id,upgrade),3);assert.equal(await page.locator('.tree-point>b').textContent(),'95');
      await page.screenshot({path:path.join(output,id+'-desktop.png')});
      await select(active);await page.locator('[data-decrease-skill="'+active+'"]').click();assert.equal(P.rank(await saved(),id,upgrade),0);
      assert.equal(await page.locator('.tree-point>b').textContent(),'99');await select(passive);await page.locator('[data-decrease-skill="'+passive+'"]').click();
      assert.equal(await page.locator('.tree-point>b').textContent(),'100');
      await page.setViewportSize({width:900,height:720});await page.screenshot({path:path.join(output,id+'-compact.png')});await page.setViewportSize({width:1440,height:1050});
    }
    await page.reload();await page.locator('#start-button:not([disabled])').waitFor();
    for(const id of ['warrior','mage','paladin','ninja','shaman','miko'])assert.equal(P.points(await saved(),id),100);
    for(const id of ['ninja','shaman']){
      await page.goto(url+id+'-skill-lab.html');await page.locator('#play:not([disabled])').waitFor();
      const before=await page.locator('#skill-stats').textContent();await page.locator('#enhance').selectOption('5');const after=await page.locator('#skill-stats').textContent();
      assert.notEqual(after,before);assert.ok(!/NaN|Infinity/.test(after));await page.screenshot({path:path.join(output,id+'-normal-enhanced.png')});
    }
    assert.deepEqual(errors,[]);console.log('All six passive trees: icons, purchases, tooltips, dependent refunds, save reload and compact layout verified.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
