# Ninja forward review — 2026-10-06

Method: built-in image_gen, transparent_background=true. Reference design: ../../idle-01.png. Previous v3 source and prompts archived under source/. Prior statements implying camera-near/camera-far changes are superseded. L is mesh+gold and remains camera-near; R is bare+band and remains camera-far.

## V4 full prompt — rejected

Use case: identity-preserve.
Asset type: transparent game sprite sheet for an existing chibi female ninja, eight-pose forward walk loop.
Input images: image 1 is the canonical idle design reference; image 2 is the previous forward sheet edit target, with wrong walking poses. Preserve its detailed crisp sprite art, palette, costume, face, camera and sprite proportions.
Primary request: REDRAW THE LOWER BODY IN ALL EIGHT CELLS into a physically continuous walk. EXACTLY 4 columns by 2 rows, order 1 2 3 4 / 5 6 7 8. Each whole ninja isolated with transparent gutter; no labels, grid, shadows or background.
Character: dark brown ponytail with red ribbon and trailing red scarf, brown eyes, black face mask, black short tunic with gold piping, red waist belt, red laced black open-toe boots, small silver four-point shuriken in the same forward hand. Same face, head size and waist center every cell. Right-facing fixed 3/4 side camera, never rotate the torso between half cycles. Pelvis at same x inside each cell, restrained vertical bob (2–3 pixels at final sprite scale).
CRITICAL LEG IDENTITY: anatomical LEFT leg L is the camera-NEAR leg and has FISHNET STOCKING AND A GOLD SQUARE BUCKLE around the thigh/knee. Anatomical RIGHT leg R is the camera-FAR leg, has bare skin and a BLACK THIGH BAND. L remains near in ALL 8 poses. R remains far in ALL 8 poses. When they overlap L ALWAYS draws in front and hides R. DO NOT move the fishnet to the camera-far leg. This is not a camera turn: foot screen x changes but leg depth and decoration never do. All feet/toes point right. Fishnet and gold buckle are consistent across all cells.
Eight consecutive phases (front means screen-right, back means screen-left):
1: L FISHNET NEAR extended forward/right and touching ground; R BARE FAR extended rear/left on toe. This is left heel contact.
2: L near moves rearward toward under pelvis while supporting body. R far swings LOW from rear towards under body, slight toe lift.
3: TRUE LOW PASSING POSE: L fishnet near straight under pelvis supporting and grounded, R bare far passes BEHIND L under pelvis; ankles almost share x. R heel only a few pixels off floor. NO raised knee, no widely split feet, no knee kick.
4: L near now a little behind/left with heel rising; R far reaches low forward/right.
5: R BARE FAR is forward/right grounded and L FISHNET NEAR is back/left on toe. The fishnet rear leg must visibly remain camera-near, never hidden behind the bare leg. Opposite foot contact to frame 1.
6: R far supports and moves back toward under pelvis; L near swings LOW from rear towards under body.
7: TRUE LOW PASSING POSE: R bare far supporting under pelvis; L fishnet near passes IN FRONT of R under pelvis, ankles nearly share x and L foot is slightly off floor. Fishnet thigh/knee visibly foreground over bare leg. NO raised knee or widely split feet.
8: L FISHNET NEAR reaches forward/right just before contact, R BARE FAR goes rear/left with heel raised. Pose 8 is very close to pose 1 in leg x positions, upper body, identity and depth so the loop closes smoothly. L is visibly near at front, R far at back.
Style: match reference 2 crisp detailed hand-drawn pixel sprite with compact chibi anatomy. Keep waist, shoulders, shuriken, facial silhouette stable. Small scarf/hand rhythmic movement only. Eight distinct ORIGINAL poses, no copied pairs. Maintain same leg lengths, shoe size and anatomical joints.
Avoid: camera rotation, mirrored costume, bare near leg, mesh far leg, both legs having fishnet, changing hand holding weapon, duplicated contact poses, high knees, staccato jumping. Genuinely transparent background.

V4 rejected after visual inspection: frame 3 retained bare leg foreground occlusion, frame 6 jumps mesh leg forward early, and passing frames remain too high. It is preserved as source/ninja-forward-generated-v4-rejected.png and is not selected by layout.json.

## V5 full prompt

