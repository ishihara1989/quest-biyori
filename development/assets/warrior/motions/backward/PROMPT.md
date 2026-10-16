# 2026-10-06 再見直し: v6

採用 source/warrior-backward-generated-v6.png。1/2/7/8 の4姿勢生成と茶革への限定編集、3/6 の支持脚・通過の限定編集、確認済み4/5の生成画素を切り出し・最近傍で合成。L=手前、R=奥を保持し、1=L前、5=R前、3/7低い通過、6=R支持を修正。全プロンプト全文は REVIEW_PROMPT.md、全8脚ID表は QA.md、脚拡大は warrior-backward-leg-qa.png。組み込み image_gen 使用、透明 alpha を保持し旧候補を保存。

# Warrior backward

## 旧 v3: 8 枚の警戒・防御後退ループ（2026-10-06）

- 方法: 組み込み image_gen、transparent_background: true。
- 採用原画: `source/warrior-backward-generated-v3.png`、4 列 × 2 行。旧 v1/v2 原画は保持。
- 参照: `../../../../../public/assets/warrior/idle-01.png`（同一性）、`source/warrior-backward-generated-v2.png`（装備詳細）。
- 出力: 256 × 224 の独立した 8 枚、横 2048 × 224 のシート、90 ms × 8 = 720 ms の無限ループ GIF。
- 手動で腰の中心 x を anchor に指定。全コマ共通 scale 0.34236453201970446、pivot (128, 207)。姿勢は画像生成による新規 8 枚。プログラムによる補間・複製・形状再描画なし。

### 8 枚の生成プロンプト全文

```text
Use case: stylized-concept.
Asset: eight-frame backward walking defensive loop for 2D RPG pixel-art character.
Image 1 is approved idle identity reference. Image 2 shows detailed character design; replace its 4-frame backward sheet with exactly EIGHT connected newly drawn retreat poses, not enlarged or duplicated images.
Output one landscape transparent PNG, aspect 2:1, exactly 4 columns by 2 rows, full body in every cell with generous transparent margins/gaps. Frames numbered mentally row-major 1–4 then 5–8, NO printed numbers or text or grid or floor or shadow.
Same brown-haired female chibi warrior with long high ponytail, brown leather armor and tall brown boots, black shorts, brown tabard and silver ornament, exact dark-centered broad silver sword and ornate guard. Maintain identical face, eye placement, buckles, knees, boot shapes, anatomy, scale and near/far leg identity. Entire character faces RIGHT in every cell, vigilant eyes looking RIGHT towards the threat while RETREATING LEFT.
Defensive upper-body pose in all frames: knees softly bent, chin tucked and shoulders slightly hunched in caution, arms closer to chest, both hands hold sword FIRMLY in front of her chest; sword angled steeply up-right (about 65 degrees), guarding face/body from a threat on the RIGHT. It must visibly differ from forward walking's relaxed lower sword angle. No sword swing. Same grip order throughout. Slight backward weight lean but head/eyes remain rightward. Ponytail follows softly, not large shape changes.
Animate a small, cautious grounded BACKWARD WALK, feet moving behind to the LEFT but toes always pointing RIGHT. Both boot toe tips always RIGHT, including lifted and backward-reaching boots; never mirror a foot. Exactly two intact legs. No running, no giant lunging or high knee. Pelvis x fixed and common ground baseline, only tiny 2–3 pixel vertical bob at target game size. Place near/far feet gradually in eight evenly spaced phases:
1 near foot makes toe-first contact BEHIND the pelvis on screen LEFT; far foot ahead RIGHT bears last part of weight.
2 slight knee compression; near foot settles behind/left; far heel lifts ahead/right.
3 near foot bears weight under pelvis; FAR foot lifts slightly (not high knee), passes beside it and moves BACKWARD toward LEFT.
4 near support foot moves towards ahead/right as body retreats; far foot reaches left behind, hovering just above ground.
5 FAR foot toe-first contacts behind/left; NEAR foot is ahead/right (opposite-leg contact, correct thigh occlusion).
6 slight knee compression; far foot settles behind; near heel lifts ahead/right.
7 far foot supports under pelvis; NEAR foot lifts slightly, passes beside it and moves BACKWARD toward LEFT.
8 far support foot ahead/right; near foot reaches left behind just above ground ready for frame 1.
Feet travel RIGHT-to-LEFT on lifted swing when retreating, and LEFT-to-RIGHT during grounded support relative to fixed pelvis. Distinguish all eight poses with true gradual alternating-leg motion. Frame 8→1 seamless. Keep stable chest/sword silhouette, consistent restrained defensive stance and same art style as idle, crisp pixel art with true alpha, no text or blur or scale/face drift.
```

### QA

- 原画と切り出し後の全 8 コマを目視。右を見続け、肩と肘を閉じ、両手の剣を前進より立てて胸前に置く防御姿勢。後ろへ向き直らない。
- 後方接地・荷重・足の引き寄せ・後方へ足を送る動作を 2 組描画。歩幅と膝上げを前進より小さくし、右の敵を警戒する後退にした。近脚/遠脚の識別は左右対称装備のため控えめ。
- 支持脚と浮いた脚の靴先は全コマ右。左右の脚を水平反転せず、ブーツとバックル、剣の両手の握り順を維持。8 の後ろへ送った足から 1 の後方接地へ繋がる。
- 全身・髪・剣先に欠けなし。distinct pose、透過、原画/出力余白、共通接地の自動検査成功。GIF 8 ページと所定の delay を検証。
- 頭・胴・剣の小さな輪郭差は生成原画由来として残る。腰基準の anchor で足幅による横ぶれを抑制。

## 旧 4 枚版の記録

