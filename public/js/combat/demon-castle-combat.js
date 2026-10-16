'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./action-interference.js'):root.ActionInterference,typeof module==='object'&&module.exports?require('./volcano-combat.js'):root.VolcanoCombat);if(typeof module==='object'&&module.exports)module.exports=api;else root.DemonCastleCombat=api;})(globalThis,(I,V)=>{
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
 const party=r=>[r.hero,...r.allies].filter(a=>a.hp>0),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const action=(name,motion,warn,offsets,kind,radius,effect,rest,status=null,extra={})=>({name,motion,warn,times:offsets.map(t=>warn+t),kind,radius,effect,rest,status,duration:warn+Math.max(...offsets)+900,...extra});
 const normal=(kind,radius,effect)=>action('通常攻撃','attack',0,[280],kind,radius,effect,1800,null,{duration:700});
 const ACTIONS={
  'demon-armored-soldier':[{...normal('melee',180,'dark-slash'),duration:640},action('鎧崩し','danger-1',2600,[0],'lane',42.5,'dark-slash',5000,'armor-break',{length:180,duration:3300})],
  imp:[{...normal('melee',190,'claw'),duration:900},action('呪弾','danger-1',2600,[0],'projectile',100,'curse-orb',5000,'curse',{duration:4000})],
  'dream-demon':[{...normal('projectile',55,'curse-orb'),duration:1680},action('眠りの月','danger-1',2800,[0],'control',65,'sleep-moon',5000,'sleep',{duration:4600})],
  'black-knight':[{...normal('melee',260,'dark-slash'),duration:640},action('王断の大剣','danger-1',4600,[0],'lane',67.5,'royal-cleave',9000,'armor-break',{length:560}),action('黒環薙ぎ','danger-2',4400,[0],'sector',310,'black-ring',9000,null,{angle:150})],
  'arch-demon':[{...normal('melee',260,'demon-impact'),duration:640},action('魔炎双柱','danger-1',4800,[0,900],'circles',140,'demon-pillar',9000,'burn',{duration:7400}),action('悪魔の援軍','danger-2',5000,[0,500],'summon',65,'summon-gate',9000,null,{duration:7300})],
  lilith:[{...normal('projectile',65,'curse-orb'),duration:1680},action('宵闇の花冠','danger-1',5000,[0,800,1600],'circles',120,'dark-flower',9000,'curse',{maxHits:2,duration:7600}),action('静寂の封印','danger-2',4600,[0],'control',65,'silence-seal',9000,'silence',{duration:6400})],
  'demon-god':[{...normal('melee',310,'demon-impact'),rest:600,duration:840,times:[420]},action('魔腕の断界','danger-1',4800,[0,900],'sector',340,'demon-impact',3000,null,{angle:160,duration:6420}),action('三界魔柱','danger-2',5200,[0,900,1800],'circles',145,'demon-pillar',4000,null,{duration:7580}),action('封声','danger-3',4600,[0],'control',65,'silence-seal',3000,'silence',{duration:5320}),action('終焉の交差','danger-4',5600,[0,1000,1200],'cross',70,'cross-beam',4000,null,{length:720,duration:7600})]
 };
 function init(run){run.castleProjectiles=[];run.castleSummons=0;}
 const silenced=(a,time)=>a.silenceUntil>time;
 const sleeping=(a,time)=>a.sleepUntil>time;
 const healingFactor=(a,time)=>a.enemyCurseUntil>time?.75:1;
 function wake(a,time){if(a.sleepUntil>time){a.sleepUntil=0;a.castleControlImmuneUntil=Math.max(a.castleControlImmuneUntil||0,time+3000);}}
 function clearStatus(a,time=0){if(a.sleepUntil>time||a.silenceUntil>time)a.castleControlImmuneUntil=Math.max(a.castleControlImmuneUntil||0,time+3000);a.sleepUntil=0;a.silenceUntil=0;a.enemyCurseUntil=0;}
 function expire(a,time){for(const key of ['sleepUntil','silenceUntil'])if(a[key]&&a[key]<=time){a.castleControlImmuneUntil=Math.max(a.castleControlImmuneUntil||0,a[key]+3000);a[key]=0;}if(a.enemyCurseUntil<=time)a.enemyCurseUntil=0;}
 const immune=(run,a,api)=>a.immuneUntil>run.time||api.immune?.(run,a);
 function controlling(run){return party(run).some(a=>sleeping(a,run.time)||silenced(a,run.time)||a.freezeUntil>run.time)||run.enemies.some(e=>e.hp>0&&e.castlePlan?.kind==='control');}
 function controlTargets(run,api){if(party(run).length<=1)return[];return party(run).filter(a=>!(a.castleControlImmuneUntil>run.time)&&!(a.freezeImmuneUntil>run.time)&&!immune(run,a,api)).sort((a,b)=>(['miko','paladin'].includes(a.type)?1:0)-(['miko','paladin'].includes(b.type)?1:0)||a.x-b.x).slice(0,1);}
 function status(run,a,p,api,events){if(a.hp<=0||immune(run,a,api))return false;
  if(p.status==='curse'){if(Resistance.resists(run,a,events))return false;a.enemyCurseUntil=run.time+4000;}
  else if(['sleep','silence'].includes(p.status)){if(party(run).length<=1||a.castleControlImmuneUntil>run.time||a.freezeImmuneUntil>run.time||party(run).some(b=>sleeping(b,run.time)||silenced(b,run.time)||b.freezeUntil>run.time))return false;if(Resistance.resists(run,a,events))return false;a[p.status==='sleep'?'sleepUntil':'silenceUntil']=run.time+1500;}
  else return false;
  events.push({type:'status',kind:{curse:'呪い',sleep:'睡眠',silence:'沈黙'}[p.status],target:a.id,x:a.x,y:a.y,timeMs:run.time});return true;
 }
 function centers(run,n){const candidates=party(run).sort((a,b)=>b.x-a.x).map(a=>({x:clamp(a.x,95,930),y:clamp(a.y,334,501),targetId:a.id}));for(const x of [170,430,710])candidates.push({x,y:400});const out=[];for(const p of candidates)if(out.every(q=>distance(p,q)>=80)){out.push(p);if(out.length===n)break;}return out;}
 function forecast(p){
  if(p.kind==='sector')return[{kind:'sector',center:p.origin,radius:p.radius,direction:p.direction,angle:p.angle*Math.PI/180,order:1}];
  if(p.kind==='lane'||p.kind==='cross'){const dirs=p.kind==='cross'?[p.direction-.49,p.direction+.49]:[p.direction];return[...dirs.map((direction,i)=>({kind:'lane',from:p.origin,to:{x:p.origin.x+Math.cos(direction)*p.length,y:p.origin.y+Math.sin(direction)*p.length},length:p.length,width:p.radius,precise:true,order:i+1})),...p.kind==='cross'?[{kind:'annulus',center:p.origin,innerRadius:340,radius:440,order:3}]:[]];}
  return p.points.map((center,i)=>({kind:'circle',center,radius:p.radius,order:i+1}));
 }
 function choose(e){const rows=ACTIONS[e.type],count=e.castleCycle||0;
  if(e.majorBoss){const phase=e.hp<=e.maxHp*.35?3:e.hp<=e.maxHp*.7?2:1;if(phase!==e.castlePhase){e.castlePhase=phase;e.castleCycle=0;}const cycle=phase===3?[3,4,0,0]:phase===2?[2,0,0,1,0,0]:[1,0,0,2,0,0];return rows[cycle[(e.castleCycle||0)%cycle.length]];}
  return rows[count%3<2?0:1+Math.floor(count/3)%(rows.length-1)];
 }
 function start(run,e,target,api,events=[]){if(!ACTIONS[e.type])return false;let row=choose(e);
  if(row.warn&&(!e.boss&&run.enemies.filter(a=>a!==e&&!a.boss&&I.open(a,run.time)).length>=([91,95].includes(run.stage.id)?1:2)||api.control.sealed(e,run.time)||row.kind==='control'&&controlling(run)||row.kind==='summon'&&(run.stage.special||run.castleSummons>=2||run.enemies.filter(a=>a.castleSummoned&&a.hp>0).length>=2)))row=ACTIONS[e.type][0];else e.castleCycle=(e.castleCycle||0)+1;
  const origin={x:e.x,y:e.y},aim={x:clamp(target.x,95,930),y:clamp(target.y,334,501)};
  const points=row.kind==='control'?controlTargets(run,api).map(a=>({x:a.x,y:a.y,targetId:a.id})):row.kind==='summon'?[{x:clamp(e.x-100,95,930),y:350},{x:clamp(e.x+80,95,930),y:490}]:['circles','projectile'].includes(row.kind)?centers(run,row.times.length):[aim];
  e.targetId=target.id;e.facing=aim.x<e.x?-1:1;e.attacks++;api.state(e,'attacking',row.motion);
  const p=e.castlePlan={...row,origin,aim,points,direction:Math.atan2(aim.y-origin.y,aim.x-origin.x),elapsed:0,next:0,damage:api.attackPower(run,e),actionId:e.actionId,hitCounts:new Map(),spent:new Map()};p.shapes=forecast(p);
  if(e.majorBoss&&row.motion==='danger-2'&&e.castlePhase>=2)p.curseFirst=true;
  api.control.roll(run,e,[{motion:row.motion,classification:row.warn?'special':'normal',blindable:!row.warn||row.kind==='projectile',events:row.times.map(()=>({kind:row.motion}))}]);
  const warning=I.begin(run,e,row.motion,row.warn,target,events,{shapes:p.shapes,hits:row.times.length,releaseDelay:row.kind==='projectile'?600:0,damageSpan:row.times.at(-1)-row.times[0]});p.threat=e.actionThreat;
  if(p.threat)p.threat.damageScale=['control','summon'].includes(p.kind)?0:p.damage/Math.max(1,e.damage)*.8;
  e.cooldown=Math.max(e.cooldown||0,p.duration+p.rest);e.castleRecoveryUntil=run.time+p.duration+p.rest;if(warning)warning.shapes=p.shapes;return true;
 }
 function approach(run,e,target,api){if(e.castleRecoveryUntil>run.time)return false;return api.move(e,target,e.speed,e.range);}
 function damage(run,e,a,p,index,api,events){const before=p.hitCounts.get(a.id)||0;if(p.kind==='cross'&&index===2){if(a.hp<=0||a.invulnerable)return;const raw=I.dangerDamage(p.threat?{...p.threat,risk:.1}:null,a,0)??p.damage*.2;V.boundedHit(run,e,a,p,raw,api,events);return;}
  V.damage(run,e,a,p,api,events);if((p.hitCounts.get(a.id)||0)>before)status(run,a,p.curseFirst&&index===0?{...p,status:'curse'}:p,api,events);
 }
 function effect(run,p,at,events,extra={}){events.push({type:'castle-effect',effect:'castle-'+p.effect,x:at.x,y:at.y,timeMs:run.time,scale:.7,...extra});}
 function release(run,e,p,index,api,events){
  if(p.kind==='summon'){if(index===0){for(const point of p.points)effect(run,p,point,events);}else if(run.castleSummons<2){let slots=2-run.enemies.filter(a=>a.castleSummoned&&a.hp>0).length;for(const point of p.points.slice(0,Math.max(0,slots))){const a=api.spawn(run,'imp',point);a.castleSummoned=true;a.cooldown+=1500;events.push({type:'spawn',enemy:a.type,x:a.x,y:a.y,timeMs:run.time});}run.castleSummons++;}return;}
  if(p.kind==='control'){for(const point of p.points){const a=party(run).find(a=>a.id===point.targetId);if(a&&api.hit(run,e,a,0,events,false,null,{statusOnly:true,direct:true}))status(run,a,p,api,events);effect(run,p,point,events);}return;}
  const shape=p.shapes[['circles','projectile','cross'].includes(p.kind)?index:0];if(!shape)return;
  if(p.kind==='projectile'){const origin={x:e.x-45*e.scale*(e.facing>0?-1:1),y:e.y-e.height*.6};run.castleProjectiles.push({source:e,plan:p,index,shape,origin,to:shape.center,x:origin.x,y:origin.y,age:0,duration:600});return;}
  for(const a of party(run))if((p.kind!=='melee'||a.id===e.targetId)&&I.contains(shape,a))damage(run,e,a,p,index,api,events);
  const at=shape.kind==='lane'?shape.from:shape.kind==='sector'?shape.center:shape.center||p.aim;
  effect(run,p.kind==='cross'&&index===2?{...p,effect:'end-ring'}:p,at,events,{shape,facing:e.facing,radius:shape.radius,order:index+1,...p.kind==='cross'&&index<2?{visualOrigin:{x:e.x+(index===0?-95:-85)*e.scale*(e.facing>0?-1:1),y:e.y+(index===0?-245:-152)*e.scale},visualEnd:{x:shape.to.x,y:shape.to.y-80}}:{}});
 }
 function advance(run,e,api,events){const p=e.castlePlan;if(!p)return;p.elapsed+=api.STEP;while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next])release(run,e,p,p.next++,api,events);if(p.elapsed>=p.duration){e.castlePlan=null;api.state(e,'idle');}}
 function tick(run,api,events){for(const a of party(run)){expire(a,run.time);if(immune(run,a,api))clearStatus(a,run.time);}for(const b of run.castleProjectiles){b.age+=api.STEP;const q=clamp(b.age/b.duration,0,1);b.x=b.origin.x+(b.to.x-b.origin.x)*q;b.y=b.origin.y+(b.to.y-b.origin.y)*q;if(q>=1){for(const a of party(run))if(I.contains(b.shape,a))damage(run,b.source,a,b.plan,b.index,api,events);effect(run,{...b.plan,effect:'curse-impact'},b.to,events);b.done=true;}}run.castleProjectiles=run.castleProjectiles.filter(b=>!b.done);}
 function interrupt(run,e){e.castlePlan=null;}
 function clear(run){run.castleProjectiles=[];for(const e of run.enemies)interrupt(run,e);for(const a of [run.hero,...run.allies])clearStatus(a,run.time);}
 return{ACTIONS,init,start,approach,advance,tick,interrupt,clear,clearStatus,expire,wake,sleeping,silenced,healingFactor,status,damage,forecast,choose,controlTargets};
});
