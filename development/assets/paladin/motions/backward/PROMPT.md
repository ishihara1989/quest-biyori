# パラディン後退 8相再制作 2026-10-06

生成方法: 組み込みimage_gen、transparent_background=true。採用source/paladin-backward-generated-v7.png（4×2）、旧v1〜v6保持。

## v4 初回8姿勢（相の誤りのため不採用）

```text
Use case: identity-preserve.
Asset type: exact eight-frame pixel-art BACKWARD guarded walk cycle spritesheet for the existing RPG paladin.
Input image 1 is the existing backward motion sheet EDIT TARGET; input image 2 is approved idle design. Redraw the eight leg phases and a protective retreat posture. Do not inherit the erroneous old leg order.
One transparent RGBA image EXACT 4 columns by 2 rows, read left to right top row 1 2 3 4, bottom row 5 6 7 8. Eight original full-body centered drawings with all hair, mace, shield and boots inside equal cells and wide transparent margins. No words or numbers.
Same chibi golden ponytail female paladin with white bow, blue eyes, detailed silver armor gold trim, navy white gold cape and tabard, silver gold boots, silver kite shield gold cross on screen RIGHT hand, spiked silver mace low screen LEFT in opposite hand. Lock hands, face, hair, design, scale, waist x, camera and all equipment. Fixed right-facing three-quarter camera throughout.
Retreat in-place toward screen LEFT while looking alertly RIGHT. Slight crouch and weight back; keep large shield lifted to protect chest and neck directly in front of her, mace close and low. Small controlled cautious steps, not forward confident walk, no turning face left.
LEFT leg L is ALWAYS CAMERA-NEAR; RIGHT leg R is ALWAYS CAMERA-FAR, even when their screen x coordinates cross. L remains the foreground leg coming from visible ornate camera-near hip plate. R stays behind tabard. Crossing is L occludes R in ALL passing frames. Boots always point RIGHT, even the foot at screen left. Never swap leg depth or equipment identity. Only exactly two legs.
Eight continuous SMALL-STRIDE phases (left foot forward at1, right foot forward at5), near-floor low passing poses:
1 L NEAR extended a short distance to right/front, heel touching floor; R FAR short distance left/rear, toe touching floor heel up.
2 L NEAR planted front foot moves toward under body and bends to bear weight; R FAR lifted slightly from rear moves toward hip BEHIND L.
3 L NEAR support planted under hip; R FAR boot passes low BEHIND L ankle with almost identical ankle x. Narrow silhouette, near leg clearly hides part of far leg.
4 L NEAR trails a small distance left/rear with heel rising; R FAR reaches low right/front toward contact.
5 R FAR heel contact a short distance right/front; L NEAR short distance left/rear toe contact with heel up. Opposite foot contact versus1, depth never swapped.
6 R FAR support moves from front toward body; L NEAR foot rises slightly from rear and travels toward hip IN FRONT OF R.
7 R FAR support beneath hip; L NEAR boot passes low IN FRONT OF R ankle, ankles almost same x. Narrow silhouette, near boot occludes far support boot.
8 L NEAR stretches to right/front just before frame1 heel contact; R FAR travels left/rear with heel lifting. 8→1 continuous foot trajectory and same depth.
Draw 3 and7 visibly overlapping ankles under body, not wide split legs or high knees. Short walk amplitude compared to normal forward walk. Feet move in smooth low arcs, no disconnected feet or X twisted knees. Upper body and shield steady, waist x locked, subtle tiny bob only. Ponytail/cape small flow. Crisp richly shaded game pixel art match idle reference. True alpha transparent background including gaps, no floor, shadow, glow, brown matte, checkerboard, labels, extra limbs, weapon flips, mirrored camera, duplicate poses.
```

## v5 正しい前進8相から防御後退へ編集

