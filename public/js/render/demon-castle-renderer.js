'use strict';
window.DemonCastleRenderer=(()=>{
 const motionTime=(p,data)=>Math.min(data.durationMs-1,p.elapsed);
 function effect(ctx,e,age,assets,draw){const asset=assets[e.effect];if(!asset||!asset.data.loop&&age>=asset.data.durationMs)return;
  if(e.effect==='castle-end-ring'){const s=e.shape;ctx.save();ctx.translate(e.x,e.y);ctx.scale((s?.radius||440)/180,.3*(s?.radius||440)/180);draw(asset,age,0,0,1);ctx.restore();return;}
  if(e.effect==='castle-demon-impact'&&e.shape?.kind==='sector'){const s=e.shape;ImageEffects.arc(ctx,age,s.center.x,s.center.y,s.radius,s.radius*.27,s.direction-s.angle/2,s.direction+s.angle/2,'#d995ff',1,32);draw(asset,age,e.x+Math.cos(s.direction)*s.radius*.7,e.y+Math.sin(s.direction)*s.radius*.27,.85);return;}
  if(e.shape?.kind==='lane'||e.shape?.kind==='sector'){VolcanoRenderer.effect(ctx,e.shape.kind==='lane'?{...e,x:e.visualOrigin?.x??e.x,y:e.visualOrigin?.y??e.y,visualEnd:e.visualEnd||e.shape.to}:e,age,assets,draw);return;}
  if(e.effect==='castle-demon-pillar')draw(asset,age,e.x,e.y,.8);else draw(asset,age,e.x,e.y,e.scale||.7,e.facing>0);
 }
 function projectiles(ctx,run,assets,draw,reduced){for(const p of run.castleProjectiles){ctx.save();ctx.translate(p.x,p.y);if(!reduced){const angle=Math.atan2(p.to.y-p.origin.y,p.to.x-p.origin.x);ImageEffects.link(ctx,{x:-Math.cos(angle)*40,y:-Math.sin(angle)*40},{x:0,y:0},'#d7a1ff',1,22,p.age);}draw(assets['castle-curse-orb'],p.age,0,0,.4);ctx.restore();}}
 function statuses(ctx,run,assets,draw){const out=[];if(run.stage.region!==10)return out;for(const a of [run.hero,...run.allies].filter(a=>a.hp>0)){const rows=[
   [a.sleepUntil,'sleep-moon','睡眠','',1500],
   [a.silenceUntil,'silence-seal','沈黙','',1500],
   [a.enemyCurseUntil,'curse-mark','呪い','回復量 −25%\n',4000],
   [a.burn?.until,'burn','火傷','威力 ×0.15 / 秒\n',4000],
   [a.armorBreakUntil,'armor-break','破甲','防御力 −20%\n',4000]
  ].filter(([until])=>until>run.time);rows.forEach(([until,id,label,parameter,duration],i)=>{const x=a.x+(i-(rows.length-1)/2)*26,y=a.y-a.height*.7,asset=assets['castle-'+id],age=Math.max(0,duration-(until-run.time));draw(asset,age%asset.data.durationMs,x,y,.24);out.push({x:x-14,y:y-32,w:28,h:36,label:label+'\n'+parameter+'残り '+((until-run.time)/1000).toFixed(1)+'秒'});});}return out;}
 return{motionTime,effect,projectiles,statuses};
})();
