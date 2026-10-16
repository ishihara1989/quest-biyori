'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../public/assets/highland-motions'),dir=path.join(root,'trot/batches');
const records=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')));
for(const r of records){const target=path.join(root,r.source);fs.copyFileSync(r.generatedPath,target);r.sha256=crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');}
const gen=JSON.parse(fs.readFileSync(path.join(root,'trot/generation.json'),'utf8'));gen.records=gen.records.filter(r=>!r.frame).concat(records);writeAssetJson(path.join(root,'trot/generation.json'), gen);
for(const id of new Set(records.map(r=>r.enemy)))fs.writeFileSync(path.join(root,'trot',id,'PROMPTS.md'),'# '+id+' の座標ガイド付きtrot\n\n基準画像を固定し、対角脚の接地を確認。3コマ生成は前脚の接地が交代しないため不採用。1コマ生成へ分割。\n\n'+gen.records.filter(r=>r.enemy===id).map(r=>'## '+(r.frame?'frame '+r.frame:'part '+r.half)+' — '+r.status+'\n\n'+r.prompt+'\n\n原画: '+r.source+'\n\nSHA256: '+(r.sha256||'initial source retained')).join('\n\n')+'\n');
console.log(JSON.stringify({singleSources:records.length}));
