# 異次元の女神 修正第1回：全文プロンプト

内蔵 image_gen。試行別の全文・参照・ハッシュは generation.json に保持。

## parts/throne

```text
Use case: precise-object-edit
Asset type: repaired transparent JRPG pixel-art sprite sheet, parts/throne.
Input image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.
Layout: 1 equal square cells, 1 columns and 1 rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.
ONE empty ivory/navy/gold throne matching the original. Preserve the chair silhouette, crescent back, cushions, legs and armrests. Remove the entire LARGE circular celestial ring behind the chair. No rings floating behind or above it, no woman, body, hair, dress, small crown or gems detached as extra objects. Complete chair within central safe area.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
```

## parts/halo

```text
Use case: precise-object-edit
Asset type: repaired transparent JRPG pixel-art sprite sheet, parts/halo.
Input image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.
Layout: 1 equal square cells, 1 columns and 1 rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.
ONE isolated rigid gold celestial ring assembly matching the large rings behind the original floating goddess, with cyan diamond nodes. Remove the SMALL floating elliptical crown above her head: that crown belongs to the body layer. No person, face, hair, clothes, chair or ground. Keep the large circular ring motif with clean transparent interior. Complete assembly within central safe area.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
```

## motions/p1-shot

```text
Use case: precise-object-edit
Asset type: repaired transparent JRPG pixel-art sprite sheet, motions/p1-shot.
Input image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.
Layout: 4 equal square cells, 2 columns and 2 rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.
Seated body only, unsupported sitting pose, cheek supported by the SCREEN-LEFT arm, crossed legs unchanged. Move ONLY the SCREEN-RIGHT arm from its existing shoulder. EXACTLY TWO ARMS: the emitting hand is still on the screen-right side of the body, never add a hand to the left of the cheek-support arm. No throne, large ring, shadow, projectile or glow. 
Frames:
Right-on-screen hand (392,288), neutral.
R=(367,270), prepare finger flick.
R=(344,260), flick toward LEFT, emission pose; no drawn projectile.
R=(392,288), original neutral.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
```

## motions/p2-cast-1

```text
Use case: precise-object-edit
Asset type: repaired transparent JRPG pixel-art sprite sheet, motions/p2-cast-1.
Input image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.
Layout: 3 equal square cells, 3 columns and 1 rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.
Upright FLOATING body only, torso vertical, legs extend DOWN naturally as in original floating master. No seated pose, raised seated knee, crossed seated legs, cheek support, throne or large halo. Keep clothing opaque; skirt lining covers the legs during arm raises. Hands remain attached through elbows to their own two shoulders. No attack effects or magic lights. 
Frames:
L/R=(170,244)/(352,260), neutral.
L/R=(216,222)/(309,222), gather palms inward.
L/R=(238,209)/(286,209), palms close before chest, HOLD-ready.
Hands do not touch or clasp; there is a small empty space between inward-facing palms in F3. F6 must match the floating low-open-palms starting pose.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
```

## motions/p2-cast-2

```text
Use case: precise-object-edit. Input 1 is the EDIT TARGET: a three-cell transparent pixel-art animation strip. Input 2 is the ORIGINAL identity and palette reference. Fix ONLY the composition of the three-cell strip: ZOOM OUT substantially, reduce EVERY complete figure to 70 percent of its current height and width, leave very broad empty TRANSPARENT borders around EACH figure. Maintain three equal square cells in one horizontal row. All hair, shoes, hands and sleeves must be fully isolated, no pixels touching or crossing cell boundaries. Keep the existing three poses and their LEFT-to-RIGHT order: 1 spread both palms at shoulder height; 2 press both palms forward; 3 low relaxed open palms at waist. Preserve exactly two arms, the same adult goddess, face, hair, clothing, colors, upright floating legs, and small crown. No background, grid, text, large halo, throne or effects. Do not redraw the pose sequence or add any object. Each sprite must visibly appear SMALL inside its cell. True transparent alpha.
```

## motions/p2-ultimate-1

