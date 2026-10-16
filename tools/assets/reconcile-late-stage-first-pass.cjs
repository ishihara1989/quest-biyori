'use strict';
// Recover an interrupted/concurrent aggregate from the preserved one-per-job originals.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('late-stage-first-pass/v1'),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function main(){const lock=path.join(root,'.generation.lock');let fd;for(let n=0;n<200;n++){try{fd=fs.openSync(lock,'wx');break;}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,25));}}if(fd===undefined)throw Error('Aggregate locked');
 try{const file=path.join(root,'generation.json'),data=JSON.parse(fs.readFileSync(file,'utf8')),jobs=JSON.parse(fs.readFileSync(path.join(root,'jobs.json'),'utf8'));const defaultDir=path.dirname(data.records[0].generatedPath);const originals=new Map(fs.readdirSync(defaultDir).filter(f=>f.endsWith('.png')).map(f=>{const p=path.join(defaultDir,f);return[sha(p),p];}));let recovered=0;
 const notes=JSON.parse(fs.readFileSync(path.join(root,'review-notes.json'),'utf8'));
 for(const j of jobs){const source=path.join(root,j.source);if(!fs.existsSync(source))continue;const sidecar=source.replace(/\.png$/,'.generation.json');let entry=data.records.find(r=>r.id===j.id);if(!entry){entry=fs.existsSync(sidecar)?JSON.parse(fs.readFileSync(sidecar,'utf8')):{...j,generatedPath:originals.get(sha(source))||null,sha256:sha(source),status:'generated-unaccepted',issues:[],reviewStatus:'pending full-frame and playback review',recordRecovery:'aggregate recovered from preserved original SHA256, not a new generation'};data.records.push(entry);recovered++;}delete entry.anticipationSeconds;entry.manualReview=notes[j.id]||null;entry.reviewStatus=entry.manualReview?.framesChecked?'all source frames visually reviewed; playback and runtime acceptance pending':'pending full-frame and playback review';writeAssetJson(sidecar,entry);}
 if(data.records.length===jobs.length)data.generationCompleted=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',dateStyle:'short'}).format(new Date())+' JST';
 const next=path.join(root,'generation-next.json');writeAssetJson(next,data);fs.renameSync(next,file);console.log(JSON.stringify({records:data.records.length,recovered}));
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}}
main().catch(e=>{console.error(e);process.exitCode=1;});
