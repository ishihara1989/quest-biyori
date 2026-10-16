# パラディン 前進 8相再制作 2026-10-06

生成方法: 組み込み image_gen、transparent_background=true。旧原画保持。

採用source/paladin-forward-generated-v10.png（4×2）。中間v9はv8の1/2/3/8とimage_gen個別編集4/5/6/7を比例最近傍で同サイズへ再配置、その後v10で顔/体格/装備/画風のみ全8統一。姿勢のコード再描画・複製・補間なし。

## v5 全8姿勢

```text
Use case: identity-preserve.
Asset type: exact eight-frame pixel-art forward walk cycle spritesheet for an existing RPG paladin.
Input image 1 is the existing motion sheet, an EDIT TARGET and identity/style reference. Image 2 is the approved idle paladin design reference. Redraw the eight poses, especially ALL leg motion. The old sheet's leg sequencing is WRONG; do not reproduce its leg sequence.
Produce one transparent RGBA image in an EXACT 4 columns by 2 rows grid, read left to right top row frames 1 2 3 4 then bottom row frames 5 6 7 8. Eight equally sized centered full-body sprites with ample transparent gaps and margins, no clipping. No text or numbers.
Subject: same chibi female paladin, long golden ponytail with white bow, blue eyes, silver plate armor with gold trim, navy and white cape, white gold-cross tabard, silver boots with gold edging, mace low behind her body on screen left and silver shield with gold cross on screen right. Keep weapon hand, shield hand, outfit design, hair, face, anatomy, body size, fixed 3/4 right-facing camera, and identical waist x coordinate in every frame.
CRITICAL leg identities: Anatomical LEFT leg L is ALWAYS CAMERA-NEAR. Anatomical RIGHT leg R is ALWAYS CAMERA-FAR. Do NOT exchange near and far leg identities at half-cycle. These labels describe depth, NOT screen x. Near L always occludes far R at crossing. Both boot toes point RIGHT in ALL eight frames, including rear foot. They must never face camera or left. Silver knee plates and boots must remain attached to the same legs.
The left leg moves from front (screen right) in frame 1 backward to rear (screen left) in frame 5; then swings forward back to frame 1. The right leg does the opposite. Draw a natural flowing low walking cycle with a real passing/crossing pose at frames 3 and 7. No high knee kicks, no twisted X-shaped knees, no dragging sideways foot, no random gait.
FRAME 1: L CAMERA-NEAR leg extended forward/right, left heel on ground, L shin and boot clearly visible in front; R CAMERA-FAR leg extended backward/left, rear toe on ground behind L. This is left contact.
FRAME 2: planted L moves from front toward body; R lifts very slightly from rear and swings toward body behind L.
FRAME 3: L CAMERA-NEAR SUPPORT boot planted directly beneath hip; R CAMERA-FAR SWING boot passes LOW BEHIND L ankle, ankles nearly same x with clear L-over-R occlusion, toe close to floor. Both legs clustered under body.
FRAME 4: L moves behind body/left with heel rising; R swings forward/right from under body, low toe extends.
FRAME 5: R CAMERA-FAR leg extended forward/right with heel contact; L CAMERA-NEAR leg extends rear/left with raised heel and toe contact. This is opposite contact. Near leg remains near despite being behind in x.
FRAME 6: planted R travels back from front toward body; L raises slightly from rear and swings forward in front of R.
FRAME 7: R CAMERA-FAR support boot planted beneath hip; L CAMERA-NEAR swing boot passes LOW IN FRONT OF R ankle with same x and clear L-over-R occlusion, low toe. Both legs clustered under body.
FRAME 8: L CAMERA-NEAR extends forward/right, heel just above floor very near frame 1 position; R CAMERA-FAR moves rear/left heel rising. Smooth frame8 to frame1 heel-touch continuation, not a reversed depth pose.
Continuous evenly spaced gait phase progression. Frames 1 and 5 opposite legs forward. 3 and 7 narrow silhouette with ankles almost overlapping, not wide stances. Keep hips at same x, subtle 1-2 pixel vertical bob, no lateral body rocking. Shield and mace remain steady with minimal sway, ponytail and cape tiny secondary movement. Pixel art crisp stepped edges matching reference, no blur, no floor shadows or background. Each pose separate original drawing, no duplicate poses.
```

