# 遺跡デザインの生成プロンプト

2026-10-10 JST。組み込み image_gen を使用。デザイン確認用の静止画。モーションは未制作。

## 遺跡・遠景 / distant

### 原画 v1

保存先：source/distant-v1.png。  
透過：なし。

```text
Use case: stylized-concept. Asset type: a single distant background layer for a side-view fantasy idle RPG, design approval draft. Wide 16:9 landscape, logical composition 1024x576. Polished detailed 16-bit pixel art with crisp pixel clusters, restrained shading, matching a richly colored pixel-art RPG, no smooth painting. Subject: the inner courtyard of a ruined ancient temple whose magical defense machinery is awakening. Layer ONLY contains the distant scenery: grand ruined pale sandstone shrine in the center distance, broken colonnades at left and right, huge engraved bronze doors, weathered stone arches, sparse moss, blue-white glowing ancient conduits set into walls, muted dusty blue sky through a collapsed roof. A tiny deeply recessed dormant machine silhouette may be suggested in the shrine doorway; it must read as architectural detail, not a foreground enemy. Color palette: warm gray sandstone, aged bronze with restrained verdigris, dull antique gold, dark desaturated blue shadows, sparse blue-white magical accents. Soft afternoon light from upper left, mysterious majestic mood. At logical y323 to512, scenery must be subdued and behind the future foreground fighting floor, no large high-contrast decorations in that area. Do not draw a foreground floor or near objects; distant architecture continues behind where the separate ground layer will cover the lower frame. Keep major architecture around upper and middle frame, strong readable depth, leave room for characters. Horizontally repeatable using alternating mirrored tiles: no dominant bright elements on the far side edges. Full opaque image. No characters, no enemies in the battle lane, no UI, no text. Generate this ONE distant background, not a collage or an animation sheet.
```

## 遺跡・石床と近景 / ground-near

### 原画 v1

保存先：source/ground-near-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: a single foreground ground-and-near layer for a side-view fantasy idle RPG, design approval draft. Wide 16:9 landscape, logical composition 1024x576. Crisp polished detailed 16-bit pixel art, sharp discrete pixel clusters and restrained shading. Subject: the flat broad fighting floor of an ancient ruined temple courtyard. Warm gray sandstone floor slabs with cracks, some engraved bronze inlays and sparse moss; near bottom edge only place low broken stones, shallow rubble and chipped column bases. Palette warm gray sandstone, muted bronze and antique gold, desaturated blue-gray shadow. Lighting from upper left. Composition STRICT: the entire upper portion logical y0..290 (top 50 percent) must be genuine alpha transparency, EMPTY, so a separate temple distant layer can show through. The back edge of the floor begins around y300..323 (52 to56 percent). Flat unobstructed walkable broad floor from y323..512 (56 to89 percent), no stairs, no holes, no raised platforms, no tall obstacles, no horizontal cliffs or drops, no large statues or columns standing in the fighting lane. Small low rubble and moss mainly at y530..576 bottom foreground, sparse near the far edges. The floor extends continuously edge to edge. Single ground-near layer, not a complete scene. Genuine transparent PNG, no black/white fill or checkerboard pattern baked into the image. No background, no sky, no temple walls, no characters, no text, no UI, no border, no watermark.
```

## 石の衛兵 / stone-guard

### 原画 v1

保存先：source/stone-guard-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE ancient stone sentinel soldier, a compact broad humanoid statue assembled from chipped warm-gray sandstone blocks, rectangular shoulder plates, short heavy legs, helmet-like stone head with two small dim cyan eye slits, engraved dull antique gold temple motifs. Exactly two arms and two legs. Holds ONE broad heavy stone sword in its near hand pointing diagonally down toward the LEFT, far arm empty. No separate shield, no cape. Low-intensity blue-white core inset on chest. Simple readable powerful silhouette, sturdy infantry rather than giant boss. Composition: ONE full-body neutral standing idle pose, LEFT-facing three-quarter side view for combat, feet together on a consistent baseline at 85 percent image height, center around x52 percent. Square canvas with at least12 percent fully transparent margin around all anatomy and sword tips. Mature fantasy enemy proportions, about four head heights, crisp readable at small game scale. Color palette: warm gray stone, bronze seams, antique gold small accents, cyan only at eyes/core. Genuine alpha transparency, no scenery, no floor, no cast shadow, no glow haze outside silhouette. No alternate poses, no multiple views, no grid, no animation.
```

## ルーンガーゴイル / rune-gargoyle

