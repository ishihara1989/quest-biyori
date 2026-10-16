# 呪術師 forward 8-frame revision


## 2026-10-06 再制作（L/R 固定・低い脚通過）

Method: built-in image_gen; transparent_background=true. Selected source: source/shaman-forward-generated-v9.png. Source v1-v8 are preserved; v5 retained same-leg errors, v6/v7/v8 each failed targeted phase checks and were not adopted. No anatomy was code-drawn, interpolated, mirrored or duplicated. Only generated-art cropping, nearest-neighbor resampling and QA background compositing were used.

Fixed identity: L=near bare brown thigh + white markings + gold/turquoise fittings; R=far dark-trouser thigh. L remains camera-near throughout. Full visual findings are recorded in QA.md and gait-review.json.

### Full prompt v5

Use case: identity-preserve.
Asset type: production transparent RPG pixel-art eight-frame locomotion spritesheet.
Image 1 is the old forward sheet for exact CHARACTER DESIGN and PIXEL STYLE only, its old leg poses are incorrect. Image 2 is approved idle design. Rebuild the gait with eight entirely newly posed illustrations. Same young female elf shaman, brown skin, amber eyes watching screen RIGHT, white face paint, long silver high ponytail tied with orange/gold band, teal feather earrings and gold hoops; dark brown cropped bodice, coral-orange and turquoise split skirt with gold geometric details, skull belt ornament, brown strapped boots. Same horned animal-skull wooden staff and teal hanging orb and red/teal feather charms on screen RIGHT, held by the same hand. Keep exact detailed pixel art, proportions, palette and outlines. No redesign.
Transparent alpha background, no visible grid, text, labels, floor or shadow. EXACTLY 8 full figures in 4 columns x 2 rows: row1 frames1,2,3,4; row2 frames5,6,7,8. Each cell same size and hip at same local x. All FULL equipment and hair inside cells with generous transparent margins and gutters.

CRITICAL ANATOMICAL IDENTITY: L is the camera-near LEFT leg with BARE BROWN THIGH + WHITE geometric skin paint + ornate GOLD/TURQUOISE knee/boot fittings. R is the camera-far RIGHT leg with DARK BROWN TROUSER covering its thigh and different plainer fittings. Never paint R with L's white markings. Never replace L with dark trousers. Camera and depth are FIXED for ALL frames: L remains closer to viewer, and L occludes R wherever they cross. Horizontal positions change during walking, depth NEVER swaps. Toes of BOTH boots point screen RIGHT for ALL frames, heels LEFT, even while moving backward or airborne. No mirrored boots, no frontal soles.

Natural 8-phase cycle on a treadmill, same stable hip location, tiny vertical bob, no sideways whole-body slide. Phase of L clearly goes right/front in1, middle in3, left/back in5, middle in7, right/front in8 to loop1. R has the inverse phase. Low foot clearance only, NO high knees, NO knee kick.
Frame1: white-painted L thigh slopes FORWARD toward screen RIGHT. L boot planted RIGHT of hip/front; DARK R slopes BACK LEFT, boot behind. Contact stride.
Frame2: L foot slides continuously BACK from front to just right of body center, supporting. R comes FORWARD from rear to just left of center, lifted just a little.
Frame3: TRUE CLOSE PASSING PHASE, feet nearly overlap horizontally under hip. L WHITE-PAINTED leg upright UNDER HIP supporting planted boot. DARK R ankle passes BEHIND that L ankle, lifted just 1 boot-sole height, shin near vertical. Only partial R boot visible behind L. Knees close together and low. DO NOT draw widely separated legs or lifted knee.
Frame4: WHITE L foot continues LEFT/back of hip with heel rising. DARK R foot passes forward RIGHT of hip, reaches low and almost plants. L remains camera-near even on screen LEFT.
Frame5: OPPOSITE CONTACT: WHITE-PAINTED L thigh MUST visibly slope BACK toward screen LEFT from hip; ornate L boot BEHIND LEFT of hip. DARK-TROUSER R thigh slopes FORWARD toward screen RIGHT, R boot planted ahead RIGHT of hip. This MUST differ from1. DO NOT put WHITE leg in front RIGHT here. Keep L closest to camera and R farther away.
Frame6: WHITE L comes forward from LEFT rear toward center, low lift; DARK R slides BACK from right front to just right of center, supports.
Frame7: TRUE CLOSE PASSING PHASE, feet overlap horizontally under hip. DARK R leg upright supporting under hip and is mostly occluded by the WHITE L leg swinging IN FRONT of it. WHITE L leg passes UNDER HIP with only slight knee flex and ankle 1 boot-sole height raised. Visible white shin/thigh has coherent gold/turquoise fittings. No high knee, no widely open legs.
Frame8: WHITE L extends toward RIGHT/front preparing landing very close to1, ankle lifted a tiny amount. DARK R trails LEFT/back with heel beginning lift. Frame8->1 changes only settling onto front boot and tiny skirt/hair response. Do not swap anatomical leg paint, equipment or occlusion at the seam.
Keep coherent cloth/hair/feather follow-through and stable torso/head/staff. Eight genuine different poses, not repetition or copied half cycles.
Motion: FORWARD WALK toward screen RIGHT, free hand relaxed beside torso, original staff upright ahead right. Comfortable moderate short stride. All feet and face oriented RIGHT throughout.

