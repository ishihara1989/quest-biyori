'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { runtimeAsset, developmentAsset, writeAssetJson } = require('./project-paths.cjs');

// The renderer needs packed coordinates; generation coverage and extraction
// records belong to the lab catalog. Embedded asset metadata is relative to
// each entry's manifest path, so retain that context in the development copy.
function publishMikoCatalog(catalog) {
  const file = developmentAsset('skills/miko/catalog.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
  const keys = ['id', 'subject', 'group', 'motion', 'path', 'sheet', 'frameWidth', 'frameHeight', 'frameCount', 'frameSequence', 'durationMs', 'loop', 'pivot', 'facing'];
  const frameKeys = ['index', 'file', 'x', 'y', 'width', 'height', 'durationMs', 'bounds'];
  const pick = (value, names) => Object.fromEntries(names.filter(name => name in value).map(name => [name, value[name]]));
  const runtime = { version: catalog.version, assets: catalog.assets.map(asset => ({ ...pick(asset, keys), frames: asset.frames.map(frame => pick(frame, frameKeys)) })) };
  writeAssetJson(runtimeAsset('skills/miko/catalog.json'), runtime);
  return runtime;
}
module.exports = { publishMikoCatalog };
