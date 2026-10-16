'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp');
const root=path.resolve(__dirname,'../../public/assets/highland-motions'),dir=path.join(root,'trot/storm-jackal/guides');
const plans=[{frame:2,source:'frame-2-contact.png',legs:[{id:'LH',color:'#ff799c',root:[745,835],joint:[825,930],ankle:[785,1025],paw:[790,1080],state:'LIFT'}]},
 {frame:3,source:'frame-3-contact.png',legs:[{id:'RF',color:'#66c6ff',root:[305,800],joint:[325,990],ankle:[325,1100],paw:[325,1175],state:'GROUND'}]},
 ...[4,5].map((frame,i)=>({frame,source:'frame-'+frame+'-single.png',legs:[{id:'LF',color:'#ffca4c',root:[405,720],joint:[450,900],ankle:[385-i*25,1010],paw:[385-i*25,1080],state:'LIFT'},{id:'RF',color:'#66c6ff',root:[305,800],joint:[335+i*20,990],ankle:[345+i*25,1100],paw:[345+i*25,1175],state:'GROUND'}]}))];
async function main(){for(const p of plans){let shapes='';for(const l of p.legs)shapes+='<g stroke="'+l.color+'" fill="none" stroke-width="10"><path d="M '+l.root.join(' ')+' L '+l.joint.join(' ')+' L '+l.ankle.join(' ')+'"/><ellipse cx="'+l.paw[0]+'" cy="'+(l.paw[1]-20)+'" rx="42" ry="20"/><circle cx="'+l.paw[0]+'" cy="'+l.paw[1]+'" r="7" fill="'+l.color+'"/></g><text x="'+(l.paw[0]+45)+'" y="'+(l.paw[1]+25)+'" fill="'+l.color+'" font-size="26">'+l.id+' '+l.state+'</text>';
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254"><rect width="100%" height="100%" fill="#142a30" fill-opacity=".6"/><g font-family="Segoe UI"><text x="35" y="50" fill="white" font-size="30">FRAME '+p.frame+' — target paw BOTTOM, fixed existing body</text>'+shapes+'</g></svg>');await sharp(path.join(root,'trot/storm-jackal/sources',p.source)).composite([{input:svg}]).png().toFile(path.join(dir,'contact-correction-'+p.frame+'.png'));}
 writeAssetJson(path.join(dir,'contact-corrections.json'), plans);console.log('Four corrections aligned to the actual source body.');}
main().catch(e=>{console.error(e);process.exitCode=1;});
