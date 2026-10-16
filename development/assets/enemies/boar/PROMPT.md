# Boar image generation and edits

Mode: built-in image_gen. All game artwork was generated or edited with this tool.
Transparent background: true for every image request.

Final adopted artwork:
- Idle: source/boar-idle-generated-v1.png
- Move: source/boar-move-01-03-refined-color-v1.png and source/boar-move-04-06-refined-color-v1.png
- Charge: source/boar-attack-refined-v1.png (frame 2 from generated-v5; frames 1, 3 and 4 from generated-v4)
- Hit: source/boar-hit-generated-v2.png
- Down: source/boar-down-generated-v2.png

Movement was initially generated in two groups of three frames. Frames 2–5 were subsequently edited individually to make hindleg movement visible. Cropping, nearest-neighbor registration and concatenation produced the two refined strips; the final three-frame palette edits preserve those poses. Move frame 1 and hit frame 4 reuse the approved idle frame 1 for exact neutral continuity.

References: idle-reference is a mechanical crop of idle v1; upper-body and head references are further crops. Pose-guide PNGs are schematic limb constraints only and never used as final sprites. Single-frame references are mechanical crops of the approved walk strips. Full call prompts, including discarded iterations, follow in chronological order.

## 01 — boarIdlePrompt

```text
Use case: stylized-concept
Asset type: pixel-art game enemy idle animation sprite sheet.
Primary request: Create a LEFT-facing quadrupedal wild-boar monster, exactly FOUR sequential idle frames, in a strict 2 columns by 2 rows layout. Refer to the supplied warrior image ONLY for the hand-pixelled JRPG sprite style, pixel density and outline/shading quality; the character must be a boar, not a humanoid.
Subject: stout muscular wild boar, warm dark brown bristly fur, compact raised bristle ridge, large ivory curved tusks, pointed ears, short tail and dark cloven hooves. Four anatomically connected legs. No equipment, no accessories.
Camera: fixed slightly elevated three-quarter side view looking at its LEFT flank as it faces screen LEFT; the anatomical LEFT legs are the nearer legs and the anatomical RIGHT legs are farther away. Show enough perspective to separate near and far hooves. Keep this same orientation in all four frames; never mirror it.
Idle stance invariant: anatomical RIGHT foreleg (far/darker) is forward toward screen LEFT; anatomical LEFT foreleg (near/brighter) is behind toward screen RIGHT. The hind legs have the opposite offsets, so four feet are readable and naturally balanced. Near legs are drawn in front and their ground line is slightly lower; far legs are partially occluded, darker and shorter in projection. Do not confuse foreleg vs hindleg with left vs right.
Sequence reading top-left, top-right, bottom-left, bottom-right:
1: neutral alert stance, RIGHT far forefoot forward, LEFT near forefoot back; open eye.
2: gentle inhale raises chest/bristle ridge a little, feet stay planted in exactly the same places.
3: exhale to lower chest a little, small ear/tail follow-through, feet stay planted.
4: return smoothly near frame 1 neutral breath; right forefoot still forward, left forefoot back. Frame 4 to 1 must loop gently.
Composition: one full boar per equal cell, identical body scale, identical screen position and grounded foot baseline in every cell; generous transparent margins around all anatomy. Exactly 4 poses and no extra sprite.
Style/medium: actual crisp discrete pixel art with flat pixel clusters and limited JRPG palette; use roughly 180x125 logical-pixel character silhouette enlarged by exact nearest-neighbor for the large sheet. Clean stepped edges, dark outline, directional shading. No smooth painting, no antialiasing, no blur, no 3D render.
Background: real alpha transparency. No floor, no contact shadow, no scenery, no checkerboard drawn into the pixels. No labels, numbers, text, grid lines or watermark.
Output requested: 1024x1024 PNG, exact 2x2 equal cells, each cell 512x512.
```

## 02 — boarWalkAPrompt

```text
Use case: stylized-concept
Asset type: game pixel-art quadruped walking sprite sheet, FIRST HALF of a six-frame cycle.
Input image: the exact approved wild boar idle pose. Preserve this SAME character, anatomy, tusks, eye, ear, mane, fur palette, body proportions, outline, pixel density, and fixed three-quarter LEFT-facing camera.
Primary request: exactly THREE walking frames side by side in ONE ROW, equal-width cells, sequence 1,2,3 from left to right. Never generate all six frames here.
Leg identities remain fixed: anatomical LEFT foreleg and LEFT hindleg are nearer camera, lighter, visible in front and touch the lower ground line. Anatomical RIGHT foreleg and RIGHT hindleg are farther away, darker, slightly shorter in projection, touch the higher ground line and are occluded by the near legs during crossing. Screen LEFT is forward for BOTH sides. Do not mirror the boar or switch near/far identities.
This is a grounded gentle walking/trotting motion with alternating forelegs; NOT a leap or charge.
Frame 1 = right-side-forward contact, match input idle pose: far RIGHT forehoof forward at screen-left relative to its shoulder; near LEFT forehoof back at screen-right relative to its shoulder. Near LEFT hindhoof is forward relative to hip, far RIGHT hindhoof back.
Frame 2 = passing/weight transfer: far RIGHT foreleg supports and moves toward directly below chest; near LEFT forehoof lifts only slightly and passes forward beneath shoulder toward screen-left. The near LEFT foreleg occludes the far RIGHT foreleg when they cross; retain both distinct leg roots. Near LEFT hindleg trails while far RIGHT hindhoof lifts and advances. Short low natural arcs.
Frame 3 = approaching left-side-forward contact: near LEFT forehoof extended toward screen-left, just above its lower ground line, about to plant. Far RIGHT foreleg trails toward screen-right. Far RIGHT hindhoof advances toward screen-left; near LEFT hindleg trails toward screen-right. Four anatomically attached legs, no extra feet, no fused/knotted legs.
Keep trunk centered in each cell and body scale constant; only subtle vertical body bob, virtually no head/mane change. All poses fit completely with generous transparent gutters. The following frame 4, generated separately, will finish planting the near LEFT forefoot; frame 3 must visibly lead into it.
Style: crisp hand-pixelled JRPG pixel clusters matching reference, hard stepped edges, flat clustered shading, no smooth illustration, no antialiasing or blur.
Background: actual alpha transparency, no drawn checkerboard, no floor, no shadows, no speed trails, no effects, no text, no grid lines.
Output: landscape 1536x1024 PNG, exactly 3 equally spaced characters in one horizontal row with identical ground baseline and ample padding; no other characters.
```

## 03 — boarWalkBPrompt

