# storm-jackal の座標ガイド付きtrot

基準画像を固定し、対角脚の接地を確認。3コマ生成は前脚の接地が交代しないため不採用。1コマ生成へ分割。

## part 1 — rejected-front-support-not-alternating

Generate THREE consecutive full-body left-facing 3/4-view TROT poses of the creature in the FIRST reference, in one horizontal three-cell sprite sheet, read left to right. The SECOND reference is only a skeletal pose/coordinate guide, never copy its text or colors into the artwork. Each cell uses its own local normalized 1024 x 1024 coordinates. Same identity, head/torso placement, body size, pixel-art texture, gold trim, face, horns, tail, palette and lighting across all poses. Exactly FOUR connected legs; anatomical left legs are near, anatomical right legs are far and darker. Far legs can be naturally partly hidden; NEVER add a fifth paw to show an occluded leg. Trace every thigh/knee/shin into its OWN existing ankle/foot. The head and torso are stable around the same position; only legs articulate with subtle mane/tail secondary motion. No horizontal character translation. Ground support alternates diagonal pairs: A=near LH+far RF, B=near LF+far RH. These three poses form first half (1,2,3) of a six-frame 720ms seamless in-place trot. Natural smaller stride of far hind leg, do not exaggerate it. Coordinates guide relative placement; accurate identity and smooth small limb movement matter. FRAME 1: LF=左前脚/near grounded paw bottom (377,891), hip (377,609), knee (496,717); RF=右前脚/far lifted paw bottom (333,827), hip (333,581), knee (466,670); LH=左後脚/near lifted paw bottom (687,825), hip (687,603), knee (546,702); RH=右後脚/far grounded paw bottom (643,839), hip (643,575), knee (516,694)
FRAME 2: LF=左前脚/near grounded paw bottom (413,889), hip (377,609), knee (511,697); RF=右前脚/far lifted paw bottom (302,848), hip (333,581), knee (442,700); LH=左後脚/near lifted paw bottom (655,848), hip (687,603), knee (539,689); RH=右後脚/far grounded paw bottom (665,837), hip (643,575), knee (528,707)
FRAME 3: LF=左前脚/near lifted paw bottom (413,866), hip (377,609), knee (520,681); RF=右前脚/far grounded paw bottom (302,866), hip (333,581), knee (434,707); LH=左後脚/near grounded paw bottom (655,869), hip (687,603), knee (546,702); RH=右後脚/far lifted paw bottom (665,820), hip (643,575), knee (522,701)
Keep cell size/margins identical. Each whole creature, horns and tail contained in its cell, full transparent alpha background. No floor, shadows, guide lines, text, borders, numbers, duplicated bodies or attack VFX. Match the canonical reference art; crisp pixel RPG sprite. Export three separate equal cells in a single wide transparent PNG.

原画: trot/storm-jackal/sources/half-1-generated.png

SHA256: initial source retained

## part 2 — rejected-front-support-not-alternating

