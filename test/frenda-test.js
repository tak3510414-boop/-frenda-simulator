/* FRENDA_TEST_VERSION: 1.0 / regression sandbox */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
const requested=params.get("test")==="1"||params.get("selftest")==="1";
if(!requested){window.FRENDA_TEST=Object.freeze({active:false,requested:false,storage:null,version:"1.0"});return}

const real=window.localStorage;
const mem=new Map();
try{
 for(let i=0;i<real.length;i++){
  const k=real.key(i);if(k!==null)mem.set(String(k),String(real.getItem(k)??""));
 }
}catch{}
const storage={
 get length(){return mem.size},
 key(i){const a=[...mem.keys()];return Number.isInteger(Number(i))?a[Number(i)]??null:null},
 getItem(k){k=String(k);return mem.has(k)?mem.get(k):null},
 setItem(k,v){mem.set(String(k),String(v))},
 removeItem(k){mem.delete(String(k))},
 clear(){mem.clear()}
};

let isolated=false;
try{
 Object.defineProperty(window,"localStorage",{configurable:true,enumerable:true,value:storage});
 isolated=window.localStorage===storage;
}catch{}

if(!isolated){
 try{
  const proto=Object.getPrototypeOf(real);
  const nativeGet=proto.getItem,nativeSet=proto.setItem,nativeRemove=proto.removeItem,nativeClear=proto.clear,nativeKey=proto.key;
  proto.getItem=function(k){return this===real?storage.getItem(k):nativeGet.call(this,k)};
  proto.setItem=function(k,v){return this===real?storage.setItem(k,v):nativeSet.call(this,k,v)};
  proto.removeItem=function(k){return this===real?storage.removeItem(k):nativeRemove.call(this,k)};
  proto.clear=function(){return this===real?storage.clear():nativeClear.call(this)};
  proto.key=function(i){return this===real?storage.key(i):nativeKey.call(this,i)};
  const probe=`__frenda_test_probe_${Date.now()}__`;
  const nativeBefore=nativeGet.call(real,probe);
  storage.setItem(probe,"sandbox");
  isolated=real.getItem(probe)==="sandbox"&&nativeGet.call(real,probe)===nativeBefore;
  storage.removeItem(probe);
 }catch{}
}

window.FRENDA_TEST=Object.freeze({
 version:"1.0",
 requested:true,
 active:!!isolated,
 storage,
 snapshotSize:mem.size
});

if(!isolated){
 document.addEventListener("DOMContentLoaded",()=>{
  document.body.innerHTML='<main style="font-family:system-ui;padding:24px"><h1>テストモードを開始できません</h1><p>本番セーブを保護するため、保存領域の分離に失敗した状態ではテストを実行しません。</p><p><a href="test-center.html">テストセンターへ戻る</a></p></main>';
 });
 throw new Error("FRENDA_TEST_ISOLATION_FAILED");
}
})();
