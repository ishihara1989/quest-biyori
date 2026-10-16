'use strict';
(async function () {
  const $ = id => document.getElementById(id);
  const canvas = $('battle-canvas'), ctx = canvas.getContext('2d');
  const { createBattle, updateBattle, DEFAULT_STATS } = BattleSimulation;
  const W = canvas.width, H = canvas.height;
  const actionLabels = { idle: '待機', moving: '接近', attacking: '攻撃', hurt: '被撃', down: '撃破' };
  const colors = { warrior: '#e7c087', slime: '#92d9ef' };
  let battle, sprites, layers, stats, bounds, effects = [], round = 0, lastTime;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let speed = 1;

  async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
  }
  function image(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`画像を読み込めません: ${url}`));
      img.src = url;
    });
  }
  async function sprite(directory, filename = 'manifest.json') {
    const data = await json(directory + filename);
    return { data, image: await image(directory + data.sheet) };
  }
  async function loadSprites(id) {
    const directory = id === 'warrior' ? 'assets/warrior/' : 'assets/enemies/slime/';
    const motions = id === 'warrior' ? ['idle', 'forward', 'attack-overhead', 'hit', 'down']
      : ['idle', 'move', 'attack', 'hit', 'down'];
    return Object.fromEntries(await Promise.all(motions.map(async motion => [motion,
      await sprite(directory + (id === 'warrior' && motion === 'idle' ? '' : `motions/${motion}/`))])));
  }
  const seconds = ms => (ms / 1000).toFixed(1);
  function clock(ms) {
    const tenths = Math.floor(ms / 100), minutes = Math.floor(tenths / 600);
    return `${String(minutes).padStart(2, '0')}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`;
  }
  function text(id, value) { if ($(id).textContent !== value) $(id).textContent = value; }
  function appendLog(message, kind = '', elapsedMs = battle.elapsedMs) {
    const row = document.createElement('li'), time = document.createElement('time'), content = document.createElement('span');
    time.textContent = `${seconds(elapsedMs)}s`; content.textContent = message;
    row.dataset.kind = kind; row.append(time, content); $('battle-log').append(row);
    if ($('battle-log').children.length > 40) $('battle-log').firstElementChild.remove();
    $('battle-log').scrollTop = $('battle-log').scrollHeight;
  }
  function setPlaying(next) {
    playing = next; lastTime = undefined;
    text('battle-play', playing ? '一時停止' : '再開');
    $('battle-play').setAttribute('aria-label', playing ? '戦闘を一時停止' : '戦闘を再開');
    updateHud();
  }
  function restart() {
    battle = createBattle({ stats, bounds }); effects = []; round++;
    $('battle-result').hidden = true;
    $('battle-log').replaceChildren();
    text('battle-round', `ROUND ${String(round).padStart(2, '0')}`);
    appendLog('戦士とスライムが出現。', '', 0);
    setPlaying(true);
    canvas.setAttribute('aria-label', '左側の戦士と右側のスライムが、森で近づいて攻撃し合う戦闘シーン');
  }
  function updateHud() {
    if (!battle) return;
    text('battle-time', clock(battle.elapsedMs));
    text('battle-state', !playing ? '一時停止' : battle.status === 'finished' ? '戦闘終了'
      : battle.warmupMs > 0 ? '戦闘開始' : battle.actors.some(actor => actor.state === 'attacking') ? '交戦中' : '戦闘中');
    for (const actor of battle.actors) {
      text(`${actor.id}-action`, actionLabels[actor.state]);
      text(`${actor.id}-hp`, `HP ${actor.hp} / ${actor.spec.maxHp}`);
      $(`${actor.id}-hp-fill`).style.width = `${actor.hp / actor.spec.maxHp * 100}%`;
    }
  }
  function handleEvents(events) {
    for (const event of events) {
      if (event.type === 'damage') {
        effects.push(event);
        appendLog(`${stats[event.source].name}の攻撃 → ${stats[event.target].name}に${event.amount}ダメージ`, event.source);
      } else {
        const title = event.winner === 'draw' ? '相打ち' : `${stats[event.winner].name}の勝利`;
        text('battle-result-title', title); $('battle-result').hidden = false;
        appendLog(`${title}。戦闘終了。`, 'result');
        canvas.setAttribute('aria-label', `${title}。戦士の残りHP ${battle.actors[0].hp}、スライムの残りHP ${battle.actors[1].hp}。`);
      }
    }
  }
  function drawRange(actor) {
    if (actor.hp <= 0) return;
    ctx.save(); ctx.strokeStyle = colors[actor.id] + '99'; ctx.fillStyle = colors[actor.id] + '0d';
    ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.spec.range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = colors[actor.id];
    ctx.beginPath(); ctx.arc(actor.x, actor.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function drawActor(actor) {
    const motion = actor.state === 'moving' ? actor.spec.moveMotion : actor.state === 'attacking' ? actor.spec.attackMotion
      : actor.state === 'hurt' ? 'hit' : actor.state === 'down' ? 'down' : 'idle';
    const asset = sprites[actor.id][motion], idle = sprites[actor.id].idle;
    const sample = MotionPlayback.sample(asset.data, idle.data, actor.stateTimeMs);
    const current = sprites[actor.id][sample.motion], frame = current.data.frames[sample.frame];
    const x = Math.round(actor.x), y = Math.round(actor.y);
    ctx.save(); ctx.fillStyle = '#20191255'; ctx.beginPath();
    ctx.ellipse(x, y - 1, actor.id === 'warrior' ? 26 : 31, 6, 0, 0, Math.PI * 2); ctx.fill();
    if (actor.flashMs > 0) ctx.globalAlpha = Math.floor(actor.flashMs / 45) % 2 ? 0.6 : 1;
    ctx.drawImage(current.image, frame.x, frame.y, frame.width, frame.height,
      x - current.data.pivot.x, y - current.data.pivot.y, frame.width, frame.height);
    ctx.restore();
    if (actor.hp > 0) {
      const barY = y - (actor.id === 'warrior' ? 170 : 81);
      ctx.fillStyle = '#10201bda'; ctx.fillRect(x - 34, barY, 68, 7);
      ctx.fillStyle = colors[actor.id]; ctx.fillRect(x - 32, barY + 2, 64 * actor.hp / actor.spec.maxHp, 3);
    }
  }
  function drawEffects() {
    effects = effects.filter(effect => battle.animationMs - effect.timeMs < 850);
    for (const effect of effects) {
      const age = battle.animationMs - effect.timeMs, progress = age / 850;
      const x = Math.round(effect.x), hitY = effect.y - (effect.target === 'warrior' ? 78 : 30);
      ctx.save();
      if (age < 180) {
        const burst = 6 + age / 12;
        ctx.strokeStyle = colors[effect.source]; ctx.lineWidth = 3;
        for (let ray = 0; ray < 6; ray++) {
          const angle = ray / 6 * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * burst * 0.35, hitY + Math.sin(angle) * burst * 0.35);
          ctx.lineTo(x + Math.cos(angle) * burst, hitY + Math.sin(angle) * burst); ctx.stroke();
        }
      }
      ctx.globalAlpha = Math.min(1, (1 - progress) * 2);
      ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#17201d';
      const textY = effect.y - (effect.target === 'warrior' ? 146 : 62) - progress * 42;
      ctx.strokeText(`−${effect.amount}`, x, textY); ctx.fillStyle = colors[effect.source];
      ctx.fillText(`−${effect.amount}`, x, textY); ctx.restore();
    }
  }
  function draw(time) {
    const dt = lastTime === undefined ? 0 : Math.min(time - lastTime, 100);
    lastTime = time;
    if (playing && !document.hidden) handleEvents(updateBattle(battle, dt * speed));
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, W, H);
    layers.forEach(layer => ctx.drawImage(layer.image, 0, 0, W, H));
    if ($('battle-ranges').checked) battle.actors.forEach(drawRange);
    [...battle.actors].sort((a, b) => a.y - b.y).forEach(drawActor);
    drawEffects(); updateHud(); requestAnimationFrame(draw);
  }

  try {
    const base = 'assets/stages/starting-forest/';
    const stage = await json(base + 'manifest.json');
    [layers, sprites] = await Promise.all([
      Promise.all(stage.layers.map(async layer => ({ image: await image(base + layer.file) }))),
      Promise.all(['warrior', 'slime'].map(async id => [id, await loadSprites(id)])).then(Object.fromEntries),
    ]);
    bounds = { width: W, minY: stage.coordinateSystem.groundY.min, maxY: stage.coordinateSystem.groundY.max, margin: 128 };
    stats = Object.fromEntries(Object.entries(DEFAULT_STATS).map(([id, defaults]) => {
      const attack = sprites[id][defaults.attackMotion].data;
      // Damage lands on the first frame of the downswing / lunge, using the actual asset timings.
      const impactFrame = id === 'warrior' ? 2 : 1;
      const impactMs = attack.frameSequence.slice(0, impactFrame).reduce((sum, frame) => sum + attack.frames[frame].durationMs, 0);
      return [id, { ...defaults, impactMs, attackDurationMs: attack.durationMs,
        hitDurationMs: sprites[id].hit.data.durationMs, downDurationMs: sprites[id].down.data.durationMs }];
    }));
    for (const spec of Object.values(stats)) {
      const row = document.createElement('tr'), name = document.createElement('th');
      name.scope = 'row'; name.textContent = spec.name; row.append(name);
      for (const value of [spec.maxHp, spec.damage, `${spec.range} px`, `${(spec.attackIntervalMs / 1000).toFixed(2)} 秒`]) {
        const cell = document.createElement('td'); cell.textContent = String(value); row.append(cell);
      }
      $('battle-stat-rows').append(row);
    }
    $('battle-controls').disabled = false; text('battle-load-status', '');
    const initialPlaying = playing; restart(); setPlaying(initialPlaying);
    $('battle-play').addEventListener('click', () => setPlaying(!playing));
    $('battle-restart').addEventListener('click', restart);
    $('battle-speed').addEventListener('change', event => { speed = Number(event.target.value); });
    document.addEventListener('visibilitychange', () => { lastTime = undefined; });
    document.addEventListener('keydown', event => {
      if (event.code !== 'Space' || event.repeat || event.target.closest('button, input, select, textarea, a, [contenteditable]')) return;
      event.preventDefault(); setPlaying(!playing);
    });
    requestAnimationFrame(draw);
  } catch (error) {
    text('battle-load-status', `読み込みに失敗しました。${error.message}`);
    text('battle-state', '読み込みエラー');
  }
})();
