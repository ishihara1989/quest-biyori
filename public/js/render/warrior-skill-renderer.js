'use strict';
window.WarriorSkillRenderer = (() => {
  const kinds=['slash','ring','impact','fissure','cross','rupture'];
  async function load(){
    await ImageEffects.load();
    const entries=await Promise.all(kinds.map(async id=>{const base='assets/skills/warrior/effects/'+id+'/';const data=await fetch(base+'manifest.json').then(r=>{if(!r.ok)throw Error(base);return r.json();});const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=base+data.sheet;});return [id,{data,image}];}));return Object.fromEntries(entries);
  }
  function sprite(ctx,a,time,x,y,width,height,rotation=0,alpha=1){
    if(!a)return;const d=a.data,f=d.frames[MotionPlayback.frameAt(d,Math.max(0,Math.min(time,d.durationMs-.01)))];
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(a.image,f.x,f.y,f.width,f.height,-width*d.pivot.x/d.frameWidth,-height*d.pivot.y/d.frameHeight,width,height);ctx.restore();
  }
  function ghosts(ctx,actor,draw){
    const c=actor.warriorCast;if(!c)return;const p=c.elapsed/c.spec.duration;
    if(!['return','z','auto','eight','flurry','running','tornado','ultimate','line'].includes(c.spec.pattern)||p<.08)return;
    for(let i=4;i>0;i--){const pose=WarriorSkills.sample(c,Math.max(0,c.elapsed-i*35));if(pose.hidden)continue;ctx.save();ctx.globalCompositeOperation='screen';draw({...actor,...pose,time:pose.motionTime,motionTime:pose.motionTime,warriorCast:null,flash:0,hp:Math.max(1,actor.hp)},.22*(1-i/5));ctx.restore();}
    for(let i=8;i>0;i--){const a=WarriorSkills.sample(c,Math.max(0,c.elapsed-i*18)),b=WarriorSkills.sample(c,Math.max(0,c.elapsed-(i-1)*18));ImageEffects.link(ctx,{x:a.x,y:a.y-a.z-70},{x:b.x,y:b.y-b.z-70},'#ffe4a0',.6,12,c.elapsed);}
  }
  function castOverlay(ctx,actor,assets){
    const c=actor.warriorCast;if(!c)return;const s=c.spec,p=c.elapsed/s.duration,t=c.target;
    if(['invisible','ultimate'].includes(s.pattern)&&p>.12&&p<.93){
      const scars=c.enemies.length?c.enemies:[t];const count=s.pattern==='ultimate'?Math.min(10,Math.floor(p/.046)):12;
      for(let i=0;i<count;i++){const a=scars[i%scars.length],ox=(i%3-1)*48,oy=(i%4)*20;ImageEffects.link(ctx,{x:a.x+ox-35,y:a.y-90-oy},{x:a.x+ox+45,y:a.y-140-oy},'#fff1c1',1,18,c.elapsed+i*53);}
    }
    if(['sphere','tornado'].includes(s.pattern)&&p>.2&&p<.83){
      const width=Math.min(760,s.radius*1.7);sprite(ctx,assets.ring,c.elapsed%400,actor.x,actor.y-45,width,width*.7,0,.75);
      if(s.pattern==='tornado')for(let i=1;i<3;i++)sprite(ctx,assets.ring,(c.elapsed+i*100)%400,actor.x,actor.y-45-i*65,width*(1-i*.16),width*.42,0,.6);
    }
    if(['crater','ultimate'].includes(s.pattern)&&actor.z>130)ImageEffects.ring(ctx,c.elapsed,t.x,t.y,90,30,'#f8dfa0',.65);
  }
  function impacts(ctx,events,time,assets){
    for(const e of events){if(e.type!=='warrior-impact')continue;const age=time-e.timeMs;if(age<0||age>650)continue;
      const large=['ultimate','divide','worldcross','invisible'].includes(e.pattern),width=Math.max(150,Math.min(large?1000:650,e.radius*1.65)),fade=Math.min(1,(650-age)/200),ms=Math.min(399,age);
      if(e.kind==='fissure'){
        const left=e.origin.x,right=e.origin.x+e.facing*Math.min(e.radius,900),center=(left+right)/2;
        sprite(ctx,assets.fissure,ms,center,e.origin.y,Math.abs(right-left),180,0,fade);
        if(e.pattern==='divide'){sprite(ctx,assets.slash,ms,e.x,e.y-145,560,750,Math.PI/2,fade);}
      }else if(e.pattern==='worldcross'&&e.index<2){sprite(ctx,assets.slash,ms,512,340,e.index===0?1000:700,e.index===0?240:340,e.index===0?0:Math.PI/2,fade);}
      else if(e.pattern==='invisible'||(e.pattern==='ultimate'&&e.index===11)){
        for(let i=0;i<3;i++)sprite(ctx,assets.rupture,ms,260+i*245,405-(i%2)*60,350,350,0,fade);
      }else {const ground=['impact','ring'].includes(e.kind);sprite(ctx,assets[e.kind],ms,e.x+(e.kind==='slash'?e.facing*55:0),e.y-(ground?0:85),width,e.kind==='ring'?width*.65:width,0,fade);}
      if(e.kind==='impact'&&age<100)ImageEffects.screen(ctx,'#ffe6a5',(1-age/100)*(large?.15:.07),age);
      ImageEffects.burst(ctx,e.x,e.y-50,age,large?24:10,'#ffe9b0',1,fade);
    }
  }
  return {load,ghosts,castOverlay,impacts,sprite};
})();
