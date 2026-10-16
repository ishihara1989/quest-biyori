'use strict';
window.GoddessRenderer=(()=>{
  let backgroundImage, reflectionCanvas;
  async function load(){await ImageEffects.load();backgroundImage=new Image();backgroundImage.src='/assets/stages/extradimensional-goddess/background.png';await backgroundImage.decode();}
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  function background(ctx,run,time,reduced){ctx.drawImage(backgroundImage,0,0,1024,576);const floor=ctx.createLinearGradient(0,315,0,520);floor.addColorStop(0,'#15152d05');floor.addColorStop(1,'#15152d69');ctx.fillStyle=floor;ctx.fillRect(0,315,1024,220);
    const e=run.enemies.find(e=>e.goddess),awaken=e?.goddessPhase===2||e?.phaseChangeAt!=null;
    ImageEffects.ring(ctx,reduced?0:time,597,67,116,116,awaken?'#e7c87e':'#82cdea',awaken?.55:.22);
    if(!reduced)for(let i=0;i<18;i++){const x=(i*83+Math.sin(time/4200+i)*14)%1024,y=50+i%5*48+Math.cos(time/3100+i)*9;ImageEffects.mote(ctx,x,y,10,i%2?'#b1e5ff':'#ffe2a8',.6,time+i*53);}
  }
  function draw(ctx,e,run,assets,paint,reduced){const a=assets[e.type],now=run.time,p=e.goddessPlan;if(e.hp<=0&&now-e.departedAt>=2100)return;ctx.save();if(e.hp<=0)ctx.globalAlpha=clamp((1850-(now-e.departedAt))/350);ctx.fillStyle='#16113666';ctx.beginPath();ctx.ellipse(e.x,e.y,74,12,0,0,Math.PI*2);ctx.fill();ctx.restore();
    const sprite=(id,t=0,dy=0,alpha=1,scale=1)=>paint(a[id],t,e.x,e.y+dy,scale,false,alpha);
    const halo=(alpha=1)=>{ctx.save();ctx.translate(e.x,e.y-133);if(!reduced)ctx.rotate(Math.sin(now/6000)*.05);paint(a.halo,0,0,0,1,false,alpha*.72);ctx.restore();};
    if(e.hp<=0){const age=now-e.departedAt;const seated=e.departurePhase===1&&age<350;
      if(e.departurePhase===1&&age<450)sprite('throne',0,0,1-age/450);
      if(age<1850){const fade=clamp((1850-age)/350);if(seated){sprite('idle',0,-age*.045,clamp((350-age)/250));}else{const clock=Math.max(0,age-(e.departurePhase===1?300:0)),retreat=clamp((clock-1020)/650);sprite('down',clock,-14-retreat*22,fade*(e.departurePhase===1?clamp((age-350)/180):1),1-retreat*.12);}}
      const doorFade=clamp((2100-age)/100);paint(a.return,age,e.x,e.y-133,1,false,doorFade);return;
    }
    if(e.phaseChangeAt!=null){const q=clamp((now-e.phaseChangeAt)/2400);halo(q);sprite('throne',0,0,1-q);if(q<.5)sprite('idle',0,-q*20,1-q*2);else sprite('floating',0,(1-q)*24,(q-.5)*2);ImageEffects.ring(ctx,reduced?0:now,e.x,e.y-105,40+q*110,100+q*25,'#fff1bb',Math.sin(q*Math.PI));return;}
    halo();if(e.goddessPhase===1)sprite('throne');const dy=e.goddessPhase===2?-14+(!reduced?Math.sin(now/1050)*3:0):0;let id=e.goddessPhase===2?'floating':'idle',clock=now;
    if(p?.kind==='star'){id='shot';clock=p.elapsed;}
    else if(p?.kind==='phantom'){id=p.elapsed<700?'snap':'idle';clock=p.elapsed;}
    else if(p?.kind==='meteor'){id='cast';clock=p.elapsed/1500*a.cast.data.durationMs;}
    else if(p){id=p.kind==='zero'?'ultimate':'cast';const data=a[id].data,prep=p.kind==='zero'?data.frames.slice(0,6).reduce((n,f)=>n+f.durationMs,0):500;clock=p.elapsed<p.warn?prep*clamp(p.elapsed/p.warn,0,.999):prep+(data.durationMs-prep)*clamp((p.elapsed-p.warn)/650);}
    if(e.breakAt!=null){id='cast';clock=a.cast.data.durationMs-300+clamp((now-e.breakAt)/700)*299;}
    const alpha=e.flash>0&&Math.floor(e.flash/45)%2?.65:1;sprite(id,clock,dy,alpha);
  }
  function shape(ctx,s,color='#bceeff',fill=false){ctx.strokeStyle=color;ctx.fillStyle=color+'22';ctx.lineWidth=3;ctx.beginPath();
    if(s.kind==='lane'){const dx=s.to.x-s.from.x,dy=s.to.y-s.from.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*s.width,ny=dx/len*s.width;ctx.moveTo(s.from.x+nx,s.from.y+ny);ctx.lineTo(s.to.x+nx,s.to.y+ny);ctx.lineTo(s.to.x-nx,s.to.y-ny);ctx.lineTo(s.from.x-nx,s.from.y-ny);ctx.closePath();}
    else if(s.kind==='sector'){ctx.moveTo(s.center.x,s.center.y);ctx.arc(s.center.x,s.center.y,s.radius,s.direction-s.angle/2,s.direction+s.angle/2);ctx.closePath();}
    else{ctx.arc(s.center.x,s.center.y,s.radius,0,Math.PI*2);if(s.innerRadius){ctx.moveTo(s.center.x+s.innerRadius,s.center.y);ctx.arc(s.center.x,s.center.y,s.innerRadius,0,Math.PI*2,true);}}
    if(fill)ctx.fill('evenodd');ctx.stroke();
  }
  function warnings(ctx,run){const e=run.enemies.find(e=>e.goddess&&e.hp>0),p=e?.goddessPlan;if(!p)return;ctx.save();ctx.beginPath();ctx.rect(82,324,860,183);ctx.clip();ctx.setLineDash([6,5]);if(p.kind==='phantom'&&p.elapsed<p.times.at(-1))for(const s of p.shapes)shape(ctx,s,'#d0b3ff',true);ctx.restore();}
  function reflection(ctx,source,clock,box,scale,alpha){
    reflectionCanvas ||= new OffscreenCanvas(256,320);
    const paint=reflectionCanvas.getContext('2d'),d=source.data,f=d.frames[MotionPlayback.frameAt(d,Math.min(Math.max(0,clock),d.durationMs-.001))];
    paint.clearRect(0,0,256,320);paint.imageSmoothingEnabled=false;
    paint.drawImage(source.image,f.x,f.y,f.width,f.height,128-(box.left+box.right)/2*scale,160-(box.top+box.bottom)/2*scale,f.width*scale,f.height*scale);
    paint.globalCompositeOperation='destination-in';ImageEffects.mask(paint,128,160,194,240);paint.globalCompositeOperation='source-over';
    ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(reflectionCanvas,-128,-160);ctx.restore();
  }
  function overlays(ctx,run,sprites,effects,paint,reduced){const e=run.enemies.find(e=>e.goddess);if(!e||e.hp<=0)return;const a=sprites[e.type],g=run.goddess,p=g.phantom;
    if(p){const start=600,last=p.times.at(-1),age=p.elapsed,q=clamp(age/start),fade=age>last?clamp(1-(age-last)/250):1;ctx.save();ctx.translate(p.origin.x,p.origin.y-130);ctx.scale(q,1);
      ImageEffects.sprite(ctx,'portal',reduced?0:age,0,0,238,310,null,fade*.85);
      if(p.row.major)ImageEffects.ring(ctx,reduced?0:age,0,0,122,158,'#ffe6a0',fade*.75);
      const source=sprites[p.row.id]?.[p.row.motion];if(source&&age>=start){const strike=source.data.events?.[0]?.timeMs??p.row.release;let clock=age<1200?strike*clamp((age-start)/600,0,.999):strike+(source.data.durationMs-strike)*clamp((age-1200)/Math.max(1,last-1200+100));if(p.row.id==='cave-troll'&&age>=1200){const lastHit=[...p.times].reverse().find(t=>t<=age),since=age-lastHit;clock=since<150?strike+(source.data.durationMs-strike)*since/150:strike*clamp((since-150)/300);}
        const bounds=source.data.frames.map(f=>f.visibleBounds||f.bounds||{left:0,top:0,right:f.width,bottom:f.height}),box={left:Math.min(...bounds.map(b=>b.left??b.x??0)),right:Math.max(...bounds.map(b=>b.right??(b.x||0)+b.width)),top:Math.min(...bounds.map(b=>b.top??b.y??0)),bottom:Math.max(...bounds.map(b=>b.bottom??(b.y||0)+b.height))},scale=Math.min(185/(box.right-box.left),224/(box.bottom-box.top));reflection(ctx,source,clock,box,scale,fade*.88);}ctx.restore();
      ctx.save();ctx.textAlign='center';ctx.font='bold 12px sans-serif';ctx.fillStyle='#f9e9bf';ctx.fillText('✧ '+p.row.name,p.origin.x,p.origin.y+22);ctx.restore();}
    for(const b of g.projectiles){const target=[run.hero,...run.allies].find(v=>v.id===b.targetId);if(!target)continue;
      if(!reduced){ImageEffects.link(ctx,{x:b.x+64,y:b.y-70},{x:b.x+26,y:b.y-34},'#ffe5a2',.5,18,b.age);ImageEffects.link(ctx,{x:b.x+26,y:b.y-34},{x:b.x,y:b.y},'#c8f7ff',.8,22,b.age);}
      if(b.kind==='meteor')paint(a['homing-meteor'],b.age,b.x,b.y,.7);else ImageEffects.sprite(ctx,'mote',reduced?0:b.age,b.x,b.y,24,34,'#c8f7ff',1);
    }
    const plan=e.goddessPlan,targets=plan?.kind==='meteor'?plan.targets:[];for(const id of new Set([...targets,...g.projectiles.filter(b=>b.kind==='meteor').map(b=>b.targetId)])){const t=[run.hero,...run.allies].find(v=>v.id===id&&v.hp>0);if(!t)continue;const x=t.x,y=t.y-t.height-18;ctx.save();ctx.strokeStyle='#ffe4a0';ctx.fillStyle='#c7f8ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-9);ctx.lineTo(x+8,y);ctx.lineTo(x,y+9);ctx.lineTo(x-8,y);ctx.closePath();ctx.stroke();ctx.restore();}
    if(plan?.kind==='zero'&&plan.elapsed<plan.warn){const q=clamp(plan.elapsed/plan.warn);ImageEffects.glow(ctx,e.x,e.y-265,16+q*38,'#a5efff',.4+q*.5,reduced?0:plan.elapsed);}
  }
  function effect(ctx,event,age,sprites,effects,paint,reduced){const a=sprites['extradimensional-goddess'],q=clamp(age/850);if(q>=1)return;const alpha=1-q;
    if(['star-impact','meteor-impact','snap'].includes(event.kind)){const id=event.kind==='snap'?'snap-glint':event.kind;paint(a[id],age,event.x,event.y,1,false,alpha);return;}
    ctx.save();ctx.globalAlpha=alpha;
    if(event.kind==='awaken')for(let i=0;i<3;i++)ImageEffects.ring(ctx,reduced?0:age,event.x,event.y,30+q*150+i*15,10+q*35,'#fff0ad',1);
    for(const s of event.shapes||[]){
      const color=event.kind==='phantom-hit'?'#d5b5ff':'#a4f1ff',clock=reduced?0:age;
      if(s.kind==='lane')ImageEffects.link(ctx,s.from,s.to,color,.7,Math.max(18,s.width*2),clock);
      else if(s.kind==='sector')ImageEffects.arc(ctx,clock,s.center.x,s.center.y,s.radius,s.radius,s.direction-s.angle/2,s.direction+s.angle/2,color,.7,28);
      else {ImageEffects.ring(ctx,clock,s.center.x,s.center.y,s.radius,s.radius,color,.7);if(s.innerRadius)ImageEffects.ring(ctx,clock,s.center.x,s.center.y,s.innerRadius,s.innerRadius,color,.6);}
      if(s.kind==='lane'&&event.kind==='phantom-hit'&&event.effect&&effects[event.effect]){VolcanoRenderer.effect(ctx,{effect:event.effect,shape:s,x:s.from.x,y:s.from.y-50,visualEnd:{x:s.to.x,y:s.to.y-50}},age,effects,paint);}
      else if(s.kind==='lane'){const x=(s.from.x+s.to.x)/2,y=(s.from.y+s.to.y)/2;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(s.to.y-s.from.y,s.to.x-s.from.x));paint(a['rift-cut'],age,0,0,2.3,false,alpha);ctx.restore();}
      else if(event.kind==='rings'){ctx.save();ctx.translate(s.center.x,s.center.y);ctx.scale(s.radius/135,s.radius/135);paint(a['celestial-wave'],Math.min(age,200),0,0,1,false,alpha);ctx.restore();}
      else if(event.kind==='zero'){ImageEffects.link(ctx,{x:s.center.x,y:65},s.center,'#e1f9ff',1,Math.max(8,64*(1-q)),clock);paint(a['meteor-impact'],age,s.center.x,s.center.y,1.6,false,alpha);}
      else if(event.effect&&effects[event.effect])paint(effects[event.effect],age,s.center?.x??event.x,s.center?.y??event.y,.65,false,alpha);
    }
    ctx.restore();
  }
  return{load,background,draw,warnings,overlays,effect};
})();
