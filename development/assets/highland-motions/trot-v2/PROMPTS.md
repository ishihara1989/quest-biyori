# 座標ガイド版trotの生成指定

2026-10-13。組み込み `image_gen`。旧版を保持し、固定基準・投影ガイドによる6コマ生成、足先の重ね合わせガイドによる修正、1〜2本だけに絞った修正を試した。

採用する比較試作は①②が後脚限定修正版、③〜⑥が初回ガイド版。計算軌道の座標に完全一致した画像ではない。複数脚の同時修正で支持脚・脚数が崩れたもの、前脚の手前／奥が崩れたものは不採用とする。

## FRAME 1 / initial / superseded-by-hind-refinement

```text
Use case: precise-object-edit. Generate one replacement full-body manticore pose for an in-place six-frame TROT. Image1 is the EDIT TARGET and FIXED BODY master, 1375x1144 transparent canvas. Image2 is a mathematically calculated pose guide in the SAME pixel coordinates; use its four colored limbs and paw-bottom markers to position legs, never copy its graphics. Image3 is the canonical design/color reference ONLY. Keep image1's head, face, mane, torso, wing silhouette, tail, colors, scale, eye landmark approximately (176,414), and all body position unchanged. All frames face LEFT in the identical three-quarter view. Change only legs below fixed shoulders/hips.
Guide codes: LF = bright large NEAR/foreground LEFT FRONT leg; RF = smaller dark FAR/background RIGHT FRONT; LH = bright large NEAR LEFT HIND attached to visible foreground hip; RH = small dark FAR RIGHT HIND behind LH. Exactly four anatomical legs; a far paw may be occluded by a near paw. Do NOT pull a far leg into empty space just to show it. Do NOT keep old paws in addition to repositioned paws. Depth order far legs behind near legs. Maintain thick lion leg anatomy and gold-black-purple ankle armor; guide sticks are limb centerlines, not thin actual legs. Paw marker is the BOTTOM CENTER of the claw tips, NOT ankle or foot center. Near foot footprint roughly 96x54 pixels, far footprint 72x42px. Real transparent alpha; no diagram, colored markers, text, grid, shadow, background, FX or trails in output. Full horns/wings/tail inside margins. Maintain EXACT image1 canvas size and body scale; do not scale or recenter it to fit feet.
FRAME 1/6: Foot-bottom centers in 1375x1144 canvas MUST be:
LF: x=409.9, y=1061.1, GROUND
RF: x=341.5, y=956.5, LIFT
LH: x=898.5, y=952.9, LIFT
RH: x=830.1, y=978.9, GROUND
Respect numerical target positions within about 15px. Follow image2's rooted limb/joint topology while retaining image1's lion anatomy. Foot-bottom X positions in frames2 and3 are identical; only contact/lift changes. Do not exaggerate stride.
```

原画: `trot-v2/sources/frame-1-generated.png`

## FRAME 2 / initial / superseded-by-hind-refinement

```text
Use case: precise-object-edit. Generate one replacement full-body manticore pose for an in-place six-frame TROT. Image1 is the EDIT TARGET and FIXED BODY master, 1375x1144 transparent canvas. Image2 is a mathematically calculated pose guide in the SAME pixel coordinates; use its four colored limbs and paw-bottom markers to position legs, never copy its graphics. Image3 is the canonical design/color reference ONLY. Keep image1's head, face, mane, torso, wing silhouette, tail, colors, scale, eye landmark approximately (176,414), and all body position unchanged. All frames face LEFT in the identical three-quarter view. Change only legs below fixed shoulders/hips.
Guide codes: LF = bright large NEAR/foreground LEFT FRONT leg; RF = smaller dark FAR/background RIGHT FRONT; LH = bright large NEAR LEFT HIND attached to visible foreground hip; RH = small dark FAR RIGHT HIND behind LH. Exactly four anatomical legs; a far paw may be occluded by a near paw. Do NOT pull a far leg into empty space just to show it. Do NOT keep old paws in addition to repositioned paws. Depth order far legs behind near legs. Maintain thick lion leg anatomy and gold-black-purple ankle armor; guide sticks are limb centerlines, not thin actual legs. Paw marker is the BOTTOM CENTER of the claw tips, NOT ankle or foot center. Near foot footprint roughly 96x54 pixels, far footprint 72x42px. Real transparent alpha; no diagram, colored markers, text, grid, shadow, background, FX or trails in output. Full horns/wings/tail inside margins. Maintain EXACT image1 canvas size and body scale; do not scale or recenter it to fit feet.
FRAME 2/6: Foot-bottom centers in 1375x1144 canvas MUST be:
LF: x=466.8, y=1056.5, GROUND
RF: x=289.4, y=991.9, LIFT
LH: x=846.4, y=991.3, LIFT
RH: x=865.9, y=975.9, GROUND
RH and LH almost overlap: RH is BEHIND LH, nearly hidden. The far hind toe can be a small glimpse behind the near hind paw, NOT a separate rearward stretched leg. RH x866 is only 36px rearward of its neutral x830, not an exaggerated sweep.
Respect numerical target positions within about 15px. Follow image2's rooted limb/joint topology while retaining image1's lion anatomy. Foot-bottom X positions in frames2 and3 are identical; only contact/lift changes. Do not exaggerate stride.
```

