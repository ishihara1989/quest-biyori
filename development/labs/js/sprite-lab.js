'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const canvas = $('#sprite'), stage = $('#stage');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const motions = { idle: '待機', forward: '前進', backward: '後退', jump: 'ジャンプ', hit: '被撃', down: 'ダウン',
    'attack-overhead': '大剣・振り下ろし', 'attack-far-to-near': '大剣・奥 → 手前', 'attack-near-to-far': '大剣・手前 → 奥',
    'attack-staff': '杖・通常攻撃', chant: '詠唱', 'cast-forward': '杖を前へ', 'cast-forward-hold': '前方・維持',
    'cast-up': '杖を振り上げる', 'cast-up-hold': '上方・維持',
    'attack-mace': 'メイス・通常攻撃', 'mace-raise': 'メイスを掲げる', 'mace-slam': 'メイスを叩きつける',
    'shield-raise': '盾を掲げる', 'shield-plant': '盾を突き立てる', 'shield-advance': '盾を構えて前進',
    seal: '印を結ぶ', 'attack-shuriken': '手裏剣・通常攻撃', 'throw-combo':'手裏剣・連続投擲', 'throw-tool':'道具を投げる', 'cast-release':'忍術・発動', 'air-throw':'空中投擲', 'lay-trap':'地面へ散布', 'low-dash':'低い抜け動作', 'attack-wand': '棒・通常攻撃',
    prayer: '祈り・左右に振る', 'prayer-release': '祈り終了・一回転' };
  const characterMotionLabel = (type) => character?.id === 'shaman' && type === 'cast-forward'
    ? '詠唱終了・杖を前へ' : motions[type];
  const state = { playing: !preference.matches, frame: 0, zoom: 2, direction: 'right', speed: 1, elapsed: 0, bridge: false, manual: false };
  let catalog, character, selected, idle, motion = 'idle', current, raf = null, lastTime = null, busy = true, version = 0;
  const promises = new Map(), models = new Map();
  const key = (id, type) => `${id}:${type}`;
  const supportsMotion = (item, type) => type === 'idle' || Object.hasOwn(item.motionIndex.motions, type);
  const setPressed = (selector, attribute, value) => $$(selector).forEach(button =>
    button.setAttribute('aria-pressed', String(button.getAttribute(attribute) === String(value))));
  const loadImage = url => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('スプライト画像を読み込めませんでした。')); image.src = url;
  });
  function loadModel(item, type) {
    const id = key(item.id, type);
    if (promises.has(id)) return promises.get(id);
    const promise = (async () => {
      const manifestPath = type === 'idle' ? 'manifest.json' : `motions/${item.motionIndex.motions[type]}`;
      const base = `assets/${item.id}/${manifestPath.slice(0, manifestPath.lastIndexOf('/') + 1)}`;
      const response = await fetch(`assets/${item.id}/${manifestPath}`);
      if (!response.ok) throw new Error(`${item.label}の${motions[type]}素材を読み込めませんでした。`);
      const manifest = await response.json(), sheet = await loadImage(`${base}${manifest.sheet}`);
      if (manifest.character !== item.id || sheet.naturalWidth !== manifest.width || sheet.naturalHeight !== manifest.height) {
        throw new Error(`${item.label}の画像とフレーム情報が一致しません。`);
      }
      const model = { manifest, sheet, base }; models.set(id, model); return model;
    })();
    promises.set(id, promise); promise.catch(() => promises.delete(id)); return promise;
  }
  function draw(target, frameIndex, model, offsets = true) {
    const ctx = target.getContext('2d'), data = model.manifest, frame = data.frames[frameIndex];
    const comparison = target.id === 'comparison-sprite';
    if (!comparison) {
      const width = Math.max(256, data.frameWidth, selected?.manifest.frameWidth || 0);
      const height = Math.max(224, data.frameHeight, selected?.manifest.frameHeight || 0);
      if (target.width !== width) target.width = width;
      if (target.height !== height) target.height = height;
    }
    const pivot = comparison ? data.pivot : { x: target.width / 2, y: target.height - 17 };
    // Tall raised equipment uses the asset's complete cell; retain the ground baseline.
    const offset = offsets ? frame.previewOffset || { x: 0, y: 0 } : { x: 0, y: 0 };
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, target.width, target.height); ctx.imageSmoothingEnabled = false;
    if (state.direction === 'left') ctx.setTransform(-1, 0, 0, 1, target.width, 0);
    ctx.drawImage(model.sheet, frame.x, frame.y, frame.width, frame.height,
      pivot.x - data.pivot.x + offset.x, pivot.y - data.pivot.y + offset.y, frame.width, frame.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    target.dataset.motion = data.motion; target.dataset.frame = frameIndex;
  }
  function getSample(model, baseIdle) {
    if (state.manual) return { motion, frame: state.frame, phase: 'manual', finished: false };
    const next = model.manifest.transitions?.to;
    if (!state.bridge && next && next !== 'idle' && state.elapsed >= model.manifest.durationMs) {
      const follow = models.get(key(model.manifest.character, next));
      if (follow) return MotionPlayback.sample(follow.manifest, baseIdle.manifest, state.elapsed - model.manifest.durationMs);
    }
    return MotionPlayback.sample(model.manifest, baseIdle.manifest, state.elapsed, state.bridge);
  }
  function renderParty() {
    if (!character) return;
    for (const item of catalog) {
      const supported = supportsMotion(item, motion);
      const baseIdle = models.get(key(item.id, 'idle')), model = models.get(key(item.id, motion));
      const status = $(`.party-status[data-character="${item.id}"]`);
      if (!baseIdle || (supported && !model)) { status.textContent = '準備中'; continue; }
      if (!supported) {
        const frame = MotionPlayback.sample(baseIdle.manifest, baseIdle.manifest, state.elapsed).frame;
        draw($(`.party-canvas[data-character="${item.id}"]`), frame, baseIdle);
        status.textContent = '個別モーションなし・待機'; continue;
      }
      const sample = getSample(model, baseIdle), active = models.get(key(item.id, sample.motion)) || model;
      draw($(`.party-canvas[data-character="${item.id}"]`), sample.frame % active.manifest.frameCount, active);
      status.textContent = `${motions[sample.motion]} ${sample.frame + 1}/${active.manifest.frameCount}`;
    }
  }
  function renderFrame() {
    current = getSample(selected, idle);
    const active = models.get(key(character.id, current.motion)) || selected;
    draw(canvas, current.frame, active);
    $('#current-frame').textContent = String(current.frame + 1).padStart(2, '0');
    $('#total-frames').textContent = String(active.manifest.frameCount).padStart(2, '0');
    setPressed('button[data-frame]', 'data-frame', current.motion === motion ? current.frame : -1);
    $('#stage-motion').textContent = `${current.motion.toUpperCase()} / SIDE VIEW`;
    const phases = { before: '待機 → モーション', after: 'モーション → 待機', returned: '待機へ復帰', hold: 'ダウン完了・静止' };
    $('#sequence-status').textContent = phases[current.phase] || `${motions[current.motion]} ${active.manifest.frames[current.frame].phase || ''}`;
    canvas.setAttribute('aria-label', `${state.direction === 'right' ? '右向き' : '左向き'}の${character.label}・${motions[current.motion]} ${current.frame + 1}コマ目`);
    renderParty();
    if (current.finished && state.playing) setPlaying(false);
  }
  function renderAll() {
    renderFrame();
    $$('button[data-frame]').forEach(button => draw(button.querySelector('canvas'), Number(button.dataset.frame), selected));
    draw($('#comparison-sprite'), 0, idle, false);
  }
  function tick(timestamp) {
    raf = null;
    if (!state.playing || busy || document.hidden) { lastTime = null; return; }
    if (lastTime !== null) state.elapsed += Math.min(timestamp - lastTime, 100) * state.speed;
    lastTime = timestamp; renderFrame();
    if (state.playing) raf = requestAnimationFrame(tick);
  }
  function setPlaying(playing) {
    if (playing && current?.finished) { state.elapsed = 0; state.manual = false; }
    state.playing = playing;
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null; lastTime = null;
    $('#play-label').textContent = playing ? '一時停止' : current?.finished ? 'もう一度' : '再生';
    $('#play-icon').textContent = playing ? 'Ⅱ' : '▶';
    $('#play-state').textContent = playing ? '● 再生中' : current?.finished ? '最終姿勢で静止' : '静止表示';
    $('#play-toggle').setAttribute('aria-label', playing ? 'アニメーションを一時停止' : 'アニメーションを再生');
    if (playing && !busy && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function selectFrame(index) {
    setPlaying(false); state.manual = true;
    state.frame = (index + selected.manifest.frameCount) % selected.manifest.frameCount;
    state.elapsed = MotionPlayback.elapsedForFrame(selected.manifest, state.frame, state.bridge);
    renderFrame();
  }
  function restart() {
    state.elapsed = 0; state.manual = false; current = null; renderFrame(); setPlaying(true);
  }
  function updateZoom() {
    const width = Math.max(256, selected.manifest.frameWidth), height = Math.max(224, selected.manifest.frameHeight);
    stage.style.setProperty('--sprite-size', `${width * state.zoom}px`);
    stage.style.setProperty('--sprite-height', `${height * state.zoom}px`);
    stage.style.setProperty('--ground-offset', `${54 + 17 * state.zoom}px`);
    stage.style.height = `${Math.max(innerWidth < 481 ? 440 : 462, height * state.zoom + 90)}px`;
    $('#stage-scale').textContent = `${width} × ${height} px / ${state.zoom}×`;
    setPressed('[data-zoom]', 'data-zoom', state.zoom);
  }
  function updateSpeed() {
    state.speed = Number($('#speed').value);
    $('#speed-value').textContent = `${state.speed.toFixed(2)}×`;
    $('#cycle-duration').textContent = `${(selected.manifest.durationMs / state.speed / 1000).toFixed(2)} 秒`;
  }
  function wireControls() {
    $('#play-toggle').addEventListener('click', () => { state.manual = false; setPlaying(!state.playing); });
    $('#restart').addEventListener('click', restart);
    $('#previous-frame').addEventListener('click', () => selectFrame((current?.motion === motion ? current.frame : 0) - 1));
    $('#next-frame').addEventListener('click', () => selectFrame((current?.motion === motion ? current.frame : -1) + 1));
    $$('[data-zoom]').forEach(button => button.addEventListener('click', () => { state.zoom = Number(button.dataset.zoom); updateZoom(); }));
    $$('[data-direction]').forEach(button => button.addEventListener('click', () => {
      state.direction = button.dataset.direction; setPressed('[data-direction]', 'data-direction', state.direction); renderAll();
    }));
    $$('button[data-background]').forEach(button => button.addEventListener('click', () => {
      stage.dataset.background = button.dataset.background; setPressed('button[data-background]', 'data-background', button.dataset.background);
    }));
    $('#speed').addEventListener('input', updateSpeed);
    $('#show-ground').addEventListener('change', () => stage.classList.toggle('show-ground', $('#show-ground').checked));
    $('#bridge-idle').addEventListener('change', () => {
      state.bridge = $('#bridge-idle').checked; state.elapsed = 0; state.manual = false;
      renderFrame(); setPlaying(state.playing);
    });
    document.addEventListener('keydown', event => {
      if (busy || !selected || event.target.closest('input, select, textarea, button, a') || event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.code === 'Space') { event.preventDefault(); state.manual = false; setPlaying(!state.playing); }
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        event.preventDefault(); selectFrame((current.motion === motion ? current.frame : 0) + (event.code === 'ArrowLeft' ? -1 : 1));
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (raf !== null) cancelAnimationFrame(raf); raf = null; lastTime = null;
      if (!document.hidden && state.playing && !busy) raf = requestAnimationFrame(tick);
    });
    preference.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  }
  function createFilmstrip() {
    const data = selected.manifest, strip = $('#filmstrip'); strip.replaceChildren();
    strip.style.setProperty('--frame-count', Math.min(4, data.frameCount));
    const idlePhases = ['呼気', '吸気', '呼吸の折り返し', '呼気へ'];
    data.frames.forEach((frame, index) => {
      const button = document.createElement('button'); button.className = 'frame-card'; button.type = 'button'; button.dataset.frame = index;
      button.setAttribute('aria-label', `${index + 1}コマ目を表示`); button.setAttribute('aria-pressed', 'false');
      const top = document.createElement('span'); top.className = 'frame-card-top';
      const number = document.createElement('b'); number.textContent = String(index + 1).padStart(2, '0');
      const duration = document.createElement('span'); duration.textContent = `${frame.durationMs} ms`; top.append(number, duration);
      const preview = document.createElement('canvas'); preview.width = 256; preview.height = 224; preview.setAttribute('aria-hidden', 'true');
      const bottom = document.createElement('span'); bottom.className = 'frame-card-bottom'; bottom.textContent = frame.phase || idlePhases[index];
      button.append(top, preview, bottom); button.addEventListener('click', () => selectFrame(index)); strip.append(button);
    });
    $('#filmstrip-title').textContent = `${data.frameCount}コマ${motion === 'idle' || data.loop ? 'のループ' : data.terminal ? '・最後で静止' : '・再生後に' + (motions[data.transitions?.to] || '待機') + 'へ'}`;
  }
  function createMotionSelectors() {
    const tabs = $('.motion-tabs'); tabs.replaceChildren();
    for (const type of ['idle', ...Object.keys(character.motionIndex.motions)]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.motion = type;
      button.setAttribute('aria-pressed', String(type === motion)); button.textContent = characterMotionLabel(type) || type;
      const detail = document.createElement('small');
      const metadata = models.get(key(character.id, type))?.manifest;
      detail.textContent = metadata ? `${metadata.frameCount} FRAMES${type === 'idle' || metadata.loop ? ' / LOOP' : metadata.terminal ? ' / HOLD' : type.startsWith('attack-') ? ' / ATTACK' : ''}` : '…';
      button.append(detail); button.addEventListener('click', () => loadSelection(character.id, type)); tabs.append(button);
    }
  }
  function updateLabels() {
    const data = selected.manifest;
    $('#character-title').textContent = `${character.label}の${characterMotionLabel(motion)}モーション`;
    $('#character-eyebrow').textContent = `CHARACTERS / ${character.name.toUpperCase()}`;
    $('#stage-character').textContent = character.name.toUpperCase();
    $('#asset-title').textContent = `${character.name} / ${motion[0].toUpperCase() + motion.slice(1)}`;
    $('#spec-frames').textContent = `${data.frameCount} コマ`;
    $('#spec-size').textContent = `${data.frameWidth} × ${data.frameHeight} px`;
    $('#spec-loop').textContent = data.terminal ? '最終コマで静止' : motion === 'idle' || data.loop ? 'ループ' : (motions[data.transitions?.to] || '待機') + 'へ';
    $('#design-summary').textContent = character.summary;
    $('#reference-label').textContent = `既存の${character.label}イラストを参照`;
    $('#reference-image').src = `/development/assets/${character.reference}`; $('#reference-image').alt = `${character.label}の元デザイン`;
    $('#comparison-sprite').setAttribute('aria-label', `ドット絵にした${character.label}の待機1コマ目`);
    for (const [selector, file, name] of [
      ['#download-sheet', data.sheet, data.sheet],
      ['#download-gif', `${character.id}-${motion}-preview.gif`, `${character.id}-${motion}-preview.gif`],
      ['#download-manifest', 'manifest.json', `${character.id}-${motion}.json`],
    ]) { const link = $(selector); link.href = `${selected.base}${file}`; link.download = name; }
    $('#generation-prompt').href = `${selected.base}PROMPT.md`;
    setPressed('[data-select-character]', 'data-select-character', character.id);
    setPressed('button[data-motion]', 'data-motion', motion);
    $$('#party-lineup li').forEach(item => item.classList.toggle('current', item.dataset.character === character.id));
    $('#roster-motion').textContent = motion.startsWith('attack-') ? `${character.label}の個別攻撃を確認。ほかのキャラは待機を表示。`
      : `${motions[motion]}を全員同じ時刻・接地位置で比較。キャラを選ぶと詳細を表示。`;
    document.title = `Idle RPG — ${character.label}の${motions[motion]}検証`;
  }
  function disableControls(disabled) {
    $('#settings').disabled = disabled;
    $('#bridge-idle').disabled = disabled;
    $$('.transport button, .frame-card, button[data-motion]').forEach(button => { button.disabled = disabled; });
  }
  function showError(error) {
    $('#load-status').hidden = false; $('#load-status').textContent = error.message;
    $('#load-status').classList.add('error'); $('#load-status').setAttribute('role', 'alert');
    $('#play-state').textContent = '読み込み失敗'; console.error(error);
  }
  async function loadSelection(id, type = motion) {
    const item = catalog.find(entry => entry.id === id);
    if (!item || !motions[type]) return;
    if (!supportsMotion(item, type)) type = 'idle';
    const request = ++version; busy = true; disableControls(true);
    if (raf !== null) cancelAnimationFrame(raf); raf = null; lastTime = null;
    $('#play-state').textContent = '読み込み中'; $('#load-status').hidden = false;
    $('#load-status').textContent = `${item.label}の${motions[type]}を読み込んでいます…`;
    $('#load-status').classList.remove('error'); $('#load-status').setAttribute('role', 'status'); canvas.style.visibility = 'hidden';
    try {
      const [model, baseIdle] = await Promise.all([loadModel(item, type), loadModel(item, 'idle'),
        ...Object.keys(item.motionIndex.motions).map(id => loadModel(item, id))]);
      if (model.manifest.transitions?.to && model.manifest.transitions.to !== 'idle') await loadModel(item, model.manifest.transitions.to);
      if (request !== version) return;
      character = item; motion = type; selected = model; idle = baseIdle;
      state.frame = 0; state.elapsed = 0; state.manual = false; current = null;
      createMotionSelectors(); updateLabels(); createFilmstrip(); updateZoom(); renderAll(); updateSpeed();
      canvas.style.visibility = 'visible'; $('#load-status').hidden = true;
      busy = false; disableControls(false); setPlaying(state.playing);
      history.replaceState(null, '', `#${id}${type === 'idle' ? '' : `/${type}`}`);
      await Promise.allSettled(catalog.map(async entry => {
        await Promise.all([...(supportsMotion(entry, type) ? [loadModel(entry, type)] : []), loadModel(entry, 'idle')]);
        if (request === version) renderParty();
      }));
    } catch (error) {
      if (request !== version) return;
      busy = false; disableControls(false); showError(error);
    }
  }
  function createCharacterSelectors() {
    catalog.forEach((item, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'character-tab';
      button.dataset.selectCharacter = item.id; button.setAttribute('aria-label', `${item.label}を選択`);
      const image = document.createElement('img'); image.src = `assets/${item.id}/idle-01.png`; image.alt = ''; image.width = 160; image.height = 160;
      const label = document.createElement('span'); label.textContent = item.label;
      const name = document.createElement('small'); name.textContent = item.name.toUpperCase(); label.append(name); button.append(image, label);
      button.addEventListener('click', () => loadSelection(item.id)); $('#character-tabs').append(button);
      const row = document.createElement('li'); row.dataset.character = item.id;
      const party = document.createElement('button'); party.type = 'button'; party.className = 'party-card'; party.dataset.selectCharacter = item.id;
      party.setAttribute('aria-label', `${item.label}の詳細を表示`);
      const preview = document.createElement('canvas'); preview.width = 256; preview.height = 224; preview.className = 'party-canvas'; preview.dataset.character = item.id;
      preview.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span'); text.className = 'party-card-label';
      const number = document.createElement('span'); number.className = 'roster-number'; number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('span'); title.textContent = item.label;
      const english = document.createElement('small'); english.textContent = item.name.toUpperCase(); title.append(english);
      const status = document.createElement('span'); status.className = 'party-status'; status.dataset.character = item.id; status.textContent = '読み込み中';
      text.append(number, title, status); party.append(preview, text); row.append(party); $('#party-lineup').append(row);
      party.addEventListener('click', async () => {
        await loadSelection(item.id); $('#page-title').scrollIntoView({ behavior: preference.matches ? 'instant' : 'smooth', block: 'start' });
      });
    });
  }
  async function loadHash() {
    const [id, type = 'idle'] = location.hash.slice(1).split('/');
    await loadSelection(catalog.some(item => item.id === id) ? id : 'warrior', motions[type] ? type : 'idle');
  }
  async function initialize() {
    try {
      const response = await fetch('/development/assets/characters.json'); if (!response.ok) throw new Error('キャラクター一覧を読み込めませんでした。');
      catalog = await response.json();
      await Promise.all(catalog.map(async item => {
        const index = await fetch(`assets/${item.id}/motions/index.json`);
        if (!index.ok) throw new Error(`${item.label}のモーション一覧を読み込めませんでした。`);
        item.motionIndex = await index.json();
      }));
      createCharacterSelectors(); wireControls(); await loadHash();
      window.addEventListener('hashchange', loadHash);
    } catch (error) { showError(error); }
  }
  initialize();
})();

