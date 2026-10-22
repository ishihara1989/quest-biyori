'use strict';
window.TrialTreeUI={create({save,container,tabs,onStart,onAbandon}){
  const T=Trials,R=Reincarnation,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected='strength-2',planned=null,confirm='',scroll=[0,0];
  const names=ids=>ids.length?ids.map(id=>T.byId[id].name).join(' / '):'試練なし';
  const badge=id=>save.reincarnation.trials.includes(id)?'挑戦中':T.completed(save).includes(id)?'初クリア済':T.available(save,id)?'選択可能':'前提未クリア';
  function render(){
    if(planned===null)planned=[...save.reincarnation.trials];
    const old=container.querySelector('.trial-tree-viewport');if(old)scroll=[old.scrollLeft,old.scrollTop];
    const n=T.byId[selected],r=save.reincarnation,done=T.completed(save),active=T.summarize(r.trials),preview=T.summarize(planned),bonus=T.bonuses(save);
    if(confirm){
      const abandon=confirm==='abandon';
      container.innerHTML=tabs()+'<section class="trial-review rebirth-review"><img src="assets/ui/gems/goddess-page.png" alt=""><h3>'+(abandon?'試練を諦める':'新しい周回へ')+'</h3><p>'+esc(abandon?names(r.trials):names(planned))+'</p>'+(abandon?'<p>試練を解除して今周を続行します。<br>進行・育成・獲得済みPTは保持。戦闘中なら同じステージをやり直します。</p>':'<strong class="rebirth-points">＋'+R.payout(save).toLocaleString('ja-JP')+' <small>PT</small></strong><p>森1・Lv.1から再出発。所持品・ゴールド・装備・スキルを初期化します。'+(R.bonuses(save).allies?'仲間は最初から全員同行。':'仲間は再加入。')+'<br>転生ツリー・実績・初クリア記録は保持。恒常報酬を次の周に反映します。</p><p>'+(T.serious(save)?'両女神同時戦':'転生の女神')+' '+(R.eligible(save)?'撃破済み：今周のPTを精算':'未撃破：PTなしでリセット')+'</p>')+'<button class="primary-button" data-trial-confirm="'+confirm+'">'+(abandon?'試練を解除して続ける':'この条件で周回を始める')+'</button><button class="secondary-button" data-trial-cancel>戻る</button></section>';return;
    }
    if(!T.unlocked(save)){container.innerHTML=tabs()+'<section class="trial-locked"><img src="assets/ui/gems/goddess-page.png" alt=""><h3>試練の扉</h3><p>転生ツリー / 100 PT</p></section>';return;}
    const edges=T.definitions.flatMap(d=>d.requires.map(id=>{const p=T.byId[id];const path=p.y===d.y?'M'+(p.x+82)+','+p.y+' H'+(d.x-82):'M'+p.x+','+(p.y+44)+' V'+(d.y-60)+' H'+d.x+' V'+(d.y-44);return '<path class="'+(done.includes(id)?'owned':'')+'" d="'+path+'"/>';})).join('');
    container.innerHTML=tabs()+'<section class="trial-tree-page"><div class="trial-summary"><div><small>TRIALS / FIRST CLEAR '+done.length+' / '+T.definitions.length+'</small><h3>'+esc(names(r.trials))+'</h3><span>今周 転生PT ×'+active.reward+'</span></div><button class="secondary-button" data-trial-abandon '+(r.trialRun?'':'disabled')+'>諦める</button></div><div class="trial-permanent" data-tip="初クリアは転生の女神撃破で記録。女神の本気は両女神同時戦クリアが必要。恒常強化は次の周から。" tabindex="0"><span>恒常報酬</span><b>収穫 ×'+bonus.harvest+'</b><b>HP ×'+bonus.hp+'</b><b>攻撃力 ×'+bonus.damage+'</b><b>PT ×'+bonus.pt+'</b><b>素材費 −'+bonus.materialReduction+'%</b>'+(done.some(id=>!r.appliedTrials.includes(id))?'<em>新しい報酬あり · 次の周から</em>':'')+'</div><div class="trial-layout"><div class="trial-tree-viewport tree-viewport" tabindex="0" aria-label="試練ツリー"><div class="trial-map" style="width:800px;height:980px"><svg width="800" height="980" aria-hidden="true">'+edges+'</svg>'+T.definitions.map(d=>'<button class="trial-node '+(T.available(save,d.id)?'available':'locked')+' '+(done.includes(d.id)?'completed':'')+' '+(planned.includes(d.id)?'planned':'')+' '+(selected===d.id?'selected':'')+'" data-trial-node="'+d.id+'" style="left:'+(d.x-82)+'px;top:'+(d.y-44)+'px" aria-pressed="'+(selected===d.id)+'" data-tip="'+esc(d.name+'\n'+d.effect+'\n初クリア：'+d.prize)+'"><img src="assets/ui/'+d.image+'" alt=""><strong>'+d.name+'</strong><small>'+badge(d.id)+'</small></button>').join('')+'</div></div><aside class="trial-detail"><img src="assets/ui/'+n.image+'" alt=""><h3>'+n.name+'</h3><p class="node-state">'+badge(n.id)+'</p><div class="reinc-effect"><span>転生PT</span><b>×'+n.reward+'</b></div><p>'+esc(n.effect)+'</p><h4>初クリア報酬</h4><p class="trial-prize">'+esc(n.prize)+'</p><small>次の周から · '+(n.gateRelease?'他の素材費軽減と加算':'他の強化と乗算')+'</small><div class="reinc-prerequisites">'+n.requires.map(id=>'<button data-trial-node="'+id+'" class="'+(done.includes(id)?'owned':'')+'">'+(done.includes(id)?'✓ ':'◇ ')+T.byId[id].name+'</button>').join('')+'</div><button class="primary-button" data-trial-toggle="'+n.id+'" '+(T.available(save,n.id)?'':'disabled')+'>'+(planned.includes(n.id)?'選択を外す':'次の周に選択')+'</button></aside></div><div class="trial-start"><div><small>次の周</small><strong>'+esc(names(planned))+'</strong><span>転生PT ×'+preview.reward+'</span></div><button class="primary-button" data-trial-start>周回を始める</button></div><small class="trial-pan-hint">空白をドラッグして移動 · 初クリアで次の試練を解放</small></section>';
    const view=container.querySelector('.trial-tree-viewport');TreeNavigation.bind(view);view.scrollLeft=scroll[0];view.scrollTop=scroll[1];
  }
  container.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;
    if(b.dataset.trialNode){selected=b.dataset.trialNode;render();}
    else if(b.dataset.trialToggle){planned=T.toggle(save,planned,b.dataset.trialToggle);render();}
    else if(b.hasAttribute('data-trial-start')){confirm='start';render();}
    else if(b.hasAttribute('data-trial-abandon')&&save.reincarnation.trialRun){confirm='abandon';render();}
    else if(b.hasAttribute('data-trial-cancel')){confirm='';render();}
    else if(b.dataset.trialConfirm==='start'){b.disabled=true;onStart([...planned]);}
    else if(b.dataset.trialConfirm==='abandon'){confirm='';onAbandon();planned=[];render();}
  });
  return {render};
}};
