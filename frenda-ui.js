/* FRENDA_UI_VERSION: 1.0 / Updated: 2026-09-27 20:17 JST */
(()=>{
"use strict";
const VERSION="1.0";
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function formatRemain(ms,doneText="帰還できます"){
 if(ms<=0)return doneText;
 const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
 return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}
function formatShortDateTime(ts){return new Date(ts).toLocaleString("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function createEyeCare({data,onTick,extraStorageKeys=[]}={}){
 if(!data)throw new Error("FRENDA_DATA is required");
 const KEY=data.KEYS.eyeTimer,PLAY_MS=30*60*1000,REST_MS=10*60*1000;
 let handle=null,locked=false,started=false;
 const read=()=>{const x=data.readJSON(KEY,null);return x&&typeof x==="object"?x:null};
 const write=x=>{try{data.writeJSON(KEY,x)}catch{}return x};
 const fresh=(now=Date.now())=>write({phase:"play",playUntil:now+PLAY_MS,updatedAt:now});
 function resolve(now=Date.now()){
  let x=read();
  if(!x||!Number.isFinite(Number(x.playUntil)))return fresh(now);
  if(x.phase==="rest"){
   const restUntil=Number(x.restUntil)||Number(x.playUntil)+REST_MS;
   if(now<restUntil){x.restUntil=restUntil;x.reason=x.reason||"auto";return x}
   return fresh(now);
  }
  const playUntil=Number(x.playUntil);
  if(now<playUntil)return x;
  const restUntil=playUntil+REST_MS;
  if(now<restUntil){x={phase:"rest",playUntil,restUntil,reason:"auto",updatedAt:now};write(x);return x}
  return fresh(now);
 }
 function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),ss=s%60;return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`}
 function ensureOverlay(state){
  let ov=document.getElementById("eyeRestOverlay");
  if(!ov){ov=document.createElement("div");ov.id="eyeRestOverlay";ov.className="eyeRestOverlay";ov.innerHTML=`<div class="eyeRestPanel" role="status" aria-live="polite"><div class="eyeRestIcon">🌿👀</div><div class="eyeRestTitle">目を休めよう</div><div class="eyeRestText" id="eyeRestText"></div><div class="eyeRestCountdown" id="eyeRestCountdown">10:00</div><div class="eyeRestRule">10分休んだら → また30分遊べます</div></div>`;document.body.appendChild(ov)}
  const txt=ov.querySelector("#eyeRestText");
  if(txt)txt.innerHTML=state?.reason==="manual"?"自分から10分休憩を始めました。<br>休憩が終わるまでゲームは操作できません。":"30分遊びました。最低10分、画面から目を離して休憩してください。<br>休憩が終わるまでゲームは操作できません。";
  return ov;
 }
 function setLocked(rest,state){
  locked=rest;document.body.classList.toggle("eyeResting",rest);
  const main=document.querySelector("main"),buttons=document.querySelector(".headerBtns"),manual=document.getElementById("manualRestBtn");
  try{if(main)main.inert=rest;if(buttons)buttons.inert=rest;if(manual)manual.disabled=rest}catch{}
  if(rest)ensureOverlay(state);else document.getElementById("eyeRestOverlay")?.remove();
 }
 function startManualRest(){const now=Date.now(),x=resolve(now);if(x.phase==="rest")return;write({phase:"rest",playUntil:now,restUntil:now+REST_MS,reason:"manual",updatedAt:now});tick()}
 function tick(){
  const now=Date.now(),x=resolve(now),rest=x.phase==="rest",until=rest?Number(x.restUntil):Number(x.playUntil),remain=Math.max(0,until-now),badge=document.getElementById("eyeTimerBadge");
  if(badge){badge.className=`eyeTimerBadge ${rest?"rest":remain<=60000?"danger":remain<=300000?"warn":""}`;badge.textContent=rest?`🌿 休憩 ${fmt(remain)}`:`👁 あと ${fmt(remain)}`;badge.title="30分遊んだら10分休憩"}
  setLocked(rest,x);
  const count=document.getElementById("eyeRestCountdown");if(count)count.textContent=fmt(remain);
  if(typeof onTick==="function")onTick(now,x,remain);
 }
 function keydown(e){if(locked&&!document.getElementById("eyeRestOverlay")?.contains(e.target)){e.preventDefault();e.stopImmediatePropagation()}}
 function storage(e){if(e.key===KEY||extraStorageKeys.includes(e.key))tick()}
 function visibility(){if(document.visibilityState==="visible")tick()}
 function click(e){const b=e.target.closest?.("#manualRestBtn");if(b&&!locked)startManualRest()}
 function start(){
  if(started)return;started=true;
  document.addEventListener("keydown",keydown,true);window.addEventListener("storage",storage);document.addEventListener("visibilitychange",visibility);document.addEventListener("click",click);
  tick();handle=setInterval(tick,1000);
 }
 function stop(){if(handle)clearInterval(handle);handle=null;if(started){document.removeEventListener("keydown",keydown,true);window.removeEventListener("storage",storage);document.removeEventListener("visibilitychange",visibility);document.removeEventListener("click",click);started=false}}
 return Object.freeze({start,stop,tick,startManualRest,isLocked:()=>locked,resolve,format:fmt});
}
window.FRENDA_UI=Object.freeze({VERSION,escapeHtml,formatRemain,formatShortDateTime,sleep,createEyeCare});
})();
