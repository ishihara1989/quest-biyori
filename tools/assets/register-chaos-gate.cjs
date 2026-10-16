'use strict';
const path=require('node:path'),sharp=require('sharp');
const {runtimeAsset,developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
async function register(){
  const relative='stages/chaos-gate',source=developmentAsset(relative+'/sources'),target=runtimeAsset(relative);makeAssetDirectory(target);
  await sharp(path.join(source,'background.png')).resize(1024,576,{fit:'fill',kernel:'nearest'}).png().toFile(path.join(target,'background.png'));
  await sharp(path.join(source,'gate.png')).resize(448,448,{fit:'contain',background:'#00000000',kernel:'nearest'}).extend({top:32,bottom:32,left:32,right:32,background:'#00000000'}).png().toFile(path.join(target,'gate.png'));
  writeAssetJson(developmentAsset(relative+'/generation.json'),{date:'2026-10-15',generator:'built-in image_gen',source:['sources/background.png','sources/gate.png'],prompts:'sources/prompts.json',runtime:['../../../../public/assets/stages/chaos-gate/background.png','../../../../public/assets/stages/chaos-gate/gate.png'],processing:'Nearest-neighbor resize; transparent gate padding preserved and extended. No palette edits.'});
}
if(require.main===module)register().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={register};