原画: `trot-v2/sources/frame-2-generated.png`

## FRAME 3 / initial / selected-in-comparison

```text
Use case: precise-object-edit. Generate one replacement full-body manticore pose for an in-place six-frame TROT. Image1 is the EDIT TARGET and FIXED BODY master, 1375x1144 transparent canvas. Image2 is a mathematically calculated pose guide in the SAME pixel coordinates; use its four colored limbs and paw-bottom markers to position legs, never copy its graphics. Image3 is the canonical design/color reference ONLY. Keep image1's head, face, mane, torso, wing silhouette, tail, colors, scale, eye landmark approximately (176,414), and all body position unchanged. All frames face LEFT in the identical three-quarter view. Change only legs below fixed shoulders/hips.
Guide codes: LF = bright large NEAR/foreground LEFT FRONT leg; RF = smaller dark FAR/background RIGHT FRONT; LH = bright large NEAR LEFT HIND attached to visible foreground hip; RH = small dark FAR RIGHT HIND behind LH. Exactly four anatomical legs; a far paw may be occluded by a near paw. Do NOT pull a far leg into empty space just to show it. Do NOT keep old paws in addition to repositioned paws. Depth order far legs behind near legs. Maintain thick lion leg anatomy and gold-black-purple ankle armor; guide sticks are limb centerlines, not thin actual legs. Paw marker is the BOTTOM CENTER of the claw tips, NOT ankle or foot center. Near foot footprint roughly 96x54 pixels, far footprint 72x42px. Real transparent alpha; no diagram, colored markers, text, grid, shadow, background, FX or trails in output. Full horns/wings/tail inside margins. Maintain EXACT image1 canvas size and body scale; do not scale or recenter it to fit feet.
FRAME 3/6: Foot-bottom centers in 1375x1144 canvas MUST be:
LF: x=466.8, y=1019.5, LIFT
RF: x=289.4, y=1023.1, GROUND
LH: x=846.4, y=1025.4, GROUND
RH: x=865.9, y=946.7, LIFT
Respect numerical target positions within about 15px. Follow image2's rooted limb/joint topology while retaining image1's lion anatomy. Foot-bottom X positions in frames2 and3 are identical; only contact/lift changes. Do not exaggerate stride.
```

原画: `trot-v2/sources/frame-3-generated.png`

## FRAME 4 / initial / selected-in-comparison

```text
Use case: precise-object-edit. Generate one replacement full-body manticore pose for an in-place six-frame TROT. Image1 is the EDIT TARGET and FIXED BODY master, 1375x1144 transparent canvas. Image2 is a mathematically calculated pose guide in the SAME pixel coordinates; use its four colored limbs and paw-bottom markers to position legs, never copy its graphics. Image3 is the canonical design/color reference ONLY. Keep image1's head, face, mane, torso, wing silhouette, tail, colors, scale, eye landmark approximately (176,414), and all body position unchanged. All frames face LEFT in the identical three-quarter view. Change only legs below fixed shoulders/hips.
Guide codes: LF = bright large NEAR/foreground LEFT FRONT leg; RF = smaller dark FAR/background RIGHT FRONT; LH = bright large NEAR LEFT HIND attached to visible foreground hip; RH = small dark FAR RIGHT HIND behind LH. Exactly four anatomical legs; a far paw may be occluded by a near paw. Do NOT pull a far leg into empty space just to show it. Do NOT keep old paws in addition to repositioned paws. Depth order far legs behind near legs. Maintain thick lion leg anatomy and gold-black-purple ankle armor; guide sticks are limb centerlines, not thin actual legs. Paw marker is the BOTTOM CENTER of the claw tips, NOT ankle or foot center. Near foot footprint roughly 96x54 pixels, far footprint 72x42px. Real transparent alpha; no diagram, colored markers, text, grid, shadow, background, FX or trails in output. Full horns/wings/tail inside margins. Maintain EXACT image1 canvas size and body scale; do not scale or recenter it to fit feet.
FRAME 4/6: Foot-bottom centers in 1375x1144 canvas MUST be:
LF: x=409.9, y=987.1, LIFT
RF: x=341.5, y=1018.9, GROUND
LH: x=898.5, y=1021.1, GROUND
RH: x=830.1, y=920.4, LIFT
Respect numerical target positions within about 15px. Left front LF smoothly advances left from frame3 x467 to frame4 x410 to frame5 x353; do NOT hold frame4 at frame3's x467, and do NOT exaggerate frame5 to far-left x170. RF and LF can overlap in screen projection but RF always stays BEHIND LF. Smaller far hind RH stays under hip near x800, never stretched behind tail. Foot-bottom X positions in frames5 and6 are identical; only contact/lift changes. Follow image2's fixed-root limb/joint topology with image1 lion anatomy.
```

