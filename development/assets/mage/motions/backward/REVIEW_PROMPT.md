# 2026-10-06 足 ID 固定による再制作

## 相4/5/6/7 個別半周期の4姿勢生成全文

```text
Use case: identity-preserve.
Asset type: FOUR individual replacement guarded-mage backpedal poses in EXACT 2 COLUMNS x 2 ROWS sprite sheet. These are cycle phases4,5,6,7 ONLY, in reading order, not a whole cycle.
Image1 approved guarded mage single identity/style reference: preserve exact blue eyes/bluehair/navy-gold floppy hat, face, body proportions, navy goldembroidered robe with cream inner dress and purple ruffles, belt/pouch/blue gems, gold-blue navy boots, single ornate brown/gold blue-crystal staff. EXACT same protective chest-level free PALM at screen left, staff in SAME forward screen-right hand, gaze right. This guarded pose stays all4. Image2 is ONLY desired leg pose/occlusion guide, corresponding top-left4 top-right5 bottom-left6 bottom-right7. Copy leg position and low foot pass, NEVER colors/text/background.
CRITICAL FIXED LEG ID: anatomical LEFT L ALWAYS CAMERA NEAR/foreground, slightly brighter navy boot with distinct bright blue diamond and gold straps. Anatomical RIGHT R ALWAYS CAMERA FAR/background, darker navy boot. L at screen LEFT in phases4/5/6, passing near center7. R at screen RIGHT in4/5/6, center7. Near/far never swaps when screen x changes. L calf always occludes R at crossing. BOTH BOOT TOES POINT screen RIGHT in ALL4, even L at rear. Short cautious steps, low relaxed knees, no kicking.
Exact new poses, all torso/hip/root x same:
TOP-LEFT phase4: Near L knee visibly emerges at LEFT robe opening and goes DOWN-LEFT toward LEFT/back ankle, heel rising, toe low. Far R knee goes down-right under cream skirt, DARK far boot reaches RIGHT/front low ready5. Brighter blue jewel LEFT boot, darker RIGHT boot.
TOP-RIGHT phase5: Near L at LEFT/back with toe contacting and heel slightly raised, bright left gem prominent. Far DARK R at RIGHT/front with sole FLAT planted. Exposed near thigh/knee LEFT, far right knee partly behind cream skirt. Opposite of original image1's stance, not a duplicate of idle. Slightly wider stance than4.
BOTTOM-LEFT phase6: Far DARK R planted supporting at RIGHT-of-center and beginning return tocenter. Near BRIGHT L foot lifts LOW from LEFT/back and draws towardcenter, heel at most half bootheight high; near ankle remains LEFT of far ankle about one bootlength, gap smaller than5. Near knee still LEFT/near. No high heel kick.
BOTTOM-RIGHT phase7: FAR DARK R supports directly UNDER HIP. NEAR BRIGHT L passes LOW IN FRONT of R, ankles nearly same x within quarter bootlength, near foot only slightly aboveground. Bright near calf/boot occludes far dark boot, far dark toe partly visible behind/under. Natural low walking pass matching guide, no crossed twisted knees.
Keep the same guarded upper body/chest palm/staff at every cell. Camera exact original right-facing3/4. Robe hem can open subtly at left to show fixed near knee and make new foot poses anatomically attached. Same boots/hat/crystal/face/body size every frame. Restricted cautious stride, smaller than forward walk.
Exactly4 full separate complete characters in equal2×2 cells, same uniform scale, fixed waist x and baseline, broad TRANSPARENT padding around EACH, at least12% margin all sides. Full dangling hat ornament, hair, entire crystal fork/head/staff tip, knees and shoes inside own cell. Exact JRPG pixel art, crisp squareclusters and edges as image1, no smooth illustration. True RGBA alpha0 outside subject. No scenery, ground, shadow, checkerboard, text, numbers, guides, extra limbs/effects.
```

v6 は生成成功し警戒姿勢を維持するが、1/5 がともに近脚前を反復していたため不採用。v7 の全体下半身修正は接続エラーで画像を返さなかった。個別 4/5/6 を編集する。

## v7 全体修正全文（接続エラー、未生成）

