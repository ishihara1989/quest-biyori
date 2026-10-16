'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaladinMotions=api;})(typeof globalThis==='object'?globalThis:this,()=>{
 const MOTIONS=['attack-mace','mace-raise','mace-slam','shield-raise','shield-plant','shield-advance','break-strike'];
 const CLOCKS={'attack-mace':520,'mace-raise':520,'mace-slam':520,'shield-raise':520,'shield-plant':520,'shield-advance':660,'break-strike':660};
 const IMPACTS={'attack-mace':180,'mace-slam':240,'shield-raise':320,'shield-plant':320,'break-strike':240};
 return {MOTIONS,CLOCKS,IMPACTS};
});
