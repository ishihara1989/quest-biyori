# 異次元の女神：一次検収の課題

2026-10-15 JST。画像の修正・再生成・本編登録は未実施。各ジョブ1回。これは課題抽出の記録であり、素材の合格・採用記録ではない。

## 優先して直すもの

1. **欠落6コマ**：p2-cast F4〜F6、p2-ultimate F4〜F6。生成サービスの出力判定で拒否され、画像が返らなかった。再試行なし。
2. **形状・姿勢**：p1-shot F3の3本腕、移行F7/F8と第2フェーズ攻撃の座位寄り姿勢、ultimate F9の頬杖復帰、down F4の複数本体。
3. **セル越境**：18ジョブで等分境界に可視画素。下記PNGは原画を直さず等分切り出ししたため、見切れ・隣コマの混入を含む。
4. **分離と原点**：玉座に大環、天環に小冠が残る。分離部品の縮尺・肘掛け・掌とFX芯の位置合わせが必要。
5. **終端と継ぎ目**：流星の腕戻り、覚醒・撃破の3→4/6→7、各FXの消散。

## 素材別

P1＝採用前に必須の欠落・形状・軌道・接続修正、P2＝縮尺・明度・消散等の調整候補。目視は返ってきた全コマ、連続再生は26クリップ。静止10点（分離9＋中断入口1）へ再生合格を付けない。