```text
Edit the supplied adult fantasy goddess into ONE transparent pixel-art animation strip of exactly THREE equal SQUARE cells in ONE HORIZONTAL ROW. Input 1 is the fixed original identity and palette; input 2 is the isolated floating body. Keep the same mature face, silver/lavender hair, ivory/navy/gold opaque costume, gold shoes and small crown. Body only: no large rings or throne. Full figure in each cell, upright hovering legs pointing downward as in the body reference. Identical head, hips, leg positions and character scale in all three cells. Broad empty transparent padding around EACH figure. Each figure is only 65 percent as tall as its cell. Read from LEFT to RIGHT:
LEFT pose: both arms low, spread gently to the sides at waist height, palms up. MIDDLE pose: both elbows bend, hands move inward to the lower chest. RIGHT pose: hands hover close together in front of the upper chest, still BELOW THE CHIN, with a small gap between palms. All three poses keep hands below the chin. These are only the beginning of the spell, never draw raised arms.
Precisely two arms connected to their shoulders. Crisp pixel clusters, dark violet outlines, no text, no grid lines, no effects, no extra body or ghost trail. Preserve real transparent alpha.
```

## motions/p2-ultimate-2

```text
Use case: precise-object-edit
Asset type: repaired transparent JRPG pixel-art sprite sheet, motions/p2-ultimate-2.
Input image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.
Layout: 3 equal square cells, 3 columns and 1 rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.
Upright FLOATING body only, torso vertical, legs extend DOWN naturally as in original floating master. No seated pose, raised seated knee, crossed seated legs, cheek support, throne or large halo. Keep clothing opaque; skirt lining covers the legs during arm raises. Hands remain attached through elbows to their own two shoulders. No attack effects or magic lights. 
Frames:
L/R=(240,155)/(284,155), raise together before face.
L/R=(238,121)/(286,121), raise above brow.
L/R=(236,104)/(288,104), palms above head, HOLD-ready.
The final release returns to low open palms and upright hovering; never return to cheek support. Above-head pose is a calm formal spell gesture. Garments remain fully opaque and draped throughout.
```

## motions/p2-ultimate-3

```text
Edit the supplied adult fantasy goddess into ONE transparent pixel-art animation strip of exactly THREE equal SQUARE cells in ONE HORIZONTAL ROW. Input 1 is the fixed original identity and palette; input 2 is the isolated floating body. Keep the same mature face, silver/lavender hair, ivory/navy/gold opaque costume, gold shoes and small crown. Body only: no large rings or throne. Full figure in each cell, upright hovering legs pointing downward as in the body reference. Identical head, hips, leg positions and character scale in all three cells. Broad empty transparent padding around EACH figure. Each figure is only 65 percent as tall as its cell. Read from LEFT to RIGHT:
LEFT pose: both arms spread sideways at SHOULDER HEIGHT, palms outward, releasing energy (no energy drawn). MIDDLE pose: both arms lower diagonally, hands halfway between chest and waist. RIGHT pose: both arms relaxed low, spread to the sides at WAIST HEIGHT with palms up, exactly the low open-handed floating neutral pose. The motion is LOWERING arms across the strip. All hands stay below the head in ALL three cells.
Precisely two arms connected to their shoulders. Crisp pixel clusters, dark violet outlines, no text, no grid lines, no effects, no extra body or ghost trail. Preserve real transparent alpha.
```

## motions/down

