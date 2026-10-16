'use strict';
((root, factory) => {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.SwampCombat=api;
})(typeof globalThis==='object'?globalThis:this,()=>{
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
  const STEP=1000/60;
  const BOUNDS={width:1024,height:576,minX:90,maxX:944,minY:334,maxY:501};
  const DEFINITIONS={
    'giga-toad':{name:'ギガトード',hp:400,damage:14,speed:68,range:260,interval:1700,scale:1,height:166},
    'king-toad':{name:'キングトード',hp:1600,damage:24,speed:52,range:220,interval:1900,scale:1,height:246,boss:true},
    'mud-hand':{name:'泥の手',hp:450,damage:16,speed:46,range:125,interval:1500,scale:1,height:184},
    'mud-giant':{name:'泥巨人',hp:2000,damage:28,speed:32,range:190,interval:2100,scale:1,height:300,boss:true},
    skeleton:{name:'スケルトン',hp:400,damage:16,speed:92,range:115,interval:1500,scale:1,height:212},
    lich:{name:'リッチ',hp:1600,damage:24,speed:48,range:310,interval:2000,scale:1,height:270,boss:true},
    hydra:{name:'ヒュドラ',hp:3400,damage:30,speed:28,range:265,interval:1900,scale:1,height:326,boss:true,majorBoss:true},
  };
  const DURATIONS={idle:1600,move:640,hit:460,down:880,spit:740,tongue:680,punch:680,grab:780,windup:720,slam:780,attack:740,chant:800,'dark-cast':880,charge:960,breath:880};
  const hits=(kind,at,power=1)=>({kind,at,power});
  function sequence(type,count=1){
    const part=(motion,cycles=1,events=[])=>({motion,duration:DURATIONS[motion]*cycles,events});
    switch(type){
      case 'giga-toad':return [part('spit',1,[hits('poison-bolt',380)])];
      case 'king-toad':return count%2?[part('spit',1,[hits('poison-bolt',380)])]:[part('tongue',1,[hits('tongue',300)])];
      case 'mud-hand':return count%2?[part('punch',1,[hits('punch',340)])]:[part('grab',1,[hits('grab',340,.6)])];
      case 'mud-giant':return count%2?[part('punch',1,[hits('punch',340)])]:[part('windup',2),part('slam',1,[hits('slam',300,3)])];
      case 'skeleton':return [part('attack',1,[hits('sword',360)])];
      case 'lich':return count%2?[part('attack',1,[hits('energy-bolt',360)])]:[part('chant',2),part('dark-cast',1,[hits('dark-magic',420,3)])];
      case 'hydra':return count%2?[part('attack',2,[0,140,360,500,740,880,1100,1240].map(at=>hits('bite',at,.6)))]:[part('charge',2),part('breath',1,[hits('breath',180,2)])];
      default:throw new RangeError('Unknown swamp enemy: '+type);
    }
  }
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function setMotion(actor,motion,time=0){actor.motion=motion;actor.motionTime=time;}
  function create(type='giga-toad',options={}){
    if(!DEFINITIONS[type])throw new RangeError('Unknown swamp enemy');
    const enemy={id:'enemy',type,...DEFINITIONS[type],x:780,y:430,facing:-1,attacks:0,cooldown:500,motion:'idle',motionTime:0,plan:null,hurtUntil:0,downTime:0};
    enemy.maxHp=enemy.hp;
    const hero={id:'hero',type:'warrior',x:250,y:430,facing:1,hp:2000,maxHp:2000,damage:22,speed:140,range:125,cooldown:900,motion:'idle',motionTime:0,hurtUntil:0,rootUntil:0,rootAnchor:null,poison:null,downTime:0};
    return {enemy,hero,time:0,accumulator:0,status:'running',events:[],autoHero:options.autoHero!==false,heroTarget:null};
  }
  function applyStatus(battle,target,status,{durationMs=2200,damage=0,source=battle.enemy}={}){
    if(target.hp<=0 || Resistance.resists(battle,target,battle.events))return false;
    if(status==='root'){
      if(target.rootUntil<=battle.time)target.rootAnchor={x:target.x,y:target.y};
      target.rootUntil=Math.max(target.rootUntil||0,battle.time+durationMs);
    } else if(status==='poison') {
      if(target.poison){target.poison.until=Math.max(target.poison.until,battle.time+durationMs);target.poison.damage=Math.max(target.poison.damage,damage);}
      else target.poison={until:battle.time+durationMs,next:battle.time+1000,damage,source};
    } else throw new RangeError('Unknown status: '+status);
    battle.events.push({type:'status',status,target:target.id,durationMs,x:target.x,y:target.y,timeMs:battle.time});return true;
  }
  function hurt(battle,source,target,amount,kind='normal'){
    if(target.hp<=0||battle.status!=='running')return false;
    const value=Math.max(1,Math.round(amount));target.hp=Math.max(0,target.hp-value);
    target.hurtUntil=battle.time+DURATIONS.hit;target.hurtTime=0;
    battle.events.push({type:'damage',source:source.id,target:target.id,amount:value,kind,x:target.x,y:target.y-80,timeMs:battle.time});
    if(target.hp===0){target.plan=null;target.rootUntil=0;target.rootAnchor=null;target.poison=null;target.downTime=0;setMotion(target,'down');battle.events.push({type:'down',target:target.id,timeMs:battle.time});}
    return true;
  }
  function move(battle,actor,target,speed,range=0){
    if(actor.hp<=0||actor.rootUntil>battle.time)return false;
    const gap=distance(actor,target);if(gap<=range+1e-6)return false;
    const travel=Math.min(gap-range,speed*STEP/1000);
    actor.x=Math.max(BOUNDS.minX,Math.min(BOUNDS.maxX,actor.x+(target.x-actor.x)/gap*travel));
    actor.y=Math.max(BOUNDS.minY,Math.min(BOUNDS.maxY,actor.y+(target.y-actor.y)/gap*travel));
    actor.facing=target.x<actor.x?-1:1;
    if(actor.motion!=='move'&&actor.motion!=='forward')setMotion(actor,actor.id==='hero'?'forward':'move');return true;
  }
  function startAttack(battle,enemy=battle.enemy){
    if(enemy.hp<=0)return;
    const parts=sequence(enemy.type,++enemy.attacks);
    enemy.plan={parts,index:0,time:0,fired:new Set(),aim:{x:battle.hero.x,y:battle.hero.y}};
    enemy.cooldown=enemy.interval;enemy.facing=battle.hero.x<enemy.x?-1:1;setMotion(enemy,parts[0].motion);
  }
  function release(battle,enemy,event,aim){
    const hero=battle.hero,kind=event.kind;
    const muzzle=enemy.emission||{x:enemy.height*.55,y:-enemy.height*.52};
    const launch=(effect)=>battle.events.push({type:'projectile',kind,effect,source:enemy.id,x:enemy.x+enemy.facing*muzzle.x,y:enemy.y+muzzle.y,tx:hero.x,ty:hero.y-65,durationMs:480,damage:enemy.damage*event.power,timeMs:battle.time});
    if(kind==='poison-bolt'||kind==='energy-bolt'){launch(kind==='poison-bolt'?'toad-poison-bolt':'lich-energy-bolt');return;}
    const effect={punch:'mud-slam-impact',grab:'mud-bind',slam:'mud-slam-impact','dark-magic':'lich-dark-magic',breath:'hydra-poison-breath'}[kind];
    const target=kind==='slam'||kind==='dark-magic'?aim:hero;
    if(effect&&kind!=='grab')battle.events.push({type:'effect',effect,x:kind==='breath'?enemy.x+enemy.facing*muzzle.x:target.x,y:kind==='breath'?enemy.y+muzzle.y:target.y,facing:enemy.facing,timeMs:battle.time});
    const inRange=kind==='dark-magic'?distance(hero,aim)<=110:kind==='slam'?distance(hero,aim)<=110&&distance(enemy,aim)<=enemy.range+40:distance(enemy,hero)<=enemy.range+25;
    if(!inRange)return;
    if(hurt(battle,enemy,hero,enemy.damage*event.power,kind)&&hero.hp>0){
      if(kind==='grab')applyStatus(battle,hero,'root');
      if(kind==='breath')applyStatus(battle,hero,'poison',{durationMs:4000,damage:Math.round(enemy.damage*.2)});
    }
  }
  function tick(battle){
    battle.time+=STEP;const {hero,enemy}=battle;
    for(const actor of [hero,enemy]){
      actor.motionTime+=STEP;actor.hurtTime=(actor.hurtTime||0)+STEP;actor.cooldown=Math.max(0,actor.cooldown-STEP);
      if(actor.hp<=0){actor.downTime+=STEP;continue;}
      if(actor.rootUntil<=battle.time)actor.rootAnchor=null;
      if(actor.poison){const p=actor.poison;if(battle.time+1e-6>=p.next&&p.next<=p.until){hurt(battle,p.source,actor,p.damage,'poison');p.next+=1000;}if(actor.poison&&battle.time>=p.until)actor.poison=null;}
    }
    if(battle.status!=='running')return;
    // Pending projectiles target their release point and can be dodged.
    battle.pending ||= [];
    for(const p of battle.pending)if(!p.done&&battle.time-p.timeMs>=p.durationMs){
      p.done=true;if(hero.hp>0&&Math.hypot(hero.x-p.tx,hero.y-65-p.ty)<=70){
        hurt(battle,enemy,hero,p.damage,p.kind);
        if(hero.hp>0&&p.kind==='poison-bolt')applyStatus(battle,hero,'poison',{durationMs:4000,damage:Math.round(enemy.damage*.2)});
      }
      battle.events.push({type:'effect',effect:p.kind==='poison-bolt'?'toad-poison-impact':'lich-energy-impact',x:p.tx,y:p.kind==='poison-bolt'?p.ty+65:p.ty,timeMs:battle.time});
    }
    battle.pending=battle.pending.filter(p=>!p.done);
    if(hero.hp>0){
      const target=battle.heroTarget||(battle.autoHero?enemy:null);
      if(hero.motion==='attack-overhead'){if(hero.motionTime>=360&&!hero.attackHit){hero.attackHit=true;if(distance(hero,enemy)<=hero.range+25)hurt(battle,hero,enemy,hero.damage);}if(hero.motionTime>=740)setMotion(hero,'idle');}
      else if(target&&hero.hurtUntil<=battle.time){if(!move(battle,hero,target,hero.speed,battle.heroTarget?0:hero.range)){
        if(!battle.heroTarget&&hero.cooldown===0&&enemy.hp>0){hero.attackHit=false;hero.cooldown=1100;setMotion(hero,'attack-overhead');}
        else if(hero.motion!=='idle')setMotion(hero,'idle');
      }}
    }
    if(enemy.hp>0&&hero.hp>0){
      if(enemy.plan){
        const plan=enemy.plan,part=plan.parts[plan.index];plan.time+=STEP;enemy.motionTime=plan.time;
        part.events.forEach((event,i)=>{if(!plan.fired.has(i)&&event.at<=plan.time){plan.fired.add(i);release(battle,enemy,event,plan.aim);}});
        if(plan.time>=part.duration){plan.index++;plan.time=0;plan.fired.clear();if(plan.index===plan.parts.length){enemy.plan=null;setMotion(enemy,'idle');}else setMotion(enemy,plan.parts[plan.index].motion);}
      } else if(enemy.hurtUntil<=battle.time){
        if(!move(battle,enemy,hero,enemy.speed,enemy.range)){if(enemy.cooldown===0)startAttack(battle);else if(enemy.motion!=='idle')setMotion(enemy,'idle');}
      }
    }
    // Anchor also prevents externally requested movement during an active root.
    if(hero.hp>0&&hero.rootUntil>battle.time&&hero.rootAnchor){hero.x=hero.rootAnchor.x;hero.y=hero.rootAnchor.y;if(hero.motion==='forward')setMotion(hero,'idle');}
    for(const event of battle.events)if(event.type==='projectile'&&!event.queued){event.queued=true;battle.pending.push({...event});}
    if(hero.hp<=0||enemy.hp<=0){battle.status=hero.hp<=0?'defeat':'victory';battle.pending=[];hero.rootUntil=0;hero.rootAnchor=null;hero.poison=null;battle.events.push({type:'finished',victory:enemy.hp<=0,timeMs:battle.time});}
  }
  function update(battle,elapsed){
    if(!Number.isFinite(elapsed)||elapsed<0)throw new RangeError('Invalid elapsed time');
    battle.events=[];battle.accumulator+=elapsed;
    while(battle.accumulator+1e-8>=STEP){tick(battle);battle.accumulator-=STEP;}return battle.events;
  }
  function pose(battle,actor){
    if(actor.hp<=0)return {motion:'down',time:actor.downTime};
    if(actor.hurtUntil>battle.time)return {motion:'hit',time:Math.min(459,actor.hurtTime)};
    return {motion:actor.motion,time:actor.motionTime};
  }
  return {DEFINITIONS,DURATIONS,BOUNDS,STEP,sequence,create,update,move,startAttack,hurt,applyStatus,pose,distance};
});
