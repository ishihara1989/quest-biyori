# 転生の女神：基本モーション 全文プロンプト

2026-10-20 / 内蔵 image_gen / 透過PNG。生成入力と実測配置は別記録。

## 左向き固定基準

    Use case: stylized-concept
    Asset type: fixed reference sprite for an enemy character in a pixel-art idle RPG.
    Input images: Image 1 is the approved character identity and costume reference. Image 2 is an existing game enemy sprite, use ONLY its pixel art style and level of sprite simplification.
    Primary request: Convert Image 1's blonde reincarnation goddess into ONE clean left-facing battle sprite matching Image 2's genuine pixel-art aesthetic. Preserve long golden blonde hair, adult cute face, blue eyes, cheeky smug smile, gold halo, ivory goddess dress with gold trim and blue jewel accents, bare shoulders and flowing draped sleeves. She is clearly an adult, around 5.5-6 heads tall, never a child or super-deformed chibi. Simplify the dense jewelry to readable pixel clusters like Image 2.
    Pose: full body hovering, both hands on hips, chin lifted in a haughty pose. Head, nose, gaze, torso and toes all point primarily toward SCREEN LEFT in a 3/4 side view. This is a left-facing enemy seen from its front-left quarter, not a front-facing portrait. Dress and hair flow slightly toward screen right. Feet hang softly with pointed toes, no walking step. Her confident smile is visible.
    Style: actual crisp low-resolution game sprite aesthetic, strong dark violet-brown outer contour, deliberate blocky pixel clusters, 3-5 tones per material, restrained highlights, no painterly rendering or soft gradients. Similar sprite-detail density to Image 2. The gown retains its white-and-gold identity; no ice-blue recoloring.
    Framing: square transparent canvas; one whole isolated character occupying about 75% of canvas height, centered, ample clear padding on ALL sides, halo/hair/dress/toes fully inside frame. No ground or cast shadow, no aura or glow, no props, no text, no border, no scenery. True transparent PNG. This image will be the fixed original identity/palette/scale reference for every animation.

## idle / source/idle.png

参照: references/left-base.png, references/approved-concept.png

    Use case: stylized-concept
    Asset type: production animation sprite sheet for a left-facing reincarnation goddess enemy.
    Input image 1: FIXED ORIGINAL SPRITE REFERENCE. Preserve exactly the same adult blonde goddess, face proportions, long gold hair, blue eyes, halo, ivory-white dress, gold trim, blue jewels, sandals and strong dark contour. It also fixes the original palette. Do not redesign. Input image 2: approved original concept for identity only; match the pixel style of image 1.
    Style: consistent crisp pixel-art game sprite, deliberate visible pixel clusters, restrained 3-5 tone ramps, no painting, no gradients, no glow. Adult feminine proportions, not chibi. Full-body isolated figures on a TRUE transparent background. No floor, scenery, shadows, panels, text, frame numbers or separator lines.
    Grid and registration: EXACTLY equal cells, one complete character per cell, read in normal left-to-right top-to-bottom order. Each cell has its OWN ample transparent margin; no hair/halo/dress crosses a cell boundary. Equal anatomical size and palette in every cell. In each 512x512 virtual cell: face center about (205,130), chest (220,195), waist (235,270), feet around (248,445), halo center about (220,65). Treat these as registration targets; do not draw guides. Keep her torso anchored, not centered by the trailing hair silhouette. Hair may trail to x440. Maintain at least 25px transparent margin. No entire body translations masquerading as animation: redraw the hair tips, sleeve folds, expression and posture as specified. Transparent alpha, never an opaque black/white/checkerboard backdrop.

    Motion: haughty floating IDLE LOOP, EXACTLY FOUR distinct frames in a square 2x2 grid. Face, nose, torso and gaze point SCREEN LEFT in all four cells. Both hands confidently planted on hips throughout, chin raised, smug playful smile.
    F1 top-left: neutral mid-hover height; hair tips curve softly to right.
    F2 top-right: rises slightly (body delta y=-3 on 512 grid); chest breathes in, draped sleeves lag slightly down, hair tips swing right 3px.
    F3 bottom-left: mid height again, a quick half-blink, hair tips and sleeve hems curve gently up while body descends.
    F4 bottom-right: low hover (delta y=+3), open smug eyes, hair tips swing back slightly left; next frame is F1 with a smooth low-to-mid rise.
    Loop seam F4->F1: same pose and scale, slight changes only. Feet hang in floating pose, never walking. One coherent halo per body. Keep the recognizable smug facial expression visible.