```text
Use case: precise-object-edit. Image1 is CORRECT eight-phase paladin FORWARD walk. Use it as EDIT TARGET, keeping its ordered left/right leg identities and all8 continuous phases. Convert all eight into a new CAUTIOUS BACKWARD RETREAT motion. Image2 is the previous guarded retreat posture reference. Image3 is leg phase/occlusion guide only.
Output one transparent RGBA sheet EXACT4columns×2rows, chronological1..8. Every figure same body size, waistx fixed, fixed3/4 rightfacing camera, hair/face/head proportion equal.
Paladin same golden ponytail whitebow, blueeyes, silvergold platearmor, navywhitegold cape/tabard, shield silvergoldcross same hand SCREENRIGHT, mace low SCREENLEFT samehand. Keep every equipment contour and side.
Retreat toward screenLEFT while watchfully facingRIGHT. Raise kite shield to protect chest and neck in front of her; tuck body slightly behind it, lean weight backward subtly with crouchedknees, mace closer/low. Short cautious step amplitude20% shorter than image1, small low foot lift, never turn her headleft. This must look defensive guarding, not confidentforward.
CRITICAL preserve image1's corrected8phase lowerlegs. Left L ALWAYS CAMERA-NEAR with foreground ornate hip/knee armor. Right R ALWAYS CAMERA-FAR behindtabard. Near leg always occludes far at crossing; horizontal positions can change but depth never changes. Both boot toes ALWAYS RIGHT in all8 including rearboots.
1 LEFT NEAR forward/right heelcontact, RIGHT FAR rear/left toecontact.
2 nearL travels backward towardbody bearingweight, farR boot lifts LOW from rear towardbody.
3 nearL groundedsupport vertically underhip; farR LOW boot passes BEHIND nearL ankle at nearly samex, partially hidden. Narrow footcluster.
4 nearL knee/shin/boot moves LEFT/rear (visible near knee LEFT of tabard), farR boot reaches low RIGHT/front. This must retain image1's4 oppositeleg arrangement, not nearfront.
5 farR heelcontacts RIGHT/front; nearL shin downLEFT/rear toecontact, visible near knee LEFT of tabard. Oppositeleg contact versus1. Keep image1's5 configuration.
6 farR frontfoot supports towardbody; nearL rearfoot lifts low and moves towardbody, near knee still LEFT of tabard. Do not make nearleftleg forwardat6.
7 farR groundedsupport underhip; nearL swingboot passes LOW IN FRONT of farR ankle, slightly above ground and almostsamex, nearboot occludes farboot.
8 nearL extends low RIGHT/front justbefore1heelcontact; farR moves LEFT/rear heelraising. Smooth8to1.
Keep exact same lowerleg sequence/occlusion as image1 with shorterstep, do not repeat firsthalf in secondhalf. Boots silvergold consistent right-facing profiles and armor remains on same leg. Steady torso/hips and subtle small bob, ponytail/cape restrained flow. Fullbody including shield/mace/hair/feet complete in each equalcell with minimum12% realtransparentgutters. Pixelstyle crisp rich darkoutlined like references, no background/brownmatte/checkerboard/floorshadow/effects/text/labels/gridlines or additionallimbs.
```

## 5/6 個別2枚の左右脚修正

