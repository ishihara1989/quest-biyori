# 巫女 / 前進8コマ v3：固定した解剖学的L/R

生成は組み込み `image_gen`、transparent_background: true。待機原画 `../../source/miko-idle-generated-v1.png` と共通 `output/walk-review/pose-guide.png` を強い同一性/姿勢参照として使用。
Lは常に手前、Rは常に奥、両草履は右向き。1=L前、5=R前、3=RがL奥で低く通過、7=LがR手前で低く通過、8=L前→1を採用。今回の全8相の装備・足位置・遮蔽・残差は `QA.md` 参照。

原画 `source/miko-forward-generated-v3.png`（2048×1024、真の透明RGBA、4×2）は生成した各姿勢を切り出して透明セルに合成したもの。初稿attempt-01、全体修正版attempt-02、個別生成cell-04を保持。最終版はattempt-02の1/2/3/5/6/7/8と、個別生成4を使用。
切出・位置合わせ・個別生成セルの共通高への最近傍縮小・透明余白追加だけを `source/assemble-v3.cjs` で実施。コードによるポーズ描画、画素複製によるコマ増し、モーフ、反転は使っていない。
使用PNG `miko-forward.png`（2048×224）、単独8枚（256×224）、GIF8枚（512×448、各80ms、無限ループ）。腰xの原画anchor=256、出力pivot=(128,207)、共通倍率=0.3202933985330073。旧v1/v2原画は保持。

## v3 使用した生成/修正プロンプト全文

### 初稿：固定したL/Rの8相

```text
Use case: stylized-concept. Create a production transparent pixel-art 8-frame FORWARD walking sprite sheet, exactly 4 columns x 2 rows, eight separate full-body poses read 1–4 top and 5–8 bottom.
Image 1 is the approved miko/shrine maiden identity and pixel style. Keep her exact face/chibi proportions, black long hair, large red-white ribbon, white kimono sleeves with red trim, gold tassels, red long hakama skirt, white tabi socks, red sandal straps and brown sandal soles, gohei wand with white folded paper and gold ornament. Same hand holds gohei diagonally up-right throughout. Image 2 is only a walking leg pose reference, follow 8-phase positions and occlusion but DO NOT render the diagram colors/text/lines. Character always faces RIGHT with both sandal toe tips pointing RIGHT; do not rotate or flip the back shoe. Camera and body proportions fixed. No new costume accents.
Her skirt is long but both ankles and sandals must be visible moving naturally beneath its hem. Subtle hem sway, low ankle motion, no large high knee kick or skirt shortening. LEFT leg is the permanently camera-NEAR leg; its sock/sandal is slightly larger, bright and draws in FRONT of the dark slightly narrower camera-FAR RIGHT sock/sandal at crossing. Never exchange the two legs' camera depth while their screen x positions exchange.
Use exactly these continuous phases relative to each pelvis:
1 LEFT near brighter sandal +60 pixels ahead/right planted, RIGHT far darker sandal -60 rear/left toe down.
2 LEFT +25 moving back toward pelvis supporting, RIGHT -25 raised only slightly moving toward pelvis.
3 LEFT planted directly beneath pelvis, RIGHT low lifted passing BEHIND it: ankle centers nearly same x, LEFT sock/sandal partially HIDES RIGHT sock/sandal.
4 LEFT -35 rear heel rising, RIGHT +35 ahead/right extending low.
5 LEFT -60 REAR/LEFT and STILL CAMERA-NEAR with the full brighter near sock/sandal visible on left; RIGHT +60 FRONT/RIGHT planted but STILL CAMERA-FAR with narrower darker sandal. Frame 5 MUST be opposite leg contact to 1, not duplicate 1.
6 LEFT -25 low lifted coming forward toward center, RIGHT +25 planted moving back to center.
7 LEFT low lifted passing IN FRONT of RIGHT directly beneath pelvis, ankle centers nearly same x and LEFT brighter sock/sandal HIDES some of RIGHT grounded support sandal.
8 LEFT +50 front/right ready to plant, RIGHT -50 behind/left heel rising. These are same feet and same depth as 1 for smooth 8→1.
Evenly spaced actual walking poses, correct 1-left-contact /5-right-contact /3-and7 low crossing, tiny body bob and coherent hair/ribbon/paper follow-through. Draw all eight newly, no duplicates/mirroring. Stable body/waist x and scale in each identical cell. Generous transparent gutters and external margins so all hair, ribbon, sleeves, gohei paper and feet fit intact. True alpha, no shadows/floor, no grid/panels/labels/background. Crisp consistent pixel-art exactly like identity reference.
Further consistency requirement: the anatomical LEFT (camera-near) sock and sandal retain identical near-side volume and brighter illumination in all 8 cells; anatomical RIGHT remains narrower and darker. They NEVER swap brightness, camera depth or anatomy. The heel is on each shoe's LEFT and the rounded toe is on its RIGHT in every pose. Frame 5 should have the prominent near white sock at screen LEFT, unlike frame 1 where it is at screen RIGHT. At frame 3, a small piece of the FAR shoe peeks from BEHIND the standing NEAR white sock; at frame 7, NEAR lifted white sock clearly lies IN FRONT of the FAR standing sock, ankle centers within one sandal width and only a small vertical lift. Make the skirt follow the two legs enough to read these steps, while retaining the long hakama.
```

