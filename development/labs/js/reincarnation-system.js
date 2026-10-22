'use strict';
(async()=>{
 const status=document.getElementById('status'),backupKey='reincarnation-runtime-review-backup';
 const core=new Set(['trials','gem-system','forest-progression','forest-auto-gear','reincarnation','achievements','reincarnation-automation']);
 try{
  const source=await(await fetch('/game.html')).text(),doc=new DOMParser().parseFromString(source,'text/html');
  for(const script of doc.querySelectorAll('script[src]')){
   const src=script.getAttribute('src'),name=src.split('/').at(-1).replace('.js','');
   if(!src.startsWith('/js/data/')&&!src.startsWith('/js/skills/')&&!(src.startsWith('/js/core/')&&core.has(name))&&!['action-interference','equipment-visuals'].includes(name))continue;
   await new Promise((resolve,reject)=>{const element=document.createElement('script');element.src=src;element.onload=resolve;element.onerror=()=>reject(Error(src));document.head.append(element);});
  }
  const D=ForestData,P=ForestProgression,R=Reincarnation;
  function fixture(preset){
   let save=D.freshSave();if(preset==='fresh')return save;
   save.cleared=D.STAGES.map(s=>s.id).concat('dimensional-gate','chaos-gate','extradimensional-goddess');
   save.encounteredEnemies=D.ALL_STAGES.filter(s=>save.cleared.includes(s.id)).flatMap(s=>s.waves.flat());
   save.gold=1000000000;for(const item of D.ITEMS.filter(i=>i.type!=='gem'))save.inventory[item.id]=100000;
   for(const job of Object.keys(P.CHARACTERS)){
    const c=save.progression.characters[job];c.xp=P.experience(100);
    for(const slot of ['weapon','armor']){c[slot]=P.allGearTrees(job,slot,true).map(n=>n.id);const gem=P.addGem(save,P.Gem.generate({rarity:'epic',family:job+'-'+slot}));if(!P.equipGem(save,job,slot,gem.id))throw Error('装着失敗 '+job+' '+slot);}
    for(const n of P.SKILLS[job].filter(n=>n.kind==='active'))for(let rank=0;rank<5;rank++)P.purchase(save,job,'skills',n.id);
   }
   save.inventory.potion=0;save.autoMode='off';save.speed=2;
   save.reincarnation.discovered=preset!=='discovery';save.selectedStage=preset==='discovery'?'extradimensional-goddess':'reincarnation-goddess';
   if(['ready','tree','deep'].includes(preset)){save.reincarnation.unlocked=true;save.reincarnation.defeatedCycle=0;save.cleared.push('reincarnation-goddess');save.selectedStage=1;}
   Achievements.sync(save);
   if(['tree','deep'].includes(preset))save=R.prepare(save,D.freshSave);
   if(preset==='deep'){save.reincarnation.cycle=10000;save.reincarnation.total=1000000;}
   if(preset==='seals'){
    save=D.freshSave();Object.assign(save.reincarnation,{discovered:true,unlocked:true,cycle:100,total:20000});
    const own=id=>{for(const parent of ReincarnationTree.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);};
    for(const id of ['trial-open','damage2','hp2'])own(id);save.autoMode='off';
   }
   if(['trials','gate-release','chaos-gate-release'].includes(preset)){
    Object.assign(save.reincarnation,{unlocked:true,cycle:20,total:2000});
    const own=id=>{for(const parent of ReincarnationTree.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(parent);if(id!=='origin')save.reincarnation.owned.push(id);};
    own('trial-open');save.reincarnation.trialCompleted=['onslaught','unyielding'];save.reincarnation.trials=['goddess-serious'];save.reincarnation.trialRun=true;
    if(preset!=='trials'){save.reincarnation.trials=['gate-release'];save.reincarnation.appliedTrials=['onslaught','unyielding'];save.selectedStage=preset==='gate-release'?'dimensional-gate':'chaos-gate';save.speed=1;}
   }
   if(preset==='solo'){
    const own=id=>{for(const parent of ReincarnationTree.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(parent);if(id!=='origin'&&!save.reincarnation.owned.includes(id))save.reincarnation.owned.push(id);};
    Object.assign(save.reincarnation,{unlocked:true,cycle:10000,total:1000000});for(const n of ReincarnationTree.nodes.filter(n=>!n.root&&n.cost<=8000))own(n.id);
    const prior=['strength-2','onslaught','unyielding','goddess-serious','gate-release','seal-gems','seal-skills',...Object.keys(P.CHARACTERS).flatMap(job=>[1,2].map(t=>`solo-${job}-${t}`))];
    save.reincarnation.trialCompleted=[...prior];save.reincarnation.appliedTrials=[...prior];save.cleared=save.cleared.filter(id=>id!=='extradimensional-goddess');save.gems=[];save.nextGemId=1;save.achievements=D.freshSave().achievements;
    for(const c of Object.values(save.progression.characters))c.gems={weapon:[],armor:[]};
    let state=4281;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
    for(const job of Object.keys(P.CHARACTERS)){
     const c=save.progression.characters[job];for(const slot of ['weapon','armor']){c[slot]=P.allGearTrees(job,slot).map(n=>n.id);c.gems[slot]=[];const cap=P.capacity(save,job,slot),budget=(cap.attack+cap.defense+cap.utility+cap.common)*.5,families=slot==='weapon'?['attack','recovery','haste','siphon','range']:['vitality','recovery','defense','aegis','resistance'];
      for(let i=0;i<30;i++)for(const rarity of ['legendary','unique','rare']){const family=families[i%families.length];if((P.Gem.OPTIONS[family].min||0)>P.Gem.TIERS[rarity].rank)continue;const gem=P.Gem.generate({rarity,family,level:10,random});gem.quality=1;const used=P.gemUsage(save,job,slot).used;if(used.attack+used.defense+used.utility+P.gemCost(save,job,slot,gem)>budget)continue;const added=P.addGem(save,gem);if(!P.equipGem(save,job,slot,added.id))save.gems=save.gems.filter(g=>g.id!==added.id);}
     }
     P.respec(save,job);for(const kind of ['active','enhancement','passive'])for(const n of P.SKILLS[job].filter(n=>n.kind===kind))while(P.purchase(save,job,'skills',n.id)){}
    }
    Object.assign(save.reincarnation,{trials:['solo-miko-3'],trialRun:true});save.progression.selected='miko';save.selectedStage='extradimensional-goddess';save.speed=1;
   }
   Achievements.sync(save);return save;
  }
  for(const button of document.querySelectorAll('[data-preset]')){button.disabled=false;button.addEventListener('click',()=>{
   try{const save=fixture(button.dataset.preset);if(!sessionStorage.getItem(backupKey))sessionStorage.setItem(backupKey,JSON.stringify({raw:localStorage.getItem(D.SAVE_KEY)}));localStorage.setItem(D.SAVE_KEY,JSON.stringify(save));location.assign('/');}catch(error){status.textContent=error.message;}
  });}
  document.getElementById('restore').disabled=!sessionStorage.getItem(backupKey);
  document.getElementById('restore').addEventListener('click',()=>{const value=JSON.parse(sessionStorage.getItem(backupKey));if(value.raw===null)localStorage.removeItem(D.SAVE_KEY);else localStorage.setItem(D.SAVE_KEY,value.raw);sessionStorage.removeItem(backupKey);location.assign('/');});
  status.textContent='状態を選ぶと本編へ移動します。';
 }catch(error){status.textContent='読込失敗: '+error.message;console.error(error);}
})();
