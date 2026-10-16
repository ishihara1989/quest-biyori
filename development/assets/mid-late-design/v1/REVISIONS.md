# 敵デザイン修正プロンプト

## 氷河の大ボス・レア素材差し替え（2026-10-12）

大ボスを氷牙マンモス、レア素材をマンモスの氷牙へ変更。組み込み image_gen で個別基準と4種の静止エフェクトを生成し、既存の6敵・4素材のピクセルを保って該当セルだけ配置し直す。

- [今回の全生成プロンプト](glacier/PROMPTS.md)
- [基準・危険技の確認](glacier/mammoth-review.html)
- [差し替え検査](glacier/replacement-qa.json)
- [氷河企画](GLACIER-PLAN.md)／[氷河・火山・魔王城の妨害企画](DANGER-ACTIONS.md)

2026-10-11 JST。組み込み image_gen の編集機能を使用。初版を基準に配色・形を維持し、全身の余白を改善。高原のマンティコアは人面も明確化。初版と修正版は両方保存。

## 可愛い方向への調整（2026-10-11）

組み込み image_gen の参照画像編集。ラミアとドラゴンガールの顔・表情・顔周りの髪を柔らかくした成人の静止デザイン。v2原画を残し、確認ページにv3を表示。モーション未制作。

### desert-monsters-v3

基準: `desert/monsters-v2.png`

出力: `desert/monsters-v3.png`

```text
Edit the provided transparent pixel-art RPG enemy design sheet. Change ONLY the adult female Lamia in the MIDDLE ROW, RIGHT COLUMN. Make her design moderately cuter and more charming, in a polished Japanese fantasy RPG character style: a gently rounded face and cheeks, slightly larger bright turquoise eyes with clear highlights, softer brows, a small playful warm smile, and soft face-framing locks of her existing long dark hair. Increase the head only slightly, about ten percent; retain clearly adult proportions and the mature elegant snake-woman identity, no childlike or chibi body. Keep her turquoise and gold Egyptian jewelry and costume, cobra crown, golden scales, ONE long coiled golden snake tail, visible pale belly scales, and left-facing three-quarter neutral standing pose. Let the cute face be readable at game viewing size. Preserve her basic silhouette, overall character size and position and the sheet's original crisp detailed pixel-art shading, outline treatment and palette. Preserve the other SIX enemies exactly as in the reference, the seven-character three-row layout, clear transparent gutters and outer margins. No new characters, no labels or text, no added background, no floor shadow. Actual transparent alpha PNG. One static pose only, no motion frames.
```

### volcano-monsters-v3

基準: `volcano/monsters-v2.png`

出力: `volcano/monsters-v3.png`

```text
Edit the provided transparent pixel-art RPG enemy design sheet. Change ONLY the adult female Dragon Girl in the MIDDLE ROW, RIGHT COLUMN. Make her moderately cuter and more charming, like an appealing Japanese fantasy RPG heroine who is also a powerful dragon boss: gently rounded cheeks and a softer small jaw, slightly larger sparkling amber eyes, relaxed brows instead of a stern glare, and a small confident playful smile. Add soft face-framing strands and slightly rounder volume to her existing long red hair. Increase the head only slightly, about ten percent, keeping clearly adult proportions; no child or chibi body. Preserve red dragon horns, pointed ears, two large orange-red membranous wings, ONE long red scaled tail, clawed dragon feet, and black scale armor with warm gold/lava details; retain armor coverage and no weapon. Keep her left-facing three-quarter neutral standing pose, basic silhouette, overall size and location. Preserve the original crisp detailed pixel-art shading, outline treatment and palette. Preserve the other SIX enemies exactly as in the reference, the seven-character three-row layout, clear transparent gutters and outer margins. No new characters, labels or text, no added background or floor shadow. Actual transparent alpha PNG. One static pose only, no motion frames.
```

## desert-monsters-v2

基準: `desert/monsters.png`

```text
Use case: precise-object-edit
Edit target: the supplied transparent monster atlas.
Keep exactly these SAME seven character identities, designs, colors, pixel-art finish, clothing, species, poses, and left-facing direction. Change ONLY framing and spacing: each of the seven sprites must be scaled down to about 70% of its current size and placed on a spacious 3x3 equal-cell square canvas. TOP ROW A/B/C. MIDDLE ROW A+/B+/C+. BOTTOM ROW only D centered. Leave bottom-left and bottom-right empty. Each entire sprite including every wing tip, strand of hair, helmet point, tail, foot and weapon must be visible with 15% clear transparent padding INSIDE its own cell. Maintain a generous clear transparent outer margin on all four edges. Do not allow any sprite to touch another or a grid boundary. Repair any previously cropped tips using the existing design. Do not change lighting, palette or the character silhouettes. No text, grid lines, panels, effects or background. Actual transparent alpha. This is a static design comparison, not animation.
```

