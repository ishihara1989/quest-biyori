'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NinjaSkills = api;
})(globalThis, () => {
  // Ground coordinates match the arena. All clocks are milliseconds.
  const I=typeof module==='object'&&module.exports?require('../combat/action-interference.js'):globalThis.ActionInterference;
  const rows = [
    ['shuriken','手裏剣',1,'attack-shuriken','shot',1,360,0,0,520],
    ['star-burst','連星手裏剣',5,'throw-combo','burst',3.6,440,8,6000,600],
    ['flash-bomb','閃光玉',10,'throw-tool','flash',.4,460,10,12000,560],
    ['shadow-clone','影分身の術',15,'cast-release','clone',0,360,18,14000,720],
    ['caltrop-field','撒菱陣',20,'lay-trap','caltrop',1,460,12,10000,550],
    ['shadow-pin','影縫い',25,'attack-shuriken','pin',1.8,500,12,9000,520],
    ['air-fan','飛燕手裏剣',30,'air-throw','fan',6,500,16,9000,960],
    ['shadow-echo','影写しの術',35,'cast-release','echo',0,360,20,18000,640],
    ['seal-tags','封手札',40,'throw-tool','tags',1.2,500,16,12000,640],
    ['fuma-return','風魔手裏剣',45,'throw-combo','return',5.4,620,20,12000,680],
    ['mist-clones','霞分身の術',50,'cast-release','clone',0,360,30,22000,820],
    ['thread-field','絡糸陣',55,'lay-trap','thread',3,500,22,16000,600],
    ['shadow-cross','影渡り',60,'low-dash','cross',7.5,560,24,16000,1200],
    ['paralysis-needles','麻痺針',65,'throw-combo','needles',5.2,540,22,14000,580],
    ['fuma-orbit','乱れ風魔',70,'throw-combo','orbit',6,600,30,18000,780],
    ['haze-screen','朧煙幕',75,'throw-tool','haze',0,520,26,20000,620],
    ['shadow-double','影武者の術',80,'cast-release','clone',0,360,38,28000,760],
    ['shadow-prison','封影結界',85,'cast-release','prison',4,620,40,24000,900],
    ['eight-way-clones','八方影分身',90,'cast-release','clone',0,620,48,30000,960],
    ['unseen-volley','無影連舞',95,'low-dash','volley',16,620,54,28000,1600],
    ['thousand-shadow','奥義・千影万華',100,'cast-release','ultimate',31.8,720,72,45000,3600],
  ];
  const ACTIVE = rows.map(([id,name,unlockLevel,motion,pattern,budget,reach,mp,cooldown,action],index) => ({
    id,name,unlockLevel,motion,pattern,budget,reach,mp,cooldown,action,index,kind:index?'active':'normal',
    maxRank:index?5:1,cost:index?1:0,requires:[],effect:{},icon:'assets/skills/ninja/icons/'+id+'.png',
  }));
  const GENERAL = [
    ['discipline','忍の心得',1,{damage:5},'攻撃力 +5 / Lv','shuriken'],
    ['garb','忍装の守り',7,{maxHp:35,defense:1},'最大HP +35 / Lv · 防御 +1 / Lv','shadow-double'],
    ['breath','忍の呼吸',12,{mpRegen:.6},'MP回復 +0.6 / 秒 / Lv','shadow-clone'],
    ['footwork','疾風の足運び',22,{speed:8,attackSpeed:.03},'移動速度 +8 / Lv · 攻撃速度 +3% / Lv','shadow-cross'],
    ['precision','急所見切り',32,{crit:.025},'クリティカル率 +2.5% / Lv','paralysis-needles'],
    ['reach','投擲の間合い',42,{skillRange:12},'範囲 +12 / Lv','air-fan'],
    ['reserve','深い呼吸',52,{maxMp:16,mpRegen:.4},'最大MP +16 / Lv · MP回復 +0.4 / 秒 / Lv','shadow-echo'],
    ['ninjutsu','忍術の極意',62,{skillPower:.06},'スキル威力 +6% / Lv','thousand-shadow'],
    ['mastery','投擲の練達',72,{weaponPower:.04},'武器攻撃 +4% / Lv','fuma-orbit'],
    ['cycle','影の循環',82,{haste:.05},'再使用速度 +5% / Lv','eight-way-clones'],
    ['execution','必殺の刃',92,{critMultiplier:.1},'クリティカル倍率 +0.1 / Lv','unseen-volley'],
  ].map(([id,name,unlockLevel,effect,note,art])=>({id,name,unlockLevel,effect,note,icon:'assets/skills/ninja/icons/'+art+'.png',kind:'passive',maxRank:5,cost:1,requires:[]}));
  const ENHANCEMENTS=ACTIVE.map(s=>{
    const notes=[];
    if(s.pattern!=='haze')notes.push((s.pattern==='clone'?'分身威力':s.pattern==='echo'?'複写威力':'威力')+' +10% / Lv');
    notes.push('射程 +4% / Lv','範囲 +4% / Lv','動作時間 −3% / Lv');
    if(['clone','echo','caltrop','thread','orbit','haze','prison'].includes(s.pattern))notes.push('効果時間 +4% / Lv');
    return {id:s.id+'-enhance',name:s.name+'・忍術強化',unlockLevel:Math.min(100,s.unlockLevel+2),icon:s.icon,skillId:s.id,kind:'enhancement',maxRank:5,cost:1,requires:[s.id],effect:{},note:notes.join(' · ')};
  });
  const NODES=[...ACTIVE,...ENHANCEMENTS,...GENERAL].sort((a,b)=>a.unlockLevel-b.unlockLevel||['normal','active','enhancement','passive'].indexOf(a.kind)-['normal','active','enhancement','passive'].indexOf(b.kind)).map(n=>({...n,x:100+(n.unlockLevel-1)/5*180,y:['normal','active'].includes(n.kind)?140:n.kind==='enhancement'?285:430}));
  const MOTIONS = ['backward','jump','attack-shuriken','seal','throw-combo','throw-tool','cast-release','air-throw','lay-trap','low-dash'];
  const CLONE_IDS = ['shadow-clone','mist-clones','shadow-double','eight-way-clones','thousand-shadow'];
  const ECHO_IDS = ['shuriken','star-burst','shadow-pin','air-fan','fuma-return','shadow-cross','unseen-volley'];
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  function spec(id,rank=1,enhance=0,stats={}) {
    const base=ACTIVE.find(s=>s.id===id); if(!base)throw new RangeError('Unknown ninja skill: '+id);
    rank=clamp(Math.round(rank),1,base.maxRank); enhance=clamp(Math.round(enhance),0,5); const r=rank-1,q=r/4,upgrade=1+enhance*.1,area=1+enhance*.04;
    const lerp=(a,b)=>a+(b-a)*q, integers=a=>a[r];
    const clockScale=Math.max(.18/base.action*1000,(1-enhance*.03)/Math.max(.01,stats.attackSpeed||1));
    const s={...base,rank,enhance,speed:1/clockScale,duration:base.action*clockScale,
      power:base.budget*(1+.18*r)*upgrade*(1+(id==='shuriken'?0:stats.skillPower||0)),
      cooldown:base.cooldown*(1+(stats.cooldownPenalty||0))/(1+(stats.haste||0)),
      radius:0,count:1,targetCount:1,cloneCount:0,clonePower:0,lifetime:0,control:null,controlDuration:0,
      blindDuration:0,slow:0,width:0,angle:0,sharedWait:CLONE_IDS.includes(id)?8000:0,
    };
    const table={
      'star-burst':{count:integers([3,3,4,4,5])},
      'flash-bomb':{radius:lerp(130,170),blindDuration:lerp(4000,5000)},
      'shadow-clone':{cloneCount:integers([1,1,1,2,2]),clonePower:.4,lifetime:lerp(5000,6000)},
      'caltrop-field':{radius:lerp(130,160),slow:lerp(.4,.55),lifetime:lerp(5000,6000),pulse:1000},
      'shadow-pin':{control:'root',controlDuration:lerp(1400,1800)},
      'air-fan':{count:integers([5,5,6,6,7]),hitCap:2,angle:lerp(50,80)*Math.PI/180},
      'shadow-echo':{echoCount:integers([4,4,5,5,6]),echoPower:.35,lifetime:lerp(6000,7000)},
      'seal-tags':{radius:lerp(180,220),targetCount:integers([3,3,4,4,5]),control:'seal',controlDuration:lerp(1600,2000)},
      'fuma-return':{count:2,width:lerp(70,90)},
      'mist-clones':{cloneCount:integers([2,2,2,3,3]),clonePower:.45,lifetime:lerp(6000,7000),radius:lerp(180,220),blindDuration:lerp(1800,2200)},
      'thread-field':{radius:lerp(180,220),lifetime:lerp(6000,7200),pulse:1200,control:'root',controlDuration:lerp(1400,1800)},
      'shadow-cross':{locations:integers([3,3,3,4,4]),count:integers([6,6,6,8,8])},
      'paralysis-needles':{count:integers([4,4,5,5,6]),targetCount:integers([3,3,3,4,4]),control:'stop',controlDuration:lerp(600,900)},
      'fuma-orbit':{blades:integers([3,3,3,4,4]),radius:lerp(210,250),lifetime:lerp(3000,3500),pulse:500},
      'haze-screen':{radius:lerp(240,300),lifetime:lerp(6000,8000),blindDuration:lerp(3000,4000)},
      'shadow-double':{cloneCount:integers([3,3,3,4,4]),clonePower:.45,lifetime:lerp(6000,7000),substitute:true},
      'shadow-prison':{radius:lerp(250,310),lifetime:lerp(5000,6000),pulse:1500,pulses:4,control:'stop',controlDuration:lerp(600,900)},
      'eight-way-clones':{cloneCount:integers([4,4,5,5,6]),clonePower:.35,lifetime:lerp(6000,8000)},
      'unseen-volley':{count:integers([16,16,20,20,24]),volleys:4},
      'thousand-shadow':{cloneCount:6,radius:lerp(320,380),waves:integers([6,6,7,7,8]),count:integers([36,36,42,42,48]),control:'stop',controlDuration:lerp(800,1000)},
    };
    Object.assign(s,table[id]);
    s.reach*=area;
    if(s.radius)s.radius=s.radius*area+(stats.skillRange||0);
    if(s.width)s.width*=area;
    s.clonePower*=upgrade;s.echoPower=(s.echoPower||0)*upgrade;
    s.lifetime*=1+enhance*.04;
    if(stats.epicNinjaWeapon){s.clonePower=s.cloneCount?1:0;s.echoPower=s.echoCount?1:0;if(s.pattern==='orbit'){s.blades*=3;s.power*=3;}}
    if(stats.epicNinjaArmor){s.mp*=.3;if(CLONE_IDS.includes(id)){s.cloneCount+=4;s.lifetime=(s.lifetime||base.action)*3;s.sharedWait=0;}}
    s.pulses ||= s.pulse?Math.ceil(s.lifetime/s.pulse-1e-8):0;
    const release={'shuriken':180,'star-burst':180,'flash-bomb':440,'shadow-clone':600,'caltrop-field':280,
      'shadow-pin':180,'air-fan':400,'shadow-echo':520,'seal-tags':240,'fuma-return':280,'mist-clones':660,
      'thread-field':300,'shadow-cross':300,'paralysis-needles':180,'fuma-orbit':280,'haze-screen':440,
      'shadow-double':600,'shadow-prison':720,'eight-way-clones':760,'unseen-volley':240,'thousand-shadow':960};
    s.release=release[id]*clockScale;
    const spread=(count,a,b)=>Array.from({length:count},(_,i)=>(count===1?a:a+(b-a)*i/(count-1))*clockScale);
    s.events = s.pattern==='burst'||s.pattern==='needles'?spread(s.count,180,420):
      s.pattern==='cross'?spread(s.locations,300,s.locations===3?900:1050):
      s.pattern==='volley'?spread(4,240,1260):s.pattern==='ultimate'?[s.release,...spread(s.waves,1080,2480),3000*clockScale]:[s.release];
    s.cloneLimit=stats.epicNinjaArmor?s.cloneCount:6;return s;
  }
  function parameters(s) {
    const a=[];
    if(s.power){a.push('属性 物理');
      if(s.pattern==='ultimate')a.push('連射威力 ×'+(s.power*23.4/31.8/s.count).toFixed(2)+' / 発','投擲数 '+s.count,'終撃威力 ×'+(s.power*8.4/31.8/6).toFixed(2)+' / 発','終撃数 6');
      else a.push('威力 ×'+(s.power/(s.pattern==='tags'?1:s.pulses||s.count)).toFixed(2)+(s.pattern==='tags'?' / 対象':s.pulses?' / 波':' / 発'));
    }
    if(s.count>1&&s.pattern!=='ultimate')a.push(s.pattern==='return'?'往復 2 Hit':'投擲数 '+s.count);
    if(s.targetCount>1)a.push('対象数 '+s.targetCount);
    if(s.hitCap)a.push('同一対象上限 '+s.hitCap+' Hit');
    if(s.cloneCount)a.push('分身数 '+s.cloneCount,'分身上限 '+s.cloneLimit);
    if(s.clonePower)a.push('分身威力 '+Math.round(s.clonePower*100)+'%');
    if(s.substitute)a.push('単体攻撃回避 1 Hit','回避移動 36');
    if(s.echoCount)a.push('複写回数 '+s.echoCount,'複写威力 '+Math.round(s.echoPower*100)+'%','複写遅延 0.15秒');
    a.push('射程 '+Math.round(s.reach)); if(s.radius)a.push('半径 '+Math.round(s.radius));if(s.width)a.push('幅 '+Math.round(s.width));
    if(s.angle)a.push('角度 '+Math.round(s.angle*180/Math.PI)+'°');if(s.locations)a.push('投擲地点 '+s.locations);
    if(s.blades)a.push('刃数 '+s.blades);if(s.pulses)a.push('波数 '+s.pulses,'周期 '+(s.pulse/1000).toFixed(2)+'秒');
    if(s.lifetime)a.push('効果時間 '+(s.lifetime/1000).toFixed(2)+'秒');
    if(s.blindDuration)a.push('命中低下 50%','目眩まし '+(s.blindDuration/1000).toFixed(2)+'秒','ボス命中低下 15%','ボス目眩まし '+(s.blindDuration/2000).toFixed(2)+'秒');
    if(s.slow)a.push('移動速度 −'+Math.round(s.slow*100)+'%','ボス移動低下 0%');
    if(s.control)a.push(({root:'移動停止',seal:'技封じ',stop:'行動停止'}[s.control])+' '+(s.controlDuration/1000).toFixed(2)+'秒','ボス制限 0秒','制限上限 2秒','制限耐性 2.5秒');
    a.push('MP '+Number(s.mp.toFixed(2)),'動作時間 '+(s.duration/1000).toFixed(2)+'秒');
    if(s.cooldown)a.push('再使用時間 '+(s.cooldown/1000).toFixed(1)+'秒');if(s.sharedWait)a.push('共通待ち 8秒');return a.join(' · ');
  }
  function begin(s,actor,target) {
    const len=distance(actor,target)||1;return {spec:s,origin:{x:actor.x,y:actor.y},target:{id:target.id,x:target.x,y:target.y},
      facing:target.x<actor.x?-1:1,direction:{x:(target.x-actor.x)/len,y:(target.y-actor.y)/len},elapsed:0,next:0,actionId:null};
  }
  function sample(c,elapsed) {
    const s=c.spec,t=clamp(elapsed,0,s.duration),raw=t*s.speed;
    let motion=s.motion,mt=raw/s.action*520,z=0,x=c.origin.x,y=c.origin.y;
    if(['clone','echo','prison','ultimate'].includes(s.pattern)) {
      const seal=s.pattern==='ultimate'?720:s.action-240;
      if(raw<seal){motion='seal';mt=raw/seal*719;}else {motion='cast-release';mt=(raw-seal)/240*519;}
    }else if(s.pattern==='fan'){
      if(raw<160){motion='jump';mt=raw;}else if(raw<760){motion='air-throw';mt=(raw-160)/600*519;}
      else {motion='jump';mt=520+(raw-760)/200*199;}z=raw<160||raw>760?0:Math.sin((raw-160)/600*Math.PI)*65;
    }else if(s.pattern==='cross'||s.pattern==='volley'){
      const segment=s.pattern==='cross'?(raw<300?raw/300:(raw-300)%250/250):raw%340/340;
      motion=segment<.3?'low-dash':s.pattern==='volley'&&raw>900?'air-throw':'throw-combo';mt=segment*519;
      if(s.pattern==='volley')z=Math.sin(clamp((raw-850)/650,0,1)*Math.PI)*38;
    }else if(motion==='throw-combo'){
      if(['burst','needles'].includes(s.pattern)){
        const last=s.events.findLastIndex(at=>at<=t+1e-6),base=last%2===1?300:0;
        if(last<0)mt=raw/180*179;
        else {const gap=(s.events[last+1]??s.duration)-s.events[last],q=clamp((t-s.events[last])/gap,0,1);mt=base+(last%2?120:180)+(q<.45?q/.45*59:60+(q-.45)/.55*(last%2?119:59));}
      }else mt=raw<280?raw/280*180:240+clamp((raw-280)/(s.action-280),0,1)*59;
    }
    return {x,y,z,facing:c.facing,motion:t>=s.duration?'idle':motion,motionTime:Math.max(0,mt),phase:motion,progress:t/s.duration};
  }
  function choose(actor,enemies,run) {
    const live=enemies.filter(e=>e.hp>0&&!e.invulnerable&&!e.bodyPart);if(!live.length)return null;
    let best=null;
    for(const s of actor.ninjaSkills||[]) {
      if(actor.mp<s.mp||(actor.ninjaCooldowns?.[s.id]||0)>0)continue;
      if(CLONE_IDS.includes(s.id)&&((run.ninjaClones||[]).some(c=>c.source===actor&&c.until>run.time&&(!actor.epicNinjaArmor||c.skillId===s.id))||!actor.epicNinjaArmor&&(actor.cloneReadyAt||0)>run.time))continue;
      if(s.pattern==='echo'&&actor.ninjaEcho?.until>run.time)continue;
      if(actor.rootAnchor&&['cross','volley','fan'].includes(s.pattern))continue;
      if((run.ninjaFields||[]).some(f=>f.source===actor&&f.spec.id===s.id&&f.until>run.time))continue;
      for(const target of live.filter(e=>distance(actor,e)<=s.reach)) {
        const group=live.filter(e=>distance(e,target)<=s.radius),controllable=group.filter(e=>!e.boss&&!e.majorBoss&&!(e.controlUntil>run.time)&&!(e.controlImmuneUntil>run.time));
        let value=s.power/(s.duration/1000+.6)+I.score(run,actor,s,target)/150;
        if(['flash','haze'].includes(s.pattern)){const blindable=group.filter(e=>!(e.ninjaBlindUntil>run.time)&&e.actionBlindable!==false);value+=blindable.length*2.5;if(!blindable.length&&s.pattern==='haze')continue;}
        if(s.pattern==='caltrop'){const ground=group.filter(e=>!e.flying);if(!ground.length)continue;value*=ground.length;value+=ground.filter(e=>!e.boss&&distance(e,run.hero)<270).length*2;}
        if(['thread','prison','orbit'].includes(s.pattern)){value*=Math.max(1,group.length);value+=controllable.length*1.8;}
        if(s.pattern==='tags')value*=Math.min(s.targetCount,group.length);
        if(s.pattern==='clone'){const enough=live.reduce((n,e)=>n+e.hp,0)>actor.damage*3;if(!enough)continue;value=s.cloneCount*s.clonePower*s.lifetime/Math.max(180,actor.interval)/2;
          if(s.substitute&&live.some(e=>e.targetId===actor.id&&e.actionBlindable&&['attacking','windup'].includes(e.state)))value+=12;}
        if(s.pattern==='echo'){const throws=(actor.ninjaSkills||[]).filter(n=>ECHO_IDS.includes(n.id)&&(actor.ninjaCooldowns?.[n.id]||0)<s.lifetime).length+Math.floor(s.lifetime/Math.max(180,actor.interval));if(throws<2)continue;value=s.echoCount*1.8;}
        if(s.pattern==='fan')value=s.power*Math.min(live.length*2,s.count)/s.count/(s.duration/1000+.6);
        if(s.pattern==='ultimate'&&live.reduce((n,e)=>n+e.hp,0)<actor.damage*10)continue;
        if(s.control&&s.pattern!=='prison')value+=(!target.boss&&!(target.controlImmuneUntil>run.time)&&!(target.controlUntil>run.time))?2:0;
        if(s.mp&&actor.mp-s.mp<10&&value<4)continue;
        value/=1+s.mp/60;
        if(value>0&&(!best||value>best.score))best={spec:s,target,score:value};
      }
    }return best;
  }
  return {ACTIVE,NODES,MOTIONS,CLONE_IDS,ECHO_IDS,spec:(...args)=>I.skill('ninja',spec(...args),args[3]||{}),parameters:s=>parameters(s)+I.parameters(s),begin,sample,choose,clamp,distance};
});
