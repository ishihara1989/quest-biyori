'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Trials=api;})(globalThis,()=>{
  const definitions=[
    ...Array.from({length:9},(_,i)=>({id:'strength-'+(i+2),family:'strength',name:'強靭 '+(i+2),reward:i+2,stats:i+2,image:'items/armor.png',effect:'敵HP・攻撃力・防御力 ×'+(i+2),prize:'ゴールド・素材／ジェムドロップ率 ×'+(i+2),requires:i?['strength-'+(i+1)]:[],x:170+i%3*230,y:150+Math.floor(i/3)*145})),
    {id:'onslaught',family:'onslaught',name:'猛攻',reward:1.5,cooldown:.5,image:'items/sword.png',effect:'敵の行動クール ×0.5',prize:'攻撃力 ×1.5',requires:[],x:210,y:660},
    {id:'unyielding',family:'unyielding',name:'頑強',reward:1.5,interference:3,image:'progression/heartgem.png',effect:'妨害耐性・妨害抵抗力 ×3',prize:'最大HP ×1.5',requires:[],x:590,y:660},
    {id:'goddess-serious',family:'goddess',name:'女神の本気',reward:10,stats:3,goddess:true,image:'gems/goddess-page.png',effect:'両女神同時戦 ×3 / 異次元の女神フェーズII / 地域の幻影・女神援護',prize:'獲得転生PT ×1.5',requires:['onslaught','unyielding'],x:210,y:865},
    {id:'gate-release',family:'gate',name:'ゲート解放',reward:1.2,gateRelease:true,image:'../stages/dimensional-rift/gate.png',effect:'次元の門・混沌の門 ウェーブ1・2の敵を一括召喚',prize:'通常サブ・ユニーク素材費 −10%',requires:['onslaught','unyielding'],x:590,y:865},
  ];
  const byId=Object.fromEntries(definitions.map(d=>[d.id,d])),gods=['extradimensional-goddess','reincarnation-goddess'];
  const clean=ids=>[...new Set((Array.isArray(ids)?ids:[]).filter(id=>Object.hasOwn(byId,id)))];
  const availableNode=id=>id==='trial-open';
  const unlocked=save=>!!save?.reincarnation?.unlocked&&!!save.reincarnation.owned?.includes('trial-open');
  const completed=save=>clean(save.reincarnation?.trialCompleted);
  const available=(save,id)=>unlocked(save)&&!!byId[id]&&byId[id].requires.every(p=>completed(save).includes(p));
  function highest(ids){const families=new Map();for(const id of clean(ids)){const d=byId[id];if(!families.has(d.family)||families.get(d.family).reward<d.reward)families.set(d.family,d);}return [...families.values()];}
  function summarize(ids,stage){
    const result={ids:highest(ids).map(d=>d.id),reward:1,stats:1,cooldown:1,interference:1,intervention:false,gateRelease:false};
    for(const d of highest(ids)){
      result.reward*=d.reward;
      if(!d.goddess||gods.includes(stage))result.stats*=d.stats||1;
      result.cooldown*=d.cooldown||1;result.interference*=d.interference||1;
      if(d.goddess)result.intervention=true;
      if(d.gateRelease)result.gateRelease=true;
    }result.reward=Number(result.reward.toFixed(12));return result;
  }
  const capture=(save,stage=save.selectedStage)=>summarize(unlocked(save)&&save.reincarnation.trialRun?save.reincarnation.trials:[],stage);
  const serious=save=>unlocked(save)&&save.reincarnation.trialRun===true&&save.reincarnation.trials.includes('goddess-serious');
  const validPlan=(save,ids)=>Array.isArray(ids)&&ids.every(id=>available(save,id))&&clean(ids).length===ids.length&&highest(ids).length===ids.length;
  function toggle(save,ids,id){if(!available(save,id))return clean(ids);return ids.includes(id)?ids.filter(v=>v!==id):[...clean(ids).filter(v=>byId[v].family!==byId[id].family),id];}
  function bonuses(save){const ids=clean(save.reincarnation?.appliedTrials);return {harvest:Math.max(1,...ids.filter(id=>byId[id].family==='strength').map(id=>byId[id].stats)),hp:ids.includes('unyielding')?1.5:1,damage:ids.includes('onslaught')?1.5:1,pt:ids.includes('goddess-serious')?1.5:1,materialReduction:ids.includes('gate-release')?10:0};}
  function complete(save,evidence){const r=save.reincarnation;if(!r.trialRun||evidence?.journey!==(r.journey||0))return [];
    const ids=clean(evidence.trials?.ids);if(ids.length!==r.trials.length||!ids.every(id=>r.trials.includes(id)))return [];
    const first=ids.filter(id=>!completed(save).includes(id));r.trialCompleted=[...completed(save),...first];return first;
  }
  function abandon(save){if(!save.reincarnation?.trialRun)return false;save.reincarnation.trials=[];save.reincarnation.trialRun=false;save.reincarnation.journey=(save.reincarnation.journey||0)+1;return true;}
  return {definitions,byId,gods,clean,availableNode,unlocked,completed,available,summarize,capture,serious,validPlan,toggle,bonuses,complete,abandon,mapSize:{width:800,height:980}};
});
