'use strict';
const fs=require('node:fs'),path=require('node:path');
const {developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2'),file=path.join(root,'layout.json'),layout=JSON.parse(fs.readFileSync(file));
const measurements={
 fireball:{points:[[173,275],[161,255],[169,239],[162,254]],pivot:{x:256,y:256},basis:'Constrained white core centroid, visually checked against sphere outline'},
 'lava-bomb':{points:[[170,312],[171,307],[168,312],[172,314]],pivot:{x:256,y:256},basis:'Approximate basalt sphere center, excluding the diagonal flame tail'},
 'fire-fan':{points:[[467,258],[467,261],[468,269],[467,256]],pivot:{x:384,y:256},basis:'Round mouth emitter, not the outer flame or sparse sparks'},
 'fire-beam':{points:[[418,262],[420,261],[446,265],[437,262]],pivot:{x:384,y:256},basis:'Round mouth emitter; final sparse phase retains planned source location'},
 fissure:{points:[[292,318],[349,313],[391,307],[391,307]],pivot:{x:384,y:338},basis:'Right-hand fissure onset at axe contact, not the center of growing crack'}
};
const records=[];
for(const [effect,row]of Object.entries(measurements)){
 const id='effects/'+effect,m=JSON.parse(fs.readFileSync(path.join(root,'ready',id,'manifest.json')));
 if(layout[id]?.measurementRevision==='2026-10-14-resume')continue;
 const anchors=m.frames.map((f,i)=>({x:f.sourceAnchor.x+(row.points[i][0]-f.pivot.x)/f.sourceScale,y:f.sourceAnchor.y+(row.points[i][1]-f.pivot.y)/f.sourceScale}));
 layout[id]={...layout[id],anchors,pivot:row.pivot,measurementRevision:'2026-10-14-resume',basis:row.basis};
 records.push({id,coordinateSpace:'actual exported 512x512 PNG; approximate +/-7px',points:row.points,sourceAnchors:anchors,pivot:row.pivot,basis:row.basis});
}
writeAssetJson(file,layout);if(records.length)writeAssetJson(path.join(root,'effect-registration-measurements.json'),{date:'2026-10-14 JST',records});
console.log(JSON.stringify({alignedEffects:records.length}));
