'use strict';
(async()=>{
  const M=MageSkills,S=ForestSimulation,R=MageSkillRenderer,$=id=>document.getElementById(id),ctx=$('preview').getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const requested=new URLSearchParams(location.search).get('skill');
  let selected=M.ACTIVE.some(s=>s.id===requested)?requested:'wind',enemyMode='mob',playing=!reduced,ready=false,time=0,last,run,mage,cast,events=[],sprites={},layers=[],fx={},skill,flipped=false;
  const controls=[...document.querySelectorAll('.transport button,.options select,.options button')];controls.forEach(b=>b.disabled=true);
  async function asset(base){const response=await fetch(base+'manifest.json');if(!response.ok)throw Error(base);const data=await response.json(),image=await loadImage(base+data.sheet);return {data,image};}
  function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(src));i.src=src;});}
  function list(){
    $('skill-list').innerHTML=M.ACTIVE.map(s=>'<button class="skill-choice" data-skill="'+s.id+'" aria-pressed="'+(s.id===selected)+'" title="'+M.parameters(M.spec(s.id))+'"><img src="'+s.icon+'" alt=""><span><b>'+s.name+'</b><small>Lv.'+s.unlockLevel+' · '+s.element+'</small></span></button>').join('');
  }
  function reset(){
    skill=M.spec(selected,Number($('rank').value),Number($('enhance').value));
    run=S.createRun(1,{random:()=>.9,builds:{mage:{...ForestProgression.CHARACTERS.mage.base,crit:0,interval:1e9,mpRegen:0,mageNormal:M.spec('bolt'),mageSkills:[]}}});
    run.hero.hp=0;mage=run.allies[0];mage.x=flipped?780:240;mage.y=425;mage.hp=mage.maxHp=1e8;mage.mp=1e5;mage.cooldown=1e9;
    const base=run.enemies[0],positions=enemyMode==='boss'?[{x:640,y:425,type:'boss-boar'}]:[{x:440,y:420,type:'slime'},{x:570,y:445,type:'slime'},{x:690,y:400,type:'slime'},{x:815,y:440,type:'slime'},{x:875,y:350,type:'slime'}];
    run.enemies=positions.map((p,i)=>({...base,...ForestData.ENEMIES[p.type],...p,x:flipped?1024-p.x:p.x,id:'review-'+i,boss:enemyMode==='boss',hp:1e8,maxHp:1e8,speed:0,damage:0,cooldown:1e9,special:1e9,time:0,state:'idle',motion:'idle'}));
    events=[];S.startMageSkill(run,mage,skill,run.enemies[0],events);cast=mage.mageCast;time=0;
    $('timeline').max=String(skill.duration+750);$('timeline').value='0';$('skill-art').src=skill.icon;
    $('skill-unlock').textContent='UNLOCK Lv.'+skill.unlockLevel+' / SKILL Lv.'+skill.rank;$('skill-name').textContent=skill.name;
    $('hit-count').textContent=skill.hits+' HIT';$('skill-note').textContent='';$('skill-stats').textContent=M.parameters(skill);
    $('target-rule').textContent=enemyMode==='boss'?'BOSS · 吸引・凍結・打ち上げ無効':'MOBS';
    $('hit-markers').innerHTML=M.hitTimes(skill).map(t=>'<i style="left:'+t*skill.duration/(skill.duration+750)*100+'%" title="'+Math.round(t*skill.duration)+'ms 命中"></i>').join('');
    const kind=M.effectKind(skill);$('effect-review').href='assets/skills/mage/effects/'+kind+'/review.png';
    $('motion-assets').innerHTML=['chant','cast-'+skill.cast,'cast-'+skill.cast+'-hold'].map(m=>'<a target="_blank" title="'+m+'" href="assets/mage/motions/'+m+'/mage-'+m+'-preview.gif"><img src="assets/mage/motions/'+m+'/'+m+'-01.png" alt="'+m+'"></a>').join('');
    render();
  }
  function seek(next){if(!ready)return;next=Math.max(0,Math.min(Number($('timeline').max),next));if(next<time)reset();if(next>time)events.push(...S.update(run,next-time));time=next;render();}
  function pause(value){playing=value;$('play').textContent=playing?'❚❚':'▶';$('play').setAttribute('aria-label',playing?'一時停止':'再生');last=undefined;}
  function drawActor(a){
    const hero=a.id==='mage',asset=sprites[a.type][a.motion]||sprites[a.type].idle,d=asset.data,t=a.mageCast?a.motionTime:a.time,f=d.frames[MotionPlayback.frameAt(d,d.loop?t%d.durationMs:Math.min(t,d.durationMs-.01))];
    const height=a.airUntil>run.time?Math.sin((run.time-a.airStart)/(a.airUntil-a.airStart)*Math.PI)*a.airHeight:0,scale=hero?1:a.scale;
    ctx.save();ctx.fillStyle='#0b171670';ctx.beginPath();ctx.ellipse(a.x,a.y,hero?25:a.boss?60:22,6,0,0,Math.PI*2);ctx.fill();ctx.translate(a.x,a.y-height);if(hero?a.facing<0:a.facing>0)ctx.scale(-1,1);ctx.drawImage(asset.image,f.x,f.y,f.width,f.height,-d.pivot.x*scale,-d.pivot.y*scale,f.width*scale,f.height*scale);ctx.restore();
  }
  function guides(){
    if(!$('guides').checked)return;const c=cast,s=skill,angle=Math.atan2(c.direction.y,c.direction.x);ctx.save();ctx.strokeStyle='#b2d5dc';ctx.setLineDash([5,5]);ctx.lineWidth=1;ctx.beginPath();
    if(['fan','pierce','flame','beam','four','earth','tempest'].includes(s.pattern)){ctx.moveTo(c.origin.x,c.origin.y);if(s.pattern==='fan'){ctx.arc(c.origin.x,c.origin.y,s.radius,angle-s.angle/2,angle+s.angle/2);ctx.closePath();}else{ctx.lineTo(c.origin.x+c.direction.x*s.radius,c.origin.y+c.direction.y*s.radius);}}
    else ctx.ellipse(c.target.x,c.target.y,s.radius,s.radius*.32,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function render(){
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1024,576);layers.forEach(i=>ctx.drawImage(i,0,0,1024,576));guides();
    [...run.enemies,mage].sort((a,b)=>a.y-b.y).forEach(drawActor);
    if($('effects').checked){R.castOverlay(ctx,mage,fx,reduced);R.impacts(ctx,events,run.time,fx,reduced);}
    for(const e of events.filter(e=>e.type==='damage'&&run.time-e.timeMs<700)){const age=run.time-e.timeMs;ctx.save();ctx.globalAlpha=1-age/700;ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillStyle='#ccf7ff';ctx.strokeStyle='#152218';ctx.lineWidth=3;ctx.strokeText(e.amount,e.x,e.y-age/20);ctx.fillText(e.amount,e.x,e.y-age/20);ctx.restore();}
    $('timeline').value=String(time);$('time').textContent=Math.round(time)+' / '+Math.round(Number($('timeline').max))+' ms';
    $('phase').textContent=M.sample(cast,time).phase;$('preview').dataset.motion=mage.motion;$('preview').dataset.phase=M.sample(cast,time).phase;$('preview').dataset.hits=String(events.filter(e=>e.type==='damage').length);
    $('skill-banner').textContent=skill.unlockLevel>=80&&time<500?skill.name:'';
  }
  function frame(now){const dt=last===undefined?0:Math.min(80,now-last);last=now;if(ready){if(playing&&!document.hidden){const next=time+dt*Number($('speed').value);if(next>Number($('timeline').max)){if($('loop').checked)reset();else{seek(Number($('timeline').max));pause(false);}}else seek(next);}render();}requestAnimationFrame(frame);}
  $('skill-list').addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(!b||!ready)return;selected=b.dataset.skill;history.replaceState(null,'','?skill='+selected);list();reset();});
  document.querySelectorAll('[data-enemy]').forEach(b=>b.addEventListener('click',()=>{if(!ready)return;enemyMode=b.dataset.enemy;document.querySelectorAll('[data-enemy]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));reset();}));
  for(const id of ['rank','enhance'])$(id).addEventListener('change',()=>{if(ready)reset();});
  $('flip').addEventListener('click',()=>{flipped=!flipped;$('flip').setAttribute('aria-pressed',String(flipped));reset();});
  $('play').addEventListener('click',()=>pause(!playing));$('restart').addEventListener('click',()=>{if(ready)reset();});
  $('step').addEventListener('click',()=>{pause(false);seek(time+S.STEP);});$('back').addEventListener('click',()=>{pause(false);seek(time-S.STEP);});
  $('timeline').addEventListener('input',e=>{pause(false);seek(Number(e.target.value));});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,select')||!ready)return;if(e.code==='Space'){e.preventDefault();pause(!playing);}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();pause(false);seek(time+(e.key==='ArrowLeft'?-S.STEP:S.STEP));}});
  list();pause(playing);
  try{
    [layers,sprites,fx]=await Promise.all([
      Promise.all(['forest-distant.png','forest-ground-near.png'].map(f=>loadImage('assets/stages/starting-forest/'+f))),
      Promise.all([Promise.all([asset('assets/mage/').then(a=>['idle',a]),...['chant','cast-forward','cast-forward-hold','cast-up','cast-up-hold','forward'].map(async m=>[m,await asset('assets/mage/motions/'+m+'/')])]).then(a=>['mage',Object.fromEntries(a)]),...['slime','boss-boar'].map(async id=>[id,Object.fromEntries(await Promise.all(['idle','move','hit'].map(async m=>[m,await asset('assets/enemies/'+id+'/motions/'+m+'/')])) )])]).then(Object.fromEntries),
      R.load(),
    ]);ready=true;controls.forEach(b=>b.disabled=false);reset();requestAnimationFrame(frame);
  }catch(error){$('load-error').hidden=false;$('load-error').textContent='素材を読み込めませんでした：'+error.message;console.error(error);}
})();
