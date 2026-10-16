# パラディン backward

生成方法: 組み込み image_gen、transparent_background=true。承認済み待機原画を画風・デザインの参照、originalをデザインの補助参照。

```text
Use case: identity-preserve.
Asset type: transparent RGBA pixel-art sprite sheet for a belt-scroll RPG, PALADIN BACKWARD WALK, four-frame loop.
Input image 1 is the approved idle sprite sheet. Preserve its exact blonde paladin identity, pixel-art style, body proportions, silver armor with gold trim, navy cloak, white tabard, white ribbon, blue jewel tiara, and blue eyes. Input image 2 is the original design only. Keep the spiked mace down on screen left and tall silver gold kite shield ahead on screen right.
Exactly FOUR complete full-body frames in a spacious 2x2 grid in reading order. At least 15% transparent margins on every side of EVERY cell, around hair, mace head, full shield and feet. Same size in all frames. Separate clear cells.
Animation: the paladin continues facing RIGHT, guarding with shield and looking right, but carefully takes backward steps toward screen LEFT. This must be a newly drawn backward walk, NOT a mirrored forward walk. Slight torso lean forward to maintain guard, short guarded backsteps. Frame 1: near leg reaches BACK toward left and places heel, far leg stays right under weight. Frame 2: near leg supports at left under hip; far leg lifts, bent knee slightly forward, and travels backward under the body. Frame 3: far leg plants a step BACK toward left, near leg remains right with toe down; foot positions and leg occlusion reverse. Frame 4: far leg supports, near leg lifts and passes back under body, ready to return to frame 1. Visible alternating steps: two contact poses and two different passing poses. Upper body remains stable and mace is not swinging as an attack. Small hair/cloak motion. Loop and idle connection natural.
Rich crisp detailed pixel art matching the approved idle, dark outline, no smooth illustration style. True transparent alpha background, no floor or shadow, no checkerboard. No text, labels, grid lines, attacks, magic or extra objects. All body parts and all equipment must remain completely visible within their cell.
```

## v2: 脚の切り替わり修正

```text
Use case: precise-object-edit. Edit this transparent 2x2 PALADIN BACKWARD stepping sprite sheet. Keep TOP TWO cells unchanged. Fix ONLY BOTTOM TWO cells so the backward cycle alternates which leg is planted and lifted. Preserve all upper-body/face/hair/equipment art, exact scale, pixel style, and right-facing direction; she backs toward LEFT while keeping shield ahead at RIGHT. DO NOT mirror character or swap weapons.
BOTTOM LEFT: the prominently visible near leg, attached under the large silver-gold hip plate on the left of the body, must now stay toward screen RIGHT with toe on ground, trailing as the FAR leg reaches backward screen LEFT, heel planted. Clearly show the opposite leg occlusion versus top-left. Near knee bent forward to right, far boot extended left. Short guarded backward contact.
BOTTOM RIGHT: the near leg now lifts clearly FORWARD toward screen RIGHT with bent knee and raised boot in front, while the farther leg supports on ground at screen LEFT behind the pelvis. This contrasts top-right's near boot tucked backward on screen left and far boot on ground on screen right. She is gathering this lifted near leg to step BACKWARD next; shield and head stay right-facing with torso slightly forward.
Exactly two anatomically connected legs each frame, modest guarded steps, not high kicks. Preserve exact head/torso, ponytail/armor, navy cloak/white tabard and entire gold silver kite shield and spiked mace. Only change lower-limb pose and natural cloth occlusion. At least a small transparent margin around all silhouettes in cells. No background, checkerboard, floor shadows, labels, effects or attack. True alpha transparency.
```
# パラディン 後退 8フレーム v3

生成: 組み込み image_gen、transparent_background=true。identity reference: idle-01.png。
採用原画: source/paladin-backward-generated-v3.png。

```text
Use case: identity-preserve.
Asset type: production RGBA pixel-art PALADIN BACKWARD DEFENSIVE WALK sprite sheet, EIGHT distinct frames, FOUR columns by TWO rows.
Input image 1 is APPROVED idle-01 identity/style. Preserve exact young female blonde high ponytail white ribbon blue-eye paladin, silver plate armor with gold trim, white gold tabard, navy cape, tall silver kite shield with gold cross held in her LEFT hand on screen RIGHT, spiked ball mace held in her RIGHT hand on screen LEFT. Same rich small game pixel style, fixed 3/4 side view facing RIGHT, identical equipment handedness in all 8 frames.
BACKWARD means walk cautiously toward screen LEFT while facing and looking RIGHT at a threat. DEFENSIVE CHANGE: raise the kite shield slightly up and bring it inward ahead of her screen-right shoulder to protect chest and neck; top edge near eye line. Shield must visibly guard her chest more than idle does. Eyes focused right, brow alert, chin slightly tucked, shoulder behind shield, knees flexed with guarded compact stance. Raise mace slightly ready beside her screen-left hip, still same right hand, no attack. Face NEVER rotates left. No mirror.
Exactly 8 complete full-body frames equally spaced 4x2 grid. Frame order top-left to top-right then bottom-left to bottom-right. Same size, same pelvis x in each cell, fixed groundline. Minimum 12% transparent cell margin including full mace/shield/hair/boots. Entire sheet genuinely transparent alpha, no backdrop, no shadow, no checkerboard, no text or labels.
Legs alternate in a restrained BACKWARD walking loop. Both toes ALWAYS point RIGHT, even when feet extend behind to LEFT. Near leg is foreground leg under exposed hip armor and visually in front of far leg; far leg is behind tabard. Never exchange their identity or redraw feet facing left. Exactly 2 legs, no crossing.
8 equally spaced phases:
1 NEAR boot reaches backward screen LEFT, ball/toe contacts ground first with heel raised; FAR boot is ahead RIGHT sole planted, knee soft.
2 weight moves backward onto NEAR boot left, near heel gently lowers; FAR heel lifts ahead at right starting backward push.
3 NEAR foot supports under pelvis with knee bent; FAR knee bends and lifted boot begins passing backward from RIGHT to LEFT.
4 NEAR foot supports, FAR boot reaches behind LEFT just off floor, toes pointing RIGHT.
5 FAR boot lands behind LEFT toe-first; NEAR boot is ahead RIGHT planted. This contact pose must be clearly OPPOSITE leg to frame1; visible foreground near thigh and boot now extend toward RIGHT.
6 weight transfers backward onto FAR rear boot; NEAR heel lifts ahead RIGHT.
7 FAR foot supports beneath pelvis, NEAR foreground knee bends and lifted boot passes backward to LEFT.
8 FAR foot supports, NEAR boot reaches behind LEFT just above floor, toes pointing RIGHT, matching next frame1 toe contact.
Steady guard through all eight, small continuous up/down body variation below 2%, subtle cape/hair lag. Modest short backward steps, no running or floating. Distinct contact/down/passing/reach phases for each leg. Frame8 must connect continuously to frame1. Tight identity consistency: shield shape/gold cross unchanged; boots same silver shape, toes always RIGHT; ponytail/ribbon and armor identical. Crisp pixel clusters and dark outlines, no painted anime or blur.
Avoid background, glow, floor, shadows, labels, numbers, effects, extra equipment, clipping, duplicate poses, mirrored boots, changing shield hand, attack swings.
```

