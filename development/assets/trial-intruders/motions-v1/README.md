# 試練追加敵：モーション・SFエフェクト v1

地域敵10体と外宇宙の女神の素材候補。本編への敵登録・戦闘処理の接続は行わない。

[素材検収画面](../../../labs/trial-intruder-motions.html) ／ [企画](../../../../docs/design/trial-intruder-motion-effects.md) ／ [制作記録](../../../../docs/production/trial-intruder-motion-assets.md)

## 対象

- 地域敵：各8種（登場・移動・小被弾・妨害・停止・通常2技・大技）、計80種。
- 外宇宙の女神：G01〜G14の14種。G00は既存待機を参照する。
- FX：共通CF01〜09、地域ごとのF1〜F3、女神OG-F1〜10。部品ごとに123画像クリップと7件の画像再利用へ分ける。
- 待機43枚は `../idle-v1/` の採用候補を使い、原画を変更しない。

最新の出力件数と画像検証結果は [自動検証](review/automatic.json)、目視確認は [検収記録](review/qa.json) を参照。

## ファイル

| 場所 | 内容 |
| --- | --- |
| `motions/<敵>/<ID>/` | 512×512透過PNG、横シート、manifest |
| `effects/<敵>/<ID>/` | 独立FXの透過PNG、横シート、manifest／画像再利用の指定 |
| `source/` | 組み込みImageGenの出力原画。破棄候補は `source/rejected/` |
| `guides/` | 生成前に作った関節・砲口・節と脚の位置ガイド |
| `review/` | 各クリップGIF、暗色／明色の全コマ一覧、検収記録 |
| `plan.json` | コマ別の姿勢・時間・計画座標・本体の移動量 |
| `generation.json` | 全文プロンプト、固定参照、原画、修正理由、生成履歴 |
| `registration.json` | 原画の実測領域、切り出し、倍率、配置、PNGハッシュ |
| `index.json` | 画像の自動検証を通過したクリップ一覧 |

画像・GIFはGit管理外。JSON、文書、生成物を再構築するツールはGitで管理する。原画・ガイド・不採用候補もこの作業ワークツリーに保持し、整理前に画像を保全する。

## 座標と再生

セルは512×512。本体の登録基準は `(256,448)`。アルファ領域の中央Xと最下点を使う代理基準であり、腰・関節の実測値ではない。クリップ内で共通の等方倍率を使う。編集済みの登録画像を再利用する場合は、記録した高さで倍率を保つ。

`frames[].plannedAnchors` は生成前の計画。`measuredAnchors` は出力PNGで確認した位置だけを記録し、未実測は `null` のままにする。代表素材G04／G05／ST-N1／RT-N1／AM-S1の観測方法・誤差範囲は `anchorMeasurement` に保存する。計画値を実測値として転記しない。

`fieldOffset` は本体全体の移動量で、原画に焼き込まない。砲口・刃の根元、飛翔弾、着弾光は別の位置として扱う。FXの `origin` は実測アルファ領域から取った取り付け基準。`mountRotationRadians` がある場合は取り付け時の回転を反映する。

再生は `frameSequence` と各コマの `durationMs` に従う。往復順の弾体・持続光もある。停止素材の末尾は停止姿勢、女神G14の末尾は帰還であり、通常待機へ自動復帰させる用途にはしない。

薬液爆弾3個は同じカプセルを小さく3個配置し、同じ破裂画像を時間差で使う。身体残像は元の透過PNGを遅らせて薄く重ねる。リング砲の充填・射線も単体部品を各砲口へ置く。画像をコードで描き直した輪郭や粒子へ置換しない。

## 再構築と確認

作業ワークツリーで `npm ci` 後、次を実行する。

```text
node tools/assets/build-trial-intruder-motions.cjs
node tools/assets/render-trial-review.cjs
node tools/assets/render-trial-composite.cjs
node tools/assets/render-trial-anchor-grids.cjs
node --test tests/trial-intruder-motions.test.cjs tests/trial-intruder-preview.test.cjs
npm run check:structure
```

部分更新はビルダーの `--only=G04,G05` のように対象を指定できる。原画がないクリップは生成済みとして扱わず、透過・余白・切り分け・全コマ・再生順・重複・GIF枚数と時間を検証する。

素材検収画面は `npm start` で起動するローカルサーバーから開く。単体・画像FX合成・待機接続・大ボスとの縮尺比較・一覧再生、通常／低速／コマ送り、暗色／明色／市松を切り替えられる。ゲームのセーブや戦闘状態は読み書きしない。合成の時間・移動は素材の確認用で、戦闘の判定やバランス値ではない。

原画制作は組み込みImageGenを使用。画像処理は切り出し、最近傍の等方拡縮、平行移動、画像の配置、シート／GIF化。反転・色変更・アルファ値の閾値書き換え・コードによる描き足しは行わない。

純粋なシアン射線 CF04-cyan-ray は2ポッド・4枚板・結晶レンズの各砲口へ個別に置く。複数射線が一体になった画像は合成補助として保持する。ST-M05原画のセル間の細い区切り線は、記録した空白の矩形で除外し、キャラクターの画素を変更しない。
