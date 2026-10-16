'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs');
const path=require('../lib/project-paths.cjs').assetPaths;
const {root,assets}=require('./mid-late-design-spec.cjs');
const records=JSON.parse(fs.readFileSync(path.join(root,'generation-input.json'),'utf8'));
const saved=[];
for(const record of records){
  const a=assets.find(a=>a.id===record.id);
  if(!a)throw new Error('Unknown asset '+record.id);
  const input=path.resolve(record.source);
  if(!input.toLowerCase().endsWith('.png')||!fs.existsSync(input))throw new Error('Missing PNG '+input);
  const version=record.version||1;
  const file=version===1?a.file:`${a.region}/${a.kind}-v${version}.png`;
  const target=path.join(root,file),sourceCopy=path.join(root,a.region,'source',a.kind+'-generated-v'+version+'.png');
  if(fs.existsSync(target)&&!fs.readFileSync(target).equals(fs.readFileSync(input)))throw new Error('Refusing to replace '+target);
  fs.copyFileSync(input,sourceCopy);fs.copyFileSync(input,target);
  saved.push({id:version===1?a.id:a.id+'-v'+version,assetId:a.id,kind:a.kind,file,source:`${a.region}/source/${a.kind}-generated-v${version}.png`,generatedPath:input,prompt:record.prompt||a.prompt,transparentBackground:a.transparent,generation:'built-in image_gen',version,reference:record.reference||null});
}
const previousFile=path.join(root,'generation.json');
const previous=fs.existsSync(previousFile)?JSON.parse(fs.readFileSync(previousFile,'utf8')).assets:[];
const all=[...previous.filter(a=>!saved.some(b=>b.id===a.id)),...saved];
writeAssetJson(previousFile, {date:'2026-10-11 JST',mode:'built-in image_gen',motionProduction:'not-started',assets:all});
console.log(JSON.stringify({imported:saved.map(a=>a.id),total:all.length}));
