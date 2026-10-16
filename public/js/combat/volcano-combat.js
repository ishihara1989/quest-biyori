'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./action-interference.js'):root.ActionInterference);if(typeof module==='object'&&module.exports)module.exports=api;else root.VolcanoCombat=api;})(globalThis,I=>{
 const party=r=>[r.hero,...r.allies].filter(a=>a.hp>0),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
 const action=(name,motion,warn,offsets,kind,radius,effect,rest,status=null,extra={})=>({name,motion,warn,times:offsets.map(t=>warn+t),kind,radius,effect,rest,status,duration:warn+Math.max(...offsets)+900,...extra});
 const normal=(kind,radius,effect)=>action('通常攻撃','attack',0,[280],kind,radius,effect,1800,null,{duration:700});
 const ACTIONS={
  'lava-salamander':[normal('melee',165,'bite-impact'),action('灼熱噴き','danger-1',2400,[0],'sector',150,'fire-fan',5000,'burn',{angle:80})],
  'obsidian-soldier':[normal('melee',170,'axe-arc'),action('破甲の斧','danger-1',2600,[0],'sector',140,'axe-arc',5000,'armor-break',{angle:70})],
  'young-fire-dragon':[normal('melee',170,'claw-arc'),action('灼球','danger-1',2800,[0],'projectile',110,'fireball',5000)],
  'magma-salamander':[normal('melee',240,'bite-impact'),action('双溶岩弾','danger-1',4400,[0,800],'projectile',120,'lava-bomb',9000,null,{floor:true}),action('灼熱大扇','danger-2',4200,[0],'sector',310,'fire-fan',9000,'burn',{angle:130})],
  'obsidian-executioner':[normal('melee',265,'axe-arc'),action('断罪大薙ぎ','danger-1',4400,[0],'sector',320,'heavy-axe-arc',9000,null,{angle:150}),action('断層斬','danger-2',4800,[0],'lane',60,'fissure',9000,'armor-break',{length:520})],
  'dragon-girl':[normal('melee',200,'claw-arc'),action('紅蓮三連球','danger-1',4400,[0,800,1600],'projectile',100,'fireball',9000,null,{maxHits:2}),action('紅翼竜息','danger-2',4800,[0,900],'lane',70,'fire-beam',9000,'burn',{length:560})],
  dragon:[{...normal('melee',300,'claw-arc'),rest:600},action('翼震着地','danger-1',4600,[0],'landing',240,'landing-shock',3000),action('双脈ブレス','danger-2',5000,[0,1000],'lane',75,'fire-beam',3500,'burn',{length:660}),action('噴火の三巣','danger-3',5200,[0,900,1800],'projectile',130,'lava-bomb',4000,null,{floor:true,separation:260})]
 };
 function init(run){run.volcanoProjectiles=[];run.volcanoFloors=[];run.volcanoRecentCenters=[];}
 function clearStatus(a){a.burn=null;a.armorBreakUntil=0;}
 function expire(a,time){if(a.armorBreakUntil<=time)a.armorBreakUntil=0;}
 const defenseFactor=(a,time)=>a.armorBreakUntil>time?.8:1;
 function centers(run,n,separation=0){const out=[],recent=run.volcanoRecentCenters||[],candidates=party(run).sort((a,b)=>a.x-b.x).map(a=>({x:clamp(a.x,95,930),y:clamp(a.y,334,501)}));
  for(const x of [140,430,720,900,110,400,690,200,500,800])for(const y of [350,490])candidates.push({x,y});
  for(const point of candidates){if(out.length===n)return out;if(!out.every(q=>distance(q,point)>=Math.max(15,separation))||recent.some(q=>distance(q,point)<30))continue;out.push(point);}return out;
 }
 function forecast(p){if(p.kind==='melee')return[{kind:'circle',center:p.aim,radius:p.radius,order:1}];
  if(p.kind==='landing')return[{kind:'circle',center:p.origin,radius:p.radius,order:1}];
  if(p.kind==='sector')return[{kind:'sector',center:p.origin,radius:p.radius,direction:p.direction,angle:p.angle*Math.PI/180,order:1}];
  if(p.kind==='lane')return p.times.map((_,i)=>{const direction=p.direction+(p.reverseSecond&&i?Math.PI:0);return{kind:'lane',from:p.origin,to:{x:p.origin.x+Math.cos(direction)*p.length,y:p.origin.y+Math.sin(direction)*p.length},length:p.length,width:p.radius,precise:true,order:i+1};});
  return p.points.map((center,i)=>({kind:'circle',center,radius:p.radius,order:i+1}));
 }
 function choose(e){const rows=ACTIONS[e.type],count=e.volcanoCycle||0;if(e.majorBoss)return rows[[0,1,0,2,0,3][count%6]];return rows[count%3<2?0:1+Math.floor(count/3)%(rows.length-1)];}
 function start(run,e,target,api,events=[]){if(!ACTIONS[e.type])return false;let row=choose(e);
  if(row.warn&&(!e.boss&&run.enemies.filter(a=>a!==e&&!a.boss&&I.open(a,run.time)).length>=([81,85].includes(run.stage.id)?1:2)||api.control.sealed(e,run.time)))row=ACTIONS[e.type][0];else e.volcanoCycle=(e.volcanoCycle||0)+1;
  if(e.type==='young-fire-dragon'&&!row.warn&&distance(e,target)>200)row={...row,kind:'projectile',radius:55,effect:'fireball'};
  if(e.type==='dragon'&&e.hp<=e.maxHp*.5)e.volcanoPhase2=true;
  const origin={x:e.x,y:e.y},aim={x:clamp(target.x,95,930),y:clamp(target.y,334,501)},points=row.kind==='projectile'?centers(run,row.times.length,row.separation):[aim];
  e.targetId=target.id;e.facing=aim.x<e.x?-1:1;e.attacks++;api.state(e,'attacking',row.motion);
  const p=e.volcanoPlan={...row,origin,aim,points,direction:Math.atan2(aim.y-origin.y,aim.x-origin.x),reverseSecond:e.type==='dragon'&&row.motion==='danger-2'&&e.volcanoPhase2,elapsed:0,next:0,damage:api.attackPower(run,e),actionId:e.actionId,hitCounts:new Map(),spent:new Map()};p.shapes=forecast(p);
  api.control.roll(run,e,[{motion:row.motion,classification:row.warn?'special':'normal',blindable:row.kind==='projectile'||!row.warn,events:row.times.map(()=>({kind:row.motion}))}]);
  const warning=I.begin(run,e,row.motion,row.warn,target,events,{shapes:p.shapes,hits:row.times.length,damageSpan:row.times.at(-1)-row.times[0]});p.threat=e.actionThreat;
  // Fixed previous-stage reference, including all direct/dot/floor damage from this action.
  if(p.threat)p.threat.damageScale=p.damage/Math.max(1,e.damage)*.8;
  e.cooldown=Math.max(e.cooldown||0,p.duration+p.rest);e.volcanoRecoveryUntil=run.time+p.duration+p.rest;
  if(warning)warning.shapes=p.shapes;if(row.kind==='projectile'&&row.warn)run.volcanoRecentCenters=points.map(p=>({...p}));return true;
 }
 function approach(run,e,target,api){if(e.volcanoRecoveryUntil>run.time)return false;return api.move(e,target,e.speed,e.range);}
 function mouth(e,p){const points={'lava-salamander':[-145,-77],'young-fire-dragon':[-144,-102],'magma-salamander':[-146,-69],'dragon-girl':p.motion==='danger-1'?[-140,-162]:[-101,-177],dragon:p.motion==='danger-3'?[-84,-106]:[-145,-114]};const q=points[e.type]||[-45,-100];return{x:e.x+q[0]*e.scale*(e.facing>0?-1:1),y:e.y+q[1]*e.scale};}
 function immune(run,a,api){return a.immuneUntil>run.time||api.immune?.(run,a);}
 function boundedHit(run,e,a,p,raw,api,events,kind='direct'){if(a.hp<=0||a.invulnerable)return false;
  if(p.threat){const budget=I.dangerDamage({...p.threat,risk:p.threat.risk+p.threat.followupFraction},a,0);if(budget!==null){const spent=p.spent.get(a.id)||0;raw=Math.min(raw,Math.max(0,budget-spent));if(raw<1)return false;const landed=api.hit(run,e,a,raw,events,false,null,{actionId:p.actionId,direct:kind==='direct',curseKind:kind});if(landed)p.spent.set(a.id,spent+raw);return landed;}}
  return api.hit(run,e,a,raw,events,false,null,{actionId:p.actionId,direct:kind==='direct',curseKind:kind});
 }
 function damage(run,e,a,p,api,events){const count=p.hitCounts.get(a.id)||0;if(count>=(p.maxHits||p.times.length)||a.hp<=0)return;
  const threat=p.threat?{...p.threat,followupFraction:p.status==='burn'?(e.majorBoss?.4:.1):p.threat.followupFraction}:null,raw=I.dangerDamage(threat,a,count)??p.damage;
  if(!boundedHit(run,e,a,p,raw,api,events))return;p.hitCounts.set(a.id,count+1);if(a.hp<=0||immune(run,a,api))return;
  if(['burn','armor-break'].includes(p.status)&&Resistance.resists(run,a,events))return;
  if(p.status==='burn'){const burn={until:run.time+4000,next:a.burn?.next||run.time+1000,damage:p.damage*.15,source:e,plan:p};if(a.burn&&a.burn.damage>burn.damage){a.burn.until=burn.until;}else a.burn=burn;events.push({type:'status',kind:'火傷',target:a.id,x:a.x,y:a.y,timeMs:run.time});}
  if(p.status==='armor-break'){a.armorBreakUntil=run.time+4000;events.push({type:'status',kind:'破甲',target:a.id,x:a.x,y:a.y,timeMs:run.time});}
 }
 function effect(run,p,at,events,extra={}){events.push({type:'volcano-effect',effect:'volcano-'+p.effect,x:at.x,y:at.y,timeMs:run.time,scale:.8,...extra});}
 function release(run,e,p,index,api,events){const shape=p.shapes[p.kind==='projectile'||p.kind==='lane'?index:0];if(!shape)return;
  if(p.kind==='projectile'){const origin=mouth(e,p);run.volcanoProjectiles.push({source:e,plan:p,index,shape,origin,to:shape.center,x:origin.x,y:origin.y,age:0,duration:560});return;}
  for(const a of party(run))if((p.kind!=='melee'||a.id===e.targetId)&&I.contains(shape,a))damage(run,e,a,p,api,events);
  const direction=shape.direction??Math.atan2((shape.to?.y??p.aim.y)-p.origin.y,(shape.to?.x??p.aim.x)-p.origin.x);
  const at=['fire-beam','fire-fan'].includes(p.effect)?mouth(e,p):p.effect==='fissure'?{x:e.x-88*e.scale*(e.facing>0?-1:1),y:e.y-e.scale}:shape.center||p.aim;
  effect(run,p,at,events,{shape,facing:e.facing,radius:shape.radius,order:index+1,...shape.kind==='lane'?{visualEnd:{x:shape.from.x+Math.cos(direction)*shape.length,y:shape.from.y+Math.sin(direction)*shape.length-(p.effect==='fire-beam'?80:0)}}:{}});
 }
 function advance(run,e,api,events){const p=e.volcanoPlan;if(!p)return;p.elapsed+=api.STEP;if(p.reverseSecond&&!p.turned&&p.elapsed>=p.times[1]-300){e.facing*=-1;p.turned=true;}while(p.next<p.times.length&&p.elapsed+1e-6>=p.times[p.next])release(run,e,p,p.next++,api,events);if(p.elapsed>=p.duration){e.volcanoPlan=null;api.state(e,'idle');}}
 // Three full circles occupy <20% of the actual 854x167 walkable ground.
 function floor(run,e,p,center){run.volcanoFloors.push({source:e,plan:p,center,radius:Math.min(54,p.radius),bornAt:run.time,until:run.time+2000});if(run.volcanoFloors.length>3)run.volcanoFloors.shift();}
 function tick(run,api,events){for(const b of run.volcanoProjectiles){b.age+=api.STEP;const q=clamp(b.age/b.duration,0,1);b.x=b.origin.x+(b.to.x-b.origin.x)*q;b.y=b.origin.y+(b.to.y-b.origin.y)*q-(b.plan.effect==='lava-bomb'?Math.sin(q*Math.PI)*100:0);if(q>=1){for(const a of party(run))if(I.contains(b.shape,a))damage(run,b.source,a,b.plan,api,events);effect(run,{...b.plan,effect:b.plan.effect==='lava-bomb'?'lava-impact':'fireball-impact'},b.to,events);if(b.plan.floor)floor(run,b.source,b.plan,b.to);b.done=true;}}
  run.volcanoProjectiles=run.volcanoProjectiles.filter(b=>!b.done);
  for(const a of party(run)){expire(a,run.time);if(immune(run,a,api))clearStatus(a);
   const b=a.burn;if(b&&run.time>=b.next&&b.next<=b.until){boundedHit(run,b.source,a,b.plan,b.damage,api,events,'burn');b.next+=1000;}if(a.burn&&run.time>=a.burn.until)a.burn=null;
   const active=run.volcanoFloors.filter(f=>run.time>=f.bornAt+1000&&run.time<=f.until&&I.contains({kind:'circle',center:f.center,radius:f.radius},a)).sort((x,y)=>y.plan.damage-x.plan.damage);if(active.length&&run.time>=(a.volcanoFloorAt||0)){const f=active[0];boundedHit(run,f.source,a,f.plan,f.plan.damage*.18,api,events,'lava-floor');a.volcanoFloorAt=run.time+1000;}
  }run.volcanoFloors=run.volcanoFloors.filter(f=>run.time<f.until);
 }
 function interrupt(run,e){e.volcanoPlan=null;e.z=0;}
 function clear(run){run.volcanoProjectiles=[];run.volcanoFloors=[];for(const e of run.enemies)interrupt(run,e);for(const a of [run.hero,...run.allies]){clearStatus(a);a.volcanoFloorAt=0;}}
 return{ACTIONS,init,start,approach,advance,tick,clear,interrupt,forecast,expire,clearStatus,defenseFactor,boundedHit,damage,floor,mouth};
});
