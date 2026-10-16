# ボスイノシシ — 移動3コマずつの再生成

組み込み `image_gen`、すべて透過背景。1〜3と4〜6を別々に生成し、2・3・4コマ目は個別の画像編集で歩行姿勢と脚の接続を修正。原画は保存し、登録では切り出し・最近傍拡縮・位置合わせのみを行う。

## 前半1〜3 v1

参照: `../boar/source/boar-move-first-pose-guide.png; motions/idle/idle-01.png; ../boar/motions/move/boar-move-01-03.png`

原画: `source/boss-boar-move-01-03-generated-v1.png`

```text
Use case: sketch-to-render. Asset: THREE-frame pixel-art Boss Boar WALK sprite strip, first half of a six-frame in-place walking loop.
Input image1: mandatory skeleton/hoof POSITION GUIDE, frames1,2,3. Input image2: canonical BOSS BOAR character identity, palette, pixel texture and camera. Input image3: normal boar's finished first-half walk, gait reference ONLY. Replace the guide with the exact boss from image2. Do NOT render schematic lines, colors or lettering.
Preserve the boss design: left-facing slightly elevated 3/4 side-view, very bulky shoulders, huge curved ivory tusks, dark charcoal umber fur, tall rusty copper mane, amber-red eye, pale diagonal shoulder scar, short tail, charcoal cloven hooves. Crisp chunky pixel art, black/dark outline. All THREE bodies same length, mass, mane/tusks and color palette. Match image2 darkness; no progressive brightening.
Draw THREE distinct WALKING poses in ONE horizontal row on a 1536x1024 transparent canvas, three 512x1024 cells. Each complete sprite stays safely inside its cell with minimum 22px side margins, hooves approximately on local y700, torso approx local x270/y460. Never use a 2-row grid or a six-pose sheet. No ground, shadows, glow, text, labels or drawn checkerboard.
Near legs = anatomical LEFT, lighter; far legs = RIGHT, darker and behind near legs.
Frame1 left cell: exact stance of image2, FAR RIGHT FRONT extended forward toward SCREEN LEFT, near LEFT FRONT behind. Near LEFT REAR hoof trails BACK to screen-right behind pelvis (guide x478), far RIGHT REAR reaches FORWARD underneath belly (x332).
Frame2 middle: near LEFT FRONT bends and LIFTS off ground, swinging FORWARD toward left. Near LEFT REAR also bends and LIFTS high under hip/belly (guide x402,y635), while far RIGHT REAR planted supporting at x387,y680. Hoof must be visibly raised; don't leave rear leg standing.
Frame3 right: near LEFT FRONT extends distinctly FORWARD toward left (guide x130,y677), just before landing. Near LEFT REAR ALSO extends FORWARD UNDER BELLY, LEFT of pelvis (x325,y667), while far RIGHT REAR extends BACK toward right (x450,y680). The large near rear hoof must move from far BACK in frame1 to UNDER BELLY in frame3. Far front leg trails back.
Follow ALL four guide leg joint positions and hoof placement, with natural correct furry anatomy, EXACTLY four legs per sprite. Both front AND rear legs move, no fifth hoof, no fused limbs, no mirrored frame. Small torso bob only; no charge, crouch, leap or hoof dragging. This is a heavy steady walking stride. Actual transparent alpha.
```

## 前半3コマ目の修正 v2

参照: `source/boss-boar-move-01-03-generated-v1.png; ../boar/motions/move/boar-move-01-03.png`

原画: `source/boss-boar-move-01-03-generated-v2.png`

```text
Use case: precise-object-edit. Reference1 is a three-frame Boss Boar walk strip EDIT TARGET. Reference2 is the normal boar's finished first three walking poses, especially its third pose.
Change ONLY THE RIGHTMOST THIRD BOSS SPRITE'S FOUR LEGS below shoulder/pelvis. KEEP the first and middle sprites pixel-for-pixel unchanged. KEEP third sprite's head, mane, tusks, torso, tail, shoulder scar, palette and pixel texture unchanged.
The third boss currently repeats its standing stance, which is incorrect. Replace all four legs with the THIRD pose in image2:
- LIGHT NEAR LEFT FRONT leg stretched far FORWARD toward SCREEN LEFT: diagonal from shoulder down-left, near forehoof around local x110,y690 instead of x220; far DARK RIGHT FRONT leg trails toward screen-right, hoof around x235,y690.
- LIGHT NEAR LEFT HIND leg stretched FORWARD underneath BELLY: thigh bends down-LEFT from pelvis at x400, hock around x340,y625, large near hindhoof at local x310,y680. This hoof must be left of the hip, NOT at far-right x455.
- DARK FAR RIGHT HIND leg stretched BACKWARD toward screen-right, far hindhoof at local x455,y680. Exactly two rear legs.
This means near FRONT and near REAR reach left/forward in third pose, while BOTH far legs trail behind. Third pose is just before landing, hoof tips about 10px above the planted far hooves, a regular walk and NOT airborne jump/crouch. Four correctly connected legs, old leg positions fully replaced, no fifth foot. Match anatomy and overlaps of the normal boar's THIRD pose.
Keep original 1536x1024 canvas, three sprites in one horizontal row, no labels/background/shadow; genuine alpha transparency. Do not alter any other part of the sheet, do not change colors or brighten fur.
```

