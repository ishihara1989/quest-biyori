# 再制作：固定した左足・右足と8相

組み込み image_gen、transparent_background: true。root先行生成後、巫女専任サブエージェントに引き継ぐ。参照：待機原画（同一性）＋共通8相ガイド（姿勢のみ）。

```text
Use case: stylized-concept. Create a production transparent pixel-art 8-frame FORWARD walking sprite sheet, exactly 4 columns x 2 rows, eight separate full-body poses read 1–4 top and 5–8 bottom.
Image 1 is the approved miko/shrine maiden identity and pixel style. Keep her exact face/chibi proportions, black long hair, large red-white ribbon, white kimono sleeves with red trim, gold tassels, red long hakama skirt, white tabi socks, red sandal straps and brown sandal soles, gohei wand with white folded paper and gold ornament. Same hand holds gohei diagonally up-right throughout. Image 2 is only a walking leg pose reference, follow 8-phase positions and occlusion but DO NOT render the diagram colors/text/lines. Character always faces RIGHT with both sandal toe tips pointing RIGHT; do not rotate or flip the back shoe. Camera and body proportions fixed. No new costume accents.
Her skirt is long but both ankles and sandals must be visible moving naturally beneath its hem. Subtle hem sway, low ankle motion, no large high knee kick or skirt shortening. LEFT leg is the permanently camera-NEAR leg; its sock/sandal is slightly larger, bright and draws in FRONT of the dark slightly narrower camera-FAR RIGHT sock/sandal at crossing. Never exchange the two legs' camera depth while their screen x positions exchange.
Use exactly these continuous phases relative to each pelvis:
1 LEFT near brighter sandal +60 pixels ahead/right planted, RIGHT far darker sandal -60 rear/left toe down.
2 LEFT +25 moving back toward pelvis supporting, RIGHT -25 raised only slightly moving toward pelvis.
3 LEFT planted directly beneath pelvis, RIGHT low lifted passing BEHIND it: ankle centers nearly same x, LEFT sock/sandal partially HIDES RIGHT sock/sandal.
4 LEFT -35 rear heel rising, RIGHT +35 ahead/right extending low.
5 LEFT -60 REAR/LEFT and STILL CAMERA-NEAR with the full brighter near sock/sandal visible on left; RIGHT +60 FRONT/RIGHT planted but STILL CAMERA-FAR with narrower darker sandal. Frame 5 MUST be opposite leg contact to 1, not duplicate 1.
6 LEFT -25 low lifted coming forward toward center, RIGHT +25 planted moving back to center.
7 LEFT low lifted passing IN FRONT of RIGHT directly beneath pelvis, ankle centers nearly same x and LEFT brighter sock/sandal HIDES some of RIGHT grounded support sandal.
8 LEFT +50 front/right ready to plant, RIGHT -50 behind/left heel rising. These are same feet and same depth as 1 for smooth 8→1.
Evenly spaced actual walking poses, correct 1-left-contact /5-right-contact /3-and7 low crossing, tiny body bob and coherent hair/ribbon/paper follow-through. Draw all eight newly, no duplicates/mirroring. Stable body/waist x and scale in each identical cell. Generous transparent gutters and external margins so all hair, ribbon, sleeves, gohei paper and feet fit intact. True alpha, no shadows/floor, no grid/panels/labels/background. Crisp consistent pixel-art exactly like identity reference.
```