Use case: identity-preserve. Create a NEW transparent game sprite animation sheet using the attached ninja IDLE only for character design. Do NOT repeat her idle pose.
EXACT layout 4 columns x 2 rows, eight NEW consecutive walk drawings, top row 1 2 3 4 and bottom row 5 6 7 8. Each sprite whole, completely separate and evenly centered with broad transparent gutters. No text or grid. Crisp detailed chibi pixel-art at the reference resolution enlarged, never smooth vector.
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
Clothing decorations travel with the same anatomical leg. All open toes face RIGHT and boots never face viewer or LEFT. No high knees, no leaping. Small mild upper-body bob, stable waist and shoulders, rhythmic scarf. Frame3 and7 silhouette feet clustered beneath pelvis; frame1 and5 wide split with opposite patterned leg forward. Eight distinct original poses. True alpha transparent background with no floor shadow.

## V6 targeted repair full prompt

Use case: precise-object-edit. EDIT this exact 1774x887 4x2 ninja sheet. Keep every upper body, head, face, hair, scarf, shuriken, cell placement, palette and scale unchanged. Only fix LOWER LEGS and thigh costume in cells 2,3,4,6,7. Preserve all other artwork. True transparent alpha.
Leg identity is strict: the only FISHNET STOCKING + GOLD SQUARE BUCKLE is anatomical L, CAMERA-NEAR foreground. The R camera-far leg is BARE with a plain BLACK THIGH BAND, NEVER mesh or gold buckle. Both shoes right-facing open toes on screen-right, heels screen-left.
CELL3 (top row column3): there are accidentally TWO mesh stockings and TWO gold buckles. KEEP mesh/gold on the larger foreground leg at screen LEFT, standing under pelvis. REMOVE mesh and gold buckle from smaller background leg at screen RIGHT and replace ONLY that thigh with plain skin and black thigh band. This far bare leg is passing behind the mesh leg; ankle remains nearly coincident and 8px higher than grounded mesh ankle. Keep LOW nearly vertical legs, no lifted knee.
CELL7 (bottom row column3): same TWO-mesh error. KEEP mesh/gold on larger foreground leg at screen LEFT. REMOVE mesh/gold from thin background leg at screen RIGHT, replacing with bare thigh and plain black band. Make this the opposite passing phase: bare far boot supports under pelvis and touches ground; mesh near boot passes IN FRONT only 8px above floor, ankles almost share x. Mesh knee is foreground, never covered by bare. Both toes point RIGHT.
CELL4 (top row column4): correct the split stance by switching which decorated leg occupies each horizontal location. The REAR leg at SCREEN LEFT must be the NEAR mesh/gold leg, heel raised; the FORWARD leg at SCREEN RIGHT must be the FAR bare/black-band leg reaching low ahead. In this frame the mesh leg is behind the pelvis in x, but it still stays foreground in camera depth. Do not keep mesh at right/ahead. Both boots right-facing.
CELL6 (bottom row column2): rear screen-LEFT lifted thigh is missing its mesh and gold buckle. Make that thigh the NEAR mesh/gold leg and keep it behind-left, its foot swinging low forward towards hip. Foreground mesh thigh/shin in front of bare far leg. Keep forward/right grounded leg BARE with plain BLACK band and no mesh. Lower rear boot closer to floor (about 8px above floor), toes pointing RIGHT rather than down at viewer.
CELL2 (top row column2): retain near mesh/gold forward-support leg, far bare rear-swing leg. Lower rear swinging boot so ankle is only about 8px above floor, boot rotated to right-facing toe-right side profile instead of toes-down frontal shoe. Feet progress toward close passing stance in3.
ALL cells: exactly one mesh/gold leg and exactly one bare/band leg. Same hip and leg lengths. Smooth gait 1=Lmeshfront,3=lowLsupportRbehind,5=Rbarefront,7=lowRsupportLforeground,8=Lmeshfront ready for1. Do not change1,5,8 lower body or upper artwork in any cell. No labels, no background or shadow.

## ForwardV7 full prompt

Use case: precise-object-edit. Make ONE local fix only: bottom-row THIRD cell (frame7) LOWER BODY of this exact 4x2 transparent ninja sheet. Preserve the other seven cells pixel-for-pixel; preserve frame7 upper body, waist, scarf, face, shuriken, color/style, scale and placement. Keep canvas dimensions. No other modifications.
Frame7 currently has the mesh leg's foot far behind screen-left. That is wrong. Redraw only its legs into a TRUE LOW PASSING POSE under the pelvis, opposite support to frame3.
R camera-FAR BARE thigh with BLACK band: straight softly bent leg under the pelvis, boot GROUNDED directly under waist, toes RIGHT.
L camera-NEAR FISHNET thigh with GOLD SQUARE buckle: swings LOW forward, thigh/knee stays foreground, shin/boot passes IN FRONT of far bare shin. Its ankle must be at almost the SAME HORIZONTAL X as supporting bare ankle and only 8 pixels above floor. Both boots almost overlap directly under waist; NO foot remaining stretched rear-left. Mesh knee/shin/boot foreground covers part of bare leg. Mesh stocking/gold buckle remain only on L, bare black band only on R.
This is a relaxed walking passing phase, NOT high-knee marching, NOT widely split legs. Both knees remain low, legs nearly vertical, right-facing feet. Upper body size and waist anchor fixed. Eight genuine distinct poses; do NOT paste or clone frame3. Draw a new opposite-support passing pose. Background remains true transparent alpha with no text or shadow.

