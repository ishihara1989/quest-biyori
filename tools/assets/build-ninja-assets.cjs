'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Register generated RGBA. No painted character anatomy or procedural VFX art.
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict');
const {PNG}=require('pngjs'),sharp=require('sharp');
const {build}=require('./build-ritual-motions.cjs');
const N=require('../../public/js/skills/ninja-skills.js');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'public/assets/skills/ninja');
const json=(p,x)=>writeAssetJson(p, x);
function crop(im,r){const p=new PNG({width:r.width,height:r.height});for(let y=0;y<r.height;y++)p.data.set(im.data.subarray(((r.y+y)*im.width+r.x)*4,((r.y+y)*im.width+r.x+r.width)*4),y*r.width*4);return p;}
function bounds(p){let l=p.width,t=p.height,r=-1,b=-1;for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(p.data[(y*p.width+x)*4+3]>=32){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}assert.ok(r>l&&b>t);return {x:l,y:t,width:r-l+1,height:b-t+1};}
async function effects(records){
  for(const rec of records){const dir=path.join(base,'effects',rec.id),source=path.join(dir,'source');makeAssetDirectory(source,{recursive:true});
    const name=rec.id+'-generated-v1.png',original=path.resolve(root,rec.source),destination=path.join(source,name);if(original!==destination)fs.copyFileSync(original,destination);
    const input=PNG.sync.read(fs.readFileSync(original));assert.ok(input.data.some((v,i)=>i%4===3&&v===0),'Actual transparent alpha: '+rec.id);
    const size=rec.size||128,raw=[];for(let i=0;i<rec.count;i++){const left=rec.xCuts?.[i]??Math.round(i*input.width/rec.count),right=rec.xCuts?.[i+1]??Math.round((i+1)*input.width/rec.count);const p=crop(input,{x:left,y:0,width:right-left,height:input.height});
      const b=bounds(p);assert.ok(b.x>0&&b.x+b.width<p.width&&b.y>0&&b.y+b.height<p.height,'Effect cell margin: '+rec.id+'/'+i);
      raw.push({p,b});}
    // Register whole generated silhouettes with one scale; pulses retain their
    // relative sizes and transparent cell cuts cannot truncate a wide frame.
    const scale=(size-16)/Math.max(...raw.map(({b})=>Math.max(b.width,b.height))),poses=[];
    for(const {p,b} of raw){const cropped=crop(p,b),w=Math.max(1,Math.round(b.width*scale)),h=Math.max(1,Math.round(b.height*scale));
      const resized=PNG.sync.read(await sharp(PNG.sync.write(cropped)).resize(w,h,{kernel:'nearest'}).png().toBuffer()),out=new PNG({width:size,height:size}),x=Math.floor((size-w)/2),y=rec.anchor==='bottom'?size-8-h:Math.floor((size-h)/2);
      for(let j=0;j<h;j++)out.data.set(resized.data.subarray(j*w*4,(j+1)*w*4),((j+y)*size+x)*4);poses.push(out);}
    const sheet=new PNG({width:size*rec.count,height:size});const frames=[];
    for(const [i,p] of poses.entries()){for(let y=0;y<size;y++)sheet.data.set(p.data.subarray(y*size*4,(y+1)*size*4),(y*sheet.width+i*size)*4);const file=rec.id+'-'+String(i+1).padStart(2,'0')+'.png';fs.writeFileSync(path.join(dir,file),PNG.sync.write(p));frames.push({index:i,file,x:i*size,y:0,width:size,height:size,durationMs:rec.delay||180});}
    fs.writeFileSync(path.join(dir,rec.id+'.png'),PNG.sync.write(sheet));
    const data={version:1,id:rec.id,sheet:rec.id+'.png',frameWidth:size,frameHeight:size,frameCount:rec.count,frames,frameSequence:frames.map(f=>f.index),pivot:{x:size/2,y:rec.anchor==='bottom'?size-8:size/2},durationMs:frames.reduce((v,f)=>v+f.durationMs,0),loop:!!rec.loop,source:'source/'+name,generation:'built-in image_gen; see PROMPT.md'};
    json(path.join(dir,'manifest.json'),data);fs.writeFileSync(path.join(dir,'PROMPT.md'),'# '+rec.id+'\n\nBuilt-in image_gen; generated RGBA preserved; nearest-neighbor packaging.\n\n'+rec.prompt+'\n');
    if(rec.size){
      await sharp(path.join(dir,rec.id+'.png')).flatten({background:'#202333'}).png().toFile(path.join(dir,'review.png'));
      const pages=Buffer.concat(poses.map(p=>p.data));
      await sharp(pages,{raw:{width:size,height:size*rec.count,channels:4,pageHeight:size}}).gif({loop:rec.loop?0:1,delay:frames.map(f=>f.durationMs),dither:0,colours:256,keepDuplicateFrames:true,interFrameMaxError:0}).toFile(path.join(dir,'preview.gif'));
    }
    console.log(JSON.stringify({effect:rec.id,frames:rec.count,alpha:'preserved'}));
  }
}
async function icons(){
  const dir=path.join(base,'icons');makeAssetDirectory(dir,{recursive:true});
  const motion=(id,i)=>path.join(root,'public/assets/ninja/motions',id,id+'-'+String(i).padStart(2,'0')+'.png');
  const fx=(id,i)=>path.join(base,'effects',id,id+'-'+String(i).padStart(2,'0')+'.png');
  const map={shuriken:path.join(root,'public/assets/ninja/motions/attack-shuriken/shuriken-projectile.png'),
    'star-burst':motion('throw-combo',2),'flash-bomb':fx('flash',2),'shadow-clone':motion('cast-release',2),
    'caltrop-field':fx('caltrop-scatter',3),'shadow-pin':fx('shadow-pin',3),'air-fan':motion('air-throw',2),
    'shadow-echo':motion('throw-combo',5),'seal-tags':fx('seal',2),'fuma-return':fx('fuma',1),
    'mist-clones':fx('smoke-in',2),'thread-field':fx('thread',2),'shadow-cross':motion('low-dash',3),
    'paralysis-needles':fx('lightning',2),'fuma-orbit':fx('fuma',3),'haze-screen':fx('haze',2),
    'shadow-double':motion('cast-release',1),'shadow-prison':fx('prison',3),'eight-way-clones':fx('smoke-in',3),
    'unseen-volley':motion('air-throw',1),'thousand-shadow':fx('final-ring',2)};
  for(const n of N.ACTIVE){const input=PNG.sync.read(fs.readFileSync(map[n.id])),b=bounds(input);await sharp(PNG.sync.write(crop(input,b))).resize(88,88,{fit:'contain',kernel:'nearest',background:'#00000000'}).extend({top:4,bottom:4,left:4,right:4,background:'#00000000'}).png().toFile(path.join(dir,n.id+'.png'));}
  json(path.join(dir,'sources.json'),Object.fromEntries(Object.entries(map).map(([id,p])=>[id,path.relative(root,p).replaceAll('\\','/')])));
}
async function statusIcons(){
  // Extend the game's small native UI icon vocabulary; pixel-grid rasterization.
  const shapes={blind:'<path d="M2 8 5 5h6l3 3-3 3H5Z M2 2l12 12"/>',
    slow:'<path d="M7 2v7H4v4h7V9H9V2 M2 5v5m-1-1 1 1 1-1"/>',
    root:'<path d="M2 6V3h5v5H2V6m7 4V8h5v5H9v-3M5 6l6 5"/>',
    seal:'<path d="M5 12 3 7V5h2V2h2v4h2V2h2v5h2v5H5M2 8h12"/>',
    stop:'<path d="M5 1h6M8 1v2M4 4h8v9H4ZM6 6v5m4-5v5"/>'};
  const dir=path.join(base,'status');makeAssetDirectory(dir,{recursive:true});
  for(const [id,shape] of Object.entries(shapes)){const svg='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="0" y="0" width="16" height="16" rx="2" fill="#17172c" fill-opacity=".85"/><g fill="none" stroke="'+(id==='blind'?'#fff0a4':id==='seal'?'#ff9987':'#c7afff')+'" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">'+shape+'</g></svg>';
    const small=await sharp(Buffer.from(svg)).png().toBuffer();await sharp(small).resize(32,32,{kernel:'nearest'}).png().toFile(path.join(dir,id+'.png'));}
}
async function main(){const records=JSON.parse(fs.readFileSync(path.join(__dirname,'../../development/records/ninja-generation.json'))),mode=process.argv[2];
  if(mode!=='--effects'){await build(records,'ninja');for(const rec of records.filter(r=>!r.id.endsWith('-a')&&!r.id.endsWith('-b'))){const file=path.join(root,'public/assets/ninja/motions',rec.id,'manifest.json'),data=JSON.parse(fs.readFileSync(file));data.previewNotes='Ground pivot shared with idle; complete skill sequences in ninja-skill-lab.html. Separate swept projectiles own flight and damage.';json(file,data);}}
  if(mode!=='--motions'){for(const name of ['ninja-effect-generation.json','ninja-fx-upgrade-generation.json']){const file=path.join(__dirname,name);if(fs.existsSync(file))await effects(JSON.parse(fs.readFileSync(file)));}await icons();await statusIcons();}
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={effects,icons,statusIcons};