## 後半4〜6 v1（5・6コマ目を採用）

参照: `../boar/motions/move/boar-move-04-06.png; motions/idle/idle-01.png; ../boar/source/boar-move-second-pose-guide.png`

原画: `source/boss-boar-move-04-06-generated-v1.png`

```text
Use case: style-transfer. Reference1 is the EXACT THREE chronological walking poses 4,5,6 of a normal boar (edit/gait target). Reference2 is the Boss Boar design and palette. Reference3 is the exact skeleton position guide for poses4,5,6.
Transform the THREE normal boars in reference1 into the SAME Boss Boar from reference2. Preserve ALL FOUR LEG POSES of each respective normal boar: near/far order and forward/backward positions are the highest priority. Keep exact left-facing slightly elevated 3/4 camera, chunky pixel-art outlines and scale consistent between frames. Boss identity: bulky shoulder, huge ivory tusks, charcoal umber fur, rust-copper spiky mane, amber-red eye, pale diagonal shoulder scar and short tail. Match reference2 fur darkness, do not brighten/orange-shift.
Output exactly THREE full sprites in ONE horizontal row on1536x1024, equal512x1024 cells, torso around x270/y460, hoof baseline y700. Minimum24px empty transparent side padding in each cell, bodies/tusks/tails/hooves entirely inside cells. True transparent alpha. No grid, text, ground, shadows, diagrams or glow.
Frame4 LEFT cell: LIGHT NEAR LEFT FRONT leg stretched FORWARD toward screen-left, large near forehoof around local x110,y690. DARK FAR RIGHT FRONT trails BACK around x210,y680. LIGHT NEAR LEFT HIND reaches FORWARD UNDER BELLY around x330,y690, to the LEFT of pelvis; DARK FAR RIGHT HIND trails to the RIGHT around x430,y680. This follows directly from the first-half third pose.
Frame5 MIDDLE: near LEFT FRONT and near LEFT REAR now bear weight, moving back beneath shoulder/hip; far RIGHT FRONT bends and lifts to pass FORWARD behind nearer foreleg, far RIGHT HIND visibly folds and LIFTS HIGH UNDER BELLY around x345,y620. Do not leave both rear hooves on ground.
Frame6 RIGHT: DARK FAR RIGHT FRONT leg extended FORWARD toward LEFT around x110,y680, LIGHT NEAR LEFT FRONT trails back around x230,y690. DARK FAR RIGHT HIND reaches FORWARD UNDER BELLY around x315,y665, LIGHT NEAR LEFT HIND pushes BACK toward RIGHT around x460,y690. This will connect back to the canonical far-front-leading idle stance.
This is the opposite leg half: pose4 both NEAR legs forward; pose6 both FAR legs forward. Exactly4 natural connected legs, correct darker far-leg occlusion. Front AND rear legs must change. Never mirror/copy first half, never draw pose4 and pose6 identically, no charge/jump/crouch.
```

## 前半1〜3 v3（基準）

参照: `../boar/motions/move/boar-move-01-03.png; motions/idle/idle-01.png; source/boss-boar-move-04-06-generated-v1.png`

原画: `source/boss-boar-move-01-03-generated-v3.png`

