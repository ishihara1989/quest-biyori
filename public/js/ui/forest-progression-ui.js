'use strict';
window.ForestProgressionUI = {
  create({ save, getRun, getStats = id => ForestProgression.stats(save, id), isRunning = () => false, icon, persist, notify, onSelect, onChange }) {
    const P = ForestProgression, $ = id => document.getElementById(id);
    const art = id => id.startsWith('assets/') ? id : ['miko-gohei','miko-robe'].includes(id)?'assets/ui/ruins/icons/'+id+'.png':id.startsWith('ninja-')?'assets/skills/ninja/icons/'+(id==='ninja-shuriken'?'shuriken':'shadow-clone')+'.png':id.startsWith('paladin-') ? 'assets/skills/paladin/icons/'+(id==='paladin-mace'?'mace':'aegis')+'.png' : 'assets/ui/progression/' + id + '.png';
    const gearArt = (character, slot) => P.equipmentAppearance(save, character, slot).image;
    const nodeArt = n => n.icon || art(n.art);
    const itemArt = id => ForestData.ITEMS.find(i=>i.id===id)?.image || 'assets/ui/items/' + id + '.png';
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pct = n => Math.round(n * 100) + '%', num = n => Number(n.toFixed(2));
    const dirs = { attack: ['攻撃', 'attack-gem'], defense: ['防御', 'defense-gem'], utility: ['補助', 'utility-gem'], common: ['共通', 'universal-gem'], get dedicated() { return [P.CHARACTERS[id()].name, 'assets/ui/gems/goddess-page.png']; } };
    const labels = { damage: '攻撃', weaponPower: '武器攻撃', magicPower: '魔法攻撃', haste: '再使用速度', defense: '防御', maxHp: 'HP', maxMp: 'MP', mpRegen: 'MP/秒', attackSpeed: '攻撃速度', interferencePower: '行動妨害力', skillPower: 'スキル威力', skillRange: '範囲', chainRange: '連鎖距離', attackCapacity: '攻撃容量', defenseCapacity: '防御容量', utilityCapacity: '補助容量', commonCapacity: '共通容量', discount: '装着割引', get dedicatedCapacity() { return P.CHARACTERS[id()].name + '容量'; }, skillPoints:'SP' };
    const selectedRegion = () => ForestData.ALL_STAGES.find(s => s.id === save.selectedStage)?.region || 1;
    let tab = 'character', slot = 'weapon', selectedSkill = 'renjin', selectedForge = 'main-1', forgeRegion = selectedRegion();
    const cameras = {}, forgeScales = {}, forgeTreeSize = { width: 2240, height: 740 };
    let forgePlans = new Map();
    function forgeFocus(nodes) {
      const stats = getStats(id());
      // Compare unlike effects by their gain relative to the current character.
      const base = { damage: stats.baseDamage, maxHp: stats.maxHp, defense: 80 + stats.defense, attackSpeed: stats.attackSpeed, skillPower: 1 + (stats.skillPower || 0), weaponPower: 1 + (stats.weaponPower || 0), mpRegen: Math.max(1, stats.mpRegen) };
      const value = n => Object.entries(n.effect).reduce((sum, [key, amount]) => sum + amount / (base[key] || 1), 0);
      const available = nodes.filter(n => forgePlans.get(n.id).status === 'available');
      const main = available.filter(n => n.main).sort((a, b) => b.stage - a.stage)[0];
      const best = list => list.sort((a, b) => value(b) - value(a) || b.stage - a.stage || b.x - a.x)[0];
      return main || best(available.filter(n => n.unique)) || best(available.filter(n => !n.main && !n.unique))
        || nodes.find(n => n.main && P.status(save, id(), slot, n) !== 'owned') || nodes.filter(n => n.main).at(-1) || nodes[0];
    }
    const camera = () => cameras[id()] ||= { x:24, y:5, scale:null };
    const treeSize = nodes => ({ width:Math.max(670,...nodes.map(n=>n.x+140)),height:540 });
    const treeObserver = new ResizeObserver(() => fitTree());
    function fitTree() {
      const view = document.querySelector('.skill-viewport'), tree = document.querySelector('.skill-tree'), frame = document.querySelector('.skill-frame');
      if (!view || !tree || !frame || !view.clientHeight) return;
      const c=camera();if(c.scale===null)c.scale=Math.max(.3,Math.min(.85,(view.clientHeight-25)/540));
      tree.style.setProperty('--tree-label-size',Math.max(12,9/c.scale)+'px');
      tree.style.setProperty('--tree-unlock-size',Math.max(10,8/c.scale)+'px');
      tree.style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.scale+')';
      const output=document.querySelector('[data-zoom-label]');if(output)output.textContent=Math.round(c.scale*100)+'%';
    }
    function zoom(factor,x,y) {
      const c=camera(),view=document.querySelector('.skill-viewport');if(!view)return;
      x ??= view.clientWidth/2;y ??= view.clientHeight/2;
      const next=Math.max(.2,Math.min(1.8,c.scale*factor)),ratio=next/c.scale;
      c.x=x-(x-c.x)*ratio;c.y=y-(y-c.y)*ratio;c.scale=next;fitTree();
    }
    function bindTree() {
      const view=document.querySelector('.skill-viewport');if(!view)return;fitTree();
      view.addEventListener('wheel',e=>{e.preventDefault();const r=view.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);$('tooltip').hidden=true;},{passive:false});
      let drag;
      view.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,a'))return;const c=camera();drag={x:e.clientX,y:e.clientY,ox:c.x,oy:c.y};view.setPointerCapture(e.pointerId);view.classList.add('dragging');});
      view.addEventListener('pointermove',e=>{if(!drag)return;camera().x=drag.ox+e.clientX-drag.x;camera().y=drag.oy+e.clientY-drag.y;fitTree();$('tooltip').hidden=true;});
      const end=()=>{drag=null;view.classList.remove('dragging');};view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',end);
      view.addEventListener('keydown',e=>{if(e.target!==view)return;const move={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]}[e.key];if(move){e.preventDefault();camera().x+=move[0];camera().y+=move[1];fitTree();}if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?.85:1.15);}});
    }
    const forgeCameraKey = () => id() + ':' + slot + ':' + forgeRegion;
    function forgeViewport(nodes, goddess = false) {
      return '<div class="tree-viewport forge-viewport' + (goddess ? ' goddess-forge-viewport' : '') + '" tabindex="0" aria-label="装備強化ツリー。ホイールで拡大縮小、空白をドラッグして移動。" data-tip="空白をドラッグで移動・ホイールで拡大縮小"><div class="forge-frame"><div class="growth-tree forge-tree' + (goddess ? ' goddess-forge-tree' : '') + '">' + connections(nodes, slot) + nodes.map(n => nodeMarkup(n, slot)).join('') + '</div></div></div>';
    }
    function bindForgeTree() {
      const view = document.querySelector('.forge-viewport');
      if (!view) return;
      const frame = view.querySelector('.forge-frame'), tree = view.querySelector('.forge-tree'), key = forgeCameraKey();
      let scale = forgeScales[key] || 1, drag;
      function applyScale() {
        tree.style.transform = 'scale(' + scale + ')';
        frame.style.width = forgeTreeSize.width * scale + 'px';
        frame.style.height = forgeTreeSize.height * scale + 'px';
        forgeScales[key] = scale;
      }
      applyScale();
      view.addEventListener('wheel', e => {
        e.preventDefault();
        const rect = view.getBoundingClientRect(), x = e.clientX - rect.left - view.clientLeft, y = e.clientY - rect.top - view.clientTop;
        const next = Math.max(.2, Math.min(1.8, scale * Math.exp(-e.deltaY * .0015))), ratio = next / scale;
        const left = (view.scrollLeft + x) * ratio - x, top = (view.scrollTop + y) * ratio - y;
        scale = next; applyScale(); view.scrollLeft = left; view.scrollTop = top;
        $('tooltip').hidden = true;
      }, { passive: false });
      view.addEventListener('pointerdown', e => {
        if (drag || e.button !== 0 || e.target.closest('button,a')) return;
        e.preventDefault(); view.focus({ preventScroll: true });
        drag = { pointer: e.pointerId, x: e.clientX, y: e.clientY, left: view.scrollLeft, top: view.scrollTop };
        view.setPointerCapture(e.pointerId); view.classList.add('dragging');
      });
      view.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.pointer) return;
        view.scrollLeft = drag.left + drag.x - e.clientX; view.scrollTop = drag.top + drag.y - e.clientY;
        $('tooltip').hidden = true;
      });
      const end = e => { if (drag && e.pointerId === drag.pointer) { drag = null; view.classList.remove('dragging'); } };
      view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end); view.addEventListener('lostpointercapture', end);
      view.addEventListener('dragstart', e => e.preventDefault());
    }
    function id() { return save.progression.selected; }
    function bonuses(effect) { return Object.entries(effect).filter(([k]) => labels[k]).map(([k, v]) => '<span>' + labels[k] + ' <b>' + (k === 'discount' ? '−' : '+') + (['attackSpeed', 'skillPower', 'weaponPower', 'magicPower', 'haste', 'interferencePower'].includes(k) ? pct(v) : num(v)) + '</b></span>').join(''); }
    function capMarkup(character, equipment) {
      const { used, cap } = P.gemUsage(save, character, equipment);
      return '<div class="capacity-row">' + Object.entries(dirs).filter(([dir])=>dir!=='dedicated'||cap.dedicated>0).map(([dir, [label, img]]) => '<span class="capacity ' + dir + '" tabindex="0" data-tip="' + label + '容量 ' + cap[dir] + '\n消費 ' + (dir === 'common' ? used.common : Math.min(used[dir], cap[dir])) + (dir==='dedicated'?'\n職専用・共通容量による代替不可':dir === 'common' ? '\n通常の容量不足・非対応方向を補います。' : used[dir] > cap[dir] ? '\n不足分 ' + (used[dir] - cap[dir]) + ' は共通容量を使用。' : '') + '"><img src="' + art(img) + '" alt="' + label + '"><b>' + (dir === 'common' ? used.common : Math.min(used[dir], cap[dir])) + '<small> / ' + cap[dir] + '</small></b></span>').join('') + '</div>';
    }
    function roster() {
      const list = Object.entries(P.CHARACTERS).filter(([key]) => P.unlocked(save, key));
      return '<div class="party-roster" aria-label="キャラクター選択">' + list.map(([key, c]) => {
        return '<button class="party-portrait ' + (key === id() ? 'selected' : '') + '" data-character="' + key + '" aria-label="' + c.name + '" aria-pressed="' + (key === id()) + '" data-tip="' + c.name + '"><img src="assets/' + key + '/idle-01.png" alt=""><i></i><span>' + c.name + '</span></button>';
      }).join('') + '<div class="roster-count"><b>' + String(list.length).padStart(2,'0') + '</b><small>ADVENTURERS</small></div></div>';
    }
    function profile() {
      const character = id(), c = P.CHARACTERS[character], s = getStats(character), state = save.progression.characters[character];
      const lv = s.level, open = P.unlocked(save, character);
      const hp = Math.ceil(s.maxHp), mp = Math.floor(s.maxMp);
      const portrait = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'idle-01.png' : 'portrait.gif';
      return '<aside class="growth-profile" style="--hero-color:' + c.color + '"><div class="profile-heading"><span>' + c.english + '</span><b>Lv. ' + lv + '</b></div><div class="portrait-stage"><div class="portrait-orbit"></div><img src="assets/' + character + '/' + portrait + '" alt="' + c.name + '"></div><div class="profile-name"><small>' + c.title + '</small><h3>' + c.name + '</h3><span>' + (open ? '◆ ' + (getRun().stage.realmName || ForestData.REGIONS[selectedRegion() - 1].name) : icon('lock') + ' '+ForestData.stageLabel(c.unlock)+' クリア') + '</span></div><div class="profile-bars"><div><span>HP</span><b>' + hp + '<small> / ' + num(s.maxHp) + '</small></b></div><div class="resource-track hp"><i style="width:' + hp / s.maxHp * 100 + '%"></i></div><div><span>MP</span><b>' + mp + '<small> / ' + num(s.maxMp) + '</small></b></div><div class="resource-track mp"><i style="width:' + mp / s.maxMp * 100 + '%"></i></div></div><div class="profile-exp" data-tip="ステージクリアで加入済みの全員が経験値を獲得。\nレベルアップで基礎能力が成長し、SP +1。\nレベル上限 100" tabindex="0"><span>EXP <b>' + P.xpPercent(state.xp) + '</b></span><div class="resource-track xp"><i style="width:' + (lv >= P.MAX_LEVEL ? 100 : state.xp.progress * 100) + '%"></i></div></div><div class="profile-bottom"><span>SKILL POINTS</span><b>' + P.points(save, character) + '<small> SP</small></b></div></aside>';
    }
    function attributes() {
      const character = id(), s = getStats(character);
      const stats = [['sword', '基礎攻撃力', num(s.baseDamage), '物理・魔法に共通する基礎値。レベル・装備を反映。'], ['sword', ['mage','shaman','miko'].includes(character) ? '魔法攻撃力' : '武器攻撃力', num(s.damage), '基礎攻撃力・特化補正・ジェムの固定攻撃力を反映。'], ['shield', '防御力', num(s.defense), '物理・魔法に共通。被ダメージを80 / (80 + 防御力)で軽減。'],
        ['heart', '最大HP', num(s.maxHp), 'レベルと防具で成長。'], ['spark', '最大MP', num(s.maxMp), '自動スキルで消費。足りない時は通常攻撃を続けます。'],
        ['repeat', '攻撃速度', num(s.attackSpeed) + '×', '通常攻撃と攻撃スキルの予備動作・硬直・通常攻撃周期に適用。'], ['clock', '再使用速度', '+' + pct(s.haste), '攻撃速度と独立。現在の主スキル再使用 ' + num(s.skillInterval / 1000) + '秒。'],
        ['arrow', '移動速度', num(s.speed), '接近と自動離脱の速さ。'], ['spark', 'クリティカル', pct(s.crit), '通常攻撃・攻撃スキルに適用。'],
        ['sword', 'クリティカル倍率', num(s.critMultiplier) + '×', 'クリティカル時の威力。'], ['leaf', 'MP回復', num(s.mpRegen) + '<small> / 秒</small>', '戦闘中に自然回復。大技の連発でMPを消費。'], ['sword','行動妨害力','+'+pct(s.interferencePower),'予備動作に命中した技の妨害力を増加。'], ['shield','妨害抵抗貫通',pct(s.interferencePenetration),'命中時の妨害抵抗を最大40%軽減。'], ['shield','状態異常抵抗',pct(s.statusResistance),'状態異常の付与確率を軽減。'], ['spark','ドロップ率','+'+pct(s.treasureHunt),'パーティー全体で加算。全素材・ジェムの基本ドロップ率と獲得ゴールドへ適用。素材・ジェムは100%ごとに1個確定、端数で追加抽選。']];
      return '<div class="attributes-view"><div class="growth-section-heading"><span>ATTRIBUTES</span><small>Lv. ' + s.level + '</small></div><div class="attribute-grid">' + stats.map(([i, label, value, tip]) => '<div tabindex="0" data-tip="' + tip + '">' + icon(i) + '<small>' + label + '</small><b>' + value + '</b></div>').join('') + '</div><div class="growth-section-heading"><span>EQUIPMENT</span><small>GENERATION ' + ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ'][Math.max(...['weapon','armor'].map(e => P.equipmentAppearance(save, character, e).region)) - 1] + '</small></div><div class="gear-cards">' + ['weapon', 'armor'].map(equipment => {
        const owned = save.progression.characters[character][equipment].length, appearance = P.equipmentAppearance(save, character, equipment);
        return '<button class="gear-card" data-gear-open="' + equipment + '" data-tip="' + escape(appearance.name + '\n' + (equipment === 'weapon' ? '武器' : '防具') + '強化ツリーを開く') + '"><span class="gear-art"><img src="' + appearance.image + '" alt=""></span><div><small>' + (equipment === 'weapon' ? 'WEAPON' : 'ARMOR') + '<b> +' + save.progression.characters[character][equipment].filter(n => /^(swamp-|cave-|coast-|ruins-|desert-)?main-/.test(n)).length + '</b></small><strong>' + appearance.name + '</strong><span class="gear-node-count">' + owned + ' / 600 <i>↗</i></span></div></button>';
      }).join('') + '</div></div>';
    }
    function connections(nodes, kind) {
      const size=kind==='skills'?treeSize(nodes):forgeTreeSize;
      return '<svg class="tree-lines" style="width:'+size.width+'px;height:'+size.height+'px" viewBox="0 0 ' + size.width + ' '+size.height+'" aria-hidden="true">' + nodes.flatMap(n => n.requires.map(req => {
        const from = nodes.find(p => p.id === req); if (!from) return '';
        const state = P.status(save, id(), kind, n), active = state === 'owned' || (kind==='skills'&&P.rank(save,id(),n.id)>0);
        return '<path class="' + (active ? 'lit' : state === 'available' || state === 'cost' ? 'reachable' : '') + '" d="M' + from.x + ' ' + from.y + ' ' + (kind === 'skills' ? 'C' + (from.x + 80) + ' ' + from.y + ' ' + (n.x - 80) + ' ' + n.y + ' ' + n.x + ' ' + n.y : 'L' + n.x + ' ' + n.y) + '"/>';
      })).join('') + '</svg>';
    }
    function skillParameters(n) {
      if (['normal','active'].includes(n.kind)) {
        const skills=id()==='miko'?MikoSkills:id()==='shaman'?ShamanSkills:id()==='ninja'?NinjaSkills:id()==='mage'?MageSkills:id()==='paladin'?PaladinSkills:WarriorSkills;
        return skills.parameters(skills.spec(n.id, Math.max(1,P.rank(save,id(),n.id)), P.rank(save,id(),n.id+'-enhance'), getStats(id())));
      }
      return n.note || '';
    }
    function nodeMarkup(n, kind) {
      const state = P.status(save, id(), kind, n), selected = (kind === 'skills' ? selectedSkill : selectedForge) === n.id;
      const plan = kind === 'skills' ? null : forgePlans.get(n.id);
      const bulkReady = plan?.status === 'available' && plan.nodes.length > 1;
      const rank=kind==='skills'?P.rank(save,id(),n.id):0;
      const statusLabel = { owned: '取得済み', available: '取得可能', cost: kind === 'skills' ? 'SP不足' : '素材不足', locked: '未解放' }[state];
      const stageRequirement = kind !== 'skills' && n.main ? ForestData.stageLabel(n.stage) + ' クリア' : '';
      const lockedRequirement = state === 'locked' ? requirements(n, kind) : '';
      const forgeTip = kind === 'skills' ? '' : '\n' + statusLabel + (lockedRequirement && lockedRequirement !== stageRequirement ? ' · ' + lockedRequirement : '') + (state === 'owned' ? '' : '\n' + Object.entries(n.cost).filter(([key])=>key==='gold'||ForestData.itemDiscovered(save,ForestData.ITEMS.find(i=>i.id===key))).map(([key, amount]) => (key === 'gold' ? 'ゴールド' : ForestData.ITEMS.find(i => i.id === key).name) + ' ' + (key === 'gold' ? save.gold : save.inventory[key] || 0) + ' / ' + amount).join('\n'));
      const marker = bulkReady ? '<span class="forge-bulk-ready" aria-hidden="true">+' + plan.nodes.length + '</span>' : state === 'owned' ? icon('check') : state === 'locked' ? icon('lock') : kind === 'skills' ? '<i></i>' : '<span class="forge-status" aria-hidden="true">' + (state === 'available' ? '+' : '−') + '</span>';
      const tip = n.name + '\n' + (kind === 'skills' ? skillParameters(n) : n.note || '') + '\n' + Object.entries(kind === 'skills' ? {} : n.effect).filter(([k]) => labels[k]).map(([k, v]) => labels[k] + ' +' + (['skillPower', 'attackSpeed', 'weaponPower', 'magicPower', 'haste', 'interferencePower'].includes(k) ? pct(v) : num(v))).join(' / ') + (stageRequirement ? '\n' + (Number.isInteger(n.stage) ? ForestData.REGIONS[Math.ceil(n.stage / 10) - 1].name + ' ' : '') + stageRequirement : '');
      return '<button class="growth-node ' + state + ' ' + (bulkReady ? 'bulk-ready ' : '') + (rank?'learned ':'')+(n.kind||'')+' ' + (n.main ? 'main-node ' : '') + (n.unique ? 'unique ' : '') + (selected ? 'selected' : '') + '" style="left:' + n.x + 'px;top:' + n.y + 'px;--node-y:' + n.y + 'px" data-growth-node="' + n.id + '" data-kind="' + kind + '" data-tip="' + escape(tip+(kind==='skills'?'\n習得 Lv.'+(n.unlockLevel||1)+' · スキルLv '+rank+'/'+(n.maxRank||1)+'\n'+(n.requires.length?'前提：'+n.requires.map(req=>P.SKILLS[id()].find(p=>p.id===req).name+' Lv.1').join(' / '):'前提スキルなし'):forgeTip + (bulkReady ? '\nまとめて取得可能 · ' + plan.nodes.length + 'ノード' : ''))) + '" aria-label="' + escape(n.name + ' · '+(kind==='skills'?'Lv '+rank+'/'+(n.maxRank||1)+' · ':'') + (bulkReady ? 'まとめて取得可能 · ' + plan.nodes.length + 'ノード' : statusLabel)) + '" aria-pressed="' + selected + '"><span class="node-art"><img src="' + nodeArt(n) + '" alt=""></span>' + marker + '<small>' + (kind === 'skills' ? n.name : n.main && Number.isInteger(n.stage) ? (Math.ceil(n.stage / 10) + ' — ') + String((n.stage - 1) % 10 + 1).padStart(2, '0') : n.unique ? '◆ ' + n.name : n.name) + '</small>'+(kind==='skills'?'<span class="rank-pips">'+Array.from({length:n.maxRank||1},(_,i)=>'<i class="'+(i<rank?'on':'')+'"></i>').join('')+'</span><span class="unlock-tag">Lv.'+(n.unlockLevel||1)+'</span>':'')+'</button>';
    }
    function requirements(n, kind) {
      const character = id(), state = save.progression.characters[character];
      if (!P.unlocked(save, character)) return ForestData.stageLabel(P.CHARACTERS[character].unlock)+' クリア';
      const nodes = kind === 'skills' ? P.SKILLS[character] : P.allGearTrees(character, kind, true);
      if(kind==='skills'&&P.level(state.xp)<(n.unlockLevel||1))return 'Lv.'+n.unlockLevel+' 解放';
      const missing = n.requires.filter(req => kind==='skills'?!P.rank(save,character,req):!state[kind].includes(req));
      if (missing.length) return nodes.find(s => s.id === missing[0]).name + ' 必須';
      if (kind !== 'skills' && !save.cleared.includes(n.stage)) return ForestData.stageLabel(n.stage) + ' クリア';
      return kind === 'skills' ? 'SP不足' : '素材不足';
    }
    function materialCosts(cost) {
      return Object.entries(cost).filter(([key]) => key === 'gold' || ForestData.itemDiscovered(save, ForestData.ITEMS.find(i => i.id === key))).map(([key, amount]) => {
        const held = key === 'gold' ? save.gold : save.inventory[key] || 0;
        const name = key === 'gold' ? 'ゴールド' : ForestData.ITEMS.find(i => i.id === key).name;
        return '<span class="node-cost ' + (held < amount ? 'insufficient' : '') + '" data-tip="' + escape(name + ' · 必要 ' + amount + ' / 所持 ' + held) + '" tabindex="0"><img src="' + itemArt(key) + '" alt="' + escape(name) + '"><b>' + amount + '</b></span>';
      }).join('');
    }
    function selection(nodes, kind) {
      const n = nodes.find(n => n.id === (kind === 'skills' ? selectedSkill : selectedForge)) || nodes[0], state = P.status(save, id(), kind, n);
      const costs = kind === 'skills' ? '<span class="sp-cost">' + n.cost + ' <small>SP</small></span>' : materialCosts(n.cost);
      const compact = { whirlwind: 'MP 18 · 6.5s · AUTO', evade: 'MP 8 · 5s · AUTO', counter: '反撃 +70%', gust: 'MP 16 · 5s · AUTO', vortex: 'MP 14 · 8s · AUTO', repel: 'MP 10 · 7s · AUTO', storm: '+2 TARGETS' };
      const rank=kind==='skills'?P.rank(save,id(),n.id):0;
      const detail=kind==='skills'?skillParameters(n):compact[n.id];
      const buy = '<button class="primary-button node-buy" data-buy-node="' + n.id + '" data-kind="' + kind + '"' + (state !== 'available' ? ' disabled' : '') + '>' + icon(state === 'owned' ? 'check' : state === 'locked' ? 'lock' : 'spark') + (state === 'owned' ? kind==='skills'?'MAX':'取得済み' : state === 'available' ? kind === 'skills' ? rank?'Lv '+rank+' → '+(rank+1):'習得' : '強化' : requirements(n, kind)) + '</button>';
      const actions = kind === 'skills' ? '<div class="skill-level-actions"><button class="node-decrease" data-decrease-skill="' + n.id + '" aria-label="' + escape(n.name + 'のスキルレベルを1下げる') + '" data-tip="レベル −1 · SP返却\n前提を満たさなくなるスキルもLv.0に戻し、SPを返却。"' + (!rank || n.cost === 0 || !P.unlocked(save, id()) ? ' disabled' : '') + '>−</button>' + buy + '</div>' : buy;
      const plan = kind === 'skills' ? null : P.gearPurchasePlan(save, id(), kind, n.id);
      const blocked = !plan || plan.status !== 'locked' ? '' : !P.unlocked(save, id()) ? ForestData.stageLabel(P.CHARACTERS[id()].unlock) + ' クリア' : ForestData.stageLabel(plan.blockedStage) + ' クリア';
      const bulk = plan && plan.nodes.length > 1 ? '<div class="forge-bulk-purchase"><div class="bulk-cost-heading"><span>合計</span><b>' + plan.nodes.length + ' ノード</b></div><div class="node-costs">' + materialCosts(plan.cost) + '</div><span class="bulk-action-tip" tabindex="0" data-tip="' + escape('未取得の前提ノードと選択ノードをまとめて取得\n' + (blocked || (plan.status === 'cost' ? '合計素材・ゴールドが不足\n' : '')) + '\n' + plan.nodes.map(node => node.name).join(' → ')) + '"><button class="primary-button node-buy" data-buy-gear-path="' + n.id + '" data-kind="' + kind + '" aria-label="' + escape(n.name + 'までの' + plan.nodes.length + 'ノードをまとめて取得') + '"' + (plan.status !== 'available' ? ' disabled' : '') + '>' + icon(plan.status === 'locked' ? 'lock' : 'spark') + '一括強化</button></span>' + (blocked ? '<small class="bulk-blocked">' + escape(blocked) + '</small>' : '') + '</div>' : '';
      return '<div class="node-detail"><img class="detail-art" src="' + nodeArt(n) + '" alt=""><div class="node-detail-text" tabindex="0" data-tip="' + escape(kind==='skills'?skillParameters(n):(n.note || n.name)) + '"><small>' + (n.unique ? 'UNIQUE' : kind === 'skills' ? ({normal:'NORMAL',active:'ACTIVE',enhancement:'SKILL PASSIVE',passive:'PASSIVE'}[n.kind]||'SKILL')+' · Lv '+rank+' / '+(n.maxRank||1) : n.main ? 'MAIN PATH' : 'SIDE PATH') + '</small><strong>' + n.name + '</strong><div class="effect-chips">' + bonuses(kind==='skills'?{}:n.effect) + '</div>' + (detail ? '<span class="skill-detail-note">' + detail + '</span>' : '') + (kind==='skills'&&n.icon&&n.kind!=='passive'?'<button class="motion-link" data-museum-show="'+id()+'" data-museum-skill="'+(n.skillId||n.id)+'" title="資料館で再生">▷ 資料館</button>':'')+'</div><div class="purchase-side' + (kind === 'skills' ? '' : ' forge-purchase-side') + '"><div class="node-costs">' + costs + '</div>' + actions + bulk + '</div></div>';
    }
    function skills() {
      const nodes = P.SKILLS[id()].filter(n => P.level(save.progression.characters[id()].xp) >= (n.unlockLevel || 1));
      const size=treeSize(nodes), lv=P.level(save.progression.characters[id()].xp);
      if (!nodes.some(n => n.id === selectedSkill)) selectedSkill = (nodes[1] || nodes[0]).id;
      const milestones=[1,...Array.from({length:20},(_,i)=>(i+1)*5)].filter(l => l <= lv);
      return '<div class="tree-toolbar"><div><span class="eyebrow">PATH OF ' + P.CHARACTERS[id()].english + '</span><h3>スキル</h3></div><div class="tree-point"><b>' + P.points(save, id()) + '</b><span>SP</span><button data-respec data-tip="習得ポイントをすべて返却。何度でも無料。" aria-label="スキルを振り直す">' + icon('repeat') + '</button></div></div><div class="tree-navigation"><span><i class="active-key"></i>技 <i class="enhance-key"></i>専用強化 <i class="passive-key"></i>共通</span><div><button data-tree-zoom="out" aria-label="縮小" title="縮小">−</button><output data-zoom-label>80%</output><button data-tree-zoom="in" aria-label="拡大" title="拡大">＋</button><button data-tree-reset title="先頭へ戻る" aria-label="先頭へ戻る">⌂</button><button data-tree-current title="現在のレベルへ移動" aria-label="現在のレベルへ移動">Lv.'+lv+'</button></div></div><div class="tree-viewport skill-viewport" tabindex="0" aria-label="スキルツリー。ホイールで拡大縮小、空白をドラッグして移動。矢印キーでも移動。"><div class="skill-frame"><div class="growth-tree skill-tree" style="width:'+size.width+'px;height:'+size.height+'px">'+milestones.map(l=>'<div class="level-column '+(lv>=l?'unlocked':'')+'" style="left:'+(100+(l-1)/5*180)+'px"><b>Lv.'+l+'</b></div>').join('')+ connections(nodes, 'skills') + nodes.map(n => nodeMarkup(n, 'skills')).join('') + '</div></div><span class="tree-gesture-hint">↔ ドラッグ　⊕ ホイール</span></div>' + selection(nodes, 'skills');
    }
    function forgeTabs(){return '<div class="region-tabs forge-regions" role="group" aria-label="装備の地域を選択">'+ForestData.REGIONS.filter(r=>ForestData.regionVisible(save,r.id)).map(r=>'<button data-forge-region="'+r.id+'" aria-pressed="'+(forgeRegion===r.id)+'">'+r.name+'</button>').join('')+(save.cleared.includes(P.Gem.Epic.GODDESS)?'<button class="goddess-forge-tab" data-forge-region="goddess" aria-pressed="'+(forgeRegion==='goddess')+'" data-tip="女神の装備強化"><img src="assets/ui/gems/goddess-page.png" alt="">女神</button>':'')+'</div>'; }
    function goddessForge(resetFocus){
      if(!save.cleared.includes(P.Gem.Epic.GODDESS))return forgeTabs()+'<div class="forge-page-locked">'+icon('lock')+'<h3>女神の契約</h3><span>異次元の女神 クリア</span></div>';
      const nodes=P.gearTree(id(),slot,'goddess'),owned=save.progression.characters[id()][slot].filter(uid=>nodes.some(n=>n.id===uid));
      forgePlans=new Map(nodes.map(n=>[n.id,P.gearPurchasePlan(save,id(),slot,n.id)]));if(resetFocus||!nodes.some(n=>n.id===selectedForge))selectedForge=forgeFocus(nodes).id;
      return forgeTabs()+'<div class="tree-toolbar forge-toolbar"><div><span class="eyebrow">DIVINE COVENANT</span><h3>女神の契約</h3></div><div class="forge-slots">'+['weapon','armor'].map(e=>'<button data-forge-slot="'+e+'" aria-pressed="'+(slot===e)+'">'+'<img src="'+art(gearArt(id(),e))+'" alt=""><span>'+(e==='weapon'?'武器':'防具')+'</span>'+ '</button>').join('')+'</div></div><div class="forge-progress"><span>取得 <b>'+owned.length+' / 41</b></span><span>SP <b>+'+owned.filter(n=>n.startsWith('goddess-sp-')).length*3+' / 30</b></span></div>'+forgeViewport(nodes,true)+'<div class="tree-bottom-caption">'+capMarkup(id(),slot)+'</div>'+selection(nodes,slot);
    }
    function forge(resetFocus) {
      if(forgeRegion==='goddess'&&!save.cleared.includes(P.Gem.Epic.GODDESS))forgeRegion=1;
      if(forgeRegion==='goddess')return goddessForge(resetFocus);
      const firstStage = (forgeRegion - 1) * 10 + 1;
      if (!save.cleared.includes(firstStage)) return forgeTabs() + '<div class="forge-page-locked">' + icon('lock') + '<h3>' + ForestData.REGIONS[forgeRegion - 1].name + ' / 鍛冶</h3><span>' + ForestData.stageLabel(firstStage) + ' クリア</span></div>';
      const nodes = P.gearTree(id(), slot, forgeRegion).filter(n => save.cleared.includes(n.stage) || save.progression.characters[id()][slot].includes(n.id)), owned = save.progression.characters[id()][slot].filter(uid => nodes.some(n => n.id === uid)), main = nodes.filter(n => n.main && owned.includes(n.id)).length;
      forgePlans = new Map(nodes.map(n => [n.id, P.gearPurchasePlan(save, id(), slot, n.id)]));
      if (resetFocus || !nodes.some(n => n.id === selectedForge)) selectedForge = forgeFocus(nodes).id;
      const milestones = P.gearBonuses(id(), slot), nextBonus = milestones.find(b => b.count > owned.length)?.count, all = owned.length === 100;
      return forgeTabs() + '<div class="tree-toolbar forge-toolbar"><div><span class="eyebrow">' + ForestData.REGIONS[forgeRegion - 1].english + '</span><h3>' + (ForestData.REGIONS[forgeRegion - 1].name + ' / 鍛冶') + '</h3></div><div class="forge-slots">' + ['weapon', 'armor'].map(e => '<button data-forge-slot="' + e + '" aria-pressed="' + (slot === e) + '"><img src="' + art(gearArt(id(),e)) + '" alt=""><span>' + (e === 'weapon' ? '武器' : '防具') + '</span></button>').join('') + '</div></div><div class="forge-progress"><span>主道 <b>' + main + ' / 10</b></span><span>全体 <b>' + owned.length + ' / 100</b></span><div class="forge-milestones">' + milestones.map(b => '<span class="' + (owned.length >= b.count ? 'achieved' : '') + '" tabindex="0" data-tip="' + b.count + 'ノード取得ボーナス\n' + escape(Object.entries(b.effect).map(([k,v]) => labels[k] + ' ' + (k === 'discount' ? '−' : '+') + (['skillPower','attackSpeed','discount'].includes(k) ? pct(v) : num(v))).join(' / ')) + '">' + (b.count === 100 ? '✦' : '◆') + '<small>' + b.count + '</small></span>').join('') + '</div><span class="next-generation" data-tip="地域ごとに100ノード。前地域の主道10取得から接続。" tabindex="0">' + (main === 10 ? '✦ 主道完成' : '主道 ' + icon('lock')) + '</span></div>' + forgeViewport(nodes) + '<div class="tree-bottom-caption"><span>' + (all ? '✦ COMPLETE' : '特典まで ' + (nextBonus - owned.length)) + '</span>' + capMarkup(id(), slot) + '<span>01 — 10　↔</span></div>' + selection(nodes, slot);
    }
    function render(which) {
      if (which) tab = which;
      $('menu-title').textContent = { character: '能力', skills: 'スキル', forge: '鍛冶' }[tab];
      $('menu-dialog').classList.add('growth-dialog');
      $('menu-content').innerHTML = roster() + '<div class="growth-tabs" role="tablist" aria-label="育成メニュー">' + [['character', '能力', 'user'], ['skills', 'スキル', 'spark'], ['forge', '鍛冶', 'sword']].map(([key, label, img]) => '<button id="growth-tab-' + key + '" role="tab" aria-controls="growth-panel" aria-selected="' + (tab === key) + '" data-growth-tab="' + key + '">' + icon(img) + label + '</button>').join('') + (isRunning() ? '<span class="next-run-hint" data-tip="育成・ジェムの変更は次の戦闘開始時に反映">' + icon('repeat') + '次戦反映</span>' : '<span>CHAPTER I</span>') + '</div><div class="growth-layout">' + profile() + '<section id="growth-panel" class="growth-content" role="tabpanel" aria-labelledby="growth-tab-' + tab + '">' + (tab === 'skills' ? skills() : tab === 'forge' ? forge(!!which) : attributes()) + '</section></div>';
      treeObserver.disconnect(); const view = document.querySelector('.skill-viewport'); if (view) treeObserver.observe(view);
      bindTree(); bindForgeTree();
      const forgeView = document.querySelector('.forge-viewport');
      if (forgeView && which) requestAnimationFrame(() => {
        if (!forgeView.isConnected) return;
        const node = forgeView.querySelector('.selected');
        if (!node) return;
        const viewRect = forgeView.getBoundingClientRect(), nodeRect = node.getBoundingClientRect();
        forgeView.scrollLeft += nodeRect.left + nodeRect.width / 2 - viewRect.left - forgeView.clientWidth / 2;
        forgeView.scrollTop += nodeRect.top + nodeRect.height / 2 - viewRect.top - forgeView.clientHeight / 2;
      });
    }
    function rerender(focus, fallbackFocus) {
      const view = document.querySelector('.tree-viewport'), left = view?.scrollLeft, treeTop = view?.scrollTop;
      const attributes = document.querySelector('.attributes-view'), top = attributes?.scrollTop;
      render(); if (left !== undefined) document.querySelector('.tree-viewport').scrollLeft = left;
      if (treeTop !== undefined) document.querySelector('.tree-viewport').scrollTop = treeTop;
      if (top !== undefined) document.querySelector('.attributes-view').scrollTop = top;
      if (focus) (document.querySelector(focus) || (fallbackFocus ? document.querySelector(fallbackFocus) : null))?.focus({ preventScroll: true });
      $('tooltip').hidden = true;
    }
    function handle(button) {
      const d = button.dataset;
      if (d.character) {
        if (!P.unlocked(save, d.character)) return true;
        onSelect(d.character); render(tab); document.querySelector('[data-character="' + d.character + '"]').focus({ preventScroll: true });
      } else if (d.growthTab) { tab = d.growthTab; render(tab); document.querySelector('#growth-tab-' + tab).focus(); }
      else if (d.gearOpen) { slot = d.gearOpen; tab = 'forge'; render(tab); }
      else if (d.forgeRegion) { forgeRegion = d.forgeRegion==='goddess'?'goddess':Number(d.forgeRegion); selectedForge = ['', '', 'swamp-', 'cave-', 'coast-', 'ruins-', 'desert-'][forgeRegion] + 'main-1'; render(tab); }
      else if (d.forgeSlot) { slot = d.forgeSlot; render(tab); }
      else if (d.growthNode) { if (d.kind === 'skills') selectedSkill = d.growthNode; else selectedForge = d.growthNode; rerender('[data-growth-node="' + d.growthNode + '"]'); }
      else if (d.buyNode) {
        if (P.purchase(save, id(), d.kind, d.buyNode)) { persist(); onChange(); notify(d.kind === 'skills' ? '習得完了' : '強化完了'); rerender('[data-growth-node="' + d.buyNode + '"]'); }
      } else if (d.buyGearPath) {
        const count = P.gearPurchasePlan(save, id(), d.kind, d.buyGearPath).nodes.length;
        if (P.purchaseGearPath(save, id(), d.kind, d.buyGearPath)) {
          persist(); onChange(); notify(count + 'ノード取得'); rerender('[data-growth-node="' + d.buyGearPath + '"]');
        }
      } else if (d.decreaseSkill) {
        const refunded = P.decreaseSkill(save, id(), d.decreaseSkill);
        if (refunded) {
          persist(); onChange(); notify('SP +' + refunded);
          rerender('[data-decrease-skill="' + d.decreaseSkill + '"]:not(:disabled)', '[data-growth-node="' + d.decreaseSkill + '"]');
        }
      } else if (button.hasAttribute('data-respec')) { P.respec(save,id()); persist(); onChange(); notify('SP返却'); rerender('[data-respec]'); }
      else if(d.treeZoom){zoom(d.treeZoom==='in'?1.2:1/1.2);}
      else if(button.hasAttribute('data-tree-reset')){cameras[id()]={x:24,y:5,scale:null};fitTree();}
      else if(button.hasAttribute('data-tree-current')){const lv=P.level(save.progression.characters[id()].xp);camera().x=100-(100+(lv-1)/5*180)*camera().scale;camera().y=0;fitTree();}
      else return false;
      return true;
    }
    return { render, handle };
  },
};
