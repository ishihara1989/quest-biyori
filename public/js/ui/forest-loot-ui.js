'use strict';
window.ForestLootUI = {
  create({ itemImage, itemTip, icon, reduced, gemItems = () => [] }) {
    const $ = id => document.getElementById(id), D = ForestData, L = ForestLoot;
    let plan, shown = new Set(), groupShown = new Set(), completed = false, recruitDuration = 0, recruited = null, unlockDuration = 0, skipped = false;
    const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function render({ victory, rewards, loot, gold, stage, save, elapsed, kills, xp, failureReason, trialReward = 1, skip = false, repeatDelay = L.REPEAT_DELAY }) {
      skipped = skip;
      plan = L.presentation(loot, gold, { reduced: reduced || skipped, gemItems: gemItems(), repeatDelay }); shown = new Set(); groupShown = new Set(); completed = false;
      recruited = victory ? rewards.recruited : null;
      recruitDuration = recruited && !skipped ? (reduced ? 2200 : 4600) : 0;
      const unlocks = victory ? rewards.unlocks || [] : [];
      const specialUnlock = unlocks.find(entry => entry.special), rebirth=unlocks.some(entry=>entry.rebirth), divine=specialUnlock?.reincarnation||rebirth, riftUnlocked = !!specialUnlock;
      unlockDuration = unlocks.length && !skipped ? (reduced ? 2600 : divine ? 7600 : specialUnlock?.final ? 6400 : riftUnlocked ? 4600 : 3200) : 0;
      const introDuration = recruitDuration + unlockDuration;
      // Recruitment leads, then features, then the chest and automatic repeat.
      plan.completeAt += introDuration; plan.repeatAt += introDuration;
      $('recruit-intro').hidden = !recruitDuration;
      $('recruit-intro').classList.remove('exiting');
      $('unlock-intro').hidden = !unlockDuration || !!recruited;
      $('unlock-intro').classList.remove('exiting');
      $('unlock-intro').classList.toggle('rift-unlocked', riftUnlocked && !divine);
      $('unlock-intro').classList.toggle('chaos-unlocked', specialUnlock?.id === 'chaos-gate');
      $('unlock-intro').classList.toggle('goddess-unlocked',!!specialUnlock?.final);
      $('unlock-intro').classList.toggle('reincarnation-unlocked',!!specialUnlock?.reincarnation);
      $('unlock-intro').classList.toggle('rebirth-unlocked',rebirth);
      document.querySelector('.unlock-kicker').textContent=rebirth?'REINCARNATION AWAKENED':specialUnlock?.reincarnation?'A GODDESS DESCENDS':'UNLOCKED';
      $('unlock-title').textContent = rebirth ? '転生、解放' : specialUnlock?.title || '新規解放';
      $('unlock-intro').style.setProperty('--unlock-duration', unlockDuration + 'ms');
      $('unlock-cards').innerHTML = unlocks.map((entry, index) => '<article class="unlock-card" data-unlock-id="' + escape(entry.id) + '" style="--card-delay:' + (index * 130) + 'ms"><span>' + icon(entry.icon) + '</span><div><strong>' + escape(entry.title) + '</strong><small>' + escape(entry.detail) + '</small></div><i>NEW</i></article>').join('');
      $('unlock-particles').innerHTML = Array.from({ length: 16 }, (_, i) => '<i style="--angle:' + (i * 137.5) + 'deg;--radius:' + (100 + i % 4 * 30) + 'px;--delay:' + (i % 4 * 100) + 'ms">✧</i>').join('');
      if(divine)for(const particle of $('unlock-particles').children)particle.innerHTML='<img src="assets/enemies/reincarnation-goddess/motions/fx-impact/frame-1.png" alt="">';
      $('result-unlocks').hidden = !unlocks.length;
      $('result-unlocks').innerHTML = unlocks.map(entry => '<span data-tip="' + escape(entry.detail) + '" tabindex="0">' + icon(entry.icon) + escape(entry.title) + '<i>NEW</i></span>').join('');
      document.querySelector('.result-panel').hidden = !!introDuration;
      $('result-overlay').setAttribute('aria-labelledby', recruitDuration ? 'recruit-title' : unlockDuration ? 'unlock-title' : 'result-title');
      $('recruit-continue').firstChild.textContent = unlockDuration ? '解放 ' : '報酬 ';
      if (recruited) {
        const character = ForestProgression.CHARACTERS[recruited];
        $('recruit-intro').style.setProperty('--recruit-color', character.color);
        $('recruit-intro').style.setProperty('--recruit-duration', recruitDuration + 'ms');
        $('recruit-portrait').src = 'assets/' + recruited + '/idle-01.png';
        $('recruit-portrait').alt = character.name;
        $('recruit-class').textContent = character.english;
        $('recruit-title').textContent = character.name;
        $('recruit-particles').innerHTML = Array.from({ length: 28 }, (_, i) => '<i style="--angle:' + (i * 137.5) + 'deg;--radius:' + (140 + i % 6 * 28) + 'px;--delay:' + (i % 7 * 90) + 'ms">✦</i>').join('');
      }
      $('result-overlay').classList.toggle('defeat', !victory);
      $('result-overlay').classList.toggle('result-skipped', skipped);
      $('result-overlay').classList.remove('loot-complete');
      $('loot-flash').classList.remove('flash');
      $('result-chest').dataset.frame = reduced ? 3 : 0;
      $('result-chest').style.backgroundPosition = reduced ? '100% 100%' : '0% 0%';
      $('chest-stage').classList.toggle('opened', reduced);
      $('result-kicker').textContent = victory ? stage.special ? 'SPECIAL CLEAR' : rewards.first ? 'FIRST CLEAR' : 'STAGE CLEAR' : 'DEFEAT';
      $('result-title').textContent = victory ? '勝利' : '敗北';
      $('result-stage').textContent = stage.special ? stage.realmName + ' / ' + stage.name : stage.region + ' — ' + String(stage.number).padStart(2, '0') + '  /  ' + stage.name;
      if(!victory&&failureReason==='timeout')$('result-title').textContent='時間切れ';
      $('result-run-stats').innerHTML = '<span>' + icon('clock') + Math.floor(elapsed / 60000) + ':' + String(Math.floor(elapsed / 1000) % 60).padStart(2, '0') + '</span><span>' + icon('sword') + kills + ' 体撃破</span>' + (trialReward>1?'<span>転生PT <b>×'+trialReward+'</b></span>':'') + (xp ? '<span>EXP <b>' + escape(xp) + '</b></span>' : '');
      $('result-gold').textContent = '+' + gold.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
      $('result-gold-note').textContent = victory ? '撃破分 +' + (gold - rewards.gold) + ' / クリア +' + rewards.gold : 'クリア報酬なし';
      $('result-recruit').hidden = !rewards.recruited; if(rewards.recruited){const c=ForestProgression.CHARACTERS[rewards.recruited],img=$('result-recruit').querySelector('img');img.src='assets/'+rewards.recruited+'/idle-01.png';img.alt=c.name;$('result-recruit').querySelector('strong').textContent=c.name;} document.querySelector('.treasure-caption').textContent = 'REWARDS';
      $('result-rewards').innerHTML = plan.groups.map(group => {
        const info = D.RARITIES[group.rarity];
        return '<section class="loot-rarity-group" data-rarity="' + group.rarity + '" data-loot-group="' + group.rarity + '" hidden><div class="loot-group-heading"><span>◆ ' + info.english + '</span><small>' + info.name + ' · ' + group.count + '種</small></div><div class="loot-result-grid">' + plan.entries.filter(row => row.rarity === group.rarity).map(row =>
          '<button class="loot-result-item" data-rarity="' + row.rarity + '" data-loot-id="' + row.id + '" data-item="' + row.id + '" data-tip="' + escape(itemTip(row)) + '" hidden><span class="loot-item-art"><img src="' + itemImage(row.id) + '" alt=""><i class="loot-star">✦</i></span><span class="loot-item-label"><strong>' + row.name + '</strong><small>' + info.name + '</small></span><b>×' + row.count + '</b></button>').join('') + '</div></section>';
      }).join('') || '<p class="loot-empty">獲得品なし</p>';
      $('result-rewards').scrollTop = 0;
      $('result-count').textContent = plan.entries.length + ' 種';
      $('loot-status').textContent = reduced ? '獲得品' : '開封中';
      $('result-skip').hidden = reduced;
      $('retry-button').querySelector('span').textContent = victory ? '再戦' : '再挑戦';
      const next = D.nextStage(stage.id, save);
      $('next-button').hidden = !victory || !next || !D.isUnlocked(save, next.id);
      tick(0);
      return plan;
    }
    function tick(age) {
      if (!plan) return;
      if (age < recruitDuration) {
        $('recruit-intro').classList.toggle('exiting', !reduced && age >= recruitDuration - 450);
        if (!reduced) $('recruit-portrait').src = 'assets/' + recruited + '/idle-0' + (1 + Math.floor(age / 180) % 4) + '.png';
        return;
      }
      if (!$('recruit-intro').hidden) {
        const moveFocus = $('recruit-intro').contains(document.activeElement);
        $('recruit-intro').hidden = true;
        $('unlock-intro').hidden = !unlockDuration || age >= recruitDuration + unlockDuration;
        document.querySelector('.result-panel').hidden = age < recruitDuration + unlockDuration;
        $('result-overlay').setAttribute('aria-labelledby', !$('unlock-intro').hidden ? 'unlock-title' : 'result-title');
        if (moveFocus) (!$('unlock-intro').hidden ? $('unlock-continue') : $('result-skip').hidden ? $('retry-button') : $('result-skip')).focus({ preventScroll: true });
      }
      const introDuration = recruitDuration + unlockDuration;
      if (age < introDuration) {
        $('unlock-intro').classList.toggle('exiting', !reduced && age >= introDuration - 350);
        return;
      }
      if (!$('unlock-intro').hidden) {
        const moveFocus = $('unlock-intro').contains(document.activeElement);
        $('unlock-intro').hidden = true; document.querySelector('.result-panel').hidden = false;
        $('result-overlay').setAttribute('aria-labelledby', 'result-title');
        if (moveFocus) ($('result-skip').hidden ? $('retry-button') : $('result-skip')).focus({ preventScroll: true });
      }
      const lootAge = age - introDuration;
      const chest = $('result-chest');
      const frame = L.chestFrame(lootAge, reduced || skipped);
      chest.style.backgroundPosition = [[0, 0], [100, 0], [0, 100], [100, 100]][frame].map(n => n + '%').join(' ');
      chest.dataset.frame = frame;
      $('chest-stage').classList.toggle('opened', frame === 3);
      for (const group of plan.groups) if (lootAge >= group.at && !groupShown.has(group.rarity)) {
        groupShown.add(group.rarity);
        $('result-rewards').querySelector('[data-loot-group="' + group.rarity + '"]').hidden = false;
        $('loot-status').textContent = D.RARITIES[group.rarity].name + 'の獲得品';
      }
      for (const row of plan.entries) if (lootAge >= row.at && !shown.has(row.id)) {
        shown.add(row.id);
        const cell = $('result-rewards').querySelector('[data-loot-id="' + row.id + '"]'); cell.hidden = false;
        const rewards = $('result-rewards'); rewards.scrollTop = rewards.scrollHeight - rewards.clientHeight;
        $('loot-flash').dataset.rarity = row.rarity;
        if (!reduced && !skipped) { $('loot-flash').classList.remove('flash'); void $('loot-flash').offsetWidth; $('loot-flash').classList.add('flash'); }
      }
      if (age >= plan.completeAt && !completed) {
        completed = true; $('result-overlay').classList.add('loot-complete');
        if (document.activeElement === $('result-skip')) $('retry-button').focus({ preventScroll: true });
        $('loot-status').textContent = '獲得完了'; $('result-skip').hidden = true;
      }
    }
    return { render, tick, get plan() { return plan; }, get recruitDuration() { return recruitDuration; }, get introDuration() { return recruitDuration + unlockDuration; } };
  },
};
