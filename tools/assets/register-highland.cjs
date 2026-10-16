'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,sharp=require('sharp');
const {enemies,effects}=require('./highland-motion-specs.cjs'),Data=require('../../public/js/data/highland-data.js'),Combat=require('../../public/js/combat/highland-combat.js');
const pub=path.resolve(__dirname,'../../public'),root=path.join(pub,'assets/highland-motions');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8')),save=(f,v)=>{makeAssetDirectory(path.dirname(f),{recursive:true});writeAssetJson(f, v);};
const relative=(from,to)=>path.relative(from,to).replaceAll('\\','/');
function upsert(list,row){const i=list.findIndex(x=>x.id===row.id);if(i>=0)list[i]=row;else list.push(row);}
function copyMotion(from,to){makeAssetDirectory(to,{recursive:true});for(const name of fs.readdirSync(from))if(name!=='manifest.json'&&/\.(png|gif)$/.test(name))fs.copyFileSync(path.join(from,name),path.join(to,name));const m=read(path.join(from,'manifest.json'));
 for(const key of ['source','prompt','reference'])if(m[key])m[key]=relative(to,path.resolve(from,m[key]));
 for(const key of ['originalSources'])if(m[key])m[key]=m[key].map(x=>relative(to,path.resolve(from,x)));
 if(m.originalSource)m.originalSource=relative(to,path.resolve(from,m.originalSource));
 if(m.registration?.recipe)m.registration.recipe=relative(to,path.resolve(from,m.registration.recipe));
 if(m.coordinateGuide?.file)m.coordinateGuide.file=relative(to,path.resolve(from,m.coordinateGuide.file));
 m.previewOnly=false;return m;
}
async function main(){const catalog=read(path.join(pub,'assets/enemies/index.json')),fx=read(path.join(pub,'assets/effects/index.json'));
 for(const e of enemies){const base=path.join(pub,'assets/enemies',e.id),fromBase=path.join(root,'enemies',e.id),defs=read(path.join(fromBase,'motions/index.json')).map(x=>({...x,manifest:x.id+'/manifest.json'}));
  for(const d of defs){const to=path.join(base,'motions',d.id),m=copyMotion(path.join(fromBase,'motions',d.id),to);m.action=Combat.ACTIONS[e.id]?.find(a=>a.motion===d.id)||null;m.effectAssets=m.effectAssets?.map(x=>({id:'highland-'+x.id,manifest:relative(to,path.join(pub,'assets/effects/highland-'+x.id+'/manifest.json'))}))||[];save(path.join(to,'manifest.json'),m);}
  save(path.join(base,'motions/index.json'),defs);await sharp(path.join(root,'references',e.id+'.png')).trim().resize(160,160,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(base,'thumbnail.png'));fs.copyFileSync(path.join(base,'thumbnail.png'),path.join(pub,'assets/ui/enemies',e.id+'.png'));
  upsert(catalog,{id:e.id,label:e.label,name:e.id.replaceAll('-',' '),region:'嵐渡りの高原',boss:Data.ENEMIES[e.id].boss,base:'assets/enemies/'+e.id+'/',thumbnail:'thumbnail.png',motionIndex:'motions/index.json',viewport:{width:e.width,height:e.height,pivot:{x:Math.round(e.width*.57),y:e.height-24}}});
 }
 for(const e of effects){const id='highland-'+e.id,to=path.join(pub,'assets/effects',id),m=copyMotion(path.join(root,'effects',e.id),to);m.id=id;save(path.join(to,'manifest.json'),m);upsert(fx,{id,label:e.label,manifest:id+'/manifest.json'});}
 save(path.join(pub,'assets/enemies/index.json'),catalog);save(path.join(pub,'assets/effects/index.json'),fx);
 const stage=path.join(pub,'assets/stages/storm-highland');makeAssetDirectory(stage,{recursive:true});fs.copyFileSync(path.join(pub,'assets/mid-late-design/v1/highland/background.png'),path.join(stage,'distant.png'));const meta=await sharp(path.join(stage,'distant.png')).metadata();save(path.join(stage,'manifest.json'),{id:'storm-highland',width:meta.width,height:meta.height,logicalWidth:1024,logicalHeight:576,ground:{minY:334,maxY:501},layers:[{file:'distant.png',role:'distant'}],source:'../../mid-late-design/v1/highland/background.png',sampling:'nearest-neighbor'});
 require('../lib/register-ui-art.cjs').publishRegionItems('highland',Data.ITEMS);
 console.log(JSON.stringify({enemies:enemies.length,motions:enemies.reduce((n,e)=>n+4+Object.keys(e.actions).length,0),effects:effects.length,stage:'storm-highland'}));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={main};
