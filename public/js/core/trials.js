'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Trials=api;})(globalThis,()=>{
  const definitions=[
    ...Array.from({length:9},(_,i)=>({id:'strength-'+(i+2),family:'strength',name:'強靭 '+(i+2),reward:i+2,stats:i+2,image:'items/armor.png',effect:'敵HP・攻撃力・防御力 ×'+(i+2),prize:'ゴールド・素材／ジェムドロップ率 ×'+(i+2),requires:i?['strength-'+(i+1)]:[],x:170+i%3*230,y:150+Math.floor(i/3)*145})),
    {id:'onslaught',family:'onslaught',name:'猛攻',reward:1.5,cooldown:.5,image:'items/sword.png',effect:'敵の行動クール ×0.5',prize:'攻撃力 ×1.5',requires:[],x:210,y:660},
    {id:'unyielding',family:'unyielding',name:'頑強',reward:1.5,interference:3,image:'progression/heartgem.png',effect:'妨害耐性・妨害抵抗力 ×3',prize:'最大HP ×1.5',requires:[],x:590,y:660},
    {id:'goddess-serious',family:'goddess',name:'女神の本気',reward:10,stats:3,goddess:true,image:'gems/goddess-page.png',effect:'両女神同時戦 ×3 / 異次元の女神フェーズII / 地域の幻影・女神援護',prize:'獲得転生PT ×1.5',requires:['onslaught','unyielding'],x:210,y:865},
    {id:'gate-release',family:'gate',name:'ゲート解放',reward:1.2,gateRelease:true,image:'../stages/dimensional-rift/gate.png',effect:'次元の門・混沌の門 ウェーブ1・2の敵を一括召喚',prize:'通常サブ・ユニーク素材費 −10%',requires:['onslaught','unyielding'],x:590,y:865},
  ];
  const jobs={warrior:'戦士',mage:'魔法使い',paladin:'パラディン',ninja:'忍者',shaman:'呪術師',miko:'巫女'};
  const soloMultipliers={warrior:[6,8,20],mage:[10,18,40],paladin:[20,40,80],ninja:[10,20,80],shaman:[36,70,80],miko:[48,70,80]};
  const supportPrizes={warrior:['4体へ100%','8体へ450%'],mage:['3体へ120%','8体へ250%・凍結1.5秒'],paladin:['HP5%バリア・3秒','HP15%バリア・5秒'],ninja:['3体へ70%','6体へ240%'],shaman:['1体の攻撃−10%・3秒','8体へ200%・攻撃／防御−20%・5秒'],miko:['HP5%回復','HP15%・MP5%回復・神楽20%／5秒']};
  definitions.push(
    {id:'seal-gems',family:'seal-gems',name:'無彩の誓約',reward:5,seal:'gems',image:'gems/legendary.png',effect:'全ジェム装着・装着効果 封印',prize:'全ジェム能力をLv.10レジェンダリー1欄分加算（攻撃・HP・防御は3欄分）／武器・防具の通常容量100につき与ダメージ・HP＋1%',requires:[],node:'trial-seals',x:170,y:1080},
    {id:'seal-skills',family:'seal-skills',name:'半知の戒律',reward:1.5,seal:'skills',image:'items/staff.png',effect:'解放Lv.51以降のスキル 封印',prize:'総SPの100超過分1につき与ダメージ・HP＋1%',requires:[],node:'trial-seals',x:400,y:1080},
    {id:'seal-gear',family:'seal-gear',name:'幹道の誓約',reward:5,seal:'gear',image:'items/armor.png',effect:'装備強化はメインノードのみ',prize:'通常サブ・ユニークの攻撃力・HP・防御力＋20%',requires:[],node:'trial-seals',x:630,y:1080},
    ...Object.keys(jobs).flatMap((job,i)=>[1,2,3].map(tier=>({id:`solo-${job}-${tier}`,family:'solo',solo:{job,tier},name:`${jobs[job]}の孤道 ${['I','II','III'][tier-1]}`,reward:soloMultipliers[job][tier-1],image:`../${job}/idle-01.png`,effect:`${jobs[job]}1人で出撃`+(tier===2?'／強靭2以上 必須':tier===3?'／女神の本気 必須':''),prize:tier===3?'対応する武器・防具のエピック効果を初期所持／対応エピックのドロップ終了':supportPrizes[job][tier-1]+`／ウェーブ開幕・10秒ごと／${tier===1?'他職ソロ':'他の試練'}を支援`,requires:tier===1?[]:[`solo-${job}-${tier-1}`,tier===2?'strength-2':'goddess-serious'],node:'trial-seals',x:170+(i%3)*230,y:1320+Math.floor(i/3)*520+(tier-1)*145})))
  );
  const byId=Object.fromEntries(definitions.map(d=>[d.id,d])),gods=['extradimensional-goddess','reincarnation-goddess'];
  const clean=ids=>[...new Set((Array.isArray(ids)?ids:[]).filter(id=>Object.hasOwn(byId,id)))];
  const availableNode=id=>id==='trial-open'||id==='trial-seals';
  const unlocked=save=>!!save?.reincarnation?.unlocked&&!!save.reincarnation.owned?.includes('trial-open');
  const completed=save=>clean(save.reincarnation?.trialCompleted);
  const available=(save,id)=>unlocked(save)&&!!byId[id]&&(!byId[id].node||save.reincarnation.owned.includes(byId[id].node))&&byId[id].requires.every(p=>completed(save).includes(p));
  function highest(ids){const families=new Map();for(const id of clean(ids)){const d=byId[id];if(!families.has(d.family)||families.get(d.family).reward<d.reward)families.set(d.family,d);}return [...families.values()];}
  function normalize(ids){const chosen=highest(ids),solo=chosen.find(d=>d.solo)?.solo;return highest([...chosen.map(d=>d.id),...(solo?.tier===2?['strength-2']:solo?.tier===3?['goddess-serious']:[])]);}
  function summarize(ids,stage){
    const chosen=normalize(ids),solo=chosen.find(d=>d.solo)?.solo||null;
    const result={ids:chosen.map(d=>d.id),reward:1,stats:1,cooldown:1,interference:1,intervention:false,gateRelease:false,solo,seals:{gems:false,skills:false,gear:false}};
    for(const d of chosen){
      if(!d.solo)result.reward*=d.reward;
      if(!d.goddess||gods.includes(stage))result.stats*=d.stats||1;
      result.cooldown*=d.cooldown||1;result.interference*=d.interference||1;
      if(d.goddess)result.intervention=true;
      if(d.gateRelease)result.gateRelease=true;
      if(d.seal)result.seals[d.seal]=true;
    }if(solo)result.reward=Math.max(soloMultipliers[solo.job][solo.tier-1],result.reward*.8);result.reward=Number(result.reward.toFixed(12));return result;
  }
  const active=save=>unlocked(save)&&save.reincarnation.trialRun?save.reincarnation.trials:[];
  const ruleCache=new WeakMap();
  function rules(save){if(!save||typeof save!=='object')return summarize([]);const key=JSON.stringify(active(save));if(ruleCache.get(save)?.key!==key)ruleCache.set(save,{key,value:summarize(active(save))});return ruleCache.get(save).value;}
  const rewardCache=new WeakMap();
  function rewards(save){const ids=clean(save.reincarnation?.appliedTrials),key=ids.join('|');if(rewardCache.get(save)?.key===key)return rewardCache.get(save).value;const value= {gems:ids.includes('seal-gems'),sp:ids.includes('seal-skills'),gear:ids.includes('seal-gear'),epics:Object.keys(jobs).filter(job=>ids.includes(`solo-${job}-3`)),support:Object.fromEntries(Object.keys(jobs).map(job=>[job,ids.includes(`solo-${job}-2`)?2:ids.includes(`solo-${job}-1`)?1:0]))};rewardCache.set(save,{key,value});return value;}
  function capture(save,stage=save.selectedStage){const result=summarize(active(save),stage);result.support=Object.fromEntries(Object.entries(rewards(save).support).filter(([job,tier])=>job!==result.solo?.job&&(result.solo?tier>0:result.ids.length>0&&tier===2)));return result;}
  const serious=save=>rules(save).intervention;
  const validPlan=(save,ids)=>Array.isArray(ids)&&ids.every(id=>available(save,id))&&clean(ids).length===ids.length&&highest(ids).length===ids.length;
  // Same-family prerequisites unlock higher tiers; only other families are selected together.
  const dependencies=d=>d.requires.map(id=>byId[id]).filter(p=>p.family!==d.family);
  const satisfies=(chosen,p)=>chosen.some(d=>d.family===p.family&&d.reward>=p.reward);
  function selection(ids){
    const chosen=highest(ids);
    for(let i=0;i<chosen.length;i++)for(const p of dependencies(chosen[i]))if(!satisfies(chosen,p))chosen.push(p);
    return highest(chosen.map(d=>d.id)).map(d=>d.id);
  }
  function toggle(save,ids,id){
    if(!available(save,id))return clean(ids);
    if(!ids.includes(id))return selection([...clean(ids).filter(v=>byId[v].family!==byId[id].family),id]);
    let chosen=highest(ids.filter(v=>v!==id)),count;
    do{count=chosen.length;chosen=chosen.filter(d=>dependencies(d).every(p=>satisfies(chosen,p)));}while(chosen.length!==count);
    return chosen.map(d=>d.id);
  }
  function bonuses(save){const ids=clean(save.reincarnation?.appliedTrials);return {harvest:Math.max(1,...ids.filter(id=>byId[id].family==='strength').map(id=>byId[id].stats)),hp:ids.includes('unyielding')?1.5:1,damage:ids.includes('onslaught')?1.5:1,pt:ids.includes('goddess-serious')?1.5:1,materialReduction:ids.includes('gate-release')?10:0};}
  function complete(save,evidence){const r=save.reincarnation;if(!r.trialRun||evidence?.journey!==(r.journey||0))return [];
    const ids=clean(evidence.trials?.ids),expected=rules(save).ids;if(ids.length!==expected.length||!ids.every(id=>expected.includes(id)))return [];
    const first=ids.filter(id=>!completed(save).includes(id));r.trialCompleted=[...completed(save),...first];return first;
  }
  function abandon(save){if(!save.reincarnation?.trialRun)return false;save.reincarnation.trials=[];save.reincarnation.trialRun=false;save.reincarnation.journey=(save.reincarnation.journey||0)+1;return true;}
  return {definitions,byId,gods,jobs,soloMultipliers,clean,availableNode,unlocked,completed,available,summarize,capture,rules,rewards,serious,validPlan,selection,toggle,bonuses,complete,abandon,mapSize:{width:800,height:2220}};
});
