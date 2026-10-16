'use strict';
const { writeAssetJson } = require('../lib/project-paths.cjs');
// Candidate search only; explicit review/application keeps runtime profiles fixed.
const fs = require('node:fs'), path = require('../lib/project-paths.cjs').assetPaths;
const D = require('../../public/js/data/forest-data.js'), T = require('./tune-stage-balance.cjs');
const output = path.resolve(__dirname, '../../output/balance/expansion-candidates.json');
function search(stage, initial = D.STAGE_TUNING[stage]) {
  const candidates = [];
  for (const hpScale of [.65, .8, 1, 1.25, 1.5]) for (const damageScale of [1, 1.4, 2, 3, 4]) {
    const profile = { ...initial, hp: +(initial.hp * hpScale).toFixed(3), damage: +(initial.damage * damageScale).toFixed(3) };
    candidates.push(T.assess(stage, profile, [0, 3]));
  }
  candidates.sort((a, b) => a.score - b.score);
  const finalists = candidates.slice(0, 5).map(r => T.assess(stage, r.profile, [0, 1, 2, 3, 4, 5, 6, 7]));
  finalists.sort((a, b) => a.score - b.score);
  return finalists[0];
}
function main() {
  const stages = process.argv.slice(2).map(Number);
  const selected = stages.length ? stages : D.STAGES.filter(s => s.id > 20 && ![1, 5].includes(s.number)).map(s => s.id);
  const rows = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : [];
  for (const stage of selected) {
    if (stage <= 20 || [1, 5].includes(D.STAGES[stage - 1]?.number)) throw new Error('Protected route ' + stage);
    const row = search(stage);
    const index = rows.findIndex(r => r.stage === stage);
    if (index < 0) rows.push(row); else rows[index] = row;
    rows.sort((a, b) => a.stage - b.stage);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    writeAssetJson(output, rows);
    console.log(JSON.stringify({ stage, profile: row.profile, score: row.score.toFixed(1), reference: [row.reference.wins, row.reference.seconds, row.reference.intact], first: row.first.wins, stale: row.stale?.wins, underFive: row.underFive?.wins }));
  }
}
if (require.main === module) main();
module.exports = { search };
