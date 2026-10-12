(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{};
R.accountKey=()=>{const U=window.FRENDA_USER;if(U?.mode==="cloud")return `cloud:${U.cloudUserId||"unknown"}`;return `local:${U?.localProfileId||"A"}`};
R.saveKey=()=>`frenda:ranch:v1:${R.accountKey()}`;
R.readSave=()=>{try{const x=JSON.parse(localStorage.getItem(R.saveKey())||"null");return x&&typeof x==="object"?x:null}catch{return null}};
R.writeSave=x=>{localStorage.setItem(R.saveKey(),JSON.stringify(x));return x};
R.uid=()=>`r_${Date.now().toString(36)}_${globalThis.crypto?.randomUUID?.().slice(0,8)||Math.random().toString(36).slice(2,10)}`;
})();
// Updated: 2026-10-12 20:00 JST
