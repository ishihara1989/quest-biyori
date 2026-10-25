import {renderRegional} from './trial-regional-compositor.js';
// Material-only preview. No combat state, collision, damage or save access.
export function createCompositor(ctx, cache, plan) {
 const clips=new Map(plan.clips.map(c=>[c.id,c]));
 function resolved(id){const c=clips.get(id);return c?.kind==='reuse'&&c.reuse.source!=='current-body-frame'?resolved(c.reuse.source):cache.get(id);}
 function effect(id,t,x,y,size=160,angle=0,alpha=1,held=false){const m=resolved(id);if(!m||t<0||(!held&&t>=m.durationMs))return;const seq=m.frameSequence||m.frames.map((_,i)=>i);let at=held?Math.min(t,m.durationMs-1):t%m.durationMs,n=0,i=seq.at(-1);for(const k of seq){n+=m.frames[k].durationMs;if(at<n){i=k;break;}}const origin=m.origin||[256,256];ctx.save();ctx.translate(x,y);ctx.rotate(angle+(m.mountRotationRadians||0));ctx.globalAlpha=alpha;ctx.drawImage(m.images[i],-origin[0]*size/512,-origin[1]*size/512,size,size);ctx.restore();}
 function body(m,i,x,y,size,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(m.images[i],x-size/2,y-size*448/512,size,size);ctx.restore();}
 function anchor(m,i,name,fallback){return m.frames[i].measuredAnchors?.[name]||m.frames[i].plannedAnchors?.[name]||fallback;}
 function render(m,i,t,x=630,y=510,size=460,enabled=true){
  const spec=clips.get(m.id),s=size/512,bx=x,by=y;const stateAt=(ms)=>{let at=m.loop?Math.max(0,ms)%m.durationMs:Math.min(Math.max(0,ms),m.durationMs-1),sum=0;const seq=m.frameSequence;for(let n=0;n<seq.length;n++){const k=seq[n],d=m.frames[k].durationMs;if(at<sum+d){const a=spec?.frames?.[k]?.planned?.fieldOffset||[0,0],q=spec?.frames?.[seq[Math.min(n+1,seq.length-1)]]?.planned?.fieldOffset||a,r=(at-sum)/d;return {index:k,off:[a[0]+(q[0]-a[0])*r,a[1]+(q[1]-a[1])*r]};}sum+=d;}return {index:i,off:[0,0]};};const off=stateAt(t).off;x+=off[0]*s;y+=off[1]*s;
  const point=p=>[x+(p[0]-256)*s,y+(p[1]-448)*s],at=(name,fallback)=>point(anchor(m,i,name,fallback));
  const muzzle=at('muzzle',[155,250]),main=at('mainEmitter',[190,235]),secondary=at('offEmitter',[190,235]);
  const framePoint=(frame,name,fallback,releaseTime)=>{const state=releaseTime===undefined?null:stateAt(releaseTime),k=state?.index??frame,p=anchor(m,k,name,fallback),o=state?.off||spec?.frames?.[k]?.planned?.fieldOffset||[0,0];return [bx+(o[0]+p[0]-256)*s,by+(o[1]+p[1]-448)*s];};
  const previous=(delay)=>{let sum=0;const at=Math.max(0,t-delay);for(const k of m.frameSequence){sum+=m.frames[k].durationMs;if(at<sum)return k;}return m.frames.length-1;};
  const e=(id,phase,xy,sz=180,a=0,alpha=1,hold=false)=>effect(id,phase,xy[0],xy[1],sz*s,a,alpha,hold);
  if(enabled&&/^(G03|G07|G08|G10|SR-S1|FC-S1)$/.test(m.id)){for(const[d,a]of [[80,.22],[150,.1]]){const past=stateAt(Math.max(0,t-d)),k=past.index,o=past.off;body(m,k,bx+o[0]*s,by+o[1]*s,size,a);}}
  if(enabled&&/M01$/.test(m.id))e('CF01-open',t,[x,y-size*.36],size*.9,0,.6,true);
  if(enabled&&m.id==='G01')e('OG-F1',t,[x,y-size*.55],size*.6,0,.65,true);
  body(m,i,x,y,size);
  if(!enabled)return;
  if(/M03$/.test(m.id))e('CF06-hit',t,muzzle,90);
  if(/M04$/.test(m.id))e('CF06-interrupt',t,[x,y-size*.52],130);
  if(/M05$/.test(m.id))e('CF08',t-m.durationMs*.25,[x,y-size*.44],150);
  if(m.id.startsWith('G')){
   if(['G03','G07','G08','G11'].includes(m.id))e('OG-F2',t%240,[x+size*.19,y-size*.33],125,0,.8);
   if(m.id==='G04'){
    const angles=[1.35,.1,-.65,Math.PI,0,-1];
    if(i<=2)e('OG-F10a',i===0?t:230,main,205,angles[i],1,true);
    if(i===1||i===2)e('OG-F4a',(t%160),[main[0]-45*s,main[1]+35*s],230,-.15);
    if(i===3||i===4)e('OG-F10a',i===3?t%230:230,secondary,190,angles[i],1,true);
    if(i===4)e('OG-F4b',t%240,[secondary[0]-55*s,secondary[1]],220);
    if(i===5)e('OG-F10b',t%240,main,75);
   }else if(['G05','G08'].includes(m.id)){
    if(i===0)e('OG-F5a',t,secondary,65,0,1,true);
    if(i===1||i===2){e('OG-F5b',120,secondary,500,0,1,true);e('OG-F5c',t%240,[secondary[0]-350*s,secondary[1]],100);}
   }else if(['G06','G07'].includes(m.id)){
    if(i<3)e('OG-F10a',230,main,210,i===0?1.2:0,1,true);
    if(i===2||i===3)e(m.id==='G06'?'OG-F6':'OG-F7',t%240,[main[0]-70*s,main[1]],290);
   }else if(['G09','G10'].includes(m.id)){
    const nodes=m.frames[i].measuredAnchors?.ringNodes||m.frames[i].plannedAnchors?.ringNodes||[[244,80],[190,148],[332,150]];
    for(const[k,p]of nodes.entries()){const xy=point(p);if((m.id==='G09'&&i===k+2)||(m.id==='G10'&&i===7)){e('OG-F5b',120,xy,500,[-.18,0,.18][k],1,true);}else if(i<2)e('OG-F5a',t%240,xy,65);}
    if(m.id==='G10'&&i===5){e('OG-F9a',t%240,[main[0]-60*s,main[1]+50*s],300);e('OG-F9b',t%240,[x-70*s,y],280);}
    if(i>=m.frames.length-2)e('OG-F8',t%240,[x,y-size*.65],180,0,.6);
   }else if(m.id==='G12')e('CF06-hit',t,[x,y-size*.5],90);
   else if(m.id==='G13')e('OG-F10b',t,[x,y-size*.5],120);
   else if(m.id==='G14')e('OG-F1',Math.max(0,230-t%240),[x,y-size*.6],250,0,.65,true);
   return;
  }
  const [prefix,action]=m.id.split('-');
  renderRegional({prefix,action,m,i,t,x,y,s,point,at,e,framePoint,baseX:bx,baseY:by});
 }
 return {render,effect,body};
}
