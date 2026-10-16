# 毒の沼地の敵キャラ

組み込み image_gen で敵の原画・各動作・攻撃エフェクトを生成。画像は `public/assets/enemies/<id>/` と `public/assets/effects/<id>/` に保存し、元画像、生成プロンプト、透過PNGの個別コマと横並びシート、GIF、manifestを同梱する。

| 敵 | 共通動作に追加する動作 | 接続 |
| --- | --- | --- |
| ギガトード | 毒液を吐く | 毒液弾 → 着弾飛沫・毒 |
| キングトード | 毒液を吐く・舌攻撃 | 通常の毒蛙より大型 |
| 泥の手 | パンチ・掴む | 命中時だけ泥の拘束・移動停止 |
| 泥巨人 | パンチ・振りかぶりループ・振り下ろし | 振りかぶり2ループ → 3倍威力の振り下ろし・泥の衝撃波 |
| スケルトン | 剣の振り下ろし | 左脚側3コマ＋右脚側3コマの歩行 |
| リッチ | 杖を振る・詠唱ループ・杖を振り下ろす | エネルギー弾、詠唱2ループ → 闇の大魔法 |
| ヒュドラ | 連続攻撃ループ・毒ガス溜めループ・毒ガスブレス | 5本首、2ループで8回攻撃、毒ガス溜め2ループ → ブレス・毒 |

全7種に待機ループ・移動ループ・被弾・撃破。43モーション174コマ、エフェクト9種36コマ。撃破は最後のコマで保持し、単発の動作は同一の待機コマに戻る。泥巨人の振り下ろしの先頭は振りかぶり、ヒュドラのブレスの先頭は毒ガス溜めの先頭と共通にする。

`/enemies.html` でコマ送り・左右反転・速度変更・待機接続・エフェクトを表示。`/effects.html` で個々のエフェクトを表示・保存。`/swamp.html` は7種の敵と戦士の戦闘確認ページで、クリック・方向キーで対象を移動、攻撃の選択、被弾・撃破、戦士の自動攻撃を確認できる。本編 `/game.html` にも地域2として接続済み。ステージ構成・召喚・報酬・装備ツリーは [毒の沼地の本編実装](../implementation/swamp-progression.md) を参照。

戦闘ロジックは `public/js/combat/swamp-combat.js`。固定60Hzで進行し、拘束は命中時の座標を2200ms保持する。重ね掛けは同じ座標を維持して期限だけ延長する。死亡・戦闘終了で解除。毒は4秒間・1秒刻みでダメージを受け、継続ダメージの重ね掛けは期限と威力を更新する。弾は発射時の位置へ飛ぶため回避でき、大技は予告時の対象位置に発動する。

生成の座標・分割・リファレンスは `tools/assets/swamp-specs.cjs`、生成要求は `development/records/swamp-generation.json`、実際の追加生成・修正プロンプトは各 `source/*prompt.txt`。スケルトンは3コマずつの生成で足の踏み替えが不十分だったため、上半身リファレンスと脚の座標ガイドを用いて1コマずつ再生成し、前後半各3コマへ組み直した。元画像6枚と `walk-positions.json` を残す。切り出しは `tools/assets/build-swamp.cjs`。セルの境界をまたぐが分離している姿勢は連結領域で抽出し、元のRGBAを保って余白を設ける。接地点に登録してnearest-neighborで縮小する。脚・武器・飛沫の見切れはビルド時と検査で拒否する。

再構築: `npm run build:swamp`。検査: `npm run test:swamp`。ブラウザー確認: `npm run check:swamp-ui`。

## 保存した素材と生成プロンプト

敵素材: [`public/assets/enemies/`](../../public/assets/enemies/index.json)。全文プロンプトは各敵の `PROMPT.md`: [ギガトード](../../development/assets/enemies/giga-toad/PROMPT.md)、[キングトード](../../development/assets/enemies/king-toad/PROMPT.md)、[泥の手](../../development/assets/enemies/mud-hand/PROMPT.md)、[泥巨人](../../development/assets/enemies/mud-giant/PROMPT.md)、[スケルトン](../../development/assets/enemies/skeleton/PROMPT.md)、[リッチ](../../development/assets/enemies/lich/PROMPT.md)、[ヒュドラ](../../development/assets/enemies/hydra/PROMPT.md)。

エフェクト素材: [`public/assets/effects/`](../../public/assets/effects/index.json)。全文プロンプト: [毒液弾](../../development/assets/effects/toad-poison-bolt/PROMPT.md)、[毒液の飛沫](../../development/assets/effects/toad-poison-impact/PROMPT.md)、[泥の拘束](../../development/assets/effects/mud-bind/PROMPT.md)、[泥の衝撃波](../../development/assets/effects/mud-slam-impact/PROMPT.md)、[闇のエネルギー弾](../../development/assets/effects/lich-energy-bolt/PROMPT.md)、[闇の弾の衝撃](../../development/assets/effects/lich-energy-impact/PROMPT.md)、[闇の大魔法](../../development/assets/effects/lich-dark-magic/PROMPT.md)、[毒ガスの溜め](../../development/assets/effects/hydra-poison-aura/PROMPT.md)、[毒ガスブレス](../../development/assets/effects/hydra-poison-breath/PROMPT.md)。

敵本体が含まれたエフェクト原画5種は、人物やモンスターを参照せず単体エフェクトとして再生成。初版は `source-initial-generated.png`、採用原画は `source-generated.png`、採用プロンプトは `source-revision-prompt.txt` に保存する。

## ヒュドラの首の修正

待機・移動・被弾を、各コマで左向きの5本首に統一。被弾2コマ目の余分な首を除去。採用原画は `source/idle-facing-left-generated-v2.png`、`source/move-facing-left-generated-v3.png`、`source/hit-five-left-generated-v2.png`。対応する `*-prompt.txt` に全文プロンプトを保存し、元原画と移動v2も残す。切り出したPNG・シート・GIFと、ほかの単発動作の待機への接続も再構築する。移動の修正原画では濃い半透明の余白が上下の姿勢をつないでいたため、alpha 245未満の余白を機械的な抽出時に除外。採用した画素のRGBAは変更しない。

## 毒の沼地の背景

組み込み image_gen で森の対応レイヤーをリファレンスに、[遠景PNG](../../public/assets/stages/poison-swamp/swamp-distant.png)と[地面＋近景PNG](../../public/assets/stages/poison-swamp/swamp-ground-near.png)を生成。どちらも1672×941px。地面＋近景は上部が透過し、遠景が見える。原画のRGBAを維持する。[全文プロンプト](../../development/assets/stages/poison-swamp/PROMPT.md)、[レイヤー・座標情報](../../public/assets/stages/poison-swamp/manifest.json)、原画は `public/assets/stages/poison-swamp/source/` に保存する。

構成は森と同じ2層。基準画面1024×576、接地点Y323〜512、戦闘での移動範囲Y334〜501。中央の泥地は空け、背面の木・つる・草と手前端の低い草だけで近景を構成。遠景は0.28倍、地面＋近景は1倍で独立してスクロールし、左右反転を交互に並べる。`/stages.html?stage=poison-swamp` で森との切り替え・接地点の上下端・横スクロールを確認でき、`/swamp.html` の戦闘背景にも使用する。

背景の再構築: `npm run build:swamp-stage`。検査: 全135件の自動テストが成功。ブラウザーでは43モーションのコマ送り・反転、拘束と解除、大技の溜めと発動、撃破の保持、一時停止、390px幅、背景の切り替え、接地点の上下端、横スクロールを確認し、画像の読み込みエラーやJavaScriptエラーなし。
