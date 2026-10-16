'use strict';
const fs=require('node:fs'),path=require('node:path'),file=path.resolve(__dirname,'../../public/js/data/interference-reference.js'),reference=require(file),A=require('./audit-balance.cjs');
for(let stage=91;stage<=100;stage++)reference[stage]=Object.fromEntries(Object.entries(A.referenceBuild(stage,stage-1).builds).map(([id,b])=>[id,{hp:b.maxHp,defense:b.defense}]));
fs.writeFileSync(file,"'use strict';\n((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.InterferenceReference=api;})(globalThis,()=> ("+JSON.stringify(reference)+"));\n");
console.log('Fixed previous-stage reference extended through stage100.');
