'use strict';
(async function () {
  const $ = id => document.getElementById(id);
  const canvas = $('forest-canvas'), ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const STAGES={'starting-forest':{code:'STARTING FOREST',summary:'木々の奥行きと、広い土のバトルエリア。'},'poison-swamp':{code:'POISON SWAMP',summary:'毒霧の遠景と、広い泥のバトルエリア。'},'echo-cave':{code:'ECHO CAVERN',summary:'岩壁と結晶に囲まれた洞窟。'},'sunlit-coast':{code:'SUNLIT COAST',summary:'砂浜と青い海の遠景。'}};
  const requested=new URLSearchParams(location.search).get('stage');
  let stageId=Object.hasOwn(STAGES,requested)?requested:'starting-forest',base='assets/stages/'+stageId+'/';
  const state = { camera: 0, playing: false, speed: 40, x: 400, y: 430, dragging: false };
  let character, companions, layers, spec, selection = 0;
  const keys = new Set();
  async function json(url) {
    const result = await fetch(url);
    if (!result.ok) throw new Error(`${url}: HTTP ${result.status}`);
    return result.json();
  }
  function image(url) {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`画像を読み込めません: ${url}`)); img.src = url;
    });
  }
  async function sprite(directory, manifestFile) {
    const data = await json(directory + manifestFile);
    return { data, image: await image(directory + data.sheet) };
  }
  async function loadCharacter(id) {
    const directory = `assets/${id}/`;
    const [idle, forward, backward] = await Promise.all([
      sprite(directory, 'manifest.json'),
      sprite(directory + 'motions/forward/', 'manifest.json'),
      sprite(directory + 'motions/backward/', 'manifest.json')
    ]);
    return { idle, forward, backward };
  }
  function tileLayer(layer) {
    const offset = Math.round(state.camera * ($('forest-parallax').checked ? layer.parallax : 1));
    for (const tile of StageTiling.visibleTiles(offset, W, W, $('forest-mirror').checked)) {
      ctx.save(); ctx.translate(tile.x + (tile.mirror ? W : 0), 0);
      if (tile.mirror) ctx.scale(-1, 1);
      ctx.drawImage(layer.image, 0, 0, W, H); ctx.restore();
    }
  }
  function frameAt(data, time) {
    let elapsed = time % data.durationMs;
    for (const frame of data.frames) {
      if (elapsed < frame.durationMs) return frame;
      elapsed -= frame.durationMs;
    }
    return data.frames[0];
  }
  function drawSprite(asset, x, y, time) {
    x = Math.round(x); y = Math.round(y);
    const frame = frameAt(asset.data, time), pivot = asset.data.pivot;
    ctx.save(); ctx.fillStyle = '#1f1a1645'; ctx.beginPath();
    ctx.ellipse(x, y - 1, asset.data.enemy ? 29 : 25, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.drawImage(asset.image, frame.x, frame.y, frame.width, frame.height,
      x - pivot.x, y - pivot.y, frame.width, frame.height);
  }
  function coordinates() {
    $('forest-x').value = String(Math.round(state.x)); $('forest-y').value = String(Math.round(state.y));
    $('forest-x-value').value = String(Math.round(state.x)); $('forest-y-value').value = String(Math.round(state.y));
  }
  function clampPoint(x, y) {
    state.x = Math.max(100, Math.min(W - 100, x));
    state.y = Math.max(spec.coordinateSystem.groundY.min, Math.min(spec.coordinateSystem.groundY.max, y));
    coordinates();
  }
  function pointFromPointer(event) {
    const rect = canvas.getBoundingClientRect();
    clampPoint((event.clientX - rect.left) * W / rect.width, (event.clientY - rect.top) * H / rect.height);
  }
  function setPlaying(playing) {
    state.playing = playing;
    $('forest-play').textContent = playing ? 'スクロール停止' : 'スクロール開始';
    $('forest-state').textContent = playing ? 'スクロール中' : '静止表示';
  }
  function stageDetails(){
    const info=STAGES[stageId];$('stage-select').value=stageId;
    $('stage-name').textContent=spec.label;$('stage-eyebrow').textContent='BATTLE STAGE / '+info.code;
    $('stage-summary').textContent=info.summary;$('stage-footer').textContent=info.code;
    document.title=spec.label+' — Idle RPG Stage Lab';canvas.dataset.stage=stageId;
    canvas.setAttribute('aria-label',spec.label+'。地面をクリックするとキャラクターの接地点を移動できます');
    $('forest-y').min=spec.coordinateSystem.groundY.min;$('forest-y').max=spec.coordinateSystem.groundY.max;
    document.querySelectorAll('.forest-asset').forEach((card,index)=>{
      card.hidden=!spec.layers[index];if(card.hidden)return;
      const layer=spec.layers[index],img=card.querySelector('img'),copy=card.querySelector('.forest-asset-copy');
      img.src=base+layer.file;img.alt=spec.label+' / '+layer.label;img.width=layer.width;img.height=layer.height;
      copy.querySelector('h2').textContent=layer.label;copy.querySelector('a').href=base+layer.file;
      copy.querySelector('span').textContent=layer.width+' × '+layer.height+' px'+(layer.alpha?' / RGBA':'');
      copy.querySelector('p:not(.eyebrow)').textContent=layer.id==='ground-near'?'接地点Y323〜512。'+(layer.alpha?'上部は透過。':'岩壁と地面の1層。'):'スクロール速度 0.28×';
    });
    $('stage-manifest').href=base+'manifest.json';$('stage-prompt').href=base+'PROMPT.md';
  }
  async function changeStage(id){
    if(!Object.hasOwn(STAGES,id))return;
    setPlaying(false);$('forest-controls').disabled=true;$('stage-select').disabled=true;
    $('forest-status').textContent='背景を読み込んでいます…';
    try{
      const nextBase='assets/stages/'+id+'/',next=await json(nextBase+'manifest.json');
      const images=await Promise.all(next.layers.map(async layer=>({...layer,image:await image(nextBase+layer.file)})));
      stageId=id;base=nextBase;spec=next;layers=images;state.camera=0;
      stageDetails();clampPoint(state.x,state.y);$('forest-status').textContent='';
      const url=new URL(location.href);url.searchParams.set('stage',stageId);history.replaceState(null,'',url);
    }catch(error){$('stage-select').value=stageId;$('forest-status').textContent=error.message;}
    finally{$('forest-controls').disabled=false;$('stage-select').disabled=false;}
  }
  let lastTime;
  function draw(time) {
    const dt = lastTime === undefined ? 0 : Math.min((time - lastTime) / 1000, 0.05); lastTime = time;
    if (state.playing) state.camera += state.speed * dt;
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft')) dx--; if (keys.has('ArrowRight')) dx++;
    if (keys.has('ArrowUp')) dy--; if (keys.has('ArrowDown')) dy++;
    if (dx || dy) clampPoint(state.x + dx * 160 * dt, state.y + dy * 120 * dt);
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, W, H);
    layers.forEach(tileLayer);
    if ($('forest-grid').checked) {
      const { min, max } = spec.coordinateSystem.groundY;
      ctx.save(); ctx.fillStyle = '#aaf5ca16'; ctx.fillRect(0, min, W, max - min);
      ctx.strokeStyle = '#d3efbf99'; ctx.lineWidth = 1; ctx.setLineDash([6, 6]);
      for (let y = min; y <= max; y += 63) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
      ctx.fillStyle = '#f4f5d8'; ctx.font = '12px monospace'; ctx.fillText(`GROUND Y ${min} — ${max}`, 14, min - 10); ctx.restore();
    }
    if ($('forest-characters').checked) {
      const motion = dx < 0 ? 'backward' : dx > 0 || dy ? 'forward' : state.playing && state.speed ? (state.speed > 0 ? 'forward' : 'backward') : 'idle';
      const actors = [{ asset: character[motion], x: state.x, y: state.y }];
      if ($('forest-company').checked) actors.push({ asset: companions[0], x: 650, y: 370 }, { asset: companions[1], x: 860, y: 465 });
      actors.sort((a, b) => a.y - b.y).forEach(actor => drawSprite(actor.asset, actor.x, actor.y, time));
    }
    $('forest-camera-value').value = `${Math.round(state.camera)} px`;
    if (document.activeElement !== $('forest-camera')) $('forest-camera').value = String(((state.camera % 4096) + 4096) % 4096);
    requestAnimationFrame(draw);
  }
  try {
    spec = await json(base + 'manifest.json');
    [layers, character, companions] = await Promise.all([
      Promise.all(spec.layers.map(async layer => ({ ...layer, image: await image(base + layer.file) }))),
      loadCharacter('warrior'),
      Promise.all([sprite('assets/mage/', 'manifest.json'), sprite('assets/enemies/slime/motions/idle/', 'manifest.json')])
    ]);
    stageDetails();$('stage-select').disabled=false;$('stage-select').addEventListener('change',event=>changeStage(event.target.value));
    $('forest-controls').disabled = false; $('forest-status').textContent = ''; setPlaying(false);
    $('forest-play').addEventListener('click', () => setPlaying(!state.playing));
    $('forest-reset').addEventListener('click', () => { state.camera = 0; setPlaying(false); });
    $('forest-speed').addEventListener('input', event => { state.speed = Number(event.target.value); $('forest-speed-value').value = `${state.speed} px/s`; });
    $('forest-camera').addEventListener('input', event => { state.camera = Number(event.target.value); setPlaying(false); });
    $('forest-x').addEventListener('input', event => clampPoint(Number(event.target.value), state.y));
    $('forest-y').addEventListener('input', event => clampPoint(state.x, Number(event.target.value)));
    $('forest-character').addEventListener('change', async event => {
      const serial = ++selection;
      try { const next = await loadCharacter(event.target.value); if (serial === selection) { character = next; $('forest-status').textContent = ''; } }
      catch (error) { if (serial === selection) $('forest-status').textContent = error.message; }
    });
    canvas.addEventListener('pointerdown', event => { if (event.button !== 0) return; state.dragging = true; canvas.setPointerCapture(event.pointerId); canvas.focus(); pointFromPointer(event); });
    canvas.addEventListener('pointermove', event => { if (state.dragging) pointFromPointer(event); });
    const release = () => { state.dragging = false; };
    canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release);
    canvas.addEventListener('keydown', event => {
      if (event.key.startsWith('Arrow')) { keys.add(event.key); event.preventDefault(); }
      if (event.code === 'Space') { if (!event.repeat) setPlaying(!state.playing); event.preventDefault(); }
    });
    canvas.addEventListener('keyup', event => keys.delete(event.key)); canvas.addEventListener('blur', () => keys.clear());
    window.addEventListener('blur', () => keys.clear()); requestAnimationFrame(draw);
  } catch (error) { $('forest-status').textContent = `読み込みに失敗しました。${error.message}`; $('forest-state').textContent = '読み込みエラー'; }
})();
