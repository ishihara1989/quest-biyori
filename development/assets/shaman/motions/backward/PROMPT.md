# 呪術師 backward 8-frame revision


## 2026-10-06 再制作（L/R 固定・低い脚通過・胸前ガード）

Method: built-in image_gen; transparent_background=true. Selected source: source/shaman-backward-generated-v6.png. Previous sources are preserved. v5 had incorrect L-forward contacts in4/5 and was not adopted. v6 corrects only those phase errors. One network connection error on the first v5 request was retried with the same full prompt. No anatomy was drawn, interpolated, mirrored or duplicated in code; crop/nearest-neighbor/composited QA only.

L is the near bare brown thigh with white marks and gold/turquoise fittings. R is the far dark trouser thigh. The guard arm stays at chest and eyes watch right in all8, with short backward steps. Visual review is in QA.md and gait-review.json.

### Full prompt v5

Use case: identity-preserve. Image1 is a correct newly generated EIGHT-PHASE FORWARD sheet of this shaman, used as identity, style, foot-pose order and fixed leg-depth reference. Image2 is ONLY the desired eight-phase gait diagram. NEVER copy diagram colors or diagram drawing style into the character. Create a NEW BACKWARD retreat sheet, eight independently redrawn full-body pixel-art poses in same 4columns x2rows, chronological order1-4 top5-8 bottom. Transparent RGBA, no visible grid, text, background, shadows. Full hair/staff/skirt/boots inside cells with wide empty gutters/margins.
Retain SAME original shaman face, brown skin, amber eyes watching RIGHT, silver high ponytail, earrings, gold jewelry, brown crop top, coral/turquoise skirt, skull ornament, all accessories and brown strapped boots. Same skull-topped wooden staff AHEAD on screen RIGHT held in same hand; never swap hands or orb side. Same detailed crisp pixel art. SAME scale/hip x per cell, subtle vertical bob.
Change motion to cautious BACKWARD retreat toward screen LEFT while still watching threat on screen RIGHT. Raise the FREE hand/forearm at screen LEFT of body ACROSS THE CHEST in a small defensive guard, palm/fist near clavicle, wrist and elbow bent, modest protective lean away left; keep guarded arm through ALL8 and seam8→1. Staff upright ready ahead/right, no attack. Short controlled backward steps, more compact stride than forward.
ANATOMICAL IDENTITIES are inviolate: LEFT L = BARE BROWN THIGH with WHITE SKIN PAINT and ornate gold/turquoise boot fittings, always CAMERA-NEAR. RIGHT R = DARK TROUSER THIGH and plainer boot, always CAMERA-FAR. L hides R when crossing. Never swap thigh markings or their legs or depth. Both boots have heels LEFT, toe extensions RIGHT in ALL8 even while retreating.
Use EXACT alternating phase plan shown in diagram and image1:
1 WHITE L front RIGHT contact; DARK R back LEFT toe contact.
2 WHITE L comes BACK toward center bearing weight; DARK R comes forward from rear very low.
3 LOW PASSING: WHITE L planted UNDER HIP support, DARK R passes BEHIND it lifted one sole-height, ankles at almost SAME x, white L boot/shin hides dark R. No open stride, no high knee.
4 WHITE L goes back LEFT and heel rises; DARK R reaches FORWARD RIGHT almost touching down. White thigh slopes left.
5 OPPOSITE CONTACT: WHITE-PAINTED thigh slopes BACK LEFT and its ornate gold/turquoise boot LEFT/rear of hip. DARK trouser slopes FORWARD RIGHT into boot RIGHT/front of hip. White leg stays closer to camera even while on left. Do not repeat1.
6 WHITE L low swings forward from rearLEFT toward middle; DARK R planted comes back from frontRIGHT.
7 OPPOSITE LOW PASSING: DARK R planted UNDER HIP as support. WHITE L swings IN FRONT of R, ankle under hip same x and ONE SOLE height lifted above dark planted boot. WHITE L boot is visibly higher; dark planted boot extends lower to ground. White L occludes dark R. No high knees.
8 WHITE L reaches frontRIGHT very close to1, ready to plant; DARK R trails backLEFT. Smooth tiny difference8→1 in feet/hip/guard/staff/hair.
No phase reversal, no swapped garments, no duplicate half cycles, no facing change. All8 pose drawings are new guarded retreat frames, with leg order consistent with the first image.

### Full prompt v6

Use case: precise-object-edit. Image1 is the 4x2 eight-frame guarded BACKWARD animation EDIT TARGET. Image2 is correct forward gait, FOOT IDENTITY AND PHASE REFERENCE ONLY, do not copy relaxed arms. Keep guarded free fist across chest in every frame, exact existing face/torso/staff/hair/pixel style/full transparent margins, right-facing camera and 4x2 order. Edit ONLY LOWER BODY of frames4 and5 in image1 to match their opposite-leg phases in image2.

