'use strict';
// Package generated RGBA cells without recoloring or synthesizing frames.
const fs=require('node:fs/promises'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),dest=path.join(root,'public/assets/skills/mage');
async function build(records) {
  await fs.mkdir(path.join(dest,'source'),{recursive:true});await fs.mkdir(path.join(dest,'icons'),{recursive:true});
  for(const r of records) {
    const source=path.join(dest,'source',r.type+'-'+r.id+'-generated-v1.png');
    const input=path.isAbsolute(r.path)?r.path:path.join(root,r.path);
    if(input!==source)await fs.copyFile(input,source);
    if(r.type==='icon') {
      const art=await sharp(source).trim().resize(80,80,{fit:'inside',kernel:'nearest'}).png().toBuffer();
      await sharp({create:{width:96,height:96,channels:4,background:'#00000000'}}).composite([{input:art,gravity:'center'}]).png().toFile(path.join(dest,'icons',r.id+'.png'));continue;
    }
    const dir=path.join(dest,'effects',r.id);await fs.mkdir(dir,{recursive:true});
    const meta=await sharp(source).metadata(),frames=[],cells=[];
    for(let i=0;i<4;i++) {
      const left=Math.round(i*meta.width/4),right=Math.round((i+1)*meta.width/4);
      const cell=await sharp(source).extract({left,top:0,width:right-left,height:meta.height}).resize(224,224,{fit:'contain',background:'#00000000',kernel:'nearest'}).extend({top:16,bottom:16,left:16,right:16,background:'#00000000'}).png().toBuffer();
      const file=r.id+'-'+String(i+1).padStart(2,'0')+'.png';await fs.writeFile(path.join(dir,file),cell);cells.push(cell);
      frames.push({index:i,file,x:i*256,y:0,width:256,height:256,durationMs:110});
    }
    const sheet=r.id+'.png';await sharp({create:{width:1024,height:256,channels:4,background:'#00000000'}}).composite(cells.map((input,i)=>({input,left:i*256,top:0}))).png().toFile(path.join(dir,sheet));
    const loop=['arcane','fire','ice','meteor','cosmos','four','circle','cloud','wind'].includes(r.id);
    const pivot={x:128,y:{earth:216,'ice-impact':201,lightning:216}[r.id]||128};
    await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify({character:'mage',motion:r.id,sheet,frameWidth:256,frameHeight:256,frameCount:4,frameSequence:[0,1,2,3],durationMs:440,loop,pivot,frames},null,2)+'\n');
    await sharp({create:{width:1024,height:288,channels:4,background:'#243132'}}).composite(cells.map((input,i)=>({input,left:i*256,top:16}))).png().toFile(path.join(dir,'review.png'));
  }
  console.log('Mage assets packaged:',records.filter(r=>r.type==='icon').length,'icons /',records.filter(r=>r.type==='effect').length,'four-frame effects');
}
if(require.main===module)fs.readFile(path.join(__dirname,'../../development/records/mage-skill-generation.json'),'utf8').then(JSON.parse).then(build).catch(e=>{console.error(e);process.exitCode=1;});
module.exports=build;
