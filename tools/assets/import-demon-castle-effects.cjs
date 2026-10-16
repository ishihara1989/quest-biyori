'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {developmentAsset,ROOT,writeAssetJson}=require('../lib/project-paths.cjs'),{extract}=require('./build-ruins.cjs'),{bounds}=require('./build-treant.cjs');
const root=developmentAsset('demon-castle-motions/v2'),read=f=>JSON.parse(fs.readFileSync(f,'utf8')),selection=read(path.join(root,'selection.json')),records=[];
const relative=f=>path.relative(root,f).replaceAll('\\','/'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function brightCore(cell,b){const xs=[],ys=[];for(let y=b.top;y<=b.bottom;y++)for(let x=b.left;x<=b.right;x++){const i=(y*cell.width+x)*4,[r,g,blue,a]=cell.data.subarray(i,i+4);if(a>192&&r>245&&g>210&&blue>230){xs.push(x);ys.push(y);}}if(!xs.length)return[(b.left+b.right)/2,(b.top+b.bottom)/2];xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);return[xs[Math.floor(xs.length/2)],ys[Math.floor(ys.length/2)]];}
function original(id,label,kind){const source=path.join(ROOT,'development/assets/late-stage-first-pass/v1/sources/effects',id+'-generated.png'),e=extract(source);if(e.method==='connected-components')throw Error('Unsafe '+id);const bs=e.cells.map(c=>bounds(c,32)),target=kind==='ground'?[256,410]:id==='black-ring-slash'?[350,256]:[256,256];
 const anchors=bs.map((b,i)=>id==='curse-impact'?brightCore(e.cells[i],b):kind==='ground'?[(b.left+b.right)/2,b.bottom-(b.right-b.left)*.07]:id==='black-ring-slash'?[b.left+(b.right-b.left)*.72,(b.top+b.bottom)/2]:[384+(i%2)*768-e.rects[i].x,256+Math.floor(i/2)*512-e.rects[i].y]);
 const ideal=id==='demon-pillar'?.5:id==='black-ring-slash'?.43:id==='demon-impact'?.34:.36;
 const scale=Math.min(ideal,...e.cells.map((c,i)=>Math.min((target[0]-8)/anchors[i][0],(504-target[0])/(c.width-anchors[i][0]),(target[1]-8)/anchors[i][1],(504-target[1])/(c.height-anchors[i][1]))));
 selection.clips['effects/'+id]={label,motion:'effect',kind,origin:'first-pass',frames:e.rects.map((r,i)=>({source:relative(source),rect:{left:r.x,top:r.y,width:r.width,height:r.height},anchor:anchors[i],scale,target,durationMs:id==='demon-impact'?[60,80,80,60][i]:[80,140,180,120][i],phase:['発生','展開','最大','収束'][i]})),productionChoice:id==='curse-impact'?'Register the bright impact nucleus rather than the empty ring center.':kind==='ground'?'Register the ground ellipse center; one scale across all poses.':'Register one shared origin; retain original RGBA and hide after the last frame.'};
 records.push({id,original:relative(source),sha256:hash(source),extraction:e.method,anchors,scale});
}
for(const args of [['black-ring-slash','黒環薙ぎ・円弧','arc'],['curse-impact','呪弾・着弾','impact'],['demon-pillar','単独の魔柱','ground'],['demon-impact','魔拳・衝撃','impact']])original(...args);
const reuse=[
 ['silence-seal','沈黙・封印','status','public/assets/skills/ninja/effects/seal/manifest.json',2],
 ['curse','呪い・付与','status','public/assets/skills/shaman/effects/mark/manifest.json',2],
 ['end-cross','交差用の単帯','beam','public/assets/effects/ruins-furnace-beam/manifest.json',1],
 ['end-ring','終撃の輪','ring','public/assets/skills/ninja/effects/final-ring/manifest.json',2],
 ['armor-break','破甲・状態ループ','status','development/assets/volcano-motions/v2/ready/effects/armor-break/manifest.json',1],
 ['burn','火傷・状態ループ','status','development/assets/volcano-motions/v2/ready/effects/burn/manifest.json',1],
 ['claw-arc','爪撃・軌跡','arc','development/assets/volcano-motions/v2/ready/effects/claw-arc/manifest.json',1]
];
for(const [id,label,kind,file,scale]of reuse){const manifest=path.join(ROOT,file),m=read(manifest),pivot=m.pivot||{x:m.frameWidth/2,y:m.frameHeight/2},target=kind==='beam'?[400,256]:[256,256];selection.clips['effects/'+id]={label,motion:'effect',kind,origin:'reuse',loop:!!m.loop,reusedManifest:relative(manifest),frames:m.frames.map((f,i)=>({source:relative(path.join(path.dirname(manifest),f.file)),anchor:[pivot.x,pivot.y],scale,target,durationMs:f.durationMs,phase:'既存'+(i+1)})),productionChoice:'Reuse approved native RGB/alpha without recoloring; placement and rendering scale only.'};records.push({id,manifest:relative(manifest),manifestSha256:hash(manifest),frames:m.frames.map(f=>({file:relative(path.join(path.dirname(manifest),f.file)),sha256:hash(path.join(path.dirname(manifest),f.file))}))});}
const gateSource=path.join(root,'sources/effects/summon-gate-v2.png'),g=extract(gateSource),ga=[[330,540],[315,540],[335,499],[302,499]];
if(g.method==='connected-components')throw Error('Unsafe summon gate');
selection.clips['effects/summon-gate']={label:'悪魔の援軍・召喚門',motion:'effect',kind:'ground',frames:g.rects.map((r,i)=>({source:relative(gateSource),rect:{left:r.x,top:r.y,width:r.width,height:r.height},anchor:ga[i],scale:.59,target:[256,410],durationMs:[100,180,220,180][i],phase:['枠の出現','開く','保持','消失'][i]}))};
writeAssetJson(path.join(root,'selection.json'),selection);writeAssetJson(path.join(root,'effect-reuse.json'),{date:'2026-10-15 JST',runtimeRegistered:false,records,unusedFirstPassEffects:['demon-arm-arc','silence-seal','end-cross','end-ring','curse']});console.log(JSON.stringify({clips:Object.keys(selection.clips).length,reuse:reuse.length,registeredOriginalEffects:4,newGate:true}));
