'use strict';
(() => {
  const $ = id => document.getElementById(id), canvas = $('ritual-stage'), ctx = canvas.getContext('2d');
  const R = RitualMotions, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let sprites, layers, projectileImage, character = 'ninja', action = 'attack', elapsed = 0;
  let playing = !reduced.matches, last = null, ready = false;
  const image = src => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(Error(src)); img.src = src; });
  async function load(base) {
    const response = await fetch(base + 'manifest.json'); if (!response.ok) throw Error(base);
    const data = await response.json(); return { data, image: await image(base + data.sheet) };
  }
  const models = () => Object.fromEntries(Object.entries(sprites[character]).map(([key, asset]) => [key, asset.data]));
  const total = () => R.duration(character, action, models());
  function draw(asset, time, x, y, scale, flip) {
    const d = asset.data, t = d.loop || d.motion === 'idle' ? Math.max(0, time) % d.durationMs : Math.min(Math.max(0, time), d.durationMs - .01);
    const f = d.frames[MotionPlayback.frameAt(d, t)];
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(asset.image, f.x, f.y, f.width, f.height, -d.pivot.x * scale, -d.pivot.y * scale, f.width * scale, f.height * scale); ctx.restore();
    return f.index;
  }
  function render() {
    if (!ready) return;
    const t = elapsed % total(), pose = R.sample(character, action, t, models());
    const flip = $('flip').checked, direction = flip ? -1 : 1, x = flip ? 670 : 355, y = 463, scale = 1.7;
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach(img => ctx.drawImage(img, 0, 0, canvas.width, canvas.height));
    ctx.fillStyle = '#10262066'; ctx.beginPath(); ctx.ellipse(x, y + 2, 37, 7, 0, 0, Math.PI * 2); ctx.fill();
    if ($('effects').checked && pose.phase === 'loop') {
      const color = character === 'shaman' ? '#65e7c5' : character === 'ninja' ? '#ff897b' : '#ffe5ac';
      ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = .6;
      for (let i = 0; i < 12; i++) {
        const a = i * 2.4 + t / 1200, height = (t / 7 + i * 21) % 160;
        ctx.fillRect(Math.round(x + Math.cos(a) * (30 + height * .1)), Math.round(y - height), 3, 3);
      }
      ctx.restore();
    }
    const frame = draw(sprites[character][pose.motion], pose.time, x, y, scale, flip);
    const flight = character === 'ninja' && action === 'attack' ? R.projectile(t) : null;
    if (flight) {
      const emission = sprites.ninja['attack-shuriken'].data.projectile.emission;
      const px = x + direction * (emission.x * scale + flight.progress * 290), py = y + emission.y * scale;
      ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.rotate(direction * flight.age / 60);
      ctx.drawImage(projectileImage, -projectileImage.width * scale / 2, -projectileImage.height * scale / 2, projectileImage.width * scale, projectileImage.height * scale); ctx.restore();
      if ($('effects').checked) {
        ctx.fillStyle = '#d4e9ff'; ctx.globalAlpha = .35;
        for (let i = 1; i <= 4; i++) ctx.fillRect(Math.round(px - direction * i * 12), py - 2, 7, 3);
        ctx.globalAlpha = 1;
      }
    }
    canvas.dataset.character = character; canvas.dataset.motion = pose.motion; canvas.dataset.frame = String(frame); canvas.dataset.phase = pose.phase;
    canvas.dataset.projectile = String(Boolean(flight));
    $('phase').textContent = `${R.LABELS[pose.motion]} · ${frame + 1}/${sprites[character][pose.motion].data.frameCount}`;
    $('time').textContent = Math.round(t) + 'ms'; $('scrub').max = total() - 1; $('scrub').value = t;
    [...$('sequence').children].forEach(el => el.classList.toggle('active', el.dataset.phase === pose.phase));
  }
  function setPlaying(value) { playing = value; last = null; $('play').textContent = playing ? 'Ⅱ' : '▶'; $('play').setAttribute('aria-label', playing ? '一時停止' : '再生'); }
  function choose(id, nextAction = action) {
    if (!R.CHARACTERS[id]) return;
    character = id; action = ['attack', 'ritual', 'loop'].includes(nextAction) ? nextAction : 'attack'; elapsed = 0; last = null;
    const c = R.CHARACTERS[id], label = R.LABELS[c.loop];
    $('title').textContent = c.label; document.title = c.label + ' — モーション';
    $('frames-link').href = '/development/labs/index.html#' + id; $('loop-label').textContent = label;
    $('ritual-label').textContent = id === 'ninja' ? '印 → 待機' : id === 'shaman' ? '詠唱 → 杖を前へ' : '祈り → 一回転';
    canvas.setAttribute('aria-label', c.label + 'のモーションプレビュー');
    document.querySelectorAll('[data-character]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.character === id)));
    document.querySelectorAll('[data-action]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.action === action)));
    const phases = action === 'loop' ? [['loop', label]] : [['before', '待機'], ...(action === 'attack' ? [['attack', '通常攻撃']]
      : [['loop', label], ...(c.release ? [['release', R.LABELS[c.release]]] : [])]), ['idle', '待機']];
    $('sequence').replaceChildren(...phases.map(([phase, text]) => { const el = document.createElement('span'); el.dataset.phase = phase; el.textContent = text; return el; }));
    $('assets').replaceChildren(...Object.keys(sprites[id]).filter(key => key !== 'idle').map(key => {
      const link = document.createElement('a'); link.href = '/development/labs/index.html#' + id + '/' + key; link.textContent = R.LABELS[key] + ' ↗'; link.title = 'コマ送り・PNG・GIF'; return link;
    }));
    history.replaceState(null, '', '#' + id + '/' + action); render();
  }
  function step(direction) {
    setPlaying(false);
    // Walk to the actual next/previous frame boundary, including motion transitions.
    const current = R.sample(character, action, elapsed % total(), models());
    const data = models()[current.motion], frame = MotionPlayback.frameAt(data, data.loop || current.motion === 'idle' ? current.time % data.durationMs : current.time);
    let destination = elapsed;
    for (let ms = 1; ms <= total(); ms++) {
      const at = Math.max(0, elapsed + direction * ms), pose = R.sample(character, action, at % total(), models());
      const m = models()[pose.motion], index = MotionPlayback.frameAt(m, m.loop || pose.motion === 'idle' ? pose.time % m.durationMs : pose.time);
      if (pose.motion !== current.motion || index !== frame) { destination = at; break; }
      if (at === 0 && direction < 0) break;
    }
    elapsed = destination; render();
  }
  function tick(time) {
    if (ready && playing && !document.hidden && last !== null) elapsed += Math.min(100, time - last) * Number($('speed').value);
    last = !playing || document.hidden ? null : time; render(); requestAnimationFrame(tick);
  }
  $('play').onclick = () => setPlaying(!playing); $('previous').onclick = () => step(-1); $('next').onclick = () => step(1);
  $('restart').onclick = () => { elapsed = 0; setPlaying(true); render(); };
  $('scrub').oninput = () => { setPlaying(false); elapsed = Number($('scrub').value); render(); };
  $('effects').onchange = render; $('flip').onchange = render;
  document.querySelectorAll('[data-action]').forEach(button => { button.disabled = true; button.onclick = () => choose(character, button.dataset.action); });
  document.addEventListener('keydown', event => {
    if (!ready || event.target.closest('input,select,button,a')) return;
    if (event.code === 'Space') { event.preventDefault(); setPlaying(!playing); }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') { event.preventDefault(); step(event.code === 'ArrowLeft' ? -1 : 1); }
  });
  reduced.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  document.addEventListener('visibilitychange', () => { last = null; });
  function fromHash() { const [id, kind] = location.hash.slice(1).split('/'); choose(id || 'ninja', kind || 'attack'); }
  (async () => {
    try {
      [sprites, layers, projectileImage] = await Promise.all([
        Promise.all(Object.entries(R.CHARACTERS).map(async ([id, c]) => [id, Object.fromEntries(await Promise.all([
          load('assets/' + id + '/').then(a => ['idle', a]),
          ...[c.attack, c.loop, c.release].filter(Boolean).map(async key => [key, await load('assets/' + id + '/motions/' + key + '/')]),
        ]))])).then(Object.fromEntries),
        Promise.all(['forest-distant.png', 'forest-ground-near.png'].map(file => image('assets/stages/starting-forest/' + file))),
        image('assets/ninja/motions/attack-shuriken/shuriken-projectile.png'),
      ]);
      for (const [id, c] of Object.entries(R.CHARACTERS)) {
        const button = document.createElement('button'); button.dataset.character = id;
        const img = document.createElement('img'); img.src = 'assets/' + id + '/idle-01.png'; img.alt = '';
        const span = document.createElement('span'); span.textContent = c.label; button.append(img, span); button.onclick = () => choose(id); $('characters').append(button);
      }
      ready = true; $('status').hidden = true;
      document.querySelectorAll('.transport button, [data-action]').forEach(button => { button.disabled = false; });
      fromHash(); setPlaying(playing); requestAnimationFrame(tick); window.addEventListener('hashchange', fromHash);
    } catch (error) { $('status').textContent = '読み込み失敗: ' + error.message; console.error(error); }
  })();
})();
