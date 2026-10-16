# アルラウネの手下の生成プロンプト

組み込み image_gen を使用。背景透過。最初にアルラウネの小花を参照し、以後は手下の待機1コマ目を参照。

## idle

Use case: stylized-concept.
Asset type: FOUR-FRAME animation sprite sheet for the same small walking plant minion in a side-view pixel-art RPG.
Input image is STRICT character identity, palette, anatomy, proportions and pixel-style reference. Match exactly: NO face or eyes; ONE pink/plum five-lobed trumpet flower head, golden yellow inner stamens, flower opening horizontally LEFT, green calyx at back RIGHT; curved sturdy green stem neck/trunk; overlapping pointed leaf torso; two thin leafy curled vine arms; two splayed green root legs with root toes. All body parts botanical. No other bloom, main boss blossom, human body, clothing or weapon. Flower head about one third of upright height. Keep same flower diameter, body mass and root thickness in every pose.
LEFT-facing three-quarter SIDE VIEW. Exactly FOUR chronological full poses in 2 columns x 2 rows invisible equal grid, landscape1536x1024, cells768x512, order top-left top-right bottom-left bottom-right. Entire sprite inside its cell with generous transparent margin. Consistent camera scale: upright height380px, flower head diameter160px, root ground baseline local y470 and root trunk center local x400. No zoom or pose-dependent scaling.
Crisp detailed retro RPG pixel art, hard square pixel clusters, stepped silhouettes, dark colored outlines, pink and plum petals, emerald/olive green vines/leaves, golden yellow flower core. TRUE TRANSPARENT ALPHA outside actual sprite and between all roots/leaves. No backdrop, floor, cast shadow, checkerboard, glow, haze, blur, text, labels, border, watermark or detached particles.
Animation: refined FOUR-FRAME very subtle IDLE LOOP. Reproduce supplied reference pose tightly, including bent stem length, head orientation, fixed leaf torso, thin vine arms and both exact splayed root foot shapes. Root feet never step, spread differently or leave ground. Keep SAME head size and SAME neck length, NO stretching taller, NO squash scale, NO changes in proportions. All four sprite heights must be within8px of each other at this source resolution. Stem trunk origin and root baseline fixed near x400,y470 in EVERY cell. Upright reference silhouette height380px.
Frame1 exact reference neutral pose.
Frame2 flower head sways only6px up/back, while stem flexes minimally; leaf tips trail only4px right, arms remain relaxed near reference angles.
Frame3 flower head sways only4px down/forward, stem flexes minimally; leaf tips trail4px left, arms relaxed.
Frame4 almost exact reference neutral, about2px of leaf-tip followthrough so 4->1 connects perfectly.
NO tall stretch in frame2, NO large head displacement, NO outspread arms, NO exaggerated motion. Four gently distinct frames of the SAME standing creature.

## move

