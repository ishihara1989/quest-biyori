'use strict';
window.GemDismantleUI = {
  create({ save, itemImage, itemTip, icon, notify, onChange, onInspect }) {
    const G = GemSystem, D = ForestData;
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const directions = { attack: ['攻撃', 'attack-gem'], defense: ['防御', 'defense-gem'], utility: ['補助', 'utility-gem'] };
    const bulk = G.freshDismantleFilter();
    function filters(settings, scope) {
      const field = (key, label, options, tip) => '<label>' + label + '<select data-gem-dismantle-scope="' + scope + '" data-gem-dismantle-field="' + key + '" data-tip="' + tip + '">' + options.map(([value, name]) => '<option value="' + value + '"' + (String(settings[key] ?? '') === value ? ' selected' : '') + '>' + name + '</option>').join('') + '</select></label>';
      return '<div class="gem-fields gem-dismantle-fields">' +
        field('maxLevel', 'レベル', [['', '指定なし'], ...D.REGIONS.filter(r => D.regionVisible(save,r.id)).map(r => [String(r.id), 'Lv.' + r.id + ' 以下 · ' + r.name])], '指定したレベル以下を対象にする。指定なしは条件から外す。') +
        field('maxRarity', 'レア度', [['', '指定なし'], ...Object.keys(G.TIERS).filter(r => G.rarityDiscovered(save,r)).map(r => [r, D.RARITIES[r].name + ' 以下'])], '指定したレア度以下を対象にする。指定なしは条件から外す。') +
        field('match', '条件', [['all', '両方'], ['any', '片方']], '両方：レベルとレア度の両方。片方：どちらか。両方とも指定なしの場合は解体しない。') + '</div>';
    }
    function rewards(shards) {
      return '<div class="gem-dismantle-rewards">' + Object.entries(shards).map(([key, n]) => '<span data-rarity="' + key.replace('gem-shard-', '') + '" data-tip="' + escape(D.ITEMS.find(i => i.id === key).name) + '"><img src="' + itemImage(key) + '" alt=""><b>+' + n.toLocaleString('ja-JP') + '</b></span>').join('') + '</div>';
    }
    function renderBulk() {
      const open = G.unlocked(save), plan = G.dismantlePlan(save, bulk), targets = new Set(plan.ids);
      return '<section class="gem-bulk-dismantle"><div class="gem-dismantle-heading"><h3>' + icon('gem') + '一括解体</h3><span data-tip="保護中・装着中のジェムは対象外。" tabindex="0">' + icon('lock') + '保護・装着除外</span></div>' +
        '<fieldset' + (!open ? ' disabled' : '') + '>' + filters(bulk, 'bulk') + effectExclusions(bulk, 'bulk') + '</fieldset>' +
        '<div class="gem-dismantle-preview"><strong>対象 <b data-gem-dismantle-count>' + plan.count + '</b> 個</strong>' + rewards(plan.shards) +
        '<button class="primary-button" data-gem-bulk-dismantle' + (!open || !plan.count ? ' disabled' : '') + '>' + icon('gem') + '解体</button></div>' +
        (!open ? '<span class="locked-message">遺跡 5-10 クリア</span>' : '') +
        '<div class="inventory-grid gem-dismantle-targets">' + save.gems.filter(g => targets.has(g.id)).map(gem => {
          const item = { ...G.describe(gem), type: 'gem' };
          return '<button class="item-cell gem-item" data-rarity="' + gem.rarity + '" data-gem-bulk-inspect="' + gem.id + '" data-tip="' + escape(itemTip(item)) + '" aria-label="' + escape(item.name) + 'を確認"><img src="' + item.image + '" alt="">'+(gem.rarity==='epic'?'':'<span class="gem-level">Lv.' + gem.level + '</span>')+'</button>';
        }).join('') + '</div></section>';
    }
    function exclusions(settings, group, rows, title, tip, scope = 'auto') {
      return '<div class="gem-dismantle-exclusions"><h4 data-tip="' + tip + '" tabindex="0">' + title + ' ' + icon('spark') + '</h4><div>' + rows.map(([id, name, image]) => {
        const checked = settings[group].includes(id);
        return '<button class="gem-exclusion" data-gem-' + scope + '-exclude="' + id + '" data-gem-' + scope + '-group="' + group + '" aria-pressed="' + checked + '" aria-label="' + name + 'を持つジェムを' + (scope === 'auto' ? '自動解体' : '一括解体') + 'から除外" data-tip="' + name + (checked ? 'を持つジェムは残す' : 'を持つジェムも条件に従って解体') + '"><img src="' + image + '" alt=""><span>' + name + '</span><b>' + (checked ? '✓' : '+') + '</b></button>';
      }).join('') + '</div></div>';
    }
    function effectExclusions(settings, scope) {
      return exclusions(settings, 'excludedEffects', Object.entries(G.OPTIONS).filter(([,option]) => D.isRevealed(save,option)&&Object.keys(G.TIERS).some(r=>G.rarityDiscovered(save,r)&&G.TIERS[r].rank>=(option.min||0))).map(([id, option]) => [id, option.name, G.TYPES['rare-' + id]?.image || G.TYPES['unique-' + id]?.image || G.TYPES['legendary-' + id]?.image || G.TYPES['epic-' + id]?.image]), '効果保護', '選択した効果を1つでも持つジェムは残す。主効果・副効果の両方を確認する。', scope);
    }
    function renderOptions() {
      const open = G.unlocked(save), settings = save.autoGemDismantle;
      return '<section class="gem-auto-dismantle"><div class="gem-dismantle-heading"><h3>' + icon('gem') + '自動解体</h3>' +
        '<button class="auto-gear-toggle" data-gem-auto-toggle aria-pressed="' + (open && settings.enabled) + '" data-tip="新しくドロップしたジェムを破片にする。所持済み・合成したジェムには適用しない。"' + (!open ? ' disabled' : '') + '>' + icon(open ? 'spark' : 'lock') + (open ? settings.enabled ? 'ON' : 'OFF' : '遺跡5-10クリア') + '</button></div>' +
        '<fieldset' + (!open ? ' disabled' : '') + '><legend data-tip="新しくドロップしたジェムのみ自動解体">新規取得</legend>' + filters(settings, 'auto') +
        exclusions(settings, 'excludedDirections', G.DIRECTIONS.map(id => [id, directions[id][0] + '容量', 'assets/ui/progression/' + directions[id][1] + '.png']), '容量保護', '選択した容量を1つでも持つジェムは残す。副効果による容量も含む。') +
        effectExclusions(settings, 'auto') + '</fieldset></section>';
    }
    function handle(button) {
      const d = button.dataset;
      if (button.hasAttribute('data-gem-bulk-dismantle')) {
        const plan = G.dismantlePlan(save, bulk);
        if (!plan.count) return true;
        const amounts = Object.entries(plan.shards).map(([key, n]) => D.ITEMS.find(i => i.id === key).name + ' +' + n.toLocaleString('ja-JP'));
        if (confirm('対象のジェム ' + plan.count + ' 個を解体しますか？\n' + amounts.join('\n') + '\n保護中・装着中は除外')) {
          const result = G.bulkDismantle(save, bulk);
          if (result) { onChange('bulk', true); notify('ジェム ' + result.count + ' 個を解体'); }
          else notify('破片上限');
        }
      } else if (d.gemBulkInspect) onInspect(Number(d.gemBulkInspect));
      else if (button.hasAttribute('data-gem-auto-toggle') || d.gemAutoExclude || d.gemBulkExclude) {
        if (!G.unlocked(save)) return true;
        const scope = d.gemBulkExclude ? 'bulk' : 'auto';
        const settings = scope === 'bulk' ? bulk : save.autoGemDismantle;
        const excluded = d.gemBulkExclude || d.gemAutoExclude, group = d.gemBulkGroup || d.gemAutoGroup;
        if (button.hasAttribute('data-gem-auto-toggle')) settings.enabled = !settings.enabled;
        else {
          const allowed = group === 'excludedDirections' ? G.DIRECTIONS : group === 'excludedEffects' ? Object.keys(G.OPTIONS) : [];
          if (!allowed.includes(excluded)) return true;
          const list = settings[group];
          settings[group] = list.includes(excluded) ? list.filter(id => id !== excluded) : [...list, excluded];
        }
        onChange(scope, scope === 'auto');
        const selector = excluded ? '[data-gem-' + scope + '-group="' + group + '"][data-gem-' + scope + '-exclude="' + excluded + '"]' : '[data-gem-auto-toggle]';
        document.querySelector(selector)?.focus({ preventScroll: true });
      } else return false;
      return true;
    }
    function change(input) {
      const d = input.dataset;
      if (!['bulk', 'auto'].includes(d.gemDismantleScope) || !['maxLevel', 'maxRarity', 'match'].includes(d.gemDismantleField)) return false;
      if (!G.unlocked(save)) return true;
      const settings = d.gemDismantleScope === 'bulk' ? bulk : save.autoGemDismantle;
      settings[d.gemDismantleField] = input.value === '' ? null : d.gemDismantleField === 'maxLevel' ? Number(input.value) : input.value;
      Object.assign(settings, G.restoreDismantleFilter(settings));
      onChange(d.gemDismantleScope, d.gemDismantleScope === 'auto');
      document.querySelector('[data-gem-dismantle-scope="' + d.gemDismantleScope + '"][data-gem-dismantle-field="' + d.gemDismantleField + '"]')?.focus({ preventScroll: true });
      return true;
    }
    return { renderBulk, renderOptions, handle, change };
  },
};
