# 異次元の女神 v1

2026-10-14 JST。最終裏ボスの**未採用デザイン候補**。本編への登録は未実施。

2026-10-15追記：この静止基準を保持し、[モーション・FXの一次生成と検収](../first-pass-v1/README.md)を実施。本体56コマ・専用FX46コマ・分離部品9点を取得（6コマは出力拒否）。以下の生成履歴は2026-10-14時点の記録。

| 選択画像 | 内容 |
| --- | --- |
| [stage-throne-beyond-dimensions.png](references/stage-throne-beyond-dimensions.png) | 界外の御座：浮遊神殿・日蝕・広い足場 |
| [phase-1-seated.png](references/phase-1-seated.png) | 気だるげに玉座へ座る姿、余白修正版 |
| [phase-2-awakened.png](references/phase-2-awakened.png) | 同じ女神の浮遊・覚醒姿 |

[企画](../../../../docs/design/extradimensional-goddess-design.md) / [後続制作計画](../../../../docs/production/extradimensional-goddess-asset-plan.md) / [生成プロンプト](PROMPTS.md) / [生成記録](generation.json) / [静止素材の検査](qa.json) / [FXの幾何目標](fx-plan.json)

- 生成には内蔵 image_gen を使用。第1フェーズの初稿は source/phase-1-initial.png。
- 第1フェーズの構図だけを修正し、第2フェーズには修正済み画像を参照。
- 衣装・顔・配色・姿勢の基準。玉座・天環を分離した実行時素材、各モーション、FXはまだ生成していない。
- 2026-10-14の企画更新で、第1フェーズは指パッチン・歴代ボス幻影・星鏡の出現／消失、第2フェーズの通常行動は3人への追尾流星を制作予定へ追加。既存の静止基準と生成記録は維持し、未生成FXの幾何目標だけを更新した。
- 元画像のアルファを保持。第2フェーズは10%の安全余白に届いていないため、後続のセル化で広げる。
- 画像のRGBには低アルファの縁色がある。採用時は暗色・明色背景の実表示で確認し、必要な縁修正も元画像と比較する。

