'use strict';
const { spawnSync } = require('node:child_process');
const path = require('../lib/project-paths.cjs').assetPaths;
const { buildCharacter } = require('./build-character.cjs');
const warrior = spawnSync(process.execPath, [path.join(__dirname, 'build-warrior.cjs')], { stdio: 'inherit' });
if (warrior.status !== 0) process.exit(warrior.status || 1);
for (const character of ['mage', 'paladin', 'ninja', 'shaman', 'miko']) buildCharacter(character);