## move / source/move.png

参照: references/left-base.png, references/approved-concept.png

    Use case: stylized-concept
    Asset type: production animation sprite sheet for a left-facing reincarnation goddess enemy.
    Input image 1: FIXED ORIGINAL SPRITE REFERENCE. Preserve exactly the same adult blonde goddess, face proportions, long gold hair, blue eyes, halo, ivory-white dress, gold trim, blue jewels, sandals and strong dark contour. It also fixes the original palette. Do not redesign. Input image 2: approved original concept for identity only; match the pixel style of image 1.
    Style: consistent crisp pixel-art game sprite, deliberate visible pixel clusters, restrained 3-5 tone ramps, no painting, no gradients, no glow. Adult feminine proportions, not chibi. Full-body isolated figures on a TRUE transparent background. No floor, scenery, shadows, panels, text, frame numbers or separator lines.
    Grid and registration: EXACTLY equal cells, one complete character per cell, read in normal left-to-right top-to-bottom order. Each cell has its OWN ample transparent margin; no hair/halo/dress crosses a cell boundary. Equal anatomical size and palette in every cell. In each 512x512 virtual cell: face center about (205,130), chest (220,195), waist (235,270), feet around (248,445), halo center about (220,65). Treat these as registration targets; do not draw guides. Keep her torso anchored, not centered by the trailing hair silhouette. Hair may trail to x440. Maintain at least 25px transparent margin. No entire body translations masquerading as animation: redraw the hair tips, sleeve folds, expression and posture as specified. Transparent alpha, never an opaque black/white/checkerboard backdrop.

    Motion: FLOATING MOVEMENT TO SCREEN LEFT, EXACTLY FOUR distinct frames in a square 2x2 grid. This is a loop of forward flight, NOT walking. Face and toes point screen left. Retain arrogant hands-on-hips pose and smug smile, body tilted just 6 degrees toward the left, feet relaxed together and angled diagonally back/right. Torso remains registered at the same x coordinate; actual travel will be applied by the game. Long hair and sleeve ends stream to SCREEN RIGHT, opposite the movement, with clear changing curves.
    F1 top-left: flowing hair mid-sweep, moderate trailing sleeve curve, body at mid-hover.
    F2 top-right: slight body rise (y=-2), hair tips extend 6px farther right and lag downward, sleeves billow back.
    F3 bottom-left: body returns to mid-hover, hair tips curl upward, sleeve hems follow with a delay.
    F4 bottom-right: body at y=+2, hair and sleeve tips fall slightly back to F1 shape, seamless loop F4->F1.
    Use real changing hair silhouette and sleeve folds with each frame; avoid identical duplicate poses. Same outfit, face, limb lengths and halo size in every cell. No speed lines or particles.

## hit / source/hit.png

参照: references/identity-head.png, references/costume-lower.png

    Use case: stylized-concept
    New pixel-art battle animation: THREE separate full-body poses of the SAME cute ADULT blonde goddess, in a horizontal 3-frame sprite sheet on a true transparent background. Input 1 fixes ONLY her face, golden hair, gold halo, blue jewel earrings and dark-contour pixel-art style. Input 2 fixes lower costume: flowing ivory white gown edged gold, blue jewel tassels, side opening over legs, golden sandals. Reconstruct the top as an elegant white-and-gold fitted bodice with bare shoulders, blue jewels and loose detached draped sleeves. Keep adult 6-head-tall proportions, not chibi.
    The animation is a COMEDIC HIT REACTION facing SCREEN LEFT. In ALL THREE figures BOTH palms are pressed against her cheeks; two hands total per figure, never hands on waist. Two complete arms from shoulders down to elbows at chest height then forearms up to cheek-palms. Gold bracelets on each wrist. Waist is a narrow white corset with gold belt and ONE blue jewel, cloth only, no skin fingers there.
    Left: surprise: watery wide eyes, open tiny mouth, face looking screen left, palms squishing cheeks, torso starting a backward lean to screen right.
    Center: peak recoil: arches backward to screen right, lifts one knee, watery blue eyes welling up and large blue cartoon tears streaming past hands, wiggly sobbing mouth, gold halo tips back. Hair and sleeves lag left.
    Right: partly upright again, watery eyes now glaring left with furrowed brows, cute sulking pout, palms still on cheeks; knees relax down, sleeves settle. Keep face outline and adult body size consistent with first two.
    VERY IMPORTANT LAYOUT: THREE complete isolated figures, large transparent gutters between them and safe transparency at the outside edges; NO touching or overlapping silhouettes. Each figure occupies at most 75% of its frame width and 85% of its height. Do not fill the entire image with hair. Consistent anatomical size. Crisp detailed pixel clusters, limited clean shading, no blurry gradients, no text, no panels, no floor, no aura. Funny tears and a hurt pride expression, no injury.

