# 巫女 / ダウン4コマ v1

生成方法: 組み込み `image_gen`、透明背景を指定。

参照の役割:

- `../../source/miko-idle-generated-v1.png`: 承認済みのドット絵・同一人物・衣装と御幣。
- `../../../references/miko-original.png`: 原デザイン参照（画風は使用しない）。
- `../../../../../public/assets/miko/idle-01.png`: 完成待機の頭身・シルエット・ピクセル粒度。

## 最終仕様と検証

生成原画: `source/miko-down-generated-v1.png`（1536×1024、2列×2行）。
使用素材: `miko-down.png`（1024×224、4コマ、1コマ256×224）。
確認用GIF: `miko-down-preview.gif`（512×448、150/180/220/700ms、1回再生）。
共通ピボット: x=128, y=207。生成RGBAを保ち、最近傍サンプリングと位置合わせのみ実施。倍率は待機の人物高とモーション仕様から `manifest.scale` に共通処理で決定される。
検証: 元コマ・出力のシルエット余白、透明性、各コマの画素差、基準線の一致を共通assertで確認。GIFの4コマ・遅延・alphaを確認。PNGシートを目視確認済み。
最終コマは横臥静止の `terminal: true`。待機への自動復帰はない。各コマの横幅差を `layout.json` のアンカー指定で合わせ、人物や御幣を切らずに収める。
生成由来の顔、髪、袖、紙垂の細かな輪郭差は残る。


## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art animation sprite sheet for a polished side-scrolling browser Idle RPG.
Input image 1 is the APPROVED PIXEL CHARACTER and art style reference (the existing idle sheet); image 2 is the original CHARACTER DESIGN reference only; image 3 is the approved packaged idle frame for silhouette, body proportions and pixel granularity. Adapt the SAME young female shrine maiden: long black hair with charcoal sheen; very large red hair bow with white zigzag trim and red/white ribbon tails; brown eyes; white kimono with very wide hanging sleeves, red edging and red stitches; gold sleeve knots and small tassels; wide red waist sash tied into a front bow; long red pleated hakama; white tabi socks and brown-soled zori with red straps. Hold the SAME slim brown wooden gohei wand with a small gold knot at top, alternating white zigzag shide paper streamers and a tiny red tassel. Keep her youth, gentle expressive face, slightly oversized head and the same hand-crafted arcade/JRPG pixel style.
Composition: decisively RIGHT-FACING side view with only a shallow three-quarter torso angle, as in the idle. Never mirror her or turn to face left. Same character scale and camera in every cell. Preserve exact colors and recognizable costume and equipment. All hair, ribbon tails, sleeves, feet, wand and ALL white paper tips must fit within each cell with at least 18 percent TRANSPARENT margin on every side. Keep the entire silhouette confined to the central 64 percent of each equal cell width/height. No pixel can touch the central dividing axes or outer image edges. The head stays the same size across poses.
Style: detailed but readable intentional square pixel clusters, crisp dark colored outlines, nearest-neighbor pixel finish, controlled crimson/white/charcoal palette, readable folds and selective highlights. Preserve source pixel granularity, about 96-128 logical pixels of standing character height. No smooth vector linework, no blur, no antialiased illustration edges, no painted gradient or 3D.
Background: genuine transparent alpha outside the characters. No flat background, no baked checkerboard, no ground, no cast shadow, no text, no numbers, no UI, no tile borders, no labels, no watermark. No enemies, no attack, no additional equipment, no magic, no effect particles.
Motion ID: down. Create EXACTLY FOUR chronological frames in a precise 2 columns by 2 rows equal-cell sprite sheet. The cells should be WIDE ENOUGH (landscape cell proportions if needed) to contain the final fully prone horizontal body without clipping or changing character size. Reading order top-left, top-right, bottom-left, bottom-right. This is a ONE-SHOT KNOCKDOWN sequence. The last frame is a terminal DOWN state, never a standing idle pose and never a recovery pose.

