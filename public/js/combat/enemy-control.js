'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EnemyControl=api;})(globalThis,()=>{
  // Classification belongs to actions, not to the ninja or an enemy-name list.
  const I=typeof module==='object'&&module.exports?require('./action-interference.js'):globalThis.ActionInterference;
  const ACTIONS = {
    attack:['normal',true],sword:['normal',true],bite:['normal',true],claw:['normal',true],thrust:['normal',true],punch:['normal',true],
    tongue:['normal',true],'poison-bolt':['normal',true],'energy-bolt':['normal',true],seed:['normal',true],'seed-burst':['normal',true],
    sonic:['special',false],drain:['special',true],dive:['special',true],dash:['special',true],spin:['special',false],
    bury:['special',false],web:['special',true],'web-bolt':['special',true],volley:['special',true],'claw-bolt':['special',true],
    slam:['special',false],throw:['special',true],'rock-bolt':['special',true],excavate:['special',false],'earth-debris':['special',false],
    stomp:['special',false],quake:['special',false],sweep:['special',false],tail:['special',false],tentacle:['special',false],
    ink:['special',true],'ink-bolt':['special',true],bubble:['special',true],'bubble-bolt':['special',true],breath:['special',false],
    'water-breath':['special',false],'worm-tail':['special',false],'kraken-tentacle':['special',false],
    grab:['special',true],chant:['special',false],'dark-cast':['special',false],'dark-magic':['special',false],
    windup:['special',false],charge:['special',false],'charge-windup':['special',true],split:['special',false],
    'summon-skeletons':['special',false],'root-bury':['special',false],root:['special',false],'throw-fruit':['special',false],fruit:['special',false],
    rest:['rest',false],shell:['rest',false],
    blade:['normal',true],retreat:['movement',false],rocks:['special',true],feathers:['special',true],
    venom:['special',true],ring:['special',false],gust:['special',false],pounce:['special',false],'double-claw':['special',true],
  };
  const PRIORITY={root:1,seal:2,stop:3};
  function owner(run,enemy){return enemy.bodyPart?run.enemies.find(e=>e.id===enemy.ownerId)||enemy:enemy;}
  function update(enemy,time){
    if(enemy.controlUntil&&enemy.controlUntil<=time){enemy.controlImmuneUntil=Math.max(enemy.controlImmuneUntil||0,enemy.controlUntil+2500);enemy.controlKind=null;enemy.controlUntil=0;enemy.controlAnchor=null;}
  }
  function apply(run,enemy,kind,duration,source=null){
    enemy=owner(run,enemy);update(enemy,run.time);
    if(kind==='stop'&&I.committed(enemy,run.time))return false;
    if(!PRIORITY[kind]||!(duration>0)||enemy.hp<=0||enemy.invulnerable||enemy.boss||enemy.majorBoss||enemy.controlImmuneUntil>run.time)return false;
    if(enemy.controlUntil>run.time){
      if(PRIORITY[kind]<=PRIORITY[enemy.controlKind])return false;
      enemy.controlUntil=Math.min(enemy.controlStart+2000,run.time+duration);
    }else {enemy.controlStart=run.time;enemy.controlUntil=run.time+Math.min(2000,duration);}
    enemy.controlKind=kind;enemy.controlSource=source;
    if(kind==='root')enemy.controlAnchor={x:enemy.x,y:enemy.y};else enemy.controlAnchor=null;
    return true;
  }
  function blind(run,enemy,duration,source=null){
    enemy=owner(run,enemy);if(enemy.hp<=0||enemy.invulnerable)return false;
    const boss=enemy.boss||enemy.majorBoss;
    enemy.ninjaBlindChance=Math.max(enemy.ninjaBlindUntil>run.time?enemy.ninjaBlindChance||0:0,boss?.15:.5);
    enemy.ninjaBlindUntil=Math.max(enemy.ninjaBlindUntil||0,run.time+duration*(boss?.5:1));enemy.ninjaBlindSource=source;return true;
  }
  function slow(run,enemy,value,duration=2000,source=null){
    enemy=owner(run,enemy);if(enemy.hp<=0||enemy.invulnerable||enemy.boss||enemy.majorBoss)return false;
    enemy.ninjaSlow=Math.max(enemy.ninjaSlowUntil>run.time?enemy.ninjaSlow||0:0,value);enemy.ninjaSlowUntil=Math.max(enemy.ninjaSlowUntil||0,run.time+duration);enemy.ninjaSlowSource=source;return true;
  }
  function stopped(enemy,time){return enemy.controlKind==='stop'&&enemy.controlUntil>time;}
  function sealed(enemy,time){return enemy.controlKind==='seal'&&enemy.controlUntil>time;}
  function movement(enemy,time){if(stopped(enemy,time)||enemy.controlKind==='root'&&enemy.controlUntil>time)return 0;return enemy.ninjaSlowUntil>time?1-enemy.ninjaSlow:1;}
  function classify(part){const events=part.events||[];const classes=[ACTIONS[part.motion],...events.map(e=>ACTIONS[e.kind])].filter(Boolean);
    return {classification:classes.some(c=>c[0]==='special')?'special':classes[0]?.[0]||'normal',blindable:events.length?events.every(e=>(ACTIONS[e.kind]||ACTIONS[part.motion]||['normal',true])[1]):(ACTIONS[part.motion]||['normal',true])[1]};}
  function plan(run,enemy,parts,normalParts=parts){
    let chosen=parts.map(p=>({...p,...classify(p)}));
    if(sealed(enemy,run.time)&&chosen.some(p=>p.classification==='special'))chosen=normalParts.map(p=>({...p,...classify(p)})).filter(p=>p.classification!=='special');
    return chosen.length?chosen:null;
  }
  function roll(run,enemy,parts){
    const attacking=parts.filter(p=>p.events?.length);enemy.actionBlindable=attacking.length?attacking.every(p=>p.blindable??classify(p).blindable):false;
    enemy.actionMiss=false;enemy.actionMissRolled=false;
    enemy.actionClassification=parts.some(p=>(p.classification||classify(p).classification)==='special')?'special':'normal';
  }
  function miss(run,enemy){if(!enemy.actionMissRolled){enemy.actionMissRolled=true;enemy.actionMiss=!!(enemy.actionBlindable&&enemy.ninjaBlindUntil>run.time&&run.random()<(enemy.ninjaBlindChance||0));}return !!enemy.actionMiss;}
  function clearSource(enemy,source,time){
    if(enemy.controlSource===source){if(enemy.controlUntil>time)enemy.controlImmuneUntil=Math.max(enemy.controlImmuneUntil||0,time+2500);enemy.controlKind=null;enemy.controlUntil=0;enemy.controlAnchor=null;enemy.controlSource=null;}
    if(enemy.ninjaBlindSource===source){enemy.ninjaBlindUntil=0;enemy.ninjaBlindChance=0;enemy.ninjaBlindSource=null;}
    if(enemy.ninjaSlowSource===source){enemy.ninjaSlowUntil=0;enemy.ninjaSlow=0;enemy.ninjaSlowSource=null;}
  }
  function clear(enemy){for(const key of ['controlUntil','controlStart','controlImmuneUntil','ninjaBlindUntil','ninjaBlindChance','ninjaSlowUntil','ninjaSlow'])enemy[key]=0;enemy.controlKind=null;enemy.controlAnchor=null;enemy.actionMiss=false;enemy.actionMissRolled=false;enemy.controlSource=null;enemy.ninjaBlindSource=null;enemy.ninjaSlowSource=null;}
  return {ACTIONS,PRIORITY,owner,update,apply,blind,slow,stopped,sealed,movement,classify,plan,roll,miss,clear,clearSource};
});