Generate THREE consecutive full-body left-facing 3/4-view TROT poses of the creature in the FIRST reference, in one horizontal three-cell sprite sheet, read left to right. The SECOND reference is only a skeletal pose/coordinate guide, never copy its text or colors into the artwork. Each cell uses its own local normalized 1024 x 1024 coordinates. Same identity, head/torso placement, body size, pixel-art texture, gold trim, face, horns, tail, palette and lighting across all poses. Exactly FOUR connected legs; anatomical left legs are near, anatomical right legs are far and darker. Far legs can be naturally partly hidden; NEVER add a fifth paw to show an occluded leg. Trace every thigh/knee/shin into its OWN existing ankle/foot. The head and torso are stable around the same position; only legs articulate with subtle mane/tail secondary motion. No horizontal character translation. Ground support alternates diagonal pairs: A=near LH+far RF, B=near LF+far RH. These three poses form second half (4,5,6) of a six-frame 720ms seamless in-place trot. Natural smaller stride of far hind leg, do not exaggerate it. Coordinates guide relative placement; accurate identity and smooth small limb movement matter. FRAME 4: LF=左前脚/near lifted paw bottom (377,847), hip (377,609), knee (513,693); RF=右前脚/far grounded paw bottom (333,864), hip (333,581), knee (452,690); LH=左後脚/near grounded paw bottom (687,866), hip (687,603), knee (560,722); RH=右後脚/far lifted paw bottom (643,805), hip (643,575), knee (504,678)
FRAME 5: LF=左前脚/near lifted paw bottom (341,872), hip (377,609), knee (484,729); RF=右前脚/far grounded paw bottom (364,861), hip (333,581), knee (465,672); LH=左後脚/near grounded paw bottom (720,863), hip (687,603), knee (579,740); RH=右後脚/far lifted paw bottom (621,824), hip (643,575), knee (500,671)
FRAME 6: LF=左前脚/near grounded paw bottom (341,894), hip (377,609), knee (475,738); RF=右前脚/far lifted paw bottom (364,843), hip (333,581), knee (473,660); LH=左後脚/near lifted paw bottom (720,843), hip (687,603), knee (572,734); RH=右後脚/far grounded paw bottom (621,840), hip (643,575), knee (506,681)
Keep cell size/margins identical. Each whole creature, horns and tail contained in its cell, full transparent alpha background. No floor, shadows, guide lines, text, borders, numbers, duplicated bodies or attack VFX. Match the canonical reference art; crisp pixel RPG sprite. Export three separate equal cells in a single wide transparent PNG.

原画: trot/storm-jackal/sources/half-2-generated.png

SHA256: initial source retained

## frame 4 — superseded

Edit ONLY the TWO FRONT LEGS of Image1. Image2 overlays the required leg centerlines and paw-bottom markers in the SAME 1254x1254 coordinates. Bright BLUE foreground LEFT FRONT (big visible shoulder, golden cuff) must CURL UP with paw bottom (385,1080), YELLOW target ellipse. Small DARK background RIGHT FRONT must STRAIGHTEN DOWN with planted paw bottom (345,1175), BLUE target ellipse. This reverses the current front-leg support: in Image1 the bright front paw is down and the dark front is up, both are wrong. Near front UP, far front DOWN. Preserve the exact existing rear legs: bright near hind DOWN, dark far hind UP. Keep the far front paw near/behind the curled near foreleg, not extended out beyond the muzzle. Follow the guide centerline under the correct own shoulder, knee and ankle all continuously connected. Exactly four existing feet, no fifth, no foot disconnected from its thigh. Keep face, horns, mane, torso, tail, fur palette, armor detail, brightness, body position and scale EXACTLY like Image1. Image2 is QA guide ONLY: no dark tint, colored strokes, circles, labels or guide pixels in output. Transparent full canvas, no floor/shadow. These are small controlled leg changes for frame 4 of a 6-frame diagonal trot.

原画: trot/storm-jackal/sources/frame-4-focused.png

SHA256: 1f4487ea1b696b83496763f058d061f90b7e0cf408c0998d76af7dd0590d18bc

## frame 5 — superseded

Edit ONLY the TWO FRONT LEGS of Image1. Image2 overlays the required leg centerlines and paw-bottom markers in the SAME 1254x1254 coordinates. Bright BLUE foreground LEFT FRONT (big visible shoulder, golden cuff) must CURL UP with paw bottom (360,1080), YELLOW target ellipse. Small DARK background RIGHT FRONT must STRAIGHTEN DOWN with planted paw bottom (370,1175), BLUE target ellipse. This reverses the current front-leg support: in Image1 the bright front paw is down and the dark front is up, both are wrong. Near front UP, far front DOWN. Preserve the exact existing rear legs: bright near hind DOWN, dark far hind UP. Keep the far front paw near/behind the curled near foreleg, not extended out beyond the muzzle. Follow the guide centerline under the correct own shoulder, knee and ankle all continuously connected. Exactly four existing feet, no fifth, no foot disconnected from its thigh. Keep face, horns, mane, torso, tail, fur palette, armor detail, brightness, body position and scale EXACTLY like Image1. Image2 is QA guide ONLY: no dark tint, colored strokes, circles, labels or guide pixels in output. Transparent full canvas, no floor/shadow. These are small controlled leg changes for frame 5 of a 6-frame diagonal trot.

原画: trot/storm-jackal/sources/frame-5-focused.png

