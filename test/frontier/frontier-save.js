/* Frenda Frontier Ver0.37 / persistent world structure Ver4 + construction + movement save / Updated: 2026-10-19 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const storage=()=>window.FRENDA_USER?.storage||window.localStorage;
const now=()=>new Date().toISOString();
const defaultFacilities=()=>{const out={};for(const d of (F.FACILITY_DEFS||[]))out[d.id]=Number(d.startLevel)||0;return out};
const defaultAreas=()=>{const out={};for(const d of (F.AREA_DEFS||[]))out[d.id]=d.startState||"locked";return out};
const defaultFacilityAreas=()=>{const out={};for(const d of (F.FACILITY_DEFS||[]))out[d.id]=d.defaultArea||"core";return out};
F.freshSave=()=>({
 schemaVersion:9,appVersion:F.VERSION,createdAt:now(),updatedAt:now(),day:1,coins:300,
 partnerId:null,warehouse:{},shelves:[null,null,null],sales:{count:0,revenue:0,customers:0},
 reputation:{adventure:0,rare:0,fair:0,pokemon:0},
 development:{points:0,stage:0,town:{facilities:defaultFacilities(),facilityAreas:defaultFacilityAreas(),areas:defaultAreas(),priority:"standard",order:[],projects:{},shopLevel:1,forgeBuilt:false,houseBuilt:false,plazaBuilt:false,marketBuilt:false}},
 story:{step:0,firstAdventure:false,firstReturn:false,firstStock:false,firstSale:false,rumor:false},
 history:[],townWorld:{worldId:"frontier_town",layoutRevision:1,structureVersion:1,currentAreaId:"core",visitedAreas:["core"],fastTravelNodes:[]},townMovement:{areaId:"core",player:{x:350,y:475},partner:{x:392,y:475}},settings:{hintLevel:1,townLayerTest:{layers:{},preset:"custom"},townAreaTest:{states:{}},townNavTest:{overlay:false}}
});
function inferPriority(t){
 if(t?.priority&&["standard","commerce","forge","life","adventure"].includes(t.priority))return t.priority;
 const order=Array.isArray(t?.order)?t.order:[];
 for(const id of order){if(/^shop/.test(id)||/^market/.test(id))return "commerce";if(/^forge/.test(id))return "forge";if(/^house/.test(id))return "life";if(/^adventure_board/.test(id))return "adventure"}
 return "standard";
}
function migrateFacilities(t){
 const facilities=Object.assign(defaultFacilities(),t?.facilities||{});
 // Ver0.24以前の保存値を新しい汎用facility mapへ移す。
 facilities.shop=Math.max(Number(facilities.shop)||0,Number(t?.shopLevel)||1);
 if(t?.forgeBuilt)facilities.forge=Math.max(Number(facilities.forge)||0,1);
 if(t?.houseBuilt)facilities.house=Math.max(Number(facilities.house)||0,1);
 if(t?.marketBuilt)facilities.market=Math.max(Number(facilities.market)||0,1);
 if(t?.plazaBuilt)facilities.plaza=Math.max(Number(facilities.plaza)||0,1);
 for(const d of (F.FACILITY_DEFS||[])){
   const max=Math.max(0,Number(d.maxLevel)||0);facilities[d.id]=Math.max(0,Math.min(max,Number(facilities[d.id])||0));
 }
 return facilities;
}

function migrateAreas(t){
 const areas=Object.assign(defaultAreas(),t?.areas||{});
 const valid=new Set(F.AREA_STATE_ORDER||["locked","discovered","clearing","usable","developed"]);
 for(const d of (F.AREA_DEFS||[])){if(!valid.has(areas[d.id]))areas[d.id]=d.startState||"locked";}
 return areas;
}
function migrateFacilityAreas(t){
 const out=Object.assign(defaultFacilityAreas(),t?.facilityAreas||{});
 const valid=new Set((F.AREA_DEFS||[]).map(a=>a.id));
 for(const d of (F.FACILITY_DEFS||[]))if(!valid.has(out[d.id]))out[d.id]=d.defaultArea||"core";
 return out;
}
F.normalizeSave=s=>{
 const base=F.freshSave();if(!s||typeof s!=="object")return base;
 const previousAppVersion=String(s.appVersion||"");
 s=Object.assign(base,s);
 s.warehouse=s.warehouse&&typeof s.warehouse==="object"?s.warehouse:{};
 s.shelves=Array.isArray(s.shelves)?s.shelves.slice(0,3):[null,null,null];while(s.shelves.length<3)s.shelves.push(null);
 s.sales=Object.assign(base.sales,s.sales||{});s.reputation=Object.assign(base.reputation,s.reputation||{});
 s.development=Object.assign(base.development,s.development||{});
 const oldTown=(s.development&&s.development.town)||{};
 s.development.town=Object.assign(base.development.town,oldTown);
 s.development.town.order=Array.isArray(oldTown.order)?oldTown.order.slice(-40):[];
 s.development.town.priority=inferPriority(s.development.town);
 s.development.town.facilities=migrateFacilities(s.development.town);
 s.development.town.areas=migrateAreas(s.development.town);
 s.development.town.facilityAreas=migrateFacilityAreas(s.development.town);
 s.development.town.projects=s.development.town.projects&&typeof s.development.town.projects==="object"?s.development.town.projects:{};
 for(const [fid,pr] of Object.entries({...s.development.town.projects})){
  const def=(F.FACILITY_DEFS||[]).find(d=>d.id===fid),site=F.facilitySite?.(fid);
  if(!def||!site||!pr||typeof pr!=="object"){delete s.development.town.projects[fid];continue}
  const phases=F.CONSTRUCTION_PHASES||[];
  pr.facilityId=fid;pr.fromLevel=Math.max(0,Number(pr.fromLevel)||0);pr.targetLevel=Math.max(pr.fromLevel+1,Math.min(Number(def.maxLevel)||1,Number(pr.targetLevel)||pr.fromLevel+1));
  pr.phaseIndex=Math.max(0,Math.min(Math.max(0,phases.length-1),Number(pr.phaseIndex)||0));pr.stepsDone=Math.max(0,Number(pr.stepsDone)||0);
 }
 // 旧コードとの互換用ミラー。今後の本体判定はfacilitiesを正本にする。
 s.development.town.shopLevel=Math.max(1,Number(s.development.town.facilities.shop)||1);
 s.development.town.forgeBuilt=(Number(s.development.town.facilities.forge)||0)>=1;
 s.development.town.houseBuilt=(Number(s.development.town.facilities.house)||0)>=1;
 s.development.town.marketBuilt=(Number(s.development.town.facilities.market)||0)>=1;
 s.development.town.plazaBuilt=(Number(s.development.town.facilities.plaza)||0)>=1;
 s.story=Object.assign(base.story,s.story||{});s.history=Array.isArray(s.history)?s.history.slice(-100):[];
 s.settings=Object.assign(base.settings,s.settings||{});
 s.settings.townLayerTest=s.settings.townLayerTest&&typeof s.settings.townLayerTest==="object"?s.settings.townLayerTest:{layers:{},preset:"custom"};
 s.settings.townLayerTest.layers=s.settings.townLayerTest.layers&&typeof s.settings.townLayerTest.layers==="object"?s.settings.townLayerTest.layers:{};
 s.settings.townLayerTest.preset=["auto","custom","off","max","raw"].includes(s.settings.townLayerTest.preset)?s.settings.townLayerTest.preset:"custom";
 s.settings.townAreaTest=s.settings.townAreaTest&&typeof s.settings.townAreaTest==="object"?s.settings.townAreaTest:{states:{}};
 s.settings.townAreaTest.states=s.settings.townAreaTest.states&&typeof s.settings.townAreaTest.states==="object"?s.settings.townAreaTest.states:{};
 s.settings.townNavTest=s.settings.townNavTest&&typeof s.settings.townNavTest==="object"?s.settings.townNavTest:{overlay:false};
 s.settings.townNavTest.overlay=!!s.settings.townNavTest.overlay;
 s.townWorld=s.townWorld&&typeof s.townWorld==="object"?s.townWorld:{worldId:"frontier_town",layoutRevision:1,structureVersion:1,currentAreaId:"core",visitedAreas:["core"],fastTravelNodes:[]};
 s.townWorld.worldId=F.TOWN_WORLD_DEF?.id||"frontier_town";s.townWorld.layoutRevision=Number(F.TOWN_WORLD_DEF?.layoutRevision)||1;s.townWorld.structureVersion=Number(F.TOWN_WORLD_DEF?.structureVersion)||1;
 s.townWorld.currentAreaId=F.areaDef?.(s.townWorld.currentAreaId)?s.townWorld.currentAreaId:(F.areaDef?.(s.townMovement?.areaId)?s.townMovement.areaId:"core");
 s.townWorld.visitedAreas=Array.isArray(s.townWorld.visitedAreas)?[...new Set(s.townWorld.visitedAreas.filter(id=>F.areaDef?.(id)))]:["core"];if(!s.townWorld.visitedAreas.includes("core"))s.townWorld.visitedAreas.unshift("core");
 s.townWorld.fastTravelNodes=Array.isArray(s.townWorld.fastTravelNodes)?[...new Set(s.townWorld.fastTravelNodes.filter(id=>F.areaDef?.(id)))]:[];
 s.townMovement=s.townMovement&&typeof s.townMovement==="object"?s.townMovement:{areaId:"core",player:{x:350,y:475},partner:{x:392,y:475}};
 s.townMovement.areaId=F.areaDef?.(s.townMovement.areaId)?s.townMovement.areaId:"core";
 const num=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
 s.townMovement.player={x:num(s.townMovement.player?.x,350),y:num(s.townMovement.player?.y,475)};
 s.townMovement.partner={x:num(s.townMovement.partner?.x,392),y:num(s.townMovement.partner?.y,475)};
 // 開発用の生レイヤー表示は、バージョン更新後まで持ち越さない。
 if(previousAppVersion&&previousAppVersion!==F.VERSION&&s.settings.townLayerTest.preset==="raw")s.settings.townLayerTest={layers:{},preset:"auto"};
 s.schemaVersion=9;
 return s;
};
F.readSave=()=>{try{return F.normalizeSave(JSON.parse(storage().getItem(F.SAVE_KEY)||"null"))}catch{return F.freshSave()}};
F.writeSave=s=>{s=F.normalizeSave(s);s.appVersion=F.VERSION;s.updatedAt=now();storage().setItem(F.SAVE_KEY,JSON.stringify(s));return s};
F.mutateSave=fn=>{const s=F.readSave();if(typeof fn==="function")fn(s);return F.writeSave(s)};
F.addHistory=(s,type,text)=>{s.history=Array.isArray(s.history)?s.history:[];s.history.push({at:now(),day:s.day,type,text});if(s.history.length>100)s.history=s.history.slice(-100)};
})();
