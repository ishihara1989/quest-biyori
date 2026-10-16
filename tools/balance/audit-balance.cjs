'use strict';

const { writeAssetJson } = require('../lib/project-paths.cjs');
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const B = require('./balance-model.cjs');
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js'), S = require('../../public/js/combat/forest-simulation.js');
const W = require('../../public/js/skills/warrior-skills.js'), M = require('../../public/js/skills/mage-skills.js'), H = require('../../public/js/skills/paladin-skills.js');
const seeded = seed => () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
const median = numbers => { const a = [...numbers].sort((x, y) => x - y), i = Math.floor(a.length / 2); return a.length ? a.length % 2 ? a[i] : (a[i - 1] + a[i]) / 2 : null; };
const pct = n => (n * 100).toFixed(1) + '%';
const decimal = n => n === null ? '—' : n.toFixed(1);
function referenceBuild(stage, gearStage = stage) {
  const save = D.freshSave();
  // This fixture is an after-acquisition snapshot, not a playable route to purchase.
  // Party membership always uses BEFORE-clear unlocks, including for this-stage gear.
  save.cleared = Array.from({ length: stage }, (_, i) => i + 1);
  save.gold = 1e9;
  for (const item of D.ITEMS.filter(n => n.type !== 'gem')) save.inventory[item.id] = 1e9;
  const builds = {}, ranks = {};
  for (const [id, character] of Object.entries(P.CHARACTERS)) {
    if (character.unlock >= stage) continue;
    save.progression.characters[id].xp = P.experience(stage);
    for (const slot of ['weapon', 'armor']) for (const node of P.allGearTrees(id, slot).filter(n => n.main && n.stage <= gearStage)) {
      if (!P.purchase(save, id, slot, node.id)) throw new Error('Cannot acquire reference main node: ' + node.id);
    }
    // Actives from the top, each to max rank before the next. Default normal rank 1.
    // No enhancement/passive/normal SP investment, gems, branches or potions.
    for (const skill of P.SKILLS[id].filter(n => n.kind === 'active').sort((a, b) => a.unlockLevel - b.unlockLevel)) {
      while (P.purchase(save, id, 'skills', skill.id)) {}
    }
    builds[id] = P.stats(save, id);
    ranks[id] = { ...save.progression.characters[id].skillRanks };
  }
  return { save, builds, ranks };
}
function battle(stage, gearStage, seed) {
  const { builds } = referenceBuild(stage, gearStage);
  const run = S.createRun(stage, { builds, random: seeded(seed) });
  let outgoing = 0, incoming = 0, peakHit = 0;
  for (let t = 0; t < 180000 && run.status === 'running'; t += 100) {
    for (const event of S.update(run, 100)) if (event.type === 'damage') {
      if (event.target.startsWith('enemy-')) outgoing += event.amount;
      else { incoming += event.amount; peakHit = Math.max(peakHit, event.amount); }
    }
  }
  const party = [run.hero, ...run.allies];
  return { seed, status: run.status === 'running' ? 'timeout' : run.status, seconds: run.time / 1000,
    hpFraction: party.reduce((n, a) => n + a.hp, 0) / party.reduce((n, a) => n + a.maxHp, 0),
    warriorHpFraction: run.hero.hp / run.hero.maxHp, survivors: party.filter(a => a.hp > 0).length,
    outgoing, incoming, peakHit };
}
function measureRotation(stage, count) {
  const { builds } = referenceBuild(stage, 0);
  // Unit attack, stationary immortal targets, actual MP/AI/motions/CD contention.
  // 60s warmup followed by a 120s sample; reports this finite window, not infinity.
  for (const build of Object.values(builds)) Object.assign(build, { damage: 1000, baseDamage: 1000, weaponDamage: 1000, magicDamage: 1000,
    skillDamage: 1000, maxHp: 1e12, crit: 0, defense: 0 });
  const run = S.createRun(stage, { builds, random: seeded(123) });
  const prototype = run.enemies[0];
  run.enemies = Array.from({ length: count }, (_, i) => ({ ...prototype, id: 'enemy-dummy-' + i, type: 'slime', hp: 1e12, maxHp: 1e12,
    damage: 0, defense: 0, speed: 0, interval: 1e9, cooldown: 1e9, range: 0,
    x: 520 + (i % 3) * 55, y: 418 + Math.floor(i / 3) * 45 }));
  for (const actor of [run.hero, ...run.allies]) { actor.x = 350; actor.y = 438; }
  let total = 0;
  const byCharacter = {}, casts = {};
  for (let t = 0; t < 180000; t += 100) {
    for (const event of S.update(run, 100)) if (event.timeMs >= 60000) {
      if (event.type === 'damage' && event.target.startsWith('enemy-dummy-')) {
        total += event.amount;
        byCharacter[event.source] = (byCharacter[event.source] || 0) + event.amount / 1000 / 120;
      }
      if (['warrior-cast', 'mage-cast', 'paladin-cast'].includes(event.type)) casts[event.skillId] = (casts[event.skillId] || 0) + 1;
    }
  }
  return { dpsPerAttack: total / 1000 / 120, byCharacter, casts };
}
function formulaAudit(c) {
  const cases = [], failures = [];
  for (const s of [...Array.from({ length: 200 }, (_, i) => i + 1), 100000]) {
    const reference = B.encounter(s, {}, c), firstClear = B.encounter(s, { gearStage: s - 1 }, c);
    const stale = s >= 10 ? B.encounter(s, { gearStage: s - 10 }, c) : null;
    const oldFull = B.encounter(s + 20, { gearStage: s, fullExtrasThrough: s, gemCeiling: true }, c);
    const worst = B.encounter(s + 20, { gearStage: s, offenseMultiplier: B.optionalCeiling(c), toughnessMultiplier: B.optionalCeiling(c) }, c);
    for (const [name, ok] of [['reference', reference.victory], ['firstClear', firstClear.victory], ['stale', !stale || !stale.victory], ['oldFull20', !oldFull.victory], ['infiniteOptional20', !worst.victory]]) {
      if (!ok) failures.push({ stage: s, criterion: name });
    }
    cases.push({ stage: s, log10Power: B.logPower(s, c) / Math.LN10, reference, firstClear, stale, oldFull, worst });
  }
  return { cases, failures, optionalCeiling: B.optionalCeiling(c), count: cases.length };
}
function skillAudit() {
  const rows = [];
  for (const [character, api] of [['warrior', W], ['mage', M], ['paladin', H]]) for (const rank of [1, 5]) {
    let prior = null;
    for (const node of api.ACTIVE.filter(n => n.kind === 'active')) {
      const spec = api.spec(node.id, rank, 0, {}), count = api.hitTimes(spec).length;
      // Chain hits different targets once, and must not be counted as repeated hits.
      const weights = Array.from({ length: spec.pattern === 'chain' ? 1 : count }, (_, i) =>
        character === 'warrior' ? spec.pattern === 'ultimate' ? i === 10 ? 8 : i === 11 ? 3 : 1 : spec.pattern === 'worldcross' && i === 2 ? 1.5 : 1
          : i === count - 1 ? spec.finalMultiplier : 1);
      const singleDamage = spec.power * weights.reduce((a, n) => a + n, 0) * (spec.focusMultiplier || 1);
      const coefficient = singleDamage / (Math.max(spec.cooldown, spec.duration) / 1000);
      const row = { character, id: spec.id, name: spec.name, level: spec.unlockLevel, rank, singleDamage,
        cooldownSeconds: spec.cooldown / 1000, durationSeconds: spec.duration / 1000, mp: spec.mp,
        singleCoefficientPerSecond: coefficient, lowerThanPriorDamageSkill: spec.power > 0 && prior !== null && coefficient < prior,
        support: spec.support || false };
      rows.push(row);
      if (spec.power > 0) prior = coefficient;
    }
  }
  return rows;
}
function actualAudit(seeds, onProgress) {
  const stages = [], rotations = [];
  for (const stage of D.STAGES) {
    const single = measureRotation(stage.id, 1), pack = measureRotation(stage.id, 5), previous = rotations.at(-1);
    rotations.push({ stage: stage.id, party: Object.keys(referenceBuild(stage.id).builds), single, pack,
      singleStepFactor: previous ? single.dpsPerAttack / previous.single.dpsPerAttack : 1,
      packStepFactor: previous ? pack.dpsPerAttack / previous.pack.dpsPerAttack : 1 });
    const scenarios = {};
    for (const [name, gearStage] of [['reference', stage.id], ['firstClear', stage.id - 1], ['stale10', Math.max(0, stage.id - 10)]]) {
      const runs = Array.from({ length: seeds }, (_, seed) => battle(stage.id, gearStage, seed));
      const wins = runs.filter(r => r.status === 'victory');
      scenarios[name] = { gearStage, wins: wins.length, seeds, timeouts: runs.filter(r => r.status === 'timeout').length,
        medianWinSeconds: median(wins.map(r => r.seconds)), medianWinHp: median(wins.map(r => r.hpFraction)),
        minWinWarriorHp: wins.length ? Math.min(...wins.map(r => r.warriorHpFraction)) : null, runs };
    }
    stages.push({ stage: stage.id, region: stage.region, number: stage.number, name: stage.name, scenarios });
    if (stage.id % 10 === 0) onProgress?.('Audited current stages 1–' + stage.id);
  }
  return { stages, rotations, skills: skillAudit() };
}
function markdown(report) {
  const { formula, actual, config: c } = report;
  const lines = ['# バランス計算・現行戦闘の検証', '', '2026-10-10 JST。再生成: `npm run audit:balance`。設定: `tools/balance/balance-model-config.json`。', '',
    '**提案式の解析結果と実行時の本編データの実測を分けている。敵編成・数値の適用範囲は [stage-balance-adjustment.md](../../docs/history/stage-balance-adjustment.md) を参照。**', '',
    '## 提案式の解析検証', '',
    `ステージ1〜200と100,000の${formula.count}地点。条件不成立: ${formula.failures.length}件。火力・実効耐久の各軸が1段階${pct(c.stageGrowth - 1)}成長。`, '',
    '| 条件 | 火力比 | 耐久比 | 必要討伐時間 | 生存時間 | 結果 |', '| --- | ---: | ---: | ---: | ---: | --- |'];
  const sample = formula.cases.find(n => n.stage === 30);
  for (const [label, row] of [['適正メイン', sample.reference], ['前ステージまで（初回攻略）', sample.firstClear], ['10段階遅れ', sample.stale], ['旧地域全取得＋ジェム上限→20先', sample.oldFull], ['無限地域の上積み上限→20先', sample.worst]]) {
    lines.push(`| ${label} | ${pct(row.offenseRatio)} | ${pct(row.toughnessRatio)} | ${decimal(row.clearSeconds)}秒 | ${decimal(row.survivalSeconds)}秒 | ${row.victory ? '勝利' : '敗北'} |`);
  }
  lines.push('', `適正メインの残HPは${pct(sample.reference.remainingHp)}、初回攻略は${pct(sample.firstClear.remainingHp)}。`, '',
    `全地域の枝・終端をすべて取得した場合とジェム上限を合わせた、各軸の保守的上限は${formula.optionalCeiling.toFixed(3)}倍。HP×防御、攻撃×速度×会心などの合成結果にこの予算を適用する。`, '',
    'これは一定の被ダメージ圧力を受ける集約モデル。移動、敵の減少、範囲命中、回復、タンクへの集中被弾を含む実戦の勝利保証ではない。', '');
  if (formula.failures.length) lines.push('不成立条件: `' + JSON.stringify(formula.failures) + '`', '');
  if (!actual) return lines.join('\n') + '\n';
  const referenceWins = actual.stages.reduce((n, s) => n + s.scenarios.reference.wins, 0);
  const count = actual.stages.length * report.seeds;
  lines.push('## 現行ゲームの戦闘実測', '',
    `40ステージ×3条件×${report.seeds}配置。適正メイン: ${referenceWins}/${count}勝利。180秒で未決着は時間切れ。薬・ジェム・枝・パッシブ・専用強化を使用しない。`, '',
    'アクティブは解放順に各最大ランクまでSPを割り振る。通常攻撃は標準ランク1。余剰SPは保持。仲間は加入ステージの次から参加（森4は戦士のみ、森5から魔法使い、沼地1からパラディン）。', '',
    '「適正」は当該ステージのメイン取得後の診断用スナップショット。「初回」は前ステージまで。「10遅れ」は同じレベル・スキル・仲間で装備だけを遅らせる。ステージ1〜9の10遅れ欄は装備なしの参考値。', '',
    '| ステージ | 適正 勝数 | 初回 勝数 | 10遅れ 勝数 | 適正 討伐中央値 | 適正 残HP中央値 |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const s of actual.stages) {
    const a = s.scenarios;
    lines.push(`| ${s.region}-${s.number} (Lv${s.stage}) | ${a.reference.wins}/${report.seeds} | ${a.firstClear.wins}/${report.seeds} | ${a.stale10.wins}/${report.seeds} | ${a.reference.medianWinSeconds === null ? '—' : decimal(a.reference.medianWinSeconds) + '秒'} | ${a.reference.medianWinHp === null ? '—' : pct(a.reference.medianWinHp)} |`);
  }
  lines.push('', '残HPはパーティー合計。死者・戦士の残HP・被ダメージ・最大単発被ダメージ・時間切れはJSONに個別記録。合計残HPだけで安全を判断しない。', '',
    '## 仲間・スキル解放の火力補正', '',
    '攻撃力1000・会心なしの不死標的で実際のAIを180秒動かし、後半120秒を計測。単体と5体密集の2条件。MP・動作時間・再使用・移動・技の競合を含む有限時間の観測値。回復・防御支援の価値はこの無被弾標的では測定していない。', '',
    '敵HPの初期倍率案は `1.20 × 今段階の係数 / 前段階の係数`。単体と密集の係数は編成に合わせて別々に使用する。', '',
    '| 段階 | 仲間数 | 単体 DPS/攻撃 | 5体 DPS/攻撃 | 単体 前段階比 | 密集 前段階比 |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const row of actual.rotations.filter(n => n.stage === 1 || n.stage === 5 || n.stage === 11 || n.stage % 5 === 0)) {
    lines.push(`| ${row.stage} | ${row.party.length} | ${row.single.dpsPerAttack.toFixed(3)} | ${row.pack.dpsPerAttack.toFixed(3)} | ×${row.singleStepFactor.toFixed(3)} | ×${row.packStepFactor.toFixed(3)} |`);
  }
  lines.push('', '全段階の係数・キャラ別寄与・技の使用回数はJSONに記録。係数が下がる場合もそのまま表示する。補正は基準ビルドで一度固定し、プレイヤーの現在装備・ジェムに合わせて敵を再強化しない。', '',
    '## 現行スキルの確認点', '',
    '同ランクの単体威力÷max(再使用時間, 動作時間)が直前の攻撃技より低い行を抽出。リスク補正前なので、これだけで弱い技と断定しない。終撃倍率・単体補正を含み、連鎖は単体への1ヒットとして計上。反撃の吸収ダメージ・支援・中断・拘束・無敵の価値は別予算で評価する。', '',
    '| キャラ | ランク | 技 | 解放Lv | 単体係数/秒 |', '| --- | ---: | --- | ---: | ---: |');
  for (const row of actual.skills.filter(n => n.lowerThanPriorDamageSkill)) {
    lines.push(`| ${P.CHARACTERS[row.character].name} | ${row.rank} | ${row.name} | ${row.level} | ${row.singleCoefficientPerSecond.toFixed(3)} |`);
  }
  lines.push('', '原式・適用順・実戦での合格条件は [balance-formulas.md](../../docs/design/balance-formulas.md) を参照。', '');
  return lines.join('\n');
}
function main() {
  const args = process.argv.slice(2), value = name => args.find(a => a.startsWith(name + '='))?.slice(name.length + 1);
  const seeds = Number(value('--seeds') || 5);
  if (!Number.isSafeInteger(seeds) || seeds < 1 || seeds > 100) throw new RangeError('--seeds must be 1–100');
  const c = B.config(value('--config') ? JSON.parse(fs.readFileSync(path.resolve(value('--config')), 'utf8')) : {});
  const directory = path.resolve(value('--out') || path.join(__dirname, '../../output/balance'));
  const report = { date: '2026-10-10 JST', seeds, config: c, formula: formulaAudit(c),
    actual: args.includes('--formula-only') ? null : actualAudit(seeds, console.log) };
  fs.mkdirSync(directory, { recursive: true });
  writeAssetJson(path.join(directory, 'audit.json'), report);
  fs.writeFileSync(path.join(directory, 'audit.md'), markdown(report));
  console.log('Formula failures: ' + report.formula.failures.length + '; report: ' + path.join(directory, 'audit.md'));
  if (report.formula.failures.length) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { referenceBuild, battle, measureRotation, formulaAudit, skillAudit, actualAudit, markdown };
