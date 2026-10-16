'use strict';

// Offline proposal. The game does not import this module or its configuration.
const DEFAULTS = require('./balance-model-config.json');
function positive(n, name) {
  if (!Number.isFinite(n) || n <= 0) throw new RangeError(name + ' must be positive and finite');
}
function stage(n, minimum = 1) {
  if (!Number.isSafeInteger(n) || n < minimum) throw new RangeError('Invalid stage');
}
function config(overrides = {}) {
  const c = { ...DEFAULTS, ...overrides, risk: { ...DEFAULTS.risk, ...overrides.risk } };
  for (const key of ['stageGrowth', 'levelGrowth', 'clearSeconds', 'survivalSeconds', 'gemAxisCap', 'skillBaseBudget']) positive(c[key], key);
  if (c.stageGrowth <= c.levelGrowth || c.levelGrowth < 1) throw new RangeError('Equipment must grow faster than zero');
  if (c.survivalSeconds <= c.clearSeconds) throw new RangeError('Reference build must survive its clear time');
  for (const rates of [c.sideRates, c.crownRates]) {
    if (!Array.isArray(rates) || rates.length !== (rates === c.sideRates ? 4 : 3)) throw new RangeError('Invalid node rates');
    rates.forEach(n => { if (!Number.isFinite(n) || n < .01 || n > .03) throw new RangeError('Frontier node rates must be 1–3%'); });
  }
  if (!Number.isFinite(c.crownRootRate) || c.crownRootRate < .01 || c.crownRootRate > .03) throw new RangeError('Frontier node rates must be 1–3%');
  if (c.gemAxisCap < 1 || !Number.isFinite(c.targetCredit) || c.targetCredit < 0 || c.targetCredit > 1 || !Number.isFinite(c.skillBudgetPerLevel) || c.skillBudgetPerLevel < 0) throw new RangeError('Invalid optional or skill budget');
  for (const value of Object.values(c.risk)) if (!Number.isFinite(value) || value < 1) throw new RangeError('Invalid risk factor');
  return c;
}
const gearGrowth = c => c.stageGrowth / c.levelGrowth;
function logPower(s, c = DEFAULTS) { stage(s); return (s - 1) * Math.log(c.stageGrowth); }
function gearRatio(owned, target, c = DEFAULTS) {
  stage(owned, 0); stage(target);
  // Relative exponents stay small even at stage 100,000. Never form huge stats.
  return Math.exp((owned - target) * Math.log(gearGrowth(c)));
}
function logMainGain(s, c = DEFAULTS) {
  stage(s);
  return (s - 2) * Math.log(gearGrowth(c)) + Math.log(gearGrowth(c) - 1);
}
function nodeRatio(nodeStage, targetStage, rate, c = DEFAULTS) {
  stage(nodeStage); stage(targetStage); positive(rate, 'node rate');
  return rate * Math.exp((nodeStage + 1 - targetStage) * Math.log(gearGrowth(c)));
}
function fullExtrasRatio(through, target, c = DEFAULTS) {
  stage(through, 0); stage(target);
  if (!through) return 0;
  const r = gearGrowth(c), logR = Math.log(r);
  const sideBudget = 2 * c.sideRates.reduce((sum, n) => sum + n, 0);
  const side = sideBudget * Math.exp((through + 1 - target) * logR) * -Math.expm1(-through * logR) / -Math.expm1(-logR);
  const regions = Math.floor(through / 10), last = regions * 10;
  const crownBudget = c.crownRootRate + 3 * c.crownRates.reduce((sum, n) => sum + n, 0);
  const crown = regions ? crownBudget * Math.exp((last + 1 - target) * logR) * -Math.expm1(-regions * 10 * logR) / -Math.expm1(-10 * logR) : 0;
  return side + crown;
}
function gemMultiplier(investment, c = DEFAULTS) {
  if (!Number.isFinite(investment) || investment < 0) throw new RangeError('Invalid gem investment');
  return 1 + (c.gemAxisCap - 1) * (investment / (1 + investment));
}
function optionalCeiling(c = DEFAULTS) {
  const r = gearGrowth(c);
  const sideBudget = 2 * c.sideRates.reduce((sum, n) => sum + n, 0);
  const crownBudget = c.crownRootRate + 3 * c.crownRates.reduce((sum, n) => sum + n, 0);
  // Infinite number of completed regions: conservative upper bound for BOTH axes.
  return (1 + sideBudget * r / (1 - 1 / r) + crownBudget * r / (1 - r ** -10)) * c.gemAxisCap;
}
function encounter(target, { gearStage = target, level = target, fullExtrasThrough = 0, gemInvestment = 0, gemCeiling = false,
  offenseMultiplier = 1, toughnessMultiplier = 1, referenceDps = 1, referenceEhp = 1 } = {}, c = DEFAULTS) {
  stage(target); stage(level); stage(gearStage, 0); stage(fullExtrasThrough, 0);
  if (fullExtrasThrough > gearStage) throw new RangeError('Extras require their main nodes');
  for (const [name, value] of Object.entries({ offenseMultiplier, toughnessMultiplier, referenceDps, referenceEhp })) positive(value, name);
  const levelRatio = Math.exp((level - target) * Math.log(c.levelGrowth));
  const gear = gearRatio(gearStage, target, c), extra = fullExtrasRatio(fullExtrasThrough, target, c);
  const gems = gemCeiling ? c.gemAxisCap : gemMultiplier(gemInvestment, c);
  const offense = (gear + extra) * levelRatio * gems * offenseMultiplier;
  const toughness = (gear + extra) * levelRatio * gems * toughnessMultiplier;
  const clear = c.clearSeconds / offense, survive = c.survivalSeconds * toughness;
  // Constant incoming pressure. This is a normalized aggregate model, not the ARPG.
  return { target, gearStage, offenseRatio: offense, toughnessRatio: toughness,
    clearSeconds: clear, survivalSeconds: survive, victory: clear < survive,
    remainingHp: Math.max(0, 1 - clear / survive),
    enemyHpBudget: referenceDps * c.clearSeconds, enemyDpsBudget: referenceEhp / c.survivalSeconds };
}
function damageMultiplier(attack, defense, kappa = 1) {
  positive(attack, 'attack'); positive(kappa, 'kappa');
  if (!Number.isFinite(defense) || defense < 0) throw new RangeError('Invalid defense');
  // A/(A+D/kappa), arranged without overflowing A+D or kappa*A.
  const relative = (defense / attack) / kappa;
  return 1 / (1 + relative);
}
function damage(attack, defense, power = 1, kappa = 1) {
  if (!Number.isFinite(power) || power < 0) throw new RangeError('Invalid power');
  return attack * damageMultiplier(attack, defense, kappa) * power;
}
function skillBudget(unlockLevel, c = DEFAULTS) {
  stage(unlockLevel);
  return c.skillBaseBudget * (1 + c.skillBudgetPerLevel * Math.max(0, unlockLevel - 5));
}
function skillPower({ unlockLevel, cooldownSeconds, hits = 1, ranged = false, area = false, piercing = false, control = false, expectedTargets = 1,
  normalDps = 0, actionSeconds = 0 }, c = DEFAULTS) {
  positive(cooldownSeconds, 'cooldownSeconds'); positive(hits, 'hits');
  if (!Number.isFinite(expectedTargets) || expectedTargets < 1) throw new RangeError('Invalid target count');
  if (!Number.isFinite(normalDps) || normalDps < 0 || !Number.isFinite(actionSeconds) || actionSeconds < 0 || actionSeconds > cooldownSeconds) throw new RangeError('Invalid action cost');
  const risk = (ranged ? c.risk.ranged : 1) * (area ? c.risk.area : 1) * (piercing ? c.risk.piercing : 1) * (control ? c.risk.control : 1);
  const targets = 1 + c.targetCredit * (expectedTargets - 1);
  return (skillBudget(unlockLevel, c) * cooldownSeconds / (risk * targets) + normalDps * actionSeconds) / hits;
}
module.exports = { DEFAULTS, config, gearGrowth, logPower, gearRatio, logMainGain, nodeRatio, fullExtrasRatio,
  gemMultiplier, optionalCeiling, encounter, damageMultiplier, damage, skillBudget, skillPower };
