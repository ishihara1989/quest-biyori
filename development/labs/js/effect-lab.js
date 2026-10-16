'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const descriptions = {
    'mage-wind-bolt': '右向きの風弾・320msループ。',
    'mage-chant-aura': '詠唱の魔法陣・640msループ。',
    'mage-wind-impact': '閃光 → 風の衝撃 → 分離 → 消散。',
    'fruit-bomb': '小枝と葉を持つ樹の実。投射物の中心を基準に配置。軌道・回転はゲーム側で設定します。',
    explosion: '閃光 → 火球 → 火と煙 → 消散。中心基準。木や葉を含まない汎用爆発。',
    'root-eruption': '根の先端 → 伸長 → 最大突出 → 収縮。足元基準で地面に配置します。',
    'alraune-seed-volley': '左向きの種25粒を3段にまとめた1枚の弾群。中心基準で画像全体を左へ移動させます。小花の種・連射モーションは400msループで、0ms・200msに弾群を発射します。',
    'alraune-seed-stream': 'アルラウネと同じ種8粒を横1列にした、手下用の弾群。頭の花から左へ飛びます。攻撃2コマ目の200msに発射し、画像全体を左へ移動させます。',
  };
  const models = []; let playing = !preference.matches, elapsed = 0, lastTime = null;
  const toggle = document.querySelector('#toggle');
  function updateToggle() { toggle.textContent = playing ? '一時停止' : '再生'; }
  function draw(model, index) {
    const f = model.data.frames[index], ctx = model.canvas.getContext('2d');
    ctx.clearRect(0, 0, model.canvas.width, model.canvas.height); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(model.sheet, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
    model.phase.textContent = `${index + 1}/${model.data.frameCount}　${f.phase}`;
    model.canvas.dataset.frame = index;
    model.buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  function render() {
    for (const model of models) {
      const time = elapsed % (model.data.durationMs + (!model.data.loop && model.data.frameCount > 1 ? 450 : 0));
      if (!model.data.loop && model.data.frameCount > 1 && time >= model.data.durationMs) {
        model.canvas.getContext('2d').clearRect(0, 0, model.canvas.width, model.canvas.height);
        model.phase.textContent = '再生完了 → 消去';
        model.buttons.forEach(button => button.setAttribute('aria-pressed', 'false')); continue;
      }
      let end = 0, index = 0;
      for (const frame of model.data.frames) { end += frame.durationMs; index = frame.index; if (time < end) break; }
      draw(model, index);
    }
  }
  function tick(time) {
    if (!document.hidden && playing && lastTime !== null) elapsed += Math.min(time - lastTime, 100) * Number(document.querySelector('#speed').value);
    lastTime = document.hidden || !playing ? null : time;
    if (playing) render(); requestAnimationFrame(tick);
  }
  async function initialize() {
    try {
      const response = await fetch('assets/effects/index.json');
      if (!response.ok) throw new Error('エフェクト一覧を読み込めませんでした。');
      const catalog = await response.json();
      for (const item of catalog) {
        const url = new URL(`assets/effects/${item.manifest}`, document.baseURI), base = new URL('./', url);
        const response = await fetch(url); if (!response.ok) throw new Error(`${item.label}を読み込めませんでした。`);
        const data = await response.json(), sheet = new Image();
        await new Promise((resolve, reject) => { sheet.onload = resolve; sheet.onerror = reject; sheet.src = new URL(data.sheet, base).href; });
        const card = document.createElement('section'); card.className = 'effect-card';
        const title = document.createElement('h2'); title.textContent = item.label;
        const stage = document.createElement('div'); stage.className = 'effect-stage';
        const canvas = document.createElement('canvas'); canvas.width = data.frameWidth; canvas.height = data.frameHeight;
        canvas.style.width = `${data.frameWidth * (data.frameCount === 1 ? 3 : 1)}px`;
        canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', item.label); stage.append(canvas);
        const phase = document.createElement('p'); phase.className = 'effect-phase';
        const strip = document.createElement('div'); strip.className = 'effect-frames';
        const model = { data, sheet, canvas, phase, buttons: [] };
        for (const frame of data.frames) {
          const button = document.createElement('button'); button.type = 'button'; button.textContent = `${frame.index + 1} コマ目`;
          button.addEventListener('click', () => { playing = false; updateToggle(); draw(model, frame.index); });
          model.buttons.push(button); strip.append(button);
        }
        const info = document.createElement('p'); info.textContent = `${data.frameCount}コマ / ${data.frameWidth} × ${data.frameHeight}px / ${data.durationMs}ms。${descriptions[item.id] || ''}`;
        const links = document.createElement('div'); links.className = 'effect-links';
        for (const [name, file] of [['透過PNG', data.sheet], ['プレビューGIF', data.preview], ['フレーム情報', 'manifest.json']]) {
          const a = document.createElement('a'); a.textContent = `↓ ${name}`; a.href = new URL(file, base).href; a.download = file; links.append(a);
        }
        if (data.singleSeed) {
          const a = document.createElement('a'); a.textContent = '↓ 種1粒のPNG';
          a.href = new URL(data.singleSeed.file, base).href; a.download = data.singleSeed.file; links.append(a);
        }
        card.append(title, stage, phase, strip, info, links); document.querySelector('#effects').append(card); models.push(model);
      }
      document.querySelector('#status').hidden = true; render(); updateToggle(); requestAnimationFrame(tick);
    } catch (error) { document.querySelector('#status').textContent = `素材の読み込みに失敗しました: ${error.message || '画像を確認してください'}`; }
  }
  toggle.addEventListener('click', () => { playing = !playing; lastTime = null; updateToggle(); });
  document.querySelector('#restart').addEventListener('click', () => { elapsed = 0; lastTime = null; render(); });
  document.querySelector('#background').addEventListener('change', event => {
    document.querySelectorAll('.effect-stage').forEach(stage => { stage.className = `effect-stage ${event.target.value}`; });
  });
  preference.addEventListener('change', event => { if (event.matches) { playing = false; updateToggle(); } });
  initialize();
})();
