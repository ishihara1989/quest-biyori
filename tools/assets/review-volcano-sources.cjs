'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {developmentAsset,ROOT}=require('../lib/project-paths.cjs');
const first=developmentAsset('late-stage-first-pass/v1'),root=developmentAsset('volcano-motions/v2'),out=path.join(ROOT,'output/volcano-motions');
async function main(){
 fs.mkdirSync(out,{recursive:true});const jobs=JSON.parse(fs.readFileSync(path.join(first,'jobs.json'),'utf8')),qa=JSON.parse(fs.readFileSync(path.join(first,'qa.json'),'utf8'));
 console.log(JSON.stringify({unsafeExtraction:qa.sources.filter(q=>jobs.some(j=>j.id===q.id&&(j.region==='volcano'||j.region==='shared'))&&q.extractionError).map(x=>x.id),sourceEdges:qa.sources.filter(q=>q.edgeOpaquePixels&&jobs.some(j=>j.id===q.id&&j.region==='volcano')).map(x=>x.id)}));
 for(const id of ['young-fire-dragon','magma-salamander','obsidian-executioner','dragon-girl','dragon']){
  const group=jobs.filter(j=>j.enemy===id),inputs=[];
  for(const [i,j]of group.entries()){
   const input=await sharp(path.join(first,j.source)).flatten({background:'#c6d3de'}).resize(384,300,{fit:'contain',background:'#c6d3de',kernel:'nearest'}).png().toBuffer();
   inputs.push({input,left:(i%2)*384,top:Math.floor(i/2)*330+30});
   const svg='<svg width="384" height="30"><text x="8" y="23" fill="#fff" font-family="sans-serif" font-size="20">'+j.id+'</text></svg>';
   inputs.push({input:await sharp(Buffer.from(svg)).png().toBuffer(),left:(i%2)*384,top:Math.floor(i/2)*330});
  }
  await sharp({create:{width:768,height:Math.ceil(group.length/2)*330,channels:4,background:'#192330'}}).composite(inputs).png().toFile(path.join(out,'first-'+id+'.png'));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
