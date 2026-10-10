/* FRENDA_TEST_VERSION: 1.6 / dynamic isolated local profiles + cloud-session cache + regression ephemeral guard; load BEFORE all shared Frenda scripts */
(()=>{
"use strict";
const VERSION="1.6";
const params=new URLSearchParams(location.search);
const inTestPath=/\/test(?:\/|$)/.test(location.pathname);
const requested=inTestPath||params.get("test")==="1"||params.get("selftest")==="1";
function regressionCaseActive(){return params.has("case")}
if(!requested){window.FRENDA_TEST=Object.freeze({active:false,requested:false,storage:null,version:VERSION});return;}

const MODE_KEY="frenda:test:storage-mode";
const USER_KEY="frenda:test:cloud-user-id";
const CACHE_PREFIX="frenda:test:cloud-cache:";
const LEGACY_LOCAL_PREFIX="frenda:test:local:v1:";
const LOCAL_PREFIX_BASE="frenda:test:local:v2:";
const LOCAL_PROFILE_KEY="frenda:test:active-local-profile:v1";
const LOCAL_MIGRATION_KEY="frenda:test:local-v2-migrated";
const LOCAL_PROFILE_REGISTRY_KEY="frenda:test:local-profile-registry:v1";
const DEFAULT_LOCAL_PROFILES=Object.freeze([{id:"A",name:"ローカルA"},{id:"B",name:"ローカルB"}]);
const DUNGEON_KEY="frenda:dungeon:v1";
const EXPEDITION_KEY="frenda:expedition:v1";

const real=window.localStorage;
const proto=Object.getPrototypeOf(real);
const native={getItem:proto.getItem,setItem:proto.setItem,removeItem:proto.removeItem,clear:proto.clear,key:proto.key};
function sanitizeProfileName(name){return String(name??"").trim().replace(/\s+/g," ").slice(0,20)}
function normalizeProfileId(v){return String(v||"").trim().toUpperCase()}
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
    for(const def of DEFAULT_LOCAL_PROFILES){if(!seen.has(def.id)){seen.add(def.id);out.unshift({...def})}}
    return out.length?out:DEFAULT_LOCAL_PROFILES.map(x=>({...x}));
  }catch(e){console.warn("FRENDA_TEST_LOCAL_PROFILE_REGISTRY_READ_FAILED",e);return DEFAULT_LOCAL_PROFILES.map(x=>({...x}))}
}
function writeLocalProfileRegistry(list){
  if(regressionCaseActive())return false;
  try{native.setItem.call(real,LOCAL_PROFILE_REGISTRY_KEY,JSON.stringify(list));return true}catch(e){console.error("FRENDA_TEST_LOCAL_PROFILE_REGISTRY_WRITE_FAILED",e);return false}
}
function ensureLocalProfileRegistry(){
  if(regressionCaseActive())return;
  try{if(native.getItem.call(real,LOCAL_PROFILE_REGISTRY_KEY))return;writeLocalProfileRegistry(DEFAULT_LOCAL_PROFILES.map(x=>({...x})))}catch{}
}
function localProfiles(){return readLocalProfileRegistry()}
function validLocalProfile(v){const id=normalizeProfileId(v);return localProfiles().some(x=>x.id===id)}
function localProfileId(){
  try{const v=normalizeProfileId(native.getItem.call(real,LOCAL_PROFILE_KEY));return validLocalProfile(v)?v:"A"}catch{return "A"}
}
function localProfileInfo(id=localProfileId()){const key=normalizeProfileId(id);return localProfiles().find(x=>x.id===key)||{id:"A",name:"ローカルA"}}
function localProfileName(id=localProfileId()){return localProfileInfo(id).name}
function localPrefix(profile=localProfileId()){return `${LOCAL_PREFIX_BASE}${normalizeProfileId(profile)}:`}
function setLocalProfileMeta(profile){
  profile=normalizeProfileId(profile);if(!validLocalProfile(profile))return false;
  try{native.setItem.call(real,LOCAL_PROFILE_KEY,profile);return true}catch{return false}
}
function createLocalProfile(name){
  if(regressionCaseActive()||currentMode()==="cloud")return null;
  name=sanitizeProfileName(name);if(!name)return null;
  const list=localProfiles();if(list.some(x=>x.name===name))return null;
  let max=0;for(const x of list){const m=/^U(\d+)$/.exec(x.id);if(m)max=Math.max(max,Number(m[1])||0)}
  const profile={id:`U${max+1}`,name};
  const next=[...list,profile];if(!writeLocalProfileRegistry(next))return null;
  const old=localProfileId();if(!setLocalProfileMeta(profile.id))return null;
  seedLocalSandbox();notify("profiles",null,profile.id,old);return {...profile};
}
function migrateLegacyLocalA(){
  if(regressionCaseActive())return;
  try{
    if(native.getItem.call(real,LOCAL_MIGRATION_KEY)==="1")return;
    const targetPrefix=localPrefix("A"),legacy=[];
    for(let i=0;i<real.length;i++){
      const raw=native.key.call(real,i);
      if(raw!==null&&String(raw).startsWith(LEGACY_LOCAL_PREFIX))legacy.push(String(raw));
    }
    let targetExists=false;
    for(let i=0;i<real.length;i++){
      const raw=native.key.call(real,i);
      if(raw!==null&&String(raw).startsWith(targetPrefix)){targetExists=true;break}
    }
    if(!targetExists){
      for(const raw of legacy){
        const k=raw.slice(LEGACY_LOCAL_PREFIX.length);
        native.setItem.call(real,targetPrefix+k,String(native.getItem.call(real,raw)??""));
      }
    }
    native.setItem.call(real,LOCAL_MIGRATION_KEY,"1");
  }catch(e){console.error("FRENDA_TEST_LOCAL_MIGRATION_FAILED",e)}
}
ensureLocalProfileRegistry();
migrateLegacyLocalA();
const protectedKeys=["frenda:dungeon:v1","frenda:expedition:v1","frenda:owned:v1","frenda:favorites:v1","frenda:team:v1"];
const baseline=new Map(protectedKeys.map(k=>[k,native.getItem.call(real,k)]));
const listeners=new Set();
const mem=new Map();

