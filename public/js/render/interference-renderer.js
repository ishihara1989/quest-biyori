'use strict';
window.InterferenceRenderer=(()=>{
  function warnings(ctx,run){for(const e of run.enemies){if(!ActionInterference.open(e,run.time)||e.bodyPart)continue;const a=e.actionInterference,r=ActionInterference.resistance(e,run.time),q=Math.min(1,(run.time-a.startedAt)/(a.endsAt-a.startedAt)),color=r>=50?'#ff845f':r>=20?'#ffcf72':'#c8a1ff';
    ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.strokeStyle=color;ctx.fillStyle=color+'44';ctx.lineWidth=2.5;ctx.setLineDash([8,5]);
    if(e.region===8||e.region===9||e.region===10){ctx.beginPath();ctx.rect(90,334,854,167);ctx.clip();}
    const outline=()=>{ctx.strokeStyle='#11121cdd';ctx.lineWidth=6.5;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();};
    for(const s of a.shapes){ctx.beginPath();if(s.kind==='circle'){ctx.arc(s.center.x,s.center.y,s.radius,0,Math.PI*2);ctx.fill();outline();ctx.setLineDash([]);ctx.lineWidth=4;ctx.beginPath();ctx.arc(s.center.x,s.center.y,s.radius,-Math.PI/2,-Math.PI/2+q*Math.PI*2);ctx.stroke();ctx.lineWidth=2.5;ctx.setLineDash([8,5]);}
      else if(s.kind==='sector'||s.kind==='annulus'){
        const trace=()=>{ctx.beginPath();if(s.kind==='sector'){ctx.moveTo(s.center.x,s.center.y);ctx.arc(s.center.x,s.center.y,s.radius,s.direction-s.angle/2,s.direction+s.angle/2);ctx.closePath();}else{ctx.arc(s.center.x,s.center.y,s.radius,0,Math.PI*2);if(s.innerRadius){ctx.moveTo(s.center.x+s.innerRadius,s.center.y);ctx.arc(s.center.x,s.center.y,s.innerRadius,0,Math.PI*2,true);}ctx.closePath();}};
        trace();ctx.fill('evenodd');outline();ctx.save();ctx.clip('evenodd');ctx.globalAlpha=.4;ctx.lineWidth=1;ctx.setLineDash([]);for(let x=-576;x<1600;x+=24){ctx.beginPath();ctx.moveTo(x,334);ctx.lineTo(x+167,501);ctx.stroke();}ctx.restore();
      }
      else if(s.kind==='lane'){const dx=s.to.x-s.from.x,dy=s.to.y-s.from.y,len=Math.hypot(dx,dy)||1,length=s.length||len,to={x:s.from.x+dx/len*length,y:s.from.y+dy/len*length},nx=-dy/len*s.width,ny=dx/len*s.width;
        ctx.moveTo(s.from.x+nx,s.from.y+ny);ctx.lineTo(to.x+nx,to.y+ny);ctx.lineTo(to.x-nx,to.y-ny);ctx.lineTo(s.from.x-nx,s.from.y-ny);ctx.closePath();ctx.fill();outline();ctx.setLineDash([]);ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(s.from.x,s.from.y);ctx.lineTo(s.from.x+(to.x-s.from.x)*q,s.from.y+(to.y-s.from.y)*q);ctx.stroke();ctx.globalAlpha=1;ctx.setLineDash([8,5]);}
      if(s.order){const c=s.center||s.to;const x=Math.max(108,Math.min(930,c.x+(s.kind==='sector'?Math.cos(s.direction)*s.radius*.7:s.kind==='annulus'?s.radius-18:40))),y=Math.max(346,Math.min(490,c.y));ctx.save();ctx.setLineDash([]);ctx.fillStyle='#291943';ctx.strokeStyle='#e7bdff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f5e9ff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(s.order),x,y);ctx.restore();}
    }
    ctx.globalAlpha=.25+.15*Math.sin(run.time*.012);ctx.beginPath();ctx.ellipse(e.x,e.y,35,11,0,0,Math.PI*2);ctx.fill();ctx.restore();}}
  function bars(ctx,run){const regions=[];for(const e of run.enemies){if(!ActionInterference.open(e,run.time)||e.bodyPart)continue;const a=e.actionInterference,r=ActionInterference.resistance(e,run.time),w=e.boss?104:58,x=e.x-w/2,y=e.y-(e.height||142)-24,color=r>=50?'#ffb06e':'#cba9ff';
    ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#111c24ee';ctx.fillRect(x-2,y-2,w+4,11);ctx.fillStyle=color;ctx.fillRect(x,y,w*a.remaining/a.capacity,7);
    ctx.strokeStyle='#f2ebd3';ctx.lineWidth=r>=50?3:1.5;ctx.beginPath();ctx.moveTo(x-13,y-2);ctx.lineTo(x-5,y-2);ctx.lineTo(x-6,y+6);ctx.lineTo(x-9,y+10);ctx.lineTo(x-12,y+6);ctx.closePath();ctx.fillStyle='#111c24';ctx.fill();ctx.stroke();
    if(e.interruptCount){ctx.fillStyle='#ffe4b4';ctx.font='bold 10px sans-serif';ctx.fillText('+'+e.interruptCount,x+w+5,y+7);}ctx.restore();
    regions.push({x:x-17,y:y-8,w:w+42,h:25,label:'妨害抵抗力 '+Number(ActionInterference.resistance(e,run.time).toFixed(1))+'\n妨害抵抗容量 '+Number(a.capacity.toFixed(1))+'\n残量 '+Number(a.remaining.toFixed(1))+'\n中断回数 '+(e.interruptCount||0)+'\n予備動作 '+Number(((a.endsAt-a.startedAt)/1000).toFixed(2))+'秒'});
  }return regions;}
  return {warnings,bars};
})();
