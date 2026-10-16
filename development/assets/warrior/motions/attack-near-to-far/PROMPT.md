# 戦士 / attack-near-to-far

生成方法: 組み込み `image_gen`、背景透過。承認済み待機原画をデザイン・画風参照として使用。
「向こう側」は画面奥、「こちら側」は画面手前。剣の奥行きに合わせて顔・上半身も回転する。

## 使用プロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art attack animation sprite sheet for the existing browser RPG.
Input image 1 is the approved warrior idle sprite, the strict character identity, proportions, palette, weapon design and pixel-art style reference. Preserve the SAME young female warrior: brown high ponytail with black tie, brown eyes, sleeveless brown leather armor over black high neck undershirt, brown bracers and gloves, brown short battle skirt with long front tabard, thigh straps, brown armored knee-high boots, and ONE huge straight silver two-handed greatsword with dark center fuller and angular silver crossguard. Both hands grip the SAME sword throughout. No shield, helmet, cape or extra weapons.
Output ONE genuinely transparent RGBA sprite sheet with EXACTLY FOUR different sequential poses in a precise 2 columns x 2 rows grid, reading top-left, top-right, bottom-left, bottom-right. Equal square cells with a wide transparent gutter; complete body, ponytail, greatsword tip and swing trails fully inside EACH cell with generous margin. Frame cells must not overlap. Same camera, same body scale and proportions in every frame. Grounded feet on the same local baseline. Character is primarily attacking toward SCREEN RIGHT, camera stays fixed in a side-scrolling battle view.
Style: match the approved reference's finely detailed arcade JRPG pixel art, crisp deliberate square pixel clusters, warm brown leather highlights, dark outlines and metallic silver sword. No smooth illustrated strokes, no painted blur, no photorealism or 3D.
When the sword MOVES show readable pale silver/white slightly blue translucent pixel-art motion AFTERIMAGES trailing the blade: tapered angular crescent streaks and one or two ghost blade silhouettes along its actual previous path. Main physical blade stays solid, sharp and distinct. Only moving frames have trails. Trails follow the actual direction of motion and must stay inside each cell. Do not show an extra held sword.
No text, labels, numbers, separators, checkerboard, floor, cast shadow, scenery, target or enemies. Actual transparency outside character and trails.

Primary request: a horizontal greatsword SWEEP FROM NEAR SIDE OF THE BODY (toward viewer) TO FAR SIDE (away from viewer), opposite depth rotation from the other sweep. This is a depth rotation of head, torso, hips and blade. The rightward opponent direction is maintained.
1 TOP LEFT — near-side windup: warrior faces toward viewer/right in a clearly readable FRONT three-quarter view, eyes/face and breastplate visible. Both hands and large broad greatsword are on the NEAR side prominently IN FRONT of torso across foreground toward screen LEFT/lower-left. Blade overlaps/occludes torso to establish near depth.
2 TOP RIGHT — near-side moving strike: warrior still front three-quarter toward viewer/right, sword sweeping across foreground toward screen RIGHT IN FRONT OF body. Bright horizontal crescent trailing BEHIND blade on the near side, pale ghost previous blade positions. Head begins following the blade away.
3 BOTTOM LEFT — crossing into far side: rotate head and chest AWAY from camera to right/back three-quarter. Sword crosses from foreground to FAR side, current solid blade extending right/upper-right partially occluded BEHIND the torso/hands; more foreshortened perspective. Tapered horizontal trails curve away on far side. Face becomes mostly hidden.
4 BOTTOM RIGHT — far-side follow through: unmistakeable three-quarter BACK view facing upper-right/away; back of head and leather armor visible, face mostly hidden. Greatsword and hands reach on FAR side of body toward screen RIGHT/upper-right, torso partly occludes sword/arms. Small fading arc behind torso on far side. Strong planted low stance, then recovery to idle possible.
Far sword frames MUST have warrior facing away. Near sword frames MUST have warrior turned toward viewer. Frame 1 front and frame 4 back must visibly differ. This sequence reverses the near/far orientation chronology, not just a mirrored sprite. SAME single sword, hands connected, same body scale and sole baseline.
```
## 生成時に付加したレイアウト指定

```text
Critical layout: leave at least 12 percent transparent margin on ALL FOUR SIDES of EACH equal square cell, including sword and effects. Character body should use only about 55 percent of cell height to allow full sword arc. NO part of sword tip, hair, boots or afterimage may touch canvas edge or grid midpoint. Wide empty gutters both horizontally and vertically. Center each entire pose silhouette in its own cell with ample padding. Actual transparent alpha.
```

## 振り切り姿勢の修正 / v2

最終コマの剣を反対側まで運び、肩・腰・顔も左側へ追従させる修正。最初の3コマは既存原画を採用し、変更しない。

```text
Use case: identity-preserve.
Asset type: edit an existing 2x2 pixel-art greatsword horizontal attack sprite sheet for an RPG.
Input image 1 is the EDIT TARGET, an approved FOUR-frame attack sheet. Keep the SAME brown ponytailed female warrior, brown leather armor, black undershirt, bracers, skirt with long front tabard, strapped knee-high boots, and the exact SAME single huge straight silver two-handed greatsword. Crisp detailed pixel art, exact existing palette, proportions and equipment design. Both hands always grip the one connected hilt.
User correction: the swing currently stops facing the rightward enemy and therefore looks small. It must follow THROUGH the target and carry the entire body and blade around to the OPPOSITE SIDE in the last pose.
Change ONLY the BOTTOM RIGHT (fourth/final) frame. Preserve frames 1, 2 and 3, layout, frame count, transparent background, camera and body size. Four cells reading top-left, top-right, bottom-left, bottom-right. Do not replace with four variations of the new pose.