```text
Use case: precise-object-edit. Image1 is ONE correct paladin cautious backward guarding pose. Its NEAR LEFT knee/shin is REAR/LEFT of white tabard, and FAR RIGHT shin is front/right. KEEP this correct legdepth and configuration. Image2 shows ONLY phase5/6 skeleton (green=nearLEFT, blue=farRIGHT). Do not color character legs green/blue.
Generate EXACT TWO fullbody original drawings side by side in ONE WIDE transparent2-column1-row spritesheet. LEFT = phase5 contact. RIGHT = phase6 low rear-near lift. These are consecutive opposite-contact phases. Both have the NEAR LEFT knee LEFT of tabard, not forward.
Same upperbody in both as image1: watchfully facingright, shield raised at chest/neck screenright, mace lowclose screenleft, goldenhair whitebow, blueeyes, silvergoldplatearmor, navywhitegold cape/tabard, fixed right3/4camera, identical character size, head/face, waistx, full equipment contours. Wide transparent margins including complete shieldright edge.
LEFT CELL / PHASE5:
Expose foreground ornate LEFT knee on LEFT OF TABARD. Near knee/shin slopes diagonally DOWN-LEFT to REAR boot left of pelvis, heelup/toe grounded, toesRIGHT. This near leg is IN FRONT depth even though rearleft in screenx. Far RIGHT knee is behind tabard, far shin slopes downRIGHT to FRONT boot right of pelvis, heelcontact/sole on floor, toesRIGHT. Follow guide5. Near shin must go DOWN-LEFT, never down-right. Keep same configuration as image1 with a slightly fuller short stride.
RIGHT CELL / PHASE6:
Near ornate LEFT knee stays LEFT OF TABARD; near shin bends down-left from knee with rearboot lifted LOW and moving toward body, anklejustLEFT of pelvis and little ABOVE floor. Far RIGHT frontsupport shin from behind tabard slopes slightly down-right and its boot planted forward/right moving towardbody. Follow guide6. Near knee LEFT of far knee, not moved forward/right. Smaller footspread than leftcell. Natural modest low rear lift, nohighkick.
All silvergold boot sideprofiles faceRIGHT. Two legs perfigure. Keep all identity/armor/kneeplates on same legs. Near L always occludesfarR. True alpha transparent outside both sprites and gaps. No text/numbers/gridline/shadow/floor/background. Do not turn camera or mirrorcharacter.
```

## v7 全8コマの顔/装備/ピクセル画風統一

```text
Use case: identity-preserve. Image1 is CORRECT eight-phase paladin defensive BACKWARD retreat sheet. Preserve all8 exact leg poses, contacts and occlusion. Image2 approved idle identity reference. Normalize character/pixelart consistency ONLY.
Output exact4columns×2rows transparent RGBA eight-frame sheet1..8. Do not alter lowerleg spatial geometry or replace5/6 with nearleg-front. Keep correct nearL/rightR identities:
1 nearLEFT front/right grounded, farRIGHT rearleft.
2 nearL support returning underbody, farR lowlift behind.
3 nearL groundedsupport underhip, farR low passes BEHIND nearL sameanklex.
4 nearL rearLEFT shin downleft, farR boot frontRIGHT.
5 nearL rearLEFT with exposed knee LEFT OF TABARD, farR frontRIGHT planted. Oppositeleg to1.
6 nearL exposed knee still LEFT OF TABARD, nearrearboot lowliftleft, farR frontsupportright. Do not put nearL knee onright/front.
7 nearL boot lowpasses IN FRONT of farR groundedsupportboot, samex/partialocclusion.
8 nearL frontRIGHT justbefore1heelcontact, farR rearLEFT. Continuous8to1.
CameraNEAR L always occludesFAR R; legdepth never swaps. Boots ALL toes faceRIGHT, low swing, no highkick. Exactly two legs. Upperbody cautious backward guard leaning slightly back, RIGHT-facing alert gaze, shield raised chest/neck on right samehand, mace close lowleft samehand. Short controlled stride.
Specifically correct the newer5/6 cells' painted rendering and slight face/head differences to match the OTHER6 cells' rich crisp detailed PIXELART. Unify face, eyes, hair goldenpony with whitebow, anatomy/headsize/waistposition, silvergoldarmor, navywhitegoldcape/tabard, and identical equipment silhouette. Preserve shieldguard pose all8. Do not shift stance or legs while correcting surface rendering, palette clusters and crisp stepped dark outline. Same wholebody size acrossall8, tinybob only, no lateralwaistrock. Hair/cape slight consistent secondarymotion.
Generous transparent gutters, whole kite shield and mace and hair and both boots inside cells. True alpha outside silhouettes/limbgaps. No labels/text, background, checkerboard, floor/shadow/glow, palettecoloredguide, smoothpainting, extralimbs. Preserve ordered eight distinctposes and alternating supportlegs.
```

