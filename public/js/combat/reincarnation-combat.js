'use strict';
((root,factory)=>{
  const common=typeof module==='object'&&module.exports;
  const api=factory(common?require('../data/reincarnation-data.js'):root.ReincarnationData,common?require('./action-interference.js'):root.ActionInterference);
  if(common)module.exports=api;else root.ReincarnationCombat=api;
})(globalThis,(D,I)=>{
  const party=run=>[run.hero,...run.allies].filter(a=>a.hp>0), aim=a=>({x:Math.max(95,Math.min(930,a.x)),y:Math.max(334,Math.min(501,a.y))});
  const reference={warrior:[106132,4449.25],mage:[105418,4448.25],paladin:[106628,4453.25],ninja:[105448,4449.25],shaman:[105408,4448.25],miko:[105428,4449.25]};
  function clear(run){for(const e of run.enemies.filter(e=>e.reincarnationGoddess)){e.deliveryPlan=null;e.goddessForecast=null;I.clear(e);}run.deliveryEffects=[];}
  function depart(run,e){clear(run);e.departedAt=run.time;run.deliveryVictoryAt=run.time;}
  function shape(e,target,kind){
    const from={x:e.x,y:e.y},at=aim(target),angle=Math.atan2(at.y-from.y,at.x-from.x);
    if(kind==='pulse')return {kind:'sector',center:from,radius:500,direction:angle,angle:Math.PI*48/180};
    if(kind==='laser')return {kind:'lane',from,to:{x:from.x+Math.cos(angle)*1100,y:from.y+Math.sin(angle)*1100},width:32,precise:true};
    if(kind==='truck')return {kind:'lane',from:{x:942,y:at.y},to:{x:82,y:at.y},width:64,precise:true};
    return {kind:'circle',center:at,radius:kind==='orbital'?100:64};
  }
  function fx(run,events,id,p,extra={}){events.push({type:'delivery-effect',effect:id,x:p.x,y:p.y,timeMs:run.time,...extra});}
  function begin(run,e,target,api,events){
    const cycle=e.deliveryCycle||0,kind=D.ATTACKS[cycle%6].id;
    e.deliveryCycle=cycle+1;
    const row=D.ATTACKS.find(a=>a.id===kind),live=party(run);
    if(kind==='laser')target=[...live].sort((a,b)=>Math.hypot(b.x-e.x,b.y-e.y)-Math.hypot(a.x-e.x,a.y-e.y))[0];
    if(kind==='orbital')target=[...live].sort((a,b)=>live.filter(c=>Math.hypot(b.x-c.x,b.y-c.y)<=100).length-live.filter(c=>Math.hypot(a.x-c.x,a.y-c.y)<=100).length)[0];
    const p=e.deliveryPlan={...row,kind,elapsed:0,next:0,actionId:e.id+'-delivery-'+(++run.serial),origin:{x:e.x,y:e.y},hitCounts:{},targets:[],shapes:[]};
    p.targets=(kind==='missiles'?live.slice().sort((a,b)=>a.id.localeCompare(b.id)).slice(0,3):[target]).map(a=>a.id);
    p.shapes=(kind==='missiles'?p.targets.map(id=>live.find(a=>a.id===id)):[target]).map(a=>shape(e,a,kind));
    p.times=kind==='pulse'?Array.from({length:6},(_,i)=>p.warn+i*100):kind==='missiles'?p.targets.map((_,i)=>p.warn+500+i*180):['discs','truck'].includes(kind)?[]:[p.warn];
    if(kind==='discs')p.shapes=[{kind:'lane',from:{x:e.x,y:e.y},to:{x:e.x-640,y:e.y},width:102,precise:true}];
    api.state(e,'attacking',kind);
    if(kind==='laser'||kind==='truck'){
      I.begin(run,e,kind,p.warn,target,events,{shapes:p.shapes,hits:1});
      e.actionThreat=null;
    }
    e.goddessForecast={endsAt:run.time+(p.times[0]??p.warn),releaseDelay:0,damageSpan:p.times.length?p.times.at(-1)-p.times[0]:kind==='truck'?650:1400,shapes:p.shapes,targetIds:[]};
    fx(run,events,'fx-summon',{x:e.x,y:e.y-110},{duration:620});
    e.cooldown=p.duration+(e.hp<e.maxHp*.5?1400:2000);
  }
  function damage(run,e,a,p,fraction,api,events){
    if(a.hp<=0||a.invulnerable||a.immuneUntil>run.time||api.immune?.(run,a))return false;
    const [hp,defense]=reference[a.type]||reference.warrior;
    return api.hit(run,e,a,hp*fraction*(1+defense/80)*api.attackPower(run,e)/Math.max(1,e.damage)*(run.trials?.stats||1),events,false,null,{actionId:p.actionId,direct:true,miss:false});
  }
  function release(run,e,p,index,api,events){
    const shapes=p.kind==='missiles'?[p.shapes[index]]:p.shapes;
    for(const a of party(run)){
      if(!shapes.some(s=>I.contains(s,a)))continue;
      const count=p.hitCounts[a.id]||0,max=p.kind==='pulse'?3:p.kind==='discs'?2:1;
      if(count>=max)continue;
      const fraction=p.kind==='pulse'?p.budget/3:p.kind==='discs'?p.budget*(index===0?.6:.4):p.budget;
      if(damage(run,e,a,p,fraction,api,events)){p.hitCounts[a.id]=count+1;
        if(p.kind==='discs'&&index===0){a.deliverySlowUntil=run.time+1200;}
        if(p.kind==='truck')a.x=Math.max(95,a.x-80);
      }
    }
    if(p.kind==='laser')fx(run,events,'fx-beam',p.origin,{shape:p.shapes[0],duration:500});
    else if(p.kind==='pulse'){
      const angle=p.shapes[0].direction+(index%3-1)*.28;
      fx(run,events,'fx-pulse',p.origin,{to:{x:p.origin.x+Math.cos(angle)*500,y:p.origin.y+Math.sin(angle)*500},duration:260});
    }else if(p.kind==='missiles'||p.kind==='orbital'){
      const s=p.kind==='missiles'?p.shapes[index]:p.shapes[0];
      fx(run,events,p.kind==='orbital'?'fx-orbital':'fx-impact',s.center,{duration:650});
    }
  }
  function act(run,e,target,api,events){
    const p=e.deliveryPlan;
    if(p&&e.actionInterference?.interrupted&&p.cancelAt==null){
      p.cancelAt=run.time;p.shapes=[];e.goddessForecast=null;
      fx(run,events,'fx-blast',{x:e.x,y:e.y-60},{duration:760});
      events.push({type:'delivery-cancel',kind:p.kind,timeMs:run.time});
    }
    if(p?.cancelAt!=null){
      e.stagger=0;
      if(run.time-p.cancelAt<2300)return;
      e.deliveryPlan=null;I.clear(e);api.state(e,'idle');e.cooldown=500;return;
    }
    if(e.stagger>0){e.stagger=Math.max(0,e.stagger-api.STEP);return;}
    if(!p){if(e.cooldown<=0)begin(run,e,target,api,events);return;}
    p.elapsed+=api.STEP;
    if(p.kind==='discs'&&p.elapsed>=p.warn&&p.elapsed<p.warn+1400){
      const q=Math.min(1,(p.elapsed-p.warn)/1400),theta=q*Math.PI*2,at={x:e.x-320+Math.cos(theta)*320,y:e.y+Math.sin(theta)*60},half=q<.5?0:1;
      p.discHits ||= new Set();p.slowed ||= new Set();
      for(const a of party(run))if(!p.discHits.has(a.id+':'+half)&&Math.hypot(a.x-at.x,a.y-at.y)<=42){
        if(damage(run,e,a,p,p.budget*(half===0?.6:.4),api,events)){p.discHits.add(a.id+':'+half);if(!p.slowed.has(a.id)){p.slowed.add(a.id);a.deliverySlowUntil=run.time+1200;}}
      }
    }
    if(p.kind==='truck'&&p.elapsed>=p.warn&&p.elapsed<p.warn+650){
      const x=942-(p.elapsed-p.warn)/650*1100,previous=942-Math.max(0,p.elapsed-p.warn-api.STEP)/650*1100,y=p.shapes[0].from.y;
      for(const a of party(run))if(!p.hitCounts[a.id]&&Math.abs(a.y-y)<=64&&a.x>=x-90&&a.x<=previous+90){if(damage(run,e,a,p,p.budget,api,events)){p.hitCounts[a.id]=1;a.x=Math.max(95,a.x-80);}}
    }
    if(p.kind==='laser'&&p.elapsed<p.warn-700){p.shapes=[shape(e,party(run).find(a=>a.id===p.targets[0])||target,'laser')];}
    if(p.kind==='missiles')for(let i=0;i<p.targets.length;i++)if(p.elapsed<p.times[i]-250){const a=party(run).find(a=>a.id===p.targets[i]);if(a)p.shapes[i]=shape(e,a,'missiles');}
    if(p.kind==='orbital'&&p.elapsed<700){const a=party(run).find(a=>a.id===p.targets[0]);if(a)p.shapes=[shape(e,a,'orbital')];}
    if(e.goddessForecast)e.goddessForecast.shapes=p.shapes;
    if(e.actionInterference)e.actionInterference.shapes=p.shapes;
    while(p.next<p.times.length&&p.elapsed>=p.times[p.next])release(run,e,p,p.next++,api,events);
    if(p.elapsed>=p.duration){e.deliveryPlan=null;e.goddessForecast=null;I.clear(e);api.state(e,'idle');}
  }
  return {begin,act,clear,depart,shape,damage};
});