TOP ROW FOURTH CELL, FRAME4: Change WHITE-PAINTED bare camera-near LEFT thigh to slope BACKWARD down-LEFT from hip, knee and its ornate gold/turquoise boot at screenLEFT/rear of hip; heel rising. Change DARK-TROUSER far RIGHT leg to reach FORWARD screenRIGHT, boot right/ahead of hip low preparing to plant. White left leg remains nearer camera. This is pre-contact version of nextframe5. It is NOT white leg forward.
BOTTOM ROW FIRST CELL, FRAME5: Exact OPPOSITE contact toframe1. WHITE-PAINTED BARE left thigh slopes diagonally BACK down-LEFT from pelvis into ornate gold/turquoise boot planted on LEFT side BEHIND hip. DARK-TROUSER right thigh slopes diagonally FORWARD down-RIGHT from hip into plainer boot planted on RIGHT side AHEAD hip. The white-painted thigh and ornate boot MUST be visibly LEFT of the dark trouser thigh and rightmost boot. Camera-near WHITE leg stays front of DARK leg in depth, not switched. If necessary shift split skirt modestly to reveal the bare white-painted L thigh going left. Do not put white leg forward/right as in current incorrectframe5.

All other poses1,2,3,6,7,8 preserve phase and feet. Frame3 white L support/dark R passing behind; frame7 dark R support/white L swinging in front low. Both boots toes point RIGHT all8, heelsLEFT. SAME staff hand, orb, hair, scale, hip position and bent guard arm. No mirror, text, background, or duplicate frames. Preserve actual alpha transparency and enough clear cell margins.

## Archived prior revision notes


Method: built-in image_gen; transparent_background: true.
References: ../../idle-01.png and ../../source/shaman-idle-generated-v1.png.
Selected source: source/shaman-backward-generated-v4.png. Previous drafts are preserved beside it.

## New full prompt

Use case: identity-preserve.
Asset type: transparent production pixel-art animation spritesheet for an existing RPG character.
Input image 1 is the approved shaman idle sprite, input image 2 is its high-resolution design sheet. These are DESIGN and STYLE REFERENCES only. Create a NEW DEFENSIVE BACKWARD WALK animation, exactly EIGHT DISTINCT full-body poses in a clean 4 columns by 2 rows grid, frame order left-to-right top row 1-4 then bottom row 5-8. Transparent RGBA background, no checkerboard, text, labels, border, floor, shadow, or extra character.

Identity invariants in EVERY frame: same chibi young female elf shaman, warm brown skin, amber eyes looking right, pointed ears, white cheek marking, long silver high ponytail flowing left, gold earrings and turquoise feathers, dark brown crop top with gold/beaded trim, turquoise and coral red/orange skirt panels with original gold geometrical motifs, turquoise/gold belt and small side skull ornament, same brown ankle boots with gold trim and exposed toe straps. Same horned animal skull wooden staff with turquoise skull rune, turquoise orb hanging on its RIGHT side, red and teal feather decorations. Staff ALWAYS in the same original hand, ahead on SCREEN RIGHT, other hand free at screen-left side; do not switch hands, mirror, rotate skull or rearrange jewelry. Match approved proportions, face, palette, crunchy pixel-art outlines and shading exactly. Keep clothing and equipment topology constant.

Movement and guard: character faces SCREEN RIGHT while cautiously stepping BACKWARD toward screen LEFT. Keep head tilted very slightly forward with amber eyes watching danger at RIGHT. Upper body slightly crouched and guarded, knees softly bent, weight deliberate. The same original front/right hand holds the skull staff close to vertical immediately in front of the body as a protective barrier. The other free arm is raised and bent across the upper abdomen/chest with the open hand protecting herself; it MUST NOT dangle behind or trail at screen left. Keep this defensive pose stable across ALL EIGHT frames. Still graceful natural walking, no attack, no panic. Face, hips, knees and both BOOTS remain facing RIGHT; boot heels LEFT, toes RIGHT, even during rearward travel. Never reverse facing or mirror boots.
Leg identity fixed: the NEAR leg has the original visibly BARE brown thigh with WHITE PAINT MARKS, the FAR leg has dark brown COVERED trousers and darker shading. Show this distinction coherently in every frame. Half cycle swaps which of these two legs steps backward.
Eight short backward step phases relative to fixed HIP, no large split-legged stride:
1 NEAR bare-thigh leg contacts LEFT/behind hip, FAR covered leg supports RIGHT/ahead, both toes still RIGHT.
2 weight loads onto NEAR left foot, FAR right heel lifts; guarded torso settles slightly.
3 FAR dark covered leg retracts under hip, lifted foot passes NEAR support, FAR knee bends right.
4 FAR covered foot extends carefully LEFT/behind to prepare landing, NEAR support foot drifts RIGHT relative to hip.
5 FAR dark covered leg contacts LEFT/behind, NEAR bare-thigh foot planted RIGHT/ahead: opposite contact to frame1, distinct occlusion.
6 weight loads onto FAR left foot, NEAR right heel lifts.
7 NEAR bare-thigh leg retracts under hip with lifted boot passing FAR support, knee bending right.
8 NEAR bare-thigh foot extends carefully LEFT/behind ready for landing, FAR support drifts RIGHT relative to hip, smooth loop to frame1.
Keep body bounce subtle, guarding free arm across chest and hand gripping staff stable, staff tilt only a few degrees; ponytail, skirt and feathers follow a coherent slight delayed sway. No jumping, attack, huge swing, sudden stance change or duplicate pose.

