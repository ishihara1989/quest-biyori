const root = '/development/assets/reincarnation-goddess/basic-v1/';
const names = { idle: '待機', move: '浮遊移動', hit: '涙目の被弾', return: '涙目で怒って帰還' };
const state = { speed: 1, guides: false, playing: true, sequenceTime: 0, clips: [] };
const loadImage = src => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('画像を読み込めません: ' + src)); img.src = src; });
function selectFrame(clip, time) {
  let t = Math.max(0, time); if (clip.manifest.loop) t %= clip.manifest.durationMs;
  for (let i = 0; i < clip.manifest.frames.length; i++) { t -= clip.manifest.frames[i].durationMs; if (t < 0) return i; }
  return clip.images.length - 1;
}
function sprite(ctx, clip, frame, x = 0, y = 0, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false; ctx.drawImage(clip.images[frame], Math.round(x), Math.round(y)); ctx.restore();
}
function drawGuides(ctx) {
  if (!state.guides) return; ctx.save(); ctx.strokeStyle = '#78dce899'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(248, 0); ctx.lineTo(248, 512); ctx.moveTo(0, 257); ctx.lineTo(512, 257); ctx.stroke(); ctx.strokeStyle = '#efc57599'; ctx.strokeRect(246, 438, 20, 20); ctx.restore();
}
function clearCanvas(ctx, width, height) {
  const mode = document.body.dataset.background || 'dark';
  ctx.clearRect(0, 0, width, height);
  if (mode === 'checker') { for (let y = 0; y < height; y += 32) for (let x = 0; x < width; x += 32) { ctx.fillStyle = ((x / 32 + y / 32) % 2) ? '#c9cad1' : '#a4a5af'; ctx.fillRect(x, y, 32, 32); } }
  else { ctx.fillStyle = mode === 'light' ? '#e3dfd2' : '#25283e'; ctx.fillRect(0, 0, width, height); }
}
function renderCard(clip) {
  const ctx = clip.canvas.getContext('2d'); clearCanvas(ctx, 512, 512); let frame, elapsed;
  if (clip.manual !== null) { frame = clip.manual; elapsed = 0; }
  else { const tail = clip.id === 'return' ? 1100 : clip.id === 'hit' ? 700 : 0; elapsed = clip.time % (clip.manifest.durationMs + tail); frame = selectFrame(clip, elapsed); }
  if (clip.id === 'return' && clip.manual === null && elapsed > clip.manifest.durationMs) { const p = Math.min(1, (elapsed - clip.manifest.durationMs) / 650); sprite(ctx, clip, frame, p * 600, -p * 220, 1 - p); }
  else sprite(ctx, clip, frame);
  drawGuides(ctx); clip.slider.value = String(frame); clip.output.value = (frame + 1) + ' / ' + clip.images.length;
}
function sequence() {
  const ctx = document.querySelector('#sequence').getContext('2d'); clearCanvas(ctx, 1024, 512);
  const [idle, move, hit, leave] = state.clips; const t = state.sequenceTime % 5800; let clip, local, x = 360, y = 0, alpha = 1;
  if (t < 1400) { clip = idle; local = t; }
  else if (t < 2600) { clip = move; local = t - 1400; x = 360 - local / 1200 * 170; }
  else if (t < 3080) { clip = hit; local = t - 2600; x = 190; }
  else if (t < 4400) { clip = leave; local = t - 3080; x = 190; }
  else { clip = leave; local = leave.manifest.durationMs; const p = Math.min(1, (t - 4400) / 850); x = 190 + p * 650; y = -p * 180; alpha = 1 - p; }
  sprite(ctx, clip, selectFrame(clip, local), x, y, alpha); document.querySelector('#sequence-label').value = names[clip.id];
}
function card(clip) {
  const el = document.createElement('article'); el.className = 'clip'; el.dataset.motion = clip.id;
  el.innerHTML = '<div class="topline"><h2>' + names[clip.id] + '</h2><span class="tag">' + clip.images.length + ' FRAMES · ' + (clip.manifest.loop ? 'LOOP' : 'ONCE') + '</span></div><canvas width="512" height="512" aria-label="' + names[clip.id] + '"></canvas><div class="controls"><button class="pause" title="停止・再生" aria-label="' + names[clip.id] + 'を停止">Ⅱ</button><button class="restart" title="先頭から" aria-label="' + names[clip.id] + 'を先頭から">↺</button><input type="range" min="0" max="' + (clip.images.length - 1) + '" value="0" step="1" aria-label="' + names[clip.id] + 'のコマ"><output>1 / ' + clip.images.length + '</output></div>';
  clip.canvas = el.querySelector('canvas'); clip.slider = el.querySelector('input'); clip.output = el.querySelector('output'); clip.pauseButton = el.querySelector('.pause');
  function pauseIcon() { clip.pauseButton.textContent = clip.playing ? 'Ⅱ' : '▶'; clip.pauseButton.setAttribute('aria-label', names[clip.id] + (clip.playing ? 'を停止' : 'を再生')); }
  clip.pauseButton.addEventListener('click', () => { clip.playing = !clip.playing; clip.manual = null; pauseIcon(); renderCard(clip); });
  el.querySelector('.restart').addEventListener('click', () => { clip.time = 0; clip.manual = null; clip.playing = true; pauseIcon(); renderCard(clip); });
  clip.slider.addEventListener('input', () => { clip.manual = Number(clip.slider.value); clip.playing = false; pauseIcon(); renderCard(clip); });
  document.querySelector('#clips').append(el); const group = document.createElement('section'); group.className = 'frame-group'; const heading = document.createElement('h3'); heading.textContent = names[clip.id]; group.append(heading); const grid = document.createElement('div'); grid.className = 'frame-grid';
  clip.images.forEach((img, i) => { const b = document.createElement('button'); b.className = 'frame-button'; b.title = names[clip.id] + ' ' + (i + 1); const thumb = img.cloneNode(); thumb.alt = names[clip.id] + ' ' + (i + 1); const text = document.createElement('span'); text.textContent = (i + 1) + ' · ' + clip.manifest.frames[i].durationMs + ' ms'; b.append(thumb, text); b.addEventListener('click', () => { clip.manual = i; clip.playing = false; pauseIcon(); renderCard(clip); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }); grid.append(b); }); group.append(grid); document.querySelector('#frames').append(group);
}
async function start() {
  const response = await fetch(root + 'motions/index.json'); if (!response.ok) throw new Error('一覧を読み込めません'); const index = await response.json();
  for (const entry of index) {
    const url = root + 'motions/' + entry.manifest; const response = await fetch(url); if (!response.ok) throw new Error('モーションを読み込めません: ' + entry.id); const manifest = await response.json(); const dir = url.slice(0, url.lastIndexOf('/') + 1);
    const images = await Promise.all(manifest.frames.map(f => loadImage(dir + f.file))); const clip = { id: entry.id, manifest, images, time: 0, playing: true, manual: null }; state.clips.push(clip); card(clip);
  }
  document.querySelector('#status').textContent = '4種 · 全17コマ · 読み込み完了'; document.body.dataset.ready = 'true'; let previous;
  function tick(now) { const delta = previous === undefined ? 0 : Math.min(100, now - previous) * state.speed; previous = now; if (state.playing) { state.sequenceTime += delta; for (const clip of state.clips) if (clip.playing) clip.time += delta; } state.clips.forEach(renderCard); sequence(); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
}
document.querySelector('#speed').addEventListener('change', e => { state.speed = Number(e.target.value); });
document.querySelector('#background').addEventListener('change', e => { document.body.dataset.background = e.target.value; });
document.querySelector('#guides').addEventListener('change', e => { state.guides = e.target.checked; });
document.querySelector('#play-all').addEventListener('click', e => { state.playing = !state.playing; e.target.textContent = state.playing ? 'すべて停止' : 'すべて再生'; for (const clip of state.clips) { clip.playing = state.playing; if (state.playing) clip.manual = null; clip.pauseButton.textContent = state.playing ? 'Ⅱ' : '▶'; clip.pauseButton.setAttribute('aria-label', names[clip.id] + (state.playing ? 'を停止' : 'を再生')); } });
document.querySelector('#restart-sequence').addEventListener('click', () => { state.sequenceTime = 0; });
start().catch(error => { document.querySelector('#status').textContent = error.message; document.body.dataset.ready = 'error'; console.error(error); });
