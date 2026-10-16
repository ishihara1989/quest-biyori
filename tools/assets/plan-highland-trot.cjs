'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp'),crypto=require('node:crypto');
const model=require('../../development/labs/js/manticore-trot-model.js');
const root=path.resolve(__dirname,'../../public/assets/highland-motions');
const ids=['horn-jackal','rock-horn-goat','storm-jackal','iron-horn'];
async function main(){
 const jobs=[];
 for(const id of ids){
  const dir=path.join(root,'trot',id);makeAssetDirectory(path.join(dir,'guides'),{recursive:true});makeAssetDirectory(path.join(dir,'sources'),{recursive:true});
  const backup=path.join(root,'backups',id+'-walk-before-trot-20261013');
  if(!fs.existsSync(backup)){fs.cpSync(path.join(root,'enemies',id,'motions/move'),path.join(backup,'move'),{recursive:true});const files=fs.readdirSync(path.join(backup,'move'));writeAssetJson(path.join(backup,'backup-info.json'), files.map(file=>({file:'move/'+file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(backup,'move',file))).digest('hex')})));}
  const c=structuredClone(model.config);Object.assign(c,{width:1024,height:1024,origin:{x:510,y:865},yawDeg:20,pitchDeg:13});
  const heavy=id.includes('horn')&&id!=='horn-jackal';
  for(const [k,l]of Object.entries(c.legs)){l.u=k.endsWith('F')?165:-165;l.v=l.side==='near'?65:-65;l.rootZ=k.endsWith('F')?290:270;l.upper=175;l.lower=175;l.amplitude=({LF:44,RF:38,LH:40,RH:27}[k])*(heavy?.8:1);l.lift=({LF:46,RF:38,LH:42,RH:34}[k])*(heavy?.8:1);}
  const frames=model.frames(c);writeAssetJson(path.join(dir,'guide.json'), {enemy:id,config:c,frames});
  const images=[];
  for(const f of frames){let shapes='';for(const k of ['RF','RH','LF','LH']){const l=f.legs[k],s=l.screen;shapes+='<g stroke="'+l.color+'" fill="none" stroke-width="9" '+(l.side==='far'?'stroke-dasharray="12 9"':'')+'><path d="M '+s.root.x+' '+s.root.y+' L '+s.joint.x+' '+s.joint.y+' L '+s.ankle.x+' '+s.ankle.y+'"/><ellipse cx="'+s.paw.x+'" cy="'+(s.paw.y-14)+'" rx="28" ry="14"/></g><text x="'+(s.paw.x+30)+'" y="'+s.paw.y+'" fill="'+l.color+'" font-size="22">'+k+' '+(l.grounded?'GROUND':'LIFT')+'</text>';}
   const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="100%" height="100%" fill="#15252e"/><g font-family="Segoe UI"><text x="40" y="70" font-size="34" fill="white">'+id+' FRAME '+(f.index+1)+'</text><text x="40" y="115" font-size="24" fill="white">Near = left. Far = right. Foot = bottom contact.</text>'+shapes+'</g></svg>';
   fs.writeFileSync(path.join(dir,'guides/frame-'+(f.index+1)+'.svg'),svg);const png=await sharp(Buffer.from(svg)).png().toBuffer();fs.writeFileSync(path.join(dir,'guides/frame-'+(f.index+1)+'.png'),png);images.push(png);
  }
  for(let half=0;half<2;half++){
   const guide=path.join(dir,'guides/half-'+(half+1)+'.png');await sharp({create:{width:3072,height:1024,channels:4,background:'#15252e'}}).composite(images.slice(half*3,half*3+3).map((input,i)=>({input,left:i*1024,top:0}))).png().toFile(guide);
   const poses=frames.slice(half*3,half*3+3).map(f=>'FRAME '+(f.index+1)+': '+Object.entries(f.legs).map(([k,l])=>k+'='+l.label+'/'+l.side+' '+(l.grounded?'grounded':'lifted')+' paw bottom ('+Math.round(l.screen.paw.x)+','+Math.round(l.screen.paw.y)+'), hip ('+Math.round(l.screen.root.x)+','+Math.round(l.screen.root.y)+'), knee ('+Math.round(l.screen.joint.x)+','+Math.round(l.screen.joint.y)+')').join('; ')).join('\n');
   const prompt='Generate THREE consecutive full-body left-facing 3/4-view TROT poses of the creature in the FIRST reference, in one horizontal three-cell sprite sheet, read left to right. The SECOND reference is only a skeletal pose/coordinate guide, never copy its text or colors into the artwork. Each cell uses its own local normalized 1024 x 1024 coordinates. Same identity, head/torso placement, body size, pixel-art texture, gold trim, face, horns, tail, palette and lighting across all poses. Exactly FOUR connected legs; anatomical left legs are near, anatomical right legs are far and darker. Far legs can be naturally partly hidden; NEVER add a fifth paw to show an occluded leg. Trace every thigh/knee/shin into its OWN existing ankle/foot. The head and torso are stable around the same position; only legs articulate with subtle mane/tail secondary motion. No horizontal character translation. Ground support alternates diagonal pairs: A=near LH+far RF, B=near LF+far RH. These three poses form '+(half===0?'first half (1,2,3)':'second half (4,5,6)')+' of a six-frame 720ms seamless in-place trot. Natural smaller stride of far hind leg, do not exaggerate it. Coordinates guide relative placement; accurate identity and smooth small limb movement matter. '+poses+'\nKeep cell size/margins identical. Each whole creature, horns and tail contained in its cell, full transparent alpha background. No floor, shadows, guide lines, text, borders, numbers, duplicated bodies or attack VFX. Match the canonical reference art; crisp pixel RPG sprite. Export three separate equal cells in a single wide transparent PNG.';
   jobs.push({enemy:id,half:half+1,guide:'trot/'+id+'/guides/half-'+(half+1)+'.png',reference:'references/'+id+'.png',source:'trot/'+id+'/sources/half-'+(half+1)+'-generated.png',prompt});
  }
 }
 writeAssetJson(path.join(root,'trot/jobs.json'), jobs);console.log(JSON.stringify({jobs:jobs.length,enemies:ids}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
