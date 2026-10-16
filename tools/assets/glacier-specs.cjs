'use strict';
const enemies=[
 {id:'frost-wolf',label:'フロストウルフ',locomotion:'trot',cell:0,size:150,width:400,height:300,actions:{bite:'噛みつき',leap:'霜牙跳び'}},
 {id:'ice-shell-golem',label:'氷殻ゴーレム',locomotion:'walk',cell:1,size:175,width:400,height:330,actions:{punch:'氷拳',smash:'氷拳砕き'}},
 {id:'snow-spirit',label:'雪の精',locomotion:'hover',cell:2,size:145,width:380,height:310,actions:{bolt:'冷気弾',ring:'冷気輪'}},
 {id:'fenrir',label:'フェンリル',locomotion:'trot',cell:3,size:235,width:560,height:400,actions:{bite:'蒼牙',leap:'蒼牙跳躍',howl:'氷柱遠吠え'}},
 {id:'crystal-golem',label:'クリスタルゴーレム',locomotion:'walk',cell:4,size:265,width:540,height:420,actions:{punch:'晶拳',fan:'晶拳大扇',armor:'結晶装甲'}},
 {id:'yuki-onna',label:'雪女',locomotion:'hover',cell:5,size:250,width:500,height:410,actions:{bolt:'雪華弾',pillars:'三華氷柱',seal:'薄氷の封輪'}},
 {id:'ice-tusk-mammoth',label:'氷牙マンモス',locomotion:'trot',cell:7,size:270,width:680,height:450,actions:{trunk:'鼻打ち',sweep:'氷牙大薙ぎ',quake:'氷震踏砕き',boulder:'氷塊天落',crown:'白夜の氷冠'}}
];
const effects=[
 {id:'bite',label:'霜牙の衝撃',width:280,height:220,kind:'target',description:'two short frosty fang streaks converging into a cyan-white bite impact and ice splinters'},
 {id:'punch',label:'晶拳の衝撃',width:340,height:270,kind:'ground',description:'a compact huge ice fist impact, low blue-white shock ring and angular ice shards'},
 {id:'cold',label:'冷気弾',width:260,height:240,kind:'projectile',description:'a left-travelling faceted blue snow crystal projectile with a short white-blue trail'},
 {id:'ring',label:'冷気輪',width:420,height:290,kind:'ground',description:'a low hollow ice ring opening into six snow crystal spikes, center transparent'},
 {id:'pillar',label:'氷柱',width:320,height:430,kind:'ground',description:'one tall jagged translucent azure ice pillar erupting vertically with a low snow burst'},
 {id:'armor',label:'結晶装甲',width:380,height:370,kind:'target',description:'a hollow six-sided faceted cyan crystal shield aura, no character inside, transparent center'},
 {id:'seal',label:'薄氷の封輪',width:310,height:340,kind:'ground',description:'a hollow snowflake seal ring forming a short ice cage, fully transparent center'},
 {id:'sweep',label:'氷牙大薙ぎ',width:610,height:380,kind:'target',reference:'tusk-sweep',description:'a huge left-sweeping azure-white icy crescent arc with scattered thick translucent shards'},
 {id:'quake',label:'氷震踏砕',width:650,height:370,kind:'ground',reference:'ice-quake',description:'a broad low elliptical hollow ice shock ring and five jagged ice spikes on its rim'},
 {id:'boulder',label:'氷塊天落',width:350,height:470,kind:'ground',reference:'glacial-boulder',description:'a huge faceted azure boulder falling vertically with a white-blue streak then shattering on the ground'},
 {id:'crown',label:'白夜の氷冠',width:740,height:440,kind:'ground',reference:'aurora-crown',description:'a spectacular hollow broad ice crown ring, mint aurora ribbons spiralling outwards and violet-blue diamond shards, center transparent'}
];
module.exports={enemies,effects};
