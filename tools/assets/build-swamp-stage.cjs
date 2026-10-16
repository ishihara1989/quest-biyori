'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Keep generated pixels intact; the renderer handles horizontal mirror repetition.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const {PNG}=require(require.resolve('pngjs',{paths:[__dirname,path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')]}));
const root=path.resolve(__dirname,'../../public/assets/stages'),dir=path.join(root,'poison-swamp');
const forest=JSON.parse(fs.readFileSync(path.join(root,'starting-forest/manifest.json'),'utf8'));
const jobs=JSON.parse(fs.readFileSync(path.join(__dirname,'../../development/records/swamp-revision-generation.json'),'utf8'));
const layers=['distant','ground-near'].map((id,index)=>{
  const file='swamp-'+id+'.png',source='source/swamp-'+id+'-generated-v1.png';
  const data=fs.readFileSync(path.join(dir,source)),image=PNG.sync.read(data);
  fs.writeFileSync(path.join(dir,file),data);
  return {id,label:index?'地面＋近景':'遠景',file,width:image.width,height:image.height,alpha:!!index,parallax:index?1:.28,source};
});
const manifest={schemaVersion:1,id:'poison-swamp',label:'毒の沼地',generation:'built-in image_gen',sampling:'nearest-neighbor',
  coordinateSystem:{...forest.coordinateSystem},repeat:{...forest.repeat},layers,
  notes:['Same stage rectangle and recommended contact lane as starting-forest (1024×576, Y323–512).',
    'Draw distant, ground-near, then actors sorted by foot Y. Upper near-layer gaps have genuine transparency.',
    'Alternate mirrored tiles independently per layer for seamless parallax. Source RGBA is preserved.',
    'The battle preview uses the forest combat movement bounds, Y334–501.']};
writeAssetJson(path.join(dir,'manifest.json'), manifest);
fs.writeFileSync(path.join(dir,'PROMPT.md'),'# 毒の沼地 / 背景レイヤー\n\n組み込み image_gen。森の対応レイヤーを画風・地面配置のリファレンスとして使用。原画のRGBAと寸法を変更せず採用。\n\n'+layers.map((layer,i)=>'## '+layer.label+'\n\n'+jobs.find(j=>j.id===(i?'swamp-ground-near':'swamp-distant')).prompt+'\n').join('\n'));
console.log(JSON.stringify({stage:manifest.id,layers,coordinateSystem:manifest.coordinateSystem}));
