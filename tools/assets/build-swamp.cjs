'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Mechanical slicing/registration only: all character and effect art comes from image_gen.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const { PNG } = require(require.resolve('pngjs', { paths: [__dirname, path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')] }));
const { pack, bounds } = require('./build-treant.cjs');
const sharp = require(require.resolve('sharp', { paths: [__dirname, path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')] }));
const { enemies, effects, prompt, effectPrompt } = require('./swamp-specs.cjs');
const root = path.resolve(__dirname, '../../public');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, data) => writeAssetJson(file, data);
const hydraRevisions={idle:'idle-facing-left-generated-v2.png',move:'move-facing-left-generated-v2.png',hit:'hit-five-left-generated-v2.png'};
const timing = { idle: [400,400,400,400], move: [150,140,170,180], hit: [80,100,120,160], down: [120,180,220,360],
  spit: [140,240,140,220], tongue: [140,160,140,240], punch: [120,220,120,220], grab: [120,220,180,260],
  windup: [180,180,180,180], slam: [140,160,180,300], attack: [140,220,140,240], chant: [200,200,200,200],
  'dark-cast': [200,220,180,280], charge: [240,240,240,240], breath: [180,180,300,220] };
const labels = { idle: '待機', move: '移動', hit: '被弾', down: '撃破' };
const loop = (e, id) => ['idle','move','windup','chant','charge'].includes(id) || e.id === 'hydra' && id === 'attack';
function isolatePoses(source,cols=2,rows=2,threshold=192){
  const w=source.width,h=source.height,labels=new Int32Array(w*h),queue=new Int32Array(w*h),components=[];let serial=0;
  for(let start=0;start<w*h;start++){
    if(labels[start]||source.data[start*4+3]<threshold)continue;
    const id=++serial;let head=0,tail=1;queue[0]=start;labels[start]=id;
    const b={id,count:0,left:w,top:h,right:0,bottom:0,cx:0,cy:0};
    while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);b.count++;b.cx+=x;b.cy+=y;b.left=Math.min(b.left,x);b.right=Math.max(b.right,x);b.top=Math.min(b.top,y);b.bottom=Math.max(b.bottom,y);
      for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx;if(!labels[n]&&source.data[n*4+3]>=threshold){labels[n]=id;queue[tail++]=n;}}
    }
    b.cx/=b.count;b.cy/=b.count;components.push(b);
  }
  const mains=[...components].sort((a,b)=>b.count-a.count).slice(0,cols*rows).sort((a,b)=>a.cy-b.cy);
  if(mains.length!==cols*rows)throw Error('Missing connected sprite poses');
  const ordered=[];for(let row=0;row<rows;row++)ordered.push(...mains.slice(row*cols,(row+1)*cols).sort((a,b)=>a.cx-b.cx));
  const owners=new Map(),boxes=ordered.map(m=>({...m}));
  for(const c of components){if(c.count<3)continue;let index=ordered.findIndex(m=>m.id===c.id);
    if(index<0)index=ordered.reduce((best,m,i)=>Math.hypot(c.cx-m.cx,c.cy-m.cy)<Math.hypot(c.cx-ordered[best].cx,c.cy-ordered[best].cy)?i:best,0);
    owners.set(c.id,index);const b=boxes[index];b.left=Math.min(b.left,c.left);b.right=Math.max(b.right,c.right);b.top=Math.min(b.top,c.top);b.bottom=Math.max(b.bottom,c.bottom);
  }
  const cw=Math.max(...boxes.map(b=>b.right-b.left+1))+32,ch=Math.max(...boxes.map(b=>b.bottom-b.top+1))+32;
  const out=new PNG({width:cw*cols,height:ch*rows});
  for(let p=0;p<w*h;p++){const index=owners.get(labels[p]);if(index===undefined)continue;const b=boxes[index],x=p%w-b.left+16+(index%cols)*cw,y=Math.floor(p/w)-b.top+16+Math.floor(index/cols)*ch;
    out.data.set(source.data.subarray(p*4,p*4+4),(y*out.width+x)*4);
  }
  return {image:out,boxes};
}
function separator(image,axis,center,start=0,end=axis==='x'?image.height:image.width,threshold=192) {
  const size=axis==='x'?image.width:image.height,low=Math.round(size*(center-.13)),high=Math.round(size*(center+.13));
  const runs=[];let first=null;
  for(let p=low;p<=high;p++){
    let occupied=false;for(let q=start;q<end;q++){const x=axis==='x'?p:q,y=axis==='x'?q:p;if(image.data[(y*image.width+x)*4+3]>=threshold){occupied=true;break;}}
    if(!occupied&&first===null)first=p;
    if((occupied||p===high)&&first!==null){if(p-first>=3)runs.push([first,p]);first=null;}
  }
  if(!runs.length)return Math.round(size*center);
  runs.sort((a,b)=>Math.abs((a[0]+a[1])/2-size*center)-Math.abs((b[0]+b[1])/2-size*center));
  return Math.round((runs[0][0]+runs[0][1])/2);
}
function grid(image,cols=2,rows=2,threshold=192){
  const ys=rows===1?[0,image.height]:[0,separator(image,'y',.5,0,image.width,threshold),image.height];
  const xs=Array.from({length:rows},(_,r)=>[0,...Array.from({length:cols-1},(_,i)=>separator(image,'x',(i+1)/cols,ys[r],ys[r+1],threshold)),image.width]);
  return {ys,xs};
}
function cell(image, cols, rows, index, layout) {
  const row=Math.floor(index/cols),col=index%cols;
  const x = layout?layout.xs[row][col]:Math.round(col * image.width / cols), y = layout?layout.ys[row]:Math.round(row * image.height / rows);
  const width = (layout?layout.xs[row][col+1]:Math.round((col+1)*image.width/cols))-x;
  const height = (layout?layout.ys[row+1]:Math.round((row+1)*image.height/rows))-y;
  const out = new PNG({ width, height });
  for(let row=0;row<height;row++)out.data.set(image.data.subarray(((row+y)*image.width+x)*4,((row+y)*image.width+x+width)*4),row*width*4);
  return out;
}
function events(e, id, frames) {
  const at = index => frames.slice(0,index).reduce((n,f)=>n+f.durationMs,0);
  const event = (type, effect, index=2, extra={}) => ({ id: e.id+'-'+id+'-'+index, type, effect, frame:index, timeMs:at(index), ...extra });
  if(id==='spit')return [event('spawn-projectile','toad-poison-bolt')];
  if(id==='tongue')return [event('melee','tongue',2,{ range:220 })];
  if(id==='grab')return [event('apply-status','mud-bind',2,{ status:'root',durationMs:2200,range:125 })];
  if(id==='punch')return [event('melee','mud-slam-impact',2,{power:1})];
  if(id==='slam')return [event('spawn-effect','mud-slam-impact',2,{power:3})];
  if(id==='attack'&&e.id==='lich')return [event('spawn-projectile','lich-energy-bolt')];
  if(id==='attack'&&e.id==='skeleton')return [event('melee','sword',2,{power:1})];
  if(id==='dark-cast')return [event('spawn-effect','lich-dark-magic',2,{power:3})];
  if(id==='charge')return [event('spawn-effect','hydra-poison-aura',0)];
  if(id==='breath')return [event('spawn-effect','hydra-poison-breath',1,{power:2})];
  if(id==='attack'&&e.id==='hydra')return frames.map((f,i)=>event('melee','bite',i,{power:.6}));
  return [];
}
async function refresh(dir,model) {
  const w=model.frameWidth,h=model.frameHeight,sheet=new PNG({width:w*model.frameCount,height:h});
  const gw=w*2,gh=h*2,raw=Buffer.alloc(gw*gh*4*model.frameCount);
  for(const f of model.frames){const image=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));
    for(let y=0;y<h;y++){
      sheet.data.set(image.data.subarray(y*w*4,(y+1)*w*4),(y*sheet.width+f.x)*4);
      for(let x=0;x<w;x++)for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)raw.set(image.data.subarray((y*w+x)*4,(y*w+x+1)*4),((f.index*gh+y*2+dy)*gw+x*2+dx)*4);
    }}
  fs.writeFileSync(path.join(dir,model.sheet),PNG.sync.write(sheet));
  await sharp(raw,{raw:{width:gw,height:gh*model.frameCount,channels:4,pageHeight:gh}})
    .gif({loop:model.loop?0:1,delay:model.frames.map(f=>f.durationMs),colours:256,dither:0,keepDuplicateFrames:true,interFrameMaxError:0}).toFile(path.join(dir,model.preview));
}
async function main({readyOnly=false}={}) {
  const catalog=read(path.join(root,'assets/enemies/index.json'));
  for(const e of enemies) {
    const base=path.join(root,'assets/enemies',e.id), defs=[];
    const neutral=PNG.sync.read(fs.readFileSync(path.join(base,'source/idle-generated.png')));
    const nb=bounds(cell(neutral,2,2,0,grid(neutral)));
    const scaleUnit=e.size/((nb.bottom-nb.top+1)/(neutral.height/2));
    const promptFile=path.join(base,'PROMPT.md');
    let prose='# '+e.label+' — 生成プロンプト\n\nBuilt-in image_gen / transparent PNG.\n\n基準: source/idle-generated.png。座標はセル内の百分率。接地点を共通pivotへ登録し、拡大縮小はnearest-neighbor。\n\n';
    for(const id of [...Object.keys(labels),...Object.keys(e.actions)]) {
      const halves=e.id==='skeleton'&&id==='move'?[1,2]:[null];
      const revisionFile=e.id==='hydra'&&id==='move'&&fs.existsSync(path.join(base,'source/move-facing-left-generated-v3.png'))?'move-facing-left-generated-v3.png':hydraRevisions[id];
      const revised=e.id==='hydra'&&revisionFile&&fs.existsSync(path.join(base,'source',revisionFile));
      const sourcePath=path.join(base,'source',revised?revisionFile:id+'-generated.png');
      const inputs=halves.length===2?halves.map(h=>path.join(base,'source/move-'+h+'-generated.png')):[sourcePath];
      if(readyOnly&&inputs.some(file=>!fs.existsSync(file)))continue;
      if(halves.length===2) {
        const singles=Array.from({length:6},(_,i)=>path.join(base,'source/move-single-'+(i+1)+'-generated.png'));
        if(singles.every(file=>fs.existsSync(file))){
          const targetHeight=nb.bottom-nb.top+1,poses=[];
          for(const file of singles){const original=isolatePoses(PNG.sync.read(fs.readFileSync(file)),1,1).image,b=bounds(original),ratio=targetHeight/(b.bottom-b.top+1);
            poses.push(PNG.sync.read(await sharp(PNG.sync.write(original)).resize(Math.round(original.width*ratio),Math.round(original.height*ratio),{kernel:'nearest'}).png().toBuffer()));}
          const cw=Math.max(...poses.map(p=>p.width))+32,ch=Math.max(...poses.map(p=>p.height))+32,joined=new PNG({width:cw*3,height:ch*2});
          for(const [i,p]of poses.entries())for(let y=0;y<p.height;y++)joined.data.set(p.data.subarray(y*p.width*4,(y+1)*p.width*4),((Math.floor(i/3)*ch+y+16)*joined.width+(i%3)*cw+16)*4);
          fs.writeFileSync(sourcePath,PNG.sync.write(joined));
        } else {
        // The separate three-pose sources are assembled without changing their artwork.
        const a=PNG.sync.read(fs.readFileSync(path.join(base,'source/move-1-generated.png')));
        const b=PNG.sync.read(fs.readFileSync(path.join(base,'source/move-2-generated.png')));
        const cellWidth=Math.max(Math.round(a.width/3),Math.round(b.width/3)),cellHeight=Math.max(a.height,b.height);
        const joined=new PNG({width:cellWidth*3,height:cellHeight*2});
        for(const [row,source] of [a,b].entries())for(let col=0;col<3;col++) {
          const original=cell(source,3,1,col,grid(source,3,1)),normalized=PNG.sync.read(await sharp(PNG.sync.write(original)).resize(cellWidth,cellHeight,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer());
          for(let y=0;y<cellHeight;y++)joined.data.set(normalized.data.subarray(y*cellWidth*4,(y+1)*cellWidth*4),((row*cellHeight+y)*joined.width+col*cellWidth)*4);
        }
        fs.writeFileSync(sourcePath,PNG.sync.write(joined));
        }
        const assembled=PNG.sync.read(fs.readFileSync(sourcePath));
        for(const [part,label]of [[0,'first'],[1,'second']])fs.writeFileSync(path.join(base,'source/move-'+label+'-half-final.png'),PNG.sync.write(cell(assembled,1,2,part)));
      }
      let image=PNG.sync.read(fs.readFileSync(sourcePath));const cols=halves.length===2?3:2, rows=2;
      if(e.id==='king-toad'&&id==='tongue'&&fs.existsSync(path.join(base,'source/tongue-extended-generated.png'))){
        const upper=cell(image,1,2,0),parts=isolatePoses(upper,2,1).image;
        const neutral=cell(parts,2,1,0),opening=cell(parts,2,1,1);
        const extension=isolatePoses(PNG.sync.read(fs.readFileSync(path.join(base,'source/tongue-extended-generated.png'))),1,1).image;
        const n=bounds(neutral),b=bounds(extension),ratio=(n.bottom-n.top+1)/(b.bottom-b.top+1);
        const extended=PNG.sync.read(await sharp(PNG.sync.write(extension)).resize(Math.round(extension.width*ratio),Math.round(extension.height*ratio),{kernel:'nearest'}).png().toBuffer());
        const poses=[neutral,opening,extended,neutral],cw=Math.max(...poses.map(p=>p.width))+32,ch=Math.max(...poses.map(p=>p.height))+32;
        image=new PNG({width:cw*2,height:ch*2});
        for(const [i,p] of poses.entries())for(let y=0;y<p.height;y++)image.data.set(p.data.subarray(y*p.width*4,(y+1)*p.width*4),((Math.floor(i/2)*ch+y+16)*image.width+(i%2)*cw+16)*4);
      }
      // Poses can cross an imaginary grid line while remaining physically isolated.
      // Extract their connected silhouettes, retaining source RGBA exactly, then pad.
      // The v3 edit has a dense translucent matte joining the two left poses.
      // Exclude that matte during mechanical extraction; retain selected RGBA.
      const alphaCutoff=revised&&id==='move'?245:192;
      const isolated=isolatePoses(image,cols,rows,alphaCutoff);image=isolated.image;
      if(revised&&Math.min(...isolated.boxes.map(b=>b.count))<Math.max(...isolated.boxes.map(b=>b.count))*.6)throw Error('Hydra revision contains merged or fragmented poses: '+id);
      const registered=path.join(base,'source',id+'-registered.png');fs.writeFileSync(registered,PNG.sync.write(image));
      const layout=grid(image,cols,rows);
      const count=halves.length===2?6:4, pivot={x:Math.round(e.width*.58),y:e.height-17};
      const durations=count===6?[120,120,120,120,120,120]:timing[id];
      const frames=durations.map((durationMs,i)=>({cell:i,durationMs,phase:count===6?['左脚前','右脚遊脚','右脚前へ','右脚前','左脚遊脚','左脚前へ'][i]:['開始','予備動作','作用','終端'][i]}));
      // Register the full footprint, not whichever single toe is lowest.
      frames.forEach((f,i)=>{const pose=cell(image,cols,rows,i,layout),b=bounds(pose,192);let left=pose.width,right=-1;
        const top=Math.max(b.top,b.bottom-Math.max(28,Math.round((b.bottom-b.top)*.18)));
        for(let y=top;y<=b.bottom;y++)for(let x=b.left;x<=b.right;x++)if(pose.data[(y*pose.width+x)*4+3]>=192){left=Math.min(left,x);right=Math.max(right,x);}
        let center=Math.round((left+right)/2);
        if(e.id.endsWith('toad')||e.id==='skeleton'){
          let sum=0,n=0;const bottom=Math.round(b.top+(b.bottom-b.top)*(e.id==='skeleton'?.38:.6));
          for(let y=b.top;y<=bottom;y++)for(let x=b.left;x<=b.right;x++)if(pose.data[(y*pose.width+x)*4+3]>=192){sum+=x;n++;}
          if(n)center=Math.round(sum/n);
        }
        f.anchor={x:center,y:b.bottom};});
      const firstBounds=bounds(cell(image,cols,rows,0,layout),192);
      const calibrated=(revised||(['idle','hit','down','spit','tongue','punch','grab','attack'].includes(id)&&e.id!=='hydra')||(e.id==='skeleton'&&id==='move'))?e.size/(firstBounds.bottom-firstBounds.top+1):scaleUnit/(PNG.sync.read(fs.readFileSync(sourcePath)).height/2);
      const spec={ enemy:e.id,id,label:labels[id]||e.actions[id],directory:'assets/enemies/'+e.id+'/motions/'+id,
        source:'../../source/'+id+'-registered.png',prompt:'../../PROMPT.md',frameWidth:e.width,frameHeight:e.height,pivot,
        columns:cols,columnEdgesByRow:layout.xs,rowEdges:layout.ys,
        scale:calibrated,anchorMode:'root',loop:loop(e,id),terminal:id==='down',alphaCutoff,frames,events:events(e,id,frames) };
      // Airborne offsets survive ground registration. World position remains separate.
      if(id==='move'&&e.id.endsWith('toad'))frames.forEach((f,i)=>f.offset={x:0,y:[0,-18,-42,0][i]});
      if(id==='move'&&e.id==='lich')frames.forEach((f,i)=>f.offset={x:0,y:[-10,-18,-26,-18][i]});
      const model=await pack(spec), dir=path.join(root,spec.directory);
      model.originalSource='../../source/'+path.basename(sourcePath);model.sourceExtraction=isolated.boxes;
      if(revised)model.anatomyRevision={heads:5,facing:'left',prompt:'../../source/'+revisionFile.replace(/\.png$/,'-prompt.txt'),previousSource:'../../source/'+id+'-generated.png'};
      if(e.id==='king-toad'&&id==='tongue')model.extraSources=['../../source/tongue-extended-generated.png','../../source/tongue-revision-prompt.txt'];
      const replace=(from,index,label)=>{const sourceDir=path.join(base,'motions',from),neutralModel=read(path.join(sourceDir,'manifest.json')),pose=neutralModel.frames[0];
        fs.copyFileSync(path.join(sourceDir,pose.file),path.join(dir,model.frames[index].file));
        model.frames[index]={...model.frames[index],bounds:pose.bounds,source:neutralModel.source,sourceCell:pose.sourceCell,sourceAnchor:pose.sourceAnchor,bakedOffset:pose.bakedOffset,reusedPose:from+'/0',phase:label};};
      if(!loop(e,id)&&id!=='down')replace('idle',count-1,'待機へ復帰');
      if(['hit','down','spit','tongue','punch','grab','attack'].includes(id)&&!loop(e,id))replace('idle',0,'待機から');
      if(id==='slam'&&fs.existsSync(path.join(base,'motions/windup/manifest.json')))replace('windup',0,'振りかぶりから');
      if(id==='breath'&&fs.existsSync(path.join(base,'motions/charge/manifest.json')))replace('charge',0,'毒ガス溜めから');
      if(model.frames.some(f=>f.reusedPose))await refresh(dir,model);
      model.region='poison-swamp';model.defaultZoom=1;
      if(id==='grab')model.transitions.idleLeadOutMs=2200;
      if(count===6) model.walkCycle={nearLeg:'left',farLeg:'right',parts:['../../source/move-first-half-final.png','../../source/move-second-half-final.png'],
        singlePoseSources:Array.from({length:6},(_,i)=>'../../source/move-single-'+(i+1)+'-generated.png'),guide:'../../source/walk-positions.json',
        phases:['left-contact','right-passing','right-approach','right-contact','left-passing','left-approach']};
      if(['spit','attack','grab','punch','slam','dark-cast','charge','breath'].includes(id)&&spec.events.length) {
        const known=spec.events.filter(ev=>effects.some(f=>f.id===ev.effect));
        model.effectPreview={paddingLeft:e.id==='hydra'?300:180,defaultZoom:1,target:{x:80,y:pivot.y},
          assets:known.map(ev=>({id:ev.effect,manifest:'../../../../effects/'+ev.effect+'/manifest.json'})),
          origin:{x:pivot.x-e.size*.38,y:pivot.y-e.size*.52}, targetRange:e.size*.5+70};
        if(['grab','punch','slam'].includes(id))model.effectPreview.target.x=model.frames[2].bounds.left+model.effectPreview.paddingLeft+20;
        if(id==='spit')model.effectPreview.origin.x=model.frames[2].bounds.left+8;
        if(e.id==='lich'&&id==='attack'){
          const pose=PNG.sync.read(fs.readFileSync(path.join(dir,model.frames[2].file))),b=model.frames[2].bounds;let sx=0,sy=0,n=0;
          for(let y=b.top;y<=b.bottom;y++)for(let x=b.left;x<=b.left+(b.right-b.left)*.24;x++){const p=(y*pose.width+x)*4,r=pose.data[p],g=pose.data[p+1],blue=pose.data[p+2];if(pose.data[p+3]>=192&&blue>160&&r>110&&blue>g*1.35){sx+=x;sy+=y;n++;}}
          if(n)model.effectPreview.origin={x:Math.round(sx/n),y:Math.round(sy/n)};
        }
        if(e.id==='hydra'){model.effectPreview.origin.x=model.frames[0].bounds.left+e.size*.28;model.effectPreview.target.x=140;}
      }
      save(path.join(dir,'manifest.json'),model);
      defs.push({id,label:spec.label,manifest:id+'/manifest.json'});
      prose+='## '+spec.label+'\n\n'+halves.map(half=>prompt(e,id,half)).join('\n\n')+'\n\n';
    }
    for(const file of fs.readdirSync(path.join(base,'source')).filter(f=>f.endsWith('prompt.txt')))prose+='## '+file+'\n\n'+fs.readFileSync(path.join(base,'source',file),'utf8')+'\n\n';
    fs.writeFileSync(promptFile,prose);save(path.join(base,'motions/index.json'),defs);
    const neutralModel=read(path.join(base,'motions/idle/manifest.json')),thumbnailBounds=neutralModel.frames[0].bounds;
    await sharp(path.join(base,'motions/idle',neutralModel.frames[0].file)).extract({left:thumbnailBounds.left,top:thumbnailBounds.top,width:thumbnailBounds.right-thumbnailBounds.left+1,height:thumbnailBounds.bottom-thumbnailBounds.top+1})
      .resize(160,160,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(base,'thumbnail.png'));
    const entry={id:e.id,label:e.label,name:e.name,region:'poison-swamp',boss:!!e.boss,majorBoss:!!e.majorBoss,
      summary:e.label+' · 毒の沼地',base:'assets/enemies/'+e.id+'/',thumbnail:'thumbnail.png',motionIndex:'motions/index.json',
      viewport:{width:e.width,height:e.height,pivot:{x:Math.round(e.width*.58),y:e.height-17}}};
    const index=catalog.findIndex(c=>c.id===e.id);if(index<0)catalog.push(entry);else catalog[index]=entry;
  }
  const effectIndex=read(path.join(root,'assets/effects/index.json'));
  for(const e of effects) {
    const dir=path.join(root,'assets/effects',e.id);makeAssetDirectory(dir,{recursive:true});
    if(readyOnly&&!fs.existsSync(path.join(dir,'source-generated.png')))continue;
    const initialPrompt=read(path.join(__dirname,'../../development/records/swamp-generation.json')).find(job=>job.effect===e.id)?.prompt||effectPrompt(e);
    fs.writeFileSync(path.join(dir,'PROMPT.md'),'# '+e.label+'\n\nBuilt-in image_gen / transparent PNG\n\n'+(fs.existsSync(path.join(dir,'source-revision-prompt.txt'))?fs.readFileSync(path.join(dir,'source-revision-prompt.txt'),'utf8'):initialPrompt)+'\n');
    const image=PNG.sync.read(fs.readFileSync(path.join(dir,'source-generated.png')));
    const ground=['toad-poison-impact','mud-bind','mud-slam-impact','lich-dark-magic'].includes(e.id);
    const layout=grid(image,2,2,32),sourceBounds=Array.from({length:4},(_,i)=>bounds(cell(image,2,2,i,layout),32));
    const scale=Math.min((e.width-24)/Math.max(...sourceBounds.map(b=>b.right-b.left+1)),(e.height-24)/Math.max(...sourceBounds.map(b=>b.bottom-b.top+1)));
    const breath=e.id==='hydra-poison-breath';
    const model=await pack({id:e.id,label:e.label,directory:'assets/effects/'+e.id,source:'source-generated.png',prompt:'PROMPT.md',
      frameWidth:e.width,frameHeight:e.height,pivot:{x:breath?e.width-12:Math.round(e.width/2),y:ground?e.height-12:Math.round(e.height/2)},
      columns:2,columnEdgesByRow:layout.xs,rowEdges:layout.ys,
      scale,anchorMode:ground?'ground':'bounds-center',alphaCutoff:32,loop:!!e.loop,
      frames:Array.from({length:4},(_,i)=>({cell:i,durationMs:e.loop?160:180,phase:['発生','展開','最大','収束'][i],
        ...(breath?{anchor:{x:sourceBounds[i].right,y:Math.round((sourceBounds[i].top+sourceBounds[i].bottom)/2)}}:{})}))});
    model.region='poison-swamp';model.facing='left';save(path.join(dir,'manifest.json'),model);
    const entry={id:e.id,label:e.label,manifest:e.id+'/manifest.json'},index=effectIndex.findIndex(f=>f.id===e.id);
    if(index<0)effectIndex.push(entry);else effectIndex[index]=entry;
  }
  save(path.join(root,'assets/enemies/index.json'),catalog);save(path.join(root,'assets/effects/index.json'),effectIndex);
}
if(require.main===module)main({readyOnly:process.argv.includes('--ready')}).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={enemies,effects,events,isolatePoses,buildSwamp:main};
