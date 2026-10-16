'use strict';
// Non-destructive repair round. The first-pass sources and reviews are immutable inputs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { developmentAsset, makeAssetDirectory, writeAssetJson } = require('../lib/project-paths.cjs');
const root = developmentAsset('extradimensional-goddess/repair-v2');
const first = developmentAsset('extradimensional-goddess/first-pass-v1');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function plan() {
  if (fs.existsSync(path.join(root, 'jobs.json'))) throw Error('Repair plan already exists');
  const originals = JSON.parse(fs.readFileSync(path.join(first, 'jobs.json'), 'utf8'));
  const ids = ['parts/throne', 'parts/halo', 'motions/p1-shot', 'motions/p2-cast-1', 'motions/p2-cast-2', 'motions/p2-ultimate-1', 'motions/p2-ultimate-2', 'motions/p2-ultimate-3', 'motions/down'];
  const jobs = ids.map(id => structuredClone(originals.find(j => j.id === id)));
  for (const j of jobs) {
    const phase1 = j.id === 'parts/throne' || j.id === 'motions/p1-shot';
    j.references = [relative(developmentAsset('extradimensional-goddess/v1/references/' + (phase1 ? 'phase-1-seated.png' : 'phase-2-awakened.png')))];
    if (j.kind === 'motion') j.references.push(relative(path.join(first, 'source/parts/' + (phase1 ? 'body-seated' : 'body-floating') + '.png')));
    j.replaces = '../first-pass-v1/' + j.source;
    j.reason = j.id.includes('cast') || j.id.includes('ultimate') ? 'Missing interval, seated lower body, hand trajectory, return to floating idle.' : j.id === 'motions/down' ? 'User direction: satisfied farewell and return to another dimension.' : j.id === 'motions/p1-shot' ? 'Three-arm emission pose and cell overlap.' : 'Remove duplicate layer decoration.';
    if (j.id === 'motions/down') {
      j.durationMs = [300, 350, 350, 800];
      j.frames = [
        'F1: upright hovering neutral body, gentle satisfied smile, eyes softly open. L/R=(170,244)/(352,260).',
        'F2: head nods politely by five degrees, eyes gently close, warm contented smile. Torso stays upright, hands relax. No loss of strength.',
        'F3: head upright again, contented smile, screen-right hand rises to shoulder R=(342,190), palm outward in a restrained farewell; L=(180,250).',
        'F4: the SAME one figure rises 12 virtual pixels, maintains farewell hand and smile, hair/sleeves trail slightly downward. Full opaque body ONLY. Playback will fade this single sprite to zero; do not draw transparency, afterimages, particles or a portal.'
      ];
      j.geometry = { bodyDy: [0, 0, 0, -12], handR: [[352,260],[342,258],[342,190],[342,178]], bodyFade: { startMs: 1000, endMs: 1450 }, returnEndMs: 1800 };
    }
    const count = j.frames.length;
    j.cols = count === 4 ? 2 : count; j.rows = count === 4 ? 2 : 1;
    const common = 'Use case: precise-object-edit\nAsset type: repaired transparent JRPG pixel-art sprite sheet, ' + j.id + '.\nInput image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.\n';
    const layout = `Layout: ${count} equal square cells, ${j.cols} columns and ${j.rows} rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.\n`;
    let request;
    if (j.kind === 'motion') {
      request = (phase1
        ? 'Seated body only, unsupported sitting pose, cheek supported by the SCREEN-LEFT arm, crossed legs unchanged. Move ONLY the SCREEN-RIGHT arm from its existing shoulder. EXACTLY TWO ARMS: the emitting hand is still on the screen-right side of the body, never add a hand to the left of the cheek-support arm. No throne, large ring, shadow, projectile or glow. '
        : 'Upright FLOATING body only, torso vertical, legs extend DOWN naturally as in original floating master. No seated pose, raised seated knee, crossed seated legs, cheek support, throne or large halo. Keep clothing opaque; skirt lining covers the legs during arm raises. Hands remain attached through elbows to their own two shoulders. No attack effects or magic lights. ') + '\nFrames:\n' + j.frames.join('\n');
      if (j.id.includes('p2-cast')) request += '\nHands do not touch or clasp; there is a small empty space between inward-facing palms in F3. F6 must match the floating low-open-palms starting pose.';
      if (j.id.includes('p2-ultimate')) request += '\nThe final release returns to low open palms and upright hovering; never return to cheek support. Above-head pose is a calm formal spell gesture. Garments remain fully opaque and draped throughout.';
      if (j.id === 'motions/down') request += '\nMood: pleased with a worthy encounter, serene and voluntary departure. Keep posture dignified and vertical. No injury, collapse, slumping, grief, death, explosion, extra bodies, ghost trail, reward object or portal.';
    } else request = j.id === 'parts/throne'
      ? 'ONE empty ivory/navy/gold throne matching the original. Preserve the chair silhouette, crescent back, cushions, legs and armrests. Remove the entire LARGE circular celestial ring behind the chair. No rings floating behind or above it, no woman, body, hair, dress, small crown or gems detached as extra objects. Complete chair within central safe area.'
      : 'ONE isolated rigid gold celestial ring assembly matching the large rings behind the original floating goddess, with cyan diamond nodes. Remove the SMALL floating elliptical crown above her head: that crown belongs to the body layer. No person, face, hair, clothes, chair or ground. Keep the large circular ring motif with clean transparent interior. Complete assembly within central safe area.';
    j.prompt = common + layout + request;
  }
  for (let n = 0; n < 2; n++) {
    const frames = n === 0 ? [
      'F1: a quiet thin vertical gold/cyan oval outline, width130 height300, transparent star-specked interior.',
      'F2: oval opens to width270 height360, a welcoming deep-violet transparent aperture with sparse cyan stars.',
      'F3: oval fully open width300 height380, thin luminous gold rim, stable and peaceful.'
    ] : [
      'F4: same oval remains fully open width300 height380, rim softens slightly; the separate body is departing.',
      'F5: AFTER the separate body is gone, oval narrows to width90 height340, smooth rim draws inward. No cracking or shards.',
      'F6: one dim thin vertical seam, width6 height90, almost gone. Only this seam, no gems or extra glowing objects. Playback fades it to zero.'
    ];
    const id = 'effects/goddess-return-' + (n + 1);
    jobs.push({ id, kind: 'effect', clip: 'effects/goddess-return', count: 3, cols: 3, rows: 1, cell: [512,512], anchor: [256,256], frameStart: n*3+1, durationMs: n ? [650,200,150] : [150,250,400], loop: false, source: 'source/' + id + '.png', references: [], replaces: '../first-pass-v1/source/effects/goddess-defeat-' + (n + 1) + '.png', reason: 'Voluntary dimensional return; no shattered halo, death blast or repeated rewards.', frames,
      prompt: 'Use case: stylized-concept\nAsset type: transparent JRPG pixel-art dimensional-return OVERLAY, ' + id + '.\nExactly THREE equal square cells in ONE horizontal row. Every cell is virtual 512x512, portal center fixed at (256,256). Strict safe bounds x=60..452,y=52..460 in EACH cell, wide transparent gutters. Crisp stepped pixels, thin pale gold rim, cyan stars, dark-violet transparent aperture. Same camera and palette across all frames.\nPrimary request: a calm welcoming doorway to another dimension for a satisfied goddess leaving after battle. ONLY portal overlay, no goddess, person, humanoid outline, chair, body halo, small crown, shattering ring, explosion, reward jewel, text or background. True transparent alpha; see-through interior with sparse tiny stars.\nFrames:\n' + frames.join('\n') });
  }
  makeAssetDirectory(root);
  writeAssetJson(path.join(root, 'jobs.json'), jobs);
  writeAssetJson(path.join(root, 'generation.json'), { date: '2026-10-15', timezone: 'Asia/Tokyo', tool: 'built-in image_gen', status: 'repair-candidates-not-registered', records: [], failures: [] });
  fs.writeFileSync(path.join(root, 'PROMPTS.md'), '# 異次元の女神 修正第1回：全文プロンプト\n\n内蔵 image_gen。初稿を保持した別バージョン。\n\n' + jobs.map(j => '## ' + j.id + '\n\n```text\n' + j.prompt + '\n```\n').join('\n'));
  console.log(JSON.stringify({ jobs: jobs.length, frames: jobs.reduce((s,j) => s+j.count, 0) }));
}

