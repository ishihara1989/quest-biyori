'use strict';
window.ForestConversionUI = {
  create({ save, itemImage, itemTip, icon, initialRegion = 1, onConvert }) {
    const C = ForestConversion, D = ForestData;
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const format = value => value.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
    let region = initialRegion, container, feedback = null;
    const selectedOutputs = new Map();
    const item = id => D.ITEMS.find(row => row.id === id);
    const visibleRecipes = () => C.RECIPES.filter(recipe => recipe.stages.every(id => save.cleared.includes(id)) &&
      [...Object.keys(recipe.inputs), recipe.output].every(id => D.itemDiscovered(save, item(id))));
    const visibleRegions = () => C.REGIONS.filter(row => visibleRecipes().some(recipe => recipe.region === row.id));
    const inputLabel = (recipe, times = 1) => recipe.gold ? format(recipe.gold * times) + ' G' :
      Object.entries(recipe.inputs).map(([id, count]) => item(id).name + ' ×' + format(count * times)).join(' ＋ ');
    function goldIngredient(amount) {
      return '<span class="conversion-material ' + (save.gold < amount ? 'insufficient' : '') + '" data-tip="ゴールド" tabindex="0">' +
        '<span class="conversion-art"><img src="assets/ui/items/gold.png" alt="ゴールド"><b>' + format(amount) + ' G</b></span>' +
        '<strong>ゴールド</strong><small>所持 <b>' + format(save.gold) + '</b></small></span>';
    }
    function ingredient(id, amount, input) {
      const material = item(id), owned = save.inventory[id] || 0;
      return '<span class="conversion-material ' + (input && owned < amount ? 'insufficient' : '') + '" data-rarity="' + material.rarity + '" data-tip="' + escape(itemTip(material)) + '" tabindex="0">' +
        '<span class="conversion-art"><img src="' + itemImage(id) + '" alt="' + escape(material.name) + '"><b>×' + amount + '</b></span>' +
        '<strong>' + escape(material.name) + '</strong><small>所持 <b>' + format(owned) + '</b></small></span>';
    }
    function recipeCard(recipe, choices) {
      const plan = C.plan(save, recipe.id), locked = plan.status === 'locked';
      const requirement = plan.lockedStages.map(D.stageLabel).join(' / ') + ' クリア';
      const action = recipe.gold ? '購入' : '変換';
      const label = inputLabel(recipe) + ' → ' + item(recipe.output).name + ' ×' + recipe.amount;
      const blocked = locked ? requirement : plan.status === 'overflow' ? '所持数上限' : plan.status === 'invalid' ? '所持数不正' : recipe.gold ? 'ゴールド不足' : '素材不足';
      const options = choices.length > 1 ? '<div class="conversion-choices" role="group" aria-label="獲得素材を選択">' + choices.map(row => '<button data-conversion-choice="' + row.id + '" aria-pressed="' + (row.id === recipe.id) + '" data-tip="' + escape(itemTip(item(row.output))) + '"><img src="' + itemImage(row.output) + '" alt=""><span>' + escape(item(row.output).name) + '</span><b>×' + row.amount + '</b></button>').join('') + '</div>' : '';
      return '<article class="conversion-card ' + (locked ? 'locked ' : '') + (feedback?.recipe === recipe.id ? 'converted' : '') + '" data-recipe="' + recipe.id + '" data-rarity="' + item(recipe.output).rarity + '" aria-label="' + escape(label) + '">' + options +
        '<div class="conversion-formula"><div class="conversion-inputs">' + (recipe.gold ? goldIngredient(recipe.gold) : Object.entries(recipe.inputs).map(([id, count]) => ingredient(id, count, true)).join('<span class="conversion-plus" aria-hidden="true">＋</span>')) + '</div>' +
        '<span class="conversion-arrow" aria-hidden="true">' + icon('arrow') + '</span><div class="conversion-output">' + ingredient(recipe.output, recipe.amount, false) + '<i class="conversion-spark" aria-hidden="true">✦</i></div></div>' +
        '<div class="conversion-actions"><span class="conversion-state">' + (plan.status === 'available' ? icon('check') + action + '可能' : icon(locked ? 'lock' : 'bag') + escape(blocked)) + '</span>' +
        [1, 10, 100, 'max'].map(value => {
          const times = value === 'max' ? plan.max : value;
          const tip = inputLabel(recipe, times) + ' → ' + item(recipe.output).name + ' ×' + format(recipe.amount * times);
          return '<button class="' + (value === 1 ? 'primary' : 'secondary') + '-button" data-convert="' + recipe.id + '" data-convert-times="' + value + '"' + (value === 'max' ? ' data-convert-max' : '') + ' aria-label="' + escape(label + 'を' + (value === 'max' ? '最大' : '') + times + (recipe.gold ? '個購入' : '回変換')) + '" data-tip="' + escape(tip) + '"' + (!times || times > plan.max ? ' disabled' : '') + '>' + (value === 'max' ? '最大 <b>×' + format(times) + '</b>' : times + (recipe.gold ? '個' : '回')) + '</button>';
        }).join('') + '</div></article>';
    }
    function render(target = container, focusSelector) {
      container = target;
      const regions = visibleRegions(), recipes = visibleRecipes();
      if (!regions.some(row => row.id === region)) region = regions[0]?.id;
      const groups = C.CATEGORIES.map(category => {
        const choices = recipes.filter(recipe => recipe.region === region && recipe.category === category.id);
        const selected = choices.find(recipe => recipe.output === selectedOutputs.get(region + '-' + category.id)) || choices[0];
        return selected ? '<section class="conversion-group" aria-label="' + category.from + 'から' + category.to + '"><h3>' + category.from + icon('arrow') + category.to + '</h3>' + recipeCard(selected, choices) + '</section>' : '';
      }).join('');
      const notice = feedback ? '<img src="' + itemImage(feedback.output) + '" alt=""><span>' + escape(item(feedback.output).name) + '</span><b>＋' + format(feedback.amount) + '</b>' : '';
      container.innerHTML = '<div class="conversion-page"><div class="conversion-tabs" role="tablist" aria-label="素材変換のステージ">' + regions.map(row =>
        '<button role="tab" id="conversion-region-tab-' + row.id + '" data-conversion-region="' + row.id + '" aria-selected="' + (row.id === region) + '" aria-controls="conversion-recipes" tabindex="' + (row.id === region ? 0 : -1) + '" data-tip="' + escape(row.name) + '">' + icon(save.cleared.some(id => D.STAGES.find(stage => stage.id === id)?.region === row.id) ? 'map' : 'lock') + escape(row.name) + '</button>').join('') + '</div>' +
        '<div class="conversion-feedback" role="status" aria-live="polite">' + notice + '</div>' +
        '<div id="conversion-recipes" class="conversion-recipes" role="tabpanel"' + (region ? ' aria-labelledby="conversion-region-tab-' + region + '"' : '') + '>' + (groups || '<p class="gem-empty">変換対象なし</p>') + '</div>' +
        '</div>';
      if (focusSelector) {
        const next = container.querySelector(focusSelector);
        if (next && !next.disabled) next.focus({ preventScroll: true });
        else container.querySelector('[data-conversion-region="' + region + '"]')?.focus({ preventScroll: true });
      }
    }
    function handle(button) {
      if (button.dataset.conversionRegion) {
        region = Number(button.dataset.conversionRegion); feedback = null;
        render(container, '[data-conversion-region="' + region + '"]'); return true;
      }
      if (button.dataset.conversionChoice) {
        const recipe = C.RECIPES.find(row => row.id === button.dataset.conversionChoice);
        selectedOutputs.set(region + '-' + recipe.category, recipe.output); feedback = null;
        render(container, '[data-conversion-choice="' + recipe.id + '"]'); return true;
      }
      if (!button.dataset.convert) return false;
      const id = button.dataset.convert, maximum = button.hasAttribute('data-convert-max');
      const transaction = C.plan(save, id), times = maximum ? transaction.max : Number(button.dataset.convertTimes || 1);
      if (C.convert(save, id, times)) {
        feedback = { recipe: id, output: transaction.recipe.output, amount: transaction.recipe.amount * times };
        onConvert();
        document.getElementById('tooltip').hidden = true;
        render(container, '[data-convert="' + id + '"][data-convert-times="' + (maximum ? 'max' : times) + '"]');
      }
      return true;
    }
    function keydown(event) {
      if (!event.target.matches('[data-conversion-region]')) return;
      const regions = visibleRegions(); if (!regions.length) return;
      const index = regions.findIndex(row => row.id === region), last = regions.length - 1;
      const next = { ArrowRight: (index + 1) % regions.length, ArrowLeft: (index + last) % regions.length, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault(); region = regions[next].id; feedback = null;
      render(container, '[data-conversion-region="' + region + '"]');
    }
    return { render, handle, keydown };
  },
};
