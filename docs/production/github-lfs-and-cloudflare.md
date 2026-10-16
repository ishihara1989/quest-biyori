# GitHub・Git LFS・Cloudflare Pages の運用

2026-10-16採用。GitHubには本編の完成素材と実装・制作記録を保存し、Cloudflare Pagesには本編だけを公開する。

## 保存するもの

| 対象 | 管理方法 |
| --- | --- |
| `public/assets/` の画像 | Git LFS。現在の採用形式はPNGとプロフィールGIF |
| `public/assets/` のJSON | 通常のGit。実行時の登録情報も完成品として保持 |
| 実装・テスト・ツール・文書 | 通常のGit |
| 生成プロンプト・レシピ・座標・制作記録のJSON / Markdown / テキスト | 通常のGit。`development/` の配置を維持 |
| `public/assets/` 以外の画像 | `.gitignore` で除外。原画・候補・検収画像・GIFもローカルだけに残す |
| `node_modules/`・`output/`・`tmp/`・認証情報 | Git管理外 |

画像の判定は `.gitignore`・`.gitattributes`・`tools/lib/repository-images.cjs` の拡張子で揃える。大文字の拡張子にも適用する。生成プロンプトなどを画像の中だけに保存せず、テキストでも記録する。

作業開始時点では本編の画像4,644ファイル・約674 MiB、管理対象外にする開発画像5,401ファイル・約3.85 GiB。管理を外してもローカルの画像は削除しない。再生成で画素単位の同一性は保証されないので、原画そのものが必要な場合は既存のローカルバックアップを使う。完成した本編は原画を再生成せずLFSから復元できる。

## 今回の履歴の扱い

現在の完成状態を親のない新しい `main` の初回コミットにまとめる。旧履歴はローカルの `master` に残し、GitHubには `main` だけをpushする。旧履歴やその中の巨大画像を送らないため、初回pushで `--all`・`--mirror`・`--tags` は使わない。旧 `master` を新しい `main` へmergeしない。

旧履歴を保持しているため、この作業フォルダの `.git` は小さくならない。GitHubへpushした後、別フォルダへ通常cloneすれば新履歴とLFSだけになる。制作画像が必要なら既存バックアップから戻す。旧ブランチへの切替は画像の上書きを伴い得るため、確認は別フォルダへの旧リポジトリのcloneで行う。

## GitHubへの初回登録

