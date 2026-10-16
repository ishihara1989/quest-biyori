'use strict';
(()=>{
  const $=id=>document.getElementById(id),canvas=$('battle'),ctx=canvas.getContext('2d');
  const cache=new Map(),FX=['toad-poison-bolt','toad-poison-impact','mud-bind','mud-slam-impact','lich-energy-bolt','lich-energy-impact','lich-dark-magic','hydra-poison-aura','hydra-poison-breath'];
  const labels={idle:'待機',move:'移動',forward:'移動',hit:'被弾',down:'撃破',spit:'毒液',tongue:'舌攻撃',punch:'パンチ',grab:'掴む',windup:'振りかぶり',slam:'振り下ろし',attack:'攻撃',chant:'詠唱','dark-cast':'闇の大魔法',charge:'毒ガス溜め',breath:'毒ガスブレス'};
  let catalog,battle,models,heroModels,stage,layers,effects={},playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last,loading=true,version=0,visuals=[];
  const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url+': '+r.status);return r.json();};
  const image=url=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(url));i.src=url;});
  async function asset(url){if(!cache.has(url))cache.set(url,(async()=>{const data=await json(url),sheet=await image(new URL(data.sheet,new URL(url,document.baseURI)).href);return {data,sheet};})());try{return await cache.get(url);}catch(error){cache.delete(url);throw error;}}
  async function enemyModels(id){const base='assets/enemies/'+id+'/motions/',list=await json(base+'index.json');return Object.fromEntries(await Promise.all(list.map(async m=>[m.id,await asset(base+m.manifest)])));}
  async function select(id){
    const request=++version;loading=true;last=null;$('load-status').hidden=false;$('load-status').textContent='素材を読み込んでいます…';
    for(const el of document.querySelectorAll('.controls button'))el.disabled=true;
    try{const loaded=await enemyModels(id);if(request!==version)return;models=loaded;battle=SwampCombat.create(id,{autoHero:$('hero-auto').checked});visuals=[];
      const emitter=(models.spit||models.attack)?.data;if(emitter?.effectPreview)battle.enemy.emission={x:emitter.pivot.x-emitter.effectPreview.origin.x,y:emitter.effectPreview.origin.y-emitter.pivot.y};
      $('enemy-name').textContent=SwampCombat.DEFINITIONS[id].name;$('rank').textContent=battle.enemy.majorBoss?'MAJOR BOSS':battle.enemy.boss?'BOSS':'ENEMY';
      $('motion-link').href='/development/labs/enemies.html#'+id;$('enemy-health').max=battle.enemy.maxHp;
      const plans=[SwampCombat.sequence(id,1),SwampCombat.sequence(id,2)];
      ['attack-normal','attack-special'].forEach((key,i)=>{$(key).textContent=plans[i].map(p=>labels[p.motion]).join(' → ');$(key).title=plans[i].map(p=>labels[p.motion]).join(' → ');});
      for(const el of document.querySelectorAll('[data-enemy]'))el.setAttribute('aria-pressed',String(el.dataset.enemy===id));
      for(const el of document.querySelectorAll('.controls button'))el.disabled=false;
      $('load-status').hidden=true;loading=false;history.replaceState(null,'','#'+id);draw();
    }catch(error){if(request!==version)return;$('load-status').textContent='素材を読み込めませんでした: '+error.message;loading=false;console.error(error);}
  }
  function sprite(model,time,x,y,scale=1,flip=false,alpha=1){if(!model)return;const d=model.data,t=d.loop?time%d.durationMs:Math.min(time,d.durationMs-1),f=d.frames[MotionPlayback.frameAt(d,Math.max(0,t))];ctx.save();ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);ctx.globalAlpha=alpha;ctx.drawImage(model.sheet,f.x,f.y,f.width,f.height,-d.pivot.x*scale,-d.pivot.y*scale,f.width*scale,f.height*scale);ctx.restore();}
  function backdrop(){
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const layer of layers||[])ctx.drawImage(layer.image,0,0,canvas.width,canvas.height);
  }
  function draw(){
    backdrop();if(!battle||!models)return;const {hero,enemy}=battle;
    for(const a of [hero,enemy].sort((a,b)=>a.y-b.y)){
      ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(a.x,a.y,a.id==='enemy'&&a.boss?72:28,9,0,0,Math.PI*2);ctx.fill();
      const pose=SwampCombat.pose(battle,a),source=a.id==='hero'?heroModels:models;
      const scale=a.id==='hero'?.82:a.type==='hydra'?.8:a.type==='mud-giant'?.88:1;
      sprite(source[pose.motion]||source.idle,pose.time,a.x,a.y,scale,a.id==='hero'?a.facing<0:a.facing>0);
      if(a.id==='hero'&&a.rootUntil>battle.time)sprite(effects['mud-bind'],battle.time,a.x,a.y,.8);
      if(a.id==='hero'&&a.poison){ctx.fillStyle='#b2e05c';for(let i=0;i<4;i++)ctx.fillRect(a.x-20+i*13,a.y-90-Math.round((battle.time/20+i*13)%45),3,3);}
    }
    if(enemy.motion==='charge'&&enemy.hp>0)sprite(effects['hydra-poison-aura'],enemy.motionTime,enemy.x+enemy.facing*135,enemy.y-180,.8,enemy.facing>0,.85);
    if(enemy.plan&&['windup','chant'].includes(enemy.motion)){ctx.save();ctx.strokeStyle=enemy.motion==='chant'?'#c996ff':'#e4b568';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.beginPath();ctx.ellipse(enemy.plan.aim.x,enemy.plan.aim.y,95,24,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
    visuals=visuals.filter(e=>battle.time-e.timeMs<(e.type==='damage'?950:e.type==='projectile'?e.durationMs:720));
    for(const e of visuals){const age=battle.time-e.timeMs;
      if(e.type==='projectile'){const t=Math.min(1,age/e.durationMs);sprite(effects[e.effect],age,e.x+(e.tx-e.x)*t,e.y+(e.ty-e.y)*t,.6,e.tx>e.x);}
      else if(e.type==='effect')sprite(effects[e.effect],age,e.x,e.y,e.effect==='hydra-poison-breath'?.9:.85,e.facing>0);
      else if(e.type==='damage'){ctx.save();ctx.globalAlpha=Math.min(1,(950-age)/400);ctx.font='bold '+(e.amount>50?28:20)+'px Georgia';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#10231a';ctx.strokeText(e.amount,e.x,e.y-age/25);ctx.fillStyle=e.kind==='poison'?'#b6e46f':e.target==='hero'?'#f5ba98':'#fff0b9';ctx.fillText(e.amount,e.x,e.y-age/25);ctx.restore();}
    }
    $('hero-health').value=hero.hp;$('enemy-health').value=enemy.hp;
    canvas.dataset.enemy=enemy.type;canvas.dataset.motion=SwampCombat.pose(battle,enemy).motion;canvas.dataset.rooted=String(hero.rootUntil>battle.time);canvas.dataset.status=battle.status;
    canvas.dataset.heroX=String(hero.x);canvas.dataset.heroY=String(hero.y);
    canvas.dataset.stage=stage.id;
    $('motion-label').textContent=battle.status==='running'?labels[SwampCombat.pose(battle,enemy).motion]:battle.status==='victory'?'CLEAR':'DEFEATED';
    const rooted=hero.rootUntil>battle.time,poisoned=!!hero.poison;
    const icons=$('status-icons');
    if(icons.dataset.rooted!==String(rooted)||icons.dataset.poisoned!==String(poisoned)){
      icons.replaceChildren();for(const [active,text,title,style] of [[rooted,'▣','移動停止 / 泥の拘束',''],[poisoned,'☣','毒 / 継続ダメージ','poison']])if(active){const icon=document.createElement('span');icon.textContent=text;icon.title=title;icon.setAttribute('aria-label',title);icon.className=style;icons.append(icon);}
      icons.dataset.rooted=String(rooted);icons.dataset.poisoned=String(poisoned);
    }
  }
  function tick(time){
    const dt=last===undefined||last===null?0:Math.min(100,time-last);last=document.hidden?null:time;
    if(!loading&&playing&&!document.hidden&&battle){const events=SwampCombat.update(battle,dt);visuals.push(...events.filter(e=>['damage','effect','projectile'].includes(e.type)));if(battle.status!=='running'&&Math.max(battle.hero.downTime,battle.enemy.downTime)>2400&&$('repeat').checked)select(battle.enemy.type);}
    if(!loading)draw();requestAnimationFrame(tick);
  }
  function forceAttack(which){if(!battle||battle.status!=='running')return;battle.enemy.attacks=which-1;battle.enemy.x=Math.min(910,battle.hero.x+battle.enemy.range-5);SwampCombat.startAttack(battle);draw();}
  $('play').addEventListener('click',()=>{playing=!playing;last=null;$('play').textContent=playing?'Ⅱ':'▶';});
  $('reset').addEventListener('click',()=>select(battle.enemy.type));
  $('attack-normal').addEventListener('click',()=>forceAttack(1));$('attack-special').addEventListener('click',()=>forceAttack(2));
  $('hero-auto').addEventListener('change',()=>{if(battle){battle.autoHero=$('hero-auto').checked;battle.heroTarget=null;}});
  $('hit').addEventListener('click',()=>{if(battle){SwampCombat.hurt(battle,battle.hero,battle.enemy,1);draw();}});
  $('down').addEventListener('click',()=>{if(battle){SwampCombat.hurt(battle,battle.hero,battle.enemy,battle.enemy.hp);draw();}});
  canvas.addEventListener('pointerdown',event=>{if(!battle||loading)return;const rect=canvas.getBoundingClientRect();battle.heroTarget={x:(event.clientX-rect.left)/rect.width*canvas.width,y:Math.max(SwampCombat.BOUNDS.minY,Math.min(SwampCombat.BOUNDS.maxY,(event.clientY-rect.top)/rect.height*canvas.height))};});
  canvas.addEventListener('keydown',event=>{const vector={ArrowLeft:[-100,0],ArrowRight:[100,0],ArrowUp:[0,-70],ArrowDown:[0,70]}[event.key];if(!vector||!battle)return;event.preventDefault();battle.heroTarget={x:battle.hero.x+vector[0],y:battle.hero.y+vector[1]};});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){playing=false;$('play').textContent='▶';}});
  (async()=>{
    try{catalog=(await json('assets/enemies/index.json')).filter(e=>e.region==='poison-swamp');
      for(const e of catalog){const button=document.createElement('button');button.type='button';button.dataset.enemy=e.id;button.setAttribute('aria-pressed','false');const img=document.createElement('img');img.src=e.base+e.thumbnail;img.alt='';const label=document.createElement('span');label.textContent=e.label;button.append(img,label);button.addEventListener('click',()=>select(e.id));$('enemy-tabs').append(button);}
      const stageBase='assets/stages/poison-swamp/';stage=await json(stageBase+'manifest.json');
      canvas.width=stage.coordinateSystem.previewWidth;canvas.height=stage.coordinateSystem.previewHeight;
      [heroModels,effects,layers]=await Promise.all([
        Promise.all(['idle','forward','hit','down','attack-overhead'].map(async m=>[m,await asset(m==='idle'?'assets/warrior/manifest.json':'assets/warrior/motions/'+m+'/manifest.json')])).then(Object.fromEntries),
        Promise.all(FX.map(async id=>[id,await asset('assets/effects/'+id+'/manifest.json')])).then(Object.fromEntries),
        Promise.all(stage.layers.map(async layer=>({...layer,image:await image(stageBase+layer.file)}))),
      ]);
      const id=location.hash.slice(1);await select(Object.hasOwn(SwampCombat.DEFINITIONS,id)?id:'giga-toad');$('play').textContent=playing?'Ⅱ':'▶';requestAnimationFrame(tick);
    }catch(error){$('load-status').textContent='素材を読み込めませんでした: '+error.message;console.error(error);}
  })();
})();
