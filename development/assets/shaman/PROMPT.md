# 呪術師 / 待機モーション v1

生成方法: 組み込み `image_gen`。背景透過を有効にし、次の2点を参照。

- `../references/shaman-original.png`: キャラクターデザイン参照。褐色肌、銀白色の髪、民族衣装、頭蓋骨と宝珠の杖を保持。
- `../warrior/source/warrior-idle-generated-v1.png`: ユーザー承認済みの画風・頭身・ドット粒度の参照。装備や髪型をコピーしない。

## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for a polished side-scrolling browser idle RPG. ONE transparent PNG with exactly FOUR animation frames in an equally sized 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. This is one coherent seamless breathing idle animation, not four character variations.

Input image 1 is the CHARACTER DESIGN reference only. Input image 2 is the approved STYLE AND PROPORTIONS reference: match its detailed square pixel clusters, outline, character head-to-body ratio, shading, and logical pixel scale. Do not copy the warrior's armor, weapon, hairstyle, palette or facial identity into the shaman.

Subject: the SAME young female shaman as input image 1: warm brown skin, pointed elf ears, amber eyes, long silver-white high ponytail tied with red-orange and gold, white tribal face/body markings, teal and burnt orange-red tribal cloth skirt panels and dark brown cropped top, brown strapped sandals with gold trim, gold jewelry, bone teeth and feather ornaments. Preserve the characteristic wooden staff topped with a horned animal skull with teal forehead marking, teal round hanging orb in gold, and teal and orange feathers. Keep her recognizable original outfit and accessories. No extra weapons, no invented armor, no helmet or cloak.

Composition: complete head-to-toe RIGHT-FACING side to very shallow three-quarter side view for a belt-scrolling beat-em-up. Face and nose point decisively right, torso mostly side-facing with just enough front visible to read her design. Grounded relaxed ready stance, legs planted apart, hold the skull staff ahead at the right, nearly upright with a small diagonal tilt. The other arm rests naturally slightly in front of her hip. All four tiles have EXACTLY SAME pose, scale, local position, staff shape, outfit, face, palette and silhouette. Entire ponytail, staff skull/horns, orb, feathers and sandals must fit fully inside EACH tile with generous transparent margin. Do not touch image edges or tile boundaries. Character including staff occupies about 80 percent of each cell height. Feet on the same local y baseline in every tile. Never move either foot or the staff contact point.

Animation frames: 1 neutral exhale, 2 torso/shoulders/head rise one logical pixel, 3 maximum gentle inhale torso/head rise two logical pixels with tiny chest expansion, 4 torso/head return to one logical pixel raised. Knees/hips accommodate breathing while feet stay fixed. Ponytail tips and hanging cloth and staff feathers shift by at most one logical pixel. Staff itself remains steady. Frame 4 flows smoothly back to frame 1. Extremely restrained breathing; no walking, attacking, casting, magic effects, pose changes, camera changes or whole-body floating.

Style/medium: match the approved warrior reference's high-quality hand-crafted arcade/JRPG pixel art. Detailed but readable, approximately 96-128 logical pixels tall per character, consistent deliberate clean square pixel clusters, one-logical-pixel dark colored outline, layered silver hair highlights, warm brown skin shading, crisp bone and gold highlights, controlled palette. Match the warrior's slightly compact fantasy proportions and large readable eyes. Draw on a true consistent square pixel grid and upscale with nearest neighbor so pixels remain sharp. No smooth illustration linework, no blur, no painted gradients, no 3D. All four characters must use the same pixel grid and shading. Keep the staff and long white ponytail particularly consistent frame to frame.

Background: genuinely transparent alpha everywhere outside the four shaman sprites. NO checkerboard baked into image, NO ground or cast shadows, NO labels, NO text, NO watermark, NO UI, NO border or grid lines, NO tile separators. Exactly four equal cells in a precise 2x2 sprite sheet, no extra frames.
```

生成原画: `source/shaman-idle-generated-v1.png`（1278×1230 RGBA、2列×2行、分割位置 y=619）。

使用素材: `shaman-idle.png`（640×160 RGBA、4列×1行、1コマ160×160）。個別コマは `idle-01.png`〜`idle-04.png`、アニメーション仕様は `manifest.json`。

プレビュー: `shaman-idle-preview.gif`（320×320、1コマ400ms、全4コマ1.6秒、透過・無限ループ）。

共通加工: `node tools/assets/build-character.cjs shaman` と `node tools/assets/build-preview.cjs shaman`。生成RGBAを保持し、全高と余白に合わせた全コマ共通倍率で最近傍サンプリングと足元の位置合わせのみ実施。最終倍率は `manifest.json` の `scale` を参照。接地基準は y=151、ピボット x=76。

確認: 共通ツールの透過、余白、異なる4コマ、共通接地の検証を通過。最終シートと個別コマを目視し、髪・杖の角・宝珠・サンダルがセル内に収まり、褐色肌、銀白色の髪、青緑と橙赤の衣装、頭蓋骨の杖を保持していることを確認。参照よりも戦士と同じコンパクトな頭身へ変換。生成由来の微細な髪・衣装・杖装飾の輪郭差は残る。
