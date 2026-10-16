# マンティコアのtrot試作

2026-10-12開始、2026-10-13検証。高原のマンティコアだけで検証する。ユーザー評価によりtrotへ移行する方針を決定。脚ごとの振幅・位置精度は引き続き改良する。

左向き3/4視点で、手前を解剖学的な左脚側、奥を右脚側とする。
対角ペアAは左後脚＋右前脚、ペアBは左前脚＋右後脚。
「閉じる」は同じ側の前後の足先が胴の中央へ近づくこと、「開く」は離れること。

| コマ | 手前／奥 | 浮いている脚 | 接地している脚 |
| --- | --- | --- | --- |
| 1 | 中立／中立 | A：左後＋右前 | B：左前＋右後 |
| 2 | 閉じる／開く | A：左後＋右前 | B：左前＋右後 |
| 3 | 閉じる／開く | B：左前＋右後 | A：左後＋右前 |
| 4 | 中立／中立 | B：左前＋右後 | A：左後＋右前 |
| 5 | 開く／閉じる | B：左前＋右後 | A：左後＋右前 |
| 6 | 開く／閉じる | A：左後＋右前 | B：左前＋右後 |

1→2でAを前へ振り出し、2→3で同じ開閉姿勢のまま支持脚を交換する。
3→4→5でBを前へ振り出し、5→6で同じ開閉姿勢のまま支持脚を交換する。
6→1で中立に戻る。各120ms、全720ms。

基準は `development/assets/highland-motions/references/manticore.png`。
顔、胴、翼、尾は固定し、四脚の位相を優先する。前半1〜3と後半4〜6を別々に生成し、後半にも同じ基準画像を渡す。
接地線は手前と奥で遠近差を持たせ、浮いた足を明確に曲げて持ち上げる。
コマ別の指定と登録座標は素材フォルダの `manticore-trot.json`、生成プロンプトは `MANTICORE-TROT-PROMPTS.md` に記録する。

初回の3コマ生成では脚の手前／奥の対応が崩れたため、最終6コマは1コマずつ修正した。⑥の余分な前脚を含む生成も不採用とし、⑤だけを編集対象にして4本の脚の上下交換を指定すると改善した。
最終原画は `sources/manticore/move-trot-frame-1-generated.png` 〜 `move-trot-frame-6-generated.png`。
顔の目の位置を登録基準として揃え、各コマの足先を基準に胴全体がずれるのを抑える。

PNGの透過・寸法・見切れ、6コマのコマ送り、720ms周期の3周連続再生を検証した。高原全体214コマの機械監査も通過。
コマ一覧を目視し、4本の脚の接続、対角ペアの接地交換、手前／奥の開閉、色調と翼・尾の見切れを確認。足先と胴の形状には生成由来の小さな差が残るため、この試作の再生を評価して標準化を判断する。

確認画面: `http://127.0.0.1:4191/highland-motions.html?enemy=manticore&motion=move`
追加書き出し: `enemies/manticore/motions/move/trot-preview.gif`、`trot-contact.png`。
再構築: `node tools/assets/build-manticore-trot.cjs` → `node tools/assets/review-manticore-trot.cjs`。
確認: `node tools/balance/audit-highland-motions.cjs`、`node tools/verify/verify-manticore-trot-ui.cjs`。

既存の `move` を試作へ置き換え、独立確認画面の再生とコマ送りで確認する。

## 脚ごとの移動量の改良

2026-10-13、ユーザーから右後脚①→②の過大な移動、左前脚③→④→⑤の不均一な進み方の指摘を受けた。
この版は `public/assets/highland-motions/backups/manticore-trot-v1-20261013/` に原画・再生素材・登録画像・設定・プロンプトをまとめて保存し、23ファイルのハッシュを検証した。
改良は [3次元座標からの投影ガイド](manticore-trot-coordinate-guide.md) と [比較画面](../../development/labs/manticore-trot-guide.html) で進める。比較画面では4脚の振幅と持ち上げ量を個別に調整し、6コマの座標をJSONで保存できる。
画像生成の座標遵守は計算モデルの正しさとは別に扱う。生成用ガイド、原画、目標と実測の差を `public/assets/highland-motions/trot-v2/` に保存する。
