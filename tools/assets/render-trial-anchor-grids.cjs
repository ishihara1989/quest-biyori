'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {developmentAsset}=require('../lib/project-paths.cjs');
const base=developmentAsset('trial-intruders/motions-v1'),index=JSON.parse(fs.readFileSync(base+'/index.json')),plan=JSON.parse(fs.readFileSync(base+'/plan.json'));
const selection=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',')||['G04','G05','ST-N1','RT-N1','AM-S1','ST-M02','ST-S1','SS-M02','FC-M02'];
async function main(){for(const id of selection){const c=index.find(c=>c.id===id);if(!c)continue;const file=base+'/'+c.manifest,dir=path.dirname(file),m=JSON.parse(fs.readFileSync(file)),p=plan.clips.find(c=>c.id===id),layers=[];
 for(const f of m.frames){let svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">';for(let k=1;k<10;k++){const n=k*50;svg+='<path d="M'+n+' 0V512 M0 '+n+'H512" stroke="#65a6ce" stroke-opacity=".28"/><text x="'+(n+2)+'" y="35" fill="white" font-size="11">'+n+'</text><text x="2" y="'+(n-3)+'" fill="white" font-size="11">'+n+'</text>';}
  svg+='<text x="10" y="18" fill="white" font-size="14">'+id+' '+(f.index+1)+' / '+m.frames.length+'</text>';
  for(const[name,leg]of Object.entries(p.frames[f.index].planned?.legs||{})){const[x,y]=leg.projected.paw;svg+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="none" stroke="#ff6fb5"/><text x="'+(x+5)+'" y="'+(y-5)+'" fill="#ff9bcb" font-size="11">'+name+' plan</text>';}
  svg+='</svg>';const input=await sharp({create:{width:512,height:512,channels:4,background:'#172236'}}).composite([{input:dir+'/'+f.file},{input:Buffer.from(svg)}]).png().toBuffer();layers.push({input,left:f.index%3*512,top:Math.floor(f.index/3)*512});
 }
 await sharp({create:{width:1536,height:Math.ceil(m.frames.length/3)*512,channels:4,background:'#172236'}}).composite(layers).png().toFile(base+'/review/'+id+'-grid.png');
}console.log(JSON.stringify({coordinateGridClips:selection.length,paintedAssetsModified:false}));}
main().catch(e=>{console.error(e);process.exitCode=1;});
