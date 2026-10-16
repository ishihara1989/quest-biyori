# 巫女・古代遺跡のUI画像

2026-10-11、組み込み `image_gen` で透過ドット絵の原画を生成した。生成制限の解除後に、前回の保存済みプロンプトをそのまま再送した。

- 原画：[source/inventory-atlas-v1.png](source/inventory-atlas-v1.png)（1254×1254、RGBA）
- 全文プロンプト：[PROMPT.md](PROMPT.md)（[送信したテキスト](../../../records/ruins-ui-prompt.txt)と同一）
- 切り出し範囲と原画ハッシュ：[manifest.json](../../../../public/assets/ui/ruins/manifest.json)
- 7点の確認：[review.png](review.png)

| PNG | 用途 |
| --- | --- |
| [古代石片](../../../../public/assets/ui/ruins/icons/ancient-stone.png) | 遺跡のコモン素材 |
| [青銅歯車](../../../../public/assets/ui/ruins/icons/bronze-gear.png) | 遺跡のコモン素材 |
| [魔導片](../../../../public/assets/ui/ruins/icons/magic-shard.png) | 遺跡のコモン素材 |
| [遺跡の結晶](../../../../public/assets/ui/ruins/icons/ruins-crystal.png) | 地域結晶 |
| [古代炉心](../../../../public/assets/ui/ruins/icons/ancient-core.png) | タイタンのレア素材 |
| [御幣](../../../../public/assets/ui/ruins/icons/miko-gohei.png) | 巫女の武器・通常攻撃 |
| [装束](../../../../public/assets/ui/ruins/icons/miko-robe.png) | 巫女の防具 |

各PNGは128×128、透明余白6px。原画の透明な間隔に沿って切り出し、透過を保持して最近傍で縮小した。原画は等分セルより少しずれているため、切り出し範囲を明示的に保存している。

再構築は `npm run build:ruins-ui`、素材検査は `npm run test:ruins-ui-assets`、本編の画像表示確認は `npm run check:ruins-ui-icons`。バランス値の変更は含まない。
