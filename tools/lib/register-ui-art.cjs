'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { runtimeAsset, developmentAsset } = require('./project-paths.cjs');
function copy(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}
function publishCharacterPortrait(character) {
  copy(developmentAsset(`${character}/${character}-idle-preview.gif`), runtimeAsset(`${character}/portrait.gif`));
}
function publishRegionItems(region, items) {
  for (const item of items) copy(developmentAsset(`mid-late-design/v1/${region}/drops/${item.id}.png`), runtimeAsset(`ui/items/${item.id}.png`));
}
module.exports = { publishCharacterPortrait, publishRegionItems };
