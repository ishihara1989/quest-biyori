# Ninja forward 8-frame loop

Method: built-in image_gen, transparent_background=true. Identity reference: ../../idle-01.png. Eight chronological distinct source poses in 4 columns by 2 rows. Old sources retained. Forward v2 rejected for costume swaps; selected v3. Backward v3 rejected for background and nonalternating support; v4 prompt below.

## Full current prompt

Create exactly eight DISTINCT sequential frames of a seamless forward walk loop, 4 columns × 2 rows, on a genuinely transparent background. This is game pixel-sprite animation, no environment or shadows. Reference is character identity only, not a pose to repeat.
Same black-haired masked female chibi ninja, red bow/scarf/belt, black gold-trim outfit, ONE silver shuriken held in SAME front hand as reference. Head, body and equipment remain the same size. All frames face RIGHT, pelvis fixed at same local horizontal position, low gentle bob. Full-body complete with generous gutters.
MOST IMPORTANT: eight drawings of a COMPLETE TWO-STEP WALK. Give each drawing its proper gait position, not eight versions of same pose.
The leg with NETTED THIGH AND GOLD BUCKLE is always the NEAR leg. The leg with BARE THIGH AND BLACK BAND is always FAR. Never swap these outfit details. In bottom-row frames the near netted leg is BEHIND and the far bare leg is AHEAD, the opposite from top-row frame 1.
Top row left to right:
1 NEAR NETTED leg stretched forward RIGHT and planted, FAR BARE leg extended back LEFT.
2 NEAR NETTED leg supports bent weight ahead; FAR BARE foot leaves rear ground.
3 NEAR NETTED leg stands straight under hip, FAR BARE knee passes forward in front.
4 FAR BARE shin reaches forward RIGHT lifted, NEAR NETTED heel trails back LEFT.
Bottom row left to right:
5 FAR BARE leg stretched forward RIGHT and planted, NEAR NETTED leg clearly extended back LEFT.
6 FAR BARE leg supports weight ahead; NEAR NETTED foot leaves rear ground LEFT.
7 FAR BARE leg straight under hip; NEAR NETTED knee passes forward in front.
8 NEAR NETTED shin reaches forward RIGHT lifted; FAR BARE heel trails back LEFT. This joins frame 1 naturally.
Both open-toed black/red boots must ALWAYS point RIGHT: heel left, toes right. Raised rear boot may tilt slightly down but MUST NOT rotate toward camera or point left. Never mirror a boot, never change red ties. Subtle free-arm and ribbon movement. No running or long strides. Exactly 8 separated sprites, not 4, not repeated halves. Crisp matching reference pixel style. No labels, frame numbers, watermark, grid, background, glow or floor shadow.

## QA

Generated source will be inspected for shoe orientation, fixed leg costume identity, alternating support, full silhouettes, transparency, baseline, pelvis anchors and eight distinct poses.


Visual QA for selected forward v3: support alternates between netted near leg (frame 1) and bare far leg (frame 5). Near thigh mesh and gold buckle remain on the near anatomical limb throughout. Shoe toes face right, with small downward angles during heel lifting. No leftward shoe reversal. Shoulder posture changes modestly with the arm cycle; silhouette and weapon remain complete. Manual pelvis X anchors replace foot-center anchors to reduce body jitter. Builder and preview checks pass: true alpha, source and output margins, eight distinct poses, common y=207 baseline, 640ms loop with eight 80ms frames. No pose interpolation, mirrored feet, frame duplication or repainting was used.
