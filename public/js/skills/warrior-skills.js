'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WarriorSkills = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  // Times and coordinates are shared by the game and the motion review page.
  // Ground coordinates use the 1024 x 576 arena; z is height above the feet.
  const I=typeof module==='object'&&module.exports?require('../combat/action-interference.js'):globalThis.ActionInterference;
  const rows = [
    ['renjin','連刃',1,'basic',1,1,180,0,0,420,''],
    ['moon','月輪薙ぎ',5,'arc',1,2.1,230,10,5500,700,''],
    ['fang','崩牙斬',10,'leap',1,3.8,100,15,7500,950,''],
    ['return','双閃返し',15,'return',2,1.65,150,16,8000,750,''],
    ['rings','双輪斬',20,'spin',2,1.7,250,18,8500,900,''],
    ['zflash','三折閃',25,'z',3,1.5,300,20,9500,900,''],
    ['pierce','穿陣斬',30,'line',2,2.2,560,22,10000,850,''],
    ['rise','昇牙連斬',35,'rise',3,1.9,140,24,11000,1300,''],
    ['running','旋嵐剣',40,'running',5,1.1,230,26,11500,1500,''],
    ['cross','十字断',45,'cross',2,3.3,350,28,12000,850,''],
    ['hundred','百刃乱舞',50,'flurry',10,.9,160,30,13500,1500,''],
    ['earth','裂地衝',55,'earth',1,7,760,32,14000,1000,''],
    ['six','残影六閃',60,'auto',6,1.8,540,34,14500,1300,''],
    ['sphere','剣嵐円舞',65,'sphere',8,1.6,340,36,15000,1600,''],
    ['crater','破城墜',70,'crater',1,13,320,38,16000,1600,''],
    ['eight','八荒連閃',75,'eight',8,2.1,580,40,16500,1700,''],
    ['divide','天地両断',80,'divide',1,18,950,44,18000,1400,''],
    ['invisible','無影千刃',85,'invisible',12,1.8,1000,46,19000,1800,''],
    ['tornado','戦鬼旋界',90,'tornado',15,1.6,460,48,21000,3000,''],
    ['worldcross','絶界十字断',95,'worldcross',3,9,1100,50,23000,1600,''],
    ['ultimate','覇道終式・天壊万断',100,'ultimate',12,2.5,1100,60,30000,3200,''],
  ];
  const ACTIVE = rows.map(([id,name,unlockLevel,pattern,hits,power,radius,mp,cooldown,duration,note],i) => ({id,name,unlockLevel,pattern,hits,power,radius,mp,cooldown,duration,note,icon:'assets/skills/warrior/icons/'+id+'.png',kind:id==='renjin'?'normal':'active',maxRank:5,cost:1,requires:[],effect:{},index:i}));
  const GENERAL = [
    ['edge','剣の心得',1,'greatsword',{damage:5},'攻撃力 +5 / Lv'],
    ['resolve','不屈の肉体',7,'leather',{maxHp:45,defense:1},'最大HP +45、防御 +1 / Lv'],
    ['flow','戦場の呼吸',12,'utility-gem',{mpRegen:.6},'MP回復 +0.6 / 秒 / Lv'],
    ['footwork','疾風の足運び',22,'evade',{speed:8,attackSpeed:.03},'移動速度 +8、攻撃速度 +3% / Lv'],
    ['precision','急所見切り',32,'counter',{crit:.025},'クリティカル率 +2.5% / Lv'],
    ['tempo','剣技の律動',42,'quickgem',{attackSpeed:.05},'攻撃速度 +5% / Lv'],
    ['reserve','深い呼吸',52,'utility-gem',{maxMp:16,mpRegen:.4},'最大MP +16、MP回復 +0.4 / 秒 / Lv'],
    ['fury','戦意解放',62,'battle-aura',{skillPower:.06},'スキル威力 +6% / Lv'],
    ['mastery','達人の間合い',72,'greatsword',{skillRange:10},'スキル範囲 +10 / Lv'],
    ['haste','極限集中',82,'clockgem',{haste:.05},'再使用速度 +5% / Lv'],
    ['execution','戦鬼の刃',92,'counter',{critMultiplier:.1},'クリティカル倍率 +0.1 / Lv'],
  ].map(([id,name,unlockLevel,art,effect,note])=>({id,name,unlockLevel,art,effect,note,kind:'passive',maxRank:5,cost:1,requires:[]}));
  const ENHANCEMENTS=ACTIVE.map(s=>({id:s.id+'-enhance',name:s.name+'・練磨',unlockLevel:Math.min(100,s.unlockLevel+2),icon:s.icon,kind:'enhancement',skillId:s.id,maxRank:5,cost:1,requires:[s.id],effect:{},note:'威力 +10% / Lv · 範囲 +4% / Lv · '+(s.kind==='normal'?'動作時間':'再使用時間')+' −3% / Lv'}));
  const NODES=[...ACTIVE,...ENHANCEMENTS,...GENERAL].sort((a,b)=>a.unlockLevel-b.unlockLevel||(['normal','active','enhancement','passive'].indexOf(a.kind)-['normal','active','enhancement','passive'].indexOf(b.kind))).map(n=>({...n,x:100+(n.unlockLevel-1)/5*180,y:n.kind==='active'||n.kind==='normal'?140:n.kind==='enhancement'?285:430}));
  function spec(id,rank=1,enhance=0,stats={}) {
    const s=ACTIVE.find(s=>s.id===id); if(!s) throw new RangeError('Unknown warrior skill: '+id);
    rank=Math.max(1,Math.min(5,rank)); enhance=Math.max(0,Math.min(5,enhance));
    const result={...s,rank,enhance,power:s.power*(id==='renjin'?1:1+(rank-1)*.18)*(1+enhance*.1)*(1+(id==='renjin'?0:stats.skillPower||0)),radius:(s.radius+(id==='moon'?(rank-1)*25:0))*(1+enhance*.04)+(id==='renjin'?0:stats.skillRange||0),angle:id==='moon'?Math.PI*(.55+(rank-1)*.1):Math.PI*2,targets:id==='renjin'?rank:Infinity,cooldown:s.cooldown*(1-enhance*.03)*(1+(stats.cooldownPenalty||0))/(1+(stats.haste||0)),duration:s.duration/(stats.attackSpeed||1)/(id==='renjin'?1+enhance*.03:1)};
    if(stats.epicWarriorWeapon){result.mp*=.5;result.duration*=.6;result.extraHits=2;}
    return result;
  }
  function parameters(s) {
    return '威力 ×'+s.power.toFixed(2)+' / Hit · '+(s.hits*(1+(s.extraHits||0)))+' Hit'+(s.kind==='normal'?' · 同時攻撃数 '+s.targets:'')+' · 範囲 '+Math.round(s.radius)+(s.pattern==='arc'?' · 角度 '+Math.round(s.angle*180/Math.PI)+'°':'')+' · MP '+Number(s.mp.toFixed(2))+' · 動作時間 '+(s.duration/1000).toFixed(2)+'秒'+(s.kind==='normal'?'':' · 再使用時間 '+(s.cooldown/1000).toFixed(1)+'秒');
  }
  const lerp=(a,b,t)=>a+(b-a)*t, clamp=t=>Math.max(0,Math.min(1,t));
  function hitTimes(s) {
    if(s.pattern==='basic')return [160/420];
    if(s.pattern==='ultimate')return [...Array.from({length:10},(_,i)=>.09+i*.046),.83,.95];
    if(s.pattern==='invisible')return Array.from({length:s.hits},(_,i)=>.6+i*.025);
    if(s.pattern==='worldcross')return [.3,.5,.8];
    if(['leap','crater','divide','earth'].includes(s.pattern))return [.72];
    return Array.from({length:s.hits},(_,i)=>.22+i*.6/Math.max(1,s.hits-1));
  }
  function begin(s,origin,target,enemies=[]) {return {spec:s,origin:{...origin},target:{...target},enemies:enemies.map(e=>({...e})),nextHit:0,elapsed:0};}
  function sample(c,time) {
    const s=c.spec,p=clamp(time/s.duration),o=c.origin,t=c.target,d=t.x>=o.x?1:-1;
    const strike=s.pattern==='basic'?160/420:.22;
    let x=o.x,y=o.y,z=0,motion='attack-far-to-near',motionTime=p<strike?p/strike*340:340+clamp((p-strike)/(1-strike))*340,hidden=false,invulnerable=false;
    const path=points=>{const u=clamp((p-.06)/.84)*(points.length-1),i=Math.min(points.length-2,Math.floor(u)),q=u-i; x=lerp(points[i].x,points[i+1].x,q);y=lerp(points[i].y,points[i+1].y,q);};
    if(['basic','leap','crater','earth','divide','ultimate'].includes(s.pattern))motion='attack-overhead';
    if(s.pattern==='return'){path([o,{x:t.x+d*100,y:t.y},o]);invulnerable=p>.1&&p<.82;}
    if(s.pattern==='z')path([o,{x:t.x-80*d,y:t.y-90},{x:t.x+100*d,y:t.y+65},{x:t.x+190*d,y:t.y-60}]);
    if(['line','running'].includes(s.pattern))path([o,{x:t.x+220*d,y:t.y}]);
    if(['spin','sphere'].includes(s.pattern)){x=lerp(o.x,t.x,clamp(p*5));y=lerp(o.y,t.y,clamp(p*5));}
    if(['leap','crater'].includes(s.pattern)){x=lerp(o.x,t.x-d*45,clamp(p*3));y=lerp(o.y,t.y,clamp(p*3));z=s.pattern==='leap'?Math.sin(p*Math.PI)*85:(p<.35?p/.35*200:p<.55?200:200*(1-clamp((p-.55)/.17)));motionTime=p<.55?p/.55*340:340+clamp((p-.55)/.17)*120;if(p<.25){motion='jump';motionTime=p/.25*600;}}
    if(s.pattern==='rise'){x=t.x-d*60;y=t.y;z=p>.2&&p<.75?Math.sin((p-.2)/.55*Math.PI)*110:0;motion=p<.42?'attack-near-to-far':'attack-overhead';}
    if(['auto','flurry','eight','tornado','ultimate'].includes(s.pattern)){
      const count=s.pattern==='eight'?8:s.pattern==='ultimate'?10:s.hits;
      const u=clamp((p-.06)/(s.pattern==='ultimate'?.49:.78))*count,i=Math.min(count-1,Math.floor(u)),q=u-i;
      const target=s.pattern==='auto'&&c.enemies.length?c.enemies[i%c.enemies.length]:t;
      let a,b;
      if(s.pattern==='eight'){const angle=i*Math.PI/4;a={x:t.x-Math.cos(angle)*190,y:t.y-Math.sin(angle)*75};b={x:t.x+Math.cos(angle)*190,y:t.y+Math.sin(angle)*75};}
      else {a={x:target.x+(i%2?-125:125),y:target.y+(i%3-1)*35};b={x:target.x+(i%2?125:-125),y:target.y-(i%3-1)*35};}
      x=lerp(a.x,b.x,q);y=lerp(a.y,b.y,q);invulnerable=['auto','eight','ultimate'].includes(s.pattern)&&p<.58;
      if(s.pattern==='eight'&&p>.84){x=lerp(x,o.x,clamp((p-.84)/.16));y=lerp(y,o.y,clamp((p-.84)/.16));}
      if(s.pattern==='ultimate'&&p>.55){x=t.x-d*55;y=t.y;z=p<.64?(p-.55)/.09*200:p<.74?200:200*(1-clamp((p-.74)/.09));motion='attack-overhead';motionTime=p<.74?180:340+clamp((p-.74)/.09)*200;if(p<.64){motion='jump';motionTime=(p-.55)/.09*600;}}
    }
    if(s.pattern==='invisible')hidden=p>.08&&p<.55;
    if(['spin','running','sphere','tornado'].includes(s.pattern)){motion= Math.floor(p*8)%2?'attack-near-to-far':'attack-far-to-near';motionTime=(p*8%1)*680;}
    return {x:Math.max(65,Math.min(959,x)),y:Math.max(334,Math.min(501,y)),z,motion,motionTime,hidden,invulnerable,facing: s.pattern==='return'&&p>.5?-d:d,progress:p};
  }
  function targets(c,actors,pose,hitIndex) {
    const s=c.spec,live=actors.filter(e=>e.hp>0),near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    if(['flurry','rise'].includes(s.pattern))return live.filter(e=>e.id===c.target.id);
    if(s.pattern==='auto')return live.length?[live[hitIndex%live.length]]:[];
    if(s.pattern==='worldcross' && hitIndex===2)return live.filter(e=>near(e,c.target)<150);
    if(['invisible','worldcross','ultimate'].includes(s.pattern))return live;
    if(['line','earth','divide'].includes(s.pattern))return live.filter(e=>{const dx=(e.x-c.origin.x)*(c.target.x>=c.origin.x?1:-1);return dx>=-45&&dx<=s.radius&&Math.abs(e.y-c.origin.y)<(s.pattern==='divide'?100:65);});
    const center=['leap','crater','eight'].includes(s.pattern)?c.target:pose;
    return live.filter(e=>near(e,center)<=s.radius && (s.pattern!=='arc'||Math.abs(Math.atan2(e.y-pose.y,(e.x-pose.x)*pose.facing))<=s.angle/2)).sort((a,b)=>near(a,center)-near(b,center)).slice(0,s.targets);
  }
  function choose(actor,actors,run=null) {
    const live=actors.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-actor.x,a.y-actor.y)-Math.hypot(b.x-actor.x,b.y-actor.y));
    let first=null,interruption=null;
    for(const s of [...(actor.warriorSkills||[])].reverse()) {
      if(actor.warriorCooldowns[s.id]>0||actor.mp<s.mp)continue;
      for(const target of live) {
        // Keep pursuit limits for moving skills, then use the actual first impact geometry.
        if(Math.hypot(target.x-actor.x,target.y-actor.y)>=s.radius+150)continue;
        const c=begin(s,actor,target,live),pose=sample(c,hitTimes(s)[0]*s.duration);
        const points=targets(c,live,pose,0);if(!points.length)continue;
        first||={spec:s,target};const score=run&&points.includes(target)?I.score(run,actor,s,target,hitTimes(s).map(t=>t*s.duration)):0;
        if(score>0&&(!interruption||score>interruption.score))interruption={spec:s,target,score};
      }
    }
    return interruption||first;
  }
  function phase(c,time){const p=time/c.spec.duration;return c.spec.pattern==='ultimate'?(p<.55?'十連斬り抜け':p<.64?'跳躍':p<.74?'溜め · 0.3秒':p<.9?'天壊の一撃':'斬撃痕・一斉炸裂'):p<.2?'予備動作':p<.82?'攻撃':'残心';}
  function effectKind(s,index){if(s.pattern==='ultimate')return index<10?'slash':index===10?'impact':'rupture';if(s.pattern==='worldcross')return index<2?'cross':'impact';if(['leap','crater'].includes(s.pattern))return 'impact';if(['earth','divide'].includes(s.pattern))return 'fissure';if(['spin','sphere','running','tornado'].includes(s.pattern))return 'ring';if(s.pattern==='cross')return 'cross';if(s.pattern==='invisible')return 'rupture';return 'slash';}
  return {ACTIVE,NODES,spec:(...args)=>I.skill('warrior',spec(...args),args[3]||{}),parameters:s=>parameters(s)+I.parameters(s),begin,sample,hitTimes,targets,choose,phase,effectKind};
});