### 4/5/6の足IDと余白修正

```text
Use case: precise-object-edit. Input 1 is the EDIT TARGET, the existing 4 columns x 2 rows miko 8-frame forward walk sheet. Input 2 is approved original character identity/style. Input 3 is the authoritative leg-phase reference only. Output one transparent 4x2 sheet with the SAME eight character frames. Keep character face, hair, large red-white bow, white kimono, long red hakama, gold sleeve tassels, gohei and holding hand, proportions, art style, all upper bodies and right-facing camera exactly as target.
Correct only the foot identities in frames 4,5,6 (top-right and bottom-left two), plus safely reframe all 8 whole figures to generous transparent margins. Do not introduce new costume.
The target wrongly treats the sandal at screen LEFT as the FAR dark small shoe in every wide stance. FIX THAT FOR FRAMES 4,5,6. Anatomical LEFT remains camera-NEAR and is bright white tabi with larger broad red-strapped brown-soled zori. Anatomical RIGHT remains camera-FAR and is shadowed grey-white tabi with narrower dark red-strapped brown-soled zori.
Frame 1 top-left: KEEP large bright near LEFT foot at screen RIGHT, small darker far RIGHT foot at screen LEFT. Both point RIGHT. This is left contact.
Frame 2 top-second: KEEP near LEFT at right/center support; far RIGHT lifting inward from left.
Frame 3 top-third: KEEP bright near LEFT support under pelvis, dark far RIGHT low passing BEHIND near LEFT. Natural ankle overlap.
Frame 4 TOP-RIGHT: CHANGE foot depth! The leg at screen LEFT/back now is anatomical LEFT NEAR; draw its full broad bright white sock and broad brown sole in the foreground, heel raised, toe pointed right, behind pelvis in horizontal position ONLY. At screen RIGHT/front is anatomical RIGHT FAR; draw a distinctly narrower shadowed sock and sandal, extending right low above ground. Same near/far ID as 1 despite changing x.
Frame 5 BOTTOM-LEFT: strongest opposite contact: LARGE BRIGHT foreground anatomical LEFT white sock/sandal is REAR at screen LEFT (heel lifting, toe right). SMALLER DARK shadowed background anatomical RIGHT sock/sandal is FRONT at screen RIGHT, planted and toe right. This MUST look opposite to frame 1. Do not put the bright large foot at screen right in frame 5. The prominent foreground shoe belongs on the LEFT of this cell.
Frame 6 BOTTOM-SECOND: bright larger NEAR LEFT foot slightly left of pelvis swings low toward center, dark narrower FAR RIGHT shoe slightly right of pelvis supports body. Do not swap the brightness/depth.
Frame 7 bottom-third: KEEP near LEFT low lifted white sock/sandal IN FRONT of standing far RIGHT foot under pelvis. Part of far right sock/sole visible behind, not two giant overlapping near shoes.
Frame 8 bottom-right: KEEP bright near LEFT shoe right/front ready for frame 1, far right dark shoe left/back, toes right, small low gap above ground.
Long red divided hakama remains long and reveals ankle footwork. No high knee, no twisted X knees. BOTH foot toes always right; the rear foot cannot flip. Same soles and red straps. Keep low continuous gait, no running.
Every full sprite with ALL hair/large bow/wand/paper tips/shoes is fully contained in its own equal cell with at least 12% transparent left/right/top/bottom margin. Scale each whole figure equally smaller if necessary, never trim paper. The top-right and bottom-right gohei paper tips currently nearly touch sheet edge: fix framing. Actual transparent alpha, no floor/shadow/background/grid/labels/text. Keep exactly 8 separate full-body sprites, 4x2.
```

