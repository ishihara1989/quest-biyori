# 魔法使い・後退


## 8枚ループ改訂（2026-10-06）

組み込み `image_gen`、透過背景。待機単一画像と高解像度待機原画を参照し、4列×2行の8枚を新規生成。旧v1/v2と初回v3・逆脚修正v4はsourceへ保存。v5で逆脚側の膝露出と重なりを再修正。現行原画は `source/mage-backward-generated-v5.png`。

### 新規8枚生成プロンプト全文

```text
Use case: identity-preserve.
Asset type: replacement production pixel-art BACKWARD WALK sprite sheet, exactly EIGHT sequential poses, FOUR equal columns by TWO equal rows, reading order top row 1-4 bottom row 5-8. One cautious seamless eight-frame backpedal loop, eight different poses.
Input image 1 is approved mage idle identity reference. Input image 2 is high-resolution approved mage idle detail/style reference, NOT layout reference. Render this SAME blue-eyed young female mage, long blue hair, navy violet bent wizard hat with gold trim, blue diamond and dangling gold ornament, gold-edged open navy violet robe and cream dress, brown belt and gemstone pouch, navy gold-trim ankle boots with blue gems, single ornate brown/gold fork-headed blue crystal staff. Keep all equipment, proportions, face and outfit consistent.
PRIMARY MOTION: mage backpedals toward screen LEFT while looking attentively at a threat on screen RIGHT throughout. Her face, nose and BOTH BOOT TOES face screen RIGHT in every pose. Upper body subtly leans away from the threat. Knees slightly bent and shoulders drawn inward in a calm alert protective stance. Staff is held in the SAME forward hand on SCREEN RIGHT, raised more firmly in front of her chest and angled outward toward RIGHT as a guard. Free hand from screen LEFT is raised close to sternum, palm slightly outward defensively; do not obscure face. This defense pose differs recognizably from relaxed idle/forward, retained in all eight frames. No shield, no casting effects.
LOCKED DESIGN: same head angle, face/hair/hat silhouette, staff length and crystal shape, same hands carrying staff/free hand; same robe length and costume details. Two boots each have identical design and always point screen RIGHT even while she steps backwards; heel travels LEFT, toes remain RIGHT. No shoe flips, no twisted ankle, no extra limbs, no staff hand swapping. Far boot slightly darker for consistent depth, near boot brighter. Robe permits lower legs and feet to remain readable.
ANATOMICAL EIGHT-PHASE BACKPEDAL CYCLE: 1 near leg reaches LEFT/back, its toe contacts floor while far leg stays RIGHT/front; 2 weight transfers to near leg, knees compress, far heel starts lifting; 3 near supporting boot below hip, far recovery boot lifted and drawn LEFT beneath hip; 4 near support pushes toward RIGHT/front, far leg extends LEFT/back, body rises subtly; 5 far leg reaches LEFT/back, toe contacts floor, near leg stays RIGHT/front; 6 weight transfers to far support with soft knee compression and near heel lifting; 7 far supporting boot under hip, near boot raised and drawn LEFT through hip; 8 far support pushes RIGHT/front, near leg extends LEFT/back ready for pose1. Both feet never point left. Small cautious alternating steps; distinct leg positions across all eight poses; cycle 8 smoothly returns to 1.
COMPOSITION: walking in place with fixed local hip/head x; small natural vertical bob. Same uniform character scale and boots baseline in each equal cell. Full hat tip, staff crystal and tip, hair and boots visible with generous transparent padding/gutters. Avoid duplicate poses, row-specific scale changes and camera changes.
Style: exact approved clean detailed JRPG pixel art, deliberate square clusters, crisp colored dark outlines, gold and blue accents, consistent pixel scale and limited palette; no smooth illustration, blur or antialiasing.
Transparent RGBA canvas outside characters, exactly eight figures arranged 4x2. No ground, shadows, particles, text, labels, numbers, guides, tile borders or baked checkerboard. New original drawings for all eight walking phases.
```

