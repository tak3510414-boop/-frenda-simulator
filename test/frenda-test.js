/* FRENDA_TEST_VERSION: 1.1 / regression sandbox - load BEFORE all shared Frenda scripts */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
const requested=params.get("test")==="1"||params.get("selftest")==="1";
if(!requested){window.FRENDA_TEST=Object.freeze({active:false,requested:false,storage:null,version:"1.1"});return;}
const real=window.localStorage;
const proto=Object.getPrototypeOf(real);
const native={getItem:proto.getItem,setItem:proto.setItem,removeItem:proto.removeItem,clear:proto.clear,key:proto.key};
const mem=new Map();
try{for(let i=0;i<real.length;i++){const k=native.key.call(real,i);if(k!==null)mem.set(String(k),String(native.getItem.call(real,k)??""));}}catch(e){console.error("FRENDA_TEST_SNAPSHOT_FAILED",e)}
const protectedKeys=["frenda:dungeon:v1","frenda:expedition:v1","frenda:owned:v1","frenda:favorites:v1","frenda:team:v1"];
const baseline=new Map(protectedKeys.map(k=>[k,native.getItem.call(real,k)]));
const storage={get length(){return mem.size},key(i){const a=[...mem.keys()];const n=Number(i);return Number.isInteger(n)?a[n]??null:null},getItem(k){k=String(k);return mem.has(k)?mem.get(k):null},setItem(k,v){mem.set(String(k),String(v))},removeItem(k){mem.delete(String(k))},clear(){mem.clear()}};
let isolated=false;
try{Object.defineProperty(window,"localStorage",{configurable:true,enumerable:true,get(){return storage}});isolated=window.localStorage===storage;}catch(e){console.error("FRENDA_TEST_SHADOW_FAILED",e)}
if(isolated){try{const probe=`__frenda_test_probe_${Date.now()}__`;const before=native.getItem.call(real,probe);storage.setItem(probe,"sandbox");isolated=window.localStorage.getItem(probe)==="sandbox"&&native.getItem.call(real,probe)===before;storage.removeItem(probe);}catch(e){isolated=false;console.error("FRENDA_TEST_VERIFY_FAILED",e)}}
function productionStorageUnchanged(){try{return protectedKeys.every(k=>native.getItem.call(real,k)===baseline.get(k));}catch{return false}}
function assertProductionStorageUnchanged(){if(productionStorageUnchanged())return true;const msg="テスト中に本番セーブ領域の変更を検出しました。安全のためテストを停止します。";console.error("FRENDA_TEST_PRODUCTION_STORAGE_CHANGED",{baseline,current:Object.fromEntries(protectedKeys.map(k=>[k,native.getItem.call(real,k)]))});document.documentElement.dataset.frendaTestUnsafe="1";if(document.body){document.body.innerHTML=`<main style="font-family:system-ui;padding:24px"><h1>⚠️ テストを停止しました</h1><p>${msg}</p><p><a href="test-center.html">テストセンターへ戻る</a></p></main>`;}return false}
window.FRENDA_TEST=Object.freeze({version:"1.1",requested:true,active:!!isolated,storage,snapshotSize:mem.size,productionStorageUnchanged,assertProductionStorageUnchanged});
if(!isolated){document.addEventListener("DOMContentLoaded",()=>{document.body.innerHTML='<main style="font-family:system-ui;padding:24px"><h1>テストモードを開始できません</h1><p>本番セーブを保護するため、保存領域の分離に失敗した状態ではテストを実行しません。</p><p><a href="test-center.html">テストセンターへ戻る</a></p></main>';});throw new Error("FRENDA_TEST_ISOLATION_FAILED");}
setInterval(()=>assertProductionStorageUnchanged(),1000);window.addEventListener("pagehide",()=>assertProductionStorageUnchanged());
})();
