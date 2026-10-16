'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Only crop, register and sample generated pixels. No procedural replacement art.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {PNG}=require(require.resolve('pngjs',{paths:[__dirname,bundled]})),sharp=require(require.resolve('sharp',{paths:[__dirname,bundled]}));
const {isolatePoses}=require('./build-swamp.cjs'),{pack,bounds}=require('./build-treant.cjs');
const {enemies,effects,materials,prompt,effectPrompt,timing,loops}=require('./expansion-specs.cjs');
const X=require('../../public/js/combat/expansion-combat.js');
const root=path.resolve(__dirname,'../../public'),read=f=>JSON.parse(fs.readFileSync(f,'utf8')),save=(f,x)=>writeAssetJson(f, x);
const ready=process.argv.includes('--ready'),failures=[];
function pose(image,col,row,cols=2,rows=2){const w=image.width/cols,h=image.height/rows,out=new PNG({width:w,height:h});for(let y=0;y<h;y++)out.data.set(image.data.subarray(((row*h+y)*image.width+col*w)*4,((row*h+y)*image.width+(col+1)*w)*4),y*w*4);return out;}
function register(file,cols=2,rows=2,threshold=192){const source=PNG.sync.read(fs.readFileSync(file)),r=isolatePoses(source,cols,rows,threshold);
  assert.ok(r.boxes.every(b=>b.left>0&&b.top>0&&b.right<source.width-1&&b.bottom<source.height-1),'Generated source clipped: '+file);
  const minimum=Math.min(...r.boxes.map(b=>b.count)),maximum=Math.max(...r.boxes.map(b=>b.count));assert.ok(minimum/maximum>.08,'Merged/fragmented poses: '+file);
  return r;
}
function join(a,b){const cw=Math.max(a.width/3,b.width/3),h=Math.max(a.height,b.height),w=cw*3,out=new PNG({width:w,height:h*2});
  for(const [row,img]of [a,b].entries()){const sw=img.width/3;for(let col=0;col<3;col++)for(let y=0;y<img.height;y++){
    const from=(y*img.width+col*sw)*4,to=((row*h+y)*w+col*cw+Math.floor((cw-sw)/2))*4;
    out.data.set(img.data.subarray(from,from+sw*4),to);
  }}return out;
}
function upsert(list,entry){const i=list.findIndex(x=>x.id===entry.id);if(i<0)list.push(entry);else list[i]=entry;}
function footAnchor(img,b,fly){if(fly)return{x:Math.round((b.left+b.right)/2),y:b.bottom};const columns=Array(img.width).fill(0);let total=0;
  for(let y=Math.max(b.top,b.bottom-14);y<=b.bottom;y++)for(let x=b.left;x<=b.right;x++)if(img.data[(y*img.width+x)*4+3]>=192){columns[x]++;total++;}
  let sum=0;for(let x=b.left;x<=b.right;x++){sum+=columns[x];if(sum>=total/2)return{x,y:b.bottom};}
}
async function buildEnemy(e,catalog){const base=path.join(root,'assets/enemies',e.id),defs=[];if(!fs.existsSync(path.join(base,'source/idle-generated.png'))){if(ready)return;throw Error('Missing idle: '+e.id);}
  makeAssetDirectory(path.join(base,'motions'),{recursive:true});let prose='# '+e.label+' / 組み込み image_gen\n\n基準原画: source/idle-generated.png。座標はセル内百分率。\n\n';
  for(const m of ['idle','move','hit','down',...Object.keys(e.actions)]){
    try{const reaction=['hit','down'].includes(m),six=m==='move'&&e.locomotion==='walk',name=reaction?'reaction':m,files=six?[1,2].map(h=>path.join(base,'source/move-'+h+'-generated.png')):[path.join(base,'source/'+name+'-generated.png')];
      if(files.some(f=>!fs.existsSync(f))){if(ready)continue;throw Error('Missing source: '+e.id+'/'+m);}
      const records=files.map(f=>register(f,six?3:2,six?1:2)),image=six?join(records[0].image,records[1].image):records[0].image;
      const cols=six?3:2,rows=2,source=m+'-registered.png';fs.writeFileSync(path.join(base,'source',source),PNG.sync.write(image));
      const calibrate=pose(image,reaction?1:0,0,cols,rows),first=bounds(calibrate),size=e.size*(m==='rest'?.78:['shell','spin'].includes(m)?.8:1),scale=size/(first.bottom-first.top+1);
      const durations=six?Array(6).fill(120):timing[m],start=m==='down'?2:0;
      // Excavation grit extends below the feet. Do not use it as the ground
      // anchor or let its arc shrink the troll. Coordinates refer to the
      // registered 835 x 529 source cells; extra canvas keeps all grit visible.
      const excavation=e.id==='cave-troll'&&m==='excavate';
      const frameWidth=excavation?960:e.width,frameHeight=excavation?600:e.height;
      const pivot=excavation?{x:595,y:480}:{x:Math.round(e.width*.58),y:e.height-17};
      const boxes=Array.from({length:six?6:4},(_,i)=>bounds(pose(image,i%cols,Math.floor(i/cols),cols,rows)));
      const anchors=excavation?[{x:645,y:407},{x:611,y:422},{x:645,y:486},{x:526,y:456}]:boxes.map((b,i)=>footAnchor(pose(image,i%cols,Math.floor(i/cols),cols,rows),b,e.locomotion==='fly'));
      // Same scale for the entire animation; reduce only if a long arc exceeds viewport.
      const selected=durations.map((_,i)=>i+start);
      const fit=excavation?e.size/(anchors[0].y-boxes[0].top+1):Math.min(scale,(pivot.y-12)/Math.max(...selected.map(i=>boxes[i].bottom-boxes[i].top+1)),(pivot.x-12)/Math.max(...selected.map(i=>anchors[i].x-boxes[i].left+1)),(e.width-pivot.x-12)/Math.max(...selected.map(i=>boxes[i].right-anchors[i].x+1)));
      const frames=durations.map((durationMs,i)=>({cell:i+start,durationMs,anchor:anchors[i+start],phase:six?['左接地','右遊脚','右前進','右接地','左遊脚','左前進'][i]:reaction?m==='down'?['崩れる','終端保持'][i]:['のけぞり','復帰'][i]:['開始','予備動作','作用','復帰'][i]}));
      const special=Object.keys(e.actions).indexOf(m),plans=special>=0?Array.from({length:5},(_,i)=>X.sequence(e.id,i+1)).flat().filter(p=>p.motion===m):[];
      const events=plans[0]?.events.map(ev=>({id:e.id+'-'+m+'-'+ev.kind,type:X.PROJECTILES[ev.kind]?'spawn-projectile':'spawn-effect',effect:X.PROJECTILES[ev.kind]||({sonic:'bat-sonic',drain:'vampire-drain',quake:'cave-quake','water-breath':'water-breath',tentacle:'sea-slam','worm-tail':'worm-tail','kraken-tentacle':'kraken-tentacle'}[ev.kind]),frame:2,timeMs:ev.at,power:ev.power})).filter(ev=>ev.effect)||[];
      const model=await pack({enemy:e.id,id:m,label:({idle:'待機',move:'移動',hit:'被弾',down:'撃破'}[m]||e.actions[m]),directory:'assets/enemies/'+e.id+'/motions/'+m,source:'../../source/'+source,prompt:'../../PROMPT.md',frameWidth,frameHeight,pivot,columns:cols,rowEdges:[0,image.height/2,image.height],columnEdges:Array.from({length:cols+1},(_,i)=>i*image.width/cols),scale:fit,anchorMode:'root',loop:loops.has(m),terminal:m==='down',frames,events});
      model.originalSources=files.map(f=>'../../source/'+path.basename(f));model.sourceExtraction=records.map(r=>r.boxes);model.region=e.region===3?'echo-cave':'sunlit-coast';model.defaultZoom=1;
      if(six)model.walkCycle={nearLeg:'left',farLeg:'right',parts:model.originalSources,phases:['left-contact','right-passing','right-approach','right-contact','left-passing','left-approach']};
      if(events.length)model.effectPreview={paddingLeft:220,defaultZoom:1,target:{x:80,y:pivot.y},origin:{x:pivot.x-e.size*.38,y:pivot.y-e.size*.5},assets:events.map(ev=>({id:ev.effect,manifest:'../../../../effects/'+ev.effect+'/manifest.json'}))};
      save(path.join(base,'motions',m,'manifest.json'),model);defs.push({id:m,label:model.label,manifest:m+'/manifest.json'});
      prose+='## '+model.label+'\n\n'+(six?[1,2].map(h=>prompt(e,'move',h)).join('\n\n'):prompt(e,reaction?'reaction':m))+'\n\n';
    }catch(error){if(!ready)throw error;failures.push({asset:e.id+'/'+m,error:error.message});}
  }
  if(!defs.some(d=>d.id==='idle'))return;
  for(const file of fs.readdirSync(path.join(base,'source')).filter(f=>f.endsWith('prompt.txt')))prose+='## '+file+'\n\n'+fs.readFileSync(path.join(base,'source',file),'utf8')+'\n\n';
  fs.writeFileSync(path.join(base,'PROMPT.md'),prose);save(path.join(base,'motions/index.json'),defs);
  const idle=read(path.join(base,'motions/idle/manifest.json')),b=idle.frames[0].bounds;makeAssetDirectory(path.join(root,'assets/ui/enemies'),{recursive:true});
  await sharp(path.join(base,'motions/idle',idle.frames[0].file)).extract({left:b.left,top:b.top,width:b.right-b.left+1,height:b.bottom-b.top+1}).resize(160,160,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(base,'thumbnail.png'));
  fs.copyFileSync(path.join(base,'thumbnail.png'),path.join(root,'assets/ui/enemies',e.id+'.png'));
  upsert(catalog,{id:e.id,label:e.label,name:e.name,region:modelRegion(e),boss:!!e.boss,majorBoss:!!e.majorBoss,summary:e.label,base:'assets/enemies/'+e.id+'/',thumbnail:'thumbnail.png',motionIndex:'motions/index.json',viewport:{width:e.width,height:e.height,pivot:idle.pivot}});
}
const modelRegion=e=>e.region===3?'echo-cave':'sunlit-coast';
async function buildEffect(e,index){const dir=path.join(root,'assets/effects',e.id),file=path.join(dir,'source-generated.png');if(!fs.existsSync(file)){if(ready)return;throw Error('Missing effect '+e.id);}
  const image=PNG.sync.read(fs.readFileSync(file)),cw=Math.floor(image.width/2),ch=Math.floor(image.height/2);
  // The water source uses shorter upper-row cells. Cut at its actual transparent gutters.
  const columnEdges=e.id==='water-breath'?[0,784,image.width]:[0,cw,image.width],rowEdges=e.id==='water-breath'?[0,400,image.height]:[0,ch,image.height];
  const bs=Array.from({length:4},(_,i)=>{const col=i%2,row=Math.floor(i/2),w=columnEdges[col+1]-columnEdges[col],h=rowEdges[row+1]-rowEdges[row],cell=new PNG({width:w,height:h});for(let y=0;y<h;y++){const start=((rowEdges[row]+y)*image.width+columnEdges[col])*4;cell.data.set(image.data.subarray(start,start+w*4),y*w*4);}return bounds(cell,192);});
  const scale=Math.min((e.width-28)/Math.max(...bs.map(b=>b.right-b.left+1)),(e.height-28)/Math.max(...bs.map(b=>b.bottom-b.top+1))),directional=['bat-sonic','water-breath'].includes(e.id);
  fs.writeFileSync(path.join(dir,'PROMPT.md'),'# '+e.label+'\n\nBuilt-in image_gen\n\n'+effectPrompt(e)+'\n');
  const model=await pack({id:e.id,label:e.label,directory:'assets/effects/'+e.id,source:'source-generated.png',prompt:'PROMPT.md',frameWidth:e.width,frameHeight:e.height,columns:2,columnEdges,rowEdges,pivot:{x:directional?e.width-14:e.width/2,y:e.ground?e.height-14:e.height/2},scale,alphaCutoff:192,anchorMode:e.ground?'ground':'bounds-center',loop:!!e.loop,
    frames:Array.from({length:4},(_,i)=>({cell:i,durationMs:180,phase:['発生','展開','最大','終端'][i],...(directional?{anchor:{x:bs[i].right,y:(bs[i].top+bs[i].bottom)/2}}:{})}))});
  model.sourceLayout={columnEdges,rowEdges};save(path.join(dir,'manifest.json'),model);upsert(index,{id:e.id,label:e.label,manifest:e.id+'/manifest.json'});
}
async function main(){const catalog=read(path.join(root,'assets/enemies/index.json')),index=read(path.join(root,'assets/effects/index.json'));
  const enemyFilter=process.argv.find(arg=>arg.startsWith('--enemy='))?.slice(8);
  if(enemyFilter){assert.ok(enemies.some(e=>e.id===enemyFilter),'Unknown enemy: '+enemyFilter);await buildEnemy(enemies.find(e=>e.id===enemyFilter),catalog);save(path.join(root,'assets/enemies/index.json'),catalog);return;}
  for(const e of enemies)await buildEnemy(e,catalog);save(path.join(root,'assets/enemies/index.json'),catalog);
  for(const e of effects)try{await buildEffect(e,index);}catch(error){if(!ready)throw error;failures.push({asset:e.id,error:error.message});}save(path.join(root,'assets/effects/index.json'),index);
  const forest=read(path.join(root,'assets/stages/starting-forest/manifest.json')),jobs=read(path.join(__dirname,'../../development/records/expansion-generation.json'));
  for(const [id,label]of [['echo-cave','洞窟'],['sunlit-coast','海岸']]){const dir=path.join(root,'assets/stages',id),layers=[];for(const layer of id==='echo-cave'?['ground-near']:['distant','ground-near']){const file=layer+'.png',source='source/'+layer+'-generated.png';if(!fs.existsSync(path.join(dir,source))){if(ready)continue;throw Error('Missing stage '+id+'/'+layer);}const img=PNG.sync.read(fs.readFileSync(path.join(dir,source)));fs.copyFileSync(path.join(dir,source),path.join(dir,file));layers.push({id:layer,label:layer==='distant'?'遠景':'地面＋近景',file,source,width:img.width,height:img.height,alpha:id==='sunlit-coast'&&layer==='ground-near',parallax:layer==='distant'?.28:1});}
    for(const layer of layers)if(layer.alpha){const img=PNG.sync.read(fs.readFileSync(path.join(dir,layer.source)));for(let i=3;i<img.data.length;i+=4){if(img.data[i]<=2)img.data[i]=0;else if(img.data[i]>=250)img.data[i]=255;}fs.writeFileSync(path.join(dir,layer.file),PNG.sync.write(img));layer.alphaCleanup={transparentMax:2,opaqueMin:250};}
    if(layers.length){save(path.join(dir,'manifest.json'),{schemaVersion:1,id,label,generation:'built-in image_gen',sampling:'nearest-neighbor',coordinateSystem:forest.coordinateSystem,repeat:forest.repeat,layers,notes:[id==='echo-cave'?'One enclosed cave layer, no distant layer.':'Draw distant ocean then transparent sand/near layer.','Contact lane Y323–512; movement Y334–501.']});fs.writeFileSync(path.join(dir,'PROMPT.md'),'# '+label+'\n\n'+jobs.filter(j=>j.id.startsWith(id+'/')).map(j=>j.prompt).join('\n\n')+'\n');}}
  const iconProvenance={};
  for(const [id,label]of materials){const source=path.join(root,'assets/ui/expansion/source',id+'-generated.png');if(!fs.existsSync(source)){if(ready)continue;throw Error('Missing material '+id);}const img=PNG.sync.read(fs.readFileSync(source)),b=bounds(img);await sharp(source).extract({left:b.left,top:b.top,width:b.right-b.left+1,height:b.bottom-b.top+1}).resize(128,128,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(root,'assets/ui/items',id+'.png'));iconProvenance[id]={source:path.relative(root,source).replaceAll('\\','/'),dedicatedGenerationPending:false};}
  save(path.join(root,'assets/ui/expansion/provenance.json'),iconProvenance);
  makeAssetDirectory(path.join(root,'assets/ui/expansion'),{recursive:true});fs.writeFileSync(path.join(root,'assets/ui/expansion/PROMPT.md'),'# 洞窟・海岸の素材 / built-in image_gen\n\n'+jobs.filter(j=>materials.some(m=>m[0]===j.id)).map(j=>'## '+j.id+'\n\n'+j.prompt).join('\n\n')+'\n');
  save(path.resolve(__dirname,'../../output/expansion-build-status.json'),{failures});console.log(JSON.stringify({failures}));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main,register};
