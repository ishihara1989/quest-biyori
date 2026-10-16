'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{PNG}=require('pngjs');
const root=path.resolve(__dirname,'..'),base=path.join(root,'public/assets/effects/common'),index=JSON.parse(fs.readFileSync(path.join(base,'index.json')));
test('all generated frames are registered, distinct, transparent and padded',()=>{
 assert.equal(index.assets.length,6);
 for(const entry of index.assets){const m=JSON.parse(fs.readFileSync(path.join(base,entry.manifest))),im=PNG.sync.read(fs.readFileSync(path.join(base,m.sheet))),hashes=new Set();assert.equal(m.frames.length,4);assert.equal(m.frames.reduce((n,f)=>n+f.durationMs,0),m.durationMs);
  for(const f of m.frames){assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=im.width&&f.y+f.height<=im.height);let visible=0;const pixels=[];for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){const n=((f.y+y)*im.width+f.x+x)*4,a=im.data[n+3];if(x<3||y<3||x>=f.width-3||y>=f.height-3)assert.equal(a,0,entry.id+' padding');if(a>32)visible++;pixels.push(...im.data.subarray(n,n+4));}assert.ok(visible>15,entry.id+' visible');hashes.add(crypto.createHash('sha256').update(Buffer.from(pixels)).digest('hex'));}
  assert.equal(hashes.size,4,entry.id+' animation');
 }
});
function harness(fail=false){const requests=[],draws=[];let failures=fail?1:0;const context={window:{},fetch:async url=>{requests.push(url);if(failures-->0)return{ok:false};return{ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'public',url.replace(/^\//,''))))};},Image:class{async decode(){const im=PNG.sync.read(fs.readFileSync(path.join(root,'public',this.src.replace(/^\//,''))));this.width=im.width;this.height=im.height;}},OffscreenCanvas:class{constructor(w,h){this.width=w;this.height=h;}getContext(){return{drawImage(){},fillRect(){}};}}};vm.runInNewContext(fs.readFileSync(path.join(root,'public/js/render/image-effects.js'),'utf8'),context);const ctx={globalAlpha:.5,save(){this.saved=this.globalAlpha;},restore(){this.globalAlpha=this.saved;},translate(){},rotate(){},drawImage(...args){draws.push({args,alpha:this.globalAlpha});}};return{fx:context.window.ImageEffects,ctx,draws,requests};}
test('shared loading, frame boundaries, inherited opacity, zero length and invalid coordinates',async()=>{
 const {fx,ctx,draws,requests}=harness();await Promise.all([fx.load(),fx.load()]);assert.equal(requests.length,7);
 fx.sprite(ctx,'ring',140,10,20,60,30,null,.4);assert.equal(draws.at(-1).args[1],256);assert.equal(draws.at(-1).alpha,.2);
 fx.sprite(ctx,'ring',560,10,20,60,30);assert.equal(draws.at(-1).args[1],0);
 fx.sprite(ctx,'ring',-1,10,20,60,30);assert.equal(draws.at(-1).args[1],768);
 const count=draws.length;fx.link(ctx,{x:5,y:5},{x:5,y:5},'#fff');fx.sprite(ctx,'ring',0,NaN,0,50);assert.equal(draws.length,count);
});
test('failed shared loads can retry and tint storage remains within its memory budget',async()=>{
 const {fx,ctx,requests}=harness(true);await assert.rejects(fx.load());await fx.load();assert.equal(requests.length,8);
 for(let i=0;i<80;i++)fx.sprite(ctx,'ring',0,0,0,50,50,'#'+(0x113300+i).toString(16));
 assert.ok(fx.cacheStats().bytes<=fx.cacheStats().budget);assert.ok(fx.cacheStats().entries>0);
});
