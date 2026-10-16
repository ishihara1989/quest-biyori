# 砂漠モーション・エフェクトの生成プロンプト

2026-10-11 JST。組み込み image_gen、透過PNG。各ジョブの基準リファレンスは references/<enemy>.png。座標は1セル内の相対座標。

## sand-scorpion-idle

原画: sand-scorpion-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking.

## sand-scorpion-attack

原画: sand-scorpion-attack-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Ground baseline fixed, concrete action trajectory: Frame1 neutral, pincers at (.25,.68), tail tip at (.60,.20). Frame2 braces, opens both pincers, tail curls back to (.76,.20). Frame3 snaps pincers toward (.16,.62) and thrusts green tail tip over the body to (.20,.38). Frame4 pulls tail and pincers back to the neutral pose.

## sand-scorpion-reaction

原画: sand-scorpion-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame.

## sand-scorpion-move

原画: sand-scorpion-move-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. In-place looping movement to LEFT. Frame1 near-side legs reach forward, far-side legs trail; frame2 near-side legs push under shell, far-side legs lift to pass; frame3 far-side legs contact forward, near-side legs trail; frame4 far-side legs push, near-side legs lift and approach frame1. Shell stays anchored and pincers/tail sway subtly, no striking.

## bandage-soldier-idle

原画: bandage-soldier-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking.

## bandage-soldier-attack

原画: bandage-soldier-attack-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Ground baseline fixed, concrete action trajectory: Frame1 neutral with curved sword held at (.28,.52). Frame2 sword lifts up-left to (.20,.18), right hand firmly holds its hilt at (.40,.42). Frame3 sword slashes down-left to (.12,.66); loose bandage in other hand flings left. Frame4 sword returns to (.28,.52), shoulders settle.

## bandage-soldier-reaction

原画: bandage-soldier-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame.

## bandage-soldier-move-1

原画: bandage-soldier-move-1-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Three frames in a SINGLE horizontal 3x1 row. Walking IN PLACE to LEFT, total cycle split in two parts, this is half 1. Torso center stays x=.55 and ground y=.84 in all frames. Frame1 near-side LEFT leg contact forward at x=.36, far-side RIGHT leg trailing at x=.64. Frame2 LEFT leg supports under body x=.52, RIGHT leg swings forward off ground at x=.48 y=.76. Frame3 LEFT leg trailing x=.62, RIGHT leg approaches front x=.38 y=.80. Sword held steady, loose bandage sways opposite hips, no attack. Arms and legs alternate visibly.

## bandage-soldier-move-2

原画: bandage-soldier-move-2-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Three frames in a SINGLE horizontal 3x1 row. Walking IN PLACE to LEFT, total cycle split in two parts, this is half 2. Torso center stays x=.55 and ground y=.84 in all frames. Frame4 far-side RIGHT leg contacts forward x=.36, near-side LEFT leg trails x=.64. Frame5 RIGHT leg supports x=.52, LEFT leg swings forward off ground x=.48 y=.76. Frame6 RIGHT leg trails x=.62, LEFT leg approaches front x=.38 y=.80, connects smoothly to Frame1 LEFT contact. Sword held steady, loose bandage sways opposite hips, no attack. Arms and legs alternate visibly.

## sand-snake-idle

原画: sand-snake-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-snake-attack

原画: sand-snake-attack-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Ground baseline fixed, concrete action trajectory: Frame1 head at (.35,.37), closed mouth. Frame2 coils tighten, head draws back to (.45,.29), throat expands. Frame3 head lunges to (.22,.36), mouth opens to spit, turquoise crest kept intact. Frame4 mouth closes, head at (.35,.37), coils settle. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-snake-reaction

原画: sand-snake-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-snake-move

原画: sand-snake-move-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. In-place looping movement to LEFT. Frame1 head/upper torso steady x=.55, single serpentine lower body S-coil to left; frame2 wave passes to middle, coil shifts right .04; frame3 wave passes to tail tip, S-coil opposite shape; frame4 wave returns toward left matching frame1. Tail glides on ground, no legs, no extra tails, upper body and clothes consistent. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## obsidian-scorpion-idle

原画: obsidian-scorpion-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## obsidian-scorpion-attack

