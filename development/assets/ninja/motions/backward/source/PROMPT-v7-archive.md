# Ninja backward 8-frame loop

Method: built-in image_gen, transparent_background=true. Identity reference: ../../idle-01.png. Eight chronological distinct source poses in 4 columns by 2 rows. Old sources retained. Forward v2 rejected for costume swaps; selected v3. Backward v3 rejected for nonalternating support; its apparent background was hidden RGB under transparent alpha. V4 full generation prompt below, followed by targeted v5-v7 edits; v7 is selected.

## Full current prompt

Create exactly eight DISTINCT sequential frames of a seamless guarded BACKWARDS walk loop, 4 columns × 2 rows, on an actual alpha TRANSPARENT background. No painted background, no dark red gradient, no environment, glow or floor shadow. Reference is character identity only, not a pose to repeat.
Same black-haired masked female chibi ninja, red bow/scarf/belt, black gold-trim outfit, ONE silver shuriken in SAME front hand as reference. Empty rear fist held at chest in a protective guard, eyes watch screen RIGHT. Body faces RIGHT while stepping cautiously BACKWARDS towards LEFT. Knees bent, low stable guard, small steps.
NEAR leg ALWAYS has NETTED THIGH AND GOLD BUCKLE; FAR leg ALWAYS has BARE THIGH AND BLACK BAND. Never swap these outfit details. The legs alternate support; never repeat the same front-leg-back-leg stance for all frames.
Both open-toed black/red boots always point RIGHT: heel left, toes right. Lifted boots stay pointing right, no twisted front-facing sole or left-facing foot.
Eight proper successive drawings, not tiny variations of same stance:
TOP ROW left to right:
1 NEAR NETTED leg extends BACKWARDS LEFT of hip and contacts, FAR BARE leg ahead RIGHT grounded.
2 NEAR NETTED leg takes weight at left, FAR BARE heel lifts at right.
3 NEAR NETTED leg supports directly UNDER hip, FAR BARE foot lifts close beside support ankle passing BACKWARDS towards left.
4 FAR BARE foot extends airborne BACKWARDS LEFT, NEAR NETTED foot remains grounded ahead RIGHT.
BOTTOM ROW left to right:
5 FAR BARE leg extends BACKWARDS LEFT of hip and contacts, NEAR NETTED leg ahead RIGHT grounded. This is the OPPOSITE support from frame 1. Netted leg is now right, bare leg now left.
6 FAR BARE leg takes weight at left, NEAR NETTED heel lifts at right.
7 FAR BARE leg supports directly UNDER hip, NEAR NETTED foot lifts close beside support ankle passing BACKWARDS towards left.
8 NEAR NETTED foot extends airborne BACKWARDS LEFT, FAR BARE foot grounded ahead RIGHT. Leads naturally into frame 1.
Fixed local pelvis horizontal position and identical character height in every cell. Small gentle body bob and modest ribbon follow-through. Protective upper-body guard remains stable all 8 frames. Crisp detailed pixel-art style of reference, same head, costume, weapon, shoe size. Four evenly spaced columns and two rows with complete silhouette and generous clear gutters around all sprites. No text, numbers, labels, grid, watermark, scenery or background of ANY color. True transparent alpha.

## QA

Generated source will be inspected for shoe orientation, fixed leg costume identity, alternating support, full silhouettes, transparency, baseline, pelvis anchors and eight distinct poses.


## V5 targeted repair full prompt

Use case: precise-object-edit + background-extraction.
EDIT TARGET is Image 1, the 4-column × 2-row eight-pose ninja sprite sheet. Make only TWO fixes:
FIX 1, most important: remove ALL of the red-black painted background from the entire canvas, replacing it with TRUE transparent alpha pixels. The transparent result contains ONLY the eight ninja silhouettes. No replacement background, no checkerboard painted into image, no solid black background, no floor, no shadows. Preserve all hair ribbons and weapon edges. Keep all eight cells and original canvas size.
FIX 2: In TOP LEFT cell only, redraw the legs to exchange their support. The NEAR leg identifiable by NETTED thigh and GOLD buckle must stretch behind towards screen LEFT with foot planted. The FAR bare-thigh black-band leg must stand ahead on screen RIGHT. Both feet point RIGHT, heel left and open toes right. This will be opposite from BOTTOM LEFT contact pose. Keep exactly two legs, consistent costume details on their anatomical leg. Do not alter the other seven leg poses or their boots.
Preserve ALL eight upper bodies, face size, red ribbons, black/red/gold ninja costume, alert right-facing gaze, protective empty fist, single silver shuriken, position, body scale and crisp pixel illustration exactly. Four columns × two rows, eight distinct poses, complete silhouettes and clear transparent gutters. No text, numbers or other changes.

## V6 background extraction full prompt

Remove the background. Keep all eight ninja characters exactly as they are. Output a clean cutout sprite sheet with a transparent background and alpha channel. The dark reddish backdrop must be completely removed, including between limbs and between all eight sprites. Do not add anything.

## V7 layout repair full prompt

Edit this existing eight-frame ninja sprite sheet for production cropping. Preserve all eight distinct character poses and all artwork details. Uniformly scale every character to 80% of its current size and recenter each in its own evenly spaced cell, 4 columns by 2 rows. This creates broad transparent gutters around each complete character, including ponytail, ribbons, silver shuriken and both boots. Finish the missing rightmost tips of the silver shuriken in the last column so that the entire weapon is visible. Every cell must have at least 25 transparent pixels of margin on all sides; no silhouette can cross a cell boundary or touch the canvas edge. Same guarded right-facing ninja, netted/buckle leg and bare/band leg keep the exact existing poses; don't change their anatomy, costume or animation phase. Keep all eight faces and body scale identical. Output genuine transparent alpha with only the isolated sprites visible; remove background fully, no replacement background. No text, grid, shadow or labels.

Final QA: selected source v7. PNG alpha inspection verified transparent backdrop; red-black hues reside in alpha=0 pixels and the view_image renderer displays hidden RGB. A flattened QA contact sheet confirms the usable transparency. V7 completes the rightmost shuriken and adds adequate gutters. Manual source rectangle boundaries use alpha-clear columns at x=405, 785, 1164 and row y=520. Source pose order is 1,3,2,4,5,7,6,8 so airborne feet first pass the hip and then extend left into backward contact. Manual pelvis X anchors reduce jitter. Eight distinct 256x224 PNGs and 2048x224 packed sheet rebuilt with y=207 baseline. Guarded empty fist stays before chest, face watches right, shuriken remains in the same forward hand. Netted vs bare thigh and boot toes stay consistent. Minor illustration-style smoothing vs idle remains from iterative edits; downsampling retains readable pixel scale. Both builder and preview checks pass; check-motion-assets.cjs ninja passes all five motions, 25 frames, including true alpha/margins/packing/pivots/GIF timing. Backward is eight 90ms frames, 720ms loop. Forward is eight 80ms frames, 640ms loop. No interpolation, duplicate-frame padding, mirroring, or code repainting used.

