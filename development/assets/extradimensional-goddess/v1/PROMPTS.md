# 異次元の女神：基準画像の生成プロンプト

2026-10-14 JST。内蔵 `image_gen` を使用。生成結果は未採用の静止デザイン候補。第2フェーズは余白を修正した第1フェーズを画像参照にして生成。

## phase-1-initial

transparent_background: true

参照: なし（新規生成）

```text
Use case: stylized-concept
Asset type: single static master-reference character sprite, transparent PNG, square 1024x1024 composition. Final secret boss for a Japanese idle fantasy action RPG, phase 1.
Primary request: an extradimensional adult goddess sitting lazily on an imposing beautiful throne. Full goddess and full throne, one pose only, turned toward the LEFT in a mild three-quarter side view matching side-view JRPG battle sprites.
Subject: clearly adult regal woman, mature elegant face, very long silver-white hair with a subtly lavender underside, sleepy half-lidded pale cyan eyes, tiny detached gold circular crown above her head. Same readable humanoid anatomy: exactly two arms and two legs. A flowing ivory and midnight-navy ceremonial dress with gold geometric trim, a dark star-flecked inner skirt, long draped detached sleeves, gold collar with a single cyan diamond gem, elegant gold-trimmed shoes. She is fully dressed, regal and unconcerned. Leaning slightly sideways, her near elbow rests on the left armrest and her near hand supports her cheek; far hand hangs relaxed on the other armrest, legs elegantly crossed with the shoes visibly distinct. Her gaze is down-left at challengers.
Throne: pale ivory carved stone and antique gold, midnight navy seat cushions, a tall crescent-shaped open back and a single restrained gold circular frame behind her head. Broad armrests and clear short sturdy feet. Throne is a separate recognizable chair, never grows from her body. No giant stairs or floor platform. Iconic exquisite silhouette, boss scale but manageable animation structure.
Style/medium: refined late-1990s fantasy JRPG pixel art; deliberate visible square pixel clusters, sharp stepped contours, detailed but readable silhouette, thin dark violet outline, limited rich palette, clean pixels. Not smooth anime painting or 3D. Beautiful ornate boss sprite with restrained specular highlights.
Composition: center the entire seated figure AND throne in the square, keep 10-12 percent fully transparent padding around every edge. Chair feet approximately on y=86 percent, seat approximately y=61 percent, her head approximately (48 percent,34 percent). Face and hands readable, complete hair, shoes, throne feet and halo fully inside canvas. No perspective from directly above, no front-facing portrait.
Lighting/mood: cool ivory body with cyan reflections and subdued gold accents; sleepy divine authority.
Constraints: truly transparent background with alpha. No scenery, floor, shadow slab, checkerboard, text, labels, watermark, attack effects, particle cloud, other characters, extra limbs, weapons, wings, multiple poses or panels. This is the definitive PHASE 1 reference, not an animation sheet.
```

## phase-1-seated

transparent_background: true

参照: source/phase-1-initial.png

```text
Use case: precise-object-edit
Asset type: PHASE 1 master reference sprite, single transparent PNG.
Input image 1 is the edit target and the definitive appearance reference.
Change only the framing: redraw the entire existing seated goddess and entire throne at about 76 percent of the image width and height, centered in a square transparent canvas, so that every part has at least 10 percent clear TRANSPARENT padding from every edge. Reconstruct the pointed top-right crescent throne fin completely; its tip must be fully visible, not touch or cross the top edge. Leave visibly wide transparent space above every star and throne point and below every chair foot and dress hem.
Keep exactly the same adult woman's face, sleepy half-lidded cyan eyes, silver-lavender hair, cheek resting on hand, other arm relaxed, crossed legs, dress design, gold trim, cyan diamonds, shoes, ivory-gold crescent-backed throne, navy cushion, halo, pixel-art style, colors, side-facing-left three-quarter camera. Do not invent extra decor or change anatomy or pose.
Clean isolated pixel-art edges; remove stray isolated colored fringe outside the silhouette while preserving the actual transparent alpha. No scene, floor, shadows, text, checkerboard or new effects. One complete static goddess sitting on one complete throne.
```

## phase-2-awakened

transparent_background: true

参照: references/phase-1-seated.png

