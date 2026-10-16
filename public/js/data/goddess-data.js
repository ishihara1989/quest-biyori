'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GoddessData=api;})(globalThis,()=>{
  const ID='extradimensional-goddess', ASSET='assets/enemies/extradimensional-goddess/';
  const ENEMIES={[ID]:{name:'異次元の女神',goddess:true,region:10,boss:true,majorBoss:true,hp:2.5e9,damage:850000,defense:4900,speed:0,range:1000,interval:3000,height:238,scale:1,gold:18000,noMaterials:true}};
  const STAGE=Object.freeze({id:ID,revealStage:ID,name:'異次元の女神',realmName:'界外の御座',english:'BEYOND THE LAST GATE',special:true,final:true,unlockStage:'chaos-gate',unlockLabel:'混沌の門',region:10,number:1,level:100,xpStage:100,dropLevel:10,gemMultiplier:1,gemRates:{legendary:.10,epic:.01},materialRegions:[],asset:'assets/stages/extradimensional-goddess/',reward:30000,enemyHp:1,enemyDamage:1,majorBossHp:1,majorBossDamage:1,majorBossDefense:4900,timeLimit:180000,waves:[[ID]],enemies:[ID],total:1});
  // Display-only echoes. Their original AI, HP, summons and drops never run.
  const PHANTOMS=[
    ['alraune','vine-slam','蔓叩き','circle','root',null,370],['treant','root-bury','根の突き上げ','circles','root','root-eruption',340],
    ['lich','dark-cast','闇の大魔法','circle','curse','lich-dark-magic',420],['hydra','breath','毒ブレス','lane','poison','hydra-poison-breath',180],
    ['arachne','web','糸の術','circles','root','spider-web-slow',380],['cave-troll','slam','三連叩きつけ','triple',null,'cave-quake',500],
    ['scylla','tentacle','触手薙ぎ','sector',null,'sea-slam',440],['kraken','breath','水ブレス','lane',null,'water-breath',500],
    ['seraphina','pillars','三連光柱','triple',null,'ruins-light-pillar',840],['ancient-titan','beam','炉心ビーム','beam',null,'ruins-furnace-beam',660],
    ['lamia','binds','砂縛り','circles','sand','desert-sand-burst',1200],['sand-behemoth','quake','地割れ','cross',null,'desert-fissure',1500],
    ['harpy-queen','ring','風の円','annulus','push','highland-wind-ring',1200],['manticore','venom','毒尾の扇射','sector','poison','highland-venom',1400],
    ['yuki-onna','seal','薄氷の封輪','circles','freeze','glacier-seal',4600],['ice-tusk-mammoth','crown','白夜の氷冠','annulus',null,'glacier-crown',7400],
    ['dragon-girl','danger-2','紅翼竜息','lane','burn','volcano-fire-beam',5700],['dragon','danger-2','双脈ブレス','cross','burn','volcano-fire-beam',6000],
    ['lilith','danger-1','宵闇の花冠','triple','curse','castle-dark-flower',6600],['demon-god','danger-4','終焉の交差','cross',null,'castle-cross-beam',6800]
  ].map(([id,motion,name,kind,status,effect,release],i)=>({id,motion,name,kind,status,effect,release,region:Math.floor(i/2)+1,major:i%2===1}));
  const DANGERS=[{name:'界面断裂',motion:'rift',warn:5000,offsets:[0,900],kind:'cross',rest:3500},{name:'天環の裁定',motion:'wave',warn:5400,offsets:[0,1000,2000],kind:'rings',rest:4000},{name:'零界収束',motion:'ultimate',warn:6200,offsets:[0],kind:'zero',rest:4500}];
  return {ID,ASSET,ENEMIES,STAGE,PHANTOMS,DANGERS};
});
