# mage-cast-up

Built-in image_gen. Reference: mage idle and original design. RGBA preserved.

Use case: identity-preserve. Asset type: transparent RPG PIXEL ART STAFF RAISE transition, exactly FOUR full-body poses in ONE HORIZONTAL ROW of FOUR equal portrait-shaped cells, a 1x4 chronological strip.
Image1 is immutable original mage pixel-art style/palette/identity. Image2 is preceding closed-eye chant pose reference. SAME young witch, rich blue long hair, indigo gold-trim pointed hat, cream skirt and ornate indigo-gold robe, ornate straight brown staff with cyan crystal. Crisp pixel art same proportions and colors. Right-facing 3/4 view. Staff held in right hand on viewer RIGHT, no swapping arms. Feet stay planted and hat/head fixed. All limbs anatomically attached, one rigid staff constant length.
Motion: FROM upright closed-eye chanting pose, lift the right hand and STAFF toward the sky to an UPWARD spell pose, final staff vertical above/right of the hat, arm clearly raised and fully extended. Not pointing forward at the end.
Per portrait cell normalized coordinates: feet(.46,.90), head(.46,.48), hat top(.46,.32), lifted hair tips(.12,.59); body height about .58 cell. The character body must be SMALLER inside each cell so fully raised staff has plenty of headroom. Keep staff top with minimum 8% transparent padding.
Frame1 chanting start: grip(.65,.62), crystal(.69,.30), bottom(.59,.88). Eyes closed.
Frame2 bent elbow raised: grip(.68,.50), crystal(.77,.20), bottom(.59,.79).
Frame3 hand at forehead level: grip(.67,.36), crystal(.76,.11), bottom(.57,.63). Eyes starting to open.
Frame4 final held-UP pose: right arm extended above head on viewer RIGHT, hand(.66,.30), crystal(.68,.08), staff lower end(.62,.58). Staff points straight UP. Eyes OPEN, focused. Do not hide hand in hat; arm visible beside brim.
Hair floats left slightly through the four frames; roots locked under hat. Pose starts like reference chant and transitions naturally to raised arm. Scale body equally in all cells even though weapon increases total silhouette height. Entire hat, feet, hair and staff visible. Generous transparent gutters.
Only character/staff opaque pixels; fully transparent RGBA everywhere else. No aura, haze, gradients, particles, floor, shadow, labels, borders. Keep reference saturated blue/indigo/gold palette.
CRITICAL LAYOUT: only one row! FOUR full-body poses arranged LEFT TO RIGHT, no second row. Use wide canvas aspect about 3:1. Each character fully isolated in one vertical column, no overlap. Staff gem always at least .12 of cell height below the top border. Keep the mage body modest sized to fit skyward staff with plenty of padding. No part can reach another cell. Steps 1,2,3,4: staff upright at waist -> raised elbow -> arm overhead -> full upward hold. Frame4 crystal at y=.13, raised hand y=.38. Do NOT lift gem to canvas edge. No background whatsoever, true transparent.
