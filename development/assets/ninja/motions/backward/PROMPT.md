# Ninja backward review — 2026-10-06

Method: built-in image_gen, transparent_background=true. Reference design: ../../idle-01.png. Previous v7 source and prompts archived under source/. Prior near/far switching and old backward phase descriptions are superseded. L=mesh+gold, always camera-near; R=bare+band, always camera-far. Frame 1 L ahead, frame 5 R ahead, passing at 3/7.

## V8 full prompt — rejected

Use case: identity-preserve.
Asset type: transparent game sprite sheet for an existing chibi female ninja, eight-pose guarded backward walk loop.
Input images: image 1 is canonical idle character and pixel-style design; image 2 is old forward sheet for crisp style only; image 3 is old backward sheet for protective upper-body stance only. The old backward legs are INCORRECT and must all be redrawn with the new phases.
Primary request: Create EXACTLY 4 columns by 2 rows, eight distinct original sequential full-body poses ordered 1 2 3 4 / 5 6 7 8. Each whole ninja isolated on true alpha with generous transparent gutter. No labels, grid, shadows or background.
Character: fixed right-facing 3/4 view, ponytail/red ribbon/trailing red scarf, brown eyes, black mask, black gold-trim tunic, red waist belt, red laced black open-toe boots, silver four-point shuriken held in same forward hand. She watches RIGHT vigilantly while cautiously retreating LEFT, empty fist raised before chest, knees softly flexed, shoulders guarded, slightly leaned away from threat. Preserve same face, head and equipment size in every cell.
CRITICAL LEG IDENTITY: anatomical LEFT L is the camera-NEAR leg, FISHNET STOCKING with GOLD SQUARE BUCKLE on thigh/knee. Anatomical RIGHT R is camera-FAR, BARE SKIN with BLACK THIGH BAND. NEVER exchange them. L fishnet is foreground in every cell, whether screen-right or screen-left. R bare is behind in every cell. During overlap L ALWAYS occludes R. In particular frames 1 AND 8 must show FISHNET leg near at front/right, never fishnet far behind bare. The camera never turns. All eight pairs of boots have heels left/toes right.
Eight small, low consecutive walking phases, front=screen-right, back=screen-left:
1 L FISHNET NEAR forward/right grounded, R BARE FAR rear/left toe touching. Small guarded split stance.
2 L near comes rearwards toward under pelvis supporting body; R far returns low from rear toward under pelvis, tiny lifted foot.
3 LOW CROSS: L fishnet near under pelvis grounded supporting; R bare far passes BEHIND it, ankles nearly same x and R foot low. Fishnet must be visible foreground. NO high knee or widely separated feet.
4 L near moves just behind/left heel up; R far reaches low ahead/right.
5 R BARE FAR forward/right planted; L FISHNET NEAR rear/left toe touching. Opposite contact to 1; the fishnet rear thigh remains foreground, same anatomical leg.
6 R far returns under pelvis with weight, L near swings low forward from rear.
7 LOW CROSS: R bare far grounded under pelvis, L fishnet near passes IN FRONT, ankles nearly same x and L foot only slightly above floor. Mesh and gold buckle visibly over the bare leg. NO high knees.
8 L FISHNET NEAR reaches forward/right immediately before frame 1 contact; R bare far rear/left heel raised. L mesh near as in frame 1, never swap. Foot positions and body align almost exactly to 1 for smooth loop.
Pelvis local x stable, very slight vertical bob. Small cautious stride, not running. Stable chest guard and rightward eye direction all eight; small scarf follow-through. Eight distinct leg drawings with continuously changing ankle x; same anatomy and shoe sizes, no cutout interpolation.
Style: match crisp hand-drawn detailed PIXEL SPRITE character of images 1 and 2, do not smooth into generic vector/anime. Image 3 only provides guard pose. Complete silhouettes with safe gutters including shuriken and scarves; no cell clipping.
Avoid: swapping mesh leg or gold buckle, putting mesh on far leg, camera/torso rotation, duplicated poses, high-knee lift, foot pointing left, shoes pointing at viewer, oversized head, mirrored hands, any opaque/gradient background. Genuinely transparent alpha.

V8 rejected after visual inspection: frames 1/5 both have mesh leg ahead and old high lifted passing poses survived. It is preserved as source/ninja-backward-generated-v8-rejected.png and is not selected by layout.json.

## V9 full prompt

