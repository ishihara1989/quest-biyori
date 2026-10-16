# 巫女 / 待機モーション v1

生成方法: 組み込み `image_gen`。背景透過を有効化。

参照の役割:

- `development/assets/references/miko-original.png`: キャラクターデザイン参照。黒い長髪、紅白の髪リボン、白い広袖の上衣、緋袴、足袋と草履、御幣を継承。
- `development/assets/warrior/source/warrior-idle-generated-v1.png`: ユーザー承認済みのドット絵の画風、頭身、ピクセル密度参照。戦士の衣装と武器は流用しない。

## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for the same polished side-scrolling browser idle RPG as reference image 2. Create ONE transparent PNG containing exactly FOUR animation frames in an equally sized 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. This is one coherent seamless breathing idle animation, not four character variations.

Input image 1 is the CHARACTER DESIGN reference only, not an art style reference. Adapt this same young female shrine maiden (miko): long flowing black hair with a charcoal shine; the large red hair bow with white zigzag border and red/white hanging ribbon tails; expressive brown eye; white kimono upper garment with large open hanging sleeves and understated red edging and red stitches near the cuffs; small gold knotted ornaments and tassels on the upper sleeves; red wide waist sash tied in a large front bow; long vermilion pleated hakama; white tabi socks and simple brown-soled zori sandals with red straps. She holds the reference wooden gohei purification wand, a slim brown rod with a small gold knot at the top, alternating hanging white zigzag paper streamers (shide), and one small red tassel below the paper cluster. Do not add equipment, magic or jewelry.
Input image 2 is the APPROVED ART STYLE, pixel density and body proportion reference only. Match its deliberate high-quality arcade/JRPG pixel clusters, dark crisp colored outlines, readable dimensional shading, young anime face and slightly oversized head. Do not copy the warrior's brown ponytail, leather outfit or sword. The resulting miko must visually belong to the same party.

Composition: complete head-to-toe RIGHT-FACING side view for a belt-scrolling beat-em-up. Face and nose point decisively right; torso can show a very slight three-quarter side angle to keep sleeves and sash legible. Calm grounded ready stance, both sandal soles firmly planted in the same stance. The right/front hand holds the gohei forward at waist height, its tip angled diagonally up toward the right; the other arm rests naturally with its wide sleeve hanging at her left side. Entire hair, bow, ribbon tails, sleeves, paper tips, wand tip and feet visible with generous transparent margin in EVERY tile. Each whole character occupies about 78 percent of the cell height. Give the wand and long hair enough horizontal breathing room; nothing touches a cell edge. Exactly the SAME size, local position, sandal baseline, proportions, face, clothing, wand geometry, outline and palette across all four tiles. Align the sandal soles at precisely the same local y coordinate in every tile; never move either foot.

Animation frames: 1 neutral exhale; 2 torso/shoulders/head rise one logical pixel; 3 maximum gentle inhale torso/head rise two logical pixels with subtle chest expansion; 4 torso/head return to one logical pixel raised. Hips and knees accommodate breathing while feet stay fixed. Hair ends, hanging sleeve hems and paper tips follow breathing by at most one logical pixel. Hand and wand shift consistently with torso by at most one logical pixel. Frame 4 flows back to frame 1. The silhouette and pose are nearly identical between frames. NO walking, swinging, dancing, attack, stance change, equipment change, whole-body floating or large motion.

Style: high-quality handcrafted arcade/JRPG pixel art matching reference 2, detailed but readable, about 96-128 logical pixels tall per character, deliberate clean square pixel clusters, 1 logical pixel dark colored outline, controlled crimson/white/charcoal palette, clear fold shadows and selective warm highlights. Draw on a true consistent square pixel grid and upscale with nearest neighbor so pixels remain sharp. No smooth linework, no anti-aliased illustration edges, no painted gradients, no 3D and no blur. Preserve the recognizable shrine maiden reference design rather than turning her into a generic priestess.

