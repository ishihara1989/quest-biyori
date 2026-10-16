'use strict';

const { writeAssetJson } = require('../lib/project-paths.cjs');
// Diagnosis only. HP multipliers affect this process's in-memory enemy definitions.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const A = require('./audit-balance.cjs');
const D = require('../../public/js/data/forest-data.js'), S = require('../../public/js/combat/forest-simulation.js');
const seeded = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
const median = values => { const a = [...values].sort((x, y) => x - y), n = a.length; return n ? n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2 : null; };
function probe(stage, { hpMultiplier = 1, party = 'full', gearLag = 0, actives = true } = {}, seed = 0) {
  if (!Number.isFinite(hpMultiplier) || hpMultiplier <= 0) throw new RangeError('Invalid HP multiplier');
  const originals = Object.fromEntries(Object.entries(D.ENEMIES).map(([id, e]) => [id, e.hp]));
  try {
    for (const [id, hp] of Object.entries(originals)) D.ENEMIES[id].hp = hp * hpMultiplier;
    const { builds } = A.referenceBuild(stage, Math.max(0, stage - gearLag));
    if (party === 'two' || party === 'warrior') delete builds.paladin;
    if (party === 'warrior') delete builds.mage;
    if (!actives) for (const b of Object.values(builds)) {
      b.warriorSkills = []; b.mageSkills = []; b.paladinSkills = [];
    }
    const run = S.createRun(stage, { builds, random: seeded(seed) });
    const hits = {}, casts = {}, outgoing = {}, firstIncoming = { time: null };
    let incoming = 0;
    for (let t = 0; t < 180000 && run.status === 'running'; t += 100) {
      for (const event of S.update(run, 100)) {
        if (event.type === 'damage') {
          if (event.target.startsWith('enemy-')) {
            hits[event.source] = (hits[event.source] || 0) + 1;
            outgoing[event.source] = (outgoing[event.source] || 0) + event.amount;
          } else {
            incoming += event.amount;
            firstIncoming.time ??= event.timeMs / 1000;
          }
        }
        if (['warrior-cast', 'mage-cast', 'paladin-cast'].includes(event.type)) casts[event.skillId] = (casts[event.skillId] || 0) + 1;
      }
    }
    const actors = [run.hero, ...run.allies];
    return { seed, status: run.status === 'running' ? 'timeout' : run.status, seconds: run.time / 1000,
      hpFraction: actors.reduce((n, a) => n + a.hp, 0) / actors.reduce((n, a) => n + a.maxHp, 0),
      survivors: actors.filter(a => a.hp > 0).length, incoming, firstIncomingSeconds: firstIncoming.time,
      hits, casts, outgoingIncludingOverkill: outgoing };
  } finally {
    for (const [id, hp] of Object.entries(originals)) D.ENEMIES[id].hp = hp;
  }
}
function main() {
  const seeds = 5, stages = [11, 15, 20, 25, 30, 40];
  const variants = [
    ['現状3人', {}], ['パラディンなし', { party: 'two' }], ['戦士のみ', { party: 'warrior' }],
    ['3人・アクティブなし', { actives: false }], ['3人・HP4倍', { hpMultiplier: 4 }],
    ['3人・HP8倍', { hpMultiplier: 8 }], ['3人・HP12倍', { hpMultiplier: 12 }],
    ['10段階遅れ・HP4倍', { hpMultiplier: 4, gearLag: 10 }], ['10段階遅れ・HP8倍', { hpMultiplier: 8, gearLag: 10 }],
  ];
  const rows = [];
  for (const stage of stages) {
    for (const [name, options] of variants) {
      const runs = Array.from({ length: seeds }, (_, seed) => probe(stage, options, seed));
      const wins = runs.filter(n => n.status === 'victory');
      rows.push({ stage, name, options, wins: wins.length, seeds,
        medianWinSeconds: median(wins.map(n => n.seconds)), medianWinHp: median(wins.map(n => n.hpFraction)),
        medianIncoming: median(runs.map(n => n.incoming)), runs });
    }
    console.log('Compared stage ' + stage);
  }
  const statRows = [10, 11, 20, 21, 30, 31, 40].map(stage => {
    const definition = D.STAGES[stage - 1], factor = 1 + (definition.number - 1) * .1;
    const full = A.referenceBuild(stage).builds, stale = A.referenceBuild(stage, Math.max(0, stage - 10)).builds;
    return { stage, totalEnemyHp: definition.waves.flat().reduce((n, id) => n + Math.round(D.ENEMIES[id].hp * factor * definition.enemyHp), 0),
      enemyDamageMultiplier: definition.enemyDamage,
      characters: Object.fromEntries(Object.entries(full).map(([id, b]) => [id, {
        attack: b.damage, hp: b.maxHp, defense: b.defense, staleAttack: stale[id].damage, staleHp: stale[id].maxHp, staleDefense: stale[id].defense,
      }])) };
  });
  const directory = path.resolve(__dirname, '../../output/balance');
  fs.mkdirSync(directory, { recursive: true });
  writeAssetJson(path.join(directory, 'party-analysis.json'), { seeds, statRows, rows });
  const lines = ['# 沼地以降の難易度の原因比較', '', '2026-10-10 JST。再生成: `node tools/balance/analyze-party-balance.cjs`。本編の数値・セーブは変更しない。', '',
    '各条件5配置、180秒上限。適正レベル・同じアクティブ配分で人数と敵HPを切り替える。HP倍率は召喚された敵にも適用する。倒した敵が減る速度や被ダメージも変わるため、時間はHP倍率に比例しない。', '',
    '| 通算ステージ | 条件 | 勝利 | 討伐時間中央値 | 残HP中央値 |', '| --- | --- | ---: | ---: | ---: |'];
  for (const r of rows) lines.push(`| ${r.stage} | ${r.name} | ${r.wins}/${seeds} | ${r.medianWinSeconds === null ? '—' : r.medianWinSeconds.toFixed(1) + '秒'} | ${r.medianWinHp === null ? '—' : (r.medianWinHp * 100).toFixed(1) + '%'} |`);
  lines.push('', '討伐時間・残HPは勝利した配置だけの中央値。個別の敗北・時間切れ、使用技、被ダメージ、火力寄与（オーバーキル込み）はJSONに記録。残HPは参加者の合計なので人数が違う行の耐久を直接比較しない。', '');
  fs.writeFileSync(path.join(directory, 'party-analysis.md'), lines.join('\n'));
  console.log('Report: ' + path.join(directory, 'party-analysis.md'));
}
if (require.main === module) main();
module.exports = { probe };
