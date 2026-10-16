'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('../skills/ninja-skills.js'):root.NinjaSkills,typeof module==='object'&&module.exports?require('./enemy-control.js'):root.EnemyControl);if(typeof module==='object'&&module.exports)module.exports=api;else root.NinjaCombat=api;})(globalThis,(S,C)=>{
  const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
  const {distance,clamp}=S;
  const point=p=>({x:p.x,y:p.y});
  const arena=p=>({x:clamp(p.x,90,944),y:clamp(p.y,334,501)});
  const live=run=>run.enemies.filter(e=>e.hp>0&&!e.invulnerable&&!e.bodyPart);
  const area=run=>run.enemies.filter(e=>e.hp>0&&!e.invulnerable&&C.owner(run,e).hp>0&&!C.owner(run,e).invulnerable);
  function init(run){run.ninjaProjectiles=[];run.ninjaFields=[];run.ninjaClones=[];run.ninjaEchoQueue=[];}
  function effect(run,events,kind,p,extra={}){events.push({type:'ninja-effect',kind,x:p.x,y:p.y,timeMs:run.time,...extra});}
  function releaseClones(run,actor,events){const old=run.ninjaClones.filter(c=>c.source===actor);if(old.length){for(const c of old)effect(run,events,'smoke-out',c);actor.cloneReadyAt=run.time+8000;}run.ninjaClones=run.ninjaClones.filter(c=>c.source!==actor);}
  function cancel(run,actor,events=[]){if(actor.ninjaCast?.spec.pattern==='ultimate')releaseClones(run,actor,events);actor.ninjaCast=null;actor.z=0;actor.ninjaUntargetableUntil=0;}
  function clear(run,actor=null,events=[]){
    if(actor&&actor.type!=='ninja')return;
    const sources=actor?[actor]:[run.hero,...run.allies];for(const a of sources){cancel(run,a,events);releaseClones(run,a,events);a.ninjaEcho=null;}
    const keep=p=>actor&&p.source!==actor;
    run.ninjaProjectiles=(run.ninjaProjectiles||[]).filter(keep);run.ninjaFields=(run.ninjaFields||[]).filter(keep);run.ninjaEchoQueue=(run.ninjaEchoQueue||[]).filter(keep);
    for(const e of run.enemies)if(actor)C.clearSource(e,actor.id,run.time);else C.clear(e);
  }
  function start(run,actor,s,target,api,events=[],force=false){
    if(run.status!=='running'||actor.hp<=0||actor.sleepUntil>run.time||actor.silenceUntil>run.time&&s.kind!=='normal'||actor.ninjaCast||!target||target.hp<=0||actor.mp<s.mp)return false;
    if(!force&&((actor.ninjaCooldowns?.[s.id]||0)>0||(S.CLONE_IDS.includes(s.id)&&(!actor.epicNinjaArmor&&(actor.cloneReadyAt||0)>run.time||run.ninjaClones.some(c=>c.source===actor&&(!actor.epicNinjaArmor||c.skillId===s.id))))))return false;
    if(actor.rootAnchor&&['cross','volley','fan'].includes(s.pattern))return false;
    actor.ninjaCooldowns||={};const c=S.begin(s,actor,target);c.actionId='ninja-'+(++run.serial);actor.ninjaCast=c;
    actor.mp-=s.mp;actor.ninjaCooldowns[s.id]=s.cooldown;actor.facing=c.facing;api.state(actor,s.kind==='normal'?'attacking':'skill',s.motion);
    if(s.kind==='normal')actor.cooldown=actor.interval;
    events.push({type:'ninja-cast',skillId:s.id,name:s.name,x:actor.x,y:actor.y,timeMs:run.time});return true;
  }
  function targetFor(run,c,actor){const old=run.enemies.find(e=>e.id===c.target.id&&e.hp>0&&!e.invulnerable);if(old&&distance(actor,old)<=c.spec.reach+30)return old;return live(run).filter(e=>distance(actor,e)<=c.spec.reach).sort((a,b)=>distance(actor,a)-distance(actor,b))[0];}
  function prepareEcho(run,actor,c){if(c.echoChecked)return;c.echoChecked=true;const echo=actor.ninjaEcho;if(S.ECHO_IDS.includes(c.spec.id)&&echo?.until>run.time&&echo.remaining>0){echo.remaining--;c.echoRate=echo.power;c.echoUntil=echo.until;if(!echo.remaining)actor.ninjaEcho=null;}}
  function fire(run,actor,c,from,target,mult,options={}){
    if(!target)return;const origin=point(from),dx=target.x-origin.x,dy=target.y-origin.y,len=Math.hypot(dx,dy)||1;
    const p={interferenceKey:'ninja-hit-'+(++run.serial),interferencePower:options.secondary?0:I.power(c.spec,0,true,!!options.finisher),source:actor,actionId:c.actionId,skillId:c.spec.id,skill:c.spec.kind!=='normal',x:origin.x,y:origin.y,origin,
      dx:dx/len,dy:dy/len,damage:options.damage??actor.damage*mult,critical:options.critical??run.random()<(actor.crit||0),
      critMultiplier:options.critMultiplier??actor.critMultiplier,reach:options.reach||c.spec.reach+60,speed:options.speed||1300,
      travel:0,age:0,aimDistance:len,visualHeight:from.visualHeight??88,targetHeight:(target.height||142)*.55,
      kind:options.kind||'shuriken',control:options.secondary?null:c.spec.control,controlDuration:c.spec.controlDuration,
      directed:options.directed||false,targetId:target.id,hitOwners:[],width:options.width||8,
      returnPath:options.returnPath||false,returning:false,fanAction:options.fanAction||null,secondary:options.secondary||false,
      onceControl:options.onceControl||null,finisher:!!options.finisher};
    run.ninjaProjectiles.push(p);
    if(c.echoRate&&!options.secondary){if(p.fanAction)c.echoFan||={fanHits:{}};run.ninjaEchoQueue.push({...p,origin:{...p.origin},hitOwners:[],fanAction:p.fanAction?c.echoFan:null,damage:p.damage*c.echoRate,kind:'shadow-star',control:null,secondary:true,echo:true,echoFacing:actor.facing,echoMotion:actor.motion==='low-dash'?'throw-combo':actor.motion,echoMotionTime:actor.motionTime,at:run.time+150,expires:c.echoUntil});}
    if(actor.epicNinjaWeapon&&!options.epicCopy)for(const [i,offset] of [-7,7].entries()){c.epicFans||=[{fanHits:{}},{fanHits:{}}];fire(run,actor,c,{...from,y:from.y+offset},target,mult,{...options,epicCopy:true,secondary:true,damage:p.damage,critical:p.critical,fanAction:options.fanAction?c.epicFans[i]:null});}
    return p;
  }
  function damage(run,p,target,api,events){
    const owner=C.owner(run,target);if(owner.hp<=0||owner.invulnerable)return false;
    const ok=api.hit(run,p.source,target,p.damage,events,p.skill,'物理',{critical:p.critical,critMultiplier:p.critMultiplier,secondary:p.secondary,actionId:p.actionId,interferencePower:p.secondary?0:p.interferencePower,interferenceKey:p.interferenceKey+':'+Number(p.returning||false)});
    if(ok){effect(run,events,p.kind==='needle'?'lightning':p.kind==='fuma'?'flash':'spark',{x:target.x,y:target.y-(target.height||142)*.55},{skillId:p.skillId,actionId:p.actionId,shadow:p.secondary,finisher:p.finisher});
      if(p.control&&owner.hp>0&&(!p.onceControl||!p.onceControl.has(owner.id))){C.apply(run,owner,p.control,p.controlDuration,p.source.id);p.onceControl?.add(owner.id);}
    }return ok;
  }
  function clones(run,actor,c,events){
    if(actor.epicNinjaArmor)run.ninjaClones=run.ninjaClones.filter(n=>n.source!==actor||n.skillId!==c.spec.id);else releaseClones(run,actor,events);const s=c.spec,group=live(run).filter(e=>distance(e,c.target)<=Math.max(s.radius,250)),ultimate=s.pattern==='ultimate';
    const scattered=s.id==='eight-way-clones'||ultimate;
    for(let i=0;i<(actor.epicNinjaArmor?s.cloneCount:Math.min(6,s.cloneCount));i++){
      const target=group[i%Math.max(1,group.length)]||c.target,angle=i*Math.PI*2/s.cloneCount;
      const pos=arena(scattered?{x:target.x+Math.cos(angle)*220,y:target.y+Math.sin(angle)*110}:{x:actor.x-55+(i%2)*110,y:actor.y+(i%2?-38:38)*(1+Math.floor(i/2)*.4)});
      run.ninjaClones.push({id:c.actionId+'-clone-'+i,type:'ninja',source:actor,index:i,...pos,facing:target.x<pos.x?-1:1,
        start:run.time,until:ultimate&&!actor.epicNinjaArmor?Infinity:run.time+s.lifetime,next:run.time+120+i*(s.id==='eight-way-clones'?40:80),
        interval:actor.interval||800,damage:actor.damage*s.clonePower,crit:actor.crit,critMultiplier:actor.critMultiplier,
        motion:'idle',motionTime:0,throwAt:-Infinity,scattered,spread:s.id!=='shadow-clone',ultimate:ultimate&&!actor.epicNinjaArmor,substitute:s.substitute&&i===0,actionId:c.actionId,skillId:s.id});
      effect(run,events,'smoke-in',pos,{skillId:s.id,actionId:c.actionId,index:i});
    }
    if(s.blindDuration){for(const e of live(run).filter(e=>distance(actor,e)<=s.radius))C.blind(run,e,s.blindDuration,actor.id);effect(run,events,'flash',actor,{radius:s.radius,skillId:s.id});}
  }
  function field(run,actor,c,events){const s=c.spec;run.ninjaFields.push({source:actor,spec:s,center:point(c.target),start:run.time,until:run.time+s.lifetime,next:run.time,index:0,seen:new Set(),actionId:c.actionId});effect(run,events,s.pattern==='caltrop'?'caltrop-scatter':s.pattern==='thread'?'thread-coil':s.pattern==='haze'?'haze':s.pattern==='orbit'?'blade-vortex':'prison',c.target,{radius:s.radius,skillId:s.id,phase:'open'});}
  function emit(run,actor,c,index,api,events){
    const s=c.spec;prepareEcho(run,actor,c);const target=targetFor(run,c,actor),hand={x:actor.x+c.facing*72,y:actor.y,visualHeight:88+(actor.z||0)};
    if(s.pattern==='clone'){clones(run,actor,c,events);return;}
    if(s.pattern==='echo'){actor.ninjaEcho={remaining:s.echoCount,power:s.echoPower,until:run.time+s.lifetime};effect(run,events,'smoke-in',actor,{skillId:s.id});return;}
    if(['caltrop','thread','haze','prison','orbit'].includes(s.pattern)){field(run,actor,c,events);return;}
    if(s.pattern==='flash'){const seen=new Set();for(const e of area(run).filter(e=>distance(e,c.target)<=s.radius)){const own=C.owner(run,e);if(seen.has(own.id))continue;seen.add(own.id);if(api.hit(run,actor,e,actor.damage*s.power,events,true,'物理',{interferencePower:I.power(s),interferenceKey:c.actionId+':flash'})&&own.hp>0)C.blind(run,own,s.blindDuration,actor.id);}effect(run,events,'flash',c.target,{radius:s.radius});return;}
    if(s.pattern==='tags'){const targets=live(run).filter(e=>distance(e,c.target)<=s.radius&&distance(actor,e)<=s.reach).sort((a,b)=>distance(a,c.target)-distance(b,c.target)).slice(0,s.targetCount);for(const e of targets)fire(run,actor,c,hand,e,s.power,{kind:'tag',directed:true,speed:1450});return;}
    if(s.pattern==='ultimate'){
      if(index===0){clones(run,actor,c,events);c.finalControls=new Set();return;}
      const targets=live(run).filter(e=>distance(e,c.target)<=s.radius);if(!targets.length)return;
      const final=index===s.events.length-1,shots=run.ninjaClones.filter(n=>n.source===actor&&n.ultimate);
      for(const [i,n] of shots.entries()){n.motion='throw-combo';n.throwAt=run.time;n.motionTime=180;
        const e=targets[(i+index-1)%targets.length];fire(run,actor,c,{...n,visualHeight:88},e,final?s.power*8.4/31.8/6:s.power*23.4/31.8/s.count,
          {kind:final?'fuma':'shuriken',directed:true,control:final,onceControl:final?c.finalControls:null,finisher:final});
        const p=run.ninjaProjectiles.at(-1);if(!final)p.control=null;
      }
      if(final)effect(run,events,'final-ring',c.target,{radius:s.radius,skillId:s.id});return;
    }
    if(!target)return;
    if(s.pattern==='fan'){
      const angle=Math.atan2(c.direction.y,c.direction.x);c.fanHits||={};
      for(let i=0;i<s.count;i++){const a=angle-s.angle/2+s.angle*i/(s.count-1);fire(run,actor,c,hand,{x:hand.x+Math.cos(a)*s.reach,y:hand.y+Math.sin(a)*s.reach,height:142},s.power/s.count,{fanAction:c,speed:1300});}return;
    }
    if(s.pattern==='return'){fire(run,actor,c,hand,{x:hand.x+c.direction.x*s.reach,y:hand.y+c.direction.y*s.reach,height:142},s.power/2,{kind:'fuma',reach:s.reach,speed:1500,width:s.width/2,returnPath:true});return;}
    if(s.pattern==='cross'||s.pattern==='volley'){
      const group=s.pattern==='cross'?live(run).filter(e=>distance(e,c.target)<=180):[target],aim=group[index%Math.max(1,group.length)]||target;
      const side=index%2?-1:1,offset=s.pattern==='cross'?140:Math.min(120,distance(c.origin,aim)/3),positions=[[-1,-32],[1,0],[0,32]],pos=positions[index%3];
      c.dashFrom=point(actor);c.dashAt=run.time;
      c.position=arena({x:s.pattern==='cross'?aim.x+side*offset:c.origin.x+pos[0]*offset,y:s.pattern==='cross'?aim.y+side*45:c.origin.y+pos[1]});
      actor.x=c.position.x;actor.y=c.position.y;actor.facing=aim.x<actor.x?-1:1;c.positionFacing=actor.facing;
      if(s.pattern==='cross')actor.ninjaUntargetableUntil=run.time+60;
      effect(run,events,'shadow-dash',c.position,{from:c.dashFrom,skillId:s.id});
      effect(run,events,'smoke-out',c.position,{skillId:s.id});
      for(let i=0;i<(s.pattern==='cross'?2:s.count/4);i++)fire(run,actor,c,{...c.position,x:actor.x+actor.facing*72,visualHeight:88+(actor.z||0)},aim,s.power/s.count);
      return;
    }
    if(s.pattern==='needles'){const targets=live(run).filter(e=>distance(actor,e)<=s.reach).sort((a,b)=>distance(a,c.target)-distance(b,c.target)).slice(0,s.targetCount);const chosen=index<targets.length?targets[index]:target;c.needleControls||=new Set();fire(run,actor,c,hand,chosen,s.power/s.count,{kind:'needle',onceControl:c.needleControls});return;}
    fire(run,actor,c,hand,target,s.power/s.count,{kind:s.pattern==='pin'?'shadow-pin':'shuriken',reach:s.reach+60});
  }
  function advance(run,actor,api,events){
    const c=actor.ninjaCast;if(!c)return;const rate=actor.webUntil>run.time?.55:1;c.elapsed+=api.STEP*rate*(api.attackRate?.(run,actor)||1);
    const pose=S.sample(c,c.elapsed);Object.assign(actor,{motion:pose.motion,motionTime:pose.motionTime,facing:pose.facing,z:pose.z});
    if(c.position&&!actor.rootAnchor&&c.elapsed<c.spec.duration)Object.assign(actor,{...c.position,facing:c.positionFacing});
    while(c.next<c.spec.events.length&&c.elapsed+1e-6>=c.spec.events[c.next])emit(run,actor,c,c.next++,api,events);
    if(c.elapsed+1e-6>=c.spec.duration){if(c.position&&!actor.rootAnchor)Object.assign(actor,c.origin);if(c.spec.pattern==='ultimate'&&!actor.epicNinjaArmor)releaseClones(run,actor,events);actor.ninjaCast=null;actor.z=0;api.state(actor,'idle');}
  }
  function tickFields(run,api,events){
    run.ninjaFields=run.ninjaFields.filter(f=>f.source.hp>0&&f.until>run.time);
    for(const f of run.ninjaFields){const s=f.spec,targets=area(run).filter(e=>distance(e,f.center)<=s.radius&&(s.pattern!=='caltrop'||!C.owner(run,e).flying));
      for(const e of targets){const own=C.owner(run,e);if(s.slow)C.slow(run,own,s.slow,2000,f.source.id);if(['thread','haze'].includes(s.pattern)&&!f.seen.has(own.id)){f.seen.add(own.id);if(s.pattern==='thread')C.apply(run,own,'root',s.controlDuration,f.source.id);else C.blind(run,own,s.blindDuration,f.source.id);}}
      while(s.pulses&&f.index<s.pulses&&run.time+1e-6>=f.next){f.index++;f.next=f.start+f.index*s.pulse;
        const seen=new Set();for(const e of targets){const own=C.owner(run,e);if(seen.has(own.id))continue;seen.add(own.id);
          const p={interferencePower:I.power(s),interferenceKey:f.actionId+':'+f.index,source:f.source,skillId:s.id,skill:true,damage:f.source.damage*s.power/s.pulses,kind:s.pattern==='orbit'?'fuma':'shadow-star',control:s.pattern==='prison'?'stop':null,controlDuration:s.controlDuration};damage(run,p,e,api,events);}
        effect(run,events,s.pattern==='thread'?'thread-stretch':s.pattern==='prison'?'prison':s.pattern==='orbit'?'blade-vortex':'spark',f.center,{radius:s.radius,skillId:s.id,phase:'pulse',index:f.index});
      }
    }
  }
  function tickClones(run,api,events){
    for(const actor of [run.hero,...run.allies]){const owned=run.ninjaClones.filter(n=>n.source===actor);if(owned.length&&owned.every(n=>n.until<=run.time||actor.hp<=0))releaseClones(run,actor,events);if(actor.ninjaEcho?.until<=run.time)actor.ninjaEcho=null;}
    run.ninjaClones=run.ninjaClones.filter(n=>n.until>run.time&&n.source.hp>0);
    for(const n of run.ninjaClones){if(n.ultimate){n.motionTime=180+Math.min(419,run.time-n.throwAt);continue;}const actor=n.source;
      n.motionTime=run.time-n.throwAt;n.motion=n.motionTime<520?'attack-shuriken':'idle';
      if(actor.bubbleUntil>run.time||actor.controlKind==='stop'&&actor.controlUntil>run.time){n.next=Math.max(n.next,run.time+api.STEP);continue;}
      const targets=live(run).sort((a,b)=>distance(a,actor)-distance(b,actor)),target=n.spread?targets[n.index%Math.max(1,targets.length)]:targets[0];if(!target)continue;
      const pos=arena(n.scattered?{x:target.x+Math.cos(n.index*Math.PI/3)*220,y:target.y+Math.sin(n.index*Math.PI/3)*90}:{x:actor.x-65+(n.index%2)*110,y:actor.y+(n.index%2?-38:38)*(1+Math.floor(n.index/2)*.4)});
      if(distance(n,pos)>45){effect(run,events,'smoke-out',n);Object.assign(n,pos);}n.facing=target.x<n.x?-1:1;
      if(run.time>=n.next&&distance(n,target)<=360){n.next=run.time+n.interval;n.throwAt=run.time-180;n.motion='attack-shuriken';n.motionTime=180;
        fire(run,actor,{spec:S.spec('shuriken'),actionId:actor.actionId||n.actionId}, {...n,x:n.x+n.facing*72},target,0,{damage:n.damage,critical:run.random()<(n.crit||0),critMultiplier:n.critMultiplier,kind:'shadow-star',secondary:true,reach:420});}
    }
  }
  // Swept ground collision keeps fast projectiles from tunnelling through enemies.
  function intersection(p,a,b,e){const vx=b.x-a.x,vy=b.y-a.y,len2=vx*vx+vy*vy;
    const t=clamp(((e.x-a.x)*vx+(e.y-a.y)*vy)/(len2||1),0,1),r=(e.collisionRadius||Math.min(50,Math.max(20,(e.height||100)*.2)))+p.width;
    return distance({x:a.x+vx*t,y:a.y+vy*t},e)<=r?t:null;}
  function tickProjectiles(run,api,events){
    const pending=[];for(const p of run.ninjaEchoQueue){if(p.source.hp<=0||p.expires<=run.time)continue;if(p.at<=run.time&&!(p.source.bubbleUntil>run.time)&&!C.stopped(p.source,run.time)){run.ninjaProjectiles.push({...p,x:p.origin.x,y:p.origin.y,age:0,travel:0,hitOwners:[],returning:false});}else pending.push(p);}run.ninjaEchoQueue=pending;
    for(const p of run.ninjaProjectiles){const a=point(p);p.age+=api.STEP;const travel=Math.min(p.speed*api.STEP/1000,p.reach-p.travel);p.x+=p.dx*travel;p.y+=p.dy*travel;p.travel+=travel;
      let contacts=run.enemies.filter(e=>e.hp>0&&!e.invulnerable&&(!p.directed||e.id===p.targetId)).map(e=>({e,t:intersection(p,a,p,e)})).filter(o=>o.t!==null).sort((a,b)=>a.t-b.t);
      for(const {e} of contacts){const own=C.owner(run,e),key=own.id+(p.returning?'-return':'-out');if(p.hitOwners.includes(key))continue;
        if(p.fanAction&&(p.fanAction.fanHits[own.id]||0)>=2)continue;
        p.hitOwners.push(key);const ok=damage(run,p,e,api,events);if(ok&&p.fanAction)p.fanAction.fanHits[own.id]=(p.fanAction.fanHits[own.id]||0)+1;
        if(!p.returnPath){p.done=true;break;}
      }
      if(p.directed&&!run.enemies.some(e=>e.id===p.targetId&&e.hp>0&&!e.invulnerable))p.done=true;
      if(p.travel+1e-6>=p.reach){if(p.returnPath&&!p.returning){p.returning=true;p.dx=-p.dx;p.dy=-p.dy;p.travel=0;}else p.done=true;}
    }run.ninjaProjectiles=run.ninjaProjectiles.filter(p=>!p.done);
  }
  function tick(run,api,events){tickFields(run,api,events);tickClones(run,api,events);tickProjectiles(run,api,events);}
  function substitute(run,actor,events){const n=run.ninjaClones.find(n=>n.source===actor&&n.substitute&&n.until>run.time);if(!n)return false;n.until=run.time;effect(run,events,'smoke-out',n);effect(run,events,'flash',actor);
    if(!actor.rootAnchor){const direction=live(run).reduce((sum,e)=>sum+(actor.x-e.x),0)<0?-1:1;Object.assign(actor,arena({x:actor.x+direction*36,y:actor.y}));}
    if(!run.ninjaClones.some(c=>c.source===actor&&c.until>run.time))actor.cloneReadyAt=run.time+8000;
    return true;
  }
  function reconcile(run,actor){if(!actor.epicNinjaArmor){const owned=run.ninjaClones.filter(c=>c.source===actor),id=owned[0]?.skillId,s=actor.ninjaSkills.find(s=>s.id===id),keep=owned.filter(c=>c.skillId===id).slice(0,Math.min(6,s?.cloneCount||0));run.ninjaClones=run.ninjaClones.filter(c=>c.source!==actor||keep.includes(c));}for(const c of run.ninjaClones.filter(c=>c.source===actor)){const s=actor.ninjaSkills.find(s=>s.id===c.skillId);if(s){c.damage=actor.damage*s.clonePower;c.until=Math.min(c.until,run.time+(s.lifetime||s.duration));}}if(actor.ninjaEcho&&!actor.epicNinjaWeapon)actor.ninjaEcho.power=(actor.ninjaSkills.find(s=>s.id==='shadow-echo')?.echoPower)||.35;}
  return {reconcile,init,start,advance,tick,clear,cancel,substitute,intersection,fire,damage};
});
