'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assetArea, assetPath, runtimeAsset, developmentAsset } = require('../tools/lib/project-paths.cjs');
const { createServer } = require('../server.cjs');

test('production sheets and development sources/previews resolve to separate roots', () => {
  const id = 'enemies/boar/motions/move/';
  assert.equal(assetPath(runtimeAsset(id + 'boar-move.png')), runtimeAsset(id + 'boar-move.png'));
  assert.equal(assetPath(runtimeAsset(id + 'boar-move-preview.gif')), developmentAsset(id + 'boar-move-preview.gif'));
  assert.equal(assetPath(runtimeAsset('enemies/boar/source/original.png')), developmentAsset('enemies/boar/source/original.png'));
  assert.equal(assetArea('highland-motions/enemies/manticore/motions/move/manifest.json'), 'development');
  assert.equal(assetArea('late-stage-first-pass/v1/review/dragon/idle/manifest.json'), 'development');
  assert.equal(assetArea('enemies/manticore/motions/move/manifest.json'), 'runtime');
  assert.equal(assetArea('warrior/portrait.gif'), 'runtime');
  assert.equal(assetArea('warrior/warrior-idle-preview.gif'), 'development');
  assert.equal(assetPath(path.resolve('output/result.json')), path.resolve('output/result.json'));
  assert.equal(assetPath(developmentAsset('skills/miko/catalog.json')), developmentAsset('skills/miko/catalog.json'));
  assert.equal(assetPath(runtimeAsset('../assets-other/preview.gif')), runtimeAsset('../assets-other/preview.gif'));
});

test('builder JSON retains valid provenance links without moving the runtime sheet', () => {
  const target = runtimeAsset('enemies/boar/motions/move/manifest.json');
  const { normalizeAssetData } = require('../tools/lib/project-paths.cjs');
  const output = normalizeAssetData(target, { sheet: 'boar-move.png', preview: 'boar-move-preview.gif', source: '../../source/boar-move-generated-v1.png' });
  assert.equal(output.sheet, 'boar-move.png');
  assert.equal(path.resolve(path.dirname(target), output.preview), developmentAsset('enemies/boar/motions/move/boar-move-preview.gif'));
  assert.equal(path.resolve(path.dirname(target), output.source), developmentAsset('enemies/boar/source/boar-move-generated-v1.png'));
  assert.equal(normalizeAssetData(target, { path: 'assets/enemies/boar/motions/move/manifest.json' }).path, 'assets/enemies/boar/motions/move/manifest.json');
});

function request(server, url, method = 'GET') {
  return new Promise(resolve => {
    const response = {
      writeHead(status, headers = {}) { this.status = status; this.headers = headers; },
      end(body) { resolve({ status: this.status, headers: this.headers, body }); },
    };
    server.emit('request', { url, method }, response);
  });
}
test('game-only server serves runtime files and excludes development and legacy labs', async () => {
  const server = createServer({ development: false });
  assert.equal((await request(server, '/')).status, 200);
  assert.equal((await request(server, '/js/combat/forest-simulation.js')).status, 200);
  assert.equal((await request(server, '/development/labs/index.html')).status, 404);
  assert.equal((await request(server, '/development/assets/characters.json')).status, 404);
  assert.equal((await request(server, '/index.html')).status, 404);
});
test('development server exposes canonical labs, preserves bookmarks, and restricts its mount', async () => {
  const server = createServer({ development: true });
  const redirect = await request(server, '/enemies.html?review=1');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.Location, '/development/labs/enemies.html?review=1');
  assert.equal((await request(server, '/development/labs/enemies.html')).status, 200);
  assert.equal((await request(server, '/development/assets/characters.json')).status, 200);
  assert.equal((await request(server, '/development/records/warrior-generation.json')).status, 404);
  assert.equal((await request(server, '/development/assets/%2e%2e%5cREADME.md')).status, 403);
  assert.equal((await request(server, '/assets/characters.json')).status, 404);
  assert.equal((await request(server, '/game.html', 'POST')).status, 405);
});
