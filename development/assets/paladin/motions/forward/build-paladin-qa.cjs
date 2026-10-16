'use strict';
// QA crops/nearest-neighbor and background composition only; never draws pose pixels.
const fs=require('node:fs'),path=require('node:path');
const b=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(path.join(b,'sharp'));
(async()=>{
for(const motion of ['forward','backward']){
 const dir=path.resolve(__dirname,'..',motion);
 const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
 const full=[],legs=[];
 for(let i=0;i<8;i++){
 const src=path.join(dir,m.frames[i].file);
 full.push({input:await sharp(src).resize(512,448,{kernel:'nearest'}).png().toBuffer(),left:i%4*512,top:Math.floor(i/4)*448});
 legs.push({input:await sharp(src).extract({left:80,top:140,width:104,height:72}).resize(416,288,{kernel:'nearest'}).png().toBuffer(),left:i%4*416,top:Math.floor(i/4)*320+32});
 }
 const labels=Buffer.from('<svg width="1664" height="640" xmlns="http://www.w3.org/2000/svg">'+Array.from({length:8},(_,i)=>'<text x="'+(i%4*416+8)+'" y="'+(Math.floor(i/4)*320+22)+'" font-size="18" fill="white">'+(i+1)+' ankle view: x80..184, y140..212</text>').join('')+'</svg>');
 legs.push({input:labels,left:0,top:0});
 await sharp({create:{width:2048,height:896,channels:4,background:'#18202a'}}).composite(full).png().toFile(path.join(dir,'qa-dark.png'));
 await sharp({create:{width:1664,height:640,channels:4,background:'#18202a'}}).composite(legs).png().toFile(path.join(dir,'qa-legs-all8.png'));
 const indices=[0,2,4,6,7];
 const selected=[];
 for(let k=0;k<indices.length;k++)selected.push({input:await sharp(path.join(dir,m.frames[indices[k]].file)).resize(512,448,{kernel:'nearest'}).png().toBuffer(),left:k*512,top:0});
 await sharp({create:{width:2560,height:448,channels:4,background:'#18202a'}}).composite(selected).png().toFile(path.join(dir,'qa-key-frames-1-3-5-7-8.png'));
}
})();
