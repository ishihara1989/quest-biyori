'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp');
const root=path.resolve(__dirname,'../../public/assets/highland-motions/trot-v2'),data=JSON.parse(fs.readFileSync(path.join(root,'guide.json'),'utf8'));
// Manually selected claw/paw regions: these are approximate review measurements,
// not automated anatomical detections. X is the region center, Y its lower edge.
const observed=[
  {LF:[342,1097],RF:[290,922],LH:[961,956],RH:[700,965]},
  {LF:[356,1082],RF:[160,913],LH:[891,942],RH:[881,999]},
  {LF:[387,1003],RF:[168,1015],LH:[924,1049],RH:[752,915]},
  {LF:[247,985],RF:[418,996],LH:[950,1049],RH:[742,929]},
  {LF:[192,972],RF:[394,1011],LH:[1020,1045],RH:[742,934]},
  {LF:[327,1076],RF:[543,942],LH:[1012,948],RH:[710,981]}
];
async function main(){
  const rows=[];
  for(const f of data.frames){const n=f.index+1,file=path.join(root,'sources/frame-'+n+'-generated.png'),src=fs.readFileSync(file).toString('base64');let markup='<rect width="100%" height="100%" fill="#20343b"/><image href="data:image/png;base64,'+src+'" width="1375" height="1144" opacity=".28"/>';
    const paws={};
    for(const id of ['RF','RH','LF','LH']){const l=f.legs[id],p=l.screen.paw,old=observed[f.index][id],color=l.color;
      markup+='<g stroke="'+color+'" fill="none" stroke-width="4"><path stroke-dasharray="10 8" d="M '+old[0]+' '+old[1]+' L '+p.x+' '+p.y+'"/><ellipse cx="'+p.x+'" cy="'+(p.y-35)+'" rx="'+(l.side==='near'?85:65)+'" ry="35"/><path d="M '+(p.x-15)+' '+p.y+' h 30 M '+p.x+' '+(p.y-15)+' v 30"/></g><text x="'+(p.x+85)+'" y="'+(p.y-25)+'" fill="'+color+'" font-family="Segoe UI" font-size="24">'+id+' TARGET</text>';
      paws[id]={target:{x:p.x,y:p.y},observed:{x:old[0],y:old[1]},shift:{x:p.x-old[0],y:p.y-old[1]},error:Math.hypot(p.x-old[0],p.y-old[1])};
    }
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1375" height="1144">'+markup+'</svg>';
    await sharp(Buffer.from(svg)).png().toFile(path.join(root,'guides/correction-'+n+'.png'));rows.push({frame:n,paws});
  }
  writeAssetJson(path.join(root,'initial-measurements.json'), {method:'approximate manual paw-region centers and lower claw edges, original source pixels',precision:'about 15-25px; not automatic anatomical detection',frames:rows});
  console.log(JSON.stringify({correctionGuides:6,initialMeanError:rows.flatMap(r=>Object.values(r.paws)).reduce((s,p)=>s+p.error,0)/24}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
