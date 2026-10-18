/* Frenda Frontier Ver0.26 / extensible facility + town-layer data / Updated: 2026-10-18 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
F.VERSION="0.26";
F.SAVE_KEY="frenda:frontier:v1";
F.W=12;F.H=8;F.BAG_LIMIT=10;
F.ITEMS=Object.freeze({
 wood:{id:"wood",icon:"🪵",name:"木材",kind:"素材",base:90,desc:"森で集めた丈夫な木材。"},
 herb:{id:"herb",icon:"🌿",name:"薬草",kind:"素材",base:70,desc:"回復用品にも使えそうな薬草。"},
 iron:{id:"iron",icon:"⛏️",name:"鉄のかけら",kind:"素材",base:140,desc:"少量だが価値のある鉱石。"},
 crystal:{id:"crystal",icon:"✨",name:"森の結晶",kind:"珍品",base:260,desc:"森の奥で時々見つかる不思議な結晶。"},
 oldtool:{id:"oldtool",icon:"🧰",name:"古びた道具",kind:"珍品",base:420,desc:"誰かが昔使っていた探検道具。"}
});
F.GATHER_TABLE=Object.freeze([
 {item:"wood",weight:38,min:1,max:2},{item:"herb",weight:34,min:1,max:2},{item:"iron",weight:20,min:1,max:1},{item:"crystal",weight:8,min:1,max:1}
]);

// Ver0.26: 施設はマスター定義で管理する。今後、新施設を追加しても町本体のロジックを増やさず、
// この定義と対応する表示レイヤーを追加すれば拡張できる構造にする。
F.FACILITY_DEFS=Object.freeze([
 {id:"shop",name:"店",icon:"🏪",category:"commerce",startLevel:1,maxLevel:4,route:"commerce",levels:{
   2:{actionId:"shop2",need:12,label:"店を少し大きくする",desc:"露店の設備と商品置き場を増やし、小さな店舗へ育てる。"},
   3:{actionId:"shop3",need:32,label:"店をさらに拡張する",desc:"売場を広げ、より多くの商品を扱えるようにする。"},
   4:{actionId:"shop4",need:55,label:"店を本格店舗にする",desc:"開拓地を代表する大きな店へ成長させる。"}
 }},
 {id:"forge",name:"鍛冶屋",icon:"⚒️",category:"craft",startLevel:0,maxLevel:3,route:"forge",levels:{
   1:{actionId:"forge",need:12,label:"鍛冶職人を呼ぶ",desc:"簡素な鍛冶作業場を作り、職人に来てもらう。"},
   2:{actionId:"forge2",need:34,label:"鍛冶屋を拡張する",desc:"炉と作業場を整え、修理や強化の幅を広げる。"},
   3:{actionId:"forge3",need:58,label:"鍛冶工房にする",desc:"本格的な工房へ発展させる。"}
 }},
 {id:"house",name:"住居",icon:"🏠",category:"life",startLevel:0,maxLevel:3,route:"life",levels:{
   1:{actionId:"house",need:14,label:"最初の住居を建てる",desc:"住民が定住できる簡素な家を建てる。"},
   2:{actionId:"house2",need:36,label:"住居を増やす",desc:"暮らす人が増え、生活区画が形になってくる。"},
   3:{actionId:"house3",need:60,label:"生活区画を整える",desc:"複数の住居と生活設備を整える。"}
 }},
 {id:"market",name:"市場",icon:"🧺",category:"commerce",startLevel:0,maxLevel:2,route:"commerce",levels:{
   1:{actionId:"market",need:18,label:"小さな市場を開く",desc:"旅商人が立ち寄れる露店スペースを作る。"},
   2:{actionId:"market2",need:42,label:"市場を拡張する",desc:"複数の商人が店を出せる市場へ育てる。"}
 }},
 {id:"adventure_board",name:"冒険掲示板",icon:"📜",category:"adventure",startLevel:0,maxLevel:2,route:"adventure",levels:{
   1:{actionId:"adventure_board",need:14,label:"冒険掲示板を置く",desc:"旅人や冒険者が情報を交換できる掲示板を設置する。"},
   2:{actionId:"adventure_board2",need:38,label:"冒険者の詰所を整える",desc:"冒険者が集まる場所へ発展させる。"}
 }},
 {id:"plaza",name:"広場",icon:"⛲",category:"civic",startLevel:0,maxLevel:2,route:"standard",levels:{
   1:{actionId:"plaza",need:24,label:"小さな広場を整える",desc:"人が集まれる空間を整備する。噴水はこの段階以降に現れる。"},
   2:{actionId:"plaza2",need:48,label:"広場を拡張する",desc:"町の中心となる広場へ発展させる。"}
 }}
]);

// Ver0.26: 町の見た目は「固定ベース + 細かな景観レイヤー + 施設レイヤー」。
// TEST画面はこの定義をそのまま列挙する。asset は major/detail のどちらのアトラスを使うかを示す。
F.TOWN_RENDER_BANDS=Object.freeze(["ground","structure","low","character","front"]);
// Ver0.26: 描画順は z 値だけに依存せず band（地面→施設→低い小物→人物→前景）で固定する。
// これにより、将来レイヤーが増えても道・石畳などが人物の上に描画される事故を防ぐ。
F.TOWN_LAYER_DEFS=Object.freeze([
 {id:"base",group:"基礎",label:"0pt 初期開拓地（固定ベース）",icon:"🌿",kind:"base",band:"ground",z:0,locked:true,auto:{type:"always"}},

 {id:"path_clear",group:"道・整備",label:"6pt 踏み跡が少し整う",icon:"👣",kind:"atlas",asset:"detail",band:"ground",z:10,auto:{type:"pointsGte",value:6},atlas:{sx:326,sy:4,sw:150,sh:230,dx:285,dy:250,dw:150,dh:230}},
 {id:"stone_path",group:"道・整備",label:"16pt 道の一部が石敷きになる",icon:"🧱",kind:"atlas",asset:"detail",band:"ground",z:20,auto:{type:"pointsGte",value:16},atlas:{sx:814,sy:238,sw:190,sh:260,dx:270,dy:250,dw:190,dh:260}},

 {id:"route_commerce",group:"発展ルート",label:"8pt 商業優先：露店の日よけを改良",icon:"🏪",kind:"atlas",asset:"detail",band:"structure",z:10,auto:{type:"all",rules:[{type:"pointsGte",value:8},{type:"routeIn",values:["commerce"]}]},atlas:{sx:162,sy:4,sw:160,sh:70,dx:85,dy:135,dw:160,dh:70}},
 {id:"route_forge",group:"発展ルート",label:"8pt 鍛冶優先：仮設作業場",icon:"⚒️",kind:"atlas",asset:"detail",band:"structure",z:12,auto:{type:"all",rules:[{type:"pointsGte",value:8},{type:"routeIn",values:["forge"]}]},atlas:{sx:4,sy:238,sw:120,sh:95,dx:430,dy:180,dw:120,dh:95}},
 {id:"route_life",group:"発展ルート",label:"8pt 生活優先：仮設テント",icon:"⛺",kind:"atlas",asset:"detail",band:"structure",z:14,auto:{type:"all",rules:[{type:"pointsGte",value:8},{type:"routeIn",values:["life"]}]},atlas:{sx:908,sy:4,sw:110,sh:80,dx:435,dy:180,dw:110,dh:80}},
 {id:"route_adventure",group:"発展ルート",label:"8pt 冒険優先：情報掲示板",icon:"📜",kind:"atlas",asset:"detail",band:"structure",z:16,auto:{type:"all",rules:[{type:"pointsGte",value:8},{type:"routeIn",values:["adventure"]}]},atlas:{sx:128,sy:238,sw:80,sh:80,dx:455,dy:330,dw:80,dh:80}},
 {id:"shop2",group:"施設",label:"店 Lv2（施設本体）",icon:"🏪",kind:"atlas",asset:"facility",band:"structure",z:30,facilityId:"shop",auto:{type:"facilityGte",facilityId:"shop",value:2},atlas:{sx:0,sy:0,sw:325,sh:285,dx:0,dy:0,dw:325,dh:285}},
 {id:"forge",group:"施設",label:"鍛冶屋 Lv1（施設本体）",icon:"⚒️",kind:"atlas",asset:"facility",band:"structure",z:32,facilityId:"forge",auto:{type:"facilityGte",facilityId:"forge",value:1},atlas:{sx:325,sy:0,sw:382,sh:310,dx:335,dy:0,dw:382,dh:310}},
 {id:"house",group:"施設",label:"住居 Lv1（施設本体）",icon:"🏠",kind:"atlas",asset:"facility",band:"structure",z:34,facilityId:"house",auto:{type:"facilityGte",facilityId:"house",value:1},atlas:{sx:340,sy:325,sw:350,sh:320,dx:0,dy:345,dw:350,dh:320}},
 {id:"market",group:"施設",label:"市場 Lv1（施設本体）",icon:"🧺",kind:"atlas",asset:"facility",band:"structure",z:36,facilityId:"market",auto:{type:"facilityGte",facilityId:"market",value:1},atlas:{sx:690,sy:325,sw:160,sh:300,dx:425,dy:290,dw:160,dh:300}},

 {id:"shop_goods",group:"商業",label:"4pt 露店の商品・箱が増える",icon:"📦",kind:"atlas",asset:"detail",band:"low",z:10,auto:{type:"pointsGte",value:4},atlas:{sx:58,sy:4,sw:100,sh:70,dx:80,dy:280,dw:100,dh:70}},
 {id:"fence_basic",group:"生活基盤",label:"8pt 簡素な柵が増える",icon:"🪵",kind:"atlas",asset:"detail",band:"low",z:12,auto:{type:"pointsGte",value:8},atlas:{sx:480,sy:4,sw:210,sh:80,dx:245,dy:390,dw:210,dh:80}},
 {id:"flowers",group:"装飾・明かり",label:"14pt 小さな花壇ができる",icon:"🌼",kind:"atlas",asset:"detail",band:"low",z:14,auto:{type:"pointsGte",value:14},atlas:{sx:336,sy:238,sw:250,sh:100,dx:245,dy:325,dw:250,dh:100}},
 {id:"benches",group:"生活基盤",label:"22pt ベンチが置かれる",icon:"🪑",kind:"atlas",asset:"detail",band:"low",z:16,auto:{type:"pointsGte",value:22},atlas:{sx:362,sy:502,sw:270,sh:70,dx:225,dy:430,dw:270,dh:70}},
 {id:"plaza_fountain",group:"町並み",label:"24pt以降：広場の噴水",icon:"⛲",kind:"atlas",asset:"detail",band:"low",z:18,facilityId:"plaza",auto:{type:"all",rules:[{type:"pointsGte",value:24},{type:"facilityGte",facilityId:"plaza",value:1}]},atlas:{sx:238,sy:502,sw:120,sh:100,dx:310,dy:300,dw:120,dh:100}},

 {id:"visitor_first",group:"人・生活",label:"2pt 最初の旅人",icon:"🚶",kind:"atlas",asset:"detail",band:"character",z:10,auto:{type:"pointsGte",value:2},atlas:{sx:4,sy:4,sw:50,sh:65,dx:500,dy:300,dw:50,dh:65}},
 {id:"resident_more",group:"人・生活",label:"12pt 住民が少し増える",icon:"🧑",kind:"atlas",asset:"detail",band:"character",z:12,auto:{type:"pointsGte",value:12},atlas:{sx:636,sy:502,sw:130,sh:75,dx:230,dy:475,dw:130,dh:75}},

 {id:"torches",group:"装飾・明かり",label:"10pt 松明が立つ",icon:"🔥",kind:"atlas",asset:"detail",band:"front",z:10,auto:{type:"pointsGte",value:10},atlas:{sx:694,sy:4,sw:210,sh:85,dx:270,dy:340,dw:210,dh:85}},
 {id:"street_lamps",group:"装飾・明かり",label:"18pt 街灯が付き始める",icon:"🏮",kind:"atlas",asset:"detail",band:"front",z:12,auto:{type:"pointsGte",value:18},atlas:{sx:590,sy:238,sw:220,sh:90,dx:270,dy:340,dw:220,dh:90}},
 {id:"banners",group:"装飾・明かり",label:"20pt 町の旗が立つ",icon:"🚩",kind:"atlas",asset:"detail",band:"front",z:14,auto:{type:"pointsGte",value:20},atlas:{sx:4,sy:502,sw:230,sh:100,dx:260,dy:320,dw:230,dh:100}}
]);
F.TOWN_LAYER_GROUPS=Object.freeze(["基礎","道・整備","商業","生活基盤","発展ルート","施設","町並み","装飾・明かり","人・生活","演出"]);
F.CUSTOMERS=Object.freeze([
 {icon:"🧒",name:"かけだし冒険者",budget:[200,700],likes:["素材","珍品"],line:"これ、冒険に使えそう！"},
 {icon:"🧑‍🔧",name:"職人見習い",budget:[300,900],likes:["素材"],line:"材料を探してたんだ。"},
 {icon:"🧑‍🎒",name:"旅の冒険者",budget:[450,1200],likes:["珍品","素材"],line:"この町にも面白い店があるね。"},
 {icon:"👩",name:"町の住民",budget:[180,600],likes:["素材"],line:"ちょうど欲しかったの。"}
]);
F.STORY=Object.freeze([
 {id:"prologue",title:"序章　フロンティアへ",text:"『幻の大秘宝』の噂を追って、ほとんど人のいない開拓地へやってきた。",at:0},
 {id:"partner",title:"相棒との第一歩",text:"所持しているフレンダピックから相棒を選び、最初の冒険へ向かう。",at:1},
 {id:"supply",title:"店を開くための仕入れ",text:"はじまりの森で素材を集め、店に商品を並べる。",at:2},
 {id:"firstsale",title:"最初のお客さん",text:"自分で持ち帰った品が売れ、開拓地に少しずつ人が集まり始める。",at:3},
 {id:"rumor",title:"新しい噂",text:"店の評判が広がると、森の奥と『秘宝の手掛かり』について語る旅人が現れる。",at:4}
]);
F.pickRecord=id=>(window.FRENDA_MASTER?.records||[]).find(r=>String(r.master_id)===String(id))||null;
F.ownedIds=()=>{const D=window.FRENDA_DATA,U=window.FRENDA_USER,st=U?.storage||localStorage;try{const key=D?.KEYS?.simulator?.owned||"frenda:owned:v1",a=JSON.parse(st.getItem(key)||"[]");return Array.isArray(a)?a.map(String):[]}catch{return[]}};
F.ownedEligiblePartners=()=>F.ownedIds().map(F.pickRecord).filter(r=>r&&Number(r.grade||0)<=3).sort((a,b)=>(Number(a.grade)-Number(b.grade))||(Number(a.poke_ene)-Number(b.poke_ene)));
F.trialPartners=()=>{if(!window.FRENDA_TEST?.active)return[];return (window.FRENDA_MASTER?.records||[]).filter(r=>r&&Number(r.grade||0)>0&&Number(r.grade||0)<=3).sort((a,b)=>(Number(a.grade)-Number(b.grade))||(Number(a.poke_ene)-Number(b.poke_ene))).slice(0,6)};
F.eligiblePartners=()=>{const owned=F.ownedEligiblePartners();return owned.length?owned:F.trialPartners()};
F.usingTrialPartners=()=>F.ownedEligiblePartners().length===0&&F.trialPartners().length>0;
F.item=id=>F.ITEMS[id]||null;
F.rand=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
F.weighted=list=>{const sum=list.reduce((n,x)=>n+x.weight,0);let r=Math.random()*sum;for(const x of list){r-=x.weight;if(r<=0)return x}return list[list.length-1]};
})();
