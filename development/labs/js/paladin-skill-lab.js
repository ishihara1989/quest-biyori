'use strict';
(async()=>{
 const P=PaladinSkills,S=ForestSimulation,R=PaladinSkillRenderer,$=id=>document.getElementById(id),ctx=$('preview').getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const requested=new URLSearchParams(location.search).get('skill');
 let selected=P.ACTIVE.some(s=>s.id===requested)?requested:'mace',enemyMode='mob',playing=!reduced,ready=false,time=0,last,run,paladin,cast,events=[],sprites={},layers=[],fx={},skill,flipped=false;
 const controls=[...document.querySelectorAll('.transport button,.options select,.options button')];controls.forEach(b=>b.disabled=true);
 function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(src));i.src=src;});}
 async function asset(base){const r=await fetch(base+'manifest.json');if(!r.ok)throw Error(base);const data=await r.json();return {data,image:await loadImage(base+data.sheet)};}
 function list(){$('skill-list').innerHTML=P.ACTIVE.map(s=>'<button class="skill-choice" data-skill="'+s.id+'" aria-pressed="'+(s.id===selected)+'" title="'+P.parameters(P.spec(s.id))+'"><img src="'+s.icon+'" alt=""><span><b>'+s.name+'</b><small>Lv.'+s.unlockLevel+' · '+s.element+'</small></span></button>').join('');}
 function reset(){
  skill=P.spec(selected,Number($('rank').value),Number($('enhance').value));
  run=S.createRun(1,{random:()=>.9,builds:{paladin:{...ForestProgression.CHARACTERS.paladin.base,crit:0,interval:1e9,mpRegen:0,paladinNormal:P.spec('mace'),paladinSkills:[]}}});
  paladin=run.allies[0];paladin.x=flipped?784:240;paladin.y=425;paladin.hp=paladin.maxHp=10000;paladin.mp=paladin.maxMp=10000;paladin.cooldown=1e9;
  const hero=run.hero;Object.assign(hero,{x:flipped?884:140,y:460,hp:500,maxHp:1000,damage:0,cooldown:1e9,interval:1e9,skill:1e9,speed:0,mpRegen:0});
  const base=run.enemies[0],guard=['aegis','reflect','fortress','bastion','revenge','ultimate'].includes(skill.id),positions=enemyMode==='boss'?[{x:skill.id==='mace'?380:580,y:425,type:'boss-boar'}]:[{x:380,y:420,type:'slime'},{x:495,y:445,type:'slime'},{x:610,y:400,type:'slime'},{x:725,y:440,type:'slime'},{x:845,y:360,type:'slime'}];
  run.enemies=positions.map((p,i)=>({...base,...ForestData.ENEMIES[p.type],...p,x:flipped?1024-p.x:p.x,id:'review-'+i,boss:enemyMode==='boss',hp:1e8,maxHp:1e8,speed:0,range:guard?520:70,damage:guard?650:0,interval:700,cooldown:guard?650:1e9,special:1e9,time:0,state:'idle',motion:'idle'}));
  events=[];if(['purify','sanctuary'].includes(skill.id)){S.applyStatus(run,hero,'poison',run.enemies[0],events);S.applyStatus(run,hero,'root',run.enemies[0],events);}
  S.startPaladinSkill(run,paladin,skill,run.enemies[0],events);cast=paladin.paladinCast;time=0;
  $('timeline').max=String(skill.duration+Math.max(750,Math.min(5000,skill.effectDuration)));$('timeline').value='0';$('skill-art').src=skill.icon;
  $('skill-unlock').textContent='UNLOCK Lv.'+skill.unlockLevel+' / SKILL Lv.'+skill.rank;$('skill-name').textContent=skill.name;$('hit-count').textContent=skill.support?'SUPPORT':skill.hits+' HIT';$('skill-note').textContent='';$('skill-stats').textContent=P.parameters(skill);$('target-rule').textContent=enemyMode==='boss'?'BOSS':'MOBS';
  $('hit-markers').innerHTML=P.hitTimes(skill).map(t=>'<i style="left:'+t*skill.duration/Number($('timeline').max)*100+'%" title="'+Math.round(t*skill.duration)+'ms 発動"></i>').join('');
  $('effect-review').href='assets/skills/paladin/effects/'+P.effectKind(skill)+'/review.png';
  const motions=skill.motion==='mace-slam'?['mace-raise','mace-slam']:skill.id==='revenge'?['shield-raise','attack-mace']:[skill.motion];if(skill.id==='ultimate')motions.unshift('shield-raise');
  $('motion-assets').innerHTML=motions.map(m=>'<a target="_blank" title="'+m+'" href="assets/paladin/motions/'+m+'/paladin-'+m+'-preview.gif"><img src="assets/paladin/motions/'+m+'/'+m+'-01.png" alt="'+m+'"></a>').join('');render();
 }
 function seek(next){if(!ready)return;next=Math.max(0,Math.min(Number($('timeline').max),next));if(next<time)reset();if(next>time)events.push(...S.update(run,next-time));time=next;render();}
 function pause(value){playing=value;$('play').textContent=playing?'❚❚':'▶';$('play').setAttribute('aria-label',playing?'一時停止':'再生');last=undefined;}
 function drawActor(a){
  const friendly=!ForestData.ENEMIES[a.type],asset=sprites[a.type][a.motion]||sprites[a.type].idle,d=asset.data,t=a.paladinCast?a.motionTime:a.time,f=d.frames[MotionPlayback.frameAt(d,d.loop?t%d.durationMs:Math.min(t,d.durationMs-.01))],height=a.airUntil>run.time?Math.sin((run.time-a.airStart)/(a.airUntil-a.airStart)*Math.PI)*a.airHeight:0,scale=friendly?1:a.scale;
  ctx.save();ctx.fillStyle='#0b171670';ctx.beginPath();ctx.ellipse(a.x,a.y,friendly?25:a.boss?60:22,6,0,0,Math.PI*2);ctx.fill();ctx.translate(a.x,a.y-height);if(friendly?a.facing<0:a.facing>0)ctx.scale(-1,1);ctx.globalAlpha=a.hp<=0?.4:1;ctx.drawImage(asset.image,f.x,f.y,f.width,f.height,-d.pivot.x*scale,-d.pivot.y*scale,f.width*scale,f.height*scale);ctx.restore();
  if(friendly){ctx.fillStyle='#122019';ctx.fillRect(a.x-26,a.y-155,52,5);ctx.fillStyle=a.poison?'#a8d457':'#ffe0a0';ctx.fillRect(a.x-25,a.y-154,50*a.hp/a.maxHp,3);}
 }
 function guides(){if(!$('guides').checked)return;const c=cast,s=skill,a=Math.atan2(c.direction.y,c.direction.x);ctx.save();ctx.strokeStyle='#dec58d';ctx.setLineDash([5,5]);ctx.beginPath();if(['fan','line','charge','revenge'].includes(s.pattern)){ctx.moveTo(c.origin.x,c.origin.y);if(s.pattern==='fan'){ctx.arc(c.origin.x,c.origin.y,s.radius,a-s.angle/2,a+s.angle/2);ctx.closePath();}else ctx.lineTo(c.origin.x+c.direction.x*s.radius,c.origin.y+c.direction.y*s.radius);}else {const p=s.support?c.origin:c.target;ctx.ellipse(p.x,p.y,s.radius,s.radius*.32,0,0,Math.PI*2);}ctx.stroke();ctx.restore();}
 function render(){
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1024,576);layers.forEach(i=>ctx.drawImage(i,0,0,1024,576));guides();if($('effects').checked)R.fields(ctx,run,fx,reduced);[...run.enemies,run.hero,paladin].sort((a,b)=>a.y-b.y).forEach(drawActor);
  if($('effects').checked){R.castOverlay(ctx,paladin,fx,reduced);R.impacts(ctx,events,run.time,fx,reduced);}
  for(const e of events.filter(e=>['damage','heal','paladin-block'].includes(e.type)&&run.time-e.timeMs<700)){const age=run.time-e.timeMs,label=(e.type==='heal'?'+':e.type==='paladin-block'?'−':'')+e.amount;ctx.save();ctx.globalAlpha=1-age/700;ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillStyle=e.type==='heal'?'#b5ffc1':e.type==='paladin-block'?'#b2eaff':'#fff0ba';ctx.strokeStyle='#152218';ctx.lineWidth=3;ctx.strokeText(label,e.x,e.y-age/20);ctx.fillText(label,e.x,e.y-age/20);ctx.restore();}
  $('timeline').value=String(time);$('time').textContent=Math.round(time)+' / '+Math.round(Number($('timeline').max))+' ms';const phase=P.sample(cast,time).phase;$('phase').textContent=phase;$('preview').dataset.motion=paladin.motion;$('preview').dataset.phase=phase;$('preview').dataset.hits=String(events.filter(e=>e.type==='paladin-impact').length);$('preview').dataset.damage=String(events.filter(e=>e.type==='damage'&&e.source==='paladin').length);$('preview').dataset.blocks=String(events.filter(e=>e.type==='paladin-block').length);$('skill-banner').textContent=skill.unlockLevel>=75&&time<500?skill.name:'';
 }
 function frame(now){const dt=last===undefined?0:Math.min(80,now-last);last=now;if(ready){if(playing&&!document.hidden){const next=time+dt*Number($('speed').value);if(next>Number($('timeline').max)){if($('loop').checked)reset();else{seek(Number($('timeline').max));pause(false);}}else seek(next);}render();}requestAnimationFrame(frame);}
 $('skill-list').addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(!b||!ready)return;selected=b.dataset.skill;history.replaceState(null,'','?skill='+selected);list();reset();});
 document.querySelectorAll('[data-enemy]').forEach(b=>b.addEventListener('click',()=>{if(!ready)return;enemyMode=b.dataset.enemy;document.querySelectorAll('[data-enemy]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));reset();}));
 for(const id of ['rank','enhance'])$(id).addEventListener('change',()=>{if(ready)reset();});$('flip').addEventListener('click',()=>{flipped=!flipped;$('flip').setAttribute('aria-pressed',String(flipped));reset();});
 $('play').addEventListener('click',()=>pause(!playing));$('restart').addEventListener('click',()=>{if(ready)reset();});$('step').addEventListener('click',()=>{pause(false);seek(time+S.STEP);});$('back').addEventListener('click',()=>{pause(false);seek(time-S.STEP);});$('timeline').addEventListener('input',e=>{pause(false);seek(Number(e.target.value));});
 document.addEventListener('keydown',e=>{if(e.target.matches('input,select')||!ready)return;if(e.code==='Space'){e.preventDefault();pause(!playing);}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();pause(false);seek(time+(e.key==='ArrowLeft'?-S.STEP:S.STEP));}});
 list();pause(playing);
 try{
  [layers,sprites,fx]=await Promise.all([Promise.all(['forest-distant.png','forest-ground-near.png'].map(f=>loadImage('assets/stages/starting-forest/'+f))),Promise.all([
   Promise.all([asset('assets/paladin/').then(a=>['idle',a]),...['forward','hit','down',...PaladinMotions.MOTIONS].map(async m=>[m,await asset('assets/paladin/motions/'+m+'/')])]).then(a=>['paladin',Object.fromEntries(a)]),asset('assets/warrior/').then(a=>['warrior',{idle:a}]),
   ...['slime','boss-boar'].map(async id=>[id,Object.fromEntries(await Promise.all(['idle','move','hit','down','attack',...(id==='boss-boar'?['charge-windup']:[])].map(async m=>[m,await asset('assets/enemies/'+id+'/motions/'+m+'/')])))]),
  ]).then(Object.fromEntries),R.load()]);ready=true;controls.forEach(b=>b.disabled=false);reset();requestAnimationFrame(frame);
 }catch(error){$('load-error').hidden=false;$('load-error').textContent='素材を読み込めませんでした：'+error.message;console.error(error);}
})();