### Full prompt v6

Use case: identity-preserve. Create a NEW EIGHT-POSE forward walking cycle sheet of the EXACT shaman in this approved idle character reference. Reference is design only, NOT pose sequence. 4 columns × 2 rows, transparent background. True pixel art, same head, face, silver ponytail, brown skin, orange/turquoise tribal skirt and all golden accessories, same skull-topped staff ahead screen RIGHT in same hand. Full body and all staff/hair inside every cell with generous empty margins, no crop, text, grid, ground or shadow. Every figure faces RIGHT, same size and hip x, subtle bob only.
The exposed brown thigh with WHITE PAINT and ornate GOLD/TEAL boot ornaments is LEFT LEG L; it is ALWAYS camera-near. The DARK CLOTH covered leg is RIGHT LEG R; ALWAYS camera-far. The exposed/painted leg occludes dark leg when they overlap. Do NOT swap their identity, design, or depth! Both boot toes extend RIGHT, heels LEFT.
You must generate an alternating gait, not variations of idle. Focus on horizontally moving each foot continuously through the phase table:
top row:
1 L WHITE LEG extends diagonally down-right into FRONT RIGHT boot touching ground. R DARK LEG diagonally down-left into REAR LEFT boot.
2 L boot slightly right of hip, R boot slightly left, R rising very little.
3 LOW CROSSING: L white leg straight under hip with boot planted at CENTER. R dark shin close behind L, lifted dark ankle also at CENTER; mostly hidden behind L. No wide stance, no high knee.
4 L WHITE LEG slopes diagonally BACK LEFT, its boot is LEFT of hip. R DARK LEG slopes FORWARD RIGHT with dark boot RIGHT almost landing.
bottom row:
5 OPPOSITE CONTACT FROM 1: L WHITE THIGH very clearly slopes diagonally down-LEFT toward REAR LEFT boot; R DARK THIGH very clearly slopes diagonally down-RIGHT toward FRONT RIGHT boot. The white-painted thigh is visibly at screen LEFT of the dark thigh. The decorated gold/teal L boot is the LEFTMOST boot. Dark trouser R boot is RIGHTMOST. L stays closer to camera! This exact pose is required.
6 L white ankle moves toward center from left lifted a little; R dark planted ankle moves toward center from right.
7 LOW CROSSING: R dark leg planted CENTER under hip. L WHITE leg passes immediately in front of it, decorated ankle CENTER just above floor, not a raised knee kick. White leg hides dark leg, clear tight overlap.
8 L WHITE leg reaches FRONT RIGHT before landing very close to pose1. R DARK leg goes REAR LEFT. Transition 8 to1 only sets down L front boot; positions nearly identical.
1→3→5→7→1 forms a FULL TWO-LEG cycle, with exact opposite contact pose5 and true close passing3/7. Hip stable, shoulders steady, staff vertical, relaxed free hand. Walking in place toward right, no translation. Clothing can move naturally to expose white L thigh reaching left in4/5/6. Eight independently drawn poses and natural smooth loop.