```text
Use case: stylized-concept
Asset type: quadruped JRPG enemy walking animation sprite sheet, SECOND HALF of a six-frame cycle.
Input images: Image 1 = approved idle boar, exact character design. Image 2 = existing walk frames 1,2,3 in a horizontal row, exact style, scale and camera continuity reference. Generate ONLY the NEXT THREE frames, 4,5,6 from left to right. Do not repeat the first half. Exactly three boars in one row.
Preserve the same fixed three-quarter LEFT-facing view, tusks, ear, mane, compact trunk, warm brown pixel palette, dark hooves, fur clusters and logical pixel density. No mirroring, no changes to camera.
Leg identities fixed forever: anatomical LEFT legs = nearer/lighter/frontmost layer, anatomical RIGHT legs = farther/darker/partly occluded layer. Near left feet touch lower ground line; far right feet touch higher line. Screen LEFT is forward.
Frame 4: LEFT near foreleg fully extended screen-left and PLANTED, at the position approached by frame 3 of image 2. RIGHT far foreleg trails screen-right. Near LEFT hindleg trails behind hip while far RIGHT hindleg is forward; finish the preceding contact without a torso jump.
Frame 5: reverse passing pose. LEFT near foreleg supports body and goes beneath chest; RIGHT far forehoof lifts slightly and advances screen-left BEHIND the near foreleg, partly occluded during the crossing. Near LEFT hindhoof lifts/advances from screen-right toward beneath hip; far RIGHT hindleg extends backward toward screen-right. Both hind legs must visibly move, connected to the correct hip, never become extra forelegs.
Frame 6: RIGHT far forehoof extends screen-left and is just above its higher ground line, ready to PLANT into frame 1 of image 2 and input idle; LEFT near foreleg is behind screen-right. Near LEFT hindhoof is now further forward beneath hip, while far RIGHT hindleg trails. Keep appropriate perspective and occlusion; the near feet are brighter, lower and drawn over far legs.
Frame 6→1 closes the cycle with a small contact step. Four legs total, small natural low stepping arcs, no broad leaping. Distinct phase in every frame.
Composition: exact same boar scale as image 2, full sprite with all toes and tusks inside its equal cell, same torso center registration and ground baseline; ample transparent gutters. A horizontal 1536x1024 image with 3 equal 512x1024 cells and exactly one boar per cell.
Style: crisp genuine pixel art, hard stepped contours, clustered JRPG shading, no painterly blur, no smooth vector shapes.
Actual transparent alpha background; no ground, no shadow, no colored haze, no drawn checkerboard, no labels, numbers, lines, text or watermark.
```

## 04 — boarChargePrompt

```text
Use case: stylized-concept
Asset type: pixel-art game enemy CHARGE ATTACK, four-frame seamless bounding loop.
Input image is the exact approved wild-boar monster. Keep this character, fur, face, tusks, mane, ear, tail, palette, proportions and crisp pixel style. Fixed three-quarter side view, facing screen LEFT throughout, anatomical left flank nearer camera.
Primary request: EXACTLY FOUR distinct sequential sprites in a strict equal 2x2 sheet, top-left, top-right, bottom-left, bottom-right. A low aggressive charge with head and tusks lowered and trunk angled forward. This is the repeatable charging gait, not a one-off windup and recovery.
Critical gait: the two LEFT/RIGHT HIND FEET KICK THE GROUND AT THE SAME TIME; no alternating left-right stride. Left and right forelegs also move as a synchronized pair. Near/far legs differ ONLY in perspective/occlusion/shading, never in animation phase. Paired hooves remain separately readable at slightly different perspective depth. Four legs total, no extra limbs.
1: low compress/ground contact, both hindlegs simultaneously folded under pelvis, both forelegs together bracing beneath lowered shoulders, ready to push.
2: simultaneous powerful push-off, BOTH hindlegs extend backward toward screen RIGHT at the same time, BOTH forelegs reach forward toward screen LEFT at the same time, body slightly higher, head stays low. No single-leg support.
3: short airborne bound, both hindlegs tucked forward under rear belly and both forelegs folded together under front chest, all four feet off ground, trunk elongated forward; keep silhouette compact and anatomically connected.
4: simultaneous paired landing and compression, both forehooves land together, both hindfeet arrive together beneath pelvis, body low and compresses into the next frame 1. Do not return to tall idle at frame 4. Frame 4→1 must loop continuously without stopping.
Layout: full boar in each equal cell, fixed body scale and center, common virtual ground baseline with intentional small height changes in the leap. Large transparent margins around tusks, stretched legs and tail. No horizontal travel baked into cells; game code moves the sprite root during charge.
Actual discrete JRPG pixel art like reference: hard stepped edges, clusters of pixels, flat clustered highlights, dark outline, no blur, no painting, no antialiasing.
Real alpha-transparent background; no scenery, ground, floor, contact shadows, speed lines, smoke, dust, particles, damage flash, text, labels, grid or watermark.
Output: 1024x1024 PNG, exactly 2 columns x 2 rows, four distinct frames.
```

## 05 — boarHitPrompt

```text
Use case: stylized-concept
Asset type: left-facing wild-boar enemy hit reaction, exactly FOUR frames.
Input image = exact approved idle character and its neutral stance. Preserve design, identity, proportions, fur palette, mane/tusks, camera, pixel density and four-leg anatomy. Anatomical left legs stay near/lighter, right legs stay far/darker, fixed three-quarter left-facing view.
Strict 2x2 grid, reading top-left to top-right then bottom-left to bottom-right:
1: receives a blow from screen-left, snout/chest jerk back slightly toward screen-right, eye squints, forefeet brace and elbows bend; four legs remain connected.
2: maximum recoil, head lifts/backward toward screen-right, mane follows through, chest leaning right, hindlegs absorb weight with flexed knees; keep body rooted, no huge leap.
3: regains balance, head comes down to usual angle and torso re-centers, weight shifts from hindfeet to forefeet, four hooves return toward original planted stance.
4: settled alert neutral pose, exactly the same right-far-forefoot-forward / left-near-forefoot-back stance as input, matching idle frame for smooth return. Right forehoof (darker/far) extends toward screen LEFT; left forehoof (brighter/near) trails toward screen RIGHT. Do not swap the leg depth.
No damage effects, blood, particles, symbols, stars, impact flashes or body color-flashes; just the physical recoil. No mirroring. Full sprite inside each equal cell, same size and ground baseline, ample gutters and margins.
Crisp actual pixel art like input, stepped outlines and flat clustered shading; no blur/antialiasing/painterly detail.
Real alpha-transparent background, no shadow, floor, drawn checkerboard, colored haze, text, frame numbers, grid lines or watermark.
Output: 1024x1024 PNG, four distinct poses in exact 2 columns x 2 rows.
```

## 06 — boarDownPrompt

```text
Use case: stylized-concept
Asset type: left-facing quadruped wild-boar monster defeat/death animation, exactly FOUR frames, NON-LOOPING.
Input image = approved neutral boar. Preserve exact fur color, bristle mane, tusks, snout, eye/ear proportions, pixel-art rendering and four-leg identity. Fixed slightly elevated LEFT-facing three-quarter side camera, near anatomical left flank, no camera rotation and no mirroring.
Strict equal 2x2 sprite sheet, temporal order top-left, top-right, bottom-left, bottom-right:
1: losing strength, head drops, eyes squint closed, BOTH foreknees start to buckle under chest; hindquarters remain partly standing. All four legs attached.
2: chest and snout sink close to the ground, forelegs fold beneath body, hindlegs crouch; large clear downward motion, same character and camera.
3: body tips naturally onto its near LEFT side, shoulder and flank contact ground, head lies left with tusks visible, legs fold/slacken to the right of the chest and pelvis; no detached legs, no twisted skeleton.
4: completely settled defeated body lying on its LEFT side, eye fully closed, head/snout pointing LEFT, all four hooves relaxed and correctly attached, mane silhouette low and stable, same solid brown fur and ivory tusks. This is the persistent last pose held on screen. Slight settle from frame 3; do not dissolve or disappear, do not stand back up.
Full uncut sprite in each equal cell, constant body scale despite rotation, common ground baseline and torso-centered registration, generous margins including the wider prone silhouette. No blood, wounds, bones, spirits, symbols, particles or gore; physical collapse only.
Real hand-pixelled JRPG sprite style: hard stepped contours, small pixel clusters, limited clustered shadows/highlights, dark outline, no antialiasing, blur or painterly shading.
Real transparent alpha background, no floor, shadow, scenery, colored haze, checkerboard painted into image, labels, text, cell borders or watermark.
Output: 1024x1024 PNG, exactly 4 distinct complete sprites in 2 columns x 2 rows.
```

## 07 — boarWalkA2Prompt

