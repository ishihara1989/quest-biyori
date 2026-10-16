'use strict';
const fs=require('node:fs'),path=require('../lib/project-paths.cjs').assetPaths;
const bundled=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const {PNG}=require(require.resolve('pngjs',{paths:[__dirname,bundled]}));
for(const file of process.argv.slice(2)){const p=PNG.sync.read(fs.readFileSync(file));let transparent=0,low=0,opaque=0,edge=0;for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const a=p.data[(y*p.width+x)*4+3];if(!a)transparent++;if(a<192)low++;else{opaque++;if(x===0||y===0||x===p.width-1||y===p.height-1)edge++;}}console.log(JSON.stringify({file,width:p.width,height:p.height,corner:[...p.data.subarray(0,4)],transparent,belowCutoff:low,retained:opaque,opaqueEdges:edge}));}