Use case: identity-preserve. Create a NEW transparent guarded retreat game sprite animation sheet using the attached ninja IDLE only for character design. Do NOT repeat her idle pose.
EXACT layout 4 columns x 2 rows, eight NEW consecutive guarded BACKWARD walk drawings, top row 1 2 3 4 and bottom row 5 6 7 8. Each sprite whole, completely separate and evenly centered with broad transparent gutters. No text or grid. Crisp detailed chibi pixel-art at the reference resolution enlarged, never smooth vector.
Maintain identical dark ponytail/red bow, red scarf, black face mask, brown eyes, black/gold tunic, red waist knot, black/red open-toe boots, ONE silver shuriken in the same front hand. Fixed right-facing 3/4 camera, waist local x same everywhere, face/head/body scale identical.
MOST IMPORTANT: TWO LEGS HAVE PERMANENT DIFFERENT COSTUMES. L=the CAMERA-NEAR FOREGROUND leg wearing a NET/FISHNET THIGH STOCKING and GOLD SQUARE BUCKLE. R=the CAMERA-FAR BACKGROUND leg with BARE THIGH and BLACK THIGH BAND. L is foreground for ALL EIGHT cells, R background for ALL EIGHT. When legs overlap, the fishnet knee/shin must cover the bare knee/shin. The fishnet NEVER changes to the far limb. Ankle x moves but camera depth does not.
The complete walking sequence MUST follow these exact ankle locations relative to pelvis. Coordinates below are proportions of cell width, so x+ is screen RIGHT/ahead and x- is screen LEFT/behind. Feet move in continuous LOW arcs, toes always RIGHT, heels LEFT:
Frame1 L FISHNET ankle x=+0.12 grounded. R BARE ankle x=-0.14 rear toe on ground. Fishnet near thigh/shin in foreground.
Frame2 L FISHNET ankle x=+0.06 supporting ground, R BARE ankle x=-0.08 moving forward low 6px above ground. Keep knees below waist, no crouched folded leg.
Frame3 L FISHNET ankle x=0 ground, R BARE ankle x=-0.01 only 8px above ground passing BEHIND L. Legs are almost vertical, ankle locations almost coincident. Bare leg partly HIDDEN by foreground fishnet leg. Draw a low passing pose, NOT a high bent knee.
Frame4 L FISHNET ankle x=-0.06 heel rising, R BARE ankle x=+0.07 reaching forward low 5px above ground.
Frame5 L FISHNET ankle x=-0.12 rear toe on ground. R BARE ankle x=+0.14 grounded. This is the opposite foot contact to1. Camera-near FISHNET leg extends back LEFT and remains fully foreground; bare far leg extends ahead RIGHT.
Frame6 L FISHNET ankle x=-0.06 moving low forward 6px above ground. R BARE ankle x=+0.08 supporting ground. DO NOT place fishnet foot ahead of bare yet.
Frame7 L FISHNET ankle x=+0.01 passing IN FRONT of R only8px above ground. R BARE ankle x=0 supporting ground. Almost vertical legs, ankles almost coincide. Foreground fishnet thigh/knee/shin COVER the bare leg. This must be clearly the opposite low passing pose to3. No high lifted knee.
Frame8 L FISHNET ankle x=+0.10 reaching forward low 3px above ground, R BARE ankle x=-0.12 rear heel lifting. Mesh leg foreground at screen RIGHT, bare leg background screen LEFT. Very similar to1, ready for seamless contact.
Clothing decorations travel with the same anatomical leg. All open toes face RIGHT and boots never face viewer or LEFT. No high knees, no leaping. Retreat cautiously toward LEFT while watching RIGHT. Empty fist raised in front of chest to defend, shuriken hand near chest at same side. Shoulders tuck defensively, knees soft. Shorter stride than forward, stable protective stance throughout. Small mild upper-body bob, stable waist and shoulders, rhythmic scarf. Frame3 and7 silhouette feet clustered beneath pelvis; frame1 and5 wide split with opposite patterned leg forward. Eight distinct original poses. True alpha transparent background with no floor shadow.

## V10 targeted repair full prompt

