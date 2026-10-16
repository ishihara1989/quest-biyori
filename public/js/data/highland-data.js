'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HighlandData=api;})(globalThis,()=>{
 const enemy=(name,hp,damage,defense,range,speed,interval,common,height,boss=false,majorBoss=false)=>({name,region:7,hp,damage,defense,range,speed,interval,common,height,scale:.72,gold:majorBoss?560:boss?245:40,boss,majorBoss,drop:majorBoss?'manticore-tail':boss?'highland-crystal':common});
 const ENEMIES={
  'horn-jackal':enemy('ホーンジャッカル',540,38,90,145,80,2400,'horn-beast-fang',150),
  'rock-horn-goat':enemy('岩角ヤギ',600,39,110,155,65,2700,'rock-horn-fragment',160),
  'wind-sprite':{...enemy('風の小精霊',430,36,60,390,65,2800,'wind-spirit-feather',150),flying:true},
  'storm-jackal':enemy('ストームジャッカル',6600,118,165,190,65,1900,'horn-beast-fang',195,true),
  'iron-horn':enemy('アイアンホーン',7000,120,200,220,40,2000,'rock-horn-fragment',225,true),
  'harpy-queen':{...enemy('ハーピークイーン',6300,112,125,350,45,1900,'wind-spirit-feather',225,true),flying:true},
  manticore:enemy('マンティコア',12000,145,220,240,42,2000,'wind-spirit-feather',265,true,true)
 };
 const REGIONS=[{id:7,name:'嵐渡りの高原',english:'THE STORM HIGHLANDS',path:'HIGHLAND PATH',asset:'storm-highland',crystal:'highland-crystal',rare:'manticore-tail',prefix:'highland',intro:'風と雷が渡る獣の高原'}];
 const a='horn-jackal',b='rock-horn-goat',c='wind-sprite',A='storm-jackal',B='iron-horn',C='harpy-queen',pack=(id,n)=>Array(n).fill(id),mixed=n=>[...pack(a,n),...pack(b,n),...pack(c,n)];
 const names=['角獣の草原','雷獣の疾走','鉄角の断崖','翼姫の風峰','高原の大群','牙と鉄角','雷獣と翼','岩角と風羽','三つの嵐','人面獅子の毒尾'];
 const waves=[[mixed(1),mixed(1),mixed(1)],[[...pack(a,5),...pack(b,3)],mixed(2),[A]],[[...pack(b,5),...pack(c,3)],mixed(2),[B]],[[...pack(c,5),...pack(a,3)],mixed(2),[C]],[mixed(5),mixed(5),mixed(5)],[mixed(3),mixed(3),[A],[B]],[mixed(3),mixed(3),[A],[C]],[mixed(3),mixed(3),[B],[C]],[mixed(4),mixed(3),[A],[B],[C]],[mixed(4),[A],[B],[C],['manticore']]];
 const STAGES=waves.map((waves,i)=>({id:61+i,name:names[i],waves}));
 const hpRates=[20,122,115,120,8,72,70,70,50,34];
 const TUNING=Object.fromEntries(STAGES.map((s,i)=>[s.id,{hp:hpRates[i],damage:s.id===65?1.8:s.id===61?5:38,...s.id===70?{majorBossHp:1.35,majorBossDamage:1.8,majorBossDefense:2400}:{}}]));
 const ITEMS=[['horn-beast-fang','角獣の牙','common'],['rock-horn-fragment','岩角の欠片','common'],['wind-spirit-feather','風精の羽','common'],['highland-crystal','高原の結晶','uncommon'],['manticore-tail','マンティコアの毒尾','rare']].map(([id,name,rarity])=>({id,name,rarity,image:'assets/ui/items/'+id+'.png',region:7,type:'material',note:''}));
 const EFFECTS=['wind-blade','feather','wind-ring','wind-gust','venom','claw','charge-impact','rock-shards','bite-impact','horn-sweep'].map(id=>'highland-'+id);
 return{ENEMIES,REGIONS,STAGES,TUNING,ITEMS,EFFECTS};
});
