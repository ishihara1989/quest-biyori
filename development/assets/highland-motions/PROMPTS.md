# 高原の生成プロンプト

組み込み image_gen。原画を透過PNGで保存。本編には未登録。

## horn-jackal / idle

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: horn-jackal, the brown slender horned jackal from image 1. Preserve its cream muzzle/chest/tail tip, dark brown markings, long legs, pointed ears, amber eye, and short rear-facing horns.
Composition: Exactly 2 columns by 2 rows, equally sized rectangular cells on one square 1024x1024 transparent canvas, absolutely no visible grid. Local normalized coordinates in EACH cell: body/hip anchor x=.55; planted hoof/paw contact line y=.84; top margin at least .08, left/right margin at least .07. Equal camera scale between cells.
Frame choreography: Four-frame gentle alert breathing loop, read left-to-right then top-to-bottom: 1 neutral inhale starting pose; 2 chest expands slightly and ears tilt toward a sound, tail rises a little; 3 soft exhale, head dips slightly and tail sways down; 4 return toward frame 1, ears and tail settle. Feet stay planted. Visible but subtle coherent motion; same character silhouette.

原画: public/assets/highland-motions/sources/horn-jackal/idle-generated.png

## horn-jackal / move-1

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: horn-jackal, brown slender horned jackal. Preserve cream muzzle/chest/tail tip, dark brown fur markings, long legs, pointed ears, amber eye and short rear-facing horns.
Composition: Exactly 3 columns by 1 rows on one wide 1536x512 transparent canvas. Equal-size cells, no drawn grid. Each cell local coordinates: body hip anchor x=.55, paws contact y=.84, minimum .07 margins all sides, .08 at top. Equal size in all cells. Each cell contains one consecutive gait pose, not repeated static pose.
Frame choreography: Walking gait FIRST HALF, all still facing LEFT. In-place walk, NOT three different directions. Row sequence: 1 near foreleg reaches left/front at (0.38,0.84), opposite hindleg reaches rear/right at (0.71,0.84), other diagonal pair supports; 2 those limbs sweep under torso (0.49,0.84) and (0.64,0.84), body rises 0.015 cell height; 3 near foreleg sweeps backward/right to (0.55,0.84), far foreleg begins swing toward left/front, body lowers. Leg joint anatomy coherent, feet unmistakably change positions. These are consecutive frames 1–3 of a six-frame cycle.

原画: public/assets/highland-motions/sources/horn-jackal/move-1-generated.png

## horn-jackal / move-2

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Input image 1 is the canonical design; image 2 is FIRST HALF walking sheet, supplied ONLY to show gait phase that must be OPPOSITE for this new second half. Keep reference 1 colors and shape.
Composition: Exactly 3 columns by 1 row, wide 1536x512 transparent canvas, equal cells. Body hip x=.55, foot contact y=.84, full ears/horns/tail inside with .08 margins. In-place LEFT-facing walking. MOST IMPORTANT: do not repeat image 2's same near front leg forward. This sheet advances OPPOSITE diagonal legs.
Three consecutive positions, row left to right: FRAME4: foreground/NEAR front leg slants BACK toward RIGHT with paw at (.57,.84); partly occluded FAR front leg reaches strongly LEFT with paw at (.29,.84); NEAR rear paw reaches BACK toward RIGHT (.76,.84), FAR rear leg tucked under belly (.62,.78). FRAME5: foreground NEAR front paw is LIFTED with bent elbow and paw at (.47,.68), FAR front paw remains planted at (.38,.84); NEAR rear paw passes under belly (.63,.84). FRAME6: foreground NEAR front leg swings strongly LEFT with paw lifted at (.28,.72), FAR front leg slopes BACK toward RIGHT with planted paw (.53,.84); NEAR hindleg now sweeps LEFT under body. Clear alternating near/far legs, not three copies. Head and torso maintain same camera and only .015 vertical bob.

原画: public/assets/highland-motions/sources/horn-jackal/move-2-generated.png

## horn-jackal / reaction

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: horn-jackal, brown slender horned jackal. Preserve cream muzzle/chest/tail tip, dark brown fur markings, long legs, pointed ears, amber eye and short rear-facing horns.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equal cells. Hip anchor x=.55; paw/ground contact y=.84; .08 transparent margins including horns and tail. Same camera scale in all cells. Different motions, not a loop.
Frame choreography: Four DISTINCT reaction frames, row-major order. Top-left HURT: intact jackal recoils to right, shoulders tilted backward, eyes tight, foreleg buckles. Top-right RECOVER: alert stance almost restored, head and legs clearly recovering. Bottom-left DYING: intact jackal collapsing, knees bent, torso tipping sideways down, head descending toward (0.30,0.70). Bottom-right DEAD TERMINAL: the same intact full jackal lies motionless on its side, eyes closed, body low against contact line y=0.84, folded legs visible, tail and horns intact. This is a permanent defeated pose, clearly different from standing. No blood and no vanishing parts.

原画: public/assets/highland-motions/sources/horn-jackal/reaction-generated.png

## horn-jackal / bite

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: horn-jackal, brown slender horned jackal. Preserve cream muzzle/chest/tail tip, dark brown fur markings, long legs, pointed ears, amber eye and short rear-facing horns.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equal cells. Body hip anchor x=.55, paws contact y=.84, .08 transparent margins including all horns/tail. Equal camera scale. Mouth must visibly OPEN in frame 2 then snap CLOSED in frame 3.
Frame choreography: Four-frame near-range snapping BITE action, row-major. 1 telegraph: hindquarters anchor at x=.67, head draws BACK/right to (.39,.46), neck curls, jaws open slightly. 2 lunge: head reaches LEFT at (.23,.50), forelegs extend front, jaws open wide. 3 bite contact: jaws snap CLOSED at (.20,.55), shoulders thrust forward, all anatomy recognizable. 4 recovery: head returns to (.32,.50), forefeet settle and mouth relaxes. Fixed torso anchor except intentional modest lunge; clearly follow this leftward head arc. No victim and no bite effect.
Targeted correction prompt:
Use case: identity-preserve. Asset type: 4-frame LEFT-facing horn-jackal bite sprite sheet, genuine transparent PNG. Input image 1 is canonical character design; image 2 is the sprite sheet to correct. Change ONLY the TOP-LEFT cell's HEAD AND NECK DIRECTION. In this windup frame its muzzle must point to LEFT, never right. Pull its head slightly BACK toward right without turning the face; nose still on the LEFT of the head, left-facing side profile matching input 1. Mouth slightly open and teeth visible. Keep its torso and four legs as in image 2. Preserve the other three cells completely: upper right mouth wide open leftward lunge, lower left closed-mouth leftward bite, lower right neutral recovery. Preserve 2x2 composition, exact character identity, colors, scale, pixel-art-style, armor-free brown jackal, full ears/horns/tail and alpha transparency. No text, grids, background, effects, props or extra characters.

原画: public/assets/highland-motions/sources/horn-jackal/bite-generated.png

