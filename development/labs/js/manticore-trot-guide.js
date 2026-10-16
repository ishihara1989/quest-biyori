(async()=>{
  'use strict';
  const model=ManticoreTrotModel,c=structuredClone(model.config),$=s=>document.querySelector(s),base='/development/assets/highland-motions/';
  let playing=true,time=0,last=null,speed=1,overlay=true,manual=null;
  const measurements={};
  const json=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p+' '+r.status);return r.json();};
  const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
  async function asset(url){const m=await json(url),dir=url.slice(0,url.lastIndexOf('/')+1);return{m,images:await Promise.all(m.frames.map(f=>image(dir+f.file)))};}
  const old=await asset(base+'backups/manticore-trot-v1-20261013/enemies/manticore/motions/move/manifest.json');
  const revised=await asset(base+'trot-v2/motions/move/manifest.json');
  const mapping={x:310,y:329,eyeX:176,eyeY:414,scale:.339};
  const map=p=>({x:mapping.x+(p.x-mapping.eyeX)*mapping.scale-245,y:mapping.y+(p.y-mapping.eyeY)*mapping.scale-185});
  for(const [id,leg]of Object.entries(c.legs)){
    const node=document.createElement('div');node.className='leg';node.style.setProperty('--leg-color',leg.color);
    node.innerHTML='<h3><i style="background:'+leg.color+'"></i>'+leg.label+' <small>'+id+'</small></h3>';
    for(const [key,label,max]of [['amplitude','前後',120],['lift','高さ',150]]){
      const row=document.createElement('label');row.innerHTML='<span>'+label+'</span><input type="range" min="0" max="'+max+'" value="'+leg[key]+'" aria-label="'+leg.label+label+'"><output>'+leg[key]+'</output>';
      const input=row.querySelector('input');input.dataset.leg=id;input.dataset.param=key;
      input.addEventListener('input',()=>{leg[key]=Number(input.value);row.querySelector('output').value=input.value;draw();});node.append(row);
    }
    $('#legs').append(node);
  }
  for(let i=0;i<6;i++){const b=document.createElement('button');b.textContent=i+1;b.title='コマ'+(i+1);b.addEventListener('click',()=>{playing=false;manual=i;time=i*120;sync();draw();});$('#frames').append(b);}
  function sync(){$('#play').textContent=playing?'⏸':'▶';}
  function mark(ctx,pose,bones){
    for(const id of ['RF','RH','LF','LH']){
      const l=pose.legs[id],p=map(l.screen.paw);ctx.strokeStyle=l.color;ctx.fillStyle=l.color;ctx.lineWidth=bones?3:2;
      ctx.setLineDash(l.side==='far'?[5,4]:[]);
      if(bones){const r=map(l.screen.root),j=map(l.screen.joint),a=map(l.screen.ankle);ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(j.x,j.y);ctx.lineTo(a.x,a.y);ctx.stroke();}
      ctx.beginPath();ctx.ellipse(p.x,p.y-(l.side==='near'?9:7),l.side==='near'?16:12,l.side==='near'?9:7,0,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.arc(p.x,p.y,3,0,2*Math.PI);ctx.fill();
    }
  }
  function draw(){
    const index=manual??Math.floor((time%720)/120),pose=model.sample(manual===null?(time%720)/720:index/6,c),target=model.sample(index/6,c);
    for(const [id,a]of [['old',old],['new',revised]]){const ctx=$('#'+id).getContext('2d');ctx.clearRect(0,0,490,390);ctx.imageSmoothingEnabled=false;ctx.drawImage(a.images[index],245,185,490,390,0,0,490,390);if(id==='new'&&overlay)mark(ctx,target,false);}
    const ctx=$('#rig').getContext('2d');ctx.clearRect(0,0,490,390);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.15;ctx.drawImage(old.images[0],245,185,490,390,0,0,490,390);ctx.globalAlpha=1;mark(ctx,pose,true);
    [...$('#frames').children].forEach((b,i)=>b.classList.toggle('active',i===index));$('#phase').textContent=(index+1)+'/6 · '+old.m.frames[index].phase;
    $('#coordinates').innerHTML=Object.values(target.legs).map(l=>{const observed=measurements[index+1]?.[l.id],error=observed?Math.hypot(observed.x-l.screen.paw.x,observed.y-l.screen.paw.y):null;return'<span style="color:'+l.color+'">'+l.label+'<br>目標 ('+l.screen.paw.x.toFixed(1)+', '+l.screen.paw.y.toFixed(1)+') · '+(l.grounded?'接地':'浮く')+(observed?'<br>実測 ('+observed.x.toFixed(1)+', '+observed.y.toFixed(1)+') · 差 '+error.toFixed(1)+'px':'')+'</span>';}).join('');
    const nc=$('#new').getContext('2d');nc.strokeStyle='#ffffff';nc.lineWidth=2;for(const p of Object.values(measurements[index+1]||{})){const q=map(p);nc.beginPath();nc.moveTo(q.x-7,q.y);nc.lineTo(q.x+7,q.y);nc.moveTo(q.x,q.y-7);nc.lineTo(q.x,q.y+7);nc.stroke();}
  }
  $('#play').onclick=()=>{playing=!playing;manual=null;sync();};$('#step').onclick=()=>{manual=((manual??Math.floor((time%720)/120))+1)%6;playing=false;time=manual*120;sync();draw();};
  $('#speed').onchange=()=>{speed=Number($('#speed').value);};$('#overlay').onclick=()=>{overlay=!overlay;$('#overlay').setAttribute('aria-pressed',String(overlay));draw();};
  $('#reset').onclick=()=>{for(const [id,l]of Object.entries(model.config.legs)){Object.assign(c.legs[id],l);}document.querySelectorAll('#legs input').forEach(i=>{i.value=c.legs[i.dataset.leg][i.dataset.param];i.nextElementSibling.value=i.value;});draw();};
  $('#measure').onchange=()=>{$('#new').classList.toggle('measuring',$('#measure').checked);};
  $('#new').onclick=event=>{if(!$('#measure').checked)return;manual=manual??Math.floor((time%720)/120);playing=false;time=manual*120;sync();const rect=$('#new').getBoundingClientRect(),x=(event.clientX-rect.left)*490/rect.width,y=(event.clientY-rect.top)*390/rect.height;measurements[manual+1]??={};measurements[manual+1][$('#measure-leg').value]={x:(x+245-mapping.x)/mapping.scale+mapping.eyeX,y:(y+185-mapping.y)/mapping.scale+mapping.eyeY};draw();};
  $('#export').onclick=()=>{const blob=new Blob([JSON.stringify({config:c,frames:model.frames(c),measurements},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='manticore-trot-guide.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  function tick(now){const dt=last===null?0:Math.min(now-last,60);last=now;if(playing){time+=dt*speed;manual=null;}draw();requestAnimationFrame(tick);}
  window.manticoreTrotGuide={config:c,model,old,revised,draw,measurements};document.documentElement.dataset.ready='true';draw();requestAnimationFrame(tick);
})().catch(e=>{document.querySelector('#phase').textContent=e.message;console.error(e);});
