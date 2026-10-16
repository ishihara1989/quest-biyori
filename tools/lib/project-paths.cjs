'use strict';

// Asset IDs keep the same relative tree in both roots. Builders can resolve a
// logical asset path once, without copying originals into the playable build.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(ROOT, 'public');
const ASSETS = path.join(PUBLIC, 'assets');
const DEVELOPMENT = path.join(ROOT, 'development/assets');
const developmentTrees = new Set(['references', 'desert-motions', 'highland-motions', 'glacier-motions', 'late-stage-first-pass', 'mid-late-design', 'ruins-design', 'ruins-motions']);
const developmentDirectories = new Set(['source', 'sources', 'references', 'registered', 'generation', 'guides', 'backups']);

function assetArea(relative) {
  const parts = relative.replaceAll('\\', '/').split('/');
  const name = parts.at(-1);
  if (parts.length === 2 && name === 'portrait.gif') return 'runtime';
  if (developmentTrees.has(parts[0]) || parts.some(p => developmentDirectories.has(p))) return 'development';
  if (/\.(md|txt|gif|html|jpg|jpeg|cjs|js|py)$/i.test(name)) return 'development';
  if (name === 'characters.json' || /^(layout|assembly|qa|palette-review|sources|provenance|generation|build-status)(?:[.-]|$)/i.test(name)) return 'development';
  if (/(?:^|[-_.])(generated|registered|reference|review|preview|qa|guide|browser|contact|lineup|overview)(?:[-_.]|$)/i.test(name)) return 'development';
  return 'runtime';
}

function inside(root, file) {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}

function assetPath(file) {
  const absolute = path.resolve(file);
  if (!inside(ASSETS, absolute)) return file;
  const relative = path.relative(ASSETS, absolute);
  return path.join(assetArea(relative) === 'development' ? DEVELOPMENT : ASSETS, relative);
}

// Standard node:path operations, with only asset join/resolve routed to their
// declared area. dirname/relative retain normal filesystem semantics.
const assetPaths = { ...path, join: (...parts) => assetPath(path.join(...parts)), resolve: (...parts) => assetPath(path.resolve(...parts)) };
const runtimeAsset = relative => path.join(ASSETS, relative);
const developmentAsset = relative => path.join(DEVELOPMENT, relative);

function normalizeAssetData(file, value) {
  const absolute = path.resolve(file);
  if (!inside(ASSETS, absolute) && !inside(DEVELOPMENT, absolute)) return value;
  const directory = path.dirname(absolute);
  const logicalDirectory = inside(DEVELOPMENT, absolute)
    ? path.join(ASSETS, path.relative(DEVELOPMENT, directory)) : directory;
  function visit(v) {
    if (Array.isArray(v)) return v.map(visit);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, visit(x)]));
    if (typeof v !== 'string' || !/\.(?:png|gif|json|md|jpg|jpeg|html)$/i.test(v) || /[\r\n]/.test(v) || /^(?:https?:|data:|[A-Z]:)/i.test(v)) return v;
    if (v.startsWith('/')) return v;
    if (v.startsWith('assets/')) return path.relative(PUBLIC, assetPath(path.resolve(PUBLIC, v))).replaceAll('\\', '/');
    if (v.startsWith('public/assets/')) return path.relative(ROOT, assetPath(path.resolve(ROOT, v))).replaceAll('\\', '/');
    const actual = path.resolve(directory, v);
    const logical = path.resolve(logicalDirectory, v);
    const target = assetPath(fs.existsSync(actual) ? actual : logical);
    if (!inside(ASSETS, target) && !inside(DEVELOPMENT, target)) return v;
    return path.relative(directory, target).replaceAll('\\', '/');
  }
  return visit(value);
}

function makeAssetDirectory(directory, options = { recursive: true }) {
  directory = assetPath(directory);
  fs.mkdirSync(directory, options);
  // A newly registered runtime motion also needs a home for its GIF/review.
  // Existing assets already have that directory; new ones must work as well.
  if (inside(ASSETS, directory)) fs.mkdirSync(path.join(DEVELOPMENT, path.relative(ASSETS, directory)), options);
}

function writeAssetJson(file, value) {
  file = assetPath(file);
  makeAssetDirectory(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(normalizeAssetData(file, value), null, 2) + '\n');
}

module.exports = { ROOT, PUBLIC, ASSETS, DEVELOPMENT, assetArea, assetPath, assetPaths, runtimeAsset, developmentAsset, normalizeAssetData, makeAssetDirectory, writeAssetJson, inside };
