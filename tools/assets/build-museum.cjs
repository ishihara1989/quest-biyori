'use strict';
// Collect only adopted runtime assets. The museum never reads production records.
const fs = require('node:fs'), path = require('node:path');
const { PUBLIC, runtimeAsset, writeAssetJson } = require('../lib/project-paths.cjs');
const D = require('../../public/js/data/forest-data.js'), P = require('../../public/js/core/forest-progression.js');
const read = url => JSON.parse(fs.readFileSync(path.join(PUBLIC, url), 'utf8'));
const labels = { forward:'前進', backward:'後退', jump:'跳躍', hit:'被弾', down:'戦闘不能', idle:'待機',
  'attack-overhead':'振り下ろし', 'attack-far-to-near':'奥から手前へ', 'attack-near-to-far':'手前から奥へ',
  'attack-staff':'杖攻撃', chant:'詠唱', 'cast-forward':'前方詠唱', 'cast-forward-hold':'前方詠唱・保持', 'cast-up':'上方詠唱', 'cast-up-hold':'上方詠唱・保持',
  'attack-mace':'メイス攻撃', 'mace-raise':'メイスを掲げる', 'mace-slam':'メイス叩きつけ', 'shield-raise':'盾を掲げる', 'shield-plant':'盾を構える', 'shield-advance':'盾突進', 'break-strike':'断行槌',
  'attack-shuriken':'手裏剣投擲', seal:'印を結ぶ', 'throw-combo':'連続投擲', 'throw-tool':'忍具投擲', 'cast-release':'忍術発動', 'air-throw':'空中投擲', 'lay-trap':'罠設置', 'low-dash':'低姿勢ダッシュ',
  'hex-weave':'呪印を編む', 'staff-plant':'杖を地面へ', 'curse-pull':'呪いを引く', 'ritual-raise':'大呪法',
  'attack-wand':'御幣攻撃', prayer:'祈祷', 'prayer-release':'祈祷解放', 'summon-forward':'招来', 'spirit-send':'霊送り', 'blessing-up':'祝福', 'kagura-finish':'神楽終式',
  slash:'斬撃', impact:'衝撃', ring:'旋回斬撃', cross:'十字斬撃', fissure:'地裂', rupture:'空間断裂',
  arcane:'魔力弾', 'arcane-impact':'魔力衝撃', wind:'風', 'wind-impact':'風の衝撃', fire:'炎', 'fire-impact':'炎の衝撃', ice:'氷', 'ice-impact':'氷の衝撃', lightning:'雷', earth:'岩槍', meteor:'隕石', four:'四象', cosmos:'星界', circle:'魔法陣', cloud:'雷雲',
  hammer:'聖槌', wave:'聖光波', shield:'聖盾', pillar:'光柱', rampart:'城壁', knight:'聖騎士', sword:'天剣', 'break-impact':'断行衝撃',
  fuma:'風魔手裏剣', flash:'閃光', 'smoke-in':'出現煙', 'smoke-out':'消失煙', 'caltrop-scatter':'撒菱', 'shadow-pin':'影縫い', thread:'絡糸', haze:'煙幕', prison:'封影結界', 'final-ring':'終撃', 'shadow-slash':'影斬撃', 'blade-vortex':'刃の渦', 'thunder-bloom':'雷の炸裂', 'shadow-eruption':'影の噴出', 'clone-sigil':'分身の印', 'thousand-bloom':'千影の炸裂',
  'skull-bolt':'呪弾', mark:'呪印', 'mark-pulse':'呪印・脈動', 'mark-fade':'呪印・消失', 'armor-crack':'破甲', frailty:'衰弱', 'reaction-ring':'感応', 'curse-spike':'呪棘', 'grudge-flame':'怨火', 'ramp-skull':'怨念', 'life-vines':'命蝕', 'curse-chain':'呪鎖', 'curse-moth':'呪疫', 'field-open':'陣・展開', 'field-pulse':'陣・脈動', 'field-fade':'陣・消失', 'bone-stake':'呪杭', 'healing-seal':'禁癒', 'amplify-ring':'呪詛増幅', 'curse-collapse':'怨結', 'curse-burst':'呪爆', 'soul-lance':'魂砕き', 'hundred-ghosts':'百鬼', 'soul-pillar':'魂柱', 'grand-shatter':'大呪法・終撃', 'cast-wraith':'詠唱霊', 'dot-wraith':'蝕魂霊',
  'summon-circle':'招来陣', 'torii-open':'鳥居・出現', 'torii-loop':'鳥居', 'torii-close':'鳥居・消失', 'shrine-domain':'神域', 'kagura-robes':'神楽霊衣', 'double-robes':'双霊衣', 'spirit-channel':'霊脈', 'spirit-impact':'霊衝撃', foxfire:'狐火', 'feather-lightning':'雷羽', 'butterfly-wings':'癒蝶', 'flower-column':'花柱', 'water-veil':'水衣', 'tortoise-dome':'亀結界', 'bear-shield':'熊盾', 'crane-guard':'鶴護', 'owl-halo':'鈴梟の輪', 'blade-slash':'剣鬼斬', 'lion-claws':'獅子爪', 'flame-wheel-trail':'火車の軌跡', 'purification-bolt':'祓いの弾', 'festival-finale':'神楽終撃' };
