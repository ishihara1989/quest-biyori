'use strict';
// Shared by the viewer and its behavioral tests. All times are milliseconds.
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MotionPlayback = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  function frameAt(model, elapsed) {
    const sequence = model.frameSequence;
    let cursor = 0;
    for (const frame of sequence) {
      cursor += model.frames[frame].durationMs;
      if (elapsed < cursor) {
        // Repeated releases reuse the held windup briefly before the next
        // launch. Four artwork poses remain independent from event timing.
        if (frame === 2 && model.repeatRelease) {
          const next = model.events?.find(event => event.timeMs > elapsed);
          if (next && next.timeMs - elapsed <= 300) return 1;
        }
        return frame;
      }
    }
    return sequence[sequence.length - 1];
  }
  function sample(model, idle, elapsed, bridge = false) {
    elapsed = Math.max(0, elapsed);
    const motion = model.motion || 'idle';
    const isLoop = motion === 'idle' || model.loop;
    const at = (asset, time, phase, finished = false) => ({
      motion: asset.motion || 'idle', frame: frameAt(asset, time), phase, finished,
    });
    if (motion === 'idle') return at(idle, elapsed % idle.durationMs, 'idle');
    if (!bridge) {
      if (isLoop) return at(model, elapsed % model.durationMs, 'motion');
      if (elapsed < model.durationMs) return at(model, elapsed, 'motion');
      if (model.terminal) return at(model, model.durationMs, 'hold', true);
      return at(idle, (elapsed - model.durationMs) % idle.durationMs, 'returned');
    }
    const before = model.transitions?.idleLeadInMs ?? 600;
    const during = model.durationMs * (isLoop ? 2 : 1), after = model.transitions?.idleLeadOutMs ?? 800;
    const cycle = before + during + after;
    const time = model.terminal ? elapsed : elapsed % cycle;
    if (time < before) return at(idle, time, 'before');
    if (time < before + during) return at(model, (time - before) % model.durationMs, 'motion');
    if (model.terminal) return at(model, model.durationMs, 'hold', true);
    return at(idle, time - before - during, 'after');
  }
  function elapsedForFrame(model, frame, bridge = false) {
    const position = model.frameSequence.indexOf(frame);
    const start = model.frameSequence.slice(0, position).reduce((sum, index) => sum + model.frames[index].durationMs, 0);
    return start + (bridge && model.motion !== 'idle' ? (model.transitions?.idleLeadInMs ?? 600) : 0);
  }
  return { frameAt, sample, elapsedForFrame };
});
