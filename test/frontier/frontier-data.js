/* Frenda Frontier Ver0.39 / world structure Ver5 + common area scene specification / Updated: 2026-10-19 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
F.VERSION="0.39";
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

// Ver0.33: 施設は選んだ瞬間に完成させず、予定地→資材→骨組み→仕上げ→完成を共通工程として持つ。
F.CONSTRUCTION_PHASES=Object.freeze([
 {id:"planned",label:"建設予定地",icon:"📍",progress:0.12},
 {id:"materials",label:"基礎・資材搬入",icon:"🪵",progress:0.35},
 {id:"frame",label:"柱・骨組み工事",icon:"🛠️",progress:0.62},
 {id:"finishing",label:"屋根・仕上げ工事",icon:"🏗️",progress:0.86}
]);

// Ver0.33: 工事中の見た目は正式ピクセルアート素材を共通アトラスから描画する。
// 新施設は visualSet を追加すれば本体描画ロジックを変更せず拡張できる。
F.CONSTRUCTION_VISUALS=Object.freeze({
 default:{asset:"frontier-asset-construction-v033.png",frameW:220,frameH:190,frames:{planned:0,materials:1,frame:2,finishing:3}},
});
// 工程ごとに現場の当たり判定の広がりも変える。
F.CONSTRUCTION_NAV_PHASES=Object.freeze({
 planned:{inset:24},materials:{inset:16},frame:{inset:9},finishing:{inset:6}
});

F.FACILITY_SITES=Object.freeze({
 shop:{areaId:"core",x:52,y:92,w:250,h:190,entrance:{x:205,y:300}},
 forge:{areaId:"core",x:350,y:72,w:220,h:190,entrance:{x:470,y:300}},
 house:{areaId:"core",x:45,y:390,w:250,h:185,entrance:{x:182,y:615}},
 market:{areaId:"core",x:430,y:325,w:135,h:125,entrance:{x:430,y:445}},
 adventure_board:{areaId:"core",x:442,y:300,w:105,h:95,entrance:{x:430,y:415}},
 plaza:{areaId:"core",x:295,y:300,w:155,h:130,entrance:{x:370,y:455}}
});
F.facilitySite=id=>F.FACILITY_SITES?.[id]||null;

// Ver0.28: 施設はマスター定義で管理する。今後、新施設を追加しても町本体のロジックを増やさず、
// この定義と対応する表示レイヤーを追加すれば拡張できる構造にする。
F.FACILITY_DEFS=Object.freeze([
 {id:"shop",name:"店",icon:"🏪",category:"commerce",areaTagsAny:["commerce","road","core"],constructionVisualSet:"default",startLevel:1,maxLevel:4,route:"commerce",levels:{
   2:{actionId:"shop2",need:12,label:"店を少し大きくする",desc:"露店の設備と商品置き場を増やし、小さな店舗へ育てる。"},
   3:{actionId:"shop3",need:32,label:"店をさらに拡張する",desc:"売場を広げ、より多くの商品を扱えるようにする。"},
   4:{actionId:"shop4",need:55,label:"店を本格店舗にする",desc:"開拓地を代表する大きな店へ成長させる。"}
 }},
 {id:"forge",name:"鍛冶屋",icon:"⚒️",category:"craft",areaTagsAny:["forge","rock","craft","core"],constructionVisualSet:"default",startLevel:0,maxLevel:3,route:"forge",levels:{
   1:{actionId:"forge",need:12,label:"鍛冶職人を呼ぶ",desc:"簡素な鍛冶作業場を作り、職人に来てもらう。"},
   2:{actionId:"forge2",need:34,label:"鍛冶屋を拡張する",desc:"炉と作業場を整え、修理や強化の幅を広げる。"},
   3:{actionId:"forge3",need:58,label:"鍛冶工房にする",desc:"本格的な工房へ発展させる。"}
 }},
 {id:"house",name:"住居",icon:"🏠",category:"life",areaTagsAny:["life","residential","core"],constructionVisualSet:"default",startLevel:0,maxLevel:3,route:"life",levels:{
   1:{actionId:"house",need:14,label:"最初の住居を建てる",desc:"住民が定住できる簡素な家を建てる。"},
   2:{actionId:"house2",need:36,label:"住居を増やす",desc:"暮らす人が増え、生活区画が形になってくる。"},
   3:{actionId:"house3",need:60,label:"生活区画を整える",desc:"複数の住居と生活設備を整える。"}
 }},
 {id:"market",name:"市場",icon:"🧺",category:"commerce",areaTagsAny:["commerce","road","logistics"],constructionVisualSet:"default",startLevel:0,maxLevel:2,route:"commerce",levels:{
   1:{actionId:"market",need:18,label:"小さな市場を開く",desc:"旅商人が立ち寄れる露店スペースを作る。"},
   2:{actionId:"market2",need:42,label:"市場を拡張する",desc:"複数の商人が店を出せる市場へ育てる。"}
 }},
 {id:"adventure_board",name:"冒険掲示板",icon:"📜",category:"adventure",areaTagsAny:["adventure","nature","core"],constructionVisualSet:"default",startLevel:0,maxLevel:2,route:"adventure",levels:{
   1:{actionId:"adventure_board",need:14,label:"冒険掲示板を置く",desc:"旅人や冒険者が情報を交換できる掲示板を設置する。"},
   2:{actionId:"adventure_board2",need:38,label:"冒険者の詰所を整える",desc:"冒険者が集まる場所へ発展させる。"}
 }},
 {id:"plaza",name:"広場",icon:"⛲",category:"civic",areaTagsAny:["core","life","civic"],constructionVisualSet:"default",startLevel:0,maxLevel:2,route:"standard",levels:{
   1:{actionId:"plaza",need:24,label:"小さな広場を整える",desc:"人が集まれる空間を整備する。噴水はこの段階以降に現れる。"},
   2:{actionId:"plaza2",need:48,label:"広場を拡張する",desc:"町の中心となる広場へ発展させる。"}
 }}
]);


// Ver0.38: 全体マップの「形」より先に、今後増えるエリアを同じ規格で扱える世界構造を定義する。
// ここで固定するのはエリアの役割・地形特性・接続能力・収容量など。道路や建物のピクセル座標はまだ固定しない。
F.TOWN_WORLD_DEF=Object.freeze({
 id:"frontier_town",layoutRevision:4,status:"planning",startArea:"core",coordinateMode:"logical-grid",
 sceneMode:"connected-area-stream",transitionMode:"edge-gate",preloadNeighbors:1,hardAreaLimit:null,
 extensible:true,structureVersion:5,
 description:"中心開拓地を核に、地形・用途・プレイヤーの発展方針に応じて外側へ枝分かれできる町域グラフ。Ver0.39から全エリアを共通のSceneSpec（入口・出口・通行・施設枠・工事枠・NPC活動域・将来拡張口）で設計する。"
});
F.TOWN_SCENE_POLICY=Object.freeze({
 mode:"connected-area-stream",localSceneDefault:{w:717,h:842},preloadNeighborDepth:1,
 unloadDistantScenes:true,keepLogicalState:true,transition:"edge-gate",
 areaSchemaVersion:1,zoneModel:"normalized-scene-spec",note:"現在地と隣接エリアだけを描画し、町全体は論理グラフとして保持する。各エリアは共通SceneSpecを持ち、隣接地区は境界まで歩くと短い切替で次エリアへ入り、遠距離のみ高速移動を使う。"
});

// Ver0.38: エリアの広さは固定1種類にしない。施設密度・NPC数・移動距離の目安として使う。
F.AREA_SIZE_CLASSES=Object.freeze({
 compact:{id:"compact",label:"小区画",icon:"▫️",sceneScale:0.78,facilitySlots:3,landmarkSlots:0,residentCapacity:5,traffic:"low"},
 standard:{id:"standard",label:"標準区画",icon:"◻️",sceneScale:1.00,facilitySlots:5,landmarkSlots:1,residentCapacity:10,traffic:"medium"},
 wide:{id:"wide",label:"広域区画",icon:"⬜",sceneScale:1.28,facilitySlots:8,landmarkSlots:2,residentCapacity:18,traffic:"high"},
 hub:{id:"hub",label:"中心区画",icon:"🔶",sceneScale:1.15,facilitySlots:7,landmarkSlots:2,residentCapacity:16,traffic:"hub"}
});
F.areaSizeClass=id=>F.AREA_SIZE_CLASSES?.[id]||F.AREA_SIZE_CLASSES?.standard||null;

// Ver0.38: 将来の「未知のエリア」は、個別名称を本体へベタ書きせずテンプレートから生成する。
// 追加コンテンツではここへテンプレートを足せば、既存町から自然に接続候補を出せる。
F.EXPANSION_TEMPLATE_DEFS=Object.freeze([
 {id:"deep_forest",name:"深い森",icon:"🌳",sizeClass:"wide",terrainTags:["forest","nature","gathering"],facilityTags:["adventure","gathering","ranch"],travelCost:2,capacity:{facilitySlots:5,landmarkSlots:1},unlockHint:"森側の開拓と探索を進める"},
 {id:"pasture",name:"牧草地",icon:"🌾",sizeClass:"wide",terrainTags:["field","nature","life"],facilityTags:["ranch","life","food"],travelCost:1,capacity:{facilitySlots:6,landmarkSlots:1},unlockHint:"生活・牧場系の需要が高まる"},
 {id:"foothill",name:"山すそ",icon:"🏔️",sizeClass:"standard",terrainTags:["rock","mountain","craft"],facilityTags:["forge","mining","adventure"],travelCost:2,capacity:{facilitySlots:4,landmarkSlots:1},unlockHint:"高台側の道をさらに延ばす"},
 {id:"quarry",name:"採石場候補地",icon:"🪨",sizeClass:"compact",terrainTags:["rock","resource","craft"],facilityTags:["forge","storage","mining"],travelCost:2,capacity:{facilitySlots:3,landmarkSlots:1},unlockHint:"鍛冶・建設資材の需要が増える"},
 {id:"far_bank",name:"川向こう",icon:"🌉",sizeClass:"standard",terrainTags:["water","river","life"],facilityTags:["water","life","commerce"],travelCost:2,capacity:{facilitySlots:5,landmarkSlots:1},unlockHint:"橋または渡河手段を整える"},
 {id:"wetland",name:"湿地",icon:"🪷",sizeClass:"wide",terrainTags:["water","wetland","nature"],facilityTags:["gathering","research","adventure"],travelCost:3,capacity:{facilitySlots:4,landmarkSlots:2},unlockHint:"川辺の安全確保と探索を進める"},
 {id:"trade_route",name:"交易路",icon:"🛣️",sizeClass:"wide",terrainTags:["road","commerce","logistics"],facilityTags:["commerce","storage","inn"],travelCost:2,capacity:{facilitySlots:7,landmarkSlots:1},unlockHint:"街道の往来と商業を発展させる"},
 {id:"plain",name:"平原",icon:"🌱",sizeClass:"wide",terrainTags:["field","road","open"],facilityTags:["life","commerce","ranch"],travelCost:1,capacity:{facilitySlots:8,landmarkSlots:1},unlockHint:"町域拡張の需要が高まる"},
 {id:"highland_meadow",name:"高原",icon:"🌼",sizeClass:"standard",terrainTags:["highland","field","residential"],facilityTags:["life","residential","inn"],travelCost:2,capacity:{facilitySlots:5,landmarkSlots:1},unlockHint:"高台の生活基盤を整える"}
]);
F.expansionTemplate=id=>(F.EXPANSION_TEMPLATE_DEFS||[]).find(x=>x.id===id)||null;

F.TOWN_SCALE_TIERS=Object.freeze([
 {id:"frontier",label:"開拓地",icon:"🏕️",minUsable:1,minPoints:0},
 {id:"hamlet",label:"小さな集落",icon:"🏘️",minUsable:2,minPoints:12},
 {id:"village",label:"村",icon:"🏡",minUsable:3,minPoints:28},
 {id:"town",label:"町",icon:"🏙️",minUsable:5,minPoints:52},
 {id:"large_town",label:"大きな町",icon:"🌆",minUsable:8,minPoints:86},
 {id:"city",label:"交易都市",icon:"🌇",minUsable:12,minPoints:130}
]);
F.WORLD_PORT_VECTOR=Object.freeze({north:[0,-1],south:[0,1],east:[1,0],west:[-1,0],ne:[1,-1],nw:[-1,-1],se:[1,1],sw:[-1,1]});
// Ver0.38: エリア間移動は「隣接=歩行による疑似シームレス」「遠距離=選択式高速移動」を正式基準にする。
// 見た目の接続種別と、実際の移動方式を分離しておくことで、将来 馬車・船・転送などを追加しても既存エリア定義を作り直さない。
F.TRAVEL_MODE_DEFS=Object.freeze({
 walk:{id:"walk",label:"歩行接続",icon:"🚶",selection:false,autoTransition:true,seamlessLike:true},
 fast:{id:"fast",label:"高速移動",icon:"⚡",selection:true,autoTransition:false,seamlessLike:false}
});
F.CONNECTION_KIND_DEFS=Object.freeze({
 forest_path:{id:"forest_path",label:"森道",icon:"🌲",defaultMode:"walk",transition:"edge",transitionMs:260},
 road:{id:"road",label:"街道",icon:"🛣️",defaultMode:"walk",transition:"edge",transitionMs:220},
 bridge:{id:"bridge",label:"橋",icon:"🌉",defaultMode:"walk",transition:"edge",transitionMs:280},
 stairs:{id:"stairs",label:"階段・坂道",icon:"🪜",defaultMode:"walk",transition:"edge",transitionMs:300},
 coach:{id:"coach",label:"馬車",icon:"🛞",defaultMode:"fast",transition:"select",transitionMs:450},
 boat:{id:"boat",label:"船",icon:"⛵",defaultMode:"fast",transition:"select",transitionMs:520}
});
F.FAST_TRAVEL_POLICY=Object.freeze({
 enabled:true,unlockRule:"visited-and-node",destinationRule:"visited-and-usable",requiresSelection:true,
 note:"町内の隣接地区は歩行。町が大きくなった後の遠距離だけ、馬車・船などの移動拠点から目的地を選ぶ。"
});
F.AREA_CONNECTION_DEFS=Object.freeze([
 {id:"core_west",a:"core",aPort:"west",b:"west_forest",bPort:"east",kind:"forest_path",label:"森へ続く道",travelCost:1,travel:{mode:"walk",autoTransition:true,fastTravel:false}},
 {id:"core_south",a:"core",aPort:"south",b:"south_road",bPort:"north",kind:"road",label:"南の街道",travelCost:1,travel:{mode:"walk",autoTransition:true,fastTravel:false}},
 {id:"core_east",a:"core",aPort:"east",b:"east_riverside",bPort:"west",kind:"bridge",label:"川辺への道",travelCost:1,travel:{mode:"walk",autoTransition:true,fastTravel:false}},
 {id:"core_north",a:"core",aPort:"north",b:"north_highland",bPort:"south",kind:"stairs",label:"高台への道",travelCost:2,travel:{mode:"walk",autoTransition:true,fastTravel:false}}
]);
F.connectionKind=id=>F.CONNECTION_KIND_DEFS?.[id]||null;
F.travelMode=id=>F.TRAVEL_MODE_DEFS?.[id]||null;

F.AREA_STATE_ORDER=Object.freeze(["locked","discovered","clearing","usable","developed"]);
F.AREA_STATE_INFO=Object.freeze({
 locked:{label:"未発見",icon:"🔒"}, discovered:{label:"発見",icon:"👀"}, clearing:{label:"開拓中",icon:"🪓"},
 usable:{label:"利用可能",icon:"🚶"}, developed:{label:"整備済み",icon:"🏘️"}
});


// Ver0.39: 各実マップを作り込む前に、全エリアを同じ規格で扱うSceneSpecを定義する。
// 1000x1000の論理座標で設計し、実Canvasサイズへコンパイルする。将来マップ画像のサイズやカメラ方式が変わっても、
// 施設枠・工事枠・NPC活動域・入口/出口・将来拡張口の意味は維持できる。
F.AREA_VIEW_PROFILES=Object.freeze({
 town_mobile:{id:"town_mobile",label:"町フィールド（スマホ）",canvas:{w:717,h:842},playfield:{x:0,y:0,w:590,h:842},uiReserved:{x:590,y:0,w:127,h:842},camera:"fixed-area"}
});
F.AREA_SCENE_SCHEMA=Object.freeze({
 version:1,logical:{w:1000,h:1000},defaultViewProfile:"town_mobile",
 zoneKinds:Object.freeze({
  walk:{label:"主要通行域",icon:"👣"},facility:{label:"施設配置枠",icon:"🏠"},construction:{label:"工事用退避域",icon:"🏗️"},
  npc:{label:"NPC活動域",icon:"🧑"},landmark:{label:"ランドマーク枠",icon:"📍"},service:{label:"物流・裏動線",icon:"📦"}
 }),
 required:["walk","facility","construction","npc"],
 note:"見た目の画像とは独立した論理仕様。実マップ確定後も、同じSceneSpecから通行・建築・NPC・接続を組み立てる。"
});
F.areaViewProfile=id=>F.AREA_VIEW_PROFILES?.[id]||F.AREA_VIEW_PROFILES?.[F.AREA_SCENE_SCHEMA?.defaultViewProfile]||null;

// normalized座標はplayfield内を 0..1000 とする。portsも同じ規格で、隣接エリア追加時に接続定義から自動生成する。
F.AREA_SCENE_TEMPLATE_DEFS=Object.freeze({
 hub:{id:"hub",label:"中心・広場型",icon:"🔶",zones:[
  {id:"walk_ns",kind:"walk",shape:"rect",v:[420,0,160,1000]},{id:"walk_ew",kind:"walk",shape:"rect",v:[0,405,1000,190]},
  {id:"walk_center",kind:"walk",shape:"circle",v:[500,500,210]},
  {id:"facility_nw",kind:"facility",slot:1,shape:"rect",v:[55,75,280,250]},{id:"facility_ne",kind:"facility",slot:2,shape:"rect",v:[665,75,280,250]},
  {id:"facility_w",kind:"facility",slot:3,shape:"rect",v:[55,650,260,240]},{id:"facility_e",kind:"facility",slot:4,shape:"rect",v:[685,650,260,240]},
  {id:"facility_mid_w",kind:"facility",slot:5,shape:"rect",v:[65,330,245,185]},{id:"facility_mid_e",kind:"facility",slot:6,shape:"rect",v:[690,330,245,185]},
  {id:"facility_center_s",kind:"facility",slot:7,shape:"rect",v:[355,635,290,205]},
  {id:"landmark_center",kind:"landmark",slot:1,shape:"circle",v:[500,500,120]},{id:"landmark_north",kind:"landmark",slot:2,shape:"rect",v:[420,95,160,135]},
  {id:"construction_w",kind:"construction",shape:"rect",v:[40,285,275,150]},{id:"construction_e",kind:"construction",shape:"rect",v:[685,285,275,150]},
  {id:"construction_s",kind:"construction",shape:"rect",v:[335,700,330,170]},
  {id:"npc_center",kind:"npc",shape:"circle",v:[500,510,255]},{id:"npc_market",kind:"npc",shape:"rect",v:[625,300,315,330]},{id:"npc_life",kind:"npc",shape:"rect",v:[55,575,310,315]},
  {id:"service_north",kind:"service",shape:"rect",v:[350,0,300,155]}
 ],ports:{north:{shape:"rect",v:[420,0,160,82],arrival:[500,105]},south:{shape:"rect",v:[405,918,190,82],arrival:[500,890]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},nw:{shape:"rect",v:[0,90,82,130],arrival:[105,155]},ne:{shape:"rect",v:[918,90,82,130],arrival:[890,155]}}},
 corridor:{id:"corridor",label:"街道・回廊型",icon:"🛣️",zones:[
  {id:"walk_main",kind:"walk",shape:"rect",v:[405,0,190,1000]},{id:"walk_cross_n",kind:"walk",shape:"rect",v:[210,215,580,150]},{id:"walk_cross_s",kind:"walk",shape:"rect",v:[185,620,630,150]},
  {id:"facility_l1",kind:"facility",slot:1,shape:"rect",v:[40,80,300,190]},{id:"facility_r1",kind:"facility",slot:2,shape:"rect",v:[660,80,300,190]},
  {id:"facility_l2",kind:"facility",slot:3,shape:"rect",v:[40,300,300,190]},{id:"facility_r2",kind:"facility",slot:4,shape:"rect",v:[660,300,300,190]},
  {id:"facility_l3",kind:"facility",slot:5,shape:"rect",v:[40,525,300,190]},{id:"facility_r3",kind:"facility",slot:6,shape:"rect",v:[660,525,300,190]},
  {id:"facility_l4",kind:"facility",slot:7,shape:"rect",v:[40,745,300,190]},{id:"facility_r4",kind:"facility",slot:8,shape:"rect",v:[660,745,300,190]},
  {id:"landmark_mid",kind:"landmark",slot:1,shape:"rect",v:[425,410,150,150]},
  {id:"construction_l",kind:"construction",shape:"rect",v:[65,390,250,170]},{id:"construction_r",kind:"construction",shape:"rect",v:[685,390,250,170]},
  {id:"npc_road",kind:"npc",shape:"rect",v:[345,70,310,860]},{id:"npc_merchants",kind:"npc",shape:"rect",v:[80,240,840,500]},
  {id:"service_logistics",kind:"service",shape:"rect",v:[30,800,330,150]}
 ],ports:{north:{shape:"rect",v:[405,0,190,82],arrival:[500,110]},south:{shape:"rect",v:[405,918,190,82],arrival:[500,890]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]}}},
 branch_forest:{id:"branch_forest",label:"森・枝分かれ型",icon:"🌲",zones:[
  {id:"walk_trunk",kind:"walk",shape:"rect",v:[430,0,155,1000]},{id:"walk_branch_w",kind:"walk",shape:"rect",v:[100,360,390,145]},{id:"walk_branch_e",kind:"walk",shape:"rect",v:[520,610,365,145]},
  {id:"facility_1",kind:"facility",slot:1,shape:"rect",v:[90,95,270,210]},{id:"facility_2",kind:"facility",slot:2,shape:"rect",v:[650,95,255,210]},
  {id:"facility_3",kind:"facility",slot:3,shape:"rect",v:[85,545,275,215]},{id:"facility_4",kind:"facility",slot:4,shape:"rect",v:[645,470,270,205]},
  {id:"facility_5",kind:"facility",slot:5,shape:"rect",v:[365,760,280,185]},
  {id:"landmark_forest",kind:"landmark",slot:1,shape:"circle",v:[510,475,115]},
  {id:"construction_clearing",kind:"construction",shape:"rect",v:[315,285,380,180]},
  {id:"npc_trail",kind:"npc",shape:"rect",v:[330,70,350,860]},{id:"npc_gather",kind:"npc",shape:"rect",v:[80,300,835,460]},
  {id:"service_gather",kind:"service",shape:"rect",v:[70,770,275,160]}
 ],ports:{east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},north:{shape:"rect",v:[430,0,155,82],arrival:[510,110]},south:{shape:"rect",v:[430,918,155,82],arrival:[510,890]}}},
 riverside:{id:"riverside",label:"川辺・水路型",icon:"🌊",zones:[
  {id:"walk_bank",kind:"walk",shape:"rect",v:[120,360,760,190]},{id:"walk_spine",kind:"walk",shape:"rect",v:[430,0,160,1000]},
  {id:"facility_1",kind:"facility",slot:1,shape:"rect",v:[70,80,280,220]},{id:"facility_2",kind:"facility",slot:2,shape:"rect",v:[650,80,280,220]},
  {id:"facility_3",kind:"facility",slot:3,shape:"rect",v:[70,610,280,220]},{id:"facility_4",kind:"facility",slot:4,shape:"rect",v:[650,610,280,220]},
  {id:"facility_5",kind:"facility",slot:5,shape:"rect",v:[365,600,270,210]},
  {id:"landmark_water",kind:"landmark",slot:1,shape:"rect",v:[385,310,230,170]},
  {id:"construction_bank",kind:"construction",shape:"rect",v:[115,555,770,140]},
  {id:"npc_waterfront",kind:"npc",shape:"rect",v:[110,260,780,470]},{id:"service_dock",kind:"service",shape:"rect",v:[670,720,250,170]}
 ],ports:{west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},south:{shape:"rect",v:[430,918,160,82],arrival:[510,890]},north:{shape:"rect",v:[430,0,160,82],arrival:[510,110]}}},
 terrace:{id:"terrace",label:"高台・段丘型",icon:"⛰️",zones:[
  {id:"walk_steps",kind:"walk",shape:"rect",v:[430,0,150,1000]},{id:"walk_upper",kind:"walk",shape:"rect",v:[180,235,650,155]},{id:"walk_lower",kind:"walk",shape:"rect",v:[140,620,720,165]},
  {id:"facility_1",kind:"facility",slot:1,shape:"rect",v:[75,60,285,200]},{id:"facility_2",kind:"facility",slot:2,shape:"rect",v:[640,60,285,200]},
  {id:"facility_3",kind:"facility",slot:3,shape:"rect",v:[70,410,300,205]},{id:"facility_4",kind:"facility",slot:4,shape:"rect",v:[630,410,300,205]},
  {id:"facility_5",kind:"facility",slot:5,shape:"rect",v:[350,755,300,180]},
  {id:"landmark_view",kind:"landmark",slot:1,shape:"rect",v:[390,395,220,170]},
  {id:"construction_terrace",kind:"construction",shape:"rect",v:[220,535,560,145]},
  {id:"npc_upper",kind:"npc",shape:"rect",v:[150,130,700,340]},{id:"npc_lower",kind:"npc",shape:"rect",v:[120,530,760,360]},
  {id:"service_rock",kind:"service",shape:"rect",v:[675,725,230,175]}
 ],ports:{south:{shape:"rect",v:[430,918,150,82],arrival:[505,890]},north:{shape:"rect",v:[430,0,150,82],arrival:[505,110]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]}}}
});
F.areaSceneTemplateDef=id=>F.AREA_SCENE_TEMPLATE_DEFS?.[id]||null;

// area.world の主要項目
// sizeClass: 実マップの相対規模 / terrainTags: 地形特性 / capacity: 施設・住民の収容目安
// travelCost: 隣接移動の重さ / expansionProfiles: その先に生成しやすい将来エリア候補
F.AREA_DEFS=Object.freeze([
 {id:"core",name:"中心開拓地",icon:"🏕️",tags:["core","commerce","life"],
  world:{gx:0,gy:0,role:"hub",sceneStatus:"prototype",sizeClass:"hub",theme:"frontier_core",growth:"organic",sceneTemplate:"hub",viewProfile:"town_mobile",travelCost:1,
   terrainTags:["open","river_edge","frontier"],capacity:{facilitySlots:7,landmarkSlots:2,residentCapacity:16},futurePorts:["nw","ne"],
   expansionProfiles:{nw:["pasture","deep_forest"],ne:["highland_meadow","far_bank"]}},
  startState:"usable",description:"露店と掘っ立て小屋から始まる最初の拠点。最終配置は全体構成確定後に再設計する。",transitions:{},nav:{scene:{w:717,h:842,cell:12},worldRect:{x:0,y:0,w:590,h:842},spawn:{x:350,y:475},entries:{south_road:{x:265,y:710},west_forest:{x:70,y:345},east_riverside:{x:520,y:445},north_highland:{x:480,y:92}},exits:[
   {id:"west",to:"west_forest",x:0,y:260,w:44,h:170,entry:{x:55,y:345}},
   {id:"south",to:"south_road",x:170,y:742,w:190,h:100,entry:{x:265,y:725}},
   {id:"east",to:"east_riverside",x:548,y:355,w:42,h:185,entry:{x:530,y:445}},
   {id:"north",to:"north_highland",x:430,y:0,w:105,h:70,entry:{x:480,y:82}}
  ]}},
 {id:"west_forest",name:"西の森外縁",icon:"🌲",tags:["nature","adventure"],
  world:{gx:-1,gy:0,role:"expansion",sceneStatus:"planned",sizeClass:"wide",theme:"forest_edge",growth:"branch",sceneTemplate:"branch_forest",viewProfile:"town_mobile",travelCost:2,
   terrainTags:["forest","nature","gathering"],capacity:{facilitySlots:5,landmarkSlots:1,residentCapacity:7},futurePorts:["west","north"],
   expansionProfiles:{west:["deep_forest"],north:["pasture","foothill"]}},
  startState:"locked",description:"冒険・採集系の拠点へ伸ばしやすい森側の土地。",nav:{scene:{w:717,h:842,cell:18},entryFrom:{area:"core",gate:"west"}},transitions:{
   discovered:{need:8,label:"西の森を調べる"},clearing:{need:12,label:"西の森を切り開く"},usable:{need:18,label:"森側の区画を使えるようにする"},developed:{need:40,label:"森側の道と設備を整える"}}},
 {id:"south_road",name:"南の街道沿い",icon:"🛤️",tags:["road","commerce","logistics"],
  world:{gx:0,gy:1,role:"expansion",sceneStatus:"prototype",sizeClass:"wide",theme:"roadside",growth:"corridor",sceneTemplate:"corridor",viewProfile:"town_mobile",travelCost:1,
   terrainTags:["road","open","commerce"],capacity:{facilitySlots:8,landmarkSlots:1,residentCapacity:12},futurePorts:["south","east","west"],
   expansionProfiles:{south:["trade_route"],east:["plain"],west:["pasture","plain"]}},
  startState:"locked",description:"行商・市場・倉庫など商業と物流を伸ばしやすい街道側。Ver0.38ではエリア接続確認用の仮実マップを持つ。",
  nav:{scene:{w:717,h:842,cell:14},worldRect:{x:0,y:0,w:590,h:842},spawn:{x:295,y:110},entries:{core:{x:295,y:92}},
   exits:[{id:"north",to:"core",x:205,y:0,w:180,h:76,entry:{x:295,y:92}}],
   base:{defaultWalkable:true,
    blocks:[
     {shape:"rect",v:[0,0,42,842],reason:"west_edge"},{shape:"rect",v:[570,0,20,842],reason:"east_edge"},
     {shape:"poly",v:[[42,70],[165,70],[190,210],[150,300],[42,330]],reason:"west_woods"},
     {shape:"poly",v:[[425,45],[570,45],[570,315],[505,300],[450,220]],reason:"east_woods"},
     {shape:"rect",v:[78,345,125,90],reason:"roadside_cart"},{shape:"rect",v:[410,390,125,105],reason:"roadside_stock"},
     {shape:"circle",v:[122,560,46],reason:"camp"},{shape:"rect",v:[430,600,105,75],reason:"field_fence"},
     {shape:"poly",v:[[45,720],[215,715],[235,842],[45,842]],reason:"southwest_rough"},{shape:"poly",v:[[400,720],[570,710],[570,842],[380,842]],reason:"southeast_rough"}
    ],
    walk:[{shape:"poly",v:[[230,0],[365,0],[385,842],[205,842]],reason:"main_road"},{shape:"rect",v:[175,280,260,300],reason:"roadside_open"}],
    interactions:[{id:"south_sign",type:"scenery",label:"街道の道しるべ",x:365,y:330,r:44},{id:"south_cart",type:"scenery",label:"行商人の荷車",x:210,y:420,r:48}],
    npcWaypoints:[{id:"north_gate",x:295,y:100},{id:"road_mid",x:300,y:380},{id:"cart",x:220,y:455},{id:"camp",x:175,y:560},{id:"south_way",x:300,y:690}]
   }
  },transitions:{
   discovered:{need:10,label:"南の街道を調べる"},clearing:{need:14,label:"街道脇を整地する"},usable:{need:22,label:"街道沿いを町域にする"},developed:{need:44,label:"物流路として整備する"}}},
 {id:"east_riverside",name:"東の川辺",icon:"🌊",tags:["water","life","craft"],
  world:{gx:1,gy:0,role:"expansion",sceneStatus:"planned",sizeClass:"standard",theme:"riverside",growth:"branch",sceneTemplate:"riverside",viewProfile:"town_mobile",travelCost:2,
   terrainTags:["water","river","life"],capacity:{facilitySlots:5,landmarkSlots:1,residentCapacity:9},futurePorts:["east","south"],
   expansionProfiles:{east:["far_bank"],south:["wetland"]}},
  startState:"locked",description:"水場を生かした生活・加工・研究方面へ伸ばしやすい川辺。",nav:{scene:{w:717,h:842,cell:18},entryFrom:{area:"core",gate:"east"}},transitions:{
   discovered:{need:12,label:"川辺を調べる"},clearing:{need:18,label:"川辺を安全にする"},usable:{need:28,label:"川辺の区画を使えるようにする"},developed:{need:50,label:"護岸と通路を整える"}}},
 {id:"north_highland",name:"北の高台",icon:"⛰️",tags:["rock","forge","residential"],
  world:{gx:0,gy:-1,role:"expansion",sceneStatus:"planned",sizeClass:"standard",theme:"highland",growth:"terrace",sceneTemplate:"terrace",viewProfile:"town_mobile",travelCost:2,
   terrainTags:["highland","rock","residential"],capacity:{facilitySlots:5,landmarkSlots:1,residentCapacity:10},futurePorts:["north","east","west"],
   expansionProfiles:{north:["foothill"],east:["quarry"],west:["highland_meadow"]}},
  startState:"locked",description:"岩場と高低差を生かし、工房・住宅・鉱山方面へつなげやすい土地。",nav:{scene:{w:717,h:842,cell:18},entryFrom:{area:"core",gate:"north"}},transitions:{
   discovered:{need:14,label:"北の高台を調べる"},clearing:{need:22,label:"高台への道を作る"},usable:{need:32,label:"高台を町域にする"},developed:{need:54,label:"高台の階段と道を整える"}}}
]);
F.areaDef=id=>(F.AREA_DEFS||[]).find(a=>a.id===id)||null;

// Ver0.28: 町の見た目は「固定ベース + 細かな景観レイヤー + 施設レイヤー」。
// TEST画面はこの定義をそのまま列挙する。asset は major/detail のどちらのアトラスを使うかを示す。
F.TOWN_RENDER_BANDS=Object.freeze(["ground","structure","low","character","front"]);
// Ver0.33: 見た目と移動判定を同じ町データから生成する。画像解析は行わない。
// shape: rect=[x,y,w,h] / circle=[cx,cy,r]。walk は block より後に再開放する。
F.TOWN_ACTOR_NAV_PROFILES=Object.freeze({
 player:{radius:10,step:"walk"},partner:{radius:8,step:"follow",followDistance:34},npc:{radius:9,step:"routine"}
});
F.TOWN_NAV_BASE=Object.freeze({
 areaId:"core",defaultWalkable:true,
 // Ver0.33: 初期開拓地の実景観に合わせて障害物を細分化。
 // 大きな矩形1枚ではなく、小屋・露店・焚き火・資材・川岸などを別判定にする。
 blocks:[
   {shape:"rect",v:[0,0,42,842],reason:"west_forest"},{shape:"rect",v:[570,0,20,842],reason:"east_edge"},
   {shape:"rect",v:[0,0,590,35],reason:"north_forest"},
   {shape:"rect",v:[0,630,590,212],reason:"river"},
   {shape:"poly",v:[[72,110],[275,110],[315,155],[315,315],[92,325],[55,265]],reason:"starter_shop"},
   {shape:"poly",v:[[278,50],[455,55],[470,205],[430,245],[275,235]],reason:"starter_hut"},
   {shape:"circle",v:[505,282,43],reason:"campfire"},
   {shape:"rect",v:[70,430,125,48],reason:"logs_west"},{shape:"circle",v:[207,485,26],reason:"stump_west"},
   {shape:"rect",v:[472,430,62,58],reason:"sign_east"},{shape:"rect",v:[506,520,84,115],reason:"tent_east"},
   {shape:"circle",v:[462,355,18],reason:"rock_mid"},{shape:"circle",v:[250,515,20],reason:"rock_southwest"}
 ],
 walk:[
   {shape:"poly",v:[[176,585],[360,585],[365,720],[335,755],[185,755],[165,700]],reason:"bridge"},
   {shape:"rect",v:[185,720,170,122],reason:"south_path"},
   {shape:"poly",v:[[426,0],[535,0],[520,115],[450,125],[420,70]],reason:"north_path"}
 ],
 interactions:[
   {id:"starter_shop",type:"facility",label:"露店",x:255,y:320,r:55,facilityId:"shop"},
   {id:"campfire",type:"scenery",label:"焚き火",x:470,y:350,r:42}
 ],
 npcWaypoints:[
   {id:"center",x:350,y:470},{id:"shop_front",x:275,y:350},{id:"bridge_north",x:270,y:600},
   {id:"camp",x:455,y:365},{id:"north_path",x:475,y:135},{id:"south_path",x:270,y:585}
 ]
});
// Ver0.28: 描画順は z 値だけに依存せず band（地面→施設→低い小物→人物→前景）で固定する。
// これにより、将来レイヤーが増えても道・石畳などが人物の上に描画される事故を防ぐ。
F.TOWN_LAYER_DEFS=Object.freeze([
 {id:"base",group:"基礎",label:"0pt 初期開拓地（固定ベース）",icon:"🌿",kind:"base",band:"ground",z:0,locked:true,auto:{type:"always"}},

 {id:"path_clear",group:"道・整備",exclusiveGroup:"road",rank:1,nav:{walk:[{shape:"rect",v:[270,235,175,285],reason:"cleared_path"}]},label:"6pt 踏み跡が少し整う",icon:"👣",kind:"atlas",asset:"detail",band:"ground",z:10,auto:{type:"pointsGte",value:6},atlas:{sx:326,sy:4,sw:150,sh:230,dx:285,dy:250,dw:150,dh:230}},
 {id:"stone_path",group:"道・整備",exclusiveGroup:"road",rank:2,nav:{walk:[{shape:"rect",v:[260,225,205,310],reason:"stone_path"}]},label:"16pt 道の一部が石敷きになる",icon:"🧱",kind:"atlas",asset:"detail",band:"ground",z:20,auto:{type:"pointsGte",value:16},atlas:{sx:814,sy:238,sw:190,sh:260,dx:270,dy:250,dw:190,dh:260}},

 {id:"shop2",group:"施設",exclusiveGroup:"shop_stage",rank:2,nav:{blocks:[{shape:"rect",v:[32,55,286,205],reason:"shop_lv2"}],walk:[{shape:"rect",v:[160,255,78,62],reason:"shop_entrance"}],entrances:[{id:"shop_door",x:198,y:282,facing:"north"}],interactions:[{id:"shop",type:"facility",label:"店",x:198,y:300,r:40,facilityId:"shop"}]},label:"店 Lv2（施設本体）",icon:"🏪",kind:"atlas",asset:"facility",band:"structure",z:30,facilityId:"shop",auto:{type:"facilityGte",facilityId:"shop",value:2},atlas:{sx:0,sy:0,sw:325,sh:285,dx:0,dy:0,dw:325,dh:285}},
 {id:"forge",group:"施設",nav:{blocks:[{shape:"rect",v:[355,55,225,210],reason:"forge"}],walk:[{shape:"rect",v:[430,250,78,62],reason:"forge_entrance"}],entrances:[{id:"forge_door",x:470,y:282,facing:"north"}],interactions:[{id:"forge",type:"facility",label:"鍛冶屋",x:470,y:300,r:42,facilityId:"forge"}]},label:"鍛冶屋 Lv1（施設本体）",icon:"⚒️",kind:"atlas",asset:"facility",band:"structure",z:32,facilityId:"forge",auto:{type:"facilityGte",facilityId:"forge",value:1},atlas:{sx:325,sy:0,sw:382,sh:310,dx:335,dy:0,dw:382,dh:310}},
 {id:"house",group:"施設",nav:{blocks:[{shape:"rect",v:[25,385,285,205],reason:"house"}],walk:[{shape:"rect",v:[145,570,75,70],reason:"house_entrance"}],entrances:[{id:"house_door",x:182,y:610,facing:"north"}],interactions:[{id:"house",type:"facility",label:"住居",x:182,y:625,r:40,facilityId:"house"}]},label:"住居 Lv1（施設本体）",icon:"🏠",kind:"atlas",asset:"facility",band:"structure",z:34,facilityId:"house",auto:{type:"facilityGte",facilityId:"house",value:1},atlas:{sx:340,sy:325,sw:350,sh:320,dx:0,dy:345,dw:350,dh:320}},
 {id:"market",group:"施設",nav:{blocks:[{shape:"rect",v:[448,315,118,110],reason:"market_stall"}],interactions:[{id:"market",type:"facility",label:"市場",x:432,y:420,r:44,facilityId:"market"}]},label:"市場 Lv1（施設本体）",icon:"🧺",kind:"atlas",asset:"facility",band:"structure",z:36,facilityId:"market",auto:{type:"facilityGte",facilityId:"market",value:1},atlas:{sx:690,sy:325,sw:160,sh:300,dx:425,dy:290,dw:160,dh:300}},

 {id:"flowers",group:"装飾・明かり",label:"14pt 小さな花壇ができる",icon:"🌼",kind:"atlas",asset:"detail",band:"low",z:14,auto:{type:"pointsGte",value:14},atlas:{sx:336,sy:238,sw:250,sh:100,dx:245,dy:325,dw:250,dh:100}},
 {id:"benches",group:"生活基盤",nav:{blocks:[{shape:"rect",v:[245,445,85,28],reason:"bench"},{shape:"rect",v:[400,445,85,28],reason:"bench"}]},label:"22pt ベンチが置かれる",icon:"🪑",kind:"atlas",asset:"detail",band:"low",z:16,auto:{type:"pointsGte",value:22},atlas:{sx:362,sy:502,sw:270,sh:70,dx:225,dy:430,dw:270,dh:70}},
 {id:"plaza_fountain",group:"町並み",nav:{blocks:[{shape:"circle",v:[370,350,58],reason:"fountain"}],interactions:[{id:"fountain",type:"scenery",label:"噴水",x:370,y:420,r:48}]},label:"24pt以降：広場の噴水",icon:"⛲",kind:"atlas",asset:"detail",band:"low",z:18,facilityId:"plaza",auto:{type:"all",rules:[{type:"pointsGte",value:24},{type:"facilityGte",facilityId:"plaza",value:1}]},atlas:{sx:238,sy:502,sw:120,sh:100,dx:310,dy:300,dw:120,dh:100}},

 {id:"visitor_first",group:"人・生活",label:"2pt 最初の旅人",icon:"🚶",kind:"npc",band:"character",z:10,auto:{type:"pointsGte",value:2},parts:[{sprite:0,dx:492,dy:292,dw:64,dh:80}]},
 {id:"resident_more",group:"人・生活",label:"12pt 住民が少し増える",icon:"🧑",kind:"npc",band:"character",z:12,auto:{type:"pointsGte",value:12},parts:[{sprite:1,dx:238,dy:465,dw:64,dh:80},{sprite:2,dx:302,dy:478,dw:64,dh:80}]},

 {id:"street_lamps",group:"装飾・明かり",nav:{blocks:[{shape:"circle",v:[325,370,14],reason:"lamp"},{shape:"circle",v:[435,370,14],reason:"lamp"}]},exclusiveGroup:"town_lighting",rank:2,label:"18pt 街灯が付き始める",icon:"🏮",kind:"atlas",asset:"detail",band:"front",z:12,auto:{type:"pointsGte",value:18},atlas:{sx:590,sy:238,sw:220,sh:90,dx:270,dy:340,dw:220,dh:90}},
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
