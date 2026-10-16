'use strict';
// Visual QA only: nearest-neighbor crops on a flat backdrop, no sprite painting.
const fs=require('node:fs'),path=require('node:path');
const dep=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[dep]}));
(async()=>{
const directory=path.dirname(__dirname),manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
const full=[],legs=[];
for(let i=0;i<8;i++){
const input=path.join(directory,manifest.frames[i].file);
full.push({input:await sharp(input).resize(768,672,{kernel:'nearest'}).png().toBuffer(),left:(i%4)*768,top:Math.floor(i/4)*696+24});
const foot=await sharp(input).extract({left:78,top:164,width:108,height:56}).resize(540,280,{kernel:'nearest'}).flatten({background:'#20232b'}).png().toBuffer();
fs.writeFileSync(path.join(directory,'QA-legs-'+String(i+1).padStart(2,'0')+'.png'),foot);
legs.push({input:foot,left:(i%4)*540,top:Math.floor(i/4)*304+24});
}
function labels(w,h,cw,ch){return Buffer.from('<svg width="'+w+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg">'+Array.from({length:8},(_,i)=>'<text x="'+((i%4)*cw+12)+'" y="'+(Math.floor(i/4)*ch+18)+'" font-family="sans-serif" font-size="16" fill="#eed4a0">'+(i+1)+'</text>').join('')+'</svg>')}
full.push({input:labels(3072,1392,768,696),left:0,top:0});
legs.push({input:labels(2160,608,540,304),left:0,top:0});
await sharp({create:{width:3072,height:1392,channels:4,background:'#20232b'}}).composite(full).png().toFile(path.join(directory,'QA-full-v3.png'));
await sharp({create:{width:2160,height:608,channels:4,background:'#20232b'}}).composite(legs).png().toFile(path.join(directory,'QA-legs-v3.png'));
})();
