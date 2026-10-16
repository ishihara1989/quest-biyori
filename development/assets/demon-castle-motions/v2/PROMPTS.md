# 魔王城 修正生成の全文プロンプト

Built-in image_gen / transparent_background=true / 2026-10-15 JST

## 1 arch-demon/attack

原画: [sources/arch-demon/attack-v2.png](sources/arch-demon/attack-v2.png)

参照: [arch-demon.png](../../late-stage-first-pass/v1/references/arch-demon.png)

Use case: stylized-concept.
Asset type: FOUR-frame normal punch animation of the exact arch-demon from the fixed reference.
Preserve massive purple humanoid demon, two gold/brown curved horns, attached purple bat wings, red abdominal core, black spiked armor with gold trim, one tail, two muscular arms and two clawed legs. Left-facing mild three-quarter view, identical canonical proportions, colors and refined crisp JRPG pixel art.
Critical arm continuity: The ATTACKING ARM is the NEAR ARM with the LARGE SPIKED PAULDRON visible on SCREEN RIGHT in the neutral reference. Follow THAT SAME shoulder -> upper arm -> elbow -> wrist -> fist in all four frames. The other FAR ARM, originating at the SMALLER shoulder on screen-left, stays guarding at his chest, fist around (445,490). Never alternate the punching arm or swap pauldron sides.
Exactly four COMPLETE smaller separate poses in equal 2x2 cells, row-major. Entire horns, wings, tail, fists and feet inside central 60% of each cell; broad transparent margins and gutters. Same body scale in every frame.
Per-cell normalized coordinates: pelvis (555,620), head (490,335), boots on y=835. Two wing roots fixed to upper back, tips fit x=230..800.
Frame 1 ANTICIPATION: the NEAR big-pauldron shoulder at (625,430), its attacking fist drawn back near (610,560). Other FAR fist remains guarding chest (445,490).
Frame 2 WINDUP: SAME near shoulder (640,425), near elbow (710,480), SAME fist coils back at (675,420). Far fist stays guarding (445,490). Torso twists slightly right, does not reverse its facing.
Frame 3 RELEASE: SAME near big-pauldron shoulder rotates left to (570,440), its upper arm reaches forward through elbow (420,475), SAME fist extends horizontally LEFT to (270,500). Forearm must connect continuously back to the large near shoulder, no arm emerging from chest. Far fist still visible bent at chest (470,540); do not draw a second punch. Feet planted, tail lags right, wings remain the same size.
Frame 4 RECOVERY: attacking near fist retracts to (610,560) and large pauldron returns screen-right. Other far fist remains at chest, then relaxes. Reference neutral body height.
No punch trails or impact VFX on body sheet, no aura or external light. Native transparent alpha outside figure. No extra hands, arms, wings, detached parts, floor, shadow slab, text, labels, grid, checkerboard or watermark.

## 2 arch-demon/move-2

原画: [sources/arch-demon/move-2-v2.png](sources/arch-demon/move-2-v2.png)

参照: [arch-demon.png](../../late-stage-first-pass/v1/references/arch-demon.png) / [move-1-generated.png](../../late-stage-first-pass/v1/sources/arch-demon/move-1-generated.png)

Use case: stylized-concept.
Asset type: THREE complementary walking poses of the exact canonical arch-demon, refined crisp JRPG pixel-art, LEFT-facing mild three-quarter view.
Input 1: fixed canonical reference, match identity, anatomy, armor, palette and body scale. Input 2: first walking half, whose middle pose lifts the SMALL SCREEN-LEFT foot. Generate the OPPOSITE half: this time lift the LARGE SCREEN-RIGHT near foot.
Exactly THREE complete small separate figures in ONE HORIZONTAL ROW, three equal square cells, huge transparent gutters. All horns, wings, fingers, tail and feet completely visible inside central 60% of each cell. Same size and camera in all cells.
Same massive purple demon, two gold horns, red abdomen core, black/gold spiked armor, two attached wings, one tail, two arms, two legs. Near hip is on viewer-right under the big spiked shoulder; near leg has larger gold knee armor and larger foreground clawed foot. Far leg starts at viewer-left hip and is smaller/behind.
Root pelvis (555,610), head (490,340), ground y=840. Upper body, arms, hands, horns and wings steady; only tiny 6-unit bob. Wings do NOT flap or grow during walking.
Left cell: smaller FAR foot is planted forward-left (420,840); larger NEAR foot trails back-right at (650,840), heel beginning to lift. Keep each leg attached to its own hip.
Middle cell: SMALL FAR foot remains planted at (450,840) supporting weight. LARGE NEAR knee rises visibly on SCREEN RIGHT around (620,660), large near foot lifted at (620,745), well above ground. It is the viewer-RIGHT near leg, not the small screen-left leg, that bends and lifts.
Right cell: smaller FAR foot supports at (510,840), larger NEAR foot swings forward-left and lowers toward (430,800), preparing its next contact. Near knee remains connected to right-origin hip. Tail lags right by 10 units.
Do not repeat the first-half middle lifted small left foot. No extra foot, disconnected toes, jumping both feet, pose mirroring, side-swapped armor or missing leg. Native transparent alpha, no floor, shadow slab, aura, VFX, text, labels, grid, checkerboard or watermark.

## 3 black-knight/attack

原画: [sources/black-knight/attack-frame-2-v3.png](sources/black-knight/attack-frame-2-v3.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png)

Use case: stylized-concept.
Asset type: ONE SINGLE complete animation pose of the referenced black knight for a pixel-art idle RPG.
Input image: fixed canonical reference for identity, exact horned helmet, black plate armor with restrained gold trim, red slit visor, tattered dark crimson cape, broad straight black greatsword with silver edge and red center rune.
Generate frame 2, NORMAL ATTACK WINDUP. Left-facing mild three-quarter view. Exactly one knight, two arms, two hands holding the SAME sword hilt overhead, two legs and two boots planted. Sword points to upper-right; complete sword tip visible.
Square transparent canvas. Critical composition: leave a very large EMPTY TRANSPARENT BORDER, roughly 20% of the canvas on every side. Entire silhouette including sword, horns, cape and feet fits x=200..820 y=180..820 on normalized 1000-square. Head around (490,420), pelvis (520,620), boots baseline y=810. Both hands grasp one handle around (570,370), blade tip at (760,190). The blade remains the same broad greatsword as reference, about 330 units long. Character is slightly crouched for anticipation; torso height from helmet chin to pelvis around 155 units, not stretched. Cape trails softly to the right; no violent large cape fan.
Match reference palette, proportions, materials and refined crisp JRPG pixel art with deliberate small pixel clusters and stepped edges. No additional creatures or poses, no animation sheet. No VFX, impact, sword trail, aura, backdrop, floor, shadow plate, text, numbers, grid, watermark or painted checkerboard. Genuine transparent alpha, do not fill the border.

