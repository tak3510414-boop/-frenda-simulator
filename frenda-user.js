/* FRENDA_USER_VERSION: 1.0 / production local profiles + cloud-session volatile storage; local and cloud saves never synchronize */
(()=>{
"use strict";
const VERSION="1.0";
const MODE_KEY="frenda:user:storage-mode:v1";
const USER_KEY="frenda:user:cloud-user-id:v1";
const CACHE_PREFIX="frenda:user:cloud-cache:";
const DIRTY_PREFIX="frenda:user:cloud-dirty:";
const LOCAL_PREFIX_BASE="frenda:user:local:v1:";
const LOCAL_PROFILE_KEY="frenda:user:active-local-profile:v1";
const LOCAL_PROFILE_REGISTRY_KEY="frenda:user:local-profile-registry:v1";
const LOCAL_MIGRATION_KEY="frenda:user:legacy-local-migrated:v1";
const DEFAULT_LOCAL_PROFILES=Object.freeze([{id:"A",name:"ローカルA"},{id:"B",name:"ローカルB"}]);
const DUNGEON_KEY="frenda:dungeon:v1";
const EXPEDITION_KEY="frenda:expedition:v1";

const real=window.localStorage;
const proto=Object.getPrototypeOf(real);
const native={getItem:proto.getItem,setItem:proto.setItem,removeItem:proto.removeItem,clear:proto.clear,key:proto.key};
const listeners=new Set();
const mem=new Map();

function sanitizeProfileName(name){return String(name??"").trim().replace(/\s+/g," ").slice(0,20)}
function normalizeProfileId(v){return String(v||"").trim().toUpperCase()}
function managerKey(k){return String(k||"").startsWith("frenda:user:")||String(k||"").startsWith("frenda:test:")}
function legacyCandidate(k){k=String(k||"");return !managerKey(k)&&(k.startsWith("frenda:")||k.startsWith("frenda_"))}
function legacyMirrorKey(k){
 k=String(k||"");
 return k===DUNGEON_KEY||k===EXPEDITION_KEY||k==="frenda:auto-backups:v1"||k==="frenda:damageModel:v1"||k==="frenda_eye_timer_v1"||k==="frenda:owned:v1"||k==="frenda:favorites:v1"||k==="frenda:team:v1"||k.startsWith("frenda:dungeon:")||k.startsWith("frenda:expedition:");
}
function readLocalProfileRegistry(){
 try{
  const raw=native.getItem.call(real,LOCAL_PROFILE_REGISTRY_KEY);
  if(!raw)return DEFAULT_LOCAL_PROFILES.map(x=>({...x}));
  const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error("registry is not array");
  const out=[],seen=new Set();
  for(const item of parsed){
   const id=normalizeProfileId(item?.id),name=sanitizeProfileName(item?.name);
   if(!/^(?:A|B|U[1-9]\d*)$/.test(id)||!name||seen.has(id))continue;
   seen.add(id);out.push({id,name});
  }
  return out.length?out:DEFAULT_LOCAL_PROFILES.map(x=>({...x}));
 }catch(e){console.warn("FRENDA_USER_PROFILE_REGISTRY_READ_FAILED",e);return DEFAULT_LOCAL_PROFILES.map(x=>({...x}))}
}
function writeLocalProfileRegistry(list){try{native.setItem.call(real,LOCAL_PROFILE_REGISTRY_KEY,JSON.stringify(list));return true}catch(e){console.error("FRENDA_USER_PROFILE_REGISTRY_WRITE_FAILED",e);return false}}
function ensureLocalProfileRegistry(){try{if(native.getItem.call(real,LOCAL_PROFILE_REGISTRY_KEY))return;writeLocalProfileRegistry(DEFAULT_LOCAL_PROFILES.map(x=>({...x})))}catch{}}
function localProfiles(){return readLocalProfileRegistry()}
function validLocalProfile(v){const id=normalizeProfileId(v);return localProfiles().some(x=>x.id===id)}
function localProfileId(){
 try{const list=localProfiles(),v=normalizeProfileId(native.getItem.call(real,LOCAL_PROFILE_KEY));return list.some(x=>x.id===v)?v:(list[0]?.id||"A")}catch{return "A"}
}
function localProfileInfo(id=localProfileId()){const list=localProfiles(),key=normalizeProfileId(id);return list.find(x=>x.id===key)||list[0]||{id:"A",name:"ローカルA"}}
function localProfileName(id=localProfileId()){return localProfileInfo(id).name}
function localPrefix(profile=localProfileId()){return `${LOCAL_PREFIX_BASE}${normalizeProfileId(profile)}:`}
function setLocalProfileMeta(profile){profile=normalizeProfileId(profile);if(!validLocalProfile(profile))return false;try{native.setItem.call(real,LOCAL_PROFILE_KEY,profile);return true}catch{return false}}
function migrateLegacyLocalA(){
 try{
  if(native.getItem.call(real,LOCAL_MIGRATION_KEY)==="1")return;
  const targetPrefix=localPrefix("A"),keys=[];
  for(let i=0;i<real.length;i++){const k=native.key.call(real,i);if(k!==null&&legacyCandidate(k))keys.push(String(k))}
  let copied=0;
  for(const k of keys){const dst=targetPrefix+k;if(native.getItem.call(real,dst)!==null)continue;const v=native.getItem.call(real,k);if(v!==null){native.setItem.call(real,dst,String(v));copied++}}
  native.setItem.call(real,LOCAL_MIGRATION_KEY,"1");
  console.info("FRENDA_USER_LEGACY_MIGRATION",{copied});
 }catch(e){console.error("FRENDA_USER_LEGACY_MIGRATION_FAILED",e)}
}
function createLocalProfile(name){
 if(currentMode()==="cloud")return null;name=sanitizeProfileName(name);if(!name)return null;
 const list=localProfiles();if(list.some(x=>x.name===name))return null;
 let max=0;for(const x of list){const m=/^U(\d+)$/.exec(x.id);if(m)max=Math.max(max,Number(m[1])||0)}
 const profile={id:`U${max+1}`,name};if(!writeLocalProfileRegistry([...list,profile]))return null;
 const old=localProfileId();if(!setLocalProfileMeta(profile.id))return null;seedLocalStorage();notify("profiles",null,profile.id,old);return {...profile};
}
function renameLocalProfile(profile,newName){
 if(currentMode()==="cloud")return null;profile=normalizeProfileId(profile);newName=sanitizeProfileName(newName);if(!validLocalProfile(profile)||!newName)return null;
 const list=localProfiles(),current=list.find(x=>x.id===profile);if(!current)return null;if(list.some(x=>x.id!==profile&&x.name===newName))return null;if(current.name===newName)return {...current};
 const next=list.map(x=>x.id===profile?{...x,name:newName}:{...x});if(!writeLocalProfileRegistry(next))return null;notify("profileRename",null,{id:profile,name:newName},{id:profile,name:current.name});return {id:profile,name:newName};
}
function deleteLocalProfile(profile){
 if(currentMode()==="cloud")return null;profile=normalizeProfileId(profile);const list=localProfiles(),currentId=localProfileId();if(list.length<=1||profile===currentId||!list.some(x=>x.id===profile))return null;
 const target=list.find(x=>x.id===profile),prefix=localPrefix(profile),keys=[];
 try{
  for(let i=0;i<real.length;i++){const raw=native.key.call(real,i);if(raw!==null&&String(raw).startsWith(prefix))keys.push(String(raw))}
  if(!writeLocalProfileRegistry(list.filter(x=>x.id!==profile)))return null;for(const raw of keys)native.removeItem.call(real,raw);notify("profileDelete",null,{id:profile,name:target.name},null);return {...target};
 }catch(e){console.error("FRENDA_USER_PROFILE_DELETE_FAILED",e);return null}
}

function sessionGet(k){try{return sessionStorage.getItem(k)}catch{return null}}
function sessionSet(k,v){try{sessionStorage.setItem(k,String(v));return true}catch{return false}}
function sessionRemove(k){try{sessionStorage.removeItem(k)}catch{}}
function cloudUserId(){return sessionGet(USER_KEY)||""}
function currentMode(){return sessionGet(MODE_KEY)==="cloud"&&cloudUserId()?"cloud":"local"}
function cacheKey(userId=cloudUserId()){return userId?CACHE_PREFIX+userId:""}
function dirtyKey(userId=cloudUserId()){return userId?DIRTY_PREFIX+userId:""}
function readCloudCache(userId=cloudUserId()){const key=cacheKey(userId);if(!key)return null;try{const raw=sessionGet(key);return raw?JSON.parse(raw):null}catch{return null}}
function writeCloudCache(payload,userId=cloudUserId()){const key=cacheKey(userId);if(!key)return false;try{return sessionSet(key,JSON.stringify(payload??null))}catch{return false}}
function markCloudDirty(userId=cloudUserId()){const key=dirtyKey(userId);return key?sessionSet(key,"1"):false}
function clearCloudDirty(userId=cloudUserId()){const key=dirtyKey(userId);if(key)sessionRemove(key)}
function cloudDirty(userId=cloudUserId()){const key=dirtyKey(userId);return !!key&&sessionGet(key)==="1"}
function seedFromCloudPayload(payload){mem.clear();const state=payload&&typeof payload==="object"&&payload.state&&typeof payload.state==="object"?payload.state:null;if(!state)return;mem.set(DUNGEON_KEY,JSON.stringify(state));if(state.expeditionShared&&typeof state.expeditionShared==="object")mem.set(EXPEDITION_KEY,JSON.stringify(state.expeditionShared))}
function seedLocalStorage(){
 mem.clear();const prefix=localPrefix();
 try{for(let i=0;i<real.length;i++){const raw=native.key.call(real,i);if(raw===null||!String(raw).startsWith(prefix))continue;const k=String(raw).slice(prefix.length);mem.set(k,String(native.getItem.call(real,raw)??""))}}
 catch(e){console.error("FRENDA_USER_LOCAL_SEED_FAILED",e)}
}
function persistLocalSet(k,v){try{native.setItem.call(real,localPrefix()+String(k),String(v));if(localProfileId()==="A"&&legacyMirrorKey(k))native.setItem.call(real,String(k),String(v));return true}catch(e){console.error("FRENDA_USER_LOCAL_WRITE_FAILED",e);return false}}
function persistLocalRemove(k){try{native.removeItem.call(real,localPrefix()+String(k));if(localProfileId()==="A"&&legacyMirrorKey(k))native.removeItem.call(real,String(k));return true}catch(e){console.error("FRENDA_USER_LOCAL_REMOVE_FAILED",e);return false}}
function persistLocalClear(){
 try{const prefix=localPrefix(),keys=[];for(let i=0;i<real.length;i++){const raw=native.key.call(real,i);if(raw!==null&&String(raw).startsWith(prefix))keys.push(String(raw))}
  for(const raw of keys){const k=raw.slice(prefix.length);native.removeItem.call(real,raw);if(localProfileId()==="A"&&legacyMirrorKey(k))native.removeItem.call(real,k)}return true;
 }catch(e){console.error("FRENDA_USER_LOCAL_CLEAR_FAILED",e);return false}
}

ensureLocalProfileRegistry();migrateLegacyLocalA();
if(currentMode()==="cloud")seedFromCloudPayload(readCloudCache());else seedLocalStorage();
function notify(type,key,value,oldValue){for(const fn of [...listeners]){try{fn({type,key,value,oldValue,mode:currentMode()})}catch(e){console.error("FRENDA_USER_STORAGE_LISTENER",e)}}}
const storage={
 get length(){return mem.size},
 key(i){const a=[...mem.keys()];const n=Number(i);return Number.isInteger(n)?a[n]??null:null},
 getItem(k){k=String(k);return mem.has(k)?mem.get(k):null},
 setItem(k,v){k=String(k);v=String(v);const old=mem.has(k)?mem.get(k):null;mem.set(k,v);if(currentMode()==="local")persistLocalSet(k,v);else markCloudDirty();if(old!==v)notify("set",k,v,old)},
 removeItem(k){k=String(k);const old=mem.has(k)?mem.get(k):null;const had=mem.delete(k);if(currentMode()==="local")persistLocalRemove(k);else markCloudDirty();if(had)notify("remove",k,null,old)},
 clear(){const had=mem.size>0;mem.clear();if(currentMode()==="local")persistLocalClear();else markCloudDirty();if(had)notify("clear",null,null,null)},
 subscribe(fn){if(typeof fn!=="function")return ()=>{};listeners.add(fn);return ()=>listeners.delete(fn)}
};
function activateCloud(userId,payload,{dirty=false}={}){userId=String(userId||"").trim();if(!userId)throw new Error("cloud user id is required");sessionSet(USER_KEY,userId);sessionSet(MODE_KEY,"cloud");writeCloudCache(payload??null,userId);if(dirty)markCloudDirty(userId);else clearCloudDirty(userId);seedFromCloudPayload(payload??null);return true}
function updateCloudCache(payload,userId=cloudUserId(),{dirty=false}={}){if(!userId||currentMode()!=="cloud")return false;writeCloudCache(payload??null,userId);if(dirty)markCloudDirty(userId);seedFromCloudPayload(payload??null);return true}
function deactivateCloud(){sessionRemove(MODE_KEY);sessionRemove(USER_KEY);seedLocalStorage();return true}
function clearCloudCache(userId){const id=String(userId||"");const key=cacheKey(id);if(key)sessionRemove(key);clearCloudDirty(id)}
function switchLocalProfile(profile){profile=normalizeProfileId(profile);if(currentMode()==="cloud"||!validLocalProfile(profile))return false;const old=localProfileId();if(old===profile)return true;if(!setLocalProfileMeta(profile))return false;seedLocalStorage();notify("profile",null,profile,old);return true}
function snapshot(){return Object.fromEntries(mem)}

window.FRENDA_USER=Object.freeze({
 version:VERSION,active:true,storage,
 get mode(){return currentMode()},get cloudUserId(){return cloudUserId()},get localProfileId(){return localProfileId()},get localProfileName(){return localProfileName()},get localProfiles(){return localProfiles().map(x=>({...x}))},
 readCloudCache,writeCloudCache,markCloudDirty,clearCloudDirty,cloudDirty,activateCloud,updateCloudCache,deactivateCloud,clearCloudCache,switchLocalProfile,createLocalProfile,renameLocalProfile,deleteLocalProfile,snapshot
});
})();
/* Ver1.0: 本番ローカル複数ユーザー基盤。既存ローカルデータは初回にローカルAへ安全コピーし、原本は残す。クラウドユーザーはlocalStorageへセーブせず、セッション内一時キャッシュのみ使用。Updated: 2026-10-11 01:20 JST */
