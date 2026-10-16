# 魔法使い・前進


## 8枚ループ改訂（2026-10-06）

組み込み `image_gen`、透過背景。待機単一画像と高解像度待機原画を参照し、4列×2行の8枚を新規生成。旧v1/v2と初回v3はsourceへ保存。v4で逆脚半周期を修正。ユーザーの動作確認を受け、v5で3・7コマ目に脚が体下で重なる通過姿勢を追加。現行原画は `source/mage-forward-generated-v5.png`。腰xのanchorは全コマ250へ揃えた。v5の全文プロンプトと変更理由は [CROSSING_FIX.md](CROSSING_FIX.md) を参照。

### 新規8枚生成プロンプト全文

```text
Use case: identity-preserve.
Asset type: replacement production pixel-art movement sprite sheet, exactly EIGHT sequential animation poses in FOUR equal columns by TWO equal rows, reading order left to right top row 1-4 then bottom row 5-8. One seamless walk loop, eight different poses, no duplicate poses.
Input image 1 is the approved mage idle sprite: exact character identity and equipment reference. Input image 2 is the higher-resolution approved mage idle sheet: detail/style reference, NOT a layout reference. Preserve this SAME blue-eyed young female mage, long blue hair, huge navy violet bent wizard hat with gold trim, blue diamond hat gem and dangling gold ornament, navy violet gold-edged open robe over cream dress, brown belt and gemstone pouch, navy gold-trim ankle boots with blue gems, single ornate brown/gold fork-headed blue crystal staff. Never alter anatomy or outfit between frames.
Primary request: draw a smooth EIGHT-frame forward WALK loop toward screen RIGHT, facing right throughout. Keep head, shoulders and hip at consistent local x in every cell. Only subtle vertical body bob with eight logical walking phases; no frame size drift.
LOCKED INVARIANTS: same face and hair silhouette; identical hat shape, hat gem and trim; same robe length and gold ornament; same staff length, crystal facets and shape; staff stays in same forward hand on SCREEN RIGHT, mostly upright with small walking sway, no hand swapping; free hand stays on screen left. Same two boots with soles and toes ALWAYS pointing screen RIGHT. Two legs are anatomically continuous, no twisted ankle, no left-pointing toe, no extra limbs. Each boot is same size and design every frame. The near and far leg must alternate visibly, far leg slightly darker for depth. Robe hem high enough to show both lower legs and boots.
Precise frame progression: 1 near foot right/front heel contact, far foot left/rear toe contact; 2 near stance knee compresses slightly while far heel lifts, body down; 3 near supporting foot below hip, far recovery knee moves forward through hip with boot raised; 4 near support pushes behind with heel up, far foot extends forward, body up; 5 far foot right/front heel contact, near foot left/rear toe contact; 6 far stance knee compresses, near heel lifts, body down; 7 far support below hip, near recovery knee passes forward with boot raised; 8 far support pushes behind heel up, near foot extends forward ready for frame 1. Eight must blend into one naturally. Toes continue pointing screen right even when legs travel backward. Walking in place for game movement, no horizontal drift. Moderate small stride, not running or jumping.
Style: same detailed clean JRPG pixel art as reference; consistent square pixel clusters and dark outlines, crisp palette and no smooth illustration or blur. Entire character and staff in each cell, plenty of transparent padding, all grounded soles share same horizontal floor. Robe/hair/hat ornament secondary movement follows body by at most one logical pixel. No flips or camera angle changes.
Canvas: transparent PNG, four columns two rows, generous transparent gutters, no labels no numbers no guides no floor shadow no effects no baked checkerboard no text. Exactly eight figures, same scale, same baseline. New artwork for all eight poses.
```

### 逆脚修正プロンプト全文

