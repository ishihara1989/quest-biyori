# 高原モーションの受け渡し

2026-10-12 JST。高原7種の48モーション・エフェクト10種、計214コマの素材制作と独立確認画面。組み込み `image_gen` と2体のサブエージェントで採用原画52枚を制作した。高原の戦闘AI、ステージ登録、ドロップ・成長調整は対象外。

素材の入口は [manifest.json](../../development/assets/highland-motions/manifest.json)、確認画面は [highland-motions.html](../../development/labs/highland-motions.html)。全パスをこの素材フォルダ内で閉じ、本編の `assets/enemies/index.json` と `assets/effects/index.json` には追加していない。

## アニメーション設計

ユーザー評価により4足歩行のtrot移行方針を決定した。個別脚の移動量は [3次元投影による座標ガイド](manticore-trot-coordinate-guide.md) で調整し、[旧版・改良試作・連続ガイドの比較](../../development/labs/manticore-trot-guide.html) で確認する。旧版一式は `highland-motions/backups/manticore-trot-v1-20261013/` に保持。計算座標は制御できるが、画像生成による位置の遵守はまだ部分的で、V2は比較用の試作とする。

2026-10-13追記：マンティコアの移動は対角ペアによる6コマtrotの試作へ置換した。初回の3コマ生成では脚の対応が崩れ、最終版は1コマずつ修正した。[試作の位相・検証](manticore-trot-trial.md) と [専用プロンプト](../../development/assets/highland-motions/MANTICORE-TROT-PROMPTS.md) を参照。標準手順への採用は試作の評価後に判断する。

各生成で原画の基準画像を参照し、左向き3/4視点、配色、装備、輪郭を保つ。大きく動く部位は各コマの座標を指定する。全文の指定と修正履歴は [PROMPTS.md](../../development/assets/highland-motions/PROMPTS.md) と [generation.json](../../development/assets/highland-motions/generation.json) に保存。

待機・浮遊・飛行・専用攻撃は4コマを2×2で生成。地上歩行は左脚側3コマ、右脚側3コマの3×1原画を別々に生成し、左右接地・遊脚・接地直前の6位相に並べる。被弾ののけぞり・復帰、撃破の崩れ・終端姿勢を1枚の2×2原画で生成する。

個別行動は [既存企画の高原の項](../design/mid-late-stage-design.md) に合わせる。各行動の構え・予備動作・発動・復帰を分け、角、爪、毒尾、翼の軌道を指定する。休息は新しい技を増やさず待機原画を使う。

## 将来の接続で使う情報

`frameWidth` / `frameHeight` は描画セルのサイズ、`pivot` は論理的な足元。各コマの `bakedOffset` はPNGに適用済み。再生時にもう一度加算しない。ハーピーと小精霊の高さもPNGに登録済み。

`loop` が待機・移動・休息、`terminal` が撃破。被弾と専用行動の `endBehavior` は待機への復帰、撃破は `hold` と `transitions.to = null`。飛行中の動作は `flight`、撃破の着地は `fall.landingFrame` に記録する。

`events` は効果の種類、発生フレーム、プレビュー用の時刻、発生元/対象/投射、扇射の角度を示す。現在の時刻は素材確認用であり、後の戦闘AIとバランス調整で合わせる。三方向の羽根、毒尾の扇射、岩片三発は1つの投射原画をそれぞれの角度・時刻で使う。

本編に組み込む際は本編の行動時間へ合わせ、ハーピーの飛行状態と撃破時の落下・接地、マンティコアの二連爪と毒尾、ストームジャッカルの突進残像を保持する。

## 検証記録

生成原画・各コマ・連続再生で、形、色、視点、脚の位相、顔と胴の位置、透過、角・翼・尾の見切れを確認。機械監査は [qa.json](../../development/assets/highland-motions/qa.json) で全214コマ `passed`、監修結果は [supervision.json](../../development/assets/highland-motions/supervision.json)。

[ブラウザ検証](../../output/highland-motions/browser-qa.json) は52項目 `passed`。全48モーションのコマ送り、共通動作の一括再生、攻撃エフェクトの発生と収束、撃破姿勢の保持、ハーピーの飛行、390px幅の表示を確認した。確認画像は `output/highland-motions/`、7種の待機連続再生は [idle-lineup.gif](../../development/assets/highland-motions/idle-lineup.gif) に保存。