原画: obsidian-scorpion-attack-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Ground baseline fixed, concrete action trajectory: Frame1 massive black pincers at (.27,.65), tail tip at (.65,.20). Frame2 both pincers spread, tail draws back high at (.78,.16). Frame3 pincers sweep toward (.15,.62), green sting strikes toward (.18,.35). Frame4 retracts tail and closes pincers to neutral. Distinct gold joints remain identical. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## obsidian-scorpion-reaction

原画: obsidian-scorpion-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## obsidian-scorpion-move

原画: obsidian-scorpion-move-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. In-place looping movement to LEFT. Frame1 near-side legs reach forward, far-side legs trail; frame2 near-side legs push under shell, far-side legs lift to pass; frame3 far-side legs contact forward, near-side legs trail; frame4 far-side legs push, near-side legs lift and approach frame1. Shell stays anchored and pincers/tail sway subtly, no striking. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## golden-pharaoh-idle

原画: golden-pharaoh-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## golden-pharaoh-attack

原画: golden-pharaoh-attack-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Ground baseline fixed, concrete action trajectory: Frame1 staff vertical on left, turquoise jewel at (.30,.28), free hand lowered. Frame2 staff lifts to (.26,.15), free hand opens left at (.36,.47). Frame3 staff tilts forward-left with jewel at (.13,.30), free hand extended left, royal cape billows. Frame4 staff vertical at (.30,.28), cape settles. Crown and gold mask identical. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## golden-pharaoh-reaction

原画: golden-pharaoh-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## golden-pharaoh-move

原画: golden-pharaoh-move-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. In-place looping movement to LEFT. Frame1 hovering calm at original anchor, both feet relaxed; frame2 torso floats up .025, long cloth trails right; frame3 torso floats back down, cape trails left; frame4 returns to initial floating height with cloth settling. Legs do not step on ground, staff stays vertical. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## lamia-idle

原画: lamia-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## lamia-attack

原画: lamia-attack-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Ground baseline fixed, concrete action trajectory: Frame1 adult woman upper torso upright, hands by waist, single golden snake tail coiled below. Frame2 upper torso leans right .04, both hands gather at chest, tail curls to right. Frame3 left hand extends to (.16,.43), torso leans left .04, one snake tail sweeps to (.18,.76). Frame4 hands lower and tail coils settle. Preserve adult face, turquoise clothes, gold tiara, single serpentine lower body. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## lamia-reaction

原画: lamia-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## lamia-move

原画: lamia-move-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. In-place looping movement to LEFT. Frame1 head/upper torso steady x=.55, single serpentine lower body S-coil to left; frame2 wave passes to middle, coil shifts right .04; frame3 wave passes to tail tip, S-coil opposite shape; frame4 wave returns toward left matching frame1. Tail glides on ground, no legs, no extra tails, upper body and clothes consistent. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-behemoth-attack

原画: sand-behemoth-attack-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art attack sprite sheet for a desert RPG boss. Reference image: sand-eating Behemoth character; preserve exact creature identity, ochre fur, black rocky plates, two forward horns, turquoise jewelry, proportions, left-facing three-quarter view. Transparent PNG, no background or ground shadow, no text. Four independent complete poses in a spacious equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Frame design in EACH cell normalized coordinates: all feet baseline y=.84, torso center x=.55; frame 1 neutral four-foot stance, horns pointing up-left at (.26,.25); frame 2 crouches to charge, head drops from (.34,.46) to (.28,.60), forelegs fold, horns tilt forward toward (.12,.42); frame 3 short powerful forward lunge, front legs extend to (.20,.82), head at (.25,.48), horns at (.10,.30), all anatomy and ornaments intact; frame 4 recovery to original stance, head at (.34,.46), forelegs again under shoulders, settle ready to loop to frame1. Entire body and horns fully within each cell with minimum 10 percent clear margins; no other creatures, no effects baked into sprite. Sharp chunky pixel clusters and dark contours matching reference at gameplay size. Keep same size, palette, camera and foot anchor in all four cells.

## sand-behemoth-idle

原画: sand-behemoth-idle-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four frames in an equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Natural breathing loop: 1 neutral, 2 inhale chest rises .015 and secondary cloth/crest/tail gently lifts, 3 relaxed exhale down .01, 4 settles to frame1. Grounded feet/tail stay at exactly the same point. No attack pose, no walking. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-behemoth-reaction

