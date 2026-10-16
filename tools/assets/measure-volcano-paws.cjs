'use strict';
// Review aid only: inspect actual exported pixels; mathematical guides are separate.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {developmentAsset,ROOT}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2'),out=path.join(ROOT,'output/volcano-motions/paws');
const heads=process.argv.includes('--heads'),enemies=heads?['lava-salamander','young-fire-dragon','magma-salamander','obsidian-executioner','dragon-girl','dragon']:['lava-salamander','young-fire-dragon','magma-salamander','dragon'];
async function main(){fs.mkdirSync(out,{recursive:true});for(const enemy of enemies){
 const inputs=[];for(let frame=1;frame<=6;frame++){
  const left=heads?120:100,top=heads?100:270,width=320,height=heads?170:100;
  const image=await sharp(path.join(root,'ready',enemy,'move','frame-'+frame+'.png')).extract({left,top,width,height}).flatten({background:'#c6d3de'}).resize(640,height*2,{kernel:'nearest'}).png().toBuffer();
  let lines='';for(let x=100;x<=420;x+=20)lines+='<path d="M '+((x-100)*2)+' 24 V 224" stroke="#39556f" opacity=".3"/><text x="'+((x-100)*2+2)+'" y="20" font-size="12" fill="#fff">'+x+'</text>';for(let y=280;y<=360;y+=20)lines+='<path d="M 0 '+(24+(y-270)*2)+' H 640" stroke="#39556f" opacity=".3"/><text x="2" y="'+(24+(y-270)*2-2)+'" font-size="12" fill="#213040">'+y+'</text>';
  if(heads){lines='';for(let x=left;x<=left+width;x+=20)lines+='<path d="M '+((x-left)*2)+' 24 V '+(height*2+24)+'" stroke="#39556f" opacity=".35"/><text x="'+((x-left)*2+2)+'" y="20" font-size="12" fill="#fff">'+x+'</text>';for(let y=top;y<=top+height;y+=20)lines+='<path d="M 0 '+(24+(y-top)*2)+' H 640" stroke="#39556f" opacity=".35"/><text x="2" y="'+(24+(y-top)*2-2)+'" font-size="12" fill="#213040">'+y+'</text>';}
  const tileHeight=height*2+24,overlay=await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="'+tileHeight+'"><rect width="640" height="24" fill="#172530"/>'+lines+'</svg>')).png().toBuffer();
  const tile=await sharp({create:{width:640,height:tileHeight,channels:4,background:'#172530'}}).composite([{input:image,left:0,top:24},{input:overlay,left:0,top:0}]).png().toBuffer();inputs.push({input:tile,left:((frame-1)%3)*640,top:Math.floor((frame-1)/3)*tileHeight});
 }
 await sharp({create:{width:1920,height:(heads?364:224)*2,channels:4,background:'#172530'}}).composite(inputs).png().toFile(path.join(out,enemy+(heads?'-heads':'')+'.png'));
}}
main().catch(e=>{console.error(e);process.exitCode=1;});
