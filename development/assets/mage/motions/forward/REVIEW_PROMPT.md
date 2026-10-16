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
