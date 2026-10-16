'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, ASSETS, assetArea, inside } = require('../lib/project-paths.cjs');
const { isLocalImage } = require('../lib/repository-images.cjs');

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}
const relative = file => path.relative(ROOT, file).replaceAll('\\', '/');
const resolveModule = file => [file, file + '.js', file + '.cjs', file + '.json', path.join(file, 'index.js')].find(f => fs.existsSync(f) && fs.statSync(f).isFile());
const webFile = url => path.join(ROOT, url.startsWith('/development/') ? url.slice(1) : 'public/' + url.replace(/^\//, ''));

function checkStructure() {
  const errors = [];
  const fail = (file, message) => errors.push(relative(file) + ': ' + message);
  const publicFiles = filesIn(path.join(ROOT, 'public'));
  for (const file of publicFiles) {
    const rel = relative(file);
    if (inside(ASSETS, file)) {
      if (assetArea(path.relative(ASSETS, file)) !== 'runtime') fail(file, '制作・検証データは development/assets/ へ置く');
      if (!/\.(png|json|gif)$/i.test(file)) fail(file, '本編アセットはPNG・実行時JSON・登録済みUIアニメーションに限定する');
      if (file.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (data.previewOnly === true) fail(file, '未採用のプレビューを本編側へ置かない');
        const links = [];
        if (data.sheet) links.push(data.sheet);
        if (data.frames) for (const frame of data.frames) if (frame.file) links.push(frame.file);
        if (data.layers) for (const layer of data.layers) if (layer.file) links.push(layer.file);
        if (Array.isArray(data)) for (const entry of data) if (entry.manifest) links.push(entry.manifest);
        for (const link of links) {
          const target = path.resolve(path.dirname(file), link);
          if (!inside(path.join(ROOT, 'public'), target)) fail(file, '本編ロードが開発領域に依存: ' + link);
          else if (!fs.existsSync(target)) fail(file, '本編アセットの参照切れ: ' + link);
        }
      }
    } else if (rel.endsWith('.html') && rel !== 'public/game.html') fail(file, '検証HTMLは development/labs/ へ置く');
  }
  for (const dir of ['docs', 'tools', 'public/js']) for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (entry.isFile() && entry.name !== 'README.md') fail(path.join(ROOT, dir, entry.name), '用途別サブディレクトリへ置く');
  }
  const all = ['public', 'development', 'docs', 'tools', 'tests'].flatMap(dir => filesIn(path.join(ROOT, dir)));
  all.push(path.join(ROOT, 'README.md'), path.join(ROOT, 'AGENTS.md'));
  for (const file of all) {
    if (/\.(cjs|js)$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
        const target = path.resolve(path.dirname(file), match[1]);
        if (!resolveModule(target)) fail(file, 'モジュールの参照切れ: ' + match[1]);
        if (relative(file).startsWith('public/') && inside(path.join(ROOT, 'development'), target)) fail(file, '本編から検証コードを読み込まない');
      }
    }
    if (file.endsWith('.html')) {
      const text = fs.readFileSync(file, 'utf8');
      const hasRootBase = /<base\s+href="\/"/i.test(text);
      for (const match of text.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        const url = match[1].split(/[?#]/)[0];
        if (/^(https?:|data:)/.test(url) || url.endsWith('/') || !/\.(js|css|html|png|gif|json|md)$/.test(url)) continue;
        const target = url.startsWith('/') || hasRootBase ? webFile(url) : path.resolve(path.dirname(file), url);
        if (!fs.existsSync(target) && !(relative(file).startsWith('development/') && isLocalImage(target))) fail(file, '画面の参照切れ: ' + url);
        if (relative(file).startsWith('public/') && /\.(js|css)$/.test(url) && inside(path.join(ROOT, 'development'), target)) fail(file, '本編から検証コードを読み込まない: ' + url);
      }
    }
    if (file.endsWith('.css')) {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
        const url = match[1];
        if (/^(?:data:|https?:|#)/.test(url)) continue;
        const target = url.startsWith('/') ? webFile(url) : path.resolve(path.dirname(file), url);
        if (!fs.existsSync(target) && !(relative(file).startsWith('development/') && isLocalImage(target))) fail(file, 'CSS画像の参照切れ: ' + url);
        if (relative(file).startsWith('public/') && inside(path.join(ROOT, 'development'), target)) fail(file, '本編のCSSから開発素材を読み込まない: ' + url);
      }
    }
    if (file.endsWith('.md')) {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
        const link = match[1].split(/[?#]/)[0];
        if (!link || /^(?:https?:|data:|app:|codex:)/.test(link)) continue;
        const target = path.resolve(path.dirname(file), link);
        // Regenerable output reports may not exist in a fresh checkout.
        if (inside(path.join(ROOT, 'output'), target)) continue;
        // Development images are local-only; their provenance links stay in Git.
        if (isLocalImage(target)) continue;
        if (!fs.existsSync(target)) fail(file, '文書リンクの参照切れ: ' + link);
      }
    }
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  for (const [name, command] of Object.entries(pkg.scripts)) for (const match of command.matchAll(/(?:tools|tests)\/[\w./-]+\.(?:cjs|py)/g)) {
    if (!fs.existsSync(path.join(ROOT, match[0]))) fail(path.join(ROOT, 'package.json'), name + ' の参照切れ: ' + match[0]);
  }
  const data = require('../../public/js/data/forest-data.js');
  for (const item of data.ITEMS.filter(item => item.image)) {
    const target = webFile(item.image);
    if (!inside(path.join(ROOT, 'public'), target) || !fs.existsSync(target)) fail(path.join(ROOT, 'public/js/data/forest-data.js'), '本編アイテム画像の参照切れ: ' + item.id + ' → ' + item.image);
  }
  return { errors, runtimeFiles: publicFiles.filter(f => inside(ASSETS, f)).length };
}
if (require.main === module) {
  const result = checkStructure();
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode = 1; }
  else console.log(`Structure OK: ${result.runtimeFiles} runtime assets; documents, modules and page links verified.`);
}
module.exports = { checkStructure };