### 逆脚修正v4プロンプト全文

```text
Use case: precise-object-edit.
Image1 is the eight-pose cautious BACKWARD-walking mage sprite sheet, four columns two rows, top row1-4 bottom row5-8. Image2 is original approved idle identity. Preserve image1's excellent guarded pose and EXACT same upper body details: face looks screen RIGHT; staff in same screen-right forward hand held before chest; free palm raised close to sternum; gold/navy hat, blue hair, robe, crystal staff dimensions, body size and 4x2 placement. No redesign.
Fix ONLY the alternating leg cycle. Currently bottom5-8 repeats top1-4's leading leg. Make the second half of the backwards walk use the OPPOSITE leg. Clearly consistently identify NEAR boot as lighter navy, FAR boot as darker navy, with near leg overlapping in front of far leg during crosses. Both boot toes ALWAYS POINT screen RIGHT, while the heels step screen LEFT/backward.
Top frame1 near LIGHT foot at LEFT/back contacts toe while far DARK foot stays RIGHT/front. Top2 near support down, far dark heel lifts on right. Top3 near support under hip, far dark recovery raised under hip travelling LEFT. Top4 near light pushes toward RIGHT/front, far dark reaches LEFT/back.
Bottom5 FAR DARK foot has now reached LEFT/back and contacts floor; NEAR LIGHT foot remains RIGHT/front, heel rises. Dark far boot should be visible on LEFT, light near boot visible on RIGHT. Do not repeat top frame1.
Bottom6 FAR DARK supporting boot sinks with weight under hip/left while NEAR LIGHT heel lifts on RIGHT and starts recovery backward.
Bottom7 FAR DARK boot supporting under hip, NEAR LIGHT boot lifted crossing close before far boot and travelling LEFT/backward. Near light boot overlaps in front of far dark boot.
Bottom8 FAR DARK boot pushes toward RIGHT/front, NEAR LIGHT leg extends LEFT/back and its boot hovers ready for top1 near toe contact. Frame8→1 seamless.
Every boot remains SAME shape, length, gold band and blue gem, with anatomical ankle connection. Toes stay screen RIGHT in all frames. No foot mirroring, no generic repeats, no swapped bright/dark identities.
Preserve eight different drawings on exact same transparent RGBA 4x2 sprite sheet, crisp detailed pixel art, fixed local hip x and floor y, only natural small vertical bob. No text, labels, effects, ground or checkerboard.
```

### 逆脚修正v5プロンプト全文

```text
Use case: precise-object-edit.
This sheet is an eight-pose right-facing female mage cautious backpedal animation. KEEP the exact same character, equipment, upper bodies, guarded chest-level open palm and staff, face/hair/hat/costume/pixel art and transparent 4x2 layout.
The TOP row and BOTTOM row must show TWO OPPOSITE LEGS moving, but currently look like the same foot is leading. Make this obvious by exposed near-leg knee and boot OVERLAP, not just small color changes.
EDIT LEGS AND LOWER HEM ONLY. There are exactly two boots. Near leg is in front of the robe and of the other leg; far leg partly disappears behind the cream underskirt.
TOP-LEFT frame1: near leg must extend back to LEFT. Expose a small area of the near thigh/knee at LEFT opening of robe, above LEFT boot. LEFT boot is the BRIGHT near boot with a clearly visible BLUE gem and gold cross straps. RIGHT boot is DARK far boot partly hidden behind cream skirt; do NOT expose the right near thigh here.
TOP2: bright near LEFT boot supports; dark far RIGHT boot lifts its heel and is pulled backwards. Slight bent knees.
TOP3: bright near boot supports below hip at LEFT side. Dark far boot lifts and crosses BEHIND it, partially occluded, going LEFT. Near knee remains the one at LEFT.
TOP4: dark far boot extends back LEFT to prepare to touch down, bright near boot pushes at RIGHT front. Dark far boot partially hidden behind bright near calf. All toes point RIGHT.
BOTTOM-LEFT frame5 is the exact opposite contact: bright NEAR leg now at RIGHT/front with exposed near thigh/knee at RIGHT opening of robe. Dark FAR leg reaches back LEFT and lands its toe; no left near thigh exposed. RIGHT boot is clearly BRIGHT near boot, LEFT boot DARK far boot. Frame5 must clearly differ from frame1. Keep upper bodies.
BOTTOM2 frame6 dark far LEFT foot supports, bright near RIGHT heel lifts ready to recover back. BOTTOM3 frame7 far dark boot supports below hip, near bright boot crosses visibly in FRONT travelling LEFT. BOTTOM4 frame8 near bright boot extends LEFT/back ready to contact in top1; far dark foot pushes at RIGHT/front. This forms a whole eight phase loop.
NEAR BOOT stays brighter and same gold-blue design throughout, FAR BOOT stays darker and same gold-blue design. Boot toes ALWAYS POINT screen RIGHT, even when heels travel LEFT. Never mirror feet. No extra legs, no twisted ankle, no identity swaps.
All eight new lower-body poses must connect anatomically. Small careful backsteps. Preserve exact same upper bodies, same sizing, fixed local hip x, full transparent padding. No ground, no effects, no text. Exactly eight sprites arranged 4x2.
```

