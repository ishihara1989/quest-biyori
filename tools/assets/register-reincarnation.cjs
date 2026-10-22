'use strict';
const fs=require('node:fs'),path=require('node:path');
const {ROOT,runtimeAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
function register(source=ROOT){
  const base=path.join(source,'development/assets/reincarnation-goddess'),out=runtimeAsset('enemies/reincarnation-goddess/motions');
  makeAssetDirectory(out);const motions=[];
  for(const [group,ids] of [['basic-v1/motions',['idle','move','hit','return']],['arsenal-v1/clips',JSON.parse(fs.readFileSync(path.join(base,'arsenal-v1/clips/index.json'),'utf8')).map(c=>c.id)]]){
    for(const id of ids){const src=path.join(base,group,id),dir=path.join(out,id),m=JSON.parse(fs.readFileSync(path.join(src,'manifest.json'),'utf8'));
      makeAssetDirectory(dir);m.previewOnly=false;m.sheet=path.basename(m.sheet);m.frameWidth=m.cell.width;m.frameHeight=m.cell.height;m.frames.forEach((f,i)=>{f.file=path.basename(f.file);f.x=i*m.cell.width;f.y=0;});
      m.frameSequence ||= m.frames.map((_,i)=>i);
      if(group.startsWith('basic'))m.pivot={x:248,y:257};
      for(const file of [m.sheet,...m.frames.map(f=>f.file)])fs.copyFileSync(path.join(src,file),path.join(dir,file));
      writeAssetJson(path.join(dir,'manifest.json'),m);motions.push({id,label:m.label,kind:m.kind==='fx'?'effect':'motion',manifest:id+'/manifest.json'});
    }
  }
  writeAssetJson(path.join(out,'index.json'),motions);
  const icon=path.join(ROOT,'public/assets/ui/enemies/reincarnation-goddess.png');
  fs.copyFileSync(path.join(out,'idle','frame-01.png'),icon);
  console.log('Registered',motions.length,'clips from',base);
}
if(require.main===module)register(process.argv[2]||ROOT);module.exports={register};