## return-a / source/return-a.png

参照: references/identity-head.png, references/left-base.png, source/rejected/return-a-closed-skirt.png

    Use case: stylized-concept
    A family-friendly fantasy RPG sprite sheet, THREE full-body animation frames horizontally on a true transparent background. The attached reference fixes the face, blonde hair, blue eyes, gold halo, gold ornaments and crisp pixel-art palette of ONE adult reincarnation goddess. Draw her complete body in an elegant opaque FULL-LENGTH white gown with gold edges and blue jewel decorations, flowing cape-like sleeves, golden slippers. The skirt fully covers her legs. Ordinary adult stylized RPG proportions, not chibi.
    Animation: she is upset and about to leave. She has a funny sulking expression, watery blue eyes, small visible blue tears on cheeks, furrowed brows and pouty lips. Both arms are folded firmly across her chest; exactly two arms and two hands with coherent connections, no other hands.
    LEFT frame: head and body turned to SCREEN LEFT in three-quarter front view, angry and teary, arms folded, chin held high. Hair trails right. Feet hover together below dress.
    MIDDLE frame: rotates to face directly FRONT toward viewer, watery angry eyes, small pout, arms still crossed. Upright body stays same size.
    RIGHT frame: rotates to SCREEN RIGHT in three-quarter front view, nose clearly points right, watery eye visible, arms still crossed. Hair begins to trail left.
    One coherent turning motion: left-facing -> frontal -> right-facing. Same adult character and exactly same clothes in each frame. This is petulant cartoon comedy, no injury or gore.
    Strict safe framing: THREE separated full-body figures, all halo tips and hem inside image. Character heights only 70% of canvas height, leaving a WIDE transparent border above and below. Same blank margins between frames. Crisp dark outlined pixel clusters, no painting, blur, text, labels, floor, scenery, panels, aura, magic effects or fade.

### 衣装修正

    Use case: precise-object-edit
    Input image 1 is the EDIT TARGET, three adult goddess turn poses. Input image 2 is the FIXED ORIGINAL character sprite and clothing design. Match the character outfit in image 1 to image 2, while KEEPING the three crossed-arm poses, expressions, face directions, tears, framing, halo and body anatomy of image 1.
    Change only the costume differences: use the SAME draped white and gold goddess gown as image 2, with the same asymmetric layered skirt, blue jewel tassels, gold belt, golden footwear and free-floating lower-body silhouette. The dress must match the original character outfit across the animation. Do not invent a bell-shaped closed princess skirt or different shoes. No sexualized pose; this is an ordinary adult RPG enemy returning in an angry sulk.
    CRITICAL: KEEP BOTH ARMS CROSSED ON CHEST in every frame, do NOT copy the hands-on-hips pose from image 2. Each figure has ONLY TWO ARMS and ONLY TWO HANDS, both across chest, and none on waist. Keep the same adult face, proportions and white/gold/blue palette. Left frame faces left, center faces front, right frame faces right. Angry watery eyes and blue tears stay visible.
    Maintain crisp pixel-art aesthetic and dark outlines. Transparent background with wide blank padding around every complete figure. Keep all halo ornaments, hair, dress and feet fully inside canvas. No text, floor, panels or effects.

## return-b / source/return-b.png

