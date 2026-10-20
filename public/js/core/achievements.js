'use strict';
((root, factory) => {
  const common = typeof module === 'object' && module.exports;
  const api = factory(common ? require('./forest-progression.js') : root.ForestProgression);
  if (common) module.exports = api; else root.Achievements = api;
})(globalThis, P => {
  const fresh = () => ({ version: 1, earned: {}, epics: [], trees: [], usage: [] });
  const regions = ['始まりの森','毒の沼地','暗闇の洞窟','荒波の海岸','古代の遺跡','灼熱の砂漠','風の高原','白銀の氷河','紅蓮の火山','魔王城'];
  const specials = { 'dimensional-gate':'次元の門', 'chaos-gate':'混沌の門', 'extradimensional-goddess':'異次元の女神', 'reincarnation-goddess':'転生の女神' };
  const reached = save => new Set([...save.cleared, ...(save.reincarnation?.lifetimeStages || [])]);
  const seen = (save, id) => reached(save).has(id) || save.encounteredEnemies?.includes(id);
  const epicSeen = save => P.Gem.rarityDiscovered(save, 'epic');
  const defs = [];
  const add = (id, name, category, hint, check, visible = () => true, image = 'assets/ui/items/chest.png') => defs.push({id,name,category,hint,check,visible,image});
  for (let r = 1; r <= 10; r++) for (const stage of [1,5,10]) {
    const id = (r - 1) * 10 + stage;
    add('stage-' + id, regions[r-1] + ' ' + stage, '冒険', 'ステージ ' + r + '-' + stage + ' クリア',
      s => reached(s).has(id), s => r === 1 || reached(s).has((r-1)*10));
  }
  for (const [id,name] of Object.entries(specials)) add('stage-' + id, name, '冒険', name + ' クリア', s => reached(s).has(id),
    s => id === 'reincarnation-goddess' ? !!s.reincarnation?.unlocked : seen(s, id));
  for (const [job,def] of Object.entries(P.CHARACTERS)) add('join-' + job, def.name + 'と共に', '仲間', def.name + ' 加入',
    s => !def.unlock || reached(s).has(def.unlock), s => !def.unlock || reached(s).has(Math.max(1,def.unlock-1)), 'assets/' + job + '/idle-01.png');
  add('join-all','六つの旅路','仲間','全6職 加入',s=>Object.values(P.CHARACTERS).every(d=>!d.unlock||reached(s).has(d.unlock)),s=>reached(s).has(40));
  for (const [rarity,tier] of Object.entries(P.Gem.TIERS)) add('gem-' + rarity, ({rare:'レア',unique:'ユニーク',legendary:'レジェンダリー',epic:'エピック'}[rarity]) + 'との出会い', '宝石', ({rare:'レア',unique:'ユニーク',legendary:'レジェンダリー',epic:'エピック'}[rarity]) + ' 初入手',
    s => P.Gem.rarityDiscovered(s,rarity), s => rarity !== 'epic' || epicSeen(s), 'assets/ui/gems/shard-' + rarity + '.png');
  add('epic-all','十二星の蒐集家','宝石','エピック12種 発見',s=>s.achievements.epics.length===12,epicSeen,'assets/ui/gems/epic-warrior-weapon.png');
  add('twelve-stars','十二の星の証','宝石','全6職の武器・防具にエピックを装着して、異次元の女神に勝利',s=>!!s.reincarnation?.discovered,epicSeen,'assets/ui/gems/epic-miko-weapon.png');
  for (const [key,name] of [['convert','素材変換'],['craft','ジェム制作'],['dismantle','ジェム解体']]) add('use-'+key,name+'の一歩','工房',name+' 初利用',s=>s.achievements.usage.includes(key),s=>key==='convert'?reached(s).has(10):reached(s).has(50));
  for (const [job,def] of Object.entries(P.CHARACTERS)) for (const [slot,label] of [['weapon','武器'],['armor','防具']]) {
    for (const r of [...Array.from({length:10},(_,i)=>i+1),'goddess']) {
      const treeId = job+':'+slot+':'+r, title = def.name+' / '+label+' / '+(r==='goddess'?'女神':regions[r-1]);
      const visible = s => (!def.unlock || reached(s).has(def.unlock)) && (r==='goddess'?seen(s,'extradimensional-goddess'):r===1||reached(s).has((r-1)*10));
      for (const [kind,name] of r==='goddess'?[['full','全取得']]:[['main','主道完成'],['unique-first','ユニーク初取得'],['unique','ユニーク完成'],['full','全取得']]) {
        add('gear-'+treeId+':'+kind,title+' / '+name,'装備',name,s=>s.achievements.trees.includes(treeId+':'+kind),visible,
          'assets/ui/items/'+(slot==='weapon'?'sword':'armor')+'.png');
      }
    }
    for(const n of [1,5,10,11]) add('complete-'+job+':'+slot+':'+n,def.name+' / '+label+' '+n+'本完成','装備',n+'種類のツリー 全取得',
      s=>s.achievements.trees.filter(id=>id.startsWith(job+':'+slot+':')&&id.endsWith(':full')).length>=n,s=>!P.CHARACTERS[job].unlock||reached(s).has(P.CHARACTERS[job].unlock));
  }
  add('complete-all','万装の旅人','装備','全6職の武器・防具 各11本完成',s=>s.achievements.trees.filter(id=>id.endsWith(':full')).length===132,s=>seen(s,'extradimensional-goddess'));
  for(const n of [1,3,10,25]) add('rebirth-'+n,n===1?'新たなる旅立ち':'巡る星 '+n,'転生','転生 '+n+'回',s=>(s.reincarnation?.cycle||0)>=n,s=>!!s.reincarnation?.unlocked,'assets/ui/progression/clockgem.png');
  const validIds = new Set(defs.map(d=>d.id));
  function restore(raw) {
    const clean=fresh();
    if(raw?.version!==1)return clean;
    for(const [id,date] of Object.entries(raw.earned||{}))if(validIds.has(id)&&typeof date==='string'&&Number.isFinite(Date.parse(date)))clean.earned[id]=date;
    clean.epics=[...new Set((Array.isArray(raw.epics)?raw.epics:[]).filter(id=>P.Gem.Epic.DEFINITIONS[id]))];
    clean.usage=[...new Set((Array.isArray(raw.usage)?raw.usage:[]).filter(id=>['convert','craft','dismantle'].includes(id)))];
    clean.trees=[...new Set((Array.isArray(raw.trees)?raw.trees:[]).filter(id=>validIds.has('gear-'+id)))];
    return clean;
  }
  const cache=new WeakMap();
  function sync(save, now = new Date().toISOString()) {
    const a=save.achievements ||= fresh();
    for(const gem of save.gems)if(gem.rarity==='epic'&&!a.epics.includes(gem.family))a.epics.push(gem.family);
    const signature=Object.values(save.progression.characters).map(c=>c.weapon.length+':'+c.armor.length).join('|');
    if(cache.get(save)!==signature){
      cache.set(save,signature);
      for(const job of Object.keys(P.CHARACTERS))for(const slot of ['weapon','armor'])for(const r of [...Array.from({length:10},(_,i)=>i+1),'goddess']){
        const nodes=P.gearTree(job,slot,r),owned=new Set(save.progression.characters[job][slot]),key=job+':'+slot+':'+r;
        const remember=kind=>{if(!a.trees.includes(key+':'+kind))a.trees.push(key+':'+kind);};
        if(nodes.every(n=>owned.has(n.id)))remember('full');
        if(r!=='goddess'){
          if(nodes.filter(n=>n.main).every(n=>owned.has(n.id)))remember('main');
          const unique=nodes.filter(n=>n.unique);if(unique.some(n=>owned.has(n.id)))remember('unique-first');
          if(unique.length&&unique.every(n=>owned.has(n.id)))remember('unique');
        }
      }
    }
    const gained=[];
    for(const def of defs)if(!a.earned[def.id]&&def.check(save)){a.earned[def.id]=now;gained.push(def);}
    return gained;
  }
  function usage(save,key){const a=save.achievements ||= fresh();if(!a.usage.includes(key))a.usage.push(key);}
  function catalog(save){return defs.filter(d=>d.visible(save)).map(d=>({...d,date:save.achievements?.earned[d.id]||null}));}
  return { fresh, restore, sync, usage, catalog };
});
