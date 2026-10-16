'use strict';
(async()=>{
  const $=id=>document.getElementById(id),S=ForestSimulation,N=NinjaSkills,R=NinjaSkillRenderer,ctx=$('preview').getContext('2d');ctx.imageSmoothingEnabled=false;
  let id=new URLSearchParams(location.search).get('skill')||'shuriken';if(!N.ACTIVE.some(s=>s.id===id))id='shuriken';
  let run,actor,enemySprites={},motions={},fx,events=[],time=0,playing=false,ready=false,last=null,statusRegions=[],hits=0,damage=0;
  const image=url=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(url));i.src=url;});
  async function asset(base){const response=await fetch(base+'manifest.json');if(!response.ok)throw Error(base);const data=await response.json();return {data,image:await image(base+data.sheet)};}
  const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('skills').innerHTML=N.ACTIVE.map(s=>'<button data-skill="'+s.id+'" aria-label="'+s.name+'" title="'+s.name+'"><img src="'+s.icon+'" alt=""><small>'+s.unlockLevel+'</small></button>').join('');
  function selected(){return N.spec(id,id==='shuriken'?1:Number($('rank').value),Number($('enhance').value),{attackSpeed:Number($('attack-speed').value)});}
  function rebuild(){const s=selected();run=S.createRun(21,{random:()=>.5,builds:{ninja:{...ForestProgression.CHARACTERS.ninja.base,maxHp:1e6,maxMp:140,mpRegen:0,damage:100,crit:0,interval:800/Number($('attack-speed').value),speed:0,manualOnly:true,ninjaNormal:N.spec('shuriken',1,0,{attackSpeed:Number($('attack-speed').value)}),ninjaSkills:[]}}});
    Object.assign(run.hero,{hp:1e6,damage:0,speed:0,cooldown:1e9,skill:1e9,x:90,y:334});actor=run.allies.find(a=>a.type==='ninja');Object.assign(actor,{x:$('flip').getAttribute('aria-pressed')==='true'?780:240,y:438,cooldown:1e9,mp:$('no-mp').checked?0:140});
    const kind=$('enemy').value,formation=$('formation').value,count=formation==='one'?1:5;
    run.enemies=Array.from({length:count},(_,i)=>{const type=kind==='boss'||kind==='parts'?'cave-troll':kind==='flying'||kind==='mixed'&&i%2?'cave-bat':'cave-worm';const base=ForestData.ENEMIES[type];return {id:'target-'+i,type,...base,hp:1e6,maxHp:1e6,damage:0,speed:0,x:actor.x+(actor.x>512?-1:1)*(formation==='spread'?130+i*110:250+(i%3)*20),y:formation==='spread'?348+i*32:418+i*12,state:'idle',motion:'idle',time:0,cooldown:1e9,attacks:0,flash:0,facing:actor.x>512?1:-1};});
    if(kind==='parts'){const owner=run.enemies[0];run.enemies.push({...owner,id:'part',type:'worm-tail',bodyPart:'worm-tail',ownerId:owner.id,boss:false,majorBoss:false,height:100,x:owner.x+25,y:owner.y+30,expiresAt:1e9});}
    if($('rooted').checked){actor.rootUntil=1e9;actor.rootAnchor={x:actor.x,y:actor.y};}
    events=[];time=0;hits=0;damage=0;const out=[];S.startNinjaSkill(run,actor,s,run.enemies[0],out,true);events.push(...out);
    $('timeline').max=Math.max(6000,s.duration+1500,s.release+s.lifetime+1200);$('timeline').value=0;$('skill-name').textContent=s.name;$('skill-stats').textContent=N.parameters(s);
    $('rank').disabled=id==='shuriken';document.querySelectorAll('[data-skill]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.skill===id));render();
  }
  function advance(delta){const out=[];if(id==='shadow-echo'){
      for(let left=delta;left>1e-7;){const step=Math.min(S.STEP,left);out.push(...S.update(run,step));left-=step;
        if(actor.ninjaEcho?.remaining>0&&!actor.ninjaCast&&run.time>=(actor.previewThrowReadyAt||0)){S.startNinjaSkill(run,actor,actor.ninjaNormal,run.enemies.find(e=>e.hp>0&&!e.bodyPart),out,true);actor.previewThrowReadyAt=run.time+actor.interval;}}
    }else out.push(...S.update(run,delta));for(const e of out)if(e.type==='damage'&&e.source==='ninja'){hits++;damage+=e.amount;}events.push(...out);time=run.time;events=events.filter(e=>time-e.timeMs<950);$('timeline').value=time;render();}
  function seek(target){playing=false;if(target<time)rebuild();advance(Math.max(0,target-time));$('play').textContent='▶';}
  function drawAsset(asset,ms,x,y,facing=1,alpha=1){if(!asset)return;const d=asset.data,t=d.loop?Math.max(0,ms)%d.durationMs:Math.min(Math.max(0,ms),d.durationMs-.001),f=d.frames[MotionPlayback.frameAt(d,t)];ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing,1);ctx.globalAlpha*=alpha;
    if(d.motion==='attack-shuriken'&&t>=180&&t<280){ctx.beginPath();ctx.rect(-1000,-1000,1087,2000);ctx.clip();}
    ctx.drawImage(asset.image,f.x,f.y,f.width,f.height,-d.pivot.x,-d.pivot.y,f.width,f.height);ctx.restore();}
  function drawActor(a,alpha=1){if(a.type==='ninja'){ctx.save();ctx.fillStyle='#090b14aa';ctx.beginPath();ctx.ellipse(a.x,a.y,alpha<1?17:24,5,0,0,Math.PI*2);ctx.fill();ctx.restore();drawAsset(motions[a.motion]||motions.idle,a.motionTime||0,a.x,a.y-(a.z||0),a.facing,alpha);}else {drawAsset(enemySprites[a.type],a.time,a.x,a.y,a.facing>0?-1:1);}}
  function render(){if(!ready)return;ctx.fillStyle='#171b2a';ctx.fillRect(0,0,1024,576);ctx.fillStyle='#202333';ctx.fillRect(0,320,1024,256);ctx.strokeStyle='#454153';ctx.lineWidth=1;for(let y=340;y<=560;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
    const show=$('effects').checked;if(show){R.castAura(ctx,actor,run,fx);R.fields(ctx,run,fx);R.backdrops(ctx,events,run.time,fx);R.ghosts(ctx,actor,run,drawActor);R.echoPoses(ctx,run,drawActor);}
    [...run.enemies,actor,...run.ninjaClones].sort((a,b)=>a.y-b.y).forEach(a=>a.source?R.drawClone(ctx,a,drawActor):drawActor(a));
    if(show){R.projectiles(ctx,run,fx);R.impacts(ctx,events,run.time,fx);R.overlay(ctx,actor,run,fx);}statusRegions=R.statuses(ctx,run,fx);
    if($('pivots').checked){ctx.strokeStyle='#6ce5dc';for(const a of [actor,...run.ninjaClones]){ctx.beginPath();ctx.moveTo(a.x-9,a.y);ctx.lineTo(a.x+9,a.y);ctx.moveTo(a.x,a.y-9);ctx.lineTo(a.x,a.y+9);ctx.stroke();}}
    $('clock').value=(time/1000).toFixed(2)+'s';$('hit-count').textContent=hits;$('damage').textContent=damage;$('mp').textContent=Math.round(actor.mp);$('clones').textContent=run.ninjaClones.length;
    $('preview').dataset.hits=hits;$('preview').dataset.damage=damage;$('preview').dataset.clones=run.ninjaClones.length;
  }
  $('skills').addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(!b)return;id=b.dataset.skill;playing=false;rebuild();});
  for(const control of ['rank','enhance','attack-speed','enemy','formation','rooted','no-mp'])$(control).addEventListener('change',()=>{playing=false;rebuild();});
  $('flip').onclick=()=>{$('flip').setAttribute('aria-pressed',$('flip').getAttribute('aria-pressed')!=='true');playing=false;rebuild();};
  $('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Ⅱ':'▶';last=null;};$('restart').onclick=()=>{playing=false;rebuild();};$('next').onclick=()=>seek(time+S.STEP);$('previous').onclick=()=>seek(Math.max(0,time-S.STEP));$('timeline').oninput=()=>seek(Number($('timeline').value));
  for(const control of ['effects','pivots'])$(control).onchange=render;
  $('preview').onpointermove=e=>{const box=$('preview').getBoundingClientRect(),x=(e.clientX-box.left)*1024/box.width,y=(e.clientY-box.top)*576/box.height,r=statusRegions.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);$('status-tip').hidden=!r;if(r)$('status-tip').textContent=r.label;};$('preview').onpointerleave=()=>{$('status-tip').hidden=true;};
  try{[motions,fx,enemySprites]=await Promise.all([Promise.all([asset('assets/ninja/').then(a=>['idle',a]),...N.MOTIONS.map(async id=>[id,await asset('assets/ninja/motions/'+id+'/')])]).then(Object.fromEntries),R.load(),Promise.all([...['cave-worm','cave-bat','cave-troll'].map(async id=>[id,await asset('assets/enemies/'+id+'/motions/idle/')]),asset('assets/effects/worm-tail/').then(a=>['worm-tail',a])]).then(Object.fromEntries)]);ready=true;rebuild();$('play').disabled=false;
    function frame(now){if(last===null)last=now;if(playing){advance(Math.min(100,now-last)*Number($('speed').value));if(time>=Number($('timeline').max)){playing=false;$('play').textContent='▶';}}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }catch(e){$('skill-stats').textContent='素材の読み込みに失敗しました。';console.error(e);}
})();
