/* FRENDA_TEST_VERSION: 1.2 / regression sandbox + cloud-session cache; load BEFORE all shared Frenda scripts */
(()=>{
"use strict";
const VERSION="1.2";
const params=new URLSearchParams(location.search);
const inTestPath=/\/test(?:\/|$)/.test(location.pathname);
const requested=inTestPath||params.get("test")==="1"||params.get("selftest")==="1";
if(!requested){window.FRENDA_TEST=Object.freeze({active:false,requested:false,storage:null,version:VERSION});return;}

const MODE_KEY="frenda:test:storage-mode";
const USER_KEY="frenda:test:cloud-user-id";
const CACHE_PREFIX="frenda:test:cloud-cache:";
const DUNGEON_KEY="frenda:dungeon:v1";
const EXPEDITION_KEY="frenda:expedition:v1";

const real=window.localStorage;
const proto=Object.getPrototypeOf(real);
const native={getItem:proto.getItem,setItem:proto.setItem,removeItem:proto.removeItem,clear:proto.clear,key:proto.key};
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
function seedLocalSnapshot(){
  mem.clear();
  try{for(let i=0;i<real.length;i++){const k=native.key.call(real,i);if(k!==null)mem.set(String(k),String(native.getItem.call(real,k)??""));}}
  catch(e){console.error("FRENDA_TEST_SNAPSHOT_FAILED",e)}
}
if(currentMode()==="cloud")seedFromCloudPayload(readCloudCache());else seedLocalSnapshot();

function notify(type,key,value,oldValue){for(const fn of [...listeners]){try{fn({type,key,value,oldValue,mode:currentMode()})}catch(e){console.error("FRENDA_TEST_STORAGE_LISTENER",e)}}}
const storage={
  get length(){return mem.size},
  key(i){const a=[...mem.keys()];const n=Number(i);return Number.isInteger(n)?a[n]??null:null},
  getItem(k){k=String(k);return mem.has(k)?mem.get(k):null},
  setItem(k,v){k=String(k);v=String(v);const old=mem.has(k)?mem.get(k):null;mem.set(k,v);if(old!==v)notify("set",k,v,old)},
  removeItem(k){k=String(k);const old=mem.has(k)?mem.get(k):null;const had=mem.delete(k);if(had)notify("remove",k,null,old)},
  clear(){if(!mem.size)return;mem.clear();notify("clear",null,null,null)},
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
function deactivateCloud(){sessionRemove(MODE_KEY);sessionRemove(USER_KEY);seedLocalSnapshot();return true}
function clearCloudCache(userId){const key=cacheKey(String(userId||""));if(key)sessionRemove(key)}
function snapshot(){return Object.fromEntries(mem)}

window.FRENDA_TEST=Object.freeze({
  version:VERSION,requested:true,active:!!isolated,storage,
  get mode(){return currentMode()},get cloudUserId(){return cloudUserId()},
  readCloudCache,writeCloudCache,activateCloud,updateCloudCache,deactivateCloud,clearCloudCache,snapshot,
  productionStorageUnchanged,assertProductionStorageUnchanged
});
if(!isolated){document.addEventListener("DOMContentLoaded",()=>{document.body.innerHTML='<main style="font-family:system-ui;padding:24px"><h1>テストモードを開始できません</h1><p>本番セーブを保護するため、保存領域の分離に失敗した状態ではテストを実行しません。</p><p><a href="test-center.html">テストセンターへ戻る</a></p></main>';});throw new Error("FRENDA_TEST_ISOLATION_FAILED");}
setInterval(()=>assertProductionStorageUnchanged(),1000);window.addEventListener("pagehide",()=>assertProductionStorageUnchanged());
})();