### 原画 v1

保存先：source/rune-gargoyle-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE slim predatory ancient rune gargoyle statue, dark blue-gray basalt body, angular feline-demonic head, gold-inlaid engraved runes, two small sharply folded stone wings on its upper back. Exactly two arms, two legs, two compact folded wings, ONE thin stone tail curved upward behind it. Near hand held low in front with three distinct cyan-edged magical claws, far hand near body. Digitigrade feet grounded, hunched agile creature pose, unmistakably different from a bulky humanoid stone soldier. No weapon, no armor, no flames, no attack effects. A small cold-blue inset chest rune glows subtly. Composition: ONE full-body neutral standing idle pose, LEFT-facing three-quarter side view, contact baseline at85 percent height. Square canvas with at least12 percent transparent margin around wings/tail/claws. Color palette: desaturated blue-gray stone, bronze-gold fine inlay, sparse cyan highlights. Genuine alpha transparency, no scenery, no floor, no cast shadow, no outer haze. No alternate poses, no multiple views, no grid, no animation.
```

## 古代の弩兵 / ancient-crossbowman

### 原画 v1

保存先：source/ancient-crossbowman-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE ancient bronze automaton crossbow infantryman. Slender clearly mechanical humanoid with exactly two thin jointed legs and two arms, compact helmet face with one horizontal cyan visor, no human skin. Riveted antique bronze body with very sparse verdigris, pale sandstone small shoulder plates. Two hands hold ONE large horizontal crossbow aimed toward LEFT, easily readable thick bow limbs and a single loaded bolt, crossbow not a firearm. Upright narrow torso, small visible cog at hip, distinct lightweight ranged silhouette. No shield, no cloak, no extra weapons, no modern tech, no attack projectile. Composition: ONE full-body neutral ready/idle pose, LEFT-facing three-quarter side view, feet on baseline at85 percent height. Square canvas with at least12 percent transparent margin around bolt/bow limbs/feet. Roughly four to five head heights, readable game-scale. Color palette: muted bronze, sandstone, antique gold details, sparse cold cyan visor. Genuine alpha transparency, no scenery, floor, shadow, outer haze. No alternate poses, multiple views, grid, animation.
```

## 浮遊魔導器 / floating-magic-core

### 原画 v1

保存先：source/floating-magic-core-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE ancient floating magical defense instrument, no human body, no limbs, no face. Bright small blue-white faceted crystal core in the middle, surrounded by TWO thick rotating-looking antique bronze segmented rings crossing at different angles; three small chipped sandstone plates attached to the outer ring with gold-inlaid runes. Ring assembly is a compact round relic, ancient temple technology, front firing aperture toward LEFT. Neutral static idle arrangement, not firing. Sparse cyan light within crystal only, preserve solid silhouettes and actual transparent gaps between rings. Composition: ONE isolated entire device in LEFT-facing three-quarter side view, centered around x50,y48 percent on square canvas, device occupies about65 percent canvas width, 15 percent transparent clearance all sides. Hovering at logical contact baseline85 percent but no ground, no shadow or pedestal. Color palette: gray stone, aged bronze, antique gold, blue-white crystal. Genuine alpha transparency, no haze or smoke, no scenery, no text, no multiple views, no grid, no animation.
```

## 重装ゴーレム / armored-golem

### 原画 v1

保存先：source/armored-golem-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE huge heavily armored ancient temple stone golem boss. Broad massive body of weathered warm-gray sandstone with thick bronze collar and bindings, antique gold engraved temple geometric motifs. Exactly two enormous arms and two thick legs; head small and recessed between two stepped architectural shoulder blocks. Both massive fists empty, near fist lowered toward LEFT, far fist by right hip. Five chunky fingers per hand, palms read as heavy stone gauntlets. Broad chest with small cyan core, no back cannons, no weapon, no wings. About three to four head heights, disproportionally thick forearms and large fists, larger and wider than ordinary sentinel. Composition: ONE complete neutral idle pose, LEFT-facing three-quarter side view, feet fixed on baseline85 percent height. Square canvas with at least12 percent transparent margin around whole silhouette. Color palette: warm gray sandstone, dull bronze, antique gold accents, tiny blue-white core. Genuine alpha transparency, no scenery, ground, shadow, debris or attack effects. No multiple views, alternate poses, grid or animation.
```

### 原画 v2：余白修正