### Full prompt v7

Use case: precise-object-edit. Image1 is an eight-pose FORWARD WALK sheet edit target. Keep exact character identity, pixel style, RIGHT-facing camera, all staff/face/hair/clothing, 4x2 arrangement, anatomical identity and positions of frames1,2,3,5,6,8, with only these precise corrections:
1. TOP ROW FOURTH FRAME (frame4) has WRONG LEG PHASE. Repose its LOWER BODY so the WHITE-PAINTED BARE THIGH L slopes BACKWARD LEFT from the hip into its ornate gold/teal boot on the LEFT side behind hip. DARK-TROUSER R slopes FORWARD RIGHT into dark boot on the RIGHT side ahead hip about to land. White L stays the camera-near leg and dark R stays the camera-far leg, as in frame5 directly below first column. Frame4 should be a PRE-LANDING version of frame5's opposite-leg contact, with shorter stride and R foot very low. You MUST move WHITE leg to LEFT, not leave it on RIGHT.
2. BOTTOM ROW THIRD FRAME (frame7) keep LOW close ankle passing under hip: WHITE L leg in front, dark R planted behind it. Return FREE ARM from this frame's straight hanging at center to SAME relaxed bent-back arm on LEFT of torso as every other frame. Preserve tiny low foot lift, no knee kick.
3. Frame1 WHITE front boot is planted level on common ground baseline; frame8 WHITE front boot low preparing landing into1. All boot toes face RIGHT (heelLEFT). Never swap marks/fittings/depth. All other anatomical poses and identity stay same.
4. Add GENEROUS TRUE TRANSPARENT horizontal margins around FOURTH COLUMN and widen canvas so FULL STAFF orb/horns/feathers is entirely visible in both last-column figures. Shift figures as needed to achieve EQUAL FOUR COLUMNS with SAME HIP x relative to each cell. Prefer a wider 2048x1024 landscape canvas, 4x2 cells. Full figure, hair and entire staff have empty gutters and never touch a cell/canvas edge.
Eight poses in same row-major chronological order. Keep stable head/hip height and staff hand. No background color, checkerboard, floor, text, labels or shadow. Genuine alpha transparency. Do not turn camera or redraw new equipment.

### Full prompt v8

Use case: precise-object-edit. Edit ONLY the lower legs in TOP ROW THIRD CELL (frame3) of this eight-pose sheet. Keep ALL other seven poses pixel-identical in composition and design, including correct opposite contact frame5 and passing frame7. Preserve true alpha, 4x2 order, staff, hip, face, hair, skirt, width, scale, full transparent gutters.
Frame3 needs a true LOW UNDER-HIP CROSSING: WHITE-PAINTED bare LEFT leg L remains camera-near and supports, its decorated gold/turquoise boot planted immediately UNDER HIP CENTER (move ankle slightly LEFT if necessary). DARK-TROUSER RIGHT leg R is camera-far and passes BEHIND L, its dark ankle horizontally ALIGNED at almost same x as L ankle, not behind-left. Move R shin/ankle rightward so WHITE L calf/boot visually OCCLUDES most of dark R boot. Show a small dark heel/toe peeking from behind WHITE L boot and lifted only ONE SOLE height above ground. Both knees close under pelvis, not high raised knee; both toes point RIGHT. IMPORTANT: no open two-foot stance in frame3, ankles overlap horizontally and L hides R. Preserve white thigh markings and decorated L boot, never give them to R.
Also frame1 is LEFT-white foot FRONT contact, frame5 LEFT-white foot REAR contact. Preserve those. Same right-facing camera and exact character. No labels, background, shadow, checkerboard or extra objects.

### Full prompt v9

