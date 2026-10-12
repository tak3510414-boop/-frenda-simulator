(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{};
R.accountKey=()=>{const U=window.FRENDA_USER;if(U?.mode==="cloud"&&U.cloudUserId)return `cloud:${U.cloudUserId}`;return `local:${U?.localProfileId||"A"}`};
R.saveKey=()=>`frenda:ranch:v1:${R.accountKey()}`;
R.readSave=()=>{try{const x=JSON.parse(localStorage.getItem(R.saveKey())||"null");if(!x||typeof x!=="object")return null;if(!Array.isArray(x.creatures))x.creatures=[];if(!Array.isArray(x.previousOwnedIds))x.previousOwnedIds=[];if(!Array.isArray(x.evolutionHistory))x.evolutionHistory=[];x.schemaVersion=Math.max(Number(x.schemaVersion)||1,2);return x}catch{return null}};
R.writeSave=x=>{localStorage.setItem(R.saveKey(),JSON.stringify(x));return x};
R.uid=()=>`r_${Date.now().toString(36)}_${globalThis.crypto?.randomUUID?.().slice(0,8)||Math.random().toString(36).slice(2,10)}`;
})();
// Updated: 2026-10-12 20:45 JST