SHA256: 533f752adf5f5d333afc40e6285332779a6a1cefeda4d920e61aa4e2c84b580e

## frame 2 — superseded

Edit this EXACT image in place, transparent 1254x1254 canvas. Change ONLY the TWO REAR LEGS below the haunch. Preserve both front legs, head, mane, horns, torso, tail, exact colors, body position and scale. Currently the BRIGHT BLUE near hind paw at about (800,1170) is down and the DARK far hind paw at about (660,1060) is up: this is wrong. Swap ONLY their lift/contact: raise the bright BLUE near hind paw to (790,1070), bend its knee naturally; lower the dark far hind paw to (685,1150), extending its connected shin behind the bright haunch. Leave the paw X positions almost unchanged, stride short. Keep their own gold anklets and exact four legs. The bright NEAR FRONT paw remains down; DARK FAR FRONT remains curled up. Final TROT diagonal support: bright near front + dark far hind DOWN; dark far front + bright near hind UP. This correction is rear-leg contact only, do not alter the accepted front legs or body. No extra fifth paw, all ankles continuously connect to knees/hips. No guide, shadows or opaque background.

原画: trot/storm-jackal/sources/frame-2-contact.png

SHA256: b7d7421daf2dbe840a68795a3ca94953197b09caa3eb88bbec88cc31a34c1c9c

## frame 3 — superseded

Edit this EXACT sprite in place, transparent 1254x1254 canvas. Change ONLY the TWO FRONT LEGS below the shoulders. Preserve both rear legs, face, horns, mane, body, tail, colors and pixel texture, same size/location. The bright BLUE near front leg with the gold cuff, at approximately x380, currently has its paw DOWN at y1200: this is wrong. Curl this near FRONT paw UP to approximately (385,1080), still connected to its big bright shoulder via a bent knee/shin. The small DARK FAR FRONT leg, currently curled UP at x240,y1080, must extend down with paw bottom at (260,1170). Its thigh/shin stay behind the bright near foreleg. Do not delete its foot or create a fifth. Rear legs must remain EXACTLY unchanged: bright near hind grounded, dark far hind lifted. Final diagonal support: DARK FAR FRONT + BRIGHT NEAR HIND DOWN, BRIGHT NEAR FRONT + DARK FAR HIND UP. Change front-leg CONTACT HEIGHT only, small X corrections specified; no full-body redraw, no attack pose. All four anatomical legs continuous, true alpha, no shadow/floor/diagram.

原画: trot/storm-jackal/sources/frame-3-contact.png

SHA256: 20b9bc46d75ea31a90c968fed8b0ed16efe47856dbf1403f51b956c855837f9d

## frame 2 — superseded

Change ONLY the BRIGHT BLUE NEAR LEFT HIND leg. Image1 is the fixed original sprite. Image2 overlays the desired leg centerline and target paw bottom in the SAME 1254x1254 coordinates. Move this lifted blue rear paw from approximately (630,1080) BACK toward its visible rear haunch to bottom-center (790,1080), following the PINK target ellipse. Keep the paw LIFTED; keep the DARK FAR HIND grounded paw at about (815,1170) EXACTLY unchanged. Near hind knee around (825,930), ankle around (785,1025); its upper thigh remains attached to existing haunch. This eliminates an excessive long forward swing and makes the far hind paw mostly overlap behind the near hind leg. Do NOT swap feet, delete a foot, or add a fifth. Keep both front legs, face, torso, horns, mane, tail, fur colors, armor and canvas completely unchanged. Retain true alpha; DO NOT copy the guide tint, colors, labels, lines or ellipse. Exact four continuously connected legs.

原画: trot/storm-jackal/sources/frame-2-focused.png

SHA256: c8215b5269c0d2984bc20db3909c425a8fde9c8da82e4124fb002f509c6a00a4

## frame 3 — selected

