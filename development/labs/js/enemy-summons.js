'use strict';
// Derive preview entities from elapsed animation time; pause/seek never duplicates a spawn.
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EnemySummons = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  function visibleAt(model, elapsed, bridge = false) {
    const preview = model.summonPreview;
    if (!preview) return [];
    const event = model.events.find(item => item.name === 'spawn-slime');
    const before = bridge ? model.transitions.idleLeadInMs : 0;
    const repetitions = model.loop ? (bridge ? 2 : Infinity) : 1;
    if (bridge) elapsed %= before + repetitions * model.durationMs + model.transitions.idleLeadOutMs;
    const last = Math.min(repetitions - 1, Math.floor((elapsed - before - event.timeMs) / model.durationMs));
    const first = Math.max(0, Math.ceil((elapsed - before - event.timeMs - preview.lifetimeMs) / model.durationMs));
    const entities = [];
    for (let cycle = first; cycle <= last; cycle++) {
      const ageMs = elapsed - before - event.timeMs - cycle * model.durationMs;
      if (ageMs >= 0 && ageMs < preview.lifetimeMs) entities.push({
        cycle, ageMs, enemy: event.enemy,
        x: event.spawnOffset.x + preview.velocity.x * ageMs / 1000,
        y: event.spawnOffset.y + preview.velocity.y * ageMs / 1000,
      });
    }
    return entities;
  }
  return { visibleAt };
});
