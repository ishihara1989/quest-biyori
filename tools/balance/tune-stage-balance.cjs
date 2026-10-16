'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const D = require('../../public/js/data/forest-data.js'), S = require('../../public/js/combat/forest-simulation.js'), A = require('./audit-balance.cjs');
const originals = D.STAGES.map(s => structuredClone(s));
const builds = new Map();
const seeded = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
const median = a => { a = [...a].sort((x, y) => x - y); const n = a.length; return n ? n % 2 ? a[(n - 1) / 2] : (a[n / 2] + a[n / 2 - 1]) / 2 : null; };
function sample(stage, profile, lag = 0, seed = 0) {
  const original = D.STAGES[stage - 1];
  try {
    D.STAGES[stage - 1] = D.tuneStage(originals[stage - 1], profile);
    const key = stage + ':' + lag;
    if (!builds.has(key)) builds.set(key, A.referenceBuild(stage, Math.max(0, stage - lag)).builds);
    const run = S.createRun(stage, { builds: structuredClone(builds.get(key)), random: seeded(seed) });
    let peakHitFraction = 0;
    for (let t = 0; t < (stage>=51?600000:180000) && run.status === 'running'; t += 100) {
      for (const event of S.update(run, 100)) if (event.type === 'damage') {
        const actor = [run.hero, ...run.allies].find(a => a.id === event.target);
        if (actor) peakHitFraction = Math.max(peakHitFraction, event.amount / actor.maxHp);
      }
    }
    const party = [run.hero, ...run.allies];
    const front = party.filter(a => ['warrior', 'paladin'].includes(a.type));
    return { seed, status: run.status === 'running' ? 'timeout' : run.status, seconds: run.time / 1000,
      hp: party.reduce((n, a) => n + a.hp, 0) / party.reduce((n, a) => n + a.maxHp, 0),
      warriorHp: run.hero.hp / run.hero.maxHp, frontHp: Math.min(...front.map(a => a.hp / a.maxHp)),
      partySize: party.length, survivors: party.filter(a => a.hp > 0).length, peakHitFraction };
  } finally { D.STAGES[stage - 1] = original; }
}
function evaluate(stage, profile, lag, seeds) {
  const runs = seeds.map(seed => sample(stage, profile, lag, seed)), wins = runs.filter(r => r.status === 'victory');
  return { wins: wins.length, seeds: runs.length, seconds: median(wins.map(r => r.seconds)), hp: median(wins.map(r => r.hp)),
    frontHp: median(wins.map(r => r.frontHp)), intact: wins.filter(r => r.survivors === r.partySize).length,
    peakHit: Math.max(...runs.map(r => r.peakHitFraction)), runs };
}
function assess(stage, profile, seeds = [0, 1, 2, 3, 4]) {
  const reference = evaluate(stage, profile, 0, seeds), first = evaluate(stage, profile, 1, seeds);
  const stale = stage >= 10 ? evaluate(stage, profile, 10, seeds) : null;
  const underFive = stage >= 21 && D.STAGES[stage - 1].number === 10 ? evaluate(stage, profile, 5, seeds) : null;
  let score = 0;
  score += (1 - reference.wins / seeds.length) * 10000 + (1 - first.wins / seeds.length) * 8000;
  if (reference.seconds !== null) score += Math.abs(reference.seconds - 60) * .8;
  // Failed telegraphs permit casualties while requiring stable reference/first wins.
  if (!underFive && reference.frontHp !== null) score += Math.abs(reference.frontHp - .25) * 90;
  if (stale && underFive) score += Math.max(0, stale.wins / seeds.length - .05) * 3000;
  if (underFive) score += Math.max(0, underFive.wins / seeds.length - .1) * 3000;
  if (reference.seconds !== null) score += Math.max(0, 45 - reference.seconds, reference.seconds - (underFive?150:90)) * 30;
  score += Math.max(0, reference.peakHit - .51) * 100;
  return { stage, profile, reference, first, stale, underFive, score };
}
function search(stage) {
  const formation = stage === 3 ? 'forest-boars' : 'separate-bosses';
  const waveCount = stage > 40 ? 5 : stage > 20 ? 4 : undefined;
  const hpRates = stage <= 4 ? [.8, 1, 1.2] : stage <= 10 ? [2, 3, 4] : [4, 8, 12, 16];
  const damageRates = stage <= 4 ? [.25, .4, .55, .7, .85] : stage <= 10 ? [.3, .5, .75, 1] : [.6, 1, 1.5, 2, 3, 4];
  const candidates = [];
  // Two layouts for the coarse pass; test promising candidates on more seeds below.
  for (const hp of hpRates) for (const damage of damageRates) candidates.push(assess(stage, { hp, damage, formation, ...(waveCount ? { waveCount } : {}) }, [0, 3]));
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0], refined = [];
  for (const hpScale of [.8, 1, 1.2]) for (const damageScale of [.8, 1, 1.2]) {
    const hp = Number((best.profile.hp * hpScale).toFixed(3)), damage = Number((best.profile.damage * damageScale).toFixed(3));
    refined.push(assess(stage, { ...best.profile, hp, damage }));
  }
  refined.sort((a, b) => a.score - b.score);
  return refined[0];
}
function refine(stage, initial) {
  const candidates = [];
  const hpRates = [initial.hp * .8, initial.hp, initial.hp * 1.2, initial.hp * 1.5, initial.hp * 2];
  const damageRates = [initial.damage * .35, initial.damage * .5, initial.damage * .7, initial.damage, initial.damage * 1.3];
  for (const hp of hpRates) for (const damage of damageRates) candidates.push(assess(stage, { ...initial, hp: Number(hp.toFixed(3)), damage: Number(damage.toFixed(3)) }, [0, 3]));
  candidates.sort((a, b) => a.score - b.score);
  const best = [];
  for (const row of candidates.slice(0, 4)) best.push(assess(stage, row.profile));
  best.sort((a, b) => a.score - b.score);
  return best[0];
}
function failuresFor(row, count) {
  const failures = [];
  if (row.reference.wins < count) failures.push('reference');
  if (row.first.wins < count) failures.push('first');
  if (row.stale && row.underFive && row.stale.wins > Math.floor(count * .05)) failures.push('stale');
  if (row.underFive && row.underFive.wins > Math.floor(count * .1)) failures.push('under-five');
  if (row.reference.seconds === null || row.reference.seconds < 45 || row.reference.seconds > (row.underFive?150:90)) failures.push('duration');
  // Casualties and ordinary-route stale gear are telemetry under the new heavy-hit system.
  // Stable first/reference wins and the major-boss five-step equipment gate remain mandatory.
  // 2026-10-12: failed boss telegraphs now intentionally cost about half HP.
  if (row.reference.peakHit > .51) failures.push('burst');
  return failures;
}
function verify(profiles, count = 30) {
  const seeds = Array.from({ length: count }, (_, i) => i), rows = [];
  for (const [key, profile] of Object.entries(profiles)) {
    const stage = Number(key), row = assess(stage, profile, seeds);
    row.failures = failuresFor(row, count);
    rows.push(row);
    console.log(JSON.stringify({ stage, failures: row.failures, reference: row.reference.wins, first: row.first.wins,
      stale: row.stale?.wins, seconds: row.reference.seconds?.toFixed(1), intact: row.reference.intact, frontHp: row.reference.frontHp?.toFixed(3) }));
  }
  return writeVerification(rows, count);
}
function writeVerification(rows, count) {
  const out = path.resolve(__dirname, '../../output/balance'); fs.mkdirSync(out, { recursive: true });
  writeAssetJson(path.join(out, 'stage-tuning-verification.json'), rows);
  const lines = ['# 敵編成・難易度の調整結果', '', '2026-10-12 JST。行動妨害・累積抵抗・延長した予備動作・失敗時の重い被害を含む。森・沼の編成と能力倍率は保持。洞窟・海岸は最大4ウェーブ、遺跡・砂漠は最大5ウェーブ。基準配分は解放順のアクティブ、通常攻撃ランク1、枝・ジェム・薬なし。', '',
    `各条件${count}配置。適正メイン・前ステージまでのメイン・10段階遅れを比較。討伐時間と残HPは勝利配置の中央値。前衛残HPは戦士・パラディンのうち低い方。`, '',
    '| ステージ | ウェーブ | 適正勝利 | 初回勝利 | 5遅れ勝利（大ボス） | 10遅れ勝利 | 討伐時間 | 前衛残HP | 全員生存 |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
  for (const r of rows) {
    const s = D.STAGES[r.stage - 1];
    lines.push(`| ${s.region}-${s.number} | ${s.waves.length} | ${r.reference.wins}/${count} | ${r.first.wins}/${count} | ${r.underFive ? r.underFive.wins + '/' + count : '—'} | ${r.stale ? r.stale.wins + '/' + count : '—'} | ${r.reference.seconds?.toFixed(1)}秒 | ${((r.reference.frontHp || 0) * 100).toFixed(1)}% | ${r.reference.intact}/${count} |`);
  }
  lines.push('', '1・5の編成と能力倍率は変更しない。森3以外は敵の種類別総数を保存し、素材確率・基本編成の期待素材量・装備費用を維持。HP・火力倍率はステージ固定で、召喚された敵にも適用する。洞窟・海岸・遺跡の大ボスは装備5段階遅れの勝利3/30以下を判定する。キャラのレベルは全条件で基準レベルを維持する。', '',
    '適正・初回の30配置全勝を必須とする。最大単発被害は予告攻撃の新仕様に合わせて51%以下。討伐中央値は通常45〜90秒、大ボス45〜150秒。前衛残HPと全員生存率も記録するが、重い予告攻撃の失敗リスクを残すため全員生存は必須条件にしない。時間切れも敗北として記録。', '',
    '通常難所の装備10段階遅れは、低抵抗への妨害が育成を補える新仕様の参考測定として掲載する。洞窟以降の大ボスは装備5段階遅れで3/30以下、10段階遅れで1/30以下を引き続き判定する。', '',
    '検査上の未達条件: `' + JSON.stringify(rows.filter(r => r.failures.length).map(r => ({ stage: r.stage, failures: r.failures }))) + '`', '');
  fs.writeFileSync(path.join(out, 'stage-tuning-verification.md'), lines.join('\n'));
  return rows;
}
function main() {
  if (process.argv.includes('--verify')) {
    const rows = verify(Object.fromEntries(Object.entries(D.STAGE_TUNING).filter(([id]) => ![1, 5].includes(D.STAGES[Number(id) - 1].number))));
    if (rows.some(r => r.failures.length)) process.exitCode = 1;
    return;
  }
  const refinement = process.argv.includes('--refine');
  const previous = refinement ? JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../output/balance/stage-tuning-candidates.json'), 'utf8')) : null;
  const stages = process.argv.slice(2).filter(n => n !== '--refine').map(Number);
  const selected = stages.length ? stages : D.STAGES.filter(s => ![1, 5].includes(s.number)).map(s => s.id);
  const rows = [];
  for (const stage of selected) {
    if ([1, 5].includes(D.STAGES[stage - 1]?.number)) throw new Error('Protected route ' + stage);
    const row = refinement ? refine(stage, previous.find(r => r.stage === stage).profile) : search(stage); rows.push(row);
    console.log(JSON.stringify({ stage, profile: row.profile, score: row.score.toFixed(1),
      reference: [row.reference.wins, row.reference.seconds?.toFixed(1), row.reference.hp?.toFixed(3)],
      intact: row.reference.intact, frontHp: row.reference.frontHp?.toFixed(3), first: row.first.wins, stale: row.stale?.wins }));
    const out = path.resolve(__dirname, '../../output/balance'); fs.mkdirSync(out, { recursive: true });
    writeAssetJson(path.join(out, refinement ? 'stage-tuning-refined.json' : 'stage-tuning-candidates.json'), rows);
  }
}
if (require.main === module) main();
module.exports = { sample, evaluate, assess, search, refine, failuresFor, writeVerification, verify };
