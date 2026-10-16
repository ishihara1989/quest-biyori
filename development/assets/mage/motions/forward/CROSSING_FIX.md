# 魔法使い・前進の通過姿勢修正（2026-10-06）

ユーザーの動作確認で、脚が体の下ですれ違うコマの不足が指摘された。v4を編集対象として組み込みimage_genで修正し、`source/mage-forward-generated-v5.png` を採用。3・7コマ目は片脚の支持と遊脚の通過が足首付近で重なる姿勢に変更した。8姿勢、640ms、全コマ右向きの靴先・持ち手・装備を維持する。

## 使用プロンプト全文

```text
Use case: identity-preserve.
Edit target: this existing mage 4 columns by 2 rows transparent sprite sheet. Keep eight cells, the exact mage face, hair, hat, costume, staff, grip side, right-facing viewpoint and sprite size unchanged. Repair the forward walk leg animation; the current walking cycle visibly stutters because it lacks real crossing/passing poses.
CRITICAL: in cell 3 (top row third) and cell 7 (bottom row third), draw the legs actually passing/crossing directly BELOW THE PELVIS: one planted straight support leg with boot under the body's center, and the bent moving leg crossing behind/in front of that shin, with its airborne ankle almost horizontally aligned with the planted ankle. The two boots must overlap slightly in screen x; DO NOT keep the airborne boot sticking far forward/right, DO NOT draw another broad split-legs kick in those cells. Show the change of which leg is nearer, maintaining near/far leg identity.
An 8-phase moderate-stride walk toward RIGHT, not a run or high-knee march. Each boot follows a continuous arc across all eight cells, no teleporting from left to right. Near leg trajectory relative to pelvis, measured horizontally: cell1 front +35 grounded; cell2 +20 grounded loading; cell3 0 grounded support; cell4 -20 grounded heel rising; cell5 rear -35 toe-off; cell6 -20 airborne folding; cell7 0 airborne crossing in front of far planted shin; cell8 +20 airborne extending ready for cell1. Far leg is half a cycle offset: cell1 rear -35 toe-off; cell2 -20 airborne folding; cell3 0 airborne crossing behind near planted shin; cell4 +20 airborne extending; cell5 front +35 grounded; cell6 +20 grounded loading; cell7 0 grounded support; cell8 -20 grounded heel rising.
Both shoe toes always point RIGHT including rear/airborne boot, unchanged purple boots/gold trim. Small knee bend, moving foot just a little above ground, no exaggerated high kicks. Cell3 and cell7 must each have narrow overlapping legs at center rather than wide separated boots. Smooth 8→1 closure with no larger motion jump than other adjacent poses.
Pelvis centered in same place in each cell, same character scale and ground line. Gentle small vertical bob, minimize redraw of head, hat, staff and robe details. Render real clean alpha transparency, generous clear cell gutters and no clipping, no background/shadow, no text, no extra limbs.
```
