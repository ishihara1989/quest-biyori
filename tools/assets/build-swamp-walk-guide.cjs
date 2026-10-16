'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const sharp=require(require.resolve('sharp',{paths:[__dirname,path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')]}));
const out=path.resolve(__dirname,'../../public/assets/enemies/skeleton/source');
const poses=[
  {near:[[148,180],[121,225],[90,280]],far:[[138,180],[172,223],[191,280]]},
  {near:[[148,180],[148,226],[145,280]],far:[[138,180],[118,217],[102,248]]},
  {near:[[148,180],[177,223],[195,280]],far:[[138,180],[103,228],[83,273]]},
  {near:[[148,180],[181,222],[191,280]],far:[[138,180],[113,224],[90,280]]},
  {near:[[148,180],[120,215],[102,248]],far:[[138,180],[138,226],[138,280]]},
  {near:[[148,180],[108,224],[83,273]],far:[[138,180],[174,227],[195,280]]},
];
(async()=>{for(let part=1;part<=2;part++){
  let body='';for(let col=0;col<3;col++){const p=poses[(part-1)*3+col];body+='<g transform="translate('+col*240+',0)">';
    body+='<circle cx="144" cy="62" r="24" fill="#777"/><path d="M144 85V145M122 104H168M124 105L109 129L75 137M165 105L179 133L193 162M128 146L123 170H161L156 146Z" stroke="#888" stroke-width="11" fill="none"/>';
    body+='<path d="M73 139L44 75" stroke="#888" stroke-width="12"/>';
    for(const [side,color]of [['far','#468cea'],['near','#eb5656']]){const points=p[side];body+='<polyline points="'+points.map(v=>v.join(',')).join(' ')+'" stroke="'+color+'" stroke-width="10" fill="none"/>';for(const[x,y]of points)body+='<circle cx="'+x+'" cy="'+y+'" r="6" fill="'+color+'"/>';const foot=points[2];body+='<path d="M'+foot[0]+' '+foot[1]+'h-18" stroke="'+color+'" stroke-width="12"/>';}
    body+='</g>';}
  await sharp(Buffer.from('<svg width="720" height="320" xmlns="http://www.w3.org/2000/svg">'+body+'</svg>')).png().toFile(path.join(out,'move-'+part+'-pose-guide.png'));
}writeAssetJson(path.join(out,'walk-positions.json'), {near:'left',far:'right',cell:{width:240,height:320},poses});})();
