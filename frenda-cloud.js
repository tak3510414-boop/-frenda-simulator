(()=>{
"use strict";

const CLOUD_VERSION="1.3";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";

let client=null;
let session=null;
let cfg=null;
let syncTimer=null;
let syncing=false;
let applying=false;
let lastUploaded="";
let authUnsub=null;
let button=null;
let modal=null;
let statusText="未ログイン";
let storagePatched=false;
let initialized=false;

const META_KEYS=new Set(["format_version","simulator_version","dungeon_version","appVersion","saveVersion","exported_at","master_version","sync_updated_at"]);
function comparableValue(v){
  if(Array.isArray(v))return v.map(comparableValue);
  if(v&&typeof v==="object"){
    const o={};
    for(const k of Object.keys(v).sort()){
      if(META_KEYS.has(k))continue;
      o[k]=comparableValue(v[k]);
    }
    return o;
  }
  return v;
}
function safeJSON(v){try{return JSON.stringify(comparableValue(v))}catch{return ""}}
function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function reloadGuardKey(){return `frendaCloudReloadGuard:${cfg?.app||"app"}:${session?.user?.id||"anon"}`}
function clearReloadGuard(){try{sessionStorage.removeItem(reloadGuardKey())}catch{}}
function setReloadGuard(sig){try{sessionStorage.setItem(reloadGuardKey(),sig)}catch{}}
function getReloadGuard(){try{return sessionStorage.getItem(reloadGuardKey())||""}catch{return ""}}

function setStatus(text,kind=""){
  statusText=text;
  // Background sync is intentionally quiet. The header button shows only the
  // stable account state so auto-save/pull does not flicker between messages.
  if(button){
    if(session){
      button.textContent="☁️ ログイン中";
      button.dataset.kind=kind==="error"?"error":"";
      button.title=kind==="error"?text:"クラウド同期はバックグラウンドで自動実行中";
    }else{
      button.textContent="☁️ 未ログイン";
      button.dataset.kind=kind==="error"?"error":"";
      button.title=kind==="error"?text:"クリックしてログイン";
    }
  }
  const s=modal?.querySelector("#frendaCloudStatus");
  if(s)s.textContent=text;
}
function injectStyles(){
  if(document.getElementById("frendaCloudStyles"))return;
  const st=document.createElement("style");st.id="frendaCloudStyles";st.textContent=`
  .frendaCloudBtn{background:#eaf4ff!important;color:#17384d!important;border:1px solid #b9d7eb!important;border-radius:999px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;box-shadow:none!important}
  .frendaCloudBtn[data-kind="error"]{background:#fff0f0!important;color:#9a2e2e!important;border-color:#e9b8b8!important}
  .frendaCloudBtn[data-kind="syncing"]{background:#fff8dd!important;color:#6f5700!important;border-color:#e5d48a!important}
  .frendaCloudOverlay{position:fixed;inset:0;z-index:3000;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}
  .frendaCloudPanel{width:min(430px,100%);background:#fff;color:#17202a;border-radius:18px;padding:16px;box-shadow:0 20px 70px #0007;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
  .frendaCloudHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.frendaCloudHead b{font-size:18px}.frendaCloudClose{background:#edf2f7!important;color:#243747!important;padding:8px 10px!important}
  .frendaCloudPanel label{display:block;font-size:12px;font-weight:800;margin:9px 0 4px}.frendaCloudPanel input{width:100%;padding:11px;border:1px solid #c8d2d9;border-radius:10px;font:inherit;background:#fff;color:#17202a}
  .frendaCloudActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.frendaCloudActions button{width:100%;padding:10px!important;border-radius:10px!important}.frendaCloudActions .wide{grid-column:1/-1}.frendaCloudPrimary{background:#1769e0!important;color:#fff!important}.frendaCloudSecondary{background:#edf2f7!important;color:#243747!important}.frendaCloudDanger{background:#a33!important;color:#fff!important}
  .frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#f4f7f9;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}
  `;document.head.appendChild(st)
}
function injectButton(){
  if(button)return;
  injectStyles();
  button=document.createElement("button");button.type="button";button.className="frendaCloudBtn";button.textContent="☁️ アカウント";button.title="アカウント状態を確認中";button.onclick=openModal;
  const host=document.querySelector(".headerBtns")||document.querySelector("header")||document.body;
  host.appendChild(button);
}
function closeModal(){modal?.remove();modal=null}
function openModal(){
  closeModal();
  modal=document.createElement("div");modal.className="frendaCloudOverlay";
  const email=session?.user?.email||"";
  modal.innerHTML=session?`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>☁️ クラウド同期</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudUser">${escapeHTML(email)}</div>
      <div class="frendaCloudInfo">${escapeHTML(cfg?.label||"アプリ")}のデータをSupabaseと同期します。通常は端末内へ即保存し、少し後にクラウドへ自動保存します。<br><small>Cloud v${CLOUD_VERSION}</small></div>
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions">
        <button type="button" id="frendaCloudPush" class="frendaCloudPrimary">この端末を保存</button>
        <button type="button" id="frendaCloudPull" class="frendaCloudSecondary">クラウドから読込</button>
        <button type="button" id="frendaCloudLogout" class="frendaCloudDanger wide">ログアウト</button>
      </div>
    </div>`:`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>☁️ クラウド同期</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudInfo">同じアカウントでログインすると、スマホ・PC間で${escapeHTML(cfg?.label||"アプリ")}のデータを引き継げます。<br><small>Cloud v${CLOUD_VERSION}</small></div>
      <label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username">
      <label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password">
      <div id="frendaCloudStatus" class="frendaCloudStatus">未ログイン</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudLogin" class="frendaCloudPrimary wide">ログイン</button></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
  modal.querySelector(".frendaCloudClose").onclick=closeModal;
  if(session){
    modal.querySelector("#frendaCloudPush").onclick=()=>pushNow(true);
    modal.querySelector("#frendaCloudPull").onclick=()=>pullNow(true);
    modal.querySelector("#frendaCloudLogout").onclick=logout;
  }else{
    modal.querySelector("#frendaCloudLogin").onclick=async()=>{
      const email=modal.querySelector("#frendaCloudEmail").value.trim(),password=modal.querySelector("#frendaCloudPassword").value;
      if(!email||!password){setStatus("メールアドレスとパスワードを入力してください。","error");return}
      await login(email,password);
    };
  }
}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function columnName(){return cfg?.column||"simulator_data"}
function syncStampKey(){return `frenda:cloud:updatedAt:${cfg?.app||"app"}`}
function readLocalSyncTime(){try{return Number(localStorage.getItem(syncStampKey())||0)||0}catch{return 0}}
function writeLocalSyncTime(ts=Date.now()){const n=Math.max(0,Number(ts)||0);try{localStorage.setItem(syncStampKey(),String(n))}catch{}return n}
function syncTimeOf(data){
  const direct=Number(data?.sync_updated_at||0);if(direct>0)return direct;
  // Legacy fallback: expeditionShared already had updatedAt before Cloud v1.3.
  const nested=Number(data?.state?.updatedAt||data?.state?.expeditionShared?.updatedAt||data?.updatedAt||0);
  return nested>0?nested:0;
}
function withSyncMeta(data){
  if(!data||typeof data!=="object"||Array.isArray(data))return data;
  return Object.assign({},data,{sync_updated_at:readLocalSyncTime()});
}
function localData(){return withSyncMeta(cfg.getData())}
function patchStorage(){
  if(storagePatched)return;storagePatched=true;
  const p=Storage.prototype,origSet=p.setItem,origRemove=p.removeItem,origClear=p.clear;
  const touch=()=>{try{origSet.call(localStorage,syncStampKey(),String(Date.now()))}catch{}};
  p.setItem=function(k,v){origSet.call(this,k,v);if(this===localStorage&&!applying&&cfg?.watchStorage?.(String(k))){touch();scheduleSync()}};
  p.removeItem=function(k){origRemove.call(this,k);if(this===localStorage&&!applying&&cfg?.watchStorage?.(String(k))){touch();scheduleSync()}};
  p.clear=function(){origClear.call(this);if(this===localStorage&&!applying){touch();scheduleSync()}};
}
async function login(email,password){
  if(!client)return;
  setStatus("ログイン中…","syncing");
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error){setStatus("ログイン失敗："+error.message,"error");return}
  session=data.session;setStatus("ログインしました","syncing");closeModal();await pullOrSeed();
}
async function logout(){
  if(!client)return;clearReloadGuard();await client.auth.signOut();session=null;lastUploaded="";setStatus("未ログイン");closeModal()
}
async function rowForUser(){
  if(!session)return {data:null,error:new Error("not signed in")};
  return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle();
}
async function uploadLocal(local,localStr){
  if(syncTimeOf(local)<=0){writeLocalSyncTime(Date.now());local=localData();localStr=safeJSON(local)}
  const payload={user_id:session.user.id,[columnName()]:local,updated_at:new Date().toISOString()};
  const {error}=await client.from(TABLE).upsert(payload,{onConflict:"user_id"});if(error)throw error;
  lastUploaded=localStr;clearReloadGuard();setStatus("同期済み");
}
function applyCloudAndReload(cloud,cloudStr,cloudTs){
  const sig=hashString(cloudStr);setReloadGuard(sig);
  applying=true;
  return Promise.resolve(cfg.applyData(cloud)).finally(()=>{
    applying=false;writeLocalSyncTime(cloudTs>0?cloudTs:Date.now());
    lastUploaded=cloudStr;setStatus("クラウドから読み込みました");
    setTimeout(()=>location.reload(),180);
  });
}
async function pullOrSeed(){
  if(!session||syncing)return;
  syncing=true;setStatus("同期確認中…","syncing");
  try{
    const {data,error}=await rowForUser();if(error)throw error;
    let local=localData(),localStr=safeJSON(local),localTs=syncTimeOf(local);
    if(!data){await uploadLocal(local,localStr);return}
    const cloud=data[columnName()];
    if(cloud===null||typeof cloud==="undefined"){await uploadLocal(local,localStr);return}
    const cloudStr=safeJSON(cloud),cloudTs=syncTimeOf(cloud);

    if(cloudStr!==localStr){
      const sig=hashString(cloudStr);
      if(getReloadGuard()===sig){
        // The same cloud payload was just applied. If app-side migration changed it,
        // the migrated local data becomes the new source of truth.
        writeLocalSyncTime(Math.max(Date.now(),localTs+1,cloudTs+1));
        local=localData();localStr=safeJSON(local);
        await uploadLocal(local,localStr);return;
      }
      if(localTs>0||cloudTs>0){
        if(localTs>cloudTs){await uploadLocal(local,localStr);return}
        if(cloudTs>localTs){await applyCloudAndReload(cloud,cloudStr,cloudTs);return}
        // Same timestamp but different contents: keep legacy cloud-first behavior.
      }
      await applyCloudAndReload(cloud,cloudStr,cloudTs);return;
    }

    // Same contents: converge the sync timestamp without changing gameplay data.
    if(localTs<=0&&cloudTs<=0){
      writeLocalSyncTime(Date.now());local=localData();localStr=safeJSON(local);
      await uploadLocal(local,localStr);return;
    }
    if(localTs>cloudTs){await uploadLocal(local,localStr);return}
    if(cloudTs>localTs)writeLocalSyncTime(cloudTs);
    lastUploaded=cloudStr;clearReloadGuard();setStatus("同期済み");
  }catch(e){console.error("FrendaCloud pull/seed",e);setStatus("同期エラー","error")}
  finally{syncing=false}
}
async function pullNow(force=false){
  if(!session||syncing)return;syncing=true;setStatus("クラウド読込中…","syncing");
  try{
    const {data,error}=await rowForUser();if(error)throw error;
    const cloud=data?.[columnName()];
    if(cloud===null||typeof cloud==="undefined"){setStatus("クラウドにデータがありません","error");return}
    const cloudStr=safeJSON(cloud),localStr=safeJSON(localData()),cloudTs=syncTimeOf(cloud);
    if(cloudStr===localStr){lastUploaded=cloudStr;clearReloadGuard();setStatus("同期済み");return}
    closeModal();await applyCloudAndReload(cloud,cloudStr,cloudTs)
  }catch(e){console.error("FrendaCloud pull",e);setStatus("読込エラー","error")}
  finally{syncing=false}
}
async function pushNow(showResult=false){
  if(!session||syncing||applying)return;
  if(showResult)writeLocalSyncTime(Date.now());
  const local=localData(),s=safeJSON(local);if(!s)return;
  if(!showResult&&s===lastUploaded)return;
  syncing=true;setStatus("クラウド保存中…","syncing");
  try{await uploadLocal(local,s)}
  catch(e){console.error("FrendaCloud push",e);setStatus("保存エラー","error")}
  finally{syncing=false}
}
function scheduleSync(delay=1400){
  if(!session||applying)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushNow(false),delay)
}
async function init(options){
  cfg=options||{};injectButton();patchStorage();
  if(!window.supabase?.createClient){setStatus("クラウド未接続","error");return}
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  if(authUnsub){try{authUnsub.unsubscribe()}catch{}}
  const {data,error}=await client.auth.getSession();if(error){setStatus("認証確認エラー","error");return}
  session=data.session||null;
  const listener=client.auth.onAuthStateChange((event,newSession)=>{
    const oldUserId=session?.user?.id||null,newUserId=newSession?.user?.id||null;
    session=newSession||null;
    if(!session){lastUploaded="";clearReloadGuard();setStatus("未ログイン");return}
    // TOKEN_REFRESHED / INITIAL_SESSION / タブ復帰などでは再読込しない。
    // 新規ログイン・ユーザー切替時だけ同期確認する。
    if(initialized&&event==="SIGNED_IN"&&newUserId!==oldUserId&&!syncing){setStatus("同期確認中…","syncing");setTimeout(()=>pullOrSeed(),0)}
  });
  authUnsub=listener?.data?.subscription||null;
  initialized=true;
  if(session)await pullOrSeed();else setStatus("未ログイン")
}

window.FrendaCloud={version:CLOUD_VERSION,init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session,localSyncTime:readLocalSyncTime};
})();
// Updated: 2026-09-27 18:12:38 JST / Cloud Ver1.3
