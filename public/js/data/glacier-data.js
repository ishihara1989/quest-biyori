'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GlacierData=api;})(globalThis,()=>{
 const enemy=(name,hp,damage,defense,range,speed,interval,common,height,boss=false,majorBoss=false)=>({name,region:8,hp,damage,defense,range,speed,interval,common,height,scale:.9,gold:majorBoss?640:boss?280:46,boss,majorBoss,drop:majorBoss?'mammoth-ice-tusk':boss?'glacier-crystal':common});
 const ENEMIES={
  'frost-wolf':enemy('フロストウルフ',600,42,100,150,78,2600,'ice-wolf-fang',145),
  'ice-shell-golem':enemy('氷殻ゴーレム',690,44,125,155,43,2900,'ice-shell-fragment',175),
  'snow-spirit':{...enemy('雪の精',490,39,70,390,58,2800,'snow-spirit-flower',140),flying:true},
  fenrir:enemy('フェンリル',7500,132,190,210,66,2100,'ice-wolf-fang',220,true),
  'crystal-golem':enemy('クリスタルゴーレム',8200,135,230,245,32,2400,'ice-shell-fragment',250,true),
  'yuki-onna':{...enemy('雪女',7100,124,145,380,44,2300,'snow-spirit-flower',240,true),flying:true},
  'ice-tusk-mammoth':enemy('氷牙マンモス',15000,165,260,280,30,2500,'snow-spirit-flower',270,true,true)
 };
 const REGIONS=[{id:8,name:'蒼氷の聖域',english:'THE GLACIAL SANCTUARY',path:'GLACIER PATH',asset:'glacial-sanctuary',crystal:'glacier-crystal',rare:'mammoth-ice-tusk',prefix:'glacier',intro:'蒼氷と白夜が包む巨獣の聖域'}];
 const a='frost-wolf',b='ice-shell-golem',c='snow-spirit',A='fenrir',B='crystal-golem',C='yuki-onna',pack=(id,n)=>Array(n).fill(id),mixed=n=>[...pack(a,n),...pack(b,n),...pack(c,n)];
 const names=['雪狼の小道','蒼牙の雪原','氷晶の巨腕','雪華の封域','氷河の大群','蒼牙と晶拳','狼と雪女','晶壁と雪華','三つの氷冠','白夜の氷牙'];
 const waves=[[mixed(1),mixed(1),mixed(1)],[[...pack(a,5),...pack(b,3)],mixed(2),[A]],[[...pack(b,5),...pack(c,3)],mixed(2),[B]],[[...pack(c,5),...pack(a,3)],mixed(2),[C]],[mixed(5),mixed(5),mixed(5)],[mixed(3),mixed(3),[A],[B]],[mixed(3),mixed(3),[A],[C]],[mixed(3),mixed(3),[B],[C]],[mixed(4),mixed(3),[A],[B],[C]],[mixed(4),[A],[B],[C],['ice-tusk-mammoth']]];
 const STAGES=waves.map((waves,i)=>({id:71+i,name:names[i],waves}));
 const hp=[22,180,170,180,9,75,75,72,55,34];
 const TUNING=Object.fromEntries(STAGES.map((s,i)=>[s.id,{hp:hp[i],damage:s.id===75?1.8:s.id===71?5:38,...s.id===80?{majorBossHp:1.6,majorBossDamage:5,majorBossDefense:4000}:{}}]));
 const ITEMS=[['ice-wolf-fang','氷狼の牙','common'],['ice-shell-fragment','氷殻の欠片','common'],['snow-spirit-flower','雪精の花','common'],['glacier-crystal','氷河の結晶','uncommon'],['mammoth-ice-tusk','マンモスの氷牙','rare']].map(([id,name,rarity])=>({id,name,rarity,image:'assets/ui/items/'+id+'.png',region:8,type:'material',note:''}));
 const EFFECTS=['bite','punch','cold','ring','pillar','armor','seal','sweep','quake','boulder','crown'].map(id=>'glacier-'+id);
 return{ENEMIES,REGIONS,STAGES,TUNING,ITEMS,EFFECTS};
});
