/* Frenda Frontier Ver0.45 / world structure Ver6 + common area scene core / Updated: 2026-10-19 */
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
F.areaEffectiveState=(s,id)=>{const v=s?.settings?.townAreaTest?.states?.[id];return (F.AREA_STATE_ORDER||[]).includes(v)?v:F.areaState(s,id)};
F.areaStats=s=>{const defs=F.AREA_DEFS||[],states=defs.map(d=>F.areaEffectiveState(s,d.id));return {total:defs.length,discovered:states.filter(x=>F.areaStateIndex(x)>=1).length,usable:states.filter(x=>F.areaStateIndex(x)>=3).length,developed:states.filter(x=>F.areaStateIndex(x)>=4).length}};
F.areaOptions=s=>{const pts=Number(s?.development?.points)||0,out=[];for(const def of (F.AREA_DEFS||[])){const cur=F.areaState(s,def.id),idx=F.areaStateIndex(cur);if(idx<0||idx>=F.AREA_STATE_ORDER.length-1)continue;const next=F.AREA_STATE_ORDER[idx+1],tr=def.transitions?.[next];if(!tr)continue;out.push({areaId:def.id,areaName:def.name,icon:def.icon||"🗺️",from:cur,to:next,need:Number(tr.need)||0,label:tr.label||`${def.name}を${F.AREA_STATE_INFO?.[next]?.label||next}にする`,available:pts>=Number(tr.need||0),description:def.description||""})}return out.sort((a,b)=>a.need-b.need||a.areaName.localeCompare(b.areaName,"ja"))};
F.applyAreaDevelopment=areaId=>F.mutateSave(s=>{const opt=F.areaOptions(s).find(x=>x.areaId===areaId);if(!opt)throw new Error("この町域は現在変更できません。");if(!opt.available)throw new Error(`発展${opt.need}ptで選べます。`);s.development.town.areas=s.development.town.areas||{};s.development.town.areas[areaId]=opt.to;F.addHistory(s,"area",`${opt.areaName}：${F.AREA_STATE_INFO?.[opt.to]?.label||opt.to}`);});
F.setTownAreaTestState=(id,state)=>F.mutateSave(s=>{if(!F.areaDef?.(id))throw new Error("不明な町域です。");s.settings=s.settings||{};s.settings.townAreaTest=s.settings.townAreaTest||{states:{}};s.settings.townAreaTest.states=s.settings.townAreaTest.states||{};if(state==="auto")delete s.settings.townAreaTest.states[id];else if((F.AREA_STATE_ORDER||[]).includes(state))s.settings.townAreaTest.states[id]=state;else throw new Error("不正な町域状態です。");});
F.resetTownAreaTest=()=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townAreaTest={states:{}}});
F.areaConnections=id=>(F.AREA_CONNECTION_DEFS||[]).filter(c=>c.a===id||c.b===id);
F.areaNeighbors=id=>F.areaConnections(id).map(c=>{const other=c.a===id?c.b:c.a;return {areaId:other,area:F.areaDef?.(other),connection:c,fromPort:c.a===id?c.aPort:c.bPort,toPort:c.a===id?c.bPort:c.aPort}});
// Ver0.38: 接続ごとの移動方式を共通化。隣接は歩行、自動境界切替。遠距離は将来の移動拠点から選択式。
F.connectionTravelInfo=c=>{
 const kind=F.connectionKind?.(c?.kind)||{},raw=c?.travel||{},modeId=raw.mode||kind.defaultMode||"walk",mode=F.travelMode?.(modeId)||F.travelMode?.("walk")||{};
 return {mode:modeId,modeLabel:mode.label||modeId,modeIcon:mode.icon||"🚶",kind:c?.kind||"path",kindLabel:kind.label||c?.kind||"道",kindIcon:kind.icon||"▫️",autoTransition:raw.autoTransition!=null?!!raw.autoTransition:!!mode.autoTransition,fastTravel:raw.fastTravel!=null?!!raw.fastTravel:modeId==="fast",transition:kind.transition|| (modeId==="fast"?"select":"edge"),transitionMs:Number(kind.transitionMs)||260,seamlessLike:mode.seamlessLike!==false};
};
F.connectionBetween=(a,b)=>(F.AREA_CONNECTION_DEFS||[]).find(c=>(c.a===a&&c.b===b)||(c.a===b&&c.b===a))||null;
F.connectionOpen=(s,c)=>{if(!c)return false;const sa=F.areaEffectiveState(s,c.a),sb=F.areaEffectiveState(s,c.b);return F.areaStateIndex(sa)>=F.areaStateIndex("usable")&&F.areaStateIndex(sb)>=F.areaStateIndex("usable")};
F.areaTravelOptions=(s,fromAreaId)=>F.areaNeighbors(fromAreaId).map(n=>{const c=n.connection,ti=F.connectionTravelInfo(c),open=F.connectionOpen(s,c),to=F.areaDef?.(n.areaId);return {...n,open,travel:ti,toState:F.areaEffectiveState(s,n.areaId),sceneReady:["prototype","ready"].includes(to?.world?.sceneStatus||"")}});
F.areaExitConnection=(s,areaId,exitId)=>{const area=F.areaDef?.(areaId),nav=F.areaNavDefinition?.(areaId)||area?.nav||{},ex=(nav.exits||[]).find(x=>x.id===exitId)||(area?.nav?.exits||[]).find(x=>x.id===exitId);if(!ex)return null;const c=F.connectionBetween(areaId,ex.to);if(!c)return null;const ti=F.connectionTravelInfo(c);return {exit:ex,connection:c,travel:ti,target:F.areaDef?.(ex.to),open:F.connectionOpen(s,c)};};
F.townExitAt=(s,x,y,areaId=null)=>{areaId=areaId||s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core";const nav=F.areaNavDefinition?.(areaId)||F.areaDef?.(areaId)?.nav||{},cell=Math.max(8,Number(nav.scene?.cell)||12),px=Number(x),py=Number(y);for(const ex of (nav.exits||[])){const pad=cell*1.25;if(px>=ex.x-pad&&py>=ex.y-pad&&px<ex.x+ex.w+pad&&py<ex.y+ex.h+pad)return F.areaExitConnection(s,areaId,ex.id)}return null};
// Ver0.45: 「出口そのもの」だけでなく、出口へ続く画面端の道をタップした時も移動意図として扱う。
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
 const ports=Object.values(sp.ports||{}),entries={},exits=[];for(const port of ports){if(!port.targetAreaId||port.pixelShape?.shape!=="rect")continue;const v=port.pixelShape.v;entries[port.targetAreaId]={x:port.arrival.x,y:port.arrival.y};exits.push({id:port.id,to:port.targetAreaId,x:v[0],y:v[1],w:v[2],h:v[3],entry:{x:port.arrival.x,y:port.arrival.y}})}
 const connected=ports.filter(p=>p.connected),spawn=(connected[0]?.arrival)||nearestWalkAnchor({x:sp.playfield.x+sp.playfield.w/2,y:sp.playfield.y+sp.playfield.h/2},walkShapes);
 const interactions=[...facilitySlots.map(x=>x.interaction),...landmarkSlots.map(x=>({id:`landmark_${x.id}`,type:"landmark",label:"ランドマーク候補",x:x.center.x,y:x.center.y,r:52}))];
 const npcWaypoints=npcActivity.flatMap(n=>n.waypoints.map((p,i)=>({id:`${n.id}_${i}`,x:p.x,y:p.y})));
 const nav={scene:sp.scene,worldRect:sp.playfield,spawn,entries,exits,base:{defaultWalkable:false,blocks:[],walk:walkShapes,interactions,npcWaypoints},source:"scene-spec-compiler",spec:sp};
 return {schemaVersion:2,compiler:"scene-spec-v2",areaId:area.id,areaName:area.name,theme:area.world?.theme||"generic",templateId:sp.templateId,scene:sp.scene,playfield:sp.playfield,walkZones,facilitySlots,constructionZones,landmarkSlots,serviceZones,npcActivity,ports,spawn,nav};
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
// 将来の主人公・相棒・NPC移動は、このモデルを共通利用する。
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
F.areaArrivalPoint=(targetAreaId,fromAreaId)=>{const a=F.areaDef?.(targetAreaId),nav=F.areaNavDefinition?.(targetAreaId)||a?.nav||{};return nav.entries?.[fromAreaId]||nav.spawn||{x:350,y:475}};
F.transitionTownArea=(targetAreaId,fromAreaId=null)=>F.mutateSave(s=>{const from=fromAreaId||s?.townMovement?.areaId||s?.townWorld?.currentAreaId||"core",target=F.areaDef?.(targetAreaId),c=F.connectionBetween?.(from,targetAreaId);if(!target||!c)throw new Error("接続先がありません。");if(!F.connectionOpen(s,c))throw new Error("この道はまだ開通していません。");if(!["prototype","ready"].includes(target.world?.sceneStatus||""))throw new Error("このエリアの実マップはまだ準備中です。");const p=F.areaArrivalPoint(targetAreaId,from),partner={x:p.x+34,y:p.y+22};s.townWorld=s.townWorld||{};s.townWorld.currentAreaId=targetAreaId;s.townWorld.visitedAreas=Array.isArray(s.townWorld.visitedAreas)?s.townWorld.visitedAreas:[];if(!s.townWorld.visitedAreas.includes(targetAreaId))s.townWorld.visitedAreas.push(targetAreaId);s.townMovement={areaId:targetAreaId,player:{x:p.x,y:p.y},partner};F.addHistory?.(s,"move",`${F.areaDef?.(from)?.name||from}から${target.name}へ移動した。`);});
F.resetTownMovement=()=>F.mutateSave(s=>{const spawn=F.areaNavDefinition?.("core")?.spawn||F.areaDef?.("core")?.nav?.spawn||{x:350,y:475};s.townWorld=s.townWorld||{};s.townWorld.currentAreaId="core";s.townMovement={areaId:"core",player:{x:spawn.x,y:spawn.y},partner:{x:spawn.x+42,y:spawn.y}};});
F.townNearestInteraction=(s,x,y,maxR=70)=>{const m=F.townNavModel(s);return m.interactions.map(it=>({...it,d:Math.hypot(Number(it.x)-x,Number(it.y)-y)})).filter(it=>it.d<=Math.max(maxR,Number(it.r)||0)).sort((a,b)=>a.d-b.d)[0]||null};
F.townNavStats=(s,actor="player")=>{const m=F.townNavModel(s,actor),all=m.cols*m.rows,walk=m.grid.reduce((n,row)=>n+row.filter(Boolean).length,0);return {cells:all,walkable:walk,blocked:all-walk,walkableRate:all?Math.round(walk/all*100):0,interactions:m.interactions.length,entrances:m.entrances.length,openExits:m.exits.filter(e=>e.open).length,totalExits:m.exits.length}};
F.setTownNavTestOverlay=on=>F.mutateSave(s=>{s.settings=s.settings||{};s.settings.townNavTest=s.settings.townNavTest||{};s.settings.townNavTest.overlay=!!on;});
F.townNavTestOverlay=s=>!!s?.settings?.townNavTest?.overlay;

F.storyStep=s=>s.story?.rumor?4:s.story?.firstSale?3:s.story?.firstReturn?2:s.partnerId?1:0;
F.goal=s=>{
 if(!s.partnerId)return {text:"まずは、一緒に冒険する相棒ポケモンを選ぼう！",hints:["所持ピックのうち★3以下から選べるよ。","『拠点』の相棒一覧から1体をタップしよう。"]};
 if(!s.story.firstReturn)return {text:"相棒と『はじまりの森』へ行って、素材を持ち帰ろう！",hints:["冒険タブから出発できるよ。","緑色の採取マスに乗ると素材を拾えるよ。","階段に着いたら帰還を選べば安全に持ち帰れるよ。"]};
 if(!s.story.firstStock)return {text:"持ち帰った品を、お店の商品棚に並べてみよう！",hints:["『お店』タブで空いている棚に商品を置けるよ。","倉庫にある品を1個ずつ棚へ移そう。"]};
 if(!s.story.firstSale)return {text:"お店を開いて、最初のお客さんに商品を売ろう！",hints:["棚に商品がある状態で『お店を開く』を押そう。","相場に近い値段なら買ってもらいやすいよ。"]};
 if(!s.story.rumor)return {text:"商売と冒険を続けて、開拓地の評判を広げよう！",hints:["冒険で仕入れ、お店で売る流れを繰り返そう。","町の発展ポイントが10になると新しい噂が届くよ。"]};
 return {text:"『幻の大秘宝』につながる森の奥の噂を追おう！",hints:["Ver0.33ではここまでがストーリー試作範囲です。","次版では新しい階層・クラフト・住民を追加予定。"]};
};
F.selectPartner=id=>F.mutateSave(s=>{const r=F.eligiblePartners().find(x=>String(x.master_id)===String(id));if(!r)throw new Error("このポケモンは現在のFrontierでは相棒にできません。");s.partnerId=r.master_id;s.story.step=Math.max(s.story.step,1);F.addHistory(s,"partner",`${r.name_ja}を相棒に選んだ。`)});

function emptyRun(s){const p=F.pickRecord(s.partnerId);return {active:true,floor:1,maxFloor:3,turn:0,food:32,playerHp:30,playerMaxHp:30,partnerHp:24+Math.max(0,Number(p?.grade)||1)*3,partnerMaxHp:24+Math.max(0,Number(p?.grade)||1)*3,partnerLv:1,partnerExp:0,escape:1,bag:{},bagLimit:F.BAG_LIMIT,log:[],map:null,player:{x:1,y:1},partner:{x:1,y:2},enemies:[]}}
function tileOpen(map,x,y){return x>=0&&y>=0&&x<F.W&&y<F.H&&map[y][x]!=="wall"}
function randomOpen(map,blocked=new Set(),minDist=0){for(let n=0;n<600;n++){const x=F.rand(1,F.W-2),y=F.rand(1,F.H-2);if(!tileOpen(map,x,y)||blocked.has(key(x,y)))continue;if(Math.abs(x-1)+Math.abs(y-1)<minDist)continue;return{x,y}}return{x:F.W-2,y:F.H-2}}
function enemyPool(floor){const rec=(window.FRENDA_MASTER?.records||[]).filter(r=>r&&Number(r.grade||0)>=1&&Number(r.grade||0)<=Math.min(4,2+floor)&&r.hp&&r.atk&&r.def);return rec.length?rec:window.FRENDA_MASTER?.records?.slice(0,20)||[]}
function generateFloor(run){const map=Array.from({length:F.H},(_,y)=>Array.from({length:F.W},(_,x)=>(x===0||y===0||x===F.W-1||y===F.H-1)?"wall":"floor"));for(let i=0;i<11;i++){const x=F.rand(2,F.W-3),y=F.rand(1,F.H-2);if((x<=2&&y<=2)||(x>=F.W-3&&y>=F.H-3))continue;map[y][x]="wall"}map[1][1]="floor";map[2][1]="floor";const blocked=new Set([key(1,1),key(1,2)]);const stairs=randomOpen(map,blocked,10);map[stairs.y][stairs.x]="stairs";blocked.add(key(stairs.x,stairs.y));for(let i=0;i<5;i++){const p=randomOpen(map,blocked,3);map[p.y][p.x]="gather";blocked.add(key(p.x,p.y))}run.map=map;run.player={x:1,y:1};run.partner={x:1,y:2};run.enemies=[];const pool=enemyPool(run.floor);for(let i=0;i<Math.min(4,1+run.floor);i++){const p=randomOpen(map,blocked,5),r=pool[F.rand(0,pool.length-1)];blocked.add(key(p.x,p.y));run.enemies.push({id:`e${run.floor}_${i}_${Date.now()%9999}`,recordId:r?.master_id,name:r?.name_ja||"野生ポケモン",x:p.x,y:p.y,hp:8+run.floor*4+Math.max(0,Number(r?.grade)||1)*2,maxHp:8+run.floor*4+Math.max(0,Number(r?.grade)||1)*2,atk:2+run.floor+Math.ceil((Number(r?.grade)||1)/2)})}run.log.push(`地下${run.floor}階へ入った。`);return run}
F.startRun=()=>{const s=F.readSave();if(!s.partnerId)throw new Error("先に相棒を選んでください。");const run=generateFloor(emptyRun(s));s.story.firstAdventure=true;F.writeSave(s);F.run=run;return run};
function bagSlots(bag){return Object.values(bag||{}).filter(n=>Number(n)>0).length}
F.bagSlots=bagSlots;
function addBag(run,id,n){if(!F.item(id))return false;const exists=Number(run.bag[id])>0;if(!exists&&bagSlots(run.bag)>=run.bagLimit){run.log.push("🎒 バッグがいっぱいで拾えなかった！");return false}run.bag[id]=(Number(run.bag[id])||0)+n;return true}
function entityAt(run,x,y){return run.enemies.find(e=>e.hp>0&&e.x===x&&e.y===y)||null}
function occupiedByPartner(run,x,y){return run.partnerHp>0&&run.partner.x===x&&run.partner.y===y}
function occupiedByPlayer(run,x,y){return run.player.x===x&&run.player.y===y}
function stepToward(map,from,to,run,enemy){const choices=dirs.map(([dx,dy])=>({x:from.x+dx,y:from.y+dy,d:Math.abs(from.x+dx-to.x)+Math.abs(from.y+dy-to.y)})).filter(p=>tileOpen(map,p.x,p.y)&&!occupiedByPlayer(run,p.x,p.y)&&!occupiedByPartner(run,p.x,p.y)&&!run.enemies.some(e=>e!==enemy&&e.hp>0&&e.x===p.x&&e.y===p.y)).sort((a,b)=>a.d-b.d);return choices[0]||from}
function partnerAttack(run,e){const p=F.pickRecord(F.readSave().partnerId);const base=4+run.partnerLv*2+Math.floor((Number(p?.grade)||1)/2);const dmg=F.rand(Math.max(2,base-1),base+2);e.hp=Math.max(0,e.hp-dmg);run.log.push(`⚡ ${p?.name_ja||"相棒"}の ${p?.move||"こうげき"}！ ${e.name}に${dmg}ダメージ。`);if(e.hp<=0){run.log.push(`✅ ${e.name}を追い払った！`);run.partnerExp+=2+run.floor;if(run.partnerExp>=run.partnerLv*5){run.partnerExp=0;run.partnerLv++;run.partnerMaxHp+=3;run.partnerHp=Math.min(run.partnerMaxHp,run.partnerHp+5);run.log.push(`🌟 相棒のダンジョンLvが${run.partnerLv}になった！`)}}}
function enemyTurn(run){for(const e of run.enemies.filter(x=>x.hp>0)){const dp=Math.abs(e.x-run.partner.x)+Math.abs(e.y-run.partner.y),du=Math.abs(e.x-run.player.x)+Math.abs(e.y-run.player.y);if(run.partnerHp>0&&dp===1){const dmg=F.rand(Math.max(1,e.atk-1),e.atk+1);run.partnerHp=Math.max(0,run.partnerHp-dmg);run.log.push(`💥 ${e.name}の攻撃。相棒に${dmg}ダメージ。`);if(run.partnerHp<=0)run.log.push("😵 相棒がたおれた！ プレイヤーだけで逃げよう。");continue}if(du===1){const dmg=F.rand(Math.max(1,e.atk-1),e.atk+1);run.playerHp=Math.max(0,run.playerHp-dmg);run.log.push(`💥 ${e.name}の攻撃。あなたに${dmg}ダメージ。`);continue}const target=run.partnerHp>0?run.partner:run.player,p=stepToward(run.map,e,target,run,e);e.x=p.x;e.y=p.y}}
function partnerTurn(run){if(run.partnerHp<=0)return;const adjacent=run.enemies.filter(e=>e.hp>0&&Math.abs(e.x-run.partner.x)+Math.abs(e.y-run.partner.y)===1)[0];if(adjacent){partnerAttack(run,adjacent);return}const near=run.enemies.filter(e=>e.hp>0).map(e=>({e,d:Math.abs(e.x-run.partner.x)+Math.abs(e.y-run.partner.y)})).sort((a,b)=>a.d-b.d)[0];if(near&&near.d<=4){const p=stepToward(run.map,run.partner,near.e,run,null);if(!occupiedByPlayer(run,p.x,p.y)&&!entityAt(run,p.x,p.y)){run.partner.x=p.x;run.partner.y=p.y;return}}const d=Math.abs(run.partner.x-run.player.x)+Math.abs(run.partner.y-run.player.y);if(d>1){const p=stepToward(run.map,run.partner,run.player,run,null);if(!entityAt(run,p.x,p.y)){run.partner.x=p.x;run.partner.y=p.y}}}
function onTile(run){const t=run.map[run.player.y][run.player.x];if(t==="gather"){const g=F.weighted(F.GATHER_TABLE),n=F.rand(g.min,g.max);if(addBag(run,g.item,n)){const it=F.item(g.item);run.log.push(`${it.icon} ${it.name} ×${n}を見つけた！`);run.map[run.player.y][run.player.x]="floor"}}return t}
F.move=(dx,dy)=>{const run=F.run;if(!run?.active)return run;dx=Number(dx)||0;dy=Number(dy)||0;const nx=run.player.x+dx,ny=run.player.y+dy;if(!tileOpen(run.map,nx,ny)){run.log.push("そこには進めない。");return run}const e=entityAt(run,nx,ny);if(e){run.log.push(`⚠️ ${e.name}が道をふさいでいる。相棒に任せよう！`)}else if(!occupiedByPartner(run,nx,ny)){run.player.x=nx;run.player.y=ny}run.turn++;run.food=Math.max(0,run.food-1);if(run.food===0){run.playerHp=Math.max(0,run.playerHp-1);run.log.push("🍽️ 食料が尽きてHPが減った！")}partnerTurn(run);enemyTurn(run);onTile(run);if(run.playerHp<=0){F.finishRun(false,"defeat");return F.run}return run};
F.isOnStairs=()=>F.run?.map?.[F.run.player.y]?.[F.run.player.x]==="stairs";
F.nextFloor=()=>{const run=F.run;if(!F.isOnStairs())return false;if(run.floor>=run.maxFloor){F.finishRun(true,"clear");return true}run.floor++;run.food=Math.min(40,run.food+6);generateFloor(run);return true};
F.finishRun=(success=true,reason="return")=>{const run=F.run;if(!run)return null;const s=F.readSave(),lost={};let delivered=clone(run.bag);if(!success&&reason==="defeat"){delivered={};for(const [id,n] of Object.entries(run.bag)){const keep=Math.ceil(Number(n)*.5),lose=Number(n)-keep;if(keep>0)delivered[id]=keep;if(lose>0)lost[id]=lose}}for(const [id,n] of Object.entries(delivered))addWarehouse(s,id,n);if(success&&reason==="clear")addWarehouse(s,"oldtool",1);s.story.firstReturn=true;s.story.step=Math.max(s.story.step,2);s.day++;const completed=advanceConstructionState(s,1);s.development.points+=success?2:1;s.development.stage=F.developmentStage(s.development.points);if(completed.length)F.addHistory(s,"town",`工事完成：${completed.map(x=>x.name).join("・")}`);F.addHistory(s,"adventure",success?(reason==="clear"?`はじまりの森を踏破。${Object.keys(delivered).length}種類を持ち帰った。`:`森から無事帰還。${Object.keys(delivered).length}種類を持ち帰った。`):`冒険に失敗したが、持ち物の一部を持ち帰った。`);F.writeSave(s);run.active=false;run.result={success,reason,delivered,lost};F.run=run;return run.result};
F.escape=()=>{const run=F.run;if(!run?.active||run.escape<=0)return false;run.escape--;F.finishRun(true,"escape");return true};

F.stockShelf=(slot,itemId,price)=>F.mutateSave(s=>{slot=Number(slot);if(slot<0||slot>2)throw new Error("棚番号が不正です。");if(s.shelves[slot])throw new Error("この棚には商品があります。");const it=F.item(itemId);if(!it)throw new Error("商品がありません。");if(!takeWarehouse(s,itemId,1))throw new Error("倉庫にありません。");const p=Math.max(10,Number(price)||it.base);s.shelves[slot]={itemId,qty:1,price:p};s.story.firstStock=true;F.addHistory(s,"stock",`${it.name}を${p}Gで棚に並べた。`)});
F.unstockShelf=slot=>F.mutateSave(s=>{slot=Number(slot);const sh=s.shelves[slot];if(!sh)return;addWarehouse(s,sh.itemId,sh.qty||1);s.shelves[slot]=null});
F.changePrice=(slot,price)=>F.mutateSave(s=>{slot=Number(slot);const sh=s.shelves[slot];if(!sh)return;const it=F.item(sh.itemId);sh.price=Math.max(10,Math.min((it?.base||100)*3,Number(price)||it?.base||100))});
F.simulateCustomer=()=>{const s=F.readSave(),available=s.shelves.map((x,i)=>x&&x.qty>0?{...x,slot:i,item:F.item(x.itemId)}:null).filter(Boolean),c=F.CUSTOMERS[F.rand(0,F.CUSTOMERS.length-1)],budget=F.rand(c.budget[0],c.budget[1])+Math.floor(s.development.stage*80);let choice=null,score=-999;for(const sh of available){const ratio=sh.price/Math.max(1,sh.item.base),like=c.likes.includes(sh.item.kind)?30:0,afford=sh.price<=budget?40:-120,priceScore=(1.3-ratio)*45+afford+like+Math.random()*20;if(priceScore>score){score=priceScore;choice=sh}}const bought=choice&&score>12;return {customer:c,budget,choice,bought,reason:!choice?"商品がない":choice.price>budget?"予算オーバー":score<=12?"今回は見送り":c.line}};
F.applySale=result=>F.mutateSave(s=>{s.sales.customers++;if(!result?.bought||!result.choice)return;const sh=s.shelves[result.choice.slot];if(!sh)return;const it=F.item(sh.itemId);s.coins+=sh.price;s.sales.count++;s.sales.revenue+=sh.price;sh.qty--;if(sh.qty<=0)s.shelves[result.choice.slot]=null;s.reputation.fair+=sh.price<=it.base*1.15?2:0;s.reputation.rare+=it.kind==="珍品"?2:0;s.reputation.adventure+=1;s.development.points+=2;s.development.stage=F.developmentStage(s.development.points);s.story.firstSale=true;s.story.step=Math.max(s.story.step,3);if(s.development.points>=10&&!s.story.rumor){s.story.rumor=true;s.story.step=4;F.addHistory(s,"story","旅の冒険者から、森の奥に『秘宝の手掛かり』があるという噂を聞いた。") }F.addHistory(s,"sale",`${it.name}が${sh.price}Gで売れた。`)});
})();
