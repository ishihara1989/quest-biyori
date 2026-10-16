'use strict';
(() => {
 const base='/development/assets/volcano-motions/v2/',q=s=>document.querySelector(s),ctx=q('#canvas').getContext('2d');
 ctx.imageSmoothingEnabled=false;
 const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);return r.json();};
 const image=url=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('画像読込失敗 '+url));i.src=url;});
 let clips=[],current,background,target,time=0,playing=false,last=0,active=[],interruption=null,drawn=null;
 const effect=id=>clips.find(c=>c.id==='effects/'+id),body=motion=>clips.find(c=>c.enemy===current.enemy&&c.motion===motion);
 const frameAt=(model,t)=>MotionPlayback.frameAt(model,t);
 const lead=()=>q('#bridge').checked&&current.enemy?600:0;
 const committedEvents=()=>interruption?(current.events||[]).filter(e=>e.timeMs<=interruption.modelAt):current.events||[];
 const eventEnd=e=>e.timeMs+(e.placement==='projectile'?560:0)+(effect(e.impact||e.id)?.durationMs||0)+(e.residue?2000:0);
 function duration(){
  if(interruption)return Math.max(interruption.at+(body(interruption.kind)?.durationMs||400)+(interruption.kind==='hit'?800:0),...committedEvents().map(e=>lead()+eventEnd(e)));
  const bodyDuration=current.durationMs*(q('#bridge').checked&&current.loop?2:1);
  return lead()+Math.max(bodyDuration,...(current.events||[]).map(eventEnd))+(q('#bridge').checked&&current.enemy?800:0);
 }
 function pose(){
  if(interruption){
   const m=body(interruption.kind)||current,t=Math.max(0,time-interruption.at),idle=body('idle');
   if(interruption.kind==='hit'&&t>=m.durationMs)return{model:idle,frame:frameAt(idle,(t-m.durationMs)%idle.durationMs),phase:'returned'};
   return{model:m,frame:frameAt(m,Math.min(t,m.durationMs)),phase:m.terminal&&t>=m.durationMs?'hold':'interrupted'};
  }
  const idle=body('idle'),t=time-lead();
  if(q('#bridge').checked&&current.enemy){
   if(t<0)return{model:idle,frame:frameAt(idle,time%idle.durationMs),phase:'before'};
   const end=current.durationMs*(current.loop?2:1);
   if(t>=end&&!current.terminal)return{model:idle,frame:frameAt(idle,(t-end)%idle.durationMs),phase:'after'};
  }
  return{model:current,frame:frameAt(current,current.loop?Math.max(0,t)%current.durationMs:Math.max(0,t)),phase:'motion'};
 }
 function paintFX(id,elapsed,x,y,scale,loop=false){
  const fx=effect(id);if(!fx||elapsed<0||!loop&&elapsed>=fx.durationMs)return;
  const f=frameAt(fx,loop?elapsed%fx.durationMs:elapsed),pivot=fx.frames[f].pivot;
  ctx.drawImage(fx.images[f],x-pivot.x*scale,y-pivot.y*scale,fx.frameWidth*scale,fx.frameHeight*scale);
  active.push({id,frame:f,x,y,scale});
 }
 function origin(scale,bodyX,ground){
  const f=current.frames[2]||current.frames[0],b=f.visibleBounds||f.bounds,p=current.releaseOrigin||{x:b.left+(b.right-b.left)*.14,y:b.top+(b.bottom-b.top)*.45};
  return{x:bodyX+(p.x-f.pivot.x)*scale,y:ground+(p.y-f.pivot.y)*scale};
 }
 function draw(){
  if(!current)return;
  ctx.clearRect(0,0,1024,576);if(q('#background').checked)ctx.drawImage(background,0,0,1024,576);
  const scale=Number(q('#zoom').value),sample=pose(),model=sample.model,f=sample.frame,bodyX=710,ground=470;
  drawn={id:model.id,motion:model.motion,frame:f,phase:sample.phase};
  ctx.save();if(q('#flip').checked){ctx.translate(1024,0);ctx.scale(-1,1);}active=[];
  if(current.enemy&&target)ctx.drawImage(target,140,ground-142,142,142);
  const pivot=model.frames[f].pivot;
  if(!current.enemy)ctx.drawImage(model.images[f],512-pivot.x*scale,370-pivot.y*scale,model.frameWidth*scale,model.frameHeight*scale);
  else{
   ctx.drawImage(model.images[f],bodyX-pivot.x*scale,ground-pivot.y*scale,model.frameWidth*scale,model.frameHeight*scale);
   const emitter=origin(scale,bodyX,ground),modelTime=time-lead();
   if(q('#effects').checked)for(const e of committedEvents()){
    const dt=modelTime-e.timeMs;if(dt<0)continue;
    const tx=185+(e.slot||0)*65,ty=ground-(e.slot||0)*22;
    if(e.placement==='projectile'){
     const impactDuration=effect(e.impact)?.durationMs||0;
     if(dt<560){const p=dt/560,arc=e.id==='lava-bomb'?Math.sin(p*Math.PI)*100:0;paintFX(e.id,dt,emitter.x+(tx-emitter.x)*p,emitter.y+(ty-emitter.y)*p-arc,.55,true);}
     else if(dt<560+impactDuration)paintFX(e.impact,dt-560,tx,ty,.7);
     else if(e.residue&&dt<560+impactDuration+2000)paintFX(e.residue,dt-560-impactDuration,tx,ty,.7,true);
    }else paintFX(e.id,dt,e.placement==='origin'?emitter.x:e.placement==='self-ground'?bodyX:tx,e.placement==='origin'?emitter.y:ground,e.id==='fire-beam'?1.45:e.id==='fire-fan'?1.15:e.id==='fissure'?1.7:.85);
   }
  }
  ctx.restore();q('#phase').textContent=(f+1)+' / '+model.frames.length+' · '+Math.round(time)+'ms';q('#play').textContent=playing?'⏸':'▶';
  for(const b of q('#frames').children)b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===f&&model.id===current.id));
 }
 function seek(t){time=Math.max(0,Math.min(t,duration()));playing=false;draw();}
 function replay(){time=0;playing=true;last=0;interruption=null;draw();}
 function interrupt(kind='hit'){
  if(!current.enemy)return;
  interruption={kind,at:time,modelAt:time-lead()};playing=true;last=0;q('#loop').checked=false;draw();
 }
 function select(id){
  current=clips.find(c=>c.id===id);if(!current)throw Error('Unknown clip '+id);
  time=0;playing=true;last=0;interruption=null;q('#bridge').checked=false;q('#bridge').disabled=!current.enemy;
  q('#interrupt').disabled=!current.enemy;q('#defeat').disabled=!current.enemy;
  q('#loop').checked=current.loop;q('#loop').disabled=current.terminal;q('#subject').value=current.enemy||current.id;
  q('#reference').hidden=!current.reference;if(current.reference)q('#reference').src=new URL(current.reference,current.url);
  const group=current.enemy?clips.filter(c=>c.enemy===current.enemy):clips.filter(c=>!c.enemy);
  q('#motions').replaceChildren(...group.map(c=>{const b=document.createElement('button');b.dataset.motion=c.id;b.textContent=c.label;b.title=c.id;b.setAttribute('aria-pressed',String(c.id===id));b.onclick=()=>select(c.id);return b;}));
  q('#frames').replaceChildren(...current.images.map((im,i)=>{const b=document.createElement('button');b.dataset.frame=i;const copy=im.cloneNode(),label=document.createElement('span');label.textContent=(i+1)+' · '+current.frames[i].durationMs+'ms';b.append(copy,label);b.onclick=()=>{interruption=null;q('#bridge').checked=false;seek(current.frames.slice(0,i).reduce((s,f)=>s+f.durationMs,0));};return b;}));
  q('#links').replaceChildren(...[['原画',current.originalSources[0]],['マニフェスト','manifest.json'],['全コマ',base+current.contact]].map(([label,file])=>{const a=document.createElement('a');a.textContent='↗ '+label;a.href=file.startsWith('/')?file:new URL(file,current.url);a.target='_blank';return a;}));
  draw();
 }
 function step(d){const f=frameAt(current,time),n=(f+d+current.frames.length)%current.frames.length;interruption=null;q('#bridge').checked=false;seek(current.frames.slice(0,n).reduce((s,f)=>s+f.durationMs,0));}
 q('#previous').onclick=()=>step(-1);q('#next').onclick=()=>step(1);
 q('#play').onclick=()=>{if(time>=duration())replay();else{playing=!playing;last=0;draw();}};q('#replay').onclick=replay;
 q('#interrupt').onclick=()=>interrupt('hit');q('#defeat').onclick=()=>interrupt('down');q('#bridge').onchange=replay;
 for(const id of ['background','effects','flip','zoom'])q('#'+id).onchange=draw;
 q('#subject').onchange=()=>select(clips.find(c=>(c.enemy||c.id)===q('#subject').value).id);
 function tick(now){
  const dt=last?now-last:0;last=now;
  if(playing&&current){time+=dt*Number(q('#speed').value);if(time>=duration()){if(q('#loop').checked&&!current.terminal&&!interruption)time%=duration();else{time=duration();playing=false;}}draw();}
  requestAnimationFrame(tick);
 }
 async function boot(){
  const index=await json(base+'review-index.json');
  clips=await Promise.all(index.map(async c=>{const url=new URL(base+c.manifest,location.href),m=await json(url);return{...c,...m,url,images:await Promise.all(m.frames.map(f=>image(new URL(f.file,url))))};}));
  background=await image('/development/assets/mid-late-design/v1/volcano/background.png');target=await image('/assets/warrior/idle-01.png');
  const plan=await json(base+'plan.json'),qa=await json(base+'qa.json'),subjects=[...new Set(clips.map(c=>c.enemy||c.id))];
  q('#subject').replaceChildren(...subjects.map(id=>{const o=document.createElement('option');o.value=id;o.textContent=id.startsWith('effects/')?clips.find(c=>c.id===id).label:plan.enemies.find(e=>e.id===id).label;return o;}));
  q('#summary').textContent=(qa.complete?'':'制作中 · ')+clips.length+'素材 · '+clips.reduce((n,c)=>n+c.frames.length,0)+'コマ'+(qa.missing.length?' · 修正待ち '+qa.missing.length+'件':'');
  if(!clips.some(c=>!c.enemy)){q('#effects').checked=false;q('#effects').disabled=true;q('#effects').title='修正エフェクトは生成待ち';}
  select(clips[0].id);requestAnimationFrame(tick);
  window.volcanoReview={select,seek,interrupt,ids:()=>clips.map(c=>c.id),status:()=>({id:current.id,time,playing,frame:frameAt(current,current.loop?time%current.durationMs:time),drawn,frames:current.frames.length,motionDuration:current.durationMs,duration:duration(),active,loop:q('#loop').checked,terminal:current.terminal,events:current.events,interruption})};
 }
 boot().catch(e=>{q('#error').textContent=e.message;q('#summary').textContent='読込失敗';});
})();