## storm-jackal / idle

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: storm-jackal, blue-black long-legged jackal with flowing blue-white mane and tail, twin huge blue lightning horns, cream muzzle/chest, golden lightning ornaments. Keep all intrinsic golden marks.
Composition: Exactly 2 columns by 2 rows, 1024x1024 square transparent canvas, equal cells, no grid. Body hip x=.55; feet contact y=.84; .08 clear margins including entire blue horns and flowing tail. Same camera scale; keep LEFT-facing muzzle in all poses.
Frame choreography: Four-frame alert breathing loop, row-major. 1 neutral inhale with flowing blue-white mane; 2 chest expands, head rises a little, mane and long tail stream slightly farther right; 3 exhale with head low, tail dips, blue mane curls lag behind; 4 return to first pose, mane settling. Keep all four feet planted and maintain long legs. Blue horn lightning remains intrinsic design, with small flicker consistent across frames. No separate trail.

原画: public/assets/highland-motions/sources/storm-jackal/idle-generated.png

## storm-jackal / move-1

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: storm-jackal, blue-black long-legged jackal with flowing blue-white mane and tail, twin huge blue lightning horns, cream muzzle/chest, golden lightning ornaments. Keep all intrinsic golden marks.
Composition: Exactly 3 columns by 1 row, 1536x512 wide transparent canvas. Equal cells, no grid. Body hip x=.55; feet contact y=.84; .08 clear margins including full blue horns and tail. Same camera scale; LEFT-facing muzzle in every pose. Three different sequential gait poses.
Frame choreography: FIRST HALF of a six-frame looping agile walking/trotting gait, facing LEFT in-place. 1 near foreleg forward/left at (.36,.84), far hindleg back/right at (.73,.84), opposite diagonal pair supports; 2 swing pair passes under torso, near foreleg at (.48,.84), body rises .015; 3 near foreleg back/right at (.55,.84), far foreleg starts forward swing, body lowers. Four long legs stay anatomically correct; distinctive blue-white mane and tail flow right with a one-frame delay. No direction turn and no external motion trail.

原画: public/assets/highland-motions/sources/storm-jackal/move-1-generated.png

## storm-jackal / move-2

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: storm-jackal, blue-black long-legged jackal with flowing blue-white mane and tail, twin huge blue lightning horns, cream muzzle/chest, golden lightning ornaments. Keep all intrinsic golden marks.
Composition: Exactly 3 columns by 1 row, wide transparent canvas. Equal cells with larger .12 left/right clear margins so every blue mane and tail stays WITHIN its own cell; reduce all character scales equally to allow margins. Hip anchor x=.55, feet y=.84, same camera scale. LEFT-facing muzzles.
Walking cycle opposite half: frame4 FAR front foot forward-left (.30,.84), NEAR front foot clearly trailing right (.54,.84); frame5 NEAR front foot bends UP off ground (.44,.66) while FAR supports at (.38,.84); frame6 NEAR front foot swings LEFT raised (.26,.73), FAR front foot trails right (.53,.84). Hindlegs alternate corresponding diagonal support. Head bob only .015. Clear lifting and returning foreleg, not the same stride 3 times. Long blue mane waves gently right. SECOND HALF of a six-frame looping agile walking/trotting gait, facing LEFT in-place. 4 far foreleg forward/left at (.36,.84), near hindleg back/right at (.73,.84), opposite diagonal pair supports; 5 swing pair passes under torso, far foreleg at (.48,.84), body rises .015; 6 far foreleg back/right at (.55,.84), near foreleg starts forward swing, body lowers toward first pose. Four long legs stay anatomically correct; distinctive blue-white mane and tail flow right with a one-frame delay. No direction turn and no external motion trail.

原画: public/assets/highland-motions/sources/storm-jackal/move-2-generated.png

## storm-jackal / reaction

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: storm-jackal, blue-black long-legged jackal with flowing blue-white mane and tail, twin huge blue lightning horns, cream muzzle/chest, golden lightning ornaments. Keep all intrinsic golden marks.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas. Equal cells. Each character body hip x=.55, ground y=.84; full character occupies at most .76 cell width and .76 cell height, .12 transparent margin LEFT and RIGHT including all long blue tail and huge blue horns. Reduce all poses equally if necessary. Same camera scale, LEFT-facing muzzle in every pose. Four different reactions, not a loop.
Frame choreography: Four DISTINCT reactions row-major. 1 HURT recoil right: shoulders jerk back, head tilts away, knees compress, intrinsic blue mane bends back. 2 RECOVER: legs regain planted stance, head returns forward and mane settles. 3 DYING: foreknees and hindlegs fold, shoulder falls toward ground, torso begins tipping to side, horns kept intact. 4 DEAD TERMINAL: full intact jackal lies motionless on side at y=.84, eyes closed, folded long legs and full blue-white tail visible, horns preserved, intrinsic blue glow subdued but reference palette unchanged. Clearly defeated low body, no blood, no disappearance.

原画: public/assets/highland-motions/sources/storm-jackal/reaction-generated.png

## storm-jackal / charge

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: storm-jackal, blue-black long-legged jackal with flowing blue-white mane and tail, twin huge blue lightning horns, cream muzzle/chest, golden lightning ornaments. Keep all intrinsic golden marks.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equally sized cells with clear gutters, full character fits each cell, .1 clear margin including horns/mane/tail. Hip anchor x=.55, feet contact y=.84, same camera scale. All muzzles LEFT.
Frame choreography: Four-frame straight leftward CHARGE action after a curved approach (curve is movement of the actor, not drawn into sprite), row-major. 1 telegraph: body crouches, head and twin horns lower toward (.27,.52), hindlegs compressed. 2 launch: hindlegs push backward/right, front legs reach left, torso stretched horizontal, head at (.23,.52). 3 full speed: front legs swept backward, hindlegs cycle forward under torso, head at (.20,.51), blue mane streams right. 4 brake/recover: forefeet brace at (.32,.84), chest rises and horns lift toward neutral. No zigzag turn, no trail, no floor effect.

原画: public/assets/highland-motions/sources/storm-jackal/charge-generated.png

## storm-jackal / claw

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: storm-jackal, blue-black long-legged jackal with flowing blue-white mane and tail, twin huge blue lightning horns, cream muzzle/chest, golden lightning ornaments. Keep all intrinsic golden marks.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equal cells with clear gutters. Full character fits each cell at same scale with .1 margins. Hip x=.55, feet y=.84. Muzzle always LEFT. SAME foreground foreleg moves from raised back/right to extended left to lowered front to neutral. Strongly different paw positions.
Frame choreography: Four-frame powerful LEFT foreclaw slash, row-major. 1 windup: weight on other three legs, near forepaw lifted to (.40,.42), elbow tucked, shoulder turns slightly toward camera. 2 swipe starts: paw moves diagonally left/down to (.25,.48), claws spread; 3 contact follow-through: paw reaches (.19,.63), neck and shoulder follow left, claws still visible; 4 recovery: paw moves down/back to planted stance (.35,.84). The SAME near foreleg completes the action with clear diagonal arc. No slash arc, blood mark, victim, or attached effect.

原画: public/assets/highland-motions/sources/storm-jackal/claw-generated.png