async function record(id, input, revision = false) {
  const jobs = read('jobs.json');
  const job = jobs.find(j => j.id === id); if (!job) throw Error('Unknown job ' + id);
  const generation = read('generation.json');
  const previous = generation.records.filter(r => r.id === id);
  if (previous.length && !revision) throw Error('Use revise to retain an additional version ' + id);
  if (revision) job.source = 'source/' + id + '-r' + (previous.length + 1) + '.png';
  const dest = path.join(root, job.source);
  if (fs.existsSync(dest)) throw Error('Refusing replacement ' + dest);
  makeAssetDirectory(path.dirname(dest)); fs.copyFileSync(input, dest, fs.constants.COPYFILE_EXCL);
  const item = { id, source: job.source, sha256: hash(dest), prompt: job.prompt, generatedPath: input, transparent_background: true, references: job.references.map(file => ({ file, sha256: hash(path.resolve(root,file)) })), attempt: previous.length + 1 };
  generation.records.push(item); writeAssetJson(dest.replace(/\.png$/, '.generation.json'), item); writeAssetJson(path.join(root,'generation.json'),generation);writeAssetJson(path.join(root,'jobs.json'),jobs);
  console.log(JSON.stringify({ id, source: job.source, recorded: generation.records.length }));
}

async function stats(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
  let clear=0, edge=0, x0=info.width,y0=info.height,x1=-1,y1=-1;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) { const a=data[(y*info.width+x)*4+3]; if(!a) clear++; if(a>32) {x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y); if(!x||!y||x===info.width-1||y===info.height-1) edge++;} }
  return {width:info.width,height:info.height,transparentFraction:clear/(info.width*info.height),edgePixels:edge,bounds:x1<0?null:[x0,y0,x1,y1],marginFraction:x1<0?null:Math.min(x0/info.width,y0/info.height,(info.width-1-x1)/info.width,(info.height-1-y1)/info.height)};
}

