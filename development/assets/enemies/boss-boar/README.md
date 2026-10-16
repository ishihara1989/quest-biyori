# ボスイノシシ

通常イノシシと同じ左向き・やや上から見たドット絵。太い肩、大きな象牙色の牙、赤銅色のたてがみ、赤い目、肩の古傷を持つ大型ボスです。通常姿勢は約343×273pxで、通常イノシシより幅が約1.7倍。

素材ページ: <http://127.0.0.1:4191/enemies.html#boss-boar>。突進予告: <http://127.0.0.1:4191/enemies.html#boss-boar/charge-windup>。

| id | 動作 | コマ | 1周期 | 再生後 |
| --- | --- | ---: | ---: | --- |
| `idle` | 呼吸・耳と尾の揺れ | 4 | 1280ms | ループ |
| `move` | 前脚と後脚の踏み替え | 6 | 720ms | ループ |
| `charge-windup` | 屈み・後ろ片足で地面を蹴る威嚇 | 4 | 800ms | ループ |
| `attack` | 前脚上げ・跳躍・前脚着地・後脚着地 | 4 | 400ms | ループ |
| `hit` | 衝撃・のけぞり・立て直し | 4 | 540ms | 待機へ |
| `down` | 前脚が崩れ・手前へ横倒し | 4 | 1020ms | 最終姿勢を保持 |

全26コマ、1コマ480×320px、接地基準 `(240,303)`。`motions/<id>/` に透過PNGシート、個別PNG、2倍表示GIF、manifestを保存。横シートは移動2880×320px、その他1920×320px。画像生成は組み込み `image_gen`、原画と全文プロンプトは `source/` と [PROMPT.md](PROMPT.md)。

## 移動の前半1〜3／後半4〜6

通常イノシシと同じ方法で、3コマずつ独立して生成し直しました。前半の持ち上げ・接地直前の2姿勢は個別に修正し、後半は反対側の脚の踏み替えを描いています。

| コマ | 前脚と後脚 |
| --- | --- |
| 1 | 右前脚が前の待機姿勢。手前の左後脚は後ろ |
| 2 | 手前の左前脚・左後脚を持ち上げ、奥の脚で支える |
| 3 | 左前脚を前へ伸ばし、左後脚も腹の下へ伸ばす接地直前 |
| 4 | 左前脚・左後脚が前に接地し、奥の脚は後ろ |
| 5 | 奥の右前脚・右後脚を持ち上げ、手前の脚で支える |
| 6 | 右前脚・右後脚が前へ出て、次の1コマ目へつなぐ |

3コマずつの透過PNGは [前半1〜3](../../../../public/assets/enemies/boss-boar/motions/move/boss-boar-move-01-03.png) と [後半4〜6](../../../../public/assets/enemies/boss-boar/motions/move/boss-boar-move-04-06.png)。各1440×320pxで、6コマシートの該当フレームと同じ画素です。6コマ全体は従来どおり720msループ。

