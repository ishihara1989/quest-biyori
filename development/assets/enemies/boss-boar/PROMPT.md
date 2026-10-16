# ボスイノシシ — 生成プロンプト

移動の最新版は、1〜3／4〜6を別々に生成した [WALK-PROMPT.md](WALK-PROMPT.md) を参照。以下の6コマ一括生成は旧版として保持。

組み込み `image_gen`、全呼び出しで `transparent_background: true`。採用原画と書き出し条件は `layout.json`。姿勢・毛色はコードで描き直さず、切り出し・最近傍拡縮・位置合わせのみを行う。

## 待機 v1

参照: `../boar/source/boar-idle-generated-v1.png`

```text
Use case: stylized-concept.
Asset type: production transparent pixel-art sprite sheet for the Boss Boar enemy in a 2D idle RPG.
Reference image 1 is the existing normal boar IDLE sheet: match its left-facing slightly overhead side-view camera, readable four-legged anatomy, chunky crisp pixel clusters and dark outline. Create a NEW clearly boss-like wild boar: significantly bulkier powerful shoulders, massive long curved ivory tusks (the nearer tusk visibly larger), charcoal/dark umber fur, a tall jagged rusty copper mane from forehead down the upper back, amber-red angry eye, and a short pale diagonal old scar on the visible shoulder. Natural beast, no armor/clothes/accessories/crown.
Composition: exactly FOUR complete sprites in a precise 2 columns x 2 rows grid, reading order top-left, top-right, bottom-left, bottom-right. Same character identity, size, palette, viewpoint and planted foot baseline in all four. Wide transparent margins and empty transparent gutters between cells; tails and tusks fully inside each cell. No labels, borders, ground, shadow or text. Actual transparent alpha background.
Motion IDLE: frame1 neutral strong four-legged stance, near left foreleg slightly back and far right foreleg ahead, near rear leg back and far rear leg under belly. Frame2 very subtle inhale, shoulder/neck rise a little, ear flex; frame3 exhale, tail sway down; frame4 gently return toward frame1, tail lifted. Four distinct but subtle breathing poses designed to loop frame4 to frame1. Keep four hoof locations nearly stable. Make a complete professional sprite sheet, not a concept scene or painted illustration.
```

## 突進予告 v1

参照: `source/boss-boar-idle-generated-v1.png`

```text
Use case: stylized-concept. Production transparent PIXEL ART sprite sheet for a 2D RPG Boss Boar.
Reference image 1 is the canonical boss IDLE design. Preserve this exact boar: huge ivory tusks, charcoal umber fur, tall rust-copper spiky mane, glowing amber-red eye, pale diagonal shoulder scar, four hooved legs, same left-facing slightly overhead side-view camera, dark outlines and chunky pixel clusters.
Create exactly FOUR frames in a precise 2x2 grid, reading order. All sprites fully contained within their cells with wide transparent gutters, generous padding particularly around tail and tusks. True transparent alpha, no text, ground, shadow, attack-range shapes, motion arrows or decoration.
Motion CHARGE TELEGRAPH / intimidation pawing: NOT running. The boar stays on the same spot with head/shoulders lowered a little, bent forelegs, tusks pointing forward-left and angry gaze, threatening a charge. Front two hooves and far rear hoof stay planted in exactly the same positions. Only the near hind leg (anatomical LEFT hind leg, screen-right rear leg) scrapes the ground repeatedly. Keep torso, head and tusks almost fixed at a slightly crouched height, never bounce or lunge.
Frame1: lift the near hind hoof clear of the ground, bending that leg forward under the belly ready to paw.
Frame2: put that near hind hoof down forward under the hip, touching the ground to start a scrape.
Frame3: drag and kick that SAME near hind hoof backward toward screen-right with leg extended behind; a tiny few brown dirt pixels behind the scraping hoof, other three hooves planted.
Frame4: release the hind hoof from its backward position and curl the same leg forward halfway to frame1; dirt pixels fade. Natural frame4->frame1 seamless repeating pawing loop. The near hind hoof must occupy FOUR clearly distinct positions. Exactly four legs on every frame, far legs darker and occluded correctly. The boss keeps crouching and menacing throughout. Match reference identity and palette exactly.
```

