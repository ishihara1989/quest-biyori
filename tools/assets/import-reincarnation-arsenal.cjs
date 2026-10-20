'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const {developmentAsset,writeAssetJson,makeAssetDirectory}=require('../lib/project-paths.cjs');
const base=developmentAsset('reincarnation-goddess/arsenal-v1');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function run(){
const records=JSON.parse(fs.readFileSync(path.join(base,'import.json'),'utf8'));
let gen=fs.existsSync(path.join(base,'generation.json'))?JSON.parse(fs.readFileSync(path.join(base,'generation.json'),'utf8')):[];
const report=[];
for(const r of records){
 const target='source/'+(r.selected?'':'rejected/')+r.id+'.png';makeAssetDirectory(path.dirname(path.join(base,target)));
 fs.copyFileSync(r.originalPath,path.join(base,target));
 const refs=(r.references||[]).map(f=>{const dest='references/'+(f.includes('generated_images')?(r.id==='fx-gate-close'?'gate-base.png':'truck-base.png'):path.basename(f)); fs.copyFileSync(f,path.join(base,dest));return {file:dest,sha256:hash(f)};});
 gen=gen.filter(x=>x.id!==r.id);gen.push({id:r.id,tool:'built-in image_gen',date:'2026-10-20',file:target,originalPath:r.originalPath,sha256:hash(path.join(base,target)),references:refs,selected:r.selected,reason:r.reason||null,prompt:r.prompt||null});
 if(!r.selected)continue;
 const {data,info}=await sharp(path.join(base,target)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cells=[];
 for(let n=0;n<3;n++){let b=[info.width,info.height,-1,-1],edge=0;const l=Math.round(n*info.width/3),rr=Math.round((n+1)*info.width/3);
 for(let y=0;y<info.height;y++)for(let x=l;x<rr;x++){if(data[(y*info.width+x)*4+3]>32){b=[Math.min(b[0],x-l),Math.min(b[1],y),Math.max(b[2],x-l),Math.max(b[3],y)];if(x===l||x===rr-1||y===0||y===info.height-1)edge++;}}
 cells.push({bounds:b,edgePixels:edge});}
 report.push({id:r.id,width:info.width,height:info.height,cells});
}
writeAssetJson(path.join(base,'generation.json'),gen);writeAssetJson(path.join(base,'review/source-scan.json'),report);console.log(JSON.stringify(report));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
