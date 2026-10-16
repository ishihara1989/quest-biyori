'use strict';

const { ASSETS, ROOT, inside } = require('./project-paths.cjs');

// Keep aligned with .gitignore and .gitattributes, including uppercase suffixes.
const IMAGE_EXTENSION = /\.(png|apng|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?|psd|ase|aseprite|kra)$/i;
const isLocalImage = file => inside(ROOT, file) && !inside(ASSETS, file) && IMAGE_EXTENSION.test(file);

module.exports = { IMAGE_EXTENSION, isLocalImage };
