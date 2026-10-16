'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs');
const path = require('../lib/project-paths.cjs').assetPaths;
const sharp = require('sharp');
const root = path.resolve(__dirname, '../../public/assets/ruins-design/v1');
const spec = JSON.parse(fs.readFileSync(path.join(root, 'generation.json'), 'utf8'));
const qa = JSON.parse(fs.readFileSync(path.join(root, 'qa.json'), 'utf8'));
const roles = ['近距離・物理', '近距離・魔法', '遠距離・物理', '遠距離・魔法', 'ボス・近距離物理', 'ボス・遠距離物理', '女性型ボス・魔法', '大ボス・物理／魔法'];
const latin = ['STONE GUARD', 'RUNE GARGOYLE', 'CROSSBOWMAN', 'FLOATING MAGIC CORE', 'ARMORED GOLEM', 'ANCIENT BALLISTA', 'SERAPHINA', 'ANCIENT TITAN'];
const xml = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const textSvg = (w, h, lines) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><style>text{font-family:Yu Gothic,Meiryo,Arial,sans-serif}</style>${lines.map(l => `<text x="${l.x || 0}" y="${l.y}" font-size="${l.size}" font-weight="${l.weight || 400}" fill="${l.color || '#e8dcc5'}">${xml(l.text)}</text>`).join('')}</svg>`);
async function main() {
  const bgInfo = await sharp(path.join(root, 'distant.png')).metadata();
  const groundInfo = await sharp(path.join(root, 'ground-near.png')).metadata();
  if (bgInfo.width !== groundInfo.width || bgInfo.height !== groundInfo.height) throw new Error('Background layer dimensions differ');
  await sharp(path.join(root, 'distant.png')).composite([{ input: path.join(root, 'ground-near.png') }]).png().toFile(path.join(root, 'background-preview.png'));
  const enemies = spec.assets.filter(a => a.kind === 'enemy');
  const width = 1920, height = 1320, cellW = 464, cellH = 556, gap = 12, startX = 14, startY = 140;
  const layers = [{ input: textSvg(width, 112, [
    { x: 32, y: 50, size: 36, weight: 700, text: '遺跡 — 基準デザイン案' },
    { x: 34, y: 86, size: 21, color: '#9faeba', text: '上段：雑魚4種　／　下段：ボス4種　　静止画・デザイン確認用' }
  ]), left: 0, top: 0 }];
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i], left = startX + (i % 4) * (cellW + gap), top = startY + Math.floor(i / 4) * (cellH + gap);
    const frame = await sharp({ create: { width: cellW, height: cellH, channels: 4, background: '#1b2732' } }).png().toBuffer();
    layers.push({ input: frame, left, top });
    const metrics = qa.assets.find(q => q.id === a.id), b = metrics.opaqueBounds;
    const cropLeft = Math.max(0, b.left - 12), cropTop = Math.max(0, b.top - 12);
    const cropRight = Math.min(metrics.width - 1, b.right + 12), cropBottom = Math.min(metrics.height - 1, b.bottom + 12);
    const img = await sharp(path.join(root, a.file)).extract({ left: cropLeft, top: cropTop, width: cropRight - cropLeft + 1, height: cropBottom - cropTop + 1 }).resize({ width: 418, height: 430, fit: 'inside', kernel: 'nearest' }).png().toBuffer({ resolveWithObject: true });
    layers.push({ input: img.data, left: left + Math.floor((cellW - img.info.width) / 2), top: top + 12 + Math.floor((430 - img.info.height) / 2) });
    layers.push({ input: textSvg(cellW, 100, [
      { x: 22, y: 31, size: 25, weight: 700, text: a.label },
      { x: 22, y: 60, size: 19, color: '#d4b985', text: roles[i] },
      { x: 22, y: 84, size: 15, color: '#8a9ba9', text: latin[i] }
    ]), left, top: top + 447 });
  }
  await sharp({ create: { width, height, channels: 4, background: '#0e1822' } }).composite(layers).png().toFile(path.join(root, 'enemy-lineup.png'));
  const cards = enemies.map((a, i) => `<figure><a href="${a.file}" target="_blank" title="${a.label}の原画を開く"><img src="${a.file}" alt="${a.label}" loading="lazy"></a><figcaption><strong>${a.label}</strong><span>${roles[i]}</span></figcaption>${a.sources.length > 1 ? `<details><summary>初版との比較</summary><a href="${a.sources[0].file}" target="_blank">初版の原画</a></details>` : ''}</figure>`).join('\n');
  const html = `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>遺跡のデザイン確認</title><style>
  *{box-sizing:border-box}body{margin:0;background:#0e1822;color:#e8dcc5;font:16px/1.6 "Yu Gothic",Meiryo,sans-serif}main{max-width:1500px;margin:auto;padding:32px 20px}h1{font-size:28px;margin:0}p{color:#aab8c4;margin:8px 0 24px}a{color:#9adce9}nav{display:flex;gap:18px;flex-wrap:wrap;margin:18px 0}.background{display:block;width:100%;height:auto}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:24px}figure{background:#1b2732;margin:0;padding:12px}figure img{width:100%;aspect-ratio:1;object-fit:contain;image-rendering:pixelated}figcaption strong,figcaption span{display:block}figcaption strong{font-size:19px}figcaption span{color:#d4b985}details{margin-top:10px;font-size:14px}.controls{display:flex;gap:10px;margin:14px 0}button{background:#253a48;color:#e8dcc5;border:1px solid #647480;padding:7px 12px;cursor:pointer}.light figure{background:#d8e0e6;color:#17202b}.light figcaption span{color:#735119}@media(max-width:850px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:440px){.grid{grid-template-columns:1fr}}
  </style><main><h1>遺跡のデザイン確認</h1><p>背景2層＋敵8種。デザイン確定前の静止画です。</p><nav><a href="distant.png" target="_blank">背景・遠景</a><a href="ground-near.png" target="_blank">背景・透過した石床</a><a href="enemy-lineup.png" target="_blank">敵の一覧画像</a><a href="PROMPTS.md">生成プロンプト</a></nav><img class="background" src="background-preview.png" alt="遺跡の背景合成"><div class="controls"><button type="button" data-mode="dark">暗い下地</button><button type="button" data-mode="light">明るい下地</button></div><div class="grid">${cards}</div></main><script>document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>document.body.classList.toggle('light',b.dataset.mode==='light')));</script></html>`;
  fs.writeFileSync(path.join(root, 'review.html'), html);
  const manifest = { schemaVersion: 1, status: 'awaiting-design-review', generation: 'built-in image_gen', motionProduction: 'not-started',
    coordinateSystem: { width: 1024, height: 576, contactY: { min: 323, max: 512 } },
    background: { composite: 'background-preview.png', layers: [ { file: 'distant.png', alpha: false, parallax: .28 }, { file: 'ground-near.png', alpha: true, parallax: 1 } ] },
    enemies: enemies.map((a, i) => ({ id: a.id, name: a.label, role: roles[i], file: a.file, reference: a.selected, facing: 'left', pose: 'single-neutral', ...qa.assets.find(q => q.id === a.id) })),
    overview: 'enemy-lineup.png', reviewPage: 'review.html', prompts: 'PROMPTS.md', provenance: 'generation.json', qa: 'qa.json', notes: ['Canonical PNGs are copied from generated outputs without repainting or alpha modification.', 'Previews only place the generated artwork in layouts; enemy size on the overview is not final in-game size.', 'Background repeat and animation are not yet verified.'] };
  writeAssetJson(path.join(root, 'manifest.json'), manifest);
  const links = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  const missing = links.filter(file => !fs.existsSync(path.join(root, file)));
  const sourceMatches = spec.assets.every(a => fs.readFileSync(path.join(root, a.file)).equals(fs.readFileSync(path.join(root, a.selected))));
  const enemyMetrics = qa.assets.filter(a => enemies.some(e => e.id === a.id));
  if (missing.length || !sourceMatches || enemyMetrics.length !== 8 || !enemyMetrics.every(a => a.hasTransparency && a.noClipping) || qa.assets.find(a => a.id === 'ground-near').topBandVisible !== 0) throw new Error('Design integrity check failed: ' + JSON.stringify({ missing, sourceMatches }));
  console.log(JSON.stringify({ assets: spec.assets.length, enemies: enemies.length, canonicalMatchesSource: sourceMatches, missingLinks: missing, transparencyAndClipping: 'passed', motionProduction: spec.motionProduction, previews: ['background-preview.png', 'enemy-lineup.png', 'review.html'] }, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
