# 断行槌・行動中断エフェクトの生成記録

2026-10-12。imagegen スキルの built-in image_gen モード。透過PNGの4コマを切り出した。生成原本は `generated-v1.png`、実際の生成サイズ1280×1280。既存パラディンの金・白・淡いシアンの神聖エフェクトを基準にした。

生成用プロンプトの仕様：

A transparent pixel-art RPG impact animation sheet, exactly four consecutive effect frames in a clean 2×2 grid. True alpha background, no text, borders, characters or scenery. Golden, ivory-white and pale-cyan holy impact, designed for a paladin's heavy interruption strike. Match the existing pixel-art holy effects. All four frames share the same center, logically (256,256) inside each 512×512 cell; scale these coordinates uniformly for a larger output. Frame 1: compact contact spark of radius about 45. Frame 2: strong golden impact flash of radius about 90 with a crescent arc and a stylized shield silhouette breaking apart inside a radius about 150. Frame 3: shield fragments, pixel sparks and a holy shock arc expand to radius about 190. Frame 4: sparse fading gold/cyan fragments expand to radius about 210. Preserve transparent outer margins and keep all particles within their own cell. Clear pixel clusters, no blurry rectangular glow or background, consistent palette and center across all frames.

再生順：接触140ms → 破断140ms → 飛散140ms → 消失140ms。合計560ms。出力コマ256×256、中心ピボット(128,128)。
