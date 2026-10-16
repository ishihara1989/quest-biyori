# explosion

組み込み image_gen で生成。樹の実・爆発は既存ドット絵、根はトレントの原画を画風参照に使用。

Use case: stylized-concept. Asset type: generic reusable 4-frame pixel-art explosion sprite sheet, true transparent background.
Reference image is ONLY existing game's crisp detailed retro pixel-art style. Generate ONLY an explosion effect: NO character, NO tree, NO fruit, NO roots, NO leaves, NO ground.
Exactly FOUR chronological animation frames on 2x2 EQUAL invisible cells, order top-left to top-right then bottom-left to bottom-right. All effects have the same center, constant art scale, plenty transparent padding; each explosion fits inside its cell.
Frame1: compact sharp star-shaped ivory-yellow ignition flash, tiny orange spark pixels.
Frame2: much larger rounded fiery burst, bright yellow core surrounded by orange/red lobes and sharp short orange sparks. Explosion at maximal size.
Frame3: fire shrinks and breaks into separated orange tongues with several dark neutral-gray angular smoke puffs rising; the yellow core gone.
Frame4: sparse SMALL gray smoke fragments and a few dull orange embers dissipating; much smaller and emptier than frame3, no opaque dark cloud, no fire core.
Style: crisp SNES/retro RPG pixel art, square pixel clusters, limited ivory-yellow-orange-red and neutral charcoal-gray palette, hard silhouettes, no blur, no smooth gradients, no realistic volume. Effect should suit bombs/fire/magic independently.
Background is REAL alpha TRANSPARENCY. No background wash, absolutely no soft glow or aura beyond the actual sprite contour, no checkerboard, no ground line, no shadow, no labels, no text, no watermark, no cell dividers. Exactly 4 effects, not 5 or 8.
