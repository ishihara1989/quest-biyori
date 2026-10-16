'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EpicGemCombat=api;})(globalThis,()=>{
  const KEYS=['warriorCooldowns','mageCooldowns','paladinCooldowns','ninjaCooldowns','shamanCooldowns','mikoCooldowns'];
  function cooldowns(actor,amount){for(const key of KEYS)for(const id of Object.keys(actor[key]||{}))actor[key][id]=Math.max(0,actor[key][id]-amount);}
  function rage(actor,time){return actor.epicWarriorArmor&&actor.epicRageUntil>time?actor.epicRage||0:0;}
  function heal(run,actor,amount,events){if(actor.hp<=0)return;const gain=Math.min(actor.maxHp-actor.hp,amount);if(gain>0){actor.hp+=gain;events.push({type:'heal',source:actor.id,target:actor.id,amount:Math.round(gain),x:actor.x,y:actor.y-90,timeMs:run.time});}}
  function hurt(run,source,actor,events,options,damage){
    if(actor.hp<=0||options.secondary||options.direct===false||damage<=0)return;
    const action=options.actionId||source.actionId||source.id+'-'+run.time;
    if((actor.gemMpOnHurt||actor.gemCooldownOnHurt)&&run.time>=(actor.hurtGemAt??-1)&&actor.hurtGemAction!==action){
      actor.hurtGemAt=run.time+1000;actor.hurtGemAction=action;
      actor.mp=Math.min(actor.maxMp,actor.mp+actor.maxMp*(actor.gemMpOnHurt||0));cooldowns(actor,(actor.gemCooldownOnHurt||0)*1000);
      events.push({type:'gem-effect',kind:actor.gemMpOnHurt?'reprisal':'timeshift',x:actor.x,y:actor.y,timeMs:run.time});
    }
    if(actor.epicPaladinArmor&&run.time>=(actor.epicGuardAt??-1)&&actor.epicGuardAction!==action){actor.epicGuardAt=run.time+1000;actor.epicGuardAction=action;cooldowns(actor,2000);}
    if(actor.epicWarriorArmor&&run.time>=(actor.epicRageAt??-1)&&actor.epicRageAction!==action){actor.epicRage=Math.min(10,rage(actor,run.time)+1);actor.epicRageUntil=run.time+15000;actor.epicRageAt=run.time+500;actor.epicRageAction=action;events.push({type:'gem-effect',kind:'echo',x:actor.x,y:actor.y,timeMs:run.time});}
  }
  function dealt(run,actor,amount,events,options){
    if(actor.hp<=0)return;
    if(actor.epicWarriorArmor)heal(run,actor,amount*.1,events);
    if(actor.epicShamanArmor&&options.curseKind?.startsWith('curse-')){
      heal(run,actor,amount*.1,events);
      if(options.curseKind==='curse-dot'&&run.time>=(actor.epicCurseMpAt??-1)){actor.mp=Math.min(actor.maxMp,actor.mp+actor.maxMp*.02);actor.epicCurseMpAt=run.time+500;}
    }
  }
  function reduction(run,actor){if(!actor.epicShamanArmor)return 1;const marks=run.enemies.filter(e=>!e.bodyPart&&e.hp>0).reduce((sum,e)=>sum+(e.curse?.marks||[]).filter(m=>m.source===actor&&m.until>=run.time).length,0);return 1-Math.min(.8,marks*.02);}
  function spell(run,actor,events){if(actor.epicMageArmor){actor.epicMageBarrier=Math.min(actor.maxHp,(actor.epicMageBarrier||0)+actor.maxHp*.2);events.push({type:'gem-effect',kind:'aegis',x:actor.x,y:actor.y,timeMs:run.time});}}
  return {cooldowns,rage,hurt,dealt,reduction,spell};
});