```text
Use case: precise-object-edit. Image1 editable 8-frame guarded mage backpedal sheet,4 columns2 rows. Image2 exact LEG POSITION guide. Keep Image1 faces/hats/hair/upper bodies, protective palm at chest and staff in same hand, body size, costume/pixel style and transparent layout EXACT. Change only legs/boots/lower hem. Guide colors and text never appear in output.
ERROR: all eight presently show same NEAR BLUE-DIAMOND boot at screen right. This must alternate SCREEN X while keeping anatomical near/far depth fixed. Frame1 left-anatomical NEAR L is BRIGHT boot at screen RIGHT. Frame5 SAME NEAR L must be at screen LEFT, with bright blue diamond visible at LEFT. Far R darker boot goes from left1 to right5. Near L always foreground.
1 keep near L bright RIGHT/front planted, far R dark LEFT/rear.
2 near L toward center supports, far R comes LOW from left.
3 near L supportscenter; far R LOW passes BEHIND it, ankles almost same x and partly obscured.
4 NOW near L BRIGHT LEFT/back heel risen, far R DARK RIGHT/front low-reaching. Expose near knee at LEFT hem. Under cream skirt at RIGHT is far darker knee.
5 CRITICAL OPPOSITE STANCE: BRIGHT L boot at LEFT/rear with blue diamond/goldcross clearly facing camera and near bare knee exposed LEFT, toe down heel raised. DARK FAR R boot at RIGHT/front flat planted, knee under/behind cream skirt and dimmer ornament. The left boot must be bright, the right boot dark. Do not reproduce1. In each ~407px-wide cell, L ankle near x155, R near x270, waist x235. Near hip and knee slope down-left, far hip/knee slope down-right.
6 BRIGHT NEAR L still on LEFT but drawing LOW towardcenter, its ankle near x195 and only slightly lifted. FAR DARK R supports RIGHT-of-center near x248 and moves backtowardcenter. LEFT bright blue gem, right dark boot, no swapping.
7 NEAR BRIGHT L now passes LOW IN FRONT of FAR DARK R with ankles near same x235, near L just aboveground and dark R planted under it. No high knee kick.
8 NEAR L BRIGHT extends RIGHT/front near1, FAR R DARK left/rearheel. Seamless8→1.
All eight exact same right-facing camera and body scale. All toe tips RIGHT even rearleg. Lower skirt opening follows anatomy and helps fixed nearleg read. Same two right-facing boots and ornaments always attached to same leg. Nearcalf always occludes far at intersection. No background, text, borders, shadows, guide shapes or effects. RGBA4x2 with margins, same guarded stance.
```

組み込み image_gen を使用。待機は同一性、共通 guide は姿勢のみの参照。旧原画を保持する。

## v6 新規生成全文

```text
Use case: identity-preserve.
Asset type: replacement production pixel-art cautious BACKWARD WALK sprite sheet. Exactly EIGHT sequential poses, FOUR equal columns by TWO rows, top1-4 bottom5-8. Truly transparent RGBA.
Input1 approved mage single idle identity and pixel style. Input2 high-resolution approved idle costume details. Input3 ONLY eight-phase LEG POSE/OCCLUSION guide: adopt its corresponding low leg shapes but no colors, labels or background.
Same small blue-eyed female mage, long blue hair, navy-purple floppy gold-trim wizard hat with blue gem and dangling gold ornament, ornate gold embroidered navy robe, cream inner dress, purple ruffle, brown belt/pouch and blue jewels, navy blue gold-strapped ankle boots, one ornate brown/gold staff with faceted blue crystal. Fixed right-facing three-quarter view, same head/face/body scale/costume. Crisp pixel art as idle, deliberate square pixel clusters.
Guarded retreat: looks carefully to screen RIGHT all8 while taking small backsteps toward LEFT. Free hand raised at chest, palm outward protecting herself. Staff held in same screen-right forward hand, at chest level, slightly forward as protection. Small bent-knee protective stance, modest short stride, restrained hair/robe motion. No shield, new gear or magic effects. Staff/hand sides never switch.
FIXED FOOT ID: LEFT anatomical L = ALWAYS camera-near leg, brighter navy boot with bright blue diamond and gold cross strap. RIGHT anatomical R = ALWAYS camera-far leg, darker navy boot in same design. L ALWAYS overlaps in front of R at passing poses, irrespective of left/right screen x. Both boot toes ALWAYS point RIGHT. Do not mirror either boot.
Exact phase and foot positions matching guide, with shorter cautious step:
1 L near brighter boot RIGHT/front planted; R far darker boot LEFT/rear toe down heel raised. Front does not mean near: near/far identity is fixed.
2 L planted foot slides toward center, R low lifted foot comes from left/back to center.
3 L near supports directly under hip, R far passes LOW behind L at almost SAME ankle X, partly occluded by L. Ankles within a quarter-boot length, no high knee kick.
4 L near reaches LEFT/back heel lifted; R far extends RIGHT/front ready to land, low.
5 OPPOSITE leg stance: L near BRIGHT boot LEFT/back, R far DARK boot RIGHT/front planted. No duplicate1.
6 R far supports and returns toward center, L near lifts LOW and comes from left/back to center.
7 R far supports under hip, L near crosses LOW IN FRONT of R at almost SAME ankle X, brighter L boot occludes darker R boot.
8 L near BRIGHT extends RIGHT/front near1 position but poised pre-contact; R far DARK reaches LEFT/back heel rising. Smooth8→1 same foot sides and no jumps.
Hem opens subtly to make lower legs and depth legible while preserving robe length/design. Anatomically connected ankles, identical right-pointing shoe shape all8. Same waist root x, equal figure scale, gentle tiny bob, boots baseline. All eight poses distinct.
Exactly eight complete separate full figures with broad transparent gutters in equal4×2 cells. Full hat tip, staff head/tip, hair, hem and boots inside own cell. No floor, shadow, effects, particles, text, labels, numbers, borders, guide lines, baked checkerboard, solid backdrop or duplicate limbs.
```
