# 巫女・遺跡の追加画像：生成・差し替え記録

**2026-10-11 JST、再生成と7点すべての差し替えを完了。現在の生成待ち画像はない。** 前回の保存済みプロンプトを組み込み `image_gen` に再送し、透過PNGの生成に成功した。原画・切り出したPNG・全文プロンプト・再構築手順は[素材パッケージ](../../development/assets/ui/ruins/README.md)に保存した。

前回はHTTP 429 `usage_limit_reached`で生成できなかった。**ツールが返した再開予定は2026-10-11 16:34:09 JST（07:34:09 UTC）**。`resets_at: 1791704049`、`resets_in_seconds: 16788`、`limit_window_minutes: 1440`。同日の16:38以降に再試行し、制限の解除を実際の生成成功で確認した。

| ID | 生成した画像 | 反映先 |
| --- | --- | --- |
| ancient-stone | [古代石片](../../public/assets/ui/ruins/icons/ancient-stone.png) | 素材・報酬・変換・鍛冶 |
| bronze-gear | [青銅歯車](../../public/assets/ui/ruins/icons/bronze-gear.png) | 素材・報酬・変換・鍛冶 |
| magic-shard | [魔導片](../../public/assets/ui/ruins/icons/magic-shard.png) | 素材・報酬・変換・鍛冶 |
| ruins-crystal | [遺跡の結晶](../../public/assets/ui/ruins/icons/ruins-crystal.png) | 素材・報酬・変換・鍛冶・地域所持数 |
| ancient-core | [古代炉心](../../public/assets/ui/ruins/icons/ancient-core.png) | 素材・報酬・変換・鍛冶 |
| miko-gohei | [御幣](../../public/assets/ui/ruins/icons/miko-gohei.png) | 巫女の武器・通常攻撃 |
| miko-robe | [装束](../../public/assets/ui/ruins/icons/miko-robe.png) | 巫女の防具 |

全文プロンプトは [development/records/ruins-ui-prompt.txt](../../development/records/ruins-ui-prompt.txt)。透過ドット絵、4列×2行の静止アイコンアトラス（最後のセルは空白）を1枚生成した。キャラクター・敵・背景・戦闘エフェクトに追加生成の不足はない。

原画は `development/assets/ui/ruins/source/inventory-atlas-v1.png`（実際の生成寸法1254×1254）。RGBAを保持して最近傍で128×128に整理した。各画像には透明余白6pxを設け、原画の間隔に沿った切り出し範囲をmanifestへ保存した。`RuinsData.ITEMS`、`ForestProgressionUI`、`MikoSkills`の画像参照を更新し、数値は変更していない。

`npm run test:ruins-ui-assets`の3検査が通過。本編の装備・通常攻撃・素材一覧・変換画面でも7点を確認し、画像読み込み失敗とページエラーは0件。スクリーンショットは `output/ruins-ui-icons/`。
