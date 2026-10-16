'use strict';
// Pure time-based sampling keeps frame stepping, pause and reverse-facing previews coherent.
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EnemyEffects=api;})(typeof globalThis==='object'?globalThis:this,()=>{
  const LIFETIMES={'toad-poison-bolt':700,'lich-energy-bolt':700,'mud-bind':2200,'mud-slam-impact':720,'lich-dark-magic':720,'hydra-poison-aura':960,'hydra-poison-breath':720};
  function activeAt(model,elapsed,bridge=false){
    if(!model.effectPreview)return [];
    const before=bridge?model.transitions.idleLeadInMs:0,cycles=model.loop?(bridge?2:Infinity):1;
    if(bridge)elapsed%=before+cycles*model.durationMs+model.transitions.idleLeadOutMs;
    const items=[];
    for(const event of model.events||[]){
      if(!model.effectPreview.assets.some(a=>a.id===event.effect))continue;
      const life=event.durationMs||LIFETIMES[event.effect]||720;
      const first=Math.max(0,Math.ceil((elapsed-before-event.timeMs-life)/model.durationMs));
      const last=Math.min(cycles-1,Math.floor((elapsed-before-event.timeMs)/model.durationMs));
      for(let cycle=first;cycle<=last;cycle++){
        const ageMs=elapsed-before-event.timeMs-cycle*model.durationMs;
        if(ageMs>=0&&ageMs<life)items.push({effect:event.effect,event,cycle,ageMs,startMs:before+event.timeMs+cycle*model.durationMs});
      }
    }
    return items;
  }
  function targetAt(model,elapsed,bridge=false){
    const items=activeAt(model,elapsed,bridge),root=items.find(e=>e.effect==='mud-bind');
    const clock=root?root.startMs:elapsed;
    return {...model.effectPreview.target,x:model.effectPreview.target.x+Math.sin(clock/500)*18,rooted:!!root};
  }
  return {activeAt,targetAt,LIFETIMES};
});
