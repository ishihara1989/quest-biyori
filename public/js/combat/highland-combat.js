'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HighlandCombat=api;})(globalThis,()=>{
 const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),party=r=>[r.hero,...r.allies].filter(a=>a.hp>0),clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
 const action=(motion,warn,times,power,radius,kind='melee',effect='claw',status=null,push=0)=>({motion,warn,times,power,radius,kind,effect,status,push,duration:Math.max(warn,...times)+500});
 const rest=(ms)=>({...action('rest',0,[],0,0,'rest',null),duration:ms});
 const ACTIONS={
  'horn-jackal':[action('bite',400,[400],1,150,'melee','bite-impact')],
  'rock-horn-goat':[action('charge',1000,[1320],1,45,'charge','charge-impact',null,40)],
  'wind-sprite':[action('blade',600,[600],1,45,'projectile','wind-blade')],
  'storm-jackal':[action('charge',1200,[1580],1,55,'charge','charge-impact'),action('claw',900,[900],.85,185,'melee','claw','bleed'),rest(1800)],
  'iron-horn':[action('sweep',1100,[1100],.95,235,'arc','horn-sweep'),action('charge',1400,[1920],1.1,65,'charge','charge-impact',null,40),action('rocks',1100,[1100,1300,1500],.32,48,'projectile','rock-shards'),rest(2000)],
  'harpy-queen':[action('feathers',1100,[1100],.4,46,'fan','feather'),action('ring',1200,[1200],.75,250,'arc','wind-ring',null,70),action('dive',1400,[1880],1,60,'charge','charge-impact'),rest(2000)],
  manticore:[action('double-claw',1100,[1100,1380],.5,255,'melee','claw','bleed'),action('venom',1400,[1400],.32,48,'fan','venom','poison'),action('gust',1300,[1300],.75,300,'arc','wind-gust',null,70),action('pounce',1600,[2100],1.1,75,'charge','charge-impact'),rest(2500)]
 };
 function init(run){run.highlandProjectiles=[];}
 function effect(run,events,p,at,extra={}){if(p.effect)events.push({type:'highland-effect',effect:'highland-'+p.effect,x:at.x,y:at.y,timeMs:run.time,...extra});}
 function approach(run,e,target,api){
  if(e.type==='wind-sprite'&&e.highlandMovementLock>run.time)return false;
  if(e.type==='storm-jackal'&&distance(e,target)>e.range+60){const aim={x:target.x,y:clamp(target.y+Math.sin(run.time/450)*55,334,501)};return api.move(e,aim,e.speed,e.range);}
  return api.move(e,target,e.speed,e.range);
 }
 function start(run,e,target,api,events){const choices=ACTIONS[e.type];if(!choices)return false;
  if(e.type==='wind-sprite'&&!e.highlandRetreated&&distance(e,target)<220){e.highlandRetreated=true;api.state(e,'attacking','retreat');e.highlandPlan={motion:'retreat',kind:'retreat',origin:{x:e.x,y:e.y},aim:{x:clamp(e.x-e.facing*65,95,944),y:e.y},elapsed:0,duration:500,times:[],next:0};e.cooldown=2500;return true;}
  const index=api.control.sealed(e,run.time)?0:e.attacks%choices.length,base=choices[index],prep=I.config(e,base.motion),shift=prep?Math.max(0,prep.warn-base.warn):0;
  const row={...base,warn:base.warn+shift,times:base.times.map(t=>t+shift),duration:base.duration+shift};
  if(e.type==='rock-horn-goat'&&api.control.sealed(e,run.time)){row.kind='melee';row.radius=155;row.push=0;row.power=.6;}
  if(e.type==='manticore'&&row.motion==='venom'&&e.hp<=e.maxHp*.5&&!e.highlandExtraVenom){row.times.push(row.times[0]+600);row.duration+=600;e.highlandExtraVenom=true;}
  if(e.type==='horn-jackal'&&e.attacks%3===2)row.status='bleed';
  const aim={x:clamp(target.x,95,944),y:clamp(target.y,334,501)},origin={x:e.x,y:e.y};
  // Projectile destinations and charge lanes are fixed when the warning starts.
  const others=party(run).sort((a,b)=>distance(e,a)-distance(e,b));
  const points=row.times.map((_,i)=>{const a=row.motion==='rocks'?others[i%others.length]:target;return{x:a.x,y:a.y,targetId:a.id};});
  if(row.kind==='fan'){const angle=Math.atan2(aim.y-origin.y,aim.x-origin.x),len=Math.max(250,distance(origin,aim));for(const sign of [-1,1])points.push({x:clamp(origin.x+Math.cos(angle+sign*.32)*len,95,944),y:clamp(origin.y+Math.sin(angle+sign*.32)*len,334,501)});}
  e.targetId=target.id;e.attacks++;e.facing=target.x<e.x?-1:1;api.state(e,'attacking',row.motion);e.cooldown=e.interval+row.duration;
  const p=e.highlandPlan={...row,origin,aim,points,elapsed:0,next:0,damage:api.attackPower(run,e),actionId:e.actionId};
  api.control.roll(run,e,[{motion:row.motion,events:row.times.map(()=>({kind:row.motion}))}]);
  const delay=(row.times[0]??row.warn)-row.warn+(['projectile','fan'].includes(row.kind)?Math.max(220,distance(origin,aim)/700*1000):0);
  const warning=I.begin(run,e,row.motion,prep?row.warn:0,target,events,{releaseDelay:delay,hits:row.times.length*(row.kind==='fan'?3:1)});p.threat=e.actionThreat;
  if(warning)warning.shapes=forecast(p);return true;
 }
 function forecast(p){return p.kind==='charge'?[{kind:'lane',from:p.origin,to:p.aim,width:p.radius}]:['projectile','fan'].includes(p.kind)?p.points.map(center=>({kind:'circle',center,radius:p.radius})):p.kind==='rest'||p.kind==='retreat'?[]:[{kind:'circle',center:p.kind==='arc'?p.origin:p.aim,radius:p.radius}];}
 function lineContains(a,p){const dx=p.aim.x-p.origin.x,dy=p.aim.y-p.origin.y,len=Math.hypot(dx,dy)||1,x=a.x-p.origin.x,y=a.y-p.origin.y,along=(x*dx+y*dy)/len;return along>=-20&&along<=len+20&&Math.abs(x*dy-y*dx)/len<=p.radius;}
 function status(run,a,e,p,api,events){if(!p.status||a.hp<=0||a.immuneUntil>run.time||api.immune?.(run,a)||Resistance.resists(run,a,events))return;
  const key=p.status,damage=Math.min(p.damage*p.power*(key==='poison'?.12:.10),a.maxHp*(key==='poison'?.06:.05));
  if(a[key]){a[key].until=run.time+4000;a[key].damage=Math.max(a[key].damage,damage);}else a[key]={until:run.time+4000,next:run.time+1000,damage,source:e};
  events.push({type:'status',kind:key==='poison'?'毒':'出血',x:a.x,y:a.y,timeMs:run.time});
 }
 function damage(run,e,a,p,api,events){if(a.hp<=0||a.invulnerable)return;
  if(!api.hit(run,e,a,p.damage*p.power,events,false,['projectile','fan'].includes(p.kind)?'魔法':null,{actionId:p.actionId,direct:true,threat:p.threat,threatIndex:p.damageIndex||0}))return;
  status(run,a,e,p,api,events);
  if(p.push&&a.hp>0&&!(a.highlandPushUntil>run.time)&&!(a.immuneUntil>run.time)&&!api.immune?.(run,a)){const dx=a.x-p.origin.x,dy=a.y-p.origin.y,len=Math.hypot(dx,dy)||1;a.x=clamp(a.x+dx/len*p.push,95,944);a.y=clamp(a.y+dy/len*p.push,334,501);a.highlandPushUntil=run.time+3000;}
 }
 function release(run,e,p,index,api,events){p.damageIndex=index;if(['rest','retreat'].includes(p.kind))return;
  if(['projectile','fan'].includes(p.kind)){const points=p.kind==='fan'?[p.points[0],...p.points.slice(p.times.length)]:[p.points[index]];for(const [i,to]of points.entries())run.highlandProjectiles.push({source:e,origin:{x:e.x,y:e.y},to,x:e.x,y:e.y,age:0,duration:Math.max(220,distance(e,to)/700*1000),plan:{...p,damageIndex:index*3+i},fx:p.effect});return;}
  for(const a of party(run))if(p.kind==='charge'?lineContains(a,p):distance(a,p.kind==='arc'?p.origin:p.aim)<=p.radius&&(p.kind!=='melee'||distance(e,a)<=p.radius+50))damage(run,e,a,p,api,events);
  effect(run,events,p,p.kind==='arc'?p.origin:p.kind==='charge'?e:p.aim,{scale:e.majorBoss?1.3:e.boss?.95:.55,facing:e.facing});
 }
 function advance(run,e,api,events){const p=e.highlandPlan;if(!p)return;p.elapsed+=api.STEP;
  if(p.kind==='retreat'&&api.control.movement(e,run.time)>0||p.kind==='charge'&&p.elapsed>=p.warn){const start=p.kind==='retreat'?0:p.warn,end=p.kind==='retreat'?p.duration:p.times[0]-p.warn,q=Math.min(1,(p.elapsed-start)/end);e.x=p.origin.x+(p.aim.x-p.origin.x)*q;e.y=p.origin.y+(p.aim.y-p.origin.y)*q;if(['pounce','dive'].includes(p.motion))e.z=Math.sin(q*Math.PI)*70;}
  while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next]){release(run,e,p,p.next,api,events);p.next++;}
  if(p.elapsed>=p.duration){if(p.kind==='retreat')e.highlandMovementLock=run.time+2000;e.highlandPlan=null;e.z=0;api.state(e,'idle');}
 }
 function tick(run,api,events){for(const p of run.highlandProjectiles){p.age+=api.STEP;const q=Math.min(1,p.age/p.duration);p.x=p.origin.x+(p.to.x-p.origin.x)*q;p.y=p.origin.y+(p.to.y-p.origin.y)*q;if(q>=1){for(const a of party(run))if(distance(a,p.to)<=p.plan.radius)damage(run,p.source,a,p.plan,api,events);effect(run,events,p.plan,p.to,{scale:.5});p.done=true;}}run.highlandProjectiles=run.highlandProjectiles.filter(p=>!p.done);}
 function clear(run){run.highlandProjectiles=[];for(const e of run.enemies){e.highlandPlan=null;e.z=0;}}
 return{ACTIONS,init,start,approach,advance,tick,clear,forecast,lineContains};
});
