'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const root=developmentAsset('volcano-motions/v2'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const plan=read('plan.json'),selection=read('selection.json'),backlog=read('revision-backlog.json'),measurements=read('paw-measurements.json');
plan.firstPass='../../late-stage-first-pass/v1/coverage.json';writeAssetJson(path.join(root,'plan.json'),plan);
measurements.uncertaintyPx=12;writeAssetJson(path.join(root,'paw-measurements.json'),measurements);
for(const row of measurements.records){const id=row.enemy+'/move-6';if(!row.requiresFurtherReview||backlog.entries.some(e=>e.id===id))continue;const job=plan.jobs.find(j=>j.id===id),m=read('ready/'+row.enemy+'/move/manifest.json'),f=m.frames[5],actual=row.frames[5].points.LF,expectedX=row.frames[0].points.LF[0]-8,dx=(expectedX-actual[0])/f.sourceScale;
 backlog.entries.push({id,type:'gait-trajectory-correction',source:selection.overrides[id]||job.source,nextSource:job.source.replace('-v2.png','-v3.png'),reference:job.reference,guide:job.guide,cols:1,rows:1,measurement:{coordinateSpace:'512x512 exported PNG',paw:'LF',actualApprox:actual,desiredApprox:[expectedX,actual[1]],uncertaintyPx:12,sourceDeltaXApprox:Math.round(dx)},issues:['6→1で接地中の手前前脚が前へ戻る。対角接地と他脚の承認済み形状は保持して、LFの軌道のみ再確認・修正する。'],prompt:'Use case: precise-object-edit. ONE TROT frame6 only. Image1 immutable canonical reference, image2 selected frame6 edit target. Preserve head, torso, fins/wings/tail, colors, scale, camera and the other THREE legs EXACTLY. Keep contact pair LF+RH and lifted pair LH+RF. Change ONLY the anatomical LEFT FRONT foreground leg: move its grounded paw farther FORWARD LEFT by approximately '+Math.abs(Math.round(dx))+' pixels in the original source, keeping same hip and original thigh/shin lengths and connected knee/ankle, same short claws and grounded height. This corrects measured backward return from frame6 to frame1; compare against frame1 before approval. Never stretch or disconnect the limb, no fifth paw, do not change approved other-leg swing/contact. Exact canonical pixel clusters, entire silhouette and transparent alpha preserved, no background/VFX.'});
}
backlog.additionalGaitCorrectionJobs=4;backlog.totalGenerationRequests=backlog.entries.length;writeAssetJson(path.join(root,'revision-backlog.json'),backlog);
// Record actual edit inputs, which may differ from the job's canonical reference.
const edits={
 'sources/lava-salamander/reaction-v2-rejected-haze.png':['references/lava-salamander.png','../../late-stage-first-pass/v1/sources/lava-salamander/reaction-generated.png'],
 'sources/lava-salamander/move-frame-3-v3.png':['references/lava-salamander.png','sources/lava-salamander/move-frame-2-v2.png'],
 'sources/obsidian-soldier/attack-v4.png':['sources/obsidian-soldier/attack-v3.png'],
 'sources/obsidian-soldier/danger-1-v4.png':['sources/obsidian-soldier/danger-1-v3.png'],
 'sources/young-fire-dragon/attack-v3.png':['sources/young-fire-dragon/attack-v2.png']
};
const generation=read('generation.json');for(const r of generation.records){const inputs=edits[r.source]||[r.reference,r.guide].filter(Boolean);r.actualInputImages=inputs.map(file=>({file,sha256:hash(path.resolve(root,file))}));if(edits[r.source])r.guide=null;r.pathsRelativeTo='volcano-motions/v2';if(r.source.endsWith('reaction-v2-rejected-haze.png'))r.reasonCorrection='背景光の見え方は透明画素に残ったRGBの表示も含んでいたため、後でPNGの合成表示を根拠に判定し直した。元の判定と原画は履歴として保持する。';writeAssetJson(path.join(root,r.source.replace(/\.png$/,'.generation.json')),r);}
writeAssetJson(path.join(root,'generation.json'),generation);
fs.writeFileSync(path.join(root,'PROMPTS.md'),'# 火山素材 修正の全文指定\n\n組み込み image_gen。未完成・本編未登録。生成枠は2026-10-14 17:26:36 JSTに回復予定。実送信した指定と未送信の残件を分ける。原画・基準リファレンス・SHA256・不採用候補を保持する。\n\n## 実送信・一次素材の再利用\n\n'+generation.records.map(r=>'### '+r.id+' / '+r.source+'\n\n'+(r.reusedFirstPass?'一次素材を再利用。以下は一次生成時の指定。\n\n':'')+r.prompt+'\n\n入力: '+r.actualInputImages.map(i=>i.file).join(', ')+'\n\n').join('')+'## 未送信の修正残件\n\n'+backlog.entries.map(r=>'### '+r.id+' / '+r.type+'\n\n'+r.prompt+'\n\n次の保存先: '+r.nextSource+'\n\n').join(''));
console.log(JSON.stringify({records:generation.records.length,remainingPrimaryJobs:backlog.remainingPrimaryJobs,additionalGaitCorrectionJobs:backlog.additionalGaitCorrectionJobs,totalGenerationRequests:backlog.totalGenerationRequests}));
