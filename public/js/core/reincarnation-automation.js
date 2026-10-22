'use strict';
((root,factory)=>{
  const common=typeof module==='object'&&module.exports;
  const api=factory(common?require('./forest-progression.js'):root.ForestProgression);
  if(common)module.exports=api;else root.ReincarnationAutomation=api;
})(globalThis,P=>{
  function defaultPriority(node){return ['normal','active'].includes(node.kind)?1:node.kind==='enhancement'?4:Object.keys(node.effect).some(k=>['damage','weaponFlat','magicFlat','damagePercent','weaponPower','magicPower','crit','attackSpeed','skillPower'].includes(k))?2:3;}
  function skills(save,pausedJob=null){
    if(!save.reincarnation?.unlocked||!save.reincarnation.automation.skills)return 0;
    let count=0;
    for(const job of Object.keys(P.CHARACTERS)){
      if(job===pausedJob||!P.unlocked(save,job))continue;
      const settings=save.reincarnation.automation.priorities[job]||{};
      const nodes=P.SKILLS[job].filter(n=>n.cost>0&&settings[n.id]?.enabled!==false).sort((a,b)=>(settings[a.id]?.priority||defaultPriority(a))-(settings[b.id]?.priority||defaultPriority(b))||(b.unlockLevel||1)-(a.unlockLevel||1)||a.id.localeCompare(b.id));
      for(let i=0;i<1500;i++){const n=nodes.find(n=>P.status(save,job,'skills',n)==='available');if(!n||!P.purchase(save,job,'skills',n.id))break;count++;}
    }
    return count;
  }
  const slotDefaults=slot=>({effects:['fortune',slot==='weapon'?'attack':'vitality','recovery'],locked:false,epic:true,rarity:'rare',efficiency:true});
  function gems(save){
    if(!save.reincarnation?.unlocked||!save.reincarnation.automation.gems)return 0;
    const trials=typeof module==='object'&&module.exports?require('./trials.js'):globalThis.Trials;
    if(trials.rules(save).seals.gems)return 0;
    let changes=0;const descriptions=new Map(save.gems.map(g=>[g.id,P.Gem.describe(g)]));
    for(const job of Object.keys(P.CHARACTERS))if(P.unlocked(save,job))for(const slot of ['weapon','armor']){
      const setting={...slotDefaults(slot),...save.reincarnation.automation.slots[job+':'+slot]};if(setting.locked)continue;
      const current=save.progression.characters[job].gems[slot],currentSet=new Set(current),cap=P.capacity(save,job,slot);
      const assigned=new Set(Object.values(save.progression.characters).flatMap(c=>[...c.gems.weapon,...c.gems.armor]));
      const keys=setting.effects.map(k=>P.Gem.OPTIONS[k]?.key).filter(Boolean);
      const candidates=save.gems.filter(g=>!(g.rarity==='epic'&&trials.rewards(save).epics.includes(job))).filter(g=>(currentSet.has(g.id)||!assigned.has(g.id))&&P.Gem.TIERS[g.rarity].rank>=P.Gem.TIERS[setting.rarity].rank&&descriptions.get(g.id).jobs.includes(job)&&(!descriptions.get(g.id).slot||descriptions.get(g.id).slot===slot)).map(g=>{
        const d=descriptions.get(g.id),cost=P.gemCosts(save,job,slot,g,cap),values=[setting.epic&&g.rarity==='epic'?1:0,...keys.map(k=>d.effect[k]||0)];
        return {id:g.id,cost,values,density:(values[0]*100000+(values[1]||0))/Math.max(1,Object.values(cost).reduce((s,n)=>s+n,0))};
      });
      const compareValues=(a,b)=>{for(let i=0;i<a.length;i++){const diff=(b[i]||0)-(a[i]||0);if(Math.abs(diff)>1e-10)return diff;}return 0;};
      candidates.sort((a,b)=>compareValues(a.values,b.values)||b.density-a.density||a.id-b.id);
      const picked=new Map([...candidates.slice(0,32),...[...candidates].sort((a,b)=>b.density-a.density||a.id-b.id).slice(0,32),...candidates.filter(c=>currentSet.has(c.id))].map(c=>[c.id,c]));
      const score=ids=>{
        const rows=ids.map(id=>picked.get(id)).filter(Boolean),used={attack:0,defense:0,utility:0,dedicated:0},values=Array(keys.length+1).fill(0);
        for(const row of rows){for(const [k,n]of Object.entries(row.cost))used[k]+=n;row.values.forEach((v,i)=>values[i]+=v);}
        used.common=['attack','defense','utility'].reduce((sum,k)=>sum+Math.max(0,used[k]-cap[k]),0);
        return {ids,used,values,keep:ids.filter(id=>currentSet.has(id)).length};
      };
      const compare=(a,b)=>compareValues(a.values,b.values)||(setting.efficiency?a.used.utility-b.used.utility||a.used.common-b.used.common:0)||b.keep-a.keep||a.ids.join(',').localeCompare(b.ids.join(','));
      let beam=[score([])];
      for(const candidate of picked.values()){
        const more=beam.map(s=>score([...s.ids,candidate.id])).filter(s=>s.used.common<=cap.common&&s.used.dedicated<=cap.dedicated);
        beam=[...beam,...more].sort(compare).slice(0,24);
      }
      // The current legal loadout always participates, even beyond the search cap.
      let best=beam[0];const old=score(current);if(current.every(id=>picked.has(id))&&compare(old,best)<=0)best=old;
      if(P.gemUsage(save,job,slot,best.ids).fits&&[...current].sort((a,b)=>a-b).join(',')!==[...best.ids].sort((a,b)=>a-b).join(',')){
        save.progression.characters[job].gems[slot]=best.ids;changes++;
      }
    }
    return changes;
  }
  return {defaultPriority,slotDefaults,skills,gems};
});