### 4コマ目の送り姿勢：個別生成

```text
Use case: precise-object-edit. Image 1 is the edit target: ONE miko pixel-art frame. Image 2 is only the exact leg POSE reference (do not copy colors, labels or diagram). Output ONE full-body transparent sprite, NOT a sheet.
Keep the exact target face/head/black long hair/red-white bow/white kimono/gold sleeve tassels/red waist bow/gohei in the same hand, same proportions, colors, camera, pixel size, and all upper-body pixels visually unchanged. Change only feet/lower hakama folds to pose 4 of a right-facing slow forward walk.
The target currently has feet TOO WIDE. Bring BOTH sandals much CLOSER to the body's center, like image 2. The total ankle separation should be only about HALF the target's current wide separation. This is the phase JUST AFTER the crossing, BEFORE opposite contact.
Anatomical LEFT = camera-near foreground white sock/broad bright sandal. It stands only a short distance LEFT behind the pelvis, toe touching ground at right side of its shoe and heel rising. Anatomical RIGHT = camera-far darker sock/narrower sandal. It reaches only a short distance RIGHT ahead of pelvis, low in the air with knee slightly flexed. Feet are neither wide contact nor at exact same x: a restrained intermediate stride.
Both shoe toe tips point RIGHT, never left or viewer. Left near foot remains nearer the camera even while it is behind horizontally. Right far foot remains darker and behind in depth even when ahead horizontally. No swapped depth/brightness. No high knee kick, no twisted knees, no huge skirt flare or shortening.
Keep long divided red hakama with a very small responsive hem/fold change that exposes both ankles. Complete silhouette including paper streamers inside generous true transparent padding; no clipping any hair or wand. Entire character same shape and proportions as input target, sharp clean JRPG pixel art, no smooth painted art. Actual transparent alpha, no background, floor, shadow, labels or text.
```

---

# 巫女 / 前進8コマ v2

生成方法: 組み込み `image_gen`、実際の透明背景。各8姿勢を一枚のソースに新規生成し、4コマ原画からの複製・補間・反転・コードによる描画は使用していない。

## v2 の参照と仕様

- `../../source/miko-idle-generated-v1.png`: 承認済みの同一人物、ドット絵、衣装、御幣のデザイン。
- `../../../../../public/assets/miko/miko-idle.png`: 完成待機の頭身と表示粒度。
- 原画: `source/miko-forward-generated-v2.png`（1774×887、RGBA、4列×2行）。
- 出力: `miko-forward.png`（2048×224、8列×1行）。単独フレーム `forward-01.png`〜`forward-08.png`、各256×224。
- 確認GIF: `miko-forward-preview.gif`（512×448、8コマ、各80ms、640msで無限ループ）。
- `layout.json` で原画、4×2分割、腰基準の各コマx anchorを指定。全コマの接地y=207、共通pivot=(128,207)、共通倍率=0.3512064343163539。最近傍サンプリング、位置合わせのみを実施。
- 旧4コマ原画v1はsource内で保持。

## v2 目視QA

3・7コマで両足首が腰の真下に近づき、片方の草履が持ち上がって支持脚と重なる通過姿勢を確認。接地→荷重→通過→送りの順序を左右交互に構成。
黒い長髪、紅白リボン、白衣・緋袴・金の飾り、御幣の持ち側と斜め右上の向き、白い足袋・赤い鼻緒・茶色い草履底を全コマで確認。草履が左向きに反転するコマはない。御幣・髪・紙垂・袖・足を含むシルエットはセル内に収まり、出力に欠けはない。
衣装の袴の折り目と紙垂・髪先に生成由来の小さな輪郭差は残る。足首と草履は長い袴の下でも見える。腰を基準に横位置を合わせ、足幅の変化で胴が横に跳ねるのを防いでいる。
共通buildのalpha、原画/出力余白、8つの異なるコマ、接地基準を通過。GIFの8枚・各80ms・無限ループを確認。全モーションの `check-motion-assets.cjs miko` でPNGの梱包/透明性/余白/pivot、参照原画、GIF枚数/時間/ループを検証。

