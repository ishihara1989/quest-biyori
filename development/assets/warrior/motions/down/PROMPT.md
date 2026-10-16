# Warrior down

- 方法: 組み込み image_gen、transparent_background: true。画像生成以外で姿勢を描き直していません。
- 参照1: `../../../../../public/assets/warrior/idle-01.png` — 承認済み待機の顔・頭身・色・装備・画風。
- 参照2: `../../source/warrior-idle-generated-v1.png` — 待機の詳細ピクセル表現。
- 参照3: `../../../references/warrior-original.png` — 元デザインの確認、画風は参照しない。
- 原画: `source/warrior-down-generated-v1.png`。
- 検証所見: 強いのけぞり、膝をつく、横へ倒れ込む、水平に倒れて静止の4姿勢。全身・ポニーテール・剣を収録。terminal=true、待機へ戻さず最後の姿勢を保持。 共通処理で透過、原画/出力余白、別ポーズ、共通基準位置を検査して成功。原画間に細かな輪郭の変化あり。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: pixel-art sprite-sheet for a browser belt-scroll IdleRPG, warrior character.
Input images: image 1 is the approved 160px idle sprite and the PRIMARY identity, palette, proportions, rendering and equipment reference; image 2 is its high-resolution approved idle sprite sheet and SECONDARY pixel-detail reference; image 3 is the original design illustration, design details only, NOT its painting style.
Preserve the same young adult female warrior with large brown ponytail and black hair tie, brown leather chest armor, black collar and shorts, leather gloves, buckle belt, long brown front cloth with silver ornament, brown armored boots and same large silver-gray double-edged sword with ornate star-shaped guard. Keep identical face, eyes, hairstyle, age, outfit, weapon, colors and head/body ratio.
Style: polished detailed pixel art matching the APPROVED IDLE, crisp small pixel clusters and hard edges; shallow right-facing side / three-quarter game view. Orientation initially faces RIGHT, then collapses sideways while preserving the same design. Same sword remains held and rotates naturally with the collapse, no attacks.
Backdrop: true transparent alpha background. No background, ground shadow, particles, effects, text, grid lines, labels, borders or other characters.
Composition: square 2 columns by 2 rows sprite sheet with four perfectly equal cells, reading order top left, top right, bottom left, bottom right. Each whole body, ponytail and full sword must fit entirely inside its own cell with at least 15% transparent margin on all four sides. Identical character scale in every cell. Same imaginary ground baseline. Each pose centers horizontally within its cell. As she falls, the character lowers naturally toward the floor. All appendages and weapon fully visible. The frames are a physically coherent one-shot collapse, NOT a loop. Final down frame must remain down. Keep the anatomical scale identical across cells, especially the lying figure; no independently rescaled frames.
Primary request: FOUR keyframes of DOWN / FALLING sequence, caused by a strong unseen impact from the right. Frame 1 top left = strong recoil backward-left from the idle stance, face grimacing, torso clearly arches back, knees weaken, SAME sword tilts upward while held. Frame 2 top right = drops to one knee / both knees buckle, body collapses lower, head bowed slightly, sword lowers naturally while still visible and held, ponytail follows. Frame 3 bottom left = sideways fall toward LEFT, body tilts near horizontal, left shoulder/head descending toward floor, knees and feet rise modestly as balance is lost, whole body and whole sword visible. Frame 4 bottom right = lying completely DOWN and motionless on the invisible floor, head to LEFT, boots to RIGHT, eyes closed, body on her side, knees bent mildly, ponytail spread near head, same armor and sword nearby held low along body or floor; blade points toward RIGHT and fits inside cell. Frame 4 must clearly be horizontal resting down, NOT kneeling or merely crouching. Match body/sword scale across all cells. To fit the broad lying pose, draw all four subjects compactly at the same size, each occupies at most 70% cell width and 70% cell height, leaving at least 15% transparent padding EVERY side. The full sword tip, guard, boots and ponytail must never touch a cell edge. No effects, floor, ground shadows, blood, new equipment or other characters. First pose can begin naturally from idle; no recovery to idle after the fourth frame.
```
