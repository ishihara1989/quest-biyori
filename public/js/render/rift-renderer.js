'use strict';
window.RiftRenderer = (() => {
  const images = new Map();
  const TAU = Math.PI * 2, clamp = n => Math.max(0, Math.min(1,n));
  const loadImage = src => new Promise((resolve,reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(src)); img.src = src; });
  async function load() { if(images.has(SpecialStages.ID)&&images.has(SpecialStages.CHAOS.ID))return;await ImageEffects.load();await Promise.all([SpecialStages, SpecialStages.CHAOS].map(async config => {
    const [gate, background] = await Promise.all(['gate.png','background.png'].map(file => loadImage(config.ASSET + file)));
    images.set(config.ID, {gate, background});
  })); }
  function background(ctx,time,reduced,specialId=SpecialStages.ID) {
    const config=SpecialStages.definition(specialId),backgroundImage=images.get(config.ID)?.background;
    if(!backgroundImage)return;
    ctx.drawImage(backgroundImage,0,0,1024,576);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i=0;i<42;i++) {
      const t = reduced ? 0 : time, x = (i*173+t/(55+i*4))%1024, y = 35+i*47%480;
      ctx.globalAlpha = .2 + .25 * Math.sin(t/1700+i)**2;
      ImageEffects.mote(ctx,Math.round(x/2)*2,y,i%7===0?13:9,config.COLORS[i%3],1,t+i*53);
    }
    ctx.restore();
  }
  function gate(ctx,actor,time,reduced) {
    const config=SpecialStages.definition(actor.specialId),gateImage=images.get(config.ID)?.gate;
    if (!gateImage || actor.gatePhase === 'broken') return;
    const tier=actor.gateTier,color=config.COLORS[tier],h=actor.height,size=h/.89;
    const x=actor.x-size/2,y=actor.y-size*.94,clock=actor.gateClock||0;
    const phase=actor.gatePhase,opening=phase==='opening'?clamp(clock/900):phase==='summoning'?1:phase==='closing'?1-clamp(clock/650):0;
    const t = reduced ? 0 : time;
    ctx.save();
    ctx.fillStyle='#07041599';ctx.beginPath();ctx.ellipse(actor.x,actor.y,80+tier*13,18,0,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='screen';
    ImageEffects.glow(ctx,actor.x,actor.y-h*.48,h*.67,color,.32,t);
    for(let i=0;i<20+tier*6;i++) {
      const angle=i*2.399+t/2500,r=h*(.47+.04*Math.sin(t/700+i));
      ImageEffects.mote(ctx,actor.x+Math.cos(angle)*r*.66,actor.y-h*.48+Math.sin(angle)*r,13,color,.35+.5*Math.sin(t/500+i)**2,t+i*53);
    }
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    if(opening>0) {
      const gap=opening*h*.25;
      ImageEffects.sprite(ctx,'portal',t,actor.x,actor.y-h*.47,(gap+12)*2,h*.86,null,1);
      ImageEffects.ring(ctx,t,actor.x,actor.y-h*.47,gap+15,h*.4,color,.4);
    }
    if(phase==='shattering' && clock>280) {
      const p=clamp((clock-280)/1120),cols=8,rows=8,w=gateImage.width/cols,hh=gateImage.height/rows;
      ctx.globalAlpha=1-p;
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++) {
        const angle=Math.atan2(row-3.8,col-3.5),force=40+((row*29+col*17)%70);
        ctx.save();ctx.translate(x+(col+.5)*size/cols+Math.cos(angle)*force*p,y+(row+.5)*size/rows+Math.sin(angle)*force*p+p*p*110);
        ctx.rotate((col-row)*p*.23);ctx.drawImage(gateImage,col*w,row*hh,w,hh,-size/cols/2,-size/rows/2,size/cols,size/rows);ctx.restore();
      }
    } else {
      const shift=opening*h*.12,half=gateImage.width/2;
      ctx.drawImage(gateImage,0,0,half,gateImage.height,x-shift,y,size/2,size);
      ctx.drawImage(gateImage,half,0,half,gateImage.height,x+size/2+shift,y,size/2,size);
      if(phase==='shattering') {
        for(let i=0;i<5;i++)ImageEffects.link(ctx,{x:actor.x,y:actor.y-h*.47},{x:actor.x+(i-2)*32,y:actor.y-h*(i%2?.1:.9)},'#fff4ff',1,20,t+i*47,'lightning');
      }
    }
    ctx.restore();
  }
  function emergence(ctx,run,reduced) {
    for(const enemy of run.enemies) {
      const age=run.time-enemy.riftBornAt;if(!Number.isFinite(age)||age>=850||enemy.hp<=0)continue;
      ctx.save();const color=SpecialStages.definition(run.stage.id).COLORS[run.wave],p=age/850;
      ctx.globalAlpha=(1-p)*.85;
      ImageEffects.ring(ctx,reduced?0:age,enemy.x,enemy.y,30+p*42,12+p*10,color,1);
      if(!reduced)for(let i=0;i<5+run.wave*3;i++) {const a=i*2.4+age/180;ImageEffects.sprite(ctx,'mote',age+i*53,enemy.x+Math.cos(a)*35,enemy.y-age*.1-i%3*16,10,24+run.wave*8,color,1);}
      ctx.restore();
    }
  }
  function effect(ctx,e,age,reduced) {
    const duration=e.kind==='shatter'?1500:900,p=clamp(age/duration),color=SpecialStages.definition(e.specialId).COLORS[e.tier];
    ctx.save();ctx.globalAlpha=1-p;const clock=reduced?0:age;
    if(e.kind==='emerge') {
      if(e.tier===0)ImageEffects.ring(ctx,clock,e.x,e.y-35,12+p*45,40*(1-p)+5,color,1);
      else if(e.tier===1)for(let i=0;i<2;i++)ImageEffects.ring(ctx,clock,e.x,e.y-45,28+p*50,55+p*20,color,1,i?-.4:.4);
      else {for(let i=0;i<3;i++)ImageEffects.link(ctx,{x:e.x-50+i*45,y:e.y-145},{x:e.x-40+i*35,y:e.y},color,1,30,clock+i*73,'lightning');ImageEffects.ring(ctx,clock,e.x,e.y,60+p*90,20+p*15,color,1);}
      if(!reduced&&e.from)ImageEffects.link(ctx,e.from,{x:e.x,y:e.y-35},color,.35,20,clock);
    } else if(e.kind==='shatter') {
      ImageEffects.ring(ctx,clock,e.x,e.y-100,20+p*240,35+p*150,color,1);
      if(!reduced)for(let i=0;i<24;i++){const a=i*2.399,r=40+p*(90+i%5*25);ImageEffects.mote(ctx,e.x+Math.cos(a)*r,e.y-100+Math.sin(a)*r,12+i%3*3,color,1,clock+i*59);}
    }
    ctx.restore();
  }
  return { load, background, gate, emergence, effect };
})();