## v2 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production transparent PNG pixel-art sprite sheet for the existing side-scrolling idle RPG. Exactly EIGHT consecutive forward walk animation poses, in a precise 4 columns by 2 rows grid. Read left-to-right across top row (frames 1-4), then left-to-right across bottom row (frames 5-8). This is ONE seamless 8-frame walk cycle, not character variants.
Input image 1 is the approved miko idle SOURCE: use its exact character identity, costume, proportions, palette and pixel-art medium. Input image 2 is the packaged idle reference for readable final sprite silhouette.
Same young shrine maiden in every cell: black long hair, large red bow with white zigzag edge, brown eyes, white very wide kimono sleeves with red cuff stitching, gold sleeve knots/tassels, red waist bow and long divided pleated red hakama, white tabi socks and brown-soled red-strapped zori. Her visible near/front hand steadily holds the same slim brown gohei angled up-right with gold knot, white zigzag paper streamers and one small red tassel; the other arm loosely follows walking. Fixed hand, fixed equipment, no mirrored frame, no new equipment.
RIGHT-facing side view in every cell: face and nose point right. A subtle three-quarter torso is permitted, matching idle. Both zori toes MUST always point RIGHT, including the trailing and raised sandals; soles are horizontal/slightly tilted, never toes facing left or camera. Keep both sandals as the same matched pair with identical brown soles, red straps and white socks.
Gait travels RIGHT, drawn IN PLACE with the waist centered at the same cell-local x. These are coherent equal-time samples of one full cycle. Contact / down / passing / up / opposite contact / down / passing / up. Use modest steps, never run or jump.
Frame 1: near leg reaches right, near sandal heel touches shared ground line; far leg trails left, heel lifting. Feet widely separated.
Frame 2: weight loads the near leg, slight 1-pixel downward body bob; trailing far leg lifts from ground and moves inward. Feet medium separation.
Frame 3: TRUE CROSSING/PASSING POSE: near support leg stands directly beneath hip; FAR BENT LEG passes FORWARD underneath torso. Ankle x coordinates nearly coincide, one sandal visibly raised right beside and overlapping the support ankle. Show two legs crossing beneath the hakama. NO foot left at the far trailing position, no spread-foot stance.
Frame 4: far knee and sandal move ahead to the right and descend, near support leg begins pushing off and moves behind left. Head 1-pixel high, feet increasing separation.
Frame 5: far leg reaches right and lands, near leg trails left with heel lifting. Wide feet, clearly opposite leg layering to frame 1.
Frame 6: far-leg weight load, body down 1 pixel, near trailing sandal leaves ground and travels inward.
Frame 7: TRUE OPPOSITE CROSSING/PASSING: far support leg under hip, NEAR bent leg travels forward directly beneath torso. Ankle x positions nearly coincide; near sandal raised close beside support ankle. Clear near/far overlap reversal versus frame 3. NO spread-foot stance.
Frame 8: near knee and sandal travel right, descending toward frame 1 contact, far support foot moves behind. Natural 8-to-1 closure.
The long divided hakama follows alternating knee movement with restrained hem/fold changes that reveal both white socks and sandals without shortening or redesigning it. Footwork is the priority. Head size, facial features, gohei grip, paper count/shape, bow structure, sleeve ornaments and sandal orientation remain CONSISTENT across all EIGHT poses. Torso bob only 1-2 logical pixels, hair tips, sleeves and paper lag smoothly a little.
Composition: identical camera and common scale in every cell, fixed waist local x, planted foot soles use one shared ground y. Whole silhouette including every paper tip, bow, sleeve, long hair and sandal occupies only central 65% of cell width and 75% of height, with fully transparent padding on every side. Nothing crosses cell boundaries or touches outer image edges. Each cell same dimensions.
Style: match the detailed clean deliberate JRPG pixel clusters, crisp dark outlines and nearest-neighbor finish of references, about 96-128 logical pixels tall. No blurry illustration or smooth gradients.
Background: genuine transparent alpha outside all eight sprites. No checkerboard texture, no ground, no cast shadow, no motion smear, no ghost/duplicated legs, no motion effects, no labels, no digits, no lines, no separators, no watermark. Exactly 8 unique anatomically coherent poses.
```

---

# 巫女 / 前進4コマ v1

生成方法: 組み込み `image_gen`、透明背景。

参照の役割:

- `../../source/miko-idle-generated-v1.png`: 承認済みのドット絵・同一人物・衣装と御幣。
- `../../../references/miko-original.png`: 原デザイン参照（画風は使用しない）。
- `../../../../../public/assets/miko/idle-01.png`: 完成待機の頭身・シルエット・ピクセル粒度。

## 最終仕様と検証

生成原画: `source/miko-forward-generated-v1.png`（1278×1230、2列×2行）。
使用素材: `miko-forward.png`（1024×224、4コマ、1コマ256×224）。
確認用GIF: `miko-forward-preview.gif`（512×448、150/150/150/150ms、無限ループ）。
共通ピボット: x=128, y=207。生成RGBAを保ち、最近傍サンプリングと位置合わせのみ実施。倍率は待機の人物高とモーション仕様から `manifest.scale` に共通処理で決定される。
検証: 元コマ・出力のシルエット余白、透明性、各コマの画素差、基準線の一致を共通assertで確認。GIFの4コマ・遅延・alphaを確認。PNGシートを目視確認済み。
生成由来の顔、髪、袖、紙垂の細かな輪郭差は残る。


## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art animation sprite sheet for a polished side-scrolling browser Idle RPG.
Input image 1 is the APPROVED PIXEL CHARACTER and art style reference (the existing idle sheet); image 2 is the original CHARACTER DESIGN reference only; image 3 is the approved packaged idle frame for silhouette, body proportions and pixel granularity. Adapt the SAME young female shrine maiden: long black hair with charcoal sheen; very large red hair bow with white zigzag trim and red/white ribbon tails; brown eyes; white kimono with very wide hanging sleeves, red edging and red stitches; gold sleeve knots and small tassels; wide red waist sash tied into a front bow; long red pleated hakama; white tabi socks and brown-soled zori with red straps. Hold the SAME slim brown wooden gohei wand with a small gold knot at top, alternating white zigzag shide paper streamers and a tiny red tassel. Keep her youth, gentle expressive face, slightly oversized head and the same hand-crafted arcade/JRPG pixel style.
Composition: decisively RIGHT-FACING side view with only a shallow three-quarter torso angle, as in the idle. Never mirror her or turn to face left. Same character scale and camera in every cell. Preserve exact colors and recognizable costume and equipment. All hair, ribbon tails, sleeves, feet, wand and ALL white paper tips must fit within each cell with at least 15 percent TRANSPARENT margin on every side. Keep the entire silhouette confined to the central 70 percent of each equal cell width/height. No pixel can touch the central dividing axes or outer image edges. The head stays the same size across poses.
Style: detailed but readable intentional square pixel clusters, crisp dark colored outlines, nearest-neighbor pixel finish, controlled crimson/white/charcoal palette, readable folds and selective highlights. Preserve source pixel granularity, about 96-128 logical pixels of standing character height. No smooth vector linework, no blur, no antialiased illustration edges, no painted gradient or 3D.
Background: genuine transparent alpha outside the characters. No flat background, no baked checkerboard, no ground, no cast shadow, no text, no numbers, no UI, no tile borders, no labels, no watermark. No enemies, no attack, no additional equipment, no magic, no effect particles.
Motion ID: forward. Create EXACTLY FOUR frames in a precise 2 columns by 2 rows equal-cell grid; chronological reading order top-left, top-right, bottom-left, bottom-right. A coherent LOOPING WALK FORWARD toward the RIGHT, while facing right throughout. These are consecutive in-place walk-cycle poses, not four variants and not idle breathing.
Frame 1: forward/right foot reaches toward the right and contacts the floor; the rear/left foot extends behind to the left with heel starting to lift. Her center is upright with a small forward/right intent.
Frame 2: weight passes over the front foot; rear foot lifts and passes forward under the hakama with one sandal visibly off the contact line, knees softly bent.
Frame 3: the opposite foot reaches toward the right and contacts the floor; the first foot now trails behind left, clear alternating stride.
Frame 4: opposite weight passing pose; the first foot lifts to pass forward, flowing seamlessly into frame 1. All planted foot soles use the same cell-local ground y. Keep overall center at the same local x so game code can translate the sprite right.
Keep stride restrained but clearly visibly different from idle. Show white tabi, red sandal straps and alternating left/right sandal positions below the red hakama hem; move the hem just enough to reveal footwork naturally, never shorten or replace the costume. Torso, face, grip, wand and paper remain stable, with a mild walking bob and small hair/sleeve follow-through. The gohei stays angled up toward right, never swung as an attack. Four different generated poses, no duplicates.
```