原画: `trot-v2/sources/frame-4-generated.png`

## FRAME 5 / initial / selected-in-comparison

```text
Use case: precise-object-edit. Generate one replacement full-body manticore pose for an in-place six-frame TROT. Image1 is the EDIT TARGET and FIXED BODY master, 1375x1144 transparent canvas. Image2 is a mathematically calculated pose guide in the SAME pixel coordinates; use its four colored limbs and paw-bottom markers to position legs, never copy its graphics. Image3 is the canonical design/color reference ONLY. Keep image1's head, face, mane, torso, wing silhouette, tail, colors, scale, eye landmark approximately (176,414), and all body position unchanged. All frames face LEFT in the identical three-quarter view. Change only legs below fixed shoulders/hips.
Guide codes: LF = bright large NEAR/foreground LEFT FRONT leg; RF = smaller dark FAR/background RIGHT FRONT; LH = bright large NEAR LEFT HIND attached to visible foreground hip; RH = small dark FAR RIGHT HIND behind LH. Exactly four anatomical legs; a far paw may be occluded by a near paw. Do NOT pull a far leg into empty space just to show it. Do NOT keep old paws in addition to repositioned paws. Depth order far legs behind near legs. Maintain thick lion leg anatomy and gold-black-purple ankle armor; guide sticks are limb centerlines, not thin actual legs. Paw marker is the BOTTOM CENTER of the claw tips, NOT ankle or foot center. Near foot footprint roughly 96x54 pixels, far footprint 72x42px. Real transparent alpha; no diagram, colored markers, text, grid, shadow, background, FX or trails in output. Full horns/wings/tail inside margins. Maintain EXACT image1 canvas size and body scale; do not scale or recenter it to fit feet.
FRAME 5/6: Foot-bottom centers in 1375x1144 canvas MUST be:
LF: x=352.9, y=1028.8, LIFT
RF: x=393.6, y=1014.6, GROUND
LH: x=950.6, y=1016.9, GROUND
RH: x=794.3, y=952.6, LIFT
Respect numerical target positions within about 15px. Left front LF smoothly advances left from frame3 x467 to frame4 x410 to frame5 x353; do NOT hold frame4 at frame3's x467, and do NOT exaggerate frame5 to far-left x170. RF and LF can overlap in screen projection but RF always stays BEHIND LF. Smaller far hind RH stays under hip near x800, never stretched behind tail. Foot-bottom X positions in frames5 and6 are identical; only contact/lift changes. Follow image2's fixed-root limb/joint topology with image1 lion anatomy.
```

原画: `trot-v2/sources/frame-5-generated.png`

## FRAME 6 / initial / selected-in-comparison

```text
Use case: precise-object-edit. Generate one replacement full-body manticore pose for an in-place six-frame TROT. Image1 is the EDIT TARGET and FIXED BODY master, 1375x1144 transparent canvas. Image2 is a mathematically calculated pose guide in the SAME pixel coordinates; use its four colored limbs and paw-bottom markers to position legs, never copy its graphics. Image3 is the canonical design/color reference ONLY. Keep image1's head, face, mane, torso, wing silhouette, tail, colors, scale, eye landmark approximately (176,414), and all body position unchanged. All frames face LEFT in the identical three-quarter view. Change only legs below fixed shoulders/hips.
Guide codes: LF = bright large NEAR/foreground LEFT FRONT leg; RF = smaller dark FAR/background RIGHT FRONT; LH = bright large NEAR LEFT HIND attached to visible foreground hip; RH = small dark FAR RIGHT HIND behind LH. Exactly four anatomical legs; a far paw may be occluded by a near paw. Do NOT pull a far leg into empty space just to show it. Do NOT keep old paws in addition to repositioned paws. Depth order far legs behind near legs. Maintain thick lion leg anatomy and gold-black-purple ankle armor; guide sticks are limb centerlines, not thin actual legs. Paw marker is the BOTTOM CENTER of the claw tips, NOT ankle or foot center. Near foot footprint roughly 96x54 pixels, far footprint 72x42px. Real transparent alpha; no diagram, colored markers, text, grid, shadow, background, FX or trails in output. Full horns/wings/tail inside margins. Maintain EXACT image1 canvas size and body scale; do not scale or recenter it to fit feet.
FRAME 6/6: Foot-bottom centers in 1375x1144 canvas MUST be:
LF: x=352.9, y=1065.8, GROUND
RF: x=393.6, y=983.4, LIFT
LH: x=950.6, y=982.8, LIFT
RH: x=794.3, y=981.8, GROUND
Respect numerical target positions within about 15px. Left front LF smoothly advances left from frame3 x467 to frame4 x410 to frame5 x353; do NOT hold frame4 at frame3's x467, and do NOT exaggerate frame5 to far-left x170. RF and LF can overlap in screen projection but RF always stays BEHIND LF. Smaller far hind RH stays under hip near x800, never stretched behind tail. Foot-bottom X positions in frames5 and6 are identical; only contact/lift changes. Follow image2's fixed-root limb/joint topology with image1 lion anatomy.
```