Composition: 4x2 evenly spaced grid, each figure SAME scale, same hip horizontal position relative to its cell, common planted foot baseline per row, full ponytail and skull staff and boot visible, VERY WIDE entirely transparent gutters between figures and rows. All eight silhouettes strictly fit their own cell with no touching neighboring cell boundaries. Prefer landscape canvas suitable for 4x2 figures. Eight poses must be clearly distinguishable and form a seamless frame8-to-frame1 loop.

## Targeted leg correction v3 (full prompt)

Use case: precise-object-edit. Image 1 is the EIGHT-FRAME DEFENSIVE BACKWARD WALK SPRITESHEET EDIT TARGET, image 2 approved idle is identity reference. Preserve the existing rightward watchful eyes, defensive free hand across chest, original staff hand, upright skull staff in front, all hair, outfit, ornaments, sprite scale and 4x2 grid. Change ONLY leg gait and skirt occlusion immediately around thighs. Keep transparent RGBA with transparent gutters. All heels LEFT and toes RIGHT, both knees flex anatomically RIGHT even though movement is backward LEFT.

Essential leg identity: NEAR leg is BARE brown thigh with WHITE PAINT, FAR leg is DARK BROWN COVERED TROUSERS. Never change this. In these exact 8 phases relative to fixed HIP:
Frame1 upper left: NEAR bare foot LEFT/back planted and FAR dark foot RIGHT/front planted.
Frame2: NEAR bare foot LEFT of hip supports; FAR dark foot RIGHT of hip heel lifting.
Frame3: NEAR bare foot supports under hip; FAR dark boot lifted UNDER hip, knee bends RIGHT, passing cross-leg pose, distinct from frame2.
Frame4: NEAR bare foot RIGHT/front supports; FAR dark boot LEFT/back lifted preparing backward landing. Thus bare thigh slopes right and dark leg travels left.
Frame5 lower left: NEAR BARE boot RIGHT/front planted, FAR DARK boot LEFT/back planted. Opposite contact from frame1. The marked bare thigh slopes RIGHT. Do NOT repeat frame1 with bare foot at LEFT.
Frame6: FAR dark foot LEFT of hip supports; NEAR bare foot RIGHT of hip heel lifting.
Frame7: FAR dark boot supports under hip; NEAR bare boot lifted UNDER hip, bare knee bends RIGHT, visible cross-leg passing pose. Distinct from frame3 with different dark/bright leg occlusion.
Frame8: FAR dark foot RIGHT/front supports; NEAR bare boot LEFT/back lifted preparing landing; frame8 transitions to frame1.
Eight distinct cautious short steps, modest knee bend, no jumping, no foot mirroring, no face rotation, no free arm dangling, no new design. Keep exact approved eight torsos. Both boots face RIGHT consistently. Readable smooth full alternating cycle, NOT same leg motion repeated in both rows. No text. Full body/ponytail/staff strictly inside own cell with transparent margins.

## Targeted passing/contact correction v4 (full prompt)

Use case: precise-object-edit. Image 1 is the transparent 4x2 EIGHT-frame shaman defensive BACKWARD walking sprite sheet edit target, image2 approved idle design reference. Keep ALL eight heads, torsos, silver ponytails, costumes, staff hand, guarding free arm across chest and upright skull staff EXACTLY as they are. Preserve grid, RGBA transparency, scale, all margins. Edit ONLY the legs in TWO CELLS: top-row third cell FRAME3, bottom-row first cell FRAME5. ALL other poses stay unchanged.

LEG IDENTITY LOCK: the NEAR front leg has a BARE BROWN THIGH with WHITE PAINT MARKING; the FAR back leg is covered in DARK BROWN trousers. Near leg always overlays far leg. Never swap colors/marks to fake a step.

