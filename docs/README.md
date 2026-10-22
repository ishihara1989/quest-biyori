# 文書の入口

[配置・追加基準](policies/repository-structure.md)・[共通開発方針](../AGENTS.md)

設計案には未採用の内容も含まれます。現行の制約は方針、採用値と挙動は実装記録、過去の経緯は履歴から確認します。

## 継続する方針と作業基準

- [ワークツリーを使う開発手順](policies/development-workflow.md)
- [テストと動作確認の方針](policies/testing-policy.md)
- [放置RPGのバランス方針](policies/balance-policy.md)
- [四足歩行の標準制作・検収手順](policies/quadruped-trot-production.md)
- [リポジトリの配置基準](policies/repository-structure.md)

- [基本5系統の試練（強靭・猛攻・頑強・女神の本気・ゲート解放）](implementation/simple-trials.md)
- [実績・転生の女神・転生システム（本編実装）](implementation/reincarnation-system.md)

## 設計・仕様・提案

- [転生の女神：SF兵器5種・大型トラック・ゲート帰還](design/reincarnation-goddess-arsenal.md)

- [転生・転生チャレンジ・実績システム企画（設計経緯・採用範囲は実装記録へ）](design/reincarnation-system-design.md)
- [転生ツリーのレビュー用モック（2026-10-18・未採用案）](design/reincarnation-tree-mock.md)

- [戦闘の引っかかり・描画性能とUI便利機能の初期調査（2026-10-15）](design/battle-performance-and-ui-review.md)
- [最終裏ボス：異次元の女神（設計と採用範囲）](design/extradimensional-goddess-design.md)
- [予備動作・行動妨害の設計と割り当て候補](design/action-interference-design.md)
- [多ステージ共通のバランス計算案](design/balance-formulas.md)
- [ジェムの地域レベル・生成・素材経済の設計案](design/gem-system-design.md)
- [エピックジェム12種・女神装備の原案と追加指示](design/epic-gems-and-goddess-equipment.md)
- [氷河：蒼氷の聖域／氷牙マンモス](design/glacier-stage-design.md)
- [氷河・火山・魔王城の危険行動と妨害企画](design/late-stage-danger-actions.md)
- [魔法使いのスキル（実装初期値）](design/mage-skill-design.md)
- [中盤〜後半の5地域企画](design/mid-late-stage-design.md)
- [巫女のアクティブスキル・召喚・モーション設計案](design/miko-skill-design.md)
- [忍者のアクティブスキル・モーション設計案](design/ninja-skill-design.md)
- [パラディンの聖技](design/paladin-skills.md)
- [放置系ARPG：プログレッション設計の相談記録](design/progression-design.md)
- [遺跡のステージ設計案](design/ruins-stage-design.md)
- [呪術師のアクティブスキル・モーション設計案](design/shaman-skill-design.md)
- [毒の沼地の敵キャラ](design/swamp-enemies.md)
- [戦士スキルとツリー](design/warrior-skill-design.md)

## 実装済み機能と検証

- [パッシブの成長能力を割合補正へ変更（2026-10-17）](implementation/passive-percent-stats.md)

- [通常ステージ1・5のABC編成（2026-10-17）](implementation/easy-stage-routes.md)
- [UI名称の短縮と説明表示の整理（2026-10-16）](implementation/ui-labels.md)
- [クリア時の報酬・戦闘中の育成・ジェム整理と性能改善（2026-10-15）](implementation/run-flow-and-performance.md)
- [エピックジェム12種・女神強化・通常ジェム拡張](implementation/epic-gems.md)

