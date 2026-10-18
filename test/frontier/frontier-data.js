/* Frenda Frontier Ver0.24 / static test data / Updated: 2026-10-18 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
F.VERSION="0.24";
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

// Ver0.24: 町レイヤー定義。初期開拓地は「ベース」で、追加施設や町並みだけをレイヤー化する。
// TESTの「全部OFF」はベースのみ＝0pt相当の初期景観になる。UIはこの定義を列挙するため、
// 将来レイヤーを追加してもTEST画面側の個別改修は不要。atlas は town-parts.png の切り出し情報。
F.TOWN_LAYER_DEFS=Object.freeze([
 {id:"base",group:"基礎",label:"初期開拓地（固定ベース）",icon:"🌿",kind:"base",z:0,locked:true,auto:{type:"always"}},
 {id:"shop2",group:"商業",label:"店 Lv2",icon:"🏪",kind:"atlas",z:20,facilityId:"shop",auto:{type:"fieldGte",field:"shopLevel",value:2},atlas:{sx:0,sy:0,sw:325,sh:285,dx:0,dy:0,dw:325,dh:285}},
 {id:"forge",group:"施設",label:"鍛冶屋",icon:"⚒️",kind:"atlas",z:30,facilityId:"forge",auto:{type:"fieldTrue",field:"forgeBuilt"},atlas:{sx:325,sy:0,sw:382,sh:310,dx:335,dy:0,dw:382,dh:310}},
 {id:"house",group:"生活",label:"住居",icon:"🏠",kind:"atlas",z:40,facilityId:"house",auto:{type:"fieldTrue",field:"houseBuilt"},atlas:{sx:340,sy:325,sw:350,sh:320,dx:0,dy:345,dw:350,dh:320}},
 {id:"market",group:"商業",label:"市場",icon:"🧺",kind:"atlas",z:50,facilityId:"market",auto:{type:"fieldTrue",field:"marketBuilt"},atlas:{sx:690,sy:325,sw:160,sh:300,dx:425,dy:290,dw:160,dh:300}},
 {id:"plaza",group:"町並み",label:"広場・噴水（発展後）",icon:"⛲",kind:"atlas",z:60,facilityId:"plaza",auto:{type:"fieldTrue",field:"plazaBuilt"},atlas:{sx:0,sy:325,sw:340,sh:325,dx:190,dy:180,dw:340,dh:325}}
]);
F.TOWN_LAYER_GROUPS=Object.freeze(["基礎","商業","施設","生活","町並み","人・生活","演出"]);
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
