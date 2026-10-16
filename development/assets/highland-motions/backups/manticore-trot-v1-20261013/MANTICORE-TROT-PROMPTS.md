# マンティコアのtrot試作 — 生成プロンプト

2026-10-12開始、2026-10-13書き出し・検証。組み込み `image_gen`、透過PNG。

3コマずつの初回生成で脚の対応が崩れたため、最終6コマは1コマずつ修正した。⑥の初回単独生成にも余分な前脚があり、不採用。修正は前後のポーズを編集対象とし、同じ基準デザインの配色・形を比較した。

| 最終コマ | 採用原画 |
| --- | --- |
| 1 | `sources/manticore/move-trot-frame-1-generated.png` |
| 2 | `sources/manticore/move-trot-frame-2-generated.png` |
| 3 | `sources/manticore/move-trot-frame-3-generated.png` |
| 4 | `sources/manticore/move-trot-frame-4-generated.png` |
| 5 | `sources/manticore/move-trot-frame-5-generated.png` |
| 6 | `sources/manticore/move-trot-frame-6-generated.png` |

6位相・試作の範囲は [試作記録](../../../../../docs/production/manticore-trot-trial.md)、登録座標は [manticore-trot.json](manticore-trot.json)。標準手順への採用は評価後に判断する。

## trot-half-1 — superseded-by-single-frame-revisions

原画: `development/assets/highland-motions/sources/manticore/move-trot-1-generated.png`

```text
Use case: precise-object-edit. Asset: replacement six-frame TROT walk for the provided LEFT-facing highland manticore pixel-art RPG sprite. This output is ONLY frames 1,2,3: three full-body poses in exactly one horizontal row, three equally sized cells, transparent RGBA PNG, approximately 2304x768. No text, grid, shadows or background.
Reference image 1 is the canonical character identity and palette: mature humanoid lion face, red-brown mane/body, gold-black anklets, purple bat wings held still, dark segmented purple scorpion tail with green stinger. Preserve exact appearance, 3/4 LEFT-facing camera, body/head/wing/tail size and pose. Change only the four legs for the trot. Stationary in-place cycle, no turning, jumping, flying, body stretching or moving along the strip. Wings and tail remain unchanged across frames. Exactly four anatomical legs, all four paws readable and spatially separated, no extra paws.
Define anatomical LEFT as NEAR/foreground side with the larger foreground paws; RIGHT as FAR/background side with smaller darker paws. Pair A = LEFT HIND (near rear) plus RIGHT FRONT (far front). Pair B = LEFT FRONT (near front) plus RIGHT HIND (far rear). Only one diagonal pair is airborne at a time.
Layout in EACH cell uses normalized coordinates. Keep head approx (.24,.47), shoulder (.36,.59), hip (.66,.61), wing top (.48,.13), tail rightmost (.90,.45), root (.55,.89), identical across three cells. Near paw ground line y=.89, far paw ground line y=.85 (perspective). Lifted near paw bottom y=.79, lifted far paw bottom y=.75. Knee/elbow bends must make lifted paws clearly airborne. Do not lower body to compensate. Minimum transparent margins .06 all sides.
FRAME 1 left cell: NEUTRAL midstride. Pair A airborne: near LEFT HIND paw at (.67,.79), far RIGHT FRONT paw at (.28,.75). Pair B grounded: near LEFT FRONT paw (.38,.89), far RIGHT HIND paw (.60,.85). Front/hind separation neutral.
FRAME 2 middle cell: NEAR SIDE CLOSED (front and hind paws approach center), FAR SIDE OPEN (front and hind paws spread). Pair A STILL AIRBORNE: near LEFT HIND paw moves forward/left to (.54,.79); far RIGHT FRONT paw reaches forward/left to (.19,.75). Pair B STILL GROUNDED: near LEFT FRONT paw moves backward/right to (.46,.89); far RIGHT HIND paw moves backward/right to (.74,.85). Near paws are close together under belly; far paws are far apart.
FRAME 3 right cell: KEEP EXACTLY THE SAME X POSITIONS and closed-near/open-far silhouette as frame2, but exchange contact pair. Pair A NOW GROUNDED: near LEFT HIND (.54,.89), far RIGHT FRONT (.19,.85). Pair B NOW LIFTED: near LEFT FRONT (.46,.79), far RIGHT HIND (.74,.75).
Very important: frames 2 and 3 differ only in vertical lift/contact and local joint bends, NOT by switching the near/far open-closed pose. Fixed head/chest/hip position, fixed camera scale and palette in all three cells. Crisp dark outlined pixel-art-like reference details, preserve gold armor on corresponding legs, readable paw tips. This is a trot, paired DIAGONAL leg movement, not a same-side pace and not a gallop.
```

