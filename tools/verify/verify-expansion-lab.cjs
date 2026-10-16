'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {chromium}=require(require.resolve('playwright',{paths:[__dirname,bundled]})),{enemies}=require('../assets/expansion-specs.cjs');
const output=path.resolve(__dirname,'../../output/expansion');fs.mkdirSync(output,{recursive:true});
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const selectedIds=process.argv.filter(a=>a.startsWith('--enemy=')).map(a=>a.slice(8));
assert.ok(selectedIds.every(id=>enemies.some(e=>e.id===id)),'Unknown enemy selection');
const selection=selectedIds.length?enemies.filter(e=>selectedIds.includes(e.id)):enemies;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),context=await browser.newContext({viewport:{width:1440,height:1080}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});const url=process.env.FOREST_TEST_URL||'http://127.0.0.1:4191/';let count=0;
  try{await page.clock.install();await page.goto(url+'enemies.html#'+selection[0].id);
    for(const e of selection){const base=path.resolve(__dirname,'../../public/assets/enemies',e.id,'motions'),defs=read(path.join(base,'index.json'));
      for(const d of defs){const m=read(path.join(base,d.id,'manifest.json'));await page.evaluate(hash=>location.hash=hash,e.id+'/'+d.id);
        await page.locator('.character-tab[data-select-character="'+e.id+'"][aria-pressed="true"]').waitFor();await page.locator('#motion-tabs [data-motion="'+d.id+'"][aria-pressed="true"]:not([disabled])').waitFor();await page.locator('#load-status').waitFor({state:'hidden'});
        assert.equal(await page.locator('#filmstrip button[data-frame]').count(),m.frameCount);
        for(let i=0;i<m.frameCount;i++){await page.locator('#filmstrip button[data-frame="'+i+'"]').click();assert.equal(await page.locator('#sprite').getAttribute('data-frame'),String(i));if(d.id==='bite'&&['cave-worm','large-worm'].includes(e.id))await page.locator('#sprite').screenshot({path:path.join(output,e.id+'-bite-frame'+i+'-lab.png')});}
        await page.locator('[data-direction="right"]').click();await page.locator('[data-direction="left"]').click();
        await page.locator('#restart').click();if(await page.locator('#play-label').textContent()!=='一時停止')await page.locator('#play-toggle').click();await page.clock.runFor(m.durationMs*2+100);
        assert.equal(await page.locator('#sprite').getAttribute('data-motion'),m.loop||m.terminal?d.id:'idle');
        if(d.id==='bite'&&['cave-worm','large-worm'].includes(e.id)){
          await page.locator('#bridge-idle').check();await page.locator('#restart').click();
          await page.clock.runFor(100);assert.equal(await page.locator('#sprite').getAttribute('data-motion'),'idle');
          await page.clock.runFor((m.transitions.idleLeadInMs??600)-100+50);assert.equal(await page.locator('#sprite').getAttribute('data-motion'),'bite');
          await page.clock.runFor(m.durationMs);assert.equal(await page.locator('#sprite').getAttribute('data-motion'),'idle');
          await page.locator('#bridge-idle').uncheck();
        }
        if(d.id==='idle'||d.id==='rest'||d.id==='shell'){await page.locator('#filmstrip button[data-frame="0"]').click();await page.locator('#sprite').screenshot({path:path.join(output,e.id+'-'+d.id+'-lab.png')});}count++;
      }
    }
    for(const id of ['echo-cave','sunlit-coast']){const tab=await context.newPage();tab.on('pageerror',e=>errors.push(e.message));await tab.goto(url+'stages.html?stage='+id);await tab.locator('#stage-select:not([disabled])').waitFor();assert.match(await tab.locator('#stage-name').textContent(),id==='echo-cave'?/洞窟/:/海岸/);assert.equal(await tab.locator('.forest-asset:visible').count(),id==='echo-cave'?1:2);await tab.screenshot({path:path.join(output,id+'-layers.png')});await tab.close();}
    assert.deepEqual(errors,[]);console.log('Verified '+count+' enemy motions: frame stepping, loops, return/hold, mirror, worm idle/attack/idle transitions, generated effects and both stage layers.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
