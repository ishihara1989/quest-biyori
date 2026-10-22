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
   if(preset==='trials'){
    Object.assign(save.reincarnation,{unlocked:true,cycle:20,total:2000});
    const own=id=>{for(const parent of ReincarnationTree.byId[id].requires)if(parent!=='origin'&&!save.reincarnation.owned.includes(parent))own(parent);if(id!=='origin')save.reincarnation.owned.push(id);};
    own('trial-open');save.reincarnation.trialCompleted=['onslaught','unyielding'];save.reincarnation.trials=['goddess-serious'];save.reincarnation.trialRun=true;
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
