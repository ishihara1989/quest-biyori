# トレント・移動

組み込み image_gen で生成。既存の待機1コマ目をデザイン・画風参照に使用。
原画は ../../source/treant-move-generated-v1.png。ゲーム素材は共通ビルダーで最近傍切り出し。

+Use case: stylized-concept.
Asset type: production transparent 4-frame pixel-art MOVE LOOP for the existing left-facing treant forest boss.
Input image is the strict CHARACTER DESIGN, STYLE, PROPORTION and COLOR reference, not a layout reference. Preserve the same broad gnarled brown oak trunk, left-facing amber-eyed scowling face, woody beard, forked branch horns, asymmetrical olive leafy canopy leaning toward the right, mossy chest and shoulders, long forked branch hands resting at the sides. Match the reference closely; do not redesign.

Primary request: exactly FOUR chronological frames of SUBTLE ROOT WRIGGLING / creeping locomotion, forming a seamless loop 1→2→3→4→1. The tree has thick short ROOT FEET, which creep by flexing their branching tips against the ground. Movement is concentrated in the bottom quarter of the character. Keep the upper trunk, face, arms and leafy canopy nearly stationary and consistent in every frame. No human walking strides, no marching, no hopping, no lifting the entire body. Root tips change visibly while the trunk stays upright. Actual horizontal world movement is applied by the game: sprite remains centered in place.
Root animation:
Frame 1: left/front root toes spread low forward toward LEFT and press into ground, right/rear root tips drawn inward slightly.
Frame 2: left/front ROOT TIPS curl gently upward and inward by about 8-12 source pixels (4-6 final game pixels), while the right/rear roots uncurl and spread outward to grip ground. There are always other rooted tips touching the baseline.
Frame 3: left/front roots extend low to LEFT and grip again; right/rear tips are visibly curled inward/upward. Reverse the front/rear flex from frame1 without replacing root anatomy.
Frame 4: right/rear roots uncurl and settle; front roots half-uncoil toward frame1. This is a transition into frame1, not an identical duplicate of it.
Every frame has distinct root shapes, mild organic sinuous writhing and tiny weight transfer, with unchanged upright upper trunk. Branch arms remain relaxed at sides, no attacking, no hand insertion into soil. Do not add loose floating roots.

Composition: ideally 1536x1024 canvas, EXACT 2 columns x 2 rows of equal invisible cells. Reading order top-left, top-right, bottom-left, bottom-right. Same camera, same pixel scale in all4. Root contact baseline about y480 in each 768x512 source cell. Standing sprite approximately 450-465 source pixels high, centered, generous transparent margin; every twig, leaf and root fully inside its own cell. Keep trunk center and ground plane stable across all4. No ground painted.
Style: match the existing detailed retro RPG pixel art with crisp square pixel clusters, stepped hard outlines and brown/ochre bark shading, olive/moss green leaves, tiny amber eyes. No vector smoothing, no painterly gradients, no blur.
Background: REAL alpha transparency. Opaque hard-edge actual sprite pixels with transparent holes between branches/roots. No colored mist, glow, halo, background wash, floor, shadow, checkerboard, frame dividers, text, labels, lettering or watermarks. Exactly four treant poses.
