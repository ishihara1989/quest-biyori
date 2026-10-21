'use strict';
window.ReincarnationRenderer={
  draw(ctx,e,run,sprites,paint,reduced){
    const a=sprites[e.type],p=e.deliveryPlan,now=run.time,scale=.78;
    const body=(id,t,x=e.x,y=e.y-110,alpha=1,s=scale)=>paint(a[id],reduced?0:t,x,y,s,false,alpha);
    if(e.hp<=0){
      const age=now-e.departedAt;if(age>=2400)return;
      if(age<1800){const q=Math.max(0,Math.min(1,(age-600)/1200));body('return',age,e.x+q*70,e.y-110-q*85,Math.max(0,Math.min(1,(1800-age)/480)));}
      body(age<1800?'fx-gate-open':'fx-gate-close',age<600?age:age<1800?599:age-1800,880,270,1,1.05);return;
    }
    if(p?.kind==='truck'){
      if(p.cancelAt!=null){body('truck-interrupt',now-p.cancelAt,e.x,e.y+15,Math.max(0,1-(now-p.cancelAt-760)/300),1.0);if(now-p.cancelAt>760)body('hit',now-p.cancelAt-760);return;}
      if(p.elapsed>p.warn+650){const q=Math.min(1,(p.elapsed-p.warn-650)/590);body('move',p.elapsed,82+(e.x-82)*q,e.y-110);return;}
      const id=p.elapsed<760?'truck-mount':p.elapsed<p.warn?'truck-wait':'truck-rush',x=p.elapsed<p.warn?942:942-Math.min(1,(p.elapsed-p.warn)/650)*1100;
      body(id,p.elapsed<760?p.elapsed:p.elapsed<p.warn?p.elapsed-760:p.elapsed-p.warn,x,(p.shapes[0]?.from.y||e.y)+15,1,1.0);
      if(p.elapsed>=p.warn)body('fx-truck',p.elapsed-p.warn,x+100,e.y+12,1,.9);return;
    }
    if(p?.cancelAt!=null){body('hit',now-p.cancelAt);return;}
    if(p){const active=p.elapsed<p.warn?0:Math.min(a['body-'+p.kind].data.durationMs-1,p.elapsed-p.warn);body('body-'+p.kind,active);}
    else body('idle',now);
  },
  warnings(ctx,run){
    const e=run.enemies.find(e=>e.reincarnationGoddess&&e.hp>0),p=e?.deliveryPlan;if(!p||p.cancelAt!=null)return;
    ctx.save();ctx.beginPath();ctx.rect(82,324,860,183);ctx.clip();ctx.strokeStyle='#ffc76b';ctx.fillStyle='#ffb65a22';ctx.lineWidth=2;ctx.setLineDash([8,5]);
    for(let i=0;i<p.shapes.length;i++){
      if(p.elapsed>=(p.times[i]??p.warn))continue;const s=p.shapes[i];ctx.beginPath();
      if(p.kind==='discs')ctx.ellipse(e.x-320,e.y,320,60,0,0,Math.PI*2);
      else if(s.kind==='circle')ctx.arc(s.center.x,s.center.y,s.radius,0,Math.PI*2);
      else if(s.kind==='sector'){ctx.moveTo(s.center.x,s.center.y);ctx.arc(s.center.x,s.center.y,s.radius,s.direction-s.angle/2,s.direction+s.angle/2);ctx.closePath();}
      else{const angle=Math.atan2(s.to.y-s.from.y,s.to.x-s.from.x),nx=-Math.sin(angle)*s.width,ny=Math.cos(angle)*s.width;ctx.moveTo(s.from.x+nx,s.from.y+ny);ctx.lineTo(s.to.x+nx,s.to.y+ny);ctx.lineTo(s.to.x-nx,s.to.y-ny);ctx.lineTo(s.from.x-nx,s.from.y-ny);ctx.closePath();}
      ctx.fill();ctx.stroke();
    }ctx.restore();
  },
  overlays(ctx,run,sprites,paint){
    const e=run.enemies.find(e=>e.reincarnationGoddess&&e.hp>0),p=e?.deliveryPlan;if(!p||p.cancelAt!=null)return;const a=sprites[e.type];
    if(p.kind==='missiles')for(let i=0;i<p.targets.length;i++){
      const q=(p.elapsed-p.warn-i*180)/500;if(q<0||q>1)continue;const at=p.shapes[i].center;
      paint(a['fx-missile'],q*500,e.x+(at.x-e.x)*q,e.y-120+(at.y-e.y+120)*q-Math.sin(q*Math.PI)*100,.5);
    }
    if(p.kind==='discs'&&p.elapsed>=p.warn&&p.elapsed<p.warn+1400){
      const q=(p.elapsed-p.warn)/1400,theta=q*Math.PI*2;paint(a['fx-disc'],p.elapsed,e.x-320+Math.cos(theta)*320,e.y+Math.sin(theta)*60-25,.5);
    }
  },
  effect(ctx,event,age,sprites,paint){
    if(age>(event.duration||700))return;const a=sprites['reincarnation-goddess'],clip=a?.[event.effect];if(!clip)return;
    if(event.shape){const s=event.shape,from={x:s.from.x-190,y:s.from.y-142},to={x:s.to.x,y:s.to.y-65},len=Math.hypot(to.x-from.x,to.y-from.y);ctx.save();ctx.translate((to.x+from.x)/2,(to.y+from.y)/2);ctx.rotate(Math.atan2(to.y-from.y,to.x-from.x)+Math.PI);ctx.scale(len/512,1);paint(clip,age,0,0,1);ctx.restore();}
    else{const q=Math.min(1,age/(event.duration||700)),from=event.to?{x:event.x-100,y:event.y-140}:event,x=event.to?from.x+(event.to.x-from.x)*q:from.x,y=event.to?from.y+(event.to.y-65-from.y)*q:from.y-30;paint(clip,age,x,y,event.effect==='fx-orbital'?1.1:.7);}
  }
};
