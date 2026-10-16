'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp');
const root=path.resolve(__dirname,'../../public/assets/highland-motions'),dir=path.join(root,process.argv.includes('--v2')?'trot-v2/motions/move':'enemies/manticore/motions/move');
async function main(){
  const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')),parts=[],raw=[];
  const rect={left:245,top:185,width:490,height:390};
  const labels=m.frames.map((f,i)=>'<text x="'+(i%3*510+20)+'" y="'+(Math.floor(i/3)*425+25)+'">'+(i+1)+'</text>').join('');
  const ground=m.frames.map((f,i)=>'<path d="M '+(i%3*510+10)+' '+(Math.floor(i/3)*425+30+m.pivot.y-rect.top)+' h 490"/>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1530" height="850"><rect width="100%" height="100%" fill="#243b42"/><g fill="white" font-family="Segoe UI" font-size="20">'+labels+'</g><g stroke="#aec9bf" stroke-dasharray="4 6">'+ground+'</g></svg>';
  for(const [i,f]of m.frames.entries()){
    const img=sharp(path.join(dir,f.file)).extract(rect);
    parts.push({input:await img.clone().png().toBuffer(),left:i%3*510+10,top:Math.floor(i/3)*425+30});
    raw.push(await img.ensureAlpha().raw().toBuffer());
  }
  await sharp(Buffer.from(svg)).composite(parts).png().toFile(path.join(dir,'trot-contact.png'));
  await sharp(Buffer.concat(raw),{raw:{width:rect.width,height:rect.height*6,channels:4,pageHeight:rect.height}})
    .gif({loop:0,delay:m.frames.map(f=>f.durationMs),colours:256,dither:0,keepDuplicateFrames:true})
    .toFile(path.join(dir,'trot-preview.gif'));
  console.log(JSON.stringify({contact:'trot-contact.png',preview:'trot-preview.gif'}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
