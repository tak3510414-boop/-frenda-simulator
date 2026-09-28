/* FRENDA_TEST_VERSION: 1.0 / Updated: 2026-09-28 */
(()=>{
"use strict";
const VERSION="1.0";
let active=false;
try{
 const p=new URLSearchParams(location.search);
 active=p.get("test")==="1"||p.get("selftest")==="1";
}catch{}
function createMemoryStorage(source){
 const map=new Map();
 try{for(let i=0;i<source.length;i++){const k=source.key(i);if(k!==null)map.set(String(k),String(source.getItem(k)??""))}}catch{}
 return Object.freeze({
  get length(){return map.size},
  key(i){const a=[...map.keys()];return Number.isInteger(Number(i))?a[Number(i)]??null:null},
  getItem(k){k=String(k);return map.has(k)?map.get(k):null},
  setItem(k,v){map.set(String(k),String(v))},
  removeItem(k){map.delete(String(k))},
  clear(){map.clear()},
  _snapshot(){return Object.fromEntries(map)}
 });
}
const storage=active?createMemoryStorage(window.localStorage):window.localStorage;
window.FRENDA_TEST=Object.freeze({VERSION,active,storage,isIsolated:()=>active});
})();
