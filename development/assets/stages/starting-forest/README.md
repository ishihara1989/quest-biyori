# 始まりの森

ベルトアクション向けのドット絵風バトルステージ。組み込み `image_gen` で2枚を別々に生成。

| 素材 | ファイル | 寸法 | 用途 |
| --- | --- | --- | --- |
| 遠景 | `forest-distant.png` | 1672×941 | 奥の森。不透明 |
| 地面＋近景 | `forest-ground-near.png` | 1672×940 | 土の移動面と手前の木。木の間は透過 |

画像は生成原画のバイトを変更せず採用。`source/` に原画、`PROMPT.md` に全文プロンプトを保存。
生成由来のアルファ値は保持しており、地面は主に251〜252で、ごくわずかに下のレイヤーが透けます。

## 表示と横ループ

両画像を同じステージ矩形へ描きます。プレビューは1024×576で、寸法の1px差は描画時に合わせています。
描画順は **遠景 → 地面＋近景 → 足元Yでソートしたキャラ**。遠景は地面の0.28倍の速度で移動。
キャラより前にかぶせる独立した草木レイヤーは、この版には含みません。

生成原画の左右端は完全一致しないため、**通常向き → 左右反転 → 通常向き** と交互に繰り返します。
接する端が同じ原画の同じ列になり、色と透過の差がなくなります。1周期は画像幅の2倍、原寸では3344px。
`repeat-x` で同じ向きだけを繰り返すと小さな継ぎ目が残ります。
Canvas用の位置計算は `development/labs/js/stage-tiling.js`、描画例は `development/labs/js/stage-lab.js`。

```js
for (const tile of StageTiling.visibleTiles(cameraX, tileWidth, viewportWidth)) {
  ctx.save();
  ctx.translate(tile.x + (tile.mirror ? tileWidth : 0), 0);
  if (tile.mirror) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(layerImage, 0, 0, tileWidth, viewportHeight);
  ctx.restore();
}
```

## 移動の座標

Xは横に無限、Yは接地点。1024×576表示で推奨の接地点範囲はY=323〜512、奥行き189px。
別サイズではYを高さに比例して換算します。木の根・奥の土手・最前面の草を避けるための推奨範囲で、衝突判定マップではありません。
座標とレイヤー設定は `manifest.json` を参照。

プレビュー: <http://127.0.0.1:4191/stages.html>。地面をクリック・ドラッグするか、矢印キーまたはX/Yスライダーで確認できます。

```powershell
node --test tests/stage-assets.test.cjs
```
