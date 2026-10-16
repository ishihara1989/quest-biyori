'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
// Review generated frames in chronological order; this only composes existing pixels.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[__dirname,bundled]})),{enemies,effects,materials}=require('./expansion-specs.cjs');
const root=path.resolve(__dirname,'../../public'),output=path.resolve(__dirname,'../../output/expansion/contacts');makeAssetDirectory(output,{recursive:true});
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
async function rows(name,definitions){const width=1140,height=definitions.length*170,inputs=[];
  for(const [row,d]of definitions.entries()){const m=read(path.join(d.dir,'manifest.json'));inputs.push({input:Buffer.from('<svg width="1140" height="22"><text x="8" y="17" font-family="Arial" font-size="14" fill="#dde7f0">'+d.id+' / '+m.durationMs+'ms</text></svg>'),left:0,top:row*170});
    for(const [i,f]of m.frames.entries())inputs.push({input:await sharp(path.join(d.dir,f.file)).resize(180,142,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer(),left:20+i*184,top:row*170+24});
  }await sharp({create:{width,height,channels:4,background:'#202c39'}}).composite(inputs).png().toFile(path.join(output,name+'.png'));
}
(async()=>{for(const e of enemies){const base=path.join(root,'assets/enemies',e.id,'motions'),file=path.join(base,'index.json');if(!fs.existsSync(file))continue;await rows(e.id,read(file).map(d=>({id:d.id,dir:path.join(base,d.id)})));}
  const definitions=effects.filter(e=>fs.existsSync(path.join(root,'assets/effects',e.id,'manifest.json'))).map(e=>({id:e.id,dir:path.join(root,'assets/effects',e.id)}));if(definitions.length)await rows('effects',definitions);
  const icons=[];for(const [i,[id]]of materials.entries()){const x=(i%5)*180,y=Math.floor(i/5)*180;
    icons.push({input:await sharp(path.join(root,'assets/ui/items',id+'.png')).resize(128,128,{kernel:'nearest'}).png().toBuffer(),left:x+26,top:y+8});
    icons.push({input:Buffer.from('<svg width="180" height="24"><text x="8" y="18" font-family="Arial" font-size="14" fill="#dde7f0">'+id+'</text></svg>'),left:x,top:y+142});
  }await sharp({create:{width:900,height:360,channels:4,background:'#202c39'}}).composite(icons).png().toFile(path.join(output,'materials.png'));console.log(output);
})().catch(e=>{console.error(e);process.exitCode=1;});
