'use strict';
// Import safe original rectangles as UNREVIEWED candidates, preserving revisions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{PNG}=require('pngjs');
const {developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs'),{extract}=require('./build-ruins.cjs'),{bounds}=require('./build-treant.cjs'),{enemies}=require('./late-stage-first-pass-specs.cjs');
const root=developmentAsset('demon-castle-motions/v2'),old=developmentAsset('late-stage-first-pass/v1'),read=(base,f)=>JSON.parse(fs.readFileSync(path.join(base,f),'utf8'));
const selection=read(root,'selection.json'),jobs=read(old,'jobs.json').filter(j=>j.region==='demon-castle'&&j.enemy&&j.enemy!=='demon-god'),notes=read(old,'review-notes.json'),groups=new Map(),blocked=[],provenance=[];
function torso(cell,b){const xs=[];for(let y=Math.floor(b.top+(b.bottom-b.top)*.5);y<Math.floor(b.top+(b.bottom-b.top)*.75);y++)for(let x=b.left;x<=b.right;x++)if(cell.data[(y*cell.width+x)*4+3]>192)xs.push(x);xs.sort((a,b)=>a-b);return xs[Math.floor(xs.length/2)]||(b.left+b.right)/2;}
for(const j of jobs){
 const motion=j.motion?.startsWith('move-')?'move':j.motion,ids=j.motion==='reaction'?['hit','down']:[motion];
 if(ids.every(m=>selection.clips[j.enemy+'/'+m]))continue;
 const file=path.join(old,j.source);let e;
 try{e=extract(file,j.cols,j.rows);if(e.method==='connected-components')throw Error('Unsafe rectangle extraction; no masks permitted');}catch(err){blocked.push({id:j.id,clip:j.enemy+'/'+motion,reason:err.message,priorIssues:notes[j.id]?.issues||[]});continue;}
 const bs=e.cells.map(c=>bounds(c,32)),anchors=e.cells.map((c,i)=>[torso(c,bs[i]),bs[i].bottom]),referenceHeight=j.motion==='reaction'?bs[1].bottom-bs[1].top+1:bs[0].bottom-bs[0].top+1,ideal=(j.enemy==='imp'?200:j.enemy==='dream-demon'?260:250)/referenceHeight;
 const scale=Math.min(ideal,...e.cells.map((c,i)=>Math.min(292/Math.max(1,anchors[i][0]),204/Math.max(1,c.width-anchors[i][0]),402/Math.max(1,anchors[i][1]),59/Math.max(1,c.height-anchors[i][1]))));
 provenance.push({id:j.id,file:path.relative(root,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),extraction:e.method,scale});
 function add(m,indices){const id=j.enemy+'/'+m;if(selection.clips[id])return;const g=groups.get(id)||{id,label:enemies.find(x=>x.id===j.enemy).label+'・'+({idle:'待機',move:'移動',hit:'被弾',down:'撃破'}[m]||j.label),enemy:j.enemy,motion:m,origin:'first-pass',reference:'../../late-stage-first-pass/v1/references/'+j.enemy+'.png',loop:['idle','move'].includes(m),terminal:m==='down',frames:[],inheritedIssues:[],sourceJobs:[]};
  const hover=enemies.find(x=>x.id===j.enemy).gait==='hover';
  for(const cell of indices){const r=e.rects[cell],i=g.frames.length;g.frames.push({source:path.relative(root,file).replaceAll('\\','/'),rect:{left:r.x,top:r.y,width:r.width,height:r.height},anchor:anchors[cell],scale,target:[300,m==='down'?445:hover?400+([0,-3,0,3][i]||0):410],durationMs:m==='move'?120:m==='idle'?180:m==='hit'?[180,220][i]:m==='down'?[400,1000][i]:[100,180,140,220][i],phase:m==='move'?'移動'+(i+1):m==='idle'?'待機'+(i+1):m==='hit'?['被弾','復帰'][i]:m==='down'?['崩れる','終端保持'][i]:['構え','溜め','発動','復帰'][i]});}
  g.inheritedIssues.push(...(notes[j.id]?.issues||[]));g.sourceJobs.push(j.id);groups.set(id,g);
 }
 if(j.motion==='reaction'){add('hit',[0,1]);add('down',[2,3]);}else add(motion,e.cells.map((_,i)=>i));
}
let added=0;for(const [id,g]of groups){const gait=enemies.find(x=>x.id===g.enemy).gait,expected=g.motion==='move'?(gait==='hover'?4:6):['hit','down'].includes(g.motion)?2:4;if(g.frames.length!==expected||blocked.some(b=>b.clip===id)){blocked.push({id,reason:'Incomplete clip; expected '+expected+' frames, got '+g.frames.length});continue;}selection.clips[id]=g;added++;}
writeAssetJson(path.join(root,'selection.json'),selection);writeAssetJson(path.join(root,'first-pass-import.json'),{date:'2026-10-15 JST',status:'unreviewed; imported originals are not accepted',added,provenance,blocked});
console.log(JSON.stringify({added,clips:Object.keys(selection.clips).length,blocked}));
