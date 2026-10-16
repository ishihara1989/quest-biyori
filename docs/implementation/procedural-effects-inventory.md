# エフェクト画像化の対応一覧

2026-10-16時点の実装調査。採用済みの本編 `public/js/ui/forest-game.js` と `public/js/render/` 全12ファイルを確認した。危険技の予告以外は基本的に画像化する方針に沿って、線・円・矩形・グラデーションなどで描く部分を一覧にした。

画像に追加している補助的な線や粒子も含む。以下の72項目は描画要素の数であり、必要な新規画像の枚数ではない。共用素材の再利用や既存画像への統合が可能。72項目すべてを生成画像または既存の採用画像へ置き換え済み。以下の図形名は調査時の記録として残し、最終列に現在の置換先を示す。共通6素材・24コマと描画処理は [制作・検収記録](../production/common-image-effects.md) を参照。

## 共通描画：11項目

参照：[forest-game.js](../../public/js/ui/forest-game.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 1 | 旧通常斬撃の楕円弧、スキル時の二重弧 | `drawEffects` の `slash`。現行の `warriorCast` 経路とは別の旧攻撃分岐にもイベント発行が残る | 戦士の既存 `slash` 画像 |
| 2 | ジェム発動時の拡大光輪 | `drawEffects` の `gem-effect`。耐性 `resistance`、吸魔 `siphon`、追撃 `echo`、処刑 `execution`、障壁 `aegis`、被弾MP `reprisal`、時間短縮 `timeshift` | 共通 `ring` |
| 3 | ジェム追撃の発動元と対象を結ぶ線 | 同上の `e.from` がある場合 | 共通 `streak` |
| 4 | 敵召喚の拡大する足元リング | `drawEffects` の `summon`。スケルトン召喚を含む | 共通 `ring` |
| 5 | 被弾・撃破周辺・回復薬使用・クリア・各地域大技・ジェム・召喚で共用する四角い粒子 | `burst` → `particles` → `drawEffects`。`handleEvents`、`usePotion`、`finish` から呼出 | 共通 `mote` |
| 6 | 出血の赤い斜線 | `drawActor` の `actor.bleed` | 共通 `streak` |
| 7 | 毒の緑の足元リングと発光 | `drawActor` の `actor.poison` | 共通 `ring` |
| 8 | 砂縛りの回転する点線リング | `drawActor` の `sandSlowUntil`。砂の画像に追加 | 共通 `ring` |
| 9 | 分離部位の足元の点線楕円 | `drawActor` の `bodyPart`。ワームの尾・クラーケン触手の位置表示 | 共通 `ring` |
| 10 | 画面を斜めに横切る光の帯 | `draw`。洞窟以外、動きを減らす設定以外 | 共通 `streak` |
| 11 | 背景を漂う四角い粒子 | `draw`。地域ごとに配色を変更。特殊ステージ・女神背景にも共通処理が重なる | 共通 `mote` |

## 戦士：5項目

参照：[warrior-skill-renderer.js](../../public/js/render/warrior-skill-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 12 | 残像をつなぐ移動軌跡の線 | `ghosts`。`return / z / auto / eight / flurry / running / tornado / ultimate / line` | 共通 `streak` |
| 13 | 空中・敵周辺に残す斜めの斬撃線 | `castOverlay` の `invisible / ultimate` | 共通 `streak` |
| 14 | 着地点の点線楕円 | `castOverlay` の `crater / ultimate`、高さ130超。味方スキルの着地点表示なので危険技予告の例外には含めない | 共通 `ring` |
| 15 | 衝撃命中時の画面フラッシュ | `impacts` の `impact` | 共通 `aura` |
| 16 | 命中位置から飛び散る四角い粒子 | `impacts`。全戦士スキルの画像に追加 | 共通 `mote` |

## 魔法使い：9項目

参照：[mage-skill-renderer.js](../../public/js/render/mage-skill-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 17 | 魔法陣画像の外周に重ねる楕円線 | `ring`。詠唱・各種範囲魔法・着弾で共用 | 共通 `ring` |
| 18 | 詠唱時に上昇・周回する四角い粒子 | `castOverlay` の詠唱中 | 共通 `mote` |
| 19 | 赤・紫系の全画面暗転 | `castOverlay` の `meteor / prison / cosmos` | 共通 `aura` |
| 20 | 隕石落下地点の拡大する楕円の影 | `castOverlay` の `meteor`。味方の落下演出 | 共通 `aura` |
| 21 | 星界魔法の中心に集まる四色の四角い粒子 | `castOverlay` の `cosmos` | 共通 `mote` |
| 22 | ビーム・炎・四象の画像に重ねる直線状の光芯 | `castOverlay` の `flame / beam / four` | 共通 `streak` |
| 23 | 連鎖雷の折れ線と白い光芯 | `impacts` の `chain` → `line` | 共通 `lightning` |
| 24 | 大魔法命中時の全画面フラッシュ | `impacts` の `meteor / cosmos / prison` | 共通 `aura` |
| 25 | 属性色の四角い着弾粒子 | `impacts`、動きを減らす設定以外 | 共通 `mote` |

## パラディン：4項目

参照：[paladin-skill-renderer.js](../../public/js/render/paladin-skill-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 26 | 城塞結界の上側を囲む半楕円 | `fields` の `fortress` | streak の画像弧 |
| 27 | 詠唱時の上昇する金色の四角い粒子 | `castOverlay`。通常メイス以外 | 共通 `mote` |
| 28 | 大技の最終段の全画面フラッシュ | `impacts` の `judgment / crusade / ray / heavens / ultimate` | 共通 `aura` |
| 29 | 命中時の金色の四角い粒子 | `impacts` | 共通 `mote` |

## 忍者：9項目

参照：[ninja-skill-renderer.js](../../public/js/render/ninja-skill-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 30 | 円形グラデーションの発光 | `light`。糸の節点・旋回する風魔手裏剣・飛び道具・大技・着弾・終撃の溜めで共用 | 共通 `aura` |
| 31 | 四角い火花・影の粒子 | `sparks`。終撃、封影結界、刃の渦、雷、分身出現、閃光・命中、糸系に追加 | 共通 `mote` |
| 32 | 奥義中の全画面暗転 | `castAura` の `ultimate` | 共通 `aura` |
| 33 | 奥義の中心へ集まる四角い粒子 | `castAura` の `ultimate` | 共通 `mote` |
| 34 | 撒菱の設置範囲を囲む赤い点 | `fields` の `caltrop`。味方の設置効果 | 共通 `ring` |
| 35 | 煙幕内を上昇する四角い粒子 | `fields` の `haze` | 共通 `mote` |
| 36 | 飛び道具の多重直線の尾・白い光芯 | `projectiles`。手裏剣・風魔・札・針・影手裏剣など | 共通 `streak` |
| 37 | 高レベル・影飛び道具の尾に残す四角い粒子 | `projectiles`、レベル60以上または影弾 | 共通 `mote` |
| 38 | 終撃時の全画面フラッシュ | `impacts` の `final-ring` | 共通 `aura` |

## 呪術師：4項目

参照：[shaman-skill-renderer.js](../../public/js/render/shaman-skill-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 39 | 円形グラデーションの発光 | `light`。詠唱・継続呪い・大呪法・魂柱・呪爆・高レベル命中に追加 | 共通 `aura` |
| 40 | 多色の四角い火花 | `sparks`。大呪法、魂柱、呪爆、高レベル命中 | 共通 `mote` |
| 41 | 詠唱霊の左右を上昇する四角い粒子 | `auras` の詠唱中 | 共通 `mote` |
| 42 | 呪印数を示す足元の小さな四角い印 | `statuses`。呪印画像とは別に1〜5個を配置 | 共通 `mote` |

## 巫女：2項目

参照：[miko-skill-renderer.js](../../public/js/render/miko-skill-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 43 | 神楽・祭り展開時の全画面フラッシュ | `backdrops` の `mikoFestival` | 共通 `aura` |
| 44 | 発動元と対象を結ぶ回復・連携などの直線 | `impacts` の `e.from`。癒蝶系は緑、ほかは金色 | 共通 `streak` |

## 通常地域・状態異常：7項目

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 45 | 砂漠の飛び道具の直線の尾 | [forest-game.js](../../public/js/ui/forest-game.js) の `drawDesertProjectiles` | 共通 `streak` |
| 46 | 高原の飛び道具の直線の尾と発光 | 同ファイルの `drawHighlandProjectiles` | 共通 `streak` |
| 47 | 氷河の冷気弾の直線の尾と発光 | [glacier-renderer.js](../../public/js/render/glacier-renderer.js) の `projectiles` | 共通 `streak` |
| 48 | 凍結・冷気・結晶装甲の文字記号 `❄ / ❅ / ◇` | 同ファイルの `statuses`。氷結・装甲の画像にも追加される状態マーク | 既存 glacier-seal / glacier-armor / glacier-cold 画像 |
| 49 | 火山の飛び道具の直線の尾と発光 | [volcano-renderer.js](../../public/js/render/volcano-renderer.js) の `projectiles` | 共通 `streak` |
| 50 | 魔神の扇状衝撃に追加する紫の弧線 | [demon-castle-renderer.js](../../public/js/render/demon-castle-renderer.js) の `effect`、`castle-demon-impact` の `sector`。発動後の攻撃なので予告の例外外 | streak の画像弧 |
| 51 | 魔王城の呪弾の直線の尾と発光 | 同ファイルの `projectiles` | 共通 `streak` |

## 異次元の女神：10項目

参照：[goddess-renderer.js](../../public/js/render/goddess-renderer.js)。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 52 | 背景上部の円形の光輪と発光 | `background`。位相で色・太さ・透明度を変更 | 共通 `ring` |
| 53 | 背景の星の四角い粒子 | `background` | 共通 `mote` |
| 54 | 位相移行時に広がる縦長の光輪 | `draw` の `phaseChangeAt` | 共通 `ring` |
| 55 | 星鏡の縦長の枠、強敵時の二重枠と発光 | `overlays` の `phantom`。歴代ボス本体は既存画像、鏡の枠は楕円。内部の切り抜きも同じ楕円に依存 | portal + ring、aura の透過マスク |
| 56 | 通常射撃の菱形の星弾本体 | `overlays` の `projectiles`、`kind !== meteor`。流星本体には既存画像あり | 共通 `mote` |
| 57 | 星弾・追尾流星の曲線の尾と発光 | 同上の `quadraticCurveTo` | streak の連続配置 |
| 58 | 零界収束で頭上に溜める球と発光 | `overlays` の `zero` 予備動作。攻撃範囲予告とは別の溜め演出なので画像化対象 | 共通 `aura` |
| 59 | 覚醒時に広がる三重の足元リング | `effect` の `awaken` | 共通 `ring` |
| 60 | 発動後の命中形状をなぞる線・円・円環・扇形 | `effect` → `shape`。`phantom-hit / cross / rings / zero` など。断裂・天環波・歴代ボスの画像に追加する線も含む。危険技予告と同じ補助関数だが、ここは命中後 | streak / ring の画像配置 |
| 61 | 零界収束の縦長の光柱と発光 | `effect` の `zero` の `fillRect`。着弾画像に追加 | 共通 `streak` |

## 次元の門・混沌の門：11項目

参照：[rift-renderer.js](../../public/js/render/rift-renderer.js)。両ステージ・全3段階で共用。配色と門画像だけが切り替わる。

| No. | 調査時の図形・模様 | 場所・条件 | 画像化後 |
| --- | --- | --- | --- |
| 62 | 背景を流れる四角い粒子 | `background` | 共通 `mote` |
| 63 | 門周辺の円形グラデーションのオーラ | `gate` | 共通 `aura` |
| 64 | 門の周囲を回る四角い粒子 | `gate` | 共通 `mote` |
| 65 | 開いた門の内部の暗色面・多重楕円の渦 | `gate` の `opening > 0`。静止した門画像とは別の描画 | portal + ring |
| 66 | 崩壊開始時のひび割れの折れ線と発光 | `gate` の `shattering` 初期 | 共通 `lightning` |
| 67 | 召喚された敵の足元で広がるリング | `emergence` | 共通 `ring` |
| 68 | 召喚された敵の周囲の縦長粒子 | `emergence` | 共通 `mote` |
| 69 | 敵出現時の縦長楕円、交差する楕円、稲妻状の裂け目と足元リング | `effect` の `emerge`、段階0・1・2それぞれ | ring / lightning |
| 70 | 門から出現地点を結ぶ点線 | `effect` の `emerge`、`e.from` がある場合 | 共通 `streak` |
| 71 | 崩壊時の拡大する縦長リング | `effect` の `shatter` | 共通 `ring` |
| 72 | 崩壊時に放射状に飛ぶ四角い粒子 | `effect` の `shatter` | 共通 `mote` |

資料館の門・出現・崩壊も `museum-ui.js` の `asset.procedural` 分岐から同じ描画を呼び出すため、現在は同じ画像ベースの描画を本編・資料館で共用し、資料館の読み込みでも生成素材の準備を待つ。

## 危険技の予告として残せる図形

- [interference-renderer.js](../../public/js/render/interference-renderer.js) の `warnings` 全般。円・扇形・円環・直線範囲・斜線・進行表示・順番番号・足元の予告表示。
- [forest-game.js](../../public/js/ui/forest-game.js) の `drawRuinsTelegraph / drawDesertTelegraphs`、`drawActor` の洞窟・海岸・沼地・通常 `windup` の狙い位置、`drawProjectiles` の果実・根などの着弾予告。
- [goddess-renderer.js](../../public/js/render/goddess-renderer.js) の `warnings` による星鏡の範囲予告、`overlays` の追尾流星の標的を示す頭上の菱形マーク。

同じ関数・形状を使っていても、発動後の線や光輪は上の画像化残件に含む。

## UI・接地影・既存画像の加工として残るもの

以下も図形・描画処理が残るが、戦闘エフェクトとは用途が異なるため、72項目とは別に記録する。

| 用途 | 残っている描画 | 参照 |
| --- | --- | --- |
| 残量・時間表示 | HPバー、魔法詠唱バー、巫女の障壁残量バー、憑依・契約アイコンの背景と残り時間 | `forest-game.js` の `drawActor`、魔法使いの `castOverlay`、巫女の `barriers / statuses` |
| 分身数・残り時間 | 足元の四角いカウンターと円弧 | 忍者の `overlay`。画像化を統一する場合はこの表示も置き換える |
| 状態UI | 呪術師の状態アイコンの矩形背景、呪印数の数字 | 呪術師の `statuses`。足元の四角い呪印自体はNo.42 |
| 行動妨害UI | 抵抗容量バー、盾の線画、中断回数 | `InterferenceRenderer.bars` |
| 数字・文字 | ダメージ、回復、CRITICAL、MISS、巫女の防御量、星鏡の敵名 | `drawEffects`、女神の `overlays` |
| 接地影 | 味方・敵・女神・門の楕円影 | `drawActor`、女神の `draw`、門の `gate` |
| 背景の調光 | 女神の床の縦グラデーション | 女神の `background`。No.19などの技固有の暗転は残件に含める |
| 画像を使った動き・加工 | 戦士・忍者・ストームジャッカルの残像、分身・追撃像の色調と発光、女神の呼吸・浮遊・帰還・扉の分割開閉・画像断片の回転破砕、巫女の連携弾の発光 | すでに画像を元に合成。独立した図形・模様として描く部分は72項目に含めた |

DOM/CSSによるメニュー・報酬画面の装飾、および `development/labs/` の検証専用描画は本編戦闘エフェクトの一覧には含めない。本編の図形描画を画像に見せるためだけにCanvasへ事前描画する方法は、この一覧でいう画像素材への置き換えには数えない。