原画: `trot-v2/sources/frame-6-generated.png`

## FRAME 1 / multi-paw-correction / rejected-support-or-anatomy

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET: one existing transparent manticore animation frame. Image2 is a correction overlay of that EXACT same picture with colored target footprint outlines. Replace ONLY four existing leg/paw shapes to place them inside the target footprints. Keep every above-leg detail from image1 unchanged: face/mane/torso/hips/wings/tail, all colors, identical camera, canvas 1375x1144 and scale. Do not darken output to image2's faded guide. Transparent background, no guide markings/text/shadows.
Codes: LF yellow = LARGE foreground/near FRONT paw; RF blue = SMALL background/far FRONT paw; LH pink = LARGE foreground/near HIND paw, connected to visible hip; RH green = SMALL background/far HIND paw behind LH. Exactly FOUR anatomical paws. Existing paw is MOVED/REPLACED, not retained alongside a new paw. Far paws can be occluded. The cross marks FOOT BOTTOM, the oval above it is the whole paw region.
FRAME 1. Required local corrections in source pixels:
RF: current approximate paw bottom (290, 922); relocate bottom center to (341.5, 956.5), shift RIGHT 51px and DOWN 35px. Follow the matching colored oval in image2.
RH: current approximate paw bottom (700, 965); relocate bottom center to (830.1, 978.9), shift RIGHT 130px and DOWN 14px. Follow the matching colored oval in image2.
LF: current approximate paw bottom (342, 1097); relocate bottom center to (409.9, 1061.1), shift RIGHT 68px and UP 36px. Follow the matching colored oval in image2.
LH: current approximate paw bottom (961, 956); relocate bottom center to (898.5, 952.9), shift LEFT 62px and UP 3px. Follow the matching colored oval in image2.
Preserve actual rooted limb identity, adjust the leg joint bend to reach these new points, and keep the gold-purple-black ankle armor. Body never moves. Far hind must stay near the near hind, not stretched back beyond tail. In frame2 RH is almost completely HIDDEN BEHIND LH and can show only a small dark claw glimpse. Left front needs modest stride (x467→410→353 in frames3→4→5). Target footprints take priority over the previous leg poses. No extra paw/arm. Keep canonical warm red fur/purple wings; preserve original image1 shading.
```

原画: `trot-v2/sources/rejected/frame-1-multi-paw.png`

## FRAME 2 / multi-paw-correction / no-successful-output

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET: one existing transparent manticore animation frame. Image2 is a correction overlay of that EXACT same picture with colored target footprint outlines. Replace ONLY four existing leg/paw shapes to place them inside the target footprints. Keep every above-leg detail from image1 unchanged: face/mane/torso/hips/wings/tail, all colors, identical camera, canvas 1375x1144 and scale. Do not darken output to image2's faded guide. Transparent background, no guide markings/text/shadows.
Codes: LF yellow = LARGE foreground/near FRONT paw; RF blue = SMALL background/far FRONT paw; LH pink = LARGE foreground/near HIND paw, connected to visible hip; RH green = SMALL background/far HIND paw behind LH. Exactly FOUR anatomical paws. Existing paw is MOVED/REPLACED, not retained alongside a new paw. Far paws can be occluded. The cross marks FOOT BOTTOM, the oval above it is the whole paw region.
FRAME 2. Required local corrections in source pixels:
RF: current approximate paw bottom (160, 913); relocate bottom center to (289.4, 991.9), shift RIGHT 129px and DOWN 79px. Follow the matching colored oval in image2.
RH: current approximate paw bottom (881, 999); relocate bottom center to (865.9, 975.9), shift LEFT 15px and UP 23px. Follow the matching colored oval in image2.
LF: current approximate paw bottom (356, 1082); relocate bottom center to (466.8, 1056.5), shift RIGHT 111px and UP 26px. Follow the matching colored oval in image2.
LH: current approximate paw bottom (891, 942); relocate bottom center to (846.4, 991.3), shift LEFT 45px and DOWN 49px. Follow the matching colored oval in image2.
Preserve actual rooted limb identity, adjust the leg joint bend to reach these new points, and keep the gold-purple-black ankle armor. Body never moves. Far hind must stay near the near hind, not stretched back beyond tail. In frame2 RH is almost completely HIDDEN BEHIND LH and can show only a small dark claw glimpse. Left front needs modest stride (x467→410→353 in frames3→4→5). Target footprints take priority over the previous leg poses. No extra paw/arm. Keep canonical warm red fur/purple wings; preserve original image1 shading.
```

No successful output captured for this concurrent generation.

