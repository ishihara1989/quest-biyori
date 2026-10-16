# 戦士 / attack-overhead

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

Primary request: a heavy greatsword raised overhead and swung DOWN. Four chronological keyframes:
1 TOP LEFT — anticipation: plant feet apart, bend knees slightly, lean back and bring both hands up beside/above the head, blade diagonally high behind the head toward upper LEFT. Weight and eyes preparing a rightward strike.
2 TOP RIGHT — maximum windup: both hands held high above head, greatsword fully raised pointing upward/back, arms and blade clearly farther overhead than frame 1. Body arches ready to throw weight forward. A small faint upward trailing blade afterimage indicates the raising motion.
3 BOTTOM LEFT — powerful DOWNSTROKE: lunge/lean forward toward right, arms swing down, solid sword angled diagonally downward to the RIGHT at roughly 40 degrees below horizontal; bright large tapered vertical slash arc from overhead down the right side and pale ghost blades ABOVE the current blade. Boots planted, hands attached to hilt.
4 BOTTOM RIGHT — follow through: crouched heavy low stance, hands low before the torso, greatsword tip held low toward lower RIGHT just above the boot baseline; a shorter fading downstroke trail behind the sword. Clearly lower sword than frame 3, then able to recover to idle.
Make the raised-to-lowered trajectory unmistakable: frame 2 sword is at highest point, frames 3/4 below hands, no duplicate idle poses. Keep feet at baseline; sword/effect never below the sole baseline. Preserve body anatomy and relative height across poses.
```
# 修正プロンプト / v2

```text
Use case: identity-preserve. Edit this exact transparent 2x2 FOUR-frame overhead greatsword attack sheet. Preserve the warrior identity, pixel art style, brown leather costume, greatsword design, four distinct poses and vertical attack chronology. Fix ONLY layout and cutoff: redraw/complete the full sword tip in top-right frame and complete the sword tip/trail in bottom-right frame, then reduce ALL four complete poses to the SAME common scale so there is 12 percent completely transparent padding on ALL FOUR SIDES of EACH equal square cell. No sword, trail, hair, boot may touch outer canvas or cell divider. There must be a broad horizontal AND vertical empty transparent gutter. Keep foot baseline equal in all four cells and body size equal. Entire large vertical slash arc in bottom-left remains inside its own cell. Maintain crisp pixel art and genuine RGBA transparency, including translucent afterimages. Exact 2x2 grid, no text, numbers, ground or checkerboard. The sword first rises overhead then swings downward toward screen right; main sword remains opaque and sharp.
```

## 2コマ目の剣と残像の修正 / v3

1コマ目の左上から真上やや右へ剣を移し、その直前の左上の位置だけに短い残像を付ける。左下から伸びる弧は除去する。

```text
Use case: identity-preserve.
Asset type: targeted edit to the existing transparent 2x2 FOUR-frame greatsword downstroke sprite sheet.
Input image 1 is the EDIT TARGET. Preserve exactly the same brown-ponytailed young female warrior, face, proportions, brown leather armor over black undershirt, gloves/bracers, skirt and tabard, strapped armored boots, and single huge straight silver greatsword with dark fuller and angular guard. Same crisp detailed pixel-art style and palette.
Change ONLY the TOP RIGHT (second) frame. Do not change the other 3 poses; keep the same 2x2 grid, camera, body scale, foot baseline, body pose, and transparent padding.
The FIRST frame's blade is diagonally UPPER LEFT. Therefore frame 2 must rotate the blade clockwise a little toward overhead. In the SECOND frame put her greatsword almost VERTICAL ABOVE HER HEAD, tilted SLIGHTLY TO SCREEN RIGHT: hilt above head in both hands, long main blade tip near the top of its cell, just RIGHT of the hilt (about 10-15 degrees right of vertical). This is the overhead transition between frame 1 upper-left and frame 3 lower-right.
DELETE the current huge curved afterimage that rises from BELOW LEFT beside her ponytail/hip. Replace it with ONLY A SHORT, SUBTLE pale silver/white slightly blue translucent angular afterimage positioned UPPER LEFT of the current overhead blade. It represents the immediately previous blade in frame 1, at about 45 degrees upper-left, converging toward the SAME overhead hilt. A short arc confined ABOVE her head connects previous upper-left blade tip to current upper-right tip. One faint ghost upper-left blade is okay. This is a short top-of-head arc of about 50-60 degrees, NOT a long 180-degree crescent. Absolutely NO motion trail descending next to her left shoulder, ponytail, back, waist, legs or feet; the entire trail stays at/ABOVE the hand/head level.
Current physical sword sharp opaque and metallic, both hands connected correctly. Keep whole blade tip and short upper-left trail fully inside top-right cell with generous genuine transparent margin. No extra held sword, no text/numbers, no checkerboard, no background, no ground, no cast shadow, no smooth painted blur. Genuine RGBA alpha outside warrior/sword/trail. Retain all four frames.
```

## 剣先をやや右へ傾ける調整 / v4

```text
Use case: precise-object-edit.
Input is an approved transparent 2x2 FOUR-frame pixel art sheet. Change ONLY the actual solid sword in the TOP RIGHT SECOND FRAME by rotating it about 20 degrees CLOCKWISE around its existing overhead hilt. Keep same warrior body/face/hair/clothes/hands/boots and their position and scale, other three frames, layout, sword design and pixel art unchanged.
The blade tip MUST be to the RIGHT of its hilt, giving a nearly upright sword tilted 10-15 degrees RIGHT of vertical. NOT upright leaning left. As coordinate guidance on this 1278x1230 sheet: current overhead hilt is near (1045,250); desired blade tip near (1100,40) while keeping hilt position. Blade continues as one straight broad solid sword from the existing hilt, preserving blade length, dark fuller, silver edges and ornate guard. Main blade complete and crisp.
Retain ONLY a SHORT pale translucent silver-blue upper-left trailing arc above the head, flowing from the previous upper-left blade position toward the new upper-right blade tip. The short trail can touch the blade tip behind it but stays above hand/head level. No streak along left shoulder/back/hair/hip or below. No second opaque held sword, no text, labels, checkerboard, scenery, floor or shadows. Genuinely transparent RGBA, intact all four frames and generous margins.
```