## trot-half-2 — rejected-leg-correspondence

原画: `development/assets/highland-motions/sources/manticore/move-trot-2-generated.png`

```text
Use case: precise-object-edit. Asset: three-frame second half of a SIX-frame in-place TROT cycle for the LEFT-facing highland manticore. Input1 = canonical identity/color reference. Input2 = already generated first three trot frames, used to lock exact body/head/wings/tail geometry, camera and scale. Generate ONLY frames 4,5,6 in exactly one horizontal row of three equal cells, transparent RGBA PNG approximately 2172x724. No text/grid/background/shadow.
Keep same red-brown manticore, mature humanoid lion face, gold-black anklets, purple held-still bat wings, segmented purple scorpion tail with green venom stinger. Keep the head/chest/hip/wings/tail as IDENTICAL as possible to input2. Change ONLY legs. No wing flap, tail swing, head movement, jumping, body length or size changes. Exactly FOUR legs/paws with coherent anatomy.
Anatomical LEFT is NEAR/foreground larger paws; RIGHT is FAR/background smaller dark paws. Pair A=near LEFT HIND and far RIGHT FRONT. Pair B=near LEFT FRONT and far RIGHT HIND. Trot moves diagonal pairs, NEVER same-side pace.
Normalized each-cell coordinates approximate (reference2 geometry takes priority for BODY): face (.16,.35), shoulder (.34,.55), hip (.65,.57), wing top (.51,.07), tail far right (.94,.46). Near grounded paw bottom y=.85; far grounded paw bottom y=.79. Airborne near paw bottom y=.73; airborne far paw bottom y=.67. Fixed body with clear paw clearance and bent joints. Four separated identifiable paws.
FRAME 4 left cell: neutral front/hind separation, opposite contact phase of first-half frame1. Pair A GROUNDED: near LEFT HIND paw (.68,.85), far RIGHT FRONT (.24,.79). Pair B AIRBORNE: near LEFT FRONT (.36,.73), far RIGHT HIND (.57,.67).
FRAME 5 middle: NEAR side OPEN (foreground front paw reaches LEFT/front; foreground rear paw reaches RIGHT/back); FAR side CLOSED (background front/rear approach center). Pair A still GROUNDED: near LEFT HIND (.80,.85), far RIGHT FRONT (.38,.79). Pair B still AIRBORNE: near LEFT FRONT (.20,.73), far RIGHT HIND (.49,.67). Foreground pair visibly far apart, background pair visibly close under belly.
FRAME 6 right: SAME X POSITIONS AS FRAME5, SAME OPEN-NEAR/CLOSED-FAR silhouette, exchange contact pair ONLY. Pair A now AIRBORNE: near LEFT HIND (.80,.73), far RIGHT FRONT (.38,.67). Pair B now GROUNDED: near LEFT FRONT (.20,.85), far RIGHT HIND (.49,.79).
MOST IMPORTANT: frames5 and6 differ ONLY in vertical lift/contact and bent leg joints, keep foot X coordinates and open/closed side positions. Body static as in input2; all sprites at identical scale/position, facing LEFT 3/4 view. Minimum transparent margins around entire horns, wings, paws and tail. Keep canonical colors from image1. No duplicate frame, extra paws, FX or trails. Frame6 must lead smoothly back to input2 frame1, same diagonal A airborne then approaching neutral.
```

