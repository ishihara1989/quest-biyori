'use strict';
window.GlacierRenderer=(()=>{
 function motionTime(p,data){const f=data.frames,first=f[0].durationMs,release=first+f[1].durationMs;
  const windup=p.warn||p.times[0];if(p.elapsed<windup)return p.motion==='leap'?Math.min(first-1,p.elapsed):Math.min(release-1,p.elapsed);
  if(p.motion==='leap'&&p.elapsed<p.times[0])return first+1;
  return Math.min(data.durationMs-1,release+(p.elapsed-(p.motion==='leap'?p.times[0]:windup)));
 }
 function effect(ctx,e,age,assets,draw){const asset=assets[e.effect];if(!asset)return;
  if(e.shape?.kind==='sector'){const s=e.shape;ctx.save();ctx.translate(s.center.x,s.center.y);ctx.rotate(s.direction+Math.PI);draw(asset,age,-s.radius*.35,-24,s.radius*1.65/asset.data.frameWidth);ctx.restore();}
  else if(e.radius){draw(asset,age,e.x,e.y,e.radius*2/asset.data.frameWidth);}
  else draw(asset,age,e.x,e.y,e.scale||.7,e.facing>0);
 }
 function projectiles(ctx,run,assets,draw,reduced){for(const p of run.glacierProjectiles){ctx.save();ctx.translate(p.x,p.y-20);ctx.rotate(Math.atan2(p.to.y-p.origin.y,p.to.x-p.origin.x)+Math.PI);if(!reduced)ImageEffects.link(ctx,{x:30,y:0},{x:0,y:0},'#b5f5ff',1,18,p.age);draw(assets['glacier-cold'],Math.min(p.age,230),0,0,.4);ctx.restore();}}
 function statuses(ctx,run,assets,draw){const out=[];for(const a of [run.hero,...run.allies,...run.enemies].filter(a=>a.hp>0)){
  const frozen=a.freezeUntil>run.time,chilled=a.chillUntil>run.time,armor=a.glacierArmorUntil>run.time;if(!frozen&&!chilled&&!armor)continue;
  if(frozen)draw(assets['glacier-seal'],250,a.x,a.y,.52,false,.75);if(armor)draw(assets['glacier-armor'],250,a.x,a.y-a.height*.5,.8,false,.6);
  const y=a.y-(a.height||150)-9;draw(assets[frozen?'glacier-seal':armor?'glacier-armor':'glacier-cold'],250,a.x,y+10,.085,false,1);
  out.push({x:a.x-16,y:y-20,w:32,h:30,label:frozen?'凍結 '+((a.freezeUntil-run.time)/1000).toFixed(1)+'秒\n解除後免疫 3秒':armor?'結晶装甲\n被ダメージ −30%\n残り '+((a.glacierArmorUntil-run.time)/1000).toFixed(1)+'秒':'移動速度 −30%\n残り '+((a.chillUntil-run.time)/1000).toFixed(1)+'秒'});
 }return out;}
 return{motionTime,effect,projectiles,statuses};
})();