| 素材 | 優先度 | 検収 | 課題 |
| --- | --- | --- | --- |
| [parts/body-seated](review/parts/body-seated/contact.png) / [GIF](review/parts/body-seated/preview.gif) | P2 | 全1コマ | 座位・頬杖・組み脚は維持。原画比で髪と衣装が広がり、玉座へ重ねる縮尺と肘位置が未整合。安全余白は最小1.9%。 |
| [parts/body-floating](review/parts/body-floating/contact.png) / [GIF](review/parts/body-floating/preview.gif) | P2 | 全1コマ | 玉座と大天環を除いた本体として分離。左右の髪が外縁近く、安全余白は最小1.2%。座位との頭〜腰の縮尺合わせが必要。 |
| [parts/throne](review/parts/throne/contact.png) / [GIF](review/parts/throne/preview.gif) | P1 | 全1コマ | 空席は生成できたが、独立予定の大きな環が背面へ残存。座面と肘掛けの高さ・幅が座位本体に未一致。 |
| [parts/halo](review/parts/halo/contact.png) / [GIF](review/parts/halo/preview.gif) | P1 | 全1コマ | 大環に小さな冠まで混入し、本体の小冠と重複する。輪がほぼ全幅を占め、安全余白は最小0.6%。 |
| [parts/ground-shadow](review/parts/ground-shadow/contact.png) / [GIF](review/parts/ground-shadow/preview.gif) | P2 | 全1コマ | 楕円影は単独で透過。目標Gに近い低い配置だが、紫の濃度と浮遊時の縮小率は後続合成で決める。 |
| [parts/halo-node](review/parts/halo-node/contact.png) / [GIF](review/parts/halo-node/preview.gif) | P2 | 全1コマ | 青い菱形の節点は独立。目標36×52に対して大きく描かれており、天環へ合わせる固定縮尺が必要。 |
| [parts/debris](review/parts/debris/contact.png) / [GIF](review/parts/debris/preview.gif) | P2 | 全1コマ | 柱片の色・金縁は舞台に合う。単一破片の依頼に対し複数の小片が付属し、背景での重なりと採用範囲を要判断。 |
| [parts/target-star](review/parts/target-star/contact.png) / [GIF](review/parts/target-star/preview.gif) | P2 | 全1コマ | 中心の透明な星印は読めるが、4つの宝石状装飾が強く、小さい頭上表示での判読性と48×48への縮尺を要確認。 |
| [parts/eclipse-rim](review/parts/eclipse-rim/contact.png) / [GIF](review/parts/eclipse-rim/preview.gif) | P2 | 全1コマ | 輪郭は透過で分離。静かな日蝕縁より装飾・発光が強く、攻撃FXに見えないよう背景上の明度調整が必要。 |
| [motions/p1-idle](review/motions/p1-idle/contact.png) / [GIF](review/motions/p1-idle/preview.gif) | P1 | 全4コマ・再生確認 | F3で半瞬きより強く目を閉じる。固定指定の髪量・裾形・小冠位置が変わる。等分セル境界に画素があり、下段の頭と上段の靴が混入／切断する。 |
| [motions/p1-shot](review/motions/p1-shot/contact.png) / [GIF](review/motions/p1-shot/preview.gif) | P1 | 全4コマ・再生確認 | F3で頬杖の腕と右の腕を残したまま画面左へ別の発射腕が増え、3本腕に見える。掌の指定軌道と異なる。F1〜F4ともセル境界を跨ぐ。 |
| [motions/p1-snap](review/motions/p1-snap/contact.png) / [GIF](review/motions/p1-snap/preview.gif) | P1 | 全4コマ・再生確認 | F2→F3が指パッチンより指差しに見える。親指・中指の接触から掌への落下が読めず、指先の向きが変わる。髪と腰は固定指定より動く。 |
| [motions/p1-hit](review/motions/p1-hit/contact.png) / [GIF](review/motions/p1-hit/preview.gif) | P2 | 全2コマ・再生確認 | F1の頭左に不要な衝撃記号状の紫線が混入。肩の小反動はあるが、髪と裾の形が変わり被弾以上の輪郭変化になる。 |
| [motions/phase-rise](review/motions/phase-rise/contact.png) / [GIF](review/motions/phase-rise/preview.gif) | P1 | 全9コマ・再生確認 | F1〜F3の頬杖解除と脚解除は読める。F3→F4で両手位置・顔高・体格が跳ぶ。F4〜F5の両足接地は地面／影との合成で未確定。F6→F7で浮遊から座位へ戻り、F7〜F8が組み脚になる。F9も浮遊基準の掌位置に一致しない。分割境界とセル越境を要修正。 |
| [motions/p2-idle](review/motions/p2-idle/contact.png) / [GIF](review/motions/p2-idle/preview.gif) | P1 | 全4コマ・再生確認 | 銀髪・衣装は維持するが、上下±3pxの呼吸以上に髪束・裾の形状が変化。F2→F3でセル越境があり、F4→F1の輪郭と頭高が跳ぶ。 |
| [motions/p2-drift](review/motions/p2-drift/contact.png) / [GIF](review/motions/p2-drift/preview.gif) | P1 | 全4コマ・再生確認 | 左向きで髪が右へ流れる方向は合う。裾・靴・腰の位置と髪束の量が変わり、体幹安定が不足。4コマすべて等分セルの境界を跨ぐ。右移動用の髪遅れは未制作。 |
| [motions/p2-meteor](review/motions/p2-meteor/contact.png) / [GIF](review/motions/p2-meteor/preview.gif) | P1 | 全6コマ・再生確認 | F1〜F3で掌を上げる順序は読める。F4は左右同時の下払いにならず片手が上に残る。F6は掌が再び上がり、待機へ戻らない。全体で組み脚の座位寄りになり、浮遊待機と下半身が不一致。F3→F4で髪・裾・縮尺も跳ぶ。 |
| [motions/p2-cast](review/motions/p2-cast/contact.png) / [GIF](review/motions/p2-cast/preview.gif) | P1 | 全3コマ・再生確認・欠落 F4,5,6 | F1〜F3の寄せる動作のみ取得。F3は合掌となり、離した掌の構え目標と違う。F4〜F6は出力拒否で欠落。開く→押す発動は検収不可。 |
| [motions/p2-ultimate](review/motions/p2-ultimate/contact.png) / [GIF](review/motions/p2-ultimate/preview.gif) | P1 | 全6コマ・再生確認・欠落 F4,5,6 | F1〜F3の胸前までとF7〜F9の解放区間を取得。F4〜F6は出力拒否で欠落し、頭上構えと分割接続は検収不可。F9が頬杖に戻り、浮遊待機へ接続しない。F7〜F9は中間参照が欠けた状態での一次生成。 |
| [motions/p2-hit](review/motions/p2-hit/contact.png) / [GIF](review/motions/p2-hit/preview.gif) | P1 | 全2コマ・再生確認 | 顔・肩の反動は読めるが、髪幅と体幹位置の変化が大きい。左右の等分セルを跨いで髪が接触する。 |
| [motions/p2-break](review/motions/p2-break/contact.png) / [GIF](review/motions/p2-break/preview.gif) | P1 | 全3コマ・再生確認 | F1の掌は胸前へ寄らず肩付近。F2は掌を開いた待機に戻り、予定の下落を経ず、F3で膝へ手を置く座位に変わる。構え→休息の順序と待機への接続を修正対象とする。 |
| [motions/p2-break-overhead](review/motions/p2-break-overhead/contact.png) / [GIF](review/motions/p2-break-overhead/preview.gif) | P1 | 全1コマ | 入口1枚は両手が離れた高い位置で、頭上で寄せた掌から落とす途中の姿に一致しない。大技F6欠落のため入口接続も未検証。 |
| [motions/down](review/motions/down/contact.png) / [GIF](review/motions/down/preview.gif) | P1 | 全4コマ・再生確認 | F1→F3の閉眼・脱力・下降は読める。F4で複数の本体残像が同時に残り、薄い1体の消散にならない。強い粒子が本体へ焼き込まれ、別の撃破FXとの二重表示が懸念。セルの上下境界も跨ぐ。 |
| [effects/star-bolt](review/effects/star-bolt/contact.png) / [GIF](review/effects/star-bolt/preview.gif) | P1 | 全3コマ・再生確認 | 左向きの芯と右への尾は読めるが、F1→F2で頭の位置が左へずれ、固定原点で跳ぶ。F2の尾が次セルまで跨ぐ。原点と安全余白の調整が必要。 |
| [effects/star-impact](review/effects/star-impact/contact.png) / [GIF](review/effects/star-impact/preview.gif) | P2 | 全3コマ・再生確認 | 点灯→十字→残光の順序は読める。F3も芯と破片が明るく、alpha=0の終端にならない。通常被弾に対してF2の放射が大きい。 |
| [effects/snap-glint](review/effects/snap-glint/contact.png) / [GIF](review/effects/snap-glint/preview.gif) | P2 | 全3コマ・再生確認 | 小点→十字→小残光は読める。青白い芯より金黄の比率が高い。F3に不透明な芯が残り、掌と重ねるサイズ・終端フェードが必要。 |
| [effects/star-mirror-open](review/effects/star-mirror-open/contact.png) / [GIF](review/effects/star-mirror-open/preview.gif) | P1 | 全4コマ・再生確認 | 開口は段階的に広がるがF1から太い金枠があり、縦線で始まらない。F4で円形に近くなり幅180×高さ300の縦長保持と異なる。上下セル境界を跨ぐ。大ボス二重縁の変種は描画時調整が未実施。 |
| [effects/phantom-recall](review/effects/phantom-recall/contact.png) / [GIF](review/effects/phantom-recall/preview.gif) | P1 | 全4コマ・再生確認 | ひび→破片→収束→縦線の大順序は読める。F1が爆発状で強すぎ、F2とF4の光がセル境界を跨ぐ。縦線の終端にも大きな装飾が残る。幻影本体のマスク・発射済み弾との接続は未実装。 |
| [effects/homing-meteor](review/effects/homing-meteor/contact.png) / [GIF](review/effects/homing-meteor/preview.gif) | P2 | 全3コマ・再生確認 | 下向きの芯・上向きの長い尾は読める。頭がセル中心より下へ寄り、成長で位置と幅が変わる。曲がる尾は素材に焼き込まず描画側で付ける計画のまま。 |
| [effects/meteor-impact](review/effects/meteor-impact/contact.png) / [GIF](review/effects/meteor-impact/preview.gif) | P2 | 全3コマ・再生確認 | 接触→星冠→低い残光は読める。F2の星冠が高く装飾が強い。F3で輪と強い芯が残り、単体着弾の消散と大範囲の波が混同しやすい。 |
| [effects/rift-open](review/effects/rift-open/contact.png) / [GIF](review/effects/rift-open/preview.gif) | P1 | 全4コマ・再生確認 | 点→裂け口の順序は読めるがF2から楕円の口になり細線段階が弱い。F3/F4が目標より太く、上下の光がセルを跨ぐ。 |
| [effects/rift-cut](review/effects/rift-cut/contact.png) / [GIF](review/effects/rift-cut/preview.gif) | P2 | 全3コマ・再生確認 | 細芯→裂けた帯→残光の順序は読める。指定1024×256に対し原画セルは正方形で、帯幅820・高さ80へ直接対応しない。F3の芯がまだ明るく、10%の左右余白も不足。 |
| [effects/celestial-wave](review/effects/celestial-wave/contact.png) / [GIF](review/effects/celestial-wave/preview.gif) | P2 | 全3コマ・再生確認 | 透明な内側を保った輪→太輪→欠けた輪は読める。F3で半径が縮み、拡大しながら消える目標と異なる。太い装飾が予告境界と干渉しない縮尺が必要。 |
| [effects/zero-converge](review/effects/zero-converge/contact.png) / [GIF](review/effects/zero-converge/preview.gif) | P1 | 全4コマ・再生確認 | 球2コマと柱2コマは区別でき、アルファ透過がある。原画で灰色に見えた範囲は広い半透明光で、明色背景に不透明な黒い矩形は確認されなかった。主な問題はセル越境で、F1下部に次段の柱先端が混入し、F3/F4の柱上端が切れる。球と柱を別原点で置くための切り出し・位置合わせと終端フェードが必要。画像補正は今回未実施。 |
| [effects/phase-awaken](review/effects/phase-awaken/contact.png) / [GIF](review/effects/phase-awaken/preview.gif) | P2 | 全3コマ・再生確認 | 足元→上昇粒→3節点の順序は読める。F1が薄い輪ではなく面の明るい円盤、F2は3粒より装飾が多い。天環節点への位置合わせが必要。 |
| [effects/goddess-defeat](review/effects/goddess-defeat/contact.png) / [GIF](review/effects/goddess-defeat/preview.gif) | P1 | 全6コマ・再生確認 | ひび→破片→収束の後、F4で再び大きく発光してF5/F6へ散る。F3から宝石状の芯があり報酬光の開始が早い。F6にも星粒と弧が残り、完全消失には至らない。F3→F4で配色・光量・大きさが跳ぶ。 |

## 取得できなかった区間

| ジョブ | コマ | 結果 |
| --- | --- | --- |
| motions/p2-cast-2 | 3 | 出力拒否・PNGなし・再試行なし |
| motions/p2-ultimate-2 | 3 | 出力拒否・PNGなし・再試行なし |

## 未確認の接続

星鏡→歴代ボス20体→代表技→即回収、追尾対象・曲がる尾・着弾、危険技の中断と解除、背景合成、本編の通常幅／狭い幅、命中判定・保存・報酬・バランスは今回の対象外。既存ボスは [再利用在庫](PHANTOM-REUSE.md) まで確認した。四足歩行は新規生成していない。

## 検査データ

[原画とプロンプト](generation.json) / [失敗記録](generation-failures.json) / [目視メモ](review-notes.json) / [原画と全セルの透過・外接矩形](qa-mechanical.json) / [集計](qa.json)。目標座標は jobs.json、実測の外接矩形は qa-mechanical.json。目標を実測済みとして扱わない。
