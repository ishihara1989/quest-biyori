'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs');
const path=require('../lib/project-paths.cjs').assetPaths;
const sharp=require('sharp');
const {PNG}=require('pngjs');
const {root,regions,assets}=require('./mid-late-design-spec.cjs');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function metric(file){
  const p=PNG.sync.read(fs.readFileSync(file));
  let left=p.width,top=p.height,right=-1,bottom=-1,visible=0,transparent=0,partial=0,clear=0;
  for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
    const alpha=p.data[(y*p.width+x)*4+3];
    if(alpha<255)transparent++;
    if(alpha===0)clear++;
    if(alpha>0&&alpha<255)partial++;
    if(alpha>12){visible++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  }
  return {width:p.width,height:p.height,visiblePixels:visible,transparentPixels:transparent,fullyTransparentPixels:clear,partialAlphaPixels:partial,hasTransparency:clear>0,empty:visible===0,bounds:visible?{left,top,right,bottom}:null,noClipping:visible>0&&left>0&&top>0&&right<p.width-1&&bottom<p.height-1};
}
const gridCache=new Map();
function gridCell(atlas,cols,rows,col,row){
  const key=atlas+':'+cols+':'+rows;
  if(!gridCache.has(key)){
    const p=PNG.sync.read(fs.readFileSync(atlas));
    const clear=(axis,n,start,end)=>{for(let t=start;t<end;t++){const x=axis==='x'?n:t,y=axis==='y'?n:t;if(p.data[(y*p.width+x)*4+3]>12)return false;}return true;};
    const cut=(axis,expected,radius,start,end)=>{
      const limit=axis==='x'?p.width:p.height;
      for(let d=0;d<=radius;d++)for(const n of d?[expected-d,expected+d]:[expected])if(n>0&&n<limit&&clear(axis,n,start,end)&&clear(axis,n-1,start,end))return n;
      throw new Error('No transparent gutter near '+axis+'='+expected+' in '+atlas);
    };
    const ys=[0];for(let i=1;i<rows;i++)ys.push(cut('y',Math.round(p.height*i/rows),Math.round(p.height/rows*.20),0,p.width));ys.push(p.height);
    const xs=[];for(let r=0;r<rows;r++){const arr=[0];for(let i=1;i<cols;i++)arr.push(cut('x',Math.round(p.width*i/cols),Math.round(p.width/cols*.20),ys[r],ys[r+1]));arr.push(p.width);xs.push(arr);}
    gridCache.set(key,{xs,ys});
  }
  const {xs,ys}=gridCache.get(key);
  return {left:xs[row][col],top:ys[row],width:xs[row][col+1]-xs[row][col],height:ys[row+1]-ys[row]};
}
async function cell(atlas,cols,rows,col,row,out){
  const {left,top,width,height}=gridCell(atlas,cols,rows,col,row);
  await sharp(atlas).extract({left,top,width,height}).png().toFile(out);
  return {...metric(out),sourceCell:{cols,rows,col,row,left,top,width,height}};
}
async function build(){
  const selected=process.argv[2];
  const activeRegions=selected?regions.filter(r=>r.id===selected):regions;
  if(!activeRegions.length)throw new Error('Unknown region '+selected);
  const activeAssets=assets.filter(a=>activeRegions.some(r=>r.id===a.region));
  const missing=activeAssets.filter(a=>!fs.existsSync(path.join(root,a.file)));
  if(missing.length)throw new Error('Missing generated sheets: '+missing.map(a=>a.id).join(', '));
  const qa={date:'2026-10-12 JST',method:'PNG alpha inspection; grid cells split at verified transparent gutters near the requested layout; source artwork is not repainted',assets:[],emptyCells:[]};
  const manifest={schemaVersion:1,status:'desert-implemented; highland-motions-in-progress; glacier-and-later-awaiting-design-review',generation:'built-in image_gen',motionProduction:'partially-complete',gameRegistered:false,regions:[]};
  for(const r of activeRegions){
    const dir=path.join(root,r.id);
    const monsterRevisions=fs.readdirSync(dir).filter(file=>/^monsters-v[0-9]+\.png$/.test(file)).sort((a,b)=>Number(b.match(/v(\d+)/)[1])-Number(a.match(/v(\d+)/)[1]));
    const monsterFile=`${r.id}/${monsterRevisions[0]||'monsters.png'}`;
    const dropRevisions=fs.readdirSync(dir).filter(file=>/^drops-v[0-9]+\.png$/.test(file)).sort((a,b)=>Number(b.match(/v(\d+)/)[1])-Number(a.match(/v(\d+)/)[1]));
    const dropFile=`${r.id}/${dropRevisions[0]||'drops.png'}`;
    for(const a of assets.filter(a=>a.region===r.id)){
      const file=a.kind==='monsters'?monsterFile:a.kind==='drops'?dropFile:a.file;
      const m=metric(path.join(root,file));
      qa.assets.push({id:a.id,file,kind:a.kind,...m,...(a.kind==='background'?{noClipping:null,edgePolicy:'full-bleed-background'}:{})});
      if(a.transparent&&!m.hasTransparency)throw new Error(a.id+' has no transparency');
    }
    const out={id:r.id,name:r.name,title:r.title,levels:r.levels,background:`${r.id}/background.png`,backgroundPreview:`${r.id}/background-preview.png`,monsterSheet:monsterFile,dropSheet:dropFile,props:[],drops:[],enemies:[]};
    if(r.id==='desert')Object.assign(out,{gameRegistered:true,motionProduction:'complete',motions:'../../desert-motions/docs/history/development-log.md'});
    if(r.id==='highland')Object.assign(out,{gameRegistered:false,motionProduction:'in-progress',motions:'../../highland-motions/docs/history/development-log.md'});
    if(r.id==='glacier')out.bossDesign={reference:'glacier/ice-tusk-mammoth.png',review:'glacier/mammoth-review.html',plan:'GLACIER-PLAN.md',dangerPlan:'DANGER-ACTIONS.md',effects:'glacier/effects.png',motionProduction:'not-started'};
    makeAssetDirectory(path.join(dir,'props'),{recursive:true});makeAssetDirectory(path.join(dir,'drops'),{recursive:true});
    for(let i=0;i<4;i++){
      const file=`${r.id}/props/prop-${i+1}.png`;
      const m=await cell(path.join(dir,'props.png'),2,2,i%2,Math.floor(i/2),path.join(root,file));
      qa.assets.push({id:`${r.id}-prop-${i+1}`,file,kind:'prop',...m});out.props.push({file,description:r.props[i]});
      if(m.empty||!m.noClipping)throw new Error(file+' is empty or touches a cell boundary');
    }
    for(let i=0;i<5;i++){
      const [id,name,role]=r.drops[i],file=`${r.id}/drops/${id}.png`;
      const m=await cell(path.join(root,dropFile),3,2,i%3,Math.floor(i/3),path.join(root,file));
      qa.assets.push({id,file,kind:'drop',...m});out.drops.push({id,name,role,file,rarity:i<3?'common':i===3?'uncommon':'rare'});
      if(m.empty||!m.noClipping)throw new Error(file+' is empty or touches a cell boundary');
    }
    for(let i=0;i<7;i++){
      const [id,name,role]=r.enemies[i],file=monsterFile;
      const mammoth=id==='ice-tusk-mammoth';
      out.enemies.push({id,name,role,file,sheetPosition:i<3?`top-${i+1}`:i<6?`middle-${i-2}`:'bottom-center',femaleBoss:role==='C+',reference:mammoth?'glacier/ice-tusk-mammoth.png':file,facing:id==='demon-god'?'front':'left-three-quarter',pose:'single-neutral',motionProduction:'not-started',individualExtraction:mammoth?'standalone-generated-reference':'deferred-until-design-review'});
    }
    const monsterMetric=metric(path.join(root,monsterFile));
    if(monsterMetric.empty||!monsterMetric.noClipping)throw new Error(r.id+' monster sheet is empty or clipped at image edge');
    for(const [kind,cols,rows,col,row] of [['drops',3,2,2,1]]){
      const input=kind==='drops'?path.join(root,dropFile):path.join(dir,kind+'.png');
      const {left,top,width,height}=gridCell(input,cols,rows,col,row);
      const p=PNG.sync.read(await sharp(input).extract({left,top,width,height}).png().toBuffer());
      let nonempty=0;for(let i=3;i<p.data.length;i+=4)if(p.data[i]>12)nonempty++;
      qa.emptyCells.push({region:r.id,kind,col,row,visiblePixels:nonempty});
      if(nonempty>0)throw new Error(`${r.id} ${kind} empty cell contains artwork`);
    }
    const bg=await sharp(path.join(dir,'background.png')).metadata();
    const overlays=[];
    for(const [i,x] of [[0,0.015],[1,0.85]]){
      const file=path.join(root,out.props[i].file),m=metric(file),b=m.bounds;
      const img=await sharp(file).extract({left:b.left,top:b.top,width:b.right-b.left+1,height:b.bottom-b.top+1}).resize({width:Math.round(bg.width*.12),height:Math.round(bg.height*.2),fit:'inside',kernel:'nearest'}).png().toBuffer({resolveWithObject:true});
      overlays.push({input:img.data,left:Math.round(bg.width*x),top:Math.round(bg.height*.975)-img.info.height});
    }
    await sharp(path.join(dir,'background.png')).composite(overlays).png().toFile(path.join(dir,'background-preview.png'));
    manifest.regions.push(out);
  }
  const generation=JSON.parse(fs.readFileSync(path.join(root,'generation.json'),'utf8'));
  qa.sourceIntegrity=generation.assets.map(a=>({id:a.id,canonicalMatchesSavedSource:fs.readFileSync(path.join(root,a.file)).equals(fs.readFileSync(path.join(root,a.source)))}));
  if(!qa.sourceIntegrity.every(a=>a.canonicalMatchesSavedSource))throw new Error('Artwork source integrity failed');
  writeAssetJson(path.join(root,'qa.json'), qa);
  writeAssetJson(path.join(root,'manifest.json'), manifest);
  const roles={A:'雑魚 A',B:'雑魚 B',C:'雑魚 C','A+':'ボス A','B+':'ボス B','C+':'女性型ボス C',D:'大ボス'};
  const themes={desert:'毒・砂縛り・潜行',highland:'出血・突進・押出し',glacier:'氷牙・広域氷震・妨害',volcano:'火傷・破甲・溶岩', 'demon-castle':'呪い・沈黙・睡眠'};
  const nav=activeRegions.map((r,i)=>`<button class="region-tab" data-region="${r.id}" aria-selected="${i===0}" style="--accent:${r.palette}">${r.name}<small>Lv.${r.levels}</small></button>`).join('');
  const sections=manifest.regions.map((r,i)=>{
    const spec=regions.find(s=>s.id===r.id);
    const enemies=r.enemies.map(e=>`<div class="monster-name ${e.role==='D'?'major':''}"><b>${escape(e.name)}</b><span>${roles[e.role]}</span></div>`).join('');
    const drops=r.drops.map(d=>`<figure class="drop ${d.rarity}"><a href="${d.file}" target="_blank" title="${escape(d.name)}／${d.role}／${d.rarity==='common'?'雑魚30%・対応ボス100%':d.rarity==='uncommon'?'ボス30%・大ボス100%':'大ボス30%'}"><img src="${d.file}" alt="${escape(d.name)}" loading="lazy"></a><figcaption><b>${escape(d.name)}</b><span>${d.role}</span></figcaption></figure>`).join('');
    const props=r.props.map((p,j)=>`<a class="prop" href="${p.file}" target="_blank" title="配置パーツ ${j+1}"><img src="${p.file}" alt="${escape(spec.props[j])}" loading="lazy"></a>`).join('');
    return `<section id="${r.id}" ${i?'hidden':''} style="--accent:${spec.palette}"><header class="region-head"><div><h2>${r.name}<small>${r.title}</small></h2><p class="theme">${themes[r.id]}</p></div><span class="level">Lv.${r.levels}</span></header><div class="landscape"><a href="${r.background}" target="_blank" title="背景原画を開く"><img src="${r.background}" alt="${r.name}の背景"></a><img class="layer left" src="${r.props[0].file}" alt="" aria-hidden="true"><img class="layer right" src="${r.props[1].file}" alt="" aria-hidden="true"></div><div class="props-row">${props}</div><h3>ドロップ素材 <small>コモン3種 · 結晶 · レア</small></h3><div class="drops-grid">${drops}</div><h3>モンスターデザイン <small>上段：雑魚 ／ 中段：ボス ／ 下段：大ボス</small></h3><figure class="monster-sheet"><a href="${r.id}/monsters.png" target="_blank" title="敵7種の透過原画を開く"><img src="${r.id}/monsters.png" alt="${r.name}の敵7種。${r.enemies.map(e=>escape(e.name)).join('、')}"></a></figure><div class="monsters-grid">${enemies}</div><div class="sheet-links"><a href="${r.id}/props.png">背景パーツ原画</a><a href="${r.id}/drops.png">素材原画</a><a href="${r.id}/monsters.png">敵原画</a><a href="${r.backgroundPreview}">背景合成PNG</a></div></section>`;
  }).join('');
  const renderedSections=manifest.regions.reduce((html,r)=>html.replaceAll(`${r.id}/monsters.png`,r.monsterSheet).replaceAll(`${r.id}/drops.png`,r.dropSheet).replace(`<div class="sheet-links"><a href="${r.id}/props.png">`,(r.id==='glacier'?'<div class="sheet-links"><a href="glacier/mammoth-review.html">氷牙マンモス・危険技</a><a href="DANGER-ACTIONS.md">後半3地域の妨害企画</a>':'<div class="sheet-links">')+`<a href="${r.id}/props.png">`),sections);
  fs.copyFileSync(path.resolve(__dirname,'../../docs/design/mid-late-stage-design.md'),path.join(root,'PLAN.md'));
  fs.copyFileSync(path.resolve(__dirname,'../../docs/design/glacier-stage-design.md'),path.join(root,'GLACIER-PLAN.md'));
  fs.copyFileSync(path.resolve(__dirname,'../../docs/design/late-stage-danger-actions.md'),path.join(root,'DANGER-ACTIONS.md'));
  const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>中盤〜後半｜5地域デザイン案</title><style>
  *{box-sizing:border-box}body{margin:0;background:#10151e;color:#eee6d6;font:15px/1.6 "Yu Gothic",Meiryo,sans-serif}main{max-width:1320px;margin:auto;padding:28px 22px 60px}h1{font-size:27px;margin:0}.intro{color:#a9b4c3;margin:5px 0 15px}.topbar{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.topbar a,.sheet-links a{color:#aaccdf}nav{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:22px 0;position:sticky;top:0;background:#10151ef2;z-index:5;padding:10px 0}.region-tab{background:#1c2430;border:1px solid #3a4658;border-top:3px solid var(--accent);color:#e8e1d2;border-radius:7px;padding:9px 6px;font:700 18px "Yu Gothic",sans-serif;cursor:pointer}.region-tab[aria-selected="true"]{background:#344152;box-shadow:0 0 0 1px var(--accent)}.region-tab small{display:block;color:#adb9c9;font-size:12px;font-weight:400}.region-head{display:flex;justify-content:space-between;align-items:center}h2{font-size:25px;margin:0;color:var(--accent)}h2 small{font-size:17px;color:#ded8cb;margin-left:18px}.theme{margin:5px 0 16px;color:#aab8c8}.level{color:var(--accent);font-size:19px}.landscape{position:relative;overflow:hidden;border-radius:9px;border:1px solid #374453}.landscape a{display:block}.landscape a img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;image-rendering:pixelated}.layer{position:absolute;width:18%;height:26%;object-fit:contain;bottom:-2%;pointer-events:none;image-rendering:pixelated}.layer.left{left:-2%}.layer.right{right:-2%}.hide-props .layer{display:none}.props-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px}.prop{display:block;height:110px;background:#1c2532;border:1px solid #334154;border-radius:6px}.prop img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}h3{margin:26px 0 12px;font-size:20px}h3 small{font-size:13px;color:#a3afbc;margin-left:12px;font-weight:400}.drops-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.monsters-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}figure{margin:0;background:#1b2431;border:1px solid #344154;border-radius:9px;overflow:hidden}figure a{display:block}figure img{display:block;width:100%;object-fit:contain;image-rendering:pixelated}.drop img{height:165px}.monster img{aspect-ratio:1}.monster.major{grid-column:2}.drop.uncommon{border-color:#65a89d}.drop.rare{border-color:#c2a35c}figcaption{border-top:1px solid #303d4f;padding:10px 12px}figcaption b{display:block;font-size:16px}figcaption span{font-size:12px;color:#a1b7c6}.monster.major figcaption span{color:#e2b971}.sheet-links{display:flex;gap:18px;flex-wrap:wrap;margin-top:20px;font-size:13px}.light figure,.light .prop{background:#dbe2e7;color:#1a2634}.light figcaption span{color:#566577}button.toggle{background:#263447;color:#ede6d6;border:1px solid #627086;border-radius:5px;padding:6px 10px;cursor:pointer}.notice{font-size:12px;color:#9eaabd}.region-tab:focus-visible,a:focus-visible,button:focus-visible{outline:2px solid #e7c887;outline-offset:3px}[hidden]{display:none!important}@media(max-width:700px){main{padding:18px 12px 40px}h1{font-size:22px}nav{gap:5px}.region-tab{font-size:14px}h2 small{display:block;margin-left:0}h3 small{display:block;margin-left:0}.drops-grid{grid-template-columns:repeat(3,1fr)}.drop img{height:115px}.monsters-grid{gap:7px}figcaption{padding:7px}figcaption b{font-size:12px}.props-row{gap:6px}.prop{height:75px}.topbar{gap:8px;font-size:12px}.level{font-size:14px}}
  </style><style>.monster-sheet{padding:22px}.monster-sheet img{width:100%;max-height:1000px;object-fit:contain}.monster-name{padding:8px 12px;border-left:2px solid var(--accent);background:#1b2431}.monster-name b,.monster-name span{display:block}.monster-name span{font-size:12px;color:#a1b7c6}.monster-name.major{grid-column:2}.light .monster-name{background:#dbe2e7;color:#17232f}.light .monster-name span{color:#566577}@media(max-width:700px){.monster-sheet{padding:8px}.monster-name{padding:5px}.monster-name b{font-size:11px}}</style></head><body><main><h1>中盤〜後半｜5地域デザイン案</h1><p class="intro">背景 · ドロップ25種 · 敵35種</p><div class="topbar"><button class="toggle" id="backing" type="button" aria-pressed="false">明るい下地</button><button class="toggle" id="props-toggle" type="button" aria-pressed="true">配置パーツ ON</button><a href="PLAN.md">ステージ企画</a><a href="PROMPTS.md">生成プロンプト</a><a href="manifest.json">素材一覧</a><span class="notice">静止デザイン確認用／モーション未制作</span></div><nav aria-label="地域">${nav}</nav>${renderedSections}</main><script>
  const tabs=[...document.querySelectorAll('.region-tab')];function select(id){if(!tabs.some(t=>t.dataset.region===id))id=tabs[0].dataset.region;tabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.region===id)));document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!==id);history.replaceState(null,'','#'+id)}tabs.forEach(t=>t.addEventListener('click',()=>select(t.dataset.region)));document.getElementById('backing').addEventListener('click',e=>{const on=document.body.classList.toggle('light');e.target.setAttribute('aria-pressed',String(on));e.target.textContent=on?'暗い下地':'明るい下地'});document.getElementById('props-toggle').addEventListener('click',e=>{const hidden=document.body.classList.toggle('hide-props');e.target.setAttribute('aria-pressed',String(!hidden));e.target.textContent=hidden?'配置パーツ OFF':'配置パーツ ON'});select(location.hash.slice(1));
  </script></body></html>`;
  fs.writeFileSync(path.join(root,'review.html'),html.replace('静止デザイン確認用／モーション未制作','静止基準の確認／氷河以降のモーション未制作'));
  fs.writeFileSync(path.join(root,'docs/history/development-log.md'),'# 中盤〜後半の静止デザイン案\n\n2026-10-12 JST。組み込み image_gen 使用。砂漠はモーション・専用攻撃を制作し本編登録済み。[砂漠の素材記録](../../desert-motions/docs/history/development-log.md)。高原は素材制作中。氷河以降は企画・静止デザイン段階。\n\n- [確認ページ](review.html)\n- [企画書](PLAN.md)\n- [氷牙マンモス・危険技の確認](glacier/mammoth-review.html)\n- [氷河企画](GLACIER-PLAN.md)\n- [後半3地域の危険行動／妨害企画](DANGER-ACTIONS.md)\n- [全プロンプト](PROMPTS.md)\n- [修正プロンプト](REVISIONS.md)\n- [素材一覧](manifest.json)\n- [画像QA](qa.json)\n- [生成履歴](generation.json)\n\n5地域各4枚の初期生成原画20枚、修正版を別名で保持。確認ページは各地域の最新版を表示する。個別の背景パーツ20枚・ドロップ25枚、背景合成5枚。氷河の大ボスとレア素材だけを差し替え、個別マンモス基準・氷牙・4種の静止エフェクトも保存。氷河以降のモーションは未制作。配置パーツ・素材は透明な隙間で切り出し、原画の色とalphaを保持する。個別画像はゲーム内縮尺の確定前。\n\n'+manifest.regions.map(r=>`## ${r.name}\n\n- [背景](${r.background})\n- [背景配置パーツ](${r.id}/props.png)\n- [ドロップ素材](${r.dropSheet})\n- [敵デザイン](${r.monsterSheet})\n`).join('\n'));
  const links=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
  const missingLinks=links.filter(link=>!fs.existsSync(path.join(root,link)));
  if(missingLinks.length)throw new Error('Broken links: '+missingLinks.join(', '));
  console.log(JSON.stringify({generatedSheets:activeAssets.length,props:activeRegions.length*4,drops:activeRegions.length*5,enemies:activeRegions.length*7,alphaAndCellBounds:'passed',emptyCells:'passed',missingLinks,review:path.join(root,'review.html')},null,2));
}
build().catch(e=>{console.error(e);process.exitCode=1});
