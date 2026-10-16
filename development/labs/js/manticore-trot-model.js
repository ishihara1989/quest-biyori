(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ManticoreTrotModel=factory();})(globalThis,function(){
  'use strict';
  const config={width:1375,height:1144,durationMs:720,origin:{x:620,y:1020},yawDeg:20,pitchDeg:13,
    legs:{
      LF:{label:'左前脚',side:'near',pair:'B',u:260,v:100,rootZ:385,upper:210,lower:210,bend:-1,amplitude:70,lift:76,color:'#ffca4c'},
      RF:{label:'右前脚',side:'far',pair:'A',u:260,v:-100,rootZ:385,upper:210,lower:210,bend:-1,amplitude:64,lift:64,color:'#66c6ff'},
      LH:{label:'左後脚',side:'near',pair:'A',u:-260,v:100,rootZ:340,upper:190,lower:190,bend:1,amplitude:64,lift:70,color:'#ff799c'},
      RH:{label:'右後脚',side:'far',pair:'B',u:-260,v:-100,rootZ:340,upper:190,lower:190,bend:1,amplitude:44,lift:60,color:'#80dfb5'}
    }};
  const mod=x=>(x%1+1)%1,rad=d=>d*Math.PI/180;
  function project(p,c=config){const yaw=rad(c.yawDeg),pitch=rad(c.pitchDeg);return{x:c.origin.x-Math.cos(yaw)*p.u+Math.sin(yaw)*p.v,y:c.origin.y+Math.sin(pitch)*(Math.sin(yaw)*p.u+Math.cos(yaw)*p.v)-Math.cos(pitch)*p.z};}
  function knee(root,ankle,leg){const du=ankle.u-root.u,dz=ankle.z-root.z,d=Math.hypot(du,dz);if(d>leg.upper+leg.lower||d<Math.abs(leg.upper-leg.lower))throw Error('Unreachable '+leg.label);const a=(leg.upper**2-leg.lower**2+d*d)/(2*d),h=Math.sqrt(Math.max(0,leg.upper**2-a*a));return{u:root.u+a*du/d+leg.bend*h*(-dz/d),v:root.v,z:root.z+a*dz/d+leg.bend*h*(du/d)};}
  function sample(time,c=config){
    const t=mod(time),legs={};
    for(const [id,leg]of Object.entries(c.legs)){
      const phase=mod(t+(leg.pair==='A'?.25:.75)),swing=phase<.5,p=swing?phase*2:(phase-.5)*2;
      // A continuous cosine orbit keeps forward motion symmetric around neutral.
      // Foot height is zero throughout stance and follows a sine arch during swing.
      const stride=-leg.amplitude*Math.cos(2*Math.PI*phase);
      const height=swing?leg.lift*Math.sin(Math.PI*p):0;
      const paw={u:leg.u+stride,v:leg.v,z:height},root={u:leg.u,v:leg.v,z:leg.rootZ},ankle={...paw,z:paw.z+48};
      const joint=knee(root,ankle,leg);
      legs[id]={id,label:leg.label,side:leg.side,pair:leg.pair,color:leg.color,grounded:!swing,progress:p,stride,height,
        world:{root,joint,ankle,paw},screen:{root:project(root,c),joint:project(joint,c),ankle:project(ankle,c),paw:project(paw,c)}};
    }
    return{time:t,legs};
  }
  const frames=(c=config)=>Array.from({length:6},(_,i)=>({index:i,time:i/6,durationMs:120,...sample(i/6,c)}));
  return{config,project,sample,frames};
});