## v6 下段修正

```text
Use case: precise-object-edit. Edit this 4 columns by 2 rows eight-frame paladin sprite sheet. Preserve character, palette, pixelart, camera, face, torso, hair, equipment and the entire first row. Correct ONLY legs in bottom row, mainly frames5 and6: the current frame5 is wrong, again shows camera-near leg forward. It MUST be opposite.
Camera-NEAR left leg originates at visible silver/gold hip on screen-left side of pelvis. In FRAME5 (BOTTOM LEFT), draw this NEAR leg diagonally DOWN-LEFT to a rear boot at screen-left, heel lifted/toe down, toes still right. Its knee armor sits on screen-left side of body; near shin overlays the farther leg behind. The FAR right leg from behind tabard extends DOWN-RIGHT to front heel contact with the boot on screen-right. This FAR boot is behind the near leg in depth but is farther right in x. Near knee is LEFT of far knee, unlike first frame where near knee is RIGHT and reaches forward. Both foot tips always right.
FRAME6 (BOTTOM ROW COLUMN2): FAR support front/right leg travels toward center, NEAR leg boot lifted slightly at rear/left and moving forward. Near knee stays left of far knee, clear continuous step after5.
FRAME7 (BOTTOM ROW COLUMN3): FAR leg supports on ground under hip; NEAR left boot swings low in FRONT of far ankle with ankles almost same x. Narrow passing.
FRAME8 (BOTTOM ROW COLUMN4): NEAR leg extends front RIGHT exactly approaching the frame1 boot position; FAR leg trails back LEFT, heel lifted, so8→1 continuous.
Top row legs remain unchanged; bottom row hip/waist x must stay equal to top row. No depth swap. First and fifth MUST show opposite legs in front. Do not simply alter boot angle while keeping same front knee. Full RGBA transparency, no brown background or glow, no floor, no shadow. Preserve 4×2 grid and ample cell gaps.
```

## v7 4/6と交差修正（不採用）

```text
Use case: precise-object-edit. Correct ONLY the leg sequence in this paladin 4-column 2-row sheet, preserving full upperbody, shield, mace, hair and grid.
REQUIRED fixed leg tracking: near LEFT leg is attached to the big foreground hip/knee armor. Its SHIN ANGLE must travel continuously from pointing down-right in frame1, vertical in3, pointing down-LEFT in5, vertical in7, down-right in8. Far RIGHT leg does opposite and stays behind. First and5 are opposite. This tracking applies to both knee AND shin, not just boot tips.
KEEP FRAMES1 and8: near L shin points down-right and far R trails left.
KEEP FRAME5's near shin pointing DOWN-LEFT, but turn rear near boot toe RIGHT, profile silver boot; current boot faces viewer. Far leg stays down-right contact behind.
FIX FRAME2: near L shin still slightly down-right, but less than1, near boot under right edge of pelvis; far R boot moves from left toward center just behind near boot, low lifted. 
FIX FRAME3 (TOP ROW COLUMN3): near L shin vertical and near boot under hip; far R shin/boot passes immediately BEHIND near boot at ALMOST SAME X, partly occluded by near calf. Low swing boot, ankle gap less than half boot width. Not two separated ground feet.
FIX FRAME4 (TOP ROW RIGHT): reverse the present wrong shin angle. Near L knee and shin now extend DOWN-LEFT from hip toward rear/left boot with heel up, not forward. Far R shin stretches DOWN-RIGHT from behind tabard to low swinging forward/right boot. This is the approach into frame5; left near leg is already behind body.
FIX FRAME6 (BOTTOM ROW COLUMN2): near L knee and shin still on LEFT/rear side, but a smaller down-left angle than5, rear boot starts low forward swing, heel raised and toe right. Far R support shin from behind tabard points slightly down-right, boot forward/right planted. DO NOT put near knee on right like current frame6; frame6 must follow frame5 smoothly.
FIX FRAME7 (BOTTOM ROW COLUMN3): near L swings low with vertical shin IN FRONT of the far R support shin. Ankles nearly same x, one near boot occludes part of far boot. Far boot supports under hip.
Only leg pose alterations and small tabard occlusion required. Knees not twisted. All boot toes right, no viewer-facing or left-facing boots. Upper body and pelvis x stable. No duplicated drawings. Real transparent alpha, not brown matte. Exact4x2 no text.
```

