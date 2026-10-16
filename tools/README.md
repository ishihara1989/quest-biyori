# 開発ツール

`deploy/` は本編の配信用パッケージ作成です。`npm run build:pages` でLFS実体と配信上限を確認して `../output/pages/` を作ります。[GitHub・LFS・Cloudflareの運用](../docs/production/github-lfs-and-cloudflare.md)

素材制作は `assets/`、バランス解析は `balance/`、ブラウザ・構造検証は `verify/`、共通処理は `lib/` に置きます。自動テストは `../tests/`、生成ジョブやプロンプト入力は `../development/records/` にあります。

通常は `package.json` の既存npmコマンドから実行します。検証結果は `../output/<機能名>/` に出力してください。[配置基準](../docs/policies/repository-structure.md) に詳細をまとめています。

状態異常抵抗ジェムの画像再登録は `node tools/assets/build-status-resistance-gem.cjs`（初回は生成PNGのパスを引数指定）。`node --test tests/status-resistance.test.cjs` で確率・乗算・地域別付与・保存・画像、`node tools/verify/verify-status-resistance-ui.cjs` で隔離セーブの合成・装着・再読込と1440px／390px表示を確認し、画像を `output/status-resistance/` へ保存します。

`npm run profile:battle` は終盤戦闘の性能調査です。隔離ブラウザの終盤テストセーブで、実時間のフレーム間隔・処理別時間・CPUプロファイル・画像要求を `output/battle-profile/` に記録します。`-- --seconds=20 --cases=epic,farm` で対象を絞れます。`--speed=2` は別名で記録し、`--trace` は追加のChromeトレースを保存します。本編ソースやプレイヤーのセーブは書き換えません。条件・比較項目・実施済み結果は[戦闘性能とUIの調査](../docs/design/battle-performance-and-ui-review.md)を参照してください。

`--label=名前` を付けると、過去の性能計測を上書きせずに比較を残せます。`npm run test:run-flow` は報酬・ジェム一覧・装備定義キャッシュの検証、`npm run check:run-flow-ui` は隔離セーブで戦闘中の育成・自動周回・リザルト・ジェム画面・再読込を確認します。`-- --full-motion` で通常演出も確認できます。画面と結果は `output/run-flow/` に保存します。
