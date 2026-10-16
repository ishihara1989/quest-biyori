'use strict';
window.MuseumUI = {
  create({save,container,icon,reduced}) {
    const L=MuseumLibrary, D=ForestData, cache=new Map();
    const visibleOwners = () => catalog.owners.filter(o => L.unlocked(save,o));
    const visibleClips = o => o ? o.clips.filter(c => c.kind===kind && L.unlocked(save,o,c)) : [];
    let catalog,root,owner,clip,asset,model,sheet,version=0,raf,last,time=0,playing=!reduced;
    let side='ally',region='all',kind='motion',speed=1,zoom=1,background='dark',loop=true,assetIndex=0;
    const $=s=>root.querySelector(s);
    const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error('資料を読み込めません ('+r.status+')');return r.json();};
    const image=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('画像を読み込めません'));im.src=url;});
    function stop() {version++;cancelAnimationFrame(raf);last=undefined;root=null;model=null;sheet=null;}
    function condition(o,c) {return L.condition(o,c,D.stageLabel);}
    async function load(a) {
      const key=a.manifest||a.image||a.procedural+':'+a.id;
      if(!cache.has(key))cache.set(key,(async()=>{
        if(a.procedural) {await RiftRenderer.load();const duration=a.phase==='shattering'||a.effect==='shatter'?1500:a.phase==='closing'?650:900;const count=6;return {model:{frameCount:count,frameWidth:420,frameHeight:420,durationMs:duration,frameSequence:Array.from({length:count},(_,i)=>i),frames:Array.from({length:count},()=>({durationMs:duration/count}))}};}
        if(a.image) {const im=await image(a.image),count=a.rotate?8:1;return {sheet:im,model:{frameCount:count,frameWidth:im.width,frameHeight:im.height,durationMs:800,frameSequence:Array.from({length:count},(_,i)=>i),pivot:{x:im.width/2,y:im.height/2},frames:Array.from({length:count},()=>({x:0,y:0,width:im.width,height:im.height,durationMs:800/count}))}};}
        const m=await json(a.manifest),url=new URL(m.sheet,new URL(a.manifest,location.href));
        m.frameCount ??= m.frames.length;
        return {model:m,sheet:await image(url.href)};
      })().catch(e=>{cache.delete(key);throw e;}));
      return cache.get(key);
    }
    function toolbar() {
      return '<div class="museum-transport" role="group" aria-label="再生操作">'+
        '<button data-museum-action="replay" title="最初から再生" aria-label="最初から再生">↺</button><button data-museum-action="previous" title="前のコマ" aria-label="前のコマ">│◁</button><button data-museum-action="play" title="再生 / 一時停止" aria-label="再生">▶</button><button data-museum-action="next" title="次のコマ" aria-label="次のコマ">▷│</button>'+
        '<output class="museum-counter">— / —</output><select data-museum-control="speed" aria-label="再生速度">'+[.25,.5,1,2].map(n=>'<option value="'+n+'"'+(n===speed?' selected':'')+'>'+n+'×</option>').join('')+'</select>'+
        '<select data-museum-control="zoom" aria-label="表示倍率">'+[1,1.5,2].map(n=>'<option value="'+n+'"'+(n===zoom?' selected':'')+'>'+n+'× 拡大</option>').join('')+'</select><button data-museum-action="background" title="背景を切り替え" aria-label="背景を切り替え">◐</button><button data-museum-action="loop" title="ループ再生" aria-label="ループ再生" aria-pressed="'+loop+'">↻</button></div>';
    }
    function renderOwners() {
      const owners=visibleOwners().filter(o=>o.side===side&&(side==='ally'||region==='all'||String(o.region)===region));
      $('.museum-owners').innerHTML=owners.map(o=>{const open=L.unlocked(save,o);return '<button data-museum-owner="'+o.id+'" aria-pressed="'+(o===owner)+'" title="'+esc(open?o.label:condition(o))+'" aria-label="'+esc(o.label+(open?'':' · '+condition(o)))+'" class="'+(open?'':'locked')+'">'+(open?'<img src="'+o.image+'" alt="">':icon('lock'))+'<span>'+esc(o.label)+'</span></button>';}).join('');
      $('.museum-count').textContent=String(owners.length);
    }
    function renderClips() {
      const kinds=owner?[['motion','モーション'],[owner.side==='ally'?'skill':'effect',owner.side==='ally'?'スキル':'エフェクト']]:[];
      if(!kinds.some(([k])=>k===kind))kind='motion';
      $('.museum-kinds').innerHTML=kinds.map(([k,label])=>'<button data-museum-kind="'+k+'" aria-pressed="'+(k===kind)+'">'+(k==='motion'?icon('play'):icon('spark'))+label+'</button>').join('');
      const clips=visibleClips(owner);
      $('.museum-clips').innerHTML=clips.length?clips.map(c=>{const open=L.unlocked(save,owner,c);return '<button data-museum-clip="'+c.id+'" aria-pressed="'+(c===clip)+'" class="'+(open?'':'locked')+'" title="'+esc(open?c.label:condition(owner,c))+'">'+(open&&c.icon?'<img src="'+c.icon+'" alt="">':icon(open?(kind==='motion'?'play':'spark'):'lock'))+'<span>'+esc(c.label)+'</span>'+(c.unlockLevel?'<small>Lv.'+c.unlockLevel+'</small>':'')+'</button>';}).join(''):'<p class="museum-empty">展示なし</p>';
    }
    async function selectClip(c,index=0) {
      const ticket=++version;cancelAnimationFrame(raf);last=undefined;clip=c;assetIndex=index;asset=c?.assets[index];model=null;sheet=null;time=0;
      renderClips();
      $('.museum-view-title').textContent=owner?owner.label+(c?' · '+c.label:''):'';
      $('.museum-duration').textContent='';
      $('.museum-variants').innerHTML=c&&L.unlocked(save,owner,c)?'<select data-museum-control="asset" aria-label="表示する素材">'+c.assets.map((a,i)=>'<option value="'+i+'"'+(i===index?' selected':'')+'>'+esc(a.label)+'</option>').join('')+'</select>':'';
      $('.museum-filmstrip').replaceChildren();
      $('.museum-message').hidden=false;
      $('.museum-message').textContent=!owner?'展示なし':!c?'展示なし':'読込中';
      controls();clear();
      if(!c||!L.unlocked(save,owner,c)||!asset)return;
      try {
        const loaded=await load(asset);if(!root||ticket!==version)return;
        model=loaded.model;sheet=loaded.sheet;$('.museum-message').hidden=true;
        for(let i=0;i<model.frames.length;i++) {
          const b=document.createElement('button');b.dataset.museumFrame=i;b.title=(i+1)+'コマ目 · '+Number(model.frames[i].durationMs.toFixed(2))+'ms';b.setAttribute('aria-label',(i+1)+'コマ目');
          const canvas=document.createElement('canvas');canvas.width=96;canvas.height=80;stamp(canvas,i);const label=document.createElement('span');label.textContent=i+1;b.append(canvas,label);$('.museum-filmstrip').append(b);
        }
        controls();draw();raf=requestAnimationFrame(tick);
      } catch(e) {if(root&&ticket===version){$('.museum-message').textContent=e.message;$('.museum-message').append(document.createElement('br'));const b=document.createElement('button');b.dataset.museumAction='retry';b.textContent='再読込';$('.museum-message').append(b);controls();}}
    }
    function selectOwner(o) {owner=o;kind=kind==='effect'&&side==='ally'||kind==='skill'&&side==='enemy'?'motion':kind;renderOwners();return selectClip(visibleClips(o)[0]);}
    function clear() {const canvas=$('.museum-canvas');canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);$('.museum-counter').textContent='— / —';}
    function stamp(canvas,index) {
      const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
      if(asset.procedural) {
        ctx.save();const scale=Math.min(canvas.width/700,canvas.height/500);ctx.translate(canvas.width/2,canvas.height*.85);ctx.scale(scale,scale);
        const sample=model.frames.slice(0,index).reduce((s,f)=>s+f.durationMs,0);
        if(asset.procedural==='gate')RiftRenderer.gate(ctx,{x:0,y:0,height:300,gateTier:asset.tier,gatePhase:asset.phase,gateClock:sample,specialId:asset.specialId},sample,false);
        else RiftRenderer.effect(ctx,{kind:asset.effect,tier:asset.tier,x:0,y:0,specialId:asset.specialId},sample,false);
        ctx.restore();return;
      }
      const f=model.frames[index],scale=Math.min((canvas.width-40)/f.width,(canvas.height-30)/f.height)*(canvas.classList.contains('museum-canvas')?zoom:1);
      // Center the full frame rectangle, including transparent effect margins.
      const w=f.width*scale*(asset.rotate?.7:1),h=f.height*scale*(asset.rotate?.7:1);
      ctx.save();ctx.translate(canvas.width/2,canvas.height/2);if(asset.rotate)ctx.rotate(index*Math.PI/4);
      ctx.drawImage(sheet,f.x,f.y,f.width,f.height,Math.round(-w/2),Math.round(-h/2),w,h);ctx.restore();
    }
    function draw() {
      if(!root||!model)return;
      const index=L.sequence(model)[L.positionAt(model,time)];stamp($('.museum-canvas'),index);
      $('.museum-counter').textContent=(index+1)+' / '+model.frameCount;
      $('.museum-duration').textContent=Number((model.durationMs/1000).toFixed(2))+' 秒';
      $('.museum-filmstrip').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    }
    function controls() {
      const b=$('[data-museum-action="play"]');b.textContent=playing?'⏸':'▶';b.setAttribute('aria-label',playing?'一時停止':'再生');
      for(const b of root.querySelectorAll('.museum-transport button,.museum-transport select'))b.disabled=!model;
    }
    function tick(now) {
      if(!root)return;
      if(playing&&!document.hidden) {time+=last?Math.min(100,now-last)*speed:0;if(time>=model.durationMs){if(loop)time%=model.durationMs;else{time=model.durationMs-.001;playing=false;controls();}}draw();}
      last=document.hidden?undefined:now;raf=requestAnimationFrame(tick);
    }
    function click(event) {
      const b=event.target.closest('button');if(!b||b.disabled)return;
      if(b.dataset.museumSide) {side=b.dataset.museumSide;region='all';root.querySelectorAll('[data-museum-side]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('.museum-region').hidden=side==='ally';$('.museum-region').value='all';selectOwner(visibleOwners().find(o=>o.side===side));}
      else if(b.dataset.museumOwner)selectOwner(visibleOwners().find(o=>o.id===b.dataset.museumOwner));
      else if(b.dataset.museumKind) {kind=b.dataset.museumKind;selectClip(visibleClips(owner)[0]);}
      else if(b.dataset.museumClip)selectClip(visibleClips(owner).find(c=>c.id===b.dataset.museumClip));
      else if(b.hasAttribute('data-museum-frame')) {playing=false;time=L.timeAt(model,L.sequence(model).indexOf(Number(b.dataset.museumFrame)));controls();draw();}
      else if(b.dataset.museumAction) {
        const action=b.dataset.museumAction;
        if(action==='retry'){selectClip(clip,assetIndex);return;}
        if(action==='play'){playing=!playing;if(time>=model.durationMs-.001)time=0;last=undefined;}
        if(action==='replay'){time=0;playing=true;last=undefined;}
        if(action==='previous'||action==='next'){playing=false;time=L.step(model,time,action==='next'?1:-1);}
        if(action==='loop'){loop=!loop;b.setAttribute('aria-pressed',String(loop));}
        if(action==='background'){background={dark:'light',light:'grid',grid:'dark'}[background];$('.museum-stage').dataset.background=background;}
        controls();draw();
      }
    }
    function change(event) {
      const key=event.target.dataset.museumControl;
      if(key==='region') {region=event.target.value;const o=visibleOwners().find(o=>o.side===side&&(region==='all'||String(o.region)===region));selectOwner(o);}
      if(key==='asset')selectClip(clip,Number(event.target.value));
      if(key==='speed'){speed=Number(event.target.value);last=undefined;}
      if(key==='zoom'){zoom=Number(event.target.value);draw();}
    }
    async function mount(focus) {
      stop();const ticket=version;container.innerHTML='<div class="museum-loading" role="status">読込中</div>';
      try {catalog=catalog||await json('/assets/museum/index.json');if(ticket!==version)return;
        root=document.createElement('section');root.className='museum';root.setAttribute('aria-label','資料館');
        if(focus?.owner) {owner=visibleOwners().find(o=>o.id===focus.owner)||owner;side=owner?.side||side;region='all';}
        root.innerHTML='<div class="museum-top"><div role="group" aria-label="展示の種類"><button data-museum-side="ally" aria-pressed="'+(side==='ally')+'">'+icon('user')+'味方</button><button data-museum-side="enemy" aria-pressed="'+(side==='enemy')+'">'+icon('sword')+'敵</button></div><select class="museum-region" data-museum-control="region" aria-label="敵の地域"'+(side==='ally'?' hidden':'')+'><option value="all">全地域</option>'+D.REGIONS.filter(r=>visibleOwners().some(o=>o.side==='enemy'&&o.region===r.id)).map(r=>'<option value="'+r.id+'"'+(String(r.id)===region?' selected':'')+'>'+r.name+'</option>').join('')+(visibleOwners().some(o=>o.side==='enemy'&&o.region==='special')?'<option value="special"'+(region==='special'?' selected':'')+'>次元の裂け目</option>':'')+'</select><span class="museum-count"></span></div><div class="museum-owners" role="group" aria-label="展示対象"></div>'+
          '<div class="museum-layout"><div class="museum-player"><div class="museum-view-heading"><strong class="museum-view-title"></strong><span class="museum-duration"></span></div><div class="museum-stage" data-background="'+background+'"><canvas class="museum-canvas" width="800" height="500" aria-label="選択したモーション・エフェクト" role="img"></canvas><div class="museum-message" role="status"></div></div>'+toolbar()+'<div class="museum-variants"></div><div class="museum-filmstrip" role="group" aria-label="コマを選択"></div></div><aside class="museum-browser"><div class="museum-kinds" role="group" aria-label="モーションまたはエフェクト"></div><div class="museum-clips" role="group" aria-label="展示項目"></div></aside></div>';
        container.replaceChildren(root);root.addEventListener('click',click);root.addEventListener('change',change);
        if(!owner||!visibleOwners().includes(owner)||owner.side!==side)owner=visibleOwners().find(o=>o.side===side);
        const selected=focus?.skill&&owner?.clips.find(c=>c.skillId===focus.skill&&L.unlocked(save,owner,c));
        if(selected) {kind='skill';renderOwners();await selectClip(selected);}else await selectOwner(owner);
      }catch(e){if(ticket===version) {container.innerHTML='<div class="museum-loading" role="status">'+esc(e.message)+'<br><button class="secondary-button">再読込</button></div>';container.querySelector('button').addEventListener('click',()=>mount(focus));}}
    }
    return {mount,stop};
  }
};
