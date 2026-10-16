'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RuinsData=api;})(globalThis,()=>{
  const enemy=(name,hp,damage,defense,range,speed,interval,common,height,boss=false,majorBoss=false,flying=false)=>({name,region:5,hp,damage,defense,range,speed,interval,common,height,scale:.72,gold:majorBoss?400:boss?180:28,boss,majorBoss,flying,drop:majorBoss?'ancient-core':boss?'ruins-crystal':common});
  const ENEMIES={
    'stone-guard':enemy('石の衛兵',1000,66,110,140,50,2600,'ancient-stone',145),
    'rune-gargoyle':enemy('ルーンガーゴイル',800,60,65,145,78,2400,'ancient-stone',145,false,false,true),
    'ancient-crossbowman':enemy('古代の弩兵',620,60,40,430,38,2900,'bronze-gear',138),
    'floating-magic-core':enemy('浮遊魔導器',580,62,50,460,36,3000,'magic-shard',122,false,false,true),
    'armored-golem':enemy('重装ゴーレム',4200,100,180,220,30,2900,'ancient-stone',230,true),
    'ancient-ballista':enemy('古代弩砲兵',3500,95,100,500,26,3100,'bronze-gear',220,true),
    seraphina:enemy('魔導人形セラフィナ',3700,90,120,480,30,3000,'magic-shard',225,true),
    'ancient-titan':enemy('古代機兵タイタン',8200,115,200,320,24,2700,'bronze-gear',295,true,true)
  };
  const REGIONS=[{id:5,name:'古代遺跡',english:'THE ANCIENT RUINS',path:'RUINS PATH',asset:'ancient-ruins',crystal:'ruins-crystal',rare:'ancient-core',prefix:'ruins',intro:'神々の眠る石門へ'}];
  const pack=(id,n)=>Array(n).fill(id),g='stone-guard',r='rune-gargoyle',b='ancient-crossbowman',c='floating-magic-core',G='armored-golem',B='ancient-ballista',C='seraphina';
  const mixed=n=>[...pack(g,n),...pack(r,n),...pack(b,n),...pack(c,n)];
  const names=['目覚める石門','守護像の回廊','魔導の参道','守護姫の祭壇','石像兵の大群','青銅の防衛線','石と魔力の守り手','交差する射線','神殿の守護者','古代炉心'];
  const waves=[Array.from({length:3},()=>[g,b,c]),
    [[...pack(g,4),...pack(b,3)],[...pack(g,4),...pack(b,4)],[G]],
    [[...pack(r,4),...pack(c,4)],[...pack(r,3),...pack(b,3),...pack(c,3)],[B]],
    [[...pack(r,4),...pack(c,4)],[...pack(r,4),...pack(c,5)],[C]],
    Array.from({length:3},()=>[...pack(g,5),...pack(b,5),...pack(c,5)]),
    [[...pack(g,5),...pack(b,5)],[G],[B]],
    [[...pack(g,4),...pack(r,4),...pack(c,4)],[G],[C]],
    [[...pack(r,4),...pack(b,4),...pack(c,4)],[B],[C]],
    [mixed(3),[G,B],[C]],
    [mixed(3),[G,B,C],['ancient-titan']]];
  const STAGES=waves.map((waves,i)=>({id:41+i,name:names[i],waves}));
  const TUNING={
    41: { hp: 15, damage: 3 },
    42: { hp: 45, damage: 11.2, formation: 'separate-bosses', waveCount: 5 },
    43: { hp: 41.6, damage: 11.2, formation: 'separate-bosses', waveCount: 5 },
    44: { hp: 40, damage: 11.2, formation: 'separate-bosses', waveCount: 5 },
    45: { hp: 5, damage: 1 },
    46: { hp: 28, damage: 14, formation: 'separate-bosses', waveCount: 5 },
    47: { hp: 28, damage: 15, formation: 'separate-bosses', waveCount: 5 },
    48: { hp: 35, damage: 11.2, formation: 'separate-bosses', waveCount: 5 },
    49: { hp: 28, damage: 10.4, formation: 'separate-bosses', waveCount: 5 },
    50: { hp: 8, damage: 22, formation: 'separate-bosses', waveCount: 5, majorBossHp: 2, majorBossDefense: 3000 },
  };
  const ITEMS=[['ancient-stone','古代石片','common'],['bronze-gear','青銅歯車','common'],['magic-shard','魔導片','common'],['ruins-crystal','遺跡の結晶','uncommon'],['ancient-core','古代炉心','rare']].map(([id,name,rarity])=>({id,name,rarity,image:'assets/ui/ruins/icons/'+id+'.png',region:5,type:'material',note:rarity==='rare'?'タイタンの素材':'古代遺跡の素材'}));
  const EFFECTS=['stone-slash','rune-claw','rune-shock','infantry-bolt','magic-bolt','magic-burst','stone-impact','golem-sweep','heavy-bolt','bronze-impact','seraph-light','ring-blade','light-pillar','recharge','cannon-shell','furnace-beam','magic-quake','vent-steam'].map(id=>'ruins-'+id);
  return {ENEMIES,REGIONS,STAGES,TUNING,ITEMS,EFFECTS};
});