## v8 共通pose guide参照

```text
Use case: identity-preserve. Edit image1 (4×2 paladin sheet) into a CORRECT 8-frame walking sheet. Image2 is the authoritative eight-phase POSE AND LEG OCCLUSION GUIDE. Image3 is the correct paladin opposite-leg contact pose for frame5 and the correct RIGHT-FACING rear boot shape.
Output EXACT 4 columns×2 rows chronological frames1..8. Completely transparent RGBA outside sprites. Eight entire figures same scale/camera and steady torso/waist position, no clipping.
Preserve image1's upperbody, identity, crisp pixel style, goldenhair, face, silvergold armor, bluewhitecape, whitegoldtabard, shield screenright and mace screenleft. Redraw ALL LOWER LEGS to follow IMAGE2'S POSES EXACTLY.
GUIDE green leg = anatomical LEFT/camera NEAR leg; guide blue leg = anatomical RIGHT/camera FAR leg. Do NOT color paladin legs green or blue; keep silver/gold armor. The near leg ALWAYS occludes far leg when crossing. Always two legs, never exchange knee armor and leg depth.
Important screen geometry from guide:
1: near knee and boot FRONT/right of body; far boot rear/left.
2: near boot slightly right of body, far boot slightly left and low lifted.
3: near support shin vertical beneath hip; FAR boot passing immediately BEHIND near ankle at nearly same x. Overlap feet under body!
4: NEAR knee, shin and boot REAR/left of body; FAR knee and boot FRONT/right reaching. The exposed near knee MUST be LEFT of tabard (current image1's4 is wrong).
5: SAME leg arrangement as IMAGE3: exposed near armored knee and shin point DOWN-LEFT to rear boot; far leg points DOWN-RIGHT to front heel. Near knee LEFT of tabard. Opposite to1. Match guide5.
6: exposed near knee and shin still rear/LEFT of tabard but travels toward body, near boot low lifted; far front/right foot supports. Match guide6. Do not draw near knee right/front.
7: near boot passes low IN FRONT of far support ankle, feet almost overlapping under hip.
8: near leg reaches right/front just before1contact; farleg retreats left, smooth8to1.
ALL BOOT TOES FACE RIGHT, as in image3. Rear boots must be right-facing silverboot sideprofiles, never camera-facing oval toe or backwards. Guide is only skeleton guidance; preserve exact paladin design/outfit.
Very small vertical bob and hair/cape sway; no lateral torso rocking. Frame3/7 must be narrow crossing poses, not wide split legs. Natural armor gait, small step and low toe lift, no high kicks or twistedknees. No text, labels, floor, shadows, colored guide parts, mattebackground, fakecheckerboard, mirroredequipment.
```

## 個別5 靴方向と反対側接地

```text
Use case: precise-object-edit. Input is ONE paladin sprite. Produce ONE fullbody isolated transparent pixelart sprite, keep exact character, right-facing 3/4 camera, silvergold armor, goldenhair, face, shield hand on right, macehand on left, cape/tabard, scale/proportions and torso.
Correct only boot orientation and small leg stance. This pose is correct opposite-leg contact: the NEAR LEFT leg at left hip slopes diagonally down-left to the rear boot; the FAR RIGHT leg from behind white tabard slopes down-right to forward boot. KEEP THIS LEG CONFIGURATION. Do NOT make the foreground near knee right/front. Keep large exposed near knee LEFT of tabard. Near shin slopes DOWN-LEFT, far shin DOWN-RIGHT.
Change leftmost rear near silver boot to SIDE PROFILE with toe extending to screen RIGHT and raised heel at screen LEFT, same style as forward boot, heel up and toe near floor. Current rearboot points camera, fix it to right profile. Keep rightmost forward farboot planted with toe right. Near foot rear at screenLEFT, far footfront screenRIGHT remains. Tiny natural armored walking contact pose, no huge kick, exactly two legs.
No additional poses, no grid, no background, shadow, glow, text. Same pixel cluster style, entirely visible with transparent margins.
```

