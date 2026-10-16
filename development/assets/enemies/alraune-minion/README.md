# アルラウネの手下

アルラウネの周囲の小花と同じ、黄色い芯を持つピンクのラッパ状の花が頭。葉と茎の体、ツルの腕、根の足を持つ左向きの植物クリーチャーです。

確認ページ: [アルラウネの手下](http://127.0.0.1:4191/enemies.html#alraune-minion)、[種の発射](http://127.0.0.1:4191/enemies.html#alraune-minion/attack)、[種の画像](http://127.0.0.1:4191/effects.html)。

| id | 動作 | コマ | 周期 | 再生後 |
| --- | --- | ---: | ---: | --- |
| idle | 花・茎・葉の小さな揺れ | 4 | 1200ms | ループ |
| move | 根の足を交互に踏み出す | 4 | 720ms | ループ |
| hit | 茎と花が後ろへしなる | 4 | 600ms | 待機へ |
| down | 萎れる・茎が曲がる・地面に伏せる | 4 | 1420ms | 最終コマを保持 |
| attack | ためる・発射・反動・復帰 | 4 | 640ms | 待機へ |

合計20コマ。各 `motions/<id>/` に横4コマの透過PNG、個別PNG4枚、確認用GIF、manifest.jsonを保存しています。1コマ320×224px、シート1280×224px。共通接地基準は(160,207)、通常の本体の高さは約150pxです。

本体は組み込み image_gen で生成。全文プロンプトは `PROMPT.md`、生成原画は `source/`、切り出しと登録座標は `layout.json`。待機の初期原画v1はデザイン参照、採用したループはv2です。画素は最近傍でサンプリングし、採用したRGBとアルファを保持。生成原画に含まれる薄いマットは既存素材と同じalphaCutoff=192で除外しています。

被弾と攻撃の4コマ目は待機1コマ目を共有し、待機への接続を揃えています。移動は片足支持で本体が左右に跳ねないよう、茎の付け根を揃えて登録しています。撃破の最終姿勢は約58px高で保持。

## 種の発射

2コマ目開始、200msで `spawn-projectile` イベントを1回発生。頭の花の黄色い芯、フレーム内推奨座標(50,108)から左へ発射します。本体に飛ぶ種は焼き込んでいません。

種は `../../../../public/assets/effects/alraune-seed-stream/alraune-seed-stream.png`。アルラウネの3段の弾群から上段をそのまま切り出した、同じ種8粒・横1列の透過画像です。320×64px、pivot=(160,32)。1本を1列の弾群として扱っています。種1粒で使う場合の同じ画素の `seed-single.png`（32×24px）も保存。

素材ページの攻撃プレビューはこの1列を花の口へ重ね、左へ480px/sで移動させます。停止・コマ送り・左右反転・待機を挟む再生に対応。単発攻撃なので、待機への復帰後にも発射済みの列が移動を続け、1200msで消去します。プレビューの左240pxの余白は本体PNGには含まれません。

再構築: `npm run build:alraune-minion` または `npm run build:enemies -- alraune-minion`。
検査: `node --test tests/alraune-minion-assets.test.cjs`。

確認用の一覧は `alraune-minion-all-motions-qa.png`（上から待機・移動・被弾・撃破・攻撃）。種を重ねた実動作GIFは `alraune-minion-attack-with-seeds-preview.gif`。再作成は `node tools/assets/build-alraune-minion-review.cjs`。
