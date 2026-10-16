'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VolcanoData=api;})(globalThis,()=>{
 const enemy=(name,hp,damage,defense,range,speed,interval,common,height,scale,boss=false,majorBoss=false)=>({name,region:9,hp,damage,defense,range,speed,interval,common,height,scale,gold:majorBoss?720:boss?320:52,boss,majorBoss,drop:majorBoss?'dragon-furnace-heart':boss?'volcano-crystal':common});
 const ENEMIES={
  'lava-salamander':enemy('ラヴァサラマンダー',670,46,110,155,73,2600,'fire-lizard-hide',145,.8),
  'obsidian-soldier':enemy('黒曜兵',770,48,140,160,48,2900,'obsidian-blade-shard',170,.7),
  'young-fire-dragon':enemy('幼火竜',550,43,80,390,60,2800,'fire-dragon-scale',155,.72),
  'magma-salamander':enemy('マグマサラマンダー',8400,145,210,230,56,2300,'fire-lizard-hide',225,1.25,true),
  'obsidian-executioner':enemy('黒曜の処刑者',9200,148,255,255,38,2500,'obsidian-blade-shard',255,1.03,true),
  'dragon-girl':enemy('ドラゴンガール',7900,136,165,380,52,2400,'fire-dragon-scale',250,1.04,true),
  dragon:enemy('ドラゴン',16800,182,290,290,34,2600,'fire-lizard-hide',295,1.45,true,true)
 };
 const REGIONS=[{id:9,name:'紅蓮の竜脈',english:'THE CRIMSON DRAGON VEIN',path:'VOLCANO PATH',asset:'crimson-volcano',crystal:'volcano-crystal',rare:'dragon-furnace-heart',prefix:'volcano',intro:'溶岩と竜翼が交わる紅蓮の火口'}];
 const a='lava-salamander',b='obsidian-soldier',c='young-fire-dragon',A='magma-salamander',B='obsidian-executioner',C='dragon-girl',pack=(id,n)=>Array(n).fill(id),mixed=n=>[...pack(a,n),...pack(b,n),...pack(c,n)];
 const names=['火蜥蜴の岩棚','溶岩の巣穴','黒曜の処刑場','竜姫の火口','紅蓮の大群','火傷と黒曜','這う炎と竜翼','斧と竜息','竜脈の三守','紅蓮のドラゴン'];
 const waves=[[mixed(1),mixed(1),mixed(1)],[[...pack(a,5),...pack(b,3)],mixed(2),[A]],[[...pack(b,5),...pack(c,3)],mixed(2),[B]],[[...pack(c,5),...pack(a,3)],mixed(2),[C]],[mixed(5),mixed(5),mixed(5)],[mixed(3),mixed(3),[A],[B]],[mixed(3),mixed(3),[A],[C]],[mixed(3),mixed(3),[B],[C]],[mixed(4),mixed(3),[A],[B],[C]],[[...pack(a,4),...pack(b,7),...pack(c,7)],[A],[B],[C],['dragon']]];
 const STAGES=waves.map((waves,i)=>({id:81+i,name:names[i],waves}));
 const hp=[25,250,238,250,10,105,105,100,62,38];
 const TUNING=Object.fromEntries(STAGES.map((s,i)=>[s.id,{hp:hp[i],damage:s.id===85?1.8:s.id===81?5:38,...s.id===90?{majorBossHp:1.9,majorBossDamage:7.3,majorBossDefense:4400}:{}}]));
 const ITEMS=[['fire-lizard-hide','火蜥蜴の皮','common'],['obsidian-blade-shard','黒曜の刃片','common'],['fire-dragon-scale','火竜の鱗','common'],['volcano-crystal','火山の結晶','uncommon'],['dragon-furnace-heart','ドラゴンの炉心','rare']].map(([id,name,rarity])=>({id,name,rarity,image:'assets/ui/items/'+id+'.png',region:9,type:'material',note:''}));
 const EFFECTS=['bite-impact','axe-arc','claw-arc','fire-fan','fireball','fireball-impact','lava-bomb','lava-impact','lava-pool','heavy-axe-arc','fissure','fire-beam','landing-shock','burn','armor-break'].map(id=>'volcano-'+id);
 return{ENEMIES,REGIONS,STAGES,TUNING,ITEMS,EFFECTS};
});
