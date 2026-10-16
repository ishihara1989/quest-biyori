# Warrior jump

- 方法: 組み込み image_gen、transparent_background: true。画像生成以外で姿勢を描き直していません。
- 参照1: `../../../../../public/assets/warrior/idle-01.png` — 承認済み待機の顔・頭身・色・装備・画風。
- 参照2: `../../source/warrior-idle-generated-v1.png` — 待機の詳細ピクセル表現。
- 参照3: `../../../references/warrior-original.png` — 元デザインの確認、画風は参照しない。
- 原画: `source/warrior-jump-generated-v1.png`。
- 検証所見: しゃがみ、両足を持ち上げた滞空、着地の3姿勢。空セルは切り出し対象外。manifest の previewOffset で滞空高さを加え、共通pivotで待機へ戻る。 共通処理で透過、原画/出力余白、別ポーズ、共通基準位置を検査して成功。原画間に細かな輪郭の変化あり。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: pixel-art sprite-sheet for a browser belt-scroll IdleRPG, warrior character.
Input images: image 1 is the approved 160px idle sprite and the PRIMARY identity, palette, proportions, rendering and equipment reference; image 2 is its high-resolution approved idle sprite sheet and SECONDARY pixel-detail reference; image 3 is the original design illustration, design details only, NOT its painting style.
Preserve the same young adult female warrior with large brown ponytail and black hair tie, brown leather chest armor, black collar and shorts, leather gloves, buckle belt, long brown front cloth with silver ornament, brown armored boots and same large silver-gray double-edged sword with ornate star-shaped guard. Keep identical face, eyes, hairstyle, age, outfit, weapon, colors and head/body ratio.
Style: polished detailed pixel art matching the APPROVED IDLE, crisp small pixel clusters and hard edges; shallow right-facing side / three-quarter game view. All frames face RIGHT. Hold sword in both hands diagonally upward toward the right in the same natural ready guard as idle, no attacks.
Backdrop: true transparent alpha background. No background, ground shadow, particles, effects, text, grid lines, labels, borders or other characters.
Composition: square 2 columns by 2 rows sprite sheet with four perfectly equal cells; only three occupied, reading order top left, top right, bottom left, bottom right. Each whole body, ponytail and full sword must fit entirely inside its own cell with at least 15% transparent margin on all four sides. Identical character scale in every cell. Same body center horizontally within each cell. Use matching invisible ground baseline in crouch and landing; airborne frame must clearly lift both feet above that baseline. All appendages and weapon fully visible. This is a one-shot jump sequence, not a loop; no independently rescaled frames.
Primary request: Create the warrior JUMP with EXACTLY THREE meaningful animation keyframes and ONE completely transparent empty cell. Top left = crouched preparation/takeoff anticipation, both knees bent low, both feet on the invisible floor, sword maintained in two-handed upward-right guard. Top right = airborne takeoff and hang-time pose, whole body lifted, BOTH BOOTS visibly off the floor, both knees tucked moderately underneath, feet hanging above their grounded position, ponytail follows upward motion; same sword safely held. Bottom left = landing absorption, both feet on the floor, torso lowered and knees flexed in a stable landing, near enough to idle to return naturally. Bottom right = EMPTY: fully transparent alpha, no character, no equipment, nothing. Keep EXACT same anatomy, body scale, outfit, sword and right-facing view across all three poses. Do not draw an extra fourth character. No dust, jump rings, motion lines or shadows. Frame order: prepare -> airborne -> land. Sufficient transparent padding around every complete figure and sword.
```