async function build() {
  const jobs=read('jobs.json'), generation=read('generation.json'), groups=new Map(), mechanical=[];
  fs.writeFileSync(path.join(root,'PROMPTS.md'),'# 異次元の女神 修正第1回：全文プロンプト\n\n内蔵 image_gen。試行別の全文・参照・ハッシュは generation.json に保持。\n\n'+jobs.map(j=>'## '+j.id+'\n\n```text\n'+j.prompt+'\n```\n').join('\n'));
  for(const j of jobs) {
    if(!generation.records.some(r=>r.id===j.id)) continue;
    const file=path.join(root,j.source),meta=await sharp(file).metadata(),clip=j.clip||j.id;
    if(!groups.has(clip)) groups.set(clip,{id:clip,kind:j.kind,cell:j.cell,anchor:j.anchor,loop:j.loop,frames:[],sources:[],expectedFrames:jobs.filter(x=>(x.clip||x.id)===clip).reduce((s,x)=>s+x.count,0)});
    const group=groups.get(clip); group.sources.push(j.source);
    for(let i=0;i<j.count;i++) {
      const col=i%j.cols,row=Math.floor(i/j.cols),left=Math.floor(col*meta.width/j.cols),top=Math.floor(row*meta.height/j.rows);
      const cellRect={left,top,width:Math.floor((col+1)*meta.width/j.cols)-left,height:Math.floor((row+1)*meta.height/j.rows)-top};
      const rect=j.extractionWindow?{left:left+j.extractionWindow.left,top:top+j.extractionWindow.top,width:j.extractionWindow.width,height:j.extractionWindow.height}:cellRect;
      if(rect.left<left||rect.top<top||rect.left+rect.width>left+cellRect.width||rect.top+rect.height>top+cellRect.height)throw Error('Extraction outside cell '+j.id);
      const index=(j.frameStart||1)+i,dir=path.join(root,'review',clip);makeAssetDirectory(dir);
      const out=path.join(dir,`frame-${String(index).padStart(2,'0')}.png`);
      await sharp(file).extract(rect).png().toFile(out);
      const measured=await stats(out); mechanical.push({job:j.id,index,...measured});
      const registration=clip==='effects/goddess-return'?{registrationAnchor:[(measured.bounds[0]+measured.bounds[2])/2,(measured.bounds[1]+measured.bounds[3])/2],anchorMethod:'measured center of alpha>32 bounds; portal rim visually checked; display placement only'}:{};
      group.frames.push({index,file:relative(out),source:j.source,cellRect,sourceRect:rect,extractionWindow:j.extractionWindow||null,durationMs:j.durationMs[i],description:j.frames[i],...measured,...registration});
    }
  }
  const catalog=[];
  for(const c of groups.values()) {
    c.frames.sort((a,b)=>a.index-b.index); const present=new Set(c.frames.map(f=>f.index));
    c.missingFrames=Array.from({length:c.expectedFrames},(_,i)=>i+1).filter(x=>!present.has(x));c.complete=!c.missingFrames.length;
    c.accepted=false;c.previewOnly=true;c.extraction='fixed rectangular cells; explicit common segment window where recorded; original RGB/alpha, no anatomy edits, individual scaling or origin correction';
    const size=320,cols=Math.min(4,c.frames.length),rows=Math.ceil(c.frames.length/cols),composites=[],pages=[];
    for(const [i,f] of c.frames.entries()) {
      const page=await sharp(path.join(root,f.file)).resize(size,size,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer();pages.push(page);
      composites.push({input:await sharp(page,{raw:{width:size,height:size,channels:4}}).png().toBuffer(),left:i%cols*size,top:Math.floor(i/cols)*348+28});
      composites.push({input:Buffer.from(`<svg width="320" height="28"><text x="12" y="21" fill="#e6ecff" font-family="sans-serif" font-size="16">F${f.index} / ${f.durationMs}ms</text></svg>`),left:i%cols*size,top:Math.floor(i/cols)*348});
    }
    const dir=path.join(root,'review',c.id);c.contact=relative(path.join(dir,'contact.png'));c.gif=relative(path.join(dir,'preview.gif'));
    await sharp({create:{width:cols*size,height:rows*348,channels:4,background:'#25283e'}}).composite(composites).png().toFile(path.join(root,c.contact));
    await sharp(Buffer.concat(pages),{raw:{width:size,height:size*pages.length,channels:4,pageHeight:size}}).gif({delay:c.frames.map(f=>f.durationMs),loop:0,dither:0,keepDuplicateFrames:true}).toFile(path.join(root,c.gif));
    writeAssetJson(path.join(dir,'manifest.json'),c);catalog.push(c);
  }
  writeAssetJson(path.join(root,'review-index.json'),catalog);writeAssetJson(path.join(root,'qa-mechanical.json'),mechanical);
  console.log(JSON.stringify({clips:catalog.length,frames:mechanical.length,cellEdgeFailures:mechanical.filter(f=>f.edgePixels).map(f=>f.job+':F'+f.index),missing:catalog.filter(c=>!c.complete).map(c=>c.id)}));
}

async function check() {
  const jobs=read('jobs.json'),generation=read('generation.json'),catalog=read('review-index.json');
  if(jobs.some(j=>!generation.records.some(r=>r.id===j.id&&r.source===j.source))) throw Error('Planned source missing');
  if(catalog.some(c=>!c.complete)) throw Error('Incomplete clip');
  for(const r of generation.records) {
    if(hash(path.join(root,r.source))!==r.sha256) throw Error('Changed source '+r.id);
    for(const ref of r.references) if(hash(path.resolve(root,ref.file))!==ref.sha256) throw Error('Changed reference '+ref.file);
  }
  for(const c of catalog) for(const f of c.frames) {
    const src=await sharp(path.join(root,f.source)).extract(f.sourceRect).ensureAlpha().raw().toBuffer();
    const frame=await sharp(path.join(root,f.file)).ensureAlpha().raw().toBuffer();
    if(!src.equals(frame)) throw Error('Altered cell '+f.file);
    if(!f.transparentFraction) throw Error('No transparency '+f.file);
  }
  const boundaryIssues=catalog.flatMap(c=>c.frames.filter(f=>f.edgePixels).map(f=>({clip:c.id,frame:f.index,pixels:f.edgePixels})));
  console.log(JSON.stringify({planned:jobs.length,recorded:generation.records.length,clips:catalog.length,frames:catalog.reduce((s,c)=>s+c.frames.length,0),integrity:'pass; source hashes, references and RGB/alpha extraction verified',boundaryIssues,assetAcceptance:boundaryIssues.length?'blocked; preserve the issue in review notes':'visual review required'}));
}
async function preview() {
  // Reuse the successful browser captures; never rerun playback for a report.
  const dir=path.join(root,'review/return-composite');makeAssetDirectory(dir);
  const times=[0,450,850,1200,1450,1650,1800,2000,2300],delay=[450,400,350,250,200,150,200,300,300],pages=[];
  for(const t of times)pages.push(await sharp(path.resolve(__dirname,'../../output/goddess-repair/return-'+t+'.png')).resize(512,288,{kernel:'nearest'}).ensureAlpha().raw().toBuffer());
  await sharp(Buffer.concat(pages),{raw:{width:512,height:288*pages.length,channels:4,pageHeight:288}}).gif({delay,loop:0,dither:0,keepDuplicateFrames:true}).toFile(path.join(dir,'preview.gif'));
  writeAssetJson(path.join(dir,'manifest.json'),{status:'review-only-not-runtime',source:'successful browser captures from tools/verify/verify-goddess-repair.cjs',timesMs:times,delayMs:delay,loop:'review repeats; intended return is one shot',file:'preview.gif'});
  console.log(relative(path.join(dir,'preview.gif')));
}
const [command,id,input]=process.argv.slice(2);
Promise.resolve().then(()=>({plan,record:()=>record(id,input),revise:()=>record(id,input,true),build,check,preview}[command]||(()=>{throw Error('Use plan / record ID FILE / revise ID FILE / build / check / preview');}))()).catch(e=>{console.error(e);process.exitCode=1;});
