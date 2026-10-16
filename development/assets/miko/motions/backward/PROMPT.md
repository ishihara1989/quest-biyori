# 巫女 / 後退8コマ v3：固定した解剖学的L/R

生成は組み込み `image_gen`、transparent_background: true。待機原画 `../../source/miko-idle-generated-v1.png` と共通 `output/walk-review/pose-guide.png` を強い同一性/姿勢参照として使用。
Lは常に手前、Rは常に奥、両草履は右向き。1=L前、5=R前、3=RがL奥で低く通過、7=LがR手前で低く通過、8=L前→1を採用。今回の全8相の装備・足位置・遮蔽・残差は `QA.md` 参照。

原画 `source/miko-backward-generated-v3.png`（2048×1024、真の透明RGBA、4×2）は生成した各姿勢を切り出して透明セルに合成したもの。初稿attempt-01、短歩幅修正版attempt-02、3セル別生成cells-01-02-08を保持。最終版はattempt-02の3/4/5/6/7と、別生成1/2/8を使用。
切出・位置合わせ・個別生成セルの共通高への最近傍縮小・透明余白追加だけを `source/assemble-v3.cjs` で実施。コードによるポーズ描画、画素複製によるコマ増し、モーフ、反転は使っていない。
使用PNG `miko-backward.png`（2048×224）、単独8枚（256×224）、GIF8枚（512×448、各90ms、無限ループ）。腰xの原画anchor=256、出力pivot=(128,207)、共通倍率=0.3598901098901099。旧v1/v2原画は保持。

## v3 使用した生成/修正プロンプト全文

### 初稿：警戒姿勢と同じ8相

```text
Use case: stylized-concept. Create ONE production transparent pixel-art eight-frame CAUTIOUS GUARDED RETREAT sprite sheet: exactly 4 columns x 2 rows, separate full-body sprites read 1-4 top and 5-8 bottom.
Reference 1 is approved idle miko identity/style; reference 2 is authoritative 8-phase leg pose guide only; reference 3 is newly corrected forward character for the identical figure and fixed near/far foot design. Do not draw guide colors, text or panels.
Keep same miko face, proportions, black long hair, large red-white zigzag bow/ribbon, white kimono red-trim sleeves, gold sleeve tassels, red waist bow, long red divided hakama, white tabi and red-strapped brown-soled zori, brown gohei with white folded paper and gold ornaments. SAME hand holds gohei; no costume or equipment changes.
BACKWARD mood and upper-body: always face RIGHT and watch right alertly, chin tucked, knees relaxed, torso subtly recoils to LEFT. Gohei held close diagonally up-right in front of chest. Free arm folds toward chest/abdomen under its broad sleeve to protect torso. This guarded pose is held across ALL eight frames, no attack or wide dangling free arm. No new equipment, effects or fear caricature.
Both sandals ALWAYS point RIGHT: heel on left, rounded toe on right. Anatomical LEFT leg=L ALWAYS camera-NEAR foreground brighter full white sock and broad brown/red sandal. Anatomical RIGHT leg=R ALWAYS camera-FAR background shadowed grey-white sock and slightly narrower brown/red sandal. L remains nearer regardless of screen x; do NOT swap the two legs' brightness, camera depth or anatomy. At any ankle overlap, L draws IN FRONT and partly hides R. Shadow is from the same camera-side lighting.
Use the SAME ordered eight gait phases as guide, but with much SHORTER cautious step length. Feet low, restrained, no high knee or crossed/twisted X knees. Waist same local x. Relative horizontal offsets are at source sprite scale:
1 L bright near foot +40 to RIGHT/front planted, R dark far foot -40 to LEFT/rear toe on floor.
2 L +18 supporting and moving toward body center, R -18 low raised and moving toward center.
3 L supports directly under pelvis, R LOW lifted passes BEHIND L within one sandal width; L white sock partly hides R shadowed ankle/shoe. Both ankles cluster naturally beneath body.
4 L -22 LEFT/rear with heel lifting, R +22 RIGHT/front low extending; medium narrow separation, NOT wide contact.
5 OPPOSITE CONTACT: L is -40 LEFT/rear and STILL CAMERA-NEAR, FULL BRIGHT WHITE foreground sock + broad red-strap shoe prominently visible on left; R is +40 RIGHT/front planted, STILL CAMERA-FAR, SHADOWED GREY sock + narrower shoe. Distinct opposite near/far configuration to 1.
6 L -18 low lifted coming forward inward, R +18 supporting toward center. The lifted bright near left foot is on LEFT; shadowed far support on RIGHT.
7 L LOW lifted passes IN FRONT of R directly below pelvis, white near sock hides part of shadowed far standing sock. Ankle overlap natural and low, no knee kick.
8 L +34 RIGHT/front almost ready to contact 1, R -34 LEFT/rear heel raised. Same brightness and depth as 1, smooth 8-to-1.
Long hakama hem follows legs a little, reveal both ankles/sandals without shortening garment. Tiny steady body bob and subtle paper/hair/sleeve lag, exact figure and equipment across all cells. All 8 genuinely different generated poses, no duplicate or mirror.
Composition is right-facing side view with same small 3/4 torso as idle; fixed body/waist x, common scale and planted sole baseline. Every full silhouette including hair, huge bow, paper/wand and feet MUST fit well inside its own equal cell with a large actual transparent gutter and outside padding. Reduce whole figure size equally to central 70% of cell width/height to ensure NO paper tip touches a neighbor cell or edge. Do not cut or shorten equipment.
Detailed clean deliberate JRPG pixel clusters, crisp dark outlines, exact reference palette and pixel finish. Genuine transparent alpha, no black/checkerboard texture, no floor, no cast shadow, no smears/ghosts, no effects, no text/labels/numbers/borders/separators/watermark. Exactly 4x2 = 8 unique full-body frames.
```

