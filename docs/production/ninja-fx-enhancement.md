# 忍者エフェクト追加（2026-10-10）

後半の忍術を中心に演出を強化。戦士の広い斬撃・残像・破片と、魔法使いの予兆・多層光輪・着弾発光を参照し、忍者の朱色・影の紫・白金の配色で統一した。キャラクターのモーション、威力、当たり判定、MP、再使用時間、沼10クリア時の加入条件は維持。

## 技ごとの演出

| 技 | 追加・強化 |
| --- | --- |
| 風魔手裏剣 | 大きな刃、長い白い軌跡、刃の残像、発光する外周、往復の着弾斬撃 |
| 霞分身・影武者・八方影分身 | 召喚紋の拡大と破裂、紫の火花、分身の輪郭、影武者と八方の足元の光輪 |
| 絡糸陣 | 六つの発光点、地面の紋、周期ごとの広がる糸と破片 |
| 影渡り・無影連舞 | 実際の移動元と移動先を結ぶ斬撃、既存ポーズの残像、長い投擲軌跡、連続着弾 |
| 麻痺針 | 白紫の長い針の軌跡、枝分かれした電撃の着弾、局所発光 |
| 乱れ風魔 | 二層の回転する渦、刃ごとの残像と発光、周期ごとの衝撃輪 |
| 朧煙幕 | 三層の薄い煙、外周の渦、上昇する影の火花 |
| 封影結界 | 発動前の紋、六つの外周の影柱、実際のダメージ周期に合わせた三本の大きな影柱、光と破片 |
| 千影万華 | 集まる粒子、二重の地面の渦、六分身の召喚紋、終撃前の白金の収束、巨大な六角の爆発、六方向の斬撃、衝撃輪と残光 |

大きな爆発と結界の柱はキャラクターより後ろに描く。手前には短い斬撃・火花・衝撃輪を置く。同じ位置・同じ瞬間の同種の着弾は描画だけをまとめ、ダメージイベントはそのまま処理する。低減演出では全画面の閃光・粒子・残像を省略する。

## 生成素材とプロンプト

built-in `image_gen` で6種類、各4コマ、計24コマの透過PNGを生成。基準リファレンスは既存の忍者 `final-ring.png`、戦士 `rupture/review.png`、魔法使い `cosmos/review.png`。原画のアルファを保持し、透過区間で4コマを切り出して共通倍率で nearest-neighbor 登録した。背景除去や描き直しは行っていない。

| 保存先（`public/assets/skills/ninja/effects/` 配下） | コマの進行 | 登録 |
| --- | --- | --- |
| [shadow-slash](../../development/assets/skills/ninja/effects/shadow-slash/PROMPT.md) | 左下→右上の切断線、交差する斬撃、尖った破片、残光 | 192角・110ms/コマ |
| [blade-vortex](../../development/assets/skills/ninja/effects/blade-vortex/PROMPT.md) | 同じ大きさの渦を時計回りに回転、4コマで循環 | 192角・100ms/コマ・ループ |
| [thunder-bloom](../../development/assets/skills/ninja/effects/thunder-bloom/PROMPT.md) | 白い核、枝分かれ、電撃の分裂、消える火花 | 192角・120ms/コマ |
| [shadow-eruption](../../development/assets/skills/ninja/effects/shadow-eruption/PROMPT.md) | 低い紋、上昇する三柱、分裂する槍と衝撃輪、落ちる残火 | 256角・140ms/コマ・下端ピボット |
| [clone-sigil](../../development/assets/skills/ninja/effects/clone-sigil/PROMPT.md) | 小さい紋、六つの尖端、外向きの破裂、崩れた紋 | 192角・130ms/コマ |
| [thousand-bloom](../../development/assets/skills/ninja/effects/thousand-bloom/PROMPT.md) | 六角の核、放射する白金の刃、拡大する衝撃輪、広がる影の破片 | 256角・140ms/コマ |

各保存先に `source/<id>-generated-v1.png`、`<id>-01.png`～`-04.png`、`<id>.png`、`manifest.json`、`PROMPT.md`、`review.png`、`preview.gif` を保存。全プロンプトと原画パス・切り出し区間は [ninja-fx-upgrade-generation.json](../../development/records/ninja-fx-upgrade-generation.json)。既存12種を含めてVFXは18種・66コマになった。

## 確認

- `node --test tests/ninja-skills.test.cjs`：9項目通過。全技・全ランクのダメージ予算、左右・攻撃速度、加入、既存モーション、追加VFXの透過・余白・異なる4コマを確認。
- `node tools/verify/verify-ninja-ui.cjs --lab-only`：21技、R1/R5、コマ送り、低速連続再生、左右、高速、地上／飛行／部位、分身、MP、モバイルの確認。
- `node tools/verify/verify-ninja-fx.cjs`：追加6シートが実際に描画されること、後半技のキャプチャ、左右の終撃、0.25倍の連続再生、攻撃速度10倍、演出OFF、終了後の消去、低減演出を確認。
- 生成シートをコマ順に確認し、確認ページの連続再生で発動・着弾・終撃・消失の順序を確認。

キャプチャは `output/ninja-fx/`、確認ページは [ninja-skill-lab.html?skill=thousand-shadow](../../development/labs/ninja-skill-lab.html?skill=thousand-shadow)。今回の変更は演出のみのため、バランス再調整は行っていない。

本編の通しUI確認は、並行追加中の呪術師の `assets/skills/shaman/effects/*/manifest.json` が未登録で404になり、ゲーム全体の素材読み込みが完了しないため保留。忍者確認ページは、共通シミュレーションに新しく加わった呪術師モジュールも読み込むよう接続済み。呪術師素材の登録後に `node tools/verify/verify-ninja-ui.cjs` で本編の通し確認を再実行できる。
