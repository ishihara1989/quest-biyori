'use strict';
((root,factory)=>{const common=typeof module==='object'&&module.exports;const api=factory(common?require('../data/goddess-data.js'):root.GoddessData,common?require('./goddess-combat.js'):root.GoddessCombat,common?require('./action-interference.js'):root.ActionInterference,common?require('../data/interference-reference.js'):root.InterferenceReference);if(common)module.exports=api;else root.TrialCombat=api;})(globalThis,(D,G,I,reference)=>{
  const delay=(run,base,spread)=>run.time+base+run.random()*spread;
  function init(run){run.trialIntervention=run.trials.intervention?{nextEcho:delay(run,6500,7000),nextDivine:delay(run,11000,9000),plan:null,serial:0}:null;}
  function clear(run){if(run.trialIntervention)run.trialIntervention.plan=null;}
  function begin(run,kind){const state=run.trialIntervention,party=[run.hero,...run.allies].filter(a=>a.hp>0);if(!state||!party.length)return null;
    const target=party[Math.floor(run.random()*party.length)],region=Math.max(1,Math.min(10,run.stage.region)),row=D.PHANTOMS[(region-1)*2+(run.random()<.5?0:1)],origin={x:820,y:460};
    const pattern=kind==='phantom'?row.kind:['cross','rings','zero'][Math.floor(run.random()*3)],warn=kind==='phantom'?2000:2400;
    const p=state.plan={kind:kind==='phantom'?'phantom':pattern,row,origin,shapes:G.shapes(run,pattern,origin,target),elapsed:0,warn,times:[warn],next:0,duration:warn+700,actionId:'trial-aid-'+(++state.serial),divine:kind!=='phantom'};
    if(p.divine)state.nextDivine=delay(run,14000,12000);else state.nextEcho=delay(run,10000,10000);
    return p;
  }
  function damage(run,target,divine,api,events,actionId){
    const row=reference[run.stage.id]?.[target.type]||reference[run.stage.xpStage||100]?.[target.type]||reference[100].warrior;
    const source={id:'trial-goddess',type:D.ID,hp:1,damage:850000,x:820,y:460,invulnerable:true};
    return api.hit(run,source,target,row.hp*(divine?.3:.2)*(1+row.defense/80),events,false,null,{actionId,direct:false,miss:false});
  }
  function tick(run,api,events){const state=run.trialIntervention;if(!state||run.status!=='running'||run.phase!=='combat')return;
    if(!run.enemies.some(e=>e.hp>0&&!e.dimensionalGate)){clear(run);return;}
    let p=state.plan;
    if(!p){if(run.time>=state.nextDivine)p=begin(run,'divine');else if(run.time>=state.nextEcho)p=begin(run,'phantom');}
    if(!p)return;p.elapsed+=api.STEP;
    if(!p.next&&p.elapsed>=p.warn){p.next=1;
      for(const actor of [run.hero,...run.allies])if(actor.hp>0&&p.shapes.some(s=>I.contains(s,actor)))damage(run,actor,p.divine,api,events,p.actionId);
      events.push({type:'goddess-effect',kind:p.divine?p.kind:'phantom-hit',x:p.origin.x,y:p.origin.y,shapes:p.shapes,effect:p.divine?null:p.row.effect,timeMs:run.time});
    }
    if(p.elapsed>=p.duration)clear(run);
  }
  function view(run){const p=run.trialIntervention?.plan;if(!p)return null;return {...run,enemies:[{type:D.ID,hp:1,x:p.origin.x,y:p.origin.y,goddess:true,goddessPlan:p}],goddess:{phantom:p.divine?null:p,projectiles:[]}};}
  return {init,clear,begin,tick,damage,view};
});
