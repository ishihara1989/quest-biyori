'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[__dirname,bundled]}));
const {enemies}=require('./swamp-specs.cjs'),out=path.resolve(__dirname,'../../output/swamp');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));makeAssetDirectory(out,{recursive:true});
(async()=>{for(const e of enemies){const base=path.resolve(__dirname,'../../public/assets/enemies',e.id,'motions');if(!fs.existsSync(path.join(base,'index.json')))continue;
  const motions=read(path.join(base,'index.json')),items=[],width=1320,rowHeight=200;
  for(const [row,entry] of motions.entries()){const dir=path.join(base,entry.id),m=read(path.join(dir,'manifest.json'));
    const left=Math.min(...m.frames.map(f=>f.bounds.left)),top=Math.min(...m.frames.map(f=>f.bounds.top)),right=Math.max(...m.frames.map(f=>f.bounds.right)),bottom=Math.max(...m.frames.map(f=>f.bounds.bottom));
    items.push({input:Buffer.from('<svg width="1320" height="28"><text x="12" y="21" fill="#b8d69b" font-size="17" font-family="sans-serif">'+e.id+' / '+entry.id+'</text></svg>'),left:0,top:row*rowHeight});
    for(const f of m.frames){const img=await sharp(path.join(dir,f.file)).extract({left,top,width:right-left+1,height:bottom-top+1}).resize(210,160,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();items.push({input:img,left:f.index*220,top:row*rowHeight+30});}
  }
  await sharp({create:{width,height:rowHeight*motions.length,channels:4,background:'#17211d'}}).composite(items).png().toFile(path.join(out,e.id+'-frames.png'));
}console.log(out);})().catch(error=>{console.error(error);process.exitCode=1;});