Change ONLY the small DARK FAR RIGHT FRONT leg. Image1 is the fixed sprite; Image2 shows its desired centerline/paw bottom in the SAME 1254x1254 coordinates. Its existing grounded paw reaches too far toward the muzzle at x170. Retract that existing dark paw to bottom-center (325,1175), BLUE target ellipse, shortening the forward reach. Keep it GROUNDED. Thigh root (305,800), knee (325,990), ankle (325,1100). The bright BLUE NEAR FRONT stays curled LIFTED, EXACTLY unchanged. Both rear legs and all body/face/mane/horns/tail/colors also stay unchanged. A far planted forepaw should be behind the lifted near forepaw, mostly overlapped by the near leg, not stretched beyond the muzzle. Exactly four existing feet; move its OWN paw, erase old footprint, never add a fifth. Native transparent canvas, no guide art or labels in output.

原画: trot/storm-jackal/sources/frame-3-focused.png

SHA256: 384841c575724a4ea8cfab86bc5fa3448c0e14ad3d206e49541c3f365e40527d

## frame 1 — superseded

Make ONE replacement pose, editing the FIRST reference. Preserve its head, horns, torso, mane, tail, fur colors, armor, pixel texture, exact body location, size and transparent square canvas. The SECOND reference is a calculated skeleton guide; do not copy diagram art or colored lines. THIRD reference is canonical creature identity. This is frame 1 of a SIX-frame diagonal TROT cycle. neutral. Crucial contact state: BRIGHT NEAR LEFT FRONT paw is GROUNDED and DARK FAR RIGHT HIND paw is GROUNDED. BRIGHT NEAR LEFT HIND paw is LIFTED, DARK FAR RIGHT FRONT paw is LIFTED.
Anatomy: NEAR FRONT leg is the bright foreground leg under the big visible shoulder, typically to the RIGHT of the dark foreground-overlapped front leg in the image. FAR FRONT is the smaller dark leg behind that shoulder, typically LEFT of it. NEAR HIND is the bright leg attached to the visible rear haunch, usually RIGHTMOST rear leg. FAR HIND is the smaller dark rear leg behind it, usually left of it and largely occluded. Do not swap leg identity. LIFTED means curl the paw up 30-45 local pixels ABOVE its own support-plane level; GROUNDED means straighten into its own existing support-plane level. Lifted paw should NOT be drawn at the same height as its grounded neighbor. There are exactly FOUR legs and FOUR feet, every foot connected through ankle/shin/knee/thigh to its correct shoulder/hip; a hidden far limb may overlap, no fifth foot. Small smooth forward/back stride, far hind stride smaller than near hind, no wide spread. For closed near phase near fore retracts toward hip, near hind advances toward shoulder; for open near phase near fore advances toward muzzle, near hind retracts toward tail. Far side is opposite. Follow guide poses and depth; keep artwork body fixed. Coordinate targets local normalized1024: LF bottom=377,891 GROUND; RF bottom=333,827 AIR; LH bottom=687,825 AIR; RH bottom=643,839 GROUND. These coordinates describe proportions/ordering; map into source size without moving the body. Only legs change. Return ONE full creature transparent PNG in SAME square canvas, no floor, labels, guide lines, background or shadow.

原画: trot/storm-jackal/sources/frame-1-single.png

SHA256: 0e80d5adf3ad4c247c1f69ea40daee262c313fbdea4635f81143bc78bd009f14

## frame 2 — rejected-contact-pair

Make ONE replacement pose, editing the FIRST reference. Preserve its head, horns, torso, mane, tail, fur colors, armor, pixel texture, exact body location, size and transparent square canvas. The SECOND reference is a calculated skeleton guide; do not copy diagram art or colored lines. THIRD reference is canonical creature identity. This is frame 2 of a SIX-frame diagonal TROT cycle. NEAR CLOSED, FAR OPEN. Crucial contact state: BRIGHT NEAR LEFT FRONT paw is GROUNDED and DARK FAR RIGHT HIND paw is GROUNDED. BRIGHT NEAR LEFT HIND paw is LIFTED, DARK FAR RIGHT FRONT paw is LIFTED.
Anatomy: NEAR FRONT leg is the bright foreground leg under the big visible shoulder, typically to the RIGHT of the dark foreground-overlapped front leg in the image. FAR FRONT is the smaller dark leg behind that shoulder, typically LEFT of it. NEAR HIND is the bright leg attached to the visible rear haunch, usually RIGHTMOST rear leg. FAR HIND is the smaller dark rear leg behind it, usually left of it and largely occluded. Do not swap leg identity. LIFTED means curl the paw up 30-45 local pixels ABOVE its own support-plane level; GROUNDED means straighten into its own existing support-plane level. Lifted paw should NOT be drawn at the same height as its grounded neighbor. There are exactly FOUR legs and FOUR feet, every foot connected through ankle/shin/knee/thigh to its correct shoulder/hip; a hidden far limb may overlap, no fifth foot. Small smooth forward/back stride, far hind stride smaller than near hind, no wide spread. For closed near phase near fore retracts toward hip, near hind advances toward shoulder; for open near phase near fore advances toward muzzle, near hind retracts toward tail. Far side is opposite. Follow guide poses and depth; keep artwork body fixed. Coordinate targets local normalized1024: LF bottom=413,889 GROUND; RF bottom=302,848 AIR; LH bottom=655,848 AIR; RH bottom=665,837 GROUND. These coordinates describe proportions/ordering; map into source size without moving the body. Only legs change. Return ONE full creature transparent PNG in SAME square canvas, no floor, labels, guide lines, background or shadow.