```text
Use case: style-transfer. Reference1 is the EXACT THREE chronological walking poses 1,2,3 of a normal boar (gait/edit target). Reference2 is canonical Boss Boar design. Reference3 is the already finished Boss Boar second-half walk (character/size/palette match ONLY, not pose order).
Recreate the THREE normal boars of reference1 as this exact Boss Boar. KEEP EACH NORMAL BOAR'S FOUR LEG POSES EXACTLY, especially the RIGHTMOST third pose: its lighter large near FRONT leg stretches down-LEFT/forward and its lighter large near REAR leg stretches LEFT under the belly, while both darker far legs trail to the right. Do not copy a default standing or lifted-front-leg pose into frame3.
Boss identity exactly refs2/3: large ivory tusks, charcoal umber fur, rust-copper spiky mane, amber-red eye, shoulder scar, stocky bulky body. Same left-facing slightly overhead 3/4 side camera and crisp dark outlines/pixel clusters. Match all body lengths, height, head/mane detail and palette across 3 frames to reference3.
EXACTLY THREE complete sprites in ONE horizontal row, all same scale, true transparent alpha, generous transparent margin around each complete sprite, no text, labels, ground, shadow or glow. Do not draw6sprites or2rows. Use a wide3:1 canvas like ref3, approximately2170x725, and give each sprite at least30px side margins.
Frame1: far DARK RIGHT FRONT reaches left/forward, light NEAR LEFT FRONT trails. Light NEAR LEFT REAR trails back/right behind pelvis, dark far rear reaches forward under belly. Same stance as canonical boss idle.
Frame2: light NEAR LEFT FRONT bends and LIFTS while swinging LEFT/forward; light NEAR LEFT REAR bends and LIFTS under hip, both near hooves visibly above ground; dark far legs support. This is a passing step.
Frame3: light NEAR LEFT FRONT stretched far FORWARD, diagonal down-left, hoof LEFT of shoulder. Light NEAR LEFT REAR stretched FORWARD UNDER BELLY, hoof LEFT of pelvis. Dark FAR FRONT and REAR trail BACK to screen-right. This is just BEFORE landing of the already approved ref3 leftmost pose, so the near front/rear hooves are extended forward and slightly lifted by about10px relative to that landing pose. The NEAR front leg is EXTENDED, not bent up; large near rear hoof under belly, not rightmost rear foot.
Prioritize preserving normal boar's EXACT pose silhouettes over following the idle legs. Never freeze rear legs. Exactly4 natural furry legs, proper darker far-leg occlusion, no extra feet. Same heavy steady WALK as reference1, not run/crouch/charge.
```

## 前半2コマ目の脚の持ち上げ（採用）

参照: `motions/idle/idle-01.png`

原画: `source/boss-boar-move-frame2-generated-v1.png`

```text
Use case: precise-object-edit. EDIT this ONE Boss Boar sprite into the near-left-leg PASSING step of a regular WALK. Keep the whole upper body/head/tusks/mane/tail/shoulder scar/palette/crisp pixel style and left-facing camera unchanged. Actual transparent background, ONE full sprite with generous padding, no floor/shadow/text.
Change ONLY the two LIGHTER NEAR legs below the shoulder and hip:
NEAR LEFT FRONT: bend its elbow and lift hoof UP and slightly FORWARD under shoulder toward screen-left, roughly x215,y250 in the input's480x320 coordinate system.
NEAR LEFT HIND: flex thigh/hock and lift its hoof HIGH under the rear hip and slightly forward beneath belly, roughly x345,y253 in input coordinates, instead of far-right/back x385,y292. This large light hindhoof must be OFF the ground, clearly visibly lifted.
Leave BOTH DARKER FAR legs PLANTED and unchanged: right front supports at front-left, right hind supports forward under belly. These two dark legs carry body. Exactly4 legs, only near pair raised. Preserve original torso height, body length and head position, no rearing/charge/jump/crouch. Remove old near hoof positions completely, no fifth hoof. Match exact reference fur darkness.
```

## 前半3コマ目の接地直前 v1（接続不良のため不採用）

参照: `source/boss-boar-move-frame4-reference.png`

原画: `source/boss-boar-move-frame3-generated-v1.png`

```text
Use case: precise-object-edit. EDIT this ONE Boss Boar walking pose, which is the near-left pair forward/landing pose. Keep head, tusks, mane, torso, scar, tail, colors, proportions and ALL FOUR LEGS' FORWARD/BACKWARD ORDER EXACTLY unchanged.
Change ONLY the TWO LIGHTER NEAR hooves and lower legs: raise the already forward-extended NEAR LEFT FRONT hoof by about20pixels and raise the forward-under-belly NEAR LEFT HIND hoof by about20pixels, relative to the723x725 reference, with only subtle joint flex. This is JUST BEFORE these two extended near hooves land. Keep both NEAR legs stretched diagonally DOWN-LEFT/FORWARD as they already are, NOT bent up under body. Near rear hoof remains far LEFT of hip, under belly. Keep the two DARK FAR front/rear hooves planted at original positions carrying body.
Never swap the leg pair: big light near foreleg is the long forward diagonal from shoulder to far-left forehoof; far dark foreleg trails behind. Big light near hindleg reaches left/forward under belly; far dark hindleg trails behind screen-right.
Keep exact silhouette/pose except these small20px hoof lifts, same body height and pixel art, actual transparent background,ONE sprite,no ground/shadow/labels, full padding around sprite.
```

## 3・4コマ目の脚の付け根の修正（採用 v2）

