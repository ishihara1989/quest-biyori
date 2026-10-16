'use strict';
window.NinjaSkillRenderer=(()=>{
  const KINDS=['fuma','flash','smoke-in','smoke-out','caltrop-scatter','shadow-pin','seal','thread','lightning','haze','prison','final-ring',
    'shadow-slash','blade-vortex','thunder-bloom','shadow-eruption','clone-sigil','thousand-bloom'];
  const LEVELS=Object.fromEntries(NinjaSkills.ACTIVE.map(s=>[s.id,s.unlockLevel]));
  const tintedFrames = new Map(), imageIds = new WeakMap();
  let imageSerial = 0, tintedBytes = 0;
  const TINT_BUDGET = 24 * 1024 * 1024;
  function cachedFrame(asset, frame, filter, shadow, alpha = 1) {
    if (!imageIds.has(asset.image)) imageIds.set(asset.image, ++imageSerial);
    const key = [imageIds.get(asset.image), frame.x, frame.y, frame.width, frame.height, filter, shadow.blur, shadow.color, shadow.x, shadow.y, alpha].join(':');
    if (tintedFrames.has(key)) {
      const cached = tintedFrames.get(key); tintedFrames.delete(key); tintedFrames.set(key, cached); return cached;
    }
    const padding = Math.ceil(shadow.blur * 3 + Math.max(Math.abs(shadow.x), Math.abs(shadow.y)));
    const image = new OffscreenCanvas(frame.width + padding * 2, frame.height + padding * 2), paint = image.getContext('2d');
    paint.imageSmoothingEnabled = false; paint.filter = filter;
    paint.globalAlpha = alpha;
    paint.shadowBlur = shadow.blur; paint.shadowColor = shadow.color; paint.shadowOffsetX = shadow.x; paint.shadowOffsetY = shadow.y;
    paint.drawImage(asset.image, frame.x, frame.y, frame.width, frame.height, padding, padding, frame.width, frame.height);
    const cached = { image, padding, bytes: image.width * image.height * 4 };
    while (tintedFrames.size && tintedBytes + cached.bytes > TINT_BUDGET) {
      const first = tintedFrames.keys().next().value; tintedBytes -= tintedFrames.get(first).bytes; tintedFrames.delete(first);
    }
    if (cached.bytes <= TINT_BUDGET) { tintedFrames.set(key, cached); tintedBytes += cached.bytes; }
    return cached;
  }
  const loadImage=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(url));im.src=url;});
  async function load(){await ImageEffects.load();const fx=Object.fromEntries(await Promise.all(KINDS.map(async id=>{const base='assets/skills/ninja/effects/'+id+'/',r=await fetch(base+'manifest.json');if(!r.ok)throw Error(base);const data=await r.json();return [id,{data,image:await loadImage(base+data.sheet)}];})));
    fx.star=await loadImage('assets/ninja/motions/attack-shuriken/shuriken-projectile.png');
    fx.status=Object.fromEntries(await Promise.all(['blind','slow','root','seal','stop'].map(async id=>[id,await loadImage('assets/skills/ninja/status/'+id+'.png')])));return fx;}
  function sprite(ctx,a,time,x,y,w,h=w,alpha=1,angle=0){if(!a||alpha<=0)return;const d=a.data,t=d.loop?Math.max(0,time)%d.durationMs:Math.min(Math.max(0,time),d.durationMs-.01),f=d.frames[MotionPlayback.frameAt(d,t)];ctx.save();ctx.globalAlpha*=alpha;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.drawImage(a.image,f.x,f.y,f.width,f.height,-w*d.pivot.x/d.frameWidth,-h*d.pivot.y/d.frameHeight,w,h);ctx.restore();}
  function light(ctx,x,y,r,color,alpha){ImageEffects.glow(ctx,x,y,r,color,alpha);}
  function ring(ctx,fx,t,x,y,r,alpha=.7,angle=0){sprite(ctx,fx['blade-vortex'],t,x,y,r*2,r*.68,alpha,angle);}
  // Stable particles and trajectories can be scrubbed in the skill lab.
  function sparks(ctx,x,y,age,count,color,spread=1,alpha=1){ImageEffects.burst(ctx,x,y,age,count,color,spread,alpha);}
  function castAura(ctx,actor,run,fx,reduced=false){const c=actor.ninjaCast;if(!c||c.spec.unlockLevel<50)return;const s=c.spec,t=reduced?180:c.elapsed*s.speed,q=Math.min(1,c.elapsed/Math.max(1,s.release));
    sprite(ctx,fx['clone-sigil'],Math.min(270,t),actor.x,actor.y,100+q*65,35+q*22,.3+q*.3);
    if(['ultimate','prison'].includes(s.pattern)){
      const r=s.radius*(.55+.25*q),alpha=.16+q*.27;
      ring(ctx,fx,t,c.target.x,c.target.y,r,alpha);
      if(s.pattern==='ultimate'){
        if(!reduced)ImageEffects.screen(ctx,'#130b2b',.12*q,t);
        ring(ctx,fx,t+170,c.target.x,c.target.y,r*.72,alpha*.75);
        if(!reduced)for(let i=0;i<24;i++){const a=i*2.399+t/1700,d=r*(1-((t+i*47)%1000)/1000);ImageEffects.mote(ctx,c.target.x+Math.cos(a)*d,c.target.y-65+Math.sin(a)*d*.38-((t+i*71)%170),11,'#c6a8ff',.7,t+i*47);}
      }
    }
  }
  function ghosts(ctx,actor,run,drawActor){const c=actor.ninjaCast;if(!c?.dashFrom||!c.position)return;const age=run.time-c.dashAt;if(age<0||age>180)return;
    for(let i=3;i>0;i--){const q=1-i/4;ctx.save();ctx.filter='hue-rotate(225deg) saturate(1.4)';ctx.globalCompositeOperation='screen';drawActor({...actor,x:c.dashFrom.x+(c.position.x-c.dashFrom.x)*q,y:c.dashFrom.y+(c.position.y-c.dashFrom.y)*q,motion:'low-dash',motionTime:300,ninjaCast:{},flash:0},.22*(1-age/180)*(1-i/5));ctx.restore();}
  }
  function fields(ctx,run,fx,reduced=false){
    for(const n of run.ninjaClones||[])if(n.ultimate||LEVELS[n.skillId]>=80)ring(ctx,fx,reduced?180:run.time-n.start,n.x,n.y,n.substitute?47:36,.45);
    for(const f of run.ninjaFields||[]){const s=f.spec,age=run.time-f.start,fade=Math.min(1,age/140,(f.until-run.time)/250),t=reduced?180:age;
    if(s.pattern==='caltrop'){
      for(let i=0;i<7;i++){const a=i*2.399,r=(i%3+1)*s.radius/4;sprite(ctx,fx['caltrop-scatter'],539,f.center.x+Math.cos(a)*r,f.center.y+Math.sin(a)*r*.28,45,22,.88*fade);}
      ImageEffects.ring(ctx,t,f.center.x,f.center.y,s.radius,s.radius*.3,'#ec7365',.3*fade);
    }else if(s.pattern==='thread'){
      sprite(ctx,fx.thread,220,f.center.x,f.center.y,s.radius*1.85,s.radius*.7,.8*fade);
      sprite(ctx,fx['clone-sigil'],260,f.center.x,f.center.y,s.radius*1.55,s.radius*.5,.25*fade);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;light(ctx,f.center.x+Math.cos(a)*s.radius*.78,f.center.y+Math.sin(a)*s.radius*.25,24,'#c09dff',.45*fade);}
    }else if(s.pattern==='haze'){
      ring(ctx,fx,t,f.center.x,f.center.y,s.radius,.28*fade);
      for(let i=0;i<3;i++)sprite(ctx,fx.haze,t+i*160,f.center.x+(i-1)*s.radius*.34,f.center.y-28-i*24,s.radius*1.35,s.radius*.38,(.3-i*.045)*fade);
      if(!reduced)for(let i=0;i<22;i++){const a=i*2.399;ImageEffects.mote(ctx,f.center.x+Math.cos(a)*s.radius*.85,f.center.y-((age/6+i*17)%120)+Math.sin(a)*s.radius*.25,10,'#b5a2ff',.55*fade,t+i*47);}
    }else if(s.pattern==='prison'){
      sprite(ctx,fx.prison,t,f.center.x,f.center.y,s.radius*2,s.radius*.8,.55*fade);
      ring(ctx,fx,t,f.center.x,f.center.y,s.radius,.7*fade);
      for(let i=0;i<6;i++){const a=i*Math.PI/3,x=f.center.x+Math.cos(a)*s.radius*.86,y=f.center.y+Math.sin(a)*s.radius*.3;
        sprite(ctx,fx['shadow-eruption'],reduced?180:(age+i*190)%1500,x,y,95,155,.32*fade);}
    }else if(s.pattern==='orbit'){
      ring(ctx,fx,t,f.center.x,f.center.y,s.radius,.65*fade);
      ring(ctx,fx,t+190,f.center.x,f.center.y-50,s.radius*.78,.35*fade);
      for(let i=0;i<s.blades;i++){const a=i*Math.PI*2/s.blades+(reduced?0:age/150),r=s.radius*.78;
        if(!reduced)for(let j=3;j>0;j--){const b=a-j*.22;sprite(ctx,fx.fuma,t-j*30,f.center.x+Math.cos(b)*r,f.center.y-25+Math.sin(b)*r*.32,96,96,fade*(.27-j*.06));}
        const x=f.center.x+Math.cos(a)*r,y=f.center.y-25+Math.sin(a)*r*.32;light(ctx,x,y,58,'#ff7b80',.6*fade);sprite(ctx,fx.fuma,t,x,y,100,100,fade);
      }
    }
  }}
  function drawClone(ctx,n,drawActor){ctx.save();ctx.filter='saturate(.45) hue-rotate(225deg)';ctx.shadowColor=n.substitute?'#ffe5a2':'#a392ff';ctx.shadowBlur=n.substitute?9:5;
    drawActor({...n,id:n.id,type:'ninja',hp:1,maxHp:1,flash:0,scale:1,time:n.motionTime,z:0,ninjaCast:{},hidden:false},n.ultimate?.9:.65);ctx.restore();}
  function echoPoses(ctx,run,drawActor){const seen=new Set();for(const p of [...run.ninjaEchoQueue,...run.ninjaProjectiles]){
    if(!p.echo||run.time<p.at||run.time-p.at>180)continue;const key=p.actionId+':'+p.origin.x+':'+p.origin.y;if(seen.has(key))continue;seen.add(key);
    ctx.save();ctx.filter='saturate(.25) hue-rotate(210deg)';drawActor({...p.source,x:p.origin.x-p.echoFacing*94,y:p.origin.y,facing:p.echoFacing,motion:p.echoMotion,motionTime:p.echoMotionTime,time:p.echoMotionTime,ninjaCast:{},flash:0,rootAnchor:null,poison:null,webUntil:0,blindUntil:0,bubbleUntil:0,airUntil:0,z:Math.max(0,p.visualHeight-88)},.22);ctx.restore();
  }}
  function projectiles(ctx,run,fx,reduced=false){for(const p of run.ninjaProjectiles||[]){const q=Math.min(1,(p.returning?p.reach-p.travel:p.travel)/Math.max(1,p.aimDistance||p.reach));
    const y=p.y-(p.visualHeight+(p.targetHeight-p.visualHeight)*q),shadow=p.secondary||p.kind==='shadow-star',level=LEVELS[p.skillId]||1;
    const heightSlope=(p.targetHeight-p.visualHeight)/Math.max(1,p.aimDistance||p.reach),vy=p.dy+(p.returning?heightSlope:-heightSlope),angle=Math.atan2(vy,p.dx),color=p.finisher?'#ffe8ad':shadow?'#b29cff':p.kind==='needle'?'#dbb5ff':'#ff7779';
    ctx.save();ctx.globalAlpha=shadow?.65:p.returning?.65:1;
    const trail=Math.min(p.travel,p.kind==='fuma'?160:level>=90?115:level>=60||shadow?85:35),direction=1;
    if(!reduced){
      ImageEffects.link(ctx,{x:p.x-p.dx*trail*direction,y:y-vy*trail*direction},{x:p.x,y},color,.8,p.kind==='fuma'?48:level>=60?26:14,p.age);
      if(p.kind==='fuma')for(let i=3;i>0;i--)sprite(ctx,fx.fuma,run.time-i*40,p.x-p.dx*i*25*direction,y-vy*i*25*direction,92,92,.15/i);
      light(ctx,p.x,y,p.kind==='fuma'?68:level>=90?40:25,color,p.kind==='fuma'?.75:.48);
      if(level>=60||shadow)for(let i=0;i<4;i++){const d=(i+1)*trail/5,side=Math.sin(i*5+Math.floor(p.age/45))*7;ImageEffects.mote(ctx,p.x-p.dx*d*direction-p.dy*side,y-vy*d*direction+p.dx*side,11,color,.7-i*.13,p.age+i*79);}
    }
    if(p.kind==='fuma'){sprite(ctx,fx['blade-vortex'],run.time,p.x,y,p.finisher?170:125,p.finisher?170:125,.65);sprite(ctx,fx.fuma,run.time,p.x,y,p.finisher?118:92);}
    else if(p.kind==='tag')sprite(ctx,fx.seal,0,p.x,y,30,42,1,angle+.25);
    else if(p.kind==='needle'){sprite(ctx,fx['shadow-slash'],0,p.x,y,70,22,.65,angle+.6);sprite(ctx,fx.lightning,0,p.x,y,44,22,1,angle);}
    else {const size=level>=90?34:shadow?28:26;ctx.translate(Math.round(p.x),Math.round(y));ctx.rotate(reduced?0:p.age/45);if(shadow)ctx.filter='hue-rotate(225deg) saturate(1.6)';ctx.drawImage(fx.star,-size/2,-size/2,size,size);}
    ctx.restore();
  }}
  // The largest silhouettes sit behind actors so the burst never hides the party.
  function backdrops(ctx,events,time,fx,reduced=false){for(const e of events){if(e.type!=='ninja-effect')continue;const age=time-e.timeMs,t=reduced?180:age;
    if(e.kind==='final-ring'&&age>=0&&age<900){const fade=Math.min(1,(900-age)/260),w=Math.min(720,e.radius*1.9),h=Math.min(520,w*.8),y=Math.max(h/2+12,Math.min(564-h/2,e.y-135)),r=Math.min(430,e.radius*1.06)*(reduced?1:1+age/1800);ring(ctx,fx,t,e.x,e.y,r,fade*.9);sprite(ctx,fx['thousand-bloom'],t,e.x,y,w,h,fade*.9);}
    if(e.kind==='prison'&&e.phase==='pulse'&&age>=0&&age<750){const fade=Math.min(1,(750-age)/220),r=e.radius||250;for(let i=0;i<3;i++)sprite(ctx,fx['shadow-eruption'],t,e.x+(i-1)*r*.6,e.y+(i%2?12:-15),i===1?235:185,i===1?290:250,fade*(i===1?.85:1));}
  }}
  function impacts(ctx,events,time,fx,reduced=false){const seen=new Set();for(const e of events){if(e.type!=='ninja-effect')continue;const age=time-e.timeMs,level=LEVELS[e.skillId]||1,life=e.kind==='final-ring'?900:e.kind==='prison'?750:600;if(age<0||age>=life)continue;
    const key=[e.actionId||e.skillId,e.kind,e.phase,e.index,Math.round(e.x/24),Math.round(e.y/24),Math.floor(e.timeMs/50)].join(':');if(seen.has(key))continue;seen.add(key);
    const fade=Math.min(1,(life-age)/200),t=reduced?180:age;
    if(e.kind==='shadow-dash'){
      const dx=e.x-e.from.x,dy=e.y-e.from.y,len=Math.hypot(dx,dy);if(len>8){ctx.save();ctx.globalCompositeOperation='screen';sprite(ctx,fx['shadow-slash'],t,(e.x+e.from.x)/2,(e.y+e.from.y)/2-72,len+90,level>=90?100:70,fade*.8,Math.atan2(dy,dx)+Math.PI/4);ctx.restore();}continue;
    }
    if(e.kind==='final-ring'){
      const width=Math.min(860,e.radius*2.2);
      if(!reduced){
        light(ctx,e.x,e.y-110,350,'#ffb45e',fade*.35);
        for(let i=0;i<6;i++){const a=i*Math.PI/3,d=width*.26;sprite(ctx,fx['shadow-slash'],Math.max(0,age-90),e.x+Math.cos(a)*d,e.y-95+Math.sin(a)*d*.5,190,120,fade*.35,a);}
        sparks(ctx,e.x,e.y-100,age,54,'#ffe9b1',1.5,fade);sparks(ctx,e.x,e.y-100,age,30,'#c1a0ff',1.2,fade);
        if(age<120)ImageEffects.screen(ctx,'#fff1c4',(1-age/120)*.22,age);
      }continue;
    }
    if(e.kind==='prison'){
      const r=e.radius||250;ring(ctx,fx,t,e.x,e.y,r,fade*.85);
      if(e.phase!=='open'){
        if(!reduced){sparks(ctx,e.x,e.y-90,age,28,'#bc9bff',1.2,fade);light(ctx,e.x,e.y-80,220,'#b379ff',.5*fade);}
      }continue;
    }
    if(e.kind==='blade-vortex'){
      const r=e.radius||230;ring(ctx,fx,t,e.x,e.y,r*(1+Math.min(age,400)/2000),fade*(e.phase==='open'?.9:.45));
      if(!reduced)sparks(ctx,e.x,e.y-25,age,20,'#ffac90',1.1,fade);continue;
    }
    if(e.kind==='lightning'){
      sprite(ctx,fx['thunder-bloom'],t,e.x,e.y,165,165,fade);
      if(!reduced){light(ctx,e.x,e.y,105,'#d6a4ff',.6*fade);sparks(ctx,e.x,e.y,age,18,'#e8caff',.8,fade);}continue;
    }
    if(e.kind==='smoke-in'&&level>=50){
      sprite(ctx,fx['clone-sigil'],t,e.x,e.y-40,level>=90?185:145,level>=90?185:145,.85*fade);
      sprite(ctx,fx['smoke-in'],t,e.x,e.y-28,125,100,.65*fade);
      if(!reduced)sparks(ctx,e.x,e.y-40,age,level>=90?18:12,'#bfa6ff',.75,fade);continue;
    }
    if(e.kind==='spark'||e.kind==='flash'&&!e.radius){
      const fuma=e.kind==='flash',late=level>=60||e.shadow,size=e.finisher?210:fuma?160:level>=90?155:late?120:65;
      sprite(ctx,fx[late||fuma?'shadow-slash':'flash'],t,e.x,e.y,size,size,fade,e.shadow?Math.PI/2:0);
      if(late||fuma){sprite(ctx,fx.flash,t,e.x,e.y,size*.55,size*.55,.8*fade);if(!reduced){light(ctx,e.x,e.y,size*.55,e.shadow?'#a593ff':e.finisher?'#ffe4a0':'#ff8b84',.5*fade);sparks(ctx,e.x,e.y,age,level>=90?16:10,e.shadow?'#c6b0ff':'#ffd8b1',.75,fade);}}
      continue;
    }
    const id=e.kind.startsWith('thread-')?'thread':e.kind,size=e.radius?Math.min(670,e.radius*1.85):130,ground=['thread-coil','thread-stretch','caltrop-scatter'].includes(e.kind);
    sprite(ctx,fx[id]||fx.flash,t,e.x,e.y-(e.kind.startsWith('smoke')?35:e.kind==='haze'?30:0),size,ground?size*.38:e.kind==='haze'?size*.55:size,fade*(e.kind.startsWith('smoke')?.66:.9));
    if(e.kind.startsWith('thread-')){ring(ctx,fx,t,e.x,e.y,(e.radius||180)*.85,.38*fade);if(!reduced)sparks(ctx,e.x,e.y-10,age,16,'#c6adff',1,fade);}
  }}
  function overlay(ctx,actor,run,fx,reduced=false){const c=actor.ninjaCast;
    if(c&&['flash','haze'].includes(c.spec.pattern)){const raw=c.elapsed*c.spec.speed;if(raw>=240&&raw<440){const q=(raw-240)/200,x=c.origin.x+(c.target.x-c.origin.x)*q,y=c.origin.y+(c.target.y-c.origin.y)*q-70-Math.sin(q*Math.PI)*100;sprite(ctx,fx.flash,0,x,y,20,20,.9);}}
    if(c&&c.spec.pattern==='ultimate'){
      const raw=c.elapsed*c.spec.speed,target=c.target;
      if(raw>=960&&raw<3000){const finalCharge=Math.max(0,(raw-2480)/520),w=150+finalCharge*230;
        sprite(ctx,fx['blade-vortex'],reduced?180:raw,target.x,target.y-100,w,w,.18+finalCharge*.45);
        if(finalCharge>0){light(ctx,target.x,target.y-100,110+finalCharge*100,'#ffdba0',.5*finalCharge);sprite(ctx,fx['thousand-bloom'],0,target.x,target.y-100,w*.7,w*.7,.6*finalCharge);}
      }
    }
    const owned=(run.ninjaClones||[]).filter(n=>n.source===actor&&n.until>run.time),echo=actor.ninjaEcho;
    if(owned.length){ctx.save();ctx.fillStyle='#b4a4ff';for(let i=0;i<owned.length;i++)ctx.fillRect(actor.x-18+i*6,actor.y+8,4,4);ctx.strokeStyle='#b4a4ff';ctx.lineWidth=2;const n=owned[0],q=n.ultimate?1:Math.max(0,(n.until-run.time)/(n.until-n.start));ctx.beginPath();ctx.arc(actor.x,actor.y+11,27,-Math.PI/2,-Math.PI/2+Math.PI*2*q);ctx.stroke();ctx.restore();}
    if(echo){for(let i=0;i<echo.remaining;i++)sprite(ctx,fx['shadow-pin'],0,actor.x-32-i*5,actor.y-90-i*8,18,18,.7);}
  }
  function statuses(ctx,run,fx,regions=[]){for(const e of run.enemies.filter(e=>e.hp>0&&!e.bodyPart)){const states=[];
    if(e.ninjaBlindUntil>run.time)states.push(['blind','命中低下 '+Math.round(e.ninjaBlindChance*100)+'% · 目眩まし '+((e.ninjaBlindUntil-run.time)/1000).toFixed(1)+'秒']);
    if(e.ninjaSlowUntil>run.time)states.push(['slow','移動速度 −'+Math.round(e.ninjaSlow*100)+'% · '+((e.ninjaSlowUntil-run.time)/1000).toFixed(1)+'秒']);
    if(e.controlUntil>run.time)states.push([e.controlKind,({root:'移動停止',seal:'技封じ',stop:'行動停止'}[e.controlKind])+' '+((e.controlUntil-run.time)/1000).toFixed(1)+'秒']);
    if(e.controlKind==='root'&&e.controlUntil>run.time)sprite(ctx,fx['shadow-pin'],350,e.x,e.y,70,30,.8);
    if(e.controlImmuneUntil>run.time)states.push(['stop','制限耐性 '+((e.controlImmuneUntil-run.time)/1000).toFixed(1)+'秒',.35]);
    for(const [i,[id,label,alpha=1]] of states.entries()){const x=e.x-(states.length-1)*11+i*22,y=e.y-(e.height||142)-24;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(fx.status[id],x-9,y-9,18,18);ctx.restore();regions.push({x:x-10,y:y-10,w:20,h:20,label});}
  }return regions;}
  return {KINDS,load,sprite,castAura,ghosts,fields,drawClone,echoPoses,projectiles,backdrops,impacts,overlay,statuses,cachedFrame,cacheStats:()=>({entries:tintedFrames.size,bytes:tintedBytes,budget:TINT_BUDGET})};
})();