```text
Use case: stylized-concept
Asset type: production-ready wild-boar quadruped WALK sprite sheet, only frames 1–3 of six.
References: Image 1 exact idle monster design. Image 2 previous first-three walking poses; preserve character and foreground foreleg poses, improve frame spacing and make ALL FOUR LEGS take real steps.
Output is a 1536x1024 transparent sheet containing exactly THREE equally sized 512x1024 cells in ONE ROW. Each boar MUST fit within its own cell's local x=64..448, y=360..660, leaving at least 64 transparent pixels at BOTH left/right edges of EVERY cell. No anatomy may cross a cell boundary. Trunk center and virtual ground baseline identical among cells. Reduce sprite size to respect these substantial empty margins, but preserve crisp pixel clusters; no blur. Exactly three sprites.
Keep fixed three-quarter view facing screen LEFT, anatomical LEFT legs nearer/brighter and occluding the anatomical RIGHT legs farther/darker. Do not swap legs or mirror. RIGHT foreleg is the dark far leg; LEFT foreleg is the light near leg. Same head, mane, tusks, fur clusters, size and palette.
1: exact reference idle stance. Far RIGHT forehoof extends forward toward screen LEFT; near LEFT forehoof trails screen RIGHT. Right far hindhoof is in front of the nearer hindhoof at the hip. All four feet grounded.
2: near LEFT forehoof lifts just slightly and passes forward toward screen LEFT beneath shoulder; far RIGHT foreleg supports and moves back beneath chest, behind the near leg at crossing. Near LEFT HIND HOOF ALSO clearly moves forward from its trailing position and lifts beneath the pelvis; far RIGHT hindfoot supports and moves back. Show visible change in hind knees and hoof X position rather than freeze the rear legs.
3: near LEFT forehoof stretches forward screen LEFT, hovering just above the near/lower ground line, about to plant; far RIGHT foreleg trails screen RIGHT. Near LEFT hindhoof also advances toward the FRONT of its hip, hovering above the lower line, while dark far RIGHT hindleg trails behind its hip. Left front leg and left rear leg are anatomically distinct and attached to their own shoulder/hip; four total legs. Next frame 4 will finish left-side contact.
Short natural low stepping arcs, compact stance, minimal body bob, no leaping or charge. Near feet slightly lower in projection than far feet; near legs always in front at crossings. Each frame must be a different gait phase.
Crisp genuine JRPG pixel art matching input, stepped outlines, flat clustered shading, dark outlines. No smooth painting, blur, antialiasing, or vector style. Real alpha transparency; no background haze, shadow, ground, checkerboard, text, labels, numbers, grid, effects or extra sprites.
MAIN PRIORITY: big transparent gutters around each complete sprite AND real forward movement of the near LEFT hindhoof in frames 2 and 3.
```

## 08 — boarWalkB2Prompt

```text
Use case: stylized-concept
Asset type: wild-boar game enemy WALK sprite sheet, exactly the LAST THREE FRAMES 4,5,6 of a six-frame cycle.
Input 1 is exact idle boar design. Input 2 is the corrected first three walk frames; match this art, pixel density, small sprite size and camera.
Produce only THREE complete boars side by side, exact 1536x1024 image, three equal 512x1024 cells. Each sprite must stay within local x=24..488 and y=300..740 of its cell, with at least 24 pixels of transparent margin to both column boundaries, no overlapping adjacent frame anatomy. Match the body scale in image 2, fixed torso center and virtual ground plane, with subtle bob only.
LEFT-facing three-quarter side view. Anatomical LEFT foreleg and LEFT hindleg are the nearer bright legs and always occlude the darker far anatomical RIGHT legs. Depth never swaps and camera never mirrors. Screen LEFT is forward.
4: LEFT NEAR FOREHOOF extended screen-left and fully planted, continuing the third frame of image 2; RIGHT FAR FORELEG extended back screen-right. Near LEFT hindleg begins bearing weight under pelvis with its hoof a little farther forward than its former trailing position; dark far RIGHT hindleg trails. Both rear-leg poses must change from the earlier half rather than stay frozen.
5: LEFT NEAR FORELEG supports body and passes below shoulder toward trailing screen-right. RIGHT FAR FOREHOOF lifts slightly and crosses underneath shoulder toward screen-left, BEHIND the left near foreleg. Near LEFT HIND HOOF visibly moves forward beneath pelvis, its hock flexing; RIGHT FAR HINDLEG supports farther back. This is a real passing step, four correct connected legs, no fused joints.
6: RIGHT FAR FOREHOOF extends toward screen-left, low above its higher ground line, ready to plant into the idle/right-leading frame 1. LEFT NEAR FORELEG trails screen-right. Near LEFT hindfoot starts returning toward its original grounded position in idle, RIGHT FAR hindfoot starts advancing to the original idle far-hind position. Preserve plausible short arcs and a smooth last→first transition, do not lift the chest/head like an attack.
Each frame must be different. Body/face/tusks/mane/ears/tail/colors stable. Full anatomy safely within own cell. Never mirror the first half, because near/far appearance is different.
Actual crisp clustered JRPG pixel art matching reference; dark stepped outlines, discrete flat shadows/highlights, no blur or painterly rendering. True alpha transparency, no ground, shadow, background haze, painted checkerboard, particles, labels, numbers, text or grid.
Check before output: first new sprite clearly shows LEFT near foreleg forward; last new sprite clearly shows RIGHT far foreleg forward; all four rear-leg hoof/knee poses move; transparent gutters separate complete sprites.
```

## 09 — boarWalkB3Prompt

```text
Edit the provided THREE-frame walking strip. Keep the exact THREE DIFFERENT LEG POSES unchanged and in their current left-to-right order. Change ONLY the sheet layout: scale each full boar down by about 15 percent, then center each within its own equal cell, with at least 40 transparent pixels on both left and right cell boundaries. The sprites must not touch or overlap any neighboring cell. Output 1536x1024, exactly three 512x1024 cells, one horizontal row.
This strip is walking FRAMES 4,5,6, the opposite leg half of an existing animation. ALL BOARS FACE SCREEN LEFT in the same fixed slightly elevated three-quarter view.
Do not accidentally swap the gait sequence:
First sprite / frame 4: LIGHT NEAR LEFT FORELEG is stretched to SCREEN LEFT, DARK FAR RIGHT FORELEG trails toward SCREEN RIGHT. This is left-foot-forward contact. Copy the first input pose.
Middle sprite / frame 5: LIGHT NEAR LEFT FORELEG is beneath the chest supporting body, DARK FAR RIGHT FORELEG is lifted and passing forward behind it. Copy the second input pose.
Last sprite / frame 6: DARK FAR RIGHT FORELEG is forward toward SCREEN LEFT, LIGHT NEAR LEFT FORELEG is behind toward SCREEN RIGHT. Copy the third input pose.
Keep near legs lighter and in front of dark far legs; keep four correctly attached legs, fur, ears, mane, tusks, head, camera, colors and discrete pixel-art rendering unchanged. No mirrored images. No reordering. Keep the same relative near/far ground line. Match one consistent body scale and trunk center, ample transparent margins everywhere.
Retain transparent alpha; remove diffuse background haze while preserving sprite detail. No drawn checkerboard, shadows, floor, labels, grid, text or extra poses.
```

## 10 — walkAColorPrompt