通常イノシシの同じコマと比較すると、旧ボスの肩の毛束が途中で終わり、前へ伸びた脚が胸の下から出て見えました。手前の前脚を肩から蹄まで、後脚を腰から蹄まで一続きの輪郭に描き直しています。コードでは脚を描画・合成していません。

### 4コマ目

参照: `source/boss-boar-move-frame4-reference.png`（編集対象）・`../boar/source/boar-move-frame4-generated-v1.png`（脚の接続と姿勢）。

原画: `source/boss-boar-move-frame4-generated-v2.png`

```text
Use case: precise-object-edit.
Image1 is the EDIT TARGET: one pixel-art Boss Boar walking pose. Image2 is the normal boar's correct walking pose, the mandatory anatomical reference.
Repair the entire two LIGHT NEAR LEFT limbs in image1, from their origins at SHOULDER and HIP all the way to their hooves. The current light foreleg looks detached: the big scarred shoulder hangs down separately while the diagonal leg emerges from under the neck. Make the scarred shoulder CONTINUE directly into one broad uninterrupted upper foreleg bending DOWN-LEFT/FORWARD, tapering to a lower foreleg and the large front-left hoof. Follow image2 exactly: shoulder, elbow and forehoof form one continuous, clearly readable limb. Remove the current dangling shoulder stump and misleading black gap between upper and lower foreleg; reconnect/recontour the bottom of that shoulder mass into the forward diagonal. The DARK FAR RIGHT foreleg stays BEHIND that continuous light leg, planted further right beneath the chest. Do not swap the near and far legs or leave the shoulder connecting to the far hoof.
Likewise make the light NEAR LEFT HIP round thigh continue visibly into the forward-under-belly hindleg and its large hoof, with a natural bent hock as in image2. The DARK FAR RIGHT hindleg extends backward/right behind it. Exactly four naturally articulated continuous legs, no stray stumps, disconnected shafts, fifth legs or doubled joints. This is frame4: NEAR pair reaching FORWARD toward screen LEFT and landing, FAR pair trailing back/right; heavy normal walk, not charge or crouch.
Keep ALL upper body/head/tusks/mane/ear/scar/tail, camera, boss size, palette and chunky pixel-art texture of image1 unchanged. Preserve the boss's scarred massive shoulder but change its LOWER EDGE as needed for the correct limb articulation. Near limbs are lighter, far limbs distinctly darker and partially occluded. No thin sticks, no outlines drawn across the connected limb at its shoulder or hip. Preserve the exact body position and hoof locations except subtle changes necessary for proper connection. Single full sprite, generous margins, actual transparent background. No text, ground, shadow, checkerboard or labels. Return the edited BOSS only.
```

### 3コマ目

参照: `source/boss-boar-move-frame4-generated-v2.png`（接続修正済みの編集対象）・`../boar/source/boar-move-frame3-generated-v1.png`（接地直前の姿勢）。

原画: `source/boss-boar-move-frame3-generated-v2.png`

```text
Use case: precise-object-edit.
Image1 is the EDIT TARGET: anatomically corrected pixel-art Boss Boar walking frame4. Image2 is the normal boar's frame3 gait reference.
Create the immediately preceding frame3 of this SAME boss. Keep image1's upper body, head, eye, huge tusks, mane, ears, scar, torso, tail, proportions, exact colors and chunky pixel art unchanged. Preserve its newly corrected four-limb anatomy: the scarred light NEAR LEFT shoulder flows continuously into the big diagonal forward foreleg, and the big light NEAR LEFT hip flows continuously into the diagonal forward-under-belly hindleg. NO dangling shoulder stump, NO disconnected lower leg, NO separate upper and lower limb islands, NO swap of leg sides.
Change only the light NEAR LEFT FRONT and light NEAR LEFT HIND limbs by slight joint flexion to raise both already forward-extended hooves just BEFORE landing, about35pixels relative to image1's approximately1326x1185canvas. Keep these two limbs reaching forward toward screen LEFT, not tucked underneath the body. Same reach/phase as image2. Both DARK FAR RIGHT legs remain planted, trailing back/right, carry weight and are partially hidden behind the near pair. Near/far ordering unchanged, exactly4legs. Keep the shoulder-to-forehoof and hip-to-hindhoof continuity fully visible.
Do not shorten or disconnect the upper legs while lifting the hooves. The anatomical shoulder root stays at the bottom of the scarred shoulder and blends into the same lighter forward limb. Forehoof lifts a small amount, not a high bent-up passing step. Rear hoof also remains forward under belly and slightly lifted. Single full sprite in place on transparent background with safe padding, same torso height and pose as image1, no labels, no floor, no shadows, no glow.
```

修正前の出力は `source/walk-before-root-fix/move-03.png`・`move-04.png` に保存。1・2・5・6コマ目の画素はこの修正で変更していません。