- 方法: 組み込み image_gen、transparent_background: true。画像生成以外で姿勢を描き直していません。
- 参照1: `../../../../../public/assets/warrior/idle-01.png` — 承認済み待機の顔・頭身・色・装備・画風。
- 参照2: `../../source/warrior-idle-generated-v1.png` — 待機の詳細ピクセル表現。
- 参照3: `../../../references/warrior-original.png` — 元デザインの確認、画風は参照しない。
- 原画: `source/warrior-backward-generated-v1.png`。
- 採用原画: `source/warrior-backward-generated-v2.png`。初稿 v1 も保持。
- 検証所見: 原画全身・剣先に欠けなし。共通処理で透過、原画/出力余白、別ポーズ、共通接地位置を検査して成功。右向きのまま足を踏み替え、待機と同じ装備を維持。修正生成で通過姿勢の足運びを改善。接地姿勢の左右脚の入れ替えは控えめで、原画間に細かな輪郭の変化あり。

## 全文プロンプト

```text
Use case: identity-preserve
Asset type: pixel-art sprite-sheet for a browser belt-scroll IdleRPG, warrior character.
Input images: image 1 is the approved 160px idle sprite and the PRIMARY identity, palette, proportions, rendering and equipment reference; image 2 is its high-resolution approved idle sprite sheet and SECONDARY pixel-detail reference; image 3 is the original design illustration, design details only, NOT its painting style.
Preserve the same young adult female warrior with large brown ponytail and black hair tie, brown leather chest armor, black collar and shorts, leather gloves, buckle belt, long brown front cloth with silver ornament, brown armored boots and same large silver-gray double-edged sword with ornate star-shaped guard. Keep identical face, eyes, hairstyle, age, outfit, weapon, colors and head/body ratio.
Style: polished detailed pixel art matching the APPROVED IDLE, crisp small pixel clusters and hard edges; shallow right-facing side / three-quarter game view. All frames face RIGHT. Hold sword in both hands diagonally upward toward the right in the same natural ready guard as idle, no attacks.
Backdrop: true transparent alpha background. No background, ground shadow, particles, effects, text, grid lines, labels, borders or other characters.
Composition: square 2 columns by 2 rows sprite sheet with four perfectly equal cells, reading order top left, top right, bottom left, bottom right. Each whole body, ponytail and full sword must fit entirely inside its own cell with at least 15% transparent margin on all four sides. Identical character scale in every cell. Same imaginary ground baseline and body center within each cell, not travelling across the cell. All appendages and weapon fully visible. The frames must form a physically coherent seamless loop; no independently rescaled frames.
Primary request: Draw FOUR DISTINCT keyframes of BACKWARD WALK, maintaining the face and chest facing RIGHT while feet take guarded steps toward LEFT. This is BACKPEDAL, never turn around and never mirror the forward walk. Frame 1 the leading backward foot extends to the LEFT, torso slightly leaning back/right over its planted forward foot; frame 2 weight shifts onto the left/back foot and the other knee bends and draws inward under hips, heel lifting; frame 3 the other foot steps farther toward LEFT while first foot comes toward center, visibly opposite leg foot positions; frame 4 the other passing pose, close stance before another backward step. Carefully show alternating footwork and clear leg/knee differences. The backward-leading heel extends left, toes still generally face right. Keep body center fixed in each cell, same ground baseline, no cell-to-cell travel. Natural small bob, ponytail and cloth drag subtly toward right. Same diagonal-upward-right two-handed sword guard as idle. Start/end can transition naturally to the approved idle. No attack, no jumping.
```

## v2 修正生成

参照1はこのモーションのv1原画を編集対象、参照2は承認済み待機を顔・画風の確認に使用。組み込み image_gen、transparent_background: true。

```text
Use case: identity-preserve
Asset type: pixel-art BACKWARD-walk sprite sheet, surgical animation correction.
Input image 1: existing backward-walk 2x2 sprite sheet is the EDIT TARGET; preserve its canvas layout, warrior identity, all four heads and upper bodies, ponytail, outfit, sword and equipment exactly. Input image 2: approved idle is supporting identity/style reference.
Primary request: Correct ONLY LEGS and BOOTS to show a full two-step BACKPEDAL cycle, facing RIGHT but walking backward toward LEFT. Current frame 1 and frame 3 have near-identical stride. Make the leg placement and boot overlap genuinely switch at frame 3. All faces, chest and weapons still face RIGHT. Never mirror the whole character.
Top-left frame 1: near visible leg extends backward toward LEFT, heel makes contact left of hips; far leg planted toward RIGHT. Preserve this pose.
Top-right frame 2: transfer weight backward onto NEAR leg under hip, FAR leg boot lifts and draws backward through hip center, its knee bent moderately.
Bottom-left frame 3: reverse the two legs from frame 1. NEAR leg now extends toward RIGHT of hips, knee and boot forward at the RIGHT, planted temporarily; FAR leg steps backward toward LEFT of hips, boot distinctly to LEFT. Armor straps and front knee must clearly follow the visible near leg to RIGHT in this frame. This is opposite leg contact during backpedal, no turning around.
Bottom-right frame 4: weight on FAR leg under hip, NEAR leg bends and draws backward through center, its boot lifted and trailing slightly LEFT. Distinct from frame 2.
Keep each torso in the same location and keep same ground baseline. Face looks right and sword remains in two-handed diagonal-up-right guard. Same design/colors/pixel density. Each figure and all sword/ponytail/boots fit fully within its cell with generous transparent margin and fully transparent gaps between cells. True transparent alpha; no backdrop, ground shadow, effects, text, grids, labels, borders or more figures. Exactly two anatomically plausible legs and boots in each frame, with overlapping feet allowed only as proper occlusion. No attacks or jumps.
```
