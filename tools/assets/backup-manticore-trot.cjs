'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../public/assets/highland-motions');
const dest=path.join(root,'backups/manticore-trot-v1-20261013');
assert.ok(!fs.existsSync(dest),'Backup already exists; never overwrite it.');
const dir=path.join(root,'enemies/manticore/motions/move'),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const files=new Set(fs.readdirSync(dir).map(f=>path.join(dir,f)));
for(const f of [m.source,m.reference,m.prompt,...m.originalSources])files.add(path.resolve(dir,f));
for(const f of ['manticore-trot.json','generation-manticore-trot.json','manticore-trot-qa.json'])files.add(path.join(root,f));
const entries=[];
for(const file of files){
  const relative=path.relative(root,file);assert.ok(!relative.startsWith('..')&&!path.isAbsolute(relative));
  const target=path.join(dest,relative);makeAssetDirectory(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
  const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  assert.equal(digest(file),digest(target));entries.push({path:relative.replaceAll('\\','/'),sha256:digest(file)});
}
writeAssetJson(path.join(dest,'backup-info.json'), {date:'2026-10-13 JST',status:'user-accepted-direction; retained-as-fallback',sourceRoot:'../..',files:entries});
console.log(JSON.stringify({backup:dest,files:entries.length,hashes:'passed'}));
