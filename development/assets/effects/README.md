# 攻撃エフェクト

組み込み `image_gen` で生成したドット絵テイストの独立素材。
確認ページ: <http://127.0.0.1:4191/effects.html>。各フォルダーに透過PNGシート、個別PNG、2倍表示GIF、manifest、生成プロンプトと原画を保存。

| フォルダー | 内容 | コマ | 1コマ | 配置基準 | 時間 |
| --- | --- | ---: | --- | --- | ---: |
| `fruit-bomb` | 小枝・葉・琥珀色の亀裂を持つ木の実 | 1 | 64×64px | 中心 `(32,32)` | 静止素材 |
| `explosion` | 閃光 → 最大火球 → 火と煙 → 火の粉・煙の消散 | 4 | 256×256px | 中心 `(128,128)` | 490ms |
| `root-eruption` | 根の先端 → 伸長 → 最大突出 → 収縮 | 4 | 256×256px | 地面 `(128,240)` | 490ms |

爆発は木・葉・樹の実の破片を含まない汎用素材。火・爆弾などのほかの攻撃に再利用できます。
爆発と根は1回再生し、最終コマの時間が終わったら消去 (`endBehavior: hide`)。プレビューでは消去を450ms挟んで繰り返します。
GIFは確認用。ゲーム素材はRGBA PNGを使い、`imageSmoothingEnabled = false` で描画。

```js
const f = manifest.frames[index];
ctx.drawImage(sheet, f.x, f.y, f.width, f.height,
  x - manifest.pivot.x * scale, y - manifest.pivot.y * scale,
  f.width * scale, f.height * scale);
```

樹の実の軌道・回転・着地・爆発開始、根の出現する標的位置はゲーム側で制御します。
トレントの投げ上げは380ms、根の差し込みは340msに発生イベントを記録。[本体の仕様](../enemies/treant/README.md) を参照。
原画は保持し、出力は最近傍で縮小。生成由来の背景にじみのみアルファ閾値192で除去し、採用ピクセルのRGBとアルファは変更していません。

再構築: `node tools/assets/build-treant.cjs`。検査: `node --test tests/treant-assets.test.cjs`。
