'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('../tools/lib/project-paths.cjs').assetPaths;
const {PNG}=require(require.resolve('pngjs',{paths:[__dirname,path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')]}));
const C=require('../public/js/combat/swamp-combat.js'),{visibleTiles}=require('../development/labs/js/stage-tiling.js');
const root=path.resolve(__dirname,'../public/assets/stages'),dir=path.join(root,'poison-swamp');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8')),stage=read(path.join(dir,'manifest.json')),forest=read(path.join(root,'starting-forest/manifest.json'));
test('swamp layers use the exact forest stage rectangle, contact lane and parallax contract',()=>{
  assert.deepEqual(stage.coordinateSystem,forest.coordinateSystem);assert.deepEqual(stage.repeat,forest.repeat);
  assert.deepEqual(stage.layers.map(l=>[l.id,l.alpha,l.parallax]),[['distant',false,.28],['ground-near',true,1]]);
  assert.ok(fs.existsSync(path.join(dir,'PROMPT.md')));
});
test('swamp backgrounds preserve generated RGBA, expose transparent gaps and cover the whole contact lane',()=>{
  for(const layer of stage.layers){const data=fs.readFileSync(path.join(dir,layer.file));assert.deepEqual(data,fs.readFileSync(path.join(dir,layer.source)));
    const image=PNG.sync.read(data);assert.equal(image.width,layer.width);assert.equal(image.height,layer.height);assert.ok(Math.abs(image.width/image.height-16/9)<.01);
    if(!layer.alpha){for(let i=3;i<image.data.length;i+=4)assert.equal(image.data[i],255);}
    else{let empty=0;for(let y=0;y<image.height*.4;y++)for(let x=0;x<image.width;x++)if(image.data[(y*image.width+x)*4+3]===0)empty++;assert.ok(empty>image.width*image.height*.12);
      const low=Math.ceil(stage.coordinateSystem.groundY.min*image.height/576),high=Math.floor(stage.coordinateSystem.groundY.max*image.height/576);
      for(let y=low;y<=high;y++)for(let x=0;x<image.width;x++)assert.ok(image.data[(y*image.width+x)*4+3]>=245,'Solid ground at '+x+','+y);
    }
    const tiles=visibleTiles(510,1024,3072);for(let i=1;i<tiles.length;i++){
      const left=tiles[i-1].mirror?0:image.width-1,right=tiles[i].mirror?image.width-1:0;
      for(let y=0;y<image.height;y++)assert.deepEqual(image.data.subarray((y*image.width+left)*4,(y*image.width+left+1)*4),image.data.subarray((y*image.width+right)*4,(y*image.width+right+1)*4));
    }
  }
});
test('swamp movement shares the forest combat Y334–501 lane and stays inside the same ground rectangle',()=>{
  assert.equal(C.BOUNDS.width,1024);assert.equal(C.BOUNDS.height,576);assert.equal(C.BOUNDS.minY,334);assert.equal(C.BOUNDS.maxY,501);
  const battle=C.create('hydra',{autoHero:false});battle.enemy.cooldown=100000;
  for(const [target,expected] of [[{x:250,y:-500},334],[{x:250,y:2000},501]]){battle.heroTarget=target;C.update(battle,5000);assert.equal(battle.hero.y,expected);}
  assert.ok(C.BOUNDS.minY>=stage.coordinateSystem.groundY.min&&C.BOUNDS.maxY<=stage.coordinateSystem.groundY.max);
});