### 歩幅短縮の下半身修正

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET: the eight-frame guarded miko retreat, 4 columns x 2 rows. Image 2 is the anatomical eight-phase guide only. Preserve ALL eight matching right-facing upper bodies exactly: same face, head size, black hair/red-white bow, sleeves/gold tassels, chest-protecting free hand, gohei grip and shape, palette and JRPG pixel art. Keep the 4x2 transparent layout.
One targeted change: the current wide sandal separation is TOO LARGE for cautious retreat. HALVE the horizontal sandal separation in every wide and intermediate frame. This is a tiny, careful backward SHUFFLE, not normal forward walking. Feet stay directly beneath the hem, no long stride. Keep the long hakama and both visible ankles.
Both sandals always point RIGHT (heel left, toe right), no side swap or camera rotation. Anatomical L=bright full-white foreground near sock + broad red-strapped zori; R=grey-white shadowed narrower far sock + red-strapped zori. L stays in front of R at overlaps even when L is horizontally behind on screen left.
Use guide ordered phases but now SHORT step length:
1 L near front-right contact and R far rear-left toe: ankle centers only approximately ONE sandal length apart TOTAL, rather than the current about 2.5 sandal lengths.
2 L moves toward center support; R low lifts inward from left; ankle separation about HALF a sandal length.
3 L supports centered, R low passes BEHIND L; naturally overlapped ankle x within one sandal width; near L partly occludes far R.
4 L now behind-left heel up, R ahead-right low reach: separation only HALF TO TWO-THIRDS of a sandal length, significantly narrower than 1/5. Do NOT make frame 4 a contact-like spread stance.
5 L near brighter foot BEHIND-left, R far darker foot AHEAD-right contact: opposite feet compared to 1, but very short separation of ONE sandal length TOTAL. Near bright white sock on LEFT, far shadowed sock on RIGHT, do not swap these.
6 L low lifts from left inward, R supports toward center; only HALF a sandal length separation.
7 L low passes IN FRONT of R standing centered; near white sock hides some far grey ankle, only small foot lift.
8 L reaches a little right/front ready to plant in 1, R slightly left/rear heel up; SAME near/far identities as 1, short step only 0.9 sandal length separation.
The feet's horizontal paths are continuous arcs through these eight poses; no high knee kicks or twisted X knees. All leg identities and red sandal straps stay same. Both white socks and brown soles readable below the long red hakama. The upper-body guarding pose must remain exactly as target.
Do not shrink whole character to make shorter strides: ONLY reduce lower-body foot positions/related hem folds. Full sprite intact with generous genuine alpha padding, never clip gohei paper tips or hair. No ground, shadow, checkerboard background, effects, grid, text, labels or numbers. 8 separate full-body generated poses in 4x2.
```

### 1/2/8の足ID：3セル別生成

```text
Use case: stylized-concept. Image 1 is a character/style/guard-pose reference: same miko in short-step retreat. Image 2 is leg phases reference only.
Create exactly THREE separately drawn full-body transparent pixel-art frames in ONE HORIZONTAL 3-COLUMN STRIP (one row), for her walk cycle phases 1, 2 and 8 in that order. No text. These are not the entire eight-frame cycle.
Preserve exact miko head/face/proportions/black hair/red-white bow/white-red kimono/gold tassels/long red hakama/red waist bow/white tabi-red straps-brown soles, the SAME chest-protecting bent free arm and gohei held diagonally up-right by the SAME hand as reference 1. Face right and eyes wary right in all three, no new costume or weapon. Long skirt exposes both white socks. Consistent body/waist x, common scale, right-facing fixed camera.
Critical anatomical foot ID in ALL THREE cells: the larger BRIGHT PURE WHITE sock and broad foreground red-strapped shoe belong to the camera-NEAR anatomical LEFT L leg, and must be at SCREEN RIGHT, ahead of the pelvis. The narrower SHADOWED GREY-WHITE sock and background shoe belong to camera-FAR anatomical RIGHT R leg, and must be at SCREEN LEFT, behind pelvis. Do not put the large bright foreground sock on screen left in these 3 frames. Both shoe toes face RIGHT (heel left, toe right).
CELL 1 = phase 1 left contact: L NEAR BRIGHT shoe only a little ahead RIGHT of pelvis and FLAT planted; R FAR DARK shoe only a little behind LEFT, heel up with toe down. Very short cautious stride: total ankle separation only ONE sandal length. Foreground L at right is full bright white and visibly occludes background if overlapping.
CELL 2 = phase 2 load: L NEAR BRIGHT foot moves halfway from right toward pelvis, supporting and planted; R FAR DARK foot moves halfway from left toward pelvis, lifted only a tiny amount. Feet closer than cell 1, not yet crossing. L larger bright foot on right, R shadowed small foot on left.
CELL 3 = phase 8 ready for 1: L NEAR BRIGHT foot just right/front of pelvis and descending just above floor to cell 1 contact, R FAR DARK foot a little left/rear, heel up. Very short stride nearly same foot x as cell 1; smooth transition. L on right, R on left, no identity swap.
Low foot motion, no knee kicks or twisted legs. Short hem folds react minimally. Head and hands stable. Do not enlarge strides; do not repeat the same exact pose. 3 distinct newly drawn poses. Generous true transparent gutters and exterior margins, keep all hair/ribbon/gohei paper tips and shoes fully intact inside cells. Clean deliberate sharp JRPG pixels exactly like reference. No floor/shadow/background/checkerboard/grid/borders/labels/text/numbers. Exactly 3 columns, 1 row.
```

---

# 巫女 / 後退8コマ v2

生成方法: 組み込み `image_gen`、実際の透明背景。各8姿勢を一枚のソースに新規生成し、4コマ原画からの複製・補間・反転・コードによる描画は使用していない。

## v2 の参照と仕様

- `../../source/miko-idle-generated-v1.png`: 承認済みの同一人物、ドット絵、衣装、御幣のデザイン。
- `../forward/source/miko-forward-generated-v2.png`: 同一人物の8枚前進と右向きの草履・画風の一貫性。
- 原画: `source/miko-backward-generated-v2.png`（1774×887、RGBA、4列×2行）。
- 出力: `miko-backward.png`（2048×224、8列×1行）。単独フレーム `backward-01.png`〜`backward-08.png`、各256×224。
- 確認GIF: `miko-backward-preview.gif`（512×448、8コマ、各90ms、720msで無限ループ）。
- `layout.json` で原画、4×2分割、腰基準の各コマx anchorを指定。全コマの接地y=207、共通pivot=(128,207)、共通倍率=0.3350383631713555。最近傍サンプリング、位置合わせのみを実施。
- 旧4コマ原画v1はsource内で保持。

## v2 目視QA

顔と両草履のつま先を右に保ちながら左へ下がる。全8コマで御幣を胸に寄せ、空いた腕を曲げて上半身を守る姿勢を確認。3・7コマでは腰下の足首の重なりと、持ち上がった草履を確認。
黒い長髪、紅白リボン、白衣・緋袴・金の飾り、御幣の持ち側と斜め右上の向き、白い足袋・赤い鼻緒・茶色い草履底を全コマで確認。草履が左向きに反転するコマはない。御幣・髪・紙垂・袖・足を含むシルエットはセル内に収まり、出力に欠けはない。
衣装の袴の折り目と紙垂・髪先に生成由来の小さな輪郭差は残る。足首と草履は長い袴の下でも見える。腰を基準に横位置を合わせ、足幅の変化で胴が横に跳ねるのを防いでいる。
共通buildのalpha、原画/出力余白、8つの異なるコマ、接地基準を通過。GIFの8枚・各90ms・無限ループを確認。全モーションの `check-motion-assets.cjs miko` でPNGの梱包/透明性/余白/pivot、参照原画、GIF枚数/時間/ループを検証。

## v2 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production transparent PNG pixel-art sprite sheet for the existing side-scrolling idle RPG. Exactly EIGHT consecutive BACKWARD walk animation poses, in a precise 4 columns by 2 rows grid. Read top row left-to-right frames 1-4, then bottom row left-to-right frames 5-8. This is ONE seamless 8-frame cautious retreat cycle.
Input image 1 is the approved idle SOURCE: exact character identity, design, proportions, palette and pixel medium. Input image 2 is the new 8-frame forward sheet: same character/style/scale and consistent right-facing zori, but change arm pose and gait to wary guarded retreat.
Same young shrine maiden in every cell: long black hair, large red/white zigzag-edged bow and ribbon tails, brown eyes, white kimono with very wide sleeves and red cuff stitching, gold sleeve knots/tassels, wide red waist bow, long divided pleated red hakama, white tabi and brown-soled red-strapped zori. Same slim brown gohei with gold knot, white zigzag paper streamers and one red tassel.
GUARDED RETREAT: keep face and nose looking RIGHT toward a potential threat. Eyes alert, chin slightly tucked, knees softly bent. Near/front hand holds gohei closer to chest, wand tilted steeply up-right as a light defensive barrier. Free arm bends in toward chest and abdomen beneath its broad white sleeve, visibly protecting the torso, rather than dangling. Same gohei, same carrying hand, same defensive hand arrangement across all eight frames. No attack, no extra item, no frightened caricature.
Body moves LEFT/backward, while head, chest and BOTH sandal toes always face RIGHT. Never mirror. Both sandals retain matching red straps, brown soles, white socks; toes never face left or camera. A restrained backward lean and tucked shoulders express caution. Gait in place; waist stays at same cell-local x. Contact / down / passing / up / opposite contact / down / passing / up, coherent equal-time samples, not running or jumping.
Frame 1: near leg reaches backward toward LEFT and touches down on toe/ball of right-pointing zori; far leg stays ahead toward RIGHT, preparing to release. Feet wide apart. Right-facing defensive guard held steady.
Frame 2: weight transfers onto near leg, body sinks 1 logical pixel; far leg lifts from forward/right position and folds inward, foot separation medium.
Frame 3: TRUE CROSSING/PASSING: near support leg directly under hip; far bent leg passes backward/LEFT directly under torso. Ankle x coordinates almost coincide, far sandal visibly raised next to and overlapping near support ankle. Two feet clustered beneath waist, NO foot remaining at far-right extension, NO wide stance.
Frame 4: far foot leaves passing position, reaches backward LEFT and starts descending toward next contact; near support leg remains forward RIGHT. Feet increasingly separated, body subtly 1 pixel higher.
Frame 5: far leg reaches backward LEFT and makes toe/ball contact, near leg now forward RIGHT, opposite layering to frame 1. Right-facing face and toes, consistent guard.
Frame 6: weight transfers onto far leg and body lowers 1 pixel, near forward/right foot lifts and folds inward.
Frame 7: TRUE OPPOSITE CROSSING/PASSING: far support leg under hip, near bent leg passes backward LEFT directly under torso. Ankle x positions nearly coincide, near sandal raised close beside support ankle; visibly opposite overlap from frame 3. No spread-foot stance.
Frame 8: near foot travels LEFT/backward and descends toward frame 1 contact, far support foot forward RIGHT. Seamless 8-to-1 closure.
Long divided hakama moves and folds just enough to show white ankles and both sandals clearly. Preserve long garment, not a shortened skirt. Low-amplitude head bob; guarded gohei and hands remain stable, sleeves/hair/paper respond subtly and continuously. EXACT character proportions and equipment geometry in all poses, no swapped grip or missing paper streamers.
Composition: identical side camera and common scale in every equal cell. Same cell-local waist x and same planted sole baseline y. Whole silhouette, including gohei/paper tips, hair, ribbons, sleeves and shoes, centered within generous actual transparent margins of at least 10% on every side. Nothing touches or crosses any cell boundary.
Style: match approved clean detailed intentional JRPG pixel clusters, crisp dark outlines, nearest-neighbor pixel finish, about 96-128 logical pixels of character height. No smooth paint, blurry edges or gradients.
Background: genuinely transparent alpha outside all 8 sprites. No checkerboard texture, no solid background, no floor, no cast shadow, no ghost limbs, no smear, no effects, no text/numbers/labels/separators/watermark. Exactly EIGHT distinct coherent gait poses.
```

