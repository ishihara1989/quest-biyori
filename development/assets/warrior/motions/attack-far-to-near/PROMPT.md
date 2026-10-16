# 戦士 / attack-far-to-near

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

Primary request: a horizontal greatsword SWEEP FROM FAR SIDE OF THE BODY (away from viewer) TO NEAR SIDE (toward viewer). This is a depth rotation of head, torso, hips and blade, NOT just a left/right swing and NOT a repeated front-facing pose. The rightward opponent direction is maintained.
1 TOP LEFT — far-side windup: warrior twists AWAY from camera, a readable three-quarter BACK view facing upper-right/away from the viewer. Back of head and back of leather armor visible; face mostly hidden, nose points away; ponytail swings with turn. Both hands and long greatsword extend on her FAR side behind torso toward screen LEFT/upper-left. Body partially occludes the sword/hands to visibly establish behind-body depth.
2 TOP RIGHT — starts unwinding: warrior still three-quarter BACK facing away but rotates toward right profile. Sword sweeps on FAR side toward screen RIGHT, blade crossing BEHIND torso where appropriate; slim foreshortened blade perspective, pale horizontal trailing arc BEHIND character. Head follows sword.
3 BOTTOM LEFT — crosses toward near side: torso and face turn toward viewer into right-facing FRONT three-quarter view, visible eye/face and breastplate. Solid large greatsword passes prominently IN FRONT of torso toward right; horizontal crescent trails bridge far right side toward foreground, behind the current blade, with ghost blade afterimages. Both hands attached.
4 BOTTOM RIGHT — near-side follow through: clearly front three-quarter toward viewer/right, readable face; both arms and broad blade are on the NEAR side prominently OVERLAPPING IN FRONT of waist/chest, blade extended across foreground toward screen RIGHT/lower-right. Fading near-side horizontal sweep arc. Low balanced planted stance.
Far sword frames MUST have warrior facing away. Near sword frames MUST have warrior turned toward viewer. Frame 1 back and frame 4 front must be visibly different silhouettes. Trail depth must agree with body occlusion. Same one blade, same broad sword dimensions accounting for perspective, same foot baseline.
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

Fourth pose must be a FULL FOLLOW-THROUGH FROM FAR TO NEAR. Continue beyond frame 3's rightward strike: pivot hips, shoulders and head strongly to SCREEN LEFT (opposite the opponent). A NEAR-SIDE three-quarter FRONT-LEFT pose: face/nose clearly points LEFT, chest remains partly visible to camera; her body is no longer facing right. Extend both hands left of her waist with arms carried across and beyond the torso; large main blade extends decisively horizontally or slightly diagonally DOWN-LEFT, completely across the NEAR foreground on the LEFT side of the body. Sword tip is far LEFT of the left boot/head, NOT at screen right. Both hands and main blade stay clearly IN FRONT of body, maintaining the near-side depth of this action.
Boots planted in a wide stance, one heel pivots, torso leans with momentum left. Ponytail/tabard fly to screen RIGHT from the strong left rotation, helping show the large completed turn. An elongated fading horizontal silver/blue crescent and ghost previous blade positions trail from frame 3's RIGHT side across the NEAR front toward the current LEFT blade. The current solid leftward blade remains crisp and clearly distinct from translucent trail. No upright defensive reset, no eyes looking right, no blade remaining in front on the right.
Character anatomy/height and blade length should match the other three cells. Keep final boots on the same local baseline and entire leftward sword tip, hair and fading trails WITHIN bottom-right cell, with generous fully transparent padding and no overlapping bottom-left cell. Truly transparent RGBA outside characters/trails. No ground, cast shadow, checkerboard, labels, extra weapon, text, smooth painting or blur.
```

## 振り切り姿勢の単独コマ / v3

```text
Use case: identity-preserve.
Input image is a 2x2 sprite sheet reference/edit target. Extract and redraw ONLY THE BOTTOM-RIGHT warrior pose as ONE SINGLE ISOLATED transparent sprite. Output exactly ONE full-body character, not a grid and not the other three poses.
Preserve that EXACT bottom-right FINAL FOLLOW-THROUGH: same brown-ponytailed female warrior and brown leather armor, black undershirt, bracers, skirt with long tabard, strapped knee-high boots, exact huge silver straight two-handed sword/dark fuller/ornate silver guard. Face/nose looks SCREEN LEFT, torso has pivoted to a near-side three-quarter FRONT-LEFT view, chest partly visible. Strong low wide planted stance, both hands gripping the SAME sword held across IN FRONT of her torso with the long main blade extending LEFT horizontally, tip far left of the body. Ponytail and tabard streaming to RIGHT from rotation. Fading horizontal silver/blue translucent slash crescent trails across foreground from RIGHT to LEFT behind the current sharp opaque blade, a ghost blade position along its previous rightward path. Keep sword on NEAR side. This is a completed broad sideways slash, not a defensive guard or overhead windup.
Make this one sprite on a generously sized genuinely transparent canvas, with at least 15 percent empty alpha padding on ALL SIDES including sword tip, hair, boots and entire faint effect. Center the whole silhouette, use SAME detailed crisp pixel-art style, face, palette, anatomy and equipment proportions as reference. No cropping and no other character or stray fragment from the other cells. No floor, shadows, text, watermark, checkerboard, smooth painting, blur or extra held sword. Actual RGBA alpha, translucent trailing effect and solid main blade.
```

## 大剣の長さを既存コマに合わせる調整 / v4

```text
Use case: precise-object-edit.
Input is ONE isolated transparent pixel-art female warrior in a completed leftward greatsword follow-through. Preserve EXACT character, pose, head looking LEFT, body/costume/anatomy, wide planted boots, ponytail/tabard blowing RIGHT, hands/hilt, same pixel art and palette. The blade became too long relative to her approved other attack frames.
Change ONLY the blade length and associated leftmost afterimage: make the long silver blade extending LEFT about 25 percent SHORTER by moving its tip right toward the existing hilt. Keep its WIDTH, straight shape, dark fuller, silver edge, guard, grip and hands unchanged; it stays a huge greatsword, roughly 0.75 of the character's hair-top-to-sole height in blade length. On the 1600-ish wide image the hilt is around x=910; desired blade tip around x=295 instead of x=100. Do not shrink the whole character, move boots or change the follow-through pose.
Bring the leftmost fading silver-blue motion arc inward to follow the shortened blade tip; no detached old sword-tip afterimage remains far left. Preserve horizontal slash trail from RIGHT to LEFT across NEAR foreground, same near/front-left rotation. Current blade opaque and crisp, afterimages translucent. Keep a single held sword and one isolated full-body character, with generous genuinely transparent margins on all sides. No labels, extra pose, ground, shadow, checkerboard or smooth blur.
```