## trot-frame-2 — selected

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-2-generated.png`

```text
Use case: precise-object-edit. Edit image2 (single isolated manticore trot pose); image1 is canonical design/palette. Produce ONE full-body transparent sprite pose ONLY, same LEFT-facing camera, same head/body/wings/tail and scale, no background/shadow/text. This is frame2 of an in-place TROT. KEEP EVERYTHING ABOVE THE LEGS IDENTICAL to image2.
Four legs MUST be identified by their actual attachment, not merely paw order. The large bright FOREGROUND FRONT leg attached to shoulder near x=.30 must remain GROUNDED, its paw moves backward/right under chest to x=.39,y=.96. The bright FOREGROUND HIND leg attached to large visible hip near x=.64 must SWING FORWARD toward LEFT under belly, bend at knee with its lifted paw at x=.52,y=.83. Draw that leg from the visible foreground HIP down-left to the belly-center paw; it must NOT extend backward/right. The DARK BACKGROUND FRONT leg behind chest reaches FORWARD/LEFT with its paw AIRBORNE at x=.08,y=.83. The DARK BACKGROUND HIND leg attached to the far hip, partly behind the foreground thigh, stretches BACKWARD/RIGHT, emerging to the right of the foreground hindleg, with its paw GROUNDED at x=.81,y=.96 (slightly higher .93 due perspective acceptable).
The foreground FRONT and HIND feet are therefore CLOSE TOGETHER under torso (x=.39 and .52). Background FRONT/HIND feet are WIDE APART (x=.08 and .81). Airborne diagonal = background FRONT + foreground HIND. Supporting diagonal = foreground FRONT + background HIND. This diagonal contact pairing is mandatory. Render foreground hind thigh and shin connecting visibly to its FORWARD tucked paw, far hind darker behind it stretching backward to its planted paw. Exactly four paws, no fifth limb.
Identity and above-leg silhouette unchanged from image2: mature human-faced lion manticore, red mane/fur, purple bat wings HELD STILL, curved segmented purple scorpion tail and green stinger, gold-black ankle armor. Full outline inside generous transparent margins. Reference1 colors unchanged. Strongly bent lifted paws with at least .10 height of ground clearance. No horizontal body movement or scale change.
```

## trot-frame-3 — selected

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-3-generated.png`

```text
Use case: precise-object-edit. Output ONE full-body LEFT-facing manticore sprite on TRANSPARENT RGBA, no background/shadow/text. Image1 is canonical design/palette; image2 is edit target pose. Keep IDENTICAL head, mane, face, torso, hip, wing and tail geometry, all RGB colors, camera, scale and position of image2. Change ONLY legs below their attachment. Same mature human-faced lion, red fur, gold-black-purple ankle armor, held-still purple bat wings, segmented purple tail with green stinger. Exactly FOUR coherent connected legs/paws; preserve which leg is foreground and which is background. No body stretch, turn, wing flap or tail movement. Generous transparent margins, nothing cropped.
FRAME3: Edit image2 by exchanging the diagonal support and swing pair. Keep all four PAW X POSITIONS EXACTLY UNCHANGED. Do NOT move any paw forward/backward. The largest bright FOREGROUND FRONT paw (second from left, currently lowest) must RISE about 120 pixels and bend at elbow. The dark BACKGROUND HIND paw (rightmost, currently grounded) must RISE about 110px and bend at hock. The bright FOREGROUND HIND paw attached to the visible large hip (third from left, currently curled FORWARD under belly) must LOWER about 140px to ground, keeping its x position and forward-leaning leg; preserve visible thigh→shin→paw connection. The dark BACKGROUND FRONT paw (leftmost, currently lifted) must LOWER about 85px to its perspective ground plane. Final supporting diagonal = background FRONT + foreground HIND; lifted diagonal = foreground FRONT + background HIND. Final foreground front/hind paws remain CLOSE TOGETHER; background front/hind paws remain WIDE APART. Only vertical paw movement/local joint bend, everything else identical. Near ground at same original lowest foreground paw baseline; far ground about 45px above near. Clear airborne clearance 110px.
```

