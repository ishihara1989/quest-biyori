'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'../../public/assets/ui/ruins'),source=path.join(root,'source/inventory-atlas-v1.png');
// Generated objects do not align perfectly with equal cells. Cuts follow the empty gutters.
const cells=[
  ['ancient-stone',0,0,312,627],['bronze-gear',312,0,362,627],
  ['magic-shard',674,0,262,627],['ruins-crystal',936,0,318,627],
  ['ancient-core',0,627,329,627],['miko-gohei',329,627,293,627],['miko-robe',622,627,357,627]
];
(async()=>{const metadata=await sharp(source).metadata();if(!metadata.hasAlpha||metadata.width!==1254||metadata.height!==1254)throw Error('Unexpected source atlas; preserve its native size and alpha');
  makeAssetDirectory(path.join(root,'icons'),{recursive:true});const icons=[];
  for(const [id,left,top,width,height]of cells){const file='icons/'+id+'.png';
    const cropped=await sharp(source).extract({left,top,width,height}).png().toBuffer();
    await sharp(cropped).trim({threshold:8})
      .resize(116,116,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}})
      .extend({top:6,bottom:6,left:6,right:6,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(root,file));
    icons.push({id,file,width:128,height:128,crop:{left,top,width,height}});
  }
  const manifest={source:'source/inventory-atlas-v1.png',sourceWidth:metadata.width,sourceHeight:metadata.height,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),sampling:'nearest-neighbor',transparent:true,padding:6,icons};
  writeAssetJson(path.join(root,'manifest.json'), manifest);
  await sharp({create:{width:128*icons.length,height:128,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
    .composite(icons.map((icon,i)=>({input:path.join(root,icon.file),left:i*128,top:0}))).png().toFile(path.join(root,'review.png'));
  console.log('Built seven transparent ruins and miko UI icons.');
})().catch(e=>{console.error(e);process.exitCode=1;});
