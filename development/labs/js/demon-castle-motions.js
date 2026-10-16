'use strict';
(async()=>{
 const base='/development/assets/demon-castle-motions/v2/',q=s=>document.querySelector(s),canvas=q('#canvas'),ctx=canvas.getContext('2d'),clips=new Map();
 const img=url=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Image failed: '+url));i.src=url;});
 const entries=await(await fetch(base+'review-index.json')).json();
 for(const e of entries){const url=base+e.manifest,m=await(await fetch(url)).json();clips.set(e.id,{...m,url,entry:e,images:await Promise.all(m.frames.map(f=>img(new URL(f.file,location.origin+url)))),duration:m.frames.reduce((s,f)=>s+f.durationMs,0)});}
 const backdrop=await img('/development/assets/mid-late-design/v1/demon-castle/background.png'),warrior=await img('/assets/warrior/idle-01.png');
 let current,elapsed=0,playing=true,manual=false,last=performance.now();
 function indexAt(c,t){let n=0;for(let i=0;i<c.frames.length;i++){n+=c.frames[i].durationMs;if(t<n)return i;}return c.frames.length-1;}
 function frame(){return indexAt(current,elapsed);}
 function select(id){current=clips.get(id);elapsed=0;playing=true;manual=false;q('#name').textContent=current.label;q('#loop').checked=current.loop;q('#loop').disabled=current.terminal;
  q('#frames').replaceChildren(...current.frames.map((f,i)=>{const b=document.createElement('button');b.textContent=i+1;b.dataset.frame=i;b.title=f.phase||String(i+1);b.onclick=()=>seek(current.frames.slice(0,i).reduce((s,f)=>s+f.durationMs,0),true);return b;}));
  q('#links').replaceChildren(...[['原画',new URL(current.frames[0].source,location.origin+current.url).href],['全コマ',base+current.entry.contact],['GIF',base+current.entry.gif]].map(([text,url])=>{const a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';return a;}));draw();}
 function seek(t,step=false){elapsed=Math.min(t,current.duration);playing=false;manual=step;draw();}
 function active(){return(current.events||[]).filter(e=>elapsed>=e.timeMs&&elapsed<e.timeMs+e.durationMs);}
 function draw(){if(!current)return;ctx.imageSmoothingEnabled=false;
  const bg=q('#background').value;ctx.fillStyle=bg==='light'?'#c0ccd6':'#1c1425';ctx.fillRect(0,0,960,540);if(bg==='castle')ctx.drawImage(backdrop,0,0,960,540);
  ctx.save();if(q('#flip').checked){ctx.translate(960,0);ctx.scale(-1,1);}
  const effect=current.motion==='effect',hidden=effect&&!current.loop&&!manual&&elapsed>=current.duration;
  if(effect){ctx.drawImage(warrior,330,255,160,160);if(!hidden){if(current.kind==='ring'){ctx.save();ctx.translate(486,410);ctx.scale(1,.3);ctx.drawImage(current.images[frame()],-256,-256);ctx.restore();}else ctx.drawImage(current.images[frame()],230,0);}}
  else{ctx.drawImage(warrior,330,255,160,160);ctx.drawImage(current.images[frame()],330,0);if(q('#effects').checked&&current.motion==='attack'&&['black-knight','demon-armored-soldier'].includes(current.enemy)){const fx=clips.get('effects/dark-slash'),at=current.frames[0].durationMs+current.frames[1].durationMs,dt=elapsed-at;if(fx&&dt>=0&&dt<fx.duration)ctx.drawImage(fx.images[indexAt(fx,dt)],210,0);}
   if(q('#effects').checked)for(const e of active()){const fx=clips.get(e.id);if(!fx)continue;const dt=elapsed-e.timeMs,t=Math.min(1,dt/e.durationMs),x=e.to?e.x+(e.to[0]-e.x)*t:e.x,y=e.to?e.y+(e.to[1]-e.y)*t:e.y,s=e.scale||1,a=e.anchor||[256,256];ctx.drawImage(fx.images[indexAt(fx,fx.loop?dt%fx.duration:dt)],x-a[0]*s,y-a[1]*s,512*s,512*s);}}
  ctx.restore();q('#status').textContent=(frame()+1)+' / '+current.frames.length+' · '+Math.round(elapsed)+' ms · '+(current.acceptedForIntegration?'素材検収済み':'検収中');
  for(const b of q('#frames').children)b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===frame()));
  for(const b of q('#clips').children)b.setAttribute('aria-pressed',String(b.dataset.clip===current.id));
 }
 q('#clips').replaceChildren(...entries.map(e=>{const b=document.createElement('button');b.textContent=e.label;b.dataset.clip=e.id;b.onclick=()=>select(e.id);return b;}));
 const groups=[['all','すべて'],...new Map(entries.filter(e=>e.enemy).map(e=>[e.enemy,e.label.split('・')[0]])).entries(),['effects','エフェクト']];
 q('#filter').replaceChildren(...groups.map(([value,text])=>{const o=document.createElement('option');o.value=value;o.textContent=text;return o;}));
 q('#filter').onchange=()=>{const group=q('#filter').value,match=e=>group==='all'||(e.enemy||'effects')===group;for(const b of q('#clips').children)b.hidden=!match(entries.find(e=>e.id===b.dataset.clip));if(!match(current.entry)){const first=entries.find(match);if(first)select(first.id);}};
 q('#replay').onclick=()=>{elapsed=0;playing=true;manual=false;draw();};q('#play').onclick=()=>{playing=!playing;manual=false;draw();};q('#next').onclick=()=>{const i=(frame()+1)%current.frames.length;seek(current.frames.slice(0,i).reduce((s,f)=>s+f.durationMs,0),true);};
 for(const id of ['background','effects','flip'])q('#'+id).onchange=draw;
 function tick(now){const dt=Math.min(now-last,100);last=now;if(playing&&current){elapsed+=dt*Number(q('#speed').value);if(elapsed>=current.duration){if(q('#loop').checked&&!current.terminal)elapsed%=current.duration;else{elapsed=current.duration;playing=false;}}}draw();requestAnimationFrame(tick);}
 select(entries[0].id);window.castleReview={select,seek,status:()=>({id:current.id,frame:frame(),elapsed,duration:current.duration,playing,terminal:current.terminal,loop:q('#loop').checked,active:q('#effects').checked?active():[]})};requestAnimationFrame(tick);
})().catch(e=>{document.querySelector('#status').textContent=e.message;console.error(e);});