const ninja = {shot:[], burst:[], fan:[], needles:['lightning','thunder-bloom'], flash:['flash'], clone:['smoke-in','smoke-out','clone-sigil'], caltrop:['caltrop-scatter'], pin:['shadow-pin'], echo:['clone-sigil'], tags:['seal'], return:['fuma'], thread:['thread'], cross:['shadow-slash','shadow-eruption'], orbit:['fuma','blade-vortex'], haze:['haze'], prison:['prison','blade-vortex'], volley:['shadow-slash','thousand-bloom'], ultimate:['clone-sigil','shadow-eruption','thousand-bloom','blade-vortex','final-ring']};
const shaman = { 'curse-bolt':['skull-bolt'], 'curse-mark':['mark','mark-pulse','mark-fade'], 'armor-hex':['armor-crack'], 'pain-hex':['reaction-ring','curse-spike'], 'frailty-hex':['frailty'], 'erosion-field':['field-open','field-pulse','field-fade'], 'grudge-flame':['grudge-flame','dot-wraith'], 'curse-chain':['curse-chain'], 'curse-amplify':['amplify-ring'], 'curse-burst':['curse-burst'], 'curse-spread':['curse-moth'], 'grudge-ramp':['ramp-skull','dot-wraith'], 'retaliation-hex':['reaction-ring','curse-spike'], 'healing-seal':['healing-seal'], 'hex-stakes':['field-open','field-pulse','field-fade','bone-stake'], 'soul-pierce':['soul-lance'], 'curse-resonance':['reaction-ring','curse-spike'], 'life-erosion':['life-vines','dot-wraith'], 'soul-seal-field':['field-open','field-pulse','field-fade','soul-pillar'], 'grudge-collapse':['curse-collapse'], 'hundred-hex':['field-open','field-pulse','field-fade','hundred-ghosts','soul-pillar','grand-shatter'] };
const miko = { 'purifying-bolt':['purification-bolt'], 'ember-fox':['foxfire'], 'healing-butterflies':['butterfly-wings'], 'stone-tortoise':['tortoise-dome'], 'thunder-crows':['feather-lightning'], 'swift-wolf':[], 'white-deer':['flower-column'], 'bell-owl':['owl-halo'], 'blade-spirit':['blade-slash'], 'guardian-bear':['bear-shield'], 'spirit-kagura':['torii-open','torii-loop','torii-close','kagura-robes'], 'flame-wheel':['flame-wheel-trail'], 'spring-carp':['water-veil'], 'life-serpent':[], 'golden-lion':['lion-claws'], 'spirit-assault':['spirit-impact'], 'prayer-cranes':['crane-guard'], 'twin-possession':['double-robes'], 'spirit-channel':['spirit-channel','torii-open','torii-loop','torii-close'], 'nine-tailed-fox':['foxfire','torii-open','torii-loop','torii-close'], 'myriad-spirit-festival':['torii-open','torii-loop','torii-close','shrine-domain','kagura-robes','festival-finale'] };
function build() {
  const effectIndex = new Map(read('assets/effects/index.json').map(e => [e.id,e]));
  function asset(manifest, id, label) { const m=read(manifest); return {id, label:label||m.label||labels[id]||id, manifest:'/'+manifest}; }
  const effect = (job,id) => asset('assets/skills/'+job+'/effects/'+id+'/manifest.json',id,labels[id]);
  const owners=[];
  for(const [id,c] of Object.entries(P.CHARACTERS)) {
    const index=read('assets/'+id+'/motions/index.json'), S=require('../../public/js/skills/'+id+'-skills.js');
    const clips=[{id:'idle',label:'待機',kind:'motion',assets:[asset('assets/'+id+'/manifest.json','idle','待機')]}];
    for(const [motion,file] of Object.entries(index.motions)) clips.push({id:motion,label:labels[motion]||motion,kind:'motion',assets:[asset('assets/'+id+'/motions/'+file,motion,labels[motion])]});
    for(const n of S.ACTIVE) {
      const s=S.spec(n.id,1,0); let assets=[];
      if(S.effectKind) {
        const kinds=new Set(Array.from({length:s.hits||1},(_,i)=>S.effectKind(s,i)));
        if(id==='mage') { const kind=S.effectKind(s); if(['arcane','wind','fire','ice'].includes(kind))kinds.add(kind+'-impact'); if(n.kind!=='normal')kinds.add('circle'); if(['storm','prison'].includes(n.id))kinds.add('cloud'); }
        if(id==='paladin'&&n.id==='ultimate') ['shield','sword','pillar','wave'].forEach(k=>kinds.add(k));
        assets=[...kinds].map(k=>effect(id,k));
      } else if(id==='ninja') {
        assets=(ninja[s.pattern]||[]).map(k=>effect(id,k));
        if(['shot','burst','fan','needles','volley','ultimate'].includes(s.pattern))assets.unshift({id:'star',label:'手裏剣',image:'/assets/ninja/motions/attack-shuriken/shuriken-projectile.png',rotate:true});
      } else if(id==='shaman') assets=[...shaman[n.id],...(n.kind==='normal'?[]:['cast-wraith'])].map(k=>effect(id,k));
      else if(id==='miko') {
        const catalog=read('assets/skills/miko/catalog.json');
        const suffixes={'idle':'待機','action':'行動','walk':'歩行','walk-a':'歩行・前半','walk-b':'歩行・後半','guardian':'守護霊','guardian-appear':'守護霊・出現','guardian-disperse':'守護霊・消失','appear':'出現','disperse':'消失'};
        assets=catalog.assets.filter(a=>a.group!=='miko'&&a.id.startsWith(n.id+'-')).map(a=>asset(a.path,a.id,suffixes[a.id.slice(n.id.length+1)]||a.id));
        assets.push(...[...miko[n.id],...(n.kind==='normal'?[]:['summon-circle'])].map(k=>effect(id,k)));
      }
      clips.push({id:'skill-'+n.id,skillId:n.id,label:n.name,kind:'skill',unlockLevel:n.unlockLevel,icon:'/'+n.icon,assets});
    }
    owners.push({id,side:'ally',label:c.name,image:'/assets/'+id+'/idle-01.png',clips});
  }
  for(const [id,e] of Object.entries(D.ALL_ENEMIES)) {
    const stage=D.ALL_STAGES.find(s=>s.waves.flat().includes(id));
    if(!stage)throw Error('初登場ステージなし: '+id);
    const clips=[];
    if(e.dimensionalGate) {
      for(const [phase,label] of Object.entries({waiting:'待機',opening:'開門',summoning:'召喚中',closing:'閉門',shattering:'崩壊'})) clips.push({id:phase,label,kind:'motion',assets:[{id:phase,label,procedural:'gate',phase,tier:e.gateTier,specialId:e.specialId}]});
      for(const [kind,label] of Object.entries({emerge:'出現',shatter:'崩壊エフェクト'})) clips.push({id:kind,label,kind:'effect',assets:[{id:kind,label,procedural:'rift',effect:kind,tier:e.gateTier,specialId:e.specialId}]});
    } else {
      const index=read('assets/enemies/'+id+'/motions/index.json'), effects=new Set();
      for(const n of index) {
        const url='assets/enemies/'+id+'/motions/'+n.manifest,m=read(url);
        clips.push({id:n.id,label:n.label,kind:n.kind||'motion',assets:[asset(url,n.id,n.label)]});
        for(const a of m.effectPreview?.assets||[])effects.add(a.id);
        // These melee contacts are already drawn in their body motion frames.
        for(const ev of m.events||[])if(ev.effect&&!['tongue','sword','bite'].includes(ev.effect))effects.add(e.region===7&&!ev.effect.startsWith('highland-')?'highland-'+ev.effect:ev.effect);
      }
      if(id==='treant') ['fruit-bomb','explosion','root-eruption'].forEach(k=>effects.add(k));
      if(id==='kraken')effects.add('kraken-tentacle');
      if(id==='large-worm')effects.add('worm-tail');
      if(e.region===6) {
        const actions=require('../../public/js/combat/desert-combat.js').ACTIONS[id];
        for(const a of actions) {
          if(a.kind==='rest')continue;
          const kind=a.kind==='fissure'?'fissure':['line','summon'].includes(a.kind)||a.kind==='projectile'&&a.status==='sand'?'royal-wave':a.status==='poison'?'venom':'sand-burst';
          effects.add('desert-'+kind);
          if(a.kind==='summon')effects.add('desert-sand-burst');
        }
      }
      for(const k of [...effects]) { const impact=k.replace(/-bolt$/,'-impact'); if(impact!==k&&fs.existsSync(path.join(PUBLIC,'assets/effects/'+impact+'/manifest.json')))effects.add(impact); }
      for(const k of effects) { const m='assets/effects/'+k+'/manifest.json'; const a=asset(m,k,effectIndex.get(k)?.label); clips.push({id:'effect-'+k,label:a.label,kind:'effect',assets:[a]}); }
    }
    owners.push({id,side:'enemy',label:e.name,region:stage.special?'special':stage.region,firstStage:stage.id,image:e.dimensionalGate?'/'+require('../../public/js/data/special-stages.js').definition(e.specialId).ASSET+'gate.png':'/assets/ui/enemies/'+id+'.png',clips});
  }
  return {version:1,owners};
}
if(require.main===module) {const catalog=build();writeAssetJson(runtimeAsset('museum/index.json'),catalog);console.log('資料館: '+catalog.owners.length+'種 / '+catalog.owners.reduce((s,o)=>s+o.clips.length,0)+'項目');}
module.exports={build};
