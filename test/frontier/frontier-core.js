/* Frenda Frontier Ver0.83 / world structure Ver6 + 30-floor human-adventurer dungeon core / Updated: 2026-10-21 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
const key=(x,y)=>`${x},${y}`;
function clone(v){return JSON.parse(JSON.stringify(v))}
function addWarehouse(s,id,n){if(!F.item(id)||n<=0)return;s.warehouse[id]=(Number(s.warehouse[id])||0)+n}
function takeWarehouse(s,id,n){n=Math.max(0,Math.min(Number(n)||0,Number(s.warehouse[id])||0));s.warehouse[id]=(Number(s.warehouse[id])||0)-n;if(s.warehouse[id]<=0)delete s.warehouse[id];return n}
F.addWarehouse=addWarehouse;F.takeWarehouse=takeWarehouse;
F.developmentStage=points=>points>=60?3:points>=28?2:points>=10?1:0;
F.stageInfo=stage=>[
 {name:"開拓地",caption:"露店と掘っ立て小屋だけの未整備な開拓地",future:"まだ何もない土地"},
 {name:"小さな集落",caption:"お店を目当てに人が立ち寄るようになった",future:"建設予定地"},
 {name:"村",caption:"職人や冒険者が暮らし始めた",future:"鍛冶屋 建設中"},
 {name:"にぎやかな村",caption:"新しい店や住民が増えてきた",future:"鍛冶屋"}
][Math.max(0,Math.min(3,Number(stage)||0))];

// Ver0.50: 行動駆動の時間帯。実時間とは連動しない。
F.timeInfo=s=>{const phases=F.TIME_PHASES||[],i=Math.max(0,Math.min(phases.length-1,Number(s?.clock?.phaseIndex)||0));return phases[i]||{id:"day",label:"昼",icon:"☀️"}};
F.advanceTimeState=(s,steps=1,reason="action")=>{s.clock=s.clock||{phaseIndex:0,actionCount:0,lastAction:"start"};const phases=F.TIME_PHASES||[{id:"day",label:"昼"}],len=Math.max(1,phases.length);let days=0;for(let n=0;n<Math.max(0,Number(steps)||0);n++){s.clock.phaseIndex=(Number(s.clock.phaseIndex)||0)+1;s.clock.actionCount=(Number(s.clock.actionCount)||0)+1;if(s.clock.phaseIndex>=len){s.clock.phaseIndex=0;s.day=Math.max(1,Number(s.day)||1)+1;days++;advanceConstructionState(s,1)}}s.clock.lastAction=String(reason||"action");return{daysAdvanced:days,phase:F.timeInfo(s)}};
F.advanceTime=(steps=1,reason="action")=>F.mutateSave(s=>F.advanceTimeState(s,steps,reason));
F.gameplayLoopStatus=s=>{if(!s?.story?.firstReturn)return{step:0,label:"装備を整えて冒険する"};if(!s?.story?.firstStock)return{step:1,label:"商品を棚に並べる"};if(!s?.story?.firstSale)return{step:2,label:"店を開いて売る"};return{step:3,label:"冒険→商売→町発展の1周完成",complete:true}};

F.townState=s=>{
 const d=s?.development||{},t=d.town||{},fac=Object.assign({},t.facilities||{});
 for(const def of (F.FACILITY_DEFS||[]))if(fac[def.id]==null)fac[def.id]=Number(def.startLevel)||0;
 return {
  facilities:fac,projects:t.projects&&typeof t.projects==="object"?t.projects:{},priority:["standard","commerce","forge","life","adventure"].includes(t.priority)?t.priority:"standard",
  order:Array.isArray(t.order)?t.order:[],shopLevel:Math.max(1,Number(fac.shop)||1),forgeBuilt:Number(fac.forge||0)>=1,
  houseBuilt:Number(fac.house||0)>=1,plazaBuilt:Number(fac.plaza||0)>=1,marketBuilt:Number(fac.market||0)>=1
 };
};
F.facilityLevel=(s,id)=>Math.max(0,Number(F.townState(s).facilities?.[id])||0);
F.townRoute=s=>F.townState(s).priority||"standard";
F.townProject=(s,id)=>F.townState(s).projects?.[id]||null;
F.townProjects=s=>Object.values(F.townState(s).projects||{}).filter(Boolean);
F.constructionPhase=pr=>{const a=F.CONSTRUCTION_PHASES||[];return a[Math.max(0,Math.min(a.length-1,Number(pr?.phaseIndex)||0))]||null};
function advanceConstructionState(s,steps=1){
 const town=s?.development?.town;if(!town)return[];town.projects=town.projects&&typeof town.projects==="object"?town.projects:{};const completed=[];
 for(let st=0;st<Math.max(1,Number(steps)||1);st++){
  for(const [fid,pr] of Object.entries({...town.projects})){
   const def=(F.FACILITY_DEFS||[]).find(d=>d.id===fid);if(!def){delete town.projects[fid];continue}
   pr.stepsDone=(Number(pr.stepsDone)||0)+1;pr.phaseIndex=(Number(pr.phaseIndex)||0)+1;pr.updatedDay=s.day;
   if(pr.phaseIndex>=(F.CONSTRUCTION_PHASES||[]).length){
    town.facilities[fid]=Math.max(Number(town.facilities?.[fid])||0,Number(pr.targetLevel)||1);delete town.projects[fid];
    completed.push({facilityId:fid,name:def.name,targetLevel:Number(pr.targetLevel)||1});F.addHistory(s,"construction",`${def.name} Lv${Number(pr.targetLevel)||1}が完成した。`);
   }
  }
 }
 town.shopLevel=Math.max(1,Number(town.facilities?.shop)||1);town.forgeBuilt=Number(town.facilities?.forge||0)>=1;town.houseBuilt=Number(town.facilities?.house||0)>=1;town.marketBuilt=Number(town.facilities?.market||0)>=1;town.plazaBuilt=Number(town.facilities?.plaza||0)>=1;
 return completed;
}
F.advanceTownConstructionState=advanceConstructionState;
F.advanceTownConstruction=(steps=1)=>F.mutateSave(s=>advanceConstructionState(s,steps));

// Ver0.28: 町域は施設とは独立して拡張する。新しいエリアは AREA_DEFS に追加するだけでよい。
F.areaState=(s,id)=>{const def=F.areaDef?.(id);return s?.development?.town?.areas?.[id]||def?.startState||"locked"};
F.areaStateIndex=state=>Math.max(0,(F.AREA_STATE_ORDER||[]).indexOf(state));
F.areaEffectiveState=(s,id)=>{if(s?.settings?.townTravelTest?.forceAllUsable&&F.areaDef?.(id))return "usable";const v=s?.settings?.townAreaTest?.states?.[id];return (F.AREA_STATE_ORDER||[]).includes(v)?v:F.areaState(s,id)};
F.areaStats=s=>{const defs=F.AREA_DEFS||[],states=defs.map(d=>F.areaEffectiveState(s,d.id));return {total:defs.length,discovered:states.filter(x=>F.areaStateIndex(x)>=1).length,usable:states.filter(x=>F.areaStateIndex(x)>=3).length,developed:states.filter(x=>F.areaStateIndex(x)>=4).length}};
F.areaOptions=s=>{const pts=Number(s?.development?.points)||0,out=[];for(const def of (F.AREA_DEFS||[])){const cur=F.areaState(s,def.id),idx=F.areaStateIndex(cur);if(idx<0||idx>=F.AREA_STATE_ORDER.length-1)continue;const next=F.AREA_STATE_ORDER[idx+1],tr=def.transitions?.[next];if(!tr)continue;out.push({areaId:def.id,areaName:def.name,icon:def.icon||"🗺️",from:cur,to:next,need:Number(tr.need)||0,label:tr.label||`${def.name}を${F.AREA_STATE_INFO?.[next]?.label||next}にする`,available:pts>=Number(tr.need||0),description:def.description||""})}return out.sort((a,b)=>a.need-b.need||a.areaName.localeCompare(b.areaName,"ja"))};
F.applyAreaDevelopment=areaId=>F.mutateSave(s=>{const opt=F.areaOptions(s).find(x=>x.areaId===areaId);if(!opt)throw new Error("この町域は現在変更できません。");if(!opt.available)throw new Error(`発展${opt.need}ptで選べます。`);s.development.town.areas=s.development.town.areas||{};s.development.town.areas[areaId]=opt.to;F.addHistory(s,"area",`${opt.areaName}：${F.AREA_STATE_INFO?.[opt.to]?.label||opt.to}`);});
F.setTownAreaTestState=(id,state)=>F.mutateSave(s=>{if(!F.areaDef?.(id))throw new Error("不明な町域です。");s.settings=s.settings||{};s.settings.townAreaTest=s.settings.townAreaTest||{states:{}};s.settings.townAreaTest.states=s.settings.townAreaTest.states||{};if(state==="auto")delete s.settings.townAreaTest.states[id];else if((F.AREA_STATE_ORDER||[]).includes(state))s.settings.townAreaTest.states[id]=state;else throw new Error("不正な町域状態です。");});
F.resetTownAreaTest=()=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townAreaTest={states:{}}});
// Ver0.50: 5エリア往復の実機確認用。実際の町域進行は変更せずTEST表示だけ利用可能にする。
F.setTownAreaTestAllUsable=()=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townAreaTest=s.settings.townAreaTest||{states:{}};s.settings.townAreaTest.states={};for(const a of (F.AREA_DEFS||[]))s.settings.townAreaTest.states[a.id]="usable";});
// Ver0.50: 5エリアの双方向移動を一度に実機確認する巡回TEST。
F.TOWN_ROUNDTRIP_TEST_TARGETS=Object.freeze([
 {areaId:"west_forest",label:"西の森外縁",icon:"🌲",fromCore:"左端の森道",back:"右端の道"},
 {areaId:"north_highland",label:"北の高台",icon:"⛰️",fromCore:"上端の高台への道",back:"下端の道"},
 {areaId:"east_riverside",label:"東の川辺",icon:"🌊",fromCore:"右端の川辺への道",back:"左端の道"},
 {areaId:"south_road",label:"南の街道沿い",icon:"🛤️",fromCore:"下端の街道",back:"上端の街道"}
]);
F.townRoundTripTestState=s=>{const raw=s?.settings?.townTravelTest||{},targets=F.TOWN_ROUNDTRIP_TEST_TARGETS||[],outbound=raw.outbound&&typeof raw.outbound==="object"?raw.outbound:{},roundTrips=raw.roundTrips&&typeof raw.roundTrips==="object"?raw.roundTrips:{},done=targets.filter(t=>!!roundTrips[t.areaId]).length,next=targets.find(t=>!roundTrips[t.areaId])||null;return{active:!!raw.active,forceAllUsable:!!raw.forceAllUsable,startedAt:raw.startedAt||null,completedAt:raw.completedAt||null,outbound,roundTrips,done,total:targets.length,next,currentAreaId:s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core"}};
function recordTownRoundTripTransition(s,from,to){const raw=s?.settings?.townTravelTest;if(!raw?.active)return;raw.outbound=raw.outbound&&typeof raw.outbound==="object"?raw.outbound:{};raw.roundTrips=raw.roundTrips&&typeof raw.roundTrips==="object"?raw.roundTrips:{};const ids=new Set((F.TOWN_ROUNDTRIP_TEST_TARGETS||[]).map(t=>t.areaId));if(from==="core"&&ids.has(to))raw.outbound[to]=true;if(to==="core"&&ids.has(from)&&raw.outbound[from])raw.roundTrips[from]=true;const all=(F.TOWN_ROUNDTRIP_TEST_TARGETS||[]).every(t=>raw.roundTrips[t.areaId]);if(all){raw.active=false;raw.completedAt=new Date().toISOString();}}
F.startTownRoundTripTest=()=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townAreaTest=s.settings.townAreaTest||{states:{}};s.settings.townTravelTest={active:true,forceAllUsable:true,startedAt:new Date().toISOString(),completedAt:null,outbound:{},roundTrips:{}};const spawn=F.areaNavDefinition?.("core")?.spawn||F.areaDef?.("core")?.nav?.spawn||{x:350,y:475};s.townWorld=s.townWorld||{};s.townWorld.currentAreaId="core";s.townWorld.visitedAreas=Array.isArray(s.townWorld.visitedAreas)?s.townWorld.visitedAreas:["core"];if(!s.townWorld.visitedAreas.includes("core"))s.townWorld.visitedAreas.unshift("core");s.townMovement={areaId:"core",player:{x:spawn.x,y:spawn.y},partner:{x:spawn.x+42,y:spawn.y}};});
F.resetTownRoundTripTest=()=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townTravelTest={active:false,forceAllUsable:false,startedAt:null,completedAt:null,outbound:{},roundTrips:{}};});
F.areaConnections=id=>(F.AREA_CONNECTION_DEFS||[]).filter(c=>c.a===id||c.b===id);
F.areaNeighbors=id=>F.areaConnections(id).map(c=>{const other=c.a===id?c.b:c.a;return {areaId:other,area:F.areaDef?.(other),connection:c,fromPort:c.a===id?c.aPort:c.bPort,toPort:c.a===id?c.bPort:c.aPort}});
// Ver0.38: 接続ごとの移動方式を共通化。隣接は歩行、自動境界切替。遠距離は将来の移動拠点から選択式。
F.connectionTravelInfo=c=>{
 const kind=F.connectionKind?.(c?.kind)||{},raw=c?.travel||{},modeId=raw.mode||kind.defaultMode||"walk",mode=F.travelMode?.(modeId)||F.travelMode?.("walk")||{};
 return {mode:modeId,modeLabel:mode.label||modeId,modeIcon:mode.icon||"🚶",kind:c?.kind||"path",kindLabel:kind.label||c?.kind||"道",kindIcon:kind.icon||"▫️",autoTransition:raw.autoTransition!=null?!!raw.autoTransition:!!mode.autoTransition,fastTravel:raw.fastTravel!=null?!!raw.fastTravel:modeId==="fast",transition:kind.transition|| (modeId==="fast"?"select":"edge"),transitionMs:Number(kind.transitionMs)||260,seamlessLike:mode.seamlessLike!==false};
};
F.connectionBetween=(a,b)=>(F.AREA_CONNECTION_DEFS||[]).find(c=>(c.a===a&&c.b===b)||(c.a===b&&c.b===a))||null;
// Ver0.46: 一度実際に到達した隣接エリアへの帰路は、TEST状態変更で閉じない。
// 通常は両エリアusable以上で開通。加えて、接続両端を訪問済みなら既開通路として扱う。
F.connectionOpen=(s,c)=>{if(!c)return false;const sa=F.areaEffectiveState(s,c.a),sb=F.areaEffectiveState(s,c.b),stateOpen=F.areaStateIndex(sa)>=F.areaStateIndex("usable")&&F.areaStateIndex(sb)>=F.areaStateIndex("usable"),visited=new Set(s?.townWorld?.visitedAreas||["core"]),visitedOpen=visited.has(c.a)&&visited.has(c.b);return stateOpen||visitedOpen};
F.areaTravelOptions=(s,fromAreaId)=>F.areaNeighbors(fromAreaId).map(n=>{const c=n.connection,ti=F.connectionTravelInfo(c),open=F.connectionOpen(s,c),to=F.areaDef?.(n.areaId);return {...n,open,travel:ti,toState:F.areaEffectiveState(s,n.areaId),sceneReady:["prototype","ready"].includes(to?.world?.sceneStatus||"")}});
F.areaExitConnection=(s,areaId,exitId)=>{const area=F.areaDef?.(areaId),nav=F.areaNavDefinition?.(areaId)||area?.nav||{},ex=(nav.exits||[]).find(x=>x.id===exitId)||(area?.nav?.exits||[]).find(x=>x.id===exitId);if(!ex)return null;const c=F.connectionBetween(areaId,ex.to);if(!c)return null;const ti=F.connectionTravelInfo(c);return {exit:ex,connection:c,travel:ti,target:F.areaDef?.(ex.to),open:F.connectionOpen(s,c)};};
F.townExitAt=(s,x,y,areaId=null)=>{areaId=areaId||s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core";const nav=F.areaNavDefinition?.(areaId)||F.areaDef?.(areaId)?.nav||{},cell=Math.max(8,Number(nav.scene?.cell)||12),px=Number(x),py=Number(y);for(const ex of (nav.exits||[])){const pad=cell*1.25;if(px>=ex.x-pad&&py>=ex.y-pad&&px<ex.x+ex.w+pad&&py<ex.y+ex.h+pad)return F.areaExitConnection(s,areaId,ex.id)}return null};
// Ver0.46: 「出口そのもの」だけでなく、出口へ続く画面端の道をタップした時も移動意図として扱う。
// 実歩行の自動判定(townExitAt)は狭いまま維持し、到着直後の逆戻りを防ぐ。
F.townExitTapAt=(s,x,y,areaId=null)=>{areaId=areaId||s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core";const nav=F.areaNavDefinition?.(areaId)||F.areaDef?.(areaId)?.nav||{},cell=Math.max(8,Number(nav.scene?.cell)||12),wr=nav.worldRect||{x:0,y:0,w:nav.scene?.w||717,h:nav.scene?.h||842},px=Number(x),py=Number(y);for(const ex of (nav.exits||[])){const route=F.areaExitConnection(s,areaId,ex.id);if(!route)continue;const sideTop=ex.y<=wr.y+cell*2,sideBottom=ex.y+ex.h>=wr.y+wr.h-cell*2,sideLeft=ex.x<=wr.x+cell*2,sideRight=ex.x+ex.w>=wr.x+wr.w-cell*2,pad=cell*2.25,depth=cell*5;let hit=false;if(sideTop)hit=px>=ex.x-pad&&px<=ex.x+ex.w+pad&&py>=wr.y&&py<=Math.max(ex.y+ex.h+depth,wr.y+depth);else if(sideBottom)hit=px>=ex.x-pad&&px<=ex.x+ex.w+pad&&py<=wr.y+wr.h&&py>=Math.min(ex.y-depth,wr.y+wr.h-depth);else if(sideLeft)hit=py>=ex.y-pad&&py<=ex.y+ex.h+pad&&px>=wr.x&&px<=Math.max(ex.x+ex.w+depth,wr.x+depth);else if(sideRight)hit=py>=ex.y-pad&&py<=ex.y+ex.h+pad&&px<=wr.x+wr.w&&px>=Math.min(ex.x-depth,wr.x+wr.w-depth);else hit=px>=ex.x-pad&&py>=ex.y-pad&&px<=ex.x+ex.w+pad&&py<=ex.y+ex.h+pad;if(hit)return route}return null};
F.townExitApproachPoint=(s,route,actor="player",areaId=null)=>{if(!route?.exit)return null;areaId=areaId||s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core";const m=F.townNavModel(s,actor,areaId),ex=route.exit,wr=m.worldRect,cell=m.cell;let p={x:ex.x+ex.w/2,y:ex.y+ex.h/2};if(ex.y<=wr.y+cell*2)p.y=ex.y+Math.min(ex.h*.35,cell*1.5);else if(ex.y+ex.h>=wr.y+wr.h-cell*2)p.y=ex.y+ex.h-Math.min(ex.h*.35,cell*1.5);else if(ex.x<=wr.x+cell*2)p.x=ex.x+Math.min(ex.w*.35,cell*1.5);else if(ex.x+ex.w>=wr.x+wr.w-cell*2)p.x=ex.x+ex.w-Math.min(ex.w*.35,cell*1.5);return F.townNearestWalkable(s,p,actor,12,areaId)||p};
F.fastTravelOptions=s=>{const cur=s?.townWorld?.currentAreaId||"core",visited=new Set(s?.townWorld?.visitedAreas||["core"]);return (F.AREA_DEFS||[]).filter(a=>a.id!==cur&&visited.has(a.id)&&F.areaStateIndex(F.areaEffectiveState(s,a.id))>=F.areaStateIndex("usable")).filter(a=>!!a.world?.fastTravelNode).map(a=>({areaId:a.id,name:a.name,icon:a.icon||"🗺️",node:a.world.fastTravelNode}));};
F.worldFutureExpansionCandidates=s=>{
 const areas=(F.AREA_DEFS||[]),occupied=new Set(areas.map(a=>`${Number(a.world?.gx)||0},${Number(a.world?.gy)||0}`)),vectors=F.WORLD_PORT_VECTOR||{},byCoord=new Map();
 for(const a of areas){
  const ax=Number(a.world?.gx)||0,ay=Number(a.world?.gy)||0;
  for(const port of (a.world?.futurePorts||[])){
   const v=vectors[port];if(!v)continue;const gx=ax+v[0],gy=ay+v[1],coord=`${gx},${gy}`;if(occupied.has(coord))continue;
   const templateIds=a.world?.expansionProfiles?.[port]||[];
   let row=byCoord.get(coord);if(!row){row={id:`future_${gx}_${gy}`,gx,gy,state:"future",sources:[],templateIds:[]};byCoord.set(coord,row)}
   row.sources.push({areaId:a.id,areaName:a.name,port});for(const id of templateIds)if(!row.templateIds.includes(id))row.templateIds.push(id);
  }
 }
 return [...byCoord.values()].map(row=>{const templates=row.templateIds.map(id=>F.expansionTemplate?.(id)).filter(Boolean),primary=templates[0]||null,source=row.sources[0]||{};return {...row,
   fromAreaId:source.areaId||null,fromAreaName:source.areaName||"",port:source.port||"",templateId:primary?.id||null,
   label:primary?`${primary.name}候補`:"新エリア候補",name:primary?.name||"新エリア",icon:primary?.icon||"＋",
   sizeClass:primary?.sizeClass||"standard",terrainTags:[...(primary?.terrainTags||[])],facilityTags:[...(primary?.facilityTags||[])],
   travelCost:Number(primary?.travelCost)||1,capacity:Object.assign({},F.areaSizeClass?.(primary?.sizeClass)||{},primary?.capacity||{}),unlockHint:primary?.unlockHint||"町の発展に応じて開放",
   alternatives:templates.slice(1).map(t=>({id:t.id,name:t.name,icon:t.icon||"＋",sizeClass:t.sizeClass,terrainTags:[...(t.terrainTags||[])],facilityTags:[...(t.facilityTags||[])]}))};});
};
F.townScaleTier=s=>{const stats=F.areaStats?.(s)||{usable:1},pts=Number(s?.development?.points)||0,tiers=F.TOWN_SCALE_TIERS||[];let cur=tiers[0]||{id:"frontier",label:"開拓地",icon:"🏕️"};for(const t of tiers)if(stats.usable>=Number(t.minUsable||0)&&pts>=Number(t.minPoints||0))cur=t;return cur};
F.nextTownScaleTier=s=>{const cur=F.townScaleTier(s),tiers=F.TOWN_SCALE_TIERS||[],i=tiers.findIndex(t=>t.id===cur.id);return i>=0&&i<tiers.length-1?tiers[i+1]:null};
F.areaPlanningInfo=d=>{const sc=F.areaSizeClass?.(d?.world?.sizeClass)||{},cap=Object.assign({},sc,d?.world?.capacity||{});return {sizeClass:d?.world?.sizeClass||"standard",sizeLabel:sc.label||"標準区画",terrainTags:[...(d?.world?.terrainTags||[])],travelCost:Number(d?.world?.travelCost)||1,capacity:{facilitySlots:Number(cap.facilitySlots)||0,landmarkSlots:Number(cap.landmarkSlots)||0,residentCapacity:Number(cap.residentCapacity)||0},traffic:cap.traffic||sc.traffic||"medium"}};

// Ver0.44: エリア共通SceneSpec。今は「どこに何を置くか」の意味を1000x1000論理座標で固定し、
// 実マップ画像・道路・施設座標は後から差し替えられるようにする。
function scaleNormShape(shape,playfield){
 const sx=playfield.w/1000,sy=playfield.h/1000,v=shape?.v||[];
 if(shape?.shape==="rect")return {shape:"rect",v:[playfield.x+v[0]*sx,playfield.y+v[1]*sy,v[2]*sx,v[3]*sy],reason:shape.reason||shape.id};
 if(shape?.shape==="circle")return {shape:"circle",v:[playfield.x+v[0]*sx,playfield.y+v[1]*sy,v[2]*Math.min(sx,sy)],reason:shape.reason||shape.id};
 if(shape?.shape==="poly")return {shape:"poly",v:(v||[]).map(p=>[playfield.x+p[0]*sx,playfield.y+p[1]*sy]),reason:shape.reason||shape.id};
 return null;
}
function scaleNormPoint(point,playfield){const sx=playfield.w/1000,sy=playfield.h/1000;return {x:playfield.x+Number(point?.[0]||0)*sx,y:playfield.y+Number(point?.[1]||0)*sy}}
F.areaSceneSpec=areaId=>{
 const area=typeof areaId==="string"?F.areaDef?.(areaId):areaId;if(!area)return null;
 const template=F.areaSceneTemplateDef?.(area.world?.sceneTemplate);if(!template)return null;
 const view=F.areaViewProfile?.(area.world?.viewProfile)||F.areaViewProfile?.(F.AREA_SCENE_SCHEMA?.defaultViewProfile);if(!view)return null;
 const scene=Object.assign({},view.canvas,area.nav?.scene||{}),playfield=Object.assign({},view.playfield,area.nav?.worldRect||{});
 const zones=(template.zones||[]).map(z=>({...z,pixelShape:scaleNormShape(z,playfield)}));
 const connected=F.areaConnections?.(area.id)||[],ports={};
 for(const [port,pd] of Object.entries(template.ports||{})){
  const conn=connected.find(c=>(c.a===area.id?c.aPort:c.bPort)===port),targetId=conn?(conn.a===area.id?conn.b:conn.a):null;
  ports[port]={id:port,pixelShape:scaleNormShape({...pd,reason:`port:${port}`},playfield),arrival:scaleNormPoint(pd.arrival,playfield),connected:!!conn,connectionId:conn?.id||null,targetAreaId:targetId,future:(area.world?.futurePorts||[]).includes(port)};
 }
 return {schemaVersion:Number(F.AREA_SCENE_SCHEMA?.version)||1,areaId:area.id,areaName:area.name,templateId:template.id,templateLabel:template.label,viewProfile:view.id,scene,playfield,zones,ports,capacity:F.areaPlanningInfo(area).capacity,sceneStatus:area.world?.sceneStatus||"planned"};
};
F.areaSceneZones=(areaId,kind)=>{const sp=F.areaSceneSpec(areaId);return (sp?.zones||[]).filter(z=>!kind||z.kind===kind)};
F.areaSceneSpecStats=areaId=>{const sp=F.areaSceneSpec(areaId);if(!sp)return null;const counts={};for(const z of sp.zones)counts[z.kind]=(counts[z.kind]||0)+1;return {areaId:sp.areaId,templateId:sp.templateId,templateLabel:sp.templateLabel,sceneStatus:sp.sceneStatus,zones:sp.zones.length,counts,ports:Object.values(sp.ports).length,connectedPorts:Object.values(sp.ports).filter(p=>p.connected).length,futurePorts:Object.values(sp.ports).filter(p=>p.future&&!p.connected).length,facilitySlots:sp.zones.filter(z=>z.kind==="facility").length,landmarkSlots:sp.zones.filter(z=>z.kind==="landmark").length,constructionZones:sp.zones.filter(z=>z.kind==="construction").length,npcZones:sp.zones.filter(z=>z.kind==="npc").length};};
F.validateAreaSceneSpec=areaId=>{const area=F.areaDef?.(areaId),sp=F.areaSceneSpec(areaId),errors=[],warnings=[];if(!area){errors.push("不明なエリア");return {ok:false,errors,warnings}}if(!sp){errors.push("SceneSpecテンプレート未定義");return {ok:false,errors,warnings}}const kinds=new Set(sp.zones.map(z=>z.kind));for(const k of (F.AREA_SCENE_SCHEMA?.required||[]))if(!kinds.has(k))errors.push(`必須zone不足: ${k}`);const stats=F.areaSceneSpecStats(areaId),cap=sp.capacity||{};if(stats.facilitySlots<Number(cap.facilitySlots||0))warnings.push(`施設枠 ${stats.facilitySlots}/${cap.facilitySlots}`);if(stats.landmarkSlots<Number(cap.landmarkSlots||0))warnings.push(`ランドマーク枠 ${stats.landmarkSlots}/${cap.landmarkSlots}`);for(const n of F.areaNeighbors?.(areaId)||[]){if(!sp.ports?.[n.fromPort])errors.push(`接続port未定義: ${n.fromPort}`)}for(const p of (area.world?.futurePorts||[]))if(!sp.ports?.[p])warnings.push(`将来port未定義: ${p}`);return {ok:errors.length===0,errors,warnings,stats};};
F.areaSceneSpecSummary=()=> (F.AREA_DEFS||[]).map(a=>({area:a,spec:F.areaSceneSpec(a.id),validation:F.validateAreaSceneSpec(a.id),stats:F.areaSceneSpecStats(a.id)}));
// Ver0.44: SceneSpec -> RuntimeScene compiler.
// 最終画像の座標を固定せず、SceneSpecから実マップ側で必要なデータを一括生成する。
function sceneShapeBounds(sh){if(!sh)return null;if(sh.shape==="rect")return{x:sh.v[0],y:sh.v[1],w:sh.v[2],h:sh.v[3]};if(sh.shape==="circle")return{x:sh.v[0]-sh.v[2],y:sh.v[1]-sh.v[2],w:sh.v[2]*2,h:sh.v[2]*2};if(sh.shape==="poly"){const xs=sh.v.map(p=>p[0]),ys=sh.v.map(p=>p[1]);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)}}return null}
function sceneShapeCenter(sh){const b=sceneShapeBounds(sh);return b?{x:b.x+b.w/2,y:b.y+b.h/2}:{x:0,y:0}}
function closestPointOnShape(sh,p){if(!sh)return null;if(sh.shape==="rect"){const [x,y,w,h]=sh.v;return{x:Math.max(x,Math.min(x+w,p.x)),y:Math.max(y,Math.min(y+h,p.y))}}if(sh.shape==="circle"){const [cx,cy,r]=sh.v,dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy)||1;if(d<=r)return{x:p.x,y:p.y};return{x:cx+dx/d*r,y:cy+dy/d*r}}return sceneShapeCenter(sh)}
function nearestWalkAnchor(point,walkShapes){let best=null,bd=Infinity;for(const sh of walkShapes){const q=closestPointOnShape(sh,point);if(!q)continue;const d=Math.hypot(q.x-point.x,q.y-point.y);if(d<bd){bd=d;best=q}}return best||point}
F.compileAreaScene=(areaId,s=null)=>{
 const sp=F.areaSceneSpec(areaId);if(!sp)return null;const area=F.areaDef?.(areaId);if(!area)return null;
 const zones=sp.zones||[],walkZones=zones.filter(z=>z.kind==="walk"),walkShapes=walkZones.map(z=>({...z.pixelShape,reason:`spec:${z.id}`})).filter(Boolean);
 const facilitySlots=zones.filter(z=>z.kind==="facility").map(z=>{const center=sceneShapeCenter(z.pixelShape),entry=nearestWalkAnchor(center,walkShapes);return{id:z.id,slot:Number(z.slot)||0,shape:z.pixelShape,bounds:sceneShapeBounds(z.pixelShape),center,entrance:entry,interaction:{id:`plot_${z.id}`,type:"plot",label:`建設候補地 ${Number(z.slot)||0}`,x:entry.x,y:entry.y,r:46,slot:Number(z.slot)||0}}});
 const constructionZones=zones.filter(z=>z.kind==="construction").map(z=>({id:z.id,shape:z.pixelShape,bounds:sceneShapeBounds(z.pixelShape),center:sceneShapeCenter(z.pixelShape)}));
 const landmarkSlots=zones.filter(z=>z.kind==="landmark").map(z=>({id:z.id,slot:Number(z.slot)||0,shape:z.pixelShape,bounds:sceneShapeBounds(z.pixelShape),center:sceneShapeCenter(z.pixelShape)}));
 const serviceZones=zones.filter(z=>z.kind==="service").map(z=>({id:z.id,shape:z.pixelShape,bounds:sceneShapeBounds(z.pixelShape),center:sceneShapeCenter(z.pixelShape)}));
 const npcActivity=zones.filter(z=>z.kind==="npc").map((z,i)=>{const center=sceneShapeCenter(z.pixelShape),anchor=nearestWalkAnchor(center,walkShapes);return{id:z.id,shape:z.pixelShape,bounds:sceneShapeBounds(z.pixelShape),center,anchor,waypoints:[anchor,{x:anchor.x+(i%2?24:-24),y:anchor.y+((i%3)-1)*28}]}});
 const ports=Object.values(sp.ports||{}),entries={},exits=[],portConnectors=[];for(const port of ports){if(!port.targetAreaId||port.pixelShape?.shape!=="rect")continue;const v=port.pixelShape.v;entries[port.targetAreaId]={x:port.arrival.x,y:port.arrival.y};exits.push({id:port.id,to:port.targetAreaId,x:v[0],y:v[1],w:v[2],h:v[3],entry:{x:port.arrival.x,y:port.arrival.y}});
  // SceneSpecテンプレートの主通路と接続portが離れていても、コンパイラが短い連絡路を自動生成する。
  const anchor=nearestWalkAnchor(port.arrival,walkShapes),dx=anchor.x-port.arrival.x,dy=anchor.y-port.arrival.y,w=34;if(Math.hypot(dx,dy)>4){const segs=[];if(Math.abs(dx)>=Math.abs(dy)){segs.push({shape:"rect",v:[Math.min(port.arrival.x,anchor.x),port.arrival.y-w/2,Math.max(w,Math.abs(dx)),w],reason:`port-connector:${port.id}:h`});if(Math.abs(dy)>4)segs.push({shape:"rect",v:[anchor.x-w/2,Math.min(port.arrival.y,anchor.y),w,Math.max(w,Math.abs(dy))],reason:`port-connector:${port.id}:v`});}else{segs.push({shape:"rect",v:[port.arrival.x-w/2,Math.min(port.arrival.y,anchor.y),w,Math.max(w,Math.abs(dy))],reason:`port-connector:${port.id}:v`});if(Math.abs(dx)>4)segs.push({shape:"rect",v:[Math.min(port.arrival.x,anchor.x),anchor.y-w/2,Math.max(w,Math.abs(dx)),w],reason:`port-connector:${port.id}:h`});}for(const sh of segs){walkShapes.push(sh);portConnectors.push({id:`connector_${port.id}_${portConnectors.length}`,kind:"walk",pixelShape:sh,portId:port.id,targetAreaId:port.targetAreaId});}}}
 const connected=ports.filter(p=>p.connected),spawn=(connected[0]?.arrival)||nearestWalkAnchor({x:sp.playfield.x+sp.playfield.w/2,y:sp.playfield.y+sp.playfield.h/2},walkShapes);
 const interactions=[...facilitySlots.map(x=>x.interaction),...landmarkSlots.map(x=>({id:`landmark_${x.id}`,type:"landmark",label:"ランドマーク候補",x:x.center.x,y:x.center.y,r:52}))];
 const npcWaypoints=npcActivity.flatMap(n=>n.waypoints.map((p,i)=>({id:`${n.id}_${i}`,x:p.x,y:p.y})));
 const nav={scene:sp.scene,worldRect:sp.playfield,spawn,entries,exits,base:{defaultWalkable:false,blocks:[],walk:walkShapes,interactions,npcWaypoints},source:"scene-spec-compiler",spec:sp};
 return {schemaVersion:2,compiler:"scene-spec-v2",areaId:area.id,areaName:area.name,theme:area.world?.theme||"generic",templateId:sp.templateId,scene:sp.scene,playfield:sp.playfield,walkZones:[...walkZones,...portConnectors],portConnectors,facilitySlots,constructionZones,landmarkSlots,serviceZones,npcActivity,ports,spawn,nav};
};
F.compiledAreaSceneStats=(areaId,s=null)=>{const r=F.compileAreaScene(areaId,s);if(!r)return null;return{compiler:r.compiler,walkZones:r.walkZones.length,facilitySlots:r.facilitySlots.length,constructionZones:r.constructionZones.length,npcZones:r.npcActivity.length,npcWaypoints:r.nav.base.npcWaypoints.length,landmarks:r.landmarkSlots.length,services:r.serviceZones.length,ports:r.ports.length,connectedPorts:r.ports.filter(p=>p.connected).length,interactions:r.nav.base.interactions.length}};
F.validateCompiledAreaScene=(areaId,s=null)=>{const r=F.compileAreaScene(areaId,s),errors=[],warnings=[];if(!r)return{ok:false,errors:["RuntimeSceneを生成できません"],warnings};if(!r.walkZones.length)errors.push("通行域がありません");if(!r.ports.some(p=>p.connected))warnings.push("接続済みportがありません");for(const f of r.facilitySlots)if(!f.entrance)errors.push(`施設枠入口を生成できません: ${f.id}`);if(!r.nav?.spawn)errors.push("spawn未生成");return{ok:errors.length===0,errors,warnings,stats:F.compiledAreaSceneStats(areaId,s)}};

F.areaCommonNav=areaId=>F.compileAreaScene?.(areaId)?.nav||null;
F.areaNavDefinition=areaId=>{const area=F.areaDef?.(areaId);if(!area)return null;if(area.id==="core")return {scene:area.nav?.scene,worldRect:area.nav?.worldRect,spawn:area.nav?.spawn,entries:area.nav?.entries,exits:area.nav?.exits,base:F.TOWN_NAV_BASE||{},source:"authored"};if(area.world?.runtimeGenerator==="scene-spec-v2")return F.areaCommonNav(areaId);if(area.nav?.base||area.nav?.exits)return {...area.nav,source:"authored"};return F.areaCommonNav(areaId)};
F.worldMapModel=s=>{
 const areas=(F.AREA_DEFS||[]).map(d=>{const plan=F.areaPlanningInfo(d),specStats=F.areaSceneSpecStats?.(d.id),specCheck=F.validateAreaSceneSpec?.(d.id);return {id:d.id,name:d.name,icon:d.icon||"🗺️",gx:Number(d.world?.gx)||0,gy:Number(d.world?.gy)||0,role:d.world?.role||"expansion",sceneStatus:d.world?.sceneStatus||"planned",sceneTemplate:d.world?.sceneTemplate||"",sceneSpecOk:!!specCheck?.ok,sceneSpecWarnings:(specCheck?.warnings||[]).length,sceneSpecStats:specStats,futurePorts:[...(d.world?.futurePorts||[])],theme:d.world?.theme||"generic",growth:d.world?.growth||"branch",state:F.areaEffectiveState(s,d.id),actualState:F.areaState(s,d.id),tags:[...(d.tags||[])],description:d.description||"",...plan,expansionProfiles:Object.assign({},d.world?.expansionProfiles||{})}});
 const connections=(F.AREA_CONNECTION_DEFS||[]).filter(c=>areas.some(a=>a.id===c.a)&&areas.some(a=>a.id===c.b)).map(c=>{const sa=F.areaEffectiveState(s,c.a),sb=F.areaEffectiveState(s,c.b),open=F.connectionOpen(s,c),travel=F.connectionTravelInfo(c);return {...c,open,aState:sa,bState:sb,travelCost:Number(c.travelCost)||1,travel}});
 return {definition:F.TOWN_WORLD_DEF||{},policy:F.TOWN_SCENE_POLICY||{},areas,connections,future:F.worldFutureExpansionCandidates(s),scale:F.townScaleTier(s),nextScale:F.nextTownScaleTier(s),currentAreaId:s?.townWorld?.currentAreaId||s?.townMovement?.areaId||"core"};
};
F.worldMapStats=s=>{const m=F.worldMapModel(s),all=[...m.areas,...m.future],xs=all.map(a=>a.gx),ys=all.map(a=>a.gy),capacity=m.areas.reduce((o,a)=>{o.facilitySlots+=Number(a.capacity?.facilitySlots)||0;o.landmarkSlots+=Number(a.capacity?.landmarkSlots)||0;o.residentCapacity+=Number(a.capacity?.residentCapacity)||0;return o},{facilitySlots:0,landmarkSlots:0,residentCapacity:0});return {areas:m.areas.length,connections:m.connections.length,future:m.future.length,minX:Math.min(...xs,0),maxX:Math.max(...xs,0),minY:Math.min(...ys,0),maxY:Math.max(...ys,0),planned:m.areas.filter(a=>a.sceneStatus!=="ready").length,scale:m.scale?.label||"開拓地",capacity}};
// 施設を将来の未知エリアへ配置できるよう、候補地判定もタグ駆動にする。現在の実景観は中心開拓地のみ試作。
F.facilityAreaCandidates=(s,facilityId)=>{const def=(F.FACILITY_DEFS||[]).find(d=>d.id===facilityId),want=new Set(def?.areaTagsAny||[]);return (F.AREA_DEFS||[]).filter(a=>F.areaStateIndex(F.areaEffectiveState(s,a.id))>=3).filter(a=>!want.size||(a.tags||[]).some(t=>want.has(t))).map(a=>a.id)};
F.townOptions=s=>{
 const pts=Number(s?.development?.points)||0,t=F.townState(s),out=[];
 for(const def of (F.FACILITY_DEFS||[])){
   const cur=Math.max(0,Number(t.facilities?.[def.id])||0),next=cur+1,lv=def.levels?.[next];
   if(t.projects?.[def.id])continue;
   if(!lv||next>Number(def.maxLevel||0))continue;
   out.push({id:lv.actionId||`${def.id}${next}`,facilityId:def.id,targetLevel:next,name:lv.label||`${def.name} Lv${next}`,desc:lv.desc||'',need:Number(lv.need)||0,done:false,icon:def.icon||'🏗️',route:def.route||'standard',available:pts>=Number(lv.need||0)});
 }
 return out.sort((a,b)=>a.need-b.need||a.name.localeCompare(b.name,'ja'));
};
F.applyTownDevelopment=id=>F.mutateSave(s=>{
 s.development.town=s.development.town||{};s.development.town.facilities=s.development.town.facilities||{};s.development.town.order=Array.isArray(s.development.town.order)?s.development.town.order:[];
 const opt=F.townOptions(s).find(x=>x.id===id);if(!opt)throw new Error("この発展項目は現在選べません。");if(!opt.available)throw new Error(`発展${opt.need}ptで選べます。`);
 const cur=Math.max(0,Number(s.development.town.facilities[opt.facilityId])||0);if(cur>=opt.targetLevel)throw new Error("すでに発展済みです。");
 s.development.town.projects=s.development.town.projects||{};if(s.development.town.projects[opt.facilityId])throw new Error("この施設は工事中です。");
 s.development.town.projects[opt.facilityId]={facilityId:opt.facilityId,fromLevel:cur,targetLevel:opt.targetLevel,phaseIndex:0,stepsDone:0,startedDay:s.day,updatedDay:s.day};
 s.development.town.facilityAreas=s.development.town.facilityAreas||{};
 if(!s.development.town.facilityAreas[opt.facilityId])s.development.town.facilityAreas[opt.facilityId]="core";
 if((s.development.town.priority||"standard")==="standard"&&opt.route&&opt.route!=="standard")s.development.town.priority=opt.route;
 s.development.town.order.push(opt.id);
 // 旧版との互換用ミラー
 s.development.town.shopLevel=Math.max(1,Number(s.development.town.facilities.shop)||1);
 s.development.town.forgeBuilt=Number(s.development.town.facilities.forge||0)>=1;s.development.town.houseBuilt=Number(s.development.town.facilities.house||0)>=1;
 s.development.town.marketBuilt=Number(s.development.town.facilities.market||0)>=1;s.development.town.plazaBuilt=Number(s.development.town.facilities.plaza||0)>=1;
 F.addHistory(s,"development",`${opt.name}の建設を開始した。`);
});
F.addDevelopmentPoints=n=>F.mutateSave(s=>{s.development.points=Math.max(0,(Number(s.development.points)||0)+(Number(n)||0));s.development.stage=F.developmentStage(s.development.points);});

// Ver0.28 TEST専用：レイヤー定義に書かれた汎用ルールを評価する。
// 「全部ON」は生の全重ねではなく完成表示（max preset）。段階レイヤーは exclusiveGroup で排他解決する。
function evalLayerRule(s,rule){
 if(!rule)return false;const t=F.townState(s),pts=Number(s?.development?.points)||0,type=rule.type;
 if(type==="always")return true;
 if(type==="pointsGte")return pts>=Number(rule.value||0);
 if(type==="facilityGte")return Number(t.facilities?.[rule.facilityId]||0)>=Number(rule.value||0);
 if(type==="routeIn")return (rule.values||[]).includes(F.townRoute(s));
 if(type==="all")return (rule.rules||[]).every(r=>evalLayerRule(s,r));
 if(type==="any")return (rule.rules||[]).some(r=>evalLayerRule(s,r));
 if(type==="fieldTrue")return !!t[rule.field];
 if(type==="fieldGte")return Number(t[rule.field]||0)>=Number(rule.value||0);
 if(type==="projectActive")return !!t.projects?.[rule.facilityId];
 if(type==="projectPhaseIn"){const pr=t.projects?.[rule.facilityId];if(!pr)return false;const ph=F.constructionPhase(pr);return (rule.values||[]).includes(ph?.id)}
 return false;
}
F.townLayerTestPreset=s=>{const p=s?.settings?.townLayerTest?.preset;return ["auto","custom","off","max","raw"].includes(p)?p:"custom"};
F.townLayerAutoState=(s,def)=>!!def&&(def.kind==="base"||evalLayerRule(s,def.auto));
F.townLayerTestMode=(s,id)=>{const v=s?.settings?.townLayerTest?.layers?.[id];return v==="on"||v==="off"?v:"auto"};
function layerCandidate(s,def,preset){
 if(def?.locked||def?.kind==="base")return true;
 if(preset==="off")return false;
 if(preset==="raw")return true;
 if(preset==="max")return def.maxVisible!==false;
 const auto=F.townLayerAutoState(s,def),mode=F.townLayerTestMode(s,def?.id);
 return mode==="on"?true:mode==="off"?false:auto;
}
function resolveExclusive(states,preset){
 if(preset==="raw")return states;
 const groups=new Map();
 for(const x of states){if(!x.effective||!x.def.exclusiveGroup)continue;const g=x.def.exclusiveGroup;if(!groups.has(g))groups.set(g,[]);groups.get(g).push(x)}
 for(const list of groups.values()){
  if(list.length<2)continue;
  list.sort((a,b)=>{
   const af=a.mode==="on"?1:0,bf=b.mode==="on"?1:0;if(af!==bf)return bf-af;
   return Number(b.def.rank||0)-Number(a.def.rank||0);
  });
  for(let i=1;i<list.length;i++){list[i].effective=false;list[i].suppressed=true}
 }
 return states;
}
F.townLayerStates=s=>{const preset=F.townLayerTestPreset(s);const states=(F.TOWN_LAYER_DEFS||[]).map(def=>({def,auto:F.townLayerAutoState(s,def),mode:F.townLayerTestMode(s,def.id),effective:layerCandidate(s,def,preset),suppressed:false}));return resolveExclusive(states,preset)};
F.setTownLayerTestMode=(id,mode)=>F.mutateSave(s=>{
 const def=(F.TOWN_LAYER_DEFS||[]).find(x=>x.id===id);if(!def||def.locked)return;if(!["auto","on","off"].includes(mode))throw new Error("不正なレイヤー指定です。");
 s.settings=s.settings||{};s.settings.townLayerTest=s.settings.townLayerTest||{layers:{},preset:"custom"};s.settings.townLayerTest.layers=s.settings.townLayerTest.layers||{};s.settings.townLayerTest.preset="custom";
 if(mode==="auto")delete s.settings.townLayerTest.layers[id];else s.settings.townLayerTest.layers[id]=mode;
 // 排他グループで1枚を強制ONした場合、兄弟レイヤーは強制OFF。段階画像の二重重ねを防ぐ。
 if(mode==="on"&&def.exclusiveGroup)for(const other of (F.TOWN_LAYER_DEFS||[]))if(other.id!==def.id&&other.exclusiveGroup===def.exclusiveGroup&&!other.locked)s.settings.townLayerTest.layers[other.id]="off";
});
F.setTownLayerTestPreset=preset=>F.mutateSave(s=>{if(!["auto","custom","off","max","raw"].includes(preset))throw new Error("不正な表示プリセットです。");s.settings=s.settings||{};s.settings.townLayerTest=s.settings.townLayerTest||{layers:{}};s.settings.townLayerTest.preset=preset;if(preset!=="custom")s.settings.townLayerTest.layers={};});
F.setAllTownLayerTestModes=mode=>{const map={auto:"auto",off:"off",on:"max",raw:"raw"};if(!map[mode])throw new Error("不正なレイヤー指定です。");return F.setTownLayerTestPreset(map[mode])};


// Ver0.33: 町の見た目レイヤーと同じ定義から通行判定を生成する。
// 主人公・町ポケモン・NPC移動は、このモデルを共通利用する。
function navShapeContains(shape,x,y,pad=0){
 if(!shape)return false;const v=shape.v||[],p=Math.max(0,Number(pad)||0);
 if(shape.shape==="rect")return x>=v[0]-p&&y>=v[1]-p&&x<v[0]+v[2]+p&&y<v[1]+v[3]+p;
 if(shape.shape==="circle"){const dx=x-v[0],dy=y-v[1],r=Number(v[2]||0)+p;return dx*dx+dy*dy<=r*r}
 if(shape.shape==="poly"){
  const pts=Array.isArray(v)?v:[];if(pts.length<3)return false;
  // pad付きは頂点ごとの厳密なオフセットではなく、辺までの距離も使って安全側に判定する。
  let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){
   const xi=Number(pts[i][0]),yi=Number(pts[i][1]),xj=Number(pts[j][0]),yj=Number(pts[j][1]);
   const hit=((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/((yj-yi)||1e-9)+xi);if(hit)inside=!inside;
  }
  if(inside)return true;if(p<=0)return false;
  const segDist=(ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;if(!l2)return Math.hypot(x-ax,y-ay);let t=((x-ax)*dx+(y-ay)*dy)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(x-(ax+t*dx),y-(ay+t*dy))};
  for(let i=0,j=pts.length-1;i<pts.length;j=i++)if(segDist(Number(pts[j][0]),Number(pts[j][1]),Number(pts[i][0]),Number(pts[i][1]))<=p)return true;
  return false;
 }
 return false;
}
function currentTownAreaId(s){return F.areaDef?.(s?.townMovement?.areaId)?s.townMovement.areaId:(F.areaDef?.(s?.townWorld?.currentAreaId)?s.townWorld.currentAreaId:"core")}
function navCollect(s,areaId=currentTownAreaId(s)){
 const area=F.areaDef?.(areaId)||F.areaDef?.("core"),isCore=area?.id==="core",navDef=F.areaNavDefinition?.(area?.id)||area?.nav||{},base=navDef.base||{defaultWalkable:true},states=isCore?F.townLayerStates(s).filter(x=>x.effective):[];
 const blocks=[...(base.blocks||[])],walk=[...(base.walk||[])],interactions=[...(base.interactions||[])],entrances=[],npcWaypoints=[...(base.npcWaypoints||[])];
 if(isCore)for(const x of states){const n=x.def.nav;if(!n)continue;blocks.push(...(n.blocks||[]));walk.push(...(n.walk||[]));interactions.push(...(n.interactions||[]));entrances.push(...(n.entrances||[]));npcWaypoints.push(...(n.npcWaypoints||[]))}
 if(isCore)for(const pr of F.townProjects(s)){const site=F.facilitySite?.(pr.facilityId),def=(F.FACILITY_DEFS||[]).find(d=>d.id===pr.facilityId),ph=F.constructionPhase(pr);if(!site||site.areaId!=="core")continue;const navPhase=F.CONSTRUCTION_NAV_PHASES?.[ph?.id]||{inset:8},inset=Math.max(0,Number(navPhase.inset)||0);blocks.push({shape:"rect",v:[site.x+inset,site.y+inset,Math.max(10,site.w-inset*2),Math.max(10,site.h-inset*2)],reason:`construction:${pr.facilityId}:${ph?.id||"phase"}`});interactions.push({id:`construction_${pr.facilityId}`,type:"construction",label:`${def?.name||pr.facilityId} ${ph?.label||"工事中"}`,x:site.entrance?.x||site.x+site.w/2,y:site.entrance?.y||site.y+site.h,r:55,facilityId:pr.facilityId})}
 const exits=(navDef.exits||[]).map(e=>{const route=F.areaExitConnection?.(s,area.id,e.id),ti=route?.travel||{};return {...e,targetState:F.areaEffectiveState(s,e.to),open:!!route?.open,connectionId:route?.connection?.id||null,travelMode:ti.mode||"walk",connectionKind:route?.connection?.kind||"path",autoTransition:!!ti.autoTransition,sceneReady:!!route&&["prototype","ready"].includes(route.target?.world?.sceneStatus||"")}});
 const uniq=a=>Array.from(new Map(a.map(x=>[x.id||JSON.stringify(x),x])).values());
 return {areaId:area?.id||"core",area,navDef,base,states,blocks,walk,interactions:uniq(interactions),entrances:uniq(entrances),npcWaypoints:uniq(npcWaypoints),exits};
}
F.townNavModel=(s,actor="player",areaId=null)=>{
 const n=navCollect(s,areaId||currentTownAreaId(s)),profile=typeof actor==="string"?(F.TOWN_ACTOR_NAV_PROFILES?.[actor]||F.TOWN_ACTOR_NAV_PROFILES?.player||{}):(actor||{}),pad=Math.max(0,Number(profile.radius)||0),scene=n.navDef?.scene||n.area?.nav?.scene||{w:717,h:842,cell:18},wr=n.navDef?.worldRect||n.area?.nav?.worldRect||{x:0,y:0,w:scene.w,h:scene.h},cell=Math.max(8,Number(scene.cell)||18);
 const cols=Math.ceil(scene.w/cell),rows=Math.ceil(scene.h/cell),grid=Array.from({length:rows},()=>Array(cols).fill(false));
 const blockedReasons=new Map();
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){const x=gx*cell+cell/2,y=gy*cell+cell/2;let ok=!!n.base.defaultWalkable&&x>=wr.x&&y>=wr.y&&x<wr.x+wr.w&&y<wr.y+wr.h;let reason=ok?"":"outside";for(const sh of n.blocks)if(navShapeContains(sh,x,y,pad)){ok=false;reason=sh.reason||"blocked"}for(const sh of n.walk)if(navShapeContains(sh,x,y,0)){ok=true;reason=""}for(const ex of n.exits)if(!ex.open&&x>=ex.x&&y>=ex.y&&x<ex.x+ex.w&&y<ex.y+ex.h){ok=false;reason=`gate:${ex.to}`}grid[gy][gx]=ok;if(reason)blockedReasons.set(`${gx},${gy}`,reason)}
 return {...n,actorProfile:profile,scene,worldRect:wr,cell,cols,rows,grid,blockedReasons,spawn:n.navDef?.spawn||n.area?.nav?.spawn||{x:350,y:395}};
};
F.townPointWalkable=(s,x,y,actor="player",areaId=null)=>{const m=F.townNavModel(s,actor,areaId),gx=Math.floor(Number(x)/m.cell),gy=Math.floor(Number(y)/m.cell);return !!m.grid?.[gy]?.[gx]};
F.townFindPath=(s,from,to,actor="player",areaId=null)=>{const m=F.townNavModel(s,actor,areaId),sx=Math.floor(from.x/m.cell),sy=Math.floor(from.y/m.cell),tx=Math.floor(to.x/m.cell),ty=Math.floor(to.y/m.cell),k=(x,y)=>`${x},${y}`;if(!m.grid?.[sy]?.[sx]||!m.grid?.[ty]?.[tx])return[];const q=[[sx,sy]],prev=new Map([[k(sx,sy),null]]);while(q.length){const [x,y]=q.shift();if(x===tx&&y===ty)break;for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy,nk=k(nx,ny);if(!m.grid?.[ny]?.[nx]||prev.has(nk))continue;prev.set(nk,[x,y]);q.push([nx,ny])}}if(!prev.has(k(tx,ty)))return[];const out=[];let cur=[tx,ty];while(cur){out.push({x:cur[0]*m.cell+m.cell/2,y:cur[1]*m.cell+m.cell/2});cur=prev.get(k(cur[0],cur[1]))}return out.reverse()};
F.townNearestWalkable=(s,point,actor="player",maxCells=8,areaId=null)=>{const m=F.townNavModel(s,actor,areaId),gx=Math.floor(Number(point.x)/m.cell),gy=Math.floor(Number(point.y)/m.cell);if(m.grid?.[gy]?.[gx])return{x:gx*m.cell+m.cell/2,y:gy*m.cell+m.cell/2};for(let r=1;r<=Math.max(1,Number(maxCells)||8);r++){let best=null,bestD=Infinity;for(let y=gy-r;y<=gy+r;y++)for(let x=gx-r;x<=gx+r;x++){if(Math.max(Math.abs(x-gx),Math.abs(y-gy))!==r||!m.grid?.[y]?.[x])continue;const px=x*m.cell+m.cell/2,py=y*m.cell+m.cell/2,d=Math.hypot(px-point.x,py-point.y);if(d<bestD){bestD=d;best={x:px,y:py}}}if(best)return best}return null};
F.townMovement=(s)=>{const m=s?.townMovement||{},areaId=F.areaDef?.(m.areaId)?m.areaId:(F.areaDef?.(s?.townWorld?.currentAreaId)?s.townWorld.currentAreaId:"core"),nav=F.townNavModel(s,"player",areaId),spawn=nav.spawn||{x:350,y:475};let player={x:Number(m.player?.x)||spawn.x,y:Number(m.player?.y)||spawn.y},partner={x:Number(m.partner?.x)||player.x+42,y:Number(m.partner?.y)||player.y};if(!F.townPointWalkable(s,player.x,player.y,"player")){const p=F.townNearestWalkable(s,spawn,"player",20);if(p)player=p}if(!F.townPointWalkable(s,partner.x,partner.y,"partner")){const p=F.townNearestWalkable(s,{x:player.x+42,y:player.y},"partner",10);if(p)partner=p}return{areaId,player,partner}};
F.setTownMovement=(player,partner,areaId=null)=>F.mutateSave(s=>{s.townMovement=s.townMovement||{areaId:"core"};if(areaId&&F.areaDef?.(areaId)){s.townMovement.areaId=areaId;s.townWorld=s.townWorld||{};s.townWorld.currentAreaId=areaId;s.townWorld.visitedAreas=Array.isArray(s.townWorld.visitedAreas)?s.townWorld.visitedAreas:[];if(!s.townWorld.visitedAreas.includes(areaId))s.townWorld.visitedAreas.push(areaId)}if(player)s.townMovement.player={x:Number(player.x),y:Number(player.y)};if(partner)s.townMovement.partner={x:Number(partner.x),y:Number(partner.y)};});
F.areaArrivalPoint=(targetAreaId,fromAreaId,s=null)=>{const a=F.areaDef?.(targetAreaId),nav=F.areaNavDefinition?.(targetAreaId)||a?.nav||{},raw=nav.entries?.[fromAreaId]||nav.spawn||{x:350,y:475};if(s&&F.townNearestWalkable){const p=F.townNearestWalkable(s,raw,"player",30,targetAreaId);if(p)return p}return raw};
// Ver0.50: 実機確認の前に、4方向の往路・復路が論理上つながっているか自動診断する。
F.townRoundTripDiagnostics=s=>{const test=JSON.parse(JSON.stringify(s||{}));test.settings=test.settings||{};test.settings.townAreaTest={states:{}};for(const a of (F.AREA_DEFS||[]))test.settings.townAreaTest.states[a.id]="usable";const coreNav=F.areaNavDefinition?.("core")||{},coreSpawn=coreNav.spawn||{x:350,y:475};return (F.TOWN_ROUNDTRIP_TEST_TARGETS||[]).map(t=>{const c=F.connectionBetween?.("core",t.areaId),coreExit=(coreNav.exits||[]).find(e=>e.to===t.areaId),targetNav=F.areaNavDefinition?.(t.areaId)||{},backExit=(targetNav.exits||[]).find(e=>e.to==="core"),outRoute=coreExit?F.areaExitConnection(test,"core",coreExit.id):null,backRoute=backExit?F.areaExitConnection(test,t.areaId,backExit.id):null,outApproach=outRoute?F.townExitApproachPoint(test,outRoute,"player","core"):null,targetArrival=F.areaArrivalPoint?.(t.areaId,"core",test),backApproach=backRoute?F.townExitApproachPoint(test,backRoute,"player",t.areaId):null,coreReturn=F.areaArrivalPoint?.("core",t.areaId,test),outPath=outApproach?F.townFindPath(test,coreSpawn,outApproach,"player","core"):[],backPath=(targetArrival&&backApproach)?F.townFindPath(test,targetArrival,backApproach,"player",t.areaId):[],returnWalkable=coreReturn?F.townPointWalkable(test,coreReturn.x,coreReturn.y,"player","core"):false,arrivalWalkable=targetArrival?F.townPointWalkable(test,targetArrival.x,targetArrival.y,"player",t.areaId):false,sceneReady=["prototype","ready"].includes(F.areaDef?.(t.areaId)?.world?.sceneStatus||"");const ok=!!c&&!!coreExit&&!!backExit&&!!outRoute?.open&&!!backRoute?.open&&sceneReady&&outPath.length>0&&backPath.length>0&&arrivalWalkable&&returnWalkable;return{...t,ok,connectionId:c?.id||null,sceneReady,outPathSteps:outPath.length,backPathSteps:backPath.length,arrivalWalkable,returnWalkable,issues:[!c&&"接続定義なし",!coreExit&&"中心側出口なし",!backExit&&"復路出口なし",!outPath.length&&"往路経路なし",!backPath.length&&"復路経路なし",!arrivalWalkable&&"到着点が通行不可",!returnWalkable&&"中心復帰点が通行不可",!sceneReady&&"実マップ未準備"].filter(Boolean)}})};
F.transitionTownArea=(targetAreaId,fromAreaId=null)=>F.mutateSave(s=>{const from=fromAreaId||s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core",target=F.areaDef?.(targetAreaId),c=F.connectionBetween?.(from,targetAreaId);if(!target||!c)throw new Error("接続先がありません。");if(!F.connectionOpen(s,c))throw new Error("この道はまだ開通していません。");if(!["prototype","ready"].includes(target.world?.sceneStatus||""))throw new Error("このエリアの実マップはまだ準備中です。");const p=F.areaArrivalPoint(targetAreaId,from,s),partner={x:p.x+34,y:p.y+22};s.townWorld=s.townWorld||{};s.townWorld.currentAreaId=targetAreaId;s.townWorld.visitedAreas=Array.isArray(s.townWorld.visitedAreas)?s.townWorld.visitedAreas:[];if(!s.townWorld.visitedAreas.includes(targetAreaId))s.townWorld.visitedAreas.push(targetAreaId);s.townMovement={areaId:targetAreaId,player:{x:p.x,y:p.y},partner};recordTownRoundTripTransition(s,from,targetAreaId);F.addHistory?.(s,"move",`${F.areaDef?.(from)?.name||from}から${target.name}へ移動した。`);});
F.resetTownMovement=()=>F.mutateSave(s=>{const spawn=F.areaNavDefinition?.("core")?.spawn||F.areaDef?.("core")?.nav?.spawn||{x:350,y:475};s.townWorld=s.townWorld||{};s.townWorld.currentAreaId="core";s.townMovement={areaId:"core",player:{x:spawn.x,y:spawn.y},partner:{x:spawn.x+42,y:spawn.y}};});
F.townNearestInteraction=(s,x,y,maxR=70)=>{const m=F.townNavModel(s);return m.interactions.map(it=>({...it,d:Math.hypot(Number(it.x)-x,Number(it.y)-y)})).filter(it=>it.d<=Math.max(maxR,Number(it.r)||0)).sort((a,b)=>a.d-b.d)[0]||null};
F.townNavStats=(s,actor="player")=>{const m=F.townNavModel(s,actor),all=m.cols*m.rows,walk=m.grid.reduce((n,row)=>n+row.filter(Boolean).length,0);return {cells:all,walkable:walk,blocked:all-walk,walkableRate:all?Math.round(walk/all*100):0,interactions:m.interactions.length,entrances:m.entrances.length,openExits:m.exits.filter(e=>e.open).length,totalExits:m.exits.length}};
F.setTownNavTestOverlay=on=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townNavTest=s.settings.townNavTest||{};s.settings.townNavTest.overlay=!!on;});
F.townNavTestOverlay=s=>!!s?.settings?.townNavTest?.overlay;

F.warehouseSummary=s=>Object.entries(s?.warehouse||{}).filter(([,n])=>Number(n)>0).map(([id,n])=>({itemId:id,item:F.item(id),qty:Number(n)||0,value:(Number(n)||0)*(Number(F.item(id)?.base)||0)}));
F.economySnapshot=s=>({coins:Number(s?.coins)||0,warehouseValue:F.warehouseSummary(s).reduce((n,x)=>n+x.value,0),sales:Object.assign({count:0,revenue:0,customers:0},s?.sales||{}),developmentPoints:Number(s?.development?.points)||0,time:F.timeInfo(s),day:Number(s?.day)||1});
F.storyStep=s=>s.story?.rumor?4:s.story?.firstSale?3:s.story?.firstReturn?2:1;
F.goal=s=>{
 if(!s.story.firstReturn)return {text:"装備を整えて『はじまりの森』から素材を持ち帰ろう！",hints:["冒険タブの『装備』で武器・防具・お守りを確認できるよ。","ダンジョンは人間の開拓者を直接操作するよ。","敵は野生ポケモン。素材や宝箱を探して階段を目指そう。"]};
 if(!s.story.firstStock)return {text:"持ち帰った品を、お店の商品棚に並べてみよう！",hints:["『お店』タブで空いている棚に商品を置けるよ。","倉庫にある品を1個ずつ棚へ移そう。"]};
 if(!s.story.firstSale)return {text:"お店を開いて、最初のお客さんに商品を売ろう！",hints:["棚に商品がある状態で『お店を開く』を押そう。","相場に近い値段なら買ってもらいやすいよ。"]};
 if(!s.story.rumor)return {text:"商売と冒険を続けて、開拓地の評判を広げよう！",hints:["人間主人公が探索と店を担当し、所持ポケモンは町の施設・依頼・発展側で活躍する方針だよ。","町の発展ポイントが10になると新しい噂が届くよ。"]};
 return {text:"『幻の大秘宝』につながる森の奥の噂を追おう！",hints:["装備を更新しながら、より深いダンジョンへ挑める仕組みに発展させるよ。","所持ポケモンは同行させず、町の力として使うよ。"]};
};

// Ver0.64: human-adventurer equipment helpers. Old Pokemon-team fields are kept only for save compatibility / town-side future use.
F.equipmentStats=s=>{const eq=s?.equipment?.equipped||{},out={attack:0,defense:0,hp:0,accuracyBonus:0,criticalBonus:0,damageReduction:0,foodSaveEvery:0,items:{}};for(const slot of (F.EQUIPMENT_SLOTS||[])){const d=F.equipment?.(eq[slot.id]);if(!d)continue;out.items[slot.id]=d;out.attack+=Number(d.attack)||0;out.defense+=Number(d.defense)||0;out.hp+=Number(d.hp)||0;out.accuracyBonus+=Number(d.accuracyBonus)||0;out.criticalBonus+=Number(d.criticalBonus)||0;out.damageReduction+=Number(d.damageReduction)||0;if(Number(d.foodSaveEvery)>0)out.foodSaveEvery=out.foodSaveEvery?Math.min(out.foodSaveEvery,Number(d.foodSaveEvery)):Number(d.foodSaveEvery)}return out};
F.equipmentSummary=s=>(F.EQUIPMENT_SLOTS||[]).map(slot=>{const d=F.equipment?.(s?.equipment?.equipped?.[slot.id]);return `${slot.icon}${d?.name||"なし"}`}).join(" / ");
F.equipItem=(slot,id)=>F.mutateSave(s=>{const d=F.equipment?.(id);if(!d||d.slot!==slot)throw new Error("この装備品はその場所には装備できません。");if(!s.equipment?.owned?.[id])throw new Error("その装備品を持っていません。");s.equipment.equipped[slot]=id;F.addHistory(s,"equipment",`${d.name}を装備した。`)});
function addOwnedEquipment(s,id,n=1){const d=F.equipment?.(id);if(!d)return false;s.equipment=s.equipment||{owned:{},equipped:{}};s.equipment.owned=s.equipment.owned||{};s.equipment.owned[id]=(Number(s.equipment.owned[id])||0)+Math.max(1,Number(n)||1);return true}
F.addOwnedEquipment=addOwnedEquipment;

// Ver0.64: dungeon protagonist is the human frontier adventurer. Pokemon appear as wild enemies only.
function emptyRun(s,dungeonId=F.DEFAULT_DUNGEON_ID){const d=F.dungeonDef?.(dungeonId)||F.dungeonDef?.(F.DEFAULT_DUNGEON_ID)||{},gear=F.equipmentStats(s),maxHp=36+gear.hp;return {active:true,dungeonId:d.id||dungeonId,dungeonName:d.name||"ダンジョン",floor:1,maxFloor:Number(d.maxFloor)||30,turn:0,fullness:Number(d.startFullness)||100,fullnessMax:Number(d.fullnessMax)||100,fullnessTickEvery:Math.max(1,Number(d.fullnessTickEvery)||10),naturalHealEvery:Math.max(1,Number(d.naturalHealEvery)||5),playerHp:maxHp,playerMaxHp:maxHp,playerLv:1,playerExp:0,playerAttack:4+gear.attack,playerDefense:2+gear.defense,equipment:Object.assign({},s?.equipment?.equipped||{}),foundEquipment:{},escape:Number(d.escapeCount??1),bag:{},bagLimit:Number(d.bagLimit)||F.BAG_LIMIT,statuses:{poison:0,paralysis:0,sleep:0,confusion:0},log:[],map:null,rooms:[],seen:null,floorItems:[],traps:[],attackFx:null,attackFxSeq:0,enemyAttackFx:[],enemyAttackFxSeq:0,player:{x:1,y:1},playerFacing:'down',playerStep:0,enemies:[]}}
function tileOpen(map,x,y){const h=map?.length||0,w=map?.[0]?.length||0;return x>=0&&y>=0&&x<w&&y<h&&map[y][x]!=="wall"}
// Ver0.60: dungeon-only 8-direction movement. Town/pathfinding keeps the existing 4-direction dirs.
const dungeonDirs8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function dungeonCanStep(map,x,y,dx,dy){dx=Math.sign(Number(dx)||0);dy=Math.sign(Number(dy)||0);if(!dx&&!dy)return false;const nx=x+dx,ny=y+dy;if(!tileOpen(map,nx,ny))return false;if(dx&&dy){if(!tileOpen(map,x+dx,y)||!tileOpen(map,x,y+dy))return false}return true}
function dungeonDistance(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}
F.dungeonCanStep=dungeonCanStep;
F.dungeonDirections8=dungeonDirs8.map(v=>v.slice());
function allOpenConnected(map,start={x:1,y:1}){const h=map?.length||0,w=map?.[0]?.length||0;let total=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(tileOpen(map,x,y))total++;if(!total||!tileOpen(map,start.x,start.y))return false;const q=[[start.x,start.y]],seen=new Set([key(start.x,start.y)]);for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[dx,dy]of dirs){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(tileOpen(map,nx,ny)&&!seen.has(k)){seen.add(k);q.push([nx,ny])}}}return seen.size===total}
function roomContains(r,x,y){return !!r&&x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h}
// Ver0.72: current sight stays separate from explored memory. Entering a room reveals that room for the auto map; corridors reveal locally as they are traversed.
function dungeonVisibility(run){if(!run?.map)return[];const h=run.map.length,w=run.map[0]?.length||0,vis=Array.from({length:h},()=>Array(w).fill(false));const mark=(x,y)=>{if(x>=0&&y>=0&&x<w&&y<h)vis[y][x]=true};let inRoom=null;for(const r of (run.rooms||[]))if(roomContains(r,run.player.x,run.player.y)){inRoom=r;break}if(inRoom){for(let y=inRoom.y-1;y<=inRoom.y+inRoom.h;y++)for(let x=inRoom.x-1;x<=inRoom.x+inRoom.w;x++)mark(x,y)}else{for(let y=run.player.y-1;y<=run.player.y+1;y++)for(let x=run.player.x-1;x<=run.player.x+1;x++)mark(x,y)}mark(run.player.x,run.player.y);return vis}
function revealDungeon(run){if(!run?.map)return;const h=run.map.length,w=run.map[0]?.length||0;if(!Array.isArray(run.seen)||run.seen.length!==h)run.seen=Array.from({length:h},()=>Array(w).fill(false));const vis=dungeonVisibility(run);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(vis[y]?.[x])run.seen[y][x]=true}
F.dungeonVisibility=dungeonVisibility;
F.isDungeonVisible=(run,x,y)=>!!dungeonVisibility(run)?.[y]?.[x];
F.revealDungeonMap=revealDungeon;
function randomOpen(map,blocked=new Set(),minDist=0,origin={x:1,y:1},predicate=null){const h=map?.length||0,w=map?.[0]?.length||0;for(let n=0;n<Math.max(900,w*h*5);n++){const x=F.rand(1,w-2),y=F.rand(1,h-2);if(!tileOpen(map,x,y)||blocked.has(key(x,y)))continue;if(Math.abs(x-origin.x)+Math.abs(y-origin.y)<minDist)continue;if(predicate&&!predicate(x,y))continue;return{x,y}}for(let y=h-2;y>=1;y--)for(let x=w-2;x>=1;x--)if(tileOpen(map,x,y)&&!blocked.has(key(x,y))&&(!predicate||predicate(x,y)))return{x,y};return{x:origin.x,y:origin.y}}
function carveRoom(map,r){for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)map[y][x]='floor'}
function carveCorridor(map,a,b,horizontalFirst=true){let x=a.x,y=a.y;const dig=(xx,yy)=>{if(map[yy]?.[xx]!=null)map[yy][xx]='floor'};dig(x,y);if(horizontalFirst){while(x!==b.x){x+=Math.sign(b.x-x);dig(x,y)}while(y!==b.y){y+=Math.sign(b.y-y);dig(x,y)}}else{while(y!==b.y){y+=Math.sign(b.y-y);dig(x,y)}while(x!==b.x){x+=Math.sign(b.x-x);dig(x,y)}}}
function roomCenter(r){return{x:Math.floor(r.x+r.w/2),y:Math.floor(r.y+r.h/2)}}
function frontierCombatAttack(sp){return Math.max(Number(sp?.stats?.atk)||45,Number(sp?.stats?.spAtk)||45)}
function createEnemy(sp,floor,pos,index){const depth=Math.max(1,Number(floor)||1),hp=Math.max(9,9+Math.round(depth*1.6)+Math.round((Number(sp?.stats?.hp)||55)/20)),atk=Math.max(2,2+Math.ceil(depth*.55)+Math.round(frontierCombatAttack(sp)/60));return{id:`e${floor}_${index}_${Date.now()%9999}`,speciesId:sp?.id||null,recordId:sp?.representativeId||null,name:sp?.name||"野生ポケモン",ai:sp?.ai||"wander",rarity:sp?.rarity||"common",move:sp?.move||"わざ",moveType:sp?.moveType||sp?.type1||"ノーマル",x:pos.x,y:pos.y,hp,maxHp:hp,atk,facing:'down',step:0,specialCooldown:F.rand(0,1)}}
// Ver0.83 TEST: B1F always contains one enemy for each status condition so real-device testing does not depend on random spawns.
const STATUS_TEST_ENEMY_DEFS=Object.freeze([
 {id:'poison',icon:'☠️',label:'どく',move:'どくばり',moveType:'どく',ai:'bruiser'},
 {id:'paralysis',icon:'⚡',label:'まひ',move:'でんじは',moveType:'でんき',ai:'ranged'},
 {id:'sleep',icon:'💤',label:'ねむり',move:'ねむりごな',moveType:'くさ',ai:'support'},
 {id:'confusion',icon:'💫',label:'こんらん',move:'ねんりき',moveType:'エスパー',ai:'ranged'}
]);
function statusTestSpecies(dungeonId,floor,type,used=new Set()){
 const local=(F.enemySpeciesCandidates?.(dungeonId,floor)||[]).map(x=>x.species).filter(Boolean),all=F.buildPokemonSpeciesMaster?.().records||[],match=sp=>[sp?.type1,sp?.type2,...(sp?.types||[])].includes(type)&&!used.has(sp?.id);
 return local.find(match)||all.find(match)||local.find(sp=>!used.has(sp?.id))||all.find(sp=>!used.has(sp?.id))||F.chooseEnemySpecies?.(dungeonId,floor)||null;
}
function generateFloor(run,s=null){
 const w=Math.max(24,Number(F.W)||32),h=Math.max(18,Number(F.H)||24),map=Array.from({length:h},()=>Array(w).fill("wall"));
 const cols=3,rows=2,sectorW=Math.floor((w-2)/cols),sectorH=Math.floor((h-2)/rows),rooms=[];
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
  const sx=1+gx*sectorW,sy=1+gy*sectorH,sw=(gx===cols-1?w-1:sx+sectorW)-sx,sh=(gy===rows-1?h-1:sy+sectorH)-sy;
  const rw=Math.max(5,Math.min(sw-2,F.rand(5,Math.max(5,sw-2)))),rh=Math.max(4,Math.min(sh-2,F.rand(4,Math.max(4,sh-2))));
  const rx=sx+F.rand(1,Math.max(1,sw-rw-1)),ry=sy+F.rand(1,Math.max(1,sh-rh-1));rooms.push({x:rx,y:ry,w:rw,h:rh,index:rooms.length});carveRoom(map,rooms[rooms.length-1]);
 }
 const centers=rooms.map(roomCenter),links=[[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5]];
 for(const [a,b] of links){if((a===1&&b===4)||(a===4&&b===5)){if(Math.random()<.45)continue}carveCorridor(map,centers[a],centers[b],Math.random()<.5)}
 for(let i=1;i<centers.length;i++)if(!allOpenConnected(map,centers[0]))carveCorridor(map,centers[i-1],centers[i],i%2===0);
 const startIndex=F.rand(0,rooms.length-1),startRoom=rooms[startIndex],start=roomCenter(startRoom);run.rooms=rooms;run.player={x:start.x,y:start.y};run.playerFacing=run.playerFacing||'down';run.playerStep=0;run.map=map;run.seen=Array.from({length:h},()=>Array(w).fill(false));run.enemies=[];run.floorItems=[];run.traps=[];run.attackFx=null;run.enemyAttackFx=[];
 const farRooms=rooms.map((r,i)=>({i,r,c:centers[i],d:Math.abs(centers[i].x-start.x)+Math.abs(centers[i].y-start.y)})).sort((a,b)=>b.d-a.d),stairsRoom=farRooms[0]?.r||rooms[(startIndex+3)%rooms.length];
 const blocked=new Set([key(start.x,start.y)]),roomTile=(r,x,y)=>roomContains(r,x,y),stairs=randomOpen(map,blocked,10,start,(x,y)=>roomTile(stairsRoom,x,y));map[stairs.y][stairs.x]='stairs';blocked.add(key(stairs.x,stairs.y));
 const gatherCount=9+Math.min(4,Number(run.floor)||1);for(let i=0;i<gatherCount;i++){const p=randomOpen(map,blocked,5,start),g=i===0?{item:"bread",min:1,max:1}:i===1?{item:"herb",min:1,max:1}:F.weighted(F.GATHER_TABLE||[]);if(!g)continue;const qty=F.rand(Number(g.min)||1,Number(g.max)||1);map[p.y][p.x]='gather';run.floorItems.push({x:p.x,y:p.y,itemId:g.item,qty});blocked.add(key(p.x,p.y))}
 const chestCount=run.floor>=2?4:3;for(let i=0;i<chestCount;i++){const targetRoom=rooms[(startIndex+i+2)%rooms.length]||rooms[0],p=randomOpen(map,blocked,7,start,(x,y)=>roomTile(targetRoom,x,y));map[p.y][p.x]='chest';blocked.add(key(p.x,p.y))}
 // Ver0.76 TEST: trap density is intentionally high so trap discovery/activation can be verified on real devices.
 const floorNo=Math.max(1,Number(run.floor)||1),trapCount=floorNo>=21?14:floorNo>=11?12:10;
 for(let i=0;i<trapCount;i++){const p=randomOpen(map,blocked,6,start,(x,y)=>map[y]?.[x]==='floor'),hit=F.weighted(F.DUNGEON_TRAP_TABLE||[]),type=hit?.value;if(!type)continue;run.traps.push({id:`t${run.floor}_${i}`,type,x:p.x,y:p.y,revealed:false,triggered:0});blocked.add(key(p.x,p.y))}
 const enemyCount=Math.min(9,5+(Number(run.floor)||1));let enemyIndex=0,statusTestPlaced=0;
 if(window.FRENDA_TEST?.active&&floorNo===1){
  const testRooms=rooms.map((r,i)=>({r,i,c:centers[i],d:Math.abs(centers[i].x-start.x)+Math.abs(centers[i].y-start.y)})).filter(x=>x.i!==startIndex).sort((a,b)=>a.d-b.d),usedSpecies=new Set();
  for(let j=0;j<STATUS_TEST_ENEMY_DEFS.length&&enemyIndex<enemyCount;j++){const def=STATUS_TEST_ENEMY_DEFS[j],target=testRooms[j%Math.max(1,testRooms.length)]?.r||rooms[(startIndex+j+1)%rooms.length],p=randomOpen(map,blocked,5,start,(x,y)=>roomTile(target,x,y)),sp=statusTestSpecies(run.dungeonId,run.floor,def.moveType,usedSpecies);if(!sp)continue;const e=createEnemy(sp,run.floor,p,enemyIndex++);e.ai=def.ai;e.move=def.move;e.moveType=def.moveType;e.specialCooldown=0;e.testStatusId=def.id;e.testStatusIcon=def.icon;e.testStatusLabel=def.label;run.enemies.push(e);blocked.add(key(p.x,p.y));usedSpecies.add(sp.id);statusTestPlaced++}
 }
 for(;enemyIndex<enemyCount;enemyIndex++){const p=randomOpen(map,blocked,8,start),sp=F.chooseEnemySpecies?.(run.dungeonId,run.floor);if(!sp)continue;blocked.add(key(p.x,p.y));run.enemies.push(createEnemy(sp,run.floor,p,enemyIndex))}
 run.statusTestEnemies=statusTestPlaced;
 if(s)F.markEncounterState?.(s,run.enemies.map(e=>e.speciesId),run.dungeonId);revealDungeon(run);
 const band=F.dungeonFloorBand?.(run.floor);run.log.push(`B${run.floor}F${band?.label?`・${band.label}`:""}へ入った。人間の冒険者ひとりで野生ポケモンのいる森を進む。${run.enemies.length?` 気配が${run.enemies.length}つある。`:""}${chestCount?` 宝箱が${chestCount}個ありそうだ。`:""}`);if(statusTestPlaced)run.log.push(`🧪 B1F TEST：どく・まひ・ねむり・こんらんの特殊攻撃敵を各1体、計${statusTestPlaced}体配置。`);return run
}
F.startRun=(dungeonId=F.DEFAULT_DUNGEON_ID)=>{const s=F.readSave(),d=F.dungeonDef?.(dungeonId);if(!d)throw new Error("このダンジョンはまだ利用できません。");const run=generateFloor(emptyRun(s,dungeonId),s);s.story.firstAdventure=true;F.addHistory(s,"adventure",`冒険者が${d.name}へ出発した。装備：${F.equipmentSummary(s)}`);F.writeSave(s);F.run=run;return run};
function bagSlots(bag){return Object.values(bag||{}).filter(n=>Number(n)>0).length}
F.bagSlots=bagSlots;
function addBag(run,id,n){if(!F.item(id))return false;const exists=Number(run.bag[id])>0;if(!exists&&bagSlots(run.bag)>=run.bagLimit){run.log.push("🎒 バッグがいっぱいで拾えなかった！");return false}run.bag[id]=(Number(run.bag[id])||0)+n;return true}
function entityAt(run,x,y){return run.enemies.find(e=>e.hp>0&&e.x===x&&e.y===y)||null}
function occupiedByPlayer(run,x,y){return run.player.x===x&&run.player.y===y}
function stepToward(map,from,to,run,enemy){const choices=dungeonDirs8.map(([dx,dy])=>({x:from.x+dx,y:from.y+dy,dx,dy,d:Math.max(Math.abs(from.x+dx-to.x),Math.abs(from.y+dy-to.y)),m:Math.abs(from.x+dx-to.x)+Math.abs(from.y+dy-to.y)})).filter(p=>dungeonCanStep(map,from.x,from.y,p.dx,p.dy)&&!occupiedByPlayer(run,p.x,p.y)&&!run.enemies.some(e=>e!==enemy&&e.hp>0&&e.x===p.x&&e.y===p.y)).sort((a,b)=>a.d-b.d||a.m-b.m);return choices[0]||from}
function equippedWeapon(run){return F.equipment?.(run?.equipment?.weapon)||null}
function equippedArmor(run){return F.equipment?.(run?.equipment?.armor)||null}
function equippedCharm(run){return F.equipment?.(run?.equipment?.charm)||null}
function weaponProfile(run){const w=equippedWeapon(run),p=w?.weapon||{};return {weapon:w,type:p.type||"unarmed",label:p.label||"素手",range:Math.max(1,Number(p.range)||1),directions:Number(p.directions)===4?4:8,accuracy:Math.max(.5,Math.min(1,Number(p.accuracy)||.9)),power:Math.max(.5,Number(p.power)||1)}}
function combatBonuses(run){const a=equippedArmor(run),c=equippedCharm(run);return {accuracyBonus:Number(c?.accuracyBonus)||0,criticalBonus:Number(c?.criticalBonus)||0,damageReduction:(Number(a?.damageReduction)||0)+(Number(c?.damageReduction)||0),foodSaveEvery:Number(c?.foodSaveEvery)||0}}
function setAttackFx(run,p,v){const seq=(Number(run.attackFxSeq)||0)+1;run.attackFxSeq=seq;run.attackFx={seq,type:p?.type||'unarmed',weaponId:p?.weapon?.id||null,dx:Number(v?.sx)||0,dy:Number(v?.sy)||1,range:Number(v?.dist)||1,hit:null,critical:false};return run.attackFx}
function floorItemAt(run,x,y){return (run?.floorItems||[]).find(it=>it.x===x&&it.y===y)||null}
F.floorItemAt=(run,x,y)=>floorItemAt(run||F.run,x,y);
function trapAt(run,x,y){return (run?.traps||[]).find(t=>t.x===x&&t.y===y)||null}
F.trapAt=(run,x,y)=>trapAt(run||F.run,x,y);
function triggerTrap(run){
 const trap=trapAt(run,run.player.x,run.player.y);if(!trap)return false;
 const def=F.dungeonTrap?.(trap.type)||{name:"罠",effect:"damage",power:4};trap.revealed=true;trap.triggered=(Number(trap.triggered)||0)+1;
 if(def.effect==="damage"){const dmg=Math.max(1,Number(def.power)||5);run.playerHp=Math.max(0,run.playerHp-dmg);run.log.push(`⚠️ ${def.name}！ 冒険者は${dmg}ダメージ。`);return true}
 if(def.effect==="fullness"){const before=run.fullness;run.fullness=Math.max(0,run.fullness-Math.max(1,Number(def.power)||10));run.log.push(`⚠️ ${def.name}！ 満腹度が${before-run.fullness}減った。`);return true}
 if(def.effect==="warp"){const blocked=new Set((run.enemies||[]).filter(e=>e.hp>0).map(e=>key(e.x,e.y)));for(const t of (run.traps||[]))blocked.add(key(t.x,t.y));blocked.add(key(run.player.x,run.player.y));let p=randomOpen(run.map,blocked,8,run.player,(x,y)=>run.map[y]?.[x]==='floor');run.player={x:p.x,y:p.y};run.playerStep=(Number(run.playerStep)||0)+1;revealDungeon(run);run.log.push(`⚠️ ${def.name}！ 冒険者は別の場所へ飛ばされた。`);return true}
 run.log.push(`⚠️ ${def.name}を踏んだ！`);return true
}
F.triggerDungeonTrap=run=>triggerTrap(run||F.run);
function straightAttackVector(dx,dy){dx=Number(dx)||0;dy=Number(dy)||0;const ax=Math.abs(dx),ay=Math.abs(dy);if(!ax&&!ay)return null;if(dx===0)return{sx:0,sy:Math.sign(dy),dist:ay,cardinal:true};if(dy===0)return{sx:Math.sign(dx),sy:0,dist:ax,cardinal:true};if(ax===ay)return{sx:Math.sign(dx),sy:Math.sign(dy),dist:ax,cardinal:false};return null}
function weaponCanAttack(run,tx,ty){const e=entityAt(run,tx,ty);if(!e)return{ok:false,reason:"そこに敵はいない。"};const p=weaponProfile(run),dx=tx-run.player.x,dy=ty-run.player.y,v=straightAttackVector(dx,dy);if(!v)return{ok:false,reason:"その方向には攻撃できない。"};if(v.dist>p.range)return{ok:false,reason:`${p.weapon?.name||"武器"}の間合い外だ。`};if(p.type==="spear"&&v.dist>1&&!v.cardinal)return{ok:false,reason:"槍で2マス先を突けるのは上下左右だけだ。"};if(p.directions===4&&!v.cardinal&&v.dist>1)return{ok:false,reason:"その武器では斜め遠距離を狙えない。"};let x=run.player.x,y=run.player.y;for(let i=1;i<=v.dist;i++){if(!dungeonCanStep(run.map,x,y,v.sx,v.sy))return{ok:false,reason:"壁にさえぎられている。"};x+=v.sx;y+=v.sy;if(i<v.dist&&entityAt(run,x,y))return{ok:false,reason:"手前のポケモンにさえぎられている。"}}return{ok:true,enemy:e,profile:p,vector:v}}
F.weaponProfile=weaponProfile;
F.weaponCanAttack=(run,tx,ty)=>weaponCanAttack(run||F.run,tx,ty);
function playerAttack(run,e){const p=weaponProfile(run),bonus=combatBonuses(run),accuracy=Math.max(.5,Math.min(.99,p.accuracy+bonus.accuracyBonus)),criticalChance=Math.max(.02,Math.min(.3,.05+bonus.criticalBonus));if(Math.random()>accuracy){run.log.push(`💨 ${p.weapon?.name||"素手"}の攻撃は外れた！`);return{hit:false,critical:false,damage:0}}const base=Math.max(2,3+run.playerLv+Number(run.playerAttack||0)),roll=F.rand(Math.max(2,base-2),base+2),critical=Math.random()<criticalChance,dmg=Math.max(1,Math.round(roll*p.power*(critical?1.5:1)));e.hp=Math.max(0,e.hp-dmg);run.log.push(`${critical?"✨ 急所！ ":"⚔️ "}${p.weapon?.name||"素手"}で攻撃！ ${e.name}に${dmg}ダメージ。`);if(e.hp<=0){run.log.push(`✅ ${e.name}を追い払った！`);run.playerExp+=2+run.floor;if(run.playerExp>=run.playerLv*5){run.playerExp=0;run.playerLv++;run.playerMaxHp+=3;run.playerHp=Math.min(run.playerMaxHp,run.playerHp+5);run.playerAttack++;run.log.push(`🌟 冒険者Lvが${run.playerLv}になった！`)}}return{hit:true,critical,damage:dmg}}
// Ver0.82: first player-status layer. Enemy special moves can inflict poison, paralysis, sleep or confusion.
const DUNGEON_STATUS_DEFS=Object.freeze({
 poison:{id:'poison',icon:'☠️',name:'どく',turns:12},
 paralysis:{id:'paralysis',icon:'⚡',name:'まひ',turns:5},
 sleep:{id:'sleep',icon:'💤',name:'ねむり',turns:3},
 confusion:{id:'confusion',icon:'💫',name:'こんらん',turns:6}
});
function ensureStatuses(run){run.statuses=run.statuses||{};for(const id of Object.keys(DUNGEON_STATUS_DEFS))run.statuses[id]=Math.max(0,Number(run.statuses[id])||0);return run.statuses}
function statusActive(run,id){return (Number(ensureStatuses(run)[id])||0)>0}
function statusText(run){const st=ensureStatuses(run),out=[];for(const [id,d] of Object.entries(DUNGEON_STATUS_DEFS))if(st[id]>0)out.push({id,icon:d.icon,name:d.name,turns:st[id]});return out}
function statusByEnemyMove(e,meta){if(window.FRENDA_TEST?.active&&e?.testStatusId&&DUNGEON_STATUS_DEFS[e.testStatusId])return e.testStatusId;const name=String(meta?.moveName||'').toLowerCase(),type=String(meta?.moveType||''),ai=String(e?.ai||'');let id=null,chance=0;
 if(/どく|ヘドロ|スモッグ|ポイズン/.test(name)){id='poison';chance=.55}
 else if(/でんじ|しびれ|ほうでん|10まん|かみなり/.test(name)){id='paralysis';chance=.48}
 else if(/ねむ|さいみん|うたう|キノコ/.test(name)){id='sleep';chance=.48}
 else if(/こんらん|あやしい|ねんりき|ちょうおんぱ|サイケ/.test(name)){id='confusion';chance=.48}
 else if(type==='どく'){id='poison';chance=.38}
 else if(type==='でんき'){id='paralysis';chance=.30}
 else if(type==='エスパー'||type==='ゴースト'){id='confusion';chance=.28}
 else if((type==='くさ'||type==='フェアリー')&&ai==='support'){id='sleep';chance=.22}
 return id&&Math.random()<chance?id:null
}
function inflictStatus(run,id,e=null){const d=DUNGEON_STATUS_DEFS[id];if(!d)return null;const st=ensureStatuses(run),was=st[id]>0,turns=d.turns+(id==='sleep'?F.rand(0,1):F.rand(0,2));st[id]=Math.max(st[id],turns);run.log.push(`${d.icon} ${e?.name?e.name+'のわざで ':''}冒険者は${d.name}状態になった！${was?' 効果時間が延びた。':''}`);return{name:d.name,icon:d.icon,id,turns:st[id]}}
function decayStatuses(run){const st=ensureStatuses(run);for(const id of Object.keys(DUNGEON_STATUS_DEFS)){if(st[id]>0){st[id]--;if(st[id]===0){const d=DUNGEON_STATUS_DEFS[id];run.log.push(`${d.icon} ${d.name}状態が治った。`)}}}}
function prePlayerAction(run,kind='move',dx=0,dy=0){ensureStatuses(run);if(statusActive(run,'sleep')){run.log.push('💤 眠っていて動けない！');return{blocked:true,reason:'sleep',dx,dy}}
 if(statusActive(run,'paralysis')&&Math.random()<.35){run.log.push('⚡ しびれて動けない！');return{blocked:true,reason:'paralysis',dx,dy}}
 if(kind==='move'&&statusActive(run,'confusion')){const d=dungeonDirs8[F.rand(0,dungeonDirs8.length-1)];run.log.push('💫 混乱して進む方向が分からない！');return{blocked:false,reason:'confusion',dx:d[0],dy:d[1]}}
 return{blocked:false,reason:null,dx,dy}}
F.dungeonStatusDefs=DUNGEON_STATUS_DEFS;
F.dungeonStatusList=run=>statusText(run||F.run);
F.dungeonHasDisruptiveStatus=run=>statusText(run||F.run).some(x=>['paralysis','sleep','confusion'].includes(x.id));
function enemyDamage(run,e,mult=1){const bonus=combatBonuses(run),raw=Math.max(1,Math.round((e.atk*1.7+F.rand(0,2))*mult)-Math.round((Number(run.playerDefense)||0)*.65)-bonus.damageReduction);return Math.max(1,raw)}
function pushEnemyAttackFx(run,e,type,damage,meta={}){const seq=(Number(run.enemyAttackFxSeq)||0)+1;run.enemyAttackFxSeq=seq;const dx=Math.sign(run.player.x-e.x),dy=Math.sign(run.player.y-e.y);run.enemyAttackFx=run.enemyAttackFx||[];run.enemyAttackFx.push({seq,enemyId:e.id||null,x:e.x,y:e.y,targetX:run.player.x,targetY:run.player.y,dx,dy,type:type||'melee',damage:Math.max(0,Number(damage)||0),moveName:meta.moveName||null,moveType:meta.moveType||null,statusName:meta.statusName||null,statusIcon:meta.statusIcon||null});return seq}
function facingFromDelta(dx,dy,def='down'){if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';if(dy<0)return 'up';if(dy>0)return 'down';return def}
function enemyMoveMeta(e){const sp=F.speciesById?.(e?.speciesId);return{moveName:String(e?.move||sp?.move||'わざ'),moveType:String(e?.moveType||sp?.moveType||sp?.type1||'ノーマル')}}
function enemyLineToPlayer(run,e,minRange=2,maxRange=4){const dx=run.player.x-e.x,dy=run.player.y-e.y,v=straightAttackVector(dx,dy);if(!v||v.dist<minRange||v.dist>maxRange)return null;let x=e.x,y=e.y;for(let i=1;i<=v.dist;i++){if(!dungeonCanStep(run.map,x,y,v.sx,v.sy))return null;x+=v.sx;y+=v.sy;if(i<v.dist&&run.enemies.some(o=>o!==e&&o.hp>0&&o.x===x&&o.y===y))return null}return v}
function enemySpecialChance(ai,e=null){if(window.FRENDA_TEST?.active&&e?.testStatusId)return .95;return({ranged:.78,support:.58,bruiser:.38,guardian:.30,skirmisher:.34,ambush:.42,wander:.18})[ai]??.22}
function enemySpecialPower(ai,ranged=false){if(ranged)return ai==='support'?.68:.80;return({bruiser:1.35,ambush:1.30,guardian:1.24,skirmisher:1.18,ranged:1.12,support:1.08,wander:1.10})[ai]??1.12}
function hitPlayerByEnemy(run,e,dmg,type='melee',meta=null){const m=Object.assign({},meta||{});run.playerHp=Math.max(0,run.playerHp-dmg);if(m?.moveName)run.log.push(`✨ ${e.name}の「${m.moveName}」！ 冒険者に${dmg}ダメージ。`);else run.log.push(`💥 ${e.name}の攻撃。冒険者に${dmg}ダメージ。`);if(run.playerHp>0&&String(type).includes('special')){const sid=statusByEnemyMove(e,m);if(sid){const inf=inflictStatus(run,sid,e);if(inf){m.statusName=inf.name;m.statusIcon=inf.icon}}}pushEnemyAttackFx(run,e,type,dmg,m);if(run.playerHp<=0){run.log.push("😵 冒険者が力尽きた！");return false}return true}
function enemyTurn(run){run.enemyAttackFx=[];for(const e of run.enemies.filter(x=>x.hp>0)){e.specialCooldown=Math.max(0,(Number(e.specialCooldown)||0)-1);const dx=run.player.x-e.x,dy=run.player.y-e.y,d=dungeonDistance(e,run.player),adjacent=d===1&&dungeonCanStep(run.map,e.x,e.y,dx,dy),specialReady=e.specialCooldown<=0,meta=enemyMoveMeta(e);if(adjacent){e.facing=facingFromDelta(dx,dy,e.facing);const useSpecial=specialReady&&Math.random()<enemySpecialChance(e.ai,e);if(useSpecial){const dmg=enemyDamage(run,e,enemySpecialPower(e.ai,false));e.specialCooldown=2+F.rand(0,1);if(!hitPlayerByEnemy(run,e,dmg,'special',meta))break}else{const dmg=enemyDamage(run,e);if(!hitPlayerByEnemy(run,e,dmg,'melee'))break}continue}if((e.ai==="ranged"||e.ai==="support")&&specialReady){const line=enemyLineToPlayer(run,e,2,4);if(line&&Math.random()<enemySpecialChance(e.ai,e)){e.facing=facingFromDelta(dx,dy,e.facing);const dmg=enemyDamage(run,e,enemySpecialPower(e.ai,true));e.specialCooldown=2+F.rand(0,1);if(!hitPlayerByEnemy(run,e,dmg,'special-ranged',meta))break;continue}}if(e.ai==="ambush"&&d>4)continue;if(e.ai==="wander"&&Math.random()<.28)continue;if(e.ai==="guardian"&&d>3)continue;const ox=e.x,oy=e.y,p=stepToward(run.map,e,run.player,run,e);e.x=p.x;e.y=p.y;if(e.x!==ox||e.y!==oy){e.facing=facingFromDelta(e.x-ox,e.y-oy,e.facing);e.step=(Number(e.step)||0)+1}}}
function openChest(run){const r=F.weighted(F.DUNGEON_CHEST_TABLE||[]);if(!r)return false;const n=F.rand(Number(r.min)||1,Number(r.max)||1);if(r.kind==="item"){if(!addBag(run,r.item,n))return false;const it=F.item(r.item);run.log.push(`🎁 宝箱！ ${it?.icon||"📦"} ${it?.name||r.item} ×${n}を手に入れた！`);return true}if(r.kind==="heal"){const before=run.playerHp;run.playerHp=Math.min(run.playerMaxHp,run.playerHp+n);const gain=run.playerHp-before;if(gain>0){run.log.push(`🎁 宝箱！ ❤️ HPが${gain}回復した。`);return true}if(addBag(run,"herb",1)){run.log.push("🎁 HPは満タン。かわりに 🌿 薬草 ×1を見つけた！");return true}return false}if(r.kind==="equipment"){const pool=(F.DUNGEON_EQUIPMENT_TABLE||[]).filter(x=>Number(run.floor)>=Number(x.minFloor||1)).map(x=>({weight:x.weight,value:x.equipment})),hit=F.weighted(pool),id=hit?.value||pool[0]?.value,d=F.equipment?.(id);if(!d)return false;run.foundEquipment[id]=(Number(run.foundEquipment[id])||0)+1;run.log.push(`🎁 装備品！ ${d.icon} ${d.name}を見つけた！ 帰還すると使える。`);return true}return false}
function onTile(run){const t=run.map[run.player.y][run.player.x];if(t==="gather"){let drop=floorItemAt(run,run.player.x,run.player.y);if(!drop){const g=F.weighted(F.GATHER_TABLE||[]);if(g)drop={x:run.player.x,y:run.player.y,itemId:g.item,qty:F.rand(Number(g.min)||1,Number(g.max)||1)}}if(drop&&addBag(run,drop.itemId,Number(drop.qty)||1)){const it=F.item(drop.itemId);run.log.push(`${it?.icon||'📦'} ${it?.name||drop.itemId} ×${Number(drop.qty)||1}を拾った！`);run.floorItems=(run.floorItems||[]).filter(it=>!(it.x===run.player.x&&it.y===run.player.y));run.map[run.player.y][run.player.x]="floor"}}else if(t==="chest"&&openChest(run)){run.map[run.player.y][run.player.x]="floor"}return t}
function advanceRunTurn(run,triggerTile=true){run.turn++;revealDungeon(run);ensureStatuses(run);const fullnessTickEvery=Math.max(1,Number(run.fullnessTickEvery)||10),fullnessTick=run.turn%fullnessTickEvery===0,saveEvery=combatBonuses(run).foodSaveEvery,saveFullness=fullnessTick&&saveEvery>0&&run.turn%saveEvery===0;if(fullnessTick&&!saveFullness)run.fullness=Math.max(0,run.fullness-1);if(run.fullness<=0){run.playerHp=Math.max(0,run.playerHp-1);run.log.push("🍽️ おなかが空いてHPが減った！")}if(statusActive(run,'poison')&&run.turn%4===0){run.playerHp=Math.max(0,run.playerHp-2);run.log.push('☠️ どくでHPが2減った！')}const healEvery=Math.max(1,Number(run.naturalHealEvery)||5);if(!statusActive(run,'poison')&&run.fullness>0&&run.playerHp>0&&run.playerHp<run.playerMaxHp&&run.turn%healEvery===0)run.playerHp=Math.min(run.playerMaxHp,run.playerHp+1);if(triggerTile)triggerTrap(run);if(run.playerHp<=0){F.finishRun(false,"defeat");return F.run}decayStatuses(run);enemyTurn(run);if(triggerTile)onTile(run);if(run.playerHp<=0){F.finishRun(false,"defeat");return F.run}return run}
F.move=(dx,dy)=>{const run=F.run;if(!run?.active)return run;dx=Math.sign(Number(dx)||0);dy=Math.sign(Number(dy)||0);if(!dx&&!dy)return run;const pre=prePlayerAction(run,'move',dx,dy);if(pre.blocked)return advanceRunTurn(run,false);dx=pre.dx;dy=pre.dy;run.playerFacing=facingFromDelta(dx,dy,run.playerFacing||'down');const nx=run.player.x+dx,ny=run.player.y+dy;if(!dungeonCanStep(run.map,run.player.x,run.player.y,dx,dy)){run.log.push(dx&&dy?"壁の角がふさがっていて斜めには進めない。":"そこには進めない。");return pre.reason==='confusion'?advanceRunTurn(run,false):run}const e=entityAt(run,nx,ny);if(e){const can=weaponCanAttack(run,nx,ny);if(!can.ok){run.log.push(can.reason);return pre.reason==='confusion'?advanceRunTurn(run,false):run}e.facing=facingFromDelta(run.player.x-e.x,run.player.y-e.y,e.facing||'down');const fx=setAttackFx(run,can.profile,can.vector),result=playerAttack(run,e);fx.hit=result.hit;fx.critical=result.critical}else{run.player.x=nx;run.player.y=ny;run.playerStep=(Number(run.playerStep)||0)+1}return advanceRunTurn(run,true)};
F.attackAt=(tx,ty)=>{const run=F.run;if(!run?.active)return{attempted:false,reason:"探索中ではない。"};const pre=prePlayerAction(run,'attack',0,0);if(pre.blocked){advanceRunTurn(run,false);return{attempted:true,blocked:true,reason:pre.reason}}tx=Math.floor(Number(tx));ty=Math.floor(Number(ty));if(statusActive(run,'confusion')){const d=dungeonDirs8[F.rand(0,dungeonDirs8.length-1)],rx=run.player.x+d[0],ry=run.player.y+d[1];run.playerFacing=facingFromDelta(d[0],d[1],run.playerFacing||'down');const e=entityAt(run,rx,ry);if(!e){run.log.push('💫 混乱して違う方向へ武器を振った！');advanceRunTurn(run,false);return{attempted:true,hit:false,confused:true}}tx=rx;ty=ry;run.log.push('💫 混乱して狙いがずれた！')}const can=weaponCanAttack(run,tx,ty);if(!can.ok){run.log.push(can.reason);return{attempted:false,reason:can.reason}}const dx=tx-run.player.x,dy=ty-run.player.y;run.playerFacing=facingFromDelta(dx,dy,run.playerFacing||'down');can.enemy.facing=facingFromDelta(-dx,-dy,can.enemy.facing||'down');const fx=setAttackFx(run,can.profile,can.vector),result=playerAttack(run,can.enemy);fx.hit=result.hit;fx.critical=result.critical;advanceRunTurn(run,false);return{attempted:true,...result}};
F.useDungeonItem=id=>{const run=F.run;if(!run?.active||Number(run.bag?.[id])<=0)return false;const pre=prePlayerAction(run,'item',0,0);if(pre.blocked){advanceRunTurn(run,false);return true}const maxFull=Math.max(1,Number(run.fullnessMax)||100);if(id==="bread"||id==="big_bread"){if(run.fullness>=maxFull){run.log.push("🍞 おなかはいっぱいだ。");return false}const item=F.item?.(id),before=run.fullness,amount=Math.max(0,Number(item?.fullness)||0);run.bag[id]--;if(run.bag[id]<=0)delete run.bag[id];run.fullness=Math.min(maxFull,run.fullness+amount);run.log.push(`${item?.icon||"🍞"} ${item?.name||"パン"}を食べた。満腹度が${run.fullness-before}回復した。`);advanceRunTurn(run,false);return true}if(id==="herb"){if(run.playerHp>=run.playerMaxHp&&run.fullness>=maxFull){run.log.push("❤️ HPも満腹度も満タンだ。");return false}run.bag[id]--;if(run.bag[id]<=0)delete run.bag[id];const beforeHp=run.playerHp,beforeFull=run.fullness;run.playerHp=Math.min(run.playerMaxHp,run.playerHp+14);run.fullness=Math.min(maxFull,run.fullness+5);const hpGain=run.playerHp-beforeHp,fullGain=run.fullness-beforeFull;run.log.push(`🌿 薬草を使った。${hpGain?`HPが${hpGain}回復。`:""}${fullGain?` 満腹度が${fullGain}回復。`:""}`.trim());advanceRunTurn(run,false);return true}return false};
F.waitTurn=()=>{const run=F.run;if(!run?.active)return run;if(statusActive(run,'sleep'))run.log.push("💤 眠ったまま時間が過ぎた。");else run.log.push("…その場で様子を見た。");return advanceRunTurn(run,false)};
F.dungeonFloorStatus=run=>{run=run||F.run;if(!run?.map)return{gather:0,chests:0,enemies:0,turn:0};let gather=0,chests=0;for(const row of run.map)for(const t of row){if(t==="gather")gather++;else if(t==="chest")chests++}return{gather,chests,enemies:(run.enemies||[]).filter(e=>e.hp>0).length,turn:Number(run.turn)||0}};
F.isOnStairs=()=>F.run?.map?.[F.run.player.y]?.[F.run.player.x]==="stairs";
F.nextFloor=()=>{const run=F.run;if(!F.isOnStairs())return false;if(run.floor>=run.maxFloor){F.finishRun(true,"clear");return true}run.floor++;const s=F.readSave();generateFloor(run,s);F.writeSave(s);return true};
F.finishRun=(success=true,reason="return")=>{const run=F.run;if(!run)return null;const s=F.readSave(),lost={},d=F.dungeonDef?.(run.dungeonId)||{};let delivered=clone(run.bag);if(!success&&reason==="defeat"){delivered={};for(const [id,n] of Object.entries(run.bag)){const keep=Math.ceil(Number(n)*.5),lose=Number(n)-keep;if(keep>0)delivered[id]=keep;if(lose>0)lost[id]=lose}}for(const [id,n] of Object.entries(delivered))addWarehouse(s,id,n);const deliveredEquipment={};if(success){for(const [id,n] of Object.entries(run.foundEquipment||{})){if(addOwnedEquipment(s,id,n))deliveredEquipment[id]=n}}if(success&&reason==="clear"&&d.clearReward?.itemId)addWarehouse(s,d.clearReward.itemId,Number(d.clearReward.qty)||1);s.story.firstReturn=true;s.story.step=Math.max(s.story.step,2);const time=F.advanceTimeState(s,Number(F.TIME_ACTION_COSTS?.adventureReturn)||2,"adventureReturn");s.development.points+=success?(Number(F.ECONOMY_RULES?.developmentPerAdventure)||2):1;s.development.stage=F.developmentStage(s.development.points);const gearCount=Object.keys(deliveredEquipment).length,Ftxt=success?(reason==="clear"?`冒険者が${d.name||"ダンジョン"}を踏破。${Object.keys(delivered).length}種類の素材${gearCount?`と装備${gearCount}種類`:""}を持ち帰った。`:`冒険者が${d.name||"ダンジョン"}から無事帰還。${Object.keys(delivered).length}種類の素材${gearCount?`と装備${gearCount}種類`:""}を持ち帰った。`):`冒険者は探索に失敗したが、持ち物の一部を持ち帰った。`;F.addHistory(s,"adventure",Ftxt);if(time.daysAdvanced)F.addHistory(s,"time",`${time.daysAdvanced}日進み、${time.phase.icon}${time.phase.label}になった。`);F.writeSave(s);run.active=false;run.result={success,reason,delivered,lost,deliveredEquipment,dungeonId:run.dungeonId,time};F.run=run;return run.result};
F.escape=()=>{const run=F.run;if(!run?.active||run.escape<=0)return false;run.escape--;F.finishRun(true,"escape");return true};

F.stockShelf=(slot,itemId,price)=>F.mutateSave(s=>{slot=Number(slot);if(slot<0||slot>2)throw new Error("棚番号が不正です。");if(s.shelves[slot])throw new Error("この棚には商品があります。");const it=F.item(itemId);if(!it)throw new Error("商品がありません。");if(!takeWarehouse(s,itemId,1))throw new Error("倉庫にありません。");const p=Math.max(Number(F.SHOP_RULES?.minPrice)||10,Math.min(it.base*(Number(F.SHOP_RULES?.maxPriceMultiplier)||3),Number(price)||it.base));s.shelves[slot]={itemId,qty:1,price:p};s.story.firstStock=true;F.addHistory(s,"stock",`${it.name}を${p}Gで棚に並べた。`)});
F.unstockShelf=slot=>F.mutateSave(s=>{slot=Number(slot);const sh=s.shelves[slot];if(!sh)return;addWarehouse(s,sh.itemId,sh.qty||1);s.shelves[slot]=null});
F.changePrice=(slot,price)=>F.mutateSave(s=>{slot=Number(slot);const sh=s.shelves[slot];if(!sh)return;const it=F.item(sh.itemId);sh.price=Math.max(Number(F.SHOP_RULES?.minPrice)||10,Math.min((it?.base||100)*(Number(F.SHOP_RULES?.maxPriceMultiplier)||3),Number(price)||it?.base||100))});
F.simulateCustomer=()=>{const s=F.readSave(),available=s.shelves.map((x,i)=>x&&x.qty>0?{...x,slot:i,item:F.item(x.itemId)}:null).filter(Boolean),c=F.CUSTOMERS[F.rand(0,F.CUSTOMERS.length-1)],phase=F.timeInfo(s),budget=F.rand(c.budget[0],c.budget[1])+Math.floor(s.development.stage*80)+(phase.id==="evening"?80:0);let choice=null,score=-999;for(const sh of available){const ratio=sh.price/Math.max(1,sh.item.base),like=c.likes.includes(sh.item.kind)?30:0,afford=sh.price<=budget?40:-120,priceScore=(1.3-ratio)*45+afford+like+Math.random()*20;if(priceScore>score){score=priceScore;choice=sh}}const bought=!!choice&&score>12;return {customer:c,budget,choice,bought,phase,reason:!choice?"商品がない":choice.price>budget?"予算オーバー":score<=12?"今回は見送り":c.line}};
F.applyCustomerVisit=result=>F.mutateSave(s=>{s.sales.customers++;if(!result?.bought||!result.choice){F.addHistory(s,"customer",`${result?.customer?.name||"お客"}は買わずに店を出た。`);return}const sh=s.shelves[result.choice.slot];if(!sh)return;const it=F.item(sh.itemId);s.coins+=sh.price;s.sales.count++;s.sales.revenue+=sh.price;sh.qty--;if(sh.qty<=0)s.shelves[result.choice.slot]=null;s.reputation.fair+=sh.price<=it.base*1.15?2:0;s.reputation.rare+=it.kind==="珍品"?2:0;s.reputation.adventure+=1;s.development.points+=Number(F.ECONOMY_RULES?.developmentPerSale)||2;s.development.stage=F.developmentStage(s.development.points);s.story.firstSale=true;s.story.firstLoop=!!s.story.firstReturn;s.story.step=Math.max(s.story.step,3);if(s.development.points>=10&&!s.story.rumor){s.story.rumor=true;s.story.step=4;F.addHistory(s,"story","旅の冒険者から、森の奥に『秘宝の手掛かり』があるという噂を聞いた。") }F.addHistory(s,"sale",`${it.name}が${sh.price}Gで売れた。`)});
F.applySale=result=>F.applyCustomerVisit(result);
F.finishShopSession=()=>F.mutateSave(s=>{const time=F.advanceTimeState(s,Number(F.TIME_ACTION_COSTS?.shopOpen)||1,"shopOpen");F.addHistory(s,"shop",`営業を終えた。${time.phase.icon}${time.phase.label}になった。`);return time});
})();
// Updated: 2026-10-21 15:05 JST
/* Updated: 2026-10-21 17:25 JST / Ver0.83 */
