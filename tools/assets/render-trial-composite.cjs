'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const {developmentAsset}=require('../lib/project-paths.cjs');
const base=developmentAsset('trial-intruders/motions-v1');
const load=id=>{const index=JSON.parse(fs.readFileSync(base+'/index.json')),c=index.find(c=>c.id===id);assert.ok(c,id+' missing');const dir=path.dirname(base+'/'+c.manifest),m=JSON.parse(fs.readFileSync(base+'/'+c.manifest));m.encoded=m.frames.map(f=>fs.readFileSync(dir+'/'+f.file).toString('base64'));return m;};
function frameAt(m,t){let n=0;for(const i of m.frameSequence){n+=m.frames[i].durationMs;if(t<n)return i;}return m.frameSequence.at(-1);}
async function main(){const body=load('G04'),fx=new Map(['OG-F10a','OG-F4a','OG-F4b','OG-F10b'].map(id=>[id,load(id)])),pages=[],delay=80,size=460,s=size/512,x=630,y=510;
 for(let t=0;t<body.durationMs;t+=delay){const i=frameAt(body,t),a=body.frames[i].measuredAnchors;assert.ok(a,'G04 attachment observation missing');let svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="576"><rect width="1024" height="576" fill="#172236"/>';
  const raster=(encoded,left,top,w)=>'<image x="'+left+'" y="'+top+'" width="'+w+'" height="'+w+'" href="data:image/png;base64,'+encoded+'"/>';
  svg+=raster(body.encoded[i],x-size/2,y-size*448/512,size);
  const point=p=>[x+(p[0]-256)*s,y+(p[1]-448)*s];
  function effect(id,at,p,width,angle=0,held=false){const m=fx.get(id);if(at<0||(!held&&at>=m.durationMs))return;const k=frameAt(m,Math.min(at,m.durationMs-1)),origin=m.origin||[256,256],w=width*s;svg+='<g transform="translate('+p.join(' ')+') rotate('+((angle+(m.mountRotationRadians||0))*180/Math.PI)+')">'+raster(m.encoded[k],-origin[0]*w/512,-origin[1]*w/512,w)+'</g>';}
  const main=point(a.mainEmitter),secondary=point(a.offEmitter),angles=[1.35,.1,-.65,Math.PI,0,-1];
  if(i<=2)effect('OG-F10a',i===0?t:230,main,205,angles[i],true);
  if(i===1||i===2)effect('OG-F4a',t%160,[main[0]-45*s,main[1]+35*s],230,-.15);
  if(i===3||i===4)effect('OG-F10a',i===3?t%230:230,secondary,190,angles[i],true);
  if(i===4)effect('OG-F4b',t%240,[secondary[0]-55*s,secondary[1]],220);
  if(i===5)effect('OG-F10b',t%240,main,75);
  svg+='</svg>';pages.push(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer());
 }
 await sharp(Buffer.concat(pages),{raw:{width:1024,height:576*pages.length,channels:4,pageHeight:576}}).gif({delay:Array(pages.length).fill(delay),loop:0,dither:0,colours:256,keepDuplicateFrames:true}).toFile(base+'/review/G04-composite.gif');const m=await sharp(base+'/review/G04-composite.gif',{animated:true}).metadata();assert.equal(m.pages,pages.length);assert.ok(m.delay.every(d=>d===delay));console.log(JSON.stringify({id:'G04-composite',frames:m.pages,durationMs:pages.length*delay,bodyAndRasterFxOnly:true}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