function sessionGet(k){try{return sessionStorage.getItem(k)}catch{return null}}
function sessionSet(k,v){try{sessionStorage.setItem(k,String(v));return true}catch{return false}}
function sessionRemove(k){try{sessionStorage.removeItem(k)}catch{}}
function cloudUserId(){return sessionGet(USER_KEY)||""}
function currentMode(){return sessionGet(MODE_KEY)==="cloud"&&cloudUserId()?"cloud":"local"}
function cacheKey(userId=cloudUserId()){return userId?CACHE_PREFIX+userId:""}
function readCloudCache(userId=cloudUserId()){
  const key=cacheKey(userId);if(!key)return null;
  try{const raw=sessionGet(key);return raw?JSON.parse(raw):null}catch{return null}
}
function writeCloudCache(payload,userId=cloudUserId()){
  const key=cacheKey(userId);if(!key)return false;
  try{return sessionSet(key,JSON.stringify(payload??null))}catch{return false}
}
function seedFromCloudPayload(payload){
  mem.clear();
  const state=payload&&typeof payload==="object"&&payload.state&&typeof payload.state==="object"?payload.state:null;
  if(!state)return;
  mem.set(DUNGEON_KEY,JSON.stringify(state));
  if(state.expeditionShared&&typeof state.expeditionShared==="object")mem.set(EXPEDITION_KEY,JSON.stringify(state.expeditionShared));
}
function seedLocalSandbox(){
  mem.clear();
  if(regressionCaseActive())return;
  const prefix=localPrefix();
  try{
    for(let i=0;i<real.length;i++){
      const raw=native.key.call(real,i);
      if(raw===null||!String(raw).startsWith(prefix))continue;
      const k=String(raw).slice(prefix.length);
      mem.set(k,String(native.getItem.call(real,raw)??""));
    }
  }catch(e){console.error("FRENDA_TEST_LOCAL_SEED_FAILED",e)}
}
function persistLocalSet(k,v){
  if(regressionCaseActive())return true;
  try{native.setItem.call(real,localPrefix()+String(k),String(v));return true}
  catch(e){console.error("FRENDA_TEST_LOCAL_WRITE_FAILED",e);return false}
}
function persistLocalRemove(k){
  if(regressionCaseActive())return true;
  try{native.removeItem.call(real,localPrefix()+String(k));return true}
  catch(e){console.error("FRENDA_TEST_LOCAL_REMOVE_FAILED",e);return false}
}
function persistLocalClear(){
  if(regressionCaseActive())return true;
  try{
    const prefix=localPrefix(),keys=[];
    for(let i=0;i<real.length;i++){const raw=native.key.call(real,i);if(raw!==null&&String(raw).startsWith(prefix))keys.push(String(raw));}
    for(const raw of keys)native.removeItem.call(real,raw);
    return true;
  }catch(e){console.error("FRENDA_TEST_LOCAL_CLEAR_FAILED",e);return false}
}
if(currentMode()==="cloud")seedFromCloudPayload(readCloudCache());else seedLocalSandbox();

