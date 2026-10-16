(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{};
const now=()=>new Date().toISOString();
function freshSave(){return {schemaVersion:R.SCHEMA_VERSION,saveVersion:2,createdAt:now(),updatedAt:null,ranchName:"フレンダ牧場",creatures:[],previousOwnedIds:[],evolutionHistory:[],syncLog:[],social:{bonds:{},groups:[]},diary:[],development:{points:0,level:1,unlocked:["meadow"],lastLevelNotified:1},lastActiveAt:now(),offlineSummary:null,testClockMinutes:0}}
function newCreature(id){return {ranchId:R.uid(),pickId:String(id),status:"resident",joinedAt:now(),departedAt:null,nickname:"",personality:{seed:Math.floor(Math.random()*1000000)},life:{days:0},relationships:{},memories:[],pickHistory:[{pickId:String(id),from:null,at:now(),reason:"joined"}]}}
const TEST_SCALE_KEY="frenda:ranch:test-time-scale";
R.getTimeScale=()=>Number(localStorage.getItem(TEST_SCALE_KEY))===10?10:1;
R.setTimeScale=v=>{const n=Number(v)===10?10:1;localStorage.setItem(TEST_SCALE_KEY,String(n));window.dispatchEvent(new CustomEvent("ranch:time-scale-changed",{detail:{scale:n}}));return n};
R.growthBackupKey=()=>`${R.saveKey()}:development-backup`;
R.hasGrowthBackup=()=>!!localStorage.getItem(R.growthBackupKey());
R.beginGrowthTest=()=>{const s=R.readSave?.();if(!s)return false;localStorage.setItem("frendaWorldShownLevel","1");if(!R.hasGrowthBackup())localStorage.setItem(R.growthBackupKey(),JSON.stringify({development:s.development||null,testClockMinutes:Number(s.testClockMinutes)||0}));s.development={points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};s.testClockMinutes=0;R.writeSave?.(s);window.dispatchEvent(new CustomEvent("ranch:development-updated"));return true};
R.restoreGrowthTest=()=>{const raw=localStorage.getItem(R.growthBackupKey());if(!raw)return false;const s=R.readSave?.();if(!s)return false;try{const b=JSON.parse(raw);s.development=b.development||{points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};s.testClockMinutes=Number(b.testClockMinutes)||0;R.writeSave?.(s);localStorage.removeItem(R.growthBackupKey());window.dispatchEvent(new CustomEvent("ranch:development-updated"));return true}catch{return false}};
let liveGrowthTimer=0;
R.startLiveGrowthClock=()=>{if(liveGrowthTimer)return;liveGrowthTimer=setInterval(()=>{if(document.hidden)return;const s=R.readSave?.();if(!s)return;const residents=(s.creatures||[]).filter(c=>c&&c.status==="resident");if(!residents.length)return;const scale=R.getTimeScale(),realSeconds=3,virtualMinutes=realSeconds/60*scale;s.testClockMinutes=(Number(s.testClockMinutes)||0)+virtualMinutes;s.development=s.development&&typeof s.development==="object"?s.development:{points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};s.development.points=(Number(s.development.points)||0)+0.1*scale;for(const c of residents){c.life=c.life&&typeof c.life==="object"?c.life:{};c.life.days=(Number(c.life.days)||0)+virtualMinutes/60}R.updateDevelopment?.(s);R.writeSave?.(s);window.dispatchEvent(new CustomEvent("ranch:development-updated"))},3000)};
R.stopLiveGrowthClock=()=>{if(liveGrowthTimer)clearInterval(liveGrowthTimer);liveGrowthTimer=0};
R.compactMemories=(s)=>{if(!s)return s;const d=Array.isArray(s.diary)?s.diary:[],imp=d.filter(x=>x?.important),norm=d.filter(x=>!x?.important),old=norm.slice(0,Math.max(0,norm.length-40)),recent=norm.slice(-40);const summary=old.length?[{id:R.uid(),at:old[old.length-1]?.at||now(),kind:"summary",title:"牧場の日々",text:`${old.length}件の日常の出来事を、ひとつの思い出にまとめました。`,important:false,creatureIds:[]}]:[];s.diary=[...imp,...summary,...recent].sort((a,b)=>String(a.at).localeCompare(String(b.at))).slice(-120);for(const c of(s.creatures||[])){const m=Array.isArray(c.memories)?c.memories:[],mi=m.filter(x=>x?.important),mn=m.filter(x=>!x?.important),mo=mn.slice(0,Math.max(0,mn.length-18)),mr=mn.slice(-18),ms=mo.length?[{id:R.uid(),at:mo[mo.length-1]?.at||now(),kind:"summary",title:"牧場で過ごした日々",text:`${mo.length}件の日常の思い出をまとめました。`,important:false}]:[];c.memories=[...mi,...ms,...mr].sort((a,b)=>String(a.at).localeCompare(String(b.at))).slice(-60)}return s};
R.addDiary=(s,entry)=>{if(!s||!entry)return; s.diary=Array.isArray(s.diary)?s.diary:[]; const e={id:R.uid(),at:now(),kind:entry.kind||"daily",title:entry.title||"牧場のできごと",text:entry.text||"",important:!!entry.important,creatureIds:(entry.creatureIds||[]).map(String)}; s.diary.push(e); if(s.diary.length>200)s.diary=s.diary.slice(-200); for(const id of e.creatureIds){const c=(s.creatures||[]).find(x=>String(x.ranchId)===id);if(!c)continue;c.memories=Array.isArray(c.memories)?c.memories:[];c.memories.push({id:e.id,at:e.at,kind:e.kind,title:e.title,text:e.text,important:e.important});if(c.memories.length>80)c.memories=c.memories.slice(-80)};R.compactMemories(s);return e};
function directEvolution(index,fromId,toId){if(!index)return false;const a=index.entryByName?.(R.pickName(fromId)),b=index.entryByName?.(R.pickName(toId));if(!a||!b)return false;return Number(b.parent)===Number(a.no)}
R.applyOfflineProgress=s=>{
 const nowMs=Date.now(),lastMs=Date.parse(s.lastActiveAt||s.updatedAt||s.createdAt||new Date().toISOString());
 const elapsedMs=Math.max(0,nowMs-(Number.isFinite(lastMs)?lastMs:nowMs)),elapsedMinutes=elapsedMs/60000,ranchDays=elapsedMinutes/60;s.testClockMinutes=(Number(s.testClockMinutes)||0)+elapsedMinutes;
 const residents=(s.creatures||[]).filter(c=>c&&c.status==="resident");s.development=s.development&&typeof s.development==="object"?s.development:{points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};
 if(elapsedMinutes>=2){
  for(const c of residents){c.life=c.life&&typeof c.life==="object"?c.life:{};c.life.days=(Number(c.life.days)||0)+ranchDays;c.life.offlineMinutes=(Number(c.life.offlineMinutes)||0)+elapsedMinutes}
  const active=Math.max(0,Math.round(elapsedMinutes*(.34+Math.min(.18,residents.length*.02)))),rest=Math.max(0,Math.round(elapsedMinutes*.28)),social=residents.length>1?Math.max(0,Math.round(elapsedMinutes*(.05+Math.min(.08,residents.length*.01)))):0;
  s.development.points=(Number(s.development.points)||0)+Math.floor(elapsedMinutes/3)*Math.max(1,Math.min(3,residents.length));R.updateDevelopment?.(s);
  s.offlineSummary={from:new Date(lastMs).toISOString(),to:new Date(nowMs).toISOString(),elapsedMinutes:Math.round(elapsedMinutes),ranchDays:Number(ranchDays.toFixed(2)),residents:residents.length,activity:{walk:active,rest,social}};
  if(elapsedMinutes>=5){const names=residents.slice(0,3).map(c=>R.pickName(c.pickId)||c.pickId);R.addDiary(s,{kind:"offline",title:"留守中の牧場",text:`${Math.round(elapsedMinutes)}分のあいだ、${names.join("・")}${residents.length>3?"たち":""}は散歩や休憩をしながら過ごしました。`,creatureIds:residents.map(c=>c.ranchId)})}
 }
 s.lastActiveAt=new Date(nowMs).toISOString();return s
};
R.FACILITIES=[
 {id:"meadow",level:1,icon:"🌿",name:"はじまりの草原",desc:"世界の出発点。まだ小さな自然だけが広がる。"},
 {id:"shade",level:2,icon:"🌳",name:"木陰の森",desc:"草原の外で最初に見つかる深い森。"},
 {id:"pond",level:3,icon:"💧",name:"水辺",desc:"森を抜けた先に開ける水の景色。"},
 {id:"play",level:4,icon:"⛏️",name:"ひかり石の鉱山",desc:"岩壁の奥で不思議な光を放つ鉱山。"},
 {id:"hut",level:5,icon:"✨",name:"世界の境界",desc:"さらに遠い世界の存在を感じる場所。"}
];
R.updateDevelopment=s=>{s.development=s.development&&typeof s.development==="object"?s.development:{points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};const d=s.development,p=Math.max(0,Number(d.points)||0),lv=p>=120?5:p>=70?4:p>=35?3:p>=12?2:1;d.level=lv;d.unlocked=R.FACILITIES.filter(f=>f.level<=lv).map(f=>f.id);const old=Number(d.lastLevelNotified)||1;if(lv>old){for(let n=old+1;n<=lv;n++){const fac=R.FACILITIES.find(f=>f.level===n);if(fac)R.addDiary?.(s,{kind:"development",title:`${fac.name}を発見！`,text:`牧場がLv.${n}になり、霧が晴れて「${fac.name}」エリアを発見しました。`,important:true,creatureIds:[]})}d.lastLevelNotified=lv}return d};
R.addDevelopmentPoints=(amount,reason="生活")=>{const s=R.readSave?.();if(!s)return null;s.development=s.development&&typeof s.development==="object"?s.development:{points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};s.development.points=(Number(s.development.points)||0)+Math.max(0,Number(amount)||0);R.updateDevelopment(s);s.development.lastReason=reason;s.development.updatedAt=now();R.writeSave?.(s);window.dispatchEvent(new CustomEvent("ranch:development-updated"));return s.development};
R.touchActive=()=>{const s=R.readSave?.();if(!s)return;const t=Date.now(),prev=Date.parse(s.lastActiveAt||0)||0;if(t-prev<15000)return;s.lastActiveAt=new Date(t).toISOString();R.writeSave?.(s)};
R.runEvolutionRegression=()=>{
 const original={ranchId:"TEST-EVO-001",pickId:"FROM",status:"resident",personality:{seed:12345},life:{days:7.5,experience:{walk:12,social:9,rest:4}},relationships:{friend:"best"},memories:[{id:"m1",important:true,title:"大切な思い出"}],pickHistory:[{pickId:"FROM"}]};
 const before=JSON.stringify({id:original.ranchId,personality:original.personality,life:original.life,relationships:original.relationships,memories:original.memories});
 const evolved=structuredClone?structuredClone(original):JSON.parse(JSON.stringify(original));evolved.pickHistory.push({pickId:"TO",from:"FROM",reason:"evolution"});evolved.pickId="TO";
 const after=JSON.stringify({id:evolved.ranchId,personality:evolved.personality,life:evolved.life,relationships:evolved.relationships,memories:evolved.memories});
 return {ok:before===after&&evolved.pickId==="TO",detail:"個体ID・性格・生活経験・関係・思い出を保持"};
};
R.runReacquireRegression=()=>{
 const departed={ranchId:"TEST-OLD-001",pickId:"PICK",status:"departed",personality:{seed:111},memories:[{id:"old"}]};
 const reacquired={ranchId:"TEST-NEW-002",pickId:"PICK",status:"resident",personality:{seed:222},memories:[]};
 return {ok:departed.ranchId!==reacquired.ranchId&&departed.status==="departed"&&reacquired.memories.length===0,detail:"退牧個体を復活させず、新しい個体IDとして登録"};
};
R.evolutionAudit=s=>{const hist=Array.isArray(s?.evolutionHistory)?s.evolutionHistory:[],creatures=Array.isArray(s?.creatures)?s.creatures:[];return {evolutions:hist.length,departed:creatures.filter(c=>c?.status==="departed").length,residents:creatures.filter(c=>c?.status==="resident").length,duplicateRanchIds:creatures.length-new Set(creatures.map(c=>String(c.ranchId))).size,historyIntegrity:hist.every(h=>creatures.some(c=>String(c.ranchId)===String(h.ranchId)))}};
R.reconcile=async ids=>{
 ids=[...new Set((ids||[]).map(String).filter(Boolean))];
 let s=R.readSave()||freshSave();
 s=R.applyOfflineProgress(s);
 if(!Array.isArray(s.creatures))s.creatures=[];if(!Array.isArray(s.previousOwnedIds))s.previousOwnedIds=[];if(!Array.isArray(s.evolutionHistory))s.evolutionHistory=[];if(!Array.isArray(s.syncLog))s.syncLog=[];if(!Array.isArray(s.diary))s.diary=[];if(!s.development||typeof s.development!=="object")s.development={points:0,level:1,unlocked:["meadow"],lastLevelNotified:1};R.updateDevelopment?.(s);if(!s.social||typeof s.social!=="object")s.social={bonds:{},groups:[]};if(!s.social.bonds||typeof s.social.bonds!=="object")s.social.bonds={};if(!Array.isArray(s.social.groups))s.social.groups=[];
 const prev=[...new Set(s.previousOwnedIds.map(String))],prevSet=new Set(prev),curSet=new Set(ids);
 const removed=prev.filter(id=>!curSet.has(id)),added=ids.filter(id=>!prevSet.has(id));
 let evoIndex=null;if(removed.length&&added.length)evoIndex=await R.loadEvolutionIndex();
 const pairs=[];
 if(evoIndex){
  for(const from of removed){const tos=added.filter(to=>directEvolution(evoIndex,from,to));if(tos.length===1){const to=tos[0],froms=removed.filter(x=>directEvolution(evoIndex,x,to));if(froms.length===1)pairs.push({from,to})}}
 }
 const usedFrom=new Set(),usedTo=new Set();
 for(const {from,to} of pairs){
  if(usedFrom.has(from)||usedTo.has(to))continue;
  const candidates=s.creatures.filter(c=>c&&c.status==="resident"&&String(c.pickId)===from);
  if(candidates.length!==1)continue;
  const c=candidates[0],at=now();c.pickHistory=Array.isArray(c.pickHistory)?c.pickHistory:[];c.pickHistory.push({pickId:to,from,at,reason:"evolution"});c.pickId=to;c.status="resident";c.departedAt=null;
  s.evolutionHistory.push({ranchId:c.ranchId,fromPickId:from,toPickId:to,at,method:"owned-diff-direct-unique"});usedFrom.add(from);usedTo.add(to);
 }
 for(const from of removed){if(usedFrom.has(from))continue;for(const c of s.creatures){if(c&&c.status==="resident"&&String(c.pickId)===from){c.status="departed";c.departedAt=now();c.departureReason="not-owned"}}}
 for(const to of added){if(usedTo.has(to))continue;s.creatures.push(newCreature(to))}
 // 初回移行・旧Ver救済: 現在所持なのにresidentが存在しないIDだけ新規登録。departedは復活させず、再入手を別個体化する。
 for(const id of ids){if(!s.creatures.some(c=>c&&c.status==="resident"&&String(c.pickId)===id))s.creatures.push(newCreature(id))}
 s.previousOwnedIds=ids.slice();R.updateDevelopment?.(s);s.schemaVersion=R.SCHEMA_VERSION;s.saveVersion=3;s.updatedAt=now();
 if(removed.length||added.length)s.syncLog.push({at:s.updatedAt,removed,added,evolutions:pairs.filter(x=>usedFrom.has(x.from)&&usedTo.has(x.to))});
 if(s.syncLog.length>100)s.syncLog=s.syncLog.slice(-100);
 return R.writeSave(s)
};
})();
// Updated: 2026-10-13 07:40 JST
