# 女神モーション v4 全文プロンプト

内蔵 image_gen、透過PNG。

## floating / source/floating-r2.png

```text
Use case: precise-object-edit
Asset type: FOUR FRAME transparent pixel-art idle animation sheet for this existing goddess.
Input 1: existing shipped body sprite, fixed identity/style/pose reference.
Input 2: original goddess for identity/palette ONLY, ignore large golden rings.
Primary requirement: EXACTLY FOUR separate complete figures, on a strict TWO BY TWO grid of equal SQUARE cells. WIDE EMPTY TRANSPARENT GUTTERS. Each figure takes at most 65% of its cell width and 72% of its cell height. No visible pixels within the outer 15% on any cell edge. If cell is 512x512, keep EVERYTHING inside x=90..422 and y=72..440. Absolutely no hair, cloth or shoes crosses a cell boundary. Do not let the bottom-left figure's hair enter the bottom-right cell. No panels, grid lines or labels. True transparent background.
Same adult fantasy goddess and outfit in all four frames: silver lavender wavy hair, small gold crown, cyan eyes, ivory/navy/gold ceremonial dress, cyan jewels, gold shoes, dark violet pixel contour. Match the first input's figure and camera, not the large canvas margins. Body upright floating, relaxed open palms at hip height, legs naturally downward. Exactly two arms and two legs. No large halo, throne, magic FX, glow or shadow.
Four subtly different continuous IDLE poses, chronological row major; SAME character height and width in all four cells. Head center (256,135), hips (256,280), lower shoe (256,425).
F1 neutral, eyes open; hand centers (180,245),(332,256). Hair silhouette neatly within x=100..412.
F2 gentle inhale, head rises 2 pixels, chest/shoulders rise 1 pixel, hands rise 2 pixels; hair ends and sleeve hems trail 2 pixels down.
F3 gentle exhale, eyes half closed, hair tips shift only 2 pixels right; hands return to F1. Hair remains comfortably INSIDE the cell.
F4 head settles 2 pixels lower, eyes open, sleeve hems/hair begin returning smoothly to F1. Smooth loop F4->F1, no new pose or rotation.
Keep changes very small. No growing hair silhouette, size changes, missing limbs, extra limbs, random ornaments, background, text or watermark. Each figure fully contained with WIDE empty padding.
```

## turn / source/turn.png

```text
Use case: precise-object-edit
Asset type: transparent JRPG pixel-art body TURN animation for the existing goddess returning home.
Input 1 is the existing farewell sheet: use its THIRD cell (raised hand waving) as exact identity, costume, camera and pixel-style reference. Input 2 is the original master identity/palette reference only; omit the huge rings.
Create exactly THREE sequential TURN poses in a strict horizontal row of three equal square cells. All cells use the same virtual 512x512 camera, figure size and anchor. Prefer a 1536x512 sheet, or equivalent three square cells. Keep ALL visible pixels in EACH cell inside x=96..416,y=72..448. Never cross any cell edge. True transparent background and ample empty margins.
Character invariants: SAME adult goddess, silver lavender flowing hair, small gold crown, ivory/navy/gold ceremonial dress, cyan gems, gold shoes. Upright hovering with legs naturally downward. Same face, outfit construction, colors and discrete crisp pixel clusters. Exactly TWO arms and TWO legs, anatomically connected. No throne, large ring, shadows, portal, particle, light trail, duplicate body or text.
Choreography: she has JUST finished waving her screen-right hand near her shoulder toward the party on screen-left. She now lowers that hand and turns AWAY gracefully through 180 degrees around her vertical body axis. This is a real turn with new SIDE AND BACK views, never a flat mirrored or screen-rotated front view.
In every virtual cell crown at y=82, head at y=130, torso/pelvis center at (256,260), shoes near (256,428).
F1 (60 degrees from starting front-left three-quarter view): LEFT side profile, face looking left and slightly away; the raised farewell hand is lowering to chest height. Hair trails to the right. Body stays vertical, camera unchanged.
F2 (120 degrees from start): BACK-LEFT three-quarter view. Back of crown, head and shoulders visible; her face is now hidden. BOTH hands lowered and relaxed beside hips. Long lavender hair drapes down the BACK of the body; dress back and long skirt cover the torso and legs. Hair and sleeves trail the turning motion to the right. Do not draw a front-facing face or chest on the back.
F3 (180 degrees from start): BACK-RIGHT three-quarter view, looking away toward a doorway behind her. Face completely hidden, crown and back hair visible. Hands fully lowered. Body is upright, rear dress navy panels with gold trim visible beneath long hair. Hair and sleeves settle; feet point away. This pose is held while she glides away.
Full opaque body and clothing in every frame, no fading baked into sprite. Preserve consistent body/head dimensions and footwear height across frames. No redesign, no extra limbs, no seam lines, no labels.
```

## floating / source/floating.png

```text
Use case: precise-object-edit
Asset type: transparent JRPG pixel-art animation sheet, goddess floating idle, FOUR frames.
Input 1 is the EXACT currently shipped 512x512 idle sprite and the identity / palette / size / framing reference. Input 2 is the original master reference for identity only; omit its large rings.
Make a new FOUR DISTINCT FRAME looping idle sheet in a strict 2 columns x 2 rows grid, row-major. Each square cell is a virtual 512x512 canvas. In EACH cell the body uses the SAME dimensions and position as input 1: head center approximately (256,238), hips (258,324), shoes around (262,430). Visible body fits x=130..382,y=195..448. Keep generous fully transparent margins. No captions, labels, borders, grid lines or background. True transparent alpha.
Preserve the SAME adult goddess, silver lavender wavy hair, cyan eyes, small gold crown, ivory/navy/gold ceremonial clothing with cyan jewels, gold shoes, dark violet outlines and crisp discrete pixel clusters. Exactly two connected arms and two legs. Upright hovering torso, legs pointing down, palms relaxed and open at hip height. Match the existing outfit and silhouette, no large halo, throne, shadows, magic FX or extra ornaments.
Movement plan (coordinates are local cell coordinates, NOT text):
F1 neutral: head (256,238), left hand (192,304), right hand (329,317), hair tips rest.
F2 inhale and float upward 2px: head (256,236), left hand (192,301), right hand (329,314); chest rises subtly, hair and sleeve tips trail 2px downward relative to body.
F3 relaxed exhale, head (256,238); left hand (194,304), right hand (327,317); hair tips sway 3px right, sleeves follow. Eyes gently half-close, calm face.
F4 lower hover by 2px: head (256,240), left hand (192,306), right hand (329,319); hair tips begin returning to F1, eyes open. F4 -> F1 is a smooth 2px return. The body must NEVER rotate or change size.
Keep variations subtle but visibly different, continuous cyclic hair and cloth motion. Do not duplicate the exact same sprite four times. No new character redesign. Full opaque body, same camera and scale in every cell.
```
