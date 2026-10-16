# 魔法使い・ジャンプ

生成方法: 組み込み image_gen、transparent_background: true。参照1は承認済み待機の単一160pxスプライト（主たる画風・頭身・キャラクター同一性）、参照2は承認済み待機の生成原画（詳細）、参照3は元デザイン（衣装のみ、画風は引き継がない）。

参照画像:
- public/assets/mage/idle-01.png
- public/assets/mage/source/mage-idle-generated-v1.png
- public/assets/references/mage-original.png

初稿所見: しゃがみ／両足を曲げた滞空／着地の3姿勢と右下空セルは成立。左上セルの足が正確な中央境界より下にはみ出すため、元の初稿を残してレイアウトの修正を実施。v2 では全身が各セル内に収まった。v2 を最終素材の加工元として使用。

## 初稿全文プロンプト

```text
Use case: identity-preserve
Asset type: production pixel-art character animation sprite sheet for a browser belt-scrolling RPG.
Input images: Image 1 is the approved single idle sprite, PRIMARY identity, body proportions, exact costume, palette and pixel-density reference. Image 2 is the high-resolution approved 4-frame idle source, supporting identity and detailed pixel-art rendering reference. Image 3 is original character illustration, costume-detail reference only, NOT its smooth art style.
Character invariants: the SAME small blue-haired female mage, long royal-blue hair, oversized navy-purple wizard hat with gold trim and dangling ornament, blue diamond jewel in hat band, navy-purple long robe with gold embroidery and white inner skirt, purple ruffled hem, blue boots with gold trim, brown belt and pouch, brown wooden staff with bronze head holding a faceted bright blue crystal. Keep exact face, hairstyle, clothing, colors, short RPG sprite head/body ratio and visible pixel block size of approved idle; crisp clean pixel art and stair-step pixel edges; no smooth vector or painterly shading.
View: full-body character facing RIGHT in the same shallow side / three-quarter-right orientation as approved idle, never turn left. Camera and sprite body scale fixed across every frame. Staff remains the same existing staff, held in the same near/front hand.
Backdrop: genuine alpha TRANSPARENT everywhere outside the sprite. No solid fill, no checkerboard baked into pixels, no shadow or floor.
Layout: a SQUARE sheet with EXACTLY 4 equal-sized square cells in an exact 2 columns by 2 rows grid. No drawn border, no dividers, no text, no labels. Reading order top-left, top-right, bottom-left, bottom-right. A complete separate character in each used cell. At least 15% transparent margin on each edge of EVERY cell; no hat, hair, crystal or boot touches a cell border. All four figures same scale, same root x location, same floor baseline except airborne pose. Enough space for every appendage and staff in each cell.
Avoid: extra characters, extra limbs, extra weapons, attacks, magic effects, glow clouds, motion trails, dust, background scenery, UI, writing, watermarks. Do not reuse the original illustration's smooth drawing style.
Primary request: THREE-FRAME JUMP animation, facing RIGHT, SAME CHARACTER. Only cells 1, 2 and 3 have a sprite. Cell 4 BOTTOM-RIGHT MUST be ENTIRELY transparent, absolutely empty. No fourth character. Row-major frames:
Frame 1 TOP-LEFT = crouch / takeoff preparation. Clearly lower hips and bent knees, both boots planted, torso compact and slightly leaning forward, staff pulled closer beside her, hat settles lower with crouch. This is one compression pose combining preparatory squat and takeoff readiness; looks physically about to jump.
Frame 2 TOP-RIGHT = airborne / ascent and hangtime. Body lifted up, both FEET CLEARLY off the shared baseline. Both knees bent and boots tucked up beneath skirt at DIFFERENT distinct positions, not standing legs. Hair and cape trail down/back. Staff tucked safely diagonally close to body; entire crystal and hat present. No magic / no levitation aura, this is a bodily jump.
Frame 3 BOTTOM-LEFT = landing / absorb impact. BOTH boots on the ground baseline, knees deeply bent to absorb, torso lowered but balanced, free hand extends slightly to balance. Hat and hair settle with small downward follow-through. Pose can smoothly recover into the approved idle.
Frame 4 BOTTOM-RIGHT = completely empty TRANSPARENT cell.
Preserve identical body and head SCALE across these poses. Knees bend and body compresses naturally, do not just scale down crouch poses. Let the airborne character's boots sit visibly HIGHER within its cell than the planted boots, leaving more transparent space BELOW its feet. Preserve complete silhouette within every occupied cell. No floor shadow, no dust, no motion trail.
```

## レイアウト修正全文プロンプト

```text
Use case: identity-preserve
Asset type: exact square 2x2 pixel-art jump animation sprite sheet with three frames and one empty frame.
Edit target: the provided existing mage jump sheet. Preserve its same character identity, pixel-art style, hat, staff, costume colors, face, and the three specific POSES. Change ONLY the grid framing and transparent padding so sprites cannot cross cell boundaries.
Critical grid geometry: canvas is 1280 x 1280 (square); cell 1 x=0..639 y=0..639; cell 2 x=640..1279 y=0..639; cell 3 x=0..639 y=640..1279; cell 4 x=640..1279 y=640..1279 completely empty and transparent. No visible grid lines.
Every complete sprite must fit ENTIRELY inside the central 70% of its own square cell, leaving at least 15% transparent gap on all four edges. All three bodies must have identical anatomical SCALE. Preserve complete hat, hair, staff, boots.
The TOP-LEFT CROUCH sprite is currently too low with boots crossing the middle horizontal boundary; move this COMPLETE sprite UP within the top-left cell, and keep all its feet and its staff entirely above y=544. Uniformly reduce the three sprites together only as needed for a consistent character scale and padding. Do not crop anything.
Top-left: same squat/takeoff compression, boots planted.
Top-right: same airborne bent knees and raised boots, both feet off baseline.
Bottom-left: same landing compressed knees, boots planted.
Bottom-right: entirely transparent. Preserve genuine transparent alpha. No background, no shadow, no new pose, no extra frame, no text, no effects. This is a framing correction, not a redesign.
```
