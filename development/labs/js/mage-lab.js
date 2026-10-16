'use strict';
(() => {
  const $ = id => document.getElementById(id), ctx = $('mage-stage').getContext('2d');
  const labels = { 'attack-staff': '杖・通常攻撃', chant: '詠唱', 'cast-forward': '杖を前へ', 'cast-forward-hold': '前方・維持', 'cast-up': '杖を振り上げる', 'cast-up-hold': '上方・維持', idle: '待機' };
  const phaseLabels = { before: '待機', chant: '詠唱', release: '構え', hold: '維持', recover: '戻す', settle: '詠唱', idle: '待機', attack: '通常攻撃', motion: 'モーション' };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let sprites, fx, layers, motion = 'attack-staff', elapsed = 0, playing = !reduced.matches, last = null, ready = false;
  async function load(base) {
    const response = await fetch(base + 'manifest.json'); if (!response.ok) throw Error(base);
    const data = await response.json(); return { data, image: await image(base + data.sheet) };
  }
  function image(src) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(Error(src)); img.src = src; }); }
  const kind = () => motion === 'attack-staff' ? 'normal' : motion.startsWith('cast-up') ? 'up' : 'forward';
  function duration() { return !$('connected').checked || motion === 'chant' ? sprites[motion].data.durationMs : 600 + (kind() === 'normal' ? MageMotions.NORMAL_DURATION : MageMotions.SKILL_DURATION) + 800; }
  function poseAt(t) {
    if (!$('connected').checked || motion === 'chant') return { motion, time: t % sprites[motion].data.durationMs, phase: 'motion' };
    if (t < 600) return { motion: 'idle', time: t, phase: 'before' };
    return MageMotions.sample(kind(), t - 600);
  }
  function draw(asset, t, x, y, scale = 1, flip = false, alpha = 1) {
    const d = asset.data, time = d.loop || d.motion === 'idle' ? Math.max(0, t) % d.durationMs : Math.max(0, Math.min(t, d.durationMs - .01)), f = d.frames[MotionPlayback.frameAt(d, time)];
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(asset.image, f.x, f.y, f.width, f.height, -d.pivot.x * scale, -d.pivot.y * scale, f.width * scale, f.height * scale); ctx.restore();
  }
  function render() {
    if (!ready) return;
    const t = elapsed % duration(), pose = poseAt(t), direction = $('flip').checked ? -1 : 1, x = direction > 0 ? 360 : 664, y = 466;
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 1024, 576); layers.forEach(img => ctx.drawImage(img, 0, 0, 1024, 576));
    ctx.save(); ctx.fillStyle = '#10262066'; ctx.beginPath(); ctx.ellipse(x, y + 1, 34, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const effects = $('effects').checked, casting = pose.motion === 'chant' || pose.motion.startsWith('cast-');
    if (effects && casting) draw(fx['mage-chant-aura'], reduced.matches ? 0 : t, x, y, 1.05);
    draw(sprites[pose.motion], pose.time, x, y, 1.35, direction < 0);
    if (effects && $('connected').checked && motion !== 'chant') {
      const start = 600 + (kind() === 'normal' ? MageMotions.NORMAL_IMPACT : MageMotions.SKILL_IMPACT), age = t - start;
      if (age >= 0 && age < 420) {
        const tip = MageMotions.emission(kind()), progress = age / 420;
        const px = x + direction * (tip.x * 1.35 + progress * 240), py = y + tip.y * 1.35 - (kind() === 'up' ? progress * 125 : 0);
        ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(kind() === 'up' ? -125 : 0, direction * 240));
        draw(fx['mage-wind-bolt'], reduced.matches ? 0 : age, 0, 0, .6); ctx.restore();
      }
      if (age >= 420 && age < 860) {
        const tip = MageMotions.emission(kind());
        draw(fx['mage-wind-impact'], age - 420, x + direction * (tip.x * 1.35 + 240), y + tip.y * 1.35 - (kind() === 'up' ? 125 : 0), .8);
      }
    }
    const f = MotionPlayback.frameAt(sprites[pose.motion].data, sprites[pose.motion].data.loop ? pose.time % sprites[pose.motion].data.durationMs : pose.time);
    $('mage-stage').dataset.motion = pose.motion; $('mage-stage').dataset.frame = f;
    $('phase').textContent = labels[pose.motion] + ' · ' + (f + 1) + '/4';
    $('time').textContent = Math.round(t) + 'ms'; $('scrub').max = duration() - 1; $('scrub').value = t;
    [...$('sequence').children].forEach(node => node.classList.toggle('active', node.dataset.phase === pose.phase));
  }
  function sequence() {
    const phases = !$('connected').checked || motion === 'chant' ? ['motion'] : kind() === 'normal' ? ['before', 'attack', 'recover', 'idle'] : ['before', 'chant', 'release', 'hold', 'recover', 'settle', 'idle'];
    $('sequence').replaceChildren(...phases.map(phase => { const s = document.createElement('span'); s.dataset.phase = phase; s.textContent = phaseLabels[phase]; return s; }));
  }
  function setPlaying(value) { playing = value; last = null; $('play').textContent = playing ? 'Ⅱ' : '▶'; $('play').setAttribute('aria-label', playing ? '一時停止' : '再生'); }
  function step(delta) { setPlaying(false); elapsed = Math.max(0, elapsed + delta); render(); }
  function choose(id) {
    motion = id; elapsed = 0; last = null; history.replaceState(null, '', '#' + id);
    document.querySelectorAll('[data-motion]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.motion === motion)));
    sequence(); render();
  }
  function tick(t) { if (ready && playing && !document.hidden && last !== null) elapsed += Math.min(100, t - last) * Number($('speed').value); last = !playing || document.hidden ? null : t; render(); requestAnimationFrame(tick); }
  $('play').onclick = () => setPlaying(!playing); $('previous').onclick = () => step(-50); $('next').onclick = () => step(50); $('restart').onclick = () => { elapsed = 0; setPlaying(true); render(); };
  $('scrub').oninput = () => { setPlaying(false); elapsed = Number($('scrub').value); render(); };
  $('connected').onchange = () => { elapsed = 0; sequence(); render(); }; $('effects').onchange = render; $('flip').onchange = render;
  document.addEventListener('keydown', event => { if (!ready || event.target.closest('select,input,button,a')) return; if (event.code === 'Space') { event.preventDefault(); setPlaying(!playing); } else if (event.code === 'ArrowLeft') step(-50); else if (event.code === 'ArrowRight') step(50); });
  reduced.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  (async () => {
    try {
      [sprites, fx, layers] = await Promise.all([
        Promise.all([load('assets/mage/').then(a => ['idle', a]), ...MageMotions.MOTIONS.map(async id => [id, await load('assets/mage/motions/' + id + '/')])]).then(Object.fromEntries),
        Promise.all(MageMotions.EFFECTS.map(async id => [id, await load('assets/effects/' + id + '/')])).then(Object.fromEntries),
        Promise.all(['forest-distant.png', 'forest-ground-near.png'].map(file => image('assets/stages/starting-forest/' + file)))
      ]);
      for (const id of MageMotions.MOTIONS) {
        const button = document.createElement('button'); button.dataset.motion = id; button.title = labels[id];
        const img = document.createElement('img'); img.src = 'assets/mage/motions/' + id + '/' + sprites[id].data.frames[0].file; img.alt = '';
        const span = document.createElement('span'); span.textContent = labels[id]; button.append(img, span); button.onclick = () => choose(id); $('motions').append(button);
      }
      ready = true; $('status').hidden = true; ['play', 'previous', 'next', 'restart'].forEach(id => $(id).disabled = false);
      choose(MageMotions.MOTIONS.includes(location.hash.slice(1)) ? location.hash.slice(1) : motion); setPlaying(playing); requestAnimationFrame(tick);
    } catch (error) { $('status').textContent = '読み込み失敗: ' + error.message; console.error(error); }
  })();
})();