Use case: precise-object-edit. This 4x2 sheet is almost correct. Edit ONLY the lower legs of BOTTOM ROW THIRD CELL (frame7). Preserve ALL other seven cell poses and all body/staff/hair/face/arm/design arrangements. Pixel art, transparent alpha, complete margins, no text.
Frame7 currently incorrectly repeats frame3 (white leg planted, dark leg raised). Frame7 MUST have the OPPOSITE supporting leg:
DARK-TROUSER RIGHT leg R is the planted SUPPORT. Put its dark boot flat on the LOWEST common ground baseline directly UNDER HIP (center x). Let its dark shin remain vertical, partly hidden.
WHITE-PAINTED bare LEFT leg L is the SWINGING camera-near leg passing IN FRONT of R. Lift its ornate gold/turquoise boot just ONE BOOT-SOLE HEIGHT above the floor, directly at almost SAME x as dark planted ankle (slightly right). Its knee is gently bent but stays LOW near body center, not high. WHITE thigh/white paint and gold/turquoise decorated boot belong to this L leg. L occludes the upper part of planted DARK R boot; show dark planted R boot extending visibly LOWER to baseline behind the raised WHITE L boot. White ornate foot is raised, dark plain foot below it is grounded. Both toes point RIGHT. Only two legs, no new limbs. Do not exchange garments.
This is true low passing with CLOSE overlapping ankles. Keep stable hip and same upper pose. Frame6 white swing comes from rear LEFT and frame8 reaches frontRIGHT; frame7 white ankle under hip bridges them. Frame3 (top row third) remains WHITE support/dark swing, distinct inverse from7. No change to other cells.


## Archived prior revision notes

Method: built-in image_gen; transparent_background: true.
References: ../../idle-01.png and ../../source/shaman-idle-generated-v1.png.
Selected source: source/shaman-forward-generated-v4.png. Previous drafts are preserved beside it.

## New full prompt

Use case: identity-preserve.
Asset type: transparent production pixel-art animation spritesheet for an existing RPG character.
Input image 1 is the approved shaman idle sprite, input image 2 is its high-resolution design sheet. These are DESIGN and STYLE REFERENCES only. Create a NEW FORWARD WALK animation, exactly EIGHT DISTINCT full-body poses in a clean 4 columns by 2 rows grid, frame order left-to-right top row 1-4 then bottom row 5-8. Transparent RGBA background, no checkerboard, text, labels, border, floor, shadow, or extra character.

Identity invariants in EVERY frame: same chibi young female elf shaman, warm brown skin, amber eyes looking right, pointed ears, white cheek marking, long silver high ponytail flowing left, gold earrings and turquoise feathers, dark brown crop top with gold/beaded trim, turquoise and coral red/orange skirt panels with original gold geometrical motifs, turquoise/gold belt and small side skull ornament, same brown ankle boots with gold trim and exposed toe straps. Same horned animal skull wooden staff with turquoise skull rune, turquoise orb hanging on its RIGHT side, red and teal feather decorations. Staff ALWAYS in the same original hand, ahead on SCREEN RIGHT, other hand free at screen-left side; do not switch hands, mirror, rotate skull or rearrange jewelry. Match approved proportions, face, palette, crunchy pixel-art outlines and shading exactly. Keep clothing and equipment topology constant.

Movement: side-view three-quarter facing SCREEN RIGHT for all eight frames, walk in place representing progression toward right. The face, shoulders, hips and ALL BOOTS remain oriented RIGHT. Both boot silhouettes must have heel toward LEFT and extended toes toward RIGHT in ALL frames, even when lifted. Do not mirror feet, show backwards toes, show shoe soles frontally, or turn toward camera.
Anatomical leg identity must stay fixed: the NEAR/camera-side leg is brighter with the original thigh marking and crisp outline, the FAR leg is darker and partly occluded. The second half MUST be the opposite leg phase, NOT repeated first-half poses. Both knees bend FORWARD/right anatomically.

Eight continuous gait phases, explicit leg positions relative to the stable HIP:
1 NEAR leg contacts ground ahead/right; FAR leg supports behind/left, broad comfortable stride.
2 NEAR foot bears weight ahead/right as hip settles slightly; FAR heel lifts and begins trailing push.
3 NEAR foot moves under hip as support; FAR leg passes under hip, FAR knee bent forward/right, FAR boot lifted.
4 NEAR support trails behind/left as FAR leg swings ahead/right and prepares landing, body slightly rises.
5 FAR leg contacts ahead/right; NEAR leg supports behind/left: opposite-leg counterpart of frame 1, visibly different occlusion.
6 FAR foot bears weight ahead/right as hip settles; NEAR heel lifts and trails.
7 FAR foot under hip supports; NEAR leg passes beneath hip with NEAR knee forward/right and NEAR boot lifted.
8 FAR support trails behind/left; NEAR leg swings ahead/right about to touch down, transitioning smoothly to frame 1.
Keep body bounce subtle, hand gripping staff stable, staff tilt only a few degrees; ponytail, skirt and feathers follow a coherent slight delayed sway. No jumping, attack, huge swing, sudden stance change or duplicate pose.