Use case: stylized-concept.
Asset type: FOUR-FRAME animation sprite sheet for the same small walking plant minion in a side-view pixel-art RPG.
Input image is STRICT character identity, palette, anatomy, proportions and pixel-style reference. Match exactly: NO face or eyes; ONE pink/plum five-lobed trumpet flower head, golden yellow inner stamens, flower opening horizontally LEFT, green calyx at back RIGHT; curved sturdy green stem neck/trunk; overlapping pointed leaf torso; two thin leafy curled vine arms; two splayed green root legs with root toes. All body parts botanical. No other bloom, main boss blossom, human body, clothing or weapon. Flower head about one third of upright height. Keep same flower diameter, body mass and root thickness in every pose.
LEFT-facing three-quarter SIDE VIEW. Exactly FOUR chronological full poses in 2 columns x 2 rows invisible equal grid, landscape1536x1024, cells768x512, order top-left top-right bottom-left bottom-right. Entire sprite inside its cell with generous transparent margin. Consistent camera scale: upright height380px, flower head diameter160px, root ground baseline local y470 and root trunk center local x400. No zoom or pose-dependent scaling.
Crisp detailed retro RPG pixel art, hard square pixel clusters, stepped silhouettes, dark colored outlines, pink and plum petals, emerald/olive green vines/leaves, golden yellow flower core. TRUE TRANSPARENT ALPHA outside actual sprite and between all roots/leaves. No backdrop, floor, cast shadow, checkerboard, glow, haze, blur, text, labels, border, watermark or detached particles.
Animation: seamless FOUR-FRAME WALKING ROOT LOCOMOTION LOOP, moving LEFT in place (game translates the character). Show clear alternating steps of both root legs. Plant trunk and head remain same volume, head always pointing horizontally left.
Frame1: near/front root leg reaches LEFT to plant toes; far/rear root leg trails to RIGHT with curled toes just lifting. Leaf arms counter-swing.
Frame2: planted front root supports weight, trailing root bends and lifts completely from ground and passes underneath trunk; head/body dips very slightly, arms pass neutral.
Frame3: far root now reaches LEFT and plants toes, near root trails RIGHT and lifts; reverse arm swing. Opposite leg supports from frame1.
Frame4: planted far root supports weight, near root bends/lifts and passes below trunk to begin next step; body/flower near neutral, connects smoothly back to frame1.
NO duplicated foot poses, no hopping, no dragging both feet flat in every frame. Keep the botanical root legs and same leaves.

## hit

Use case: stylized-concept.
Asset type: FOUR-FRAME animation sprite sheet for the same small walking plant minion in a side-view pixel-art RPG.
Input image is STRICT character identity, palette, anatomy, proportions and pixel-style reference. Match exactly: NO face or eyes; ONE pink/plum five-lobed trumpet flower head, golden yellow inner stamens, flower opening horizontally LEFT, green calyx at back RIGHT; curved sturdy green stem neck/trunk; overlapping pointed leaf torso; two thin leafy curled vine arms; two splayed green root legs with root toes. All body parts botanical. No other bloom, main boss blossom, human body, clothing or weapon. Flower head about one third of upright height. Keep same flower diameter, body mass and root thickness in every pose.
LEFT-facing three-quarter SIDE VIEW. Exactly FOUR chronological full poses in 2 columns x 2 rows invisible equal grid, landscape1536x1024, cells768x512, order top-left top-right bottom-left bottom-right. Entire sprite inside its cell with generous transparent margin. Consistent camera scale: upright height380px, flower head diameter160px, root ground baseline local y470 and root trunk center local x400. No zoom or pose-dependent scaling.
Crisp detailed retro RPG pixel art, hard square pixel clusters, stepped silhouettes, dark colored outlines, pink and plum petals, emerald/olive green vines/leaves, golden yellow flower core. TRUE TRANSPARENT ALPHA outside actual sprite and between all roots/leaves. No backdrop, floor, cast shadow, checkerboard, glow, haze, blur, text, labels, border, watermark or detached particles.
Animation: FOUR-FRAME DAMAGE RECOIL followed by return to idle. Unseen attack arrives from LEFT, no attacker or projectile drawn. Roots remain anchored at same point.
Frame1: sharp recoil to RIGHT, stem neck arches backward and flower is jerked slightly back/up, leaf arms raise involuntarily, leaves flutter right.
Frame2: deepest bend backward RIGHT, flower funnel head tilts back but its mouth still faces left, leaf arms curl defensively close to body, roots brace widely and trunk flexes strongly. Entire creature retains full design and size.
Frame3: stem straightens halfway, head swings back toward left-facing neutral, arms loosen, leaves settle.
Frame4: almost identical to supplied upright neutral idle pose, flower horizontal left, roots and arms relaxed; ready to return to idle.
Clear deformation of stem and leaf recoil, four distinct phases, no detached petals, no blood, no impact flash covering art, no extra particles.

## down