原画: trot/storm-jackal/sources/frame-2-single.png

SHA256: e43c8445a0768b5d69fa8c9319abc27faf4efcaebad52e7fb9706bb2fcf70518

## frame 3 — rejected-contact-pair

Make ONE replacement pose, editing the FIRST reference. Preserve its head, horns, torso, mane, tail, fur colors, armor, pixel texture, exact body location, size and transparent square canvas. The SECOND reference is a calculated skeleton guide; do not copy diagram art or colored lines. THIRD reference is canonical creature identity. This is frame 3 of a SIX-frame diagonal TROT cycle. NEAR CLOSED, FAR OPEN. Crucial contact state: BRIGHT NEAR LEFT FRONT paw is LIFTED and DARK FAR RIGHT HIND paw is LIFTED. DARK FAR RIGHT FRONT paw is GROUNDED and BRIGHT NEAR LEFT HIND paw is GROUNDED.
Anatomy: NEAR FRONT leg is the bright foreground leg under the big visible shoulder, typically to the RIGHT of the dark foreground-overlapped front leg in the image. FAR FRONT is the smaller dark leg behind that shoulder, typically LEFT of it. NEAR HIND is the bright leg attached to the visible rear haunch, usually RIGHTMOST rear leg. FAR HIND is the smaller dark rear leg behind it, usually left of it and largely occluded. Do not swap leg identity. LIFTED means curl the paw up 30-45 local pixels ABOVE its own support-plane level; GROUNDED means straighten into its own existing support-plane level. Lifted paw should NOT be drawn at the same height as its grounded neighbor. There are exactly FOUR legs and FOUR feet, every foot connected through ankle/shin/knee/thigh to its correct shoulder/hip; a hidden far limb may overlap, no fifth foot. Small smooth forward/back stride, far hind stride smaller than near hind, no wide spread. For closed near phase near fore retracts toward hip, near hind advances toward shoulder; for open near phase near fore advances toward muzzle, near hind retracts toward tail. Far side is opposite. Follow guide poses and depth; keep artwork body fixed. Coordinate targets local normalized1024: LF bottom=413,866 AIR; RF bottom=302,866 GROUND; LH bottom=655,869 GROUND; RH bottom=665,820 AIR. These coordinates describe proportions/ordering; map into source size without moving the body. Only legs change. Return ONE full creature transparent PNG in SAME square canvas, no floor, labels, guide lines, background or shadow.

原画: trot/storm-jackal/sources/frame-3-single.png

SHA256: 06c7cf1563ce2c7fca76dc90a0f59726d6f2345d13661563fbed38aa37c686fd

## frame 4 — rejected-contact-pair

