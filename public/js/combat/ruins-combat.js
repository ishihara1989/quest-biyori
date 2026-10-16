'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RuinsCombat=api;})(globalThis,()=>{
  const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),party=run=>[run.hero,...run.allies].filter(a=>a.hp>0);
  const BEAM_WIDTH=95;
  // Impact timestamps follow the supplied animation manifests. Volley starts are staggered.
  const ACTIONS={
    'stone-guard':[['strike',790,[400],'stone-slash',1,160],['sweep',840,[420],'stone-slash',.8,190]],
    'rune-gargoyle':[['claw',700,[340],'rune-claw',1,155],['shock',830,[440],'rune-shock',.8,150]],
    'ancient-crossbowman':[['shoot',840,[440],'infantry-bolt',1,0],['double',820,[240,370],'infantry-bolt',.65,0]],
    'floating-magic-core':[['bolt',900,[500],'magic-bolt',1,0],['bomb',1020,[540],'magic-burst',.85,95]],
    'armored-golem':[['slam',1060,[540],'stone-impact',1.1,160],['sweep',840,[420],'golem-sweep',.85,230],['combo',960,[260,430],'stone-impact',.65,160]],
    'ancient-ballista':[['shoot',840,[440],'heavy-bolt',1.1,0],['fan',960,[500,620,740],'heavy-bolt',.65,0],['burst',940,[240,400,500],'heavy-bolt',.55,0],['ram',780,[380],'bronze-impact',.8,140]],
    seraphina:[['volley',1000,[500,600,700],'seraph-light',.6,0],['ring',980,[480],'ring-blade',.9,220],['pillars',1120,[560,700,840],'light-pillar',.9,75],['rest',1520,[340],'recharge',0,0]],
    'ancient-titan':[['slam',1060,[540],'stone-impact',1.05,185],['fire',1020,[280,460],'cannon-shell',.7,160],['beam',1520,[660,800,940,1080],'furnace-beam',.3,0],['stomp',1060,[540],'magic-quake',.85,235],['vent',1700,[360],'vent-steam',0,0]]
  };
  function init(run){run.ruinsProjectiles=[];}
  function effect(run,events,id,at,extra={}){events.push({type:'ruins-effect',effect:'ruins-'+id,x:at.x,y:at.y,timeMs:run.time,...extra});}
  function start(run,e,target,api,events){const choices=ACTIONS[e.type];if(!choices)return false;
    let row=choices[e.attacks%choices.length];if(api.control.sealed(e,run.time))row=choices[0];if(e.type==='ancient-ballista'&&distance(e,target)<140)row=choices.at(-1);
    let [motion,duration,times,fx,power,radius]=row;const prep=I.config(e,motion);if(prep){const shift=Math.max(0,prep.warn-times[0]);times=times.map(t=>t+shift);duration+=shift;}const rearCannon=e.type==='ancient-titan'&&motion==='fire',others=party(run).sort((a,b)=>rearCannon?distance(e,b)-distance(e,a):distance(e,a)-distance(e,b));
    const aim={x:target.x,y:target.y},points=times.map((_,i)=>{const a=['volley','fan','pillars','fire'].includes(motion)?others[i%others.length]:target;return {x:a.x,y:a.y,targetId:a.id};});
    e.targetId=target.id;e.attacks++;api.state(e,'attacking',motion);e.cooldown=e.interval+duration;
    e.ruinsPlan={motion,duration,times,fx,power,radius,aim,points,elapsed:0,next:0,origin:{x:e.x,y:e.y},damage:api.attackPower(run,e),actionId:e.actionId};
    const releaseDelay=['shoot','double','bolt','bomb','fan','burst','volley','fire'].includes(motion)?Math.max(180,distance(e,points[0])/850*1000):0;
    const a=I.begin(run,e,motion,prep?times[0]:0,target,events,{releaseDelay,damageSpan:times.at(-1)-times[0],hits:times.length});e.ruinsPlan.threat=e.actionThreat;if(a)a.shapes=motion==='beam'?[{kind:'lane',from:a.origin,to:a.aim,length:650,width:BEAM_WIDTH}]:['sweep','ring','shock','stomp'].includes(motion)?[{kind:'circle',center:a.origin,radius}]:points.map(pt=>({kind:'circle',center:pt,radius:radius||65}));
    return true;
  }
  function damage(run,e,a,power,api,events,plan){if(a.hp<=0||a.invulnerable)return;api.hit(run,e,a,plan.damage*power,events,false,['rune-gargoyle','floating-magic-core','seraphina'].includes(e.type)||['beam','stomp'].includes(plan.motion)?'魔法':null,{actionId:plan.actionId,direct:true,threat:plan.threat,threatIndex:plan.damageIndex||0});}
  function release(run,e,p,index,api,events){const point=p.points[index];
    p.damageIndex=index;
    if(!p.power){effect(run,events,p.fx,e);return;}
    if(p.motion==='beam'){
      const dx=p.aim.x-p.origin.x,dy=p.aim.y-p.origin.y,len=Math.hypot(dx,dy)||1;
      for(const a of party(run)){const x=a.x-p.origin.x,y=a.y-p.origin.y,along=(x*dx+y*dy)/len,side=Math.abs(x*dy-y*dx)/len;if(along>=-20&&along<=650&&side<=BEAM_WIDTH)damage(run,e,a,p.power,api,events,p);}
      if(index===0)effect(run,events,p.fx,p.origin,{to:p.aim,duration:500,angle:Math.atan2(dy,dx)});return;
    }
    if(p.motion==='pillars'){for(const a of party(run).filter(a=>distance(a,point)<=p.radius))damage(run,e,a,p.power,api,events,p);effect(run,events,p.fx,point);return;}
    const ranged=['shoot','double','bolt','bomb','fan','burst','volley','fire'].includes(p.motion);
    if(ranged){run.ruinsProjectiles.push({source:e,x:e.x,y:e.y,origin:{x:e.x,y:e.y},to:point,targetId:point.targetId,age:0,duration:Math.max(180,distance(e,point)/850*1000),power:p.power,radius:p.radius,fx:p.fx,plan:{...p}});return;}
    const center=['sweep','ring','shock','stomp'].includes(p.motion)?e:p.aim;
    for(const a of party(run).filter(a=>distance(a,center)<=p.radius&&distance(e,a)<=p.radius+80))damage(run,e,a,p.power,api,events,p);effect(run,events,p.fx,center,{facing:e.facing});
  }
  function advance(run,e,api,events){const p=e.ruinsPlan;if(!p)return;p.elapsed+=api.STEP;e.motionTime=p.elapsed;
    while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next]){release(run,e,p,p.next,api,events);p.next++;}
    if(p.elapsed>=p.duration){e.ruinsPlan=null;api.state(e,'idle');}
  }
  function tick(run,api,events){for(const p of run.ruinsProjectiles){p.age+=api.STEP;const q=Math.min(1,p.age/p.duration);p.x=p.origin.x+(p.to.x-p.origin.x)*q;p.y=p.origin.y+(p.to.y-p.origin.y)*q;
    if(q>=1){const targets=party(run).filter(a=>p.radius?distance(a,p.to)<=p.radius:a.id===p.targetId&&distance(a,p.to)<=65);for(const a of targets)damage(run,p.source,a,p.power,api,events,p.plan);effect(run,events,p.radius?'magic-burst':'bronze-impact',p.to);p.done=true;}}
    run.ruinsProjectiles=run.ruinsProjectiles.filter(p=>!p.done);
  }
  function clear(run){run.ruinsProjectiles=[];for(const e of run.enemies)e.ruinsPlan=null;}
  return {ACTIONS,init,start,advance,tick,clear};
});
