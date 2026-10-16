# 遺跡：背景・敵デザインの初稿

2026-10-10 JST。組み込み image_gen で制作したデザイン確認用の静止画。デザインの採用は未確定、モーション制作は未着手。

## 確認

- [確認ページ](review.html)：背景合成、敵8種、明暗の下地切り替え、原画へのリンク。
- [背景合成](background-preview.png)
- [敵8種の一覧](enemy-lineup.png)：上段が雑魚、下段がボス。一覧では形が見やすい大きさに揃えており、ゲーム内のサイズ比は未確定。

## 背景素材

| 素材 | PNG | 仕様 |
| --- | --- | --- |
| 遠景 | [distant.png](distant.png) | 1672×941、不透明 |
| 石床＋近景 | [ground-near.png](ground-near.png) | 1672×941、上部は透過 |

論理画面1024×576、接地範囲Y323〜512を想定。2層を同じ大きさで重ねる。背景の連続スクロールと繰り返しの実装検証は、デザイン確定後に行う。

## 敵の基準デザイン

| 敵 | 透過PNG | 役割 |
| --- | --- | --- |
| 石の衛兵 | [stone-guard.png](stone-guard.png) | 近距離物理 |
| ルーンガーゴイル | [rune-gargoyle.png](rune-gargoyle.png) | 近距離魔法 |
| 古代の弩兵 | [ancient-crossbowman.png](ancient-crossbowman.png) | 遠距離物理 |
| 浮遊魔導器 | [floating-magic-core.png](floating-magic-core.png) | 遠距離魔法 |
| 重装ゴーレム | [armored-golem.png](armored-golem.png) | ボス・近距離物理 |
| 古代弩砲兵 | [ancient-ballista.png](ancient-ballista.png) | ボス・遠距離物理 |
| 魔導人形セラフィナ | [seraphina.png](seraphina.png) | 女性型ボス・魔法 |
| 古代機兵タイタン | [ancient-titan.png](ancient-titan.png) | 大ボス・物理／魔法 |

敵は1254×1254の透過PNG。全8種を左向きの静止ポーズで揃えた。石・青銅・金の紋様・青白い魔導核が共通意匠。ボス4種は余白を広げたv2を確認用の原画として選択し、初版もsource内に保存した。

生成されたPNGはRGBAを加工せずコピーして保存。一覧は表示用に配置・nearest-neighborで縮小したもの。実際の戦闘表示サイズ、アニメーション、当たり判定は未作成。

## 記録

- [全文プロンプト](PROMPTS.md)
- [生成・修正履歴](generation.json)
- [素材情報](manifest.json)
- [寸法・透過・画像端の検査](qa.json)

全8種の透過、画像端での実体の見切れがないこと、背景2層の寸法一致と上部透過、合成と一覧の見た目を確認。形・配色・視点を後続モーションでも維持するため、確定後は選択したsource原画を基準リファレンスにする。

## 再構築

```powershell
node tools/assets/prepare-ruins-design.cjs
node tools/assets/build-ruins-design-preview.cjs
```

初回の原画コピーが済んでいる場合、再構築はこのフォルダー内のsourceを使用する。ゲーム本編の敵一覧・進行データには接続していない。

