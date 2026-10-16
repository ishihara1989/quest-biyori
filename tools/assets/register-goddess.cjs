'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const {runtimeAsset,developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const dev=developmentAsset('extradimensional-goddess/runtime-v3'),out=runtimeAsset('enemies/extradimensional-goddess');
const read=(group,id)=>JSON.parse(fs.readFileSync(developmentAsset('extradimensional-goddess/'+group+'/review-index.json'))).find(c=>c.id===id);
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function build(){makeAssetDirectory(dev);makeAssetDirectory(out);const registrations=[];
  async function clip(id,label,group,sourceId,indices,scales,durations,loop=false,mode='body'){
    const m=read(group,sourceId),frames=indices.map(i=>m.frames.find(f=>f.index===i));
    return pack(id,label,frames.map((f,i)=>({file:developmentAsset('extradimensional-goddess/'+group+'/'+f.file),bounds:f.bounds,scale:Array.isArray(scales)?scales[i]:scales,duration:durations?.[i]??f.durationMs,source:f.source,registrationAnchor:f.registrationAnchor})),loop,mode,/^(effects|parts)\//.test(sourceId)?'effect':'motion');
  }
  async function pack(id,label,inputs,loop=false,mode='body',kind='motion'){
    const size=512,pivotY=mode==='center'?256:id==='throne'?416:440,dir=path.join(out,'motions',id);makeAssetDirectory(dir);const composite=[],frames=[];
    for(const [i,f]of inputs.entries()){
      const meta=await sharp(f.file).metadata(),w=Math.round(meta.width*f.scale),h=Math.round(meta.height*f.scale),b=f.bounds;
      // Fixed scale per production segment, translation only per measured origin.
      // Down retains the planned vertical rise relative to its first frame.
      const cx=f.registrationAnchor?.[0]??(b[0]+b[2])/2,cy=mode==='center'?(f.registrationAnchor?.[1]??(b[1]+b[3])/2):id==='down'?inputs[0].bounds[3]:b[3];
      const left=Math.round(256-cx*f.scale),top=Math.round(pivotY-cy*f.scale);
      let png=await sharp(f.file).resize(w,h,{kernel:'nearest'}).png().toBuffer(),placeX=left,placeY=top;
      if(left<0||top<0||left+w>size||top+h>size){const {data}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(let y=0;y<h;y++)for(let x=0;x<w;x++)if((x+left<0||y+top<0||x+left>=size||y+top>=size)&&data[(y*w+x)*4+3])throw Error('Visible pixel outside registration '+id+':'+i);
        const x=Math.max(0,-left),y=Math.max(0,-top);png=await sharp(png).extract({left:x,top:y,width:Math.min(w-x,size-Math.max(0,left)),height:Math.min(h-y,size-Math.max(0,top))}).png().toBuffer();placeX=Math.max(0,left);placeY=Math.max(0,top);}
      const frame=await sharp({create:{width:size,height:size,channels:4,background:'#00000000'}}).composite([{input:png,left:placeX,top:placeY}]).png().toBuffer();
      fs.writeFileSync(path.join(dir,`frame-${i+1}.png`),frame);composite.push({input:frame,left:i*size,top:0});frames.push({x:i*size,y:0,width:size,height:size,durationMs:f.duration,file:`frame-${i+1}.png`});
      registrations.push({clip:id,frame:i+1,source:path.relative(dev,f.file).replaceAll('\\','/'),sha256:hash(f.file),scale:f.scale,translation:[left,top],bounds:b});
    }
    await sharp({create:{width:size*inputs.length,height:size,channels:4,background:'#00000000'}}).composite(composite).png().toFile(path.join(dir,'sheet.png'));
    const manifest={id,motion:id,label,loop,cell:{width:size,height:size},pivot:{x:256,y:pivotY},durationMs:frames.reduce((n,f)=>n+f.durationMs,0),frameSequence:frames.map((_,i)=>i),sheet:'sheet.png',frames};writeAssetJson(path.join(dir,'manifest.json'),manifest);return{id,label,kind,manifest:id+'/manifest.json'};
  }
  const list=[];
  list.push(await clip('idle','御座・待機','repair-v2','motions/p1-shot',[1],.48,[1200],true));
  list.push(await clip('shot','指先の星','repair-v2','motions/p1-shot',[1,2,3,4],.48,[100,140,100,160]));
  // New small snap; the repaired shot is the exact size reference.
  const snap=path.join(dev,'source/p1-snap.png'),{data,info}=await sharp(snap).ensureAlpha().raw().toBuffer({resolveWithObject:true}),snapFrames=[];
  for(let i=0;i<3;i++){const width=info.width/3,b=[width,info.height,-1,-1];let edge=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<width;x++)if(data[(y*info.width+i*width+x)*4+3]>32){b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);if(!x||!y||x===width-1||y===info.height-1)edge++;}
    if(edge)throw Error('Snap cell boundary '+i);const file=path.join(dev,'source',`snap-cell-${i+1}.png`);await sharp(snap).extract({left:i*width,top:0,width,height:info.height}).png().toFile(file);snapFrames.push({file,bounds:b,scale:.335,duration:[300,100,300][i]});}
  list.push(await pack('snap','星鏡・指パッチン',snapFrames));
  list.push(await clip('floating','浮遊・待機','repair-v2','motions/p2-cast',[6],.575,[1200],true));
  list.push(await clip('cast','界面の術式','repair-v2','motions/p2-cast',[1,2,3,4,5,6],[.43,.43,.43,.575,.575,.575]));
  list.push(await clip('ultimate','零界収束','repair-v2','motions/p2-ultimate',[1,2,3,4,5,6,7,8,9],.35));
  list.push(await clip('down','満足・会釈・手振り・帰還','repair-v2','motions/down',[1,2,3,4],.47));
  list.push(await clip('return','異次元への扉','repair-v2','effects/goddess-return',[1,2,3,4,5,6],.46,null,false,'center'));
  list.push(await clip('throne','玉座','repair-v2','parts/throne',[1],.37,[1200],true));
  list.push(await clip('halo','天環','repair-v2','parts/halo',[1],.27,[1200],true,'center'));
  for(const [id,label,scale,mode]of [['star-impact','星の着弾',.22,'center'],['snap-glint','指先の光',.12,'center'],['homing-meteor','追尾流星',.16,'center'],['meteor-impact','流星の星冠',.22,'body'],['rift-cut','界面断裂',.4,'center'],['celestial-wave','天環の波',.4,'center']])list.push(await clip(id,label,'first-pass-v1','effects/'+id,[1,2,3],scale,null,false,mode));
  writeAssetJson(path.join(out,'motions/index.json'),list);
  makeAssetDirectory(runtimeAsset('stages/extradimensional-goddess'));await sharp(developmentAsset('extradimensional-goddess/v1/references/stage-throne-beyond-dimensions.png')).resize(1024,576,{fit:'fill',kernel:'nearest'}).png().toFile(runtimeAsset('stages/extradimensional-goddess/background.png'));
  makeAssetDirectory(runtimeAsset('ui/enemies'));await sharp(path.join(out,'motions/idle/frame-1.png')).extract({left:128,top:188,width:256,height:256}).png().toFile(runtimeAsset('ui/enemies/extradimensional-goddess.png'));
  writeAssetJson(path.join(dev,'registration.json'),{date:'2026-10-15',tool:'built-in image_gen',prompt:'snap-prompt.txt',newSource:'source/p1-snap.png',newSourceSha256:hash(snap),processing:'Fixed nearest-neighbor scales per segment; measured alpha-center and baseline translations; no paint, anatomy edits or pixel removal. Broken first-pass animations are excluded. Idle breathing, phase change, recovery, star mirrors and convergence are Canvas animations using registered poses.',registrations});
  writeAssetJson(path.join(dev,'generation.json'),{date:'2026-10-15',tool:'built-in image_gen',transparent_background:true,prompt:fs.readFileSync(path.join(dev,'snap-prompt.txt'),'utf8'),output:'source/p1-snap.png',sha256:hash(snap),references:['../repair-v2/review/motions/p1-shot/frame-01.png','../v1/references/phase-1-seated.png'].map(file=>({file,sha256:hash(path.resolve(dev,file))})),layout:'three equal 724x724 cells in one row; no visible pixels on cell boundaries'});
  await require('./build-goddess-motion-v4.cjs').build();
  console.log(JSON.stringify({clips:list.length,frames:registrations.length}));
}
if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});module.exports={build};
