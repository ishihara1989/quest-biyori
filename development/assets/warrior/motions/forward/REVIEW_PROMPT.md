# 再制作：足のIDと8相の固定

## 7 コマ短文リトライ

2 枚参照の編集が network error で画像を返さなかったため、元セル 1 枚のみで再試行。

```text
Edit only the far dark lower leg and its leftmost boot in this warrior sprite. Move this far ankle and boot to the RIGHT so the far ankle is exactly behind the near bright ankle, nearly overlapping x positions. Far supporting boot should be almost hidden behind the near boot, with a narrow dark sole showing 3 pixels lower. Keep near bright frontal kneeplate and near boot in front. Low natural walking passing phase, no high knee. Preserve the entire upper body, face, hair, brown armor, both hands, sword and same pixel rendering. Every toe points right. Two legs. Full transparent sprite with generous margins, no background/shadow/text.
```

## 7 コマ：奥側支持脚を寄せる編集

近側 L は正面の明るい膝板から右靴へ連続している。奥側 R の暗い左靴が離れたので、支持 R を近 L の真後ろへ寄せる。元セルと共通ガイド 7 の切り出しを参照。

```text
Use case: precise-object-edit. Input1 edit target single warrior passing frame7; input2 exact passing geometry guide. Preserve entire head/hair/face/torso, sword held bothhands, thighs, NEAR bright frontal kneeplate, scale, pixel style. Change ONLY FAR dark rear lower leg and FAR boot currently separated on screen LEFT. Its shin/ankle/boot must move RIGHT until its ankle is directly BEHIND the near bright shin/ankle/boot on screen RIGHT, with almost SAME ankle x. Current FAR boot on left is too far left. Move that FAR dark boot under the pelvis behind the bright near boot. Preserve NEAR left leg's bright large kneeplate, shin and right-facing boot; near LEFT now low passing in front of far RIGHT. FAR RIGHT is planted support mostly OCCLUDED behind near boot, only a small dark sole/heel visible 3px lower and 3px left of near heel. No large left-right boot separation. FAR shin should stand approximately vertical UNDER HIP behind the near bright shin, NOT angle backward to left. Match guide ankle nearly exact overlap. No high knee, kick, twisting X knee or third leg. Near left boot 3px lifted, far right supporting boot toe right just below. All boot toes point right. Retain actual brown armor/buckles/tabard and original camera, proportions and sharp pixel medium. No guide colors/text, no background/shadows, true transparent alpha. Full figure, complete sword and hair, generous margins.
```

## 1 コマ編集 v1（不採用）

元セルのみでは近側太腿の方向が残ったため不採用。

```text
Use case: precise-object-edit. This single transparent pixel art warrior is an edit target. Change ONLY the two legs below the pelvis to the opposite stance. Preserve exactly her brown ponytail, head/face, brown armor, tabard, two hands holding huge silver sword diagonally up-right, pixel rendering and proportions. The camera-near LEFT leg currently extends REAR to screen LEFT: reverse its direction so its exposed thigh with large silver square buckle, broad knee plate, shin and boot now all extend FRONT to screen RIGHT. LEFT boot should plant at x320, y405 relative to this 466x443 image. LEFT thigh/knee are in FRONT of the right leg at every overlap. Camera-far RIGHT leg currently extends FRONT to screen RIGHT: move this leg behind to screen LEFT, its boot at x120,y400, heel slightly lifted, toe right. Two intact knees and legs, never just swap decorations. Keep camera angle identical. Both boot toes still RIGHT. LEFT is the camera-near front/right leg, RIGHT is camera-far rear/left leg. Natural relaxed grounded walk contact pose, not high kick. All upper body stays exactly unchanged, same position and scale. Full complete figure and sword, generous transparent margin, true transparent background. No extra objects, grid, labels, effects or ground.
```

## 1 コマ編集 v2

元セルと、共通ガイドの 1 のみを切り出した参考画像。

