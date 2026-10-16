# 異次元の女神：本編登録と表示調整

2026-10-15。本編採用。[実装・採用値・検証](../../../../docs/implementation/extradimensional-goddess.md)。

2026-10-16追記：浮遊待機と帰還本体は [motion-v4](../motion-v4/README.md) で更新済み。以下の54コマの検収はv3時点の記録。現在の本編は59コマで、全体ビルドも最後にv4を登録する。

- 新規生成：内蔵image_genの指パッチン3コマ。全文は [snap-prompt.txt](snap-prompt.txt)、原画は `source/p1-snap.png`。基準は修正版の通常射撃F1と最初の座位リファレンス。
- `registration.json`：原画のハッシュ、参照元、区間ごとの固定縮尺、コマの表示原点。初稿とrepair-v2は変更しない。
- `review/`：本編の登録PNGから作った16クリップ54コマの全コマ一覧と連続再生GIF。帰還口の位置補正、本体の接地・上昇を保持する。
- 本編：`public/assets/enemies/extradimensional-goddess/`、背景は `public/assets/stages/extradimensional-goddess/`。
- 再現：`npm run build:goddess`。登録は最近傍縮小と配置。透明な外周だけがキャンバス外へ出る場合は全画素のアルファ0を検証して除外する。可視画素が外へ出る場合は失敗にする。

残存課題のある初稿アニメーションは取り込まず、修正済みポーズと本編のCanvasアニメーションを使う。最初の制作案の全36素材を一括合格に変更した記録ではない。採用した全54コマを確認し、本編で通常・低速再生、姿勢の接続、透過、見切れ、攻撃・帰還・終了状態を確認した。
