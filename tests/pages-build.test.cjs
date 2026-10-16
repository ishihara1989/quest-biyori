'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildPages } = require('../tools/deploy/build-pages.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'forestbound-pages-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'public/assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public/game.html'), '<script src="js/game.js"></script>');
  return root;
}

test('static build creates the root entry, preserves assets and excludes development files', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, 'development'));
  fs.writeFileSync(path.join(root, 'development/prompt.txt'), 'private production input');
  const image = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(path.join(root, 'public/assets/image.png'), image);
  const first = buildPages({ root });
  assert.equal(first.files, 3);
  assert.equal(fs.readFileSync(path.join(first.output, 'index.html'), 'utf8'), fs.readFileSync(path.join(root, 'public/game.html'), 'utf8'));
  assert.deepEqual(fs.readFileSync(path.join(first.output, 'assets/image.png')), image);
  assert.equal(fs.existsSync(path.join(first.output, 'development')), false);
  fs.writeFileSync(path.join(first.output, 'obsolete.txt'), 'old deploy');
  buildPages({ root });
  assert.equal(fs.existsSync(path.join(first.output, 'obsolete.txt')), false);
  assert.equal(fs.existsSync(path.join(root, 'development/prompt.txt')), true);
});

test('unhydrated LFS pointers fail the build before replacing a previous export', t => {
  const root = fixture(t);
  const { output } = buildPages({ root });
  fs.writeFileSync(path.join(root, 'public/assets/image.png'), 'version https://git-lfs.github.com/spec/v1\noid sha256:' + 'a'.repeat(64) + '\nsize 99\n');
  assert.throws(() => buildPages({ root }), /git lfs pull/);
  assert.equal(fs.existsSync(path.join(output, 'index.html')), true);
});

test('assets exceeding the Pages per-file limit cannot be exported', t => {
  const root = fixture(t);
  const fd = fs.openSync(path.join(root, 'public/assets/large.png'), 'w');
  fs.ftruncateSync(fd, 25 * 1024 * 1024 + 1);
  fs.closeSync(fd);
  assert.throws(() => buildPages({ root }), /25 MiB/);
});
