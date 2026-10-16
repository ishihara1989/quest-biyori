'use strict';
(() => {
  const base='/development/assets/demon-god-redesign/v2/',q=s=>document.querySelector(s),ctx=q('#canvas').getContext('2d');
  ctx.imageSmoothingEnabled=false;
  let clips=[],current=null,images=[],effects={},background=null,target=null,time=0,playing=false,last=0,active=[];
  const bodyX=384,bodyY=10;
  const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);return r.json();};
  const img=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('画像読込失敗 '+url));im.src=url;});
  function frameAt(frames,t){let end=0;for(let i=0;i<frames.length;i++){end+=frames[i].durationMs;if(t<end)return i;}return frames.length-1;}
  const bodyDuration=()=>current.frames.reduce((n,f)=>n+f.durationMs,0);
  function totalDuration(){return Math.max(bodyDuration(),...(current.events||[]).map(e=>e.timeMs+effects[e.id].duration));}
  function drawEffect(event,elapsed) {
    const fx=effects[event.id];if(elapsed<0||elapsed>=fx.duration)return;
    const i=frameAt(fx.frames,elapsed),im=fx.images[i];active.push({id:event.id,slot:event.slot??0,timeMs:event.timeMs,frame:i});
    ctx.save();
    if(event.placement==='band') {
      // Reuse the intact beam, with its right-hand emitter pivot. No recoloring.
      const x=480,y=event.angle<0?180:145,scale=.88;
      ctx.translate(x,y);ctx.rotate((event.angle||0)*Math.PI/180);
      ctx.drawImage(im,-fx.pivot.x*scale,-fx.pivot.y*scale,im.width*scale,im.height*scale);
    } else if(event.placement==='ring') {
      ctx.drawImage(im,50,275,350,105);
    } else if(event.placement==='pillar') {
      const x=185+(event.slot||0)*100;ctx.drawImage(im,x-105,80,210,270);
    } else if(event.placement==='status') {
      ctx.drawImage(im,140,125,90,90);
    } else {
      ctx.drawImage(im,95,160,180,180);
    }
    ctx.restore();
  }
  function draw() {
    if(!current)return;
    ctx.clearRect(0,0,768,400);
    if(q('#background').checked&&background)ctx.drawImage(background,0,0,768,400);
    active=[];
    if(target)ctx.drawImage(target,104,194,160,160);
    // Ground effects stay behind the body; rays/impact/status are in front.
    if(q('#effects').checked)for(const e of current.events||[])if(['pillar','ring'].includes(e.placement))drawEffect(e,time-e.timeMs);
    const i=frameAt(current.frames,time);
    ctx.drawImage(images[i],bodyX,bodyY);
    if(q('#effects').checked)for(const e of current.events||[])if(!['pillar','ring'].includes(e.placement))drawEffect(e,time-e.timeMs);
    q('#phase').textContent=(i+1)+' / '+images.length+' '+current.frames[i].phase;
    q('#play').textContent=playing?'⏸':'▶';
    for(const b of q('#frames').children)b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===i));
  }
  function select(id) {
    const clip=clips.find(c=>c.id===id);if(!clip)throw Error('Unknown motion '+id);
    current=clip.manifest;images=clip.images;time=0;playing=true;last=0;
    q('#loop').checked=current.loop;q('#loop').disabled=current.terminal;
    for(const b of q('#motions').children)b.setAttribute('aria-pressed',String(b.dataset.motion===id));
    q('#frames').replaceChildren(...images.map((im,i)=>{const b=document.createElement('button');b.dataset.frame=i;b.title=current.frames[i].phase;const copy=im.cloneNode(),text=document.createElement('span');text.textContent=(i+1)+' '+current.frames[i].phase;b.append(copy,text);b.onclick=()=>seek(current.frames.slice(0,i).reduce((n,f)=>n+f.durationMs,0));return b;}));
    q('#reuse').replaceChildren(...[...new Set((current.events||[]).map(e=>e.id))].map(id=>{const a=document.createElement('a');a.href=current.effects[id].manifest;a.target='_blank';a.textContent='↗ '+effects[id].label;a.title=current.effects[id].use;return a;}));
    draw();
  }
  function seek(t){time=Math.max(0,Math.min(t,totalDuration()));playing=false;draw();}
  function advance(dt) {
    if(!playing||!current)return;
    time+=dt*Number(q('#speed').value);
    const duration=totalDuration();
    if(time>=duration){if(q('#loop').checked&&!current.terminal)time%=duration;else {time=duration;playing=false;}}
    draw();
  }
  function tick(now){const dt=last?now-last:0;last=now;advance(dt);requestAnimationFrame(tick);}
  q('#play').onclick=()=>{if(time>=totalDuration())time=0;playing=!playing;last=0;draw();};
  q('#replay').onclick=()=>{time=0;playing=true;last=0;draw();};
  function step(delta){const i=frameAt(current.frames,time),n=(i+delta+images.length)%images.length;seek(current.frames.slice(0,n).reduce((s,f)=>s+f.durationMs,0));}
  q('#previous').onclick=()=>step(-1);q('#next').onclick=()=>step(1);
  q('#background').onchange=draw;q('#effects').onchange=draw;
  async function boot() {
    const catalog=await json(base+'review-index.json');
    clips=await Promise.all(catalog.map(async c=>{const url=new URL(base+c.manifest,location.href);const manifest=await json(url);return {...c,manifest,images:await Promise.all(manifest.frames.map(f=>img(new URL(f.file,url))))};}));
    const defs=clips[0].manifest.effects;
    for(const [id,def] of Object.entries(defs)) {
      const url=new URL(def.manifest,location.href),m=await json(url);
      effects[id]={label:m.label||id,pivot:m.pivot||{x:m.frameWidth/2,y:m.frameHeight/2},frames:m.frames,duration:m.frames.reduce((n,f)=>n+f.durationMs,0),images:await Promise.all(m.frames.map(f=>img(new URL(f.file,url))))};
    }
    background=await img('/development/assets/mid-late-design/v1/demon-castle/background.png');
    target=await img('/assets/warrior/idle-01.png');
    q('#motions').replaceChildren(...clips.map(c=>{const b=document.createElement('button');b.textContent=c.label;b.dataset.motion=c.id;b.title=c.label;b.onclick=()=>select(c.id);return b;}));
    q('#summary').textContent='9モーション · 32コマ · 既存エフェクト6種';
    select('idle');requestAnimationFrame(tick);
    window.demonReview={select,seek,status:()=>({id:current.id,time,playing,frame:frameAt(current.frames,time),duration:totalDuration(),active,loop:q('#loop').checked,terminal:current.terminal})};
  }
  boot().catch(e=>{q('#error').textContent=e.message;q('#summary').textContent='読込失敗';});
})();
