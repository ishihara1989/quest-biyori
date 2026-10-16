'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DesertCombat=api;})(globalThis,()=>{
  const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),party=run=>[run.hero,...run.allies].filter(a=>a.hp>0);
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
  const action=(motion,warn,times,power,radius=0,kind='melee',status=null,rest=0)=>({motion,warn,times,power,radius,kind,status,duration:Math.max(warn,...times)+450+rest});
  const ACTIONS={
    'sand-scorpion':[action('pincer',350,[350],1,145),action('sting',600,[600],.8,155,'melee','poison')],
    'bandage-soldier':[action('slash',400,[400],1,170),action('bind',600,[600],.65,0,'projectile','sand')],
    'sand-snake':[action('bolt',450,[450],1,0,'projectile'),action('sidestep',400,[400],.8,0,'projectile')],
    'obsidian-scorpion':[action('sweep',1000,[1000],.95,215,'arc'),action('stingers',1100,[1100,1400,1700],.34,205,'melee','poison'),action('volley',1000,[1000,1300],.45,55,'projectile','poison'),action('rest',1500,[],0,0,'rest')],
    'golden-pharaoh':[action('wave',1100,[1100],.95,42,'line'),action('binds',1100,[1100],.6,82,'ground','sand'),action('summon',1100,[1100],0,0,'summon'),action('rest',2000,[],0,0,'rest')],
    lamia:[action('volley',1000,[1000,1150,1300],.4,0,'projectile'),action('sweep',1000,[1000],.9,225,'arc'),action('binds',1200,[1200],.55,82,'ground','sand'),action('rest',2000,[],0,0,'rest')],
    'sand-behemoth':[action('charge',1400,[1640],1.1,70,'charge'),action('quake',1500,[1500],.9,40,'fissure'),action('roar',1200,[1200],.55,255,'arc','sand'),action('burrow',1200,[2000],.9,115,'burrow',null,1500),action('rest',2500,[],0,0,'rest')]
  };
  function init(run){run.desertProjectiles=[];}
  function effect(run,events,id,at,extra={}){events.push({type:'desert-effect',effect:'desert-'+id,x:at.x,y:at.y,timeMs:run.time,...extra});}
  function start(run,e,target,api,events){const actions=ACTIONS[e.type];if(!actions)return false;const choices=run.stage.special?actions.filter(a=>a.kind!=='summon'):actions;
    const index=api.control.sealed(e,run.time)?0:e.attacks%choices.length,base=choices[index],prep=I.config(e,base.motion),shift=prep?Math.max(0,prep.warn-base.warn):0,row={...base,warn:base.warn+shift,times:base.times.map(t=>t+shift),duration:base.duration+shift},others=party(run).sort((a,b)=>distance(e,a)-distance(e,b));
    if(e.type==='sand-behemoth'&&row.kind==='burrow')target=others.at(-1);
    const points=row.kind==='ground'?others.slice(0,2).map(a=>({x:a.x,y:a.y,targetId:a.id})):row.times.map((_,i)=>{const a=row.motion==='volley'?others[i%others.length]:target;return{x:a.x,y:a.y,targetId:a.id};});
    const aim={x:target.x,y:target.y},origin={x:e.x,y:e.y};
    e.targetId=target.id;e.attacks++;e.facing=target.x<e.x?-1:1;api.state(e,'attacking',row.motion);e.cooldown=e.interval+row.duration;
    e.desertPlan={...row,points,aim,origin,elapsed:0,next:0,damage:api.attackPower(run,e),actionId:e.actionId,lines:e.hp<=e.maxHp*.5?5:3};
    if(row.kind==='burrow')e.desertPlan.landing={x:Math.max(95,Math.min(944,aim.x+e.facing*80)),y:aim.y};
    const releaseDelay=Math.max(0,(row.times[0]||row.warn)-row.warn)+(row.kind==='projectile'?Math.max(220,distance(e,points[0])/720*1000):0);
    const a=I.begin(run,e,row.motion,prep?row.warn:0,target,events,{releaseDelay,hits:row.times.length});e.desertPlan.threat=e.actionThreat;if(a)a.shapes=forecast(e,e.desertPlan);
    return true;
  }
  function forecast(e,p){if(['line','charge','fissure'].includes(p.kind))return (p.kind==='fissure'?fissures(p):[p.aim]).map(to=>({kind:'lane',from:p.origin,to,width:p.radius,length:p.kind==='charge'?undefined:650}));const points=['ground','projectile'].includes(p.kind)?p.points:p.kind==='arc'||p.kind==='summon'?[p.origin]:p.kind==='burrow'?[p.landing]:[p.aim];return points.map(center=>({kind:'circle',center,radius:p.radius||(p.kind==='projectile'?65:95)}));}
  function status(run,a,e,p,api,events){if(!p.status||a.hp<=0||a.immuneUntil>run.time||api.immune?.(run,a)||Resistance.resists(run,a,events))return;
    if(p.status==='poison'){const damage=p.damage*.12;if(a.poison){a.poison.until=run.time+4000;a.poison.damage=Math.max(a.poison.damage,damage);}else a.poison={until:run.time+4000,next:run.time+1000,damage,source:e};}
    if(p.status==='sand')a.sandSlowUntil=Math.max(a.sandSlowUntil||0,run.time+3000);
    if(p.status)events.push({type:'status',kind:p.status==='sand'?'砂縛り':'毒',x:a.x,y:a.y,timeMs:run.time});
  }
  function damage(run,e,a,p,api,events){if(a.hp<=0||a.invulnerable)return;if(api.hit(run,e,a,p.damage*p.power,events,false,['projectile','line','ground'].includes(p.kind)?'魔法':null,{actionId:p.actionId,direct:true,threat:p.threat,threatIndex:p.damageIndex||0}))status(run,a,e,p,api,events);}
  function lineContains(a,from,to,width,length=distance(from,to)){const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,x=a.x-from.x,y=a.y-from.y,along=(x*dx+y*dy)/len;return along>=-25&&along<=length+25&&Math.abs(x*dy-y*dx)/len<=width;}
  function fissures(p){const angle=Math.atan2(p.aim.y-p.origin.y,p.aim.x-p.origin.x);return Array.from({length:p.lines},(_,i)=>{const theta=angle+(i-(p.lines-1)/2)*.24;return{x:p.origin.x+Math.cos(theta)*650,y:p.origin.y+Math.sin(theta)*650};});}
  function release(run,e,p,index,api,events){
    p.damageIndex=index;
    if(p.kind==='rest'){effect(run,events,'sand-burst',e,{scale:.5});return;}
    if(p.kind==='summon'){const alive=run.enemies.filter(a=>a.hp>0&&a.desertSummoner===e.id).length;if((e.desertSummons||0)<2&&alive<2){e.desertSummons=(e.desertSummons||0)+1;for(let i=alive;i<2;i++){const summoned=api.spawn(run,'bandage-soldier',{x:Math.max(95,Math.min(944,e.x+(i?45:-45))),y:Math.max(334,Math.min(501,e.y+(i?30:-30)))});summoned.desertSummoner=e.id;effect(run,events,'sand-burst',summoned);}}effect(run,events,'royal-wave',e,{scale:.65});return;}
    const point=p.points[index]||p.aim;
    if(p.kind==='projectile'){run.desertProjectiles.push({source:e,origin:{x:e.x,y:e.y},to:point,x:e.x,y:e.y,age:0,duration:Math.max(220,distance(e,point)/720*1000),plan:{...p},fx:p.status==='poison'?'venom':p.status==='sand'?'royal-wave':'sand-burst'});return;}
    if(p.kind==='ground'){for(const a of party(run))if(p.points.some(pt=>distance(a,pt)<=p.radius))damage(run,e,a,p,api,events);for(const pt of p.points)effect(run,events,'sand-burst',pt,{scale:.85,ring:true});return;}
    if(p.kind==='line'){for(const a of party(run))if(lineContains(a,p.origin,p.aim,p.radius,650))damage(run,e,a,p,api,events);const angle=Math.atan2(p.aim.y-p.origin.y,p.aim.x-p.origin.x);effect(run,events,'royal-wave',p.origin,{to:{x:p.origin.x+Math.cos(angle)*650,y:p.origin.y+Math.sin(angle)*650},line:true});return;}
    if(p.kind==='fissure'){const lines=fissures(p);for(const a of party(run))if(lines.some(to=>lineContains(a,p.origin,to,p.radius,650)))damage(run,e,a,p,api,events);for(const to of lines)effect(run,events,'fissure',p.origin,{to,line:true,major:true});return;}
    if(p.kind==='charge'){for(const a of party(run))if(lineContains(a,p.origin,p.aim,p.radius))damage(run,e,a,p,api,events);effect(run,events,'sand-burst',e,{scale:1.3,major:true});return;}
    const center=p.kind==='arc'?p.origin:p.kind==='burrow'?p.landing:p.aim;
    for(const a of party(run))if(distance(a,center)<=p.radius&&(p.kind!=='melee'||distance(e,a)<=p.radius+60))damage(run,e,a,p,api,events);
    effect(run,events,p.status==='poison'?'venom':'sand-burst',center,{scale:e.majorBoss?1.5:e.boss?1:.55,major:e.majorBoss,facing:e.facing});
  }
  function advance(run,e,api,events){const p=e.desertPlan;if(!p)return;p.elapsed+=api.STEP;e.motionTime=p.elapsed;
    if(p.kind==='charge'&&p.elapsed>=p.warn){const q=Math.min(1,(p.elapsed-p.warn)/240);e.x=p.origin.x+(p.aim.x-p.origin.x)*q;e.y=p.origin.y+(p.aim.y-p.origin.y)*q;}
    // A shallow dive leaves the rocky back targetable by every class.
    if(p.kind==='burrow'&&p.elapsed>=p.warn){const q=Math.min(1,(p.elapsed-p.warn)/800);e.x=p.origin.x+(p.landing.x-p.origin.x)*q;e.y=p.origin.y+(p.landing.y-p.origin.y)*q;e.desertDepth=Math.sin(q*Math.PI)*75;}
    if(p.motion==='sidestep'&&p.elapsed<400&&api.control.movement(e,run.time)>0){e.x=Math.max(95,Math.min(944,p.origin.x-e.facing*Math.min(45,p.elapsed*.11)));}
    while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next]){release(run,e,p,p.next,api,events);p.next++;}
    if(p.elapsed>=p.duration){e.desertPlan=null;e.desertDepth=0;api.state(e,'idle');}
  }
  function tick(run,api,events){for(const p of run.desertProjectiles){p.age+=api.STEP;const q=Math.min(1,p.age/p.duration);p.x=p.origin.x+(p.to.x-p.origin.x)*q;p.y=p.origin.y+(p.to.y-p.origin.y)*q;if(q>=1){for(const a of party(run))if(p.plan.radius?distance(a,p.to)<=p.plan.radius:a.id===p.to.targetId&&distance(a,p.to)<=65)damage(run,p.source,a,p.plan,api,events);effect(run,events,p.fx,p.to,{scale:.55});p.done=true;}}run.desertProjectiles=run.desertProjectiles.filter(p=>!p.done);}
  function clear(run){run.desertProjectiles=[];for(const e of run.enemies){e.desertPlan=null;e.desertDepth=0;}for(const a of [run.hero,...run.allies])a.sandSlowUntil=0;}
  return {ACTIONS,init,start,advance,tick,clear,fissures,lineContains};
});
