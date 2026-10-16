'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MageSkills = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  // Arena ground coordinates: 1024 × 576. Times are milliseconds.
  const I=typeof module==='object'&&module.exports?require('../combat/action-interference.js'):globalThis.ActionInterference;
  const rows = [
    ['bolt','魔力弾',1,'無','forward','bolt',1,1,440,0,0,80,240],
    ['wind','風刃波',5,'風','forward','fan',1,2.4,430,12,5000,340,320],
    ['fireball','爆炎弾',10,'火','forward','fireball',1,4,160,18,7000,600,420],
    ['ice','氷晶槍',15,'氷','forward','pierce',1,3.7,670,14,5500,280,180],
    ['thunder','天雷',20,'雷','up','lightning',1,5.5,65,20,7500,650,240],
    ['frost','氷輪陣',25,'氷','up','frost-ring',3,1.6,215,23,8500,750,650],
    ['torrent','紅蓮奔流',30,'火','forward','flame',5,1.3,700,28,10500,850,1100],
    ['vortex','風牢渦',35,'風','up','vortex',5,1.05,265,26,10500,800,1300],
    ['chain','紫電連鎖',40,'雷','forward','chain',4,3.4,210,27,10000,550,550],
    ['rain','氷晶雨',45,'氷','up','rain',7,1.15,340,30,12000,1050,1500],
    ['pillars','炎柱連爆',50,'火','up','pillars',5,2.5,300,34,13500,1100,1100],
    ['earth','地裂岩槍',55,'土','forward','earth',5,2,830,32,12500,950,1000],
    ['storm','雷霆轟雨',60,'雷','up','storm',9,1.5,440,38,15000,1400,1800],
    ['crystal','氷獄結晶',65,'氷','up','crystal',4,2.8,420,40,15500,1550,1400],
    ['meteor','隕星墜',70,'火・土','up','meteor',1,13,460,42,17000,1900,950],
    ['tempest','天嵐破',75,'風','forward','tempest',4,3,1050,40,16000,1550,1200],
    ['beam','灼界魔砲',80,'火','forward','beam',12,1.65,1100,46,19000,1800,2200],
    ['avalanche','氷天崩落',85,'氷','up','avalanche',8,2.1,650,48,21000,2100,1900],
    ['prison','九天雷獄',90,'雷','up','prison',18,1.15,1100,55,24000,2600,2100],
    ['four','四象崩界',95,'複合','forward','four',10,2.2,1100,58,26000,2800,2000],
    ['cosmos','原初天象・星界崩壊',100,'複合','up','cosmos',1,30,1100,70,32000,3600,1600],
  ];
  const ACTIVE = rows.map(([id,name,unlockLevel,element,cast,pattern,hits,power,radius,mp,cooldown,chant,hold],index) => ({id,name,unlockLevel,element,cast,pattern,hits,power,radius,mp,cooldown,chant,hold,index,kind:index?'active':'normal',maxRank:5,cost:1,requires:[],effect:{},icon:'assets/skills/mage/icons/'+id+'.png'}));
  const GENERAL = [
    ['arcane','魔術の心得',1,'staff',{damagePercent:.05},'攻撃力 +5% / Lv'],
    ['ward','魔力の衣',7,'ward',{maxHpPercent:.05,defensePercent:.05},'最大HP +5% / Lv · 防御 +5% / Lv'],
    ['meditate','静かな詠唱',12,'utility-gem',{mpRegenPercent:.10},'MP回復 +10% / Lv'],
    ['focus','詠唱集中',22,'clockgem',{castSpeed:.05},'詠唱速度 +5% / Lv'],
    ['precision','魔眼',32,'arcanegem',{crit:.025},'クリティカル率 +2.5% / Lv'],
    ['reach','広域術式',42,'vortex',{skillRange:12},'範囲 +12 / Lv'],
    ['reserve','深淵の魔力',52,'utility-gem',{maxMpPercent:.05,mpRegenPercent:.05},'最大MP +5% / Lv · MP回復 +5% / Lv'],
    ['resonance','元素共鳴',62,'battle-aura',{skillPower:.06},'スキル威力 +6% / Lv'],
    ['conduit','連鎖導体',72,'wind-blade',{chainRange:18},'連鎖距離 +18 / Lv'],
    ['haste','術式循環',82,'clockgem',{haste:.05},'再使用速度 +5% / Lv'],
    ['origin','原初の叡智',92,'prism',{critMultiplier:.1},'クリティカル倍率 +0.1 / Lv'],
  ].map(([id,name,unlockLevel,art,effect,note])=>({id,name,unlockLevel,art,effect,note,kind:'passive',maxRank:5,cost:1,requires:[]}));
  const ENHANCEMENTS = ACTIVE.map(s=>({id:s.id+'-enhance',name:s.name+'・術式強化',unlockLevel:Math.min(100,s.unlockLevel+2),icon:s.icon,kind:'enhancement',skillId:s.id,maxRank:5,cost:1,requires:[s.id],effect:{},note:'威力 +10% / Lv · 範囲 +4% / Lv · 詠唱時間 −3% / Lv'}));
  const NODES = [...ACTIVE,...ENHANCEMENTS,...GENERAL].sort((a,b)=>a.unlockLevel-b.unlockLevel||['normal','active','enhancement','passive'].indexOf(a.kind)-['normal','active','enhancement','passive'].indexOf(b.kind)).map(n=>({...n,x:100+(n.unlockLevel-1)/5*180,y:n.kind==='normal'||n.kind==='active'?140:n.kind==='enhancement'?285:430}));
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const distance = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function spec(id,rank=1,enhance=0,stats={}) {
    const s=ACTIVE.find(s=>s.id===id); if(!s)throw new RangeError('Unknown mage skill: '+id);
    rank=clamp(rank,1,5);enhance=clamp(enhance,0,5);
    const speed=Math.max(.1,stats.attackSpeed||1),castSpeed=1+(stats.castSpeed||0);
    const chant=s.chant*(1-enhance*.03)/castSpeed/speed,extend=(id==='bolt'?200:400)/speed;
    const hold=s.hold/speed,recover=300/speed;
    const result={...s,rank,enhance,power:s.power*(1+(rank-1)*.18)*(1+enhance*.1)*(1+(id==='bolt'?0:stats.skillPower||0)),
      radius:(s.radius+(id==='wind'?(rank-1)*35:0))*(1+enhance*.04)+(id==='bolt'?0:stats.skillRange||0),
      reach:(id==='bolt'?s.radius:Math.max(850,s.radius))+(id==='wind'?(rank-1)*35:0),
      width:['beam','flame','four'].includes(s.pattern)?110+(rank-1)*12:75,
      angle:(55+(rank-1)*10)*Math.PI/180,chainRange:210+(rank-1)*20+(stats.chainRange||0),
      targets:s.pattern==='chain'?4+Math.floor((rank-1)/2):s.pattern==='lightning'||s.pattern==='bolt'?1:Infinity,
      hits:s.pattern==='chain'?4+Math.floor((rank-1)/2):s.hits,
      focusMultiplier:s.pattern==='pierce'?1.8:s.pattern==='beam'?1.35:1,
      finalMultiplier:s.pattern==='prison'?5:s.pattern==='crystal'?2.5:1,
      cooldown:s.cooldown*(1+(stats.cooldownPenalty||0))/(1+(stats.haste||0)),chant,extend,release:chant+extend,hold,recover,duration:chant+extend+hold+recover};
    if(stats.epicMageWeapon&&s.kind==='active'){result.mp*=.5;result.radius*=1.5;result.width*=1.5;result.extraCasts=2;}
    return result;
  }
  function parameters(s) {
    return '属性 '+s.element+' · 威力 ×'+s.power.toFixed(2)+' / Hit · '+s.hits+' Hit · '+(s.pattern==='chain'?'連鎖距離 '+Math.round(s.chainRange):'範囲 '+Math.round(s.radius))+(s.pattern==='fan'?' · 角度 '+Math.round(s.angle*180/Math.PI)+'°':'')+' · 射程 '+Math.round(['fan','pierce','beam','flame','four','tempest','earth'].includes(s.pattern)?s.radius:s.reach)+(['pierce','beam','flame','four','tempest','earth'].includes(s.pattern)?' · 幅 '+Math.round(s.width*(s.pattern==='tempest'?4:1)):'')+(s.finalMultiplier>1?' · 終撃威力 ×'+(s.power*s.finalMultiplier).toFixed(2):'')+(s.focusMultiplier>1?' · 単体威力 ×'+(s.power*s.focusMultiplier).toFixed(2):'')+(s.extraCasts?' · 追加発動 '+s.extraCasts:'')+' · MP '+Number(s.mp.toFixed(2))+' · 詠唱時間 '+(s.chant/1000).toFixed(2)+'秒 · 持続時間 '+(s.hold/1000).toFixed(2)+'秒'+(s.kind==='active'?' · 再使用時間 '+(s.cooldown/1000).toFixed(1)+'秒':'');
  }
  function hitTimes(s) {
    const first=['meteor','cosmos'].includes(s.pattern)? .84 : ['bolt','fireball','fan','pierce','tempest'].includes(s.pattern)? .6 : .12;
    return Array.from({length:s.hits},(_,i)=>(s.release+s.hold*(s.hits===1?first:first+i*(.93-first)/(s.hits-1)))/s.duration);
  }
  function begin(s,origin,target,enemies=[]) {
    const dx=target.x-origin.x,dy=target.y-origin.y,len=Math.hypot(dx,dy)||1;
    return {spec:s,origin:{x:origin.x,y:origin.y},target:{id:target.id,x:target.x,y:target.y},direction:{x:dx/len,y:dy/len},facing:dx>=0?1:-1,enemies:enemies.map(e=>({id:e.id,x:e.x,y:e.y})),elapsed:0,nextHit:0,chainIds:[],lastChain:null,released:false};
  }
  function sample(c,time) {
    const s=c.spec,t=clamp(time,0,s.duration),motion=s.cast==='up'?'cast-up':'cast-forward';
    let name='chant',ms=t,phase='詠唱';
    if(t>=s.duration){name='idle';ms=0;phase='待機';}
    else if(t>=s.release+s.hold){name=motion;ms=399*(1-(t-s.release-s.hold)/s.recover);phase='復帰';}
    else if(t>=s.release){name=motion+'-hold';ms=t-s.release;phase='発動';}
    else if(t>=s.chant){name=motion;ms=(t-s.chant)/s.extend*400;phase='杖を'+(s.cast==='up'?'上へ':'前へ');}
    else ms=s.chant>640?t%640:t/s.chant*640;
    return {x:c.origin.x,y:c.origin.y,z:0,facing:c.facing,motion:name,motionTime:ms,phase,progress:t/s.duration};
  }
  function targets(c,actors,index=0) {
    const s=c.spec,live=actors.filter(e=>e.hp>0),p=s.pattern;
    if(p==='chain') {
      const from=c.lastChain||c.target;
      return live.filter(e=>!c.chainIds.includes(e.id)&&(index===0?e.id===c.target.id:distance(e,from)<=s.chainRange)).sort((a,b)=>distance(a,from)-distance(b,from)).slice(0,1);
    }
    if(['bolt','lightning'].includes(p))return live.filter(e=>e.id===c.target.id);
    if(['prison','cosmos'].includes(p))return live;
    if(['fan','pierce','flame','beam','four','earth','tempest'].includes(p))return live.filter(e=>{
      const dx=e.x-c.origin.x,dy=e.y-c.origin.y,along=dx*c.direction.x+dy*c.direction.y,across=Math.abs(dx*c.direction.y-dy*c.direction.x);
      return along>=0&&along<=s.radius&&(p==='fan'?Math.abs(Math.atan2(across,along))<=s.angle/2:across<=s.width/2*(p==='tempest'?4:1));
    });
    const center=p==='pillars'?pillar(c,index):c.target;
    return live.filter(e=>distance(e,center)<= (p==='pillars'?s.radius*.55:s.radius));
  }
  function pillar(c,index) {return c.enemies.length?c.enemies[index%c.enemies.length]:c.target;}
  function choose(actor,actors,run=null) {
    const live=actors.filter(e=>e.hp>0);let best=null;
    for(const s of actor.mageSkills||[]) {
      if(actor.mageCooldowns[s.id]>0||actor.mp<s.mp)continue;
      for(const target of live) {
        if(distance(actor,target)>s.reach)continue;
        const c=begin(s,actor,target,live);let count;
        if(s.pattern==='chain') {
          count=0;for(let i=0;i<s.hits;i++){const next=targets(c,live,i)[0];if(!next)break;count++;c.chainIds.push(next.id);c.lastChain=next;}
        }else count=targets(c,live).length*(s.hits+s.finalMultiplier-1);
        // Area spells earn their long cast only with enough enemies. No level priority.
        const score=s.power*count/s.duration*(live.length===1?s.focusMultiplier:1)+(run?I.score(run,actor,s,target,hitTimes(s).map(t=>t*s.duration))/100000:0);
        if(count&&(!best||score>best.score))best={spec:s,target,score};
      }
    }
    return best;
  }
  function effectKind(s) {
    if(['bolt'].includes(s.pattern))return 'arcane';
    if(['fan','vortex','tempest'].includes(s.pattern))return 'wind';
    if(['pierce','frost-ring','rain','crystal','avalanche'].includes(s.pattern))return 'ice';
    if(['lightning','chain','storm','prison'].includes(s.pattern))return 'lightning';
    if(s.pattern==='earth')return 'earth';
    if(s.pattern==='meteor')return 'meteor';
    if(s.pattern==='cosmos')return 'cosmos';
    if(s.pattern==='four')return 'four';
    return 'fire';
  }
  return {ACTIVE,NODES,spec:(...args)=>I.skill('mage',spec(...args),args[3]||{}),parameters:s=>parameters(s)+I.parameters(s),hitTimes,begin,sample,targets,pillar,choose,effectKind};
});
