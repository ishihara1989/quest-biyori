# Warrior hit

- 方法: 組み込み image_gen、transparent_background: true。画像生成以外で姿勢を描き直していません。
- 参照1: `../../../../../public/assets/warrior/idle-01.png` — 承認済み待機の顔・頭身・色・装備・画風。
- 参照2: `../../source/warrior-idle-generated-v1.png` — 待機の詳細ピクセル表現。
- 参照3: `../../../references/warrior-original.png` — 元デザインの確認、画風は参照しない。
- 原画: `source/warrior-hit-generated-v1.png`。
- 検証所見: 明瞭なのけぞり/痛みと立て直しの2姿勢。元と同じ剣を握ったまま保持。立て直しから待機への接続を確認。 共通処理で透過、原画/出力余白、別ポーズ、共通基準位置を検査して成功。原画間に細かな輪郭の変化あり。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: pixel-art sprite-sheet for a browser belt-scroll IdleRPG, warrior character.
Input images: image 1 is the approved 160px idle sprite and the PRIMARY identity, palette, proportions, rendering and equipment reference; image 2 is its high-resolution approved idle sprite sheet and SECONDARY pixel-detail reference; image 3 is the original design illustration, design details only, NOT its painting style.
Preserve the same young adult female warrior with large brown ponytail and black hair tie, brown leather chest armor, black collar and shorts, leather gloves, buckle belt, long brown front cloth with silver ornament, brown armored boots and same large silver-gray double-edged sword with ornate star-shaped guard. Keep identical face, eyes, hairstyle, age, outfit, weapon, colors and head/body ratio.
Style: polished detailed pixel art matching the APPROVED IDLE, crisp small pixel clusters and hard edges; shallow right-facing side / three-quarter game view. All frames face RIGHT. Hold the same sword in both hands; its guard can tilt with the impact but it remains a secure held weapon, no attack.
Backdrop: true transparent alpha background. No background, ground shadow, particles, effects, text, grid lines, labels, borders or other characters.
Composition: wide horizontal 2 columns by 1 row sprite sheet with TWO perfectly equal square cells, reading order left then right. Each whole body, ponytail and full sword must fit entirely inside its own cell with at least 15% transparent margin on all four sides. Identical character scale in every cell. Same imaginary ground baseline and body center within each cell, not travelling across the cell. All appendages and weapon fully visible. This is a single impact reaction and recovery, NOT a seamless loop; no independently rescaled frames.
Primary request: exactly TWO keyframes of HIT REACTION, connected with the approved idle pose. LEFT frame = clear non-graphic impact from the right, warrior visibly flinches and recoils torso/head backward toward LEFT, eyes squint with pain, shoulders raised, knees bend to absorb, arms and sword tilt with the recoil but same grip and whole intact sword; ponytail follows the backward recoil. RIGHT frame = recovering balance back toward the usual idle guard, eyes open determinedly, feet grounded, torso almost upright, knees only slightly flexed, sword again held diagonally up-right. The recovery should be close enough to return to the approved idle. Stronger posing than idle but no attack, no giant lunge, no wound or blood, no hit-flash effects. No third or fourth figure. Preserve character design exactly.
```
