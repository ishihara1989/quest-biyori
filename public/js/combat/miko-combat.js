'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('../skills/miko-skills.js'):root.MikoSkills,typeof module==='object'&&module.exports?require('../skills/warrior-skills.js'):root.WarriorSkills);if(typeof module==='object'&&module.exports)module.exports=api;else root.MikoCombat=api;})(globalThis,(S,W)=>{
  const {distance,clamp}=S,EPS=1e-6;
  const party=run=>[run.hero,...run.allies].filter(a=>a.hp>0),bodies=run=>run.enemies.filter(e=>e.hp>0&&!e.bodyPart&&!e.invulnerable);
  function init(run){run.mikoContracts=[];run.mikoPossessions=[];run.mikoProjectiles=[];run.mikoOrders=[];run.mikoFestival=null;run.mikoChannel=null;run.mikoTwin=null;run.mikoSerial=0;}
  function effect(run,events,kind,at,extra={}){events.push({type:'miko-effect',kind,x:at.x,y:at.y,timeMs:run.time,...extra});}
  function attackRate(run,a){return (1+(a.epicWarriorArmor&&a.epicRageUntil>run.time?(a.epicRage||0)*.1:0))*(1+Math.max(0,...(run.mikoPossessions||[]).filter(p=>p.host===a&&p.until>run.time&&p.source.hp>0).map(p=>p.spec.attackSpeed||0)));}
  function spirit(run){return Math.max(run.mikoFestival?.until>run.time?run.mikoFestival.spec.spirit:0,...(run.mikoContracts||[]).filter(c=>c.until>run.time&&c.source.hp>0).map(c=>c.spec.spirit||0),0);}
  function heal(run,source,target,power,cap,events,at=target,recoverySummon=true){if(run.disableMikoSupport||target.hp<=0||source.hp<=0)return 0;
    const bonus=(target.enemyCurseUntil>run.time?.75:1)*(recoverySummon&&run.mikoChannel?.until>run.time?1+run.mikoChannel.spec.healBonus:1);
    const amount=Math.min(target.maxHp-target.hp,target.maxHp*cap*(target.enemyCurseUntil>run.time?.75:1),source.damage*power*bonus);if(amount<=0)return 0;target.hp+=amount;
    effect(run,events,'healing-pollen',target,{from:{x:at.x,y:at.y},target:target.id});events.push({type:'heal',source:source.id,target:target.id,amount:Math.round(amount),x:target.x,y:target.y-90,timeMs:run.time});return amount;
  }
  function barrier(run,source,target,s,events,at=target){if(run.disableMikoSupport||target.hp<=0||source.hp<=0)return;
    const amount=Math.min(source.damage*s.barrier,target.maxHp*s.cap),old=target.mikoBarrier;
    target.mikoBarrier={amount:Math.max(old?.until>run.time?old.amount:0,amount),until:run.time+s.barrierLife,source};
    effect(run,events,'barrier-shell',target,{from:{x:at.x,y:at.y},target:target.id});
  }
  function absorb(run,target,damage,events){const b=target.mikoBarrier;if(!b||b.until<=run.time||b.source.hp<=0||run.disableMikoSupport)return damage;
    const saved=Math.min(b.amount,damage);b.amount-=saved;if(saved>0)events.push({type:'miko-block',amount:Math.round(saved),x:target.x,y:target.y,timeMs:run.time});return damage-saved;
  }
  const wounded=run=>party(run).sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp)||a.id.localeCompare(b.id));
  const front=run=>party(run).sort((a,b)=>(b.recentMikoDamage||0)-(a.recentMikoDamage||0)||Number(['warrior','paladin'].includes(b.type))-Number(['warrior','paladin'].includes(a.type))||a.hp/a.maxHp-b.hp/b.maxHp);
  const strongest=run=>party(run).sort((a,b)=>(b.damage/(b.interval||1000))-(a.damage/(a.interval||1000)));
  function targetFor(run,s){return s.id==='swift-wolf'||s.id==='blade-spirit'?strongest(run)[0]:s.id==='life-serpent'?wounded(run)[0]:front(run)[0];}
  function viableContract(run,s,actor){const old=run.mikoContracts.find(c=>c.id===s.id);
    if(old)return old.until-run.time<=3000;
    const same=run.mikoContracts.filter(c=>c.spec.role===s.role),limit=actor?.epicMikoArmor?({attack:5,heal:3,support:3}[s.role]):s.role==='attack'?2:1;
    if(same.length<limit)return true;
    if(s.id==='white-deer'&&wounded(run)[0]?.hp/wounded(run)[0]?.maxHp<.45)return true;
    const weakest=same.sort((a,b)=>value(run,a.spec)-value(run,b.spec))[0];return weakest.until-run.time<=3000||value(run,s)>=value(run,weakest.spec)*1.2;
  }
  function value(run,s){const enemies=bodies(run),hurt=wounded(run),low=hurt[0];
    if(s.role==='attack')return s.power*s.count/(s.period/1000)*(s.chain?Math.min(s.chain,enemies.length):s.width?Math.min(5,enemies.length):1);
    if(s.role==='heal')return (s.heal*s.count*(s.targets||1)/(s.period/1000))+(s.openingHeal&&hurt.filter(a=>a.hp/a.maxHp<.85).length>1?1.2:0);
    if(s.id==='bell-owl')return low&&low.hp/low.maxHp>.65?3:1;
    return s.barrier*s.count/(s.period/1000)*(low&&low.hp/low.maxHp<.65?4:1);
  }
  function summon(run,actor,s,events){let old=run.mikoContracts.find(c=>c.id===s.id);if(old){old.spec=s;old.until=run.time+s.lifetime;old.created=run.time;delete old.festivalUntil;effect(run,events,'guardian',actor,{skillId:s.id});return old;}
    const same=run.mikoContracts.filter(c=>c.spec.role===s.role),limit=actor?.epicMikoArmor?({attack:5,heal:3,support:3}[s.role]):s.role==='attack'?2:1;
    if(same.length>=limit){same.sort((a,b)=>value(run,a.spec)-value(run,b.spec));run.mikoContracts=run.mikoContracts.filter(c=>c!==same[0]);}
    const c={id:s.id,source:actor,spec:s,created:run.time,until:run.time+s.lifetime,units:[]};
    for(let i=0;i<s.count;i++)c.units.push({id:'spirit-'+(++run.mikoSerial),index:i,x:actor.x+30+i*35,y:actor.y-32+i*25,next:run.time+s.period+i*(s.id==='thunder-crows'?180:110),actionAt:-Infinity,attacks:0});run.mikoContracts.push(c);
    effect(run,events,'guardian',actor,{skillId:s.id});
    if(s.openingHeal)for(const a of party(run).filter(a=>distance(a,actor)<=s.reach))heal(run,actor,a,s.openingHeal,s.openingCap,events,actor);
    if(s.barrier){const hosts=front(run);c.units.forEach((u,i)=>{if(hosts[i])barrier(run,actor,hosts[i],s,events,u);});}return c;
  }
  function possess(run,actor,s,host,events,lifetime=s.lifetime,twin=false){if(!host||host.hp<=0)return;
    run.mikoPossessions=run.mikoPossessions.filter(p=>p.id!==s.id&&(p.host!==host||actor.epicMikoArmor||twin||(run.mikoTwin?.host===host&&run.mikoTwin.until>run.time)));
    const max=actor.epicMikoArmor?4:twin||(run.mikoTwin?.host===host&&run.mikoTwin.until>run.time)?2:1;
    const attached=run.mikoPossessions.filter(p=>p.host===host).sort((a,b)=>a.created-b.created);while(attached.length>=max){const removed=attached.shift();run.mikoPossessions=run.mikoPossessions.filter(p=>p!==removed);}
    const p={id:s.id,source:actor,spec:s,host,created:run.time,until:run.time+lifetime,next:run.time+(s.id==='life-serpent'?1000:s.period),last:-Infinity,actions:new Map()};run.mikoPossessions.push(p);
    effect(run,events,'possession',host,{skillId:s.id,target:host.id});if(s.barrier)barrier(run,actor,host,s,events);return p;
  }
  function projectile(run,source,target,power,kind,extra={}){if(!target||target.hp<=0)return;
    run.mikoProjectiles.push({source,targetId:target.id,x:extra.x??source.x,y:extra.y??source.y,damage:source.damage*power,kind,age:0,...extra});
  }
  function packet(run,actor,e,power,api,events,kind='summon',extra={}){if(!e||e.hp<=0||e.invulnerable)return false;
    return api.hit(run,actor,e,actor.damage*power,events,true,'魔法',{secondary:true,skipHitRoll:true,critical:false,curseKind:kind,...extra});
  }
  function action(run,c,u,api,events,multiplier=1,forcedTarget=null){const s=c.spec,actor=c.source;if(actor.hp<=0||(u.lastAction!==undefined&&run.time-u.lastAction<300-EPS))return false;
    const targets=bodies(run).filter(e=>distance(u,e)<=s.reach).sort((a,b)=>distance(u,a)-distance(u,b)||a.id.localeCompare(b.id));let e=forcedTarget&&forcedTarget.hp>0?forcedTarget:targets[0];
    if(s.role==='attack'){
      if(!e)return;
      if(s.id==='flame-wheel'){const dx=e.x-u.x,dy=e.y-u.y,len=Math.hypot(dx,dy)||1,anchor={x:u.x,y:u.y};for(const b of bodies(run)){const px=b.x-anchor.x,py=b.y-anchor.y,along=(px*dx+py*dy)/len,side=Math.abs(px*dy-py*dx)/len;if(along>=0&&along<=s.reach&&side<=s.width/2+25)packet(run,actor,b,s.power*multiplier,api,events);}
        effect(run,events,'flame-trail',e,{from:anchor});u.x=clamp(e.x+dx/len*70,90,944);u.y=clamp(e.y+dy/len*70,334,501);
      }else if(s.id==='thunder-crows'){const chain=[e];while(chain.length<s.chain){const next=bodies(run).filter(b=>!chain.includes(b)&&distance(b,chain.at(-1))<=s.chainRange).sort((a,b)=>distance(a,chain.at(-1))-distance(b,chain.at(-1)))[0];if(!next)break;chain.push(next);}
        let from=u;for(const target of chain){packet(run,actor,target,s.power*multiplier,api,events);effect(run,events,'crow-lightning',target,{from:{x:from.x,y:from.y}});from=target;}
      }else if(s.id==='golden-lion'){const hits=(u.attacks+1)%4===0?bodies(run).filter(b=>distance(b,e)<=s.radius):[e];for(const b of hits)packet(run,actor,b,s.power*multiplier,api,events);effect(run,events,'lion-claw',e);}
      else if(s.bolts){const picks=targets.slice(0,s.targets);if(!picks.length)picks.push(e);for(let i=0;i<s.bolts;i++)projectile(run,actor,picks[i%picks.length],s.power*multiplier/s.bolts,'nine-tail-foxfire',{x:u.x,y:u.y,delay:i*35});}
      else projectile(run,actor,e,s.power*multiplier,'foxfire',{x:u.x,y:u.y});u.attacks++;
    }else if(s.heal){let hosts=wounded(run).filter(a=>distance(u,a)<=s.reach&&a.hp<a.maxHp);if(s.radius){const anchor=hosts.find(a=>a.id!==c.lastHealHost)||hosts[0];if(anchor){c.lastHealHost=anchor.id;hosts=hosts.filter(a=>distance(a,anchor)<=s.radius).slice(0,s.targets);}}
      else hosts=hosts.slice(0,s.targets||1);for(const host of hosts)heal(run,actor,host,s.heal,s.cap,events,u);
    }else if(s.barrier){const hosts=front(run).filter(a=>distance(u,a)<=s.reach);const host=hosts.find(a=>a.id!==c.lastBarrierHost&&(!a.mikoBarrier||a.mikoBarrier.until<=run.time||a.mikoBarrier.amount<actor.damage*s.barrier*.5))||hosts[u.index%Math.max(1,hosts.length)];if(host){c.lastBarrierHost=host.id;barrier(run,actor,host,s,events,u);}}
    else if(s.spirit)for(const host of party(run))effect(run,events,'owl-halo',host,{target:host.id});
    u.actionAt=run.time;u.lastAction=run.time;return true;
  }
  function order(run,actor,s,multiplier,target){const units=run.mikoContracts.filter(c=>c.spec.role==='attack').flatMap(c=>c.units.map(u=>({c,u})));units.forEach(({c,u},i)=>run.mikoOrders.push({at:run.time+i*100,c,u,multiplier,target,source:actor}));}
  function finale(run,f,api,events){if(f.source.hp>0&&f.spec.finalPower){const center=bodies(run).sort((a,b)=>distance(a,f.source)-distance(b,f.source))[0]||f.source;for(const e of bodies(run).filter(e=>distance(e,center)<=f.spec.radius))packet(run,f.source,e,f.spec.finalPower,api,events,'spirit-finale');effect(run,events,'festival-finale',center);}}
  function festival(run,actor,s,events,api){const old=run.mikoFestival;if(old&&actor.epicMikoWeapon)finale(run,old,api,events);run.mikoFestival={source:actor,spec:s,start:run.time,until:run.time+s.lifetime,nextCoop:old?.nextCoop??run.time+5000};effect(run,events,'festival',actor,{skillId:s.id});
    if(s.id==='myriad-spirit-festival')for(const role of (actor.epicMikoArmor?['attack','attack','attack','attack','attack','heal','heal','heal','support','support','support']:['attack','attack','heal','support'])){const options=(actor.mikoSkills||[]).filter(n=>n.role===role&&!run.mikoContracts.some(c=>c.id===n.id)).sort((a,b)=>value(run,b)-value(run,a));const limit=actor.epicMikoArmor?({attack:5,heal:3,support:3}[role]):role==='attack'?2:1;if(run.mikoContracts.filter(c=>c.spec.role===role).length<limit&&options[0]){const c=summon(run,actor,options[0],events);c.festivalUntil=run.mikoFestival.until;c.until=Math.min(c.until,c.festivalUntil);}}
    party(run).forEach((a,i)=>run.mikoOrders.push({at:run.time+200+i*40,source:actor,host:a,cooperative:true,festival:s.id}));order(run,actor,s,1,null);
  }
  function release(run,actor,c,api,events){const s=c.spec;
    if(s.role==='normal'){const e=run.enemies.find(e=>e.id===c.target.id);if(e?.hp>0&&!e.invulnerable)projectile(run,actor,e,s.power,'paper-bolt',{normal:true,actionId:c.actionId});return;}
    if(['attack','heal','support'].includes(s.role)){summon(run,actor,s,events);return;}
    if(s.role==='possession'){possess(run,actor,s,c.target,events);return;}
    if(s.role==='festival'){festival(run,actor,s,events,api);return;}
    if(s.role==='command'){order(run,actor,s,s.commandPower,bodies(run).sort((a,b)=>distance(a,actor)-distance(b,actor))[0]);return;}
    if(s.role==='channel'){run.mikoChannel={source:actor,spec:s,start:run.time,until:run.time+s.lifetime};for(const k of run.mikoContracts)k.until=Math.min(run.time+k.spec.lifetime,k.until+s.extension);effect(run,events,'channel-crest',actor);return;}
    if(s.role==='twin'){const defensive=c.target.hp/c.target.maxHp<.7,preferred=defensive?['guardian-bear','life-serpent','swift-wolf','blade-spirit']:['swift-wolf','blade-spirit','guardian-bear','life-serpent'];const picks=(actor.mikoSkills||[]).filter(n=>n.role==='possession').sort((a,b)=>preferred.indexOf(a.id)-preferred.indexOf(b.id)).slice(0,2);if(picks.length<2||c.target.hp<=0)return;
      if(!actor.epicMikoArmor)run.mikoPossessions=run.mikoPossessions.filter(p=>p.host!==c.target);run.mikoTwin={host:c.target,until:run.time+s.lifetime};for(const p of picks)possess(run,actor,p,c.target,events,s.lifetime,true);effect(run,events,'twin-crest',c.target);}
  }
  function start(run,actor,s,target,api,events=[],force=false){if(run.status!=='running'||actor.hp<=0||actor.sleepUntil>run.time||actor.silenceUntil>run.time&&s.kind!=='normal'||actor.mikoCast||actor.mp<s.mp||!target||target.hp<=0||(!force&&(actor.mikoCooldowns?.[s.id]||0)>0))return false;
    actor.mp-=s.mp;actor.mikoCooldowns[s.id]=s.cooldown;api.state(actor,s.role==='normal'?'attacking':'skill',s.finisher);actor.mikoCast={spec:s,target,facing:target.x<actor.x?-1:1,elapsed:0,released:false,actionId:actor.actionId};
    if(s.role==='festival')for(const id of ['spirit-kagura','myriad-spirit-festival'])actor.mikoCooldowns[id]=s.cooldown;
    if(s.role==='normal')actor.cooldown=actor.interval;events.push({type:'miko-cast',skillId:s.id,name:s.name,x:actor.x,y:actor.y,timeMs:run.time});return true;
  }
  function advance(run,actor,api,events){const c=actor.mikoCast;if(!c)return;c.elapsed+=api.STEP*(actor.webUntil>run.time?.55:1)*attackRate(run,actor);Object.assign(actor,S.sample(c,c.elapsed));if(!c.released&&c.elapsed+EPS>=c.spec.release){c.released=true;release(run,actor,c,api,events);}if(c.elapsed+EPS>=c.spec.duration){actor.mikoCast=null;api.state(actor,'idle');}}
  function normalHit(run,actor,e,api,events,actionId){for(const p of run.mikoPossessions.filter(p=>p.host===actor&&p.id==='blade-spirit'&&p.until>run.time&&p.source.hp>0)){
    if(p.actions.has(actionId)||run.time-p.last<p.spec.period-EPS)continue;p.actions.set(actionId,run.time);p.last=run.time;packet(run,p.source,e,p.spec.power,api,events,'spirit-followup');effect(run,events,'blade-followup',e);}
  }
  function tick(run,api,events){
    for(const actor of party(run).filter(a=>a.type==='miko'&&a.epicMikoArmor&&a.epicSummonWave!==run.wave)){actor.epicSummonWave=run.wave;for(const s of actor.mikoSkills||[])if(['attack','heal','support'].includes(s.role))summon(run,actor,s,events);else if(s.role==='possession')possess(run,actor,s,targetFor(run,s),events);}
    const active=run.mikoFestival;if(active?.source.hp>0&&active.source.epicMikoWeapon&&active.until>run.time){for(const a of party(run))a.mp=Math.min(a.maxMp,a.mp+a.maxMp*.03*api.STEP/1000);if(run.time>=active.nextCoop){active.nextCoop+=5000;party(run).forEach((a,i)=>run.mikoOrders.push({at:run.time+200+i*40,source:active.source,host:a,cooperative:true,festival:active.spec.id}));order(run,active.source,active.spec,1,null);}}
    run.mikoContracts=run.mikoContracts.filter(c=>c.source.hp>0&&c.until>run.time&&(!c.festivalUntil||c.festivalUntil>run.time));run.mikoPossessions=run.mikoPossessions.filter(p=>p.source.hp>0&&p.host.hp>0&&p.until>run.time);
    for(const a of party(run)){a.recentMikoDamage=(a.recentMikoDamage||0)*.998;if(a.mikoBarrier&&(a.mikoBarrier.until<=run.time||a.mikoBarrier.source.hp<=0))a.mikoBarrier=null;}
    for(const c of run.mikoContracts)for(const u of c.units){const anchor=c.spec.id==='golden-lion'?bodies(run).sort((a,b)=>distance(u,a)-distance(u,b))[0]:c.spec.role==='attack'?c.source:wounded(run)[u.index%Math.max(1,party(run).length)];
      if(anchor){const dx=anchor.x+(c.spec.role==='attack'&&c.spec.id!=='golden-lion'?65+u.index*35:0)-u.x,dy=anchor.y+((u.index%2)*2-1)*24-u.y,len=Math.hypot(dx,dy)||1,step=(c.spec.speedMove||170)*api.STEP/1000;if(len>35){u.x+=dx/len*Math.min(step,len);u.y+=dy/len*Math.min(step,len);u.moving=true;}else u.moving=false;}
      if(run.time+EPS>=u.next){if(u.lastAction!==undefined&&run.time-u.lastAction<300-EPS){u.next=u.lastAction+300;continue;}action(run,c,u,api,events);const factor=c.spec.role==='attack'&&run.mikoChannel?.until>run.time?1-run.mikoChannel.spec.intervalReduction:1;u.next=run.time+c.spec.period*factor;}
    }
    for(const p of run.mikoPossessions){for(const [id,t] of p.actions)if(t<run.time-30000)p.actions.delete(id);if(run.time+EPS>=p.next){if(p.spec.barrier)barrier(run,p.source,p.host,p.spec,events);if(p.spec.heal)heal(run,p.source,p.host,p.spec.heal,p.spec.cap,events,p.host,false);p.next=run.time+p.spec.period;}}
    for(const o of run.mikoOrders){if(o.at>run.time+EPS)continue;if(!o.cooperative&&o.u.lastAction!==undefined&&run.time-o.u.lastAction<300-EPS){o.at=o.u.lastAction+300;continue;}o.done=true;if(o.source.hp<=0)continue;
      if(o.cooperative){if(o.host.hp<=0)continue;const e=bodies(run).sort((a,b)=>distance(a,o.source)-distance(b,o.source))[0];const normal=o.host.type==='warrior'?W.spec('renjin',o.host.normalRank||1,o.host.normalEnhance||0,o.host):o.host.mageNormal||o.host.paladinNormal||o.host.ninjaNormal||o.host.shamanNormal||o.host.mikoNormal;
        projectile(run,o.host,e,(normal?.power||1)*.6,'cooperative-strike',{cooperative:true});effect(run,events,'cooperative-strike',o.host,{target:e?.id});}
      else if(run.mikoContracts.includes(o.c)){const target=o.target?.hp>0?o.target:bodies(run).sort((a,b)=>distance(o.u,a)-distance(o.u,b))[0];if(target&&distance(o.u,target)>o.c.spec.reach){o.u.x=clamp(target.x-70,90,944);o.u.y=target.y;}action(run,o.c,o.u,api,events,o.multiplier,target);}
    }run.mikoOrders=run.mikoOrders.filter(o=>!o.done);
    for(const p of run.mikoProjectiles){p.age+=api.STEP;if(p.delay&&p.age<p.delay)continue;const e=run.enemies.find(e=>e.id===p.targetId);if(p.source.hp<=0||!e||e.hp<=0||e.invulnerable){p.done=true;continue;}
      const dx=e.x-p.x,dy=e.y-p.y,len=Math.hypot(dx,dy)||1,step=950*api.STEP/1000;if(len<=step+25){api.hit(run,p.source,e,p.damage,events,!p.normal,'魔法',{secondary:!p.normal,skipHitRoll:!p.normal,critical:p.normal?undefined:false,actionId:p.actionId,curseKind:p.cooperative?'cooperative':'summon'});effect(run,events,'spirit-impact',e);p.done=true;}else{p.x+=dx/len*step;p.y+=dy/len*step;}if(p.age>2000)p.done=true;
    }run.mikoProjectiles=run.mikoProjectiles.filter(p=>!p.done);
    const f=run.mikoFestival;if(f&&(f.source.hp<=0||f.until<=run.time)){run.mikoFestival=null;finale(run,f,api,events);effect(run,events,'torii-fade',f.source);}
    if(run.mikoChannel?.until<=run.time||run.mikoChannel?.source.hp<=0)run.mikoChannel=null;if(run.mikoTwin?.until<=run.time||run.mikoTwin?.host.hp<=0)run.mikoTwin=null;
  }
  function choose(run,actor){const live=bodies(run),friends=party(run),hurt=wounded(run),low=hurt[0],missing=friends.reduce((n,a)=>n+1-a.hp/a.maxHp,0)/Math.max(1,friends.length);let best=null;
    for(const s of actor.mikoSkills||[]){if(actor.mp<s.mp||(actor.mikoCooldowns[s.id]||0)>0)continue;let score=0,target=actor;
      if(['attack','heal','support'].includes(s.role)){if(!viableContract(run,s,actor))continue;
        if(s.role==='attack')score=20+value(run,s)*3;
        if(s.role==='heal'){if(!actor.epicMikoArmor&&(!low||(missing<.12&&low.hp/low.maxHp>.70)))continue;score=(low.hp/low.maxHp<.45?100:35)+value(run,s)*4;}
        if(s.role==='support')score=15+value(run,s)*4;
      }else if(s.role==='possession'){target=targetFor(run,s);if(!target)continue;const old=run.mikoPossessions.find(p=>p.id===s.id);if(old&&old.host===target&&old.until-run.time>3000)continue;
        const other=run.mikoPossessions.find(p=>p.host===target&&p.id!==s.id&&p.until-run.time>3000);if(other&&!actor.epicMikoArmor&&!(run.mikoTwin?.host===target&&run.mikoTwin.until>run.time)){const alternatives=friends.filter(a=>!run.mikoPossessions.some(p=>p.host===a&&p.until-run.time>3000));if(!alternatives.length)continue;target=alternatives[0];}
        if(s.heal&&!actor.epicMikoArmor&&target.hp/target.maxHp>.8)continue;score=s.barrier&&low.hp/low.maxHp<.45?80:14;
      }else if(s.role==='festival'){if(run.mikoFestival?.until>run.time+(actor.epicMikoWeapon?3000:0)||friends.length<3||!live.length||live.reduce((n,e)=>n+e.hp,0)<friends.reduce((n,a)=>n+a.damage,0)*3)continue;
        if(!run.mikoContracts.some(c=>c.spec.role==='attack')&&run.time<2000)continue;score=28+s.spirit;
      }else if(s.role==='command'){if(!run.mikoContracts.some(c=>c.spec.role==='attack'))continue;score=18;}
      else if(s.role==='channel'){if(run.mikoChannel?.until>run.time||!run.mikoContracts.some(c=>c.spec.role==='attack'))continue;score=24;}
      else if(s.role==='twin'){if(run.mikoTwin?.until>run.time||(actor.mikoSkills||[]).filter(n=>n.role==='possession').length<2)continue;target=front(run)[0];score=17;}
      if(score>0&&(!best||score>best.score))best={spec:s,target,score};
    }return best;
  }
  function reconcile(run,actor){
    for(const c of run.mikoContracts){const next=actor.mikoSkills.find(s=>s.id===c.id);if(next){c.spec=next;c.until=Math.min(c.until,run.time+next.lifetime);}}
    for(const p of run.mikoPossessions){const next=actor.mikoSkills.find(s=>s.id===p.id);if(next){p.spec=next;p.until=Math.min(p.until,run.time+next.lifetime);}}
    if(!actor.epicMikoArmor){for(const role of ['attack','heal','support']){const keep=run.mikoContracts.filter(c=>c.spec.role===role).slice(0,role==='attack'?2:1);run.mikoContracts=run.mikoContracts.filter(c=>c.spec.role!==role||keep.includes(c));}for(const host of party(run)){const keep=run.mikoPossessions.filter(p=>p.host===host).slice(0,run.mikoTwin?.host===host?2:1);run.mikoPossessions=run.mikoPossessions.filter(p=>p.host!==host||keep.includes(p));}}
    if(run.mikoFestival){const f=run.mikoFestival,next=actor.mikoSkills.find(s=>s.id===f.spec.id);if(next){f.spec=next;f.until=Math.min(f.until,f.start+next.lifetime);}}
  }
  function cancel(run,actor){actor.mikoCast=null;}
  function clear(run,actor=null){if(actor&&actor.type!=='miko'){run.mikoPossessions=run.mikoPossessions.filter(p=>p.host!==actor);if(run.mikoTwin?.host===actor)run.mikoTwin=null;actor.mikoBarrier=null;return;}
    for(const a of [run.hero,...run.allies]){a.mikoBarrier=null;a.mikoCast=null;}init(run);
  }
  return {reconcile,init,party,bodies,attackRate,spirit,heal,barrier,absorb,summon,possess,start,advance,tick,choose,normalHit,cancel,clear,action,value,projectile};
});
