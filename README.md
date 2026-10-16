# FORESTBOUND — 放置ARPG

10地域・100ステージ・6職の放置RPG。本編は `public/`、素材制作と検証は `development/` に分けています。

GitHubへの初回登録、LFSの使い方、Cloudflare Pagesへの公開は [運用手順](docs/production/github-lfs-and-cloudflare.md) を参照してください。本編の画像はGit LFS、それ以外の制作画像はGit管理外です。新規cloneの前にGit LFSをインストールしてください。

```sh
git lfs install
git lfs pull
npm ci
npm start
```

本編: [http://127.0.0.1:4191/](http://127.0.0.1:4191/)

本編メニューの「資料館」で、解放済みの味方・敵のモーションとエフェクトを再生・コマ送りできます。[仕様と検証](docs/implementation/museum.md)

素材・動作検証: [http://127.0.0.1:4191/development/labs/index.html](http://127.0.0.1:4191/development/labs/index.html)

`npm run start:game` は本編だけを配信し、開発用の画面・素材にはアクセスできません。古い検証ページのURLは通常起動時のみ新しいURLへ転送します。

| Path | 用途 |
| --- | --- |
| `public/assets/` | 本編で使用する画像・スプライト・実行時マニフェスト |
| `public/js/` | 本編の実装。`data/`・`combat/`・`skills/`・`render/`・`ui/`・`core/` |
| `development/assets/` | 原画・生成記録・配置レシピ・参考画像・検収・プレビュー |
| `development/labs/` | 検証画面と専用JS/CSS |
| `development/records/` | 生成ジョブ・全文プロンプトなどの制作入力 |
| `docs/` | 方針・設計・実装記録・制作手順・履歴 |
| `tools/` | 素材制作・バランス解析・ブラウザ検証・共通ユーティリティ |
| `tests/` | 自動テストと固定入力 |
| `output/`・`tmp/` | 再生成可能な検証出力・一時ファイル。Git管理外 |

[文書一覧](docs/README.md)・[配置と追加の基準](docs/policies/repository-structure.md)・[開発共通方針](AGENTS.md)

```sh
npm run check:structure
npm test
npm run check:assets
```

既存の `build:*`・`test:*`・`check:*`・`audit:*` コマンドは `package.json` にあります。素材ビルドと制作検査にはGit管理外の原画・検収GIFが必要です。新規cloneでの公開準備には `npm run check:structure`・`npm run test:pages`・`npm run build:pages` を使います。`build:pages` は完成素材から `output/pages/` を作り、原画の再生成は行いません。自動テストはゲームロジックと素材を、`check:*ui` は実際のブラウザ表示を検証します。

以前の開発経緯と各機能のコマンドは [開発履歴](docs/history/development-log.md) に保存しています。
