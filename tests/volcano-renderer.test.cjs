'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('goddess reuse accepts visibleBounds, older bounds, and raw frame rectangles with finite transforms',()=>{
  const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/js/render/volcano-renderer.js'),'utf8'),context);
  for(const variant of [{visibleBounds:{left:3,top:2,right:97,bottom:98}},{bounds:{x:3,y:2,width:94,height:96}},{}]){
    let painted=0;const ctx={save(){},restore(){},translate(){},rotate(n){assert.ok(Number.isFinite(n));},scale(x,y){assert.ok(Number.isFinite(x)&&x>0);assert.ok(Number.isFinite(y)&&y>0);}},asset={data:{frames:[{width:100,height:100,...variant}]}};
    context.window.VolcanoRenderer.effect(ctx,{effect:'old',x:20,y:30,visualEnd:{x:300,y:60},shape:{kind:'lane',width:50}},0,{old:asset},()=>painted++);assert.equal(painted,1);
  }
});
