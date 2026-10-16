# 忍者 / 待機モーション v1

生成方法: 組み込み `image_gen`。`transparent_background: true`。CLI/API は使用せず、生成された RGBA 原画をそのままコピーしました。

参照の役割:

- `development/assets/references/ninja-original.png`: キャラクターデザイン。黒髪、赤リボン、赤マフラー、口元のマスク、金縁の黒装束、網地、4枚刃の手裏剣を引き継ぐ。
- `development/assets/warrior/source/warrior-idle-generated-v1.png`: ユーザー承認済みの画風、頭身、ドットの粒度、輪郭、陰影の基準。戦士の装備・配色は引き継がない。

## 使用したプロンプト全文

```text
Use case: stylized-concept.
Asset type: production pixel-art sprite sheet for a polished side-scrolling browser idle RPG. ONE transparent PNG with exactly FOUR animation frames in an equally sized 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. This is one coherent seamless breathing idle animation, not four character variations.

Input image 1 is the NINJA CHARACTER DESIGN reference only, not an art style reference. Input image 2 is the APPROVED WARRIOR STYLE reference only: match its head-to-body proportions, visible chunky square pixel clusters, detail density, outline weight, shading approach, and finish. Do not transfer the warrior's clothing, colors, equipment, face, sword, or hair color.

Adapt the SAME young female ninja from image 1: black hair in a high ponytail tied with a red bow and loose red ribbon tails, expressive brown eyes, black cloth mouth mask, deep red scarf with trailing ends, sleeveless charcoal-black wrap tunic with warm muted gold piping, fitted black shorts, short layered black skirt panels, red waist sash with red bow and a red hanging fabric panel, black fingerless gloves and bracers with red accents, selective fishnet at neckline/upper arms/thigh, black shin wraps and open-toed shinobi sandals with small red ties, small dark hip pouch and leg strap buckle, and a single SILVER FOUR-POINTED SHURIKEN with a circular center hole held in her forward right hand. Keep these recognizable details. No sword, kunai, extra weapons, cape, armor suit, helmet, or magic effects.

Composition: complete head-to-toe RIGHT-FACING side view for a belt-scrolling beat-em-up. Face, eyes and nose point clearly toward the right; torso can have a very shallow three-quarter side angle like the warrior style reference to make gear legible. Neutral grounded ready stance, knees slightly flexed, feet planted apart. Her forward hand holds the shuriken calmly at about chest/waist height with bent elbow, other hand close to waist; no throwing or attack pose. Ponytail and scarf trail gently backward to the left. Entire hair, ribbon tails, scarf ends, sandals and shuriken tips visible with generous transparent margin in EACH tile. Leave enough EMPTY transparent margin that no pixel touches a cell boundary. EXACTLY SAME size, horizontal position, foot baseline, proportions, face, clothing, shuriken shape, outline and pixel palette across all four tiles. The head-to-feet height and head size should match the approved warrior character, around 3.5 heads tall. Character occupies about 78 percent of each tile height. Align the sandal soles at precisely the same local y coordinate in every tile; never move either foot.

Animation frames: 1 neutral exhale, 2 torso/shoulders/head rise one logical pixel, 3 maximum gentle inhale torso/head rise two logical pixels and chest subtly expands, 4 torso/head return to one logical pixel raised. Knees/hips accommodate breathing while feet stay fixed. Ponytail tips, scarf and ribbon ends move at most one logical pixel with the breathing. Hands/shuriken shift consistently with torso by at most one logical pixel. Frame 4 flows back to frame 1. Very restrained breathing; NO walking, throwing, swinging, stance changes, major pose changes, camera changes or whole-body floating.

Style: exactly the quality and pixel-art treatment of the approved warrior style reference: high-quality hand-crafted arcade/JRPG pixel art, detailed but readable, about 96-128 logical pixels tall per character, deliberate clean square pixel clusters, one logical pixel dark colored outline, selective black fabric highlights, warm muted gold trim, crisp silver reflections, controlled palette, several clear shadow tones. True consistent square pixel grid, upscale with nearest neighbor so pixels remain sharp. No smooth linework, no anti-aliased illustration edges, no painted gradients, no 3D, no blur. Preserve her recognizable ninja design and female proportions rather than turning her into a generic masked assassin.

Background: genuinely transparent alpha everywhere outside the four characters. NO checkerboard baked into image, NO ground, NO cast shadows, NO border, NO tile separators, NO labels, NO text, NO watermark, NO UI. Four equal cells in a precise 2x2 sprite sheet, no extra frames.
```

生成原画: `source/ninja-idle-generated-v1.png`。2列×2行、左上→右上→左下→右下の4コマ。

最終素材: `ninja-idle.png`（640×160、1コマ160×160、右向き4コマ）、`idle-01.png`〜`idle-04.png`、`manifest.json`、`ninja-idle-preview.gif`（320×320、400ms×4の1.6秒無限ループ）。全コマ共通倍率で最近傍サンプリングし、接地ピボット(76,151)に位置合わせ。透過・余白・4コマ差分・接地チェックに合格。手裏剣などに生成由来の微細な輪郭差は残る。実際の倍率はmanifest参照。

