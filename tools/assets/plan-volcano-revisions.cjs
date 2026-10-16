'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const {developmentAsset,makeAssetDirectory,writeAssetJson}=require('../lib/project-paths.cjs');
const {enemies,effects}=require('./late-stage-first-pass-specs.cjs');
const first=developmentAsset('late-stage-first-pass/v1'),root=developmentAsset('volcano-motions/v2');
const read=f=>JSON.parse(fs.readFileSync(path.join(first,f),'utf8'));
const style='Canonical reference is the immutable identity and color standard. LEFT-facing 3/4, refined JRPG pixel clusters, crisp stepped edges and dark outlines. SAME head size, torso proportions, armor, horns, wings and tail throughout. Exactly the original connected limbs; no extra feet, no claw elongation. TRUE transparent alpha. Absolutely NO ambient red haze, backdrop gradient, aura, shadow, floor, checkerboard, labels or watermark. Every pixel outside the sharply outlined silhouette is alpha=0. Orange light ONLY inside scales/fins/armor. Full complete silhouette including every blade, tail, wing and claw inside its cell with ample clear margin, and empty gutters. Do not bake full projectile, beam, impact or ground VFX into the body sheet. Only tiny attached emission/core light allowed.';
const fixes={
 'idle':'Neutral -> small inhale -> neutral -> small exhale; do not spread cape or wings abruptly. Feet planted; head/torso position stable. Secondary tips move at most 8px in 1024 local coordinates. Same proportions in both rows. Smooth 4->1 loop.',
 'reaction':'Pose1 hit recoil RIGHT 15px with supporting feet planted; pose2 canonical neutral recovery; pose3 connected knees buckle and body sinks; pose4 TERMINAL collapsed prone creature/character, all original limbs still connected, head low, original equipment remains. Terminal lava core, scales, fins, eyes and wing light darken to dull red without yellow-white heat. No detached body parts. This is not a looping idle. Four distinct ordered poses.',
 'bite':'Keep head aligned forward; no upward gaze. Jaw pulls right 25px, opens, lunges LEFT 35px, returns neutral. Neck NEVER stretches or changes thickness. All four legs support body.',
 'claw':'The same short original claws, NEVER elongated. One near front limb retracts, coils, rakes LEFT and returns. Other original limbs support body and stay connected; wing roots and torso size unchanged.',
 'axe':'Exactly SAME original axe blade shape and haft length; both hands remain attached to haft. Windup, lifted blade with generous top padding, LEFT-down cut, upright neutral recovery. NO oversized blade or mutated helmet.',
 '灼熱噴き':'Distinct dangerous windup: neck retracts RIGHT, back fins then chest brighten strongly, head extends LEFT without stretching at release, canonical neutral recovery. Attached mouth origin only; fire fan separate.',
 '破甲の斧':'Distinct dangerous windup with planted feet and white reflection confined to the SAME axe edge. Blade pulls up-right, held bright windup, LEFT-down strike, upright neutral recovery. Full blade with extra top and left padding.',
 '灼球':'Neck retracts RIGHT, tiny ember attached inside open mouth, mouth faces LEFT at release, neutral recovery. NO detached fireball in any body cell. Wings retain canonical dimensions.',
 '双溶岩弾':'Neck retracts RIGHT without torso/neck elongation; dorsal fins pulse low then bright in held windup; LEFT mouth release pose can be replayed twice, neutral recovery. Tiny mouth light ONLY, NO detached bomb. Separate events at 0.8 second spacing.',
 '灼熱大扇':'Neck retracts RIGHT and DOWN slightly, dorsal fins and chest brighten; jaw releases LEFT with torso remaining low; neutral recovery. Four planted legs. Mouth emitter only; fan separate.',
 '断罪大薙ぎ':'Distinct HORIZONTAL great sweep, never overhead: SAME double axe pulled to RIGHT shoulder, held beside shoulder with waist turned 15 degrees, broad LEFT horizontal waist-height sweep, upright neutral return. Both hands continuously grip SAME haft. Cape attached, restrained lag.',
 '断層斬':'Distinct OVERHEAD slam: SAME double axe raised above head with very ample top padding, held vertical windup, full blade slams LEFT-down to ground, upright neutral return. Same haft, both grips. Cape attached with modest lag. Ground crack separate.',
 '紅蓮三連球':'Adult dragon girl. Face turned LEFT consistently. Both hands gather at chest, palms spread with tiny attached ember light, both palms extend LEFT as repeatable release, upright neutral return. Fingers connected and original claw sizes. NO free fireball in body sheet. Separate three launch events 0.8 seconds apart.',
 '紅翼竜息':'Adult dragon girl. Wings open modestly maintaining SAME span and shape; chest then throat light; torso leans LEFT and mouth opens LEFT at release; upright neutral return. Both feet planted, tail counterbalances, complete wing tips. NO beam in body sheet.',
 '翼震着地':'Four-legged dragon. Chest rises slightly, next pose lifts whole body 70px with ALL four connected feet tucked and both wings raised, release lands ALL four feet with knees bent at fixed ground baseline, neutral recovery. Wings stay SAME size and attached; tail uncoils only slightly. Shock VFX separate.',
 '双脈ブレス':'Four-legged dragon with four planted feet. Neck retracts RIGHT 35px, chest then throat lights, jaw releases LEFT 40px without stretching torso; neutral recovery. SAME wings and tail. Repeat release for second wave 1 second later; beam separate.',
 '噴火の三巣':'Four-legged dragon. Wings raise, whole torso lifts 80px with FOUR connected tucked feet, wing downbeat and mouth aims down-LEFT release, four feet return neutral. Wing rim light ONLY, NO lava bombs in body. Same wing dimensions and tail shape. Three launches 0.9 seconds apart.'
};
const fxRules={
 'fireball':'FLIGHT LOOP ONLY: same intact spherical core in all four frames, centered (400,512), short tail points RIGHT and flickers up/neutral/down/neutral. Never explodes, shrinks, vanishes or strikes floor. Frame4->1 seamless.',
 'lava-bomb':'FALLING FLIGHT LOOP ONLY: identical intact black basalt bomb centered (430,560), cracked orange core, short tail upper-RIGHT. Tail flickers 4 phases, no breaking apart, explosion or floor. Seamless 4->1.',
 'lava-pool':'LOW GROUND LOOP ONLY: stable elliptical dark basalt perimeter centered (512,760), shallow molten surface height under 130px, tiny internal bubbles. Same perimeter all four frames. NO tall eruptions or big rocks. Smooth 4->1.',
 'burn':'SMALL STATUS LOOP: only 5-7 tiny orange ember clusters in a broken low hollow oval, empty transparent center. Same compact size in all 4 phases, not an attack flame ring. Smooth 4->1.',
 'fissure':'ONE-SHOT directional progression with FIXED right origin (860,700): frame1 short crack x740..860, frame2 grows LEFT to x530, frame3 reaches x150, frame4 dies into small dark fragments. Low jagged crack, height under 180px, no giant rocks. Not full-length in all frames.',
 'fire-beam':'ONE-SHOT LEFTward breath. FIXED narrow round emitter at RIGHT (860,512) in all frames, open broad flame front pushed LEFT. NO right-pointing arrow tip. Phase1 short flame, phase2 stretches LEFT, phase3 full horizontal white-gold core, phase4 very sparse dying tongues. Clear red-black outline. Emitter never shifts.',
 'fire-fan':'ONE-SHOT fan. FIXED RIGHT mouth origin (850,512); flame grows LEFTward as wide fan. White-gold tongues and red-black outline; final phase sparse dying sparks, almost gone. No backdrop haze.',
 'landing-shock':'ONE-SHOT LOW hollow elliptical ring centered (512,760), FULLY empty transparent center. Small ring -> expands -> large thin ring -> sparse dying rim fragments. Never fill center with orange light.',
 'armor-break':'Compact split gold shield icon, clear isolated outline, red fracture, 4 subtle pulse phases. No backdrop or floor. Status loop.'
};
async function main(){
 if(fs.existsSync(path.join(root,'plan.json')))throw Error('Revision plan already exists; use revision-backlog.json and record-volcano-revision.cjs without overwriting the saved plan.');
 makeAssetDirectory(root);const all=read('jobs.json'),notes=read('review-notes.json'),refs=read('references.json'),jobs=[];
 for(const e of enemies.filter(e=>e.region==='volcano')){
  const src=path.join(first,'references',e.id+'.png'),dest=path.join(root,'references',e.id+'.png');makeAssetDirectory(path.dirname(dest));if(!fs.existsSync(dest))fs.copyFileSync(src,dest);
  const base=all.filter(j=>j.enemy===e.id);
  for(const j of base){
   if(e.gait==='trot'&&j.motion.startsWith('move-'))continue;
   const key=j.motion==='attack'?e.normal:j.label;
   const prompt=j.motion==='idle'||j.motion==='reaction'
    ?'FOUR distinct poses in EXACT equal 2x2 cells, order TL TR BL BR. '+e.label+'. '+fixes[j.motion]
    :j.motion.startsWith('move-')?j.prompt.split('Use case: stylized-concept. ')[1].split('Match the FIRST')[0]+' Keep exact same canonical armor/face/wing/tail proportions in both halves; anatomical left leg near, right leg far. Grounded sole y=820. Full neutral return across 3->4 and 6->1. No crouched foot becoming a hand. Adult girl face clearly LEFT.':
     'FOUR distinct attack poses EXACT equal 2x2 TL TR BL BR: anticipation, held dangerous windup, release, recovery. '+e.label+'. '+fixes[key];
   jobs.push({...j,id:j.id,reference:'references/'+e.id+'.png',source:'sources/'+e.id+'/'+j.motion+'-v2.png',firstPass:j.source,issues:notes[j.id]?.issues||[],prompt:'Use case: stylized-concept. '+prompt+' '+style});
  }
  if(e.gait==='trot'){
   const original=read('guides/'+e.id+'/coordinates.json');writeAssetJson(path.join(root,'guides',e.id,'coordinates.json'),{...original,status:'planning targets only; output measurements recorded separately'});
   for(const f of original.frames){
    const coords=Object.entries(f.legs).map(([id,l])=>id+' '+(l.grounded?'GROUND SUPPORT':'LIFTED SWING')+' paw ('+Math.round(l.screen.paw.x)+','+Math.round(l.screen.paw.y)+'), hip ('+Math.round(l.screen.root.x)+','+Math.round(l.screen.root.y)+'), knee ('+Math.round(l.screen.joint.x)+','+Math.round(l.screen.joint.y)+')').join('; ');
    const guide='guides/'+e.id+'/frame-'+(f.index+1)+'.png';let shapes='';
    for(const id of ['RF','RH','LF','LH']){const l=f.legs[id],s=l.screen;shapes+='<g stroke="'+l.color+'" fill="none" stroke-width="8"><path d="M '+s.root.x+' '+s.root.y+' L '+s.joint.x+' '+s.joint.y+' L '+s.ankle.x+' '+s.ankle.y+'"/><ellipse cx="'+s.paw.x+'" cy="'+(s.paw.y-8)+'" rx="18" ry="8"/></g>';}
    await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#172530"/>'+shapes+'</svg>')).png().toFile(path.join(root,guide));
    jobs.push({id:e.id+'/move-'+(f.index+1),enemy:e.id,region:'volcano',motion:'move-single',frame:f.index,cols:1,rows:1,reference:'references/'+e.id+'.png',guide,source:'sources/'+e.id+'/move-frame-'+(f.index+1)+'-v2.png',firstPass:'sources/'+e.id+'/move-'+(f.index<3?1:2)+'-generated.png',issues:[...(notes[e.id+'/move-1']?.issues||[]),...(notes[e.id+'/move-2']?.issues||[])],prompt:'Use case: precise-object-edit. ONE single in-place TROT pose, frame '+(f.index+1)+' of 6, 120ms. Image1 immutable canonical creature, image2 mathematical joint guide ONLY; never paint its colored lines. Match identity from image1 exactly, change only legs into this pose. Canvas coordinates 0..1024. Fixed head, torso, wings, tail, body root (540,550), foot contact plane y~825. Anatomical LEFT legs LF/LH NEAR brighter; RIGHT legs RF/RH FAR darker. A=LH+RF, B=LF+RH. Exactly FOUR legs with same short clawed paws; trace every hip/thigh/knee/shin/ankle/foot, including hidden sections. Naturally occlude far legs, no widening to show them, no detached paws. Required targets: '+coords+'. Smooth 3->4 and 6->1. '+style});
   }
  }
 }
 for(const j of all.filter(j=>j.effect&&(j.region==='volcano'||j.region==='shared'))){
  const f=effects.find(f=>f.id===j.effect);jobs.push({...j,source:'sources/effects/'+j.effect+'-v2.png',firstPass:j.source,issues:notes[j.id]?.issues||[],prompt:'Use case: stylized-concept. FOUR-frame PIXEL-ART VFX sheet EXACT equal 2x2 TL TR BL BR. '+f.description+'. '+(fxRules[j.effect]||'ONE-SHOT: small onset, energetic expansion, powerful maximum, final sparse tiny dying fragments (under 15% peak area), connect to complete disappearance. No lingering solid ground or bright main arc at end.')+' Fixed effect origin and uniform pixel scale. Complete effect within EACH cell with 14% clear padding and perfectly empty gutters. Refined crisp JRPG pixel clusters, orange gold white heat and black-red sharp outline; no airbrush. TRUE transparent alpha including hollow centers. NO ambient background glow, NO gradient haze, no ground slab, text, labels, grid, checkerboard, character or watermark. Glow confined to sharply defined flame tongues, no soft rectangular glow behind. Transparent pixels everywhere else.'});
 }
 writeAssetJson(path.join(root,'plan.json'),{date:'2026-10-14 JST',tool:'built-in image_gen',scope:'complete volcano asset library for subsequent stage integration',firstPass:'../late-stage-first-pass/v1/coverage.json',enemies:enemies.filter(e=>e.region==='volcano'),effects:effects.filter(e=>e.region==='volcano'||e.region==='shared'),jobs,references:refs.filter(r=>enemies.some(e=>e.id===r.enemy&&e.region==='volcano')).map(r=>({...r,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.file))).digest('hex')}))});
 fs.writeFileSync(path.join(root,'PROMPTS.md'),'# 火山素材の修正指定\n\n組み込み image_gen。固定基準は plan.json。一次原画は保持。計算座標と実測は別記録。\n\n'+jobs.map(j=>'## '+j.id+'\n\n'+j.prompt+'\n\n一次指摘: '+j.issues.join(' / ')+'\n\n').join(''));
 console.log(JSON.stringify({root,jobs:jobs.length}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