保存先：source/armored-golem-v2.png。参照：source/armored-golem-v1.png。  
透過：あり。

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, an existing single transparent pixel-art game character design. Perform ONLY a framing correction: place the EXACT same complete character farther from the camera on a larger transparent canvas, reducing the complete silhouette to approximately 75 percent of its current size relative to the frame. Do not redesign or reinterpret any part. Preserve the original face, pose, anatomy, all limbs, clothing, hair, equipment, architectural details, number of parts, left-facing three-quarter perspective, individual colors, lighting direction, discrete pixel-art rendering and material textures. The entire silhouette including the highest ornament, widest hands or bow and cannon tips, and both feet must fit inside the central 76 percent of a square image, with a generous minimum12 percent EMPTY TRANSPARENT clearance on ALL four sides. If a tiny edge tip was clipped in the input, restore only that tip consistently. Do not add an environment, floor, shadow, effects, labels, extra views, white backing or a checkerboard. Fully transparent alpha outside the silhouette; crisp clean cutout edges without red/magenta/green matte contamination, without colored fringes. Keep the existing design exactly, just zoom out and center to provide safe margin. ONE single neutral pose only.
```

## 古代弩砲兵 / ancient-ballista

### 原画 v1

保存先：source/ancient-ballista-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE ancient walking ballista automaton boss. Main silhouette is a large heavy mechanically mounted crossbow above a low squat bronze armored torso, exactly TWO thick reverse-jointed walking legs with broad clawed bronze feet. ONE giant horizontal ballista aimed toward LEFT, very broad recurved dark-bronze bow limbs, visible winding cog and thick drawn cord, one huge loaded stone-tipped bolt. NO arms, no humanoid face, no additional cannon. Small cyan viewing slot on the lower armored chassis, sandstone side armor plates with antique gold temple motifs. Clearly an oversized ancient crossbow artillery walker, not a gun turret or modern tank. Neutral stationary pose. Composition: ONE full machine, LEFT-facing three-quarter side view, feet onbaseline85 percent image height, square canvas. Bow and bolt tips entirely visible with at least12 percent transparent margins. Color palette: antique bronze, sparse verdigris, warm gray stone armor, tiny coldcyan accent. Genuine alpha transparency, no ground, shadow, scenery, effects, text, additional views, grid or animation.
```

### 原画 v2：余白修正

保存先：source/ancient-ballista-v2.png。参照：source/ancient-ballista-v1.png。  
透過：あり。

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, an existing single transparent pixel-art game character design. Perform ONLY a framing correction: place the EXACT same complete character farther from the camera on a larger transparent canvas, reducing the complete silhouette to approximately 75 percent of its current size relative to the frame. Do not redesign or reinterpret any part. Preserve the original face, pose, anatomy, all limbs, clothing, hair, equipment, architectural details, number of parts, left-facing three-quarter perspective, individual colors, lighting direction, discrete pixel-art rendering and material textures. The entire silhouette including the highest ornament, widest hands or bow and cannon tips, and both feet must fit inside the central 76 percent of a square image, with a generous minimum12 percent EMPTY TRANSPARENT clearance on ALL four sides. If a tiny edge tip was clipped in the input, restore only that tip consistently. Do not add an environment, floor, shadow, effects, labels, extra views, white backing or a checkerboard. Fully transparent alpha outside the silhouette; crisp clean cutout edges without red/magenta/green matte contamination, without colored fringes. Keep the existing design exactly, just zoom out and center to provide safe margin. ONE single neutral pose only.
```

## 魔導人形セラフィナ / seraphina

### 原画 v1

保存先：source/seraphina-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE elegant adult female ancient magical automaton temple guardian, full humanoid body with exactly two arms and two legs. Porcelain-white artificial skin, mature adult face with calm golden eyes, long pale-gold hair with a gold geometric temple crown. Fully clothed in an ornate fitted deep-indigo and ivory ceremonial dress with antique gold trim, a graceful layered split overskirt over ivory leggings, clearly visible feet in gold-trimmed ceremonial boots. Tasteful feminine silhouette, confident serene guardian presence. Small precise doll joints visible at elbows and knees, a blue-white gem core set into her covered bodice, no flesh wounds. ONE large segmented antique gold circular halo ring suspended behind her upper back, visible as a distinct ring with transparent inside; ring should not merge into arms or hair. Near arm gracefully extended a little toward LEFT, far hand lowered close to hip. Neutral standing idle pose, no attack, no magic trail. Composition: ONE full-body portrait for game sprite design, LEFT-facing three-quarter side view, full face/profile legible, feet onbaseline85 percent height. Square canvas with minimum12 percent transparent margin around halo, hair and skirt. Mature fantasy RPG proportions around six head heights, detailed pixel art, no chibi. Genuine alpha transparency, no scenery, no floor, no cast shadow, no outer glow cloud, no text. No alternate poses, additional people, views, grid or animation.
```