## 個別4 後方L/前方R

```text
Use case: precise-object-edit. Create ONE edited full-body paladin sprite based on image1. Keep its exact upper body, face, hair, shield screenright, mace screenleft, outfit, camera, body size, detailed pixelart. Image2 is the exact leg pose guide ONLY. Do NOT add guide colors/text.
This is walk phase4, just BEFORE image1's opposite-leg contact. Only change both lower legs to follow image2 EXACTLY.
The LEFT camera-near leg (green in guide, silvergold in character) must stay on screenLEFT side of tabard: visible near armored knee LEFT of white tabard, near shin slopes slightly DOWN-LEFT, near boot at rear LEFT with heel raised and toe pointing RIGHT. This leg remains planted at rear. Do NOT bend this near knee forward to screenright.
The RIGHT camera-far leg (blue in guide, same dark silver armor as character) is mostly behind white tabard and NEAR leg, far boot reaches low to FRONT/RIGHT, heel only just above ground. Near knee is left of far knee; far shin slopes down-right.
At ankle level: NEAR LEFT boot left of pelvis, FAR RIGHT boot right of pelvis. This is opposite to the usual front-near pose. Nearleg occludes far at torso. Both boot toes right sideprofiles. Low modest stride, no high knee.
Output SINGLE fullbody sprite on transparent RGBA, all equipment visible with margins. No panels, no background, no shadow, no text. Preserve image1's core design and rear-near leg arrangement; adjust stride to match guide4.
```

## 個別6 後方L低い蹴り出し

```text
Use case: precise-object-edit. Edit image1 ONE paladin sprite for walking phase6: just AFTER opposite leg contact. Image2 is EXACT new lowerleg pose guide only (green=left/near, blue=right/far); do not put guidecolors into character.
Keep identical character, face/hair, shield/mace, armor/cape/tabard, scale, proportions, upperbody and right-facing 3/4 camera. Both boot toes point right. Only edit LOWER LEGS.
Near LEFT leg has exposed ornate near knee LEFT of white tabard, and shin goes DOWN-LEFT, but rear foot LIFTS LOW and moves toward hip. Shorten rearleg spread from input: near boot ankle slightly LEFT of hip with sole a little ABOVE floor. Near knee must remain LEFT of far knee, not migrate to right/front. Far RIGHT leg behind tabard supports at right/front with rightpointing boot planted, shin slightly down-right. This stance is one eighth after contact frame5: far front foot approaching body, near rear boot raised entering forward swing. Narrower stride than image1, no high kick.
Nearleft leg remains camera foreground, partially obscures far leg at upperthigh. Guide6 position must be followed, especially near green knee is to LEFT, not right. Keep all equipment and upperbody, gently adapt cape bottom only for occlusion.
Output SINGLE fullbody transparent RGBA sprite with margin, not a sheet. No guide text/colors, floor, shadow, background, labels, extra limbs.
```

## 個別7 R支持/L手前通過

```text
Use case: precise-object-edit. Output ONE fullbody paladin sprite, same identity, character palette, pixelart, size/proportions, face/hair, silvergold armor, cape/tabard, shield screenright and mace screenleft, right-facing3/4 camera.
Image1 character edit target. Image2 authoritative skeleton for phase7 only. Do not copy guidegreen/blue colors or text.
Change LOWER LEGS ONLY to correct second passing phase:
RIGHT FAR leg (guideblue, character darksilver) supports on ground DIRECTLY BELOW HIP, mostly hidden BEHIND near calf. Its boot sole is lowest and grounded, toeRIGHT.
LEFT NEAR leg (guidegreen, character ornate silvergold with exposed kneeplate) swings LOW IN FRONT of far support shin. Near knee slight forward/right, near ankle just a few pixels ABOVE farankle, boots overlap almost same X beneath hip. Near silvergold BOOT partially OCCLUDES the far darksilverboot, but near sole is slightly ABOVE floor, not the grounded support foot. The rear leg must not hang lifted behind as current image1. Farboot planted under hip; nearboot just in front/right and lowraised. Exactly two legs and no wide stance.
Both shoe tips faceRIGHT in sideprofile, never face viewer. Nearleft leg remains foreground with visible ornate kneeplate, far leg alwaysbehind. This is low natural passing, not highknee or kneeX. Keep upperbody steady and waistposition identical, equipment intact. Whole figure isolated true transparency, no panels/background/floor/shadow/text.
```