参照: source/return-a.png, references/left-base.png

    Use case: stylized-concept
    Asset: SECOND HALF of the same adult reincarnation goddess's angry crying turn-and-leave sprite animation. THREE new frames arranged horizontally, true transparent PNG.
    Input image 1 is the CONTINUITY REFERENCE: the preceding first three frames. Continue immediately from its RIGHTMOST right-facing three-quarter pose. Input image 2 is the ORIGINAL fixed character palette and design reference. Keep the costume and crossed-arm pose of image 1; never copy the hands-on-hips pose of image 2. Same adult character and anatomical size, long blonde hair, gold halo, ivory/gold draped gown, blue jewel tassels, gold sandals, crisp pixel art, dark outlines.
    F4 LEFT: RIGHT-facing SIDE profile. Nose points SCREEN RIGHT, brow furrowed, one watery blue eye and blue tear drop visible, lips in a sulky pout. Arms still tightly folded across chest; exactly two arms and hands. Starts turning shoulder away from camera. Floating feet together, no step. Hair and white/gold drapes swing to screen LEFT.
    F5 CENTER: BACK-RIGHT three-quarter view, most of back and long blonde hair now visible. She briefly looks back over her near shoulder toward camera with an angry blue tear-filled eye, chin raised petulantly. Arms remain folded, elbows seen from back/side, no extra hand on hip. White/gold gown rotates with body. Same floating height, starts a small upward lift.
    F6 RIGHT: fully BACK-facing pose, leaving away toward the upper right. Head and face now hidden behind long blonde hair. Gold halo seen from behind, back of same white/gold gown, shoulders stiff in anger, arms still folded in front of her and mostly hidden from rear. Feet together under hem in floating posture. Do not draw a new face on the back. Complete opaque character, no fade.
    CRITICAL continuity: F3 of input image 1 -> these F4/F5/F6 must be a believable progressive turn. Actual changing anatomy and hair orientation, no horizontal mirroring substitution. Keep same original white/gold/blonde/blue palette. No color drift.
    Spacing: three well-separated FULL-BODY sprites with wide transparent gutters. Leave full transparent safety padding above the halo tips, below the toes, and around all hair and sleeve ends. No cropping, overlapping figures, floor, shadow, text, panels, labels, magic portal, particles or glow. Character height at most 75% of image height. Consistent pixel-art rendering.

## 不採用: source/rejected/hit-v1.png

Extra waist hands in first two frames

    Use case: stylized-concept
    Asset type: production animation sprite sheet for a left-facing reincarnation goddess enemy.
    Input image 1: FIXED ORIGINAL SPRITE REFERENCE. Preserve exactly the same adult blonde goddess, face proportions, long gold hair, blue eyes, halo, ivory-white dress, gold trim, blue jewels, sandals and strong dark contour. It also fixes the original palette. Do not redesign. Input image 2: approved original concept for identity only; match the pixel style of image 1.
    Style: consistent crisp pixel-art game sprite, deliberate visible pixel clusters, restrained 3-5 tone ramps, no painting, no gradients, no glow. Adult feminine proportions, not chibi. Full-body isolated figures on a TRUE transparent background. No floor, scenery, shadows, panels, text, frame numbers or separator lines.
    Grid and registration: EXACTLY equal cells, one complete character per cell, read in normal left-to-right top-to-bottom order. Each cell has its OWN ample transparent margin; no hair/halo/dress crosses a cell boundary. Equal anatomical size and palette in every cell. In each 512x512 virtual cell: face center about (205,130), chest (220,195), waist (235,270), feet around (248,445), halo center about (220,65). Treat these as registration targets; do not draw guides. Keep her torso anchored, not centered by the trailing hair silhouette. Hair may trail to x440. Maintain at least 25px transparent margin. No entire body translations masquerading as animation: redraw the hair tips, sleeve folds, expression and posture as specified. Transparent alpha, never an opaque black/white/checkerboard backdrop.

    Motion: COMEDIC TEARY-EYED HIT REACTION, EXACTLY THREE distinct frames in a wide 3x1 horizontal grid. She is the SAME adult cute goddess, NOT a different chibi character. Remain basically LEFT facing. Non-graphic slapstick, no wounds. Preserve body proportions and costume.
    F1 left: startled flinch, shoulders jump, hands spring off the hips to chest height, eyes open wide with large glistening blue tears pooled at lower lids, small round surprised mouth. Upper body leans about 4 degrees back toward right.
    F2 center: exaggerated comic recoil, torso leans 12 degrees right, face x+18,y-4, waist x+5; both elbows bent with hands half-clenched near chest. Large watery cartoon eyes, two blue tear drops attached to cheeks, squeezed trembling wavy mouth, eyebrows up. Halo tilts 8 degrees. Sleeves and hair lag toward left, visibly reacting to the impact.
    F3 right: recovers halfway toward upright, keeps the same watery eyes and puffed angry pout, small fists near chest, elbows lower. Hair and sleeves follow the recovery; halo begins to straighten. This end pose will lead into idle recovery or angry return.
    All tears must be drawn as part of her expression and stay visibly blue. No impact flash, no text symbols, no blood, no violent injury. Full body and all trailing hair safely inside each cell.
    IMPORTANT SHEET PADDING: Within EACH cell the entire silhouette must fit inside the central 70% width and 78% height. Leave generous transparent gaps BETWEEN figures. Do not enlarge the figures to fill the sheet.