Composition: 4x2 evenly spaced grid, each figure SAME scale, same hip horizontal position relative to its cell, common planted foot baseline per row, full ponytail and skull staff and boot visible, VERY WIDE entirely transparent gutters between figures and rows. All eight silhouettes strictly fit their own cell with no touching neighboring cell boundaries. Prefer landscape canvas suitable for 4x2 figures. Eight poses must be clearly distinguishable and form a seamless frame8-to-frame1 loop.

## Targeted leg correction v4 (full prompt)

Use case: precise-object-edit. Image 1 is the EIGHT-FRAME FORWARD WALK SPRITESHEET EDIT TARGET. Image 2 approved idle is identity reference. Keep exact same eight characters, staff hand, silver ponytail, costume, rendering, skin and 4x2 grid. Change ONLY leg gait and the skirt immediately around legs to make a CORRECT ALTERNATING EIGHT-PHASE FULL WALK LOOP. Every toe must extend RIGHT from heel. Preserve true transparent background. Improve outer margins: shift fourth-column figure a little LEFT to fit entire staff with visible transparent margin; do not crop.

This correction is essential: the near leg is the BARE brown thigh with WHITE PAINT; far leg has DARK BROWN COVERED TROUSERS. These identities must NEVER switch or duplicate. Frame order 1-4 top, 5-8 bottom. Relative to each hip, place these two feet EXACTLY as this phase table:
F1 near BARE leg foot RIGHT/front planted; far DARK leg foot LEFT/back planted. Bare thigh slopes right to near boot.
F2 near BARE boot just RIGHT of hip planted; far DARK boot LEFT of hip with heel lifting. Near leg bearing weight.
F3 near BARE boot under hip planted; far DARK boot lifted under hip, far knee bends forward RIGHT. Near leg bearing weight.
F4 near BARE boot LEFT/back planted; far DARK boot RIGHT/front lifted preparing contact. BARE thigh must now slope LEFT/back.
F5 near BARE leg foot LEFT/back planted; far DARK foot RIGHT/front planted. This is OPPOSITE contact from F1. BARE thigh visibly slopes left into left boot. DO NOT put bare leg in front at right.
F6 near BARE boot LEFT of hip with heel lifting; far DARK boot just RIGHT of hip planted.
F7 near BARE boot lifted under hip with bare knee forward/right; far DARK boot under hip planted.
F8 near BARE boot RIGHT/front lifted preparing contact; far DARK boot LEFT/back planted.
Near leg rendered IN FRONT when crossing far leg; never repaint which thigh is bare. Both boot heels LEFT and toe extensions RIGHT, lifted boots still point right. The 8 poses must show a smooth progression of these EXACT spatial phases, not eight variations of one step. Stable hips with modest bob, no sideways torso movement, no turn, no new design, no extra limbs. No text or labels. Top/bottom rows same physical character size.

## Current QA status

Eight independently generated poses, 4x2 source grid, selected after targeted leg corrections. No duplicated frames, interpolated poses, or code-painted anatomy. Shared nearest-neighbor builder only crops/resizes the generated art.

QA: reviewed selected high-resolution source and final 2048x224 spritesheet visually. Kept silver ponytail, brown skin, staff hand/skull/orb, costume topology, and near bare/marked thigh versus far covered leg. Backward guard holds the free hand across chest while watching right; passing frame3 uses the far leg and frame7 uses the near leg, and frame5 is the opposite contact. Fixed hip anchors avoid foot-bounds-induced lateral jitter; all planted baseline y=207. Each motion has 8 unique frames and an infinite preview GIF (forward 80ms x8 = 640ms, backward 90ms x8 = 720ms).