## 4 black-knight/attack

原画: [sources/black-knight/attack-frame-3-v3.png](sources/black-knight/attack-frame-3-v3.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png)

Use case: stylized-concept.
Asset type: ONE SINGLE full-body action sprite, black knight normal attack FRAME 3 RELEASE.
Input image: fixed canonical reference. Preserve its horned black helmet with red slit visor, black plate armor with restrained gold trim, dark crimson tattered cape, and broad straight black greatsword with silver edge and red center rune. Exact same proportions, body bulk, materials, palette and pixel-art rendering.
Exactly ONE pose, NOT a sheet. Knight faces LEFT in mild three-quarter view. Powerful completed LEFT-DOWN sword chop. Two hands grasp the SAME single handle, around normalized (480,670). Blade extends down-left from hilt to tip (190,820). Whole blade same length and width relative to torso as canonical reference. Torso leans forward about 12 degrees, head (500,420), pelvis (540,615), two boots planted at y=835, knees flex slightly. Cape trails to the right (maximum x=820), without growing in size. Hands must remain attached through wrists and elbows to the two shoulders. No third hand.
Square genuinely transparent canvas, full silhouette in normalized x=160..840 y=170..850 with very large clear border. No clipping of sword tip, horns, cape, fingers or boots. Match the reference body scale; full body height without sword approx 600 units.
Refined JRPG pixel art: crisp deliberate small pixel clusters, stepped outline, controlled shadows, no painterly blur.
Only the knight and held greatsword. No drawn slash, sparks, impact flashes, ground cracks, VFX, aura, floor, shadow slab, background glow, labels, grid, text, watermark or painted checkerboard. Native transparent alpha.

## 5 black-knight/attack

原画: [sources/black-knight/attack-v2.png](sources/black-knight/attack-v2.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png)

Use case: stylized-concept.
Asset type: corrected production sprite animation for a pixel-art idle RPG, black knight NORMAL greatsword attack.
Input image 1: FIXED CANONICAL CHARACTER REFERENCE. Match this exact horned black-and-gold armored knight, red visor, ragged crimson cape, broad black greatsword with silver edges and red center rune. Preserve body, helmet, armor, palette, weapon proportions and left-facing mild three-quarter view.
Primary request: generate exactly FOUR separate complete poses in a clean equal 2x2 sprite sheet, reading upper-left, upper-right, lower-left, lower-right. Genuine transparent background.
Correct the previous clipped overhead weapon: fit EVERY entire sword blade, horns, cape, boots and hands comfortably inside its own cell, at least 12% transparent margins on all four sides. Smaller consistent character scale is much better than clipped weapons. Nothing crosses cell boundaries.
Motion plan using EACH CELL normalized coordinates 0..1000: pelvis stays around (550,600), feet on y=845. Head around (540,400). SAME sword in all four poses, two hands on the single hilt, with distinct elbows attached to their own shoulders. Sword blade approx 360 normalized units long throughout.
Frame 1: compact ready stance, hands at (470,610), sword tip at (170,765), cape rests to right.
Frame 2: windup with both hands at (620,380), sword tip at (790,145); sword fully above and to right of helmet, 12% transparent margin beyond tip. Knees flex slightly, body dimensions unchanged.
Frame 3: powerful LEFT-DOWN chop, hands at (420,650), tip at (135,805); torso leans left about 10 degrees, both boots stay planted, cape trails to right. No drawn slash effect.
Frame 4: recover to the same compact ready stance and sword position as frame 1, cape settles. Frame 4 must connect to canonical standing idle without a drastic body-size jump.
Style: refined JRPG pixel art, crisp small pixel clusters, stepped outlines, controlled shading, exactly the reference colors and brightness. Consistent body scale and camera angle across frames. Two arms, two hands, two legs, two boots. Each hand grasps the same sword handle, no floating hands or extra weapons.
Constraints: body and weapon only, no impact flashes, no external VFX, no aura, no colored backdrop, no floor, no ground shadow, no text, labels, borders, checkerboard or watermark. Keep native transparent alpha.

## 6 black-knight/danger-2

原画: [sources/black-knight/danger-2-v2.png](sources/black-knight/danger-2-v2.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png)

Use case: stylized-concept.
Asset type: FOUR-frame dangerous HORIZONTAL "black ring sweep" action by the exact canonical horned black knight. BODY and held sword only, ring VFX separate.
Same closed black horned helmet/red visor, black armor with restrained gold trim, crimson ragged cape, broad black greatsword with silver edge and red rune. Two arms, two gauntleted hands, two legs. LEFT-facing mild three-quarter view, unchanged canonical proportions/palette and crisp JRPG pixel art.
Exactly FOUR complete SMALL figures in equal 2x2 cells, row-major, broad transparent margins. Entire sword, cape, horns and boots fit inside normalized x=150..850,y=160..850 of each cell, with large clear gutters. No neighboring overlap or edge clipping. Same body and sword scale in all frames. Make body smaller to fit wide sweep.
This attack is a WAIST-HEIGHT SIDEWAYS SWEEP, NOT overhead or downward. Sword NEVER rises above the shoulders. Both hands always hold the SAME single hilt, each wrist/elbow connects to own shoulder.
Root pelvis around (550,610), head (525,350), boots y=835.
Frame 1 PREPARE: slightly bent knees, both hands near (480,645), blade points down-left to (210,780), quiet cape.
Frame 2 LONG WINDUP: waist and shoulders rotate RIGHT, both hands draw hilt to right hip at (575,590), SAME sword extends behind/right toward tip (830,550), blade nearly horizontal and below shoulders. Elbows bent, both hands on one handle. Head still looks LEFT. Cape stays within x=400..800.
Frame 3 RELEASE: forceful horizontal sweep to LEFT at waist height, both hands push hilt to (430,580), blade extends LEFT to tip (170,580). Torso rotates left 12 degrees, knees flex, two feet planted. Same sword length/width and red rune. No drawn arc or circle.
Frame 4 RECOVERY: sword returns to low left ready angle and frame-1 posture, cape settles without expanding.
No overhead sword pose, external slash, magic ring, lightning, ground cracks, aura, background, floor, shadow slab, labels, text, grid, checkerboard or watermark. Genuine transparent alpha.

## 7 black-knight/move-1

原画: [sources/black-knight/move-1-v2.png](sources/black-knight/move-1-v2.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png)

