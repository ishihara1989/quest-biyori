'use strict';
window.MikoSkillRenderer=(()=>{
  const H=132;
  async function load(){await ImageEffects.load();const response=await fetch('assets/skills/miko/catalog.json');if(!response.ok)throw Error('Miko catalog');const catalog=await response.json();
    const assets=Object.fromEntries(await Promise.all(catalog.assets.filter(a=>a.group!=='miko').map(async data=>{const base=data.path.slice(0,data.path.lastIndexOf('/')+1);const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(base+data.sheet));i.src=base+data.sheet;});return [data.id,{data,image}];})));
    await Promise.all(MikoSkills.ACTIVE.filter(s=>s.kind==='active').map(async s=>{const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(s.icon));i.src=s.icon;});assets['icon-'+s.id]={image};}));return assets;
  }
  function draw(ctx,assets,id,t,x,y,height=H,alpha=1,flip=false){const a=assets[id];if(!a)return;const m=a.data;const bounds=m.frames.map(f=>f.bounds);const bh=Math.max(...bounds.map(b=>b.height||b.bottom-b.top+1));const scale=height/Math.max(1,bh);
    const frame=m.frames[MotionPlayback.frameAt(m,m.loop?t%m.durationMs:Math.min(t,m.durationMs-.001))];ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);ctx.drawImage(a.image,frame.x,frame.y,frame.width,frame.height,-m.pivot.x*scale,-m.pivot.y*scale,frame.width*scale,frame.height*scale);ctx.restore();
  }
  function backdrops(ctx,run,assets,reduced){
    const spectralAlpha=Math.min(1,Math.sqrt(4/Math.max(1,run.mikoContracts.length)));
    for(const c of run.mikoContracts){const age=run.time-c.created,remaining=c.until-run.time,height=['white-deer','golden-lion'].includes(c.id)?4:c.id==='nine-tailed-fox'?5:3;
      const suffix=age<660?'-guardian-appear':remaining<480?'-guardian-disperse':'-guardian';const t=age<660?age:remaining<480?480-remaining:age-660;
      const anchor=c.units[0]||c.source;draw(ctx,assets,c.id+suffix,reduced?0:t,anchor.x,anchor.y,H*(suffix==='-guardian'?height*.83:height),(suffix==='-guardian'?.25:.44)*spectralAlpha,anchor.x>600);
    }
    for(const p of run.mikoPossessions){const age=run.time-p.created,cohabit=run.mikoPossessions.filter(other=>other.host===p.host).length;draw(ctx,assets,p.id+(age<390?'-appear':'-idle'),reduced?0:age,p.host.x,p.host.y,H*(age<390?3.2:2.5),.40/(cohabit>2?Math.sqrt(cohabit):1),p.host.facing<0);}
    const f=run.mikoFestival;if(f){const age=run.time-f.start;draw(ctx,assets,age<600?'torii-open':'torii-loop',reduced?0:age,512,550,620,.38);
      if(f.spec.id==='myriad-spirit-festival')draw(ctx,assets,'shrine-domain',reduced?0:age,512,540,560,.33);
      for(const actor of [run.hero,...run.allies].filter(a=>a.hp>0))draw(ctx,assets,'kagura-robes',reduced?0:age,actor.x,actor.y,H*2.5,.42,actor.facing<0);
      if(!reduced&&age<120)ImageEffects.screen(ctx,'#fff4d4',.2*(1-age/120),age);
    }
    if(run.mikoChannel)draw(ctx,assets,'spirit-channel',reduced?0:run.time-run.mikoChannel.start,run.mikoChannel.source.x,run.mikoChannel.source.y,H*2.6,.42);
    if(run.mikoTwin)draw(ctx,assets,'double-robes',reduced?0:run.time,run.mikoTwin.host.x,run.mikoTwin.host.y,H*3,.36);
    for(const a of [run.hero,...run.allies])if(a.mikoCast&&a.mikoCast.spec.role!=='normal'){draw(ctx,assets,'summon-circle',reduced?0:a.mikoCast.elapsed,a.x,a.y,90,.55);if(['spirit-kagura','spirit-channel','nine-tailed-fox','myriad-spirit-festival'].includes(a.mikoCast.spec.id))draw(ctx,assets,'torii-open',reduced?0:a.mikoCast.elapsed,512,550,620,.42);}
  }
  function units(ctx,run,assets,reduced){for(const c of run.mikoContracts)for(const u of c.units){const age=run.time-u.actionAt,id=c.id+(age<390?'-action':u.moving&&assets[c.id+'-walk']?'-walk':'-idle');draw(ctx,assets,id,reduced?0:age<390?age:run.time,u.x,u.y,H*(c.id==='nine-tailed-fox'?.9:c.id==='golden-lion'?.8:.5),.92,u.x>650);}}
  const EFFECT={'healing-pollen':'butterfly-wings','barrier-shell':'tortoise-dome','crow-lightning':'feather-lightning','lion-claw':'lion-claws','flame-trail':'flame-wheel-trail','blade-followup':'blade-slash','twin-crest':'double-robes','channel-crest':'spirit-channel'};
  function impacts(ctx,events,time,assets,reduced){for(const e of events){if(e.type!=='miko-effect')continue;const age=time-e.timeMs;if(age<0||age>1200)continue;
    if(['guardian','possession','festival'].includes(e.kind))continue;let id=EFFECT[e.kind]||e.kind;if(e.kind==='cooperative-strike')id='purification-bolt';
    const giant=e.kind==='festival-finale',height=giant?1100:e.kind==='cooperative-strike'?300:e.kind==='owl-halo'?H*1.8:180;
    if(e.from)ImageEffects.link(ctx,{x:e.from.x,y:e.from.y-30},{x:e.x,y:e.y-30},e.kind==='healing-pollen'?'#d1f1b8':'#fff1b5',.55*Math.max(0,1-age/700),18,reduced?0:age);
    draw(ctx,assets,id,reduced?0:age,e.x,giant?240:e.y,height,Math.max(0,1-age/1200)*.8);
  }}
  function projectiles(ctx,run,assets,reduced,cooperativeAssets={}){for(const p of run.mikoProjectiles){if(p.delay&&p.age<p.delay)continue;const own=p.cooperative&&cooperativeAssets[p.source.type];
    if(own){const d=own.data,f=d.frames[MotionPlayback.frameAt(d,reduced?0:Math.min(p.age,d.durationMs-.01))];ctx.save();ctx.translate(p.x,p.y-40);ctx.shadowColor='#fff1b5';ctx.shadowBlur=reduced?0:14;ctx.globalAlpha=.95;ctx.drawImage(own.image,f.x,f.y,f.width,f.height,-95,-95,190,190);ctx.restore();}
    else {const id=p.kind==='foxfire'||p.kind==='nine-tail-foxfire'?'foxfire':'purification-bolt';draw(ctx,assets,id,reduced?0:p.age,p.x,p.y-35,p.cooperative?180:55,.92,p.source.facing<0);}
  }}
  function barriers(ctx,run){for(const a of [run.hero,...run.allies]){const b=a.mikoBarrier;if(!b||b.until<=run.time||b.amount<=0||a.hp<=0)continue;ctx.save();ctx.fillStyle='#ffe9a1';ctx.fillRect(a.x-25,a.y-150,50*Math.min(1,b.amount/(a.maxHp*.12)),3);ctx.restore();}}
  function statuses(ctx,run,assets){const regions=[];for(const actor of [run.hero,...run.allies].filter(a=>a.hp>0)){
    const list=run.mikoPossessions.filter(p=>p.host===actor).map(p=>({id:p.id,until:p.until,label:p.spec.name+' · '+MikoSkills.parameters(p.spec)}));
    if(actor.type==='miko')for(const c of run.mikoContracts)list.push({id:c.id,until:c.until,label:c.spec.name+' · '+c.units.length+'体 · '+MikoSkills.parameters(c.spec)});
    if(run.mikoFestival){const f=run.mikoFestival,s=f.spec;
      // Solo support has a buff spec, without the MP or action parameters of a cast skill.
      list.push(s.id==='solo-kagura'?{id:'spirit-kagura',until:f.until,label:'巫女の援護 · 霊威 +'+Math.round(s.spirit*100)+'%'}:{id:s.id,until:f.until,label:s.name+' · '+MikoSkills.parameters(s)});
    }
    list.forEach((p,i)=>{const x=actor.x-list.length*9+i*18,y=actor.y-174,a=assets['icon-'+p.id];ctx.save();ctx.fillStyle='#18211ddd';ctx.fillRect(x,y,17,17);if(a)ctx.drawImage(a.image,x,y,17,17);ctx.fillStyle='#ffdc92';ctx.fillRect(x,y+17,17*Math.min(1,(p.until-run.time)/12000),2);ctx.restore();regions.push({x,y,w:17,h:20,label:p.label+' · 残り '+Math.max(0,(p.until-run.time)/1000).toFixed(1)+'秒'});});
  }return regions;}
  return {load,backdrops,units,impacts,projectiles,barriers,statuses};
})();
