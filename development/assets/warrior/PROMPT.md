# 戦士 / 待機モーション v1

生成方法: 組み込み `image_gen`。背景透過を有効にし、以下の既存デザイン2点を参照。

- `C:\Users\ashit\src\idle_rpgs\idle_rpg_godot-2\assets\characters\warrior.png`
- `C:\Users\ashit\src\idle_rpgs\idle_rpg_godot-2\assets\characters\motions\warrior_move.png`

## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for a polished side-scrolling browser idle RPG. ONE transparent PNG with exactly FOUR animation frames in an equally sized 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. This is one coherent seamless breathing idle animation, not four character variations.

Input image 1 is a CHARACTER DESIGN reference only, not an art style reference. Input image 2 shows the same character in motion and helps with her right-facing silhouette only. Adapt this SAME young female warrior: rich brown high ponytail tied in black, expressive brown eye, brown leather sleeveless armor, black high-neck undershirt, leather bracers and fingerless gloves, short leather battle skirt with long front tabard, brown armored knee-high boots, buckles, very large silver two-handed broadsword with a dark center fuller and angular decorative silver crossguard. Do not add a helmet, cape, shield or extra weapons.

Composition: complete head-to-toe RIGHT-FACING side view for a belt-scrolling beat-em-up. Face and nose point decisively right; the torso can show a very slight three-quarter side angle to keep equipment legible. Neutral grounded ready stance, legs planted apart, both hands gripping the sword in front of the waist, sword points diagonally up toward the right around 40 degrees. Entire ponytail, boots and sword tip visible with generous transparent margin in EACH tile. EXACTLY SAME size, position, boot baseline, proportions, face, clothing, sword shape, outline and pixel palette across all four tiles. Align the ground/soles at precisely the same local y coordinate in every tile; never move either foot. The character occupies about 80 percent of each tile height.

Animation frames: 1 neutral exhale, 2 torso/shoulders/head rise one logical pixel, 3 maximum gentle inhale torso/head rise two logical pixels and chest subtly expands, 4 torso/head return to one logical pixel raised. Knees/hips accommodate breathing while feet stay fixed. Ponytail tips and hanging cloth move at most one pixel with the breathing. Hands/sword shift consistently with torso by at most one pixel. Frame 4 flows back to frame 1. Very restrained breathing; NO walking, swinging, stance changes, pose changes, camera changes or whole-body floating.

Style: high-quality hand-crafted arcade/JRPG pixel art, detailed but readable, about 96-128 logical pixels tall per character, deliberate clean square pixel clusters, 1 logical pixel dark colored outline, selective warm leather highlights, crisp silver reflections, controlled palette, several clear shadow tones. Draw on a true consistent square pixel grid, upscale with nearest neighbor so pixels remain sharp. No smooth linework, no anti-aliased illustration edges, no painted gradients, no 3D, no blur. Preserve her recognizable reference design and proportions rather than turning her into a generic armored knight.
Background: genuinely transparent alpha everywhere outside the four characters. NO checkerboard baked into image, NO ground, NO cast shadows, NO border, NO tile separators, NO labels, NO text, NO watermark, NO UI. Four equal cells in a precise 2x2 sprite sheet, no extra frames.
```

生成原画: `source/warrior-idle-generated-v1.png`（1278×1230、2列×2行）。
使用素材: `warrior-idle.png`（640×160、4列×1行、1コマ160×160）。
原画のRGBAを変更せず、接地点に基づく位置合わせと1/4の最近傍サンプリングのみ実施。
原画由来の顔・髪・剣などの微小な輪郭差は残っており、検証画面で確認する。
