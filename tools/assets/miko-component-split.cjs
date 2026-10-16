'use strict';
// Alpha-connected silhouettes let a wide forepaw and the next tail overlap in X
// without copying any of the neighboring pose. No colors or artwork are painted.
const fs=require('node:fs'),{PNG}=require('pngjs'),{bounds}=require('./miko-assets.cjs');
function split(file,threshold=16){const im=PNG.sync.read(fs.readFileSync(file)),labels=new Int32Array(im.width*im.height),queue=new Int32Array(labels.length),components=[];let label=0;
 for(let start=0;start<labels.length;start++){if(labels[start]||im.data[start*4+3]<threshold)continue;label++;let n=1,at=0;queue[0]=start;labels[start]=label;let l=im.width,t=im.height,r=-1,b=-1;
  while(at<n){const p=queue[at++],x=p%im.width,y=Math.floor(p/im.width);l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,k=yy*im.width+xx;if(xx<0||xx>=im.width||yy<0||yy>=im.height||labels[k]||im.data[k*4+3]<threshold)continue;labels[k]=label;queue[n++]=k;}}
  components.push({label,n,l,t,r,b,width:r-l+1,height:b-t+1});
 }return {im,labels,components:components.sort((a,b)=>b.n-a.n)};
}
if(require.main===module){const result=split(process.argv[2]);console.log(JSON.stringify(result.components.slice(0,12)));}
module.exports={split};
