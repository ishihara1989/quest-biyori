'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaladinSkills=api;})(typeof globalThis==='object'?globalThis:this,()=>{
 // Arena ground coordinates (1024 x 576); durations in milliseconds.
 const I=typeof module==='object'&&module.exports?require('../combat/action-interference.js'):globalThis.ActionInterference;
 const rows=[
  ['mace','メイスアタック',1,'物理','attack-mace','single',1,1,180,0,0,0],
  ['purify','ピュリフィケーション',5,'神聖','shield-raise','cleanse',1,0,320,12,5500,280],
  ['hammer','ホーリーハンマー',10,'神聖','mace-slam','circle',1,3.6,95,16,6500,0],
  ['wave','セイクリッドウェーブ',15,'神聖','shield-advance','fan',1,2.5,420,18,7500,500],
  ['aegis','イージスガード',20,'神聖','shield-raise','guard',1,0,1100,24,10000,350],
  ['charge','シールドチャージ',25,'物理','shield-advance','charge',2,1.8,360,22,8500,900],
  ['spear','断行槌',30,'神聖','break-strike','single',1,3,220,20,8000,0],
  ['provoke','プロヴォケーション',35,'神聖','attack-mace','taunt',1,0,460,16,10000,400],
  ['bash','グランドバッシュ',40,'物理','shield-plant','fan',1,4.8,430,26,11000,500],
  ['sanctuary','サンクチュアリ',45,'神聖','shield-plant','sanctuary',1,0,370,28,14000,500],
  ['judgment','ジャッジメントハンマー',50,'神聖','mace-slam','circle',1,9,430,32,14500,550],
  ['reflect','リフレクトシールド',55,'神聖','shield-raise','reflect',1,0,1100,28,14000,350],
  ['pillar','セイクリッドピラー',60,'神聖','mace-raise','circle',4,1.8,440,34,15000,1200],
  ['wall','ヘブンズウォール',65,'神聖','shield-advance','line',4,2.1,760,36,16000,1300],
  ['fortress','ディバインフォートレス',70,'神聖','mace-slam','fortress',1,0,440,38,18500,650],
  ['crusade','グランドクルセイド',75,'神聖','shield-advance','charge',5,2.4,780,42,19000,1700],
  ['ray','セラフィックレイ',80,'神聖','mace-raise','circle',7,1.9,680,46,21000,1600],
  ['bastion','ラストバスティオン',85,'神聖','shield-plant','bastion',1,0,1100,46,25000,650],
  ['heavens','ヘブンズジャッジメント',90,'神聖','mace-raise','all',10,1.5,1100,50,26000,2000],
  ['revenge','ディバインリベンジ',95,'神聖','shield-raise','revenge',1,7,920,48,25000,1900],
  ['ultimate','神聖終式・天護神罰',100,'神聖','mace-slam','all',1,24,1100,65,32000,1200],
 ];
 const ACTIVE=rows.map(([id,name,unlockLevel,element,motion,pattern,hits,power,radius,mp,cooldown,hold],index)=>({id,name,unlockLevel,element,motion,pattern,hits,power,radius,mp,cooldown,hold,index,kind:index?'active':'normal',maxRank:5,cost:1,requires:[],effect:{},icon:'assets/skills/paladin/icons/'+(id==='spear'?'break-strike':id)+'.png'}));
 const GENERAL=[
  ['faith','聖騎士の心得',1,{damagePercent:.05},'攻撃力 +5% / Lv','mace'],
  ['plate','重装の守り',7,{maxHpPercent:.06,defensePercent:.08},'最大HP +6% / Lv · 防御 +8% / Lv','aegis'],
  ['prayer','祈りの呼吸',12,{mpRegenPercent:.10},'MP回復 +10% / Lv','purify'],
  ['march','重装の歩法',22,{speed:5},'移動速度 +5 / Lv','charge'],
  ['resolve','不屈の精神',32,{maxHpPercent:.06},'最大HP +6% / Lv','bastion'],
  ['reach','聖域の拡張',42,{skillRange:12},'範囲 +12 / Lv','sanctuary'],
  ['reserve','聖力の器',52,{maxMpPercent:.05,mpRegenPercent:.05},'最大MP +5% / Lv · MP回復 +5% / Lv','pillar'],
  ['radiance','神聖の共鳴',62,{skillPower:.06},'スキル威力 +6% / Lv','ray'],
  ['guardian','守護の誓い',72,{guardPower:.02},'ダメージ軽減 +2% / Lv','fortress'],
  ['cycle','祈りの循環',82,{haste:.05},'再使用速度 +5% / Lv','reflect'],
  ['verdict','神罰の意志',92,{critMultiplier:.1},'クリティカル倍率 +0.1 / Lv','ultimate'],
 ].map(([id,name,unlockLevel,effect,note,art])=>({id,name,unlockLevel,effect,note,icon:'assets/skills/paladin/icons/'+art+'.png',kind:'passive',maxRank:5,cost:1,requires:[]}));
 const ENHANCEMENTS=ACTIVE.map(s=>({id:s.id+'-enhance',name:s.name+'・聖装強化',unlockLevel:Math.min(100,s.unlockLevel+2),icon:s.icon,skillId:s.id,kind:'enhancement',maxRank:5,cost:1,requires:[s.id],effect:{},note:'威力 +10% / Lv · 範囲 +4% / Lv · 動作時間 −3% / Lv · 効果時間 +4% / Lv'}));
 const NODES=[...ACTIVE,...ENHANCEMENTS,...GENERAL].sort((a,b)=>a.unlockLevel-b.unlockLevel||['normal','active','enhancement','passive'].indexOf(a.kind)-['normal','active','enhancement','passive'].indexOf(b.kind)).map(n=>({...n,x:100+(n.unlockLevel-1)/5*180,y:['normal','active'].includes(n.kind)?140:n.kind==='enhancement'?285:430}));
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const SUPPORT=['cleanse','guard','sanctuary','reflect','fortress','bastion','taunt'];
 function spec(id,rank=1,enhance=0,stats={}){
  const base=ACTIVE.find(s=>s.id===id);if(!base)throw new RangeError('Unknown paladin skill: '+id);rank=clamp(rank,1,5);enhance=clamp(enhance,0,5);
  const speed=(stats.attackSpeed||1)/(1-enhance*.03),scale=1+(rank-1)*.18,timeScale=1+(rank-1)*.06+enhance*.04;
  const s={...base,rank,enhance,power:base.power*scale*(1+enhance*.1)*(1+(id==='mace'?0:stats.skillPower||0)),radius:base.radius*(1+enhance*.04)+(id==='mace'?0:stats.skillRange||0),
   windup:520/speed,hold:base.hold/speed,recover:260/speed,action:520/speed,speed,
   angle:(70+(rank-1)*5)*Math.PI/180,width:(id==='crusade'?300:id==='wall'?210:85)+(rank-1)*8,
   cooldown:base.cooldown*(1+(stats.cooldownPenalty||0))/(1+(stats.haste||0)),
   push:['wave','charge','wall','crusade'].includes(id)?(id==='charge'?110:id==='wall'?180:140)+(rank-1)*12:0,
   stun:id==='charge'?850*timeScale:0,air:id==='bash'?1000*timeScale:0,bind:['pillar','heavens'].includes(id)?1400*timeScale:0,
   reduction:['aegis','reflect','fortress','bastion','revenge','ultimate'].includes(id)?clamp(({aegis:.65,reflect:.35,fortress:.3,bastion:.8,revenge:.65,ultimate:.7}[id]||0)+(stats.guardPower||0),0,.9):0,
   effectDuration:({aegis:1800,reflect:4500,fortress:7000,bastion:2800,sanctuary:6500,provoke:4000,ultimate:3500}[id]||0)*timeScale,
   heal:id==='sanctuary'?.03*scale:0,reflection:id==='reflect'?.3+(rank-1)*.025:0,
   finalMultiplier:['ray','heavens','crusade'].includes(id)?3:1,support:SUPPORT.includes(base.pattern),
  };
  if(stats.epicPaladinArmor){s.effectDuration*=3;if(s.support)s.radius=2000;}
  if(stats.epicPaladinWeapon)s.reflection*=4;
  s.reach=['single','circle'].includes(s.pattern)&&id!=='mace'?Math.max(520,s.radius):s.radius;
  s.travel=s.pattern==='charge'?Math.min(id==='crusade'?370:240,s.radius*.7):0;
  if(id==='spear'){s.windup=150/speed;s.hold=0;s.release=240/speed;s.duration=660/speed;s.action=340/speed;s.reach=s.radius;}
  else if(id==='mace'){s.windup=0;s.hold=0;s.release=180/speed;s.duration=s.action;}
  else if(base.motion==='mace-slam'){s.windup=(id==='ultimate'?1040:520)/speed;s.release=s.windup+s.hold+240/speed;s.duration=s.windup+s.hold+s.action+s.recover;}
  else if(id==='revenge'){s.release=s.windup+s.hold+180/speed;s.duration=s.windup+s.hold+s.action+s.recover;}
  else {s.release=(s.motion==='attack-mace'?180:s.support?320:520)/speed;s.duration=s.windup+Math.max(s.hold,200/speed)+s.recover;}
  if(s.pattern==='charge')s.release=s.windup+s.hold*.4;
  return s;
 }
 function parameters(s){const parts=['属性 '+s.element];if(s.power)parts.push('威力 ×'+s.power.toFixed(2)+' / Hit',s.hits+' Hit');parts.push('範囲 '+Math.round(s.radius));if(s.pattern==='fan')parts.push('角度 '+Math.round(s.angle*180/Math.PI)+'°');if(['line','charge'].includes(s.pattern))parts.push('幅 '+Math.round(s.width));if(s.travel)parts.push('移動距離 '+Math.round(s.travel));if(s.push)parts.push('押出距離 '+Math.round(s.push));if(s.stun)parts.push('スタン '+(s.stun/1000).toFixed(2)+'秒');if(s.air)parts.push('打上時間 '+(s.air/1000).toFixed(2)+'秒');if(s.bind)parts.push('拘束 '+(s.bind/1000).toFixed(2)+'秒');if(s.id==='purify')parts.push('状態異常解除 毒・出血・拘束・冷気・凍結・暗闇・火傷・破甲');if(s.reduction)parts.push('ダメージ軽減 '+Math.round(s.reduction*100)+'%');if(s.heal)parts.push('HP回復 '+(s.heal*100).toFixed(1)+'% / 秒','状態異常耐性 100%');if(s.reflection)parts.push('反撃 '+Math.round(s.reflection*100)+'%');if(s.id==='bastion')parts.push('致死耐性 1回 / 人');if(s.id==='revenge')parts.push('蓄積威力 ×0.6','蓄積上限 '+Math.round(s.power*2)+'×');if(s.id==='provoke')parts.push('挑発 '+(s.effectDuration/1000).toFixed(2)+'秒');if(s.finalMultiplier>1)parts.push('終撃威力 ×'+(s.power*s.finalMultiplier).toFixed(2));if(s.effectDuration)parts.push('効果時間 '+(s.effectDuration/1000).toFixed(2)+'秒');parts.push('MP '+Number(s.mp.toFixed(2)),'動作時間 '+(s.duration/1000).toFixed(2)+'秒');if(s.kind==='active')parts.push('再使用時間 '+(s.cooldown/1000).toFixed(1)+'秒');return parts.join(' · ');}
 function hitTimes(s){const end=s.windup+s.hold;return Array.from({length:s.hits},(_,i)=>(s.hits===1?s.release:s.release+Math.max(0,end-s.release)*i/(s.hits-1))/s.duration);}
 function begin(s,origin,target){const dx=target.x-origin.x,dy=target.y-origin.y,len=Math.hypot(dx,dy)||1;return {spec:s,origin:{x:origin.x,y:origin.y},target:{id:target.id,x:target.x,y:target.y},direction:{x:dx/len,y:dy/len},facing:dx<0?-1:1,elapsed:0,nextHit:0,pushed:[],absorbed:0,guardStarted:false};}
 function sample(c,time){const s=c.spec,t=clamp(time,0,s.duration);let motion=s.motion,ms=0,phase='構え';
  if(t>=s.duration)return {x:c.origin.x+c.direction.x*s.travel,y:c.origin.y+c.direction.y*s.travel,facing:c.facing,motion:'idle',motionTime:0,phase:'待機',progress:1};
  if(s.id==='mace'){ms=t*s.speed;phase=t<s.release?'振りかぶる':'横打ち';}
  else if(s.id==='spear'){ms=t*s.speed;phase=t<s.release?'振り出し':'命中・戻し';}
  else if(s.motion==='mace-slam'){
   const start=s.windup+s.hold;
   if(s.id==='ultimate'&&t<520/s.speed){motion='shield-raise';ms=t*s.speed;phase='天護';}
   else if(t<s.windup){motion='mace-raise';ms=(t-(s.id==='ultimate'?520/s.speed:0))*s.speed;phase='振り上げ';}
   else if(t<start){motion='mace-raise';ms=519;phase='聖槌形成';}
   else if(t<start+s.action){motion='mace-slam';ms=(t-start)*s.speed;phase=t<s.release?'振り下ろし':s.support?'結界':'神罰';}
   else {motion='mace-slam';ms=519*(1-(t-start-s.action)/s.recover);phase='復帰';}
  }else if(s.id==='revenge'){
   if(t<s.windup+s.hold){motion='shield-raise';ms=Math.min(519,t*s.speed);phase=t<s.windup?'構え':'蓄積';}
   else {motion='attack-mace';ms=Math.min(519,(t-s.windup-s.hold)*s.speed);phase='反撃';}
  }else if(s.motion==='shield-advance') {ms=Math.max(0,t-s.windup)*s.speed;phase=t<s.windup?'構え':'前進';}
  else if(t<s.windup){ms=t*s.speed;phase='構え';}
  else if(t<s.windup+s.hold){ms=519;phase='発動';}
  else {ms=519*(1-(t-s.windup-s.hold)/Math.max(s.recover,1));phase='復帰';}
  const q=s.travel?clamp((t-s.windup)/Math.max(1,s.hold),0,1):0;
  return {x:c.origin.x+c.direction.x*s.travel*q,y:c.origin.y+c.direction.y*s.travel*q,facing:c.facing,motion,motionTime:Math.max(0,ms),phase,progress:t/s.duration};
 }
 function targets(c,actors){const s=c.spec,live=actors.filter(e=>e.hp>0);if(s.support)return [];
  if(s.pattern==='single')return live.filter(e=>e.id===c.target.id&&distance(e,c.origin)<=s.radius+24);
  if(s.pattern==='all')return live;
  if(['fan','line','charge','revenge'].includes(s.pattern))return live.filter(e=>{const dx=e.x-c.origin.x,dy=e.y-c.origin.y,along=dx*c.direction.x+dy*c.direction.y,across=Math.abs(dx*c.direction.y-dy*c.direction.x);const reach=s.id==='charge'&&c.elapsed>0?Math.min(s.radius,sample(c,c.elapsed).progress>=1?s.travel+100:clamp((c.elapsed-s.windup)/Math.max(1,s.hold),0,1)*s.travel+100):s.radius;return along>=-8&&along<=reach&&(s.pattern==='fan'?Math.atan2(across,Math.max(1,along))<=s.angle/2:across<=s.width/2);});
  return live.filter(e=>distance(e,c.target)<=s.radius);
 }
 function canInterrupt(enemy,time=enemy.worldTime||0){return I.open(enemy,time);}
 function incoming(run,party){const live=party.filter(a=>a.hp>0);return run.enemies.filter(e=>e.hp>0&&(e.goddessForecast||I.open(e,run.time)||(I.committed(e,run.time)&&run.time<=e.actionInterference.endsAt+e.actionInterference.releaseDelay)||(e.swampPlan&&(['windup','chant'].includes(e.motion)||e.type==='hydra'&&e.motion==='charge'))||e.state==='windup')).filter(e=>live.some(a=>distance(e,a)<=e.range+180)||e.actionInterference?.shapes.some(s=>live.some(a=>I.contains(s,a))));}
 function choose(actor,enemies,party,run){let best=null;const live=enemies.filter(e=>e.hp>0),allies=party.filter(a=>a.hp>0),danger=incoming(run,allies);
  const guardSkill=(actor.paladinSkills||[]).find(s=>s.id==='aegis'),heavySkill=(actor.paladinSkills||[]).find(s=>s.id==='hammer');
  const guardReserve=danger.length||live.some(e=>e.majorBoss)?guardSkill?.mp||0:live.some(e=>e.boss&&I.ACTIONS[e.type]&&e.cooldown<3000)?heavySkill?.mp||0:0;
  const guarded=(id)=>run.paladinFields?.some(f=>f.id===id&&f.until>run.time&&f.source.hp>0);
  for(const s of actor.paladinSkills||[]){if((actor.paladinCooldowns?.[s.id]||0)>0||actor.mp<s.mp)continue;let score=0,target=live.reduce((best,e)=>!best||distance(actor,e)<distance(actor,best)?e:best,null);if(!target)continue;
   if(s.support&&!['aegis','bastion','purify'].includes(s.id)&&actor.mp-s.mp<guardReserve)continue;
   if(s.id==='purify')score=allies.filter(a=>distance(actor,a)<=s.radius&&(a.goddessDot||a.burn||a.armorBreakUntil>run.time||a.poison||a.rootUntil>run.time||a.sandSlowUntil>run.time||a.freezeUntil>run.time||a.chillUntil>run.time)).length*10000;
   else if(['aegis','bastion'].includes(s.id)){if(danger.length&&!guarded(s.id)){
    const imminent=danger.filter(e=>{const a=e.actionInterference||e.goddessForecast;if(!a)return true;const lead=Math.max(0,Math.min(s.effectDuration*.5,s.effectDuration-a.damageSpan-150));return a.endsAt-run.time+a.releaseDelay<=lead+s.release;});
    const lethal=imminent.some(e=>allies.some(a=>a.hp<a.maxHp*.5));score=imminent.length?(s.id==='bastion'?(lethal?15000:0):11000):0;
   }}
   else if(['sanctuary','fortress'].includes(s.id)){if(!guarded(s.id)&&allies.some(a=>distance(actor,a)<=s.radius&&(s.id==='sanctuary'?a.hp/a.maxHp<.8||a.poison||a.burn||a.armorBreakUntil>run.time:danger.length||a.hp/a.maxHp<.7)))score=7000;}
   else if(['reflect','revenge'].includes(s.id)){if(!guarded(s.id)&&live.some(e=>distance(e,actor)<e.range+60))score=s.id==='revenge'?5500:4000;}
   else if(s.id==='provoke'){if(allies.some(a=>a!==actor&&a.hp/a.maxHp<.55)&&live.some(e=>e.targetId!==actor.id&&distance(actor,e)<=s.radius)&&!live.some(e=>e.tauntUntil>run.time))score=6000;}
   else {
    for(const e of live){if(distance(actor,e)>s.reach)continue;
     const expectedDamage=actor.damage*s.power*(s.hits+s.finalMultiplier-1)/(1+(e.defense||0)/Math.max(1,actor.baseDamage||actor.damage));
     const finishing=e.hp<=expectedDamage&&(!I.open(e,run.time)||s.release<e.actionInterference.endsAt-run.time+e.actionInterference.releaseDelay);
     const heavy=I.power(s,0,true)>=100||I.power(s,s.hits-1,true)>=100;
     if(!finishing&&heavy&&e.boss&&!I.open(e,run.time)&&I.ACTIONS[e.type]){
      const preparation=Math.max(...Object.keys(I.ACTIONS[e.type]).map(m=>I.config(e,m).warn));
      if(e.cooldown+preparation<s.cooldown+s.release+100)continue;
     }
     const c=begin(s,actor,e),count=targets(c,live).length;let value=s.power*(s.hits+s.finalMultiplier-1)*count/s.duration*1000;
     const interrupt=I.score(run,actor,s,e,hitTimes(s).map(t=>t*s.duration));value+=interrupt;
     if(finishing)value+=25000;
     if(interrupt>0&&interrupt<12000){const remaining=e.actionInterference.remaining,cut=interrupt/2500*remaining;
      const combo=(actor.paladinSkills||[]).some(next=>{if(next.id===s.id||next.support||actor.mp<s.mp+next.mp||actor.paladinCooldowns?.[next.id]>0||distance(actor,e)>next.reach)return false;
       const future=I.score(run,actor,next,e,hitTimes(next).map(t=>t*next.duration+s.duration));return cut+(future>=12000?remaining:future/2500*remaining)>=remaining-1e-7;
      });
      if(combo)value+=11500;
     }
     if(value>=11000&&e.actionInterference)value+=I.resistance(e,run.time)*50+allies.filter(a=>e.actionInterference.shapes.some(shape=>I.contains(shape,a))).reduce((n,a)=>n+1500*(1.5-a.hp/a.maxHp),0);
     if(value<11000&&actor.mp-s.mp<guardReserve)continue;
     if(value<11000&&guardSkill&&actor.mp>=guardSkill.mp&&!(actor.paladinCooldowns?.aegis>0)&&danger.some(d=>{const a=d.actionInterference||d.goddessForecast;return a&&a.endsAt-run.time+a.releaseDelay<s.duration+guardSkill.release+150;}))continue;
     if(count&&value>score){score=value;target=e;}}
   }
   if(score>0&&(!best||score>best.score))best={spec:s,target,score};
  }return best;
 }
 function waitForGuard(actor,party,run){const guard=(actor.paladinSkills||[]).find(s=>s.id==='aegis');if(!guard||actor.mp<guard.mp||actor.paladinCooldowns?.aegis>0)return false;return incoming(run,party).some(e=>{const a=e.actionInterference;return a&&a.endsAt-run.time+a.releaseDelay<=guard.release+(actor.paladinNormal?.duration||520)+150;});}
 const effectKind=s=>({spear:'break-impact',mace:'impact',purify:'circle',hammer:'hammer',wave:'wave',aegis:'shield',charge:'impact',provoke:'circle',bash:'impact',sanctuary:'circle',judgment:'hammer',reflect:'shield',pillar:'pillar',wall:'rampart',fortress:'shield',crusade:'knight',ray:'pillar',bastion:'rampart',heavens:'sword',revenge:'wave',ultimate:'hammer'}[s.id]);
 return {ACTIVE,NODES,spec:(...args)=>I.skill('paladin',spec(...args),args[3]||{}),parameters:s=>parameters(s)+I.parameters(s),hitTimes,begin,sample,targets,choose,waitForGuard,canInterrupt,incoming,effectKind};
});
