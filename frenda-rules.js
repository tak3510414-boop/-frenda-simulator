/* FRENDA_RULES_VERSION: 1.2 / Updated: 2026-09-27 19:58 JST */
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
const EVOLUTION_COST_FIRST=2,EVOLUTION_COST_LATER=3;
const EGG_SLOT_RATES={1:{normal:72,rare:18,super:2,type:8},2:{normal:62,rare:24,super:4,type:10},3:{normal:52,rare:28,super:8,type:12},4:{normal:42,rare:30,super:13,type:15},5:{normal:35,rare:28,super:17,type:20}};
const EGG_HATCH_GRADE={normal:{2:60,3:30,4:9,5:1},rare:{2:20,3:45,4:30,5:5},super:{2:5,3:20,4:50,5:25},type:{2:40,3:35,4:20,5:5}};
const SPECIAL_EVOLUTION_TARGETS={"カモネギ":[],"ガラルカモネギ":["ネギガナイト"],"ニャース":["ペルシアン"],"ガラルニャース":["ニャイキング"],"バリヤード":[],"パルデアウパー":["ドオー"]};
const EXPEDITION_BASE_BOX={1:{normal:.90,rare:.09,jackpot:.01},4:{normal:.78,rare:.19,jackpot:.03},8:{normal:.66,rare:.29,jackpot:.05}};
const EXPEDITION_DIFF_BOX={1:{rare:0,jackpot:0},2:{rare:.02,jackpot:0},3:{rare:.04,jackpot:.01},4:{rare:.07,jackpot:.02},5:{rare:.10,jackpot:.03}};
const EXPEDITION_RANK_BOX={D:{rare:-.05,jackpot:-.005},C:{rare:-.02,jackpot:0},B:{rare:0,jackpot:0},A:{rare:.04,jackpot:.01},S:{rare:.08,jackpot:.02}};
const EXPEDITION_EGG_RATE={1:{normal:80,type:15,rare:5,super:0},2:{normal:65,type:20,rare:13,super:2},3:{normal:45,type:25,rare:25,super:5},4:{normal:25,type:25,rare:38,super:12},5:{normal:10,type:25,rare:45,super:20}};
const EXPEDITION_REWARD_WEIGHTS={normal:{xp:45,bond:25,growth:20,allxp:10},rare:{growth:30,egg:25,xp:25,bond:15,combo:5},jackpot:{companion:30,egg:25,growth:20,adventure:15,super:10}};
const FLOOR_PICKUP_RATE=.12;
const PICKUP_WEIGHTS={berry:30,ball:25,candy:20,charm:15,revive:10};
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
function randomChoice(a,rng=Math.random){return Array.isArray(a)&&a.length?a[Math.floor(Math.max(0,Math.min(.9999999999999999,Number(rng())||0))*a.length)]:null}
function evolutionSafeCandidates(candidates,currentGrade){const cur=Math.max(2,Number(currentGrade)||2);return (candidates||[]).filter(r=>Number(r?.grade)>=cur)}
function weightedEvolutionGrade(pool,currentGrade,allowLower=false,rng=Math.random){
 const by={};for(const r of pool||[]){const g=Number(r?.grade);if(g>=2&&g<=5)(by[g]||(by[g]=[])).push(r)}
 const grades=Object.keys(by).map(Number).sort((a,b)=>a-b);if(!grades.length)return null;
 let allowed=grades.filter(g=>g>=Math.max(2,Number(currentGrade)||2));if(!allowed.length&&allowLower)allowed=grades;if(!allowed.length)return null;
 const weights={};for(const g of allowed)weights[g]=EVO_GRADE_WEIGHTS[g]||1;return Number(weightedChoice(weights,rng));
}
function chooseEvolutionCandidate(candidates,currentGrade,{allowLower=false,isOwned=()=>false,rng=Math.random}={}){
 const cur=Math.max(2,Number(currentGrade)||2),all=(candidates||[]).filter(r=>Number(r?.grade)>=2&&Number(r?.grade)<=5),safe=all.filter(r=>Number(r.grade)>=cur);
 let pool=safe.length?safe:(allowLower?all:[]);if(!pool.length)return null;
 const g=weightedEvolutionGrade(pool,cur,allowLower,rng);let p=g?pool.filter(r=>Number(r.grade)===g):pool.slice();if(!p.length)return null;
 const fresh=p.filter(r=>!isOwned(r));if(fresh.length)p=fresh;return randomChoice(p,rng);
}
function chooseHatchRecord({egg,records,pickRecordBySpecies,isSpecialLimitedRecord=()=>false}={}){
 const rates=EGG_HATCH_GRADE[egg?.kind]||EGG_HATCH_GRADE.normal;let g=Number(weightedChoice(rates));
 let pool=(Array.isArray(records)?records:[]).filter(validBattle).filter(r=>allowedByDungeonDifficulty(r,Number(egg?.sourceDifficulty||1)));
 if(egg?.source==="expedition")pool=pool.filter(r=>!isSpecialLimitedRecord(r));
 if(egg?.source==="expedition"&&egg?.sourceDungeonId&&THEMES[egg.sourceDungeonId]){const ts=THEMES[egg.sourceDungeonId].types,themed=pool.filter(r=>[r.type1,r.type2,r.move_type].some(t=>ts.includes(t)));if(themed.length)pool=themed}
 if(egg?.kind==="type"&&egg?.type)pool=pool.filter(r=>r.type1===egg.type||r.type2===egg.type);
 let gp=pool.filter(r=>Number(r.grade)===g);if(!gp.length){const grades=[...new Set(pool.map(r=>Number(r.grade)).filter(Boolean))].sort((a,b)=>Math.abs(a-g)-Math.abs(b-g));gp=pool.filter(r=>Number(r.grade)===grades[0])}
 const pick=typeof pickRecordBySpecies==="function"?pickRecordBySpecies:arr=>randomChoice(arr);return pick(gp)||pick(pool)||null;
}
function eggSlotsFor(difficulty,dungeonId,{chooseThemeEggType,count=8,rng=Math.random}={}){
 const rates=EGG_SLOT_RATES[Number(difficulty)]||EGG_SLOT_RATES[1];return Array.from({length:count},()=>{const kind=weightedChoice(rates,rng);return {kind,type:kind==="type"&&typeof chooseThemeEggType==="function"?chooseThemeEggType(dungeonId):null}})
}
function expeditionBoxProbability(hours,difficulty,rank){
 const b=EXPEDITION_BASE_BOX[hours]||EXPEDITION_BASE_BOX[1],dd=EXPEDITION_DIFF_BOX[difficulty]||EXPEDITION_DIFF_BOX[1],rr=EXPEDITION_RANK_BOX[rank]||EXPEDITION_RANK_BOX.B;
 let rare=b.rare+dd.rare+rr.rare,jack=Math.max(.005,b.jackpot+dd.jackpot+rr.jackpot),normal=1-rare-jack;if(normal<0){rare+=normal;normal=0}return {normal,rare,jackpot:jack};
}
function expeditionBoxRarityForSlot(hours,difficulty,rank,index,total,rng=Math.random){
 const p=expeditionBoxProbability(hours,difficulty,rank);if(hours===8&&index===total-1){const rarePlus=p.rare+p.jackpot,jack=rarePlus>0?p.jackpot/rarePlus:0;return rng()<jack?"jackpot":"rare"}
 let bonusRare=0,bonusJack=0;if(hours===4&&index===total-1){bonusRare=.10;bonusJack=.02}else if(hours===8&&index===total-2){bonusRare=.12;bonusJack=.03}
 const jack=Math.min(.35,p.jackpot+bonusJack),rare=Math.min(.80,p.rare+bonusRare),x=rng();return x<jack?"jackpot":x<jack+rare?"rare":"normal";
}
function expeditionEggKind(difficulty,hours,rank,rng=Math.random){
 const rates={...(EXPEDITION_EGG_RATE[difficulty]||EXPEDITION_EGG_RATE[1])},up=(hours===8?.10:hours===4?.05:0)+(rank==="S"?.10:rank==="A"?.05:0);let kind=weightedChoice(rates,rng);
 if(rng()<up)kind=kind==="normal"?"type":kind==="type"?"rare":kind==="rare"?"super":"super";return kind;
}
function floorPickupEligibleWeights({hasInjured=false,captureBoost=0,shield=0,hasFainted=false}={}){
 const w={candy:PICKUP_WEIGHTS.candy};if(hasInjured)w.berry=PICKUP_WEIGHTS.berry;if(Number(captureBoost||0)<.25)w.ball=PICKUP_WEIGHTS.ball;if(Number(shield||0)<.50)w.charm=PICKUP_WEIGHTS.charm;if(hasFainted)w.revive=PICKUP_WEIGHTS.revive;return w;
}
function rollFloorPickup(context={},rng=Math.random){if(rng()>=FLOOR_PICKUP_RATE)return null;return weightedChoice(floorPickupEligibleWeights(context),rng)}
function buildExpeditionReward(rarity,mission,{pickOne,makeEgg,companionCandidate,rng=Math.random}={}){
 const diff=Number(mission?.difficulty)||1,one=()=>typeof pickOne==="function"?pickOne():null;
 if(rarity==="normal"){const t=weightedChoice(EXPEDITION_REWARD_WEIGHTS.normal,rng);if(t==="xp")return{type:"xp",target:one(),amount:10+diff*4,label:"追加EXP"};if(t==="bond")return{type:"bond",target:one(),amount:1,label:"絆アップ"};if(t==="growth")return{type:"growth",target:one(),amount:1,label:"成長成果"};return{type:"allxp",amount:5+diff*2,label:"みんな成長"}}
 if(rarity==="rare"){const t=weightedChoice(EXPEDITION_REWARD_WEIGHTS.rare,rng);if(t==="growth")return{type:"growth",target:one(),amount:1,label:"育成成果"};if(t==="egg")return{type:"egg",egg:typeof makeEgg==="function"?makeEgg(false):null,label:"タマゴ発見"};if(t==="xp")return{type:"allxp",amount:18+diff*5,label:"大量EXP"};if(t==="bond")return{type:"bond",target:one(),amount:1,label:"絆アップ"};return{type:"combo",items:[{type:"allxp",amount:10+diff*3},{type:"bond",target:one(),amount:1}],label:"複合成果"}}
 const t=weightedChoice(EXPEDITION_REWARD_WEIGHTS.jackpot,rng);if(t==="companion"){const r=typeof companionCandidate==="function"?companionCandidate():null;return{type:"companion",target:r?.master_id||null,label:"誰かがついてきた"}}if(t==="egg")return{type:"egg",egg:typeof makeEgg==="function"?makeEgg(true):null,label:"上位タマゴ"};if(t==="growth")return{type:"growth",target:one(),amount:2,label:"大成長"};if(t==="adventure")return{type:"combo",items:[{type:"allxp",amount:25+diff*5},{type:"bond",target:one(),amount:1}],label:"大冒険"};return{type:"combo",items:[{type:"allxp",amount:30+diff*6},{type:"growth",target:one(),amount:1},{type:"bond",target:one(),amount:1}],label:"超成果"};
}
window.FRENDA_RULES={version:"1.2",THEME_ORDER,THEMES,ENEMY_GRADE_RATES,EXP_TO_DRILL,BOND_LEVEL_THRESHOLDS,EGG_DEF,CAPTURE_BASE_RATE,BALL_MULT,EVO_GRADE_WEIGHTS,TRAINING_STEP,PERMANENT_BOOST_MAX,EGG_CAP_BASE,EGG_CAP_PER_CLEARS,EGG_CAP_MAX,EVOLUTION_COST_FIRST,EVOLUTION_COST_LATER,EGG_SLOT_RATES,EGG_HATCH_GRADE,SPECIAL_EVOLUTION_TARGETS,EXPEDITION_BASE_BOX,EXPEDITION_DIFF_BOX,EXPEDITION_RANK_BOX,EXPEDITION_EGG_RATE,EXPEDITION_REWARD_WEIGHTS,FLOOR_PICKUP_RATE,PICKUP_WEIGHTS,LEGENDARY_NAMES,MYTHICAL_NAMES,weightedChoice,randomChoice,familyKey,addBondPoints,awardGrowthOrDrill,eggRequired,eggCapFromClears,captureRate,validBattle,gradeText,specialBaseName,isLegendary,isMythical,isSpecial,allowedByDungeonDifficulty,bondLevelFromPoints,applyXp,themePool,baselineEnergy,recommendedForTheme,explorationScore,evolutionSafeCandidates,weightedEvolutionGrade,chooseEvolutionCandidate,chooseHatchRecord,eggSlotsFor,expeditionBoxProbability,expeditionBoxRarityForSlot,expeditionEggKind,floorPickupEligibleWeights,rollFloorPickup,buildExpeditionReward};
})();
