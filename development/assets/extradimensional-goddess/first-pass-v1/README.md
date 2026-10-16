# 異次元の女神：一次生成 v1

2026-10-15 JST。**未採用の制作候補。一次生成と1回の検収のみ。**

| 区分 | 予定 | 取得 |
| --- | ---: | ---: |
| 本体モーション（追加中断入口を含む） | 62コマ | 56コマ |
| 女神専用FX | 46コマ | 46コマ |
| 分離部品 | 9点 | 9点 |
| 合計 | 117セル | 111セル |

内蔵 image_gen の43ジョブを各1回試行し、41原画を保存。2ジョブ6コマはサービスの出力拒否。画像の修正・再生成・本編登録は行っていない。歴代ボス20体は既存モーション・FXがあり、在庫と接続課題を記録した。

- [課題一覧](ISSUES.md)：優先度と該当コマ。
- [検収画面](../../../labs/extradimensional-goddess-first-pass.html)：通常／0.25倍再生、全コマ、明暗背景。
- [歴代ボスの再利用元](PHANTOM-REUSE.md)：20体の本体・FX・原点・元イベント時刻。
- [全文プロンプト](PROMPTS.md) / [生成ジョブ](jobs.json) / [生成来歴・SHA256](generation.json) / [失敗記録](generation-failures.json)。
- [一次検収集計](qa.json) / [セル別機械検査](qa-mechanical.json) / [素材別目視メモ](review-notes.json) / [再生一覧](review-index.json)。
- [元の静止基準](../v1/README.md) / [制作計画](../../../../docs/production/extradimensional-goddess-asset-plan.md) / [引き継ぎ](../../../../docs/production/extradimensional-goddess-first-pass-review.md)。

source/ は返されたPNGをバイト単位で保持。review/ は固定の等分矩形による切り出し、全コマ一覧、検収GIF。セル越境を含むため実行時フレームとして採用しない。背景除去・アルファ掃除・手足修正・コマごとの拡縮や再中心合わせは実施していない。GIFは検収用に反復し、本来の一回動作をループ仕様へ変更しない。欠落区間の画像は補完していない。

## 原画一覧