FRAME3 top row third: the BARE NEAR leg must be STRAIGHT DOWN supporting body weight, its boot FLAT ON THE GROUND under the hip. The DARK COVERED FAR leg is the ONLY RAISED leg, its knee bent slightly RIGHT and its DARK boot LIFTED UNDER THE HIP just in front/right of the planted near boot. REMOVE the current raised bare-thigh knee. This is not frame7, which correctly lifts the bare near leg.

FRAME5 bottom row first: MOVE THE BARE marked NEAR THIGH toward RIGHT/front, its near boot is planted at screen RIGHT OF HIP; MOVE THE DARK covered FAR LEG toward LEFT/back, its dark boot is planted screen LEFT OF HIP. This MUST be the opposite leg contact from frame1. Both feet grounded, short comfortable stride, clear bare near thigh slopes from hip toward RIGHT into RIGHT BOOT; dark trousers slope from hip toward LEFT into LEFT BOOT. Do NOT keep bare near leg leaning left, do NOT put bare boot on left as now.

Boot toes and heel invariants: every brown boot toe extends RIGHT and heel sits LEFT; no mirroring boots, no anatomical changes, no extra limbs. Preserve all other pixels as much as possible. Frame7 bare-leg lifted pose stays unchanged. The intended 8-frame backward loop is near-back contact, near load, FAR leg passing, FAR sent back, FAR-back contact, far load, NEAR leg passing, NEAR sent back. No text, labels, ground, shadow, effects or background.

## Current QA status

Eight independently generated poses, 4x2 source grid, selected after targeted leg corrections. No duplicated frames, interpolated poses, or code-painted anatomy. Shared nearest-neighbor builder only crops/resizes the generated art.

QA: reviewed selected high-resolution source and final 2048x224 spritesheet visually. Kept silver ponytail, brown skin, staff hand/skull/orb, costume topology, and near bare/marked thigh versus far covered leg. Backward guard holds the free hand across chest while watching right; passing frame3 uses the far leg and frame7 uses the near leg, and frame5 is the opposite contact. Fixed hip anchors avoid foot-bounds-induced lateral jitter; all planted baseline y=207. Each motion has 8 unique frames and an infinite preview GIF (forward 80ms x8 = 640ms, backward 90ms x8 = 720ms).

Verification: node tools/assets/build-motion.cjs shaman backward; node tools/assets/build-motion-preview.cjs shaman backward; node tools/assets/check-motion-assets.cjs shaman. All pass alpha, margins, unique-frame hashes, packing, pivot, timings, loop and source/prompt checks.

## Previous four-frame prompt (archived)


Method: built-in image_gen; transparent_background: true.

Reference 1: ../../source/shaman-idle-generated-v1.png (approved pixel-art identity/style).
Reference 2: ../../../references/shaman-original.png (costume design).

## Prompt

+Use case: stylized-concept. Asset type: transparent pixel-art RPG animation sprite sheet.
Input image 1 is the approved pixel-art idle sheet and is the authoritative identity, proportions, rendering and palette reference. Input image 2 is supporting character costume reference only. Create this exact SAME female shaman: warm brown skin, pointed ears, amber eyes, white cheek paint, enormous silver-white high ponytail with orange tie and feather earrings; teal and orange layered tribal skirt, black cropped bodice, brown boots, golden bone/skull jewelry; gnarled brown skull-topped staff with turquoise hanging orb and feathers in the front/right hand. Preserve all equipment, hairstyle, body/head ratio and detailed pixel clusters. Keep right-facing side/three-quarter belt-scrolling perspective throughout, like approved idle. Rich 16-bit/32-bit pixel-art, hard stepped contours, no blurred painting.
True RGBA transparent background, no backdrop, ground shadow, effects, labels or text. One character per cell, same physical scale in every cell. Equal grid cells with generous wholly transparent gutter and at least 15 percent empty margins around FULL body, hair and entire staff. Never crop any extremity. No attack. Do not put visible dividing lines.

FOUR-FRAME backward stepping LOOP in a strict 2 by 2 grid, reading top-left, top-right, bottom-left, bottom-right. SAME right-facing character, retreats toward the LEFT while eyes/head/staff stay toward RIGHT. This must be a distinct cautious backward walk, not a mirrored forward sheet. Frame 1 near leg reaches back/left toe then plants while front far foot stays right; frame 2 weight onto near leg, far leg gathers and passes under hip; frame 3 far leg reaches back/left and supports while near foot forward/right; frame 4 near leg gathers/passes under hip. Clear opposite left/right leg contact phases, knees bent slightly, shorter step, body slightly forward/right, staff upright right in guard. Smooth loop and connect to idle.
