# 魔法使いの共通モーション検証

制作方法: 組み込み image_gen。ポーズは画像生成で制作し、共通 tools/assets/build-motion.cjs で透明余白に基づく分割・モーション内共通倍率の最近傍縮小・固定基準位置への配置を実施。コマごとの個別拡縮、前進の反転による後退、プログラムによるポーズ描画は使用していない。

| ID | コマ数 | 採用原画 | 再生 |
| --- | ---: | --- | --- |
| forward | 4 | source/mage-forward-generated-v2.png | 600msループ |
| backward | 4 | source/mage-backward-generated-v2.png | 720msループ |
| jump | 3 | source/mage-jump-generated-v2.png | 720ms・待機へ戻る |
| hit | 2 | source/mage-hit-generated-v1.png | 380ms・待機へ戻る |
| down | 4 | source/mage-down-generated-v1.png | 1250ms・最終コマで静止 |

全て1コマ256×224px、共通 pivot は (128, 207)。ジャンプの滞空コマは両膝／両足を持ち上げた姿勢で、検証表示のみ manifest の previewOffset.y=-38 によりさらに上へ配置する。ゲーム内では固定pivotとジャンプ物理を使用する。

検証: node tools/assets/build-motion.cjs mage と node tools/assets/build-motion-preview.cjs mage を実行し、全5種で透明度・切り出し余白・出力輪郭の完全性・コマ間の差分・共通基準位置を通過。GIFのコマ数／フレーム遅延も検査済み。5つの最終スプライトシートを目視し、帽子・杖・全身の欠けがないこと、前進／後退は右向きのまま別の足運びであること、ジャンプのしゃがみ／滞空／着地、被撃ののけぞり／立て直し、ダウンの膝つき／横倒れ／静止を確認。

修正: 前進／後退は1/3コマの脚の交代を補強、ジャンプは原画セルのはみ出しを修正。初稿v1は全てsourceに保持し、layout.jsonで採用v2を指定。全文プロンプトと参照の役割は各モーションのPROMPT.mdに保存。

所見: 生成スプライトのため顔・帽子・髪・衣装の微細な輪郭変動が残る。ローブで脚の一部が隠れるが、ブーツの位置と膝の露出で移動方向と足の交代を確認できる。

## 通常攻撃・2コマ目の持ち手修正

2コマ目の振りかぶりで杖の持ち手が入れ替わっていたため、1コマ目を基準に組み込み image_gen で1コマを再生成。同じ腕（画像右側）が杖を握り、画像左側の空いた手は下げたままにした。杖の長さ・水晶・下端も元の装備に合わせて修正した。

単独原画 `attack-staff/source/mage-attack-staff-frame02-generated-v2.png` は、元のコマと身体の大きさ・足元を合わせて最近傍で原画セルへ登録。採用アトラスは `attack-staff/source/mage-attack-staff-generated-v2.png`。1・3・4コマ目のPNGは修正前とSHA-256が一致。通常攻撃の単体PNG・シート・GIF・review.pngを更新した。

4コマを目視し、同じ持ち手、振りかぶりから前方への軌道、帽子・足元の位置、杖の見切れを確認。魔法使い49コマの透過・余白・接地・シート・GIF検査と4件のモーションテストを通過。

ブラウザの魔法使いプレビューでも更新PNGの配信と2コマ目の表示を確認。連続再生のコマ順は 1→2→3→4→3→2→1→待機で、エラーなし。