## FRAME 3 / multi-paw-correction / no-successful-output

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET: one existing transparent manticore animation frame. Image2 is a correction overlay of that EXACT same picture with colored target footprint outlines. Replace ONLY four existing leg/paw shapes to place them inside the target footprints. Keep every above-leg detail from image1 unchanged: face/mane/torso/hips/wings/tail, all colors, identical camera, canvas 1375x1144 and scale. Do not darken output to image2's faded guide. Transparent background, no guide markings/text/shadows.
Codes: LF yellow = LARGE foreground/near FRONT paw; RF blue = SMALL background/far FRONT paw; LH pink = LARGE foreground/near HIND paw, connected to visible hip; RH green = SMALL background/far HIND paw behind LH. Exactly FOUR anatomical paws. Existing paw is MOVED/REPLACED, not retained alongside a new paw. Far paws can be occluded. The cross marks FOOT BOTTOM, the oval above it is the whole paw region.
FRAME 3. Required local corrections in source pixels:
RF: current approximate paw bottom (168, 1015); relocate bottom center to (289.4, 1023.1), shift RIGHT 121px and DOWN 8px. Follow the matching colored oval in image2.
RH: current approximate paw bottom (752, 915); relocate bottom center to (865.9, 946.7), shift RIGHT 114px and DOWN 32px. Follow the matching colored oval in image2.
LF: current approximate paw bottom (387, 1003); relocate bottom center to (466.8, 1019.5), shift RIGHT 80px and DOWN 16px. Follow the matching colored oval in image2.
LH: current approximate paw bottom (924, 1049); relocate bottom center to (846.4, 1025.4), shift LEFT 78px and UP 24px. Follow the matching colored oval in image2.
Preserve actual rooted limb identity, adjust the leg joint bend to reach these new points, and keep the gold-purple-black ankle armor. Body never moves. Far hind must stay near the near hind, not stretched back beyond tail. In frame2 RH is almost completely HIDDEN BEHIND LH and can show only a small dark claw glimpse. Left front needs modest stride (x467→410→353 in frames3→4→5). Target footprints take priority over the previous leg poses. No extra paw/arm. Keep canonical warm red fur/purple wings; preserve original image1 shading.
```

No successful output captured for this concurrent generation.

## FRAME 4 / multi-paw-correction / rejected-support-or-anatomy

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET: one existing transparent manticore animation frame. Image2 is a correction overlay of that EXACT same picture with colored target footprint outlines. Replace ONLY four existing leg/paw shapes to place them inside the target footprints. Keep every above-leg detail from image1 unchanged: face/mane/torso/hips/wings/tail, all colors, identical camera, canvas 1375x1144 and scale. Do not darken output to image2's faded guide. Transparent background, no guide markings/text/shadows.
Codes: LF yellow = LARGE foreground/near FRONT paw; RF blue = SMALL background/far FRONT paw; LH pink = LARGE foreground/near HIND paw, connected to visible hip; RH green = SMALL background/far HIND paw behind LH. Exactly FOUR anatomical paws. Existing paw is MOVED/REPLACED, not retained alongside a new paw. Far paws can be occluded. The cross marks FOOT BOTTOM, the oval above it is the whole paw region.
FRAME 4. Required local corrections in source pixels:
RF: current approximate paw bottom (418, 996); relocate bottom center to (341.5, 1018.9), shift LEFT 77px and DOWN 23px. Follow the matching colored oval in image2.
RH: current approximate paw bottom (742, 929); relocate bottom center to (830.1, 920.4), shift RIGHT 88px and UP 9px. Follow the matching colored oval in image2.
LF: current approximate paw bottom (247, 985); relocate bottom center to (409.9, 987.1), shift RIGHT 163px and DOWN 2px. Follow the matching colored oval in image2.
LH: current approximate paw bottom (950, 1049); relocate bottom center to (898.5, 1021.1), shift LEFT 51px and UP 28px. Follow the matching colored oval in image2.
Preserve actual rooted limb identity, adjust the leg joint bend to reach these new points, and keep the gold-purple-black ankle armor. Body never moves. Far hind must stay near the near hind, not stretched back beyond tail. In frame2 RH is almost completely HIDDEN BEHIND LH and can show only a small dark claw glimpse. Left front needs modest stride (x467→410→353 in frames3→4→5). Target footprints take priority over the previous leg poses. No extra paw/arm. Keep canonical warm red fur/purple wings; preserve original image1 shading.
```

原画: `trot-v2/sources/rejected/frame-4-multi-paw.png`

