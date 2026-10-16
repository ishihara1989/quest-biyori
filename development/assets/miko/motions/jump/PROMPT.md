# 巫女 / ジャンプ3コマ v1

生成方法: 組み込み `image_gen`、透明背景。

参照の役割:

- `../../source/miko-idle-generated-v1.png`: 承認済みのドット絵・同一人物・衣装と御幣。
- `../../../references/miko-original.png`: 原デザイン参照（画風は使用しない）。
- `../../../../../public/assets/miko/idle-01.png`: 完成待機の頭身・シルエット・ピクセル粒度。

## 最終仕様と検証

生成原画: `source/miko-jump-generated-v1.png`（1278×1230、2列×2行）。
使用素材: `miko-jump.png`（768×224、3コマ、1コマ256×224）。
確認用GIF: `miko-jump-preview.gif`（512×448、160/360/200ms、1回再生）。
共通ピボット: x=128, y=207。生成RGBAを保ち、最近傍サンプリングと位置合わせのみ実施。倍率は待機の人物高とモーション仕様から `manifest.scale` に共通処理で決定される。
検証: 元コマ・出力のシルエット余白、透明性、各コマの画素差、基準線の一致を共通assertで確認。GIFの3コマ・遅延・alphaを確認。PNGシートを目視確認済み。
滞空は2コマ目の `airborne: true` と `previewOffset.y: -38` で表現。ゲームでは共通ピボットとジャンプのワールド座標を使用する。
生成由来の顔、髪、袖、紙垂の細かな輪郭差は残る。


## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art animation sprite sheet for a polished side-scrolling browser Idle RPG.
Input image 1 is the APPROVED PIXEL CHARACTER and art style reference (the existing idle sheet); image 2 is the original CHARACTER DESIGN reference only; image 3 is the approved packaged idle frame for silhouette, body proportions and pixel granularity. Adapt the SAME young female shrine maiden: long black hair with charcoal sheen; very large red hair bow with white zigzag trim and red/white ribbon tails; brown eyes; white kimono with very wide hanging sleeves, red edging and red stitches; gold sleeve knots and small tassels; wide red waist sash tied into a front bow; long red pleated hakama; white tabi socks and brown-soled zori with red straps. Hold the SAME slim brown wooden gohei wand with a small gold knot at top, alternating white zigzag shide paper streamers and a tiny red tassel. Keep her youth, gentle expressive face, slightly oversized head and the same hand-crafted arcade/JRPG pixel style.
Composition: decisively RIGHT-FACING side view with only a shallow three-quarter torso angle, as in the idle. Never mirror her or turn to face left. Same character scale and camera in every cell. Preserve exact colors and recognizable costume and equipment. All hair, ribbon tails, sleeves, feet, wand and ALL white paper tips must fit within each cell with at least 20 percent TRANSPARENT margin on every side. Keep the entire silhouette confined to the central 60 percent of each equal cell width/height. No pixel can touch the central dividing axes or outer image edges. The head stays the same size across poses.
Style: detailed but readable intentional square pixel clusters, crisp dark colored outlines, nearest-neighbor pixel finish, controlled crimson/white/charcoal palette, readable folds and selective highlights. Preserve source pixel granularity, about 96-128 logical pixels of standing character height. No smooth vector linework, no blur, no antialiased illustration edges, no painted gradient or 3D.
Background: genuine transparent alpha outside the characters. No flat background, no baked checkerboard, no ground, no cast shadow, no text, no numbers, no UI, no tile borders, no labels, no watermark. No enemies, no attack, no additional equipment, no magic, no effect particles.
Motion ID: jump. Create EXACTLY THREE character frames in a precise 2 columns by 2 rows equal-cell grid. Chronological order is TOP-LEFT, TOP-RIGHT, BOTTOM-LEFT. BOTTOM-RIGHT must be a COMPLETELY EMPTY TRANSPARENT CELL with no character, mark, label or stray pixel. This is a one-shot jump animation, not a breathing or walk cycle.

Frame 1 (top-left) anticipation: facing RIGHT, feet planted on the local contact line, hips lowered, knees clearly bent in a modest crouch to prepare to jump, sleeves settle and the gohei is kept in her hand, diagonally up/right.
Frame 2 (top-right) airborne: unmistakably IN THE AIR with BOTH feet off the contact line and BOTH knees bent, feet tucked back/under the red hakama. Entire torso and head rise relative to frame 1 but do NOT enlarge her. Hair and large sleeves lift modestly from upward motion, red hakama folds show the bent legs, both white tabi and zori visible and lifted. Keep the gohei in the same hand; no spell or attack, no fluttering dramatic huge cape. No foot contacts the same baseline as frame 1 or 3.
Frame 3 (bottom-left) landing: both feet contact the original local contact line, knees bend to absorb impact with hips/head lowered and the hakama folding naturally. This pose is visibly different from anticipation; torso leans forward slightly, sleeves and hair settle with small downward follow-through. She continues to face RIGHT.

Maintain exact same physical head size and full standing anatomical proportions across all three poses. Do not make a tiny jumping version. The airborne motion is represented by the lifted/tucked feet and pose, plus transparent vertical space; game code supplies additional vertical travel. Keep whole person, hair, ribbon, all sleeve edges, wand and paper fully within each cell with wide transparent padding. No jump effect, shadow, landing dust, enemy or equipment change.
```

初稿所見: 左上のしゃがみ、右上の両足を上げた滞空、左下の着地姿勢、右下の透明空セル。御幣の保持と衣装は維持。移動距離はゲーム側の位置メタデータで加える。

