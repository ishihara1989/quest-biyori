'use strict';
(async()=>{
 const ids=['aura','ring','mote','streak','lightning','portal'],rows=[],seen=Object.fromEntries(ids.map(id=>[id,new Set()]));
 let playing=true,time=0,last,speed=1;
 const draw=(ctx,id,clock)=>{ctx.clearRect(0,0,256,240);const h=id==='streak'?55:id==='lightning'?110:210;ImageEffects.sprite(ctx,id,clock,128,120,210,h);};
 try{
  await ImageEffects.load();
  for(const id of ids){const row=document.createElement('div');row.className='row';row.innerHTML='<strong>'+id+'</strong>';for(let i=0;i<5;i++){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=240;canvas.dataset.effect=id;canvas.dataset.frame=i<4?i:'live';row.append(canvas);if(i<4)draw(canvas.getContext('2d'),id,i*140);else rows.push({id,ctx:canvas.getContext('2d')});}document.querySelector('#gallery').append(row);}
  const scene=document.querySelector('#scene').getContext('2d');
  function render(){for(const row of rows){draw(row.ctx,row.id,time);seen[row.id].add(Math.floor(time/140)%4);}
   scene.clearRect(0,0,1024,576);
   ImageEffects.glow(scene,160,135,105,'#a682ff',.55,time);ImageEffects.ring(scene,time,160,220,115,36,'#9ae8ff',.9);
   ImageEffects.arc(scene,time,440,180,110,65,Math.PI,Math.PI*2,'#ffe49b',.9,24);
   ImageEffects.link(scene,{x:320,y:250},{x:610,y:120},'#a6ffc8',1,32,time);
   ImageEffects.link(scene,{x:340,y:340},{x:635,y:360},'#d1acff',1,80,time,'lightning');
   ImageEffects.sprite(scene,'portal',time,825,170,190,300);
   ImageEffects.burst(scene,820,430,time,32,['#ffe8ad','#b3e4ff','#c9acff'],1.2,.85);
   document.querySelector('#time').value=Math.floor(time);document.querySelector('#clock').value=Math.floor(time)+'ms';
  }
  document.querySelector('#play').disabled=false;
  document.querySelector('#play').onclick=()=>{playing=!playing;last=undefined;document.querySelector('#play').textContent=playing?'一時停止':'再生';};
  document.querySelector('#speed').onchange=e=>{speed=Number(e.target.value);};document.querySelector('#background').onchange=e=>{document.body.dataset.background=e.target.value;};
  document.querySelector('#time').oninput=e=>{playing=false;time=Number(e.target.value);document.querySelector('#play').textContent='再生';render();};
  window.effectReview={seen,seek:value=>{time=value;render();}};
  function tick(now){if(playing)time=(time+(last==null?0:Math.min(100,now-last))*speed)%560;last=now;render();requestAnimationFrame(tick);}requestAnimationFrame(tick);
 }catch(e){document.querySelector('#error').textContent=e.stack;throw e;}
})();