---

# 巫女 / 後退4コマ v1

生成方法: 組み込み `image_gen`、透明背景。

参照の役割:

- `../../source/miko-idle-generated-v1.png`: 承認済みのドット絵・同一人物・衣装と御幣。
- `../../../references/miko-original.png`: 原デザイン参照（画風は使用しない）。
- `../../../../../public/assets/miko/idle-01.png`: 完成待機の頭身・シルエット・ピクセル粒度。

## 最終仕様と検証

生成原画: `source/miko-backward-generated-v1.png`（1278×1230、2列×2行）。
使用素材: `miko-backward.png`（1024×224、4コマ、1コマ256×224）。
確認用GIF: `miko-backward-preview.gif`（512×448、180/180/180/180ms、無限ループ）。
共通ピボット: x=128, y=207。生成RGBAを保ち、最近傍サンプリングと位置合わせのみ実施。倍率は待機の人物高とモーション仕様から `manifest.scale` に共通処理で決定される。
検証: 元コマ・出力のシルエット余白、透明性、各コマの画素差、基準線の一致を共通assertで確認。GIFの4コマ・遅延・alphaを確認。PNGシートを目視確認済み。
生成由来の顔、髪、袖、紙垂の細かな輪郭差は残る。


## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art animation sprite sheet for a polished side-scrolling browser Idle RPG.
Input image 1 is the APPROVED PIXEL CHARACTER and art style reference (the existing idle sheet); image 2 is the original CHARACTER DESIGN reference only; image 3 is the approved packaged idle frame for silhouette, body proportions and pixel granularity. Adapt the SAME young female shrine maiden: long black hair with charcoal sheen; very large red hair bow with white zigzag trim and red/white ribbon tails; brown eyes; white kimono with very wide hanging sleeves, red edging and red stitches; gold sleeve knots and small tassels; wide red waist sash tied into a front bow; long red pleated hakama; white tabi socks and brown-soled zori with red straps. Hold the SAME slim brown wooden gohei wand with a small gold knot at top, alternating white zigzag shide paper streamers and a tiny red tassel. Keep her youth, gentle expressive face, slightly oversized head and the same hand-crafted arcade/JRPG pixel style.
Composition: decisively RIGHT-FACING side view with only a shallow three-quarter torso angle, as in the idle. Never mirror her or turn to face left. Same character scale and camera in every cell. Preserve exact colors and recognizable costume and equipment. All hair, ribbon tails, sleeves, feet, wand and ALL white paper tips must fit within each cell with at least 20 percent TRANSPARENT margin on every side. Keep the entire silhouette confined to the central 60 percent of each equal cell width/height. No pixel can touch the central dividing axes or outer image edges. The head stays the same size across poses.
Style: detailed but readable intentional square pixel clusters, crisp dark colored outlines, nearest-neighbor pixel finish, controlled crimson/white/charcoal palette, readable folds and selective highlights. Preserve source pixel granularity, about 96-128 logical pixels of standing character height. No smooth vector linework, no blur, no antialiased illustration edges, no painted gradient or 3D.
Background: genuine transparent alpha outside the characters. No flat background, no baked checkerboard, no ground, no cast shadow, no text, no numbers, no UI, no tile borders, no labels, no watermark. No enemies, no attack, no additional equipment, no magic, no effect particles.
Motion ID: backward. Create EXACTLY FOUR frames in a precise 2 columns by 2 rows equal-cell grid; chronological order top-left, top-right, bottom-left, bottom-right.
This is a coherent LOOPING BACKWARD WALK moving LEFT while keeping her FACE AND NOSE pointed RIGHT throughout, as a character cautiously retreating from an enemy to her right. Do not mirror a forward walk or turn her around. Make four clearly different gait phases: CONTACT, PASSING, OPPOSITE CONTACT, OPPOSITE PASSING. Keep the center in the same local x for in-place game animation.
Frame 1 contact: torso leans subtly toward the LEFT/back; the rearward/left foot reaches far toward LEFT and plants heel, while the nearer right sandal is forward to the right with the toe gently raised. Feet clearly spread horizontally.
Frame 2 passing: weight has transferred toward LEFT; her feet are CLOSE TOGETHER under her body, one sandal is planted under the hip and the other knee is bent with the foot raised off the floor in the center. Not a spread-foot pose.
Frame 3 opposite contact: the other leg now reaches backward/LEFT and lands, first leg releases to the RIGHT; feet are spread again with reversed front/rear layering.
Frame 4 opposite passing: feet CLOSE TOGETHER under the body again, the opposite foot lifted and knee bent; this links back to frame 1.
Show white tabi and both red-strapped sandals, with clear foot placement changes below the hakama hem. Fold and move the red hem naturally to reveal ankle motion, preserving the long pleated hakama design; no costume change. The four silhouettes must visibly alternate wide stride / close passing / wide opposite stride / close passing. Maintain the same head size and upright guarded shoulders; arm holds gohei steadily diagonal up/right, not attacking. Hair and sleeve motion follows the leftward retreat modestly. No slides with fixed foot pose, no four identical standing poses, no running, no effects. All planted feet share one local y contact line.
```

初稿所見: 右向きを維持した接地・足を寄せる通過姿勢の交互の4コマ。白い足袋と草履が袴の下から見える。御幣・顔・髪の生成由来の細かな輪郭差は残る。