Git LFSは通常のGitコミットに小さなポインタを保存し、画像の実体をLFSストレージに置く仕組み。普段の作業フォルダには通常のPNG / GIFが見える。`.gitattributes` とLFSのフックにより、通常の `git add`・`commit`・`push` で両方を送れる。[GitHub公式：LFSの設定](https://docs.github.com/en/repositories/working-with-files/managing-large-files/configuring-git-large-file-storage)

このPCにはGit LFSがインストール済みで、このリポジトリのフックも設定済みにする。GitHub CLIは未導入なのでブラウザで空のリポジトリを作る。ゲームを公開してもソースを公開する必要はないため、まずPrivateでよい。README・ライセンス・gitignoreの自動追加は選ばない。

以下の `YOUR_ACCOUNT/YOUR_REPOSITORY` を作成したリポジトリに置き換え、プロジェクトのルートで実行する。

```powershell
git branch --show-current
git lfs ls-files
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

最初のコマンドが `main` であることを確認する。初回pushではGit Credential Managerのブラウザ認証に従う。GitHubのアカウントパスワードをコマンドへ書かない。LFS実体も初回pushでアップロードされる。GitHubで画像にLFSの表示があることを確認する。`git lfs track` を画像ごとに実行し直す必要はない。

別PCでの復元手順：

```powershell
git lfs install
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
git lfs pull
npm ci
npm start
```

新しいPCには先にGit LFSをインストールする。通常clone時に画像も取得され、`git lfs pull` は不足がある場合の補完にも使える。画像が数行のテキストになっている場合も `git lfs pull` を実行する。

## 日常の変更

通常の開発は [ワークツリーを使う開発手順](../policies/development-workflow.md) に従う。別ワークツリーの作業ブランチで実装・検証・コミットし、ユーザーの明示指示後に `main` へマージする。GitHubは主にバックアップに使い、PRは必須にしない。

作業ブランチでは、今回の変更ファイルだけを確認してステージする。

```powershell
# 以下のパスは今回の変更ファイルに置き換える
git add -- path/to/file1 path/to/file2
git diff --cached --stat
git commit -m "変更内容"
```

`main` のバックアップpushは、マージ指示を受けてローカル統合を終えた後に `git push origin main` で行う。途中ブランチのバックアップは指示がある場合に、そのブランチを指定して行う。バックアップとCloudflare公開は別の操作として扱う。

`public/assets/` に採用したPNG / GIFは自動でLFS管理される。それ以外の画像は `git add .` でも追加されない。`git add -f` で除外を回避しない。採用時には画像を `public/assets/` へ登録し、マニフェストとゲーム側の参照も更新する。

LFSはバックアップと履歴管理に使う。ゲームからGitHubのraw画像URLを読み込まず、Cloudflareに配置した `/assets/...` を読む。ゲームの閲覧でLFSのダウンロード枠を消費せず、clone・CI・公開作業で画像を取得すると消費する。

GitHub FreeではLFSの保存10 GiB、ダウンロード帯域10 GiBが含まれる。ダウンロード枠は請求周期ごとに更新され、画像を変更すると新旧両方の版が保存量に積み上がる。CIによる取得も帯域使用になる。現在の全画像を毎回取得するなら、10 GiBは約15回分が目安で、他のcloneや更新分も同じ枠を使う。利用状況・予算はGitHubのBillingで確認する。[GitHub公式：LFSの課金](https://docs.github.com/en/billing/concepts/product-billing/git-lfs)

## 新規cloneでできる検証

```powershell
npm run check:structure
npm run test:pages
npm run build:pages
```

これらは完成素材とGitに保存したテキストだけで実行でき、npm依存のインストールも不要。`check:structure` は管理外の制作画像が存在しなくても通るが、本編の画像・JSON・モジュールの欠落は引き続きエラーにする。

従来の `npm test`・`check:assets`・素材の `build:*` には原画や検収GIFを使う制作検査が含まれる。新規cloneでそれらを実行するには、必要なローカル制作画像をバックアップから戻すか再生成する。素材変更時の全コマ・連続再生の検収基準は引き続き適用する。公開のために原画の生成や素材ビルドを毎回実行しない。

## Cloudflare Pagesへの公開

2026-10-17以降、**画像の更新がない公開は、今後もローカルからWranglerで直接デプロイする**。画像更新のない公開にGitHub Actionsは使わない。GitHubへのバックアップpushと公開は引き続き別操作とし、公開にはユーザーの指示を受ける。

画像更新を伴う公開には、GitHub ActionsでLFSを取得してからCloudflare PagesのDirect Uploadへ送る既存ワークフローも利用できる。手動公開用の設定は `.github/workflows/deploy-pages.yml`。まだpushだけでは公開しない。[Cloudflare公式：CIからのDirect Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

1. GitHubへの初回pushを完了する。
2. CloudflareでPagesの **Direct Upload** プロジェクトを作成し、本番ブランチを `main` にする。Git連携プロジェクトの作成は選ばない。Wranglerなら `npx wrangler@4 pages project create YOUR_PROJECT_NAME --production-branch=main` で作成できる。
3. 対象アカウントの `Account > Cloudflare Pages > Edit` 権限を持つAPIトークンを作る。
4. GitHubリポジトリの `Settings > Secrets and variables > Actions` に以下を登録する。

| 種類 | 名前 | 値 |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | 作成したAPIトークン |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | CloudflareのアカウントID |
| Variable | `CLOUDFLARE_PAGES_PROJECT` | 作成したPagesのプロジェクト名 |

5. 画像更新のない公開は下記のローカル公開手順で実行する。画像更新を伴いGitHub Actionsを使う場合は、`Actions > Deploy to Cloudflare Pages > Run workflow` で `main` を選んで実行する。
6. 発行された `pages.dev` URLで、ゲームの開始・画像・戦闘・保存・再読込を確認する。

公開データは `output/pages/` に生成する。`public/game.html` をルート用の `index.html` として追加し、開発画像・プロンプト・検証画面・Nodeサーバーは含めない。画像がLFSポインタのままならビルドを失敗させる。Pages Freeの20,000ファイル・単一ファイル25 MiB制限もビルド時に確認する。[Cloudflare公式：Pagesの制限](https://developers.cloudflare.com/pages/platform/limits/)

初回公開の確認後、ユーザーがpush時の自動公開を明示的に希望した場合に限り、ワークフローの `on` に次を追加する。通常のバックアップ運用では手動公開を維持する。

```yaml
  push:
    branches: [main]
    paths:
      - 'public/**'
      - 'tools/deploy/**'
      - 'tools/lib/**'
      - 'tools/verify/check-structure.cjs'
      - 'package.json'
      - '.gitattributes'
      - '.github/workflows/deploy-pages.yml'
```

ローカル公開は、公開対象の `main` がGitHubへバックアップ済みであることを確認し、`npm run check:structure`・`npm run test:pages`・`npm run build:pages` の確認後、`npx wrangler@4 pages deploy output/pages --project-name=YOUR_PROJECT_NAME --branch=main` を実行する。LFS画像の実体が不足している場合だけ、先に `git lfs pull` で補完する。公開のためだけに同じ画像を再取得しない。ブラウザでドラッグして送る方式はファイル数の制約が異なるため使わない。

ブラウザのセーブはオリジン単位のlocalStorageに保存される。localhostのセーブは `pages.dev` に自動移行せず、後から独自ドメインへ変えた場合も別の保存先になる。