| ジョブ | セル | 原画 | 結果 |
| --- | ---: | --- | --- |
| parts/body-seated | 1 | [PNG](source/parts/body-seated.png) | 初稿保存・要課題確認 |
| parts/body-floating | 1 | [PNG](source/parts/body-floating.png) | 初稿保存・要課題確認 |
| parts/throne | 1 | [PNG](source/parts/throne.png) | 初稿保存・要課題確認 |
| parts/halo | 1 | [PNG](source/parts/halo.png) | 初稿保存・要課題確認 |
| parts/ground-shadow | 1 | [PNG](source/parts/ground-shadow.png) | 初稿保存・要課題確認 |
| parts/halo-node | 1 | [PNG](source/parts/halo-node.png) | 初稿保存・要課題確認 |
| parts/debris | 1 | [PNG](source/parts/debris.png) | 初稿保存・要課題確認 |
| parts/target-star | 1 | [PNG](source/parts/target-star.png) | 初稿保存・要課題確認 |
| parts/eclipse-rim | 1 | [PNG](source/parts/eclipse-rim.png) | 初稿保存・要課題確認 |
| motions/p1-idle | 4 | [PNG](source/motions/p1-idle.png) | 初稿保存・要課題確認 |
| motions/p1-shot | 4 | [PNG](source/motions/p1-shot.png) | 初稿保存・要課題確認 |
| motions/p1-snap | 4 | [PNG](source/motions/p1-snap.png) | 初稿保存・要課題確認 |
| motions/p1-hit | 2 | [PNG](source/motions/p1-hit.png) | 初稿保存・要課題確認 |
| motions/phase-rise-1 | 3 | [PNG](source/motions/phase-rise-1.png) | 初稿保存・要課題確認 |
| motions/phase-rise-2 | 3 | [PNG](source/motions/phase-rise-2.png) | 初稿保存・要課題確認 |
| motions/phase-rise-3 | 3 | [PNG](source/motions/phase-rise-3.png) | 初稿保存・要課題確認 |
| motions/p2-idle | 4 | [PNG](source/motions/p2-idle.png) | 初稿保存・要課題確認 |
| motions/p2-drift | 4 | [PNG](source/motions/p2-drift.png) | 初稿保存・要課題確認 |
| motions/p2-meteor-1 | 3 | [PNG](source/motions/p2-meteor-1.png) | 初稿保存・要課題確認 |
| motions/p2-meteor-2 | 3 | [PNG](source/motions/p2-meteor-2.png) | 初稿保存・要課題確認 |
| motions/p2-cast-1 | 3 | [PNG](source/motions/p2-cast-1.png) | 初稿保存・要課題確認 |
| motions/p2-cast-2 | 3 | — | 出力拒否・未生成 |
| motions/p2-ultimate-1 | 3 | [PNG](source/motions/p2-ultimate-1.png) | 初稿保存・要課題確認 |
| motions/p2-ultimate-2 | 3 | — | 出力拒否・未生成 |
| motions/p2-ultimate-3 | 3 | [PNG](source/motions/p2-ultimate-3.png) | 初稿保存・要課題確認 |
| motions/p2-hit | 2 | [PNG](source/motions/p2-hit.png) | 初稿保存・要課題確認 |
| motions/p2-break | 3 | [PNG](source/motions/p2-break.png) | 初稿保存・要課題確認 |
| motions/p2-break-overhead | 1 | [PNG](source/motions/p2-break-overhead.png) | 初稿保存・要課題確認 |
| motions/down | 4 | [PNG](source/motions/down.png) | 初稿保存・要課題確認 |
| effects/star-bolt | 3 | [PNG](source/effects/star-bolt.png) | 初稿保存・要課題確認 |
| effects/star-impact | 3 | [PNG](source/effects/star-impact.png) | 初稿保存・要課題確認 |
| effects/snap-glint | 3 | [PNG](source/effects/snap-glint.png) | 初稿保存・要課題確認 |
| effects/star-mirror-open | 4 | [PNG](source/effects/star-mirror-open.png) | 初稿保存・要課題確認 |
| effects/phantom-recall | 4 | [PNG](source/effects/phantom-recall.png) | 初稿保存・要課題確認 |
| effects/homing-meteor | 3 | [PNG](source/effects/homing-meteor.png) | 初稿保存・要課題確認 |
| effects/meteor-impact | 3 | [PNG](source/effects/meteor-impact.png) | 初稿保存・要課題確認 |
| effects/rift-open | 4 | [PNG](source/effects/rift-open.png) | 初稿保存・要課題確認 |
| effects/rift-cut | 3 | [PNG](source/effects/rift-cut.png) | 初稿保存・要課題確認 |
| effects/celestial-wave | 3 | [PNG](source/effects/celestial-wave.png) | 初稿保存・要課題確認 |
| effects/zero-converge | 4 | [PNG](source/effects/zero-converge.png) | 初稿保存・要課題確認 |
| effects/phase-awaken | 3 | [PNG](source/effects/phase-awaken.png) | 初稿保存・要課題確認 |
| effects/goddess-defeat-1 | 3 | [PNG](source/effects/goddess-defeat-1.png) | 初稿保存・要課題確認 |
| effects/goddess-defeat-2 | 3 | [PNG](source/effects/goddess-defeat-2.png) | 初稿保存・要課題確認 |

## 再現コマンド

生成は自動再実行しない。検収派生物と記録の再現だけを行う。

```powershell
node tools/assets/review-goddess-first-pass.cjs
node tools/assets/goddess-first-pass-review-notes.cjs
node tools/assets/report-goddess-first-pass.cjs
node tools/assets/check-goddess-first-pass.cjs
npm run check:structure
```
