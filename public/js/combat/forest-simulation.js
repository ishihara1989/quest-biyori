'use strict';
((root, factory) => {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../data/forest-data.js'), require('../skills/warrior-skills.js'), require('../skills/mage-motions.js'), require('../skills/mage-skills.js'), require('./swamp-combat.js'),require('../skills/paladin-skills.js'),require('./expansion-combat.js'),require('../skills/ninja-skills.js'),require('./ninja-combat.js'),require('./enemy-control.js'),require('../skills/shaman-skills.js'),require('./shaman-combat.js'),require('../skills/miko-skills.js'),require('./miko-combat.js'),require('./ruins-combat.js'),require('./desert-combat.js'),require('./highland-combat.js'),require('./glacier-combat.js'),require('./volcano-combat.js'),require('./demon-castle-combat.js'));
  else root.ForestSimulation = factory(root.ForestData, root.WarriorSkills, root.MageMotions, root.MageSkills, root.SwampCombat,root.PaladinSkills,root.ExpansionCombat,root.NinjaSkills,root.NinjaCombat,root.EnemyControl,root.ShamanSkills,root.ShamanCombat,root.MikoSkills,root.MikoCombat,root.RuinsCombat,root.DesertCombat,root.HighlandCombat,root.GlacierCombat,root.VolcanoCombat,root.DemonCastleCombat);
})(typeof globalThis === 'object' ? globalThis : this, ({ HERO, ALL_ENEMIES: ENEMIES, STAGES, SPECIAL_STAGES, addGold }, W, Mage, M, Swamp, P, X, N, Ninja, Control, S, Shaman, K, Miko, Ruins, Desert, Highland, Glacier, Volcano, Castle) => {
  const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
  const Special = typeof module === 'object' && module.exports ? require('../data/special-stages.js') : globalThis.SpecialStages;
  const Goddess = typeof module === 'object' && module.exports ? require('./goddess-combat.js') : globalThis.GoddessCombat;
  const Rebirth = typeof module === 'object' && module.exports ? require('./reincarnation-combat.js') : globalThis.ReincarnationCombat;
  const Epic=typeof module==='object'&&module.exports?require('./epic-gem-combat.js'):globalThis.EpicGemCombat;
  const Resistance = typeof module === 'object' && module.exports ? require('./status-resistance.js') : globalThis.StatusResistance;
  const Trials = typeof module === 'object' && module.exports ? require('../core/trials.js') : globalThis.Trials;
  const TrialCombat = typeof module === 'object' && module.exports ? require('./trial-combat.js') : globalThis.TrialCombat;
  const STEP = 1000 / 60;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const state = (actor, value, motion = value) => { const began=actor.state!==value;actor.state = value; actor.motion = motion; actor.time = 0; actor.hit = false;
    if(began&&['attacking','skill','windup','charge'].includes(value)){actor.actionSerial=(actor.actionSerial||0)+1;actor.actionId=actor.id+'-action-'+actor.actionSerial;actor.actionDamage=actor.damage*(1-Shaman.strongest(actor,'attack',actor.worldTime||0));}
  };
  const actionRate = actor => Castle.sleeping(actor,actor.worldTime) || actor.freezeUntil > actor.worldTime || actor.bubbleUntil > actor.worldTime || Control.stopped(actor,actor.worldTime) ? 0 : actor.webUntil > actor.worldTime ? .55 : 1;
  const expansionAPI = {STEP,state,move,hit,control:Control,attackPower:Shaman.attackPower,healingFactor:Shaman.healingFactor,immune:(run,a)=>fieldsFor(run,a).some(f=>f.id==='sanctuary')};
  const ninjaAPI={STEP,state,move,hit};
  const shamanAPI={STEP,state,move,hit};
  const mikoAPI={STEP,state,move,hit};
  const ruinsAPI={STEP,state,move,hit,control:Control,attackPower:Shaman.attackPower};
  const highlandAPI={STEP,state,move,hit,control:Control,attackPower:Shaman.attackPower,immune:(run,a)=>fieldsFor(run,a).some(f=>f.id==='sanctuary')};
  const desertAPI={STEP,state,move,hit,spawn,control:Control,attackPower:Shaman.attackPower,immune:(run,a)=>fieldsFor(run,a).some(f=>f.id==='sanctuary')};
  ninjaAPI.attackRate=shamanAPI.attackRate=Miko.attackRate;
  const startExpansionAttack = (run,enemy,target,events) => X.start(run,enemy,target,state,events);
  function spawn(run, type, position) {
    const base = run.stage.special && !ENEMIES[type].dimensionalGate ? Special.profile(type, ENEMIES, run.stage.id) : ENEMIES[type], factor = base.dimensionalGate ? 1 : 1 + (run.stage.number - 1) * 0.1;
    const hpRate = run.stage.enemyHp * (base.majorBoss ? run.stage.majorBossHp ?? 1 : 1);
    const damageRate = run.stage.enemyDamage * (base.majorBoss ? run.stage.majorBossDamage ?? 1 : 1);
    const enemy = { id: `enemy-${++run.serial}`, type, ...base, defense:base.majorBoss&&run.stage.majorBossDefense!==undefined?run.stage.majorBossDefense:base.defense??Shaman.DEFENSE[type]??0, maxHp: Math.round(base.hp * factor * hpRate),
      hp: Math.round(base.hp * factor * hpRate), damage: Math.round(base.damage * factor * damageRate),
      x: position?.x ?? 620 + run.random() * 300, y: position?.y ?? 348 + run.random() * 150,
      state: 'idle', motion: 'idle', time: 0, cooldown: 650 + run.random() * 600, special: 5500, attacks: 0, flash: 0, facing: -1 };
    if(enemy.region===9||enemy.region===10){enemy.x=Math.min(enemy.x,enemy.majorBoss?700:enemy.boss?780:860);if(enemy.majorBoss)enemy.y=Math.max(enemy.y,440);}
    if(enemy.majorBoss)enemy.cooldown+=enemy.type==='ancient-titan'?12500:8500;
    if(enemy.goddess)Object.assign(enemy,{x:800,y:474,cooldown:800,goddessPhase:1});
    if(enemy.reincarnationGoddess)Object.assign(enemy,{x:810,y:460,cooldown:900});
    if (base.dimensionalGate) Object.assign(enemy, { hp: 1, maxHp: 1, invulnerable: true, x: 825, y: 452,
      gateBatch: 0, gateSpawnIndex: 0, gatePhase: 'waiting', gateClock: 0 });
    if (!base.dimensionalGate) {
      enemy.hp = enemy.maxHp = Math.round(enemy.maxHp * run.trials.stats);
      enemy.damage *= run.trials.stats; enemy.defense *= run.trials.stats;
      enemy.trialInterference = run.trials.interference;
    }
    run.enemies.push(enemy); return enemy;
  }
  function tickGate(run, events) {
    const gate = run.enemies.find(e => e.dimensionalGate && e.hp > 0);
    if (!gate) return;
    const batches = Special.definition(run.stage.id).BATCHES[gate.gateTier];
    const emit = (kind, extra = {}) => events.push({ type: 'rift-effect', kind, tier: gate.gateTier,
      specialId: run.stage.id, x: gate.x, y: gate.y, timeMs: run.time, ...extra });
    gate.gateClock += STEP;
    if (gate.gatePhase === 'waiting' && !run.enemies.some(e => !e.dimensionalGate && !e.bodyPart && e.hp > 0)) {
      gate.gateClock = 0;
      if (gate.gateBatch < batches.length) { gate.gatePhase = 'opening'; emit('open'); }
      else { gate.gatePhase = 'shattering'; emit('shatter'); }
    } else if (gate.gatePhase === 'opening' && gate.gateClock >= 900) {
      gate.gatePhase = 'summoning'; gate.gateClock = 0; gate.gateSpawnIndex = 0;
    } else if (gate.gatePhase === 'summoning') {
      const batch = batches[gate.gateBatch];
      while (gate.gateSpawnIndex < batch.length && gate.gateClock >= gate.gateSpawnIndex * 160) {
        const index = gate.gateSpawnIndex++, type = batch[index];
        // Fit 35 mobs into seven columns and five rows within the same spawn area.
        const columns = gate.gateTier === 0 ? 7 : 5;
        const y = gate.gateTier === 0 ? 356 + Math.floor(index / columns) * 31.5 : 379 + (index % 2) * 100;
        const enemy = spawn(run, type, { x: 550 + index % columns * (304 / (columns - 1)), y });
        enemy.summonedBy = gate.id; enemy.riftBornAt = run.time; enemy.cooldown += index * 450;
        emit('emerge', { x: enemy.x, y: enemy.y, enemy: enemy.id, from: { x: gate.x, y: gate.y - gate.height * .5 } });
      }
      if (gate.gateSpawnIndex === batch.length && gate.gateClock >= batch.length * 160 + 450) {
        gate.gateBatch++; gate.gatePhase = 'closing'; gate.gateClock = 0;
      }
    } else if (gate.gatePhase === 'closing' && gate.gateClock >= 650) {
      gate.gatePhase = 'waiting'; gate.gateClock = 0;
    } else if (gate.gatePhase === 'shattering' && gate.gateClock >= 1400) {
      gate.hp = 0; state(gate, 'down'); run.kills++; gate.gatePhase = 'broken';
    }
  }
  function spawnWave(run, events) {
    run.enemies = [];run.epicMageCasts=[];
    run.stage.waves[run.wave].forEach(type => spawn(run, type));
    if(run.stage.id<=20){let bossIndex=0;for(const e of run.enemies)if(e.boss)e.cooldown+=6500*bossIndex++;}
    if(run.stage.region>=8){let mob=0;for(const e of run.enemies)if(!e.boss)e.cooldown+=1500*mob++;}
    run.phase = 'combat'; run.transition = 0;
    state(run.hero, 'idle');
    events.push({ type: 'wave', wave: run.wave + 1, timeMs: run.time });
  }
  function createRun(stageId = 1, { random = Math.random, builds = {}, disableMikoSupport=false, goldRemainder = 0, trials = null } = {}) {
    const stage = STAGES.find(s => s.id === stageId) || SPECIAL_STAGES.find(s => s.id === stageId);
    if (!stage) throw new RangeError('Unknown stage');
    const run = { stage, trials: Trials.summarize(trials?.ids, stageId), random, serial: 0, enemies: [], projectiles: [], wave: 0, phase: 'combat',
      status: 'running', time: 0, elapsed: 0, accumulator: 0, transition: 0, kills: 0, extraEnemies: 0, gold: 0,
      disableMikoSupport,
      goldRemainder, reincarnationBonuses: builds.warrior?.reincarnationBonuses,
      hero: { id: 'hero', type: 'warrior', ...HERO, maxMp: 80, mpRegen: 3, attackSpeed: 1, critMultiplier: 1.7, ...builds.warrior, x: 260, y: 438,
        state: 'idle', motion: 'idle', time: 0, cooldown: 500, skill: 3200, flash: 0, facing: 1, warriorCooldowns:{}, warriorSkills:builds.warrior?.warriorSkills || [], normalRank:builds.warrior?.normalRank || 1 } };
    run.hero.hp = run.hero.maxHp; run.hero.mp = run.hero.maxMp; run.hero.evadeCooldown = 0;
    run.paladinFields=[];
    run.allies = builds.mage ? [{ id: 'mage', type: 'mage', ...builds.mage, hp: builds.mage.maxHp, mp: builds.mage.maxMp,
      x: 190, y: 390, state: 'idle', motion: 'idle', time: 0, cooldown: 700, skill: 2000, flash: 0, facing: 1, vortexCooldown: 0, repelCooldown: 0, mageCooldowns:{} }] : [];
    if(builds.paladin)run.allies.push({id:'paladin',type:'paladin',...builds.paladin,hp:builds.paladin.maxHp,mp:builds.paladin.maxMp,x:300,y:480,state:'idle',motion:'idle',time:0,cooldown:600,skill:0,flash:0,facing:1,paladinCooldowns:{},paladinNormal:builds.paladin.paladinNormal||P.spec('mace',1,0,builds.paladin),paladinSkills:builds.paladin.paladinSkills||[]});
    Ninja.init(run);
    Shaman.init(run);
    Miko.init(run);Ruins.init(run);Desert.init(run);Highland.init(run);Glacier.init(run);Volcano.init(run);Castle.init(run);
    if(builds.ninja)run.allies.push({id:'ninja',type:'ninja',...builds.ninja,hp:builds.ninja.maxHp,mp:builds.ninja.maxMp,x:210,y:470,state:'idle',motion:'idle',time:0,cooldown:500,skill:0,flash:0,facing:1,ninjaCooldowns:{},cloneReadyAt:0,ninjaNormal:builds.ninja.ninjaNormal||N.spec('shuriken',1,0,builds.ninja),ninjaSkills:builds.ninja.ninjaSkills||[]});
    if(builds.shaman)run.allies.push({id:'shaman',type:'shaman',...builds.shaman,hp:builds.shaman.maxHp,mp:builds.shaman.maxMp,x:165,y:435,state:'idle',motion:'idle',time:0,cooldown:650,skill:0,flash:0,facing:1,shamanCooldowns:{},shamanNormal:builds.shaman.shamanNormal||S.spec('curse-bolt',1,0,builds.shaman),shamanSkills:builds.shaman.shamanSkills||[]});
    if(builds.miko)run.allies.push({id:'miko',type:'miko',...builds.miko,hp:builds.miko.maxHp,mp:builds.miko.maxMp,x:125,y:480,state:'idle',motion:'idle',time:0,cooldown:650,skill:0,flash:0,facing:1,mikoCooldowns:{},mikoNormal:builds.miko.mikoNormal||K.spec('purifying-bolt',1,0,builds.miko),mikoSkills:builds.miko.mikoSkills||[]});
    Goddess.init(run);TrialCombat.init(run);spawnWave(run, []); return run;
  }
  function hit(run, source, target, amount, events, skill = false, element = null, options = {}) {
    if (target.hp <= 0 || run.status !== 'running' || target.invulnerable) return;
    if (target.bodyPart) {
      const owner=run.enemies.find(e=>e.id===target.ownerId&&e.hp>0);if(!owner)return;
      const result=hit(run,source,owner,amount,events,skill,element,options);target.hp=owner.hp;target.flash=180;
      if(result)events.push({type:'part-hit',effect:target.bodyPart,x:target.x,y:target.y,timeMs:run.time});return result;
    }
    const friendly = !ENEMIES[source.type], targetFriendly = !ENEMIES[target.type];
    if(!friendly&&targetFriendly){
      const direct=options.direct??source.actionBlindable??true;
      if(options.miss??(direct&&Control.miss(run,source))){events.push({type:'miss',x:target.x,y:target.y-60,timeMs:run.time});return false;}
      if(direct&&target.ninjaUntargetableUntil>run.time)return false;
      if(direct&&target.type==='ninja'&&Ninja.substitute(run,target,events))return false;
    }
    if(friendly&&!options.skipHitRoll&&source.blindUntil>run.time&&run.random()<.5){events.push({type:'miss',x:target.x,y:target.y-60,timeMs:run.time});return false;}
    if(options.statusOnly)return true;
    if(!friendly&&targetFriendly&&options.threat){const danger=I.dangerDamage(options.threat,target,options.threatIndex||0);if(danger!==null)amount=danger;}
    const critical = friendly && (options.critical??run.random() < source.crit);
    const guards=targetFriendly?fieldsFor(run,target):[],guard=guards.reduce((best,f)=>!best||f.spec.reduction>best.spec.reduction?f:best,null);
    const defense=options.preMitigated?1:targetFriendly?80/(80+(target.defense||0)*Volcano.defenseFactor(target,run.time)):Shaman.defenseFactor(run,target,options.attack||source.baseDamage||source.damage,options.penetration||0);
    const amplify=options.curseKind==='curse-dot'?1+Shaman.strongest(target,'amplify',run.time):1;
    const bossBonus=friendly&&(target.boss||target.majorBoss)?1+(source.reincarnationBoss||0):1;
    const raw=Math.max(1,Math.round(amount*bossBonus*(friendly?1+Epic.rage(source,run.time)*.2:Epic.reduction(run,target))*(source.epicPaladinWeapon&&element==='神聖'?2:1)*defense*(target.glacierArmorUntil>run.time?.7:1)*amplify*(friendly?1+Miko.spirit(run):1)*(element==='神聖'&&['skeleton','lich'].includes(target.type)?1.35:1)*(critical?options.critMultiplier||source.critMultiplier||1.7:1)));
    const damage=options.gemProc?Math.max(1,Math.round(amount)):Math.max(1,Math.round(raw*(1-(guard?.spec.reduction||0))*(target.type==='great-hermit'&&['shell','spin'].includes(target.motion)?.3:1)));
    if(guard&&raw>damage){events.push({type:'paladin-block',x:target.x,y:target.y,amount:raw-damage,timeMs:run.time});if(guard.cast)guard.cast.absorbed+=raw-damage;}
    const lethal=guards.find(f=>f.id==='bastion'&&!f.spent.includes(target.id));
    const previousHp=target.hp;
    let healthDamage=targetFriendly?Miko.absorb(run,target,damage,events):damage;
    if(targetFriendly&&target.gemBarrier?.until>run.time){const blocked=Math.min(healthDamage,target.gemBarrier.amount);target.gemBarrier.amount-=blocked;healthDamage-=blocked;}
    if(targetFriendly&&target.epicMageArmor&&target.epicMageBarrier>0){const blocked=Math.min(healthDamage,target.epicMageBarrier);target.epicMageBarrier-=blocked;healthDamage-=blocked;}
    if(lethal&&healthDamage>=target.hp){lethal.spent.push(target.id);target.hp=1;}else
    target.hp = Math.max(0, target.hp - healthDamage); target.flash = 180;
    if(targetFriendly&&options.direct!==false&&healthDamage>0)Castle.wake(target,run.time);
    if(targetFriendly)target.recentMikoDamage=(target.recentMikoDamage||0)+healthDamage;
    if(target.region>=3&&!target.expansionPlan&&!target.ruinsPlan&&!target.desertPlan&&!target.highlandPlan&&!target.glacierPlan&&!target.volcanoPlan&&!target.castlePlan){target.hurtAt=run.time;target.hurtUntil=run.time+460;}
    events.push({ type: 'damage', target: target.id, source: source.id, amount: Math.round(healthDamage), critical, skill,
      x: target.x, y: target.y - (target.height || 142) * 0.55, timeMs: run.time,kind:options.curseKind||'direct' });
    if(friendly&&!targetFriendly&&!options.secondary)Shaman.queue(run,target,'hit',options.actionId||source.actionId||source.id+'-'+run.time);
    if(!friendly&&targetFriendly&&!options.secondary&&options.direct!==false)Shaman.queue(run,source,'hurt',options.actionId||source.actionId||source.id+'-'+run.time);
    if(friendly&&!targetFriendly&&target.hp>0&&options.interferencePower)I.impact(run,source,target,options.interferencePower,events,options.interferenceKey||null);
    if(!friendly&&targetFriendly&&!options.secondary&&options.direct!==false&&target.hp>0&&target.gemAegis>0&&run.time>=(target.gemAegisAt??-1)){
      target.gemAegisAt=run.time+5000;target.gemBarrier={amount:target.maxHp*Math.min(.3,target.gemAegis),until:run.time+4000};
      events.push({type:'gem-effect',kind:'aegis',x:target.x,y:target.y,timeMs:run.time});
    }
    if(!friendly&&targetFriendly)Epic.hurt(run,source,target,events,options,damage);
    if(friendly&&!targetFriendly)Epic.dealt(run,source,Math.min(previousHp,healthDamage),events,options);
    if (target.hp === 0) {
      if(target.goddess)Goddess.depart(run,target);
      if(target.reincarnationGoddess)Rebirth.depart(run,target);
      I.clear(target);
      if(targetFriendly){target.warriorCast=null;target.mageCast=null;target.paladinCast=null;Ninja.clear(run,target,events);Shaman.clear(run,target);Miko.clear(run,target);run.paladinFields=run.paladinFields.filter(f=>f.source!==target);target.z=0;target.hidden=false;target.invulnerable=false;clearStatus(target);}else target.curse=null;
      target.swampPlan = null;
      target.expansionPlan = null;
      target.ruinsPlan=null;target.desertPlan=null;target.highlandPlan=null;Glacier.interrupt(run,target);Volcano.interrupt(run,target);Castle.interrupt(run,target);target.z=0;target.desertDepth=0;
      state(target, 'down');
      if (!targetFriendly) {
        run.kills++;
        const hunt = [run.hero, ...run.allies].reduce((total, actor) => total + (actor.treasureHunt || 0), 0);
        const gold = addGold(run, target.gold, hunt);
        events.push({ type: 'loot', enemy: target.type, gold, goldRemainder: run.goldRemainder, x: target.x, y: target.y, timeMs: run.time });
      }
    }
    if(friendly&&!targetFriendly&&!skill&&!options.secondary&&target.hp>0)Miko.normalHit(run,source,target,mikoAPI,events,options.actionId||source.actionId||source.id+'-'+run.time);
    if(friendly&&!targetFriendly&&!options.secondary){
      if(source.gemSiphon>0&&run.time>=(source.gemSiphonAt??-1)&&source.gemSiphonAction!==(options.actionId||source.actionId||source.id+'-'+run.time)){source.gemSiphonAt=run.time+1000;source.gemSiphonAction=options.actionId||source.actionId||source.id+'-'+run.time;
        const gain=Math.min(source.maxMp-source.mp,source.maxMp*source.gemSiphon);source.mp+=gain;
        if(gain>0)events.push({type:'gem-effect',kind:'siphon',x:source.x,y:source.y,timeMs:run.time});}
      const action=options.actionId||source.actionId||source.id+'-'+run.time;
      for(const [key,kind] of [['gemEcho','echo'],['gemExecution','execution']])if(source[key]>0&&target.hp>0&&run.time>=(source[key+'At']??-1)&&source[key+'Action']!==action&&(key!=='gemExecution'||target.hp/target.maxHp<=.3)){
        source[key+'At']=run.time+1000;source[key+'Action']=action;
        events.push({type:'gem-effect',kind,x:target.x,y:target.y,from:{x:source.x,y:source.y},timeMs:run.time});
        hit(run,source,target,healthDamage*source[key],events,true,element,{secondary:true,critical:false,preMitigated:true,gemProc:true,curseKind:'gem-'+kind});
      }
    }
    if(friendly&&!targetFriendly&&!options.secondary&&target.hp>0&&source.epicWarriorWeapon)for(let i=0;i<2&&target.hp>0;i++){hit(run,source,target,Math.min(previousHp,healthDamage),events,skill,element,{secondary:true,critical:false,gemProc:true,skipHitRoll:true,curseKind:'epic-copy'});events.push({type:'gem-effect',kind:'echo',x:target.x+(i?18:-18),y:target.y,timeMs:run.time});}
    if(!friendly&&targetFriendly){const reflection=guards.find(f=>f.spec.reflection>0);if(reflection&&reflection.source.hp>0&&source.hp>0)hit(run,reflection.source,source,damage*reflection.spec.reflection,events,true,'神聖',{secondary:true});}
    return true;
  }
  function clearStatus(actor) { actor.goddessDot=null; actor.deliverySlowUntil=0; Castle.clearStatus(actor,actor.worldTime||0); Glacier.clearStatus(actor,actor.worldTime||0);Volcano.clearStatus(actor); actor.rootUntil = 0; actor.rootAnchor = null; actor.poison = null; actor.bleed = null; actor.webUntil=0;actor.blindUntil=0;actor.bubbleUntil=0;actor.sandSlowUntil=0; }
  function applyStatus(run, actor, kind, enemy, events) {
    if (actor.hp <= 0 || actor.invulnerable) return;
    if(fieldsFor(run,actor).some(f=>f.id==='sanctuary'))return;
    if (Resistance.resists(run, actor, events)) return;
    if (kind === 'root') {
      if (!(actor.rootUntil > run.time)) actor.rootAnchor = { x: actor.x, y: actor.y };
      actor.rootUntil = run.time + 2200;
    } else {
      const damage = Math.max(1, Math.round((enemy.actionDamage??enemy.damage) * .2));
      if (actor.poison) { actor.poison.until = run.time + 4000; actor.poison.damage = Math.max(actor.poison.damage, damage); }
      else actor.poison = { until: run.time + 4000, next: run.time + 1000, damage, source: enemy };
    }
    events.push({ type: 'status', kind, target: actor.id, x: actor.x, y: actor.y, timeMs: run.time });
  }
  function startSwampAttack(run, enemy, target, events) {
    enemy.targetId = target.id;
    enemy.attacks++;
    let parts = enemy.type === 'lich' && !run.stage.special && enemy.attacks % 3 === 0
      ? [{ motion: 'chant', duration: Swamp.DURATIONS.chant * 2, events: [] },
        { motion: 'dark-cast', duration: Swamp.DURATIONS['dark-cast'], events: [{ kind: 'summon-skeletons', at: 420 }] }]
      : Swamp.sequence(enemy.type, enemy.type === 'lich' ? (enemy.attacks - 1) % 3 + 1 : enemy.attacks);
    const prepared=I.prepareParts(enemy,parts);parts=prepared.parts;
    parts=Control.plan(run,enemy,parts,Swamp.sequence(enemy.type,1));
    if(!parts){enemy.cooldown=250;state(enemy,'idle');return false;}Control.roll(run,enemy,parts);
    enemy.swampPlan = { parts, index: 0, time: 0, fired: 0, aim: { x: target.x, y: target.y } };
    state(enemy, 'attacking', parts[0].motion); enemy.cooldown = enemy.interval;
    const prep=I.begin(run,enemy,parts[0].motion,prepared.warn,target,events,{releaseDelay:prepared.releaseDelay,capacity:parts.some(p=>p.events.some(v=>v.kind==='summon-skeletons'))?60:undefined,hits:1});
    if(prep)prep.shapes=swampForecast(enemy,parts,target);
    if (parts[0].motion === 'chant' || parts[0].motion === 'windup') events.push({ type: 'telegraph', kind: parts[0].motion, x: target.x, y: target.y, timeMs: run.time });
  }
  function swampForecast(enemy,parts,target){const aim={x:target.x,y:target.y},kind=parts.flatMap(p=>p.events)[0]?.kind;return kind==='breath'?[{kind:'lane',from:{x:enemy.x,y:enemy.y},to:aim,length:enemy.range+25,width:100}]:[{kind:'circle',center:kind==='summon-skeletons'?{x:enemy.x,y:enemy.y}:aim,radius:kind==='slam'||kind==='dark-magic'?110:kind==='summon-skeletons'?110:70}];}
  function swampRelease(run, enemy, target, event, aim, events) {
    const kind = event.kind;
    if (kind === 'summon-skeletons') {
      // Skip the entire summon if the cap cannot accommodate all four.
      if (run.enemies.filter(e => e.hp > 0).length > 20) return;
      for (const offset of [{ x: -90, y: -45 }, { x: -90, y: 45 }, { x: 60, y: -45 }, { x: 60, y: 45 }]) {
        const summoned = spawn(run, 'skeleton', { x: Math.max(95, Math.min(944, enemy.x + offset.x)), y: Math.max(334, Math.min(501, enemy.y + offset.y)) });
        summoned.summonedBy = enemy.id;
        run.extraEnemies++;
        events.push({ type: 'summon', kind: 'skeleton', x: summoned.x, y: summoned.y, timeMs: run.time });
      }
      return;
    }
    if (kind === 'poison-bolt' || kind === 'energy-bolt') {
      run.projectiles.push({ source: enemy, threat:enemy.actionThreat, actionId:enemy.actionId, kind, miss:Control.miss(run,enemy),direct:true,x: enemy.x + enemy.facing * enemy.height * .55, y: enemy.y - enemy.height * .52,
        tx: aim.x, ty: aim.y, time: 0, duration: 480, damage: (enemy.actionDamage??enemy.damage) * event.power, targetId: target.id, tracking: false });
      return;
    }
    const effect = { punch: 'mud-slam-impact', grab: 'mud-bind', slam: 'mud-slam-impact', 'dark-magic': 'lich-dark-magic', breath: 'hydra-poison-breath' }[kind];
    const position = ['slam', 'dark-magic'].includes(kind) ? aim : target;
    if (effect && kind !== 'grab') events.push({ type: 'swamp-effect', effect, x: kind === 'breath' ? enemy.x + enemy.facing * enemy.height * .55 : position.x,
      y: kind === 'breath' ? enemy.y - enemy.height * .52 : position.y, facing: enemy.facing, timeMs: run.time });
    const inRange = enemy.actionInterference ? enemy.actionInterference.shapes.some(s=>I.contains(s,target))&&(kind!=='slam'||distance(enemy,aim)<=enemy.range+40) : distance(enemy,target)<=enemy.range+25;
    if (inRange && hit(run, enemy, target, (enemy.actionDamage??enemy.damage) * event.power, events,false,null,{threat:enemy.actionThreat}) && target.hp > 0) {
      if (kind === 'grab') applyStatus(run, target, 'root', enemy, events);
      if (kind === 'breath') applyStatus(run, target, 'poison', enemy, events);
    }
  }
  function advanceSwamp(run, enemy, target, events) {
    const plan = enemy.swampPlan, part = plan.parts[plan.index];
    plan.time += STEP;
    while (plan.fired < part.events.length && plan.time + 1e-6 >= part.events[plan.fired].at) swampRelease(run, enemy, target, part.events[plan.fired++], plan.aim, events);
    if (plan.time + 1e-6 >= part.duration) {
      plan.index++; plan.time = 0; plan.fired = 0;
      if (plan.index === plan.parts.length) { enemy.swampPlan = null; state(enemy, 'idle'); }
      else state(enemy, 'attacking', plan.parts[plan.index].motion);
    }
  }
  function launch(run, enemy, kind, events) {
    const hero = [run.hero, ...run.allies].find(a => a.id === enemy.targetId && a.hp > 0) || run.hero;
    run.projectiles.push({ source: enemy, threat:enemy.actionThreat, kind, miss:Control.miss(run,enemy),direct:enemy.actionBlindable,x: enemy.x, y: enemy.y - enemy.height * 0.6,
      tx: enemy.actionInterference?.aim.x??hero.x, ty: enemy.actionInterference?.aim.y??hero.y, time: 0, duration: kind === 'seed' ? 520 : kind === 'fruit' ? 1000 : 720,
      damage: (enemy.actionDamage??enemy.damage), targetId: hero.id, tracking: kind === 'seed' });
    events.push({ type: 'cast', kind, x: hero.x, y: hero.y, timeMs: run.time });
  }
  function launchMagic(run, mage, target) {
    const tip = Mage.emission(mage.state === 'skill' ? 'forward' : 'normal');
    run.projectiles.push({ source: mage, actionId:mage.actionId, kind: 'wind', targetId: target.id,
      x: mage.x + mage.facing * tip.x, y: mage.y + tip.y, tx: target.x, ty: target.y - (target.height || 70) * .55,
      time: 0, duration: 300 / mage.attackSpeed, damage: mage.state === 'skill' ? mage.skillDamage : mage.damage,
      skill: mage.state === 'skill', chain: mage.state === 'skill' && mage.chain, tracking: true });
  }
  function beginAttack(run, enemy) {
    if(enemy.type!=='boss-boar'||!enemy.actionInterference)enemy.targetId = (enemy.tauntUntil>run.time&&[run.hero,...run.allies].find(a=>a.id===enemy.tauntId&&a.hp>0)||[run.hero, ...run.allies].filter(a => a.hp > 0).sort((a, b) => distance(enemy, a) - distance(enemy, b))[0])?.id;
    enemy.attacks++;
    let motion = 'attack', duration = enemy.duration, impact = enemy.impact;
    if (enemy.type === 'alraune') {
      motion = enemy.attacks % 2 ? 'seed-burst' : 'vine-slam';
      duration = motion === 'seed-burst' ? 400 : 800; impact = motion === 'seed-burst' ? 0 : 370;
    }
    if (enemy.type === 'treant') {
      motion = enemy.attacks % 2 ? 'root-bury' : 'throw-fruit';
      duration = motion === 'root-bury' ? 900 : 700; impact = motion === 'root-bury' ? 340 : 380;
    }
    const action=Control.classify({motion,events:[{kind:motion}]});
    if(Control.sealed(enemy,run.time)&&action.classification==='special'){enemy.cooldown=250;state(enemy,'idle');return;}
    Control.roll(run,enemy,[{motion,events:[{kind:motion}],...action}]);
    const prep=I.config(enemy,motion);if(prep){const shift=Math.max(0,prep.warn-impact);duration+=shift;impact+=shift;}
    enemy.attackDuration = duration; enemy.attackImpact = impact;
    state(enemy, 'attacking', motion); enemy.cooldown = enemy.type==='boss-boar'&&enemy.actionInterference?Math.max(enemy.cooldown,enemy.interval):enemy.interval;
    if(enemy.type!=='boss-boar'){const a=I.begin(run,enemy,motion,impact,[run.hero,...run.allies].find(a=>a.id===enemy.targetId)||run.hero,[],{hits:1});if(a)a.shapes=[{kind:'circle',center:a.aim,radius:motion==='vine-slam'?enemy.range+25:100}];}
  }
  function move(actor, target, speed, range) {
    const gap = distance(actor, target);
    if (actor.rootAnchor) return gap > range + 1e-6;
    // Floating-point movement can stop at range + a tiny rounding error.
    if (gap <= range + 1e-6) return false;
    if(actor.bubbleUntil>actor.worldTime)return false;
    const factor=Control.movement(actor,actor.worldTime);if(!factor)return true;
    const travel = Math.min(gap - range, speed * factor * (actor.deliverySlowUntil>actor.worldTime?.8:1) * (actor.webUntil>actor.worldTime?.55:actor.sandSlowUntil>actor.worldTime?.65:actor.chillUntil>actor.worldTime?.7:1) * STEP / 1000);
    actor.x = Math.max(90, Math.min(944, actor.x + (target.x - actor.x) / gap * travel));
    actor.y = Math.max(334, Math.min(501, actor.y + (target.y - actor.y) / gap * travel));
    if (actor.state !== 'moving' && actor.state !== 'attacking') state(actor, 'moving', !ENEMIES[actor.type] ? 'forward' : 'move');
    return true;
  }
  function startWarriorSkill(run, hero, s, target, events) {
    if(Castle.sleeping(hero,run.time)||Castle.silenced(hero,run.time)&&s.kind!=='normal')return false;
    const c=W.begin(s,hero,target,run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate));hero.warriorCast=c;
    hero.mp-=s.mp;hero.warriorCooldowns[s.id]=s.cooldown;hero.skill=s.cooldown;
    state(hero,'skill','attack-far-to-near');
    events.push({type:'warrior-cast',skillId:s.id,name:s.name,x:hero.x,y:hero.y,timeMs:run.time});
  }
  function warriorImpact(run,hero,c,pose,index,events) {
    const s=c.spec,targets=W.targets(c,run.enemies.filter(e=>!e.dimensionalGate),pose,index);
    for(const e of targets){
      const multiplier=s.pattern==='ultimate'?(index===10?8:index===11?3:1):s.pattern==='worldcross'&&index===2?1.5:1;
      const splash=s.pattern==='leap' && e.id!==c.target.id ? .35 : 1;
      hit(run,hero,e,hero.damage*s.power*multiplier*splash,events,s.kind!=='normal',null,{actionId:hero.actionId,interferencePower:I.power(s,index,e.id===c.target.id),interferenceKey:hero.actionId+':'+index});
      if(!e.boss&&e.hp>0&&!I.committed(e,run.time)){
        if(s.pattern==='rise'&&Control.apply(run,e,'stop',600)){e.airUntil=run.time+600;e.airStart=run.time;e.airHeight=index<2?90:30;}
        if(['running','sphere','tornado'].includes(s.pattern)){e.x=Math.max(95,Math.min(944,e.x+(pose.x-e.x)*.32));e.y=Math.max(334,Math.min(501,e.y+(pose.y-e.y)*.32));Control.apply(run,e,'stop',180);}
        if(['crater','leap','worldcross','ultimate'].includes(s.pattern)){e.x=Math.max(95,Math.min(944,e.x+(e.x>=pose.x?24:-24)));Control.apply(run,e,'stop',220);}
      }
    }
    events.push({type:'warrior-impact',kind:W.effectKind(s,index),skillId:s.id,pattern:s.pattern,index,radius:s.radius,x:['leap','crater','worldcross','ultimate'].includes(s.pattern)?c.target.x:pose.x,y:['leap','crater','worldcross','ultimate'].includes(s.pattern)?c.target.y:pose.y,facing:pose.facing,timeMs:run.time,origin:c.origin,target:c.target});
  }
  function advanceWarrior(run,hero,events) {
    const c=hero.warriorCast;c.elapsed+=STEP*actionRate(hero)*Miko.attackRate(run,hero);
    const pose=W.sample(c,c.elapsed);Object.assign(hero,{x:pose.x,y:pose.y,z:pose.z,hidden:pose.hidden,invulnerable:pose.invulnerable,motion:pose.motion,motionTime:pose.motionTime,facing:pose.facing});
    const times=W.hitTimes(c.spec);
    while(c.nextHit<times.length&&c.elapsed>=times[c.nextHit]*c.spec.duration){const index=c.nextHit++;warriorImpact(run,hero,c,W.sample(c,times[index]*c.spec.duration),index,events);}
    if(c.elapsed>=c.spec.duration){if(['return','eight'].includes(c.spec.pattern)){hero.x=c.origin.x;hero.y=c.origin.y;}hero.warriorCast=null;hero.z=0;hero.hidden=false;hero.invulnerable=false;state(hero,'idle');hero.cooldown=hero.interval;}
  }
  function startMageSkill(run,mage,s,target,events) {
    if(Castle.sleeping(mage,run.time)||Castle.silenced(mage,run.time)&&s.kind!=='normal')return false;
    if(run.status!=='running'||mage.mageCast||mage.hp<=0||target?.hp<=0||mage.mp<s.mp||mage.mageCooldowns[s.id]>0)return false;
    mage.mageCast=M.begin(s,mage,target,run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate));
    mage.mp-=s.mp;mage.mageCooldowns[s.id]=s.cooldown;mage.facing=mage.mageCast.facing;
    state(mage,s.kind==='normal'?'attacking':'skill','chant');
    mage.motionTime=0;
    events.push({type:'mage-cast',skillId:s.id,name:s.name,element:s.element,x:mage.x,y:mage.y,timeMs:run.time});
    return true;
  }
  function advanceMage(run,mage,events,c=mage.mageCast,copy=false) {
    if(copy&&run.time<c.startAt)return;const s=c.spec;c.elapsed+=STEP*actionRate(mage)*Miko.attackRate(run,mage);
    const pose=M.sample(c,c.elapsed);if(!copy)Object.assign(mage,{motion:pose.motion,motionTime:pose.motionTime});
    if(!c.released&&c.elapsed>=s.release) {
      c.released=true;if(!copy){Epic.spell(run,mage,events);if(s.extraCasts)for(const i of [-1,1]){const cast=M.begin({...s,extraCasts:0},{x:c.origin.x,y:c.origin.y+i*24},c.target,run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate));Object.assign(cast,{elapsed:s.release,released:true,startAt:run.time+(i===-1?120:240),actionId:mage.actionId+'-copy-'+i});run.epicMageCasts.push({actor:mage,cast});}}
      // Aim once at release. Tracking magic follows that enemy during flight only.
      const target=run.enemies.find(e=>e.id===c.target.id&&e.hp>0);
      if(target){c.target={id:target.id,x:target.x,y:target.y};const dx=target.x-c.origin.x,dy=target.y-c.origin.y,len=Math.hypot(dx,dy)||1;c.direction={x:dx/len,y:dy/len};}
    }
    if(['bolt','fireball','lightning'].includes(s.pattern)&&c.nextHit===0&&c.released){const target=run.enemies.find(e=>e.id===c.target.id&&e.hp>0);if(target){c.target.x=target.x;c.target.y=target.y;}else c.missed=true;}
    const times=M.hitTimes(s);
    while(c.nextHit<times.length&&c.elapsed>=times[c.nextHit]*s.duration) {
      const index=c.nextHit++,targets=c.missed?[]:M.targets(c,run.enemies.filter(e=>!e.dimensionalGate),index);
      const from=c.lastChain?{...c.lastChain}:c.origin;
      const center=s.pattern==='pillars'?M.pillar(c,index):c.target;
      const mult=index===s.hits-1?s.finalMultiplier:1;
      const focus=run.enemies.filter(e=>e.hp>0&&!e.dimensionalGate).length===1?s.focusMultiplier:1;
      for(const enemy of targets) {
        hit(run,mage,enemy,mage.damage*s.power*mult*focus,events,s.kind==='active',null,{actionId:copy?c.actionId:mage.actionId,secondary:copy,interferencePower:copy?0:I.power(s,index,enemy.id===c.target.id),interferenceKey:mage.actionId+':'+index});
        if(s.pattern==='chain'){c.chainIds.push(enemy.id);c.lastChain={id:enemy.id,x:enemy.x,y:enemy.y};}
        if(!enemy.boss&&enemy.hp>0&&!I.committed(enemy,run.time)) {
          if(s.pattern==='vortex'){enemy.x+=(c.target.x-enemy.x)*.28;enemy.y+=(c.target.y-enemy.y)*.28;if(Control.apply(run,enemy,'stop',240)){enemy.airStart=run.time;enemy.airUntil=run.time+250;enemy.airHeight=32;}}
          if(['frost-ring','crystal'].includes(s.pattern))Control.apply(run,enemy,'stop',380);
        }
      }
      if(!c.missed&&(s.pattern!=='chain'||targets.length))events.push({type:'mage-impact',skillId:s.id,kind:M.effectKind(s),pattern:s.pattern,element:s.element,index,hits:s.hits,power:s.power,radius:s.radius,width:s.width,x:center.x,y:center.y,origin:c.origin,target:{...c.target},direction:c.direction,facing:c.facing,from,targets:targets.map(e=>({id:e.id,x:e.x,y:e.y})),timeMs:run.time});
    }
    if(c.elapsed>=s.duration){if(copy)c.done=true;else{mage.mageCast=null;state(mage,'idle');mage.cooldown=mage.interval;}}
  }
  function fieldsFor(run,actor){return (run.paladinFields||[]).filter(f=>f.until>run.time&&f.source.hp>0&&(f.selfOnly?actor===f.source:f.allParty||distance(actor,f.center)<=f.spec.radius));}
  function paladinField(run,actor,c){
    const s=c.spec,id=s.id;if(!['aegis','reflect','fortress','bastion','sanctuary','revenge','ultimate'].includes(id))return;
    const duration=id==='revenge'?Math.max(0,s.windup+s.hold-c.elapsed):s.effectDuration;
    const field={id,source:actor,cast:id==='revenge'?c:null,spec:s,center:{...c.origin},start:run.time,until:run.time+duration,nextHeal:run.time+1000,spent:[],selfOnly:['reflect','revenge'].includes(id),allParty:actor.epicPaladinArmor&&!['reflect','revenge'].includes(id)||['aegis','bastion','ultimate'].includes(id)};
    run.paladinFields.push(field);return field;
  }
  function startPaladinSkill(run,actor,s,target,events){
    if(Castle.sleeping(actor,run.time)||Castle.silenced(actor,run.time)&&s.kind!=='normal')return false;
    if(actor.hp<=0||actor.mp<s.mp||run.status!=='running')return false;
    const c=P.begin(s,actor,target);actor.paladinCast=c;actor.mp-=s.mp;actor.paladinCooldowns[s.id]=s.cooldown;
    state(actor,'skill',s.motion);actor.facing=c.facing;
    events.push({type:'paladin-cast',skillId:s.id,name:s.name,x:actor.x,y:actor.y,timeMs:run.time});return true;
  }
  function paladinImpact(run,actor,c,index,events){
    const s=c.spec,party=[run.hero,...run.allies],points=P.targets(c,run.enemies.filter(e=>!e.dimensionalGate));
    if(s.id==='purify')for(const a of party.filter(a=>a.hp>0&&distance(a,c.origin)<=s.radius)){clearStatus(a);events.push({type:'paladin-cleanse',target:a.id,x:a.x,y:a.y,timeMs:run.time});}
    if(s.support)paladinField(run,actor,c);
    if(s.support&&index===0&&actor.epicPaladinWeapon){for(const enemy of run.enemies.filter(e=>e.hp>0&&!e.bodyPart&&!e.dimensionalGate))hit(run,actor,enemy,(actor.magicDamage||actor.damage)*10,events,true,'神聖',{secondary:true,critical:false});events.push({type:'paladin-impact',skillId:'ultimate',kind:'judgment',pattern:'all',index:0,hits:1,radius:1100,x:actor.x,y:actor.y,origin:{...actor},target:{...c.target},facing:actor.facing,timeMs:run.time});}
    if(s.id==='provoke')for(const e of run.enemies.filter(e=>e.hp>0&&distance(e,c.origin)<=s.radius)){e.tauntId=actor.id;e.tauntUntil=run.time+s.effectDuration;}
    for(const e of points){
      const base=s.element==='神聖'?(actor.magicDamage||actor.damage):(actor.weaponDamage||actor.damage),final=index===s.hits-1?s.finalMultiplier:1;
      const retaliation=s.id==='revenge'?Math.min(c.absorbed*.6,base*s.power*2):0;
      if(!hit(run,actor,e,base*s.power*final+retaliation,events,s.kind!=='normal',s.element,{actionId:actor.actionId,interferencePower:I.power(s,index,e.id===c.target.id),interferenceKey:actor.actionId+':'+index})||e.hp<=0)continue;
      if(!e.boss&&!I.committed(e,run.time)){
        if(s.push&&!c.pushed.includes(e.id)){e.x=Math.max(95,Math.min(944,e.x+c.direction.x*s.push));e.y=Math.max(334,Math.min(501,e.y+c.direction.y*s.push));c.pushed.push(e.id);}
        const controlled=(s.bind||s.stun||s.air)&&Control.apply(run,e,'stop',Math.max(s.bind,s.air,index===s.hits-1?s.stun:0));
        if(controlled&&s.air){e.airStart=run.time;e.airUntil=run.time+s.air;e.airHeight=90;}
      }
    }
    const area=['circle','all'].includes(s.pattern),center=area?c.target:c.origin;
    events.push({type:'paladin-impact',skillId:s.id,kind:P.effectKind(s),pattern:s.pattern,index,hits:s.hits,radius:s.radius,width:s.width,x:center.x,y:center.y,origin:{...c.origin},target:{...c.target},direction:{...c.direction},facing:c.facing,targets:points.map(e=>({id:e.id,x:e.x,y:e.y})),timeMs:run.time});
  }
  function advancePaladin(run,actor,events){
    const c=actor.paladinCast,s=c.spec;c.elapsed+=STEP*actionRate(actor)*Miko.attackRate(run,actor);
    const pose=P.sample(c,c.elapsed);actor.motion=pose.motion;actor.motionTime=pose.motionTime;actor.facing=pose.facing;
    if(!actor.rootAnchor){actor.x=Math.max(90,Math.min(944,pose.x));actor.y=Math.max(334,Math.min(501,pose.y));}
    if(!c.guardStarted&&['ultimate','revenge'].includes(s.id)&&c.elapsed>=320/s.speed){c.guardStarted=true;paladinField(run,actor,c);}
    const times=P.hitTimes(s);while(c.nextHit<times.length&&c.elapsed+1e-6>=times[c.nextHit]*s.duration)paladinImpact(run,actor,c,c.nextHit++,events);
    if(c.elapsed>=s.duration){actor.paladinCast=null;state(actor,'idle');actor.cooldown=actor.interval;}
  }
  function tickPaladinFields(run,party,events){
    run.paladinFields=run.paladinFields.filter(f=>f.until>run.time&&f.source.hp>0);
    for(const f of run.paladinFields)if(f.spec.heal&&run.time>=f.nextHeal){
      f.nextHeal+=1000;for(const a of party.filter(a=>a.hp>0&&distance(a,f.center)<=f.spec.radius)){const amount=Math.min(a.maxHp-a.hp,a.maxHp*f.spec.heal*Castle.healingFactor(a,run.time));a.hp+=amount;if(amount>0)events.push({type:'heal',target:a.id,amount:Math.round(amount),x:a.x,y:a.y-70,timeMs:run.time});}
    }
  }
  function tick(run, events) {
    run.time += STEP;
    const hero = run.hero;
    const party = [hero, ...run.allies];
    for (const actor of [...party, ...run.enemies]) {
      actor.worldTime=run.time;Glacier.expire(actor,run.time);Volcano.expire(actor,run.time);Castle.expire(actor,run.time);Control.update(actor,run.time);const rate=actor.hp>0?actionRate(actor):1;
      const spiritRate=ENEMIES[actor.type]?1:Miko.attackRate(run,actor);
      actor.time += STEP*rate*spiritRate; actor.cooldown = Math.max(0, actor.cooldown - STEP*(Control.stopped(actor,run.time)?1:rate)*spiritRate*(ENEMIES[actor.type]?1/run.trials.cooldown:1)); actor.flash = Math.max(0, actor.flash - STEP);
    }
    if (run.status !== 'running') return;
    run.elapsed += STEP;
    for(const extra of run.epicMageCasts||[])if(extra.actor.hp>0&&extra.actor.epicMageWeapon)advanceMage(run,extra.actor,events,extra.cast,true);
    run.epicMageCasts=(run.epicMageCasts||[]).filter(extra=>!extra.cast.done&&extra.actor.hp>0&&extra.actor.epicMageWeapon);
    tickPaladinFields(run,party,events);
    X.tickParts(run,expansionAPI,events);
    for (const actor of party) if (actor.hp > 0) {
      if (actor.rootUntil <= run.time) actor.rootAnchor = null;
      if (actor.rootAnchor) { actor.x = actor.rootAnchor.x; actor.y = actor.rootAnchor.y; }
      const poison = actor.poison;
      if (poison && run.time + 1e-6 >= poison.next && poison.next <= poison.until) { hit(run, poison.source, actor, poison.damage, events,false,null,{direct:false,miss:false}); poison.next += 1000; }
      if (actor.poison && run.time >= actor.poison.until) actor.poison = null;
      const bleed=actor.bleed;
      if(bleed&&run.time+1e-6>=bleed.next&&bleed.next<=bleed.until){hit(run,bleed.source,actor,bleed.damage,events,false,null,{direct:false,miss:false});bleed.next+=1000;}
      if(bleed&&run.time>=bleed.until)actor.bleed=null;
    }
    for (const actor of party) if (actor.hp > 0) {
      actor.skill = Math.max(0, actor.skill - STEP); actor.mp = Math.min(actor.maxMp, actor.mp + actor.mpRegen * STEP / 1000);
      for (const key of ['evadeCooldown', 'vortexCooldown', 'repelCooldown']) actor[key] = Math.max(0, (actor[key] || 0) - STEP);
      if(actor.type==='warrior')for(const key of Object.keys(actor.warriorCooldowns))actor.warriorCooldowns[key]=Math.max(0,actor.warriorCooldowns[key]-STEP);
      if(actor.type==='mage')for(const key of Object.keys(actor.mageCooldowns))actor.mageCooldowns[key]=Math.max(0,actor.mageCooldowns[key]-STEP);
      if(actor.type==='paladin')for(const key of Object.keys(actor.paladinCooldowns))actor.paladinCooldowns[key]=Math.max(0,actor.paladinCooldowns[key]-STEP);
      if(actor.type==='ninja')for(const key of Object.keys(actor.ninjaCooldowns))actor.ninjaCooldowns[key]=Math.max(0,actor.ninjaCooldowns[key]-STEP);
      if(actor.type==='shaman')for(const key of Object.keys(actor.shamanCooldowns))actor.shamanCooldowns[key]=Math.max(0,actor.shamanCooldowns[key]-STEP);
      if(actor.type==='miko')for(const key of Object.keys(actor.mikoCooldowns))actor.mikoCooldowns[key]=Math.max(0,actor.mikoCooldowns[key]-STEP);
    }
    if (run.phase === 'between') {
      run.transition -= STEP;
      if (run.transition <= 0) {
        run.wave++; for (const a of party) { if (a.hp > 0) a.hp = Math.min(a.maxHp, a.hp + 50); state(a, a.hp > 0 ? 'idle' : 'down'); }
        hero.x = 270; hero.y = 438;
        spawnWave(run, events);
      }
      return;
    }
    if (run.stage.special) tickGate(run, events);
    const living = run.enemies.filter(e => e.hp > 0 && !e.dimensionalGate);
    for (const hero of party) {
    if(hero.freezeUntil>run.time||Castle.sleeping(hero,run.time))continue;
    if(hero.bubbleUntil>run.time||Control.stopped(hero,run.time)){if(hero.type==='ninja')Ninja.cancel(run,hero,events);if(hero.type==='shaman')Shaman.cancel(run,hero);if(hero.type==='miko')Miko.cancel(run,hero);continue;}
    const nearest = living.filter(e => e.hp > 0&&(!['ninja','shaman','miko'].includes(hero.type)||!e.invulnerable&&!Control.owner(run,e).invulnerable&&Control.owner(run,e).hp>0)).reduce((best, enemy) => !best || distance(hero, enemy) < distance(hero, best) ? enemy : best, null);
    if (hero.hp > 0 && nearest) {
      if(hero.type==='miko'){
        if(hero.mikoCast){Miko.advance(run,hero,mikoAPI,events);continue;}
        if(hero.manualOnly){if(hero.state!=='idle')state(hero,'idle');continue;}
        hero.facing=nearest.x<hero.x?-1:1;const next=Castle.silenced(hero,run.time)?null:Miko.choose(run,hero);if(next){Miko.start(run,hero,next.spec,next.target,mikoAPI,events);continue;}
        if(!move(hero,nearest,hero.speed,400)&&hero.cooldown===0)Miko.start(run,hero,hero.mikoNormal,nearest,mikoAPI,events);
        else if(!hero.rootAnchor&&distance(hero,nearest)<280){const dx=hero.x-nearest.x,dy=hero.y-nearest.y,len=Math.hypot(dx,dy)||1;move(hero,{x:hero.x+dx/len*80,y:hero.y+dy/len*80},hero.speed,0);hero.motion='backward';}
        else if(hero.state==='moving'&&distance(hero,nearest)<=400)state(hero,'idle');continue;
      }
      if(hero.type==='shaman'){
        if(hero.shamanCast){Shaman.advance(run,hero,shamanAPI,events);continue;}
        if(hero.manualOnly){if(hero.state!=='idle')state(hero,'idle');continue;}
        hero.facing=nearest.x<hero.x?-1:1;const next=Castle.silenced(hero,run.time)?null:Shaman.choose(run,hero);
        if(next){Shaman.start(run,hero,next.spec,next.target,shamanAPI,events);continue;}
        if(!move(hero,nearest,hero.speed,360)&&hero.cooldown===0)Shaman.start(run,hero,hero.shamanNormal,nearest,shamanAPI,events);
        else if(!hero.rootAnchor&&distance(hero,nearest)<290){const dx=hero.x-nearest.x,dy=hero.y-nearest.y,len=Math.hypot(dx,dy)||1;move(hero,{x:hero.x+dx/len*80,y:hero.y+dy/len*80},hero.speed,0);hero.motion='backward';}
        else if(hero.state==='moving'&&distance(hero,nearest)<=360)state(hero,'idle');continue;
      }
      if(hero.type==='ninja'){
        if(hero.ninjaCast){Ninja.advance(run,hero,ninjaAPI,events);continue;}
        if(hero.manualOnly){if(hero.state!=='idle')state(hero,'idle');continue;}
        hero.facing=nearest.x<hero.x?-1:1;
        const next=Castle.silenced(hero,run.time)?null:N.choose(hero,living,run);if(next){Ninja.start(run,hero,next.spec,next.target,ninjaAPI,events);continue;}
        if(!move(hero,nearest,hero.speed,360)&&hero.cooldown===0)Ninja.start(run,hero,hero.ninjaNormal,nearest,ninjaAPI,events);
        else if(!hero.rootAnchor&&distance(hero,nearest)<285){const dx=hero.x-nearest.x,dy=hero.y-nearest.y,len=Math.hypot(dx,dy)||1;move(hero,{x:hero.x+dx/len*80,y:hero.y+dy/len*80},hero.speed,0);hero.motion='backward';}
        else if(hero.state==='moving'&&distance(hero,nearest)<=360)state(hero,'idle');
        continue;
      }
      if(hero.type==='paladin'){
        if(hero.paladinCast){advancePaladin(run,hero,events);continue;}
        hero.facing=nearest.x<hero.x?-1:1;
        const next=Castle.silenced(hero,run.time)?null:P.choose(hero,living,party,run);if(next){startPaladinSkill(run,hero,next.spec,next.target,events);continue;}
        if(!Castle.silenced(hero,run.time)&&P.waitForGuard(hero,party,run)){if(hero.state!=='idle')state(hero,'idle');continue;}
        if(!move(hero,nearest,hero.speed,hero.paladinNormal.radius)&&hero.cooldown===0)startPaladinSkill(run,hero,hero.paladinNormal,nearest,events);
        else if(hero.state==='moving'&&distance(hero,nearest)<=hero.paladinNormal.radius)state(hero,'idle');
        continue;
      }
      if(hero.type==='warrior'&&hero.warriorCast){advanceWarrior(run,hero,events);continue;}
      if(hero.type==='mage'&&hero.mageNormal) {
        if(hero.mageCast){advanceMage(run,hero,events);continue;}
        hero.facing=nearest.x<hero.x?-1:1;
        const next=Castle.silenced(hero,run.time)?null:M.choose(hero,living,run);
        if(next){startMageSkill(run,hero,next.spec,next.target,events);continue;}
        if(!move(hero,nearest,hero.speed,hero.mageNormal.reach)&&hero.cooldown===0)startMageSkill(run,hero,hero.mageNormal,nearest,events);
        else if(hero.state==='moving'&&distance(hero,nearest)<=hero.mageNormal.reach)state(hero,'idle');
        continue;
      }
      const hazard = run.projectiles.find(p => !p.tracking && p.duration - p.time < 350 && distance(hero, { x: p.tx, y: p.ty }) <= 105);
      const charge = living.find(e => e.state === 'windup' && e.time > 450 && distance(hero, e) < 300);
      if (hero.evade && !hero.evadeCooldown && hero.mp >= 8 && (hazard || charge)) {
        const origin = hazard ? { x: hazard.tx, y: hazard.ty } : charge;
        hero.escape = { x: Math.max(100, Math.min(940, hero.x + (hero.x < origin.x ? -130 : 130))), y: hero.y < 420 ? 490 : 340 };
        hero.mp -= 8; hero.evadeCooldown = 5000; state(hero, 'evading', 'forward');
      }
      if (hero.state === 'evading') {
        move(hero, hero.escape, hero.speed * 2.5, 0); hero.state = 'evading';
        if (distance(hero, hero.escape) < 5) { hero.counterReady = !!hero.counter; state(hero, 'idle'); }
        continue;
      }
      if (hero.type === 'mage' && hero.state !== 'skill' && hero.state !== 'attacking') {
        if (hero.vortex && !hero.vortexCooldown && hero.mp >= 14 && living.filter(e => distance(e, nearest) < 250).length > 1) {
          hero.mp -= 14; hero.vortexCooldown = 8000;
          living.filter(e => !e.boss && distance(e, nearest) < 250).forEach(e => { e.x += (nearest.x - e.x) * .65; e.y += (nearest.y - e.y) * .65; });
          events.push({ type: 'wind', x: nearest.x, y: nearest.y - 40, timeMs: run.time });
        }
        if (hero.repel && !hero.repelCooldown && hero.mp >= 10 && distance(hero, nearest) < 145) {
          hero.mp -= 10; hero.repelCooldown = 7000;
          living.filter(e => !e.boss && distance(hero, e) < 170).forEach(e => { e.x = Math.max(95, Math.min(944, e.x + (e.x >= hero.x ? 130 : -130))); });
          events.push({ type: 'wind', x: hero.x, y: hero.y - 40, timeMs: run.time });
        }
      }
      if (!['attacking', 'skill'].includes(hero.state)) hero.facing = nearest.x < hero.x ? -1 : 1;
      const warriorSkill = hero.type==='warrior' && !Castle.silenced(hero,run.time) && !['attacking','skill'].includes(hero.state) ? W.choose(hero,living,run) : null;
      if (['attacking', 'skill'].includes(hero.state)) {
        if (!hero.hit && hero.time >= (hero.type==='warrior'?160/(1+(hero.normalEnhance||0)*.03):340) / hero.attackSpeed) {
          hero.hit = true;
          if (hero.type === 'mage') launchMagic(run, hero, nearest);
          else {
            const targets = hero.state === 'skill' ? living.filter(e => distance(hero, e) <= 290 + (hero.skillRange || 0))
              : living.filter(e => distance(hero, e) <= hero.range*(1+(hero.normalEnhance||0)*.04) + 24).sort((a, b) => distance(hero, a) - distance(hero, b)).slice(0, hero.normalRank || 1);
            targets.forEach(e => hit(run, hero, e, hero.state === 'skill' ? hero.skillDamage : hero.damage * (1+(hero.normalEnhance||0)*.1) * (hero.counterReady ? 1.7 : 1), events, hero.state === 'skill'));
            events.push({ type: 'slash', skill: hero.state === 'skill', range: hero.range, x: hero.x, y: hero.y - 70, facing: hero.facing, timeMs: run.time });
          }
          hero.counterReady = false;
        }
        if (hero.time >= (hero.type==='warrior'?420/(1+(hero.normalEnhance||0)*.03):680) / hero.attackSpeed) state(hero, 'idle');
      } else if (warriorSkill) {
        startWarriorSkill(run,hero,warriorSkill.spec,warriorSkill.target,events);
      } else if (hero.type==='mage' && hero.skill === 0 && hero.mp >= 16 && distance(hero, nearest) < 360) {
        state(hero, 'skill', hero.type === 'mage' ? 'cast' : 'attack-far-to-near'); hero.mp -= hero.type === 'mage' ? 16 : 18;
        hero.skill = hero.skillInterval; hero.cooldown = hero.interval;
      } else if (!move(hero, nearest, hero.speed, hero.range)) {
        if (hero.cooldown === 0) {
          state(hero, 'attacking', hero.type === 'mage' ? 'cast' : 'attack-overhead'); hero.cooldown = hero.interval;
        } else if (hero.state !== 'idle') state(hero, 'idle');
      }
    }
    }
    Ninja.tick(run,ninjaAPI,events);
    for (const enemy of living) {
      if(enemy.bodyPart)continue;
      if(enemy.goddess){const target=party.filter(a=>a.hp>0).sort((a,b)=>distance(enemy,a)-distance(enemy,b))[0];if(target)Goddess.act(run,enemy,target,desertAPI,events);continue;}
      if(enemy.reincarnationGoddess){const target=party.filter(a=>a.hp>0).sort((a,b)=>distance(enemy,a)-distance(enemy,b))[0];if(target)Rebirth.act(run,enemy,target,desertAPI,events);continue;}
      const committed=enemy.swampPlan||enemy.expansionPlan||enemy.ruinsPlan||enemy.desertPlan||enemy.highlandPlan||enemy.glacierPlan||enemy.volcanoPlan||enemy.castlePlan||['attacking','windup','splitting'].includes(enemy.state);
      const hero = (committed&&party.find(a => a.id === enemy.targetId && a.hp > 0)) || (enemy.tauntUntil>run.time&&party.find(a=>a.id===enemy.tauntId&&a.hp>0)) || party.filter(a => a.hp > 0).sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
      if (enemy.hp <= 0 || !hero) continue;
      if(Control.stopped(enemy,run.time))continue;
      if(enemy.region===10){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);Castle.interrupt(run,enemy);if(enemy.motion!=='hit')state(enemy,'idle','hit');continue;}
        if(enemy.castlePlan)Castle.advance(run,enemy,desertAPI,events);
        else{enemy.facing=hero.x<enemy.x?-1:1;if(!Castle.approach(run,enemy,hero,desertAPI)){if(enemy.cooldown===0)Castle.start(run,enemy,hero,desertAPI,events);else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');}}
        continue;
      }
      if(enemy.region===9){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);Volcano.interrupt(run,enemy);if(enemy.motion!=='hit')state(enemy,'idle','hit');continue;}
        if(enemy.volcanoPlan)Volcano.advance(run,enemy,highlandAPI,events);
        else{enemy.facing=hero.x<enemy.x?-1:1;if(!Volcano.approach(run,enemy,hero,highlandAPI)){if(enemy.cooldown===0)Volcano.start(run,enemy,hero,highlandAPI,events);else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');}}
        continue;
      }
      if(enemy.region===8){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);Glacier.interrupt(run,enemy);if(enemy.motion!=='hit')state(enemy,'idle','hit');continue;}
        if(enemy.glacierPlan)Glacier.advance(run,enemy,highlandAPI,events);
        else{enemy.facing=hero.x<enemy.x?-1:1;if(!Glacier.approach(run,enemy,hero,highlandAPI)){if(enemy.cooldown===0)Glacier.start(run,enemy,hero,highlandAPI,events);else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');}}
        continue;
      }
      if(enemy.region===7){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);enemy.highlandPlan=null;enemy.z=0;state(enemy,'idle','hit');continue;}
        if(enemy.highlandPlan)Highland.advance(run,enemy,highlandAPI,events);
        else{enemy.facing=hero.x<enemy.x?-1:1;if(!Highland.approach(run,enemy,hero,highlandAPI)){if(enemy.cooldown===0)Highland.start(run,enemy,hero,highlandAPI,events);else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');}}
        continue;
      }
      if(enemy.region===6){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);enemy.desertPlan=null;enemy.desertDepth=0;state(enemy,'idle','hit');continue;}
        if(enemy.desertPlan)Desert.advance(run,enemy,desertAPI,events);
        else {enemy.facing=hero.x<enemy.x?-1:1;if(!move(enemy,hero,enemy.speed,enemy.range)){if(enemy.cooldown===0)Desert.start(run,enemy,hero,desertAPI,events);else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');}}
        continue;
      }
      if(enemy.region===5){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);enemy.ruinsPlan=null;state(enemy,'idle','hit');continue;}
        if(enemy.ruinsPlan)Ruins.advance(run,enemy,ruinsAPI,events);
        else {enemy.facing=hero.x<enemy.x?-1:1;if(!move(enemy,hero,enemy.speed,enemy.range)){if(enemy.cooldown===0)Ruins.start(run,enemy,hero,ruinsAPI,events);else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');}}
        continue;
      }
      if(enemy.region>=3){
        if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);enemy.expansionPlan=null;state(enemy,'idle','hit');continue;}
        if(enemy.expansionPlan)X.advance(run,enemy,hero,expansionAPI,events);
        else {enemy.facing=hero.x<enemy.x?-1:1;
          if(!move(enemy,hero,enemy.speed,enemy.range)){
            if(enemy.cooldown===0)startExpansionAttack(run,enemy,hero,events);
            else if(enemy.state!=='idle'||enemy.motion!=='idle')state(enemy,'idle');
          }
        }
        continue;
      }
      if (enemy.region === 2) {
        if (enemy.stagger > 0) {
          enemy.stagger = Math.max(0, enemy.stagger - STEP);
          // Interrupt the committed cast; it must restart before releasing a summon.
          enemy.swampPlan = null; state(enemy, 'idle', 'hit'); continue;
        }
        if (enemy.swampPlan) advanceSwamp(run, enemy, hero, events);
        else {
          enemy.facing = hero.x < enemy.x ? -1 : 1;
          if (!move(enemy, hero, enemy.speed, enemy.range)) {
            if (enemy.cooldown === 0) startSwampAttack(run, enemy, hero, events);
            else if (enemy.state !== 'idle' || enemy.motion !== 'idle') state(enemy, 'idle');
          }
        }
        continue;
      }
      if(enemy.stagger>0){enemy.stagger=Math.max(0,enemy.stagger-STEP);enemy.motion='hit';continue;}
      if(enemy.motion==='hit')state(enemy,'idle');
      enemy.special = Math.max(0, enemy.special - STEP / run.trials.cooldown);
      if (enemy.state === 'splitting') {
        if (enemy.time >= (I.config(enemy,'split')?.warn||880)) {
          if (run.enemies.filter(e => e.hp > 0).length < 18) {
            const summoned = spawn(run, 'slime', { x: Math.max(95, enemy.x - 95), y: enemy.y });
            run.extraEnemies++;
            events.push({ type: 'summon', x: summoned.x, y: summoned.y, timeMs: run.time });
          }
          enemy.special = 8000; state(enemy, 'idle');
        }
        continue;
      }
      if (enemy.state === 'windup') {
        if (enemy.time >= (I.config(enemy,'charge-windup')?.warn||800)) beginAttack(run, enemy);
        continue;
      }
      if (enemy.state === 'attacking') {
        if (enemy.type === 'boss-boar' && !enemy.hit) move(enemy, enemy.actionInterference?.aim||hero, 750, 0);
        // move changes state only for pursuit; preserve the committed charge.
        if (enemy.type === 'boss-boar') enemy.state = 'attacking';
        if (!enemy.hit && enemy.time >= enemy.attackImpact) {
          enemy.hit = true;
          if (enemy.type === 'alraune-minion' || enemy.motion === 'seed-burst') launch(run, enemy, 'seed', events);
          else if (enemy.motion === 'root-bury' || enemy.motion === 'throw-fruit') launch(run, enemy, enemy.motion === 'root-bury' ? 'root' : 'fruit', events);
          else if (enemy.actionInterference?enemy.actionInterference.shapes.some(s=>I.contains(s,hero)):distance(enemy,hero)<=enemy.range+25) hit(run, enemy, hero, (enemy.actionDamage??enemy.damage), events,false,null,{threat:enemy.actionThreat});
        }
        if (enemy.time >= enemy.attackDuration) state(enemy, 'idle');
        continue;
      }
      enemy.facing = hero.x < enemy.x ? -1 : 1;
      if (enemy.type === 'boss-slime' && !run.stage.special && enemy.special === 0&&!Control.sealed(enemy,run.time)) { state(enemy, 'splitting', 'split');const a=I.begin(run,enemy,'split',I.config(enemy,'split').warn,enemy,events);a.shapes=[{kind:'circle',center:{x:enemy.x,y:enemy.y},radius:110}];continue; }
      if (!move(enemy, hero, enemy.speed, enemy.range)) {
        if (enemy.cooldown === 0) {
          if (enemy.type === 'boss-boar') {enemy.targetId=hero.id;state(enemy, 'windup', 'charge-windup');const a=I.begin(run,enemy,'charge-windup',I.config(enemy,'charge-windup').warn,hero,events);a.shapes=[{kind:'lane',from:a.origin,to:a.aim,width:enemy.range+25}];}
          else beginAttack(run, enemy);
        } else if (enemy.state !== 'idle') state(enemy, 'idle');
      }
    }
    for (const projectile of run.projectiles) {
      if (projectile.kind === 'wind') {
        const target = run.enemies.find(e => e.id === projectile.targetId && e.hp > 0);
        projectile.time += STEP;
        if (!target) { projectile.time = projectile.duration; continue; }
        projectile.tx = target.x; projectile.ty = target.y - (target.height || 70) * .55;
        if (projectile.time >= projectile.duration) {
          const targets = [target, ...(projectile.chain ? run.enemies.filter(e => e.hp > 0 && !e.dimensionalGate && e !== target && distance(e, target) < 150 + (projectile.source.chainRange || 0)).slice(0, 2) : [])];
          for (const enemy of targets) {
            hit(run, projectile.source, enemy, projectile.damage, events, projectile.skill,null,{actionId:projectile.actionId});
            events.push({ type: 'wind', skill: projectile.skill, x: enemy.x, y: enemy.y - (enemy.height || 70) * .55, timeMs: run.time });
          }
        }
        continue;
      }
      const hero = party.find(a => a.id === projectile.targetId) || run.hero;
      projectile.time += STEP;
      if (projectile.time >= projectile.duration) {
        if(projectile.expansion){X.impact(run,projectile,hero,expansionAPI,events);continue;}
        if (hero.hp > 0 && (projectile.tracking || distance(hero, { x: projectile.tx, y: projectile.ty }) <= 100)) {
          if (hit(run, projectile.source, hero, projectile.damage, events,false,null,{miss:projectile.miss,direct:projectile.direct,actionId:projectile.actionId,threat:projectile.threat}) && projectile.kind === 'poison-bolt') applyStatus(run, hero, 'poison', projectile.source, events);
        }
        if (['poison-bolt', 'energy-bolt'].includes(projectile.kind)) events.push({ type: 'swamp-effect', effect: projectile.kind === 'poison-bolt' ? 'toad-poison-impact' : 'lich-energy-impact', x: projectile.tx, y: projectile.ty, timeMs: run.time });
        else events.push({ type: 'impact', kind: projectile.kind, x: projectile.tx, y: projectile.ty, timeMs: run.time });
      }
    }
    run.projectiles = run.projectiles.filter(p => p.time < p.duration);
    Shaman.tick(run,shamanAPI,events);
    Miko.tick(run,mikoAPI,events);Ruins.tick(run,ruinsAPI,events);Desert.tick(run,desertAPI,events);Highland.tick(run,highlandAPI,events);Glacier.tick(run,highlandAPI,events);Volcano.tick(run,highlandAPI,events);Castle.tick(run,desertAPI,events);
    for (const actor of party) if (actor.hp > 0 && actor.rootAnchor) { actor.x = actor.rootAnchor.x; actor.y = actor.rootAnchor.y; }
    Goddess.tick(run,desertAPI,events);TrialCombat.tick(run,desertAPI,events);
    const timedOut=run.stage.timeLimit&&run.elapsed+1e-6>=run.stage.timeLimit&&run.enemies.some(e=>e.hp>0);
    if ((party.every(a => a.hp === 0)||timedOut) && run.deliveryVictoryAt == null) {
      if(timedOut)run.failureReason='timeout';Goddess.clear(run);TrialCombat.clear(run);Rebirth.clear(run);
      run.status = 'defeat'; run.projectiles = [];run.enemies.forEach(I.clear);
      party.forEach(clearStatus);run.paladinFields=[];
      Ninja.clear(run,null,events);
      Shaman.clear(run);
      Miko.clear(run);run.epicMageCasts=[];Ruins.clear(run);Desert.clear(run);Highland.clear(run);Glacier.clear(run);Volcano.clear(run);Castle.clear(run);
      events.push({ type: 'finished', victory: false, timeMs: run.time });
    } else if (run.enemies.every(e => e.hp === 0)) {
      if(run.enemies.some(e=>e.goddess&&run.time-e.departedAt<2200))return;
      if(run.enemies.some(e=>e.reincarnationGoddess&&run.time-e.departedAt<2400))return;
      Rebirth.clear(run);
      Goddess.clear(run);TrialCombat.clear(run);
      run.enemies.forEach(I.clear);
      run.projectiles = [];run.paladinFields=[]; for(const a of party){clearStatus(a);a.warriorCast=null;a.mageCast=null;a.paladinCast=null;a.z=0;a.hidden=false;a.invulnerable=false;state(a,a.hp>0?'idle':'down');}
      Ninja.clear(run,null,events);
      Shaman.clear(run);
      Miko.clear(run);run.epicMageCasts=[];Ruins.clear(run);Desert.clear(run);Highland.clear(run);Glacier.clear(run);Volcano.clear(run);Castle.clear(run);
      if (run.wave === run.stage.waves.length - 1) {
        run.status = 'victory'; events.push({ type: 'finished', victory: true, timeMs: run.time });
      } else {
        run.phase = 'between'; run.transition = 1600;
        events.push({ type: 'wave-clear', wave: run.wave + 1, timeMs: run.time });
      }
    }
  }
  function update(run, elapsed) {
    if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError('Invalid elapsed time');
    run.accumulator += elapsed;
    const events = [];
    while (run.accumulator + 1e-8 >= STEP) { tick(run, events); run.accumulator -= STEP; }
    return events;
  }
  function heal(run) {
    if (run.status !== 'running' || run.hero.hp <= 0 || run.hero.hp >= run.hero.maxHp) return 0;
    const amount = Math.min(126*Castle.healingFactor(run.hero,run.time), run.hero.maxHp - run.hero.hp); run.hero.hp += amount; return amount;
  }
  function applyBuilds(run, builds) {
    for (const a of [run.hero, ...run.allies]) {
      const hpRatio = a.hp / a.maxHp, mpRatio = a.mp / a.maxMp;
      Object.assign(a, builds[a.type]); a.hp = a.maxHp * hpRatio; a.mp = a.maxMp * mpRatio;
      if(!a.gemAegis)delete a.gemBarrier;
      if(!a.epicMageArmor)delete a.epicMageBarrier;
      if(!a.epicWarriorArmor){delete a.epicRage;delete a.epicRageUntil;}
      if(a.type==='miko')Miko.reconcile(run,a);
      if(a.type==='shaman')Shaman.reconcile(run,a);
      if(a.type==='ninja')Ninja.reconcile(run,a);
    }
  }
  const startNinjaSkill=(run,actor,s,target,events=[],force=false)=>Ninja.start(run,actor,s,target,ninjaAPI,events,force);
  const startShamanSkill=(run,actor,s,target,events=[],force=false)=>Shaman.start(run,actor,s,target,shamanAPI,events,force);
  const startMikoSkill=(run,actor,s,target,events=[],force=false)=>Miko.start(run,actor,s,target,mikoAPI,events,force);
  return { createRun, update, heal, applyBuilds, startWarriorSkill, startMageSkill, startPaladinSkill, startNinjaSkill, startShamanSkill, startMikoSkill, startSwampAttack, startExpansionAttack, applyStatus, hit, fieldsFor, STEP, distance };
});