[移動プレビュー](http://127.0.0.1:4191/enemies.html#boss-boar/move)、`boss-boar-move-halves-qa.png`（上段1〜3・下段4〜6）で確認できます。全文プロンプトは [WALK-PROMPT.md](WALK-PROMPT.md)。

原画は `source/boss-boar-move-01-03-generated-v3.png` と `source/boss-boar-move-04-06-generated-v1.png`、個別修正は `source/boss-boar-move-frame2-generated-v1.png`・`source/boss-boar-move-frame3-generated-v2.png`・`source/boss-boar-move-frame4-generated-v2.png`。3・4コマ目は通常イノシシの同じ姿勢を参照し、肩から前蹄、腰から後蹄まで手前の脚が連続するよう描き直しました。修正前は肩の毛束と前へ伸びた脚が別々に見える状態でした。

比較画像は `boss-boar-move-root-comparison.png`。上段3コマ目・下段4コマ目、各段は左から通常イノシシ／修正前／修正後。輪郭を比較するため同程度の幅へ最近傍拡大しています。脚の接続はこの画像で目視確認し、自動検査では素材の形式・出力・時間・採用原画の参照を確認しています。

`layout.json` の `walkRegistration` と `source/boss-boar-move-registration-v1.json` が切り出し・倍率・接地合わせを記録します。原画を登録した前後半のPNGを縦に連結して再構築するため、再生成した歩行素材を維持できます。

## 突進予告の4コマ

その場で少し屈み、頭と牙を低くして威嚇します。手前は解剖学的な左脚、奥は右脚。**動かす後ろ足は4コマとも手前の左後脚**です。両前脚と奥の右後脚で体を支えます。

| コマ | 時間 | 左後脚 |
| --- | --- | --- |
| 1 | 0〜220ms | 曲げて前へ持ち上げる |
| 2 | 220〜380ms | 前方で接地する |
| 3 | 380〜560ms | 後方へ伸ばして地面を蹴る |
| 4 | 560〜800ms | 浮かせて前へ引き戻す |

4→1で再び足を持ち上げ、800ms周期で繰り返します。胴体の中心や後ろ足の外接矩形で毎コマを中央寄せすると蹴るたびに全身がずれるため、支持する手前の前蹄を基準に原画を登録しました。頭と接地位置をほぼ一定にしています。

## 地面の予告表示 → 突進への接続

1. ゲーム側で対象と突進経路を決め、ボスを接地点に固定する。
2. `charge-windup` をループ再生し、同じ接地点と向きを基準に地面へ攻撃範囲を重ねる。
3. 任意の予告時間を経過したら、4コマ目の終了で範囲表示を消し、`attack` の1コマ目へ切り替える。
4. `attack` をループ再生しながら、ゲーム側で突進移動と接触ダメージを更新する。

`charge-windup/manifest.json` の `chargeTelegraph.nextMotion` は `attack`、`releaseBoundary` は `cycle-end`。予告の反復回数と攻撃範囲はゲーム側が制御します。素材ページでは予告と突進を別々に確認できます。

**地面の範囲表示・突進経路・当たり判定・ボスAIは、この素材追加には含めていません。** 既存の戦士対スライムの1対1戦闘はそのままです。

攻撃範囲を本体PNGに焼き込まず、地面の別レイヤーとして扱うため、左右反転・攻撃距離の変更にも対応できます。右向きは描画を左右反転し、ゲーム側の経路と範囲表示も同じ向きに合わせてください。

突進は両前脚を上げる→前後の脚を伸ばして跳ぶ→前脚で着地→後脚も着地して屈む4コマ。2コマ目は接地線から32px浮く位置をPNGに含みます。実際の突進移動は `rootMotion.mode: "external"`。ゲーム側から追加のコマ別上下オフセットを加える必要はありません。

## 描画と検証

```js
ctx.imageSmoothingEnabled = false;
const frame = manifest.frames[index];
ctx.drawImage(sheet, frame.x, frame.y, frame.width, frame.height,
  x - manifest.pivot.x * scale, y - manifest.pivot.y * scale,
  frame.width * scale, frame.height * scale);
```

移動1コマ目と被弾4コマ目は待機1コマ目と同じPNG。撃破4コマ目は横倒しの姿勢を保持します。

原画を矩形で切り出し、動作内で共通倍率の最近傍サンプリングで位置合わせします。生成時の薄い背景にじみはアルファ192未満を除外し、残るRGB・アルファは保持。原画の姿勢をコードで合成・反転・補間していません。細かな輪郭や色調の生成由来の変化は残るため、コマ送りで確認できます。

- `boss-boar-charge-windup-qa.png`: 予告の4コマと接地ライン。
- `boss-boar-all-motions-qa.png`: 全26コマ。
- `boss-boar-windup-attack-preview.gif`: 待機→予告2周期→突進3周期→待機の接続確認。

```powershell
node tools/assets/build-enemies.cjs boss-boar
node --test tests/boss-boar-assets.test.cjs
```

再構築は `layout.json` の採用原画・セル境界・倍率・接地アンカー・時間を使用。検査では登録・26コマの寸法・透過・余白・PNGシートと個別PNGの一致・GIFの時間とループ、予告の屈みと位置固定、後脚の4姿勢、待機復帰、跳躍、撃破保持を確認します。