Use case: stylized-concept. Pixel-art RPG black knight WALK-IN-PLACE cycle facing LEFT, mild three-quarter angle. Fixed reference identity: same black horned helmet/red visor, black-and-gold armor, ragged crimson cape, broad silver-edged black greatsword with red center rune. Same scale, palette, proportions and crisp JRPG pixel clusters in every frame.
Exactly THREE separate COMPLETE small sprites in ONE HORIZONTAL ROW (3 equal square cells). Very broad clear gutters. All horns, sword tip, cape, fingers and boots fit inside central 60% of each cell. No cropped blades or overlap.
Sword stays carried low in BOTH hands on the SAME hilt at normalized (480,625), full blade extends left-down to (210,780) in EVERY frame. Keep arms connected, no extra hands, no weapon swing. Root pelvis around (550,590), head (530,350), ground y=840.
Leg identity: NEAR leg starts at viewer-right hip (570,590), has the larger foreground knee armor and boot. FAR leg starts at viewer-left hip (490,590), is slightly smaller and behind. Each stays attached to its OWN hip through knee and ankle even where legs cross in projection. Two legs and two boots, do not mirror or swap armor ownership.
Complete six-phase plan:
1 near/larger boot forward-left (400,840) planted; far/smaller boot back-right (650,840) planted.
2 near boot supports at (480,840); far boot swings forward above ground at (610,750), far knee raised.
3 near boot supports at (570,840); far boot approaches landing at (450,800).
4 far/smaller boot lands forward-left (400,840); near/larger boot back-right (650,840) supports.
5 far boot supports at (480,840); near/larger boot swings forward above ground at (610,750), near knee raised.
6 far boot supports at (570,840); near/larger boot approaches landing at (450,800).
Then 6 -> 1 is the near boot landing, 3 -> 4 is far boot landing. Torso, sword and head bob at most 8 units. Cape lags at most 15 units, no giant expansion.
Native transparent alpha, no floor, ground shadow, motion trail, VFX, aura, labels, text, grid, checkerboard or watermark.
THIS SHEET CONTAINS ONLY PHASES 1,2,3 in that left-to-right order. The FAR smaller leg is the swinging leg in the middle cell. Do not draw phases 4,5,6 here.

## 8 black-knight/move-2

原画: [sources/black-knight/move-2-v2.png](sources/black-knight/move-2-v2.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png) / [move-1-v2.png](sources/black-knight/move-1-v2.png)

Use case: stylized-concept.
Asset type: THREE-frame complementary HALF of a six-frame black-knight WALK cycle.
Input image 1 is fixed canonical character reference. Input image 2 is the ALREADY GENERATED opposite walking half; use it to match scale, sword, horns, armor, palette and rendering, but MOVE THE OPPOSITE LEG. The middle pose of image 2 lifts the boot on SCREEN RIGHT. Do NOT repeat that lifted boot.
Exactly THREE complete small poses in ONE HORIZONTAL ROW of equal square cells, broad transparent gutters. Whole sword, cape, horns, hands and boots inside central 60% of each cell; genuine transparent alpha. Same LEFT-facing mild three-quarter view and same body scale as input 2. Carry the same broad greatsword low toward left in the canonical sword hand, other arm relaxed, unchanged across all cells.
THIS HALF must lift the FAR/SMALLER boot that is on SCREEN LEFT in neutral. The NEAR/LARGER boot under the large viewer-right shoulder supports the body all three poses. Track far leg from its hip on viewer-left through its OWN knee, ankle and smaller boot; do not lift the near/right-origin leg.
Per-cell normalized body root (550,590), head (530,350), ground y=840. Sword hilt (480,625), tip (210,780), cape stays within x=360..800.
LEFT CELL: near/larger leg stretches FORWARD toward left, near boot at (400,840) planted; far/smaller leg trails back-right, far boot (650,840) about to lift. Far leg visibly connects behind near leg to viewer-left hip.
MIDDLE CELL: near/larger supporting boot at (480,840) remains on ground. FAR/SMALLER knee rises in front of abdomen toward SCREEN LEFT (470,680); its smaller boot is lifted at (420,750), clearly above ground. The big near boot must NOT lift. Knee and foot visibly belong to the FAR smaller leg, not a third leg.
RIGHT CELL: near/larger supporting boot slides to (570,840); far/smaller boot reaches forward-left toward (360,800) to prepare landing. Far knee remains connected to left-origin hip. Keep two legs and exactly two boots.
This must visibly differ from image 2's middle raised SCREEN-RIGHT boot. Upper body, near shoulder, sword-holding hand and cape do not swap sides. No weapon animation, VFX, background, floor, shadow, text, labels, grid, checkerboard or watermark.

## 9 black-knight/reaction

原画: [sources/black-knight/reaction-v2.png](sources/black-knight/reaction-v2.png)

参照: [black-knight.png](../../late-stage-first-pass/v1/references/black-knight.png)

Use case: stylized-concept.
Asset type: FOUR-frame HIT / DEFEAT reaction sprite sheet of exact canonical horned BLACK KNIGHT.
Same black plate armor with restrained gold trim, black horns, red slit visor, tattered dark-crimson cape, ONE broad black greatsword with silver edge and red center rune. Refined crisp JRPG pixel art, same canonical proportions, palette and LEFT-facing mild three-quarter view.
Exactly four SMALL complete separate poses in equal 2x2 cells, row-major. Make each figure including entire greatsword and cape fit comfortably in central 60% of its cell, with 20% transparent border and huge gutters. NO overlap between poses, no sword or cape crossing any cell boundary. Same body and weapon scale in every frame. The sword is about 330 normalized units long, never grows.
Per-cell coordinates 0..1000: neutral pelvis (560,610), head (530,350), boot baseline y=835, cape maximum right x=800. Sword usually extends from hilt (500,650) down-left to tip (210,805).
Frame 1 HIT: torso recoils 7 degrees right, head drops only 10 units, sword remains in near hand, other hand braces chest; sword tip at (230,800). Two planted boots, no particles or hit star.
Frame 2 RECOVERY: return upright canonical neutral, same sword, horns, cape and feet. Two arms and two legs clearly connected.
Frame 3 COLLAPSE: knees bend and pelvis lowers to (560,725); head bows to (500,500). Both knees connect naturally to thighs. One gauntlet braces ground (460,825), sword-hand lowers hilt to (570,805), blade lies diagonally down-left to tip (240,835). Cape settles behind to x=800. No detached hand or sword.
Frame 4 DEFEATED HOLD: both knees down, pelvis (580,770), head bowed (505,610), bracing palm remains (460,835). Sword-hand still rests on hilt (570,825), SAME full blade lies across ground left to tip (240,845). Cape pooled calmly within x=350..800,y=690..850. Red visor dims. Exactly two arms and two legs, no extra boot or disembodied hand.
No external VFX, smoke, aura, floor slab, background glow, text, labels, grid, checkerboard or watermark. Genuine transparent alpha.

## 10 demon-armored-soldier/attack

