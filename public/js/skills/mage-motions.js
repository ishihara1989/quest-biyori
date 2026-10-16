'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MageMotions = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const MOTIONS = ['attack-staff', 'chant', 'cast-forward', 'cast-forward-hold', 'cast-up', 'cast-up-hold'];
  const EFFECTS = ['mage-wind-bolt', 'mage-chant-aura', 'mage-wind-impact'];
  const NORMAL_IMPACT = 340, NORMAL_DURATION = 940;
  const CHANT_DURATION = 640, EXTEND_DURATION = 400, HOLD_DURATION = 640;
  const SKILL_IMPACT = CHANT_DURATION + EXTEND_DURATION;
  const SKILL_DURATION = SKILL_IMPACT + HOLD_DURATION + EXTEND_DURATION + 160;
  function emission(kind) {
    // Reviewed cyan crystal centers relative to the shared ground pivot.
    return kind === 'normal' ? { x: 96, y: -97 } : kind === 'up' ? { x: 36, y: -182 } : { x: 94, y: -86 };
  }
  function sample(kind, elapsed) {
    const t = Math.max(0, elapsed);
    if (kind === 'normal') {
      if (t < 680) return { motion: 'attack-staff', time: t, phase: 'attack' };
      // Reuse the generated follow-through backwards to bring the staff home.
      if (t < NORMAL_DURATION) return { motion: 'attack-staff', time: Math.max(0, 679 - (t - 680) / 260 * 679), phase: 'recover' };
      return { motion: 'idle', time: t - NORMAL_DURATION, phase: 'idle' };
    }
    const up = kind === 'up', transition = up ? 'cast-up' : 'cast-forward', hold = transition + '-hold';
    if (t < CHANT_DURATION) return { motion: 'chant', time: t, phase: 'chant' };
    if (t < SKILL_IMPACT) return { motion: transition, time: t - CHANT_DURATION, phase: 'release' };
    if (t < SKILL_IMPACT + HOLD_DURATION) return { motion: hold, time: t - SKILL_IMPACT, phase: 'hold' };
    if (t < SKILL_DURATION - 160) return { motion: transition, time: Math.max(0, 399 - (t - SKILL_IMPACT - HOLD_DURATION)), phase: 'recover' };
    if (t < SKILL_DURATION) return { motion: 'chant', time: 0, phase: 'settle' };
    return { motion: 'idle', time: t - SKILL_DURATION, phase: 'idle' };
  }
  function actorPose(actor) {
    if (actor.type === 'mage' && actor.mageCast) return { motion: actor.motion, time: actor.motionTime, phase: actor.mageCast.elapsed < actor.mageCast.spec.chant ? 'chant' : actor.mageCast.elapsed < actor.mageCast.spec.release ? 'release' : 'hold' };
    if (actor.type !== 'mage' || !['attacking', 'skill'].includes(actor.state)) return null;
    // Keep the existing attack-speed, launch at 340ms and recovery at 680ms.
    // The asset lab shows the full uncompressed casting loop.
    const t = actor.time * (actor.attackSpeed || 1), normal = actor.state === 'attacking';
    const impact = normal ? NORMAL_IMPACT : SKILL_IMPACT;
    const duration = normal ? NORMAL_DURATION : SKILL_DURATION;
    const visualTime = t < 340 ? t / 340 * impact : impact + (t - 340) / 340 * (duration - impact);
    return sample(normal ? 'normal' : 'forward', visualTime);
  }
  return { MOTIONS, EFFECTS, NORMAL_IMPACT, NORMAL_DURATION, SKILL_IMPACT, SKILL_DURATION, sample, actorPose, emission };
});
