// Image-only material timing. Positions without observations are composition guides.
export function renderRegional(v){
 const {prefix,action,m,i,t,x,y,s,point,at,e,framePoint,baseX,baseY}=v;
 if(!['N1','N2','S1'].includes(action))return;
 const f=(group,part)=>`${prefix}-F${group}-p${part}`;
 const start=k=>m.frames.slice(0,k).reduce((n,a)=>n+a.durationMs,0),fireIndex=(prefix==='AM'&&action==='N2')?3:(prefix==='RT'&&action==='S1')?3:(prefix==='AM'&&action==='S1')?2:action==='S1'?Math.floor(m.frames.length/2):2,fire=start(fireIndex),dt=t-fire;
 const port=(name,p)=>at(name,p),target=p=>[p[0]-320*s,p[1]],ground=point([256,448]);
 const flash=(id,phase,p,size=110)=>e(id,phase,p,size);
 const charge=(id,p,size=100)=>{if(t<fire)e(id,Math.min(t,210),p,size,0,1,true);};
 const beam=(id,p,q=target(p),phase=120)=>{const dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy);e(id,phase,p,length/s*512/400,Math.atan2(dy,dx)-Math.PI,1,true);};
 function projectile({sprite,trail,hit,shell,count=1,ports=[[155,280]],stagger=100,drop=false,mine=false,arm,arc=70,build=false,rotation=false,names=[],releaseFrames}){
  if(build&&i===1&&t<fire){const p=port('palm',[175,235]);e(sprite,t%240,p,75,0,1,true);if(trail)e(trail,t%240,[p[0],p[1]+18*s],65);}
  for(let k=0;k<count;k++){
   const release=releaseFrames?start(releaseFrames[k]):fire+k*stagger,local=ports[k%ports.length],from=framePoint(releaseFrames?.[k]??fireIndex,names[k%names.length]||'launch'+k,local,release),to=[baseX-330*s+k*65*s,drop||mine?baseY:from[1]+(k-(count-1)/2)*38*s],d=t-release,flight=260;
   if(d<0)continue;
   if(d<flight){const q=d/flight,p=[from[0]+(to[0]-from[0])*q,from[1]+(to[1]-from[1])*(drop?q*q:q)-(drop?0:arc*s*Math.sin(Math.PI*q))];if(trail)e(trail,d%240,[p[0]+(rotation?0:20*s),p[1]],rotation?95:90,rotation?d/120:0,.7);e(sprite,d%240,p,75,0,1,true);}
   else {const after=d-flight,hold=mine?430:0;if(mine&&after<hold){e(sprite,after%240,to,75,0,1,true);if(arm&&after>hold-220)e(arm,after-(hold-220),to,100);}
    if(after>=hold){if(shell)flash(shell,after-hold,to,130);flash(hit,after-hold-(shell?60:0),to,155);}}
  }
 }
 if(prefix==='RT'){
  if(action==='N1'){if(dt>=0)flash(f(1,2),dt,port('muzzle',[95,285]),100);projectile({sprite:f(1,1),hit:f(1,3),ports:[[95,285]],names:['muzzle']});}
  else if(action==='N2'){const p=port('cheek',[130,270]);if(dt>=0&&dt<350){e(f(2,1),120,p,260,0,1,true);e(f(2,2),dt%240,[p[0]-95*s,p[1]],160);}if(dt>=200)flash(f(2,3),dt-200,port('tankVent',[350,230]),100);}
  else {if(i===2||i===3)e(f(3,1),t%240,port('belly',[256,385]),110);projectile({sprite:f(3,2),hit:f(3,3),count:3,ports:[[256,385]],stagger:80,drop:true});if(i>=5)flash(f(3,4),t-start(5),ground,230);}
 }else if(prefix==='DM'){
  if(action==='N1'){for(const[k,frame]of[1,3].entries()){const d=t-start(frame),p=port(k?'farClaw':'nearClaw',k?[135,410]:[165,420]);if(d>=0&&d<180)e(f(1,1),k?100:10,p,230,0,1,true);flash(f(1,2),d+10,p,90);flash(f(1,3),d-70,p,100);}}
  else if(action==='N2'){const p=[x-220*s,ground[1]];if(dt>=0&&dt<240)e(f(2,1),Math.min(dt,210),[x-40*s,ground[1]-4*s],320,0,1,true);flash(f(2,2),dt-180,p,240);flash(f(2,3),dt-300,p,200);}
  else {if(i<=3)e(f(3,1),t%240,port('drill',[90,325]),170);if(i===2||i===3)e(f(3,2),t%240,port('rearVent',[370,300]),140);if(i>=4)for(const p of [[150,435],[220,440]])flash(f(3,3),t-start(4),point(p),95);}
 }else if(prefix==='SM'){
  if(action==='N1'){for(const p of [[160,380],[280,410]])charge(f(1,1),point(p),65);if(dt>=0&&dt<250)for(const p of [[160,380],[280,410]])beam('CF04-cyan-ray',point(p));for(const p of [[160,380],[280,410]])flash(f(1,3),dt-180,target(point(p)),90);}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),arm:f(2,3),hit:f(2,4),count:2,ports:[[230,315],[280,325]],mine:true,stagger:130,releaseFrames:[1,2],arc:25});
  else {if(i===1||i===2||i===3)e(f(3,1),120,port('wingEdge',[160,320]),230,-.2,1,true);if(i===2||i===3)e(f(3,2),t%240,[x+30*s,y-180*s],280);if(i<4)e(f(3,3),t%240,port('tail',[380,180]),120);}
 }else if(prefix==='AM'){
  if(action==='N1'){for(const p of [[155,165],[155,285]])charge(f(1,1),point(p),100);projectile({sprite:f(1,2),hit:f(1,3),count:2,ports:[[155,165],[155,285]],stagger:140,arc:0});}
  else if(action==='N2'){const p=point([256,235]);if(t<fire)e(f(2,1),Math.min(t,210),p,260,0,.65,true);if(dt>=0&&dt<400)e(f(2,2),120,p,270,0,.6,true);flash(f(2,3),dt-350,p,240);}
  else {const local=m.frames[i].measuredAnchors?.tabletCenters||[[180,95],[345,95],[180,270],[345,270]],p=local.map(point),cross=point([30,285]);for(const a of p)charge(f(3,1),a,75);const phase=i===2?0:i===4?1:-1;if(phase>=0){for(const k of phase?[1,2]:[0,3])beam('CF04-cyan-ray',p[k],cross);e(f(3,3),t%240,cross,90);}}
 }else if(prefix==='SS'){
  if(action==='N1'){const p=port('solarLens',[250,150]);charge(f(1,1),p,210);if(dt>=0&&dt<220)beam(f(1,2),p);flash(f(1,3),dt-180,point([305,160]),110);}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),hit:f(2,3),count:2,ports:[[335,265]],stagger:120,arc:45,rotation:true});
  else {if(i<=3)e(f(3,1),t%240,point([165,300]),210);if(i===2||i===3)e(f(3,2),t%240,point([365,420]),190);if(i===3)flash(f(3,3),t-start(3),point([115,330]),170);if(i>=4)flash('CF09',t-start(4),ground,160);}
 }else if(prefix==='SR'){
  if(action==='N1'){for(const p of [[100,160],[360,120]])charge(f(1,1),point(p),65);projectile({sprite:f(1,2),hit:f(1,3),count:2,ports:[[100,160],[360,120]],stagger:120,arc:0});}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),hit:f(2,3),count:3,ports:[[260,260],[300,260],[330,280]],stagger:100,arc:30});
  else {if(i===4||i===5)e(f(3,1),120,point([230,255]),280,-.5,1,true);if(i>=6)flash(f(3,3),t-start(6),point([256,400]),250);}
 }else if(prefix==='CJ'){
  if(action==='N1'){charge(f(1,1),point([250,200]),110);const p=port('lens',[135,340]);if(dt>=0&&dt<250)beam('CF04-cyan-ray',p);flash(f(1,3),dt-180,target(p),100);}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),shell:f(2,3),hit:f(2,4),count:2,ports:[[245,300],[275,300]],stagger:120,drop:true});
  else {const p=point([256,240]);charge(f(3,1),p,220);flash(f(3,2),dt,p,400);flash(f(3,3),dt-180,p,360);}
 }else if(prefix==='FC'){
  if(action==='N1'){const centers=m.frames[i].plannedAnchors?.segmentCenters;for(const[k,n]of [17,13,9,5,2].entries()){const p=centers?.[n];if(p&&t<fire&&t>k*100)e(f(1,1),Math.min(t-k*100,210),point(p),65,0,.7,true);}const p=port('mouth',[80,330]);if(dt>=0&&dt<350)beam(f(1,2),p);flash(f(1,3),dt-250,point([160,310]),110);}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),shell:f(2,3),hit:f(2,4),count:3,ports:[[330,110],[305,100],[280,80]],stagger:140,releaseFrames:[2,3,4],arc:75});
  else {if(i>0&&i<6)for(const[k,p]of [[310,155],[335,185],[360,220]].entries())if(t>k*80)e(f(3,1),(t-k*80)%240,point(p),100);if(i===4)flash(f(3,3),t-start(4),point([75,330]),180);if(i>=6)flash('CF09',t-start(6),ground,170);}
 }else if(prefix==='TQ'){
  if(action==='N1'){for(const p of [[220,105],[300,105]])charge(f(1,1),point(p),65);for(const[k,p]of [[220,105],[300,105]].entries()){const d=dt-k*120;if(d>=0&&d<120)beam(f(1,2),point(p));flash(f(1,3),d-100,target(point(p)),90);}}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),hit:f(2,3),ports:[[175,235]],build:true,arc:65});
  else {for(const p of [[200,170],[310,170]])charge(f(3,1),point(p),75);if(i===3||i===4)e(f(3,2),i===3?10:90,point([240,170]),500,0,1,true);if(i>=5)flash(f(3,3),t-start(5),point([256,200]),270);}
 }else if(prefix==='ST'){
  if(action==='N1'){const p=port('antlerCenter',[235,150]);charge(f(1,1),p,240);if(dt>=0&&dt<170)e(f(1,2),120,p,480,0,1,true);flash(f(1,3),dt-140,target(p),120);}
  else if(action==='N2')projectile({sprite:f(2,1),trail:f(2,2),hit:f(2,3),ports:[[220,145]],arc:75});
  else {if(i<4)e(f(3,1),t%240,point([180,210]),240);if(i===2||i===3){e(f(3,2),t%240,point([350,415]),130);e(f(3,3),t%240,point([250,200]),260);}if(i>=4)flash('CF09',t-start(4),ground,150);}
 }
}