Use case: precise-object-edit. EDIT this exact 1774x887 ninja backward sheet, 4 columns x 2 rows. Keep ALL eight upper bodies, heads, faces, hair/scarf/guard/shuriken and placement unchanged. Only correct the few lower-body mistakes listed below. True alpha transparent.
Permanent leg ID: CAMERA-NEAR L has ONE FISHNET THIGH STOCKING and ONE GOLD SQUARE BUCKLE, always foreground. CAMERA-FAR R has BARE THIGH and PLAIN BLACK THIGH BAND, always background. Exactly one of each throughout. They don't switch depth. Boots ALWAYS heels left and toes RIGHT, side profile.
Frame3 TOP ROW COLUMN3: currently bare thigh at screen-left is foreground and mesh thigh at screen-right is background, incorrect. SWAP ONLY THIGH COSTUME between them: larger foreground left thigh becomes FISHNET+GOLD buckle, thin background right thigh becomes BARE+BLACK band. Near mesh leg grounded under pelvis supports body; far bare foot passes BEHIND it low 5px above floor, ankles almost share x. Foreground mesh must visibly cover far bare knee/shin. Preserve low nearly vertical pose, no raised knee.
Frame4 TOP ROW COLUMN4: mesh leg must be REAR SCREEN LEFT, bare leg must be FORWARD SCREEN RIGHT. Change rear left thigh to FISHNET+GOLD and forward right thigh to BARE+BLACK band. Rear mesh leg remains foreground even though behind pelvis in horizontal x. Near mesh rear heel rising; far bare forward foot low ahead just above floor.
Frame5 BOTTOM ROW COLUMN1: BOTH legs are incorrectly bare. Keep FORWARD screen-RIGHT leg bare+plain black band. REAR screen-LEFT leg must have the FISHNET THIGH and GOLD SQUARE BUCKLE, stay foreground. This is opposite foot contact to frame1 (frame1 mesh ahead, frame5 mesh behind). Same two boot shapes, toes right.
Frame6 BOTTOM ROW COLUMN2: BOTH thighs bare. Keep forward RIGHT supporting leg BARE+BLACK band, make rear LEFT swinging thigh FISHNET+GOLD buckle. Mesh foreground. Rear foot moves low towards pelvis; slightly lifted ankle about8px above floor, right-facing toe-right shoe not toes pointing at viewer. Do not send mesh leg forward prematurely.
Frame2 TOP ROW COLUMN2: keep mesh ahead supporting and bare rear swing, but rear boot only8px above floor and RIGHT-facing toe-right side profile.
Frame7 BOTTOM ROW COLUMN3 is nearly correct: Keep mesh near foreleg passing IN FRONT and bare far leg supporting behind it. Near mesh passing shoe only8px above floor and far bare shoe grounded, ankles near-coincident. Do not duplicate mesh on far leg.
Keep1 and8 with the SAME fishnet near leg forward/right and bare far leg rear/left. Very similar1/8 for loop seam. All cells have exactly one mesh+gold thigh in camera foreground and one bare+band thigh in background. Keep protective fist before chest, steady cautious right-facing gaze, one shuriken. No camera turn, no smoothing of art, no labels, no shadows or background.

## BackwardV11 full prompt

Use case: precise-object-edit. Make ONLY TWO small local leg-pose fixes in this exact 4x2 ninja sheet: top-row THIRD cell frame3 and bottom-row THIRD cell frame7. Preserve every other cell and every upper body pixel, waist, costume, face, weapon, scale, style and placement. Background stays true transparent alpha.
Permanent identity: only near L has mesh+gold buckle, far R is bare+black band. Mesh L is foreground in both cells and occludes bare R; never swap their decorations.
FRAME3: mesh near L is grounded SUPPORT under pelvis, its near shoe remains right-facing and near its existing location. Move far bare R swinging foot from the rear screen-left to DIRECTLY UNDER PELVIS BEHIND the mesh leg, within 8 pixels horizontally of mesh ankle. Far bare shin almost vertical behind near mesh shin, far bare ankle only 8px above floor. Far bare boot may be mostly hidden by near mesh shoe. This is an actual low crossing/pass with ankles almost coincident, NOT a foot stretched behind or folded knee.
FRAME7: bare far R grounded SUPPORT directly under pelvis. Bring mesh near L swinging shoe back from screen-right to DIRECTLY UNDER PELVIS IN FRONT of the bare shin, within 8 pixels horizontally of bare ankle. Mesh near knee/shin/boot foreground covers bare shin, mesh boot is 8px above floor; bare boot stays ground. Both lower legs nearly vertical. Do not raise the mesh knee. This is the opposite support low passing pose to frame3.
In both3/7 feet nearly OVERLAP directly below waist, toes RIGHT and heels LEFT. No high-knee marching and no split feet. Same hip height and leg lengths. Keep exactly one mesh/gold thigh and one bare/band thigh, mesh foreground. All other6 cells unchanged. No copied frame, no mirroring, no label/shadow/background.

Selected: source/ninja-backward-generated-v11.png. Visual frame-by-frame leg identity and loop review are in QA.md and gait-review.json. Source and full prompts retained; builder and preview pass.

