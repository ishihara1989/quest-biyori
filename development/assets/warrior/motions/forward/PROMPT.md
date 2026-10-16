# 2026-10-06 再見直し: v7

採用 source/warrior-forward-generated-v7.png。今回の全シート v5 と、単体 1 v2、対生成 2/8 v1、単体 7 編集 v1 の生成画素を切り出し・最近傍でパッケージ。L を手前、R を奥に固定し、1=L 前、5=R 前、8→1 連続を修正。全生成/編集プロンプトの全文は REVIEW_PROMPT.md、全 8 の脚 ID 表と独立レビューは QA.md。1/3/5/7/8 拡大は warrior-forward-leg-qa.png。旧原画・失敗候補を保持。方法は組み込み image_gen、透明 alpha を保持。

# Warrior forward

## 旧 v4: 8 枚ループ（2026-10-06）

- 方法: 組み込み image_gen、transparent_background: true。
- 採用原画: `source/warrior-forward-generated-v4.png`、4 列 × 2 行。v1/v2 は旧 4 枚、v3 は最初の 8 枚生成として保存。
- 初回参照: `../../../../../public/assets/warrior/idle-01.png`（同一性）、`source/warrior-forward-generated-v2.png`（装備詳細）。修正参照: `source/warrior-forward-generated-v3.png`（編集対象）。
- 出力: 256 × 224 の独立した 8 枚、横 2048 × 224 のシート、80 ms × 8 = 640 ms の無限ループ GIF。
- 腰の中心 x を手動 anchor に指定し、原画の透明な列間で custom rect を切り出す。全コマ共通 scale 0.33902439024390246、pivot (128, 207)。生成以外で姿勢の描き直し・補間・複製は行っていない。

### 8 枚の生成プロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for a 2D side-view RPG, 8-frame forward walking loop.
Reference image 1 is the identity reference (approved idle sprite). Reference image 2 is the existing 4-frame motion showing detailed armor, sword and hair; use it only as a design reference, REPLACE the motion with EIGHT newly drawn connected phases.
Create one transparent PNG sprite sheet, landscape 2:1 proportions, EXACTLY 4 columns by 2 rows, exactly 8 separate full-body warriors. Read left to right across top row (frames 1–4), then bottom row (frames 5–8). Equal cell spacing, generous transparent gaps, no labels/grid lines, no shadows or floor.
Character: same brown-haired female chibi warrior with long high ponytail, brown leather armor and boots, black shorts, brown front tabard with silver ornament, brown eyes, huge broad silver sword with dark center and ornate silver guard. Preserve reference outfit, face, body proportions, all buckles and knee guards, sword geometry and size, and same hand order on sword grip in every frame. Entire character always faces RIGHT in the same three-quarter side view.
Motion: grounded WALK toward screen right, in-place cycle with fixed pelvis x per cell, fixed scale and consistent ground baseline. BOTH boot toe tips point to the RIGHT in EVERY phase including trailing lifted feet; do not flip the back boot left. Exactly two legs and two feet. Near leg and far leg alternate and retain their identity/occlusion. Controlled small body bob only. Sword held firmly diagonally up-right at waist/chest height in both hands, with only tiny following bob. Small coherent ponytail motion.
Eight distinct natural walking phases, evenly spaced:
1 near leg reaches forward/right and heel contacts, far leg extends back/left on toe;
2 weight sinks a little, near knee flexes, far heel lifts;
3 near foot supports under pelvis, far knee passes forward in front with lifted foot;
4 body rises, far shin swings forward/right, near heel begins to rise;
5 far heel contacts ahead/right, near leg extends behind/left, inverse of frame 1 with correct leg occlusion;
6 weight sinks, far knee flexes, near heel lifts;
7 far foot supports under pelvis, near knee passes forward with lifted foot;
8 body rises, near shin swings forward/right ready for frame 1, far heel begins to rise.
Keep frame 8→1 as smooth as all other transitions. Do not duplicate or mirror a pose, do not render the same support leg in both stride halves. Distinct contact/down/passing/up poses with gradual leg motion and stable torso. Keep anatomy/weapon complete within each cell and clean true alpha. Crisp pixel art matching the reference sprites, no blur, no text, no perspective or character scale change.
```

### 脚の通過・踏み出し修正プロンプト全文

```text
Use case: identity-preserve. Asset: eight-frame transparent pixel-art forward WALK loop. Edit this 4 columns by 2 rows sprite sheet. Keep the precise character design, face, hairstyle, outfit, sword held in both hands, brown-and-silver color palette and right-facing view. Keep exactly eight evenly spaced full-body cells with generous transparent outer margins and gaps. Fix the leg motion across all eight sequential poses. Do NOT leave frames 2,3,4 in the same knee-behind posture. Frames 3 and 7 MUST have the moving knee visibly passing FORWARD, raised and bent on the RIGHT of the pelvis. Frames 4 and 8 MUST swing the moving boot AHEAD toward the RIGHT, suspended slightly off the floor, with the other heel lifting. It is a natural complete alternating-leg WALK cycle toward screen right: near heel contact, near weight-down, far knee-forward passing, far foot-forward up, far heel contact, far weight-down, near knee-forward passing, near foot-forward up. Frame 1 shows NEAR leg stretched forward RIGHT and FAR leg stretched behind LEFT. Frame 5 shows FAR leg stretched forward RIGHT and NEAR leg stretched behind LEFT. Ensure opposite occlusion of thighs at frames 1 and 5; maintain a separate consistent near leg and far leg. Frame 2 near foot slightly ahead on ground, far toe behind beginning to lift. Frame 6 far foot slightly ahead on ground, near toe behind beginning to lift. Frame 3 near foot under pelvis grounded, FAR knee lifted forward right, far foot passes under that knee. Frame 7 far foot under pelvis grounded, NEAR knee lifted forward right, near foot passes under that knee. Frame 4 near support foot behind pelvis with heel raising, far foot suspended ahead right just before contact. Frame 8 far support foot behind pelvis with heel raising, near foot suspended ahead right just before contact. Absolutely BOTH boot toes point RIGHT throughout; trailing boot toes do not reverse direction. Two distinct intact legs, anatomically natural knees/ankles, consistent buckles and boots. Stable pelvis x, subtle down-up bob and no horizontal torso wobble. Sword shape and angle identical. Crisp game pixel-art, clean true transparency, no marks or text. Rebuild each leg phase as needed, no pose duplication. Frame 8 smoothly returns to frame 1.
```

### QA

- 原画と切り出し後の全 8 コマを目視。顔・ポニーテール・革鎧・前垂れ・剣のサイズと両手の握り順を維持。
- 接地・荷重・通過・踏み出しを 2 組描画。v3 の連続する後ろ膝の姿勢を修正し、3/7 は前方へ膝が通過、4/8 は前へ靴を送る姿勢になった。左右対称の脚装備のため近脚/遠脚の奥行き識別は控えめ。
- 支持脚と浮いた脚を含め靴先は右向き。後ろの靴を左向きに反転していない。8 の浮いた前足から 1 の接地へ繋がる。
- 剣先・髪・足に切れなし。8 つの出力の distinct pose、透過、原画/出力余白、共通接地の自動検査成功。GIF も 8 ページと所定の delay を検証。
- 前進の膝上げは後退より大きい。輪郭やバックルの微細な差は生成原画由来として残る。

## 旧 4 枚版の記録

- 方法: 組み込み image_gen、transparent_background: true。画像生成以外で姿勢を描き直していません。
- 参照1: `../../../../../public/assets/warrior/idle-01.png` — 承認済み待機の顔・頭身・色・装備・画風。
- 参照2: `../../source/warrior-idle-generated-v1.png` — 待機の詳細ピクセル表現。
- 参照3: `../../../references/warrior-original.png` — 元デザインの確認、画風は参照しない。
- 原画: `source/warrior-forward-generated-v1.png`。
- 採用原画: `source/warrior-forward-generated-v2.png`。初稿 v1 も保持。
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
Primary request: Draw FOUR DISTINCT keyframes of FORWARD WALK, facing RIGHT and stepping toward RIGHT in place. The feet visibly alternate through a complete walking cycle: frame 1 front/rightward stride contact, right-side visible leg extended to the right and opposite leg trailing left; frame 2 weight transfer/pass, trailing foot swings forward under the hips while planted foot remains on floor; frame 3 opposite-leg stride contact toward right, reversing the leg positions from frame 1; frame 4 opposite passing pose, the other foot swings through. Clear differences in foot and knee positions, not four idle poses and not merely a vertical bob. Body leans slightly forward, modest hip and head vertical movement, ponytail responds subtly. Arms maintain the idle sword guard with only slight breathing/walking adjustment. Start/end can naturally transition to the approved idle stance. Do not mirror the face or sword.
```

