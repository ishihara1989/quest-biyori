'use strict';
// Cropping and proportional nearest-neighbor source-cell placement only.
const fs=require('node:fs'),path=require('node:path');
const b=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp=require(path.join(b,'sharp')),{PNG}=require(path.join(b,'pngjs'));
const directory=__dirname;
const edges=[0,444,887,1331,1774];
const cells=Array.from({length:8},(_,i)=>({source:'paladin-backward-generated-v5.png',rect:[edges[i%4],i<4?0:444,edges[i%4+1]-edges[i%4],i<4?444:443],scale:1,waistX:[280,280,280,287,287,287,287,287][i]}));
cells[4]={source:'paladin-backward-frames5-6-generated-v1.png',rect:[0,0,887,887],scale:375/830,waistX:631};
cells[5]={source:'paladin-backward-frames5-6-generated-v1.png',rect:[887,0,887,887],scale:375/830,waistX:631};
(async()=>{
const composite=[];
for(let i=0;i<cells.length;i++){
 const c=cells[i],[left,top,width,height]=c.rect;
 let buf=await sharp(path.join(directory,c.source)).extract({left,top,width,height}).png().toBuffer();
 if(c.scale!==1)buf=await sharp(buf).resize(Math.round(width*c.scale),Math.round(height*c.scale),{kernel:'nearest'}).png().toBuffer();
 const p=PNG.sync.read(buf);let minY=p.height;for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(p.data[(y*p.width+x)*4+3]>=128)minY=Math.min(minY,y);
 const x=300-Math.round(c.waistX*c.scale),y=60-minY;
 composite.push({input:buf,left:i%4*512+x,top:Math.floor(i/4)*512+y});
 c.target={left:x,top:y,width:p.width,height:p.height};
}
await sharp({create:{width:2048,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composite).png().toFile(path.join(directory,'paladin-backward-generated-v6.png'));
fs.writeFileSync(path.join(directory,'paladin-backward-v6-assembly.json'),JSON.stringify({mode:'crop, proportional nearest-neighbor resize and source-cell positioning only; no drawn/interpolated pose pixels',cells},null,2)+'\n');
})();