## 突進予告 v2

参照: `source/boss-boar-charge-windup-generated-v1.png`

```text
Edit this transparent four-frame Boss Boar pawing animation sheet. Reference1 is the edit target. Preserve the same design, four frame order, colors, tusks, scar, and different near hind-leg poses. Make just these production fixes:
1. In ALL four frames, lower the head, shoulders and belly slightly by bending BOTH forelegs more. Head must point low toward screen-left, clearly a modest crouch ready to charge. Keep same torso length and mass, no shrink of anatomy, rear hip slightly higher than shoulder.
2. Give EVERY sprite generous padding: scale down each complete sprite uniformly to occupy no more than 78 percent of its cell width and 76 percent of cell height, centered within a strict 2x2 grid. Keep all tails, tusks, kicked rear hooves and tiny dirt pixels INSIDE their own cells. At least 60 pixels of pure transparent gutter on either side of the central vertical boundary. No overlap, no clipping.
3. Three support hooves stay planted at exactly the same ground line across four frames; only the NEAR hind hoof paws: frame1 bent and lifted forward, frame2 placed forward on the ground, frame3 extended BACK toward right scratching ground, frame4 lifted and bent returning. Reduce dirt to 3-5 small pixels right by the kicking hoof inside cell3 only. Frame4 should join naturally to frame1.
Keep exact charcoal umber fur, copper mane, amber-red eye, massive ivory tusks, shoulder scar, left-facing camera and crisp pixel-art style. True transparency. No labels, backdrop, shadows or range shapes.
```

## 移動 v1

参照: `source/boss-boar-idle-generated-v1.png`

```text
Use case: stylized-concept. Asset: transparent production PIXEL ART WALK cycle for this exact Boss Boar.
Reference1 is the canonical boss IDLE sheet. Preserve its design and camera EXACTLY: left-facing slightly overhead side view, massive ivory tusks, charcoal umber fur, rust-copper spiky mane, amber-red eye and pale diagonal shoulder scar, dark outline and chunky pixel clusters. No armor.
Create exactly SIX different walking frames, 3 columns by 2 rows, reading order 1-2-3 across top then 4-5-6 bottom. Wide landscape canvas. All fully contained and uniformly sized with generous transparent gutters. Each sprite occupies maximum 78% of cell width. No text, grid lines, ground or shadows. True transparent background.
Anatomical near legs are LEFT, far legs RIGHT (darker). Frame1 same neutral stance as idle: far right foreleg forward, near left foreleg back; near left rear leg back, far right rear leg under belly.
Frame2: lift near LEFT FORELEG and bend it forward; also lift near LEFT HIND LEG and pass it under belly while far legs support.
Frame3: near LEFT FORELEG extended ahead toward screen-left ready to plant; near LEFT HIND LEG under belly ready to plant, far legs trailing.
Frame4: near LEFT FORELEG now planted ahead, near LEFT HIND LEG planted beneath belly; far foreleg trails.
Frame5: lift FAR RIGHT FORELEG to pass forward and FAR RIGHT HIND LEG forward under belly; near legs support.
Frame6: far right foreleg extended forward toward left, far right hind leg moving forward, near hind leg pushes back toward right. Leads seamlessly to frame1.
Keep exactly four connected hooved legs, with proper near/far occlusion. Front AND rear feet must visibly change across the six poses. Stationary in-place walk cycle: torso position and size nearly constant, no translation. Consistent palette and identity across all six, no extra tusks or feet.
```

## 突進予告 v3

参照: `source/boss-boar-idle-generated-v1.png`