## FRAME 5 / multi-paw-correction / rejected-support-or-anatomy

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET: one existing transparent manticore animation frame. Image2 is a correction overlay of that EXACT same picture with colored target footprint outlines. Replace ONLY four existing leg/paw shapes to place them inside the target footprints. Keep every above-leg detail from image1 unchanged: face/mane/torso/hips/wings/tail, all colors, identical camera, canvas 1375x1144 and scale. Do not darken output to image2's faded guide. Transparent background, no guide markings/text/shadows.
Codes: LF yellow = LARGE foreground/near FRONT paw; RF blue = SMALL background/far FRONT paw; LH pink = LARGE foreground/near HIND paw, connected to visible hip; RH green = SMALL background/far HIND paw behind LH. Exactly FOUR anatomical paws. Existing paw is MOVED/REPLACED, not retained alongside a new paw. Far paws can be occluded. The cross marks FOOT BOTTOM, the oval above it is the whole paw region.
FRAME 5. Required local corrections in source pixels:
RF: current approximate paw bottom (394, 1011); relocate bottom center to (393.6, 1014.6), shift LEFT 0px and DOWN 4px. Follow the matching colored oval in image2.
RH: current approximate paw bottom (742, 934); relocate bottom center to (794.3, 952.6), shift RIGHT 52px and DOWN 19px. Follow the matching colored oval in image2.
LF: current approximate paw bottom (192, 972); relocate bottom center to (352.9, 1028.8), shift RIGHT 161px and DOWN 57px. Follow the matching colored oval in image2.
LH: current approximate paw bottom (1020, 1045); relocate bottom center to (950.6, 1016.9), shift LEFT 69px and UP 28px. Follow the matching colored oval in image2.
Preserve actual rooted limb identity, adjust the leg joint bend to reach these new points, and keep the gold-purple-black ankle armor. Body never moves. Far hind must stay near the near hind, not stretched back beyond tail. In frame2 RH is almost completely HIDDEN BEHIND LH and can show only a small dark claw glimpse. Left front needs modest stride (x467→410→353 in frames3→4→5). Target footprints take priority over the previous leg poses. No extra paw/arm. Keep canonical warm red fur/purple wings; preserve original image1 shading.
```

原画: `trot-v2/sources/rejected/frame-5-multi-paw.png`

## FRAME 6 / multi-paw-correction / rejected-support-or-anatomy

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET: one existing transparent manticore animation frame. Image2 is a correction overlay of that EXACT same picture with colored target footprint outlines. Replace ONLY four existing leg/paw shapes to place them inside the target footprints. Keep every above-leg detail from image1 unchanged: face/mane/torso/hips/wings/tail, all colors, identical camera, canvas 1375x1144 and scale. Do not darken output to image2's faded guide. Transparent background, no guide markings/text/shadows.
Codes: LF yellow = LARGE foreground/near FRONT paw; RF blue = SMALL background/far FRONT paw; LH pink = LARGE foreground/near HIND paw, connected to visible hip; RH green = SMALL background/far HIND paw behind LH. Exactly FOUR anatomical paws. Existing paw is MOVED/REPLACED, not retained alongside a new paw. Far paws can be occluded. The cross marks FOOT BOTTOM, the oval above it is the whole paw region.
FRAME 6. Required local corrections in source pixels:
RF: current approximate paw bottom (543, 942); relocate bottom center to (393.6, 983.4), shift LEFT 149px and DOWN 41px. Follow the matching colored oval in image2.
RH: current approximate paw bottom (710, 981); relocate bottom center to (794.3, 981.8), shift RIGHT 84px and DOWN 1px. Follow the matching colored oval in image2.
LF: current approximate paw bottom (327, 1076); relocate bottom center to (352.9, 1065.8), shift RIGHT 26px and UP 10px. Follow the matching colored oval in image2.
LH: current approximate paw bottom (1012, 948); relocate bottom center to (950.6, 982.8), shift LEFT 61px and DOWN 35px. Follow the matching colored oval in image2.
Preserve actual rooted limb identity, adjust the leg joint bend to reach these new points, and keep the gold-purple-black ankle armor. Body never moves. Far hind must stay near the near hind, not stretched back beyond tail. In frame2 RH is almost completely HIDDEN BEHIND LH and can show only a small dark claw glimpse. Left front needs modest stride (x467→410→353 in frames3→4→5). Target footprints take priority over the previous leg poses. No extra paw/arm. Keep canonical warm red fur/purple wings; preserve original image1 shading.
```

原画: `trot-v2/sources/rejected/frame-6-multi-paw.png`

## FRAME 1 / focused-correction / selected-in-comparison

```text
Use case: precise-object-edit. Image1 is the exact edit target, an existing transparent manticore pose,1375x1144. Image2 is a target-marker overlay of the same pose. Do ONE LOCAL anatomy edit only as described below. The character faces LEFT in the same three-quarter view. Keep all original pixels of face/mane/body/wings/tail/colors/canvas/camera as close to unchanged as possible. Exactly four anatomical legs, no added paw, no duplicated old paw, no color shift. Ignore all guide markers except the leg(s) mentioned in this request; do not reposition other legs. The changed paw replaces its old position, never leaves an old duplicate.
FRAME 1: Change ONLY the SMALL DARK FAR/BACKGROUND HIND paw, currently under belly around x700, bottom y965. Move this same far hind paw RIGHT by 130px and DOWN by 14px to bottom (830,979). It remains GROUNDED. It now sits immediately behind the large near hind paw at x960, not far forward under the middle of belly. Preserve all THREE other leg/paw positions exactly. Supporting diagonal = near front LF and far hind RH; lifted diagonal = far front RF and near hind LH. Do NOT change the large near foreleg at all.
Guide cross = paw's BOTTOM CENTER, ellipse above it = foot body. Maintain the thick lion limbs, correct rooted identity and original gold-purple-black armor. Output one transparent full-body sprite only, no markers/text/background/shadow. Body stationary. The specified supporting pair stays grounded and specified lifted pair stays lifted.
```

