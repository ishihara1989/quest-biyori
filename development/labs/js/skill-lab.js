'use strict';
(async()=>{
  const W=WarriorSkills,S=ForestSimulation,R=WarriorSkillRenderer,$=id=>document.getElementById(id),ctx=$('preview').getContext('2d');
  const requested=new URLSearchParams(location.search).get('skill');
  let selected=W.ACTIVE.some(s=>s.id===requested)?requested:'moon',enemyMode='mob',playing=true,ready=false,time=0,last,run,events=[],sprites={},layers=[],fx={},skill;
  const motionNames={'attack-overhead':'振り下ろし','attack-far-to-near':'奥→手前','attack-near-to-far':'手前→奥'};
  const controls=[...document.querySelectorAll('.transport button,.options select')];controls.forEach(b=>b.disabled=true);
  async function asset(base){const response=await fetch(base+'manifest.json');if(!response.ok)throw Error(base+'manifest.json');const data=await response.json(),image=await loadImage(base+data.sheet);return {data,image};}
  function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(src));i.src=src;});}
  function list(){
    $('skill-list').innerHTML=W.ACTIVE.map(s=>'<button class="skill-choice" data-skill="'+s.id+'" aria-pressed="'+(s.id===selected)+'" title="'+W.parameters(W.spec(s.id))+'"><img src="'+s.icon+'" alt=""><span><b>'+s.name+'</b><small>Lv.'+s.unlockLevel+' · '+(s.kind==='normal'?'NORMAL':s.hits+' HIT')+'</small></span></button>').join('');
  }
  function reset(){
    skill=W.spec(selected,Number($('rank').value),Number($('enhance').value));
    run=S.createRun(1,{random:()=>.7,builds:{warrior:{...ForestProgression.CHARACTERS.warrior.base,crit:0,interval:1e9,mpRegen:0,warriorSkills:[]}}});
    run.hero.x=290;run.hero.y=425;run.hero.hp=run.hero.maxHp=1e8;run.hero.mp=100;run.hero.cooldown=1e9;
    const base=run.enemies[0];
    run.enemies=(enemyMode==='boss'?[{x:650,y:423,type:'boss-boar'}]:[{x:510,y:425,type:'slime'},{x:625,y:405,type:'slime'},{x:710,y:465,type:'slime'},{x:805,y:375,type:'slime'},{x:875,y:435,type:'slime'}]).map((p,i)=>({...base,...ForestData.ENEMIES[p.type],...p,id:'review-'+i,boss:enemyMode==='boss',hp:1e8,maxHp:1e8,speed:enemyMode==='boss'?0:22,damage:0,cooldown:1e9,special:1e9,time:0,state:'idle',motion:'idle'}));
    events=[];S.startWarriorSkill(run,run.hero,skill,run.enemies[0],events);time=0;
    $('timeline').max=String(skill.duration+750);$('timeline').value='0';
    $('skill-art').src=skill.icon;$('skill-unlock').textContent='UNLOCK Lv.'+skill.unlockLevel+' / SKILL Lv.'+skill.rank;$('skill-name').textContent=skill.name;
    $('hit-count').textContent=skill.kind==='normal'?skill.targets+' TARGETS':skill.hits+' HIT';
    $('skill-note').textContent='';$('skill-stats').textContent=W.parameters(skill);
    $('target-rule').textContent=enemyMode==='boss'?'BOSS · 打ち上げ・吸引・ノックバック無効':'MOBS · 打ち上げ・吸引・ノックバック有効';
    $('hit-markers').innerHTML=W.hitTimes(skill).map(t=>'<i style="left:'+t*skill.duration/(skill.duration+750)*100+'%" title="'+Math.round(t*skill.duration)+'ms 命中"></i>').join('');
    $('effect-review').href='assets/skills/warrior/effects/'+W.effectKind(skill,0)+'/review.png';
    const motion= ['basic','leap','crater','earth','divide','ultimate'].includes(skill.pattern)?'attack-overhead':'attack-far-to-near';
    $('motion-assets').innerHTML=[motion,...(['rise','spin','sphere','running','tornado'].includes(skill.pattern)?['attack-near-to-far']:[])].map(m=>'<a target="_blank" title="'+motionNames[m]+'" href="assets/warrior/motions/'+m+'/warrior-'+m+'-preview.gif"><img src="assets/warrior/motions/'+m+'/'+m+'-01.png" alt="'+motionNames[m]+'"></a>').join('');
  }
  function seek(next){if(!ready)return;next=Math.max(0,Math.min(Number($('timeline').max),next));if(next<time)reset();if(next>time)events.push(...S.update(run,next-time));time=next;events=events.filter(e=>run.time-e.timeMs<1000);}
  function pause(value){playing=value;$('play').textContent=playing?'❚❚':'▶';$('play').setAttribute('aria-label',playing?'一時停止':'再生');last=undefined;}
  function drawAsset(a,elapsed,x,y,scale=1,flip=false,alpha=1){if(!a)return;const d=a.data,t=d.loop||d.motion==='idle'?elapsed%d.durationMs:Math.min(elapsed,d.durationMs-.01),f=d.frames[MotionPlayback.frameAt(d,t)];ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(a.image,f.x,f.y,f.width,f.height,-d.pivot.x*scale,-d.pivot.y*scale,f.width*scale,f.height*scale);ctx.restore();}
  function drawActor(a,alpha=1){
    if(a.hidden)return;const hero=a.id==='hero',asset=sprites[a.type][a.motion]||sprites[a.type].idle,height=(a.z||0)+(a.airUntil>run.time?Math.sin((run.time-a.airStart)/(a.airUntil-a.airStart)*Math.PI)*a.airHeight:0);
    ctx.save();ctx.fillStyle='#0b17166a';ctx.beginPath();ctx.ellipse(a.x,a.y,a.boss?60:hero?28:20,6,0,0,Math.PI*2);ctx.fill();ctx.restore();
    drawAsset(asset,a.warriorCast?a.motionTime:a.time,a.x,a.y-height,hero?1:a.scale,hero?a.facing<0:a.facing>0,alpha*(a.flash>0?.7:1));
    if(alpha===1&&!hero){ctx.fillStyle='#18251bd9';ctx.fillRect(a.x-24,a.y-(a.height||80)-height-10,48,4);ctx.fillStyle=a.boss?'#efb57d':'#bcd48e';ctx.fillRect(a.x-24,a.y-(a.height||80)-height-10,48,3);}
  }
  function guides(){
    if(!$('guides').checked)return;const c=run.hero.warriorCast||W.begin(skill,{x:290,y:425},run.enemies[0],run.enemies);
    ctx.save();ctx.strokeStyle='#92b6a0';ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.beginPath();for(let i=0;i<=80;i++){const p=W.sample(c,i/80*skill.duration);i?ctx.lineTo(p.x,p.y-p.z):ctx.moveTo(p.x,p.y-p.z);}ctx.stroke();ctx.beginPath();ctx.ellipse(run.hero.x,run.hero.y,Math.min(1000,skill.radius),Math.min(1000,skill.radius)*.32,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function render(){
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1024,576);layers.forEach(i=>ctx.drawImage(i,0,0,1024,576));guides();
    if($('effects').checked)R.ghosts(ctx,run.hero,drawActor);
    [...run.enemies,run.hero].sort((a,b)=>a.y-b.y).forEach(a=>drawActor(a));
    if($('effects').checked){R.castOverlay(ctx,run.hero,fx);R.impacts(ctx,events,run.time,fx);}
    for(const e of events.filter(e=>e.type==='damage'&&run.time-e.timeMs<700)){const age=run.time-e.timeMs;ctx.save();ctx.globalAlpha=1-age/700;ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillStyle='#ffefb8';ctx.strokeStyle='#152218';ctx.lineWidth=3;ctx.strokeText(e.amount,e.x,e.y-age/20);ctx.fillText(e.amount,e.x,e.y-age/20);ctx.restore();}
    $('timeline').value=String(time);$('time').textContent=Math.round(time)+' / '+$('timeline').max+' ms';
    $('phase').textContent=run.hero.warriorCast?W.phase(run.hero.warriorCast,run.hero.warriorCast.elapsed):'残心';
    $('skill-banner').textContent=skill.unlockLevel>=80&&time<500?skill.name:'';
  }
  function frame(now){const dt=last===undefined?0:Math.min(80,now-last);last=now;if(ready){if(playing&&!document.hidden){const next=time+dt*Number($('speed').value);if(next>Number($('timeline').max)){if($('loop').checked){reset();}else{seek(Number($('timeline').max));pause(false);}}else seek(next);}render();}requestAnimationFrame(frame);}
  $('skill-list').addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(!b||!ready)return;selected=b.dataset.skill;history.replaceState(null,'','?skill='+selected);list();reset();});
  document.querySelectorAll('[data-enemy]').forEach(b=>b.addEventListener('click',()=>{if(!ready)return;enemyMode=b.dataset.enemy;document.querySelectorAll('[data-enemy]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));reset();}));
  for(const id of ['rank','enhance'])$(id).addEventListener('change',()=>{if(ready)reset();});
  $('play').addEventListener('click',()=>pause(!playing));$('restart').addEventListener('click',()=>{if(ready)reset();});
  $('step').addEventListener('click',()=>{pause(false);seek(time+S.STEP);});$('back').addEventListener('click',()=>{pause(false);seek(time-S.STEP);});
  $('timeline').addEventListener('input',e=>{pause(false);seek(Number(e.target.value));});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,select')||!ready)return;if(e.code==='Space'){e.preventDefault();pause(!playing);}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();pause(false);seek(time+(e.key==='ArrowLeft'?-S.STEP:S.STEP));}});
  list();
  try{
    [layers,sprites,fx]=await Promise.all([
      Promise.all(['forest-distant.png','forest-ground-near.png'].map(f=>loadImage('assets/stages/starting-forest/'+f))),
      Promise.all([Promise.all([asset('assets/warrior/').then(a=>['idle',a]),...['attack-overhead','attack-far-to-near','attack-near-to-far','jump','forward'].map(async m=>[m,await asset('assets/warrior/motions/'+m+'/')])]).then(a=>['warrior',Object.fromEntries(a)]),...['slime','boss-boar'].map(async id=>[id,Object.fromEntries(await Promise.all(['idle','move','hit'].map(async m=>[m,await asset('assets/enemies/'+id+'/motions/'+m+'/')])) )])]).then(Object.fromEntries),
      R.load(),
    ]);ready=true;controls.forEach(b=>b.disabled=false);reset();requestAnimationFrame(frame);
  }catch(error){$('load-error').hidden=false;$('load-error').textContent='素材を読み込めませんでした：'+error.message;console.error(error);}
})();
