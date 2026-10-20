# 転生の女神：SF兵器・トラック・帰還ゲート v1

2026-10-20。**制作候補・本編未登録。**

[検収画面](../../../labs/reincarnation-goddess-arsenal.html) / [設計](../../../../docs/design/reincarnation-goddess-arsenal.md) / [制作記録](../../../../docs/production/reincarnation-goddess-arsenal.md) / [基本版](../basic-v1/README.md)

通常のSF兵器は5パターン。大型トラックは別枠の大技。女神5動作15コマ、乗車・企み待機・（＞v＜）突進・涙目中断12コマ、召喚・弾・光線・ミサイル・重力円盤・衛星砲撃・着弾・タイヤ煙・爆発・帰還ゲート開閉の11種33コマ。新規計60コマ。帰還本体6コマと待機・被弾・移動はコピーした基本版を再利用する。

- source/: 内蔵 image_gen から返された未改変の透過PNG。
- references/: 固定した左向き原画と、トラックの連続性に使う承認原画。
- jobs.json / PROMPTS.md: 全文プロンプト、目標位置、時間設計。目標は実測値ではない。
- generation.json: 原画・参照のSHA256、生成ツールと返却元。
- layout.json / registration.json: 実測した切り出し矩形と、固定倍率・表示位置。
- clips/: フレームPNG・横シート・マニフェスト。
- review/: 全コマ比較、クリップGIF、検査と検収結果。
- REVIEW.md: 目視・連続再生の結果と残る制約。

画像はGit管理外。Gitだけから原画と派生PNGは復元できないため、このフォルダ全体を保持する。基準フォルダの画像は書き換えていない。

## 再構築と確認

```powershell
npm ci
node tools/assets/build-reincarnation-arsenal.cjs
node tools/assets/build-reincarnation-arsenal-preview.cjs
node tools/verify/verify-reincarnation-arsenal.cjs
npm run check:structure
node --test tests/repository-structure.test.cjs
npm start
```

検収画面で5攻撃・トラック発動／中断・帰還の接続、全クリップの通常／低速・全コマ・暗色／明色／市松を確認する。数値は検収用の仮設定で、実戦のダメージ・命中判定・バランス・保存・報酬を実装済みとは扱わない。

## 検収結果とプレビュー

[全コマと接続の検収結果](REVIEW.md)。内蔵 image_gen の24回から20原画60コマを選択。不採用4原画も保持。全60コマの最終矩形で原画／出力の境界接触0、最小余白15px、20GIFのフレーム数と時間を確認した。

単体の通常／低速40再生、接続8種の通常／低速16再生、25時刻の合成、1440px／390px幅を確認。帰還2400msは背景と全RGBA一致。機械結果は [qa.json](review/qa.json)、[ブラウザ検収](review/browser-qa.json)、[接続再生](review/sequence-playback.json)。

- [表情と帰還の一覧](review/comedy-overview.png)
- [企み待機→突進GIF](review/truck-rush-sequence.gif) / [涙目中断GIF](review/truck-cancel-sequence.gif) / [ゲート帰還GIF](review/return-sequence.gif)
- [機関砲](review/pulse-sequence.gif) / [レール砲](review/laser-sequence.gif) / [ミサイル](review/missiles-sequence.gif) / [円盤](review/discs-sequence.gif) / [衛星砲](review/orbital-sequence.gif)