- [資料館：モーション・エフェクト再生](implementation/museum.md)
- [エフェクト72項目の画像化対応一覧（2026-10-16）](implementation/procedural-effects-inventory.md)
- [共通エフェクト6種・24コマの制作と検収](production/common-image-effects.md)
- [行動妨害の実装](implementation/action-interference-implementation.md)
- [装備強化の自動取得・解放通知（2026-10-12）](implementation/auto-gear-and-unlocks.md)
- [洞窟・海岸（2026-10-10）](implementation/cave-coast-progression.md)
- [金砂の墓域の実装](implementation/desert-stage-implementation.md)
- [次元の裂け目 / 次元の門](implementation/dimensional-rift.md)
- [混沌の門：魔王城クリア後の特殊ステージ](implementation/chaos-gate.md)
- [忍者・呪術師・巫女のパッシブ](implementation/expansion-passives.md)
- [ジェム再設計の実装](implementation/gem-system-implementation.md)
- [魔王城：宵闇の玉座・レベル上限100](implementation/demon-castle-stage.md)
- [火山：紅蓮の竜脈 — 本編実装](implementation/volcano-stage-implementation.md)
- [嵐渡りの高原 — 本編実装](implementation/highland-stage-implementation.md)
- [素材変換](implementation/material-conversion.md)
- [巫女・古代遺跡の本編実装](implementation/miko-ruins-implementation.md)
- [忍者の実装記録](implementation/ninja-implementation.md)
- [呪術師の実装・素材・検証](implementation/shaman-implementation.md)
- [毒の沼地の本編実装](implementation/swamp-progression.md)

- [蒼氷の聖域の実装と素材](implementation/glacier-stage.md)

## 素材制作と引き継ぎ

- [転生の女神の基本モーション（制作候補・4種17コマ）](production/reincarnation-goddess-basic-motions.md)

- [GitHub・Git LFS・Cloudflare Pagesの運用](production/github-lfs-and-cloudflare.md)

- [異次元の女神／界外の御座の実装・難度・検証](implementation/extradimensional-goddess.md)

- [異次元の女神：一次生成・一次検収と課題](production/extradimensional-goddess-first-pass-review.md)
- [異次元の女神：修正第1回・満足して異次元へ帰還](production/extradimensional-goddess-repair-review.md)
- [異次元の女神：モーション・エフェクト制作計画](production/extradimensional-goddess-asset-plan.md)
- [火山・魔王城の初回素材生成と課題](production/late-stage-first-pass-handoff.md)
- [火山モーションの修正・検収完了](production/volcano-motions-status.md)
- [魔神：二腕・無面・浮遊の再制作](production/demon-god-redesign.md)
- [魔王城：モーションとエフェクトの修正・検収完了](production/demon-castle-motions-status.md)
- [氷河モーションの制作・検収](production/glacier-motion-review.md)
- [装備アイコンのリファイン（2026-10-11）](production/equipment-icon-refinement.md)
- [高原モーションの受け渡し](production/highland-motion-handoff.md)
- [座標ガイドによるマンティコアtrot改良](production/manticore-trot-coordinate-guide.md)
- [マンティコアのtrot試作](production/manticore-trot-trial.md)
- [巫女の召喚・動作・演出素材](production/miko-asset-handoff.md)
- [忍者エフェクト追加（2026-10-10）](production/ninja-fx-enhancement.md)
- [パラディンの追加モーション](production/paladin-motion-design.md)
- [忍者・呪術師・巫女の追加モーション](production/ritual-motion-design.md)
- [巫女・遺跡の追加画像：生成・差し替え記録](production/ruins-image-generation-pending.md)
- [呪術師の全身詠唱・DoT・後半演出の拡張](production/shaman-fx-enhancement.md)
- [8枚の歩行・後退 再制作基準（2026-10-06）](production/walk-cycle-review.md)

## 過去の変更と開発経緯

- [2026-10-13 リポジトリ整理](history/repository-reorganization.md)
- [Idle RPG — Sprite Lab](history/development-log.md)
- [始まりの森：育成の試作仕様](history/forest-progression-prototype.md)
- [敵編成・難易度の調整](history/stage-balance-adjustment.md)
- [ウェーブ上限・巫女加入後の難易度調整](history/wave-balance-adjustment.md)

## 分類先が未確定の文書

- [未分類の文書](unclassified/README.md)

- [転生の女神：追加モーションとエフェクトの制作・検収](production/reincarnation-goddess-arsenal.md)
