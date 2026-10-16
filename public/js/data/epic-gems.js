'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EpicGems=api;})(globalThis,()=>{
  const GODDESS='extradimensional-goddess', MATERIAL='goddess-residue';
  const rows=[
    ['warrior','weapon','天壊万刃','epicWarriorWeapon','Hit数 ×3 / 追加Hit威力 100% / 動作時間 −40% / 消費MP −50%'],
    ['warrior','armor','不滅戦鬼','epicWarriorArmor','被弾闘気 +1 / 上限 10 / 持続時間 15秒 / 与ダメージ +20%・攻撃速度 +10% / 段 / HP吸収 10%'],
    ['mage','weapon','万象連星','epicMageWeapon','追加魔法 2 / 追加魔法威力 100% / 魔法範囲 +50% / 消費MP −50%'],
    ['mage','armor','星界魔炉','epicMageArmor','最大MP +200% / MP回復 最大MP5% / 秒 / 発動バリア 最大HP20% / 上限 最大HP100%'],
    ['paladin','weapon','神罰聖槌','epicPaladinWeapon','守護時神罰 ×10 / 対象 敵全体 / 反射ダメージ +300% / 神聖ダメージ +100%'],
    ['paladin','armor','不落天城','epicPaladinArmor','守護効果時間 +200% / 守護範囲 全域 / 被弾クール回復 2秒 / 発動間隔 1秒'],
    ['ninja','weapon','百影投刃','epicNinjaWeapon','投擲数 ×3 / 追加投擲威力 100% / 分身威力 100% / 複写威力 100%'],
    ['ninja','armor','無尽影衣','epicNinjaArmor','分身共存 全種 / 分身数 +4 / 分身持続 +200% / 消費MP −70%'],
    ['shaman','weapon','無窮呪獄','epicShamanWeapon','呪印上限 25 / 深呪上限 3種 / 呪印消費 0 / 呪い脈動間隔 −50%'],
    ['shaman','armor','黄泉還流','epicShamanArmor','呪い持続 +200% / 被ダメージ −2% / 呪印 / 軽減上限 80% / 呪いHP吸収 10% / 脈動MP回復 2% / 発動間隔 0.5秒'],
    ['miko','weapon','常世神楽','epicMikoWeapon','神楽持続 +200% / 神楽再使用時間 −50% / 神楽霊威 +100% / 協撃間隔 5秒 / 神楽MP回復 最大MP3% / 秒'],
    ['miko','armor','万霊総社','epicMikoArmor','攻撃契約 5 / 補助契約 3 / 回復契約 3 / 憑依上限 4 / 持続 +200% / 消費MP −70% / 開始時招来 習得済み全種'],
  ];
  const DEFINITIONS=Object.fromEntries(rows.map(([job,slot,name,key,note])=>{const family=job+'-'+slot;return [family,{family,job,slot,name,key,note,image:'assets/ui/gems/epic-'+family+'.png'}];}));
  const material={id:MATERIAL,name:'星界の残滓',rarity:'unique',type:'material',image:'assets/ui/gems/goddess-residue.png',note:'女神強化・エピック制作',revealStage:GODDESS};
  function tree(job,slot){
    const root='goddess-root',weapon=slot==='weapon',art='assets/ui/gems/goddess-page.png';
    const nodes=[{id:root,name:'女神の契約',region:'goddess',stage:GODDESS,x:100,y:360,main:true,requires:[],effect:{dedicatedCapacity:2000},cost:{[MATERIAL]:1},icon:'assets/ui/equipment/'+job+'/'+slot+'-goddess.png',note:''}];
    const lanes=[['capacity',weapon?'攻撃容量':'防御容量',weapon?'attackCapacity':'defenseCapacity',100,120],['utility','補助容量','utilityCapacity',100,280],['sp','スキルポイント','skillPoints',3,440],['common','共通容量','commonCapacity',50,600]];
    for(const [lane,name,key,value,y]of lanes)for(let depth=1;depth<=10;depth++)nodes.push({id:'goddess-'+lane+'-'+depth,name:name+' '+depth,region:'goddess',stage:GODDESS,x:280+(depth-1)*180,y,unique:true,requires:[depth===1?root:'goddess-'+lane+'-'+(depth-1)],effect:{[key]:value},cost:{[MATERIAL]:depth},icon:lane==='sp'?art:'assets/ui/progression/'+({capacity:weapon?'attack-gem':'defense-gem',utility:'utility-gem',common:'universal-gem'}[lane])+'.png',note:''});
    return nodes;
  }
  return {GODDESS,MATERIAL,DEFINITIONS,material,tree};
});
