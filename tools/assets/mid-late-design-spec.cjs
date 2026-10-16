'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
// Static review only. This data is deliberately not registered with battle code.
const path = require('../lib/project-paths.cjs').assetPaths;
const fs = require('node:fs');
const root = path.resolve(__dirname, '../../public/assets/mid-late-design/v1');
const regions = [
  { id:'desert', name:'砂漠', title:'金砂の墓域', levels:'51–60', palette:'#d9ad55',
    scene:'amber dunes surrounding an ancient partially buried sandstone mortuary temple, turquoise inset stones, distant pyramid-like mausoleums, a pale hot sky, calm spacious sandy arena',
    props:['a low broken sandstone obelisk with turquoise inset','a cluster of small ochre rocks and dry cactus','a partly buried ornate golden sarcophagus','a ruined sandstone arch with turquoise stone'],
    enemies:[
      ['sand-scorpion','サンドスコーピオン','A','a small amber scorpion, black pincers, one green venom stinger'],
      ['bandage-soldier','包帯兵','B','a standing ancient mummy soldier, dry beige bandages, one curved bronze sword, turquoise glowing eyes'],
      ['sand-snake','砂蛇','C','a small sandy pale snake, turquoise dorsal fins, coiled serpentine body, no arms'],
      ['obsidian-scorpion','オブシディアンスコーピオン','A+','a massive obsidian-black scorpion, huge asymmetric pincers, gold joints, thick arched green-tipped tail'],
      ['golden-pharaoh','黄金のファラオ','B+','a male undead pharaoh, elaborate gold funerary mask and tall royal crown, turquoise staff, dark bandage robes'],
      ['lamia','ラミア','C+','an adult female lamia, gold serpentine lower body with a single long coiled tail, turquoise fitted ceremonial clothing, gold jeweled crown, long dark hair, elegant dangerous face, fully clothed upper body'],
      ['sand-behemoth','砂喰いベヒモス','D','a colossal stocky quadruped behemoth, rock-armored back, two enormous forward-curving horns, sandy mane, muscular bull-like limbs, no wings, no serpent tail']
    ],
    drops:[['scorpion-pincer','砂蠍の鋏','A','one curved amber and black scorpion pincer'],['ancient-bandage','古代の包帯','B','a small rolled ancient ivory bandage with frayed ends'],['sand-snake-scale','砂蛇の鱗','C','three overlapping pale gold snake scales with turquoise edges'],['desert-crystal','砂漠の結晶','結晶','a sharp upright amber crystal cluster, turquoise mineral center'],['behemoth-horn','ベヒモスの角','レア','one huge curved ivory behemoth horn with dark rocky base']]
  },
  { id:'highland', name:'高原', title:'嵐渡りの高原', levels:'61–70', palette:'#85bf9c',
    scene:'windswept highland meadow on tall cliffs, layered green hills and gray rock terraces, distant storm clouds with gentle sunlight breaks, open grassy arena',
    props:['a low gray rock and tall wind-bent grass cluster','an old standing stone with a spiral wind rune','a weathered dead tree bent by wind','a broken cliff-edge rock ledge with hanging grass'],
    enemies:[
      ['horn-jackal','ホーンジャッカル','A','a slender brown jackal beast with two small backward horns and long legs'],
      ['rock-horn-goat','岩角ヤギ','B','a stocky gray-brown mountain goat with rounded stone spiral horns'],
      ['wind-sprite','風の小精霊','C','a small floating green-cyan wind spirit with a visible face, swirling lower body and leaf crown'],
      ['storm-jackal','ストームジャッカル','A+','a tall slender jackal beast, blue-white flowing mane, two large lightning-shaped horns, dark teal fur and long legs'],
      ['iron-horn','アイアンホーン','B+','an immense heavy mountain ram, massive black iron spiral horns, rock plates on chest and shoulders, thick sturdy legs'],
      ['harpy-queen','ハーピークイーン','C+','an adult female harpy queen, elegant woman face and clothed torso, white and violet-blue feathered wing arms, bird talons, jeweled crown, wide clear wing silhouette'],
      ['manticore','マンティコア','D','a giant red-brown lion-bodied manticore, fearsome mature humanoid face, purple bat wings, articulated scorpion tail with a green venom tip, four powerful paws']
    ],
    drops:[['horn-beast-fang','角獣の牙','A','a pair of slender ivory beast fangs with brown root'],['rock-horn-fragment','岩角の欠片','B','a curved chipped gray stone horn segment'],['wind-spirit-feather','風精の羽','C','one long pale teal feather with a curved cyan tip'],['highland-crystal','高原の結晶','結晶','a faceted upright green-cyan crystal with a silver mineral base'],['manticore-tail','マンティコアの毒尾','レア','a curved purple armored scorpion tail section with an emerald venom stinger']]
  },
  { id:'glacier', name:'氷河', title:'蒼氷の聖域', levels:'71–80', palette:'#87c6ef',
    scene:'deep blue glacial sanctuary, towering layered ice walls and snow mountains, faint mint aurora in a twilight blue sky, a spacious flat blue-white snow and ice arena, distant icy temple silhouette',
    props:['a low dark-blue ice boulder capped with snow','a translucent blue ice crystal cluster','a frozen bare tree with icicles','a broken frost-covered stone pillar with blue runes'],
    enemies:[
      ['frost-wolf','フロストウルフ','A','a white wolf with a navy blue back, small icy blue fangs and dark outlined fur'],
      ['ice-shell-golem','氷殻ゴーレム','B','a stocky snow-covered dull blue ice golem with thick round arms and a small recessed face'],
      ['snow-sprite','雪の精','C','a small floating blue-eyed snow spirit surrounded by six simple snow-crystal points'],
      ['fenrir','フェンリル','A+','an enormous white and dark-navy wolf, huge navy mane, icy fangs, luminous blue runes on shoulders, imposing quadruped stance'],
      ['crystal-golem','クリスタルゴーレム','B+','a giant angular transparent blue ice-crystal golem, large faceted chest core with violet inner light, huge faceted forearms'],
      ['yuki-onna','雪女','C+','an adult female snow spirit, long white hair, elegant white and deep indigo kimono, crystalline snow crown, floating lower hem, pale face with visible dark outline, no wings or tail'],
      ['ice-tusk-mammoth','氷牙マンモス','D','a colossal woolly mammoth, huge domed shoulders, exactly four thick elephant legs, long flexible trunk, two enormous curved translucent azure ice tusks with ivory roots, silver-white shaggy wool with navy shadows, small round ears, three broad glacial crystal slabs on the back, cyan eyes, left-facing three-quarter grounded stance']
    ],
    drops:[['ice-wolf-fang','氷狼の牙','A','two white wolf fangs with blue frosted roots'],['ice-shell-fragment','氷殻の欠片','B','a chunky dull blue ice shell fragment with snow edge'],['snow-spirit-flower','雪精の花','C','one six-petal crystalline white and blue snow flower'],['glacier-crystal','氷河の結晶','結晶','a tall clear azure faceted crystal cluster with violet center'],['mammoth-ice-tusk','マンモスの氷牙','レア','one thick curved mammoth tusk, ivory-white root with a few silver wool strands, translucent azure crystalline shell and a luminous icy-white tip']]
  },
  { id:'volcano', name:'火山', title:'紅蓮の竜脈', levels:'81–90', palette:'#e77f58',
    scene:'black basalt volcanic valley, distant erupting mountain and dragon nesting spires, orange lava rivers along the far edges, smoky red-gray sky, wide calm dark charcoal rock arena in foreground with sparse dim orange cracks',
    props:['a low black basalt boulder with a small glowing orange fissure','a cluster of sharp obsidian spires','a half-buried dragon rib and skull fragment','a broken basalt shrine pillar with an ember rune'],
    enemies:[
      ['lava-salamander','ラヴァサラマンダー','A','a small quadruped black and orange salamander lizard, lava dorsal fins'],
      ['obsidian-soldier','黒曜兵','B','a humanoid soldier in black obsidian armor, one single-bladed axe, dim gold seams in armor'],
      ['young-fire-dragon','幼火竜','C','a small red winged quadruped dragon, orange wing membranes, short horns and small tail'],
      ['magma-salamander','マグマサラマンダー','A+','a huge thick quadruped salamander, cracked black armor with lava-orange interior, thick orange tail and broad head, no wings'],
      ['obsidian-executioner','黒曜の処刑者','B+','a towering black obsidian executioner, fully enclosed pointed helmet, broad angular shoulders, massive double-bladed axe'],
      ['dragon-girl','ドラゴンガール','C+','an adult female dragon humanoid, mature woman face, red horns and wings, long dragon tail, fitted fully clothed black-and-red scale armor, dragon-clawed legs and hands, no handheld weapon'],
      ['red-dragon','ドラゴン','D','a colossal red-black four-legged winged dragon, long neck, two large backward horns, wide orange wing membranes, lava-lit chest, full long tail, regal fearsome face']
    ],
    drops:[['fire-lizard-hide','火蜥蜴の皮','A','a small folded black reptile hide with orange glowing scale seams'],['obsidian-blade-shard','黒曜の刃片','B','an angular chipped black obsidian axe blade fragment with gold edge'],['fire-dragon-scale','火竜の鱗','C','three overlapping dark red dragon scales with orange rim'],['volcano-crystal','火山の結晶','結晶','a bright upright orange-red faceted crystal with black basalt base'],['dragon-furnace-heart','ドラゴンの炉心','レア','a round fiery orange dragon heart core wrapped in black-red curved scale plates']]
  },
  { id:'demon-castle', name:'魔王城', title:'宵闇の玉座', levels:'91–100', palette:'#b396df',
    scene:'grand demonic castle throne hall, black-purple stone arches, distant gold-trimmed throne and enormous moonlit gothic window, deep crimson carpet in the distance, purple braziers along far sides, wide flat dark slate arena in foreground',
    props:['a low black-purple stone rubble pile with gold ornament','a gothic black brazier holding a small violet flame','a broken gold-trimmed demon statue bust','a tall black-and-gold pillar segment with a crimson hanging banner'],
    enemies:[
      ['demon-armor-soldier','魔鎧兵','A','a black armored humanoid soldier, red eyes, rectangular shield and straight sword'],
      ['imp','インプ','B','a small purple imp devil, pointed ears, short horns and tiny bat wings, squat creature proportions'],
      ['dream-demon','夢魔','C','a petite but clearly adult female dream demon, pale violet hair, fully clothed black-purple tunic, small bat wings, no childlike features'],
      ['black-knight','黒騎士','A+','a towering black knight, large two-handed sword, crimson cloak, fully closed horned helmet, gold armor trim'],
      ['arch-demon','アークデーモン','B+','a hulking demon with two thick horns, massive arms, violet wings, red glowing abdominal core, dark armored hide'],
      ['lilith','リリス','C+','an adult female demon queen Lilith, large curved horns, wide black-purple wings, long silver-violet hair, ruby crown, fully clothed elegant black and deep crimson royal outfit, mature dangerous face'],
      ['demon-god','魔神','D','a colossal six-armed demon god with exactly six visible arms in three symmetric pairs, black-and-gold armor, six crown horns, violet-red chest core, two armored legs, one large floating dark halo behind, no handheld weapons']
    ],
    drops:[['demon-armor-fragment','魔鎧の破片','A','a jagged black armored plate fragment with gold trim and red scar'],['demon-horn','悪魔の角','B','one short curved purple-black devil horn'],['dream-demon-feather','夢魔の羽','C','one soft curved silver-violet magical feather with dark base'],['castle-crystal','魔城の結晶','結晶','a tall violet and crimson faceted mineral crystal with black base'],['demon-god-heart','魔神の心核','レア','a purple-red spherical divine demon core in an ornate black-gold six-point cage']]
  }
];
const style = 'Refined fantasy JRPG pixel-art taste, crisp deliberate pixel clusters and stepped edges, detailed readable silhouettes, rich limited palettes, dark outline, no watercolor, no smooth airbrush, no photographic texture, no 3D render. A consistent late-1990s high-detail sprite aesthetic. No text, no labels, no watermark.';
function prompt(region, kind) {
  if(kind==='background')return `Use case: stylized-concept\nAsset type: static 16:9 battle-map background PNG, landscape, ideally 1536x864.\nPrimary request: ${region.scene}.\nStyle: ${style}\nComposition: side-view RPG battlefield with mild 3/4 depth, horizon at 55 percent of image height. Keep x=10..90 percent and y=56..89 percent a broad unobstructed flat walking surface. All tall architecture is behind the horizon, not blocking characters. Foreground decoration only at extreme bottom corners. Calm lower contrast floor and vivid detailed distant scenery. No characters, enemies, UI, attack effects, grid or lettering. Entire rectangle painted; opaque backdrop. Pixel-art background, not a poster.`;
  if(kind==='props')return `Use case: stylized-concept\nAsset type: transparent PNG environment-prop atlas, square, 2 columns by 2 rows, four STATIC separate objects, not animation.\nPrimary request: ${region.name} environment props: top-left ${region.props[0]}; top-right ${region.props[1]}; bottom-left ${region.props[2]}; bottom-right ${region.props[3]}.\nStyle: ${style}\nComposition: each object fully contained in its exact equal quadrant with 12 percent clear padding on all sides, bottom of object at 86 percent of its cell height. Side-view with mild 3/4 depth matching a RPG battlefield. Separate four complete objects, no contact between cells. Background truly transparent alpha, no ground slab, no cast shadow beyond the object, no borders, checkerboard, text or labels. Restrained highlights. These are background decoration objects, not drop items.`;
  if(kind==='drops')return `Use case: stylized-concept\nAsset type: transparent PNG inventory-material atlas, wide 3:2, exact 3 columns by 2 rows, five STATIC isolated inventory icons, not animation.\nPrimary request: top row left ${region.drops[0][3]}, top row center ${region.drops[1][3]}, top row right ${region.drops[2][3]}; bottom row left ${region.drops[3][3]}, bottom row center ${region.drops[4][3]}; bottom right EMPTY fully transparent.\nStyle: ${style}\nComposition: each icon centered in its exact equal grid cell, isolated with at least 18 percent transparent padding to every cell boundary. Simple strong silhouettes, chunky pixels, no floor, no shadow plate, no surrounding particle cloud. All five icons similar visual size, vivid highlights. Actual transparent alpha background, no frames, checkerboard, words, numerals, rarity badges, coins or extra icons. All icons fully visible.`;
  return `Use case: stylized-concept\nAsset type: transparent PNG static monster DESIGN atlas, square high-resolution ideally 1536x1536, EXACT 3 columns by 3 equal rows. Seven DISTINCT creatures; not animation.\nPrimary request: ${region.name} monsters. TOP ROW, left cell ${region.enemies[0][3]}; center cell ${region.enemies[1][3]}; right cell ${region.enemies[2][3]}. MIDDLE ROW, left cell ${region.enemies[3][3]}; center cell ${region.enemies[4][3]}; right cell ${region.enemies[5][3]}. BOTTOM ROW only CENTER cell ${region.enemies[6][3]}; bottom-left and bottom-right cells completely EMPTY and transparent.\nStyle: ${style}\nComposition: exact equally spaced 3x3 grid. One complete creature per occupied cell, all facing LEFT in mild 3/4 side view, a single calm neutral standing or hovering pose. Show entire head, every limb, full wings and tails, all weapons. Keep at least 10 percent clear padding to EVERY cell boundary, no object extends outside its own cell. Normal creatures in top row occupy about 55-65 percent of cell; bosses occupy about 75 percent. Female bosses are adults with mature faces, fully clothed or armored. Bottom-center creature has enough space to show its full silhouette. Do not add any creature to empty cells. True transparent background alpha, no floors, scenery, cast shadow plates, frames, checkerboard, labels, text, attack VFX or multiple poses. Preserve distinct species and colors, no duplicate enemies.`;
}
const assets = regions.flatMap(region=>['background','props','drops','monsters'].map(kind=>({id:`${region.id}-${kind}`,region:region.id,kind,transparent:kind!=='background',file:`${region.id}/${kind}.png`,prompt:prompt(region,kind)})));
if(require.main===module){
  makeAssetDirectory(root,{recursive:true});
  for(const region of regions)makeAssetDirectory(path.join(root,region.id,'source'),{recursive:true});
  const currentAssets=assets.map(a=>({...a,currentFile:a.region==='glacier'&&a.kind==='monsters'?'glacier/monsters-v3.png':a.region==='glacier'&&a.kind==='drops'?'glacier/drops-v2.png':a.file}));
  writeAssetJson(path.join(root,'spec.json'), {date:'2026-10-12 JST',status:'awaiting-design-review',generation:'built-in image_gen',motionProduction:'not-started',dangerActionPlan:'DANGER-ACTIONS.md',glacierPlan:'GLACIER-PLAN.md',regions,assets:currentAssets});
  fs.writeFileSync(path.join(root,'PROMPTS.md'),'# 画像生成プロンプト\n\n組み込み image_gen 使用。静止画のみ。\n\n'+assets.map(a=>`## ${a.id}\n\n透明背景: ${a.transparent}\n\n\`\`\`text\n${a.prompt}\n\`\`\`\n`).join('\n'));
  console.log(JSON.stringify({root,regions:regions.length,assets:assets.length,enemies:regions.reduce((n,r)=>n+r.enemies.length,0),drops:regions.reduce((n,r)=>n+r.drops.length,0)}));
}
module.exports={root,regions,assets};