```text
Use case: identity-preserve
Asset type: PHASE 2 master-reference sprite for the SAME final secret boss, single transparent PNG, square canvas. Input image 1 is the exact identity, costume, color and pixel style reference from phase 1.
Primary request: portray this exact extradimensional adult goddess after rising from her throne and unleashing her true power. The throne is absent. She hovers upright in midair, fully visible from halo to both gold shoes, facing LEFT in mild three-quarter battle view. A composed stern face with wide open icy-cyan eyes now watching her opponents. Her same two human arms spread in a commanding low V with open palms, exactly two legs relaxed under her draped dress, both feet hanging visibly above the implied anchor. Long silver-white lavender-shadowed hair and the same detached long sleeves stream gently outward in zero gravity.
Preserve her exact mature face, silver hair ornaments and braids, gold crown ring above head, ivory and midnight navy dress with the SAME gold geometric trim, SAME cyan diamond at the collar and waist, SAME star-flecked inner cloth, gold-trimmed shoes. No costume redesign, no new armor, no wings, no staff, no extra limbs.
True-power silhouette: behind her upper body, three clean broken concentric GOLD celestial rings, clearly geometric and rigid ornaments, offset in depth, with sparse cyan diamond nodes. Their arches spread laterally like an astronomical mechanism, never feathered wings. Keep every ring arc visible behind her, with large clear negative spaces between body and rings. Rings must not obscure hands or face. These are a restrained static ornament reference; later animated attack VFX will be separate. No diffuse aura or particle storm.
Style: match the referenced refined JRPG pixel-art sprite exactly: visibly stepped contours, crisp discrete pixel clusters, dark-violet outlines, ivory-gold-navy palette, lavender silver hair and cyan highlights. Detailed but readable at game scale, not smooth painted anime, no blur.
Composition: all of the complete floating goddess, full hair ends, sleeve tips, shoes, small crown and three rings centered inside about 76 percent width and 78 percent height of square. At least 10 percent clear fully TRANSPARENT padding on EVERY side, especially above crown and beneath shoes. Hair and sleeves retain mass and connected anatomy. No chair, background, platform, floor, cast shadow slab, checkerboard, text, watermark, scenery, attack effects, portals, other characters or multiple poses.
True transparent alpha background. One static empowered hovering pose.
```

## stage-throne-beyond-dimensions

transparent_background: false

参照: なし（新規生成）

```text
Use case: stylized-concept
Asset type: static opaque wide 16:9 battle-map background PNG for a Japanese idle fantasy action RPG, the FINAL SECRET BOSS arena "Throne Beyond Dimensions". One complete scenery image, no characters.
Primary request: an impossibly beautiful quiet alabaster celestial sanctuary floating outside reality. A vast flat circular pale stone battlefield hangs in a midnight-indigo cosmic void. Beyond it, an open ruined white-and-antique-gold temple, fragmented arches and pieces of columns float at impossible heights; distant layered islands drift in blue-violet nebulae. An immense dark eclipsed celestial disk with a thin cyan and pale gold rim high in the sky suggests divinity without resembling a monster or face. Make it majestic and alien, a climax beyond the existing dimensional-rift battlefield.
Composition: wide SIDE-VIEW JRPG battle arena with mild three-quarter depth, no top-down or steep overhead view. Horizon and back edge of playable stone floor at approximately 56 percent of image height. The area x=8..92 percent, y=58..88 percent must be a continuous broad FLAT unobstructed low-contrast ivory-gray-blue walking surface. No gaps, elevated steps, chairs, pillars, gemstones, debris or tall objects anywhere in that playable area. Subtle geometric inlay and cracks only; no bright dense mandala on the combat floor. The temple arches and vertical pillars stand BEHIND the back edge or at extreme side borders. The foreground shows a restrained broken outer rim of the floating island only below y=90 percent. No throne in the stage image; the boss's throne is part of the separate phase 1 sprite.
Lighting/mood: subdued blue-violet cosmic sky, cool white architectural fragments, restrained antique gold accents, cyan reflections, dark eclipse. Use dark sky and medium-value muted floor so the white-gold goddess and her gold-cyan attacks remain legible. Reserve brightest highlights for distant thin eclipse rim and small architectural details, not the floor. Open generous air around the right-half boss area, distant architecture there is low contrast.
Style/medium: refined late-1990s fantasy JRPG PIXEL ART background. Deliberate distinct square pixel clusters, stepped rock and arch edges, limited rich palette and crisp detailed silhouettes; coherent scale and side-view depth. Same high-quality sprite game aesthetic as silver-haired ivory-gold goddess. No smooth digital painting, blur, realistic photographic textures or 3D render.
Constraints: entire rectangular scene painted, opaque background. No people, goddess, throne, monsters, enemy silhouettes, UI, text, lettering, labels, watermark, borders, attack effects, huge white flashes, particle fog or foreground blockers. This is scenery meant for an actual legible battle screen, not a poster or a concept collage.
```

