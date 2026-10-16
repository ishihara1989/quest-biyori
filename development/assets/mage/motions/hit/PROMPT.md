# 魔法使い・被撃

生成方法: 組み込み image_gen、transparent_background: true。参照1は承認済み待機の単一160pxスプライト（主たる画風・頭身・キャラクター同一性）、参照2は承認済み待機の生成原画（詳細）、参照3は元デザイン（衣装のみ、画風は引き継がない）。

参照画像:
- public/assets/mage/idle-01.png
- public/assets/mage/source/mage-idle-generated-v1.png
- public/assets/references/mage-original.png

初稿所見: 横2コマ。のけぞりと閉眼／待機に近い立て直しの2姿勢を確認。帽子・杖・全身に欠けはない。新規エフェクトなし。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: production pixel-art character animation sprite sheet for a browser belt-scrolling RPG.
Input images: Image 1 is the approved single idle sprite, PRIMARY identity, body proportions, exact costume, palette and pixel-density reference. Image 2 is the high-resolution approved 4-frame idle source, supporting identity and detailed pixel-art rendering reference. Image 3 is original character illustration, costume-detail reference only, NOT its smooth art style.
Character invariants: the SAME small blue-haired female mage, long royal-blue hair, oversized navy-purple wizard hat with gold trim and dangling ornament, blue diamond jewel in hat band, navy-purple long robe with gold embroidery and white inner skirt, purple ruffled hem, blue boots with gold trim, brown belt and pouch, brown wooden staff with bronze head holding a faceted bright blue crystal. Keep exact face, hairstyle, clothing, colors, short RPG sprite head/body ratio and visible pixel block size of approved idle; crisp clean pixel art and stair-step pixel edges; no smooth vector or painterly shading.
View: full-body character facing RIGHT in the same shallow side / three-quarter-right orientation as approved idle, never turn left. Camera and sprite body scale fixed across every frame. Staff remains the same existing staff, held in the same near/front hand.
Backdrop: genuine alpha TRANSPARENT everywhere outside the sprite. No solid fill, no checkerboard baked into pixels, no shadow or floor.
Layout: a WIDE horizontal sprite sheet, EXACTLY 2 equal-sized square cells side by side, 2 columns by 1 row. A 2:1 aspect ratio sheet. No other cell, no duplicates, no drawn border, no dividers, no text, no labels. Complete separate character in each cell. At least 15% transparent gap on EACH of four edges of each cell. Character body scale fixed between frames; all appendages and staff inside their own cell.
Avoid: extra characters, extra limbs, extra weapons, attacks, magic effects, glow clouds, motion trails, dust, background scenery, UI, writing, watermarks. Do not reuse the original illustration's smooth drawing style.
Primary request: TWO-FRAME HIT / DAMAGE REACTION, no attack.
Frame 1 LEFT: a clear brief RECOIL from an unseen hit coming from the right. Torso and head lean backward toward LEFT, eyes shut tightly in pain, mouth slightly tense, knees bending to regain footing, free arm tensed back/raised slightly for balance. Hat and long hair follow the backward lean; staff tilts with the holding arm but remains recognizable and unbroken. Body does not turn away from right.
Frame 2 RIGHT: recovery / regain balance. Eyes open, head/body return toward the approved right-facing idle stance, slightly bent knees and strained expression remain. Staff returns near upright, free hand loosens. Pose should connect smoothly BACK to approved idle.
No attacker, no blood, no wound, no hit flash, no strike slash, no stars, no stun icons, no impact particles. Only the SAME mage acting out recoil and recovery.
```