Background: genuinely transparent alpha everywhere outside the FOUR character sprites. No baked-in checkerboard, no solid background, no ground, no cast shadow, no border, no tile separator, no label, no text, no watermark, no UI. Four equal cells in a precise 2x2 sprite sheet, no extra frames.
```

## 最終仕様と検証

生成原画: `source/miko-idle-generated-v1.png`（1278×1230、透明RGBA、2列×2行）。
使用素材: `miko-idle.png`（640×160、4列×1行、1コマ160×160）。
単独フレーム: `idle-01.png` ～ `idle-04.png`。
確認用ループ: `miko-idle-preview.gif`（320×320、各コマ400ms、合計1.6秒、無限ループ）。
接地点: 4コマとも y=151、共通ピボット x=76。
加工: 生成RGBAを変更せず、最近傍サンプリングと足に基づく位置合わせだけ実施。統合時に倍率上限を外し、全高と透明余白に収まる共通倍率を決定。最終倍率は `manifest.json` の `scale` を参照。
検証: 共通ツールの透明性、シルエットの余白、4コマの画素差、接地点の一致のassertをすべて通過。最終PNGを目視確認し、黒髪、紅白の髪リボン、白い広袖、緋袴、足袋と草履、紙垂付き御幣が参照に一致。
留意点: 原画由来の顔・髪・紙垂・袖の微小な輪郭差は残る。初稿のクリップを避けるため原画の余白を広げた。最終素材は共通の高さ・接地規格に合わせてサイズを調整済み。

## 余白修正のプロンプト全文

初稿は御幣がセル境界に接して検証に失敗したため、組み込み `image_gen` で全体の配置と余白だけ修正。初稿を `source/miko-idle-generated-attempt-01.png` として保存し、修正版を採用。

```text
Use case: identity-preserve.
Asset type: transparent 4-frame 2x2 pixel-art sprite sheet for a right-facing shrine maiden idle animation.
Input image 1 is the EDIT TARGET: the existing pixel-art shrine maiden sprite sheet. Input image 2 is the original character design reference only. Input image 3 is the approved pixel style and body proportion reference only.

Make ONE targeted correction to input image 1: reframe every character fully inside its own cell by making the entire figure AND all held equipment smaller and placing it within generous transparent margins. In the current target, white paper streamers touch the right cell edges; that is unacceptable for a game sprite. Re-create exactly the same four character frames but with the whole silhouette including wand, paper, long hair, ribbon, sleeve and sandals confined to the central 70 percent of EACH cell width and central 70 percent of EACH cell height. Leave at least 12 percent of each cell width as fully transparent margin on BOTH left and right and at least 10 percent of each cell height on top and bottom. No silhouette pixel may touch any outer image edge or the vertical/horizontal midline between cells. Keep the correct right-facing pose, slight 3/4 torso, small head-to-body ratio matching target, pure white/red miko costume, black flowing long hair, red/white bow, large sleeves, waist bow and vermilion hakama, white tabi and zori, gold sleeve knots, and slim wooden gohei with white zigzag paper and tiny red tassel. Do not change the character design, art style, palette, clothing, equipment or pose. Do not omit or shorten the wand or paper to force them to fit. Just scale each whole silhouette uniformly smaller, with a coherent common scale across all four frames.

Layout: EXACTLY FOUR equal cells in a precise 2 columns by 2 rows grid, no extra frames. Order top-left, top-right, bottom-left, bottom-right. Every whole silhouette is completely contained in its own cell with wide transparent padding. Precisely same local planted foot baseline and stance in every cell. The four frames remain almost identical, with very restrained breathing: frame 1 neutral, frame 2 torso/head rise one logical pixel, frame 3 rise two logical pixels, frame 4 return to one. Feet stay absolutely planted and fixed; sleeve tips, long hair ends and paper tips move at most one logical pixel. No walking, attack, stance change or floating.

Preserve the high-quality arcade/JRPG pixel art of target: clean intentional square pixel clusters, dark colored crisp outlines, controlled vivid red/white/charcoal colors, readable shadows and highlights, about 96-128 logical pixels tall per character. No smooth illustration edges, no blur, no gradients, no 3D. Background is genuine transparent alpha, not a checkerboard or flat background. No ground, no shadow, no text, no numbers, no separator lines, no labels or watermark.
```


