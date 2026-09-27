/* FRENDA_RULES_VERSION: 1.1 / Updated: 2026-09-27 19:55 JST */
(()=>{
"use strict";
const CORE=window.FRENDA_CORE||null;
const THEME_ORDER=["forest","wetlands","volcano","icefire","steelmine","powerplant","skygarden","dragon","nightcity","phantom"];
const THEMES={
 forest:{id:"forest",name:"森のダンジョン",types:["くさ","むし"],icon:"🌳"},
 wetlands:{id:"wetlands",name:"湿地のダンジョン",types:["みず","じめん"],icon:"💧"},
 volcano:{id:"volcano",name:"火山のダンジョン",types:["ほのお","いわ"],icon:"🌋"},
 icefire:{id:"icefire",name:"氷炎の洞窟",types:["こおり","ほのお"],icon:"❄️"},
 steelmine:{id:"steelmine",name:"鋼鉄鉱山",types:["はがね","じめん"],icon:"⛏️"},
 powerplant:{id:"powerplant",name:"廃発電所",types:["でんき","どく"],icon:"⚡"},
 skygarden:{id:"skygarden",name:"天空庭園",types:["ひこう","フェアリー"],icon:"☁️"},
 dragon:{id:"dragon",name:"竜の修練場",types:["ドラゴン","かくとう"],icon:"🐉"},
 nightcity:{id:"nightcity",name:"夜の街",types:["あく","ノーマル"],icon:"🌙"},
 phantom:{id:"phantom",name:"幻影遺跡",types:["ゴースト","エスパー"],icon:"👻"}
};
const ENEMY_GRADE_RATES={1:{2:60,3:30,4:9,5:1},2:{2:45,3:35,4:17,5:3},3:{2:30,3:40,4:24,5:6},4:{2:20,3:35,4:35,5:10},5:{2:10,3:30,4:40,5:20}};
const EXP_TO_DRILL=100;
const BOND_LEVEL_THRESHOLDS=[0,1,3,6,10,15];
const EGG_DEF={normal:{label:"ふつうの卵",short:"ふつう",icon:"🥚",required:10},rare:{label:"レア卵",short:"レア",icon:"✨🥚",required:12},super:{label:"スーパーレア卵",short:"Sレア",icon:"🌟🥚",required:16},type:{label:"タイプ卵",short:"タイプ",icon:"🎨🥚",required:12}};
const CAPTURE_BASE_RATE={2:.30,3:.15,4:.07,5:.03};
const BALL_MULT={poke:1,super:3,hyper:10,master:Infinity};
const EVO_GRADE_WEIGHTS={2:50,3:30,4:15,5:5};
const TRAINING_STEP=3;
const PERMANENT_BOOST_MAX=30;
const EGG_CAP_BASE=2,EGG_CAP_PER_CLEARS=10,EGG_CAP_MAX=10;
const LEGENDARY_NAMES=new Set([
"フリーザー","サンダー","ファイヤー","ミュウツー","ライコウ","エンテイ","スイクン","ルギア","ホウオウ",
"レジロック","レジアイス","レジスチル","ラティアス","ラティオス","カイオーガ","グラードン","レックウザ",
"ユクシー","エムリット","アグノム","ディアルガ","パルキア","ヒードラン","レジギガス","ギラティナ","クレセリア",
"コバルオン","テラキオン","ビリジオン","トルネロス","ボルトロス","レシラム","ゼクロム","ランドロス","キュレム",
"ゼルネアス","イベルタル","ジガルデ","タイプ：ヌル","タイプ:ヌル","シルヴァディ","カプ・コケコ","カプ・テテフ","カプ・ブルル","カプ・レヒレ","コスモッグ","コスモウム","ソルガレオ","ルナアーラ","ネクロズマ",
"ザシアン","ザマゼンタ","ムゲンダイナ","ダクマ","ウーラオス","レジエレキ","レジドラゴ","ブリザポス","レイスポス","バドレックス","ラブトロス",
"コライドン","ミライドン","チオンジェン","パオジアン","ディンルー","イーユイ","オーガポン","テラパゴス"
]);
const MYTHICAL_NAMES=new Set([
"ミュウ","セレビィ","ジラーチ","デオキシス","フィオネ","マナフィ","ダークライ","シェイミ","アルセウス",
"ビクティニ","ケルディオ","メロエッタ","ゲノセクト","ディアンシー","フーパ","ボルケニオン","マギアナ","マーシャドー","ゼラオラ","メルタン","メルメタル","ザルード","モモワロウ"
]);

function weightedChoice(map,rng=Math.random){
 const a=Object.entries(map||{}),sum=a.reduce((n,[,w])=>n+Math.max(0,Number(w)||0),0);
 if(!a.length||sum<=0)return null;
 let x=Math.max(0,Math.min(.9999999999999999,Number(rng())||0))*sum;
 for(const [k,w0] of a){x-=Math.max(0,Number(w0)||0);if(x<=0)return k}
 return a[a.length-1]?.[0]??null;
}
function familyKey(id,record,evolutionRootNo=null){
 if(evolutionRootNo!==null&&evolutionRootNo!==undefined&&evolutionRootNo!=="")return `evo:${evolutionRootNo}`;
 return record?.evolution_family||record?.evo_family||record?.family_id||record?.name_ja||id;
}
function addBondPoints(state,key,n=1){
 if(!state||!key)return 0;state.bondPoints=state.bondPoints||{};
 const next=Number(state.bondPoints[key]||0)+Math.max(0,Number(n)||0);state.bondPoints[key]=next;return next;
}
function awardGrowthOrDrill(state,id,n=1,{key=id,hasEvolution=false}={}){
 const amount=Math.max(0,Number(n)||0);
 if(!state||!id||!amount)return {kind:"none",amount:0};
 state.trainingPoints=state.trainingPoints||{};state.drillPoints=state.drillPoints||{};
 if(hasEvolution){state.trainingPoints[key]=Number(state.trainingPoints[key]||0)+amount;return {kind:"growth",amount}}
 state.drillPoints[id]=Number(state.drillPoints[id]||0)+amount;return {kind:"drill",amount};
}
function eggRequired(kind,fallback=10){return Number(EGG_DEF[kind]?.required||fallback||10)}
function eggCapFromClears(totalClears){return Math.min(EGG_CAP_MAX,EGG_CAP_BASE+Math.floor(Math.max(0,Number(totalClears)||0)/EGG_CAP_PER_CLEARS))}
function captureRate(grade,ballKey,captureBoost=0){
 if(ballKey==="master")return 1;
 const base=CAPTURE_BASE_RATE[Number(grade)]??.03,m=BALL_MULT[ballKey]||1,boost=1+Math.max(0,Number(captureBoost)||0);
 return Math.min(1,base*m*boost);
}
function validBattle(r){return !!(r&&Number(r.hp)>0&&Number(r.atk)>0&&Number(r.def)>0&&Number(r.sp_atk)>0&&Number(r.sp_def)>0&&r.move_type)}
function gradeText(r){return r?.grade?"★"+r.grade:"★-"}
function specialBaseName(r){return String(r?.name_ja||"").replace(/[（(].*$/," ").trim()}
function isLegendary(r){return LEGENDARY_NAMES.has(specialBaseName(r))}
function isMythical(r){return MYTHICAL_NAMES.has(specialBaseName(r))}
function isSpecial(r){return isLegendary(r)||isMythical(r)}
function allowedByDungeonDifficulty(r,diff){return Number(diff)===5||!isSpecial(r)}
function bondLevelFromPoints(points){const p=Math.max(0,Number(points)||0);let lv=0;for(let i=1;i<BOND_LEVEL_THRESHOLDS.length;i++)if(p>=BOND_LEVEL_THRESHOLDS[i])lv=i;return Math.min(5,lv)}
function applyXp(state,id,amount){
 if(!state||!id)return {xp:0,drillGained:0};
 state.experience=state.experience||{};state.drillPoints=state.drillPoints||{};
 let xp=Number(state.experience[id]||0)+Math.max(0,Number(amount)||0),drillGained=0;
 while(xp>=EXP_TO_DRILL){xp-=EXP_TO_DRILL;drillGained++}
 state.experience[id]=xp;
 if(drillGained)state.drillPoints[id]=Number(state.drillPoints[id]||0)+drillGained;
 return {xp,drillGained};
}
function themePool(records,dungeonId,difficulty,{companions=false}={}){
 const th=THEMES[dungeonId]||THEMES.forest,rates=ENEMY_GRADE_RATES[difficulty]||ENEMY_GRADE_RATES[1];
 let pool=(Array.isArray(records)?records:[]).filter(validBattle).filter(r=>Number(difficulty)===5||!isSpecial(r));
 if(companions)pool=pool.filter(r=>!isSpecial(r));
 const themed=pool.filter(r=>[r.type1,r.type2,r.move_type].some(t=>th.types.includes(t)));
 if(themed.length>=10)pool=themed;
 return pool.map(r=>({r,w:Number(rates[Number(r.grade)]||0)})).filter(x=>x.w>0);
}
function baselineEnergy(records,dungeonId,difficulty){
 const arr=[];
 for(const {r,w} of themePool(records,dungeonId,difficulty)){
  const e=Number(r.poke_ene)||0;if(!e)continue;
  const n=Math.max(1,Math.round(w/5));for(let i=0;i<n;i++)arr.push(e);
 }
 arr.sort((a,b)=>a-b);return arr.length?arr[Math.floor(arr.length/2)]:100;
}
function recommendedForTheme(r,dungeonId,rawEffFn=CORE?.rawEff){
 const th=THEMES[dungeonId]||THEMES.forest;if(!r||typeof rawEffFn!=="function")return false;
 return th.types.some(t=>(Number(rawEffFn(r.move_type,{type1:t,type2:null}))||1)>1);
}
function explorationScore({team,dungeonId,difficulty,records,rawEff,bondLevelForRecord}={}){
 team=Array.isArray(team)?team.filter(Boolean):[];const count=team.length;
 const numberPts=count===3?30:count===2?18:count===1?8:0;
 const base=baselineEnergy(records,dungeonId,difficulty);
 const avg=count?team.reduce((s,r)=>s+(Number(r.poke_ene)||0),0)/count:0;
 const ratio=base?avg/base:0;
 const strength=ratio<.7?5:ratio<.9?12:ratio<1.1?20:ratio<1.3?27:35;
 const good=team.filter(r=>recommendedForTheme(r,dungeonId,rawEff)).length;
 const typePts=good>=3?25:good===2?18:good===1?10:0;
 const bondGetter=typeof bondLevelForRecord==="function"?bondLevelForRecord:()=>0;
 const avgBond=count?team.reduce((s,r)=>s+(Number(bondGetter(r))||0),0)/count:0;
 const bondPts=Math.round(avgBond/5*10);
 const total=numberPts+strength+typePts+bondPts;
 let rank=total>=85?"S":total>=70?"A":total>=55?"B":total>=40?"C":"D";
 if(count===2&&rank==="S")rank="A";if(count===1&&["S","A"].includes(rank))rank="B";
 return {total,rank,parts:{number:numberPts,strength,type:typePts,bond:bondPts},baseline:Math.round(base),avgEnergy:Math.round(avg),recommended:good};
}
window.FRENDA_RULES={version:"1.1",THEME_ORDER,THEMES,ENEMY_GRADE_RATES,EXP_TO_DRILL,BOND_LEVEL_THRESHOLDS,EGG_DEF,CAPTURE_BASE_RATE,BALL_MULT,EVO_GRADE_WEIGHTS,TRAINING_STEP,PERMANENT_BOOST_MAX,EGG_CAP_BASE,EGG_CAP_PER_CLEARS,EGG_CAP_MAX,LEGENDARY_NAMES,MYTHICAL_NAMES,weightedChoice,familyKey,addBondPoints,awardGrowthOrDrill,eggRequired,eggCapFromClears,captureRate,validBattle,gradeText,specialBaseName,isLegendary,isMythical,isSpecial,allowedByDungeonDifficulty,bondLevelFromPoints,applyXp,themePool,baselineEnergy,recommendedForTheme,explorationScore};
})();
