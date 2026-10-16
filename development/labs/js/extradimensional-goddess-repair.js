'use strict';
(async () => {
  const base='/development/assets/extradimensional-goddess/repair-v2/',oldBase='/development/assets/extradimensional-goddess/first-pass-v1/',el=id=>document.getElementById(id);
  const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url);return r.json();};
  const [catalog,originals,notes]=await Promise.all([json(base+'review-index.json'),json(oldBase+'review-index.json'),json(base+'review-notes.json')]);
  const images=new Map();
  const stageUrl='/development/assets/extradimensional-goddess/v1/references/stage-throne-beyond-dimensions.png';
  await Promise.all([...new Set([stageUrl,...catalog.flatMap(c=>c.frames.map(f=>base+f.file)),...originals.filter(c=>catalog.some(n=>(n.id==='effects/goddess-return'?'effects/goddess-defeat':n.id)===c.id)).flatMap(c=>c.frames.map(f=>oldBase+f.file))])].map(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set(url,im);resolve();};im.onerror=()=>reject(Error(url));im.src=url;})));
  for(const c of catalog){const o=document.createElement('option');o.value=c.id;o.textContent=c.id;el('clip').append(o);}
  let selected=catalog.find(c=>c.id==='motions/down'),time=0,running=true,last=performance.now();
  const duration=c=>c.frames.reduce((n,f)=>n+f.durationMs,0);
  function frameAt(c,t){let sum=0;for(const f of c.frames){sum+=f.durationMs;if(t<sum)return f;}return c.frames.at(-1);}
  function paint(canvas,c,root,t){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;const f=frameAt(c,t),im=images.get(root+f.file),s=Math.min(canvas.width/im.width,canvas.height/im.height),a=f.registrationAnchor||[im.width/2,im.height/2];ctx.drawImage(im,canvas.width/2-a[0]*s,canvas.height/2-a[1]*s,im.width*s,im.height*s);return f.index;}
  function inspect(){el('clip').value=selected.id;el('contact').src=base+selected.contact;el('source').href=base+selected.sources.at(-1);el('gif').href=base+selected.gif;const n=notes[selected.id];el('issues').textContent=n.status+'\n'+n.findings.map(x=>'・'+x).join('\n');}
  function composite(t){
    const canvas=el('stage'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,576);ctx.imageSmoothingEnabled=false;ctx.drawImage(images.get(stageUrl),0,0,1024,576);
    const body=catalog.find(c=>c.id==='motions/down'),portal=catalog.find(c=>c.id==='effects/goddess-return'),halo=catalog.find(c=>c.id==='parts/halo');
    ctx.save();
    if(t<1000){ctx.globalAlpha=Math.max(0,1-t/1000);ctx.drawImage(images.get(base+halo.frames[0].file),650,110,360,360);}
    if(t<1800){ctx.globalAlpha=t<1650?1:Math.max(0,(1800-t)/150);const pf=frameAt(portal,t),im=images.get(base+pf.file),a=pf.registrationAnchor,s=620/im.width;ctx.drawImage(im,820-a[0]*s,320-a[1]*s,im.width*s,im.height*s);}
    const bodyAlpha=t<=1000?1:Math.max(0,(1450-t)/450);
    if(bodyAlpha>0){ctx.globalAlpha=bodyAlpha;ctx.drawImage(images.get(base+frameAt(body,t).file),640,150,360,375);}
    // One visual reward cue after the doorway is gone; this lab never awards inventory.
    const rewardAlpha=t<1800||t>=2200?0:Math.sin((t-1800)/400*Math.PI);
    if(rewardAlpha>0){ctx.globalAlpha=rewardAlpha;ctx.fillStyle='#89f2ff';ctx.strokeStyle='#ffe5a5';ctx.lineWidth=2;ctx.shadowColor='#8fdfff';ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(820,454);ctx.lineTo(830,470);ctx.lineTo(820,486);ctx.lineTo(810,470);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.restore();el('stage-counter').textContent=(t/1000).toFixed(2)+'s / '+(t<1000?'微笑み・会釈・手振り':t<1450?'本体が帰還':t<1800?'帰還口が閉じる':t<2200?'小さな報酬光':'消失完了');
    return {bodyAlpha,portalVisible:t<1800,rewardVisible:rewardAlpha>0};
  }
  function render(){const total=duration(selected),t=time%(total+500),old=originals.find(c=>c.id===(selected.id==='effects/goddess-return'?'effects/goddess-defeat':selected.id));el('after-counter').textContent='F'+paint(el('after'),selected,base,t)+' / '+selected.expectedFrames;if(old)el('before-counter').textContent='F'+paint(el('before'),old,oldBase,t/total*duration(old))+' / '+old.expectedFrames+(old.complete?'':'（欠落あり）');el('clock').textContent=(time/1000).toFixed(2)+'s';return composite(time%2600);}
  el('clip').onchange=()=>{selected=catalog.find(c=>c.id===el('clip').value);time=0;inspect();render();};
  el('restart').onclick=()=>{time=0;render();};el('play').onclick=()=>{running=!running;el('play').textContent=running?'一時停止':'再生';};
  el('step').onclick=()=>{running=false;el('play').textContent='再生';let sum=0;const t=time%(duration(selected)+500);for(const f of selected.frames){sum+=f.durationMs;if(sum>t+.5){time=sum;break;}}if(time>=duration(selected))time=0;render();};
  el('background').onchange=()=>{document.body.className=el('background').value;};
  el('status').textContent=`${catalog.length}素材 / ${catalog.reduce((n,c)=>n+c.frames.length,0)}コマ。素材の合格・本編採用は別判定。`;
  // QA uses the same render path as the visible controls and the live animation.
  window.goddessRepairReview={catalog,renderAt(ms){running=false;el('play').textContent='再生';time=ms;return render();},get selected(){return selected.id;}};
  function tick(now){if(running)time+=(now-last)*Number(el('speed').value);last=now;render();requestAnimationFrame(tick);}
  inspect();render();requestAnimationFrame(tick);
})().catch(e=>{document.getElementById('status').textContent='読込失敗: '+e.message;console.error(e);});