```text
Use case: precise-object-edit
COLOR CORRECTION ONLY. Image 1 is the edit target sprite sheet. Image 2 is the authoritative approved boar IDLE COLOR PALETTE. The user observed that later animations got progressively brighter and more orange. Recolor the fur of image 1 to match the darker chocolate-brown fur in image 2, with identical midtones/shadows/highlights, WITHOUT altering any geometry or pose.
Match the actual reference colors: dominant fur midtone around RGB(120,64,40), secondary midtone around (128,72,40), deep fur shade around (80,40,24), dark outline around (35,22,18), restrained warm highlight around (184,112,64). Use the IDLE image's color balance, not the edit target's brighter/oranger colors. Fur should have the same brightness and saturation in every cell, no sequential brightening. Keep ivory tusks, eye, dark hooves their original colors.
Exactly THREE sprites in ONE horizontal row, width1536 height1024. Preserve the first right-far-forefoot-leading pose, middle left-near-forefoot-passing pose, third left-near-forefoot-extended-forward pose.
Preserve pixel-for-pixel silhouette shape as closely as possible: four-leg anatomy, camera, exact near/far occlusion, hoof positions, tusks, mane, face, body proportions, full-sprite scale, margins, location of each sprite and discrete pixel clusters. No new gait poses, no mirroring, no rotation, no rescaling/reframing, no extra frames. Preserve the clear dark far legs and slightly lighter near legs while bringing both into the SAME reference fur palette. This is a palette-matching operation, not a redraw.
Maintain real alpha transparency, remove diffuse background haze. No ground, shadows, checkerboard, text, labels or grid. Retain original canvas dimensions and layout.
```

## 11 — walkBColorPrompt

```text
Use case: precise-object-edit
COLOR CORRECTION ONLY. Image 1 is the edit target sprite sheet. Image 2 is the authoritative approved boar IDLE COLOR PALETTE. The user observed that later animations got progressively brighter and more orange. Recolor the fur of image 1 to match the darker chocolate-brown fur in image 2, with identical midtones/shadows/highlights, WITHOUT altering any geometry or pose.
Match the actual reference colors: dominant fur midtone around RGB(120,64,40), secondary midtone around (128,72,40), deep fur shade around (80,40,24), dark outline around (35,22,18), restrained warm highlight around (184,112,64). Use the IDLE image's color balance, not the edit target's brighter/oranger colors. Fur should have the same brightness and saturation in every cell, no sequential brightening. Keep ivory tusks, eye, dark hooves their original colors.
Exactly THREE sprites in ONE horizontal row, width1536 height1024. Preserve first LIGHT NEAR LEFT FORELEG fully forward screen-left; middle LIGHT LEFT foreleg planted while DARK RIGHT foreleg passes behind; last DARK FAR RIGHT FORELEG forward screen-left and LIGHT LEFT FORELEG behind screen-right. Do not repeat the first half of a walk.
Preserve pixel-for-pixel silhouette shape as closely as possible: four-leg anatomy, camera, exact near/far occlusion, hoof positions, tusks, mane, face, body proportions, full-sprite scale, margins, location of each sprite and discrete pixel clusters. No new gait poses, no mirroring, no rotation, no rescaling/reframing, no extra frames. Preserve the clear dark far legs and slightly lighter near legs while bringing both into the SAME reference fur palette. This is a palette-matching operation, not a redraw.
Maintain real alpha transparency, remove diffuse background haze. No ground, shadows, checkerboard, text, labels or grid. Retain original canvas dimensions and layout.
```

## 12 — chargeColorPrompt

```text
Use case: precise-object-edit
COLOR MATCH ONLY: Image 1 is the edit target animation sheet. Image 2 is the approved boar's IDLE COLOR REFERENCE. Recolor ONLY the fur of every sprite in image 1 to match the SAME darker chocolate-brown midtones, shadows, saturation and restrained highlights as image 2. Later animations have become too bright/orange; correct that drift.
Authoritative palette from idle: dominant fur midtone about RGB(120,64,40), secondary midtone (128,72,40), shade (80,40,24), deep outline (35,22,18), restrained warm highlight (184,112,64). Use these same browns in every frame, with consistent proportions of shadows and highlights. Do not brighten into golden orange. Keep ivory tusks, eye, snout and dark hooves unchanged.
Exactly FOUR sprites in a 2x2 grid. Preserve the low charging cycle: compress, BOTH hindfeet push simultaneously, all four feet airborne/tucked, paired landing. No left-right phase differences. Preserve near/far perspective.
Preserve EVERY existing pose and the EXACT original silhouette, leg joints/hooves, face/tusks/mane/ears, camera, pixel clusters, body scale, registration and transparent margins. No mirroring, reordering, reframing, resizing, new poses or extra sprites. Four anatomically connected legs. This edit matches the palette rather than redrawing character animation.
Retain hard discrete pixel-art outlines and flat clustered shadows; no blur, gradients or antialiasing. Real alpha transparency, no ground, shadows, colored background haze, painted checkerboard, labels, numbers or grid. Preserve original square canvas size and 2x2 grid.
```

## 13 — hitColorPrompt

```text
Use case: precise-object-edit
COLOR MATCH ONLY: Image 1 is the edit target animation sheet. Image 2 is the approved boar's IDLE COLOR REFERENCE. Recolor ONLY the fur of every sprite in image 1 to match the SAME darker chocolate-brown midtones, shadows, saturation and restrained highlights as image 2. Later animations have become too bright/orange; correct that drift.
Authoritative palette from idle: dominant fur midtone about RGB(120,64,40), secondary midtone (128,72,40), shade (80,40,24), deep outline (35,22,18), restrained warm highlight (184,112,64). Use these same browns in every frame, with consistent proportions of shadows and highlights. Do not brighten into golden orange. Keep ivory tusks, eye, snout and dark hooves unchanged.
Exactly FOUR sprites in a 2x2 grid. Preserve squint/recoil, maximum recoil with head lifted, recovery, neutral right-far-forefoot-leading idle stance, in that order.
Preserve EVERY existing pose and the EXACT original silhouette, leg joints/hooves, face/tusks/mane/ears, camera, pixel clusters, body scale, registration and transparent margins. No mirroring, reordering, reframing, resizing, new poses or extra sprites. Four anatomically connected legs. This edit matches the palette rather than redrawing character animation.
Retain hard discrete pixel-art outlines and flat clustered shadows; no blur, gradients or antialiasing. Real alpha transparency, no ground, shadows, colored background haze, painted checkerboard, labels, numbers or grid. Preserve original square canvas size and 2x2 grid.
```

## 14 — downColorPrompt

```text
Use case: precise-object-edit
COLOR MATCH ONLY: Image 1 is the edit target animation sheet. Image 2 is the approved boar's IDLE COLOR REFERENCE. Recolor ONLY the fur of every sprite in image 1 to match the SAME darker chocolate-brown midtones, shadows, saturation and restrained highlights as image 2. Later animations have become too bright/orange; correct that drift.
Authoritative palette from idle: dominant fur midtone about RGB(120,64,40), secondary midtone (128,72,40), shade (80,40,24), deep outline (35,22,18), restrained warm highlight (184,112,64). Use these same browns in every frame, with consistent proportions of shadows and highlights. Do not brighten into golden orange. Keep ivory tusks, eye, snout and dark hooves unchanged.
Exactly FOUR sprites in a 2x2 grid. Preserve buckling forelegs, chest down, tipping onto near left flank, prone settled eyes-closed corpse, in that order. Do not raise the body or remove the final prone pose.
Preserve EVERY existing pose and the EXACT original silhouette, leg joints/hooves, face/tusks/mane/ears, camera, pixel clusters, body scale, registration and transparent margins. No mirroring, reordering, reframing, resizing, new poses or extra sprites. Four anatomically connected legs. This edit matches the palette rather than redrawing character animation.
Retain hard discrete pixel-art outlines and flat clustered shadows; no blur, gradients or antialiasing. Real alpha transparency, no ground, shadows, colored background haze, painted checkerboard, labels, numbers or grid. Preserve original square canvas size and 2x2 grid.
```