```text
Use case: precise-object-edit. Input image 1 is warrior edit target, input image2 is the SINGLE required new leg pose. Repose ONLY the legs into exactly image2 geometry. Keep target upper body face, sword, hair, hands, colors and pixel medium unchanged. In image2 GREEN represents camera-near LEFT leg, BLUE camera-far RIGHT leg. Render these legs in the original BROWN armor palette, NEVER copy green/blue colors or labels. The near LEFT thigh emerges in front from left hip and slopes DIAGONALLY DOWN-RIGHT across front of her body, LEFT knee forward on right side and LEFT shin/boot on RIGHT side in front. LEFT boot points right and plants in FRONT/RIGHT. The far RIGHT leg slopes DIAGONALLY DOWN-LEFT behind, RIGHT knee rear on left side, RIGHT shin/boot rear on LEFT side, partly hidden under skirt. RIGHT toe still right. Current near leg slopes down-left; that is WRONG and must reverse. This new pose is opposite to input1: near brown leg front/right, far brown leg rear/left. Bring near thigh and near knee visually IN FRONT of hanging center tabard at overlap, tabard behind near thigh. Do not mirror body, swap clothes between legs, redraw torso or copy input1 legs. Full complete character matching exact same identity and same rendering, true transparent alpha, no background/shadow/text/diagram. Camera unchanged, two anatomically plausible legs, low natural stride.
```

## 2 / 8 コマ生成 v1

1 コマ v2 と、共通ガイドの 2 / 8 を切り出して並べた参考画像。切り出しと並べ直しのみで姿勢の再描画はしていない。

```text
Use case: identity-preserve. Asset type: two transparent pixel-art animation poses of same warrior, exactly TWO columns in ONE row. Image1 is approved exact new LEFT-front contact pose: near LEFT leg is the larger bright frontal thigh buckle/knee plate/boot on screen RIGHT, far RIGHT leg is smaller darker side knee plate behind on screen LEFT. Preserve this leg depth and identity. Image2 supplies the required TWO distinct low walking poses: left panel is phase2, right panel phase8; green L=always camera-near, blue R=alwaysfar. Do not copy diagram colors/lines/text. Preserve image1 head face brown ponytail armor huge sword both hands, exact character proportions and pixel rendering. Both faces and every boot toe point RIGHT. Left cell phase2: camera-near LEFT leg (bright large kneeplate) now slopes more vertically down-right, planted ankle only +20 px to right of pelvis, supporting; camera-far RIGHT leg (darker side plate) behind slopes down-left with low lifted ankle -20px rear, moves toward center. Natural compact stance, no high kick. Right cell phase8: near LEFT large plate leg slopes down-right, knee low bent, ankle +55px front ready to contact; far RIGHT dark plate leg slopes down-left to rear -55px with heel up. This should look very close to image1 pose but left boot 4 pixels lifted and slightly closer to hips for continuous8→1. Near LEFT thigh must stay in front at pelvis overlap, not return to left/rear. All upper body same in both cells, subtle 1-2px bob only, identical equipment and complete sword/ponytail/boots in generous margins. No background, ground, shadow, text, numbers, guides, effects or blur. True transparent alpha. Two full complete separate same-scale poses.
```

## v6 編集プロンプト全文

参照 1 は v5、参照 2 は共通姿勢ガイド。v5 は 1/2/8 の近側 L が後ろになるため不採用。最初の編集呼び出しは connection failed: error sending request で画像を返さなかった。

```text
Use case: precise-object-edit. Edit target image 1 warrior eight-frame sprite sheet. Supporting image 2 only supplies leg geometry; do not copy its lines, colors, text or canvas. Fix ONLY leg poses in frames 1, 2 and 8 of the four-column/two-row sheet. All other frames 3,4,5,6,7 keep exactly their original pose/identity/armor/weapon and proportions. Brown-haired female warrior, brown armor, huge silver sword held in both hands facing right. Anatomical LEFT leg is always camera-near: the larger fully visible thigh strap/buckle and broad rounded knee plate. Anatomical RIGHT leg always camera-far: partly obscured thigh/knee. These must never change depth. Frame 1 must place camera-near LEFT leg FRONT to screen-right, foot planted in front of hips; far RIGHT leg goes back to screen-left, heel lifted slightly. Frame 2 near LEFT foot advances from frame1 to the pelvis center but still in front, supports; far RIGHT foot low lifts coming from rear toward center behind L. Frame 8 near LEFT foot extended FRONT to screen-right approaching frame1 contact, far RIGHT foot to rear-left heel raised. This is essential: near LEFT leg is the FRONT/RIGHT leg at frames1/8, while near LEFT leg is the REAR/LEFT leg at frame5. Keep all boot toes pointing right, no sideways/backward toe, low grounded walking. Keep the same fixed camera and thigh occlusion with LEFT always in front of RIGHT at overlap. Change only lower legs/thigh poses in 1/2/8; retain torso, face, sword, hands, ponytail, skirt, armor details, image style, identical cell alignment and margins. Keep the exactly4 columns×2rows, no labels, guides, floor/shadow, no colored background. Actual transparent alpha.
```

