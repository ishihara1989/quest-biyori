# 歴代ボス20体：再利用元と接続課題

既存モーション・FXの在庫確認。新規生成・修正・女神戦への接続は未実施。元ボスの実装は変更しない。原点や時刻は既存マニフェストの値で、女神戦用の実測ではない。

| 地域 | 幻影・技 | 既存本体 | FX | 接続課題 |
| --- | --- | --- | --- | --- |
| 森 | アルラウネ／蔓叩き | [vine-slam](../../../../public/assets/enemies/alraune/motions/vine-slam/manifest.json) 4コマ | 本体内の蔓 | 蔓先の直接判定。掌起点に置換しない |
| 森 | トレント／根の突き上げ | [root-bury](../../../../public/assets/enemies/treant/motions/root-bury/manifest.json) 4コマ | [root-eruption](../../../../public/assets/effects/root-eruption/manifest.json) | 根は対象の床起点。本体は地中へ差し込む構え |
| 沼地 | リッチ／闇の大魔法 | [dark-cast](../../../../public/assets/enemies/lich/motions/dark-cast/manifest.json) 4コマ | [lich-dark-magic](../../../../public/assets/effects/lich-dark-magic/manifest.json) | 杖先／effectPreview.originを基準にする |
| 沼地 | ヒュドラ／毒ブレス | [breath](../../../../public/assets/enemies/hydra/motions/breath/manifest.json) 4コマ | [hydra-poison-breath](../../../../public/assets/effects/hydra-poison-breath/manifest.json) | 口起点。chargeからbreathへの接続は短縮時に調整 |
| 洞窟 | アラクネ／糸の術 | [web](../../../../public/assets/enemies/arachne/motions/web/manifest.json) 4コマ | [spider-web-bolt](../../../../public/assets/effects/spider-web-bolt/manifest.json)、[spider-web-slow](../../../../public/assets/effects/spider-web-slow/manifest.json) | 口・糸の発射点。着弾後の糸は独立保持 |
| 洞窟 | ケイブトロール／三連叩きつけ | [slam](../../../../public/assets/enemies/cave-troll/motions/slam/manifest.json) 4コマ | [cave-quake](../../../../public/assets/effects/cave-quake/manifest.json) | 1回分slamを3連に編集する短縮シーケンスは未作成 |
| 海岸 | スキュラ／触手薙ぎ | [tentacle](../../../../public/assets/enemies/scylla/motions/tentacle/manifest.json) 4コマ | [sea-slam](../../../../public/assets/effects/sea-slam/manifest.json) | 既存は触手叩きつけ。円弧状の薙ぎとの形状差を要判断 |
| 海岸 | クラーケン／水ブレス | [breath](../../../../public/assets/enemies/kraken/motions/breath/manifest.json) 4コマ | [water-breath](../../../../public/assets/effects/water-breath/manifest.json) | 口起点。水流を幻影消失後も独立保持 |
| 遺跡 | 魔導人形セラフィナ／三連光柱 | [pillars](../../../../public/assets/enemies/seraphina/motions/pillars/manifest.json) 4コマ | [ruins-light-pillar](../../../../public/assets/effects/ruins-light-pillar/manifest.json) | 3地点の柱は対象床起点。最後の柱配置後に回収 |
| 遺跡 | 古代機兵タイタン／炉心ビーム | [beam](../../../../public/assets/enemies/ancient-titan/motions/beam/manifest.json) 4コマ | [ruins-furnace-beam](../../../../public/assets/effects/ruins-furnace-beam/manifest.json) | 炉心originを独立FXへ移す。消失でビームを消さない |
| 砂漠 | ラミア／砂縛り | [binds](../../../../public/assets/enemies/lamia/motions/binds/manifest.json) 4コマ | [desert-sand-burst](../../../../public/assets/effects/desert-sand-burst/manifest.json) | 対象床起点。既存actionには発射点の座標がない。砂縛りの輪郭にはsand-burstを再利用候補とする |
| 砂漠 | 砂喰いベヒモス／地割れ | [quake](../../../../public/assets/enemies/sand-behemoth/motions/quake/manifest.json) 4コマ | [desert-fissure](../../../../public/assets/effects/desert-fissure/manifest.json) | 床起点。地割れの枝分かれと進行向き |
| 高原 | ハーピークイーン／風の円 | [ring](../../../../public/assets/enemies/harpy-queen/motions/ring/manifest.json) 4コマ | [highland-wind-ring](../../../../public/assets/effects/highland-wind-ring/manifest.json) | 元の中心固定。押出し判定との同期は後続 |
| 高原 | マンティコア／毒尾の扇射 | [venom](../../../../public/assets/enemies/manticore/motions/venom/manifest.json) 4コマ | [highland-venom](../../../../public/assets/effects/highland-venom/manifest.json) | 尾先起点。3方向-18/0/+18度の弾を独立保持 |
| 氷河 | 雪女／薄氷の封輪 | [seal](../../../../public/assets/enemies/yuki-onna/motions/seal/manifest.json) 4コマ | [glacier-seal](../../../../public/assets/effects/glacier-seal/manifest.json) | 対象床起点。元4.6秒予告の短縮は未編集 |
| 氷河 | 氷牙マンモス／白夜の氷冠 | [crown](../../../../public/assets/enemies/ice-tusk-mammoth/motions/crown/manifest.json) 4コマ | [glacier-crown](../../../../public/assets/effects/glacier-crown/manifest.json) | 床の段階輪。3段の最後の直接判定後に回収 |
| 火山 | ドラゴンガール／紅翼竜息 | [danger-2](../../../../public/assets/enemies/dragon-girl/motions/danger-2/manifest.json) 4コマ | [volcano-fire-beam](../../../../public/assets/effects/volcano-fire-beam/manifest.json) | 口起点。2回のブレス。既存採用モーションあり |
| 火山 | ドラゴン／双脈ブレス | [danger-2](../../../../public/assets/enemies/dragon/motions/danger-2/manifest.json) 4コマ | [volcano-fire-beam](../../../../public/assets/effects/volcano-fire-beam/manifest.json) | 口起点。2帯を独立FXとして残す |
| 魔王城 | リリス／宵闇の花冠 | [danger-1](../../../../public/assets/enemies/lilith/motions/danger-1/manifest.json) 4コマ | [castle-dark-flower](../../../../public/assets/effects/castle-dark-flower/manifest.json) | 3地点の花冠。最終配置後すぐ回収 |
| 魔王城 | 魔神／終焉の交差 | [danger-4](../../../../public/assets/enemies/demon-god/motions/danger-4/manifest.json) 4コマ | [castle-cross-beam](../../../../public/assets/effects/castle-cross-beam/manifest.json)、[castle-end-ring](../../../../public/assets/effects/castle-end-ring/manifest.json) | 交差二帯と薄輪は別FX、最後の直接判定後に回収 |

全20体とも女神戦専用の縮尺・短縮時間・星鏡表示・回収は未検証。ケイブトロールの三連化とスキュラの薙ぎ形状を優先判断する。現時点の元イベント時刻と原点は [JSON](phantom-reuse.json) を参照。
