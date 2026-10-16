'use strict';
// Slice, register and sample generated RGBA. Never repaint or mask artwork.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),sharp=require('sharp'),{PNG}=require('pngjs');
const {developmentAsset,makeAssetDirectory,writeAssetJson,ROOT}=require('../lib/project-paths.cjs');
const {extract}=require('./build-ruins.cjs');
const root=developmentAsset('volcano-motions/v2'),partial=process.argv.includes('--partial');
const SIZE=512;
const ORIGIN_X=384;
// Avoid opening unchanged derived files for writing during iterative review.
// Replace a complete temporary output, so a failed encoder cannot truncate it.
function writeImage(file,buffer){
 if(fs.existsSync(file)&&fs.readFileSync(file).equals(buffer))return;
 const temporary=file+'.building';
 fs.writeFileSync(temporary,buffer);fs.renameSync(temporary,file);
}
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const relative=(a,b)=>path.relative(a,b).replaceAll('\\','/');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function metrics(img){let clear=0,edge=0,minX=img.width,minY=img.height,maxX=-1,maxY=-1,vx=img.width,vy=img.height,vr=-1,vb=-1;
 for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){const a=img.data[(y*img.width+x)*4+3];if(!a)clear++;if(a){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}if(a>32){vx=Math.min(vx,x);vy=Math.min(vy,y);vr=Math.max(vr,x);vb=Math.max(vb,y);if(x===0||y===0||x===img.width-1||y===img.height-1)edge++;}}
 return{transparentFraction:clear/(img.width*img.height),edgeOpaquePixels:edge,bounds:{left:minX,top:minY,right:maxX,bottom:maxY},visibleBounds:{left:vx,top:vy,right:vr,bottom:vb},width:img.width,height:img.height};
}
function median(values){values.sort((a,b)=>a-b);return values[Math.floor(values.length/2)];}
function torsoX(img,b){const xs=[];for(let y=Math.round(b.top+(b.bottom-b.top)*.6);y<Math.round(b.top+(b.bottom-b.top)*.79);y++)for(let x=b.left;x<=b.right;x++)if(img.data[(y*img.width+x)*4+3]>192)xs.push(x);return xs.length?median(xs):(b.left+b.right)/2;}
const windups={'lava-salamander/danger-1':2400,'obsidian-soldier/danger-1':2600,'young-fire-dragon/danger-1':2800,'magma-salamander/danger-1':4400,'magma-salamander/danger-2':4200,'obsidian-executioner/danger-1':4400,'obsidian-executioner/danger-2':4800,'dragon-girl/danger-1':4400,'dragon-girl/danger-2':4800,'dragon/danger-1':4600,'dragon/danger-2':5000,'dragon/danger-3':5200};
const releaseGap=item=>['dragon/danger-3','dragon-girl/danger-2'].includes(item.id)?900:item.id==='dragon/danger-2'?1000:800;
function timing(item){
 if(item.motion==='move')return Array(6).fill(120);
 if(item.motion==='idle')return Array(4).fill(180);
 if(item.motion==='hit')return[180,220];if(item.motion==='down')return[400,1000];
 if(item.effect)return Array(4).fill(['fireball','lava-bomb','lava-pool','burn','armor-break'].includes(item.effect)?120:140);
 if(item.motion==='attack')return[100,180,140,220];
 const gap=releaseGap(item);
 return[180,windups[item.id]-180,600+((item.repeat||1)-1)*gap,300];
}
function events(item,frames){if(!item.enemy||!item.effects?.length)return[];
 const at=frames[0].durationMs+frames[1].durationMs,projectile=item.effects.find(id=>['fireball','lava-bomb'].includes(id)),primary=projectile||item.effects[0],repeat=item.repeat||1,gap=releaseGap(item);
 return Array.from({length:repeat},(_,i)=>({id:primary,timeMs:at+i*gap,slot:i,placement:projectile?'projectile':primary==='fire-beam'||primary==='fire-fan'?'origin':primary==='landing-shock'||primary==='fissure'?'self-ground':'target',impact:projectile?item.effects.find(id=>id.endsWith('impact')):null,residue:item.effects.includes('lava-pool')?'lava-pool':null,originFrame:2}));
}
async function main(){
 const plan=read('plan.json'),selection=read('selection.json'),layout=fs.existsSync(path.join(root,'layout.json'))?read('layout.json'):{},notes=fs.existsSync(path.join(root,'review-notes.json'))?read('review-notes.json'):{},sources=[],groups=new Map(),missing=[],cache=new Map();
 if(process.argv.includes('--review-only')){
  const qa=read('qa.json'),index=read('review-index.json');
  for(const clip of qa.clips){const n=notes[clip.id],checked=n?.fingerprint===clip.fingerprint;clip.framesChecked=checked&&n.framesChecked===true;clip.playbackChecked=checked&&n.playbackChecked===true;clip.bodyReview=checked?n:null;clip.accepted=checked&&n.accepted===true;const entry=index.find(c=>c.id===clip.id),file=path.join(root,entry.manifest),m=JSON.parse(fs.readFileSync(file,'utf8'));m.frameSequence=m.frames.map((_,i)=>i);m.acceptedForIntegration=clip.accepted;writeAssetJson(file,m);}
  writeAssetJson(path.join(root,'qa.json'),qa);console.log(JSON.stringify({reviewUpdated:true,clips:qa.clips.length,accepted:qa.clips.filter(c=>c.accepted).length}));return;
 }
 for(const job of plan.jobs){
  const separate=selection.frameSources?.[job.id];
  for(const selected of separate||[selection.overrides[job.id]||job.source]){
  const file=path.join(root,selected);if(!fs.existsSync(file)){missing.push(job.id+(separate?' ('+selected+')':''));continue;}
  const full=PNG.sync.read(fs.readFileSync(file)),stats=metrics(full);assert.equal(stats.edgeOpaquePixels,0,'Original edge clipping '+job.id);assert.ok(stats.transparentFraction>.1,'Source lacks clear alpha '+job.id);
  const e=extract(file,separate?1:job.cols,separate?1:job.rows);if(partial&&e.method==='connected-components'){missing.push(job.id+' (unsafe extraction)');continue;}assert.notEqual(e.method,'connected-components','No pixel masks permitted: '+job.id);
  const source={id:job.id,file:selected,sha256:hash(file),...stats,extraction:e.method,rects:e.rects};sources.push(source);cache.set(selected,{job,selected,e,source});
  function add(motion,cells,indices){const id=job.enemy?job.enemy+'/'+motion:job.id,previous=groups.get(id)||{...job,id,motion,cells:[],inputs:[]};
   previous.cells.push(...cells);previous.inputs.push(...indices.map(cell=>({source:selected,cell,rect:e.rects[cell],job:job.id})));groups.set(id,previous);}
  if(job.motion==='reaction'){add('hit',e.cells.slice(0,2),[0,1]);add('down',e.cells.slice(2,4),[2,3]);}
  else if(job.motion==='move-single'||job.motion?.startsWith('move-'))add('move',e.cells,e.cells.map((_,i)=>i));
  else add(job.motion||'effect',e.cells,e.cells.map((_,i)=>i));
  }
 }
 assert.ok(partial||!missing.length,'Unfinished jobs: '+missing.join(', '));
 const catalog=[],qa=[],sheetScales=new Map();
 const pivotFor=(item,bip)=>layout[item.id]?.pivot||(item.effect?{x:item.kind==='origin'?ORIGIN_X:SIZE/2,y:item.kind==='ground'||item.effect==='lava-pool'?338:SIZE/2}:{x:bip?290:300,y:338});
 for(const s of cache.values()){
  const enemy=plan.enemies.find(e=>e.id===s.job.enemy),bip=enemy?.gait==='walk',bs=s.e.cells.map(c=>metrics(c).visibleBounds),base=bs[s.job.motion==='reaction'?1:0];
  const ideal=s.job.effect?Math.min(300/(base.right-base.left+1),270/(base.bottom-base.top+1)):bip?235/(base.bottom-base.top+1):280/(base.right-base.left+1);
  const group=[...groups.values()].find(g=>g.inputs.some(input=>input.source===s.selected)),custom=layout[group.id],target=pivotFor(group,bip);
  const limits=s.e.cells.map((cell,i)=>{const b=bs[i],full=metrics(cell).bounds,index=group.inputs.findIndex(input=>input.source===s.selected&&input.cell===i),manual=custom?.anchors?.[index],x=manual?.x??(s.job.effect?(s.job.kind==='origin'?b.right:(b.left+b.right)/2):torsoX(cell,b)),y=manual?.y??(s.job.effect?(s.job.kind==='ground'||s.job.effect==='lava-pool'?b.bottom:(b.top+b.bottom)/2):b.bottom);
   const tx=target.x,ty=target.y;
   return Math.min((tx-8)/Math.max(1,x-full.left),(SIZE-8-tx)/Math.max(1,full.right-x+1),(ty-8)/Math.max(1,y-full.top),(SIZE-8-ty)/Math.max(1,full.bottom-y+1));});
  sheetScales.set(s.selected,Math.min(custom?.scales?.[s.selected]||ideal,...limits));
 }
 for(const item of groups.values()){
  if(item.motion==='move'&&item.cells.length!==6){if(partial)continue;throw Error('Incomplete move '+item.id);}
  const enemy=plan.enemies.find(e=>e.id===item.enemy),bip=enemy?.gait==='walk',dir=path.join(root,'ready',item.id);makeAssetDirectory(dir);
  const durations=timing(item),bb=item.cells.map(c=>metrics(c).bounds),visible=item.cells.map(c=>metrics(c).visibleBounds);
  const frames=[],buffers=[],registration=[];
  for(const [i,cell]of item.cells.entries()){
   const input=item.inputs[i],b=bb[i],v=visible[i],scale=sheetScales.get(input.source),manual=layout[item.id]?.anchors?.[i];
   const anchor=manual||{x:item.effect?(item.kind==='origin'?v.right:(v.left+v.right)/2):torsoX(cell,v),y:item.effect?(item.kind==='ground'||item.effect==='lava-pool'?v.bottom:(v.top+v.bottom)/2):v.bottom};
   const target=pivotFor(item,bip);
   const width=Math.round((b.right-b.left+1)*scale),height=Math.round((b.bottom-b.top+1)*scale);
   const left=Math.round(target.x+(b.left-anchor.x)*scale),top=Math.round(target.y+(b.top-anchor.y)*scale);
   assert.ok(left>=4&&top>=4&&left+width<=SIZE-4&&top+height<=SIZE-4,'Export clipping '+item.id+'/'+i+' '+JSON.stringify({left,top,width,height,scale}));
   const pixels=await sharp(PNG.sync.write(cell)).extract({left:b.left,top:b.top,width:b.right-b.left+1,height:b.bottom-b.top+1}).resize(width,height,{kernel:'nearest'}).png().toBuffer();
   const frame=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:pixels,left,top}]).png().toBuffer(),filename='frame-'+(i+1)+'.png';
   writeImage(path.join(dir,filename),frame);buffers.push(frame);
   const frameInfo={file:filename,durationMs:durations[i],...metrics(PNG.sync.read(frame)),originalSource:relative(dir,path.join(root,input.source)),sourceCell:input.cell,sourceRect:input.rect,sourceScale:scale,sourceAnchor:anchor,pivot:target};
   frames.push(frameInfo);registration.push({frame:i,source:input.source,anchor,scale,exportPivot:target,method:manual?'manual landmark measurement':'opaque torso strip median and bottom baseline; review required'});
  }
  const loop=item.motion==='idle'||item.motion==='move'||['fireball','lava-bomb','lava-pool','burn','armor-break'].includes(item.effect);
  const label={idle:'待機',move:'移動',hit:'被弾',down:'撃破'}[item.motion]||item.label;
  const manifest={id:item.id,enemy:item.enemy||null,region:'volcano',label,kind:item.kind||null,motion:item.motion,frameWidth:SIZE,frameHeight:SIZE,frameCount:frames.length,frameSequence:frames.map((_,i)=>i),durationMs:durations.reduce((a,b)=>a+b,0),pivot:frames[0].pivot,facing:'left',loop,terminal:item.motion==='down',endBehavior:item.motion==='down'?'hold':loop?'loop':'stop',previewOnly:true,runtimeRegistered:false,acceptedForIntegration:false,reference:enemy?relative(dir,path.join(root,'references',enemy.id+'.png')):null,originalSources:[...new Set(item.inputs.map(f=>relative(dir,path.join(root,f.source))))],sheet:'sheet.png',preview:relative(dir,path.join(root,'review',item.id,'preview.gif')),frames,events:events(item,frames),effects:item.effects||[]};
  if(item.motion==='move')manifest.walkCycle={gait:enemy.gait,nearLeg:'left',farLeg:'right',swingPairs:enemy.gait==='trot'?['A','A','B','B','B','A']:null};
  manifest.repeatRelease=Boolean(item.repeat>1);
  if(layout[item.id]?.releaseOrigin)manifest.releaseOrigin=layout[item.id].releaseOrigin;
  writeAssetJson(path.join(dir,'manifest.json'),manifest);
  writeImage(path.join(dir,'sheet.png'),await sharp({create:{width:SIZE*frames.length,height:SIZE,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(buffers.map((input,i)=>({input,left:i*SIZE,top:0}))).png().toBuffer());
  const review=path.join(root,'review',item.id);makeAssetDirectory(review);
  const raw=Buffer.concat(await Promise.all(buffers.map(input=>sharp(input).raw().toBuffer())));
  writeImage(path.join(review,'preview.gif'),await sharp(raw,{raw:{width:SIZE,height:SIZE*frames.length,channels:4,pageHeight:SIZE}}).gif({delay:durations,loop:0,dither:0}).toBuffer());
  const columns=Math.min(3,frames.length);
  writeImage(path.join(review,'contact.png'),await sharp({create:{width:SIZE*columns,height:SIZE*Math.ceil(frames.length/columns),channels:4,background:'#c6d3de'}}).composite(buffers.map((input,i)=>({input,left:(i%columns)*SIZE,top:Math.floor(i/columns)*SIZE}))).png().toBuffer());
  const fingerprint=crypto.createHash('sha256').update(buffers.map(buffer=>crypto.createHash('sha256').update(buffer).digest('hex')).join('')).digest('hex'),checked=notes[item.id]?.fingerprint===fingerprint;
  if(checked&&notes[item.id].accepted){manifest.acceptedForIntegration=true;writeAssetJson(path.join(dir,'manifest.json'),manifest);}
  qa.push({id:item.id,fingerprint,frames:frames.length,registration,framesChecked:checked&&notes[item.id].framesChecked===true,playbackChecked:checked&&notes[item.id].playbackChecked===true,accepted:checked&&notes[item.id].accepted===true});
  catalog.push({id:item.id,enemy:item.enemy||null,label,motion:item.motion,kind:item.kind||null,manifest:relative(root,path.join(dir,'manifest.json')),contact:relative(root,path.join(review,'contact.png')),gif:relative(root,path.join(review,'preview.gif'))});
 }
 writeAssetJson(path.join(root,'review-index.json'),catalog);writeAssetJson(path.join(root,'qa.json'),{date:'2026-10-14 JST',sources,clips:qa,missing,complete:missing.length===0,runtimeRegistered:false});
 const records=[];function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,d.name);if(d.isDirectory())walk(f);else if(d.name.endsWith('.generation.json'))records.push(JSON.parse(fs.readFileSync(f,'utf8')));}}walk(path.join(root,'sources'));
 writeAssetJson(path.join(root,'generation.json'),{tool:'built-in image_gen',references:plan.references,records});
 console.log(JSON.stringify({clips:catalog.length,frames:qa.reduce((n,q)=>n+q.frames,0),sources:sources.length,missing:missing.length,accepted:qa.filter(q=>q.accepted).length,root:relative(ROOT,root)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