## 15 — walkAHindPrompt

```text
Use case: precise-object-edit
Modify ONLY THE TWO HIND LEGS below the pelvis of each existing LEFT-facing boar, to complete the six-frame walking gait. Current rear legs are too static. The fur palette and all FRONT leg poses have already been approved: preserve them exactly.
This is frames 1,2,3. Keep frame 1 entirely unchanged. In frame 2 move the NEAR LEFT HIND hoof from its trailing far-right position FORWARD toward screen LEFT, bending and lifting it below the rear hip (roughly local x=430 in its 512px cell). The DARK FAR RIGHT HIND leg supports and trails a little backward (hoof around local x=385). In frame 3 extend the NEAR LEFT HIND leg forward beneath the pelvis (hoof around local x=380), a little above ground about to plant. The DARK FAR RIGHT HIND hoof trails toward screen RIGHT (around local x=420). These are HIND legs attached to the rear pelvis, NOT the front legs. Preserve the existing near LEFT FRONT hoof stepping through 1→2→3 unchanged.
The near LEFT hindleg is the lighter brown rear limb currently planted at the far RIGHT of each sprite. The far RIGHT hindleg is the darker partially occluded rear limb. Keep these identities and hip attachment points fixed; near LEFT leg always drawn on top of far RIGHT leg at crossing. Four legs total. Use small natural low stepping arcs.
Keep every pixel outside the hind-leg region unchanged as closely as possible: head, tusks, mane, trunk, ear, tail, BOTH FRONT LEGS, ground registration, body scale, fur pixel clusters and fixed three-quarter camera. Never mirror, rotate, reorder or add sprites.
MOST IMPORTANT COLOR CONSTRAINT: preserve the exact existing dark chocolate-brown color palette and brightness, with midtone around RGB(120,64,40), shade around (80,40,24); no brightening or orange tint. Palette and pixel geometry outside edited hindlegs remain unchanged. Crisp JRPG pixel art, no blur.
Keep original 1536x1024 canvas with exactly THREE sprites in ONE horizontal row, equal 512x1024 cells and generous transparent margins. Real alpha transparency, no floor/shadows/haze, text, numbers, labels or grid.
```

## 16 — walkBHindPrompt

```text
Use case: precise-object-edit
Modify ONLY THE TWO HIND LEGS below the pelvis of each existing LEFT-facing boar, to complete the six-frame walking gait. Current rear legs are too static. The fur palette and all FRONT leg poses have already been approved: preserve them exactly.
This is frames 4,5,6, NOT frames 1,2,3. In frame 4 the NEAR LEFT HIND hoof is forward under the pelvis (roughly local x=367 in its 512px cell), PLANTED; the DARK FAR RIGHT HIND hoof trails screen RIGHT (around local x=400). In frame 5 the NEAR LEFT HIND leg bears weight and sweeps back beneath hip (hoof around local x=405), while the DARK FAR RIGHT HIND hoof lifts and passes FORWARD toward screen LEFT behind the nearer leg (around local x=380). In frame 6 the NEAR LEFT HIND leg trails screen RIGHT (hoof around local x=465), while the DARK FAR RIGHT HIND leg reaches forward toward screen LEFT ready to plant (hoof around local x=332). The rear gait then connects to the original idle stance. These are HIND legs attached to the rear pelvis, NOT the front legs. Preserve the existing FRONT legs: first sprite LIGHT near LEFT foreleg FORWARD screen LEFT, middle sprite DARK far RIGHT foreleg passing, final sprite DARK far RIGHT foreleg FORWARD. Do not copy/reverse the first half.
The near LEFT hindleg is the lighter brown rear limb currently planted at the far RIGHT of each sprite. The far RIGHT hindleg is the darker partially occluded rear limb. Keep these identities and hip attachment points fixed; near LEFT leg always drawn on top of far RIGHT leg at crossing. Four legs total. Use small natural low stepping arcs.
Keep every pixel outside the hind-leg region unchanged as closely as possible: head, tusks, mane, trunk, ear, tail, BOTH FRONT LEGS, ground registration, body scale, fur pixel clusters and fixed three-quarter camera. Never mirror, rotate, reorder or add sprites.
MOST IMPORTANT COLOR CONSTRAINT: preserve the exact existing dark chocolate-brown color palette and brightness, with midtone around RGB(120,64,40), shade around (80,40,24); no brightening or orange tint. Palette and pixel geometry outside edited hindlegs remain unchanged. Crisp JRPG pixel art, no blur.
Keep original 1536x1024 canvas with exactly THREE sprites in ONE horizontal row, equal 512x1024 cells and generous transparent margins. Real alpha transparency, no floor/shadows/haze, text, numbers, labels or grid.
```

## 17 — walkAGuidePrompt

```text
EDIT ONLY THE TWO HIND LEGS of the boars in Image 1. Image 2 is a positional skeleton guide, NOT final artwork. Red = anatomical LEFT/NEAR HIND leg, blue = RIGHT/FAR HIND leg; gray legs are forelegs. The RED rear hoof must actually TRAVEL a large distance between the three frames rather than stay at the right edge. REPLACE the original rear-leg poses, they are too static.
THREE walking frames 1,2,3, ONE ROW, 1536x1024, exact three equal 512x1024 cells. Preserve frame 1 idle stance, and all existing FRONT LEG poses in every frame.
Frame 2: near LEFT HIND leg is visibly OFF GROUND and folded FORWARD beneath pelvis; its hoof is around local x=402,y=635, much LEFT of the original rightmost hoof. Far RIGHT HIND leg supports under pelvis around x=387,y=680.
Frame 3: near LEFT HIND leg is visibly STRETCHED FORWARD toward screen LEFT beneath belly, hoof around local x=325,y=667; far RIGHT HIND leg stretches BACK toward screen RIGHT, hoof around x=450,y=680. This is the OPPOSITE rear-leg stride from frame 1. Do not leave a near hind hoof at x=480 in frame 3.
Keep the near hindleg connected to the same near hip and drawn in front of the far hindleg when they overlap. Render natural knee/hock anatomy adapting the schematic. Exactly four correctly attached legs.
Preserve the head, mane, tusks, ear, tail, trunk, all FRONT legs, fixed left-facing 3/4 camera, body size, sprite positions and original crisp pixel clusters. Preserve the EXACT existing dark brown fur palette and brightness, midtone RGB(120,64,40), shadow (80,40,24). Do NOT paint guide colors or labels into output.
Real alpha transparency, no background haze, ground, shadows, text, grid, diagrams or extra sprites.
```

## 18 — walkBGuidePrompt

