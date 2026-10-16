'use strict';
const { spawnSync } = require('node:child_process');
const path = require('../lib/project-paths.cjs').assetPaths;
for (const character of ['warrior', 'mage', 'paladin', 'ninja', 'shaman', 'miko']) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'build-preview.cjs'), character], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
