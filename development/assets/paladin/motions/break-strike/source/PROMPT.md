# 断行槌モーションの生成記録

2026-10-12。imagegen スキルの built-in image_gen モード。基準リファレンスは既存パラディンの通常メイス攻撃シート。透過PNGを生成し、4コマを切り出して接地位置を合わせた。生成原本は `generated-v1.png`。実際の生成サイズは1280×1280、各コマの基本セルは640×640。

生成用プロンプトの仕様：

Pixel-art action sprite sheet for the same blonde female paladin as the reference, with navy, white and gold armor, a white-cross shield, and the same gold-headed mace. True transparent background. Exactly four action poses arranged in a clean 2×2 grid, no captions, no borders, no extra characters, no effects. Keep the identity, palette, armor, shield, size and side view consistent in all four cells. Coordinates below describe a logical 512×512 cell; scale them uniformly if the image is larger. Keep the ground contact around (256,470) and the head around (260,210). Frame 1: planted feet, shield protecting the torso, mace head at (160,210), preparing a compact side strike. Frame 2: weight moving forward, shield still protecting, mace head at (275,185), beginning the fast outward swing. Frame 3: contact pose, mace head at (410,275), a decisive horizontal strike to the right; keep the full weapon visible. Frame 4: recovery, mace head at (335,310), planted feet and the same body proportions. Crisp pixel clusters, restrained highlights, matching the supplied reference. Leave transparent gutters wide enough to separate the four poses without cropping the mace.

再生順：構え150ms → 振出90ms → 命中100ms → 復帰320ms。命中240ms。出力コマ256×256、足元ピボット(128,239)。
