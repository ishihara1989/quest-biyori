# パラディン 前進 8フレーム v3

採用原画: source/paladin-forward-generated-v4.png。v4修正指示:

```text
Use case: precise-object-edit. Edit input image 1, the PALADIN forward-walk 4-column 2-row 8-frame sprite sheet. Input image 2 is the approved idle identity reference. Two REQUIRED corrections:
1 REMOVE ALL brown background and any brown glow, floor or shadow. Every pixel outside the actual character silhouettes must be FULLY transparent alpha=0, including gaps between legs, behind mace, behind shield and around hair. Output must be a clean isolated RGBA game sprite sheet. No matte background of any color, no checkerboard, no gradient, no halo. Preserve solid character pixels and dark outlines exactly.
2 Correct lower-row legs to be OPPOSITE-LEG phases; current lower row continues extending the NEAR foreground leg forward like top row. At lower-left (frame5), the foreground near leg emerging from the ornate screen-left hip armor must extend BACK toward screen LEFT with its boot toe still pointing RIGHT and heel lifted. FAR rear leg must reach forward RIGHT heel down under shield. Lower row column2/frame6: far leg planted ahead under shield, near leg behind with heel raised pushing off. Lower row column3/frame7: far leg supports under torso, near foreground knee bends and comes forward with boot lifted. Lower row column4/frame8: far leg heel rises beneath torso, near foreground leg extends forward just above floor so frame8 flows to frame1.
Keep top row four poses unchanged except REMOVE background. Keep face, golden hair, shield screen RIGHT, mace screen LEFT, torso, tabard, armor/cape, pixel style, scale, 4x2 layout unchanged across all eight frames. Both boot toes always RIGHT, never mirror entire character. Exactly two anatomically connected legs in each frame. Entire figures with transparent margins, eight distinct gait poses. Genuine transparency is mandatory.
```

生成: 組み込み image_gen、transparent_background=true。identity reference: idle-01.png。

```text
Use case: identity-preserve.
Asset type: production transparent RGBA pixel-art eight-frame PALADIN FORWARD WALK sprite sheet for a side-view RPG.
Input image 1 is the APPROVED idle-01 character identity/style reference. Preserve this exact small chibi young female paladin with blonde high ponytail tied white ribbon, blue eyes, silver armor gold trim, navy cloak, white gold tabard, large silver kite shield with gold cross carried in her left hand ahead at screen RIGHT, and silver spiked ball mace in her right hand trailing low at screen LEFT. Same equipment, palette, pixel cluster rendering and anatomy across every frame. Fixed three-quarter side view facing RIGHT. No mirroring.

Create exactly EIGHT genuinely distinct animation drawings arranged in FOUR equal columns by TWO equal rows, chronological reading order left-to-right top row then left-to-right bottom row. True transparent background. Each figure fits entirely within its own cell including hair/mace/shield/boots, with minimum 12% transparent gutters. Same character height, pelvis x, fixed ground baseline, camera, proportions and head size for all frames. The animation is in-place walking FORWARD toward RIGHT, moderate short confident armored gait with steady shield and low mace. Clearly animate both legs alternately. Near leg is the foreground leg seen at screen-left hip under exposed ornate silver/gold thigh plate; far leg is behind tabard at screen-right hip. Do not switch the identity of these legs. Both boot toes ALWAYS point screen RIGHT in all eight frames, including boots behind pelvis; toes are NEVER left-facing and soles must follow foot orientation. No crossed knees or disconnected feet.

EIGHT sequential phases, each 1/8 of a continuous gait:
1 near-leg forward contact: near foot ahead RIGHT, heel contacts floor; far foot trails LEFT with heel lifted.
2 near-leg down: near sole plants and knee softens under weight; far heel raises more and far toes push away.
3 near-leg support passing: near foot underneath pelvis, far bent knee and boot swing forward passing behind near leg.
4 near-leg support up: near heel rises beneath pelvis; far leg reaches ahead RIGHT with heel just above ground.
5 far-leg forward contact: far heel contacts ahead RIGHT; near leg extends behind LEFT with heel up. OPPOSITE leg silhouette from phase 1.
6 far-leg down: far sole plants and knee softens; near toes at rear push off with heel high.
7 far-leg support passing: far foot under pelvis; near knee bends and near lifted boot crosses forward, clearly visible in foreground.
8 far-leg support up: far heel rises under pelvis; near leg reaches ahead RIGHT, heel just above floor. Connects smoothly to phase 1.
Small smooth body down/up 2-3% height only. Cape/ponytail follow with restrained secondary motion, no large size differences. Eight DISTINCT leg poses; never repeat first four in second row. Keep head features, silver boot shape, shield size and gold-cross design identical. Full rich crisp pixel art, restrained palette clusters and dark contour like reference, no smooth painted anime.
Avoid text, labels, numbers, grid lines, checkerboard, floor, shadows, sparkles, attack pose, extra limbs, extra weapons, duplicated frames, foot reversal. Transparent alpha must be real.
```