原画: sand-behemoth-reaction-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Four independent frames in equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right: 1 hit reaction: body recoils right by .04, eyes wince, limbs brace, no wounds. 2 recovery: neutral pose, eyes normal, same reference. 3 defeat begins: legs/tail lose strength, body crouches down .12, head drops, eyes close. 4 defeated: whole body slumps naturally onto ground y=.84, eyes closed, limbs relaxed, no standing, still identifiable intact creature, no blood. Frame3 to frame4 clearly falls downward. Keep all horns, weapons, tail and cloth in frame. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-behemoth-move-1

原画: sand-behemoth-move-1-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Three frames in a SINGLE horizontal 3x1 row. Walking IN PLACE to LEFT, total cycle split in two parts, this is half 1. Torso center stays x=.55 and ground y=.84 in all frames. Frame1 near-side LEFT leg contact forward at x=.36, far-side RIGHT leg trailing at x=.64. Frame2 LEFT leg supports under body x=.52, RIGHT leg swings forward off ground at x=.48 y=.76. Frame3 LEFT leg trailing x=.62, RIGHT leg approaches front x=.38 y=.80. Quadruped: opposite rear leg follows corresponding diagonal pair, all four legs visible and anatomically consistent, head and rocky back steady. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-behemoth-move-2

原画: sand-behemoth-move-2-generated.png

Use case: stylized-concept. Asset type: pixel-art animation sprite sheet for a desert idle RPG. Reference is the original character design, preserve identity, equipment, palette, proportions, left-facing three-quarter camera. Transparent PNG, no shadow, no scenery, no text, no baked-in effects. Sharp pixel clusters and dark outlines. Independent complete poses with generous transparent gutters and ten percent clear margins. Keep identical character scale and camera, per-cell body anchor x=.55, feet/tail ground baseline y=.84. Three frames in a SINGLE horizontal 3x1 row. Walking IN PLACE to LEFT, total cycle split in two parts, this is half 2. Torso center stays x=.55 and ground y=.84 in all frames. Frame4 far-side RIGHT leg contacts forward x=.36, near-side LEFT leg trails x=.64. Frame5 RIGHT leg supports x=.52, LEFT leg swings forward off ground x=.48 y=.76. Frame6 RIGHT leg trails x=.62, LEFT leg approaches front x=.38 y=.80, connects smoothly to Frame1 LEFT contact. Quadruped: opposite rear leg follows corresponding diagonal pair, all four legs visible and anatomically consistent, head and rocky back steady. Outside each sprite contour the pixels must be fully transparent alpha=0. No colored aura, no drop shadow, no vignette, no glow halo or tinted rectangle behind the body.

## sand-behemoth-slam

原画: sand-behemoth-slam-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art desert RPG sprite animation. Reference image is the original character design; preserve exact identity, colors, proportions and left-facing three-quarter camera. Actual transparent PNG, no shadows, no glow halo, no background, no effect drawn on character. Four independent complete poses in spacious equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. All feet baseline per-cell y=.84, torso x=.55, minimum ten percent transparent margin, no clipping, no text. Frame1 standing neutral with both front legs planted, mouth closed. Frame2 rears upward on rear legs, BOTH front feet raised to (.32,.57) and (.49,.57), head high at (.31,.35). Frame3 slams BOTH front feet into ground at (.31,.84) and (.49,.84), shoulders dip, mouth opens in a powerful roar, mane bounces forward. Frame4 returns to neutral four-foot stance, mouth closed, head restores original angle. Keep rock armor, gold turquoise bands, two horns intact; no dust or effects.

## desert-sand-burst

原画: desert-sand-burst-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art RPG combat effect animation. Actual transparent PNG. Four independent phases in an equal spacious 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Consistent per-cell anchor center (.50,.65), generous clear gutters and margins, no labels or panel borders. Hard pixel clusters, separated glints and luminous edges, no blurred photographic smoke. A golden sand impact erupting from the ground. Frame1 small ochre dust coil at center bottom; frame2 curved sand plume expands up and out, bright gold grit; frame3 broad crescent shockwave with angular rocks and golden sparks, center stays transparent; frame4 dust fragments fall and thin. Elliptical ground footprint, clear dark amber edges. No creatures, no opaque ground.

## desert-venom

