'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GlacierCombat=api;})(globalThis,()=>{
 const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
 const party=r=>[r.hero,...r.allies].filter(a=>a.hp>0),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
 const action=(motion,warn,offsets,kind,radius,effect,rest,status=null,extra={})=>({motion,warn,times:offsets.map(t=>warn+t),kind,radius,effect,rest,status,duration:warn+Math.max(...offsets)+500,...extra});
 const normal=(motion,kind,radius,effect)=>action(motion,0,[420],kind,radius,effect,1800,null,{power:1,duration:900});
 const ACTIONS={
  'frost-wolf':[normal('bite','melee',160,'bite'),action('leap',2200,[350],'leap',35,'bite',5000,'chill',{length:170})],
  'ice-shell-golem':[normal('punch','melee',170,'punch'),action('smash',2600,[0],'circle',100,'punch',5000)],
  'snow-spirit':[normal('bolt','projectile',55,'cold'),action('ring',2600,[0],'circles',110,'ring',5000,'chill')],
  fenrir:[normal('bite','melee',220,'bite'),action('leap',4000,[500],'leap',55,'bite',9000,null,{length:420}),action('howl',4200,[0,800],'circles',110,'pillar',9000,'freeze',{freezeMs:1000})],
  'crystal-golem':[normal('punch','melee',255,'punch'),action('fan',4400,[0],'sector',300,'punch',9000,null,{angle:120}),action('armor',4200,[0],'armor',0,'armor',9000,null,{duration:8200})],
  'yuki-onna':[normal('bolt','projectile',65,'cold'),action('pillars',4600,[0,800,1600],'circles',115,'pillar',9000),action('seal',4600,[0],'seal',70,'seal',9000,'freeze',{freezeMs:1500})],
  'ice-tusk-mammoth':[normal('trunk','melee',290,'quake'),action('sweep',4000,[0],'sector',300,'sweep',3000,null,{angle:140}),action('quake',4600,[0,900],'bands',330,'quake',3000,'chill',{radii:[160,330],duration:5900}),action('boulder',4800,[0,800,1600],'circles',130,'boulder',3500,'chill',{separation:260,duration:6800}),action('crown',5400,[0,1000,2000],'bands',450,'crown',4000,'freeze',{radii:[180,330,450],freezeMs:1000,outerOnly:true,duration:7800})]
 };
 function init(run){run.glacierProjectiles=[];}
 function clearStatus(a,time){if(a.freezeUntil>time)a.freezeImmuneUntil=time+3000;a.freezeUntil=0;a.chillUntil=0;}
 function expire(a,time){if(a.freezeUntil&&a.freezeUntil<=time){a.freezeImmuneUntil=Math.max(a.freezeImmuneUntil||0,a.freezeUntil+3000);a.freezeUntil=0;}if(a.chillUntil<=time)a.chillUntil=0;}
 function freezing(run){return party(run).some(a=>a.freezeUntil>run.time)||run.enemies.some(e=>e.hp>0&&e.glacierPlan?.status==='freeze');}
 function freezeLimit(run){return Math.min(2,Math.max(0,party(run).length-1));}
 function freeze(run,a,p,api,events){if(a.hp<=0||a.freezeUntil>run.time||a.freezeImmuneUntil>run.time||a.immuneUntil>run.time||api.immune?.(run,a)||p.frozen>=freezeLimit(run))return;
  if(p.status==='freeze'&&!Resistance.resists(run,a,events)){a.freezeUntil=run.time+p.freezeMs;p.frozen++;events.push({type:'status',kind:'凍結',target:a.id,x:a.x,y:a.y,timeMs:run.time});}
 }
 function centers(run,e,n,separation=0){if(n<=0)return[];const members=party(run).sort((a,b)=>a.x-b.x),out=[];for(const a of members){const center={x:clamp(a.x,95,944),y:clamp(a.y,334,501),targetId:a.id};if(out.every(b=>distance(b,center)>=separation)){out.push(center);if(out.length===n)break;}}return out;}
 function forecast(p){
  if(p.kind==='armor')return[];
  if(p.kind==='leap')return[{kind:'lane',from:p.origin,to:p.aim,length:distance(p.origin,p.aim),width:p.radius,precise:true,order:1}];
  if(p.kind==='sector')return[{kind:'sector',center:p.origin,radius:p.radius,direction:Math.atan2(p.aim.y-p.origin.y,p.aim.x-p.origin.x),angle:p.angle*Math.PI/180,order:1}];
  if(p.kind==='bands')return p.radii.map((radius,i)=>({kind:'annulus',center:p.origin,innerRadius:i?p.radii[i-1]:0,radius,order:i+1}));
  return p.points.map((center,i)=>({kind:'circle',center,radius:p.radius,order:i+1}));
 }
 function choose(run,e){const rows=ACTIONS[e.type],count=e.glacierCycle||0;if(e.majorBoss){const cycle=e.glacierPhase2?[0,0,1,2,3,4]:[0,0,1,2,3];return rows[cycle[count%cycle.length]];}if(count%3===0||count%3===1)return rows[0];return rows[1+Math.floor(count/3)%(rows.length-1)];}
 function start(run,e,target,api,events){if(!ACTIONS[e.type])return false;
  if(e.majorBoss&&e.hp<=e.maxHp*.5&&!e.glacierPhase2&&(e.glacierCycle||0)%5===0){e.glacierPhase2=true;e.glacierCycle=0;events.push({type:'glacier-effect',effect:'glacier-armor',x:e.x,y:e.y-e.height*.6,scale:.8,timeMs:run.time});}
  let row=choose(run,e);const dangerous=row.warn>0,limit=[71,75].includes(run.stage.id)?1:2;
  if(dangerous&&(!e.boss&&run.enemies.filter(x=>x!==e&&!x.boss&&I.open(x,run.time)).length>=limit||row.status==='freeze'&&freezing(run)||api.control.sealed(e,run.time))){row=ACTIONS[e.type][0];}else e.glacierCycle=(e.glacierCycle||0)+1;
  const origin={x:e.x,y:e.y},aim={x:clamp(target.x,95,944),y:clamp(target.y,334,501)};
  if(row.kind==='leap'){const d=distance(origin,aim)||1;aim.x=clamp(origin.x+(aim.x-origin.x)/d*row.length,95,944);aim.y=clamp(origin.y+(aim.y-origin.y)/d*row.length,334,501);}
  let points=['circles','seal'].includes(row.kind)?centers(run,e,row.kind==='seal'?(freezeLimit(run)?party(run).length:0):row.times.length,row.separation||0):[aim];
  if(row.kind==='seal'){
   const members=party(run);points=points.filter((p,i)=>i===0||!['miko','paladin'].includes(p.targetId)||!points.slice(0,i).some(q=>['miko','paladin'].includes(q.targetId)));
   points=points.filter(p=>{const a=members.find(a=>a.id===p.targetId);return a&&!(a.freezeImmuneUntil>run.time)&&!(a.immuneUntil>run.time);}).slice(0,freezeLimit(run));
  }
  e.targetId=target.id;e.facing=aim.x<e.x?-1:1;e.attacks++;api.state(e,'attacking',row.motion);
  const p=e.glacierPlan={...row,origin,aim,points,elapsed:0,next:0,frozen:0,hitMembers:new Set(),damage:api.attackPower(run,e),actionId:e.actionId};p.shapes=forecast(p);
  api.control.roll(run,e,[{motion:row.motion,classification:row.warn?'special':'normal',blindable:!row.warn||row.kind==='circles',events:row.times.map(()=>({kind:row.motion}))}]);
  const warning=I.begin(run,e,row.motion,row.warn,target,events,{shapes:p.shapes,hits:row.times.length,releaseDelay:row.times[0]-row.warn,damageSpan:row.times.at(-1)-row.times[0]});p.threat=e.actionThreat;
  if(p.threat)p.threat.damageScale=['armor','seal'].includes(p.kind)?0:p.damage/Math.max(1,e.damage);
  e.cooldown=Math.max(e.cooldown||0,p.duration+p.rest);e.glacierRecoveryUntil=run.time+p.duration+p.rest;
  if(warning)warning.shapes=p.shapes;return true;
 }
 function approach(run,e,target,api){if(e.glacierRecoveryUntil>run.time)return false;return api.move(e,target,e.speed,e.range);}
 function damage(run,e,a,p,index,api,events){if(a.hp<=0||p.hitMembers.has(a.id)||a.invulnerable)return;
  p.hitMembers.add(a.id);const landed=api.hit(run,e,a,p.damage*(p.power||1),events,false,['projectile','circles'].includes(p.kind)?'魔法':null,{actionId:p.actionId,direct:true,threat:p.threat,threatIndex:0});if(!landed||a.hp<=0||a.immuneUntil>run.time||api.immune?.(run,a))return;
  if(p.status==='chill'&&!Resistance.resists(run,a,events)){a.chillUntil=run.time+3000;events.push({type:'status',kind:'冷気',target:a.id,x:a.x,y:a.y,timeMs:run.time});}
  if(p.status==='freeze'&&(!p.outerOnly||index===p.times.length-1))freeze(run,a,p,api,events);
 }
 function effect(run,p,at,events,extra={}){events.push({type:'glacier-effect',effect:'glacier-'+p.effect,x:at.x,y:at.y,timeMs:run.time,scale:p.kind==='bands'||p.kind==='sector'?1:p.kind==='melee'&&p.effect==='quake'?.45:.7,...extra});}
 function release(run,e,p,index,api,events){if(p.kind==='armor'){e.glacierArmorUntil=run.time+4000;effect(run,p,{x:e.x,y:e.y-e.height*.55},events);return;}
  if(p.kind==='projectile'){run.glacierProjectiles.push({source:e,plan:p,x:e.x,y:e.y-e.height*.55,origin:{x:e.x,y:e.y-e.height*.55},to:p.aim,age:0,duration:400});return;}
  if(p.kind==='seal'){for(const point of p.points){const a=party(run).find(a=>a.id===point.targetId);if(a&&I.contains({kind:'circle',center:point,radius:p.radius},a))freeze(run,a,p,api,events);effect(run,p,point,events);}return;}
  const shape=p.shapes[['circles','bands'].includes(p.kind)?index:0];if(!shape)return;for(const a of party(run))if((p.kind!=='melee'||a.id===e.targetId)&&I.contains(shape,a))damage(run,e,a,p,index,api,events);
  const at=shape.center||p.aim;effect(run,p,at,events,{facing:e.facing,band:index,radius:shape.radius,innerRadius:shape.innerRadius||0,shape});
 }
 function advance(run,e,api,events){const p=e.glacierPlan;if(!p)return;p.elapsed+=api.STEP;
  if(p.kind==='leap'&&p.elapsed>=p.warn){const q=clamp((p.elapsed-p.warn)/(p.times[0]-p.warn),0,1);e.x=p.origin.x+(p.aim.x-p.origin.x)*q;e.y=p.origin.y+(p.aim.y-p.origin.y)*q;e.z=Math.sin(q*Math.PI)*45;}
  while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next]){release(run,e,p,p.next,api,events);p.next++;}
  if(p.elapsed>=p.duration){e.glacierPlan=null;e.z=0;api.state(e,'idle');}
 }
 function tick(run,api,events){for(const a of party(run))expire(a,run.time);for(const e of run.enemies)if(e.glacierArmorUntil<=run.time)e.glacierArmorUntil=0;
  for(const b of run.glacierProjectiles){b.age+=api.STEP;const q=clamp(b.age/b.duration,0,1);b.x=b.origin.x+(b.to.x-b.origin.x)*q;b.y=b.origin.y+(b.to.y-b.origin.y)*q;if(q>=1){for(const a of party(run))if(distance(a,b.to)<=b.plan.radius)damage(run,b.source,a,b.plan,0,api,events);effect(run,b.plan,b.to,events);b.done=true;}}
  run.glacierProjectiles=run.glacierProjectiles.filter(b=>!b.done);
 }
 function interrupt(run,e){e.glacierPlan=null;e.glacierArmorUntil=0;e.z=0;}
 function clear(run){run.glacierProjectiles=[];for(const e of run.enemies)interrupt(run,e);for(const a of [run.hero,...run.allies])clearStatus(a,run.time);}
 return{ACTIONS,init,start,approach,advance,tick,clear,interrupt,forecast,expire,clearStatus,freezeLimit};
});