Make ONE replacement pose, editing the FIRST reference. Preserve its head, horns, torso, mane, tail, fur colors, armor, pixel texture, exact body location, size and transparent square canvas. The SECOND reference is a calculated skeleton guide; do not copy diagram art or colored lines. THIRD reference is canonical creature identity. This is frame 4 of a SIX-frame diagonal TROT cycle. neutral. Crucial contact state: BRIGHT NEAR LEFT FRONT paw is LIFTED and DARK FAR RIGHT HIND paw is LIFTED. DARK FAR RIGHT FRONT paw is GROUNDED and BRIGHT NEAR LEFT HIND paw is GROUNDED.
Anatomy: NEAR FRONT leg is the bright foreground leg under the big visible shoulder, typically to the RIGHT of the dark foreground-overlapped front leg in the image. FAR FRONT is the smaller dark leg behind that shoulder, typically LEFT of it. NEAR HIND is the bright leg attached to the visible rear haunch, usually RIGHTMOST rear leg. FAR HIND is the smaller dark rear leg behind it, usually left of it and largely occluded. Do not swap leg identity. LIFTED means curl the paw up 30-45 local pixels ABOVE its own support-plane level; GROUNDED means straighten into its own existing support-plane level. Lifted paw should NOT be drawn at the same height as its grounded neighbor. There are exactly FOUR legs and FOUR feet, every foot connected through ankle/shin/knee/thigh to its correct shoulder/hip; a hidden far limb may overlap, no fifth foot. Small smooth forward/back stride, far hind stride smaller than near hind, no wide spread. For closed near phase near fore retracts toward hip, near hind advances toward shoulder; for open near phase near fore advances toward muzzle, near hind retracts toward tail. Far side is opposite. Follow guide poses and depth; keep artwork body fixed. Coordinate targets local normalized1024: LF bottom=377,847 AIR; RF bottom=333,864 GROUND; LH bottom=687,866 GROUND; RH bottom=643,805 AIR. These coordinates describe proportions/ordering; map into source size without moving the body. Only legs change. Return ONE full creature transparent PNG in SAME square canvas, no floor, labels, guide lines, background or shadow.

原画: trot/storm-jackal/sources/frame-4-single.png

SHA256: f074a8ae397b6b77a234c312abaade6e4ab0c6cc6632d00ae9158fb108119744

## frame 5 — rejected-contact-pair

Make ONE replacement pose, editing the FIRST reference. Preserve its head, horns, torso, mane, tail, fur colors, armor, pixel texture, exact body location, size and transparent square canvas. The SECOND reference is a calculated skeleton guide; do not copy diagram art or colored lines. THIRD reference is canonical creature identity. This is frame 5 of a SIX-frame diagonal TROT cycle. NEAR OPEN, FAR CLOSED. Crucial contact state: BRIGHT NEAR LEFT FRONT paw is LIFTED and DARK FAR RIGHT HIND paw is LIFTED. DARK FAR RIGHT FRONT paw is GROUNDED and BRIGHT NEAR LEFT HIND paw is GROUNDED.
Anatomy: NEAR FRONT leg is the bright foreground leg under the big visible shoulder, typically to the RIGHT of the dark foreground-overlapped front leg in the image. FAR FRONT is the smaller dark leg behind that shoulder, typically LEFT of it. NEAR HIND is the bright leg attached to the visible rear haunch, usually RIGHTMOST rear leg. FAR HIND is the smaller dark rear leg behind it, usually left of it and largely occluded. Do not swap leg identity. LIFTED means curl the paw up 30-45 local pixels ABOVE its own support-plane level; GROUNDED means straighten into its own existing support-plane level. Lifted paw should NOT be drawn at the same height as its grounded neighbor. There are exactly FOUR legs and FOUR feet, every foot connected through ankle/shin/knee/thigh to its correct shoulder/hip; a hidden far limb may overlap, no fifth foot. Small smooth forward/back stride, far hind stride smaller than near hind, no wide spread. For closed near phase near fore retracts toward hip, near hind advances toward shoulder; for open near phase near fore advances toward muzzle, near hind retracts toward tail. Far side is opposite. Follow guide poses and depth; keep artwork body fixed. Coordinate targets local normalized1024: LF bottom=341,872 AIR; RF bottom=364,861 GROUND; LH bottom=720,863 GROUND; RH bottom=621,824 AIR. These coordinates describe proportions/ordering; map into source size without moving the body. Only legs change. Return ONE full creature transparent PNG in SAME square canvas, no floor, labels, guide lines, background or shadow.

原画: trot/storm-jackal/sources/frame-5-single.png

SHA256: c387dd794213011958f6287132bab5f2eb97a09f0872fd410a39e59e0df6fe2a