function notify(type,key,value,oldValue){for(const fn of [...listeners]){try{fn({type,key,value,oldValue,mode:currentMode()})}catch(e){console.error("FRENDA_TEST_STORAGE_LISTENER",e)}}}
const storage={
  get length(){return mem.size},
  key(i){const a=[...mem.keys()];const n=Number(i);return Number.isInteger(n)?a[n]??null:null},
  getItem(k){k=String(k);return mem.has(k)?mem.get(k):null},
  setItem(k,v){k=String(k);v=String(v);const old=mem.has(k)?mem.get(k):null;mem.set(k,v);if(currentMode()==="local")persistLocalSet(k,v);if(old!==v)notify("set",k,v,old)},
  removeItem(k){k=String(k);const old=mem.has(k)?mem.get(k):null;const had=mem.delete(k);if(currentMode()==="local")persistLocalRemove(k);if(had)notify("remove",k,null,old)},
  clear(){const had=mem.size>0;mem.clear();if(currentMode()==="local")persistLocalClear();if(had)notify("clear",null,null,null)},
  subscribe(fn){if(typeof fn!=="function")return ()=>{};listeners.add(fn);return ()=>listeners.delete(fn)}
};

let isolated=false;
try{Object.defineProperty(window,"localStorage",{configurable:true,enumerable:true,get(){return storage}});isolated=window.localStorage===storage;}
catch(e){console.error("FRENDA_TEST_SHADOW_FAILED",e)}
if(isolated){
  try{
    const probe=`__frenda_test_probe_${Date.now()}__`,before=native.getItem.call(real,probe);
    storage.setItem(probe,"sandbox");isolated=window.localStorage.getItem(probe)==="sandbox"&&native.getItem.call(real,probe)===before;storage.removeItem(probe);
  }catch(e){isolated=false;console.error("FRENDA_TEST_VERIFY_FAILED",e)}
}
function productionStorageUnchanged(){try{return protectedKeys.every(k=>native.getItem.call(real,k)===baseline.get(k));}catch{return false}}
function assertProductionStorageUnchanged(){
  if(productionStorageUnchanged())return true;
  const msg="テスト中に本番セーブ領域の変更を検出しました。安全のためテストを停止します。";
  console.error("FRENDA_TEST_PRODUCTION_STORAGE_CHANGED",{baseline,current:Object.fromEntries(protectedKeys.map(k=>[k,native.getItem.call(real,k)]))});
  document.documentElement.dataset.frendaTestUnsafe="1";
  if(document.body)document.body.innerHTML=`<main style="font-family:system-ui;padding:24px"><h1>⚠️ テストを停止しました</h1><p>${msg}</p><p><a href="test-center.html">テストセンターへ戻る</a></p></main>`;
  return false;
}
function activateCloud(userId,payload){
  userId=String(userId||"").trim();if(!userId)throw new Error("cloud user id is required");
  sessionSet(USER_KEY,userId);sessionSet(MODE_KEY,"cloud");writeCloudCache(payload??null,userId);seedFromCloudPayload(payload??null);return true;
}
function updateCloudCache(payload,userId=cloudUserId()){
  if(!userId||currentMode()!=="cloud")return false;
  writeCloudCache(payload??null,userId);seedFromCloudPayload(payload??null);return true;
}
function deactivateCloud(){sessionRemove(MODE_KEY);sessionRemove(USER_KEY);seedLocalSandbox();return true}
function clearCloudCache(userId){const key=cacheKey(String(userId||""));if(key)sessionRemove(key)}
function switchLocalProfile(profile){
  profile=normalizeProfileId(profile);
  if(regressionCaseActive()||currentMode()==="cloud"||!validLocalProfile(profile))return false;
  const old=localProfileId();if(old===profile)return true;
  if(!setLocalProfileMeta(profile))return false;
  seedLocalSandbox();notify("profile",null,profile,old);return true;
}
function snapshot(){return Object.fromEntries(mem)}

window.FRENDA_TEST=Object.freeze({
  version:VERSION,requested:true,active:!!isolated,storage,
  get mode(){return currentMode()},get cloudUserId(){return cloudUserId()},get regressionEphemeral(){return regressionCaseActive()},
  get localProfileId(){return localProfileId()},get localProfileName(){return localProfileName()},get localProfiles(){return localProfiles().map(x=>({...x}))},
  readCloudCache,writeCloudCache,activateCloud,updateCloudCache,deactivateCloud,clearCloudCache,switchLocalProfile,createLocalProfile,snapshot,
  productionStorageUnchanged,assertProductionStorageUnchanged
});
if(!isolated){document.addEventListener("DOMContentLoaded",()=>{document.body.innerHTML='<main style="font-family:system-ui;padding:24px"><h1>テストモードを開始できません</h1><p>本番セーブを保護するため、保存領域の分離に失敗した状態ではテストを実行しません。</p><p><a href="test-center.html">テストセンターへ戻る</a></p></main>';});throw new Error("FRENDA_TEST_ISOLATION_FAILED");}
setInterval(()=>assertProductionStorageUnchanged(),1000);window.addEventListener("pagehide",()=>assertProductionStorageUnchanged());
})();
/* Ver1.6: テスト用ローカルユーザーを追加可能に拡張。A/Bは維持し、追加ユーザーはU1,U2...の独立領域で保存。追加時に名前を設定し、そのユーザーへ切替。回帰テスト中は追加・切替・永続保存を禁止。Updated: 2026-10-10 23:55 JST */