原画: [sources/demon-armored-soldier/attack-v2.png](sources/demon-armored-soldier/attack-v2.png)

参照: [demon-armored-soldier.png](../../late-stage-first-pass/v1/references/demon-armored-soldier.png)

Use case: stylized-concept.
Asset type: FOUR-frame normal sword attack sprite sheet of the exact referenced demon armored soldier.
Fixed reference identity: black-and-gold full plate armor, pointed closed helmet with red slit visor, one straight steel sword, ONE tall black rectangular kite shield with gold frame and red vertical emblem, dark crimson ragged cape. Two arms, two hands, two legs. Refined crisp JRPG pixel art, reference proportions, colors, scale and LEFT-facing mild three-quarter angle.
Critical anatomy correction: SWORD is ALWAYS wielded in ONLY the sword-side hand (screen LEFT in neutral). The OTHER forearm (screen RIGHT in neutral) stays inside and behind the shield, gripping its central back handle. The shield is NEVER abandoned or floating. The shield arm NEVER joins the sword hilt. Do not add a third hand. Keep the shield in front of torso at screen-right in every frame.
Exactly four complete small sprites in equal 2x2 arrangement, upper-left to lower-right. Wide transparent gutters, each entire silhouette including sword tip, shield and cape must fit inside the central 60% of its own cell. Same character scale in every frame.
Per-cell normalized positions: pelvis (550,600), feet baseline y=835, head (535,360), shield center (650,565) in all four frames.
Frame 1 READY: sword hand (410,620), blade tip (200,780), shield held firm (650,565), head and shoulders neutral.
Frame 2 WINDUP: ONLY sword-side upper arm rises, sword hand (400,420), blade extends upper-left to tip (200,195). Elbow bends clearly from the left shoulder to the raised hand. Sword passes to LEFT of helmet. Shield-side upper arm, elbow, wrist remain attached behind the shield at (650,565), no hand at sword hilt.
Frame 3 LEFT-DOWN SLASH: only sword arm swings down, hand (390,650), tip (170,820). Torso inclines 8 degrees left, two boots planted, shield remains on its own forearm on screen-right. Cape lags to right.
Frame 4 RECOVERY: return sword, shield, torso, legs to frame-1 neutral. Cape settles.
The one-handed sword stays the exact same sword, same blade width, length and gold hilt in all cells. Shield maintains its exact tall straight frame and red emblem.
Body and held equipment only. No slash trails, impact, extra hands, floating shield, colored haze, aura, floor or ground shadow, labels, text, grid, watermark, checkerboard. True native transparent alpha around every silhouette.

## 11 demon-armored-soldier/danger-1

原画: [sources/demon-armored-soldier/danger-1-v2.png](sources/demon-armored-soldier/danger-1-v2.png)

参照: [demon-armored-soldier.png](../../late-stage-first-pass/v1/references/demon-armored-soldier.png)

Use case: stylized-concept.
Asset type: FOUR-frame "armor-break thrust" dangerous sword action, body-only, exact demon armored soldier in canonical reference.
Same black/gold plate armor, pointed helmet with red slit visor, red ragged cape, one straight steel sword, one tall black-and-gold shield with red central emblem, two arms and two legs. LEFT-facing mild three-quarter view, same proportions and refined crisp JRPG pixel art.
Critical: sword is wielded by ONE sword-side hand on SCREEN LEFT in neutral. OTHER arm stays attached behind shield on SCREEN RIGHT, holding its back grip all four frames. Never add a third hand, grip sword with shield arm, abandon or float shield.
Exactly four complete small poses in equal 2x2 cells, row-major. Whole body, sword, shield, cape and boots fit within normalized x=160..840,y=160..850 of EACH cell, with broad clear transparent borders. Same body and sword scale throughout.
Root pelvis (550,600), head (530,350), two boots planted at y=835; shield center remains (650,565).
Frame 1: shield firmly forward on its forearm, sword hand (410,620), tip (210,750), ready stance.
Frame 2: windup for a THRUST, sword hand draws to (570,565), same straight blade points left-up toward tip (350,485), sword elbow stays connected to left-origin shoulder. Shield remains held center (650,565) by the OTHER arm. A tiny white highlight on sword edge only.
Frame 3: thrust HORIZONTALLY LEFT, sword hand (380,565), straight blade extends to tip (150,565). Same sword length and width, no growing blade. Torso leans 7 degrees left, pelvis shifts only 10 units left, shield and arm remain together at screen-right, two boots support stance.
Frame 4: retract sword and return shield, hands and body to frame-1 neutral.
Separate slash and armor-break VFX will be displayed externally. No external white streak, shards, spell symbols, aura, floor, shadow, colored background, labels, text, grid, checkerboard or watermark. Genuine transparent alpha.

## 12 dream-demon/danger-1

原画: [sources/dream-demon/danger-1-v2.png](sources/dream-demon/danger-1-v2.png)

参照: [dream-demon.png](../../late-stage-first-pass/v1/references/dream-demon.png)

Use case: stylized-concept.
Asset type: FOUR-frame body-only casting animation "sleep moon" for the adult dream demon from the fixed canonical reference.
Exact same adult woman, lavender hair, red horns, pointed ears, black-and-gold dress, attached purple bat wings, one arrow-tip tail, two arms and exactly two booted legs. Refined crisp JRPG pixel art and unchanged reference palette, face, body proportions and LEFT-facing mild three-quarter camera.
FOUR complete separate small poses in a 2x2 sprite sheet. Each fits inside the central 60% of its cell with 20% transparent border. No silhouette crosses into another cell. All horns fully visible with plenty of space ABOVE them; wing tips, tail and two boots also have broad margin. SAME body scale throughout.
Movement plan normalized to each cell 0..1000: pelvis (520,580), head (480,300), both feet FLOAT with toes around y=830; no planted wide-legged stance. Wing roots stay attached near (520,380).
Frame 1 PREPARE: two relaxed hands rise from (430,570),(550,570) toward chest; wings slightly drawn inward.
Frame 2 HELD WINDUP: wings fold closer to her back, palms face each other at (460,440),(520,440), a TINY pale lavender glow of radius 15 between palms. Face looks left with quiet concentration. Horns remain identical and fully inside cell.
Frame 3 RELEASE: both forearms reach together toward LEFT, palms at (310,500),(360,520), fingers distinct and attached to the two wrists. Torso leans only 6 degrees left, floating pelvis stays (510,580). Wings open modestly, hair and tail trail right. ONLY hands, NO drawn moon, projectile, beam, magic circle, clouds or external spell effect.
Frame 4 RECOVERY: hands lower, wings and hair settle back to reference floating neutral pose; feet stay together and airborne.
The moon/status effect is a separate asset and MUST NOT be drawn on the body sheet. No extra hands, legs, boots or tail. No glow behind character, no floor or shadow, no stars, hit flashes, text, labels, grid, watermark or painted checkerboard. True transparent PNG alpha.

