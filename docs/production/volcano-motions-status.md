# 火山モーション：修正・検収完了

2026-10-15 JST。中断していた生成・修正を再開し、**7体・47本体モーション174コマ、15エフェクト60コマ、合計62クリップ234コマ**を検収。本編の地域9「紅蓮の竜脈」へ採用した。[本編実装と検証](../implementation/volcano-stage-implementation.md)。

## 保存先と生成履歴

- 制作データ：[volcano-motions/v2](../../development/assets/volcano-motions/v2/plan.json)。固定リファレンス、座標ガイド、原画、全文プロンプト、入力画像のSHA256、配置レシピを維持した。
- 採用指定：[selection.json](../../development/assets/volcano-motions/v2/selection.json)。修正版は新しい名前で保存し、初稿・不採用候補も残した。処刑者とドラゴンガールの歩行後半は、支持脚が交代しなかったため単コマ生成へ切り替えた。
- 最終判定：[review-notes.json](../../development/assets/volcano-motions/v2/review-notes.json)、[qa.json](../../development/assets/volcano-motions/v2/qa.json)。全クリップのfingerprintと検収判定が一致する。
- 過去の残件：[revision-backlog.json](../../development/assets/volcano-motions/v2/revision-backlog.json)。元の問題・指示を残して解消済みと記録した。生成待ちは0件。
- 本編登録：[runtime-registration.json](../../development/assets/volcano-motions/v2/runtime-registration.json)。採用PNGと実行時マニフェストは本編領域。原画・検証GIFは開発領域へ保存した。

## 修正と目視検収

四足4体は手前LF/LH・奥RF/RHの接続を付け根から足先まで追い、対角ペアA（LH+RF）とB（LF+RH）の交代、3→4の境界、6→1のループを確認した。ラヴァ・幼火竜・マグマの6コマ目、ドラゴンの5コマ目を修正。二足の歩行後半も支持脚が交代するものへ置き換えた。

[足先の実測](../../development/assets/volcano-motions/v2/paw-measurements.json)は完成512×512 PNGの近似座標、目視誤差±8px。計算上の座標ガイドとは区別した。[歩行の位置合わせ](../../development/assets/volcano-motions/v2/walk-registration-measurements.json)と[エフェクトの発生点](../../development/assets/volcano-motions/v2/effect-registration-measurements.json)も実画像で測定。矩形切り出し、最近傍縮小、画像全体の位置合わせだけを行い、脚の切り貼りや連結成分マスクは使っていない。

処刑者の斧・柄・手・マントの見切れと接続を修正。ドラゴンガールの本体から爪の外部軌跡を除き、独立FXとして再生する。着地衝撃は四辺の余白を確保して再生成、破甲アイコンは盾全体を維持する点滅へ変更。火炎扇は小→中→最大→火の粉の順序へ揃えた。

固定リファレンスと形・配色・明暗・視点を比較し、透過、武器・翼・尾・炎の余白、コマ順、通常1×と低速0.25×、反転・戦闘縮尺を確認した。待機→行動→待機、被弾、中断、7体の撃破終端保持、発生点→弾道→着弾→床まで確認。双溶岩弾0.8秒、竜姫の竜息0.9秒、ドラゴンの竜息1秒、三巣0.9秒を区別した。

## 検証と再利用

全62クリップ・234コマのブラウザ確認は読込・実行エラー0件。1440pxと390pxで横はみ出しなし。本編では19攻撃と逆向きブレス、共通196ポーズの反転・フレーム選択を確認した。キャプチャと検証結果は `output/volcano-motions/browser/`、`output/volcano-implementation/`。

```powershell
node tools/assets/build-volcano-motions.cjs
node tools/verify/verify-volcano-motions.cjs --complete --offline-browser
npm run test:volcano-candidates
npm run build:volcano
npm run check:structure
```

原画を変更する場合は再検収し、fingerprintが一致する完成素材だけを `register-volcano.cjs` で採用する。開発用 `ready/` は検収コピー、本編の実行時登録とは別。`--offline-browser` はChromeからループバックHTTPが拒否される環境用で、実ファイルを変更せず同じHTTPオリジンの応答として供給する。

`npm start` 後の[専用検収画面](../../development/labs/volcano-motions.html)で、状態切替、コマ送り、速度、反転、縮尺、エフェクト、中断、撃破を確認できる。
