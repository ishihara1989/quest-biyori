# Dimensional rift assets

Generated 2026-10-12 with the built-in `image_gen` tool. Both selected assets were copied into this project. The gate keeps its original alpha. Runtime animation uses the same reference for every frame; no separate inconsistent frames are generated.

## gate.png

Use case: stylized-concept. Asset type: transparent PNG sprite for a pixel-art idle RPG, single closed dimensional gate. Draw a frontal slightly top-down game sprite of a mysterious tall oval gate, angular dark obsidian stone arch with jagged floating crystal fins, violet and cyan rune inlays, two solid closed dark-purple stone door leaves meeting at a central vertical seam, bright thin turquoise magical seam and violet aura. Clean visible 16-bit pixel art with hard pixel clusters, no anti-aliased painterly edges. Centered isolated sprite, approximately 70% of the square canvas, full arch and feet visible, ample transparent margin. Base centered at x50%, y87%, arch top y13%. No ground, no text, no characters, no open portal, no background, actual alpha transparency. Intended runtime animation will slide the two door leaves apart, animate an energy vortex behind them, and crack/shatter them; keep bilateral geometry clear and nearly symmetric.

Source: `exec-1a01c21f-97cd-45ce-a17d-14c408910a4a.png`. Native 1254×1254 RGBA; alpha includes both 0 and 255. Actual output bounds are accommodated by the runtime pivot rather than changing the generated reference.

## background.png

Use case: stylized-concept. Asset type: wide 16:9 battle background PNG for a 16-bit pixel-art idle RPG. An otherworldly dimensional rift, deep indigo and purple cosmic void, cyan nebula filaments spiraling in the upper sky, floating broken stone islands and distant shattered columns, tiny stars. Bottom 45% is one broad flat dark blue-violet floating obsidian arena with subtle geometric cracked paving, combat walking surface. Top 55% rich mysterious celestial depth, a distant thin luminous dimensional tear at upper center. No gate, no foreground characters, no enemies, no text, no UI. Crisp pixel clusters and deliberately limited palette, classic beautiful detailed pixel-art game background. Dark enough to keep colorful sprites and combat effects clearly legible, cyan/violet atmospheric rim lighting. Entire arena width unobstructed, no large foreground occlusions.

Source: `exec-c68e07ec-2689-42bc-b984-2ceb74d87592.png`. Native 1672×941 RGB; drawn to the existing 1024×576 arena with smoothing disabled.