組み込み image_gen、transparent_background: true。root先行生成後、戦士専任サブエージェントへ引き継いで確認する。参照1：待機原画、参照2：共通8相の姿勢ガイド。

```text
Use case: stylized-concept. Asset type: production transparent pixel-art sprite sheet for a 2D RPG, warrior FORWARD walk, exactly 8 genuinely different poses in a 4-column by 2-row sheet.
Image 1 is the approved warrior identity/style reference only. Image 2 is a geometric 8-phase walking pose guide only; do not copy its colors, lines, text, panels or diagrams. Follow its leg positions and consistent occlusion.
Keep the exact brown-haired female chibi warrior, high ponytail, brown leather armor, black shorts, brown tabard with silver ornament, belts/buckles/knee guards, huge broad silver sword with dark center and ornate silver guard. Crisp pixel rendering matching image 1, exact stable head/body proportions. Face and both boot toe tips always point RIGHT. Hold sword with same hands diagonally up-right at waist/chest throughout. Stable torso/waist per cell, tiny coherent bob and ponytail follow-through.
Define anatomical LEFT leg = permanently CAMERA-NEAR, RIGHT leg = permanently CAMERA-FAR. These identities NEVER exchange depth when the feet exchange their screen x positions. LEFT thigh, shin and boot must occlude RIGHT at both passing poses. Preserve every boot/buckle on its original leg.
Draw the following low, natural 8-phase grounded WALK exactly, read row 1 frames 1–4, row 2 frames 5–8. Screen right is front. All positions are relative to pelvis, not absolute cell positions.
1 LEFT near ankle +70 px ahead/right, planted; RIGHT far ankle -70 px rear/left, toe down.
2 LEFT near ankle +30 px, planted supporting and moving back; RIGHT far ankle -35 px, raised only a little and swinging toward center.
3 LEFT near ankle 0 px, planted supporting. RIGHT far ankle 0 px nearly directly BEHIND LEFT ankle, low lifted passing foot partly OCCLUDED by LEFT boot. Knees/ankles naturally aligned; no high kick, no wide stride here.
4 LEFT near ankle -40 px, rear heel rises; RIGHT far ankle +40 px, extends forward low, almost contact.
5 LEFT near ankle -70 px REAR/LEFT, toe down; RIGHT far ankle +70 px FRONT/RIGHT planted. This is the opposite leg contact from 1; keep LEFT still camera-near and in front at thigh overlap.
6 LEFT near ankle -35 px, low lifted coming toward center; RIGHT far ankle +30 px planted supporting and moving back.
7 LEFT near ankle 0 px, low passing directly IN FRONT of RIGHT ankle; RIGHT far ankle 0 px, planted support mostly behind near boot. No wide stride, no backward swinging near boot here.
8 LEFT near ankle +60 px ahead ready to plant; RIGHT far ankle -60 px behind, heel rising. Same identities/occlusion as frame 1, very close foot locations for smooth 8→1.
Preserve natural anatomy with two intact legs and two intact rightward boots. Each pose has opposite foot travel continuously, do not duplicate 1 as 5, do not mirror or horizontally flip any foot. Keep passing ankles nearly overlapping in screen x at 3 and 7. Maintain armor, skirt/tabard, sword and body scale all eight.
Landscape 2:1 transparent canvas with generous identical cells and full generous transparent outer margins/gutters. Entire head/ponytail/sword/feet complete in each cell and separated. No labels, guide colors, floor/shadow/grid, background, blur or painted environment. True transparent alpha.
```
