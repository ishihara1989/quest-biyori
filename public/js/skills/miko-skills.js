'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MikoSkills=api;})(globalThis,()=>{
  const I=typeof module==='object'&&module.exports?require('../combat/action-interference.js'):globalThis.ActionInterference;
  const rows=[
    ['purifying-bolt','御幣の祓い',1,'normal',0,0],
    ['ember-fox','火狐招来',5,'attack',12,16],['healing-butterflies','癒蝶招来',10,'heal',14,16],
    ['stone-tortoise','岩亀招来',15,'support',16,20],['thunder-crows','雷烏招来',20,'attack',18,18],
    ['swift-wolf','疾狼憑依',25,'possession',14,16],['white-deer','白鹿招来',30,'heal',22,24],
    ['bell-owl','鈴梟招来',35,'support',20,22],['blade-spirit','剣鬼憑依',40,'possession',20,18],
    ['guardian-bear','守熊憑依',45,'possession',22,20],['spirit-kagura','総霊神楽',50,'festival',36,35],
    ['flame-wheel','火車招来',55,'attack',26,24],['spring-carp','泉鯉招来',60,'heal',28,24],
    ['life-serpent','命蛇憑依',65,'possession',24,20],['golden-lion','金獅子招来',70,'attack',32,26],
    ['spirit-assault','霊軍進撃',75,'command',28,18],['prayer-cranes','祈鶴招来',80,'support',30,26],
    ['twin-possession','双霊憑依',85,'twin',38,30],['spirit-channel','霊脈開放',90,'channel',42,32],
    ['nine-tailed-fox','神狐・九尾招来',95,'attack',46,30],['myriad-spirit-festival','奥義・万霊神楽',100,'festival',64,50]
  ];
  const ACTIVE=rows.map(([id,name,unlockLevel,role,mp,cooldown],i)=>({id,name,unlockLevel,role,mp,cooldown:cooldown*1000,kind:i?'active':'normal',maxRank:i?5:1,cost:i?1:0,requires:[],effect:{},icon:i?'assets/skills/miko/icons/'+id+'.png':'assets/ui/ruins/icons/miko-gohei.png'}));
  const GENERAL=[
    ['ritual','巫女の心得',1,{damage:5},'攻撃力 +5 / Lv','purifying-bolt'],
    ['vestment','白衣の守り',7,{maxHp:35,defense:1},'最大HP +35 / Lv · 防御 +1 / Lv','stone-tortoise'],
    ['prayer','祈りの呼吸',12,{mpRegen:.7},'MP回復 +0.7 / 秒 / Lv','bell-owl'],
    ['rhythm','神楽の律動',22,{attackSpeed:.05},'攻撃速度 +5% / Lv','spirit-kagura'],
    ['grace','癒しの祈り',32,{healPower:.04},'回復量 +4% / Lv','white-deer'],
    ['reach','霊域の拡張',42,{skillRange:12},'範囲 +12 / Lv','spring-carp'],
    ['reserve','霊力の器',52,{maxMp:20,mpRegen:.4},'最大MP +20 / Lv · MP回復 +0.4 / 秒 / Lv','spirit-channel'],
    ['communion','万霊の共鳴',62,{skillPower:.06},'スキル威力 +6% / Lv','spirit-assault'],
    ['protection','守護の祈り',72,{barrierPower:.04},'バリア量 +4% / Lv','guardian-bear'],
    ['cycle','霊力の循環',82,{haste:.05},'再使用速度 +5% / Lv','twin-possession'],
    ['covenant','神霊の契り',92,{magicPower:.06},'魔法攻撃 +6% / Lv','myriad-spirit-festival'],
  ].map(([id,name,unlockLevel,effect,note,art])=>({id,name,unlockLevel,effect,note,icon:ACTIVE.find(s=>s.id===art).icon,kind:'passive',maxRank:5,cost:1,requires:[]}));
  const ENHANCEMENTS=ACTIVE.map(s=>{
    const notes=[];
    if(s.role==='heal'||s.id==='life-serpent')notes.push('回復量 +10% / Lv');
    else if(['stone-tortoise','guardian-bear','prayer-cranes'].includes(s.id))notes.push('バリア量 +10% / Lv');
    else if(s.role==='command')notes.push('命令倍率 +10% / Lv');
    else if(['normal','attack'].includes(s.role)||['blade-spirit','myriad-spirit-festival'].includes(s.id))notes.push('威力 +10% / Lv');
    notes.push('射程 +4% / Lv');
    if(['thunder-crows','flame-wheel','spring-carp','golden-lion','myriad-spirit-festival'].includes(s.id))notes.push('範囲 +4% / Lv');
    notes.push('動作時間 −3% / Lv');
    if(s.role!=='normal'&&s.role!=='command')notes.push('効果時間 +4% / Lv');
    return {id:s.id+'-enhance',name:s.name+'・霊式強化',unlockLevel:Math.min(100,s.unlockLevel+2),icon:s.icon,skillId:s.id,kind:'enhancement',maxRank:5,cost:1,requires:[s.id],effect:{},note:notes.join(' · ')};
  });
  const NODES=[...ACTIVE,...ENHANCEMENTS,...GENERAL].sort((a,b)=>a.unlockLevel-b.unlockLevel||['normal','active','enhancement','passive'].indexOf(a.kind)-['normal','active','enhancement','passive'].indexOf(b.kind)).map(n=>({...n,x:100+(n.unlockLevel-1)/5*180,y:['normal','active'].includes(n.kind)?140:n.kind==='enhancement'?285:430}));
  const MOTIONS=['backward','attack-wand','prayer','prayer-release','summon-forward','spirit-send','blessing-up','kagura-finish'];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function spec(id,rank=1,enhance=0,stats={}){
    const base=ACTIVE.find(s=>s.id===id);if(!base)throw new RangeError('Unknown miko skill: '+id);
    rank=clamp(Math.round(rank),1,base.maxRank);enhance=clamp(Math.round(enhance),0,5);const q=(rank-1)/4,lerp=(a,b)=>a+(b-a)*q,upgrade=1+enhance*.1,area=1+enhance*.04;
    const powerScale=(1+.18*(rank-1))*upgrade*(1+(base.kind==='active'?stats.skillPower||0:0));
    const m4=['spirit-kagura','spirit-channel','nine-tailed-fox','myriad-spirit-festival'].includes(id);
    const finisher=base.role==='normal'?'attack-wand':m4?'kagura-finish':['possession','command','twin'].includes(base.role)?'spirit-send':base.role==='heal'?'blessing-up':'summon-forward';
    const action=base.role==='normal'?540:id==='myriad-spirit-festival'?2720:m4?2000:finisher==='summon-forward'?1120:1160;
    const release=base.role==='normal'?180:id==='myriad-spirit-festival'?1980:m4?1260:finisher==='summon-forward'?820:830;
    const speed=Math.min(action/180,Math.max(.01,stats.attackSpeed||1)/(1-enhance*.03));
    const s={...base,rank,enhance,finisher,motion:finisher,action,rawRelease:release,speed,duration:action/speed,release:release/speed,
      events:[release/speed],cooldown:base.cooldown*(1+(stats.cooldownPenalty||0))/(1+(stats.haste||0)),
      lifetime:18000,count:1,power:0,reach:480,period:2000};
    Object.assign(s,{
      'purifying-bolt':{power:.75*upgrade,reach:400},'ember-fox':{count:3,power:.30*powerScale,reach:420,period:1400},
      'healing-butterflies':{count:2,heal:lerp(.4,.6),cap:.03,period:2000},
      'stone-tortoise':{lifetime:20000,barrier:lerp(.9,1.3),cap:.10,barrierLife:5000,period:4000},
      'thunder-crows':{count:2,power:.22*powerScale,chain:3,chainRange:120,period:2200},
      'swift-wolf':{lifetime:12000,attackSpeed:lerp(.12,.20)},
      'white-deer':{heal:lerp(.45,.65),cap:.03,openingHeal:lerp(1.3,1.9),openingCap:.08,targets:2,period:3000},
      'bell-owl':{lifetime:20000,spirit:lerp(.08,.12)},'blade-spirit':{lifetime:12000,power:.30*powerScale,period:800},
      'guardian-bear':{lifetime:12000,barrier:lerp(1.1,1.6),cap:.12,barrierLife:4000,period:3000},
      'spirit-kagura':{lifetime:lerp(6000,8000),spirit:lerp(.25,.40)},
      'flame-wheel':{lifetime:20000,power:.8*powerScale,period:3000,reach:520,width:70},
      'spring-carp':{count:2,lifetime:20000,heal:lerp(.45,.65),cap:.03,radius:100,targets:3,period:2500},
      'life-serpent':{lifetime:14000,heal:lerp(.55,.80),cap:.04,period:2000},
      'golden-lion':{lifetime:20000,power:1.2*powerScale,period:2000,reach:110,speedMove:220,radius:100},
      'spirit-assault':{commandPower:lerp(1.8,2.6),delay:800},'prayer-cranes':{count:2,lifetime:20000,barrier:lerp(.8,1.2),cap:.08,barrierLife:5000,period:4000},
      'twin-possession':{lifetime:lerp(10000,12000)},'spirit-channel':{lifetime:8000,intervalReduction:lerp(.15,.25),healBonus:lerp(.2,.3),extension:4000},
      'nine-tailed-fox':{lifetime:22000,power:2.1*powerScale,reach:560,period:2500,bolts:9,targets:3},
      'myriad-spirit-festival':{lifetime:lerp(8000,10000),spirit:lerp(.4,.55),finalPower:4*powerScale,radius:240}
    }[id]);
    s.reach=s.reach*area+(base.kind==='active'?stats.skillRange||0:0);
    if(s.radius)s.radius=s.radius*area+(stats.skillRange||0);
    if(s.width)s.width*=area;
    if(s.chainRange)s.chainRange=s.chainRange*area+(stats.chainRange||0);
    if(s.heal)s.heal*=upgrade*(1+(stats.healPower||0));
    if(s.openingHeal)s.openingHeal*=upgrade*(1+(stats.healPower||0));
    if(s.barrier)s.barrier*=upgrade*(1+(stats.barrierPower||0));
    if(s.commandPower)s.commandPower*=upgrade;
    if(s.role!=='normal'&&s.role!=='command')s.lifetime*=1+enhance*.04;
    if(stats.epicMikoWeapon&&s.role==='festival'){s.lifetime*=3;s.cooldown*=.5;s.spirit*=2;}
    if(stats.epicMikoArmor&&['attack','heal','support','possession','twin'].includes(s.role)){s.lifetime*=3;s.mp*=.3;}
    return s;
  }
  function sample(c,t){const s=c.spec,raw=t*s.speed;let motion=s.finisher,mt=raw;
    if(s.role!=='normal'){
      const prayer=s.id==='myriad-spirit-festival'?1440:720,rotation=['spirit-kagura','spirit-channel','nine-tailed-fox','myriad-spirit-festival'].includes(s.id)?800:0;
      if(raw<prayer){motion='prayer';mt=raw%720;}
      else if(raw<prayer+rotation){motion='prayer-release';mt=raw-prayer;}
      else {mt=Math.min(s.finisher==='summon-forward'?299:s.finisher==='kagura-finish'?299:329,raw-prayer-rotation);}
    }return {motion:t>=s.duration?'idle':motion,motionTime:mt,facing:c.facing};
  }
  function parameters(s){const a=['系統 魔法'];if(s.power)a.push('威力 ×'+s.power.toFixed(2));
    if(['attack','heal','support'].includes(s.role))a.push('契約 '+({attack:'攻撃',heal:'回復',support:'補助'}[s.role]),'召喚数 '+s.count);
    if(s.heal)a.push('回復 ×'+s.heal.toFixed(2),'回復上限 HP'+Math.round(s.cap*100)+'%');
    if(s.openingHeal)a.push('出現回復 ×'+s.openingHeal.toFixed(2),'出現回復上限 HP'+Math.round(s.openingCap*100)+'%');
    if(s.barrier)a.push('バリア ×'+s.barrier.toFixed(2),'バリア上限 HP'+Math.round(s.cap*100)+'%','バリア持続 '+Number((s.barrierLife/1000).toFixed(2))+'秒');
    if(s.spirit)a.push('霊威 +'+Math.round(s.spirit*100)+'%');if(s.attackSpeed)a.push('攻撃速度 +'+Math.round(s.attackSpeed*100)+'%');
    if(s.role==='possession')a.push('憑依数 1');if(s.role==='twin')a.push('憑依数 2','対象数 1');
    if(s.role==='festival')a.push('協撃倍率 60%','協撃数 1/人','協撃待機 0.2秒');
    if(s.commandPower)a.push('命令倍率 '+Math.round(s.commandPower*100)+'%','放出幅 0.8秒');
    if(s.intervalReduction)a.push('召喚攻撃間隔 −'+Math.round(s.intervalReduction*100)+'%','召喚回復 +'+Math.round(s.healBonus*100)+'%','寿命延長 4秒');
    if(s.finalPower)a.push('終撃威力 ×'+s.finalPower.toFixed(2));if(s.bolts)a.push('弾数 '+s.bolts);if(s.chain)a.push('連鎖数 '+s.chain,'連鎖距離 '+Math.round(s.chainRange));
    if(s.targets)a.push('対象数 '+s.targets);if(s.radius)a.push('半径 '+Math.round(s.radius));if(s.width)a.push('幅 '+Math.round(s.width));
    if(s.lifetime&&s.role!=='normal'&&s.role!=='command')a.push('効果時間 '+Number((s.lifetime/1000).toFixed(2))+'秒');
    if(s.period&&['attack','heal','support','possession'].includes(s.role)&&!['bell-owl','swift-wolf'].includes(s.id))a.push('周期 '+Number((s.period/1000).toFixed(2))+'秒');
    a.push('射程 '+Math.round(s.reach),'MP '+Number(s.mp.toFixed(2)),'動作時間 '+(s.duration/1000).toFixed(2)+'秒');if(s.cooldown)a.push('再使用時間 '+(s.cooldown/1000).toFixed(1)+'秒');return a.join(' · ');
  }
  return {ACTIVE,NODES,MOTIONS,spec:(...args)=>I.skill('miko',spec(...args),args[3]||{}),sample,parameters:s=>parameters(s)+I.parameters(s),clamp,distance};
});