Use case: stylized-concept.
Asset type: FOUR-FRAME animation sprite sheet for the same small walking plant minion in a side-view pixel-art RPG.
Input image is STRICT character identity, palette, anatomy, proportions and pixel-style reference. Match exactly: NO face or eyes; ONE pink/plum five-lobed trumpet flower head, golden yellow inner stamens, flower opening horizontally LEFT, green calyx at back RIGHT; curved sturdy green stem neck/trunk; overlapping pointed leaf torso; two thin leafy curled vine arms; two splayed green root legs with root toes. All body parts botanical. No other bloom, main boss blossom, human body, clothing or weapon. Flower head about one third of upright height. Keep same flower diameter, body mass and root thickness in every pose.
LEFT-facing three-quarter SIDE VIEW. Exactly FOUR chronological full poses in 2 columns x 2 rows invisible equal grid, landscape1536x1024, cells768x512, order top-left top-right bottom-left bottom-right. Entire sprite inside its cell with generous transparent margin. Consistent camera scale: upright height380px, flower head diameter160px, root ground baseline local y470 and root trunk center local x400. No zoom or pose-dependent scaling.
Crisp detailed retro RPG pixel art, hard square pixel clusters, stepped silhouettes, dark colored outlines, pink and plum petals, emerald/olive green vines/leaves, golden yellow flower core. TRUE TRANSPARENT ALPHA outside actual sprite and between all roots/leaves. No backdrop, floor, cast shadow, checkerboard, glow, haze, blur, text, labels, border, watermark or detached particles.
Animation: FOUR-FRAME WILTING DEFEAT sequence, ending as a fully collapsed low plant heap on ground. Root origin remains fixed, retain same physical flower diameter and thickness of roots/leaves; do not shrink the character.
Frame1: flower head droops forward LEFT, upper stem buckles, arms limp and leaves sag, root knees bend. Height about80% upright.
Frame2: stem bends sharply forward and DOWN to LEFT, trumpet bloom near ground and tilted diagonally down-left, root legs crouch/fold, leaf arms collapse. Height about50% upright.
Frame3: flower head rests sideways on ground at LEFT, stem and leaf torso have collapsed horizontally behind it to RIGHT; roots/arms sprawled and limp. Height about25% upright.
Frame4: persistent defeated low silhouette: the SINGLE intact wilted pink trumpet bloom lies sideways LEFT directly on ground, entire green stem trunk folded flat in two soft bends, wilted leaves and curled root legs flat to RIGHT, leaf arms also on ground. No upright neck or torso remains. Final height at most25% standing height, but flower itself keeps its original diameter when lying on its side. Petals folded softly and mouth down-left. Hold this pose permanently.
No revival, no disappearing body, no debris explosion, no detached petals, no blood, no other creatures. Fit the whole horizontal collapsed plant inside its cell with generous transparent margin.

## attack

