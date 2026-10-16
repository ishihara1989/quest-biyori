'use strict';
((root,factory)=>{const common=typeof module==='object'&&module.exports;const api=factory(common?require('../data/goddess-data.js'):root.GoddessData,common?require('./action-interference.js'):root.ActionInterference);if(common)module.exports=api;else root.GoddessCombat=api;})(globalThis,(D,I)=>{
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),party=run=>[run.hero,...run.allies].filter(a=>a.hp>0);
  const REFERENCE={warrior:[106132,4449.25],mage:[105418,4448.25],paladin:[106628,4453.25],ninja:[105448,4449.25],shaman:[105408,4448.25],miko:[105428,4449.25]};
  function init(run){run.goddess={projectiles:[],phantom:null,bag:[],lastRegion:0,lastMajor:null,streak:0,lastImpact:-Infinity,nextMirror:1800,nextNormal:900,cycle:0};}
  function clear(run){if(!run.goddess)return;run.goddess.projectiles=[];run.goddess.phantom=null;for(const e of run.enemies.filter(e=>e.goddess)){e.goddessPlan=null;e.goddessForecast=null;I.clear(e);}for(const a of [run.hero,...run.allies])a.goddessDot=null;}
  function depart(run,e){clear(run);e.departedAt=run.time;e.departurePhase=e.goddessPhase||1;e.phaseChangeAt=null;}
  function pick(run){const g=run.goddess;if(!g.bag.length){g.bag=Array.from({length:10},(_,i)=>i+1);for(let i=9;i>0;i--){const j=Math.floor(run.random()*(i+1));[g.bag[i],g.bag[j]]=[g.bag[j],g.bag[i]];}if(g.bag.at(-1)===g.lastRegion)[g.bag[0],g.bag[9]]=[g.bag[9],g.bag[0]];}
    const region=g.bag.pop(),major=g.streak>=2?!g.lastMajor:run.random()<.5;g.streak=major===g.lastMajor?g.streak+1:1;g.lastRegion=region;g.lastMajor=major;return D.PHANTOMS[(region-1)*2+Number(major)];}
  const aim=a=>({x:clamp(a.x,95,930),y:clamp(a.y,334,501)});
  function shapes(run,kind,origin,target){const at=aim(target),angle=Math.atan2(at.y-origin.y,at.x-origin.x),lane=(direction,width=50)=>({kind:'lane',from:{...origin},to:{x:origin.x+Math.cos(direction)*700,y:origin.y+Math.sin(direction)*700},length:700,width,precise:true});
    if(['lane','beam'].includes(kind))return[lane(angle,60)];if(kind==='cross')return[lane(angle-.36),lane(angle+.36)];
    if(kind==='sector')return[{kind:'sector',center:{...origin},radius:600,direction:angle,angle:Math.PI*.8}];
    if(kind==='annulus')return[{kind:'annulus',center:at,radius:210,innerRadius:70}];
    if(kind==='rings')return[160,280,400].map(radius=>({kind:'annulus',center:at,innerRadius:Math.max(0,radius-100),radius}));
    if(kind==='zero')return[{kind:'circle',center:at,radius:180}];
    const rows=kind==='circle'?[at]:party(run).slice(0,3).map(aim);return rows.map(center=>({kind:'circle',center,radius:kind==='triple'?105:85}));
  }
  const immune=(run,a,api)=>a.invulnerable||a.immuneUntil>run.time||api.immune?.(run,a);
  function status(run,e,a,name,api,events){if(!name||a.hp<=0||immune(run,a,api))return;
    if(name==='root'||name==='freeze'){const live=party(run),limit=live.length>2?2:live.length===2?1:0,stopped=live.filter(b=>b.freezeUntil>run.time||b.rootUntil>run.time||b.sleepUntil>run.time||b.bubbleUntil>run.time);
      if(!limit||stopped.length>=limit||stopped.includes(a)||a.goddessControlImmuneUntil>run.time||a.freezeImmuneUntil>run.time)return;
      if(['miko','paladin'].includes(a.type)&&stopped.some(b=>['miko','paladin'].includes(b.type)))return;
      if(Resistance.resists(run,a,events))return;
      a.goddessControlImmuneUntil=run.time+4000;if(name==='freeze')a.freezeUntil=run.time+1000;else{a.rootUntil=run.time+1000;a.rootAnchor={x:a.x,y:a.y};}
    }else if(name!=='push'&&Resistance.resists(run,a,events))return;
    else if(name==='sand')a.sandSlowUntil=run.time+3000;
    else if(name==='curse')a.enemyCurseUntil=run.time+3000;
    else if(name==='push')a.x=clamp(a.x-22,95,930);
    else a.goddessDot={source:e,kind:name,until:run.time+3000,next:run.time+1000,fraction:.012};
    events.push({type:'status',kind:{root:'拘束',freeze:'凍結',sand:'砂縛り',curse:'呪い',poison:'毒',burn:'火傷',push:'風圧'}[name],target:a.id,x:a.x,y:a.y,timeMs:run.time});
  }
  function damage(run,e,a,fraction,api,events,actionId,kind='direct'){if(a.hp<=0||immune(run,a,api))return false;const [hp,def]=REFERENCE[a.type]||REFERENCE.warrior;
    const raw=hp*fraction*(1+def/80)*api.attackPower(run,e)/Math.max(1,e.damage);return api.hit(run,e,a,raw,events,false,null,{actionId,direct:kind==='direct',miss:false,curseKind:kind});}
  function effect(run,events,kind,at,extra={}){events.push({type:'goddess-effect',kind,x:at.x,y:at.y,timeMs:run.time,...extra});}
  function forecast(e,run,p,targets){e.goddessForecast={endsAt:run.time+p.times[0],releaseDelay:p.kind==='meteor'?750:0,damageSpan:p.times.at(-1)-p.times[0],shapes:p.shapes||[],targetIds:targets||[]};}
  function begin(run,e,target,api,events){const g=run.goddess;
    if(e.goddessPhase===1){if(run.time>=g.nextMirror&&run.time-g.lastImpact>=1500){const row=pick(run),times=row.kind==='triple'?[1200,1650,2100]:row.kind==='cross'?[1200,1800]:[1200];
        const p={kind:'phantom',row,times,next:0,elapsed:0,duration:times.at(-1)+250,origin:{x:632,y:464},hitCounts:{},actionId:e.id+'-mirror-'+(++run.serial)};p.shapes=shapes(run,row.kind,p.origin,target);g.phantom=p;e.goddessPlan=p;api.state(e,'attacking','snap');forecast(e,run,p);g.nextMirror=run.time+8000;effect(run,events,'snap',{x:e.x+58,y:e.y-172});return;}
      if(run.time>=g.nextNormal){const p=e.goddessPlan={kind:'star',times:[240],next:0,elapsed:0,duration:500,targetId:target.id,actionId:e.id+'-star-'+(++run.serial)};api.state(e,'attacking','shot');g.nextNormal=run.time+3000;forecast(e,run,p,[target.id]);}return;}
    const next=g.cycle++%4;
    if(next%2===0){const selected=[...party(run)];for(let i=selected.length-1;i>0;i--){const j=Math.floor(run.random()*(i+1));[selected[i],selected[j]]=[selected[j],selected[i]];}
      const targets=selected.slice(0,3).map(a=>a.id),p=e.goddessPlan={kind:'meteor',times:targets.map((_,i)=>450+i*150),next:0,elapsed:0,duration:1500,targets,actionId:e.id+'-meteor-'+(++run.serial)};api.state(e,'attacking','meteor');forecast(e,run,p,targets);e.cooldown=5500;return;}
    const row=D.DANGERS[Math.floor(g.cycle/2-1)%3],p=e.goddessPlan={...row,times:row.offsets.map(t=>row.warn+t),next:0,elapsed:0,duration:row.warn+row.offsets.at(-1)+650,origin:{x:e.x,y:e.y},hitCounts:{},actionId:e.id+'-danger-'+(++run.serial)};
    p.shapes=shapes(run,p.kind,p.origin,target);api.state(e,'attacking',p.motion);I.begin(run,e,p.motion,p.warn,target,events,{shapes:p.shapes,hits:p.times.length,damageSpan:p.times.at(-1)-p.times[0]});e.actionThreat=null;e.cooldown=p.duration+row.rest;
  }
  function release(run,e,p,index,api,events){const g=run.goddess;
    if(p.kind==='star'||p.kind==='meteor'){const id=p.kind==='star'?p.targetId:p.targets[index],a=party(run).find(a=>a.id===id);if(!a)return;
      const origin=p.kind==='star'?{x:e.x+58,y:e.y-172}:{x:e.x+(index-1)*68,y:e.y-270};g.projectiles.push({source:e,kind:p.kind,targetId:id,origin,x:origin.x,y:origin.y,age:0,duration:p.kind==='star'?600:750,actionId:p.actionId});return;}
    const phantom=p.kind==='phantom',shapeList=phantom&&p.row.kind==='triple'?[p.shapes[index%p.shapes.length]]:p.kind==='cross'||phantom&&p.row.kind==='cross'?[p.shapes[index]]:p.kind==='rings'?[p.shapes[index]]:p.shapes;
    for(const a of party(run)){if(!shapeList.some(s=>I.contains(s,a)))continue;const count=p.hitCounts[a.id]||0,max=phantom?2:p.kind==='zero'?1:2;if(count>=max)continue;
      const fraction=phantom?(p.row.kind==='circle'?.12:.065):index===0?.33:.17;
      if(damage(run,e,a,fraction,api,events,p.actionId)){p.hitCounts[a.id]=count+1;if(phantom)status(run,e,a,p.row.status,api,events);}}
    effect(run,events,phantom?'phantom-hit':p.kind,p.origin,{shapes:shapeList,effect:phantom?p.row.effect:null,phantom:phantom?p.row.id:null});g.lastImpact=run.time;
  }
  function act(run,e,target,api,events){const g=run.goddess;e.goddessPhase||=1;
    if(e.hp<=e.maxHp*.5&&e.goddessPhase===1&&!e.phaseChangeAt){e.phaseChangePending=true;if(e.goddessPlan?.next===0){e.goddessPlan=null;g.phantom=null;e.goddessForecast=null;}if(!g.projectiles.length&&!g.phantom){e.phaseChangeAt=run.time;e.goddessPlan=null;e.goddessForecast=null;I.clear(e);api.state(e,'idle','rise');effect(run,events,'awaken',{x:e.x,y:e.y});}}
    if(e.phaseChangeAt!=null){if(run.time-e.phaseChangeAt<2400)return;e.goddessPhase=2;e.phaseChangePending=false;e.phaseChangeAt=null;e.cooldown=500;g.cycle=0;api.state(e,'idle');}
    if(e.stagger>0){if(e.goddessPlan){e.goddessPlan=null;e.goddessForecast=null;g.phantom=null;}e.stagger=Math.max(0,e.stagger-api.STEP);e.breakAt??=run.time;api.state(e,'idle','break');return;}
    if(e.breakAt!=null){if(run.time-e.breakAt<700)return;e.breakAt=null;}
    const p=e.goddessPlan;
    if(p){p.elapsed+=api.STEP;while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next])release(run,e,p,p.next++,api,events);if(p.elapsed>=p.duration){e.goddessPlan=null;e.goddessForecast=null;if(p.kind==='phantom')g.phantom=null;I.clear(e);api.state(e,'idle');}return;}
    if(e.phaseChangePending)return;
    if(e.goddessPhase===2&&party(run).some(a=>a.freezeUntil>run.time||a.rootUntil>run.time||a.sleepUntil>run.time))return;
    if(e.cooldown===0)begin(run,e,target,api,events);
  }
  function tick(run,api,events){const g=run.goddess;if(!g)return;
    for(const b of g.projectiles){const a=party(run).find(a=>a.id===b.targetId);if(!a||b.source.hp<=0){b.done=true;continue;}b.age+=api.STEP;const q=clamp(b.age/b.duration,0,1),tx=a.x,ty=a.y-a.height*.35;b.x=b.origin.x+(tx-b.origin.x)*q;b.y=b.origin.y+(ty-b.origin.y)*q-Math.sin(q*Math.PI)*85;
      if(q>=1){damage(run,b.source,a,b.kind==='meteor'?.11:.055,api,events,b.actionId);effect(run,events,b.kind==='meteor'?'meteor-impact':'star-impact',{x:a.x,y:a.y-35});b.done=true;g.lastImpact=run.time;}}
    g.projectiles=g.projectiles.filter(b=>!b.done);
    for(const a of party(run)){const d=a.goddessDot;if(!d)continue;if(immune(run,a,api)){a.goddessDot=null;continue;}if(run.time>=d.next&&d.next<=d.until){damage(run,d.source,a,d.fraction,api,events,d.source.id+'-dot',d.kind);d.next+=1000;}if(run.time>=d.until)a.goddessDot=null;}
  }
  return{init,clear,depart,act,tick,pick,shapes,status,damage,begin,release,REFERENCE};
});