初稿所見: 顔・衣装・御幣と右向きは一致したが、足の位相が似ていた。初稿は `source/miko-forward-generated-attempt-01.png` として保存し、組み込み画像生成で下半身だけを修正した版を採用。最終版は足を開く接地と足を寄せる通過姿勢が交互に出る。

## 歩行位相修正のプロンプト全文

```text
Use case: precise-object-edit.
Asset type: transparent 4-frame 2x2 pixel-art forward WALK CYCLE sprite sheet.
Input image 1 is the EDIT TARGET, the four-frame shrine maiden forward walk. Image 2 is the approved idle design/style reference. Keep the identical young female miko character, face, black long hair, large red/white hair bow, white long wide sleeves, red waist bow, red pleated hakama, white tabi/red-strapped zori and slim brown gohei with white zigzag paper and red tassel. Keep right-facing nose, head, torso, same overall pixel-art style, palette, same scale and camera, wand held steadily up-right.

Change ONLY the LOWER BODY WALK PHASES and the red hakama folds that respond to the legs. The current target wrongly shows almost the same spread-foot step in all four cells. Replace with four consecutive animation phases that alternate WIDE and NARROW foot spacing:
TOP-LEFT FRAME 1 — CONTACT: near/right foot REACHES FORWARD TO THE RIGHT and lands flat; far/left foot trails back toward LEFT with heel lifting. The feet are WIDELY SEPARATED. Preserve this first pose as the contact keyframe.
TOP-RIGHT FRAME 2 — PASSING: feet are CLOSE TOGETHER DIRECTLY BELOW THE HIPS. The right foot is planted under the body's center, far/left leg is BENT AT THE KNEE and swings forward, left sandal raised above ground next to the right leg. NOT the same spread-foot pose as frame 1. No sandal at the far-left trailing position.
BOTTOM-LEFT FRAME 3 — OPPOSITE CONTACT: far/left foot now REACHES FORWARD TO THE RIGHT and lands; near/right foot trails back LEFT with heel lifting. Feet again WIDELY SEPARATED, reversed leg overlap and hakama fold direction compared with frame 1. Both zori point generally right.
BOTTOM-RIGHT FRAME 4 — OPPOSITE PASSING: feet CLOSE TOGETHER DIRECTLY BELOW THE HIPS again. Far/left foot planted under the center, near/right knee bent with right sandal raised and passing forward. Not the same spread-foot pose as frame 3. This returns seamlessly to frame 1.
The four silhouettes must clearly alternate WIDE STRIDE / NARROW PASSING / WIDE OPPOSITE STRIDE / NARROW PASSING. Expose the white tabi ankles and sandal soles below the hakama hem in every frame. The long red garment is a hakama with folded divided legs, not a rigid immovable cone; naturally move the hem with walking without shortening or redesigning it. Do not generate four identical lower-body poses.

Whole sprite center stays in place; game code moves it RIGHT. All planted foot soles share the same local y contact line. Head and torso may bob by only 1-2 logical pixels. Keep arm grip and wand stable; no attack, no mirror, no facing left. Fully contain every hair strand, paper tip, sleeve and sandal in its cell with transparent padding. Background genuinely transparent alpha, NO ground, shadow, checkerboard, glow, effects, text, labels or separators. Exactly 4 cells, reading order left-top, right-top, left-bottom, right-bottom.
```