## rock-horn-goat / idle

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: rock-horn-goat, stocky gray-brown shaggy goat with huge round curled stone horns, cream face/chest fur, stone patches with gold cracks on legs and back.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equal cells, clear gutters, full character in each. Hip x=.55, hoof line y=.84, .1 transparent margins including complete curled stone horns. Same camera scale. LEFT-facing muzzle in all cells.
Frame choreography: Four-frame stocky goat breathing loop, row-major. 1 neutral alert stance; 2 chest expands and head inclines a little, shaggy chest fur sways; 3 exhale and head returns lower, ears shift slightly; 4 back toward first pose, fur settles. Feet remain planted at y=.84. Preserve round curled stone horns, gray-brown wool, face and gold cracks.

原画: public/assets/highland-motions/sources/rock-horn-goat/idle-generated.png

## rock-horn-goat / move-1

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: rock-horn-goat, stocky gray-brown shaggy goat with huge round curled stone horns, cream face/chest fur, stone patches with gold cracks on legs and back.
Composition: Exactly 3 columns by 1 row, wide 1536x512 transparent canvas, equal cells with clear gutters. Full character fits each at same scale, .1 margins. Hip x=.55, hoof contact y=.84. LEFT-facing muzzles.
First half walk: 1 NEAR front hoof stretches LEFT/front (.31,.84) with FAR front hoof back/right (.52,.84); 2 NEAR hoof passes beneath shoulder (.45,.84), FAR forehoof lifts (.44,.68); 3 NEAR hoof sweeps BACK/right (.55,.84), FAR hoof reaches LEFT raised (.28,.75). Hindlegs move in opposite diagonal pairs. Distinct sequential leg positions. FIRST HALF of a six-frame looping heavy goat walk, facing LEFT in-place. 1 near front hoof reaches left/front (.35,.84), far rear hoof extends rear/right (.73,.84); 2 near front hoof sweeps under shoulder (.46,.84), other diagonal pair supports, body rises .01; 3 near front hoof moves back (.54,.84), far front leg begins swing left, body lowers. Keep four hoofed limbs and curled stone horns correct. Head subtly nods with heavy weight, shaggy wool follows.
Targeted correction prompt:
Use case: identity-preserve. Correct one gait phase in input image 2, which is a 3-column/1-row LEFT-facing rock-horn-goat walk sprite sheet. Input image 1 is canonical design. Keep leftmost and middle cells unchanged. Change ONLY the RIGHTMOST cell's FOUR LEGS to an unmistakably DIFFERENT return swing: visible near front leg remains planted BACK under chest, while the other far front leg is STRAIGHT EXTENDED DIAGONALLY FORWARD LEFT with its hoof in the AIR at cell local (.24,.72), not folded upward as in the middle frame. The lifted foreleg is not curled; it extends far forward from shoulder. Near hind hoof moves FORWARD LEFT under belly (.55,.78), far hind hoof supports REAR RIGHT (.75,.84). Preserve head, horns, shaggy wool, stone leg armor/gold cracks, body, colors, and camera. Same character scale and local ground y=.84. Exactly 3 sprites in 1 row on genuine transparent canvas, generous margins, no frame marks, text, scene, effect, or extra limbs. No identical leg poses between middle and right frames.

原画: public/assets/highland-motions/sources/rock-horn-goat/move-1-generated.png

## rock-horn-goat / move-2

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: rock-horn-goat, stocky gray-brown shaggy goat with huge round curled stone horns, cream face/chest fur, stone patches with gold cracks on legs and back.
Composition: Exactly 3 columns by 1 row, 1536x512 transparent canvas, equal cells with clear gutters, .1 margins; same full-body scale. Hip x=.55, ground y=.84. LEFT-facing muzzle. This is the OPPOSITE leg half-cycle from the first walk, same in-place direction.
Three distinct consecutive hoof poses: LEFT cell/frame4: FOREGROUND near front leg clearly slopes BACK/RIGHT, hoof at (.55,.84); partially occluded far front leg reaches FORWARD/LEFT with hoof (.30,.84). Near rear hoof reaches back/right (.76,.84). MIDDLE cell/frame5: foreground near front leg now FOLDED and LIFTED UP, hoof (.44,.65), far front leg supports ground (.38,.84), near rear hoof beneath belly (.63,.84). RIGHT cell/frame6: foreground near front leg STRAIGHT EXTENDED diagonally FORWARD/LEFT with hoof floating (.24,.72), far front leg slopes backward to ground (.52,.84); near rear leg steps forward under body. Bent center leg and straight right leg must be visibly DIFFERENT. Body bob .01 height; beard/fur follow. Keep armor/gold cracks on moved legs.

原画: public/assets/highland-motions/sources/rock-horn-goat/move-2-generated.png

## rock-horn-goat / reaction

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: rock-horn-goat, stocky gray-brown shaggy goat with huge round curled stone horns, cream face/chest fur, stone patches with gold cracks on legs and back.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equal cells with clear gutters and .1 margins including complete curved stone horns. Hip x=.55, hoof ground y=.84, same scale all cells. Muzzle LEFT.
Frame choreography: Four DISTINCT goat reactions row-major. 1 HURT: shoulders recoil right, curled horns tip upward, near front knee bends and face tightens. 2 RECOVER: four hooves regain support, head angles left again. 3 DYING: both front knees buckle, torso tips toward camera-side and down, head descends, full horns intact. 4 DEAD TERMINAL: full intact goat lying on side, low at contact line y=.84, eyes closed, four folded legs/hooves and the circular stone horns recognizable. No cracked-off pieces or blood. Final pose clearly permanently defeated.

原画: public/assets/highland-motions/sources/rock-horn-goat/reaction-generated.png

## rock-horn-goat / charge

Use case: stylized-concept. Asset type: isolated battle sprite animation source sheet for an idle RPG. Input image 1 is the canonical character design reference, not a pose to repeat. Match its exact recognizable anatomy, horn shape, fur markings, colors, shading, crisp pixel-art-style edges, and three-quarter side camera. The character faces LEFT in EVERY frame. Preserve the reference design rather than redesigning it. Transparent PNG with genuine alpha, no background, floor, shadow blob, grid lines, labels, text, border, watermark, or UI. All cells contain exactly one full character, at the same camera scale, no overlap between cells. Keep horns, ears, all legs, and tail fully inside each cell with ample transparent margins. Use consistent dark outlines and reference light direction. No blood, body damage, body disintegration, additional creatures, or props. Do not attach attack effects or trails to this body sheet; effects will be separate.
Subject: rock-horn-goat, stocky gray-brown shaggy goat with huge round curled stone horns, cream face/chest fur, stone patches with gold cracks on legs and back.
Composition: Exactly 2 columns by 2 rows, 1024x1024 transparent canvas, equal cells, clear gutters and .1 margins including all horns/hooves. Hip x=.55, ground y=.84, same scale. Muzzle LEFT in all poses. Distinguish strong lowered-head charge from neutral standing.
Frame choreography: Four-frame short horn CHARGE, row-major. 1 one-second telegraph pose: head lowered left, horn leading edge at (.24,.50), shoulders crouch, front hoof scrapes but no dust. 2 short launch: hindlegs extend to push, torso leans left, head at (.20,.53), forehooves reach ahead. 3 impact/bracing pose: neck and stone horn thrust left at (.18,.55), shoulders low and forehooves gathered under chest. 4 recovery: front legs plant wide, torso rises, head lifts back toward neutral. No target, impact, dust or force wave attached.

原画: public/assets/highland-motions/sources/rock-horn-goat/charge-generated.png