### QA

8枚それぞれの新規姿勢を保存。1の左腿露出から5の右腿露出へ逆脚半周期が変わり、3の左暗靴が右明靴の後ろに重なる状態と7の左明靴が右暗靴の前に重なる状態で支持・通過の交代を確認。接地・荷重・引き寄せ・後方伸展を8相でつなぐ。全コマで右を見て警戒し、空いた掌は胸前、杖は同じ前方の手で防御位置を維持。顔、帽子、水晶杖と持ち手固定。全靴先は右向き、足首接続と8→1の後方伸展から左側接地へのつながりを目視確認。全コマ共通倍率で切り出し、腰の青い菱形宝石のxを手動anchorにして足幅由来の左右ぶれを防ぐ。alpha・輪郭余白・8枚差分・共通接地baseline検査と8枚GIF検査に合格。画像の形状補間・再描画はしていない。

## 旧4枚生成履歴

原画v5は下段1コマ目の杖外周が均等セル境界x=443に重なったため、透明ガター内の境界x=465/917/1351で手動rectを設定。元RGBAは変更せず、隣セルのキャラも含めずに全装備を保存。出力8枚は2048×224、各256×224、各90ms、全720ms。共通scaleは0.3425。腰anchorは各手動rect内の腰宝石x基準。



生成方法: 組み込み image_gen、transparent_background: true。反転を使わず後退姿勢を生成。参照1は承認済み待機の単一160pxスプライト（主たる画風・頭身・キャラクター同一性）、参照2は承認済み待機の生成原画（詳細）、参照3は元デザイン（衣装のみ、画風は引き継がない）。

参照画像:
- public/assets/mage/idle-01.png
- public/assets/mage/source/mage-idle-generated-v1.png
- public/assets/references/mage-original.png

