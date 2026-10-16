'use strict';
const fs=require('node:fs'),path=require('node:path');
const {ROOT,runtimeAsset,developmentAsset,writeAssetJson}=require('../lib/project-paths.cjs');
const rows=[
 ['森','alraune','アルラウネ','vine-slam','蔓叩き',[],'蔓先の直接判定。掌起点に置換しない'],
 ['森','treant','トレント','root-bury','根の突き上げ',['root-eruption'],'根は対象の床起点。本体は地中へ差し込む構え'],
 ['沼地','lich','リッチ','dark-cast','闇の大魔法',['lich-dark-magic'],'杖先／effectPreview.originを基準にする'],
 ['沼地','hydra','ヒュドラ','breath','毒ブレス',['hydra-poison-breath'],'口起点。chargeからbreathへの接続は短縮時に調整'],
 ['洞窟','arachne','アラクネ','web','糸の術',['spider-web-bolt','spider-web-slow'],'口・糸の発射点。着弾後の糸は独立保持'],
 ['洞窟','cave-troll','ケイブトロール','slam','三連叩きつけ',['cave-quake'],'1回分slamを3連に編集する短縮シーケンスは未作成'],
 ['海岸','scylla','スキュラ','tentacle','触手薙ぎ',['sea-slam'],'既存は触手叩きつけ。円弧状の薙ぎとの形状差を要判断'],
 ['海岸','kraken','クラーケン','breath','水ブレス',['water-breath'],'口起点。水流を幻影消失後も独立保持'],
 ['遺跡','seraphina','魔導人形セラフィナ','pillars','三連光柱',['ruins-light-pillar'],'3地点の柱は対象床起点。最後の柱配置後に回収'],
 ['遺跡','ancient-titan','古代機兵タイタン','beam','炉心ビーム',['ruins-furnace-beam'],'炉心originを独立FXへ移す。消失でビームを消さない'],
 ['砂漠','lamia','ラミア','binds','砂縛り',['desert-sand-burst'],'対象床起点。既存actionには発射点の座標がない。砂縛りの輪郭にはsand-burstを再利用候補とする'],
 ['砂漠','sand-behemoth','砂喰いベヒモス','quake','地割れ',['desert-fissure'],'床起点。地割れの枝分かれと進行向き'],
 ['高原','harpy-queen','ハーピークイーン','ring','風の円',['highland-wind-ring'],'元の中心固定。押出し判定との同期は後続'],
 ['高原','manticore','マンティコア','venom','毒尾の扇射',['highland-venom'],'尾先起点。3方向-18/0/+18度の弾を独立保持'],
 ['氷河','yuki-onna','雪女','seal','薄氷の封輪',['glacier-seal'],'対象床起点。元4.6秒予告の短縮は未編集'],
 ['氷河','ice-tusk-mammoth','氷牙マンモス','crown','白夜の氷冠',['glacier-crown'],'床の段階輪。3段の最後の直接判定後に回収'],
 ['火山','dragon-girl','ドラゴンガール','danger-2','紅翼竜息',['volcano-fire-beam'],'口起点。2回のブレス。既存採用モーションあり'],
 ['火山','dragon','ドラゴン','danger-2','双脈ブレス',['volcano-fire-beam'],'口起点。2帯を独立FXとして残す'],
 ['魔王城','lilith','リリス','danger-1','宵闇の花冠',['castle-dark-flower'],'3地点の花冠。最終配置後すぐ回収'],
 ['魔王城','demon-god','魔神','danger-4','終焉の交差',['castle-cross-beam','castle-end-ring'],'交差二帯と薄輪は別FX、最後の直接判定後に回収']
];
const root=developmentAsset('extradimensional-goddess/first-pass-v1');
const relative=f=>path.relative(root,f).replaceAll('\\','/');
function inspect(file){if(!fs.existsSync(file))return {manifest:relative(file),exists:false};const m=JSON.parse(fs.readFileSync(file,'utf8'));return {manifest:relative(file),exists:true,frameCount:m.frames?.length||m.frameCount,pivot:m.pivot,origin:m.effectPreview?.origin||null,events:m.events||[],actionTimes:m.action?.times||null,lastSourceEventMs:Math.max(0,...(m.events||[]).map(e=>e.timeMs||0),...(m.action?.times||[])),filesPresent:(m.frames||[]).every(f=>!f.file||fs.existsSync(path.resolve(path.dirname(file),f.file)))};}
const catalog=rows.map(([region,id,label,motion,technique,effects,note])=>({region,id,label,motion,technique,source:inspect(runtimeAsset(`enemies/${id}/motions/${motion}/manifest.json`)),effects:effects.map(e=>({id:e,...inspect(runtimeAsset(`effects/${e}/manifest.json`))})),connectionStatus:'source-inventory-only-not-connected',note,remaining:['元の接地点を星鏡P=(632,464)へ合わせる','女神戦専用の短い構えと発射時刻を編集','金縁・クリップ表示・回収を接続して縮尺確認','最後の発射／直接判定と回収0.20〜0.25秒を同期']}));
writeAssetJson(path.join(root,'phantom-reuse.json'),{date:'2026-10-15',status:'inventory-not-motion-acceptance',catalog});
fs.writeFileSync(path.join(root,'PHANTOM-REUSE.md'),'# 歴代ボス20体：再利用元と接続課題\n\n既存モーション・FXの在庫確認。新規生成・修正・女神戦への接続は未実施。元ボスの実装は変更しない。原点や時刻は既存マニフェストの値で、女神戦用の実測ではない。\n\n| 地域 | 幻影・技 | 既存本体 | FX | 接続課題 |\n| --- | --- | --- | --- | --- |\n'+catalog.map(c=>`| ${c.region} | ${c.label}／${c.technique} | [${c.motion}](${c.source.manifest}) ${c.source.frameCount||0}コマ | ${c.effects.map(e=>`[${e.id}](${e.manifest})${e.exists?'':'（不足）'}`).join('、')||'本体内の蔓'} | ${c.note} |`).join('\n')+'\n\n全20体とも女神戦専用の縮尺・短縮時間・星鏡表示・回収は未検証。ケイブトロールの三連化とスキュラの薙ぎ形状を優先判断する。現時点の元イベント時刻と原点は [JSON](phantom-reuse.json) を参照。\n');
console.log(JSON.stringify({bosses:catalog.length,existingMotions:catalog.filter(c=>c.source.exists&&c.source.filesPresent).length,missingEffects:catalog.flatMap(c=>c.effects.filter(e=>!e.exists).map(e=>e.id))}));
