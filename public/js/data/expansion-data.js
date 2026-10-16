'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExpansionData=api;})(globalThis,()=>{
  const enemy=(name,region,hp,damage,range,speed,interval,common,size,boss=false,majorBoss=false)=>({name,region,hp,damage,range,speed,interval,common,scale:.72,height:size*.72,gold:majorBoss?240:boss?110:20,boss,majorBoss,drop:majorBoss?(region===3?'troll-stone':'kraken-pearl'):boss?(region===3?'cave-crystal':'coast-crystal'):common});
  const ENEMIES={
    'cave-bat':enemy('コウモリ',3,380,25,125,105,1600,'bat-fang',100),
    'great-bat':enemy('大コウモリ',3,1900,40,190,82,2100,'bat-fang',190,true),
    'cave-worm':enemy('ワーム',3,470,28,125,58,1700,'worm-shell',115),
    'large-worm':enemy('ラージワーム',3,2350,42,200,38,2350,'worm-shell',205,true),
    'cave-spider':enemy('蜘蛛',3,410,25,220,86,1900,'spider-silk',112),
    arachne:enemy('アラクネ',3,2150,40,290,52,2200,'spider-silk',260,true),
    'cave-troll':enemy('ケイブトロール',3,4500,48,225,28,2600,'worm-shell',300,true,true),
    'hermit-crab':enemy('ヤドカリ',4,650,35,125,58,1700,'crab-shell',100),
    'great-hermit':enemy('オオヤドカリ',4,2700,52,190,42,2300,'crab-shell',200,true),
    lizardman:enemy('リザードマン',4,670,38,190,95,1600,'lizard-scale',155),
    'lizard-chief':enemy('ボスリザードマン',4,3100,56,225,70,2200,'lizard-scale',225,true),
    octopus:enemy('タコ',4,610,34,190,62,1900,'octopus-ink',120),
    scylla:enemy('スキュラ',4,2850,48,300,44,2400,'octopus-ink',245,true),
    kraken:enemy('クラーケン',4,6200,62,265,24,2700,'octopus-ink',300,true,true),
  };
  const REGIONS=[{id:3,name:'洞窟',english:'THE ECHO CAVERN',path:'CAVERN PATH',asset:'echo-cave',crystal:'cave-crystal',rare:'troll-stone',prefix:'cave',intro:'暗闇の奥へ'},
    {id:4,name:'海岸',english:'THE SUNLIT COAST',path:'COAST PATH',asset:'sunlit-coast',crystal:'coast-crystal',rare:'kraken-pearl',prefix:'coast',intro:'潮騒の先へ'}];
  const names=[['羽音の入口','吸血の天井','蠢く岩道','蜘蛛の巣窟','洞窟の大群','牙と外殻','糸と羽音','地底の罠','暗闇の守り手','巨棍の深穴'],
    ['貝殻の砂浜','大殻の入り江','鱗の浅瀬','海魔の潮溜まり','海岸の大群','甲殻と鱗','泡と貝殻','槍と触手','潮騒の守り手','深海の巨影']];
  const pack=(id,count)=>Array(count).fill(id);
  function stages(region,a,A,b,B,c,C,boss){const waves=[
    Array.from({length:3},()=>[a,b,c]),
    [pack(a,5),pack(a,6),[A,...pack(a,3)]],
    [pack(b,4),pack(b,5),[B,...pack(b,3)]],
    [pack(c,4),pack(c,5),[C,...pack(c,3)]],
    Array.from({length:3},()=>[...pack(a,4),...pack(b,4),...pack(c,4)]),
    [[...pack(a,4),...pack(b,3)],[A,...pack(b,4)],[B,...pack(a,5)]],
    [[...pack(a,4),...pack(c,3)],[A,...pack(c,4)],[C,...pack(a,5)]],
    [[...pack(b,4),...pack(c,3)],[B,...pack(c,4)],[C,...pack(b,4)]],
    [[a,b,c,...pack(a,3)],[A,B,...pack(c,3)],[C,a,b,c]],
    [[a,b,c,...pack(b,3)],[A,B,C,c],[boss,a,b,c]],
  ];return waves.map((waves,i)=>({id:(region-1)*10+i+1,name:names[region-3][i],waves}));}
  const STAGES=[...stages(3,'cave-bat','great-bat','cave-worm','large-worm','cave-spider','arachne','cave-troll'),...stages(4,'hermit-crab','great-hermit','lizardman','lizard-chief','octopus','scylla','kraken')];
  const ITEMS=[['bat-fang','コウモリの牙',3],['worm-shell','ワームの外殻',3],['spider-silk','蜘蛛の糸',3],['cave-crystal','洞窟の結晶',3,'uncommon'],['troll-stone','トロールの巨岩',3,'rare'],
    ['crab-shell','ヤドカリの殻',4],['lizard-scale','リザードの鱗',4],['octopus-ink','タコの墨袋',4],['coast-crystal','海岸の結晶',4,'uncommon'],['kraken-pearl','クラーケンの真珠',4,'rare']]
    .map(([id,name,region,rarity='common'])=>({id,name,region,rarity,type:'material',note:name}));
  const EFFECTS=['bat-sonic','vampire-drain','spider-web-bolt','spider-web-slow','arachne-claw-bolt','rock-bolt','earth-debris','cave-quake','worm-tail','sea-ink','ink-blind','sea-bubble-bolt','bubble-prison','kraken-tentacle','water-breath','sea-slam'];
  return {ENEMIES,STAGES,REGIONS,ITEMS,EFFECTS};
});
