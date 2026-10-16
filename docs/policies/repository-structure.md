# リポジトリの配置基準

2026-10-13制定。追加・修正時はこの基準と [AGENTS.md](../../AGENTS.md) に従う。

## 本編と開発の境界

GitHub管理は `public/assets/` の画像をGit LFS、それ以外の画像を管理外とする。開発画像はローカルに保持し、プロンプト・レシピ・制作記録は通常のGitで保存する。新規cloneで本編の復元・公開が完結することを保つ。[GitHub・LFS・Cloudflareの運用](../production/github-lfs-and-cloudflare.md)に初回登録と公開手順をまとめる。

`public/` はそのまま本編として配信できる範囲とする。`public/assets/` には採用済みの画像、フレームPNG、スプライトシート、実行時の `manifest.json` / `index.json` を置く。プロフィールの待機アニメーションは各職の `portrait.gif` を本編用として登録する。本編への採用は、ゲームのデータ・ローダーへの登録と関連テストの確認を含む。

原画、参考画像、生成プロンプト、配置レシピ、修正履歴、QA記録、比較図、検証用GIFは `development/assets/` に置く。対応する素材IDと相対ディレクトリは本編側と揃える。例:

```text
public/assets/enemies/boar/motions/move/manifest.json
public/assets/enemies/boar/motions/move/boar-move.png
development/assets/enemies/boar/layout.json
development/assets/enemies/boar/source/...
development/assets/enemies/boar/motions/move/boar-move-preview.gif
```

未採用の候補や制作実験は、`development/assets/<制作テーマ>/` にまとめる。`highland-motions/`、`desert-motions/`、`mid-late-design/` などは制作作業領域であり、本編の登録先ではない。採用時は完成フレームと実行時情報を本編側へ登録する。

デザイン候補から採用したドロップ画像は `public/assets/ui/items/` へ登録する。砂漠・高原の素材画像とプロフィールGIFの登録は `tools/lib/register-ui-art.cjs` にまとめ、元の制作データを本編から直接読み込まない。

実行時マニフェストには原画・プロンプト・プレビューへの相対リンクを残してよい。本編が実際に読み込む `sheet`、`frames[].file`、背景レイヤーなどは `public/` 内で完結させる。制作データへのリンクは来歴確認用で、本編のロード依存にしない。

## 実装とツール

| Path | 追加するもの |
| --- | --- |
| `public/js/data/` | 職業・地域・ステージ・敵などの定義 |
| `public/js/combat/` | 戦闘の状態更新・AI・ダメージ・行動制御 |
| `public/js/skills/` | スキルのパラメータ・発動・モーション対応 |
| `public/js/render/` | Canvas描画と演出 |
| `public/js/ui/` | DOM操作・メニュー・ゲーム画面の接続 |
| `public/js/core/` | 保存・育成・素材・ジェム・再生などの共通機能 |
| `development/labs/` | 検証HTMLと専用 `js/`・`css/` |
| `tools/assets/` | 素材の取り込み・加工・登録・レビュー |
| `tools/balance/` | バランス計算・監査・調整 |
| `tools/verify/` | ブラウザ検証・構造チェック |
| `tools/deploy/` | 本編の配信用パッケージ作成 |
| `tools/lib/` | ツール共通処理 |
| `tests/`・`tests/fixtures/` | 自動テストと再現入力 |

検証画面は本編モジュールを読み込んで再利用し、本編から検証専用コードを読み込まない。ブラウザ用の参照は `/js/...`、`/assets/...`、`/development/...` を使う。古い検証URLの転送はブックマーク互換のためだけに維持する。

素材ツールの共通パス解決は `tools/lib/project-paths.cjs` に置く。`runtimeAsset()` / `developmentAsset()` で新規処理の用途を明示できる。既存パイプラインの `assetPaths` は、同じ素材IDの論理パスを原画・レシピ・GIFなどの種類に応じて両ルートへ振り分ける。独自のパス振り分けを各ツールに追加しない。

素材ツールの出力ディレクトリは `makeAssetDirectory()` で作成し、新規素材でも本編と検収の保存先を揃える。JSONは `writeAssetJson()` を使い、原画やプレビューへのリンクも保存先からの相対パスに揃える。Pythonツールも本編と制作出力のルートを明示する。検証出力は `output/<機能名>/` に書き、生成元ツールと同じ場所へ置かない。

## 文書と未分類

| Path | 基準 |
| --- | --- |
| `docs/policies/` | 継続して守る方針・作業基準 |
| `docs/design/` | 仕様・設計案。採用済みか提案段階かを本文で明示 |
| `docs/implementation/` | 実装済み機能、採用値、動作と検証結果 |
| `docs/production/` | 素材制作手順、引き継ぎ、生成・検収の記録 |
| `docs/history/` | 過去の調整・開発履歴。現行仕様の入口として使わない |
| `docs/unclassified/` | 文書の分類先が未確定な場合 |
| `development/unclassified/` | 用途・採用状態が未確定な素材・制作データ |

分類できないものは上記の `unclassified/` に置き、ファイル冒頭または隣接するメモに「未分類」と、わかっている由来・用途を記す。未分類をルート直下や `public/assets/` に置かない。既存履歴は根拠として保持し、現行方針と混ぜない。

## 追加時の確認

1. 用途に応じたディレクトリへ置き、本編採用が不明なら開発側または未分類へ置く。
2. 参照元、生成ツール、npmコマンド、文書リンクを同時に更新する。
3. 新しい仕様書や制作手順は `docs/README.md`、新しい開発領域は `development/README.md` から辿れるようにする。
4. `npm run check:structure` と関連テストを実行する。モジュールやアセットの移動時は `npm test` も実行する。

関連テストの選定・実行時期・重複実行の扱いは [テストと動作確認の方針](testing-policy.md) に従う。

`check:structure` は本編側への制作ファイルの混入、本編から開発コードへの依存、実行時アセット・ローカル文書リンク・静的モジュール参照の切れを検出する。新しい制作ファイルの命名形式が必要なら共通判定と検査を同時に更新する。