## v2 修正生成

参照1はこのモーションのv1原画を編集対象、参照2は承認済み待機を顔・画風の確認に使用。組み込み image_gen、transparent_background: true。

```text
Use case: identity-preserve
Asset type: pixel-art forward-walk sprite sheet, surgical animation correction.
Input image 1: existing forward-walk 2x2 sprite sheet is the EDIT TARGET; preserve its canvas layout, the warrior identity, all four heads and upper bodies, ponytail, outfit, sword and equipment exactly. Input image 2: approved idle is supporting identity/style reference.
Primary request: Correct ONLY the LEGS and BOOTS in the existing four-frame FORWARD walking cycle so it depicts one full alternating two-step cycle facing RIGHT. The current frame 1 and frame 3 have almost identical leg placement; this must change. Do not create four copies of the same leg placement.
Top-left frame 1: keep the existing contact pose with the NEAR leg extending forward RIGHT and FAR leg trailing LEFT.
Top-right frame 2: passing stance, near leg bears weight under hips, far leg bends and swings forward through center with its boot clearly off the ground.
Bottom-left frame 3: the opposite contact! NEAR visible leg (leg nearest viewer) is now trailing BACK toward LEFT, with its knee and boot visibly left of hip; FAR partially overlapped leg extends forward RIGHT, with its boot right of hip. This is an actual opposite leg stride, not a mirrored character. Strongly preserve distinct near-versus-far leg overlap and the trouser/armor straps to make the alternating leg anatomically readable.
Bottom-right frame 4: opposite passing stance; FAR leg bears weight under hips, NEAR visible leg has bent knee and lifts its boot as it swings forward.
Preserve all four faces looking RIGHT, same upper-body diagonal-up-right two-handed sword guard. Keep body and weapon size, style, colors and rendering unchanged. Four full-body frames in 2x2 reading order with transparent background and transparent spaces between every frame. Whole hair, body, boots and sword must be fully present; no clipping. No backdrop, shadow, effects, text, border or grid. Crisp detailed pixel-art at matching pixel density. Anatomically plausible knees and joints, exactly two legs and two boots per frame. Do not change the sword into an attack.
```