## iron-horn / idle

Create a transparent PNG game sprite sheet of the EXACT armored goat in the reference. Crisp pixel-art-style matching the reference's fur, enormous black iron spiral horns, gold seams, heavy chest/shoulder armor and four hooves. All sprites face LEFT, same three-quarter camera and same scale. Exactly 4 full-body frames in a 2x2 grid, no grid lines, text, background or effects. Keep every horn and hoof within its own cell, with 10% clear alpha margins. Feet at 84% cell height, hips at 55% cell width. Animation is alert IDLE breathing, row-major: 1 neutral, 2 armored chest rises/head rises slightly/beard sways, 3 exhale/head dips/beard lowers, 4 return toward neutral. Four feet stay planted, armor shape and reference colors identical across frames. No extra objects or particles.

原画: public/assets/highland-motions/sources/iron-horn/idle-generated.png

## iron-horn / move-1

Transparent PNG game sprite sheet of the EXACT armored goat in reference. Preserve huge black iron spiral horns, gold seams, cream wool, heavy chest/shoulder/leg armor, four hooves, crisp pixel-art-style. Exactly 3 full-body poses in 1 row, equal cells, LEFT-facing three-quarter camera and same scale, .1 clear alpha margins. Hip x=.55, ground y=.84 in each cell. No background, labels, grids, effects or extra limbs. FIRST HALF six-frame in-place heavy walk: 1 foreground near forehoof planted FORWARD LEFT (.30,.84), far forehoof supports behind (.54,.84), far hind hoof reaches rear (.75,.84); 2 far foreleg bends/lifts, hoof (.43,.65), near forehoof supports (.43,.84), hindlegs pass under body; 3 far foreleg STRAIGHT EXTENDS forward left, airborne hoof (.24,.72), near foreleg supports BACK/RIGHT (.54,.84), hindlegs diagonal alternate. Middle and right leg poses must be clearly different: curled up then straight out. Body bobs .01; horns remain intact, armor stays on moved legs.

原画: public/assets/highland-motions/sources/iron-horn/move-1-generated.png

## iron-horn / move-2

Transparent PNG sprite animation of EXACT armored goat from reference: huge black iron spiral horns, gold seams, cream wool, heavy plated armor and four hooves, pixel-art-style. Exactly 3 equal cells in one horizontal row, all LEFT-facing at same three-quarter camera/scale; 10% alpha margins, ground y=.84, hips x=.55. No background, grids, text or effects. Opposite WALK half-cycle: 1 distant front leg reaches forward LEFT, visible foreground front leg supports behind; visible rear leg lifts under belly. 2 distant front leg folds UP with hoof at (.30,.65), foreground front leg remains planted, visible rear hoof extends back/right in air. 3 distant front leg STRAIGHT EXTENDS forward/LEFT, hoof airborne (.22,.72), foreground front leg planted back (.55,.84), visible rear hoof replants (.75,.84). Folded center foreleg and straight right foreleg clearly differ. Maintain horns, leg armor and palette in every frame.

原画: public/assets/highland-motions/sources/iron-horn/move-2-generated.png

## iron-horn / reaction

Transparent PNG sprite sheet of EXACT heavy armored goat from reference, pixel-art-style. Same black iron spiral horns, cream wool, gold seams, chest/shoulder/leg plates and four hooves. Exactly 4 full-body LEFT-facing three-quarter poses in 2x2 equal cells, same scale, 10% clear alpha margins. Ground y=.84, hips x=.55. Row-major: 1 HURT: shoulders jerk BACK/right, horns tip UP, near foreknee bends, eyes shut tight. 2 RECOVER: head returns LEFT and four hooves regain stance. 3 DYING: both front knees collapse, shoulders descend, intact torso tips to side. 4 DEAD TERMINAL: complete goat lies low on SIDE at y=.84, eyes CLOSED, legs folded, horns and armor intact. This last frame clearly permanently defeated, no standing. No blood, missing parts, text, grids, effects or background.
Background correction prompt:
Use case: background-extraction. Remove ONLY the entire dark brown/gray gradient background from this sprite sheet and replace it with genuine fully transparent alpha. Preserve all four goat sprites exactly, their colors, dark outlines, complete horns, legs, armor and poses, at the exact same positions and sizes. No color matte, checkerboard baked into pixels, shadow blobs, gradient, scene or background pixels. Transparent empty space must separate all 4 sprites. Keep 2 columns x 2 rows, no cropping.

原画: public/assets/highland-motions/sources/iron-horn/reaction-generated.png

## iron-horn / sweep

Transparent PNG game sprite animation of EXACT armored goat from reference. Pixel-art-style, huge black iron spiral horns, cream wool, gold-seamed heavy armor and four hooves. 4 full-body LEFT-facing three-quarter poses in 2x2 equal cells, same scale, 10% alpha margins, hips x=.55, hoof ground y=.84. No text/grid/background/effects. HORN SWEEP, row-major: 1 windup pulls head BACK/right, near horn leading edge (.37,.34), rear feet anchored; 2 head pivots toward camera/LEFT, horn edge (.22,.43); 3 contact arcs horn down/LEFT to (.18,.59), neck extends and foreleg braces; 4 head rises to neutral (.28,.37), shoulders square. BOTH coiled horns must stay intact and visible. Muzzle remains predominantly LEFT; no full turnaround. No slash arc, debris or external effects on body sheet.

原画: public/assets/highland-motions/sources/iron-horn/sweep-generated.png

## iron-horn / charge

Transparent PNG sprite animation of EXACT heavy armored goat in reference. Pixel-art-style, huge black iron spiral horns, gold seams, cream wool, heavy chest/shoulder/leg plates and four hooves. 4 full-body LEFT-facing three-quarter poses in 2x2 equal cells, same scale, 10% clear alpha margins, hips x=.55, ground y=.84. No text/grid/background/trail/effects. LONG STRAIGHT CHARGE, row-major: 1 telegraph crouch, front knees bent, head LOW left and horn edge (.24,.48); 2 launch, hindlegs PUSH rear/right, front hooves lifted forward, torso stretches, horns (.20,.51); 3 full speed horizontal LEFT drive, forelegs TUCK under chest and hindlegs cycle forward, horns (.18,.53); 4 brake, front hooves planted FORWARD to resist momentum, chest rises/head lifts. Direction stays straight LEFT, distinct legs in each frame, intact horns/armor.

原画: public/assets/highland-motions/sources/iron-horn/charge-generated.png

## iron-horn / rocks

Transparent PNG game sprite animation of EXACT armored goat from reference. Pixel-art-style; huge black iron spiral horns, gold seams, cream wool, heavy chest/shoulder/leg plates, four hooves. Exactly 4 full-body LEFT-facing three-quarter poses in 2x2 equal cells, same scale, 10% alpha margins, hips x=.55, hoof ground y=.84. No background/grid/text/particles/rocks/projectiles/effects. ROCK VOLLEY body motion, row-major: 1 windup: head/horns tilt UP/BACK, armored chest rises, four hooves brace; 2 first emission gesture: head THRUSTS LEFT/forward, horns toward (.22,.46), shoulders compress; 3 sustained second/third emission gesture: head dips farther left/down (.21,.57), forehooves STOMP into planted ground y=.84, shoulder plates angle forward, focused eyes; 4 recovery: head/chest return neutral. Keep all reference armor intact. The 3 emitted rock shards belong to a separate effect, do NOT draw them here.

