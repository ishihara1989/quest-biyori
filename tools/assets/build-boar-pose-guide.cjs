'use strict';
// Schematic pose constraints only. These diagrams are never exported as sprites.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [__dirname, bundled] }));
const root = path.join(__dirname, '../../public/assets/enemies/boar/source');
const limb = (points, color, width = 15) => `<polyline points="${points.map(p => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" rx="20" ry="10" fill="${color}"/>`;
const text = (x, y, label) => `<text x="${x}" y="${y}" fill="#263645" font-family="Segoe UI" font-size="22">${label}</text>`;
async function save(name, width, height, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#edf2f5"/>${body}</svg>`;
  fs.writeFileSync(path.join(root, `${name}.svg`), svg);
  await sharp(Buffer.from(svg)).png().toFile(path.join(root, `${name}.png`));
}
async function main() {
  const walks = [
    { name: 'boar-move-first-pose-guide', start: 1, poses: [
      { lf: [230, 700], rf: [100, 683], lh: [478, 688], rh: [332, 665] },
      { lf: [190, 637], rf: [110, 683], lh: [402, 635], rh: [387, 680] },
      { lf: [130, 677], rf: [238, 688], lh: [325, 667], rh: [450, 680] }
    ] },
    { name: 'boar-move-second-pose-guide', start: 4, poses: [
      { lf: [108, 674], rf: [204, 655], lh: [330, 674], rh: [425, 651] },
      { lf: [181, 674], rf: [158, 620], lh: [403, 675], rh: [349, 620] },
      { lf: [218, 674], rf: [110, 640], lh: [460, 674], rh: [315, 651] }
    ] }
  ];
  for (const walk of walks) {
    let body = text(25, 80, 'POSE GUIDE ONLY — RED: NEAR LEFT HINDLEG / BLUE: FAR RIGHT HINDLEG');
    walk.poses.forEach((p, index) => {
      const dx = index * 512;
      body += `<g transform="translate(${dx},0)">` + text(35, 250, `FRAME ${walk.start + index}`);
      body += '<path d="M20 708h470" stroke="#80919e" stroke-dasharray="6 6"/>';
      body += limb([[362, 510], [380, 580], [p.rh[0] + 15, p.rh[1] - 45], p.rh], '#2568b5');
      body += limb([[216, 501], [209, 580], p.rf], '#8497a4', 13);
      body += '<ellipse cx="324" cy="456" rx="135" ry="92" fill="#c2ccd2"/><ellipse cx="145" cy="473" rx="90" ry="75" fill="#c2ccd2"/>';
      body += limb([[240, 511], [238, 574], p.lf], '#566a79', 15);
      const knee = p.lh[0] < 370 ? [349, 566] : [409, 567];
      body += limb([[403, 508], knee, [p.lh[0] + 22, p.lh[1] - 43], p.lh], '#cf3c49', 17);
      body += text(265, 770, `L-HOOF X=${p.lh[0]}`) + '</g>';
    });
    await save(walk.name, 1536, 1024, body);
  }
  const attacks = [
    { phase: '1 FRONT FEET SLIGHTLY UP', cy: 390, lf: [260, 539], rf: [180, 528], lh: [490, 585], rh: [427, 567], hip: [424, 432], shoulder: [257, 430] },
    { phase: '2 JUMP — ALL FEET AIRBORNE', cy: 293, lf: [270, 430], rf: [215, 417], lh: [447, 426], rh: [395, 412], hip: [424, 335], shoulder: [257, 334] },
    { phase: '3 FRONT LAND — HIND STILL UP', cy: 374, lf: [229, 585], rf: [159, 567], lh: [464, 494], rh: [406, 480], hip: [424, 386], shoulder: [257, 443] },
    { phase: '4 HIND LAND — CROUCH', cy: 450, lf: [234, 585], rf: [166, 567], lh: [480, 585], rh: [420, 567], hip: [424, 493], shoulder: [257, 493] }
  ];
  let body = '';
  attacks.forEach((p, index) => {
    body += `<g transform="translate(${(index % 2) * 640},${Math.floor(index / 2) * 640})">` + text(15, 45, p.phase);
    body += '<path d="M25 600h585" stroke="#80919e" stroke-dasharray="6 6"/>';
    body += limb([[p.hip[0] - 33, p.hip[1] - 10], [p.hip[0] - 24, p.hip[1] + 44], p.rh], '#2568b5');
    body += limb([[p.shoulder[0] - 27, p.shoulder[1] - 10], [p.shoulder[0] - 24, p.shoulder[1] + 48], p.rf], '#8497a4');
    body += `<ellipse cx="350" cy="${p.cy}" rx="150" ry="95" fill="#c2ccd2"/><ellipse cx="165" cy="${p.cy + 30}" rx="90" ry="75" fill="#c2ccd2"/>`;
    body += limb([p.shoulder, [p.shoulder[0] - 10, p.shoulder[1] + 50], p.lf], '#566a79', 17);
    body += limb([p.hip, [p.hip[0] - 8, p.hip[1] + 50], p.lh], '#cf3c49', 17) + '</g>';
  });
  await save('boar-charge-pose-guide', 1280, 1280, body);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
