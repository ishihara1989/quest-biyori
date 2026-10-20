const root='/development/assets/reincarnation-goddess/arsenal-v1/', basic='/development/assets/reincarnation-goddess/basic-v1/motions/';
const $=s=>document.querySelector(s),clips=new Map(),catalog=[];
const state={playing:true,speed:1,scene:'truck-rush',time:0,clipTime:0,clip:null,background:'dark',ranges:true,drawn:[]};
const durations={pulse:3300,laser:3500,missiles:4200,discs:3900,orbital:3500,'truck-rush':6500,'truck-cancel':5700,return:3300};
const parameters={pulse:'扇 48° / 距離 500 / 6発 / 1人3発まで',laser:'直線 1100 × 64 / 予告 1.5秒 / 貫通1回',missiles:'対象 3 / 着弾半径 64 / 時間差 0.18秒',discs:'往復 640 × 220 / 行き1回＋帰り1回 / 減速 −20%・1.2秒',orbital:'円 半径100 / 予告1.4秒 / 単発','truck-rush':'乗車 → 企み顔で待機 → （＞v＜）で突進 / 衝突1回','truck-cancel':'企み待機 → 妨害 → 涙目 → 回収 / 爆発の味方被害 0',return:'振り返り → ゲートへ → 本体消失 → 閉口 / 2400msで背景のみ'};
async function json(url){const r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);return r.json();}
async function load(id,url,pivot){const m=await json(url),dir=url.slice(0,url.lastIndexOf('/')+1);const images=await Promise.all(m.frames.map(async f=>{const im=new Image();im.src=dir+f.file;await im.decode();return im;}));const c={...m,id,images,pivot:pivot||m.pivot};clips.set(id,c);return c;}
function frame(c,t){let v=Math.max(0,t);if(c.loop)v%=c.durationMs;for(let i=0;i<c.frames.length;i++){v-=c.frames[i].durationMs;if(v<0)return i;}return c.frames.length-1;}
function background(ctx,w,h){ctx.clearRect(0,0,w,h);if(state.background==='checker'){for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){ctx.fillStyle=((x+y)/32)%2?'#a4a5af':'#c9cad1';ctx.fillRect(x,y,32,32);}}else{ctx.fillStyle=state.background==='light'?'#e3dfd2':'#25283e';ctx.fillRect(0,0,w,h);}}
function draw(ctx,id,t,x,y,scale=1,alpha=1,angle=0,sy=scale,index=null){if(alpha<=0)return;const c=clips.get(id);ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,sy);ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.imageSmoothingEnabled=false;ctx.drawImage(c.images[index===null?frame(c,t):index],-c.pivot.x,-c.pivot.y);ctx.restore();state.drawn.push(id);}
function phase(text){$('#phase').textContent=text;}
function danger(ctx,id){if(!state.ranges)return;ctx.save();ctx.strokeStyle='#ffba76';ctx.fillStyle='#ff925c24';ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.beginPath();if(id==='pulse'){ctx.moveTo(877,359);ctx.arc(877,359,500,Math.PI-.42,Math.PI+.42);ctx.closePath();}else if(id==='laser'){ctx.rect(0,290,780,64);}else if(id==='missiles'){for(const [x,y]of [[270,480],[440,400],[600,540]]){ctx.moveTo(x+64,y);ctx.arc(x,y,64,0,Math.PI*2);}}else if(id==='discs'){ctx.ellipse(570,450,320,110,0,0,Math.PI*2);}else if(id==='orbital'){ctx.arc(450,500,100,0,Math.PI*2);}else ctx.rect(0,460,1280,160);ctx.fill();ctx.stroke();ctx.restore();}
function targets(ctx){ctx.save();ctx.strokeStyle=state.background==='light'?'#66718d':'#8b97b3';ctx.lineWidth=2;ctx.setLineDash([4,5]);for(const[x,y]of [[270,480],[440,400],[600,540]]){ctx.strokeRect(x-18,y-36,36,56);}ctx.restore();}
function normal(ctx,id,t){const fire={pulse:1000,laser:1800,missiles:1300,discs:1200,orbital:1700}[id];targets(ctx);if(t>200&&t<fire)danger(ctx,id);
if(t<380)draw(ctx,'fx-summon',t,1030,400,1.1);
if(t<180||t>fire+420)draw(ctx,'idle',t,1050,390);else draw(ctx,'body-'+id,0,1050,390,1,1,0,1,t<fire?0:t<fire+120?1:2);
phase(t<fire?'召喚・予告':t<fire+420?'発射・リアクション':'攻撃・復帰');
if(id==='pulse'){for(let i=0;i<6;i++){const elapsed=t-fire-i*100;if(elapsed>=0&&elapsed<440){const a=Math.PI+[-.42,0,.42][i%3],p=elapsed/440;draw(ctx,'fx-pulse',elapsed,877+Math.cos(a)*500*p,359+Math.sin(a)*500*p,.23,1,a-Math.PI);}if(elapsed>=440&&elapsed<820){const a=Math.PI+[-.42,0,.42][i%3];draw(ctx,'fx-impact',elapsed-440,877+Math.cos(a)*500,359+Math.sin(a)*500,.25,1-(elapsed-440)/380);}}}
if(id==='laser'&&t>=fire&&t<fire+380)draw(ctx,'fx-beam',t-fire,448,322,1.65,1,0,.65);
if(id==='missiles'){const dest=[[270,480],[440,400],[600,540]];dest.forEach(([tx,ty],i)=>{const elapsed=t-fire-i*180,p=elapsed/1100;if(p>=0&&p<1){const sx=i%2?1140:950,sy=270,cx=(sx+tx)/2,cy=80,x=(1-p)*(1-p)*sx+2*(1-p)*p*cx+p*p*tx,y=(1-p)*(1-p)*sy+2*(1-p)*p*cy+p*p*ty,dx=2*(1-p)*(cx-sx)+2*p*(tx-cx),dy=2*(1-p)*(cy-sy)+2*p*(ty-cy);draw(ctx,'fx-missile',elapsed,x,y,.22,1,Math.atan2(dy,dx)-Math.PI);}if(elapsed>=1100&&elapsed<1480)draw(ctx,'fx-impact',elapsed-1100,tx,ty,.45,1-(elapsed-1100)/380);});}
if(id==='discs'){const e=t-fire-420,p=e/1400;if(p>=0&&p<1){const theta=p*Math.PI*2;draw(ctx,'fx-disc',e,570+320*Math.cos(theta),450-110*Math.sin(theta),.27);} }
if(id==='orbital'&&t>=fire&&t<fire+500)draw(ctx,'fx-orbital',Math.min(379,t-fire),450,500,1.1,1-(Math.max(0,t-fire-380)/120));
}
function truck(ctx,t,cancel){targets(ctx);const hit=2450,launch=4060;
if(t<760){draw(ctx,'truck-mount',t,850,600,1.65);if(t<380)draw(ctx,'fx-summon',t,850,400,1.4);phase('乗車');return;}
if(t<(cancel?hit:launch)){danger(ctx,'truck');draw(ctx,'fx-truck',t,1060,600,.5,.7);draw(ctx,'truck-wait',t-760,850,600,1.65);phase('企み顔で発進待機');return;}
if(cancel){if(t<hit+760){draw(ctx,'truck-interrupt',t-hit,850,600,1.65);phase('妨害・涙目');}else if(t<hit+1140){if(t<hit+850)draw(ctx,'truck-interrupt',759,850,600,1.65);draw(ctx,'fx-blast',t-hit-760,800,440,1.4);phase('ギャグ爆発・車両回収');}else{draw(ctx,'hit',t-hit-1140,980,400);if(t<hit+1500)draw(ctx,'fx-truck',t-hit-1140,880,550,1,1-(t-hit-1140)/360);phase('涙目の隙');}return;}
if(t<launch+650){const p=(t-launch)/650,x=850-p*1550;draw(ctx,'fx-truck',t-launch,x+330,600,.75);draw(ctx,'truck-rush',t-launch,x,600,1.65);phase('（＞v＜）突進');}else{const p=Math.min(1,(t-launch-650)/1000);draw(ctx,p<1?'move':'idle',t,350+p*700,390);phase('車両回収・浮遊で復帰');}
}
function leave(ctx,t){phase(t<600?'ゲート開口・振り返り':t<1800?'ゲートへ帰還':t<2400?'ゲート閉口':'帰還完了');
if(t>=2400)return;if(t<600)draw(ctx,'fx-gate-open',t,1030,270,1.15);else if(t<1800)draw(ctx,'fx-gate-open',599,1030,270,1.15);else draw(ctx,'fx-gate-close',t-1800,1030,270,1.15,Math.min(1,(2400-t)/180));
const p=Math.max(0,Math.min(1,(t-600)/1200)),alpha=t<1400?1:Math.max(0,(1800-t)/400);if(alpha>0)draw(ctx,'return',Math.min(t,1319),850+p*180,430-p*160,1,alpha);
}
function renderScene(){const ctx=$('#stage').getContext('2d');background(ctx,1280,720);state.drawn=[];if(state.scene==='return')leave(ctx,state.time);else if(state.scene.startsWith('truck'))truck(ctx,state.time,state.scene==='truck-cancel');else normal(ctx,state.scene,state.time);$('#timeline').value=String(Math.min(state.time,durations[state.scene]));$('#time').value=Math.round(state.time)+' ms';return [...state.drawn];}
function renderClip(){const c=state.clip,ctx=$('#clip-canvas').getContext('2d');background(ctx,512,512);ctx.imageSmoothingEnabled=false;const i=frame(c,state.clipTime);ctx.drawImage(c.images[i],0,0);$('#counter').value='F'+(i+1)+' / '+c.frames.length;$('#counter').dataset.frame=String(i);}
function syncScene(){state.time=0;$('#timeline').max=String(durations[state.scene]);$('#parameters').textContent=parameters[state.scene];}
function pause(){state.playing=false;$('#play').textContent='再生';}
function pickClip(id){state.clip=clips.get(id);state.clipTime=0;$('#contact').replaceChildren();state.clip.images.forEach((im,i)=>{const b=document.createElement('button'),img=im.cloneNode(),label=document.createElement('span');img.alt=state.clip.label+' F'+(i+1);label.textContent='F'+(i+1)+' · '+state.clip.frames[i].durationMs+' ms';b.append(img,label);b.title='このコマを表示';b.addEventListener('click',()=>{pause();state.clipTime=state.clip.frames.slice(0,i).reduce((s,f)=>s+f.durationMs,0);renderClip();});$('#contact').append(b);});renderClip();}
function allFrames(c){const group=document.createElement('section');group.className='frame-group';const h=document.createElement('h3');h.textContent=c.label;const grid=document.createElement('div');grid.className='frame-grid';c.images.forEach((im,i)=>{const b=document.createElement('button');b.className='frame-button';const image=im.cloneNode();image.alt=c.label+' F'+(i+1);b.append(image);b.title=c.label+' F'+(i+1);b.addEventListener('click',()=>{$('#clip').value=c.id;pickClip(c.id);pause();state.clipTime=c.frames.slice(0,i).reduce((s,f)=>s+f.durationMs,0);renderClip();$('.single-panel').scrollIntoView({behavior:'smooth',block:'center'});});grid.append(b);});group.append(h,grid);$('#all-frames').append(group);}
async function start(){const index=await json(root+'clips/index.json');for(const entry of index){const c=await load(entry.id,root+'clips/'+entry.manifest);catalog.push(c);const o=document.createElement('option');o.value=c.id;o.textContent=c.label;$('#clip').append(o);allFrames(c);}
for(const id of ['idle','move','hit','return'])await load(id,basic+id+'/manifest.json',{x:248,y:257});
pickClip('truck-wait');$('#clip').value='truck-wait';syncScene();$('#status').textContent='20素材 · 新規60コマ';document.body.dataset.ready='true';
window.reincarnationArsenalReview={catalog,renderAt(id,time){pause();state.scene=id;$('#scene').value=id;syncScene();state.time=time;return {drawn:renderScene(),time};},renderClipAt(id,time){pause();$('#clip').value=id;pickClip(id);state.clipTime=time;renderClip();},get snapshot(){return {scene:state.scene,time:state.time,playing:state.playing,drawn:[...state.drawn]};},background};
let previous;function tick(now){const dt=previous===undefined?0:Math.min(100,now-previous)*state.speed;previous=now;if(state.playing){state.time=(state.time+dt)%durations[state.scene];state.clipTime=(state.clipTime+dt)%(state.clip.durationMs+(state.clip.loop?0:500));}renderScene();renderClip();requestAnimationFrame(tick);}requestAnimationFrame(tick);}
$('#play').addEventListener('click',()=>{state.playing=!state.playing;$('#play').textContent=state.playing?'停止':'再生';});
$('#restart').addEventListener('click',()=>{state.time=state.clipTime=0;renderScene();renderClip();});
$('#scene').addEventListener('change',e=>{state.scene=e.target.value;syncScene();renderScene();});
$('#clip').addEventListener('change',e=>pickClip(e.target.value));
$('#speed').addEventListener('change',e=>state.speed=Number(e.target.value));
$('#background').addEventListener('change',e=>{state.background=e.target.value;document.body.dataset.background=state.background;renderScene();renderClip();});
$('#ranges').addEventListener('change',e=>{state.ranges=e.target.checked;renderScene();});
$('#timeline').addEventListener('input',e=>{pause();state.time=Number(e.target.value);renderScene();});
$('#step').addEventListener('click',()=>{pause();const c=state.clip,i=(frame(c,state.clipTime)+1)%c.frames.length;state.clipTime=c.frames.slice(0,i).reduce((s,f)=>s+f.durationMs,0);renderClip();});
start().catch(e=>{document.body.dataset.ready='error';$('#status').textContent=e.message;console.error(e);});
