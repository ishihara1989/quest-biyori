# パラディン / 待機モーション v1

生成方法: 組み込み `image_gen`（`transparent_background: true`）。CLI/APIフォールバックは不使用。

参照画像と役割:

- `../references/paladin-original.png`: キャラクターデザインのみ。金髪、白リボン、青石の額飾り、銀金鎧、紺マント、白タバード、棘付きメイス、大盾を保持。
- `../warrior/source/warrior-idle-generated-v1.png`: ユーザー承認済みの画風、頭身、ドット粒度、右向き待機姿勢の参照。戦士の服装や剣は転用しない。

## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for a polished side-scrolling browser idle RPG. ONE transparent PNG with exactly FOUR animation frames in an equally sized 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. This is one coherent seamless breathing idle animation, not four character variations.

Input image 1 is a CHARACTER DESIGN reference only, not an art style reference. Input image 2 is the APPROVED ART STYLE, proportions and pixel-granularity reference, showing another party member. Do not copy the warrior's brown colors, leather costume or sword. Adapt the SAME young female paladin from image 1: long golden-blonde hair in a high ponytail with braided side section and white ribbon, blue eyes, gold tiara with a blue diamond jewel, ornate silver full plate armor with gold edging and gold diamond/cross motifs, navy-blue undersuit and cape, long white front tabard edged in gold with gold heraldic emblem, silver/gold knee-high armored boots, a large silver-and-gold elongated kite shield, and a spiked silver morningstar/mace on a short dark handle with gold collar. Exactly this equipment. No sword, helmet, wings or added equipment.

Composition: complete head-to-toe RIGHT-FACING side view for a belt-scrolling beat-em-up. Face and nose point decisively right; torso shows only a very slight three-quarter side angle to keep armor and shield legible, comparable to input image 2. Neutral grounded ready stance, legs planted apart, shield held upright in front on the right side of the character, mace in the other hand held low diagonally toward the left without touching the ground. Entire ponytail, ribbon, cape, tabard, shield, boots and mace head visible with generous transparent margin in EACH tile. Leave at least 8 percent transparent padding around all edges of each cell; no object reaches a cell boundary. EXACTLY SAME size, position, boot baseline, proportions, face, equipment shapes, outline and pixel palette across all four tiles. Align the ground/soles at precisely the same local y coordinate in every tile; never move either foot. Character occupies about 78 percent of each tile height.

Animation frames: 1 neutral exhale, 2 torso/shoulders/head rise one logical pixel, 3 maximum gentle inhale torso/head rise two logical pixels with subtle breathing, 4 torso/head return to one logical pixel raised. Knees/hips accommodate breathing while feet stay fixed. Ponytail tips and hanging cloth move at most one pixel with the breathing. Hands, shield and mace shift consistently with torso by at most one pixel. Frame 4 flows back to frame 1. Very restrained breathing; NO walking, swinging, stance changes, pose changes, camera changes or whole-body floating.

Style: match input image 2's high-quality hand-crafted arcade/JRPG pixel art, detailed but readable, matching its stylized proportions and roughly 96-128 logical pixels tall character. Deliberate clean square pixel clusters, 1 logical pixel dark colored outline, crisp silver armor reflections, warm restrained gold accents, deep navy cloth shadows, controlled palette, several clear shadow tones. Draw on a true consistent square pixel grid, upscale with nearest neighbor so pixels remain sharp. No smooth linework, no anti-aliased illustration edges, no painted gradients, no 3D, no blur. Preserve the recognizable paladin reference design.

Background: genuinely transparent alpha everywhere outside the four characters. NO checkerboard baked into image, NO ground, NO cast shadows, NO border, NO tile separators, NO labels, NO text, NO watermark, NO UI. Four equal cells in a precise 2x2 sprite sheet, no extra frames.
```

生成原画: `source/paladin-idle-generated-v1.png`（1278×1230、RGBA）。2列×2行、左上→右上→左下→右下の4コマ。四隅は透明（alpha=0）。
原画由来の顔・髪・メイス・盾などの微小な輪郭差は残っているため、完成ループは検証画面で確認する。

## ゲーム用素材と確認

- `paladin-idle.png`: 640×160 RGBA、4列×1行、1コマ160×160。
- `paladin-idle-preview.gif`: 320×320、4コマ×400ms、1.6秒で無限ループ。
- 共通ツール `node tools/assets/build-character.cjs paladin` と `node tools/assets/build-preview.cjs paladin` により原画のRGBAを保って接地点を合わせ、最近傍で縮小。全コマの接地点は y=151。
- 透明背景、余白、4コマの差異、共通接地位置のチェックは通過。生成後のPNGシートとGIFを目視確認し、髪・メイス・盾・ブーツの欠けがないことを確認。

