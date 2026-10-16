'use strict';
window.ForestAutoGearUI = {
  create({ save, icon, onChange }) {
    const A = ForestAutoGear, P = ForestProgression;
    const names = { main: '主道', sub: '分岐', unique: '固有' };
    function priority(group) {
      const character = group === 'characters', excluded = character ? 'excludedCharacters' : 'excludedKinds';
      return '<div class="auto-gear-priority"><h4>' + (character ? '② キャラ' : '① 種別') + '</h4><ol>' + save.autoGear[group].filter(id => !character || P.unlocked(save,id)).map((id, index, order) => {
        const name = character ? P.CHARACTERS[id].name : names[id], included = !save.autoGear[excluded].includes(id), locked = character && !P.unlocked(save, id);
        const tip = name + (locked ? '\n' + ForestData.stageLabel(P.CHARACTERS[id].unlock) + ' クリアで加入' : '') + '\n' + (included ? '自動取得の対象' : '自動取得の対象外');
        return '<li data-priority-id="' + id + '" class="' + (included ? '' : 'excluded ') + (locked ? 'unrecruited' : '') + '"><b class="priority-rank">' + (index + 1) + '</b>' +
          '<button class="priority-target" data-gear-target="' + id + '" data-gear-group="' + group + '" aria-pressed="' + included + '" aria-label="' + name + 'の自動取得" data-tip="' + tip + '">' +
          (character ? '<img src="assets/' + id + '/idle-01.png" alt="">' : '<i class="priority-node ' + id + '">' + (id === 'unique' ? '✦' : '◆') + '</i>') + '<span>' + name + '</span><em>' + (included ? '✓' : 'OFF') + '</em></button>' +
          '<button class="priority-move" data-gear-move="' + id + '" data-gear-group="' + group + '" data-direction="-1" aria-label="' + name + 'の優先度を上げる" data-tip="優先度を上げる"' + (!index ? ' disabled' : '') + '>↑</button>' +
          '<button class="priority-move" data-gear-move="' + id + '" data-gear-group="' + group + '" data-direction="1" aria-label="' + name + 'の優先度を下げる" data-tip="優先度を下げる"' + (index === order.length - 1 ? ' disabled' : '') + '>↓</button></li>';
      }).join('') + '</ol></div>';
    }
    function render() {
      const unlocked = A.unlocked(save);
      return '<section class="auto-gear-options' + (unlocked ? '' : ' locked') + '"><div class="auto-gear-heading"><h3>' + icon('sword') + '自動強化</h3>' +
        '<button class="auto-gear-toggle" data-auto-gear-toggle aria-pressed="' + (unlocked && save.autoGear.enabled) + '" data-tip="素材・ゴールドを使い、武器と防具を自動で強化。ONにするとすぐに取得開始。"' + (!unlocked ? ' disabled' : '') + '>' + icon(unlocked ? 'spark' : 'lock') + (unlocked ? save.autoGear.enabled ? 'ON' : 'OFF' : '森10クリア') + '</button></div>' +
        '<fieldset' + (!unlocked ? ' disabled' : '') + '><legend class="auto-gear-hint" data-tip="上から優先。ノード種別 → キャラの順で、取得可能なノードを選択。素材不足・未解放のノードは飛ばし、次の候補を取得。✓で対象を切替。" tabindex="0">優先度 <span>↑ ↓</span> · 対象 <span>✓</span></legend><div class="auto-gear-priorities">' + priority('kinds') + priority('characters') + '</div></fieldset></section>';
    }
    function handle(button) {
      const d = button.dataset;
      if (!button.hasAttribute('data-auto-gear-toggle') && !d.gearMove && !d.gearTarget) return false;
      if (!A.unlocked(save)) return true;
      if (button.hasAttribute('data-auto-gear-toggle')) save.autoGear.enabled = !save.autoGear.enabled;
      else if (['kinds', 'characters'].includes(d.gearGroup)) {
        const list = save.autoGear[d.gearGroup], id = d.gearMove || d.gearTarget, visible = list.filter(row => d.gearGroup !== 'characters' || P.unlocked(save,row)), index = visible.indexOf(id);
        if (index < 0) return true;
        if (d.gearMove) {
          const next = index + Number(d.direction);
          if (![-1, 1].includes(Number(d.direction)) || next < 0 || next >= visible.length) return true;
          const from = list.indexOf(id), to = list.indexOf(visible[next]);
          [list[from], list[to]] = [list[to], list[from]];
        } else {
          const key = d.gearGroup === 'kinds' ? 'excludedKinds' : 'excludedCharacters', excluded = save.autoGear[key];
          save.autoGear[key] = excluded.includes(id) ? excluded.filter(row => row !== id) : [...excluded, id];
        }
      }
      const focus = button.hasAttribute('data-auto-gear-toggle') ? '[data-auto-gear-toggle]' : '[data-gear-target="' + (d.gearMove || d.gearTarget) + '"]';
      onChange(focus);
      return true;
    }
    return { render, handle };
  },
};
