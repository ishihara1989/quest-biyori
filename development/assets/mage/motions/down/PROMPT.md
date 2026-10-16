# 魔法使い・ダウン

生成方法: 組み込み image_gen、transparent_background: true。参照1は承認済み待機の単一160pxスプライト（主たる画風・頭身・キャラクター同一性）、参照2は承認済み待機の生成原画（詳細）、参照3は元デザイン（衣装のみ、画風は引き継がない）。

参照画像:
- public/assets/mage/idle-01.png
- public/assets/mage/source/mage-idle-generated-v1.png
- public/assets/references/mage-original.png

初稿所見: 強いのけぞり→膝つき→横倒れ途中→横たわった静止の4姿勢。杖と帽子を維持。最終コマは待機へ戻らない。透明なコマ間余白で分割する共通処理を使用する。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: production pixel-art character animation sprite sheet for a browser belt-scrolling RPG.
Input images: Image 1 is the approved single idle sprite, PRIMARY identity, body proportions, exact costume, palette and pixel-density reference. Image 2 is the high-resolution approved 4-frame idle source, supporting identity and detailed pixel-art rendering reference. Image 3 is original character illustration, costume-detail reference only, NOT its smooth art style.
Character invariants: the SAME small blue-haired female mage, long royal-blue hair, oversized navy-purple wizard hat with gold trim and dangling ornament, blue diamond jewel in hat band, navy-purple long robe with gold embroidery and white inner skirt, purple ruffled hem, blue boots with gold trim, brown belt and pouch, brown wooden staff with bronze head holding a faceted bright blue crystal. Keep exact face, hairstyle, clothing, colors, short RPG sprite head/body ratio and visible pixel block size of approved idle; crisp clean pixel art and stair-step pixel edges; no smooth vector or painterly shading.
View: full-body character facing RIGHT in the same shallow side / three-quarter-right orientation as approved idle, never turn left. Camera and sprite body scale fixed across every frame. Staff remains the same existing staff, held in the same near/front hand.
Backdrop: genuine alpha TRANSPARENT everywhere outside the sprite. No solid fill, no checkerboard baked into pixels, no shadow or floor.
Layout: a SQUARE sheet with EXACTLY 4 equal-sized square cells in an exact 2 columns by 2 rows grid. No drawn border, no dividers, no text, no labels. Reading order top-left, top-right, bottom-left, bottom-right. A complete separate character in each used cell. At least 15% transparent margin on each edge of EVERY cell; no hat, hair, crystal or boot touches a cell border. All four figures same scale, same root x location, same floor baseline except airborne pose. Enough space for every appendage and staff in each cell.
Avoid: extra characters, extra limbs, extra weapons, attacks, magic effects, glow clouds, motion trails, dust, background scenery, UI, writing, watermarks. Do not reuse the original illustration's smooth drawing style.
Primary request: FOUR-FRAME DOWN / COLLAPSE animation, a single non-looping progression from the right-facing approved idle into lying still on the ground.
Frame 1 TOP-LEFT: strong backward RECOIL, head and upper torso lean LEFT away from unseen impact, eyes squeeze shut, bent knees and off-balance pose. Do not resemble a normal idle. Same staff held intact, tilted slightly with arm.
Frame 2 TOP-RIGHT: KNEEL / collapse downward. One knee clearly on ground, other knee bending sharply, hips much lower, torso slumped forward and exhausted. Head dips, eyes shut, free hand reaches toward ground. Keep hat present. Staff lowers as grip weakens.
Frame 3 BOTTOM-LEFT: TIPPING SIDEWAYS INTO A FALL toward LEFT. Whole body diagonally tilted or almost horizontal, shoulder/head descending to LEFT, legs/boots extended RIGHT, free arm braces toward ground. This is clearly between kneeling and flat lying. Staff drops alongside at a diagonal, all parts visible inside this cell.
Frame 4 BOTTOM-RIGHT: FULLY DOWN, STILL and LYING ON HER SIDE, long body horizontally along the ground baseline, head/hair/hat toward LEFT, boots toward RIGHT, eyes closed, limbs relaxed. Not kneeling, not sitting, not curled vertical, not crouching; the torso is truly horizontal. Staff lies beside her on the ground, fully visible including intact blue crystal. Hat remains on or immediately beside her head, same exact hat, do not remove it.
Motion consistency: same face, hair, costume, body/head size and anatomy across all four frames. Torso and legs naturally fold/rotate, do not shrink the character for the lying pose. Keep all hair, hat, boots and the WHOLE staff within their own cells with broad transparent padding. The final down frame HOLDS and does NOT transition back to idle. No blood, no injury detail, no attacker, no effects, no floor/shadow.
```
