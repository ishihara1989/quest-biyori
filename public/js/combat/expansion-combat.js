'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./enemy-control.js'):root.EnemyControl);if(typeof module==='object'&&module.exports)module.exports=api;else root.ExpansionCombat=api;})(globalThis,(Control)=>{
  const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
  const DURATIONS={bite:740,sonic:800,drain:880,dive:960,bury:960,web:800,claw:740,volley:840,slam:1040,throw:960,excavate:1020,stomp:1060,rest:1600,shell:1200,spin:720,thrust:760,sweep:860,tail:860,tentacle:960,ink:840,bubble:880,breath:1060};
  const PROJECTILES={'web-bolt':'spider-web-bolt','claw-bolt':'arachne-claw-bolt','rock-bolt':'rock-bolt','earth-debris':'earth-debris','ink-bolt':'sea-ink','bubble-bolt':'sea-bubble-bolt'};
  const part=(motion,kind=motion,power=1,at=360,duration=DURATIONS[motion])=>({motion,duration,events:kind?[{kind,power,at}]:[]});
  function sequence(type,count=1){const select=list=>list[(count-1)%list.length];switch(type){
    case 'cave-bat':return [select([part('bite'),part('sonic','sonic',.75,380)])];
    case 'great-bat':return [select([part('bite'),part('drain','drain',1.1,400),part('sonic','sonic',.9,380),part('dive','dash',1.35,550)])];
    case 'cave-worm':return [part('bite')];
    case 'large-worm':return [select([part('bite'),part('bury','worm-tail',.8,440)])];
    case 'cave-spider':return [select([part('bite'),part('web','web-bolt',.45,380)])];
    case 'arachne':return [select([part('claw'),part('web','web-bolt',.55,380),part('volley','claw-bolt',1.15,420)])];
    case 'cave-troll':{
      const attack=select([[part('slam','quake',1.4,500)],[part('throw','rock-bolt',1.25,440)],[part('excavate','earth-debris',1.15,500)],[part('stomp','quake',1.3,500)],[part('slam','quake',.85,500),part('slam','quake',.85,500),part('slam','quake',.85,500)]]);
      return [...attack,part('rest',null,0,0,count%5===0?3000:1600)];
    }
    case 'hermit-crab':return [part('claw')];
    case 'great-hermit':return count%2?[part('claw')]:[part('shell',null),part('spin','dash',1.4,380),part('shell',null,0,0,600)];
    case 'lizardman':return [part('thrust')];
    case 'lizard-chief':return [select([part('thrust'),part('sweep','sweep',1.1,400),part('tail','tail',1.1,400)])];
    case 'octopus':return [select([part('tentacle'),part('ink','ink-bolt',.35,380)])];
    case 'scylla':return [select([part('tentacle','tentacle',1.2,440),part('bubble','bubble-bolt',.35,420)])];
    case 'kraken':return [select([part('tentacle','tentacle',1.25,440),part('ink','ink-bolt',.4,380),part('bury','kraken-tentacle',1,440),part('breath','water-breath',1.4,500)])];
    default:throw new RangeError('Unknown expansion enemy: '+type);
  }}
  function start(run,enemy,target,state,events){
    let parts=sequence(enemy.type,++enemy.attacks);const prepared=I.prepareParts(enemy,parts);parts=prepared.parts;
    if(Control){parts=Control.plan(run,enemy,parts,sequence(enemy.type,1));if(!parts){enemy.cooldown=250;state(enemy,'idle');return false;}Control.roll(run,enemy,parts);}
    enemy.targetId=target.id;enemy.expansionPlan={parts,index:0,time:0,fired:0,targetId:target.id,aim:{x:target.x,y:target.y},dashHits:[]};
    enemy.cooldown=enemy.interval;state(enemy,'attacking',parts[0].motion);
    const firstKind=parts.flatMap(p=>p.events)[0]?.kind,flight=PROJECTILES[firstKind]?(firstKind==='rock-bolt'?700:500):0;
    const a=I.begin(run,enemy,parts[0].motion,prepared.warn,target,events,{releaseDelay:prepared.releaseDelay+flight,damageSpan:prepared.damageSpan,capacity:enemy.type==='cave-troll'&&parts.filter(p=>p.motion==='slam').length===3?120:undefined,hits:parts.flatMap(p=>p.events).length});
    if(a)a.shapes=forecast(enemy,parts,enemy.expansionPlan);
    events.push({type:'telegraph',kind:parts[0].motion,x:target.x,y:target.y,timeMs:run.time});
  }
  function forecast(e,parts,p){const kind=parts.flatMap(p=>p.events)[0]?.kind;if(['sonic','water-breath'].includes(kind))return [{kind:'lane',from:{x:e.x,y:e.y},to:p.aim,length:kind==='sonic'?340:460,width:100}];if(kind==='dash')return [{kind:'lane',from:{x:e.x,y:e.y},to:p.aim,width:65}];return [{kind:'circle',center:['sweep','tail','tentacle'].includes(kind)?{x:e.x,y:e.y}:p.aim,radius:kind==='quake'?125:['sweep','tail','tentacle'].includes(kind)?e.range+30:['worm-tail','kraken-tentacle'].includes(kind)?130:PROJECTILES[kind]?95:70}];}
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function status(run,actor,kind,events,duration){
    const key={web:'webUntil',blind:'blindUntil',bubble:'bubbleUntil'}[kind];if(!key)throw new RangeError('Unknown expansion status');
    if(Resistance.resists(run,actor,events))return;
    actor[key]=Math.max(actor[key]||0,run.time+(duration||{web:3500,blind:3000,bubble:2200}[kind]));
    if(kind==='bubble'){actor.warriorCast=null;actor.mageCast=null;actor.paladinCast=null;actor.z=0;actor.hidden=false;actor.invulnerable=false;actor.state='idle';actor.motion='idle';actor.time=0;}
    events.push({type:'status',kind,target:actor.id,x:actor.x,y:actor.y,timeMs:run.time});
  }
  function spawnPart(run,owner,kind,aim,events){
    if(owner.hp<=0||run.enemies.some(p=>p.bodyPart&&p.ownerId===owner.id&&p.hp>0))return;
    const body={...owner,actionInterference:null,actionThreat:null,id:'part-'+(++run.serial),ownerId:owner.id,bodyPart:kind,boss:false,majorBoss:false,expansionPlan:null,swampPlan:null,attacks:0,gold:0,
      x:Math.max(90,Math.min(944,aim.x+70)),y:Math.max(334,Math.min(501,aim.y)),motion:'idle',state:'idle',time:0,cooldown:850,range:130,height:kind==='worm-tail'?140:165,scale:.6,expiresAt:run.time+7000};
    run.enemies.push(body);events.push({type:'part-emerge',effect:kind,x:body.x,y:body.y,timeMs:run.time});
  }
  function effect(run,events,id,x,y,facing=-1,scale=.7){events.push({type:'expansion-effect',effect:id,x,y,facing,scale,timeMs:run.time});}
  function release(run,enemy,target,event,plan,api,events){
    const {kind,power}=event,party=[run.hero,...run.allies].filter(a=>a.hp>0);
    if(PROJECTILES[kind]){run.projectiles.push({source:enemy,threat:enemy.actionThreat,actionId:enemy.actionId,kind,miss:Control?.miss(run,enemy)||false,direct:Control?.ACTIONS[kind]?.[1]??true,expansion:true,effect:PROJECTILES[kind],x:enemy.x+enemy.facing*enemy.height*.45,y:enemy.y-enemy.height*.55,tx:plan.aim.x,ty:plan.aim.y,targetId:plan.targetId,time:0,duration:kind==='rock-bolt'?700:500,damage:(enemy.actionDamage??enemy.damage)*power,tracking:false});return;}
    if(kind==='worm-tail'||kind==='kraken-tentacle'){
      for(const a of party)if(distance(a,plan.aim)<=130)api.hit(run,enemy,a,(enemy.actionDamage??enemy.damage)*power,events,false,null,{threat:enemy.actionThreat,threatIndex:plan.damageIndex||0});
      spawnPart(run,enemy,kind,plan.aim,events);effect(run,events,enemy.region===3?'cave-quake':'sea-slam',plan.aim.x,plan.aim.y);return;
    }
    if(kind==='dash'){
      // Sweep the whole committed path, with one collision per actor.
      for(const a of party)if(!plan.dashHits.includes(a.id)&&distance(enemy,a)<enemy.range+35){plan.dashHits.push(a.id);api.hit(run,enemy,a,(enemy.actionDamage??enemy.damage)*power,events,false,null,{threat:enemy.actionThreat,threatIndex:plan.damageIndex||0});}
      effect(run,events,enemy.region===3?'bat-sonic':'sea-slam',enemy.x,enemy.y);return;
    }
    if(kind==='sonic'||kind==='water-breath'){
      const radius=kind==='sonic'?340:460;
      effect(run,events,kind==='sonic'?'bat-sonic':'water-breath',enemy.x+enemy.facing*enemy.height*.35,enemy.y-enemy.height*.5,enemy.facing,.85);
      for(const a of party)if(enemy.actionInterference?enemy.actionInterference.shapes.some(s=>I.contains(s,a)):(a.x-enemy.x)*enemy.facing>=-20&&distance(enemy,a)<=radius&&Math.abs(a.y-enemy.y)<100)api.hit(run,enemy,a,(enemy.actionDamage??enemy.damage)*power,events,false,null,{threat:enemy.actionThreat,threatIndex:plan.damageIndex||0});
      return;
    }
    if(kind==='quake'){
      effect(run,events,'cave-quake',plan.aim.x,plan.aim.y,-1,.8);
      for(const a of party)if(distance(a,plan.aim)<=125&&distance(enemy,plan.aim)<=enemy.range+50)api.hit(run,enemy,a,(enemy.actionDamage??enemy.damage)*power,events,false,null,{threat:enemy.actionThreat,threatIndex:plan.damageIndex||0});
      return;
    }
    const targets=['sweep','tail','tentacle'].includes(kind)?party:[target];
    for(const a of targets)if(distance(enemy,a)<=enemy.range+30&&(!enemy.actionInterference||enemy.actionInterference.shapes.some(s=>I.contains(s,a)))){const before=a.hp;if(api.hit(run,enemy,a,(enemy.actionDamage??enemy.damage)*power,events,false,null,{threat:enemy.actionThreat,threatIndex:plan.damageIndex||0})&&kind==='drain'){
      const heal=Math.min(enemy.maxHp-enemy.hp,Math.max(0,before-a.hp)*.65*(api.healingFactor?api.healingFactor(run,enemy):1));enemy.hp+=heal;
      effect(run,events,'vampire-drain',(enemy.x+a.x)/2,a.y-65,enemy.facing);if(heal>0)events.push({type:'heal',target:enemy.id,amount:Math.round(heal),x:enemy.x,y:enemy.y-enemy.height*.7,timeMs:run.time});
    }}
    if(kind==='tentacle')effect(run,events,'sea-slam',target.x,target.y);
  }
  function advance(run,enemy,target,api,events){
    const plan=enemy.expansionPlan,part=plan.parts[plan.index];plan.time+=api.STEP;
    if(!part.preparation&&(part.motion==='dive'||part.motion==='spin')){
      api.move(enemy,plan.aim,part.motion==='dive'?580:460,0);enemy.state='attacking';
      if(plan.time>=part.events[0].at)for(const a of [run.hero,...run.allies])if(a.hp>0&&!plan.dashHits.includes(a.id)&&distance(enemy,a)<65){plan.dashHits.push(a.id);api.hit(run,enemy,a,(enemy.actionDamage??enemy.damage)*part.events[0].power,events,false,null,{threat:enemy.actionThreat});}
    }
    while(plan.fired<part.events.length&&plan.time+1e-6>=part.events[plan.fired].at){release(run,enemy,target,part.events[plan.fired++],plan,api,events);plan.damageIndex=(plan.damageIndex||0)+1;}
    if(plan.time+1e-6>=part.duration){plan.index++;plan.time=0;plan.fired=0;
      if(plan.index===plan.parts.length){enemy.expansionPlan=null;api.state(enemy,'idle');}
      else api.state(enemy,'attacking',plan.parts[plan.index].motion);
    }
  }
  function tickParts(run,api,events){
    for(const p of run.enemies.filter(p=>p.bodyPart&&p.hp>0)){
      const owner=run.enemies.find(e=>e.id===p.ownerId&&e.hp>0);
      if(!owner||p.expiresAt<=run.time){p.hp=0;p.state='down';p.time=0;events.push({type:'part-retract',effect:p.bodyPart,x:p.x,y:p.y,timeMs:run.time});continue;}
      p.hp=owner.hp;p.maxHp=owner.maxHp;
      if(Control?.stopped(owner,run.time))continue;
      if(p.cooldown===0){for(const a of [run.hero,...run.allies])if(a.hp>0&&distance(p,a)<p.range){api.hit(run,owner,a,(api.attackPower?api.attackPower(run,owner):owner.damage)*.55,events,false,null,{direct:false,miss:false});effect(run,events,owner.region===3?'cave-quake':'sea-slam',p.x,p.y,-1,.5);}p.cooldown=1400;}
    }
  }
  function impact(run,p,target,api,events){
    effect(run,events,p.effect,p.tx,p.ty,p.tx>p.x?1:-1,.65);
    if(target.hp<=0||distance(target,{x:p.tx,y:p.ty})>95)return;
    if(api.hit(run,p.source,target,p.damage,events,false,null,{miss:p.miss,direct:p.direct,actionId:p.actionId,threat:p.threat})&&target.hp>0){const kind={'web-bolt':'web','ink-bolt':'blind','bubble-bolt':'bubble'}[p.kind];if(kind&&!api.immune(run,target))status(run,target,kind,events);}
  }
  return {DURATIONS,PROJECTILES,sequence,start,advance,status,spawnPart,tickParts,impact};
});
