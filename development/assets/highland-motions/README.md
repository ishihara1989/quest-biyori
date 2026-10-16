# 嵐渡りの高原 — モーション素材

2026-10-13 JST更新。高原61〜70を本編へ登録。四足5種は座標ガイド付きtrotへ移行し、旧歩行をバックアップした。[実装・検証](../../../docs/implementation/highland-stage-implementation.md) / [四足歩行の標準手順と必須検収](../../../docs/policies/quadruped-trot-production.md)。

高原7種の48モーションと独立エフェクト10種、計214コマを収録。透過PNGの個別コマ・シート、確認GIF、再生情報を保存した。初回原画は52枚。歩行の追加・修正履歴は `trot/generation.json` と `trot-v2/generation.json` に分けて記録する。

[一括再生・コマ送り](../../labs/highland-motions.html) / [基準画像の切り出し](reference-crops.json) / [全文プロンプト](PROMPTS.md) / [生成履歴](generation.json) / [素材一覧](manifest.json)

[7種の待機GIF](idle-lineup.gif) / [透過・コマ監査](qa.json) / [最終監修](supervision.json)

| 敵 | 個別行動 | 移動 |
| --- | --- | --- |
| ホーンジャッカル | 噛みつき | 座標ガイド付きtrot6コマ |
| 岩角ヤギ | 短突進 | 座標ガイド付きtrot6コマ |
| 風の小精霊 | 風刃・後退 | 浮遊4コマ |
| ストームジャッカル | 直線突進・出血爪・休息 | 座標ガイド付きtrot6コマ |
| アイアンホーン | 角の薙ぎ・長突進・岩片三発・休息 | 座標ガイド付きtrot6コマ |
| ハーピークイーン | 三方向の羽根・風の円・急降下・飛行休息 | 飛行4コマ |
| マンティコア | 爪の二連撃・毒尾の扇射・翼の突風・飛び込み・休息 | 採用したV2＋右後脚の接続修正、6コマ |

マンティコアのV2の前後運動はユーザー評価で採用。①の問題は右後脚の太腿と足の接続であり、足運びを変えずに形状だけ修正した。[旧版との比較](../../labs/manticore-trot-guide.html) / [V2の全文プロンプト](trot-v2/PROMPTS.md) / [検収記録](trot-v2/review.json)。最初の接続修正は第五の足が生えたため不採用とした。

全敵に待機 `idle`、移動 `move`、被弾 `hit`、撃破 `down` を用意した。被弾は2コマで復帰し、撃破は2コマ目の倒れた姿を保持する。休息は待機原画を再利用する。

ハーピーは待機・移動・被弾・専用行動・休息で飛行する。膝を折りたたみ、足は接地させない。撃破時だけ落下・接地する。羽ばたきによる翼端の変化と、顔・胴の位置を分けて登録し、監修補正を [registration-adjustments.json](registration-adjustments.json) に記録する。

風刃、羽根、風の円、翼の突風、毒針、爪斬撃、突進衝撃、岩片、噛みつき衝撃、角の薙ぎは独立した透過PNGアニメーション。三方向射撃と二連爪は発生時刻を各モーションの `events` に保存する。ストームジャッカルの突進の残像は既存の生成コマを重ね、原画の変更は行わない。

## 保存形式

脚別の振幅と3次元投影を計算する [座標ガイド・旧版比較](../../labs/manticore-trot-guide.html)。旧trot一式は [バックアップ](backups/manticore-trot-v1-20261013/backup-info.json)、マンティコアの採用版は `trot-v2/`。他4種は `trot/<enemy>/` にガイド・原画・プロンプト・選択レシピ・6コマ一覧を保存し、旧歩行は `backups/` に残す。計算値と生成PNGの位置は同一ではなく、接地・解剖・コマ間の動きを分けて検収する。

- `references/`：静止デザイン `../mid-late-design/v1/highland/monsters-v2.png` を切り出した基準7種。
- `sources/<enemy>/`：生成原画。歩行は `move-1` / `move-2`、被弾・撃破は `reaction` の前半・後半。
- `enemies/<enemy>/motions/<motion>/`：個別の透過PNG、横一列のPNGシート、確認GIF、`manifest.json`。
- `effects/<effect>/`：独立エフェクトの同じ書き出し形式。
- `enemies/<enemy>/registered/`：透明な隙間で分割し、登録用に並べ直した原画。

PNGは原画のRGBAを使い、切り出し・位置登録・最近傍の縮小で書き出す。キャラは低alphaの背景ノイズを除外する既存の閾値192、発光エフェクトはalpha1以上を保持する。GIFは確認用の256色パレット。

## 再構築と確認

```sh
node tools/assets/build-highland-motions.cjs
node tools/balance/audit-highland-motions.cjs
node tools/assets/review-highland-frames.cjs
node tools/assets/build-highland-lineup.cjs
# npm start または既存サーバー起動後
node tools/verify/verify-highland-motion-ui.cjs
```

再構築は保存済みの原画を処理する。画像の再生成は行わない。ゲーム本編・敵やエフェクトの共通catalog・既存の確認ページには登録しない。

214コマの機械監査は `passed`。全48モーションのコマ送り、共通動作の一括再生、エフェクトの発生と収束、撃破姿勢の保持、ハーピーの飛行、スマホ幅を含むブラウザ検証52項目も通過した。検証結果と確認画像は `output/highland-motions/` に保存。

監修判定は `approved-for-staging`。基準画像・原画・contactシート・最終プレビュー画像の目視と、自動再生・コマ送り検証を併用した。手動目視と自動検証の範囲は `supervision.json` に分けて記録。