```text
EDIT ONLY THE TWO HIND LEGS of Image 1. Image 2 is a skeleton-position guide, NOT final art: red = anatomical LEFT/NEAR HIND leg, blue = RIGHT/FAR HIND leg, gray = FRONT legs. The existing rear hooves barely move. REPLACE the rear-leg poses with large clear forward/backward movement matching the guide. Do not leave all near rear hooves planted at far-right.
THREE walking frames 4,5,6 ONLY, ONE ROW, 1536x1024, three equal 512x1024 cells.
Frame 4: near LEFT HIND leg clearly extends FORWARD under belly, hoof PLANTED around local x=330,y=674. Far RIGHT HIND leg extends BACK toward screen RIGHT around x=425,y=651. Preserve the existing light LEFT FRONT leg extended screen LEFT in frame 4.
Frame 5: near LEFT HIND leg planted and passes toward back under hip, hoof around x=403,y=675. Far RIGHT HIND hoof visibly lifts and swings FORWARD under pelvis, around x=349,y=620.
Frame 6: near LEFT HIND leg extends BACK toward screen RIGHT, hoof around x=460,y=674. Far RIGHT HIND leg extends FORWARD toward screen LEFT, hoof around x=315,y=651. This connects to the original far-right-leading idle stance. Preserve existing dark RIGHT FRONT leg forward and light LEFT FRONT leg behind.
Preserve all FRONT LEG phases as in input: left foot forward in first sprite, right foot passing in middle, right foot forward in last. No mirroring/reordering. Same camera, four anatomically connected legs; near hind leg is lighter and occludes dark far hindleg during crossing. Render natural knee/hock anatomy from the guide.
Keep head, trunk, mane, fur texture, tusks, ear, tail, pixel clusters, body scale and exact original dark chocolate-brown palette unchanged, midtone RGB(120,64,40), shade (80,40,24). Do NOT transfer red/blue guide colors into final pixels. Actual alpha transparency, no ground/shadows/haze, labels, diagram shapes or extra sprites.
```

## 19 — chargeSequenceGuidePrompt

```text
Replace the CHARGING ANIMATION POSES in Image 1 with the exact NEW four-frame sequence in Image 2's skeleton guide. Image 1 is authoritative character/pixel-art/color reference; Image 2 specifies physical motion ONLY. Draw the actual boar, not the guide. Keep character identity and the exact dark chocolate-brown fur palette from Image 1, midtone RGB(120,64,40), shade (80,40,24); no brightness drift.
Exactly FOUR left-facing quadruped boars in a 2x2 equal-cell transparent sprite sheet, 1024x1024. Temporal order: top-left, top-right, bottom-left, bottom-right.
1 TOP LEFT: BOTH FRONT FEET lift SLIGHTLY off the ground, foreknees fold up a little, while BOTH HIND FEET are still planted and extend to push off. Front pair is visibly higher than hind pair. This begins rising from the previous crouch.
2 TOP RIGHT: JUMP upward/forward, ALL FOUR FEET visibly AIRBORNE, both hindfeet kicked simultaneously and fold under pelvis, both forelegs fold under chest. Body clearly higher than frame 1. Head/tusks point low toward screen LEFT. This is the highest body position, no hoof touches ground.
3 BOTTOM LEFT: BOTH FRONT FEET LAND together on ground, forelegs extended down to absorb landing, BOTH HIND FEET STILL AIRBORNE and folded under raised pelvis. Rear hip higher than front chest: body tilts nose-down. Do NOT place hindfeet on ground in this frame. Distinct from the airborne frame 2.
4 BOTTOM RIGHT: BOTH HIND FEET now land as well, ALL FOUR FEET on ground; body and head sink into a deep squat/compression, both foreknees and hindknees flex together. This closes smoothly to frame 1, which raises only the forefeet again. Do NOT return to standing idle at the end.
Left and right legs have the SAME timing: both hindfeet kick simultaneously, both forefeet land simultaneously in frame 3, both hindfeet land simultaneously in frame 4. Perspective alone separates near/far hooves: near anatomical LEFT flank/legs lighter and in front, far RIGHT legs darker behind. Four legs only; natural connected joints.
Fixed LEFT-facing three-quarter side camera. Constant body size/torso registration, large clear transparent margins around EVERY sprite. Preserve tusks, bristle mane, ears, tail, face and crisp stepped pixel-art shading from Image 1. No red/blue guide colors or gray guide shapes in final art.
Real alpha transparency, no floor, shadows, particles, haze, effects, text, numbers, labels or grid.
```

## 20 — walkAFreshGuidePrompt

```text
Use case: sketch-to-render. Asset type: pixel-art game animation strip, exactly three NEW boar walking poses.
Image 1 is the PRIMARY skeleton/hoof POSITION guide. Image 2 is the character/style reference: only the upper body was supplied deliberately, so you must DRAW NEW LEGS following image 1, not invent stationary rear legs.
Replace the entire schematic in image 1 with the furry boar from image 2. Retain the positions and joint angles of the schematic feet with precision. Red means NEAR anatomical LEFT hindleg, blue means FAR anatomical RIGHT hindleg. The schematic colors and labels must NOT appear in the final art.
Character identity: fierce stocky quadruped wild-boar monster, big ivory tusks, peach inner ear, spiky mane, dark brown shaggy fur, charcoal cloven hooves, short curled tail. LEFT facing, slightly elevated 3/4 view, near left legs occlude far right legs. Exact head/mane/torso style of image 2.
Critical rear-leg instruction: the near hindleg's furry thigh, hock AND hoof must swing visibly. At the FORWARD pose the near hindhoof must be UNDER THE BELLY, well left of the hip, NOT at the far right silhouette. Make the changed rear-leg diagonals conspicuous at game sprite size. Exactly four legs, distinguish two rear legs through overlap, no fifth limb.
Canvas 1536x1024, THREE cells 512x1024 in ONE horizontal row. Body in each cell centered around x=260, y=450, baseline around y=700; all sprites fully contained, minimum 20px transparent side margins. Consistent torso size/position between the three. High quality crisp pixel-art texture, hard outlines and discrete colored pixel clusters, NO smooth rendering. Transparent background, no shadow, no letters, no ground line, no labels.
Lock the reference's dark brown palette for every cell: primary fur approximately RGB(120,64,40), secondary(128,72,40), deep shade(80,40,24), outline(35,22,18), restrained highlight(184,112,64). Do not brighten or orange-shift along the strip. Preserve subdued idle-like brightness.
Frames are chronological 1,2,3. Frame 1 right/far FRONT leg reaches left/forward, left/near FRONT behind; near LEFT REAR hoof reaches right/back (guide local x478), far RIGHT REAR hoof reaches left/forward (x332). Frame 2 near LEFT REAR folds high under hip x402,y635; far RIGHT REAR planted x387,y680. Near FRONT swings up/passes toward left. Frame 3 near LEFT REAR stretches forward UNDER THE BELLY to x325,y667, far RIGHT REAR stretches backward x450,y680. Near LEFT FRONT stretches LEFT/forward, far RIGHT FRONT pushes behind. The near rear hoof must travel a large arc RIGHT → CENTER-UP → LEFT over these 3 frames.
```

## 21 — walkBFreshGuidePrompt

```text
Use case: sketch-to-render. Asset type: pixel-art game animation strip, exactly three NEW boar walking poses.
Image 1 is the PRIMARY skeleton/hoof POSITION guide. Image 2 is the character/style reference: only the upper body was supplied deliberately, so you must DRAW NEW LEGS following image 1, not invent stationary rear legs.
Replace the entire schematic in image 1 with the furry boar from image 2. Retain the positions and joint angles of the schematic feet with precision. Red means NEAR anatomical LEFT hindleg, blue means FAR anatomical RIGHT hindleg. The schematic colors and labels must NOT appear in the final art.
Character identity: fierce stocky quadruped wild-boar monster, big ivory tusks, peach inner ear, spiky mane, dark brown shaggy fur, charcoal cloven hooves, short curled tail. LEFT facing, slightly elevated 3/4 view, near left legs occlude far right legs. Exact head/mane/torso style of image 2.
Critical rear-leg instruction: the near hindleg's furry thigh, hock AND hoof must swing visibly. At the FORWARD pose the near hindhoof must be UNDER THE BELLY, well left of the hip, NOT at the far right silhouette. Make the changed rear-leg diagonals conspicuous at game sprite size. Exactly four legs, distinguish two rear legs through overlap, no fifth limb.
Canvas 1536x1024, THREE cells 512x1024 in ONE horizontal row. Body in each cell centered around x=260, y=450, baseline around y=700; all sprites fully contained, minimum 20px transparent side margins. Consistent torso size/position between the three. High quality crisp pixel-art texture, hard outlines and discrete colored pixel clusters, NO smooth rendering. Transparent background, no shadow, no letters, no ground line, no labels.
Lock the reference's dark brown palette for every cell: primary fur approximately RGB(120,64,40), secondary(128,72,40), deep shade(80,40,24), outline(35,22,18), restrained highlight(184,112,64). Do not brighten or orange-shift along the strip. Preserve subdued idle-like brightness.
Frames are chronological 4,5,6. Frame 4 near LEFT FRONT reaches LEFT/forward, far RIGHT FRONT behind. Near LEFT REAR must reach FORWARD under belly x330,y674, far RIGHT REAR behind x425,y651. Frame 5 near LEFT REAR planted near hip x403,y675, far RIGHT REAR visibly lifts and swings FORWARD to x349,y620; far RIGHT FRONT visibly raised passing toward forward. Frame 6 near LEFT REAR pushes far BACK x460,y674, far RIGHT REAR reaches FORWARD x315,y651. Far RIGHT FRONT reaches LEFT/forward (x110), near LEFT FRONT trails behind (x218). Far FRONT and REAR MUST both be in front in frame 6, unlike frame 4. Near hindleg arc LEFT → CENTER → RIGHT. This is the second half of a loop, do not repeat first-half leg ordering.
```

