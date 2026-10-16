'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Asset handoff data only; intentionally contains no battle rules or save changes.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp');
const ROOT=path.resolve(__dirname,'../..'),BASE=path.join(ROOT,'public/assets/skills/miko');
const rows=[
 [5,'ember-fox','火狐招来','M1','foxfire'],[10,'healing-butterflies','癒蝶招来','M3','butterfly-wings'],
 [15,'stone-tortoise','岩亀招来','M1','tortoise-dome'],[20,'thunder-crows','雷烏招来','M1','feather-lightning'],
 [25,'swift-wolf','疾狼憑依','M2','spirit-channel'],[30,'white-deer','白鹿招来','M3','flower-column'],
 [35,'bell-owl','鈴梟招来','M1','owl-halo'],[40,'blade-spirit','剣鬼憑依','M2','blade-slash'],
 [45,'guardian-bear','守熊憑依','M2','bear-shield'],[50,'spirit-kagura','総霊神楽','M4','kagura-robes'],
 [55,'flame-wheel','火車招来','M1','flame-wheel-trail'],[60,'spring-carp','泉鯉招来','M3','water-veil'],
 [65,'life-serpent','命蛇憑依','M2','flower-column'],[70,'golden-lion','金獅子招来','M1','lion-claws'],
 [75,'spirit-assault','霊軍進撃','M2','spirit-impact'],[80,'prayer-cranes','祈鶴招来','M1','crane-guard'],
 [85,'twin-possession','双霊憑依','M2','double-robes'],[90,'spirit-channel','霊脈開放','M4','spirit-channel'],
 [95,'nine-tailed-fox','神狐・九尾招来','M4','foxfire'],[100,'myriad-spirit-festival','奥義・万霊神楽','M4','festival-finale'],
];
const motionTypes={
 M1:{prayerCycles:1,finisher:'summon-forward',releaseMs:820,recoveryMs:100,totalMs:1120},
 M2:{prayerCycles:1,finisher:'spirit-send',releaseMs:830,recoveryMs:110,totalMs:1160},
 M3:{prayerCycles:1,finisher:'blessing-up',releaseMs:830,recoveryMs:110,totalMs:1160},
 M4:{prayerCycles:1,rotation:'prayer-release',finisher:'kagura-finish',releaseMs:1260,recoveryMs:180,totalMs:2000},
};
async function build(catalog){const byId=new Map(catalog.assets.map(a=>[a.id,a])),resolve=id=>byId.get(id)?.path||null,icons=path.join(BASE,'icons');makeAssetDirectory(icons,{recursive:true});const skills=[];
 for(const [level,id,name,motionType,effect] of rows){const species=catalog.species.find(s=>s.id===id),guardian=species&&species.kind!=='spirit'?id+'-guardian':species?id+'-idle':null,motion={...motionTypes[motionType]};if(level===100)Object.assign(motion,{prayerCycles:2,releaseMs:1980,totalMs:2720});const source=byId.get(species?id+'-idle':effect);let icon=null;if(source){const dir=path.dirname(path.join(ROOT,'public',source.path)),frame=source.frames[Math.min(1,source.frames.length-1)],b=frame.bounds;await sharp(path.join(dir,frame.file)).extract({left:b.l,top:b.t,width:b.width,height:b.height}).resize(80,80,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).extend({top:8,bottom:8,left:8,right:8,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(icons,id+'.png'));icon='assets/skills/miko/icons/'+id+'.png';}
  skills.push({id,name,level,icon,motion:{...motion,type:motionType,prayer:'assets/miko/motions/prayer/manifest.json',rotation:motion.rotation?'assets/miko/motions/prayer-release/manifest.json':null,finisher:resolve(motion.finisher)},summon:species?{type:species.kind==='spirit'?'possession':'independent',idle:resolve(id+'-idle'),action:resolve(id+'-action'),locomotion:resolve(id+'-walk')||resolve(id+'-roll')||resolve(id+'-idle'),appear:resolve(id+(species.kind==='spirit'?'-appear':'-guardian-appear')),manifest:resolve(guardian),disperse:resolve(id+(species.kind==='spirit'?'-disperse':'-guardian-disperse'))}:null,effects:[resolve(effect),resolve('summon-circle')].filter(Boolean),onHit:species?.role==='attack'?resolve('spirit-impact'):null,castLayers:level===100?['torii-open','torii-loop','torii-close','shrine-domain','kagura-robes','festival-finale']:level===50?['torii-open','torii-loop','torii-close','kagura-robes']:level===90?['torii-open','torii-loop','torii-close','spirit-channel','summon-circle']:level===95?['torii-open','torii-loop','torii-close','summon-circle']:['summon-circle'],visualHeightInHeroHeights:species?.kind==='spirit'?{appear:3.2,sustain:2.5,action:2.5}:id==='nine-tailed-fox'?{appear:5,guardian:3,sprite:0.65}:species?{appear:['white-deer','golden-lion'].includes(id)?4:3,guardian:2.5,sprite:species.kind==='flying'?0.25:0.5}:null});
 }
 const data={version:1,purpose:'次タスクの巫女・遺跡実装に渡す素材対応表。数値バランスは docs/design/miko-skill-design.md を参照。',coordinateSystem:'PNGの左上原点。pivotを接地点または中心に合わせる。Hはキャラ本体の頭頂から接地まで。',sampling:'nearest-neighbor',rendering:{backOpacity:0.42,frontEffectOpacity:0.68,order:['ground crest','guardian / possession / full-body robes behind host','actors and enemies','contact effects in front; keep host faces clear','HP / UI'],largeSilhouette:'サイズは透明セルでなく frames[].bounds の描画高から算出。全身像を縮小せず内部の濃さと重なりを調整。'},skills};writeAssetJson(path.join(BASE,'skill-assets.json'), data);return data;
}
if(require.main===module)build(JSON.parse(fs.readFileSync(require('../lib/project-paths.cjs').developmentAsset('skills/miko/catalog.json'),'utf8'))).then(d=>console.log(JSON.stringify({skills:d.skills.length}))).catch(e=>{console.error(e);process.exitCode=1;});module.exports={build,rows,motionTypes};
