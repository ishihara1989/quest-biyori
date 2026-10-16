'use strict';
window.PaladinSkillRenderer=(()=>{
 const KINDS=['impact','wave','shield','circle','hammer','pillar','sword','knight','rampart','break-impact'];
 async function load(){await ImageEffects.load();return Object.fromEntries(await Promise.all(KINDS.map(async id=>{const base='assets/skills/paladin/effects/'+id+'/',r=await fetch(base+'manifest.json');if(!r.ok)throw Error(base);const data=await r.json(),image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(base));i.src=base+data.sheet;});return [id,{data,image}];})));}
 function sprite(ctx,a,time,x,y,w,h,angle=0,alpha=1){if(!a||alpha<=0)return;const d=a.data,t=d.loop?Math.max(0,time)%d.durationMs:Math.min(Math.max(0,time),d.durationMs-.01),f=d.frames[MotionPlayback.frameAt(d,t)];ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.drawImage(a.image,f.x,f.y,f.width,f.height,-w*d.pivot.x/d.frameWidth,-h*d.pivot.y/d.frameHeight,w,h);ctx.restore();}
 function ring(ctx,fx,t,x,y,r,alpha=.7){ctx.save();ctx.translate(x,y);ctx.scale(1,.32);sprite(ctx,fx.circle,t,0,0,r*2,r*2,0,alpha);ctx.restore();}
 function fields(ctx,run,fx,reduced=false){for(const f of run.paladinFields||[]){if(f.until<=run.time||f.source.hp<=0)continue;const age=run.time-f.start,alpha=Math.min(1,age/180,(f.until-run.time)/250),clock=reduced?240:age;
  const party=[run.hero,...run.allies].filter(a=>a.hp>0&&(f.selfOnly?a===f.source:f.allParty||Math.hypot(a.x-f.center.x,a.y-f.center.y)<=f.spec.radius));
  if(f.id==='sanctuary'){ring(ctx,fx,clock,f.center.x,f.center.y,f.spec.radius,.48*alpha);for(const a of party)sprite(ctx,fx.circle,clock,a.x,a.y-40,60,60,0,alpha*.4);}
  else if(f.id==='fortress'){ring(ctx,fx,clock,f.center.x,f.center.y,f.spec.radius,.45*alpha);ImageEffects.arc(ctx,clock,f.center.x,f.center.y-45,f.spec.radius,f.spec.radius*.43,Math.PI,Math.PI*2,'#c9f8ff',.28*alpha,18);}
  if(f.id==='bastion'){sprite(ctx,fx.rampart,clock,510,430,960,400,0,.4*alpha);ring(ctx,fx,clock,510,445,460,.45*alpha);}
  for(const a of party)if(f.id!=='sanctuary')sprite(ctx,fx.shield,clock,a.x+a.facing*30,a.y-80,f.id==='ultimate'?180:120,f.id==='ultimate'?230:155,0,.4*alpha);
 }}
 function castOverlay(ctx,actor,fx,reduced=false){const c=actor.paladinCast;if(!c)return;const s=c.spec,t=c.elapsed,clock=reduced?200:t,angle=Math.atan2(c.direction.y,c.direction.x),first=PaladinSkills.hitTimes(s)[0]*s.duration;
  if(s.id!=='mace')ring(ctx,fx,clock,actor.x,actor.y,55+s.unlockLevel*.4,.38);
  if(!reduced&&s.id!=='mace')for(let i=0;i<12;i++){const a=i*2.399+t/900,r=24+i%3*14;ImageEffects.mote(ctx,actor.x+Math.cos(a)*r,actor.y-20-((t/5+i*19)%110),11,'#fff0b5',.6,t+i*53);}
  if(['hammer','judgment','ultimate'].includes(s.id)&&t<first){const start=s.windup,q=Math.max(0,(t-start)/Math.max(1,first-start)),size=s.id==='ultimate'?560:s.id==='judgment'?340:160;const form=Math.min(1,t/Math.max(1,s.windup));sprite(ctx,fx.hammer,Math.min(270,clock),c.target.x,c.target.y-70-(1-q*q*q)*(s.id==='ultimate'?520:300),size*form,size*form,0,.85);if(s.id==='ultimate')for(let i=0;i<3;i++)ring(ctx,fx,clock,512,85+i*23,200+i*55,.5);}
  if(['ray','heavens'].includes(s.id)){ring(ctx,fx,clock,c.target.x,70,s.id==='heavens'?300:210,.6);if(s.id==='heavens'&&t>=s.release){for(let i=0;i<14;i++){const q=((clock-s.release+i*117)%550)/550,x=100+(i*181)%825;sprite(ctx,fx.sword,clock,x+60*(1-q),80+q*360,90,180,0,.6);}}}
  if(s.id==='crusade'&&t>=s.windup){const q=Math.min(1,(t-s.windup)/s.hold);for(let i=0;i<8;i++)sprite(ctx,fx.knight,clock+i*60,c.origin.x-120+(i%4)*62+c.direction.x*q*750,c.origin.y+(i<4?-65:45),140,170,0,.48);}
  if(s.id==='wall'&&t>=s.windup){const q=Math.min(1,(t-s.windup)/s.hold);sprite(ctx,fx.rampart,clock,c.origin.x+c.direction.x*q*s.radius,c.origin.y+c.direction.y*q*s.radius-90,270,230,0,.7);}
  if(s.id==='spear'&&t<first){sprite(ctx,fx['break-impact'],0,actor.x+actor.facing*32,actor.y-95,58,58,0,t/first*.7);}
  if(s.id==='revenge'&&t<s.windup+s.hold){sprite(ctx,fx.shield,clock,actor.x+actor.facing*38,actor.y-75,150,190,0,.6);if(c.absorbed>0)ring(ctx,fx,clock,actor.x,actor.y,70+Math.min(90,c.absorbed/20),.7);}
 }
 function impacts(ctx,events,time,fx,reduced=false){for(const e of events){const age=time-e.timeMs;if(age<0||age>650)continue;const fade=Math.min(1,(650-age)/200);
  if(e.type==='paladin-block'){sprite(ctx,fx.shield,age,e.x,e.y-60,75,110,0,fade*.75);continue;}
  if(e.type==='paladin-cleanse'){ring(ctx,fx,age,e.x,e.y,45+age*.15,fade*.75);continue;}
  if(e.type==='action-interrupt'){sprite(ctx,fx['break-impact'],age,e.x,e.y-65,180,180,0,fade);continue;}
  if(e.type==='interference-hit'||e.type==='interference-resist'){sprite(ctx,fx.impact,age,e.x,e.y-65,36,36,0,fade*(e.type==='interference-resist'?.35:.7));continue;}
  if(e.type!=='paladin-impact')continue;const id=e.skillId,large=['judgment','crusade','ray','heavens','ultimate'].includes(id),final=e.index===e.hits-1;
  if(['wave','revenge'].includes(id)){for(let i=-1;i<=1;i++){const angle=Math.atan2(e.direction.y,e.direction.x)+i*.3,q=Math.min(1,.25+age/400);sprite(ctx,fx.wave,age,e.origin.x+Math.cos(angle)*e.radius*q,e.origin.y-45+Math.sin(angle)*e.radius*q,210,160,angle,fade);}}
  else if(['hammer','judgment','ultimate'].includes(id)){const size=id==='ultimate'?900:id==='judgment'?560:170;sprite(ctx,fx.hammer,Math.min(559,320+age),e.x,e.y-80,size,size*.8,0,fade*.8);ring(ctx,fx,age,e.x,e.y,e.radius*(.4+age/400),fade*.6);}
  else if(['pillar','ray','heavens'].includes(id)){for(const p of e.targets)sprite(ctx,fx[id==='heavens'?'sword':'pillar'],age,p.x,p.y-(id==='heavens'?150:0),id==='ray'&&final?160:80,final?420:320,0,fade*.8);if(id==='heavens'&&final)sprite(ctx,fx.sword,559,e.x,e.y-110,640,640,0,fade);}
  else if(id==='spear'){for(const p of e.targets)sprite(ctx,fx['break-impact'],age,p.x,p.y-65,190,190,0,fade);}
  else if(['mace','charge','bash','crusade','wall'].includes(id)){for(const p of e.targets)sprite(ctx,fx.impact,age,p.x,p.y-30,id==='bash'?230:110,id==='bash'?180:110,0,fade);if(['bash','crusade','wall'].includes(id))ring(ctx,fx,age,e.x,e.y,100+age*.7,fade*.5);}
  else ring(ctx,fx,age,e.x,e.y,70+age*.3,fade*.65);
  if(large&&final&&!reduced&&age<130)ImageEffects.screen(ctx,'#fff9ce',(1-age/130)*(id==='ultimate'?.45:.18),age);
  if(!reduced)ImageEffects.burst(ctx,e.x,e.y-45,age,large?32:10,'#ffde88',1,fade);
 }}
 return {load,sprite,ring,fields,castOverlay,impacts,KINDS};
})();
