# 異次元の女神：修正第1回

2026-10-15 JST。**未採用の修正候補。全素材の修正完了ではない。** 内蔵 image_gen で11ジョブ・計15原画を取得。採用候補の選択は7素材31コマ（静止2点＋5アニメーション29コマ）。破棄した試行も含む15原画43セルを保全した。今回の出力拒否は0件。

- [比較・帰還演出の検収画面](../../../labs/extradimensional-goddess-repair.html)：一次生成と並べて再生、次のコマ、1倍／0.25倍、市松・明暗背景、帰還の舞台合成。
- [背景合成の検収GIF](review/return-composite/preview.gif)：成功したブラウザー検収の9時点から作成。連続フェードの正本は検収画面。
- [修正と検収の記録・残る課題](../../../../docs/production/extradimensional-goddess-repair-review.md)。
- [全文プロンプト](PROMPTS.md) / [試行ごとのプロンプト・参照・SHA256](generation.json) / [選択ジョブと切り出し窓](jobs.json)。
- [素材別検収メモ](review-notes.json) / [実測の透過・余白・外接矩形](qa-mechanical.json) / [再生マニフェスト](review-index.json)。
- [帰還の制作目標・再生順序](return-plan.json)。制作目標と実測位置は区別する。
- [一次生成と全36素材の課題](../first-pass-v1/ISSUES.md) / [固定基準](../v1/README.md)。元画像と一次検収記録は変更していない。

| 素材 | 今回の修正 |
| --- | --- |
| parts/throne / parts/halo | 玉座の大環、天環の小冠を除去 |
| motions/p1-shot | 4コマ。発射時の3本腕を解消 |
| motions/p2-cast | 6コマ。欠落後半を取得し、浮遊姿・開く→押す→低い開掌へ改善 |
| motions/p2-ultimate | 9コマ。欠落中間を取得。胸前→頭上→左右解放→低い開掌へ修正 |
| motions/down | 4コマ。満足げな微笑み→会釈→手振り→上昇へ変更 |
| effects/goddess-return | 6コマ。死亡・破砕FXを静かな帰還口へ変更 |

source/ は返されたPNGをそのまま保存。review/ は固定矩形からの切り出しと比較図・GIF。p2-cast後半だけは全3コマ共通の中央532×532窓を使用し、ズームアウトした画角を合わせた。範囲は各724×724セル内の(96,96)起点で、人物全体を含み、遠い余白の境界線を除外する。原画のRGB／アルファは切り出し後も同一。コマごとの体格拡縮、手足の加工、マスク掃除はしていない。

帰還口のみ、実測の外接矩形中心を表示原点に使用する。原画・コマPNG・全コマ一覧・GIFには元位置を保持。検収画面の単体再生と背景合成に原点を適用する。本体のフェードは再生側で1体だけに掛ける。生PNGの薄い残光を「完全消失」とは扱わない。

本編登録・女神戦・報酬処理は未実装。残る縮尺・髪裾の変化、10%の余白、未修正の待機・移行・流星・中断・他FXと接続してから採用を判断する。

再現コマンド：`node tools/assets/goddess-repair.cjs build`、`node tools/assets/goddess-repair.cjs check`、`node tools/verify/verify-goddess-repair.cjs`、`npm run check:structure`。ブラウザー検証出力はGit管理外の `output/goddess-repair/`。
