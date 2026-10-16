'use strict';
// Isolated art deliverables. These are preview timings, not combat/balance data.
const enemies = [
  {id:'horn-jackal',label:'ホーンジャッカル',locomotion:'walk',size:200,width:480,height:340,actions:{bite:['噛みつき','bite-impact','target']}},
  {id:'rock-horn-goat',label:'岩角ヤギ',locomotion:'walk',size:210,width:480,height:350,actions:{charge:['短突進','charge-impact','target']}},
  {id:'wind-sprite',label:'風の小精霊',locomotion:'hover',size:200,width:440,height:350,actions:{blade:['風刃','wind-blade','projectile'],retreat:['後退',null,null]}},
  {id:'storm-jackal',label:'ストームジャッカル',locomotion:'walk',size:260,width:580,height:430,actions:{charge:['直線突進','charge-impact','target'],claw:['出血爪','claw','target'],rest:['休息',null,null]}},
  {id:'iron-horn',label:'アイアンホーン',locomotion:'walk',size:300,width:640,height:460,actions:{sweep:['角の薙ぎ','horn-sweep','target'],charge:['長突進','charge-impact','target'],rocks:['岩片三発','rock-shards','projectile'],rest:['休息',null,null]}},
  {id:'harpy-queen',label:'ハーピークイーン',locomotion:'fly',size:300,width:650,height:530,actions:{feathers:['三方向の羽根','feather','projectile'],ring:['風の円','wind-ring','origin'],dive:['急降下','charge-impact','target'],rest:['飛行休息',null,null]}},
  {id:'manticore',label:'マンティコア',locomotion:'walk',size:350,width:800,height:580,actions:{'double-claw':['爪の二連撃','claw','target'],venom:['毒尾の扇射','venom','projectile'],gust:['翼の突風','wind-gust','origin'],pounce:['飛び込み','charge-impact','target'],rest:['休息',null,null]}}
];
const effects = [
  {id:'wind-blade',label:'風刃',width:340,height:260,kind:'projectile'},
  {id:'feather',label:'羽根射撃',width:340,height:260,kind:'projectile'},
  {id:'wind-ring',label:'風の円',width:520,height:320,kind:'origin'},
  {id:'wind-gust',label:'翼の突風',width:540,height:340,kind:'origin'},
  {id:'venom',label:'毒尾の毒針',width:340,height:260,kind:'projectile'},
  {id:'claw',label:'爪・近接斬撃',width:340,height:280,kind:'target'},
  {id:'charge-impact',label:'突進の衝撃',width:460,height:310,kind:'ground'},
  {id:'rock-shards',label:'岩片',width:340,height:280,kind:'projectile'},
  {id:'bite-impact',label:'噛みつきの衝撃',width:340,height:280,kind:'target'},
  {id:'horn-sweep',label:'角の薙ぎ',width:460,height:310,kind:'target'}
];
module.exports={enemies,effects};
