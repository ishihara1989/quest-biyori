'use strict';
const { characters, getMotionSpecs } = require('./motion-specs.cjs');
const { buildMotion } = require('./build-motion.cjs');
const { buildPreview } = require('./build-motion-preview.cjs');
(async () => {
  for (const character of characters) for (const motion of Object.keys(getMotionSpecs(character))) {
    buildMotion(character, motion); await buildPreview(character, motion);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