原画: desert-venom-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art RPG combat effect animation. Actual transparent PNG. Four independent phases in an equal spacious 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Consistent per-cell anchor center (.50,.65), generous clear gutters and margins, no labels or panel borders. Hard pixel clusters, separated glints and luminous edges, no blurred photographic smoke. A left-pointing emerald green scorpion venom globule and sharp needle trail, suitable for both projectile and sting impact. Frame1 small concentrated green bead; frame2 pointed luminous teardrop extends left, bright lime core with dark emerald edge; frame3 bead splashes into green spikes and droplets around center; frame4 separated tiny poison droplets fade. Avoid smoke or a full green screen.

## desert-royal-wave

原画: desert-royal-wave-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art RPG combat effect animation. Actual transparent PNG. Four independent phases in an equal spacious 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Consistent per-cell anchor center (.50,.65), generous clear gutters and margins, no labels or panel borders. Hard pixel clusters, separated glints and luminous edges, no blurred photographic smoke. A left-facing horizontal ancient turquoise magic wave with gold sandy particles and Egyptian-inspired geometric diamond runes. Frame1 tiny turquoise diamond core; frame2 leftward crescent expands with gold grit; frame3 sharp wide glowing turquoise wave, luminous cream core, separated golden diamonds around it; frame4 rune fragments and sand trail disperse. No writing, no creatures. Clearly left-pointing.

## desert-fissure

原画: desert-fissure-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art RPG combat effect animation. Actual transparent PNG. Four independent phases in an equal spacious 2x2 grid, read top-left, top-right, bottom-left, bottom-right. Consistent per-cell anchor center (.50,.65), generous clear gutters and margins, no labels or panel borders. Hard pixel clusters, separated glints and luminous edges, no blurred photographic smoke. A horizontal ground fissure traveling LEFT, made of jagged dark sandstone cracks, blazing amber edges and pointed rock teeth. Frame1 short crack at RIGHT side; frame2 crack spreads toward center-left with small rock spikes; frame3 long crack reaches LEFT with strong gold flash and flying angular rocks, thin footprint; frame4 lower amber embers remain and fragments settle. Entire thin line fits inside cell, no opaque ground/background, no creatures.

## sand-scorpion-tail

原画: sand-scorpion-tail-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art desert RPG sprite animation. Reference image is the original character design; preserve exact identity, colors, proportions and left-facing three-quarter camera. Actual transparent PNG, no shadows, no glow halo, no background, no effect drawn on character. Four independent complete poses in spacious equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. All feet baseline per-cell y=.84, torso x=.55, minimum ten percent transparent margin, no clipping, no text. Scorpion poisonous tail thrust. Frame1 neutral pincers grounded and curled upright tail tip at (.60,.22). Frame2 tail draws back over rear at (.78,.15), pincers remain planted in front. Frame3 the long articulated tail swings FORWARD over head to LEFT, vivid green stinger tip at (.16,.42), sting pointing down-left, gold joints/black carapace unchanged; pincers remain grounded, NOT a pincer attack. Frame4 tail retracts upward, tip at (.60,.22), returns to frame1. Concrete tail arc back-high -> front-low -> upright. Keep entire tail inside its cell.

## obsidian-scorpion-tail

原画: obsidian-scorpion-tail-generated.png

Use case: stylized-concept. Asset type: four-frame pixel-art desert RPG sprite animation. Reference image is the original character design; preserve exact identity, colors, proportions and left-facing three-quarter camera. Actual transparent PNG, no shadows, no glow halo, no background, no effect drawn on character. Four independent complete poses in spacious equal 2x2 grid, read top-left, top-right, bottom-left, bottom-right. All feet baseline per-cell y=.84, torso x=.55, minimum ten percent transparent margin, no clipping, no text. Scorpion poisonous tail thrust. Frame1 neutral pincers grounded and curled upright tail tip at (.60,.22). Frame2 tail draws back over rear at (.78,.15), pincers remain planted in front. Frame3 the long articulated tail swings FORWARD over head to LEFT, vivid green stinger tip at (.16,.42), sting pointing down-left, gold joints/black carapace unchanged; pincers remain grounded, NOT a pincer attack. Frame4 tail retracts upward, tip at (.60,.22), returns to frame1. Concrete tail arc back-high -> front-low -> upright. Keep entire tail inside its cell.

