/* FRENDA_DATA_VERSION: 1.5 / Updated: 2026-10-11 */
(()=>{
"use strict";
const VERSION="1.5";
const KEYS=Object.freeze({
 simulator:Object.freeze({
  owned:"frenda:owned:v1",
  favorites:"frenda:favorites:v1",
  legacyTeam:"frenda:team:v1"
 }),
 dungeon:"frenda:dungeon:v1",
 expedition:"frenda:expedition:v1",
 eyeTimer:"frenda_eye_timer_v1",
 evolutionCache:"frenda:dungeon:evolutionMap:v2"
});
const STORAGE=window.FRENDA_TEST?.active?window.FRENDA_TEST.storage:window.FRENDA_USER?.active?window.FRENDA_USER.storage:window.localStorage;
const EVOLUTION_SPECIES_URL="https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species.csv";
const EVOLUTION_NAMES_URL="https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv";

const REGION_PREFIXES=Object.freeze(["アローラ","ガラル","ヒスイ","パルデア"]);
function createRecordIndex(records){
 const list=Array.isArray(records)?records:[],byId=new Map();
 for(const r of list){const id=r?.master_id;if(id!==null&&typeof id!=="undefined"&&!byId.has(id))byId.set(id,r)}
 return Object.freeze({records:list,byId,get:id=>byId.get(id)||null});
}
function recordImage(record){return record?.official_image||""}
function splitRegionalName(name,prefixes=REGION_PREFIXES){
 const text=String(name||"");
 for(const region of prefixes||REGION_PREFIXES)if(text.startsWith(region))return {base:text.slice(region.length),region};
 return {base:text,region:null};
}
function dungeonStatKey(dungeonId,difficulty){return `${dungeonId}:${difficulty}`}
function clone(v){
 if(v===undefined)return undefined;
 return JSON.parse(JSON.stringify(v));
}
function readJSON(key,fallback=null){
 try{
  const raw=STORAGE.getItem(key);
  if(raw===null)return clone(fallback);
  return JSON.parse(raw);
 }catch{return clone(fallback)}
}
function writeJSON(key,value){STORAGE.setItem(key,JSON.stringify(value));return value}
function remove(key){STORAGE.removeItem(key)}
function readList(key){const v=readJSON(key,[]);return Array.isArray(v)?v:[]}
function uniqueList(values){return [...new Set(Array.isArray(values)?values:[])]}
function writeList(key,values){const v=uniqueList(values);writeJSON(key,v);return v}
function pickId(recordOrId){return typeof recordOrId==="string"?recordOrId:String(recordOrId?.master_id||"")}
function pickKey(recordOrId){return `frenda:${pickId(recordOrId)}`}
function pickPhotoKey(recordOrId){return `${pickKey(recordOrId)}:photo`}
function readPickOverride(recordOrId){const v=readJSON(pickKey(recordOrId),{});return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}
function writePickOverride(recordOrId,value){return writeJSON(pickKey(recordOrId),value&&typeof value==="object"?value:{})}
function removePickOverride(recordOrId){remove(pickKey(recordOrId))}
function readPickPhoto(recordOrId){return STORAGE.getItem(pickPhotoKey(recordOrId))||""}
function writePickPhoto(recordOrId,data){STORAGE.setItem(pickPhotoKey(recordOrId),String(data||""));return data}
function removePickPhoto(recordOrId){remove(pickPhotoKey(recordOrId))}
function pickImage(record,placeholder){
 const photo=readPickPhoto(record);
 if(photo)return photo;
 if(record?.official_image)return record.official_image;
 return typeof placeholder==="function"?placeholder(record?.name_ja||""):"";
}
function readDungeon(){const v=readJSON(KEYS.dungeon,null);return v&&typeof v==="object"&&!Array.isArray(v)?v:null}
function writeDungeon(state){return writeJSON(KEYS.dungeon,state)}
function resolveExpedition(standalone,embedded){
 const a=standalone&&typeof standalone==="object"?standalone:null;
 const b=embedded&&typeof embedded==="object"?embedded:null;
 if(b&&(!a||Number(b.updatedAt||0)>Number(a.updatedAt||0)))return clone(b);
 return clone(a);
}
function expeditionSnapshot(dungeonState){return resolveExpedition(readJSON(KEYS.expedition,null),dungeonState?.expeditionShared)}
function readExpedition(defaultValue){
 const d=readDungeon();
 const selected=resolveExpedition(readJSON(KEYS.expedition,null),d?.expeditionShared);
 const base=typeof defaultValue==="function"?defaultValue():clone(defaultValue||{});
 return Object.assign(base&&typeof base==="object"?base:{},selected||{});
}
function writeExpedition(expedition,{appVersion,touch=true,mirror=true}={}){
 if(!expedition||typeof expedition!=="object")throw new Error("expedition must be an object");
 if(touch)expedition.updatedAt=Date.now();
 if(appVersion!==undefined)expedition.appVersion=appVersion;
 writeJSON(KEYS.expedition,expedition);
 if(mirror){const d=readDungeon();if(d){d.expeditionShared=clone(expedition);writeDungeon(d)}}
 return expedition;
}
function mutateDungeon(mutator,{expedition}={}){
 const d=readDungeon();
 if(!d)return null;
 if(typeof mutator==="function")mutator(d);
 if(expedition&&typeof expedition==="object")d.expeditionShared=clone(expedition);
 writeDungeon(d);
 return d;
}
function compactEvolutionRows(rows){
 return (Array.isArray(rows)?rows:[]).map(x=>({no:Number(x?.no),name:String(x?.name||""),parent:Number(x?.parent)||null})).filter(x=>x.no&&x.name);
}
function buildEvolutionRowsFromCsv(speciesCsv,namesCsv){
 const names={};
 for(const line of String(namesCsv||"").split(/\r?\n/).slice(1)){
  const c=line.split(","),id=Number(c[0]),lang=Number(c[1]);
  if(id&&lang===1&&!names[id])names[id]=c[2];
 }
 const rows=[];
 for(const line of String(speciesCsv||"").split(/\r?\n/).slice(1)){
  const c=line.split(","),no=Number(c[0]),parent=Number(c[3])||null,name=names[no];
  if(no&&name)rows.push({no,name,parent});
 }
 return rows;
}
function buildEvolutionIndex(rows){
 rows=compactEvolutionRows(rows);
 const byName=new Map(),byNo=new Map(),parents=new Map();
 for(const e of rows){
  if(!byName.has(e.name))byName.set(e.name,[]);
  byName.get(e.name).push(e);
  byNo.set(e.no,e);
  if(e.parent){if(!parents.has(e.no))parents.set(e.no,new Set());parents.get(e.no).add(e.parent)}
 }
 function entryByName(name){return (byName.get(String(name||""))||[])[0]||null}
 function root(entry){if(!entry)return null;let n=entry.no,seen=new Set();while(!seen.has(n)){seen.add(n);const ps=[...(parents.get(n)||[])];if(!ps.length)break;n=ps[0]}return n}
 function depth(entry){if(!entry)return 0;let n=entry.no,d=0,seen=new Set();while(!seen.has(n)){seen.add(n);const ps=[...(parents.get(n)||[])];if(!ps.length)break;n=ps[0];d++}return d}
 function children(entry){if(!entry)return[];const out=[];for(const e of byNo.values())if(Number(e.parent)===Number(entry.no))out.push(e);return out}
 function parentEntries(entry){return entry?[...(parents.get(entry.no)||[])].map(no=>byNo.get(no)).filter(Boolean):[]}
 return Object.freeze({rows,byName,byNo,parents,entryByName,root,depth,children,parentEntries});
}
async function loadEvolutionRows(){
 let rows=compactEvolutionRows(readJSON(KEYS.evolutionCache,[]));
 if(rows.length)return rows;
 const [sp,nm]=await Promise.all([
  fetch(EVOLUTION_SPECIES_URL,{cache:"force-cache"}),
  fetch(EVOLUTION_NAMES_URL,{cache:"force-cache"})
 ]);
 if(!sp.ok||!nm.ok)throw new Error(`evolution data HTTP ${sp.status}/${nm.status}`);
 rows=compactEvolutionRows(buildEvolutionRowsFromCsv(await sp.text(),await nm.text()));
 try{writeJSON(KEYS.evolutionCache,rows)}catch{}
 return rows;
}
async function loadEvolutionIndex(){return buildEvolutionIndex(await loadEvolutionRows())}
window.FRENDA_DATA=Object.freeze({
 VERSION,KEYS,clone,readJSON,writeJSON,remove,readList,writeList,uniqueList,
 simulator:Object.freeze({
  pickKey,pickPhotoKey,readOverride:readPickOverride,writeOverride:writePickOverride,removeOverride:removePickOverride,
  readPhoto:readPickPhoto,writePhoto:writePickPhoto,removePhoto:removePickPhoto,pickImage
 }),
 records:Object.freeze({REGION_PREFIXES,index:createRecordIndex,image:recordImage,splitRegionalName}),
 dungeon:Object.freeze({read:readDungeon,write:writeDungeon,mutate:mutateDungeon,statKey:dungeonStatKey}),
 expedition:Object.freeze({read:readExpedition,write:writeExpedition,snapshot:expeditionSnapshot,resolve:resolveExpedition}),
 evolution:Object.freeze({loadRows:loadEvolutionRows,loadIndex:loadEvolutionIndex,buildIndex:buildEvolutionIndex,compactRows:compactEvolutionRows,speciesUrl:EVOLUTION_SPECIES_URL,namesUrl:EVOLUTION_NAMES_URL})
});
})();
