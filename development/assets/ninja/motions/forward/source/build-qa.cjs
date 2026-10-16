const fs = require('node:fs');
const path = require('node:path');
const bundled = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), bundled] }));
const motion = process.argv[2] || 'forward';
const dir = path.resolve(__dirname, '../../', motion);
const selected = [1, 3, 5, 7, 8];
const label = (text, width) => Buffer.from(`<svg width="${width}" height="32"><rect width="100%" height="100%" fill="#19212d"/><text x="16" y="22" fill="#ecf2ff" font-family="sans-serif" font-size="16">${text}</text></svg>`);
(async () => {
  const tiles = [];
  for (let i = 1; i <= 8; i++) {
    const file = path.join(dir, `${motion}-${String(i).padStart(2, '0')}.png`);
    const sprite = await sharp(file).resize(512, 448, { kernel: 'nearest' }).flatten({ background: '#24303d' }).png().toBuffer();
    const x = ((i-1)%4)*512, y = Math.floor((i-1)/4)*480;
    tiles.push({ input: sprite, left: x, top: y+32 }, { input: label(`${motion} / ${i}  L=mesh+gold NEAR; R=bare+band FAR`,512), left:x,top:y });
  }
  await sharp({ create: { width:2048,height:960,channels:3,background:'#24303d' }}).composite(tiles).png().toFile(path.join(dir, `ninja-${motion}-qa.png`));
  const legs=[];
  for (const [index, i] of selected.entries()) {
    const file=path.join(dir,`${motion}-${String(i).padStart(2,'0')}.png`);
    const png=await sharp(file).extract({left:65,top:142,width:132,height:70}).resize(396,210,{kernel:'nearest'}).flatten({background:'#24303d'}).png().toBuffer();
    legs.push({input:png,left:index*396,top:32},{input:label(`Frame ${i} / L mesh+gold always NEAR`,396),left:index*396,top:0});
  }
  await sharp({create:{width:1980,height:242,channels:3,background:'#24303d'}}).composite(legs).png().toFile(path.join(dir,`ninja-${motion}-leg-qa.png`));
  console.log(`${motion}: dark alpha-flattened full contact sheet and frames 1/3/5/7/8 leg enlargement saved`);
})().catch(e=>{console.error(e);process.exitCode=1;});
