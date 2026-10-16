'use strict';
const { makeAssetDirectory } = require('../lib/project-paths.cjs');
// Vector pose reference only. Final sprite art is generated with image_gen.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [__dirname, process.env.NODE_PATH, bundled].filter(Boolean) }));
const left = [
  [194, 191, 206, 255], [177, 191, 188, 255], [160, 190, 160, 255], [151, 195, 134, 252],
  [142, 196, 114, 255], [155, 183, 134, 240], [184, 182, 160, 240], [193, 185, 188, 247],
];
const right = [left[4], left[5], left[6], left[7], left[0], left[1], left[2], left[3]];
const names = ['LEFT FRONT / CONTACT', 'LOAD / BEGIN PASS', 'RIGHT PASSES BEHIND LEFT', 'RIGHT MOVES FORWARD',
  'RIGHT FRONT / CONTACT', 'LOAD / BEGIN PASS', 'LEFT PASSES IN FRONT', 'LEFT READY TO CONTACT'];
let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="760"><rect width="1280" height="760" fill="#15171c"/>' +
  '<text x="20" y="30" font-family="sans-serif" font-size="20" fill="white">8-PHASE POSE GUIDE: LEFT = GREEN / ALWAYS NEAR, RIGHT = BLUE / ALWAYS FAR</text>' +
  '<text x="20" y="56" font-family="sans-serif" font-size="15" fill="#aaa">Pose and occlusion reference only. Preserve the character colors and costume. Facing RIGHT.</text>';
for (let i = 0; i < 8; i++) {
  const x = i % 4 * 320, y = Math.floor(i / 4) * 340 + 80;
  svg += `<g transform="translate(${x} ${y})"><rect x="8" y="5" width="304" height="326" rx="8" fill="#202329"/>` +
    `<text x="18" y="30" font-family="sans-serif" font-size="16" fill="white">${i + 1}. ${names[i]}</text>` +
    '<line x1="40" y1="268" x2="285" y2="268" stroke="#666"/>' +
    '<line x1="160" y1="70" x2="160" y2="280" stroke="#666" stroke-dasharray="4 6"/>';
  for (const [leg, color, near] of [[right[i], '#589efa', false], [left[i], '#70e39e', true]]) {
    const [kx, ky, ax, ay] = leg;
    svg += `<path d="M ${near ? 156 : 164} 125 L ${kx} ${ky} L ${ax} ${ay}" fill="none" stroke="#111" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M ${near ? 156 : 164} 125 L ${kx} ${ky} L ${ax} ${ay}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M ${ax - 5} ${ay + 6} L ${ax + 19} ${ay + 6}" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`;
  }
  svg += '<rect x="133" y="91" width="54" height="42" rx="8" fill="#8c8b9c"/>' +
    '<path d="M 214 76 H 275 L 264 66 M 275 76 L 264 86" fill="none" stroke="#ccc" stroke-width="3"/>' +
    `<text x="18" y="308" font-family="sans-serif" font-size="14" fill="#aaa">${i === 7 ? 'NEXT = 1, continuous foot placement' : 'Foot IDs and depth stay fixed'}</text></g>`;
}
svg += '</svg>';
const directory = path.join(__dirname, '../../output/walk-review');
makeAssetDirectory(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'pose-guide.svg'), svg);
sharp(Buffer.from(svg)).png().toFile(path.join(directory, 'pose-guide.png')).then(() => console.log('Saved output/walk-review/pose-guide.png'));