## highland-monsters-v2

基準: `highland/monsters.png`

```text
Use case: precise-object-edit
Edit target: the supplied transparent monster atlas.
Keep exactly these SAME seven character identities, designs, colors, pixel-art finish, clothing, species, poses, and left-facing direction. Change ONLY framing and spacing: each of the seven sprites must be scaled down to about 70% of its current size and placed on a spacious 3x3 equal-cell square canvas. TOP ROW A/B/C. MIDDLE ROW A+/B+/C+. BOTTOM ROW only D centered. Leave bottom-left and bottom-right empty. Each entire sprite including every wing tip, strand of hair, helmet point, tail, foot and weapon must be visible with 15% clear transparent padding INSIDE its own cell. Maintain a generous clear transparent outer margin on all four edges. Do not allow any sprite to touch another or a grid boundary. Repair any previously cropped tips using the existing design. Do not change lighting, palette or the character silhouettes. No text, grid lines, panels, effects or background. Actual transparent alpha. This is a static design comparison, not animation.
One anatomy correction for the bottom manticore only: make the face a fearsome mature HUMAN face framed by its red lion mane, retaining lion body, violet bat wings and scorpion tail. The face must visibly have a human nose and mouth, not a lion muzzle.
```

## glacier-monsters-v2

基準: `glacier/monsters.png`

```text
Use case: precise-object-edit
Edit target: the supplied transparent monster atlas.
Keep exactly these SAME seven character identities, designs, colors, pixel-art finish, clothing, species, poses, and left-facing direction. Change ONLY framing and spacing: each of the seven sprites must be scaled down to about 70% of its current size and placed on a spacious 3x3 equal-cell square canvas. TOP ROW A/B/C. MIDDLE ROW A+/B+/C+. BOTTOM ROW only D centered. Leave bottom-left and bottom-right empty. Each entire sprite including every wing tip, strand of hair, helmet point, tail, foot and weapon must be visible with 15% clear transparent padding INSIDE its own cell. Maintain a generous clear transparent outer margin on all four edges. Do not allow any sprite to touch another or a grid boundary. Repair any previously cropped tips using the existing design. Do not change lighting, palette or the character silhouettes. No text, grid lines, panels, effects or background. Actual transparent alpha. This is a static design comparison, not animation.
```

## volcano-monsters-v2

基準: `volcano/monsters.png`

```text
Use case: precise-object-edit
Edit target: the supplied transparent monster atlas.
Keep exactly these SAME seven character identities, designs, colors, pixel-art finish, clothing, species, poses, and left-facing direction. Change ONLY framing and spacing: each of the seven sprites must be scaled down to about 70% of its current size and placed on a spacious 3x3 equal-cell square canvas. TOP ROW A/B/C. MIDDLE ROW A+/B+/C+. BOTTOM ROW only D centered. Leave bottom-left and bottom-right empty. Each entire sprite including every wing tip, strand of hair, helmet point, tail, foot and weapon must be visible with 15% clear transparent padding INSIDE its own cell. Maintain a generous clear transparent outer margin on all four edges. Do not allow any sprite to touch another or a grid boundary. Repair any previously cropped tips using the existing design. Do not change lighting, palette or the character silhouettes. No text, grid lines, panels, effects or background. Actual transparent alpha. This is a static design comparison, not animation.
```

## demon-castle-monsters-v2

基準: `demon-castle/monsters.png`

```text
Use case: precise-object-edit
Edit target: supplied transparent demon-castle monster atlas. Preserve all seven SAME monster designs, colors, pixel-art style, armor, faces, poses and six arms of the bottom demon god. Only repair framing and spacing: shrink every complete sprite to about 70% current size, place them on an exact 3x3 equal-cell square canvas, top row three regular enemies, middle row three bosses, bottom center demon god; bottom left/right empty. Keep 15% clear transparent padding inside each occupied cell, including full swords, capes, wing tips, every hair strand, horns and feet. Reconstruct previously cropped wing tips in the same design. No sprite may touch another or any cell/image edge. Preserve the adult female dream demon and Lilith, and EXACTLY SIX visible arms on the demon god. Do not recolor, redesign, change species or add props. True transparent alpha, no text, checkerboard, grid lines, floor, backdrop or effects. Single static pose per character, no animation.
```

