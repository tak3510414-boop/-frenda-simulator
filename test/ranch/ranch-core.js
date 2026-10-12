(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{};
const now=()=>new Date().toISOString();
function freshSave(){return {schemaVersion:R.SCHEMA_VERSION,saveVersion:2,createdAt:now(),updatedAt:null,ranchName:"フレンダ牧場",creatures:[],previousOwnedIds:[],evolutionHistory:[],syncLog:[]}}
function newCreature(id){return {ranchId:R.uid(),pickId:String(id),status:"resident",joinedAt:now(),departedAt:null,nickname:"",personality:{seed:Math.floor(Math.random()*1000000)},life:{days:0},relationships:{},memories:[],pickHistory:[{pickId:String(id),from:null,at:now(),reason:"joined"}]}}
function directEvolution(index,fromId,toId){if(!index)return false;const a=index.entryByName?.(R.pickName(fromId)),b=index.entryByName?.(R.pickName(toId));if(!a||!b)return false;return Number(b.parent)===Number(a.no)}
R.reconcile=async ids=>{
 ids=[...new Set((ids||[]).map(String).filter(Boolean))];
 let s=R.readSave()||freshSave();
 if(!Array.isArray(s.creatures))s.creatures=[];if(!Array.isArray(s.previousOwnedIds))s.previousOwnedIds=[];if(!Array.isArray(s.evolutionHistory))s.evolutionHistory=[];if(!Array.isArray(s.syncLog))s.syncLog=[];
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
 s.previousOwnedIds=ids.slice();s.schemaVersion=R.SCHEMA_VERSION;s.saveVersion=2;s.updatedAt=now();
 if(removed.length||added.length)s.syncLog.push({at:s.updatedAt,removed,added,evolutions:pairs.filter(x=>usedFrom.has(x.from)&&usedTo.has(x.to))});
 if(s.syncLog.length>100)s.syncLog=s.syncLog.slice(-100);
 return R.writeSave(s)
};
})();
// Updated: 2026-10-12 20:36 JST