```text
Use case: precise-object-edit.
Input image1 is the EIGHT-pose forward mage sheet to repair, arranged 4 columns 2 rows. Image2 is original idle identity reference. Keep image1's transparent 4x2 sheet layout, same face, hair, hat, torso, costume, equipment, hands, proportions and scale. KEEP ALL UPPER BODIES IDENTICAL TO IMAGE1, no character redesign. Fix the walking leg cycle so the second half alternates the opposite support leg.
CRITICAL CHANGE ONLY: in bottom row frames5-8, reverse which leg is near/far relative to top row1-4. The NEAR leg has a clearly lighter navy blue boot and must consistently overlap the DARK FAR leg when crossing. A walk cannot repeat the same leading near leg twice.
Top row1-4 keep near light boot leads RIGHT first while far dark boot recovers forward, except clarify dark far boot ankle/sole toe pointing RIGHT. The lower body must still smoothly flow into opposite contact on bottom row5.
Bottom frame5: FAR DARK boot lands at screen RIGHT/front, heel down, while NEAR LIGHT boot is behind at screen LEFT/rear, toe on ground heel raised, its visible calf connects behind through the near side of robe. Far foot is more occluded by cream skirt; near leg remains above far on any overlap.
Bottom frame6: FAR DARK boot supports at right but starts traveling toward hip; near LIGHT heel lifts behind on left, knee softly bends and pulls forward; body slightly lower.
Bottom frame7: FAR DARK boot planted under hip supporting full weight, NEAR LIGHT knee and boot lift and swing forward to RIGHT through passing pose, light boot overlaps in FRONT of dark boot.
Bottom frame8: FAR DARK foot travels LEFT/rear for toe push off; NEAR LIGHT boot extends RIGHT/front but is still raised, preparing for near heel contact in top frame1.
Across eight: 1 near contact,2 near down,3 near support/far pass,4 near rear/far reach,5 FAR contact,6 far down,7 far support/NEAR pass,8 far rear/near reach. ALL boot toes point screen RIGHT at ALL times. Same boot sizes, gem patterns and ankle anatomy. No mirrored boots. Distinct near/far colors must clearly identify which boot is moving. Never swap boots between leg identities.
No other changes. Preserve crisp pixel art, true transparent alpha, same 4x2 canvas and placement, no labels, no ground, no particles or effects. Ensure eight DIFFERENT walking drawings form one seamless cycle and frame8 moves naturally to frame1.
```

### QA

8枚それぞれの新規姿勢を保存し、接地・荷重・通過・伸展の後に逆脚側の半周期を描く。1/2は右側の腿、5/6は左側の腿露出に違いがあり、ローブ内で近遠脚の交代を示す。3/7と4/8は膝・靴角度・重なりが異なる。全コマの顔、帽子、水晶杖、持ち手は右向きを維持。靴先の右向きと足首接続、8→1の右足伸展から接地へのつながりを目視確認。全コマ共通倍率で切り出し、腰の青い菱形宝石のxを手動anchorにして足幅由来の左右ぶれを防ぐ。alpha・輪郭余白・8枚差分・共通接地baseline検査と8枚GIF検査に合格。画像の形状補間・再描画はしていない。

## 旧4枚生成履歴


生成方法: 組み込み image_gen、transparent_background: true。画像のポーズの作り直しは画像生成のみ。参照1は承認済み待機の単一160pxスプライト（主たる画風・頭身・キャラクター同一性）、参照2は承認済み待機の生成原画（詳細）、参照3は元デザイン（衣装のみ、画風は引き継がない）。

参照画像:
- public/assets/mage/idle-01.png
- public/assets/mage/source/mage-idle-generated-v1.png
- public/assets/references/mage-original.png

