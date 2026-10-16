'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DemonCastleData=api;})(globalThis,()=>{
 const enemy=(name,hp,damage,defense,range,speed,interval,common,height,scale,boss=false,majorBoss=false)=>({name,region:10,hp,damage,defense,range,speed,interval,common,height,scale,gold:majorBoss?800:boss?360:58,boss,majorBoss,drop:majorBoss?'demon-god-heart':boss?'castle-crystal':common});
 const ENEMIES={
  'demon-armored-soldier':enemy('魔鎧兵',800,50,160,170,50,2800,'demon-armor-fragment',170,.72),
  imp:enemy('インプ',620,46,100,180,75,2500,'demon-horn',130,.7),
  'dream-demon':enemy('夢魔',600,44,90,360,62,2800,'dream-demon-feather',165,.74),
  'black-knight':enemy('黒騎士',10400,155,280,250,40,2600,'demon-armor-fragment',250,1.05,true),
  'arch-demon':enemy('アークデーモン',9800,148,240,250,44,2500,'demon-horn',260,1.08,true),
  lilith:enemy('リリス',9100,142,195,390,50,2600,'dream-demon-feather',250,1.05,true),
  'demon-god':enemy('魔神',19000,192,320,300,38,2800,'demon-armor-fragment',320,1.15,true,true)
 };
 const REGIONS=[{id:10,name:'宵闇の玉座',english:'THE TWILIGHT THRONE',path:'DEMON CASTLE PATH',asset:'demon-castle',crystal:'castle-crystal',rare:'demon-god-heart',prefix:'castle',intro:'魔腕と宵闇の術式が交わる魔王城'}];
 const a='demon-armored-soldier',b='imp',c='dream-demon',A='black-knight',B='arch-demon',C='lilith',pack=(id,n)=>Array(n).fill(id),mixed=n=>[...pack(a,n),...pack(b,n),...pack(c,n)];
 const names=['魔鎧の城門','黒騎士の回廊','魔炎の広間','宵闇の花園','魔城の軍勢','大剣と魔炎','黒鎧と夢翼','魔炎と静寂','玉座の三守','終焉の魔神'];
 const waves=[[mixed(1),mixed(1),mixed(1)],[[...pack(a,5),...pack(b,3)],mixed(2),[A]],[[...pack(b,5),...pack(c,3)],mixed(2),[B]],[[...pack(c,5),...pack(b,3)],mixed(2),[C]],[mixed(5),mixed(5),mixed(5)],[mixed(3),mixed(3),[A],[B]],[mixed(3),mixed(3),[A],[C]],[mixed(3),mixed(3),[B],[C]],[mixed(4),mixed(3),[A],[B],[C]],[[...pack(a,4),...pack(b,7),...pack(c,7)],[A],[B],[C],['demon-god']]];
 const STAGES=waves.map((waves,i)=>({id:91+i,name:names[i],waves}));
 const hp=[25,300,286,300,10,126,126,120,75,38];
 const TUNING=Object.fromEntries(STAGES.map((s,i)=>[s.id,{hp:hp[i],damage:s.id===95?1.8:s.id===91?5:38,...s.id===100?{majorBossHp:2.25,majorBossDamage:10.35,majorBossDefense:4900}:{}}]));
 const ITEMS=[['demon-armor-fragment','魔鎧の破片','common'],['demon-horn','悪魔の角','common'],['dream-demon-feather','夢魔の羽','common'],['castle-crystal','魔城の結晶','uncommon'],['demon-god-heart','魔神の心核','rare']].map(([id,name,rarity])=>({id,name,rarity,image:'assets/ui/items/'+id+'.png',region:10,type:'material',note:''}));
 const EFFECTS=['curse-orb','curse-impact','dark-slash','sleep-moon','royal-cleave','black-ring','demon-pillar','summon-gate','dark-flower','demon-impact','silence-seal','curse-mark','cross-beam','end-ring','armor-break','burn','claw'].map(id=>'castle-'+id);
 return{ENEMIES,REGIONS,STAGES,TUNING,ITEMS,EFFECTS};
});
