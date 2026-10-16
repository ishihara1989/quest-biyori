'use strict';
const fs=require('node:fs'),path=require('node:path');
const {developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2'),file=path.join(root,'layout.json'),layout=JSON.parse(fs.readFileSync(file));
const origins={
 'lava-salamander/danger-1':[155,261],
 'young-fire-dragon/danger-1':[156,236],
 'magma-salamander/danger-1':[154,269],
 'magma-salamander/danger-2':[154,276],
 'dragon-girl/danger-1':[150,176],
 'dragon-girl/danger-2':[189,161],
 'dragon/danger-2':[155,224],
 'dragon/danger-3':[216,232]
};
for(const [id,point]of Object.entries(origins))layout[id]={...layout[id],releaseOrigin:{x:point[0],y:point[1]},releaseOriginBasis:'Approximate mouth/palm observation on actual exported frame3, +/-7px; flight rise included'};
for(const [id,lifts]of Object.entries({'dragon/danger-1':[0,70,0,0],'dragon/danger-3':[0,80,80,0]})){
 if(layout[id]?.riseApplied)continue;
 const m=JSON.parse(fs.readFileSync(path.join(root,'ready',id,'manifest.json')));
 layout[id]={...layout[id],anchors:m.frames.map((f,i)=>({x:f.sourceAnchor.x,y:f.sourceAnchor.y+lifts[i]/f.sourceScale})),riseApplied:true,verticalPoseRisePx:lifts,basis:'Whole-frame translation for planned flight height; feet/paws are not edited'};
}
writeAssetJson(file,layout);console.log(JSON.stringify({releaseOrigins:Object.keys(origins).length,flightClips:2}));