```text
Use case: stylized-concept. Production transparent PIXEL ART sprite sheet for a 2D RPG Boss Boar. Reference1 is the canonical boss design; preserve EXACTLY its left-facing slightly overhead side-view camera, huge ivory tusks, charcoal umber fur, rusty copper spiked mane, amber-red eye, pale diagonal shoulder scar, dark outline and chunky pixel clusters.
Layout: landscape 1536x1024 canvas, EXACTLY four complete sprites in 2 columns x 2 rows reading order. Each 768x512 cell must have at least 80px transparent padding at LEFT and RIGHT, and at least 60px top/bottom padding. Full body, tail, tusks and EVERY hoof inside its cell. Strict empty transparent gutter between sprites. Each boar approx 550px wide, same identity, size and palette across all frames. True transparent alpha background, no opaque background, no shadow, ground, labels, lines, arrows or text. CHARGE WINDUP animation: the boar crouches slightly, BOTH forelegs visibly bent, head and huge tusks aimed low toward screen-left, shoulders slightly lower than rump. Torso stays planted on the SAME spot with same head/body placement, no running. Three support feet are locked: two front hooves and FAR rear hoof never move. ONLY the NEAR rear leg (visible back leg at screen-right) paws the ground. Frame1 bend the near hind leg forward with hoof LIFTED under hip; frame2 plant that SAME hoof FORWARD under belly; frame3 extend that SAME leg BACK toward screen-right and scrape the ground; frame4 lift and curl that SAME leg halfway forward to prepare for frame1. Each near rear hoof has a distinct position. No dirt particles or VFX. Four frames form a seamless intimidating pawing loop, with body consistently low. Exactly four anatomically connected legs, far ones darker. Do not merely breathe or step front legs.
```

## 突進 v1

参照: `source/boss-boar-idle-generated-v1.png`

```text
Use case: stylized-concept. Production transparent PIXEL ART sprite sheet for a 2D RPG Boss Boar. Reference1 is the canonical boss design; preserve EXACTLY its left-facing slightly overhead side-view camera, huge ivory tusks, charcoal umber fur, rusty copper spiked mane, amber-red eye, pale diagonal shoulder scar, dark outline and chunky pixel clusters.
Layout: landscape 1536x1024 canvas, EXACTLY four complete sprites in 2 columns x 2 rows reading order. Each 768x512 cell must have at least 80px transparent padding at LEFT and RIGHT, and at least 60px top/bottom padding. Full body, tail, tusks and EVERY hoof inside its cell. Strict empty transparent gutter between sprites. Each boar approx 550px wide, same identity, size and palette across all frames. True transparent alpha background, no opaque background, no shadow, ground, labels, lines, arrows or text. CHARGE ATTACK animation, exactly 4 frames for a seamless bounding charge loop. Stationary in-place body, real translation will happen in game. Frame1: head lowered aggressively, BOTH FRONT LEGS lifted, both rear hooves on ground supporting to launch. Frame2: jump airborne, front legs extended FORWARD toward screen-left and rear legs extended BACK toward screen-right; all four hooves clearly off ground. Frame3: BOTH FRONT HOOVES LAND with forelegs extended down/front; both hind legs still raised trailing behind. Frame4: BOTH REAR HOOVES ALSO LAND, all four legs bent in a deep crouch preparing next bound. Frame4->frame1 natural repeat. Front pair move simultaneously and rear pair move simultaneously, not walking. Same body proportions and palette; exactly 4 legs, one large near tusk and a far tusk. No speed streaks, dust or impact VFX.
```

## 被弾 v1

参照: `source/boss-boar-idle-generated-v1.png`

