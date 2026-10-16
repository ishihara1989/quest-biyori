# root-eruption

組み込み image_gen で生成。樹の実・爆発は既存ドット絵、根はトレントの原画を画風参照に使用。

Use case: stylized-concept. Asset type: FOUR-frame ROOT ATTACK effect sprite sheet for side-view pixel-art RPG.
Input tree monster is ONLY wood bark/palette/style reference. Do NOT draw the treant or any full tree, face, eyes, trunk, canopy or character.
Exactly 4 chronological frames in a 2x2 equal invisible grid, top-left then top-right then bottom-left then bottom-right. Each cell shares an identical ground emergence point near bottom center (90% of cell height); constant wood thickness/camera scale. Each effect fits its own cell with transparent margins.
Animation: several aggressive twisted wooden root SPIKES erupt UPWARD FROM BELOW GROUND. Frame1: only very short pointed root tips protrude through a tiny cluster of dirt pebbles at bottom baseline (10% cell height). Frame2: same three roots extend upward to HALF height, curved pointed tips, earth fragments kicked outward. Frame3: maximum height, three thick gnarled brown roots form a tall upward/thrusting branching spike fan with one tallest curved sharp root in center and two shorter side roots, about75% cell height, no leaves. Frame4: roots retract to about40% height, spike tips lower again and dirt falls, clearly smaller than frame3, no vanishing smoke.
Critical: growth progresses 1<2<3 at SAME ROOT WIDTH and camera scale, do not magnify frame1 tips to fill cell. Roots physically originate bottom, no floating roots and no top-down view.
Style: detailed hard-edge retro pixel art, dark brown outline, ochre bark highlights, tree monster's dark/mid brown palette, earth pixels only. TRUE alpha transparency around the actual roots; no background haze, no green aura, no fire/explosion, no foliage, no opaque ground strip, no shadow, no checkerboard, no labels, no text or cell borders.