## 13 dream-demon/reaction

原画: [sources/dream-demon/reaction-v2.png](sources/dream-demon/reaction-v2.png)

参照: [dream-demon.png](../../late-stage-first-pass/v1/references/dream-demon.png)

Use case: stylized-concept.
Asset type: four-frame HIT and DEFEAT reaction sprite sheet of the exact adult dream demon in the reference.
Match canonical identity: adult woman with lavender hair, two dark red horns, pointed ears, red eyes, two attached purple bat wings, one arrow-tipped tail, fitted black-and-gold dress and exactly TWO black thigh-high boots. Refined crisp JRPG pixel art, exact reference palette, brightness and proportions. Left-facing mild three-quarter view.
FOUR separate complete small poses in equal 2x2 cells with very broad transparent gutters. Row-major order. Each pose fits entirely in central 60% of its own cell; every horn, wingtip, hair tip, boot and tail tip has clear transparent space around it. Never let neighboring poses overlap. Leave 20% blank margin on every side of each cell. SAME scale for all four figures.
Movement plan per cell 0..1000: neutral floating pelvis (500,580), head (480,300), boot toes normally at y=830, wing roots remain on upper back.
Frame 1 HIT: torso recoils 8 degrees to right, near hand at chest (510,420), other hand low (400,580), two knees at (480,680) and (565,710). Boots at (465,830) and (570,840), EXACTLY TWO BOOTS. No trails, ghost limbs or duplicated soles.
Frame 2 RECOVERY: resumes the canonical floating neutral stance, two arms relaxed and exactly two legs, pelvis (500,580), toes (475,830),(560,845).
Frame 3 COLLAPSE: stops hovering, pelvis lowers to (510,685), both knees bend together toward bottom-left; one hand at own thigh, other hand reaches downward (420,800). Wings fold slightly and remain attached; only TWO legs and TWO boots.
Frame 4 DEFEATED HOLD: seated/slumped on the ground, pelvis (515,760), both knees folded to her left (430,815), two boots tucked at (570,850),(660,850), near palm resting on ground at (405,850). Eyes closed, head tilted down, wings relaxed and folded. No new glow.
Keep the exact same anatomical two legs connected from hips through thighs and knees to their own two boots in EVERY cell. Tail is one thin arrow-tipped tail, never a third leg or boot. No loose detached body parts.
Genuine transparent alpha only, no background, colored haze, floor, shadow plate, hit star, spell effect, text, labels, grid, watermark or checkerboard. Body-only sprites.

## 14 dream-demon/reaction

原画: [sources/dream-demon/reaction-v3.png](sources/dream-demon/reaction-v3.png)

参照: [reaction-v2.png](sources/dream-demon/reaction-v2.png) / [dream-demon.png](../../late-stage-first-pass/v1/references/dream-demon.png)

Use case: background-extraction.
Input image 1 is the EDIT TARGET: four-frame dream-demon hit-and-defeat sprite sheet. Input image 2 is the FIXED CANONICAL REFERENCE, for matching colors.
Change ONLY the background: remove EVERY patch of purple, pink, brown and grey backlight, halo, haze, atmosphere and vignette surrounding the four figures and between their limbs, wings and hair. Replace ALL those background regions with true fully transparent alpha=0, not black and not a checkerboard. No background light is allowed anywhere.
Preserve the four existing character poses and their two-leg anatomy exactly. Keep original hair, horns, skin, black and gold costume, crimson/purple wing membranes, boots and tail colors. Do not cut holes in solid wing membranes or costume. Preserve pixel clusters and sharp sprite edges. Do not crop, resize, shift, add or remove body parts. Keep exactly four separate complete sprites in the existing 2x2 order, same body size and face identity.
The only opaque or partially opaque pixels should belong directly to a character silhouette; clear space outside each silhouette must have alpha zero. Absolutely NO glow or shadow around subjects, NO floor, NO effects, NO text. Export a genuinely transparent PNG.

## 15 effects/curse-orb

原画: [sources/effects/curse-orb-v2.png](sources/effects/curse-orb-v2.png)

参照: [curse-orb-generated.png](../../late-stage-first-pass/v1/sources/effects/curse-orb-generated.png)

Use case: stylized-concept.
Asset type: FOUR-frame seamless looping LEFT-FLYING CURSE ORB projectile for a refined pixel-art JRPG. This is a flight cycle ONLY. Input image is palette and motif reference, not the animation sequence to copy.
Exactly four complete separate sprites arranged in equal 2x2 cells with broad transparent gutters. Equal scale in every cell. Every cell has one intact round black-violet orb with bright magenta core, thin violet rotating energy and four small restrained golden diamond points. A short thin trail extends to the RIGHT, making travel direction LEFT obvious.
Per-cell normalized plan: projectile center locked (440,500), round core radius 110, thin energy shell radius 160. Four gold accents lie around radius 150. Trail extends from x=580 to x=800, within y=420..580, with only 3-5 small violet diamond particles. Entire effect stays inside x=200..820 y=300..700 leaving very generous transparent margins.
Frame 1: shell energy at phase 0 degrees, medium core brightness, all gold diamond points present.
Frame 2: energy curls rotate 90 degrees, core brightens slightly, round orb SAME size, same center, same gold accents.
Frame 3: curls rotate 180 degrees, brightness back to medium, orb SAME size, no explosion or extra ring, no expansion.
Frame 4: curls rotate 270 degrees, slight low pulse that connects smoothly back to frame 1. Orb and four accents remain intact.
CRITICAL: all four frames show the SAME full round projectile; NO shrinking, splitting, impact burst, dissolution, half-orb, expanding shockwave, extra sphere or disappearing core. Fly loop seamlessly 4 to 1. Impact is a separate asset and is not drawn here.
Style: crisp deliberate pixel clusters, stepped edges, dark outline, magenta/purple with tiny gold details; match reference motifs. Native transparent alpha outside actual projectile and sparse trail pixels. No background glow sheet, no floor, text, labels, cell borders, checkerboard or watermark.

## 16 effects/dark-flower

原画: [sources/effects/dark-flower-v2.png](sources/effects/dark-flower-v2.png)

参照: [dark-flower-generated.png](../../late-stage-first-pass/v1/sources/effects/dark-flower-generated.png)

