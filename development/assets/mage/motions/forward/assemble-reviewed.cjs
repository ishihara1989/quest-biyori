'use strict';
// Packaging only: crop transparent gutters, uniformly nearest-resize generated
// individual cells to original sprite scale, and assemble all eight poses.
const fs = require('node:fs'), path = require('node:path');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', {paths: [__dirname, bundled]}));
const {PNG} = require(require.resolve('pngjs', {paths: [__dirname, bundled]}));
function bounds(buffer) {
  const p = PNG.sync.read(buffer), b = {left:p.width, top:p.height, right:-1, bottom:-1};
  for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++) {
    if(p.data[(y*p.width+x)*4+3]<128)continue;
    b.left=Math.min(b.left,x);b.top=Math.min(b.top,y);b.right=Math.max(b.right,x);b.bottom=Math.max(b.bottom,y);
  }
  return b;
}
async function assemble(configPath) {
  const c = JSON.parse(fs.readFileSync(configPath,'utf8')), dir=path.dirname(configPath), content=[];
  const source=path.join(dir,c.base), m=await sharp(source).metadata();
  for(let i=0;i<8;i++) {
    const f=c.frames[i], inputFile=f.file?path.join(dir,f.file):source;
    let pipeline=sharp(inputFile);
    if(f.rect)pipeline=pipeline.extract(f.rect);
    let input=await pipeline.png().toBuffer(), anchor=f.waistX;
    const before=bounds(input);
    if(f.height) {
      const metadata=await sharp(input).metadata(), factor=f.height/(before.bottom-before.top);
      const width=Math.round(metadata.width*factor), height=Math.round(metadata.height*factor);
      input=await sharp(input).resize(width,height,{kernel:'nearest'}).png().toBuffer();
      anchor*=width/metadata.width;
    }
    const b=bounds(input), left=Math.round(256-anchor), top=520-b.bottom;
    const alpha=await sharp(input).trim().png().toBuffer(), trimmed=await sharp(alpha).metadata();
    // Trim only empty pixels; preserve the original anchor with alpha bounds.
    const actualLeft=left+b.left, actualTop=top+b.top;
    if(actualLeft<4||actualTop<4||actualLeft+trimmed.width>508||actualTop+trimmed.height>572)throw new Error('Cell margin fails '+(i+1));
    content.push({input:alpha,left:i%4*512+actualLeft,top:Math.floor(i/4)*576+actualTop});
  }
  await sharp({create:{width:2048,height:1152,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(content).png().toFile(path.join(dir,c.output));
  console.log(c.output);
}
assemble(process.argv[2]).catch(e=>{console.error(e);process.exitCode=1;});
