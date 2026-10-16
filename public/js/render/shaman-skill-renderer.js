'use strict';
window.ShamanSkillRenderer=(()=>{
  const KINDS=['skull-bolt','mark','mark-pulse','mark-fade','armor-crack','frailty','reaction-ring','curse-spike','grudge-flame','ramp-skull','life-vines','curse-chain','curse-moth','field-open','field-pulse','field-fade','bone-stake','healing-seal','amplify-ring','curse-collapse','curse-burst','soul-lance','hundred-ghosts','soul-pillar','grand-shatter','cast-wraith','dot-wraith'];
  const tier=level=>level>=95?3:level>=70?2:level>=35?1:0;
  async function load(){await ImageEffects.load();return Object.fromEntries(await Promise.all(KINDS.map(async id=>{const base='assets/skills/shaman/effects/'+id+'/',r=await fetch(base+'manifest.json');if(!r.ok)throw Error(base);const data=await r.json(),image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(base+data.sheet));im.src=base+data.sheet;});return [id,{data,image}];})));}
  function sprite(ctx,a,t,x,y,w,h=w,alpha=1,angle=0){if(!a||alpha<=0)return;const d=a.data,time=d.loop?Math.max(0,t)%d.durationMs:Math.min(Math.max(0,t),d.durationMs-.01),f=d.frames[MotionPlayback.frameAt(d,time)];ctx.save();ctx.globalAlpha*=alpha;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.imageSmoothingEnabled=false;ctx.drawImage(a.image,f.x,f.y,f.width,f.height,-w/2,-h/2,w,h);ctx.restore();}
  function light(ctx,x,y,r,color,alpha){ImageEffects.glow(ctx,x,y,r,color,alpha);}
  function sparks(ctx,x,y,age,count,spread,alpha=1){ImageEffects.burst(ctx,x,y,age,count,['#fff2cf','#94fff0','#bd81ff'],spread,alpha);}
  function fields(ctx,run,fx,reduced=false){for(const f of run.shamanFields||[]){const s=f.spec,age=run.time-f.start,t=reduced?180:age,fade=Math.min(1,age/180,(f.until-run.time)/300),r=s.radius,high=s.unlockLevel>=90;
    sprite(ctx,fx['field-open'],600,f.center.x,f.center.y,r*2,r*.7,fade*(high?.8:.68));
    sprite(ctx,fx['field-pulse'],t,f.center.x,f.center.y,r*1.9,r*.65,fade*(high?.72:.56));
    if(s.spacing)for(const dx of [-s.spacing,0,s.spacing]){const x=Math.max(90,Math.min(944,f.center.x+dx));sprite(ctx,fx['field-open'],600,x,f.center.y,r*1.8,r*.58,.6*fade);sprite(ctx,fx['bone-stake'],540,x,f.center.y-86,110,210,.92*fade);}
    if(high){sprite(ctx,fx['amplify-ring'],t,f.center.x,f.center.y,r*1.4,r*.45,.55*fade,-.08);for(let i=0;i<9;i++){const a=i*Math.PI*2/9+(reduced?0:age/4000);sprite(ctx,fx['ramp-skull'],t+i*85,f.center.x+Math.cos(a)*r*.85,f.center.y-45+Math.sin(a)*r*.26,52,65,.78*fade);}}
    if(s.id==='hundred-hex'){sprite(ctx,fx['hundred-ghosts'],t,f.center.x,f.center.y-145,r*1.95,r*1.12,.76*fade);if(!reduced)for(let i=0;i<18;i++){const a=i*2.399+age/1100,q=((age+i*67)%1000)/1000,d=r*(1-q);sprite(ctx,fx['skull-bolt'],t+i*40,f.center.x+Math.cos(a)*d,f.center.y-55-q*140+Math.sin(a)*d*.32,38+q*18,48+q*18,.82*fade,a+Math.PI);}}
  }}
  // Tall spectral bodies sit behind actors; bright rims extend beyond their silhouettes.
  function auras(ctx,run,fx,reduced=false){
    for(const actor of [run.hero,...run.allies]){
      const c=actor.shamanCast;if(!c||c.spec.kind==='normal')continue;
      const s=c.spec,level=tier(s.unlockLevel),q=Math.min(1,c.elapsed/s.release),scale=.76+.24*q;
      const h=(350+level*42)*scale,w=Math.min((320+level*45)*scale,Math.max(240,Math.min(actor.x-8,1016-actor.x)*2/.86)),fade=Math.max(0,Math.min(1,c.elapsed/75,(s.duration-c.elapsed)/130));
      const t=reduced?300:c.elapsed/s.duration*599;
      sprite(ctx,fx['field-open'],540,actor.x,actor.y+2,175+level*55,58+level*15,.72*fade);
      sprite(ctx,fx['cast-wraith'],t,actor.x,actor.y-h*.42,w,h,(.82+.04*level)*fade);
      if(level>=2){sprite(ctx,fx['hundred-ghosts'],reduced?180:c.elapsed,actor.x,actor.y-h*.44,w*1.12,h*.87,.4*fade);}
      if(s.id==='hundred-hex')for(const dx of [-90,90])sprite(ctx,fx['dot-wraith'],reduced?180:c.elapsed+dx,actor.x+dx,actor.y-164,145,370,.68*fade);
      if(!reduced){light(ctx,actor.x,actor.y-95,145+level*30,'#8351ce',.22*fade);for(let i=0;i<6+level*3;i++){const phase=((c.elapsed+i*97)%700)/700,side=i%2?1:-1;ImageEffects.mote(ctx,actor.x+side*(55+level*9+Math.sin(phase*5+i)*14),actor.y-phase*h*.8,12,i%3?'#b8fff2':'#efe1ff',.7*fade,c.elapsed+i*97);}}
    }
    let spectralBudget=28;
    for(const e of run.enemies.filter(e=>e.hp>0&&!e.bodyPart&&e.curse)){
      const c=e.curse,marks=ShamanCombat.marks(e,run.time),deep=c.deep;if(!marks.length&&!deep)continue;
      const body=Math.min(240,e.height||142),id=deep?.id,late=id==='life-erosion',h=Math.max(260,Math.min(430,body*1.7+80))+(late?35:0),w=Math.max(150,h*.63);
      const phase=reduced?180:run.time+e.x*2,pulse=reduced?0:Math.pow(Math.max(0,1-((run.time-(c.nextMark??deep?.next??run.time+1000)+1000)%1000)/350),2);
      sprite(ctx,fx.mark,phase,e.x,e.y-5,w+35,48+marks.length*4,.66+marks.length*.045);
      if(spectralBudget>0){sprite(ctx,fx['dot-wraith'],phase,e.x,e.y-h*.42,w,h,(deep?.74:.6)+pulse*.14);spectralBudget--;}
      if(deep){
        const kind=id==='life-erosion'?'life-vines':id==='grudge-ramp'?'ramp-skull':'grudge-flame';
        if(id==='grudge-ramp'){const growth=1+.07*Math.min(deep.stage-1,5);sprite(ctx,fx[kind],phase,e.x,e.y-body-32,90*growth,112*growth,.9);}
        else sprite(ctx,fx[kind],phase,e.x,e.y-h*.4,w*(late?1.4:1.25),h*(late?1.06:.94),late?.7:.64);
        if(late&&spectralBudget>0){sprite(ctx,fx['dot-wraith'],phase+220,e.x+52,e.y-h*.44,95,h*1.12,.68);spectralBudget--;}
        if(!reduced)light(ctx,e.x,e.y-30,80,late?'#43cbbb':'#9653cb',.13+pulse*.1);
      }
    }
  }
  function castOverlay(ctx,actor,run,fx,reduced=false){const c=actor.shamanCast;if(!c||c.spec.kind==='normal')return;const s=c.spec,q=Math.min(1,c.elapsed/s.release),t=reduced?180:c.elapsed;
    const r=110+tier(s.unlockLevel)*24+q*40;
    sprite(ctx,fx['amplify-ring'],t,actor.x,actor.y-90,r,r,.18+q*.2);
    if(s.consume){const target=c.target,age=Math.max(0,c.elapsed-s.release*.5);sprite(ctx,fx['curse-collapse'],age,target.x,target.y-85,(s.radius||100)*1.6,(s.radius||100)*1.45,.72*q);}
    if(s.id==='hundred-hex')sprite(ctx,fx['field-open'],t,c.target.x,c.target.y,s.radius*1.9*q,s.radius*.65*q,.72*q);
  }
  function projectiles(ctx,run,fx,reduced=false){for(const p of run.shamanProjectiles||[]){const target=run.enemies.find(e=>e.id===p.targetId),y=p.y-70,angle=target?Math.atan2(target.y-p.y,target.x-p.x):0;if(!reduced)for(let i=4;i>0;i--)sprite(ctx,fx['skull-bolt'],p.age-i*30,p.x-Math.cos(angle)*i*16,y-Math.sin(angle)*i*16,52,52,.35/i,angle);sprite(ctx,fx['skull-bolt'],reduced?180:p.age,p.x,y,52,52,1,angle);}}
  function impacts(ctx,events,time,fx,reduced=false){const seen=new Set();let budget=0;for(const e of events){if(e.type!=='shaman-effect')continue;const age=time-e.timeMs,life=['soul-pillar','grand-shatter'].includes(e.kind)?1000:700;if(age<0||age>=life)continue;const key=[e.kind,Math.round(e.x/24),Math.round(e.y/24),Math.floor(e.timeMs/50)].join(':');if(seen.has(key)||budget++>90)continue;seen.add(key);const level=e.level||ShamanSkills.ACTIVE.find(s=>s.id===e.skillId)?.unlockLevel||5,fade=Math.min(1,(life-age)/180),t=reduced?180:age,high=level>=85;
    if(['field-open','field-pulse','field-fade','grand-shatter'].includes(e.kind)){const r=e.radius||150;sprite(ctx,fx[e.kind],t,e.x,e.y,r*2.15,r*.85,fade*.95);if(e.kind==='grand-shatter'&&!reduced){light(ctx,e.x,e.y-80,360,'#ae6ee7',(.14+.4*Math.max(0,1-age/160))*fade);sparks(ctx,e.x,e.y-60,age,88,2.4,fade);}continue;}
    if(e.kind==='hundred-ghosts'){sprite(ctx,fx[e.kind],t,e.x,e.y-145,(e.radius||320)*2,(e.radius||320)*1.15,.72*fade);continue;}
    if(e.kind==='soul-pillar'){const r=e.radius||320;for(let i=0;i<7;i++){const offset=i-3,delay=Math.abs(offset)*55,at=Math.max(0,t-delay),h=offset===0?465:365-Math.abs(offset)*14;sprite(ctx,fx['soul-pillar'],at,e.x+offset*r*.23,e.y-h*.42,offset===0?290:205,h,fade*(offset===0?1:.78));}if(!reduced){light(ctx,e.x,e.y-180,320,'#b6fff4',(.12+.5*Math.max(0,1-age/140))*fade);sparks(ctx,e.x,e.y-100,age,88,2.5,fade);}continue;}
    if(e.from){const dx=e.x-e.from.x,dy=e.y-e.from.y,len=Math.hypot(dx,dy);sprite(ctx,fx[e.kind],t,(e.x+e.from.x)/2,(e.y+e.from.y)/2-65,e.kind==='curse-chain'?len:100,e.kind==='curse-chain'?68:100,fade,Math.atan2(dy,dx));}
    const size=e.kind==='curse-burst'?high?350:230:e.kind==='soul-lance'?280:e.kind==='bone-stake'?165:e.kind==='curse-spike'?150:e.kind==='mark-pulse'?145:level>=70?185:130;
    const tall=['grudge-flame','life-vines','frailty','bone-stake'].includes(e.kind),h=tall?size*1.5:size;
    const periodic=!e.skillId&&['mark-pulse','grudge-flame','ramp-skull','life-vines'].includes(e.kind);
    if(e.kind==='mark-pulse')sprite(ctx,fx[e.kind],t,e.x,e.y-15,size*1.12,size*.46,fade*.86);
    else sprite(ctx,fx[e.kind],t,e.x,e.y-(tall?h*.4:80),size,h,fade*(periodic?.54:.94));
    if(e.kind==='curse-burst'){sprite(ctx,fx['mark-fade'],t,e.x,e.y-85,size*1.3,size*.95,.85*fade);if(high){sprite(ctx,fx['grand-shatter'],t,e.x,e.y,size*1.85,size*.7,.82*fade);sprite(ctx,fx['hundred-ghosts'],t,e.x,e.y-115,size*1.4,size*1.1,.62*fade);}if(!reduced){sparks(ctx,e.x,e.y-85,age,high?70:28,high?1.9:1.4,fade);light(ctx,e.x,e.y-85,size*.65,'#bd71f2',.48*fade);}}
    else if(level>=70&&!reduced){sparks(ctx,e.x,e.y-75,age,18,1,fade);light(ctx,e.x,e.y-65,95,'#92f5d6',.26*fade);}
  }}
  function statuses(ctx,run,fx){const regions=[];for(const e of run.enemies.filter(e=>e.hp>0&&!e.bodyPart&&e.curse)){const c=e.curse,marks=ShamanCombat.marks(e,run.time),y=e.y-(e.height||142)-14,x=e.x;let label=[];
    if(marks.length){const remain=Math.max(...marks.map(m=>m.until-run.time))/1000;label.push('呪印 '+marks.length+'/5 · 残り '+remain.toFixed(1)+'秒 · 防御貫通 60%');for(let i=0;i<marks.length;i++){const a=-Math.PI/2+i*Math.PI*2/5,px=x+Math.cos(a)*39,py=e.y-13+Math.sin(a)*14;ImageEffects.mote(ctx,px,py,16,'#ecdcff',1,run.time+i*83);}}
    if(c.deep)label.push(({ 'grudge-flame':'怨火','grudge-ramp':'怨念蓄積','life-erosion':'命蝕'}[c.deep.id])+' · 残り '+Math.max(0,(c.deep.until-run.time)/1000).toFixed(1)+'秒 · 倍率 ×'+(c.deep.ramp?1+.2*Math.min(c.deep.stage-1,5):1).toFixed(2));
    for(const [kind,name] of [['defense','防御低下'],['attack','攻撃力低下'],['amplify','呪いDoT増幅'],['healing','回復量低下']]){const value=ShamanCombat.strongest(e,kind,run.time);if(value)label.push(name+' '+Math.round(value*100)+'%');}
    for(const d of c.extras)label.push((d.trigger==='hit'?'命中追撃':'被害追撃')+' · 残り '+d.remaining+'回 · '+Math.max(0,(d.until-run.time)/1000).toFixed(1)+'秒');if(!label.length)continue;
    const types=[...(marks.length?['mark']:[]),...(c.deep?[c.deep.id==='life-erosion'?'life-vines':c.deep.id==='grudge-ramp'?'ramp-skull':'grudge-flame']:[]),...(c.extras.length?['reaction-ring']:[]),...(c.debuffs.some(d=>d.kind==='defense')?['armor-crack']:[]),...(c.debuffs.some(d=>d.kind==='attack')?['frailty']:[]),...(c.debuffs.some(d=>d.kind==='amplify')?['amplify-ring']:[]),...(c.debuffs.some(d=>d.kind==='healing')?['healing-seal']:[])];
    const w=types.length*24;ctx.save();ctx.fillStyle='#211432eb';ctx.fillRect(x-w/2-3,y-13,w+6,27);types.forEach((id,i)=>sprite(ctx,fx[id],250,x-w/2+i*24+12,y,24,24,1));if(marks.length){ctx.font='bold 13px sans-serif';ctx.fillStyle='#fff1d1';ctx.strokeStyle='#261638';ctx.lineWidth=3;ctx.strokeText(marks.length,x-w/2+14,y+11);ctx.fillText(marks.length,x-w/2+14,y+11);}ctx.restore();regions.push({x:x-w/2-3,y:y-13,w:w+6,h:27,label:label.join('\n')});
  }return regions;}
  return {KINDS,load,sprite,fields,auras,castOverlay,projectiles,impacts,statuses};
})();
