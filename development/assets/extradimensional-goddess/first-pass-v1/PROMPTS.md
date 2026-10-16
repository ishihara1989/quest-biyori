# 異次元の女神 一次生成プロンプト

内蔵 image_gen。各ジョブ1回。画像の修正・再生成・本編登録は対象外。

## parts/body-seated

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/body-seated.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Separate master body for phase 1. Target face (246,157), chest (256,224), hips (268,294), hands (219,199)/(392,288), shoes (222,418)/(304,448).
Frames:
1. Same cheek-supported, crossed-leg sitting pose, far hand relaxed. No throne or large ring.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/body-floating

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/body-floating.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Separate phase 2 master body. Face (252,128), hips (268,265), hands (170,244)/(352,260), shoes (232,391)/(276,416). Keep the same body scale as phase 1.
Frames:
1. Upright hovering, palms low and open, stern cyan eyes. No large rings.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/throne

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/throne.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Isolate the original phase 1 throne, shallow left three-quarter view. Front feet (170,448)/(382,448). Complete crescent tips and armrests.
Frames:
1. EMPTY ivory-gold crescent throne with navy cushions. No woman, hair, dress, small crown or large circular halo.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/halo

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/halo.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (268,156). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Isolate phase 2 celestial halo. Center (268,156); radius about 110, outer arcs within x=70..442,y=52..300. Keep original geometric motif.
Frames:
1. Three rigid broken gold celestial rings with cyan nodes, no feathers, no body or chair.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/ground-shadow

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/ground-shadow.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Ground shadow at (256,448), ellipse 170x28, contained in safe margins.
Frames:
1. One soft low elliptical contact shadow, dark violet, transparent center-to-edge falloff; no hard floor slab.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/halo-node

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/halo-node.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Independent celestial halo diamond node, 36x52 maximum silhouette centered (128,128).
Frames:
1. One cyan diamond gemstone with gold frame, thin dark-violet edge.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/debris

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/debris.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,256). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Background layer prop, NOT battle-floor rubble. Fragment within x=150..360,y=120..390, same pixel-art style as goddess sanctuary.
Frames:
1. One floating broken ivory marble column fragment with antique gold trim, subtly cool shading.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/target-star

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/target-star.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Overhead homing meteor target marker. Maximum 48x48, not a circular ground telegraph.
Frames:
1. One small hollow four-point gold/cyan target star, clear transparent center.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## parts/eclipse-rim

