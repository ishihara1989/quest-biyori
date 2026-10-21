'use strict';
(async () => {
  const $ = id => document.getElementById(id);
  const { HERO, ALL_ENEMIES: ENEMIES, ALL_STAGES: STAGES, SPECIAL_STAGES, REGIONS, stageLabel, stageId, nextStage, ITEMS, RARITIES, SAVE_KEY, readSave, freshSave, isUnlocked, award, autoDestination } = ForestData;
  const { createRun, update, heal } = ForestSimulation;
  const P = ForestProgression;
  // Keep the full-screen rewards outside the arena's isolated stacking context.
  document.body.append($('result-overlay'));
  const canvas = $('game-canvas'), ctx = canvas.getContext('2d');
  const curseFocus=document.createElement('div');curseFocus.className='curse-status-focus';curseFocus.setAttribute('aria-label','敵の呪い状態');canvas.parentElement.append(curseFocus);
  function syncCurseFocus(){const statusRegions=[...shamanStatusRegions,...mikoStatusRegions,...interferenceStatusRegions];while(curseFocus.children.length<statusRegions.length){const b=document.createElement('button');b.type='button';curseFocus.append(b);}while(curseFocus.children.length>statusRegions.length)curseFocus.lastChild.remove();statusRegions.forEach((r,i)=>{const b=curseFocus.children[i];b.dataset.tip=r.label;b.setAttribute('aria-label',r.label);Object.assign(b.style,{left:r.x/1024*100+'%',top:r.y/576*100+'%',width:r.w/1024*100+'%',height:r.h/576*100+'%'});});}
  const icon = name => '<svg aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const gemItem = gem => ({...P.Gem.describe(gem), id:'gem-instance-'+gem.id, gemId:gem.id, type:'gem'});
  const itemById = id => String(id).startsWith('gem-instance-') ? (save.gems.find(g=>g.id===Number(String(id).slice(13)))?gemItem(save.gems.find(g=>g.id===Number(String(id).slice(13)))):runGemItems.find(g=>g.id===id)) : ITEMS.find(item => item.id === id);
  const itemImage = id => itemById(id)?.image || 'assets/ui/items/' + (itemById(id)?.art || id) + '.png';
  const enemyImage = id => ENEMIES[id].dimensionalGate ? SpecialStages.definition(ENEMIES[id].specialId).ASSET + 'gate.png' : 'assets/ui/enemies/' + id + '.png';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let save;
  try { save = readSave(localStorage.getItem(SAVE_KEY)); } catch { save = readSave(null); }
  const buildCache = new Map();
  const savedStats = id => {
    if (!buildCache.has(id)) buildCache.set(id, P.stats(save, id));
    return buildCache.get(id);
  };
  const builds = () => Object.fromEntries(Object.keys(P.CHARACTERS).filter(id => P.unlocked(save, id)).map(id => [id, savedStats(id)]));
  let runBuilds = structuredClone(builds());
  let run = createRun(save.selectedStage, { builds: runBuilds, goldRemainder: save.goldRemainder }), started = false, playing = false, ready = false;
  let pendingRewards = ForestRunRewards.create(run);
  const battleStats = id => runBuilds[id] || savedStats(id);
  let lastTime, resultAge = 0, resultShown = false, resultNavigation = false, notifyTimer, toastTimer, saveTimer;
  let effects = [], particles = [], runLoot = {}, runGemItems = [], sprites = {}, layers = [], effectSprites = {}, warriorEffects = {}, mageEffects = {}, paladinEffects = {}, ninjaEffects = {}, shamanEffects = {}, mikoEffects = {}, ninjaStatusRegions=[], shamanStatusRegions=[], mikoStatusRegions=[], interferenceStatusRegions=[];
  let menu = '', viewedStage = save.selectedStage, inventoryFilter = 'material', gemFilter = 'gem', selectedItem = 'jelly', selectedGem = null, inventorySlot = 'weapon', runXp = '';
  const gemView = ForestGemInventory.defaults();
  let gemOwners = new Map(), gemSearchTimer, otherLoadoutsOpen = false, updatingGemView = false, renderingInventory = false;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let resetting = false;
  let previewTime = 0, pendingSave = false, shake = 0, autoGearAge = 1000, autoGearPending = true;
  const skillSlots = new Map();
  const damageTextGroups = new Map();
  let lastCooldownUpdate = -Infinity;
  const partyViews = new Map();
  const museumUI = MuseumUI.create({ save, container: $('menu-content'), icon, reduced });
  let skillCapacity = 0;
  const skillResize = new ResizeObserver(() => {
    const slotWidth = $('potion-button').getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle($('skill-cooldowns')).columnGap) || 0;
    skillCapacity = Math.max(0, Math.floor(($('skill-cooldowns').clientWidth + gap) / (slotWidth + gap)));
    refreshSkillCooldowns();
  });
  skillResize.observe($('skill-cooldowns'));
  skillResize.observe($('potion-button'));
  const growthUI = ForestProgressionUI.create({ save, getRun: () => run, getStats: savedStats, isRunning: () => started && run.status === 'running', icon, persist, notify, onSelect: selectCharacter, onChange: () => { invalidateBuilds(); autoGearPending = true; refreshResources(); refreshGrowth(); } });
  const lootUI = ForestLootUI.create({ itemImage, itemTip, icon, reduced, gemItems:()=>runGemItems });
  const autoGearUI = ForestAutoGearUI.create({ save, icon, onChange: focus => {
    autoGearPending = true; runAutomaticGear(); persist(); renderOptions(); document.querySelector(focus)?.focus({ preventScroll: true }); $('tooltip').hidden = true;
  } });
  const conversionUI = ForestConversionUI.create({ save, itemImage, itemTip, icon, initialRegion: run.stage.region,
    onConvert: () => { autoGearPending = true; runAutomaticGear(); persist(); refreshResources(); refreshGrowth(); } });
  const gemWorkshop = GemWorkshopUI.create({save,itemImage,icon,notify,onChange:(write=true)=>{if(write){invalidateBuilds();autoGearPending=true;persist();refreshResources();refreshGrowth();}renderInventory();},onCraft:uid=>{selectedGem=uid;gemFilter='gem';Object.assign(gemView,ForestGemInventory.defaults());renderInventory();}});
  const gemDismantleUI = GemDismantleUI.create({ save, itemImage, itemTip, icon, notify,
    onChange: (scope, write) => { if (write) { autoGearPending = true; persist(); refreshResources(); } if (scope === 'auto') renderOptions(); else renderInventory(); $('tooltip').hidden = true; },
    onInspect: uid => { selectedGem = uid; gemFilter = 'gem'; Object.assign(gemView,ForestGemInventory.defaults()); renderInventory(); } });
  const format = number => number.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
  function text(id, value) { if ($(id).textContent !== value) $(id).textContent = value; }
  function persist() {
    if (resetting) return;
    pendingSave = false;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save)); text('save-state', 'SAVED');
      clearTimeout(saveTimer); saveTimer = setTimeout(() => text('save-state', 'READY'), 1500);
    } catch {
      text('save-state', '保存不可');
      notify('保存領域を利用できません。この画面を開いている間は続けられます。');
    }
  }
  function notify(message) {
    $('notification').textContent = message; $('notification').classList.add('visible');
    clearTimeout(notifyTimer); notifyTimer = setTimeout(() => $('notification').classList.remove('visible'), 2800);
  }
  function runAutomaticGear() {
    if (!autoGearPending) return;
    autoGearPending = false;
    const bought = ForestAutoGear.acquire(save);
    if (!bought.length) return;
    autoGearPending = bought.length === 24;
    invalidateBuilds(); persist(); refreshResources(); refreshGrowth();
    notify('装備強化 AUTO +' + bought.length);
    if ($('menu-dialog').open) refreshOpenMenu();
  }
  function invalidateBuilds() {
    buildCache.clear();
    if (!started) {
      runBuilds = structuredClone(builds());
      run = createRun(save.selectedStage, { builds: runBuilds, goldRemainder: save.goldRemainder });
      pendingRewards = ForestRunRewards.create(run);
    }
  }
  function toast(message) {
    $('wave-toast').textContent = message; $('wave-toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('wave-toast').classList.remove('show'), 1450);
  }
  function nodeMarkup(stage, current) {
    const cleared = save.cleared.includes(stage.id), unlocked = isUnlocked(save, stage.id);
    const type = stage.special ? stage.waves[0][0] : stage.enemies.at(-1), boss = stage.enemies.some(id => ForestData.enemyDiscovered(save,id) && ENEMIES[id].boss);
    const label = (stage.special ? '' : stageLabel(stage.id) + ' ') + stage.name + (cleared ? ' · クリア' : unlocked ? '' : ' · 未解放');
    return '<button class="route-node ' + (stage.special ? 'special-node ' : '') + (cleared ? 'cleared ' : '') + (unlocked ? 'unlocked ' : 'locked ') +
      (stage.id === current ? 'current' : '') + '" data-stage="' + stage.id + '" data-tip="' + label +
      '" aria-label="' + label + '"' + (stage.id === current ? ' aria-current="step"' : '') + '><span>' + (ForestData.enemyDiscovered(save,type) ? '<img src="' + enemyImage(type) + '" alt="">' : icon('map')) + (cleared ? '<svg class="node-status"><use href="#i-check"/></svg>' :
        !unlocked ? '<svg class="node-status"><use href="#i-lock"/></svg>' : '') +
      '</span><small>' + (stage.special ? stage.name : (boss ? '◆ ' : '') + String(stage.number).padStart(2, '0')) + '</small></button>';
  }
  function renderRoute() {
    const stages = (run.stage.special ? SPECIAL_STAGES : STAGES.filter(s => !s.special && s.region === run.stage.region)).filter(s => ForestData.stageVisible(save, s));
    $('route-nodes').innerHTML = stages.map(stage => nodeMarkup(stage, save.selectedStage)).join('');
    text('clear-count', stages.filter(s => save.cleared.includes(s.id)).length + ' / ' + stages.length);
  }
  function refreshRegion() {
    const region = REGIONS[run.stage.region - 1];
    document.body.dataset.region = region.id;
    document.body.dataset.special = run.stage.special ? run.stage.id : '';
    document.title = 'クエストびより';
    document.querySelector('.adventure-heading .eyebrow').innerHTML = run.stage.special ? '<span></span>SPECIAL <i>/</i> ' + run.stage.english : '<span></span>CHAPTER ' + String(region.id).padStart(2, '0') + ' <i>/</i> ' + region.english;
    document.querySelector('.adventure-heading h1').innerHTML = run.stage.special ? run.stage.realmName + ' <span class="chapter-badge">✧</span>' : region.name + ' <span class="chapter-badge">' + String(region.id).padStart(2, '0') + '</span>';
    document.querySelector('.forest-route').setAttribute('aria-label', (run.stage.special ? '特殊ステージ' : region.name) + 'の進行状況');
    document.querySelector('.route-caption span').textContent = run.stage.special ? 'SPECIAL STAGES' : region.path;
    $('start-overlay').querySelector('h2').textContent = run.stage.special ? run.stage.name : region.name;
    refreshResources();
  }
  function enemyChips(ids) {
    return ids.filter(id => ForestData.enemyDiscovered(save,id)).map(id => '<span class="enemy-chip ' + (ENEMIES[id].boss ? 'boss' : '') +
      '" data-tip="' + ENEMIES[id].name + '" tabindex="0"><img src="' + enemyImage(id) +
      '" alt="' + ENEMIES[id].name + '"></span>').join('');
  }
  function refreshResources() {
    text('gold-count', format(save.gold));
    text('potion-count', String(save.inventory.potion || 0));
    text('nav-item-count', String(ITEMS.filter(item => item.type !== 'gem' && save.inventory[item.id] > 0).length + save.gems.length));
  }
  function refreshGrowth() {
    const character = save.progression.selected, job = P.CHARACTERS[character];
    const stats = battleStats(character), c = save.progression.characters[character];
    const summary = document.querySelector('.hero-summary');
    summary.querySelector('img').src = 'assets/' + character + '/idle-01.png';
    summary.querySelector('img').alt = job.name;
    summary.querySelector('small').textContent = job.english;
    summary.querySelector('strong').textContent = job.name;
    summary.style.setProperty('--hero-color', job.color);
    document.querySelector('.hero-summary em').textContent = 'Lv. ' + stats.level;
    const quick = document.querySelectorAll('.quick-stats b');
    quick[0].textContent = Number(stats.damage.toFixed(1)); quick[1].textContent = Number(stats.defense.toFixed(1)); quick[2].innerHTML = Math.round(stats.crit * 100) + '<small>%</small>';
    const extra = $('growth-sidebar');
    const hasUnusedSP = Object.keys(P.CHARACTERS).some(id => P.unlocked(save, id) && P.points(save, id) > 0);
    const skillLabel = hasUnusedSP ? 'スキル · 未使用SPあり' : 'スキル';
    extra.innerHTML = '<div class="sidebar-mp-label"><span>MP</span><b id="sidebar-mp">' + Number(stats.maxMp.toFixed(2)) + ' / ' + Number(stats.maxMp.toFixed(2)) + '</b></div><div class="resource-track mp"><i id="sidebar-mp-fill"></i></div><div class="sidebar-xp"><span>EXP</span><b>' + P.xpPercent(c.xp) + '</b></div><div class="growth-shortcuts"><button data-open="character" data-tip="' + job.name + 'の能力">' + icon('user') + '能力</button><button data-open="gems" data-tip="' + job.name + 'のジェム">' + icon('gem') + 'ジェム</button><button data-open="skills" data-tip="' + skillLabel + '" aria-label="' + skillLabel + '">' + icon('spark') + 'スキル' + (hasUnusedSP ? '<span class="unused-sp-mark" aria-hidden="true">!</span>' : '') + '</button><button data-open="forge" data-tip="' + job.name + 'の装備強化">' + icon('sword') + '装備強化</button></div>';
    refreshParty();
    const warrior = character === 'warrior' ? stats : battleStats('warrior');
    const skills = (warrior.warriorSkills.length ? warrior.warriorSkills : [WarriorSkills.spec('renjin',warrior.normalRank,warrior.normalEnhance,warrior)]).map(s=>({...s,owner:'warrior'}));
    if(runBuilds.mage){const mage=battleStats('mage');skills.push(...[mage.mageNormal,...mage.mageSkills].map(s=>({...s,owner:'mage'})));}
    if(runBuilds.paladin){const p=battleStats('paladin');skills.push(...[p.paladinNormal,...p.paladinSkills].map(s=>({...s,owner:'paladin'})));}
    if(runBuilds.ninja){const n=battleStats('ninja');skills.push(...[n.ninjaNormal,...n.ninjaSkills].map(s=>({...s,owner:'ninja'})));}
    if(runBuilds.shaman){const s=battleStats('shaman');skills.push(...[s.shamanNormal,...s.shamanSkills].map(s=>({...s,owner:'shaman'})));}
    if(runBuilds.miko){const s=battleStats('miko');skills.push(...[s.mikoNormal,...s.mikoSkills].map(s=>({...s,owner:'miko'})));}
    const list = $('skill-cooldowns');
    for (const [id, slot] of skillSlots) {
      if (!skills.some(skill => skill.owner+':'+skill.id === id)) { slot.remove(); skillSlots.delete(id); }
    }
    for (const skill of skills) {
      const key=skill.owner+':'+skill.id;
      let slot = skillSlots.get(key);
      if (!slot) {
        slot = document.createElement('div'); slot.className = 'skill-slot'; slot.tabIndex = 0;
        slot.dataset.skillId = key;
        slot.innerHTML = '<img class="generated-skill" src="'+skill.icon+'" alt="'+skill.name+'"><span></span>';
        skillSlots.set(key, slot); list.append(slot);
      }
      slot.dataset.tip = skill.name+' · Lv.'+skill.rank+'\n'+(skill.owner==='miko'?MikoSkills:skill.owner==='shaman'?ShamanSkills:skill.owner==='ninja'?NinjaSkills:skill.owner==='mage'?MageSkills:skill.owner==='paladin'?PaladinSkills:WarriorSkills).parameters(skill);
      slot.cooldownActor = partyActor(skill.owner); slot.cooldownOwner = skill.owner; slot.cooldownId = skill.id;
    }
    refreshSkillCooldowns();
    refreshPartyVitals();
  }
  function selectCharacter(character) {
    if (!P.unlocked(save, character)) return;
    save.progression.selected = character;
    persist(); refreshGrowth(); hud();
    $('tooltip').hidden = true;
  }
  function refreshParty() {
    for (const [id, job] of Object.entries(P.CHARACTERS)) {
      if (!P.unlocked(save, id)) continue;
      let view = partyViews.get(id);
      if (!view) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'party-status-card'; button.dataset.partyCharacter = id;
        button.style.setProperty('--hero-color', job.color);
        button.dataset.tip = job.name + 'の詳細に切り替え';
        button.innerHTML = '<span class="party-member-heading"><span class="party-member-avatar"><img src="assets/' + id + '/idle-01.png" alt=""></span><span><strong>' + job.name + '</strong><small></small></span><i class="party-member-state"></i></span>' + ['hp', 'mp'].map(resource => '<span class="party-vital ' + resource + '"><span><small>' + resource.toUpperCase() + '</small><b></b></span><span class="party-vital-track"><i></i></span></span>').join('');
        $('party-status').append(button);
        view = { button, level: button.querySelector('.party-member-heading small'), hp: button.querySelector('.hp b'), mp: button.querySelector('.mp b'), hpFill: button.querySelector('.hp i'), mpFill: button.querySelector('.mp i'), state: button.querySelector('.party-member-state') };
        partyViews.set(id, view);
      }
      view.stats = battleStats(id);
      view.level.textContent = 'Lv. ' + view.stats.level;
      view.button.setAttribute('aria-pressed', String(id === save.progression.selected));
    }
    text('party-count', String(partyViews.size));
  }
  function partyActor(character) {
    return character === 'warrior' ? run.hero : run.allies.find(actor => actor.type === character);
  }
  function refreshPartyVitals() {
    for (const [id, view] of partyViews) {
      const actor = partyActor(id), stats = actor || view.stats;
      const hp = Math.max(0, actor?.hp ?? stats.maxHp), mp = Math.max(0, actor?.mp ?? stats.maxMp);
      const hpLabel = Math.ceil(hp) + ' / ' + Number(stats.maxHp.toFixed(1)), mpLabel = Math.floor(mp) + ' / ' + Number(stats.maxMp.toFixed(1));
      if (view.hp.textContent !== hpLabel) view.hp.textContent = hpLabel;
      if (view.mp.textContent !== mpLabel) view.mp.textContent = mpLabel;
      view.hpFill.style.width = Math.min(100, hp / stats.maxHp * 100) + '%';
      view.mpFill.style.width = Math.min(100, mp / stats.maxMp * 100) + '%';
      view.button.classList.toggle('down', hp <= 0);
      view.button.classList.toggle('wounded', hp > 0 && hp / stats.maxHp <= .25);
      view.state.textContent = hp <= 0 ? '×' : '';
      const label = P.CHARACTERS[id].name + ' · HP ' + hpLabel + ' · MP ' + mpLabel + (hp <= 0 ? ' · 戦闘不能' : '') + ' · 詳細に切り替え';
      if (view.button.getAttribute('aria-label') !== label) view.button.setAttribute('aria-label', label);
    }
  }
  function refreshSkillCooldowns(force = true) {
    const now = performance.now();
    if (!force && now - lastCooldownUpdate < 100) return;
    lastCooldownUpdate = now;
    const active = started && run.status === 'running';
    const slots = [...skillSlots.values()].map(slot => ({ slot, remaining: active ? slot.cooldownActor?.[slot.cooldownOwner + 'Cooldowns']?.[slot.cooldownId] || 0 : 0 })).sort((a, b) => a.remaining - b.remaining);
    const list = $('skill-cooldowns');
    slots.forEach(({ slot, remaining }, index) => {
      // Move existing nodes only when their order changes, preserving tooltip/focus targets.
      if (list.children[index] !== slot) list.insertBefore(slot, list.children[index] || null);
      slot.hidden = index >= skillCapacity;
      const label = remaining > 0 ? String(Math.ceil(remaining / 1000)) : '';
      if (slot.lastElementChild.textContent !== label) slot.lastElementChild.textContent = label;
    });
  }
  function setPlaying(next) {
    playing = next; lastTime = undefined;
    $('pause-button').innerHTML = icon(playing ? 'pause' : 'play');
    $('pause-button').setAttribute('aria-label', playing ? '一時停止' : '再開');
  }
  function startStage(id = save.selectedStage, preserveMenu = false) {
    if (!ready || !isUnlocked(save, id)) return;
    save.selectedStage = id; runBuilds = structuredClone(builds());
    run = createRun(id, { builds: runBuilds, goldRemainder: save.goldRemainder }); pendingRewards = ForestRunRewards.create(run);
    started = true; resultShown = false; resultAge = 0; resultNavigation = false;
    ForestData.recordEncounters(save, run.enemies.map(e => e.type));
    effects = []; particles = []; runLoot = {}; runGemItems = []; runXp = ''; shake = 0;
    damageTextGroups.clear();
    $('start-overlay').hidden = true; $('result-overlay').hidden = true;
    document.body.classList.remove('result-active');
    document.querySelector('.game-shell').inert = false;
    $('pause-button').disabled = false;
    if (!preserveMenu) { $('menu-dialog').close(); menu = ''; }
    refreshRegion(); text('stage-number', run.stage.special ? 'SPECIAL' : run.stage.region + ' — ' + run.stage.number); text('stage-name', run.stage.name);
    $('encounter-list').innerHTML = enemyChips(run.stage.special ? run.stage.waves.flat() : run.stage.enemies);
    canvas.setAttribute('aria-label', (run.stage.special ? run.stage.realmName : REGIONS[run.stage.region - 1].name + ' ' + stageLabel(id)) + ' ' + run.stage.name + ' 自動戦闘');
    renderRoute(); refreshGrowth(); persist(); setPlaying(true); toast('WAVE 01');
  }
  function usePotion() {
    if (!started || !save.inventory.potion) { notify('回復薬：使用不可'); return; }
    const amount = heal(run);
    if (!amount) { notify(run.hero.hp === run.hero.maxHp ? 'HP満タン' : '戦闘中のみ'); return; }
    save.inventory.potion--; refreshResources(); persist();
    effects.push({ type: 'heal', x: run.hero.x, y: run.hero.y - 110, amount, timeMs: run.time });
    burst(run.hero.x, run.hero.y - 70, '#a8ed96', 20);
    if (menu === 'inventory') renderInventory();
  }
  function burst(x, y, color, count = 12) {
    if (reduced) return;
    for (let i = 0; i < count && particles.length < 180; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 50 + Math.random() * 160;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30,
        life: 300 + Math.random() * 350, age: 0, color, size: 2 + Math.random() * 3 });
    }
  }
  function finish(victory) {
    if (resultShown) return;
    resultShown = true; resultAge = 0;
    const settled = ForestRunRewards.settle(save, pendingRewards, victory, run.random);
    runLoot = settled.loot; runGemItems = settled.gems.map(gemItem);
    let rewards = { gold: 0, first: false, potion: 0, recruited: null };
    if (victory) {
      const unlocks = ForestUnlocks.collect(save, run.stage.id);
      const hunt = [run.hero, ...run.allies].reduce((total, actor) => total + (actor.treasureHunt || 0), 0);
      rewards = { ...award(save, run.stage.id, hunt), unlocks }; P.gainXp(save, run.stage.xpStage ?? run.stage.id);
      invalidateBuilds(); autoGearPending = true;
      runAutomaticGear();
      const xp = save.progression.characters.warrior.xp; runXp = 'Lv.' + xp.level + ' · ' + P.xpPercent(xp);
      if (rewards.potion) runLoot.potion = (runLoot.potion || 0) + rewards.potion;
      persist(); refreshResources(); refreshGrowth(); renderRoute();
    }
    if (!victory && save.autoMode !== 'off') { save.autoMode = 'same'; persist(); refreshAutoControls(); }
    lootUI.render({ victory, rewards, loot: runLoot, gold: settled.gold + rewards.gold, stage: run.stage, elapsed: run.elapsed, kills: run.kills, xp: runXp, failureReason:run.failureReason });
    if ($('menu-dialog').open) refreshOpenMenu();
    if (victory) burst(512, 240, '#f1d890', 40);
    canvas.setAttribute('aria-label', (run.stage.realmName || REGIONS[run.stage.region - 1].name) + ' ' + stageLabel(run.stage.id) + (victory ? ' クリア' : ' 敗北'));
  }
  function handleEvents(events) {
    if (ForestData.recordEncounters(save, run.enemies.map(e => e.type))) {
      pendingSave = true;
      $('encounter-list').innerHTML = enemyChips(run.stage.special ? run.stage.waves.flat() : run.stage.enemies);
      renderRoute();
    }
    for (const [key, visual] of damageTextGroups) if (run.time - visual.timeMs >= 950) damageTextGroups.delete(key);
    for (const event of events) {
      if (event.type === 'damage') {
        const curseDot = event.kind === 'curse-dot', curseExtra = event.kind === 'curse-extra';
        const key = [event.target, event.source, event.kind, !!event.critical, !!event.skill, Math.floor(event.timeMs / 100)].join(':');
        const pulse = damageTextGroups.get(key);
        if (pulse) { pulse.amount += event.amount; pulse.x = event.x; pulse.y = event.y; }
        else { const visual = { ...event }; effects.push(visual); damageTextGroups.set(key, visual); }
        burst(event.x, event.y, curseDot ? '#be8cec' : curseExtra ? '#f5e8c9' : ['hero', 'mage', 'paladin','ninja','shaman','miko'].includes(event.source) ? event.skill ? '#ffe8a4' : '#fff3ca' : '#e09371', curseDot || curseExtra ? 4 : event.critical ? 18 : 8);
        if (!curseDot && !curseExtra && (event.skill || event.critical)) shake = reduced ? 0 : Math.max(shake, event.skill ? 5 : 3);
      } else if (event.type === 'slash' || event.type === 'wind') {
        effects.push(event);
      } else if (event.type === 'loot') {
        if(event.enemy===GoddessData.ID)effects=effects.filter(e=>e.type!=='goddess-effect');
        ForestRunRewards.record(pendingRewards, event);
      } else if (event.type === 'wave') toast('WAVE ' + String(event.wave).padStart(2, '0'));
      else if(event.type==='goddess-effect'){if(event.kind==='awaken')effects=effects.filter(e=>e.type!=='goddess-effect');effects.push(event);burst(event.x,event.y-30,'#d1efff',event.kind==='awaken'?45:14);if(!reduced&&['zero','cross','awaken'].includes(event.kind))shake=Math.max(shake,9);}
      else if (event.type === 'rift-effect') { effects.push(event); burst(event.x, event.y - 55, SpecialStages.definition(event.specialId).COLORS[event.tier], event.kind === 'shatter' ? 60 : event.kind === 'emerge' ? 22 : 32); if (event.kind === 'shatter') shake = reduced ? 0 : 11; }
      else if(event.type==='gem-effect'){effects.push(event);burst(event.x,event.y-30,event.kind==='resistance'?'#79ffc4':event.kind==='siphon'?'#89efdf':'#ffd074',16);}
      else if(event.type==='castle-effect'){effects.push(event);burst(event.x,event.y-20,'#c58cff',event.radius?24:12);if(!reduced&&['castle-royal-cleave','castle-demon-impact','castle-cross-beam','castle-end-ring'].includes(event.effect))shake=Math.max(shake,8);}
      else if(event.type==='volcano-effect'){effects.push(event);burst(event.x,event.y-20,'#ffaf4f',event.radius?24:12);if(!reduced&&['volcano-landing-shock','volcano-lava-impact','volcano-fissure'].includes(event.effect))shake=Math.max(shake,8);}
      else if(event.type==='glacier-effect'){effects.push(event);burst(event.x,event.y-20,'#b6f5ff',event.radius?24:12);if(!reduced&&['glacier-quake','glacier-boulder','glacier-crown'].includes(event.effect))shake=Math.max(shake,7);}
      else if (event.type === 'wave-clear') toast('WAVE CLEAR');
      else if (['impact', 'summon', 'swamp-effect', 'expansion-effect', 'part-emerge', 'part-retract', 'part-hit', 'miss', 'status'].includes(event.type)) { effects.push(event); if (event.type === 'summon') burst(event.x, event.y - 30, event.kind === 'skeleton' ? '#c598ff' : '#a5e7db', 22); if (['lich-dark-magic','hydra-poison-breath','cave-quake','water-breath'].includes(event.effect)) shake = reduced ? 0 : 6; }
      else if (event.type === 'warrior-impact') {effects.push(event);if(!reduced)shake=Math.max(shake,['impact','rupture'].includes(event.kind)?8:3);}
      else if (event.type === 'warrior-cast') {if(WarriorSkills.ACTIVE.find(s=>s.id===event.skillId).unlockLevel>=80)toast(event.name);}
      else if (event.type === 'mage-impact') {effects.push(event);if(!reduced)shake=Math.max(shake,['meteor','cosmos'].includes(event.pattern)?10:2);}
      else if (event.type === 'mage-cast') {if(MageSkills.ACTIVE.find(s=>s.id===event.skillId).unlockLevel>=80)toast(event.name);}
      else if (['paladin-impact','paladin-block','paladin-cleanse','action-interrupt','interference-hit','interference-resist','heal'].includes(event.type)) {effects.push(event);if(event.type==='action-interrupt'&&!reduced)shake=Math.max(shake,5);if(event.type==='paladin-impact'&&!reduced)shake=Math.max(shake,event.skillId==='ultimate'?12:['judgment','heavens','crusade'].includes(event.skillId)?7:2);}
      else if (event.type==='paladin-cast'&&PaladinSkills.ACTIVE.find(s=>s.id===event.skillId).unlockLevel>=75)toast(event.name);
      else if (event.type==='ninja-effect'){effects.push(event);if(!reduced&&['flash','final-ring','prison','shadow-dash','lightning'].includes(event.kind))shake=Math.max(shake,event.kind==='final-ring'?10:event.kind==='prison'?5:event.kind==='lightning'?3:2);}
      else if(event.type==='shaman-effect'){effects.push(event);if(!reduced&&['curse-burst','soul-pillar','grand-shatter'].includes(event.kind))shake=Math.max(shake,event.level>=95?10:4);}
      else if(event.type==='shaman-cast'&&ShamanSkills.ACTIVE.find(s=>s.id===event.skillId).unlockLevel>=85)toast(event.name);
      else if(['miko-effect','miko-block','ruins-effect','desert-effect'].includes(event.type)){effects.push(event);if(!reduced&&['festival','festival-finale'].includes(event.kind))shake=Math.max(shake,9);if(event.type==='desert-effect'){burst(event.x,event.y-20,event.effect==='desert-venom'?'#aff25e':'#ffd48b',event.major?25:9);if(event.major&&!reduced)shake=Math.max(shake,7);}}
      else if(event.type==='miko-cast'&&MikoSkills.ACTIVE.find(s=>s.id===event.skillId).unlockLevel>=50)toast(event.name);
      else if (event.type === 'finished') finish(event.victory);
    }
    if (pendingSave) persist();
  }
  function hud() {
    const hero = run.hero;
    refreshPartyVitals();
    const selected = partyActor(save.progression.selected), stats = selected || partyViews.get(save.progression.selected).stats;
    const hp = Math.max(0, selected?.hp ?? stats.maxHp), mp = Math.max(0, selected?.mp ?? stats.maxMp);
    const hpLabel = Math.ceil(hp) + ' <span>/ ' + Number(stats.maxHp.toFixed(1)) + '</span>';
    if ($('hero-hp').innerHTML !== hpLabel) $('hero-hp').innerHTML = hpLabel;
    $('hero-hp-fill').style.width = Math.min(100, hp / stats.maxHp * 100) + '%';
    text('sidebar-mp', Math.floor(mp) + ' / ' + Number(stats.maxMp.toFixed(1))); $('sidebar-mp-fill').style.width = Math.min(100, mp / stats.maxMp * 100) + '%';
    $('potion-button').disabled = !started || !save.inventory.potion || run.status !== 'running' || hero.hp <= 0 || hero.hp === hero.maxHp;
    text('wave-number', String(run.wave + 1).padStart(2, '0'));
    $('wave-number').nextElementSibling.textContent = '/ ' + String(run.stage.waves.length).padStart(2, '0');
    if ($('wave-dots').children.length !== run.stage.waves.length) {
      $('wave-dots').innerHTML = '<span></span>'.repeat(run.stage.waves.length);
    }
    const seconds = Math.floor((run.stage.timeLimit?Math.max(0,run.stage.timeLimit-run.elapsed):run.elapsed) / 1000);
    $('elapsed').parentElement.classList.toggle('time-limit',!!run.stage.timeLimit);
    $('elapsed').parentElement.dataset.tip=run.stage.timeLimit?'制限時間 / 残り時間':'';
    text('elapsed', String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0'));
    const total = run.stage.total + run.extraEnemies;
    text('kill-count', run.kills + ' / ' + total);
    $('stage-progress').style.width = Math.min(100, run.kills / total * 100) + '%';
    text('battle-state', !started ? 'READY' : !playing ? 'PAUSED' : run.status === 'victory' ? 'CLEAR' : run.status === 'defeat' ? 'DEFEATED' : 'AUTO BATTLE');
    [...$('wave-dots').children].forEach((dot, i) => {
      dot.className = i < run.wave ? 'complete' : i === run.wave ? 'active' : '';
    });
    refreshSkillCooldowns(false);
    const bosses = run.enemies.filter(e => e.boss && e.hp > 0), gate = bosses.find(e => e.dimensionalGate);
    $('boss-hud').hidden = !started || !bosses.length;
    if (bosses.length) {
      if(run.stage.final){const e=bosses[0];text('boss-name',e.name+' · '+(e.phaseChangeAt!=null?'覚醒':e.goddessPhase===2?'II 浮遊':'I 御座')+' · '+(100*e.hp/e.maxHp).toFixed(1)+'%');$('boss-hp-fill').style.width=100*e.hp/e.maxHp+'%';return;}
      const batches = gate ? SpecialStages.definition(run.stage.id).BATCHES : null;
      const summonRound = gate ? Math.max(1, gate.gateBatch + (['opening','summoning'].includes(gate.gatePhase) ? 1 : 0)) : 0;
      text('boss-name', gate ? gate.name + ' · ' + (gate.gatePhase === 'shattering' ? '崩壊' : '召喚 ' + Math.min(batches[gate.gateTier].length, summonRound) + ' / ' + batches[gate.gateTier].length) : bosses.map(e => e.name).join(' / '));
      const budget = gate ? batches[gate.gateTier].flat().length : 0;
      // Completed tiers include their summoned enemies and one shattered gate each.
      const previousKills = gate ? batches.slice(0, gate.gateTier).reduce((sum, tier) => sum + tier.flat().length + 1, 0) : 0;
      $('boss-hp-fill').style.width = (gate ? Math.max(0, 1 - (run.kills - previousKills) / budget) : bosses.reduce((a, e) => a + e.hp, 0) / bosses.reduce((a, e) => a + e.maxHp, 0)) * 100 + '%';
    }
  }
  function showMenu(which, stageId, museumFocus) {
    museumUI.stop();
    if (resultShown && !$('result-overlay').hidden) resultNavigation = true;
    if (stageId) viewedStage = stageId;
    else if (which === 'stages') viewedStage = save.selectedStage;
    menu = which;
    if (which === 'gems') gemFilter = 'gem';
    const titles = { stages: ['WORLD MAP / CHAPTER 01', '始まりの森'], character: ['ADVENTURERS / STATUS', '能力'], skills: ['ADVENTURERS / GROWTH', 'スキル'], forge: ['ADVENTURERS / GROWTH', '鍛冶'], gems: ['EQUIPMENT / GEMS', 'ジェム'], inventory: ['COLLECTION / INVENTORY', 'アイテム'], museum: ['COLLECTION / MOTIONS & EFFECTS', '資料館'], options: ['OPTIONS', '設定'] };
    $('menu-dialog').classList.toggle('growth-dialog', ['character', 'skills', 'forge'].includes(which));
    $('menu-dialog').classList.toggle('museum-dialog', which === 'museum');
    text('menu-kicker', titles[which][0]); text('menu-title', titles[which][1]);
    if (which === 'stages') renderStages(); else if (which === 'museum') museumUI.mount(museumFocus); else if (['character', 'skills', 'forge'].includes(which)) growthUI.render(which); else if (which === 'options') renderOptions(); else renderInventory();
    $('menu-dialog').append($('tooltip'), $('notification'));
    if (!$('menu-dialog').open) $('menu-dialog').showModal();
    $('tooltip').hidden = true;
  }
  function refreshOpenMenu() {
    if (!$('menu-dialog').open || menu === 'museum') return;
    const content = $('menu-content'), active = document.activeElement;
    const selection = typeof active.selectionStart === 'number' ? [active.selectionStart, active.selectionEnd] : null;
    const attribute = content.contains(active) ? [...active.attributes].find(a => a.name.startsWith('data-')) : null;
    const selector = attribute ? '[' + attribute.name + '="' + CSS.escape(attribute.value) + '"]' : null;
    const scroll = [content, ...content.querySelectorAll('.tree-viewport,.attributes-view')].map(node => [node.scrollLeft, node.scrollTop]);
    if (['character', 'skills', 'forge'].includes(menu)) growthUI.render();
    else if (menu === 'stages') renderStages();
    else if (menu === 'options') renderOptions();
    else renderInventory();
    [content, ...content.querySelectorAll('.tree-viewport,.attributes-view')].forEach((node, i) => {
      if (scroll[i]) { node.scrollLeft = scroll[i][0]; node.scrollTop = scroll[i][1]; }
    });
    if (selector) {
      const replacement = content.querySelector(selector);
      replacement?.focus({ preventScroll: true });
      if (selection) replacement?.setSelectionRange(...selection);
    }
    $('tooltip').hidden = true;
  }
  function refreshAutoControls() {
    const label = { off: 'OFF', same: '周回', advance: '進行' }[save.autoMode];
    $('repeat-button').setAttribute('aria-pressed', String(save.autoMode !== 'off'));
    $('repeat-button').dataset.tip = '自動周回：' + label + '\n設定を開く';
    $('result-auto').textContent = '自動周回 · ' + label;
    $('result-auto').setAttribute('aria-pressed', String(save.autoMode !== 'off'));
  }
  function renderOptions() {
    $('menu-content').innerHTML = '<div class="options-page"><h3>' + icon('repeat') + '自動周回</h3><div class="auto-modes">' + [['same', 'repeat', '周回'], ['advance', 'arrow', '進行'], ['off', 'pause', 'OFF']].map(([mode, img, label]) => '<button data-auto-mode="' + mode + '" aria-pressed="' + (save.autoMode === mode) + '" data-tip="' + (mode === 'advance' ? 'クリアすると次へ。敗北すると1つ前のステージで周回。' : mode === 'same' ? '同じステージを周回。敗北すると1つ前のステージで周回。' : '結果画面で停止') + '">' + icon(img) + '<span>' + label + '</span></button>').join('') + '</div>' + (P.Gem.unlocked(save) ? gemDismantleUI.renderOptions() : '') + (ForestAutoGear.unlocked(save) ? autoGearUI.render() : '') + '<div class="options-reset" data-tip="育成・所持品・進行をすべて初期化"><div><h3>初期化</h3></div><button class="reset-save-button" data-reset-save>' + icon('repeat') + '初期化</button></div></div>';
  }
  function resetSave() {
    try {
      resetting = true; localStorage.setItem(SAVE_KEY, JSON.stringify(freshSave()));
      setPlaying(false); location.reload();
    } catch { resetting = false; $('reset-dialog').close(); notify('セーブをリセットできませんでした'); }
  }
  function stageDetail() {
    const stage = STAGES.find(s => s.id === viewedStage), unlocked = isUnlocked(save, viewedStage);
    const first = !save.cleared.includes(viewedStage);
    if(stage.final)return '<p class="eyebrow">FINAL ENCOUNTER'+(first?'':' · CLEARED')+'</p><h3>'+stage.name+'</h3>'+(ForestData.enemyDiscovered(save,GoddessData.ID)?'<div class="goddess-stage-art"><img src="'+enemyImage(GoddessData.ID)+'" alt="'+stage.name+'"></div>':'')+'<div class="detail-line"><span>'+icon('clock')+' 03:00</span></div><button class="primary-button" data-enter="'+stage.id+'"'+(!unlocked||!ready?' disabled':'')+'>'+icon(unlocked?'sword':'lock')+'開始</button>';
    if (stage.special) {
      const config=SpecialStages.definition(stage.id),regions=REGIONS.filter(r=>stage.materialRegions.includes(r.id));
      return '<p class="eyebrow">SPECIAL' + (first ? '' : ' · CLEARED') + '</p><h3>' + stage.name + '</h3><div class="special-wave-preview">' + stage.waves.map((ids, i) => ForestData.enemyDiscovered(save,ids[0]) ? '<div data-tip="' + config.NAMES[i] + ' / ' + (['雑魚','ボス','大ボス'][i] + config.BATCHES[i][0].length + '体 × ' + config.BATCHES[i].length + '回') + '" tabindex="0"><img src="' + enemyImage(ids[0]) + '" alt=""><strong>' + config.NAMES[i] + '</strong><small>' + (config.BATCHES[i][0].length + ' × ' + config.BATCHES[i].length) + '</small></div>' : '').join('') + '</div><div class="special-drop-preview"><span data-tip="' + stage.materialRegions.join('・') + '地域の素材" tabindex="0">' + regions.filter(r => ForestData.itemDiscovered(save,ITEMS.find(i=>i.id===r.crystal))).map(r => '<img src="' + itemImage(r.crystal) + '" alt="' + r.name + '">').join('') + '</span><span data-tip="ジェムドロップ率2倍 / ドロップLv.' + stage.dropLevel + '" tabindex="0">' + icon('gem') + '<b>×2</b><small>Lv.' + stage.dropLevel + '</small></span></div><button class="primary-button" data-enter="' + stage.id + '"' + (!unlocked || !ready ? ' disabled' : '') + '>' + icon(unlocked ? 'sword' : 'lock') + (unlocked ? '開始' : '未解放') + '</button><span class="locked-message">' + (unlocked ? '' : stage.unlockLabel + ' クリア') + '</span>';
    }
    return '<p class="eyebrow">STAGE ' + stage.region + ' — ' + String(stage.number).padStart(2, '0') +
      (save.cleared.includes(stage.id) ? ' · CLEARED' : '') + '</p><h3>' + stage.name + '</h3>' +
      '<div class="detail-line"><span>ENCOUNTERS</span><span>' + 'Lv.' + stage.level + ' · ' + stage.total + '体 / ' + stage.waves.length + ' WAVE</span></div><div class="encounter-list">' +
      enemyChips(stage.enemies) + '</div><div class="detail-line"><span>CLEAR REWARD</span>' +
      (first ? '<span>初回 + <img class="inline-potion" src="' + itemImage('potion') + '" alt="回復薬" style="width:15px;height:15px;vertical-align:middle"></span>' : '') +
      '</div><div class="reward-preview"><img src="' + itemImage('gold') + '" alt="ゴールド"><b>' + stage.reward +
      '</b>' +
      ([4,10,20,30,40].includes(stage.id) && !first ? '<span class="recruit-reward" data-tip="'+(stage.id===40?'巫女':stage.id===30?'呪術師':stage.id===4?'魔法使い':stage.id===20?'忍者':'パラディン')+(first?' · 初回クリアで加入':' · 加入済み')+'"><img src="assets/'+(stage.id===40?'miko':stage.id===30?'shaman':stage.id===4?'mage':stage.id===20?'ninja':'paladin')+'/idle-01.png" alt="'+(stage.id===40?'巫女':stage.id===30?'呪術師':stage.id===4?'魔法使い':stage.id===20?'忍者':'パラディン')+'">'+(first?'加入':'加入済み')+'</span>' : '') + '</div><button class="primary-button" data-enter="' + stage.id + '"' + (!unlocked || !ready ? ' disabled' : '') + '>' +
      icon(unlocked ? 'sword' : 'lock') + (unlocked ? '開始' : '未解放') +
      '</button><span class="locked-message">' + (!unlocked ? stageLabel(stage.id - 1) + ' クリア' : '') + '</span>';
  }
  function renderStages() {
    if (!ForestData.stageVisible(save, STAGES.find(s => s.id === viewedStage))) viewedStage = save.selectedStage;
    const selected = STAGES.find(s => s.id === viewedStage), region = REGIONS[selected.region - 1];
    text('menu-kicker', selected.special ? 'SPECIAL / ' + selected.english : 'WORLD MAP / CHAPTER ' + String(region.id).padStart(2, '0')); text('menu-title', selected.special ? selected.realmName : region.name);
    const stages = (selected.special ? SPECIAL_STAGES : STAGES.filter(s => !s.special && s.region === region.id)).filter(s => ForestData.stageVisible(save, s));
    $('menu-content').innerHTML = '<div class="region-tabs" role="group" aria-label="地域を選択">' + REGIONS.filter(r => ForestData.regionVisible(save,r.id)).map(r => '<button data-stage-region="' + r.id + '" aria-pressed="' + (!selected.special && r.id === region.id) + '" data-tip="' + r.name + ' · Lv.' + ((r.id - 1) * 10 + 1) + '〜' + r.id * 10 + '">' + (!isUnlocked(save, (r.id - 1) * 10 + 1) ? icon('lock') : icon('map')) + r.name + '</button>').join('') + (SPECIAL_STAGES.some(s=>ForestData.stageVisible(save,s)) ? '<button class="special-tab" data-special-stages aria-pressed="' + !!selected.special + '">' + icon('spark') + '特殊</button>' : '') + '</div><div class="stage-menu' + (selected.special ? ' special-stage-menu' : '') + '"><div class="stage-map" data-region="' + (selected.special ? 'special' : region.id) + '" aria-label="ステージを選択">' +
      stages.map(stage => nodeMarkup(stage, viewedStage)).join('') + '</div><div class="stage-detail">' + stageDetail() + '</div></div>';
    if(selected.special){const map=$('menu-content').querySelector('.stage-map');map.dataset.special=selected.id;map.style.backgroundImage='linear-gradient(#160b3266,#241a4677),url("'+selected.asset+'background.png")';}
  }
  function itemTip(item) {
    const gem = item?.type==='gem' ? item : null;
    const costs = gem ? '\n基本容量：' + Object.entries(gem.costs || { [gem.direction]: gem.cost }).map(([d, n]) => (d === 'dedicated' ? P.CHARACTERS[gem.jobs[0]].name : { attack: '攻撃', defense: '防御', utility: '補助' }[d]) + ' ' + n).join(' / ') : '';
    return RARITIES[item.rarity].name + ' · ' + item.name + '\n' + item.note + costs + (gem ? '' : '\n所持数 ' + (save.inventory[item.id] || 0));
  }
  function itemMarkup(item, equipment = false) {
    const count = save.inventory[item.id] || 0;
    return '<button class="item-cell ' + (!count ? 'unowned ' : '') + (selectedItem === item.id && menu === 'inventory' ? 'selected' : '') +
      '" data-rarity="' + item.rarity + '" data-item="' + item.id + '" data-tip="' + itemTip(item) + '" aria-label="' + item.name +
      ' · 所持数 ' + count + '"><img src="' + itemImage(item.id) + '" alt="">' + (item.slot ? '<svg class="equipped"><use href="#i-check"/></svg>' : '') +
      (!equipment ? '<b>' + count + '</b>' : '') + '</button>';
  }
  function renderInventory() {
    if (renderingInventory) return;
    renderingInventory = true;
    try { renderInventoryContent(); } finally { renderingInventory = false; }
  }
  function renderInventoryContent() {
    const filter = menu === 'gems' ? gemFilter : inventoryFilter;
    const filters = menu === 'gems' ? [['gem', '装備'], ...(P.Gem.unlocked(save) ? [['gem-workshop', '工房'], ['gem-dismantle', '一括解体']] : [])] : [['material', '所持品'], ['conversion', '変換・購入']];
    if (menu === 'gems') text('menu-title', 'ジェム');
    if (filter === 'gem-dismantle') {
      $('menu-content').innerHTML = '<div class="inventory-menu"><div class="inventory-toolbar"><div class="inventory-filters">' + filters.map(([id, label]) => '<button data-filter="' + id + '" aria-pressed="' + (filter === id) + '">' + label + '</button>').join('') + '</div></div>' + gemWorkshop.wallet() + gemDismantleUI.renderBulk() + '</div>'; return;
    }
    if(filter==='gem-workshop'){
      $('menu-content').innerHTML='<div class="inventory-menu"><div class="inventory-toolbar"><div class="inventory-filters">'+filters.map(([id,label])=>'<button data-filter="'+id+'" aria-pressed="'+(filter===id)+'">'+label+'</button>').join('')+'</div></div>'+gemWorkshop.render()+'</div>';return;
    }
    if (filter === 'conversion') {
      $('menu-content').innerHTML = '<div class="inventory-menu"><div class="inventory-toolbar"><div class="inventory-filters" aria-label="分類">' +
        filters.map(([id, label]) => '<button data-filter="' + id + '" aria-pressed="' + (filter === id) + '">' + label + '</button>').join('') +
        '</div></div><div id="material-conversion"></div></div>';
      conversionUI.render($('material-conversion'));
      return;
    }
    const items = ITEMS.filter(item => item.type !== 'gem' && ForestData.itemDiscovered(save, item)).sort((a, b) => RARITIES[a.rarity].rank - RARITIES[b.rarity].rank);
    const target = save.progression.selected, isGem = filter === 'gem';
    const gemList = isGem ? ForestGemInventory.query(save, target, inventorySlot, gemView) : null;
    if (gemList) gemOwners = gemList.owners;
    const instances = gemList ? [...gemList.equipped, ...gemList.bag].map(row => row.gem) : [];
    const targets = '<div class="inventory-gem-target"><div class="gem-target-characters" role="group" aria-label="ジェムを装備するキャラクター">' + Object.entries(P.CHARACTERS).filter(([id]) => P.unlocked(save, id)).map(([id, c]) => '<button data-inventory-character="' + id + '" data-tip="' + c.name + 'のジェム" aria-label="' + c.name + 'に装着" aria-pressed="' + (target === id) + '"><img src="assets/' + id + '/idle-01.png" alt="' + c.name + '"></button>').join('') + '</div><div role="group" aria-label="ジェムを装備する部位">' + [['weapon', 'sword', '武器'], ['armor', 'shield', '防具']].map(([slot, img, label]) => '<button data-inventory-slot="' + slot + '" aria-pressed="' + (inventorySlot === slot) + '">' + icon(img) + label + '</button>').join('') + '</div><span tabindex="0" data-tip="右クリックで装着 / 解除。">' + icon('spark') + '</span></div>';
    $('menu-content').innerHTML = '<div class="inventory-menu"><div class="inventory-toolbar"><div class="inventory-filters" aria-label="分類">' +
      filters.map(([id, label]) => '<button data-filter="' + id + '" aria-pressed="' + (filter === id) + '">' + label + '</button>').join('') +
      '</div><span>' + (isGem ? save.gems.length + ' 個' : items.filter(i => save.inventory[i.id] > 0).length + ' / ' + items.length) + '</span></div>' + (isGem ? targets + inventoryCapacity(target, inventorySlot) : '') + (isGem ? gemInventoryMarkup(gemList) : '<div class="rarity-legend">' + Object.entries(RARITIES).filter(([rarity]) => items.some(i=>i.rarity===rarity)).map(([id, r]) => '<span data-rarity="' + id + '">◆ ' + r.name + '</span>').join('') + '</div><div class="inventory-grid">' + items.map(item => itemMarkup(item)).join('') + '</div>') +
      '<div id="inventory-selection" class="inventory-selection"></div></div>';
    if (isGem && !instances.some(g => g.id === Number(selectedGem))) selectedGem = instances[0]?.id;
    if (!isGem && !items.some(item => item.id === selectedItem)) selectedItem = items[0]?.id;
    renderInventorySelection();
  }
  function gemInventoryMarkup(list) {
    const target = save.progression.selected, part = slot => slot === 'weapon' ? '武器' : '防具';
    const cells = rows => rows.map(row => gemMarkup(row.gem, row.info)).join('');
    const options = (key, rows) => rows.map(([value, label]) => '<option value="' + value + '"' + (String(gemView[key]) === value ? ' selected' : '') + (key === 'sort' && value === 'effect' && gemView.effect === 'all' ? ' disabled' : '') + '>' + escapeHTML(label) + '</option>').join('');
    const effects = [...new Set(save.gems.flatMap(g => g.options.map(o => o.key)))].map(key => [key, P.Gem.OPTIONS[key]?.name || P.Gem.Epic.DEFINITIONS[key]?.name || key]);
    const select = (key, label, rows) => '<label><span>' + label + '</span><select data-gem-view="' + key + '" aria-label="' + label + '">' + options(key, rows) + '</select></label>';
    return '<section class="gem-equipped-panel"><h3>' + icon(inventorySlot === 'weapon' ? 'sword' : 'shield') + P.CHARACTERS[target].name + ' · ' + part(inventorySlot) + (started && run.status === 'running' ? '<span class="next-run-hint" data-tip="ジェムの変更は次の戦闘開始時に反映">次戦反映</span>' : '') + '<small>装着中 ' + list.equipped.length + '</small></h3><div class="inventory-grid" data-equipped-gems>' + (cells(list.equipped) || '<p class="gem-empty">未装着</p>') + '</div></section>' +
      '<section class="gem-bag-panel"><h3>' + icon('bag') + '未装着<small>' + list.bag.length + ' / ' + list.totalBag + '</small></h3><div class="gem-list-controls"><label class="gem-search"><span>検索</span><input type="search" data-gem-view="search" aria-label="ジェムを検索" placeholder="効果・名前" value="' + escapeHTML(gemView.search) + '"></label>' +
      select('rarity', 'レア度', [['all', 'すべて'], ...Object.entries(RARITIES).filter(([id]) => P.Gem.rarityDiscovered(save, id)).map(([id, r]) => [id, r.name])]) +
      select('level', '地域Lv', [['all', 'すべて'], ...[...new Set(save.gems.filter(g => g.level).map(g => g.level))].sort((a, b) => a - b).map(n => [String(n), 'Lv.' + n])]) +
      select('effect', '効果', [['all', 'すべて'], ...effects]) +
      '<div class="gem-sort-controls">' + select('sort', '並び順', [['rarity', 'レア度'], ['level', '地域Lv'], ['newest', '入手順'], ['capacity', '必要容量'], ['effect', '効果値']]) +
      '<button class="gem-sort-direction" data-gem-sort-direction aria-label="' + (gemView.descending ? '降順' : '昇順') + '" data-tip="昇順 / 降順">' + (gemView.descending ? '↓' : '↑') + '</button></div><label class="gem-compatible"><input type="checkbox" data-gem-view="compatible"' + (gemView.compatible ? ' checked' : '') + '>装着可能</label><label class="gem-compatible"><input type="checkbox" data-gem-view="protectedOnly"' + (gemView.protectedOnly ? ' checked' : '') + '>保護のみ</label><button class="gem-filter-reset" data-reset-gem-filters data-tip="検索と絞り込みを解除">' + icon('repeat') + '条件解除</button></div><div class="inventory-grid" data-gem-bag>' + (cells(list.bag) || '<p class="gem-empty">該当なし</p>') + '</div></section>' +
      (list.otherGroups.length ? '<details class="gem-other-loadouts" data-other-loadouts' + (otherLoadoutsOpen ? ' open' : '') + '><summary>他装備 · ' + list.otherGroups.reduce((sum, group) => sum + group.gems.length, 0) + '個</summary>' + list.otherGroups.map(group => '<section><h3><img src="assets/' + group.character + '/idle-01.png" alt="">' + P.CHARACTERS[group.character].name + ' · ' + part(group.slot) + '</h3><div class="inventory-grid">' + cells(group.gems) + '</div></section>').join('') + '</details>' : '');
  }
  function inventoryCapacity(character, slot) {
    const { cap, used } = P.gemUsage(save, character, slot);
    return '<div class="inventory-capacities">' + [['attack', '攻撃'], ['defense', '防御'], ['utility', '補助'], ['common', '共通'],['dedicated',P.CHARACTERS[character].name]].filter(([dir])=>dir!=='dedicated'||cap.dedicated>0).map(([dir, label]) => '<span data-tip="' + label + '容量" tabindex="0">' + label + ' <b>' + (dir === 'common' ? used.common : Math.min(used[dir], cap[dir])) + ' / ' + cap[dir] + '</b></span>').join('') + '</div>';
  }
  function gemMarkup(instance, described) {
    const g = described || P.Gem.describe(instance), owner = gemOwners.get(instance.id);
    const ownerLabel = owner ? P.CHARACTERS[owner.character].name + ' · ' + (owner.slot === 'weapon' ? '武器' : '防具') : '未装着';
    return '<button class="item-cell gem-item ' + (owner ? 'equipped ' : '') + (Number(selectedGem) === instance.id ? 'selected' : '') + '" data-rarity="' + g.rarity + '" data-gem-instance="' + instance.id + '" data-tip="' + escapeHTML(itemTip({...g, type:'gem'})) + '\n' + ownerLabel + '\n右クリックで装着 / 解除" aria-label="' + g.name + ' · ' + ownerLabel + '"><img src="' + g.image + '" alt="' + g.name + '">' + (instance.rarity==='epic'?'':'<span class="gem-level">Lv.'+instance.level+'</span>')+(instance.locked?'<span class="gem-protected">◆</span>':'')+(owner ? '<span class="gem-owner-badge"><img src="assets/' + owner.character + '/idle-01.png" alt="' + P.CHARACTERS[owner.character].name + '">' + icon(owner.slot === 'weapon' ? 'sword' : 'shield') + '</span>' : '') + '</button>';
  }
  function toggleInventoryGem(uid) {
    selectedGem = Number(uid);
    if (P.toggleGem(save, save.progression.selected, inventorySlot, uid)) {
      invalidateBuilds(); persist(); refreshResources(); refreshGrowth(); renderInventory();
      document.querySelector('[data-gem-instance="' + uid + '"]')?.focus({ preventScroll: true });
    } else notify(P.Gem.describe(P.gemInstance(save,uid)).jobs.includes(save.progression.selected)?'容量不足':'装着対象外');
  }
  function renderInventorySelection() {
    if (menu === 'gems' && gemFilter === 'gem') {
      const instance = P.gemInstance(save, selectedGem), panel = $('inventory-selection');
      if (!instance || !panel) { if (panel) panel.hidden = true; return; }
      const gem = P.Gem.describe(instance), owner = P.gemOwner(save, instance.id);
      panel.hidden = false; panel.dataset.rarity = gem.rarity;
      panel.innerHTML = '<img src="' + gem.image + '" alt=""><div><strong>' + gem.name + '</strong><p>' + gem.note + '</p><small>' + (owner ? P.CHARACTERS[owner.character].name + ' · ' + (owner.slot === 'weapon' ? '武器' : '防具') : '未装着') + '</small></div><button class="secondary-button" data-toggle-inventory-gem="' + instance.id + '">' + icon(owner ? 'repeat' : inventorySlot === 'weapon' ? 'sword' : 'shield') + (owner ? '解除' : '装着') + '</button>'+gemWorkshop.actions(instance);
      document.querySelectorAll('[data-gem-instance]').forEach(button => button.classList.toggle('selected', Number(button.dataset.gemInstance) === instance.id));
      return;
    }
    const item = itemById(selectedItem); if (!item || !$('inventory-selection')) return;
    $('inventory-selection').dataset.rarity = item.rarity;
    $('inventory-selection').innerHTML = '<img src="' + itemImage(item.id) + '" alt=""><div><strong>' + item.name +
      '</strong><p><span class="rarity-label">' + RARITIES[item.rarity].name + '</span> · ' + (item.type === 'gem' ? 'ジェム' : 'ドロップ品') + (item.type === 'consumable' ? '<br>' + escapeHTML(item.note) : '') +
      '</p></div><span>× ' + format(save.inventory[item.id] || 0) + '</span>' +
      (item.id === 'potion' ? '<button class="secondary-button" data-use-potion' + (!started || run.status !== 'running' || !save.inventory.potion || run.hero.hp === run.hero.maxHp ? ' disabled' : '') + '>使用</button>' : '');
    $('inventory-selection').dataset.tip = item.note;
    document.querySelectorAll('.inventory-grid [data-item]').forEach(button => button.classList.toggle('selected', button.dataset.item === selectedItem));
  }
  async function json(url) { const response = await fetch(url); if (!response.ok) throw new Error(url + ': ' + response.status); return response.json(); }
  async function image(url) {
    return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(url)); img.src = url; });
  }
  async function asset(base, path = 'manifest.json') {
    const data = await json(base + path);
    const directory = base + path.slice(0, path.lastIndexOf('/') + 1);
    return { data, image: await image(directory + data.sheet) };
  }
  async function loadCharacter(id = 'warrior') {
    const base = 'assets/' + id + '/';
    const index = await json(base + 'motions/index.json');
    const motions = id === 'warrior' ? ['forward', 'jump', 'attack-overhead', 'attack-far-to-near', 'attack-near-to-far', 'hit', 'down'] : ['forward', 'hit', 'down', ...(id==='miko'?MikoSkills.MOTIONS:id==='shaman'?ShamanSkills.MOTIONS:id==='ninja'?NinjaSkills.MOTIONS:id==='paladin'?PaladinMotions.MOTIONS:MageMotions.MOTIONS)];
    return Object.fromEntries(await Promise.all([asset(base).then(value => ['idle', value]),
      ...motions.map(async motion => [motion, await asset(base + 'motions/', index.motions[motion])])]));
  }
  async function loadEnemy(id) {
    if (ENEMIES[id].dimensionalGate) return {};
    const base = 'assets/enemies/' + id + '/motions/';
    const list = await json(base + 'index.json');
    return Object.fromEntries(await Promise.all(list.map(async entry => [entry.id, await asset(base, entry.manifest)])));
  }
  function drawAsset(asset, elapsed, x, y, scale = 1, flip = false, alpha = 1) {
    const data = asset.data, time = data.loop || data.motion === 'idle' ? elapsed % data.durationMs : Math.min(elapsed, data.durationMs - 0.001);
    const frame = data.frames[MotionPlayback.frameAt(data, time)];
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1);
    if (scale === 1 && (alpha === .65 || alpha === .9) && ctx.filter.includes('hue-rotate')) {
      const cached = NinjaSkillRenderer.cachedFrame(asset, frame, ctx.filter, { blur: ctx.shadowBlur, color: ctx.shadowColor, x: ctx.shadowOffsetX, y: ctx.shadowOffsetY }, alpha);
      ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.globalAlpha = 1;
      ctx.drawImage(cached.image, -data.pivot.x - cached.padding, -data.pivot.y - cached.padding);
    } else {
      ctx.globalAlpha = alpha; ctx.drawImage(asset.image, frame.x, frame.y, frame.width, frame.height,
        -data.pivot.x * scale, -data.pivot.y * scale, frame.width * scale, frame.height * scale);
    }
    ctx.restore();
  }
  function drawActor(actor, ghostAlpha = 1) {
    if(actor.hidden)return;
    if(actor.goddess){GoddessRenderer.draw(ctx,actor,run,sprites,drawAsset,reduced);return;}
    if (actor.dimensionalGate) { RiftRenderer.gate(ctx, actor, run.time + previewTime, reduced); return; }
    if(actor.bodyPart){
      if(actor.hp<=0)return;
      drawAsset(effectSprites[actor.bodyPart],actor.time,actor.x,actor.y,actor.scale,false,actor.flash>0?.6:1);
      ImageEffects.ring(ctx,reduced?0:run.time,actor.x,actor.y,32,9,'#ffe6a2',.75);return;
    }
    const isHero = !ENEMIES[actor.type], scale = isHero ? 1 : actor.scale;
    const magePose = actor.mageCast ? null : MageMotions.actorPose(actor);
    const hurt=actor.hp>0&&actor.region>=3&&actor.hurtUntil>run.time&&!actor.expansionPlan&&!actor.ruinsPlan&&!actor.desertPlan&&!actor.highlandPlan&&!actor.glacierPlan&&!actor.volcanoPlan&&!actor.castlePlan;
    const sprite = sprites[actor.type][hurt?'hit':magePose?.motion || actor.motion] || sprites[actor.type].idle;
    const riftProgress = Number.isFinite(actor.riftBornAt) ? Math.min(1, (run.time - actor.riftBornAt) / 450) : 1;
    const alpha = ghostAlpha * (.15 + riftProgress * .85) * (actor.hp <= 0 ? Math.max(0, 1 - Math.max(0, actor.time - 1000) / 900) : actor.flash > 0 ? Math.floor(actor.flash / 45) % 2 ? 0.55 : 1 : 1);
    if (alpha <= 0) return;
    ctx.save(); ctx.fillStyle = ghostAlpha<1?'#15251822':'#15251855'; ctx.beginPath();
    ctx.ellipse(actor.x, actor.y, actor.boss ? 55 : isHero ? ghostAlpha<1?17:25 : 28, actor.boss ? 9 : 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const normalClock=actor.time*actor.attackSpeed*(1+(actor.normalEnhance||0)*.03);
    const normalFrame=normalClock<160?normalClock/160*340:340+Math.min(1,(normalClock-160)/260)*340;
    let elapsed = !started ? previewTime : magePose ? magePose.time : actor.warriorCast||actor.mageCast||actor.paladinCast||actor.ninjaCast||actor.shamanCast||actor.mikoCast ? actor.motionTime : actor.type==='warrior'&&actor.state==='attacking'?normalFrame:actor.type==='ninja'&&ghostAlpha<1?actor.motionTime:actor.time;
    if(actor.highlandPlan){const p=actor.highlandPlan,first=sprite.data.events?.[0]?.timeMs??sprite.data.durationMs*.55;elapsed=p.kind==='rest'?p.elapsed:p.elapsed<p.warn?first*Math.min(.999,p.elapsed/p.warn):Math.min(sprite.data.durationMs-.001,first+(sprite.data.durationMs-first)*(p.elapsed-p.warn)/Math.max(1,p.duration-p.warn));}
    if(actor.glacierPlan)elapsed=GlacierRenderer.motionTime(actor.glacierPlan,sprite.data);
    if(actor.castlePlan)elapsed=DemonCastleRenderer.motionTime(actor.castlePlan,sprite.data);
    if(actor.volcanoPlan)elapsed=VolcanoRenderer.motionTime(actor.volcanoPlan,sprite.data);
    const height=(actor.z||0)+(actor.airUntil>run.time?Math.sin((run.time-actor.airStart)/(actor.airUntil-actor.airStart)*Math.PI)*actor.airHeight:0);
    const casting = started && actor.type === 'mage' && actor.hp > 0 && ['attacking', 'skill'].includes(actor.state);
    if (casting && actor.state === 'skill') drawAsset(effectSprites['mage-chant-aura'], reduced ? 0 : actor.time * actor.attackSpeed, actor.x, actor.y, .8, false, alpha * .8);
    ctx.save();
    // The existing normal throw has an embedded star in frame 2. Clip only that
    // detached star; the separately swept projectile owns display and damage.
    if(actor.type==='ninja'&&sprite.data.motion==='attack-shuriken'&&elapsed>=180&&elapsed<280){ctx.beginPath();ctx.rect(actor.facing>0?-5000:actor.x-87,-5000,actor.facing>0?5000+actor.x+87:5000,10000);ctx.clip();}
    if(!reduced&&actor.type==='storm-jackal'&&actor.highlandPlan?.motion==='charge'&&actor.highlandPlan.elapsed>=actor.highlandPlan.warn){for(let i=3;i>0;i--)drawAsset(sprite,elapsed,actor.x-actor.facing*i*20,actor.y-height,scale,actor.facing>0,alpha*.22/i);}
    drawAsset(sprite, hurt?run.time-actor.hurtAt:elapsed, actor.x, actor.y-height+(actor.desertDepth||0)+(1-riftProgress)*24, scale, isHero ? actor.facing < 0 : actor.facing > 0, alpha);
    ctx.restore();
    if(started&&actor.hp>0&&actor.bleed)for(let i=0;i<2;i++)ImageEffects.sprite(ctx,'streak',reduced?0:run.time,actor.x+i*8,actor.y-actor.height*.55,32,12,'#ff6381',1,Math.PI/4);
    if (started && actor.hp > 0) {
      if (actor.poison) {
        ImageEffects.ring(ctx,reduced?0:run.time,actor.x,actor.y,29,8,'#b7ef5e',.9);
      }
      if (actor.rootAnchor) drawAsset(effectSprites['mud-bind'], actor.time, actor.x, actor.y, .5);
      if(actor.webUntil>run.time)drawAsset(effectSprites['spider-web-slow'],run.time,actor.x,actor.y,.7);
      if(actor.sandSlowUntil>run.time){drawAsset(effectSprites['desert-sand-burst'],run.time,actor.x,actor.y,.36);ImageEffects.ring(ctx,reduced?0:run.time,actor.x,actor.y,31,10,'#f9cb71',.85);}
      if(actor.blindUntil>run.time)drawAsset(effectSprites['ink-blind'],run.time,actor.x,actor.y-110,.5);
      if(actor.bubbleUntil>run.time)drawAsset(effectSprites['bubble-prison'],run.time,actor.x,actor.y,.68);
      if(actor.expansionPlan&&!actor.actionInterference&&!['rest','shell','spin'].includes(actor.motion)){
        const aim=actor.expansionPlan.aim;ctx.save();ctx.strokeStyle=actor.region===3?'#daa2ff':'#88edff';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(aim.x,aim.y,actor.motion==='breath'?100:70,22,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      if(actor.ruinsPlan&&!actor.actionInterference)drawRuinsTelegraph(actor);
      if (actor.type === 'hydra' && actor.motion === 'charge') drawAsset(effectSprites['hydra-poison-aura'], actor.time, actor.x, actor.y - 65, .8, actor.facing > 0, .75);
      if (actor.swampPlan && !actor.actionInterference && ['chant', 'windup'].includes(actor.motion)) {
        const aim = actor.swampPlan.aim;
        ctx.save(); ctx.strokeStyle = actor.motion === 'chant' ? '#d29bff' : '#f4b077'; ctx.fillStyle = '#b16af326'; ctx.lineWidth = 2;
        ctx.setLineDash([8, 5]); ctx.beginPath(); ctx.ellipse(aim.x, aim.y, 110, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    }
    if (ghostAlpha===1 && actor.hp > 0 && started && !actor.boss) {
      const width = isHero ? 58 : 38, y = actor.y - (isHero ? 155 : actor.height + 14)-height;
      ctx.fillStyle = '#102015cc'; ctx.fillRect(actor.x - width / 2 - 1, y - 1, width + 2, 6);
      ctx.fillStyle = isHero ? '#bde79b' : '#e0ab73'; ctx.fillRect(actor.x - width / 2, y, width * actor.hp / actor.maxHp, 3);
    }
    if (actor.state === 'windup' && !actor.actionInterference) {
      ctx.save(); ctx.strokeStyle = '#f3a37b'; ctx.fillStyle = '#f6a16d22'; ctx.lineWidth = 2;
      ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.ellipse(run.hero.x, run.hero.y, 85, 25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }
  function drawRuinsTelegraph(actor){const p=actor.ruinsPlan;if(!p.power||p.next>=p.times.length)return;ctx.save();ctx.strokeStyle='#94e8ff';ctx.fillStyle='#80d5ff18';ctx.lineWidth=2;ctx.setLineDash([7,5]);
    if(p.motion==='beam'){ctx.beginPath();ctx.moveTo(p.origin.x,p.origin.y-45);const dx=p.aim.x-p.origin.x,dy=p.aim.y-p.origin.y,len=Math.hypot(dx,dy)||1;ctx.lineTo(p.origin.x+dx/len*650,p.origin.y-45+dy/len*650);ctx.stroke();}
    else for(const point of p.points.slice(p.next)){ctx.beginPath();ctx.ellipse(point.x,point.y,p.radius||32,(p.radius||32)*.28,0,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.restore();
  }
  function drawRuinsEffect(e,age){const sprite=effectSprites[e.effect];if(!sprite)return;
    if(e.effect==='ruins-furnace-beam'){if(age>(e.duration||500))return;ctx.save();ctx.translate(e.x,e.y-65);ctx.rotate((e.angle||0)+Math.PI);drawAsset(sprite,age,0,0,2.1);ctx.restore();}
    else drawAsset(sprite,age,e.x,e.y,e.effect==='ruins-light-pillar'?1.15:e.effect==='ruins-vent-steam'?.9:.7,e.facing>0);
  }
  function drawRuinsProjectiles(){for(const p of run.ruinsProjectiles){const asset=effectSprites['ruins-'+p.fx];if(!asset)continue;ctx.save();ctx.translate(p.x,p.y-35);ctx.rotate(Math.atan2(p.to.y-p.origin.y,p.to.x-p.origin.x)+Math.PI);drawAsset(asset,p.age,0,0,p.fx==='cannon-shell'?.55:.42);ctx.restore();}}
  function drawDesertTelegraphs(){for(const actor of run.enemies){const p=actor.desertPlan;if(actor.hp<=0||!p||p.kind==='rest'||p.kind==='summon'||actor.actionInterference||p.elapsed>=p.warn)continue;
    const progress=Math.min(1,p.elapsed/p.warn),color=p.status==='poison'?'#a3fa60':['line','ground'].includes(p.kind)?'#77f6e4':'#ffd08b';ctx.save();ctx.lineWidth=3;ctx.strokeStyle=color;ctx.fillStyle=color+'18';ctx.setLineDash([9,6]);
    if(['line','charge','fissure'].includes(p.kind)){let ends=p.kind==='fissure'?DesertCombat.fissures(p):[p.aim];for(let end of ends){if(p.kind==='line'){const angle=Math.atan2(end.y-p.origin.y,end.x-p.origin.x);end={x:p.origin.x+Math.cos(angle)*650,y:p.origin.y+Math.sin(angle)*650};}const angle=Math.atan2(end.y-p.origin.y,end.x-p.origin.x),nx=Math.sin(angle)*p.radius,ny=-Math.cos(angle)*p.radius;ctx.beginPath();ctx.moveTo(p.origin.x+nx,p.origin.y+ny);ctx.lineTo(end.x+nx,end.y+ny);ctx.lineTo(end.x-nx,end.y-ny);ctx.lineTo(p.origin.x-nx,p.origin.y-ny);ctx.closePath();ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(p.origin.x,p.origin.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([9,6]);}}
    else {const points=p.kind==='ground'?p.points:p.kind==='arc'?[p.origin]:p.kind==='burrow'?[p.landing]:[p.aim];for(const point of points){const radius=p.radius||32;ctx.beginPath();ctx.arc(point.x,point.y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=5;ctx.beginPath();ctx.arc(point.x,point.y,radius,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);ctx.stroke();ctx.lineWidth=3;ctx.setLineDash([9,6]);}}
    ctx.restore();}}
  function drawDesertEffect(e,age){const asset=effectSprites[e.effect];if(!asset)return;if(e.line){const len=Math.hypot(e.to.x-e.x,e.to.y-e.y),angle=Math.atan2(e.to.y-e.y,e.to.x-e.x);ctx.save();ctx.translate(e.x+Math.cos(angle)*len/2,e.y+Math.sin(angle)*len/2-(e.effect==='desert-royal-wave'?35:0));ctx.rotate(angle+Math.PI);ctx.scale(len/asset.data.frameWidth,1);drawAsset(asset,age,0,0,1);ctx.restore();}else drawAsset(asset,age,e.x,e.y,e.scale||.7,e.facing>0);}
  function drawDesertProjectiles(){for(const p of run.desertProjectiles){const asset=effectSprites['desert-'+p.fx];if(!asset)continue;ctx.save();ctx.translate(p.x,p.y-40);ctx.rotate(Math.atan2(p.to.y-p.origin.y,p.to.x-p.origin.x)+Math.PI);if(!reduced)ImageEffects.link(ctx,{x:38,y:0},{x:0,y:0},p.fx==='venom'?'#9ed94a':'#edcc81',.7,14,p.age);drawAsset(asset,Math.min(p.age,230),0,0,.3);ctx.restore();}}
  function drawHighlandProjectiles(){for(const p of run.highlandProjectiles){const asset=effectSprites['highland-'+p.fx];if(!asset)continue;ctx.save();ctx.translate(p.x,p.y-35);ctx.rotate(Math.atan2(p.to.y-p.origin.y,p.to.x-p.origin.x)+Math.PI);if(!reduced)ImageEffects.link(ctx,{x:42,y:0},{x:0,y:0},p.fx==='venom'?'#9deb58':'#b4faff',.8,20,p.age);drawAsset(asset,Math.min(p.age,240),0,0,.34);ctx.restore();}}
  function drawProjectiles() {
    for (const p of run.projectiles) {
      const t = Math.min(1, p.time / p.duration);
      if(p.expansion){
        const x=p.x+(p.tx-p.x)*t,y=p.y+(p.ty-65-p.y)*t-(p.kind==='rock-bolt'?Math.sin(t*Math.PI)*100:0);
        drawAsset(effectSprites[p.effect],p.time,x,y,.5,p.tx>p.x);continue;
      }
      if (p.kind === 'poison-bolt' || p.kind === 'energy-bolt') {
        const x = p.x + (p.tx - p.x) * t, y = p.y + (p.ty - 65 - p.y) * t;
        drawAsset(effectSprites[p.kind === 'poison-bolt' ? 'toad-poison-bolt' : 'lich-energy-bolt'], p.time, x, y, .46, p.tx > p.x);
        continue;
      }
      if (p.kind === 'wind') {
        const x = p.x + (p.tx - p.x) * t, y = p.y + (p.ty - p.y) * t;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.ty - p.y, p.tx - p.x));
        drawAsset(effectSprites['mage-wind-bolt'], reduced ? 0 : p.time * p.source.attackSpeed, 0, 0, p.skill ? .52 : .36);
        ctx.restore(); continue;
      }
      if (p.kind !== 'seed') {
        ctx.save(); ctx.fillStyle = '#f5a86322'; ctx.strokeStyle = '#eaba71'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(p.tx, p.ty, 80 * (0.8 + t * 0.2), 25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      if (p.kind === 'root') continue;
      const tx = p.tracking ? run.hero.x : p.tx, ty = p.tracking ? run.hero.y - 70 : p.ty;
      const x = p.x + (tx - p.x) * t, y = p.y + (ty - p.y) * t - (p.kind === 'fruit' ? Math.sin(t * Math.PI) * 140 : 0);
      const effect = p.kind === 'seed' ? effectSprites['alraune-seed-stream'] : effectSprites['fruit-bomb'];
      drawAsset(effect, 0, x, y, p.kind === 'seed' ? 0.42 : 0.8, tx > p.x);
    }
  }
  function drawEffects(dt) {
    effects = effects.filter(e => run.time - e.timeMs < (e.type === 'rift-effect' && e.kind === 'shatter' ? 1500 : e.type==='miko-effect'?1200:950));
    for (const e of effects) {
      const age = run.time - e.timeMs;
      if (e.type === 'slash' && age < 270 && !reduced) {
        ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.facing, 1);
        const radius = e.skill ? 164 : (e.range || HERO.range) - 30;
        WarriorSkillRenderer.sprite(ctx,warriorEffects.slash,age,34,0,radius*2,radius*1.3,-.25,(1-age/270)*.95);
        ctx.restore();
      } else if (e.type === 'wind' && age < 450) {
        drawAsset(effectSprites['mage-wind-impact'], age, e.x, e.y, e.skill ? .72 : .48, false, 1 - age / 450);
      } else if (['damage', 'heal'].includes(e.type)) {
        const progress = age / 950;
        ctx.save(); ctx.globalAlpha = Math.min(1, (1 - progress) * 2);
        ctx.font = (e.kind === 'curse-dot' ? 'bold 21px' : e.kind === 'curse-extra' ? '20px' : e.critical || e.skill ? 'bold 27px' : 'bold 20px') + ' Georgia,serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#1c291c'; const label = (e.type === 'heal' ? '+' : '') + e.amount;
        ctx.strokeText(label, e.x, e.y - 18 - progress * 52);
        ctx.fillStyle = e.type === 'heal' ? '#abed94' : e.kind === 'curse-dot' ? '#c29aff' : e.kind === 'curse-extra' ? '#f5e8c9' : e.source === 'shaman' ? '#b0f4e5' : e.source === 'paladin' ? '#ffe79e' : e.source === 'mage' ? '#a1eee6' : e.source === 'hero' ? e.critical || e.skill ? '#ffe198' : '#fff7db' : '#ffc4ab';
        ctx.fillText(label, e.x, e.y - 18 - progress * 52);
        if (e.critical) { ctx.font = '8px Arial'; ctx.fillStyle = '#ffdb97'; ctx.fillText('CRITICAL', e.x, e.y - 45 - progress * 52); }
        ctx.restore();
      } else if (e.type === 'impact' && e.kind !== 'seed' && age < 490) {
        drawAsset(effectSprites[e.kind === 'root' ? 'root-eruption' : 'explosion'], age, e.x, e.y, 0.85);
      } else if(e.type==='gem-effect'&&age<650){
        const color=e.kind==='resistance'?'#79ffc4':e.kind==='siphon'?'#92f6e5':'#ffd774';
        ImageEffects.ring(ctx,reduced?0:age,e.x,e.y-35,18+age/13,26+age/16,color,1-age/650);
        if(e.from)ImageEffects.link(ctx,{x:e.from.x,y:e.from.y-50},{x:e.x,y:e.y-35},color,1-age/650,20,reduced?0:age);
      } else if(e.type==='goddess-effect'){GoddessRenderer.effect(ctx,e,age,sprites,effectSprites,drawAsset,reduced);} else if(e.type==='rift-effect'){RiftRenderer.effect(ctx,e,age,reduced);} else if(e.type==='castle-effect'){DemonCastleRenderer.effect(ctx,e,age,effectSprites,drawAsset);} else if(e.type==='volcano-effect'){VolcanoRenderer.effect(ctx,e,age,effectSprites,drawAsset);} else if(e.type==='glacier-effect'){GlacierRenderer.effect(ctx,e,age,effectSprites,drawAsset);} else if(e.type==='highland-effect'){drawAsset(effectSprites[e.effect],age,e.x,e.y,e.scale||.7,e.facing>0);} else if(e.type==='desert-effect'){drawDesertEffect(e,age);} else if(e.type==='ruins-effect'){drawRuinsEffect(e,age);} else if(e.type==='miko-block'){ctx.fillStyle='#fff0ad';ctx.font='bold 14px serif';ctx.fillText('◆ '+e.amount,e.x,e.y-70-age*.025);} else if (e.type === 'expansion-effect') {
        drawAsset(effectSprites[e.effect],age,e.x,e.y,e.scale||.7,e.facing>0);
      } else if(['part-emerge','part-hit','part-retract'].includes(e.type)){
        drawAsset(effectSprites[run.stage.region===3?'cave-quake':'sea-slam'],age,e.x,e.y,e.type==='part-hit'?.45:.6);
      } else if(e.type==='miss'){
        ctx.save();ctx.globalAlpha=1-age/950;ctx.font='bold 15px sans-serif';ctx.fillStyle='#c3d0e0';ctx.textAlign='center';ctx.fillText('MISS',e.x,e.y-age/25);ctx.restore();
      } else if (e.type === 'swamp-effect') {
        drawAsset(effectSprites[e.effect], age, e.x, e.y, e.effect === 'lich-dark-magic' ? .85 : e.effect === 'hydra-poison-breath' ? .72 : .55, e.facing > 0);
      } else if (e.type === 'summon' && age < 500) {
        ImageEffects.ring(ctx,reduced?0:age,e.x,e.y,25+age/20,10+age/70,e.kind==='skeleton'?'#cf9eff':'#a5e7db',1-age/500);
      }
    }
    particles = particles.filter(p => p.age < p.life);
    for (const p of particles) {
      p.age += dt; p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; p.vy += dt * 0.2;
      ImageEffects.mote(ctx,p.x,p.y,p.size*3,p.color,Math.max(0,1-p.age/p.life),p.age);
    }
  }
  function draw(time) {
    const dt = lastTime === undefined ? 0 : Math.min(100, time - lastTime); lastTime = time;
    const active = started && playing && !document.hidden;
    const simDt = active ? dt * save.speed : 0;
    if (!document.hidden) {
      autoGearAge += dt;
      if (autoGearAge >= 1000) { autoGearAge = 0; runAutomaticGear(); }
    }
    if (!started && !document.hidden && !reduced) previewTime += dt;
    if (active) {
      if (run.status === 'running' || resultAge < 700) handleEvents(update(run, simDt));
      if (resultShown && !resultNavigation) {
        resultAge += dt;
        if (resultAge >= 700) {
          if ($('result-overlay').hidden && !$('menu-dialog').open) {
            $('result-overlay').hidden = false; document.body.classList.add('result-active');
            document.querySelector('.game-shell').inert = true;
            (lootUI.recruitDuration ? $('recruit-continue') : lootUI.introDuration ? $('unlock-continue') : $('result-skip').hidden ? $('retry-button') : $('result-skip')).focus({ preventScroll: true });
          }
          lootUI.tick(resultAge - 700);
        }
        const plan = lootUI.plan, shownAge = resultAge - 700;
        const destination = autoDestination(save, run.stage.id, run.status === 'victory');
        text('repeat-countdown', destination && shownAge >= plan.completeAt ? Math.max(0, Math.ceil((plan.repeatAt - shownAge) / 1000)) + '秒 → ' + stageLabel(destination.stage) : '');
        if (destination && shownAge >= plan.repeatAt) { save.autoMode = destination.mode; refreshAutoControls(); startStage(destination.stage, $('menu-dialog').open); }
      }
    }
    // The full-screen result owns animation now; its settled battle backdrop
    // can reuse the last Canvas frame until a new run starts.
    if (resultShown && resultAge >= 700) { requestAnimationFrame(draw); return; }
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 1024, 576);
    ctx.save();
    if (shake > 0 && active) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake = Math.max(0, shake - dt / 70); }
    if (run.stage.final) GoddessRenderer.background(ctx,run,run.time+previewTime,reduced);
    else if (run.stage.special) RiftRenderer.background(ctx, run.time + previewTime, reduced, run.stage.id);
    else layers[run.stage.region].forEach(layer => ctx.drawImage(layer.image, layer.x||0, layer.y||0, layer.width||1024, layer.height||576));
    // Soft light rays and drifting motes add depth without obscuring the sprite art.
    if (!reduced) {
      const ambient = run.time + previewTime;
      if(run.stage.region!==3)ImageEffects.sprite(ctx,'streak',ambient,350,255,650,140,'#fff1b9',.07,2.05);
      for (let i = 0; i < 17; i++) {
        const x = (i * 71 + ambient / (130 + i * 3)) % 1050, y = 220 + Math.sin(ambient / 2300 + i * 2.1) * 70 + (i % 4) * 54;
        const color=run.stage.region===8?i%3?'#bbebff':'#e6e4ff':run.stage.region===3?i%3?'#ad8dd4':'#ffd687':run.stage.region===4?i%3?'#87e7fb':'#fff6c4':run.stage.region===2?i%3?'#bb75ec':'#bcf76e':i%3?'#cce5a7':'#fff6c4';ImageEffects.mote(ctx,x,y,8,color,.5,ambient+i*53);
      }
    }
    if(!reduced)WarriorSkillRenderer.ghosts(ctx,run.hero,drawActor);
    run.enemies.filter(actor => actor.dimensionalGate).forEach(actor => drawActor(actor));
    PaladinSkillRenderer.fields(ctx,run,paladinEffects,reduced);
    for(const actor of run.allies.filter(a=>a.type==='ninja')){NinjaSkillRenderer.castAura(ctx,actor,run,ninjaEffects,reduced);if(!reduced)NinjaSkillRenderer.ghosts(ctx,actor,run,drawActor);}
    NinjaSkillRenderer.fields(ctx,run,ninjaEffects,reduced);
    MikoSkillRenderer.backdrops(ctx,run,mikoEffects,reduced);
    ShamanSkillRenderer.fields(ctx,run,shamanEffects,reduced);
    ShamanSkillRenderer.auras(ctx,run,shamanEffects,reduced);
    NinjaSkillRenderer.backdrops(ctx,effects,run.time,ninjaEffects,reduced);
    if(![8,9,10].includes(run.stage.region))InterferenceRenderer.warnings(ctx,run);
    if (run.stage.final) GoddessRenderer.warnings(ctx,run);
    else if (run.stage.special) RiftRenderer.emergence(ctx, run, reduced);
    NinjaSkillRenderer.echoPoses(ctx,run,drawActor);
    // Boss bodies share the goddess's foreground layer above party attacks.
    const foregroundEnemies = run.enemies.filter(actor => !actor.dimensionalGate && (actor.boss || actor.majorBoss || actor.goddess)).sort((a, b) => a.y - b.y);
    [...run.enemies.filter(actor => !actor.dimensionalGate && !actor.boss && !actor.majorBoss && !actor.goddess), run.hero, ...run.allies,...run.ninjaClones].sort((a, b) => a.y - b.y).forEach(actor=>actor.source?NinjaSkillRenderer.drawClone(ctx,actor,drawActor):drawActor(actor));
    if(run.stage.final)GoddessRenderer.overlays(ctx,run,sprites,effectSprites,drawAsset,reduced);
    WarriorSkillRenderer.castOverlay(ctx,run.hero,warriorEffects);
    WarriorSkillRenderer.impacts(ctx,effects,run.time,warriorEffects);
    for(const mage of run.allies)MageSkillRenderer.castOverlay(ctx,mage,mageEffects,reduced);
    MageSkillRenderer.impacts(ctx,effects,run.time,mageEffects,reduced);
    for(const actor of run.allies)PaladinSkillRenderer.castOverlay(ctx,actor,paladinEffects,reduced);
    PaladinSkillRenderer.impacts(ctx,effects,run.time,paladinEffects,reduced);
    NinjaSkillRenderer.projectiles(ctx,run,ninjaEffects,reduced);
    NinjaSkillRenderer.impacts(ctx,effects,run.time,ninjaEffects,reduced);
    for(const actor of run.allies.filter(a=>a.type==='ninja'))NinjaSkillRenderer.overlay(ctx,actor,run,ninjaEffects,reduced);
    ninjaStatusRegions=NinjaSkillRenderer.statuses(ctx,run,ninjaEffects);
    ShamanSkillRenderer.projectiles(ctx,run,shamanEffects,reduced);
    ShamanSkillRenderer.impacts(ctx,effects,run.time,shamanEffects,reduced);
    for(const actor of run.allies.filter(a=>a.type==='shaman'))ShamanSkillRenderer.castOverlay(ctx,actor,run,shamanEffects,reduced);
    shamanStatusRegions=ShamanSkillRenderer.statuses(ctx,run,shamanEffects);
    if(run.stage.region!==8)interferenceStatusRegions=InterferenceRenderer.bars(ctx,run);
    syncCurseFocus();
    MikoSkillRenderer.units(ctx,run,mikoEffects,reduced);
    MikoSkillRenderer.projectiles(ctx,run,mikoEffects,reduced,{warrior:warriorEffects.slash,mage:mageEffects.arcane,paladin:paladinEffects.hammer,ninja:ninjaEffects.fuma,shaman:shamanEffects['skull-bolt']});
    MikoSkillRenderer.impacts(ctx,effects,run.time,mikoEffects,reduced);
    MikoSkillRenderer.barriers(ctx,run);mikoStatusRegions=MikoSkillRenderer.statuses(ctx,run,mikoEffects);drawRuinsProjectiles();drawDesertProjectiles();drawHighlandProjectiles();GlacierRenderer.projectiles(ctx,run,effectSprites,drawAsset,reduced);VolcanoRenderer.floors(ctx,run,effectSprites,drawAsset);VolcanoRenderer.projectiles(ctx,run,effectSprites,drawAsset,reduced);DemonCastleRenderer.projectiles(ctx,run,effectSprites,drawAsset,reduced);mikoStatusRegions.push(...GlacierRenderer.statuses(ctx,run,effectSprites,drawAsset),...(run.stage.region===10?[]:VolcanoRenderer.statuses(ctx,run,effectSprites,drawAsset)), ...DemonCastleRenderer.statuses(ctx,run,effectSprites,drawAsset));
    drawProjectiles(); drawEffects(simDt);
    if(run.mikoContracts.length>4||run.ninjaClones.length>6)[run.hero,...run.allies].filter(a=>a.hp>0).forEach(a=>drawActor(a));
    foregroundEnemies.forEach(actor => drawActor(actor));
    drawDesertTelegraphs(); if([8,9,10].includes(run.stage.region)){InterferenceRenderer.warnings(ctx,run);interferenceStatusRegions=InterferenceRenderer.bars(ctx,run);}if(run.goddess?.phantom)interferenceStatusRegions.push({x:605,y:474,w:65,h:28,label:'星鏡 / 妨害不可'}); ctx.restore(); hud(); requestAnimationFrame(draw);
  }
  // Delegated controls also work in dialogs and for newly earned loot.
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.museumShow) { showMenu('museum', undefined, { owner: button.dataset.museumShow, skill: button.dataset.museumSkill }); return; }
    if (gemWorkshop.handle(button)) return;
    if (gemDismantleUI.handle(button)) return;
    if (conversionUI.handle(button)) return;
    if (growthUI.handle(button)) return;
    if (autoGearUI.handle(button)) return;
    if (button.dataset.partyCharacter) selectCharacter(button.dataset.partyCharacter);
    else if (button.dataset.open) showMenu(button.dataset.open);
    else if (button.hasAttribute('data-special-stages')) { viewedStage = run.stage.special ? run.stage.id : SPECIAL_STAGES[0].id; renderStages(); }
    else if (button.dataset.stageRegion) { viewedStage = (Number(button.dataset.stageRegion) - 1) * 10 + 1; renderStages(); }
    else if (button.dataset.stage) {
      viewedStage = stageId(button.dataset.stage);
      if ($('menu-dialog').open && menu === 'stages') {
        renderStages();
        $('menu-content').querySelector('.stage-map [data-stage="' + viewedStage + '"]').focus();
      } else showMenu('stages', viewedStage);
    } else if (button.dataset.enter) startStage(stageId(button.dataset.enter));
    else if (button.dataset.item) {
      if(button.dataset.item.startsWith('gem-instance-')&&!P.gemInstance(save,itemById(button.dataset.item)?.gemId)){notify('解体済み');return;}
      selectedItem = button.dataset.item;
      const isGem = itemById(selectedItem)?.type === 'gem';
      if (isGem) { selectedGem = itemById(selectedItem).gemId; gemFilter = 'gem'; Object.assign(gemView, ForestGemInventory.defaults()); }
      else inventoryFilter = 'material';
      const destination = isGem ? 'gems' : 'inventory';
      if (menu === destination) renderInventory(); else showMenu(destination);
    }
    else if (button.dataset.filter) { if (menu === 'gems') gemFilter = button.dataset.filter; else inventoryFilter = button.dataset.filter; renderInventory(); document.querySelector('[data-filter="' + button.dataset.filter + '"]').focus({ preventScroll: true }); $('tooltip').hidden = true; }
    else if (button.hasAttribute('data-reset-gem-filters')) { Object.assign(gemView, ForestGemInventory.defaults()); renderInventory(); document.querySelector('[data-reset-gem-filters]').focus({ preventScroll: true }); }
    else if (button.hasAttribute('data-gem-sort-direction')) { gemView.descending = !gemView.descending; renderInventory(); document.querySelector('[data-gem-sort-direction]').focus({ preventScroll: true }); }
    else if (button.dataset.gemInstance) { selectedGem = Number(button.dataset.gemInstance); renderInventorySelection(); }
    else if (button.dataset.toggleInventoryGem) toggleInventoryGem(button.dataset.toggleInventoryGem);
    else if (button.dataset.inventoryCharacter) { selectCharacter(button.dataset.inventoryCharacter); renderInventory(); document.querySelector('[data-inventory-character="' + button.dataset.inventoryCharacter + '"]').focus({ preventScroll: true }); }
    else if (button.dataset.inventorySlot) { inventorySlot = button.dataset.inventorySlot; renderInventory(); }
    else if (button.dataset.autoMode) {
      save.autoMode = button.dataset.autoMode;
      if (resultShown && save.autoMode !== 'off' && resultAge >= 700 + lootUI.plan.completeAt) resultAge = 700 + lootUI.plan.completeAt;
      persist(); refreshAutoControls(); renderOptions(); document.querySelector('[data-auto-mode="' + save.autoMode + '"]').focus();
    }
    else if (button.hasAttribute('data-reset-save')) $('reset-dialog').showModal();
    else if (button.hasAttribute('data-use-potion')) usePotion();
  });
  document.addEventListener('contextmenu', event => {
    const button = event.target.closest('[data-gem-instance]'); if (!button) return;
    event.preventDefault(); if (button.disabled) return;
    toggleInventoryGem(button.dataset.gemInstance);
  });
  function changeGemView(input) {
    const key = input.dataset.gemView;
    if (!key) return false;
    if (updatingGemView || renderingInventory || menu !== 'gems' || gemFilter !== 'gem') return true;
    updatingGemView = true;
    try {
      const cursor = input.selectionStart;
      gemView[key] = input.type === 'checkbox' ? input.checked : input.value;
      if (gemView.effect === 'all' && gemView.sort === 'effect') gemView.sort = 'rarity';
      renderInventory();
      const next = document.querySelector('[data-gem-view="' + key + '"]');
      next?.focus({ preventScroll: true });
      if (key === 'search' && cursor !== null) next?.setSelectionRange(cursor, cursor);
    } finally { updatingGemView = false; }
    return true;
  }
  document.addEventListener('change', event => { if (!changeGemView(event.target) && !gemDismantleUI.change(event.target)) gemWorkshop.change(event.target); });
  document.addEventListener('input', event => {
    if (event.target.dataset.gemView !== 'search') return;
    gemView.search = event.target.value;
    clearTimeout(gemSearchTimer); gemSearchTimer = setTimeout(() => {
      if (event.target.isConnected) changeGemView(event.target);
    }, 120);
  });
  document.addEventListener('toggle', event => { if (event.target.hasAttribute('data-other-loadouts')) otherLoadoutsOpen = event.target.open; }, true);
  $('start-button').addEventListener('click', () => ready ? startStage() : location.reload());
  $('pause-button').addEventListener('click', () => setPlaying(!playing));
  $('speed-button').addEventListener('click', () => { save.speed = save.speed === 1 ? 2 : 1; text('speed-button', save.speed + '×'); persist(); });
  $('repeat-button').addEventListener('click', () => showMenu('options'));
  $('potion-button').addEventListener('click', usePotion);
  $('result-auto').addEventListener('click', () => showMenu('options'));
  $('result-stages').addEventListener('click', () => showMenu('stages', run.stage.id));
  $('reset-cancel').addEventListener('click', () => $('reset-dialog').close());
  $('reset-confirm').addEventListener('click', resetSave);
  $('result-skip').addEventListener('click', () => { resultAge = Math.max(resultAge, 700 + lootUI.plan.completeAt); lootUI.tick(resultAge - 700); });
  $('recruit-continue').addEventListener('click', () => { resultAge = Math.max(resultAge, 700 + lootUI.recruitDuration); lootUI.tick(resultAge - 700); });
  $('unlock-continue').addEventListener('click', () => { resultAge = Math.max(resultAge, 700 + lootUI.introDuration); lootUI.tick(resultAge - 700); });
  $('retry-button').addEventListener('click', () => startStage());
  $('next-button').addEventListener('click', () => { const next = nextStage(run.stage.id); if (next) startStage(next.id); });
  $('close-menu').addEventListener('click', () => $('menu-dialog').close());
  $('menu-dialog').addEventListener('click', event => {
    if (event.target !== $('menu-dialog')) return;
    const r = $('menu-dialog').getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('menu-dialog').close();
  });
  $('menu-dialog').addEventListener('close', () => {
    museumUI.stop();
    menu = ''; resultNavigation = false; $('tooltip').hidden = true; document.body.append($('tooltip'), $('notification')); lastTime = undefined;
  });
  document.addEventListener('visibilitychange', () => { lastTime = undefined; if (document.hidden) persist(); });
  window.addEventListener('pagehide', persist);
  document.addEventListener('keydown', event => {
    conversionUI.keydown(event);
    if (event.code === 'Space' && !event.repeat && started && !$('menu-dialog').open && !event.target.closest('button,a,input,select,textarea')) {
      event.preventDefault(); setPlaying(!playing);
    }
  });
  function showTip(element) {
    const tip = $('tooltip'); tip.textContent = element.dataset.tip; tip.hidden = false;
    const box = element.getBoundingClientRect(), bounds = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(innerWidth - bounds.width - 8, box.left + box.width / 2 - bounds.width / 2)) + 'px';
    tip.style.top = (box.top - bounds.height - 9 < 8 ? Math.min(innerHeight - bounds.height - 8, box.bottom + 9) : box.top - bounds.height - 9) + 'px';
  }
  document.addEventListener('pointerover', event => { const element = event.target.closest('[data-tip]'); if (element && !element.contains(event.relatedTarget)) showTip(element); });
  document.addEventListener('pointerout', event => { const element = event.target.closest('[data-tip]'); if (element && !element.contains(event.relatedTarget)) $('tooltip').hidden = true; });
  document.addEventListener('focusin', event => { const element = event.target.closest('[data-tip]'); if (element) showTip(element); });
  document.addEventListener('focusout', () => $('tooltip').hidden = true);
  canvas.addEventListener('pointermove',event=>{
    const box=canvas.getBoundingClientRect(),x=(event.clientX-box.left)*1024/box.width,y=(event.clientY-box.top)*576/box.height;
    const region=[...ninjaStatusRegions,...shamanStatusRegions,...mikoStatusRegions,...interferenceStatusRegions].find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
    if(region){canvas.dataset.tip=region.label;showTip(canvas);}else {delete canvas.dataset.tip;$('tooltip').hidden=true;}
  });
  canvas.addEventListener('pointerleave',()=>{delete canvas.dataset.tip;$('tooltip').hidden=true;});
  window.addEventListener('scroll', () => $('tooltip').hidden = true, { passive: true });
  refreshAutoControls(); text('speed-button', save.speed + '×');
  renderRoute(); refreshResources(); refreshGrowth();
  refreshRegion(); text('stage-number', run.stage.special ? 'SPECIAL' : run.stage.region + ' — ' + run.stage.number); text('stage-name', run.stage.name);
  $('encounter-list').innerHTML = enemyChips(run.stage.special ? run.stage.waves.flat() : run.stage.enemies);
  try {
    const stageLayers = Promise.all(REGIONS.map(async region => { const base = 'assets/stages/' + region.asset + '/', stage = await json(base + 'manifest.json'); return [region.id, await Promise.all([...stage.layers,...(stage.props||[]).map(p=>({...p,y:p.y-p.height}))].map(async layer => ({ ...layer,image: await image(base + layer.file) })))]; })).then(Object.fromEntries);
    [layers, sprites, effectSprites, warriorEffects, mageEffects, paladinEffects, ninjaEffects, shamanEffects, mikoEffects] = await Promise.all([
      stageLayers,
      Promise.all([loadCharacter().then(data => ['warrior', data]), loadCharacter('mage').then(data => ['mage', data]), loadCharacter('paladin').then(data => ['paladin', data]),loadCharacter('ninja').then(data=>['ninja',data]),loadCharacter('shaman').then(data=>['shaman',data]),loadCharacter('miko').then(data=>['miko',data]), ...Object.keys(ENEMIES).map(async id => [id, await loadEnemy(id)])]).then(Object.fromEntries),
      Promise.all(['fruit-bomb', 'explosion', 'root-eruption', 'alraune-seed-stream', 'toad-poison-bolt', 'toad-poison-impact', 'mud-bind', 'mud-slam-impact', 'lich-energy-bolt', 'lich-energy-impact', 'lich-dark-magic', 'hydra-poison-aura', 'hydra-poison-breath', ...ExpansionData.EFFECTS, ...RuinsData.EFFECTS, ...DesertData.EFFECTS, ...HighlandData.EFFECTS, ...GlacierData.EFFECTS, ...VolcanoData.EFFECTS, ...DemonCastleData.EFFECTS, ...MageMotions.EFFECTS].map(async id => [id, await asset('assets/effects/' + id + '/')])).then(Object.fromEntries),
      WarriorSkillRenderer.load(),
      MageSkillRenderer.load(),
      PaladinSkillRenderer.load(),
      NinjaSkillRenderer.load(),
      ShamanSkillRenderer.load(),
      MikoSkillRenderer.load(),
    ]);
    await RiftRenderer.load();
    await GoddessRenderer.load();
    ready = true; $('start-button').disabled = false; $('start-button').querySelector('span').textContent = '開始';
    if (menu === 'stages') $('menu-content').querySelector('.stage-detail').innerHTML = stageDetail();
    requestAnimationFrame(draw);
  } catch (error) {
    console.error('Forest assets failed to load:', error);
    $('start-button').disabled = false; $('start-button').querySelector('span').textContent = '再読込';
    notify('素材を読み込めませんでした。もう一度お試しください。');
  }
})();
