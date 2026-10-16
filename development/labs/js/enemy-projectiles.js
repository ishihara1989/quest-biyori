'use strict';
// Compute projectile previews from time, so pausing and seeking cannot duplicate fire.
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EnemyProjectiles = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  function visibleAt(model, elapsed, bridge = false) {
    const preview = model.projectilePreview;
    if (!preview) return [];
    elapsed = Math.max(0, elapsed);
    const before = bridge ? model.transitions.idleLeadInMs : 0;
    const repetitions = model.loop ? (bridge ? 2 : Infinity) : 1;
    if (bridge) elapsed %= before + repetitions * model.durationMs + model.transitions.idleLeadOutMs;
    const entities = [];
    for (const event of model.events || []) {
      if (event.type !== 'spawn-projectile' || event.effect !== preview.effect) continue;
      const last = Math.min(repetitions - 1, Math.floor((elapsed - before - event.timeMs) / model.durationMs));
      const first = Math.max(0, Math.ceil((elapsed - before - event.timeMs - preview.lifetimeMs) / model.durationMs));
      for (let cycle = first; cycle <= last; cycle++) {
        const ageMs = elapsed - before - event.timeMs - cycle * model.durationMs;
        if (ageMs >= 0 && ageMs < preview.lifetimeMs) entities.push({
          eventId: event.id, effect: event.effect, cycle, ageMs,
          x: preview.velocity.x * ageMs / 1000,
          y: preview.velocity.y * ageMs / 1000,
        });
      }
    }
    return entities;
  }
  function viewport(base, preview) {
    const left = preview?.paddingLeft || 0;
    return { width: base.width + left, height: base.height,
      pivot: { x: base.pivot.x + left, y: base.pivot.y } };
  }
  function stripsAt(entity, model, effect, view) {
    const preview = model.projectilePreview, frame = effect.frames[0], scale = preview.scale;
    const dx = view.pivot.x - model.pivot.x, dy = view.pivot.y - model.pivot.y;
    return preview.streams.map(stream => {
      const muzzleX = dx + stream.muzzle.x;
      return {
        source: { x: frame.x, y: frame.y + stream.sourceY,
          width: frame.width, height: stream.sourceHeight },
        destination: {
          x: Math.round(muzzleX - frame.bounds.left * scale - preview.leadInPx + entity.x),
          y: Math.round(dy + stream.muzzle.y + (stream.sourceY - stream.sourceCenterY) * scale + entity.y),
          width: frame.width * scale, height: stream.sourceHeight * scale,
        },
        // Reveal only seeds ahead of their own flower mouth. The unseen part
        // starts behind the muzzle and is uncovered as the whole volley moves.
        clip: { x: 0, y: 0, width: muzzleX, height: view.height },
      };
    });
  }
  return { visibleAt, viewport, stripsAt };
});
