'use strict';
((root,factory)=>{const common=typeof module==='object'&&module.exports;const api=factory(common?require('./shaman-combat.js'):root.ShamanCombat,common?require('./demon-castle-combat.js'):root.DemonCastleCombat);if(common)module.exports=api;else root.SoloSupport=api;})(globalThis,(Shaman,Castle)=>{
  // No off-party actors: support scales from each living participant.
  function tick(run,api,events){
    if(run.status!=='running'||run.phase!=='combat')return;
    const state=run.soloSupport ||= {wave:-1,next:0,calls:{}};
    if(state.wave!==run.wave){state.wave=run.wave;state.next=run.time;}
    if(run.time+1e-6<state.next)return;state.next+=10000;
    for(const a of [run.hero,...run.allies].filter(a=>a.hp>0))for(const [job,tier]of Object.entries(run.trials.support||{})){
      if(job===a.type||tier<1)continue;
      const strong=tier>=2,targets=run.enemies.filter(e=>e.hp>0&&!e.invulnerable&&!e.bodyPart).sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y));
      state.calls[job]=(state.calls[job]||0)+1;
      const packet=(e,multiplier)=>api.hit(run,a,e,a.damage*multiplier,events,true,job==='mage'?'魔法':null,{secondary:true,critical:false,skipHitRoll:true,curseKind:'solo-support-'+job,actionId:'solo-support-'+job+'-'+run.time});
      const visualTargets=targets.slice(0,job==='paladin'||job==='miko'?0:strong?job==='ninja'?6:8:job==='warrior'?4:job==='shaman'?1:3);
      if(job==='warrior')for(const e of visualTargets)packet(e,strong?4.5:1);
      if(job==='mage')for(const e of visualTargets){packet(e,strong?2.5:1.2);if(strong&&e.hp>0)e.freezeUntil=Math.max(e.freezeUntil||0,run.time+1500);}
      if(job==='ninja')for(const e of visualTargets)packet(e,strong?2.4:.7);
      if(job==='shaman')for(const e of visualTargets){Shaman.debuff(run,e,'attack',strong?.2:.1,strong?5000:3000,a,'solo-support');if(strong){Shaman.debuff(run,e,'defense',.2,5000,a,'solo-support');packet(e,2);}}
      if(job==='paladin'){const old=a.gemBarrier,amount=a.maxHp*(strong?.15:.05);a.gemBarrier={amount:Math.max(old?.until>run.time?old.amount:0,amount),until:run.time+(strong?5000:3000)};}
      if(job==='miko'){
        const heal=Math.min(a.maxHp-a.hp,a.maxHp*(strong?.15:.05)*Castle.healingFactor(a,run.time));a.hp+=heal;
        if(heal>0)events.push({type:'heal',amount:Math.round(heal),target:a.id,x:a.x,y:a.y-65,timeMs:run.time});
        if(strong){a.mp=Math.min(a.maxMp,a.mp+a.maxMp*.05);if(!run.mikoFestival||run.mikoFestival.until<=run.time)run.mikoFestival={source:a,spec:{id:'solo-kagura',spirit:.2},start:run.time,until:run.time+5000,nextCoop:Infinity};}
      }
      if(visualTargets.length||job==='paladin'||job==='miko')events.push({type:'solo-support',job,tier,targets:visualTargets.map(e=>({x:e.x,y:e.y})),x:a.x,y:a.y,timeMs:run.time});
    }
  }
  return {tick};
});