```text
Use case: stylized-concept. Production transparent PIXEL ART sprite sheet for a 2D RPG Boss Boar. Reference1 is the canonical boss design; preserve EXACTLY its left-facing slightly overhead side-view camera, huge ivory tusks, charcoal umber fur, rusty copper spiked mane, amber-red eye, pale diagonal shoulder scar, dark outline and chunky pixel clusters.
Layout: landscape 1536x1024 canvas, EXACTLY four complete sprites in 2 columns x 2 rows reading order. Each 768x512 cell must have at least 80px transparent padding at LEFT and RIGHT, and at least 60px top/bottom padding. Full body, tail, tusks and EVERY hoof inside its cell. Strict empty transparent gutter between sprites. Each boar approx 550px wide, same identity, size and palette across all frames. True transparent alpha background, no opaque background, no shadow, ground, labels, lines, arrows or text. HIT / DAMAGE reaction animation in 4 frames. Frame1 brace and flinch, head dips slightly, eyes squeeze with pain, front knees flex. Frame2 strong recoil, head and neck tilt UP and back toward screen-right, ears pinned; legs brace against hit, body rocks back, shoulder scar still present. Frame3 head and body lower and recover toward regular four-legged stance. Frame4 SAME neutral standing pose as reference frame1, recovered. No blood, damage marks, weapons, flash, stars or VFX. Four visibly different poses, same boar proportions.
```

## 撃破 v1

参照: `source/boss-boar-idle-generated-v1.png`

```text
Use case: stylized-concept. Production transparent PIXEL ART sprite sheet for a 2D RPG Boss Boar. Reference1 is the canonical boss design; preserve EXACTLY its left-facing slightly overhead side-view camera, huge ivory tusks, charcoal umber fur, rusty copper spiked mane, amber-red eye, pale diagonal shoulder scar, dark outline and chunky pixel clusters.
Layout: landscape 1536x1024 canvas, EXACTLY four complete sprites in 2 columns x 2 rows reading order. Each 768x512 cell must have at least 80px transparent padding at LEFT and RIGHT, and at least 60px top/bottom padding. Full body, tail, tusks and EVERY hoof inside its cell. Strict empty transparent gutter between sprites. Each boar approx 550px wide, same identity, size and palette across all frames. True transparent alpha background, no opaque background, no shadow, ground, labels, lines, arrows or text. DEFEAT / DOWN animation in 4 consecutive poses. Frame1 head droops and front knees buckle. Frame2 forelegs fold, chest and snout lowered onto ground, hindquarters still elevated. Frame3 heavy body collapses and rolls toward viewer onto its near left side, eyes close, legs folding sideways; mane and tusks remain readable. Frame4 fully lying motionless on its SIDE, belly sideways, legs folded sideways/resting, eye shut, head/tusks on ground. Flattened silhouette significantly shorter in height than frame1; NOT standing, NOT just sleeping upright or a crouch. Last frame is a permanent defeat pose. Same exact beast, no blood, smoke, fading or VFX. Ground is fully transparent.
```

## 突進予告 v4（採用）

参照: `source/boss-boar-charge-windup-generated-v3.png`

```text
Use case: precise-object-edit. Edit reference1 (Boss Boar charge telegraph sprite sheet) with TWO corrections only. Preserve EXACTLY boar design/palette/camera, crouch, front paws, head, torso, tusks, mane, scar and ALL four frame order/poses apart from correction A:
A) In FRAME1 (top-left) the wrong hind leg is raised. Swap the TWO hind-leg poses: the darker FAR hind leg must be PLANTED and stay under belly like frame2, while the lighter NEAR hind leg must be bent forward with its hoof lifted off the ground. Therefore the same NEAR hind leg moves in every frame: frame1 raised-forward, frame2 planted-forward, frame3 extended-back scraping, frame4 raised-returning. Frame2, frame3, frame4 anatomy remain unchanged. Three support hooves (both front, far rear) planted.
B) Re-layout the four COMPLETE sprites on a LANDSCAPE 1536x1024 transparent canvas in strict 2x2 cells. Fit the full artwork without clipping; scale all sprites together uniformly only if necessary. Center EACH sprite in its cell, leave at least 65 pixels of empty transparent padding on each horizontal cell boundary and at least 25 pixels vertical. No tail/hoof crossing a cell boundary; no glow or halo. This is a production export correction.
Keep same exact slightly crouched pose and body length; don't raise torso or head. All feet anatomy consistent, exactly four legs. Transparent alpha background; no text, shadow, dirt, range VFX or grid.
```

