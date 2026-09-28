/* FRENDA_PARENTAL_VERSION: 1.4 / Updated: 2026-09-29 */
(()=>{
"use strict";
const VERSION="1.4";
const SETTINGS_KEY="frenda:parental:settings:v1";
const PIN_KEY="frenda:parental:pin:v1";
const UNLOCK_KEY="frenda:parental:unlockUntil:v1";
const AUTH_KEY="frenda:admin:auth:v1";
const EYE_TIMER_KEY="frenda_eye_timer_v1";
const DAY_RULES={
  0:{open:"00:00",close:"23:59"},
  1:{open:"08:30",close:"23:59"},
  2:{open:"08:30",close:"23:59"},
  3:{open:"08:30",close:"23:59"},
  4:{open:"08:30",close:"23:59"},
  5:{open:"08:30",close:"23:59"},
  6:{open:"00:00",close:"23:59"}
};
const DEFAULTS=Object.freeze({
  version:3,
  dungeon:{enabled:true,weekly:DAY_RULES,holiday:{enabled:true,open:"00:00",close:"23:59"}},
  eyeCare:{playMinutes:30,restMinutes:10}
});
const clone=v=>JSON.parse(JSON.stringify(v));
function readJSON(k,f=null){try{const x=localStorage.getItem(k);return x===null?clone(f):JSON.parse(x)}catch{return clone(f)}}
function saveJSON(k,v){localStorage.setItem(k,JSON.stringify(v));return v}
function clampInt(v,min,max,fallback){const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback}
function validTime(v,fallback="00:00"){const s=String(v||"");return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s)?s:fallback}
function minOf(t){const m=String(t||"00:00").match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):0}
function normalizeRule(r,fallback){const f=fallback||{open:"00:00",close:"23:59"};return {open:validTime(r?.open,f.open),close:validTime(r?.close,f.close)}}
function migrateLegacyDungeon(d){
  const base=clone(DEFAULTS.dungeon);
  if(!d||typeof d!=="object")return base;
  if(d.weekly){
    base.enabled=d.enabled!==false;
    for(let i=0;i<7;i++)base.weekly[i]=normalizeRule(d.weekly[i]??d.weekly[String(i)],DAY_RULES[i]);
    const h=d.holiday||{};base.holiday={enabled:h.enabled!==false,open:validTime(h.open,"00:00"),close:validTime(h.close,"23:59")};
    return base;
  }
  // v2以前の「禁止開始〜禁止終了」を、v3の「朝から利用〜夜から停止」に変換する。
  const selected=new Set((d.days||[]).map(Number));
  const start=validTime(d.start,"05:00"),end=validTime(d.end,"08:30"),a=minOf(start),b=minOf(end);
  const converted=a>b?{open:end,close:start}:{open:end,close:"23:59"};
  base.enabled=d.enabled!==false;
  for(let i=0;i<7;i++)base.weekly[i]=selected.has(i)?clone(converted):{open:"00:00",close:"23:59"};
  base.holiday=d.allowHolidays!==false?{enabled:true,open:"00:00",close:"23:59"}:{enabled:false,open:"00:00",close:"23:59"};
  return base;
}
function ensure(){
  const x=readJSON(SETTINGS_KEY,null),s=x&&typeof x==="object"?x:clone(DEFAULTS);
  s.version=3;s.dungeon=migrateLegacyDungeon(s.dungeon);
  s.eyeCare=Object.assign({},DEFAULTS.eyeCare,s.eyeCare||{});
  s.eyeCare.playMinutes=clampInt(s.eyeCare.playMinutes,1,180,30);
  s.eyeCare.restMinutes=clampInt(s.eyeCare.restMinutes,1,120,10);
  return s
}
function save(s){
  s=s&&typeof s==="object"?s:ensure();s.version=3;s.dungeon=migrateLegacyDungeon(s.dungeon);
  s.eyeCare=Object.assign({},DEFAULTS.eyeCare,s.eyeCare||{});
  s.eyeCare.playMinutes=clampInt(s.eyeCare.playMinutes,1,180,30);
  s.eyeCare.restMinutes=clampInt(s.eyeCare.restMinutes,1,120,10);
  return saveJSON(SETTINGS_KEY,s)
}
function eyeCareSettings(){const e=ensure().eyeCare;return {playMinutes:e.playMinutes,restMinutes:e.restMinutes}}
function resetEyeTimer(){try{localStorage.removeItem(EYE_TIMER_KEY)}catch{}}
function hasPin(){return !!localStorage.getItem(PIN_KEY)}
function randomHex(n=16){const a=new Uint8Array(n);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function digest(text){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function validPin(pin){return /^\d{4,8}$/.test(String(pin||""))}
async function setPin(pin){pin=String(pin||"");if(!validPin(pin))throw new Error("PINは4〜8桁の数字にしてください。");const salt=randomHex();saveJSON(PIN_KEY,{salt,hash:await digest(salt+":"+pin)});return true}
async function verifyPin(pin){const p=readJSON(PIN_KEY,null);if(!p?.salt||!p?.hash)return false;return (await digest(p.salt+":"+String(pin||"")))===p.hash}
function grantAdminSession(minutes=60){try{sessionStorage.setItem(AUTH_KEY,String(Date.now()+Math.max(1,Number(minutes)||60)*60000));return true}catch{return false}}
function revokeAdminSession(){try{sessionStorage.removeItem(AUTH_KEY)}catch{}}
function isAdminAuthenticated(){try{const until=Number(sessionStorage.getItem(AUTH_KEY)||0);if(until>Date.now())return true;if(until)sessionStorage.removeItem(AUTH_KEY)}catch{}return false}
function setTemporaryUnlock(minutes=30){localStorage.setItem(UNLOCK_KEY,String(Date.now()+Math.max(1,Number(minutes)||30)*60000))}
function temporaryUnlockUntil(){return Number(localStorage.getItem(UNLOCK_KEY)||0)}
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function nthMonday(y,m,n){const first=new Date(y,m-1,1,12),shift=(8-first.getDay())%7;return 1+shift+7*(n-1)}
function vernal(y){return Math.floor(20.8431+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function autumnal(y){return Math.floor(23.2488+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function holidaySet(y){
 const set=new Set(),add=(m,d)=>set.add(`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
 add(1,1);add(1,nthMonday(y,1,2));add(2,11);if(y>=2020)add(2,23);add(3,vernal(y));add(4,29);add(5,3);add(5,4);add(5,5);add(7,nthMonday(y,7,3));if(y>=2016)add(8,11);add(9,nthMonday(y,9,3));add(9,autumnal(y));add(10,nthMonday(y,10,2));add(11,3);add(11,23);
 for(let m=0;m<12;m++)for(let d=2;d<=30;d++){const cur=new Date(y,m,d,12);if(cur.getMonth()!==m)continue;const k=dateKey(cur);if(set.has(k))continue;const p=new Date(cur);p.setDate(p.getDate()-1);const n=new Date(cur);n.setDate(n.getDate()+1);if(set.has(dateKey(p))&&set.has(dateKey(n))&&cur.getDay()!==0)set.add(k)}
 const originals=[...set];for(const k of originals){const [yy,mm,dd]=k.split("-").map(Number),d=new Date(yy,mm-1,dd,12);if(d.getDay()!==0)continue;let x=new Date(d);do{x.setDate(x.getDate()+1)}while(set.has(dateKey(x)));if(x.getFullYear()===y)set.add(dateKey(x))}
 return set
}
function isHoliday(date=new Date()){return holidaySet(date.getFullYear()).has(dateKey(date))}
function scheduleForDate(date=new Date(),settings=null){
 const c=(settings?.dungeon||settings||ensure().dungeon),holiday=isHoliday(date);
 if(holiday&&c.holiday?.enabled!==false){const r=normalizeRule(c.holiday,{open:"00:00",close:"23:59"});return {...r,holiday:true,source:"holiday",day:date.getDay()}}
 const r=normalizeRule(c.weekly?.[date.getDay()]??c.weekly?.[String(date.getDay())],DAY_RULES[date.getDay()]);return {...r,holiday,source:"weekday",day:date.getDay()}
}
function allowedByRule(now,rule){
 const n=now.getHours()*60+now.getMinutes(),a=minOf(rule.open),b=minOf(rule.close);
 if(a===b)return true;
 return a<b?(n>=a&&n<b):(n>=a||n<b)
}
function nextAllowedDate(now,c){
 const start=new Date(now);
 for(let offset=0;offset<=8;offset++){
  const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+offset,0,0,0,0),r=scheduleForDate(d,c),a=minOf(r.open),b=minOf(r.close);
  const intervals=a===b?[[0,1440]]:a<b?[[a,b]]:[[0,b],[a,1440]];
  for(const [lo,hi] of intervals){if(hi<=lo)continue;const cand=new Date(d);cand.setMinutes(lo,0,0);if(cand>now)return cand}
 }
 return null
}
function nextAllowedLabel(c,now=new Date()){
 const d=nextAllowedDate(now,c);if(!d)return "";
 const hm=`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
 const today=dateKey(d)===dateKey(now),tom=new Date(now);tom.setDate(tom.getDate()+1);
 if(today)return `今日${hm}から遊べます`;
 if(dateKey(d)===dateKey(tom))return `明日${hm}から遊べます`;
 return `${d.getMonth()+1}/${d.getDate()} ${hm}から遊べます`
}
function check(app,now=new Date()){
 if(app!=="dungeon")return {blocked:false};
 const until=temporaryUnlockUntil();if(until>Date.now())return {blocked:false,temporary:true,unlockUntil:until};
 const s=ensure(),c=s.dungeon;if(!c.enabled)return {blocked:false};
 const rule=scheduleForDate(now,c),blocked=!allowedByRule(now,rule);
 if(!blocked)return {blocked:false,...rule};
 return {blocked:true,...rule,nextLabel:nextAllowedLabel(c,now)}
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderBlockedPage({app="dungeon"}={}){
 const r=check(app),root=document.body;root.innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;padding:22px;background:linear-gradient(180deg,#10283a,#184b67);font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Yu Gothic',sans-serif"><section style="width:min(520px,100%);background:#fff;border-radius:22px;padding:22px;box-shadow:0 18px 46px #0005;color:#193343;text-align:center"><div style="font-size:54px">🔒</div><h1 style="font-size:23px;margin:8px 0">今はダンジョンで遊べません</h1><p style="font-size:13px;line-height:1.7;color:#617887">設定された利用時間外です。<br>${escapeHtml(r.nextLabel||"")}</p><a href="expedition.html" style="display:block;text-decoration:none;margin-top:14px;padding:13px;border-radius:13px;background:#1682ae;color:#fff;font-weight:900">🧭 おでかけ探索へ</a><details style="margin-top:16px;text-align:left"><summary style="cursor:pointer;font-size:12px;font-weight:900;color:#506a79">管理者の一時解除</summary><div style="margin-top:10px"><input id="parentPin" type="password" inputmode="numeric" placeholder="管理者PIN" style="width:100%;padding:12px;border:1px solid #bdccd5;border-radius:10px;font:inherit"><button id="parentUnlock" style="width:100%;margin-top:8px;padding:11px;border:0;border-radius:10px;background:#657784;color:#fff;font-weight:900">30分だけ解除</button><div id="parentMsg" style="font-size:11px;color:#a44242;margin-top:7px"></div></div></details></section></main>`;
 const b=document.getElementById("parentUnlock");if(b)b.onclick=async()=>{const pin=document.getElementById("parentPin").value,msg=document.getElementById("parentMsg");if(await verifyPin(pin)){setTemporaryUnlock(30);grantAdminSession(30);location.reload()}else msg.textContent="PINが違います。"}
}
window.FRENDA_PARENTAL=Object.freeze({VERSION,ensure,save,eyeCareSettings,resetEyeTimer,hasPin,setPin,verifyPin,check,isHoliday,holidaySet,scheduleForDate,setTemporaryUnlock,grantAdminSession,revokeAdminSession,isAdminAuthenticated,renderBlockedPage});
})();
