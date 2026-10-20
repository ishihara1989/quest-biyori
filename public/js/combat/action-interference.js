'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('../data/interference-reference.js'):root.InterferenceReference);if(typeof module==='object'&&module.exports)module.exports=api;else root.ActionInterference=api;})(globalThis,reference=>{
  const EPS=1e-7;
  // A number is per impact. Arrays select successive impacts; {primary,splash}
  // preserves a heavy main-target strike without giving every AoE target its power.
  const primary=(main,splash)=>({primary:main,splash});
  const SKILLS={
    warrior:{renjin:0,moon:15,fang:primary(70,15),return:12,rings:10,zflash:10,pierce:18,rise:18,running:6,cross:22,hundred:10,earth:primary(60,20),six:8,sphere:6,crater:primary(110,25),eight:8,divide:primary(120,30),invisible:6,tornado:5,worldcross:[20,20,primary(90,25)],ultimate:[6,6,6,6,6,6,6,6,6,6,primary(170,35),12]},
    paladin:{mace:0,hammer:primary(100,20),wave:25,charge:[40,110],spear:135,bash:primary(140,45),judgment:primary(180,55),pillar:18,wall:25,crusade:{perHit:20,final:140},ray:{perHit:12,final:90},heavens:{perHit:10,final:110},revenge:primary(190,45),ultimate:primary(240,80)},
    ninja:{shuriken:0,'star-burst':12,'flash-bomb':25,'shadow-pin':45,'air-fan':8,'seal-tags':60,'fuma-return':18,'shadow-cross':10,'paralysis-needles':14,'fuma-orbit':8,'shadow-prison':25,'unseen-volley':6,'thousand-shadow':{perHit:6,final:25}},
    mage:{bolt:0,fireball:primary(30,10),ice:15,thunder:55,frost:8,vortex:6,chain:18,pillars:10,earth:12,storm:10,crystal:10,meteor:primary(80,20),tempest:10,beam:4,avalanche:6,prison:8,four:8,cosmos:primary(100,25)},
    shaman:{'curse-chain':20,'curse-burst':30,'soul-pierce':45,'grudge-collapse':primary(50,20),'hundred-hex':0},miko:{}
  };
  // resistance, capacity, preparation milliseconds; actions retain distinct roles.
  const ACTIONS={
    'boss-slime':{split:[5,30,1100]},'boss-boar':{'charge-windup':[35,40,1200]},
    alraune:{'vine-slam':[25,35,1000]},treant:{'root-bury':[35,55,1200],'throw-fruit':[20,40,1100]},
    'king-toad':{tongue:[20,30,1000]},'mud-hand':{grab:[15,20,800]},'mud-giant':{windup:[35,50,1700]},
    lich:{chant:[5,45,1900]},hydra:{charge:[60,80,2200]},
    'cave-bat':{sonic:[5,25,850]},'great-bat':{drain:[10,45,1100],sonic:[5,45,1100],dive:[35,55,1200]},
    'large-worm':{bury:[45,55,1300]},'cave-spider':{web:[5,25,850]},arachne:{web:[8,45,1100],volley:[15,60,1200]},
    'cave-troll':{slam:[65,90,1600],stomp:[65,90,1600],throw:[40,80,1400],excavate:[50,85,1500]},
    'great-hermit':{shell:[60,75,1500]},'lizard-chief':{sweep:[35,55,1100],tail:[35,55,1100]},
    octopus:{ink:[5,25,850]},scylla:{bubble:[5,60,1200],tentacle:[35,55,1100]},
    kraken:{ink:[10,90,1400],bury:[70,100,1700],breath:[60,110,1800],tentacle:[45,80,1300]},
    'stone-guard':{sweep:[20,25,850]},'rune-gargoyle':{shock:[10,30,1000]},'floating-magic-core':{bomb:[5,35,1200]},
    'armored-golem':{slam:[70,85,1600],sweep:[55,70,1300],combo:[65,95,1500]},
    'ancient-ballista':{fan:[20,75,1400],burst:[20,75,1400],ram:[45,55,1100]},
    seraphina:{volley:[10,100,1800],pillars:[10,100,1800],ring:[30,75,1400]},
    'ancient-titan':{beam:[35,150,2100],slam:[85,110,1900],stomp:[85,110,1900],fire:[75,100,1600]},
    'sand-scorpion':{sting:[20,25,850]},'bandage-soldier':{bind:[5,25,850]},
    'obsidian-scorpion':{sweep:[65,90,1400],stingers:[35,85,1500],volley:[15,75,1400]},
    'golden-pharaoh':{wave:[10,90,1700],binds:[10,90,1700],summon:[5,120,1900]},
    lamia:{volley:[5,80,1400],sweep:[40,75,1400],binds:[10,90,1700]},
    'sand-behemoth':{charge:[100,125,2000],quake:[85,120,2000],roar:[25,120,1800],burrow:[90,110,1800]},
    'rock-horn-goat':{charge:[25,30,1000]},'wind-sprite':{blade:[5,25,850]},
    'storm-jackal':{charge:[50,90,1400],claw:[30,75,1100]},
    'iron-horn':{sweep:[65,95,1400],charge:[85,110,1800],rocks:[20,80,1400]},
    'harpy-queen':{feathers:[10,90,1500],ring:[30,90,1500],dive:[60,100,1700]},
    manticore:{'double-claw':[78,286,1500],venom:[24,338,1900],gust:[66,312,1800],pounce:[114,364,2100]},
    'frost-wolf':{leap:[18,40,2200]},'ice-shell-golem':{smash:[45,65,2600]},'snow-spirit':{ring:[5,65,2600]},
    fenrir:{leap:[55,120,4000],howl:[12,150,4200]},'crystal-golem':{fan:[90,150,4400],armor:[60,160,4200]},
    'yuki-onna':{pillars:[8,170,4600],seal:[15,160,4600]},
    'ice-tusk-mammoth':{sweep:[70,150,4000],quake:[110,180,4600],boulder:[20,180,4800],crown:[85,220,5400]},
    'lava-salamander':{'danger-1':[25,50,2400]},'obsidian-soldier':{'danger-1':[65,70,2600]},'young-fire-dragon':{'danger-1':[8,80,2800]},
    'magma-salamander':{'danger-1':[15,170,4400],'danger-2':[60,160,4200]},'obsidian-executioner':{'danger-1':[105,185,4400],'danger-2':[80,200,4800]},
    'dragon-girl':{'danger-1':[12,190,4400],'danger-2':[55,180,4800]},dragon:{'danger-1':[110,200,4600],'danger-2':[65,220,5000],'danger-3':[25,230,5200]},
    'demon-armored-soldier':{'danger-1':[55,80,2600]},imp:{'danger-1':[8,90,2600]},'dream-demon':{'danger-1':[10,95,2800]},
    'black-knight':{'danger-1':[115,200,4600],'danger-2':[85,190,4400]},'arch-demon':{'danger-1':[18,210,4800],'danger-2':[10,230,5000]},
    lilith:{'danger-1':[12,220,5000],'danger-2':[25,180,4600]},'demon-god':{'danger-1':[120,230,4800],'danger-2':[20,250,5200],'danger-3':[30,200,4600],'danger-4':[80,270,5600]},
    'extradimensional-goddess':{rift:[180,1800,5000],wave:[145,2100,5400],ultimate:[200,2400,6200]},
    'reincarnation-goddess':{laser:[140,1900,1500],truck:[170,2800,4060]}
  };
  function config(enemy,motion){const row=ACTIONS[enemy.type]?.[motion];return row?{resistance:row[0],capacity:row[1],warn:Math.max(row[2],enemy.boss?(['boss-boar','alraune','treant','king-toad','mud-giant','lich'].includes(enemy.type)?5000:3800):2000)}:null;}
  function skill(job,s,stats={}){
    s.interference=SKILLS[job]?.[s.id]||0;s.interferenceScale=(1+.05*(s.rank-1))*(1+Math.max(0,stats.interferencePower||0));
    if(job==='shaman'){
      if(s.id==='frailty-hex')s.resistanceDown=.2+.025*(s.rank-1);
      if(s.id==='soul-pierce'){s.resistanceDown=.3+.0125*(s.rank-1);s.resistanceDownDuration=4000;}
      if(s.id==='soul-seal-field'){s.resistanceDown=.25+.025*(s.rank-1);s.resistanceDownDuration=2100;}
    }
    return s;
  }
  function power(s,index=0,isPrimary=true,isFinal=false){let value=s.interference||0;
    if(Array.isArray(value))value=value[Math.min(index,value.length-1)];
    if(value&&typeof value==='object'&&'perHit'in value)value=isFinal||(s.hits>0&&index===s.hits-1)?value.final:value.perHit;
    if(value&&typeof value==='object')value=isPrimary?value.primary:value.splash;
    return (value||0)*(s.interferenceScale||1);
  }
  function parameters(s){const n=v=>Number((v*(s.interferenceScale||1)).toFixed(1)),v=s.interference,parts=[];
    if(typeof v==='number'&&v)parts.push('行動妨害力 '+n(v)+' / Hit');
    else if(Array.isArray(v))parts.push('行動妨害力 '+v.map(x=>typeof x==='number'?n(x):n(x.primary)+' / '+n(x.splash)).join(' → '));
    else if(v?.primary)parts.push('主対象妨害力 '+n(v.primary),'範囲妨害力 '+n(v.splash));
    else if(v?.perHit)parts.push('行動妨害力 '+n(v.perHit)+' / Hit','終撃妨害力 '+n(v.final));
    if(s.resistanceDown)parts.push('妨害抵抗力 −'+Math.round(s.resistanceDown*100)+'%','抵抗低下時間 '+Number(((s.resistanceDownDuration||s.lifetime)/1000).toFixed(2))+'秒');
    return parts.length?' · '+parts.join(' · '):'';
  }
  const owner=(run,e)=>e.bodyPart?run.enemies.find(a=>a.id===e.ownerId)||e:e;
  function contains(s,p){
    if(['circle','annulus','sector'].includes(s.kind)){
      const d=Math.hypot(p.x-s.center.x,p.y-s.center.y);if(d>s.radius)return false;
      if(s.kind==='annulus')return s.innerRadius?d>s.innerRadius:true;
      if(s.kind==='sector'){if(d===0)return true;const a=Math.atan2(p.y-s.center.y,p.x-s.center.x)-s.direction;return Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<=s.angle/2;}
      return true;
    }
    if(s.kind!=='lane')return false;
    const dx=s.to.x-s.from.x,dy=s.to.y-s.from.y,len=Math.hypot(dx,dy)||1,x=p.x-s.from.x,y=p.y-s.from.y,along=(x*dx+y*dy)/len,pad=s.precise?0:25;return along>=-pad&&along<=(s.length||len)+pad&&Math.abs(x*dy-y*dx)/len<=s.width;
  }
  const open=(e,time)=>!!(e.actionInterference&&!e.actionInterference.interrupted&&e.hp>0&&time+EPS<e.actionInterference.endsAt);
  const committed=(e,time)=>!!(e.actionInterference&&!e.actionInterference.interrupted&&(e.swampPlan||e.expansionPlan||e.ruinsPlan||e.desertPlan||e.highlandPlan||e.glacierPlan||e.volcanoPlan||e.castlePlan||['windup','attacking','splitting'].includes(e.state)));
  function resistance(e,time){const a=e.actionInterference;if(!a)return 0;const lower=Math.min(.35,Math.max(0,...(e.interferenceDebuffs||[]).filter(d=>d.until>time).map(d=>d.rate)));return a.resistance*(1-lower);}
  function lower(run,e,s,source){e=owner(run,e);if(!s.resistanceDown||e.hp<=0||e.invulnerable)return;
    e.interferenceDebuffs=(e.interferenceDebuffs||[]).filter(d=>d.until>run.time&&!(d.source===source.id&&d.id===s.id));
    e.interferenceDebuffs.push({id:s.id,source:source.id,rate:Math.min(.35,s.resistanceDown),until:run.time+(s.resistanceDownDuration||s.lifetime)});
  }
  function begin(run,e,motion,warn,target,events=[],extra={}){const base=config(e,motion);e.actionInterference=null;e.actionThreat=null;if(!base)return null;
    // A half-HP attack needs a real recovery opening, especially before healers join.
    const recovery=e.majorBoss?({hydra:9000,kraken:1000,'ancient-titan':2500}[e.type]||3000):e.boss?(run.stage.id<=10?20000:9000):5000;
    e.cooldown=e.majorBoss?Math.max(e.interval||0,warn+recovery):Math.max(e.cooldown||0,warn+recovery);
    const count=e.interruptCount||0,a={actionId:e.id+'-threat-'+(++run.serial),motion,startedAt:run.time,endsAt:run.time+warn,
      resistance:base.resistance*(1+.25*count),capacity:(extra.capacity||base.capacity)*(1+.15*count),remaining:0,
      interrupted:false,releaseDelay:extra.releaseDelay||0,damageSpan:extra.damageSpan||0,processed:new Set(),origin:{x:e.x,y:e.y},aim:{x:target.x,y:target.y},shapes:extra.shapes||[]};a.remaining=a.capacity;
    const risk=e.boss?(run.stage.id<=10?.3:.5):.1;
    e.actionInterference=a;e.actionThreat={actionId:a.actionId,stage:run.stage.id,hits:extra.hits||1,risk,followupFraction:e.majorBoss?.6:risk*.4,damageScale:e.damage>0?(e.actionDamage??e.damage)/e.damage:0};
    events.push({type:'enemy-prepare',target:e.id,x:e.x,y:e.y,timeMs:run.time});return a;
  }
  function impact(run,source,e,powerValue,events=[],key=null){e=owner(run,e);if(!open(e,run.time)||e.invulnerable||!(powerValue>0))return false;
    const a=e.actionInterference;if(key&&a.processed.has(key))return false;if(key)a.processed.add(key);
    const r=resistance(e,run.time)*(1-Math.min(.4,Math.max(0,source.interferencePenetration||0))),cut=Math.max(0,powerValue-r);a.remaining=Math.max(0,a.remaining-cut);
    events.push({type:cut>0?'interference-hit':'interference-resist',target:e.id,source:source.id,power:powerValue,resistance:r,amount:cut,remaining:a.remaining,x:e.x,y:e.y,timeMs:run.time});
    if(a.remaining>EPS)return false;a.interrupted=true;e.interruptCount=(e.interruptCount||0)+1;
    e.swampPlan=null;e.expansionPlan=null;e.ruinsPlan=null;e.desertPlan=null;e.highlandPlan=null;e.glacierPlan=null;e.volcanoPlan=null;e.castlePlan=null;e.glacierArmorUntil=0;e.z=0;e.desertDepth=0;
    if(e.goddess){e.goddessPlan=null;e.goddessForecast=null;}
    e.state='idle';e.motion='hit';e.time=0;e.motionTime=0;e.hit=true;e.stagger=e.majorBoss?200:350;
    e.cooldown=Math.max(e.cooldown||0,650);if(e.type==='boss-slime')e.special=8000;
    e.controlKind=null;e.controlUntil=0;e.controlAnchor=null;e.rootAnchor=null;
    events.push({type:'action-interrupt',target:e.id,source:source.id,count:e.interruptCount,x:e.x,y:e.y,timeMs:run.time});return true;
  }
  function prepareParts(e,parts){parts=parts.map(p=>({...p,events:(p.events||[]).map(v=>({...v}))}));const c=config(e,parts[0].motion);if(!c)return {parts,warn:0};
    let warn=c.warn;if(!parts[0].events.length){parts[0].duration=Math.max(parts[0].duration,warn);warn=parts[0].duration;}
    else if(['dive','bury'].includes(parts[0].motion)){parts.unshift({motion:parts[0].motion,duration:warn,events:[],preparation:true});}
    else {const shift=Math.max(0,warn-parts[0].events[0].at);parts[0].duration+=shift;for(const v of parts[0].events)v.at+=shift;warn=parts[0].events[0].at;}
    let elapsed=0;const impacts=[];for(const p of parts){for(const v of p.events)impacts.push(elapsed+v.at);elapsed+=p.duration;}const first=impacts[0]||warn,last=impacts.at(-1)||first;return {parts,warn,releaseDelay:Math.max(0,first-warn),damageSpan:Math.max(0,last-first)};
  }
  function dangerDamage(threat,target,index=0){if(!threat||!threat.damageScale)return null;const row=reference[threat.stage]?.[target.type];if(!row)return null;
    const risk=threat.risk??.5,fraction=index===0?risk:Math.min(.4,(threat.followupFraction??risk*.4)/Math.max(1,threat.hits-1));return row.hp*fraction*(1+row.defense/80)*threat.damageScale;
  }
  function score(run,actor,s,e,hitTimes){if(!open(e,run.time))return 0;const left=e.actionInterference.endsAt-run.time,times=hitTimes||s.events||[s.release||s.duration*.5];
    const flight=actor.type==='ninja'?Math.hypot(actor.x-e.x,actor.y-e.y)/1300*1000:0;
    let cut=0;for(let i=0;i<times.length;i++){if(times[i]+flight>=left)continue;cut+=Math.max(0,power(s,i,true)-resistance(e,run.time+times[i]+flight)*(1-Math.min(.4,Math.max(0,actor.interferencePenetration||0))));}
    return cut>=e.actionInterference.remaining?12000:cut>0?2500*cut/e.actionInterference.remaining:0;
  }
  function clear(e){e.actionInterference=null;e.actionThreat=null;e.interferenceDebuffs=[];}
  return {SKILLS,ACTIONS,config,skill,power,parameters,owner,contains,open,committed,resistance,lower,begin,impact,prepareParts,dangerDamage,score,clear};
});
