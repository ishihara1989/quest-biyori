# Idle RPG — Sprite Lab

「金砂の墓域」6-1〜6-10（Lv.51〜60）を実装。敵7種すべての待機・移動・被弾・撃破、専用攻撃、毒・砂縛り・召喚・突進・地割れ・浅い潜行に対応しています。[モーション確認](http://127.0.0.1:4191/desert-motions.html)、[実装・検証](../implementation/desert-stage-implementation.md)、[原画・全文プロンプト](../../development/assets/desert-motions/README.md)。

UI・演出・画像素材制作の共通方針は [AGENTS.md](../../AGENTS.md) にまとめています。

海岸10クリアで加入する巫女と「古代遺跡」5-1〜5-10を本編に追加。20アクティブ、召喚・憑依・回復・バリア・神楽、6人編成、敵8種、装備・素材・保存に対応しています。[実装と検証](../implementation/miko-ruins-implementation.md)。追加UI画像7点も生成・差し替え済み。[画像・原画・プロンプト](../../development/assets/ui/ruins/README.md)と[生成制限・再開の記録](../production/ruins-image-generation-pending.md)。

巫女の[専用プレビュー](http://127.0.0.1:4191/miko-asset-lab.html)では独立召喚11種・憑依霊4種、巨大な顕現、23種の演出、本体追加4動作、20アイコンを確認できます。[素材の引き継ぎ記録](../production/miko-asset-handoff.md)。

多ステージ共通の[バランス計算案](../design/balance-formulas.md)と検証ツールを追加。成長・装備・ダメージ・スキルの共通式は提案段階です。森3と、各地域の1・5を除く敵HP・火力・編成は本編へ反映。[以前の適用内容](stage-balance-adjustment.md)。巫女加入後の[最新調整](wave-balance-adjustment.md)では森・沼を維持し、洞窟・海岸は最大4ウェーブ、遺跡は最大5ウェーブ、大ボスは装備5段階遅れでほぼ勝てない難易度にしています。`npm run test:balance-model` で式の条件、`npm run audit:balance` で現行60ステージの戦闘を確認できます。1・5を除くステージの合格検査は `npm run audit:stage-balance`、結果は [30配置の検証表](../../output/balance/stage-tuning-verification.md) に出力します。`npm run check:wave-balance-ui` でウェーブ表示・進行・PC/スマホ画面を確認できます。

## 放置ARPG「FORESTBOUND」

「アイテム」→「素材変換」にステージ別タブを追加。コモン3種各2個→結晶1個、結晶1個→選んだコモン3個、結晶5個→大ボス素材1個、大ボス素材1個→結晶3個または選んだコモン9個。関連素材の登場ステージのクリアで解放され、1回／最大回数の変換と自動保存に対応。[仕様と検証](../implementation/material-conversion.md)。

「洞窟」3-1〜3-10（Lv.21〜30）と「海岸」4-1〜4-10（Lv.31〜40）を追加。新しい敵14種、攻撃できる尻尾・触手、吸血、糸の減速、墨の目潰し、泡の拘束、トロールの連打と休息を本編に接続しています。各地域の装備ツリー・素材・背景・自動進行も対応。[ステージと攻撃の仕様](../implementation/cave-coast-progression.md)。

始まりの森に続く「毒の沼地」を本編へ追加しました。森10クリアで解放され、2-1〜2-10の想定レベルはLv.11〜20。カエル系・泥系・アンデッド系とヒュドラが登場し、リッチは詠唱からスケルトン4体を召喚します。素材5種の透過ドット絵、沼地の装備ツリー、自動進行と保存も対応。[ステージ・報酬・検証の詳細](../implementation/swamp-progression.md)。

序盤〜中盤の育成設計について、原案・決定事項・検討案は [プログレッション設計の相談記録](../design/progression-design.md) にまとめています。

洞窟10クリア後に加入する呪術師を[スキル仕様](../design/shaman-skill-design.md)に基づいて実装。通常攻撃と20アクティブ、4追加モーション・15コマ、27種の透過エフェクト・89コマを追加しました。[全身から立ち上る怨霊・DoT・後半演出](../production/shaman-fx-enhancement.md)を強化し、[呪術師の呪法検証](http://localhost:4191/shaman-skill-lab.html)で全技を確認できます。生成プロンプト、加入条件、簡易バランス確認は[実装メモ](../implementation/shaman-implementation.md)にまとめています。

起動は `npm start`。<http://127.0.0.1:4191/> がゲーム本体です。既存のキャラクター検証は `/index.html`、1対1戦闘検証は `/battle.html` に残しています。

戦士が自動で接近・通常攻撃・旋風斬を行い、始まりの森の各サブステージを3ウェーブで戦います。ステージ選択、ステータス、ドロップ品とジェムだけのアイテム一覧を画像中心のUIで実装。武器・防具は装備強化ツリーで扱います。説明はホバーとキーボードフォーカスのツールチップに表示します。タッチ操作ではアイテムを選択して名前・所持数を確認できます。

1: スライム／2: スライム＋ボススライム／3: イノシシ＋ボスイノシシ／4: 植物クリーチャー＋アルラウネ／5: 雑魚3種を36体／6: スライム系＋イノシシ系／7: スライム系＋植物系（トレント除外）／8: イノシシ系＋植物系（トレント除外）／9: トレント以外すべて／10: 全種類＋トレント。

クリアで次を解放。ゴールド・素材を自動で収集し、初回は回復薬も入手します。オプションで同じステージ周回・次ステージへの進行・OFFを選択し、自動周回中の敗北では1つ前へ戻って同じステージを周回します。確認ダイアログ付きのセーブリセットもオプションにあります。1×/2×切り替え、Spaceで一時停止、回復薬はHPを126回復します。ステージ間ではHPを全回復。進行・所持品・設定はブラウザーのlocalStorageに保存されます。非表示タブとメニュー表示中は戦闘・周回を停止します。オフライン報酬はありません。

戦士と、1-4「妖花の庭」クリアでLv.4から加入する魔法使いの育成を実装しています。加入後は2人で同時に自動戦闘します。「キャラクター」「スキル」「鍛冶」から、能力・装備、各53ノードのスキルツリー、武器と防具それぞれの100ノードの強化ツリーを開けます。スキルの「−」で1レベル分と前提を失うスキルのSPを返却できます。装備はメイン10、上下の枝80、終端10で、10個ごとに取得数ボーナス、100個で共通容量＋1。100ノードのツリー1本の全取得は森10約300周、メインは武器・防具を合わせて各ステージ約3周以下の期待素材量を基準にしています。

後続地域でも維持する[バランス方針](../policies/balance-policy.md)を記録しています。想定レベルはステージ番号。森10でLv.9→10は1クリア、次は3、9、27、81、243クリアと3倍になります。経験値はレベル内の進捗で保存・％表示し、3^(-20)以下の獲得量を切り捨てます。累積値や巨大な正の累乗は使いません。セーブ形式はversion 2で、旧形式は新規状態になります。各地域の主道完走で次地域の装備強化へ進めます。

コモン素材は雑魚30%・ボス100%、地域結晶はボス30%・大ボス100%、レア素材は大ボス30%。ジェムはボスのレア5%・ユニーク0.5%とし、雑魚からはドロップしません。アイテムの素材・ジェム欄を分け、ジェムは個別表示。右クリックで選択中のキャラ・武器／防具へ装着と解除を切り替え、装着済みを先頭に並べて装備者と箇所を表示します。タッチでは選択詳細の装着・解除ボタンを使用できます。

アイテム用透過PNGアトラスは組み込みimage_genで生成し、`public/assets/ui/` に保存。全文プロンプトは `development/assets/ui/PROMPT.md`、原画は `source/inventory-atlas-v1.png`。再切り出しは `npm run build:ui`。既存のキャラクター・敵・背景素材は変更していません。

育成用の杖・ローブ・スキル・ジェムの16画像は組み込みimage_genで生成し、`public/assets/ui/progression/` に保存。原画と全文プロンプトも同梱しています。再切り出しは `npm run build:progression-ui`。

レア度はコモン（白）・アンコモン（水色）・レア（紫）・ユニーク（マゼンダ）。通常素材はコモン、地域ボス3種の森の結晶はアンコモン、トレントの古樹の欠片はレアです。ジェムは基本8種とユニーク3種。武器攻撃・魔法攻撃の容量と特化倍率を追加し、複合ユニークは同容量の基本ジェムの組み合わせより強力です。数値一覧は [育成試作仕様](forest-progression-prototype.md) に記載。

獲得品はリザルトに集約。宝箱4コマの開封後、低レア度からアイテムを順に公開し、高レア度ほど強い光・光条・粒子を表示します。道中ゴールドとクリアゴールドの合計、全ドロップ、初回の回復薬、クリア後の経験値進捗を表示。敗北時にも獲得済みの品を確認できます。AUTOは全公開の5秒後に再出撃。演出スキップ、リザルトからオプションを開く操作、動きを減らす設定にも対応。

宝箱4コマと追加ジェム・結晶9アイコンは組み込みimage_genで生成。透過PNGの原画・各コマ・manifest・[全文プロンプト](../../development/assets/ui/loot/PROMPT.md) は `public/assets/ui/loot/`、使用アイコンは `public/assets/ui/items/` と `public/assets/ui/progression/`。再構築は `npm run build:loot-ui`。検査は `npm run test:loot`、ブラウザー確認はローカルサーバー起動後 `node tools/verify/verify-loot-ui.cjs`（PlaywrightとChromeを使用、`FOREST_TEST_BROWSER` で実行ファイルを指定可能）。確認用のブラウザーは独立した保存領域を使用します。

戦闘データは `public/js/data/forest-data.js`、育成データと計算は `public/js/core/forest-progression.js`、固定ステップのシミュレーションは `public/js/combat/forest-simulation.js`。検査は `npm run test:game`、`npm run test:progression`、既存素材を含む全検査は `npm test`。

## 毒の沼地の敵キャラ

ギガトード・キングトード・泥の手・泥巨人・スケルトン・リッチ・ヒュドラの7種。待機・移動・被弾・撃破と固有攻撃を、[敵素材ページ](http://127.0.0.1:4191/enemies.html#giga-toad)で確認できます。[戦闘確認ページ](http://127.0.0.1:4191/swamp.html)では、毒液・舌・泥の拘束・大技の予告・闇の魔法・ヒュドラの連続攻撃と毒ブレスを確認できます。

画像は組み込みimage_genで生成し、原画・プロンプト・透過PNG・GIF・manifestを保存。スケルトンの歩行は左右3コマずつの6コマ。掴みは命中時だけ2.2秒間移動を止めます。[素材と戦闘の仕様](../design/swamp-enemies.md)。再構築は `npm run build:swamp`、検査は `npm run test:swamp`、ブラウザー確認は `npm run check:swamp-ui`。

ヒュドラの待機・移動・被弾は全コマを左向きの5本首に修正。毒の沼地の背景は森と同じ遠景／地面＋近景の2層、接地点Y323〜512です。[背景確認ページ](http://127.0.0.1:4191/stages.html?stage=poison-swamp)で森と切り替えでき、戦闘確認ページにも背景を反映しています。[背景素材と全文プロンプト](../../development/assets/stages/poison-swamp/PROMPT.md)。背景の再構築は `npm run build:swamp-stage`。

## 魔法使いの杖・詠唱モーション

魔法使いに杖の通常攻撃、閉眼して髪が浮く詠唱、杖を前へ出す動作と維持、振り上げる動作と維持の6種類・計24コマを追加しました。
[魔法使いのモーション確認](http://127.0.0.1:4191/mage-lab.html) で前の動作との接続、髪のループ、左右反転、画像エフェクトをスローや時間指定で確認できます。
風の弾・詠唱の魔法陣・着弾を各4コマの透過PNGで生成し、通常攻撃と風刃を本編へ接続。
原画・PNG・GIF・manifest・[全文プロンプト](../../development/assets/mage/motions/PROMPT.md) と [描画仕様](../../development/assets/mage/motions/README.md) を保存。
再構築は `npm run build:mage-motions`、検査は `npm run test:mage-motions`。

## 戦士の剣技と新しいスキルツリー

戦士はLv100まで成長し、連刃＋5レベルごとの20技を独立取得します。各技・専用強化21・一般パッシブ11は最大Lv5、1段階1SP。専用強化だけ対象技の習得が前提です。本編のスキルツリーはホイールで拡大縮小、空白ドラッグで移動できます。旧戦士ツリーのSPは返却し、経験値・装備・ジェムを引き継ぎます。

[戦士のモーション確認ページ](http://127.0.0.1:4191/skill-lab.html) では全21技のLv・専用強化・雑魚／ボスを切り替え、スロー再生・コマ送り・時間指定・軌道表示ができます。本編と同じ動作・対象判定・エフェクトを使用します。既存戦士モーションを再利用し、21アイコンと6種類の4コマ透過エフェクトを追加しました。

数値とパッシブ一覧は [戦士スキル仕様](../design/warrior-skill-design.md)、画像の生成プロンプトは [素材記録](../../development/assets/skills/warrior/PROMPT.md)。検査は `npm run test:warrior-skills`、素材の再構築は `npm run build:warrior-skills`（Python / Pillow）。

## アルラウネ

[アルラウネの素材ページ](http://127.0.0.1:4191/enemies.html#alraune) に、緑肌の女性の上半身が大きな花から生える左向きボスを追加しました。
待機・根で這う移動・被弾・撃破・残像付きのトゲツル叩きつけ・小花の種の連射を各4コマ、計24コマ。種の連射は400msのループです。
種の連射では「発射された種を表示」で、小花3輪の口から左へ飛ぶ種を本体に重ねて確認できます。初期オンで、停止・コマ送り・左右反転にも対応しています。
[攻撃エフェクト](http://127.0.0.1:4191/effects.html) には、左向きの種25粒を3段にまとめた弾群1枚を追加しました。
素材は public/assets/enemies/alraune/ と public/assets/effects/alraune-seed-volley/。透過PNG・個別コマ・GIF・manifest・原画・全文プロンプトを保存。
本体は1コマ640×384px、接地基準(360,367)。弾群は320×128px、中心基準(160,64)。
攻撃イベントと描画は [アルラウネの仕様](../../development/assets/enemies/alraune/README.md)。再構築は npm run build:alraune、検査は node --test tests/alraune-assets.test.cjs。

## ボスイノシシ

[ボスイノシシの突進予告](http://127.0.0.1:4191/enemies.html#boss-boar/charge-windup) を追加しました。通常イノシシより大きな体・牙、赤銅色のたてがみ、肩の古傷を持つボスです。
待機4・移動6・突進4・被弾4・撃破4に、屈んで後ろ片足で地面を蹴る突進予告4コマ（800msループ）を加えた全26コマ。
移動は通常イノシシと同様に1〜3／4〜6を別々に生成し直し、各3コマのPNGも保存。前半では手前の脚、後半では奥の脚を持ち上げて踏み替えます。
予告中はその場に留まり、地面の攻撃範囲を別レイヤーで重ねてから突進へ切り替えられる素材仕様です。地面の範囲表示・ボスAIの戦闘接続は今後の実装です。
素材は `public/assets/enemies/boss-boar/`。1コマ480×320px、接地基準 `(240,303)`。透過PNG・GIF・manifest・原画・全文プロンプトを保存。
[描画と突進予告の接続仕様](../../development/assets/enemies/boss-boar/README.md)。再構築は `node tools/assets/build-enemies.cjs boss-boar`、検査は `node --test tests/boss-boar-assets.test.cjs`。

## イノシシ型モンスター

[イノシシの素材ページ](http://127.0.0.1:4191/enemies.html#boar/move) に、左向きの四足型を追加しました。
移動6コマは1〜3／4〜6を別々に生成し、待機・被弾・撃破・突進は各4コマ。右前脚が前の待機姿勢から左前脚へ踏み替え、6→1で右前脚の接地に戻ります。
後脚も持ち上げと腹の下への踏み出しを描き分けています。突進は「前脚を上げる→跳ぶ→前脚で着地→後脚も着地してかがむ」の4コマループ。待機の濃い茶色を基準に各原画を色調補正しています。
素材は `public/assets/enemies/boar/`。透過PNG・GIF・manifest・原画・プロンプトを保存。
1コマ320×224px、接地基準 `(160,207)`。描画と脚の接続は [素材の説明](../../development/assets/enemies/boar/README.md)。
再構築は `node tools/assets/build-enemies.cjs boar`、検査は `node --test tests/boar-assets.test.cjs`。

## ボススライム

<http://127.0.0.1:4191/enemies.html#boss-slime> に、待機・移動・被弾・体当たり・撃破・分裂を各4コマで追加しました。通常スライムと同じ青いデザインの大型ボスです。
分裂は1コマ目で膨らみ始め、3コマ目まで接続し、4コマ目でちぎれます。880ms周期の連続分裂に対応し、再生終了ごとに通常スライムを1体出すプレビューを用意しています。<http://127.0.0.1:4191/enemies.html#boss-slime/split> から直接確認できます。
素材は `public/assets/enemies/boss-slime/`。透過PNGシート6枚・個別24枚・GIF6本・manifest・原画と全文プロンプトを保存。1コマ576×320px、接地基準 `(288, 303)`。
召喚タイミングと描画仕様は [ボススライムの説明](../../development/assets/enemies/boss-slime/README.md)。再構築は `node tools/assets/build-enemies.cjs boss-slime`、検査は `node --test tests/boss-slime-assets.test.cjs`。素材プレビューに接続済みで、既存の1対1戦闘へのボスAI・召喚AIの接続は別途行います。

## 森のボス・トレント

<http://127.0.0.1:4191/enemies.html#treant> で、待機・移動・枝腕攻撃・被弾・撃破・樹の実の投げ上げ・根の地面差し込みを各4コマで確認できます。移動は根の先が少し蠢く880msのループです。
樹の実1枚・汎用爆発4コマ・地面から伸びる根4コマは <http://127.0.0.1:4191/effects.html>。透過PNG・個別PNG・GIF・フレーム情報・原画とプロンプトを保存しました。
本体は `public/assets/enemies/treant/`、独立エフェクトは `public/assets/effects/`。
描画基準と攻撃発生時刻は [トレントの仕様](../../development/assets/enemies/treant/README.md)、エフェクトの配置・消去は [エフェクトの仕様](../../development/assets/effects/README.md) に記載。
再構築は `node tools/assets/build-treant.cjs`、素材検査は `node --test tests/treant-assets.test.cjs`。

## 戦闘シーンの試作

<http://127.0.0.1:4191/battle.html> で、始まりの森の1対1自動戦闘を確認できます。各素材ページの「戦闘シーン」リンクからも開けます。
戦士1人を左側、スライム1体を右側のランダムな接地点へ配置し、上下の距離も含めて互いに接近します。
戦士は `attack-overhead` の振り下ろし、スライムは `attack` の体当たりを使用します。
ダメージは振り下ろしの3コマ目開始（340ms）、体当たりの2コマ目開始（160ms）に1回だけ判定し、HPが0になると撃破モーションの最終姿勢で停止します。
攻撃中の被弾では振りを中断せず、点滅で被撃を示します。攻撃以外の被弾では被撃モーションを再生します。

| キャラ | HP | 攻撃力 | 攻撃範囲 | 移動速度 | 攻撃開始間隔 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 戦士 | 120 | 18 | 116px | 105px/s | 1450ms |
| スライム | 96 | 12 | 108px | 82px/s | 1550ms |

数値は `development/labs/js/battle-simulation.js` の `DEFAULT_STATS` にまとめた仮設定です。攻撃範囲は接地座標間の距離です。
HPバー・ダメージ表示・戦闘記録・勝敗を表示し、一時停止／再開（Space）、0.5／1／2倍速、攻撃範囲表示、ランダム配置での再戦に対応します。
タブが非表示の間は時間を進めません。OSの「動きを減らす」が有効な場合は一時停止から始まります。
60Hz固定ステップの戦闘ロジックを描画から分離し、`node --test tests/battle-simulation.test.cjs` で配置・接近・攻撃タイミング・相打ち・撃破後の停止を検査できます。

## バトルステージ「始まりの森」

ステージ素材は <http://127.0.0.1:4191/stages.html> で確認できます。キャラクターページ上部の「バトルステージ」からも開けます。
組み込み `image_gen` で、森の遠景と、透過の木々＋広い土の地面を別々に生成しました。
保存先は `public/assets/stages/starting-forest/`。PNG2枚、レイヤーと推奨接地点の `manifest.json`、全文プロンプトと原画を保存しています。

左右端には生成由来の小さな差があるため、通常向きと左右反転を交互に描いて横ループします。実際の1周期は画像幅の2倍です。
遠景は地面の0.28倍の速度でスクロール。1024×576プレビューでは、足元Y=323〜512の広い移動面を設け、キャラを足元のY順で描画します。
地面のクリック・ドラッグ、X/Yスライダー、矢印キーで位置を確認でき、背景だけの表示も可能です。
使い方は [ステージ素材の説明](../../development/assets/stages/starting-forest/README.md)、検査は `node --test tests/stage-assets.test.cjs`。

## 敵キャラクターの検証

敵は別ページ <http://127.0.0.1:4191/enemies.html> で確認できます。キャラクターページ上部のリンクからも開けます。
左向きの青いスライムを、既存キャラのドット絵を画風参照にして組み込み `image_gen` で生成しました。
待機4・移動4・被攻撃3・撃破4・攻撃4の計19コマです。移動はその場で跳ねるループ、攻撃は左への体当たり。
被攻撃と攻撃は最後に待機1コマ目と同じ画像へ戻ります。移動と撃破の先頭も同じ基準姿勢を使います。
「待機を挟んで再生」では1周期の待機 → モーション（移動は2周期）→ 1周期の待機を確認できます。撃破後は水たまりの最終姿勢を保持します。

素材は `public/assets/enemies/slime/`。生成原画と全文プロンプトを `source/slime-generated-v1.png`、`PROMPT.md` に保存しています。
各 `motions/<id>/` に透過PNGシート・個別PNG・GIF・manifestを保存。1コマ256×224px、接地基準 `(128, 207)` でキャラと同じ座標に描けます。
スライム本体は通常約85×55pxで、人型キャラより小さな敵です。ホップと体当たりの位置変化はPNGに含まれるため、追加オフセットは不要です。
切り出しは全モーション共通0.5倍率の最近傍で、原画のRGBとアルファを保存します。基準コマ以外には生成由来の輪郭差が残るため、コマ送りで確認できます。

```powershell
node tools/assets/build-enemies.cjs            # 敵一覧からPNGとGIFを再構築
node tools/assets/build-enemies.cjs slime      # スライムのみ再構築
node --test tests/enemy-assets.test.cjs
```

敵を増やすときは `public/assets/enemies/index.json` に敵と表示キャンバスを登録し、その敵の `motions/index.json` に任意のモーションid・表示名・manifestへのパスを追加します。
モーション数・コマ数は画面に固定していません。共通の待機idは `idle`。manifestの `loop` / `terminal` / `transitions` で再生方式を指定します。
一覧で選択モーションが未定義の敵は「未定義（待機）」と表示し、敵の切り替え時は待機に戻ります。
`layout.json` に原画のセル・共通倍率・各モーションの採用コマと時間を指定すると、再構築スクリプトも新しい種類に対応できます。


ブラウザー向けIdle RPGのキャラクター素材を確認する、独立した検証画面です。
戦士・魔法使い・パラディン・忍者・呪術師・巫女の横向き待機と共通モーションを制作しています。
待機は戦士を共通の画風参照にし、共通モーションは各キャラクターの承認済み待機を参照として、キャラクターごとのサブエージェントが画像生成を担当しました。

## 起動

Node.js があれば、依存パッケージをインストールせずに起動できます。

```powershell
node server.cjs
```

素材検証はブラウザーで <http://127.0.0.1:4191/index.html> を開きます。ポートは環境変数 `PORT` で変更できます。
`development/labs/index.html` の直接起動ではなく、HTTPサーバー経由で開いてください。

## 検証できること

- 4コマを400msずつ切り替える、1.6秒周期の呼吸ループ
- 再生・停止、前後のコマ送り、任意コマの選択
- 1〜3倍の最近傍表示、左右反転、4種類の背景
- 0.5〜2倍の速度、接地ライン、元デザインとの比較
- 透過PNGシートとフレーム情報JSONの保存
- 6人の切り替え、選択中のキャラに対応する元デザインと生成プロンプト
- 待機・前進・後退・ジャンプ・被撃・ダウンの切り替え、全員を同じ時刻・接地位置で比較
- 「待機を挟んで再生」で開始・終了のつながりを確認。移動は2周期、他は1回を待機の間に再生
- ジャンプ・被撃の単独再生は1回で待機に戻る。ダウンは最終コマで静止し「もう一度」で再開

URL末尾の `#mage`、`#paladin`、`#ninja`、`#shaman`、`#miko` から各キャラを直接開けます。`#mage/jump` や `#miko/down` のようにモーションも指定できます。

Spaceで再生・停止、左右矢印でコマ送り。フォームやボタンにフォーカスしている間は、その標準操作を優先します。
OSで動きを減らす設定が有効な場合は静止表示から始まり、手動で再生できます。

## 素材

キャラクターごとに `public/assets/<id>/` に保存しています。

| キャラ | id | 透過PNGシート | GIFプレビュー | 使用プロンプト |
| --- | --- | --- | --- | --- |
| 戦士 | `warrior` | [PNG](../../public/assets/warrior/warrior-idle.png) | [GIF](../../development/assets/warrior/warrior-idle-preview.gif) | [PROMPT](../../development/assets/warrior/PROMPT.md) |
| 魔法使い | `mage` | [PNG](../../public/assets/mage/mage-idle.png) | [GIF](../../development/assets/mage/mage-idle-preview.gif) | [PROMPT](../../development/assets/mage/PROMPT.md) |
| パラディン | `paladin` | [PNG](../../public/assets/paladin/paladin-idle.png) | [GIF](../../development/assets/paladin/paladin-idle-preview.gif) | [PROMPT](../../development/assets/paladin/PROMPT.md) |
| 忍者 | `ninja` | [PNG](../../public/assets/ninja/ninja-idle.png) | [GIF](../../development/assets/ninja/ninja-idle-preview.gif) | [PROMPT](../../development/assets/ninja/PROMPT.md) |
| 呪術師 | `shaman` | [PNG](../../public/assets/shaman/shaman-idle.png) | [GIF](../../development/assets/shaman/shaman-idle-preview.gif) | [PROMPT](../../development/assets/shaman/PROMPT.md) |
| 巫女 | `miko` | [PNG](../../public/assets/miko/miko-idle.png) | [GIF](../../development/assets/miko/miko-idle-preview.gif) | [PROMPT](../../development/assets/miko/PROMPT.md) |

各フォルダーの共通構成:

| ファイル | 内容 |
| --- | --- |
| `<id>-idle.png` | 640×160、横4コマ、RGBA透過 |
| `idle-01.png`〜`idle-04.png` | 160×160の個別フレーム |
| `<id>-idle-preview.gif` | 確認用の2倍表示GIF。4コマ、1.6秒周期、無限ループ |
| `manifest.json` | 切り出し座標・周期・接地基準・生成原画の位置合わせ情報 |
| `PROMPT.md` | 組み込みimage_genで使用したプロンプト全文 |
| `source/<id>-idle-generated-v1.png` | 2列×2行の生成原画。変更せず保存。実寸はmanifest参照 |

元デザインは `idle_rpg_godot-2/assets/characters/warrior.png` と `motions/warrior_move.png`。
茶色のポニーテール・革鎧・両手剣を保ち、右向きのドット絵テイストにしました。
残り5人の元デザインは、ユーザーがコピーした `public/assets/references/<id>-original.png` を使用しています。
生成原画と使用プロンプトを各担当が保存し、共通ツールで160×160pxの4コマにそろえました。
参考プロジェクト `chocobo_derby` のように、ゲーム本体から独立した素材プレビューを用意しています。
左右反転は同じ素材の表示処理です。別方向の原画は生成していません。

## 素材の再構築

```powershell
npm install
npm run build:sprites
npm run build:preview
```

1人だけ再構築する場合は `npm run build:character -- mage` と `node tools/assets/build-preview.cjs mage` を実行します。
戦士は以前の加工仕様を維持するため `node tools/assets/build-warrior.cjs` を使用します。

PNGの切り出しに `pngjs`、確認用GIFの書き出しに `sharp` を使用します。Codexの同梱ランタイムにある場合は、インストールせずにも再構築できます。
4コマの足元の中心と最下端を基準に位置を補正し、各キャラの全コマ共通倍率で最近傍サンプリングします。
戦士は従来の1/4倍率を維持し、残り5人は高さ約140pxと透明余白に収まる最大倍率を共通で使用します。
生成時の上下セルの境界が中央からずれる場合は、中央近くの透明な帯を検出して切り出します。
帽子・袖・杖などの原画がセル端で欠けていれば検証を失敗させ、画像生成で修正します。
生成原画のRGBとアルファを変更せず、色の塗り直しは行いません。ジャンプ検証では、実際の3姿勢に加えて滞空フレームを38px上へ描画します。
GIFは確認用に256色で書き出します。ゲームに組み込む素材はRGBA透過のPNGです。
素材の生成には組み込み `image_gen` を使いました。再構築スクリプトは画像の再生成をしません。

接地座標は各コマ `(76, 151)`。Canvasでゲーム内の座標 `(x, y)` に描く場合は:

```js
ctx.imageSmoothingEnabled = false;
ctx.drawImage(sheet, frame * 160, 0, 160, 160,
  x - 76 * scale, y - 151 * scale, 160 * scale, 160 * scale);
```

## 現時点の評価範囲

透過、切り出し余白、4コマが異なること、接地位置の一致を再構築時に確認します。
呼吸以外にも、生成原画に由来する顔・髪・装備の細かな輪郭差が残っています。
量産する前に、画風・ゲーム内表示サイズ・この輪郭差が許容できるかを検証画面で確認する段階です。
戦士の個別攻撃3種類を追加し、振り下ろしを使う1対1の戦闘試作を `battle.html` に用意しています。歩行・ジャンプ・被撃・ダウンは以下の共通モーションとして追加しました。


## 共通モーション（6人 × 5種類、計150コマ）

保存先は `public/assets/<id>/motions/<motion>/`。既存の待機24コマを保持しています。

| motion | 内容 | コマ数 | 原寸シート | 時間 | 再生後 |
| --- | --- | ---: | --- | --- | --- |
| `forward` | 右向きの前進 | 8 | 2048×224 | 640ms（80ms × 8） | ループ |
| `backward` | 右を警戒し、守りを保って左へ後退。前進とは別の原画 | 8 | 2048×224 | 720ms（90ms × 8） | ループ |
| `jump` | しゃがみ・踏切 → 飛び上がり・滞空 → 着地 | 3 | 768×224 | 720ms | 待機へ |
| `hit` | のけぞり → 立て直し | 2 | 512×224 | 380ms | 待機へ |
| `down` | のけぞり → 崩れる → 倒れ込む → 横臥静止 | 4 | 1024×224 | 1250ms | 最終姿勢を保持 |

各モーションに `<id>-<motion>.png`、`<motion>-01.png` などの個別コマ、`<id>-<motion>-preview.gif`、`manifest.json`、`PROMPT.md`、生成原画 `source/` があります。
修正時の初稿は別名で保持し、採用版をv1として保存するか、`layout.json` の `source` でv2等を指定しています。全文プロンプトには修正の経緯も残しています。
キャラ単位の `motions/index.json` に5種類のmanifestへの参照があります。

1コマ256×224px、接地基準は `(128, 207)` です。横臥や長い装備が収まるよう、待機より大きな透明キャンバスを使用しています。
検証画面は待機160×160pxも同じ接地位置に配置し、キャラクター本体を拡大し直しません。
モーション内は同じ倍率で切り出し、腰や足元の基準を補正して不要な横ブレを抑えています。

```js
// ゲーム内の接地基準 (x, y) に描画。倍率scaleは整数を推奨。
ctx.drawImage(sheet, frame.x, frame.y, frame.width, frame.height,
  x - manifest.pivot.x * scale, y - manifest.pivot.y * scale,
  frame.width * scale, frame.height * scale);
```

ジャンプ2コマ目の `previewOffset.y = -38` は検証画面/GIF用です。
ゲームではワールド座標のジャンプ物理で高さを付け、検証用オフセットと二重に適用しないでください。
`loop` / `terminal` / `transitions` に再生方式を保存しています。ダウンの `transitions.to` は `null`、復帰モーションは含みません。
移動GIFは無限ループ、ジャンプ・被撃・ダウンGIFは1回再生です。GIFには待機接続を含めず、検証画面で接続確認できます。

```powershell
node tools/assets/build-motions.cjs          # 全30種類のPNG・GIFを再構築
node tools/assets/build-motion.cjs mage      # 魔法使いのPNG5種
node tools/assets/build-motion-preview.cjs mage jump
node --test tests/motion-playback.test.cjs
node tools/assets/check-motion-assets.cjs
```

npmがある環境では `npm run build:motions`、`npm test`、`npm run check:assets` も利用できます。
素材検査は共通30種類150コマと戦士の個別攻撃3種類12コマの寸法・透過・余白・シートとの一致・基準位置・滞空表示の欠け・GIFのコマ数/時間/ループ・原画とプロンプトの存在を確認します。
再生テストはループ境界、ジャンプ/被撃の待機復帰、待機を挟む再生、ダウンが時間経過しても復帰しないことを確認します。

前進・後退は各キャラの待機素材を基準に、キャラごとのサブエージェントが8姿勢の透過原画を制作しています。4列×2行の生成原画から横8コマのシートを構築し、検証画面のコマ一覧は4列×2行で表示します。旧原画は `source/` に残し、採用原画・切り出し位置・共通倍率は各モーションの `layout.json` に記録します。

採用原画の一覧・全プロンプトへのリンク・検査結果・6人の比較GIFは [8枚ループの制作記録](../../output/walk-review/README.md) にまとめています。比較GIFは `node tools/assets/build-walk-review.cjs`、全8枚の拡大一覧は `node tools/assets/build-walk-audit.cjs` で生成できます。

歩行の足IDと8相の基準は [再制作基準](../production/walk-cycle-review.md) に記録しています。左脚Lはカメラ手前、右脚Rは奥に固定し、画面内の前後位置だけが歩行で交換します。1コマ目はL前、5コマ目はR前。3はRがLの奥、7はLがRの手前を低く通過し、8のL前から1の接地へつなぎます。後退も同じ足IDと8相を使います。忍者の網タイツ＋金バックル、呪術師の白紋様＋金/緑装具はLに固定します。各motionの `QA.md` と脚の拡大画像で全8コマの左右を確認します。

靴のつま先は右向き、装備の持ち側は待機素材と同じに固定し、腰を基準に横揺れを抑えます。後退では前方への視線とキャラごとの防御姿勢を維持します。画像生成による細かな輪郭差は目視評価の対象です。ゲーム内の移動速度との最終調整は別途必要です。

## 戦士の個別攻撃（3種類 × 4コマ）

戦士を選ぶと共通モーションに加えて以下の3種類を選択できます。各攻撃は1回再生して待機に戻ります。
「奥」は画面の向こう側、「手前」はこちら側です。剣が奥にあるコマでは戦士も背中側を向き、手前に払うと顔・胸側が見える姿勢へ回転します。動く剣の残像はPNGに含まれます。

| motion | 表示名 | 4コマの流れ | 時間 |
| --- | --- | --- | --- |
| `attack-overhead` | 大剣・振り下ろし | 左上に振りかぶる → 真上やや右・左上からの短い残像 → 残像付き振り下ろし → 低く振り抜く | 680ms |
| `attack-far-to-near` | 大剣・奥 → 手前 | 奥を向いて構える → 奥から払い始める → 手前へ払う → 手前から左へ振り切る | 620ms |
| `attack-near-to-far` | 大剣・手前 → 奥 | 手前で構える → 手前から払う → 奥へ体を回す → 背中を見せて左奥へ振り切る | 620ms |

直接開くURLは <http://127.0.0.1:4191/index.html#warrior/attack-overhead> などです。攻撃を選んだ状態でほかのキャラへ切り替えると待機を表示します。下の一覧も、攻撃がないキャラには待機を表示します。

保存先は `public/assets/warrior/motions/<motion>/`。1コマ256×224px、横4コマの透過PNGシート1024×224px、個別PNG、GIF、manifest、原画、全文プロンプトを保存しています。
振り下ろしは剣先ではなく靴底で接地を合わせるため `layout.json` の足元基準を使用しています。各攻撃内の倍率は全4コマ共通で、残像のRGBとアルファも原画のまま最近傍で切り出します。

12コマの一覧と採用原画・プロンプトは [戦士の攻撃制作記録](../../output/warrior-attacks/README.md) を参照してください。

```powershell
node tools/assets/build-motion.cjs warrior attack-overhead
node tools/assets/build-motion-preview.cjs warrior attack-overhead
node tools/assets/build-attack-review.cjs
node tools/assets/check-motion-assets.cjs
node --test tests/motion-playback.test.cjs tests/enemy-assets.test.cjs
```

キャラ別の制作仕様は `tools/assets/motion-specs.cjs` の `characterSpecs`、利用可能な素材は各キャラの `motions/index.json` に登録しています。再構築・素材検査は共通仕様とキャラ別仕様を合成して処理します。
