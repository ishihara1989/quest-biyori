'use strict';
((root,factory)=>{const commonJS=typeof module==='object'&&module.exports;const api=factory(commonJS?require('./forest-progression.js'):root.ForestProgression,commonJS?require('../data/forest-data.js'):root.ForestData);if(commonJS)module.exports=api;else root.MuseumLibrary=api;})(globalThis,(P,D)=>{
  function unlocked(save,owner,clip) {
    if(!owner)return false;
    if(owner.side==='enemy')return D.enemyDiscovered(save,owner.id);
    if(!P.unlocked(save,owner.id))return false;
    return !clip?.unlockLevel||P.level(save.progression.characters[owner.id].xp)>=clip.unlockLevel;
  }
  function condition(owner,clip,stageLabel) {
    if(owner.side==='enemy')return stageLabel(owner.firstStage)+' クリア';
    return owner.label+' 加入'+(clip?.unlockLevel?' ＋ Lv.'+clip.unlockLevel:'');
  }
  const sequence=m=>m.frameSequence||m.frames.map((_,i)=>i);
  function positionAt(m,time) {let end=0;const seq=sequence(m);for(let i=0;i<seq.length;i++){end+=m.frames[seq[i]].durationMs;if(time<end)return i;}return seq.length-1;}
  function timeAt(m,position) {return sequence(m).slice(0,position).reduce((sum,i)=>sum+m.frames[i].durationMs,0);}
  function step(m,time,direction) {const seq=sequence(m),position=(positionAt(m,time)+direction+seq.length)%seq.length;return timeAt(m,position);}
  return {unlocked,condition,sequence,positionAt,timeAt,step};
});