Use case: stylized-concept.
Asset type: FOUR-frame single dark-flower ground burst, separate Lilith spell VFX for refined pixel-art JRPG.
Input image: exact palette and flower design reference. Preserve pointed black-violet petals with thin crimson/magenta and gold illuminated veins. Correct the timing: closed bud -> opening -> full low flower -> fading petals. No tall pillar.
Exactly FOUR small separate effects in equal 2x2 cells, row-major. Native transparent alpha. Same fixed ground center (500,730) in normalized 0..1000 cell coordinates. All visible pixels must stay within x=200..800,y=300..800, with 20% clear transparent border and broad cell gutters.
Frame 1: compact CLOSED pointed dark bud at (500,650), height 150, base only 170 wide. Only a tiny magenta line along seams, no already-open broad petals.
Frame 2: outer petals open outward and slightly upward, width 400, height 270; dark center bud starts to separate. One thin gold rim at ground, no rays extending above y=400.
Frame 3: fully OPEN LOW flower, width 560, height 300, pointed petals fan horizontally in a shallow cup. Bright magenta veins and a small white-pink central flash at (500,650), no vertical spire, no upward beam. Flower's ground center remains (500,730).
Frame 4: petals fold/dissolve into 8-12 small dark crimson/violet petal fragments around same ground center, fading gold flecks. NO opaque broad glow or intact fully-lit flower remains. End and hide after frame 4.
Only one flower per cell. Multiple locations and time offsets will be placed externally. Strong vivid magic at peak while leaving ground and nearby characters readable.
Crisp deliberate pixel clusters, stepped outlines, reference colors. No background, floor platform, opaque shadow, vignette, tall flame, pillar, character, text, labels, grid, checkerboard or watermark.

## 17 effects/dark-slash

原画: [sources/effects/dark-slash-v2.png](sources/effects/dark-slash-v2.png)

参照: [dark-slash-generated.png](../../late-stage-first-pass/v1/sources/effects/dark-slash-generated.png)

Use case: stylized-concept.
Asset type: four-frame SHORT DARK SWORD SLASH, a separate visual effect for black-and-gold knight enemies in a refined pixel-art JRPG.
Input image: use ONLY its palette and pixel-cluster quality (dark violet, red, narrow white-hot edge). Correct its arrow-like shape and extra rings. Create a SINGLE CURVED BLADE ARC sweeping upper-right to lower-left, not a projectile or beam.
Exactly FOUR separate complete effect sprites in a 2x2 sheet with very broad transparent gutters. Same coordinate system and same maximum scale across frames. Native transparent background.
Per-cell normalized trajectory: one thin diagonal curved blade arc runs from upper-right (700,260), bends through (430,480), ends lower-left (260,740). All visible pixels stay inside x=170..830,y=170..830 with ample clear margins. White inner edge is narrow, deep violet/red outer edge has only a few tiny red sparks. Empty center, no character, no weapon.
Frame 1: short faint starting arc occupies only the upper-right section from (700,260) to (530,410).
Frame 2: one crisp bright crescent sweeps along the full upper-right to lower-left trajectory. Thickest part only about 55 units wide, pointed taper at both ends. Strong readable flash, WITHOUT circle or shockwave.
Frame 3: SAME crescent position and size, lower brightness, only lower-left section still bright, upper-right edge starts to dissolve into 4-6 tiny red pixels.
Frame 4: only 5-8 small separated red/violet ember clusters near the lower-left ending segment, central region mostly transparent. NO remaining white edge or pointed projectile. The effect stops after frame 4, no persistent loop.
Critical: this is ONE directional curved sword arc, never a three-pronged arrow, full ring, expanding blast, vortex, second arc or multiple simultaneous hits.
Crisp deliberate pixel clusters and stepped edges, restrained white/magenta highlights with dark-violet and red outline. Genuine transparent alpha outside arc and individual sparks. No backdrop, halo sheet, floor, painted checkerboard, text, labels, grid or watermark.

## 18 effects/royal-cleave

原画: [sources/effects/royal-cleave-v2.png](sources/effects/royal-cleave-v2.png)

参照: [royal-cleave-generated.png](../../late-stage-first-pass/v1/sources/effects/royal-cleave-generated.png)

Use case: stylized-concept.
Asset type: FOUR-frame heavy "ROYAL CLEAVE" greatsword VFX, separate from knight body, for refined pixel-art JRPG.
Use referenced effect ONLY for exact black/crimson/violet, white-hot and tiny gold-spark palette and crisp pixel-cluster quality. Correct its boundary overflow and persistent last white slash.
Exactly FOUR complete separate effect sprites in equal 2x2 cells with broad transparent gutters. Every single ray, rock shard, spark and tip must have a very large clear border; entire maximum silhouette lies within normalized x=200..800,y=200..800 of EACH cell. Make effects small to guarantee clearance. No crossing of cell borders.
A SINGLE heavy diagonal greatsword slash travels from UPPER RIGHT (750,250) to LOWER LEFT impact (280,745). SAME fixed impact point (280,745) in every frame. A broad but controlled silver-white blade streak with crimson/violet outer edge, and only 5-8 small black rock shards around the lower-left impact point.
Frame 1: thin upper-right starter streak from (750,250) to (550,430), faint crimson outline. No ground burst yet.
Frame 2: powerful complete single diagonal slash to (280,745), with a compact impact fan at that point and 5-8 small rock shards contained inside x=200..430,y=630..800. Blade streak max width 65 units. Full streak and shards comfortably inside margins.
Frame 3: same diagonal band position, reduced white intensity, compact red/purple afterglow follows the SAME single trajectory, rock shards begin falling. No huge expanding radial blast, no new fork or ring.
Frame 4: only 6-10 tiny fading crimson/gold sparks and a few small black shards at lower-left impact point. The silver-white streak is COMPLETELY GONE. Effect then hides.
This is one directional heavy strike, no extra swords, no character, no projectile, no second arc, no circular shockwave, no continuous beam, no growing pillar. Keep the large action impressive with contrast and weight while preserving margins.
Native transparent alpha outside effect pixels. No background, vignette, floor slab, shadow plate, text, labels, borders, grid, checkerboard or watermark.

## 19 effects/sleep-moon

原画: [sources/effects/sleep-moon-v2.png](sources/effects/sleep-moon-v2.png)

参照: [sleep-moon-generated.png](../../late-stage-first-pass/v1/sources/effects/sleep-moon-generated.png)