## frame 6 — superseded

Make ONE replacement pose, editing the FIRST reference. Preserve its head, horns, torso, mane, tail, fur colors, armor, pixel texture, exact body location, size and transparent square canvas. The SECOND reference is a calculated skeleton guide; do not copy diagram art or colored lines. THIRD reference is canonical creature identity. This is frame 6 of a SIX-frame diagonal TROT cycle. NEAR OPEN, FAR CLOSED. Crucial contact state: BRIGHT NEAR LEFT FRONT paw is GROUNDED and DARK FAR RIGHT HIND paw is GROUNDED. BRIGHT NEAR LEFT HIND paw is LIFTED, DARK FAR RIGHT FRONT paw is LIFTED.
Anatomy: NEAR FRONT leg is the bright foreground leg under the big visible shoulder, typically to the RIGHT of the dark foreground-overlapped front leg in the image. FAR FRONT is the smaller dark leg behind that shoulder, typically LEFT of it. NEAR HIND is the bright leg attached to the visible rear haunch, usually RIGHTMOST rear leg. FAR HIND is the smaller dark rear leg behind it, usually left of it and largely occluded. Do not swap leg identity. LIFTED means curl the paw up 30-45 local pixels ABOVE its own support-plane level; GROUNDED means straighten into its own existing support-plane level. Lifted paw should NOT be drawn at the same height as its grounded neighbor. There are exactly FOUR legs and FOUR feet, every foot connected through ankle/shin/knee/thigh to its correct shoulder/hip; a hidden far limb may overlap, no fifth foot. Small smooth forward/back stride, far hind stride smaller than near hind, no wide spread. For closed near phase near fore retracts toward hip, near hind advances toward shoulder; for open near phase near fore advances toward muzzle, near hind retracts toward tail. Far side is opposite. Follow guide poses and depth; keep artwork body fixed. Coordinate targets local normalized1024: LF bottom=341,894 GROUND; RF bottom=364,843 AIR; LH bottom=720,843 AIR; RH bottom=621,840 GROUND. These coordinates describe proportions/ordering; map into source size without moving the body. Only legs change. Return ONE full creature transparent PNG in SAME square canvas, no floor, labels, guide lines, background or shadow.

原画: trot/storm-jackal/sources/frame-6-single.png

SHA256: b3ae77fc9df35b261e198e914d789f44bd6ee005909df54e09f492e1d21e8eb8

## frame 1 — selected

Edit ONLY the very rightmost TAIL FUR TIPS of this transparent 1254x1254 pixel sprite. The tail's blue/white fur currently hits/crosses the RIGHT CANVAS EDGE around y985..1015, and its fur tips are clipped. Restore complete natural tapered fur tips and curl these last few hairs slightly INWARD so the rightmost nontransparent pixel is x<=1235, leaving at least 18px of clear transparent margin. Do NOT change tail base, flowing mane or large tail shape; only the last approximately 35px-wide rightmost extremity. Keep ALL FOUR LEGS and their feet, thighs, joints, contact states and exact paw coordinates COMPLETELY UNCHANGED. Keep face, horns, head, torso, armor, palette, texture, scale and all body positions unchanged. Retain original 1254x1254 transparent canvas; do not shrink or recenter character. No extra limbs, no guide/labels, no opaque background, no floor/shadow. This is frame 1 of a six-frame trot; preserve the accepted movement, fix visible tail-tip clipping only.

原画: trot/storm-jackal/sources/frame-1-tail.png

SHA256: 75121ff3712b80aeeb7a70c339d50c87dd3fc12a82deb585030ca3d2e5e91414

## frame 2 — selected

Edit ONLY the very rightmost TAIL FUR TIPS of this transparent 1254x1254 pixel sprite. The tail's blue/white fur currently hits/crosses the RIGHT CANVAS EDGE around y985..1015, and its fur tips are clipped. Restore complete natural tapered fur tips and curl these last few hairs slightly INWARD so the rightmost nontransparent pixel is x<=1235, leaving at least 18px of clear transparent margin. Do NOT change tail base, flowing mane or large tail shape; only the last approximately 35px-wide rightmost extremity. Keep ALL FOUR LEGS and their feet, thighs, joints, contact states and exact paw coordinates COMPLETELY UNCHANGED. Keep face, horns, head, torso, armor, palette, texture, scale and all body positions unchanged. Retain original 1254x1254 transparent canvas; do not shrink or recenter character. No extra limbs, no guide/labels, no opaque background, no floor/shadow. This is frame 2 of a six-frame trot; preserve the accepted movement, fix visible tail-tip clipping only.

