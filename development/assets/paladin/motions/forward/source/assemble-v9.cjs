'use strict';
// Source-cell crop/reposition/nearest-neighbor only. All poses are original image_gen drawings.
const fs = require('node:fs');
const path = require('node:path');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(path.join(bundled, 'sharp'));
const { PNG } = require(path.join(bundled, 'pngjs'));
const directory = __dirname;
const cells = [
  { source: 'paladin-forward-generated-v8.png', rect: [0, 0, 384, 512], scale: 1, waistX: 256 },
  { source: 'paladin-forward-generated-v8.png', rect: [384, 0, 384, 512], scale: 1, waistX: 256 },
  { source: 'paladin-forward-generated-v8.png', rect: [768, 0, 384, 512], scale: 1, waistX: 256 },
  { source: 'paladin-forward-individual-repaired-v1.png', rect: [0, 0, 627, 627], scale: 395 / 557, waistX: 385 },
  { source: 'paladin-forward-individual-repaired-v1.png', rect: [627, 0, 627, 627], scale: 395 / 557, waistX: 385 },
  { source: 'paladin-forward-individual-repaired-v1.png', rect: [0, 627, 627, 627], scale: 395 / 557, waistX: 385 },
  { source: 'paladin-forward-individual-repaired-v1.png', rect: [627, 627, 627, 627], scale: 395 / 557, waistX: 385 },
  { source: 'paladin-forward-generated-v8.png', rect: [1152, 512, 384, 512], scale: 1, waistX: 256 },
];
(async()=>{
 const composite=[];
 for(let i=0;i<cells.length;i++){
  const c=cells[i], [left,top,width,height]=c.rect;
  let buf=await sharp(path.join(directory,c.source)).extract({left,top,width,height}).png().toBuffer();
  if(c.scale!==1) buf=await sharp(buf).resize(Math.round(width*c.scale),Math.round(height*c.scale),{kernel:'nearest'}).png().toBuffer();
  const p=PNG.sync.read(buf); let minY=p.height; for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(p.data[(y*p.width+x)*4+3]>=128)minY=Math.min(minY,y);
  const x=300-Math.round(c.waistX*c.scale), y=60-minY;
  composite.push({input:buf,left:(i%4)*512+x,top:Math.floor(i/4)*512+y});
  c.target={left:x,top:y,width:p.width,height:p.height};
 }
 await sharp({create:{width:2048,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composite).png().toFile(path.join(directory,'paladin-forward-generated-v9.png'));
 fs.writeFileSync(path.join(directory,'paladin-forward-v9-assembly.json'),JSON.stringify({mode:'crop, nearest-neighbor proportional scale, cell reposition only; no drawn/interpolated pose pixels',cells},null,2)+'\n');
})();