Use case: stylized-concept.
Asset type: FOUR-frame looping SLEEP STATUS / SLEEP MOON ground marker, refined pixel-art JRPG.
Exactly four complete small effect sprites arranged in a 2x2 sheet. Wide empty transparent gutters and at least 20% clear border inside each cell. Same shape, scale, center and camera in all frames. Input image is only a palette/motif reference; do not copy its expansion or busy particles.
One delicate lavender crescent floats above a low thin elliptical magic seal. Center and most of the seal interior are completely transparent, allowing a character's boots to remain visible. Crescent is a thin solid curved stroke; the missing portion of moon is fully transparent, not filled with grey or black. Restrained small golden accents, very few square lavender motes. Calm readable status, not damage or explosion.
Per-cell normalized geometry: ellipse center (500,660), outer radii (220,65), stroke width 12; hollow interior. Crescent center (500,445), radius 105, inner cutout offset 45 units right. Only 4 tiny detached motes around x=350..650,y=430..620. Entire effect stays inside x=230..770,y=300..750.
Frames 1..4: identical moon and ellipse geometry. Very subtle light pulse medium -> bright -> medium -> slightly dim, only the four small motes rise at most 12 units and return on 4 to 1. Moon and seal never expand, rotate into another symbol, explode, collapse, disappear or gain new spikes. Seamless 4-to-1 loop.
Crisp deliberate pixel clusters and stepped edges, clear thin contour, purple/lavender with tiny pale-gold points. Real native transparent alpha outside strokes and motes and throughout hollow interiors. No soft background sheet, vignette, floor, opaque disc, text, sleep letters, labels, grid, checkerboard or watermark. No character.

## 20 effects/summon-gate

原画: [sources/effects/summon-gate-v2.png](sources/effects/summon-gate-v2.png)

参照: [summon-gate-generated.png](../../late-stage-first-pass/v1/sources/effects/summon-gate-generated.png)

Use case: stylized-concept.
Asset type: FOUR-frame single SUMMON GATE VFX, separate arch-demon spell for a pixel-art JRPG.
Use reference for dark-violet/crimson fire, black-and-gold pointed oval gate frame and gold-red ground seal. Correct the changing frame size. Exactly FOUR complete SMALL gates in a 2x2 sprite sheet, same scale, fixed geometry, wide transparent gutters, all sparks and crown tips inside central 60% of each cell.
Normalized geometry per cell 0..1000 is IDENTICAL in all frames: tall oval outer frame centered (500,490), outer radii (170,245), top gold finial at (500,210), bottom frame rests at (500,735). Ground ellipse center (500,740), radii (230,45). Entire effect stays x=230..770,y=180..820. Opening inside oval stays fully transparent so an imp can be seen through it. No opaque disc, backdrop, floor or new character.
Frame 1: fixed complete thin black/gold oval frame and finial faintly lit, a few tiny red-violet edge embers; opening clear.
Frame 2: SAME frame shape, width and height, inner crimson/violet rim brightens to open the portal. Tiny gold rim details become bright; aperture remains transparent.
Frame 3: SAME frame geometry at maximum power, bright flowing magenta inside the rim and 6 small embers confined near outer frame. No giant growing halo, lightning branches or increased frame size. Gold ground seal stays same position and size.
Frame 4: SAME frame geometry dims and dissolves into sparse rim fragments, no intact bright portal after this frame. Ground seal fades. Stop and hide after frame 4.
All frames fixed outer finial and ellipse coordinates. No expanding or contracting oval, extra ring, horned monster face, character, tall pillar or floor platform.
Refined crisp JRPG pixel clusters, stepped edges and exact reference palette. Genuine transparent alpha outside frame, flames and sigil strokes AND inside the empty portal. No background glow sheet, text, labels, borders, grid, checkerboard or watermark.

## 21 imp/attack

原画: [sources/imp/attack-v2.png](sources/imp/attack-v2.png)

参照: [imp.png](../../late-stage-first-pass/v1/references/imp.png)

Use case: stylized-concept.
Asset type: FOUR-frame normal short claw swipe by the exact small purple imp from canonical reference.
Preserve same compact imp, purple skin, red eyes, two gold/brown horns, two pointed ears, two small attached purple/red bat wings, two short arms with three claw fingers plus thumb per hand, two bent legs, one arrow-tip tail. Refined crisp JRPG pixel art, unchanged reference colors and proportions. LEFT-facing mild three-quarter view.
Exactly four complete small separate poses in equal 2x2 cells, row-major, generous transparent margins and gutters. Same body scale across all frames. All horns, wing tips, fingertips, feet and tail fully visible. Whole figure stays inside x=200..800,y=180..840 in normalized cell coordinates.
Critical correction: do NOT stretch the arm or fingers at release. Shoulder-to-wrist lengths remain the same in all frames; fingers remain short. Attack uses the FAR ARM on screen LEFT in the neutral pose. The near arm on screen-right stays bent down beside the body.
Pelvis stays near (540,610), head center (450,400), two feet hover with toes y=800, wing roots fixed on upper back.
Frame 1: small ready crouch in midair, FAR attacking hand (385,610), near hand (570,640), neutral wings and tail.
Frame 2: same FAR arm draws its short claw hand back to (435,490), elbow bends visibly from shoulder (445,500). Near hand remains (570,640). Do not raise the other arm overhead.
Frame 3: short sharp rake to LEFT, FAR hand at (300,570), shoulder shifts only 20 units left. Bent elbow and short forearm visibly connect to same far shoulder. Torso leans 8 degrees left, body does not lengthen. Near hand remains (570,640), two feet still hover. Wings stay attached and same size.
Frame 4: far hand returns to (385,610), body, horns, wings and tail recover to frame-1 neutral.
Body only. Do not draw giant claw trails, external VFX, hit stars, aura, floor, ground shadow, background haze, text, grid, labels, checkerboard or watermark. Genuine transparent alpha outside the imp.

## 22 lilith/attack

原画: [sources/lilith/attack-v2.png](sources/lilith/attack-v2.png)

参照: [lilith.png](../../late-stage-first-pass/v1/references/lilith.png)

Use case: stylized-concept. FOUR-frame BODY-ONLY normal magic bolt animation of the adult demon queen Lilith in the fixed canonical reference.
Preserve exact lavender hair, gold-red crown between two dark-red horns, face, black/crimson gold-trimmed long dress, two attached purple/red bat wings, two booted legs, body proportions, palette and refined crisp JRPG pixel art. Left-facing mild three-quarter view.
Exactly four small complete separate poses in equal 2x2 cells, row-major, same scale and huge transparent gutters. All horns, wings, hair, hands and dress fit central 60% of each cell with generous clear margins. Maintain floating posture, toes together at y=835, NEVER a planted wide-legged lunge.
Per-cell normalized plan: pelvis (520,585), head (485,300), wing roots (540,390), two feet close together around (495,825),(565,835).
Frame 1: relaxed hands at (440,570),(570,570), wings and dress canonical.
Frame 2: both palms gather at chest (450,450),(510,450), tiny attached magenta light radius 12 between them. Torso upright and floating.
Frame 3: same two arms extend LEFT modestly, palms (320,510),(370,530), clearly attached wrists and elbows; torso inclines 6 degrees left, pelvis remains (510,585), legs remain close and airborne. NO projectile, orb, beam, trail or external spell is drawn. Only fingertips may have 2-3 bright pixels.
Frame 4: hands lower and return to frame-1 neutral. Wings, hair and hem settle, body size stays fixed.
Flying curse orb and impact are separate images. The body sheet contains ZERO large magical balls, flashes, circles, haze or backgrounds. Native transparent alpha. No extra hands/limbs, floor, ground shadow, text, labels, grid, checkerboard or watermark.

