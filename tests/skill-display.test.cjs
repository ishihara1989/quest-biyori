'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const jobs = ['warrior', 'mage', 'paladin', 'ninja', 'shaman', 'miko'];
const skills = Object.fromEntries(jobs.map(job => [job, require('../public/js/skills/' + job + '-skills.js')]));

test('every skill displays at most two decimal places across ranks, enhancements and epic equipment', () => {
  for (const [job, api] of Object.entries(skills)) {
    const title = job[0].toUpperCase() + job.slice(1);
    for (const epic of [false, true]) for (const row of api.ACTIVE) {
      for (let rank = 1; rank <= row.maxRank; rank++) for (let enhance = 0; enhance <= 5; enhance++) {
        const stats = { attackSpeed: 3.17, haste: .23, cooldownPenalty: .17, skillPower: .137,
          skillRange: 12.34, chainRange: 18.76, interferencePower: .127,
          ['epic' + title + 'Weapon']: epic, ['epic' + title + 'Armor']: epic };
        const spec = api.spec(row.id, rank, enhance, stats), before = structuredClone(spec);
        const text = api.parameters(spec), label = [job, row.id, rank, enhance, epic].join('/');
        assert.doesNotMatch(text, /\d+\.\d{3,}|NaN|Infinity/, label + ': ' + text);
        assert.deepEqual(spec, before, label + ': formatting must not change combat values');
      }
    }
    for (const node of api.NODES) assert.doesNotMatch(node.note || '', /\d+\.\d{3,}/, job + '/' + node.id);
  }
});

test('epic caltrop MP and fractional curse lifetime round only for display', () => {
  const caltrop = skills.ninja.spec('caltrop-field', 5, 0, { epicNinjaArmor: true });
  assert.equal(caltrop.mp, 12 * .3);
  assert.match(skills.ninja.parameters(caltrop), /MP 3\.6 ·/);
  const curse = skills.shaman.spec('armor-hex', 1, 3);
  curse.lifetime = 8967.89;
  assert.match(skills.shaman.parameters(curse), /効果時間 8\.97秒/);
  assert.equal(curse.lifetime, 8967.89);
});
