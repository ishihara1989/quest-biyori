'use strict';
// Only crop, nearest-neighbor resize and transparently compose generated sprites.
const path=require('node:path');
const dep=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(require.resolve('sharp',{paths:[dep]}));
(async()=>{
const directory=__dirname,full=path.join(directory,'miko-backward-generated-v3-attempt-02.png');
const strip=path.join(directory,'miko-backward-v3-cells-01-02-08-generated.png');
const waist=[null,null,232,232,232,231,232,null],bottom=[null,null,414,414,406,406,408,null];
const replacements={0:0,1:1,7:2},stripWaist=[378,367,379],stripBottom=[659,659,653],ratio=364/632;
const composite=[];
for(let i=0;i<8;i++){
const row=Math.floor(i/4),col=i%4;let input,anchorX,anchorY;
if(i in replacements){const j=replacements[i];input=await sharp(strip).extract({left:j*724,top:0,width:724,height:724})
.resize(Math.round(724*ratio),Math.round(724*ratio),{kernel:'nearest'}).png().toBuffer();
anchorX=Math.round(stripWaist[j]*ratio);anchorY=Math.round(stripBottom[j]*ratio);
}else{let left=Math.round(col*1774/4),right=Math.round((col+1)*1774/4);input=await sharp(full).extract({left,top:row*444,width:right-left,height:row?443:444}).png().toBuffer();anchorX=waist[i];anchorY=bottom[i];}
const cell=await sharp({create:{width:512,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
.composite([{input,left:256-anchorX,top:470-anchorY}]).png().toBuffer();
composite.push({input:cell,left:col*512,top:row*512});
}
await sharp({create:{width:2048,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
.composite(composite).png().toFile(path.join(directory,'miko-backward-generated-v3.png'));
})();
