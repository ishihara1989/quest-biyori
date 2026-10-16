'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const canvas = $('#sprite'), stage = $('#stage');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let motions = {};
  const state = { playing: !preference.matches, frame: 0, zoom: 2, direction: 'left', speed: 1, elapsed: 0, bridge: false, manual: false };
  let catalog, character, selected, idle, motion = 'idle', current, raf = null, lastTime = null, busy = true, version = 0;
  const promises = new Map(), models = new Map(), projectileModels = new Map(), previewZoomInitialized = new Set();
  const effectModels = new Map(); let targetModel;
  const key = (id, type) => `${id}:${type}`;
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
      const definition = item.motions.find(entry => entry.id === type);
      if (!definition) throw new Error(`${item.label}にこのモーションは未定義です。`);
      const url = new URL(definition.manifest, new URL(item.motionIndex, new URL(item.base, document.baseURI)));
      const base = new URL('./', url).href;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${item.label}の${definition.label}素材を読み込めませんでした。`);
      const manifest = await response.json(), sheet = await loadImage(`${base}${manifest.sheet}`);
      if (manifest.enemy !== item.id || sheet.naturalWidth !== manifest.width || sheet.naturalHeight !== manifest.height) {
        throw new Error(`${item.label}の画像とフレーム情報が一致しません。`);
      }
      const model = { manifest, sheet, base, manifestUrl: url.href }; models.set(id, model); return model;
    })();
    promises.set(id, promise); promise.catch(() => promises.delete(id)); return promise;
  }
  async function loadProjectile(model) {
    const url = new URL(model.manifest.projectilePreview.manifest, model.base).href;
    if (!projectileModels.has(url)) {
      const promise = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('種の弾群を読み込めませんでした。');
        const manifest = await response.json();
        const sheet = await loadImage(new URL(manifest.sheet, url).href);
        if (sheet.naturalWidth !== manifest.width || sheet.naturalHeight !== manifest.height) {
          throw new Error('種の画像とフレーム情報が一致しません。');
        }
        return { manifest, sheet };
      })();
      projectileModels.set(url, promise);
      promise.catch(() => projectileModels.delete(url));
    }
    model.projectile = await projectileModels.get(url);
  }
  function previewViewport(item = character) {
    return EnemyProjectiles.viewport(item.viewport, selected?.manifest.projectilePreview || selected?.manifest.effectPreview);
  }
  async function loadEffects(model) {
    model.effects = {};
    for (const asset of model.manifest.effectPreview.assets) {
      const url = new URL(asset.manifest, model.base).href;
      if (!effectModels.has(url)) effectModels.set(url, (async () => {
        const response = await fetch(url); if (!response.ok) throw new Error('攻撃エフェクトを読み込めませんでした。');
        const manifest = await response.json(), sheet = await loadImage(new URL(manifest.sheet, url).href);
        return { manifest, sheet };
      })());
      try { model.effects[asset.id] = await effectModels.get(url); }
      catch(error) { effectModels.delete(url); throw error; }
    }
    if (!targetModel) {
      const response = await fetch('assets/warrior/manifest.json');
      if (!response.ok) throw new Error('対象キャラクターを読み込めませんでした。');
      const manifest = await response.json(), sheet = await loadImage('assets/warrior/' + manifest.sheet);
      targetModel = { manifest, sheet };
    }
  }
  function renderEffects() {
    canvas.dataset.effects = '0'; canvas.dataset.rooted = 'false';
    if (!$('#preview-effects').checked || !selected.manifest.effectPreview || !targetModel) return;
    const data = selected.manifest, view = previewViewport();
    const elapsed = state.manual ? MotionPlayback.elapsedForFrame(data, state.frame, state.bridge) : state.elapsed;
    const target = EnemyEffects.targetAt(data, elapsed, state.bridge);
    const ctx = canvas.getContext('2d'); ctx.save();
    if (state.direction !== data.facing) ctx.setTransform(-1,0,0,1,canvas.width,0);
    const sprite = (model, age, x, y, scale=1) => {
      const m=model.manifest, frame=m.frames[MotionPlayback.frameAt(m,m.loop?age%m.durationMs:Math.min(age,m.durationMs-1))];
      ctx.drawImage(model.sheet,frame.x,frame.y,frame.width,frame.height,x-m.pivot.x*scale,y-m.pivot.y*scale,frame.width*scale,frame.height*scale);
    };
    sprite(targetModel,elapsed,target.x,target.y,.7);
    const visible=EnemyEffects.activeAt(data,elapsed,state.bridge);
    const origin={x:view.pivot.x-data.pivot.x+data.effectPreview.origin.x,y:data.effectPreview.origin.y};
    for(const item of visible) {
      const model=selected.effects[item.effect]; if(!model)continue;
      const shotOrigin={x:origin.x+(item.event.originOffset?.x||0),y:origin.y+(item.event.originOffset?.y||0)};
      const aim=item.event.fixedTarget?data.effectPreview.target:target;
      const shotTarget={x:aim.x+(item.event.targetOffset?.x||0),y:aim.y+(item.event.targetOffset?.y||0)};
      if(item.event.type==='spawn-projectile') {
        const t=Math.min(1,item.ageMs/650);
        sprite(model,item.ageMs,shotOrigin.x+(shotTarget.x-shotOrigin.x)*t,shotOrigin.y+(shotTarget.y-65-shotOrigin.y)*t,.65);
      } else if(item.event.placement==='origin') {
        const scale=model.manifest.kind==='beam'?Math.max(.5,(shotOrigin.x-shotTarget.x)/(model.manifest.frameWidth-32)):.85;
        sprite(model,item.ageMs,shotOrigin.x,shotOrigin.y,scale);
      } else if(item.effect==='hydra-poison-aura') sprite(model,item.ageMs,origin.x,origin.y,.8);
      else if(item.effect==='hydra-poison-breath') sprite(model,item.ageMs,origin.x,origin.y,.7);
      else if(['bat-sonic','water-breath'].includes(item.effect)) sprite(model,item.ageMs,origin.x,origin.y,.85);
      else if(item.effect==='vampire-drain') sprite(model,item.ageMs,(origin.x+target.x)/2,origin.y,.7);
      else sprite(model,item.ageMs,shotTarget.x,shotTarget.y-(model.manifest.kind==='arc'?84:0),item.effect==='mud-bind'?.7:.85);
    }
    ctx.restore(); canvas.dataset.effects=String(visible.length);canvas.dataset.rooted=String(target.rooted);
  }
  function draw(target, frameIndex, model, item = character) {
    const ctx = target.getContext('2d'), data = model.manifest, frame = data.frames[frameIndex];
    const view = target === canvas ? previewViewport(item) : item.viewport;
    if (target.width !== view.width) target.width = view.width;
    if (target.height !== view.height) target.height = view.height;
    const pivot = view.pivot, offset = frame.previewOffset || { x: 0, y: 0 };
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, target.width, target.height); ctx.imageSmoothingEnabled = false;
    if (state.direction !== (data.facing || 'left')) ctx.setTransform(-1, 0, 0, 1, target.width, 0);
    ctx.drawImage(model.sheet, frame.x, frame.y, frame.width, frame.height,
      pivot.x - data.pivot.x + offset.x, pivot.y - data.pivot.y + offset.y, frame.width, frame.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    target.dataset.motion = data.motion; target.dataset.frame = frameIndex;
  }
  function getSample(model, baseIdle) {
    if (state.manual) return { motion, frame: state.frame, phase: 'manual', finished: false };
    return MotionPlayback.sample(model.manifest, baseIdle.manifest, state.elapsed, state.bridge);
  }
  function renderParty() {
    if (!character) return;
    for (const item of catalog) {
      const baseIdle = models.get(key(item.id, 'idle')), available = item.motions.some(entry => entry.id === motion);
      const model = models.get(key(item.id, available ? motion : 'idle'));
      const status = $(`.party-status[data-character="${item.id}"]`);
      if (!baseIdle || !model) { status.textContent = '準備中'; continue; }
      const sample = getSample(model, baseIdle), active = sample.motion === 'idle' ? baseIdle : model;
      draw($(`.party-canvas[data-character="${item.id}"]`), sample.frame % active.manifest.frameCount, active, item);
      status.textContent = available ? `${active.manifest.label} ${sample.frame % active.manifest.frameCount + 1}/${active.manifest.frameCount}` : '未定義（待機）';
    }
  }
  function renderFrame() {
    current = getSample(selected, idle);
    const active = current.motion === 'idle' ? idle : selected;
    draw(canvas, current.frame, active);
    renderSummons();
    renderProjectiles();
    renderEffects();
    $('#current-frame').textContent = String(current.frame + 1).padStart(2, '0');
    $('#total-frames').textContent = String(active.manifest.frameCount).padStart(2, '0');
    setPressed('button[data-frame]', 'data-frame', current.motion === motion ? current.frame : -1);
    $('#stage-motion').textContent = `${current.motion.toUpperCase()} / SIDE VIEW`;
    const phases = { before: '待機 → モーション', after: 'モーション → 待機', returned: '待機へ復帰', hold: '撃破完了・静止' };
    $('#sequence-status').textContent = phases[current.phase] || `${motions[current.motion]} ${active.manifest.frames[current.frame].phase || ''}`;
    canvas.setAttribute('aria-label', `${state.direction === 'right' ? '右向き' : '左向き'}の${character.label}・${motions[current.motion]} ${current.frame + 1}コマ目`);
    renderParty();
    if (current.finished && state.playing) setPlaying(false);
  }
  function renderSummons() {
    if (state.manual || !$('#preview-summons').checked || !selected.manifest.summonPreview) return;
    const ctx = canvas.getContext('2d');
    ctx.save();
    if (state.direction !== 'left') ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
    for (const summon of EnemySummons.visibleAt(selected.manifest, state.elapsed, state.bridge)) {
      const model = models.get(key(summon.enemy, 'move'));
      if (!model) continue;
      const data = model.manifest;
      const frame = data.frames[MotionPlayback.frameAt(data, summon.ageMs % data.durationMs)];
      ctx.drawImage(model.sheet, frame.x, frame.y, frame.width, frame.height,
        character.viewport.pivot.x + summon.x - data.pivot.x,
        character.viewport.pivot.y + summon.y - data.pivot.y, frame.width, frame.height);
    }
    ctx.restore();
  }
  function renderProjectiles() {
    canvas.dataset.projectiles = '0';
    if (!$('#preview-projectiles').checked || !selected.projectile || !selected.manifest.projectilePreview) return;
    const entities = EnemyProjectiles.visibleAt(selected.manifest, state.elapsed, state.bridge);
    const ctx = canvas.getContext('2d'), effect = selected.projectile;
    ctx.save();
    if (state.direction !== (selected.manifest.facing || 'left')) ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
    for (const entity of entities) for (const strip of EnemyProjectiles.stripsAt(entity, selected.manifest, effect.manifest, previewViewport())) {
      ctx.save(); ctx.beginPath(); ctx.rect(strip.clip.x, strip.clip.y, strip.clip.width, strip.clip.height); ctx.clip();
      const s = strip.source, d = strip.destination;
      ctx.drawImage(effect.sheet, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
      ctx.restore();
    }
    ctx.restore();
    canvas.dataset.projectiles = String(entities.length);
  }
  function renderAll() {
    renderFrame();
    $$('button[data-frame]').forEach(button => draw(button.querySelector('canvas'), Number(button.dataset.frame), selected));
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
    const view = previewViewport();
    stage.style.setProperty('--sprite-size', `${view.width * state.zoom}px`);
    stage.style.setProperty('--sprite-height', `${view.height * state.zoom}px`);
    stage.style.setProperty('--ground-offset', `${54 + (view.height - view.pivot.y) * state.zoom}px`);
    stage.style.height = `${Math.max(innerWidth < 481 ? 440 : 462, view.height * state.zoom + 90)}px`;
    $('#stage-scale').textContent = `${view.width} × ${view.height} px / ${state.zoom}×`;
    setPressed('[data-zoom]', 'data-zoom', state.zoom);
    stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
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
    $('#preview-summons').addEventListener('change', renderFrame);
    $('#preview-projectiles').addEventListener('change', renderFrame);
    $('#preview-effects').addEventListener('change', renderFrame);
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
    window.addEventListener('resize', () => { if (character) updateZoom(); });
  }
  function createFilmstrip() {
    const data = selected.manifest, strip = $('#filmstrip'); strip.replaceChildren();
    strip.style.setProperty('--frame-count', data.frameCount);
    data.frames.forEach((frame, index) => {
      const button = document.createElement('button'); button.className = 'frame-card'; button.type = 'button'; button.dataset.frame = index;
      button.setAttribute('aria-label', `${index + 1}コマ目を表示`); button.setAttribute('aria-pressed', 'false');
      const top = document.createElement('span'); top.className = 'frame-card-top';
      const number = document.createElement('b'); number.textContent = String(index + 1).padStart(2, '0');
      const duration = document.createElement('span'); duration.textContent = `${frame.durationMs} ms`; top.append(number, duration);
      const preview = document.createElement('canvas'); preview.width = character.viewport.width; preview.height = character.viewport.height; preview.setAttribute('aria-hidden', 'true');
      const bottom = document.createElement('span'); bottom.className = 'frame-card-bottom'; bottom.textContent = frame.phase || `${index + 1}コマ目`;
      button.append(top, preview, bottom); button.addEventListener('click', () => selectFrame(index)); strip.append(button);
    });
    $('#filmstrip-title').textContent = `${data.frameCount}コマ${motion === 'idle' || data.loop ? 'のループ' : data.terminal ? '・最後で静止' : '・再生後に待機へ'}`;
  }
  function updateLabels() {
    const data = selected.manifest;
    $('#character-title').textContent = `${character.label}の${motions[motion]}モーション`;
    $('#character-eyebrow').textContent = `ENEMIES / ${character.name.toUpperCase()}`;
    $('#stage-character').textContent = character.name.toUpperCase();
    $('#asset-title').textContent = `${character.name} / ${motion[0].toUpperCase() + motion.slice(1)}`;
    $('#spec-frames').textContent = `${data.frameCount} コマ`;
    $('#spec-size').textContent = `${data.frameWidth} × ${data.frameHeight} px`;
    $('#spec-loop').textContent = data.terminal ? '最終コマで静止' : motion === 'idle' || data.loop ? 'ループ' : '待機へ復帰';
    $('#design-summary').textContent = character.summary + ' ループ動作は繰り返し、単発動作は待機へ戻ります。撃破は最後で静止。「待機を挟んで再生」で接続を確認できます。';
    $('#summon-preview-control').hidden = !data.summonPreview;
    $('#projectile-preview-control').hidden = !data.projectilePreview;
    $('#effects-preview-control').hidden = !data.effectPreview;
    for (const [selector, file, name] of [
      ['#download-sheet', data.sheet, data.sheet],
      ['#download-gif', data.preview, data.preview],
      ['#download-manifest', 'manifest.json', `${character.id}-${motion}.json`],
    ]) { const link = $(selector); link.href = `${selected.base}${file}`; link.download = name; }
    $('#download-manifest').href = selected.manifestUrl;
    $('#generation-prompt').href = new URL(data.prompt, selected.base).href;
    setPressed('[data-select-character]', 'data-select-character', character.id);
    setPressed('button[data-motion]', 'data-motion', motion);
    $$('#party-lineup li').forEach(item => item.classList.toggle('current', item.dataset.character === character.id));
    $('#roster-motion').textContent = `${motions[motion]}を同じ時刻で確認。敵を選ぶと詳細を表示。未定義のモーションは待機表示。`;
    document.title = `Idle RPG — ${character.label}の${motions[motion]}検証`;
  }
  function disableControls(disabled) {
    $('#settings').disabled = disabled;
    $('#bridge-idle').disabled = disabled;
    $('#preview-summons').disabled = disabled;
    $('#preview-projectiles').disabled = disabled;
    $('#preview-effects').disabled = disabled;
    $$('.transport button, .frame-card, button[data-motion]').forEach(button => { button.disabled = disabled; });
  }
  function showError(error) {
    $('#load-status').hidden = false; $('#load-status').textContent = error.message;
    $('#load-status').classList.add('error'); $('#load-status').setAttribute('role', 'alert');
    $('#play-state').textContent = '読み込み失敗'; console.error(error);
  }
  async function loadSelection(id, type = motion) {
    const item = catalog.find(entry => entry.id === id);
    if (!item) return;
    if (!item.motions.some(entry => entry.id === type)) type = 'idle';
    const request = ++version; busy = true; disableControls(true);
    if (raf !== null) cancelAnimationFrame(raf); raf = null; lastTime = null;
    $('#play-state').textContent = '読み込み中'; $('#load-status').hidden = false;
    $('#load-status').textContent = `${item.label}の${item.motions.find(def => def.id === type).label}を読み込んでいます…`;
    $('#load-status').classList.remove('error'); $('#load-status').setAttribute('role', 'status'); canvas.style.visibility = 'hidden';
    try {
      const [model, baseIdle] = await Promise.all([loadModel(item, type), loadModel(item, 'idle')]);
      if (model.manifest.summonPreview) {
        const summoned = catalog.find(entry => entry.id === model.manifest.summonPreview.enemy);
        await loadModel(summoned, 'move');
      }
      if (model.manifest.projectilePreview) await loadProjectile(model);
      if (model.manifest.effectPreview) await loadEffects(model);
      if (request !== version) return;
      character = item; motion = type; selected = model; idle = baseIdle;
      const previewKey = key(id, type);
      const defaultZoom=model.manifest.effectPreview?.defaultZoom || model.manifest.projectilePreview?.defaultZoom || model.manifest.defaultZoom;
      if (defaultZoom && !previewZoomInitialized.has(previewKey)) {
        state.zoom = defaultZoom;
        previewZoomInitialized.add(previewKey);
      }
      motions = Object.fromEntries(item.motions.map(entry => [entry.id, entry.label]));
      createMotionSelectors();
      state.frame = 0; state.elapsed = 0; state.manual = false; current = null;
      updateLabels(); createFilmstrip(); updateZoom(); renderAll(); updateSpeed();
      canvas.style.visibility = 'visible'; $('#load-status').hidden = true;
      busy = false; disableControls(false); setPlaying(state.playing);
      history.replaceState(null, '', `#${id}${type === 'idle' ? '' : `/${type}`}`);
      await Promise.allSettled(catalog.map(async entry => {
        await Promise.all([loadModel(entry, entry.motions.some(def => def.id === type) ? type : 'idle'), loadModel(entry, 'idle')]);
        if (request === version) renderParty();
      }));
    } catch (error) {
      if (request !== version) return;
      busy = false; disableControls(false); showError(error);
    }
  }
  function createMotionSelectors() {
    const tabs = $('#motion-tabs'); tabs.replaceChildren();
    character.motions.forEach(def => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.motion = def.id;
      button.textContent = def.label; button.setAttribute('aria-pressed', String(def.id === motion));
      const detail = document.createElement('small'); detail.textContent = def.id.toUpperCase(); button.append(detail);
      button.addEventListener('click', () => loadSelection(character.id, def.id)); tabs.append(button);
    });
  }
  function createCharacterSelectors() {
    catalog.forEach((item, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'character-tab';
      button.dataset.selectCharacter = item.id; button.setAttribute('aria-label', `${item.label}を選択`);
      const image = document.createElement('img'); image.src = `${item.base}${item.thumbnail}`; image.alt = ''; image.width = 160; image.height = 160;
      const label = document.createElement('span'); label.textContent = item.label;
      const name = document.createElement('small'); name.textContent = item.name.toUpperCase(); label.append(name); button.append(image, label);
      button.addEventListener('click', () => loadSelection(item.id)); $('#character-tabs').append(button);
      const row = document.createElement('li'); row.dataset.character = item.id;
      const party = document.createElement('button'); party.type = 'button'; party.className = 'party-card'; party.dataset.selectCharacter = item.id;
      party.setAttribute('aria-label', `${item.label}の詳細を表示`);
      const preview = document.createElement('canvas'); preview.width = item.viewport.width; preview.height = item.viewport.height; preview.className = 'party-canvas'; preview.dataset.character = item.id;
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
    await loadSelection(catalog.some(item => item.id === id) ? id : catalog[0].id, type);
  }
  async function initialize() {
    try {
      const response = await fetch('assets/enemies/index.json'); if (!response.ok) throw new Error('敵一覧を読み込めませんでした。');
      catalog = await response.json();
      if (!catalog.length) throw new Error('敵がまだ登録されていません。');
      await Promise.all(catalog.map(async item => {
        const response = await fetch(new URL(item.motionIndex, new URL(item.base, document.baseURI)));
        if (!response.ok) throw new Error(`${item.label}のモーション一覧を読み込めませんでした。`);
        item.motions = await response.json();
        if (!item.motions.some(def => def.id === 'idle')) throw new Error(`${item.label}の待機が未定義です。`);
      }));
      $('#enemy-count').textContent = `${String(catalog.length).padStart(2, '0')} ENEMY`;
      createCharacterSelectors(); wireControls(); await loadHash();
      window.addEventListener('hashchange', loadHash);
    } catch (error) { showError(error); }
  }
  initialize();
})();

