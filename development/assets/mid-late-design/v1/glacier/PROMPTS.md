# 氷牙マンモスの生成プロンプト

2026-10-12 JST。組み込み image_gen 使用。透過PNGの静止基準。敵一覧とドロップ一覧は、生成した個別基準をセルに配置し、他の既存ピクセルを保持する。

## glacier-ice-tusk-mammoth

保存先: `glacier/ice-tusk-mammoth.png`  
原画: `glacier/source/ice-tusk-mammoth-generated-v1.png`  
基準: `glacier/monsters-v2.png`

```text
Use case: stylized-concept
Asset type: one isolated transparent PNG static JRPG boss reference sprite, square 1024x1024.
Reference image: the supplied glacier atlas is ONLY a style and palette reference. Generate ONLY a new mammoth, no other creatures.
Primary request: an imposing Ice-Tusk Mammoth, a colossal woolly elephant boss facing LEFT in mild three-quarter side view. Huge tall domed shoulders, compact massive torso, exactly four thick weight-bearing elephant legs, a long flexible elephant trunk hanging forward and curling gently inward, two enormous curved translucent azure ICE TUSKS with solid ivory roots, small rounded ears, silver-white layered shaggy wool with navy shadows, dark navy lower legs, three broad glacial crystal slabs on the back and shoulders, small bright cyan eyes. Clear mammoth anatomy, tusks in front of the trunk with both tusks readable, no wings, no horns, no serpent anatomy, no dragon face, no reptile scales. Ancient majestic heavyweight silhouette.
Style: same refined late-1990s fantasy JRPG pixel-art taste as reference, crisp deliberate visible pixel clusters, stepped edges, rich limited white/navy/azure palette, dark navy outline, chunky pixels readable at 250px. No soft airbrush or 3D rendering.
Composition: entire mammoth in a single calm grounded neutral pose. Body centered near (550,510), feet contact y=800, full tusk and trunk within x=130..870, tallest back crystal y=170. Occupy about 78% canvas width and 70% height. Keep at least 10% transparent margin on every side. All four feet, both tusk tips, trunk tip and tail visible. Actual transparent alpha background. No text, grid, other creatures, ground slab, cast shadow plate, aura, particle cloud, frame or attack effects. This is one static reference, not a sprite sheet or animation.
```

## glacier-mammoth-ice-tusk

保存先: `glacier/mammoth-ice-tusk.png`  
原画: `glacier/source/mammoth-ice-tusk-generated-v1.png`  
基準: なし

```text
Use case: stylized-concept
Asset type: one isolated transparent PNG rare inventory material icon, square 1024x1024.
Primary request: one Mammoth Ice Tusk, a huge thick gently curved elephant tusk fragment with an ivory-white root, a few silver-white wool strands attached only at the base, a broad translucent deep azure crystalline outer shell, long cyan glacial seams and a bright icy-white pointed tip. A single strongly curved tapering tusk, substantially thicker and more majestic than ordinary wolf fangs, symbol of an ancient glacier mammoth. No dragon heart, no orb, no claw, no pair of fangs.
Style: refined fantasy JRPG PIXEL ART, crisp visible pixel clusters and stair-step silhouette, dark navy outline, limited ivory/azure/navy palette and bright small cyan highlights, inventory icon readable at 64px. No smooth rendering, photographic texture or 3D.
Composition: single tusk diagonally from thick lower-left root to upper-right tip, centered, about 72% of canvas, at least 14% actual transparent margin on each side. Entire object fully visible. True transparent alpha, no floor, shadow plate, lettering, borders, rarity badge, background, glow cloud, snowflake decoration or extra objects.
```

## glacier-mammoth-effects

保存先: `glacier/effects.png`  
原画: `glacier/source/effects-generated-v1.png`  
基準: なし

```text
Use case: stylized-concept
Asset type: transparent PNG glacier attack VFX design atlas, square, EXACT 2 columns by 2 equal rows; four STATIC different attack effect objects, not animation.
Primary request: spectacular late-game glacier mammoth effects for a side-view fantasy RPG.
TOP LEFT: one broad azure-white tusk sweep crescent traveling LEFT, a thick icy crescent arc with translucent blue ice fragments along its trail, clear pointed direction and dark azure inner edge.
TOP RIGHT: one ground ice-quake burst, low wide elliptical cyan shockwave expanding from a bright central impact, with 5 jagged crystal spikes erupting from the rim and chunky scattered snow.
BOTTOM LEFT: one falling large faceted blue glacial boulder with a downward white-blue streak and compact icy impact shards at its lower tip, all in one complete silhouette.
BOTTOM RIGHT: one grand aurora frost crown burst, a low broad elliptical ice shockwave with a hollow readable center, two curling pale mint aurora ribbons above its rim and luminous diamond snow fragments, violet-blue outside edge.
Style: refined late-1990s fantasy JRPG PIXEL ART with crisp chunky pixel clusters, stepped silhouettes, dark azure edges, high-energy cyan/white highlights, restrained mint and violet accent, no airbrush, no realistic texture, no 3D.
Composition: exact equal 2x2 quadrants, each complete distinct effect centered in its own quadrant and occupying 65-75% width, minimum 12% fully transparent padding to every cell boundary. No overlap between cells. Mild three-quarter side-view to match a RPG battle floor. The fourth effect should feel like an ultimate move but leave its center see-through. Actual transparent alpha including hollow areas; no opaque rectangular backgrounds, checkerboard, text, grid, labels, characters, UI, landscape, black background or floor slabs. These are static effect references to be animated separately later.
```
