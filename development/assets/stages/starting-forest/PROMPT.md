# 始まりの森 / バトルステージ v1

生成方法: 組み込み `image_gen`。既存の `warrior/idle-01.png` と `mage/idle-01.png` を目視確認し、輪郭・粒度・暖色の陰影をプロンプトで指定。参照画像は生成APIには渡していません。

## 遠景の全文プロンプト

```text
Use case: stylized-concept.
Asset type: production parallax DISTANT BACKGROUND layer for a side-scrolling belt-action beat-em-up RPG. Generate one wide landscape PNG, ideally 1536 by 864 (16:9). This is one background layer asset, not a mockup or a split-sheet.
Primary request: a welcoming beginner's forest, daylight, a quiet deciduous woodland in hand-crafted arcade/JRPG pixel art. Closely spaced distant and middle-distance tree trunks, leafy canopy, pale muted green woodland depth and small warm sunlight openings. This backdrop will sit behind a separate transparent ground-and-near-tree layer.
Style: crisp square pixel clusters, limited coherent palette, deliberate stepped silhouettes, clear clustered shadow tones, dark olive tree outlines, warm brown bark, moss and sage greens. Match detailed side-view fantasy character sprites about 128 logical pixels tall, with dark colored outlines, warm highlights and 3-5 clear shadow values. NOT tiny 16px tiles, NOT chunky minimalist pixel blocks; detailed readable 1990s arcade environment art. Square-pixel art, nearest-neighbor aesthetic, no smooth painterly edges, no photographic textures, no blur or antialiasing.
Composition: side-on forest backdrop with only a slight elevated belt-action camera angle; trees stand upright, the scene extends equally to both sides. Consistent forest depth and light along the full strip. Horizontally continuous understory; gentle layered trunks and foliage recede through desaturated atmospheric colors. Horizon/forest base around 50-60 percent down the frame. Lower portion may be unobtrusive dark woodland understory because an independent broad dirt arena will cover the lower half. No central destination or vanishing-point path, no spotlight centered on a clearing, no theatrical framing with huge trees on both outer edges.
Horizontal looping: design as an x-only repeating landscape strip. The left and right boundaries must join naturally with consistent leaf shapes, trunk sizes, brightness and foliage heights; avoid unique objects touching either boundary. Keep border vegetation continuous. No vignette or dark endcaps.
Lighting/mood: gentle daytime beginner area, readable and peaceful. Background has lower contrast and less saturation than the playable characters and nearby objects.
Constraints: background opaque throughout; no people, characters, monsters, buildings, portals, stairs, cliffs, water, UI, labels, text, signatures, borders or watermark. Do NOT add the near ground plane or foreground bushes; those are generated separately. Deliver only one complete distant forest background.
```

## 地面＋近景の全文プロンプト

```text
Use case: stylized-concept.
Asset type: production GROUND + NEAR SCENERY layer for a side-scrolling belt-action beat-em-up RPG. ONE wide 16:9 landscape RGBA PNG, ideally 1536 by 864, real alpha transparency. This is a reusable game layer asset, not a mockup, not a split-sheet.
Primary request: beginner forest dirt battle stage. A wide and DEEP uninterrupted light warm-brown packed-earth fighting plane across the entire lower 52% of the frame. The upper portion between near trees is truly transparent so a separate distant woodland background can be visible.
Style: detailed hand-crafted arcade/JRPG pixel art, square pixel clusters, sharp stepped silhouettes, thin dark colored outlines on tree roots and grass clumps, warm bark highlights, olive and moss greens, 3-5 distinct shadow tones. Match side-view fantasy sprites about 128 logical pixels tall with dark outlined brown leather armor and richly clustered highlights. Pixel grid aesthetic, deliberate medium fine pixel details, nearest-neighbor edges. No smooth painting, no blurred edges, no photorealism, no gradient shading, no smooth alpha halo.
Composition/camera: horizontal side-scrolling belt-action arena seen from a modest elevated SIDE view, enough visible ground surface to let characters move both left-right and toward-away from the camera. NOT a thin platform, NOT an overhead map, NOT a path receding into the distance. The rear edge of the soil plane is a nearly horizontal grass/root verge at 47% image height. Dirt fills every x from 49% all the way to the bottom image edge, opaque. Broad open playable rectangle from y=56% to y=92%. The soil should look flat and walkable with quiet sparse pixel pebbles and short scattered tufts, no clutter. At least 38% of total image height is unobstructed walkable dirt depth.
Near scenery: several fully legible slim-to-medium warm-brown deciduous tree trunks spaced irregularly along the BACK edge only, rooting at y=46-51%, canopy extends beyond the top. Green leaf clusters and shrubs around the rear verge. Between those trees the entire upper region has clear alpha transparency, no sky or forest backdrop. Near trees occupy less than 35% of upper area. Small grass clumps/low shrubs may occur sparsely along bottommost 5% only; keep the middle fighting area completely clear. No huge framing trees at the left/right edges. No trees growing in the open central dirt plane.
Horizontal looping is essential: build this image as an X-ONLY seamless repeating strip. Match the left and right edge profiles EXACTLY: rear ground edge at identical height, equal grass verge silhouette and soil palette at every y, continuous compatible pixel texture on both edges. Keep first and last 8% of width free of trunks, large roots, rocks, bushes, deep shadows and focal objects; they must show simple compatible dirt and short rear grass, with transparent space above. Illumination is consistent from left to right, no vignette/endcap, no camera perspective converging to a center. Never fade alpha at horizontal edges: ground is opaque all the way to both edges and bottom. This asset must tile by repeating it directly left-to-right.
Lighting/mood: gentle warm daylight in a welcoming first forest area, restrained highlights, trees and soil slightly higher contrast than distant forest, characters remain readable.
Transparency: upper spaces between trees must be genuine alpha=0, no painted checkerboard or colored matte; dirt and trees alpha=255. NO distant trees, NO sky, no horizon haze baked in. No characters, monsters, structures, cliffs, stairs, rivers, text, labels, UI, borders, watermark or shadows of absent characters. Deliver just this one transparent foreground+ground layer.
```

## 採用とループ

原画を色・アルファ・寸法とも変更せず採用。横端は完全一致しないため、表示時に通常→左右反転→通常の順で交互反復します。実際のリピート周期は原画幅の2倍。画像自体を同じ向きだけでタイルした場合は小さな境界差が残ります。