Frame 1 top-left: strong backward recoil to the LEFT while still facing RIGHT. Torso leans back noticeably, face eyes squeeze closed, mouth briefly open, feet braced with knees bending. Keep the exact approved black hair, red/white bow, white/red long sleeves and red hakama.
Frame 2 top-right: collapse onto BOTH KNEES. Body now substantially LOWER than frame 1 with red hakama folded on the ground around both bent legs. Head droops, eyes closed. One hand supports her weight near the ground while the gohei remains in the other hand tilted downward, paper resting closer to her side. This is a kneeling collapse, not a squat or idle.
Frame 3 bottom-left: falling sideways/back toward LEFT. Body is halfway between kneeling and prone with torso on a strong diagonal, shoulder approaching ground, head low at left, knees and sandals extending toward right. Black hair and red ribbon flow onto the ground. Gohei follows her arm downward, not thrown and not swung.
Frame 4 bottom-right: FULL BODY HORIZONTAL AND STILL, LYING ON HER SIDE, head at LEFT and both feet at RIGHT. Her torso, hip and hakama lie parallel to the floor, face is still the same right-facing/profile character but eyes remain closed. Both legs are no longer supporting her. White tabi and red-strap zori at the right end are fully visible, black hair spreads to the left and red/white bow remains attached. Her arm and long white sleeve rest low. The brown gohei lies alongside her body in her loosely holding hand with ALL white zigzag paper and tiny red tassel retained and visible. Nothing floats. This is a clear complete prone silhouette, not a kneeling person and not a detached head or robe.

All four frames show the SAME anatomical size: same head size, same arm/leg length and equipment dimensions, no zoom and no miniaturizing the horizontal pose. Give every silhouette, including hair spread, feet and gohei paper, at least 18 percent transparent padding. Center each pose appropriately in its own cell while retaining a shared local ground contact line. The final pose may occupy much greater WIDTH but much less HEIGHT than the standing pose. No gore, no skeleton, no enemy, no attack, no impact effects, no dust, no cast shadow. Clothing remains intact and matches the approved design. Four clearly distinct stages ending down; do not repeat standing poses.
```

初稿所見: のけぞり、膝をつく、倒れ込み、全身を横たえる順序は良好。画像のRGB表示には背景色が見えるが、背景のalphaは0であり透過GIFでは背景色が消える。共通処理の初期アンカーでは横臥の髪が出力枠から出たため、`layout.json` の各コマのxアンカーを指定し全身を収めた。背景除去を試した再生成は非採用で `source/miko-down-generated-attempt-02.png` として保存。

## 非採用の背景除去試行プロンプト全文

```text
Use case: background-extraction.
Asset type: transparent production 4-frame pixel-art sprite sheet.
Input image 1 is the EDIT TARGET: shrine maiden knockdown sprite sheet in four 2x2 cells.
Make exactly ONE correction: REMOVE THE ENTIRE BACKGROUND AND ALL COLORED GLOWS, HALOS, GRADIENTS AND SHADOWS. Output genuine clean transparent alpha, with alpha ZERO in ALL pixels outside the four shrine maiden characters and their wooden gohei wands/paper streamers. The current brown/red/cream haze is unwanted background contamination, not part of the characters. Delete every bit of that haze and colored glow between, around and under the figures. No replacement background, no checkerboard, no cast shadow.
KEEP THE FOUR CHARACTERS EXACTLY AS THEY ARE: same layout, same scale, same pose order, face, black hair, red/white bow, white sleeves, red hakama, sandals, gohei wand and white paper streamers. Top-left strong recoil, top-right kneeling collapse, bottom-left sideways falling, bottom-right full horizontal prone resting state. The final pose must remain horizontal with head at left and feet at right. Preserve all character anatomy and all equipment, hard pixel-art outlines, square pixel clusters, color palette and details. Do not redraw, redesign, mirror, stand up, recover, add glow, blur, text or labels. Keep actual red and white cloth colors and hair colors; only remove the background haze. This is background removal for game sprites.
```

