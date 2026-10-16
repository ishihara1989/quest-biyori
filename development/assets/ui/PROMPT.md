# Inventory atlas

Generated with the built-in image_gen tool. The original RGBA output is preserved in source/inventory-atlas-v1.png. tools/assets/build-forest-ui.cjs slices, trims and resizes the PNG without repainting.

Use case: stylized-concept
Asset type: a single game inventory icon atlas / sprite sheet for a colorful pixel-art idle action RPG.
Primary request: Create one transparent PNG sprite atlas, square 1024 x 1024, arranged as exactly 4 columns and 3 rows of twelve equally sized cells. Each icon centered within its own cell, with large transparent gutters, no cell borders, no captions, no UI.
Reading order left to right:
row 1: steel two-handed sword with brown leather hilt; brown leather chest armor; brown leather boots; emerald pendant with gold chain.
row 2: golden coin stack; luminous blue slime jelly droplet; curved ivory boar tusk; pink magical flower.
row 3: ancient oak wood fragment; small red healing potion bottle; luminous emerald green crystal; closed wooden treasure chest with gold fittings.
Style/medium: detailed 16-bit fantasy pixel art, crisp square pixels and dark outlines, warm polished highlights, strong recognizable silhouettes, matching a brown-haired leather-armored sword warrior and a rich green woodland setting.
Composition: orthographic inventory objects only, each object about 60 percent of its cell width and height, fully contained, never touches neighboring objects. Twelve separate icons, same scale and lighting. Alpha transparency around all objects.
Constraints: transparent background, no checkerboard painted into image, no words, no numbers, no watermark. This is one atlas meant to be sliced into twelve individual icons.
