'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StatusResistance = api;
})(globalThis, () => {
  // Roll only when resistance exists, preserving ordinary battles' RNG sequence.
  function resists(run, actor, events = []) {
    const rate = Math.min(1, Math.max(0, actor.statusResistance || 0));
    if (!rate || (rate < 1 && (run.random || Math.random)() >= rate)) return false;
    events.push({ type: 'gem-effect', kind: 'resistance', target: actor.id,
      x: actor.x, y: actor.y, timeMs: run.time });
    return true;
  }
  return { resists };
});
