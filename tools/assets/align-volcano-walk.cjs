'use strict';
// Manual observations of the exported PNGs, distinct from planning coordinates.
// Only uniform nearest-neighbor scale and whole-frame registration are changed.
const fs=require('node:fs'),path=require('node:path');
const {developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2');
const observations={
 'lava-salamander':{target:[176,252],limits:[.925,1.025],points:[[169,244],[183,256],[180,256],[173,254],[176,253],[184,256]]},
 'young-fire-dragon':{target:[181,208],points:[[181,204],[181,203],[188,208],[177,211],[176,208],[189,214]]},
 'magma-salamander':{target:[176,238],points:[[176,238],[179,232],[177,240],[172,243],[176,240],[178,237]]},
 'obsidian-executioner':{target:[257,139],points:[[257,139],[257,136],[257,139],[254,141],[268,140],[260,141]]},
 'dragon-girl':{target:[260,145],points:[[263,142],[259,142],[259,145],[245,148],[254,147],[245,149]]},
 dragon:{target:[198,196],points:[[198,195],[199,194],[199,199],[196,207],[192,196],[191,196]]}
};
const file=path.join(root,'layout.json'),layout=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{};
const records=[];
for(const [enemy,measurement]of Object.entries(observations)){
 const id=enemy+'/move',m=JSON.parse(fs.readFileSync(path.join(root,'ready',id,'manifest.json')));
 if(layout[id]?.measurementRevision==='2026-10-14-resume')continue;
 const anchors=[],scales={};
 for(const [i,f]of m.frames.entries()){
  const point=measurement.points[i],source=path.relative(root,path.resolve(root,'ready',id,f.originalSource)).replaceAll('\\','/');
  const factor=(f.pivot.y-measurement.target[1])/(f.pivot.y-point[1]);
  const limited=Math.max(measurement.limits?.[0]??.92,Math.min(measurement.limits?.[1]??1.09,factor)),scale=f.sourceScale*limited;
  const sourcePoint={x:f.sourceAnchor.x+(point[0]-f.pivot.x)/f.sourceScale,y:f.sourceAnchor.y+(point[1]-f.pivot.y)/f.sourceScale};
  anchors.push({x:sourcePoint.x-(measurement.target[0]-f.pivot.x)/scale,y:f.sourceAnchor.y});
  scales[source]=scale;
  records.push({enemy,frame:i+1,observedExportedPoint:point,targetExportedPoint:measurement.target,source,sourcePoint,sourceScaleBefore:f.sourceScale,sourceScaleAfter:scale,uniformScaleFactor:limited,groundBaseline:f.pivot.y,uncertaintyPx:4});
 }
 // Multi-frame sheets share a scale. These first halves already share one
 // pixel scale; retain it and move each whole frame by its measured landmark.
 for(const [i,f]of m.frames.entries()){
  const source=path.relative(root,path.resolve(root,'ready',id,f.originalSource)).replaceAll('\\','/');
  if(m.frames.filter(other=>other.originalSource===f.originalSource).length>1){
   scales[source]=f.sourceScale;
   anchors[i]={x:f.sourceAnchor.x+(measurement.points[i][0]-measurement.target[0])/f.sourceScale,y:f.sourceAnchor.y};
  }
 }
 layout[id]={...layout[id],anchors,scales,measurementRevision:'2026-10-14-resume',basis:'Approximate eye/helmet coordinates on exported PNG; fixed ground baseline; uniform scale only'};
}
writeAssetJson(file,layout);
if(records.length)writeAssetJson(path.join(root,'walk-registration-measurements.json'),{date:'2026-10-14 JST',coordinateSpace:'actual exported 512x512 PNG, distinct from planning guides',method:'manual landmark observations on 20px head grid, approximate +/-4px',records});
console.log(JSON.stringify({alignedWalks:Object.keys(observations).length,records:records.length}));
