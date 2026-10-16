'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DesertData=api;})(globalThis,()=>{
  const enemy=(name,hp,damage,defense,range,speed,interval,common,height,boss=false,majorBoss=false)=>({name,region:6,hp,damage,defense,range,speed,interval,common,height,scale:.72,gold:majorBoss?480:boss?210:34,boss,majorBoss,drop:majorBoss?'behemoth-horn':boss?'desert-crystal':common});
  const ENEMIES={
    'sand-scorpion':enemy('サンドスコーピオン',500,35,85,140,65,2300,'scorpion-pincer',120),
    'bandage-soldier':enemy('包帯兵',450,34,75,155,62,2600,'ancient-bandage',148),
    'sand-snake':enemy('砂蛇',380,33,45,410,58,2700,'sand-snake-scale',125),
    'obsidian-scorpion':enemy('オブシディアンスコーピオン',6000,108,150,195,42,1800,'scorpion-pincer',205,true),
    'golden-pharaoh':enemy('黄金のファラオ',6000,100,110,450,30,1700,'ancient-bandage',215,true),
    lamia:enemy('ラミア',5800,98,95,400,40,1800,'sand-snake-scale',220,true),
    'sand-behemoth':enemy('砂喰いベヒモス',10800,130,200,250,32,1800,'ancient-bandage',280,true,true)
  };
  const REGIONS=[{id:6,name:'金砂の墓域',english:'THE GOLDEN NECROPOLIS',path:'DESERT PATH',asset:'golden-desert',crystal:'desert-crystal',rare:'behemoth-horn',prefix:'desert',intro:'黄金の砂に眠る王たち'}];
  const a='sand-scorpion',b='bandage-soldier',c='sand-snake',A='obsidian-scorpion',B='golden-pharaoh',C='lamia',pack=(id,n)=>Array(n).fill(id),mixed=n=>[...pack(a,n),...pack(b,n),...pack(c,n)];
  const names=['砂丘への一歩','黒曜の鋏','黄金の埋葬路','蛇姫のオアシス','金砂の大群','鋏と王笏','毒針と蛇尾','墓域の魔陣','三王の眠り','砂を喰らう獣'];
  // Bosses have separate waves; stage 1/5 are recovery routes. Base drops alone fund gear.
  const waves=[[mixed(1),mixed(1),mixed(1)],
    [[...pack(a,5),...pack(b,3)],mixed(2),[A]],
    [[...pack(b,5),...pack(c,3)],mixed(2),[B]],
    [[...pack(c,5),...pack(a,3)],mixed(2),[C]],
    [mixed(5),mixed(5),mixed(5)],
    [mixed(3),mixed(3),[A],[B]],
    [mixed(3),mixed(3),[A],[C]],
    [mixed(3),mixed(3),[B],[C]],
    [mixed(4),mixed(3),[A],[B],[C]],
    [mixed(4),[A],[B],[C],['sand-behemoth']]];
  const STAGES=waves.map((waves,i)=>({id:51+i,name:names[i],waves}));
  const hpRates=[14,85,90,100,6,55,52,53,39,26];
  const TUNING=Object.fromEntries(STAGES.map((s,i)=>[s.id,{hp:hpRates[i],damage:s.id===55?1.4:s.id===51?4:28,...s.id===60?{majorBossHp:1.35,majorBossDamage:1.7,majorBossDefense:2000}:{}}]));
  const ITEMS=[['scorpion-pincer','砂蠍の鋏','common'],['ancient-bandage','古代の包帯','common'],['sand-snake-scale','砂蛇の鱗','common'],['desert-crystal','砂漠の結晶','uncommon'],['behemoth-horn','ベヒモスの角','rare']].map(([id,name,rarity])=>({id,name,rarity,image:'assets/ui/items/'+id+'.png',region:6,type:'material',note:''}));
  const EFFECTS=['desert-sand-burst','desert-venom','desert-royal-wave','desert-fissure'];
  return {ENEMIES,REGIONS,STAGES,TUNING,ITEMS,EFFECTS};
});