## 22 — walkAHeadGuidePrompt

```text
Use case: sketch-to-render. Render the FIRST image's three different four-legged walking skeletons literally as crisp dark-brown pixel-art wild boar monsters. The second image supplies ONLY the head identity and pixel texture; use that head and matching stocky fur-covered body.
POSES FROM IMAGE 1 ARE MANDATORY. Every red stroke becomes the near hindleg, every blue stroke becomes the far hindleg, with the hoof placed at the colored ellipse's center. Preserve their DIFFERENT thigh, knee, hock and hoof positions exactly. Red/blue are instructions ONLY; all legs in the result are brown/charcoal. Do not replace them with generic default boar legs. In particular a forward red hindleg has its hoof far to the LEFT of the pelvis, underneath the belly.
Three frames, one horizontal row, 1536x1024 transparent canvas. Same camera (slightly elevated 3/4 LEFT facing), head, torso proportions and torso positions all three frames. Minimum 22px margin between adjacent sprites; no touching cell boundaries. No text, lines, diagrams, background or shadows. Exactly four legs. Near left legs brighter and overlap darker far right legs. Palette dark brown midtone RGB120,64,40, shade80,40,24, restrained highlights184,112,64, matching head reference, no progressive brightening.
Frame1: near rear stretches BACKWARD to right, far rear FORWARD under belly. Frame2: near rear folds UP UNDER the belly, far rear vertical planted. Frame3: near rear stretches FORWARD under belly to LEFT of pelvis, far rear stretches BACKWARD to right. The large rear hoof must move from the back of the boar to its belly across these three cells. Front pair follow gray skeletons: right/far front leads left in frame1, near front raised frame2, near front extended LEFT in frame3.
```

## 23 — walkBHeadGuidePrompt

```text
Use case: sketch-to-render. Render the FIRST image's three different four-legged walking skeletons literally as crisp dark-brown pixel-art wild boar monsters. The second image supplies ONLY the head identity and pixel texture; use that head and matching stocky fur-covered body.
POSES FROM IMAGE 1 ARE MANDATORY. Every red stroke becomes the near hindleg, every blue stroke becomes the far hindleg, with the hoof placed at the colored ellipse's center. Preserve their DIFFERENT thigh, knee, hock and hoof positions exactly. Red/blue are instructions ONLY; all legs in the result are brown/charcoal. Do not replace them with generic default boar legs. In particular a forward red hindleg has its hoof far to the LEFT of the pelvis, underneath the belly.
Three frames, one horizontal row, 1536x1024 transparent canvas. Same camera (slightly elevated 3/4 LEFT facing), head, torso proportions and torso positions all three frames. Minimum 22px margin between adjacent sprites; no touching cell boundaries. No text, lines, diagrams, background or shadows. Exactly four legs. Near left legs brighter and overlap darker far right legs. Palette dark brown midtone RGB120,64,40, shade80,40,24, restrained highlights184,112,64, matching head reference, no progressive brightening.
Frame4 (left cell): NEAR front and NEAR hind legs stretch FORWARD to LEFT, far front and far hind both trail behind. Near hindhoof is UNDER THE BELLY far LEFT of pelvis. Frame5 middle: near hind vertical, far hind lifted UP under belly; FAR front raised moving forward. Frame6 right cell: FAR front and FAR hind stretch FORWARD to LEFT, near front and near hind both trail behind. Near hindhoof moves far RIGHT behind pelvis. This left-to-right sequence is reciprocal to the first half, don't draw far foreleg in front in frame4.
```

## 24 — walkSingleRearForwardPrompt

```text
Edit this ONE pixel-art boar walking frame. Keep the head, tusks, mane, torso, tail, TWO FRONT legs, dark brown palette, camera and pixel texture exactly unchanged.
Change ONLY the TWO REAR LEGS. The large bright near hindleg currently trails diagonally down-right and its hoof is at the far right. MOVE THIS NEAR HINDLEG FORWARD: rotate the thigh toward lower LEFT, bend hock naturally, and place the big near hindhoof far LEFT beneath the belly, around x=295,y=663 in the 512x1024 reference. Its shin should slope DOWN-LEFT, not down-right. Make the forward-reaching rear leg conspicuous. The smaller dark far hindleg must trail to the RIGHT behind it, with its small hoof around x=440,y=645. Swap the front/back ordering of the rear leg pair. The near foreleg still reaches left just like input.
The pose is a walking stride, NOT crouching, NOT airborne. Exactly four legs, no original old rear leg left behind, no fifth hoof.
Output ONE sprite on transparent background, same complete framing and reference dimensions. No text, no ground, no colored diagrams, no shadows, no illumination change, no brightening.
```

## 25 — walkFrame2RearPassPrompt

```text
Edit this ONE pixel-art boar walking frame. Keep the complete character identity, head, tusks, mane, torso, tail, crisp pixel-art texture, slight elevated LEFT 3/4 camera and dark brown palette exactly unchanged. No global brightening. This is a walking stride with exactly four legs and charcoal cloven hooves. Transparent background, ONE sprite, no shadow, no letters. Remove the old rear leg positions entirely, no fifth leg or extra hooves. Near left legs occlude darker far right legs.
Change ONLY the TWO REAR LEGS; preserve BOTH FRONT legs exactly (near front bent up/passing, far front planted). The big bright NEAR HIND leg currently extends down-right to the farthest-right hoof: lift it decisively, rotate its furry thigh toward lower LEFT and fold the hock UNDER the hip. Its near hindhoof must sit HIGH UNDER THE BELLY, near x360,y605 in this 512x1024 reference, at least 75px above the far hindhoof. It must visibly clear the ground in its swing. The small dark FAR HIND leg must be planted roughly vertical under its hip around x400,y682, carrying the body. Strongly different from the old two trailing rear legs.
```

## 26 — walkFrame3PrelandPrompt