## 不採用: source/rejected/hit-repair-v1.png

Targeted edit did not remove extra waist hands

    Use case: precise-object-edit
    Input image 1 is the EDIT TARGET, a three-frame sprite sheet. Input image 2 is the ORIGINAL FIXED character reference, used for outfit and palette only.
    Repair ONLY the duplicated hands/arms in the FIRST and SECOND figures of input image 1. In the FIRST figure there are two raised hands at chest/face height, PLUS two unwanted small hands remaining on the waist. KEEP the two raised hands and their two complete arms connected to the correct shoulders. REMOVE BOTH EXTRA WAIST HANDS and any duplicate forearms; restore only the white-and-gold waist fabric, blue jewel, dress folds and transparent empty background that the deleted hands covered. In the SECOND figure similarly KEEP the two raised hands and complete shoulder-elbow-wrist arm connections, REMOVE the two extra little hands/forearms resting against her waist; reconstruct the costume cleanly. Every frame MUST have exactly TWO arms and TWO hands. The THIRD figure already has the two hands raised by chest: retain exactly those two.
    Do not change anything else: preserve three frames in a single horizontal row, framing, registration, original proportions, pixel-art aesthetic, blonde hair, ivory/gold palette, teary comic expressions, blue tear drops, pose angles and halo tilt. Do not change to chibi. No background, no text. True transparent PNG. Full bodies with ample transparency and no clipping.

## 不採用: source/rejected/hit-v2.png

Extra waist hands persisted with full-body pose reference

    Use case: stylized-concept
    Generate a NEW animation sprite sheet based on the attached fixed original character reference. The reference supplies identity, costume and pixel-art palette ONLY, NOT THE POSE. Completely REPOSE BOTH ARMS: old hands-on-hips pose must not remain anywhere.
    One adult blonde reincarnation goddess repeated in exactly THREE frames horizontally, isolated true transparent background. Crisp pixel art matching reference. Same white/gold flowing dress, blue jewels, gold halo, long gold hair. Full bodies, all feet/hair/halo inside frame with generous blank padding. Same adult proportions in all three; no chibi. Keep basically screen LEFT facing.
    Her ONLY TWO hands are OPEN PALMS pressed against her OWN TWO CHEEKS in all three frames, like a startled crying cartoon reaction. The palms cover the sides of the face, fingers upward. Both elbows sit in front of her chest, each arm runs from the shoulder to a lowered elbow then UP to its cheek. All skin-colored hands are up BY HER FACE. Her waist and hips show ONLY FABRIC, gold belt, blue jewels and dress folds, NEVER hands, fingers or forearms. Exactly two arms, two hands, two elbows per character. Sleeves hang from her elbows.
    F1 left: startled at impact from screen LEFT, eyes wide with glistening tears, small round mouth, palms on cheeks, leaning slightly back toward screen right. Halo slightly tilted, feet dangling in air.
    F2 middle: comic peak recoil, upper body leans back 12 degrees toward screen right, huge watery eyes and clear blue tears running down cheeks beside her palms, trembling squiggly mouth, hands still squish cheeks. Hair and sleeves lag toward screen left. Halo tilted a little more. Funny and cute, no injury.
    F3 right: partially recovers toward upright, watery annoyed eyes, eyebrows furrowed, pouty lips, palms still on cheeks and elbows lower, hair settles back to screen right. End retains tears for the angry departure.
    All frames: large visible blue tears, coherent adult anatomy, a total of exactly SIX hands in the entire image (two per character, all on cheeks). Absolutely no hands or skin-colored fingers on the hips or waist. No text, symbols, flash, floor, shadows or scenery. Wide transparent image, three separated equal-sized full-body sprites.

