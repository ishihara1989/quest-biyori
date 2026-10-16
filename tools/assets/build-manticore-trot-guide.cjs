'use strict';
const { writeAssetJson, makeAssetDirectory } = require('../lib/project-paths.cjs');
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths,assert=require('node:assert/strict'),sharp=require('sharp');
const model=require('../../development/labs/js/manticore-trot-model.js');
const arg=name=>{const i=process.argv.indexOf(name);if(i<0)return null;assert.ok(process.argv[i+1],name+' needs a value');return process.argv[i+1];};
const input=arg('--config'),imported=input?JSON.parse(fs.readFileSync(path.resolve(input),'utf8')):null;
const config=imported?(imported.config||imported):model.config;
const root=path.resolve(__dirname,'../../public/assets/highland-motions'),out=path.resolve(root,arg('--out')||'trot-v2');
const outputRelative=path.relative(root,out);assert.ok(outputRelative&&!outputRelative.startsWith('..')&&!path.isAbsolute(outputRelative),'Output must stay inside highland-motions');
const round=p=>({x:+p.x.toFixed(1),y:+p.y.toFixed(1)});
function svg(frame){
  const c=config,parts=[];
  const body=[{u:260,v:100,z:385},{u:260,v:-100,z:385},{u:-260,v:-100,z:340},{u:-260,v:100,z:340}].map(p=>model.project(p,c));
  parts.push('<polygon points="'+body.map(p=>p.x+','+p.y).join(' ')+'" fill="#788994" fill-opacity=".25" stroke="#8799a3" stroke-width="3"/>');
  for(const id of ['RF','RH','LF','LH']){
    const l=frame.legs[id],s=l.screen,p=s.paw,rw=l.side==='near'?48:36,rh=l.side==='near'?27:21;
    parts.push('<g stroke="'+l.color+'" fill="none" stroke-width="8"'+(l.side==='far'?' stroke-dasharray="14 8"':'')+'><path d="M '+s.root.x+' '+s.root.y+' L '+s.joint.x+' '+s.joint.y+' L '+s.ankle.x+' '+s.ankle.y+'"/><ellipse cx="'+p.x+'" cy="'+(p.y-rh)+'" rx="'+rw+'" ry="'+rh+'"/></g>');
    parts.push('<g fill="'+l.color+'"><circle cx="'+s.root.x+'" cy="'+s.root.y+'" r="10"/><circle cx="'+s.joint.x+'" cy="'+s.joint.y+'" r="8"/><circle cx="'+p.x+'" cy="'+p.y+'" r="7"/></g>');
    parts.push('<text x="'+(p.x+rw+8)+'" y="'+(p.y-rh)+'" fill="'+l.color+'" font-size="22">'+id+' '+(l.grounded?'GROUND':'LIFT')+'</text>');
  }
  const labels=['LF near front','RF far front','LH near hind','RH far hind'];
  parts.push('<g fill="#e7eff5" font-size="25"><text x="50" y="65">FRAME '+(frame.index+1)+' / 6 — LEFT-FACING TROT — '+c.width+' x '+c.height+'</text><text x="50" y="110">Paw marker = bottom contact point. Dashed limbs = FAR side.</text></g>');
  for(const [i,id]of ['LF','RF','LH','RH'].entries()){const l=frame.legs[id],p=round(l.screen.paw);parts.push('<text x="50" y="'+(165+i*38)+'" fill="'+l.color+'" font-size="25">'+labels[i]+' : ('+p.x+', '+p.y+') '+(l.grounded?'GROUND':'LIFT')+'</text>');}
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+c.width+'" height="'+c.height+'"><rect width="100%" height="100%" fill="#15252e"/><g font-family="Segoe UI, sans-serif">'+parts.join('')+'</g></svg>';
}
async function main(){
  makeAssetDirectory(out,{recursive:true});makeAssetDirectory(path.join(out,'guides'),{recursive:true});
  const frames=model.frames(config),data={schemaVersion:1,date:'2026-10-13 JST',status:'coordinate-guided-trial',migrationDecision:'trot direction accepted by user; refinement in progress',config,frames};
  writeAssetJson(path.join(out,'guide.json'), data);
  const parts=[],raw=[];
  for(const f of frames){const source=svg(f),name='frame-'+(f.index+1);fs.writeFileSync(path.join(out,'guides',name+'.svg'),source);const png=await sharp(Buffer.from(source)).png().toBuffer();fs.writeFileSync(path.join(out,'guides',name+'.png'),png);
    parts.push({input:await sharp(png).resize(550,458).png().toBuffer(),left:f.index%3*550,top:Math.floor(f.index/3)*458});raw.push(await sharp(png).resize(550,458).ensureAlpha().raw().toBuffer());}
  await sharp({create:{width:1650,height:916,channels:4,background:'#15252e'}}).composite(parts).png().toFile(path.join(out,'guides/contact.png'));
  await sharp(Buffer.concat(raw),{raw:{width:550,height:458*6,channels:4,pageHeight:458}}).gif({loop:0,delay:Array(6).fill(120),colours:256,dither:0}).toFile(path.join(out,'guides/preview.gif'));
  let md='# 座標ガイドによるマンティコアtrot改良\n\n2026-10-13。trotへ移行する方針はユーザー確認済み。旧版は `backups/manticore-trot-v1-20261013/` に原画・登録画像・再生素材・設定・プロンプトを保存し、23ファイルのSHA256一致を確認した。\n\n';
  md+='## 座標系と投影\n\n前方（左向き）をUの正、手前（左脚側）をVの正、上をZの正とする。正射影のヨー20°、見下ろし13°を使う。\n\n```text\nx = 620 - cos(20°) U + sin(20°) V\ny = 1020 + sin(13°) [sin(20°) U + cos(20°) V] - cos(13°) Z\n```\n\n3Dモデルから実測したカメラではなく、基準絵へ合わせた制作ガイド用の投影。脚ごとの振幅・持ち上げ量を操作できる。接地点マーカーは足先の最下点で、足全体の中心ではない。奥脚は先に描き、手前脚に隠れる場合は隠してよい。\n\n';
  md+='## 軌道\n\n位相qをAペアは `(t+0.25)%1`、Bペアは `(t+0.75)%1` とし、前後変位は `-振幅 × cos(2πq)`。q<0.5を遊脚とし、その高さは `持ち上げ量 × sin(2πq)`、支持中は0。固定付け根から足首まで2節の逆運動学で関節位置も求める。足裏から足首までは48。\n\n| 脚 | 前後振幅（±） | 持ち上げ最大 |\n| --- | ---: | ---: |\n'+Object.values(config.legs).map(l=>'| '+l.label+' | '+l.amplitude+' | '+l.lift+' |').join('\n')+'\n\n';
  md+='## 各コマの足先（1375×1144原画のpx）\n\n| コマ | LF 左前 | RF 右前 | LH 左後 | RH 右後 |\n| --- | --- | --- | --- | --- |\n';
  for(const f of frames)md+='| '+(f.index+1)+' | '+['LF','RF','LH','RH'].map(id=>{const l=f.legs[id],p=round(l.screen.paw);return '('+p.x+', '+p.y+') '+(l.grounded?'接地':'浮く');}).join(' | ')+' |\n';
  const rh=Math.abs(frames[1].legs.RH.screen.paw.x-frames[0].legs.RH.screen.paw.x),lf34=Math.abs(frames[3].legs.LF.screen.paw.x-frames[2].legs.LF.screen.paw.x),lf45=Math.abs(frames[4].legs.LF.screen.paw.x-frames[3].legs.LF.screen.paw.x);
  md+='\n右後脚①→②の横移動は '+rh.toFixed(1)+'px。②では左後脚と足先が近く、手前脚の後ろに隠せる。左前脚③→④、④→⑤の横移動はともに '+lf34.toFixed(1)+'px / '+lf45.toFixed(1)+'px で、④だけ停止しない。\n\nガイドは `public/assets/highland-motions/trot-v2/guides/`、全座標は `guide.json`。計算モデルの連続軌道と生成結果の座標遵守は別に検証する。画像生成がこの座標を守るかどうかは保証せず、原画の足先を実測して差を記録する。\n';
  fs.writeFileSync(path.join(out,'GUIDE.md'),md);
  console.log(JSON.stringify({guides:6,rightHindStep:rh,leftFrontSteps:[lf34,lf45],output:out}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