```text
Use case: stylized-concept
Asset type: first-pass production component, transparent pixel-art PNG sprite sheet, asset ID parts/eclipse-rim.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,256). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Background pulse overlay, quiet thin rim with radius 175, avoid attack-like filled glow.
Frames:
1. One thin cyan-pale-gold eclipse edge ring, transparent inside and outside, no opaque sky.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p1-idle

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p1-idle.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 1 seated pose. Face (246,157), hips (268,294), left-on-screen hand (219,199) supporting cheek, crossed shoes (222,418)/(304,448). Sitting body only, chair stays absent. Subtle breathing only. Hands, hips and shoes fixed.
Frames:
1. Chest/face dy=0, sleeve tip dy=0.
2. Chest/face dy=-1, sleeve tip dy=1.
3. Chest/face dy=0, half blink, sleeve tip dy=0.
4. Chest/face dy=1, sleeve tip dy=-1; close loop to frame 1.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p1-shot

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p1-shot.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 1 seated pose. Face (246,157), hips (268,294), left-on-screen hand (219,199) supporting cheek, crossed shoes (222,418)/(304,448). Sitting body only, chair stays absent. Keep cheek support and crossed legs absolutely unchanged.
Frames:
1. Right-on-screen hand (392,288), neutral.
2. R=(367,270), prepare finger flick.
3. R=(344,260), flick toward LEFT, emission pose; no drawn projectile.
4. R=(392,288), original neutral.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p1-snap

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p1-snap.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 1 seated pose. Face (246,157), hips (268,294), left-on-screen hand (219,199) supporting cheek, crossed shoes (222,418)/(304,448). Sitting body only, chair stays absent. Only far hand performs a readable finger snap; maintain exactly one connected hand.
Frames:
1. R=(392,288), relaxed.
2. R=(354,246), thumb and middle fingertip TOUCH.
3. R=(348,243), middle finger folds into palm after SNAP, thumb separates, no drawn glint.
4. R=(392,288), return.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p1-hit

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p1-hit.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 2 equal cells in a strict 2 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 1 seated pose. Face (246,157), hips (268,294), left-on-screen hand (219,199) supporting cheek, crossed shoes (222,418)/(304,448). Sitting body only, chair stays absent. Small hit reaction, not an interruption.
Frames:
1. Face dx=2,dy=1; chest dx=2, mild shoulder recoil, maintain cheek contact.
2. Face/chest return to neutral, hand still supporting cheek.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/phase-rise-1

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/phase-rise-1.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Continuous 9-frame seated-to-floating transition, segment 1. Same body scale; leg anatomy stays connected, no chair. 
Frames:
1. F1 face(246,157),hips(268,294),L(219,199),R(392,288),shoes(222,418)/(304,448): seated, crossed legs, half-closed eyes.
2. F2 face(248,154),hips(268,294),L(225,214),R(387,282),shoes(223,421)/(303,448): release cheek, open eyes.
3. F3 face(251,151),hips(268,294),L(224,240),R(374,276),shoes(230,432)/(297,448): straighten shoulders, begin UNcrossing legs.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/phase-rise-2

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/phase-rise-2.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Continuous 9-frame seated-to-floating transition, segment 2. Same body scale; leg anatomy stays connected, no chair. Continue immediately after previous segment without pose reset.
Frames:
1. F4 face(252,148),hips(266,289),L(217,267),R(368,273),BOTH shoes(242,448)/(286,448) planted: lean forward to stand.
2. F5 face(252,140),hips(266,281),L(207,268),R(357,269),BOTH shoes(242,448)/(286,448): rise upright, feet still grounded.
3. F6 face(252,132),hips(267,273),L(196,261),R(349,264),shoes(240,428)/(282,436): lift off, hair still hangs downward.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/phase-rise-3

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/phase-rise-3.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Continuous 9-frame seated-to-floating transition, segment 3. Same body scale; leg anatomy stays connected, no chair. Continue immediately after previous segment without pose reset.
Frames:
1. F7 face(252,128),hips(268,265),L(184,252),R(348,259),shoes(236,405)/(279,423): arms open, hair begins lifting with delay.
2. F8 face(252,127),hips(268,264),L(175,245),R(351,259),shoes(233,393)/(276,417): sleeves expand, no halo baked in.
3. F9 face(252,128),hips(268,265),L(170,244),R(352,260),shoes(232,391)/(276,416): match floating master.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-idle

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-idle.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Hands (170,244)/(352,260). Smooth small hover; floor anchor fixed.
Frames:
1. Body dy=0, hair/sleeve tips dy=2.
2. Body dy=-3, hair/sleeve tips dy=0.
3. Body dy=0, hair/sleeve tips dy=-2.
4. Body dy=3, hair/sleeve tips dy=0.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-drift

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-drift.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Move toward LEFT: hair/sleeves lag to RIGHT. Body does not translate horizontally inside the cell. Keep left-facing camera.
Frames:
1. Body dy=0; hair tips dx=8.
2. Body dy=-1; hair tips dx=12.
3. Body dy=0; hair tips dx=8.
4. Body dy=1; hair tips dx=4.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-meteor-1

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-meteor-1.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Continuous p2-meteor 6-frame animation, segment 1. Stars fall from ABOVE, not direct hand beams.
Frames:
1. L/R=(170,244)/(352,260), neutral.
2. L/R=(174,211)/(347,218), lift palms.
3. L/R=(186,168)/(336,174), palms raised; 3 stars will be separate FX, DO NOT draw them.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-meteor-2

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-meteor-2.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Continuous p2-meteor 6-frame animation, segment 2. Stars fall from ABOVE, not direct hand beams.
Frames:
1. L/R=(166,209)/(359,218), sweep DOWN to release first overhead meteor.
2. L/R=(158,257)/(366,267), follow-through downward.
3. L/R=(170,244)/(352,260), return to idle.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-cast-1

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-cast-1.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Continuous p2-cast 6-frame animation, segment 1. No effect baked into hands.
Frames:
1. L/R=(170,244)/(352,260), neutral.
2. L/R=(216,222)/(309,222), gather palms inward.
3. L/R=(238,209)/(286,209), palms close before chest, HOLD-ready.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-cast-2

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-cast-2.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Continuous p2-cast 6-frame animation, segment 2. No effect baked into hands.
Frames:
1. L/R=(157,183)/(367,190), open both arms apart.
2. L/R=(136,215)/(386,222), press forward/outward, release.
3. L/R=(170,244)/(352,260), recover idle.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-ultimate-1

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-ultimate-1.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Zero-world convergence, continuous 9-frame motion segment 1. Keep face readable between arms; no orb/beam.
Frames:
1. L/R=(170,244)/(352,260), neutral.
2. L/R=(216,211)/(310,211), draw toward chest.
3. L/R=(238,195)/(286,195), palms close at chest.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-ultimate-2

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-ultimate-2.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Zero-world convergence, continuous 9-frame motion segment 2. Keep face readable between arms; no orb/beam.
Frames:
1. L/R=(240,155)/(284,155), raise together before face.
2. L/R=(238,121)/(286,121), raise above brow.
3. L/R=(236,104)/(288,104), palms above head, HOLD-ready.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-ultimate-3

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-ultimate-3.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Zero-world convergence, continuous 9-frame motion segment 3. Keep face readable between arms; no orb/beam.
Frames:
1. L/R=(169,167)/(353,167), powerful outward release.
2. L/R=(145,220)/(378,220), arms down/out, impact pose.
3. L/R=(170,244)/(352,260), return to idle.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-hit

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-hit.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 2 equal cells in a strict 2 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Small hit reaction; large halo remains separate and stationary.
Frames:
1. Chest dx=3, face dx=2,dy=-1; hips fixed.
2. Chest and face return to neutral.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-break

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-break.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Interruption followed by rest, not defeat.
Frames:
1. L/R=(238,209)/(286,209), interrupted chest-level hold.
2. L/R=(215,276)/(313,278), palms DROP, shoulders lose tension.
3. L/R=(185,270)/(335,275), tired rest pose, connected arms.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/p2-break-overhead

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/p2-break-overhead.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: One square transparent canvas, one complete isolated asset. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. ADDITIONAL transition entry from ultimate frame 6 to break frame 2. Do not teleport hands to chest.
Frames:
1. Hands lower continuously from above-head (236,104)/(288,104) toward (220,184)/(302,184), elbows bending, shoulders slack.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## motions/down

```text
Use case: stylized-concept
Asset type: first-pass production motion, transparent pixel-art PNG sprite sheet, asset ID motions/down.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the goddess body, hair, sleeves, dress, shoes and her SMALL crown. OMIT the chair, large celestial halo, floor shadow and ALL attack lights: these are separate layers. Preserve unsupported sitting pose for phase 1.
Primary request: Phase 2 floating pose. Face (252,128), hips (268,265), shoes (232,391)/(276,416). No large halo. Final defeat: lose strength, sink, dissolve. No large halo or ring; separate defeat FX supplies those.
Frames:
1. Body dy=0, eyes close, L/R=(170,244)/(352,260).
2. Body dy=8, shoulders slump, L/R=(202,274)/(327,285).
3. Body dy=20, L/R=(220,298)/(312,309), silhouette begins dissolving into sparse gold/cyan pixels, keep anatomy.
4. Body dy=28, L/R=(226,313)/(307,322), faint whole-body afterimage, no reward gem.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/star-bolt

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/star-bolt.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Small left-facing star projectile. White/cyan core, slender gold tail trailing RIGHT; head remains anchored, changes shape rather than moving across cell.
Frames:
1. Global F1: {"f":1,"ms":70,"center":[128,128],"diamondSize":[24,16],"alpha":1}. 
2. Global F2: {"f":2,"ms":90,"center":[128,128],"diamondSize":[80,28],"tailEnd":[206,128],"alpha":1}. 
3. Global F3: {"f":3,"ms":80,"center":[128,128],"diamondSize":[110,14],"tailEnd":[223,128],"alpha":0.55}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/star-impact

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/star-impact.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Small ordinary hit: point, crisp four-point flash, fading fine rays. Center fixed.
Frames:
1. Global F1: {"f":1,"ms":60,"radius":10,"alpha":1}. 
2. Global F2: {"f":2,"ms":90,"radius":38,"alpha":1}. 
3. Global F3: {"f":3,"ms":130,"radius":28,"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/snap-glint

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/snap-glint.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Tiny fingertip snap flash: dot, small cross, fine gold afterglow. Must not hide goddess face.
Frames:
1. Global F1: {"f":1,"ms":40,"center":[128,128],"radius":4,"alpha":1}. 
2. Global F2: {"f":2,"ms":40,"center":[128,128],"crossSize":[44,44],"alpha":1}. 
3. Global F3: {"f":3,"ms":40,"center":[128,128],"crossSize":[28,28],"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/star-mirror-open

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/star-mirror-open.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Shared star mirror: upright narrow gold/cyan rim, star-filled dark purple opening. NO boss or human. Thin slit opens to female-sized portal; final opening width180 height300 centered(256,252). Separate rim/inner opening readable.
Frames:
1. Global F1: {"f":1,"ms":80,"center":[256,252],"openingSize":[4,300]}. 
2. Global F2: {"f":2,"ms":80,"center":[256,252],"openingSize":[60,300]}. 
3. Global F3: {"f":3,"ms":90,"center":[256,252],"openingSize":[140,300]}. 
4. Global F4: {"f":4,"ms":80,"center":[256,252],"openingSize":[180,300]}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/phantom-recall

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/phantom-recall.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Shared phantom recall OVERLAY ONLY: thin gold cracks, diamond shards, shards contract toward center, then one vertical slit. No humanoid rendered; phantom will be separately clipped. Not a death explosion.
Frames:
1. Global F1: {"f":1,"ms":50,"center":[256,252],"crackAnglesDeg":[45,160,280],"phantomAlpha":1}. 
2. Global F2: {"f":2,"ms":60,"fragmentCenters":[[168,160],[344,184],[186,340],[326,348]],"phantomAlpha":0.55}. 
3. Global F3: {"f":3,"ms":60,"fragmentCenters":[[232,230],[280,236],[238,278],[274,284]],"phantomAlpha":0.15}. 
4. Global F4: {"f":4,"ms":60,"center":[256,252],"openingSize":[4,300],"phantomAlpha":0}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/homing-meteor

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/homing-meteor.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Downward traveling star meteor head. Gold long tail upward, white/cyan sharp head at anchor(128,128). One meteor per frame; no ground crater. Curve will be rendered later.
Frames:
1. Global F1: {"f":1,"ms":80,"center":[128,128],"diamondSize":[22,22],"alpha":1}. 
2. Global F2: {"f":2,"ms":100,"center":[128,128],"diamondSize":[48,24],"alpha":1}. 
3. Global F3: {"f":3,"ms":80,"center":[128,128],"diamondSize":[60,24],"alpha":1}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/meteor-impact

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/meteor-impact.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 256x256; floor/registration anchor is (128,160). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Single target star contact, LOW gold/cyan star crown at ground, fading sparks. No wide splash ring or crater.
Frames:
1. Global F1: {"f":1,"ms":70,"center":[128,160],"radius":10,"alpha":1}. 
2. Global F2: {"f":2,"ms":90,"center":[128,160],"crownSize":[104,72],"alpha":1}. 
3. Global F3: {"f":3,"ms":140,"center":[128,160],"radius":64,"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/rift-open

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/rift-open.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,256). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Black-purple void mouth with thin gold/cyan torn outline: point, vertical fine slit, oval, tall narrow open rift. Fixed center.
Frames:
1. Global F1: {"f":1,"ms":80,"center":[256,256],"openingSize":[6,6]}. 
2. Global F2: {"f":2,"ms":100,"center":[256,256],"openingSize":[8,190]}. 
3. Global F3: {"f":3,"ms":110,"center":[256,256],"openingSize":[44,280]}. 
4. Global F4: {"f":4,"ms":140,"center":[256,256],"openingSize":[84,350]}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/rift-cut

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/rift-cut.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 1024x256; floor/registration anchor is (512,128). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: HORIZONTAL wide torn slash band. White thin core, then gold/cyan ragged strip, then dim shards. Max width820 height80 in virtual1024x256 cell, centered(512,128). No character or portal.
Frames:
1. Global F1: {"f":1,"ms":60,"center":[512,128],"bandSize":[820,4],"alpha":1}. 
2. Global F2: {"f":2,"ms":100,"center":[512,128],"bandSize":[820,80],"alpha":1}. 
3. Global F3: {"f":3,"ms":180,"center":[512,128],"bandSize":[780,30],"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/celestial-wave

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/celestial-wave.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,256). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Thin complete circular shock ring, brighter thick ring, broken fading arc. Transparent interior. Radius grows170->205->220 with fixed center; no filled disc.
Frames:
1. Global F1: {"f":1,"ms":100,"center":[256,256],"radius":170,"thickness":4,"alpha":1}. 
2. Global F2: {"f":2,"ms":160,"center":[256,256],"radius":205,"thickness":12,"alpha":1}. 
3. Global F3: {"f":3,"ms":240,"center":[256,256],"radius":220,"thickness":5,"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/zero-converge

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/zero-converge.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 4 equal cells in a strict 2 columns by 2 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x768; floor/registration anchor is (undefined). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Zero-world convergence. F1/F2 are an elevated gathering ORB, centered(256,156); F3/F4 are a SEPARATE vertical beam from(256,160) to(256,614). Orb and ground pillar are different assets conceptually: do not connect them as one projectile. Strict equal cells tall512x768.
Frames:
1. Global F1: {"f":1,"ms":160,"center":[256,156],"radius":24}. 
2. Global F2: {"f":2,"ms":220,"center":[256,156],"radius":100,"hold":true}. 
3. Global F3: {"f":3,"ms":100,"pillarTop":[256,160],"pillarBottom":[256,614],"width":80}. 
4. Global F4: {"f":4,"ms":300,"pillarTop":[256,160],"pillarBottom":[256,614],"width":160,"fragmentMaxX":416,"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/phase-awaken

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/phase-awaken.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,448). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Awakening overlay only: low ellipse beneath shoes, sparse ascending diamond particles, then three halo nodes light. No body/halo shape baked in.
Frames:
1. Global F1: {"f":1,"ms":180,"ringCenter":[256,410],"ellipseSize":[140,30]}. 
2. Global F2: {"f":2,"ms":240,"particlesCenters":[[230,380],[256,330],[284,270]],"radius":6}. 
3. Global F3: {"f":3,"ms":220,"nodeCenters":[[126,166],[256,100],[386,166]],"radius":8}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/goddess-defeat-1

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/goddess-defeat-1.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,240). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Final goddess defeat overlay: halo cracks, ring shards, convergence point, ONE jewel-shaped reward light, fading scatter, near-empty end. No goddess body, no multiple rewards.
Frames:
1. Global F1: {"f":1,"ms":160,"ringCenter":[268,156],"radius":110,"crackAnglesDeg":[45,180,290]}. 
2. Global F2: {"f":2,"ms":180,"fragmentCenters":[[150,110],[386,130],[155,275],[371,290]]}. 
3. Global F3: {"f":3,"ms":200,"center":[256,240],"radius":70}. 
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```

## effects/goddess-defeat-2

```text
Use case: stylized-concept
Asset type: first-pass production effect, transparent pixel-art PNG sprite sheet, asset ID effects/goddess-defeat-2.
Input images: original master images are identity/palette/style references, NOT images to repair. Make a NEW requested asset.
Match the supplied original master references: SAME adult goddess, mature face, cyan eyes, silver-white hair with lavender shadows, ivory/navy ceremonial dress, gold geometric trim, cyan diamonds, gold shoes, small floating crown. Crisp JRPG pixel art, stepped pixel clusters, dark purple contour. Shallow three-quarter view facing LEFT. Exactly two arms and two legs. No redesign, no wings, no text, labels, grid lines, scenery, checkerboard or watermark. Preserve true transparent alpha.
Layout: 3 equal cells in a strict 3 columns by 1 rows grid, chronological row-major order. Every cell has exactly the same virtual camera, scale and coordinate origin. No panels or visible separators. Never combine phases into one cell. Each cell's virtual coordinate system is 512x512; floor/registration anchor is (256,240). Keep at least 10 percent clear padding on all cell edges; never crop hair, sleeves, hands, ornaments, shoes or effects. Coordinates below are production targets, not text to draw.
Layer separation: ONLY the specified isolated component or effect; NO goddess, humanoids, chairs or environment unless explicitly requested below.
Primary request: Final goddess defeat overlay: halo cracks, ring shards, convergence point, ONE jewel-shaped reward light, fading scatter, near-empty end. No goddess body, no multiple rewards.
Frames:
1. Global F4: {"f":4,"ms":180,"center":[256,240],"diamondSize":[36,52]}. 
2. Global F5: {"f":5,"ms":260,"center":[256,240],"radius":140,"alpha":0.4}. 
3. Global F6: {"f":6,"ms":200,"center":[256,240],"radius":140,"alpha":0}. Show only very faint end afterglow, alpha approaches zero.
No duplicate contact-sheet legends, no numbers. True transparent background, readable discrete pixels. This is ONE initial generation; preserve the planned poses and timing.
```
