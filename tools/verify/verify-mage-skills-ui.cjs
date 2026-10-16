'use strict';
const path=require('../lib/project-paths.cjs').assetPaths,fs=require('node:fs'),assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]}));
const M=require('../../public/js/skills/mage-skills.js'),D=require('../../public/js/data/forest-data.js'),P=require('../../public/js/core/forest-progression.js');
const output=path.resolve(__dirname,'../../output/mage-skills'),url=process.env.FOREST_TEST_URL||'http://127.0.0.1:4191/';fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.FOREST_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});await page.clock.install();
  async function seek(ms){await page.locator('#timeline').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},ms);await page.clock.runFor(100);assert.deepEqual(errors,[]);}
  async function shot(name){await page.screenshot({path:path.join(output,name+'.png')});}
  try{
    await page.goto(url+'mage-skill-lab.html');await page.locator('#play:not([disabled])').waitFor();assert.equal(await page.locator('[data-skill]').count(),21);assert.equal(await page.locator('#load-error').isVisible(),false,await page.locator('#load-error').textContent());
    for(const skill of M.ACTIVE){await page.locator('[data-skill="'+skill.id+'"]').click();const s=M.spec(skill.id);await seek(s.chant*.5);assert.equal(await page.locator('#preview').getAttribute('data-motion'),'chant');await seek(s.release+50);assert.equal(await page.locator('#preview').getAttribute('data-motion'),'cast-'+s.cast+'-hold');await seek(s.duration+100);assert.ok(Number(await page.locator('#preview').getAttribute('data-hits'))>0,skill.id);}
    for(const id of ['wind','chain','meteor','beam','prison','cosmos']){
      await page.locator('[data-skill="'+id+'"]').click();const s=M.spec(id),impact=M.hitTimes(s)[0]*s.duration;
      await seek(id==='chain'?impact+200:impact-80);await shot(id+'-release');await seek(impact+70);await shot(id+'-impact');
    }
    await page.locator('[data-skill=wind]').click();await page.locator('#rank').selectOption('5');assert.ok((await page.locator('#skill-stats').textContent()).includes('角度 95°'));
    await page.locator('#flip').click();await seek(M.spec('wind',5).release+60);await shot('wind-rank5-left');
    await page.locator('[data-enemy=boss]').click();await seek(M.spec('wind',5).duration);assert.ok(Number(await page.locator('#preview').getAttribute('data-hits'))>0);
    await page.locator('#effects').uncheck();await shot('no-effects');await page.locator('#effects').check();await page.setViewportSize({width:390,height:844});await shot('mobile');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.setViewportSize({width:1440,height:1050});
    const seed=D.freshSave();D.award(seed,4);seed.selectedStage=4;seed.autoMode='off';seed.progression.characters.mage.xp=P.experience(5);P.purchase(seed,'mage','skills','wind');
    await page.addInitScript(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:D.SAVE_KEY,save:seed});
    await page.addInitScript(()=>{globalThis.renderedMageSkills=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...args){if(img?.src?.includes('/skills/mage/')||img?.src?.includes('/mage/motions/'))globalThis.renderedMageSkills.push(img.src);return draw.call(this,img,...args);};});
    await page.goto(url+'game.html');await page.locator('#start-button:not([disabled])').waitFor();await page.locator('[data-select-mage]').click();await page.locator('[data-growth-tab=skills]').click();assert.equal(await page.locator('.growth-node[data-kind=skills]').count(),53);await shot('tree');
    await page.locator('[data-growth-node=wind]').click();await page.locator('.motion-link').waitFor();assert.ok((await page.locator('.motion-link').getAttribute('href')).includes('mage-skill-lab.html?skill=wind'));
    await page.locator('#close-menu').click();await page.locator('#start-button').click();await page.clock.runFor(7000);await shot('real-battle');
    const rendered=await page.evaluate(()=>[...new Set(globalThis.renderedMageSkills)]);for(const id of ['mage-chant.png','mage-cast-forward.png','mage-cast-forward-hold.png','arcane.png','arcane-impact.png'])assert.ok(rendered.some(src=>src.endsWith(id)),id);
    assert.deepEqual(errors,[]);console.log(JSON.stringify({spells:21,nodes:53,effects:15,screenshots:output,checks:'all spell casts and hits, five ranks, flip, bosses, effects toggle, mobile, tree and live battle'}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