原画: public/assets/highland-motions/sources/iron-horn/rocks-generated.png

## harpy-queen / idle

Use case: stylized-concept
Asset type: production pixel-art RPG enemy animation sprite sheet with actual transparent background.
Input image: reference image of harpy queen; preserve her adult face, gold crown with purple gem, long lavender hair, white and blue-violet feather wing-arms, gold costume and bird talons, exact original palette and ornate pixel-art texture. This is an animation reference, not a background.
Primary request: 4-frame airborne IDLE loop, evenly spaced 2 columns by 2 rows on a square transparent PNG, frames reading top-left, top-right, bottom-left, bottom-right. Left-facing 3/4 full body. She is flying in ALL four frames, NEVER standing, never perching. Both knees folded upward/backward, bird talons curled, feet clearly above an invisible ground plane. NO ground, floor, drop shadow, frame border, grid, text or numbers.
Frame coordinate design: use local cell coordinates 0..100. Crown/head center (48,30), torso center (49,48), hips (50,60), folded talons (53,68); invisible ground y94. Keep head width and body size identical. Frame1 wing tips high at (14,20),(87,17), torso y48. Frame2 wings reach sideways (8,48),(92,43), torso y46. Frame3 wing tips downward (19,77),(83,73), torso y49. Frame4 wings lift diagonally (12,42),(89,36), torso y50. This is a complete smooth upstroke->downstroke->upstroke cycle returning to frame1. Wing-arms, long hair, tail feathers follow the flap with small secondary motion, no duplicated feathers, hands or extra limbs. Folded legs remain clearly airborne through all frames.
Constraints: four independent equal cells; each entire silhouette inside local x7..93,y8..88; generous completely transparent gutters between cells and around canvas; same scale, perspective, lighting, colors in every frame; crisp hard pixel-art edges, no soft paint, no perspective change or camera movement; do not crop crown, wing tips, hair or talons. Character only. Real alpha transparency, not checkerboard.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\idle-generated.png

状態: accepted-source

## harpy-queen / move

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Harpy queen: adult feminine face, gold crown with purple gem, long lavender hair, white and blue-violet wing-arms, gold costume, two bird legs. Except the last defeat frame she must fly: knees clearly folded backward/up, talons curled and suspended. NEVER standing/perching/grounded in any idle, movement, attack or hit frame. Invisible ground y94. Preserve feather anatomy.
Frame positions use cell-local 0..100 coordinates. AIRBORNE FORWARD FLIGHT LOOP. Body leans 15 degrees left, head(43,31), torso(47,47), folded feet(57,65), hair streams toward right. F1 wings up tips(13,16),(87,19); F2 wings out tips(9,46),(91,40), body y45; F3 wings down tips(18,79),(85,75), body y48; F4 wings diagonal up tips(13,38),(88,33), body y49. Smooth flap cycle. Do not translate character out of cell. Legs remain tucked in ALL frames.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\move-generated.png

状態: accepted-source

## harpy-queen / reaction

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Harpy queen: adult feminine face, gold crown with purple gem, long lavender hair, white and blue-violet wing-arms, gold costume, two bird legs. Except the last defeat frame she must fly: knees clearly folded backward/up, talons curled and suspended. NEVER standing/perching/grounded in any idle, movement, attack or hit frame. Invisible ground y94. Preserve feather anatomy.
Frame positions use cell-local 0..100 coordinates. Four reaction poses: F1 HIT onset airborne recoil: torso(51,47), head(53,29), wings flaring, knees tucked. F2 HIT recovery: return torso(49,48), head(48,30), wings mid-flap, still flying. F3 DEFEAT falling: torso(50,54), head(45,41), eyes closed, wings slack diagonally above, folded feet extend downward slightly at(57,78); clearly falling, still no contact. F4 DEFEAT landed: queen lies collapsed horizontally near local ground y85, head(30,73), torso(47,79), legs(70,83), crown stays on head, wings folded low along fallen body. Entire fallen silhouette fits within cell. Only F4 grounded; no other ground contact. No blood or injury gore. No flash overlay obscuring identity.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\reaction-generated.png

状態: accepted-source

## harpy-queen / feathers

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Harpy queen: adult feminine face, gold crown with purple gem, long lavender hair, white and blue-violet wing-arms, gold costume, two bird legs. Except the last defeat frame she must fly: knees clearly folded backward/up, talons curled and suspended. NEVER standing/perching/grounded in any idle, movement, attack or hit frame. Invisible ground y94. Preserve feather anatomy.
Frame positions use cell-local 0..100 coordinates. AIRBORNE THREE-DIRECTION FEATHER SHOT: F1 wind-up, torso(49,48), wings high tips(17,18),(85,20). F2 wings draw inward, torso(49,46), crown(48,25), wing tips(27,35),(75,38). F3 thrust wings left/sideways, torso(49,48), tips(10,48),(84,51), three distinct white/blue feather projectiles leave toward left-up,left,left-down from x16 at y35,50,65. Feather paths brief and separate; body readable. F4 recovery to wings raised, torso(49,49). All4 knee-tucked flying. Minimal cyan launch streaks only, no complete screen VFX; projectile asset generated separately.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\feathers-generated-v1.png

状態: rejected-source

## harpy-queen / feathers

Use case: background-extraction
Asset type: transparent production pixel-art RPG 4-frame 2x2 harpy queen feathers attack sprite sheet.
Image1 is original identity/palette reference. Image2 is edit target: change only background into actual transparent alpha. Preserve all four character poses, folded airborne legs, wing feathers, crown, gold details, hair, face, and three white/blue projectile feathers with their small cyan launch streaks EXACTLY. Remove ALL dark, violet, teal, blurred glow/backdrop or decorative backdrop surrounding characters, including its opaque pixels in feather/wing gaps. Keep only character and the three projectile feathers, no ground, shadow, panels, checkerboard, text, labels. Fit all silhouettes inside 4 equal cells in a transparent square 2x2 grid with clear transparent gutters. Preserve same pixel-art colors, sharpness, dimensions of each character and same frame order. Real alpha transparency is essential; no painted simulated transparency.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\feathers-generated-v2.png

状態: rejected-source

## harpy-queen / ring

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Harpy queen: adult feminine face, gold crown with purple gem, long lavender hair, white and blue-violet wing-arms, gold costume, two bird legs. Except the last defeat frame she must fly: knees clearly folded backward/up, talons curled and suspended. NEVER standing/perching/grounded in any idle, movement, attack or hit frame. Invisible ground y94. Preserve feather anatomy.
Frame positions use cell-local 0..100 coordinates. AIRBORNE WIND CIRCLE CAST: F1 draw wings inward while airborne, torso(49,48), wing tips(30,40),(74,42). F2 arc wings upward, tips(16,16),(86,18), small cyan-white curved wind streak below hips. F3 sweep wings sideways tips(9,44),(91,42), a partial thin turquoise spiral arc encircles lower body x20..80,y60..79, center remains transparent and does not hide character. F4 raise wings diagonally, wind dissipates into 3 small pale cyan motes. Body/face scale identical and legs tucked in all4; circular full effect made separately.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\ring-generated.png

