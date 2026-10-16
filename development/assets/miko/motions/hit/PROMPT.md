# 巫女 / 被撃2コマ v1

生成方法: 組み込み `image_gen`、透明背景。

参照の役割:

- `../../source/miko-idle-generated-v1.png`: 承認済みのドット絵・同一人物・衣装と御幣。
- `../../../references/miko-original.png`: 原デザイン参照（画風は使用しない）。
- `../../../../../public/assets/miko/idle-01.png`: 完成待機の頭身・シルエット・ピクセル粒度。

## 最終仕様と検証

生成原画: `source/miko-hit-generated-v1.png`（1774×887、2列×1行）。
使用素材: `miko-hit.png`（512×224、2コマ、1コマ256×224）。
確認用GIF: `miko-hit-preview.gif`（512×448、160/220ms、1回再生）。
共通ピボット: x=128, y=207。生成RGBAを保ち、最近傍サンプリングと位置合わせのみ実施。倍率は待機の人物高とモーション仕様から `manifest.scale` に共通処理で決定される。
検証: 元コマ・出力のシルエット余白、透明性、各コマの画素差、基準線の一致を共通assertで確認。GIFの2コマ・遅延・alphaを確認。PNGシートを目視確認済み。
生成由来の顔、髪、袖、紙垂の細かな輪郭差は残る。


## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art animation sprite sheet for a polished side-scrolling browser Idle RPG.
Input image 1 is the APPROVED PIXEL CHARACTER and art style reference (the existing idle sheet); image 2 is the original CHARACTER DESIGN reference only; image 3 is the approved packaged idle frame for silhouette, body proportions and pixel granularity. Adapt the SAME young female shrine maiden: long black hair with charcoal sheen; very large red hair bow with white zigzag trim and red/white ribbon tails; brown eyes; white kimono with very wide hanging sleeves, red edging and red stitches; gold sleeve knots and small tassels; wide red waist sash tied into a front bow; long red pleated hakama; white tabi socks and brown-soled zori with red straps. Hold the SAME slim brown wooden gohei wand with a small gold knot at top, alternating white zigzag shide paper streamers and a tiny red tassel. Keep her youth, gentle expressive face, slightly oversized head and the same hand-crafted arcade/JRPG pixel style.
Composition: decisively RIGHT-FACING side view with only a shallow three-quarter torso angle, as in the idle. Never mirror her or turn to face left. Same character scale and camera in every cell. Preserve exact colors and recognizable costume and equipment. All hair, ribbon tails, sleeves, feet, wand and ALL white paper tips must fit within each cell with at least 20 percent TRANSPARENT margin on every side. Keep the entire silhouette confined to the central 60 percent of each equal cell width/height. No pixel can touch the central dividing axes or outer image edges. The head stays the same size across poses.
Style: detailed but readable intentional square pixel clusters, crisp dark colored outlines, nearest-neighbor pixel finish, controlled crimson/white/charcoal palette, readable folds and selective highlights. Preserve source pixel granularity, about 96-128 logical pixels of standing character height. No smooth vector linework, no blur, no antialiased illustration edges, no painted gradient or 3D.
Background: genuine transparent alpha outside the characters. No flat background, no baked checkerboard, no ground, no cast shadow, no text, no numbers, no UI, no tile borders, no labels, no watermark. No enemies, no attack, no additional equipment, no magic, no effect particles.
Motion ID: hit. Create EXACTLY TWO character frames in a precise 2 columns by 1 row equal-cell WIDE sprite sheet, horizontal chronological order LEFT then RIGHT. No second row, no extra characters. Both have the same physical head size and full-body scale, with generous transparent margins for the gohei and long hair.

Frame 1 (left) hit reaction: still facing RIGHT, visibly recoils backward toward LEFT from an unseen impact. Torso and head lean back around 20 degrees, shoulders pulled back, knees bend, feet remain planted and braced. Eyes close briefly and mouth opens a little with a mild pained expression, no injury or gore. Long black hair, bow tails and sleeves follow the recoil naturally. The gohei stays in her same hand, paper and small red tassel clearly readable; wrist moves back slightly, equipment is not dropped. Do not turn her face toward viewer or left.
Frame 2 (right) recovery: near the approved calm idle stance, torso becomes upright, knees straighten slightly, brown eyes reopen, mouth returns to neutral. Gohei returns to its normal diagonal up/right hold. Hair and sleeves settle. This is unmistakably a DIFFERENT standing pose from the left recoil and will transition into idle in game code.

Same local foot contact line in both cells. No attack, knock-out collapse, enemy, spark, blood, impact symbol, effect or shadow. No huge expression distortion. Keep every character part, hair and wand completely within its own equal cell with 20 percent padding. Transparent empty space between the two figures; no dividing line, words or numbers.
```

初稿所見: 左が目を閉じて後方へのけぞる被撃、右が待機に近い立て直し。御幣を保持し、衣装と髪の特徴を維持。出血・敵・エフェクトはない。

