'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ShamanSkills=api;})(globalThis,()=>{
  // All combat clocks use milliseconds; damage coefficients are per body.
  const I=typeof module==='object'&&module.exports?require('../combat/action-interference.js'):globalThis.ActionInterference;
  const rows=[
    ['curse-bolt','呪弾',1,'attack-staff',1,360,0,0,540,180],
    ['curse-mark','呪印',5,'cast-forward',.6,460,8,6000,660,240+420*280/540],
    ['armor-hex','破甲の呪い',10,'cast-forward',0,480,10,12000,720,300+420*280/540],
    ['pain-hex','感応の呪い',15,'hex-weave',0,480,14,14000,720,480],
    ['frailty-hex','衰弱の呪い',20,'cast-forward',0,480,12,12000,780,300+480*280/540],
    ['erosion-field','呪蝕陣',25,'staff-plant',0,500,18,14000,900,540],
    ['grudge-flame','怨火',30,'cast-forward',0,500,20,16000,900,640],
    ['curse-chain','呪鎖',35,'hex-weave',.75,520,22,14000,840,480],
    ['curse-amplify','呪詛増幅',40,'hex-weave',0,520,20,16000,840,560],
    ['curse-burst','呪爆',45,'curse-pull',3.8,540,24,14000,900,600],
    ['curse-spread','呪疫伝播',50,'hex-weave',0,540,24,16000,900,560],
    ['grudge-ramp','怨念蓄積',55,'hex-weave',0,540,28,18000,1020,680],
    ['retaliation-hex','返し呪い',60,'hex-weave',0,540,28,18000,900,600],
    ['healing-seal','禁癒',65,'cast-forward',1.4,560,28,18000,840,580],
    ['hex-stakes','呪杭陣',70,'staff-plant',0,560,34,22000,1080,660],
    ['soul-pierce','魂砕き',75,'cast-forward',6,580,34,20000,1020,760],
    ['curse-resonance','呪詛共鳴',80,'hex-weave',0,580,38,24000,1080,720],
    ['life-erosion','命蝕',85,'cast-forward',0,600,42,26000,1140,880],
    ['soul-seal-field','反魂封陣',90,'staff-plant',0,620,48,30000,1260,780],
    ['grudge-collapse','呪終・怨結',95,'curse-pull',6,640,52,30000,1320,900],
    ['hundred-hex','大呪法・百鬼蝕魂',100,'ritual-raise',0,680,72,46000,1800,1200]
  ];
  const ACTIVE=rows.map(([id,name,unlockLevel,motion,power,reach,mp,cooldown,action,release],i)=>({id,name,unlockLevel,motion,power,reach,mp,cooldown,action,release,kind:i?'active':'normal',maxRank:i?5:1,cost:i?1:0,requires:[],effect:{},icon:'assets/skills/shaman/icons/'+id+'.png'}));
  const GENERAL=[
    ['ritual','呪術の心得',1,{damage:5},'攻撃力 +5 / Lv','curse-bolt'],
    ['vestment','呪装の守り',7,{maxHp:35,defense:1},'最大HP +35 / Lv · 防御 +1 / Lv','frailty-hex'],
    ['meditation','儀式の呼吸',12,{mpRegen:.7},'MP回復 +0.7 / 秒 / Lv','curse-mark'],
    ['weave','呪紋の律動',22,{attackSpeed:.05},'攻撃速度 +5% / Lv','curse-chain'],
    ['insight','呪眼',32,{crit:.025},'クリティカル率 +2.5% / Lv','soul-pierce'],
    ['reach','広域呪式',42,{skillRange:12},'範囲 +12 / Lv','erosion-field'],
    ['reserve','怨念の器',52,{maxMp:20,mpRegen:.4},'最大MP +20 / Lv · MP回復 +0.4 / 秒 / Lv','grudge-ramp'],
    ['resonance','呪力共鳴',62,{skillPower:.06},'スキル威力 +6% / Lv','curse-resonance'],
    ['conduit','呪鎖の導き',72,{chainRange:18},'連鎖距離 +18 / Lv','curse-chain'],
    ['cycle','呪力の循環',82,{haste:.05},'再使用速度 +5% / Lv','curse-amplify'],
    ['judgment','魂の見切り',92,{critMultiplier:.1},'クリティカル倍率 +0.1 / Lv','grudge-collapse'],
  ].map(([id,name,unlockLevel,effect,note,art])=>({id,name,unlockLevel,effect,note,icon:'assets/skills/shaman/icons/'+art+'.png',kind:'passive',maxRank:5,cost:1,requires:[]}));
  const ENHANCEMENTS=ACTIVE.map(s=>({id:s.id+'-enhance',name:s.name+'・呪式強化',unlockLevel:Math.min(100,s.unlockLevel+2),icon:s.icon,skillId:s.id,kind:'enhancement',maxRank:5,cost:1,requires:[s.id],effect:{},note:(['curse-amplify','curse-spread'].includes(s.id)?'':'威力 +10% / Lv · ')+'射程 +4% / Lv · 範囲 +4% / Lv · 動作時間 −3% / Lv'}));
  const NODES=[...ACTIVE,...ENHANCEMENTS,...GENERAL].sort((a,b)=>a.unlockLevel-b.unlockLevel||['normal','active','enhancement','passive'].indexOf(a.kind)-['normal','active','enhancement','passive'].indexOf(b.kind)).map(n=>({...n,x:100+(n.unlockLevel-1)/5*180,y:['normal','active'].includes(n.kind)?140:n.kind==='enhancement'?285:430}));
  const MOTIONS=['backward','attack-staff','chant','cast-forward','hex-weave','staff-plant','curse-pull','ritual-raise'];
  const FIELDS=['erosion-field','hex-stakes','soul-seal-field','hundred-hex'];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function spec(id,rank=1,enhance=0,stats={}){
    const base=ACTIVE.find(s=>s.id===id);if(!base)throw new RangeError('Unknown shaman skill: '+id);
    rank=clamp(Math.round(rank),1,base.maxRank);enhance=clamp(Math.round(enhance),0,5);const q=(rank-1)/4,lerp=(a,b)=>a+(b-a)*q,integer=(a,b)=>Math.floor(lerp(a,b)+.25),scale=Math.max(180/base.action,(1-enhance*.03)/Math.max(.01,stats.attackSpeed||1)),area=1+enhance*.04;
    const multiplier=(1+.18*(rank-1))*(1+enhance*.1)*(1+(base.kind==='active'?stats.skillPower||0:0));
    const s={...base,rank,enhance,speed:1/scale,duration:base.action*scale,release:base.release*scale,power:base.power*multiplier,markPower:.2*(1+enhance*.1)*(1+(stats.skillPower||0)),cooldown:base.cooldown*(1+(stats.cooldownPenalty||0))/(1+(stats.haste||0)),radius:0,targetCount:1,marks:0,lifetime:lerp(8000,10000),penetration:0,field:FIELDS.includes(id)};
    const group={radius:lerp(170,210),targetCount:integer(3,5)};
    Object.assign(s,{
      'curse-mark':{marks:integer(2,3)},'armor-hex':{defenseDown:lerp(.2,.3),marks:1},
      'pain-hex':{extra:.5*multiplier,trigger:'hit'},'frailty-hex':{attackDown:lerp(.16,.24),marks:1,radius:lerp(120,150),targetCount:integer(3,5)},
      'erosion-field':{radius:lerp(150,190),targetCount:integer(3,5),lifetime:8000,pulse:2000,pulses:4,pulsePower:.3*multiplier,marks:1},
      'grudge-flame':{deepPower:.32*multiplier,lifetime:8000,marks:2},
      'curse-chain':{marks:integer(2,3),chainRange:lerp(180,220)+(stats.chainRange||0),targetCount:integer(3,5)},
      'curse-amplify':{...group,amplify:lerp(.2,.3)},'curse-burst':{radius:lerp(140,180),targetCount:integer(3,5),consume:3,perMark:.35*multiplier},
      'curse-spread':{radius:lerp(220,280),targetCount:integer(3,5),copyMarks:2},
      'grudge-ramp':{deepPower:.35*multiplier,lifetime:10000,ramp:true},
      'retaliation-hex':{radius:lerp(180,220),targetCount:integer(3,5),extra:.8*multiplier,trigger:'hurt',lifetime:10000},
      'healing-seal':{...group,healingDown:lerp(.5,.75),marks:2,lifetime:10000},
      'hex-stakes':{radius:lerp(90,120),spacing:lerp(90,120),targetCount:integer(4,6),lifetime:10000,pulse:2000,pulses:5,pulsePower:.7*multiplier,marks:1},
      'soul-pierce':{penetration:.7,marks:5},'curse-resonance':{radius:lerp(230,280),targetCount:integer(3,5),extra:.7*multiplier,trigger:'hit',lifetime:10000},
      'life-erosion':{...group,deepPower:.6*multiplier,lifetime:12000,penetration:.8,marks:3},
      'soul-seal-field':{radius:lerp(280,330),targetCount:integer(6,8),lifetime:10000,pulse:2000,pulses:5,pulsePower:.95*multiplier,marks:1,healingDown:.5},
      'grudge-collapse':{radius:lerp(240,290),targetCount:integer(4,6),consume:5,perMark:1.4*multiplier},
      'hundred-hex':{radius:lerp(320,380),targetCount:integer(8,10),lifetime:8000,pulse:1000,pulses:8,pulsePower:.8*multiplier,finalPower:6*multiplier,marks:5,amplify:lerp(.25,.3)}
    }[id]||{});
    s.reach*=area;
    if(s.radius)s.radius=s.radius*area+(stats.skillRange||0);
    if(s.chainRange)s.chainRange=(s.chainRange-(stats.chainRange||0))*area+(stats.chainRange||0);
    if(s.spacing)s.spacing*=area;
    if(stats.epicShamanArmor){s.lifetime*=3;if(s.field)s.pulses*=3;}
    s.markLimit=stats.epicShamanWeapon?25:5;s.markLifetime=stats.epicShamanArmor?30:10;s.cursePeriod=stats.epicShamanWeapon?.5:1;s.deepLimit=stats.epicShamanWeapon?3:1;s.preserveMarks=!!stats.epicShamanWeapon;
    if(stats.epicShamanWeapon&&s.field){s.pulse*=.5;s.pulses*=2;}
    s.events=id==='curse-chain'?Array.from({length:s.targetCount},(_,i)=>s.release+60*i*scale):[s.release];return s;
  }
  function parameters(s){const a=['系統 魔法'];if(s.power)a.push('威力 ×'+s.power.toFixed(2));if(s.marks)a.push('呪印 '+s.marks+'個','呪印威力 ×'+s.markPower.toFixed(2)+'/脈動/個','呪印上限 '+s.markLimit+'個','呪印寿命 '+s.markLifetime+'秒','呪印脈動周期 '+s.cursePeriod+'秒','呪印防御貫通 60%');
    if(s.deepPower)a.push('深呪威力 ×'+s.deepPower.toFixed(2)+'/脈動','深呪脈動周期 '+s.cursePeriod+'秒','深呪上限 '+s.deepLimit+'種');if(s.ramp)a.push('脈動増幅 20%/段','最大倍率 2.00');
    for(const [k,label] of [['defenseDown','防御低下'],['attackDown','攻撃力低下'],['healingDown','回復量低下'],['amplify','呪いDoT増幅']])if(s[k])a.push(label+' '+Math.round(s[k]*100)+'%');if(s.attackDown)a.push('ボス上限 20%');
    if(s.extra)a.push('反応条件 '+(s.trigger==='hit'?'命中':'被害'),'追撃威力 ×'+s.extra.toFixed(2),'発生間隔 0.60秒','回数上限 10','共通上限 10回/10秒/本体','同動作上限 1回/本体','術者総上限 8回/秒');
    if(s.consume)a.push('呪印加算 ×'+s.perMark.toFixed(2)+'/個','消費呪印 '+(s.preserveMarks?'0個':s.consume===5?'全個':s.consume+'個'),(s.preserveMarks?'参照上限 ':'消費上限 ')+s.consume+'個');if(s.copyMarks)a.push('複写呪印 '+s.copyMarks+'個','失効時刻 継承');
    if(s.field)a.push('継続合計 ×'+(s.pulsePower*s.pulses).toFixed(2),'脈動数 '+s.pulses,'脈動周期 '+Number((s.pulse/1000).toFixed(2))+'秒','同時陣上限 1');if(s.spacing)a.push('杭数 3','杭間隔 '+Math.round(s.spacing));if(s.finalPower)a.push('終撃威力 ×'+s.finalPower.toFixed(2));
    if(s.deepPower||s.extra||s.field||s.penetration)a.push('防御貫通 '+Math.round((s.penetration||.6)*100)+'%');if(s.deepPower||s.extra||s.field||s.defenseDown||s.attackDown||s.amplify||s.healingDown)a.push('効果時間 '+Number((s.lifetime/1000).toFixed(2))+'秒');a.push('射程 '+Math.round(s.reach));if(s.radius)a.push('半径 '+Math.round(s.radius));if(s.chainRange)a.push('連鎖距離 '+Math.round(s.chainRange));if(s.targetCount>1)a.push('対象数 '+s.targetCount);a.push('MP '+Number(s.mp.toFixed(2)),'動作時間 '+(s.duration/1000).toFixed(2)+'秒');if(s.cooldown)a.push('再使用時間 '+(s.cooldown/1000).toFixed(1)+'秒');return a.join(' · ');
  }
  function sample(c,t){const s=c.spec,raw=clamp(t,0,s.duration)*s.speed;let motion=s.motion,mt=raw/s.action*({ 'attack-staff':540,'hex-weave':720,'staff-plant':900,'curse-pull':900,'ritual-raise':1800}[s.motion]||540);
    if(s.motion==='cast-forward'){const releasePart=['curse-mark','armor-hex'].includes(s.id)?420:s.id==='frailty-hex'?480:540,chant=s.action-releasePart; if(raw<chant){motion='chant';mt=raw/chant*719;}else mt=(raw-chant)/releasePart*540;}
    else if(['hex-weave','curse-pull'].includes(s.motion)){const release=s.release*s.speed;mt=raw<release?raw/release*480:480+(raw-release)/(s.action-release)*240; if(s.motion==='curse-pull')mt=mt/720*900;}
    else if(s.motion==='staff-plant'){const release=s.release*s.speed,recover=s.action-120;mt=raw<release?raw/release*540:raw<recover?540+(raw-release)/(recover-release)*240:780+(raw-recover)/120*120;}
    return {motion:t>=s.duration?'idle':motion,motionTime:mt,facing:c.facing};
  }
  return {ACTIVE,NODES,MOTIONS,FIELDS,spec:(...args)=>I.skill('shaman',spec(...args),args[3]||{}),parameters:s=>parameters(s)+I.parameters(s),sample,clamp,distance};
});
