'use strict';
window.VolcanoRenderer=(()=>{
 function motionTime(p,data){return Math.min(data.durationMs-1,p.elapsed);}
 function effect(ctx,e,age,assets,draw){const asset=assets[e.effect];if(!asset)return;const s=e.shape;
  if(s?.kind==='lane'||s?.kind==='sector'){const frames=asset.data.frames,bounds=frames.map(f=>f.visibleBounds||f.bounds||{left:0,top:0,right:f.width,bottom:f.height}),pivot=asset.data.pivot||{x:frames[0].width/2},forward=Math.max(1,pivot.x-Math.min(...bounds.map(b=>b.left??b.x??0))),height=Math.max(1,Math.max(...bounds.map(b=>b.bottom??(b.y||0)+b.height))-Math.min(...bounds.map(b=>b.top??b.y??0))),direction=e.visualEnd?Math.atan2(e.visualEnd.y-e.y,e.visualEnd.x-e.x):s.direction,length=e.visualEnd?Math.hypot(e.visualEnd.x-e.x,e.visualEnd.y-e.y):s.radius,width=s.kind==='lane'?s.width*2:s.radius*2*Math.sin(s.angle/2);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(direction+Math.PI);ctx.scale(length/forward,width/height);draw(asset,age,0,0,1);ctx.restore();}
  else if(e.radius)draw(asset,age,e.x,e.y,e.radius*2/350);else draw(asset,age,e.x,e.y,e.scale||.8,e.facing>0);
 }
 function projectiles(ctx,run,assets,draw,reduced){for(const p of run.volcanoProjectiles){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.to.y-p.origin.y,p.to.x-p.origin.x)+Math.PI);if(!reduced)ImageEffects.link(ctx,{x:35,y:0},{x:0,y:0},'#ffbc59',1,20,p.age);draw(assets['volcano-'+p.plan.effect],p.age,0,0,.5);ctx.restore();}}
 function floors(ctx,run,assets,draw){for(const f of run.volcanoFloors)draw(assets['volcano-lava-pool'],run.time-f.bornAt,f.center.x,f.center.y,f.radius*2/350,false,.8);}
 function statuses(ctx,run,assets,draw){const out=[];for(const a of [run.hero,...run.allies].filter(a=>a.hp>0)){const burn=a.burn,armor=a.armorBreakUntil>run.time;if(!burn&&!armor)continue;const y=a.y-a.height*.6;if(burn)draw(assets['volcano-burn'],run.time,a.x-15,y,.22);if(armor)draw(assets['volcano-armor-break'],run.time,a.x+18,y,.2);out.push({x:a.x-30,y:y-35,w:60,h:45,label:[burn?'火傷\n威力 ×0.15 / 秒\n残り '+((burn.until-run.time)/1000).toFixed(1)+'秒':'',armor?'破甲\n防御力 −20%\n残り '+((a.armorBreakUntil-run.time)/1000).toFixed(1)+'秒':''].filter(Boolean).join('\n')});}return out;}
 return{motionTime,effect,projectiles,floors,statuses};
})();
