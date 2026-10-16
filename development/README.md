# 開発用の素材と検証

この領域の画像・GIFはローカル専用でGit管理外です。プロンプト・レシピ・制作記録・検証コードはGitに保存します。新規cloneでは原画やプレビューが表示されないため、制作を続ける場合は必要な画像をバックアップから戻すか再生成してください。[GitHub・LFS・公開の運用](../docs/production/github-lfs-and-cloudflare.md)

共通エフェクト6種・24コマの[原画・全文プロンプト](assets/effects/common/generation.json)、[全コマ・連続再生の検収画面](labs/common-effects.html)、[72項目の画像化と制作記録](../docs/production/common-image-effects.md)。本編登録は `npm run build:common-effects`。

砂漠以降と女神の6職×武器／防具、全72枚の専用装備は [検収一覧](assets/ui/equipment/late-review.png)と[制作・全文プロンプト・再構築手順](../docs/production/equipment-icon-refinement.md)に保存。本編登録は `npm run build:late-equipment-icons`。

最終裏ボス「異次元の女神」のステージ・基本状態2種は [制作候補 v1](assets/extradimensional-goddess/v1/README.md)。[企画](../docs/design/extradimensional-goddess-design.md)と[モーション・FX制作計画](../docs/production/extradimensional-goddess-asset-plan.md)を保存しています。

モーション・FXの [一次生成111セルと課題](assets/extradimensional-goddess/first-pass-v1/README.md) は2026-10-15に1回検収済み。出力拒否だった6コマは[修正第1回](assets/extradimensional-goddess/repair-v2/README.md)で取得し、7素材31コマを修正・検収しました。[比較検収画面](labs/extradimensional-goddess-repair.html)で満足して異次元へ帰る演出、全コマ・通常／低速再生・明暗背景を確認できます。全素材の修正完了と本編取り込みは未実施です。

本編は `../public/`、このディレクトリは制作・検証用です。[配置基準](../docs/policies/repository-structure.md) を参照してください。

| Path | 内容 |
| --- | --- |
| `assets/` | 原画・参考画像・配置レシピ・生成プロンプト・検収・GIF |
| `labs/` | 動作・戦闘・スキル・装備・ステージの検証ページ |
| `records/` | 生成ジョブの入力と一括生成プロンプト |
| `artifacts/legacy/` | 以前 `tmp/` に保存されていた検証資料。履歴として保持 |
| `unclassified/` | 分類先・採用状態が未確定のデータ |

`npm start` で `/development/labs/index.html` から確認できます。高原・砂漠・氷河の確認はそれぞれ `/development/labs/highland-motions.html`、`/development/labs/desert-motions.html`、[氷河の素材とモーション](labs/glacier-assets.html)。`npm run start:game` は開発領域を配信しません。

生成結果は `assets/` または `records/` に保存し、完成スプライトは素材ビルドで本編側に登録します。作業途中のレビュー出力はGit管理外の `../output/<機能名>/` に置きます。

状態異常抵抗ジェム「浄護」の[生成プロンプト・静止画検収](assets/ui/gems/status-resistance-generation.json)と[原画](assets/ui/gems/source/status-resistance-v1.png)を保存しています。本編では透過128px PNGを登録済みです。

火山・魔王城の初回候補は `assets/late-stage-first-pass/v1/`。修正前の原画・参照・全文プロンプト・課題一覧を保存します。[素材検収画面](labs/late-stage-first-pass.html)と[引き継ぎ](../docs/production/late-stage-first-pass-handoff.md)から確認できます。

魔神の二腕・無面・浮遊の修正版は `assets/demon-god-redesign/v2/`。[専用検収画面](labs/demon-god-redesign.html)で9モーション・32コマと既存エフェクトを確認できます。[制作・再利用の記録](../docs/production/demon-god-redesign.md)。

魔王城の修正・検収済み素材は `assets/demon-castle-motions/v2/` に保存。魔神を除く6体39モーションと17エフェクト、計56クリップ205コマ。[修正版の検収画面](labs/demon-castle-motions.html)、[検収記録と再現手順](../docs/production/demon-castle-motions-status.md)から確認できます。初稿と魔神の固定基準は維持しています。[魔王城の本編実装](../docs/implementation/demon-castle-stage.md)へ採用しました。

火山の修正版は `assets/volcano-motions/v2/`。62クリップ・234コマの修正と検収を完了し、本編へ採用しました。[専用検収画面](labs/volcano-motions.html)、[制作と検収](../docs/production/volcano-motions-status.md)、[本編実装](../docs/implementation/volcano-stage-implementation.md)から確認できます。

混沌の門の背景・透過門の原画、全文プロンプト、登録記録は `assets/stages/chaos-gate/`。本編素材は `npm run build:chaos-gate` で登録します。[実装・収支・検証記録](../docs/implementation/chaos-gate.md)。

異次元の女神の本編採用素材、指パッチンの追加生成、縮尺・原点の登録と54コマの検収資料は [runtime-v3](assets/extradimensional-goddess/runtime-v3/README.md)。`npm run build:goddess` で再現します。[実装・難度・検証](../docs/implementation/extradimensional-goddess.md)。

女神の浮遊待機4コマ・手振り後の180度ターンは [motion-v4](assets/extradimensional-goddess/motion-v4/README.md)。本編は計59コマ。`npm run build:goddess-motion` と `npm run check:goddess-motion-ui` で対象の登録・検証を再現できます。

エピックジェム12種・新レジェンダリー・残滓・女神強化ページの全17アイコンは [制作・原画・プロンプト・検収](assets/ui/epic-gems/README.md)に保存。本編登録は `npm run build:epic-gems`、[実装記録](../docs/implementation/epic-gems.md)。