```text
Edit this ONE pixel-art boar walking frame. Keep the complete character identity, head, tusks, mane, torso, tail, crisp pixel-art texture, slight elevated LEFT 3/4 camera and dark brown palette exactly unchanged. No global brightening. This is a walking stride with exactly four legs and charcoal cloven hooves. Transparent background, ONE sprite, no shadow, no letters. Remove the old rear leg positions entirely, no fifth leg or extra hooves. Near left legs occlude darker far right legs.
This is the instant JUST BEFORE the supplied forward-reaching pose lands. Preserve both rear legs' FRONT/BACK ordering: big bright near hindleg is forward under the BELLY, small dark far hindleg trails behind on the RIGHT. Near FRONT leg also reaches LEFT forward exactly as input. Raise the extended near FRONT and near HIND hooves slightly about 12 pixels above their input positions (in the reference's native dimensions), slightly bend their joints, keep them reaching forward. Far FRONT and far HIND remain planted and carry the body. Raise the torso very subtly by 5 pixels. The forward near rear hoof must stay under the BELLY, never move to the far right. Retain reference brightness; do not rescale or redesign.
```

## 27 — walkFrame5RearPassPrompt

```text
Edit this ONE pixel-art boar walking frame. Keep the complete character identity, head, tusks, mane, torso, tail, crisp pixel-art texture, slight elevated LEFT 3/4 camera and dark brown palette exactly unchanged. No global brightening. This is a walking stride with exactly four legs and charcoal cloven hooves. Transparent background, ONE sprite, no shadow, no letters. Remove the old rear leg positions entirely, no fifth leg or extra hooves. Near left legs occlude darker far right legs.
Change ONLY the TWO REAR LEGS, preserve BOTH FRONT legs exactly (far front lifted passing, near front planted). Move big bright NEAR HIND hoof left from far right to directly beneath its hip around x387,y662 (512x1024 reference), leg roughly vertical, bearing weight. The small dark FAR HIND leg must be dramatically lifted, bend its joints and reach LEFT/FORWARD under the BELLY, hoof around x318,y594, visibly 68px above the near hoof. Keep the folded far hindleg visible to the LEFT of the vertical near rear leg; no overlap hiding the entire lifted hoof. It is the FAR hindleg's forward swing, in phase with the lifted FAR foreleg. Rear legs must clearly differ from input.
```

## 28 — walkAFinalColorPrompt

```text
Use case: precise-object-edit. PALETTE MATCH ONLY. Image 1 is the edit target, Image 2 is the approved IDLE COLOR reference. Keep all silhouettes, geometry, four leg positions, poses, pixel clusters, margins, canvas dimensions and character identity exactly as in image1. No redrawing or changes of pose.
Bring every fur shade of image1 into the same darker chocolate-brown palette of image2. Measured image1 fur median luminance is about80, while approved idle is76-77. Darken the BROWN FUR midtones very slightly by about4 luminance levels, matching actual idle colors. Keep tusks, eyes, peach nose/ear and charcoal hooves unchanged. Fur RGB midtone120,64,40, secondary128,72,40, deep shade80,40,24, outline35,22,18, restrained highlight184,112,64. Identical brightness and color balance across all cells, no progressive brightening, no orange shift.
Transparent background, no shadows, no text, preserve hard crisp pixel-art edge and source framing.
Exactly three sprites in one horizontal row on1536x1024. Preserve all three leg poses, particularly MIDDLE near rear hoof LIFTED and THIRD near rear hoof FORWARD UNDER BELLY. Do not copy the idle pose.
```

## 29 — walkBFinalColorPrompt

```text
Use case: precise-object-edit. PALETTE MATCH ONLY. Image 1 is the edit target, Image 2 is the approved IDLE COLOR reference. Keep all silhouettes, geometry, four leg positions, poses, pixel clusters, margins, canvas dimensions and character identity exactly as in image1. No redrawing or changes of pose.
Bring every fur shade of image1 into the same darker chocolate-brown palette of image2. Measured image1 fur median luminance is about80, while approved idle is76-77. Darken the BROWN FUR midtones very slightly by about4 luminance levels, matching actual idle colors. Keep tusks, eyes, peach nose/ear and charcoal hooves unchanged. Fur RGB midtone120,64,40, secondary128,72,40, deep shade80,40,24, outline35,22,18, restrained highlight184,112,64. Identical brightness and color balance across all cells, no progressive brightening, no orange shift.
Transparent background, no shadows, no text, preserve hard crisp pixel-art edge and source framing.
Exactly three sprites in one horizontal row on1536x1024. FIRST near rear hoof FORWARD UNDER BELLY; SECOND near rear vertical/far rear folded high; THIRD near rear back/far rear forward. Preserve these EXACT positions.
```

## 30 — chargeFinalColorPrompt

```text
Use case: precise-object-edit. PALETTE MATCH ONLY. Image 1 is the edit target, Image 2 is the approved IDLE COLOR reference. Keep all silhouettes, geometry, four leg positions, poses, pixel clusters, margins, canvas dimensions and character identity exactly as in image1. No redrawing or changes of pose.
Bring every fur shade of image1 into the same darker chocolate-brown palette of image2. Measured image1 fur median luminance is about80, while approved idle is76-77. Darken the BROWN FUR midtones very slightly by about4 luminance levels, matching actual idle colors. Keep tusks, eyes, peach nose/ear and charcoal hooves unchanged. Fur RGB midtone120,64,40, secondary128,72,40, deep shade80,40,24, outline35,22,18, restrained highlight184,112,64. Identical brightness and color balance across all cells, no progressive brightening, no orange shift.
Transparent background, no shadows, no text, preserve hard crisp pixel-art edge and source framing.
Exactly four sprites in a2x2 grid on1254x1254. Preserve pose1frontfeetup/rearplanted; pose2allfeetairborne; pose3FRONT FEET LANDED AND REAR FEET STILL IN AIR; pose4allfeetlandeddeepcrouch. Geometry must stay identical.
```

## 31 — chargeExtendedLegsPrompt

The top-right generated cell replaces frame 2 only. The other three source cells are retained byte-for-byte. The source anchor (299,527) preserves the upper body position; extended hooves are 26px above the game ground line.

```text
Use case: precise-object-edit.
Edit ONLY FRAME TWO, the TOP-RIGHT boar in this 2x2 charge-animation sprite sheet. It is currently airborne with all four legs tucked under the belly. Replace that leg pose with an EXTENDED AIRBORNE stride to connect the top-left takeoff to the bottom-left front-foot landing.

TOP-RIGHT FRAME ONLY:
- Both FRONT legs extend together FORWARD and downward toward the LEFT, preparing to land on the next frame. The near and far front hooves must clearly be in front of the chest, not folded against the belly.
- Both HIND legs extend together BACKWARD and downward toward the RIGHT, finishing the paired hind-foot push-off. Show long open rear-leg diagonals instead of the current folded hocks.
- The four legs make an open stretched bounding silhouette, clearly distinct from the curled-up input. Knees may have a small natural bend, but no tucked limbs. Exactly FOUR legs; no fifth hoof.
- Left/right pairs remain synchronized. Far legs are darker and slightly higher from the 3/4 camera, with correct occlusion. All feet are airborne.
- Preserve the top-right boar's torso, head, face, tusks, mane, tail, orientation, upper-body position, character size and pixel-art texture. Do not tilt the torso differently.
- Allow the top-right hooves to extend lower within its existing cell, roughly y=570–590 on the1254x1254 sheet, without touching neighboring sprites.

Keep frames ONE (top left), THREE (bottom left), and FOUR (bottom right) unchanged. They remain frontfeet raised/rear planted; frontfeet landed/rear airborne; all feet planted/deep crouch respectively.
Keep the exact current subdued dark chocolate-brown fur palette, charcoal hooves, peach nose/ears and ivory tusks. Do not brighten or recolor any fur. Crisp discrete pixel clusters and outlines, no smooth painting. True transparent background, no shadows, no ground, no text, no labels, no checkerboard.
Output the same1254x1254 2x2 sheet, four sprites, full limbs inside their own cells with transparent margins.
```