## trot-frame-4 — selected

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-4-generated.png`

```text
Use case: precise-object-edit. Output ONE full-body LEFT-facing manticore sprite on TRANSPARENT RGBA, no background/shadow/text. Image1 is canonical design/palette; image2 is edit target pose. Keep IDENTICAL head, mane, face, torso, hip, wing and tail geometry, all RGB colors, camera, scale and position of image2. Change ONLY legs below their attachment. Same mature human-faced lion, red fur, gold-black-purple ankle armor, held-still purple bat wings, segmented purple tail with green stinger. Exactly FOUR coherent connected legs/paws; preserve which leg is foreground and which is background. No body stretch, turn, wing flap or tail movement. Generous transparent margins, nothing cropped.
FRAME4 neutral trot, opposite diagonal contact of image2/frame1. Keep ALL FOUR paw X positions EXACTLY from image2. The large bright FOREGROUND FRONT paw under shoulder currently planted must LIFT by 75 pixels, bending elbow, keeping x≈.25. The small dark BACKGROUND HIND paw under rear belly currently planted must LIFT by 65px, keeping x≈.46. The bright FOREGROUND HIND paw at right connected to visible hip currently lifted must LOWER to near ground, keeping x≈.72. The small dark BACKGROUND FRONT paw at far left currently lifted must LOWER to its ground plane, keeping x≈.08. Both forelegs stay beneath their shoulders in neutral separation; do NOT stretch the foreground front leg leftward. Final AIRBORNE = foreground FRONT and background HIND. Final GROUNDED = background FRONT and foreground HIND. The near ground y equals image2 lowest fore paw, far ground 40px higher. Preserve four legs' attachment and identity, same body and camera. This is NEUTRAL separation, not extreme open/closed.
```

## trot-frame-5 — selected

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-5-generated.png`

```text
Use case: precise-object-edit. Output ONE full-body LEFT-facing manticore sprite on TRANSPARENT RGBA, no background/shadow/text. Image1 is canonical design/palette; image2 is edit target pose. Keep IDENTICAL head, mane, face, torso, hip, wing and tail geometry, all RGB colors, camera, scale and position of image2. Change ONLY legs below their attachment. Same mature human-faced lion, red fur, gold-black-purple ankle armor, held-still purple bat wings, segmented purple tail with green stinger. Exactly FOUR coherent connected legs/paws; preserve which leg is foreground and which is background. No body stretch, turn, wing flap or tail movement. Generous transparent margins, nothing cropped.
FRAME5: foreground side OPEN, background side CLOSED; diagonal TROT. The bright FOREGROUND FRONT leg attached to near shoulder reaches FORWARD/LEFT with its large lifted paw at x≈.12, its bottom 75px ABOVE image2 near ground. The bright FOREGROUND HIND leg attached to the visible large hip extends BACKWARD/RIGHT with large GROUNDED paw at x≈.83, near ground baseline same as image2 lowest paw. The small DARK BACKGROUND FRONT leg behind chest angles BACKWARD/RIGHT under body with its GROUNDED paw x≈.42, far ground 35px above near. The small DARK BACKGROUND HIND leg behind hip swings FORWARD/LEFT under belly with AIRBORNE paw x≈.53, 100px above near ground. Foreground paw pair at .12 and .83 is WIDE APART; background paw pair at .42 and .53 is CLOSE TOGETHER under belly. Foreground FRONT + background HIND are LIFTED, background FRONT + foreground HIND are GROUNDED. Make actual connected leg attachment clear: the foreground hind thigh slopes downRIGHT to the backmost paw; the background hind leg emerges from behind it and bends forwardLEFT to paw under belly. No crossing limb identities or extra legs. Face/body/wings/tail identical to image2.
```