Verification: node tools/assets/build-motion.cjs shaman forward; node tools/assets/build-motion-preview.cjs shaman forward; node tools/assets/check-motion-assets.cjs shaman. All pass alpha, margins, unique-frame hashes, packing, pivot, timings, loop and source/prompt checks.

## Previous four-frame prompt (archived)


## Targeted revision v2

Use case: precise-object-edit. Edit this four-frame pixel-art sprite sheet (image 1). Image 2 is approved idle identity/style. Preserve the exact shaman, silver high ponytail, brown skin, pointed ears, tribal teal-orange skirt, skull staff, rendering, RGBA transparency, full-body scale, grid and the two upper frames. Change ONLY the leg stride in the LOWER TWO CELLS to complete the opposite half of a walking cycle.

TOP LEFT pose (unchanged) shows the visible near leg with bare brown thigh and white body paint extended toward RIGHT/front, while the farther covered/dark leg is back/LEFT. TOP RIGHT passing pose is unchanged.
BOTTOM LEFT MUST be the opposite contact: the near bare thigh leg extends backward toward LEFT with its boot planted LEFT behind the hip; the farther dark trouser leg extends FORWARD toward RIGHT and has its boot planted RIGHT in front. You must clearly see the white painted near thigh and near boot on LEFT of the farther leg, instead of repeating the upper-left near leg forward pose. Skirt may move slightly only where necessary to reveal the opposite legs.
BOTTOM RIGHT opposite passing: farther dark leg supports under the hip, near bare thigh leg lifts with a bent knee swinging forward toward RIGHT, lifted near boot on RIGHT side. This contrasts TOP RIGHT where near foot supports and far leg passes back.
Maintain torso and head positions, staff at front RIGHT, no facing reversal, no repeated same-leg cycle. Character remains RIGHT facing in all four cells, one physical scale, entire skull staff and ponytail within transparent cell margins. No text, effects, shadows, background or extra sprites.

Revision reference 1: source/shaman-forward-generated-v1.png.
Revision reference 2: ../../source/shaman-idle-generated-v1.png.

Method: built-in image_gen; transparent_background: true.

Reference 1: ../../source/shaman-idle-generated-v1.png (approved pixel-art identity/style).
Reference 2: ../../../references/shaman-original.png (costume design).

## Prompt

+Use case: stylized-concept. Asset type: transparent pixel-art RPG animation sprite sheet.
Input image 1 is the approved pixel-art idle sheet and is the authoritative identity, proportions, rendering and palette reference. Input image 2 is supporting character costume reference only. Create this exact SAME female shaman: warm brown skin, pointed ears, amber eyes, white cheek paint, enormous silver-white high ponytail with orange tie and feather earrings; teal and orange layered tribal skirt, black cropped bodice, brown boots, golden bone/skull jewelry; gnarled brown skull-topped staff with turquoise hanging orb and feathers in the front/right hand. Preserve all equipment, hairstyle, body/head ratio and detailed pixel clusters. Keep right-facing side/three-quarter belt-scrolling perspective throughout, like approved idle. Rich 16-bit/32-bit pixel-art, hard stepped contours, no blurred painting.
True RGBA transparent background, no backdrop, ground shadow, effects, labels or text. One character per cell, same physical scale in every cell. Equal grid cells with generous wholly transparent gutter and at least 15 percent empty margins around FULL body, hair and entire staff. Never crop any extremity. No attack. Do not put visible dividing lines.

FOUR-FRAME forward walking LOOP in a strict 2 by 2 grid, reading top-left, top-right, bottom-left, bottom-right. Remain facing right and walk toward the right. Clear leg alternation: frame 1 near leg planted forward/right with far leg behind/left; frame 2 far leg passes under hip while near leg supports, bent passing knee; frame 3 far leg planted forward/right and near leg behind/left, opposite contact from frame 1; frame 4 near leg passes under hip while far leg supports. Make the two opposite contacts visibly different, not four identical feet. Relaxed short stride compatible with idle, upper body steady, keep staff near vertical on front/right side without casting. Hands/staff angle close to idle. Slight skirt, feather and ponytail sway.