## 不採用: source/rejected/return-a-closed-skirt.png

Closed bell skirt differed from fixed original

    Use case: stylized-concept
    A family-friendly fantasy RPG sprite sheet, THREE full-body animation frames horizontally on a true transparent background. The attached reference fixes the face, blonde hair, blue eyes, gold halo, gold ornaments and crisp pixel-art palette of ONE adult reincarnation goddess. Draw her complete body in an elegant opaque FULL-LENGTH white gown with gold edges and blue jewel decorations, flowing cape-like sleeves, golden slippers. The skirt fully covers her legs. Ordinary adult stylized RPG proportions, not chibi.
    Animation: she is upset and about to leave. She has a funny sulking expression, watery blue eyes, small visible blue tears on cheeks, furrowed brows and pouty lips. Both arms are folded firmly across her chest; exactly two arms and two hands with coherent connections, no other hands.
    LEFT frame: head and body turned to SCREEN LEFT in three-quarter front view, angry and teary, arms folded, chin held high. Hair trails right. Feet hover together below dress.
    MIDDLE frame: rotates to face directly FRONT toward viewer, watery angry eyes, small pout, arms still crossed. Upright body stays same size.
    RIGHT frame: rotates to SCREEN RIGHT in three-quarter front view, nose clearly points right, watery eye visible, arms still crossed. Hair begins to trail left.
    One coherent turning motion: left-facing -> frontal -> right-facing. Same adult character and exactly same clothes in each frame. This is petulant cartoon comedy, no injury or gore.
    Strict safe framing: THREE separated full-body figures, all halo tips and hem inside image. Character heights only 70% of canvas height, leaving a WIDE transparent border above and below. Same blank margins between frames. Crisp dark outlined pixel clusters, no painting, blur, text, labels, floor, scenery, panels, aura, magic effects or fade.

## 出力なし: return-a-initial

Output generation rejected by tool safety system; no image produced

    Use case: stylized-concept
    Generate a new THREE-FRAME horizontal sprite sheet: the first three poses of an ANGRY, TEARY-EYED TURN-AND-LEAVE animation for the same ADULT blonde reincarnation goddess enemy.
    Image 1 is the FIXED original head/face/halo/palette reference; image 2 is a clothing reference for the flowing white-and-gold skirt, blue jewel tassels and golden sandals. Complete matching white/gold fitted bodice, bare shoulders, gold bracelets, flowing detached sleeves. Long golden blonde hair, blue eyes, gold halo and cute adult 6-head-tall proportions. Crisp actual pixel-art texture and dark outlines matching the references. Same body size and costume in all frames.
    In ALL THREE poses her ONLY TWO ARMS are firmly FOLDED ACROSS HER CHEST in an unmistakable sulking crossed-arm pose. Exactly two elbows and two hands, with one hand tucked at the opposite upper arm. Nothing on hips. No extra fingers or arms. Her eyes have blue tears and red embarrassed cheeks; brow angry, lower lip pouting. Angry because she got beaten, funny petulant body language.
    F1 left: LEFT-facing three-quarter front pose. Nose and gaze point screen LEFT. Tears visibly pool and trail down cheeks, angry puffy cheeks. Arms crossed, chin lifted defiantly, floating feet together. Hair flows toward right.
    F2 middle: she rotates to FRONT-facing. Same watery blue eyes and angry pout, shoulders hunched in a sulk, arms still tightly crossed, feet still floating. Hair shifts behind the shoulders.
    F3 right: she rotates to RIGHT-facing three-quarter front pose. Nose and gaze now point screen RIGHT, watery visible eye, angry pout. Arms remain crossed. Hair and sleeves begin lagging to screen LEFT as her body turns.
    The rotation order left/front/right must be unmistakable. Upright torso and hips stay near the same anchor across all three. Halo rotates with head. Preserve face identity and palette, no chibi.
    LAYOUT IS CRITICAL: wide canvas with THREE well-separated complete figures, EVERY figure inside its own equally wide area. Each figure fills only 70% of image HEIGHT and 65% of cell WIDTH. Leave at least 15% empty transparent border ABOVE the halo and BELOW the feet, and blank gaps between figures. Entire halo ornaments, hair and sandals must be visible. TRUE transparent PNG. No scenery, text, floor, shadow, labels, panels, portal or fade.
