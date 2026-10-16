'use strict';
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RitualMotions = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const CHARACTERS = {
    ninja: { label: '忍者', attack: 'attack-shuriken', loop: 'seal', release: null },
    shaman: { label: '呪術師', attack: 'attack-staff', loop: 'chant', release: 'cast-forward' },
    miko: { label: '巫女', attack: 'attack-wand', loop: 'prayer', release: 'prayer-release' },
  };
  const LABELS = { 'attack-shuriken': '手裏剣・通常攻撃', seal: '印を結ぶ',
    'attack-staff': '杖・通常攻撃', chant: '詠唱', 'cast-forward': '杖を前へ',
    'attack-wand': '棒・通常攻撃', prayer: '祈り・左右に振る', 'prayer-release': '祈り終了・一回転', idle: '待機' };
  const LEAD = 400, OUT = 600, LOOPS = 2, SHURIKEN_RELEASE = 180, SHURIKEN_FLIGHT = 280;
  function duration(character, action, models) {
    const c = CHARACTERS[character];
    if (action === 'loop') return models[c.loop].durationMs;
    return LEAD + (action === 'attack' ? models[c.attack].durationMs
      : models[c.loop].durationMs * LOOPS + (c.release ? models[c.release].durationMs : 0)) + OUT;
  }
  // Asset clocks are authoritative; no reverse playback of the maiden's spin.
  function sample(character, action, elapsed, models) {
    const c = CHARACTERS[character], t = Math.max(0, elapsed);
    if (action === 'loop') return { motion: c.loop, time: t % models[c.loop].durationMs, phase: 'loop' };
    if (t < LEAD) return { motion: 'idle', time: t, phase: 'before' };
    let time = t - LEAD;
    if (action === 'attack') {
      if (time < models[c.attack].durationMs) return { motion: c.attack, time, phase: 'attack' };
      return { motion: 'idle', time: time - models[c.attack].durationMs, phase: 'idle' };
    }
    const chant = models[c.loop].durationMs * LOOPS;
    if (time < chant) return { motion: c.loop, time: time % models[c.loop].durationMs, phase: 'loop' };
    time -= chant;
    if (c.release && time < models[c.release].durationMs) return { motion: c.release, time, phase: 'release' };
    return { motion: 'idle', time: time - (c.release ? models[c.release].durationMs : 0), phase: 'idle' };
  }
  function projectile(elapsed) {
    // Frame 2 contains the freshly released star; start its separate flight at frame 3.
    const age = elapsed - LEAD - SHURIKEN_FLIGHT;
    return age >= 0 && age < 420 ? { age, progress: age / 420 } : null;
  }
  return { CHARACTERS, LABELS, LEAD, OUT, LOOPS, SHURIKEN_RELEASE, SHURIKEN_FLIGHT, duration, sample, projectile };
});