初稿所見: 全コマ右向きのまま、後ろ足を引き寄せる足首／膝姿勢を生成。前進素材とは別の原画で、同じ帽子・杖を保持。1/3コマの左右脚交代が弱いため、足運びのみ修正したv2を採用。露出する膝位置と足の重なりが切り替わる。前進の反転を使っていない。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: production pixel-art character animation sprite sheet for a browser belt-scrolling RPG.
Input images: Image 1 is the approved single idle sprite, PRIMARY identity, body proportions, exact costume, palette and pixel-density reference. Image 2 is the high-resolution approved 4-frame idle source, supporting identity and detailed pixel-art rendering reference. Image 3 is original character illustration, costume-detail reference only, NOT its smooth art style.
Character invariants: the SAME small blue-haired female mage, long royal-blue hair, oversized navy-purple wizard hat with gold trim and dangling ornament, blue diamond jewel in hat band, navy-purple long robe with gold embroidery and white inner skirt, purple ruffled hem, blue boots with gold trim, brown belt and pouch, brown wooden staff with bronze head holding a faceted bright blue crystal. Keep exact face, hairstyle, clothing, colors, short RPG sprite head/body ratio and visible pixel block size of approved idle; crisp clean pixel art and stair-step pixel edges; no smooth vector or painterly shading.
View: full-body character facing RIGHT in the same shallow side / three-quarter-right orientation as approved idle, never turn left. Camera and sprite body scale fixed across every frame. Staff remains the same existing staff, held in the same near/front hand.
Backdrop: genuine alpha TRANSPARENT everywhere outside the sprite. No solid fill, no checkerboard baked into pixels, no shadow or floor.
Layout: a SQUARE sheet with EXACTLY 4 equal-sized square cells in an exact 2 columns by 2 rows grid. No drawn border, no dividers, no text, no labels. Reading order top-left, top-right, bottom-left, bottom-right. A complete separate character in each used cell. At least 15% transparent margin on each edge of EVERY cell; no hat, hair, crystal or boot touches a cell border. All four figures same scale, same root x location, same floor baseline except airborne pose. Enough space for every appendage and staff in each cell.
Avoid: extra characters, extra limbs, extra weapons, attacks, magic effects, glow clouds, motion trails, dust, background scenery, UI, writing, watermarks. Do not reuse the original illustration's smooth drawing style.
Primary request: FOUR-FRAME BACKWARD WALK LOOP. She keeps her FACE pointed RIGHT, while cautiously back-stepping toward LEFT. This is NOT a flipped forward walk and not a left-facing sprite. Sprite stays centered for engine root movement; never translate it across cells.
Frame 1 top-left: near leg reaches BACK to LEFT with the toe/ball of the boot contacting behind her; far leg in front bearing weight, knees modestly bent, torso leans slightly RIGHT/front to balance retreat. Staff held vertically in front/right.
Frame 2 top-right: supporting weight shifts onto the rear planted foot, far foot lifts and draws back close to it, feet nearly pass with a bent knee.
Frame 3 bottom-left: far leg reaches BACK to LEFT and lands toe first, near leg in front; the opposite foot order from frame 1. Show the boots clearly below the robe and indicate which foot crosses behind.
Frame 4 bottom-right: weight shifts onto far rear foot, near foot lifts and draws backward past, ready to loop into frame 1.
Motion: short careful RETREAT steps with subtle bent-knee bounce. Both feet are visible and ankle poses differ distinctly between frames. Robe and hair have a small follow-through toward RIGHT as her body retreats LEFT. Staff retains same design, held in front with a small controlled sway. Face and nose RIGHT in every frame. No running, no attack, no new magic. Able to connect to the approved idle before and after.
```

## 足運び修正全文プロンプト

```text
Use case: identity-preserve
Asset type: production 4-frame pixel-art BACKWARD-walking / backstep loop.
Edit target: Image 1, the existing approved-design mage backward-walk 2x2 sprite sheet. Image 2 is the approved idle sprite, supporting STYLE / IDENTITY reference.
Change ONLY the leg gait and robe hem to make complete alternating retreat steps. Preserve all upper-body design, face, hat, staff, blue hair, colors, rendering, pixel-density, body proportions, transparent background and 2x2 framing. Face/nose points RIGHT in ALL four cells while her movement direction is LEFT.
Current defect: cell 1 and 3 look almost the same. Make them use OPPOSITE legs. Cell 2 and 4 must also use opposite legs.
Frame 1 TOP-LEFT = first BACKSTEP contact, NEAR leg extends BACK toward LEFT, its boot toe touching behind her, heel lifted. FAR leg supports body under/right of hips, knee slightly bent. Expose near leg knee at the LEFT opening of the robe.
Frame 2 TOP-RIGHT = first passing pose: NEAR/back leg now planted at LEFT/under hips; FAR leg bends forward with its toe lifted at RIGHT as it is about to draw backward. Clearly show the lifted boot toward RIGHT, not just the same left boot lifting as frame 4.
Frame 3 BOTTOM-LEFT = opposite BACKSTEP contact: FAR leg extends BACK toward LEFT behind skirt, near leg NOW supporting under/right of hips with that near knee exposed at the RIGHT opening of the robe. The FRONT-layer boot is now on RIGHT unlike frame 1. Both legs have distinct readable stances.
Frame 4 BOTTOM-RIGHT = opposite passing pose: FAR/back leg planted under hips; NEAR leg bends and lifts in front at RIGHT, its gold-trim boot tilted and slightly off floor, ready to travel BACK toward LEFT.
Short deliberate retreat steps, hips slightly lowered and torso subtly leaned RIGHT for balance. Alternate which knee shows and which boot overlaps which. All boots point generally RIGHT even when stepping backward. Don't flip any image. Don't create walking toward left, don't create a forward long stride. Robe hem opens enough to read leg action.
Keep all sprites intact within their own cells with broad transparent margin. No shadows, no floor, no extra characters/limbs/weapons, no magic, no effects, no text, no borders.
```


# 2026-10-06 足 ID 固定による再制作

## 相4/5/6/7 個別半周期の4姿勢生成全文

```text
Use case: identity-preserve.
Asset type: FOUR individual replacement guarded-mage backpedal poses in EXACT 2 COLUMNS x 2 ROWS sprite sheet. These are cycle phases4,5,6,7 ONLY, in reading order, not a whole cycle.
Image1 approved guarded mage single identity/style reference: preserve exact blue eyes/bluehair/navy-gold floppy hat, face, body proportions, navy goldembroidered robe with cream inner dress and purple ruffles, belt/pouch/blue gems, gold-blue navy boots, single ornate brown/gold blue-crystal staff. EXACT same protective chest-level free PALM at screen left, staff in SAME forward screen-right hand, gaze right. This guarded pose stays all4. Image2 is ONLY desired leg pose/occlusion guide, corresponding top-left4 top-right5 bottom-left6 bottom-right7. Copy leg position and low foot pass, NEVER colors/text/background.
CRITICAL FIXED LEG ID: anatomical LEFT L ALWAYS CAMERA NEAR/foreground, slightly brighter navy boot with distinct bright blue diamond and gold straps. Anatomical RIGHT R ALWAYS CAMERA FAR/background, darker navy boot. L at screen LEFT in phases4/5/6, passing near center7. R at screen RIGHT in4/5/6, center7. Near/far never swaps when screen x changes. L calf always occludes R at crossing. BOTH BOOT TOES POINT screen RIGHT in ALL4, even L at rear. Short cautious steps, low relaxed knees, no kicking.
Exact new poses, all torso/hip/root x same:
TOP-LEFT phase4: Near L knee visibly emerges at LEFT robe opening and goes DOWN-LEFT toward LEFT/back ankle, heel rising, toe low. Far R knee goes down-right under cream skirt, DARK far boot reaches RIGHT/front low ready5. Brighter blue jewel LEFT boot, darker RIGHT boot.
TOP-RIGHT phase5: Near L at LEFT/back with toe contacting and heel slightly raised, bright left gem prominent. Far DARK R at RIGHT/front with sole FLAT planted. Exposed near thigh/knee LEFT, far right knee partly behind cream skirt. Opposite of original image1's stance, not a duplicate of idle. Slightly wider stance than4.
BOTTOM-LEFT phase6: Far DARK R planted supporting at RIGHT-of-center and beginning return tocenter. Near BRIGHT L foot lifts LOW from LEFT/back and draws towardcenter, heel at most half bootheight high; near ankle remains LEFT of far ankle about one bootlength, gap smaller than5. Near knee still LEFT/near. No high heel kick.
BOTTOM-RIGHT phase7: FAR DARK R supports directly UNDER HIP. NEAR BRIGHT L passes LOW IN FRONT of R, ankles nearly same x within quarter bootlength, near foot only slightly aboveground. Bright near calf/boot occludes far dark boot, far dark toe partly visible behind/under. Natural low walking pass matching guide, no crossed twisted knees.
Keep the same guarded upper body/chest palm/staff at every cell. Camera exact original right-facing3/4. Robe hem can open subtly at left to show fixed near knee and make new foot poses anatomically attached. Same boots/hat/crystal/face/body size every frame. Restricted cautious stride, smaller than forward walk.
Exactly4 full separate complete characters in equal2×2 cells, same uniform scale, fixed waist x and baseline, broad TRANSPARENT padding around EACH, at least12% margin all sides. Full dangling hat ornament, hair, entire crystal fork/head/staff tip, knees and shoes inside own cell. Exact JRPG pixel art, crisp squareclusters and edges as image1, no smooth illustration. True RGBA alpha0 outside subject. No scenery, ground, shadow, checkerboard, text, numbers, guides, extra limbs/effects.
```

v6 は生成成功し警戒姿勢を維持するが、1/5 がともに近脚前を反復していたため不採用。v7 の全体下半身修正は接続エラーで画像を返さなかった。個別 4/5/6 を編集する。

## v7 全体修正全文（接続エラー、未生成）

```text
Use case: precise-object-edit. Image1 editable 8-frame guarded mage backpedal sheet,4 columns2 rows. Image2 exact LEG POSITION guide. Keep Image1 faces/hats/hair/upper bodies, protective palm at chest and staff in same hand, body size, costume/pixel style and transparent layout EXACT. Change only legs/boots/lower hem. Guide colors and text never appear in output.
ERROR: all eight presently show same NEAR BLUE-DIAMOND boot at screen right. This must alternate SCREEN X while keeping anatomical near/far depth fixed. Frame1 left-anatomical NEAR L is BRIGHT boot at screen RIGHT. Frame5 SAME NEAR L must be at screen LEFT, with bright blue diamond visible at LEFT. Far R darker boot goes from left1 to right5. Near L always foreground.
1 keep near L bright RIGHT/front planted, far R dark LEFT/rear.
2 near L toward center supports, far R comes LOW from left.
3 near L supportscenter; far R LOW passes BEHIND it, ankles almost same x and partly obscured.
4 NOW near L BRIGHT LEFT/back heel risen, far R DARK RIGHT/front low-reaching. Expose near knee at LEFT hem. Under cream skirt at RIGHT is far darker knee.
5 CRITICAL OPPOSITE STANCE: BRIGHT L boot at LEFT/rear with blue diamond/goldcross clearly facing camera and near bare knee exposed LEFT, toe down heel raised. DARK FAR R boot at RIGHT/front flat planted, knee under/behind cream skirt and dimmer ornament. The left boot must be bright, the right boot dark. Do not reproduce1. In each ~407px-wide cell, L ankle near x155, R near x270, waist x235. Near hip and knee slope down-left, far hip/knee slope down-right.
6 BRIGHT NEAR L still on LEFT but drawing LOW towardcenter, its ankle near x195 and only slightly lifted. FAR DARK R supports RIGHT-of-center near x248 and moves backtowardcenter. LEFT bright blue gem, right dark boot, no swapping.
7 NEAR BRIGHT L now passes LOW IN FRONT of FAR DARK R with ankles near same x235, near L just aboveground and dark R planted under it. No high knee kick.
8 NEAR L BRIGHT extends RIGHT/front near1, FAR R DARK left/rearheel. Seamless8→1.
All eight exact same right-facing camera and body scale. All toe tips RIGHT even rearleg. Lower skirt opening follows anatomy and helps fixed nearleg read. Same two right-facing boots and ornaments always attached to same leg. Nearcalf always occludes far at intersection. No background, text, borders, shadows, guide shapes or effects. RGBA4x2 with margins, same guarded stance.
```

組み込み image_gen を使用。待機は同一性、共通 guide は姿勢のみの参照。旧原画を保持する。

## v6 新規生成全文

```text
Use case: identity-preserve.
Asset type: replacement production pixel-art cautious BACKWARD WALK sprite sheet. Exactly EIGHT sequential poses, FOUR equal columns by TWO rows, top1-4 bottom5-8. Truly transparent RGBA.
Input1 approved mage single idle identity and pixel style. Input2 high-resolution approved idle costume details. Input3 ONLY eight-phase LEG POSE/OCCLUSION guide: adopt its corresponding low leg shapes but no colors, labels or background.
Same small blue-eyed female mage, long blue hair, navy-purple floppy gold-trim wizard hat with blue gem and dangling gold ornament, ornate gold embroidered navy robe, cream inner dress, purple ruffle, brown belt/pouch and blue jewels, navy blue gold-strapped ankle boots, one ornate brown/gold staff with faceted blue crystal. Fixed right-facing three-quarter view, same head/face/body scale/costume. Crisp pixel art as idle, deliberate square pixel clusters.
Guarded retreat: looks carefully to screen RIGHT all8 while taking small backsteps toward LEFT. Free hand raised at chest, palm outward protecting herself. Staff held in same screen-right forward hand, at chest level, slightly forward as protection. Small bent-knee protective stance, modest short stride, restrained hair/robe motion. No shield, new gear or magic effects. Staff/hand sides never switch.
FIXED FOOT ID: LEFT anatomical L = ALWAYS camera-near leg, brighter navy boot with bright blue diamond and gold cross strap. RIGHT anatomical R = ALWAYS camera-far leg, darker navy boot in same design. L ALWAYS overlaps in front of R at passing poses, irrespective of left/right screen x. Both boot toes ALWAYS point RIGHT. Do not mirror either boot.
Exact phase and foot positions matching guide, with shorter cautious step:
1 L near brighter boot RIGHT/front planted; R far darker boot LEFT/rear toe down heel raised. Front does not mean near: near/far identity is fixed.
2 L planted foot slides toward center, R low lifted foot comes from left/back to center.
3 L near supports directly under hip, R far passes LOW behind L at almost SAME ankle X, partly occluded by L. Ankles within a quarter-boot length, no high knee kick.
4 L near reaches LEFT/back heel lifted; R far extends RIGHT/front ready to land, low.
5 OPPOSITE leg stance: L near BRIGHT boot LEFT/back, R far DARK boot RIGHT/front planted. No duplicate1.
6 R far supports and returns toward center, L near lifts LOW and comes from left/back to center.
7 R far supports under hip, L near crosses LOW IN FRONT of R at almost SAME ankle X, brighter L boot occludes darker R boot.
8 L near BRIGHT extends RIGHT/front near1 position but poised pre-contact; R far DARK reaches LEFT/back heel rising. Smooth8→1 same foot sides and no jumps.
Hem opens subtly to make lower legs and depth legible while preserving robe length/design. Anatomically connected ankles, identical right-pointing shoe shape all8. Same waist root x, equal figure scale, gentle tiny bob, boots baseline. All eight poses distinct.
Exactly eight complete separate full figures with broad transparent gutters in equal4×2 cells. Full hat tip, staff head/tip, hair, hem and boots inside own cell. No floor, shadow, effects, particles, text, labels, numbers, borders, guide lines, baked checkerboard, solid backdrop or duplicate limbs.
```

採用原画 v7 は新規 v6 の1/2/3/8と、新規相4～7の2×2原画から合成した8姿勢。assembly.json と前進ディレクトリの assemble-reviewed.cjs で切り出し・全身一様倍率の最近傍正規化・腰宝石xを合わせる。画像形状のコード描画・補間なし。8は行間の生成縮尺差を補正するため全身を443px高に一様最近傍で合わせる。