```text
Use case: precise-object-edit
Asset type: repaired transparent JRPG pixel-art sprite sheet, motions/down.
Input image 1: ORIGINAL fixed identity/style reference. Input image 2 if present: body-only reference. Preserve the same adult fantasy goddess, mature face, silver-lavender hair, cyan eyes, ivory/navy/gold opaque ceremonial clothing, small crown and gold shoes. Nonsexual neutral game animation. Crisp discrete pixel clusters and dark violet outlines. No text, numbers, panels, watermarks or background. True transparent alpha.
Layout: 4 equal square cells, 2 columns and 2 rows, chronological row-major order. Each cell has its own virtual 512x512 coordinates. Keep ALL visible pixels within x=60..452 and y=52..460 OF EACH CELL. Large empty transparent gutters separate the figures. Same camera, body scale, head and hip positions across frames. Never fill the sheet with oversized figures; never let hair, sleeves, crown or shoes cross a cell boundary.
Upright FLOATING body only, torso vertical, legs extend DOWN naturally as in original floating master. No seated pose, raised seated knee, crossed seated legs, cheek support, throne or large halo. Keep clothing opaque; skirt lining covers the legs during arm raises. Hands remain attached through elbows to their own two shoulders. No attack effects or magic lights. 
Frames:
F1: upright hovering neutral body, gentle satisfied smile, eyes softly open. L/R=(170,244)/(352,260).
F2: head nods politely by five degrees, eyes gently close, warm contented smile. Torso stays upright, hands relax. No loss of strength.
F3: head upright again, contented smile, screen-right hand rises to shoulder R=(342,190), palm outward in a restrained farewell; L=(180,250).
F4: the SAME one figure rises 12 virtual pixels, maintains farewell hand and smile, hair/sleeves trail slightly downward. Full opaque body ONLY. Playback will fade this single sprite to zero; do not draw transparency, afterimages, particles or a portal.
Mood: pleased with a worthy encounter, serene and voluntary departure. Keep posture dignified and vertical. No injury, collapse, slumping, grief, death, explosion, extra bodies, ghost trail, reward object or portal.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
```

## effects/goddess-return-1

```text
Use case: stylized-concept
Asset type: transparent JRPG pixel-art dimensional-return OVERLAY, effects/goddess-return-1.
Exactly THREE equal square cells in ONE horizontal row. Every cell is virtual 512x512, portal center fixed at (256,256). Strict safe bounds x=60..452,y=52..460 in EACH cell, wide transparent gutters. Crisp stepped pixels, thin pale gold rim, cyan stars, dark-violet transparent aperture. Same camera and palette across all frames.
Primary request: a calm welcoming doorway to another dimension for a satisfied goddess leaving after battle. ONLY portal overlay, no goddess, person, humanoid outline, chair, body halo, small crown, shattering ring, explosion, reward jewel, text or background. True transparent alpha; see-through interior with sparse tiny stars.
Frames:
F1: a quiet thin vertical gold/cyan oval outline, width130 height300, transparent star-specked interior.
F2: oval opens to width270 height360, a welcoming deep-violet transparent aperture with sparse cyan stars.
F3: oval fully open width300 height380, thin luminous gold rim, stable and peaceful.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
```

## effects/goddess-return-2

```text
Use case: stylized-concept
Asset type: transparent JRPG pixel-art dimensional-return OVERLAY, effects/goddess-return-2.
Exactly THREE equal square cells in ONE horizontal row. Every cell is virtual 512x512, portal center fixed at (256,256). Strict safe bounds x=60..452,y=52..460 in EACH cell, wide transparent gutters. Crisp stepped pixels, thin pale gold rim, cyan stars, dark-violet transparent aperture. Same camera and palette across all frames.
Primary request: a calm welcoming doorway to another dimension for a satisfied goddess leaving after battle. ONLY portal overlay, no goddess, person, humanoid outline, chair, body halo, small crown, shattering ring, explosion, reward jewel, text or background. True transparent alpha; see-through interior with sparse tiny stars.
Frames:
F4: same oval remains fully open width300 height380, rim softens slightly; the separate body is departing.
F5: AFTER the separate body is gone, oval narrows to width90 height340, smooth rim draws inward. No cracking or shards.
F6: one dim thin vertical seam, width6 height90, almost gone. Only this seam, no gems or extra glowing objects. Playback fades it to zero.
Composition override: ZOOM OUT. Each sprite occupies only 65 percent of its cell height and width. Broad completely empty transparent border around EACH sprite, including between rows. Figures must appear SMALLER than the supplied full-canvas references. Preserve identical scale for every pose.
Input image 1 is the fixed opening interval F1-F3. Continue with F4-F6, keep the SAME gold/cyan ring design, sparsity of stars and exact F3 opening size in F4. F4 matches the rightmost input frame; F5 is much narrower; F6 is only a DIM hairline slit. No extra ring or new motif.
```