## 個別4/5/6/7 盾外縁・透明余白修復

```text
Use case: precise-object-edit. Four supplied paladin drawings require CANVAS / OUTER SHIELD EDGE REPAIR ONLY. Their legs now have the correct individual gait phases. Preserve these exact leg arrangements; DO NOT change lowerleg pose, shift knees, mirror poses, or turn boots. Keep precise character face, hair, armor, cape, mace, shield design.
Create ONE square 2×2 contact sheet of these FOUR EXISTING sprites, with each sprite reduced evenly to fit comfortably in its cell and wide transparent margin ALL SIDES. Input1 TOP LEFT; Input2 TOP RIGHT; Input3 BOTTOM LEFT; Input4 BOTTOM RIGHT. All the same body scale and character proportions. No stretching.
Restore the clipped outside RIGHT EDGE of each shield: complete gold outline and dark contour to the natural rightmost curved shield border. Entire kite shield, mace, hair and feet must be fully present inside each cell with at least10% transparent gutter. This is the only drawing change.
Top-left input1: near ornate knee and shin rear-left, far shin front-right. Keep.
Top-right input2: near ornate knee and shin rear-left, far shin front-right. Keep.
Bottom-left input3: near leg rear-left, low lifted rearboot, far frontfoot planted. Keep.
Bottom-right input4: near silverboot passing just IN FRONT and ABOVE the far grounded boot under hip, partially overlapping. Keep.
All boots point screenRIGHT. Do not change legdepth or armor-side. Keep all four drawings DISTINCT as input. Preserve fullbody and right-facing3/4 camera. True transparent RGBA outside sprites including between cells. No text, numbers, gridlines, background, floor or shadows.
```

## v10 全8コマの人物一貫性と装備修復

```text
Use case: identity-preserve. This image1 is a completed, CORRECT eight-phase paladin walk sheet. Normalize character art consistency ONLY. Output same transparent RGBA exact4-column2-row sheet, same eight foot poses in same order. Image2 is approved idle identity reference.
Preserve EXACT LOWERLEG GEOMETRY of all eight cells! Near LEFT leg forward at1, travels towardbody2, support underhip3 with farRIGHT swing behind, nearLEFT rear-left at4/5/6 with farRIGHT front-right, nearLEFT low passing IN FRONT of grounded farRIGHT at7, nearLEFT reachesfront at8. Do not replace4/5/6 with a near-front pose. Do not swap depth. Never redraw all eight as same leg forwards.
Correct consistency of HEAD, FACE, HAIR, TORSO, SHOULDER ARMOR, SHIELD, MACE and cape STYLE/SIZE across8. First3 and8 currently differ slightly from individually edited4/5/6/7 in head/waist proportions. Use idle identity as fixed proportions, rich pixelart, exact face, long golden ponytail, whitebow, silver armor gold trim, navywhitegoldcape/tabard. Camera and headangle identical. Both weapon hands fixed: shield screenRIGHT, mace low screenLEFT. Keep full contours.
Steady centered torso/waist x coordinate in every cell, headsize identical and tiny bob only. Fix all boot shapes to consistent silvergold right-facing profile; ALL toe tips point RIGHT, including boots behind hip. Do not change feet spatial positions and near/far occlusion. Preserve original leg trajectories and separate poses.
All full sprites inside equalcells with generous transparent gutter at least10%, not clipping. True alpha everywhere outside sprites and limb gaps. No background, floor, shadow, labels, gridlines, extra limbs, smooth painting, palette alterations or resizing per-frame. The eight poses must stay distinct.
```

