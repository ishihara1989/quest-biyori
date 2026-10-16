'use strict';
// The browser and Node tests share the same fixed-step combat simulation.
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BattleSimulation = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const STEP_MS = 1000 / 60;
  const DEFAULT_BOUNDS = Object.freeze({ width: 1024, minY: 323, maxY: 512, margin: 128 });
  const DEFAULT_STATS = Object.freeze({
    warrior: Object.freeze({ name: '戦士', maxHp: 120, damage: 18, range: 116, moveSpeed: 105,
      attackIntervalMs: 1450, attackMotion: 'attack-overhead', moveMotion: 'forward',
      impactMs: 340, attackDurationMs: 680, hitDurationMs: 380, downDurationMs: 1250 }),
    slime: Object.freeze({ name: 'スライム', maxHp: 96, damage: 12, range: 108, moveSpeed: 82,
      attackIntervalMs: 1550, attackMotion: 'attack', moveMotion: 'move',
      impactMs: 160, attackDurationMs: 620, hitDurationMs: 400, downDurationMs: 1100 }),
  });
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const changeState = (actor, next) => {
    if (actor.state !== next) { actor.state = next; actor.stateTimeMs = 0; }
  };

  function createBattle({ random = Math.random, stats = {}, bounds = DEFAULT_BOUNDS } = {}) {
    const between = (min, max) => min + random() * (max - min);
    const actors = ['warrior', 'slime'].map((id, index) => {
      const spec = { ...DEFAULT_STATS[id], ...stats[id] };
      return { id, spec, hp: spec.maxHp,
        x: index === 0 ? between(bounds.margin, bounds.width * 0.4)
          : between(bounds.width * 0.6, bounds.width - bounds.margin),
        y: between(bounds.minY + 22, bounds.maxY - 22),
        state: 'idle', stateTimeMs: 0, cooldownMs: 0, attackHit: false, flashMs: 0 };
    });
    return { actors, bounds: { ...bounds }, status: 'running', winner: null,
      elapsedMs: 0, animationMs: 0, warmupMs: 600, accumulatorMs: 0 };
  }

  function step(battle, events) {
    battle.animationMs += STEP_MS;
    if (battle.status === 'running') battle.elapsedMs += STEP_MS;
    for (const actor of battle.actors) {
      actor.stateTimeMs += STEP_MS;
      actor.cooldownMs = Math.max(0, actor.cooldownMs - STEP_MS);
      actor.flashMs = Math.max(0, actor.flashMs - STEP_MS);
      if (actor.state === 'attacking' && actor.stateTimeMs >= actor.spec.attackDurationMs) changeState(actor, 'idle');
      if (actor.state === 'hurt' && actor.stateTimeMs >= actor.spec.hitDurationMs) changeState(actor, 'idle');
    }
    // Keep playing the defeat / recovery animations after combat has ended.
    if (battle.status !== 'running') return;
    if (battle.warmupMs > 0) { battle.warmupMs -= STEP_MS; return; }

    // Read both positions before moving either actor, so pursuit is symmetric.
    const positions = battle.actors.map(({ x, y }) => ({ x, y }));
    battle.actors.forEach((actor, index) => {
      if (actor.hp <= 0 || ['attacking', 'hurt'].includes(actor.state)) return;
      const target = positions[1 - index], origin = positions[index];
      const gap = distance(origin, target);
      if (gap > actor.spec.range + 0.001) {
        const travel = Math.min(actor.spec.moveSpeed * STEP_MS / 1000, gap - actor.spec.range);
        actor.x += (target.x - origin.x) / gap * travel;
        actor.y += (target.y - origin.y) / gap * travel;
        actor.x = Math.max(battle.bounds.margin, Math.min(battle.bounds.width - battle.bounds.margin, actor.x));
        actor.y = Math.max(battle.bounds.minY, Math.min(battle.bounds.maxY, actor.y));
        changeState(actor, 'moving');
      } else if (actor.cooldownMs === 0) {
        changeState(actor, 'attacking'); actor.attackHit = false;
        actor.cooldownMs = actor.spec.attackIntervalMs;
      } else changeState(actor, 'idle');
    });

    // Collect impacts before applying damage. Hits in the same tick can trade.
    const impacts = [];
    battle.actors.forEach((actor, index) => {
      if (actor.state !== 'attacking' || actor.attackHit || actor.stateTimeMs < actor.spec.impactMs) return;
      actor.attackHit = true;
      const target = battle.actors[1 - index];
      if (actor.hp > 0 && target.hp > 0 && distance(actor, target) <= actor.spec.range + 0.001) {
        impacts.push({ actor, target });
      }
    });
    for (const { actor, target } of impacts) {
      target.hp = Math.max(0, target.hp - actor.spec.damage);
      target.flashMs = 180;
      events.push({ type: 'damage', source: actor.id, target: target.id, amount: actor.spec.damage,
        x: target.x, y: target.y, timeMs: battle.animationMs });
    }
    for (const { target } of impacts) {
      if (target.hp === 0) changeState(target, 'down');
      // A committed swing finishes even when hit; otherwise fast attacks can stun-lock the opponent.
      else if (target.state !== 'attacking') changeState(target, 'hurt');
    }
    if (battle.actors.some(actor => actor.hp === 0)) {
      const survivors = battle.actors.filter(actor => actor.hp > 0);
      battle.status = 'finished'; battle.winner = survivors[0]?.id ?? 'draw';
      for (const actor of survivors) if (actor.state === 'moving') changeState(actor, 'idle');
      events.push({ type: 'finished', winner: battle.winner, timeMs: battle.elapsedMs });
    }
  }

  function updateBattle(battle, elapsedMs) {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('Elapsed time must be finite and non-negative');
    const events = [];
    battle.accumulatorMs += elapsedMs;
    while (battle.accumulatorMs + 1e-8 >= STEP_MS) {
      step(battle, events); battle.accumulatorMs -= STEP_MS;
    }
    return events;
  }
  return { createBattle, updateBattle, distance, DEFAULT_STATS, DEFAULT_BOUNDS, STEP_MS };
});