初稿所見: 右向きと元の衣装・杖を維持。4コマの足の接地／持ち上げとローブの揺れを確認。1/3コマの左右脚交代が弱いため、足運びのみ修正したv2を採用。3コマ目の脚の開きと近い側の足位置が逆になり、交代が読み取れる。

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
Primary request: FOUR-FRAME FORWARD WALK LOOP, facing right and stepping toward the right. The sprite stays centered in place for engine movement; do not translate positions across cells.
Frame 1 (top-left): near leg steps forward to right, far leg back to left, a clearly visible moderate walking stride. Weight slightly lowered. Front arm holds staff upright, other arm naturally counter-swings.
Frame 2 (top-right): passing pose, back foot swings forward just off the ground, supporting leg near the root. Weight gently rises.
Frame 3 (bottom-left): far leg now steps forward to right, near leg back to left, opposite of frame 1. Both boots distinct and visible beneath robe.
Frame 4 (bottom-right): opposite passing pose, near foot swings forward just off ground, ready to return seamlessly into frame 1.
Motion: natural deliberate walking, hips/bust/hat a very subtle two-beat bounce, hair and robe lag softly with steps, staff subtly sways while preserving its design. Robe opens enough at the hem to show understandable alternating foot positions. All sprites face RIGHT and move FORWARD, no backward step, no sprint, no attack. Each frame has a meaningfully different foot pose. The animation can connect to the approved idle before and after movement.
```

## 足運び修正全文プロンプト

```text
Use case: identity-preserve
Asset type: production 4-frame pixel-art forward-walking loop.
Edit target: Image 1, the existing approved-design mage forward-walk 2x2 sprite sheet. Image 2 is the approved idle sprite and is a supporting STYLE / IDENTITY reference.
Change ONLY the leg gait and robe hem as necessary to make a complete alternating two-step cycle. Preserve ALL upper-body art, face, hat, staff, costume designs, blue hair, palette, pixel-density, character scale, transparent padding and original 2x2 frame layout. No new effects.
There is a gait defect: the current TOP-LEFT and BOTTOM-LEFT feet have almost the same arrangement, and likewise the two passing poses. They need to depict OPPOSITE legs. Make a clear readable walking gait in the lower body:
Frame 1 TOP-LEFT = NEAR/FRONT leg extended toward RIGHT, far/back leg planted toward LEFT. Preserve the existing broadly spread contact pose.
Frame 2 TOP-RIGHT = first passing pose; NEAR leg supports straight down, FAR leg bent behind and lifting, visible far knee/boot.
Frame 3 BOTTOM-LEFT = OPPOSITE CONTACT: NEAR/FRONT leg NOW extends BACK toward LEFT with its boot visible in front-layer on the LEFT; FAR leg extends FORWARD toward RIGHT with its boot on the RIGHT partially behind skirt. This MUST differ from frame 1. Exchange which knee is exposed below white inner skirt. Readably switch the silhouettes of both boots.
Frame 4 BOTTOM-RIGHT = OPPOSITE PASSING: FAR leg supports straight down, NEAR/FRONT leg bends and lifts back/under body, its boot visible on the LEFT in front-layer, ready to advance into frame 1. This MUST differ from frame 2.
Face/nose points RIGHT in ALL frames. Body and root stay centered. Robe hem opens naturally enough to expose the TWO legs' clear alternating action. Feet travel through contact, passing, opposite contact, opposite passing. Both blue boots preserve their gold trim.
Strict genuine alpha transparent background. Keep entire sprites within their cells, no solid background, floor, shadow, borders, text, extra characters, extra limbs, magic or weapons.
```


# 2026-10-06 足 ID 固定による再制作

個別 5/6 の脚と近遠関係は成立したが水晶杖外周が生成画像右端に接したため保留。両セルを最近傍で等倍率縮小・透明余白へ並べた target を作成し、2 個だけを同時に余白修正する。新しい姿勢をコードから描かず、imagegen で欠けた杖外周を修復する。

## 個別 5/6 余白修正全文

```text
Use case: precise-object-edit. Image1 EDIT TARGET is two correctly-posed mage walk cells SIDE BY SIDE. Left cell is cycle PHASE5, right cell is PHASE6. Image2 is original approved high-resolution mage idle detail reference, only for completing staff.
Primary change ONLY framing: both image1 staff crystal-head right edges were clipped in their prior generations. Restore the small missing rightmost bronze fork contour and keep the ENTIRE staff head, crystal and lower tip inside each cell with broad transparent margins. Maintain exact image1 characters, poses, leg depths, head/face/body shape, hair, hat, robe ornaments, staff-bearing hand, pixel art, proportions. Two figures should stay equal scale, match idle head/body proportions, with identical costume/face.
Left character PHASE5: LEFT anatomical NEAR brighter leg remains at screen LEFT/back toe touching, exposed knee at left, blue gem bright. RIGHT anatomical FAR darker leg remains at screen RIGHT/front planted. Near knee/blue gem at LEFT must NOT move to right.
Right character PHASE6: LEFT anatomical NEAR bright blue-gem leg remains LEFT-of-center, LOW lifted and returning towardcenter; RIGHT anatomical FAR boot supports at RIGHT-of-center. All shoes point RIGHT, fixed near leg foreground. Retain low foot action exactly, no switching legs or high kicks.
Layout EXACTLY TWO equal columns ONE row, two full separate figures with same waist x within each cell, same floor. Preserve crisp JRPG pixel art, transparent RGBA background. At least 10% clear margin on both sides of EVERY full figure, especially complete staff on right. Do not scale one independently, do not enlarge head/costume, do not add a third pose. If needed reduce both figures uniformly to provide room. Same hat danglingornament, navy goldrobe, bluehair, staff bluecrystal. No text/labels/ground/shadows/effects/guides/bakedcheckerboard.
```

## 6 個別原画生成全文

```text
Use case: precise-object-edit. EDIT ONLY the LEGS/BOOTS/lowest hem of Image1, one full-body mage sprite. Image2 is the exact desired leg pose guide, ignore its colors/labels/background. Keep Image1 upper body head/face/hair/hat, both arms, staff, robe details and body proportions EXACT. Single same full character, same right-facing 3/4 camera. Transparent background, crisp pixel art. Two boots always point RIGHT. LEFT anatomical leg ALWAYS camera NEAR, brighter navy with clear blue diamond and gold cross straps. RIGHT anatomical leg ALWAYS camera FAR, darker navy boots, same design. Never swap leg depth.
This is walk phase6. FAR R darker boot supports under body on screen RIGHT-of-center, flat planted and returning toward center. NEAR L BRIGHT boot comes from LEFT/back toward center, LOW lifted by only half a boot height, knee slightly bent at LEFT opening of robe. NEAR BRIGHT boot sits LEFT of DARKER far boot, unlike current image1. Show near blue diamond on LEFT boot. Near calf/boot always foreground even while at left. Do not make high kick. Ankle x gap approximately one boot length, preparing phase7 close crossing.
Match the image2 leg slopes and contact heights. Do not mirror shoes. Do not change upper body. Keep head, boots, staff fully visible with transparent padding. No ground/shadow/effects/text. Single pose only, not sheet. Preserve alpha transparency even if hidden RGB outside subject looks colored.
```

## 5 個別原画生成全文

```text
Use case: precise-object-edit. EDIT ONLY the LEGS/BOOTS/lowest hem of Image1, one full-body mage sprite. Image2 is the exact desired leg pose guide, ignore its colors/labels/background. Keep Image1 upper body head/face/hair/hat, both arms, staff, robe details and body proportions EXACT. Single same full character, same right-facing 3/4 camera. Transparent background, crisp pixel art. Two boots always point RIGHT. LEFT anatomical leg ALWAYS camera NEAR, brighter navy with clear blue diamond and gold cross straps. RIGHT anatomical leg ALWAYS camera FAR, darker navy boots, same design. Never swap leg depth.
This is walk phase5 opposite to phase1. NEAR L leg/bright boot reaches screen LEFT/back and its TOE touches floor, heel raised a little. It is the foreground leg and exposed near knee on LEFT robe opening. FAR R darker boot reaches screen RIGHT/front with FLAT sole planted. Right boot must be DIMMER than left boot, its near-facing ornament not as prominent; the clear blue diamond belongs on LEFT near boot. Under cream skirt, the right/front knee is FAR so partially hidden/dark. Near leg always foreground, its near calf extends down-left. No camera rotation. Make near boot's left position and forward far darker boot unambiguous.
Match the image2 leg slopes and contact heights. Do not mirror shoes. Do not change upper body. Keep head, boots, staff fully visible with transparent padding. No ground/shadow/effects/text. Single pose only, not sheet. Preserve alpha transparency even if hidden RGB outside subject looks colored.
```

## 4 個別原画生成全文

```text
Use case: precise-object-edit. EDIT ONLY the LEGS/BOOTS/lowest hem of Image1, one full-body mage sprite. Image2 is the exact desired leg pose guide, ignore its colors/labels/background. Keep Image1 upper body head/face/hair/hat, both arms, staff, robe details and body proportions EXACT. Single same full character, same right-facing 3/4 camera. Transparent background, crisp pixel art. Two boots always point RIGHT. LEFT anatomical leg ALWAYS camera NEAR, brighter navy with clear blue diamond and gold cross straps. RIGHT anatomical leg ALWAYS camera FAR, darker navy boots, same design. Never swap leg depth.
This is walk phase4, right leg going forward. NEAR L brighter boot must be at screen LEFT/back with heel raised; FAR R darker boot must reach screen RIGHT/front LOW ready to touch down. Current image1 has wrong near leg forward, so change it. Near L exposed knee belongs to LEFT opening of skirt, and stretches diagonally DOWN-LEFT. Far R leg emerges under cream skirt and extends DOWN-RIGHT, occluded behind near robe. Brighter LEFT boot's gold strap and blue gem are clearly visible. DARKER RIGHT boot toe points RIGHT; near bright calf always rendered foreground even though at left screen. Moderate diagonal stride, not same pose as1.
Match the image2 leg slopes and contact heights. Do not mirror shoes. Do not change upper body. Keep head, boots, staff fully visible with transparent padding. No ground/shadow/effects/text. Single pose only, not sheet. Preserve alpha transparency even if hidden RGB outside subject looks colored.
```

v7 は 5 の左側に近い膝を露出したが、近靴の意匠/明度が右側に残り、4/6 の相も反転していなかったため保留。4/5/6 は v7 の対応セルを無変形切り出しして、それぞれ guide の対応セルと参照し、個別原画を生成する。合成時も全身の単一倍率・最近傍と位置合わせのみを使用する。

v6 は 1 参照（高解像度待機のみ）の実行が成功。複数参照の初回 4 試行は接続エラーで原画なし。採用前確認で v6 の 5 が 1 と同じ近脚前になっていたため不採用、v7 で半周期を修正。

## v7 脚と裾の修正全文

```text
Use case: precise-object-edit.
Image1 is editable eight-pose mage forward sheet,4 columns2 rows. Image2 is LEG POSITION AND OCCLUSION guide only. Edit image1's LEGS and lower hem only to match image2's corresponding phases. Preserve exact8 faces, hats, hair, upper body, staff and hands, body scale, pixel art, clothing design, framing and transparent alpha.
CURRENT ERROR: bottom-left frame5 and bottom-second frame6 STILL have the same NEAR BRIGHT LEG at screen RIGHT as top1. This is WRONG. Turn bottom5 into the opposite stance: NEAR BRIGHT LEG extends LEFT/BACK with visible near knee emerging at LEFT robe opening, FAR DARK LEG extends RIGHT/FRONT, partly hidden under cream skirt. LEFTmost boot must be bright blue gem with goldcross and face RIGHT; RIGHTmost boot is darker far boot, face RIGHT. Near foot does NOT stay on right.
All phases1-8 strictly use Image2 poses. Do not copy guide colors.
1 near-bright L right/front planted, far-dark R left/back toe.
2 near L moves toward center supports; far R low lift from rear.
3 near L supports center, far R passes behind L, ankles nearly same X and low.
4 near L reaches LEFT/back, FAR DARK R moves RIGHT/front ready5. RIGHTmost boot DARK.
5 near BRIGHT L LEFT/back toe; far DARK R RIGHT/front planted. OPPOSITE1. Near calf must visibly occlude far at depth, no camera swap.
6 near BRIGHT L still LEFT but coming LOW to center, far DARK R right returning to center supports.
7 far DARK R supports center, near BRIGHT L low passes IN FRONT of R at nearly same ankle X. Show a little far dark toe behind/under bright near shoe. No high knee or backward heel kick.
8 near BRIGHT L right/front pre-contact, far DARK R left/rear heel. Smooth8→1.
Both feet point RIGHT all8, boot same anatomy, ankle always connected. L ALWAYS near and R ALWAYS far; near/dark assignments never swap. Lower skirt opening follows knees to read their ID, no giant garment distortion.
Keep upper half unchanged and same transparent4x2 positions. No background/shadow/text/guide lines/effects. If image1 has colored hidden RGB in transparent regions, preserve genuine alpha; do not add a visible backdrop.
```

組み込み image_gen を使用。待機の単一スプライト／高解像度原画は同一性、共通 guide は姿勢のみの参照。旧原画を保持する。

## v6 新規生成全文

```text
Use case: identity-preserve.
Asset type: replacement JRPG pixel-art EIGHT FRAME FORWARD WALK sprite sheet, FOUR COLUMNS TWO ROWS on transparent RGBA.
Image 1 is approved single mage identity and exact pixel style. Image 2 is high-resolution idle costume reference. Image 3 is ONLY the eight-phase LEG POSE AND OCCLUSION GUIDE. Copy its leg positions/occlusion for each corresponding numbered cell, but never its colored stick limbs, labels or background.
Recreate the SAME small young blue-eyed female mage, long blue hair, floppy navy-purple gold-trim wizard hat, dangling gold ornament, blue diamond, gold embroidered navy robe, cream inner dress, purple ruffled hem, brown belt and gemstone pouch, navy blue gold strapped ankle boots, and one ornate brown/gold staff with blue faceted crystal. Same three-quarter RIGHT-facing camera, body proportions, crisp detailed deliberate pixel clusters, palette and costume. Staff stays in same screen-right forward hand, free hand relaxed at screen-left. Full head, hair, staff and boots visible in each cell. Fixed hip x, same scale, tiny 2% vertical bob only.
Critical FIXED FOOT ID: LEFT anatomical leg L is ALWAYS CAMERA NEAR, visibly brighter navy boot with blue diamond and gold cross strap. RIGHT anatomical leg R is ALWAYS CAMERA FAR, darker navy boot, same costume. Front/back screen x changes while near/far depth NEVER swaps. L calf/boot occludes R during crossing. Both boot toes point screen RIGHT in ALL eight frames.
Use the guide's corresponding EXACT phases:
1 top-left: L near brighter leg extends diagonally RIGHT/front, boot flat on ground. R far darker leg extends LEFT/back, heel raised, toe near floor.
2 top-second: L near planted foot moves toward body center, R far foot lifts LOW and comes from left/back toward center.
3 top-third: L near planted ankle directly under hip; R far ankle passes BEHIND L at almost SAME X, within one-quarter boot length. Dark R shoe partly hidden by brighter L shoe, slightly higher than L. Very low foot pass, no high knee.
4 top-right: L near moves LEFT/back heel lifting; R far extends RIGHT/front low, darker boot visible at right.
5 bottom-left: OPPOSITE of 1. L near brighter leg extends LEFT/back, toe near ground, heel slightly lifted. R far darker boot extends RIGHT/front flat planted. The brighter near boot is now on the LEFT and the darker far boot on the RIGHT. Do not repeat frame1.
6 bottom-second: R far supports and moves from right toward center, L near comes LOW from left/back toward center.
7 bottom-third: R far planted ankle directly under hip; L near ankle passes IN FRONT of R at nearly SAME X, within one-quarter boot length. Brighter L shoe overlaps dark R shoe, L slightly above floor. Low natural pass, no bent-back heel kick.
8 bottom-right: L near extends RIGHT/front ready to land in1, R far moves LEFT/back heel lifting. Feet and hip positions very close to1, so8-to1 seamless, but8 is a distinct pre-contact drawing.
All eight are original distinct poses, continuous strides. Hem may subtly expose lower legs to show the boots' anatomical attachments and occlusion; preserve robe design and length. ALL shoes same right-pointing design and ankle connection, never shoe mirroring or swapping brightness. Restrained forward walk, no running, no kicking, no exaggerated knee bend. Hair and robe gentle continuous follow-through.
Composition: exactly eight separate full figures in equal 4x2 cells reading top1-4/bottom5-8. Generous transparent gutters, each figure same centered waist and baseline. Exact crisp pixel-art style. Truly transparent alpha outside sprites; no scenery, floor, shadow, checkerboard, text, numbers, labels, borders, guide, extra limbs or effects.
```

採用原画 v8 は v7 の 1/2/3/7/8 と、新規個別4／余白修正ペア5/6を合成した8姿勢。assembly.json と assemble-reviewed.cjs に原画切り出し・単一倍率の最近傍正規化・腰宝石x合わせを記録。画像形状のコード描画・補間なし。

## v6 参照送信の補足履歴

初回の本文は REVIEW_PROMPT.md の v6 全文。3参照（単一待機、高解像度待機、全8 guide）の3試行は接続エラーで画像なし。2参照（単一待機、guide）も接続エラーで画像なし。その試行は同じ本文の末尾へ次の全文を追加した:

```text
If only two images are attached: image1 is single idle identity; image2 is phase guide. Still preserve every original costume detail.
```

成功した v6 は高解像度待機1参照のみ。同じ v6 本文へ以下を末尾追加した:

```text
Only Image1 is supplied in this retry: it is the approved idle identity. Use the written eight-phase specification without a guide attachment.
```

以後の生成/編集は各全文の記載参照を使用。採用画像はすべて組み込み image_gen、transparent_background=true、プロジェクト source にコピー済み。CLI/API フォールバックなし。