## 23 lilith/danger-1

原画: [sources/lilith/danger-1-v2.png](sources/lilith/danger-1-v2.png)

参照: [lilith.png](../../late-stage-first-pass/v1/references/lilith.png)

Use case: stylized-concept.
Asset type: FOUR-frame body-only "crown of twilight flowers" casting animation of Lilith, exact canonical adult demon queen from reference.
Preserve adult face, lavender long hair, two curved dark-red horns, small gold-red crown, black/crimson long dress with gold trim, two attached large bat wings, two arms, two legs and same palette. LEFT-facing mild three-quarter view, refined crisp JRPG pixel art.
Four small COMPLETE separate figures in equal 2x2 cells, reading row-major. Each silhouette including wings, dress, hair and fingertips stays inside its cell's central 60%, with broad transparent margins. No cape, wings, sparks or hair may cross a cell boundary or touch any image edge. Keep SAME body scale in all frames; leave extra space and make figures smaller to fit open wings.
Per-cell normalized plan: pelvis (520,585), head (490,300), horns no higher than y=175, two boot tips at y=835 while floating, dress hem y=850. Wing roots fixed to upper back near (535,390); wings may spread only inside x=200..800. No widening of body.
Frame 1: both hands approach crown, fingertips at (450,295),(535,295); wings relaxed, fully visible; tiny red crown pinpoints only.
Frame 2: held windup, palms part to (380,410),(620,410), wings lift outward 15 degrees but tips stay inside x=200..800; gold crown edge glints, no floating spell.
Frame 3: release, same two arms open with palms at (330,490),(685,490), wrists and elbows clearly connected; torso faces left, stays upright, pelvis at (520,585), same two close floating legs. Hair follows right only 30 units. Crown and wing ribs tiny attached red pinpoints, NO lightning or external petals.
Frame 4: hands lower and wings fold to canonical neutral, same head height, body scale and floating foot position. Dress and hair settle.
Three separate dark-flower ground effects will be added externally with time offsets, so DO NOT draw flowers, bursts, magic circles, giant hand lights, lightning branches or projectiles onto this body sheet.
Crisp controlled pixel clusters, reference restrained crimson, gold, black and lavender. Native transparent alpha around each figure, no background haze, floor, ground shadow, text, grid, labels, checkerboard or watermark.

## 24 lilith/danger-2

原画: [sources/lilith/danger-2-v2.png](sources/lilith/danger-2-v2.png)

参照: [lilith.png](../../late-stage-first-pass/v1/references/lilith.png)

Use case: stylized-concept.
Asset type: FOUR-frame "seal of silence" BODY casting animation of the exact canonical adult Lilith.
Same adult demon queen, lavender hair, red curved horns, gold-red crown, black/crimson gold-trimmed long dress, two attached bat wings, exactly two arms and two booted legs. LEFT-facing mild three-quarter angle, same refined crisp JRPG pixel art and reference palette.
Exactly four complete SMALL separate poses in equal 2x2 cells with broad transparent margins. All horns, wings, fingers, hair and dress fit comfortably inside the central 60% of each cell. Never overlap cells. Same body scale throughout; maintain floating feet close together.
Per-cell root: pelvis (520,585), head (485,300), boot tips (490,830),(560,835). Wing roots fixed behind shoulder blades.
Identify TWO arms and keep identity: FAR ARM originates at shoulder on SCREEN LEFT (around 435,400). It will point LEFT. NEAR ARM originates at shoulder on SCREEN RIGHT (around 570,405). Its index finger stays near her lips in windup and release.
Frame 1: both hands relaxed near waist, far at (420,565), near at (565,565), wings relaxed.
Frame 2: NEAR/right-origin elbow bends and NEAR index finger rises to lips (465,345); FAR/left-origin arm folds across lower chest with hand (440,490). Wings fold closer to back. Tiny attached crown glint only.
Frame 3: SAME NEAR index finger remains at lips (465,345), connected through same elbow to right-origin shoulder. SAME FAR shoulder (435,400) extends its short forearm left with elbow (360,425), open palm (280,455). Two hands only, one near mouth and one pointing left. Torso stays upright and airborne, feet close together, no ground lunge.
Frame 4: pointing far arm lowers and near index finger leaves lips, both return to canonical neutral hands. Wings, hair and dress settle to frame 1.
Silence emblem is separate VFX, so no floating rune, spell circle, cloud, beam, large hand glow or mouth symbol on this body sheet. Native transparent alpha, no floor, background haze, shadow, text, labels, grid, checkerboard or watermark.

## 25 lilith/idle

原画: [sources/lilith/idle-v2.png](sources/lilith/idle-v2.png)

参照: [lilith.png](../../late-stage-first-pass/v1/references/lilith.png)

Use case: stylized-concept.
Asset type: FOUR-frame subtle floating IDLE LOOP of exact adult demon queen Lilith from canonical reference.
Preserve identical adult face, lavender long hair, gold-red crown between two dark-red curved horns, black/crimson gold-trimmed long dress, two attached purple bat wings and two booted legs. Refined crisp JRPG pixel art, unchanged colors, proportions, body scale and LEFT-facing mild three-quarter camera.
Four complete SMALL separate figures in equal 2x2 cells, row-major, with huge transparent gutters. Every horn, wingtip, hair curl, boot and hem must have at least 20% clear transparent border. Fit entire figure into central 60% of EACH cell. Never touch the canvas edges or overlap neighboring cells. Same character scale in every frame.
Normalized per-cell base: pelvis (520,585), head (485,300), highest horn no higher than y=160, boot tips around y=830, dress hem y=845. Arms relaxed at sides with hands (425,565),(565,565). Wings calmly open behind body, roots fixed to upper back, tips within x=200..800. Both legs close together and floating, no walking or ground contact.
Frame 1 NEUTRAL: canonical relaxed queen posture.
Frame 2 FLOAT UP: move the entire body upward ONLY 8 units; tiny chest breath; hair and hem lag down 5 units. Wing tips lift only 8 units without changing wing size.
Frame 3 NEUTRAL: return body to base height, hair and hem cross through neutral; no change in pose or proportions.
Frame 4 FLOAT DOWN: whole body lowers 8 units, hair and hem lag upward 5 units. Wing tips lower 8 units. This gently connects back to frame 1 with no sudden hair fan or wing jump.
No casting, new hand gesture, expression change, garment change, external glow, aura, magic, floor, shadow, background, text, labels, grid, checkerboard or watermark. Genuine transparent alpha around figures.
