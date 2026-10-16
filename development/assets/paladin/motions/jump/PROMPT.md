# パラディン jump

生成方法: 組み込み image_gen、transparent_background=true。承認済み待機原画を画風・デザインの参照、originalをデザインの補助参照。

```text
Use case: identity-preserve.
Asset type: transparent RGBA pixel-art sprite sheet for a belt-scroll RPG, PALADIN JUMP, three distinct poses.
Input image 1 is the approved idle sprite sheet; match its identity, pixel-art style, right-facing three-quarter side camera and body proportions exactly. Blonde ponytail paladin, white ribbon and blue jewel tiara, blue eyes, silver gold armor, navy cloak and white gold tabard, spiked mace held down on screen left and full tall kite shield in front at screen right. Input image 2 is original design only.
Layout: 2x2 equal cells. Top-left is frame 1, top-right frame 2, bottom-left frame 3, bottom-right must be entirely transparent and EMPTY. Three characters total. Give each full body and all equipment at least 15% transparent margins to every cell edge. Same anatomical/body scale in all three poses.
Frame 1: CROUCH / jump preparation: both knees clearly bent, hips lowered about one quarter of standing height, torso slightly forward, shield held close, mace down, heels on ground. It connects from idle.
Frame 2: AIRBORNE jump: extended torso, both boots clearly off the ground with knees bent and feet tucked below/behind, ponytail and navy cloak lifted slightly by upward motion. Hold shield stable forward. No attack and no magic. Full silhouette including shield and mace stays inside cell. This is a distinctly airborne tucked-leg pose.
Frame 3: LANDING: feet planted wider with knees bent to absorb impact, torso and head lowered, ponytail settling, shield steady. It can rise naturally back to idle. Distinguish landing from initial crouch: wider feet, deeper knee bend and hair settling.
Do not draw ground or height lines; gameplay will position airborne pose higher. Crisp rich pixel art with dark outline matching idle, no smooth painted anime. True alpha transparency, no background, checkerboard, floor shadow, text, labels, grid lines, additional characters, attacks or effects.
```

## v2: 透過輪郭の赤いにじみ修正

v2は赤い低alpha輪郭が改善しなかったため不採用。採用原画はv1。

```text
Use case: precise-object-edit. Clean ONLY the alpha/transparency-edge contamination in this 2x2 PALADIN JUMP sheet. Preserve the exact three poses, cell positions, image layout, all body proportions, pose geometry, facial expressions, armor details, colors, gold/silver shield, mace, blonde hair and navy cape. Top-left crouch, top-right airborne, bottom-left landing, bottom-right entirely EMPTY transparent. Keep true alpha.
There are stray bright RED/PINK fringes and small red scraps around silhouette edges, especially the lifted navy cape in the top-right airborne pose. This paladin design has NO red color. Remove every stray red/pink edge pixel and halo outside the actual silhouette; use clean dark navy/brown/gold natural pixel-art contour colors inside silhouettes and fully transparent alpha outside them. There must be no red cape glow, matte, rim or specks. Do not add shadows or background, don't erode actual limbs, cloak, hair or equipment. No other edits. The full silhouette must remain uncropped. Same rich pixel-art style. No smooth painting, labels, checkerboard, floor, effects or additional frames.
```