状態: accepted-source

## harpy-queen / dive

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Harpy queen: adult feminine face, gold crown with purple gem, long lavender hair, white and blue-violet wing-arms, gold costume, two bird legs. Except the last defeat frame she must fly: knees clearly folded backward/up, talons curled and suspended. NEVER standing/perching/grounded in any idle, movement, attack or hit frame. Invisible ground y94. Preserve feather anatomy.
Frame positions use cell-local 0..100 coordinates. AIRBORNE DIVE AND RECOVERY, no landing: F1 anticipation ascending slightly, head(49,22), torso(50,39), both wings lifted, folded feet(53,58). F2 tuck both wings back, dive diagonally down-left, body rotates 30deg left, head(37,42), torso(49,53), feet(61,67); white/blue tips stream back. F3 lowest dive strike, body rotates 50deg left, head(33,56), torso(49,65), folded talons reach slightly forward at(40,77), wings swept backwards and safely in cell; still clearly above ground y94. F4 recovery climbing, upright head(47,31), torso(49,48), wings spread upward, feet folded back at(54,66). No grounded pose, no fake ground shadow, no impact floor. Maintain same body volume and outfit.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\harpy-queen\dive-generated.png

状態: accepted-source

## wind-sprite / idle

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Wind sprite: small mint-cyan elf face, teal eyes, pointed ears, leaf-and-white-flower crown, bronze/gold collar, flowing cyan-turquoise wind hair and spiraling wind body with green leaves. ALWAYS floating. Preserve its lower wind spiral, no human legs. Crown center around(45,25), face(43,37), torso(47,52), wind-tail tip(54,84), constant overall scale.
Frame positions use cell-local 0..100 coordinates. FLOATING IDLE LOOP: F1 neutral at listed reference anchor, leaves crown steady, spiral curves right. F2 face/crown 2 units higher, arms relaxed, lower spiral opens 5 units. F3 face 1 unit lower, tail coils left 5 units, leaves drift a small arc. F4 reference height, tail returns toward right, hair gently settles. Four subtle yet distinct poses, smooth F4 to F1. Preserve recognizable face and proportion, wind remains teal/cyan, leaves green.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\wind-sprite\idle-generated.png

状態: accepted-source

## wind-sprite / move

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Wind sprite: small mint-cyan elf face, teal eyes, pointed ears, leaf-and-white-flower crown, bronze/gold collar, flowing cyan-turquoise wind hair and spiraling wind body with green leaves. ALWAYS floating. Preserve its lower wind spiral, no human legs. Crown center around(45,25), face(43,37), torso(47,52), wind-tail tip(54,84), constant overall scale.
Frame positions use cell-local 0..100 coordinates. FLOATING FORWARD MOVEMENT LOOP facing left. Head(40,32), torso(45,49), tail(67,78), arms angled slightly back, long hair and spiral wind flow right. F1 tail curves up to right, hair trails at y39. F2 body 2units higher, tail unwinds down-right toward(72,82), leaves drift behind. F3 body1unit lower, spiral curls inward(62,75), hair tips rise. F4 body neutral, tail opens midway(67,78) back to F1. Keep all parts within x8..92 y8..92, same scale; no duplicate bodies or ground.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\wind-sprite\move-generated.png

状態: accepted-source

## wind-sprite / reaction

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Wind sprite: small mint-cyan elf face, teal eyes, pointed ears, leaf-and-white-flower crown, bronze/gold collar, flowing cyan-turquoise wind hair and spiraling wind body with green leaves. ALWAYS floating. Preserve its lower wind spiral, no human legs. Crown center around(45,25), face(43,37), torso(47,52), wind-tail tip(54,84), constant overall scale.
Frame positions use cell-local 0..100 coordinates. Four reaction poses: F1 HIT recoil right, face(49,37), arms drawn in, wind spiral squeezed, hair and leaves fling right modestly. F2 HIT recover floating to neutral, same face/head scale, no human legs. F3 DEFEAT body curls downward, face(43,49) eyes closed, bronze ornaments and leaves gather close, lower teal wind spiral breaks into 4 distinct curling segments. F4 DEFEAT collapsed wind remnant close to local y77: tiny intact face with closed eyes and leaf crown at(41,65), loose crown leaves, teal spiral collapsed beneath. Reduce wind volume but retain identifiable spirit. No dismemberment, no replacement glowing ball.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\wind-sprite\reaction-generated.png

状態: accepted-source

## wind-sprite / blade

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Wind sprite: small mint-cyan elf face, teal eyes, pointed ears, leaf-and-white-flower crown, bronze/gold collar, flowing cyan-turquoise wind hair and spiraling wind body with green leaves. ALWAYS floating. Preserve its lower wind spiral, no human legs. Crown center around(45,25), face(43,37), torso(47,52), wind-tail tip(54,84), constant overall scale.
Frame positions use cell-local 0..100 coordinates. WIND BLADE CAST facing left: F1 draw both hands inward at(47,50), head at reference. F2 extend leading hand toward(27,47), small cyan-white compressed crescent begins at(24,47). F3 thrust hand left at(25,46), separate bright turquoise-white crescent blade at x11..24,y36..58, trailing green leaves curve away; keep face unobscured. F4 arm returns, blade left cell removed, faint 2 cyan motes only. Body spiral flexes but returns idle. Full projectile is separate.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\wind-sprite\blade-generated.png

状態: accepted-source

## wind-sprite / retreat

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Wind sprite: small mint-cyan elf face, teal eyes, pointed ears, leaf-and-white-flower crown, bronze/gold collar, flowing cyan-turquoise wind hair and spiraling wind body with green leaves. ALWAYS floating. Preserve its lower wind spiral, no human legs. Crown center around(45,25), face(43,37), torso(47,52), wind-tail tip(54,84), constant overall scale.
Frame positions use cell-local 0..100 coordinates. SINGLE BACKWARD RETREAT then stabilize, still faces left. F1 startled leaning right, face(43,37), arms open slightly, spiral compressed. F2 pushes backward to right internally 4units, head(48,36), torso(51,51), wind tail curves strongly left(30,78). F3 brakes, head(47,36), torso(49,52), arms forward, hair streams left briefly; leaves arc toward left. F4 returns neutral floating centered(45,37) and stable wind coil. Movement is small within local cell; do not change facing or scale. No legs/ground.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\wind-sprite\retreat-generated.png

状態: accepted-source

## manticore / idle

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. GROUND IDLE LOOP, same paws fixed y84. F1 neutral reference stance head(28,42), torso(51,57), purple wings half-folded. F2 inhale torso raises 2units, mane lifts slightly, tail green stinger raises(78,28). F3 exhale torso lower1, wings flex inward, tail stinger shifts(83,32). F4 returns near neutral, wings flex outward slightly and tail(81,29). 4 small distinct poses. Four paws anatomically consistent. Wings/tail completely visible.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\idle-generated.png

状態: accepted-source

