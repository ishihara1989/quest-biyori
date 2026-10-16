# 装備アイコンのリファイン（2026-10-11）

戦士・魔法使い・忍者・呪術師の装備を、輪郭と大きな色面で判別できるドット絵に差し替えた。呪術師は魔法使いの画像流用をやめ、髑髏の儀杖と紫の祭衣を用いる。パラディンと巫女の森の基本装備画像は既存のものを維持する。

全6職のサブノード・ユニーク枝に職別の画像と名称を用意した。武器の枝は攻撃・攻撃速度、防具の枝はHP・防御、ユニーク3本目はスキル威力／MP回復を表す。例えば戦士は「刃の焼入れ」「剛腕の律動」「獅子の覇気」、呪術師は「呪骨の研磨」「呪鈴の拍」「髑髏の呪印」。名称と画像だけを変更し、ID・コスト・効果・前提・保存構造は維持する。

## 地域の進化

| 地域 | 装飾 |
| --- | --- |
| 森 | 基本装備 |
| 沼 | 翡翠色の金具・肩当て |
| 洞窟 | 紫の結晶 |
| 海岸 | 青い貝・真珠 |
| 遺跡 | 青銅の幾何学装飾・青い宝石 |

各キャラの武器・防具ごとに、取得済みメインノードの最も先の地域を外観に反映する。その地域のメインを1つ取得した時点で切り替わる。ステージのクリア、地域タブの閲覧、サブ・ユニークの取得だけでは切り替えない。武器と防具は独立して進化する。

能力・装備カードと鍛冶の装備ボタンは実際に取得済みの外観を表示し、ツリーのメインとユニーク根元はその地域の装備をプレビューする。保存済みのノードから毎回導出するため、再読み込みでも外観を維持する。

## 素材と生成プロンプト

組み込み **image_gen** を使用。職ごとに4×4の透過PNGアトラスを生成し、原画のアルファを保ったまま切り出して128×128へ最近傍で縮小した。生成画像の位置ずれによる欠け・隣の絵の混入を避けるため、実際の絵の外接矩形で切り出す。外周6pxは透過余白。

- 保存先：`public/assets/ui/equipment/<職>/`（96 PNG。パラディン・巫女の基本4画像は既存画像を表示する）
- 原画・全文プロンプト：`development/assets/ui/equipment/source/`
- [戦士](../../development/assets/ui/equipment/source/warrior-PROMPT.md) · [魔法使い](../../development/assets/ui/equipment/source/mage-PROMPT.md) · [忍者](../../development/assets/ui/equipment/source/ninja-PROMPT.md) · [呪術師](../../development/assets/ui/equipment/source/shaman-PROMPT.md) · [パラディン](../../development/assets/ui/equipment/source/paladin-PROMPT.md) · [巫女](../../development/assets/ui/equipment/source/miko-PROMPT.md)
- 生成指示の共通点：大きな輪郭・3段階の陰影・細密な彫刻を避ける・40pxでも判別できる・地域の変化は同じシルエットに小さな装飾を加える。
- 切り出し座標・原画ハッシュ：`public/assets/ui/equipment/manifest.json`
- 一覧画面：`/equipment-lab.html`（装備72px／枝40px）

再構築：`node tools/assets/build-equipment-icons.cjs`

確認：`node --test tests/equipment-visuals.test.cjs` / `node tools/verify/verify-equipment-icons-ui.cjs`

UI検証は独立したブラウザコンテキストを使い、ユーザーのプレイデータを変更しない。

## 砂漠以降と女神の専用装備（2026-10-16）

砂漠以降を遺跡の画像へ固定していた参照を修正し、砂漠・高原・氷河・火山・魔王城・女神の6段階×6職×武器／防具、計72枚を追加した。砂漠は砂金とトルコ石、高原は風の羽と黄緑、氷河は蒼氷、火山は炭色と溶岩、魔王城は黒紫と角、女神は白金と紫の星を用いる。パラディンの防具は既存の盾の形、巫女は御幣と紅白の装束を維持する。

女神の最初の「女神の契約」はメインノードとし、残る40ノードをユニーク枝として維持する。自動強化のメイン優先・対象除外にもこの分類を適用する。取得済みの契約はそのスロットの外観を星界の装備へ変更する。ID・前提・効果・費用・ノード数は維持する。

組み込み **image_gen** で職ごとの4列×3行アトラスを生成した。連結した輪郭の位置から対象を切り出し、隣接アイテムの欠片と微小なノイズを除外する。保持する画素は原画のアルファを維持し、最近傍で128×128へ縮小、外周6pxを透明にする。原画・全文プロンプトは `development/assets/ui/equipment/source/<職>-late-*`、本編画像は `public/assets/ui/equipment/<職>/<weapon|armor>-<地域>.png`、原画ハッシュと切り出し座標は `public/assets/ui/equipment/late-manifest.json` に保存する。

全文プロンプト：[戦士](../../development/assets/ui/equipment/source/warrior-late-PROMPT.md) · [魔法使い](../../development/assets/ui/equipment/source/mage-late-PROMPT.md) · [パラディン](../../development/assets/ui/equipment/source/paladin-late-PROMPT.md) · [忍者](../../development/assets/ui/equipment/source/ninja-late-PROMPT.md) · [呪術師](../../development/assets/ui/equipment/source/shaman-late-PROMPT.md) · [巫女](../../development/assets/ui/equipment/source/miko-late-PROMPT.md)。[72枚の一覧](../../development/assets/ui/equipment/late-review.png)は左から地域ごとの武器・防具、上から戦士・魔法使い・パラディン・忍者・呪術師・巫女。

再構築：`npm run build:late-equipment-icons`。確認：`npm run test:equipment-icons` / `npm run check:equipment-icons-ui` / `npm run check:structure`。全72枚の輪郭・色調・透過・見切れを一覧で検収した。静止画のためアニメーション検収は対象外。装備・エピック・自動強化・育成の関連54テスト通過後、切り出し調整に対応する装備4テストを再実行して通過した。ブラウザでは全6職・武器／防具の10地域と女神について、プレビュー・取得・外観反映・再読込を確認し、1440px／390px幅の砂漠以降6画面も通過した（読み込み・実行エラー0）。構造チェックも通過。

検証結果：装備外観・森の育成・沼・洞窟／海岸・遺跡・森のバランスの計62テスト通過。6職×武器／防具×5地域の実画面検証、将来地域のプレビュー、取得後の即時反映、再読み込み、PC／スマホ幅を確認。96 PNGすべての128pxサイズ・可視領域・6px透過余白も確認した。
