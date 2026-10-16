'use strict';
window.MageSkillRenderer = (() => {
  const KINDS=['arcane','arcane-impact','fire','fire-impact','ice','ice-impact','lightning','earth','meteor','cosmos','four','circle','cloud','wind','wind-impact'];
  const COLORS={'無':'#96ddff','風':'#8ff0c0','火':'#ffab60','氷':'#92e5ff','雷':'#d4a4ff','土':'#e8ba7c','火・土':'#ff9d5c','複合':'#e8e6ff'};
  async function load() {
    await ImageEffects.load();
    return Object.fromEntries(await Promise.all(KINDS.map(async id=>{
      const base='assets/skills/mage/effects/'+id+'/';
      const response=await fetch(base+'manifest.json');if(!response.ok)throw Error(base);
      const data=await response.json(),image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(base+data.sheet));i.src=base+data.sheet;});return [id,{data,image}];
    })));
  }
  function sprite(ctx,a,time,x,y,width,height,angle=0,alpha=1) {
    if(!a||alpha<=0)return;const d=a.data,t=d.loop?Math.max(0,time)%d.durationMs:Math.min(Math.max(0,time),d.durationMs-.01),f=d.frames[MotionPlayback.frameAt(d,t)];
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.drawImage(a.image,f.x,f.y,f.width,f.height,-width*d.pivot.x/d.frameWidth,-height*d.pivot.y/d.frameHeight,width,height);ctx.restore();
  }
  function ring(ctx,assets,time,x,y,r,color,alpha=.65,angle=0) {
    ctx.save();ctx.translate(x,y);ctx.scale(1,.325);sprite(ctx,assets.circle,time,0,0,r*2,r*2,angle,alpha);ctx.restore();
    ImageEffects.ring(ctx,time,x,y,r,r*.32,color,alpha*.6);
  }
  function line(ctx,a,b,color,time,width=3) {
    ImageEffects.link(ctx,a,b,color,1,width*5,time,'lightning');
  }
  function castOverlay(ctx,actor,assets,reduced=false) {
    const c=actor.mageCast;if(!c)return;const s=c.spec,t=c.elapsed,up=s.cast==='up',color=COLORS[s.element],clock=reduced?0:t;
    const first=MageSkills.hitTimes(s)[0]*s.duration,active=t>=s.release&&t<=s.release+s.hold;
    const tip=MageMotions.emission(up?'up':'forward'),o={x:actor.x+actor.facing*tip.x,y:actor.y+tip.y},aim={x:c.target.x,y:c.target.y-50};
    ring(ctx,assets,clock,actor.x,actor.y,Math.min(105,30+s.unlockLevel*.65),color,t<s.chant?.65:.4);
    if(t<s.chant) {
      for(let i=0;i<8+(s.unlockLevel>=90?16:0);i++){const a=i*2.399+(reduced?0:t/450),r=32+(i%4)*8;ImageEffects.mote(ctx,actor.x+Math.cos(a)*r,actor.y-35-((clock/4+i*13)%100),11,color,.6,clock+i*47);}
      ctx.save();ctx.fillStyle='#122131';ctx.fillRect(actor.x-25,actor.y-162,50,4);ctx.fillStyle=color;ctx.fillRect(actor.x-25,actor.y-162,50*Math.min(1,t/s.chant),3);ctx.restore();
    }
    if(['meteor','prison','cosmos'].includes(s.pattern)&&t<s.release+s.hold) {
      ImageEffects.screen(ctx,s.pattern==='meteor'?'#9c251d':'#100928',(reduced?.08:.19)*Math.min(1,t/600),clock);
    }
    if(s.pattern==='meteor'&&t<first) {
      const q=Math.max(0,(t-s.release)/(first-s.release)),r=35+q*s.radius*.65;
      ImageEffects.sprite(ctx,'aura',clock,aim.x,c.target.y,r*2,r*.64,'#170b10',.15+q*.35);
      ring(ctx,assets,clock,aim.x,c.target.y,s.radius*.8,color,.2+q*.45);
      if(t>=s.release){const y=aim.y-510*(1-q*q*q),size=90+q*360;sprite(ctx,assets.meteor,clock,aim.x-110*(1-q),y,size,size,0,.9);}
      else sprite(ctx,assets.fire,clock,aim.x,35,22+20*t/s.release,22+20*t/s.release,0,.8);
    }
    if(['storm','prison'].includes(s.pattern)) {
      const count=s.pattern==='prison'?4:3;
      for(let i=0;i<count;i++)sprite(ctx,assets.cloud,clock+i*90,s.pattern==='prison'?160+i*230:c.target.x+(i-1)*140,150,310,190,0,.75);
      if(s.pattern==='prison')ring(ctx,assets,clock,512,92,260,color,.8,reduced?0:t/3800);
    }
    if(s.pattern==='cosmos'&&t<first) {
      const gather=Math.min(1,t/s.release),fall=t<s.release?0:Math.pow((t-s.release)/(first-s.release),3),x=c.target.x,y=110+(c.target.y-155)*fall;
      for(let i=0;i<3;i++)ring(ctx,assets,clock+i*110,x,85+i*22,175+i*42,['#ffd393','#a4efff','#dfb5ff'][i],.5,reduced?0:(i%2?1:-1)*t/3400);
      sprite(ctx,assets.cosmos,clock,x,y,120+gather*280,120+gather*280,0,.95);
      for(let i=0;i<32;i++){const a=i*2.399+(reduced?0:t/1400),r=(1-((clock+i*31)%800)/800)*260;ImageEffects.mote(ctx,x+Math.cos(a)*r,110+Math.sin(a)*r*.4,14,['#ffae6b','#a2eaff','#dbb0ff','#9befc5'][i%4],.65,clock+i*31);}
    }
    if(up&&['frost-ring','vortex','rain','pillars','crystal','avalanche','lightning'].includes(s.pattern)) {
      const centers=s.pattern==='pillars'?c.enemies.slice(0,5):[c.target];for(const center of centers)ring(ctx,assets,clock,center.x,center.y,s.pattern==='pillars'?s.radius*.5:s.radius,color,t<s.release?.3:.5);
      if(s.pattern==='vortex'&&active)for(let i=0;i<4;i++)sprite(ctx,assets.wind,clock+i*70,aim.x,aim.y-i*35,s.radius*1.35*(1-i*.17),100,Math.PI*(i%2),.6);
      if(['rain','avalanche'].includes(s.pattern)&&active)for(let i=0;i<(s.pattern==='rain'?12:7);i++){const q=((t-s.release+i*127)%700)/700,x=c.target.x+Math.sin(i*2.399)*s.radius*.7;sprite(ctx,assets.ice,clock,x+45*(1-q),c.target.y-400+q*400,s.pattern==='rain'?80:170,s.pattern==='rain'?40:110,Math.PI*.58,.85);}
      if(s.pattern==='crystal'&&active)sprite(ctx,assets['ice-impact'],Math.min(200,(t-s.release)/s.hold*300),c.target.x,c.target.y,s.radius*1.7,s.radius*1.3,0,.8);
    }
    if(!active||up)return;
    const dx=c.direction.x,dy=c.direction.y,angle=Math.atan2(dy,dx),end={x:c.origin.x+dx*s.radius,y:c.origin.y+dy*s.radius-65};
    if(['bolt','fireball','pierce'].includes(s.pattern)&&t<first) {
      const q=Math.min(1,(t-s.release)/(first-s.release)),kind=s.pattern==='bolt'?'arcane':s.pattern==='fireball'?'fire':'ice',size=s.pattern==='fireball'?130:s.pattern==='pierce'?155:65,goal=s.pattern==='pierce'?end:aim;
      sprite(ctx,assets[kind],clock,o.x+(goal.x-o.x)*q,o.y+(goal.y-o.y)*q,size,size*(s.pattern==='pierce'?.35:1),Math.atan2(goal.y-o.y,goal.x-o.x));
    }
    if(['fan','tempest'].includes(s.pattern)) {
      const q=Math.min(1,(t-s.release)/Math.max(1,first-s.release)),count=s.pattern==='fan'?3+Math.floor((s.rank-1)/2):7;
      for(let i=0;i<count;i++){const a=angle+(i/(count-1)-.5)*(s.pattern==='fan'?s.angle:.35),r=q*s.radius;sprite(ctx,assets.wind,clock+i*60,actor.x+Math.cos(a)*r,actor.y-65+Math.sin(a)*r,s.pattern==='fan'?140:260,s.pattern==='fan'?70:160,a,.85);}
    }
    if(['flame','beam','four'].includes(s.pattern)) {
      const size=s.pattern==='beam'?s.width*2.5:s.pattern==='four'?s.width*2:s.width*1.5;
      sprite(ctx,assets[s.pattern==='four'?'four':'fire'],clock,(o.x+end.x)/2,(o.y+end.y)/2,Math.hypot(end.x-o.x,end.y-o.y),size,angle,.9);
      if(s.pattern!=='flame')for(let i=0;i<3;i++)sprite(ctx,assets.circle,clock+i*90,o.x+dx*i*28,o.y+dy*i*28,45+i*15,90+i*30,0,.85);
      ImageEffects.link(ctx,o,end,s.pattern==='four'?'#ffffff':'#ffe6af',.65,s.pattern==='beam'?60:24,clock);
    }
  }
  function impacts(ctx,events,time,assets,reduced=false) {
    for(const e of events) {
      if(e.type!=='mage-impact')continue;const age=time-e.timeMs;if(age<0||age>650)continue;
      const fade=Math.min(1,(650-age)/200),color=COLORS[e.element],large=['meteor','cosmos','prison'].includes(e.pattern);
      if(e.pattern==='chain') {
        for(const target of e.targets){const from=e.index?{x:e.from.x,y:e.from.y-55}:{x:e.origin.x+e.facing*94,y:e.origin.y-86},to={x:target.x,y:target.y-55};ctx.save();ctx.globalAlpha=fade;line(ctx,from,to,'#9866f4',reduced?0:age,9);line(ctx,from,to,'#f9ecff',reduced?0:age,3);ctx.restore();sprite(ctx,assets.lightning,age,target.x,target.y,65,125,0,fade);}
      }else if(['lightning','storm','prison'].includes(e.pattern)) {
        const final=e.pattern==='prison'&&e.index===e.hits-1;
        for(const target of e.targets)sprite(ctx,assets.lightning,age,target.x,target.y,final?250:90,420,0,fade);
      }else if(e.pattern==='earth') {
        const r=(e.index+1)/e.hits*e.radius;sprite(ctx,assets.earth,age,e.origin.x+e.direction.x*r,e.origin.y+e.direction.y*r,170,230,0,fade);
      }else if(e.pattern==='pillars') {
        sprite(ctx,assets.fire,age,e.x,e.y-130,180,320,Math.PI/2,fade);sprite(ctx,assets['fire-impact'],age,e.x,e.y-30,e.radius,e.radius*.7,0,fade);
      }else if(['flame','beam','four'].includes(e.pattern)) {
        for(const target of e.targets)sprite(ctx,assets['fire-impact'],age,target.x,target.y-55,80,80,0,fade*.75);
      }else {
        const kind=e.kind==='ice'?'ice-impact':e.kind==='wind'?'wind-impact':e.kind==='arcane'?'arcane-impact':'fire-impact';
        const width=e.pattern==='bolt'?90:e.pattern==='pierce'?115:Math.min(1050,Math.max(170,e.radius*1.8));
        const directed=['pierce','fan','tempest'].includes(e.pattern),size=directed?e.pattern==='pierce'?115:160:width;
        for(const point of directed?e.targets:[{x:e.x,y:e.y}])sprite(ctx,assets[kind],age,point.x,point.y-(kind==='ice-impact'?0:45),size,size*(e.kind==='ice'?.8:.7),0,fade);
        if(e.pattern==='cosmos') {
          sprite(ctx,assets.cosmos,age,e.x,e.y-80,400+age*1.5,400+age,0,fade*.65);
          for(let i=0;i<4;i++)sprite(ctx,assets[['fire-impact','ice-impact','lightning','wind-impact'][i]],age,200+i*210,405,320,320,0,fade*.65);
        }
        if(['meteor','cosmos','frost-ring','avalanche'].includes(e.pattern))ring(ctx,assets,age,e.x,e.y,e.radius*(.35+age/500),color,fade*.6);
      }
      if(large&&age<180&&!reduced)ImageEffects.screen(ctx,e.pattern==='cosmos'?'#f8f4ff':color,(1-age/180)*(e.pattern==='cosmos'?.55:.2),age);
      if(!reduced)ImageEffects.burst(ctx,e.x,e.y-45,age,large?36:10,color,1,fade);
    }
  }
  return {load,castOverlay,impacts,sprite,COLORS};
})();
