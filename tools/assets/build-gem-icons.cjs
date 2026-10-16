'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths, sharp = require('sharp');
const output = path.resolve(__dirname, '../../public/assets/ui/gems');
const source = path.join(output, 'source', 'gem-ui-atlas-v1.png');
const names = ['legendary','treasure','interference','shard-rare','shard-unique','shard-legendary','forge','upgrade','convert'];
(async () => {
  makeAssetDirectory(path.dirname(source), { recursive: true });
  if (process.argv[2]) fs.copyFileSync(path.resolve(process.argv[2]), source);
  const meta = await sharp(source).metadata();
  if (!meta.hasAlpha) throw new Error('Generated atlas must preserve transparent alpha');
  for (const [i, name] of names.entries()) {
    const col = i % 3, row = Math.floor(i / 3);
    const left = Math.floor(col * meta.width / 3), top = Math.floor(row * meta.height / 3);
    const width = Math.floor((col + 1) * meta.width / 3) - left, height = Math.floor((row + 1) * meta.height / 3) - top;
    const tile = await sharp(source).extract({left,top,width,height}).png().toBuffer();
    const { data, info } = await sharp(tile).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let x1=width,y1=height,x2=-1,y2=-1,transparent=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const a=data[(y*width+x)*info.channels+3];if(a<8)transparent++;if(a>16){x1=Math.min(x1,x);y1=Math.min(y1,y);x2=Math.max(x2,x);y2=Math.max(y2,y);}}
    if(x2<0||transparent<width*height*.05)throw new Error('Missing icon or transparency: '+name);
    await sharp(tile).extract({left:x1,top:y1,width:x2-x1+1,height:y2-y1+1}).resize(112,112,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
      .extend({top:8,bottom:8,left:8,right:8,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(output,name+'.png'));
  }
  writeAssetJson(path.join(output,'manifest.json'), {source:'source/gem-ui-atlas-v1.png',generator:'built-in image_gen',icons:names.map(name=>name+'.png')});
  console.log('Verified 9 transparent 128px gem icons');
})().catch(error=>{console.error(error);process.exitCode=1;});