## manticore / move-1

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 3 independent full-body frames in an evenly spaced 3 columns by 1 row layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. LEFT-FACING SIX-FRAME WALK FIRST HALF, 3 consecutive frames in a wide row. Same body scale, paws contact y84, head(28,43), body(51,58), no translation. F1 near front paw reaches forward left to x17,y84; far front paw lifts back atx35,y75; near rear paw pushes back atx74,y84; far rear lifts forward atx60,y76. F2 passing pose front paws nearx25/32, near paw lifts at y74; rear paws nearx65/70, far rear contacts y84. F3 near front paw pulled back atx35,y84, far front reaches leftx18,y84; near rear lifts forwardx59,y76, far rear pushes backx77,y84. Head bobs y43->41->42. Purple wings folded high, tail stinger follows gentle arc. Distinct four leg placements, NEVER add legs; continuation walk-2 starts opposite support.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\move-1-generated.png

状態: accepted-source

## manticore / move-2

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 3 independent full-body frames in an evenly spaced 3 columns by 1 row layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. LEFT-FACING SIX-FRAME WALK SECOND HALF, 3 consecutive frames in a wide row. Same body scale and anchors as reference and previous first half, paws y84, head(28,43), body(51,58). F4 far front paw forwardx17,y84; near front lifts backx35,y75; far rear pushes backx74,y84; near rear lifts forwardx60,y76. F5 passing front paws x25/32, far front lifts y74, near front contacts; rear pawsx65/70 with near rear contacts. F6 far front pulls backx35,y84, near front reaches forwardleftx18,y84; far rear lifts forwardx59,y76, near rear pushes backx77,y84. Head bobs y43->41->42. Purple wings folded high, same coiled purple/gold tail and green stinger. Smooth continuation into first half F1. Exactly 4 feline legs.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\move-2-generated.png

状態: accepted-source

## manticore / reaction

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. Four reaction poses: F1 HIT lion recoils right, torso(53,57), head(33,42), forelegs brace, wings flare small. F2 HIT recovery to neutral head(28,42), mane settles, tail tense. F3 DEFEAT knees buckle, head(29,59), torso(51,68), wings droop, tail uncoils lower but fully in cell. F4 DEFEAT fallen lying on flank near y82, head(28,72), torso(52,77), four paws fold near body, mane rests, purple wings folded over back, coiled tail lies right, green stinger dims but keeps green. No gore, no disappearance, preserve full character identity.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\reaction-generated.png

状態: accepted-source

## manticore / double-claw

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. TWO-STRIKE CLAW ATTACK, four stages: F1 raise near front paw up-back to(34,33), head(28,42), near shoulder twists, other three paws stabilize. F2 near forepaw slashes diagonal down-left to(14,66), thin pale-gold/white claw marks arc behind paw, far front paw begins lift. F3 far front paw swipes horizontal-left from(34,45) to(12,48), second distinct slash arc; near paw returns toward ground. F4 both forepaws return to neutral y84, mane and wings settle. Each stage exactly four legs, same anatomy. Wings half-folded, venom tail same colors; marks should not hide body. Full slash VFX separate.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\double-claw-generated.png

状態: accepted-source

## manticore / venom

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. VENOM TAIL FAN SHOT: F1 coil segmented tail tightly on right, stinger(80,34), lion body stays grounded. F2 raise and hook tail over back, stinger(66,18), green glow at venom barb, purple wings fold to make tail readable. F3 whip tail stinger toward left at(47,24), 3 discrete bright green narrow venom needles shoot toward left-up,left,left-down from x30 at y20,30,40, nothing obscures human face. F4 tail recoils right to(81,34), glow subsides. Tail visibly segmented dark-purple/gold, green tip. Four grounded paws unchanged. Full projectiles separate.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\venom-generated.png

状態: accepted-source

## manticore / gust

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. BAT-WING WIND GUST: F1 purple bat wings raised high, tips(28,13),(87,14), four paws grounded y84. F2 wings sweep wide to(9,41),(91,43), chest rises 2 units, mane tossed. F3 powerful wings down to(18,68),(88,71), brief thin cyan-white gust lines to leftx9..28,y46..63, dark purple wing membranes retain color and no feather conversion. F4 wings fold to reference stance and paws remain fixed. Never hide human face/head, segmented venom tail stays fully visible. Full gust VFX separate.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\gust-generated.png

状態: accepted-source

## manticore / pounce

Use case: stylized-concept
Asset type: production pixel-art RPG animation sprite sheet on real transparent alpha background.
Primary request: exactly 4 independent full-body frames in an evenly spaced 2 columns by 2 rows layout; order left-to-right then top-to-bottom. No labels, numbers, dividers, grid, floor, ground shadow, background, checkerboard or watermark.
Input reference: preserve the exact reference character identity, palette, proportions, gold ornaments, original pixel-art texture and left-facing 3/4 view. Same camera, face size, body size, lighting and colors across every frame. Pixel art, hard edges. Generous transparent separation. Every cell silhouette entirely within its local x8..92,y8..92; never cross cell boundaries or crop wing, tail, horn, crown or hair.
Manticore: red-brown lion body and deep crimson mane, fierce adult human face, two gold horns, gold-purple harness and ornaments, purple bat wings, segmented dark purple/gold venom tail with bright green stinger. Four feline legs, large black claws. Preserve anatomy: no extra legs or wings. Face toward left. Standing base has paws y84, head(28,42), torso(51,57), tail coil(81,45).
Frame positions use cell-local 0..100 coordinates. FLYING POUNCE AND LAND: F1 deep crouch paws y84, head(28,52), body(51,64), purple wings raised for takeoff. F2 airborne ascending, head(29,33), torso(52,44), all four paws tucked clearly off ground at y60, wings extended high. F3 airborne attack lunging diagonally down-left, head(26,46), torso(49,55), front claws reach left(12,66), hind legs tucked(69,65), wings swept backward, entire silhouette still above ground. F4 landed low crouch, forepaws x18/33,y84, hind paws x66/76,y84, head(28,55), wings flare for braking, tail stable, tiny pale sand motes near paws only. Same scale/palette/horns/face in all frames; body moves within cell but no crop.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\manticore\pounce-generated.png

状態: accepted-source

## effects / wind-blade

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame leftward turquoise/cyan crescent WIND BLADE projectile. F1 compact sharp crescent at localx44..62,y37..64. F2 opens taller x30..66,y24..76 with 2 trailing cyan streaks on right. F3 maximum broad crescent x23..72,y18..82, white bright cutting rim facing left, fine green leaf motes around trailing inner curve, interior remains transparent. F4 breaking crescent x30..65,y27..73 plus 4 cyan shards fading outward. Keep identical direction and turquoise palette; readable hard-edged bright arc, no character, weapon, scene or giant glow.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\wind-blade-generated.png

状態: accepted-source

## effects / feather

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame harpy FEATHER projectile pointing LEFT, white narrow feather with blue-violet tip, slim gold accent spine, crisp pixel edges. F1 compressed feather at centerx45,y50 with tiny cyan tail trail to right. F2 extended arrow-like feather tipx23y50, quill tox70y50, white serrated feather barbs taper aroundy43..57. F3 bright full feather x16..78,y38..62 with 2 thin cyan speed lines on right. F4 feather breaks into 3 white/blue fragments along forward-left diagonal while 2 tiny cyan motes disperse. Not a bird, not a fan of many feathers. Exactly one projectile per cell until fragments; no character, wing, sky or labels.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\feather-generated.png

状態: accepted-source