Fourth pose must be a FULL FOLLOW-THROUGH FROM NEAR TO FAR. Continue beyond frame 3's right/back strike: pivot hips, shoulders and head strongly to SCREEN LEFT and AWAY FROM camera. An unmistakable FAR-SIDE three-quarter BACK-LEFT pose: back of head and back of armor visible, face mostly hidden, head looks LEFT/AWAY. The character must be turned farther around than in frame 3, no longer looking toward the rightward enemy.
Both hands and single greatsword are carried on the FAR side BEHIND the torso toward SCREEN LEFT/upper-left; torso occludes part of arms/hilt correctly, with the large solid main blade extending decisively LEFT of body at roughly horizontal to 20 degrees up-left. Sword tip ends far LEFT of left boot/head, not upper-right. Do NOT raise sword over the head as an overhead windup. Hands and main blade remain on FAR side, consistent with this depth action.
Wide planted stance with heel pivot, strong completed back/left rotation. Ponytail and tabard fly to SCREEN RIGHT from the leftward rotation. A fading horizontal silver/blue arc and ghost old blade positions wrap BEHIND torso from frame 3's RIGHT side around to current LEFT blade, matching occlusion. Main blade is sharp and opaque, trails translucent. No right-facing defensive reset, no blade remaining upper-right.
Character anatomy/height and blade length should match the other three cells. Keep final boots on the same local baseline and entire leftward sword tip, hair and fading trails WITHIN bottom-right cell, with generous fully transparent padding and no overlapping bottom-left cell. Truly transparent RGBA outside characters/trails. No ground, cast shadow, checkerboard, labels, extra weapon, text, smooth painting or blur.
```

## 振り切り姿勢の単独コマ / v3

```text
Use case: identity-preserve.
Input image is a 2x2 sprite sheet reference/edit target. Extract and redraw ONLY THE BOTTOM-RIGHT warrior pose as ONE SINGLE ISOLATED transparent sprite. Output exactly ONE full-body character, not a grid and not the other three poses.
Preserve that EXACT bottom-right FINAL FOLLOW-THROUGH: same brown-ponytailed female warrior and brown leather armor, black undershirt, bracers, skirt with long tabard, strapped armored knee-high boots, exact huge straight silver sword/dark fuller/ornate silver guard. Body turned to SCREEN LEFT and AWAY in an unmistakable three-quarter BACK-LEFT view, back of head and back of armor showing, head/nose looks left/away, face mostly hidden. Strong low wide planted stance, both hands gripping SAME hilt on FAR SIDE behind torso, arms/hilt correctly occluded by body. Main solid blade extends decisively LEFT of body at roughly horizontal or slightly up-left, NOT over her head. Ponytail and tabard streaming to RIGHT from the strong left rotation. Fading horizontal silver/blue translucent slash crescent and faint previous blade afterimage wrap BEHIND torso from RIGHT around to current LEFT blade, matching far-side depth and occlusion. Keep blade sharp and opaque, correct full length, no extra held weapon. Completed broad sideways slash, not a guard or overhead windup.
Make this one sprite on a generously sized genuinely transparent canvas with at least 15 percent empty alpha padding on ALL SIDES, including sword tip, hair, boots and ENTIRE faint effect. Center whole silhouette. Preserve same detailed crisp pixel-art style, face, palette, anatomy and equipment proportions as reference. No cropping and no other character or stray fragment from the other cells. No floor, cast shadow, text, numbers, checkerboard, smooth painting or blur. Actual RGBA transparency.
```

## 採用コマの余白調整 / シートv3

採用: `source/warrior-attack-near-to-far-generated-v3.png` の4コマ目。
最初の3コマはv1の原画を保持し、4コマ目を靴底と体の高さに基づいて配置した `warrior-attack-near-to-far-assembled-v2.png` を使用する。
単独コマとして生成した試稿は背景のにじみが残ったため、採用していない。

```text
Use case: precise-object-edit.
Edit this existing transparent 2x2 FOUR-frame PIXEL-ART game sprite sheet. Keep frames 1, 2 and 3 unchanged. Keep EXACT same bottom-right BACK-LEFT completed horizontal follow-through pose, brown female warrior identity/design/face/hair/costume/pixel palette, sword design/length, both hands/hilt, boot stance, and trailing arc.
Change ONLY THE LAYOUT of the BOTTOM-RIGHT frame: reduce that entire complete final pose (character, sword and its own bounded slash ribbon together) to 80 percent size and center it cleanly inside the bottom-right cell, with a WIDE EMPTY transparent gutter separating it from bottom-left pose. Do NOT include or duplicate any part of the bottom-left pose/trail in this final cell. The main sword tip must be intact, pointing decisively SCREEN LEFT on FAR side behind torso; back of warrior faces viewer and head looks left/away; ponytail/tabard stream right. Preserve this exact pose, not a new pose.
On this 1278x1230 sheet, bottom-right pose should lie entirely in roughly x=720..1230 and y=700..1160, leaving transparent padding around all sides of its cell. No touching center boundary x=639, no overlap with bottom-left cell, complete blade tip and full boots/hair/trail. Original final is too close to the cell's left boundary: move/shrink it to fix this.
Keep the same crisp finely detailed pixel art as source, including dark outline and flat palette; no painterly rerender. Preserve genuine alpha transparency. Absolutely no ambient brown/blue glow or halo, diffuse gradient, blur, lighting backdrop, scenery, floor, shadow, checkerboard or text. Only the exact solid warrior and sword and bounded translucent silver/blue horizontal slash ribbon. Output same FOUR-frame 2x2 sheet, not a single enlarged character.
```

