'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../lib/project-paths.cjs');

const MAX_FILES = 20000;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const LFS_HEADER = 'version https://git-lfs.github.com/spec/v1';

function buildPages({ root = ROOT } = {}) {
  const source = path.resolve(root, 'public');
  const output = path.resolve(root, 'output/pages');
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error('配信対象にシンボリックリンクを含められません: ' + file);
      if (entry.isDirectory()) { visit(file); continue; }
      const size = fs.statSync(file).size;
      if (size > MAX_FILE_BYTES) throw new Error('Cloudflare Pagesの25 MiB制限を超えています: ' + file);
      const header = Buffer.alloc(LFS_HEADER.length);
      const fd = fs.openSync(file, 'r');
      try { fs.readSync(fd, header, 0, header.length, 0); }
      finally { fs.closeSync(fd); }
      if (header.toString() === LFS_HEADER) throw new Error('LFS画像の実体がありません。git lfs pull を実行してください: ' + file);
      files.push({ file, size });
    }
  }
  visit(source);
  const entry = path.join(source, 'game.html');
  if (!fs.existsSync(entry)) throw new Error('本編の入口 public/game.html がありません');
  // The extra index makes the existing game available at / on a static host.
  if (fs.existsSync(path.join(source, 'index.html'))) throw new Error('public/index.html と本編の入口が競合しています');
  if (files.length + 1 > MAX_FILES) throw new Error('Cloudflare Pages Freeの20,000ファイル制限を超えています');
  // Only this generated directory is replaced; source files are never removed.
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  fs.cpSync(source, output, { recursive: true });
  fs.copyFileSync(entry, path.join(output, 'index.html'));
  const bytes = files.reduce((sum, file) => sum + file.size, fs.statSync(entry).size);
  return { output, files: files.length + 1, bytes };
}

if (require.main === module) {
  try {
    const result = buildPages();
    console.log(`Pages build OK: ${result.files} files, ${(result.bytes / 1024 / 1024).toFixed(2)} MiB → ${result.output}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { buildPages };