Use case: stylized-concept.
Asset type: FOUR-FRAME animation sprite sheet for the same small walking plant minion in a side-view pixel-art RPG.
Input image is STRICT character identity, palette, anatomy, proportions and pixel-style reference. Match exactly: NO face or eyes; ONE pink/plum five-lobed trumpet flower head, golden yellow inner stamens, flower opening horizontally LEFT, green calyx at back RIGHT; curved sturdy green stem neck/trunk; overlapping pointed leaf torso; two thin leafy curled vine arms; two splayed green root legs with root toes. All body parts botanical. No other bloom, main boss blossom, human body, clothing or weapon. Flower head about one third of upright height. Keep same flower diameter, body mass and root thickness in every pose.
LEFT-facing three-quarter SIDE VIEW. Exactly FOUR chronological full poses in 2 columns x 2 rows invisible equal grid, landscape1536x1024, cells768x512, order top-left top-right bottom-left bottom-right. Entire sprite inside its cell with generous transparent margin. Consistent camera scale: upright height380px, flower head diameter160px, root ground baseline local y470 and root trunk center local x400. No zoom or pose-dependent scaling.
Crisp detailed retro RPG pixel art, hard square pixel clusters, stepped silhouettes, dark colored outlines, pink and plum petals, emerald/olive green vines/leaves, golden yellow flower core. TRUE TRANSPARENT ALPHA outside actual sprite and between all roots/leaves. No backdrop, floor, cast shadow, checkerboard, glow, haze, blur, text, labels, border, watermark or detached particles.
Animation: FOUR-FRAME HORIZONTAL SEED-SPITTING ATTACK, using the trumpet flower HEAD as a botanical nozzle. SAME plant body and ONE flower head. Aim straight LEFT at flower-head height, never diagonally up or down. Shoot from the yellow center INSIDE the bloom, not hands or torso. Roots stay planted.
Frame1 WIND-UP: stem neck draws head backward RIGHT a little, blossom petals slightly contract, roots brace, leafy arms drawn back. Flower opening remains horizontally left.
Frame2 FIRE: stem neck drives flower head forward LEFT by40px, funnel points straight left, pink rim opens wide, yellow stamens extend left with 2-3 tiny sharp pale yellow muzzle ticks attached immediately to flower center. Head is lower and level; no upward spit.
Frame3 RECOIL: flower head springs backward RIGHT, stem neck bends back elastically, petals slightly contract, leaf arms/leaves kick back from recoil. Muzzle ticks gone.
Frame4 RECOVERY: return very close to supplied upright neutral idle stance, head horizontally left and arms relaxed, ready to idle.
Keep head physically same size in all four poses, just petal opening/closing and stem movement. CRITICAL: flying seed projectiles are a SEPARATE PNG asset; DO NOT draw any detached seeds, flying objects, trails, missiles, particles or fruit in this sheet. Only the minion and tiny attached muzzle ticks in frame2. Entire extended head must fit within its cell.

## idle initial design (reference only)

Use case: stylized-concept.
Asset type: production FOUR-FRAME IDLE animation sprite sheet for a small plant minion in a side-view pixel-art RPG.
Input image is a STRICT design reference ONLY for the THREE SMALL pink trumpet flowers on the LEFT of the Alraune boss and her green vines/leaves and pixel shading. Do NOT reproduce the woman or her large main flower.
Subject: one small walking plant creature, an Alraune minion. Its HEAD is exactly the same pink/magenta trumpet blossom as Alraune's smaller satellite flowers: left-facing wide five-lobed pink flared corolla, darker plum exterior funnel narrowing into a green calyx at the back RIGHT, small golden yellow pistil/stamens deep inside the mouth. Flower opening points horizontally LEFT, in three-quarter side view. NO eyes, NO human face, NO daisy-shaped face. The bloom IS its whole head.
Body: a short sturdy living green stem trunk with overlapping pointed green leaves around the torso, two small flexible leafy vine arms, and two splayed root feet with curling root toes that can step. Entire anatomy is made of plants, green vines, leaves and roots. No clothing, weapons, human skin, woman, extra flowers or large base blossom. Small readable silhouette, flower head about one third of total height. Exact same identity and size across all four poses.
Layout: exactly FOUR complete sequential poses in a 2 columns x 2 rows invisible equal grid, landscape 1536x1024, cells768x512, chronological reading order top-left, top-right, bottom-left, bottom-right. All sprite parts INSIDE each cell with generous true transparent margins; full upright height about370px, root ground baseline local y475, stem trunk root origin local x400. Keep same camera, head diameter, leaf shapes, and pixel density. No labels or visible grid.
Animation: seamless 4-frame IDLE loop in place. Frame1 relaxed roots grounded, head horizontal left, vine arms relaxed. Frame2 stem gently rises and arches, head lifts slightly, leaf arms and leaves sway back. Frame3 stem settles with small squash, head dips slightly, leaves sway forward. Frame4 eases nearly back to frame1 with leaf tips following through. Four subtly different connected poses, no translation and no jumping.
Style: detailed crisp retro RPG pixel art matching the reference, hard square pixel clusters, stepped edges, dark colored outlines, dense limited-color shading with bright pink petals, plum shadows, olive and emerald green plant body and golden yellow flower center. Truly TRANSPARENT ALPHA backdrop and gaps between leaves/roots. No floor, ground shadow, checkerboard, colored matte, glow, aura, blur, labels, text, watermark or detached particles.
