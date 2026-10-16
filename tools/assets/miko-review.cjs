'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
// Contact sheets for inspection; all creature/VFX pixels come from ImageGen.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp'),{records}=require('./miko-assets.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'output/miko-assets/review');makeAssetDirectory(out,{recursive:true});
const label=(name,w)=>Buffer.from(`<svg width="${w}" height="28"><text x="10" y="20" fill="#f9e6c3" font-size="14" font-family="Segoe UI,Meiryo">${name}</text></svg>`);
(async()=>{const selected=records().filter(r=>r.group===process.argv[2]&&(process.argv[3]?r.phase===process.argv[3]:true)),w=384,h=310,cols=3;
 for(let start=0;start<selected.length;start+=12){const rows=selected.slice(start,start+12),layers=[];for(const [i,r]of rows.entries()){const image=await sharp(path.join(root,r.source)).resize(w,h-28,{fit:'contain',kernel:'nearest',background:'#26303b'}).flatten({background:'#26303b'}).png().toBuffer();layers.push({input:image,left:i%cols*w,top:Math.floor(i/cols)*h+28},{input:label(r.id,w),left:i%cols*w,top:Math.floor(i/cols)*h});}const p=path.join(out,(process.argv[2]||'all')+'-'+(process.argv[3]||'all')+'-'+Math.floor(start/12)+'.png');await sharp({create:{width:w*cols,height:h*Math.ceil(rows.length/cols),channels:4,background:'#26303b'}}).composite(layers).png().toFile(p);console.log(p);}
})().catch(e=>{console.error(e);process.exitCode=1;});