### 原画 v2：余白修正

保存先：source/seraphina-v2.png。参照：source/seraphina-v1.png。  
透過：あり。

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, an existing single transparent pixel-art game character design. Perform ONLY a framing correction: place the EXACT same complete character farther from the camera on a larger transparent canvas, reducing the complete silhouette to approximately 75 percent of its current size relative to the frame. Do not redesign or reinterpret any part. Preserve the original face, pose, anatomy, all limbs, clothing, hair, equipment, architectural details, number of parts, left-facing three-quarter perspective, individual colors, lighting direction, discrete pixel-art rendering and material textures. The entire silhouette including the highest ornament, widest hands or bow and cannon tips, and both feet must fit inside the central 76 percent of a square image, with a generous minimum12 percent EMPTY TRANSPARENT clearance on ALL four sides. If a tiny edge tip was clipped in the input, restore only that tip consistently. Do not add an environment, floor, shadow, effects, labels, extra views, white backing or a checkerboard. Fully transparent alpha outside the silhouette; crisp clean cutout edges without red/magenta/green matte contamination, without colored fringes. Keep the existing design exactly, just zoom out and center to provide safe margin. ONE single neutral pose only.
```

## 古代機兵タイタン / ancient-titan

### 原画 v1

保存先：source/ancient-titan-v1.png。  
透過：あり。

```text
Use case: stylized-concept. Asset type: production reference design for an existing side-view fantasy idle RPG. Style: polished 16-bit pixel art with crisp discrete pixel clusters, readable strong outlines and 4 to 6 restrained shading steps, matching late-1990s detailed fantasy RPG sprites. No smooth painting, no vector rendering, no 3D render, no UI, no lettering, no watermark. Subject: ONE enormous ancient bipedal temple war machine boss, looks like part of a ruined shrine has stood up. Exactly TWO broad riveted arms with huge empty mechanical fists and TWO massive articulated legs with broad stone-plated feet, small recessed angular bronze head. Very wide upper torso, pale weathered sandstone architectural armor blocks with antique gold runes over a dark aged-bronze mechanical skeleton; visible heavy cog joints and pistons. ONE circular blue-white magic furnace in center of chest, shutter rim clearly visible. Exactly TWO thick ancient bronze cannon barrels mounted above the back shoulders, both aimed diagonally LEFT, barrels distinctive but integrated and entire tips visible. Not hand-held guns. Distinguish from ordinary heavy golem: highly visible mechanical frame, chest furnace and twin back cannons, grand monumental proportions. Neutral stationary idle stance, arms lowered, no attack effects, no smoke, no floating debris. Composition: ONE entire giant LEFT-facing three-quarter side-view machine, square canvas with at least10 to12 percent fully transparent margin around all body and cannon tips. Approximately four head heights because tiny recessed head; no modern sci-fi plates or LED strips. Color palette: warm gray sandstone, dark bronze, dull antique gold, restrained coldcyan furnace. Genuine alpha transparency, no floor, shadow, scenery, text, multiple views, grid or animation.
```

### 原画 v2：余白修正

保存先：source/ancient-titan-v2.png。参照：source/ancient-titan-v1.png。  
透過：あり。

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET, an existing single transparent pixel-art game character design. Perform ONLY a framing correction: place the EXACT same complete character farther from the camera on a larger transparent canvas, reducing the complete silhouette to approximately 75 percent of its current size relative to the frame. Do not redesign or reinterpret any part. Preserve the original face, pose, anatomy, all limbs, clothing, hair, equipment, architectural details, number of parts, left-facing three-quarter perspective, individual colors, lighting direction, discrete pixel-art rendering and material textures. The entire silhouette including the highest ornament, widest hands or bow and cannon tips, and both feet must fit inside the central 76 percent of a square image, with a generous minimum12 percent EMPTY TRANSPARENT clearance on ALL four sides. If a tiny edge tip was clipped in the input, restore only that tip consistently. Do not add an environment, floor, shadow, effects, labels, extra views, white backing or a checkerboard. Fully transparent alpha outside the silhouette; crisp clean cutout edges without red/magenta/green matte contamination, without colored fringes. Keep the existing design exactly, just zoom out and center to provide safe margin. ONE single neutral pose only.
```