原画: `trot-v2/sources/frame-1-focused.png`

## FRAME 2 / focused-correction / selected-in-comparison

```text
Use case: precise-object-edit. Image1 is the exact edit target, an existing transparent manticore pose,1375x1144. Image2 is a target-marker overlay of the same pose. Do ONE LOCAL anatomy edit only as described below. The character faces LEFT in the same three-quarter view. Keep all original pixels of face/mane/body/wings/tail/colors/canvas/camera as close to unchanged as possible. Exactly four anatomical legs, no added paw, no duplicated old paw, no color shift. Ignore all guide markers except the leg(s) mentioned in this request; do not reposition other legs. The changed paw replaces its old position, never leaves an old duplicate.
FRAME 2: Change ONLY the TWO EXISTING HIND paws. Small dark FAR/BACKGROUND HIND RH moves LEFT about 15px and UP about 23px to bottom (866,976), still GROUNDED. Large bright NEAR/FOREGROUND HIND LH moves LEFT about 44px and DOWN about 49px to bottom (846,991), still LIFTED by about35px above its near ground plane. RH is almost completely hidden BEHIND LH; only a small dark claw glimpse should remain. Do NOT add another hind paw. Preserve both FRONT legs/paws and their positions exactly. Grounded diagonal = near front LF plus far hind RH. Lifted diagonal = far front RF plus near hind LH.
Guide cross = paw's BOTTOM CENTER, ellipse above it = foot body. Maintain the thick lion limbs, correct rooted identity and original gold-purple-black armor. Output one transparent full-body sprite only, no markers/text/background/shadow. Body stationary. The specified supporting pair stays grounded and specified lifted pair stays lifted.
```

原画: `trot-v2/sources/frame-2-focused.png`

## FRAME 3 / focused-correction / not-selected-for-full-cycle

```text
Use case: precise-object-edit. Image1 is the exact edit target, an existing transparent manticore pose,1375x1144. Image2 is a target-marker overlay of the same pose. Do ONE LOCAL anatomy edit only as described below. The character faces LEFT in the same three-quarter view. Keep all original pixels of face/mane/body/wings/tail/colors/canvas/camera as close to unchanged as possible. Exactly four anatomical legs, no added paw, no duplicated old paw, no color shift. Ignore all guide markers except the leg(s) mentioned in this request; do not reposition other legs. The changed paw replaces its old position, never leaves an old duplicate.
FRAME 3: Change ONLY the LARGE BRIGHT FOREGROUND FRONT LF paw and its lower leg. It is currently near x387 with bottom1003. Move the same paw RIGHT by80px and DOWN16px to bottom (467,1019), still AIRBORNE with bent elbow. This is the BACK position at the START of the foreleg swing, before frame4 atx410 and frame5 atx353. Preserve all THREE other leg/paw positions exactly. Lifted diagonal = near front LF and far hind RH. Supporting diagonal = far front RF and near hind LH.
Guide cross = paw's BOTTOM CENTER, ellipse above it = foot body. Maintain the thick lion limbs, correct rooted identity and original gold-purple-black armor. Output one transparent full-body sprite only, no markers/text/background/shadow. Body stationary. The specified supporting pair stays grounded and specified lifted pair stays lifted.
```

原画: `trot-v2/sources/frame-3-focused.png`

## FRAME 4 / focused-correction / not-selected-for-full-cycle

```text
Use case: precise-object-edit. Image1 is the EXACT existing transparent manticore pose to edit; image2 is its coordinate-marker overlay. Change ONLY THE ONE EXISTING LARGE FOREGROUND FRONT LEG AND PAW (yellow LF in guide). Ignore every other colored target marker. Preserve all THREE other leg/paw positions, identities, ground/lift states and shapes EXACTLY from image1. Preserve face/mane/body/wings/tail/colors/camera/1375x1144 canvas and size. Exactly FOUR anatomical legs, no fifth paw or small extra limb, do not keep old foreground paw after relocating it.
FRAME 4: It is currently far LEFT around x247,bottom985. Move this SAME large FOREGROUND FRONT paw RIGHT by163 pixels, to bottom center (410,987). It MUST remain LIFTED about74px above its own foreground ground plane y1061, with bent elbow. Keep its bottom y≈987; do not lower it to ground. It should now be almost directly ABOVE the small background front paw atx418,y996, but nearer to camera, hiding parts of that small far paw. Near front LF and far hind RH remain AIRBORNE; far front RF and near hind LH remain GROUNDED.
Match only the YELLOW target oval and cross in image2; cross marks paw bottom center. Large foreground paw replaces its old location, never adds another paw. Keep thick red lion foreleg, gold-purple-black anklet and claws. All above-leg pixels unchanged, no shifted body or palette change. Output one full-body transparent sprite only; no guide markers/text/background/shadow. Never convert a lifted foreground paw into a planted pose.
```