## ForwardV8 full prompt

Use case: precise-object-edit. Image1 is EDIT TARGET, existing ninja 4x2 transparent eight-frame sheet. Image2 is a skeletal pose guide ONLY, not a design or color reference. Make ONE local repair: LOWER BODY OF FRAME7, bottom row third cell, using guide frame7 for low passing pose and occlusion. KEEP the other7 ninja cells and all upper bodies exactly unchanged.
Frame7 must follow guide: left near leg (green in guide) corresponds to ninja FISHNET+GOLD BUCKLE, right far leg (blue guide) corresponds to ninja BARE+BLACK thigh band. DO NOT copy green/blue/grey colors, only use the pose. Preserve black/red/gold ninja artwork.
Current ninja frame7 mesh ankle is too far left of bare ankle. Move mesh near ankle/shoe approximately 40 pixels RIGHT in this 1774px-wide target, directly in front of the supporting bare ankle UNDER THE PELVIS. Ankle x separation must be at most8 SOURCE pixels (about3 at final sprite size), not40. Mesh near shoe remains 8 source pixels ABOVE bare supporting shoe. Foot toe on RIGHT, heel LEFT. Near mesh shin and boot cross IN FRONT of far bare shin and boot, hiding part of them.
Bare far leg supports grounded directly under pelvis, almost vertical. Near mesh thigh/knee/shin swings LOW forward in front of it. Knees low, no high knee. Both feet nearly superimposed under waist as guide7. Same leg lengths and waist position, exactly one mesh/gold leg and one bare/band leg. Do not paste frame3: new opposite-support pose7.
Leave frame1/2/3/4/5/6/8 pixel artwork untouched. Preserve all faces, masks, hands, scarf, weapon and transparency. No text, shadow, grid or background.

## ForwardV9 full prompt

Use case: precise-object-edit. Image1 is the EDIT TARGET: 4x2 eight-frame ninja forward sheet. Image2 is ONLY a LEG POSE reference for frame7; do not copy its guarding arms, face or upper body.
Modify ONLY LOWER BODY in image1 FRAME7 (bottom row third cell). Replace the whole two-leg pose there with the LOW PASSING arrangement seen in image2, redrawn to match image1 ninja size and style. Keep every other cell and every upper body unchanged.
Image2 shows the correct arrangement: foreground mesh+gold left thigh directly under pelvis, mesh knee/shin/boot IN FRONT OF the far bare shin; mesh boot's heel around same x as far bare boot's heel. The mesh shoe is a few pixels above the ground, with bare supporting boot visible lower BEHIND it. Ankles almost coincide, NOT side-by-side. Toe of mesh boot extends to RIGHT beyond bare shin, mesh heel NOT left of the bare leg.
Current image1 frame7 has mesh boot screen-left beside bare supporting shoe. REMOVE that foot location and draw mesh boot centered OVER THE FAR BARE SHIN/BOOT, under waist, like reference2. Far bare shoe stays ground under waist. No knee raised high. Mesh thigh and gold buckle stay foreground, one of each, bare far thigh has only black band.
The two boots overlap in depth. Mesh near boot should hide most of the bare far shin/upper shoe; bare far heel/toe may peek below. Both toes face RIGHT and heels LEFT. Use image2 lower-body relationship only, don't paste a copy: newly draw a forward passing phase with unchanged upper body and waist.
All other7 poses, hair, mask, scarf, hand/shuriken, cell placements, palette, anatomy and canvas size stay unchanged. True alpha transparent background, no text/shadows/grid.

V7 and V8 were not selected because the near mesh ankle in frame7 remained left of the far support ankle. V9 uses a cropped backward passing pose only as a lower-body pose relationship reference; all forward upper-body artwork and the other seven poses remain the edit target.

Selected: source/ninja-forward-generated-v9.png. See QA.md, ninja-forward-qa.png, ninja-forward-leg-qa.png and gait-review.json for all eight frame identities and occlusion evidence. Builder/preview pass; final check-motion-assets.cjs ninja passes five motions, 25 frames. Root independently accepted the frame7 low passing overlap with approximately 12px ankle-center separation, and verified opposite contacts at1/5 and near mesh leg in8.
