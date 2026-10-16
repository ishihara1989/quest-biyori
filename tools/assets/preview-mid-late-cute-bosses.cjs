'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs');
const path=require('../lib/project-paths.cjs').assetPaths;
const sharp=require('sharp');
const {PNG}=require('pngjs');
const {root}=require('./mid-late-design-spec.cjs');
async function preview(){
  const references=[['desert','lamia'],['volcano','dragon-girl']];
  const layers=[];
  const crops=[];
  for(const [region,id] of references){
    const input=path.join(root,region,'monsters-v3.png');
    const meta=await sharp(input).metadata();
    const left=Math.round(meta.width*2/3),top=Math.round(meta.height/3);
    const width=meta.width-left,height=Math.round(meta.height*2/3)-top;
    const result=await sharp(input).extract({left,top,width,height}).png().toBuffer();
    const pixels=PNG.sync.read(result);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      if((x===0||y===0||x===width-1||y===height-1)&&pixels.data[(y*width+x)*4+3]>12)throw new Error(id+' touches preview edge');
    }
    const output=path.join(root,region,id+'-v3-preview.png');
    fs.writeFileSync(output,result);
    layers.push({input:result,left:layers.length*width,top:0});
    crops.push({id,source:region+'/monsters-v3.png',file:region+'/'+id+'-v3-preview.png',left,top,width,height});
  }
  if(crops[0].width!==crops[1].width||crops[0].height!==crops[1].height)throw new Error('Preview cells have different dimensions');
  await sharp({create:{width:crops[0].width*2,height:crops[0].height,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png().toFile(path.join(root,'cute-bosses-v3-preview.png'));
  writeAssetJson(path.join(root,'cute-bosses-v3-preview.json'), {purpose:'Unscaled static review crops; original pixels and alpha retained; not final game sprites',generation:'built-in image_gen reference edit',motionProduction:'not-started',crops});
  console.log(JSON.stringify({preview:path.join(root,'cute-bosses-v3-preview.png'),crops}));
}
preview().catch(error=>{console.error(error);process.exitCode=1});
