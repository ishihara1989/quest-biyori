# 魔法使い / 待機モーション v1

生成方法: 組み込み `image_gen`。背景透過を有効にし、以下の2点を参照。

- `development/assets/references/mage-original.png`: キャラクターデザイン参照。青髪、紺紫の帽子とローブ、金縁、青水晶の杖を維持。
- `development/assets/warrior/source/warrior-idle-generated-v1.png`: 承認済み戦士の画風、頭身、ドット粒度、陰影、動きの控えめさの参照。

## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for a polished side-scrolling browser idle RPG. ONE transparent PNG with exactly FOUR animation frames in an equally sized 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. This is one coherent seamless breathing idle animation, not four character variations.

Input image 1 is a CHARACTER DESIGN reference only. Input image 2 is the approved warrior sprite sheet and is the ART STYLE, BODY PROPORTIONS, PIXEL SIZE, SHADING and animation restraint reference only. Create only the mage from image 1, matching the visual production system of image 2, never the warrior's hair or clothing.

Subject: the SAME young female mage with long flowing blue hair and blue eyes, large navy-violet pointed wizard hat with a bent trailing tip and gold edging, angular gold hat band holding a bright blue faceted diamond gem and a small dangling gold ornament at the bent tip. Navy-violet long open robe with gold borders, modest gold motifs, broad sleeves with pale cream cuffs and violet interior; pale cream inner dress with violet lower hem; brown leather belts and small pouch with blue gemstone accents; navy ankle boots with gold trim and blue gems. Her single brown staff has the exact curving forked ornamental brown/gold head and large faceted blue crystal from image 1, with the smaller blue gem below it. Preserve the reference outfit details and silhouette; do not invent extra equipment.

Composition: complete head-to-toe RIGHT-FACING side view for a belt-scrolling beat-em-up. Face and nose point decisively right; torso can show a very shallow three-quarter side angle to keep the robe and belt readable. Neutral grounded ready stance, both feet planted, holding the staff in front of the body with the forward hand; the staff is mostly vertical, slightly tilted toward the right, its lower tip near the boot baseline. Other hand relaxed near the body. Entire hat tip, hair, hanging robe, staff crystal, staff bottom and boots remain fully visible with generous transparent margin in EACH tile. EXACTLY SAME size, position, boot baseline, proportions, face, clothing, staff shape, outline and pixel palette across all four tiles. Align the ground/soles at precisely the same local y coordinate in every tile; never move either foot. Keep comparable body scale and head-to-body ratio to the approved warrior. The character and accessories together occupy about 80 percent of each tile height, with at least 7 percent clear transparent margin on every side.

Animation frames: 1 neutral exhale, 2 torso/shoulders/head rise one logical pixel, 3 maximum gentle inhale torso/head rise two logical pixels and chest subtly expands, 4 torso/head return to one logical pixel raised. Knees/hips accommodate breathing while feet stay fixed. Hair tips, robe edge and hat-tip ornament move at most one pixel with the breathing. Hand and staff shift consistently with torso by at most one logical pixel. Frame 4 flows back to frame 1. Very restrained breathing; NO walking, casting, swinging, stance changes, pose changes, camera changes or whole-body floating.

Style: match image 2's high-quality hand-crafted arcade/JRPG pixel art, detailed but readable, about 96-128 logical pixels tall per character, deliberate clean square pixel clusters, 1 logical pixel dark colored outline, rich blue and violet cloth shadow tones, selective gold trim highlights and crisp blue crystal facets, controlled palette. Draw on a true consistent square pixel grid, upscale with nearest neighbor so pixels remain sharp. No smooth linework, no anti-aliased illustration edges, no painted gradients, no 3D, no blur. Preserve the recognizable mage design rather than turning her into a generic wizard.

Background: genuinely transparent alpha everywhere outside the four characters. NO checkerboard baked into image, NO ground, NO cast shadows, NO border, NO tile separators, NO labels, NO text, NO watermark, NO UI, NO particles, NO spell effects or glow outside the crystal. Four equal cells in a precise 2x2 sprite sheet, no extra frames.
```

生成原画: `source/mage-idle-generated-v1.png`（1278×1230、RGBA、2列×2行、左上→右上→左下→右下）。
原画のRGBAは変更せず保存。使用素材への切り出しと位置合わせは共通ビルドツールで実施済み。

最終素材: `mage-idle.png`（640×160、1コマ160×160、右向き4コマ）、`idle-01.png`〜`idle-04.png`、`manifest.json`、`mage-idle-preview.gif`（320×320、400ms×4の1.6秒無限ループ）。全コマ共通倍率で最近傍サンプリングし、接地ピボット(76,151)に位置合わせ。透過・余白・4コマ差分・接地チェックに合格。実際の上下セル境界と倍率はmanifest参照。

原画確認: 四隅の alpha は 0。各コマの帽子・髪・杖・足が画面内にある。上下コマ間の主な透明帯は y=620〜635（alpha>32 の判定）で、等分の y=615 より少し下にあるため、切り出しの境界は y=627 付近が適切。生成由来のごく小さな輪郭差・低 alpha の周辺ピクセルは残る。

