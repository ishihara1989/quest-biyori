# Slime animation master — image_gen

組み込み `image_gen` を使用。戦士の待機シートは画風参照のみ。
生成原画を `source/slime-generated-v1.png` に保存。RGB/アルファは塗り直さず、共通0.5倍率の最近傍で切り出す。
`layout.json` が採用コマ・接地位置・体当たりの左移動・ホップの浮きを定義する。
移動と撃破の先頭、被攻撃と攻撃の末尾は待機1コマ目を共用し、接続時の輪郭の変化を抑える。
原画の重複した基準候補（cell 4, 10, 12, 19）と空セル11は採用しない。

## Final generation prompt

+Use case: stylized-concept
Asset type: production pixel-art enemy animation sprite master sheet for a Japanese idle RPG.
Input image 1: STYLE reference only, existing warrior pixel sprite strip. Match its crisp stepped pixel edges, dark outline, rich clustered highlights/shadows, game sprite craftsmanship. Do not include warrior.
Subject: ONE simple early-game blue slime enemy, always facing LEFT in a side / slight three-quarter side view. A low rounded gelatinous teardrop mound, pale cyan upper-left highlights, medium blue body, dark navy lower contour, two tiny dark eyes on its LEFT/front side, subtly asymmetric peak trailing right. No limbs, accessories, crown, weapons, ornament, elaborate face, text or UI. Small friendly-looking but combat-ready monster. Simple silhouette and limited cohesive palette. Genuine pixel-art sprite, hard square pixel clusters, no smooth vector curves or blurred painting.
Composition: EXACT regular grid FOUR columns by FIVE rows, equal-size cells; transparent RGBA background, no ground shadow, no checkerboard, no labels, no dividers, no scenery. All sprites entirely inside their cells with generous transparent margins. Pixel grid and scale of the slime are exactly the SAME in ALL cells, camera fixed, facing LEFT in all frames. Body baseline at same local y in every grounded pose. Normal pose body approx 45% of each cell width, 32% of cell height, all poses fit inside 75% cell width and height. Leftward attack deformation is visible but does not move the whole sheet anchor. Each frame is only one slime (small droplets allowed only death).
Animation rows, read each left-to-right:
ROW 1 IDLE four frames: 1 neutral rounded mound; 2 breathing slightly taller/narrower; 3 relax slightly lower/wider; 4 approaching same neutral. Very subtle rhythmic breathing, same eyes and highlights.
ROW 2 MOVE four-frame seamless hopping loop: 1 rounded neutral contact; 2 crouch/squash preparing hop; 3 stretch upward with a tiny hop, bottom raised slightly, face still to left; 4 squash softly on landing, preparing neutral contact. SAME body volume and body width scale as idle. This is in-place animation for travel left.
ROW 3 HIT: cell 1 recoil backward to RIGHT, flattened front and narrowed closed eyes; cell 2 recover toward neutral with slight tremble; cell 3 exact neutral matching row1 cell1; cell 4 EMPTY TRANSPARENT. EXACTLY three visible slimes in this row.
ROW 4 DEFEAT four frames: 1 neutral slightly shocked; 2 collapsing low broad mound; 3 mostly melted short blue puddle with a few tiny blue droplets, no eyes; 4 very thin quiet blue puddle residue, no eyes. Gradual monotonic loss of height, terminal death state, never stands back up. NOT four independent enemies.
ROW 5 ATTACK four frames: 1 compress / draw back to right as windup; 2 forceful stretched forward body slam to LEFT, low forward point, same simple body, still intact one slime; 3 recoil and settle into near-neutral mound; 4 exact neutral matching row1 cell1. No projectile or slash graphic. Return to idle smoothly.
Constraints: exact 4x5 aligned grid, 19 visible poses and one blank cell, consistent identity, identical neutral states at specified cells, all facing left. Real alpha transparent background. Clean visible individual pixel blocks. No text, no labels, no watermark.
