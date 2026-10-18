(function () {
  'use strict';
  const M = window.ReincarnationMock;
  const $ = id => document.getElementById(id);
  const asset = icon => '/assets/ui/' + icon;
  const labels = { owned: '取得済', available: '取得可能', locked: '前提未達', unaffordable: 'ポイント不足' };
  let state = M.createState(), family = 'all', query = '', zoom = .8, view = 'tree', pendingPurchase = null, toastTimer;
  const number = value => value.toLocaleString('ja-JP');
  const effectText = n => n.effects.map(e => e.label + ' ' + e.value).join(' / ');
  function relevant(n) {
    return (family === 'all' || family === n.family) && (!query || (n.name + effectText(n) + M.families[n.family].name).toLowerCase().includes(query));
  }
  function ancestors(id, result = new Set()) {
    for (const parent of M.byId[id].requires) if (!result.has(parent)) { result.add(parent); ancestors(parent, result); }
    return result;
  }
  function notify(message) {
    $('announcement').textContent = message;
    $('announcement').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('announcement').classList.remove('visible'), 2800);
  }
  function summaryRows(t) {
    const rows = [
      ['ドロップ数', '×' + t.drop * t.dropFinal], ['経験値', '×' + [1, 3, 9, 27][t.xp]], ['ゴールド', '×' + t.gold],
      ['通常メイン素材費', t.mainFree ? '0' : '通常'], ['与ダメージ', '×' + ((1 + t.damage / 100) * t.damageFinal)],
      ['最大HP', '×' + ((1 + t.hp / 100) * t.hpFinal)],
    ];
    const additive = { rate: 'ドロップ率', sub: '通常サブ素材費', unique: '通常ユニーク素材費', gearGold: '装備ゴールド費', boss: '対ボス与ダメージ', recovery: '回復量', sp: 'レベル由来SP', spTen: '10Lvごとの追加SP', mp: 'MP消費', skill: '技能威力', common: '共通容量', attackCap: '攻撃容量', guardCap: '防御容量', utilityCap: '補助容量', forge: 'ジェム制作費', gemLevel: '地域Lv強化費' };
    for (const [key, label] of Object.entries(additive)) if (t[key]) {
      const reduction = ['sub', 'unique', 'gearGold', 'mp', 'forge', 'gemLevel'].includes(key);
      const plain = ['spTen', 'common', 'attackCap', 'guardCap', 'utilityCap'].includes(key);
      rows.push([label, (reduction ? '−' : '＋') + t[key] + (plain ? '' : '%')]);
    }
    if (t.skip > 1) rows.push(['最大進行幅', '＋' + t.skip]);
    if (t.trial) rows.push(['試練', '解放']);
    if (t.seals) rows.push(['宝石封印・技能制限', '解放']);
    if (t.slots > 1) rows.push(['試練同時選択枠', t.slots]);
    if (t.intrusion) rows.push(['追加敵の試練', '解放']);
    if (t.solo) rows.push(['少人数の上位試練', '解放']);
    return rows;
  }
  function renderGraph() {
    const path = ancestors(state.selected);
    $('nodes').innerHTML = Object.entries(M.families).map(([id, f], i) => `<div class="lane-label" style="left:${i * 160 + 7}px;--family:${f.color}">${f.name}</div>`).join('') + M.nodes.map(n => {
      const status = M.status(state, n.id), f = M.families[n.family], selected = n.id === state.selected;
      const mark = status === 'owned' ? '✓' : status === 'locked' ? '◇' : status === 'available' ? '＋' : '−';
      return `<button class="node ${status}${n.milestone ? ' milestone' : ''}${selected ? ' selected' : ''}${relevant(n) || n.root ? '' : ' dimmed'}${query && relevant(n) ? ' matched' : ''}" data-node="${n.id}" style="left:${n.x}px;top:${n.y}px;--family:${f.color}" aria-pressed="${selected}" aria-label="${n.name}、${labels[status]}、${n.cost}ポイント" title="${n.name}｜${effectText(n) || '転生・基本の自動化 解放'}｜${labels[status]}${n.requires.length ? '｜前提：' + n.requires.map(p => M.byId[p].name).join('・') : ''}"><img src="${asset(n.root ? 'gems/goddess-residue.png' : f.icon)}" alt=""><span><span class="node-title">${n.name}</span><span class="node-effect">${n.effects[0] ? n.effects[0].label + ' ' + n.effects[0].value : '永続成長のはじまり'}</span></span><span class="node-price"><span>${status === 'owned' ? '取得済' : number(n.cost) + ' PT'}</span><small>${mark}</small></span></button>`;
    }).join('');
    $('connections').innerHTML = M.nodes.flatMap(n => n.requires.map(parent => {
      const p = M.byId[parent], start = p.y + (p.milestone && p.id === 'main-free' ? 53 : p.root ? 32 : 45), end = n.y - (n.id === 'main-free' ? 53 : 45);
      const middle = p.id === 'main-free' ? 540 : (start + end) / 2;
      let d = `M ${p.x} ${start} V ${middle} H ${n.x} V ${end}`;
      // Route long prerequisite links around intermediate, unrelated nodes.
      if (n.id === 'unique40') d = `M ${p.x + 70} ${p.y} H 1170 V ${n.y} H ${n.x + 70}`;
      if (n.id === 'drop-rate') d = `M ${p.x - 70} ${p.y} H 280 V ${n.y} H ${n.x - 70}`;
      if (n.id === 'trial-open' && parent === 'drop4') d = `M ${p.x + 70} ${p.y} H 1245 V ${end - 12} H ${n.x} V ${end}`;
      if (n.id === 'trial-intrusion' && ['damage2', 'hp2'].includes(parent)) d = `M ${p.x + 70} ${p.y} H ${p.x + 79} V ${end - 12} H ${n.x} V ${end}`;
      if (n.id === 'trial-solo' && parent !== 'trial-intrusion') d = `M ${p.x} ${start} V ${end - 12} H ${n.x} V ${end}`;
      const selected = (path.has(n.id) || n.id === state.selected) && path.has(parent);
      return `<path d="${d}" class="connection${state.owned.has(parent) ? ' active' : ' pending'}${selected ? ' selected-path' : ''}${relevant(n) || selected ? '' : ' dimmed'}"/>`;
    })).join('');
  }
  function renderList() {
    const visible = M.nodes.filter(n => !n.root && relevant(n));
    $('node-list').innerHTML = visible.map(n => `<tr class="${n.id === state.selected ? 'selected' : ''}"><td><button data-select="${n.id}" style="--family:${M.families[n.family].color}"><b>${n.name}</b><small>${M.families[n.family].name}</small></button></td><td>${n.effects.map(e => e.label + ' ' + e.value).join('<br>')}</td><td>${number(n.cost)} PT${n.initial ? '' : ' *'}</td><td>${labels[M.status(state, n.id)]}</td></tr>`).join('');
    $('empty-list').hidden = visible.length !== 0;
  }
  function renderDetail() {
    const n = M.byId[state.selected], f = M.families[n.family], status = M.status(state, n.id);
    const before = summaryRows(M.totals(state));
    const previewState = { ...state, owned: new Set([...state.owned, ...ancestors(n.id)]) };
    const prerequisiteTotals = summaryRows(M.totals(previewState));
    const after = summaryRows(M.totals(previewState, n.id));
    const changes = status === 'owned' ? [] : after.filter(([key, val]) => prerequisiteTotals.find(r => r[0] === key)?.[1] !== val);
    const change = changes.length ? `<p class="preview-label">${status === 'locked' ? '前提を含む取得後の合計' : '取得後の合計'}</p>` + changes.map(([key, val]) => `<div class="preview-change"><span>${key}</span><b>${before.find(r => r[0] === key)?.[1] ?? '—'} → ${val}</b></div>`).join('') : '';
    let button = '取得する';
    if (status === 'owned') button = '✓ 取得済み';
    if (status === 'locked') button = '前提ノードが必要';
    if (status === 'unaffordable') button = 'あと ' + number(n.cost - M.points(state)) + ' PT';
    $('detail').style.setProperty('--family', f.color);
    $('detail').innerHTML = `<div class="detail-topline"><span>● ${f.name}</span><span class="status-badge">${labels[status]}</span></div><div class="detail-title"><img src="${asset(f.icon)}" alt=""><div><h2>${n.name}</h2><small>${n.id === 'main-free' ? 'KEYSTONE / 主目標' : n.milestone ? 'MILESTONE' : 'PERMANENT UPGRADE'}</small></div></div>${n.effects.length ? `<dl class="detail-effects">${n.effects.map(e => `<div><dt>${e.label}</dt><dd>${e.value}</dd></div>`).join('')}</dl>` : '<p class="detail-note">転生・基本の自動化 解放</p>'}${change}${n.note ? `<p class="detail-note">${n.note}</p>` : ''}${n.requires.length ? `<div class="prerequisites"><h3>前提ノード <span>／ すべて必要</span></h3>${n.requires.map(id => `<button data-select="${id}"><span class="${state.owned.has(id) ? 'check' : 'missing'}">${state.owned.has(id) ? '✓' : '◇'} ${M.byId[id].name}</span><span>↗</span></button>`).join('')}</div>` : ''}<div class="detail-cost"><span>取得コスト</span><b>${number(n.cost)} <small>PT</small></b></div><button class="primary purchase-button" id="purchase" ${status !== 'available' ? 'disabled' : ''}>${button}</button><p class="price-note">${n.root ? '転生の女神撃破で解放' : n.initial ? '企画書の比較用仮価格' : '* 価格・効果はレビュー用の追加案'}</p>`;
  }
  function render() {
    $('points').textContent = number(M.points(state));
    $('spent').textContent = number(M.spent(state)) + ' PT';
    $('owned-count').textContent = (state.owned.size - 1) + ' / ' + (M.nodes.length - 1);
    $('summary').innerHTML = summaryRows(M.totals(state)).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    renderGraph(); renderList(); renderDetail();
  }
  function setZoom(value, center) {
    const viewport = $('map-viewport'), old = zoom;
    const cx = center?.x ?? (viewport.scrollLeft + viewport.clientWidth / 2) / old;
    const cy = center?.y ?? (viewport.scrollTop + viewport.clientHeight / 2) / old;
    zoom = Math.min(1.3, Math.max(.3, value));
    $('star-map').style.transform = `scale(${zoom})`;
    $('map-size').style.width = 1280 * zoom + 'px';
    $('map-size').style.height = 1190 * zoom + 'px';
    $('zoom-label').textContent = Math.round(zoom * 100) + '%';
    viewport.scrollLeft = cx * zoom - viewport.clientWidth / 2;
    viewport.scrollTop = cy * zoom - viewport.clientHeight / 2;
    $('zoom-out').disabled = zoom <= .3;
    $('zoom-in').disabled = zoom >= 1.3;
  }
  function select(id, reveal = false) {
    if (!M.byId[id]) return;
    state.selected = id; render();
    if (reveal && view === 'tree') {
      const n = M.byId[id], viewport = $('map-viewport');
      viewport.scrollTo({ left: n.x * zoom - viewport.clientWidth / 2, top: n.y * zoom - viewport.clientHeight / 2, behavior: 'auto' });
    }
  }
  $('families').innerHTML = '<button data-family="all" aria-pressed="true">すべて</button>' + Object.entries(M.families).map(([id, f]) => `<button data-family="${id}" aria-pressed="false" style="--family:${f.color}" title="${f.name}のノードを強調"><i></i>${f.name}</button>`).join('');
  $('node-count').textContent = M.nodes.length - 1;
  document.addEventListener('click', event => {
    const node = event.target.closest('[data-node]');
    if (node) select(node.dataset.node);
    const link = event.target.closest('[data-select]');
    if (link) select(link.dataset.select, true);
    const filter = event.target.closest('[data-family]');
    if (filter) {
      family = filter.dataset.family;
      for (const button of $('families').children) button.setAttribute('aria-pressed', String(button === filter));
      renderGraph(); renderList();
    }
    const tab = event.target.closest('[data-view]');
    if (tab) {
      view = tab.dataset.view;
      $('tree-view').hidden = view !== 'tree'; $('list-view').hidden = view !== 'list';
      document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
    }
    if (event.target.id === 'purchase') {
      const n = M.byId[state.selected];
      if (M.status(state, n.id) !== 'available') return;
      pendingPurchase = n.id;
      $('confirm-node').innerHTML = `${n.name}<span>${number(n.cost)} PT ／ 残り ${number(M.points(state) - n.cost)} PT</span>`;
      $('purchase-dialog').showModal();
    }
  });
  $('purchase-dialog').addEventListener('close', () => {
    if ($('purchase-dialog').returnValue === 'purchase' && pendingPurchase) {
      if (M.purchase(state, pendingPurchase)) notify(M.byId[pendingPurchase].name + ' を取得しました');
      render();
    }
    pendingPurchase = null;
  });
  $('scenario').addEventListener('change', () => {
    state = M.createState($('scenario').value); render();
    if (view === 'tree') setZoom(zoom, { x: state.selected === 'drop2' || state.selected === 'main-free' ? 640 : 900, y: state.selected === 'drop2' || state.selected === 'main-free' ? 270 : M.byId[state.selected].y });
  });
  $('reset').addEventListener('click', () => { state = M.createState($('scenario').value); render(); notify('レビュー状態を戻しました'); });
  $('add-points').addEventListener('click', () => { state.total += 100; render(); notify('モックに100 PTを追加しました'); });
  $('search').addEventListener('input', () => { query = $('search').value.trim().toLowerCase(); renderGraph(); renderList(); });
  $('zoom-out').addEventListener('click', () => setZoom(zoom - .1));
  $('zoom-in').addEventListener('click', () => setZoom(zoom + .1));
  $('actual').addEventListener('click', () => setZoom(1));
  $('fit').addEventListener('click', () => setZoom(Math.min(($('map-viewport').clientWidth - 16) / 1280, ($('map-viewport').clientHeight - 16) / 1190), { x: 640, y: 595 }));
  render();
  requestAnimationFrame(() => setZoom(window.innerWidth < 800 ? .9 : Math.max(.75, Math.min(.9, ($('map-viewport').clientWidth - 12) / 1280)), { x: 0, y: 0 }));
})();
