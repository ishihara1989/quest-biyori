# 遺跡のモーション素材

敵8種 / 56モーション / エフェクト18種。組み込み image_gen で生成。

[確認ページ](../../labs/ruins-motions.html) / [個別再生・コマ送り・攻撃とエフェクト](../../labs/enemies.html#rune-gargoyle) / [一覧GIF](idle-lineup.gif) / [素材manifest](manifest.json)

ガーゴイルは待機・移動・被弾・攻撃で飛行し、撃破時に落下・接地して最終コマを保持します。地上移動は左右3コマずつの6コマ。飛行・浮遊移動と待機・攻撃は4コマ、被弾・撃破は各2コマです。

| 敵 | モーション |
| --- | --- |
| [石の衛兵](../../../public/assets/enemies/stone-guard/motions/index.json) | 待機・移動・被弾・撃破・剣撃・薙ぎ払い |
| [ルーンガーゴイル](../../../public/assets/enemies/rune-gargoyle/motions/index.json) | 待機・移動・被弾・撃破・飛行爪撃・ルーン衝撃 |
| [古代の弩兵](../../../public/assets/enemies/ancient-crossbowman/motions/index.json) | 待機・移動・被弾・撃破・弩射撃・連射 |
| [浮遊魔導器](../../../public/assets/enemies/floating-magic-core/motions/index.json) | 待機・移動・被弾・撃破・魔弾・魔力炸裂 |
| [重装ゴーレム](../../../public/assets/enemies/armored-golem/motions/index.json) | 待機・移動・被弾・撃破・叩きつけ・大薙ぎ・二連打 |
| [古代弩砲兵](../../../public/assets/enemies/ancient-ballista/motions/index.json) | 待機・移動・被弾・撃破・貫通大矢・扇状射撃・三連射・近距離体当たり |
| [魔導人形セラフィナ](../../../public/assets/enemies/seraphina/motions/index.json) | 待機・移動・被弾・撃破・三重光弾・環刃・光柱・魔導再調整 |
| [古代機兵タイタン](../../../public/assets/enemies/ancient-titan/motions/index.json) | 待機・移動・被弾・撃破・巨腕打撃・左右砲撃・炉心照射・魔導踏撃・排熱停止 |

各 motions/<motion>/ に透過PNGの各コマ、横一列のPNGシート、GIF、manifest.jsonを保存しています。eventsにエフェクトの発生時刻、対象位置のずれ、発生元を記録しています。

## 原画とプロンプト

敵の source/design-reference.png が基準画像、source/*-generated.png が生成原画です。被弾・撃破は reaction-generated.png の前半・後半から切り出しました。各敵のPROMPT.mdと[全文生成記録](../../records/ruins-generation.json)に実際に使ったプロンプトを保存しています。

切り出し・登録・nearest-neighborのみで書き出し、保持する画素のRGBAは原画から採っています。低アルファの背景ノイズは既存の素材制作と同じalpha>=192のしきい値で除外し、原画は保存しています。

## エフェクト

- [石剣斬撃](../../../public/assets/effects/ruins-stone-slash/manifest.json)
- [ルーン爪撃](../../../public/assets/effects/ruins-rune-claw/manifest.json)
- [ルーン衝撃](../../../public/assets/effects/ruins-rune-shock/manifest.json)
- [古代弩矢](../../../public/assets/effects/ruins-infantry-bolt/manifest.json)
- [弩砲大矢](../../../public/assets/effects/ruins-heavy-bolt/manifest.json)
- [機兵衝突](../../../public/assets/effects/ruins-bronze-impact/manifest.json)
- [魔導弾](../../../public/assets/effects/ruins-magic-bolt/manifest.json)
- [魔力炸裂](../../../public/assets/effects/ruins-magic-burst/manifest.json)
- [石腕衝撃](../../../public/assets/effects/ruins-stone-impact/manifest.json)
- [重腕薙ぎ](../../../public/assets/effects/ruins-golem-sweep/manifest.json)
- [セラフィナ光弾](../../../public/assets/effects/ruins-seraph-light/manifest.json)
- [魔導環刃](../../../public/assets/effects/ruins-ring-blade/manifest.json)
- [魔導光柱](../../../public/assets/effects/ruins-light-pillar/manifest.json)
- [魔導再調整光](../../../public/assets/effects/ruins-recharge/manifest.json)
- [古代砲弾](../../../public/assets/effects/ruins-cannon-shell/manifest.json)
- [炉心光線](../../../public/assets/effects/ruins-furnace-beam/manifest.json)
- [魔導踏撃波](../../../public/assets/effects/ruins-magic-quake/manifest.json)
- [機兵排熱](../../../public/assets/effects/ruins-vent-steam/manifest.json)

ゲーム本編の遺跡ステージ、敵の数値、戦闘AIへの適用は次工程です。