## effects / wind-ring

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame WIND RING for harpy queen, viewed as a low elliptical ring in 3/4 battlefield plane. ALL frames have a genuinely alpha-transparent EMPTY CENTER, no white disc, no filled vortex, no character. F1 thin cyan-white arcs begin aroundcenter(50,53), ring elliptical radii20x9. F2 ring expands radius31x14, bright curved white inner rim and aqua outer edge. F3 maximum radius41x19 around(50,53), several teal-green leaf motes circulate clockwise OUTSIDE rim only; center entire x18..82,y44..63 remains mostly transparent. F4 ring splits into 5 short arcs and motes fading outward, same ellipse radius38x17. Keep full ring safely withinx7..93,y22..80, clear empty transparent center; pixel-art strokes, no haze disc or background.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\wind-ring-generated.png

状態: accepted-source

## effects / wind-gust

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame leftward WING GUST effect, broad horizontal cyan-white wind ribbons with pale teal edges, low intensity pale green tiny motes. F1 small parallel 3 ribbons compressed x46..68,y40..62. F2 3 sweeping curved ribbons fan toward left x22..75,y28..76. F3 maximum x10..88,y20..82, leftward C-shaped front, narrow sharp white leading edges, transparent gaps BETWEEN ribbons, small leaves trail right. F4 ribbons thin and break into 5 wisps and cyan pixel motes x20..82,y25..78. No character, no feathers, no wings, no opaque fog. Direction and overall origin stay constant center(50,52). Crisp pixel art.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\wind-gust-generated.png

状態: accepted-source

## effects / venom

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame glowing VENOM NEEDLE projectile from manticore. Bright acid/lime green faceted narrow venom barb, dark emerald shadow edge, tiny pale yellow central highlight. Points straight LEFT, centered(50,50). F1 compact needle x40..59,y45..55. F2 long narrow tapered thorn x25..70,y42..58 with thin green trailing line to right. F3 longest sharp diamond needle x17..79,y40..60, 3 tiny green droplets trailing right; sharply recognizable needle, not leaf, not feather, not staff. F4 shatters into 3 pointed green pieces x25..75,y40..65 and 3 green droplets. Exactly single narrow projectile before fragments. No character, tail, scenery, broad gas or aura.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\venom-generated.png

状態: accepted-source

## effects / claw

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame CLAW SLASH effect independent of creature: THREE distinct parallel curved cutting streaks, cream-white leading core, warm gold rim, thin deep red shadow edge. F1 three short diagonal streaks start upper-right(63,32). F2 streaks sweep down-left x30..70,y25..70. F3 maximum three parallel crescents running from upper-right(76,20) down tolower-left(20,76), separated by transparent gaps, bright sharp tips, 5 tiny warm sparks. F4 arcs fragment into 6 short trails and sparks x25..76,y25..76. No physical claw, hand, monster, blood, red fluid, weapon or scene. Direction remains down-left. Not electric blue and not a wind circle.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\claw-generated.png

状態: accepted-source

## effects / charge-impact

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame ground-contact CHARGE IMPACT with dust, small gray-brown rock fragments and bright warm white/gold force spokes. Shared contact point(50,78), invisible ground y80. F1 small compressed dust puff x40..60,y65..80, 3 tiny warm contact sparks. F2 burst grows x22..78,y40..80 with 5 angular small rocks fanning upward/sideways. F3 maximum impact x9..91,y21..82, tan dust crescents open left/right around center, gray rock fragments atx20y35,x45y20,x78y35, 6 short bright white/gold impact spokes; transparent gaps and readable silhouette. F4 dust settles low x20..80,y62..82, rocks fall and sparse tan pixels disperse. No literal ground tile or creature, no continuous opacity rectangle. Pixel-art dust, actual alpha.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\charge-impact-generated.png

状態: accepted-source

## effects / bite-impact

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame BITE CONTACT effect, abstract pair of cream-white/gold opposing curved jaw trajectories CLOSING toward center(50,50); no actual mouth, teeth model, animal or body. F1 two slender pale cream curves above y35 and belowy65, tips point towardcenter. F2 curves close toward y45/55 as small triangular fang-like light tips approachcenter. F3 bite closure atcenter with 6 tiny white/gold sharp sparks and compressed crossed pale curves x28..72,y35..65; distinct from 3 parallel claw lines. F4 trajectories disperse into 5 small cream/gold light fragments. No blood, gore, red splash, weapon, creature or scenery. Warm cream/gold palette, crisp bright pixel-art.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\bite-impact-generated.png

状態: accepted-source

## effects / horn-sweep

Use case: stylized-concept
Asset type: 4-frame production pixel-art RPG EFFECT sprite sheet, real transparent alpha PNG. Four independent equally spaced cells in square 2 columns by 2 rows. Read top-left→top-right→bottom-left→bottom-right. Generous completely TRANSPARENT gutters; local cell coordinates0..100; every effect must fit x7..93,y7..91. Same camera, center anchor, pixel scale and palette all4. Hard bright pixel-art strokes and particles, no blurry painted smoke, no full-screen flash. No frame grid, background, checkerboard, scenery, text, labels or watermark. Only the requested effect isolated against actual alpha transparency.
Effect design and temporal path: Four-frame HORN SWEEP effect independent of character/physical horn: a broad low leftward curving ARC in white-silver/gold with small rock-gray angular motes. F1 short arc begins upper-right(64,39), 2 gray flecks. F2 wide sweeping band sweeps down-left x25..75,y28..67. F3 broad fan-shaped low crescent x12..88,y22..79, sharp white silver leading edge facing left, warm gold thin edge and 6 small gray rock grains behind; transparent center and gaps; one WIDE band, NOT three claw scratches. F4 fan arc dissolves into 5 small silver/gold wisps and falling gray grit x25..78,y38..77. No creature, body, horn object, weapon, blood or opaque dust cloud. Crisp pixel-art.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\horn-sweep-generated.png

状態: accepted-source

## effects / rock-shards

Use case: stylized-concept. Production pixel-art RPG effect sprite sheet on real transparent alpha PNG. Exactly 4 independent equally spaced frames in square2x2 grid, order top-left,top-right,bottom-left,bottom-right. Generous transparent gutters; no labels, grid, panel, scene, ground, background of any color, checkerboard or creature. Keep effect in every localcell x8..92,y8..92, constant center(50,50), same crisp pixel scale and palette.
Four-stage LEFTWARD flying ROCK SHARD projectile from iron-horn. Gray/brown angular faceted rock with dark charcoal outline and short bright white/gold speed tail to right. F1 one compact angular gray rock at(52,50) with small gold spark; F2 main rock length22,height16 centered(47,50), front sharp point toleftx34, short white/gold trail to rightx77, two tiny gray grit grains. F3 impacts and breaks: 3 angular gray pieces centeredx36y44,x48y54,x62y49, small white/gold contact star at(42,50), four small gray grains. F4 six smaller gray angular rock pieces and pale gold sparks spreadx24..76,y32..68 and fade. Rock physically gray/brown, not a cyan crescent, feather, green poison needle, blade, animal, horn or weapon. No sand cloud covering shape. True transparency; isolated effect only.

原画: C:\Users\ashit\src\idle_rpgs\idle_rpg_poc\public\assets\highland-motions\sources\effects\rock-shards-generated.png

状態: accepted-source
