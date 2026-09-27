/* FRENDA_DATA_VERSION: 1.1 / Updated: 2026-09-27 20:30 JST */
(()=>{
"use strict";
const VERSION="1.1";
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
const EVOLUTION_SPECIES_URL="https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species.csv";
const EVOLUTION_NAMES_URL="https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv";
function clone(v){
 if(v===undefined)return undefined;
 return JSON.parse(JSON.stringify(v));
}
function readJSON(key,fallback=null){
 try{
  const raw=localStorage.getItem(key);
  if(raw===null)return clone(fallback);
  return JSON.parse(raw);
 }catch{return clone(fallback)}
}
function writeJSON(key,value){localStorage.setItem(key,JSON.stringify(value));return value}
function remove(key){localStorage.removeItem(key)}
function readList(key){const v=readJSON(key,[]);return Array.isArray(v)?v:[]}
function uniqueList(values){return [...new Set(Array.isArray(values)?values:[])]}
function writeList(key,values){const v=uniqueList(values);writeJSON(key,v);return v}
function pickId(recordOrId){return typeof recordOrId==="string"?recordOrId:String(recordOrId?.master_id||"")}
function pickKey(recordOrId){return `frenda:${pickId(recordOrId)}`}
function pickPhotoKey(recordOrId){return `${pickKey(recordOrId)}:photo`}
function readPickOverride(recordOrId){const v=readJSON(pickKey(recordOrId),{});return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}
function writePickOverride(recordOrId,value){return writeJSON(pickKey(recordOrId),value&&typeof value==="object"?value:{})}
function removePickOverride(recordOrId){remove(pickKey(recordOrId))}
function readPickPhoto(recordOrId){return localStorage.getItem(pickPhotoKey(recordOrId))||""}
function writePickPhoto(recordOrId,data){localStorage.setItem(pickPhotoKey(recordOrId),String(data||""));return data}
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
window.FRENDA_DATA=Object.freeze({
 VERSION,KEYS,clone,readJSON,writeJSON,remove,readList,writeList,uniqueList,
 simulator:Object.freeze({
  pickKey,pickPhotoKey,readOverride:readPickOverride,writeOverride:writePickOverride,removeOverride:removePickOverride,
  readPhoto:readPickPhoto,writePhoto:writePickPhoto,removePhoto:removePickPhoto,pickImage
 }),
 dungeon:Object.freeze({read:readDungeon,write:writeDungeon,mutate:mutateDungeon}),
 expedition:Object.freeze({read:readExpedition,write:writeExpedition,snapshot:expeditionSnapshot,resolve:resolveExpedition}),
 evolution:Object.freeze({loadRows:loadEvolutionRows,compactRows:compactEvolutionRows,speciesUrl:EVOLUTION_SPECIES_URL,namesUrl:EVOLUTION_NAMES_URL})
});
})();