## trot-frame-6 — rejected-extra-front-leg

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-6-rejected.png`

```text
Use case: precise-object-edit. Image1 canonical identity/color reference; image2 EXACT edit target, single frame5 of manticore trot. Output ONE LEFT-facing full-body transparent RGBA sprite, same scale, framing and pose above legs as image2. No background/shadow/text. Preserve identical head, mane, face, torso, hip, held-still purple wings, tail/green stinger, outline, palette. Change ONLY the four legs to exchange diagonal ground contact. Exactly four connected legs and four paws.
FRAME6 = same FOREGROUND OPEN / BACKGROUND CLOSED silhouette as image2. Keep EACH PAW X POSITION EXACTLY UNCHANGED, no forward/backward movement:
1. LARGE BRIGHT FOREGROUND FRONT paw (LEFTMOST, extended LEFT, currently lifted x≈170,y≈865): LOWER vertically to near ground, paw bottom approximately y=1060. Keep its x position, stretch existing elbow downward, still reaching left.
2. SMALL DARK BACKGROUND FRONT paw (second from left, under belly x≈550, currently planted): RAISE vertically about 130px, bottom approx y=880, keep x position, bend elbow. It stays under belly, NOT reaching far left.
3. SMALL DARK BACKGROUND HIND paw (third from left, under belly x≈705, currently lifted): LOWER vertically to far ground, bottom approx y=1005, keep x position, extend hock downward. It stays under belly.
4. LARGE BRIGHT FOREGROUND HIND paw attached to visible foreground hip (RIGHTMOST x≈1050, currently planted): RAISE vertically about 150px, bottom approx y=900, keep x position, bend knee/hock. This rear leg still extends backwardRIGHT from hip. Do NOT swing it forwardLEFT.
Final lifted diagonal = BACKGROUND FRONT (paw2) plus FOREGROUND HIND (paw4). Grounded diagonal = FOREGROUND FRONT (paw1) plus BACKGROUND HIND (paw3). Foreground pair remains WIDE APART at x170/1050, background pair remains CLOSE at x550/705. Mandatory exact leg identities: bright large foreground hip attached to lifted rightmost rear paw, dark far hind attached to planted third paw. Only vertical lift/contact and local joints change from image2. Full claws/horns/wings/tail visible with clear transparent margins.
```

## trot-frame-6Revision — selected

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-6-generated.png`

```text
Edit this EXACT existing sprite. Create one replacement pose with EXACTLY FOUR LEGS AND FOUR PAWS. Do not add any leg or paw. Preserve all pixels above the legs as closely as possible: same face, mane, torso, hips, purple wings, tail, colors, camera, position, size. Transparent PNG, full body with margins, no text/background/shadow.
This sprite already has four paws. Change the existing paws IN PLACE; replace their leg silhouettes, never retain the old paw in addition to a new paw. The character faces LEFT.
The BIG FOREGROUND FRONT paw is currently extended far LEFT and raised. LOWER that SAME paw vertically to the ground, keeping its horizontal location far LEFT. It remains the LEFTMOST paw.
The SMALL BACKGROUND FRONT paw is currently grounded under the belly (the SECOND paw from left). RAISE that SAME paw vertically by about 120px, keeping its horizontal location under the belly and bending its elbow.
The SMALL BACKGROUND REAR paw is currently raised under the belly (the THIRD paw from left). LOWER that SAME paw vertically to the ground, keeping its horizontal position near the center of belly.
The BIG FOREGROUND REAR paw is currently planted far RIGHT (the FOURTH/rightmost paw). RAISE that SAME paw vertically by about 140px, keeping its horizontal location far RIGHT and bending its hock.
Final FOUR paw positions left-to-right: big grounded front, small airborne front, small grounded rear, big airborne rear. Ground pair = near front + far rear; airborne pair = far front + near rear. Near pair open wide; far pair closed together. Do NOT move paws horizontally, do NOT change any body parts above legs. No leftover fifth paw, no duplicate leg under the chest.
```

## trot-frame-1Revision — selected

原画: `development/assets/highland-motions/sources/manticore/move-trot-frame-1-generated.png`

```text
Edit this EXACT existing single manticore sprite, produce one transparent PNG replacement pose. Keep head, mane, torso, hip, purple wings, tail, colors, scale and camera IDENTICAL. Only exchange vertical ground contacts of the EXISTING FOUR paws. Do not add any paw or leg.
This is NEUTRAL trot frame1. Character remains LEFT-facing. Keep ALL FOUR PAW X POSITIONS UNCHANGED.
The LARGE foreground FRONT paw (second paw from left, currently lifted near chest) lowers to ground. Keep paw center x≈325 and bottom near y=1070.
The SMALL background FRONT paw (leftmost, currently grounded) rises about 120px, keeping x≈150.
The LARGE foreground REAR paw (rightmost, attached to visible hip, currently grounded) rises about 120px, keeping x≈950.
The SMALL background REAR paw (third paw from left, currently raised under belly) lowers to its ground plane, keeping x≈620; far ground about 45px above near.
Final paws left-to-right: small lifted front, big grounded front, small grounded rear, big lifted rear. Airborne diagonal = far front + near rear. Supporting diagonal = near front + far rear. Exactly FOUR paws, do not keep an old paw when moving it. Neutral front/hind separation and exactly same above-leg silhouette as the provided pose. Full-body sprite with transparent margins, no shadow/background/text.
```
