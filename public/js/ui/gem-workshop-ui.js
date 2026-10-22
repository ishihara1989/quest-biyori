'use strict';
window.GemWorkshopUI = {
  create({ save, itemImage, icon, notify, onChange, onCraft }) {
    const G = GemSystem, P = ForestProgression, D = ForestData;
    const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let rarity = 'unique', level = 1, family = 'attack', lastCraft = null;
    const upgradeTargets = {};
    const rarities = () => Object.keys(G.TIERS).filter(r => G.rarityDiscovered(save,r));
    const count = key => (save.inventory[key] || 0).toLocaleString('ja-JP');
    const conversionMax = r => {
      const next = Object.keys(G.TIERS)[G.TIERS[r].rank + 1];
      return Math.min(Math.floor((save.inventory[G.shardKey(r)] || 0) / 10), Number.MAX_SAFE_INTEGER - (save.inventory[G.shardKey(next)] || 0));
    };
    function costs(cost) {
      return '<div class="gem-costs">' + Object.entries(cost || {}).filter(([key]) => D.itemDiscovered(save,D.ITEMS.find(i=>i.id===key))).map(([key,n]) => {
        const item = D.ITEMS.find(i=>i.id===key);
        return '<span class="' + ((save.inventory[key]||0)<n?'short':'') + '" data-tip="'+escape(item?.name||key)+'"><img src="'+itemImage(key)+'" alt="'+escape(item?.name||key)+'"><b>'+n.toLocaleString('ja-JP')+'</b><small> / '+count(key)+'</small></span>';
      }).join('') + '</div>';
    }
    function wallet() {
      return '<div class="gem-wallet">' + rarities().map(r => {
        const tiers=Object.keys(G.TIERS),rank=tiers.indexOf(r),next=tiers[rank+1];
        const convert=next&&G.rarityDiscovered(save,next)&&G.unlocked(save)&&(rank!==2||P.known(save,G.Epic.GODDESS));
        const max = convert ? conversionMax(r) : 0;
        const buttons = convert ? '<div class="gem-conversion-actions">' + [1, 10, 100, 'max'].map(value => {
          const times = value === 'max' ? max : value;
          const tip = D.RARITIES[r].name+'破片 '+(times*10).toLocaleString('ja-JP')+' → '+D.RARITIES[next].name+'破片 '+times.toLocaleString('ja-JP');
          return '<button class="secondary-button" data-gem-convert="'+r+'" data-gem-convert-times="'+value+'" data-tip="'+tip+'" aria-label="'+D.RARITIES[r].name+'破片を'+(value==='max'?'最大':'')+times+'回変換"'+(!times||times>max?' disabled':'')+'>'+(value==='max'?'最大':times+'回')+'</button>';
        }).join('')+'</div>' : '';
        return '<div data-rarity="'+r+'"><img src="'+itemImage(G.shardKey(r))+'" alt="'+D.RARITIES[r].name+'の破片"><b>'+count(G.shardKey(r))+'</b>'+buttons+'</div>';
      }).join('')+'</div>';
    }
    function renderEpic(){
      const defs=Object.values(G.Epic.DEFINITIONS).filter(d=>P.unlocked(save,d.job)),open=P.known(save,G.Epic.GODDESS);if(!defs.some(d=>d.family===family))family=defs[0].family;
      const intrinsic=!G.epicPool(save).includes(family),d=G.Epic.DEFINITIONS[family],recipe=G.craftRecipe('epic',null,family,save),last=save.gems.find(g=>g.id===lastCraft),result=last&&G.describe(last);
      return '<section class="gem-workshop">'+wallet()+'<div class="gem-craft-layout"><div class="gem-craft-art" data-rarity="epic"><img src="'+d.image+'" alt="'+d.name+'"><strong>'+d.name+'</strong><span>EPIC</span></div><div class="gem-craft-controls"><div class="gem-fields"><label>レア度<select data-gem-craft-field="rarity">'+rarities().map(r=>'<option value="'+r+'"'+(r==='epic'?' selected':'')+'>'+D.RARITIES[r].name+'</option>').join('')+'</select></label><label>ジェム<select data-gem-craft-field="family">'+defs.map(g=>'<option value="'+g.family+'"'+(g.family===family?' selected':'')+'>'+P.CHARACTERS[g.job].name+'・'+(g.slot==='weapon'?'武器':'防具')+' / '+g.name+'</option>').join('')+'</select></label></div><div class="epic-effect-parameters">'+escape(d.note)+'</div>'+costs(recipe)+'<button class="primary-button" data-gem-craft'+(!open||intrinsic||!G.canPay(save,recipe)?' disabled':'')+'><img src="assets/ui/gems/forge.png" alt="">'+(intrinsic?'恒常取得済み':'制作')+'</button>'+(!open?'<span class="locked-message">異次元の女神 クリア</span>':'')+'</div></div>'+(result?'<button class="gem-craft-result" data-gem-result="'+result.id+'" data-rarity="'+result.rarity+'"><img src="'+result.image+'" alt=""><span><strong>'+result.name+'</strong><small>'+result.note+'</small></span></button>':'')+'</section>';
    }
    function render() {
      if(!G.unlocked(save)||!rarities().length)return '<section class="gem-workshop">'+wallet()+'<p class="gem-empty">制作対象なし</p></section>';
      if(!rarities().includes(rarity))rarity=rarities()[0];
      if(rarity==='epic')return renderEpic();
      const max = G.maxLevel(save), open = G.unlocked(save);
      level = Math.min(Math.max(level,rarity==='legendary'?6:1),max);
      const families = Object.keys(G.OPTIONS).filter(key=>G.TYPES[rarity+'-'+key]);
      if (!families.includes(family)) family = 'attack';
      const recipe = G.craftRecipe(rarity,level,family,save), type = G.TYPES[rarity+'-'+family];
      const last = save.gems.find(g=>g.id===lastCraft), result = last && G.describe(last);
      return '<section class="gem-workshop">'+wallet()+'<div class="gem-craft-layout"><div class="gem-craft-art" data-rarity="'+rarity+'"><img src="'+type.image+'" alt="'+type.name+'"><strong>'+type.name+'</strong><span>Lv.'+level+'</span></div><div class="gem-craft-controls"><div class="gem-fields"><label>レア度<select data-gem-craft-field="rarity">'+rarities().map(r=>'<option value="'+r+'"'+(r===rarity?' selected':'')+(r==='legendary'&&max<6||r==='epic'&&!P.known(save,G.Epic.GODDESS)?' disabled':'')+'>'+D.RARITIES[r].name+'</option>').join('')+'</select></label><label>地域<select data-gem-craft-field="level">'+D.REGIONS.filter(r=>r.id<=max&&D.regionVisible(save,r.id)&&(rarity!=='legendary'||r.id>=6)).map(r=>'<option value="'+r.id+'"'+(r.id===level?' selected':'')+'>'+r.name+' · Lv.'+r.id+'</option>').join('')+'</select></label><label>主系統<select data-gem-craft-field="family">'+families.map(key=>'<option value="'+key+'"'+(family===key?' selected':'')+'>'+G.OPTIONS[key].name+'</option>').join('')+'</select></label></div>'+costs(recipe)+'<button class="primary-button" data-gem-craft'+(!open||!G.canPay(save,recipe)?' disabled':'')+'><img src="assets/ui/gems/forge.png" alt="">合成</button><span class="gem-craft-hint" data-tip="主系統を保証。副効果・品質はランダム。">ランダム '+icon('spark')+'</span>'+(!open?'<span class="locked-message">遺跡 5-10 クリア</span>':'')+'</div></div>'+(result?'<button class="gem-craft-result" data-gem-result="'+result.id+'" data-rarity="'+result.rarity+'"><img src="'+result.image+'" alt=""><span><strong>'+result.name+'</strong><small>'+result.note+'</small></span>'+icon('arrow')+'</button>':'')+'</section>';
    }
    function actions(gem) {
      const open = G.unlocked(save), owner = P.gemOwner(save,gem.id), max = G.maxLevel(save);
      if (!open) return '<div class="gem-management"><button class="secondary-button" data-gem-lock="'+gem.id+'" aria-pressed="'+gem.locked+'" data-tip="'+(gem.locked?'保護を解除':'解体から保護')+'">'+icon('lock')+(gem.locked?'保護中':'保護')+'</button></div>';
      const target = Math.min(max,Math.max(gem.level+1,upgradeTargets[gem.id]||gem.level+1)), recipe = G.upgradeRecipe(gem,target);
      return '<div class="gem-management"><button class="secondary-button" data-gem-lock="'+gem.id+'" aria-pressed="'+gem.locked+'" data-tip="'+(gem.locked?'保護を解除':'解体から保護')+'">'+icon('lock')+(gem.locked?'保護中':'保護')+'</button><button class="secondary-button" data-gem-dismantle="'+gem.id+'"'+(!open||owner||gem.locked?' disabled':'')+' data-tip="'+(!open?'遺跡 5-10 クリア':owner?'装着中':gem.locked?'保護中':'解体')+'"><img src="'+itemImage(G.shardKey(gem.rarity))+'" alt="">解体 +'+G.salvage(gem)+'</button>'+(recipe&&target<=max?'<div class="gem-upgrade"><label class="gem-upgrade-level">Lv.<select data-gem-upgrade-field="'+gem.id+'" aria-label="アップグレード先">'+Array.from({length:max-gem.level},(_,i)=>gem.level+i+1).map(l=>'<option value="'+l+'"'+(target===l?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+costs(recipe)+'<button class="secondary-button" data-gem-upgrade="'+gem.id+'" data-target-level="'+target+'"'+(!open||!G.canPay(save,recipe)?' disabled':'')+'><img src="assets/ui/gems/upgrade.png" alt="">Lv.'+target+'</button></div>':'')+'</div>';
    }
    function handle(button) {
      const d = button.dataset;
      if (button.hasAttribute('data-gem-craft')) {
        const gem = G.craft(save,rarity,level,family);
        if (gem) {lastCraft=gem.id;onChange();notify(D.RARITIES[gem.rarity].name+' · '+G.describe(gem).name);}
      } else if (d.gemConvert) {
        const times = d.gemConvertTimes === 'max' ? conversionMax(d.gemConvert) : Number(d.gemConvertTimes || 1);
        if (G.convert(save,d.gemConvert,times)) {onChange();notify('破片 '+(times*10).toLocaleString('ja-JP')+' → '+times.toLocaleString('ja-JP'));}
      } else if (d.gemLock) {
        const gem = P.gemInstance(save,d.gemLock);if(gem){gem.locked=!gem.locked;onChange();}
      } else if (d.gemDismantle) {
        const gem = P.gemInstance(save,d.gemDismantle);
        if(gem&&!gem.locked&&!P.gemOwner(save,gem.id)&&confirm(G.describe(gem).name+'を解体しますか？\n'+D.RARITIES[gem.rarity].name+'破片 +'+G.salvage(gem))&&G.dismantle(save,gem.id)){onChange();notify('破片 +'+G.salvage(gem));}
      } else if (d.gemUpgrade) {
        if(G.upgrade(save,d.gemUpgrade,Number(d.targetLevel))){onChange();notify('ジェム Lv.'+d.targetLevel);}
      } else if (d.gemResult) onCraft(Number(d.gemResult));
      else return false;
      return true;
    }
    function change(input) {
      if(input.dataset.gemUpgradeField){upgradeTargets[input.dataset.gemUpgradeField]=Number(input.value);onChange(false);document.querySelector('[data-gem-upgrade-field="'+input.dataset.gemUpgradeField+'"]')?.focus();return true;}
      const field=input.dataset.gemCraftField;if(!field)return false;
      if(field==='rarity')rarity=input.value;if(field==='level')level=Number(input.value);if(field==='family')family=input.value;
      onChange(false);document.querySelector('[data-gem-craft-field="'+field+'"]')?.focus();return true;
    }
    return {render,wallet,actions,handle,change};
  },
};