原画: `trot-v2/sources/frame-4-focused.png`

## FRAME 5 / focused-correction / rejected-front-leg-identity

```text
Use case: precise-object-edit. Image1 is the EXACT existing transparent manticore pose to edit; image2 is its coordinate-marker overlay. Change ONLY THE ONE EXISTING LARGE FOREGROUND FRONT LEG AND PAW (yellow LF in guide). Ignore every other colored target marker. Preserve all THREE other leg/paw positions, identities, ground/lift states and shapes EXACTLY from image1. Preserve face/mane/body/wings/tail/colors/camera/1375x1144 canvas and size. Exactly FOUR anatomical legs, no fifth paw or small extra limb, do not keep old foreground paw after relocating it.
FRAME 5: It is currently far LEFT around x192,bottom972. Move this SAME large FOREGROUND FRONT paw RIGHT by161px and DOWN57px, to bottom center (353,1029). It MUST remain LIFTED about32px above its foreground ground plane1061, not planted. Keep foreleg root where it is; bend elbow so paw stays close under shoulder. This is a modest forward-left swing compared with frame4 targetx410. Near front LF and far hind RH remain AIRBORNE; far front RF and near hind LH remain GROUNDED.
Match only the YELLOW target oval and cross in image2; cross marks paw bottom center. Large foreground paw replaces its old location, never adds another paw. Keep thick red lion foreleg, gold-purple-black anklet and claws. All above-leg pixels unchanged, no shifted body or palette change. Output one full-body transparent sprite only; no guide markers/text/background/shadow. Never convert a lifted foreground paw into a planted pose.
```

原画: `trot-v2/sources/frame-5-focused.png`


# 2026-10-13 右後脚の接続のみ修正

## rejected-fifth-foot

Use case: precise-object-edit. Repair ONLY the anatomical connection of the RIGHT/FAR/BACKGROUND HIND leg in this existing LEFT-facing manticore animation frame. Output the same single full-body transparent sprite, same 1375x1144 framing/scale/colors. All FOUR PAW POSITIONS and shapes must remain EXACTLY UNCHANGED. The forward/backward gait is already approved; do not change it.
The smaller dark far/right hind paw is the paw immediately LEFT of the big bright foreground hind paw, under the rear belly. Its bottom is around (830,960), and its gold ankle armor is around (830,850). The big foreground hind paw at roughly (950,950) is the LEFT/NEAR leg; leave that entire leg untouched.
Currently the small far hind paw/ankle is not visibly connected to its upper THIGH: the dark red thigh under the belly ends near (735,790), then the ankle/paw appears as a separate piece. Repair the missing THIGH→KNEE→SHIN connection. Create one coherent continuous dark red fur-covered anatomical leg from the far-side pelvis/thigh under the belly, through a bent knee around (785,815), down to the EXISTING ankle around (830,850), and into the EXISTING small planted paw. The far leg belongs BEHIND the foreground haunch; retain occlusion while leaving a clear connected fur silhouette in the gap. Fill only this missing short connector, not a new leg. No transparent break between thigh and shin.
Do not move or redraw the four feet, do not alter their ground/lift states, and do not change stride, body, mane, face, horns, wings, tail, ankle armor, camera or palette. Exactly four anatomical legs, no fifth limb, no floating detached paw. Real transparent RGBA; no text/guide/shadow/background/effects.

原画: trot-v2/sources/frame-1-connection-rejected-extra-foot.png

## selected-connection-only

Edit the attached sprite in-place. There are EXACTLY FOUR existing paws: front at (307,890), front at (345,1040), far hind at (830,920), near hind at (950,890). Preserve these four paws in their exact existing locations. DO NOT DRAW ANY NEW PAW OR ANKLET. Preserve all opaque artwork, facial/body landmarks, wings and tail. Repair ONLY the detached far hind leg: the dark red thigh currently terminates at (735,790), while its EXISTING gold cuff at (830,850) and EXISTING dark paw below it are detached from that thigh. Add a short, narrow continuous dark red knee/shin bridge from the EXISTING thigh tip (735,790) diagonally down-right to the EXISTING cuff (830,850). The connecting shin is largely occluded behind the big foreground haunch at (900,760), with only its left edge exposed. No limb ending at x650: that would be a WRONG fifth foot. Do not alter stride, foot placement, ground contact, anatomy elsewhere or colors. Exactly four total legs. Full transparent canvas, original 1375x1144 composition. Pixel game sprite style matching source.

原画: trot-v2/sources/frame-1-connected.png