原画: trot/storm-jackal/sources/frame-2-tail.png

SHA256: 0b2e4b70a24fd51bbc034a3a4404d0a3a5805148858b54a3799b3a3e55946386

## frame 4 — selected

Edit ONLY the very rightmost TAIL FUR TIPS of this transparent 1254x1254 pixel sprite. The tail's blue/white fur currently hits/crosses the RIGHT CANVAS EDGE around y985..1015, and its fur tips are clipped. Restore complete natural tapered fur tips and curl these last few hairs slightly INWARD so the rightmost nontransparent pixel is x<=1235, leaving at least 18px of clear transparent margin. Do NOT change tail base, flowing mane or large tail shape; only the last approximately 35px-wide rightmost extremity. Keep ALL FOUR LEGS and their feet, thighs, joints, contact states and exact paw coordinates COMPLETELY UNCHANGED. Keep face, horns, head, torso, armor, palette, texture, scale and all body positions unchanged. Retain original 1254x1254 transparent canvas; do not shrink or recenter character. No extra limbs, no guide/labels, no opaque background, no floor/shadow. This is frame 4 of a six-frame trot; preserve the accepted movement, fix visible tail-tip clipping only.

原画: trot/storm-jackal/sources/frame-4-tail.png

SHA256: de450ada73ab7cd36102736dba6a59e4b6bac4c1ad0879dd7b0662e05107d777

## frame 5 — selected

Edit ONLY the very rightmost TAIL FUR TIPS of this transparent 1254x1254 pixel sprite. The tail's blue/white fur currently hits/crosses the RIGHT CANVAS EDGE around y985..1015, and its fur tips are clipped. Restore complete natural tapered fur tips and curl these last few hairs slightly INWARD so the rightmost nontransparent pixel is x<=1235, leaving at least 18px of clear transparent margin. Do NOT change tail base, flowing mane or large tail shape; only the last approximately 35px-wide rightmost extremity. Keep ALL FOUR LEGS and their feet, thighs, joints, contact states and exact paw coordinates COMPLETELY UNCHANGED. Keep face, horns, head, torso, armor, palette, texture, scale and all body positions unchanged. Retain original 1254x1254 transparent canvas; do not shrink or recenter character. No extra limbs, no guide/labels, no opaque background, no floor/shadow. This is frame 5 of a six-frame trot; preserve the accepted movement, fix visible tail-tip clipping only.

原画: trot/storm-jackal/sources/frame-5-tail.png

SHA256: cc5f7511262a99fdc7d81829903234eb4a169f97e07738b0a076fcfe7e021743

## frame 6 — selected

Edit ONLY the very rightmost TAIL FUR TIPS of this transparent 1254x1254 pixel sprite. The tail's blue/white fur currently hits/crosses the RIGHT CANVAS EDGE around y985..1015, and its fur tips are clipped. Restore complete natural tapered fur tips and curl these last few hairs slightly INWARD so the rightmost nontransparent pixel is x<=1235, leaving at least 18px of clear transparent margin. Do NOT change tail base, flowing mane or large tail shape; only the last approximately 35px-wide rightmost extremity. Keep ALL FOUR LEGS and their feet, thighs, joints, contact states and exact paw coordinates COMPLETELY UNCHANGED. Keep face, horns, head, torso, armor, palette, texture, scale and all body positions unchanged. Retain original 1254x1254 transparent canvas; do not shrink or recenter character. No extra limbs, no guide/labels, no opaque background, no floor/shadow. This is frame 6 of a six-frame trot; preserve the accepted movement, fix visible tail-tip clipping only.

原画: trot/storm-jackal/sources/frame-6-tail.png

SHA256: 708e98bb884915be4685a6635a8f14098f249aa59095db3feabb2bec4537806e
